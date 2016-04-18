(function() {
  var $$, ToolBarButtonView, ToolBarManager;

  ToolBarButtonView = require('./tool-bar-button-view');

  $$ = require('space-pen').$$;

  module.exports = ToolBarManager = (function() {
    function ToolBarManager(group, toolBar) {
      this.group = group;
      this.toolBar = toolBar;
    }

    ToolBarManager.prototype.addButton = function(options) {
      var button;
      button = new ToolBarButtonView(options);
      button.group = this.group;
      this.toolBar.addItem(button);
      return button;
    };

    ToolBarManager.prototype.addSpacer = function(options) {
      var spacer;
      spacer = $$(function() {
        return this.hr({
          "class": 'tool-bar-spacer'
        });
      });
      spacer.priority = options != null ? options.priority : void 0;
      spacer.group = this.group;
      spacer.destroy = function() {
        return spacer.remove();
      };
      this.toolBar.addItem(spacer);
      return spacer;
    };

    ToolBarManager.prototype.removeItems = function() {
      var _ref;
      return (_ref = this.toolBar.items) != null ? _ref.filter((function(_this) {
        return function(item) {
          return item.group === _this.group;
        };
      })(this)).forEach((function(_this) {
        return function(item) {
          return _this.toolBar.removeItem(item);
        };
      })(this)) : void 0;
    };

    ToolBarManager.prototype.onDidDestroy = function(callback) {
      return this.toolBar.emitter.on('did-destroy', callback);
    };

    return ToolBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90b29sLWJhci9saWIvdG9vbC1iYXItbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUNBQUE7O0FBQUEsRUFBQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FBcEIsQ0FBQTs7QUFBQSxFQUNDLEtBQU0sT0FBQSxDQUFRLFdBQVIsRUFBTixFQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNSLElBQUEsd0JBQUUsS0FBRixFQUFVLE9BQVYsR0FBQTtBQUFvQixNQUFuQixJQUFDLENBQUEsUUFBQSxLQUFrQixDQUFBO0FBQUEsTUFBWCxJQUFDLENBQUEsVUFBQSxPQUFVLENBQXBCO0lBQUEsQ0FBYjs7QUFBQSw2QkFFQSxTQUFBLEdBQVcsU0FBQyxPQUFELEdBQUE7QUFDVCxVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBYSxJQUFBLGlCQUFBLENBQWtCLE9BQWxCLENBQWIsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsS0FEaEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBRkEsQ0FBQTthQUdBLE9BSlM7SUFBQSxDQUZYLENBQUE7O0FBQUEsNkJBUUEsU0FBQSxHQUFXLFNBQUMsT0FBRCxHQUFBO0FBQ1QsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsRUFBQSxDQUFHLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxVQUFBLE9BQUEsRUFBTyxpQkFBUDtTQUFKLEVBQUg7TUFBQSxDQUFILENBQVQsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLFFBQVAscUJBQWtCLE9BQU8sQ0FBRSxpQkFEM0IsQ0FBQTtBQUFBLE1BRUEsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsS0FGaEIsQ0FBQTtBQUFBLE1BR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUFBO2VBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUFIO01BQUEsQ0FIakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBSkEsQ0FBQTthQUtBLE9BTlM7SUFBQSxDQVJYLENBQUE7O0FBQUEsNkJBZ0JBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxVQUFBLElBQUE7dURBQWMsQ0FBRSxNQUFoQixDQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQ3JCLElBQUksQ0FBQyxLQUFMLEtBQWMsS0FBQyxDQUFBLE1BRE07UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQUVBLENBQUMsT0FGRCxDQUVTLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtpQkFDUCxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsQ0FBb0IsSUFBcEIsRUFETztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRlQsV0FEVztJQUFBLENBaEJiLENBQUE7O0FBQUEsNkJBc0JBLFlBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTthQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQWpCLENBQW9CLGFBQXBCLEVBQW1DLFFBQW5DLEVBRFk7SUFBQSxDQXRCZCxDQUFBOzswQkFBQTs7TUFKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/tool-bar/lib/tool-bar-manager.coffee
