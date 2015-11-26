function setOfferDate() {
    if (Xrm.Page.ui.getFormType() == 1)
        if (Xrm.Page.getAttribute("effectivefrom").getValue() == null) {
            var today = new Date();
            Xrm.Page.getAttribute("effectivefrom").setValue(today);
        }
}

function costumerChanged() {
    if (Xrm.Page.data.entity.attributes.get("new_langformcustomer").getValue() == null && Xrm.Page.data.entity.attributes.get("customerid").getValue() != null) {
        //Xrm.Page.data.entity.attributes.get("new_langformcustomer").setValue(Xrm.Page.data.entity.attributes.get("customerid").getValue());
        var req = {
            shem: "customerid",
            toshem: "AccountSet",
            toShemField: "new_preflangform"
        };
        var toOrg = _commander.retriveAttrFromAttr(req);
        Xrm.Page.data.entity.attributes.get("new_langformcustomer").setValue([{
            id: toOrg.Id,
            typename: toOrg.LogicalName,
            name: toOrg.Name
        }
        ]);
        Xrm.Page.getAttribute("new_langformcustomer").fireOnChange();
    }
}

function langformcustomerChanged() {
    if (Xrm.Page.data.entity.attributes.get("new_langformcomdep").getValue() == null && Xrm.Page.data.entity.attributes.get("new_organization_dep").getValue() != null) {
        var req = {
            shem: "new_langformcustomer",
            toshem: "new_languageformSet",
            toShemField: "new_lang"
        };
        var toOrg = _commander.retriveAttrFromAttr(req);

        var id = Xrm.Page.data.entity.attributes.get("new_organization_dep").getValue()[0].id;
        id = id.replace("{", "");
        id = id.replace("}", "");

        var testTp3 = {
            toshem: "new_languageformSet",
            filter: "?$filter=new_cosdepslanguageform/Id eq (guid'" + id + "') and new_lang/Value eq " + toOrg.Value + ""
        };
        var rturn = _commander.multiRetrive(testTp3);

        if (rturn && rturn.length > 0) {
            Xrm.Page.data.entity.attributes.get("new_langformcomdep").setValue([{
                id: rturn[0].new_languageformId,
                typename: "new_languageform",
                name: rturn[0].new_name
            }
            ])
        }
    }
}

function EventsSet() {
    //Подвешивает функции на события.
    //Xrm.Page.getAttribute("customerid").addOnChange(costumerChanged);
    //Xrm.Page.getAttribute("new_langformcustomer").addOnChange(langformcustomerChanged);
    MarjaFromProduct();
    //Xrm.Page.getAttribute("totalamount").addOnChange(MarjaFromProduct);
    //Блокированные поля которые должны быть сохраненны
}

function SetNameToKomercheskoePredlozenie() {
    var numberA = Xrm.Page.getAttribute('quotenumber').getValue();
    if (numberA) {
        Xrm.Page.getAttribute("name").setSubmitMode("always");
        Xrm.Page.getAttribute('name').setValue(numberA + "");
    }
}

function CheckStatusCode(context) {
    if (Xrm.Page.getAttribute('new_priznakkp').getValue() == 100000000) {
        alert("Выберите Признак КП!");
        var saveEvent = context.getEventArgs();
        saveEvent.preventDefault();
    }
}

function GetUserId() {
    return Xrm.Page.context.getUserId();
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}


function SetorganizationDepartuteFromUser() {
    if (GetFieldValue("new_organization_dep") == null) {
        var id = GetUserId();
        id = id.replace("{", "").replace("}", "");
        retrieveRecord(id, "SystemUserSet", function (data) {
            if (data && data.new_org_depid != null && data.new_org_depid.Id != null) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data.new_org_depid.Id;
                lookupItem.typename = data.new_org_depid.LogicalName;
                lookupItem.name = data.new_org_depid.Name;
                lookupData[0] = lookupItem;
                SetFieldValue("new_organization_dep", lookupData);
            }
        }, null, false);
    }
}

function SetPriceListdependOfCurreny() {
    if (GetFieldValue("pricelevelid") == null) {
        SetPriceList();
    }
}

function SetPriceListdependOfCurrenyOnChange() {
    SetPriceList();
}

