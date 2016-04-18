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
            return _this.run();
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
      if (command.value === 'interrupt-kernel') {
        return KernelManager.interruptKernelForLanguage(command.language);
      } else if (command.value === 'restart-kernel') {
        KernelManager.destroyKernelForLanguage(command.language);
        this.clearResultBubbles();
        return this.startKernelIfNeeded(command.language);
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
    run: function() {
      var editor, grammar, language;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      language = grammar.name.toLowerCase();
      if ((language != null) && KernelManager.languageHasKernel(language)) {
        return this.startKernelIfNeeded(language, (function(_this) {
          return function(kernel) {
            var code, codeBlock, row, statusView, view;
            if ((_this.watchSidebar != null) && _this.watchSidebar.element.contains(document.activeElement)) {
              return _this.watchSidebar.run();
            } else {
              statusView = kernel.statusView;
              _this.setStatusBarElement(statusView.getElement());
              if (_this.watchSidebar == null) {
                _this.setWatchSidebar(kernel.watchSidebar);
              }
              codeBlock = _this.findCodeBlock();
              if (codeBlock != null) {
                code = codeBlock[0], row = codeBlock[1];
              }
              if (code != null) {
                _this.clearBubblesOnRow(row);
                view = _this.insertResultBubble(row);
                return KernelManager.execute(language, code, function(result) {
                  view.spin(false);
                  return view.addResult(result);
                });
              }
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
        while (this.blank(endRow)) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTmhCLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBVGpCLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVh0QixDQUFBOztBQUFBLEVBWUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlCQUFSLENBWnZCLENBQUE7O0FBQUEsRUFjQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFDSTtBQUFBLE1BQUEsZ0JBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsaVVBRGI7QUFBQSxRQVVBLElBQUEsRUFBTSxRQVZOO0FBQUEsUUFXQSxTQUFBLEVBQVMsSUFYVDtPQURKO0tB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
