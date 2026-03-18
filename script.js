/* -------------------------------- */
/* Получаем параметры URL */
/* -------------------------------- */

const params = new URLSearchParams(window.location.search);

const topic = params.get("topic");
let currentLang = params.get("lang") || "ru";
let token = params.get("token");


/* -------------------------------- */
/* Словарь переводов */
/* -------------------------------- */

const translations = {

ru: {

title: "На указанный адрес электронной почты будет выслан пароль для выбранной вами темы на форуме",

subtitle: "Ваш адрес электронной почты будет подписан на рекламную рассылку MotorState",

email_placeholder: "Введите ваш email",

button: "Получить пароль",

sending: "Отправка...",

success: "Пароль отправлен на вашу почту. Возможно письмо в папке Спам",

error: "Неверный адрес электронной почты",

connection_error: "Ошибка соединения с сервером",

topic_missing: "Ошибка: тема не указана"

},

en: {

title: "A password for the selected forum topic will be sent to the specified email address",

subtitle: "Your email address will be subscribed to MotorState promotional emails",

email_placeholder: "Enter your email",

button: "Get password",

sending: "Sending...",

success: "Password sent to your email. The email may be in your Spam folder",

error: "Incorrect email address",

connection_error: "Server connection error",

topic_missing: "Error: topic not specified"

}

};


/* -------------------------------- */
/* Применение перевода */
/* -------------------------------- */

function applyTranslations(){

document.querySelectorAll("[data-i18n]").forEach(el => {

const key = el.dataset.i18n;

if(translations[currentLang][key]){
el.textContent = translations[currentLang][key];
}

});

document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {

const key = el.dataset.i18nPlaceholder;

if(translations[currentLang][key]){
el.placeholder = translations[currentLang][key];
}

});

}


/* -------------------------------- */
/* Отправка формы */
/* -------------------------------- */

document.getElementById("emailForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const emailInput = document.getElementById("email");
    const messageBox = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitButton");

    const email = emailInput.value;

    messageBox.innerText = "";

/* Проверка topic */

    if(!topic){

        messageBox.style.color = "red";
        messageBox.innerText = translations[currentLang].topic_missing;

        return;
    }

/* Блокируем кнопку */

    submitButton.disabled = true;
    submitButton.innerText = translations[currentLang].sending;


/* URL webhook n8n */

    const webhookUrl = "https://motorstate.app.n8n.cloud/webhook/get-password"; //https://motorstate.app.n8n.cloud/webhook-test/get-password


    try{

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers:{
                "Authorization": token,
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
            topic: topic,
            email: email,
            lang: currentLang
            })
        });

        const data = await response.json();

/* Обработка ответа */

        if(data.success){

            messageBox.style.color = "green";

            if(typeof data.message === "object"){
                messageBox.innerText = data.message[currentLang];
            }else{
                messageBox.innerText = data.message || translations[currentLang].success;
            }

        }else{

            messageBox.style.color = "red";

            if(typeof data.message === "object"){
                messageBox.innerText = data.message[currentLang];
            }else{
                messageBox.innerText = data.message || translations[currentLang].error;
            }
        }

    }catch(error){

        messageBox.style.color = "red";
        messageBox.innerText = translations[currentLang].connection_error;
    }

/* Разблокируем кнопку */

    submitButton.disabled = false;
    submitButton.innerText = translations[currentLang].button;
});


/* -------------------------------- */
/* Инициализация страницы */
/* -------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

applyTranslations();

});
