(function() {
  var $, RenameView, TextEditorView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  module.exports = RenameView = (function(_super) {
    __extends(RenameView, _super);

    function RenameView() {
      this.cancel = __bind(this.cancel, this);
      this.confirm = __bind(this.confirm, this);
      return RenameView.__super__.constructor.apply(this, arguments);
    }

    RenameView.content = function(prompt) {
      this.prompt = prompt;
      return this.div((function(_this) {
        return function() {
          _this.label(_this.prompt, {
            "class": 'icon icon-arrow-right',
            outlet: 'promptText'
          });
          return _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
        };
      })(this));
    };

    RenameView.prototype.initialize = function(prompt, _default, onConfirmed) {
      this.prompt = prompt;
      this["default"] = _default;
      this.onConfirmed = onConfirmed;
      atom.commands.add(this.element, {
        'core:confirm': this.confirm,
        'core:cancel': this.cancel
      });
      this.miniEditor.on('blur', (function(_this) {
        return function(e) {
          if (!!document.hasFocus()) {
            return _this.cancel();
          }
        };
      })(this));
      return this.miniEditor.setText(this["default"]);
    };

    RenameView.prototype.storeFocusedElement = function() {
      return this.previouslyFocusedElement = $(document.activeElement);
    };

    RenameView.prototype.restoreFocus = function() {
      var _ref1;
      return (_ref1 = this.previouslyFocusedElement) != null ? _ref1.focus() : void 0;
    };

    RenameView.prototype.confirm = function() {
      var text;
      text = this.miniEditor.getText();
      if (typeof this.onConfirmed === "function") {
        this.onConfirmed(text);
      }
      return this.cancel();
    };

    RenameView.prototype.cancel = function() {
      var _ref1;
      if ((_ref1 = this.panel) != null) {
        _ref1.destroy();
      }
      this.panel = null;
      return this.restoreFocus();
    };

    RenameView.prototype.attach = function() {
      this.storeFocusedElement();
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    return RenameView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvcmVuYW1lLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBQSxDQUFELEVBQUksc0JBQUEsY0FBSixFQUFvQixZQUFBLElBQXBCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0YsaUNBQUEsQ0FBQTs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUUsTUFBRixHQUFBO0FBQ04sTUFETyxJQUFDLENBQUEsU0FBQSxNQUNSLENBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDRCxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sS0FBQyxDQUFBLE1BQVIsRUFBZ0I7QUFBQSxZQUFBLE9BQUEsRUFBTyx1QkFBUDtBQUFBLFlBQWdDLE1BQUEsRUFBUSxZQUF4QztXQUFoQixDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFmLENBQTNCLEVBRkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRE07SUFBQSxDQUFWLENBQUE7O0FBQUEseUJBS0EsVUFBQSxHQUFZLFNBQUUsTUFBRixFQUFVLFFBQVYsRUFBcUIsV0FBckIsR0FBQTtBQUNSLE1BRFMsSUFBQyxDQUFBLFNBQUEsTUFDVixDQUFBO0FBQUEsTUFEa0IsSUFBQyxDQUFBLFNBQUEsSUFBRCxRQUNsQixDQUFBO0FBQUEsTUFENEIsSUFBQyxDQUFBLGNBQUEsV0FDN0IsQ0FBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNJO0FBQUEsUUFBQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxPQUFqQjtBQUFBLFFBQ0EsYUFBQSxFQUFlLElBQUMsQ0FBQSxNQURoQjtPQURKLENBQUEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsTUFBZixFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxDQUFELEdBQUE7QUFDbkIsVUFBQSxJQUFBLENBQUEsQ0FBaUIsUUFBWSxDQUFDLFFBQVQsQ0FBQSxDQUFyQjttQkFBQSxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUE7V0FEbUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQUpBLENBQUE7YUFPQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsSUFBQyxDQUFBLFNBQUEsQ0FBckIsRUFSUTtJQUFBLENBTFosQ0FBQTs7QUFBQSx5QkFlQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7YUFDakIsSUFBQyxDQUFBLHdCQUFELEdBQTRCLENBQUEsQ0FBRSxRQUFRLENBQUMsYUFBWCxFQURYO0lBQUEsQ0FmckIsQ0FBQTs7QUFBQSx5QkFrQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQTtvRUFBeUIsQ0FBRSxLQUEzQixDQUFBLFdBRFU7SUFBQSxDQWxCZCxDQUFBOztBQUFBLHlCQXFCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ0wsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBUCxDQUFBOztRQUNBLElBQUMsQ0FBQSxZQUFhO09BRGQ7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSEs7SUFBQSxDQXJCVCxDQUFBOztBQUFBLHlCQTBCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0osVUFBQSxLQUFBOzthQUFNLENBQUUsT0FBUixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFEVCxDQUFBO2FBRUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUhJO0lBQUEsQ0ExQlIsQ0FBQTs7QUFBQSx5QkErQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxPQUFQO09BQTdCLENBRFQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxzQkFBdkIsQ0FBQSxFQUpJO0lBQUEsQ0EvQlIsQ0FBQTs7c0JBQUE7O0tBRHFCLEtBSHpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/rename-view.coffee
