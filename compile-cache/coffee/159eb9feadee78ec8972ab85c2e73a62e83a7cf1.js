(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(config, callback) {
      var dirtied, removed, task, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      dirtied = [];
      removed = [];
      taskPath = require.resolve('./tasks/load-paths-handler');
      task = Task.once(taskPath, config, function() {
        return callback({
          dirtied: dirtied,
          removed: removed
        });
      });
      task.on('load-paths:paths-found', function(paths) {
        return dirtied.push.apply(dirtied, paths);
      });
      task.on('load-paths:paths-lost', function(paths) {
        return removed.push.apply(removed, paths);
      });
      return task;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGF0aHMtbG9hZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxJQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxTQUFDLE1BQUQsRUFBUyxRQUFULEdBQUE7QUFDVCxVQUFBLGdDQUFBOztRQUFBLE9BQVEsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQXhCO0FBQUEsTUFFQSxPQUFBLEdBQVUsRUFGVixDQUFBO0FBQUEsTUFHQSxPQUFBLEdBQVUsRUFIVixDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsNEJBQWhCLENBSlgsQ0FBQTtBQUFBLE1BTUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQ0wsUUFESyxFQUVMLE1BRkssRUFHTCxTQUFBLEdBQUE7ZUFBRyxRQUFBLENBQVM7QUFBQSxVQUFDLFNBQUEsT0FBRDtBQUFBLFVBQVUsU0FBQSxPQUFWO1NBQVQsRUFBSDtNQUFBLENBSEssQ0FOUCxDQUFBO0FBQUEsTUFZQSxJQUFJLENBQUMsRUFBTCxDQUFRLHdCQUFSLEVBQWtDLFNBQUMsS0FBRCxHQUFBO2VBQVcsT0FBTyxDQUFDLElBQVIsZ0JBQWEsS0FBYixFQUFYO01BQUEsQ0FBbEMsQ0FaQSxDQUFBO0FBQUEsTUFhQSxJQUFJLENBQUMsRUFBTCxDQUFRLHVCQUFSLEVBQWlDLFNBQUMsS0FBRCxHQUFBO2VBQVcsT0FBTyxDQUFDLElBQVIsZ0JBQWEsS0FBYixFQUFYO01BQUEsQ0FBakMsQ0FiQSxDQUFBO2FBZUEsS0FoQlM7SUFBQSxDQUFYO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/paths-loader.coffee
