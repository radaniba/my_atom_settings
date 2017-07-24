(function() {
  var AnsiToHtml, OutputView, ansiToHtml, text;

  AnsiToHtml = require('ansi-to-html');

  ansiToHtml = new AnsiToHtml();

  OutputView = require('../../lib/views/output-view');

  text = "foo bar baz";

  describe("OutputView", function() {
    beforeEach(function() {
      return this.view = new OutputView;
    });
    it("displays a default message", function() {
      return expect(this.view.find('.output').text()).toContain('Nothing new to show');
    });
    it("displays the new message when ::finish is called", function() {
      this.view.setContent(text);
      this.view.finish();
      return expect(this.view.find('.output').text()).toBe(text);
    });
    it("resets its html property when ::reset is called", function() {
      this.view.setContent(text);
      this.view.reset();
      return expect(this.view.find('.output').text()).toContain('Nothing new to show');
    });
    return describe("::setContent", function() {
      it("accepts terminal color encoded text and transforms it into html", function() {
        this.view.setContent("foo[m * [32mmaster[m");
        this.view.finish();
        return expect(this.view.find('.output').html()).toBe('foo * <span style="color:#0A0">master</span>');
      });
      return it("returns the instance of the view to allow method chaining", function() {
        this.view.setContent(text).finish();
        return expect(this.view.find('.output').text()).toBe(text);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL291dHB1dC12aWV3LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQUEsQ0FEakIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsNkJBQVIsQ0FGYixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLGFBSlAsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxJQUFDLENBQUEsSUFBRCxHQUFRLEdBQUEsQ0FBQSxXQURDO0lBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxJQUdBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7YUFDL0IsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBQVAsQ0FBb0MsQ0FBQyxTQUFyQyxDQUErQyxxQkFBL0MsRUFEK0I7SUFBQSxDQUFqQyxDQUhBLENBQUE7QUFBQSxJQU1BLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQU4sQ0FBaUIsSUFBakIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQURBLENBQUE7YUFFQSxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsU0FBWCxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBUCxDQUFvQyxDQUFDLElBQXJDLENBQTBDLElBQTFDLEVBSHFEO0lBQUEsQ0FBdkQsQ0FOQSxDQUFBO0FBQUEsSUFXQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQSxHQUFBO0FBQ3BELE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLElBQWpCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUEsQ0FEQSxDQUFBO2FBRUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBQVAsQ0FBb0MsQ0FBQyxTQUFyQyxDQUErQyxxQkFBL0MsRUFIb0Q7SUFBQSxDQUF0RCxDQVhBLENBQUE7V0FnQkEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUEsR0FBQTtBQUNwRSxRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixDQUFpQix5QkFBakIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsU0FBWCxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBUCxDQUFvQyxDQUFDLElBQXJDLENBQTBDLDhDQUExQyxFQUhvRTtNQUFBLENBQXRFLENBQUEsQ0FBQTthQUtBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBLEdBQUE7QUFDOUQsUUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQU4sQ0FBaUIsSUFBakIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxTQUFYLENBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUFQLENBQW9DLENBQUMsSUFBckMsQ0FBMEMsSUFBMUMsRUFGOEQ7TUFBQSxDQUFoRSxFQU51QjtJQUFBLENBQXpCLEVBakJxQjtFQUFBLENBQXZCLENBTkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/views/output-view-spec.coffee