function SetPriceList() {
    var currencyName = '';
    if (GetFieldValue("transactioncurrencyid") != null) {
        currencyName = GetFieldValue("transactioncurrencyid")[0].name;
    }
    var orgDep = GetUserOrgDep();
    filter = '';
    retrieveMultiple("PriceLevelSet", filter, function SuccesssetPriceList(data) {
        if (data && data.length > 0) {
            var pricelistAttribute = "Default USD Pricelist";
            if (orgDep == "Sales") {
                if (currencyName == "US Dollar") pricelistAttribute = "Default USD Pricelist";
                if (currencyName == "manat") pricelistAttribute = "Default AZN Pricelist";
            }
            if (orgDep == "Edu") { pricelistAttribute = "Основной прайс-лист по отделу Education"; }
            if (currencyName == "сум") pricelistAttribute = "Defeult Sales Sum";
            for (var i = 0; i < data.length; i++) {
                if (data[i].Name == pricelistAttribute) {
                    var lookupData = new Array();
                    var lookupItem = new Object();
                    lookupItem.id = data[i].PriceLevelId;
                    lookupItem.typename = "pricelevel";
                    lookupItem.name = data[i].Name;
                    lookupData[0] = lookupItem;
                    SetFieldValue("pricelevelid", lookupData);
                }
            }
        }
    }, null, false);
}
function GetUserOrgDep() {
    var result = "";
    var id = GetUserId();
    id = id.replace("{", "").replace("}", "");
    retrieveRecord(id, "SystemUserSet", function (data) {
        if (data && data.new_org_depid != null && data.new_org_depid.Id != null) {
            result = data.new_org_depid.Name;
        }
    }, null, false);
    return result;
}
function SetLanguageForm() {
    //debugger;
    if (GetFieldValue("new_langformcustomer") == null && GetFieldValue("customerid") != null && GetFieldValue("customerid")[0].typename == 'account') {
        var id = GetFieldValue("customerid")[0].id;
        id = id.replace("{", "").replace("}", "");
        var filter = "?$filter=new_languageform/Id eq (guid'" + id + "')";
        retrieveMultiple("new_languageformSet", filter, function (data) {
            if (data && data.length > 0) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data[0].new_languageformId;
                lookupItem.typename = "new_languageform";
                lookupItem.name = data[0].new_name;
                lookupData[0] = lookupItem;
                SetFieldValue("new_langformcustomer", lookupData);
            }
        }, null, false);
    }
}
function GetUserId() {
    return Xrm.Page.context.getUserId();
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}

function HideField(FieldName) {
    Xrm.Page.ui.controls.get(FieldName).setVisible(false);
}

function ShowField(FieldName) {
    Xrm.Page.ui.controls.get(FieldName).setVisible(true);
}

function HideFieldsdependOfOrganizationDeparture() {
    var organization = GetFieldValue("new_organization_dep");
    if (organization != null && organization[0].name == "Edu") {
        HideField("shippingmethodcode");
        HideField("freighttermscode");
        HideField("new_srok_dostavki");
        HideField("new_ysloviya_oplatu");
    } else {
        ShowField("shippingmethodcode");
        ShowField("freighttermscode");
        ShowField("new_srok_dostavki");
        ShowField("new_ysloviya_oplatu");
    }
}

function OpenSchet() {
    var id = Xrm.Page.data.entity.getId().replace("{", "").replace("}", ""),
        serverUrl = Xrm.Page.context.getServerUrl();
    serverUrl += "/main.aspx?etc=1090&extraqs=%3f_CreateFromId%3d%257b" + id + "%257d%26_CreateFromType%3d1084%26etc%3d1090%26pagemode%3diframe%26preloadcache%3d1362765455096&pagetype=entityrecord";
    window.open(serverUrl, '', 'menubar=0,toolbar=0,resizable=1,status=1');
}

function MarjaFromProduct() {
    if (Xrm.Page.data.entity.getId() != "") {
        var details = retrieveQuotedetails(Xrm.Page.data.entity.getId());
        SetFieldValue("new_margin", sumObjectValues("new_generalsellingusd", details) - sumObjectValues("new_totalpurchaseusd", details));
        SetFieldValue("new_summausd", sumObjectValues("new_generalsellingusd", details));
        SetFieldValue("new_usd", sumObjectValues("new_totalpurchaseusd", details));
    }
}

