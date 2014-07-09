(function(angular) {

	/**
	 * Private function factory to create validators.
	 *
	 * @param {Object} the form element that is the target of validation
	 * @param {Object} the form element's container node
	 * @param {Function} the validation function to invoke
	 */
	var Validator = function(element, container, validate) {
		return function() {
			var isValid = !element.hasClass('has-error') && validate(element[0]);

			if (!isValid) {
				container.addClass('has-validation-error');
				element.addClass('has-error');
			} else {
				container.removeClass('has-validation-error');
				element.removeClass('has-error');
			}

			return isValid;
		};
	};

	/**
	 * Custom directives to handle form validation.
	 */
	angular.module('Validation', [])
		.directive('valRequired', function() {
			return {
				restrict: 'A',
				link: function($scope, $element, $attr) {
					var message = (!$attr.valRequired ? 'This field is mandatory' : $attr.valRequired),
						err = angular.element('<span class="error-message">' + message + '</span>');

					$element.parent().append(err);
				},
				controller: function($scope, $element) {
					var validate = Validator($element, $element.parent(), function(el) {
						var val;

						if (el.type == 'checkbox') {
							return el.checked;
						} else if (el.type == 'file') {
							return el.files.length;
						}
						val = el.value.trim();
                        console.log('valRequired validator');
                        console.log('val = "' + val + '"');
						return val.length > 0;
					});
					$element.on('blur', validate);
				}
			};
		}).directive('valCode', function() {
			return {
				restrict: 'A',
				link: function($scope, $element, $attr) {
					var message = (!$attr.valCode ? 'Invalid' : $attr.valCode),
						err = angular.element('<span class="error-message">' + message + '</span>');

					$element.parent().append(err);
					$scope.length = parseInt($attr.valLength, 10);
				},
				controller: function($scope, $element) {
					var validate = Validator($element, $element.parent(), function(el) {
						var val = el.value.trim(),
							code = parseInt(val, 10);
						return $scope.length === val.length && !isNaN(code);
					});
					$element.on('blur', validate);
				}
			};
		}).directive('valMobile', function() {
			return {
				restrict: 'A',
				link: function($scope, $element, $attr) {
					var message = (!$attr.valMobile ? 'Invalid' : $attr.valMobile),
						err = angular.element('<span class="error-message">' + message + '</span>');
					$element.parent().append(err);
				},
				controller: function($scope, $element) {
					var validate = Validator($element, $element.parent(), function(el) {
						var reMobile = /^(04\d\d)(\d{6})$/,
							val = el.value.replace(/\s/g, '');
						return val.length === 10 && reMobile.test(val);
					});
					$element.on('blur', validate);
				}
			};
		}).directive('valTelephone', function() {
			return {
				restrict: 'A',
				link: function($scope, $element, $attr) {
					var message = (!$attr.valTelephone ? 'Invalid' : $attr.valTelephone),
						err = angular.element('<span class="error-message">' + message + '</span>');
					$element.parent().append(err);
				},
				controller: function($scope, $element) {
					var validate = Validator($element, $element.parent(), function(el) {
						var reFixed = /^(0[2378]|13)([02-9]\d{7})$/,
							reMobile = /^(04\d\d)(\d{6})$/,
							val = el.value.replace(/\s/g, ''),
							phone = (reFixed.test(val) && RegExp.$2);

						if (phone && phone.length === 8) {
							return true;
						} else {
							phone = (reMobile.test(val) && RegExp.$2);
							return phone && (phone.length === 6);
						}
					});
					$element.on('blur', validate);
				}
			};
		});

}(angular));