describe('Validation Module', function () {
    var inputHtml = '<input type="checkbox" val-checkbox-group="Please specify" ng-model="food[0]" ng-true-value="chicken"/><input type="checkbox" ng-model="food[1]" ng-true-value="lamb"/><input type="checkbox" ng-model="food[2]" ng-true-value="fish"/>',
        inputNamesHtml = '<input type="checkbox" val-checkbox-group="Please specify" ng-model="morning" name="preferredHour" ng-true-value="true"/><input type="checkbox" ng-model="noon" name="preferredHour" ng-true-value="true"/><input type="checkbox" ng-model="night" name="preferredHour" ng-true-value="true"/>',
        formTemplate = Validation.template.form,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-checkbox-group directive', function () {

        describe('when grouped by model', function () {
            var scope, element;

            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                scope.food = [];
                element = $compile(formTemplate(inputHtml))(scope);
                scope.$digest();
            }));

            it('should fail when checkboxes are unselected', function () {
                var input = element.find('input')[0], btn = element.find('button');
                console.log(element);
                browserTrigger(btn, 'click');
                expectError(input);
            });

            it('should pass when the "lamb" checkbox is selected', function () {
                var valInput = element.find('input')[0], lambInput = element.find('input')[1], btn = element.find('button');

                browserTrigger(lambInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);
            });

           it('should fail when "lamb" checkbox is selected and form submitted then checkbox is unselected', function () {
                var valInput = element.find('input')[0], lambInput = element.find('input')[1], btn = element.find('button');

                // select checkbox
                browserTrigger(lambInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);

                // Deselect checkbox
                browserTrigger(lambInput);

                browserTrigger(btn, 'click');

                expectError(valInput);
            });

        });

        describe('when grouped by element name', function () {
            var scope, element;

            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                element = $compile(formTemplate(inputNamesHtml))(scope);
                scope.$digest();
            }));

            it('should fail when checkboxes are unselected', function () {
                var input = element.find('input')[0], btn = element.find('button');
                browserTrigger(btn, 'click');
                expectError(input);
            });

            it('should pass when the "noon" checkbox is selected', function () {
                var valInput = element.find('input')[0], noonInput = element.find('input')[1], btn = element.find('button');

                browserTrigger(noonInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);
            });

            it('should fail when "noon" checkbox is selected and form submitted then checkbox is unselected', function () {
                var valInput = element.find('input')[0], noonInput = element.find('input')[1], btn = element.find('button');

                // select checkbox
                browserTrigger(noonInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);

                // Deselect checkbox
                browserTrigger(noonInput);

                browserTrigger(btn, 'click');

                expectError(valInput);
            });

            it('should pass when "noon" checkbox is selected and form submitted then all checkboxes are selected', function () {
                var valInput = element.find('input')[0], noonInput = element.find('input')[1], nightInput = element.find('input')[2],
                    btn = element.find('button');

                browserTrigger(noonInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);

                browserTrigger(valInput);
                browserTrigger(nightInput);
                browserTrigger(btn, 'click');

                expectPass(valInput);
            });
        });
    });

});