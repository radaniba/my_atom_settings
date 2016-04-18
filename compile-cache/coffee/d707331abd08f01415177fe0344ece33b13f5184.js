(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry, path;

  path = require('path');

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

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
      scope = path.extname(this.bufferPath).slice(1);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItY29sb3JzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRHQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUZmLENBQUE7O0FBQUEsRUFHQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQUhsQixDQUFBOztBQUFBLEVBSUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBSnRCLENBQUE7O0FBQUEsRUFLQSxlQUFBLEdBQWtCLEdBTGxCLENBQUE7O0FBQUEsRUFPTTtBQUNTLElBQUEsNkJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxtQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxtQkFBQSxTQUFWLEVBQXFCLHdCQUFBLGNBQXJCLEVBQXFDLElBQUMsQ0FBQSxvQkFBQSxVQUF0QyxFQUFrRCxrQkFBQSxRQUFsRCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsZUFBMUMsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsWUFBQSxDQUFhO0FBQUEsUUFBQyxXQUFBLFNBQUQ7QUFBQSxRQUFZLGdCQUFBLGNBQVo7QUFBQSxRQUE0QixhQUFBLEVBQWUsSUFBQyxDQUFBLFVBQTVDO0FBQUEsUUFBd0QsVUFBQSxRQUF4RDtPQUFiLENBRmYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQUUsU0FBRCxJQUFDLENBQUEsT0FBRjtPQUFiLENBSGYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUpYLENBRFc7SUFBQSxDQUFiOztBQUFBLGtDQU9BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLHdCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsVUFBZCxDQUEwQixTQUFsQyxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksQ0FEWixDQUFBO0FBRUEsYUFBTSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixLQUF6QixFQUFnQyxTQUFoQyxDQUFmLEdBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQsQ0FBQSxDQUFBO0FBRUEsUUFBQSxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsSUFBbUIsZUFBckM7QUFBQSxVQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO1NBRkE7QUFBQSxRQUdDLFlBQWEsT0FBYixTQUhELENBREY7TUFBQSxDQUZBO2FBUUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQVRJO0lBQUEsQ0FQTixDQUFBOztBQUFBLGtDQWtCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFBLENBQUssMEJBQUwsRUFBaUMsSUFBQyxDQUFBLE9BQWxDLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FGQTtJQUFBLENBbEJiLENBQUE7OytCQUFBOztNQVJGLENBQUE7O0FBQUEsRUE4QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFELEdBQUE7V0FDWCxJQUFBLG1CQUFBLENBQW9CLE1BQXBCLENBQTJCLENBQUMsSUFBNUIsQ0FBQSxFQURXO0VBQUEsQ0E5QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/tasks/scan-buffer-colors-handler.coffee
