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

import fs from 'fs'
import del from 'del'
import include from 'gulp-include'
import path from 'path'

let Customizer = require(process.env.THEMIS_CUSTOMIZER_PACKAGE || 'themis-quals-customizer-default').default
let customizer = new Customizer()

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
  images: [
  ],
  html: 'html/index.html'
}

function isProduction () {
  return process.env.NODE_ENV === 'production'
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
    .pipe(concatCss('themis.css', {
      rebaseUrls: false
    }))
    .pipe(gulpIf(isProduction, minifyCSS()))
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

gulp.task('clean_images', (callback) => {
  del(['public/assets/images/*'], callback)
})

gulp.task('images', ['clean_images'], () => {
  gulp
    .src(paths.images.concat(customizer.getImages().map((imagePath) => {
      return path.relative(process.cwd(), imagePath)
    })))
    .pipe(gulp.dest('public/assets/images'))
})

gulp.task('clean_html', (callback) => {
  del(['public/html/*'], callback)
})

function preparePartialsConfig (config) {
  let result = {}
  let basedir = path.dirname(path.join(process.cwd(), paths.html))
  for (let key in config) {
    result[key] = {
      path: path.relative(basedir, config[key].path)
    }
  }

  return result
}

gulp.task('html', ['clean_html', 'fonts', 'images', 'scripts', 'stylesheets'], () => {
  let opts = {}

  try {
    let cachebusting_js = JSON.parse(fs.readFileSync('./public/assets/js/manifest.json', 'utf8'))
    let cachebusting_css = JSON.parse(fs.readFileSync('./public/assets/css/manifest.json', 'utf8'))

    opts.event = {
      title: customizer.getEventTitle()
    }

    opts.partials = preparePartialsConfig(customizer.getPartials())

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
    .pipe(include())
    .pipe(gulpIf(isProduction, minifyHTML()))
    .pipe(gulp.dest('public/html'))
})

gulp.task('default', ['html'])
