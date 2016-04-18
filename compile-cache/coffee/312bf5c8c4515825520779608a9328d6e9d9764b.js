(function() {
  var EscapeCharacterRegex, cachedMatchesBySelector, getCachedMatch, parseScopeChain, selectorForScopeChain, selectorsMatchScopeChain, setCachedMatch, slick;

  slick = require('atom-slick');

  EscapeCharacterRegex = /[-!"#$%&'*+,/:;=?@|^~()<>{}[\]]/g;

  cachedMatchesBySelector = new WeakMap;

  getCachedMatch = function(selector, scopeChain) {
    var cachedMatchesByScopeChain;
    if (cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector)) {
      return cachedMatchesByScopeChain[scopeChain];
    }
  };

  setCachedMatch = function(selector, scopeChain, match) {
    var cachedMatchesByScopeChain;
    if (!(cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector))) {
      cachedMatchesByScopeChain = {};
      cachedMatchesBySelector.set(selector, cachedMatchesByScopeChain);
    }
    return cachedMatchesByScopeChain[scopeChain] = match;
  };

  parseScopeChain = function(scopeChain) {
    var scope, _i, _len, _ref, _ref1, _results;
    scopeChain = scopeChain.replace(EscapeCharacterRegex, function(match) {
      return "\\" + match[0];
    });
    _ref1 = (_ref = slick.parse(scopeChain)[0]) != null ? _ref : [];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      scope = _ref1[_i];
      _results.push(scope);
    }
    return _results;
  };

  selectorForScopeChain = function(selectors, scopeChain) {
    var cachedMatch, scopes, selector, _i, _len;
    for (_i = 0, _len = selectors.length; _i < _len; _i++) {
      selector = selectors[_i];
      cachedMatch = getCachedMatch(selector, scopeChain);
      if (cachedMatch != null) {
        if (cachedMatch) {
          return selector;
        } else {
          continue;
        }
      } else {
        scopes = parseScopeChain(scopeChain);
        while (scopes.length > 0) {
          if (selector.matches(scopes)) {
            setCachedMatch(selector, scopeChain, true);
            return selector;
          }
          scopes.pop();
        }
        setCachedMatch(selector, scopeChain, false);
      }
    }
    return null;
  };

  selectorsMatchScopeChain = function(selectors, scopeChain) {
    return selectorForScopeChain(selectors, scopeChain) != null;
  };

  module.exports = {
    parseScopeChain: parseScopeChain,
    selectorsMatchScopeChain: selectorsMatchScopeChain,
    selectorForScopeChain: selectorForScopeChain
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9zY29wZS1oZWxwZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzSkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsWUFBUixDQUFSLENBQUE7O0FBQUEsRUFFQSxvQkFBQSxHQUF1QixrQ0FGdkIsQ0FBQTs7QUFBQSxFQUlBLHVCQUFBLEdBQTBCLEdBQUEsQ0FBQSxPQUoxQixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixTQUFDLFFBQUQsRUFBVyxVQUFYLEdBQUE7QUFDZixRQUFBLHlCQUFBO0FBQUEsSUFBQSxJQUFHLHlCQUFBLEdBQTRCLHVCQUF1QixDQUFDLEdBQXhCLENBQTRCLFFBQTVCLENBQS9CO0FBQ0UsYUFBTyx5QkFBMEIsQ0FBQSxVQUFBLENBQWpDLENBREY7S0FEZTtFQUFBLENBTmpCLENBQUE7O0FBQUEsRUFVQSxjQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsS0FBdkIsR0FBQTtBQUNmLFFBQUEseUJBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxDQUFPLHlCQUFBLEdBQTRCLHVCQUF1QixDQUFDLEdBQXhCLENBQTRCLFFBQTVCLENBQTVCLENBQVA7QUFDRSxNQUFBLHlCQUFBLEdBQTRCLEVBQTVCLENBQUE7QUFBQSxNQUNBLHVCQUF1QixDQUFDLEdBQXhCLENBQTRCLFFBQTVCLEVBQXNDLHlCQUF0QyxDQURBLENBREY7S0FBQTtXQUdBLHlCQUEwQixDQUFBLFVBQUEsQ0FBMUIsR0FBd0MsTUFKekI7RUFBQSxDQVZqQixDQUFBOztBQUFBLEVBZ0JBLGVBQUEsR0FBa0IsU0FBQyxVQUFELEdBQUE7QUFDaEIsUUFBQSxzQ0FBQTtBQUFBLElBQUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLG9CQUFuQixFQUF5QyxTQUFDLEtBQUQsR0FBQTthQUFZLElBQUEsR0FBSSxLQUFNLENBQUEsQ0FBQSxFQUF0QjtJQUFBLENBQXpDLENBQWIsQ0FBQTtBQUNBO0FBQUE7U0FBQSw0Q0FBQTt3QkFBQTtBQUFBLG9CQUFBLE1BQUEsQ0FBQTtBQUFBO29CQUZnQjtFQUFBLENBaEJsQixDQUFBOztBQUFBLEVBb0JBLHFCQUFBLEdBQXdCLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTtBQUN0QixRQUFBLHVDQUFBO0FBQUEsU0FBQSxnREFBQTsrQkFBQTtBQUNFLE1BQUEsV0FBQSxHQUFjLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFVBQXpCLENBQWQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxtQkFBSDtBQUNFLFFBQUEsSUFBRyxXQUFIO0FBQ0UsaUJBQU8sUUFBUCxDQURGO1NBQUEsTUFBQTtBQUdFLG1CQUhGO1NBREY7T0FBQSxNQUFBO0FBTUUsUUFBQSxNQUFBLEdBQVMsZUFBQSxDQUFnQixVQUFoQixDQUFULENBQUE7QUFDQSxlQUFNLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQXRCLEdBQUE7QUFDRSxVQUFBLElBQUcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsQ0FBSDtBQUNFLFlBQUEsY0FBQSxDQUFlLFFBQWYsRUFBeUIsVUFBekIsRUFBcUMsSUFBckMsQ0FBQSxDQUFBO0FBQ0EsbUJBQU8sUUFBUCxDQUZGO1dBQUE7QUFBQSxVQUdBLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FIQSxDQURGO1FBQUEsQ0FEQTtBQUFBLFFBTUEsY0FBQSxDQUFlLFFBQWYsRUFBeUIsVUFBekIsRUFBcUMsS0FBckMsQ0FOQSxDQU5GO09BRkY7QUFBQSxLQUFBO1dBZ0JBLEtBakJzQjtFQUFBLENBcEJ4QixDQUFBOztBQUFBLEVBdUNBLHdCQUFBLEdBQTJCLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTtXQUN6QixxREFEeUI7RUFBQSxDQXZDM0IsQ0FBQTs7QUFBQSxFQTBDQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsaUJBQUEsZUFBRDtBQUFBLElBQWtCLDBCQUFBLHdCQUFsQjtBQUFBLElBQTRDLHVCQUFBLHFCQUE1QztHQTFDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/scope-helpers.coffee
