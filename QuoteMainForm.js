//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setMarga();
    softline.setTransactionCurrency();
    softline.setExchangerate();
    softline.sumZacup();
    softline.checkMarja();
    softline.HideButton;

    Xrm.Page.getAttribute('customerid').addOnChange(softline.setNomer);
    Xrm.Page.getAttribute('new_dateputting').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute("new_usdusd").addOnChange(softline.checkMarja);
    Xrm.Page.getAttribute("new_summausd").addOnChange(softline.checkMarja);
    Xrm.Page.getAttribute("new_contract").addOnChange(softline.HideButton);
}

softline.HideButton = function () {
    if (Xrm.Page.getAttribute('new_contract') &&
        Xrm.Page.getAttribute('new_contract').getValue() == 100000001) {
        top.document.getElementById("quote|NoRelationship|Form|new.quote.Button1.Button").style.display = 'none';
    }
    else {
        top.document.getElementById("quote|NoRelationship|Form|new.quote.Button1.Button").style.display = 'inline-block';
    }
}
top.document.getElementById("quote|NoRelationship|Form|new.quote.Button1.Button").style.display = 'none';
softline.checkMarja = function () {
    if (Xrm.Page.getAttribute('new_usdusd') != null &&
        Xrm.Page.getAttribute('new_summausd') != null) {
        var marja = Xrm.Page.getAttribute('new_summausd').getValue() - Xrm.Page.getAttribute('new_usdusd').getValue();
        //var procent = Xrm.Page.getAttribute('new_totalamountofpurchases').getValue() / Xrm.Page.getAttribute('totalamount').getValue();
        SetFieldValue("new_margin", marja);
        //SetFieldValue("new_morginpercentage", parseFloat((1 - procent) * 100));
    }
}

softline.sumZacup = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var details = retrieveQuotedetails(Xrm.Page.data.entity.getId());
        SetFieldValue("new_totalamountofpurchases", sumObjectValues("new_totalpurchaseuah", details));
        SetFieldValue("new_usdusd", sumObjectValues("new_totalpurchaseusd", details));
        //SetFieldValue("totaltax", sumObjectValues("tax", details));
        SetFieldValue("new_summausd", sumObjectValues("new_sellingusd", details));
    }
}

softline.setExchangerate = function () {
    //Учет текущего курса валюты при создании записи КП
    if (Xrm.Page.getAttribute('new_dateputting').getValue()) {
        var date = Xrm.Page.getAttribute('new_dateputting').getValue();
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

        SetFieldValue('new_courseinterbank', currencyOnDate[0].attributes.new_megbank.value);
        SetFieldValue('new_exchangerate', currencyOnDate[0].attributes.new_nbu.value);
    }
}

softline.ButtonCreateSalesOrder = function () {

    if (Xrm.Page.data.entity.getId() != "") {

        var salesorder = new XrmServiceToolkit.Soap.BusinessEntity("salesorder");

        var customerID = Xrm.Page.data.entity.attributes.get("customerid").getValue()[0].id;
        var quoteId = Xrm.Page.data.entity.getId();
        var quotedetails = retrieveQuotedetails(quoteId);
        salesorder.attributes["opportunityid"] = {
            id: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].entityType,
            type: "EntityReference"
        };
        salesorder.attributes["customerid"] = {
            id: customerID,
            logicalName: 'account',
            type: "EntityReference"
        };
        salesorder.attributes["pricelevelid"] = {
            id: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].entityType,
            type: "EntityReference"
        };
        salesorder.attributes["transactioncurrencyid"] = {
            id: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].entityType,
            type: "EntityReference"
        };
        //transactioncurrencyid
        salesorder.attributes["quoteid"] = { id: quoteId, logicalName: 'quote', type: "EntityReference" };

        try {
            var salesorderId = XrmServiceToolkit.Soap.Create(salesorder);
            if (quotedetails && quotedetails.length > 0) {
                for (var i = 0; i < quotedetails.length; i++) {
                    createSaleOrderDetail(salesorderId, quotedetails[i]);
                }
            }
            Xrm.Utility.openEntityForm("salesorder", salesorderId);
            try {
                XrmServiceToolkit.Soap.SetState("quote", quoteId, 1, 2);
            }
            catch (e) {
                return;
            }
        } catch (ex) {
            alert(ex.message);
        }
    }
    else {
        alert("КП не сохранено. Сохраните КП!");
    }
}

