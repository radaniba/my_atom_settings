(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(paths, registry, callback) {
      var results, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-paths-handler');
      this.task = Task.once(taskPath, [paths, registry.serialize()], (function(_this) {
        return function() {
          _this.task = null;
          return callback(results);
        };
      })(this));
      this.task.on('scan-paths:path-scanned', function(result) {
        return results = results.concat(result);
      });
      return this.task;
    },
    terminateRunningTask: function() {
      var _ref;
      return (_ref = this.task) != null ? _ref.terminate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGF0aHMtc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixRQUFsQixHQUFBO0FBQ1QsVUFBQSxpQkFBQTs7UUFBQSxPQUFRLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztPQUF4QjtBQUFBLE1BRUEsT0FBQSxHQUFVLEVBRlYsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxPQUFSLENBQWdCLDRCQUFoQixDQUhYLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLElBQUwsQ0FDTixRQURNLEVBRU4sQ0FBQyxLQUFELEVBQVEsUUFBUSxDQUFDLFNBQVQsQ0FBQSxDQUFSLENBRk0sRUFHTixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0UsVUFBQSxLQUFDLENBQUEsSUFBRCxHQUFRLElBQVIsQ0FBQTtpQkFDQSxRQUFBLENBQVMsT0FBVCxFQUZGO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FITSxDQUxSLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLHlCQUFULEVBQW9DLFNBQUMsTUFBRCxHQUFBO2VBQ2xDLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLE1BQWYsRUFEd0I7TUFBQSxDQUFwQyxDQWJBLENBQUE7YUFnQkEsSUFBQyxDQUFBLEtBakJRO0lBQUEsQ0FBWDtBQUFBLElBbUJBLG9CQUFBLEVBQXNCLFNBQUEsR0FBQTtBQUNwQixVQUFBLElBQUE7OENBQUssQ0FBRSxTQUFQLENBQUEsV0FEb0I7SUFBQSxDQW5CdEI7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/paths-scanner.coffee
