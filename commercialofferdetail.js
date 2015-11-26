//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

function ControlerFunctionConect()
{
	Xrm.Page.data.entity.attributes.get("new_discount").addOnChange(sl_Skidka_onChange);
	Xrm.Page.data.entity.attributes.get("new_discount").addOnChange(sl_ObshayaSumma);
	Xrm.Page.data.entity.attributes.get("new_discount_amount").addOnChange(sl_SummaSkidki_onChange);
	Xrm.Page.data.entity.attributes.get("new_discount_amount").addOnChange(sl_ObshayaSumma);
	Xrm.Page.data.entity.attributes.get("new_total_amount").addOnChange(sl_ObshayaSumma);

	Xrm.Page.getAttribute('new_purchaseusd').addOnChange(SetTotalpurchase);
	Xrm.Page.getAttribute('quantity').addOnChange(SetTotalpurchase);
	//Xrm.Page.getAttribute('new_koef').addOnChange(SetTotalpurchase);
	Xrm.Page.getAttribute('new_sellingusd').addOnChange(SetTotalpurchase);
	Xrm.Page.getAttribute('new_exchangerate').addOnChange(SetTotalpurchase);
	Xrm.Page.getAttribute('new_kursdate').addOnChange(setExchangerate);
	Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(setExchangerate);
}

