(function() {
  var AutocompleteProvider, CompositeDisposable, Config, Hydrogen, Inspector, KernelManager, ResultView, SignalListView, WatchLanguagePicker, WatchSidebar, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

  Config = require('./config');

  KernelManager = require('./kernel-manager');

  ResultView = require('./result-view');

  SignalListView = require('./signal-list-view');

  WatchSidebar = require('./watch-sidebar');

  WatchLanguagePicker = require('./watch-language-picker');

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
          return KernelManager.updateKernelSpecs();
        },
        'hydrogen:inspect': function() {
          return Inspector.inspect();
        }
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
    handleKernelCommand: function(command) {
      var kernel, request;
      console.log("handleKernelCommand:", command);
      request = command.value;
      if (request === 'interrupt-kernel') {
        return KernelManager.destroyRunningKernel(command.kernel);
      } else if (request === 'restart-kernel') {
        KernelManager.destroyRunningKernel(command.kernel);
        this.clearResultBubbles();
        return KernelManager.startKernelFor(command.grammar);
      } else if (request === 'switch-kernel') {
        kernel = KernelManager.getRunningKernelFor(command.language);
        KernelManager.destroyRunningKernel(kernel);
        this.clearResultBubbles();
        return KernelManager.startKernel(command.kernelSpec, command.grammar);
      }
    },
    createResultBubble: function(code, row) {
      var grammar, grammarLanguage, kernel;
      grammar = this.editor.getGrammar();
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernel = KernelManager.getRunningKernelFor(grammarLanguage);
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
    showWatchLanguagePicker: function() {
      if (this.watchLanguagePicker == null) {
        this.watchLanguagePicker = new WatchLanguagePicker();
        this.watchLanguagePicker.onConfirmed = (function(_this) {
          return function(command) {
            return _this.setWatchSidebar(command.kernel.watchSidebar);
          };
        })(this);
      }
      return this.watchLanguagePicker.toggle();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUZKLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FMVCxDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQU9BLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVBiLENBQUE7O0FBQUEsRUFRQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUixDQVJqQixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQVRmLENBQUE7O0FBQUEsRUFVQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FWdEIsQ0FBQTs7QUFBQSxFQVdBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSx5QkFBUixDQVh2QixDQUFBOztBQUFBLEVBWUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBWlosQ0FBQTs7QUFBQSxFQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDYjtBQUFBLElBQUEsTUFBQSxFQUFRLE1BQU0sQ0FBQyxNQUFmO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsZ0JBQUEsRUFBa0IsSUFKbEI7QUFBQSxJQUtBLGFBQUEsRUFBZSxJQUxmO0FBQUEsSUFPQSxNQUFBLEVBQVEsSUFQUjtBQUFBLElBUUEsZUFBQSxFQUFpQixFQVJqQjtBQUFBLElBVUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
