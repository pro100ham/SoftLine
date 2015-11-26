//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.summProductDetail();
    softline.setLookup();
    softline.setTransactionCurrency();
}

//Не нада 
//softline.retriveTotalToSalesOrder = function () {
//    //Автоматический расчет суммы дополнительного соглашения
//    if (Xrm.Page.getAttribute("new_totalamountagreement").getValue() != null &&
//        Xrm.Page.getAttribute("new_contractorder").getValue()) {
//        var salesorderId = Xrm.Page.getAttribute("new_contractorder").getValue()[0].id.replace('{', '').replace('}', '');
//        var cost = Xrm.Page.getAttribute("new_totalamountagreement").getValue();

//        var salesOrderUpdate = {};
//        salesOrderUpdate.new_cost = cost;

//        XrmServiceToolkit.Rest.Update(salesorderId, salesOrderUpdate, "SalesOrderSet",
//                                                            function () {
//                                                                console.log("Record updated");
//                                                            },
//                                                            function (error) {
//                                                                console.log(error.message);
//                                                            },
//                                                            false);
//    }
//}
softline.setTransactionCurrency = function () {
    //TODO: Змвнінити прямі індифікатори
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "гривня", entityType: "transactioncurrency" }]);
        Xrm.Page.getAttribute('new_pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
    }
}


softline.setLookup = function () {
    retrieveMultiple("new_constantSet", null, function (data) {
        if (data[0].new_Logist.Id != null && Xrm.Page.getAttribute('new_logistics').getValue() == null)
            Xrm.Page.getAttribute('new_logistics').setValue([{ id: data[0].new_Logist.Id, entityType: data[0].new_Logist.LogicalName, name: data[0].new_Logist.Name }]);
        /*if(data[0].new_signatorycontracts.Id != null)
	 		Xrm.Page.getAttribute('new_signatory').setValue([{id: data[0].new_signatorycontracts.Id,entityType: data[0].new_signatorycontracts.LogicalName,name: data[0].new_signatorycontracts.Name}]);*/
        if (data[0].new_lawyer.Id != null && Xrm.Page.getAttribute('new_lawdepartment').getValue() == null)
            Xrm.Page.getAttribute('new_lawdepartment').setValue([{ id: data[0].new_lawyer.Id, entityType: data[0].new_lawyer.LogicalName, name: data[0].new_lawyer.Name }]);
        if (data[0].new_financier.Id != null && Xrm.Page.getAttribute('new_financedepartment').getValue() == null)
            Xrm.Page.getAttribute('new_financedepartment').setValue([{ id: data[0].new_financier.Id, entityType: data[0].new_financier.LogicalName, name: data[0].new_financier.Name }]);
        if (data[0].new_accountant.Id != null && Xrm.Page.getAttribute('new_accountant').getValue() == null)
            Xrm.Page.getAttribute('new_accountant').setValue([{ id: data[0].new_accountant.Id, entityType: data[0].new_accountant.LogicalName, name: data[0].new_accountant.Name }]);
        if (data[0].new_salesdepartment.Id != null && Xrm.Page.getAttribute('new_salesdepartment').getValue() == null)
            Xrm.Page.getAttribute('new_salesdepartment').setValue([{ id: data[0].new_salesdepartment.Id, entityType: data[0].new_salesdepartment.LogicalName, name: data[0].new_salesdepartment.Name }]);
    }, null, true);
}

softline.summProductDetail = function () {
    // Общая сумма доп. соглашения
    if (Xrm.Page.data.entity.getId() != "") {
        var objDetail = retrieveDetails(Xrm.Page.data.entity.getId());
        var cost = 0;

        if (objDetail.length == 0)
            return;

        for (var i = 0; i < objDetail.length; i++) {
            if (objDetail[i].attributes["new_cost"].value) {
                cost += objDetail[i].attributes["new_cost"].value;
            }
        }
        SetFieldValue('new_totalamountagreement', cost);
    }
}

softline.ButtonOpenSupplementary = function () {
    //По созданию формы «Согласование договора» из Доп. соглашения.
    if (Xrm.Page.data.entity.getId() != "") {
        var parameters = {};
        var salesorderId = Xrm.Page.getAttribute("new_contractorder").getValue();
        parameters["new_contrsctorder"] = salesorderId[0].id;
        parameters["new_contrsctordername"] = salesorderId[0].name;
        parameters["new_supplementaryagreement"] = Xrm.Page.data.entity.getId();
        parameters["new_supplementaryagreementname"] = Xrm.Page.getAttribute("new_name").getValue();
        Xrm.Utility.openEntityForm("new_coordinationcontract", null, parameters);
    }
}

