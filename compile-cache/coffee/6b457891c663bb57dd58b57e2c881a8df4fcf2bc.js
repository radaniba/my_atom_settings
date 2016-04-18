(function() {
  var Disposable, IndentationManager, IndentationStatusView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Disposable = require('atom').Disposable;

  IndentationManager = require('./indentation-manager');

  IndentationStatusView = (function(_super) {
    __extends(IndentationStatusView, _super);

    function IndentationStatusView() {
      return IndentationStatusView.__super__.constructor.apply(this, arguments);
    }

    IndentationStatusView.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
      this.classList.add('indentation-status', 'inline-block');
      this.indentationLink = document.createElement('a');
      this.indentationLink.classList.add('inline-block');
      this.indentationLink.href = '#';
      this.appendChild(this.indentationLink);
      this.handleEvents();
      return this;
    };

    IndentationStatusView.prototype.attach = function() {
      var _ref;
      if ((_ref = this.statusBarTile) != null) {
        _ref.destroy();
      }
      this.statusBarTile = atom.config.get('auto-detect-indentation.showSpacingInStatusBar') ? this.statusBar.addRightTile({
        item: this,
        priority: 10
      }) : void 0;
      return this.updateIndentationText();
    };

    IndentationStatusView.prototype.handleEvents = function() {
      var clickHandler;
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.configSubscription = atom.config.observe('auto-detect-indentation.showSpacingInStatusBar', (function(_this) {
        return function() {
          return _this.attach();
        };
      })(this));
      clickHandler = (function(_this) {
        return function() {
          return atom.commands.dispatch(atom.views.getView(_this.getActiveTextEditor()), 'auto-detect-indentation:show-indentation-selector');
        };
      })(this);
      this.addEventListener('click', clickHandler);
      this.clickSubscription = new Disposable((function(_this) {
        return function() {
          return _this.removeEventListener('click', clickHandler);
        };
      })(this));
      return this.subscribeToActiveTextEditor();
    };

    IndentationStatusView.prototype.destroy = function() {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if ((_ref = this.activeItemSubscription) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.indentationSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.paneOpenSubscription) != null) {
        _ref2.dispose();
      }
      if ((_ref3 = this.paneCreateSubscription) != null) {
        _ref3.dispose();
      }
      if ((_ref4 = this.paneDestroySubscription) != null) {
        _ref4.dispose();
      }
      if ((_ref5 = this.clickSubscription) != null) {
        _ref5.dispose();
      }
      if ((_ref6 = this.configSubscription) != null) {
        _ref6.dispose();
      }
      return this.statusBarTile.destroy();
    };

    IndentationStatusView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    IndentationStatusView.prototype.subscribeToActiveTextEditor = function() {
      var editor, workspace, _ref, _ref1, _ref2, _ref3, _ref4;
      workspace = atom.workspace;
      editor = workspace.getActiveTextEditor();
      if ((_ref = this.indentationSubscription) != null) {
        _ref.dispose();
      }
      this.indentationSubscription = editor != null ? (_ref1 = editor.emitter) != null ? _ref1.on('did-change-indentation', (function(_this) {
        return function() {
          return _this.updateIndentationText();
        };
      })(this)) : void 0 : void 0;
      if ((_ref2 = this.paneOpenSubscription) != null) {
        _ref2.dispose();
      }
      this.paneOpenSubscription = workspace.onDidOpen((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      if ((_ref3 = this.paneCreateSubscription) != null) {
        _ref3.dispose();
      }
      this.paneCreateSubscription = workspace.onDidAddPane((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      if ((_ref4 = this.paneDestroySubscription) != null) {
        _ref4.dispose();
      }
      this.paneDestroySubscription = workspace.onDidDestroyPaneItem((function(_this) {
        return function(event) {
          return _this.updateIndentationText();
        };
      })(this));
      return this.updateIndentationText();
    };

    IndentationStatusView.prototype.updateIndentationText = function() {
      var editor, indentationName;
      editor = this.getActiveTextEditor();
      if (editor) {
        indentationName = IndentationManager.getIndentation(editor);
        this.indentationLink.textContent = indentationName;
        return this.style.display = '';
      } else {
        return this.style.display = 'none';
      }
    };

    return IndentationStatusView;

  })(HTMLDivElement);

  module.exports = document.registerElement('indentation-selector-status', {
    prototype: IndentationStatusView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi9saWIvaW5kZW50YXRpb24tc3RhdHVzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBRHJCLENBQUE7O0FBQUEsRUFHTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxvQ0FBQSxVQUFBLEdBQVksU0FBRSxTQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxZQUFBLFNBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsb0JBQWYsRUFBcUMsY0FBckMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQURuQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixjQUEvQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsR0FBd0IsR0FIeEIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZUFBZCxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FMQSxDQUFBO2FBTUEsS0FQVTtJQUFBLENBQVosQ0FBQTs7QUFBQSxvQ0FTQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxJQUFBOztZQUFjLENBQUUsT0FBaEIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/indentation-status-view.coffee
