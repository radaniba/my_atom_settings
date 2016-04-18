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
          name: "Interrupt",
          value: 'interrupt-kernel',
          language: null
        }, {
          name: "Restart",
          value: 'restart-kernel',
          language: null
        }
      ];
      this.onConfirmed = null;
      this.addClass('kernel-signal-selector');
      this.list.addClass('mark-active');
      return this.setItems([]);
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

    SignalListView.prototype.getSwitchKernelCommands = function(language) {
      var kernel, kernels, _i, _len, _ref;
      kernels = [];
      _ref = KernelManager.getAvailableKernels();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        kernel = _ref[_i];
        if (!(kernel.language === language)) {
          continue;
        }
        kernel.grammarLanguage = language;
        kernels.push({
          name: "Switch to " + kernel.display_name,
          value: 'switch-kernel',
          kernelInfo: kernel,
          grammar: this.editor.getGrammar().name.toLowerCase()
        });
      }
      return kernels;
    };

    SignalListView.prototype.attach = function() {
      var commands, kernel, language;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.focusFilterEditor();
      language = this.editor.getGrammar().name.toLowerCase();
      language = KernelManager.getTrueLanguage(language);
      kernel = KernelManager.getRunningKernelForLanguage(language);
      if (kernel == null) {
        return this.setItems([]);
      }
      commands = _.map(_.cloneDeep(this.basicCommands), function(command) {
        command.name = _.capitalize(language) + ' kernel: ' + command.name;
        command.language = language;
        return command;
      });
      return this.setItems(_.union(commands, this.getSwitchKernelCommands(language)));
    };

    SignalListView.prototype.getEmptyMessage = function() {
      return "No running kernels for this file type.";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc2lnbmFsLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0YscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtRQUNiO0FBQUEsVUFDSSxJQUFBLEVBQU0sV0FEVjtBQUFBLFVBRUksS0FBQSxFQUFPLGtCQUZYO0FBQUEsVUFHSSxRQUFBLEVBQVUsSUFIZDtTQURhLEVBTWI7QUFBQSxVQUNJLElBQUEsRUFBTSxTQURWO0FBQUEsVUFFSSxLQUFBLEVBQU8sZ0JBRlg7QUFBQSxVQUdJLFFBQUEsRUFBVSxJQUhkO1NBTmE7T0FGakIsQ0FBQTtBQUFBLE1BZUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQWZmLENBQUE7QUFBQSxNQWdCQSxJQUFDLENBQUEsUUFBRCxDQUFVLHdCQUFWLENBaEJBLENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBZSxhQUFmLENBakJBLENBQUE7YUFrQkEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxFQUFWLEVBbkJRO0lBQUEsQ0FBWixDQUFBOztBQUFBLDZCQXFCQSxZQUFBLEdBQWMs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/signal-list-view.coffee
