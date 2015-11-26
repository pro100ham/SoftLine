//----------------------------------------//
//---------©2014 SoftLine Ukraine---------//
//----------------------------------------//

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {

    softline.setPenalty();
    softline.setOfferDate();
    softline.MarjaFromProduct();

    Xrm.Page.getAttribute('quoteid').addOnChange(softline.SetMarja);
    Xrm.Page.getAttribute('new_dop_zatratu_money').addOnChange(softline.SetMarja);
}

softline.setPenalty = function () {
    if (Xrm.Page.getAttribute('new_penalty').getValue() == null) {
        Xrm.Page.getAttribute('new_penalty').setValue(0.2);
    }
    if (Xrm.Page.getAttribute('new_percentage_of_delay').getValue() == null) {
        Xrm.Page.getAttribute('new_percentage_of_delay').setValue("10.0");
    }
    if (Xrm.Page.getAttribute('new_penalty_pokypatel').getValue() == null) {
        Xrm.Page.getAttribute('new_penalty_pokypatel').setValue(0.2);
    }
    if (Xrm.Page.getAttribute('new_percentage_of_delay_pokup').getValue() == null) {
        Xrm.Page.getAttribute('new_percentage_of_delay_pokup').setValue("10.0");
    }
}

softline.MarjaFromProduct = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var details = retrieveDetails(Xrm.Page.data.entity.getId());
        SetFieldValue("new_marginid", sumObjectValues("new_generalsellingusd", details) - sumObjectValues("new_totalpurchaseusd", details));
        SetFieldValue("new_summausd", sumObjectValues("new_generalsellingusd", details));
        SetFieldValue("new_usd", sumObjectValues("new_totalpurchaseusd", details));
    }
}

softline.ButtonOplata = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var parameters = {};
        var UTCDate = Xrm.Page.getAttribute("new_contract_date").getValue();
        UTCDate.setHours(24);

        parameters["ownerid"] = Xrm.Page.getAttribute("ownerid").getValue()[0].id;
        parameters["owneridname"] = Xrm.Page.getAttribute("ownerid").getValue()[0].name;
        parameters["owneridtype"] = Xrm.Page.getAttribute("ownerid").getValue()[0].entityType;
        parameters["new_account_agreemid"] = Xrm.Page.getAttribute("customerid").getValue()[0].id;
        parameters["new_account_agreemidname"] = Xrm.Page.getAttribute("customerid").getValue()[0].name;
        parameters["new_dogovorid"] = Xrm.Page.data.entity.getId();
        parameters["new_dogovoridname"] = Xrm.Page.getAttribute("new_agreem_number").getValue();
        parameters["new_sum_agreem"] = Xrm.Page.getAttribute("totalamount").getValue();
        parameters["new_sdelkaid"] = Xrm.Page.getAttribute("opportunityid").getValue()[0].id;
        parameters["new_sdelkaidname"] = Xrm.Page.getAttribute("opportunityid").getValue()[0].name;
        parameters["new_nimber_agreem"] = Xrm.Page.getAttribute("new_agreem_number").getValue();
        parameters["new_date_agreem"] = UTCDate.toISOString('YYYY-mm-DD');
        parameters["new_sum_all"] = Xrm.Page.getAttribute("totalamount").getValue();
        //parameters["new_summa_usd"] = Xrm.Page.getAttribute("new_summausd").getValue();
        if (Xrm.Page.getAttribute("new_course").getValue() != null) {
            parameters["new_course"] = Xrm.Page.getAttribute("new_course").getValue();
        }
        parameters["transactioncurrencyid"] = Xrm.Page.getAttribute("transactioncurrencyid").getValue()[0].id;
        parameters["transactioncurrencyidname"] = Xrm.Page.getAttribute("transactioncurrencyid").getValue()[0].name;

        Xrm.Utility.openEntityForm("new_oplata", null, parameters);
    }
}

softline.setOfferDate = function () {
    if (Xrm.Page.ui.getFormType() == 1)
        if (Xrm.Page.getAttribute("new_contract_date").getValue() == null) {
            var today = new Date();
            Xrm.Page.getAttribute("new_contract_date").setValue(today);
        }
}

softline.SetMarja = function () {
    if (Xrm.Page.getAttribute('quoteid').getValue() != null) {
        var quote = Xrm.Page.getAttribute('quoteid').getValue()[0];
        var dopZatratu = Xrm.Page.getAttribute('new_dop_zatratu_money').getValue() != null ? Xrm.Page.getAttribute('new_dop_zatratu_money').getValue() : 0;
        retrieveRecord(quote.id, 'QuoteSet', function (data) {
            Xrm.Page.getControl('new_marginid').setDisabled(false);
            Xrm.Page.getAttribute('new_marginid').setSubmitMode("always");
            Xrm.Page.getAttribute('new_marginid').setValue(data.new_margin - dopZatratu);
            Xrm.Page.getControl('new_marginid').setDisabled(true);
        }, null, true, null);
    }
}

function CheckStatusCode(context) {
    if (Xrm.Page.getAttribute('new_sing').getValue() == 100000000) {
        alert("Выберите Признак Договора!");
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

var retrieveDetails = function (Id) {
    var queryOptions = {
        entityName: "salesorderdetail",
        attributes: ["salesorderid"],
        values: [Id],
        columnSet: ["new_generalsellingusd",
            "new_totalpurchaseusd"],
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
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}