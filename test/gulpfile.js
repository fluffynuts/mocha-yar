"use strict";
const gulp = require("gulp"),
        mocha = require("gulp-mocha"),
        debug = require("gulp-debug");

const runTests = function(mask) {
    return gulp.src([ mask ])
                .pipe(debug())
                .pipe(mocha({
                    reporter: "../index.js",
                    reporterOptions: {
                        suppressOutputFrom: [
                            "should suppress console output for tests specified by title when calling setOptions",
                            "another test"
                        ].join("|"),
                        time: "total",
                        impatient: false
                    }
                })).on('error', function() {
                    this.emit('end');
                });
};


gulp.task('test-happy-once', function() {
    return runTests("happy-tests.spec.js");
});

gulp.task("test-mixed-once", () => {
    return runTests("mixed-examples.spec.js");
});

gulp.task("test-once", () => {
    return runTests("*.spec.js");
});

gulp.task('watch', gulp.parallel("test-once", function() {
    gulp.watch(["../index.js", "*.js"], gulp.series("test-once"));
}));


