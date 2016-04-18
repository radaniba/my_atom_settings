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
      if (editor.getGrammar().scopeName === 'source.python') {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9oeXBlcmNsaWNrLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FETixDQUFBOztBQUFBLEVBRUMsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1Qix3QkFGRCxDQUFBOztBQUFBLEVBR0MsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBSEQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxDQUFWO0FBQUEsSUFFQSxZQUFBLEVBQWMscUJBRmQ7QUFBQSxJQUlBLGtCQUFBLEVBQW9CLEVBQUEsR0FBRyxRQUFRLENBQUMsa0JBQVosR0FBK0IsNk5BSm5EO0FBQUEsSUFNQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ1YsYUFBTyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsS0FBeEMsQ0FBOEMsQ0FBQyxNQUF0RCxDQURVO0lBQUEsQ0FOWjtBQUFBLElBU0Esb0JBQUEsRUFBc0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEtBQWYsR0FBQTtBQUNwQixVQUFBLHlFQUFBO0FBQUEsTUFBQSxJQUFHLElBQUEsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLEdBQWpCO0FBQ0UsY0FBQSxDQURGO09BQUE7QUFFQSxNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQXBCLEtBQWlDLGVBQXBDO0FBQ0UsUUFBQSxjQUFBLEdBQWlCLEtBQUssQ0FBQyxLQUF2QixDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUNoQixjQURnQixDQURsQixDQUFBO0FBQUEsUUFHQSxVQUFBLEdBQWEsZUFBZSxDQUFDLGFBQWhCLENBQUEsQ0FIYixDQUFBO0FBQUEsUUFJQSxrQkFBQSxHQUFxQixRQUFRLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsa0JBQWpCLENBSnJCLENBQUE7QUFLQSxRQUFBLElBQUcsd0JBQUEsQ0FBeUIsa0JBQXpCLEVBQTZDLFVBQTdDLENBQUg7QUFDRSxnQkFBQSxDQURGO1NBTEE7QUFRQSxRQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO0FBQ0UsVUFBQSxHQUFHLENBQUMsS0FBSixDQUFVLEtBQUssQ0FBQyxLQUFoQixFQUF1QixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEtBQTFCLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsR0FBRyxDQUFDLEtBQUosQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssQ0FBQyxHQUExQixDQUFyQixDQURBLENBREY7U0FSQTtBQUFBLFFBV0EsUUFBQSxHQUFXLFNBQUEsR0FBQTtpQkFDVCxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxjQUFoQyxFQURTO1FBQUEsQ0FYWCxDQUFBO0FBYUEsZUFBTztBQUFBLFVBQUMsT0FBQSxLQUFEO0FBQUEsVUFBUSxVQUFBLFFBQVI7U0FBUCxDQWRGO09BSG9CO0lBQUEsQ0FUdEI7R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/hyperclick-provider.coffee
