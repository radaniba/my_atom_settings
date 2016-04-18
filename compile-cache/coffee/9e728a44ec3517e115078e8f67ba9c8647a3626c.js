(function() {
  var AbstractProvider, ConstantProvider, config, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = ConstantProvider = (function(_super) {
    __extends(ConstantProvider, _super);

    function ConstantProvider() {
      return ConstantProvider.__super__.constructor.apply(this, arguments);
    }

    ConstantProvider.prototype.constants = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ConstantProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([A-Z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.constants = proxy.constants();
      if (this.constants.names == null) {
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

    ConstantProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var element, suggestions, word, words, _i, _j, _len, _len1, _ref;
      words = fuzzaldrin.filter(this.constants.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        _ref = this.constants.values[word];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          suggestions.push({
            text: word,
            type: 'constant',
            description: 'Built-in PHP constant.'
          });
        }
      }
      return suggestions;
    };

    return ConstantProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL2NvbnN0YW50LXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUhULENBQUE7O0FBQUEsRUFJQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FKbkIsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FOVCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FHTTtBQUNGLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwrQkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUVBO0FBQUE7OztPQUZBOztBQUFBLCtCQU1BLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO0FBRWQsVUFBQSw0REFBQTtBQUFBLE1BRmdCLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFFekQsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyw2Q0FBVCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CLENBRlQsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUFLLENBQUMsU0FBTixDQUFBLENBTGIsQ0FBQTtBQU1BLE1BQUEsSUFBYyw0QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQU5BO0FBQUEsTUFRQSxXQUFBLEdBQWMsSUFBQyxDQUFBLHdCQUFELENBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBMUIsQ0FSZCxDQUFBO0FBU0EsTUFBQSxJQUFBLENBQUEsV0FBeUIsQ0FBQyxNQUExQjtBQUFBLGNBQUEsQ0FBQTtPQVRBO0FBVUEsYUFBTyxXQUFQLENBWmM7SUFBQSxDQU5sQixDQUFBOztBQW9CQTtBQUFBOzs7O09BcEJBOztBQUFBLCtCQXlCQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtBQUV0QixVQUFBLDREQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUE3QixFQUFvQyxNQUFwQyxDQUFSLENBQUE7QUFBQSxNQUdBLFdBQUEsR0FBYyxFQUhkLENBQUE7QUFJQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0k7QUFBQSxhQUFBLDZDQUFBOzZCQUFBO0FBQ0ksVUFBQSxXQUFXLENBQUMsSUFBWixDQUNJO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQ0EsSUFBQSxFQUFNLFVBRE47QUFBQSxZQUVBLFdBQUEsRUFBYSx3QkFGYjtXQURKLENBQUEsQ0FESjtBQUFBLFNBREo7QUFBQSxPQUpBO0FBV0EsYUFBTyxXQUFQLENBYnNCO0lBQUEsQ0F6QjFCLENBQUE7OzRCQUFBOztLQUQyQixpQkFYL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/constant-provider.coffee
