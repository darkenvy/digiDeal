var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    nodemon = require('gulp-nodemon'), 
    tscConfig = require('./tsconfig.json');

var appSrc = 'builds/development/',
    tsSrc = 'process/typescript/';

gulp.task('nodemon', function (cb) {
  var started = false;
  return nodemon({
    script: 'node-server.js',
    ignore: ['builds/*', 'process/*', 'node_modules/*'] 
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true; 
    } 
  });
});

gulp.task('html', function() {
  gulp.src(appSrc + '**/*.html');
});

gulp.task('css', function() {
  gulp.src(appSrc + '**/*.css');
});

gulp.task('copylibs', function() {
  return gulp
    .src([
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/angular2/bundles/http.dev.js',
      'node_modules/angular2/bundles/angular2.dev.js'
    ])
    .pipe(gulp.dest(appSrc + 'js/lib/angular2'));
});

gulp.task('typescript', function () {
  return gulp
    .src(tsSrc + '**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(appSrc + 'js/'));
});

gulp.task('watch', function() {
  gulp.watch(tsSrc + '**/*.ts', ['typescript']);
  gulp.watch(appSrc + 'css/*.css', ['css']);
  gulp.watch(appSrc + '**/*.html', ['html']);
});

// gulp.task('webserver', function() {
//   gulp.src(appSrc)
//     .pipe(webserver({
//       livereload: true,
//       open: true
//     }));
// });

// gulp.task('default', ['nodemon', 'copylibs', 'typescript', 'watch', 'webserver']);
gulp.task('default', ['nodemon', 'copylibs', 'typescript', 'watch']);
