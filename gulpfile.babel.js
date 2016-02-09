import gulp from 'gulp'
import gulpIf from 'gulp-if'
import plumber from 'gulp-plumber'
import mustache from 'gulp-mustache'
import sass from 'gulp-sass'
import uglify from 'gulp-uglify'
import minifyCSS from 'gulp-minify-css'
import minifyHTML from 'gulp-minify-html'
import rev from 'gulp-rev'

import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'

import yaml from 'js-yaml'
import path from 'path'
import fs from 'fs'
import del from 'del'


let paths = {
  scripts: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/history.js/scripts/bundled-uncompressed/html5/jquery.history.js',
    'bower_components/underscore/underscore.js',
    'bower_components/requirejs/require.js',
    'bower_components/eventEmitter/EventEmitter.js',
    'bower_components/bootstrap-filestyle/src/bootstrap-filestyle.js',
    'bower_components/jquery-form/jquery.form.js',
    'bower_components/query-string/query-string.js',
    'bower_components/parsleyjs/dist/parsley.js',
    'bower_components/markdown-it/dist/markdown-it.js',
    'bower_components/moment/moment.js',
    'bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js'
  ],
  app_scripts: [
    'scripts/themis.js'
  ],
  fonts: [
    'bower_components/bootstrap/dist/fonts/*.eot',
    'bower_components/bootstrap/dist/fonts/*.svg',
    'bower_components/bootstrap/dist/fonts/*.ttf',
    'bower_components/bootstrap/dist/fonts/*.woff',
    'bower_components/bootstrap/dist/fonts/*.woff2'
  ],
  stylesheets: [
    'bower_components/bootstrap/dist/css/bootstrap.css',
    'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
    'bower_components/animate.css/animate.css'
  ],
  app_stylesheets: [
    'stylesheets/themis.sass'
  ],
  html: [
    'html/index.html'
  ]
}


function isProduction() {
  return (process.env['NODE_ENV'] === 'production')
}


gulp.task('clean_scripts', (callback) => {
  del(['public/cdn/js/*'], callback)
})


// gulp.task('scripts', ['clean_scripts'], () => {
//   return gulp
//     .src(paths.scripts)
//     .pipe(plumber())
//     .pipe(gulpIf(isProduction, uglify()))
//     .pipe(gulp.dest('public/cdn/js'))
// })


gulp.task('app_scripts', ['clean_scripts'], () => {

  return browserify({
    entries: paths.app_scripts,
    extensions: ['.js'],
    debug: !isProduction()
  })
    .transform(babelify)
    .bundle()
    .pipe(source('themis.js'))
    .pipe(buffer())
    .pipe(plumber())
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(gulp.dest('public/cdn/js'))
    .pipe(rev())
    .pipe(gulp.dest('public/cdn/js'))
    .pipe(rev.manifest('manifest.json'))
    .pipe(gulp.dest('public/cdn/js'))
})


function isSass(file) {
  return (path.extname(file.path) === '.sass')
}


gulp.task('clean_stylesheets', (callback) => {
  del(['public/cdn/css/*'], callback)
})


gulp.task('stylesheets', ['clean_stylesheets'], () => {
  return gulp
    .src(paths.stylesheets)
    .pipe(gulpIf(isProduction, minifyCSS()))
    .pipe(gulp.dest('public/cdn/css'))
})


gulp.task('app_stylesheets', ['clean_stylesheets'], () => {
  return gulp
    .src(paths.app_stylesheets)
    .pipe(sass({ indentedSyntax: true, errLogToConsole: true }))
    .pipe(gulpIf(isProduction, minifyCSS()))
    .pipe(gulp.dest('public/cdn/css'))
    .pipe(rev())
    .pipe(gulp.dest('public/cdn/css'))
    .pipe(rev.manifest('manifest.json'))
    .pipe(gulp.dest('public/cdn/css'))
})


gulp.task('clean_fonts', (callback) => {
  del(['public/cdn/fonts/*'], callback)
})


gulp.task('fonts', ['clean_fonts'], () => {
  gulp
    .src(paths.fonts)
    .pipe(gulp.dest('public/cdn/fonts'))
})


gulp.task('clean_html', (callback) => {
  del(['public/html/*'], callback)
})


gulp.task('html', ['clean_html', 'stylesheets', /*'scripts',*/ 'fonts', 'app_scripts', 'app_stylesheets'], () => {
  let opts = null

  try {
    opts = yaml.safeLoad(fs.readFileSync('./opts.yml', 'utf8'))
    let cachebusting_js = JSON.parse(fs.readFileSync('./public/cdn/js/manifest.json', 'utf8'))
    let cachebusting_css = JSON.parse(fs.readFileSync('./public/cdn/css/manifest.json', 'utf8'))

    opts.cachebusting = {
      themis: {
        js: cachebusting_js['themis.js'],
        css: cachebusting_css['themis.css']
      }
    }
  } catch(e) {
    console.log(e)
    opts = {}
  }

  gulp
    .src(paths.html)
    .pipe(mustache(opts))
    .pipe(gulpIf(isProduction, minifyHTML()))
    .pipe(gulp.dest('public/html'))
})


gulp.task('default', ['html'])

// gulp.task 'watch', ->
//     extraScripts = [
//         'scripts/**/*.coffee'
//     ]

//     gulp.watch paths.html, ['default']
//     gulp.watch paths.stylesheets, ['default']
//     gulp.watch paths.scripts.concat(extraScripts), ['default']
//     gulp.watch paths.fonts, ['default']
//     gulp.watch paths.app_scripts, ['default']
//     gulp.watch paths.app_stylesheets, ['default']
