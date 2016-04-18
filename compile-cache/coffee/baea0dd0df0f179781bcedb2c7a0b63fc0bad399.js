(function() {
  var SelectListView, SignalListView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  SignalListView = (function(_super) {
    __extends(SignalListView, _super);

    function SignalListView() {
      return SignalListView.__super__.constructor.apply(this, arguments);
    }

    SignalListView.prototype.initialize = function() {
      SignalListView.__super__.initialize.apply(this, arguments);
      this.onConfirmed = null;
      return this.list.addClass('mark-active');
    };

    SignalListView.prototype.getFilterKey = function() {
      return 'name';
    };

    SignalListView.prototype.destroy = function() {
      return this.cancel();
    };

    SignalListView.prototype.viewForItem = function(item) {
      var element;
      element = document.createElement('li');
      element.textContent = item.name;
      return element;
    };

    SignalListView.prototype.cancelled = function() {
      var _ref;
      if ((_ref = this.panel) != null) {
        _ref.destroy();
      }
      this.panel = null;
      return this.editor = null;
    };

    SignalListView.prototype.confirmed = function(item) {
      console.log("Selected command:", item);
      if (this.onConfirmed != null) {
        this.onConfirmed(item);
      }
      return this.cancel();
    };

    SignalListView.prototype.attach = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      return this.focusFilterEditor();
    };

    SignalListView.prototype.getEmptyMessage = function() {
      return "No watches found.";
    };

    SignalListView.prototype.toggle = function() {
      if (this.panel != null) {
        return this.cancel();
      } else if (this.editor = atom.workspace.getActiveTextEditor()) {
        return this.attach();
      }
    };

    return SignalListView;

  })(SelectListView);

  module.exports = new SignalListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2hlcy1waWNrZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUVNO0FBQ0YscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBRGYsQ0FBQTthQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLGFBQWYsRUFIUTtJQUFBLENBQVosQ0FBQTs7QUFBQSw2QkFLQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsT0FBSDtJQUFBLENBTGQsQ0FBQTs7QUFBQSw2QkFPQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURLO0lBQUEsQ0FQVCxDQUFBOztBQUFBLDZCQVVBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLFdBQVIsR0FBc0IsSUFBSSxDQUFDLElBRDNCLENBQUE7YUFFQSxRQUhTO0lBQUEsQ0FWYixDQUFBOztBQUFBLDZCQWVBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7O1lBQU0sQ0FBRSxPQUFSLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQURULENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBSEg7SUFBQSxDQWZYLENBQUE7O0FBQUEsNkJBb0JBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxJQUFqQyxDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsd0JBQUg7QUFDSSxRQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixDQUFBLENBREo7T0FGQTthQUlBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFMTztJQUFBLENBcEJYLENBQUE7O0FBQUEsNkJBMkJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BRFY7YUFFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUhJO0lBQUEsQ0EzQlIsQ0FBQTs7QUFBQSw2QkFnQ0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDYixvQkFEYTtJQUFBLENBaENqQixDQUFBOztBQUFBLDZCQW1DQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFHLGtCQUFIO2VBQ0ksSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURKO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWI7ZUFDRCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREM7T0FIRDtJQUFBLENBbkNSLENBQUE7OzBCQUFBOztLQUR5QixlQUY3QixDQUFBOztBQUFBLEVBNENBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEdBQUEsQ0FBQSxjQTVDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watches-picker.coffee
