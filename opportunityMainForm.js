//----------------------------------------//
//---------©2014 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setVisibleFields();
    softline.setTransactionCurrency();

    Xrm.Page.getAttribute("new_typetransaction").addOnChange(softline.setVisibleFields);
}

softline.setTransactionCurrency = function () {
    //TODO: Змвнінити прямі індифікатори
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "гривня", entityType: "transactioncurrency" }]);
        Xrm.Page.getAttribute('pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
    }
}

softline.setVisibleFields = function () {
    Xrm.Page.getControl('new_dealtype').setVisible(false);
    if (Xrm.Page.getAttribute('new_typetransaction').getValue() != null) {
        if (Xrm.Page.getAttribute('new_typetransaction').getValue() == '100000004') {
            Xrm.Page.getControl('new_dealtype').setVisible(true);
        }
        else {
            Xrm.Page.getControl('new_dealtype').setVisible(false);
        }
    }
}

softline.openDialogForPerSale = function () {
    //var sLookup = openStdDlg(Mscrm.CrmUri.create(String.format("$webresource:{0}", "new__/Form/FormForOpportunity.html")), null, 250, 10, false);
    var addParams = "Param1=" + Xrm.Page.data.entity.getId() + "&Param2=" + Xrm.Page.getAttribute("name").getValue();
    var sLookup = openStdDlg(Mscrm.CrmUri.create(String.format("$webresource:{0}?Data={1}", "new__/Form/FormForOpportunity.html", encodeURIComponent(addParams))), null, 250, 10, false);
}

softline.buttonCreateInvoise = function () {
    //Кнопка создания счета на управляюще ленте ВС
    if (Xrm.Page.data.entity.getId() != ""
        && Xrm.Page.getAttribute('estimatedvalue').getValue()) {
      
        if (Xrm.Page.getAttribute('estimatedvalue').getValue() > 60000) {
            alert("Сумма сделки превышает 60 000 грн. Создайте КП и Договор");
            return;
        }

        var invoice = new XrmServiceToolkit.Soap.BusinessEntity("invoice");

        invoice.attributes["opportunityid"] = {
            id: Xrm.Page.data.entity.getId(),
            logicalName: Xrm.Page.data.entity.getEntityName(),
            type: "EntityReference"
        };
        invoice.attributes["customerid"] = {
            id: Xrm.Page.data.entity.attributes.get("parentaccountid").getValue()[0].id,
            logicalName: Xrm.Page.data.entity.attributes.get("parentaccountid").getValue()[0].entityType,
            type: "EntityReference"
        };
        invoice.attributes["new_expecteddatepayment"] = { value: Xrm.Page.getAttribute('estimatedclosedate').getValue(), type: 'date' };
        invoice.attributes["totalamount"] = { value: Xrm.Page.getAttribute('estimatedvalue').getValue(), type: 'double' };
        invoice.attributes["new_margin"] = { value: Xrm.Page.getAttribute('new_margin').getValue(), type: 'double' };
        if (Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()) {
            invoice.attributes["pricelevelid"] = {
                id: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].id,
                logicalName: Xrm.Page.data.entity.attributes.get("pricelevelid").getValue()[0].entityType,
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
        //if (Xrm.Page.data.entity.attributes.get("new_marginuah").getValue()) {
        //    invoice.attributes["new_margin"] = { value: Xrm.Page.getAttribute('new_marginuah').getValue(), type: 'double' };
        //}

        try {
            var invoiceId = XrmServiceToolkit.Soap.Create(invoice);
            Xrm.Utility.openEntityForm("invoice", invoiceId);
        } catch (ex) {
            alert(ex.message);
        }
    }
}