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
      getUpstreamBranch: function() {
        return 'refs/remotes/origin/foo';
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL2ZpeHR1cmVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FIVixDQUFBOztBQUFBLEVBSUEsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsZ0NBQW5CLENBSmpCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBcUIsTUFBckIsRUFBNkIsQ0FBQyxTQUFELENBQTdCLENBTFAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUEsR0FDZjtBQUFBLElBQUEsY0FBQSxFQUFnQixjQUFoQjtBQUFBLElBQ0EsZUFBQSxFQUFpQixPQURqQjtBQUFBLElBR0EsSUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFWLEVBQXNDLE1BQXRDLEVBQUg7TUFBQSxDQUFUO0FBQUEsTUFDQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQW5CLEVBQUg7TUFBQSxDQURyQjtBQUFBLE1BRUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUZmO0FBQUEsTUFHQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFBVSxRQUFBLElBQUcsSUFBQSxLQUFRLGNBQVg7aUJBQStCLGlCQUEvQjtTQUFBLE1BQUE7aUJBQXFELEtBQXJEO1NBQVY7TUFBQSxDQUhaO0FBQUEsTUFJQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQ2I7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUQsQ0FBUDtVQURhO01BQUEsQ0FKZjtBQUFBLE1BTUEsWUFBQSxFQUFjLFNBQUEsR0FBQTtlQUFHLGFBQUg7TUFBQSxDQU5kO0FBQUEsTUFPQSxpQkFBQSxFQUFtQixTQUFBLEdBQUE7ZUFBRywwQkFBSDtNQUFBLENBUG5CO0FBQUEsTUFRQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtlQUFHLE1BQUg7TUFBQSxDQVJoQjtBQUFBLE1BU0EsSUFBQSxFQUNFO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixTQUFDLElBQUQsR0FBQTtpQkFBVSxPQUFWO1FBQUEsQ0FBbEI7T0FWRjtLQUpGO0FBQUEsSUFnQkEsV0FBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsS0FBSDtNQUFBLENBQVQ7QUFBQSxNQUNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7ZUFBRyxPQUFIO01BQUEsQ0FEVjtBQUFBLE1BRUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUZUO0FBQUEsTUFHQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2VBQUc7VUFDWDtBQUFBLFlBQUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtxQkFBRyxlQUFIO1lBQUEsQ0FBUjtXQURXO1VBQUg7TUFBQSxDQUhWO0tBakJGO0FBQUEsSUF3QkEsVUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsS0FBSDtNQUFBLENBQVQ7QUFBQSxNQUNBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWpCLENBQUEsRUFBSDtNQUFBLENBRFQ7QUFBQSxNQUVBLFVBQUEsRUFBWSxTQUFBLEdBQUE7ZUFBRyxPQUFIO01BQUEsQ0FGWjtBQUFBLE1BR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtlQUFHO1VBQ1g7QUFBQSxZQUFBLE1BQUEsRUFBUSxTQUFBLEdBQUE7cUJBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQVgsQ0FBQSxDQUFWLEVBQWdDLGdCQUFoQyxFQUFIO1lBQUEsQ0FBUjtXQURXO1VBQUg7TUFBQSxDQUhWO0tBekJGO0FBQUEsSUFnQ0EsVUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsZUFBSDtNQUFBLENBQVQ7QUFBQSxNQUNBLE1BQUEsRUFBUSxTQUFBLEdBQUE7ZUFBRyxlQUFIO01BQUEsQ0FEUjtBQUFBLE1BRUEsWUFBQSxFQUFjLFNBQUUsT0FBRixHQUFBO0FBQ1osUUFEYSxJQUFDLENBQUEsVUFBQSxPQUNkLENBQUE7ZUFBQTtBQUFBLFVBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQSxDQUFUO1VBRFk7TUFBQSxDQUZkO0FBQUEsTUFJQSxTQUFBLEVBQVcsU0FBRSxJQUFGLEdBQUE7QUFDVCxRQURVLElBQUMsQ0FBQSxPQUFBLElBQ1gsQ0FBQTtlQUFBO0FBQUEsVUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO21CQUFHLE9BQUg7VUFBQSxDQUFUO1VBRFM7TUFBQSxDQUpYO0tBakNGO0dBUkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/fixtures.coffee
