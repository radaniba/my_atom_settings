(function() {
  var Toc;

  Toc = require('./Toc');

  module.exports = {
    activate: function(state) {
      this.toc = new Toc(atom.workspace.getActivePaneItem());
      atom.commands.add('atom-workspace', {
        'markdown-toc:create': (function(_this) {
          return function() {
            return _this.toc.create();
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'markdown-toc:update': (function(_this) {
          return function() {
            return _this.toc.update();
          };
        })(this)
      });
      return atom.commands.add('atom-workspace', {
        'markdown-toc:delete': (function(_this) {
          return function() {
            return _this.toc["delete"]();
          };
        })(this)
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi10b2MvbGliL21hcmtkb3duLXRvYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsR0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUFOLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQSxHQUFBLENBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQUosQ0FBWCxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSxxQkFBQSxFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7T0FBcEMsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSxxQkFBQSxFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7T0FBcEMsQ0FIQSxDQUFBO2FBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztBQUFBLFFBQUEscUJBQUEsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLEdBQUcsQ0FBQyxRQUFELENBQUosQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7T0FBcEMsRUFMUTtJQUFBLENBQVY7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/markdown-toc/lib/markdown-toc.coffee
