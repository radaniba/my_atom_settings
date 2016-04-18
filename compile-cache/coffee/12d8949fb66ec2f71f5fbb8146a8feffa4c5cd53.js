(function() {
  var $, PythonIsort, fs, process,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  $ = require('jquery');

  process = require('child_process');

  module.exports = PythonIsort = (function() {
    function PythonIsort() {
      this.updateStatusbarText = __bind(this.updateStatusbarText, this);
      this.removeStatusbarItem = __bind(this.removeStatusbarItem, this);
    }

    PythonIsort.prototype.checkForPythonContext = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      return editor.getGrammar().name === 'Python';
    };

    PythonIsort.prototype.removeStatusbarItem = function() {
      var _ref;
      if ((_ref = this.statusBarTile) != null) {
        _ref.destroy();
      }
      return this.statusBarTile = null;
    };

    PythonIsort.prototype.updateStatusbarText = function(message, isError) {
      var statusBar, statusBarElement;
      if (!this.statusBarTile) {
        statusBar = document.querySelector("status-bar");
        if (statusBar == null) {
          return;
        }
        this.statusBarTile = statusBar.addLeftTile({
          item: $('<div id="status-bar-python-isort" class="inline-block"> <span style="font-weight: bold">Isort: </span> <span id="python-isort-status-message"></span> </div>'),
          priority: 100
        });
      }
      statusBarElement = this.statusBarTile.getItem().find('#python-isort-status-message');
      if (isError === true) {
        statusBarElement.addClass("text-error");
      } else {
        statusBarElement.removeClass("text-error");
      }
      return statusBarElement.text(message);
    };

    PythonIsort.prototype.getFilePath = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return editor.getPath();
    };

    PythonIsort.prototype.checkImports = function() {
      var isortpath, params, proc, updateStatusbarText, which;
      if (!this.checkForPythonContext()) {
        return;
      }
      params = [this.getFilePath(), "-c", "-vb"];
      isortpath = atom.config.get("python-isort.isortPath");
      which = process.spawnSync('which', ['isort']).status;
      if (which === 1 && !fs.existsSync(isortpath)) {
        this.updateStatusbarText("unable to open " + isortpath, false);
        return;
      }
      proc = process.spawn(isortpath, params);
      updateStatusbarText = this.updateStatusbarText;
      return proc.on('exit', function(exit_code, signal) {
        if (exit_code === 0) {
          return updateStatusbarText("√", false);
        } else {
          return updateStatusbarText("x", true);
        }
      });
    };

    PythonIsort.prototype.sortImports = function() {
      var isortpath, params, proc, which;
      if (!this.checkForPythonContext()) {
        return;
      }
      params = [this.getFilePath(), "-vb"];
      isortpath = atom.config.get("python-isort.isortPath");
      which = process.spawnSync('which', ['isort']).status;
      if (which === 1 && !fs.existsSync(isortpath)) {
        this.updateStatusbarText("unable to open " + isortpath, false);
        return;
      }
      proc = process.spawn(isortpath, params);
      this.updateStatusbarText("√", false);
      return this.reload;
    };

    return PythonIsort;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taXNvcnQvbGliL3B5dGhvbi1pc29ydC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkJBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7S0FFSjs7QUFBQSwwQkFBQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBTyxjQUFQO0FBQ0UsZUFBTyxLQUFQLENBREY7T0FEQTtBQUdBLGFBQU8sTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLElBQXBCLEtBQTRCLFFBQW5DLENBSnFCO0lBQUEsQ0FBdkIsQ0FBQTs7QUFBQSwwQkFNQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSxJQUFBOztZQUFjLENBQUUsT0FBaEIsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FGRTtJQUFBLENBTnJCLENBQUE7O0FBQUEsMEJBVUEsbUJBQUEsR0FBcUIsU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO0FBQ25CLFVBQUEsMkJBQUE7QUFBQSxNQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsYUFBUjtBQUNFLFFBQUEsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCLENBQVosQ0FBQTtB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

//# sourceURL=/Users/Rad/.atom/packages/python-isort/lib/python-isort.coffee
