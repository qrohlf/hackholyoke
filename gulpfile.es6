let fs = require('fs');
let path = require('path');

let browserify = require('browserify');
let gulp = require('gulp');
let watchify = require('watchify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let size = require('gulp-size');
let gutil = require('gulp-util');
let sourcemaps = require('gulp-sourcemaps');
let sass = require('gulp-sass');
let flatten = require('gulp-flatten');
let minifyCSS = require('gulp-minify-css');
let notifier = require('node-notifier');
var autoprefixer = require('gulp-autoprefixer');

let browserSync = require('browser-sync');
let reload = browserSync.reload;

let production = process.env.NODE_ENV == 'production';

// Spin up a watchify instance
let bundler = watchify(browserify('./client/js/app.jsx', watchify.args));
bundler.transform(babelify);
bundler.on('update', ()=> gulp.start('watchify'));

gulp.task('watchify', function() {
  // start the deps bundler

  return bundler.bundle()
    .on('error', function(error) {
      notifier.notify({
        'title': 'Browserify Build Failed',
        'message': error.message
      });
      console.log(error.message);
      this.emit('end');
    })
    .pipe(source('./bundle.js'))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream: true}));
});


gulp.task('sass', function() {

  gulp.src('./client/css/style.scss')
    .pipe(sourcemaps.init())
      .pipe(sass())
      .on('error', function(error) {
        notifier.notify({
          'title': 'SASS Build Failed',
          'message': path.relative(__dirname, error.fileName)+':'+error.lineNumber
        });
        console.log(error.message+' at '+error.fileName+':'+error.lineNumber);
      })
      .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
      }))
      .pipe(minifyCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }));
});

gulp.task('clean', (done)=> fs.unlink('dist', done));


gulp.task('index', function() {
  gulp.src('./client/html/index.html')
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream: true}));
});

gulp.task('images', function() {
  gulp.src('./client/images/**')
    .pipe(gulp.dest('dist/images'))
    .pipe(reload({stream: true}));
});

gulp.task('fonts', function() {
  gulp.src(['./client/fonts/**', 'bower_components/**/*.{ttf,woff,eof,svg}'])
    .pipe(flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe(reload({stream: true}));
});


gulp.task('watch', ['watchify', 'sass', 'index', 'images', 'fonts'], function() {
  gulp.watch('./client/css/**/*', ['sass']);
  gulp.watch('./client/html/index.html', ['index']);
  gulp.watch('./client/images/**/*', ['images']);
  gulp.watch('./client/fonts/**/*', ['fonts']);
});


gulp.task('default', ['watch']);