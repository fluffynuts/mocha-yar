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

var options = {};
function extendOptionsWith(otherOptions) {
  if (!otherOptions) {
    options = {};
  }
  for (var prop in otherOptions) {
    if (otherOptions.hasOwnProperty(prop)) {
        options[prop] = otherOptions[prop];
    }
  }
}

function outputIgnoredFor(testName) {
  var ignores = options.suppressOutputFrom || [];
  return ignores.indexOf(testName) > -1;
}

function ProgressReporter(runner) {
  Base.call(this, runner);
  var passes = 0,
      failures = 0,
      current = null,
      alreadyDidTestNameForLog = false;
  var total = runner.total;
  var properLog = console.log;

  var testAwareLogger = function(s) {
    if (typeof s === 'object') {
      s = JSON.stringify(s);
    }
    if (current && !alreadyDidTestNameForLog) {
      alreadyDidTestNameForLog = true;
      clearLine();
      write('"' + current + '" says:');
    }
    write('\n' + s);
  };
  var noop = function() {};

  runner.on('start', function() {
    writeParts('pass', 'fail', 'total');
    write('\n');
    console.log = testAwareLogger;
  });

  runner.on('test', function(test) {
    current = test.title;
    alreadyDidTestNameForLog = false;
    console.log = outputIgnoredFor(test.title) ? noop : testAwareLogger;
  });

  var writeNewlineIfLogged = function() {
    if (alreadyDidTestNameForLog) {
      write('\n');
    }
  };

  runner.on('pass', function(test) {
    passes++;
    writeNewlineIfLogged();
    printProgress(passes, failures, total);
  });

  runner.on('fail', function(test) {
    failures++;
    writeNewlineIfLogged();
    printFail(test);
    printProgress(passes, failures, total);
  });

  runner.on('end', function() {
    console.log = properLog;
  });
  runner.on('end', this.epilogue.bind(this));
}

ProgressReporter.prototype.__proto__ = Base.prototype
ProgressReporter.setOptions = function(newOptions) {
  extendOptionsWith(newOptions);
};

exports = module.exports = ProgressReporter;

