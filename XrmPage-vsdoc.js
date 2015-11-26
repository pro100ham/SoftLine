// Author: Patrick Verbeeten
// Website: www.patrickverbeeten.com
// Updated: 2011-04-14 (CRM 2011)
//  If you do not agree to this license as a whole do not install or use.
//
//  License:
//  This Software is being distributed as Freeware. It may be freely used, 
//  copied and distributed under the following conditions:
//
//  1. All original files must be included, including this license.
//  2. You may not change or reverse engineer this software in any way.
//  3. It may not be not sold and You are NOT allowed to make a charge for use
//     or distribution of this Software (either for profit or merely to recover
//     your media and distribution costs) whether as a stand-alone product, or
//     as part of a compilation or anthology, without explicit prior written
//     permission.
//
//  By using this Software, you agree to these terms and the terms of the 
//  Disclaimer below.
//
//  Disclaimer:
//  This software is provided by the author and contributors "as is'' and any 
//  express or implied warranties, including, but not limited to, the implied 
//  warranties of merchantability and fitness for a particular purpose are 
//  disclaimed. In no event shall the author or contributors be liable for any 
//  direct, indirect, incidental, special, exemplary, or consequential damages 
//  (including, but not limited to, procurement of substitute goods or 
//  services; loss of use, data, or profits; or business interruption) however 
//  caused and on any theory of liability, whether in contract, strict 
//  liability, or tort (including negligence or otherwise) arising in any way 
//  out of the use of this software, even if advised of the possibility of such 
//  damage.
//

var XrmTypes = {
    Section: function () {
    },
    SectionCollection: function () {
    },
    Tab: function () {
    },
    TabCollection: function () {
    },
    Control: function () {
    },
    ControlCollection: function () {
    },
    NavigationItem: function () {
    },
    NavigationItemsCollection: function () {
    },
    Navigation: function () {
        this.items = new XrmTypes.NavigationItemsCollection();
    },
    FormSelectorItem: function () {
    },
    FormSelectorItemsCollection: function () {
    },
    FormSelector: function () {
        this.items = new XrmTypes.FormSelectorItemsCollection();
        this.getCurrentItem = function () {
            ///<summary>Returns a reference to the form currently being shown.</summary>
            ///<returns type="XrmTypes.FormSelectorItem"/>
        }
    },
    Ui: function () {
        this.tabs = new XrmTypes.TabCollection();
        this.controls = new XrmTypes.ControlCollection();
        this.navigation = new XrmTypes.Navigation();
        this.formSelector = new XrmTypes.FormSelector();
    },
    Option: function () {
    },
    Lookup: function () {
    },
    Attribute: function () {
    },
    AttributeCollection: function () {

    },
    Entity: function () {
        this.attributes = new XrmTypes.AttributeCollection();
    },
    Data: function () {
        this.entity = new XrmTypes.Entity();
    },
    Context: function () {
    },
    Page: function () {
        this.context = new XrmTypes.Context();
        this.ui = new XrmTypes.Ui();
        this.data = new XrmTypes.Data();
    },
    Xrm: function () {
        this.Page = new XrmTypes.Page()
    },
    __namespace: true
};
XrmTypes.Xrm.__class = true;
XrmTypes.Page.__class = true;
XrmTypes.Ui.__class = true;
XrmTypes.Context.__class = true;
XrmTypes.Data.__class = true;
XrmTypes.Entity.__class = true;
XrmTypes.AttributeCollection.__class = true;
XrmTypes.Attribute.__class = true;
XrmTypes.SectionCollection.__class = true;
XrmTypes.Section.__class = true;
XrmTypes.ControlCollection.__class = true;
XrmTypes.Control.__class = true;
XrmTypes.TabCollection.__class = true;
XrmTypes.Tab.__class = true;
XrmTypes.Navigation.__class = true;
XrmTypes.NavigationItemsCollection.__class = true;
XrmTypes.NavigationItem.__class = true;
XrmTypes.FormSelector.__class = true;
XrmTypes.FormSelectorItemsCollection.__class = true;
XrmTypes.FormSelectorItem.__class = true;
XrmTypes.Option.__class = true;
XrmTypes.Lookup.__class = true;

