/* eslint-disable import/no-extraneous-dependencies */

/*
|--------------------------------\
|  dependencies --> NPM MODULES
|--------------------------------/
*/
import gulp from 'gulp';
import path from 'path';
import clean from 'gulp-clean';
import sequence from 'run-sequence';
import gulpif from 'gulp-if';
import autoprefixer from 'autoprefixer';
import sass from 'gulp-sass';
import postCss from 'gulp-postcss';
import cleanCss from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.babel';
import npmWebpackConfig from './webpack-npm.config.babel';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import server from './server.json';
browserSync.create();


/*
|------------------------------------------\
|  settings --> PATHS, BROWSERSYNC CONFIG
|------------------------------------------/
*/
const PRODUCTION = process.env.npm_lifecycle_event === 'build';
const Paths = {
  OUT: 'dist',
  JS_ENTRY: 'src/js/lazy-img.js',
  JS_SRC: 'src/js/**/*.js',
  JS_NPM: 'index.js',
  SASS_ENTRY: 'src/scss/lazy-img.required.scss',
  SASS_SRC: 'src/scss/**/*.scss',
  HTML_SRC: ['*.html']
};
const BrowserSyncConfig = {
  proxy: server.ROOT,
  notify: false
};


/*
|----------------------\
|  task --> BUNDLE JS
|----------------------/
*/
gulp.task('bundle:js', () =>
  gulp.src(Paths.JS_ENTRY)
    .pipe(plumber())
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(Paths.OUT))
    .pipe(browserSync.stream()));


/*
|--------------------------\
|  task --> BUNDLE NPM JS
|--------------------------/
*/
gulp.task('bundle:npmjs', () =>
  gulp.src(Paths.JS_ENTRY)
    .pipe(webpack(npmWebpackConfig))
    .pipe(gulp.dest('./')));


/*
|------------------------\
|  task --> BUNDLE SASS
|------------------------/
*/
gulp.task('bundle:sass', () => {
  const postCssProcessors = [
    autoprefixer({
      browsers: [
        'last 2 versions',
        'ie 9-11',
        '> 5%'
      ],
      remove: false
    })
  ];

  return gulp.src([Paths.SASS_ENTRY])
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postCss(postCssProcessors))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(cleanCss({
      format: {
        breaks: {
          afterAtRule: true,
          afterBlockBegins: true,
          afterBlockEnds: true,
          afterComment: true,
          afterProperty: true,
          afterRuleBegins: true,
          afterRuleEnds: true,
          beforeBlockEnds: true,
          betweenSelectors: true
        },
        indentBy: 2,
        indentWith: 'space',
        spaces: {
          aroundSelectorRelation: true,
          beforeBlockBegins: true,
          beforeValue: true
        }
      }
    }))
    .pipe(gulp.dest(Paths.OUT))
    .pipe(browserSync.stream());
});


/*
|------------------------\
|  task --> RELOAD HTML
|------------------------/
*/
gulp.task('reload:html', () =>
  gulp.src(Paths.HTML_SRC)
  .pipe(browserSync.stream()));


/*
|------------------------\
|  task --> BROWSERSYNC
|------------------------/
*/
gulp.task('browserSync', () => {
  !PRODUCTION && browserSync.init(BrowserSyncConfig);
});


/*
|-----------------------\
|  task --> BUNDLE ALL
|-----------------------/
*/
gulp.task('bundle', ['bundle:js', 'bundle:npmjs', 'bundle:sass'], () => {
  if (!PRODUCTION) {
    gulp.watch(Paths.JS_SRC, ['bundle:js']);
    gulp.watch(Paths.SASS_SRC, ['bundle:sass']);
    gulp.watch(Paths.HTML_SRC, ['reload:html']);
  }
});


/*
|------------------\
|  task --> CLEAN
|------------------/
*/
gulp.task('clean', () => gulp.src([Paths.OUT, Paths.JS_NPM], { read: false }).pipe(clean()));


/*
|--------------------\
|  task --> DEFAULT
|--------------------/
*/
gulp.task('default', sequence('clean', 'bundle', 'browserSync'));
