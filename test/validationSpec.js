// "Borrowed" browserTrigger.js until I understand
// how to better implement browser events
// for execution within the Karma test runner

describe('Validation module', function () {
    beforeEach(module('Validation'));

    describe('val-required directive', function () {
        var element,
            scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile('<div><input type="text" val-required="Please specify" ng-model="demo"/></div><button type="button" id="Btn"></button>')(scope);
            scope.$digest();
        }));

        it('should create an error message element', function () {
            var errorElement = element.find('span');
            var className = errorElement[0].className;

            expect(errorElement.length).to.equal(1);
            expect(className).to.equal('error-message');
            expect(errorElement.text()).to.equal('Please specify');
        });

        it('should generate error when input field is empty', function () {
            var input = element.find('input');
            browserTrigger(input, 'focus');
            browserTrigger(input, 'blur');
            expect(element.hasClass('has-validation-error')).to.be.true;
        });

        it('should remove parent class when valid', inject(function ($timeout) {
//            var input = element.find('input');
//            browserTrigger(input, 'click');
//            browserTrigger(input, 'blur');
////            expect(element.hasClass('has-validation-error')).to.be.true;
//
//            scope.demo = 'Peter';
//            scope.$apply();
//            expect(input.val()).to.equal('Peter');
//            console.log('Added text');
//
//            $timeout(function () {
//                console.log('in timeout');
////                browserTrigger(input, 'focus');
//                browserTrigger(input, 'blur');
//                expect(element.hasClass('has-validation-error')).to.be.false;
//            });
//            $timeout.flush();
        }));

    });
});