(function() {
  var AutocompleteProvider, CompositeDisposable, ConfigManager, Hydrogen, KernelManager, ResultView, SignalListView, WatchLanguagePicker, WatchSidebar, fs, zmq, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  zmq = require('zmq');

  _ = require('lodash');

  KernelManager = require('./kernel-manager');

  ConfigManager = require('./config-manager');

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
            return _this.run(false, false, false);
          };
        })(this),
        'hydrogen:run-all': (function(_this) {
          return function() {
            return _this.run(false, true, false);
          };
        })(this),
        'hydrogen:run-and-move-down': (function(_this) {
          return function() {
            return _this.run(true, false, false);
          };
        })(this),
        'hydrogen:run-all-above': (function(_this) {
          return function() {
            return _this.run(false, false, true);
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
        }
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
      this.statusBarElement.onclick = (function(_this) {
        return function() {
          var editorView;
          editorView = atom.views.getView(atom.workspace.getActiveTextEditor());
          return atom.commands.dispatch(editorView, 'hydrogen:show-kernel-commands');
        };
      })(this);
      return this.statusBarTile = statusBar.addLeftTile({
        item: this.statusBarElement
      }, {
        priority: 100
      });
    },
    provide: function() {
      return AutocompleteProvider;
    },
    updateCurrentEditor: function(currentPaneItem) {
      var kernel, language;
      console.log("Updating current editor to:", currentPaneItem);
      if ((currentPaneItem == null) || currentPaneItem === this.editor) {
        return;
      }
      this.editor = currentPaneItem;
      if ((this.editor != null) && (this.editor.getGrammar != null) && (this.editor.getGrammar() != null)) {
        language = this.editor.getGrammar().name.toLowerCase();
        kernel = KernelManager.getRunningKernelForLanguage(language);
        if (kernel != null) {
          return this.setStatusBarElement(kernel.statusView.getElement());
        } else {
          return this.removeStatusBarElement();
        }
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
      var mapping;
      if (command.value === 'interrupt-kernel') {
        return KernelManager.interruptKernelForLanguage(command.language);
      } else if (command.value === 'restart-kernel') {
        KernelManager.destroyKernelForLanguage(command.language);
        this.clearResultBubbles();
        return this.startKernelIfNeeded(command.language);
      } else if (command.value === 'switch-kernel') {
        KernelManager.destroyKernelForLanguage(command.language);
        mapping = {};
        mapping[command.grammar] = command.kernelInfo.display_name;
        KernelManager.setConfigJson('grammarToKernel', mapping, true);
        this.clearResultBubbles();
        return ConfigManager.writeConfigFile(function(filepath, config) {
          return KernelManager.startKernel(command.kernelInfo, config, filepath);
        });
      }
    },
    createResultBubble: function(andMoveDown, runAll, runAllAbove) {
      var bubbleRow, code, codeBlock, cursorRow, isCodeBlockOnLastRow, isCursorBelowCodeBlock, isCursorOnLastRow, isTextSelection, language, lastRow, row, view;
      if (andMoveDown == null) {
        andMoveDown = false;
      }
      if (runAll == null) {
        runAll = false;
      }
      if (runAllAbove == null) {
        runAllAbove = false;
      }
      language = this.editor.getGrammar().name.toLowerCase();
      codeBlock = this.findCodeBlock(runAll, runAllAbove);
      if (codeBlock != null) {
        code = codeBlock[0], row = codeBlock[1];
      }
      if (code != null) {
        this.clearBubblesOnRow(row);
        if (andMoveDown) {
          bubbleRow = row;
          lastRow = this.editor.getLastBufferRow();
          isCodeBlockOnLastRow = bubbleRow === lastRow;
          isTextSelection = !this.editor.getLastSelection().isEmpty();
          if (isTextSelection) {
            cursorRow = this.editor.getSelectedBufferRange().end.row;
            isCursorBelowCodeBlock = cursorRow > bubbleRow;
            isCursorOnLastRow = cursorRow === lastRow;
            if (isCursorBelowCodeBlock) {
              this.editor.setCursorBufferPosition({
                row: cursorRow,
                column: 0
              });
            } else {
              if (isCodeBlockOnLastRow) {
                this.editor.moveToBottom();
                this.editor.insertNewline();
              } else {
                this.editor.moveDown();
              }
            }
          } else {
            cursorRow = this.editor.getCursorBufferPosition().row;
            isCursorBelowCodeBlock = cursorRow > bubbleRow;
            isCursorOnLastRow = cursorRow === lastRow;
            if (!isCursorBelowCodeBlock) {
              if (isCursorOnLastRow) {
                this.editor.moveToBottom();
                this.editor.insertNewline();
              } else {
                this.editor.moveDown();
              }
            }
          }
        }
        view = this.insertResultBubble(row);
        return KernelManager.execute(language, code, function(result) {
          view.spin(false);
          return view.addResult(result);
        });
      }
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
          console.log(event);
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
    run: function(andMoveDown, runAll, runAllAbove) {
      var editor, grammar, language;
      if (andMoveDown == null) {
        andMoveDown = false;
      }
      if (runAll == null) {
        runAll = false;
      }
      if (runAllAbove == null) {
        runAllAbove = false;
      }
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      language = grammar.name.toLowerCase();
      if ((language != null) && KernelManager.languageHasKernel(language)) {
        return this.startKernelIfNeeded(language, (function(_this) {
          return function(kernel) {
            var statusView;
            if ((_this.watchSidebar != null) && _this.watchSidebar.element.contains(document.activeElement)) {
              return _this.watchSidebar.run();
            } else {
              statusView = kernel.statusView;
              _this.setStatusBarElement(statusView.getElement());
              if (_this.watchSidebar == null) {
                _this.setWatchSidebar(kernel.watchSidebar);
              }
              return _this.createResultBubble(andMoveDown, runAll, runAllAbove);
            }
          };
        })(this));
      } else {
        return atom.notifications.addError("No kernel for language `" + language + "` found", {
          detail: "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it."
        });
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
    startKernelIfNeeded: function(language, onStarted) {
      var kernelInfo, runningKernel;
      runningKernel = KernelManager.getRunningKernelForLanguage(language);
      if (runningKernel == null) {
        if (KernelManager.languageHasKernel(language)) {
          kernelInfo = KernelManager.getKernelInfoForLanguage(language);
          return ConfigManager.writeConfigFile((function(_this) {
            return function(filepath, config) {
              var kernel;
              kernel = KernelManager.startKernel(kernelInfo, config, filepath);
              return typeof onStarted === "function" ? onStarted(kernel) : void 0;
            };
          })(this));
        } else {
          return console.error("No kernel for this language!");
        }
      } else {
        if (onStarted != null) {
          return onStarted(runningKernel);
        }
      }
    },
    findCodeBlock: function(runAll, runAllAbove) {
      var buffer, cursor, endRow, foldRange, foldable, indentLevel, row, selectedRange, selectedText;
      if (runAll == null) {
        runAll = false;
      }
      if (runAllAbove == null) {
        runAllAbove = false;
      }
      if (runAll) {
        return [this.editor.getText(), this.editor.getLastBufferRow()];
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
      var blank, buffer, isEnd, previousRow, sameIndent;
      buffer = this.editor.getBuffer();
      previousRow = row - 1;
      while (previousRow >= 0) {
        sameIndent = this.editor.indentationForBufferRow(previousRow) <= indentLevel;
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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTmhCLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBVGpCLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVh0QixDQUFBOztBQUFBLEVBWUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlCQUFSLENBWnZCLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFBUSxPQUFBLENBQVEsVUFBUixDQUFSO0FBQUEsSUFHQSxhQUFBLEVBQWUsSUFIZjtBQUFBLElBSUEsZ0JBQUEsRUFBa0IsSUFKbEI7QUFBQSxJQUtBLGFBQUEsRUFBZSxJQUxmO0FBQUEsSUFNQSxNQUFBLEVBQVEsSUFOUjtBQUFBLElB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
