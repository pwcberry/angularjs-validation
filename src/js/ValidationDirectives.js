(function(angular) {

    /**
     * Private function factory to create validators.
     *
     * @param {Object} the form element that is the target of validation
     * @param {Object} the form element's container node
     * @param {Function} the validation function to invoke
     */
    var makeValidator = function(element, container, validate) {
        return function() {
            var isValid = !element.hasClass('has-error') && validate(element[0]);

            if (!isValid) {
                container.addClass('has-validation-error');
            } else {
                container.removeClass('has-validation-error');
            }

            return isValid;
        };
    };

    /**
     * Private function to add the error element to the container with the target input element.
     *
     * @param element {Object} the target
     * @param message {String} the custom message relevant to the validation
     * @param defaultMessage {String} a default message to display when the custom message is not specified
     */
    var makeErrorElement = function(element, message) {
        var msg = (angular.isString(message) ? message : 'Invalid'),
            err = angular.element('<span class="error-message">' + msg + '</span>');
        console.info('makeErrorElement');
        console.log('message: "%s"', message);
        element.parent().append(err);
    };

    /**
     * Private object that contains the definitions of the validation functions.
     *
     * This allows the functions to be shared amongst the directives.
     */
    var validators = {
        required: function(el) {
            var val;

            if (el.type == 'checkbox') {
                return el.checked;
            } else if (el.type == 'file') {
                return el.files.length;
            }
            val = el.value.trim();
            return val.length > 0;
        },
        code: function(el) {
            var val = el.value.trim(),
                maxLength = el.maxlength,
                code = parseInt(val, 10);
            return val.length === maxLength && !isNaN(code);
        },
        mobile: function(el) {
            var reMobile = /^(04\d\d)(\d{6})$/,
                val = el.value.replace(/\s/g, ''),
                phone = (reMobile.test(val) && RegExp.$2);

            return phone && (phone.length === 6);
        },
        telephone: function(el) {
            var reFixed = /^(0[2378]|13)([02-9]\d{7})$/,
                val = el.value.replace(/\s/g, ''),
                phone = (reFixed.test(val) && RegExp.$2);

            if (phone && phone.length === 8) {
                return true;
            } else {
                return validators.mobile(el);
            }
        },
        range: function(minValue, maxValue) {
            return function(el) {
                var val = parseInt(el.value.replace(/\s/g, ''), 10);
                return !isNaN(val) && (val >= minValue && val <= maxValue);
            };
        }
    };

    /**
     * Private method to set the validation display behaviour.
     *
     * @param $scope {Object} the local scope
     * @param $element {Object} the target element
     * @param valWatch if defined, validation will be invoked when the model updates
     * @param validationFunc the validation function to invoke
     */
    var setBehaviour = function($scope, $element, $attr, $parse, validationFunc) {
        var ngModelGet,
            watching = angular.isDefined($attr.valWatch),
            validator = makeValidator($element, $element.parent(), validationFunc);

        if (watching) {
            ngModelGet = $parse($attr.ngModel);
            $scope.$watch(function() {
                validator();
                return ngModelGet($scope);
            });
        } else {
            // For use on forms where submission initiates validation
            $element.on('blur', validator);
        }
    };

    /**
     * Custom directives to handle form validation.
     */
    angular.module('Validation', [])
        .directive('valRequired', function($parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attr) {
                    makeErrorElement($element, $attr.valRequired);
                    setBehaviour($scope, $element, $attr, $parse, validators.required);
                }
            };
        }).directive('valCode', function($parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attr) {
                    if (angular.isDefined($attr.valLength)) {
                        $element.prop('maxlength', parseInt($attr.valLength, 10));
                    }
                    makeErrorElement($scope, $attr.valCode);
                    setBehaviour($scope, $element, $attr, $parse, validators.code);
                }
            };
        }).directive('valMobile', function($parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attr) {
                    makeErrorElement($element, $attr.valMobile);
                    setBehaviour($scope, $element, $attr, $parse, validators.mobile);
                }
            };
        }).directive('valTelephone', function($parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attr) {
                    makeErrorElement($element, $attr.valTelephone);
                    setBehaviour($scope, $element, $attr, $parse, validators.telephone);
                }
            };
        }).directive('valRange', function($parse) {
            /**
             * Integer range
             *
             * <input type="text" val-range="Invalid" val-range-min="1" val-range-max="10" />
             */
            return {
                restrict: 'A',
                scope: {},
                link: function($scope, $element, $attr) {
                    var minValue = $parse($attr.valRangeMin)($scope),
                        maxValue = $parse($attr.valRangeMax)($scope);

                    minValue = (isNaN(minValue) ? 0 : minValue);
                    maxValue = (isNaN(maxValue) ? Number.MAX_VALUE : maxValue);

                    makeErrorElement($element, $attr.valRange);
                    setBehaviour($scope, $element, $attr, $parse, validators.range(minValue, maxValue));
                }
            };
        });

}(angular));