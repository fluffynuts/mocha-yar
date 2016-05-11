'use strict';
const gulp = require('gulp'),
        mocha = require('gulp-mocha'),
        runSequence = require('run-sequence'),
        del = require('del'),
        debug = require('gulp-debug'),
        ProgressReporter = require('../index.js');

const runTests = function() {
    return gulp.src(['js/**/*.spec.js'])
                .pipe(debug())
                .pipe(mocha({
                    reporter: ProgressReporter
                })).on('error', function() {
                    this.emit('end');
                });
};


gulp.task('watch', ['test-once'], function() {
    const watcher = gulp.watch(['js/**/*.ts'], ['test-once']);
    watcher.on('change', function(ev) {
        console.log('-> ' + ev.type + ': ' + ev.path)
    })
});

gulp.task('test-once', function() {
    return runTests();
});

