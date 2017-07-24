Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomLinter = require('atom-linter');

var helpers = _interopRequireWildcard(_atomLinter);

var _rangeHelpers = require('./rangeHelpers');

var _rangeHelpers2 = _interopRequireDefault(_rangeHelpers);

// Local variables
'use babel';var parseRegex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;

var extractRange = function extractRange(_ref) {
  var code = _ref.code;
  var message = _ref.message;
  var lineNumber = _ref.lineNumber;
  var colNumber = _ref.colNumber;
  var textEditor = _ref.textEditor;

  var result = undefined;
  var line = lineNumber - 1;
  switch (code) {
    case 'C901':
      result = _rangeHelpers2['default'].tooComplex(textEditor, message, line);
      break;
    case 'F401':
      result = _rangeHelpers2['default'].importedUnused(textEditor, message, line);
      break;
    case 'H201':
      // H201 - no 'except:' at least use 'except Exception:'

      // For some reason this rule marks the ":" as the location by default
      result = {
        line: line,
        col: colNumber - 7,
        endCol: colNumber
      };
      break;
    case 'H501':
      result = _rangeHelpers2['default'].noLocalsString(textEditor, line);
      break;
    case 'E999':
      // E999 - SyntaxError: unexpected EOF while parsing

      // Workaround for https://gitlab.com/pycqa/flake8/issues/237
      result = {
        line: line,
        col: colNumber - 2
      };
      break;
    default:
      result = {
        line: line,
        col: colNumber - 1
      };
      break;
  }

  if (Object.hasOwnProperty.call(result, 'endCol')) {
    return [[result.line, result.col], [result.line, result.endCol]];
  }

  var range = undefined;
  try {
    range = helpers.rangeFromLineNumber(textEditor, result.line, result.col);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('linter-flake8:: Invalid point encountered in the attached message', {
      code: code,
      message: message,
      requestedPoint: result
    });
    throw Error('linter-flake8:: Invalid point encountered! See console for details.');
  }

  return range;
};

var applySubstitutions = function applySubstitutions(givenExecPath, projDir) {
  var execPath = givenExecPath;
  var projectName = _path2['default'].basename(projDir);
  execPath = execPath.replace(/\$PROJECT_NAME/i, projectName);
  execPath = execPath.replace(/\$PROJECT/i, projDir);
  var paths = execPath.split(';');
  for (var i = 0; i < paths.length; i += 1) {
    if (_fsPlus2['default'].existsSync(paths[i])) {
      return paths[i];
    }
  }
  return execPath;
};

