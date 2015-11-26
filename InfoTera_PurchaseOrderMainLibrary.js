//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setExchangerate();
    softline.counterChangePriceEntity();
    softline.createFullName();
    softline.deliveryPayment();

    Xrm.Page.getAttribute('new_offerid').addOnChange(softline.getValueFromOpp);
    Xrm.Page.getAttribute('new_cropid').addOnChange(softline.createFullName);
    Xrm.Page.getAttribute('new_volume').addOnChange(softline.createFullName);
    Xrm.Page.getAttribute('new_portid').addOnChange(softline.createFullName);
    Xrm.Page.getAttribute('createdon').addOnChange(softline.setExchangerate);
}

softline.createChangeOrder = function () {
    var price = Xrm.Page.getAttribute('new_purchase_price').getValue() == null ? 0.00 : Xrm.Page.getAttribute('new_purchase_price').getValue();
    var volume = Xrm.Page.getAttribute('new_volume').getValue();
    var of = Xrm.Page.getAttribute('new_purchase_period').getValue();
    var to = Xrm.Page.getAttribute('new_period_to_purchase').getValue();
    var entity = {};
    entity.new_purchase_price = { Value: price.toString() };
    entity.new_volume = volume;
    entity.new_purchase_period_of = new Date(of.setHours(2));
    entity.new_purchase_period_to = new Date(to.setHours(2));
    entity.new_purchase_order = { Id: Xrm.Page.data.entity.getId(), LogicalName: Xrm.Page.data.entity.getEntityName() };
    XrmServiceToolkit.Rest.Create(entity, "new_purchase_order_changeSet", function (result) {
        Xrm.Utility.openEntityForm("new_purchase_order_change", result.new_purchase_order_changeId);
    },
        function (error) { console.log(error.message); }, false);
}

softline.getValueFromOpp = function () {
    if (Xrm.Page.getAttribute('new_offerid') != null &&
        Xrm.Page.getAttribute('new_offerid').getValue() != null) {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('new_offerid').getValue()[0].id, "OpportunitySet", "CustomerId,new_volume,new_ship_basisid,new_sale_price,new_purchase_price_usd,new_port,new_terminal,new_elevatorid,new_sale_period_from,new_sale_period_till",
                            null,
                function (_listOfFields) {
                    if (_listOfFields.CustomerId && _listOfFields.CustomerId.Id) {
                        SetFieldValue("new_purchaserid", [{ id: _listOfFields.CustomerId.Id, entityType: _listOfFields.CustomerId.LogicalName, name: _listOfFields.CustomerId.Name }]);
                    }
                    if (_listOfFields.new_volume) {
                        SetFieldValue('new_volume', _listOfFields.new_volume);
                    }                
                    if (_listOfFields.new_ship_basisid && _listOfFields.new_ship_basisid.Id) {
                        SetFieldValue('new_delivery_basisid', [{ id: _listOfFields.new_ship_basisid.Id, entityType: _listOfFields.new_ship_basisid.LogicalName, name: _listOfFields.new_ship_basisid.Name }]);
                    }                
                    if (_listOfFields.new_sale_price && _listOfFields.new_sale_price.Value) {
                        SetFieldValue("new_purchase_price", _listOfFields.new_sale_price.Value);
                    }                
                    if (_listOfFields.new_purchase_price_usd) {
                        SetFieldValue("new_recom_price_usd", _listOfFields.new_purchase_price_usd);
                    }                
                    if (_listOfFields.new_port && _listOfFields.new_port.Id) {
                        SetFieldValue("new_portid", [{ id: _listOfFields.new_port.Id, entityType: _listOfFields.new_port.LogicalName, name: _listOfFields.new_port.Name }]);
                    }                
                    if (_listOfFields.new_terminal && _listOfFields.new_terminal.Id) {
                        SetFieldValue("new_terminalid", [{ id: _listOfFields.new_terminal.Id, entityType: _listOfFields.new_terminal.LogicalName, name: _listOfFields.new_terminal.Name }]);
                    }                
                    if (_listOfFields.new_elevatorid && _listOfFields.new_elevatorid.Id) {
                        SetFieldValue("new_elevatorid", [{ id: _listOfFields.new_elevatorid.Id, entityType: _listOfFields.new_elevatorid.LogicalName, name: _listOfFields.new_elevatorid.Name }]);
                    }                                                     
                    if (_listOfFields.new_sale_period_from) {
                        SetFieldValue("new_purchase_period", _listOfFields.new_sale_period_from);
                    }                                                     
                    if (_listOfFields.new_sale_period_till) {
                        SetFieldValue("new_period_to_purchase", _listOfFields.new_sale_period_till);
                    }                
                },
    function (error) {
        console.log("in error handler");
        console.log(error.message);
    }, true);
    }
}

