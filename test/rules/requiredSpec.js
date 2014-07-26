// "Borrowed" browserTrigger.js until I understand
// how to better implement browser events
// for execution within the Karma test runner

describe('Validation Module', function () {
var inputHtml = '<input type="text" val-required="Please specify" ng-model="demo"/>',
    inputWatchHtml = '<input type="text" val-required="Please specify" val-watch ng-model="demo"/>',
    formTemplate = Validation.template.form,
    isolatedTemplate = Validation.template.isolated,
    expectError = Validation.assert.expectValidationError;

    beforeEach(module('Validation'));

    describe('val-required directive', function () {
        var element,
            scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile(formTemplate(inputHtml))(scope);
            scope.$digest();
        }));

        it('should create an error message element', function () {
            var errorElement = element.find('span');
            var className = errorElement[0].className;

            expect(errorElement.length).to.equal(1);
            expect(className).to.contain('error-message');
            expect(errorElement.text()).to.equal('Please specify');
        });

        describe('when in a form', function () {
            it('should fail when form is submitted with an empty field', function () {
                var input = element.find('input'), btn = element.find('button');
                browserTrigger(btn, 'click');
                expectError(input);
            });
        });

        describe('when isolated', function() {
            it('should fail when model becomes empty', inject(function($compile){
                var input;
                element = $compile(isolatedTemplate(inputWatchHtml))(scope);
                scope.demo = 'Hello';
                scope.$apply();

                scope.demo = '';
                scope.$apply();

                input = element.find('input');

                expectError(input);
            }));
        });
    });
});