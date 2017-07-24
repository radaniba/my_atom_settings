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
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = line.match(new RegExp(variablesRegExp + '$'))) != null ? _ref1[0] : void 0) || '';
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      suggestions = [];
      matchedVariables = variables.filter(function(v) {
        return !v.isAlternate && RegExp("^" + (_.escapeRegExp(prefix))).test(v.name);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBOztBQUFBLEVBQUEsT0FFSSxFQUZKLEVBQ0UsNkJBREYsRUFDdUIseUJBRHZCLEVBQ3dDLFdBRHhDLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSwwQkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTs7UUFBQSxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQXZDO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRmpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUE4QyxDQUFDLElBQS9DLENBQW9ELEdBQXBELENBSFosQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNwRSxLQUFDLENBQUEsUUFBRCxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUR3RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQW5CLENBTEEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix3Q0FBcEIsRUFBOEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/pigments-provider.coffee