softline.setExchangerate = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var date = Xrm.Page.getAttribute('createdon').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                      "<entity name='new_currency_rate'>" +
                        "<attribute name='createdon' />" +
                        "<attribute name='new_rub' />" +
                        "<attribute name='new_euro' />" +
                        "<attribute name='new_usdollar' />" +
                        "<attribute name='new_currency_rateid' />" +
                        "<order attribute='createdon' descending='true' />" +
                            "<filter type='and'>" +
                              "<condition attribute='createdon' operator='on-or-before' value='" + date.format("yyyy-MM-dd") + "' />" +
                            "</filter>" +
                      "</entity>" +
                    "</fetch>";
        var currency = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currency.length == 0) return;
        if (Xrm.Page.getAttribute('new_usd_rate') && currency[0].attributes.new_usdollar != null) {
            SetFieldValue('new_usd_rate', currency[0].attributes.new_usdollar.value);
        }
    }
}

softline.deliveryPayment = function () {
    if (Xrm.Page.getAttribute('new_delivery_basisid').getValue() == null /*||
        Xrm.Page.getAttribute('new_uom').getValue() == null*/) {
        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '', function (data) {
            if (data.length != 0) {
                if(data[0].new_ship_basisid && data[0].new_ship_basisid.Id)
                    SetFieldValue('new_delivery_basisid', [{ id: data[0].new_ship_basisid.Id, entityType: data[0].new_ship_basisid.LogicalName, name: data[0].new_ship_basisid.Name }]);
               // if (data[0].new_measure_unitid && data[0].new_measure_unitid.Id)
                //SetFieldValue('new_uom', [{ id: data[0].new_measure_unitid.Id, entityType: data[0].new_measure_unitid.LogicalName, name: data[0].new_measure_unitid.Name }]);
            }
        },
                     function (error) { alert(error.message); }, function onComplete() { }, false);
    }
}

softline.counterChangePriceEntity = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var recordId = Xrm.Page.data.entity.getId();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true' >" +
                    "<entity name='new_purchase_order_change' >" +
                        "<attribute name='new_purchase_order_changeid' alias='count' aggregate='count' />" +
                        "<filter type='and' >" +
                            "<condition attribute='new_purchase_order' operator='eq' uiname='' uitype='new_purchase_order' value='" + recordId + "' />" +
                        "</filter>" +
                    "</entity>" +
                "</fetch>";

        var countEntity = XrmServiceToolkit.Soap.Fetch(fetch);
        if (countEntity.length != 0) {
            SetFieldValue('new_quantity_modified', countEntity[0].attributes.count.value);
        }
    }
}

softline.createFullName = function () {
    if (Xrm.Page.getAttribute('new_cropid').getValue() != null &&
       Xrm.Page.getAttribute('new_volume').getValue() != null &&
       Xrm.Page.getAttribute('new_portid').getValue() != null) {

        SetFieldValue('new_name', Xrm.Page.getAttribute('new_cropid').getValue()[0].name + "," +
                                    Xrm.Page.getAttribute('new_volume').getValue() + "," +
                                    Xrm.Page.getAttribute('new_portid').getValue()[0].name);
    }
}

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