(function() {
  var AskStackView;

  AskStackView = require('../lib/ask-stack-view');

  describe("AskStackView", function() {
    var askStackView;
    askStackView = null;
    beforeEach(function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svc3BlYy9hc2stc3RhY2stdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxZQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQUFmLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxZQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsSUFBZixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBQSxFQURWO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FLQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO2FBQ3RDLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSxZQUFZLENBQUMsWUFBYixDQUFBLENBQUEsQ0FBQTtlQUVBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxZQUFZLENBQUMsYUFBcEIsQ0FBa0MsQ0FBQyxPQUFuQyxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxTQUFwQixDQUE4QixDQUFDLE9BQS9CLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sWUFBWSxDQUFDLFVBQXBCLENBQStCLENBQUMsT0FBaEMsQ0FBQSxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxTQUFwQixDQUE4QixDQUFDLE9BQS9CLENBQUEsRUFKRztRQUFBLENBQUwsRUFIZ0M7TUFBQSxDQUFsQyxFQURzQztJQUFBLENBQXhDLEVBTnVCO0VBQUEsQ0FBekIsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/spec/ask-stack-view-spec.coffee
