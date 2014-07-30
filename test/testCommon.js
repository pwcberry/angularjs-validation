var Validation = (function () {

    return {
        template: {
            form: function (input) {
                return '<form val-form><div>' + input + '</div><div><button type="submit" id="Btn"></button></div></form>';
            },
            formSubmit: function(input){
                return '<form val-form val-submit="submitForm(form)"><div>' + input + '</div><div><button type="submit" id="Btn"></button></div></form>';
            },
            isolated: function (input) {
                return '<div>' + input + '</div>';
            }
        },
        assert: {
            expectValidationError: function (input) {
                var parent = typeof input.parent == 'function' ? (input.parent()[0]) : input.parentNode;
                expect(parent.className).to.contain('has-validation-error');
            },
            expectValidationPass: function(input) {
                var parent = typeof input.parent == 'function' ? (input.parent()[0]) : input.parentNode;
                expect(parent.className).to.not.contain('has-validation-error');
            }
        }
    };

})();

