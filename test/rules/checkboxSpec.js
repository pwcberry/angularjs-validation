describe('Validation Module', function () {
    var inputHtml = '<input type="checkbox" val-checkbox="Please specify" ng-model="terms" ng-true-value="true"/>',
        formTemplate = Validation.template.form,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-checkbox directive', function () {

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile(formTemplate(inputHtml))(scope);
            input = element.find('input');
            scope.$digest();
        }));

        it('should fail when checkbox is unselected', function () {
            var btn = element.find('button');
            browserTrigger(btn, 'click');
            expectError(input);
        });

        it('should pass when checkbox is selected', function () {
            var btn;

            browserTrigger(input);

            btn = element.find('button');
            browserTrigger(btn, 'click');

            expectPass(input);
        });

        it('should fail when checkbox is selected and form submitted then checkbox is unselected', function () {
            var btn;

            // Select checkbox
            browserTrigger(input);

            btn = element.find('button');
            browserTrigger(btn, 'click');

            expectPass(input);

            // Deselect checkbox
            browserTrigger(input);

            browserTrigger(btn, 'click');

            expectError(input);
        });

    });

});