exports['default'] = {
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-flake8');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-flake8.disableTimeout', function (value) {
      _this.disableTimeout = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.projectConfigFile', function (value) {
      _this.projectConfigFile = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.maxLineLength', function (value) {
      _this.maxLineLength = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.ignoreErrorCodes', function (value) {
      _this.ignoreErrorCodes = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.maxComplexity', function (value) {
      _this.maxComplexity = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.selectErrors', function (value) {
      _this.selectErrors = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.hangClosing', function (value) {
      _this.hangClosing = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.executablePath', function (value) {
      _this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.pycodestyleErrorsToWarnings', function (value) {
      _this.pycodestyleErrorsToWarnings = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.flakeErrors', function (value) {
      _this.flakeErrors = value;
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Flake8',
      grammarScopes: ['source.python', 'source.python.django'],
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var filePath = textEditor.getPath();
        var fileText = textEditor.getText();

        var parameters = ['--format=default'];

        var projectPath = atom.project.relativizePath(filePath)[0];
        var baseDir = projectPath !== null ? projectPath : _path2['default'].dirname(filePath);
        var configFilePath = yield helpers.findCachedAsync(baseDir, _this2.projectConfigFile);

        if (_this2.projectConfigFile && baseDir !== null && configFilePath !== null) {
          parameters.push('--config', configFilePath);
        } else {
          if (_this2.maxLineLength) {
            parameters.push('--max-line-length', _this2.maxLineLength);
          }
          if (_this2.ignoreErrorCodes.length) {
            parameters.push('--ignore', _this2.ignoreErrorCodes.join(','));
          }
          if (_this2.maxComplexity) {
            parameters.push('--max-complexity', _this2.maxComplexity);
          }
          if (_this2.hangClosing) {
            parameters.push('--hang-closing');
          }
          if (_this2.selectErrors.length) {
            parameters.push('--select', _this2.selectErrors.join(','));
          }
        }

        parameters.push('-');

        var execPath = _fsPlus2['default'].normalize(applySubstitutions(_this2.executablePath, baseDir));
        var options = {
          stdin: fileText,
          cwd: _path2['default'].dirname(textEditor.getPath()),
          stream: 'both'
        };
        if (_this2.disableTimeout) {
          options.timeout = Infinity;
        }

        var result = yield helpers.exec(execPath, parameters, options);

        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        if (result.stderr && result.stderr.length && atom.inDevMode()) {
          // eslint-disable-next-line no-console
          console.log('flake8 stderr: ' + result.stderr);
        }
        var messages = [];

        var match = parseRegex.exec(result.stdout);
        while (match !== null) {
          var line = Number.parseInt(match[1], 10) || 0;
          var col = Number.parseInt(match[2], 10) || 0;
          var isErr = match[4] === 'E' && !_this2.pycodestyleErrorsToWarnings || match[4] === 'F' && _this2.flakeErrors;
          var range = extractRange({
            code: match[3],
            message: match[5],
            lineNumber: line,
            colNumber: col,
            textEditor: textEditor
          });

          messages.push({
            type: isErr ? 'Error' : 'Warning',
            text: match[3] + ' — ' + match[5],
            filePath: filePath,
            range: range
          });

          match = parseRegex.exec(result.stdout);
        }
        return messages;
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBR29DLE1BQU07O3NCQUMzQixTQUFTOzs7O29CQUNQLE1BQU07Ozs7MEJBQ0UsYUFBYTs7SUFBMUIsT0FBTzs7NEJBQ00sZ0JBQWdCOzs7OztBQVB6QyxXQUFXLENBQUMsQUFVWixJQUFNLFVBQVUsR0FBRyx3Q0FBd0MsQ0FBQzs7QUFFNUQsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksSUFBb0QsRUFBSztNQUF2RCxJQUFJLEdBQU4sSUFBb0QsQ0FBbEQsSUFBSTtNQUFFLE9BQU8sR0FBZixJQUFvRCxDQUE1QyxPQUFPO01BQUUsVUFBVSxHQUEzQixJQUFvRCxDQUFuQyxVQUFVO01BQUUsU0FBUyxHQUF0QyxJQUFvRCxDQUF2QixTQUFTO01BQUUsVUFBVSxHQUFsRCxJQUFvRCxDQUFaLFVBQVU7O0FBQ3RFLE1BQUksTUFBTSxZQUFBLENBQUM7QUFDWCxNQUFNLElBQUksR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLFVBQVEsSUFBSTtBQUNWLFNBQUssTUFBTTtBQUNULFlBQU0sR0FBRywwQkFBYSxVQUFVLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1RCxZQUFNO0FBQUEsQUFDUixTQUFLLE1BQU07QUFDVCxZQUFNLEdBQUcsMEJBQWEsY0FBYyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEUsWUFBTTtBQUFBLEFBQ1IsU0FBSyxNQUFNOzs7O0FBSVQsWUFBTSxHQUFHO0FBQ1AsWUFBSSxFQUFKLElBQUk7QUFDSixXQUFHLEVBQUUsU0FBUyxHQUFHLENBQUM7QUFDbEIsY0FBTSxFQUFFLFNBQVM7T0FDbEIsQ0FBQztBQUNGLFlBQU07QUFBQSxBQUNSLFNBQUssTUFBTTtBQUNULFlBQU0sR0FBRywwQkFBYSxj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UyxFQUFFLEdBQUc7QUFDZCxzQkFBVSxFQUFWLFVBQVU7V0FDWCxDQUFDLENBQUM7O0FBRUgsa0JBQVEsQ0FBQyxJQUFJLENBQUM7QUFDWixnQkFBSSxFQUFFLEtBQUssR0FBRyxPQUFPLEdBQUcsU0FBUztBQUNqQyxnQkFBSSxFQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQUU7QUFDakMsb0JBQVEsRUFBUixRQUFRO0FBQ1IsaUJBQUssRUFBTCxLQUFLO1dBQ04sQ0FBQyxDQUFDOztBQUVILGVBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4QztBQUNELGVBQU8sUUFBUSxDQUFDO09BQ2pCLENBQUE7S0FDRixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbGFrZTgvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdhdG9tLWxpbnRlcic7XG5pbXBvcnQgcmFuZ2VIZWxwZXJzIGZyb20gJy4vcmFuZ2VIZWxwZXJzJztcblxuLy8gTG9jYWwgdmFyaWFibGVzXG5jb25zdCBwYXJzZVJlZ2V4ID0gLyhcXGQrKTooXFxkKyk6XFxzKChbQS1aXSlcXGR7MiwzfSlcXHMrKC4qKS9nO1xuXG5jb25zdCBleHRyYWN0UmFuZ2UgPSAoeyBjb2RlLCBtZXNzYWdlLCBsaW5lTnVtYmVyLCBjb2xOdW1iZXIsIHRleHRFZGl0b3IgfSkgPT4ge1xuICBsZXQgcmVzdWx0O1xuICBjb25zdCBsaW5lID0gbGluZU51bWJlciAtIDE7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJ0M5MDEnOlxuICAgICAgcmVzdWx0ID0gcmFuZ2VIZWxwZXJzLnRvb0NvbXBsZXgodGV4dEVkaXRvciwgbWVzc2FnZSwgbGluZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdGNDAxJzpcbiAgICAgIHJlc3VsdCA9IHJhbmdlSGVscGVycy5pbXBvcnRlZFVudXNlZCh0ZXh0RWRpdG9yLCBtZXNzYWdlLCBsaW5lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0gyMDEnOlxuICAgICAgLy8gSDIwMSAtIG5vICdleGNlcHQ6JyBhdCBsZWFzdCB1c2UgJ2V4Y2VwdCBFeGNlcHRpb246J1xuXG4gICAgICAvLyBGb3Igc29tZSByZWFzb24gdGhpcyBydWxlIG1hcmtzIHRoZSBcIjpcIiBhcyB0aGUgbG9jYXRpb24gYnkgZGVmYXVsdFxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBsaW5lLFxuICAgICAgICBjb2w6IGNvbE51bWJlciAtIDcsXG4gICAgICAgIGVuZENvbDogY29sTnVtYmVyLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0g1MDEnOlxuICAgICAgcmVzdWx0ID0gcmFuZ2VIZWxwZXJzLm5vTG9jYWxzU3RyaW5nKHRleHRFZGl0b3IsIGxpbmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRTk5OSc6XG4gICAgICAvLyBFOTk5IC0gU3ludGF4RXJyb3I6IHVuZXhwZWN0ZWQgRU9GIHdoaWxlIHBhcnNpbmdcblxuICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRsYWIuY29tL3B5Y3FhL2ZsYWtlOC9pc3N1ZXMvMjM3XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGxpbmUsXG4gICAgICAgIGNvbDogY29sTnVtYmVyIC0gMixcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBsaW5lLFxuICAgICAgICBjb2w6IGNvbE51bWJlciAtIDEsXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0LCAnZW5kQ29sJykpIHtcbiAgICByZXR1cm4gW1xuICAgICAgW3Jlc3VsdC5saW5lLCByZXN1bHQuY29sXSxcbiAgICAgIFtyZXN1bHQubGluZSwgcmVzdWx0LmVuZENvbF0sXG4gICAgXTtcbiAgfVxuXG4gIGxldCByYW5nZTtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IGhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCByZXN1bHQubGluZSwgcmVzdWx0LmNvbCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAnbGludGVyLWZsYWtlODo6IEludmFsaWQgcG9pbnQgZW5jb3VudGVyZWQgaW4gdGhlIGF0dGFjaGVkIG1lc3NhZ2UnLFxuICAgICAge1xuICAgICAgICBjb2RlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICByZXF1ZXN0ZWRQb2ludDogcmVzdWx0LFxuICAgICAgfVxuICAgICk7XG4gICAgdGhyb3cgRXJyb3IoJ2xpbnRlci1mbGFrZTg6OiBJbnZhbGlkIHBvaW50IGVuY291bnRlcmVkISBTZWUgY29uc29sZSBmb3IgZGV0YWlscy4nKTtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn07XG5cbmNvbnN0IGFwcGx5U3Vic3RpdHV0aW9ucyA9IChnaXZlbkV4ZWNQYXRoLCBwcm9qRGlyKSA9PiB7XG4gIGxldCBleGVjUGF0aCA9IGdpdmVuRXhlY1BhdGg7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcGF0aC5iYXNlbmFtZShwcm9qRGlyKTtcbiAgZXhlY1BhdGggPSBleGVjUGF0aC5yZXBsYWNlKC9cXCRQUk9KRUNUX05BTUUvaSwgcHJvamVjdE5hbWUpO1xuICBleGVjUGF0aCA9IGV4ZWNQYXRoLnJlcGxhY2UoL1xcJFBST0pFQ1QvaSwgcHJvakRpcik7XG4gIGNvbnN0IHBhdGhzID0gZXhlY1BhdGguc3BsaXQoJzsnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGhzW2ldKSkge1xuICAgICAgcmV0dXJuIHBhdGhzW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXhlY1BhdGg7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWZsYWtlOCcpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5kaXNhYmxlVGltZW91dCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmRpc2FibGVUaW1lb3V0ID0gdmFsdWU7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHJvamVjdENvbmZpZ0ZpbGUnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnRmlsZSA9IHZhbHVlO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4Lm1heExpbmVMZW5ndGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5tYXhMaW5lTGVuZ3RoID0gdmFsdWU7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguaWdub3JlRXJyb3JDb2RlcycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZUVycm9yQ29kZXMgPSB2YWx1ZTtcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5tYXhDb21wbGV4aXR5JywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMubWF4Q29tcGxleGl0eSA9IHZhbHVlO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LnNlbGVjdEVycm9ycycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdEVycm9ycyA9IHZhbHVlO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmhhbmdDbG9zaW5nJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZ0Nsb3NpbmcgPSB2YWx1ZTtcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzID0gdmFsdWU7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguZmxha2VFcnJvcnMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5mbGFrZUVycm9ycyA9IHZhbHVlO1xuICAgICAgfSlcbiAgICApO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRmxha2U4JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLnB5dGhvbicsICdzb3VyY2UucHl0aG9uLmRqYW5nbyddLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnLS1mb3JtYXQ9ZGVmYXVsdCddO1xuXG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXTtcbiAgICAgICAgY29uc3QgYmFzZURpciA9IHByb2plY3RQYXRoICE9PSBudWxsID8gcHJvamVjdFBhdGggOiBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGF3YWl0IGhlbHBlcnMuZmluZENhY2hlZEFzeW5jKGJhc2VEaXIsIHRoaXMucHJvamVjdENvbmZpZ0ZpbGUpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb2plY3RDb25maWdGaWxlICYmIGJhc2VEaXIgIT09IG51bGwgJiYgY29uZmlnRmlsZVBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tY29uZmlnJywgY29uZmlnRmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLm1heExpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1tYXgtbGluZS1sZW5ndGgnLCB0aGlzLm1heExpbmVMZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5pZ25vcmVFcnJvckNvZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWlnbm9yZScsIHRoaXMuaWdub3JlRXJyb3JDb2Rlcy5qb2luKCcsJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5tYXhDb21wbGV4aXR5KSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tbWF4LWNvbXBsZXhpdHknLCB0aGlzLm1heENvbXBsZXhpdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5oYW5nQ2xvc2luZykge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWhhbmctY2xvc2luZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tc2VsZWN0JywgdGhpcy5zZWxlY3RFcnJvcnMuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKTtcblxuICAgICAgICBjb25zdCBleGVjUGF0aCA9IGZzLm5vcm1hbGl6ZShhcHBseVN1YnN0aXR1dGlvbnModGhpcy5leGVjdXRhYmxlUGF0aCwgYmFzZURpcikpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIHN0ZGluOiBmaWxlVGV4dCxcbiAgICAgICAgICBjd2Q6IHBhdGguZGlybmFtZSh0ZXh0RWRpdG9yLmdldFBhdGgoKSksXG4gICAgICAgICAgc3RyZWFtOiAnYm90aCcsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVUaW1lb3V0KSB7XG4gICAgICAgICAgb3B0aW9ucy50aW1lb3V0ID0gSW5maW5pdHk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoZWxwZXJzLmV4ZWMoZXhlY1BhdGgsIHBhcmFtZXRlcnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gZmlsZVRleHQpIHtcbiAgICAgICAgICAvLyBFZGl0b3IgY29udGVudHMgaGF2ZSBjaGFuZ2VkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LnN0ZGVyciAmJiByZXN1bHQuc3RkZXJyLmxlbmd0aCAmJiBhdG9tLmluRGV2TW9kZSgpKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZmxha2U4IHN0ZGVycjogJHtyZXN1bHQuc3RkZXJyfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgbGV0IG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdC5zdGRvdXQpO1xuICAgICAgICB3aGlsZSAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBsaW5lID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzFdLCAxMCkgfHwgMDtcbiAgICAgICAgICBjb25zdCBjb2wgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMl0sIDEwKSB8fCAwO1xuICAgICAgICAgIGNvbnN0IGlzRXJyID0gKG1hdGNoWzRdID09PSAnRScgJiYgIXRoaXMucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzKVxuICAgICAgICAgICAgfHwgKG1hdGNoWzRdID09PSAnRicgJiYgdGhpcy5mbGFrZUVycm9ycyk7XG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBleHRyYWN0UmFuZ2Uoe1xuICAgICAgICAgICAgY29kZTogbWF0Y2hbM10sXG4gICAgICAgICAgICBtZXNzYWdlOiBtYXRjaFs1XSxcbiAgICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgICAgICAgICBjb2xOdW1iZXI6IGNvbCxcbiAgICAgICAgICAgIHRleHRFZGl0b3IsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IGlzRXJyID8gJ0Vycm9yJyA6ICdXYXJuaW5nJyxcbiAgICAgICAgICAgIHRleHQ6IGAke21hdGNoWzNdfSDigJQgJHttYXRjaFs1XX1gLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdC5zdGRvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.js
