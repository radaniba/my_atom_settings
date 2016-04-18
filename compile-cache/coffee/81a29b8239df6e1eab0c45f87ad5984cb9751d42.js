(function() {
  var AnnotationManager, MethodProvider, PropertyProvider;

  MethodProvider = require('./method-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  module.exports = AnnotationManager = (function() {
    function AnnotationManager() {}

    AnnotationManager.prototype.providers = [];


    /**
     * Initializes the tooltip providers.
     */

    AnnotationManager.prototype.init = function() {
      var provider, _i, _len, _ref, _results;
      this.providers.push(new MethodProvider());
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

    AnnotationManager.prototype.deactivate = function() {
      var provider, _i, _len, _ref, _results;
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.deactivate());
      }
      return _results;
    };

    return AnnotationManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vYW5ub3RhdGlvbi1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtREFBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDBCQUFSLENBQWpCLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBRU07bUNBQ0Y7O0FBQUEsZ0NBQUEsU0FBQSxHQUFXLEVBQVgsQ0FBQTs7QUFFQTtBQUFBOztPQUZBOztBQUFBLGdDQUtBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDRixVQUFBLGtDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxjQUFBLENBQUEsQ0FBcEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCLENBREEsQ0FBQTtBQUdBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQUFBLENBREo7QUFBQTtzQkFKRTtJQUFBLENBTE4sQ0FBQTs7QUFZQTtBQUFBOztPQVpBOztBQUFBLGdDQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixVQUFBLGtDQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzRCQUFBO0FBQ0ksc0JBQUEsUUFBUSxDQUFDLFVBQVQsQ0FBQSxFQUFBLENBREo7QUFBQTtzQkFEUTtJQUFBLENBZlosQ0FBQTs7NkJBQUE7O01BTkosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/annotation/annotation-manager.coffee