softline.setNomer = function () {
    if (Xrm.Page.getAttribute('ownerid').getValue() != null && Xrm.Page.getAttribute('customerid').getValue() != null) {
        var owner = Xrm.Page.getAttribute('ownerid').getValue();
        var acc = Xrm.Page.getAttribute('customerid').getValue();

        if (Xrm.Page.getAttribute('customerid').getValue()[0].entityType == "contact") return;

        today = new Date();
        var dateString = today.format("yyyy.MM.dd");
        var nameString = "Sp_" + dateString + "_";

        retrieveRecord(owner[0].id, "SystemUserSet", function (data) {
            if (data && data.new_abbreviation != null) {
                nameString += data.new_abbreviation + "_";
                retrieveRecord(acc[0].id, "AccountSet", function (data) {
                    if (data && data.new_dipolarname != null) {
                        nameString += data.new_dipolarname;
                        Xrm.Page.getAttribute('name').setValue(nameString);
                    }
                }, null, false);
            }
        }, null, false);
    }
}

softline.setMarga = function () {
    //Расчет маржи и маржи % на форме КП
    var quoteId = Xrm.Page.data.entity.getId();
    var quotedetails = retrieveQuotedetails(quoteId);
    var summPrice, baseprice = 0;
    var porcentPrice, price = 0.00;

    if (quotedetails && quotedetails.length > 0) {
        for (var i = 0; i < quotedetails.length; i++) {
            price += quotedetails[i].attributes["new_totalpurchaseuah"] != null ?
                quotedetails[i].attributes["new_totalpurchaseuah"].value : 0;
            baseprice += quotedetails[i].attributes["baseamount"] != null ?
                quotedetails[i].attributes["baseamount"].value : 0;
        }
        summPrice = baseprice - price;
        porcentPrice = 1 - (price / baseprice);
        SetFieldValue("new_marginusd", summPrice);
        SetFieldValue("new_morginpercentage", porcentPrice * 100);
    }
}

