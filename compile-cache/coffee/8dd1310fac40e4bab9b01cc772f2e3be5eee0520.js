(function() {
  var AbstractProvider, VariableProvider, fuzzaldrin, parser,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = VariableProvider = (function(_super) {
    __extends(VariableProvider, _super);

    function VariableProvider() {
      return VariableProvider.__super__.constructor.apply(this, arguments);
    }

    VariableProvider.prototype.variables = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    VariableProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(\$[a-zA-Z_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.variables = parser.getAllVariablesInFunction(editor, bufferPosition);
      if (!this.variables.length) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix.trim());
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix Prefix to match
     * @return array
     */

    VariableProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var suggestions, word, words, _i, _len;
      words = fuzzaldrin.filter(this.variables, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        suggestions.push({
          text: word,
          type: 'variable',
          replacementPrefix: prefix
        });
      }
      return suggestions;
    };

    return VariableProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL3ZhcmlhYmxlLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBSG5CLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBRUE7QUFBQTs7O09BRkE7O0FBQUEsK0JBTUEsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFFZCxVQUFBLDREQUFBO0FBQUEsTUFGZ0IsY0FBQSxRQUFRLHNCQUFBLGdCQUFnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUV6RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLGlCQUFULENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkIsQ0FGVCxDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQUhBO0FBQUEsTUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxNQUFqQyxFQUF5QyxjQUF6QyxDQUxiLENBQUE7QUFNQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsU0FBUyxDQUFDLE1BQXpCO0FBQUEsY0FBQSxDQUFBO09BTkE7QUFBQSxNQVFBLFdBQUEsR0FBYyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUExQixDQVJkLENBQUE7QUFTQSxNQUFBLElBQUEsQ0FBQSxXQUF5QixDQUFDLE1BQTFCO0FBQUEsY0FBQSxDQUFBO09BVEE7QUFVQSxhQUFPLFdBQVAsQ0FaYztJQUFBLENBTmxCLENBQUE7O0FBb0JBO0FBQUE7Ozs7T0FwQkE7O0FBQUEsK0JBeUJBLHdCQUFBLEdBQTBCLFNBQUMsTUFBRCxHQUFBO0FBRXRCLFVBQUEsa0NBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFDLENBQUEsU0FBbkIsRUFBOEIsTUFBOUIsQ0FBUixDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsRUFIZCxDQUFBO0FBSUEsV0FBQSw0Q0FBQTt5QkFBQTtBQUNJLFFBQUEsV0FBVyxDQUFDLElBQVosQ0FDSTtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxVQUNBLElBQUEsRUFBTSxVQUROO0FBQUEsVUFFQSxpQkFBQSxFQUFtQixNQUZuQjtTQURKLENBQUEsQ0FESjtBQUFBLE9BSkE7QUFVQSxhQUFPLFdBQVAsQ0Fac0I7SUFBQSxDQXpCMUIsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQVIvQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/variable-provider.coffee
