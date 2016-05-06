//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

var shippingMethod = {
    railroad: 100000001,
    auto: 100000000
};


softline.onLoad = function () {
    Xrm.Page.getAttribute('new_terminal_odesaid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_terminal_mykolaivid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_warehouse').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_elevator').addOnChange(softline.distance);

    Xrm.Page.getAttribute('new_supplierid').addOnChange(softline.getInfoFromAccount);

    Xrm.Page.getAttribute('new_distance_mykolaiv').addOnChange(softline.deliveryPaymentN);
    Xrm.Page.getAttribute('new_rail_shipment_cost_mykolaiv').addOnChange(softline.deliveryPaymentN);
    Xrm.Page.getAttribute('new_distance_odesa').addOnChange(softline.deliveryPaymentO);
    Xrm.Page.getAttribute('new_rail_shipment_cost_odesa').addOnChange(softline.deliveryPaymentO);

    Xrm.Page.getAttribute('new_urchase_method').addOnChange(softline.CanculateAuto);
    Xrm.Page.getAttribute('new_distance_mykolaiv').addOnChange(softline.CanculateAuto);
    Xrm.Page.getAttribute('new_distance_odesa').addOnChange(softline.CanculateAuto);

    Xrm.Page.getAttribute('new_offer_status').addOnChange(softline.CreateDealMethods);

    softline.railRoadPricing();
    Xrm.Page.getAttribute('new_urchase_method').addOnChange(softline.railRoadPricing);
    Xrm.Page.getAttribute('new_elevator').addOnChange(softline.railRoadPricing);

    softline.setShippingCostIfRailroad();
    Xrm.Page.getAttribute('new_urchase_method').addOnChange(softline.setShippingCostIfRailroad);
    Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').addOnChange(softline.setShippingCostIfRailroad);
    Xrm.Page.getAttribute('new_rail_shipment_cost_mykolaiv').addOnChange(softline.setShippingCostIfRailroad);
    Xrm.Page.getAttribute('new_rail_shipment_cost_odesa').addOnChange(softline.setShippingCostIfRailroad);

    softline.purchasePriceMykolaiv();
    softline.purchasePriceOdesa();
    Xrm.Page.getAttribute('new_recom_price_mykolaiv').addOnChange(softline.purchasePriceMykolaiv);
    Xrm.Page.getAttribute('new_ship_cost_mykolaiv').addOnChange(softline.purchasePriceMykolaiv);
    Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').addOnChange(softline.purchasePriceMykolaiv);
    Xrm.Page.getAttribute('new_rail_shipment_cost_mykolaiv').addOnChange(softline.purchasePriceMykolaiv);

    Xrm.Page.getAttribute('new_recom_price_odesa').addOnChange(softline.purchasePriceOdesa);
    Xrm.Page.getAttribute('new_ship_cost_odesa').addOnChange(softline.purchasePriceOdesa);
    Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').addOnChange(softline.purchasePriceOdesa);
    Xrm.Page.getAttribute('new_rail_shipment_cost_odesa').addOnChange(softline.purchasePriceOdesa);

    Xrm.Page.getAttribute('new_personal_taskid').addOnChange(softline.getPersonalTaskInfo);

}

softline.CanculateAuto = function () {
    if (GetFieldValue("new_urchase_method") == 100000000) {
        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet',
            '',
            function (data) {
                if (data.length != 0) {
                    if (data[0].new_ton_km_cost != null) {
                        if (GetFieldValue("new_distance_mykolaiv") != null ||
                            GetFieldValue("new_distance_mykolaiv") != 0) {
                            SetFieldValue('new_ship_cost_mykolaiv', data[0].new_ton_km_cost.Value * Xrm.Page.getAttribute('new_distance_mykolaiv').getValue());
                        }
                        if (GetFieldValue("new_distance_odesa") != null ||
                            GetFieldValue("new_distance_odesa") != 0) {
                            SetFieldValue('new_ship_cost_odesa', data[0].new_ton_km_cost.Value * Xrm.Page.getAttribute('new_distance_odesa').getValue());
                        }
                    }
                }
            },
                     function (error) {
                         console.log(error.message);
                     },
                     function onComplete() {
                     }, false
                 );
    }
}

