const gulp = require('gulp')
const gulpIf = require('gulp-if')
const plumber = require('gulp-plumber')
const mustache = require('gulp-mustache')
const sass = require('gulp-sass')(require('sass'))
const uglify = require('gulp-uglify')
const cleanCSS = require('gulp-clean-css')
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
const tmp = require('tmp')
const zopfli = require('gulp-zopfli-green')
const brotli = require('gulp-brotli')
const filter = require('gulp-filter')

const buildDir = path.join(__dirname, 'build')

const brandingRoot = process.env.BRANDING_ROOT_PATH

if (!brandingRoot) {
  throw new Error('BRANDING_ROOT_PATH is not defined')
}

function getBrandingPath(subdir) {
  return path.join(brandingRoot, subdir)
}

function getFiles(subdir) {
  const dir = getBrandingPath(subdir)
  return fs.readdirSync(dir).filter((filename) => {
    const fullPath = path.join(dir, filename)
    return fs.statSync(fullPath).isFile()
  })
}

const paths = {
  scripts: [
    'src/scripts/volgactf-qualifier.js'
  ],
  fonts: [
    'node_modules/open-iconic/font/fonts/*.eot',
    'node_modules/open-iconic/font/fonts/*.otf',
    'node_modules/open-iconic/font/fonts/*.svg',
    'node_modules/open-iconic/font/fonts/*.ttf',
    'node_modules/open-iconic/font/fonts/*.woff'
  ],
  stylesheets: [
    'src/stylesheets/volgactf-qualifier.sass'
  ],
  images: [
  ],
  html: 'src/html'
}

function isOptimize () {
  return process.env.OPTIMIZE === 'yes'
}

function isSass (file) {
  return path.extname(file.path) === '.sass'
}

