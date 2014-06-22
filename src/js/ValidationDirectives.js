(function (angular) {

    angular.module('Validation', [])
        .directive('valOnSubmit', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    var fn = $parse(attr.valOnSubmit);
                    scope.isValid = false;

                    if (element[0].tagName.toLowerCase() != 'form') {
                        throw 'val-on-submit must be attached to a form element';
                    }

                    if (attr.valOnSubmit) {
                        element.on('submit', function (event) {
                            console.info('submit');
                            try {
                                if (!scope.submitAttempted) {
                                    scope.submitAttempted = true;
                                }
                                scope.validate();
                                scope.$apply(fn(scope, {
                                    $scope: scope,
                                    $event: event
                                }));
                            } catch (e) {
                                console.error(e);
                            } finally {
                                event.preventDefault();
                            }
                        });
                    }
                },
                controller: function ($scope) {
                    var validators = [];

                    $scope.addValidator = function (validator) {
                        validators.push(validator);
                    };

                    $scope.validate = function () {
                        var isValid = true;

                        angular.forEach(validators, function (v) {
                            var result = v();
                            isValid = isValid && result;
                        });

                        $scope.isValid = isValid;
                    };
                }
            };
        }])
        .directive('valRequired', function () {
            var Validator = function (element, container, validate) {
                return function () {
                    var isValid = validate(element[0]);
                    if (!isValid) {
                        container.addClass('has-validation-error');
                    } else {
                        container.removeClass('has-validation-error');
                    }

                    return isValid;
                };
            };

            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    var err, message;

                    if (!attr.valRequired) {
                        message = 'This field is mandatory';
                    } else {
                        message = attr.valRequired;
                    }
                    console.info('val-required');
                    err = angular.element('<span class="error-message">' + message + '</span>');
                    element.parent().append(err);
                },
                controller: function ($scope, $element) {
                    var validate = Validator($element, $element.parent(), function (el) {
                        var val;

                        if (el.type == 'checkbox') {
                            return el.checked;
                        } else if (el.type == 'file') {
                            return el.files.length;
                        }

                        val = el.value.trim();
                        return val.length > 0;
                    });

                    $element.on('blur', function () {
                        var formValidator = typeof $scope.addValidator == 'function';
                        if ((formValidator && $scope.submitAttempted) || !formValidator) {
                            validate();
                        }
                    });

                    $scope.addValidator(validate);
                }
            };
        });

}(angular));