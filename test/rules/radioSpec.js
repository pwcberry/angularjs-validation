describe('Validation Module', function () {
    var inputHtml = '<input type="radio" val-radio="Please specify" ng-model="gender" value="male" id="Gender-Male"/><input type="radio" ng-model="gender" value="female" id="Gender-Female"/>',
        formTemplate = Validation.template.form,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-radio directive', function () {

        describe('when in a form', function () {
            var scope, element, maleInput, femaleInput;

            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                element = $compile(formTemplate(inputHtml))(scope);
                maleInput = element.find('input')[0];
                femaleInput = element.find('input')[1];
                scope.$digest();
            }));

            it('should fail when all radio buttons are unselected', function () {
                var btn = element.find('button');
                browserTrigger(btn, 'click');
                expectError(maleInput);
            });

            it('should pass when "female" radio button is selected', function () {
                var btn;

                scope.gender = 'female';
                scope.$apply();

                btn = element.find('button');
                browserTrigger(btn, 'click');

                expectPass(maleInput);
            });

            it('should pass when radio buttons are unselected and form submitted then "female" radio button is selected', function () {
                var btn;

                btn = element.find('button');
                browserTrigger(btn, 'click');

                expectError(maleInput);

                // Select the other radio button
                browserTrigger(femaleInput);

                browserTrigger(btn, 'click');

                expectPass(maleInput);
            });

        });
    });

});