softline.CreateDealMethods = function () {
    var timeZone = -(new Date().getTimezoneOffset() / 60);

    var ship_from = GetFieldValue('new_period_ship_from');
    var ship_to = GetFieldValue('new_period_ship_to');
    var purchase_of = GetFieldValue('new_purchase_period_of');
    var purchase_to = GetFieldValue('new_purchase_period_to');

    if ((GetFieldValue("new_supplier_price_mykolaiv") != null &&
        GetFieldValue("new_purch_price_mykolaiv") != null) &&
        GetFieldValue("new_offer_status") == 100000001 &&
        GetFieldValue("new_supplier_price_mykolaiv") != 0) {

        if (!(ship_to <= purchase_to) ||
      !(ship_to >= purchase_of)) {
            Xrm.Page.getControl("new_purchase_period_of").setNotification("Картка угоди закупівлі не може бути створена! Дата відвантаження ДО раніша ніж Дата закупівлі ВІД!.");
            Xrm.Page.getControl("new_purchase_period_to").setNotification("Картка угоди закупівлі не може бути створена! Дата відвантаження ДО пізніша ніж Дата закупівлі ДО!.");
            SetFieldValue("new_offer_status", 100000000);
            return;
        }

        var supplierN = GetFieldValue("new_supplier_price_mykolaiv");
        var puchasN = GetFieldValue("new_purch_price_mykolaiv");
        if (supplierN <= puchasN) {
            XrmServiceToolkit.Rest.RetrieveMultiple("new_portSet", null, function (data) {
                var entity = {};
                entity.new_purchase_offerid = { Id: Xrm.Page.data.entity.getId(), LogicalName: Xrm.Page.data.entity.getEntityName() };
                if (GetFieldValue("new_crop") != null)
                    entity.new_cropid = { Id: GetFieldValue("new_crop")[0].id, LogicalName: GetFieldValue("new_crop")[0].typename };
                if (GetFieldValue("new_city") != null)
                    entity.new_supplier_address_cityid = { Id: GetFieldValue("new_city")[0].id, LogicalName: GetFieldValue("new_city")[0].typename };
                if (GetFieldValue("new_area") != null)
                    entity.new_supplier_address_areaid = { Id: GetFieldValue("new_area")[0].id, LogicalName: GetFieldValue("new_area")[0].typename };
                if (GetFieldValue("new_region") != null)
                    entity.new_supplier_address_regionid = { Id: GetFieldValue("new_region")[0].id, LogicalName: GetFieldValue("new_region")[0].typename };
                if (GetFieldValue("new_supplierid") != null)
                    entity.new_supplierid = { Id: GetFieldValue("new_supplierid")[0].id, LogicalName: GetFieldValue("new_supplierid")[0].typename };
                if (GetFieldValue("new_warehouse") != null)
                    entity.new_supplier_warehouseid = { Id: GetFieldValue("new_warehouse")[0].id, LogicalName: GetFieldValue("new_warehouse")[0].typename };
                if (GetFieldValue("new_elevator") != null)
                    entity.new_supplier_elevatorid = { Id: GetFieldValue("new_elevator")[0].id, LogicalName: GetFieldValue("new_elevator")[0].typename };
                if (GetFieldValue("new_delivery_basis") != null)
                    entity.new_ship_basisid = { Id: GetFieldValue("new_delivery_basis")[0].id, LogicalName: GetFieldValue("new_delivery_basis")[0].typename };
                if (GetFieldValue("new_urchase_method") != null)
                    entity.new_shipping_method = { Value: GetFieldValue("new_urchase_method") };
                if (GetFieldValue("new_supplier_volume_mykolaiv") != null)
                    entity.new_purchase_amount = GetFieldValue("new_supplier_volume_mykolaiv");
                if (puchasN != null)
                    entity.new_purchase_price = { Value: puchasN.toString() };
                if (supplierN != null)
                    entity.new_purchase_opport_price = { Value: supplierN.toString() };

                if (GetFieldValue("new_recom_price_mykolaiv") != null)
                    entity.new_recommended_price = { Value: GetFieldValue("new_recom_price_mykolaiv").toString() };

                if (GetFieldValue("new_personal_taskid") != null)
                    entity.new_purchase_task = { Id: GetFieldValue("new_personal_taskid")[0].id, LogicalName: GetFieldValue("new_personal_taskid")[0].typename };

                if (GetFieldValue("new_purchase_period_of") != null) {
                    var of = GetFieldValue("new_purchase_period_of");
                    of.setHours(timeZone);
                    entity.new_purchase_term_from = of;
                } else {
                    Xrm.Page.getControl("new_purchase_period_of").setNotification("Вкажіть дату");
                    return;
                }

                if (GetFieldValue("new_purchase_period_to") != null) {
                    var to = GetFieldValue("new_purchase_period_to");
                    to.setHours(timeZone);
                    entity.new_purchase_term_till = to;
                } else {
                    Xrm.Page.getControl("new_purchase_period_to").setNotification("Вкажіть дату");
                    return;
                }

                if (data != null && data.length != 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_cityid != null && data[i].new_name == "Миколаїв")
                            entity.new_ship_portid = { Id: data[i].new_portId, LogicalName: 'new_port' };
                    }
                }

                entity.new_distances = Xrm.Page.getAttribute('new_distance_mykolaiv').getValue();

                XrmServiceToolkit.Rest.Create(entity,
                    "new_purchase_dealSet",
                    function (result) {
                        var reletivePath = "/userdefined/edit.aspx?etc=10021";
                        reletivePath = reletivePath + "&id=";
                        var windowName = "_blank";
                        var serverUrl = Xrm.Page.context.getClientUrl();
                        if (serverUrl != null && serverUrl != "" && result.new_purchase_dealId.replace("{", "").replace("}", "") != null) {
                            serverUrl = serverUrl + reletivePath;
                            serverUrl = serverUrl + result.new_purchase_dealId.replace("{", "").replace("}", "");
                            window.open(serverUrl);
                        }
                    },
                    function (error) { console.log(error.message); },
                    false);
            }, function (error) {
                console.log("in error handler");
                console.log(error.message);
            }, function () { }, false);
        }
        else {
            alert("Ціна постачальника Миколаїв вища за ціну закупівлі Миколаїв. Картка угоди не може бути створеною.");
        }
    }
    if (GetFieldValue("new_supplier_price_odesa") != null &&
        GetFieldValue("new_purch_price_odesa") != null &&
        GetFieldValue("new_offer_status") == 100000001 &&
        GetFieldValue("new_supplier_price_odesa") != 0) {

        if (!(ship_to <= purchase_to) ||
            !(ship_to >= purchase_of)) {
            Xrm.Page.getControl("new_purchase_period_of").setNotification("Картка угоди закупівлі не може бути створена! Дата відвантаження ДО раніша ніж Дата закупівлі ВІД!.");
            Xrm.Page.getControl("new_purchase_period_to").setNotification("Картка угоди закупівлі не може бути створена! Дата відвантаження ДО пізніша ніж Дата закупівлі ДО!.");
            SetFieldValue("new_offer_status", 100000000);
            return;
        }

        var supplierO = GetFieldValue("new_supplier_price_odesa");
        var puchaseO = GetFieldValue("new_purch_price_odesa");
        if (supplierO <= puchaseO) {
            XrmServiceToolkit.Rest.RetrieveMultiple("new_portSet", null, function (data) {
                var entity = {};
                entity.new_purchase_offerid = { Id: Xrm.Page.data.entity.getId(), LogicalName: Xrm.Page.data.entity.getEntityName() };
                if (GetFieldValue("new_crop") != null)
                    entity.new_cropid = { Id: GetFieldValue("new_crop")[0].id, LogicalName: GetFieldValue("new_crop")[0].typename };
                if (GetFieldValue("new_city") != null)
                    entity.new_supplier_address_cityid = { Id: GetFieldValue("new_city")[0].id, LogicalName: GetFieldValue("new_city")[0].typename };
                if (GetFieldValue("new_area") != null)
                    entity.new_supplier_address_areaid = { Id: GetFieldValue("new_area")[0].id, LogicalName: GetFieldValue("new_area")[0].typename };
                if (GetFieldValue("new_region") != null)
                    entity.new_supplier_address_regionid = { Id: GetFieldValue("new_region")[0].id, LogicalName: GetFieldValue("new_region")[0].typename };
                if (GetFieldValue("new_supplierid") != null)
                    entity.new_supplierid = { Id: GetFieldValue("new_supplierid")[0].id, LogicalName: GetFieldValue("new_supplierid")[0].typename };
                if (GetFieldValue("new_warehouse") != null)
                    entity.new_supplier_warehouseid = { Id: GetFieldValue("new_warehouse")[0].id, LogicalName: GetFieldValue("new_warehouse")[0].typename };
                if (GetFieldValue("new_elevator") != null)
                    entity.new_supplier_elevatorid = { Id: GetFieldValue("new_elevator")[0].id, LogicalName: GetFieldValue("new_elevator")[0].typename };
                if (GetFieldValue("new_delivery_basis") != null)
                    entity.new_ship_basisid = { Id: GetFieldValue("new_delivery_basis")[0].id, LogicalName: GetFieldValue("new_delivery_basis")[0].typename };
                if (GetFieldValue("new_urchase_method") != null)
                    entity.new_shipping_method = { Value: GetFieldValue("new_urchase_method") };
                if (GetFieldValue("new_supplier_volume_odesa") != null)
                    entity.new_purchase_amount = GetFieldValue("new_supplier_volume_odesa");
                if (supplierO != null)
                    entity.new_purchase_opport_price = { Value: supplierO.toString() };
                if (puchaseO != null)
                    entity.new_purchase_price = { Value: puchaseO.toString() };
                if (GetFieldValue("new_recom_price_odesa") != null)
                    entity.new_recommended_price = { Value: GetFieldValue("new_recom_price_odesa").toString() };

                if (GetFieldValue("new_personal_taskid") != null)
                    entity.new_purchase_task = { Id: GetFieldValue("new_personal_taskid")[0].id, LogicalName: GetFieldValue("new_personal_taskid")[0].typename };

                if (GetFieldValue("new_purchase_period_of") != null) {
                    var of = GetFieldValue("new_purchase_period_of");
                    of.setHours(timeZone);
                    entity.new_purchase_term_from = of;
                } else {
                    Xrm.Page.getControl("new_purchase_period_of").setNotification("Вкажіть дату");
                    return;
                }

                if (GetFieldValue("new_purchase_period_to") != null) {
                    var to = GetFieldValue("new_purchase_period_to");
                    to.setHours(timeZone);
                    entity.new_purchase_term_till = to;
                } else {
                    Xrm.Page.getControl("new_purchase_period_to").setNotification("Вкажіть дату");
                    return;
                }

                if (data != null && data.length != 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_cityid != null && data[i].new_name == "Одеса")
                            entity.new_ship_portid = { Id: data[i].new_portId, LogicalName: 'new_port' };
                    }
                }

                entity.new_distances = Xrm.Page.getAttribute('new_distance_odesa').getValue();

                XrmServiceToolkit.Rest.Create(entity,
                    "new_purchase_dealSet",
                    function (result) {
                        var reletivePath = "/userdefined/edit.aspx?etc=10021";
                        reletivePath = reletivePath + "&id=";
                        var windowName = "_blank";
                        var serverUrl = Xrm.Page.context.getClientUrl();
                        if (serverUrl != null && serverUrl != "" && result.new_purchase_dealId.replace("{", "").replace("}", "") != null) {
                            serverUrl = serverUrl + reletivePath;
                            serverUrl = serverUrl + result.new_purchase_dealId.replace("{", "").replace("}", "");
                            window.open(serverUrl);
                        }
                    },
                    function (error) { console.log(error.message); },
                    false);
            }, function (error) {
                console.log("in error handler");
                console.log(error.message);
            }, function () { }, false);
        }
        else {
            alert("Ціна постачальника Одеса вища за ціну закупівлі Одеса. Картка угоди не може бути створеною.");
        }
    }
}

