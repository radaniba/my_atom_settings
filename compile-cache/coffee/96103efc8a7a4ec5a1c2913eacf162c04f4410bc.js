(function() {
  var GitDiffTool, fs, git, pathToRepoFile, pathToSampleDir, repo, _ref;

  fs = require('fs-plus');

  _ref = require('../fixtures'), repo = _ref.repo, pathToSampleDir = _ref.pathToSampleDir, pathToRepoFile = _ref.pathToRepoFile;

  git = require('../../lib/git');

  GitDiffTool = require('../../lib/models/git-difftool');

  describe("GitDiffTool", function() {
    describe("Using includeStagedDiff", function() {
      beforeEach(function() {
        atom.config.set('git-plus.includeStagedDiff', true);
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn(Promise.resolve('some-tool'));
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToRepoFile
          });
        });
      });
      return describe("when git-plus.includeStagedDiff config is true", function() {
        it("calls git.cmd with 'diff-index HEAD -z'", function() {
          return expect(git.cmd).toHaveBeenCalledWith(['diff-index', 'HEAD', '-z'], {
            cwd: repo.getWorkingDirectory()
          });
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith('diff.tool', repo.getWorkingDirectory());
        });
      });
    });
    return describe("Usage on dirs", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn(Promise.resolve('some-tool'));
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToSampleDir
          });
        });
      });
      return describe("when file points to a directory", function() {
        it("calls git.cmd with 'difftool --no-prompt -d'", function() {
          return expect(git.cmd.calls[1].args).toEqual([
            ['difftool', '-d', '--no-prompt', pathToSampleDir], {
              cwd: repo.getWorkingDirectory()
            }
          ]);
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith('diff.tool', repo.getWorkingDirectory());
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtZGlmZnRvb2wtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUVBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsT0FBMEMsT0FBQSxDQUFRLGFBQVIsQ0FBMUMsRUFBQyxZQUFBLElBQUQsRUFBTyx1QkFBQSxlQUFQLEVBQXdCLHNCQUFBLGNBRHhCLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FGTixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQUhkLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsSUFBQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxJQUE5QyxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQTVCLENBREEsQ0FBQTtBQUFBLFFBRUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEIsQ0FBbEMsQ0FGQSxDQUFBO2VBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsV0FBQSxDQUFZLElBQVosRUFBa0I7QUFBQSxZQUFBLElBQUEsRUFBTSxjQUFOO1dBQWxCLEVBRGM7UUFBQSxDQUFoQixFQUpTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFPQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFFBQUEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtpQkFDNUMsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxZQUFELEVBQWUsTUFBZixFQUF1QixJQUF2QixDQUFyQyxFQUFtRTtBQUFBLFlBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBbkUsRUFENEM7UUFBQSxDQUE5QyxDQUFBLENBQUE7ZUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQSxHQUFBO2lCQUMxRCxNQUFBLENBQU8sR0FBRyxDQUFDLFNBQVgsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkMsV0FBM0MsRUFBd0QsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBeEQsRUFEMEQ7UUFBQSxDQUE1RCxFQUp5RDtNQUFBLENBQTNELEVBUmtDO0lBQUEsQ0FBcEMsQ0FBQSxDQUFBO1dBZUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBNUIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLFdBQVgsQ0FBdUIsQ0FBQyxTQUF4QixDQUFrQyxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQixDQUFsQyxDQURBLENBQUE7ZUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxXQUFBLENBQVksSUFBWixFQUFrQjtBQUFBLFlBQUEsSUFBQSxFQUFNLGVBQU47V0FBbEIsRUFEYztRQUFBLENBQWhCLEVBSFM7TUFBQSxDQUFYLENBQUEsQ0FBQTthQU1BLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsUUFBQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO2lCQUNqRCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQztZQUFDLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsYUFBbkIsRUFBa0MsZUFBbEMsQ0FBRCxFQUFxRDtBQUFBLGNBQUMsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQU47YUFBckQ7V0FBdEMsRUFEaUQ7UUFBQSxDQUFuRCxDQUFBLENBQUE7ZUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQSxHQUFBO2lCQUMxRCxNQUFBLENBQU8sR0FBRyxDQUFDLFNBQVgsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkMsV0FBM0MsRUFBd0QsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBeEQsRUFEMEQ7UUFBQSxDQUE1RCxFQUowQztNQUFBLENBQTVDLEVBUHdCO0lBQUEsQ0FBMUIsRUFoQnNCO0VBQUEsQ0FBeEIsQ0FMQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-difftool-spec.coffee
