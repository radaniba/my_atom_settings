(function() {
  var PythonAutopep8;

  PythonAutopep8 = require('./python-autopep8');

  module.exports = {
    config: {
      autopep8Path: {
        type: 'string',
        "default": 'autopep8'
      },
      formatOnSave: {
        type: 'boolean',
        "default": false
      },
      maxLineLength: {
        type: 'integer',
        "default": 100
      }
    },
    activate: function() {
      var pi;
      pi = new PythonAutopep8();
      atom.commands.add('atom-workspace', 'pane:active-item-changed', function() {
        return pi.removeStatusbarItem();
      });
      atom.commands.add('atom-workspace', 'python-autopep8:format', function() {
        return pi.format();
      });
      return atom.config.observe('python-autopep8.formatOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var _ref;
          if (value === true) {
            return editor._autopep8Format = editor.onDidSave(function() {
              return pi.format();
            });
          } else {
            return (_ref = editor._autopep8Format) != null ? _ref.dispose() : void 0;
          }
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tYXV0b3BlcDgvbGliL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFVBRFQ7T0FERjtBQUFBLE1BR0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FKRjtBQUFBLE1BTUEsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEdBRFQ7T0FQRjtLQURGO0FBQUEsSUFXQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxFQUFBO0FBQUEsTUFBQSxFQUFBLEdBQVMsSUFBQSxjQUFBLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLDBCQUFwQyxFQUFnRSxTQUFBLEdBQUE7ZUFDOUQsRUFBRSxDQUFDLG1CQUFILENBQUEsRUFEOEQ7TUFBQSxDQUFoRSxDQUZBLENBQUE7QUFBQSxNQUtBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msd0JBQXBDLEVBQThELFNBQUEsR0FBQTtlQUM1RCxFQUFFLENBQUMsTUFBSCxDQUFBLEVBRDREO01BQUEsQ0FBOUQsQ0FMQSxDQUFBO2FBUUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDhCQUFwQixFQUFvRCxTQUFDLEtBQUQsR0FBQTtlQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjttQkFDRSxNQUFNLENBQUMsZUFBUCxHQUF5QixNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFBLEdBQUE7cUJBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBQSxFQUFIO1lBQUEsQ0FBakIsRUFEM0I7V0FBQSxNQUFBO2lFQUd3QixDQUFFLE9BQXhCLENBQUEsV0FIRjtXQURnQztRQUFBLENBQWxDLEVBRGtEO01BQUEsQ0FBcEQsRUFUUTtJQUFBLENBWFY7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/python-autopep8/lib/index.coffee
