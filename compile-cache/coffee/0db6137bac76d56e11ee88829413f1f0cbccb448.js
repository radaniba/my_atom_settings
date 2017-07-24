(function() {
  var Selector, log, provider, selectorsMatchScopeChain;

  provider = require('./provider');

  log = require('./log');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: "" + provider.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name",
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = Selector.create(this.disableForSelector);
        if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          log.debug(range.start, this._getScopes(editor, range.start));
          log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = function() {
          return provider.goToDefinition(editor, bufferPosition);
        };
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9oeXBlcmNsaWNrLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FETixDQUFBOztBQUFBLEVBRUMsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1Qix3QkFGRCxDQUFBOztBQUFBLEVBR0MsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBSEQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxDQUFWO0FBQUEsSUFFQSxZQUFBLEVBQWMscUJBRmQ7QUFBQSxJQUlBLGtCQUFBLEVBQW9CLEVBQUEsR0FBRyxRQUFRLENBQUMsa0JBQVosR0FBK0IsNk5BSm5EO0FBQUEsSUFNQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ1YsYUFBTyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsS0FBeEMsQ0FBOEMsQ0FBQyxNQUF0RCxDQURVO0lBQUEsQ0FOWjtBQUFBLElBU0Esb0JBQUEsRUFBc0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEtBQWYsR0FBQTtBQUNwQixVQUFBLHlFQUFBO0FBQUEsTUFBQSxJQUFHLElBQUEsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLEdBQWpCO0FBQ0UsY0FBQSxDQURGO09BQUE7QUFFQSxNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUE5QixDQUFzQyxlQUF0QyxDQUFBLEdBQXlELENBQUEsQ0FBNUQ7QUFDRSxRQUFBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLEtBQXZCLENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLGNBRGdCLENBRGxCLENBQUE7QUFBQSxRQUdBLFVBQUEsR0FBYSxlQUFlLENBQUMsYUFBaEIsQ0FBQSxDQUhiLENBQUE7QUFBQSxRQUlBLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxrQkFBakIsQ0FKckIsQ0FBQTtBQUtBLFFBQUEsSUFBRyx3QkFBQSxDQUF5QixrQkFBekIsRUFBNkMsVUFBN0MsQ0FBSDtBQUNFLGdCQUFBLENBREY7U0FMQTtBQVFBLFFBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQUg7QUFDRSxVQUFBLEdBQUcsQ0FBQyxLQUFKLENBQVUsS0FBSyxDQUFDLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsS0FBMUIsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxHQUFHLENBQUMsS0FBSixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEdBQTFCLENBQXJCLENBREEsQ0FERjtTQVJBO0FBQUEsUUFXQSxRQUFBLEdBQVcsU0FBQSxHQUFBO2lCQUNULFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLEVBQWdDLGNBQWhDLEVBRFM7UUFBQSxDQVhYLENBQUE7QUFhQSxlQUFPO0FBQUEsVUFBQyxPQUFBLEtBQUQ7QUFBQSxVQUFRLFVBQUEsUUFBUjtTQUFQLENBZEY7T0FIb0I7SUFBQSxDQVR0QjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/hyperclick-provider.coffee
