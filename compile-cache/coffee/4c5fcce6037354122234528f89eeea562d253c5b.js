(function() {
  var AskStackResultView;

  AskStackResultView = require('../lib/ask-stack-result-view');

  describe("AskStackResultView", function() {
    var resultView;
    resultView = null;
    beforeEach(function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svc3BlYy9hc2stc3RhY2stcmVzdWx0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsOEJBQVIsQ0FBckIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsVUFBQSxHQUFpQixJQUFBLGtCQUFBLENBQUEsRUFEUjtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFLQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQSxHQUFBO2FBQ3hDLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLHdCQUFSLENBQVAsQ0FBQTtBQUFBLFFBRUEsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsSUFBekIsRUFBK0IsS0FBL0IsQ0FGQSxDQUFBO2VBSUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FBUCxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxJQUFiLENBQWtCLGtDQUFsQixFQUZHO1FBQUEsQ0FBTCxFQUw0QztNQUFBLENBQTlDLEVBRHdDO0lBQUEsQ0FBMUMsQ0FMQSxDQUFBO1dBZUEsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTthQUNoRCxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxrQkFBUixDQUFQLENBQUE7QUFBQSxRQUVBLFVBQVUsQ0FBQyxhQUFYLENBQXlCLElBQXpCLEVBQStCLEtBQS9CLENBRkEsQ0FBQTtlQUlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxVQUFVLENBQUMsSUFBWCxDQUFnQixlQUFoQixDQUFnQyxDQUFDLFFBQWpDLENBQUEsQ0FBMkMsQ0FBQyxNQUF0RCxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxJQUFoQixDQUFxQixDQUFyQixFQUZHO1FBQUEsQ0FBTCxFQUxzQztNQUFBLENBQXhDLEVBRGdEO0lBQUEsQ0FBbEQsRUFoQjZCO0VBQUEsQ0FBL0IsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/spec/ask-stack-result-view-spec.coffee
