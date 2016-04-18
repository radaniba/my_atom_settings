(function() {
  var CompositeDisposable, PythonIndent;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = PythonIndent = {
    config: {
      openingDelimiterIndentRegex: {
        type: 'string',
        "default": '^.*(\\(|\\[).*,$',
        description: 'Regular Expression for _aligned with opening delimiter_ continuation indent type, and used for determining when this type of indent should be _started_.'
      },
      openingDelimiterUnindentRegex: {
        type: 'string',
        "default": '^\\s+\\S*(\\)|\\]):?$',
        description: 'Regular Expression for _aligned with opening delimiter_ continuation indent type, and used for determining when this type of indent should be _ended_.'
      },
      hangingIndentRegex: {
        type: 'string',
        "default": '^.*(\\(|\\[)$',
        description: 'Regular Expression for _hanging indent_ used for determining when this type of indent should be _started_.'
      },
      hangingIndentTabs: {
        type: 'number',
        "default": 1,
        description: 'Number of tabs used for _hanging_ indents',
        "enum": [1, 2]
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'editor:newline': (function(_this) {
          return function() {
            return _this.properlyIndent();
          };
        })(this)
      }));
      this.openingDelimiterIndentRegex = new RegExp(atom.config.get('python-indent.openingDelimiterIndentRegex'));
      this.openingDelimiterUnindentRegex = new RegExp(atom.config.get('python-indent.openingDelimiterUnindentRegex'));
      return this.hangingIndentRegex = new RegExp(atom.config.get('python-indent.hangingIndentRegex'));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    properlyIndent: function() {
      var editor, matchOpeningDelimiter, previousLine, row;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getGrammar().scopeName.substring(0, 13) !== 'source.python') {
        return;
      }
      row = editor.getCursorBufferPosition().row;
      previousLine = editor.buffer.lineForRow(row - 1);
      if (!row) {
        return;
      }
      if ((matchOpeningDelimiter = PythonIndent.openingDelimiterIndentRegex.exec(previousLine)) !== null) {
        return PythonIndent.indentOnOpeningDelimiter(editor, row, previousLine, matchOpeningDelimiter);
      } else if (PythonIndent.hangingIndentRegex.test(previousLine)) {
        return PythonIndent.indentHanging(editor, row, previousLine);
      } else if (PythonIndent.openingDelimiterUnindentRegex.test(previousLine)) {
        return PythonIndent.unindentOnOpeningDelimiter(editor, row, previousLine);
      }
    },
    indentOnOpeningDelimiter: function(editor, row, previousLine, matchOpeningDelimiter) {
      var column, indent, indentColumn, offset, rem, tabLength, tabs;
      indentColumn = previousLine.lastIndexOf(matchOpeningDelimiter[1]) + 1;
      tabLength = editor.getTabLength();
      tabs = (indentColumn / tabLength) - editor.indentationForBufferRow(row);
      rem = indentColumn % tabLength;
      tabs = rem > 0 ? Math.ceil(tabs) : tabs;
      offset = rem > 0 ? tabLength - rem : 0;
      indent = editor.buildIndentString(tabs, column = offset);
      return editor.getBuffer().setTextInRange([[row, 0], [row, 0]], indent);
    },
    unindentOnOpeningDelimiter: function(editor, row, previousLine) {
      var i, indent, line, lines, _i, _results;
      lines = row > 0 ? editor.buffer.lines.slice(0, +(row - 1) + 1 || 9e9) : [];
      _results = [];
      for (i = _i = lines.length - 1; _i >= 0; i = _i += -1) {
        line = lines[i];
        if (PythonIndent.openingDelimiterIndentRegex.test(line)) {
          indent = editor.indentationForBufferRow(i);
          if (previousLine.slice(-1) === ':') {
            indent += 1;
          }
          editor.setIndentationForBufferRow(row, indent);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    indentHanging: function(editor, row, previousLine) {
      var indent;
      indent = (editor.indentationForBufferRow(row)) + (atom.config.get('python-indent.hangingIndentTabs'));
      return editor.transact((function(_this) {
        return function() {
          if (/^\s*$/.test(editor.buffer.lineForRow(row))) {
            editor["delete"]();
          }
          return editor.setIndentationForBufferRow(row, indent);
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBQSxHQUNmO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLDJCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsa0JBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwwSkFGYjtPQURGO0FBQUEsTUFJQSw2QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLHVCQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsd0pBRmI7T0FMRjtBQUFBLE1BUUEsa0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxlQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsNEdBRmI7T0FURjtBQUFBLE1BWUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsMkNBRmI7QUFBQSxRQUdBLE1BQUEsRUFBTSxDQUNKLENBREksRUFFSixDQUZJLENBSE47T0FiRjtLQURGO0FBQUEsSUFzQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFD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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/lib/python-indent.coffee
