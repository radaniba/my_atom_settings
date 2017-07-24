Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jscsLibCliConfig = require('jscs/lib/cli-config');

var _jscsLibCliConfig2 = _interopRequireDefault(_jscsLibCliConfig);

var _globule = require('globule');

var _globule2 = _interopRequireDefault(_globule);

'use babel';

var grammarScopes = ['source.js', 'source.js.jsx'];

var LinterJSCS = (function () {
  function LinterJSCS() {
    _classCallCheck(this, LinterJSCS);
  }

  _createClass(LinterJSCS, null, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      // Install dependencies using atom-package-deps
      require('atom-package-deps').install();

      this.observer = atom.workspace.observeTextEditors(function (editor) {
        editor.getBuffer().onDidSave(function () {

          if (grammarScopes.indexOf(editor.getGrammar().scopeName) !== -1 || _this.testFixOnSave) {

            // Exclude `excludeFiles` for fix on save
            var _config = _this.getConfig(editor.getPath());
            var exclude = _globule2['default'].isMatch(_config && _config.excludeFiles, _this.getFilePath(editor.getPath()));

            if (_this.fixOnSave && !exclude || _this.testFixOnSave) {
              console.log('FIXING');
              _this.fixString(editor);
            }
          }
        });
      });
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.observer.dispose();
    }
  }, {
    key: 'provideLinter',
    value: function provideLinter() {
      var _this2 = this;

      var helpers = require('atom-linter');
      return {
        name: 'JSCS',
        grammarScopes: grammarScopes,
        scope: 'file',
        lintOnFly: true,
        lint: function lint(editor, opts, overrideOptions, testFixOnSave) {
          var JSCS = require('jscs');

          _this2.testFixOnSave = testFixOnSave;

          // We need re-initialize JSCS before every lint
          // or it will looses the errors, didn't trace the error
          // must be something with new 2.0.0 JSCS
          _this2.jscs = new JSCS();
          _this2.jscs.registerDefaultRules();

          var filePath = editor.getPath();
          var config = _this2.getConfig(filePath);

          // Options passed to `jscs` from package configuration
          var options = { esnext: _this2.esnext, preset: _this2.preset };

          _this2.jscs.configure(overrideOptions || Object.assign({}, options, config));

          // We don't have a config file present in project directory
          // let's return an empty array of errors
          if (!config && _this2.onlyConfig) return Promise.resolve([]);

          var text = editor.getText();
          var errors = _this2.jscs.checkString(text, filePath).getErrorList();

          // Exclude `excludeFiles` for errors
          var exclude = _globule2['default'].isMatch(config && config.excludeFiles, _this2.getFilePath(editor.getPath()));
          if (exclude) return Promise.resolve([]);

          return Promise.resolve(errors.map(function (_ref) {
            var rule = _ref.rule;
            var message = _ref.message;
            var line = _ref.line;
            var column = _ref.column;

            var type = _this2.displayAs;
            var html = '<span class=\'badge badge-flexible\'>' + rule + '</span> ' + message;

            // Work around a bug in jscs causing it to report columns past the end of the line
            var maxCol = editor.getBuffer().lineLengthForRow(line - 1);
            if (column - 1 > maxCol) {
              column = maxCol + 1;
            }

            var range = helpers.rangeFromLineNumber(editor, line - 1, column - 1);

            return { type: type, html: html, filePath: filePath, range: range };
          }));
        }
      };
    }
  }, {
    key: 'getFilePath',
    value: function getFilePath(path) {
      var relative = atom.project.relativizePath(path);
      return relative[1];
    }
  }, {
    key: 'getConfig',
    value: function getConfig(filePath) {
      if (_path2['default'].isAbsolute(this.configPath)) {
        return _jscsLibCliConfig2['default'].load(false, this.configPath);
      }

      return _jscsLibCliConfig2['default'].load(false, _path2['default'].join(_path2['default'].dirname(filePath), this.configPath));
    }
  }, {
    key: 'fixString',
    value: function fixString(editor) {
      var editorPath = editor.getPath();
      var editorText = editor.getText();

      var config = this.getConfig(editorPath);
      if (!config && this.onlyConfig) {
        return;
      }

      var fixedText = this.jscs.fixString(editorText, editorPath).output;
      if (editorText === fixedText) {
        return;
      }

      var cursorPosition = editor.getCursorScreenPosition();
      editor.setText(fixedText);
      editor.setCursorScreenPosition(cursorPosition);
    }
  }, {
    key: 'config',
    value: {
      preset: {
        title: 'Preset',
        description: 'Preset option is ignored if a config file is found for the linter.',
        type: 'string',
        'default': 'airbnb',
        'enum': ['airbnb', 'crockford', 'google', 'grunt', 'idiomatic', 'jquery', 'mdcs', 'node-style-guide', 'wikimedia', 'wordpress', 'yandex']
      },
      esnext: {
        description: 'Attempts to parse your code as ES6+, JSX, and Flow using the babel-jscs package as the parser.',
        type: 'boolean',
        'default': false
      },
      onlyConfig: {
        title: 'Only Config',
        description: 'Disable linter if there is no config file found for the linter.',
        type: 'boolean',
        'default': false
      },
      fixOnSave: {
        title: 'Fix on save',
        description: 'Fix JavaScript on save',
        type: 'boolean',
        'default': false
      },
      displayAs: {
        title: 'Display errors as',
        type: 'string',
        'default': 'error',
        'enum': ['error', 'warning', 'jscs Warning', 'jscs Error']
      },
      configPath: {
        title: 'Config file path (Absolute or relative path to your project)',
        type: 'string',
        'default': ''
      }
    },
    enumerable: true
  }, {
    key: 'preset',
    get: function get() {
      return atom.config.get('linter-jscs.preset');
    }
  }, {
    key: 'esnext',
    get: function get() {
      return atom.config.get('linter-jscs.esnext');
    }
  }, {
    key: 'onlyConfig',
    get: function get() {
      return atom.config.get('linter-jscs.onlyConfig');
    }
  }, {
    key: 'fixOnSave',
    get: function get() {
      return atom.config.get('linter-jscs.fixOnSave');
    }
  }, {
    key: 'displayAs',
    get: function get() {
      return atom.config.get('linter-jscs.displayAs');
    }
  }, {
    key: 'configPath',
    get: function get() {
      return atom.config.get('linter-jscs.configPath');
    }
  }]);

  return LinterJSCS;
})();

