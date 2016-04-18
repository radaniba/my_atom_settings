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
      if (!(openBracketStack.length || (lastClosedRow.length && openBracketStack))) {
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
              } else if (__indexOf.call('})]', c) >= 0 && openBracketStack.length) {
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
