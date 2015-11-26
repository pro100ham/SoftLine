function setInvoiceDate() {
    //if(Xrm.Page.ui.getFormType() == 1)
    if (Xrm.Page.getAttribute("new_invoice_creation_date").getValue() == null) {
        Xrm.Page.getAttribute("new_invoice_creation_date").setValue(new Date());

    }
}
function GetUserOrgDep(){
  var result="";
	var id = GetUserId();
	id = id.replace("{", "").replace("}", "");
	retrieveRecord(id, "SystemUserSet", function (data) {
		if (data && data.new_org_depid != null && data.new_org_depid.Id != null) {               
			result= data.new_org_depid.Name;                
		}
	}, null, false);
	return result;
}

function getDataFrom() {
  var userOrgDep=GetUserOrgDep();
   if (userOrgDep=="Edu")
   {
      Xrm.Page.getAttribute("new_invoice_number").setRequiredLevel("none");
      HideField("new_invoice_number");
	  }   
   else{
      Xrm.Page.getAttribute("new_invoice_number").setRequiredLevel("required");
      ShowField("new_invoice_number");
	  }
   
    if (Xrm.Page.ui.getFormType() == 1 && Xrm.Page.getAttribute("salesorderid").getValue() != null) {
        if (Xrm.Page.getAttribute("salesorderid").getValue()[0].id != "") {
            var id = Xrm.Page.getAttribute("salesorderid").getValue()[0].id;
            id = id.replace("{", "");
            id = id.replace("}", "");
            retrieveRecord(id, "SalesOrderSet", getFieldOrder, null, false);

            function getFieldOrder(data, textStatus, XmlHttpRequest) {
                if (data) {
                    if (data.OrderNumber != null) {
                        Xrm.Page.getAttribute("new_contract_number").setValue(data.OrderNumber);
                    }
                }
            }
        }
    }
}

