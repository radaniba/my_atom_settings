(function() {
  var os, path;

  os = require('os');

  path = require('path');

  module.exports = {
    tempFilesDir: path.join(os.tmpdir()),
    getClassName: function(context) {
      return context.filename.replace(/\.java$/, "");
    },
    getProjectPath: function(context) {
      var projectPath, projectPaths, _i, _len, _results;
      projectPaths = atom.project.getPaths();
      _results = [];
      for (_i = 0, _len = projectPaths.length; _i < _len; _i++) {
        projectPath = projectPaths[_i];
        if (context.filepath.includes(projectPath)) {
          _results.push(projectPath);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    getClassPackage: function(context) {
      var projectPath, projectRemoved;
      projectPath = module.exports.getProjectPath(context);
      projectRemoved = context.filepath.replace(projectPath + "/", "");
      return projectRemoved.replace("/" + context.filename, "");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvamF2YS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FJRTtBQUFBLElBQUEsWUFBQSxFQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFWLENBQWQ7QUFBQSxJQU9BLFlBQUEsRUFBYyxTQUFDLE9BQUQsR0FBQTthQUNaLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBakIsQ0FBeUIsU0FBekIsRUFBb0MsRUFBcEMsRUFEWTtJQUFBLENBUGQ7QUFBQSxJQWVBLGNBQUEsRUFBZ0IsU0FBQyxPQUFELEdBQUE7QUFDZCxVQUFBLDZDQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBZixDQUFBO0FBQ0E7V0FBQSxtREFBQTt1Q0FBQTtBQUNFLFFBQUEsSUFBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQWpCLENBQTBCLFdBQTFCLENBQUg7d0JBQ0UsYUFERjtTQUFBLE1BQUE7Z0NBQUE7U0FERjtBQUFBO3NCQUZjO0lBQUEsQ0FmaEI7QUFBQSxJQTBCQSxlQUFBLEVBQWlCLFNBQUMsT0FBRCxHQUFBO0FBQ2YsVUFBQSwyQkFBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBZixDQUE4QixPQUE5QixDQUFkLENBQUE7QUFBQSxNQUNBLGNBQUEsR0FBa0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFqQixDQUF5QixXQUFBLEdBQWMsR0FBdkMsRUFBNEMsRUFBNUMsQ0FEbEIsQ0FBQTthQUVBLGNBQWMsQ0FBQyxPQUFmLENBQXVCLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBckMsRUFBK0MsRUFBL0MsRUFIZTtJQUFBLENBMUJqQjtHQVBGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/script/lib/grammar-utils/java.coffee
