(function() {
  var AutocompleteProvider, CompositeDisposable, Config, Hydrogen, Inspector, KernelManager, KernelPicker, ResultView, SignalListView, WatchSidebar, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

  Config = require('./config');

  KernelManager = require('./kernel-manager');

  ResultView = require('./result-view');

  SignalListView = require('./signal-list-view');

  WatchSidebar = require('./watch-sidebar');

  KernelPicker = require('./kernel-picker');

  AutocompleteProvider = require('./autocomplete-provider');

  Inspector = require('./inspector');

  module.exports = Hydrogen = {
    config: Config.schema,
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
        'hydrogen:toggle-watches': (function(_this) {
          return function() {
            return _this.toggleWatchSidebar();
          };
        })(this),
        'hydrogen:select-watch-kernel': (function(_this) {
          return function() {
            return _this.showWatchKernelPicker();
          };
        })(this),
        'hydrogen:select-kernel': (function(_this) {
          return function() {
            return _this.showKernelPicker();
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
          return KernelManager.updateKernelSpecs();
        },
        'hydrogen:inspect': function() {
          return Inspector.inspect();
        },
        'hydrogen:interrupt-kernel': (function(_this) {
          return function() {
            return _this.handleKernelCommand({
              command: 'interrupt-kernel'
            });
          };
        })(this),
        'hydrogen:restart-kernel': (function(_this) {
          return function() {
            return _this.handleKernelCommand({
              command: 'restart-kernel'
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'hydrogen:clear-results': (function(_this) {
          return function() {
            return _this.clearResultBubbles();
          };
        })(this),
        'hydrogen:toggle-inspector-size': function() {
          return Inspector.toggleInspectorSize();
        },
        'hydrogen:close-inspector': function() {
          return Inspector.closeInspector();
        }
      }));
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor.bind(this)));
      this.editor = atom.workspace.getActiveTextEditor();
      return KernelManager.updateKernelSpecs();
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
      this.statusBarElement.onclick = this.showKernelCommands.bind(this);
      return this.statusBarTile = statusBar.addLeftTile({
        item: this.statusBarElement,
        priority: 100
      });
    },
    provide: function() {
      if (atom.config.get("Hydrogen.autocomplete") === true) {
        return AutocompleteProvider;
      }
    },
    updateCurrentEditor: function(currentPaneItem) {
      var grammar, grammarLanguage, kernel, _base;
      if ((currentPaneItem == null) || currentPaneItem === this.editor) {
        return;
      }
      console.log("Updating current editor to:", currentPaneItem);
      this.editor = currentPaneItem;
      grammar = typeof (_base = this.editor).getGrammar === "function" ? _base.getGrammar() : void 0;
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      if (grammarLanguage != null) {
        kernel = KernelManager.getRunningKernelFor(grammarLanguage);
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
    handleKernelCommand: function(_arg) {
      var command, grammar, kernel, kernelSpec, language;
      kernel = _arg.kernel, command = _arg.command, grammar = _arg.grammar, language = _arg.language, kernelSpec = _arg.kernelSpec;
      if (!grammar) {
        grammar = this.editor.getGrammar();
      }
      if (!language) {
        language = KernelManager.getGrammarLanguageFor(grammar);
      }
      if (!kernel) {
        kernel = KernelManager.getRunningKernelFor(language);
      }
      console.log("handleKernelCommand:", command, grammar, language, kernel);
      if (kernel) {
        KernelManager.destroyRunningKernel(kernel);
      }
      this.clearResultBubbles();
      if (command === 'restart-kernel') {
        return KernelManager.startKernelFor(grammar);
      } else if (command === 'switch-kernel') {
        KernelManager.setKernelMapping(kernelSpec, this.editor.getGrammar());
        return KernelManager.startKernel(kernelSpec, grammar);
      }
    },
    getCurrentKernel: function() {
      var grammar, grammarLanguage, kernel;
      grammar = this.editor.getGrammar();
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernel = KernelManager.getRunningKernelFor(grammarLanguage);
      return {
        grammar: grammar,
        grammarLanguage: grammarLanguage,
        kernel: kernel
      };
    },
    createResultBubble: function(code, row) {
      var grammar, kernel, _ref;
      _ref = this.getCurrentKernel(), kernel = _ref.kernel, grammar = _ref.grammar;
      if (kernel) {
        this._createResultBubble(kernel, code, row);
        return;
      }
      return KernelManager.startKernelFor(grammar, (function(_this) {
        return function(kernel) {
          return _this._createResultBubble(kernel, code, row);
        };
      })(this));
    },
    _createResultBubble: function(kernel, code, row) {
      var view;
      if (this.watchSidebar == null) {
        this.setWatchSidebar(kernel.watchSidebar);
      } else if (this.watchSidebar.element.contains(document.activeElement)) {
        this.watchSidebar.run();
        return;
      }
      this.setStatusBarElement(kernel.statusView.getElement());
      this.clearBubblesOnRow(row);
      view = this.insertResultBubble(row);
      return kernel.execute(code, function(result) {
        view.spin(false);
        return view.addResult(result);
      });
    },
    insertResultBubble: function(row) {
      var buffer, element, lineHeight, lineLength, marker, view;
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
      view.spinner.setAttribute('style', "width: " + (lineHeight + 2) + "px; height: " + (lineHeight - 4) + "px;");
      view.statusContainer.setAttribute('style', "height: " + lineHeight + "px");
      element.setAttribute('style', "margin-left: " + (lineLength + 1) + "ch; margin-top: -" + lineHeight + "px");
      this.editor.decorateMarker(marker, {
        type: 'block',
        item: element,
        position: 'after'
      });
      this.markerBubbleMap[marker.id] = view;
      marker.onDidChange((function(_this) {
        return function(event) {
          console.log("Invoked onDidChange:", marker);
          if (!event.isValid) {
            view.destroy();
            marker.destroy();
            return delete _this.markerBubbleMap[marker.id];
          } else {
            if (!element.classList.contains('multiline')) {
              lineLength = marker.getStartBufferPosition()['column'];
              return element.setAttribute('style', "margin-left: " + (lineLength + 1) + "ch; margin-top: -" + lineHeight + "px");
            }
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
      var _ref;
      console.log("setting watch sidebar");
      if (this.watchSidebar !== sidebar && ((_ref = this.watchSidebar) != null ? _ref.visible : void 0)) {
        this.watchSidebar.hide();
        this.watchSidebar = sidebar;
        return this.watchSidebar.show();
      } else {
        return this.watchSidebar = sidebar;
      }
    },
    showKernelPicker: function() {
      if (this.kernelPicker == null) {
        this.kernelPicker = new KernelPicker((function(_this) {
          return function() {
            return KernelManager.getAllKernelSpecsFor(KernelManager.getGrammarLanguageFor(_this.editor.getGrammar()));
          };
        })(this));
        this.kernelPicker.onConfirmed = (function(_this) {
          return function(_arg) {
            var kernel;
            kernel = _arg.kernel;
            return _this.handleKernelCommand({
              command: 'switch-kernel',
              kernelSpec: kernel
            });
          };
        })(this);
      }
      return this.kernelPicker.toggle();
    },
    showWatchKernelPicker: function() {
      if (this.watchKernelPicker == null) {
        this.watchKernelPicker = new KernelPicker(KernelManager.getAllRunningKernels.bind(KernelManager));
        this.watchKernelPicker.onConfirmed = (function(_this) {
          return function(command) {
            return _this.setWatchSidebar(command.kernel.watchSidebar);
          };
        })(this);
      }
      return this.watchKernelPicker.toggle();
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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0pBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUZKLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FMVCxDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQU9BLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVBiLENBQUE7O0FBQUEsRUFRQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUixDQVJqQixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQVRmLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSx5QkFBUixDQVh2QixDQUFBOztBQUFBLEVBWUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBWlosQ0FBQTs7QUFBQSxFQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDYjtBQUFBLElBQUEsTUFBQSxFQUFRLE1BQU0sQ0FBQyxNQUFmO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsZ0JBQUEsRUFBa0IsSUFKbEI7QUFBQSxJQUtBLGFBQUEsRUFBZSxJQUxmO0FBQUEsSUFPQSxNQUFBLEVBQVEsSUFQUjtBQUFBLElBUUEsZUFBQSxFQUFpQixFQVJqQjtBQUFBLElBVUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
