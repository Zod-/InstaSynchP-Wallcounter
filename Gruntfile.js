module.exports = function (grunt) {
  "use strict";
  var wallcounterCSSrev = '';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'string-replace': {
      version: {
        files: [{
          flatten: true,
          expand: true,
          src: ['src/InstaSynchP-Wallcounter.user.js'],
          dest: 'dist/'
        }],
        options: {
          replacements: [{
            pattern: /{{ VERSION }}/g,
            replacement: '<%= pkg.version %>'
          }, {
            pattern: /{{ WALLCOUNTERCSSREV }}/g,
            replacement: wallcounterCSSrev
          }]
        }
      }
    },
    copy: {
      dist: {
        flatten: true,
        expand: true,
        src: ['src/wallcounter.css'],
        dest: 'dist/',
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      beforereplace: ['src/InstaSynchP-Wallcounter.user.js'],
      afterreplace: ['dist/InstaSynchP-Wallcounter.user.js'],
      other: ['Gruntfile.js']
    },
    shell: {
      gitlog: {
        command: 'git log -n 1 --pretty="%H" dist/wallcounter.css',
        options: {
          callback: function log(err, stdout, stderr, cb) {
            wallcounterCSSrev = stdout;
            cb();
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['copy', 'shell', 'string-replace', 'jshint']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build-css', ['copy']);
  grunt.registerTask('build-js', ['shell', 'string-replace']);
  grunt.registerTask('build', ['copy', 'shell', 'string-replace']);
};
