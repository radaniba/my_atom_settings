(function() {
  var iconHTML, regexes, _;

  _ = require('lodash');

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
            matches = _.map(matches, function(match) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVksWUFBQSxHQUFZLFNBQVosR0FBc0IsNENBRGxDLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBRUk7QUFBQSxJQUFBLENBQUEsRUFBRyx1QkFBSDtBQUFBLElBR0EsTUFBQSxFQUFRLCtDQUhSO0FBQUEsSUFNQSxHQUFBLEVBQUssNENBTkw7R0FMSixDQUFBOztBQUFBLEVBY0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxhQUFELEdBQUE7QUFDYixRQUFBLG9CQUFBO0FBQUEsSUFBQSxvQkFBQSxHQUNJO0FBQUEsTUFBQSxRQUFBLEVBQVUsU0FBVjtBQUFBLE1BQ0Esa0JBQUEsRUFBb0IsbUJBRHBCO0FBQUEsTUFNQSxpQkFBQSxFQUFtQixDQU5uQjtBQUFBLE1BT0Esb0JBQUEsRUFBc0IsS0FQdEI7QUFBQSxNQVVBLGNBQUEsRUFBZ0IsU0FBQyxJQUFELEdBQUE7QUFDWixZQUFBLDZGQUFBO0FBQUEsUUFEYyxjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BQ3ZELENBQUE7QUFBQSxRQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQVYsQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFXLGFBQWEsQ0FBQyxjQUFkLENBQTZCLE9BQTdCLENBRFgsQ0FBQTtBQUFBLFFBRUEsTUFBQSxHQUFTLGFBQWEsQ0FBQyxtQkFBZCxDQUFrQyxRQUFsQyxDQUZULENBQUE7QUFHQSxRQUFBLElBQU8sY0FBUDtBQUNJLGlCQUFPLElBQVAsQ0FESjtTQUhBO0FBQUEsUUFNQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FDekIsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FEeUIsRUFFekIsY0FGeUIsQ0FBdEIsQ0FOUCxDQUFBO0FBQUEsUUFXQSxLQUFBLEdBQVEsT0FBUSxDQUFBLFFBQUEsQ0FYaEIsQ0FBQTtBQVlBLFFBQUEsSUFBRyxLQUFIO0FBQ0ksVUFBQSxNQUFBLDZDQUE0QixDQUFBLENBQUEsV0FBbkIsSUFBeUIsRUFBbEMsQ0FESjtTQUFBLE1BQUE7QUFHSSxVQUFBLE1BQUEsR0FBUyxJQUFULENBSEo7U0FaQTtBQWtCQSxRQUFBLElBQUcsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLE1BQW5CLEdBQTRCLE1BQU0sQ0FBQyxNQUF0QztBQUNJLGlCQUFPLElBQVAsQ0FESjtTQWxCQTtBQXFCQSxRQUFBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFhLENBQUMsTUFBZCxHQUF1QixDQUExQjtBQUNJLGlCQUFPLElBQVAsQ0FESjtTQXJCQTtBQUFBLFFBd0JBLE9BQU8sQ0FBQyxHQUFSLENBQVksZ0NBQVosRUFDSSxJQURKLEVBQ1UsY0FEVixFQUMwQixNQUQxQixDQXhCQSxDQUFBO0FBMkJBLGVBQVcsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEdBQUE7aUJBQ2YsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEIsRUFBd0IsU0FBQyxLQUFELEdBQUE7QUFDcEIsZ0JBQUEsb0RBQUE7QUFBQSxZQURzQixnQkFBQSxTQUFTLHFCQUFBLGNBQWMsbUJBQUEsVUFDN0MsQ0FBQTtBQUFBLFlBQUEsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLEtBQVAsQ0FBYSxZQUFiLEVBQTJCLFVBQTNCLENBQXBCLENBQUE7QUFBQSxZQUVBLE9BQUEsR0FBVSxDQUFDLENBQUMsR0FBRixDQUFNLE9BQU4sRUFBZSxTQUFDLEtBQUQsR0FBQTtxQkFDckI7QUFBQSxnQkFBQSxJQUFBLEVBQU0sS0FBTjtBQUFBLGdCQUNBLGlCQUFBLEVBQW1CLGlCQURuQjtBQUFBLGdCQUVBLFFBQUEsRUFBVSxRQUZWO2dCQURxQjtZQUFBLENBQWYsQ0FGVixDQUFBO21CQU9BLE9BQUEsQ0FBUSxPQUFSLEVBUm9CO1VBQUEsQ0FBeEIsRUFEZTtRQUFBLENBQVIsQ0FBWCxDQTVCWTtNQUFBLENBVmhCO0tBREosQ0FBQTtBQWtEQSxXQUFPLG9CQUFQLENBbkRhO0VBQUEsQ0FkakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/autocomplete-provider.coffee
