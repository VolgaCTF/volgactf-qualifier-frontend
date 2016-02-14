import gulp from 'gulp'
import gulpIf from 'gulp-if'
import plumber from 'gulp-plumber'
import mustache from 'gulp-mustache'
import sass from 'gulp-sass'
import uglify from 'gulp-uglify'
import minifyCSS from 'gulp-minify-css'
import minifyHTML from 'gulp-minify-html'
import rev from 'gulp-rev'
import concatCss from 'gulp-concat-css'

import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'

import yaml from 'js-yaml'
import fs from 'fs'
import del from 'del'

let paths = {
  scripts: [
    'scripts/themis.js'
  ],
  fonts: [
    'node_modules/bootstrap/dist/fonts/*.eot',
    'node_modules/bootstrap/dist/fonts/*.svg',
    'node_modules/bootstrap/dist/fonts/*.ttf',
    'node_modules/bootstrap/dist/fonts/*.woff',
    'node_modules/bootstrap/dist/fonts/*.woff2'
  ],
  stylesheets: [
    'stylesheets/themis.sass'
  ],
  html: [
    'html/index.html'
  ]
}

function isProduction () {
  return process.env['NODE_ENV'] === 'production'
}

gulp.task('clean_scripts', (callback) => {
  del(['public/assets/js/*'], callback)
})

gulp.task('scripts', ['clean_scripts'], () => {
  return browserify({
    entries: paths.scripts,
    extensions: ['.js'],
    debug: !isProduction()
  })
    .transform(babelify)
    .bundle()
    .pipe(source('themis.js'))
    .pipe(buffer())
    .pipe(plumber())
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(gulp.dest('public/assets/js'))
    .pipe(rev())
    .pipe(gulp.dest('public/assets/js'))
    .pipe(rev.manifest('manifest.json'))
    .pipe(gulp.dest('public/assets/js'))
})

gulp.task('clean_stylesheets', (callback) => {
  del(['public/assets/css/*'], callback)
})

gulp.task('stylesheets', ['clean_stylesheets'], () => {
  return gulp
    .src(paths.stylesheets)
    .pipe(sass({ indentedSyntax: true, errLogToConsole: true }))
    .pipe(gulpIf(isProduction, minifyCSS()))
    .pipe(concatCss('themis.css', {
      rebaseUrls: false
    }))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(rev())
    .pipe(gulp.dest('public/assets/css'))
    .pipe(rev.manifest('manifest.json'))
    .pipe(gulp.dest('public/assets/css'))
})

gulp.task('clean_fonts', (callback) => {
  del(['public/assets/fonts/*'], callback)
})

gulp.task('fonts', ['clean_fonts'], () => {
  gulp
    .src(paths.fonts)
    .pipe(gulp.dest('public/assets/fonts'))
})

gulp.task('clean_html', (callback) => {
  del(['public/html/*'], callback)
})

gulp.task('html', ['clean_html', 'fonts', 'scripts', 'stylesheets'], () => {
  let opts = null

  try {
    opts = yaml.safeLoad(fs.readFileSync('./opts.yml', 'utf8'))
    let cachebusting_js = JSON.parse(fs.readFileSync('./public/assets/js/manifest.json', 'utf8'))
    let cachebusting_css = JSON.parse(fs.readFileSync('./public/assets/css/manifest.json', 'utf8'))

    opts.cachebusting = {
      themis: {
        js: cachebusting_js['themis.js'],
        css: cachebusting_css['themis.css']
      }
    }
  } catch (e) {
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
