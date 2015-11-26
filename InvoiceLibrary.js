//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {

    softline.setDuringDayFromCreate();
    softline.setDuringDayFromShipment();
    softline.setVisibleTab();
    softline.setTransactionCurrency();
    softline.setMarzaFromSalesOrder();
    softline.sumZacup();
    softline.checkMarja();
    softline.setTotalamount();
    softline.setLookup();

    Xrm.Page.getAttribute("new_dateinvoice").addOnChange(softline.setDuringDayFromCreate);
    Xrm.Page.getAttribute("new_shipmentdate").addOnChange(softline.setDuringDayFromShipment);
    Xrm.Page.getAttribute("paymenttermscode").addOnChange(softline.setVisibleTab);
    Xrm.Page.getAttribute("new_paymentperioddays").addOnChange(softline.durationDays);
    Xrm.Page.getAttribute("new_shipmentdate").addOnChange(softline.durationDays);
    Xrm.Page.getAttribute("paymenttermscode").addOnChange(softline.durationDays);
    Xrm.Page.getAttribute("totalamount").addOnChange(softline.checkMarja);
    Xrm.Page.getAttribute("new_summausd").addOnChange(softline.checkMarja);
}

softline.setLookup = function () {
    retrieveMultiple("new_constantSet", null, function (data) {
        if (data[0].new_Logist.Id != null && Xrm.Page.getAttribute('new_logist').getValue() == null)
            Xrm.Page.getAttribute('new_logist').setValue([{ id: data[0].new_Logist.Id, entityType: data[0].new_Logist.LogicalName, name: data[0].new_Logist.Name }]);
        if (data[0].new_lawyer.Id != null && Xrm.Page.getAttribute('new_lawyer').getValue() == null)
            Xrm.Page.getAttribute('new_lawyer').setValue([{ id: data[0].new_lawyer.Id, entityType: data[0].new_lawyer.LogicalName, name: data[0].new_lawyer.Name }]);
        if (data[0].new_financier.Id != null && Xrm.Page.getAttribute('new_cso').getValue() == null)
            Xrm.Page.getAttribute('new_cso').setValue([{ id: data[0].new_financier.Id, entityType: data[0].new_financier.LogicalName, name: data[0].new_financier.Name }]);
    }, null, true);
}

softline.checkMarja = function () {
    if (Xrm.Page.getAttribute('totalamount').getValue() != null && Xrm.Page.getAttribute('totalamount').getValue() != 0 &&
    Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() != null && Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() != 0) {
        var marja = Xrm.Page.getAttribute('totalamount').getValue() - Xrm.Page.getAttribute('new_totalamountofpurchases').getValue();
        var procent = Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() / Xrm.Page.getAttribute('totalamount').getValue();
        SetFieldValue("new_margin", marja);
        SetFieldValue("new_morginpercentage", parseFloat((1-procent) * 100));
    }
    if (Xrm.Page.getAttribute('new_summausd').getValue() != null && Xrm.Page.getAttribute('new_summausd').getValue() != 0 &&
    Xrm.Page.getAttribute('new_usd').getValue() != null && Xrm.Page.getAttribute('new_usd').getValue() != 0) {
        var marjaUSD = Xrm.Page.getAttribute('new_summausd').getValue() - Xrm.Page.getAttribute('new_usd').getValue();
        SetFieldValue("new_marginusd", marjaUSD);
    }
}

softline.sumZacup = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var invoicedetails = retrieveDetails(Xrm.Page.data.entity.getId());
        SetFieldValue("new_totalamountofpurchases", sumObjectValues("new_amountpurchase", invoicedetails));
        SetFieldValue("new_usd", sumObjectValues("new_totalpurchaseusd", invoicedetails));
        SetFieldValue("totaltax", sumObjectValues("tax", invoicedetails));
        SetFieldValue("new_summausd", sumObjectValues("new_sellingusd", invoicedetails));
    }
}

softline.setTotalamount = function () {
    //freightamount - Стоимость поставки
    //totallineitemamount - Стоимость составляющих
    if (Xrm.Page.getAttribute("totallineitemamount") != null &&
        Xrm.Page.getAttribute("freightamount") != null) {
        var totallineitemamount = Xrm.Page.getAttribute("totallineitemamount").getValue();
        var freightamount = Xrm.Page.getAttribute("freightamount").getValue();
        SetFieldValue("new_totalamount", totallineitemamount + freightamount);
    }
    else {
        SetFieldValue("new_totalamount",0);
    }
}

