(function() {
  var GitAddContext, contextCommandMap, contextPackageFinder, mockSelectedPath, notifier, repo;

  notifier = require('../../lib/notifier');

  contextPackageFinder = require('../../lib/context-package-finder');

  GitAddContext = require('../../lib/models/git-add-context');

  repo = require('../fixtures').repo;

  mockSelectedPath = 'selected/path';

  contextCommandMap = jasmine.createSpy('contextCommandMap');

  describe("GitAddContext", function() {
    describe("when an object in the tree is selected", function() {
      return it("calls contextCommandMap::map with 'add' and the filepath for the tree object", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        GitAddContext(repo, contextCommandMap);
        return expect(contextCommandMap).toHaveBeenCalledWith('add', {
          repo: repo,
          file: mockSelectedPath
        });
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the userof the issue", function() {
        spyOn(notifier, 'addInfo');
        GitAddContext(repo, contextCommandMap);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtYWRkLWNvbnRleHQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0ZBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUNBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxrQ0FBUixDQUR2QixDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0NBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUlDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUpELENBQUE7O0FBQUEsRUFLQSxnQkFBQSxHQUFtQixlQUxuQixDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsbUJBQWxCLENBTnBCLENBQUE7O0FBQUEsRUFRQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsSUFBQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQSxHQUFBO2FBQ2pELEVBQUEsQ0FBRyw4RUFBSCxFQUFtRixTQUFBLEdBQUE7QUFDakYsUUFBQSxLQUFBLENBQU0sb0JBQU4sRUFBNEIsS0FBNUIsQ0FBa0MsQ0FBQyxTQUFuQyxDQUE2QztBQUFBLFVBQUMsWUFBQSxFQUFjLGdCQUFmO1NBQTdDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsYUFBQSxDQUFjLElBQWQsRUFBb0IsaUJBQXBCLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxpQkFBUCxDQUF5QixDQUFDLG9CQUExQixDQUErQyxLQUEvQyxFQUFzRDtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxVQUFZLElBQUEsRUFBTSxnQkFBbEI7U0FBdEQsRUFIaUY7TUFBQSxDQUFuRixFQURpRDtJQUFBLENBQW5ELENBQUEsQ0FBQTtXQU1BLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7YUFDekMsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLFNBQWhCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsYUFBQSxDQUFjLElBQWQsRUFBb0IsaUJBQXBCLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxRQUFRLENBQUMsT0FBaEIsQ0FBd0IsQ0FBQyxvQkFBekIsQ0FBOEMseUJBQTlDLEVBSGtDO01BQUEsQ0FBcEMsRUFEeUM7SUFBQSxDQUEzQyxFQVB3QjtFQUFBLENBQTFCLENBUkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/models/git-add-context-spec.coffee
