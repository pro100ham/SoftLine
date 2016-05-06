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


    Xrm.Page.getAttribute('new_shipping_method').addOnChange(softline.railRoadPricing);
    Xrm.Page.getAttribute('new_supplier_elevatorid').addOnChange(softline.railRoadPricing);

    Xrm.Page.getAttribute('new_elevator_service_cost').addOnChange(softline.setShippingCostIfRailroad);
    Xrm.Page.getAttribute('new_rail_ship_cost').addOnChange(softline.setShippingCostIfRailroad);
    Xrm.Page.getAttribute('new_shipping_method').addOnChange(softline.setShippingCostIfRailroad);


    Xrm.Page.getAttribute('new_distances').addOnChange(softline.deliveryPayment);
    Xrm.Page.getAttribute('new_purchase_orderid').addOnChange(softline.prisePurchace);
    Xrm.Page.getAttribute('new_shipping_cost').addOnChange(softline.prisePurchace);

    Xrm.Page.getAttribute('new_supplier_warehouseid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_supplier_elevatorid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_ship_elevatorid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_ship_portid').addOnChange(softline.distance);
    Xrm.Page.getAttribute('new_ship_terminalid').addOnChange(softline.distance);

    Xrm.Page.getAttribute('new_recommended_price').addOnChange(softline.purchasePrice);
    Xrm.Page.getAttribute('new_shipping_cost').addOnChange(softline.purchasePrice);
    Xrm.Page.getAttribute('new_elevator_service_cost').addOnChange(softline.purchasePrice);

    Xrm.Page.getAttribute('new_usd_rate').addOnChange(softline.aprovePriceUsd);
    Xrm.Page.getAttribute('new_purchase_price').addOnChange(softline.aprovePriceUsd);

    softline.deliveryPayment();
    softline.setExchangerate();

    softline.railRoadPricing();
    softline.setShippingCostIfRailroad();
    softline.aprovePriceUsd();

    softline.getTotalsPurchase();

    softline.getPersonalTaskInfo();
    Xrm.Page.getAttribute('new_purchase_task').addOnChange(softline.getPersonalTaskInfo);

    Xrm.Page.getAttribute('new_purchase_task').addOnChange(softline.checkDate);
    Xrm.Page.getAttribute('new_period_ship_from').addOnChange(softline.checkDate);
    Xrm.Page.getAttribute('new_period_ship_to').addOnChange(softline.checkDate);
    Xrm.Page.getAttribute('new_purchase_amount').addOnChange(softline.checkDate);
};

softline.getPersonalTaskInfo = function () {
    if (GetFieldValue("new_purchase_task") != null) {
        var pt = GetFieldValue("new_purchase_task");
        XrmServiceToolkit.Rest.Retrieve(pt[0].id, pt[0].entityType + 'Set', 'new_purchase_period_of,new_purchase_period_to', null,
            function (data) {
                SetFieldValue("new_purchase_period_from_purchase_task", data.new_purchase_period_of);
                SetFieldValue("new_purchase_period_till_purchase_task", data.new_purchase_period_to);
            },
        function (error) {
            console.log(error.message);
        }, false);
    } else {
        SetFieldValue("new_purchase_period_from_purchase_task", null);
        SetFieldValue("new_purchase_period_till_purchase_task", null);
    }
}

softline.getTotalsPurchase = function () {
    var port = GetFieldValue('new_ship_portid');
    var crop = GetFieldValue('new_cropid');
    if (port != null &&
        crop != null) {
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true' >" +
            "    <entity name='new_purchase_order' >" +
            "        <attribute name='new_status_perform' aggregate='SUM' alias='total' />" +
            "        <filter type='and' >" +
            "            <condition attribute='new_portid' operator='eq' value='" + port[0].id + "' />" +
            "            <condition attribute='new_cropid' operator='eq' value='" + crop[0].id + "' />" +
            "            <condition attribute='new_status' operator='in' >" +
            "                <value>" +
            "                    100000000" +
            "                </value>" +
            "                <value>" +
            "                    100000005" +
            "                </value>" +
            "                <value>" +
            "                    100000003" +
            "                </value>" +
            "                <value>" +
            "                    100000001" +
            "                </value>" +
            "            </condition>" +
            "        </filter>" +
            "    </entity>" +
            "</fetch>";
        XrmServiceToolkit.Soap.Fetch(fetchXml, true, function (data) {
            SetFieldValue('new_rest_to_purchase_total', data[0].attributes.total.value);
        });
    }
}