softline.getInfoFromAccount = function () {
    if (Xrm.Page.getAttribute('new_supplierid') != null &&
        Xrm.Page.getAttribute('new_supplierid').getValue() != null &&
        Xrm.Page.getAttribute('new_supplierid').getValue()[0].typename == "account") {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('new_supplierid').getValue()[0].id, "AccountSet", "Address2_Line1,new_city_postalid,new_postal_areaID,new_region_postalid,PrimaryContactId,Telephone1",
                            null,
                function (_listOfFields) {
                    if (_listOfFields.new_city_postalid) {
                        SetFieldValue("new_city", [{ id: _listOfFields.new_city_postalid.Id, entityType: _listOfFields.new_city_postalid.LogicalName, name: _listOfFields.new_city_postalid.Name }]);
                    }
                    if (_listOfFields.new_region_postalid) {
                        SetFieldValue('new_region', [{ id: _listOfFields.new_region_postalid.Id, entityType: _listOfFields.new_region_postalid.LogicalName, name: _listOfFields.new_region_postalid.Name }]);
                    }
                    if (_listOfFields.new_postal_areaID) {
                        SetFieldValue('new_area', [{ id: _listOfFields.new_postal_areaID.Id, entityType: _listOfFields.new_postal_areaID.LogicalName, name: _listOfFields.new_postal_areaID.Name }]);
                    }
                    if (_listOfFields.Address2_Line1) {//text
                        SetFieldValue("new_address_street", _listOfFields.Address2_Line1);
                    }
                    if (_listOfFields.PrimaryContactId) {
                        SetFieldValue("new_contactid", [{ id: _listOfFields.PrimaryContactId.Id, entityType: _listOfFields.PrimaryContactId.LogicalName, name: _listOfFields.PrimaryContactId.Name }]);
                    }
                    if (_listOfFields.Telephone1) {
                        SetFieldValue("phonenumber", _listOfFields.Telephone1);
                    }
                },
    function (error) {
        console.log("in error handler");
        console.log(error.message);
    }, true);
    }
    else if (Xrm.Page.getAttribute('new_supplierid') == null &&
        Xrm.Page.getAttribute('new_supplierid').getValue() == null) {
        SetFieldValue("phonenumber", "");
        SetFieldValue("new_contactid", null);
        SetFieldValue("new_address_street", "");
        SetFieldValue('new_area', null);
        SetFieldValue('new_region', null);
        SetFieldValue("new_city", null);
    }
}

