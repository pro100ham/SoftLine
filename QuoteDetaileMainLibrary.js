//----------------------------------------//
//---------�2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setAmount();
    softline.setManufacturer();
    softline.setExchangerate();
    softline.setZacup();
    softline.setZacupFromCuss();

    Xrm.Page.getAttribute('new_exchangerates').addOnChange(softline.setZacup);
    Xrm.Page.getAttribute('new_pricepurchaseusd').addOnChange(softline.setZacup);
    Xrm.Page.getAttribute('new_kursdate').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_viborkurs').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('productid').addOnChange(softline.setManufacturer);
    Xrm.Page.getAttribute('quantity').addOnChange(softline.setAmount);
    Xrm.Page.getAttribute('new_pricepurchaseusd').addOnChange(softline.setAmount);
    Xrm.Page.getAttribute('new_priceprocurementuah').addOnChange(softline.setAmount);
    Xrm.Page.getAttribute('new_pricepurchaseusd').addOnChange(softline.setZacupFromCuss);
    Xrm.Page.getAttribute('new_viborkurs').addOnChange(softline.setZacupFromCuss);
}

softline.setZacupFromCuss = function () {
    if (Xrm.Page.getAttribute('new_viborkurs').getValue() != null &&
        Xrm.Page.getAttribute('new_pricepurchaseusd').getValue() != null) {
        var status = Xrm.Page.getAttribute('new_viborkurs').getValue();
        var priseUSD = Xrm.Page.getAttribute('new_pricepurchaseusd').getValue();
        if (status == 100000000 || status == 100000001 || status == 100000002) {
            var curs = Xrm.Page.getAttribute('new_exchangerates').getValue();
            SetFieldValue('new_priceprocurementuah', priseUSD * curs);
        }
        else if (status == 100000003) {
            var curs = Xrm.Page.getAttribute('new_kursspeka').getValue();
            SetFieldValue('new_priceprocurementuah', priseUSD * curs);
        }
    }
}

softline.setZacup = function () {
    if (Xrm.Page.getAttribute('new_pricepurchaseusd').getValue() &&
            Xrm.Page.getAttribute('new_exchangerates').getValue()) {
        var currency = Xrm.Page.getAttribute('new_exchangerates').getValue();
        var priceUSD = Xrm.Page.getAttribute('new_pricepurchaseusd').getValue();
        Xrm.Page.getAttribute('new_priceprocurementuah').setValue(currency * priceUSD)
    }
    if (Xrm.Page.getAttribute('new_exchangerates').getValue() != null &&
         Xrm.Page.getAttribute('baseamount').getValue() != null) {
        var curs = Xrm.Page.getAttribute('new_exchangerates').getValue();
        var baseamount = Xrm.Page.getAttribute('baseamount').getValue();
        SetFieldValue("new_sellingusd", baseamount / curs);
    } else if (Xrm.Page.getAttribute('new_kursspeka').getValue() != null &&
                Xrm.Page.getAttribute('baseamount').getValue() != null) {
        var curs = Xrm.Page.getAttribute('new_kursspeka').getValue();
        var baseamount = Xrm.Page.getAttribute('baseamount').getValue();
        SetFieldValue("new_sellingusd", baseamount / curs);
    }
}

softline.setVisibleCurrency = function () {
    if (Xrm.Page.getAttribute('new_viborkurs') &&
        Xrm.Page.getAttribute('new_viborkurs').getValue() != null) {
        var status = Xrm.Page.getAttribute('new_viborkurs').getValue();
        switch (status) {
            case 100000000:
                Xrm.Page.ui.controls.get('new_nbu').setVisible(true);
                Xrm.Page.ui.controls.get('new_interbank').setVisible(false);
                Xrm.Page.ui.controls.get('new_exchangerates').setVisible(false);
                break;
            case 100000001:
                Xrm.Page.ui.controls.get('new_interbank').setVisible(true);
                Xrm.Page.ui.controls.get('new_nbu').setVisible(false);
                Xrm.Page.ui.controls.get('new_exchangerates').setVisible(false);
                break;
            case 100000002:
                Xrm.Page.ui.controls.get('new_exchangerates').setVisible(true);
                Xrm.Page.ui.controls.get('new_nbu').setVisible(false);
                Xrm.Page.ui.controls.get('new_interbank').setVisible(false);
                break;
            default:
                Xrm.Page.ui.controls.get('new_nbu').setVisible(false);
                Xrm.Page.ui.controls.get('new_interbank').setVisible(false);
                Xrm.Page.ui.controls.get('new_exchangerates').setVisible(false);
                break;
        }
    }
    else {
        Xrm.Page.ui.controls.get('new_nbu').setVisible(false);
        Xrm.Page.ui.controls.get('new_interbank').setVisible(false);
        Xrm.Page.ui.controls.get('new_exchangerates').setVisible(false);
    }
}

