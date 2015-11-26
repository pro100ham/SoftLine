//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    Xrm.Page.getAttribute("to").addOnChange(softline.getInfoFromAccount);
}

softline.getInfoFromAccount = function () {
    if (Xrm.Page.getAttribute('to') != null &&
        Xrm.Page.getAttribute('to').getValue() != null &&
        Xrm.Page.getAttribute('to').getValue()[0].typename == "account") {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('to').getValue()[0].id, "AccountSet", "Address2_Line1,new_city_postalid,new_postal_areaID,new_region_postalid,PrimaryContactId,Telephone1",
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
    else if (Xrm.Page.getAttribute('to') == null &&
        Xrm.Page.getAttribute('to').getValue() == null) {
        SetFieldValue("phonenumber", "");
        SetFieldValue("new_contactid", null);
        SetFieldValue("new_address_street", "");
        SetFieldValue('new_area', null);
        SetFieldValue('new_region', null);
        SetFieldValue("new_city", null);
    }
}


function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}