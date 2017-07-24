(function() {
  var KernelManager, SelectListView, SignalListView, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  _ = require('lodash');

  KernelManager = require('./kernel-manager');

  module.exports = SignalListView = (function(_super) {
    __extends(SignalListView, _super);

    function SignalListView() {
      return SignalListView.__super__.constructor.apply(this, arguments);
    }

    SignalListView.prototype.initialize = function() {
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
      var kernels;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.focusFilterEditor();
      kernels = KernelManager.getAllRunningKernels();
      this.languageOptions = _.map(kernels, function(kernel) {
        return {
          name: kernel.kernelSpec.display_name,
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2gtbGFuZ3VhZ2UtcGlja2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FIaEIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNSLE1BQUEsZ0RBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFKZixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsUUFBRCxDQUFVLHVCQUFWLENBTEEsQ0FBQTthQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLGFBQWYsRUFQUTtJQUFBLENBQVosQ0FBQTs7QUFBQSw2QkFVQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1YsT0FEVTtJQUFBLENBVmQsQ0FBQTs7QUFBQSw2QkFhQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURLO0lBQUEsQ0FiVCxDQUFBOztBQUFBLDZCQWdCQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QixDQUFWLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLElBQUksQ0FBQyxJQUQzQixDQUFBO2FBRUEsUUFIUztJQUFBLENBaEJiLENBQUE7O0FBQUEsNkJBcUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7O1lBQU0sQ0FBRSxPQUFSLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQURULENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBSEg7SUFBQSxDQXJCWCxDQUFBOztBQUFBLDZCQTBCQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDUCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksbUJBQVosRUFBaUMsSUFBakMsQ0FBQSxDQUFBOztRQUNBLElBQUMsQ0FBQSxZQUFhO09BRGQ7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSE87SUFBQSxDQTFCWCxDQUFBOztBQUFBLDZCQStCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0osVUFBQSxPQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQURWO0FBQUEsTUFFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxhQUFhLENBQUMsb0JBQWQsQ0FBQSxDQUpWLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUMsQ0FBQyxHQUFGLENBQU0sT0FBTixFQUFlLFNBQUMsTUFBRCxHQUFBO0FBQzlCLGVBQU87QUFBQSxVQUNILElBQUEsRUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBRHJCO0FBQUEsVUFFSCxLQUFBLEVBQU8sTUFBTSxDQUFDLFFBRlg7QUFBQSxVQUdILE1BQUEsRUFBUSxNQUhMO1NBQVAsQ0FEOEI7TUFBQSxDQUFmLENBTG5CLENBQUE7YUFZQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxlQUFYLEVBYkk7SUFBQSxDQS9CUixDQUFBOztBQUFBLDZCQThDQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNiLDRCQURhO0lBQUEsQ0E5Q2pCLENBQUE7O0FBQUEsNkJBaURBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUcsa0JBQUg7ZUFDSSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREo7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBYjtlQUNELElBQUMsQ0FBQSxNQUFELENBQUEsRUFEQztPQUhEO0lBQUEsQ0FqRFIsQ0FBQTs7MEJBQUE7O0tBRHlCLGVBUDdCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watch-language-picker.coffee
