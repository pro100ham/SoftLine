//UR 12 UPGRADE COMPLETED
// LiveValidation 1.3 (standalone version)
// Copyright (c) 2007-2008 Alec Hill (www.livevalidation.com)
// LiveValidation is licensed under the terms of the MIT License

/*********************************************** LiveValidation class ***********************************/

/**
*	validates a form field in real-time based on validations you assign to it
*	
*	@var element {mixed} - either a dom element reference or the string id of the element to validate
*	@var optionsObj {Object} - general options, see below for details
*
*	optionsObj properties:
*							validMessage {String} 	- the message to show when the field passes validation
*													  (DEFAULT: "Thankyou!")
*							onValid {Function} 		- function to execute when field passes validation
*													  (DEFAULT: function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); } )	
*							onInvalid {Function} 	- function to execute when field fails validation
*													  (DEFAULT: function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); })
*							insertAfterWhatNode {Int} 	- position to insert default message
*													  (DEFAULT: the field that is being validated)	
*              onlyOnBlur {Boolean} - whether you want it to validate as you type or only on blur
*                            (DEFAULT: false)
*              wait {Integer} - the time you want it to pause from the last keystroke before it validates (ms)
*                            (DEFAULT: 0)
*              onlyOnSubmit {Boolean} - whether should be validated only when the form it belongs to is submitted
*                            (DEFAULT: false)						
*/
window.LiveValidation = function(element, optionsObj) {
    this.initialize(element, optionsObj);
};

/** element types constants ****/

LiveValidation.TEXTAREA = 1;
LiveValidation.TEXT = 2;
LiveValidation.PASSWORD = 3;
LiveValidation.CHECKBOX = 4;
LiveValidation.SELECT = 5;
LiveValidation.FILE = 6;
LiveValidation.DIV = 7;

/****** Static methods *******/

/**
*	pass an array of LiveValidation objects and it will validate all of them
*	
*	@var validations {Array} - an array of LiveValidation objects
*	@return {Bool} - true if all passed validation, false if any fail						
*/
LiveValidation.massValidate = function(validations) {
    var valid = true;

    for (var i = 0, len = validations.length; i < len; ++i) {
        if (!validations[i].validate()) {
            if (valid) {
                var el = validations[i].element;
                try {
                    el.focus();
                    el.scrollIntoView(true);
                } catch (e) {
                    el.SetFocus();
                    el.scrollIntoView(true);
                }

                var inputValue = document.getElementById(el.id + "_i").value;

                if (inputValue) {
                    setSelectionRange(el, inputValue.length, inputValue.length);
                }
            }
            valid = false;
        }
    }
    return valid;
};

/****** prototype ******/

