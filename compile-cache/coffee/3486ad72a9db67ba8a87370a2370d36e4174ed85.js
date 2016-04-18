(function() {
  var Dictionary, spawn;

  spawn = require('child_process').spawn;

  module.exports = Dictionary = {
    activate: function(state) {
      return atom.commands.add('.platform-darwin atom-workspace', {
        'dictionary:look-up': this.lookUp
      });
    },
    lookUp: function() {
      var editor, selection;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      selection = editor.getLastSelection().getText();
      if (selection === '') {
        selection = editor.getWordUnderCursor();
      }
      return spawn('open', ['dict://' + selection]);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9kaWN0aW9uYXJ5L2xpYi9kaWN0aW9uYXJ5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLEtBQWpDLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFBLEdBQ2Y7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixpQ0FBbEIsRUFBcUQ7QUFBQSxRQUNuRCxvQkFBQSxFQUFzQixJQUFDLENBQUEsTUFENEI7T0FBckQsRUFEUTtJQUFBLENBQVY7QUFBQSxJQUtBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixVQUFBLGlCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBVSxDQUFBLE1BQVY7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsU0FBQSxHQUFZLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsT0FBMUIsQ0FBQSxDQUhaLENBQUE7QUFJQSxNQUFBLElBQUcsU0FBQSxLQUFhLEVBQWhCO0FBQ0UsUUFBQSxTQUFBLEdBQVksTUFBTSxDQUFFLGtCQUFSLENBQUEsQ0FBWixDQURGO09BSkE7YUFNQSxLQUFBLENBQU0sTUFBTixFQUFjLENBQUMsU0FBQSxHQUFZLFNBQWIsQ0FBZCxFQVBNO0lBQUEsQ0FMUjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/dictionary/lib/dictionary.coffee
