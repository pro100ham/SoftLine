//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    /*softline.deliveryPayment();*/
    Xrm.Page.getAttribute('new_terminal_odesaid').addOnChange(softline.distanceO);
    Xrm.Page.getAttribute('new_odesaid').addOnChange(softline.distanceO);
    Xrm.Page.getAttribute('new_warehouse').addOnChange(softline.distanceO);
    Xrm.Page.getAttribute('new_elevator').addOnChange(softline.distanceO);

    Xrm.Page.getAttribute('new_terminal_mykolaivid').addOnChange(softline.distanceN);
    Xrm.Page.getAttribute('new_mykolaivid').addOnChange(softline.distanceN);
    Xrm.Page.getAttribute('new_warehouse').addOnChange(softline.distanceN);
    Xrm.Page.getAttribute('new_elevator').addOnChange(softline.distanceN);

    Xrm.Page.getAttribute('new_supplierid').addOnChange(softline.getInfoFromAccount);

    Xrm.Page.getAttribute('new_distance_mykolaiv').addOnChange(softline.deliveryPaymentN);
    Xrm.Page.getAttribute('new_distance_odesa').addOnChange(softline.deliveryPaymentO);
    Xrm.Page.getAttribute('new_purch_volume_mykolaiv').addOnChange(softline.deliveryPaymentN);
    Xrm.Page.getAttribute('new_purch_volume_odesa').addOnChange(softline.deliveryPaymentO);

    Xrm.Page.getAttribute('new_urchase_method').addOnChange(softline.CanculateAuto);
    Xrm.Page.getAttribute('new_distance_mykolaiv').addOnChange(softline.CanculateAuto);
    Xrm.Page.getAttribute('new_distance_odesa').addOnChange(softline.CanculateAuto);

    Xrm.Page.getAttribute('new_offer_status').addOnChange(softline.CreateDealMethods);
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
    if ((GetFieldValue("new_supplier_price_mykolaiv") != null ||
        GetFieldValue("new_purch_price_mykolaiv") != null) &&
        GetFieldValue("new_offer_status") == 100000001) {
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
                if (GetFieldValue("new_ship_basisid") != null)
                    entity.new_ship_basisid = { Id: GetFieldValue("new_ship_basisid")[0].id, LogicalName: GetFieldValue("new_ship_basisid")[0].typename };
                if (GetFieldValue("new_urchase_method") != null)
                    entity.new_shipping_method = { Value: GetFieldValue("new_urchase_method") };
                if (GetFieldValue("new_supplier_volume_mykolaiv") != null)
                    entity.new_purchase_amount = GetFieldValue("new_supplier_volume_mykolaiv");
                if (supplierN != null) {
                    entity.new_purchase_price = { Value: supplierN.toString().replace('.', ',') };
                    entity.new_purchase_opport_price = { Value: supplierN.toString().replace('.', ',') };
                }
                if (GetFieldValue("new_recom_price_mykolaiv") != null)
                    entity.new_recommended_price = { Value: GetFieldValue("new_recom_price_mykolaiv").toString().replace('.', ',') };

                if (data != null && data.length != 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_cityid != null && data[i].new_name == "Миколаїв")
                            entity.new_ship_portid = { Id: data[i].new_portId, LogicalName: 'new_port' };
                    }
                }

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
            alert("Ціна постачальника Миколаїв вища за ціну закупівлі Миколаїв. Картка угоди не може мути створеною.");
        }
    }
    if ((GetFieldValue("new_supplier_price_odesa") != null ||
        GetFieldValue("new_purch_price_odesa") != null) &&
        GetFieldValue("new_offer_status") == 100000001) {
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
                if (supplierO != null) {
                    entity.new_purchase_price = { Value: supplierO.toString().replace('.', ',') };
                    entity.new_purchase_opport_price = { Value: supplierO.toString().replace('.', ',') };
                }
                if (GetFieldValue("new_recom_price_odesa") != null)
                    entity.new_recommended_price = { Value: GetFieldValue("new_recom_price_odesa").toString().replace('.', ',') };

                if (data != null && data.length != 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_cityid != null && data[i].new_name == "Одеса")
                            entity.new_ship_portid = { Id: data[i].new_portId, LogicalName: 'new_port' };
                    }
                }

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
            alert("Ціна постачальника Одеса вища за ціну закупівлі Одеса. Картка угоди не може мути створеною.");
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

