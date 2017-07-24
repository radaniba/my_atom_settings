(function() {
  var ExpressionsRegistry, PathScanner, VariableExpression, VariableScanner, async, fs;

  async = require('async');

  fs = require('fs');

  VariableScanner = require('../variable-scanner');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  PathScanner = (function() {
    function PathScanner(filePath, scope, registry) {
      this.filePath = filePath;
      this.scanner = new VariableScanner({
        registry: registry,
        scope: scope
      });
    }

    PathScanner.prototype.load = function(done) {
      var currentChunk, currentLine, currentOffset, lastIndex, line, readStream, results;
      currentChunk = '';
      currentLine = 0;
      currentOffset = 0;
      lastIndex = 0;
      line = 0;
      results = [];
      readStream = fs.createReadStream(this.filePath);
      readStream.on('data', (function(_this) {
        return function(chunk) {
          var index, lastLine, result, v, _i, _len;
          currentChunk += chunk.toString();
          index = lastIndex;
          while (result = _this.scanner.search(currentChunk, lastIndex)) {
            result.range[0] += index;
            result.range[1] += index;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.path = _this.filePath;
              v.range[0] += index;
              v.range[1] += index;
              v.definitionRange = result.range;
              v.line += line;
              lastLine = v.line;
            }
            results = results.concat(result);
            lastIndex = result.lastIndex;
          }
          if (result != null) {
            currentChunk = currentChunk.slice(lastIndex);
            line = lastLine;
            return lastIndex = 0;
          }
        };
      })(this));
      return readStream.on('end', function() {
        emit('scan-paths:path-scanned', results);
        return done();
      });
    };

    return PathScanner;

  })();

  module.exports = function(_arg) {
    var paths, registry;
    paths = _arg[0], registry = _arg[1];
    registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
    return async.each(paths, function(_arg1, next) {
      var p, s;
      p = _arg1[0], s = _arg1[1];
      return new PathScanner(p, s, registry).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1wYXRocy1oYW5kbGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnRkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxFQUdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQUhyQixDQUFBOztBQUFBLEVBSUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBSnRCLENBQUE7O0FBQUEsRUFNTTtBQUNTLElBQUEscUJBQUUsUUFBRixFQUFZLEtBQVosRUFBbUIsUUFBbkIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsZUFBQSxDQUFnQjtBQUFBLFFBQUMsVUFBQSxRQUFEO0FBQUEsUUFBVyxPQUFBLEtBQVg7T0FBaEIsQ0FBZixDQURXO0lBQUEsQ0FBYjs7QUFBQSwwQkFHQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixVQUFBLDhFQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsRUFBZixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsQ0FEZCxDQUFBO0FBQUEsTUFFQSxhQUFBLEdBQWdCLENBRmhCLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxDQUhaLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxDQUpQLENBQUE7QUFBQSxNQUtBLE9BQUEsR0FBVSxFQUxWLENBQUE7QUFBQSxNQU9BLFVBQUEsR0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/tasks/scan-paths-handler.coffee
