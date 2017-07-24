Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _escapeStringRegexp = require('escape-string-regexp');

var _escapeStringRegexp2 = _interopRequireDefault(_escapeStringRegexp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var CodeManager = (function () {
  function CodeManager() {
    _classCallCheck(this, CodeManager);

    this.editor = atom.workspace.getActiveTextEditor();
  }

  _createClass(CodeManager, [{
    key: 'findCodeBlock',
    value: function findCodeBlock() {
      var selectedText = this.getSelectedText();

      if (selectedText) {
        var selectedRange = this.editor.getSelectedBufferRange();
        var endRow = selectedRange.end.row;
        if (selectedRange.end.column === 0) {
          endRow -= 1;
        }
        endRow = this.escapeBlankRows(selectedRange.start.row, endRow);
        return [selectedText, endRow];
      }

      var cursor = this.editor.getLastCursor();

      var row = cursor.getBufferRow();
      (0, _log2['default'])('findCodeBlock:', row);

      var indentLevel = cursor.getIndentLevel();

      var foldable = this.editor.isFoldableAtBufferRow(row);
      var foldRange = this.editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
      if (!foldRange || !foldRange[0] || !foldRange[1]) {
        foldable = false;
      }

      if (foldable) {
        return this.getFoldContents(row);
      }
      if (this.isBlank(row) || this.getRow(row) === 'end') {
        return this.findPrecedingBlock(row, indentLevel);
      }
      return [this.getRow(row), row];
    }
  }, {
    key: 'findPrecedingBlock',
    value: function findPrecedingBlock(row, indentLevel) {
      var previousRow = row - 1;
      while (previousRow >= 0) {
        var previousIndentLevel = this.editor.indentationForBufferRow(previousRow);
        var sameIndent = previousIndentLevel <= indentLevel;
        var blank = this.isBlank(previousRow);
        var isEnd = this.getRow(previousRow) === 'end';

        if (this.isBlank(row)) {
          row = previousRow;
        }
        if (sameIndent && !blank && !isEnd) {
          return [this.getRows(previousRow, row), row];
        }
        previousRow -= 1;
      }
      return null;
    }
  }, {
    key: 'getRow',
    value: function getRow(row) {
      return this.normalizeString(this.editor.lineTextForBufferRow(row));
    }
  }, {
    key: 'getTextInRange',
    value: function getTextInRange(start, end) {
      var code = this.editor.getTextInBufferRange([start, end]);
      return this.normalizeString(code);
    }
  }, {
    key: 'getRows',
    value: function getRows(startRow, endRow) {
      var code = this.editor.getTextInBufferRange({
        start: {
          row: startRow,
          column: 0
        },
        end: {
          row: endRow,
          column: 9999999
        }
      });
      return this.normalizeString(code);
    }
  }, {
    key: 'getSelectedText',
    value: function getSelectedText() {
      return this.normalizeString(this.editor.getSelectedText());
    }
  }, {
    key: 'getFoldRange',
    value: function getFoldRange(row) {
      var range = this.editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
      if (range[1] < this.editor.getLastBufferRow() && this.getRow(range[1] + 1) === 'end') {
        range[1] += 1;
      }
      (0, _log2['default'])('getFoldRange:', range);
      return range;
    }
  }, {
    key: 'getFoldContents',
    value: function getFoldContents(row) {
      var range = this.getFoldRange(row);
      return [this.getRows(range[0], range[1]), range[1]];
    }
  }, {
    key: 'getCodeToInspect',
    value: function getCodeToInspect() {
      var selectedText = this.getSelectedText();
      var code = undefined;
      var cursorPosition = undefined;
      if (selectedText) {
        code = selectedText;
        cursorPosition = code.length;
      } else {
        var cursor = this.editor.getLastCursor();
        var row = cursor.getBufferRow();
        code = this.getRow(row);
        cursorPosition = cursor.getBufferColumn();

        // TODO: use kernel.complete to find a selection
        var identifierEnd = code ? code.slice(cursorPosition).search(/\W/) : -1;
        if (identifierEnd !== -1) {
          cursorPosition += identifierEnd;
        }
      }

      return [code, cursorPosition];
    }
  }, {
    key: 'getCurrentCell',
    value: function getCurrentCell() {
      var buffer = this.editor.getBuffer();
      var start = buffer.getFirstPosition();
      var end = buffer.getEndPosition();
      var regexString = this.getRegexString(this.editor);

      if (!regexString) {
        return [start, end];
      }

      var regex = new RegExp(regexString);
      var cursor = this.editor.getCursorBufferPosition();

      while (cursor.row < end.row && this.isComment(cursor)) {
        cursor.row += 1;
        cursor.column = 0;
      }

      if (cursor.row > 0) {
        buffer.backwardsScanInRange(regex, [start, cursor], function (_ref) {
          var range = _ref.range;

          start = new _atom.Point(range.start.row + 1, 0);
        });
      }

      buffer.scanInRange(regex, [cursor, end], function (_ref2) {
        var range = _ref2.range;

        end = range.start;
      });

      (0, _log2['default'])('CellManager: Cell [start, end]:', [start, end], 'cursor:', cursor);

      return new _atom.Range(start, end);
    }
  }, {
    key: 'getBreakpoints',
    value: function getBreakpoints() {
      var buffer = this.editor.getBuffer();
      var breakpoints = [buffer.getFirstPosition()];

      var regexString = this.getRegexString(this.editor);
      if (regexString) {
        var regex = new RegExp(regexString, 'g');
        buffer.scan(regex, function (_ref3) {
          var range = _ref3.range;
          return breakpoints.push(range.start);
        });
      }

      breakpoints.push(buffer.getEndPosition());

      (0, _log2['default'])('CellManager: Breakpoints:', breakpoints);

      return breakpoints;
    }
  }, {
    key: 'getCells',
    value: function getCells() {
      var breakpoints = this.getBreakpoints();
      var start = breakpoints.shift();

      return _lodash2['default'].map(breakpoints, function (end) {
        var cell = new _atom.Range(start, end);
        start = new _atom.Point(end.row + 1, 0);
        return cell;
      });
    }
  }, {
    key: 'getRegexString',
    value: function getRegexString() {
      var scope = this.editor.getRootScopeDescriptor();

      var _getCommentStrings = this.getCommentStrings(scope);

      var commentStartString = _getCommentStrings.commentStartString;

      if (!commentStartString) {
        (0, _log2['default'])('CellManager: No comment string defined in root scope');
        return null;
      }

      var escapedCommentStartString = (0, _escapeStringRegexp2['default'])(commentStartString.trimRight());

      var regexString = escapedCommentStartString + '(%%| %%| <codecell>| In[[0-9 ]*]:?)';

      return regexString;
    }
  }, {
    key: 'getCommentStrings',
    value: function getCommentStrings(scope) {
      if (parseFloat(atom.getVersion()) <= 1.1) {
        return this.editor.languageMode.commentStartAndEndStringsForScope(scope);
      }
      return this.editor.getCommentStrings(scope);
    }
  }, {
    key: 'normalizeString',
    value: function normalizeString(code) {
      if (code) {
        return code.replace(/\r\n|\r/g, '\n').trim();
      }
      return null;
    }
  }, {
    key: 'isComment',
    value: function isComment(position) {
      var scope = this.editor.scopeDescriptorForBufferPosition(position);
      var scopeString = scope.getScopeChain();
      return _lodash2['default'].includes(scopeString, 'comment.line');
    }
  }, {
    key: 'isBlank',
    value: function isBlank(row) {
      return this.editor.getBuffer().isRowBlank(row) || this.editor.languageMode.isLineCommentedAtBufferRow(row);
    }
  }, {
    key: 'escapeBlankRows',
    value: function escapeBlankRows(startRow, endRow) {
      while (endRow > startRow) {
        if (!this.isBlank(endRow)) break;
        endRow -= 1;
      }
      return endRow;
    }
  }, {
    key: 'moveDown',
    value: function moveDown(row) {
      var lastRow = this.editor.getLastBufferRow();

      if (row >= lastRow) {
        this.editor.moveToBottom();
        this.editor.insertNewline();
        return;
      }

      while (row < lastRow) {
        row += 1;
        if (!this.isBlank(row)) break;
      }

      this.editor.setCursorBufferPosition({
        row: row,
        column: 0
      });
    }
  }]);

  return CodeManager;
})();

exports['default'] = CodeManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvZGUtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUU2QixNQUFNOztrQ0FFSixzQkFBc0I7Ozs7c0JBQ3ZDLFFBQVE7Ozs7bUJBRU4sT0FBTzs7OztBQVB2QixXQUFXLENBQUM7O0lBU1MsV0FBVztBQUNuQixXQURRLFdBQVcsR0FDaEI7MEJBREssV0FBVzs7QUFFNUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7R0FDcEQ7O2VBSGtCLFdBQVc7O1dBTWpCLHlCQUFHO0FBQ2QsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUU1QyxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0QsWUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDbkMsWUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbEMsZ0JBQU0sSUFBSSxDQUFDLENBQUM7U0FDYjtBQUNELGNBQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELGVBQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDL0I7O0FBRUQsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFM0MsVUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2xDLDRCQUFJLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUUzQixVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENB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LENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFL0MsVUFBSSxHQUFHLElBQUksT0FBTyxFQUFFO0FBQ2xCLFlBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDM0IsWUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUM1QixlQUFPO09BQ1I7O0FBRUQsYUFBTyxHQUFHLEdBQUcsT0FBTyxFQUFFO0FBQ3BCLFdBQUcsSUFBSSxDQUFDLENBQUM7QUFDVCxZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNO09BQy9COztBQUVELFVBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUM7QUFDbEMsV0FBRyxFQUFILEdBQUc7QUFDSCxjQUFNLEVBQUUsQ0FBQztPQUNWLENBQUMsQ0FBQztLQUNKOzs7U0FsUmtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvZGUtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBQb2ludCwgUmFuZ2UgfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IGVzY2FwZVN0cmluZ1JlZ2V4cCBmcm9tICdlc2NhcGUtc3RyaW5nLXJlZ2V4cCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29kZU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgfVxuXG5cbiAgZmluZENvZGVCbG9jaygpIHtcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLmdldFNlbGVjdGVkVGV4dCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkVGV4dCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKTtcbiAgICAgIGxldCBlbmRSb3cgPSBzZWxlY3RlZFJhbmdlLmVuZC5yb3c7XG4gICAgICBpZiAoc2VsZWN0ZWRSYW5nZS5lbmQuY29sdW1uID09PSAwKSB7XG4gICAgICAgIGVuZFJvdyAtPSAxO1xuICAgICAgfVxuICAgICAgZW5kUm93ID0gdGhpcy5lc2NhcGVCbGFua1Jvd3Moc2VsZWN0ZWRSYW5nZS5zdGFydC5yb3csIGVuZFJvdyk7XG4gICAgICByZXR1cm4gW3NlbGVjdGVkVGV4dCwgZW5kUm93XTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG5cbiAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KCk7XG4gICAgbG9nKCdmaW5kQ29kZUJsb2NrOicsIHJvdyk7XG5cbiAgICBjb25zdCBpbmRlbnRMZXZlbCA9IGN1cnNvci5nZXRJbmRlbnRMZXZlbCgpO1xuXG4gICAgbGV0IGZvbGRhYmxlID0gdGhpcy5lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdyk7XG4gICAgY29uc3QgZm9sZFJhbmdlID0gdGhpcy5lZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpO1xuICAgIGlmICghZm9sZFJhbmdlIHx8ICFmb2xkUmFuZ2VbMF0gfHwgIWZvbGRSYW5nZVsxXSkge1xuICAgICAgZm9sZGFibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZm9sZGFibGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZvbGRDb250ZW50cyhyb3cpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0JsYW5rKHJvdykgfHwgdGhpcy5nZXRSb3cocm93KSA9PT0gJ2VuZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRQcmVjZWRpbmdCbG9jayhyb3csIGluZGVudExldmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIFt0aGlzLmdldFJvdyhyb3cpLCByb3ddO1xuICB9XG5cblxuICBmaW5kUHJlY2VkaW5nQmxvY2socm93LCBpbmRlbnRMZXZlbCkge1xuICAgIGxldCBwcmV2aW91c1JvdyA9IHJvdyAtIDE7XG4gICAgd2hpbGUgKHByZXZpb3VzUm93ID49IDApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhwcmV2aW91c1Jvdyk7XG4gICAgICBjb25zdCBzYW1lSW5kZW50ID0gcHJldmlvdXNJbmRlbnRMZXZlbCA8PSBpbmRlbnRMZXZlbDtcbiAgICAgIGNvbnN0IGJsYW5rID0gdGhpcy5pc0JsYW5rKHByZXZpb3VzUm93KTtcbiAgICAgIGNvbnN0IGlzRW5kID0gdGhpcy5nZXRSb3cocHJldmlvdXNSb3cpID09PSAnZW5kJztcblxuICAgICAgaWYgKHRoaXMuaXNCbGFuayhyb3cpKSB7XG4gICAgICAgIHJvdyA9IHByZXZpb3VzUm93O1xuICAgICAgfVxuICAgICAgaWYgKHNhbWVJbmRlbnQgJiYgIWJsYW5rICYmICFpc0VuZCkge1xuICAgICAgICByZXR1cm4gW3RoaXMuZ2V0Um93cyhwcmV2aW91c1Jvdywgcm93KSwgcm93XTtcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzUm93IC09IDE7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICBnZXRSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplU3RyaW5nKHRoaXMuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpO1xuICB9XG5cblxuICBnZXRUZXh0SW5SYW5nZShzdGFydCwgZW5kKSB7XG4gICAgY29uc3QgY29kZSA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSk7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplU3RyaW5nKGNvZGUpO1xuICB9XG5cblxuICBnZXRSb3dzKHN0YXJ0Um93LCBlbmRSb3cpIHtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uoe1xuICAgICAgc3RhcnQ6IHtcbiAgICAgICAgcm93OiBzdGFydFJvdyxcbiAgICAgICAgY29sdW1uOiAwLFxuICAgICAgfSxcbiAgICAgIGVuZDoge1xuICAgICAgICByb3c6IGVuZFJvdyxcbiAgICAgICAgY29sdW1uOiA5OTk5OTk5LFxuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVTdHJpbmcoY29kZSk7XG4gIH1cblxuXG4gIGdldFNlbGVjdGVkVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVTdHJpbmcodGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpO1xuICB9XG5cblxuICBnZXRGb2xkUmFuZ2Uocm93KSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb2RlRm9sZEF0QnVmZmVyUm93KHJvdyk7XG4gICAgaWYgKHJhbmdlWzFdIDwgdGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpICYmXG4gICAgICB0aGlzLmdldFJvdyhyYW5nZVsxXSArIDEpID09PSAnZW5kJykge1xuICAgICAgcmFuZ2VbMV0gKz0gMTtcbiAgICB9XG4gICAgbG9nKCdnZXRGb2xkUmFuZ2U6JywgcmFuZ2UpO1xuICAgIHJldHVybiByYW5nZTtcbiAgfVxuXG5cbiAgZ2V0Rm9sZENvbnRlbnRzKHJvdykge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRGb2xkUmFuZ2Uocm93KTtcbiAgICByZXR1cm4gW3RoaXMuZ2V0Um93cyhyYW5nZVswXSwgcmFuZ2VbMV0pLCByYW5nZVsxXV07XG4gIH1cblxuXG4gIGdldENvZGVUb0luc3BlY3QoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gdGhpcy5nZXRTZWxlY3RlZFRleHQoKTtcbiAgICBsZXQgY29kZTtcbiAgICBsZXQgY3Vyc29yUG9zaXRpb247XG4gICAgaWYgKHNlbGVjdGVkVGV4dCkge1xuICAgICAgY29kZSA9IHNlbGVjdGVkVGV4dDtcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY29kZS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICAgIGNvbnN0IHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKTtcbiAgICAgIGNvZGUgPSB0aGlzLmdldFJvdyhyb3cpO1xuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCk7XG5cbiAgICAgIC8vIFRPRE86IHVzZSBrZXJuZWwuY29tcGxldGUgdG8gZmluZCBhIHNlbGVjdGlvblxuICAgICAgY29uc3QgaWRlbnRpZmllckVuZCA9IGNvZGUgPyBjb2RlLnNsaWNlKGN1cnNvclBvc2l0aW9uKS5zZWFyY2goL1xcVy8pIDogLTE7XG4gICAgICBpZiAoaWRlbnRpZmllckVuZCAhPT0gLTEpIHtcbiAgICAgICAgY3Vyc29yUG9zaXRpb24gKz0gaWRlbnRpZmllckVuZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW2NvZGUsIGN1cnNvclBvc2l0aW9uXTtcbiAgfVxuXG5cbiAgZ2V0Q3VycmVudENlbGwoKSB7XG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgbGV0IHN0YXJ0ID0gYnVmZmVyLmdldEZpcnN0UG9zaXRpb24oKTtcbiAgICBsZXQgZW5kID0gYnVmZmVyLmdldEVuZFBvc2l0aW9uKCk7XG4gICAgY29uc3QgcmVnZXhTdHJpbmcgPSB0aGlzLmdldFJlZ2V4U3RyaW5nKHRoaXMuZWRpdG9yKTtcblxuICAgIGlmICghcmVnZXhTdHJpbmcpIHtcbiAgICAgIHJldHVybiBbc3RhcnQsIGVuZF07XG4gICAgfVxuXG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nKTtcbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuXG4gICAgd2hpbGUgKGN1cnNvci5yb3cgPCBlbmQucm93ICYmIHRoaXMuaXNDb21tZW50KGN1cnNvcikpIHtcbiAgICAgIGN1cnNvci5yb3cgKz0gMTtcbiAgICAgIGN1cnNvci5jb2x1bW4gPSAwO1xuICAgIH1cblxuICAgIGlmIChjdXJzb3Iucm93ID4gMCkge1xuICAgICAgYnVmZmVyLmJhY2t3YXJkc1NjYW5JblJhbmdlKHJlZ2V4LCBbc3RhcnQsIGN1cnNvcl0sICh7IHJhbmdlIH0pID0+IHtcbiAgICAgICAgc3RhcnQgPSBuZXcgUG9pbnQocmFuZ2Uuc3RhcnQucm93ICsgMSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBidWZmZXIuc2NhbkluUmFuZ2UocmVnZXgsIFtjdXJzb3IsIGVuZF0sICh7IHJhbmdlIH0pID0+IHtcbiAgICAgIGVuZCA9IHJhbmdlLnN0YXJ0O1xuICAgIH0pO1xuXG4gICAgbG9nKCdDZWxsTWFuYWdlcjogQ2VsbCBbc3RhcnQsIGVuZF06JywgW3N0YXJ0LCBlbmRdLFxuICAgICAgJ2N1cnNvcjonLCBjdXJzb3IpO1xuXG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKTtcbiAgfVxuXG5cbiAgZ2V0QnJlYWtwb2ludHMoKSB7XG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgY29uc3QgYnJlYWtwb2ludHMgPSBbYnVmZmVyLmdldEZpcnN0UG9zaXRpb24oKV07XG5cbiAgICBjb25zdCByZWdleFN0cmluZyA9IHRoaXMuZ2V0UmVnZXhTdHJpbmcodGhpcy5lZGl0b3IpO1xuICAgIGlmIChyZWdleFN0cmluZykge1xuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLCAnZycpO1xuICAgICAgYnVmZmVyLnNjYW4ocmVnZXgsICh7IHJhbmdlIH0pID0+IGJyZWFrcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpKTtcbiAgICB9XG5cbiAgICBicmVha3BvaW50cy5wdXNoKGJ1ZmZlci5nZXRFbmRQb3NpdGlvbigpKTtcblxuICAgIGxvZygnQ2VsbE1hbmFnZXI6IEJyZWFrcG9pbnRzOicsIGJyZWFrcG9pbnRzKTtcblxuICAgIHJldHVybiBicmVha3BvaW50cztcbiAgfVxuXG4gIGdldENlbGxzKCkge1xuICAgIGNvbnN0IGJyZWFrcG9pbnRzID0gdGhpcy5nZXRCcmVha3BvaW50cygpO1xuICAgIGxldCBzdGFydCA9IGJyZWFrcG9pbnRzLnNoaWZ0KCk7XG5cbiAgICByZXR1cm4gXy5tYXAoYnJlYWtwb2ludHMsIChlbmQpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBuZXcgUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICBzdGFydCA9IG5ldyBQb2ludChlbmQucm93ICsgMSwgMCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9KTtcbiAgfVxuXG5cbiAgZ2V0UmVnZXhTdHJpbmcoKSB7XG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLmVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCk7XG5cbiAgICBjb25zdCB7IGNvbW1lbnRTdGFydFN0cmluZyB9ID0gdGhpcy5nZXRDb21tZW50U3RyaW5ncyhzY29wZSk7XG5cbiAgICBpZiAoIWNvbW1lbnRTdGFydFN0cmluZykge1xuICAgICAgbG9nKCdDZWxsTWFuYWdlcjogTm8gY29tbWVudCBzdHJpbmcgZGVmaW5lZCBpbiByb290IHNjb3BlJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBlc2NhcGVkQ29tbWVudFN0YXJ0U3RyaW5nID1cbiAgICAgIGVzY2FwZVN0cmluZ1JlZ2V4cChjb21tZW50U3RhcnRTdHJpbmcudHJpbVJpZ2h0KCkpO1xuXG4gICAgY29uc3QgcmVnZXhTdHJpbmcgPVxuICAgICAgYCR7ZXNjYXBlZENvbW1lbnRTdGFydFN0cmluZ30oJSV8ICUlfCA8Y29kZWNlbGw+fCBJblxcW1swLTkgXSpcXF06PylgO1xuXG4gICAgcmV0dXJuIHJlZ2V4U3RyaW5nO1xuICB9XG5cblxuICBnZXRDb21tZW50U3RyaW5ncyhzY29wZSkge1xuICAgIGlmIChwYXJzZUZsb2F0KGF0b20uZ2V0VmVyc2lvbigpKSA8PSAxLjEpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5sYW5ndWFnZU1vZGUuY29tbWVudFN0YXJ0QW5kRW5kU3RyaW5nc0ZvclNjb3BlKHNjb3BlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldENvbW1lbnRTdHJpbmdzKHNjb3BlKTtcbiAgfVxuXG5cbiAgbm9ybWFsaXplU3RyaW5nKGNvZGUpIHtcbiAgICBpZiAoY29kZSkge1xuICAgICAgcmV0dXJuIGNvZGUucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJykudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgaXNDb21tZW50KHBvc2l0aW9uKSB7XG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLmVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgY29uc3Qgc2NvcGVTdHJpbmcgPSBzY29wZS5nZXRTY29wZUNoYWluKCk7XG4gICAgcmV0dXJuIF8uaW5jbHVkZXMoc2NvcGVTdHJpbmcsICdjb21tZW50LmxpbmUnKTtcbiAgfVxuXG5cbiAgaXNCbGFuayhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkuaXNSb3dCbGFuayhyb3cpIHx8XG4gICAgICB0aGlzLmVkaXRvci5sYW5ndWFnZU1vZGUuaXNMaW5lQ29tbWVudGVkQXRCdWZmZXJSb3cocm93KTtcbiAgfVxuXG5cbiAgZXNjYXBlQmxhbmtSb3dzKHN0YXJ0Um93LCBlbmRSb3cpIHtcbiAgICB3aGlsZSAoZW5kUm93ID4gc3RhcnRSb3cpIHtcbiAgICAgIGlmICghdGhpcy5pc0JsYW5rKGVuZFJvdykpIGJyZWFrO1xuICAgICAgZW5kUm93IC09IDE7XG4gICAgfVxuICAgIHJldHVybiBlbmRSb3c7XG4gIH1cblxuXG4gIG1vdmVEb3duKHJvdykge1xuICAgIGNvbnN0IGxhc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCk7XG5cbiAgICBpZiAocm93ID49IGxhc3RSb3cpIHtcbiAgICAgIHRoaXMuZWRpdG9yLm1vdmVUb0JvdHRvbSgpO1xuICAgICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlIChyb3cgPCBsYXN0Um93KSB7XG4gICAgICByb3cgKz0gMTtcbiAgICAgIGlmICghdGhpcy5pc0JsYW5rKHJvdykpIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHtcbiAgICAgIHJvdyxcbiAgICAgIGNvbHVtbjogMCxcbiAgICB9KTtcbiAgfVxufVxuIl19