function CountMarza() {
    if (Xrm.Page.ui.getFormType() != 1) {
        var marza = 0;
        var marzaUSD = 0;
        var marzaEURO = 0;
        var totalAmount = 0;
        var dopZatrati = 0;
        var totalAmountZakupki = 0;
        var totalAmountZakupkiUSD = 0;
        var totalAmountZakupkiEURO = 0;
        var totalAmountUSD = 0;
        var dopZatratiUSD = 0;
        if (Xrm.Page.getAttribute('totalamount').getValue() != null) totalAmount = Xrm.Page.getAttribute('totalamount').getValue();
        if (Xrm.Page.getAttribute('new_dop_zatratu').getValue() != null) dopZatrati = Xrm.Page.getAttribute('new_dop_zatratu').getValue();
        if (Xrm.Page.getAttribute('totalamount_base').getValue() != null) totalAmountUSD = Xrm.Page.getAttribute('totalamount_base').getValue();
        if (Xrm.Page.getAttribute('new_dop_zatratu_base').getValue() != null) dopZatratiUSD = Xrm.Page.getAttribute('new_dop_zatratu_base').getValue();
        if (Xrm.Page.getAttribute('new_summ_zakupki').getValue() != null) totalAmountZakupki = Xrm.Page.getAttribute('new_summ_zakupki').getValue();
        var id = Xrm.Page.data.entity.getId();
        id = id.replace("{", "");
        id = id.replace("}", "");

        var filter1 = "?$filter=InvoiceId/Id eq (guid'" + id + "') ";
        retrieveMultiple("InvoiceDetailSet", filter1, GetzakupocnayaZena, null, false);
        function GetzakupocnayaZena(data, textStatus, XmlHttpRequest) {
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var quantity = 0;
                    if (data[i].Quantity != null) {
                        quantity = data[i].Quantity;
                    }
                    if (data[i] && data[i].new_usdprice != null && data[i].new_usdprice != 0) {
                        totalAmountZakupkiUSD += parseFloat(data[i].new_usdprice) * quantity;
                    } else {
                        if (data[i] && data[i].new_zakupochnaya_zena_Base != null && data[i].new_zakupochnaya_zena_Base.Value != null) {
                            totalAmountZakupkiUSD += parseFloat(data[i].new_zakupochnaya_zena_Base.Value) * quantity;
                        }
                    }
                    if (data[i] && data[i].new_europrice != null) {
                        totalAmountZakupkiEURO += parseFloat(data[i].new_europrice) * quantity;
                    }
                }
                Xrm.Page.getAttribute("new_obshayazakupkausd").setSubmitMode("always");
                Xrm.Page.getAttribute("new_obshayazakupkaeuro").setSubmitMode("always");
                Xrm.Page.data.entity.attributes.get("new_obshayazakupkausd").setValue(totalAmountZakupkiUSD);
                Xrm.Page.data.entity.attributes.get("new_obshayazakupkaeuro").setValue(totalAmountZakupkiEURO);
            }
        }
        var eurocourse = GetEuroCourse();
        if (totalAmount != 0) {
            var filter = "?$filter=new_schetid/Id eq (guid'" + id + "') ";
            retrieveMultiple("new_oplataSet", filter, function (data) {
                if (data && data.length > 0) {
                    var summapooplatam = 0;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_summa != null && data[i].new_summa_Base.Value != null)
                            summapooplatam += parseFloat(data[i].new_summa_Base.Value);

                        var oplata = procentOPlata = marzaOplata = marzaUSDOplata = 0;
                        if (data[i].new_summa != null && data[i].new_summa_Base.Value != null)
                        oplata = parseFloat(data[i].new_summa_Base.Value);
                        procentOPlata = oplata / totalAmountUSD;
                        marzaOplata = procentOPlata * totalAmount - procentOPlata * dopZatrati - procentOPlata * totalAmountZakupki;
                        marzaUSDOplata = procentOPlata * totalAmountUSD - procentOPlata * dopZatratiUSD - procentOPlata * totalAmountZakupkiUSD;
                        // var marzaEUROOPlata = procentOPlata * totalAmountUSD * eurocourse - procentOPlata * dopZatratiUSD * eurocourse - procentOPlata * totalAmountZakupkiEURO;
                        var oplataUpdate = new Object();
                        var oplataId = data[i].new_oplataId.replace("{", "").replace("}", "");
                        oplataUpdate.new_marja = { Value: marzaOplata.toFixed(2) };
                        oplataUpdate.new_marjaUSD = marzaUSDOplata.toFixed(2);
                        oplataUpdate.new_oplataId = oplataId;
                        updateRecord(oplataId, oplataUpdate, "new_oplataSet", null, null, false);
                    }
                    var procent = summapooplatam / totalAmountUSD;

                    marza = procent * totalAmount - procent * dopZatrati - procent * totalAmountZakupki;
                    marzaUSD = procent * totalAmountUSD - procent * dopZatratiUSD - procent * totalAmountZakupkiUSD;
                    marzaEURO = procent * totalAmountUSD * eurocourse - procent * dopZatratiUSD * eurocourse - procent * totalAmountZakupkiEURO;
                    //                    for (var k = 0; k < data.length; k++) {
                    //                        var oplataUpdate = new Object();
                    //                        var oplataId = data[k].new_oplataId.replace("{", "").replace("}", "");
                    //                        oplataUpdate.new_marja = { Value: marza.toFixed(2) };
                    //                        oplataUpdate.new_marjaUSD = marzaUSD.toFixed(2);
                    //                        oplataUpdate.new_oplataId = oplataId;
                    //                        updateRecord(oplataId, oplataUpdate, "new_oplataSet", null, null, false);
                    //                    }
                } else {
                    marza = totalAmount - dopZatrati - totalAmountZakupki;
                    marzaUSD = totalAmountUSD - dopZatratiUSD - totalAmountZakupkiUSD;
                    marzaEURO = dopZatratiUSD * eurocourse - dopZatratiUSD * eurocourse - totalAmountZakupkiEURO;
                }
            }, null, false);
        }
        SetFieldValue("new_marja", marza);
        SetFieldValue("new_marzausd", marzaUSD);
        SetFieldValue("new_marzaeuro", marzaEURO);

        //Xrm.Page.getAttribute('new_marja').setValue(marza);		
        //Xrm.Page.getAttribute('new_marzausd').setValue(marzaUSD);	
        //Xrm.Page.getAttribute('new_marzaeuro').setValue(marzaEURO);			
    }
}

