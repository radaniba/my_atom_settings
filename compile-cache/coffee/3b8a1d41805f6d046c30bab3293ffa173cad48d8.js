(function() {
  var GitRun, git, pathToRepoFile, repo, _ref;

  _ref = require('../fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile;

  git = require('../../lib/git');

  GitRun = require('../../lib/models/git-run');

  describe("GitRun", function() {
    return it("calls git.cmd with the arguments typed into the input with a config for colors to be enabled", function() {
      var editor, view;
      spyOn(git, 'cmd').andReturn(Promise.resolve(true));
      view = GitRun(repo);
      editor = view.find('atom-text-editor')[0];
      view.commandEditor.setText('do some stuff');
      atom.commands.dispatch(editor, 'core:confirm');
      return expect(git.cmd).toHaveBeenCalledWith(['do', 'some', 'stuff'], {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtcnVuLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsT0FBeUIsT0FBQSxDQUFRLGFBQVIsQ0FBekIsRUFBQyxZQUFBLElBQUQsRUFBTyxzQkFBQSxjQUFQLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FETixDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSwwQkFBUixDQUZULENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7V0FDakIsRUFBQSxDQUFHLDhGQUFILEVBQW1HLFNBQUEsR0FBQTtBQUNqRyxVQUFBLFlBQUE7QUFBQSxNQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLE1BQUEsQ0FBTyxJQUFQLENBRFAsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBOEIsQ0FBQSxDQUFBLENBRnZDLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZUFBM0IsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsY0FBL0IsQ0FKQSxDQUFBO2FBS0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLE9BQWYsQ0FBckMsRUFBOEQ7QUFBQSxRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQTlELEVBQStGO0FBQUEsUUFBQyxLQUFBLEVBQU8sSUFBUjtPQUEvRixFQU5pRztJQUFBLENBQW5HLEVBRGlCO0VBQUEsQ0FBbkIsQ0FKQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-run-spec.coffee
