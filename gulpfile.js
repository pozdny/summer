/**
 * Created by user on 24.03.16.
 */
var jshint = require('gulp-jshint');
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var useref = require('gulp-useref');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var postcss = require('gulp-postcss');
var plumber = require("gulp-plumber");
var browserify = require("browserify");
var config = {

};
gulp.task('useref', function(){
    return gulp.src('app/*.html')
        .pipe(plumber({
            errorHandler: onError
         }))
        .pipe(useref())
        .pipe(gulp.dest('dist'))
});
gulp.task('minify', ['useref'], function() {
    // Минифицируем только CSS файлы
    gulp.src('dist/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css/'));
    // Минифицируем только js файлы
    gulp.src('dist/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'));
});
gulp.task('prejs', function () {
    return gulp.src('app/js/*.js')
        .pipe(jshint({
            "lookup": true
        }))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('app/js'))
        /*.pipe(browserSync.reload({
            stream: true
        }))*/

});

// --------------------------------------------------------------------
// Task: Clean app/js
// --------------------------------------------------------------------
gulp.task('clean-tmp', function (cb) {
    del(['app/js/tmp/'], cb);
});

// синхронизация окна браузера и изменения файлов
gulp.task('watch', ['browserSync', 'sass'], function(){
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Обновляем браузер при любых изменениях в HTML CSS или JS
    gulp.watch('app/css/*.css', ['css']);
    gulp.watch('app/js/*.js', ['prejs']);
    gulp.watch('app/content/*.json', browserSync.reload);
    gulp.watch('app/*.html', browserSync.reload);

});
gulp.task('css', function () {
    var cssnext = require('postcss-cssnext');
    var precss = require('precss');
    var processors = [cssnext, precss];
    return gulp.src('app/css/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'))

});
// синхронизация окна браузера и изменения файлов
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        }
    })
});
gulp.task('images', function(){
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        // кэширование изображений, прошедших через imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});
gulp.task('clean:dist', function(callback){
    del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});
gulp.task('clean:lib', function(callback){
    del(['app/css/lib/**/*'], callback);
    del(['app/js/lib/**/*'], callback);
});
gulp.task('clean', function(callback) {
    del('dist');
    return cache.clearAll(callback);
});
gulp.task('copyjs', function(){
    gulp.src('libraries/framework7/dist/js/framework7.min.js')
        .pipe(gulp.dest('app/js/lib/', {}));
});
gulp.task('copycss', function(){
    gulp.src('libraries/framework7/dist/css/framework7.ios.colors.min.css')
        .pipe(gulp.dest('app/css/lib/', {}));
    gulp.src('libraries/framework7/dist/css/framework7.ios.min.css')
        .pipe(gulp.dest('app/css/lib/', {}));
});
// полная очистка продакшена
gulp.task('clean', function(callback) {
    del('dist');
    return cache.clearAll(callback);
});
// update библиотек фреймворка
gulp.task('update', function () {
    runSequence(['clean:lib', 'copyjs', 'copycss'], function(){ console.log('update libraries'); } )
});
// build готового проекта
gulp.task('build', function (cb){
    runSequence(['clean:dist', 'sass', 'useref', 'minify', 'images', 'fonts'],
        function(){ }
    );
});
// запуст рабочего проекта
gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
        function(){ console.log('default'); }
    )
});

// --------------------------------------------------------------------
// Error Handler
// --------------------------------------------------------------------

var onError = function (err) {
    console.log(err);
    this.emit('end');
};
