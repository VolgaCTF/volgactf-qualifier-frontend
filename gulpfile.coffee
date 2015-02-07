gulp = require 'gulp'
del = require 'del'
coffee = require 'gulp-coffee'
gulpIf = require 'gulp-if'
path = require 'path'
plumber = require 'gulp-plumber'
mustache = require 'gulp-mustache'
yaml = require 'js-yaml'
fs = require 'fs'
sass = require 'gulp-sass'

paths =
    scripts: [
        'bower_components/jquery/dist/jquery.js'
        'bower_components/bootstrap/dist/js/bootstrap.js'
        'bower_components/history.js/scripts/bundled-uncompressed/html5/jquery.history.js'
        'bower_components/underscore/underscore.js'
        'bower_components/requirejs/require.js'
        'bower_components/eventEmitter/EventEmitter.js'
        'bower_components/bootstrap-filestyle/src/bootstrap-filestyle.js'
        'scripts/themis.coffee'
    ]
    fonts: [
        'bower_components/bootstrap/dist/fonts/*.eot'
        'bower_components/bootstrap/dist/fonts/*.svg'
        'bower_components/bootstrap/dist/fonts/*.ttf'
        'bower_components/bootstrap/dist/fonts/*.woff'
        'bower_components/bootstrap/dist/fonts/*.woff2'
    ]
    stylesheets: [
        'bower_components/bootstrap/dist/css/bootstrap.css'
        'stylesheets/themis.sass'
    ]
    html: [
        'html/index.html'
    ]


isCoffee = (file) ->
    path.extname(file.path) is '.coffee'

gulp.task 'clean_scripts', (callback) ->
    del ['public/cdn/js/*'], callback

gulp.task 'scripts', ['clean_scripts'], ->
    gulp.src paths.scripts
        .pipe plumber()
        .pipe gulpIf isCoffee, coffee()
        .pipe gulp.dest 'public/cdn/js'


isSass = (file) ->
    path.extname(file.path) is '.sass'

gulp.task 'clean_stylesheets', (callback) ->
    del ['public/cdn/css/*'], callback

gulp.task 'stylesheets', ['clean_stylesheets'], ->
    gulp.src paths.stylesheets
        .pipe gulpIf isSass, sass indentedSyntax: yes, errLogToConsole: yes
        .pipe gulp.dest 'public/cdn/css'


gulp.task 'clean_fonts', (callback) ->
    del ['public/cdn/fonts/*'], callback

gulp.task 'fonts', ['clean_fonts'], ->
    gulp.src paths.fonts
        .pipe gulp.dest 'public/cdn/fonts'


gulp.task 'clean_html', (callback) ->
    del ['public/html/*'], callback

gulp.task 'html', ['clean_html'], ->
    try
        opts = yaml.safeLoad fs.readFileSync './opts.yml', 'utf8'
    catch e
        console.log e
        opts = {}

    gulp.src paths.html
        .pipe mustache opts
        .pipe gulp.dest 'public/html'

gulp.task 'default', ['html', 'stylesheets', 'scripts', 'fonts']

gulp.task 'watch', ->
    gulp.watch paths.html, ['html']
    gulp.watch paths.stylesheets, ['stylesheets']
    gulp.watch paths.scripts, ['scripts']
    gulp.watch paths.fonts, ['fonts']
