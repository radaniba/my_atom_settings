(function() {
  var PullBranchListView, colorOptions, git, options, repo;

  git = require('../../lib/git');

  PullBranchListView = require('../../lib/views/pull-branch-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  describe("PullBranchListView", function() {
    beforeEach(function() {
      this.view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '');
      return spyOn(git, 'cmd').andReturn(Promise.resolve('pulled'));
    });
    it("displays a list of branches and the first option is a special one for the current branch", function() {
      expect(this.view.items.length).toBe(3);
      return expect(this.view.items[0].name).toEqual('== Current ==');
    });
    it("has a property called result which is a promise", function() {
      expect(this.view.result).toBeDefined();
      expect(this.view.result.then).toBeDefined();
      return expect(this.view.result["catch"]).toBeDefined();
    });
    it("removes the 'origin/HEAD' option in the list of branches", function() {
      var view;
      view = new PullBranchListView(repo, "branch1\nbranch2\norigin/HEAD", "remote", '');
      return expect(this.view.items.length).toBe(3);
    });
    describe("when the special option is selected", function() {
      return it("calls git.cmd with ['pull'] and remote name", function() {
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote'], options, colorOptions);
        });
      });
    });
    describe("when a branch option is selected", function() {
      return it("calls git.cmd with ['pull'], the remote name, and branch name", function() {
        this.view.selectNextItemView();
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote', 'branch1'], options, colorOptions);
        });
      });
    });
    return describe("when '--rebase' is passed as extraArgs", function() {
      return it("calls git.cmd with ['pull', '--rebase'], the remote name", function() {
        var view;
        view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '--rebase');
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote'], options, colorOptions);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL3B1bGwtYnJhbmNoLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUNBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUVDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVU7QUFBQSxJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO0dBSFYsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZTtBQUFBLElBQUMsS0FBQSxFQUFPLElBQVI7R0FKZixDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxrQkFBQSxDQUFtQixJQUFuQixFQUF5QixrQkFBekIsRUFBNkMsUUFBN0MsRUFBdUQsRUFBdkQsQ0FBWixDQUFBO2FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBNUIsRUFGUztJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsSUFJQSxFQUFBLENBQUcsMEZBQUgsRUFBK0YsU0FBQSxHQUFBO0FBQzdGLE1BQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEMsQ0FB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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/views/pull-branch-list-view-spec.coffee