softline.setMarzaFromSalesOrder = function () {
    if (Xrm.Page.data.entity.getId() == "" &&
        Xrm.Page.getAttribute("salesorderid").getValue() != null &&
        (Xrm.Page.getAttribute("new_margin").getValue() == null || Xrm.Page.getAttribute("new_morginpercentage").getValue() == null)) {
        var order = Xrm.Page.getAttribute("salesorderid").getValue();
        XrmServiceToolkit.Rest.Retrieve(order[0].id,
            'SalesOrderSet',
            'new_marginuah,new_morginpercentage',
                            null,
                function (marja) {
                    Xrm.Page.getAttribute('new_margin').setValue(marja.new_marginuah);
                    Xrm.Page.getAttribute('new_morginpercentage').setValue(marja.new_morginpercentage);
                },
                function (error) {
                    console.log("in error handler");
                    console.log(error.message);
                }, true);
    }
    else if (Xrm.Page.getAttribute("new_margin").getValue() == null || Xrm.Page.getAttribute("new_morginpercentage").getValue() == null) {
        Xrm.Page.getAttribute('new_margin').setValue(0);
        Xrm.Page.getAttribute('new_morginpercentage').setValue(0.00);
    }
}

softline.setTransactionCurrency = function () {
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "гривня", entityType: "transactioncurrency" }]);
        Xrm.Page.getAttribute('pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
    }
}

softline.ButtonOplata = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var parameters = {};
        parameters["ownerid"] = Xrm.Page.getAttribute("ownerid").getValue()[0].id;
        parameters["owneridname"] = Xrm.Page.getAttribute("ownerid").getValue()[0].name;
        parameters["owneridtype"] = Xrm.Page.getAttribute("ownerid").getValue()[0].entityType;
        parameters["new_customer"] = Xrm.Page.getAttribute("customerid").getValue()[0].id;
        parameters["new_customername"] = Xrm.Page.getAttribute("customerid").getValue()[0].name;
        parameters["new_opportunity"] = Xrm.Page.getAttribute("opportunityid").getValue()[0].id;
        parameters["new_opportunityname"] = Xrm.Page.getAttribute("opportunityid").getValue()[0].name;
        parameters["new_expense"] = Xrm.Page.data.entity.getId();
        parameters["new_expensename"] = Xrm.Page.getAttribute("name").getValue();
        parameters["transactioncurrencyid"] = Xrm.Page.getAttribute("transactioncurrencyid").getValue()[0].id;
        parameters["transactioncurrencyidname"] = Xrm.Page.getAttribute("transactioncurrencyid").getValue()[0].name;

        Xrm.Utility.openEntityForm("new_payment", null, parameters);
    }
}

softline.setDuringDayFromCreate = function () {
    //Скрипт Заполнение поля «Количество дней с момента выставления счета».  new_daysfrominvoice
    if (Xrm.Page.getAttribute("new_dateinvoice").getValue()) {
        var invoiseDate = Xrm.Page.getAttribute("new_dateinvoice").getValue();
        durationDay = durationDates(new Date(), invoiseDate);
        SetFieldValue('new_daysfrominvoice', durationDay);
    }
}

softline.setDuringDayFromShipment = function () {
    //Скрипт Заполнение поля «Количество дней с момента отгрузки товара». new_dateofshipment
    if (Xrm.Page.getAttribute("new_shipmentdate").getValue()) {
        var shipmentDate = Xrm.Page.getAttribute("new_shipmentdate").getValue();
        durationDay = durationDates(new Date(), shipmentDate);
        SetFieldValue('new_dateofshipment', durationDay);
    }
}

softline.setVisibleTab = function () {
    //Скрипт: Отображение вкладки «КИЗ», когда признак paymenttermscode = Постоплата - 34 или Рассрочка - 35
    var statusPayment = Xrm.Page.getAttribute('paymenttermscode').getValue() != null ? Xrm.Page.getAttribute('paymenttermscode').getValue() : null;
    if (statusPayment == 34 || statusPayment == 35) {
        Xrm.Page.ui.tabs.get('tab_3').setVisible(true);
        Xrm.Page.getAttribute('new_paymentperioddays').setRequiredLevel('required');
        Xrm.Page.getAttribute('new_estimatedshippingdate').setRequiredLevel('required');
        Xrm.Page.getAttribute('new_dateofpayment').setRequiredLevel('required');
    }
    else {
        Xrm.Page.ui.tabs.get('tab_3').setVisible(false);
        Xrm.Page.getAttribute('new_paymentperioddays').setRequiredLevel('none');
        Xrm.Page.getAttribute('new_estimatedshippingdate').setRequiredLevel('none');
        Xrm.Page.getAttribute('new_dateofpayment').setRequiredLevel('none');
    }
}

