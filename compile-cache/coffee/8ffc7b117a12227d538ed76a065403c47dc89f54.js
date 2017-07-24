(function() {
  var Os, Path, head, homedir, mocks, pathToRepoFile;

  Path = require('path');

  Os = require('os');

  homedir = Os.homedir();

  pathToRepoFile = Path.join(homedir, "some/repository/directory/file");

  head = jasmine.createSpyObj('head', ['replace']);

  module.exports = mocks = {
    pathToRepoFile: pathToRepoFile,
    pathToSampleDir: homedir,
    repo: {
      getPath: function() {
        return Path.join(this.getWorkingDirectory(), ".git");
      },
      getWorkingDirectory: function() {
        return Path.join(homedir, "some/repository");
      },
      refreshStatus: function() {
        return void 0;
      },
      relativize: function(path) {
        if (path === pathToRepoFile) {
          return "directory/file";
        } else {
          return path;
        }
      },
      getReferences: function() {
        return {
          heads: [head]
        };
      },
      getShortHead: function() {
        return 'short head';
      },
      isPathModified: function() {
        return false;
      },
      repo: {
        submoduleForPath: function(path) {
          return void 0;
        }
      }
    },
    currentPane: {
      isAlive: function() {
        return true;
      },
      activate: function() {
        return void 0;
      },
      destroy: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return pathToRepoFile;
            }
          }
        ];
      }
    },
    commitPane: {
      isAlive: function() {
        return true;
      },
      destroy: function() {
        return mocks.textEditor.destroy();
      },
      splitRight: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return Path.join(mocks.repo.getPath(), 'COMMIT_EDITMSG');
            }
          }
        ];
      }
    },
    textEditor: {
      getPath: function() {
        return pathToRepoFile;
      },
      getURI: function() {
        return pathToRepoFile;
      },
      onDidDestroy: function(destroy) {
        this.destroy = destroy;
        return {
          dispose: function() {}
        };
      },
      onDidSave: function(save) {
        this.save = save;
        return {
          dispose: function() {
            return void 0;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL2ZpeHR1cmVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FIVixDQUFBOztBQUFBLEVBSUEsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsZ0NBQW5CLENBSmpCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBcUIsTUFBckIsRUFBNkIsQ0FBQyxTQUFELENBQTdCLENBTFAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUEsR0FDZjtBQUFBLElBQUEsY0FBQSxFQUFnQixjQUFoQjtBQUFBLElBQ0EsZUFBQSxFQUFpQixPQURqQjtBQUFBLElBR0EsSUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFWLEVBQXNDLE1BQXRDLEVBQUg7TUFBQSxDQUFUO0FBQUEsTUFDQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQW5CLEVBQUg7TUFBQSxDQURyQjtBQUFBLE1BRUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUZmO0FBQUEsTUFHQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFBVSxRQUFBLElBQUcsSUFBQSxLQUFRLGNBQVg7aUJBQStCLGlCQUEvQjtTQUFBLE1BQUE7aUJBQXFELEtBQXJEO1NBQVY7TUFBQSxDQUhaO0FBQUEsTUFJQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQ2I7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUQsQ0FBUDtVQURhO01BQUEsQ0FKZjtBQUFBLE1BTUEsWUFBQSxFQUFjLFNBQUEsR0FBQTtlQUFHLGFBQUg7TUFBQSxDQU5kO0FBQUEsTUFPQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtlQUFHLE1BQUg7TUFBQSxDQVBoQjtBQUFBLE1BUUEsSUFBQSxFQUNFO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixTQUFDLElBQUQsR0FBQTtpQkFBVSxPQUFWO1FBQUEsQ0FBbEI7T0FURjtLQUpGO0FBQUEsSUFlQSxXQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQURWO0FBQUEsTUFFQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRlQ7QUFBQSxNQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7ZUFBRztVQUNYO0FBQUEsWUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBO3FCQUFHLGVBQUg7WUFBQSxDQUFSO1dBRFc7VUFBSDtNQUFBLENBSFY7S0FoQkY7QUFBQSxJQXVCQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsT0FBQSxFQUFTLFNBQUEsR0FBQTtlQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBakIsQ0FBQSxFQUFIO01BQUEsQ0FEVDtBQUFBLE1BRUEsVUFBQSxFQUFZLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUZaO0FBQUEsTUFHQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2VBQUc7VUFDWDtBQUFBLFlBQUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtxQkFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBWCxDQUFBLENBQVYsRUFBZ0MsZ0JBQWhDLEVBQUg7WUFBQSxDQUFSO1dBRFc7VUFBSDtNQUFBLENBSFY7S0F4QkY7QUFBQSxJQStCQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxlQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtlQUFHLGVBQUg7TUFBQSxDQURSO0FBQUEsTUFFQSxZQUFBLEVBQWMsU0FBRSxPQUFGLEdBQUE7QUFDWixRQURhLElBQUMsQ0FBQSxVQUFBLE9BQ2QsQ0FBQTtlQUFBO0FBQUEsVUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBLENBQVQ7VUFEWTtNQUFBLENBRmQ7QUFBQSxNQUlBLFNBQUEsRUFBVyxTQUFFLElBQUYsR0FBQTtBQUNULFFBRFUsSUFBQyxDQUFBLE9BQUEsSUFDWCxDQUFBO2VBQUE7QUFBQSxVQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7bUJBQUcsT0FBSDtVQUFBLENBQVQ7VUFEUztNQUFBLENBSlg7S0FoQ0Y7R0FSRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/fixtures.coffee
