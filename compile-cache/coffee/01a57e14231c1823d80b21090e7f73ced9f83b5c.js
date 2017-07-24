(function() {
  var AutocompleteProvider, CellManager, CompositeDisposable, Config, Hydrogen, Inspector, KernelManager, KernelPicker, ResultView, SignalListView, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

  ResultView = require('./result-view');

  SignalListView = require('./signal-list-view');

  KernelPicker = require('./kernel-picker');

  CellManager = require('./cell-manager');

  Config = require('./config');

  KernelManager = require('./kernel-manager');

  Inspector = require('./inspector');

  AutocompleteProvider = require('./autocomplete-provider');

  module.exports = Hydrogen = {
    config: Config.schema,
    subscriptions: null,
    kernelManager: null,
    inspector: null,
    editor: null,
    markerBubbleMap: null,
    statusBarElement: null,
    statusBarTile: null,
    activate: function(state) {
      this.kernelManager = new KernelManager();
      this.inspector = new Inspector(this.kernelManager);
      this.editor = atom.workspace.getActiveTextEditor();
      this.markerBubbleMap = {};
      this.statusBarElement = document.createElement('div');
      this.statusBarElement.classList.add('hydrogen');
      this.statusBarElement.classList.add('status-container');
      this.statusBarElement.onclick = this.showKernelCommands.bind(this);
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
            return _this.run(true);
          };
        })(this),
        'hydrogen:run-cell': (function(_this) {
          return function() {
            return _this.runCell();
          };
        })(this),
        'hydrogen:run-cell-and-move-down': (function(_this) {
          return function() {
            return _this.runCell(true);
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
        'hydrogen:update-kernels': (function(_this) {
          return function() {
            return _this.kernelManager.updateKernelSpecs();
          };
        })(this),
        'hydrogen:toggle-inspector': (function(_this) {
          return function() {
            return _this.inspector.toggle();
          };
        })(this),
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
        })(this)
      }));
      return this.subscriptions.add(atom.workspace.observeActivePaneItem((function(_this) {
        return function(item) {
          if (item && item === atom.workspace.getActiveTextEditor()) {
            _this.editor = item;
            return _this.setStatusBarElement();
          }
        };
      })(this)));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.kernelManager.destroy();
      return this.statusBarTile.destroy();
    },
    consumeStatusBar: function(statusBar) {
      return this.statusBarTile = statusBar.addLeftTile({
        item: this.statusBarElement,
        priority: 100
      });
    },
    provide: function() {
      if (atom.config.get('Hydrogen.autocomplete') === true) {
        return AutocompleteProvider(this.kernelManager);
      }
    },
    showKernelCommands: function() {
      if (this.signalListView == null) {
        this.signalListView = new SignalListView(this.kernelManager);
        this.signalListView.onConfirmed = (function(_this) {
          return function(kernelCommand) {
            return _this.handleKernelCommand(kernelCommand);
          };
        })(this);
      }
      return this.signalListView.toggle();
    },
    handleKernelCommand: function(_arg) {
      var command, grammar, kernel, kernelSpec, language;
      kernel = _arg.kernel, command = _arg.command, grammar = _arg.grammar, language = _arg.language, kernelSpec = _arg.kernelSpec;
      console.log('handleKernelCommand:', arguments);
      if (!grammar) {
        grammar = this.editor.getGrammar();
      }
      if (!language) {
        language = this.kernelManager.getLanguageFor(grammar);
      }
      if (!kernel) {
        kernel = this.kernelManager.getRunningKernelFor(language);
      }
      if (command === 'interrupt-kernel') {
        return kernel.interrupt();
      } else if (command === 'restart-kernel') {
        this.kernelManager.destroyRunningKernel(kernel);
        this.clearResultBubbles();
        return this.kernelManager.startKernelFor(grammar, (function(_this) {
          return function() {
            return _this.setStatusBarElement();
          };
        })(this));
      } else if (command === 'switch-kernel') {
        kernel = this.kernelManager.getRunningKernelFor(language);
        if (kernel) {
          this.kernelManager.destroyRunningKernel(kernel);
        }
        this.clearResultBubbles();
        this.kernelManager.setKernelMapping(kernelSpec, grammar);
        return this.kernelManager.startKernel(kernelSpec, grammar, (function(_this) {
          return function() {
            return _this.setStatusBarElement();
          };
        })(this));
      }
    },
    getCurrentKernel: function() {
      var grammar, kernel, language;
      grammar = this.editor.getGrammar();
      language = this.kernelManager.getLanguageFor(grammar);
      kernel = this.kernelManager.getRunningKernelFor(language);
      return {
        grammar: grammar,
        language: language,
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
      return this.kernelManager.startKernelFor(grammar, (function(_this) {
        return function(kernel) {
          _this.setStatusBarElement();
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
          console.log('marker.onDidChange:', marker);
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
    run: function(moveDown) {
      var code, codeBlock, row;
      if (moveDown == null) {
        moveDown = false;
      }
      codeBlock = this.findCodeBlock();
      if (codeBlock == null) {
        return;
      }
      code = codeBlock[0], row = codeBlock[1];
      if ((code != null) && (row != null)) {
        if (moveDown === true) {
          this.moveDown(row);
        }
        return this.createResultBubble(code, row);
      }
    },
    runAll: function() {
      var code, row;
      code = this.editor.getText();
      row = this.escapeBlankRows(0, this.editor.getLastBufferRow());
      return this.createResultBubble(code, row);
    },
    runAllAbove: function() {
      var code, cursor, row;
      cursor = this.editor.getLastCursor();
      row = this.escapeBlankRows(0, cursor.getBufferRow());
      code = this.getRows(0, row);
      if ((code != null) && (row != null)) {
        return this.createResultBubble(code, row);
      }
    },
    runCell: function(moveDown) {
      var code, endRow, startRow, _ref;
      if (moveDown == null) {
        moveDown = false;
      }
      _ref = CellManager.getCurrentCell(), startRow = _ref[0], endRow = _ref[1];
      endRow = this.escapeBlankRows(startRow, endRow);
      code = this.getRows(startRow, endRow);
      if (code != null) {
        if (moveDown === true) {
          this.moveDown(endRow);
        }
        return this.createResultBubble(code, endRow);
      }
    },
    escapeBlankRows: function(startRow, endRow) {
      var i, _i, _ref;
      if (endRow > startRow) {
        for (i = _i = startRow, _ref = endRow - 1; startRow <= _ref ? _i <= _ref : _i >= _ref; i = startRow <= _ref ? ++_i : --_i) {
          if (this.blank(endRow)) {
            endRow -= 1;
          }
        }
      }
      return endRow;
    },
    removeStatusBarElement: function() {
      var _results;
      if (this.statusBarElement == null) {
        console.error('removeStatusBarElement: there is no status bar');
        return;
      }
      _results = [];
      while (this.statusBarElement.hasChildNodes()) {
        _results.push(this.statusBarElement.removeChild(this.statusBarElement.lastChild));
      }
      return _results;
    },
    setStatusBarElement: function() {
      var kernel;
      if (this.statusBarElement == null) {
        console.error('setStatusBarElement: there is no status bar');
        return;
      }
      this.removeStatusBarElement();
      kernel = this.getCurrentKernel().kernel;
      if (kernel != null) {
        return this.statusBarElement.appendChild(kernel.statusView.getElement());
      }
    },
    hideWatchSidebar: function() {
      if (this.watchSidebar == null) {
        console.log('hideWatchSidebar: there is no sidebar');
        return;
      }
      return this.watchSidebar.hide();
    },
    showWatchSidebar: function() {
      if (this.watchSidebar == null) {
        console.log('showWatchSidebar: there is no sidebar');
        return;
      }
      return this.watchSidebar.show();
    },
    toggleWatchSidebar: function() {
      var _ref;
      if ((_ref = this.watchSidebar) != null ? _ref.visible : void 0) {
        console.log('toggleWatchSidebar: hiding sidebar');
        return this.watchSidebar.hide();
      } else {
        console.log('toggleWatchSidebar: showing sidebar');
        return this.watchSidebar.show();
      }
    },
    setWatchSidebar: function(sidebar) {
      var _ref;
      console.log('setting watch sidebar');
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
            var grammar, kernelSpecs, language;
            grammar = _this.editor.getGrammar();
            language = _this.kernelManager.getLanguageFor(grammar);
            kernelSpecs = _this.kernelManager.getAllKernelSpecsFor(language);
            return kernelSpecs;
          };
        })(this));
        this.kernelPicker.onConfirmed = (function(_this) {
          return function(_arg) {
            var kernelSpec;
            kernelSpec = _arg.kernelSpec;
            return _this.handleKernelCommand({
              command: 'switch-kernel',
              kernelSpec: kernelSpec
            });
          };
        })(this);
      }
      return this.kernelPicker.toggle();
    },
    showWatchKernelPicker: function() {
      if (this.watchKernelPicker == null) {
        this.watchKernelPicker = new KernelPicker((function(_this) {
          return function() {
            var kernelSpecs, kernels;
            kernels = _this.kernelManager.getAllRunningKernels();
            kernelSpecs = _.map(kernels, 'kernelSpec');
            return kernelSpecs;
          };
        })(this));
        this.watchKernelPicker.onConfirmed = (function(_this) {
          return function(command) {
            var kernel, kernelSpec, kernels;
            kernelSpec = command.kernelSpec;
            kernels = _.filter(_this.kernelManager.getAllRunningKernels(), function(k) {
              return k.kernelSpec === kernelSpec;
            });
            kernel = kernels[0];
            if (kernel) {
              _this.setWatchSidebar(kernel.watchSidebar);
              return _this.watchSidebar.show();
            }
          };
        })(this);
      }
      return this.watchKernelPicker.toggle();
    },
    findCodeBlock: function() {
      var buffer, cursor, endRow, foldRange, foldable, indentLevel, row, selectedRange, selectedText;
      buffer = this.editor.getBuffer();
      selectedText = this.editor.getSelectedText();
      if (selectedText) {
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
      console.log('findCodeBlock:', row);
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
      } else if (this.getRow(row).trim() === 'end') {
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
        isEnd = this.getRow(previousRow).trim() === 'end';
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
      console.log('getFoldRange:', range);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0lBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUZKLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FMakIsQ0FBQTs7QUFBQSxFQU1BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FOZixDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVBkLENBQUE7O0FBQUEsRUFTQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FUVCxDQUFBOztBQUFBLEVBVUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FWaEIsQ0FBQTs7QUFBQSxFQVdBLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUixDQVhaLENBQUE7O0FBQUEsRUFZQSxvQkFBQSxHQUF1QixPQUFBLENBQVEseUJBQVIsQ0FadkIsQ0FBQTs7QUFBQSxFQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDYjtBQUFBLElBQUEsTUFBQSxFQUFRLE1BQU0sQ0FBQyxNQUFmO0FBQUEsSUFDQSxhQUFBLEVBQWUsSUFEZjtBQUFBLElBR0EsYUFBQSxFQUFlLElBSGY7QUFBQSxJQUlBLFNBQUEsRUFBVyxJQUpYO0FBQUEsSUFNQSxNQUFBLEVBQVEsSUFOUjtBQUFBLElBT0EsZUFBQSxFQUFpQixJQVBqQjtBQUFBLElBU0EsZ0JBQUEsRUFBa0IsSUFUbEI7QUFBQSxJQVVBLGFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
