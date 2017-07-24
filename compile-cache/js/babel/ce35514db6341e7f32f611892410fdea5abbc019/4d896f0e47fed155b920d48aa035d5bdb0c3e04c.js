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

// Settings
var executablePath = undefined;
var errorReporting = undefined;

exports['default'] = {
  activate: function activate() {
    require('atom-package-deps').install('linter-php');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-php.executablePath', function (value) {
      executablePath = value;
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
        var filePath = textEditor.getPath();
        var fileText = textEditor.getText();

        var parameters = ['--syntax-check', '--define', 'display_errors=On', '--define', 'log_errors=Off'];
        if (errorReporting) {
          parameters.push('--define', 'error_reporting=E_ALL');
        }

        var execOptions = {
          stdin: fileText,
          ignoreExitCode: true
        };

        if (filePath !== null) {
          // Only specify a CWD if the file has been saved

          var _atom$project$relativizePath = atom.project.relativizePath(filePath);

          var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

          var projectPath = _atom$project$relativizePath2[0];

          execOptions.cwd = projectPath !== null ? projectPath : (0, _path.dirname)(filePath);
        }

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
            range: helpers.generateRange(textEditor, line),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXBocC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBR29DLE1BQU07OzBCQUNqQixhQUFhOztJQUExQixPQUFPOztvQkFDSyxNQUFNOzs7QUFMOUIsV0FBVyxDQUFDLEFBUVosSUFBTSxVQUFVLEdBQUcsNkRBQTZELENBQUM7OztBQUdqRixJQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLElBQUksY0FBYyxZQUFBLENBQUM7O3FCQUVKO0FBQ2IsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUVuRCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMxRCxvQkFBYyxHQUFHLEtBQUssQ0FBQztLQUN4QixDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMxRCxvQkFBYyxHQUFHLEtBQUssQ0FBQztLQUN4QixDQUFDLENBQ0gsQ0FBQztHQUNIOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDOUI7O0FBRUQsZUFBYSxFQUFBLHlCQUFHO0FBQ2QsV0FBTztBQUNMLFVBQUksRUFBRSxLQUFLO0FBQ1gsbUJBQWEsRUFBRSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUM7QUFDOUMsV0FBSyxFQUFFLE1BQU07QUFDYixlQUFTLEVBQUUsSUFBSTtBQUNmLFVBQUksb0JBQUUsV0FBTyxVQUFVLEVBQUs7QUFDMUIsWUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RDLFlBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFdEMsWUFBTSxVQUFVLEdBQUcsQ0FDakIsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFBRSxtQkFBbUIsRUFDL0IsVUFBVSxFQUFFLGdCQUFnQixDQUM3QixDQUFDO0FBQ0YsWUFBSSxjQUFjLEVBQUU7QUFDbEIsb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHVCQUF1QixDQUFDLENBQUM7U0FDdEQ7O0FBRUQsWUFBTSxXQUFXLEdBQUc7QUFDbEIsZUFBSyxFQUFFLFFBQVE7QUFDZix3QkFBYyxFQUFFLElBQUk7U0FDckIsQ0FBQzs7QUFFRixZQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Ozs2Q0FFQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7Ozs7Y0FBcEQsV0FBVzs7QUFDbEIscUJBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxLQUFLLElBQUksR0FBRyxXQUFXLEdBQUcsbUJBQVEsUUFBUSxDQUFDLENBQUM7U0FDMUU7O0FBRUQsWUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRTNFLFlBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTs7QUFFckMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFlBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEMsZUFBTyxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JCLGNBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxrQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLGdCQUFJLEVBQUUsT0FBTztBQUNiLG9CQUFRLEVBQVIsUUFBUTtBQUNSLGlCQUFLLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO0FBQzlDLGdCQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztXQUNmLENBQUMsQ0FBQztBQUNILGVBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2pDO0FBQ0QsZUFBTyxRQUFRLENBQUM7T0FDakIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXBocC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9uc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdhdG9tLWxpbnRlcic7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5cbi8vIExvY2FsIHZhcmlhYmxlc1xuY29uc3QgcGFyc2VSZWdleCA9IC9eKD86UGFyc2V8RmF0YWwpIGVycm9yOlxccysoLispIGluIC4rPyg/OiBvbiBsaW5lIHw6KShcXGQrKS9nbTtcblxuLy8gU2V0dGluZ3NcbmxldCBleGVjdXRhYmxlUGF0aDtcbmxldCBlcnJvclJlcG9ydGluZztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1waHAnKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1waHAuZXhlY3V0YWJsZVBhdGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgZXhlY3V0YWJsZVBhdGggPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1waHAuZXJyb3JSZXBvcnRpbmcnLCAodmFsdWUpID0+IHtcbiAgICAgICAgZXJyb3JSZXBvcnRpbmcgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdQSFAnLFxuICAgICAgZ3JhbW1hclNjb3BlczogWyd0ZXh0Lmh0bWwucGhwJywgJ3NvdXJjZS5waHAnXSxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCBmaWxlVGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbXG4gICAgICAgICAgJy0tc3ludGF4LWNoZWNrJyxcbiAgICAgICAgICAnLS1kZWZpbmUnLCAnZGlzcGxheV9lcnJvcnM9T24nLFxuICAgICAgICAgICctLWRlZmluZScsICdsb2dfZXJyb3JzPU9mZicsXG4gICAgICAgIF07XG4gICAgICAgIGlmIChlcnJvclJlcG9ydGluZykge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1kZWZpbmUnLCAnZXJyb3JfcmVwb3J0aW5nPUVfQUxMJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGRpbjogZmlsZVRleHQsXG4gICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGZpbGVQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gT25seSBzcGVjaWZ5IGEgQ1dEIGlmIHRoZSBmaWxlIGhhcyBiZWVuIHNhdmVkXG4gICAgICAgICAgY29uc3QgW3Byb2plY3RQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aCk7XG4gICAgICAgICAgZXhlY09wdGlvbnMuY3dkID0gcHJvamVjdFBhdGggIT09IG51bGwgPyBwcm9qZWN0UGF0aCA6IGRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgaGVscGVycy5leGVjKGV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCBleGVjT3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlVGV4dCkge1xuICAgICAgICAgIC8vIEVkaXRvciBjb250ZW50cyBoYXZlIGNoYW5nZWQsIGRvbid0IHVwZGF0ZSBtZXNzYWdlc1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgbGV0IG1hdGNoID0gcGFyc2VSZWdleC5leGVjKG91dHB1dCk7XG4gICAgICAgIHdoaWxlIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMl0sIDEwKSAtIDE7XG4gICAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZTogaGVscGVycy5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIGxpbmUpLFxuICAgICAgICAgICAgdGV4dDogbWF0Y2hbMV0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbWF0Y2ggPSBwYXJzZVJlZ2V4LmV4ZWMob3V0cHV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19