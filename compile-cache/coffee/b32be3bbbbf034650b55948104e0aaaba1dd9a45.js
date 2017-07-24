(function() {
  var SelectListView, SignalListView, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  _ = require('lodash');

  module.exports = SignalListView = (function(_super) {
    __extends(SignalListView, _super);

    function SignalListView() {
      return SignalListView.__super__.constructor.apply(this, arguments);
    }

    SignalListView.prototype.initialize = function(getKernels) {
      this.getKernels = getKernels;
      SignalListView.__super__.initialize.apply(this, arguments);
      this.onConfirmed = null;
      this.addClass('watch-language-picker');
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
      console.log('Selected command:', item);
      if (typeof this.onConfirmed === "function") {
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
      this.focusFilterEditor();
      this.languageOptions = _.map(this.getKernels(), function(kernel) {
        return {
          name: kernel.display_name || kernel.kernelSpec.display_name,
          value: kernel.language,
          kernel: kernel
        };
      });
      return this.setItems(this.languageOptions);
    };

    SignalListView.prototype.getEmptyMessage = function() {
      return 'No running kernels found.';
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLXBpY2tlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUUsVUFBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsYUFBQSxVQUNWLENBQUE7QUFBQSxNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBSmYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSx1QkFBVixDQUxBLENBQUE7YUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBZSxhQUFmLEVBUFE7SUFBQSxDQUFaLENBQUE7O0FBQUEsNkJBVUEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNWLE9BRFU7SUFBQSxDQVZkLENBQUE7O0FBQUEsNkJBYUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNMLElBQUMsQ0FBQSxNQUFELENBQUEsRUFESztJQUFBLENBYlQsQ0FBQTs7QUFBQSw2QkFnQkEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixHQUFzQixJQUFJLENBQUMsSUFEM0IsQ0FBQTthQUVBLFFBSFM7SUFBQSxDQWhCYixDQUFBOztBQUFBLDZCQXFCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1AsVUFBQSxJQUFBOztZQUFNLENBQUUsT0FBUixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFEVCxDQUFBO2FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUhIO0lBQUEsQ0FyQlgsQ0FBQTs7QUFBQSw2QkEwQkEsU0FBQSxHQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1AsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1CQUFaLEVBQWlDLElBQWpDLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsWUFBYTtPQURkO2FBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUhPO0lBQUEsQ0ExQlgsQ0FBQTs7QUFBQSw2QkErQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBQSxDQUFBOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7T0FEVjtBQUFBLE1BRUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBTixFQUFxQixTQUFDLE1BQUQsR0FBQTtBQUNwQyxlQUFPO0FBQUEsVUFDSCxJQUFBLEVBQU0sTUFBTSxDQUFDLFlBQVAsSUFBdUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUQ1QztBQUFBLFVBRUgsS0FBQSxFQUFPLE1BQU0sQ0FBQyxRQUZYO0FBQUEsVUFHSCxNQUFBLEVBQVEsTUFITDtTQUFQLENBRG9DO01BQUEsQ0FBckIsQ0FKbkIsQ0FBQTthQVdBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLGVBQVgsRUFaSTtJQUFBLENBL0JSLENBQUE7O0FBQUEsNkJBNkNBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO2FBQ2IsNEJBRGE7SUFBQSxDQTdDakIsQ0FBQTs7QUFBQSw2QkFnREEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBRyxrQkFBSDtlQUNJLElBQUMsQ0FBQSxNQUFELENBQUEsRUFESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFiO2VBQ0QsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURDO09BSEQ7SUFBQSxDQWhEUixDQUFBOzswQkFBQTs7S0FEeUIsZUFMN0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-picker.coffee
