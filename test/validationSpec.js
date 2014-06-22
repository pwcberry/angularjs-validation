// "Borrowed" browserTrigger.js until I understand
// how to better implement browser events
// for execution within the Karma test runner

describe('val-required directive', function() {
    var element,
        scope;

    beforeEach(module('Validation'));

    beforeEach(inject(function($rootScope, $compile){
        scope = $rootScope.$new();
        element = $compile('<div><input type="text" val-required="Please specify"/></div>')(scope);
        scope.$digest();
    }));

    it ('should create an error message element',
        inject(function() {
            var errorElement = element.find('span');
            var className = errorElement[0].className;

            expect(errorElement.length).toBe(1);
            expect(className).toBe('error-message');
            expect(errorElement.text()).toBe('Please specify');
        })
    );

    it('should add to parent class when not valid',
        inject(function() {
            var input = element.find('input');
            browserTrigger(input, 'focus');
            browserTrigger(input, 'blur');
            expect(element.hasClass('has-validation-error')).toBe(true);
        })
    );

    it('should remove parent class when valid',
        inject(function() {
            var input = element.find('input');
            browserTrigger(input, 'focus');
            browserTrigger(input, 'blur');
            input.val('Peter');
            browserTrigger(input, 'focus');
            browserTrigger(input, 'blur');
            expect(element.hasClass('has-validation-error')).toBe(false);
        })
    );
});
