module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: ['mocha', 'chai'],

        /* PhantomJS requires a shim for Function.prototype.bind */
        files: [
            'lib/es5-shim/es5-shim.min.js',
            'lib/angular/angular.min.js',
            'lib/angular-mocks/angular-mocks.js',
            'lib/browserTrigger.js',
            'src/js/*.js',
            'test/testCommon.js',
            'test/rules/*Spec.js'
        ],

        exclude: [],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        reporters: ['mocha'],
        plugins: ['karma-phantomjs-launcher', 'karma-mocha', 'karma-chai', 'karma-mocha-reporter'],
        singleRun: true
    });
};