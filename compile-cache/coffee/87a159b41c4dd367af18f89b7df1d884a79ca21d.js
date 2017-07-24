(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry, scopeFromFileName;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

  scopeFromFileName = require('../scope-from-file-name');

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var colorVariables, registry, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, this.bufferPath = config.bufferPath, registry = config.registry;
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
      var lastIndex, result, scope;
      if (this.bufferPath == null) {
        return;
      }
      scope = scopeFromFileName(this.bufferPath);
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, scope, lastIndex)) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItY29sb3JzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlIQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBRmxCLENBQUE7O0FBQUEsRUFHQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FIdEIsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx5QkFBUixDQUpwQixDQUFBOztBQUFBLEVBS0EsZUFBQSxHQUFrQixHQUxsQixDQUFBOztBQUFBLEVBT007QUFDUyxJQUFBLDZCQUFDLE1BQUQsR0FBQTtBQUNYLFVBQUEsbUNBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsbUJBQUEsU0FBVixFQUFxQix3QkFBQSxjQUFyQixFQUFxQyxJQUFDLENBQUEsb0JBQUEsVUFBdEMsRUFBa0Qsa0JBQUEsUUFBbEQsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLG1CQUFtQixDQUFDLFdBQXBCLENBQWdDLFFBQWhDLEVBQTBDLGVBQTFDLENBRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQUMsV0FBQSxTQUFEO0FBQUEsUUFBWSxnQkFBQSxjQUFaO0FBQUEsUUFBNEIsYUFBQSxFQUFlLElBQUMsQ0FBQSxVQUE1QztBQUFBLFFBQXdELFVBQUEsUUFBeEQ7T0FBYixDQUZmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxZQUFBLENBQWE7QUFBQSxRQUFFLFNBQUQsSUFBQyxDQUFBLE9BQUY7T0FBYixDQUhmLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFKWCxDQURXO0lBQUEsQ0FBYjs7QUFBQSxrQ0FPQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osVUFBQSx3QkFBQTtBQUFBLE1BQUEsSUFBYyx1QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsaUJBQUEsQ0FBa0IsSUFBQyxDQUFBLFVBQW5CLENBRFIsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLENBRlosQ0FBQTtBQUdBLGFBQU0sTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsTUFBakIsRUFBeUIsS0FBekIsRUFBZ0MsU0FBaEMsQ0FBZixHQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxNQUFkLENBQUEsQ0FBQTtBQUVBLFFBQUEsSUFBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULElBQW1CLGVBQXJDO0FBQUEsVUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtTQUZBO0FBQUEsUUFHQyxZQUFhLE9BQWIsU0FIRCxDQURGO01BQUEsQ0FIQTthQVNBLElBQUMsQ0FBQSxXQUFELENBQUEsRUFWSTtJQUFBLENBUE4sQ0FBQTs7QUFBQSxrQ0FtQkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQSxDQUFLLDBCQUFMLEVBQWlDLElBQUMsQ0FBQSxPQUFsQyxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBRkE7SUFBQSxDQW5CYixDQUFBOzsrQkFBQTs7TUFSRixDQUFBOztBQUFBLEVBK0JBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRCxHQUFBO1dBQ1gsSUFBQSxtQkFBQSxDQUFvQixNQUFwQixDQUEyQixDQUFDLElBQTVCLENBQUEsRUFEVztFQUFBLENBL0JqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/tasks/scan-buffer-colors-handler.coffee
