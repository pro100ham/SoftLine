//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.ButtonSalesOrder = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var coordinationcontract = retrieveRecordById(Xrm.Page.data.entity.getId());

        var parameters = {};
        parameters["new_contrsctorder"] = Xrm.Page.data.entity.getId();
        parameters["new_contrsctordername"] = Xrm.Page.getAttribute("name").getValue();

        if (coordinationcontract.length != 0) {
            var length = coordinationcontract.length;
            if (coordinationcontract[length - 1].attributes["new_agreed_fd"])
                parameters["new_agreed_fd"] = coordinationcontract[length - 1].attributes["new_agreed_fd"].value;
            if (coordinationcontract[length - 1].attributes["new_remarks"])
                parameters["new_remarks"] = coordinationcontract[length - 1].attributes["new_remarks"].value;
            if (coordinationcontract[length - 1].attributes["new_datecoordination"])
                parameters["new_datecoordination"] = coordinationcontract[length - 1].attributes["new_datecoordination"].value.format('yyyy-MM-dd hh:mm:ss');
            if (coordinationcontract[length - 1].attributes["new_agreed_ld"])
                parameters["new_agreed_ld"] = coordinationcontract[length - 1].attributes["new_agreed_ld"].value;
            if (coordinationcontract[length - 1].attributes["new_remarkslaw"])
                parameters["new_remarkslaw"] = coordinationcontract[length - 1].attributes["new_remarkslaw"].value;
            if (coordinationcontract[length - 1].attributes["new_datecoordinationlaw"])
                parameters["new_datecoordinationlaw"] = coordinationcontract[length - 1].attributes["new_datecoordinationlaw"].value.format('yyyy-MM-dd hh:mm:ss');
            if (coordinationcontract[length - 1].attributes["new_agreed_dd"])
                parameters["new_agreed_dd"] = coordinationcontract[length - 1].attributes["new_agreed_dd"].value;
            if (coordinationcontract[length - 1].attributes["new_remarkslog"])
                parameters["new_remarkslog"] = coordinationcontract[length - 1].attributes["new_remarkslog"].value;
            if (coordinationcontract[length - 1].attributes["new_datecoordinationlog"])
                parameters["new_datecoordinationlog"] = coordinationcontract[length - 1].attributes["new_datecoordinationlog"].value.format('yyyy-MM-dd hh:mm:ss');
            if (coordinationcontract[length - 1].attributes["new_agreed_ac"])
                parameters["new_agreed_ac"] = coordinationcontract[length - 1].attributes["new_agreed_ac"].value;
            if (coordinationcontract[length - 1].attributes["new_remarkslac"])
                parameters["new_remarkslac"] = coordinationcontract[length - 1].attributes["new_remarkslac"].value;
            if (coordinationcontract[length - 1].attributes["new_datecoordinationlac"])
                parameters["new_datecoordinationlac"] = coordinationcontract[length - 1].attributes["new_datecoordinationlac"].value.format('yyyy-MM-dd hh:mm:ss');
            if (coordinationcontract[length - 1].attributes["new_participationlaw"])
                parameters["new_participationlaw"] = coordinationcontract[length - 1].attributes["new_participationlaw"].value;
            if (coordinationcontract[length - 1].attributes["new_participationlo"])
                parameters["new_participationlo"] = coordinationcontract[length - 1].attributes["new_participationlo"].value;
            if (coordinationcontract[length - 1].attributes["new_participationof"])
                parameters["new_participationof"] = coordinationcontract[length - 1].attributes["new_participationof"].value;
            if (coordinationcontract[length - 1].attributes["new_participationob"])
                parameters["new_participationob"] = coordinationcontract[length - 1].attributes["new_participationob"].value;
            if (coordinationcontract[length - 1].attributes["new_participationsp"])
                parameters["new_participationsp"] = coordinationcontract[length - 1].attributes["new_participationsp"].value;

            var contrsctordername = {};
            contrsctordername.statecode = 1;
            XrmServiceToolkit.Soap.SetState("new_coordinationcontract", coordinationcontract[length - 1].attributes["new_coordinationcontractid"].value, 1, -1, function () {
                Xrm.Utility.openEntityForm("new_coordinationcontract", null, parameters);
            });
        }
        else{
            Xrm.Utility.openEntityForm("new_coordinationcontract", null, parameters);
        }
    }
}

var retrieveRecordById = function (salesorderId) {
    var queryOptions = {
        entityName: "new_coordinationcontract",
        attributes: ["new_contrsctorder"],
        values: [salesorderId],
        columnSet: ["new_agreed_fd",
            "new_remarks",
            "new_datecoordination",
            "new_agreed_ld",
            "new_remarkslaw",
            "new_datecoordinationlaw",
            "new_agreed_dd",
            "new_remarkslog",
            "new_datecoordinationlog",
            "new_coordinationcontractid",
            "new_participationlaw",
            "new_participationlo",
            "new_participationof",
            "new_participationob",
            "new_participationsp"],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};
