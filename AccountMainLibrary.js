//----------------------------------------//
//---------�2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setVisibleTabCurrency();


    Xrm.Page.getAttribute('customertypecode').addOnChange(softline.setVisibleTabCurrency);
}

softline.onSave = function (context) {
    softline.checkCurrencyFields();
}

softline.buttonCreateInvoise = function () {
    //������ �������� ����� �� ���������� ����� ����������� - account
    if (Xrm.Page.data.entity.getId() != "") {
        alert("�������� ��������!!! ���� ����� ����� ��������  60 000, ���������� ������� �� � �������");
        var parameters = {};
        parameters["customerid"] = Xrm.Page.data.entity.getId();
        parameters["customeridname"] = Xrm.Page.getAttribute("name").getValue();
        parameters["customeridtype"] = 'account';
        Xrm.Utility.openEntityForm("invoice", null, parameters);
    }
}

softline.setVisibleTabCurrency = function () {
    if (Xrm.Page.getAttribute('customertypecode').getValue() == 10) {
        //10 - ���������
        Xrm.Page.ui.tabs.get('tab_6').setVisible(true);
    }
    else {
        Xrm.Page.ui.tabs.get('tab_6').setVisible(false);
    }
}

softline.checkCurrencyFields = function (context) {
    //new_usd
    //new_uah
    //new_euro
    //new_rub
    if (Xrm.Page.getAttribute('customertypecode').getValue() == 10 &&
        Xrm.Page.getAttribute('new_usd').getValue() != true &&
        Xrm.Page.getAttribute('new_uah').getValue() != true &&
        Xrm.Page.getAttribute('new_euro').getValue() != true &&
        Xrm.Page.getAttribute('new_rub').getValue() != true) {
        alert('�������� ������ ��� ������� � �����������');
        context.getEventArgs().preventDefault();
    }
}