//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    Xrm.Page.getAttribute('new_warehouse').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_elevator_purchase').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_port').addOnChange(softline.yMapLoader);
    Xrm.Page.getAttribute('new_terminal').addOnChange(softline.yMapLoader);
}

softline.yMapLoader = function () {
    var checkpoint = [];

    var warehouse,
        elevator,
        port,
        terminal;

    warehouse = Xrm.Page.getAttribute('new_warehouse').getValue();
    elevator = Xrm.Page.getAttribute('new_elevator_purchase').getValue();
    port = Xrm.Page.getAttribute('new_port').getValue();
    terminal = Xrm.Page.getAttribute('new_terminal').getValue();

    if (warehouse != null) {
        XrmServiceToolkit.Rest.Retrieve(warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
    function (data) {
        if (data.new_cityid != null && data.new_cityid.Name != null) {
            warehouse = data.new_cityid.Name.toString();
            checkpoint.push(warehouse);
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
            elevator = data.new_cityid.Name.toString();
            checkpoint.push(elevator);
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
            port = data.new_cityid.Name.toString();
            checkpoint.push(port);
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
            terminal = data.new_cityid.Name.toString();
            checkpoint.push(terminal);
        }
    },
     function (error) {
         alert(error.message);
     }, false);
    }
    if (checkpoint.length != 0 && checkpoint.length != 1) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.field = 'new_distance';
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.point1 = checkpoint;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.init();
    }
    else {
        Xrm.Page.getAttribute('new_distance').setValue(0)
    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}