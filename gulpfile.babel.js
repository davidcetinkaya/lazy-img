'use strict';

/*
|--------------------------------\
|  dependencies --> NPM MODULES
|--------------------------------/
*/
import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import clean from 'gulp-clean';
import gulpif from 'gulp-if';
import header from 'gulp-header';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import cleanCss from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import defineModule from 'gulp-define-module';
import gulpSequence from 'gulp-sequence';
import pkg from './package.json';
import browserSync from 'browser-sync';
browserSync.create();


/*
|-----------------------\
|  settings --> HEADER
|-----------------------/
*/
const headerText = `/**
  * LazyImg - <%= pkg.description %>
  * v<%= pkg.version %> | <%= pkg.homepage %>
  * Copyright <%= pkg.author %>
  *
  * <%= pkg.license %> license
  */
  `;


/*
|------------------------------\
|  settings --> PATHS & FLAGS
|------------------------------/
*/
const Paths = (() => {
  const srcPath = './src',
    distPath = './dist';

  return {
    ROOT: './',
    OUT: distPath,
    SASS_SRC: `${srcPath}/scss/**/*.scss`,
    JS_SRC: `${srcPath}/js/*.js`
  };
})();


const Flags = ((production) => {
  return {
    DEV: !production,
    PROD: production
  };
})(process.env.NODE_ENV === 'production');


/*
|------------------\
|  task --> CLEAN
|------------------/
*/
gulp.task('clean', () => {
  return gulp.src(`${Paths.OUT}/*`, { read: false })
    .pipe(clean());
});


/*
|---------------------\
|  task --> BUILD JS
|---------------------/
*/
gulp.task('build:js', () => {
  return gulp.src(Paths.JS_SRC)
    .pipe(plumber())
    .pipe(gulpif(Flags.DEV, sourcemaps.init()))
    .pipe(babel())
    .pipe(concat('lazy-img.js'))
    .pipe(gulpif(Flags.PROD, uglify({mangle: true})))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(Flags.DEV, sourcemaps.write('.')))
    .pipe(gulpif(Flags.PROD, header(headerText, {pkg : pkg})))
    .pipe(gulp.dest(Paths.OUT))
    .pipe(browserSync.stream());
});


/*
|-------------------------\
|  task --> BUILD NPM JS
|-------------------------/
*/
gulp.task('build:npm-js', () => {
  if (Flags.PROD) {
    const wrapper = `function() {
      <%= contents %>
      return LazyImg;
      }()`;

    return gulp.src(Paths.JS_SRC)
      .pipe(plumber())
      .pipe(babel())
      .pipe(concat('index.js'))
      .pipe(defineModule('node', {wrapper: wrapper}))
      .pipe(gulp.dest(Paths.ROOT))
      .pipe(browserSync.stream());
  }
});


/*
|--------------------\
|  task --> LINT JS
|--------------------/
*/
gulp.task('lint:js', () => {
  return gulp.src(Paths.JS_SRC)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


/*
|----------------------\
|  task --> BUILD CSS
|----------------------/
*/
gulp.task('build:css', () => {
  return gulp.src(Paths.SASS_SRC)
    .pipe(plumber())
    .pipe(gulpif(Flags.DEV, sourcemaps.init()))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
        'last 6 versions',
        'ie 10-11',
        '> 5%'
      ]
    }))
    .pipe(gulpif(Flags.DEV, sourcemaps.write('.')))
    .pipe(gulp.dest(Paths.OUT))
    .pipe(browserSync.stream());
});


/*
|------------------------\
|  task --> BROWSERSYNC
|------------------------/
*/
gulp.task('browserSync', () => {
  Flags.DEV && browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});


/*
|------------------\
|  task --> BUILD
|------------------/
*/
gulp.task('build', ['build:js', 'build:npm-js', 'build:css'], () => {
  if (Flags.DEV) {
    gulp.watch(Paths.JS_SRC, ['build:js']);
    gulp.watch(Paths.SASS_SRC, ['build:css']);
  }
});

gulp.task('serve', gulpSequence('clean', 'build', 'browserSync'));

gulp.task('lint', ['lint:js']);

gulp.task('default', ['serve']);