module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      sass: {
        files: ['modules/**/assets/stylesheets/*.scss', 'public/stylesheets/application.scss'],
        tasks: ['sass:dist', 'autoprefixer', 'exec:pushToServer']
        //tasks: ['sass:dist']
      },
      concatApplication: {
        files: ['angular-init.js', 'javascript/**/*.js'],
        tasks: ['jshint', 'concat:application', 'exec:pushToServer']
        //tasks: ['jshint', 'concat:application']
      },
      //concatUtil: {
      //  files: ['util/*.js', 'util/**/*.js'],
      //  tasks: ['jshint', 'concat:util', 'exec:pushToServer']
        //tasks: ['jshint', 'concat:util']
      //},
      css: {
        files: ['libs/**/*.css', 'libs/**/**/*.css'],
        tasks: ['concat:css', 'exec:pushToServer']
        //tasks: ['concat:css']
      }
    },
    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'expanded',
          precision: 8
        },
        files: {                         // Dictionary of files
          'public/stylesheets/application.css': 'public/stylesheets/application.scss'       // 'destination': 'source'
        }
      }
    },
    // Javascript files concatenation
    concat: {
      options: {
        separator: grunt.util.linefeed + ';' + grunt.util.linefeed
      },
      // include all 3rd party library files
      libs: {
        src: [
          'libs/mapbox.js-2.1.8/mapbox.js',
          'libs/angular-1.4.2/angular.min.js',
          'libs/angular-animate-1.4.2/angular-animate.min.js',
          'libs/angular-ui-router-0.2.13/angular-ui-router.min.js',
          'libs/angular-ui-bootstrap-0.12.1/ui-bootstrap-tpls.min.js',
          'libs/angular-translate-2.7.2/angular-translate.min.js',
          'libs/angular-translate-2.7.2/angular-translate-loader-static-files.min.js',
          'libs/angular-toastr-1.4.1/angular-toastr.tpls.min.js',
          'libs/angular-jwt-0.0.9/angular-jwt.min.js',
          'libs/nsPopover-0.6.8/nsPopover.js',
          'libs/jquery-2.1.4/jquery.min.js',
          'libs/devbridge-autocomplete-1.2.21/jquery.autocomplete.js',
          'libs/elsap-autocomplete/elsap-autocomplete.js',
          'libs/underscore-1.8.3/underscore-min.js'
        ],
        dest: 'public/js/library.js'
      },
      //include angular-init and all moduels .js files
      application: {
        src: ['angular-init.js', 'javascript/**/*.js'],
        dest: 'public/js/application.js'
      },
      css: {
        options: {
          separator: grunt.util.linefeed + grunt.util.linefeed
        },
        src: [
          'libs/mapbox.js-2.1.8/mapbox.css',
          'libs/font-awesome-4.4.0/css/font-awesome.min.css',
          'libs/bootstrap-3.3.5/css/bootstrap.css',
          'libs/angular-toastr-1.4.1/angular-toastr.min.css',
          'libs/angucomplete-alt-1.10/angucomplete-alt.css'
        ],
        dest: 'public/stylesheets/library.css'
      }
    },
    uglify: {
      all: {
        files: [{
          expand: true,
          cwd: 'public/js',
          src: '**/*.js',
          dest: 'public/js'
        }]
      }
    },
    jshint: {
      options: {
        laxbreak: true,
        sub: true
      },
      all: ['angular-init.js', 'javascript/**/*.js']
    },
    exec: {
      pushToServer: {
        command: '~/egs_sync.sh'
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 10 versions', 'ie 9', '> 1%']
      },
      main: {
        src: 'public/stylesheets/application.css',
        dest: 'public/stylesheets/application.css'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-autoprefixer');


  // Default task(s).
  grunt.registerTask('default', ['sass', 'autoprefixer', 'concat', 'jshint', 'exec', 'watch']);
  grunt.registerTask('dev', ['sass', 'autoprefixer', 'concat', 'jshint', 'watch']);
  grunt.registerTask('mindev', ['sass', 'autoprefixer', 'concat', 'watch']);
  //grunt.registerTask('prod', ['sass', 'concat', 'jshint', 'uglify:all']);
  grunt.registerTask('prod', ['sass', 'autoprefixer', 'concat', 'jshint']);


};
