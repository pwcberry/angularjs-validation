describe('Validation Module', function () {
    var template = '<input type="text" val-number="Invalid number" val-number-type="{{type}}" ng-model="demo"/>',
        watchTemplate= '<input type="text" val-number="Invalid number" val-number-type="{{type}}" val-watch ng-model="demo"/>',
        formTemplate = Validation.template.form,
        isolatedTemplate = Validation.template.isolated,
        expectError = Validation.assert.expectValidationError,
        expectPass = Validation.assert.expectValidationPass;

    beforeEach(module('Validation'));

    describe('val-number directive', function () {
        var element,
            scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            scope.$digest();
        }));

        describe('when in a form', function () {
            it('should fail when a non-integer is entered and the number type is not specified', inject(function ($compile) {
                var input, btn;
                scope.type = '';
                scope.demo = 'aaa';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));

            it('should fail when a non-integer is entered and the number type is integer', inject(function ($compile) {
                var input, btn;
                scope.type = 'int';
                scope.demo = 'aaa';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));

            it('should pass when an integer has been entered and the number type is integer', inject(function ($compile) {
                var input, btn;
                scope.type = 'int';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                scope.demo = '1234';
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectPass(input);
            }));

            it('should fail when a float is entered and the number type is integer', inject(function ($compile) {
                var input, btn;
                scope.type = 'integer';
                scope.demo = '120.12';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));

            it('should fail when a non-number is entered and the number type is float', inject(function ($compile) {
                var input, btn;
                scope.type = 'float';
                scope.demo = 'aaa';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectError(input);
            }));

            it('should pass when an integer is entered and the number type is float', inject(function ($compile) {
                var input, btn;
                scope.type = 'float';
                scope.demo = '1234';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectPass(input);
            }));

            it('should pass when a float is entered and the number type is float', inject(function ($compile) {
                var input, btn;
                scope.type = 'float';
                scope.demo = '123.4';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectPass(input);
            }));

            it('should pass when a float without a leading zero is entered', inject(function ($compile) {
                var input, btn;
                scope.type = 'float';
                scope.demo = '.4';
                element = $compile(formTemplate(template))(scope);
                scope.$apply();

                input = element.find('input');
                btn = element.find('button');

                browserTrigger(btn, 'click');

                expectPass(input);
            }));
        });

        describe('when isolated', function(){
            it('should fail when a non-integer is entered and the number type is integer', inject(function ($compile) {
                var input;
                scope.type = 'int';
                scope.demo = '';
                element = $compile(isolatedTemplate(watchTemplate))(scope);
                scope.$apply();

                scope.demo='abc';
                scope.$apply();

                input = element.find('input');

                expectError(input);
            }));

            it('should fail when a non-integer is entered and the number type is float', inject(function ($compile) {
                var input;
                scope.type = 'int';
                scope.demo = '';
                element = $compile(isolatedTemplate(watchTemplate))(scope);
                scope.$apply();

                scope.demo='abc.31';
                scope.$apply();

                input = element.find('input');

                expectError(input);
            }));
        })
    });
});