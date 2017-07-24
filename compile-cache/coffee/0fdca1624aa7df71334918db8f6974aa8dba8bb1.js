(function() {
  var RemoteListView, colorOptions, git, options, pullBeforePush, remotes, repo;

  git = require('../../lib/git');

  RemoteListView = require('../../lib/views/remote-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  remotes = "remote1\nremote2";

  pullBeforePush = 'git-plus.pullBeforePush';

  describe("RemoteListView", function() {
    it("displays a list of remotes", function() {
      var view;
      view = new RemoteListView(repo, remotes, {
        mode: 'pull'
      });
      return expect(view.items.length).toBe(2);
    });
    describe("when mode is pull", function() {
      return it("it calls git.cmd to get the remote branches", function() {
        var view;
        atom.config.set('git-plus.alwaysPullFromUpstream', false);
        atom.config.set('git-plus.experimental', false);
        view = new RemoteListView(repo, remotes, {
          mode: 'pull'
        });
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('branch1\nbranch2');
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['branch', '-r'], options);
        });
      });
    });
    describe("when mode is fetch", function() {
      return it("it calls git.cmd to with ['fetch'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is fetch-prune", function() {
      return it("it calls git.cmd to with ['fetch', '--prune'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch-prune'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', '--prune', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is push", function() {
      return it("calls git.cmd with ['push']", function() {
        var view;
        atom.config.set('git-plus.alwaysPullFromUpstream', false);
        atom.config.set('git-plus.experimental', false);
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 1;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
        });
      });
    });
    return describe("when mode is 'push -u'", function() {
      it("calls git.cmd with ['push', '-u'] and remote name", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push -u'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', '-u', 'remote1', 'HEAD'], options, colorOptions);
        });
      });
      describe("when the the config for pull before push is set to true", function() {
        it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull');
          atom.config.set('git-plus.alwaysPullFromUpstream', false);
          atom.config.set('git-plus.experimental', false);
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 2;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote1', 'branch1'], options, colorOptions);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
          });
        });
        return describe("when the config for alwaysPullFromUpstream is set to true", function() {
          return it("calls the function from the _pull module", function() {
            var view;
            spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
            atom.config.set(pullBeforePush, 'pull');
            atom.config.set('git-plus.alwaysPullFromUpstream', true);
            atom.config.set('git-plus.experimental', true);
            view = new RemoteListView(repo, remotes, {
              mode: 'push'
            });
            view.confirmSelection();
            waitsFor(function() {
              return git.cmd.callCount > 1;
            });
            return runs(function() {
              expect(git.cmd).not.toHaveBeenCalledWith(['pull', 'remote1', 'branch1'], options, colorOptions);
              return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
            });
          });
        });
      });
      return describe("when the the config for pull before push is set to 'Pull --rebase'", function() {
        return it("calls git.cmd with ['pull', '--rebase'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull --rebase');
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 2;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote1', 'branch1'], options, colorOptions);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUVBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUVDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVU7QUFBQSxJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO0dBSFYsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZTtBQUFBLElBQUMsS0FBQSxFQUFPLElBQVI7R0FKZixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLGtCQUxWLENBQUE7O0FBQUEsRUFNQSxjQUFBLEdBQWlCLHlCQU5qQixDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixJQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtBQUFBLFFBQUEsSUFBQSxFQUFNLE1BQU47T0FBOUIsQ0FBWCxDQUFBO2FBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQixFQUYrQjtJQUFBLENBQWpDLENBQUEsQ0FBQTtBQUFBLElBSUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTthQUM1QixFQUFBLENBQUcs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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/views/remote-list-view-spec.coffee
