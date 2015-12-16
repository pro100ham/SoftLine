//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    //softline.setMarginFromConstanta();
    //softline.setRecommendedPrice();
    //softline.setExchangerate();
    //softline.setRecommendedPriceDoll();

    Xrm.Page.getAttribute('new_max_purchase_price_nikolaev').addOnChange(softline.setRecommendedPrice);
    Xrm.Page.getAttribute('new_purchase_margin').addOnChange(softline.setRecommendedPrice);
    Xrm.Page.getAttribute('new_max_purchase_price_odessa').addOnChange(softline.setRecommendedPrice);
    Xrm.Page.getAttribute('new_purchase_margin').addOnChange(softline.setRecommendedPrice);
    Xrm.Page.getAttribute('new_dollar_rate').addOnChange(softline.setRecommendedPriceDoll);
    Xrm.Page.getAttribute('new_recom_purchase_price_odessa').addOnChange(softline.setRecommendedPriceDoll);
    Xrm.Page.getAttribute('new_recom_purchase_price_nikolaev').addOnChange(softline.setRecommendedPriceDoll);
    Xrm.Page.getAttribute("new_approve").addOnChange(softline.setDateAprove);
}

softline.setDateAprove = function () {
    if (Xrm.Page.getAttribute("new_approve").getValue() == true) {
        Xrm.Page.getAttribute("new_aprove_date").setValue(new Date());
    }
    else {
        Xrm.Page.getAttribute("new_aprove_date").setValue(null);
    }
}

softline.openDialog = function () {
    var objectCode = '10019';
    var url = '/_controls/lookup/lookupmulti.aspx?objecttypes=' + objectCode;
    var DialogOptions = new Xrm.DialogOptions();
    DialogOptions.width = 500;
    DialogOptions.height = 500;
    Xrm.Internal.openDialog(Mscrm.CrmUri.create(url).toString(), DialogOptions, null, null, softline.CallbackFunction);
}

softline.CallbackFunction = function (returnValue) {
    if (returnValue.items.length == 1) {
        switch (returnValue.items[0].name) {
            case 'Одеса':
                var crop = Xrm.Page.getAttribute('new_cropid').getValue();
                //var newEntity = new XrmServiceToolkit.Soap.BusinessEntity("new_purchase_order");
                var price = Xrm.Page.getAttribute('new_recom_purchase_price_odessa').getValue();
                var entity = {};
                entity.new_purchase_price = { Value: price.toString() };
                entity.new_cropid = { Id: crop[0].id, LogicalName: crop[0].entityType };
                entity.new_portid = { Id: returnValue.items[0].id, LogicalName: returnValue.items[0].typename };
                XrmServiceToolkit.Rest.Create(entity, "new_purchase_orderSet", function (result) {
                    Xrm.Utility.openEntityForm("new_purchase_order", result.new_purchase_orderId);
                },
                    function (error) { console.log(error.message); }, false);
                break;
            case 'Миколаїв':
                var crop = Xrm.Page.getAttribute('new_cropid').getValue();
                //var newEntity = new XrmServiceToolkit.Soap.BusinessEntity("new_purchase_order");
                var price = Xrm.Page.getAttribute('new_recom_purchase_price_nikolaev').getValue();
                var entity = {};
                entity.new_purchase_price = { Value: price.toString() };
                entity.new_cropid = { Id: crop[0].id, LogicalName: crop[0].entityType };
                entity.new_portid = { Id: returnValue.items[0].id, LogicalName: returnValue.items[0].typename };

                XrmServiceToolkit.Rest.Create(entity, "new_purchase_orderSet", function (result) {
                    Xrm.Utility.openEntityForm("new_purchase_order", result.new_purchase_orderId);
                },
                    function (error) { console.log(error.message); }, false);
                break;
        }
    }
    else if (returnValue.items.length == 2) {
        for (var i = 0; i < returnValue.items.length; i++) {
            var crop = Xrm.Page.getAttribute('new_cropid').getValue();
            //var newEntity = new XrmServiceToolkit.Soap.BusinessEntity("new_purchase_order");
            if (returnValue.items[i].name == 'Миколаїв') {
                var price = Xrm.Page.getAttribute('new_recom_purchase_price_nikolaev').getValue();
            }
            else if (returnValue.items[i].name == 'Одеса') {
                var price = Xrm.Page.getAttribute('new_recom_purchase_price_odessa').getValue();
            }
            var entity = {};
            entity.new_purchase_price = { Value: price.toString() };
            entity.new_cropid = { Id: crop[0].id, LogicalName: crop[0].entityType };
            entity.new_portid = { Id: returnValue.items[i].id, LogicalName: returnValue.items[i].typename };

            XrmServiceToolkit.Rest.Create(entity, "new_purchase_orderSet", function (result) {
                //Xrm.Utility.openEntityForm("new_purchase_order", result.new_purchase_orderId);
                var reletivePath = "/userdefined/edit.aspx?etc=10022";
                reletivePath = reletivePath + "&id=";
 
                var windowName = "_blank";
                var serverUrl = Xrm.Page.context.getClientUrl();
                if (serverUrl != null && serverUrl != "" && result.new_purchase_orderId.replace("{", "").replace("}", "") != null){
                    serverUrl = serverUrl + reletivePath;
                    serverUrl = serverUrl + result.new_purchase_orderId.replace("{", "").replace("}", "");
                    window.open(serverUrl);
                }
            },
                function (error) { console.log(error.message); }, false);
        }
    }
}