softline.getPersonalTaskInfo = function () {
    if (GetFieldValue("new_personal_taskid") != null) {
        var pt = GetFieldValue("new_personal_taskid");
        XrmServiceToolkit.Rest.Retrieve(pt[0].id, pt[0].entityType + 'Set', 'new_purchase_period_of,new_purchase_period_to', null,
            function (data) {
                SetFieldValue("new_purchase_period_of", data.new_purchase_period_of);
                SetFieldValue("new_purchase_period_to", data.new_purchase_period_to);
            },
        function (error) {
            console.log(error.message);
        }, false);
    } else {
        SetFieldValue("new_purchase_period_of", null);
        SetFieldValue("new_purchase_period_to", null);
    }
}








////////////////
/* MAP STUFF */
////////////////
var retrieveAbstraction = function (id, entityName) {
    var city_name = undefined;

    XrmServiceToolkit.Rest.Retrieve(
        id, entityName, 'new_cityid, new_regionid', null,
        function (data) {
            if (data.new_cityid != null && data.new_cityid.Name != null) {
                city_name = data.new_cityid.Name.toString();
            }
            if (data.new_regionid && data.new_regionid.Name) {
                city_name = data.new_regionid.Name + ' область, ' + city_name;
            }
        },
        function (error) {
            console.log(error.message);
        }, false);

    return city_name;
};