LiveValidation.prototype = {
    validClass: 'LV_valid',
    invalidClass: 'LV_invalid',
    messageClass: 'LV_validation_message',
    validFieldClass: 'LV_valid_field',
    invalidFieldClass: 'LV_invalid_field',

    /**
    *	initialises all of the properties and events
    *
    * @var - Same as constructor above
    */
    initialize: function(element, optionsObj) {
        var self = this;
        if (!element) throw new Error("LiveValidation::initialize - No element reference or element id has been provided!");
        this.element = element.nodeName ? element : document.getElementById(element);
        if (!this.element) throw new Error("LiveValidation::initialize - No element with reference or id of '" + element + "' exists!");
        // default properties that could not be initialised above
        this.validations = [];
        this.elementType = this.getElementType();
        this.form = this.element.form;
        // options
        var options = optionsObj || {};
        this.validMessage = options.validMessage || '';
        var node = options.insertAfterWhatNode || this.element;
        this.insertAfterWhatNode = node.nodeType ? node : document.getElementById(node);
        this.onValid = options.onValid || function () {
            Xrm.Page.getControl(element).clearNotification(element + "_n");
        };
        this.onInvalid = options.onInvalid || function () {
            Xrm.Page.getControl(element).clearNotification(element + "_n");
            Xrm.Page.getControl(element).setNotification(this.message, element + "_n");
        };
        this.onlyOnBlur = options.onlyOnBlur || false;
        this.wait = options.wait || 0;
        this.onlyOnSubmit = options.onlyOnSubmit || false;
        this.filterRegex = options.filterRegex || null;
        this.onBeforeValidate = options.onBeforeValidate || null;
        this.multipleValuesDelimeter = options.multipleValuesDelimeter || null;
        // events
        // collect old events     
        this.oldOnFocus = this.element.onfocus || function() {};
        this.oldOnBlur = this.element.onblur || function() {};
        this.oldOnClick = this.element.onclick || function() {};
        this.oldOnChange = this.element.onchange || function() {};
        this.oldOnKeyup = this.element.onkeyup || function() {};
        this.oldOnKeypress = this.element.onkeypress || function() {};
        this.element.onfocus = function(e) {
            self.oldOnFocus(e);
            self.doOnFocus(e);
        };
        if (!this.onlyOnSubmit) {
            switch (this.elementType) {
            case LiveValidation.CHECKBOX:
                this.element.onclick = function(e) {
                    self.oldOnClick(e);
                    return self.validate(e);
                };
            // let it run into the next to add a change event too
            case LiveValidation.SELECT:
            case LiveValidation.FILE:
                this.element.onchange = function(e) {
                    self.oldOnChange(e);
                    return self.validate(e);
                };
                break;
            default:
                if (this.filterRegex != null)
                    this.element.onkeypress = function(e) {
                        self.oldOnKeypress(e);
                        return self.doFilter(e);
                    };
                if (!this.onlyOnBlur)
                    this.element.onkeyup = function(e) {
                        self.oldOnKeyup(e);
                        if ((e || event).keyCode == 9) return;
                        return self.validate(e);
                    };
                this.element.onblur = function(e) {
                    self.oldOnBlur(e);
                    return self.doOnBlur(e);
                };
            }
        }
    },

    /**
    *	destroys the instance's events (restoring previous ones) 
    */
    destroy: function() {

        // remove events - set them back to the previous events
        this.element.onfocus = this.oldOnFocus;
        if (!this.onlyOnSubmit) {
            switch (this.elementType) {
            case LiveValidation.CHECKBOX:
                this.element.onclick = this.oldOnClick;
            // let it run into the next to add a change event too
            case LiveValidation.SELECT:
            case LiveValidation.FILE:
                this.element.onchange = this.oldOnChange;
                break;
            default:
                if (!this.onlyOnBlur) this.element.onkeyup = this.oldOnKeyup;
                this.element.onblur = this.oldOnBlur;
            }
        }
        this.validations = [];
        this.removeMessageAndFieldClass();
    },

    /**
    *	adds a validation to perform to a LiveValidation object
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validate.Presence )
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    * @return {Object} - the LiveValidation object itself so that calls can be chained
    */
    add: function(validationFunction, validationParamsObj) {
        this.validations.push({ type: validationFunction, params: validationParamsObj || {} });
        return this;
    },

    /**
    *	removes a validation from a LiveValidation object - must have exactly the same arguments as used to add it 
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validate.Presence )
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    * @return {Object} - the LiveValidation object itself so that calls can be chained
    */
    remove: function(validationFunction, validationParamsObj) {
        var found = false;
        for (var i = 0, len = this.validations.length; i < len; i++) {
            if (this.validations[i].type == validationFunction) {
                if (this.validations[i].params == validationParamsObj) {
                    found = true;
                    break;
                }
            }
        }
        if (found) this.validations.splice(i, 1);
        return this;
    },


    /**
    * makes the validation wait the alotted time from the last keystroke 
    */
    deferValidation: function(e) {
        if (this.wait >= 300) this.removeMessageAndFieldClass();
        var self = this;
        if (this.timeout) clearTimeout(self.timeout);
        this.timeout = setTimeout(function() { self.validate() }, self.wait);
    },

    /**
    * sets the focused flag to false when field loses focus 
    */
    doOnBlur: function(e) {
        this.focused = false;
        return this.validate(e);
    },

    /**
    * sets the focused flag to true when field gains focus 
    */
    doOnFocus: function(e) {
        this.focused = true;
    },

    /**
    *	gets the type of element, to check whether it is compatible
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validate.Presence )
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    */
    getElementType: function() {
        switch (true) {
        case (this.element.nodeName.toUpperCase() == 'DIV'):
                return LiveValidation.DIV;
        case (this.element.nodeName.toUpperCase() == 'TEXTAREA'):
            return LiveValidation.TEXTAREA;
        case (this.element.nodeName.toUpperCase() == 'INPUT' && this.element.type.toUpperCase() == 'TEXT'):
            return LiveValidation.TEXT;
        case (this.element.nodeName.toUpperCase() == 'INPUT' && this.element.type.toUpperCase() == 'PASSWORD'):
            return LiveValidation.PASSWORD;
        case (this.element.nodeName.toUpperCase() == 'INPUT' && this.element.type.toUpperCase() == 'CHECKBOX'):
            return LiveValidation.CHECKBOX;
        case (this.element.nodeName.toUpperCase() == 'INPUT' && this.element.type.toUpperCase() == 'FILE'):
            return LiveValidation.FILE;
        case (this.element.nodeName.toUpperCase() == 'SELECT'):
            return LiveValidation.SELECT;
        case (this.element.nodeName.toUpperCase() == 'INPUT'):
            throw new Error('LiveValidation::getElementType - Cannot use LiveValidation on an ' + this.element.type + ' input!');
        default:
            throw new Error('LiveValidation::getElementType - Element must be an input, select, or textarea!');
        }
    },

    //filter input
    doFilter: function(e) {
        var ev = e || event;
        var key = String.fromCharCode(ev.keyCode);
        if (key && !this.filterRegex.test(key)) {
            ev.returnValue = false;
            return false;
        }
        return true;
    },


    /**
    *	loops through all the validations added to the LiveValidation object and checks them one by one
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validate.Presence )
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    * @return {Boolean} - whether the all the validations passed or if one failed
    */
    doValidations: function() {
        if (this.onBeforeValidate != null) {
            this.onBeforeValidate(this.element);
        }
        this.validationFailed = false;
        for (var i = 0, len = this.validations.length; i < len; ++i) {
            var validation = this.validations[i];
            switch (validation.type) {
            case Validate.Presence:
            case Validate.Confirmation:
            case Validate.Acceptance:
                this.displayMessageWhenEmpty = true;
                this.validationFailed = !this.validateElement(validation.type, validation.params);
                break;
            default:
                this.validationFailed = !this.validateElement(validation.type, validation.params);
                break;
            }
            if (this.validationFailed) return false;
        }
        this.message = this.validMessage;
        return true;
    },

    /**
    *	performs validation on the element and handles any error (validation or otherwise) it throws up
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validate.Presence )
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    * @return {Boolean} - whether the validation has passed or failed
    */
    validateElement: function(validationFunction, validationParamsObj) {
        var value = (this.elementType == LiveValidation.SELECT) ? this.element.options[this.element.selectedIndex].value : document.getElementById(this.element.id+"_i").value;
        if (validationFunction == Validate.Acceptance) {
            if (this.elementType != LiveValidation.CHECKBOX) throw new Error('LiveValidation::validateElement - Element to validate acceptance must be a checkbox!');
            value = this.element.checked;
        }
        var isValid = true;
        try {
            if (this.multipleValuesDelimeter == null) {
                validationFunction(value, validationParamsObj);
            } else {
                var values = value.split(this.multipleValuesDelimeter) || [];
                for (var i = 0; i < values.length; i++) {
                    validationFunction(values[i], validationParamsObj);
                }
            }
        } catch (error) {
            if (error instanceof Validate.Error) {
                if (value !== '' || (value === '' && this.displayMessageWhenEmpty)) {
                    this.validationFailed = true;
                    this.message = error.message;
                    isValid = false;
                }
            } else {
                throw error;
            }
        } finally {
            return isValid;
        }
    },

    /**
    *	makes it do the all the validations and fires off the onValid or onInvalid callbacks
    *
    * @return {Boolean} - whether the all the validations passed or if one failed
    */
    validate: function() {
        if (!Xrm.Page.getControl(this.element.id).getDisabled()) {
            var isValid = this.doValidations();

            if (isValid) {
                this.onValid();
                return true;
            } else {
                this.onInvalid();
                return false;
            }
        } else {
            return true;
        }
    },

    /**
    *  enables the field
    *
    *  @return {LiveValidation} - the LiveValidation object for chaining
    */
    enable: function() {
        this.element.disabled = false;
        return this;
    },

    /**
    *  disables the field and removes any message and styles associated with the field
    *
    *  @return {LiveValidation} - the LiveValidation object for chaining
    */
    disable: function() {
        this.element.disabled = true;
        this.removeMessageAndFieldClass();
        return this;
    },

    /** Message insertion methods ****************************
    * 
    * These are only used in the onValid and onInvalid callback functions and so if you overide the default callbacks,
    * you must either impliment your own functions to do whatever you want, or call some of these from them if you 
    * want to keep some of the functionality
    */

    /**
    *	makes a span containg the passed or failed message
    *
    * @return {HTMLSpanObject} - a span element with the message in it
    */
    createMessageSpan: function() {
        var span = document.createElement('div');
        span.style.background = "coral";
        span.style.border = "1px solid coral";
        span.style.color = "black";
        span.style.padding = "3px 0px 3px 3px";
        //span.style.width = "100%";
        //span.style.margin = "10px 0 0 0";
        span.innerHTML = this.message;
        //var textNode = document.createTextNode(this.message);
        //span.appendChild(textNode);
        return span;
    },

    /**
    *	inserts the element containing the message in place of the element that already exists (if it does)
    *
    * @var elementToIsert {HTMLElementObject} - an element node to insert
    */
    insertMessage: function(elementToInsert) {
        this.removeMessage();
        if ((this.displayMessageWhenEmpty && (this.elementType == LiveValidation.CHECKBOX || this.element.value == ''))
            || this.element.value != '') {
            var className = this.validationFailed ? this.invalidClass : this.validClass;

            //do not insert if valid and validMessage == ''         
            if (className == this.validClass && this.validMessage == '')
                return;

            elementToInsert.className += ' ' + this.messageClass + ' ' + className;
            if (this.insertAfterWhatNode.nextSibling) {
                this.insertAfterWhatNode.parentNode.insertBefore(elementToInsert, this.insertAfterWhatNode.nextSibling);
            } else {
                this.insertAfterWhatNode.parentNode.appendChild(elementToInsert);
            }
        }
    },


    /**
    *	changes the class of the field based on whether it is valid or not
    */
    addFieldClass: function() {
        this.removeFieldClass();
        if (!this.validationFailed) {
            this.element.style.borderColor = "";
            this.element.style.backgroundColor = "";
            if (this.displayMessageWhenEmpty || this.element.value != '') {
                if (this.element.className.indexOf(this.validFieldClass) == -1) this.element.className += ' ' + this.validFieldClass;
            }
        } else {
            this.element.style.borderColor = "coral";
            this.element.style.backgroundColor = "#ffffae";
            this.element.style.padding = "0 0 0 0";
            if (this.element.className.indexOf(this.invalidFieldClass) == -1) this.element.className += ' ' + this.invalidFieldClass;
        }
    },

    /**
    *	removes the message element if it exists, so that the new message will replace it
    */
    removeMessage: function() {
        var nextEl;
        var el = this.insertAfterWhatNode;
        while (el.nextSibling) {
            if (el.nextSibling.nodeType === 1) {
                nextEl = el.nextSibling;
                break;
            }
            el = el.nextSibling;
        }
        if (nextEl && nextEl.className.indexOf(this.messageClass) != -1) this.insertAfterWhatNode.parentNode.removeChild(nextEl);
    },

    /**
    *	removes the class that has been applied to the field to indicte if valid or not
    */
    removeFieldClass: function() {
        if (this.element.className.indexOf(this.invalidFieldClass) != -1) this.element.className = this.element.className.split(this.invalidFieldClass).join('');
        if (this.element.className.indexOf(this.validFieldClass) != -1) this.element.className = this.element.className.split(this.validFieldClass).join(' ');
    },

    /**
    *	removes the message and the field class
    */
    removeMessageAndFieldClass: function() {
        this.removeMessage();
        this.removeFieldClass();
    }

}; // end of LiveValidation class


