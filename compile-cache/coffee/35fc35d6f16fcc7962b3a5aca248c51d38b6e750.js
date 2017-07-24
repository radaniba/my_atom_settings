(function() {
  var AbstractProvider, FunctionProvider, config, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.functions = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    FunctionProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, scopeDescriptor, suggestions, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([a-z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.functions = proxy.functions();
      if (((_ref = this.functions) != null ? _ref.names : void 0) == null) {
        return;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(prefix.trim(), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix.
     *
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters.
     *
     * @return {Array}
     */

    FunctionProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var element, suggestions, word, words, _i, _j, _len, _len1, _ref;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      words = fuzzaldrin.filter(this.functions.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        _ref = this.functions.values[word];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          suggestions.push({
            text: word,
            type: 'function',
            description: 'Built-in PHP function.',
            descriptionMoreURL: config.config.php_documentation_base_url.functions + word,
            className: element.args.deprecated ? 'php-atom-autocomplete-strike' : '',
            snippet: insertParameterList ? this.getFunctionSnippet(word, element.args) : null,
            displayText: this.getFunctionSignature(word, element.args),
            replacementPrefix: prefix
          });
        }
      }
      return suggestions;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL2Z1bmN0aW9uLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUhULENBQUE7O0FBQUEsRUFJQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FKbkIsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FOVCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FHTTtBQUNGLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwrQkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUVBO0FBQUE7OztPQUZBOztBQUFBLCtCQU1BLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO0FBRWQsVUFBQSw2R0FBQTtBQUFBLE1BRmdCLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFFekQsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyw2Q0FBVCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CLENBRlQsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUFLLENBQUMsU0FBTixDQUFBLENBTGIsQ0FBQTtBQU1BLE1BQUEsSUFBYywrREFBZDtBQUFBLGNBQUEsQ0FBQTtPQU5BO0FBQUEsTUFRQSxvQkFBQSxHQUF1QixNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLGNBQUQsRUFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBN0MsQ0FBakIsQ0FBdEIsQ0FSdkIsQ0FBQTtBQUFBLE1BU0EsbUJBQUEsR0FBeUIsb0JBQUEsS0FBd0IsR0FBM0IsR0FBb0MsS0FBcEMsR0FBK0MsSUFUckUsQ0FBQTtBQUFBLE1BV0EsV0FBQSxHQUFjLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTFCLEVBQXlDLG1CQUF6QyxDQVhkLENBQUE7QUFZQSxNQUFBLElBQUEsQ0FBQSxXQUF5QixDQUFDLE1BQTFCO0FBQUEsY0FBQSxDQUFBO09BWkE7QUFhQSxhQUFPLFdBQVAsQ0FmYztJQUFBLENBTmxCLENBQUE7O0FBdUJBO0FBQUE7Ozs7Ozs7T0F2QkE7O0FBQUEsK0JBK0JBLHdCQUFBLEdBQTBCLFNBQUMsTUFBRCxFQUFTLG1CQUFULEdBQUE7QUFFdEIsVUFBQSw0REFBQTs7UUFGK0Isc0JBQXNCO09BRXJEO0FBQUEsTUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUE3QixFQUFvQyxNQUFwQyxDQUFSLENBQUE7QUFBQSxNQUdBLFdBQUEsR0FBYyxFQUhkLENBQUE7QUFJQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0k7QUFBQSxhQUFBLDZDQUFBOzZCQUFBO0FBQ0ksVUFBQSxXQUFXLENBQUMsSUFBWixDQUNJO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQ0EsSUFBQSxFQUFNLFVBRE47QUFBQSxZQUVBLFdBQUEsRUFBYSx3QkFGYjtBQUFBLFlBR0Esa0JBQUEsRUFBb0IsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxTQUF6QyxHQUFxRCxJQUh6RTtBQUFBLFlBSUEsU0FBQSxFQUFjLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBaEIsR0FBZ0MsOEJBQWhDLEdBQW9FLEVBSi9FO0FBQUEsWUFLQSxPQUFBLEVBQVksbUJBQUgsR0FBNEIsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLE9BQU8sQ0FBQyxJQUFsQyxDQUE1QixHQUF5RSxJQUxsRjtBQUFBLFlBTUEsV0FBQSxFQUFhLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixJQUF0QixFQUE0QixPQUFPLENBQUMsSUFBcEMsQ0FOYjtBQUFBLFlBT0EsaUJBQUEsRUFBbUIsTUFQbkI7V0FESixDQUFBLENBREo7QUFBQSxTQURKO0FBQUEsT0FKQTtBQWdCQSxhQUFPLFdBQVAsQ0FsQnNCO0lBQUEsQ0EvQjFCLENBQUE7OzRCQUFBOztLQUQyQixpQkFYL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/function-provider.coffee