var retrieveTerminalCity = function (terminalId) {
    return retrieveAbstraction(terminalId, 'new_terminalSet');
};

var retrieveWarehouseCity = function (warehouseId) {
    return retrieveAbstraction(warehouseId, 'new_warehouseSet');
};

var retrieveElevatorCity = function (elevatorId) {
    return retrieveAbstraction(elevatorId, 'new_elevatorSet');
};

var retrievePortCity = function (portId) {
    return retrieveAbstraction(portId, 'new_portSet');
};

softline.distance = function () {
    var new_warehouse = Xrm.Page.getAttribute('new_warehouse').getValue();
    var new_elevator = Xrm.Page.getAttribute('new_elevator').getValue();
    var new_terminal_odesaid = Xrm.Page.getAttribute('new_terminal_odesaid').getValue();
    var new_terminal_mykolaivid = Xrm.Page.getAttribute('new_terminal_mykolaivid').getValue();

    var warehouseCity,
        elevatorCity,
        odesaTerminalCity,
        mykolaivTerminalCity,
        odesaPortCity = "Одеса",
        mykolaivPortCity = "Миколаїв";
    if (new_warehouse != null) {
        var warehouseCity = retrieveWarehouseCity(new_warehouse[0].id);
    }

    if (new_elevator != null) {
        var elevatorCity = retrieveElevatorCity(new_elevator[0].id);
    }

    if (new_terminal_odesaid != null) {
        var odesaTerminalCity = retrieveTerminalCity(new_terminal_odesaid[0].id);
    }

    if (new_terminal_mykolaivid != null) {
        var mykolaivTerminalCity = retrieveTerminalCity(new_terminal_mykolaivid[0].id);
    }

    var paths = [];
    var group = function (from, to) {
        if (from && to) {
            paths.push([from, to]);
            return [from, to];
        }
        return null;
    };

    var namedPaths = {
        odesaElevator: group(odesaTerminalCity || odesaPortCity, elevatorCity),
        odesaSklad: group(odesaTerminalCity || odesaPortCity, warehouseCity),
        mykolaivElevator: group(mykolaivTerminalCity || mykolaivPortCity, elevatorCity),
        mykolaivSklad: group(mykolaivTerminalCity || mykolaivPortCity, warehouseCity),
    };

    var toNamed = function (distances, namedPaths) {
        var named = {};
        var i = 0;
        for (var path in namedPaths) {
            if (!namedPaths[path]) {
                continue;
            }
            named[path] = distances[i];
            i += 1;
        }

        return named;
    };

    Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window
        .getDistances(paths)
        .then(function (distances) {
            console.log(distances);

            var named = toNamed(distances, namedPaths);
            console.log(named);

            var odesa_distance = Math.max(named.odesaElevator || 0, named.odesaSklad || 0);
            var nikolaev_distance = Math.max(named.mykolaivElevator || 0, named.mykolaivSklad || 0);
            console.log(odesa_distance, nikolaev_distance);

            Xrm.Page.getAttribute('new_distance_mykolaiv').setValue(nikolaev_distance);
            Xrm.Page.getAttribute('new_distance_odesa').setValue(odesa_distance);
            Xrm.Page.getAttribute('new_distance_mykolaiv').fireOnChange();
            Xrm.Page.getAttribute('new_distance_odesa').fireOnChange();
        });
};

