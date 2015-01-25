gulp = require 'gulp'
del = require 'del'
watch = require 'gulp-watch'
buster = require 'gulp-buster'

paths =
    stylesheets: [
        'bower_components/bootstrap/dist/css/bootstrap.css'
    ]
    html: [
        'html/index.html'
    ]

gulp.task 'clean', (callback) ->
    del ['public/css'], callback

gulp.task 'stylesheets', ->
    gulp.src paths.stylesheets
        .pipe gulp.dest 'public/css'

gulp.task 'html', ->
    gulp.src paths.html
        .pipe gulp.dest 'public'

gulp.task 'default', ['html', 'stylesheets']
