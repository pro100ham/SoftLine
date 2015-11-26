//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setContactInformation();

    Xrm.Page.getAttribute('new_contactid').addOnChange(softline.setContactInformation);
}

softline.setContactInformation = function () {
    if (Xrm.Page.getAttribute('new_contactid').getValue() != null) {
        XrmServiceToolkit.Rest.Retrieve(Xrm.Page.getAttribute('new_contactid').getValue()[0].id, 'ContactSet', 'MobilePhone,Telephone1', null,
                            function (data) {
                                if (data.Telephone1 != null) {
                                    SetFieldValue('new_contact_phone', data.Telephone1);
                                }
                                if (data.MobilePhone != null) {
                                    SetFieldValue('new_mob_phone', data.MobilePhone);
                                }
                            },
                            function (error) {
                                alert(error.message);
                            }, false);
    }
    else {
        SetFieldValue('new_contact_phone', null);
        SetFieldValue('new_mob_phone', null);
    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}