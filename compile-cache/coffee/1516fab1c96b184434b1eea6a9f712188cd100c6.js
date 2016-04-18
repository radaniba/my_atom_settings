(function() {
  var PythonIsort;

  PythonIsort = require('./python-isort');

  module.exports = {
    config: {
      isortPath: {
        type: 'string',
        "default": 'isort'
      },
      sortOnSave: {
        type: 'boolean',
        "default": false
      },
      checkOnSave: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      var pi;
      pi = new PythonIsort();
      atom.commands.add('atom-workspace', 'pane:active-item-changed', function() {
        return pi.removeStatusbarItem();
      });
      atom.commands.add('atom-workspace', 'python-isort:sortImports', function() {
        return pi.sortImports();
      });
      atom.commands.add('atom-workspace', 'python-isort:checkImports', function() {
        return pi.checkImports();
      });
      atom.config.observe('python-isort.sortOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var _ref;
          if (value === true) {
            return editor._isortSort = editor.onDidSave(function() {
              return pi.sortImports();
            });
          } else {
            return (_ref = editor._isortSort) != null ? _ref.dispose() : void 0;
          }
        });
      });
      return atom.config.observe('python-isort.checkOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var _ref;
          if (value === true) {
            return editor._isortCheck = editor.onDidSave(function() {
              return pi.checkImports();
            });
          } else {
            return (_ref = editor._isortCheck) != null ? _ref.dispose() : void 0;
          }
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taXNvcnQvbGliL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO09BREY7QUFBQSxNQUdBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BSkY7QUFBQSxNQU1BLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BUEY7S0FERjtBQUFBLElBV0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsRUFBQTtBQUFBLE1BQUEsRUFBQSxHQUFTLElBQUEsV0FBQSxDQUFBLENBQVQsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQywwQkFBcEMsRUFBZ0UsU0FBQSxHQUFBO2VBQzlELEVBQUUsQ0FBQyxtQkFBSCxDQUFBLEVBRDhEO01BQUEsQ0FBaEUsQ0FGQSxDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLDBCQUFwQyxFQUFnRSxTQUFBLEdBQUE7ZUFDOUQsRUFBRSxDQUFDLFdBQUgsQ0FBQSxFQUQ4RDtNQUFBLENBQWhFLENBTEEsQ0FBQTtBQUFBLE1BUUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQywyQkFBcEMsRUFBaUUsU0FBQSxHQUFBO2VBQy9ELEVBQUUsQ0FBQyxZQUFILENBQUEsRUFEK0Q7TUFBQSxDQUFqRSxDQVJBLENBQUE7QUFBQSxNQVdBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix5QkFBcEIsRUFBK0MsU0FBQyxLQUFELEdBQUE7ZUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxTQUFDLE1BQUQsR0FBQTtBQUNoQyxjQUFBLElBQUE7QUFBQSxVQUFBLElBQUcsS0FBQSxLQUFTLElBQVo7bUJBQ0UsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsU0FBQSxHQUFBO3FCQUFHLEVBQUUsQ0FBQyxXQUFILENBQUEsRUFBSDtZQUFBLENBQWpCLEVBRHRCO1dBQUEsTUFBQTs0REFHbUIsQ0FBRSxPQUFuQixDQUFBLFdBSEY7V0FEZ0M7UUFBQSxDQUFsQyxFQUQ2QztNQUFBLENBQS9DLENBWEEsQ0FBQTthQWtCQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsMEJBQXBCLEVBQWdELFNBQUMsS0FBRCxHQUFBO2VBQzlDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsU0FBQyxNQUFELEdBQUE7QUFDaEMsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO21CQUNFLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUEsR0FBQTtxQkFBRyxFQUFFLENBQUMsWUFBSCxDQUFBLEVBQUg7WUFBQSxDQUFqQixFQUR2QjtXQUFBLE1BQUE7NkRBR29CLENBQUUsT0FBcEIsQ0FBQSxXQUhGO1dBRGdDO1FBQUEsQ0FBbEMsRUFEOEM7TUFBQSxDQUFoRCxFQW5CUTtJQUFBLENBWFY7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/python-isort/lib/index.coffee
