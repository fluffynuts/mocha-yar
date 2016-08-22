'use strict';
const gulp = require('gulp'),
        mocha = require('gulp-mocha'),
        runSequence = require('run-sequence'),
        del = require('del'),
        debug = require('gulp-debug'),
        ProgressReporter = require('../index.js');

ProgressReporter.setOptions({
    suppressOutputFrom: [
        'should suppress console output for tests specified by title when calling setOptions'
    ],
    time: {
      total: true,
      test: true
    },
    impatient: false
});

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
    const watcher = gulp.watch(['../index.js', 'js/**/*.js'], ['test-once']);
    watcher.on('change', function(ev) {
        console.log('-> ' + ev.type + ': ' + ev.path)
    })
});

gulp.task('test-once', function() {
    return runTests();
});

