(function (angular) {

    /*
     * Private object that defines the functions for the validation rules.
     */
    var validationRules = {
        required: function (el) {
            var val;

            if (el.type == 'checkbox') {
                return el.checked;
            } else if (el.type == 'file') {
                return el.files.length;
            }
            val = el.value.trim();
            return val.length > 0;
        },
        code: function (el) {
            var val = el.value.trim(),
                maxLength = el.maxLength,
                code = Number(val);
            return val.length === maxLength && !isNaN(code);
        },
        mobile: function (el) {
            var reMobile = /^(04\d\d)(\d{6})$/,
                val = el.value.replace(/\s/g, ''),
                phone = (reMobile.test(val) && RegExp.$2);

            return phone && (phone.length === 6);
        },
        telephone: function (el) {
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
            return function (el) {
                var val = parseInt(el.value.replace(/\s/g, ''), 10);
                return !isNaN(val) && (val >= minValue && val <= maxValue);
            };
        },
        pattern: function (pattern) {
            return function (el) {
                var re = new RegExp(pattern.replace('\\', '\\\\')),
                    match = re.exec(el.value);
                return match !== null && typeof match[0] == 'string';
            };
        },
        email: function () {
            return function (el) {
                var val = el.value.trim(),
                    reEmail = new RegExp('[a-z0-9!#$%&\u0027*+/=?^_`{|}~-]+(?:\u002e[a-z0-9!#$%&\u0027*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\u002e)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])');

                return reEmail.test(val);
            };
        },
        matchWith: function ($parse, $scope, model) {
            return function (el) {
                var value = el.value, compareWith = $parse(model)($scope);
                if (!value || typeof compareWith == 'undefined') {
                    return true;
                } else {
                    return value.trim() == compareWith.trim();
                }
            };
        },
        number: function (type) {
            return function (el) {
                var value = el.value.trim(), result;

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
            return function (el) {
                var value = el.value.trim();
                return value.length >= minValue && value.length <= maxValue;
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
                if (!this.fieldsAreSet) {
                    if (!angular.isArray(this.fields[key])) {
                        this.fields[key] = [];
                    }
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

            if (!watching) {
                $scope.$apply();
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
            watching = angular.isDefined($attr.valWatch),
            validator = makeValidator($element, $scope, key, watching, validationFunc),
            name = key.substr(key.indexOf('_') + 1);

        // Initialize the state of the element's validator
        $scope[key] = false;

        if (watching) {
            $scope.$watch(function () {
                validator();
            });
        } else {
            registeredForm = registerForValidation($element[0].form);

            if (registeredForm) {
                registeredForm.add(name, validator);

                $element.on('blur', function () {
                    if (!registeredForm.firstValidation) {
                        validator();
                    }
                });
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
                                if (!registeredForm.fieldsAreSet) {
                                    registeredForm.fieldsAreSet = true;
                                }
                                if (registeredForm.validate() && angular.isDefined(submitHandler)) {
                                    $scope.$apply(function () {
                                        submitHandler($scope, {form: $element});
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
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valRequired', $attr.ngModel);
                    makeErrorElement($element, $attr.valRequired, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.required);
                }
            };
        }).directive('valCode', function (makeErrorElement) {
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
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valMobile', $attr.ngModel);
                    makeErrorElement($element, $attr.valMobile, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.mobile);
                }
            };
        }).directive('valTelephone', function (makeErrorElement) {
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
             * Validate a number according to a specified range
             *
             * Sample usage:
             *
             * <input type="text" val-range="Please enter a value from 1 to 10" val-range-min="1" val-range-max="10" />
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
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var regex = $attr.valRegex,
                        key = makeKey('valPattern', $attr.ngModel);

                    makeErrorElement($element, $attr.valPattern, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.pattern(regex));
                }
            };
        }).directive('valEmail', function (makeErrorElement) {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valEmail', $attr.ngModel);

                    makeErrorElement($element, $attr.valEmail, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.email());
                }
            };
        }).directive('valMatch', function ($parse, makeErrorElement) {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attr) {
                    var key = makeKey('valEmail', $attr.ngModel),
                        matchWith = $attr.valMatchWith;

                    makeErrorElement($element, $attr.valMatch, key, $scope);
                    setBehaviour($scope, $element, $attr, key, validationRules.matchWith($parse, $scope, matchWith));
                }
            };
        }).directive('valNumber', function (makeErrorElement) {
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
             * Validate the length of a string according to minimum or maximum length requirements.
             *
             * If neither minimum or maximum length are specified, validation passes.
             *
             * Sample usage:
             *
             * <input type="text" val-length="Please enter text from 1 to 10 characters" val-length-min="1" val-length-max="10" />
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
        }).directive('preventTabNext', function () {
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