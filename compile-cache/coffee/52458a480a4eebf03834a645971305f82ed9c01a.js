(function() {
  var GitStashApply, GitStashDrop, GitStashPop, GitStashSave, colorOptions, git, options, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitStashApply = require('../../lib/models/git-stash-apply');

  GitStashSave = require('../../lib/models/git-stash-save');

  GitStashPop = require('../../lib/models/git-stash-pop');

  GitStashDrop = require('../../lib/models/git-stash-drop');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  describe("Git Stash commands", function() {
    describe("Apply", function() {
      return it("calls git.cmd with 'stash' and 'apply'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashApply(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'apply'], options, colorOptions);
      });
    });
    describe("Save", function() {
      return it("calls git.cmd with 'stash' and 'save'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save'], options, colorOptions);
      });
    });
    describe("Save with message", function() {
      return it("calls git.cmd with 'stash', 'save', and provides message", function() {
        var message;
        message = 'foobar';
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo, {
          message: message
        });
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save', message], options, colorOptions);
      });
    });
    describe("Pop", function() {
      return it("calls git.cmd with 'stash' and 'pop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashPop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'pop'], options, colorOptions);
      });
    });
    return describe("Drop", function() {
      return it("calls git.cmd with 'stash' and 'drop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashDrop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'drop'], options, colorOptions);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtc3Rhc2gtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0ZBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtDQUFSLENBRmhCLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlDQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUlBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0NBQVIsQ0FKZCxDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQ0FBUixDQUxmLENBQUE7O0FBQUEsRUFPQSxPQUFBLEdBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0dBUkYsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FDRTtBQUFBLElBQUEsS0FBQSxFQUFPLElBQVA7R0FWRixDQUFBOztBQUFBLEVBWUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixJQUFBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTthQUNoQixFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxhQUFBLENBQWMsSUFBZCxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdB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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-stash-spec.coffee