/*************************************** Validate class ****************************************/
/**
* This class contains all the methods needed for doing the actual validation itself
*
* All methods are static so that they can be used outside the context of a form field
* as they could be useful for validating stuff anywhere you want really
*
* All of them will return true if the validation is successful, but will raise a ValidationError if
* they fail, so that this can be caught and the message explaining the error can be accessed ( as just 
* returning false would leave you a bit in the dark as to why it failed )
*
* Can use validation methods alone and wrap in a try..catch statement yourself if you want to access the failure
* message and handle the error, or use the Validate::now method if you just want true or false
*/

var Validate = {

    /**
    *	validates that the field has been filled in
    *
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation 
    *													  (DEFAULT: "Can't be empty!")
    */
    Presence: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Can't be empty!";
        if (value === '' || value === null || value === undefined) {
            Validate.fail(message);
        }
        return true;
    },

    /**
    *	validates that the value is numeric, does not fall within a given range of numbers
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							notANumberMessage {String} - the message to show when the validation fails when value is not a number
    *													  	  (DEFAULT: "Must be a number!")
    *							notAnIntegerMessage {String} - the message to show when the validation fails when value is not an integer
    *													  	  (DEFAULT: "Must be a number!")
    *							wrongNumberMessage {String} - the message to show when the validation fails when is param is used
    *													  	  (DEFAULT: "Must be {is}!")
    *							tooLowMessage {String} 		- the message to show when the validation fails when minimum param is used
    *													  	  (DEFAULT: "Must not be less than {minimum}!")
    *							tooHighMessage {String} 	- the message to show when the validation fails when maximum param is used
    *													  	  (DEFAULT: "Must not be more than {maximum}!")
    *							is {Int} 					- the length must be this long 
    *							minimum {Int} 				- the minimum length allowed
    *							maximum {Int} 				- the maximum length allowed
    *                         onlyInteger {Boolean} - if true will only allow integers to be valid
    *                                                             (DEFAULT: false)
    *
    *  NB. can be checked if it is within a range by specifying both a minimum and a maximum
    *  NB. will evaluate numbers represented in scientific form (ie 2e10) correctly as numbers				
    */
    Numericality: function(value, paramsObj) {
        var suppliedValue = value;
        var value = Number(value);
        var paramsObj = paramsObj || {};
        var minimum = ((paramsObj.minimum) || (paramsObj.minimum == 0)) ? paramsObj.minimum : null;;
        var maximum = ((paramsObj.maximum) || (paramsObj.maximum == 0)) ? paramsObj.maximum : null;
        var is = ((paramsObj.is) || (paramsObj.is == 0)) ? paramsObj.is : null;
        var notANumberMessage = paramsObj.notANumberMessage || "Must be a number!";
        var notAnIntegerMessage = paramsObj.notAnIntegerMessage || "Must be an integer!";
        var wrongNumberMessage = paramsObj.wrongNumberMessage || "Must be " + is + "!";
        var tooLowMessage = paramsObj.tooLowMessage || "Must not be less than " + minimum + "!";
        var tooHighMessage = paramsObj.tooHighMessage || "Must not be more than " + maximum + "!";
        if (!isFinite(value)) Validate.fail(notANumberMessage);
        if (paramsObj.onlyInteger && (/\.0+$|\.$/.test(String(suppliedValue)) || value != parseInt(value))) Validate.fail(notAnIntegerMessage);
        switch (true) {
        case (is !== null):
            if (value != Number(is)) Validate.fail(wrongNumberMessage);
            break;
        case (minimum !== null && maximum !== null):
            Validate.Numericality(value, { tooLowMessage: tooLowMessage, minimum: minimum });
            Validate.Numericality(value, { tooHighMessage: tooHighMessage, maximum: maximum });
            break;
        case (minimum !== null):
            if (value < Number(minimum)) Validate.fail(tooLowMessage);
            break;
        case (maximum !== null):
            if (value > Number(maximum)) Validate.fail(tooHighMessage);
            break;
        }
        return true;
    },

    /**
    *	validates against a RegExp pattern
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Not valid!")
    *							pattern {RegExp} 		- the regular expression pattern
    *													  (DEFAULT: /./)
    *             negate {Boolean} - if set to true, will validate true if the pattern is not matched
    *                           (DEFAULT: false)
    *
    *  NB. will return true for an empty string, to allow for non-required, empty fields to validate.
    *		If you do not want this to be the case then you must either add a LiveValidation.PRESENCE validation
    *		or build it into the regular expression pattern
    */
    Format: function(value, paramsObj) {
        var value = String(value);
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Not valid!";
        var pattern = paramsObj.pattern || /./;
        var negate = paramsObj.negate || false;
        if (!negate && !pattern.test(value)) Validate.fail(message); // normal
        if (negate && pattern.test(value)) Validate.fail(message); // negated
        return true;
    },

    /**
    *	validates that the field contains a valid email address
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Must be a number!" or "Must be an integer!")
    */
    Email: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Must be a valid email address!";
        Validate.Format(value, { failureMessage: message, pattern: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i });
        return true;
    },

    /**
    *	validates the length of the value
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							wrongLengthMessage {String} - the message to show when the fails when is param is used
    *													  	  (DEFAULT: "Must be {is} characters long!")
    *							tooShortMessage {String} 	- the message to show when the fails when minimum param is used
    *													  	  (DEFAULT: "Must not be less than {minimum} characters long!")
    *							tooLongMessage {String} 	- the message to show when the fails when maximum param is used
    *													  	  (DEFAULT: "Must not be more than {maximum} characters long!")
    *							is {Int} 					- the length must be this long 
    *							minimum {Int} 				- the minimum length allowed
    *							maximum {Int} 				- the maximum length allowed
    *
    *  NB. can be checked if it is within a range by specifying both a minimum and a maximum				
    */
    Length: function(value, paramsObj) {
        var value = String(value);
        var paramsObj = paramsObj || {};
        var minimum = ((paramsObj.minimum) || (paramsObj.minimum == 0)) ? paramsObj.minimum : null;
        var maximum = ((paramsObj.maximum) || (paramsObj.maximum == 0)) ? paramsObj.maximum : null;
        var is = ((paramsObj.is) || (paramsObj.is == 0)) ? paramsObj.is : null;
        var wrongLengthMessage = paramsObj.wrongLengthMessage || "Must be " + is + " characters long!";
        var tooShortMessage = paramsObj.tooShortMessage || "Must not be less than " + minimum + " characters long!";
        var tooLongMessage = paramsObj.tooLongMessage || "Must not be more than " + maximum + " characters long!";
        switch (true) {
        case (is !== null):
            if (value.length != Number(is)) Validate.fail(wrongLengthMessage);
            break;
        case (minimum !== null && maximum !== null):
            Validate.Length(value, { tooShortMessage: tooShortMessage, minimum: minimum });
            Validate.Length(value, { tooLongMessage: tooLongMessage, maximum: maximum });
            break;
        case (minimum !== null):
            if (value.length < Number(minimum)) Validate.fail(tooShortMessage);
            break;
        case (maximum !== null):
            if (value.length > Number(maximum)) Validate.fail(tooLongMessage);
            break;
        default:
            throw new Error("Validate::Length - Length(s) to validate against must be provided!");
        }
        return true;
    },

    /**
    *	validates that the value falls within a given set of values
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Must be included in the list!")
    *							within {Array} 			- an array of values that the value should fall in 
    *													  (DEFAULT: [])	
    *							allowNull {Bool} 		- if true, and a null value is passed in, validates as true
    *													  (DEFAULT: false)
    *             partialMatch {Bool} 	- if true, will not only validate against the whole value to check but also if it is a substring of the value 
    *													  (DEFAULT: false)
    *             caseSensitive {Bool} - if false will compare strings case insensitively
    *                          (DEFAULT: true)
    *             negate {Bool} 		- if true, will validate that the value is not within the given set of values
    *													  (DEFAULT: false)			
    */
    Inclusion: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Must be included in the list!";
        var caseSensitive = (paramsObj.caseSensitive === false) ? false : true;
        if (paramsObj.allowNull && value == null) return true;
        if (!paramsObj.allowNull && value == null) Validate.fail(message);
        var within = paramsObj.within || [];
        //if case insensitive, make all strings in the array lowercase, and the value too
        if (!caseSensitive) {
            var lowerWithin = [];
            for (var j = 0, length = within.length; j < length; ++j) {
                var item = within[j];
                if (typeof item == 'string') item = item.toLowerCase();
                lowerWithin.push(item);
            }
            within = lowerWithin;
            if (typeof value == 'string') value = value.toLowerCase();
        }
        var found = false;
        for (var i = 0, length = within.length; i < length; ++i) {
            if (within[i] == value) found = true;
            if (paramsObj.partialMatch) {
                if (value.indexOf(within[i]) != -1) found = true;
            }
        }
        if ((!paramsObj.negate && !found) || (paramsObj.negate && found)) Validate.fail(message);
        return true;
    },

    /**
    *	validates that the value does not fall within a given set of values
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Must not be included in the list!")
    *							within {Array} 			- an array of values that the value should not fall in 
    *													  (DEFAULT: [])
    *							allowNull {Bool} 		- if true, and a null value is passed in, validates as true
    *													  (DEFAULT: false)
    *             partialMatch {Bool} 	- if true, will not only validate against the whole value to check but also if it is a substring of the value 
    *													  (DEFAULT: false)
    *             caseSensitive {Bool} - if false will compare strings case insensitively
    *                          (DEFAULT: true)			
    */
    Exclusion: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        paramsObj.failureMessage = paramsObj.failureMessage || "Must not be included in the list!";
        paramsObj.negate = true;
        Validate.Inclusion(value, paramsObj);
        return true;
    },

    /**
    *	validates that the value matches that in another field
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Does not match!")
    *							match {String} 			- id of the field that this one should match						
    */
    Confirmation: function(value, paramsObj) {
        if (!paramsObj.match) throw new Error("Validate::Confirmation - Error validating confirmation: Id of element to match must be provided!");
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Does not match!";
        var match = paramsObj.match.nodeName ? paramsObj.match : document.getElementById(paramsObj.match);
        if (!match) throw new Error("Validate::Confirmation - There is no reference with name of, or element with id of '" + paramsObj.match + "'!");
        if (value != match.value) {
            Validate.fail(message);
        }
        return true;
    },

    /**
    *	validates that the value is true (for use primarily in detemining if a checkbox has been checked)
    *	
    *	@var value {mixed} - value to be checked if true or not (usually a boolean from the checked value of a checkbox)
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation 
    *													  (DEFAULT: "Must be accepted!")
    */
    Acceptance: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        var message = paramsObj.failureMessage || "Must be accepted!";
        if (!value) {
            Validate.fail(message);
        }
        return true;
    },

    /**
    *	validates against a custom function that returns true or false (or throws a Validate.Error) when passed the value
    *	
    *	@var value {mixed} - value to be checked
    *	@var paramsObj {Object} - parameters for this particular validation, see below for details
    *
    *	paramsObj properties:
    *							failureMessage {String} - the message to show when the field fails validation
    *													  (DEFAULT: "Not valid!")
    *							against {Function} 			- a function that will take the value and object of arguments and return true or false 
    *													  (DEFAULT: function(){ return true; })
    *							args {Object} 		- an object of named arguments that will be passed to the custom function so are accessible through this object within it 
    *													  (DEFAULT: {})
    */
    Custom: function(value, paramsObj) {
        var paramsObj = paramsObj || {};
        var against = paramsObj.against || function() { return true; };
        var args = paramsObj.aargs || {};
        var message = paramsObj.failureMessage || "Not valid!";
        if (!against(value, args)) Validate.fail(message);
        return true;
    },

    /**
    *	validates whatever it is you pass in, and handles the validation error for you so it gives a nice true or false reply
    *
    *	@var validationFunction {Function} - validation function to be used (ie Validation.validatePresence )
    *	@var value {mixed} - value to be checked if true or not (usually a boolean from the checked value of a checkbox)
    *	@var validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
    */
    now: function(validationFunction, value, validationParamsObj) {
        if (!validationFunction) throw new Error("Validate::now - Validation function must be provided!");
        var isValid = true;
        try {
            validationFunction(value, validationParamsObj || {});
        } catch (error) {
            if (error instanceof Validate.Error) {
                isValid = false;
            } else {
                throw error;
            }
        } finally {
            return isValid
        }
    },

    /**
    * shortcut for failing throwing a validation error
    *
    *	@var errorMessage {String} - message to display
    */
    fail: function(errorMessage) {
        throw new Validate.Error(errorMessage);
    },

    Error: function(errorMessage) {
        this.message = errorMessage;
        this.name = 'ValidationError';
    }

};


