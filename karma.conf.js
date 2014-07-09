module.exports = function(config) {
	config.set({

		basePath: '',

		frameworks: ['mocha', 'chai'],

		files: [
			'lib/angular/angular.min.js',
			'lib/angular-mocks/angular-mocks.js',
			'lib/browserTrigger.js',
			'src/js/*.js',
			'test/*Spec.js'
		],

		exclude: [],

		reporters: ['progress'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		browsers: ['Chrome'],
		singleRun: true
	});
};