softline.buttonSupplementaryagreement = function () {
    if (Xrm.Page.data.entity.getId() != "" &&
        Xrm.Page.data.entity.attributes.get("new_contract").getValue() == 100000001) {

        var agreement = new XrmServiceToolkit.Soap.BusinessEntity("new_supplementaryagreement");
        var details = retrieveQuotedetails(Xrm.Page.data.entity.getId());

        if (Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()) {
            agreement.attributes["transactioncurrencyid"] = {
                id: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        if (Xrm.Page.data.entity.attributes.get("ownerid").getValue()) {
            agreement.attributes["ownerid"] = {
                id: Xrm.Page.data.entity.attributes.get("ownerid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("ownerid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        agreement.attributes["new_klient"] = {
            id: Xrm.Page.data.entity.attributes.get("customerid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("customerid").getValue()[0].entityType,
            type: "EntityReference"
        };
        if (Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()) {
            agreement.attributes["new_pricelevelid"] = {
                id: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        if (Xrm.Page.data.entity.attributes.get("opportunityid").getValue()) {
            agreement.attributes["new_opportunity"] = {
                id: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }

        try {
            var agreementId = XrmServiceToolkit.Soap.Create(agreement);
            if (details && details.length > 0) {
                for (var i = 0; i < details.length; i++) {
                    createAgreementDetail(agreementId, details[i]);
                }
            }
            Xrm.Utility.openEntityForm("new_supplementaryagreement", agreementId);
        } catch (ex) {
            alert(ex.message);
        }
    }
}

softline.setTransactionCurrency = function () {
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "гривня", entityType: "transactioncurrency" }]);
        Xrm.Page.getAttribute('pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
    }
}

var createSaleOrderDetail = function (salesorderId, quotedetail) {
    var salesorderdetail = new XrmServiceToolkit.Soap.BusinessEntity("salesorderdetail");
    salesorderdetail.attributes["salesorderid"] = { id: salesorderId, logicalName: "salesorder", type: "EntityReference" };
    setAttribute(salesorderdetail, "isproductoverridden", quotedetail.attributes["isproductoverridden"]);

    if (quotedetail.attributes["productid"]) {
        setAttribute(salesorderdetail, "productid", quotedetail.attributes["productid"]);
        setAttribute(salesorderdetail, "uomid", quotedetail.attributes["uomid"]);
    }

    if (quotedetail.attributes["productdescription"]) {
        setAttribute(salesorderdetail, "productdescription", quotedetail.attributes["productdescription"]);
    }
    if (quotedetail.attributes["new_exchangerates"]) {
        setAttribute(salesorderdetail, "new_exchangerates", quotedetail.attributes["new_exchangerates"]);
    }
    setAttribute(salesorderdetail, "ispriceoverridden", true);
    setAttribute(salesorderdetail, "transactioncurrencyid", quotedetail.attributes["transactioncurrencyid"]);
    setAttribute(salesorderdetail, "priceperunit", quotedetail.attributes["priceperunit"]);
    setAttribute(salesorderdetail, "tax", quotedetail.attributes["tax"]);
    setAttribute(salesorderdetail, "quantity", quotedetail.attributes["quantity"]);
    setAttribute(salesorderdetail, "extendedamount", quotedetail.attributes["extendedamount"]);
    setAttribute(salesorderdetail, "new_totalpurchaseuah", quotedetail.attributes["new_totalpurchaseuah"]);
    setAttribute(salesorderdetail, "new_priceprocurementuah", quotedetail.attributes["new_priceprocurementuah"]);
    setAttribute(salesorderdetail, "new_pricepurchaseusd", quotedetail.attributes["new_pricepurchaseusd"]);
    setAttribute(salesorderdetail, "new_totalpurchaseusd", quotedetail.attributes["new_totalpurchaseusd"]);

    setAttribute(salesorderdetail, "new_kursdate", quotedetail.attributes["new_kursdate"]);
    setAttribute(salesorderdetail, "new_viborkurs", quotedetail.attributes["new_viborkurs"]);
    setAttribute(salesorderdetail, "new_exchangerates", quotedetail.attributes["new_exchangerates"]);
    setAttribute(salesorderdetail, "new_kursspeka", quotedetail.attributes["new_kursspeka"]);

    if (quotedetail.attributes["salesrepid"]) {
        setAttribute(salesorderdetail, "salesrepid", quotedetail.attributes["salesrepid"]);
    }

    XrmServiceToolkit.Soap.Create(salesorderdetail);
};

var createAgreementDetail = function (Id, detail) {
    var agreementdetail = new XrmServiceToolkit.Soap.BusinessEntity("new_productadditionalagreement");
    setAttribute(agreementdetail, "new_isproductoverridden", detail.attributes["isproductoverridden"])
    agreementdetail.attributes["new_supplementaryagreemenid"] = { id: Id, logicalName: "new_supplementaryagreement", type: "EntityReference" };
    setAttribute(agreementdetail, "new_productdescription", detail.attributes["productdescription"]);
    if (detail.attributes["productid"]) {
        setAttribute(agreementdetail, "new_product", detail.attributes["productid"]);
    }
    setAttribute(agreementdetail, "transactioncurrencyid", detail.attributes["transactioncurrencyid"]);
    setAttribute(agreementdetail, "new_uomid", detail.attributes["uomid"]);
    setAttribute(agreementdetail, "new_price", detail.attributes["priceperunit"]);
    var a = detail.attributes["quantity"];
    if (a) {
        agreementdetail.attributes["new_amount"] = { value: a.value, type: 'int' };
    }
    setAttribute(agreementdetail, "new_cost", detail.attributes["extendedamount"]);
    setAttribute(agreementdetail, "new_exchangerates", detail.attributes["new_exchangerates"]);
    setAttribute(agreementdetail, "salesrepid", detail.attributes["salesrepid"]);

    setAttribute(agreementdetail, "new_kursdate", detail.attributes["new_kursdate"]);
    setAttribute(agreementdetail, "new_viborkurs", detail.attributes["new_viborkurs"]);
    setAttribute(agreementdetail, "new_exchangerates", detail.attributes["new_exchangerates"]);
    setAttribute(agreementdetail, "new_kursspeka", detail.attributes["new_kursspeka"]);

    XrmServiceToolkit.Soap.Create(agreementdetail);
};

var setAttribute = function (salesorderdetail, name, quotedetailValue) {
    if (quotedetailValue !== undefined) {
        salesorderdetail.attributes[name] = quotedetailValue;
    }
};

var retrieveQuotedetails = function (quoteId) {
    var queryOptions = {
        entityName: "quotedetail",
        attributes: ["quoteid"],
        values: [quoteId],
        columnSet: ["productid",
            "isproductoverridden",
            "productdescription",
            "priceperunit",
            "quantity",
            "uomid",
            "new_kursdate",
            "new_viborkurs",
            "new_exchangerates",
            "new_kursspeka",
            "baseamount",
            "tax",
            "extendedamount",
            "new_exchangerates",
            "new_totalpurchaseuah",
            "salesrepid",
            "new_priceprocurementuah",
            "new_pricepurchaseusd",
            "new_totalpurchaseusd",
            "new_sellingusd"],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};

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