XrmTypes.Page.prototype = {
    getAttribute: function (id) {
        ///<param name="id">String: The attribute where the name matches the argument. function(attribute, index): Any attributes that cause the delegate function to return true</param>
        ///<summary>Shortcut for Xrm.Page.data.entity.attributes.get</summary>
        ///<returns type="XrmTypes.Attribute"></returns>
        return new XrmTypes.Attribute();
    },
    getControl: function (id) {
        ///<summary>Returns one or more controls depending on the arguments passed.</summary>
        ///<param name="id">String: The control where the name matches the argument. function(attribute, index): Any controls that cause the delegate function to return true</param>
        ///<returns type="XrmTypes.Control"></returns>
        return new XrmTypes.Control();
    }
};
XrmTypes.Ui.prototype = {
    getFormType: function() {
        ///<summary>Indicates the form context for the record.</summary>
        ///<returns type="Number"/>
    },
    getCurrentControl : function() {
        ///<summary>Returns the control object that currently has focus on the form.</summary>
        ///<returns type="XrmTypes.Control"/>
    },
    getViewPortHeight : function() {
        ///<summary>Returns the height of the viewport in pixels.</summary>
        ///<returns type="Number"/>
    },
    getViewPortWidth : function() {
        ///<summary>Returns the width of the viewport in pixels.</summary>
        ///<returns type="Number"/>
    },
    refreshRibbon : function() {
        ///<summary>Causes the Ribbon to re-evaluate data that controls how it is displayed.</summary>
    },
    close : function() {
        ///<summary>Closes the form.</summary>
    }
};
XrmTypes.FormSelectorItemsCollection.prototype = {
    get: function (id) {
        ///<returns type="XrmTypes.FormSelectorItem"></returns>
        return new XrmTypes.NavigationItem();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function () {
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
};
XrmTypes.NavigationItemsCollection.prototype = {
    get: function (id) {
        ///<returns type="XrmTypes.NavigationItem"></returns>
        return new XrmTypes.NavigationItem();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function () {
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
};
XrmTypes.AttributeCollection.prototype = {
    get: function (id) {
        ///<param name="id">String: The attribute where the name matches the argument. function(attribute, index): Any attributes that cause the delegate function to return true</param>
        ///<returns type="XrmTypes.Attribute"></returns>
        return new XrmTypes.Attribute();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function(){
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
};
XrmTypes.TabCollection.prototype = {
    get: function (id) {
        ///<summary>Returns one or more tabs depending on the arguments passed.</summary>
        ///<returns type="XrmTypes.Tab"></returns>
        return new XrmTypes.Tab();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function () {
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
}
XrmTypes.SectionCollection.prototype = {
    get: function (id) {
        ///<summary>Returns one or more sections depending on the arguments passed.</summary>
        ///<returns type="XrmTypes.Section"></returns>
        return new XrmTypes.Section();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function () {
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
}
XrmTypes.ControlCollection.prototype = {
    get: function (id) {
        ///<summary>Returns one or more controls depending on the arguments passed.</summary>
        ///<param name="id">String: The control where the name matches the argument. function(attribute, index): Any controls that cause the delegate function to return true</param>
        ///<returns type="XrmTypes.Control"></returns>
        return new XrmTypes.Control();
    },
    forEach: function (delegate) {
        ///<summary>Applies the action contained within a delegate function.</summary>
        ///<param name="delegate" type="Delegate">Applies the action contained within a delegate function.</param>
    },
    getLength: function () {
        ///<summary>Returns the number of items in the collection.</summary>
        ///<returns type="Number"/>
    }
};

XrmTypes.FormSelectorItem.prototype = {
    getId: function () {
        ///<summary>Returns the GUID ID of the roleForm</summary>
        ///<returns type="String"/>
    },
    getLabel: function () {
        ///<summary>Returns the label of the roleForm.</summary>
        ///<returns type="String"/>
    },
    navigate: function() {
        ///<summary>Opens the specified roleForm</summary>
    }
};
XrmTypes.NavigationItem.prototype = {
    getId: function () {
        ///<summary>Returns the name of the item.</summary>
        ///<returns type="String"/>
    },
    getLabel: function () {
        ///<summary>Returns the label for the tag.</summary>
        ///<returns type="String"/>
    },
    getVisible: function () {
        ///<summary>Returns a value that indicates whether the item is visible.</summary>
        ///<returns type="Boolean"/>
    },
    setFocus: function()
    {
        ///<summary>Sets the focus on the item.</summary>
    },
    setLabel: function (value) {
        ///<summary>Sets the label for the item.</summary>
        ///<param name="value" type="String">Label</param>
    },
    setVisible: function (value) {
        ///<summary>Sets a value that indicates whether the item is visible.</summary>
        ///<param name="value" type="Boolean"/>
    }
};
XrmTypes.Tab.prototype = {
    sections: new XrmTypes.SectionCollection(),
    getDisplayState: function () {
        ///<summary>Returns a value that indicates whether the tab is collapsed or expanded. One of the values 'expanded', 'collapsed'.</summary>
        ///<returns type="String"/>
    },
    getLabel: function () {
        ///<summary>Returns the label for the tab.</summary>
        ///<returns type="String"/>
    },
    getName: function () {
        ///<summary>Returns the name of the tab.</summary>
        ///<returns type="String"/>
    },
    getParent: function () {
        ///<summary>Returns the tab containing the tab.</summary>
        ///<returns type="XrmTypes.Ui"/>
    },
    getVisible: function () {
        ///<summary>Returns a value that indicates whether the tab is visible.</summary>
        ///<returns type="Boolean"/>
    },
    setDisplayState: function (value) {
        ///<summary>Sets the tab to be collapsed or expanded.</summary>
        ///<param name="value" type="String">One of the values 'expanded', 'collapsed'.</param>
    },
    setFocus: function()
    {
        ///<summary>Sets the focus on the tab.</summary>
    },
    setLabel: function (value) {
        ///<summary>Sets the label for the tag.</summary>
        ///<param name="value" type="String">Label</param>
    },
    setVisible: function (value) {
        ///<summary>Sets a value that indicates whether the tag is visible.</summary>
        ///<param name="value" type="Boolean"/>
    }
};
XrmTypes.Section.prototype = {
    getLabel: function () {
        ///<summary>Returns the label for the section.</summary>
        ///<returns type="String"/>
    },
    getParent: function () {
        ///<summary>Returns the tab containing the section.</summary>
        ///<returns type="XrmTypes.Tab"/>
    },
    getName: function () {
        ///<summary>Returns the name of the section.</summary>
        ///<returns type="String"/>
    },
    getVisible: function () {
        ///<summary>Returns a value that indicates whether the section is visible.</summary>
        ///<returns type="Boolean"/>
    },
    setLabel: function (value) {
        ///<summary>Sets the label for the section.</summary>
        ///<param name="value" type="String">Label</param>
    },
    setVisible: function (value) {
        ///<summary>Sets a value that indicates whether the section is visible.</summary>
        ///<param name="value" type="Boolean"/>
    }
};
XrmTypes.Entity.prototype = {
    addOnSave: function(delegate) {
        ///<summary>Sets a function to be called when the record is saved.</summary>
        ///<param name="delegate" type="Delegate>function pointer</param>
    },
    removeOnSave: function(delegate) {
        ///<summary>Removes a function from the OnSave event hander.</summary>
        ///<param name="delegate" type="Delegate>function pointer</param>
    },
    getId: function () {
        ///<summary>Returns a string representing the GUID id value for the record</summary>
        ///<returns type="String"/>
    },
    getIsDirty: function () {
        ///<summary>Returns a Boolean value that indicates if any fields in the form have been modified.</summary>
        ///<returns type="Boolean"/>
    },
    getEntityName: function () {
        ///<summary>Returns a string representing the logical name of the entity for the record.</summary>
        ///<returns type="String"/>
    },
    getDataXml: function () {
        ///<summary>Returns a string representing the xml that will be sent to the server when the record is saved.</summary>
        ///<returns type="String"/>
    },
    save: function (type) {
        ///<summary>Saves the record. </summary>
        ///<param name="type" type="String" optional="true">(Optional) No value save the records. "SaveAndClose" save then close the record. "SaveAndNew" save then open a new Create form.</param>
    }
}
XrmTypes.Control.prototype = {
    addCustomView: function(viewId, entityName, viewDisplayName, fetchXml, layoutXml, isDefault) {
        ///<summary>Adds a new view for the lookup dialog.</summary>
        ///<param name="viewId" type="String">String: The string representation of a GUID Id for a view. This value is never saved and only needs to be unique amongst the other available views for the lookup. A string for a non-valid GUID will work, for example “{00000000-0000-0000-0000-000000000001}”.</param>
        ///<param name="entityName" type="String">The name of the entity.</param>
        ///<param name="viewDisplayName" type="String">The name of the view.</param>
        ///<param name="fetchXml" type="String">The fetchXml query for the view.</param>
        ///<param name="layoutXml" type="String">The XML defining the layout of the view.</param>
        ///<param name="isDefault" type="Boolean">Whether the view should be the default view.</param>
    },
    addOption: function(option, index) {
        ///<summary>Adds an option to an Option set control.</summary>
        ///<param name="option" type="XrmTypes.Option">An option object to add to the OptionSet.</param>
        ///<param name="index" type="Number"> (Optional) The index position to place the new option. If not provided the option will be added to the end.</param>
    },
    clearOptions: function() {
        ///<summary>Clears all options from an Option Set control.</summary>
    },
    getAttribute: function() {
        ///<summary>Returns the attribute that the control is bound to.</summary>
        ///<returns type="XrmTypes.Attribute"/>
    },
    getControlType: function() {
        ///<summary>Returns a value that categorizes controls. Return Value  Description. Values 0: Standard, 1: Hidden, 2: IFrame, 3: Lookup, 4: Option Set, 5: SubGrid, 6: Web Resource</summary>
        ///<returns type="Number"/>
    },
    getDefaultView: function() {
        ///<summary>Returns the Id value of the default lookup dialog view.</summary>
        ///<returns type="String"/>
    },
    getDisabled: function() {
        ///<summary>Returns whether the control is disabled. This method is not available for Web Resource controls.</summary>
        ///<return type="Boolean"/>
    },
    getLabel: function () {
        ///<summary>Returns the label for the control.</summary>
        ///<returns type="String"/>
    },
    getName: function() {
        ///<summary>Returns the name assigned to the control.</summary>
        ///<returns type="String"/>
    },
    getParent: function() {
        ///<summary>Returns a reference to the section object that contains the control.</summary>
        ///<returns type="XrmTypes.Section"/>
    },
    getSrc: function() {
        ///<summary>Returns the current URL being displayed in an IFrame or Web Resource.</summary>
        ///<returns type="String"/>
    },
    getInitialUrl: function() {
        ///<summary>Returns the default URL that an IFrame control is configured to display. This method is not available for Web Resources.</summary>
        ///<returns type="String"/>
    },
    getObject: function() {
        ///<summary>Returns the object in the form representing an IFrame or Web resource.</summary>
        ///<returns type="Object"/>
    },
    getVisible: function() {
        ///<summary>Returns a value that indicates whether the control is currently visible.</summary>
        ///<returns type="Boolean"/>
    },
    refresh: function()
    {
        ///<summary>Refreshes the data displayed in a Sub-Grid.</summary>
    },
    removeOption: function(value) {
        ///<summary>Removes an option from an Option Set control.</summary>
        ///<param name="value" type="Number">The value of the option you want to remove.</param>
    },
    setDefaultView: function(viewGuid) {
        ///<summary>Sets the default view for the lookup control dialog.</summary>
        ///<param name="viewGuid" type="String"></param>
    },
    setDisabled: function(value) {
        ///<summary>Sets whether the control is disabled.</summary>
        ///<param name="value" type="Boolean"></param>
    },
    setFocus: function() {
        ///<summary>Sets the focus on the control</summary>
    },
    setLabel: function(label) {
        ///<summary>Sets the label for the control.</summary>
        ///<param name="label" type="String"></param>
    },
    setSrc: function(src) {
        ///<summary>Sets the URL to be displayed in an IFrame or Web Resource.</summary>
        ///<param name="src" type="String"></param>
    },
    setVisible: function(value) {
        ///<summary>Sets a value that indicates whether the control is visible.</summary>
        ///<param name="value" type="Boolean"></param>
    }
};
XrmTypes.Attribute.prototype = {
    addOnChange: function(delegate) {
        ///<summary>Sets a function to be called when the attribute value is changed.</summary>
        ///<param name="delegate" type="Delegate"></param>
    },
    fireOnChange: function() {
        ///<summary>Causes the OnChange event to occur on the attribute so that any script associated to that event can execute. </summary>
    },
    getAttributeType: function () {
        ///<summary>Returns a string value that represents the type of attribute.</summary>
        ///<returns type="Object"/>
    },
    getInitialValue: function () {
        ///<summary>Returns the default option for Boolean and optionset type attributes.</summary>
        ///<returns type="Object"/>
    },
    getFormat: function () {
        ///<summary>Returns a string value that represents formatting options for the attribute.</summary>
        ///<returns type="String"/>
    },
    getIsDirty: function () {
        ///<summary>Returns a Boolean value indicating if there are unsaved changes to the attribute value.</summary>
        ///<returns type="Boolean"/>
    },
    getMax: function () {
        ///<summary>Returns a number indicating the maximum allowed value for an attribute.</summary>
        ///<returns type="Number"/>
    },
    getMaxLength: function () {
        ///<summary>Returns a number indicating the maximum length of a string or memo attribute.</summary>
        ///<returns type="Number"/>
    },
    getMin: function () {
        ///<summary>Returns a number indicating the minimum allowed value for an attribute.</summary>
        ///<returns type="Number"/>
    },
    getName: function () {
        ///<summary>Returns a string representing the logical name of the attribute.</summary>
        ///<returns type="String"/>
    },
    getOption: function (value) {
        ///<summary>Returns an option object with the name matching the argument passed to the method.</summary>
        ///<param name="value">String or Number value</param>
        ///<returns type="XrmTypes.Option"/>
    },
    getOptions: function () {
        ///<summary>Returns an array of option objects representing the valid options for an optionset attribute.</summary>
        ///<returns type="Array"/>
    },
    getParent: function () {
        ///<summary>Returns the entity object that is the parent to the attribute.</summary>
        ///<returns type="XrmTypes.Entity"/>
    },
    getPrecision: function () {
        ///<summary>Returns the number of digits allowed to the right of the decimal point.</summary>
        ///<returns type="Number"/>
    },
    getRequiredLevel: function () {
        ///<summary>Sets whether data is required or recommended for the attribute before the record can be saved. One of the values 'none', 'required', 'recommended'.</summary>
        ///<returns type="String"/>
    },
    getSelectedOption: function () {
        ///<summary>Returns the option object that is selected in an optionset attribute..</summary>
        ///<returns type="XrmTypes.Option"/>
    },
    getSubmitMode: function () {
        ///<summary>Returns a string indicating when data from the attribute will be submitted when the record is saved. One of the values 'allways', 'never', 'dirty'.</summary>
        ///<returns type="String"/>
    },
    getText: function () {
        ///<summary>Returns a string value of the text for the currently selected option for an optionset attribute.</summary>
        ///<returns type="String"/>
    },
    getUserPrivilege: function () {
        ///<summary>Returns an array of privileges that contain Boolean values indicating if the user can create, read or update data values for an attribute.</summary>
        ///<returns type="String"/>
    },
    getValue: function () {
        ///<summary>Retrieves the data value for an attribute.</summary>
        ///<returns type="Object"/>
    },
    removeOnChange: function (delegate) {
        ///<summary>Removes a function from the OnChange event hander for an attribute.</summary>
        ///<param name="delegate" type="Delegate"/>
    },
    setRequiredLevel: function (value) {
        ///<summary>Sets whether data is required or recommended for the attribute before the record can be saved.</summary>
        ///<param name="value" type="String">One of the values 'none', 'required', 'recommended'.</param>
    },
    setSubmitMode: function (value) {
        ///<summary>Sets whether data from the attribute will be submitted when the record is saved.</summary>
        ///<param name="value" type="String">One of the values 'none', 'required', 'recommended'.</param>
    },
    setValue: function (value) {
        ///<summary>Sets the data value for an attribute.</summary>
        ///<param name="value" type="Object"/>
    }
};

XrmTypes.Option.prototype = {
    text: '',
    value: 0
}
XrmTypes.Lookup.prototype = {
    entityType: '',
    id: 0,
    name: 0
}
XrmTypes.Context.prototype = {
    getAuthenticationHeader: function () {
        ///<summary>Returns the encoded SOAP header necessary to use Microsoft Dynamics CRM 4.0 web service calls using Jscript. </summary>
        ///<returns type="String"/>
    },
    getCurrentTheme: function() {
        ///<summary>Returns a string representing the current Microsoft Office Outlook theme chosen by the user.</summary>
        ///<returns type="String"/>
    },
    getOrgLcid: function () {
        ///<summary>Returns the LCID value that represents the Microsoft Dynamics CRM Language Pack that is the base language for the organization. </summary>
        ///<returns type="Number"/>
    },
    getOrgUniqueName: function () {
        ///<summary>Returns the unique text value of the organizations name. </summary>
        ///<returns type="String"/>
    },
    getQueryStringParameters: function () {
        ///<summary>Returns an array of key value pairs representing the query string arguments that were passed to the page. </summary>
        ///<returns type="Array"/>
    },
    getServerUrl: function () {
        ///<summary>Returns the base server URL. When a user is working offline with the Microsoft Dynamics CRM for Microsoft Office Outlook client, the URL is to the local Microsoft Dynamics CRM Web services. </summary>
        ///<returns type="String"/>
    },
    getUserId: function () {
        ///<summary>Returns GUID value of the SystemUser.id value for the current user. </summary>
        ///<returns type="String"/>
    },
    getUserLcid: function () {
        ///<summary>Returns the LCID value that represents the Microsoft Dynamics CRM Language Pack that is the user selected as their preferred language. </summary>
        ///<returns type="Number"/>
    },
    getUserRoles: function () {
        ///<summary>Returns an array of strings representing the GUID values of each of the security roles that the user is associated with. </summary>
        ///<returns type="Array"/>
    },
    isOutlookClient: function() {
        ///<summary>Returns a Boolean value indicating if the user is using the Microsoft Dynamics CRM for Microsoft Office Outlook client.</summary>
        //<returns type="Boolean"/>
    },
    isOutlookOnline: function() {
        ///<summary>Returns a Boolean value indicating whether the user is connected to the Microsoft Dynamics CRM server while using the Microsoft Dynamics CRM for Microsoft Office Outlook with Offline Access client. When this function returns false, the user is working offline without a connection to the server. They are interacting with an instance of Microsoft Dynamics CRM running on their local computer.</summary>
        //<returns type="Boolean"/>
    },
    prependOrgName: function(sPath)
    {
        ///<summary>Prepends the organization name to the specified path.</summary>
        ///<param name="sPath" type="String">A local path to a resource.</param>
        ///<returns type="String"/>
    }
};
var Xrm = new XrmTypes.Xrm();



function GetGlobalContext() {
    ///<returns type="XrmTypes.Context"/>
}