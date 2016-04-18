(function() {
  var docURL, firstCharsEqual, fs, keywordSelectorPrefixPattern, path;

  fs = require('fs');

  path = require('path');

  keywordSelectorPrefixPattern = /([a-zA-Z]+)\s*$/;

  docURL = "https://www.gnu.org/software/gawk/manual/gawk.html";

  module.exports = {
    selector: '.source.awk',
    disableForSelector: '.source.awk .comment, .source.awk .string',
    filterSuggestions: true,
    getSuggestions: function(request) {
      var completions, keywordCompletions, prefix, scopes;
      completions = null;
      prefix = request.prefix;
      scopes = request.scopeDescriptor.getScopesArray();
      if (this.isCompletingKeywordSelector(request)) {
        keywordCompletions = this.getKeywordCompletions(request);
        if (keywordCompletions != null ? keywordCompletions.length : void 0) {
          if (completions == null) {
            completions = [];
          }
          completions = completions.concat(keywordCompletions);
        }
      }
      return completions;
    },
    onDidInsertSuggestion: function(_arg) {
      var editor, suggestion;
      editor = _arg.editor, suggestion = _arg.suggestion;
      if (suggestion.type === 'property') {
        return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
      }
    },
    triggerAutocomplete: function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
        activatedManually: false
      });
    },
    loadKeywords: function() {
      this.keywords = {};
      return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
        return function(error, content) {
          if (error == null) {
            _this.keywords = JSON.parse(content).keywords;
          }
        };
      })(this));
    },
    isCompletingKeywordSelector: function(_arg) {
      var bufferPosition, editor, keywordSelectorPrefix, scopeDescriptor, scopes;
      editor = _arg.editor, scopeDescriptor = _arg.scopeDescriptor, bufferPosition = _arg.bufferPosition;
      scopes = scopeDescriptor.getScopesArray();
      keywordSelectorPrefix = this.getKeywordSelectorPrefix(editor, bufferPosition);
      if (!(keywordSelectorPrefix != null ? keywordSelectorPrefix.length : void 0)) {
        return false;
      }
      return true;
    },
    getKeywordCompletions: function(_arg) {
      var bufferPosition, completions, editor, keyword, options, prefix, _ref;
      bufferPosition = _arg.bufferPosition, editor = _arg.editor, prefix = _arg.prefix;
      completions = [];
      _ref = this.keywords;
      for (keyword in _ref) {
        options = _ref[keyword];
        if (firstCharsEqual(keyword, prefix)) {
          completions.push(this.buildKeywordCompletion(keyword, options));
        }
      }
      return completions;
    },
    getKeywordSelectorPrefix: function(editor, bufferPosition) {
      var line, _ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (_ref = keywordSelectorPrefixPattern.exec(line)) != null ? _ref[1] : void 0;
    },
    buildKeywordCompletion: function(keyword, _arg) {
      var completion, description, displayText, docAnchor, leftLabel, rightLabel, snippet, type;
      type = _arg.type, snippet = _arg.snippet, displayText = _arg.displayText, description = _arg.description, docAnchor = _arg.docAnchor, leftLabel = _arg.leftLabel, rightLabel = _arg.rightLabel;
      completion = {
        type: type,
        description: description,
        descriptionMoreURL: "" + docURL + "#" + docAnchor
      };
      if (displayText != null ? displayText.length : void 0) {
        completion.displayText = displayText;
      }
      if (leftLabel != null ? leftLabel.length : void 0) {
        completion.leftLabel = leftLabel;
      }
      if (rightLabel != null ? rightLabel.length : void 0) {
        completion.rightLabel = rightLabel;
      }
      if (snippet != null ? snippet.length : void 0) {
        completion.snippet = snippet;
      } else {
        completion.text = "" + keyword;
      }
      return completion;
    }
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0] === str2[0];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtYXdrL2xpYi9wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0RBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLDRCQUFBLEdBQStCLGlCQUgvQixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLG9EQUpULENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsYUFBVjtBQUFBLElBQ0Esa0JBQUEsRUFBb0IsMkNBRHBCO0FBQUEsSUFFQSxpQkFBQSxFQUFtQixJQUZuQjtBQUFBLElBSUEsY0FBQSxFQUFnQixTQUFDLE9BQUQsR0FBQTtBQUNkLFVBQUEsK0NBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxJQUFkLENBQUE7QUFBQSxNQUNDLFNBQVUsUUFBVixNQURELENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxPQUFPLENBQUMsZUFBZSxDQUFDLGNBQXhCLENBQUEsQ0FGVCxDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUE3QixDQUFIO0FBQ0UsUUFBQSxrQkFBQSxHQUFxQixJQUFDLENBQUEscUJBQUQsQ0FBdUIsT0FBdkIsQ0FBckIsQ0FBQTtBQUNBLFFBQUEsaUNBQUcsa0JBQWtCLENBQUUsZUFBdkI7O1lBQ0UsY0FBZTtXQUFmO0FBQUEsVUFDQSxXQUFBLEdBQWMsV0FBVyxDQUFDLE1BQVosQ0FBbUIsa0JBQW5CLENBRGQsQ0FERjtTQUZGO09BSkE7YUFVQSxZQVhjO0lBQUEsQ0FKaEI7QUFBQSxJQWlCQSxxQkFB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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-awk/lib/provider.coffee