//
// CUSTOM HELPER FUNCTIONS
//

String.prototype.ltrim = function () { return this.replace(/^\s+/g, ''); }
String.prototype.rtrim = function () { return this.replace(/\s+$/g, ''); }
String.prototype.trim = function () { return this.ltrim().rtrim(); }
String.prototype.wstrim = function () { return this.replace(/\s{2,}/g, ' '); }
function trimExtraSpaces(el) {
    if (!el) return;
    var elInput = document.getElementById(el.id+"_i");
    if (!elInput) return;

    if (!elInput.value || elInput.value.length == 0) return;

    var trimmedValue = elInput.value.wstrim();
    if (elInput.value != trimmedValue) elInput.value = trimmedValue;
}

function formatname(el) {
    if (!el) return;

    var elInput = document.getElementById(el.id + "_i");
    if (!elInput) return;
    if (elInput.value && elInput.value.length > 0) {
        var formattedValue = elInput.value.wstrim().ltrim();
        var arr = formattedValue.match(/./g);
        arr[0] = arr[0].toUpperCase();
        for (var i = 1, il = arr.length; i < il; i++) {
            if (arr[i - 1] == "-" || arr[i - 1] == " ")
                arr[i] = arr[i].toUpperCase();
            else
                arr[i] = arr[i].toLowerCase();
        }
        formattedValue = arr.join("");
        if (elInput.value != formattedValue) {
            var caret = getSelectionStart(elInput);
            elInput.value = formattedValue;
            setSelectionRange(elInput, caret, caret); //preserve caret position
        }
    }
}
function formatcap(el) {
    if (!el) return;

    var elInput = document.getElementById(el.id + "_i");
    if (!elInput) return;
    if (elInput.value && elInput.value.length > 0) {
        var capped = elInput.value.charAt(0).toUpperCase() + elInput.value.substr(1);
        if (elInput.value != capped) {
            var caret = getSelectionStart(elInput);
            elInput.value = capped;
            setSelectionRange(elInput, caret, caret); //preserve caret position
        }
    }
}
function formaturl(el) {
    if (!el) return;

    var elInput = document.getElementById(el.id + "_i");
    if (!elInput) return;

    if (elInput.value && elInput.value.length == 2 && elInput.value != "ht" && elInput.value != "ft")
        elInput.value = "http://" + elInput.value;

}
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
    else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
}
function getSelectionStart(o) {
    if (o.createTextRange) {
        var r = document.selection.createRange();
        r.moveEnd('character', o.value.length);
        if (r.text == '') return o.value.length;
        return o.value.lastIndexOf(r.text);
    }
    else return o.selectionStart;
}
function getSelectionEnd(o) {
    if (o.createTextRange) {
        var r = document.selection.createRange();
        r.moveStart('character', -o.value.length);
        return r.text.length;
    }
    else return o.selectionEnd;
}

