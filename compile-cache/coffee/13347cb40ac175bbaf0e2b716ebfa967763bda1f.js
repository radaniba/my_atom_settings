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
      this.languageOptions = _.map(this.getKernelSpecs(), function(kernelSpec) {
        return {
          name: kernelSpec.display_name,
          kernelSpec: kernelSpec
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLXBpY2tlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUUsY0FBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsaUJBQUEsY0FDVixDQUFBO0FBQUEsTUFBQSxnREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUZmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELENBQVUsdUJBQVYsQ0FIQSxDQUFBO2FBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQWUsYUFBZixFQUxRO0lBQUEsQ0FBWixDQUFBOztBQUFBLDZCQVFBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDVixPQURVO0lBQUEsQ0FSZCxDQUFBOztBQUFBLDZCQVdBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREs7SUFBQSxDQVhULENBQUE7O0FBQUEsNkJBY0EsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixHQUFzQixJQUFJLENBQUMsSUFEM0IsQ0FBQTthQUVBLFFBSFM7SUFBQSxDQWRiLENBQUE7O0FBQUEsNkJBbUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7O1lBQU0sQ0FBRSxPQUFSLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQURULENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBSEg7SUFBQSxDQW5CWCxDQUFBOztBQUFBLDZCQXdCQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDUCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksbUJBQVosRUFBaUMsSUFBakMsQ0FBQSxDQUFBOztRQUNBLElBQUMsQ0FBQSxZQUFhO09BRGQ7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSE87SUFBQSxDQXhCWCxDQUFBOztBQUFBLDZCQTZCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQURWO0FBQUEsTUFFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFOLEVBQXlCLFNBQUMsVUFBRCxHQUFBO0FBQ3hDLGVBQU87QUFBQSxVQUNILElBQUEsRUFBTSxVQUFVLENBQUMsWUFEZDtBQUFBLFVBRUgsVUFBQSxFQUFZLFVBRlQ7U0FBUCxDQUR3QztNQUFBLENBQXpCLENBSm5CLENBQUE7YUFVQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxlQUFYLEVBWEk7SUFBQSxDQTdCUixDQUFBOztBQUFBLDZCQTBDQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNiLDRCQURhO0lBQUEsQ0ExQ2pCLENBQUE7O0FBQUEsNkJBNkNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUcsa0JBQUg7ZUFDSSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREo7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBYjtlQUNELElBQUMsQ0FBQSxNQUFELENBQUEsRUFEQztPQUhEO0lBQUEsQ0E3Q1IsQ0FBQTs7MEJBQUE7O0tBRHlCLGVBTDdCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-picker.coffee
