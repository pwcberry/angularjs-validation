(function (angular) {

    /*
     * Private object that defines the functions for the validation rules.
     */
    var validationRules = {
        required: function required(el) {
            var val;

            if (el.type == 'checkbox') {
                return el.checked;
            } else if (el.type == 'file') {
                return el.files.length;
            }
            val = el.value.trim();
            return val.length > 0;
        },
        code: function code(el) {
            var val = el.value.trim(),
                maxLength = el.maxLength,
                theCode = Number(val);
            return val.length === maxLength && !isNaN(theCode);
        },
        mobile: function mobile(el) {
            var reMobile = /^(04\d\d)(\d{6})$/,
                val = el.value.replace(/\s/g, ''),
                phone = (reMobile.test(val) && RegExp.$2);

            return phone && (phone.length === 6);
        },
        telephone: function telephone(el) {
            var reFixed = /^(0[2378]|13)([02-9]\d{7})$/,
                val = el.value.replace(/\s/g, ''),
                phone = (reFixed.test(val) && RegExp.$2);

            if (phone && phone.length === 8) {
                return true;
            } else {
                return validationRules.mobile(el);
            }
        },
        range: function (minValue, maxValue) {
            return function range(el) {
                var val = parseInt(el.value.replace(/\s/g, ''), 10);
                return !isNaN(val) && (val >= minValue && val <= maxValue);
            };
        },
        pattern: function (regex) {
            return function pattern(el) {
                var re = new RegExp(regex.replace('\\', '\\\\')),
                    match = re.exec(el.value);
                return match !== null && typeof match[0] == 'string';
            };
        },
        email: function () {
            return function email(el) {
                var val = el.value.trim(),
                    reEmail = new RegExp('[a-z0-9!#$%&\u0027*+/=?^_`{|}~-]+(?:\u002e[a-z0-9!#$%&\u0027*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\u002e)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])');

                return reEmail.test(val);
            };
        },
        matchWith: function ($parse, $scope, model) {
            return function matchWith(el) {
                var value = el.value,
                    compareWith = $parse(model)($scope);
                if (!value || typeof compareWith == 'undefined') {
                    return true;
                } else {
                    return value.trim() == compareWith.trim();
                }
            };
        },
        number: function (type) {
            return function number(el) {
                var value = el.value.trim(),
                    result;

                switch (type.toLowerCase()) {
                    case 'int':
                    case 'integer':
                        result = (/^\d+$/.test(value));
                        break;
                    case 'float':
                        result = !isNaN(parseFloat(value));
                        break;
                    default:
                        break;
                }

                return result;
            };
        },
        textLength: function (minValue, maxValue) {
            return function textLength(el) {
                var value = el.value.trim();
                return value.length >= minValue && value.length <= maxValue;
            };
        },
        radioGroup: function ($parse, $scope, model) {
            return function radioGroup() {
                var value = $parse(model)($scope);
                return angular.isDefined(value);
            };
        },
        checkbox: function () {
            return function checkbox(el) {
                var result = el.checked;
                return result;
            };
        },
        checkboxGroup: function ($parse, $scope, model) {
            return function checkboxGroup(el) {
                var isValid = false,
                    checkboxes, modelValue = $parse(model)($scope);

                if (!angular.isArray(modelValue)) {
                    checkboxes = el.form[el.name];
                    angular.forEach(checkboxes, function (chk) {
                        if (chk.checked) {
                            isValid = true;
                            return false;
                        }
                    });
                } else if (modelValue.length) {
                    isValid = true;
                    angular.forEach(modelValue, function (item) {
                        var check = item !== null && ((typeof item == 'boolean' && item) || (angular.isString(item) && item.length));
                        isValid = isValid && check;
                    });
                }

                return isValid;
            };
        }
    };

    /*
     *  Private object to keep track of validators registered for each form.
     */
    var registeredForms = {};

    var FormValidation = (function () {
        function FormValidation(name) {
            this.name = name;
            this.fields = {};
            this.firstValidation = false;
            this.fieldsAreSet = false;
        }

        FormValidation.prototype = {
            add: function (key, validator) {
                var keyHasValidator = false;

                    if (!angular.isArray(this.fields[key])) {
                        this.fields[key] = [];
                    }

                if (this.fields[key].length) {
                    angular.forEach(this.fields[key], function (v) {
                        keyHasValidator = v.name == validator.name;
                        if (keyHasValidator) {
                            return false;
                        }
                    });
                }

                if (!keyHasValidator) {
                    this.fields[key].push(validator);
                }
            },
            validate: function () {
                var isFormValid = true;

                Object.keys(this.fields).forEach(function (key) {
                    var isValid, validators = this.fields[key];

                    validators.forEach(function (validator, index) {
                        var result = index === 0 ? validator() : validator(isValid);
                        isValid = (typeof isValid == 'boolean') ? (isValid && result) : result;
                    });

                    isFormValid = isFormValid && isValid;

                }.bind(this));

                return isFormValid;
            }
        };

        return FormValidation;
    })();

    /*
     * Private function factory to create validators.
     */
    var makeValidator = function (element, $scope, key, watching, validate) {
        return function (validState) {
            var container = element.parent(),
                invalidStateKey = element.data('invalidKey'),
                invalidRequired = (/^valRequired/.test(invalidStateKey)),
                isRequired = (/^valRequired/.test(key)),
                isValid = false;

            // If an element has the attribute 'val-required', this takes precedence over all other validation rules.
            if ((angular.isUndefined(validState) || (angular.isDefined(validState) && validState)) || isRequired) {
                isValid = validate(element[0]);

                if (!isValid) {
                    container.addClass('has-validation-error');
                    $scope[key] = true;


                    // The previous validation is to be cleared if the required field is invalid
                    if (angular.isString(invalidStateKey) && !invalidRequired && isRequired) {
                        $scope[invalidStateKey] = false;
                    }

                    element.data('invalidKey', key);
                } else {
                    if (!isRequired || (invalidRequired && isRequired)) {
                        container.removeClass('has-validation-error');
                        $scope[key] = false;
                        element.data('invalidKey', undefined);
                    } else if (isRequired) {
                        // There is another validator currently in an invalid state
                        $scope[key] = false;
                    }
                }
            }

            if ($scope.$root) {
            if (!watching && !$scope.$root.$$phase) {
                $scope.$apply();
            }
            } else {
                // Element is no longer a part of the DOM
                $scope[key] = false;
                return true;
            }

            return isValid;
        };
    };

    var registerForValidation = function (form) {
        var name;

        // Generate unique key for the form to be validated.
        // The directives will use this as a reference.
        if (form && form.tagName.toUpperCase() === 'FORM') {
            name = form.name.trim();

            if (!registeredForms.hasOwnProperty(name)) {

                if (name.length === 0) {
                    name = form.id.trim();
                    name = name.length ? form.id : 'form';
                }

                form.name = name = name.trim().concat('_', (+new Date()));

                registeredForms[name] = new FormValidation(name);
            }

            return registeredForms[name];
        }

        return null;
    };

    /*
     * Private method to set the validation display behaviour.
     */
    var setBehaviour = function ($scope, $element, $attr, key, validationFunc) {
        var registeredForm,
            checkable = ((/radio|checkbox/).test($element[0].type)),
            watching = (angular.isDefined($attr.valWatch) || checkable),
            validator = makeValidator($element, $scope, key, watching, validationFunc),
            name = key.substr(key.indexOf('_') + 1);

        // Initialize the state of the element's validator
        $scope[key] = false;

        if (watching && !checkable) {
            $scope.$watch(function () {
                validator();
            });
        } else {
            registeredForm = registerForValidation($element[0].form);

            if (registeredForm) {
                registeredForm.add(name, validator);

                // Checking for the blur event doesn't make sense with radio buttons.
                // When a user is using the keyboard to navigate radio buttons,
                // because only one radio button from the group is actually known to the directive.
                if (!checkable) {
                    $element.on('blur', function () {
                        if (!registeredForm.firstValidation) {
                            validator();
                        }
                    });
                } else {
                    // When the radio button changes, we need to remove any validation errors
                    $scope.$watch(function () {
                        if (!registeredForm.firstValidation) {
                            validator();
                        }
                    });
                }
            }
        }
    };

    var makeKey = function (directiveName, model) {
        return directiveName + '_' + model.replace(/\./g, '_');
    };

    /**
     * Custom directives to handle form validation.
     */
    angular.module('Validation', [])
        .directive('valForm', function ($parse) {
            /**
             * Specify that submission of a form is the first step of validation. Subsequent validation is performed when the input field changes.
             *
             * This directive also supresses the submit event. To handle the event, attach a function to the "val-submit" attribute.
             * The parameter "form" can be passed into the function so the function body has a reference to the form submitted.
             *
             * For form submission to work correctly, a button such as <button type="submit"></button> or <input type="submit"/> as a
             * descendent of the form needs to be included in the form's HTML structure.
             *
             * Sample usage:
             *
             * <form name="SignIn" val-form val-submit="signIn(form")>
             *     <!-- form contents -->
             * </form>
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var submitHandler,
                        registeredForm = registerForValidation($element[0]);

                    if (registeredForm) {

                        // Flag to determine if element should
                        // apply validation when user moves away from target element
                        // after the first attempt at form submission
                        registeredForm.firstValidation = true;

                        submitHandler = $parse($attr.valSubmit);
                        $element.on('submit', function (ev) {
                            try {
                                if (registeredForm.firstValidation) {
                                    registeredForm.firstValidation = false;
                                }
//                                if (!registeredForm.fieldsAreSet) {
//                                    registeredForm.fieldsAreSet = true;
//                                }
                                if (registeredForm.validate() && angular.isDefined(submitHandler)) {
                                    $scope.$eval(function () {
                                        submitHandler($scope, {
                                            form: $element
                                        });
                                    });
                                }
                            } catch (e) {
                                console.error(e);
                            } finally {
                                ev.preventDefault();
                            }
                        });
                    }
                }
            };
        })
        .directive('valRequired', function (makeErrorElement) {
            /**
             * Validate an input to ensure it has a value, thus complying with its mandatory status.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="member.FirstName" val-required="Please enter your first name" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valRequired', $attr.ngModel);
                    makeErrorElement($element, $attr.valRequired, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.required);
                }
            };
        }).directive('valCode', function (makeErrorElement) {
            /**
             * Validate a numeric code.
             *
             * The maximum length of the code can be specified by the attribute val-code-length,
             * or by adding the "maxlength" attribute of the <input/> element.
             *
             * Used for SMS verification.
             *
             * Sample usage:
             *
             * <input type="text" maxlength="4" ng-model="code" val-code="Invalid code" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valCode', $attr.ngModel);
                    if (angular.isDefined($attr.valCodeLength)) {
                        $element[0].maxLength = parseInt($attr.valCodeLength, 10);
                    }
                    makeErrorElement($element, $attr.valCode, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.code);
                }
            };
        }).directive('valMobile', function (makeErrorElement) {
            /**
             * Validate an Australian mobile number.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="profile.MobilePhone" val-mobile="Invalid mobile number" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valMobile', $attr.ngModel);
                    makeErrorElement($element, $attr.valMobile, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.mobile);
                }
            };
        }).directive('valTelephone', function (makeErrorElement) {
            /**
             * Validate an Australian land-line or mobile phone number.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="phone" val-telephone="Invalid phone number" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valTelephone', $attr.ngModel);
                    makeErrorElement($element, $attr.valTelephone, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.telephone);
                }
            };
        }).directive('valRange', function ($parse, makeErrorElement) {
            /**
             * Validate a number according to a specified range.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="age" val-range="Please enter a value from 18 to 80" val-range-min="18" val-range-max="80" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var minValue = $parse($attr.valRangeMin)(),
                        maxValue = $parse($attr.valRangeMax)(),
                        message = $attr.valRange,
                        key = makeKey('valRange', $attr.ngModel);

                    minValue = (isNaN(minValue) ? 0 : minValue);
                    maxValue = (isNaN(maxValue) ? Number.MAX_VALUE : maxValue);

                    makeErrorElement($element, message, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.range(minValue, maxValue));
                }
            };
        }).directive('valPattern', function (makeErrorElement) {
            /**
             * Validate an input according to a specified regular expression pattern.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="telephone" val-pattern="Invalid phone number" val-pattern-regex="(\+\d+)?(\d+)?(\d{1,10})" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var regex = $attr.valPatternRegex,
                        key = makeKey('valPattern', $attr.ngModel);

                    makeErrorElement($element, $attr.valPattern, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.pattern(regex));
                }
            };
        }).directive('valEmail', function (makeErrorElement) {
            /**
             * Validate an email address.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="email" val-email="Invalid email" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valEmail', $attr.ngModel);

                    makeErrorElement($element, $attr.valEmail, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.email());
                }
            };
        }).directive('valMatch', function ($parse, makeErrorElement) {
            /**
             * Validate an input by comparing (or matching) with the value of another model binding.
             *
             * Sample usage:
             *
             * <input type="text" val-match="The password fields do not match" val-match-with="password" ng-model="confirmPassword" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valMatch', $attr.ngModel),
                        matchWith = $attr.valMatchWith;

                    makeErrorElement($element, $attr.valMatch, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.matchWith($parse, $scope, matchWith));
                }
            };
        }).directive('valNumber', function (makeErrorElement) {
            /**
             * Validate the input to determine if it is an integer or a float (decimal).
             *
             * The default number type is integer.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="price" val-number="Invalid price" val-number-type="float" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valNumber', $attr.ngModel),
                        numberType = $attr.valNumberType || 'int';

                    makeErrorElement($element, $attr.valNumber, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.number(numberType));
                }
            };
        }).directive('valLength', function ($parse, makeErrorElement) {
            /**
             * Validate the length of an input value according to minimum or maximum length requirements.
             *
             * If neither minimum or maximum length are specified, validation passes.
             *
             * Sample usage:
             *
             * <input type="text" ng-model="productTitle" val-length="Please enter text from 1 to 10 characters" val-length-min="1" val-length-max="10" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var minLength = $parse($attr.valLengthMin)(),
                        maxLength = $parse($attr.valLengthMax)(),
                        message = $attr.valLength,
                        key = makeKey('valLength', $attr.ngModel);

                    minLength = (isNaN(minLength) ? 0 : minLength);
                    maxLength = (isNaN(maxLength) ? Number.MAX_VALUE : maxLength);

                    makeErrorElement($element, message, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.textLength(minLength, maxLength));
                }
            };
        }).directive('valRadio', function ($parse, makeErrorElement) {
            /**
             * Validate a group of radio buttons, that have the same name or model, to ensure one is selected.
             *
             * Only one radio button in the group requires the directive.
             *
             * Sample usage:
             *
             * <input type="radio" ng-model="gender" value="male" val-radio="Please select male or female"/>
             * <input type="radio" ng-model="gender" value="female" />
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valRadio', $attr.ngModel);

                    makeErrorElement($element, $attr.valRadio, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.radioGroup($parse, $scope, $attr.ngModel));
                }
            };
        }).directive('valCheckbox', function ($parse, makeErrorElement) {
            /**
             * Validate a checkbox to ensure it has been selected.
             *
             * Sample usage:
             *
             * <input type="checkbox" ng-model="termsAndConditions" ng-true-value="true" val-checkbox="Please confirm you've read the terms and conditions"/>
             */
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valCheckbox', $attr.ngModel);

                    makeErrorElement($element, $attr.valCheckbox, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.checkbox());
                }
            };
        }).directive('valCheckboxGroup', function ($parse, makeErrorElement) {
            /**
             * Validate a group of checkboxes to ensure at least one has been selected.
             *
             * The model for the group can be an array, or each checkbox must have the same "name" attribute value and different model bindings.
             *
             * Sample usage:
             *
             * <input type="checkbox" ng-model="food[0]" ng-true-value="chicken" val-checkbox-group="Please specify your meat course"/>
             * <input type="checkbox" ng-model="food[1]" ng-true-value="lamb" />
             * <input type="checkbox" ng-model="food[2]" ng-true-value="fish" />
             */
            return {
                link: function ($scope, $element, $attr) {
                    var name = angular.isDefined($attr.ngModel) ? $attr.ngModel : $element[0].name,
                        key = makeKey('valCheckboxGroup', name.replace(/\[\d+\]/, '')),
                        modelArrayName = angular.isDefined($attr.ngModel) ? $attr.ngModel.replace(/\[\d+\]/, '') : '';

                    makeErrorElement($element, $attr.valCheckboxGroup, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.checkboxGroup($parse, $scope, modelArrayName));
                }
            };
        }).directive('preventTabNext', function () {
            /**
             * Prevent the user from tabbing to the next element in the tab-index sequence.
             */
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    $element.on('keydown', function (ev) {
                        if (ev.which === 9) {
                            ev.preventDefault();
                            ev.stopPropagation();
                        }
                    });
                }
            };
        }).factory('makeErrorElement', function ($compile) {
            // Private function to add the error element to the container with the target input element.
            // Declared here to manage the $compile dependency (rather than having every directive having to declare it).
            return function (element, message, key, $scope) {
                var msg = (angular.isString(message) ? message : 'Invalid'),
                    err = $compile('<span class="error-message" ng-show="' + key + '">' + msg + '</span>')($scope);
                element.parent().append(err);
            };
        });

}(angular));