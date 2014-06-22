describe('val-required directive', function() {
    var scope;

    beforeEach(inject(function($rootScope){
        scope = $rootScope.$new();
    }));

    it ('should create an error message elemnt',
        inject(function($compile) {
//            var anElement = angular.element('<input type="text" val-required="Please specify"/>');

            var anElement = $compile('<div><input type="text" val-required="Please specify"/></div>')(scope);
            scope.$digest();

            expect(anElement.find('.error-message').length).toBe(1);
        })
    );
});
