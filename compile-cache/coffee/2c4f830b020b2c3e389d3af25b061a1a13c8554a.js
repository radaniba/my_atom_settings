(function() {
  var RenameView, TextEditorView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('space-pen').View;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  module.exports = RenameView = (function(_super) {
    __extends(RenameView, _super);

    function RenameView() {
      return RenameView.__super__.constructor.apply(this, arguments);
    }

    RenameView.prototype.initialize = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: true
        });
      }
      return atom.commands.add(this.element, 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    };

    RenameView.prototype.destroy = function() {
      this.panel.hide();
      this.focusout();
      return this.panel.destroy();
    };

    RenameView.content = function(usages) {
      var n, name;
      n = usages.length;
      name = usages[0].name;
      return this.div((function(_this) {
        return function() {
          _this.div("Type new name to replace " + n + " occurences of " + name + " within project:");
          return _this.subview('miniEditor', new TextEditorView({
            mini: true,
            placeholderText: name
          }));
        };
      })(this));
    };

    RenameView.prototype.onInput = function(callback) {
      this.miniEditor.focus();
      return atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            callback(_this.miniEditor.getText());
            return _this.destroy();
          };
        })(this)
      });
    };

    return RenameView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9yZW5hbWUtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLFdBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEseUJBQUEsVUFBQSxHQUFZLFNBQUEsR0FBQTs7UUFDVixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsVUFBUyxPQUFBLEVBQVMsSUFBbEI7U0FBN0I7T0FBVjthQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEIsYUFBNUIsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQUZVO0lBQUEsQ0FBWixDQUFBOztBQUFBLHlCQUlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFDLFFBQUYsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxFQUhPO0lBQUEsQ0FKVCxDQUFBOztBQUFBLElBU0EsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsR0FBQTtBQUNSLFVBQUEsT0FBQTtBQUFBLE1BQUEsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxNQUFYLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFEakIsQ0FBQTthQUVBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNILFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBTSwyQkFBQSxHQUEyQixDQUEzQixHQUE2QixpQkFBN0IsR0FBOEMsSUFBOUMsR0FBbUQsa0JBQXpELENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxjQUFBLENBQ3pCO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQVksZUFBQSxFQUFpQixJQUE3QjtXQUR5QixDQUEzQixFQUZHO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQUhRO0lBQUEsQ0FUVixDQUFBOztBQUFBLHlCQWlCQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBLENBQUEsQ0FBQTthQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEI7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDMUMsWUFBQSxRQUFBLENBQVMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBVCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUYwQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO09BQTVCLEVBRk87SUFBQSxDQWpCVCxDQUFBOztzQkFBQTs7S0FEdUIsS0FKekIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/rename-view.coffee
