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
    config: {
      languageMappings: {
        title: "Language Mappings",
        description: 'Some packages may change the name of the grammar for a language (e.g. "Python" -> "Python Django"). That leaves Hydrogen unable to figure out what kernel to use for your code. This field should be valid JSON mapping a nonstandard language name to a standard one, e.g. {"Python Django": "python", "Ruby (Rails)": "ruby"}',
        type: 'string',
        "default": '{}'
      },
      grammarToKernel: {
        description: 'JSON mappings between specific kernel and a language/grammar. This value is updated automatically by the "switch kernel" command. If you switch from python2 to python3, python3 will be used the next time you open a Python file. You probably shouldn\'t change this by hand.',
        type: 'string',
        "default": '{}'
      }
    },
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
            return _this.run(false);
          };
        })(this),
        'hydrogen:run-and-move-down': (function(_this) {
          return function() {
            return _this.run(true);
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
    createResultBubble: function(andMoveDown) {
      var bubbleRow, code, codeBlock, cursorRow, isCodeBlockOnLastRow, isCursorBelowCodeBlock, isCursorOnLastRow, isTextSelection, language, lastRow, row, view;
      if (andMoveDown == null) {
        andMoveDown = false;
      }
      language = this.editor.getGrammar().name.toLowerCase();
      codeBlock = this.findCodeBlock();
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
    run: function(andMoveDown) {
      var editor, grammar, language;
      if (andMoveDown == null) {
        andMoveDown = false;
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
              return _this.createResultBubble(andMoveDown);
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
    findCodeBlock: function() {
      var buffer, cursor, endRow, foldRange, foldable, indentLevel, row, selectedRange, selectedText;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTmhCLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBVGpCLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVh0QixDQUFBOztBQUFBLEVBWUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlCQUFSLENBWnZCLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFDSTtBQUFBLE1BQUEsZ0JBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsaVVBRGI7QUFBQSxRQVVBLElBQUEsRUFBTSxRQVZOO0FBQUEsUUFXQSxTQUFBLEVBQVMsSUFYVDtPQURKO0FB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