softline.checkDate = function () {
    var ship_from = GetFieldValue('new_period_ship_from');
    var ship_to = GetFieldValue('new_period_ship_to');
    var purchase_of = GetFieldValue('new_purchase_period_from_purchase_task');
    var purchase_to = GetFieldValue('new_purchase_period_till_purchase_task');

    var supplier = GetFieldValue('new_purchase_amount');
    var rest = GetFieldValue('new_rest_to_purchase_total');

    if (!(ship_to <= purchase_to)) {
        Xrm.Page.getControl("new_period_ship_to").setNotification("Помилка! Період відвантаження ДО пізніший ніж Період закупівлі ДО!.");
    } else {
        Xrm.Page.getControl("new_period_ship_to").clearNotification();
    }
    if (!(ship_to >= purchase_of)) {
        Xrm.Page.getControl("new_period_ship_from").setNotification("Помилка! Період відвантаження ДО раніший ніж Період закупівлі ВІД!.");
    } else {
        Xrm.Page.getControl("new_period_ship_from").clearNotification();
    }

    if (supplier > rest) {
        Xrm.Page.getControl("new_purchase_amount").setNotification("Помилка! Обсяг закупівлі за перевищено!.");
    }
    else {
        Xrm.Page.getControl("new_purchase_amount").clearNotification();
    }
}

softline.aprovePriceUsd = function () {
    var rate = Xrm.Page.getAttribute('new_usd_rate').getValue();
    var vat_return = get_vat_return();
    var purchase_price = Xrm.Page.getAttribute('new_purchase_price').getValue();

    if (!rate) {
        return;
    }

    SetFieldValue('new_aproved_price_in_usd',
        purchase_price / rate * vat_return);
    Xrm.Page.getAttribute('new_aproved_price_in_usd').fireOnChange();

}

softline.purchasePrice = function () {
    var new_recommended_price = Xrm.Page.getAttribute('new_recommended_price').getValue() || 0;
    var new_shipping_cost = Xrm.Page.getAttribute('new_shipping_cost').getValue() || 0;
    var new_elevator_service_cost = Xrm.Page.getAttribute('new_elevator_service_cost').getValue() || 0;

    var new_purchase_price = new_recommended_price - new_shipping_cost;

    Xrm.Page.getAttribute('new_purchase_price').setValue(new_purchase_price);
    Xrm.Page.getAttribute('new_purchase_price').fireOnChange();
};

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
};