function setExchangerate() {
    //Учет текущего курса валюты 
    if (Xrm.Page.getAttribute('new_kursdate').getValue()) {
        var date = Xrm.Page.getAttribute('new_kursdate').getValue();
        var currencyId = Xrm.Page.getAttribute('transactioncurrencyid').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                    "<entity name='sl_exchangerate'>" +
                    "<attribute name='sl_exchangerateid' />" +
                    "<attribute name='new_national_currency' />" +
                    "<attribute name='createdon' />" +
                    "<order attribute='sl_transactioncurrencyid' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='createdon' operator='on' value='" + date.yyyymmdd() + "' />" +
                    "<condition attribute='sl_transactioncurrencyid' operator='eq' value='" + currencyId[0].id + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";
        var currencyOnDate = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currencyOnDate.length == 0 || currencyOnDate[0].attributes.new_national_currency == null) return;

        SetFieldValue('new_exchangerate', currencyOnDate[0].attributes.new_national_currency.value);

    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

function SetTotalpurchase () {
    /*if (Xrm.Page.getAttribute('new_purchaseusd').getValue() != null &&
        Xrm.Page.getAttribute('new_koef').getValue() != null &&
        Xrm.Page.getAttribute('new_sellingusd').getValue() == null) {
        //SetFieldValue('new_sellingusd', Xrm.Page.getAttribute('new_koef').getValue() * Xrm.Page.getAttribute('new_purchaseusd').getValue());
    }
    else {
        //SetFieldValue('new_sellingusd', 0);
    }*/
    if (Xrm.Page.getAttribute('new_sellingusd').getValue() != null &&
        Xrm.Page.getAttribute('new_exchangerate').getValue() != null) {
        SetFieldValue('priceperunit', Xrm.Page.getAttribute('new_sellingusd').getValue() * Xrm.Page.getAttribute('new_exchangerate').getValue());
    }
    else {
        SetFieldValue('priceperunit', 0);
    }
    if (Xrm.Page.getAttribute('quantity').getValue() != null) {
        if (Xrm.Page.getAttribute('new_purchaseusd').getValue() != null) {
            SetFieldValue('new_totalpurchaseusd', Xrm.Page.getAttribute('quantity').getValue() * Xrm.Page.getAttribute('new_purchaseusd').getValue());
        }
        else {
            SetFieldValue('new_totalpurchaseusd', 0);
        }
        if (Xrm.Page.getAttribute('new_sellingusd').getValue() != null) {
            SetFieldValue('new_generalsellingusd', Xrm.Page.getAttribute('quantity').getValue() * Xrm.Page.getAttribute('new_sellingusd').getValue());
        }
        else {
            SetFieldValue('new_generalsellingusd', 0);
        }
    }
}

function sl_Skidka_onChange()
{
	if ((Xrm.Page.data.entity.attributes.get("extendedamount").getValue() != null) && (Xrm.Page.data.entity.attributes.get("new_discount").getValue() != null))
	{
		Xrm.Page.data.entity.attributes.get("new_discount_amount").setValue(Xrm.Page.data.entity.attributes.get("extendedamount").getValue() * Xrm.Page.data.entity.attributes.get("new_discount").getValue() / 100);
	}
	else 
	{
		Xrm.Page.data.entity.attributes.get("new_discount_amount").setValue(null);
	}
}

function sl_SummaSkidki_onChange()
{
	if ((Xrm.Page.data.entity.attributes.get("extendedamount").getValue() != null) && (Xrm.Page.data.entity.attributes.get("new_discount_amount").getValue() != null))
	{
		Xrm.Page.data.entity.attributes.get("new_discount").setValue(Xrm.Page.data.entity.attributes.get("new_discount_amount").getValue() / Xrm.Page.data.entity.attributes.get("extendedamount").getValue() * 100);
	}
	else 
	{
		Xrm.Page.data.entity.attributes.get("new_discount").setValue(null);
	}
}

function sl_ObshayaSumma()
{
	if ((Xrm.Page.data.entity.attributes.get("extendedamount").getValue() != null) && (Xrm.Page.data.entity.attributes.get("new_discount_amount").getValue() != null))
	{
		Xrm.Page.data.entity.attributes.get("new_total_amount").setValue(Xrm.Page.data.entity.attributes.get("extendedamount").getValue() - Xrm.Page.data.entity.attributes.get("new_discount_amount").getValue());
	}
	else 
	{
		Xrm.Page.data.entity.attributes.get("new_total_amount").setValue(null);
	}
}

function SetEuroToManat() {
    var europrice = GetFieldValue("new_europrice");
    var filter = "?$select=sl_RelevanceDate,sl_TransactionCurrencyId,sl_ExchangeRate&$orderby=sl_RelevanceDate desc";
    retrieveMultiplePaginal("sl_ExchangeRateSet", filter, function (data) {
        if (data && data.length > 0) {
            var courseeurotousa = 1;
            var coursemanattousa = 1;
            for (var i = 0; i < 3; i++) {
                var curency = data[i].sl_TransactionCurrencyId.Name;
                if (curency == "euro") {
                    courseeurotousa = parseFloat(data[i].sl_ExchangeRate);
                }
                if (curency == "manat") {
                    coursemanattousa = parseFloat(data[i].sl_ExchangeRate);
                }
            }
            //var usdprice=europrice*(1/courseeurotousa);
            //var manatprice=(1/coursemanattousa)*usdprice;
            var manatprice = (europrice / courseeurotousa) * coursemanattousa;
            SetFieldValue("new_usdprice", 0);
            SetFieldValue("new_zakupochnaya_zena", manatprice);
        }
    }, null, false);
}

function SetUsdToManat() {
    var usdprice = GetFieldValue("new_usdprice");
    var filter = "?$select=sl_RelevanceDate,sl_TransactionCurrencyId,sl_ExchangeRate&$orderby=sl_RelevanceDate desc";
    retrieveMultiplePaginal("sl_ExchangeRateSet", filter, function (data) {
        if (data && data.length > 0) {

            var coursemanattousa = 0;
            for (var i = 0; i < 3; i++) {
                var Day = new Date(parseInt(data[i].sl_RelevanceDate.replace("/Date(", "").replace(")/", "")));
                var curency = data[i].sl_TransactionCurrencyId.Name;
                if (curency == "manat") {
                    coursemanattousa = parseFloat(data[i].sl_ExchangeRate);
                }
            }
            var manatprice = coursemanattousa * usdprice;
            SetFieldValue("new_europrice", 0);
            SetFieldValue("new_zakupochnaya_zena", manatprice);
        }
    }, function (data, textStatus, XmlHttpRequest) {
        alert(XmlHttpRequest);
        alert(textStatus);
    }, false);
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}