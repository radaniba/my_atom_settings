(function() {
  var $, AskStack, EditorView, WorkspaceView, _ref;

  _ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, WorkspaceView = _ref.WorkspaceView;

  AskStack = require('../lib/ask-stack');

  describe("AskStack", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('ask-stack');
    });
    return describe("when the ask-stack:ask-question event is triggered", function() {
      return it("attaches the view", function() {
        expect(atom.workspaceView.find('.ask-stack')).not.toExist();
        atom.workspaceView.trigger('ask-stack:ask-question');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return expect(atom.workspaceView.find('.ask-stack')).toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svc3BlYy9hc2stc3RhY2stc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNENBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLGtCQUFBLFVBQUosRUFBZ0IscUJBQUEsYUFBaEIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsa0JBQVIsQ0FGWCxDQUFBOztBQUFBLEVBU0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsaUJBQUE7QUFBQSxJQUFBLGlCQUFBLEdBQW9CLElBQXBCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxhQUFMLEdBQXFCLEdBQUEsQ0FBQSxhQUFyQixDQUFBO2FBQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLEVBRlg7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQU1BLFFBQUEsQ0FBUyxvREFBVCxFQUErRCxTQUFBLEdBQUE7YUFDN0QsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLENBQXdCLFlBQXhCLENBQVAsQ0FBNkMsQ0FBQyxHQUFHLENBQUMsT0FBbEQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsd0JBQTNCLENBSkEsQ0FBQTtBQUFBLFFBTUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQU5BLENBQUE7ZUFTQSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLENBQXdCLFlBQXhCLENBQVAsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFBLEVBREc7UUFBQSxDQUFMLEVBVnNCO01BQUEsQ0FBeEIsRUFENkQ7SUFBQSxDQUEvRCxFQVBtQjtFQUFBLENBQXJCLENBVEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/spec/ask-stack-spec.coffee
