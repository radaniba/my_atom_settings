(function() {
  var PythonIndent,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = PythonIndent = (function() {
    function PythonIndent() {}

    PythonIndent.prototype.properlyIndent = function(e) {
      var closedBracketOpenedAfterLineWithCurrentOpen, col, column, haveClosedBracket, indent, indentColumn, indentLevel, justClosedBracket, justOpenedBracket, lastClosedRow, lastFunctionRow, lastOpenBracketLocations, lines, offset, openBracketStack, parseOutput, previousIndent, rem, row, shouldHang, startRange, stopRange, tabLength, tabs;
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.editor.getGrammar().scopeName.substring(0, 13) !== 'source.python') {
        return;
      }
      row = this.editor.getCursorBufferPosition().row;
      col = this.editor.getCursorBufferPosition().column;
      lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split('\n');
      lines = lines.splice(0, lines.length - 1);
      parseOutput = this.parseLines(lines);
      openBracketStack = parseOutput.openBracketStack;
      lastClosedRow = parseOutput.lastClosedRow;
      shouldHang = parseOutput.shouldHang;
      lastFunctionRow = parseOutput.lastFunctionRow;
      if (shouldHang) {
        this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
        return;
      }
      if (!(openBracketStack.length || lastClosedRow.length)) {
        return;
      }
      if (!openBracketStack.length) {
        if (lastClosedRow[1] === row - 1) {
          indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);
          if (lastFunctionRow === row - 1) {
            indentLevel += 1;
          }
          this.editor.setIndentationForBufferRow(row, indentLevel);
        }
        return;
      }
      tabLength = this.editor.getTabLength();
      lastOpenBracketLocations = openBracketStack.pop();
      haveClosedBracket = lastClosedRow.length;
      justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
      justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
      closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
      if (!justOpenedBracket && !justClosedBracket) {
        return;
      } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
        previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
        indentColumn = previousIndent * tabLength;
      } else {
        indentColumn = lastOpenBracketLocations[1] + 1;
      }
      tabs = indentColumn / tabLength;
      rem = (tabs - Math.floor(tabs)) * tabLength;
      tabs = rem > 0 ? Math.ceil(tabs) : tabs;
      offset = rem > 0 ? tabLength - rem : 0;
      indent = this.editor.buildIndentString(tabs, column = offset);
      startRange = [row, 0];
      stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
      return this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
    };

    PythonIndent.prototype.parseLines = function(lines) {
      var c, col, isEscaped, lastClosedRow, lastFunctionRow, lastLastFunctionRow, line, openBracketStack, row, shouldHang, stringDelimiter, _i, _j, _ref, _ref1;
      openBracketStack = [];
      lastClosedRow = [];
      stringDelimiter = [];
      lastFunctionRow = NaN;
      for (row = _i = 0, _ref = lines.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
        line = lines[row];
        isEscaped = false;
        shouldHang = false;
        lastLastFunctionRow = lastFunctionRow;
        for (col = _j = 0, _ref1 = line.length - 1; _j <= _ref1; col = _j += 1) {
          c = line[col];
          if (stringDelimiter.length) {
            if (isEscaped) {
              isEscaped = false;
            } else {
              if (c === stringDelimiter) {
                stringDelimiter = [];
              } else if (c === '\\') {
                isEscaped = true;
              }
            }
          } else {
            if (__indexOf.call('[({', c) >= 0) {
              openBracketStack.push([row, col]);
              shouldHang = true;
            } else if (__indexOf.call(' \t\r\n', c) >= 0) {
              continue;
            } else if (c === '#') {
              break;
            } else {
              shouldHang = false;
              lastFunctionRow = lastLastFunctionRow;
              if (c === ':') {
                lastFunctionRow = row;
              } else if (__indexOf.call('})]', c) >= 0) {
                lastClosedRow = [openBracketStack.pop()[0], row];
              } else if (__indexOf.call('\'"', c) >= 0) {
                stringDelimiter = c;
              }
            }
          }
        }
      }
      return {
        openBracketStack: openBracketStack,
        lastClosedRow: lastClosedRow,
        shouldHang: shouldHang,
        lastFunctionRow: lastFunctionRow
      };
    };

    PythonIndent.prototype.indentHanging = function(row, previousLine) {
      var indent;
      indent = (this.editor.indentationForBufferRow(row)) + (atom.config.get('python-indent.hangingIndentTabs'));
      return this.editor.setIndentationForBufferRow(row, indent);
    };

    return PythonIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUtBO0FBQUEsTUFBQSxZQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNOzhCQUVKOztBQUFBLDJCQUFBLGNBQUEsR0FBZ0IsU0FBQyxDQUFELEdBQUE7QUFDZCxVQUFBLDBVQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFWLENBQUE7QUFFQSxNQUFBLElBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBb0IsQ0FBQyxTQUFTLENBQUMsU0FBL0IsQ0FBeUMsQ0FBekMsRUFBNEMsRUFBNUMsQ0FBQSxLQUFtRCxlQUFqRTtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBQUEsTUFLQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQWlDLENBQUMsR0FMeEMsQ0FBQTtBQUFBLE1BTUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUFpQyxDQUFDLE1BTnhDLENBQUE7QUFBQSxNQVNBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFSLENBQTdCLENBQWlELENBQUMsS0FBbEQsQ0FBd0QsSUFBeEQsQ0FUUixDQUFBO0FBQUEsTUFZQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBL0IsQ0FaUixDQUFBO0FBQUEsTUFjQSxX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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/python-indent.coffee
