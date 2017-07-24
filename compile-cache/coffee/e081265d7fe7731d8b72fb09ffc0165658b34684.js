(function() {
  var SelectListView, SignalListView, WSKernel, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  _ = require('lodash');

  WSKernel = require('./ws-kernel');

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
          value: 'interrupt-kernel'
        }, {
          name: 'Restart',
          value: 'restart-kernel'
        }, {
          name: 'Shut Down',
          value: 'shutdown-kernel'
        }
      ];
      this.wsKernelCommands = [
        {
          name: 'Rename session for',
          value: 'rename-kernel'
        }, {
          name: 'Disconnect from',
          value: 'disconnect-kernel'
        }
      ];
      this.onConfirmed = null;
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
      var basicCommands, grammar, kernel, language, wsKernelCommands;
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
      basicCommands = this.basicCommands.map((function(_this) {
        return function(command) {
          return {
            name: _this._getCommandName(command.name, kernel.kernelSpec),
            command: command.value,
            grammar: grammar,
            language: language,
            kernel: kernel
          };
        };
      })(this));
      if (kernel instanceof WSKernel) {
        wsKernelCommands = this.wsKernelCommands.map((function(_this) {
          return function(command) {
            return {
              name: _this._getCommandName(command.name, kernel.kernelSpec),
              command: command.value,
              grammar: grammar,
              language: language,
              kernel: kernel
            };
          };
        })(this));
        return this.setItems(_.union(basicCommands, wsKernelCommands));
      } else {
        return this.kernelManager.getAllKernelSpecsFor(language, (function(_this) {
          return function(kernelSpecs) {
            var switchCommands;
            _.pull(kernelSpecs, kernel.kernelSpec);
            switchCommands = kernelSpecs.map(function(kernelSpec) {
              return {
                name: _this._getCommandName('Switch to', kernelSpec),
                command: 'switch-kernel',
                grammar: grammar,
                language: language,
                kernelSpec: kernelSpec
              };
            });
            return _this.setItems(_.union(basicCommands, switchCommands));
          };
        })(this));
      }
    };

    SignalListView.prototype._getCommandName = function(name, kernelSpec) {
      return name + ' ' + kernelSpec.display_name + ' kernel';
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc2lnbmFsLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUhYLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0YscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLFVBQUEsR0FBWSxTQUFFLGFBQUYsR0FBQTtBQUNSLE1BRFMsSUFBQyxDQUFBLGdCQUFBLGFBQ1YsQ0FBQTtBQUFBLE1BQUEsZ0RBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCO1FBQ2I7QUFBQSxVQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsVUFDQSxLQUFBLEVBQU8sa0JBRFA7U0FEYSxFQUliO0FBQUEsVUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFVBQ0EsS0FBQSxFQUFPLGdCQURQO1NBSmEsRUFPYjtBQUFBLFVBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxVQUNBLEtBQUEsRUFBTyxpQkFEUDtTQVBhO09BRmpCLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtRQUNoQjtBQUFBLFVBQUEsSUFBQSxFQUFNLG9CQUFOO0FBQUEsVUFDQSxLQUFBLEVBQU8sZUFEUDtTQURnQixFQUloQjtBQUFBLFVBQUEsSUFBQSxFQUFNLGlCQUFOO0FBQUEsVUFDQSxLQUFBLEVBQU8sbUJBRFA7U0FKZ0I7T0FicEIsQ0FBQTtB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/signal-list-view.coffee
