Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

var _atomLinter = require('atom-linter');

var helpers = _interopRequireWildcard(_atomLinter);

var _path = require('path');

// Local variables
'use babel';var parseRegex = /^(?:Parse|Fatal) error:\s+(.+) in .+?(?: on line |:)(\d+)/gm;
var phpCheckCache = new Map();

// Settings
var executablePath = undefined;
var errorReporting = undefined;

var testBin = _asyncToGenerator(function* () {
  if (phpCheckCache.has(executablePath)) {
    return;
  }
  var title = 'linter-php: Unable to determine PHP version';
  var message = 'Unable to determine the version of "' + executablePath + '", please verify that this is the right path to PHP. If you believe you ' + 'have fixed this problem please restart Atom.';

  var output = undefined;
  try {
    output = yield helpers.exec(executablePath, ['-v']);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    phpCheckCache.set(executablePath, false);
    atom.notifications.addError(title, { detail: message });
  }

  var regex = /PHP (\d+)\.(\d+)\.(\d+)/g;
  if (!regex.exec(output)) {
    phpCheckCache.set(executablePath, false);
    atom.notifications.addError(title, { detail: message });
  }
  phpCheckCache.set(executablePath, true);
});

exports['default'] = {
  activate: function activate() {
    require('atom-package-deps').install('linter-php');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-php.executablePath', function (value) {
      executablePath = value;
      testBin();
    }));
    this.subscriptions.add(atom.config.observe('linter-php.errorReporting', function (value) {
      errorReporting = value;
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    return {
      name: 'PHP',
      grammarScopes: ['text.html.php', 'source.php'],
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        if (!phpCheckCache.has(executablePath)) {
          yield testBin();
        }
        if (!phpCheckCache.get(executablePath)) {
          // We don't have a valid PHP version, don't update messages
          return null;
        }

        var filePath = textEditor.getPath();
        var fileText = textEditor.getText();

        var parameters = ['--syntax-check', '--define', 'display_errors=On', '--define', 'log_errors=Off'];
        if (errorReporting) {
          parameters.push('--define', 'error_reporting=E_ALL');
        }

        var _atom$project$relativizePath = atom.project.relativizePath(filePath);

        var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

        var projectPath = _atom$project$relativizePath2[0];

        var execOptions = {
          stdin: fileText,
          cwd: projectPath !== null ? projectPath : (0, _path.dirname)(filePath),
          ignoreExitCode: true
        };

        var output = yield helpers.exec(executablePath, parameters, execOptions);

        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, don't update messages
          return null;
        }

        var messages = [];
        var match = parseRegex.exec(output);
        while (match !== null) {
          var line = Number.parseInt(match[2], 10) - 1;
          messages.push({
            type: 'Error',
            filePath: filePath,
            range: helpers.rangeFromLineNumber(textEditor, line),
            text: match[1]
          });
          match = parseRegex.exec(output);
        }
        return messages;
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXBocC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBR29DLE1BQU07OzBCQUNqQixhQUFhOztJQUExQixPQUFPOztvQkFDSyxNQUFNOzs7QUFMOUIsV0FBVyxDQUFDLEFBUVosSUFBTSxVQUFVLEdBQUcsNkRBQTZELENBQUM7QUFDakYsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7O0FBR2hDLElBQUksY0FBYyxZQUFBLENBQUM7QUFDbkIsSUFBSSxjQUFjLFlBQUEsQ0FBQzs7QUFFbkIsSUFBTSxPQUFPLHFCQUFHLGFBQVk7QUFDMUIsTUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ3JDLFdBQU87R0FDUjtBQUNELE1BQU0sS0FBSyxHQUFHLDZDQUE2QyxDQUFDO0FBQzVELE1BQU0sT0FBTyxHQUFHLHlDQUF1QyxjQUFjLEdBQ25FLDBFQUEwRSxHQUMxRSw4Q0FBOEMsQ0FBQzs7QUFFakQsTUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLE1BQUk7QUFDRixVQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDckQsQ0FBQyxPQUFPLENBQUMsRUFBRTs7QUFFVixXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLGlCQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztHQUN6RDs7QUFFRCxNQUFNLEtBQUssR0FBRywwQkFBMEIsQ0FBQztBQUN6QyxNQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUN2Qixp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QUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxrQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLGdCQUFJLEVBQUUsT0FBTztBQUNiLG9CQUFRLEVBQVIsUUFBUTtBQUNSLGlCQUFLLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFDcEQsZ0JBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1dBQ2YsQ0FBQyxDQUFDO0FBQ0gsZUFBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakM7QUFDRCxlQUFPLFFBQVEsQ0FBQztPQUNqQixDQUFBO0tBQ0YsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcGhwL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJ2F0b20tbGludGVyJztcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJztcblxuLy8gTG9jYWwgdmFyaWFibGVzXG5jb25zdCBwYXJzZVJlZ2V4ID0gL14oPzpQYXJzZXxGYXRhbCkgZXJyb3I6XFxzKyguKykgaW4gLis/KD86IG9uIGxpbmUgfDopKFxcZCspL2dtO1xuY29uc3QgcGhwQ2hlY2tDYWNoZSA9IG5ldyBNYXAoKTtcblxuLy8gU2V0dGluZ3NcbmxldCBleGVjdXRhYmxlUGF0aDtcbmxldCBlcnJvclJlcG9ydGluZztcblxuY29uc3QgdGVzdEJpbiA9IGFzeW5jICgpID0+IHtcbiAgaWYgKHBocENoZWNrQ2FjaGUuaGFzKGV4ZWN1dGFibGVQYXRoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB0aXRsZSA9ICdsaW50ZXItcGhwOiBVbmFibGUgdG8gZGV0ZXJtaW5lIFBIUCB2ZXJzaW9uJztcbiAgY29uc3QgbWVzc2FnZSA9IGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSB2ZXJzaW9uIG9mIFwiJHtleGVjdXRhYmxlUGF0aH1gICtcbiAgICAnXCIsIHBsZWFzZSB2ZXJpZnkgdGhhdCB0aGlzIGlzIHRoZSByaWdodCBwYXRoIHRvIFBIUC4gSWYgeW91IGJlbGlldmUgeW91ICcgK1xuICAgICdoYXZlIGZpeGVkIHRoaXMgcHJvYmxlbSBwbGVhc2UgcmVzdGFydCBBdG9tLic7XG5cbiAgbGV0IG91dHB1dDtcbiAgdHJ5IHtcbiAgICBvdXRwdXQgPSBhd2FpdCBoZWxwZXJzLmV4ZWMoZXhlY3V0YWJsZVBhdGgsIFsnLXYnXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcGhwQ2hlY2tDYWNoZS5zZXQoZXhlY3V0YWJsZVBhdGgsIGZhbHNlKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IodGl0bGUsIHsgZGV0YWlsOiBtZXNzYWdlIH0pO1xuICB9XG5cbiAgY29uc3QgcmVnZXggPSAvUEhQIChcXGQrKVxcLihcXGQrKVxcLihcXGQrKS9nO1xuICBpZiAoIXJlZ2V4LmV4ZWMob3V0cHV0KSkge1xuICAgIHBocENoZWNrQ2FjaGUuc2V0KGV4ZWN1dGFibGVQYXRoLCBmYWxzZSk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHRpdGxlLCB7IGRldGFpbDogbWVzc2FnZSB9KTtcbiAgfVxuICBwaHBDaGVja0NhY2hlLnNldChleGVjdXRhYmxlUGF0aCwgdHJ1ZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLXBocCcpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXBocC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICBleGVjdXRhYmxlUGF0aCA9IHZhbHVlO1xuICAgICAgICB0ZXN0QmluKCk7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1waHAuZXJyb3JSZXBvcnRpbmcnLCAodmFsdWUpID0+IHtcbiAgICAgICAgZXJyb3JSZXBvcnRpbmcgPSB2YWx1ZTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ1BIUCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3RleHQuaHRtbC5waHAnLCAnc291cmNlLnBocCddLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGlmICghcGhwQ2hlY2tDYWNoZS5oYXMoZXhlY3V0YWJsZVBhdGgpKSB7XG4gICAgICAgICAgYXdhaXQgdGVzdEJpbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGhwQ2hlY2tDYWNoZS5nZXQoZXhlY3V0YWJsZVBhdGgpKSB7XG4gICAgICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIFBIUCB2ZXJzaW9uLCBkb24ndCB1cGRhdGUgbWVzc2FnZXNcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFtcbiAgICAgICAgICAnLS1zeW50YXgtY2hlY2snLFxuICAgICAgICAgICctLWRlZmluZScsICdkaXNwbGF5X2Vycm9ycz1PbicsXG4gICAgICAgICAgJy0tZGVmaW5lJywgJ2xvZ19lcnJvcnM9T2ZmJyxcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKGVycm9yUmVwb3J0aW5nKSB7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWRlZmluZScsICdlcnJvcl9yZXBvcnRpbmc9RV9BTEwnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFtwcm9qZWN0UGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGRpbjogZmlsZVRleHQsXG4gICAgICAgICAgY3dkOiBwcm9qZWN0UGF0aCAhPT0gbnVsbCA/IHByb2plY3RQYXRoIDogZGlybmFtZShmaWxlUGF0aCksXG4gICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgaGVscGVycy5leGVjKGV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCBleGVjT3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlVGV4dCkge1xuICAgICAgICAgIC8vIEVkaXRvciBjb250ZW50cyBoYXZlIGNoYW5nZWQsIGRvbid0IHVwZGF0ZSBtZXNzYWdlc1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgbGV0IG1hdGNoID0gcGFyc2VSZWdleC5leGVjKG91dHB1dCk7XG4gICAgICAgIHdoaWxlIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMl0sIDEwKSAtIDE7XG4gICAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZTogaGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIGxpbmUpLFxuICAgICAgICAgICAgdGV4dDogbWF0Y2hbMV0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbWF0Y2ggPSBwYXJzZVJlZ2V4LmV4ZWMob3V0cHV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/linter-php/lib/main.js