softline.checkSummInvoice = function (context) {
    //Просчет маржи/маржи % на invoice////////////////////////////////////////////
    if (Xrm.Page.getAttribute('totalamount').getValue() != null && Xrm.Page.getAttribute('totalamount').getValue() != 0 &&
        Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() != null && Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() != 0) {
        var marja = Xrm.Page.getAttribute('totalamount').getValue() - Xrm.Page.getAttribute('new_totalamountofpurchases').getValue();
        var procent = Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() / Xrm.Page.getAttribute('totalamount').getValue();
        SetFieldValue("new_margin", marja);
        SetFieldValue("new_morginpercentage", parseFloat((1 - procent) * 100));
    }
    //Проверка суммы счета и выдача предупреждения о превышении допустимой суммы счета. Бокировка сохранения счета
    //paymenttermscode = '35' - Расстрочка
    //paymenttermscode = '33' - Предоплата
    //paymenttermscode = '34' - Постоплата
    if (Xrm.Page.getAttribute('totalamount').getValue() != null && Xrm.Page.getAttribute('paymenttermscode').getValue() != '33'
        && Xrm.Page.getAttribute('paymenttermscode').getValue() != null) {
        var payStatus = Xrm.Page.getAttribute('paymenttermscode').getValue();
        var summInvoice = Xrm.Page.getAttribute('totalamount').getValue();

        var queryOptions = {
            entityName: "new_constant",
            attributes: ["new_name"],
            values: ['Константа'],
            columnSet: ["new_invoiceprepayment",
                "new_invoicepostpay"],
            orderby: ["createdon"]
        };
        var constanta = XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);

        if (payStatus == '35' && summInvoice > constanta[0].attributes["new_invoiceprepayment"].value) {
            if (Xrm.Page.getAttribute('salesorderid').getValue() == null &&
                Xrm.Page.getAttribute('new_supplementaryagreement').getValue() == null) {
                alert("Превышениe допустимой суммы счета и создайте Договор");
                var saveEvent = context.getEventArgs();
                saveEvent.preventDefault();
                return;
            }
            else if (Xrm.Page.getAttribute('salesorderid').getValue() != null ||
                Xrm.Page.getAttribute('new_supplementaryagreement').getValue() != null) {
                return;
            }
            alert("Превышениe допустимой суммы счета");
            var saveEvent = context.getEventArgs();
            saveEvent.preventDefault();
            return;
        }
        else if (payStatus == '34' && summInvoice > constanta[0].attributes["new_invoicepostpay"].value) {
            if (Xrm.Page.getAttribute('salesorderid').getValue() == null && 
                Xrm.Page.getAttribute('new_supplementaryagreement').getValue() == null) {
                alert("Превышениe допустимой суммы счета и создайте Договор");
                var saveEvent = context.getEventArgs();
                saveEvent.preventDefault();
                return;
            }
        }
    }
}

softline.durationDays = function () {
    //Расчет даты постоплаты
    if (Xrm.Page.getAttribute('paymenttermscode').getValue() == '34'
        && Xrm.Page.getAttribute('new_shipmentdate').getValue() != null
        && Xrm.Page.getAttribute('new_paymentperioddays').getValue() != null) {
        var shipmentdate = Xrm.Page.getAttribute('new_shipmentdate').getValue();
        var paymentperioddays = Xrm.Page.getAttribute('new_paymentperioddays').getValue();
        SetFieldValue("new_expecteddatepayment", shipmentdate.setDate(shipmentdate.getDate() + paymentperioddays));

    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

function durationDates(valueFrom, valueTo) {
    //1000 - секунд
    //60 - минут
    //60 - часов 
    //24 - дней 
    return parseInt((valueFrom - valueTo) / 1000 / 60 / 60 / 24);
}

var retrieveDetails = function (invoiceid) {
    var queryOptions = {
        entityName: "invoicedetail",
        attributes: ["invoiceid"],
        values: [invoiceid],
        columnSet: ["baseamount",
            "new_amountpurchase",
            "new_totalpurchaseusd",
            "tax",
            "new_sellingusd"],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};

var sumObjectValues = function (key, obj) {
    ///<summary>
    /// Method for Sum attributes 
    ///</summary>
    ///</param>
    ///<param name="key" type="String">
    /// Name attribute
    ///</param>
    ///<param name="obj" type="Object">
    /// Oblect XrmServiceToolkit.Soap.QueryByAttribute
    ///</param>
    var sumValue = 0;
    for (var i = 0; i < obj.length; i++) {
        sumValue += obj[i].attributes[key] != null ? obj[i].attributes[key].value : 0;
    }
    return sumValue;
};

