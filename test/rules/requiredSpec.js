// "Borrowed" browserTrigger.js until I understand
// how to better implement browser events
// for execution within the Karma test runner

describe('Validation Module', function () {

    beforeEach(module('Validation'));

    describe('val-required directive', function () {
        var element,
            scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile('<form val-form><div><input type="text" val-required="Please specify" ng-model="demo"/></div><div><button type="submit" id="Btn"></button></div></form>')(scope);
            scope.$digest();
        }));

        it('should create an error message element', function () {
            var errorElement = element.find('span');
            var className = errorElement[0].className;

            expect(errorElement.length).to.equal(1);
            expect(className).to.contain('error-message');
            expect(errorElement.text()).to.equal('Please specify');
        });

        describe('in a form', function () {
            it('should generate an error when form is submitted with an empty field', function () {
                var input = element.find('input'), btn = element.find('button');
                browserTrigger(btn, 'click');
                expect(input.parent()[0].className).to.contain('has-validation-error');
            });
        });

        describe('when isolated', function() {
            it('should generate an error when model becomes empty', inject(function($compile){
                var input;
                element = $compile('<div><input type="text" val-required="Please specify" val-watch ng-model="demo"/></div>')(scope);
                scope.demo = 'Hello';
                scope.$apply();

                scope.demo = '';
                scope.$apply();

                input = element.find('input');

                expect(input.parent()[0].className).to.contain('has-validation-error');
            }));
        });
    });
});