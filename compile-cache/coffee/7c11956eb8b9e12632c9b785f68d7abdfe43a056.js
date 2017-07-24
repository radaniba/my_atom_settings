(function() {
  var CellManager, escapeStringRegexp;

  escapeStringRegexp = require('escape-string-regexp');

  module.exports = CellManager = {
    getCurrentCell: function() {
      var buffer, column, commentEndString, commentStartString, editor, end, escapedCommentStartString, range, regex, row, scope, start, _ref, _ref1;
      editor = atom.workspace.getActiveTextEditor();
      buffer = editor.getBuffer();
      scope = editor.getRootScopeDescriptor();
      _ref = editor.getLastCursor().getBufferPosition(), row = _ref.row, column = _ref.column;
      start = 0;
      end = editor.getLastBufferRow();
      _ref1 = editor.languageMode.commentStartAndEndStringsForScope(scope), commentStartString = _ref1.commentStartString, commentEndString = _ref1.commentEndString;
      if (!commentStartString) {
        console.log('CellManager: No comment string defined in root scope');
        return;
      }
      escapedCommentStartString = escapeStringRegexp(commentStartString.trimRight());
      regex = new RegExp(escapedCommentStartString + '(%%| %%| <codecell>| In\[[0-9 ]+\]:)');
      if (row > 0) {
        range = [[0, 0], [row - 1, 100]];
        buffer.backwardsScanInRange(regex, range, function(_arg) {
          var range;
          range = _arg.range;
          return start = range.start.row;
        });
      } else {
        start = 0;
      }
      range = [[row, 0], [end, 100]];
      buffer.scanInRange(regex, range, function(_arg) {
        var range;
        range = _arg.range;
        return end = range.start.row;
      });
      console.log('CellManager: Cell [start, end]:', [start, end], 'row:', row);
      return [start, end];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvY2VsbC1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQkFBQTs7QUFBQSxFQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUixDQUFyQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBQSxHQUNiO0FBQUEsSUFBQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNaLFVBQUEsMElBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQURULENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUZSLENBQUE7QUFBQSxNQUlBLE9BQWdCLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxpQkFBdkIsQ0FBQSxDQUFoQixFQUFDLFdBQUEsR0FBRCxFQUFNLGNBQUEsTUFKTixDQUFBO0FBQUEsTUFLQSxLQUFBLEdBQVEsQ0FMUixDQUFBO0FBQUEsTUFNQSxHQUFBLEdBQU0sTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FOTixDQUFBO0FBQUEsTUFRQSxRQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsaUNBQXBCLENBQXNELEtBQXRELENBREosRUFBQywyQkFBQSxrQkFBRCxFQUFxQix5QkFBQSxnQkFSckIsQ0FBQTtBQVdBLE1BQUEsSUFBQSxDQUFBLGtCQUFBO0FBQ0ksUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHNEQUFaLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGSjtPQVhBO0FBQUEsTUFlQSx5QkFBQSxHQUNJLGtCQUFBLENBQW1CLGtCQUFrQixDQUFDLFNBQW5CLENBQUEsQ0FBbkIsQ0FoQkosQ0FBQTtBQUFBLE1BaUJBLEtBQUEsR0FBWSxJQUFBLE1BQUEsQ0FDUix5QkFBQSxHQUE0QixzQ0FEcEIsQ0FqQlosQ0FBQTtBQXFCQSxNQUFBLElBQUcsR0FBQSxHQUFNLENBQVQ7QUFDSSxRQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsR0FBQSxHQUFNLENBQVAsRUFBVSxHQUFWLENBQVQsQ0FBUixDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUIsRUFBbUMsS0FBbkMsRUFBMEMsU0FBQyxJQUFELEdBQUE7QUFDdEMsY0FBQSxLQUFBO0FBQUEsVUFEd0MsUUFBRCxLQUFDLEtBQ3hDLENBQUE7aUJBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFEa0I7UUFBQSxDQUExQyxDQURBLENBREo7T0FBQSxNQUFBO0FBS0ksUUFBQSxLQUFBLEdBQVEsQ0FBUixDQUxKO09BckJBO0FBQUEsTUE0QkEsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUFELEVBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFYLENBNUJSLENBQUE7QUFBQSxNQTZCQSxNQUFNLENBQUMsV0FBUCxDQUFtQixLQUFuQixFQUEwQixLQUExQixFQUFpQyxTQUFDLElBQUQsR0FBQTtBQUM3QixZQUFBLEtBQUE7QUFBQSxRQUQrQixRQUFELEtBQUMsS0FDL0IsQ0FBQTtlQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBRFc7TUFBQSxDQUFqQyxDQTdCQSxDQUFBO0FBQUEsTUFnQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQ0FBWixFQUErQyxDQUFDLEtBQUQsRUFBUSxHQUFSLENBQS9DLEVBQTZELE1BQTdELEVBQXFFLEdBQXJFLENBaENBLENBQUE7QUFrQ0EsYUFBTyxDQUFDLEtBQUQsRUFBUSxHQUFSLENBQVAsQ0FuQ1k7SUFBQSxDQUFoQjtHQUhKLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/cell-manager.coffee
