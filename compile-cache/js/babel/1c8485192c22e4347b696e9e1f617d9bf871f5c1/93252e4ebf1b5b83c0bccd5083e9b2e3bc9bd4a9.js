'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Function = require('loophole').Function;
var _ = require('underscore-plus');

var REGEXP_LINE = /(([\$\w]+[\w-]*)|([.:;'"[{( ]+))$/g;

var Provider = (function () {
  function Provider(manager) {
    _classCallCheck(this, Provider);

    this.manager = undefined;
    this.force = false;

    // automcomplete-plus
    this.selector = '.source.js';
    this.disableForSelector = '.source.js .comment';
    this.inclusionPriority = 1;
    this.excludeLowerPriority = false;

    this.line = undefined;
    this.lineMatchResult = undefined;
    this.tempPrefix = undefined;
    this.suggestionsArr = undefined;
    this.suggestion = undefined;
    this.suggestionClone = undefined;
  }

  _createClass(Provider, [{
    key: 'init',
    value: function init(manager) {

      this.manager = manager;
      this.excludeLowerPriority = this.manager.packageConfig.options.excludeLowerPriorityProviders;

      if (this.manager.packageConfig.options.displayAboveSnippets) {

        this.suggestionPriority = 2;
      }
    }
  }, {
    key: 'isValidPrefix',
    value: function isValidPrefix(prefix, prefixLast) {

      if (prefixLast === undefined) {

        return false;
      }

      if (prefixLast === '.') {

        return true;
      }

      if (prefixLast.match(/;|\s/)) {

        return false;
      }

      if (prefix.length > 1) {

        prefix = '_' + prefix;
      }

      try {

        new Function('var ' + prefix)();
      } catch (e) {

        return false;
      }

      return true;
    }
  }, {
    key: 'checkPrefix',
    value: function checkPrefix(prefix) {

      if (prefix.match(/(\s|;|\.|\"|\')$/) || prefix.replace(/\s/g, '').length === 0) {

        return '';
      }

      return prefix;
    }
  }, {
    key: 'getPrefix',
    value: function getPrefix(editor, bufferPosition) {

      this.line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      this.lineMatchResult = this.line.match(REGEXP_LINE);

      if (this.lineMatchResult) {

        return this.lineMatchResult[0];
      }
    }
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var _this = this;

      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var scopeDescriptor = _ref.scopeDescriptor;
      var prefix = _ref.prefix;
      var activatedManually = _ref.activatedManually;

      return new Promise(function (resolve) {

        if (!_this.manager.client) {

          return resolve([]);
        }

        _this.tempPrefix = _this.getPrefix(editor, bufferPosition) || prefix;

        if (!_this.isValidPrefix(_this.tempPrefix, _this.tempPrefix[_this.tempPrefix.length - 1]) && !_this.force && !activatedManually) {

          return resolve([]);
        }

        prefix = _this.checkPrefix(_this.tempPrefix);

        _this.manager.client.update(editor).then(function (data) {

          if (!data) {

            return resolve([]);
          }

          _this.manager.client.completions(atom.project.relativizePath(editor.getURI())[1], {

            line: bufferPosition.row,
            ch: bufferPosition.column

          }).then(function (data) {

            if (!data) {

              return resolve([]);
            }

            if (!data.completions.length) {

              return resolve([]);
            }

            _this.suggestionsArr = [];

            var scopesPath = scopeDescriptor.getScopesArray();
            var isInFunDef = scopesPath.indexOf('meta.function.js') > -1;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = data.completions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                obj = _this.manager.helper.formatTypeCompletion(obj, isInFunDef);

                _this.suggestion = {

                  text: obj.name,
                  replacementPrefix: prefix,
                  className: null,
                  type: obj._typeSelf,
                  leftLabel: obj.leftLabel,
                  snippet: obj._snippet,
                  displayText: obj._displayText,
                  description: obj.doc || null,
                  descriptionMoreURL: obj.url || null
                };

                if (_this.manager.packageConfig.options.useSnippetsAndFunction && obj._hasParams) {

                  _this.suggestionClone = _.clone(_this.suggestion);
                  _this.suggestionClone.type = 'snippet';

                  if (obj._hasParams) {

                    _this.suggestion.snippet = obj.name + '(${0:})';
                  } else {

                    _this.suggestion.snippet = obj.name + '()';
                  }

                  _this.suggestionsArr.push(_this.suggestion);
                  _this.suggestionsArr.push(_this.suggestionClone);
                } else {

                  _this.suggestionsArr.push(_this.suggestion);
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                  _iterator['return']();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            resolve(_this.suggestionsArr);
          })['catch'](function (err) {

            console.log(err);
            resolve([]);
          });
        });
      });
    }
  }, {
    key: 'forceCompletion',
    value: function forceCompletion() {

      this.force = true;
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'autocomplete-plus:activate');
      this.force = false;
    }
  }]);

  return Provider;
})();

exports['default'] = Provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztBQUVaLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDNUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRW5DLElBQU0sV0FBVyxHQUFHLG9DQUFvQyxDQUFDOztJQUVwQyxRQUFRO0FBRWhCLFdBRlEsUUFBUSxDQUVmLE9BQU8sRUFBRTswQkFGRixRQUFROztBQUl6QixRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUN6QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7O0FBR25CLFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7O0FBRWxDLFFBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0dBQ2xDOztlQW5Ca0IsUUFBUTs7V0FxQnZCLGNBQUMsT0FBTyxFQUFFOztBQUVaLFVBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFD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Sjs7O1dBRWMsMkJBQUc7O0FBRWhCLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUM7QUFDL0csVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7OztTQTlMa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiO1xuXG5sZXQgRnVuY3Rpb24gPSByZXF1aXJlKCdsb29waG9sZScpLkZ1bmN0aW9uO1xubGV0IF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKTtcblxuY29uc3QgUkVHRVhQX0xJTkUgPSAvKChbXFwkXFx3XStbXFx3LV0qKXwoWy46OydcIlt7KCBdKykpJC9nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm92aWRlciB7XG5cbiAgY29uc3RydWN0b3IobWFuYWdlcikge1xuXG4gICAgdGhpcy5tYW5hZ2VyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZm9yY2UgPSBmYWxzZTtcblxuICAgIC8vIGF1dG9tY29tcGxldGUtcGx1c1xuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5qcyc7XG4gICAgdGhpcy5kaXNhYmxlRm9yU2VsZWN0b3IgPSAnLnNvdXJjZS5qcyAuY29tbWVudCc7XG4gICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDE7XG4gICAgdGhpcy5leGNsdWRlTG93ZXJQcmlvcml0eSA9IGZhbHNlO1xuXG4gICAgdGhpcy5saW5lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubGluZU1hdGNoUmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudGVtcFByZWZpeCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN1Z2dlc3Rpb25zQXJyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3VnZ2VzdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN1Z2dlc3Rpb25DbG9uZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGluaXQobWFuYWdlcikge1xuXG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgICB0aGlzLmV4Y2x1ZGVMb3dlclByaW9yaXR5ID0gdGhpcy5tYW5hZ2VyLnBhY2thZ2VDb25maWcub3B0aW9ucy5leGNsdWRlTG93ZXJQcmlvcml0eVByb3ZpZGVycztcblxuICAgIGlmICh0aGlzLm1hbmFnZXIucGFja2FnZUNvbmZpZy5vcHRpb25zLmRpc3BsYXlBYm92ZVNuaXBwZXRzKSB7XG5cbiAgICAgIHRoaXMuc3VnZ2VzdGlvblByaW9yaXR5ID0gMjtcbiAgICB9XG4gIH1cblxuICBpc1ZhbGlkUHJlZml4KHByZWZpeCwgcHJlZml4TGFzdCkge1xuXG4gICAgaWYgKHByZWZpeExhc3QgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHByZWZpeExhc3QgPT09ICdcXC4nKSB7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChwcmVmaXhMYXN0Lm1hdGNoKC87fFxccy8pKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocHJlZml4Lmxlbmd0aCA+IDEpIHtcblxuICAgICAgcHJlZml4ID0gYF8ke3ByZWZpeH1gO1xuICAgIH1cblxuICAgIHRyeSB7XG5cbiAgICAgIChuZXcgRnVuY3Rpb24oYHZhciAke3ByZWZpeH1gKSkoKTtcblxuICAgIH0gY2F0Y2ggKGUpIHtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2hlY2tQcmVmaXgocHJlZml4KSB7XG5cbiAgICBpZiAocHJlZml4Lm1hdGNoKC8oXFxzfDt8XFwufFxcXCJ8XFwnKSQvKSB8fCBwcmVmaXgucmVwbGFjZSgvXFxzL2csICcnKS5sZW5ndGggPT09IDApIHtcblxuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVmaXg7XG4gIH1cblxuICBnZXRQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikge1xuXG4gICAgdGhpcy5saW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKTtcbiAgICB0aGlzLmxpbmVNYXRjaFJlc3VsdCA9IHRoaXMubGluZS5tYXRjaChSRUdFWFBfTElORSk7XG5cbiAgICBpZiAodGhpcy5saW5lTWF0Y2hSZXN1bHQpIHtcblxuICAgICAgcmV0dXJuIHRoaXMubGluZU1hdGNoUmVzdWx0WzBdO1xuICAgIH1cbiAgfVxuXG4gIGdldFN1Z2dlc3Rpb25zKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeCwgYWN0aXZhdGVkTWFudWFsbHl9KSB7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgaWYgKCF0aGlzLm1hbmFnZXIuY2xpZW50KSB7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRlbXBQcmVmaXggPSB0aGlzLmdldFByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSB8fCBwcmVmaXg7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkUHJlZml4KHRoaXMudGVtcFByZWZpeCwgdGhpcy50ZW1wUHJlZml4W3RoaXMudGVtcFByZWZpeC5sZW5ndGggLSAxXSkgJiYgIXRoaXMuZm9yY2UgJiYgIWFjdGl2YXRlZE1hbnVhbGx5KSB7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgfVxuXG4gICAgICBwcmVmaXggPSB0aGlzLmNoZWNrUHJlZml4KHRoaXMudGVtcFByZWZpeCk7XG5cbiAgICAgIHRoaXMubWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIGlmICghZGF0YSkge1xuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLmNsaWVudC5jb21wbGV0aW9ucyhhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZWRpdG9yLmdldFVSSSgpKVsxXSwge1xuXG4gICAgICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgICAgIGNoOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cblxuICAgICAgICB9KS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgICAgICBpZiAoIWRhdGEpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghZGF0YS5jb21wbGV0aW9ucy5sZW5ndGgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnNBcnIgPSBbXTtcblxuICAgICAgICAgIGxldCBzY29wZXNQYXRoID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KCk7XG4gICAgICAgICAgbGV0IGlzSW5GdW5EZWYgPSBzY29wZXNQYXRoLmluZGV4T2YoJ21ldGEuZnVuY3Rpb24uanMnKSA+IC0xO1xuXG4gICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGRhdGEuY29tcGxldGlvbnMpIHtcblxuICAgICAgICAgICAgb2JqID0gdGhpcy5tYW5hZ2VyLmhlbHBlci5mb3JtYXRUeXBlQ29tcGxldGlvbihvYmosIGlzSW5GdW5EZWYpO1xuXG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb24gPSB7XG5cbiAgICAgICAgICAgICAgdGV4dDogb2JqLm5hbWUsXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXgsXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgdHlwZTogb2JqLl90eXBlU2VsZixcbiAgICAgICAgICAgICAgbGVmdExhYmVsOiBvYmoubGVmdExhYmVsLFxuICAgICAgICAgICAgICBzbmlwcGV0OiBvYmouX3NuaXBwZXQsXG4gICAgICAgICAgICAgIGRpc3BsYXlUZXh0OiBvYmouX2Rpc3BsYXlUZXh0LFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogb2JqLmRvYyB8fCBudWxsLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IG9iai51cmwgfHwgbnVsbFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubWFuYWdlci5wYWNrYWdlQ29uZmlnLm9wdGlvbnMudXNlU25pcHBldHNBbmRGdW5jdGlvbiAmJiBvYmouX2hhc1BhcmFtcykge1xuXG4gICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbkNsb25lID0gXy5jbG9uZSh0aGlzLnN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25DbG9uZS50eXBlID0gJ3NuaXBwZXQnO1xuXG4gICAgICAgICAgICAgIGlmIChvYmouX2hhc1BhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uLnNuaXBwZXQgPSBgJHtvYmoubmFtZX0oJFxcezA6XFx9KWA7XG5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbi5zbmlwcGV0ID0gYCR7b2JqLm5hbWV9KClgO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uc0Fyci5wdXNoKHRoaXMuc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnNBcnIucHVzaCh0aGlzLnN1Z2dlc3Rpb25DbG9uZSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uc0Fyci5wdXNoKHRoaXMuc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZSh0aGlzLnN1Z2dlc3Rpb25zQXJyKTtcblxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZm9yY2VDb21wbGV0aW9uKCkge1xuXG4gICAgdGhpcy5mb3JjZSA9IHRydWU7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSwgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJyk7XG4gICAgdGhpcy5mb3JjZSA9IGZhbHNlO1xuICB9XG59XG4iXX0=