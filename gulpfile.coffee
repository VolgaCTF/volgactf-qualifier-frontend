gulp = require 'gulp'
del = require 'del'
watch = require 'gulp-watch'
buster = require 'gulp-buster'
coffee = require 'gulp-coffee'

paths =
    scripts: [
        'bower_components/jquery/dist/jquery.js'
        'bower_components/bootstrap/dist/js/bootstrap.js'
        'bower_components/history.js/scripts/bundled-uncompressed/html5/jquery.history.js'
        'bower_components/underscore/underscore.js'
        'bower_components/requirejs/require.js'
    ]
    stylesheets: [
        'bower_components/bootstrap/dist/css/bootstrap.css'
    ]
    app_scripts: [
        'scripts/themis.coffee'
    ]
    html: [
        'html/index.html'
    ]

gulp.task 'clean', (callback) ->
    del ['public/css'], callback

gulp.task 'scripts', ->
    gulp.src paths.scripts
        .pipe gulp.dest 'public/js'

gulp.task 'app_scripts', ->
    gulp.src paths.app_scripts
        .pipe coffee()
        .pipe gulp.dest 'public/js'

gulp.task 'stylesheets', ->
    gulp.src paths.stylesheets
        .pipe gulp.dest 'public/css'

gulp.task 'html', ->
    gulp.src paths.html
        .pipe gulp.dest 'public'

gulp.task 'default', ['html', 'stylesheets', 'scripts', 'app_scripts']
