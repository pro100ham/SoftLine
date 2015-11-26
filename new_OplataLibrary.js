function OnLoad() {
    SetProcentOfSumm();

    Xrm.Page.getAttribute('new_sum_all').addOnChange(SetProcentOfSumm);
    Xrm.Page.getAttribute('new_summa').addOnChange(SetProcentOfSumm);
    Xrm.Page.getAttribute('new_exchangerate').addOnChange(SetProcentOfSumm);
    Xrm.Page.getAttribute('new_sum_all').addOnChange(SetMarja);
    Xrm.Page.getAttribute('new_summa').addOnChange(SetMarja);

    Xrm.Page.getAttribute('new_margin').addOnChange(SetMarja);
    Xrm.Page.getAttribute('new_data_oplati').addOnChange(setExchangerate);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(setExchangerate);
    SetMarja();
    SetProcentOfSumm();
}

function setExchangerate() {
    //Учет текущего курса валюты 
    if (Xrm.Page.getAttribute('new_data_oplati').getValue()) {
        var date = Xrm.Page.getAttribute('new_data_oplati').getValue();
        var currencyId = Xrm.Page.getAttribute('transactioncurrencyid').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                    "<entity name='sl_exchangerate'>" +
                    "<attribute name='sl_exchangerateid' />" +
                    "<attribute name='new_national_currency' />" +
                    "<attribute name='createdon' />" +
                    "<order attribute='sl_transactioncurrencyid' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='createdon' operator='on' value='" + date.yyyymmdd() + "' />" +
                    "<condition attribute='sl_transactioncurrencyid' operator='eq' value='" + currencyId[0].id + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";
        var currencyOnDate = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currencyOnDate.length == 0 || currencyOnDate[0].attributes.new_national_currency == null) return;

        SetFieldValue('new_exchangerate', currencyOnDate[0].attributes.new_national_currency.value);
    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

function SetMarja() {
    if (Xrm.Page.getAttribute('new_dogovorid').getValue() != null) {
        var dogovor = Xrm.Page.getAttribute('new_dogovorid').getValue()[0];
        var proc = Xrm.Page.getAttribute('new_discount_predoplatu').getValue();

        retrieveRecord(dogovor.id, 'SalesOrderSet', function (data) {
            if (data.new_summausd) {
                Xrm.Page.getAttribute("new_summa_usd").setValue(data.new_summausd);
            }
            if (proc == null) {
                Xrm.Page.getAttribute('new_margin').setValue(data.new_marginid);
            }
            else {
                proc = proc / 100;
                Xrm.Page.getAttribute('new_margin').setValue(data.new_marginid * proc);
            }
        }, null, true, null);
    }
}

function SetProcentOfSumm() {
    if (Xrm.Page.getAttribute('new_course').getValue() != null) {
        var flag = Xrm.Page.getAttribute('new_course').getValue();

        if (flag == 100000001 &&
            Xrm.Page.getAttribute('new_summa').getValue() &&
            Xrm.Page.getAttribute('new_exchangerate').getValue()) {
            SetFieldValue('new_summausd', Xrm.Page.getAttribute('new_summa').getValue() / Xrm.Page.getAttribute('new_exchangerate').getValue());
            var all = Xrm.Page.getAttribute('new_sum_all').getValue();
            var summ = Xrm.Page.getAttribute('new_summa').getValue();
            var proc = Xrm.Page.getAttribute('new_discount_predoplatu').getValue();
            if (all != null && summ != null && summ != 0 && all != 0) {
                var res = (summ / all) * 100;
                SetFieldValue('new_discount_predoplatu', res);
            }
        }
        else if (flag == 100000000 &&
                Xrm.Page.getAttribute('new_summa').getValue() &&
                Xrm.Page.getAttribute('new_exchangerate').getValue()) {
                SetFieldValue('new_summausd', Xrm.Page.getAttribute('new_summa').getValue() / Xrm.Page.getAttribute('new_exchangerate').getValue());
                if (Xrm.Page.getAttribute('new_summa_usd').getValue()) {
                    SetFieldValue('new_discount_predoplatu', (Xrm.Page.getAttribute('new_summausd').getValue() / Xrm.Page.getAttribute('new_summa_usd').getValue()) * 100);
                }
            }
        else {
            var all = Xrm.Page.getAttribute('new_sum_all').getValue();
            var summ = Xrm.Page.getAttribute('new_summa').getValue();
            var proc = Xrm.Page.getAttribute('new_discount_predoplatu').getValue();
            if (all != null && summ != null && summ != 0 && all != 0) {
                var res = (summ / all) * 100;
                SetFieldValue('new_discount_predoplatu', res);
            }
        }
    }
}

function SetManatCurrancy() {
    if (GetFieldValue("transactioncurrencyid") == null || Xrm.Page.ui.getFormType() == 1) {
        var filter = "?$filter=CurrencyName eq 'manat'";
        retrieveMultiple("TransactionCurrencySet", filter, function (data) {
            if (data && data.length > 0) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data[0].TransactionCurrencyId;
                lookupItem.typename = "transactioncurrency";
                lookupItem.name = data[0].CurrencyName;
                lookupData[0] = lookupItem;
                SetFieldValue("transactioncurrencyid", lookupData);
            }
        }, null, false);
    }
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

function CheckStatusCode(context) {
    if (Xrm.Page.getAttribute('statuscode').getValue() == 100000001) {
        alert("Выберите поле Признак оплаты!");
        var saveEvent = context.getEventArgs();
        saveEvent.preventDefault();
    }
    if (Xrm.Page.getAttribute('ownerid').getValue()) {
        var owner = Xrm.Page.getAttribute('ownerid').getValue()[0].name;
        if (owner == "Sabina Kadirova" || owner == "Yulduz Tokhtieva") {
            alert("Пожалуйста проверьте информацию об Ответственном лице");
            var saveEvent = context.getEventArgs();
            saveEvent.preventDefault();
        }
    }
}