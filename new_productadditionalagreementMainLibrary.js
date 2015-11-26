//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.summFunction();
    softline.disabledFild();
    
    Xrm.Page.getAttribute('new_product').addOnChange(softline.disabledFild);
    Xrm.Page.getAttribute('new_productdescription').addOnChange(softline.disabledFild);
    Xrm.Page.getAttribute('new_price').addOnChange(softline.summFunction);
    Xrm.Page.getAttribute('new_amount').addOnChange(softline.summFunction);
    Xrm.Page.getAttribute('new_kursdate').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_viborkurs').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(softline.setExchangerate);
}

softline.setExchangerate = function () {
    //Учет текущего курса валюты
    if (Xrm.Page.getAttribute('new_kursdate').getValue() != null) {
        var date = Xrm.Page.getAttribute('new_kursdate').getValue();
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
                    //"<condition attribute='statecode' operator='eq' value='0' />" +
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

softline.summFunction = function () {
    if (Xrm.Page.getAttribute('new_price').getValue() &&
        Xrm.Page.getAttribute('new_amount').getValue()) {
        var price = Xrm.Page.getAttribute('new_price').getValue();
        var amount = Xrm.Page.getAttribute('new_amount').getValue();
        var cost = price * amount;
        SetFieldValue('new_cost',cost);
    }
}

softline.disabledFild = function () {
    if (Xrm.Page.getAttribute('new_product').getValue() != null
        && Xrm.Page.getAttribute('new_productdescription').getValue() == null ) {
        Xrm.Page.ui.controls.get('new_productdescription').setDisabled(true);
        Xrm.Page.ui.controls.get('new_product').setDisabled(false);
        Xrm.Page.getAttribute('new_isproductoverridden').setValue(false)
    }
    else if (Xrm.Page.getAttribute('new_product').getValue() == null
        && Xrm.Page.getAttribute('new_productdescription').getValue() != null) {
        Xrm.Page.ui.controls.get('new_productdescription').setDisabled(false);
        Xrm.Page.ui.controls.get('new_product').setDisabled(true);
        Xrm.Page.getAttribute('new_isproductoverridden').setValue(true)
    }
    else if (Xrm.Page.getAttribute('new_product').getValue() == null
            && Xrm.Page.getAttribute('new_productdescription').getValue() == null) {
        Xrm.Page.ui.controls.get('new_productdescription').setDisabled(false);
        Xrm.Page.ui.controls.get('new_product').setDisabled(false);
        Xrm.Page.getAttribute('new_isproductoverridden').setValue(null)
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