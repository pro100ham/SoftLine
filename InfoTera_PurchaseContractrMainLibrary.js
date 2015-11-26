//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setExchangerate();
}

softline.setExchangerate = function () {
    //Учет текущего курса валюты при создании записи
    if (Xrm.Page.data.entity.getId() != "") {
        var date = Xrm.Page.getAttribute('createdon').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                      "<entity name='new_currency_rate'>" +
                        "<attribute name='createdon' />" +
                        "<attribute name='new_rub' />" +
                        "<attribute name='new_euro' />" +
                        "<attribute name='new_usdollar' />" +
                        "<attribute name='new_currency_rateid' />" +
                        "<order attribute='createdon' descending='true' />" +
                            "<filter type='and'>" +
                              "<condition attribute='createdon' operator='on-or-before' value='" + date.format("yyyy-MM-dd") + "' />" +
                            "</filter>" +
                      "</entity>" +
                    "</fetch>";
        var currency = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currency.length == 0) return;
        if (Xrm.Page.getAttribute('new_usd_rate') && currency[0].attributes.new_usdollar != null) {
            SetFieldValue('new_usd_rate', currency[0].attributes.new_usdollar.value);
        }
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