//----------------------------------------//
//---------©2014 SoftLine Ukraine---------//
//----------------------------------------//

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.SetParametersFromProduct();

    Xrm.Page.getAttribute('productid').addOnChange(softline.SetParametersFromProduct);
    Xrm.Page.getAttribute('new_usdprice').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('quantity').addOnChange(softline.SetTotalpurchase);
    //Xrm.Page.getAttribute('new_koef').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_sellingusd').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_exchangerate').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_kursdate').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('transactioncurrencyid').addOnChange(softline.setExchangerate);
}

softline.setExchangerate = function () {
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

softline.SetParametersFromProduct = function () {
    if (Xrm.Page.getAttribute('productid').getValue()) {
        var product = Xrm.Page.getAttribute('productid').getValue()[0];

        XrmServiceToolkit.Rest.Retrieve(product.id, "ProductSet", null, null, function (data) {
            if (Xrm.Page.getAttribute('new_manufacturingname').getValue() == null && data.new_manufacturingname.Id) {
                Xrm.Page.getAttribute('new_manufacturingname').setValue([{ id: data.new_manufacturingname.Id, entityType: data.new_manufacturingname.LogicalName, name: data.new_manufacturingname.Name }]);
            }
            if (Xrm.Page.getAttribute('new_producttypecode').getValue() == null && data.ProductTypeCode) {
                Xrm.Page.getAttribute('new_producttypecode').setValue(data.ProductTypeCode.Value);
            }
            if (Xrm.Page.getAttribute('new_sku').getValue() == null && data.ProductNumber) {
                Xrm.Page.getAttribute('new_sku').setValue(data.ProductNumber);
            }
            //if (!Xrm.Page.getAttribute('new_usdprice').getValue() && data.StandardCost) {
            //    Xrm.Page.getAttribute('new_usdprice').setValue(parseFloat(data.StandardCost.Value));
            //}
        },
                function (error) {
                    equal(true, false, error.message);
                },
                false
            );
    }
}

softline.SetTotalpurchase = function () {
    /*if (Xrm.Page.getAttribute('new_usdprice').getValue() != null &&
        Xrm.Page.getAttribute('new_koef').getValue() != null) {
        SetFieldValue('new_sellingusd', Xrm.Page.getAttribute('new_koef').getValue() * Xrm.Page.getAttribute('new_usdprice').getValue());
    }
    else {
        SetFieldValue('new_sellingusd', 0);
    }*/
    if (Xrm.Page.getAttribute('new_sellingusd').getValue() != null &&
        Xrm.Page.getAttribute('new_exchangerate').getValue() != null) {
        SetFieldValue('priceperunit', Xrm.Page.getAttribute('new_sellingusd').getValue() * Xrm.Page.getAttribute('new_exchangerate').getValue());
    }
    else {
        SetFieldValue('priceperunit', 0);
    }
    if (Xrm.Page.getAttribute('quantity').getValue() != null) {
        if (Xrm.Page.getAttribute('new_usdprice').getValue() != null) {
            SetFieldValue('new_totalpurchaseusd', Xrm.Page.getAttribute('quantity').getValue() * Xrm.Page.getAttribute('new_usdprice').getValue());
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

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

var retrieveDetails = function (id) {
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