softline.setExchangerate = function () {
    //Учет текущего курса валюты при создании записи

    if (!!Xrm.Page.getAttribute('new_usd_rate').getValue()) {
        // это не форма создания -- ничего не обновляем.
        // Тут мы смотрим по заполненности поля Курса, потому что эта карточка создаётся автоматом, а не пользователем.
        // По-этому по типу формы смотреть не получится.
        return;
    }


    var date = new Date();
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
        Xrm.Page.getAttribute('new_usd_rate').fireOnChange();
    }
};














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
    var checkpoint = [];

    var warehouse,
        elevator,
        port,
        terminal,
        shipelevator;

    warehouse = Xrm.Page.getAttribute('new_supplier_warehouseid').getValue();
    elevator = Xrm.Page.getAttribute('new_supplier_elevatorid').getValue();
    shipelevator = Xrm.Page.getAttribute('new_ship_elevatorid').getValue();
    port = Xrm.Page.getAttribute('new_ship_portid').getValue();
    terminal = Xrm.Page.getAttribute('new_ship_terminalid').getValue();

    var warehouseCity,
        elevatorCity,
        odesaTerminalCity,
        mykolaivTerminalCity,
        odesaPortCity = "Одеса",
        mykolaivPortCity = "Миколаїв";

    if (warehouse != null) {
        var supplierWarehouseCity = retrieveWarehouseCity(warehouse[0].id);
    }

    if (elevator != null) {
        var supplierElevatorCity = retrieveElevatorCity(elevator[0].id);
    }

    if (shipelevator != null) {
        var shipElevatorCity = retrieveElevatorCity(shipelevator[0].id);
    }

    if (port != null) {
        var portCity = retrievePortCity(port[0].id);
    }

    if (terminal != null) {
        var terminalCity = retrieveTerminalCity(terminal[0].id);
    }

    var paths = [];
    var group = function (from, to) {
        if (from && to) {
            paths.push([from, to]);
            return [from, to];
        }
        return null;
    };

    var paths = [
        group(supplierWarehouseCity, shipElevatorCity),
        group(supplierWarehouseCity, terminalCity),
        group(supplierWarehouseCity, portCity),
        group(supplierElevatorCity, shipElevatorCity),
        group(supplierElevatorCity, terminalCity),
        group(supplierElevatorCity, portCity)
    ].filter(function (x) {
        return x != null;
    });

    if (paths.length === 0) {
        Xrm.Page.getAttribute('new_distances').setValue(0);
        Xrm.Page.getAttribute('new_distances').fireOnChange();
        return;
    }

    Xrm.Page.getControl('WebResource_yMap').getObject().contentWindow.window
        .getDistances(paths)
        .then(function (distances) {
            var max =
                distances
                .reduce(function (agg, next) {
                    return Math.max(agg, next);
                }, 0);

            Xrm.Page.getAttribute('new_distances').setValue(max);
            Xrm.Page.getAttribute('new_distances').fireOnChange();
        });
};

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
            shippingMethodCode: Xrm.Page.getAttribute('new_shipping_method').getValue(),
            elevatorId: Xrm.Page.getAttribute('new_supplier_elevatorid').getValue(),
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
            SetFieldValue('new_elevator_service_cost', null);
        }


        var shouldSetValue =
            state.shippingMethodCode &&
            state.elevatorId &&
            state.new_total_service_sum &&
            state.new_total_AUTO_service_cost;

        if (shouldSetValue) {

            var isRailRoad = state.shippingMethodCode === shippingMethod.railroad;

            SetFieldValue(
                'new_elevator_service_cost',

                isRailRoad ?
                state.new_total_service_sum :
                state.new_total_AUTO_service_cost);
        }
    };


    var fullState = getState();

    render(fullState);
};

softline.setShippingCostIfRailroad = function () {
    var isRailRoad = Xrm.Page.getAttribute('new_shipping_method').getValue() === shippingMethod.railroad;

    if (!isRailRoad) {
        return;
    }

    var new_elevator_service_cost = Xrm.Page.getAttribute('new_elevator_service_cost').getValue() || 0;
    var new_rail_ship_cost = Xrm.Page.getAttribute('new_rail_ship_cost').getValue() || 0;

    SetFieldValue('new_shipping_cost', new_elevator_service_cost + new_rail_ship_cost);
};


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

function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName) != null ? Xrm.Page.getAttribute(FieldName).getValue() : null;
}


var vat_return = null;

function get_vat_return() {
    if (vat_return !== null) {
        return vat_return;
    }

    var result = 1;
    XrmServiceToolkit.Rest.RetrieveMultiple('new_constantSet', '',
        function (data) {
            if (data.length != 0) {
                result = data[0].new_VAT_return_coefficient;
            }
        },
        function (error) {
            alert(error.message);
        },
        function onComplete() { }, false
    );
    vat_return = result;

    return vat_return;
}