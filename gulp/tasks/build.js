var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),

    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),

    browserify = require('browserify'),

    config = require('../config.json');

function getBundler(args){
    args = args || {};
    args.debug = true;
    args.standalone = config.namespace;
    args.fullPaths = false;

    return browserify(config.entryPoint, args);
}

function createBundle(bundler){
    bundler = bundler || getBundler();

    return bundler.bundle()
        .pipe(source(config.bundleName + config.devSuffix + '.js'))
        .pipe(gulp.dest(config.bundleDest))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename(config.bundleName + '.js'))
        .pipe(gulp.dest(config.bundleDest));
}

gulp.task('build', function(){
    return createBundle();
});

module.exports = {
    getBundler : getBundler,
    createBundle : createBundle
};