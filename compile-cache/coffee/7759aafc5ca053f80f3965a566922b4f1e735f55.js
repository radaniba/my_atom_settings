(function() {
  var CompositeDisposable, PythonIndent;

  CompositeDisposable = require('atom').CompositeDisposable;

  PythonIndent = require('./python-indent');

  module.exports = {
    config: {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQURmLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDJDQUZiO0FBQUEsUUFHQSxNQUFBLEVBQU0sQ0FDSixDQURJLEVBRUosQ0FGSSxDQUhOO09BREY7S0FERjtBQUFBLElBU0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxZQUFBLENBQUEsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQURqQixDQUFBO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7QUFBQSxRQUFBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxZQUFZLENBQUMsY0FBZCxDQUE2QixLQUE3QixFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEI7T0FBdEMsQ0FBbkIsRUFIUTtJQUFBLENBVFY7QUFBQSxJQWNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0FkWjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/main.coffee
