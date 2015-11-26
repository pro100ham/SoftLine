//----------------------------------------//
//---------©2014 SoftLine Ukraine---------//
//----------------------------------------//

if (typeof (softline) == "undefined"){softline = { __namespace:true };}

softline.onLoad = function(){

softline.setLookup();

}

softline.setLookup = function(){
	 retrieveMultiple("new_constantSet", null, function(data){
	 	if(data[0].new_Logist.Id != null && Xrm.Page.getAttribute('new_logistics').getValue() == null)
	 		Xrm.Page.getAttribute('new_logistics').setValue([{id: data[0].new_Logist.Id,entityType: data[0].new_Logist.LogicalName,name: data[0].new_Logist.Name}]);
	 	/*if(data[0].new_signatorycontracts.Id != null)
	 		Xrm.Page.getAttribute('new_signatory').setValue([{id: data[0].new_signatorycontracts.Id,entityType: data[0].new_signatorycontracts.LogicalName,name: data[0].new_signatorycontracts.Name}]);*/
	 	if(data[0].new_lawyer.Id != null && Xrm.Page.getAttribute('new_lawdepartment').getValue() == null)
	 		Xrm.Page.getAttribute('new_lawdepartment').setValue([{id: data[0].new_lawyer.Id,entityType: data[0].new_lawyer.LogicalName,name: data[0].new_lawyer.Name}]);
	 	if(data[0].new_financier.Id != null && Xrm.Page.getAttribute('new_financedepartment').getValue() == null)
	 	    Xrm.Page.getAttribute('new_financedepartment').setValue([{ id: data[0].new_financier.Id, entityType: data[0].new_financier.LogicalName, name: data[0].new_financier.Name }]);
	 	if (data[0].new_accountant.Id != null && Xrm.Page.getAttribute('new_accountant').getValue() == null)
	 	    Xrm.Page.getAttribute('new_accountant').setValue([{ id: data[0].new_accountant.Id, entityType: data[0].new_accountant.LogicalName, name: data[0].new_accountant.Name }]);
	 	if (data[0].new_salesdepartment.Id != null && Xrm.Page.getAttribute('new_salesdepartment').getValue() == null)
	 	    Xrm.Page.getAttribute('new_salesdepartment').setValue([{ id: data[0].new_salesdepartment.Id, entityType: data[0].new_salesdepartment.LogicalName, name: data[0].new_salesdepartment.Name }]);
	 }, null, true);
}