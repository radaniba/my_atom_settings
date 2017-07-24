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
        return it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUVBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUVDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVU7QUFBQSxJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO0dBSFYsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZTtBQUFBLElBQUMsS0FBQSxFQUFPLElBQVI7R0FKZixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLGtCQUxWLENBQUE7O0FBQUEsRUFNQSxjQUFBLEdBQWlCLHlCQU5qQixDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixJQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtBQUFBLFFBQUEsSUFBQSxFQUFNLE1BQU47T0FBOUIsQ0FBWCxDQUFBO2FBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQixFQUYrQjtJQUFBLENBQWpDLENBQUEsQ0FBQTtBQUFBLElBSUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTthQUM1QixFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO0FBQ2hELFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsT0FBckIsRUFBOEI7QUFBQSxVQUFBLElBQUEsRUFBTSxNQUFOO1NBQTlCLENBQVgsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsU0FBQSxHQUFBO2lCQUM1QixPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsRUFENEI7UUFBQSxDQUE5QixDQURBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBSkEsQ0FBQTtBQUFBLFFBS0EsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0IsRUFBdkI7UUFBQSxDQUFULENBTEEsQ0FBQTtlQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQ0gsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsSUFBWCxDQUFyQyxFQUF1RCxPQUF2RCxFQURHO1FBQUEsQ0FBTCxFQVBnRDtNQUFBLENBQWxELEVBRDRCO0lBQUEsQ0FBOUIsQ0FKQSxDQUFBO0FBQUEsSUFlQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO2FBQzdCLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxTQUFBLEdBQUE7QUFDM0QsWUFBQSxJQUFBO0FBQUEsUUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBLEdBQUE7aUJBQzVCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGVBQWhCLEVBRDRCO1FBQUEsQ0FBOUIsQ0FBQSxDQUFBO0FBQUEsUUFHQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtBQUFBLFVBQUEsSUFBQSxFQUFNLE9BQU47U0FBOUIsQ0FIWCxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUpBLENBQUE7QUFBQSxRQUtBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CLEVBQXZCO1FBQUEsQ0FBVCxDQUxBLENBQUE7ZUFNQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLFNBQVYsQ0FBckMsRUFBMkQsT0FBM0QsRUFBb0UsWUFBcEUsRUFERztRQUFBLENBQUwsRUFQMkQ7TUFBQSxDQUE3RCxFQUQ2QjtJQUFBLENBQS9CLENBZkEsQ0FBQTtBQUFBLElBMEJBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7YUFDbkMsRUFBQSxDQUFHLG1FQUFILEVBQXdFLFNBQUEsR0FBQTtBQUN0RSxZQUFBLElBQUE7QUFBQSxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUEsR0FBQTtpQkFDNUIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsZUFBaEIsRUFENEI7UUFBQSxDQUE5QixDQUFBLENBQUE7QUFBQSxRQUdBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCO0FBQUEsVUFBQSxJQUFBLEVBQU0sYUFBTjtTQUE5QixDQUhYLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBSkEsQ0FBQTtBQUFBLFFBS0EsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0IsRUFBdkI7UUFBQSxDQUFULENBTEEsQ0FBQTtlQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQ0gsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsU0FBVixFQUFxQixTQUFyQixDQUFyQyxFQUFzRSxPQUF0RSxFQUErRSxZQUEvRSxFQURHO1FBQUEsQ0FBTCxFQVBzRTtNQUFBLENBQXhFLEVBRG1DO0lBQUEsQ0FBckMsQ0ExQkEsQ0FBQTtBQUFBLElBcUNBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7YUFDNUIsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxZQUFBLElBQUE7QUFBQSxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGNBQWhCLENBQTVCLENBQUEsQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsT0FBckIsRUFBOEI7QUFBQSxVQUFBLElBQUEsRUFBTSxNQUFOO1NBQTlCLENBRlgsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FIQSxDQUFBO0FBQUEsUUFLQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixHQUFvQixFQUF2QjtRQUFBLENBQVQsQ0FMQSxDQUFBO2VBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxTQUFULENBQXJDLEVBQTBELE9BQTFELEVBQW1FLFlBQW5FLEVBREc7UUFBQSxDQUFMLEVBUGdDO01BQUEsQ0FBbEMsRUFENEI7SUFBQSxDQUE5QixDQXJDQSxDQUFBO1dBZ0RBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsTUFBQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFlBQUEsSUFBQTtBQUFBLFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsY0FBaEIsQ0FBNUIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtBQUFBLFVBQUEsSUFBQSxFQUFNLFNBQU47U0FBOUIsQ0FEWCxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUZBLENBQUE7QUFBQSxRQUlBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CLEVBQXZCO1FBQUEsQ0FBVCxDQUpBLENBQUE7ZUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxTQUFmLEVBQTBCLE1BQTFCLENBQXJDLEVBQXdFLE9BQXhFLEVBQWlGLFlBQWpGLEVBREc7UUFBQSxDQUFMLEVBTnNEO01BQUEsQ0FBeEQsQ0FBQSxDQUFBO0FBQUEsTUFTQSxRQUFBLENBQVMseURBQVQsRUFBb0UsU0FBQSxHQUFBO2VBQ2xFLEVBQUEsQ0FBRyxrRkFBSCxFQUF1RixTQUFBLEdBQUE7QUFDckYsY0FBQSxJQUFBO0FBQUEsVUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixTQUFoQixDQUE1QixDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixjQUFoQixFQUFnQyxNQUFoQyxDQURBLENBQUE7QUFBQSxVQUdBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCO0FBQUEsWUFBQSxJQUFBLEVBQU0sTUFBTjtXQUE5QixDQUhYLENBQUE7QUFBQSxVQUlBLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBSkEsQ0FBQTtBQUFBLFVBTUEsUUFBQSxDQUFTLFNBQUEsR0FBQTttQkFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0IsRUFBdkI7VUFBQSxDQUFULENBTkEsQ0FBQTtpQkFPQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLENBQXJDLEVBQXFFLE9BQXJFLEVBQThFLFlBQTlFLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxTQUFULENBQXJDLEVBQTBELE9BQTFELEVBQW1FLFlBQW5FLEVBRkc7VUFBQSxDQUFMLEVBUnFGO1FBQUEsQ0FBdkYsRUFEa0U7TUFBQSxDQUFwRSxDQVRBLENBQUE7YUFzQkEsUUFBQSxDQUFTLG9FQUFULEVBQStFLFNBQUEsR0FBQTtlQUM3RSxFQUFBLENBQUcsOEZBQUgsRUFBbUcsU0FBQSxHQUFBO0FBQ2pHLGNBQUEsSUFBQTtBQUFBLFVBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEIsQ0FBNUIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsRUFBZ0MsZUFBaEMsQ0FEQSxDQUFBO0FBQUEsVUFHQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtBQUFBLFlBQUEsSUFBQSxFQUFNLE1BQU47V0FBOUIsQ0FIWCxDQUFBO0FBQUEsVUFJQSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUpBLENBQUE7QUFBQSxVQU1BLFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CLEVBQXZCO1VBQUEsQ0FBVCxDQU5BLENBQUE7aUJBT0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixTQUFyQixFQUFnQyxTQUFoQyxDQUFyQyxFQUFpRixPQUFqRixFQUEwRixZQUExRixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsU0FBVCxDQUFyQyxFQUEwRCxPQUExRCxFQUFtRSxZQUFuRSxFQUZHO1VBQUEsQ0FBTCxFQVJpRztRQUFBLENBQW5HLEVBRDZFO01BQUEsQ0FBL0UsRUF2QmlDO0lBQUEsQ0FBbkMsRUFqRHlCO0VBQUEsQ0FBM0IsQ0FSQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/views/remote-list-view-spec.coffee
