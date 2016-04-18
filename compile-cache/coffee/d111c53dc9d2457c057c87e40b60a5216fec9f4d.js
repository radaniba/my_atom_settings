(function() {
  var CompositeDisposable, PythonIndent;

  CompositeDisposable = require('atom').CompositeDisposable;

  PythonIndent = require('./python-indent');

  module.exports = {
    config: {
      openingDelimiterIndentRegex: {
        type: 'string',
        "default": '^.*(\\(|\\[).*,\\s*$',
        description: 'Regular Expression for _aligned with opening delimiter_ continuation indent type, and used for determining when this type of indent should be _started_.'
      },
      openingDelimiterUnindentRegex: {
        type: 'string',
        "default": '^\\s+\\S*(\\)|\\])\\s*:?\\s*$',
        description: 'Regular Expression for _aligned with opening delimiter_ continuation indent type, and used for determining when this type of indent should be _ended_.'
      },
      hangingIndentRegex: {
        type: 'string',
        "default": '^.*(\\(|\\[)\\s*$',
        description: 'Regular Expression for _hanging indent_ used for determining when this type of indent should be _started_.'
      },
      hangingIndentTabs: {
        type: 'number',
        "default": 1,
        description: 'Number of tabs used for _hanging_ indents',
        "enum": [1, 2]
      }
    },
    activate: function() {
      this.pythonIndent = new PythonIndent();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'editor:newline': (function(_this) {
          return function() {
            return _this.pythonIndent.properlyIndent(event);
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQURmLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLDJCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsc0JBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwwSkFGYjtPQURGO0FBQUEsTUFJQSw2QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLCtCQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsd0pBRmI7T0FMRjtBQUFBLE1BUUEsa0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxtQkFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDRHQUZiO09BVEY7QUFBQSxNQVlBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDJDQUZiO0FBQUEsUUFHQSxNQUFBLEVBQU0sQ0FDSixDQURJLEVBRUosQ0FGSSxDQUhOO09BYkY7S0FERjtBQUFBLElBcUJBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsWUFBQSxDQUFBLENBQXBCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTthQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsWUFBWSxDQUFDLGNBQWQsQ0FBNkIsS0FBN0IsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO09BQXRDLENBQW5CLEVBSFE7SUFBQSxDQXJCVjtBQUFBLElBMEJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0ExQlo7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/main.coffee
