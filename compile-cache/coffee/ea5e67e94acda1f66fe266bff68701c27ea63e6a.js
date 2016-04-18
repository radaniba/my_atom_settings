(function() {
  var AutocompleteProvider, CompositeDisposable, Config, Hydrogen, Inspector, KernelManager, ResultView, SignalListView, WatchLanguagePicker, WatchSidebar, fs, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

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
          return KernelManager.updateKernels();
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
      if (atom.config.get("Hydrogen.autocomplete") === true) {
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
      var grammar, kernel, kernelInfo, language, mapping, request;
      console.log("handleKernelCommand:", command);
      request = command.value;
      language = command.language;
      grammar = command.grammar;
      kernelInfo = command.kernelInfo;
      kernel = KernelManager.getRunningKernelForLanguage(language);
      if (request === 'interrupt-kernel') {
        return kernel != null ? kernel.interrupt() : void 0;
      } else if (request === 'restart-kernel') {
        KernelManager.destroyRunningKernelForLanguage(language);
        this.clearResultBubbles();
        return KernelManager.startKernelIfNeeded(language);
      } else if (request === 'switch-kernel') {
        KernelManager.destroyRunningKernelForLanguage(language);
        this.clearResultBubbles();
        mapping = {};
        mapping[grammar] = kernelInfo.display_name;
        Config.setJson('grammarToKernel', mapping, true);
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
          return kernel.execute(code, function(result) {
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
        column: 0
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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBTlQsQ0FBQTs7QUFBQSxFQU9BLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBUGhCLENBQUE7O0FBQUEsRUFRQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FSYixDQUFBOztBQUFBLEVBU0EsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FUakIsQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FWZixDQUFBOztBQUFBLEVBV0EsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBWHRCLENBQUE7O0FBQUEsRUFZQSxvQkFBQSxHQUF1QixPQUFBLENBQVEseUJBQVIsQ0FadkIsQ0FBQTs7QUFBQSxFQWFBLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUixDQWJaLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFBUSxNQUFNLENBQUMsTUFBZjtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUlBLGdCQUFBLEVBQWtCLElBSmxCO0FBQUEsSUFLQSxhQUFBLEVBQWUsSUFMZjtBQUFBLElBT0EsTUFBQSxFQUFRLElBUFI7QUFBQSxJQVFBLGVBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
