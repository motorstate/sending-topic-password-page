const params = new URLSearchParams(window.location.search);

const topic = params.get("topic");
let currentLang = params.get("lang") || "ru";
let token = params.get("token");

const translations = {
ru: {
title: "На указанный адрес электронной почты будет выслан пароль для выбранной вами темы на форуме",
subtitle: "Ваш адрес электронной почты будет подписан на рекламную рассылку MotorState",
email_placeholder: "Введите ваш email",
button: "Получить пароль",
sending: "Отправка...",
success: "Пароль отправлен на вашу почту",
incorrect_email_error: "Неправильный адрес электронной почты!",
null_password_error: "Информация по теме в обновлении. Мы направим вам письмо как только закончим с обновлением!",
email_sending_error: "Во время отправки письма произошла ошибка. Мы направим вам письмо как только всё наладим!",
connection_error: "Ошибка соединения с сервером",
topic_missing: "Ошибка: тема не указана"
},

en: {
title: "A password for the selected forum topic will be sent to the specified email address",
subtitle: "Your email address will be subscribed to MotorState promotional emails",
email_placeholder: "Enter your email",
button: "Get password",
sending: "Sending...",
success: "Password sent to your email",
incorrect_email_error: "Incorrect email address!",
null_password_error: "Information on this topic is being updated. We’ll send you an email as soon as the update is complete!",
email_sending_error: "An error occurred while sending the email. We’ll send it to you as soon as we’ve solved the problem!",
connection_error: "Server connection error",
topic_missing: "Error: topic not specified"
}
};

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

function getMessageKey(messageKey, lang, fallback){
    if(!messageKey) return fallback;
    if(translations[lang] && translations[lang][messageKey]){
        return translations[lang][messageKey];
    }
    return fallback;
}


document.getElementById("emailForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const messageBox = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitButton");
    const email = emailInput.value;
    messageBox.innerText = "";


    if(!topic){
        messageBox.style.color = "red";
        messageBox.innerText = translations[currentLang].topic_missing;
        return;
    }

/* Блокируем кнопку */

    submitButton.disabled = true;
    submitButton.innerText = translations[currentLang].sending;


/* URL webhook n8n */

    const webhookUrl = "https://n8.motorstate.com.ua/webhook/get-password"; //https://motorstate.app.n8n.cloud/webhook-test/get-password


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
            messageBox.innerText = getMessageKey(
                data.message,
                currentLang,
                translations[currentLang].success
            );
            
        }else{
            messageBox.style.color = "red";
            messageBox.innerText = getMessageKey(
                data.message,
                currentLang,
                translations[currentLang].error
            );
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
