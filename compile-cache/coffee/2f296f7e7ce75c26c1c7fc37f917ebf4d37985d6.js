(function() {
  var ClassProvider, FunctionProvider, PropertyProvider, TooltipManager;

  ClassProvider = require('./class-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  module.exports = TooltipManager = (function() {
    function TooltipManager() {}

    TooltipManager.prototype.providers = [];


    /**
     * Initializes the tooltip providers.
     */

    TooltipManager.prototype.init = function() {
      var provider, _i, _len, _ref, _results;
      this.providers.push(new ClassProvider());
      this.providers.push(new FunctionProvider());
      this.providers.push(new PropertyProvider());
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.init(this));
      }
      return _results;
    };


    /**
     * Deactivates the tooltip providers.
     */

    TooltipManager.prototype.deactivate = function() {
      var provider, _i, _len, _ref, _results;
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.deactivate());
      }
      return _results;
    };

    return TooltipManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvdG9vbHRpcC1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHlCQUFSLENBQWhCLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUixDQUZuQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtnQ0FDRjs7QUFBQSw2QkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUVBO0FBQUE7O09BRkE7O0FBQUEsNkJBS0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNGLFVBQUEsa0NBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGFBQUEsQ0FBQSxDQUFwQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCLENBRkEsQ0FBQTtBQUlBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQUFBLENBREo7QUFBQTtzQkFMRTtJQUFBLENBTE4sQ0FBQTs7QUFhQTtBQUFBOztPQWJBOztBQUFBLDZCQWdCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsVUFBQSxrQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxVQUFULENBQUEsRUFBQSxDQURKO0FBQUE7c0JBRFE7SUFBQSxDQWhCWixDQUFBOzswQkFBQTs7TUFQSixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/tooltip/tooltip-manager.coffee
