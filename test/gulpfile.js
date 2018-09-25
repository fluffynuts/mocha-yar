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


gulp.task('test-once', function() {
    return runTests();
});

gulp.task('watch', gulp.parallel("test-once", function() {
    gulp.watch(["../index.js", "js/**/*.js"], gulp.series("test-once"));
}));