/////////////////////////////////////////////////////////////////////////////////
//Создание Продуктов для Договора
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
    setAttribute(salesorderdetail, "new_manufacturingname", quotedetail.attributes["new_manufacturingname"]);
    if (quotedetail.attributes["new_sku"]) {
        setAttribute(salesorderdetail, "new_sku", quotedetail.attributes["new_sku"]);
    }
    setAttribute(salesorderdetail, "priceperunit", quotedetail.attributes["priceperunit"]);
    setAttribute(salesorderdetail, "new_producttypecode", quotedetail.attributes["new_producttypecode"]);
    setAttribute(salesorderdetail, "quantity", quotedetail.attributes["quantity"]);
    salesorderdetail.attributes["new_purchaseusd"] = { value: quotedetail.attributes["new_usdprice"].value, type: 'double' };
    setAttribute(salesorderdetail, "transactioncurrencyid", quotedetail.attributes["transactioncurrencyid"]);

    setAttribute(salesorderdetail, "new_sellingusd", quotedetail.attributes["new_sellingusd"]);
    setAttribute(salesorderdetail, "new_exchangerate", quotedetail.attributes["new_exchangerate"]);
    if (quotedetail.attributes["new_koef"]) {
        salesorderdetail.attributes["new_koef"] = { value: quotedetail.attributes["new_koef"].value, type: 'double' };
    }
    setAttribute(salesorderdetail, "new_totalpurchaseusd", quotedetail.attributes["new_totalpurchaseusd"]);
    setAttribute(salesorderdetail, "new_generalsellingusd", quotedetail.attributes["new_generalsellingusd"]);
    setAttribute(salesorderdetail, "extendedamount", quotedetail.attributes["baseamount"]);

    XrmServiceToolkit.Soap.Create(salesorderdetail);
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
            "productdescription",
            "isproductoverridden",
            "new_manufacturingname",
            "new_sku",
            "baseamount",
            "priceperunit",
            "quantity",
            "new_usdprice",
            "transactioncurrencyid",
            "new_producttypecode",
            "new_generalsellingusd",
            "new_totalpurchaseusd",
            "uomid",
            "new_sellingusd",
            "new_exchangerate",
            "new_koef"
        ],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};
/////////////////////////////////////////////////////////////////////////////////
function OpenDogovor() {
    if (Xrm.Page.data.entity.getId() != "" && Xrm.Page.getAttribute('new_margin').getValue() != null) {

        //Создание Договора

        var salesorder = new XrmServiceToolkit.Soap.BusinessEntity("salesorder");

        var customerID = Xrm.Page.data.entity.attributes.get("customerid").getValue()[0].id;
        var customerEntity = Xrm.Page.data.entity.attributes.get("customerid").getValue()[0].entityType;
        var quoteId = Xrm.Page.data.entity.getId();
        var quotedetails = retrieveQuotedetails(quoteId);

        salesorder.attributes["name"] = { value: Xrm.Page.data.entity.attributes.get("name").getValue(), type: 'string' };
        salesorder.attributes["quoteid"] = { id: quoteId, logicalName: 'quote', type: "EntityReference" };
        salesorder.attributes["customerid"] = { id: customerID, logicalName: customerEntity, type: "EntityReference" };
        salesorder.attributes["new_authorized_person"] = {
            id: Xrm.Page.data.entity.attributes.get("new_company_authorizedperson").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("new_company_authorizedperson").getValue()[0].entityType, type: "EntityReference"
        };
        salesorder.attributes["opportunityid"] = {
            id: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("opportunityid").getValue()[0].entityType, type: "EntityReference"
        };
        salesorder.attributes["pricelevelid"] = {
            id: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].entityType, type: "EntityReference"
        };
        salesorder.attributes["transactioncurrencyid"] = {
            id: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].entityType, type: "EntityReference"
        };

        salesorder.attributes["new_contract_date"] = { value: new Date(), type: 'date' };
        salesorder.attributes["new_marginid"] = { value: Xrm.Page.getAttribute('new_margin').getValue(), type: 'double' };
        salesorder.attributes["totalamount"] = { value: Xrm.Page.getAttribute('totalamount').getValue(), type: 'double' };
        salesorder.attributes["new_usd"] = { value: Xrm.Page.getAttribute('new_usd').getValue(), type: 'double' };
        salesorder.attributes["new_summausd"] = { value: Xrm.Page.getAttribute('new_summausd').getValue(), type: 'double' };

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

function checkOwner(context) {
    if (Xrm.Page.getAttribute('ownerid').getValue()) {
        var owner = Xrm.Page.getAttribute('ownerid').getValue()[0].name;
        if (owner == "Sabina Kadirova" || owner == "Yulduz Tokhtieva") {
            alert("Пожалуйста проверьте информацию об Ответственном лице");
            var saveEvent = context.getEventArgs();
            saveEvent.preventDefault();
        }
    }
}

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