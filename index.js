// vim: shiftwidth=2 tabstop=2
"use strict";
var white = 37,
  green = 32,
  red = 31,
  yellow = 33,
  // blue = 34,
  purple = 35,
  teal = 36,
  whiteOnRed = 41;

var Base = require("mocha/lib/reporters/base");

function write(s) {
  process.stdout.write(s);
}

function writeColor(color, message) {
  write("\x1B[" + color + "m" + message);
}

function resetConsoleColors() {
  write("\x1B[0m");
}

function writeSlash() {
  writeColor(white, " / ");
}

var emptyLine = "                                ";
function clearLine() {
  resetConsoleColors();
  write("\r" + emptyLine + "\r");
}

var fieldWidth = 6;
function padOut(s) {
  s = String(s);
  while (s.length < fieldWidth) {
    if (s.length % 2) {
      s = s + " ";
    } else {
      s = " " + s;
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

var options = {
  suppressOutputFrom: []
};
function printFail(test) {
  clearLine();
  writeColor(red, "\nFail: " + test.title + "\n");
  if (options.impatient) {
    try {
      write("\n");
      writeColor(purple, (test.err || {}).stack);
      write("\n");
    } catch (ignore) {
      // intentionally suppressed
    }
  }
}

function extendOptionsWith(otherOptions) {
  var prop, propVal, time = {}, parts;
  if (!otherOptions) {
    otherOptions = {};
  }
  for (prop in otherOptions) {
    if (Object.prototype.hasOwnProperty.call(otherOptions, prop)) {
      propVal = otherOptions[prop];
      if (prop === "suppressOutputFrom") {
        if (Array.isArray(propVal)) {
          options[prop] = propVal; // we got an array, which is expected
        } else if (typeof propVal === "string") {
          // could be configured via gulp-mocha, which doesn"t do a great
          // job with complex reporter options
          options[prop] = propVal.split("|");
        }
      } else if (prop === "time") {
        if (typeof propVal === "object") {
          // traditional configuration, with an object
          options[prop] = propVal;
        } else {
          // alternative config, as per cli or gulp-mocha
          parts = new Set(propVal.split(","));
          time.total = parts.has("total");
          time.test = parts.has("test");
          options[prop] = time;
        }
      } else if (prop === "impatient") {
        options[prop] = flag(propVal);
      } else {
        options[prop] = propVal;
      }
    }
  }

  options.suppressOutputFrom = options.suppressOutputFrom.map(o => new RegExp(o));
}

function outputIgnoredFor(testName) {
  return options.suppressOutputFrom.reduce(
    (acc, cur) => acc || testName.match(cur),
    false
  );
}

function isNull(v) {
  return v === null;
}
function nullAsString() {
  return "null";
}
function isUndefined(v) {
  return v === undefined;
}
function undefinedAsString() {
  return "undefined";
}
function isArrayOrObject(v) {
  return Array.isArray(v) || typeof v === "object";
}
function prettyJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (e) {
    return "[object]";
  }
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

function flag(val) {
  if (val === true) {
    return true;
  }
  if (!val) {
    return false;
  }
  switch (val.toString().toLowerCase()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
      return false;
  }
}

function shouldTime(label) {
  var setByOptions = options.time && options.time[label] !== undefined;
  if (setByOptions) {
    return flag(options.time[label]);
  }
  var envValue = process.env["TIME_" + (label || "").toUpperCase()];
  return flag(envValue);
}

function switchLoggerFor(funcToRun, tempLogger) {
  var before = console.log;
  try {
    console.log = tempLogger;
    funcToRun();
  } finally {
    console.log = before;
  }
}

function startTotalTimer() {
  if (shouldTime("total")) {
    console.time("total test time");
  }
}

function startTestTimer(label) {
  if (shouldTime("test")) {
    console.time(label);
  }
}

function endTestTimer(label, logFn) {
  if (shouldTime("test")) {
    switchLoggerFor(function() {
      console.timeEnd(label);
    }, logFn);
  }
}
function endTotalTimer(logFn) {
  if (shouldTime("total")) {
    switchLoggerFor(function() {
      console.timeEnd("total test time");
    }, logFn);
  }
}

function ProgressReporter(runner, opts) {
  if (opts && opts.reporterOptions) {
    extendOptionsWith(opts.reporterOptions);
  }
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
        output = args.map(asString).join(" ");

      if (current && !alreadyDidTestNameForLog) {
        alreadyDidTestNameForLog = true;
        clearLine();
        var header = ["\"", current, "\" says:"];
        if (haveDoneSomeLoggingBefore) {
          header.splice(0, 0, "\n");
        }
        haveDoneSomeLoggingBefore = true;
        writeColor(teal, header.join(""));
        resetConsoleColors();
      }
      writeColor(withOutputColor, "\n" + output);
      resetConsoleColors();
    };
  };
  var testAwareLogger = createTestAwareOutputter(white);
  var testAwareError = createTestAwareOutputter(whiteOnRed);

  runner.on("start", function () {
    startTotalTimer()
    writeParts("pass", "fail", "total");
    write("\n");
    console.log = testAwareLogger;
  });

  runner.on("test", function (test) {
    current = test.title;
    startTestTimer(test.title);
    alreadyDidTestNameForLog = false;
    console.log = outputIgnoredFor(test.title) ? noop : testAwareLogger;
    console.error = outputIgnoredFor(test.title) ? noop : testAwareError;
  });

  var writeNewlineIfLogged = function () {
    if (alreadyDidTestNameForLog) {
      write("\n");
    }
  };

  runner.on("pass", function (test) {
    passes += 1;
    writeNewlineIfLogged();
    printProgress(passes, failures, total);
    endTestTimer(test.title, properLog);
  });

  runner.on("fail", function (test) {
    failures += 1;
    writeNewlineIfLogged();
    printFail(test);
    printProgress(passes, failures, total);
    endTestTimer(test.title, properLog);
  });

  runner.on("end", function () {
    console.log = properLog;
    console.error = properError;
    endTotalTimer(properLog);
  });
  runner.on("end", this.epilogue.bind(this));
}
var proto = "__proto__";
ProgressReporter.prototype[proto] = Base.prototype;
ProgressReporter.setOptions = function (newOptions) {
  extendOptionsWith(newOptions);
};

module.exports = ProgressReporter;

