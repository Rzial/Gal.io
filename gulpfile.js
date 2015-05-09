var gulp = require('gulp'),
    requireDir = require('require-dir'),

    config = require('./gulp/config.json');

var tasks = requireDir('./gulp/tasks');

gulp.task('default', config.defaultTask);