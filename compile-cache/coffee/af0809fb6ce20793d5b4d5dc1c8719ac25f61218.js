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
      if (kernel != null) {
        commands = _.map(_.cloneDeep(this.basicCommands), function(command) {
          command.name = _.capitalize(language) + ' kernel: ' + command.name;
          command.language = language;
          return command;
        });
        return this.setItems(commands);
      } else {
        return this.setItems([]);
      }
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
