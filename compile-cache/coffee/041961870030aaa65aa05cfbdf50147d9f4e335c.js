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
      var editor, matchOpeningDelimiter, previousLine, row, _ref;
      editor = atom.workspace.getActiveTextEditor();
      if ((_ref = editor.getGrammar().name) !== 'Python' && _ref !== 'MagicPython') {
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
