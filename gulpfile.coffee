gulp = require 'gulp'
del = require 'del'
coffee = require 'gulp-coffee'
gulpIf = require 'gulp-if'
path = require 'path'
plumber = require 'gulp-plumber'

paths =
    scripts: [
        'bower_components/jquery/dist/jquery.js'
        'bower_components/bootstrap/dist/js/bootstrap.js'
        'bower_components/history.js/scripts/bundled-uncompressed/html5/jquery.history.js'
        'bower_components/underscore/underscore.js'
        'bower_components/requirejs/require.js'
        'bower_components/eventEmitter/EventEmitter.js'
        'scripts/themis.coffee'
    ]
    stylesheets: [
        'bower_components/bootstrap/dist/css/bootstrap.css'
        'stylesheets/themis.css'
    ]
    html: [
        'html/index.html'
    ]


isCoffee = (file) ->
    path.extname(file.path) is '.coffee'

gulp.task 'clean_scripts', (callback) ->
    del ['public/js/*'], callback

gulp.task 'scripts', ['clean_scripts'], ->
    gulp.src paths.scripts
        .pipe plumber()
        .pipe gulpIf isCoffee, coffee()
        .pipe gulp.dest 'public/js'


gulp.task 'clean_stylesheets', (callback) ->
    del ['public/css/*'], callback

gulp.task 'stylesheets', ['clean_stylesheets'], ->
    gulp.src paths.stylesheets
        .pipe gulp.dest 'public/css'


gulp.task 'clean_html', (callback) ->
    del ['public/*.html'], callback

gulp.task 'html', ['clean_html'], ->
    gulp.src paths.html
        .pipe gulp.dest 'public'

gulp.task 'default', ['html', 'stylesheets', 'scripts']

gulp.task 'watch', ->
    gulp.watch paths.html, ['html']
    gulp.watch paths.stylesheets, ['stylesheets']
    gulp.watch paths.scripts, ['scripts']