function GetEuroCourse() {
    var courseeurotousa = 1;
    var filter = "?$select=sl_RelevanceDate,sl_TransactionCurrencyId,sl_ExchangeRate&$orderby=sl_RelevanceDate desc";
    retrieveMultiplePaginal("sl_ExchangeRateSet", filter, function (data) {
        if (data && data.length > 0) {
            for (var i = 0; i < 3; i++) {
                var curency = data[i].sl_TransactionCurrencyId.Name;
                if (curency == "euro") {
                    courseeurotousa = parseFloat(data[i].sl_ExchangeRate);
                }
            }
        }
    }, null, false);
    return courseeurotousa;
}

function getTotalAmountFromProduct() {
    if (Xrm.Page.ui.getFormType() != 1) {
        var id = Xrm.Page.data.entity.getId();
        id = id.replace("{", "");
        id = id.replace("}", "");

        var filter = "?$filter=InvoiceId/Id eq (guid'" + id + "') ";
        retrieveMultiple("InvoiceDetailSet", filter, GetzakupocnayaZena, null, false);

        function GetzakupocnayaZena(data, textStatus, XmlHttpRequest) {
            if (data && data.length > 0) {
                var summazakupki = 0;
                for (var i = 0; i < data.length; i++) {
                    var quantity = 0;
                    if (data[i].Quantity != null) {
                        quantity = data[i].Quantity;
                    }
                    if (data[i] && data[i].new_zakupochnaya_zena != null && data[i].new_zakupochnaya_zena.Value != null) {
                        summazakupki += parseFloat(data[i].new_zakupochnaya_zena.Value) * quantity;
                    }
                }
                Xrm.Page.getAttribute("new_summ_zakupki").setSubmitMode("always");
                Xrm.Page.data.entity.attributes.get("new_summ_zakupki").setValue(summazakupki);
            }
        }
    }
}

function SetNameToSchet() {
    var numberA = Xrm.Page.getAttribute('new_number_invoive_edu').getValue();
    var numberB = Xrm.Page.getAttribute('new_invoice_number').getValue();
    var result = '';
    if (numberA == null && numberB != null) {
        result = numberB;
    } else {
        if (numberA != null) result = numberA;
    }
    Xrm.Page.getAttribute("name").setSubmitMode("always");
    Xrm.Page.getAttribute('name').setValue(result);
}

function SetRequiredLevelSalesNumber() {
    var organization = Xrm.Page.getAttribute("new_organization_dep").getValue();
    if (organization != null && organization[0].name == "Sales") {
        Xrm.Page.getAttribute("new_invoice_number").setRequiredLevel("required");
    } else {
        Xrm.Page.getAttribute("new_invoice_number").setRequiredLevel("none");
    }
}

function GetUserId() {
    return Xrm.Page.context.getUserId();
}

function SetorganizationDepartuteFromUser() {
    if (GetFieldValue("new_organization_dep") == null) {
        var id = GetUserId();
        id = id.replace("{", "").replace("}", "");
        retrieveRecord(id, "SystemUserSet", function (data) {
            if (data && data.new_org_depid != null && data.new_org_depid.Id != null) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data.new_org_depid.Id;
                lookupItem.typename = data.new_org_depid.LogicalName;
                lookupItem.name = data.new_org_depid.Name;
                lookupData[0] = lookupItem;
				 Xrm.Page.getAttribute("new_organization_dep").setSubmitMode("always");
                 Xrm.Page.getAttribute("new_organization_dep").setValue(lookupData);
               // SetFieldValue("new_organization_dep", lookupItem);
            }
        }, null, false);
    }
}