//company name formatting
var COMPANY_ACRONYMS = ["АСУ", "АСУП", "АНО", "АО", "АЭС ", "БД", "в/ч", "ВНИИ", "ВЦИК", "ВЦ", "ГЭС ", "ГМК", "ГАИ", "ГИБДД ", "ГОУ", "ГП", "ГУП", "ГУ", "ГИ", "ГНИЦ", "ГНЦ", "ДПС", "ЕС", "ЖД", "ж/д", "ЗАО", "ИНН", "ИД", "ИП", "ИВЦ", "АКБ", "КБ", "ЛК", "МП", "МУП", "МУ", "НИИ", "НПФ", "НПО", "НПП", "НОУ", "ОГЭК", "ООО", "ОАО", "ПБОЮЛ", "ПО", "ПКО", "РА", "РАН", "РТС", "РИА", "с/х", "СП", "СОШ", "СМИ", "СК", "СМУ", "ТПП", "ТД", "УП", "ГУВД", "УВД", "УК", "УЦ", "ФГОУ ВПО", "ФГУП", "ФГУ", "ЦСИ", "ЦК", "ЦНИИ", "НИИ", "ЧОП", "ЧП", "ЮК", "АБ", "АО", "ЗАО", "АТ", "БО", "БК", "БФ", "ВПО", "ГДОУ", "ГМПКП", "ДЕЗ", "ДПО", "ДОУ", "ЖСК", "ЖЭП", "ИГ", "ИТК", "ИП", "ИЧП", "МГПП", "ММП", "МПП", "МГПО", "МУ", "МУРЭП", "НИЦ", "НМЦ", "НПО", "НПЦ", "НТЦ", "НЦ", "НОУ", "НОУ", "НП", "ООО", "ОДО", "ППИ", "ПО", "ПКФ", "ПКО", "ПКП", "ПСП", "РО", "РФ", "РЭУ", "РАН", "РФ", "СТ", "СПО", "ТОО", "ТП", "ТПО", "ТПК", "УМЦ", "ФК", "ФИК", "ЦДПО", "ЮФ"];
window.formatCompanyName = function(e) {
    var ev = e || event;
    var el = ev.srcElement;
    if (el == null) return;
    var name = el.value;
    if (name == null) return;
    name = name.trim().replace(/[""'']/g, "");
    var commaIndex = name.indexOf(",");
    var spaceIndex = name.indexOf(" ");
    var ind;
    if (commaIndex < 0 && spaceIndex < 0) return;
    else if (commaIndex < 0 && spaceIndex >= 0) ind = spaceIndex;
    else if (commaIndex >= 0 && spaceIndex < 0) ind = commaIndex;
    else if (spaceIndex > commaIndex) ind = commaIndex;
    else ind = spaceIndex;

    var word = name.substring(0, ind);
    var acronym = acronymLookup(word);
    if (acronym != null)
        name = name.substring(ind + 1).trim() + ", " + acronym;

    if (el.value != name) {
        el.value = name;
        if (el.onblur) el.onblur();
        formatCompanyName(ev);
    }
};
function acronymLookup(text) {
    if (text != null) {
        var match = text.toLowerCase();
        for (var i = 0, il = COMPANY_ACRONYMS.length; i < il; i++) {
            if (match == COMPANY_ACRONYMS[i].toLowerCase()) {
                return COMPANY_ACRONYMS[i];
            }
        }
    }
    return null;
}

