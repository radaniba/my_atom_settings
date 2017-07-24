Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

'use babel';

var iconHTML = '<img src=\'' + __dirname + '/../static/logo.svg\' style=\'width: 100%;\'>';

var regexes = {
  // pretty dodgy, adapted from http://stackoverflow.com/a/8396658
  r: /([^\d\W]|[.])[\w.$]*$/,

  // adapted from http://stackoverflow.com/q/5474008
  python: /([^\d\W]|[\u00A0-\uFFFF])[\w.\u00A0-\uFFFF]*$/,

  // adapted from http://php.net/manual/en/language.variables.basics.php
  php: /[$a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/
};

exports['default'] = function (kernelManager) {
  var autocompleteProvider = {
    selector: '.source',
    disableForSelector: '.comment, .string',

    // `excludeLowerPriority: false` won't suppress providers with lower
    // priority.
    // The default provider has a priority of 0.
    inclusionPriority: 1,
    excludeLowerPriority: false,

    // Required: Return a promise, an array of suggestions, or null.
    getSuggestions: function getSuggestions(_ref) {
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      var grammar = editor.getGrammar();
      var language = kernelManager.getLanguageFor(grammar);
      var kernel = kernelManager.getRunningKernelFor(language);

      if (!kernel || kernel.executionState !== 'idle') {
        return null;
      }

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);

      // Support none default grammars like magicpython
      var languageMappings = _config2['default'].getJson('languageMappings');
      var mappedLanguage = _lodash2['default'].findKey(languageMappings, function (l) {
        return l === language;
      });

      var regex = regexes[language] || regexes[mappedLanguage];
      if (regex) {
        prefix = _lodash2['default'].head(line.match(regex)) || '';
      } else {
        prefix = line;
      }

      // return if cursor is at whitespace
      if (prefix.trimRight().length < prefix.length) {
        return null;
      }

      if (prefix.trim().length < 3) {
        return null;
      }

      (0, _log2['default'])('autocompleteProvider: request:', line, bufferPosition, prefix);

      return new Promise(function (resolve) {
        return kernel.complete(prefix, function (_ref2) {
          var matches = _ref2.matches;
          var cursor_start = _ref2.cursor_start;
          var cursor_end = _ref2.cursor_end;

          var replacementPrefix = prefix.slice(cursor_start, cursor_end);

          matches = _lodash2['default'].map(matches, function (match) {
            return {
              text: match,
              replacementPrefix: replacementPrefix,
              iconHTML: iconHTML
            };
          });

          return resolve(matches);
        });
      });
    }
  };

  return autocompleteProvider;
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7c0JBRWMsUUFBUTs7OzttQkFDTixPQUFPOzs7O3NCQUNKLFVBQVU7Ozs7QUFKN0IsV0FBVyxDQUFDOztBQU1aLElBQU0sUUFBUSxtQkFBZ0IsU0FBUyxrREFBNEMsQ0FBQzs7QUFFcEYsSUFBTSxPQUFPLEdBQUc7O0FBRWQsR0FBQyxFQUFFLHVCQUF1Qjs7O0FBRzFCLFFBQU0sRUFBRSwrQ0FBK0M7OztBQUd2RCxLQUFHLEVBQUUsNENBQTRDO0NBQ2xELENBQUM7O3FCQUdhLFVBQVUsYUFBYSxFQUFFO0FBQ3RDLE1BQU0sb0JBQW9CLEdBQUc7QUFDM0IsWUFBUSxFQUFFLFNBQVM7QUFDbkIsc0JBQWtCLEVBQUUsbUJBQW1COzs7OztBQUt2QyxxQkFBaUIsRUFBRSxDQUFDO0FBQ3BCLHdCQUFvQixFQUFFLEtBQUs7OztBQUczQixrQkFBYyxFQUFBLHdCQUFDLElBQWtDLEVBQUU7VUFBbEMsTUFBTSxHQUFSLElBQWtDLENBQWhDLE1BQU07VUFBRSxjQUFjLEdBQXhCLElBQWtDLENBQXhCLGNBQWM7VUFBRSxNQUFNLEdBQWhDLElBQWtDLENBQVIsTUFBTTs7QUFDN0MsVUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLFVBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkQsVUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUzRCxVQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEtBQUssTUFBTSxFQUFFO0FBQy9DLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUNqQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZCLGNBQWMsQ0FDZixDQUFDLENBQUM7OztBQUdILFVBQU0sZ0JBQWdCLEdBQUcsb0JBQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDNUQsVUFBTSxjQUFjLEdBQUcsb0JBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQUEsQ0FBQztlQUFJLENBQUMsS0FBSyxRQUFRO09BQUEsQ0FBQyxDQUFDOztBQUV4RSxVQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNELFVBQUksS0FBSyxFQUFFO0FBQ1QsY0FBTSxHQUFHLG9CQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO09BQzFDLE1BQU07QUFDTCxjQUFNLEdBQUcsSUFBSSxDQUFDO09BQ2Y7OztBQUdELFVBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzdDLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUM1QixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELDRCQUFJLGdDQUFnQyxFQUNsQyxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVoQyxhQUFPLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTztlQUN4QixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQXFDLEVBQUs7Y0FBeEMsT0FBTyxHQUFULEtBQXFDLENBQW5DLE9BQU87Y0FBRSxZQUFZLEdBQXZCLEtBQXFDLENBQTFCLFlBQVk7Y0FBRSxVQUFVLEdBQW5DLEtBQXFDLENBQVosVUFBVTs7QUFDMUQsY0FBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFakUsaUJBQU8sR0FBRyxvQkFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQUEsS0FBSzttQkFDM0I7QUFDQyxrQkFBSSxFQUFFLEtBQUs7QUFDWCwrQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLHNCQUFRLEVBQVIsUUFBUTthQUNUO1dBQUMsQ0FDSCxDQUFDOztBQUVGLGlCQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN6QixDQUFDO09BQUEsQ0FDSCxDQUFDO0tBQ0g7R0FDRixDQUFDOztBQUVGLFNBQU8sb0JBQW9CLENBQUM7Q0FDN0IiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5jb25zdCBpY29uSFRNTCA9IGA8aW1nIHNyYz0nJHtfX2Rpcm5hbWV9Ly4uL3N0YXRpYy9sb2dvLnN2Zycgc3R5bGU9J3dpZHRoOiAxMDAlOyc+YDtcblxuY29uc3QgcmVnZXhlcyA9IHtcbiAgLy8gcHJldHR5IGRvZGd5LCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODM5NjY1OFxuICByOiAvKFteXFxkXFxXXXxbLl0pW1xcdy4kXSokLyxcblxuICAvLyBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3EvNTQ3NDAwOFxuICBweXRob246IC8oW15cXGRcXFddfFtcXHUwMEEwLVxcdUZGRkZdKVtcXHcuXFx1MDBBMC1cXHVGRkZGXSokLyxcblxuICAvLyBhZGFwdGVkIGZyb20gaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2xhbmd1YWdlLnZhcmlhYmxlcy5iYXNpY3MucGhwXG4gIHBocDogL1skYS16QS1aX1xceDdmLVxceGZmXVthLXpBLVowLTlfXFx4N2YtXFx4ZmZdKiQvLFxufTtcblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoa2VybmVsTWFuYWdlcikge1xuICBjb25zdCBhdXRvY29tcGxldGVQcm92aWRlciA9IHtcbiAgICBzZWxlY3RvcjogJy5zb3VyY2UnLFxuICAgIGRpc2FibGVGb3JTZWxlY3RvcjogJy5jb21tZW50LCAuc3RyaW5nJyxcblxuICAgIC8vIGBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2VgIHdvbid0IHN1cHByZXNzIHByb3ZpZGVycyB3aXRoIGxvd2VyXG4gICAgLy8gcHJpb3JpdHkuXG4gICAgLy8gVGhlIGRlZmF1bHQgcHJvdmlkZXIgaGFzIGEgcHJpb3JpdHkgb2YgMC5cbiAgICBpbmNsdXNpb25Qcmlvcml0eTogMSxcbiAgICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2UsXG5cbiAgICAvLyBSZXF1aXJlZDogUmV0dXJuIGEgcHJvbWlzZSwgYW4gYXJyYXkgb2Ygc3VnZ2VzdGlvbnMsIG9yIG51bGwuXG4gICAgZ2V0U3VnZ2VzdGlvbnMoeyBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBwcmVmaXggfSkge1xuICAgICAgY29uc3QgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgICBjb25zdCBsYW5ndWFnZSA9IGtlcm5lbE1hbmFnZXIuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG4gICAgICBjb25zdCBrZXJuZWwgPSBrZXJuZWxNYW5hZ2VyLmdldFJ1bm5pbmdLZXJuZWxGb3IobGFuZ3VhZ2UpO1xuXG4gICAgICBpZiAoIWtlcm5lbCB8fCBrZXJuZWwuZXhlY3V0aW9uU3RhdGUgIT09ICdpZGxlJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbXG4gICAgICAgIFtidWZmZXJQb3NpdGlvbi5yb3csIDBdLFxuICAgICAgICBidWZmZXJQb3NpdGlvbixcbiAgICAgIF0pO1xuXG4gICAgICAvLyBTdXBwb3J0IG5vbmUgZGVmYXVsdCBncmFtbWFycyBsaWtlIG1hZ2ljcHl0aG9uXG4gICAgICBjb25zdCBsYW5ndWFnZU1hcHBpbmdzID0gQ29uZmlnLmdldEpzb24oJ2xhbmd1YWdlTWFwcGluZ3MnKTtcbiAgICAgIGNvbnN0IG1hcHBlZExhbmd1YWdlID0gXy5maW5kS2V5KGxhbmd1YWdlTWFwcGluZ3MsIGwgPT4gbCA9PT0gbGFuZ3VhZ2UpO1xuXG4gICAgICBjb25zdCByZWdleCA9IHJlZ2V4ZXNbbGFuZ3VhZ2VdIHx8IHJlZ2V4ZXNbbWFwcGVkTGFuZ3VhZ2VdO1xuICAgICAgaWYgKHJlZ2V4KSB7XG4gICAgICAgIHByZWZpeCA9IF8uaGVhZChsaW5lLm1hdGNoKHJlZ2V4KSkgfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmVmaXggPSBsaW5lO1xuICAgICAgfVxuXG4gICAgICAvLyByZXR1cm4gaWYgY3Vyc29yIGlzIGF0IHdoaXRlc3BhY2VcbiAgICAgIGlmIChwcmVmaXgudHJpbVJpZ2h0KCkubGVuZ3RoIDwgcHJlZml4Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHByZWZpeC50cmltKCkubGVuZ3RoIDwgMykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgbG9nKCdhdXRvY29tcGxldGVQcm92aWRlcjogcmVxdWVzdDonLFxuICAgICAgICBsaW5lLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4KTtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT5cbiAgICAgICAga2VybmVsLmNvbXBsZXRlKHByZWZpeCwgKHsgbWF0Y2hlcywgY3Vyc29yX3N0YXJ0LCBjdXJzb3JfZW5kIH0pID0+IHtcbiAgICAgICAgICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IHByZWZpeC5zbGljZShjdXJzb3Jfc3RhcnQsIGN1cnNvcl9lbmQpO1xuXG4gICAgICAgICAgbWF0Y2hlcyA9IF8ubWFwKG1hdGNoZXMsIG1hdGNoID0+XG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICB0ZXh0OiBtYXRjaCxcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICAgICAgICAgIGljb25IVE1MLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIHJldHVybiByZXNvbHZlKG1hdGNoZXMpO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gYXV0b2NvbXBsZXRlUHJvdmlkZXI7XG59XG4iXX0=