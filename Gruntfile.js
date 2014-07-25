module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n' +
          ' * <%= pkg.name %> <%= pkg.version %>\n' +
          ' * <%= pkg.description %>\n' +
          ' *\n' +
          ' * <%= pkg.repository.url %>\n' +
          ' *\n' +
          ' * Copyright 2013-<%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
          ' * Released on: <%= grunt.template.today("mmmm d, yyyy") %>\n' +
          '*/\n',
        uglify: {
            options: {
               compress: true,
               banner: '<%= banner %>',
            },
            mangle: {toplevel: false},
            squeeze: {dead_code: false},
            codegen: {quote_keys: true},
            dist: {
                files: {
                    'jquery.aim.min.js':'jquery.aim.js'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
};