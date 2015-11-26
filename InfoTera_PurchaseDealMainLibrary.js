//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.deliveryPayment();
    softline.setExchangerate();

    Xrm.Page.getAttribute('new_distances').addOnChange(softline.deliveryPayment);
    Xrm.Page.getAttribute('new_purchase_orderid').addOnChange(softline.prisePurchace);
    Xrm.Page.getAttribute('new_shipping_cost').addOnChange(softline.prisePurchace);
    Xrm.Page.getAttribute('createdon').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_supplier_warehouseid').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_supplier_elevatorid').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_ship_elevatorid').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_ship_portid').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_ship_terminalid').addOnChange(softline.yMapLoader);
}

softline.createContractButton = function () {
    var new_cropid = Xrm.Page.getAttribute('new_cropid').getValue();
    var new_contract_price = Xrm.Page.getAttribute('new_purchase_opport_price').getValue();
    var new_supplier_cityid = Xrm.Page.getAttribute('new_supplier_address_cityid').getValue();
    var new_supplier_areaid = Xrm.Page.getAttribute('new_supplier_address_areaid').getValue();
    var new_supplier_regionid = Xrm.Page.getAttribute('new_supplier_address_regionid').getValue();
    var new_supplierid = Xrm.Page.getAttribute('new_supplierid').getValue();
    var new_supplier_warehouseid = Xrm.Page.getAttribute('new_supplier_warehouseid').getValue();
    var new_supplier_elevatorid = Xrm.Page.getAttribute('new_supplier_elevatorid').getValue();
    var new_ship_basisid = Xrm.Page.getAttribute('new_ship_basisid').getValue();
    var new_volume = Xrm.Page.getAttribute('new_purchase_amount').getValue();
    var new_traderid = Xrm.Page.getAttribute('new_traderid').getValue();
    var new_portid = Xrm.Page.getAttribute('new_ship_portid').getValue();
    var new_terminalid = Xrm.Page.getAttribute('new_ship_terminalid').getValue();
    var new_elevatorid = Xrm.Page.getAttribute('new_ship_elevatorid').getValue();

    var entity = {};
    entity.new_cropid = { Id: new_cropid[0].id, LogicalName: new_cropid[0].entityType };
    entity.new_contract_price = { Value: new_contract_price.toString() };
    entity.new_supplier_cityid = { Id: new_supplier_cityid[0].id, LogicalName: new_supplier_cityid[0].entityType };
    entity.new_supplier_areaid = { Id: new_supplier_areaid[0].id, LogicalName: new_supplier_areaid[0].entityType };
    entity.new_supplier_regionid = { Id: new_supplier_regionid[0].id, LogicalName: new_supplier_regionid[0].entityType };
    entity.new_supplierid = { Id: new_supplierid[0].id, LogicalName: new_supplierid[0].entityType };
    entity.new_supplier_warehouseid = { Id: new_supplier_warehouseid[0].id, LogicalName: new_supplier_warehouseid[0].entityType };
    entity.new_supplier_elevatorid = { Id: new_supplier_elevatorid[0].id, LogicalName: new_supplier_elevatorid[0].entityType };
    entity.new_ship_basisid = { Id: new_ship_basisid[0].id, LogicalName: new_ship_basisid[0].entityType };
    entity.new_volume = new_volume;
    entity.new_traderid = { Id: new_traderid[0].id, LogicalName: new_traderid[0].entityType };
    entity.new_portid = { Id: new_portid[0].id, LogicalName: new_portid[0].entityType };
    entity.new_terminalid = { Id: new_terminalid[0].id, LogicalName: new_terminalid[0].entityType };
    entity.new_elevatorid = { Id: new_elevatorid[0].id, LogicalName: new_elevatorid[0].entityType };

    XrmServiceToolkit.Rest.Create(entity, "new_purchase_contractSet", function (result) {
        Xrm.Utility.openEntityForm("new_purchase_contract", result.new_purchase_contractId);
    },
        function (error) { console.log(error.message); }, false);
}

