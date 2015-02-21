// include gulp
var gulp = require('gulp');
// include plug-ins
var htmlreplace = require('gulp-html-replace');
var minifyHTML = require('gulp-minify-html');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// minify new or changed HTML pages
gulp.task('htmlpage', function() {
  var htmlSrc = './*.html',
      htmlDst = './build';

  gulp.src(htmlSrc)
    .pipe(htmlreplace({
        'css': 'css/styles.min.css',
        'js': 'js/script.min.js'
    }))
    .pipe(minifyHTML({quotes:true}))
    .pipe(gulp.dest(htmlDst));
});

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  gulp.src(['./js/*.js'])
    .pipe(concat('script.min.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./build/js/'));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  gulp.src(['./css/*.css'])
    .pipe(concat('styles.min.css'))
    .pipe(autoprefix('last 3 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/css/'));
});

gulp.task('imagemin', function() {
  var imgSrc = './*.png',
      imgDst = './build/';
 
  gulp.src(imgSrc)
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});
// default gulp task
gulp.task('default', ['scripts', 'styles', 'imagemin', 'htmlpage'], function() {
    
});
