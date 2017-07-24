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

    SignalListView.prototype.initialize = function(getKernelSpecs) {
      this.getKernelSpecs = getKernelSpecs;
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
      return this.getKernelSpecs((function(_this) {
        return function(kernelSpec) {
          _this.languageOptions = _.map(kernelSpec, function(kernelSpec) {
            return {
              name: kernelSpec.display_name,
              kernelSpec: kernelSpec
            };
          });
          return _this.setItems(_this.languageOptions);
        };
      })(this));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLXBpY2tlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUUsY0FBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsaUJBQUEsY0FDVixDQUFBO0FBQUEsTUFBQSxnREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUZmLENBQUE7YUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBZSxhQUFmLEVBSlE7SUFBQSxDQUFaLENBQUE7O0FBQUEsNkJBT0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNWLE9BRFU7SUFBQSxDQVBkLENBQUE7O0FBQUEsNkJBVUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNMLElBQUMsQ0FBQSxNQUFELENBQUEsRUFESztJQUFBLENBVlQsQ0FBQTs7QUFBQSw2QkFhQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QixDQUFWLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLElBQUksQ0FBQyxJQUQzQixDQUFBO2FBRUEsUUFIUztJQUFBLENBYmIsQ0FBQTs7QUFBQSw2QkFrQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQTs7WUFBTSxDQUFFLE9BQVIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBRFQsQ0FBQTthQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FISDtJQUFBLENBbEJYLENBQUE7O0FBQUEsNkJBdUJBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxJQUFqQyxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBLFlBQWE7T0FEZDthQUVBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFITztJQUFBLENBdkJYLENBQUE7O0FBQUEsNkJBNEJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BRFY7QUFBQSxNQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBRkEsQ0FBQTthQUlBLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNaLFVBQUEsS0FBQyxDQUFBLGVBQUQsR0FBbUIsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxVQUFOLEVBQWtCLFNBQUMsVUFBRCxHQUFBO0FBQ2pDLG1CQUFPO0FBQUEsY0FDSCxJQUFBLEVBQU0sVUFBVSxDQUFDLFlBRGQ7QUFBQSxjQUVILFVBQUEsRUFBWSxVQUZUO2FBQVAsQ0FEaUM7VUFBQSxDQUFsQixDQUFuQixDQUFBO2lCQU1BLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBQyxDQUFBLGVBQVgsRUFQWTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBTEk7SUFBQSxDQTVCUixDQUFBOztBQUFBLDZCQTBDQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNiLDRCQURhO0lBQUEsQ0ExQ2pCLENBQUE7O0FBQUEsNkJBNkNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUcsa0JBQUg7ZUFDSSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREo7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBYjtlQUNELElBQUMsQ0FBQSxNQUFELENBQUEsRUFEQztPQUhEO0lBQUEsQ0E3Q1IsQ0FBQTs7MEJBQUE7O0tBRHlCLGVBTDdCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-picker.coffee
