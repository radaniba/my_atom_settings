(function() {
  var AbstractProvider, parser;

  parser = require("../services/php-file-parser.coffee");

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = '';

    AbstractProvider.prototype.selector = '.source.php';

    AbstractProvider.prototype.inclusionPriority = 10;

    AbstractProvider.prototype.disableForSelector = '.source.php .comment, .source.php .string';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {};


    /**
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {};


    /**
     * Entry point of all request from autocomplete-plus
     * Calls @fetchSuggestion in the provider if allowed
     * @return array Suggestions
     */

    AbstractProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      return this.fetchSuggestions({
        editor: editor,
        bufferPosition: bufferPosition,
        scopeDescriptor: scopeDescriptor,
        prefix: prefix
      });
    };


    /**
     * Builds a snippet for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the snippet (parameters, optionals)
     * @return string The snippet
     */

    AbstractProvider.prototype.getFunctionSnippet = function(word, elements) {
      var arg, body, index, lastIndex, _i, _j, _len, _len1, _ref, _ref1;
      body = word + "(";
      lastIndex = 0;
      _ref = elements.parameters;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        arg = _ref[index];
        if (index !== 0) {
          body += ", ";
        }
        body += "${" + (index + 1) + ":" + arg + "}";
        lastIndex = index + 1;
      }
      if (elements.optionals.length > 0) {
        body += " ${" + (lastIndex + 1) + ":[";
        if (lastIndex !== 0) {
          body += ", ";
        }
        lastIndex += 1;
        _ref1 = elements.optionals;
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          arg = _ref1[index];
          if (index !== 0) {
            body += ", ";
          }
          body += arg;
        }
        body += "]}";
      }
      body += ")";
      body += "$0";
      return body;
    };


    /**
     * Builds the signature for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the signature (parameters, optionals)
     * @return string The signature
     */

    AbstractProvider.prototype.getFunctionSignature = function(word, element) {
      var signature, snippet;
      snippet = this.getFunctionSnippet(word, element);
      signature = snippet.replace(/\$\{\d+:([^\}]+)\}/g, '$1');
      return signature.slice(0, -2);
    };


    /**
     * Get prefix from bufferPosition and @regex
     * @return string
     */

    AbstractProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, match, matches, start, word, _i, _len;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(this.regex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          match = matches[_i];
          start = bufferPosition.column - match.length;
          if (start >= 0) {
            word = editor.getTextInBufferRange([[bufferPosition.row, bufferPosition.column - match.length], bufferPosition]);
            if (word === match) {
              if (match[0] === '{' || match[0] === '(' || match[0] === '[') {
                match = match.substring(1);
              }
              return match;
            }
          }
        }
      }
      return '';
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL2Fic3RyYWN0LXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FHTTtrQ0FDRjs7QUFBQSwrQkFBQSxLQUFBLEdBQU8sRUFBUCxDQUFBOztBQUFBLCtCQUNBLFFBQUEsR0FBVSxhQURWLENBQUE7O0FBQUEsK0JBR0EsaUJBQUEsR0FBbUIsRUFIbkIsQ0FBQTs7QUFBQSwrQkFLQSxrQkFBQSxHQUFvQiwyQ0FMcEIsQ0FBQTs7QUFPQTtBQUFBOztPQVBBOztBQUFBLCtCQVVBLElBQUEsR0FBTSxTQUFBLEdBQUEsQ0FWTixDQUFBOztBQVlBO0FBQUE7O09BWkE7O0FBQUEsK0JBZUEsVUFBQSxHQUFZLFNBQUEsR0FBQSxDQWZaLENBQUE7O0FBaUJBO0FBQUE7Ozs7T0FqQkE7O0FBQUEsK0JBc0JBLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLCtDQUFBO0FBQUEsTUFEYyxjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BQ3ZELENBQUE7QUFBQSxhQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFrQjtBQUFBLFFBQUMsUUFBQSxNQUFEO0FBQUEsUUFBUyxnQkFBQSxjQUFUO0FBQUEsUUFBeUIsaUJBQUEsZUFBekI7QUFBQSxRQUEwQyxRQUFBLE1BQTFDO09BQWxCLENBQVAsQ0FEWTtJQUFBLENBdEJoQixDQUFBOztBQXlCQTtBQUFBOzs7OztPQXpCQTs7QUFBQSwrQkErQkEsa0JBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sUUFBUCxHQUFBO0FBQ2hCLFVBQUEsNkRBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFBLEdBQU8sR0FBZCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksQ0FEWixDQUFBO0FBSUE7QUFBQSxXQUFBLDJEQUFBOzBCQUFBO0FBQ0ksUUFBQSxJQUFnQixLQUFBLEtBQVMsQ0FBekI7QUFBQSxVQUFBLElBQUEsSUFBUSxJQUFSLENBQUE7U0FBQTtBQUFBLFFBQ0EsSUFBQSxJQUFRLElBQUEsR0FBTyxDQUFDLEtBQUEsR0FBTSxDQUFQLENBQVAsR0FBbUIsR0FBbkIsR0FBeUIsR0FBekIsR0FBK0IsR0FEdkMsQ0FBQTtBQUFBLFFBRUEsU0FBQSxHQUFZLEtBQUEsR0FBTSxDQUZsQixDQURKO0FBQUEsT0FKQTtBQVVBLE1BQUEsSUFBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQW5CLEdBQTRCLENBQS9CO0FBQ0ksUUFBQSxJQUFBLElBQVEsS0FBQSxHQUFRLENBQUMsU0FBQSxHQUFZLENBQWIsQ0FBUixHQUEwQixJQUFsQyxDQUFBO0FBQ0EsUUFBQSxJQUFnQixTQUFBLEtBQWEsQ0FBN0I7QUFBQSxVQUFBLElBQUEsSUFBUSxJQUFSLENBQUE7U0FEQTtBQUFBLFFBR0EsU0FBQSxJQUFhLENBSGIsQ0FBQTtBQUtBO0FBQUEsYUFBQSw4REFBQTs2QkFBQTtBQUNJLFVBQUEsSUFBZ0IsS0FBQSxLQUFTLENBQXpCO0FBQUEsWUFBQSxJQUFBLElBQVEsSUFBUixDQUFBO1dBQUE7QUFBQSxVQUNBLElBQUEsSUFBUSxHQURSLENBREo7QUFBQSxTQUxBO0FBQUEsUUFRQSxJQUFBLElBQVEsSUFSUixDQURKO09BVkE7QUFBQSxNQXFCQSxJQUFBLElBQVEsR0FyQlIsQ0FBQTtBQUFBLE1Bd0JBLElBQUEsSUFBUSxJQXhCUixDQUFBO0FBMEJBLGFBQU8sSUFBUCxDQTNCZ0I7SUFBQSxDQS9CcEIsQ0FBQTs7QUE0REE7QUFBQTs7Ozs7T0E1REE7O0FBQUEsK0JBa0VBLG9CQUFBLEdBQXNCLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNsQixVQUFBLGtCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLE9BQTFCLENBQVYsQ0FBQTtBQUFBLE1BR0EsU0FBQSxHQUFZLE9BQU8sQ0FBQyxPQUFSLENBQWdCLHFCQUFoQixFQUF1QyxJQUF2QyxDQUhaLENBQUE7QUFLQSxhQUFPLFNBQVUsYUFBakIsQ0FOa0I7SUFBQSxDQWxFdEIsQ0FBQTs7QUEwRUE7QUFBQTs7O09BMUVBOztBQUFBLCtCQThFQSxTQUFBLEdBQVcsU0FBQyxNQUFELEVBQVMsY0FBVCxHQUFBO0FBRVAsVUFBQSwyQ0FBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxFQUEwQixjQUExQixDQUF0QixDQUFQLENBQUE7QUFBQSxNQUdBLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFaLENBSFYsQ0FBQTtBQU1BLE1BQUEsSUFBRyxlQUFIO0FBQ0ksYUFBQSw4Q0FBQTs4QkFBQTtBQUNJLFVBQUEsS0FBQSxHQUFRLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLEtBQUssQ0FBQyxNQUF0QyxDQUFBO0FBQ0EsVUFBQSxJQUFHLEtBQUEsSUFBUyxDQUFaO0FBQ0ksWUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsY0FBYyxDQUFDLE1BQWYsR0FBd0IsS0FBSyxDQUFDLE1BQW5ELENBQUQsRUFBNkQsY0FBN0QsQ0FBNUIsQ0FBUCxDQUFBO0FBQ0EsWUFBQSxJQUFHLElBQUEsS0FBUSxLQUFYO0FBR0ksY0FBQSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSxHQUFaLElBQW1CLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSxHQUEvQixJQUFzQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksR0FBckQ7QUFDSSxnQkFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBUixDQURKO2VBQUE7QUFHQSxxQkFBTyxLQUFQLENBTko7YUFGSjtXQUZKO0FBQUEsU0FESjtPQU5BO0FBbUJBLGFBQU8sRUFBUCxDQXJCTztJQUFBLENBOUVYLENBQUE7OzRCQUFBOztNQU5KLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/abstract-provider.coffee
