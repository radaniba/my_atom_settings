(function() {
  var CompositeDisposable, PigmentsProvider, variablesRegExp, _, _ref;

  _ref = [], CompositeDisposable = _ref[0], variablesRegExp = _ref[1], _ = _ref[2];

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.selector = atom.config.get('pigments.autocompleteScopes').join(',');
      this.subscriptions.add(atom.config.observe('pigments.autocompleteScopes', (function(_this) {
        return function(scopes) {
          return _this.selector = scopes.join(',');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToVariables', (function(_this) {
        return function(extendAutocompleteToVariables) {
          _this.extendAutocompleteToVariables = extendAutocompleteToVariables;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToColorValue', (function(_this) {
        return function(extendAutocompleteToColorValue) {
          _this.extendAutocompleteToColorValue = extendAutocompleteToColorValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.autocompleteSuggestionsFromValue', (function(_this) {
        return function(autocompleteSuggestionsFromValue) {
          _this.autocompleteSuggestionsFromValue = autocompleteSuggestionsFromValue;
        };
      })(this)));
    }

    PigmentsProvider.prototype.dispose = function() {
      this.disposed = true;
      this.subscriptions.dispose();
      return this.pigments = null;
    };

    PigmentsProvider.prototype.getProject = function() {
      if (this.disposed) {
        return;
      }
      return this.pigments.getProject();
    };

    PigmentsProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, project, suggestions, variables;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      if (this.disposed) {
        return;
      }
      prefix = this.getPrefix(editor, bufferPosition);
      project = this.getProject();
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      if (project == null) {
        return;
      }
      if (this.extendAutocompleteToVariables) {
        variables = project.getVariables();
      } else {
        variables = project.getColorVariables();
      }
      suggestions = this.findSuggestionsForPrefix(variables, prefix);
      return suggestions;
    };

    PigmentsProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (this.autocompleteSuggestionsFromValue) {
        return (_ref1 = (_ref2 = (_ref3 = (_ref4 = (_ref5 = line.match(/(?:#[a-fA-F0-9]*|rgb.+)$/)) != null ? _ref5[0] : void 0) != null ? _ref4 : (_ref6 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref6[0] : void 0) != null ? _ref3 : (_ref7 = line.match(/:\s*([^\s].+)$/)) != null ? _ref7[1] : void 0) != null ? _ref2 : (_ref8 = line.match(/^\s*([^\s].+)$/)) != null ? _ref8[1] : void 0) != null ? _ref1 : '';
      } else {
        return ((_ref9 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref9[0] : void 0) || '';
      }
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, matchesColorValue, re, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      re = RegExp("^" + (_.escapeRegExp(prefix).replace(/,\s*/, '\\s*,\\s*')));
      suggestions = [];
      matchesColorValue = function(v) {
        var res;
        res = re.test(v.value);
        if (v.color != null) {
          res || (res = v.color.suggestionValues.some(function(s) {
            return re.test(s);
          }));
        }
        return res;
      };
      matchedVariables = variables.filter((function(_this) {
        return function(v) {
          return !v.isAlternate && re.test(v.name) || (_this.autocompleteSuggestionsFromValue && matchesColorValue(v));
        };
      })(this));
      matchedVariables.forEach((function(_this) {
        return function(v) {
          var color, rightLabelHTML;
          if (v.isColor) {
            color = v.color.alpha === 1 ? '#' + v.color.hex : v.color.toCSS();
            rightLabelHTML = "<span class='color-suggestion-preview' style='background: " + (v.color.toCSS()) + "'></span>";
            if (_this.extendAutocompleteToColorValue) {
              rightLabelHTML = "" + color + " " + rightLabelHTML;
            }
            return suggestions.push({
              text: v.name,
              rightLabelHTML: rightLabelHTML,
              replacementPrefix: prefix,
              className: 'color-suggestion'
            });
          } else {
            return suggestions.push({
              text: v.name,
              rightLabel: v.value,
              replacementPrefix: prefix,
              className: 'pigments-suggestion'
            });
          }
        };
      })(this));
      return suggestions;
    };

    return PigmentsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBOztBQUFBLEVBQUEsT0FFSSxFQUZKLEVBQ0UsNkJBREYsRUFDdUIseUJBRHZCLEVBQ3dDLFdBRHhDLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSwwQkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTs7UUFBQSxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQXZDO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRmpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUE4QyxDQUFDLElBQS9DLENBQW9ELEdBQXBELENBSFosQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNwRSxLQUFDLENBQUEsUUFBRCxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUR3RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQW5CLENBTEEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix3Q0FBcEIsRUFBOEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/pigments-provider.coffee
