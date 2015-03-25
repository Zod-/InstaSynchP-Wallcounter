module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'string-replace': {
      replace: {
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
            replacement: function () {
              var cssrev = grunt.file.read('dist/wallcounterCSSrev').trim();
              grunt.file.delete('dist/wallcounterCSSrev');
              return cssrev;
            }
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
      beforeconcat: ['tests/src/*.js'],
      afterconcat: ['tests/test.js'],
      other: ['Gruntfile.js']
    },
    shell: {
      gitlog: {
        command: 'git log -n 1 --pretty="%H" dist/wallcounter.css',
        options: {
          callback: function log(err, stdout, stderr, cb) {
            grunt.file.write('dist/wallcounterCSSrev', stdout);
            cb();
          }
        }
      }
    },
    concat: {
      test: {
        src: ['tests/src/*.js'],
        dest: 'tests/test.js',
      }
    },
    qunit: {
      all: ['tests/index.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['copy', 'shell', 'string-replace', 'concat', 'jshint', 'qunit']);
  grunt.registerTask('test', ['concat', 'jshint', 'qunit']);
  grunt.registerTask('build-css', ['copy']);
  grunt.registerTask('build-js', ['shell', 'concat', 'string-replace']);
  grunt.registerTask('build', ['copy', 'shell', 'concat', 'string-replace']);
};
