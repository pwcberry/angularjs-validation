var Validation = (function () {

    return {
        template: {
            form: function (input) {
                return '<form val-form><div>' + input + '</div><div><button type="submit" id="Btn"></button></div></form>';
            },
            isolated: function (input) {
                return '<div>' + input + '</div>';
            }
        },
        assert: {
            expectValidationError: function (input) {
                expect(input.parent()[0].className).to.contain('has-validation-error');
            },
            expectValidationPass: function(input) {
                expect(input.parent()[0].className).to.not.contain('has-validation-error');
            }
        }
    };

})();