//set-unset default value on focus
window.setDefaultOnFocus = function(input, defaultValue, cursorPos) {
    if (input != null) {
        if (input.onFocusFP != null)
            removeEvent(input, "focus", input.onFocusFP);
        if (input.onBlurFP != null)
            removeEvent(input, "blur", input.onBlurFP);

        input.onFocusFP = function() {
            if (Xrm.Page.getAttribute(input.id).getValue() == null) {
                Xrm.Page.getAttribute(input.id).setValue(defaultValue);
                if (cursorPos != null) setSelectionRange(input, cursorPos, cursorPos);
            }

        };
        input.onBlurFP = function() {
            if (Xrm.Page.getAttribute(input.id).getValue() == defaultValue) {
                Xrm.Page.getAttribute(input.id).setValue(null);
                if (input.onkeyup) input.onkeyup();
            }
        };

        addEvent(input, "focus", input.onFocusFP);
        addEvent(input, "blur", input.onBlurFP);
    }
};

function addEvent(elem, type, handler) {
    if (elem.addEventListener)
        elem.addEventListener(type, handler, false);
    else
        elem.attachEvent("on" + type, handler);
}

function removeEvent(elem, type, handler) {
    if (elem.removeEventListener)
        elem.removeEventListener(type, handler, false);
    else
        elem.detachEvent("on" + type, handler);
}