softline.setMarginFromConstanta = function () {
    XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '', function (data) {
        if (data.length != 0) {
            if (Xrm.Page.getAttribute('new_purchase_margin').getValue() == null &&
                data[0].new_purchase_margin != null) {
                SetFieldValue('new_purchase_margin', data[0].new_purchase_margin.Value);
            }
            if (Xrm.Page.getAttribute('new_sales_margin').getValue() == null&&
                data[0].new_sales_margin != null) {
                SetFieldValue('new_sales_margin', data[0].new_sales_margin.Value);
            }
        }
    },
                     function (error) {
                         alert(error.message);
                     },
                     function onComplete() {
                     }, false
                 );
}

softline.setRecommendedPrice = function () {
    if (Xrm.Page.getAttribute('new_max_purchase_price_nikolaev').getValue() != null &&
        Xrm.Page.getAttribute('new_purchase_margin').getValue() != null) {
        SetFieldValue('new_recom_purchase_price_nikolaev', Xrm.Page.getAttribute('new_max_purchase_price_nikolaev').getValue() - Xrm.Page.getAttribute('new_purchase_margin').getValue());
        softline.setRecommendedPriceDoll();
    }
    if (Xrm.Page.getAttribute('new_max_purchase_price_odessa').getValue() != null &&
        Xrm.Page.getAttribute('new_purchase_margin').getValue() != null) {
        SetFieldValue('new_recom_purchase_price_odessa', Xrm.Page.getAttribute('new_max_purchase_price_odessa').getValue() - Xrm.Page.getAttribute('new_purchase_margin').getValue());
        softline.setRecommendedPriceDoll();
    }
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
        if (Xrm.Page.getAttribute('new_dollar_rate') && currency[0].attributes.new_usdollar != null) {
            SetFieldValue('new_dollar_rate', currency[0].attributes.new_usdollar.value);
        }
    }
}

softline.setRecommendedPriceDoll = function () {
    if (Xrm.Page.getAttribute('new_dollar_rate').getValue() != null) {
        if (Xrm.Page.getAttribute('new_recom_purchase_price_odessa').getValue() != null) {
            SetFieldValue('new_dollar_purchase_price_odessa', Xrm.Page.getAttribute('new_recom_purchase_price_odessa').getValue() / Xrm.Page.getAttribute('new_dollar_rate').getValue());
        }
        if (Xrm.Page.getAttribute('new_recom_purchase_price_nikolaev').getValue() != null) {
            SetFieldValue('new_dollar_purchase_price_nikolaev', Xrm.Page.getAttribute('new_recom_purchase_price_nikolaev').getValue() / Xrm.Page.getAttribute('new_dollar_rate').getValue());
        }
    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};
