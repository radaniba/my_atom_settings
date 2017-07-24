(function() {
  var AutocompleteProvider, CodeManager, CompositeDisposable, Config, Hydrogen, Inspector, KernelManager, KernelPicker, ResultView, SignalListView, WSKernelPicker, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

  ResultView = require('./result-view');

  SignalListView = require('./signal-list-view');

  KernelPicker = require('./kernel-picker');

  WSKernelPicker = require('./ws-kernel-picker');

  CodeManager = require('./code-manager');

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
    kernel: null,
    markerBubbleMap: null,
    statusBarElement: null,
    statusBarTile: null,
    watchSidebar: null,
    watchSidebarIsVisible: false,
    activate: function(state) {
      this.kernelManager = new KernelManager();
      this.inspector = new Inspector(this.kernelManager);
      this.codeManager = new CodeManager();
      this.markerBubbleMap = {};
      this.statusBarElement = document.createElement('div');
      this.statusBarElement.classList.add('hydrogen');
      this.statusBarElement.classList.add('status-container');
      this.statusBarElement.onclick = this.showKernelCommands.bind(this);
      this.onEditorChanged(atom.workspace.getActiveTextEditor());
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
        'hydrogen:select-kernel': (function(_this) {
          return function() {
            return _this.showKernelPicker();
          };
        })(this),
        'hydrogen:connect-to-remote-kernel': (function(_this) {
          return function() {
            return _this.showWSKernelPicker();
          };
        })(this),
        'hydrogen:add-watch': (function(_this) {
          return function() {
            var _ref;
            if (!_this.watchSidebarIsVisible) {
              _this.toggleWatchSidebar();
            }
            return (_ref = _this.watchSidebar) != null ? _ref.addWatchFromEditor() : void 0;
          };
        })(this),
        'hydrogen:remove-watch': (function(_this) {
          return function() {
            var _ref;
            if (!_this.watchSidebarIsVisible) {
              _this.toggleWatchSidebar();
            }
            return (_ref = _this.watchSidebar) != null ? _ref.removeWatch() : void 0;
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
        })(this),
        'hydrogen:shutdown-kernel': (function(_this) {
          return function() {
            return _this.handleKernelCommand({
              command: 'shutdown-kernel'
            });
          };
        })(this),
        'hydrogen:copy-path-to-connection-file': (function(_this) {
          return function() {
            return _this.copyPathToConnectionFile();
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
            return _this.onEditorChanged(item);
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
    onEditorChanged: function(editor) {
      var grammar, kernel, language;
      this.editor = editor;
      if (this.editor) {
        grammar = this.editor.getGrammar();
        language = this.kernelManager.getLanguageFor(grammar);
        kernel = this.kernelManager.getRunningKernelFor(language);
        this.codeManager.editor = this.editor;
      }
      if (this.kernel !== kernel) {
        return this.onKernelChanged(kernel);
      }
    },
    onKernelChanged: function(kernel) {
      this.kernel = kernel;
      this.setStatusBar();
      return this.setWatchSidebar(this.kernel);
    },
    setStatusBar: function() {
      if (this.statusBarElement == null) {
        console.error('setStatusBar: there is no status bar');
        return;
      }
      this.clearStatusBar();
      if (this.kernel != null) {
        return this.statusBarElement.appendChild(this.kernel.statusView.element);
      }
    },
    clearStatusBar: function() {
      var _results;
      if (this.statusBarElement == null) {
        console.error('clearStatusBar: there is no status bar');
        return;
      }
      _results = [];
      while (this.statusBarElement.hasChildNodes()) {
        _results.push(this.statusBarElement.removeChild(this.statusBarElement.lastChild));
      }
      return _results;
    },
    setWatchSidebar: function(kernel) {
      var sidebar, _ref, _ref1;
      console.log('setWatchSidebar:', kernel);
      sidebar = kernel != null ? kernel.watchSidebar : void 0;
      if (this.watchSidebar === sidebar) {
        return;
      }
      if ((_ref = this.watchSidebar) != null ? _ref.visible : void 0) {
        this.watchSidebar.hide();
      }
      this.watchSidebar = sidebar;
      if (this.watchSidebarIsVisible) {
        return (_ref1 = this.watchSidebar) != null ? _ref1.show() : void 0;
      }
    },
    toggleWatchSidebar: function() {
      var _ref, _ref1;
      if (this.watchSidebarIsVisible) {
        console.log('toggleWatchSidebar: hiding sidebar');
        this.watchSidebarIsVisible = false;
        return (_ref = this.watchSidebar) != null ? _ref.hide() : void 0;
      } else {
        console.log('toggleWatchSidebar: showing sidebar');
        this.watchSidebarIsVisible = true;
        return (_ref1 = this.watchSidebar) != null ? _ref1.show() : void 0;
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
      var command, grammar, kernel, kernelSpec, language, message;
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
      if (!kernel) {
        message = "No running kernel for language `" + language + "` found";
        atom.notifications.addError(message);
        return;
      }
      if (command === 'interrupt-kernel') {
        return kernel.interrupt();
      } else if (command === 'restart-kernel') {
        this.clearResultBubbles();
        return this.kernelManager.restartRunningKernelFor(grammar, (function(_this) {
          return function(kernel) {
            return _this.onKernelChanged(kernel);
          };
        })(this));
      } else if (command === 'shutdown-kernel') {
        this.clearResultBubbles();
        kernel.shutdown();
        this.kernelManager.destroyRunningKernelFor(grammar);
        return this.onKernelChanged();
      } else if (command === 'switch-kernel') {
        this.clearResultBubbles();
        this.kernelManager.destroyRunningKernelFor(grammar);
        return this.kernelManager.startKernel(kernelSpec, grammar, (function(_this) {
          return function(kernel) {
            return _this.onKernelChanged(kernel);
          };
        })(this));
      } else if (command === 'rename-kernel') {
        return typeof kernel.promptRename === "function" ? kernel.promptRename() : void 0;
      } else if (command === 'disconnect-kernel') {
        this.clearResultBubbles();
        this.kernelManager.destroyRunningKernelFor(grammar);
        return this.onKernelChanged();
      }
    },
    createResultBubble: function(code, row) {
      if (this.kernel) {
        this._createResultBubble(this.kernel, code, row);
        return;
      }
      return this.kernelManager.startKernelFor(this.editor.getGrammar(), (function(_this) {
        return function(kernel) {
          _this.onKernelChanged(kernel);
          return _this._createResultBubble(kernel, code, row);
        };
      })(this));
    },
    _createResultBubble: function(kernel, code, row) {
      var view;
      if (this.watchSidebar.element.contains(document.activeElement)) {
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
      element = view.element;
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
      console.log('clearBubblesOnRow:', row);
      return _.forEach(this.markerBubbleMap, (function(_this) {
        return function(bubble) {
          var marker, range;
          marker = bubble.marker;
          range = marker.getBufferRange();
          if ((range.start.row <= row && row <= range.end.row)) {
            console.log('clearBubblesOnRow:', row, bubble);
            bubble.destroy();
            return delete _this.markerBubbleMap[marker.id];
          }
        };
      })(this));
    },
    run: function(moveDown) {
      var code, codeBlock, row;
      if (moveDown == null) {
        moveDown = false;
      }
      codeBlock = this.codeManager.findCodeBlock();
      if (codeBlock == null) {
        return;
      }
      code = codeBlock[0], row = codeBlock[1];
      if ((code != null) && (row != null)) {
        if (moveDown === true) {
          this.codeManager.moveDown(row);
        }
        return this.createResultBubble(code, row);
      }
    },
    runAll: function() {
      if (this.kernel) {
        this._runAll(this.kernel);
        return;
      }
      return this.kernelManager.startKernelFor(this.editor.getGrammar(), (function(_this) {
        return function(kernel) {
          _this.onKernelChanged(kernel);
          return _this._runAll(kernel);
        };
      })(this));
    },
    _runAll: function(kernel) {
      var breakpoints, buffer, code, end, endRow, i, start, _i, _ref, _results;
      breakpoints = this.codeManager.getBreakpoints();
      buffer = this.editor.getBuffer();
      _results = [];
      for (i = _i = 1, _ref = breakpoints.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        start = breakpoints[i - 1];
        end = breakpoints[i];
        code = buffer.getTextInRange([start, end]);
        endRow = this.codeManager.escapeBlankRows(start.row, end.row);
        _results.push(this._createResultBubble(kernel, code, endRow));
      }
      return _results;
    },
    runAllAbove: function() {
      var code, cursor, row;
      cursor = this.editor.getLastCursor();
      row = this.codeManager.escapeBlankRows(0, cursor.getBufferRow());
      code = this.codeManager.getRows(0, row);
      if ((code != null) && (row != null)) {
        return this.createResultBubble(code, row);
      }
    },
    runCell: function(moveDown) {
      var buffer, code, end, endRow, start, _ref;
      if (moveDown == null) {
        moveDown = false;
      }
      _ref = this.codeManager.getCurrentCell(), start = _ref[0], end = _ref[1];
      buffer = this.editor.getBuffer();
      code = buffer.getTextInRange([start, end]);
      endRow = this.codeManager.escapeBlankRows(start.row, end.row);
      if (code != null) {
        if (moveDown === true) {
          this.codeManager.moveDown(endRow);
        }
        return this.createResultBubble(code, endRow);
      }
    },
    showKernelPicker: function() {
      if (this.kernelPicker == null) {
        this.kernelPicker = new KernelPicker((function(_this) {
          return function(callback) {
            var grammar, language;
            grammar = _this.editor.getGrammar();
            language = _this.kernelManager.getLanguageFor(grammar);
            return _this.kernelManager.getAllKernelSpecsFor(language, function(kernelSpecs) {
              return callback(kernelSpecs);
            });
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
    showWSKernelPicker: function() {
      var grammar, language;
      if (this.wsKernelPicker == null) {
        this.wsKernelPicker = new WSKernelPicker((function(_this) {
          return function(kernel) {
            var grammar;
            _this.clearResultBubbles();
            grammar = kernel.grammar;
            _this.kernelManager.destroyRunningKernelFor(grammar);
            _this.kernelManager.setRunningKernelFor(grammar, kernel);
            return _this.onKernelChanged(kernel);
          };
        })(this));
      }
      grammar = this.editor.getGrammar();
      language = this.kernelManager.getLanguageFor(grammar);
      return this.wsKernelPicker.toggle(grammar, (function(_this) {
        return function(kernelSpec) {
          return _this.kernelManager.kernelSpecProvidesLanguage(kernelSpec, language);
        };
      })(this));
    },
    copyPathToConnectionFile: function() {
      var connectionFile, description, grammar, language, message;
      grammar = this.editor.getGrammar();
      language = this.kernelManager.getLanguageFor(grammar);
      if (this.kernel == null) {
        message = "No running kernel for language `" + language + "` found";
        atom.notifications.addError(message);
        return;
      }
      connectionFile = this.kernel.connectionFile;
      if (connectionFile == null) {
        atom.notifications.addError("No connection file for " + this.kernel.kernelSpec.display_name + " kernel found");
        return;
      }
      atom.clipboard.write(connectionFile);
      message = 'Path to connection file copied to clipboard.';
      description = "Use `jupyter console --existing " + connectionFile + "` to connect to the running kernel.";
      return atom.notifications.addSuccess(message, {
        description: description
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsK0pBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUZKLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FMakIsQ0FBQTs7QUFBQSxFQU1BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FOZixDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FQakIsQ0FBQTs7QUFBQSxFQVFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FSZCxDQUFBOztBQUFBLEVBVUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBVlQsQ0FBQTs7QUFBQSxFQVdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBWGhCLENBQUE7O0FBQUEsRUFZQSxTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FaWixDQUFBOztBQUFBLEVBYUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlCQUFSLENBYnZCLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2I7QUFBQSxJQUFBLE1BQUEsRUFBUSxNQUFNLENBQUMsTUFBZjtBQUFBLElBQ0EsYUFBQSxFQUFlLElBRGY7QUFBQSxJQUdBLGFBQUEsRUFBZSxJQUhmO0FBQUEsSUFJQSxTQUFBLEVBQVcsSUFKWDtBQUFBLElBTUEsTUFBQSxFQUFRLElBTlI7QUFBQSxJQU9BLE1BQUEsRUFBUSxJQVBSO0FBQUEsSUFRQSxlQUFBLEVBQWlCLElBUmpCO0FBQUEsSUFVQSxnQkFBQSxFQUFrQixJQVZsQjtBQUFBLElBV0EsYUFBQSxFQUFlLElBWGY7QUFBQSxJQWFBLFlBQUEsRUFBYyxJQWJkO0FBQUEsSUFjQSxxQkFBQSxFQUF1QixLQWR2QjtBQUFBLElBZ0JBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQVUsSUFBQyxDQUFBLGFBQVgsQ0FEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQUEsQ0FGbkIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsRUFKbkIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBTnBCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBNUIsQ0FBZ0MsVUFBaEMsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQTVCLENBQWdDLGtCQUFoQyxDQVJBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxPQUFsQixHQUE0QixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FUNUIsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWpCLENBWEEsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQWJqQixDQUFBO0FBQUEsTUFlQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNmO0FBQUEsUUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxHQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO0FBQUEsUUFDQSxrQkFBQSxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURwQjtBQUFBLFFBRUEsd0JBQUEsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGMUI7QUFBQSxRQUdBLDRCQUFBLEVBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIOUI7QUFBQSxRQUlBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSnJCO0FBQUEsUUFLQSxpQ0FBQSxFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTG5DO0FBQUEsUUFNQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOM0I7QUFBQSxRQU9BLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVAxQjtBQUFBLFFBUUEsbUNBQUEsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGtCQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUnJDO0FBQUEsUUFTQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUNsQixnQkFBQSxJQUFBO0FBQUEsWUFBQSxJQUFBLENBQUEsS0FBUSxDQUFBLHFCQUFSO0FBQ0ksY0FBQSxLQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFBLENBREo7YUFBQTs2REFFYSxDQUFFLGtCQUFmLENBQUEsV0FIa0I7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVR0QjtBQUFBLFFBYUEsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDckIsZ0JBQUEsSUFBQTtBQUFBLFlBQUEsSUFBQSxDQUFBLEtBQVEsQ0FBQSxxQkFBUjtBQUNJLGNBQUEsS0FBQyxDQUFBLGtCQUFELENBQUEsQ0FBQSxDQURKO2FBQUE7NkRBRWEsQ0FBRSxXQUFmLENBQUEsV0FIcUI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWJ6QjtBQUFBLFFBaUJBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxhQUFhLENBQUMsaUJBQWYsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FqQjNCO0FBQUEsUUFrQkEsMkJBQUEsRUFBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBbEI3QjtBQUFBLFFBbUJBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUN6QixLQUFDLENBQUEsbUJBQUQsQ0FBcUI7QUFBQSxjQUFBLE9BQUEsRUFBUyxrQkFBVDthQUFyQixFQUR5QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBbkI3QjtBQUFBLFFBcUJBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUN2QixLQUFDLENBQUEsbUJBQUQsQ0FBcUI7QUFBQSxjQUFBLE9BQUEsRUFBUyxnQkFBVDthQUFyQixFQUR1QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBckIzQjtBQUFBLFFBdUJBLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUN4QixLQUFDLENBQUEsbUJBQUQsQ0FBcUI7QUFBQSxjQUFBLE9BQUEsRUFBUyxpQkFBVDthQUFyQixFQUR3QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBdkI1QjtBQUFBLFFBeUJBLHVDQUFBLEVBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUNyQyxLQUFDLENBQUEsd0JBQUQsQ0FBQSxFQURxQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBekJ6QztPQURlLENBQW5CLENBZkEsQ0FBQTtBQUFBLE1BNENBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2Y7QUFBQSxRQUFBLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxrQkFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtPQURlLENBQW5CLENBNUNBLENBQUE7YUErQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQWYsQ0FBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ3BELFVBQUEsSUFBRyxJQUFBLElBQVMsSUFBQSxLQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFwQjttQkFDSSxLQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQURKO1dBRG9EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckMsQ0FBbkIsRUFoRE07SUFBQSxDQWhCVjtBQUFBLElBcUVBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFIUTtJQUFBLENBckVaO0FBQUEsSUEyRUEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7YUFDZCxJQUFDLENBQUEsYUFBRCxHQUFpQixTQUFTLENBQUMsV0FBVixDQUNiO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLGdCQUFQO0FBQUEsUUFBeUIsUUFBQSxFQUFVLEdBQW5DO09BRGEsRUFESDtJQUFBLENBM0VsQjtBQUFBLElBZ0ZBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFBLEtBQTRDLElBQS9DO0FBQ0ksZUFBTyxvQkFBQSxDQUFxQixJQUFDLENBQUEsYUFBdEIsQ0FBUCxDQURKO09BREs7SUFBQSxDQWhGVDtBQUFBLElBcUZBLGVBQUEsRUFBaUIsU0FBRSxNQUFGLEdBQUE7QUFDYixVQUFBLHlCQUFBO0FBQUEsTUFEYyxJQUFDLENBQUEsU0FBQSxNQUNmLENBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFDSSxRQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFWLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLGNBQWYsQ0FBOEIsT0FBOUIsQ0FEWCxDQUFBO0FBQUEsUUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxtQkFBZixDQUFtQyxRQUFuQyxDQUZULENBQUE7QUFBQSxRQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixHQUFzQixJQUFDLENBQUEsTUFIdkIsQ0FESjtPQUFBO0FBTUEsTUFBQSxJQUFPLElBQUMsQ0FBQSxNQUFELEtBQVcsTUFBbEI7ZUFDSSxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQURKO09BUGE7SUFBQSxDQXJGakI7QUFBQSxJQWdHQSxlQUFBLEVBQWlCLFNBQUUsTUFBRixHQUFBO0FBQ2IsTUFEYyxJQUFDLENBQUEsU0FBQSxNQUNmLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLE1BQWxCLEVBRmE7SUFBQSxDQWhHakI7QUFBQSxJQXFHQSxZQUFBLEVBQWMsU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFPLDZCQUFQO0FBQ0ksUUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHNDQUFkLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGSjtPQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBSkEsQ0FBQTtBQU1BLE1BQUEsSUFBRyxtQkFBSDtlQUNJLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxXQUFsQixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFqRCxFQURKO09BUFU7SUFBQSxDQXJHZDtBQUFBLElBZ0hBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ1osVUFBQSxRQUFBO0FBQUEsTUFBQSxJQUFPLDZCQUFQO0FBQ0ksUUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHdDQUFkLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGSjtPQUFBO0FBSUE7YUFBTSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsYUFBbEIsQ0FBQSxDQUFOLEdBQUE7QUFDSSxzQkFBQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsV0FBbEIsQ0FBOEIsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFNBQWhELEVBQUEsQ0FESjtNQUFBLENBQUE7c0JBTFk7SUFBQSxDQWhIaEI7QUFBQSxJQXlIQSxlQUFBLEVBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2IsVUFBQSxvQkFBQTtBQUFBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxrQkFBWixFQUFnQyxNQUFoQyxDQUFBLENBQUE7QUFBQSxNQUVBLE9BQUEsb0JBQVUsTUFBTSxDQUFFLHFCQUZsQixDQUFBO0FBR0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFELEtBQWlCLE9BQXBCO0FBQ0ksY0FBQSxDQURKO09BSEE7QUFNQSxNQUFBLDZDQUFnQixDQUFFLGdCQUFsQjtBQUNJLFFBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQUEsQ0FBQSxDQURKO09BTkE7QUFBQSxNQVNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLE9BVGhCLENBQUE7QUFXQSxNQUFBLElBQUcsSUFBQyxDQUFBLHFCQUFKOzBEQUNpQixDQUFFLElBQWYsQ0FBQSxXQURKO09BWmE7SUFBQSxDQXpIakI7QUFBQSxJQXlJQSxrQkFBQSxFQUFvQixTQUFBLEdBQUE7QUFDaEIsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxxQkFBSjtBQUNJLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQ0FBWixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixLQUR6QixDQUFBO3dEQUVhLENBQUUsSUFBZixDQUFBLFdBSEo7T0FBQSxNQUFBO0FBS0ksUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHFDQUFaLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLHFCQUFELEdBQXlCLElBRHpCLENBQUE7MERBRWEsQ0FBRSxJQUFmLENBQUEsV0FQSjtPQURnQjtJQUFBLENBeklwQjtBQUFBLElBb0pBLGtCQUFBLEVBQW9CLFNBQUEsR0FBQTtBQUNoQixNQUFBLElBQU8sMkJBQVA7QUFDSSxRQUFBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxhQUFoQixDQUF0QixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLFdBQWhCLEdBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxhQUFELEdBQUE7bUJBQzFCLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixhQUFyQixFQUQwQjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRDlCLENBREo7T0FBQTthQUlBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBQSxFQUxnQjtJQUFBLENBcEpwQjtBQUFBLElBNEpBLG1CQUFBLEVBQXFCLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLFVBQUEsdURBQUE7QUFBQSxNQURtQixjQUFBLFFBQVEsZUFBQSxTQUFTLGVBQUEsU0FBUyxnQkFBQSxVQUFVLGtCQUFBLFVBQ3ZELENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVosRUFBb0MsU0FBcEMsQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsT0FBQTtBQUNJLFFBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQVYsQ0FESjtPQUZBO0FBSUEsTUFBQSxJQUFBLENBQUEsUUFBQTtBQUNJLFFBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUE4QixPQUE5QixDQUFYLENBREo7T0FKQTtBQU1BLE1BQUEsSUFBQSxDQUFBLE1BQUE7QUFDSSxRQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBYSxDQUFDLG1CQUFmLENBQW1DLFFBQW5DLENBQVQsQ0FESjtPQU5BO0FBU0EsTUFBQSxJQUFBLENBQUEsTUFBQTtBQUNJLFFBQUEsT0FBQSxHQUFXLGtDQUFBLEdBQWtDLFFBQWxDLEdBQTJDLFNBQXRELENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsT0FBNUIsQ0FEQSxDQUFBO0FBRUEsY0FBQSxDQUhKO09BVEE7QUFjQSxNQUFBLElBQUcsT0FBQSxLQUFXLGtCQUFkO2VBQ0ksTUFBTSxDQUFDLFNBQVAsQ0FBQSxFQURKO09BQUEsTUFHSyxJQUFHLE9BQUEsS0FBVyxnQkFBZDtBQUNELFFBQUEsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUF1QyxPQUF2QyxFQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsTUFBRCxHQUFBO21CQUM1QyxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQUQ0QztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBRkM7T0FBQSxNQUtBLElBQUcsT0FBQSxLQUFXLGlCQUFkO0FBQ0QsUUFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUVBLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FGQSxDQUFBO0FBQUEsUUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQXVDLE9BQXZDLENBSEEsQ0FBQTtlQUlBLElBQUMsQ0FBQSxlQUFELENBQUEsRUFMQztPQUFBLE1BT0EsSUFBRyxPQUFBLEtBQVcsZUFBZDtBQUNELFFBQUEsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQXVDLE9BQXZDLENBREEsQ0FBQTtlQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsV0FBZixDQUEyQixVQUEzQixFQUF1QyxPQUF2QyxFQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsTUFBRCxHQUFBO21CQUM1QyxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQUQ0QztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBSEM7T0FBQSxNQU1BLElBQUcsT0FBQSxLQUFXLGVBQWQ7MkRBQ0QsTUFBTSxDQUFDLHdCQUROO09BQUEsTUFHQSxJQUFHLE9BQUEsS0FBVyxtQkFBZDtBQUNELFFBQUEsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQXVDLE9BQXZDLENBREEsQ0FBQTtlQUVBLElBQUMsQ0FBQSxlQUFELENBQUEsRUFIQztPQXZDWTtJQUFBLENBNUpyQjtBQUFBLElBeU1BLGtCQUFBLEVBQW9CLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtBQUNoQixNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFDSSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixJQUFDLENBQUEsTUFBdEIsRUFBOEIsSUFBOUIsRUFBb0MsR0FBcEMsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZKO09BQUE7YUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLGNBQWYsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBOUIsRUFBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2hELFVBQUEsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxHQUFuQyxFQUZnRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELEVBTGdCO0lBQUEsQ0F6TXBCO0FBQUEsSUFtTkEsbUJBQUEsRUFBcUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEdBQWYsR0FBQTtBQUNqQixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBdEIsQ0FBK0IsUUFBUSxDQUFDLGFBQXhDLENBQUg7QUFDSSxRQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGSjtPQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsR0FBbkIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGtCQUFELENBQW9CLEdBQXBCLENBTFAsQ0FBQTthQU1BLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixTQUFDLE1BQUQsR0FBQTtBQUNqQixRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixDQUFBLENBQUE7ZUFDQSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsRUFGaUI7TUFBQSxDQUFyQixFQVBpQjtJQUFBLENBbk5yQjtBQUFBLElBK05BLGtCQUFBLEVBQW9CLFNBQUMsR0FBRCxHQUFBO0FBQ2hCLFVBQUEscURBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsR0FBeEIsQ0FEYixDQUFBO0FBQUEsTUFHQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUNMO0FBQUEsUUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLFFBQ0EsTUFBQSxFQUFRLFVBRFI7T0FESyxFQUlMO0FBQUEsUUFBQSxVQUFBLEVBQVksT0FBWjtPQUpLLENBSFQsQ0FBQTtBQUFBLE1BU0EsSUFBQSxHQUFXLElBQUEsVUFBQSxDQUFXLE1BQVgsQ0FUWCxDQUFBO0FBQUEsTUFVQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FWQSxDQUFBO0FBQUEsTUFXQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BWGYsQ0FBQTtBQUFBLE1BYUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQSxDQWJiLENBQUE7QUFBQSxNQWNBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBYixDQUEwQixPQUExQixFQUNTLFNBQUEsR0FBUSxDQUFDLFVBQUEsR0FBYSxDQUFkLENBQVIsR0FBd0IsY0FBeEIsR0FBcUMsQ0FBQyxVQUFBLEdBQWEsQ0FBZCxDQUFyQyxHQUFxRCxLQUQ5RCxDQWRBLENBQUE7QUFBQSxNQWdCQSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQXJCLENBQWtDLE9BQWxDLEVBQTRDLFVBQUEsR0FBVSxVQUFWLEdBQXFCLElBQWpFLENBaEJBLENBQUE7QUFBQSxNQWlCQSxPQUFPLENBQUMsWUFBUixDQUFxQixPQUFyQixFQUNTLGVBQUEsR0FBYyxDQUFDLFVBQUEsR0FBYSxDQUFkLENBQWQsR0FBOEIsbUJBQTlCLEdBQ2MsVUFEZCxHQUN5QixJQUZsQyxDQWpCQSxDQUFBO0FBQUEsTUFxQkEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLE1BQXZCLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxJQUFBLEVBQU0sT0FETjtBQUFBLFFBRUEsUUFBQSxFQUFVLE9BRlY7T0FESixDQXJCQSxDQUFBO0FBQUEsTUEwQkEsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBakIsR0FBOEIsSUExQjlCLENBQUE7QUFBQSxNQTJCQSxNQUFNLENBQUMsV0FBUCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7QUFDZixVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVosRUFBbUMsTUFBbkMsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLE9BQWI7QUFDSSxZQUFBLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFNLENBQUMsT0FBUCxDQUFBLENBREEsQ0FBQTttQkFFQSxNQUFBLENBQUEsS0FBUSxDQUFBLGVBQWdCLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFINUI7V0FBQSxNQUFBO0FBS0ksWUFBQSxJQUFHLENBQUEsT0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFsQixDQUEyQixXQUEzQixDQUFQO0FBQ0ksY0FBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLHNCQUFQLENBQUEsQ0FBZ0MsQ0FBQSxRQUFBLENBQTdDLENBQUE7cUJBQ0EsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsT0FBckIsRUFDUyxlQUFBLEdBQWMsQ0FBQyxVQUFBLEdBQWEsQ0FBZCxDQUFkLEdBQThCLG1CQUE5QixHQUNjLFVBRGQsR0FDeUIsSUFGbEMsRUFGSjthQUxKO1dBRmU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQTNCQSxDQUFBO0FBd0NBLGFBQU8sSUFBUCxDQXpDZ0I7SUFBQSxDQS9OcEI7QUFBQSxJQTJRQSxrQkFBQSxFQUFvQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxDQUFDLENBQUMsT0FBRixDQUFVLElBQUMsQ0FBQSxlQUFYLEVBQTRCLFNBQUMsTUFBRCxHQUFBO2VBQVksTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUFaO01BQUEsQ0FBNUIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsR0FGSDtJQUFBLENBM1FwQjtBQUFBLElBZ1JBLGlCQUFBLEVBQW1CLFNBQUMsR0FBRCxHQUFBO0FBQ2YsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDLEdBQWxDLENBQUEsQ0FBQTthQUNBLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLGVBQVgsRUFBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3hCLGNBQUEsYUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFoQixDQUFBO0FBQUEsVUFDQSxLQUFBLEdBQVEsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQURSLENBQUE7QUFFQSxVQUFBLElBQUcsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQVosSUFBbUIsR0FBbkIsSUFBbUIsR0FBbkIsSUFBMEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFwQyxDQUFIO0FBQ0ksWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDLEdBQWxDLEVBQXVDLE1BQXZDLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQURBLENBQUE7bUJBRUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSxlQUFnQixDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBSDVCO1dBSHdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsRUFGZTtJQUFBLENBaFJuQjtBQUFBLElBMlJBLEdBQUEsRUFBSyxTQUFDLFFBQUQsR0FBQTtBQUNELFVBQUEsb0JBQUE7O1FBREUsV0FBVztPQUNiO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUFPLGlCQUFQO0FBQ0ksY0FBQSxDQURKO09BREE7QUFBQSxNQUlDLG1CQUFELEVBQU8sa0JBSlAsQ0FBQTtBQUtBLE1BQUEsSUFBRyxjQUFBLElBQVUsYUFBYjtBQUNJLFFBQUEsSUFBRyxRQUFBLEtBQVksSUFBZjtBQUNJLFVBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQXNCLEdBQXRCLENBQUEsQ0FESjtTQUFBO2VBRUEsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLEdBQTFCLEVBSEo7T0FOQztJQUFBLENBM1JMO0FBQUEsSUF1U0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBSjtBQUNJLFFBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsTUFBVixDQUFBLENBQUE7QUFDQSxjQUFBLENBRko7T0FBQTthQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUE5QixFQUFvRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDaEQsVUFBQSxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxNQUFULEVBRmdEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEQsRUFMSTtJQUFBLENBdlNSO0FBQUEsSUFpVEEsT0FBQSxFQUFTLFNBQUMsTUFBRCxHQUFBO0FBQ0wsVUFBQSxvRUFBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBRFQsQ0FBQTtBQUVBO1dBQVMscUdBQVQsR0FBQTtBQUNJLFFBQUEsS0FBQSxHQUFRLFdBQVksQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFwQixDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sV0FBWSxDQUFBLENBQUEsQ0FEbEIsQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEIsQ0FGUCxDQUFBO0FBQUEsUUFHQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQUssQ0FBQyxHQUFuQyxFQUF3QyxHQUFHLENBQUMsR0FBNUMsQ0FIVCxDQUFBO0FBQUEsc0JBSUEsSUFBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCLEVBQTZCLElBQTdCLEVBQW1DLE1BQW5DLEVBSkEsQ0FESjtBQUFBO3NCQUhLO0lBQUEsQ0FqVFQ7QUFBQSxJQTRUQSxXQUFBLEVBQWEsU0FBQSxHQUFBO0FBQ1QsVUFBQSxpQkFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixDQUE3QixFQUFnQyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQWhDLENBRE4sQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixDQUFyQixFQUF3QixHQUF4QixDQUZQLENBQUE7QUFJQSxNQUFBLElBQUcsY0FBQSxJQUFVLGFBQWI7ZUFDSSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsR0FBMUIsRUFESjtPQUxTO0lBQUEsQ0E1VGI7QUFBQSxJQXFVQSxPQUFBLEVBQVMsU0FBQyxRQUFELEdBQUE7QUFDTCxVQUFBLHNDQUFBOztRQURNLFdBQVc7T0FDakI7QUFBQSxNQUFBLE9BQWUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBZixFQUFDLGVBQUQsRUFBUSxhQUFSLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQURULENBQUE7QUFBQSxNQUVBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXRCLENBRlAsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUFLLENBQUMsR0FBbkMsRUFBd0MsR0FBRyxDQUFDLEdBQTVDLENBSFQsQ0FBQTtBQUtBLE1BQUEsSUFBRyxZQUFIO0FBQ0ksUUFBQSxJQUFHLFFBQUEsS0FBWSxJQUFmO0FBQ0ksVUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBc0IsTUFBdEIsQ0FBQSxDQURKO1NBQUE7ZUFFQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsTUFBMUIsRUFISjtPQU5LO0lBQUEsQ0FyVVQ7QUFBQSxJQWlWQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7QUFDZCxNQUFBLElBQU8seUJBQVA7QUFDSSxRQUFBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsWUFBQSxDQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxRQUFELEdBQUE7QUFDN0IsZ0JBQUEsaUJBQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFWLENBQUE7QUFBQSxZQUNBLFFBQUEsR0FBVyxLQUFDLENBQUEsYUFBYSxDQUFDLGNBQWYsQ0FBOEIsT0FBOUIsQ0FEWCxDQUFBO21CQUVBLEtBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsUUFBcEMsRUFBOEMsU0FBQyxXQUFELEdBQUE7cUJBQzFDLFFBQUEsQ0FBUyxXQUFULEVBRDBDO1lBQUEsQ0FBOUMsRUFINkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQXBCLENBQUE7QUFBQSxRQUtBLElBQUMsQ0FBQSxZQUFZLENBQUMsV0FBZCxHQUE0QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ3hCLGdCQUFBLFVBQUE7QUFBQSxZQUQwQixhQUFELEtBQUMsVUFDMUIsQ0FBQTttQkFBQSxLQUFDLENBQUEsbUJBQUQsQ0FDSTtBQUFBLGNBQUEsT0FBQSxFQUFTLGVBQVQ7QUFBQSxjQUNBLFVBQUEsRUFBWSxVQURaO2FBREosRUFEd0I7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUw1QixDQURKO09BQUE7YUFVQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBQSxFQVhjO0lBQUEsQ0FqVmxCO0FBQUEsSUErVkEsa0JBQUEsRUFBb0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsaUJBQUE7QUFBQSxNQUFBLElBQU8sMkJBQVA7QUFDSSxRQUFBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsY0FBQSxDQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxNQUFELEdBQUE7QUFDakMsZ0JBQUEsT0FBQTtBQUFBLFlBQUEsS0FBQyxDQUFBLGtCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsWUFFQSxPQUFBLEdBQVUsTUFBTSxDQUFDLE9BRmpCLENBQUE7QUFBQSxZQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsT0FBdkMsQ0FIQSxDQUFBO0FBQUEsWUFLQSxLQUFDLENBQUEsYUFBYSxDQUFDLG1CQUFmLENBQW1DLE9BQW5DLEVBQTRDLE1BQTVDLENBTEEsQ0FBQTttQkFNQSxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQVBpQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsQ0FBdEIsQ0FESjtPQUFBO0FBQUEsTUFVQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FWVixDQUFBO0FBQUEsTUFXQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLE9BQTlCLENBWFgsQ0FBQTthQWFBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsT0FBdkIsRUFBZ0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsVUFBRCxHQUFBO2lCQUM1QixLQUFDLENBQUEsYUFBYSxDQUFDLDBCQUFmLENBQTBDLFVBQTFDLEVBQXNELFFBQXRELEVBRDRCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEMsRUFkZ0I7SUFBQSxDQS9WcEI7QUFBQSxJQWlYQSx3QkFBQSxFQUEwQixTQUFBLEdBQUE7QUFDdEIsVUFBQSx1REFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUE4QixPQUE5QixDQURYLENBQUE7QUFHQSxNQUFBLElBQU8sbUJBQVA7QUFDSSxRQUFBLE9BQUEsR0FBVyxrQ0FBQSxHQUFrQyxRQUFsQyxHQUEyQyxTQUF0RCxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLE9BQTVCLENBREEsQ0FBQTtBQUVBLGNBQUEsQ0FISjtPQUhBO0FBQUEsTUFRQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FSekIsQ0FBQTtBQVNBLE1BQUEsSUFBTyxzQkFBUDtBQUNJLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE2Qix5QkFBQSxHQUN2QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQURJLEdBQ1MsZUFEdEMsQ0FBQSxDQUFBO0FBRUEsY0FBQSxDQUhKO09BVEE7QUFBQSxNQWNBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixjQUFyQixDQWRBLENBQUE7QUFBQSxNQWVBLE9BQUEsR0FBVSw4Q0FmVixDQUFBO0FBQUEsTUFnQkEsV0FBQSxHQUFlLGtDQUFBLEdBQWtDLGNBQWxDLEdBQWlELHFDQWhCaEUsQ0FBQTthQWtCQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLE9BQTlCLEVBQXVDO0FBQUEsUUFBQSxXQUFBLEVBQWEsV0FBYjtPQUF2QyxFQW5Cc0I7SUFBQSxDQWpYMUI7R0FoQkosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/main.coffee