gulp.task('scripts', function (cb) {
  let tmpDir = null
  const sequence = []

  sequence.push(function (callback) {
    tmp.dir({}, function (err, tmpPath, cleanupCallback) {
      if (err) {
        callback(err)
      } else {
        tmpDir = tmpPath
        callback()
      }
    })
  })

  sequence.push(function (callback) {
    del([path.join(buildDir, 'assets', 'js', '*')], callback)
  })

  sequence.push(function (callback) {
    browserify({
      entries: paths.scripts,
      extensions: ['.js'],
      debug: !isOptimize()
    })
      .transform(babelify)
      .bundle()
      .pipe(source('volgactf-qualifier.js'))
      .pipe(buffer())
      .pipe(plumber())
      .pipe(gulpIf(isOptimize, uglify()))
      .pipe(gulp.dest(tmpDir))
      .pipe(rev())
      .pipe(gulp.dest(tmpDir))
      .pipe(rev.manifest('manifest.json'))
      .pipe(gulp.dest(path.join(buildDir, 'assets', 'js')))
      .on('end', callback)
  })

  sequence.push(function (callback) {
    del([
      path.join(tmpDir, 'volgactf-qualifier.js')
    ], {
      force: true
    }, callback)
  })

  if (isOptimize()) {
    sequence.push(function (callback) {
      gulp
        .src([
          path.join(tmpDir, '*.js')
        ])
        .pipe(zopfli())
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    })
    sequence.push(function (callback) {
      gulp
        .src([
          path.join(tmpDir, '*.js')
        ])
        .pipe(brotli.compress({ skipLarger: true }))
        .pipe(gulp.dest(tmpDir))
        .on('end', callback)
    })
  }


  sequence.push(function (callback) {
    gulp
      .src([
        path.join(tmpDir, '*')
      ])
      .pipe(gulp.dest(path.join(buildDir, 'assets', 'js')))
      .on('end', callback)
  })

  sequence.push(function (callback) {
    del([
      tmpDir
    ], {
      force: true
    }, callback)
  })

  async.series(sequence, function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('stylesheets', function (cb) {
  let customizerIndex = []
  let customizerPaths = []
  let tmpDir2 = null
  const sequence = []

  sequence.push(function (callback) {
    tmp.dir({}, function (err, tmpPath, cleanupCallback) {
      if (err) {
        callback(err)
      } else {
        tmpDir2 = tmpPath
        callback()
      }
    })
  })

  sequence.push(function (callback) {
    del([
      path.join(buildDir, 'assets', 'css', '*')
    ], callback)
  })

  sequence.push(function (callback) {
    try {
      customizerIndex = getFiles('stylesheets')
      customizerPaths = customizerIndex.map(filename =>
        path.join(getBrandingPath('stylesheets'), filename)
      )
      callback()
    } catch (err) {
      callback(err)
    }
  })

  sequence.push(function (callback) {
    gulp
      .src(paths.stylesheets.concat(customizerPaths))
      .pipe(gulpIf(isSass, sass({
        indentedSyntax: true,
        errLogToConsole: true
      })))
      .pipe(concatCss('volgactf-qualifier.css', {
        rebaseUrls: false
      }))
      .pipe(gulpIf(isOptimize, cleanCSS()))
      .pipe(gulp.dest(tmpDir2))
      .pipe(rev())
      .pipe(gulp.dest(tmpDir2))
      .pipe(rev.manifest('manifest.json'))
      .pipe(gulp.dest(path.join(buildDir, 'assets', 'css')))
      .on('end', callback)
  })

  sequence.push(function (callback) {
    del([
      path.join(tmpDir2, 'volgactf-qualifier.css')
    ], {
      force: true
    }, callback)
  })

  if (isOptimize()) {
    sequence.push(function (callback) {
      gulp
        .src([
          path.join(tmpDir2, '*.css')
        ])
        .pipe(zopfli())
        .pipe(gulp.dest(tmpDir2))
        .on('end', callback)
    })
    sequence.push(function (callback) {
      gulp
        .src([
          path.join(tmpDir2, '*.css')
        ])
        .pipe(brotli.compress({ skipLarger: true }))
        .pipe(gulp.dest(tmpDir2))
        .on('end', callback)
    })
  }

  sequence.push(function (callback) {
    gulp
      .src([
        path.join(tmpDir2, '*')
      ])
      .pipe(gulp.dest(path.join(buildDir, 'assets', 'css')))
      .on('end', callback)
  })

  sequence.push(function (callback) {
    del([
      tmpDir2
    ], {
      force: true
    }, callback)
  })

  async.series(sequence, function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('fonts', function (cb) {
  let customizerIndex = null
  let customizerPaths = []
  const sequence = []

  sequence.push(function (callback) {
    del([
      path.join(buildDir, 'assets', 'fonts', '*')
    ], callback)
  })

  sequence.push(function (callback) {
    try {
      customizerIndex = getFiles('fonts')
      customizerPaths = customizerIndex.map(filename =>
        path.join(getBrandingPath('fonts'), filename)
      )
      callback()
    } catch (err) {
      callback(err)
    }
  })

  sequence.push(function (callback) {
    gulp
      .src(paths.fonts.concat(customizerPaths))
      .pipe(gulp.dest(path.join(buildDir, 'assets', 'fonts')))
      .on('end', callback)
  })

  if (isOptimize()) {
    sequence.push(function (callback) {
      gulp
        .src(paths.fonts.concat(customizerPaths))
        .pipe(filter([
          '**/*.eot',
          '**/*.otf',
          '**/*.ttf',
          '**/*.svg'
        ]))
        .pipe(zopfli())
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'fonts')))
        .on('end', callback)
    })
    sequence.push(function (callback) {
      gulp
        .src(paths.fonts.concat(customizerPaths))
        .pipe(filter([
          '**/*.eot',
          '**/*.otf',
          '**/*.ttf',
          '**/*.svg'
        ]))
        .pipe(brotli.compress({ skipLarger: true }))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'fonts')))
        .on('end', callback)
    })
  }

  async.series(sequence, function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('images', function (cb) {
  let customizerIndex = null
  let customizerPaths = []

  async.series([
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'images', '*')
      ], callback)
    },
    function (callback) {
      try {
        customizerIndex = getFiles('images')
        customizerPaths = customizerIndex.map(filename =>
          path.join(getBrandingPath('images'), filename)
        )
        callback()
      } catch (err) {
        callback(err)
      }
    },
    function (callback) {
      gulp
        .src(paths.images.concat(customizerPaths))
        .pipe(gulp.dest(path.join(buildDir, 'assets', 'images')))
        .on('end', callback)
    },
  ], function (err, values) {
    if (err) {
      cb(err)
    } else {
      cb()
    }
  })
})

gulp.task('html', function (cb) {
  let opts = {
    partials: {}
  }
  let customizerIndex = null
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
          volgactf_qualifier: {
            js: cachebusting_js['volgactf-qualifier.js'],
            css: cachebusting_css['volgactf-qualifier.css']
          }
        }
        callback()
      } catch (err) {
        callback(err)
      }
    },
    function (callback) {
      try {
        const eventConfig = JSON.parse(
          fs.readFileSync(path.join(brandingRoot, 'event.json'), 'utf8')
        )

        opts.event = {
          title: eventConfig.title
        }

        callback()
      } catch (err) {
        callback(err)
      }
    },
    function (callback) {
      try {
        customizerIndex = getFiles('partials')
        callback()
      } catch (err) {
        callback(err)
      }
    },
    function (callback) {
      const basedir = path.join(__dirname, paths.html)

      customizerIndex.forEach(function(filename) {
        const fullPath = path.join(getBrandingPath('partials'), filename)

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
        .src(`${paths.html}/**/*.html`)
        .pipe(mustache(opts))
        .pipe(include({
          includePaths: [
            path.join(__dirname, paths.html)
          ]
        }))
        .on('error', console.log)
        .pipe(gulp.dest(path.join(buildDir, 'html')))
        .on('end', callback)
    },
    function (callback) {
      del([
        path.join(buildDir, 'assets', 'js', 'manifest.json'),
        path.join(buildDir, 'assets', 'css', 'manifest.json'),
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

gulp.task('default', gulp.series('fonts', 'images', 'scripts', 'stylesheets', 'html'))