softline.setExchangerate = function () {
    //Учет текущего курса валюты при создании записи
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

softline.yMapLoader = function () {
    var checkpoint = [];

    var warehouse,
        elevator,
        port,
        terminal,
        shipelevator;

    warehouse = Xrm.Page.getAttribute('new_supplier_warehouseid') != null ? Xrm.Page.getAttribute('new_supplier_warehouseid').getValue() : null;
    elevator = Xrm.Page.getAttribute('new_supplier_elevatorid') != null ? Xrm.Page.getAttribute('new_supplier_elevatorid').getValue() : null;
    shipelevator = Xrm.Page.getAttribute('new_ship_elevatorid') != null ? Xrm.Page.getAttribute('new_ship_elevatorid').getValue() : null;
    port = Xrm.Page.getAttribute('new_ship_portid') != null ? Xrm.Page.getAttribute('new_ship_portid').getValue() : null;
    terminal = Xrm.Page.getAttribute('new_ship_terminalid') != null ? Xrm.Page.getAttribute('new_ship_terminalid').getValue() : null;

    if (warehouse != null) {
        XrmServiceToolkit.Rest.Retrieve(warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            //warehouse = data.new_cityid.Name.toString();
            checkpoint.push(data.new_cityid.Name.toString());
        }
    },
     function (error) {
         alert(error.message);
     }, false);

    }
    if (elevator != null) {
        XrmServiceToolkit.Rest.Retrieve(elevator[0].id, 'new_elevatorSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            //elevator = data.new_cityid.Name.toString();
            checkpoint.push(data.new_cityid.Name.toString());
        }
    },
     function (error) {
         alert(error.message);
     }, false);
    }
    if (shipelevator != null) {
        XrmServiceToolkit.Rest.Retrieve(shipelevator[0].id, 'new_elevatorSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            //shipelevator = data.new_cityid.Name.toString();
            checkpoint.push(data.new_cityid.Name.toString());
        }
    },
     function (error) {
         alert(error.message);
     }, false);
    }
    if (port != null) {
        XrmServiceToolkit.Rest.Retrieve(port[0].id, 'new_portSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            //port = data.new_cityid.Name.toString();
            checkpoint.push(data.new_cityid.Name.toString());
        }
    },
     function (error) {
         alert(error.message);
     }, false);
    }
    if (terminal != null) {
        XrmServiceToolkit.Rest.Retrieve(terminal[0].id, 'new_terminalSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            //terminal = data.new_cityid.Name.toString();
            checkpoint.push(data.new_cityid.Name.toString());
        }
    },
     function (error) {
         alert(error.message);
     }, false);
    }
    if (checkpoint.length != 0 && checkpoint.length != 1) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.field = 'new_distances';
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.point1 = checkpoint;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.init();
    }
    else {
        Xrm.Page.getAttribute('new_distances').setValue(0)
    }
}

softline.deliveryPayment = function () {
    if (Xrm.Page.getAttribute('new_distances').getValue() != null ||
    Xrm.Page.getAttribute('new_distances').getValue() != 0) {
        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '', function (data) {
            if (data.length != 0) {
                if (data[0].new_ton_km_cost != null) {
                    SetFieldValue('new_shipping_cost', data[0].new_ton_km_cost.Value * Xrm.Page.getAttribute('new_distances').getValue());
                }
            }
        },
                     function (error) {
                         alert(error.message);
                     },
                     function onComplete() {
                     }, false
                 );
    }
}

softline.prisePurchace = function () {
    if (Xrm.Page.getAttribute('new_purchase_orderid').getValue() != null &&
        Xrm.Page.getAttribute('new_shipping_cost').getValue() != null) {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('new_purchase_orderid').getValue()[0].id, 'new_purchase_orderSet', 'new_purchase_price', null,
            function (data) {
                if (data.new_purchase_price != null) {
                    SetFieldValue('new_purchase_opport_price', data.new_purchase_price.Value * Xrm.Page.getAttribute('new_shipping_cost').getValue());
                }
            },
             function (error) {
                 alert(error.message);
             }, false);
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