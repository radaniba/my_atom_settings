(function() {
  var git, gitBranches, gitRemoteBranches, newBranch, pathToRepoFile, repo, _ref, _ref1;

  git = require('../../lib/git');

  _ref = require('../fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile;

  _ref1 = require('../../lib/models/git-branch'), gitBranches = _ref1.gitBranches, gitRemoteBranches = _ref1.gitRemoteBranches, newBranch = _ref1.newBranch;

  describe("GitBranch", function() {
    beforeEach(function() {
      return spyOn(atom.workspace, 'addModalPanel').andCallThrough();
    });
    describe(".gitBranches", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('branch1\nbranch2'));
        return waitsForPromise(function() {
          return gitBranches(repo);
        });
      });
      return it("displays a list of the repo's branches", function() {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], {
          cwd: repo.getWorkingDirectory()
        });
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
    describe(".gitRemoteBranches", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('branch1\nbranch2'));
        return waitsForPromise(function() {
          return gitRemoteBranches(repo);
        });
      });
      return it("displays a list of the repo's remote branches", function() {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '-r', '--no-color'], {
          cwd: repo.getWorkingDirectory()
        });
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
    return describe(".newBranch", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(function() {
          return Promise.reject('new branch created');
        });
        return newBranch(repo);
      });
      return it("displays a text input", function() {
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtYnJhbmNoLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLE9BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsWUFBQSxJQUFELEVBQU8sc0JBQUEsY0FEUCxDQUFBOztBQUFBLEVBRUEsUUFJSSxPQUFBLENBQVEsNkJBQVIsQ0FKSixFQUNFLG9CQUFBLFdBREYsRUFFRSwwQkFBQSxpQkFGRixFQUdFLGtCQUFBLFNBTEYsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDUCxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsZUFBdEIsQ0FBc0MsQ0FBQyxjQUF2QyxDQUFBLEVBRE87SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBR0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0Isa0JBQWhCLENBQTVCLENBQUEsQ0FBQTtlQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUFHLFdBQUEsQ0FBWSxJQUFaLEVBQUg7UUFBQSxDQUFoQixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFJQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFFBQUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsWUFBWCxDQUFyQyxFQUErRDtBQUFBLFVBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBL0QsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBdEIsQ0FBb0MsQ0FBQyxnQkFBckMsQ0FBQSxFQUYyQztNQUFBLENBQTdDLEVBTHVCO0lBQUEsQ0FBekIsQ0FIQSxDQUFBO0FBQUEsSUFZQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0Isa0JBQWhCLENBQTVCLENBQUEsQ0FBQTtlQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUFHLGlCQUFBLENBQWtCLElBQWxCLEVBQUg7UUFBQSxDQUFoQixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFJQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFFBQUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixZQUFqQixDQUFyQyxFQUFxRTtBQUFBLFVBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBckUsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBdEIsQ0FBb0MsQ0FBQyxnQkFBckMsQ0FBQSxFQUZrRDtNQUFBLENBQXBELEVBTDZCO0lBQUEsQ0FBL0IsQ0FaQSxDQUFBO1dBcUJBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLFNBQUEsR0FBQTtpQkFBRyxPQUFPLENBQUMsTUFBUixDQUFlLG9CQUFmLEVBQUg7UUFBQSxDQUE1QixDQUFBLENBQUE7ZUFDQSxTQUFBLENBQVUsSUFBVixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFJQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO2VBQzFCLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQXRCLENBQW9DLENBQUMsZ0JBQXJDLENBQUEsRUFEMEI7TUFBQSxDQUE1QixFQUxxQjtJQUFBLENBQXZCLEVBdEJvQjtFQUFBLENBQXRCLENBUkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-branch-spec.coffee
