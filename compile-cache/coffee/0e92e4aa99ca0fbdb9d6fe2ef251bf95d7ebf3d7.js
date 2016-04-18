(function() {
  var PythonIndent,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = PythonIndent = (function() {
    function PythonIndent() {}

    PythonIndent.prototype.properlyIndent = function(e) {
      var closedBracketOpenedAfterLineWithCurrentOpen, col, column, haveClosedBracket, indent, indentColumn, indentLevel, justClosedBracket, justOpenedBracket, lastClosedRow, lastColonRow, lastOpenBracketLocations, lines, offset, openBracketStack, parseOutput, previousIndent, rem, row, shouldHang, startRange, stopRange, tabLength, tabs;
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
      lastColonRow = parseOutput.lastColonRow;
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
          if (lastColonRow === row - 1) {
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
      var c, checkNextCharForString, col, inTripleQuotedString, isEscaped, lastClosedRow, lastColonRow, lastlastColonRow, line, numConsecutiveStringDelimiters, openBracketStack, row, shouldHang, stringDelimiter, _i, _j, _ref, _ref1;
      openBracketStack = [];
      lastClosedRow = [];
      stringDelimiter = [];
      lastColonRow = NaN;
      inTripleQuotedString = false;
      checkNextCharForString = false;
      numConsecutiveStringDelimiters = 0;
      for (row = _i = 0, _ref = lines.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
        line = lines[row];
        isEscaped = false;
        shouldHang = false;
        lastlastColonRow = lastColonRow;
        for (col = _j = 0, _ref1 = line.length - 1; _j <= _ref1; col = _j += 1) {
          c = line[col];
          if (c === stringDelimiter && !isEscaped) {
            numConsecutiveStringDelimiters += 1;
          } else if (checkNextCharForString) {
            numConsecutiveStringDelimiters = 0;
            stringDelimiter = [];
          } else {
            numConsecutiveStringDelimiters = 0;
          }
          checkNextCharForString = false;
          if (stringDelimiter.length) {
            if (isEscaped) {
              isEscaped = false;
            } else {
              if (c === stringDelimiter) {
                if (inTripleQuotedString) {
                  if (numConsecutiveStringDelimiters === 3) {
                    numConsecutiveStringDelimiters = 0;
                    stringDelimiter = [];
                    inTripleQuotedString = false;
                  }
                } else if (numConsecutiveStringDelimiters === 3) {
                  numConsecutiveStringDelimiters = 0;
                  inTripleQuotedString = true;
                } else if (numConsecutiveStringDelimiters === 2) {
                  checkNextCharForString = true;
                } else if (numConsecutiveStringDelimiters === 1) {
                  stringDelimiter = [];
                }
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
              lastColonRow = lastlastColonRow;
              if (c === ':') {
                lastColonRow = row;
              } else if (__indexOf.call('})]', c) >= 0 && openBracketStack.length) {
                lastClosedRow = [openBracketStack.pop()[0], row];
              } else if (__indexOf.call('\'"', c) >= 0) {
                stringDelimiter = c;
                numConsecutiveStringDelimiters += 1;
              }
            }
          }
        }
      }
      return {
        openBracketStack: openBracketStack,
        lastClosedRow: lastClosedRow,
        shouldHang: shouldHang,
        lastColonRow: lastColonRow
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUtBO0FBQUEsTUFBQSxZQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNOzhCQUVKOztBQUFBLDJCQUFBLGNBQUEsR0FBZ0IsU0FBQyxDQUFELEdBQUE7QUFDZCxVQUFBLHVVQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFWLENBQUE7QUFFQSxNQUFBLElBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBb0IsQ0FBQyxTQUFTLENBQUMsU0FBL0IsQ0FBeUMsQ0FBekMsRUFBNEMsRUFBNUMsQ0FBQSxLQUFtRCxlQUFqRTtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBQUEsTUFLQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQWlDLENBQUMsR0FMeEMsQ0FBQTtBQUFBLE1BTUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUFpQyxDQUFDLE1BTnhDLENBQUE7QUFBQSxNQVNBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFSLENBQTdCLENBQWlELENBQUMsS0FBbEQsQ0FBd0QsSUFBeEQsQ0FUUixDQUFBO0FBQUEsTUFZQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBL0IsQ0FaUixDQUFBO0FBQUEsTUFjQSxX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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/python-indent.coffee