exports['default'] = LinterJSCS;
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9teV9ub2RlanNfYXBwcy9saW50ZXItanNjcy9zcmMvbGludGVyLWpzY3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztnQ0FDQSxxQkFBcUI7Ozs7dUJBQ3hCLFNBQVM7Ozs7QUFKN0IsV0FBVyxDQUFDOztBQU1aLElBQU0sYUFBYSxHQUFHLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDOztJQUVoQyxVQUFVO1dBQVYsVUFBVTswQkFBVixVQUFVOzs7ZUFBVixVQUFVOztXQWdFZCxvQkFBRzs7OztBQUVoQixhQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQzVELGNBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBTTs7QUFFakMsY0FBSSxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFLLGFBQWEsRUFBRTs7O0FBR3JGLGdCQUFNLE9BQU0sR0FBRyxNQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoRCxnQkFBSSxPQUFPLEdBQUcscUJBQVEsT0FBTyxDQUFDLE9BQU0sSUFBSSxPQUFNLENBQUMsWUFBWSxFQUFFLE1BQUssV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWpHLGdCQUFJLEFBQUMsTUFBSyxTQUFTLElBQUksQ0FBQyxPQUFPLElBQUssTUFBSyxhQUFhLEVBQUU7QUFDdEQscUJBQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEIsb0JBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hCO1dBQ0Y7U0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRWdCLHNCQUFHO0FBQ2xCLFVBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDekI7OztXQUVtQix5QkFBRzs7O0FBQ3JCLFVBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2QyxhQUFPO0FBQ0wsWUFBSSxFQUFFLE1BQU07QUFDWixxQkFBYSxFQUFiLGFBQWE7QUFDYixhQUFLLEVBQUUsTUFBTTtBQUNiLGlCQUFTLEVBQUUsSUFBSTtBQUNmLFlBQUksRUFBRSxjQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBSztBQUN0RCxjQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdCLGlCQUFLLGFBQWEsR0FBRyxhQUFhLENBQUM7Ozs7O0FBS25DLGlCQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3ZCLGlCQUFLLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDOztBQUVqQyxjQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsY0FBTSxNQUFNLEdBQUcsT0FBSyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUd4QyxjQUFNLE9BQU8sR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFLLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBSyxNQUFNLEVBQUUsQ0FBQzs7QUFFN0QsaUJBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Ozs7QUFJM0UsY0FBSSxDQUFDLE1BQU0sSUFBSSxPQUFLLFVBQVUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRTNELGNBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixjQUFNLE1BQU0sR0FBRyxPQUFLLElBQUksQ0FDckIsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FDM0IsWUFBWSxFQUFFLENBQUM7OztBQUdsQixjQUFJLE9BQU8sR0FBRyxxQkFBUSxPQUFPLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBSyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRyxjQUFJLE9BQU8sRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXhDLGlCQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQStCLEVBQUs7Z0JBQWxDLElBQUksR0FBTixJQUErQixDQUE3QixJQUFJO2dCQUFFLE9BQU8sR0FBZixJQUErQixDQUF2QixPQUFPO2dCQUFFLElBQUksR0FBckIsSUFBK0IsQ0FBZCxJQUFJO2dCQUFFLE1BQU0sR0FBN0IsSUFBK0IsQ0FBUixNQUFNOztBQUM5RCxnQkFBTSxJQUFJLEdBQUcsT0FBSyxTQUFTLENBQUM7QUFDNUIsZ0JBQU0sSUFBSSw2Q0FBeUMsSUFBSSxnQkFBVyxPQUFPLEFBQUUsQ0FBQzs7O0FBRzVFLGdCQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdELGdCQUFJLEFBQUMsTUFBTSxHQUFHLENBQUMsR0FBSSxNQUFNLEVBQUU7QUFDekIsb0JBQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ3JCOztBQUVELGdCQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUV4RSxtQkFBTyxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUUsQ0FBQztXQUN4QyxDQUFDLENBQUMsQ0FBQztTQUNMO09BQ0YsQ0FBQztLQUNIOzs7V0FFaUIscUJBQUMsSUFBSSxFQUFFO0FBQ3ZCLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELGFBQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCOzs7V0FFZSxtQkFBQyxRQUFRLEVBQUU7QUFDekIsVUFBSSxrQkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3BDLGVBQU8sOEJBQVcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDaEQ7O0FBRUQsYUFBTyw4QkFBVyxJQUFJLENBQUMsS0FBSyxFQUMxQixrQkFBSyxJQUFJLENBQUMsa0JBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFZSxtQkFBQyxNQUFNLEVBQUU7QUFDdkIsVUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFVBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFcEMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDOUIsZUFBTztPQUNSOztBQUVELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDckUsVUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO0FBQzVCLGVBQU87T0FDUjs7QUFFRCxVQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUN4RCxZQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFCLFlBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNoRDs7O1dBaExlO0FBQ2QsWUFBTSxFQUFFO0FBQ04sYUFBSyxFQUFFLFFBQVE7QUFDZixtQkFBVyxFQUFFLG9FQUFvRTtBQUNqRixZQUFJLEVBQUUsUUFBUTtBQUNkLG1CQUFTLFFBQVE7QUFDakIsZ0JBQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUM7T0FDeEk7QUFDRCxZQUFNLEVBQUU7QUFDTixtQkFBVyxFQUFFLGdHQUFnRztBQUM3RyxZQUFJLEVBQUUsU0FBUztBQUNmLG1CQUFTLEtBQUs7T0FDZjtBQUNELGdCQUFVLEVBQUU7QUFDVixhQUFLLEVBQUUsYUFBYTtBQUNwQixtQkFBVyxFQUFFLGlFQUFpRTtBQUM5RSxZQUFJLEVBQUUsU0FBUztBQUNmLG1CQUFTLEtBQUs7T0FDZjtBQUNELGVBQVMsRUFBRTtBQUNULGFBQUssRUFBRSxhQUFhO0FBQ3BCLG1CQUFXLEVBQUUsd0JBQXdCO0FBQ3JDLFlBQUksRUFBRSxTQUFTO0FBQ2YsbUJBQVMsS0FBSztPQUNmO0FBQ0QsZUFBUyxFQUFFO0FBQ1QsYUFBSyxFQUFFLG1CQUFtQjtBQUMxQixZQUFJLEVBQUUsUUFBUTtBQUNkLG1CQUFTLE9BQU87QUFDaEIsZ0JBQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUM7T0FDekQ7QUFDRCxnQkFBVSxFQUFFO0FBQ1YsYUFBSyxFQUFFLDhEQUE4RDtBQUNyRSxZQUFJLEVBQUUsUUFBUTtBQUNkLG1CQUFTLEVBQUU7T0FDWjtLQUNGOzs7O1NBRWdCLGVBQUc7QUFDbEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzlDOzs7U0FFZ0IsZUFBRztBQUNsQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDOUM7OztTQUVvQixlQUFHO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRDs7O1NBRW1CLGVBQUc7QUFDckIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0tBQ2pEOzs7U0FFbUIsZUFBRztBQUNyQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7S0FDakQ7OztTQUVvQixlQUFHO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRDs7O1NBOURrQixVQUFVOzs7cUJBQVYsVUFBVTtBQW1MOUIsQ0FBQyIsImZpbGUiOiIvVXNlcnMvUmFkL0RvY3VtZW50cy9EZXYvbXlfbm9kZWpzX2FwcHMvbGludGVyLWpzY3Mvc3JjL2xpbnRlci1qc2NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNvbmZpZ0ZpbGUgZnJvbSAnanNjcy9saWIvY2xpLWNvbmZpZyc7XG5pbXBvcnQgZ2xvYnVsZSBmcm9tICdnbG9idWxlJztcblxuY29uc3QgZ3JhbW1hclNjb3BlcyA9IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5qc3gnXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGludGVySlNDUyB7XG5cbiAgc3RhdGljIGNvbmZpZyA9IHtcbiAgICBwcmVzZXQ6IHtcbiAgICAgIHRpdGxlOiAnUHJlc2V0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJlc2V0IG9wdGlvbiBpcyBpZ25vcmVkIGlmIGEgY29uZmlnIGZpbGUgaXMgZm91bmQgZm9yIHRoZSBsaW50ZXIuJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2FpcmJuYicsXG4gICAgICBlbnVtOiBbJ2FpcmJuYicsICdjcm9ja2ZvcmQnLCAnZ29vZ2xlJywgJ2dydW50JywgJ2lkaW9tYXRpYycsICdqcXVlcnknLCAnbWRjcycsICdub2RlLXN0eWxlLWd1aWRlJywgJ3dpa2ltZWRpYScsICd3b3JkcHJlc3MnLCAneWFuZGV4J10sXG4gICAgfSxcbiAgICBlc25leHQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXR0ZW1wdHMgdG8gcGFyc2UgeW91ciBjb2RlIGFzIEVTNissIEpTWCwgYW5kIEZsb3cgdXNpbmcgdGhlIGJhYmVsLWpzY3MgcGFja2FnZSBhcyB0aGUgcGFyc2VyLicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIG9ubHlDb25maWc6IHtcbiAgICAgIHRpdGxlOiAnT25seSBDb25maWcnLFxuICAgICAgZGVzY3JpcHRpb246ICdEaXNhYmxlIGxpbnRlciBpZiB0aGVyZSBpcyBubyBjb25maWcgZmlsZSBmb3VuZCBmb3IgdGhlIGxpbnRlci4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBmaXhPblNhdmU6IHtcbiAgICAgIHRpdGxlOiAnRml4IG9uIHNhdmUnLFxuICAgICAgZGVzY3JpcHRpb246ICdGaXggSmF2YVNjcmlwdCBvbiBzYXZlJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgZGlzcGxheUFzOiB7XG4gICAgICB0aXRsZTogJ0Rpc3BsYXkgZXJyb3JzIGFzJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2Vycm9yJyxcbiAgICAgIGVudW06IFsnZXJyb3InLCAnd2FybmluZycsICdqc2NzIFdhcm5pbmcnLCAnanNjcyBFcnJvciddLFxuICAgIH0sXG4gICAgY29uZmlnUGF0aDoge1xuICAgICAgdGl0bGU6ICdDb25maWcgZmlsZSBwYXRoIChBYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRoIHRvIHlvdXIgcHJvamVjdCknLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICB9LFxuICB9O1xuXG4gIHN0YXRpYyBnZXQgcHJlc2V0KCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1qc2NzLnByZXNldCcpO1xuICB9XG5cbiAgc3RhdGljIGdldCBlc25leHQoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGludGVyLWpzY3MuZXNuZXh0Jyk7XG4gIH1cblxuICBzdGF0aWMgZ2V0IG9ubHlDb25maWcoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGludGVyLWpzY3Mub25seUNvbmZpZycpO1xuICB9XG5cbiAgc3RhdGljIGdldCBmaXhPblNhdmUoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGludGVyLWpzY3MuZml4T25TYXZlJyk7XG4gIH1cblxuICBzdGF0aWMgZ2V0IGRpc3BsYXlBcygpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItanNjcy5kaXNwbGF5QXMnKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXQgY29uZmlnUGF0aCgpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItanNjcy5jb25maWdQYXRoJyk7XG4gIH1cblxuICBzdGF0aWMgYWN0aXZhdGUoKSB7XG4gICAgLy8gSW5zdGFsbCBkZXBlbmRlbmNpZXMgdXNpbmcgYXRvbS1wYWNrYWdlLWRlcHNcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoKTtcblxuICAgIHRoaXMub2JzZXJ2ZXIgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZSgoKSA9PiB7XG5cbiAgICAgICAgaWYgKGdyYW1tYXJTY29wZXMuaW5kZXhPZihlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xIHx8IHRoaXMudGVzdEZpeE9uU2F2ZSkge1xuXG4gICAgICAgICAgLy8gRXhjbHVkZSBgZXhjbHVkZUZpbGVzYCBmb3IgZml4IG9uIHNhdmVcbiAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmdldENvbmZpZyhlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICB2YXIgZXhjbHVkZSA9IGdsb2J1bGUuaXNNYXRjaChjb25maWcgJiYgY29uZmlnLmV4Y2x1ZGVGaWxlcywgdGhpcy5nZXRGaWxlUGF0aChlZGl0b3IuZ2V0UGF0aCgpKSk7XG5cbiAgICAgICAgICBpZiAoKHRoaXMuZml4T25TYXZlICYmICFleGNsdWRlKSB8fCB0aGlzLnRlc3RGaXhPblNhdmUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGSVhJTkcnKTtcbiAgICAgICAgICAgIHRoaXMuZml4U3RyaW5nKGVkaXRvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgY29uc3QgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdKU0NTJyxcbiAgICAgIGdyYW1tYXJTY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogKGVkaXRvciwgb3B0cywgb3ZlcnJpZGVPcHRpb25zLCB0ZXN0Rml4T25TYXZlKSA9PiB7XG4gICAgICAgIGNvbnN0IEpTQ1MgPSByZXF1aXJlKCdqc2NzJyk7XG5cbiAgICAgICAgdGhpcy50ZXN0Rml4T25TYXZlID0gdGVzdEZpeE9uU2F2ZTtcblxuICAgICAgICAvLyBXZSBuZWVkIHJlLWluaXRpYWxpemUgSlNDUyBiZWZvcmUgZXZlcnkgbGludFxuICAgICAgICAvLyBvciBpdCB3aWxsIGxvb3NlcyB0aGUgZXJyb3JzLCBkaWRuJ3QgdHJhY2UgdGhlIGVycm9yXG4gICAgICAgIC8vIG11c3QgYmUgc29tZXRoaW5nIHdpdGggbmV3IDIuMC4wIEpTQ1NcbiAgICAgICAgdGhpcy5qc2NzID0gbmV3IEpTQ1MoKTtcbiAgICAgICAgdGhpcy5qc2NzLnJlZ2lzdGVyRGVmYXVsdFJ1bGVzKCk7XG5cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmdldENvbmZpZyhmaWxlUGF0aCk7XG5cbiAgICAgICAgLy8gT3B0aW9ucyBwYXNzZWQgdG8gYGpzY3NgIGZyb20gcGFja2FnZSBjb25maWd1cmF0aW9uXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGVzbmV4dDogdGhpcy5lc25leHQsIHByZXNldDogdGhpcy5wcmVzZXQgfTtcblxuICAgICAgICB0aGlzLmpzY3MuY29uZmlndXJlKG92ZXJyaWRlT3B0aW9ucyB8fCBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCBjb25maWcpKTtcblxuICAgICAgICAvLyBXZSBkb24ndCBoYXZlIGEgY29uZmlnIGZpbGUgcHJlc2VudCBpbiBwcm9qZWN0IGRpcmVjdG9yeVxuICAgICAgICAvLyBsZXQncyByZXR1cm4gYW4gZW1wdHkgYXJyYXkgb2YgZXJyb3JzXG4gICAgICAgIGlmICghY29uZmlnICYmIHRoaXMub25seUNvbmZpZykgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG5cbiAgICAgICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IHRoaXMuanNjc1xuICAgICAgICAgIC5jaGVja1N0cmluZyh0ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAuZ2V0RXJyb3JMaXN0KCk7XG5cbiAgICAgICAgLy8gRXhjbHVkZSBgZXhjbHVkZUZpbGVzYCBmb3IgZXJyb3JzXG4gICAgICAgIHZhciBleGNsdWRlID0gZ2xvYnVsZS5pc01hdGNoKGNvbmZpZyAmJiBjb25maWcuZXhjbHVkZUZpbGVzLCB0aGlzLmdldEZpbGVQYXRoKGVkaXRvci5nZXRQYXRoKCkpKTtcbiAgICAgICAgaWYgKGV4Y2x1ZGUpIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXJyb3JzLm1hcCgoeyBydWxlLCBtZXNzYWdlLCBsaW5lLCBjb2x1bW4gfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmRpc3BsYXlBcztcbiAgICAgICAgICBjb25zdCBodG1sID0gYDxzcGFuIGNsYXNzPSdiYWRnZSBiYWRnZS1mbGV4aWJsZSc+JHtydWxlfTwvc3Bhbj4gJHttZXNzYWdlfWA7XG5cbiAgICAgICAgICAvLyBXb3JrIGFyb3VuZCBhIGJ1ZyBpbiBqc2NzIGNhdXNpbmcgaXQgdG8gcmVwb3J0IGNvbHVtbnMgcGFzdCB0aGUgZW5kIG9mIHRoZSBsaW5lXG4gICAgICAgICAgY29uc3QgbWF4Q29sID0gZWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVMZW5ndGhGb3JSb3cobGluZSAtIDEpO1xuICAgICAgICAgIGlmICgoY29sdW1uIC0gMSkgPiBtYXhDb2wpIHtcbiAgICAgICAgICAgIGNvbHVtbiA9IG1heENvbCArIDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBoZWxwZXJzLnJhbmdlRnJvbUxpbmVOdW1iZXIoZWRpdG9yLCBsaW5lIC0gMSwgY29sdW1uIC0gMSk7XG5cbiAgICAgICAgICByZXR1cm4geyB0eXBlLCBodG1sLCBmaWxlUGF0aCwgcmFuZ2UgfTtcbiAgICAgICAgfSkpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldEZpbGVQYXRoKHBhdGgpIHtcbiAgICBjb25zdCByZWxhdGl2ZSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKTtcbiAgICByZXR1cm4gcmVsYXRpdmVbMV07XG4gIH1cblxuICBzdGF0aWMgZ2V0Q29uZmlnKGZpbGVQYXRoKSB7XG4gICAgaWYgKHBhdGguaXNBYnNvbHV0ZSh0aGlzLmNvbmZpZ1BhdGgpKSB7XG4gICAgICByZXR1cm4gY29uZmlnRmlsZS5sb2FkKGZhbHNlLCB0aGlzLmNvbmZpZ1BhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWdGaWxlLmxvYWQoZmFsc2UsXG4gICAgICBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgdGhpcy5jb25maWdQYXRoKSk7XG4gIH1cblxuICBzdGF0aWMgZml4U3RyaW5nKGVkaXRvcikge1xuICAgIGNvbnN0IGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IGVkaXRvclRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5nZXRDb25maWcoZWRpdG9yUGF0aCk7XG4gICAgaWYgKCFjb25maWcgJiYgdGhpcy5vbmx5Q29uZmlnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZml4ZWRUZXh0ID0gdGhpcy5qc2NzLmZpeFN0cmluZyhlZGl0b3JUZXh0LCBlZGl0b3JQYXRoKS5vdXRwdXQ7XG4gICAgaWYgKGVkaXRvclRleHQgPT09IGZpeGVkVGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCk7XG4gICAgZWRpdG9yLnNldFRleHQoZml4ZWRUZXh0KTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pO1xuICB9XG59O1xuIl19