softline.buttonCreateInvoice = function () {
    //Кнопка создания счета на управляюще ленте
    if (Xrm.Page.data.entity.getId() != "") {

        var invoice = new XrmServiceToolkit.Soap.BusinessEntity("invoice");
        var details = retrieveDetails(Xrm.Page.data.entity.getId());

        invoice.attributes["customerid"] = {
            id: Xrm.Page.data.entity.attributes.get("new_klient").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("new_klient").getValue()[0].entityType,
            type: "EntityReference"
        };
        invoice.attributes["totalamount"] = { value: Xrm.Page.getAttribute('new_totalamountagreement').getValue(), type: 'double' };
        if (Xrm.Page.data.entity.attributes.get("new_pricelevelid").getValue()) {
            invoice.attributes["pricelevelid"] = {
                id: Xrm.Page.data.entity.attributes.get("new_pricelevelid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("new_pricelevelid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        if (Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()) {
            invoice.attributes["transactioncurrencyid"] = {
                id: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("transactioncurrencyid").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        if (Xrm.Page.data.entity.attributes.get("new_contractorder").getValue()) {
            invoice.attributes["salesorderid"] = {
                id: Xrm.Page.data.entity.attributes.get("new_contractorder").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("new_contractorder").getValue()[0].entityType,
                type: "EntityReference"
            };
        }
        invoice.attributes["exchangerate"] = { value: Xrm.Page.getAttribute('exchangerate').getValue(), type: 'double' };
        try {
            var invoiceId = XrmServiceToolkit.Soap.Create(invoice);
            if (details && details.length > 0) {
                for (var i = 0; i < details.length; i++) {
                    createInvoiceDetail(invoiceId, details[i]);
                }
            }
            Xrm.Utility.openEntityForm("invoice", invoiceId);
        } catch (ex) {
            alert(ex.message);
        }
    }
}

var retrieveDetails = function (Id) {
    var queryOptions = {
        entityName: "new_productadditionalagreement",
        attributes: ["new_supplementaryagreemenid"],
        values: [Id],
        columnSet: ["new_product",
                    "transactioncurrencyid",
                    "exchangerate",
                    "new_price",
                    "new_amount",
                    "new_cost",
                    "new_kursdate",
                    "new_viborkurs",
                    "new_exchangerates",
                    "new_kursspeka",
                    "new_uomid"],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};

var createInvoiceDetail = function (invoiceId, detail) {
    var invoicedetail = new XrmServiceToolkit.Soap.BusinessEntity("invoicedetail");
    invoicedetail.attributes["invoiceid"] = { id: invoiceId, logicalName: "invoice", type: "EntityReference" };
    if (detail.attributes["new_product"]) {
        setAttribute(invoicedetail, "productid", detail.attributes["new_product"]);
    }
    var a = detail.attributes["new_amount"];
    setAttribute(invoicedetail, "transactioncurrencyid", detail.attributes["transactioncurrencyid"]);
    setAttribute(invoicedetail, "priceperunit", detail.attributes["new_price"]);
    //setAttribute(invoicedetail, "quantity", detail.attributes["new_amount"]);
    if (a) {
        invoicedetail.attributes["quantity"] = { value: a.value, type: 'decimal' };
    }
    setAttribute(invoicedetail, "extendedamount", detail.attributes["new_cost"]);
    setAttribute(invoicedetail, "exchangerate", detail.attributes["exchangerate"]);
    setAttribute(invoicedetail, "uomid", detail.attributes["new_uomid"]);

    setAttribute(invoicedetail, "new_kursdate", detail.attributes["new_kursdate"]);
    setAttribute(invoicedetail, "new_viborkurs", detail.attributes["new_viborkurs"]);
    setAttribute(invoicedetail, "new_exchangerates", detail.attributes["new_exchangerates"]);
    setAttribute(invoicedetail, "new_kursspeka", detail.attributes["new_kursspeka"]);

    XrmServiceToolkit.Soap.Create(invoicedetail);
};

var setAttribute = function (invoicedetail, name, quotedetailValue) {
    if (quotedetailValue !== undefined) {
        invoicedetail.attributes[name] = quotedetailValue;
    }
};

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}