function SetPriceListdependOfCurreny() {
    if (GetFieldValue("pricelevelid") == null) {
        SetPriceList();
    }
}

function SetPriceListdependOfCurrenyOnChange() {
    SetPriceList();
}

function SetPriceList() {
    var currencyName = '';
    if (GetFieldValue("transactioncurrencyid") != null) {
        currencyName = GetFieldValue("transactioncurrencyid")[0].name;
    }
    filter = '';
    retrieveMultiple("PriceLevelSet", filter, function SuccesssetPriceList(data) {
        if (data && data.length > 0) {
            var pricelistAttribute = "Default USD Pricelist";
            if (currencyName == "US Dollar") pricelistAttribute = "Default USD Pricelist";
            if (currencyName == "manat") pricelistAttribute = "Default AZN Pricelist";
            for (var i = 0; i < data.length; i++) {
                if (data[i].Name == pricelistAttribute) {
                    var lookupData = new Array();
                    var lookupItem = new Object();
                    lookupItem.id = data[i].PriceLevelId;
                    lookupItem.typename = "pricelevel";
                    lookupItem.name = data[i].Name;
                    lookupData[0] = lookupItem;
                    SetFieldValue("pricelevelid", lookupData);
                }
            }
        }
    }, null, false);
}

function SetLanguageForm() {
    if (GetFieldValue("new_langforminvoicecustomer") == null && GetFieldValue("customerid") != null) {
        var id = GetFieldValue("customerid")[0].id;
        id = id.replace("{", "").replace("}", "");
        var filter = "?$filter=new_languageform/Id eq (guid'" + id + "')";
        retrieveMultiple("new_languageformSet", filter, function (data) {
            if (data && data.length > 0) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data[0].new_languageformId;
                lookupItem.typename = "new_languageform";
                lookupItem.name = data[0].new_name;
                lookupData[0] = lookupItem;
                SetFieldValue("new_langforminvoicecustomer", lookupData);
            }
        }, null, false);
    }
}

function SetBankData() {
    if (GetFieldValue("new_bankid") == null) {
        var filter = "?$filter=new_name eq 'QSC \"Bank Standard\" KB' and new_Valuta_rr eq 'AZN'";
        retrieveMultiple("new_BankSet", filter, function (data) {
            if (data && data.length > 0) {
                var lookupData = new Array();
                var lookupItem = new Object();
                lookupItem.id = data[0].new_BankId;
                lookupItem.typename = "new_bank";
                lookupItem.name = data[0].new_name;
                lookupData[0] = lookupItem;
                SetFieldValue("new_bankid", lookupData);
            }
        }, null, false);
    }
}

function SetBankDatadependsOfOrganizationDeparture() {
    if (GetFieldValue("new_organization_dep") != null) {
        var orgdeparture = GetFieldValue("new_organization_dep")
        if (orgdeparture[0].name == "Edu") {
            var filter = "?$filter=new_Valuta_rr eq 'AZN'";
            retrieveMultiple("new_BankSet", filter, function (data) {
                if (data && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].new_name != null && data[i].new_name == "\“Bank Respublika\” ASC Narimanov filiali") {
                            var lookupData = new Array();
                            var lookupItem = new Object();
                            lookupItem.id = data[i].new_BankId;
                            lookupItem.typename = "new_bank";
                            lookupItem.name = data[i].new_name;
                            lookupData[0] = lookupItem;
                            SetFieldValue("new_bankid", lookupData);
                        }
                    }

                }
            }, null, false);
            var filter1 = "?$filter=Name eq 'Основной прайс-лист по отделу Education'";
            retrieveMultiple("PriceLevelSet", filter1, function (data) {
                if (data && data.length > 0) {
                    var lookupData = new Array();
                    var lookupItem = new Object();
                    lookupItem.id = data[0].PriceLevelId;
                    lookupItem.typename = "pricelevel";
                    lookupItem.name = data[0].Name;
                    lookupData[0] = lookupItem;
                    SetFieldValue("pricelevelid", lookupData);
                }
            }, null, false);
        }
    }
}
function SetSostoianiaOplati() {
    if (Xrm.Page.ui.getFormType() != 1) {
        var totalAmount = 0;
        var summapooplatam = 0;
        if (Xrm.Page.getAttribute('totallineitemamount_base').getValue() != null) totalAmount = Xrm.Page.getAttribute('totallineitemamount_base').getValue();
        var id = Xrm.Page.data.entity.getId();
        id = id.replace("{", "");
        id = id.replace("}", "");
        var filter = "?$filter=new_schetid/Id eq (guid'" + id + "') ";
        retrieveMultiple("new_oplataSet", filter, function (data) {
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].new_summa_Base != null)
                        summapooplatam += parseFloat(data[i].new_summa_Base.Value);
                }
            }
        }, null, false);
        if (summapooplatam >= totalAmount) {
            SetFieldValue("statuscode", 5);
            // а) Оплачен полностью - если сумма оплаты >= сумме в счете
        } else if (summapooplatam > 0 && summapooplatam < totalAmount) {
            SetFieldValue("statuscode", 2);
            //б) Частично оплачен - если сумма оплаты > 0 и < суммы в счете
        } else if (summapooplatam == 0) {
            SetFieldValue("statuscode", 1);
            // в) Не оплачен - если в поле оплаты отсутствуют записи оплат.
        }
    }
}

