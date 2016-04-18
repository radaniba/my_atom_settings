(function() {
  var AutocompleteProvider, CompositeDisposable, Hydrogen, KernelManager, ResultView, SignalListView, WatchLanguagePicker, WatchSidebar, fs, stripAnsi, zmq, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  zmq = require('zmq');

  _ = require('lodash');

  stripAnsi = require('strip-ansi');

  KernelManager = require('./kernel-manager');

  ResultView = require('./result-view');

  SignalListView = require('./signal-list-view');

  WatchSidebar = require('./watch-sidebar');

  WatchLanguagePicker = require('./watch-language-picker');

  AutocompleteProvider = require('./autocomplete-provider');

  module.exports = Hydrogen = {
    config: require('./config'),
    subscriptions: null,
    statusBarElement: null,
    statusBarTile: null,
    editor: null,
    markerBubbleMap: {},
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'hydrogen:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this),
        'hydrogen:run-all': (function(_this) {
          return function() {
            return _this.runAll();
          };
        })(this),
        'hydrogen:run-all-above': (function(_this) {
          return function() {
            return _this.runAllAbove();
          };
        })(this),
        'hydrogen:run-and-move-down': (function(_this) {
          return function() {
            return _this.runAndMoveDown();
          };
        })(this),
        'hydrogen:show-kernel-commands': (function(_this) {
          return function() {
            return _this.showKernelCommands();
          };
        })(this),
        'hydrogen:toggle-watches': (function(_this) {
          return function() {
            return _this.toggleWatchSidebar();
          };
        })(this),
        'hydrogen:select-watch-kernel': (function(_this) {
          return function() {
            return _this.showWatchLanguagePicker();
          };
        })(this),
        'hydrogen:add-watch': (function(_this) {
          return function() {
            return _this.watchSidebar.addWatchFromEditor();
          };
        })(this),
        'hydrogen:remove-watch': (function(_this) {
          return function() {
            return _this.watchSidebar.removeWatch();
          };
        })(this),
        'hydrogen:update-kernels': function() {
          return KernelManager.updateKernels();
        },
        'hydrogen:inspect': (function(_this) {
          return function() {
            return _this.inspect();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'hydrogen:clear-results': (function(_this) {
          return function() {
            return _this.clearResultBubbles();
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor.bind(this)));
      return this.editor = atom.workspace.getActiveTextEditor();
    },
    deactivate: function() {
      this.subscriptions.dispose();
      KernelManager.destroy();
      return this.statusBarTile.destroy();
    },
    consumeStatusBar: function(statusBar) {
      console.log("making status bar");
      this.statusBarElement = document.createElement('div');
      this.statusBarElement.classList.add('hydrogen');
      this.statusBarElement.classList.add('status-container');
      this.statusBarElement.onclick = function() {
        var editorView;
        editorView = atom.views.getView(atom.workspace.getActiveTextEditor());
        return atom.commands.dispatch(editorView, 'hydrogen:show-kernel-commands');
      };
      return this.statusBarTile = statusBar.addLeftTile({
        item: this.statusBarElement
      }, {
        priority: 100
      });
    },
    provide: function() {
      if (KernelManager.getConfigJson('autocomplete') === true) {
        return AutocompleteProvider;
      }
    },
    updateCurrentEditor: function(currentPaneItem) {
      var kernel, language, _base, _ref;
      if ((currentPaneItem == null) || currentPaneItem === this.editor) {
        return;
      }
      console.log("Updating current editor to:", currentPaneItem);
      this.editor = currentPaneItem;
      language = typeof (_base = this.editor).getGrammar === "function" ? (_ref = _base.getGrammar()) != null ? _ref.name.toLowerCase() : void 0 : void 0;
      if (language != null) {
        kernel = KernelManager.getRunningKernelForLanguage(language);
      }
      if (kernel != null) {
        return this.setStatusBarElement(kernel.statusView.getElement());
      } else {
        return this.removeStatusBarElement();
      }
    },
    showKernelCommands: function() {
      if (this.signalListView == null) {
        this.signalListView = new SignalListView();
        this.signalListView.onConfirmed = this.handleKernelCommand.bind(this);
      }
      return this.signalListView.toggle();
    },
    handleKernelCommand: function(command) {
      var grammar, kernelInfo, language, mapping, request;
      console.log("handleKernelCommand:", command);
      request = command.value;
      language = command.language;
      grammar = command.grammar;
      kernelInfo = command.kernelInfo;
      if (request === 'interrupt-kernel') {
        return KernelManager.interruptKernelForLanguage(language);
      } else if (request === 'restart-kernel') {
        KernelManager.destroyKernelForLanguage(language);
        this.clearResultBubbles();
        return KernelManager.startKernelIfNeeded(language);
      } else if (request === 'switch-kernel') {
        KernelManager.destroyKernelForLanguage(language);
        this.clearResultBubbles();
        mapping = {};
        mapping[grammar] = kernelInfo.display_name;
        KernelManager.setConfigJson('grammarToKernel', mapping, true);
        return KernelManager.startKernel(kernelInfo);
      }
    },
    createResultBubble: function(code, row) {
      var language;
      language = this.editor.getGrammar().name.toLowerCase();
      return KernelManager.startKernelIfNeeded(language, (function(_this) {
        return function(kernel) {
          var view;
          if (_this.watchSidebar == null) {
            _this.setWatchSidebar(kernel.watchSidebar);
          } else if (_this.watchSidebar.element.contains(document.activeElement)) {
            _this.watchSidebar.run();
            return;
          }
          _this.setStatusBarElement(kernel.statusView.getElement());
          _this.clearBubblesOnRow(row);
          view = _this.insertResultBubble(row);
          return KernelManager.execute(language, code, function(result) {
            view.spin(false);
            return view.addResult(result);
          });
        };
      })(this));
    },
    insertResultBubble: function(row) {
      var buffer, element, lineHeight, lineLength, marker, topOffset, view;
      buffer = this.editor.getBuffer();
      lineLength = buffer.lineLengthForRow(row);
      marker = this.editor.markBufferPosition({
        row: row,
        column: lineLength
      }, {
        invalidate: 'touch'
      });
      view = new ResultView(marker);
      view.spin(true);
      element = view.getElement();
      lineHeight = this.editor.getLineHeightInPixels();
      topOffset = lineHeight;
      element.setAttribute('style', "top: -" + topOffset + "px;");
      view.spinner.setAttribute('style', "width: " + (lineHeight + 2) + "px; height: " + (lineHeight - 4) + "px;");
      view.statusContainer.setAttribute('style', "height: " + lineHeight + "px");
      this.editor.decorateMarker(marker, {
        type: 'overlay',
        item: element,
        position: 'tail'
      });
      this.markerBubbleMap[marker.id] = view;
      marker.onDidChange((function(_this) {
        return function(event) {
          console.log("Invoked onDidChange:", marker);
          if (!event.isValid) {
            view.destroy();
            marker.destroy();
            return delete _this.markerBubbleMap[marker.id];
          }
        };
      })(this));
      return view;
    },
    clearResultBubbles: function() {
      _.forEach(this.markerBubbleMap, function(bubble) {
        return bubble.destroy();
      });
      return this.markerBubbleMap = {};
    },
    clearBubblesOnRow: function(row) {
      var buffer;
      buffer = this.editor.getBuffer();
      return _.forEach(buffer.findMarkers({
        endRow: row
      }), (function(_this) {
        return function(marker) {
          if (_this.markerBubbleMap[marker.id] != null) {
            _this.markerBubbleMap[marker.id].destroy();
            return delete _this.markerBubbleMap[marker.id];
          }
        };
      })(this));
    },
    moveDown: function(row) {
      var lastRow;
      lastRow = this.editor.getLastBufferRow();
      if (row >= lastRow) {
        this.editor.moveToBottom();
        this.editor.insertNewline();
        return;
      }
      while (row < lastRow) {
        row++;
        if (!this.blank(row)) {
          break;
        }
      }
      return this.editor.setCursorBufferPosition({
        row: row,
        column: 0
      });
    },
    run: function() {
      var code, codeBlock, row;
      codeBlock = this.findCodeBlock();
      if (codeBlock == null) {
        return;
      }
      code = codeBlock[0], row = codeBlock[1];
      if ((code != null) && (row != null)) {
        return this.createResultBubble(code, row);
      }
    },
    runAll: function() {
      var code, i, row, _i, _ref;
      code = this.editor.getText();
      row = this.editor.getLastBufferRow();
      if (row > 0) {
        for (i = _i = 0, _ref = row - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (this.blank(row)) {
            row -= 1;
          }
        }
      }
      return this.createResultBubble(code, row);
    },
    runAllAbove: function() {
      var code, codeBlock, row;
      codeBlock = this.findCodeBlock(true);
      if (codeBlock == null) {
        return;
      }
      code = codeBlock[0], row = codeBlock[1];
      if ((code != null) && (row != null)) {
        return this.createResultBubble(code, row);
      }
    },
    runAndMoveDown: function() {
      var code, codeBlock, row;
      codeBlock = this.findCodeBlock();
      if (codeBlock == null) {
        return;
      }
      code = codeBlock[0], row = codeBlock[1];
      if ((code != null) && (row != null)) {
        this.createResultBubble(code, row);
        return this.moveDown(row);
      }
    },
    removeStatusBarElement: function() {
      var _results;
      if (this.statusBarElement != null) {
        _results = [];
        while (this.statusBarElement.hasChildNodes()) {
          _results.push(this.statusBarElement.removeChild(this.statusBarElement.lastChild));
        }
        return _results;
      }
    },
    setStatusBarElement: function(element) {
      if (this.statusBarElement != null) {
        this.removeStatusBarElement();
        return this.statusBarElement.appendChild(element);
      } else {
        return console.error("No status bar element. Can't set it.");
      }
    },
    hideWatchSidebar: function() {
      console.log("hiding watch sidebar");
      if (this.watchSidebar != null) {
        console.log("there is a sidebar to hide");
        return this.watchSidebar.hide();
      }
    },
    showWatchSidebar: function() {
      console.log("showing watch sidebar");
      if (this.watchSidebar != null) {
        return this.watchSidebar.show();
      }
    },
    toggleWatchSidebar: function() {
      if ((this.watchSidebar != null) && this.watchSidebar.visible) {
        return this.watchSidebar.hide();
      } else {
        return this.watchSidebar.show();
      }
    },
    setWatchSidebar: function(sidebar) {
      console.log("setting watch sidebar");
      if ((this.watchSidebar != null) && this.watchSidebar !== sidebar && this.watchSidebar.visible) {
        this.watchSidebar.hide();
        this.watchSidebar = sidebar;
        return this.watchSidebar.show();
      } else {
        return this.watchSidebar = sidebar;
      }
    },
    showWatchLanguagePicker: function() {
      if (this.watchLanguagePicker == null) {
        this.watchLanguagePicker = new WatchLanguagePicker();
        this.watchLanguagePicker.onConfirmed = this.handleWatchLanguageCommand.bind(this);
      }
      return this.watchLanguagePicker.toggle();
    },
    handleWatchLanguageCommand: function(command) {
      var kernel;
      kernel = KernelManager.getRunningKernelForLanguage(command.value);
      return this.setWatchSidebar(kernel.watchSidebar);
    },
    findCodeBlock: function(runAllAbove) {
      var buffer, cursor, endRow, foldRange, foldable, i, indentLevel, row, selectedRange, selectedText, _i, _ref;
      if (runAllAbove == null) {
        runAllAbove = false;
      }
      buffer = this.editor.getBuffer();
      selectedText = this.editor.getSelectedText();
      if (selectedText !== '') {
        selectedRange = this.editor.getSelectedBufferRange();
        endRow = selectedRange.end.row;
        if (selectedRange.end.column === 0) {
          endRow = endRow - 1;
        }
        while (this.blank(endRow) && endRow > selectedRange.start.row) {
          endRow = endRow - 1;
        }
        return [selectedText, endRow];
      }
      cursor = this.editor.getLastCursor();
      row = cursor.getBufferRow();
      console.log("row:", row);
      if (runAllAbove) {
        if (row > 0) {
          for (i = _i = 0, _ref = row - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (this.blank(row)) {
              row -= 1;
            }
          }
        }
        return [this.getRows(0, row), row];
      }
      indentLevel = cursor.getIndentLevel();
      foldable = this.editor.isFoldableAtBufferRow(row);
      foldRange = this.editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
      if ((foldRange == null) || (foldRange[0] == null) || (foldRange[1] == null)) {
        foldable = false;
      }
      if (foldable) {
        return this.getFoldContents(row);
      } else if (this.blank(row)) {
        return this.findPrecedingBlock(row, indentLevel);
      } else if (this.getRow(row).trim() === "end") {
        return this.findPrecedingBlock(row, indentLevel);
      } else {
        return [this.getRow(row), row];
      }
    },
    findPrecedingBlock: function(row, indentLevel) {
      var blank, buffer, isEnd, previousIndentLevel, previousRow, sameIndent;
      buffer = this.editor.getBuffer();
      previousRow = row - 1;
      while (previousRow >= 0) {
        previousIndentLevel = this.editor.indentationForBufferRow(previousRow);
        sameIndent = previousIndentLevel <= indentLevel;
        blank = this.blank(previousRow);
        isEnd = this.getRow(previousRow).trim() === "end";
        if (this.blank(row)) {
          row = previousRow;
        }
        if (sameIndent && !blank && !isEnd) {
          return [this.getRows(previousRow, row), row];
        }
        previousRow--;
      }
      return null;
    },
    blank: function(row) {
      return this.editor.getBuffer().isRowBlank(row) || this.editor.languageMode.isLineCommentedAtBufferRow(row);
    },
    getRow: function(row) {
      var buffer;
      buffer = this.editor.getBuffer();
      return buffer.getTextInRange({
        start: {
          row: row,
          column: 0
        },
        end: {
          row: row,
          column: 9999999
        }
      });
    },
    getRows: function(startRow, endRow) {
      var buffer;
      buffer = this.editor.getBuffer();
      return buffer.getTextInRange({
        start: {
          row: startRow,
          column: 0
        },
        end: {
          row: endRow,
          column: 9999999
        }
      });
    },
    getFoldRange: function(editor, row) {
      var range;
      range = editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
      if (this.getRow(range[1] + 1).trim() === 'end') {
        range[1] = range[1] + 1;
      }
      console.log("fold range:", range);
      return range;
    },
    getFoldContents: function(row) {
      var buffer, range;
      buffer = this.editor.getBuffer();
      range = this.getFoldRange(this.editor, row);
      return [this.getRows(range[0], range[1]), range[1]];
    },
    inspect: function() {
      var code, cursor, cursor_pos, language, row;
      language = this.editor.getGrammar().name.toLowerCase();
      if (this.editor.getSelectedText() !== '') {
        code = this.editor.getSelectedText();
        cursor_pos = code.length;
      } else {
        cursor = this.editor.getLastCursor();
        row = cursor.getBufferRow();
        code = this.getRow(row);
        cursor_pos = cursor.getBufferColumn();
      }
      return KernelManager.inspect(language, code, cursor_pos, function(result) {
        var data, found;
        console.log('inspect result:', result);
        found = result['found'];
        if (found === true) {
          data = result['data'];
          return atom.workspace.open('.Hydrogen Inspector', {
            split: 'down'
          }).then(function(editor) {
            var buffer;
            if (editor.isEmpty() === false) {
              buffer = editor.getBuffer();
              buffer.deleteRows(0, buffer.getLineCount());
            }
            editor.setSoftWrapped(true);
            editor.setLineNumberGutterVisible(false);
            editor.insertText(stripAnsi(data['text/plain']));
            editor.moveToTop();
            atom.workspace.activatePreviousPane();
            return editor.save();
          });
        } else {
          return atom.notifications.addInfo("No introspection available!");
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0pBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSkosQ0FBQTs7QUFBQSxFQUtBLFNBQUEsR0FBWSxPQUFBLENBQVEsWUFBUixDQUxaLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBVGpCLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVh0QixDQUFBOztBQUFBLEVBWUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlCQUFSLENBWnZCLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFBUSxPQUFBLENBQVEsVUFBUixDQUFSO0FBQUEsSUFHQSxhQUFBLEVBQWUsSUFIZjtBQUFBLElBSUEsZ0JBQUEsRUFBa0IsSUFKbEI7QUFBQSxJQUtBLGFBQUEsRUFBZSxJQUxmO0FBQUEsSUFNQSxNQUFBLEVBQVEsSUFOUjtBQUFBLElBT0Es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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
