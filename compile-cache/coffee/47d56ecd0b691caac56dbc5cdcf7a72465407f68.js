(function() {
  var AutocompletionManager, ClassProvider, ConstantProvider, FunctionProvider, MemberProvider, VariableProvider;

  ClassProvider = require('./class-provider.coffee');

  MemberProvider = require('./member-provider.coffee');

  ConstantProvider = require('./constant-provider.coffee');

  VariableProvider = require('./variable-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  module.exports = AutocompletionManager = (function() {
    function AutocompletionManager() {}

    AutocompletionManager.prototype.providers = [];


    /**
     * Initializes the autocompletion providers.
     */

    AutocompletionManager.prototype.init = function() {
      var provider, _i, _len, _ref, _results;
      this.providers.push(new ConstantProvider());
      this.providers.push(new VariableProvider());
      this.providers.push(new FunctionProvider());
      this.providers.push(new ClassProvider());
      this.providers.push(new MemberProvider());
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.init(this));
      }
      return _results;
    };


    /**
     * Deactivates the autocompletion providers.
     */

    AutocompletionManager.prototype.deactivate = function() {
      var provider, _i, _len, _ref, _results;
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.deactivate());
      }
      return _results;
    };


    /**
     * Deactivates the autocompletion providers.
     */

    AutocompletionManager.prototype.getProviders = function() {
      return this.providers;
    };

    return AutocompletionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL2F1dG9jb21wbGV0aW9uLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBHQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEseUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDBCQUFSLENBRGpCLENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVIsQ0FGbkIsQ0FBQTs7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUixDQUhuQixDQUFBOztBQUFBLEVBSUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSLENBSm5CLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUVNO3VDQUNGOztBQUFBLG9DQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBRUE7QUFBQTs7T0FGQTs7QUFBQSxvQ0FLQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0YsVUFBQSxrQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsZ0JBQUEsQ0FBQSxDQUFwQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsYUFBQSxDQUFBLENBQXBCLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsY0FBQSxDQUFBLENBQXBCLENBSkEsQ0FBQTtBQU1BO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQUFBLENBREo7QUFBQTtzQkFQRTtJQUFBLENBTE4sQ0FBQTs7QUFlQTtBQUFBOztPQWZBOztBQUFBLG9DQWtCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsVUFBQSxrQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxVQUFULENBQUEsRUFBQSxDQURKO0FBQUE7c0JBRFE7SUFBQSxDQWxCWixDQUFBOztBQXNCQTtBQUFBOztPQXRCQTs7QUFBQSxvQ0F5QkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxVQURTO0lBQUEsQ0F6QmQsQ0FBQTs7aUNBQUE7O01BVEosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/autocompletion-manager.coffee