softline.setExchangerate = function () {
    //���� �������� ����� ������ ��� �������� ������ ��
    if (Xrm.Page.getAttribute('new_kursdate').getValue()) {
        var date = Xrm.Page.getAttribute('new_kursdate').getValue();
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
                    //"<condition attribute='statecode' operator='eq' value='0' />" +
                    "<condition attribute='createdon' operator='on' value='" + date.yyyymmdd() + "' />" +
                    "<condition attribute='transactioncurrencyid' operator='eq' value='" + currencyId[0].id + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";
        var currencyOnDate = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currencyOnDate.length == 0) return;
        if (Xrm.Page.getAttribute('new_viborkurs') &&
        Xrm.Page.getAttribute('new_viborkurs').getValue() != null) {
            var status = Xrm.Page.getAttribute('new_viborkurs').getValue();
            if (status == 100000001) {
                SetFieldValue('new_exchangerates', currencyOnDate[0].attributes.new_megbank.value);
            }
            else if (status == 100000000) {
                SetFieldValue('new_exchangerates', currencyOnDate[0].attributes.new_nbu.value);
            }
            else {
                SetFieldValue('new_exchangerates', 0);
            }
        }
    }
}

softline.setManufacturer = function () {
    if (Xrm.Page.getAttribute('productid').getValue() &&
        Xrm.Page.getAttribute('new_manufacturer').getValue() == null) {
        var product = Xrm.Page.getAttribute('productid').getValue();
        XrmServiceToolkit.Rest.Retrieve(product[0].id,
            'ProductSet',
            'new_manufacturer, Price_Base',
                            null,
                function (prod) {
                    Xrm.Page.getAttribute('new_manufacturer').setValue([{ id: prod.new_manufacturer.Id, name: prod.new_manufacturer.Name, entityType: prod.new_manufacturer.LogicalName }])
                    var quanty = Xrm.Page.getAttribute('quantity').getValue();
                    if (prod.Price_Base != null) {
                        var quanty = Xrm.Page.getAttribute('quantity').getValue();
                        if (Xrm.Page.getAttribute("new_pricepurchaseusd").getValue() == null) {
                            Xrm.Page.getAttribute('new_pricepurchaseusd').setValue(parseFloat(prod.Price_Base.Value));
                        }
                        if (Xrm.Page.getAttribute("new_totalpurchaseusd").getValue() == null) {
                            Xrm.Page.getAttribute('new_totalpurchaseusd').setValue(parseFloat(prod.Price_Base.Value) * quanty);
                        }
                    }
                },
                function (error) {
                    console.log("in error handler");
                    console.log(error.message);
                }, true);

    }
}

softline.setAmount = function () {
    //������� �������� ����� �� �������� ��� ��
    var quantity;
    if (Xrm.Page.getAttribute("quantity").getValue()) {
        quantity = Xrm.Page.getAttribute("quantity").getValue()
    }
    else {
        return;
    }
    if (Xrm.Page.getAttribute("new_pricepurchaseusd").getValue()) {
        var priceUSD = Xrm.Page.getAttribute("new_pricepurchaseusd").getValue();
        SetFieldValue("new_totalpurchaseusd", priceUSD * quantity);
    }
    if (Xrm.Page.getAttribute("new_priceprocurementuah").getValue()) {
        var priceUAH = Xrm.Page.getAttribute("new_priceprocurementuah").getValue();
        SetFieldValue("new_totalpurchaseuah", priceUAH * quantity);
    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}