//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.counterInvoices();

}

softline.counterInvoices = function () {
///<summary>
/// Автоматическое заполнение полей «Сделок закупки», «Сделок продажи»,  «Договоров продажи», «Договоров закупки», «Последний звонок».
///</summary>
    if (Xrm.Page.data.entity.getId() != "") {
        var recordId = Xrm.Page.data.entity.getId();
        var fetchContract = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true' >" +
                            "<entity name='new_purchase_contract' >" +
                                "<attribute name='new_purchase_contractid' alias='new_purchase_contract_count' aggregate='count' />" +
                                "<filter type='and' >" +
                                    "<condition attribute='new_supplierid' operator='eq' uitype='account' value='" + recordId + "' />" +
                                "</filter>" +
                            "</entity>" +
                        "</fetch>"; 

        var fetchDeal = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'>" +
                          "<entity name='new_purchase_deal'>" +
                            "<attribute name='new_purchase_dealid' alias='new_purchase_deal_count' aggregate='count' />" +
                            "<filter type='and'>" +
                              "<condition attribute='new_supplierid' operator='eq' uitype='account' value='" + recordId + "' />" +
                            "</filter>" +
                          "</entity>" +
                        "</fetch>";

        var fetchOpp = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'>" +
                      "<entity name='opportunity'>" +
                        "<attribute name='opportunityid' alias='opportunityid_count' aggregate='count'  //>" +
                        "<order attribute='name' descending='false' />" +
                        "<filter type='and'>" +
                          "<condition attribute='customerid' operator='eq' uitype='account' value='" + recordId + "' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";

        var fetchSO = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'>" +
                      "<entity name='salesorder'>" +
                        "<attribute name='salesorderid' alias='salesorderid_count' aggregate='count'  />" +
                        "<order attribute='name' descending='false' />" +
                        "<filter type='and'>" +
                          "<condition attribute='customerid' operator='eq' uitype='account' value='" + recordId + "' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";

        var fetchPhone = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                          "<entity name='phonecall'>" +
                            "<attribute name='statecode' />" +
                            "<attribute name='activityid'/>" +
                            "<attribute name='new_date_end_call' />" +
                            "<order attribute='new_date_end_call' descending='true' />" +
                            "<filter type='and'>" +
                              "<condition attribute='new_account' operator='eq' uitype='account' value='" + recordId + "' />" +
                              "<condition attribute='new_status' operator='eq' value='100000002' />" +
                            "</filter>" +
                          "</entity>" +
                        "</fetch>";

        var countDeal = XrmServiceToolkit.Soap.Fetch(fetchDeal);
        var countContract = XrmServiceToolkit.Soap.Fetch(fetchContract);
        var countOpp = XrmServiceToolkit.Soap.Fetch(fetchOpp);
        var countSalesOrder = XrmServiceToolkit.Soap.Fetch(fetchSO);
        var takeLastPhone = XrmServiceToolkit.Soap.Fetch(fetchPhone);

        if(countDeal.length != 0){
            SetFieldValue('new_number_purchase_opportunity', countDeal[0].attributes.new_purchase_deal_count.value);
        }
        if (countContract.length != 0) {
            SetFieldValue('new_number_purchase_contract', countContract[0].attributes.new_purchase_contract_count.value);
        }
        if (countOpp.length != 0) {
            SetFieldValue('new_number_sale_opportunity', countContract[0].attributes.opportunityid_count.value);
        }
        if (countSalesOrder.length != 0) {
            SetFieldValue('new_number_sale_contract', countContract[0].attributes.salesorderid_count.value);
        }
        if (takeLastPhone.length != 0) {
            SetFieldValue('new_last_call', new Date(countContract[0].attributes.new_date_end_call.value));
        }
    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