function SetInvoiceWithNDS() {
    var withNDS = withoutNDS = 0;
    var withNDS = GetFieldValue("totallineitemamount");
    var withoutNDS = withNDS * 0.18;
    SetFieldValue("new_nds", withoutNDS);

}

function days_between(date1, date2) {
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    var difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.round(difference_ms / ONE_DAY)
}
function SetDateTovarShiped() {
    var isShiped = GetFieldValue("new_invoice_shipped");
    if (isShiped) {
        var thisDate = new Date();
        SetFieldValue("new_datetovarotgruz", thisDate);
    }
}
function SetDaysSchetStarting() {
    if (GetFieldValue("new_invoice_creation_date") != null) {
        var firstDate = new Date();
        var secondDate = GetFieldValue("new_invoice_creation_date");
        var totalDays = days_between(firstDate, secondDate);
        SetFieldValue("new_countdaysschetstart", totalDays);
    } else {
        SetFieldValue("new_countdaysschetstart", 0);
    }
}

function SetDaysTovarOtgruzkiStart() {
    if (GetFieldValue("new_datetovarotgruz") != null) {
        var firstDate = new Date();
        var secondDate = GetFieldValue("new_datetovarotgruz");
        var totalDays = days_between(firstDate, secondDate);
        SetFieldValue("new_countdaystovarotgruz", totalDays);
    } else {
        SetFieldValue("new_countdaystovarotgruz", 0);
    }
}
function SetAccountSolvencyNotification(){
ClearMessage("solvency");
var account=GetFieldValue("customerid");
 if (account!=null){
  var id =account[0].id.replace("{","").replace("}","");
  retrieveRecord(id, "AccountSet", function (data) {
            if (data && data.new_solvency != null && data.new_solvency.Value != null) {
               var solvency=data.new_solvency.Value;
			   var Message=null;
			   if (solvency==100000001)
			    Message="Данный заказчик неплатежеспособен. Размещение заказов без предоплаты запрешено!";
				if (solvency==100000002)
			    Message="Данный заказчик не стабильный плательщик. Размещение заказов без предварительного разрешения руководителя запрешено!";		
            if (Message!=null){				
				var notificationsArea = $find('crmNotifications')				
				notificationsArea.AddNotification("solvency", 2, "solvency", Message);				
				}
            }
        }, null, false);   
 }
}
function ClearMessage(source) {
   
	var notificationsArea = $find('crmNotifications');
     notificationsArea.SetNotifications(null, null);
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}
function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}

function HideField(FieldName) {
    Xrm.Page.ui.controls.get(FieldName).setVisible(false);
}

function ShowField(FieldName) {
    Xrm.Page.ui.controls.get(FieldName).setVisible(true);
}