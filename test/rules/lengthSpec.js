describe('Validation Module', function () {
    var inputHtml = '<input type="text" val-length="Wrong length" val-length-min="{{minLength}}" val-length-max="{{maxLength}}" ng-model="demo"/>',
        inputWatchHtml = '<input type="text" val-length="Wrong length" val-length-min="{{minLength}}" val-length-max="{{maxLength}}" val-watch ng-model="demo"/>',
        formTemplate = Validation.template.form,
        isolatedTemplate = Validation.template.isolated,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-length directive', function () {
        var scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            scope.$digest();
        }));

        describe('when in a form', function () {
            it('should pass when no min or max length is specified', inject(function ($compile) {
                var input, btn, element;

                element = $compile(formTemplate(inputHtml))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectPass(input);
            }));

            it('should fail when text is 4 characters and min length is 5', inject(function ($compile) {
                var input, btn, element;

                scope.minLength = 5;
                scope.demo = 'Four';
                element = $compile(formTemplate(inputHtml))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));

            it('should fail when text is 6 characters and max length is 5', inject(function ($compile) {
                var input, btn, element;

                scope.maxLength = 5;
                scope.demo = 'Charge';
                element = $compile(formTemplate(inputHtml))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));
        });

        describe('when isolated', function () {
            it('should fail when text is 6 characters long and max length is 5', inject(function ($compile) {
                var input, element;
                scope.maxLength = 5;
                scope.demo = 'Five';
                element = $compile(isolatedTemplate(inputWatchHtml))(scope);
                scope.$apply();

                scope.demo = 'Sixers';
                scope.$apply();

                input = element.find('input');

                expectError(input);
            }));

            it('should fail when text is 4 characters long and min length is 5', inject(function ($compile) {
                var input, element;
                scope.minLength = 5;
                scope.demo = 'Fiver';
                element = $compile(isolatedTemplate(inputWatchHtml))(scope);
                scope.$apply();

                scope.demo = 'Four';
                scope.$apply();

                input = element.find('input');

                expectError(input);
            }));
        })
    });
});