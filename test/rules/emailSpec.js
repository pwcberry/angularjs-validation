describe('Validation Module', function () {
    var inputHtml = '<input type="text" val-email="Please specify" ng-model="demo"/>',
        formSubmitTemplate = Validation.template.formSubmit,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-email directive', function () {
        var scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            scope.$digest();
        }));

        it('should validate when invalid email is hidden by ng-if', inject(function ($compile) {
            var html = '<div ng-if="isVisible">' + inputHtml + '</div>',
                formElement, input, btn, submitCount = 0;

            scope.submitForm = function () {
                submitCount += 1;
            };

            formElement = $compile(formSubmitTemplate(html))(scope);

            scope.isVisible = true;
            scope.demo = 'bademail*';
            scope.$apply();

            input = formElement.find('input');
            btn = formElement.find('button');

            browserTrigger(btn, 'click');
            expectError(input);

            scope.isVisible = false;
            scope.$apply();

            browserTrigger(btn, 'click');
            expect(submitCount).to.equal(1);
        }));

        it('should pass when initially hidden by ng-if and email validates', inject(function ($compile) {
            var html = '<div ng-if="isVisible">' + inputHtml + '</div>',
                formElement, input, btn, submitCount = 0;

            scope.submitForm = function () {
                submitCount += 1;
            };

            formElement = $compile(formSubmitTemplate(html))(scope);

            btn = formElement.find('button');
            browserTrigger(btn, 'click');

            scope.demo = 'ianchappell@ninemsn.com.au';
            scope.isVisible = true;
            scope.$apply();

            input = formElement.find('input');
            browserTrigger(btn, 'click');

            expect(submitCount).to.equal(2);
            expectPass(input);
        }));

        it('should fail when initially hidden by ng-if and email does not have domain', inject(function ($compile) {
            var html = '<div ng-if="isVisible">' + inputHtml + '</div>',
                formElement, input, btn, submitCount = 0;

            scope.submitForm = function () {
                submitCount += 1;
            };

            formElement = $compile(formSubmitTemplate(html))(scope);

            btn = formElement.find('button');
            browserTrigger(btn, 'click');

            scope.demo = 'ianchappell';
            scope.isVisible = true;
            scope.$apply();

            input = formElement.find('input');
            browserTrigger(btn, 'click');

            expect(submitCount).to.equal(1);
            expectError(input);
        }));


    });

});