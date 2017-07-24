(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var colorVariables, registry, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, this.bufferPath = config.bufferPath, this.scope = config.scope, registry = config.registry;
      registry = ExpressionsRegistry.deserialize(registry, ColorExpression);
      this.context = new ColorContext({
        variables: variables,
        colorVariables: colorVariables,
        referencePath: this.bufferPath,
        registry: registry
      });
      this.scanner = new ColorScanner({
        context: this.context
      });
      this.results = [];
    }

    BufferColorsScanner.prototype.scan = function() {
      var lastIndex, result;
      if (this.bufferPath == null) {
        return;
      }
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, this.scope, lastIndex)) {
        this.results.push(result);
        if (this.results.length >= ColorsChunkSize) {
          this.flushColors();
        }
        lastIndex = result.lastIndex;
      }
      return this.flushColors();
    };

    BufferColorsScanner.prototype.flushColors = function() {
      emit('scan-buffer:colors-found', this.results);
      return this.results = [];
    };

    return BufferColorsScanner;

  })();

  module.exports = function(config) {
    return new BufferColorsScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItY29sb3JzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNHQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBRmxCLENBQUE7O0FBQUEsRUFHQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FIdEIsQ0FBQTs7QUFBQSxFQUlBLGVBQUEsR0FBa0IsR0FKbEIsQ0FBQTs7QUFBQSxFQU1NO0FBQ1MsSUFBQSw2QkFBQyxNQUFELEdBQUE7QUFDWCxVQUFBLG1DQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLG1CQUFBLFNBQVYsRUFBcUIsd0JBQUEsY0FBckIsRUFBcUMsSUFBQyxDQUFBLG9CQUFBLFVBQXRDLEVBQWtELElBQUMsQ0FBQSxlQUFBLEtBQW5ELEVBQTBELGtCQUFBLFFBQTFELENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxtQkFBbUIsQ0FBQyxXQUFwQixDQUFnQyxRQUFoQyxFQUEwQyxlQUExQyxDQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxZQUFBLENBQWE7QUFBQSxRQUFDLFdBQUEsU0FBRDtBQUFBLFFBQVksZ0JBQUEsY0FBWjtBQUFBLFFBQTRCLGFBQUEsRUFBZSxJQUFDLENBQUEsVUFBNUM7QUFBQSxRQUF3RCxVQUFBLFFBQXhEO09BQWIsQ0FGZixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsWUFBQSxDQUFhO0FBQUEsUUFBRSxTQUFELElBQUMsQ0FBQSxPQUFGO09BQWIsQ0FIZixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBSlgsQ0FEVztJQUFBLENBQWI7O0FBQUEsa0NBT0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsaUJBQUE7QUFBQSxNQUFBLElBQWMsdUJBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLENBRFosQ0FBQTtBQUVBLGFBQU0sTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsTUFBakIsRUFBeUIsSUFBQyxDQUFBLEtBQTFCLEVBQWlDLFNBQWpDLENBQWYsR0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZCxDQUFBLENBQUE7QUFFQSxRQUFBLElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixlQUFyQztBQUFBLFVBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7U0FGQTtBQUFBLFFBR0MsWUFBYSxPQUFiLFNBSEQsQ0FERjtNQUFBLENBRkE7YUFRQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBVEk7SUFBQSxDQVBOLENBQUE7O0FBQUEsa0NBa0JBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLElBQUEsQ0FBSywwQkFBTCxFQUFpQyxJQUFDLENBQUEsT0FBbEMsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUZBO0lBQUEsQ0FsQmIsQ0FBQTs7K0JBQUE7O01BUEYsQ0FBQTs7QUFBQSxFQTZCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE1BQUQsR0FBQTtXQUNYLElBQUEsbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFBLEVBRFc7RUFBQSxDQTdCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/tasks/scan-buffer-colors-handler.coffee
