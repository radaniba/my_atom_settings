(function() {
  var PythonIndent;

  module.exports = PythonIndent = (function() {
    function PythonIndent() {
      this.openingDelimiterIndentRegex = new RegExp(atom.config.get('python-indent.openingDelimiterIndentRegex'));
      this.openingDelimiterUnindentRegex = new RegExp(atom.config.get('python-indent.openingDelimiterUnindentRegex'));
      this.hangingIndentRegex = new RegExp(atom.config.get('python-indent.hangingIndentRegex'));
    }

    PythonIndent.prototype.properlyIndent = function(e) {
      var matchOpeningDelimiter, previousLine, row;
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.editor.getGrammar().scopeName.substring(0, 13) !== 'source.python') {
        return;
      }
      row = this.editor.getCursorBufferPosition().row;
      previousLine = this.editor.buffer.lineForRow(row - 1);
      if (!row) {
        return;
      }
      if ((matchOpeningDelimiter = this.openingDelimiterIndentRegex.exec(previousLine)) !== null) {
        return this.indentOnOpeningDelimiter(row, previousLine, matchOpeningDelimiter);
      } else if (this.hangingIndentRegex.test(previousLine)) {
        return this.indentHanging(row, previousLine);
      } else if (this.openingDelimiterUnindentRegex.test(previousLine)) {
        return this.unindentOnOpeningDelimiter(row, previousLine);
      }
    };

    PythonIndent.prototype.indentOnOpeningDelimiter = function(row, previousLine, matchOpeningDelimiter) {
      var column, indent, indentColumn, offset, rem, tabLength, tabs;
      indentColumn = previousLine.lastIndexOf(matchOpeningDelimiter[1]) + 1;
      tabLength = this.editor.getTabLength();
      tabs = (indentColumn / tabLength) - this.editor.indentationForBufferRow(row);
      rem = indentColumn % tabLength;
      tabs = rem > 0 ? Math.ceil(tabs) : tabs;
      offset = rem > 0 ? tabLength - rem : 0;
      indent = this.editor.buildIndentString(tabs, column = offset);
      return this.editor.getBuffer().setTextInRange([[row, 0], [row, 0]], indent);
    };

    PythonIndent.prototype.getLastUnmatchedOpenDelimiter = function(previousLine) {};

    PythonIndent.prototype.unindentOnOpeningDelimiter = function(row, previousLine) {
      var i, indent, line, lines, _i, _results;
      lines = row > 0 ? this.editor.buffer.lines.slice(0, +(row - 1) + 1 || 9e9) : [];
      _results = [];
      for (i = _i = lines.length - 1; _i >= 0; i = _i += -1) {
        line = lines[i];
        if (this.openingDelimiterIndentRegex.test(line)) {
          indent = this.editor.indentationForBufferRow(i);
          if (previousLine.slice(-1) === ':') {
            indent += 1;
          }
          this.editor.setIndentationForBufferRow(row, indent);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    PythonIndent.prototype.indentHanging = function(row, previousLine) {
      var indent;
      indent = (this.editor.indentationForBufferRow(row)) + (atom.config.get('python-indent.hangingIndentTabs'));
      return this.editor.setIndentationForBufferRow(row, indent);
    };

    return PythonIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxZQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUEsR0FBQTtBQUVYLE1BQUEsSUFBQyxDQUFBLDJCQUFELEdBQW1DLElBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQ0FBaEIsQ0FBUCxDQUFuQyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsNkJBQUQsR0FBcUMsSUFBQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQixDQUFQLENBRHJDLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLENBQVAsQ0FGMUIsQ0FGVztJQUFBLENBQWI7O0FBQUEsMkJBTUEsY0FBQSxHQUFnQixTQUFDLENBQUQsR0FBQTtBQUNkLFVBQUEsd0NBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVYsQ0FBQTtBQUVBLE1BQUEsSUFBYyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFvQixDQUFDLFNBQVMsQ0FBQyxTQUEvQixDQUF5QyxDQUF6QyxFQUE0QyxFQUE1QyxDQUFBLEtBQW1ELGVBQWpFO0FBQUEsY0FBQSxDQUFBO09BRkE7QUFBQSxNQUtBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaUMsQ0FBQyxHQUx4QyxDQUFBO0FBQUEsTUFNQSxZ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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/python-indent.coffee
