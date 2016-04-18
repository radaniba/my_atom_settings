(function() {
  var $, PythonAutopep8, process,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('jquery');

  process = require('child_process');

  module.exports = PythonAutopep8 = (function() {
    function PythonAutopep8() {
      this.updateStatusbarText = __bind(this.updateStatusbarText, this);
      this.removeStatusbarItem = __bind(this.removeStatusbarItem, this);
    }

    PythonAutopep8.prototype.checkForPythonContext = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      return editor.getGrammar().name === 'Python';
    };

    PythonAutopep8.prototype.removeStatusbarItem = function() {
      var _ref;
      if ((_ref = this.statusBarTile) != null) {
        _ref.destroy();
      }
      return this.statusBarTile = null;
    };

    PythonAutopep8.prototype.updateStatusbarText = function(message, isError) {
      var statusBar, statusBarElement;
      if (!this.statusBarTile) {
        statusBar = document.querySelector("status-bar");
        if (statusBar == null) {
          return;
        }
        this.statusBarTile = statusBar.addLeftTile({
          item: $('<div id="status-bar-python-autopep8" class="inline-block"> <span style="font-weight: bold">Autopep8: </span> <span id="python-autopep8-status-message"></span> </div>'),
          priority: 100
        });
      }
      statusBarElement = this.statusBarTile.getItem().find('#python-autopep8-status-message');
      if (isError === true) {
        statusBarElement.addClass("text-error");
      } else {
        statusBarElement.removeClass("text-error");
      }
      return statusBarElement.text(message);
    };

    PythonAutopep8.prototype.getFilePath = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return editor.getPath();
    };

    PythonAutopep8.prototype.format = function() {
      var cmd, maxLineLength, params, returnCode;
      if (!this.checkForPythonContext()) {
        return;
      }
      cmd = atom.config.get("python-autopep8.autopep8Path");
      maxLineLength = atom.config.get("python-autopep8.maxLineLength");
      params = ["--max-line-length", maxLineLength, "-i", this.getFilePath()];
      returnCode = process.spawnSync(cmd, params).status;
      if (returnCode !== 0) {
        return this.updateStatusbarText("x", true);
      } else {
        this.updateStatusbarText("√", false);
        return this.reload;
      }
    };

    return PythonAutopep8;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tYXV0b3BlcDgvbGliL3B5dGhvbi1hdXRvcGVwOC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEJBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVIsQ0FEVixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OztLQUVKOztBQUFBLDZCQUFBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQ0EsTUFBQSxJQUFPLGNBQVA7QUFDRSxlQUFPLEtBQVAsQ0FERjtPQURBO0FBR0EsYUFBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsSUFBcEIsS0FBNEIsUUFBbkMsQ0FKcUI7SUFBQSxDQUF2QixDQUFBOztBQUFBLDZCQU1BLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLElBQUE7O1lBQWMsQ0FBRSxPQUFoQixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUZFO0lBQUEsQ0FOckIsQ0FBQTs7QUFBQSw2QkFVQSxtQkFBQSxHQUFxQixTQUFDLE9BQUQsRUFBVSxPQUFWLEdBQUE7QUFDbkIsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxhQUFSO0FBQ0UsUUFBQSxTQUFBLEdBQVksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsQ0FBWixDQUFBO0FBQ0EsUUFBQSxJQUFjLGlCQUFkO0FBQUEsZ0JBQUEsQ0FBQTtTQURBO0FBQUEsUUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixTQUNmLENBQUMsV0FEYyxDQUViO0FBQUEsVUFBQSxJQUFBLEVBQU0sQ0FBQSxDQUFFLHVLQUFGLENBQU47QUFBQSxVQUdrQixRQUFBLEVBQVUsR0FINUI7U0FGYSxDQUZqQixDQURGO09BQUE7QUFBQSxNQVVBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQ2pCLENBQUMsSUFEZ0IsQ0FDWCxpQ0FEVyxDQVZuQixDQUFBO0FBYUEsTUFBQSxJQUFHLE9BQUEsS0FBVyxJQUFkO0FBQ0UsUUFBQSxnQkFBZ0IsQ0FBQyxRQUFqQixDQUEwQixZQUExQixDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixZQUE3QixDQUFBLENBSEY7T0FiQTthQWtCQSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixPQUF0QixFQW5CbUI7SUFBQSxDQVZyQixDQUFBOztBQUFBLDZCQStCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLGFBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBRlc7SUFBQSxDQS9CYixDQUFBOztBQUFBLDZCQW1DQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxzQ0FBQTtBQUFBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxxQkFBRCxDQUFBLENBQVA7QUFDRSxjQUFBLENBREY7T0FBQTtBQUFBLE1BR0EsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsQ0FITixDQUFBO0FBQUEsTUFJQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsQ0FKaEIsQ0FBQTtBQUFBLE1BS0EsTUFBQSxHQUFTLENBQUMsbUJBQUQsRUFBc0IsYUFBdEIsRUFBcUMsSUFBckMsRUFBMkMsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUEzQyxDQUxULENBQUE7QUFBQSxNQU9BLFVBQUEsR0FBYSxPQUFPLENBQUMsU0FBUixDQUFrQixHQUFsQixFQUF1QixNQUF2QixDQUE4QixDQUFDLE1BUDVDLENBQUE7QUFRQSxNQUFBLElBQUcsVUFBQSxLQUFjLENBQWpCO2VBQ0UsSUFBQyxDQUFBLG1CQUFELENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsS0FBMUIsQ0FBQSxDQUFBO2VBQ0EsSUFBQyxDQUFBLE9BSkg7T0FUTTtJQUFBLENBbkNSLENBQUE7OzBCQUFBOztNQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/python-autopep8/lib/python-autopep8.coffee
