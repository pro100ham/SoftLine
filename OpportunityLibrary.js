function OpportunityPricingLoad() {
    if (GetFieldValue("pricelevelid") == null) {
        SetPriceList();
    }
}
function OpportunityPricingOnChange() {
    SetPriceList();
}
function SetPriceList() {
    var currency = GetFieldValue("transactioncurrencyid");
    var organizationdeparture = GetFieldValue("new_org_depid");
    if (currency != null && organizationdeparture != null) {
        var currencyName = currency[0].name;
        var organizationdepartureName = organizationdeparture[0].name;
        var filter = "";
        var pricelistAttribute = '';
        if (currencyName == "US Dollar" &&
            (organizationdepartureName == "Sales" || organizationdepartureName == "SL")) {
            pricelistAttribute = "Направление Sales US";
        }
        if (currencyName === "сўм" &&
            (organizationdepartureName == "Sales" || organizationdepartureName == "SL")) {
            pricelistAttribute = "Направление Sales Sum";
        }

        retrieveMultiple("PriceLevelSet", filter, function SuccesssetPriceList(data) {
            if (data && data.length > 0) {
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
}

function GetUserId() {
    return Xrm.Page.context.getUserId();
}
function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}
function GetFieldValue(FieldName) {
    return Xrm.Page.getAttribute(FieldName).getValue();
}

function SetorganizationDepartuteFromUser() {
    var id = Xrm.Page.getAttribute("ownerid").getValue()[0].id;
    id = id.replace("{", "").replace("}", "");
    retrieveRecord(id, "SystemUserSet", function (data) {
        if (data && data.new_org_depid != null && data.new_org_depid.Id != null) {
            var lookupData = new Array();
            var lookupItem = new Object();
            lookupItem.id = data.new_org_depid.Id;
            lookupItem.typename = data.new_org_depid.LogicalName;
            lookupItem.name = data.new_org_depid.Name;
            lookupData[0] = lookupItem;
            SetFieldValue("new_org_depid", lookupData);
        }
    }, null, false);
    SetNotRequiredDohod();
}

function SetPriceListdependOfCurreny() {
    if (GetFieldValue("pricelevelid") == null) {
        var currencyName = '';
        if (GetFieldValue("transactioncurrencyid") != null) {
            currencyName = GetFieldValue("transactioncurrencyid")[0].name;
        }
        filter = '';
        retrieveMultiple("PriceLevelSet", filter, function SuccesssetPriceList(data) {
            if (data && data.length > 0) {
                var pricelistAttribute = "Default Sales US";
                if (currencyName == "сўм") pricelistAttribute = "Направление Sales Sum";
                if (currencyName == "US Dollar") pricelistAttribute = "Default Sales US";
                if (currencyName == "сўм") pricelistAttribute = "Default Sales Sum";
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
}

function SetNotRequiredDohod() {
    var orgDep = GetFieldValue("new_org_depid");
    if (orgDep != null) {
        var orgdepName = orgDep[0].name;
        if (orgdepName == "Edu") {
            SetNoRequieredField("budgetamount");
        } else {
            SetRequieredField("budgetamount");
        }
    } else {
        SetRequieredField("budgetamount");
    }
}
function SetRequieredField(fieldName) {
    Xrm.Page.getAttribute(fieldName).setRequiredLevel("required");
}
function SetNoRequieredField(fieldName) {
    Xrm.Page.getAttribute(fieldName).setRequiredLevel("none");
}

function SetStatus() {

    var estimatedclosedate = Xrm.Page.getAttribute('estimatedclosedate').getValue();
    var budgetamount = Xrm.Page.getAttribute('budgetamount').getValue();
    var Name = Xrm.Page.getAttribute('name').getValue();
    var customerid = Xrm.Page.getAttribute('customerid').getValue();
    var statuscode = Xrm.Page.getAttribute('statuscode').getValue();
    var purchasetimeframe = Xrm.Page.getAttribute('purchasetimeframe').getValue();
    var new_istochnik = Xrm.Page.getAttribute('new_istochnik').getValue();

    /*if (document.getElementById('potentialinterest')){
		var gridControl = document.getElementById('potentialinterest').control; 
		var ids = gridControl.get_allRecordIds();*/

    if (estimatedclosedate != null && budgetamount != null && Name != null && customerid != null && statuscode != null &&
    purchasetimeframe != null && new_istochnik != null /*&& ids.length != 0*/) {
        var flag = '100000000';
        if (document.getElementById('quote')) {
            var gridControl = document.getElementById('quote').control;
            var ids = gridControl.get_allRecordIds();
            if (ids.length != 0) {
                var flag = '100000001';
                if (document.getElementById('saleorder')) {
                    var gridControl = document.getElementById('saleorder').control;
                    var ids = gridControl.get_allRecordIds();
                    if (ids.length != 0) {
                        var flag = '100000002';
                        if (document.getElementById('payment')) {
                            var gridControl = document.getElementById('payment').control;
                            var ids = gridControl.get_allRecordIds();
                            if (ids.length != 0) {
                                var flag = '100000003';
                            }
                        }
                        else {
                            return;
                        }
                    }
                }
                else {
                    return;
                }
            }
        }
        else {
            return;
        }
    }
    /*}
	else{
		return;
	}*/
    Xrm.Page.getAttribute("new_stage_sales").setSubmitMode("always");
    Xrm.Page.getAttribute("new_stage_sales").setValue(flag);
}

function CheckStatusCode(context) {
    if (Xrm.Page.getAttribute('new_priznskvs').getValue() == 100000000) {
        alert("Выберите Признак ВС!");
        var saveEvent = context.getEventArgs();
        saveEvent.preventDefault();
    }
    if (Xrm.Page.getAttribute('ownerid').getValue()) {
        var owner = Xrm.Page.getAttribute('ownerid').getValue()[0].name;
        if (owner == "Sabina Kadirova" || owner == "Yulduz Tokhtieva") {
            alert("Пожалуйста проверьте информацию об Ответственном лице");
            var saveEvent = context.getEventArgs();
            saveEvent.preventDefault();
        }
    }
}