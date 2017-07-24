(function() {
  var BufferVariablesScanner, ColorContext, ExpressionsRegistry, VariableExpression, VariableScanner, VariablesChunkSize;

  VariableScanner = require('../variable-scanner');

  ColorContext = require('../color-context');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  VariablesChunkSize = 100;

  BufferVariablesScanner = (function() {
    function BufferVariablesScanner(config) {
      var registry, scope;
      this.buffer = config.buffer, registry = config.registry, scope = config.scope;
      registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
      this.scanner = new VariableScanner({
        registry: registry,
        scope: scope
      });
      this.results = [];
    }

    BufferVariablesScanner.prototype.scan = function() {
      var lastIndex, results;
      lastIndex = 0;
      while (results = this.scanner.search(this.buffer, lastIndex)) {
        this.results = this.results.concat(results);
        if (this.results.length >= VariablesChunkSize) {
          this.flushVariables();
        }
        lastIndex = results.lastIndex;
      }
      return this.flushVariables();
    };

    BufferVariablesScanner.prototype.flushVariables = function() {
      emit('scan-buffer:variables-found', this.results);
      return this.results = [];
    };

    return BufferVariablesScanner;

  })();

  module.exports = function(config) {
    return new BufferVariablesScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItdmFyaWFibGVzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBRUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBRnJCLENBQUE7O0FBQUEsRUFHQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FIdEIsQ0FBQTs7QUFBQSxFQUtBLGtCQUFBLEdBQXFCLEdBTHJCLENBQUE7O0FBQUEsRUFPTTtBQUNTLElBQUEsZ0NBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxlQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLGtCQUFBLFFBQVYsRUFBb0IsZUFBQSxLQUFwQixDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsa0JBQTFDLENBRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLGVBQUEsQ0FBZ0I7QUFBQSxRQUFDLFVBQUEsUUFBRDtBQUFBLFFBQVcsT0FBQSxLQUFYO09BQWhCLENBRmYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUhYLENBRFc7SUFBQSxDQUFiOztBQUFBLHFDQU1BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLGtCQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO0FBQ0EsYUFBTSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixTQUF6QixDQUFoQixHQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixPQUFoQixDQUFYLENBQUE7QUFFQSxRQUFBLElBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixrQkFBeEM7QUFBQSxVQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO1NBRkE7QUFBQSxRQUdDLFlBQWEsUUFBYixTQUhELENBREY7TUFBQSxDQURBO2FBT0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQVJJO0lBQUEsQ0FOTixDQUFBOztBQUFBLHFDQWdCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLE1BQUEsSUFBQSxDQUFLLDZCQUFMLEVBQW9DLElBQUMsQ0FBQSxPQUFyQyxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBRkc7SUFBQSxDQWhCaEIsQ0FBQTs7a0NBQUE7O01BUkYsQ0FBQTs7QUFBQSxFQTRCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE1BQUQsR0FBQTtXQUNYLElBQUEsc0JBQUEsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBLEVBRFc7RUFBQSxDQTVCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/tasks/scan-buffer-variables-handler.coffee
