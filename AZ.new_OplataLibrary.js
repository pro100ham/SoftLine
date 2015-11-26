//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    //new_data_oplati - Дата оплвты 
    //transactioncurrencyid - Валюта Xrm.Page.getAttribute("transactioncurrencyid").getValue()

    //Xrm.Page.getAttribute('new_data_oplati').addOnChange(softline.FindCurrency);
    softline.setCurrencyFromInvoice();
}

softline.setCurrencyFromInvoice = function () {
    if (Xrm.Page.getAttribute("new_schetid").getValue()[0].id != "") {
        var id = Xrm.Page.getAttribute("new_schetid").getValue()[0].id;
        id = id.replace("{", "");
        id = id.replace("}", "");
        retrieveRecord(id, "InvoiceSet", function (data) {
            if (data && data.TransactionCurrencyId != null) {
                Xrm.Page.getAttribute("transactioncurrencyid").setValue([{ id: data.TransactionCurrencyId.Id, name: data.TransactionCurrencyId.Name, entityType: data.TransactionCurrencyId.LogicalName }]);
            }
        }, null, false);
    }
}

softline.FindCurrency = function () {
    var date = Xrm.Page.getAttribute("new_data_oplati").getValue();
    var currency = Xrm.Page.getAttribute("transactioncurrencyid").getValue();
    if (date && currency) {
        var fetchXML = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
						  "<entity name='sl_exchangerate'>" +
							"<attribute name='sl_exchangerateid' />" +
							"<attribute name='sl_isocurrencycode' />" +
							"<attribute name='sl_exchangerate' />" +
							"<attribute name='createdon' />" +
							"<order attribute='sl_isocurrencycode' descending='false' />" +
							"<filter type='and'>" +
							  //"<condition attribute='statuscode' operator='eq' value='2' />"+
							  "<condition attribute='createdon' operator='on' value='" + date.format('yyyy-MM-dd') + "' />" +
							  "<condition attribute='sl_transactioncurrencyid' operator='eq' uitype='transactioncurrency' value='" + currency[0].id + "' />" +
							"</filter>" +
						  "</entity>" +
						"</fetch>";
        XrmServiceToolkit.Soap.Fetch(fetchXML, function (data) {
            if (data.length > 0) {
                SetFieldValue('new_exchange_rate', parseFloat(data[0].attributes.sl_exchangerate.formattedValue.replace(',', '.')));
            }
        });
    }
}

function SetMarza() {
    if (Xrm.Page.ui.getFormType() != 1) {
        var schet = GetFieldValue("new_schetid");
        if (schet != null) {
            var value = 0;
            var id = schet[0].id;
            id = id.replace("{", "");
            id = id.replace("}", "");
            retrieveRecord(id, "InvoiceSet", function (data) {
                //    if (data && data.new_marzausd != null) {

                //value = parseFloat(data.new_marzausd);
                var totalAmount = 0;
                var dopZatrati = 0;
                var totalAmountZakupki = 0;
                var totalAmountZakupkiUSD = 0;
                var totalAmountUSD = 0;
                var dopZatratiUSD = 0;
                var procentOPlata = 0;
                var oplata = procentOPlata = marzaOplata = marzaUSDOplata = 0;
                if (data.TotalAmount != null && data.TotalAmount.Value != null) totalAmount = parseFloat(data.TotalAmount.Value);
                if (data.new_Dop_zatratu != null && data.new_Dop_zatratu.Value != null) dopZatrati = parseFloat(data.new_Dop_zatratu.Value);
                if (data.new_Summ_zakupki != null && data.new_Summ_zakupki.Value != null) totalAmountZakupki = parseFloat(data.new_Summ_zakupki.Value);
                if (data.new_obshayazakupkausd != null) totalAmountZakupkiUSD = parseFloat(data.new_obshayazakupkausd);
                if (data.TotalAmount_Base != null && data.TotalAmount_Base.Value != null) totalAmountUSD = parseFloat(data.TotalAmount_Base.Value);
                if (data.new_dop_zatratu_Base != null && data.new_dop_zatratu_Base.Value != null) dopZatratiUSD = parseFloat(data.new_dop_zatratu_Base.Value);

                oplata = parseFloat(GetFieldValue("new_summa"));
                procentOPlata = oplata / totalAmount;
                marzaOplata = procentOPlata * totalAmount - procentOPlata * dopZatrati - procentOPlata * totalAmountZakupki;
                marzaUSDOplata = procentOPlata * totalAmountUSD - procentOPlata * dopZatratiUSD - procentOPlata * totalAmountZakupkiUSD;
                //    SetFieldValue("new_marja", marzaOplata);
                SetFieldValue("new_marjausd", marzaUSDOplata);
                //   }
            }, null, false);
            //  SetFieldValue("new_marjausd", value);
        }
    }
}
function SetManatCurrancy() {
    if (GetFieldValue("transactioncurrencyid") == null || Xrm.Page.ui.getFormType() == 1) {
        var filter = "?$filter=CurrencyName eq 'manat'";
        retrieveMultiple("TransactionCurrencySet", filter, function (data) {
            if (data && data.length > 0) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data[0].TransactionCurrencyId;
                lookupItem.typename = "transactioncurrency";
                lookupItem.name = data[0].CurrencyName;
                lookupData[0] = lookupItem;
                SetFieldValue("transactioncurrencyid", lookupData);
            }
        }, null, false);
    }
}
function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}
function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}