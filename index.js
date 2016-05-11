// vim: shiftwidth=2 tabstop=2
'use strict';
var white = 37,
        green = 32,
        red = 31,
        yellow = 33;

var Base = require('mocha/lib/reporters/base');

function write (s) {
  process.stdout.write(s);
};

function writeColor (color, message) {
  write('\x1B[' + color + 'm' + message);
}

function resetConsoleColors () {
  write('\x1B[0m');
};

function writeSlash() {
  writeColor(white, ' / ');
}

var emptyLine = '                                ';
function clearLine () {
  resetConsoleColors();
  write('\r' + emptyLine + '\r');
}

var fieldWidth = 6;
function padOut(s) {
  s = s + '';
  while (s.length < fieldWidth) {
    if (s.length % 2) {
      s = s + ' ';
    } else {
      s = ' ' + s;
    }
  }
  return s;
}

function writeParts (first, second, third) {
  first = padOut(first);
  second = padOut(second);
  third = padOut(third);
  clearLine();
  writeColor(green, first);
  writeSlash();
  writeColor(red, second);
  writeSlash();
  writeColor(yellow, third);
  resetConsoleColors();
}

function printProgress(passes, failures, total) {
    writeParts(passes, failures, total);
}

function printFail(test) {
  clearLine();
  writeColor(red, '\nFail: ' + test.title + '\n');
}

function ProgressReporter(runner) {
  Base.call(this, runner);
  let passes = 0,
      failures = 0,
      current = null;
  var total = runner.total;
  var properLog = console.log;
  runner.on('start', function() {
    writeParts('pass', 'fail', 'total');
    write('\n');
    console.log = function(s) {
      if (typeof s === 'object') {
        s = JSON.stringify(s);
      }
      if (current) {
        clearLine();
        write('Console output from test "' + current + '":\n');
      }
      write('\n' + s + '\n');
    };
  });

  runner.on('test', function(test) {
    current = test.title;
  });

  runner.on('pass', function(test) {
    passes++;
    printProgress(passes, failures, total);
  });

  runner.on('fail', function(test) {
    failures++;
    printFail(test);
    printProgress(passes, failures, total);
  });

  runner.on('end', function() {
    console.log = properLog;
  });
  runner.on('end', this.epilogue.bind(this));
}

ProgressReporter.prototype.__proto__ = Base.prototype

exports = module.exports = ProgressReporter;

