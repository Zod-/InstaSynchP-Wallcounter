module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'string-replace': {
      build: {
        files: {
          'dist/': 'dist/*.js',
        },
        options: {
          replacements: [{
            pattern: /@VERSION@/g,
            replacement: '<%= pkg.version %>'
          }, {
            pattern: /@WALLCOUNTERCSSREV@/g,
            replacement: function () {
              var cssrev = grunt.file.read('dist/wallcounterCSSrev')
                .trim();
              grunt.file.delete('dist/wallcounterCSSrev');
              return cssrev;
            }
          }, {
            pattern: /@RAWGITREPO@/g,
            replacement: 'https://cdn.rawgit.com/Zod-/InstaSynchP-Wallcounter'
          }, {
            pattern: /\/\/ @name[^\n]*\n/g,
            replacement: function(match){
              return match.replace(/-/,' ');
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
      beforereplace: ['src/wall.js', 'src/wallcounter.js'],
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
      },
      dist: {
        src: ['tmp/meta.js', 'src/wall.js', 'src/wallcounter.js'],
        dest: 'dist/InstaSynchP-Wallcounter.user.js'
      }
    },
    qunit: {
      all: ['tests/index.html']
    },
    'userscript-meta': {
      build: {
        dest: 'tmp/meta.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-userscript-meta');

  grunt.registerTask('default', ['copy', 'shell', 'userscript-meta', 'concat',
    'string-replace', 'jshint', 'qunit'
  ]);
  grunt.registerTask('test', ['concat', 'jshint', 'qunit']);
  grunt.registerTask('build-css', ['copy']);
  grunt.registerTask('build-js', ['shell', 'userscript-meta',
    'concat', 'string-replace'
  ]);
  grunt.registerTask('build', ['build-css', 'build-js']);
};
