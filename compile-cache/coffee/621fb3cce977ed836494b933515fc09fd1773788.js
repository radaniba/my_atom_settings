(function() {
  var $, AskStackResultView, EditorView, WorkspaceView, _ref;

  _ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, WorkspaceView = _ref.WorkspaceView;

  AskStackResultView = require('../lib/ask-stack-result-view');

  describe("AskStackResultView", function() {
    var resultView;
    resultView = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return resultView = new AskStackResultView();
    });
    describe("when search returns no result", function() {
      return it("displays a proper messaged is displayed", function() {
        var json;
        json = require('./data/no_matches.json');
        resultView.renderAnswers(json, false);
        return runs(function() {
          var text;
          text = resultView.text();
          return expect(text).toBe("Your search returned no matches.");
        });
      });
    });
    return describe("when search returns a list of results", function() {
      return it("only shows a maximum of 5 results", function() {
        var json;
        json = require('./data/data.json');
        resultView.renderAnswers(json, false);
        return runs(function() {
          var results;
          results = resultView.find("#results-view").children().length;
          return expect(results).toBe(5);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svc3BlYy9hc2stc3RhY2stcmVzdWx0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0RBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLGtCQUFBLFVBQUosRUFBZ0IscUJBQUEsYUFBaEIsQ0FBQTs7QUFBQSxFQUVBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw4QkFBUixDQUZyQixDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixRQUFBLFVBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFiLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxhQUFMLEdBQXFCLEdBQUEsQ0FBQSxhQUFyQixDQUFBO2FBRUEsVUFBQSxHQUFpQixJQUFBLGtCQUFBLENBQUEsRUFIUjtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFPQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQSxHQUFBO2FBQ3hDLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLHdCQUFSLENBQVAsQ0FBQTtBQUFBLFFBRUEsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsSUFBekIsRUFBK0IsS0FBL0IsQ0FGQSxDQUFBO2VBSUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FBUCxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxJQUFiLENBQWtCLGtDQUFsQixFQUZHO1FBQUEsQ0FBTCxFQUw0QztNQUFBLENBQTlDLEVBRHdDO0lBQUEsQ0FBMUMsQ0FQQSxDQUFBO1dBaUJBLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7YUFDaEQsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsa0JBQVIsQ0FBUCxDQUFBO0FBQUEsUUFFQSxVQUFVLENBQUMsYUFBWCxDQUF5QixJQUF6QixFQUErQixLQUEvQixDQUZBLENBQUE7ZUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxPQUFBO0FBQUEsVUFBQSxPQUFBLEdBQVUsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsZUFBaEIsQ0FBZ0MsQ0FBQyxRQUFqQyxDQUFBLENBQTJDLENBQUMsTUFBdEQsQ0FBQTtpQkFDQSxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsSUFBaEIsQ0FBcUIsQ0FBckIsRUFGRztRQUFBLENBQUwsRUFMc0M7TUFBQSxDQUF4QyxFQURnRDtJQUFBLENBQWxELEVBbEI2QjtFQUFBLENBQS9CLENBSkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/spec/ask-stack-result-view-spec.coffee
