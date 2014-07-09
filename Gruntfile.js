module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			files: ['./src/js/**/*.js']
		},
		copy: {
			lib: {
				files: [{
					expand: true,
					flatten: true,
					src: ['./lib/angular/angular.js'],
					dest: './demo/public/javascripts'
				}]
			},
			demo: {
				files: [{
					expand: false,
					flatten: true,
					src: ['./src/js/*.js'],
					dest: './demo/public/javascripts/validation.js'
				}]
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
	});

	//    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.registerTask('test', ['jshint', 'karma']);
	grunt.registerTask('default', ['jshint', 'copy']);

};