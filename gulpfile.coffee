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
uglify = require 'gulp-uglify'
minifyCSS = require 'gulp-minify-css'
minifyHTML = require 'gulp-minify-html'
include = require 'gulp-include'
rev = require 'gulp-rev'

paths =
    scripts: [
        'bower_components/jquery/dist/jquery.js'
        'bower_components/bootstrap/dist/js/bootstrap.js'
        'bower_components/history.js/scripts/bundled-uncompressed/html5/jquery.history.js'
        'bower_components/underscore/underscore.js'
        'bower_components/requirejs/require.js'
        'bower_components/eventEmitter/EventEmitter.js'
        'bower_components/bootstrap-filestyle/src/bootstrap-filestyle.js'
        'bower_components/jquery-form/jquery.form.js'
        'bower_components/query-string/query-string.js'
        'bower_components/parsleyjs/dist/parsley.js'
        'bower_components/markdown-it/dist/markdown-it.js'
        'bower_components/moment/moment.js'
        'bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js'
    ]
    app_scripts: [
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
        'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css'
        'bower_components/animate.css/animate.css'
    ]
    app_stylesheets: [
        'stylesheets/themis.sass'
    ]
    html: [
        'html/index.html'
    ]


isProduction = ->
    process.env['NODE_ENV'] == 'production'

isCoffee = (file) ->
    path.extname(file.path) is '.coffee'


gulp.task 'clean_scripts', (callback) ->
    del ['public/cdn/js/*'], callback

gulp.task 'scripts', ['clean_scripts'], ->
    gulp.src paths.scripts
        .pipe plumber()
        .pipe gulpIf isProduction, uglify()
        .pipe gulp.dest 'public/cdn/js'

gulp.task 'app_scripts', ['clean_scripts'], ->
    gulp.src paths.app_scripts
        .pipe plumber()
        .pipe include()
        .pipe coffee()
        .pipe gulpIf isProduction, uglify()
        .pipe gulp.dest 'public/cdn/js'
        .pipe rev()
        .pipe gulp.dest 'public/cdn/js'
        .pipe rev.manifest 'manifest.json'
        .pipe gulp.dest 'public/cdn/js'

isSass = (file) ->
    path.extname(file.path) is '.sass'

gulp.task 'clean_stylesheets', (callback) ->
    del ['public/cdn/css/*'], callback

gulp.task 'stylesheets', ['clean_stylesheets'], ->
    gulp.src paths.stylesheets
        .pipe gulpIf isProduction, minifyCSS()
        .pipe gulp.dest 'public/cdn/css'


gulp.task 'app_stylesheets', ['clean_stylesheets'], ->
    gulp.src paths.app_stylesheets
        .pipe sass indentedSyntax: yes, errLogToConsole: yes
        .pipe gulpIf isProduction, minifyCSS()
        .pipe gulp.dest 'public/cdn/css'
        .pipe rev()
        .pipe gulp.dest 'public/cdn/css'
        .pipe rev.manifest 'manifest.json'
        .pipe gulp.dest 'public/cdn/css'


gulp.task 'clean_fonts', (callback) ->
    del ['public/cdn/fonts/*'], callback

gulp.task 'fonts', ['clean_fonts'], ->
    gulp.src paths.fonts
        .pipe gulp.dest 'public/cdn/fonts'


gulp.task 'clean_html', (callback) ->
    del ['public/html/*'], callback


gulp.task 'html', ['clean_html', 'stylesheets', 'scripts', 'fonts', 'app_scripts', 'app_stylesheets'], ->
    try
        opts = yaml.safeLoad fs.readFileSync './opts.yml', 'utf8'
        cachebusting_js = JSON.parse fs.readFileSync './public/cdn/js/manifest.json', 'utf8'
        cachebusting_css = JSON.parse fs.readFileSync './public/cdn/css/manifest.json', 'utf8'
        opts.cachebusting =
            themis:
                js: cachebusting_js['themis.js']
                css: cachebusting_css['themis.css']
    catch e
        console.log e
        opts = {}

    gulp.src paths.html
        .pipe mustache opts
        .pipe gulpIf isProduction, minifyHTML()
        .pipe gulp.dest 'public/html'

gulp.task 'default', ['html']

gulp.task 'watch', ->
    extraScripts = [
        'scripts/**/*.coffee'
    ]

    gulp.watch paths.html, ['default']
    gulp.watch paths.stylesheets, ['default']
    gulp.watch paths.scripts.concat(extraScripts), ['default']
    gulp.watch paths.fonts, ['default']
    gulp.watch paths.app_scripts, ['default']
    gulp.watch paths.app_stylesheets, ['default']
