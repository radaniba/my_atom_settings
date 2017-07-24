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

    SignalListView.prototype.initialize = function(kernelManager) {
      this.kernelManager = kernelManager;
      SignalListView.__super__.initialize.apply(this, arguments);
      this.basicCommands = [
        {
          name: 'Interrupt',
          value: 'interrupt-kernel',
          language: null
        }, {
          name: 'Restart',
          value: 'restart-kernel',
          language: null
        }
      ];
      this.onConfirmed = null;
      this.addClass('kernel-signal-selector');
      this.list.addClass('mark-active');
      return this.setItems([]);
    };

    SignalListView.prototype.toggle = function() {
      if (this.panel != null) {
        return this.cancel();
      } else if (this.editor = atom.workspace.getActiveTextEditor()) {
        return this.attach();
      }
    };

    SignalListView.prototype.attach = function() {
      var basicCommands, grammar, kernel, kernelSpecs, language, switchCommands;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.focusFilterEditor();
      grammar = this.editor.getGrammar();
      language = this.kernelManager.getLanguageFor(grammar);
      kernel = this.kernelManager.getRunningKernelFor(language);
      if (kernel == null) {
        return this.setItems([]);
      }
      basicCommands = this.basicCommands.map(function(command) {
        var name;
        name = command.name + ' ' + kernel.kernelSpec.display_name + ' kernel';
        return {
          name: name,
          value: command.value,
          grammar: grammar,
          language: language,
          kernel: kernel
        };
      });
      kernelSpecs = this.kernelManager.getAllKernelSpecsFor(language);
      switchCommands = kernelSpecs.map(function(spec) {
        return {
          name: 'Switch to ' + spec.display_name,
          value: 'switch-kernel',
          grammar: grammar,
          language: language,
          kernelSpec: spec
        };
      });
      return this.setItems(_.union(basicCommands, switchCommands));
    };

    SignalListView.prototype.confirmed = function(item) {
      console.log('Selected command:', item);
      item.command = item.value;
      if (typeof this.onConfirmed === "function") {
        this.onConfirmed(item);
      }
      return this.cancel();
    };

    SignalListView.prototype.getEmptyMessage = function() {
      return 'No running kernels for this file type.';
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

    return SignalListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc2lnbmFsLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUUsYUFBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsZ0JBQUEsYUFDVixDQUFBO0FBQUEsTUFBQSxnREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7UUFDYjtBQUFBLFVBQ0ksSUFBQSxFQUFNLFdBRFY7QUFBQSxVQUVJLEtBQUEsRUFBTyxrQkFGWDtBQUFBLFVBR0ksUUFBQSxFQUFVLElBSGQ7U0FEYSxFQU1iO0FBQUEsVUFDSSxJQUFBLEVBQU0sU0FEVjtBQUFBLFVBRUksS0FBQSxFQUFPLGdCQUZYO0FBQUEsVUFHSSxRQUFBLEVBQVUsSUFIZDtTQU5hO09BRmpCLENBQUE7QUFBQSxNQWVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFmZixDQUFBO0FBQUEsTUFnQkEsSUFBQyxDQUFBLFFBQUQsQ0FBVSx3QkFBVixDQWhCQSxDQUFBO0FBQUEsTUFpQkEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQWUsYUFBZixDQWpCQSxDQUFBO2FBa0JBLElBQUMsQ0FBQSxRQUFELENBQVUsRUFBVixFQW5CUTtJQUFBLENBQVosQ0FBQTs7QUFBQSw2QkFzQkEsTUFBQSxHQUFRLFNBQUEsR0FB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/signal-list-view.coffee
