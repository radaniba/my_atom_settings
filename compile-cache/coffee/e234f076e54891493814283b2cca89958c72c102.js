(function() {
  var $, CompositeDisposable, ForkGistIdInputView, TextEditorView, View, oldView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  oldView = null;

  module.exports = ForkGistIdInputView = (function(_super) {
    __extends(ForkGistIdInputView, _super);

    function ForkGistIdInputView() {
      return ForkGistIdInputView.__super__.constructor.apply(this, arguments);
    }

    ForkGistIdInputView.content = function() {
      return this.div({
        "class": 'command-palette'
      }, (function(_this) {
        return function() {
          return _this.subview('selectEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Gist ID to fork'
          }));
        };
      })(this));
    };

    ForkGistIdInputView.prototype.initialize = function() {
      if (oldView != null) {
        oldView.destroy();
      }
      oldView = this;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function() {
          return _this.confirm();
        };
      })(this)));
      this.disposables.add(atom.commands.add('atom-text-editor', 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      return this.attach();
    };

    ForkGistIdInputView.prototype.destroy = function() {
      this.disposables.dispose();
      return this.detach();
    };

    ForkGistIdInputView.prototype.attach = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.selectEditor.focus();
    };

    ForkGistIdInputView.prototype.detach = function() {
      this.panel.destroy();
      return ForkGistIdInputView.__super__.detach.apply(this, arguments);
    };

    ForkGistIdInputView.prototype.confirm = function() {
      var gistId;
      gistId = this.selectEditor.getText();
      this.callbackInstance.forkGistId(gistId);
      return this.destroy();
    };

    ForkGistIdInputView.prototype.setCallbackInstance = function(callbackInstance) {
      return this.callbackInstance = callbackInstance;
    };

    return ForkGistIdInputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9mb3JrLWdpc3RpZC1pbnB1dC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxPQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFBLENBQUQsRUFBSSxzQkFBQSxjQUFKLEVBQW9CLFlBQUEsSUFEcEIsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxJQUhWLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNRO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGlCQUFQO09BQUwsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDN0IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQTZCLElBQUEsY0FBQSxDQUFlO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQVksZUFBQSxFQUFpQixpQkFBN0I7V0FBZixDQUE3QixFQUQ2QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTs7UUFDVixPQUFPLENBQUUsT0FBVCxDQUFBO09BQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxJQURWLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUhmLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLGNBQXRDLEVBQXNELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQsQ0FBakIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQyxhQUF0QyxFQUFxRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJELENBQWpCLENBTEEsQ0FBQTthQU1BLElBQUMsQ0FBQSxNQUFELENBQUEsRUFQVTtJQUFBLENBSlosQ0FBQTs7QUFBQSxrQ0FhQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRk87SUFBQSxDQWJULENBQUE7O0FBQUEsa0NBaUJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7O1FBQ04sSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQUFWO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsQ0FBQSxFQUhNO0lBQUEsQ0FqQlIsQ0FBQTs7QUFBQSxrQ0FzQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO2FBQ0EsaURBQUEsU0FBQSxFQUZNO0lBQUEsQ0F0QlIsQ0FBQTs7QUFBQSxrQ0EwQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFVBQWxCLENBQTZCLE1BQTdCLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFELENBQUEsRUFITztJQUFBLENBMUJULENBQUE7O0FBQUEsa0NBK0JBLG1CQUFBLEdBQXFCLFNBQUMsZ0JBQUQsR0FBQTthQUNuQixJQUFDLENBQUEsZ0JBQUQsR0FBb0IsaUJBREQ7SUFBQSxDQS9CckIsQ0FBQTs7K0JBQUE7O0tBRGdDLEtBTnBDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/lib/fork-gistid-input-view.coffee
