//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.checkTransact();
    softline.setVisibleTransact();
    softline.setZacupFromCuss();

    Xrm.Page.getAttribute('new_dateofpayment').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_viborkurs').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(softline.setVisibleTransact);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_oplataeuro').addOnChange(softline.setZacupFromCuss);
    Xrm.Page.getAttribute('new_oplatausd').addOnChange(softline.setZacupFromCuss);
    Xrm.Page.getAttribute('new_oplatauah').addOnChange(softline.setZacupFromCuss);
    Xrm.Page.getAttribute('new_oplatarub').addOnChange(softline.setZacupFromCuss);
}

softline.setZacupFromCuss = function () {
    if (Xrm.Page.getAttribute('new_exchangerates').getValue() != null){
        var curs = Xrm.Page.getAttribute('new_exchangerates').getValue();

        if (Xrm.Page.ui.controls.get('new_oplataeuro').getVisible() == true){
            var oplata = Xrm.Page.getAttribute('new_oplataeuro').getValue()
            SetFieldValue('new_summausd', oplata / curs);
            return;
        }
        if (Xrm.Page.ui.controls.get('new_oplatausd').getVisible() == true){
            var oplata = Xrm.Page.getAttribute('new_oplatausd').getValue();
            SetFieldValue('new_summausd', oplata / curs);
            return;
        }
        if (Xrm.Page.ui.controls.get('new_oplatauah').getVisible() == true){
            var oplata = Xrm.Page.getAttribute('new_oplatauah').getValue();
            SetFieldValue('new_summausd', oplata / curs);
            return;
        }
        if (Xrm.Page.ui.controls.get('new_oplatarub').getVisible() == true) {
            var oplata = Xrm.Page.getAttribute('new_oplatarub').getValue();
            SetFieldValue('new_summausd', oplata / curs);
            return;
        }
    }
}

softline.setExchangerate = function () {
    //Учет текущего курса валюты при создании записи КП
    if (Xrm.Page.getAttribute('new_dateofpayment').getValue()) {
        var date = Xrm.Page.getAttribute('new_dateofpayment').getValue();
        var currencyId = Xrm.Page.getAttribute('transactioncurrencyid').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                    "<entity name='new_exchangerates'>" +
                    "<attribute name='new_exchangeratesid' />" +
                    "<attribute name='new_name' />" +
                    "<attribute name='new_megbank' />" +
                    "<attribute name='new_nbu' />" +
                    "<attribute name='createdon' />" +
                    "<order attribute='new_name' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='createdon' operator='on' value='" + date.yyyymmdd() + "' />" +
                    "<condition attribute='transactioncurrencyid' operator='eq' value='" + currencyId[0].id + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";
        var currencyOnDate = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currencyOnDate.length == 0) return;
        if (Xrm.Page.getAttribute('new_viborkurs') &&
        Xrm.Page.getAttribute('new_viborkurs').getValue() != null) {
            var status = Xrm.Page.getAttribute('new_viborkurs').getValue();
            if (status == 100000001) {
                SetFieldValue('new_exchangerates', currencyOnDate[0].attributes.new_megbank.value);
            }
            else if (status == 100000000) {
                SetFieldValue('new_exchangerates', currencyOnDate[0].attributes.new_nbu.value);
            }
            else {
                SetFieldValue('new_exchangerates', 0);
            }
        }
    }
}

softline.setVisibleTransact = function () {
    if (Xrm.Page.getAttribute('transactioncurrencyid').getValue() != null) {
        switch (Xrm.Page.getAttribute('transactioncurrencyid').getValue()[0].id) {
            case "{5A6C7788-3160-E411-80D6-0050568263E6}":
                Xrm.Page.ui.controls.get('new_oplatausd').setVisible(true);
                Xrm.Page.ui.controls.get('new_oplataeuro').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatarub').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatauah').setVisible(false);
                break;
            case "{543D9E71-07E5-E411-80DC-0050568263E6}":
                Xrm.Page.ui.controls.get('new_oplatausd').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplataeuro').setVisible(true);
                Xrm.Page.ui.controls.get('new_oplatarub').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatauah').setVisible(false);
                break;
            case "{D5921D47-07E5-E411-80DC-0050568263E6}":
                Xrm.Page.ui.controls.get('new_oplatausd').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplataeuro').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatarub').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatauah').setVisible(true);
                break;
            case "{2834E4FF-CB23-E511-80DC-0050568263E6}":
                Xrm.Page.ui.controls.get('new_oplatausd').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplataeuro').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatarub').setVisible(true);
                Xrm.Page.ui.controls.get('new_oplatauah').setVisible(false);
                break;
            default:
                Xrm.Page.ui.controls.get('new_oplatausd').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplataeuro').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatarub').setVisible(false);
                Xrm.Page.ui.controls.get('new_oplatauah').setVisible(false);
                break;
        }
    }
}

softline.checkTransact = function () {
    if (Xrm.Page.getAttribute('new_provider').getValue() != null &&
        Xrm.Page.data.entity.getId() == '') {
        var accountId = Xrm.Page.getAttribute('new_provider').getValue()[0].id;
        XrmServiceToolkit.Rest.Retrieve(accountId,
            'AccountSet',
            'new_usd,new_uah,new_euro,new_rub',
                            null,
                function (data) {
                    var obj = {};
                    obj.entityType = "transactioncurrency";
                    obj.id = '';
                    var field = '';
                    if (data.new_usd) {
                        obj.id += "{5A6C7788-3160-E411-80D6-0050568263E6}";
                        obj.name = 'US Dollar';
                    }
                    if (data.new_uah) {
                        obj.id += "{D5921D47-07E5-E411-80DC-0050568263E6}";
                        obj.name = 'гривня';
                    }
                    if (data.new_euro) {
                        obj.id += "{543D9E71-07E5-E411-80DC-0050568263E6}";
                        obj.name = 'EURO';
                    }
                    if (data.new_rub) {
                        obj.id += "{2834E4FF-CB23-E511-80DC-0050568263E6}";
                        obj.name = 'рубль';
                    }

                    if (obj.id.length > 38) {
                        alert('Для Поставщика указано несколько Валют для расчета. Выберете необходимую');
                        Xrm.Page.getAttribute('transactioncurrencyid').setValue(null);
                        softline.setVisibleTransact();
                        return;
                    }
                    Xrm.Page.getAttribute('transactioncurrencyid').setValue([obj]);
                },
                function (error) {
                    console.log("in error handler");
                    console.log(error.message);
                }, true);
    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}