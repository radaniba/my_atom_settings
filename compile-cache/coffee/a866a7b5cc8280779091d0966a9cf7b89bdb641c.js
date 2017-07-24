(function() {
  var MergeListView, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  MergeListView = require('../../lib/views/merge-list-view');

  describe("MergeListView", function() {
    beforeEach(function() {
      this.view = new MergeListView(repo, "branch1\nbranch2");
      return spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('');
      });
    });
    it("displays a list of branches", function() {
      return expect(this.view.items.length).toBe(2);
    });
    it("calls git.cmd with 'merge branch1' when branch1 is selected", function() {
      this.view.confirmSelection();
      waitsFor(function() {
        return git.cmd.callCount > 0;
      });
      return expect(git.cmd).toHaveBeenCalledWith(['merge', 'branch1'], {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      });
    });
    return describe("when passed extra arguments", function() {
      return it("calls git.cmd with 'merge [extraArgs] branch1' when branch1 is selected", function() {
        var view;
        view = new MergeListView(repo, "branch1", ['--no-ff']);
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return expect(git.cmd).toHaveBeenCalledWith(['merge', '--no-ff', 'branch1'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL21lcmdlLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxhQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFnQixPQUFBLENBQVEsaUNBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxhQUFBLENBQWMsSUFBZCxFQUFvQixrQkFBcEIsQ0FBWixDQUFBO2FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsU0FBQSxHQUFBO2VBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsRUFBSDtNQUFBLENBQTlCLEVBRlM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBSUEsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUEsR0FBQTthQUNoQyxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQyxFQURnQztJQUFBLENBQWxDLENBSkEsQ0FBQTtBQUFBLElBT0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtBQUNoRSxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7ZUFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0IsRUFBdkI7TUFBQSxDQUFULENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLFNBQVYsQ0FBckMsRUFBMkQ7QUFBQSxRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQTNELEVBQTRGO0FBQUEsUUFBQyxLQUFBLEVBQU8sSUFBUjtPQUE1RixFQUhnRTtJQUFBLENBQWxFLENBUEEsQ0FBQTtXQVlBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBLEdBQUE7YUFDdEMsRUFBQSxDQUFHLHlFQUFILEVBQThFLFNBQUEsR0FBQTtBQUM1RSxZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLFNBQXBCLEVBQStCLENBQUMsU0FBRCxDQUEvQixDQUFYLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0IsRUFBdkI7UUFBQSxDQUFULENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLFNBQVYsRUFBcUIsU0FBckIsQ0FBckMsRUFBc0U7QUFBQSxVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQXRFLEVBQXVHO0FBQUEsVUFBQyxLQUFBLEVBQU8sSUFBUjtTQUF2RyxFQUo0RTtNQUFBLENBQTlFLEVBRHNDO0lBQUEsQ0FBeEMsRUFid0I7RUFBQSxDQUExQixDQUpBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/views/merge-list-view-spec.coffee
