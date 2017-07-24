(function() {
  var GitDifftoolContext, contextCommandMap, contextPackageFinder, mockSelectedPath, notifier, repo;

  notifier = require('../../lib/notifier');

  contextPackageFinder = require('../../lib/context-package-finder');

  GitDifftoolContext = require('../../lib/models/git-difftool-context');

  repo = require('../fixtures').repo;

  mockSelectedPath = 'selected/path';

  contextCommandMap = jasmine.createSpy('contextCommandMap');

  describe("GitDifftoolContext", function() {
    describe("when an object in the tree is selected", function() {
      return it("calls contextCommandMap::map with 'DiffTool' and the filepath for the tree object", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        GitDifftoolContext(repo, contextCommandMap);
        return expect(contextCommandMap).toHaveBeenCalledWith('difftool', {
          repo: repo,
          file: mockSelectedPath
        });
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the userof the issue", function() {
        spyOn(notifier, 'addInfo');
        GitDifftoolContext(repo, contextCommandMap);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtZGlmZnRvb2wtY29udGV4dC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2RkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0Esb0JBQUEsR0FBdUIsT0FBQSxDQUFRLGtDQUFSLENBRHZCLENBQUE7O0FBQUEsRUFFQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUNBQVIsQ0FGckIsQ0FBQTs7QUFBQSxFQUlDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUpELENBQUE7O0FBQUEsRUFLQSxnQkFBQSxHQUFtQixlQUxuQixDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsbUJBQWxCLENBTnBCLENBQUE7O0FBQUEsRUFRQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLElBQUEsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUEsR0FBQTthQUNqRCxFQUFBLENBQUcsbUZBQUgsRUFBd0YsU0FBQSxHQUFBO0FBQ3RGLFFBQUEsS0FBQSxDQUFNLG9CQUFOLEVBQTRCLEtBQTVCLENBQWtDLENBQUMsU0FBbkMsQ0FBNkM7QUFBQSxVQUFDLFlBQUEsRUFBYyxnQkFBZjtTQUE3QyxDQUFBLENBQUE7QUFBQSxRQUNBLGtCQUFBLENBQW1CLElBQW5CLEVBQXlCLGlCQUF6QixDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8saUJBQVAsQ0FBeUIsQ0FBQyxvQkFBMUIsQ0FBK0MsVUFBL0MsRUFBMkQ7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsVUFBWSxJQUFBLEVBQU0sZ0JBQWxCO1NBQTNELEVBSHNGO01BQUEsQ0FBeEYsRUFEaUQ7SUFBQSxDQUFuRCxDQUFBLENBQUE7V0FNQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQSxHQUFBO2FBQ3pDLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsUUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixTQUFoQixDQUFBLENBQUE7QUFBQSxRQUNBLGtCQUFBLENBQW1CLElBQW5CLEVBQXlCLGlCQUF6QixDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sUUFBUSxDQUFDLE9BQWhCLENBQXdCLENBQUMsb0JBQXpCLENBQThDLDBCQUE5QyxFQUhrQztNQUFBLENBQXBDLEVBRHlDO0lBQUEsQ0FBM0MsRUFQNkI7RUFBQSxDQUEvQixDQVJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-difftool-context-spec.coffee