softline.deliveryPaymentN = function () {
    /*if (Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != null &&
        Xrm.Page.getAttribute('new_distance_odesa').getValue() == null) {
        do {
            softline.distanceO();
        } while (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null);
    }*/

    if (Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != null ||
        Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != 0) {

        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '',
            function (data) {
                if (data.length != 0) {
                    if (data[0].new_ton_km_cost != null) {
                        SetFieldValue('new_ship_cost_mykolaiv',
                            data[0].new_ton_km_cost.Value *
                            Xrm.Page.getAttribute('new_distance_mykolaiv').getValue());
                        Xrm.Page.getAttribute('new_ship_cost_mykolaiv').fireOnChange();
                    }
                }
            },
            function (error) {
                console.log(error.message);
            },
            function onComplete() { },
            false
        );
    }
    //softline.distanceO();
};

softline.deliveryPaymentO = function () {
    /*if (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null &&
        Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() == null) {
        do {
            softline.distanceN();
        } while (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null);
    }*/

    if (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null &&
        Xrm.Page.getAttribute('new_distance_odesa').getValue() != 0) {

        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet',
            '',
            function (data) {
                if (data.length != 0) {
                    if (data[0].new_ton_km_cost != null) {
                        SetFieldValue('new_ship_cost_odesa',
                            data[0].new_ton_km_cost.Value *
                            Xrm.Page.getAttribute('new_distance_odesa').getValue());
                        Xrm.Page.getAttribute('new_ship_cost_odesa').fireOnChange();
                    }
                }
            },
            function (error) {
                console.log(error.message);
            },
            function onComplete() {
            },
            false);
    }
};

