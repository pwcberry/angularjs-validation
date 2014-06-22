(function (angular) {

    /**
     * Custom directives to handle form validation.
     *
     * The 'Validator' function will be moved to
     * become a service to allow other directives to
     * use the same code.
     */
    angular.module('Validation', [])
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

                    $element.on('blur', validate);
                }
            };
        });

}(angular));