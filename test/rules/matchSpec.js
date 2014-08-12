describe('Validation Module', function () {
    var inputHtml = '<input type="text" ng-model="password" /><input type="text" ng-model="confirmPassword" {required} val-match="Invalid" val-match-with="password"/>',
        formTemplate = Validation.template.form,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-match directive', function () {
        describe('when in a form', function () {
            var scope, element, passwordField;

            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                element = $compile(formTemplate(inputHtml.replace('{required}', '')))(scope);
                scope.$digest();
                passwordField = element.find('input')[0];
            }));

            it('should fail when inputs do not match', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.confirmPassword = "w0rd";
                scope.$apply();

                browserTrigger(btn, 'click');

                expectError(passwordField);
            });

            it('should fail when inputs do not match after two attempts', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.confirmPassword = "w0rd";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectError(passwordField);

                scope.confirmPassword = "w04ds";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectError(passwordField);
            });

            it('should pass when inputs match after two attempts', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.confirmPassword = "w0rds";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectError(passwordField);

                scope.confirmPassword = "word";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectPass(passwordField);
            });
        });

        describe('when in a form and is required', function () {
            var scope, element, passwordField;

            beforeEach(inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                element = $compile(formTemplate(inputHtml.replace('{required}', 'val-required="Required"')))(scope);
                scope.$digest();
                passwordField = element.find('input')[0];
            }));

            it('should fail when inputs do not match', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.confirmPassword = "w0rd";
                scope.$apply();

                browserTrigger(btn, 'click');

                expectError(passwordField);
            });

            it('should fail when required compare field is empty', function () {
                var btn = element.find('button');
                scope.password = "word";
                scope.$apply();

                browserTrigger(btn, 'click');

                expectError(passwordField);
                expect(scope['valRequired_confirmPassword']).to.be.true;
            });

            it('should fail when required compare field starts empty and inputs do not match on 2nd attempt', function () {
                var btn = element.find('button');
                scope.password = "word";
                scope.$apply();

                browserTrigger(btn, 'click');

                expectError(passwordField);
                expect(scope['valRequired_confirmPassword']).to.be.true;

                scope.confirmPassword = "w0rd";
                scope.$apply();

                browserTrigger(btn, 'click');

                expectError(passwordField);
                expect(scope['valRequired_confirmPassword']).to.be.false;
                expect(scope['valMatch_confirmPassword']).to.be.true;
            });

            it('should pass when inputs match after two attempts to match words', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.confirmPassword = "w0rds";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectError(passwordField);

                scope.confirmPassword = "word";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectPass(passwordField);
            });

            it('should pass when inputs match after two attempts, including a required validation failure', function () {
                var btn = element.find('button');

                scope.password = "word";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectError(passwordField);

                scope.confirmPassword = "word";
                scope.$apply();

                browserTrigger(btn, 'click');
                expectPass(passwordField);
            });
        });
    });
});