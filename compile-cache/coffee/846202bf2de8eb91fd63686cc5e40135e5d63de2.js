(function() {
  var ClassProvider, FunctionProvider, GotoManager, PropertyProvider, TextEditor, parser;

  TextEditor = require('atom').TextEditor;

  ClassProvider = require('./class-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  parser = require('../services/php-file-parser.coffee');

  module.exports = GotoManager = (function() {
    function GotoManager() {}

    GotoManager.prototype.providers = [];

    GotoManager.prototype.trace = [];


    /**
     * Initialisation of all the providers and commands for goto
     */

    GotoManager.prototype.init = function() {
      var provider, _i, _len, _ref;
      this.providers.push(new ClassProvider());
      this.providers.push(new FunctionProvider());
      this.providers.push(new PropertyProvider());
      _ref = this.providers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        provider.init(this);
      }
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:goto-backtrack': (function(_this) {
          return function() {
            return _this.backTrack(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
      return atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:goto': (function(_this) {
          return function() {
            return _this.goto(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
    };


    /**
     * Deactivates the goto functionaility
     */

    GotoManager.prototype.deactivate = function() {
      var provider, _i, _len, _ref, _results;
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.deactivate());
      }
      return _results;
    };


    /**
     * Adds a backtrack step to the stack.
     *
     * @param {string}         fileName       The file where the jump took place.
     * @param {BufferPosition} bufferPosition The buffer position the cursor was last on.
     */

    GotoManager.prototype.addBackTrack = function(fileName, bufferPosition) {
      return this.trace.push({
        file: fileName,
        position: bufferPosition
      });
    };


    /**
     * Pops one of the stored back tracks and jump the user to its position.
     *
     * @param {TextEditor} editor The current editor.
     */

    GotoManager.prototype.backTrack = function(editor) {
      var lastTrace;
      if (this.trace.length === 0) {
        return;
      }
      lastTrace = this.trace.pop();
      if (editor instanceof TextEditor && editor.getPath() === lastTrace.file) {
        editor.setCursorBufferPosition(lastTrace.position, {
          autoscroll: false
        });
        return editor.scrollToScreenPosition(editor.screenPositionForBufferPosition(lastTrace.position), {
          center: true
        });
      } else {
        return atom.workspace.open(lastTrace.file, {
          searchAllPanes: true,
          initialLine: lastTrace.position[0],
          initialColumn: lastTrace.position[1]
        });
      }
    };


    /**
     * Takes the editor and jumps using one of the providers.
     *
     * @param {TextEditor} editor Current active editor
     */

    GotoManager.prototype.goto = function(editor) {
      var fullTerm, provider, _i, _len, _ref, _results;
      fullTerm = parser.getFullWordFromBufferPosition(editor, editor.getCursorBufferPosition());
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        if (provider.canGoto(fullTerm)) {
          provider.gotoFromEditor(editor);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return GotoManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vZ290by1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrRkFBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx5QkFBUixDQUZoQixDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSLENBSG5CLENBQUE7O0FBQUEsRUFJQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVIsQ0FKbkIsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FOVCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FFTTs2QkFDRjs7QUFBQSwwQkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLDBCQUNBLEtBQUEsR0FBTyxFQURQLENBQUE7O0FBR0E7QUFBQTs7T0FIQTs7QUFBQSwwQkFNQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0YsVUFBQSx3QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsYUFBQSxDQUFBLENBQXBCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsZ0JBQUEsQ0FBQSxDQUFwQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEIsQ0FGQSxDQUFBO0FBSUE7QUFBQSxXQUFBLDJDQUFBOzRCQUFBO0FBQ0ksUUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBQSxDQURKO0FBQUEsT0FKQTtBQUFBLE1BT0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztBQUFBLFFBQUEsc0NBQUEsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ3hFLEtBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQVgsRUFEd0U7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QztPQUFwQyxDQVBBLENBQUE7YUFVQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSw0QkFBQSxFQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDOUQsS0FBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBTixFQUQ4RDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO09BQXBDLEVBWEU7SUFBQSxDQU5OLENBQUE7O0FBb0JBO0FBQUE7O09BcEJBOztBQUFBLDBCQXVCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsVUFBQSxrQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxVQUFULENBQUEsRUFBQSxDQURKO0FBQUE7c0JBRFE7SUFBQSxDQXZCWixDQUFBOztBQTJCQTtBQUFBOzs7OztPQTNCQTs7QUFBQSwwQkFpQ0EsWUFBQSxHQUFjLFNBQUMsUUFBRCxFQUFXLGNBQVgsR0FBQTthQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZO0FBQUEsUUFDUixJQUFBLEVBQU0sUUFERTtBQUFBLFFBRVIsUUFBQSxFQUFVLGNBRkY7T0FBWixFQURVO0lBQUEsQ0FqQ2QsQ0FBQTs7QUF1Q0E7QUFBQTs7OztPQXZDQTs7QUFBQSwwQkE0Q0EsU0FBQSxHQUFXLFNBQUMsTUFBRCxHQUFBO0FBQ1AsVUFBQSxTQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxLQUFpQixDQUFwQjtBQUNJLGNBQUEsQ0FESjtPQUFBO0FBQUEsTUFHQSxTQUFBLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUEsQ0FIWixDQUFBO0FBS0EsTUFBQSxJQUFHLE1BQUEsWUFBa0IsVUFBbEIsSUFBZ0MsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQW9CLFNBQVMsQ0FBQyxJQUFqRTtBQUNJLFFBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLFNBQVMsQ0FBQyxRQUF6QyxFQUFtRDtBQUFBLFVBQy9DLFVBQUEsRUFBWSxLQURtQztTQUFuRCxDQUFBLENBQUE7ZUFNQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsTUFBTSxDQUFDLCtCQUFQLENBQXVDLFNBQVMsQ0FBQyxRQUFqRCxDQUE5QixFQUEwRjtBQUFBLFVBQ3RGLE1BQUEsRUFBUSxJQUQ4RTtTQUExRixFQVBKO09BQUEsTUFBQTtlQVlJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFTLENBQUMsSUFBOUIsRUFBb0M7QUFBQSxVQUNoQyxjQUFBLEVBQWdCLElBRGdCO0FBQUEsVUFFaEMsV0FBQSxFQUFhLFNBQVMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUZBO0FBQUEsVUFHaEMsYUFBQSxFQUFlLFNBQVMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUhGO1NBQXBDLEVBWko7T0FOTztJQUFBLENBNUNYLENBQUE7O0FBb0VBO0FBQUE7Ozs7T0FwRUE7O0FBQUEsMEJBeUVBLElBQUEsR0FBTSxTQUFDLE1BQUQsR0FBQTtBQUNGLFVBQUEsNENBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxNQUFNLENBQUMsNkJBQVAsQ0FBcUMsTUFBckMsRUFBNkMsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBN0MsQ0FBWCxDQUFBO0FBRUE7QUFBQTtXQUFBLDJDQUFBOzRCQUFBO0FBQ0ksUUFBQSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLFFBQWpCLENBQUg7QUFDSSxVQUFBLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQUEsQ0FBQTtBQUNBLGdCQUZKO1NBQUEsTUFBQTtnQ0FBQTtTQURKO0FBQUE7c0JBSEU7SUFBQSxDQXpFTixDQUFBOzt1QkFBQTs7TUFYSixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/goto-manager.coffee
