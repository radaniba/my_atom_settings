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
      var basicCommands, grammar, grammarLanguage, kernel, kernelSpecs, switchCommands;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.focusFilterEditor();
      grammar = this.editor.getGrammar();
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernel = KernelManager.getRunningKernelFor(grammarLanguage);
      if (kernel == null) {
        return this.setItems([]);
      }
      basicCommands = this.basicCommands.map(function(command) {
        return {
          name: _.capitalize(grammarLanguage + ' kernel: ' + command.name),
          value: command.value,
          grammar: grammar,
          language: grammarLanguage,
          kernel: kernel
        };
      });
      kernelSpecs = KernelManager.getAllKernelSpecsFor(grammarLanguage);
      switchCommands = kernelSpecs.map(function(spec) {
        spec.grammarLanguage = grammarLanguage;
        return {
          name: 'Switch to ' + spec.display_name,
          value: 'switch-kernel',
          grammar: grammar,
          language: grammarLanguage,
          kernelSpec: spec
        };
      });
      return this.setItems(_.union(basicCommands, switchCommands));
    };

    SignalListView.prototype.confirmed = function(item) {
      console.log('Selected command:', item);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc2lnbmFsLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0YscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtRQUNiO0FBQUEsVUFDSSxJQUFBLEVBQU0sV0FEVjtBQUFBLFVBRUksS0FBQSxFQUFPLGtCQUZYO0FBQUEsVUFHSSxRQUFBLEVBQVUsSUFIZDtTQURhLEVBTWI7QUFBQSxVQUNJLElBQUEsRUFBTSxTQURWO0FBQUEsVUFFSSxLQUFBLEVBQU8sZ0JBRlg7QUFBQSxVQUdJLFFBQUEsRUFBVSxJQUhkO1NBTmE7T0FGakIsQ0FBQTtBQUFBLE1BZUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQWZmLENBQUE7QUFBQSxNQWdCQSxJQUFDLENBQUEsUUFBRCxDQUFVLHdCQUFWLENBaEJBLENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBZSxhQUFmLENBakJBLENBQUE7YUFrQkEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxFQUFWLEVBbkJRO0lBQUEsQ0FBWixDQUFBOztBQUFBLDZCQXNCQSxNQUFBLEdBQVEs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/signal-list-view.coffee
