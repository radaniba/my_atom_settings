(function() {
  var $, InputView, TextEditorView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  module.exports = InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      this.close = __bind(this.close, this);
      this.confirm = __bind(this.confirm, this);
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function(prompt) {
      this.prompt = prompt;
      if (this.prompt === '') {
        this.prompt = 'Kernel requires input';
      }
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

    InputView.prototype.initialize = function(prompt, onConfirmed) {
      this.prompt = prompt;
      this.onConfirmed = onConfirmed;
      return atom.commands.add(this.element, {
        'core:confirm': this.confirm
      });
    };

    InputView.prototype.storeFocusedElement = function() {
      return this.previouslyFocusedElement = $(document.activeElement);
    };

    InputView.prototype.restoreFocus = function() {
      var _ref1;
      return (_ref1 = this.previouslyFocusedElement) != null ? _ref1.focus() : void 0;
    };

    InputView.prototype.confirm = function() {
      var text;
      text = this.miniEditor.getText();
      if (typeof this.onConfirmed === "function") {
        this.onConfirmed(text);
      }
      return this.close();
    };

    InputView.prototype.close = function() {
      var _ref1;
      if ((_ref1 = this.panel) != null) {
        _ref1.destroy();
      }
      this.panel = null;
      return this.restoreFocus();
    };

    InputView.prototype.attach = function() {
      this.storeFocusedElement();
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    return InputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvaW5wdXQtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxPQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFBLENBQUQsRUFBSSxzQkFBQSxjQUFKLEVBQW9CLFlBQUEsSUFBcEIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixnQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBRSxNQUFGLEdBQUE7QUFDTixNQURPLElBQUMsQ0FBQSxTQUFBLE1BQ1IsQ0FBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLEVBQWQ7QUFDSSxRQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsdUJBQVYsQ0FESjtPQUFBO2FBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0QsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEtBQUMsQ0FBQSxNQUFSLEVBQWdCO0FBQUEsWUFBQSxPQUFBLEVBQU8sdUJBQVA7QUFBQSxZQUFnQyxNQUFBLEVBQVEsWUFBeEM7V0FBaEIsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47V0FBZixDQUEzQixFQUZDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQUhNO0lBQUEsQ0FBVixDQUFBOztBQUFBLHdCQU9BLFVBQUEsR0FBWSxTQUFFLE1BQUYsRUFBVyxXQUFYLEdBQUE7QUFDUixNQURTLElBQUMsQ0FBQSxTQUFBLE1BQ1YsQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxjQUFBLFdBQ25CLENBQUE7YUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ0k7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLE9BQWpCO09BREosRUFEUTtJQUFBLENBUFosQ0FBQTs7QUFBQSx3QkFZQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7YUFDakIsSUFBQyxDQUFBLHdCQUFELEdBQTRCLENBQUEsQ0FBRSxRQUFRLENBQUMsYUFBWCxFQURYO0lBQUEsQ0FackIsQ0FBQTs7QUFBQSx3QkFlQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1YsVUFBQSxLQUFBO29FQUF5QixDQUFFLEtBQTNCLENBQUEsV0FEVTtJQUFBLENBZmQsQ0FBQTs7QUFBQSx3QkFrQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNMLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQVAsQ0FBQTs7UUFDQSxJQUFDLENBQUEsWUFBYTtPQURkO2FBRUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQUhLO0lBQUEsQ0FsQlQsQ0FBQTs7QUFBQSx3QkF1QkEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNILFVBQUEsS0FBQTs7YUFBTSxDQUFFLE9BQVIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBRFQsQ0FBQTthQUVBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIRztJQUFBLENBdkJQLENBQUE7O0FBQUEsd0JBNEJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBUDtPQUE3QixDQURULENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsc0JBQXZCLENBQUEsRUFKSTtJQUFBLENBNUJSLENBQUE7O3FCQUFBOztLQURvQixLQUh4QixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/input-view.coffee