softline.distanceN = function () {
    //Відстань Миколаїв          new_distance_mykolaiv
    //Термінал Миколаїв          new_terminal_mykolaivid
    //Порт Миколаїв              new_mykolaivid
    //Склад постачальника        new_warehouse
    //Елеватор постачальника     new_elevator

    var terminalElevator = [];
    var terminalSklad = [];
    var portElevator = [];
    var portSklad = [];

    var terminalElevatorDistamce = 0;
    var terminalSkladDistamce = 0;
    var portElevatorDistamce = 0;
    var portSkladDistamce = 0;

    var new_terminal_mykolaivid = Xrm.Page.getAttribute('new_terminal_mykolaivid').getValue();
    var new_mykolaivid = Xrm.Page.getAttribute('new_mykolaivid').getValue();

    var new_warehouse = Xrm.Page.getAttribute('new_warehouse').getValue();
    var new_elevator = Xrm.Page.getAttribute('new_elevator').getValue();

    if (new_terminal_mykolaivid != null) {
        XrmServiceToolkit.Rest.Retrieve(new_terminal_mykolaivid[0].id, 'new_terminalSet', 'new_cityid', null,
                                                                                                function (data) {
                                                                                                    if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                        terminalSklad.push(data.new_cityid.Name.toString());
                                                                                                        terminalElevator.push(data.new_cityid.Name.toString());
                                                                                                    }
                                                                                                },
                                                                                                 function (error) {
                                                                                                     console.log(error.message);
                                                                                                 }, false);

        if (new_warehouse != null && terminalSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            terminalSklad.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);

        }

        if (new_elevator != null && terminalSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_elevator[0].id, 'new_elevatorSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            terminalElevator.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);
        }
    }

    if (new_mykolaivid != null) {
        XrmServiceToolkit.Rest.Retrieve(new_mykolaivid[0].id, 'new_portSet', 'new_cityid', null,
                                                                                        function (data) {
                                                                                            if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                portElevator.push(data.new_cityid.Name.toString());
                                                                                                portSklad.push(data.new_cityid.Name.toString());
                                                                                            }
                                                                                        },
                                                                                         function (error) {
                                                                                             console.log(error.message);
                                                                                         }, false);

        if (new_warehouse != null && portSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            portSklad.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);

        }

        if (new_elevator != null && portElevator.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_elevator[0].id, 'new_elevatorSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            portElevator.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);
        }
    }

    Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.field = 'new_distance_mykolaiv';

    if (terminalElevator.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = terminalElevator;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
    if (terminalSklad.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = terminalSklad;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
    if (portElevator.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = portElevator;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();

    }
    if (portSklad.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = portSklad;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
}

softline.distanceO = function () {
    //Відстань Одеса             new_distance_odesa
    //Термінал Одеса             new_terminal_odesaid
    //Порт Одеса                 new_odesaid
    //Склад постачальника        new_warehouse
    //Елеватор постачальника     new_elevator

    var terminalElevator = [];
    var terminalSklad = [];
    var portElevator = [];
    var portSklad = [];

    var new_terminal_odesaid = Xrm.Page.getAttribute('new_terminal_odesaid').getValue();
    var new_odesaid = Xrm.Page.getAttribute('new_odesaid').getValue();

    var new_warehouse = Xrm.Page.getAttribute('new_warehouse').getValue();
    var new_elevator = Xrm.Page.getAttribute('new_elevator').getValue();

    if (new_terminal_odesaid != null) {
        XrmServiceToolkit.Rest.Retrieve(new_terminal_odesaid[0].id, 'new_terminalSet', 'new_cityid', null,
                                                                                                function (data) {
                                                                                                    if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                        terminalSklad.push(data.new_cityid.Name.toString());
                                                                                                        terminalElevator.push(data.new_cityid.Name.toString());
                                                                                                    }
                                                                                                },
                                                                                                 function (error) {
                                                                                                     console.log(error.message);
                                                                                                 }, false);

        if (new_warehouse != null && terminalSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            terminalSklad.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);

        }

        if (new_elevator != null && terminalSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_elevator[0].id, 'new_elevatorSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            terminalElevator.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);
        }
    }

    if (new_odesaid != null) {
        XrmServiceToolkit.Rest.Retrieve(new_odesaid[0].id, 'new_portSet', 'new_cityid', null,
                                                                                        function (data) {
                                                                                            if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                portElevator.push(data.new_cityid.Name.toString());
                                                                                                portSklad.push(data.new_cityid.Name.toString());
                                                                                            }
                                                                                        },
                                                                                         function (error) {
                                                                                             console.log(error.message);
                                                                                         }, false);

        if (new_warehouse != null && portSklad.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_warehouse[0].id, 'new_warehouseSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            portSklad.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);

        }

        if (new_elevator != null && portElevator.length != 0) {
            XrmServiceToolkit.Rest.Retrieve(new_elevator[0].id, 'new_elevatorSet', 'new_cityid', null,
                                                                                                    function (data) {
                                                                                                        if (data.new_cityid != null && data.new_cityid.Name != null) {
                                                                                                            portElevator.push(data.new_cityid.Name.toString());
                                                                                                        }
                                                                                                    },
                                                                                                     function (error) {
                                                                                                         console.log(error.message);
                                                                                                     }, false);
        }
    }

    Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.field = 'new_distance_odesa';

    if (terminalElevator.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = terminalElevator;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
    if (terminalSklad.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = terminalSklad;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
    if (portElevator.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = portElevator;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();

    }
    if (portSklad.length == 2) {
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.pointToDistance = portSklad;
        Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window.checkDistance();
    }
}

softline.deliveryPaymentN = function () {
    if (Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != null &&
        Xrm.Page.getAttribute('new_distance_odesa').getValue() == null) {
        do {
            softline.distanceO();
        } while (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null);
    }

    if ((Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != null ||
    Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() != 0) &&
        (Xrm.Page.getAttribute('new_purch_volume_mykolaiv').getValue() != null &&
    Xrm.Page.getAttribute('new_purch_volume_mykolaiv').getValue() != 0)) {
        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '', function (data) {
            if (data.length != 0) {
                if (data[0].new_ton_km_cost != null) {
                    SetFieldValue('new_ship_cost_mykolaiv', data[0].new_ton_km_cost.Value * Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() * Xrm.Page.getAttribute('new_purch_volume_mykolaiv').getValue());
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

softline.deliveryPaymentO = function () {
    if (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null &&
        Xrm.Page.getAttribute('new_distance_mykolaiv').getValue() == null) {
        do {
            softline.distanceN();
        } while (Xrm.Page.getAttribute('new_distance_odesa').getValue() != null);
    }

    if ((Xrm.Page.getAttribute('new_distance_odesa').getValue() != null &&
    Xrm.Page.getAttribute('new_distance_odesa').getValue() != 0) &&
        (Xrm.Page.getAttribute('new_purch_volume_odesa').getValue() != null &&
    Xrm.Page.getAttribute('new_purch_volume_odesa').getValue() != 0)) {
        XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet',
            '',
            function (data) {
                if (data.length != 0) {
                    if (data[0].new_ton_km_cost != null) {
                        SetFieldValue('new_ship_cost_odesa', data[0].new_ton_km_cost.Value * Xrm.Page.getAttribute('new_distance_odesa').getValue() * Xrm.Page.getAttribute('new_purch_volume_odesa').getValue());
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
}

/*softline.prisePurchace = function () {
    if (Xrm.Page.getAttribute('new_purchase_order').getValue() != null &&
        Xrm.Page.getAttribute('new_delivery_cost').getValue() != null) {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('new_purchase_order').getValue()[0].id, 'new_purchase_orderSet', 'new_purchase_price', null,
            function (data) {
                if (data.new_purchase_price != null) {
                    SetFieldValue('new_purchase_price', data.new_purchase_price.Value * Xrm.Page.getAttribute('new_delivery_cost').getValue());
                }
            },
             function (error) {
                 console.log(error.message);
             }, false);
    }
}*/

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
         console.log(error.message);
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
         console.log(error.message);
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
         console.log(error.message);
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
         console.log(error.message);
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

function SetFieldValue(FieldName, value) {
    Xrm.Page.getAttribute(FieldName).setSubmitMode("always");
    Xrm.Page.getAttribute(FieldName).setValue(value);
}

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName) != null ? Xrm.Page.getAttribute(FieldName).getValue() : null;
}