softline.railRoadPricing = function () {
    var notify = function () {
        Xrm.Page.ui.setFormNotification(
            'Увага! В даному елеваторі не заповнена загальна вартість послуг! Зайдіть, будь ласка, в картку елеватора та внесіть дані',
            'ERROR', 'rail_road_pricing');
    };
    var denotify = function () {
        Xrm.Page.ui.clearFormNotification('rail_road_pricing');
    };



    var getState = function () {
        var state = {
            shippingMethodCode: Xrm.Page.getAttribute('new_urchase_method').getValue(),
            elevatorId: Xrm.Page.getAttribute('new_elevator').getValue(),
            new_total_service_sum: null,
            new_total_AUTO_service_cost: null,
        };

        if (state.elevatorId) {
            XrmServiceToolkit.Rest.Retrieve(
                state.elevatorId[0].id, 'new_elevatorSet', 'new_total_service_sum,new_total_AUTO_service_cost', null,
                function (data) {
                    state.new_total_service_sum = data.new_total_service_sum.Value;
                    state.new_total_AUTO_service_cost = data.new_total_AUTO_service_cost.Value;
                },
                function (error) {
                },
                false);
        }

        return state;
    }

    var render = function (state) {
        var shouldNotify =
            state.elevatorId &&
            (!state.new_total_service_sum ||
                !state.new_total_AUTO_service_cost);

        var shouldDenotify =
            !state.elevatorId ||
                state.elevatorId &&
                state.new_total_service_sum &&
                state.new_total_AUTO_service_cost;

        if (shouldNotify) {
            notify();
        }
        if (shouldDenotify) {
            denotify();
        }


        var shouldRemoveValue =
            !state.shippingMethodCode ||
            !state.elevatorId ||
            !state.new_total_service_sum ||
            !state.new_total_AUTO_service_cost;

        if (shouldRemoveValue) {
            SetFieldValue('new_total_elevator_service_1tn_cost', null);
        }


        var shouldSetValue =
            state.shippingMethodCode &&
            state.elevatorId &&
            state.new_total_service_sum &&
            state.new_total_AUTO_service_cost;

        if (shouldSetValue) {

            var isRailRoad = state.shippingMethodCode === shippingMethod.railroad;

            SetFieldValue(
                'new_total_elevator_service_1tn_cost',

                isRailRoad ?
                state.new_total_service_sum :
                state.new_total_AUTO_service_cost);
        }
    };


    var fullState = getState();

    render(fullState);
};

softline.setShippingCostIfRailroad = function () {
    var isRailRoad = Xrm.Page.getAttribute('new_urchase_method').getValue() === shippingMethod.railroad;

    if (!isRailRoad) {
        return;
    }

    var new_elevator_service_cost = Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').getValue() || 0;
    var shipCostMyk = Xrm.Page.getAttribute('new_rail_shipment_cost_mykolaiv').getValue() || 0;
    var shipCostOdessa = Xrm.Page.getAttribute('new_rail_shipment_cost_odesa').getValue() || 0;

    SetFieldValue('new_ship_cost_mykolaiv', new_elevator_service_cost + shipCostMyk);
    SetFieldValue('new_ship_cost_odesa', new_elevator_service_cost + shipCostOdessa);
};

softline.purchasePriceMykolaiv = function () {
    var new_recom_price_mykolaiv = Xrm.Page.getAttribute('new_recom_price_mykolaiv').getValue() || 0;
    var new_ship_cost_mykolaiv = Xrm.Page.getAttribute('new_ship_cost_mykolaiv').getValue() || 0;
    var new_total_elevator_service_1tn_cost = Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').getValue() || 0;
    SetFieldValue(
      'new_purch_price_mykolaiv',
      new_recom_price_mykolaiv - new_ship_cost_mykolaiv);
    Xrm.Page.getAttribute('new_purch_price_mykolaiv').fireOnChange();
};

softline.purchasePriceOdesa = function () {
    var new_recom_price_odesa = Xrm.Page.getAttribute('new_recom_price_odesa').getValue() || 0;
    var new_ship_cost_odesa = Xrm.Page.getAttribute('new_ship_cost_odesa').getValue() || 0;
    var new_total_elevator_service_1tn_cost = Xrm.Page.getAttribute('new_total_elevator_service_1tn_cost').getValue() || 0;
    SetFieldValue(
      'new_purch_price_odesa',
      new_recom_price_odesa - new_ship_cost_odesa);
    Xrm.Page.getAttribute('new_purch_price_odesa').fireOnChange();
};















function SetFieldValue(FieldName, value) {
    Xrm.Page.getAttribute(FieldName).setSubmitMode("always");
    Xrm.Page.getAttribute(FieldName).setValue(value);
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName) != null ? Xrm.Page.getAttribute(FieldName).getValue() : null;
}

function pausecomp(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while (curDate - date < millis);
}
