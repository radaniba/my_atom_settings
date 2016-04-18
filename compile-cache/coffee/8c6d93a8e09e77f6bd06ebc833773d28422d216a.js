(function() {
  var CompositeDisposable, PigmentsProvider, Range, variablesRegExp, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  variablesRegExp = require('./regexes').variables;

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
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
      var line, _ref1;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = line.match(new RegExp(variablesRegExp + '$'))) != null ? _ref1[0] : void 0) || '';
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, suggestions;
      if (variables == null) {
        return [];
      }
      suggestions = [];
      matchedVariables = variables.filter(function(v) {
        return RegExp("^" + (_.escapeRegExp(prefix))).test(v.name);
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFnQyxPQUFBLENBQVEsTUFBUixDQUFoQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGFBQUEsS0FEdEIsQ0FBQTs7QUFBQSxFQUVZLGtCQUFtQixPQUFBLENBQVEsV0FBUixFQUE5QixTQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSwwQkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBOEMsQ0FBQyxJQUEvQyxDQUFvRCxHQUFwRCxDQURaLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLFFBQUQsR0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFEd0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQixDQUhBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJ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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/pigments-provider.coffee
