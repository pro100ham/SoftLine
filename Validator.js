//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />
/// <reference path="livevalidation_standalone.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

var validations;

softline.Form_onsave =function (eContext) {
    if (!validations) addValidations();
    var valid = LiveValidation.massValidate(validations);
    if (!valid) {
        eContext.getEventArgs().preventDefault();
    }
}


softline.validator = function () {
    validations = [];
    var temp_v;
    var requiredPhoneFormat = 'Номер телефона не соответствует формату : "+380XXXXXXXXX"';
    var intPhoneMinLen = 12;
    if (Xrm.Page.getAttribute('mobilephone') != null) {
        temp_v = new LiveValidation("mobilephone", { filterRegex: /[\d\(\)\+]/ });
        temp_v.add(Validate.Format, { pattern: /^\+?([3,8,0]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/, failureMessage: requiredPhoneFormat });
        temp_v.add(Validate.Length, { minimum: intPhoneMinLen, tooShortMessage: "Телефон должен содержать " + intPhoneMinLen.toString() + " символов" });
        validations.push(temp_v);
    }
    if (Xrm.Page.getAttribute('fax') != null) {
        temp_v = new LiveValidation("fax", { filterRegex: /[\d\(\)\+]/ });
        temp_v.add(Validate.Format, { pattern: /^\+?([3,8,0]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/, failureMessage: requiredPhoneFormat });
        temp_v.add(Validate.Length, { minimum: intPhoneMinLen, tooShortMessage: "Телефон должен содержать " + intPhoneMinLen.toString() + " символов" });
        validations.push(temp_v);
    }
    if (Xrm.Page.getAttribute('telephone1') != null) {
        temp_v = new LiveValidation("telephone1", { filterRegex: /[\d\(\)\+]/ });
        temp_v.add(Validate.Format, { pattern: /^\+?([3,8,0]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/, failureMessage: requiredPhoneFormat });
        temp_v.add(Validate.Length, { minimum: intPhoneMinLen, tooShortMessage: "Телефон должен содержать " + intPhoneMinLen.toString() + " символов" });
        validations.push(temp_v);
    }
    if (Xrm.Page.getAttribute('emailaddress1') != null) {
        temp_v = new LiveValidation('emailaddress1', { filterRegex: /[^\s]/ });
        temp_v.add(Validate.Format, { pattern: /^([A-Za-z0-9_а-яА-ЯёЁ\-\.]+)@((\[([0-9]{1,3}\.){3}[0-9]{1,3}\])|(([A-Za-z0-9_а-яА-ЯёЁ\-]+\.)+)([a-zA-Zа-яА-ЯёЁ]{2,}))$/, failureMessage: "Введенный E-mail имеет некорректный формат. Не допускается наличие пробелов. Пример правильного Email: anything@anything.anything" });
        validations.push(temp_v);
    }
}