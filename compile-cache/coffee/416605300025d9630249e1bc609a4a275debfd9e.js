(function() {
  var AskStackView, WorkspaceView;

  AskStackView = require('../lib/ask-stack-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("AskStackView", function() {
    var askStackView;
    askStackView = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return askStackView = new AskStackView();
    });
    return describe("when the panel is presented", function() {
      return it("displays all the components", function() {
        askStackView.presentPanel();
        return runs(function() {
          expect(askStackView.questionField).toExist();
          expect(askStackView.tagsField).toExist();
          expect(askStackView.sortByVote).toExist();
          return expect(askStackView.askButton).toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svc3BlYy9hc2stc3RhY2stdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQkFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FBZixDQUFBOztBQUFBLEVBQ0MsZ0JBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWpCLGFBREQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLFlBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxJQUFmLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxhQUFMLEdBQXFCLEdBQUEsQ0FBQSxhQUFyQixDQUFBO2FBRUEsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBQSxFQUhWO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FPQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO2FBQ3RDLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSxZQUFZLENBQUMsWUFBYixDQUFBLENBQUEsQ0FBQTtlQUVBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsYUFBcEIsQ0FBa0MsQ0FBQyxPQUFuQyxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxTQUFwQixDQUE4QixDQUFDLE9BQS9CLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sWUFBWSxDQUFDLFVBQXBCLENBQStCLENBQUMsT0FBaEMsQ0FBQSxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxTQUFwQixDQUE4QixDQUFDLE9BQS9CLENBQUEsRUFKRztRQUFBLENBQUwsRUFIZ0M7TUFBQSxDQUFsQyxFQURzQztJQUFBLENBQXhDLEVBUnVCO0VBQUEsQ0FBekIsQ0FIQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/spec/ask-stack-view-spec.coffee
