(function() {
  var GitPull, git, options, repo, _pull;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitPull = require('../../lib/models/git-pull');

  _pull = require('../../lib/models/_pull');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  describe("Git Pull", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve(true));
    });
    it("calls git.cmd with ['remote'] to get remote repositories", function() {
      atom.config.set('git-plus.experimental', false);
      atom.config.set('git-plus.alwaysPullFromUpstream', false);
      GitPull(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['remote'], options);
    });
    describe("when 'alwaysPullFromCurrentBranch' is enabled", function() {
      return it("pulls immediately from the upstream branch", function() {
        atom.config.set('git-plus.experimental', true);
        atom.config.set('git-plus.alwaysPullFromUpstream', true);
        GitPull(repo);
        return expect(git.cmd).not.toHaveBeenCalledWith(['remote'], options);
      });
    });
    return describe("The pull function", function() {
      it("calls git.cmd", function() {
        _pull(repo, {
          remote: 'origin',
          branch: 'foo'
        });
        return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, {
          color: true
        });
      });
      return it("calls git.cmd with extra arguments if passed", function() {
        _pull(repo, {
          remote: 'origin',
          branch: 'foo',
          extraArgs: ['--rebase']
        });
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'origin', 'foo'], options, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtcHVsbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQ0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxhQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUixDQUZWLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHdCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLE9BQUEsR0FDRTtBQUFBLElBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7R0FORixDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUFHLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCLEVBQUg7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBRUEsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsS0FBekMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLEVBQW1ELEtBQW5ELENBREEsQ0FBQTtBQUFBLE1BRUEsT0FBQSxDQUFRLElBQVIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELENBQXJDLEVBQWlELE9BQWpELEVBSjZEO0lBQUEsQ0FBL0QsQ0FGQSxDQUFBO0FBQUEsSUFRQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQSxHQUFBO2FBQ3hELEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBLEdBQUE7QUFDL0MsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLElBQXpDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixFQUFtRCxJQUFuRCxDQURBLENBQUE7QUFBQSxRQUVBLE9BQUEsQ0FBUSxJQUFSLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsR0FBRyxDQUFDLG9CQUFwQixDQUF5QyxDQUFDLFFBQUQsQ0FBekMsRUFBcUQsT0FBckQsRUFKK0M7TUFBQSxDQUFqRCxFQUR3RDtJQUFBLENBQTFELENBUkEsQ0FBQTtXQWVBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsTUFBQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxLQUFBLENBQU0sSUFBTixFQUFZO0FBQUEsVUFBQSxNQUFBLEVBQVEsUUFBUjtBQUFBLFVBQWtCLE1BQUEsRUFBUSxLQUExQjtTQUFaLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsS0FBbkIsQ0FBckMsRUFBZ0UsT0FBaEUsRUFBeUU7QUFBQSxVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXpFLEVBRmtCO01BQUEsQ0FBcEIsQ0FBQSxDQUFBO2FBSUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxRQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVk7QUFBQSxVQUFBLE1BQUEsRUFBUSxRQUFSO0FBQUEsVUFBa0IsTUFBQSxFQUFRLEtBQTFCO0FBQUEsVUFBaUMsU0FBQSxFQUFXLENBQUMsVUFBRCxDQUE1QztTQUFaLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsUUFBckIsRUFBK0IsS0FBL0IsQ0FBckMsRUFBNEUsT0FBNUUsRUFBcUY7QUFBQSxVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXJGLEVBRmlEO01BQUEsQ0FBbkQsRUFMNEI7SUFBQSxDQUE5QixFQWhCbUI7RUFBQSxDQUFyQixDQVJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-pull-spec.coffee
