const gulp = require('gulp')
const gulpIf = require('gulp-if')
const plumber = require('gulp-plumber')
const mustache = require('gulp-mustache')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const minifyCSS = require('gulp-minify-css')
const minifyHTML = require('gulp-minify-html')
const rev = require('gulp-rev')
const concatCss = require('gulp-concat-css')

const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

const fs = require('fs')
const del = require('del')
const include = require('gulp-include')
const path = require('path')
const async = require('async')
const axios = require('axios')
const remoteSrc = require('gulp-remote-src')

const customizerHost = process.env.THEMIS_QUALS_CUSTOMIZER_HOST || '127.0.0.1'
const customizerPort = parseInt(process.env.THEMIS_QUALS_CUSTOMIZER_PORT || '7037', 10)

const paths = {
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

function isSass (file) {
  return path.extname(file.path) === '.sass'
}

gulp.task('scripts', function (cb) {
  async.series([
    function (callback) {
      del(['public/assets/js/*'], callback)
    },
    function (callback) {
      browserify({
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
        .on('end', callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('stylesheets', function (cb) {
  let customizerIndex = null
  async.series([
    function (callback) {
      del([
        'public/assets/css/*',
        'customizer/assets/stylesheets/*'
      ], callback)
    },
    function (callback) {
      axios.get(`http://${customizerHost}:${customizerPort}/assets/index/stylesheets`)
        .then(function (response) {
          customizerIndex = response.data
          callback()
        })
        .catch(function (err) {
          callback(err)
        })
    },
    function (callback) {
      remoteSrc(customizerIndex, {
        base: `http://${customizerHost}:${customizerPort}/assets/stylesheets/`
      })
        .pipe(gulp.dest('customizer/assets/stylesheets'))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.stylesheets.concat(customizerIndex.map(function (filename) {
          return path.join('customizer/assets/stylesheets', filename)
        })))
        .pipe(gulpIf(isSass, sass({
          indentedSyntax: true,
          errLogToConsole: true
        })))
        .pipe(concatCss('themis.css', {
          rebaseUrls: false
        }))
        .pipe(gulpIf(isProduction, minifyCSS()))
        .pipe(gulp.dest('public/assets/css'))
        .pipe(rev())
        .pipe(gulp.dest('public/assets/css'))
        .pipe(rev.manifest('manifest.json'))
        .pipe(gulp.dest('public/assets/css'))
        .on('end', callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('fonts', function (cb) {
  let customizerIndex = null
  async.series([
    function (callback) {
      del([
        'public/assets/fonts/*',
        'customizer/assets/fonts/*'
      ], callback)
    },
    function (callback) {
      axios.get(`http://${customizerHost}:${customizerPort}/assets/index/fonts`)
        .then(function (response) {
          customizerIndex = response.data
          callback()
        })
        .catch(function (err) {
          callback(err)
        })
    },
    function (callback) {
      remoteSrc(customizerIndex, {
        base: `http://${customizerHost}:${customizerPort}/assets/fonts/`
      })
        .pipe(gulp.dest('customizer/assets/fonts'))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.fonts.concat(customizerIndex.map(function (filename) {
          return path.join('customizer/assets/fonts', filename)
        })))
        .pipe(gulp.dest('public/assets/fonts'))
        .on('end', callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('images', function (cb) {
  let customizerIndex = null
  async.series([
    function (callback) {
      del([
        'public/assets/images/*',
        'customizer/assets/images/*'
      ], callback)
    },
    function (callback) {
      axios.get(`http://${customizerHost}:${customizerPort}/assets/index/images`)
        .then(function (response) {
          customizerIndex = response.data
          callback()
        })
        .catch(function (err) {
          callback(err)
        })
    },
    function (callback) {
      remoteSrc(customizerIndex, {
        base: `http://${customizerHost}:${customizerPort}/assets/images/`
      })
        .pipe(gulp.dest('customizer/assets/images'))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.images.concat(customizerIndex.map(function (filename) {
          return path.join('customizer/assets/images', filename)
        })))
        .pipe(gulp.dest('public/assets/images'))
        .on('end', callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('default', ['fonts', 'images', 'scripts', 'stylesheets'], function (cb) {
  let opts = {
    partials: {}
  }
  let customizerIndex = null

  async.series([
    function (callback) {
      del([
        'public/html/*',
        'customizer/assets/partials/*'
      ], callback)
    },
    function (callback) {
      try {
        const cachebusting_js = JSON.parse(fs.readFileSync('./public/assets/js/manifest.json', 'utf8'))
        const cachebusting_css = JSON.parse(fs.readFileSync('./public/assets/css/manifest.json', 'utf8'))
        opts.cachebusting = {
          themis: {
            js: cachebusting_js['themis.js'],
            css: cachebusting_css['themis.css']
          }
        }
        callback()
      } catch (err) {
        callback(err)
      }
    },
    function (callback) {
      axios.get(`http://${customizerHost}:${customizerPort}/event-title`)
        .then(function (response) {
          opts.event = {
            title: response.data
          }
          callback()
        })
        .catch(function (err) {
          callback(err)
        })
    },
    function (callback) {
      axios.get(`http://${customizerHost}:${customizerPort}/assets/index/partials`)
        .then(function (response) {
          customizerIndex = response.data
          callback()
        })
        .catch(function (err) {
          callback(err)
        })
    },
    function (callback) {
      remoteSrc(customizerIndex, {
        base: `http://${customizerHost}:${customizerPort}/assets/partials/`
      })
        .pipe(gulp.dest('customizer/assets/partials'))
        .on('end', callback)
    },
    function (callback) {
      const basedir = path.dirname(path.join(process.cwd(), paths.html))
      fs.readdirSync('customizer/assets/partials').forEach(function(filename) {
        const fullPath = path.join(__dirname, 'customizer', 'assets', 'partials', filename)
        if (fs.statSync(fullPath).isFile() && path.extname(fullPath) === '.html') {
          const key = path.basename(fullPath, '.html')
          opts.partials[key] = {
            path: path.relative(basedir, fullPath)
          }
        }
      })
      callback()
    },
    function (callback) {
      gulp
        .src(paths.html)
        .pipe(mustache(opts))
        .pipe(include())
        .pipe(gulpIf(isProduction, minifyHTML()))
        .pipe(gulp.dest('public/html'))
        .on('end', callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})
