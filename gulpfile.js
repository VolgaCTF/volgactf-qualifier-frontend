require('dotenv').config()

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
const tmp = require('tmp')

const customizerHost = process.env.THEMIS_QUALS_CUSTOMIZER_HOST || '127.0.0.1'
const customizerPort = parseInt(process.env.THEMIS_QUALS_CUSTOMIZER_PORT || '7037', 10)

const buildDir = path.join(__dirname, 'build')

const paths = {
  scripts: [
    'src/scripts/themis.js'
  ],
  fonts: [
    'node_modules/bootstrap/dist/fonts/*.eot',
    'node_modules/bootstrap/dist/fonts/*.svg',
    'node_modules/bootstrap/dist/fonts/*.ttf',
    'node_modules/bootstrap/dist/fonts/*.woff',
    'node_modules/bootstrap/dist/fonts/*.woff2'
  ],
  stylesheets: [
    'src/stylesheets/themis.sass'
  ],
  images: [
  ],
  html: 'src/html/index.html'
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
      del([path.join(buildDir, 'assets', 'js', '*')], callback)
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
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'js')))
        .pipe(rev())
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'js')))
        .pipe(rev.manifest('manifest.json'))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'js')))
        .on('end', callback)
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'js', 'themis.js')
      ], callback)
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
  let tmpDir = null
  async.series([
    function (callback) {
      tmp.dir({}, function (err, tmpPath, cleanupCallback) {
        if (err) {
          callback(err)
        } else {
          tmpDir = tmpPath
          callback()
        }
      })
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'css', '*')
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
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.stylesheets.concat(customizerIndex.map(function (filename) {
          return path.join(tmpDir, filename)
        })))
        .pipe(gulpIf(isSass, sass({
          indentedSyntax: true,
          errLogToConsole: true
        })))
        .pipe(concatCss('themis.css', {
          rebaseUrls: false
        }))
        .pipe(gulpIf(isProduction, minifyCSS()))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'css')))
        .pipe(rev())
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'css')))
        .pipe(rev.manifest('manifest.json'))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'css')))
        .on('end', callback)
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'css', 'themis.css'),
        tmpDir
      ], {
        force: true
      }, callback)
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
  let tmpDir = null
  async.series([
    function (callback) {
      tmp.dir({}, function (err, tmpPath, cleanupCallback) {
        if (err) {
          callback(err)
        } else {
          tmpDir = tmpPath
          callback()
        }
      })
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'fonts', '*')
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
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.fonts.concat(customizerIndex.map(function (filename) {
          return path.join(tmpDir, filename)
        })))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'fonts')))
        .on('end', callback)
    },
    function (callback) {
      del([tmpDir], { force: true }, callback)
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
  let tmpDir = null
  async.series([
    function (callback) {
      tmp.dir({}, function (err, tmpPath, cleanupCallback) {
        if (err) {
          callback(err)
        } else {
          tmpDir = tmpPath
          callback()
        }
      })
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'images', '*')
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
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    },
    function (callback) {
      gulp
        .src(paths.images.concat(customizerIndex.map(function (filename) {
          return path.join(tmpDir, filename)
        })))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'images')))
        .on('end', callback)
    },
    function (callback) {
      del([tmpDir], { force: true }, callback)
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
  let tmpDir = null
  async.series([
    function (callback) {
      tmp.dir({}, function (err, tmpPath, cleanupCallback) {
        if (err) {
          callback(err)
        } else {
          tmpDir = tmpPath
          callback()
        }
      })
    },
    function (callback) {
      del([
        path.join(buildDir, 'html', '*')
      ], callback)
    },
    function (callback) {
      try {
        const cachebusting_js = JSON.parse(fs.readFileSync(path.join(buildDir, 'assets', 'js', 'manifest.json'), 'utf8'))
        const cachebusting_css = JSON.parse(fs.readFileSync(path.join(buildDir, 'assets', 'css', 'manifest.json'), 'utf8'))
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
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    },
    function (callback) {
      const basedir = path.dirname(path.join(__dirname, paths.html))
      fs.readdirSync(tmpDir).forEach(function(filename) {
        const fullPath = path.join(tmpDir, filename)
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
        .pipe(include({
          includePaths: [
            path.dirname(path.join(__dirname, paths.html))
          ]
        }))
        .on('error', console.log)
        .pipe(gulpIf(isProduction, minifyHTML()))
        .pipe(gulp.dest(path.join(buildDir, 'html')))
        .on('end', callback)
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'js', 'manifest.json'),
        path.join(buildDir, 'assets', 'css', 'manifest.json'),
        tmpDir
      ], {
        force: true
      }, callback)
    }
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})
