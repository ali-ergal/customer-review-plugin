const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// Compile SCSS to CSS
gulp.task('sass', function() {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('assets/css'));
});

// Minify JS
gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('assets/js'));
});

// Watch files
gulp.task('watch', function() {
  gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
});

// Default task
gulp.task('default', gulp.series('sass', 'js'));

// Dev task with watch
gulp.task('dev', gulp.series('default', 'watch'));

