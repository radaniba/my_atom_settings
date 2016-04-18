(function() {
  var AbstractProvider, ClassProvider, config, exec, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  config = require("../config.coffee");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = ClassProvider = (function(_super) {
    var classes;

    __extends(ClassProvider, _super);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    classes = [];

    ClassProvider.prototype.disableForSelector = '.source.php .string';


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ClassProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, scopeDescriptor, suggestions, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /((?:new|use)?(?:[^a-z0-9_])\\?(?:[A-Z][a-zA-Z_\\]*)+)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.classes = proxy.classes();
      if (((_ref = this.classes) != null ? _ref.autocomplete : void 0) == null) {
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
     * Returns suggestions available matching the given prefix
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    ClassProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var args, classInfo, instantiation, suggestions, use, word, words, _i, _len;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      instantiation = false;
      use = false;
      if (prefix.indexOf("new \\") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new \\/, '');
      } else if (prefix.indexOf("new ") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new /, '');
      } else if (prefix.indexOf("use ") !== -1) {
        use = true;
        prefix = prefix.replace(/use /, '');
      }
      if (prefix.indexOf("\\") === 0) {
        prefix = prefix.substring(1, prefix.length);
      }
      words = fuzzaldrin.filter(this.classes.autocomplete, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        if (!(word !== prefix)) {
          continue;
        }
        classInfo = this.classes.mapping[word];
        if (instantiation && this.classes.mapping[word].methods.constructor.has) {
          args = classInfo.methods.constructor.args;
          suggestions.push({
            text: word,
            type: 'class',
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            snippet: insertParameterList ? this.getFunctionSnippet(word, args) : null,
            displayText: this.getFunctionSignature(word, args),
            data: {
              kind: 'instantiation',
              prefix: prefix,
              replacementPrefix: prefix
            }
          });
        } else if (use) {
          suggestions.push({
            text: word,
            type: 'class',
            prefix: prefix,
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            replacementPrefix: prefix,
            data: {
              kind: 'use'
            }
          });
        } else {
          suggestions.push({
            text: word,
            type: 'class',
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            data: {
              kind: 'static',
              prefix: prefix,
              replacementPrefix: prefix
            }
          });
        }
      }
      return suggestions;
    };


    /**
     * Adds the missing use if needed
     * @param {TextEditor} editor
     * @param {Position}   triggerPosition
     * @param {object}     suggestion
     */

    ClassProvider.prototype.onDidInsertSuggestion = function(_arg) {
      var editor, suggestion, triggerPosition, _ref;
      editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
      if (!((_ref = suggestion.data) != null ? _ref.kind : void 0)) {
        return;
      }
      if (suggestion.data.kind === 'instantiation' || suggestion.data.kind === 'static') {
        return editor.transact((function(_this) {
          return function() {
            var endColumn, linesAdded, name, nameLength, row, splits, startColumn;
            linesAdded = parser.addUseClass(editor, suggestion.text, config.config.insertNewlinesForUseStatements);
            if (linesAdded !== null) {
              name = suggestion.text;
              splits = name.split('\\');
              nameLength = splits[splits.length - 1].length;
              startColumn = triggerPosition.column - suggestion.data.prefix.length;
              row = triggerPosition.row + linesAdded;
              if (suggestion.data.kind === 'instantiation') {
                endColumn = startColumn + name.length - nameLength - splits.length + 1;
              } else {
                endColumn = startColumn + name.length - nameLength;
              }
              return editor.setTextInBufferRange([[row, startColumn], [row, endColumn]], "");
            }
          };
        })(this));
      }
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL2NsYXNzLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FKUixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUxULENBQUE7O0FBQUEsRUFNQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FObkIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBR007QUFDRixRQUFBLE9BQUE7O0FBQUEsb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQSxHQUFVLEVBQVYsQ0FBQTs7QUFBQSw0QkFDQSxrQkFBQSxHQUFvQixxQkFEcEIsQ0FBQTs7QUFHQTtBQUFBOzs7T0FIQTs7QUFBQSw0QkFPQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUVkLFVBQUEsNkdBQUE7QUFBQSxNQUZnQixjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BRXpELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsd0RBQVQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQixDQUZULENBQUE7QUFHQSxN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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/class-provider.coffee
