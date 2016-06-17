// vim: shiftwidth=2 tabstop=2
'use strict';
var white = 37,
  green = 32,
  red = 31,
  yellow = 33,
  blue = 34,
  purple = 35,
  teal = 36,
  whiteOnRed = 41;

var Base = require('mocha/lib/reporters/base');

function write(s) {
  process.stdout.write(s);
}

function writeColor(color, message) {
  write('\x1B[' + color + 'm' + message);
}

function resetConsoleColors() {
  write('\x1B[0m');
}

function writeSlash() {
  writeColor(white, ' / ');
}

var emptyLine = '                                ';
function clearLine() {
  resetConsoleColors();
  write('\r' + emptyLine + '\r');
}

var fieldWidth = 6;
function padOut(s) {
  s = String(s);
  while (s.length < fieldWidth) {
    if (s.length % 2) {
      s = s + ' ';
    } else {
      s = ' ' + s;
    }
  }
  return s;
}

function writeParts(first, second, third) {
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
  var prop;
  if (!otherOptions) {
    options = {};
  }
  for (prop in otherOptions) {
    if (otherOptions.hasOwnProperty(prop)) {
      options[prop] = otherOptions[prop];
    }
  }
}

function outputIgnoredFor(testName) {
  var ignores = options.suppressOutputFrom || [];
  return ignores.indexOf(testName) > -1;
}
function isNull(v) {
  return v === null;
}
function nullAsString() {
  return 'null';
}
function isUndefined(v) {
  return v === undefined;
}
function undefinedAsString() {
  return 'undefined';
}
function isArrayOrObject(v) {
  return Array.isArray(v) || typeof v === 'object';
}
function prettyJson(v) {
  return JSON.stringify(v, null, 2);
}
function fallback() {
  return true;
}
function passThrough(v) {
  return v;
}
function noop() { return undefined; }

var stringMaps = [
  { match: isNull, transform: nullAsString },
  { match: isUndefined, transform: undefinedAsString },
  { match: isArrayOrObject, transform: prettyJson },
  { match: fallback, transform: passThrough }
];

function asString(val) {
  var transform = stringMaps.reduce(function (acc, cur) {
    return acc || (cur.match(val) ? cur.transform : null);
  }, null);
  return transform(val);
}

function ProgressReporter(runner) {
  Base.call(this, runner);
  var
    passes = 0,
    failures = 0,
    current = null,
    haveDoneSomeLoggingBefore = false,
    alreadyDidTestNameForLog = false,
    total = runner.total,
    properLog = console.log,
    properError = console.error;

  var createTestAwareOutputter = function (withOutputColor) {
    return function () {
      var
        args = Array.prototype.slice.apply(arguments),
        output = args.map(asString).join(' ');

      if (current && !alreadyDidTestNameForLog) {
        alreadyDidTestNameForLog = true;
        clearLine();
        var header = ['"', current, '" says:'];
        if (haveDoneSomeLoggingBefore) {
          header.splice(0, 0, '\n');
        }
        haveDoneSomeLoggingBefore = true;
        writeColor(teal, header.join(''));
        resetConsoleColors();
      }
      writeColor(withOutputColor, '\n' + output);
    };
  };
  var testAwareLogger = createTestAwareOutputter(white);
  var testAwareError = createTestAwareOutputter(whiteOnRed);

  runner.on('start', function () {
    writeParts('pass', 'fail', 'total');
    write('\n');
    console.log = testAwareLogger;
  });

  runner.on('test', function (test) {
    current = test.title;
    alreadyDidTestNameForLog = false;
    console.log = outputIgnoredFor(test.title) ? noop : testAwareLogger;
    console.error = outputIgnoredFor(test.title) ? noop : testAwareError;
  });

  var writeNewlineIfLogged = function () {
    if (alreadyDidTestNameForLog) {
      write('\n');
    }
  };

  runner.on('pass', function () {
    passes += 1;
    writeNewlineIfLogged();
    printProgress(passes, failures, total);
  });

  runner.on('fail', function (test) {
    failures += 1;
    writeNewlineIfLogged();
    printFail(test);
    printProgress(passes, failures, total);
  });

  runner.on('end', function () {
    console.log = properLog;
    console.error = properError;
  });
  runner.on('end', this.epilogue.bind(this));
}

ProgressReporter.prototype.__proto__ = Base.prototype;
ProgressReporter.setOptions = function (newOptions) {
  extendOptionsWith(newOptions);
};

exports = module.exports = ProgressReporter;

