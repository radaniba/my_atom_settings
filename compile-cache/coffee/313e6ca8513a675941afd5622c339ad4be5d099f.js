(function() {
  var iconHTML, regexes;

  iconHTML = "<img src='" + __dirname + "/../static/logo.svg' style='width: 100%;'>";

  regexes = {
    r: /([^\d\W]|[.])[\w.$]*$/,
    python: /([^\d\W]|[\u00A0-\uFFFF])[\w.\u00A0-\uFFFF]*$/,
    php: /[$a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/
  };

  module.exports = function(kernelManager) {
    var autocompleteProvider;
    autocompleteProvider = {
      selector: '.source',
      disableForSelector: '.comment, .string',
      inclusionPriority: 1,
      excludeLowerPriority: false,
      getSuggestions: function(_arg) {
        var bufferPosition, editor, grammar, kernel, language, line, prefix, regex, scopeDescriptor, _ref;
        editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
        grammar = editor.getGrammar();
        language = kernelManager.getLanguageFor(grammar);
        kernel = kernelManager.getRunningKernelFor(language);
        if (kernel == null) {
          return null;
        }
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        regex = regexes[language];
        if (regex) {
          prefix = ((_ref = line.match(regex)) != null ? _ref[0] : void 0) || '';
        } else {
          prefix = line;
        }
        if (prefix.trimRight().length < prefix.length) {
          return null;
        }
        if (prefix.trim().length < 3) {
          return null;
        }
        console.log('autocompleteProvider: request:', line, bufferPosition, prefix);
        return new Promise(function(resolve) {
          return kernel.complete(prefix, function(_arg1) {
            var cursor_end, cursor_start, matches, replacementPrefix;
            matches = _arg1.matches, cursor_start = _arg1.cursor_start, cursor_end = _arg1.cursor_end;
            replacementPrefix = prefix.slice(cursor_start, cursor_end);
            matches = matches.map(function(match) {
              return {
                text: match,
                replacementPrefix: replacementPrefix,
                iconHTML: iconHTML
              };
            });
            return resolve(matches);
          });
        });
      }
    };
    return autocompleteProvider;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBWSxZQUFBLEdBQVksU0FBWixHQUFzQiw0Q0FBbEMsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FFSTtBQUFBLElBQUEsQ0FBQSxFQUFHLHVCQUFIO0FBQUEsSUFHQSxNQUFBLEVBQVEsK0NBSFI7QUFBQSxJQU1BLEdBQUEsRUFBSyw0Q0FOTDtHQUpKLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLGFBQUQsR0FBQTtBQUNiLFFBQUEsb0JBQUE7QUFBQSxJQUFBLG9CQUFBLEdBQ0k7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFWO0FBQUEsTUFDQSxrQkFBQSxFQUFvQixtQkFEcEI7QUFBQSxNQU1BLGlCQUFBLEVBQW1CLENBTm5CO0FBQUEsTUFPQSxvQkFBQSxFQUFzQixLQVB0QjtBQUFBLE1BVUEsY0FBQSxFQUFnQixTQUFDLElBQUQsR0FBQTtBQUNaLFlBQUEsNkZBQUE7QUFBQSxRQURjLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFDdkQsQ0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBVixDQUFBO0FBQUEsUUFDQSxRQUFBLEdBQVcsYUFBYSxDQUFDLGNBQWQsQ0FBNkIsT0FBN0IsQ0FEWCxDQUFBO0FBQUEsUUFFQSxNQUFBLEdBQVMsYUFBYSxDQUFDLG1CQUFkLENBQWtDLFFBQWxDLENBRlQsQ0FBQTtBQUdBLFFBQUEsSUFBTyxjQUFQO0FBQ0ksaUJBQU8sSUFBUCxDQURKO1NBSEE7QUFBQSxRQU1BLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUN6QixDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUR5QixFQUV6QixjQUZ5QixDQUF0QixDQU5QLENBQUE7QUFBQSxRQVdBLEtBQUEsR0FBUSxPQUFRLENBQUEsUUFBQSxDQVhoQixDQUFBO0FBWUEsUUFBQSxJQUFHLEtBQUg7QUFDSSxVQUFBLE1BQUEsNkNBQTRCLENBQUEsQ0FBQSxXQUFuQixJQUF5QixFQUFsQyxDQURKO1NBQUEsTUFBQTtBQUdJLFVBQUEsTUFBQSxHQUFTLElBQVQsQ0FISjtTQVpBO0FBa0JBLFFBQUEsSUFBRyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsTUFBbkIsR0FBNEIsTUFBTSxDQUFDLE1BQXRDO0FBQ0ksaUJBQU8sSUFBUCxDQURKO1NBbEJBO0FBcUJBLFFBQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxNQUFkLEdBQXVCLENBQTFCO0FBQ0ksaUJBQU8sSUFBUCxDQURKO1NBckJBO0FBQUEsUUF3QkEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQ0FBWixFQUNJLElBREosRUFDVSxjQURWLEVBQzBCLE1BRDFCLENBeEJBLENBQUE7QUEyQkEsZUFBVyxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsR0FBQTtpQkFDZixNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixFQUF3QixTQUFDLEtBQUQsR0FBQTtBQUNwQixnQkFBQSxvREFBQTtBQUFBLFlBRHNCLGdCQUFBLFNBQVMscUJBQUEsY0FBYyxtQkFBQSxVQUM3QyxDQUFBO0FBQUEsWUFBQSxpQkFBQSxHQUFvQixNQUFNLENBQUMsS0FBUCxDQUFhLFlBQWIsRUFBMkIsVUFBM0IsQ0FBcEIsQ0FBQTtBQUFBLFlBRUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxLQUFELEdBQUE7cUJBQ2xCO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLEtBQU47QUFBQSxnQkFDQSxpQkFBQSxFQUFtQixpQkFEbkI7QUFBQSxnQkFFQSxRQUFBLEVBQVUsUUFGVjtnQkFEa0I7WUFBQSxDQUFaLENBRlYsQ0FBQTttQkFPQSxPQUFBLENBQVEsT0FBUixFQVJvQjtVQUFBLENBQXhCLEVBRGU7UUFBQSxDQUFSLENBQVgsQ0E1Qlk7TUFBQSxDQVZoQjtLQURKLENBQUE7QUFrREEsV0FBTyxvQkFBUCxDQW5EYTtFQUFBLENBYmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/autocomplete-provider.coffee
