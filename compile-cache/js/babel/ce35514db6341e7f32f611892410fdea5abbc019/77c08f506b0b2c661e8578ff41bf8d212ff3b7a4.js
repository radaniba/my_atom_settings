Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _resultView = require('./result-view');

var _resultView2 = _interopRequireDefault(_resultView);

var _signalListView = require('./signal-list-view');

var _signalListView2 = _interopRequireDefault(_signalListView);

var _kernelPicker = require('./kernel-picker');

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _wsKernelPicker = require('./ws-kernel-picker');

var _wsKernelPicker2 = _interopRequireDefault(_wsKernelPicker);

var _codeManager = require('./code-manager');

var _codeManager2 = _interopRequireDefault(_codeManager);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _kernelManager = require('./kernel-manager');

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _inspector = require('./inspector');

var _inspector2 = _interopRequireDefault(_inspector);

var _autocompleteProvider = require('./autocomplete-provider');

var _autocompleteProvider2 = _interopRequireDefault(_autocompleteProvider);

var _pluginApiHydrogenProvider = require('./plugin-api/hydrogen-provider');

var _pluginApiHydrogenProvider2 = _interopRequireDefault(_pluginApiHydrogenProvider);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var Hydrogen = {
  config: _config2['default'].schema,
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

  activate: function activate() {
    var _this = this;

    this.emitter = new _atom.Emitter();
    this.kernelManager = new _kernelManager2['default']();
    this.codeManager = new _codeManager2['default']();
    this.inspector = new _inspector2['default'](this.kernelManager, this.codeManager);

    this.markerBubbleMap = {};

    this.statusBarElement = document.createElement('div');
    this.statusBarElement.classList.add('hydrogen-status', 'inline-block');
    this.statusBarElement.onclick = this.showKernelCommands.bind(this);

    this.onEditorChanged(atom.workspace.getActiveTextEditor());

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'hydrogen:run': function hydrogenRun() {
        return _this.run();
      },
      'hydrogen:run-all': function hydrogenRunAll() {
        return _this.runAll();
      },
      'hydrogen:run-all-above': function hydrogenRunAllAbove() {
        return _this.runAllAbove();
      },
      'hydrogen:run-and-move-down': function hydrogenRunAndMoveDown() {
        return _this.run(true);
      },
      'hydrogen:run-cell': function hydrogenRunCell() {
        return _this.runCell();
      },
      'hydrogen:run-cell-and-move-down': function hydrogenRunCellAndMoveDown() {
        return _this.runCell(true);
      },
      'hydrogen:toggle-watches': function hydrogenToggleWatches() {
        return _this.toggleWatchSidebar();
      },
      'hydrogen:select-kernel': function hydrogenSelectKernel() {
        return _this.showKernelPicker();
      },
      'hydrogen:connect-to-remote-kernel': function hydrogenConnectToRemoteKernel() {
        return _this.showWSKernelPicker();
      },
      'hydrogen:add-watch': function hydrogenAddWatch() {
        if (!_this.watchSidebarIsVisible) _this.toggleWatchSidebar();
        if (_this.watchSidebar) _this.watchSidebar.addWatchFromEditor();
      },
      'hydrogen:remove-watch': function hydrogenRemoveWatch() {
        if (!_this.watchSidebarIsVisible) _this.toggleWatchSidebar();
        if (_this.watchSidebar) _this.watchSidebar.removeWatch();
      },
      'hydrogen:update-kernels': function hydrogenUpdateKernels() {
        return _this.kernelManager.updateKernelSpecs();
      },
      'hydrogen:toggle-inspector': function hydrogenToggleInspector() {
        return _this.inspector.toggle();
      },
      'hydrogen:interrupt-kernel': function hydrogenInterruptKernel() {
        return _this.handleKernelCommand({ command: 'interrupt-kernel' });
      },
      'hydrogen:restart-kernel': function hydrogenRestartKernel() {
        return _this.handleKernelCommand({ command: 'restart-kernel' });
      },
      'hydrogen:shutdown-kernel': function hydrogenShutdownKernel() {
        return _this.handleKernelCommand({ command: 'shutdown-kernel' });
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hydrogen:clear-results': function hydrogenClearResults() {
        return _this.clearResultBubbles();
      } }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (item) {
      if (item && item === atom.workspace.getActiveTextEditor()) {
        _this.onEditorChanged(item);
      }
    }));

    this.hydrogenProvider = null;
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.kernelManager.destroy();
    this.statusBarTile.destroy();
  },

  provideHydrogen: function provideHydrogen() {
    if (!this.hydrogenProvider) {
      this.hydrogenProvider = new _pluginApiHydrogenProvider2['default'](this);
    }

    return this.hydrogenProvider;
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addLeftTile({
      item: this.statusBarElement,
      priority: 100
    });
  },

  provide: function provide() {
    if (atom.config.get('Hydrogen.autocomplete') === true) {
      return (0, _autocompleteProvider2['default'])(this.kernelManager);
    }
    return null;
  },

  onEditorChanged: function onEditorChanged(editor) {
    this.editor = editor;
    var kernel = undefined;
    if (this.editor) {
      var grammar = this.editor.getGrammar();
      var language = this.kernelManager.getLanguageFor(grammar);
      kernel = this.kernelManager.getRunningKernelFor(language);
      this.codeManager.editor = this.editor;
    }

    if (this.kernel !== kernel) {
      this.onKernelChanged(kernel);
    }
  },

  onKernelChanged: function onKernelChanged(kernel) {
    this.kernel = kernel;
    this.setStatusBar();
    this.setWatchSidebar(this.kernel);
    this.emitter.emit('did-change-kernel', this.kernel);
  },

  setStatusBar: function setStatusBar() {
    if (!this.statusBarElement) {
      console.error('setStatusBar: there is no status bar');
      return;
    }

    this.clearStatusBar();

    if (this.kernel) {
      this.statusBarElement.appendChild(this.kernel.statusView.element);
    }
  },

  clearStatusBar: function clearStatusBar() {
    if (!this.statusBarElement) {
      console.error('clearStatusBar: there is no status bar');
      return;
    }

    while (this.statusBarElement.hasChildNodes()) {
      this.statusBarElement.removeChild(this.statusBarElement.lastChild);
    }
  },

  setWatchSidebar: function setWatchSidebar(kernel) {
    (0, _log2['default'])('setWatchSidebar:', kernel);

    var sidebar = kernel ? kernel.watchSidebar : null;
    if (this.watchSidebar === sidebar) {
      return;
    }

    if (this.watchSidebar && this.watchSidebar.visible) {
      this.watchSidebar.hide();
    }

    this.watchSidebar = sidebar;

    if (this.watchSidebar && this.watchSidebarIsVisible) {
      this.watchSidebar.show();
    }
  },

  toggleWatchSidebar: function toggleWatchSidebar() {
    if (this.watchSidebarIsVisible) {
      (0, _log2['default'])('toggleWatchSidebar: hiding sidebar');
      this.watchSidebarIsVisible = false;
      if (this.watchSidebar) this.watchSidebar.hide();
    } else {
      (0, _log2['default'])('toggleWatchSidebar: showing sidebar');
      this.watchSidebarIsVisible = true;
      if (this.watchSidebar) this.watchSidebar.show();
    }
  },

  showKernelCommands: function showKernelCommands() {
    var _this2 = this;

    if (!this.signalListView) {
      this.signalListView = new _signalListView2['default'](this.kernelManager);
      this.signalListView.onConfirmed = function (kernelCommand) {
        return _this2.handleKernelCommand(kernelCommand);
      };
    }
    this.signalListView.toggle();
  },

  handleKernelCommand: function handleKernelCommand(_ref) {
    var kernel = _ref.kernel;
    var command = _ref.command;
    var grammar = _ref.grammar;
    var language = _ref.language;
    var kernelSpec = _ref.kernelSpec;

    (0, _log2['default'])('handleKernelCommand:', arguments);

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
      var message = 'No running kernel for language `' + language + '` found';
      atom.notifications.addError(message);
      return;
    }

    if (command === 'interrupt-kernel') {
      kernel.interrupt();
    } else if (command === 'restart-kernel') {
      this.clearResultBubbles();
      this.kernelManager.restartRunningKernelFor(grammar, this.onKernelChanged.bind(this));
    } else if (command === 'shutdown-kernel') {
      this.clearResultBubbles();
      // Note that destroy alone does not shut down a WSKernel
      kernel.shutdown();
      this.kernelManager.destroyRunningKernelFor(grammar);
      this.onKernelChanged();
    } else if (command === 'switch-kernel') {
      this.clearResultBubbles();
      this.kernelManager.destroyRunningKernelFor(grammar);
      this.kernelManager.startKernel(kernelSpec, grammar, this.onKernelChanged.bind(this));
    } else if (command === 'rename-kernel' && kernel.promptRename) {
      kernel.promptRename();
    } else if (command === 'disconnect-kernel') {
      this.clearResultBubbles();
      this.kernelManager.destroyRunningKernelFor(grammar);
      this.onKernelChanged();
    }
  },

  createResultBubble: function createResultBubble(code, row) {
    var _this3 = this;

    if (this.kernel) {
      this._createResultBubble(this.kernel, code, row);
      return;
    }

    this.kernelManager.startKernelFor(this.editor.getGrammar(), function (kernel) {
      _this3.onKernelChanged(kernel);
      _this3._createResultBubble(kernel, code, row);
    });
  },

  _createResultBubble: function _createResultBubble(kernel, code, row) {
    if (this.watchSidebar.element.contains(document.activeElement)) {
      this.watchSidebar.run();
      return;
    }

    this.clearBubblesOnRow(row);
    var view = this.insertResultBubble(row);
    kernel.execute(code, function (result) {
      view.addResult(result);
    });
  },

  insertResultBubble: function insertResultBubble(row) {
    var _this4 = this;

    var buffer = this.editor.getBuffer();
    var lineLength = buffer.lineLengthForRow(row);

    var marker = this.editor.markBufferPosition({
      row: row,
      column: lineLength
    }, { invalidate: 'touch' });

    var view = new _resultView2['default'](marker);
    view.spin();
    var element = view.element;

    var lineHeight = this.editor.getLineHeightInPixels();
    view.spinner.setAttribute('style', '\n      width: ' + (lineHeight + 2) + 'px;\n      height: ' + (lineHeight - 4) + 'px;');
    view.statusContainer.setAttribute('style', 'height: ' + lineHeight + 'px');
    element.setAttribute('style', '\n      margin-left: ' + (lineLength + 1) + 'ch;\n      margin-top: -' + lineHeight + 'px;\n      max-width: ' + this.editor.width + 'px');

    this.editor.decorateMarker(marker, {
      type: 'block',
      item: element,
      position: 'after'
    });

    this.markerBubbleMap[marker.id] = view;
    marker.onDidChange(function (event) {
      (0, _log2['default'])('marker.onDidChange:', marker);
      if (!event.isValid) {
        view.destroy();
        marker.destroy();
        delete _this4.markerBubbleMap[marker.id];
      } else if (!element.classList.contains('multiline')) {
        lineLength = marker.getStartBufferPosition().column;
        element.setAttribute('style', '\n          margin-left: ' + (lineLength + 1) + 'ch;\n          margin-top: -' + lineHeight + 'px');
      }
    });
    return view;
  },

  clearResultBubbles: function clearResultBubbles() {
    _lodash2['default'].forEach(this.markerBubbleMap, function (bubble) {
      return bubble.destroy();
    });
    this.markerBubbleMap = {};
  },

  clearBubblesOnRow: function clearBubblesOnRow(row) {
    var _this5 = this;

    (0, _log2['default'])('clearBubblesOnRow:', row);
    _lodash2['default'].forEach(this.markerBubbleMap, function (bubble) {
      var marker = bubble.marker;

      var range = marker.getBufferRange();
      if (range.start.row <= row && row <= range.end.row) {
        (0, _log2['default'])('clearBubblesOnRow:', row, bubble);
        bubble.destroy();
        delete _this5.markerBubbleMap[marker.id];
      }
    });
  },

  run: function run() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var codeBlock = this.codeManager.findCodeBlock();
    if (!codeBlock) {
      return;
    }

    var _codeBlock = _slicedToArray(codeBlock, 2);

    var code = _codeBlock[0];
    var row = _codeBlock[1];

    if (code) {
      if (moveDown === true) {
        this.codeManager.moveDown(row);
      }
      this.createResultBubble(code, row);
    }
  },

  runAll: function runAll() {
    var _this6 = this;

    if (this.kernel) {
      this._runAll(this.kernel);
      return;
    }

    this.kernelManager.startKernelFor(this.editor.getGrammar(), function (kernel) {
      _this6.onKernelChanged(kernel);
      _this6._runAll(kernel);
    });
  },

  _runAll: function _runAll(kernel) {
    var _this7 = this;

    var cells = this.codeManager.getCells();
    _lodash2['default'].forEach(cells, function (_ref2) {
      var start = _ref2.start;
      var end = _ref2.end;

      var code = _this7.codeManager.getTextInRange(start, end);
      var endRow = _this7.codeManager.escapeBlankRows(start.row, end.row);
      _this7._createResultBubble(kernel, code, endRow);
    });
  },

  runAllAbove: function runAllAbove() {
    var cursor = this.editor.getLastCursor();
    var row = this.codeManager.escapeBlankRows(0, cursor.getBufferRow());
    var code = this.codeManager.getRows(0, row);

    if (code) {
      this.createResultBubble(code, row);
    }
  },

  runCell: function runCell() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var _codeManager$getCurrentCell = this.codeManager.getCurrentCell();

    var start = _codeManager$getCurrentCell.start;
    var end = _codeManager$getCurrentCell.end;

    var code = this.codeManager.getTextInRange(start, end);
    var endRow = this.codeManager.escapeBlankRows(start.row, end.row);

    if (code) {
      if (moveDown === true) {
        this.codeManager.moveDown(endRow);
      }
      this.createResultBubble(code, endRow);
    }
  },

  showKernelPicker: function showKernelPicker() {
    var _this8 = this;

    if (!this.kernelPicker) {
      this.kernelPicker = new _kernelPicker2['default'](function (callback) {
        var grammar = _this8.editor.getGrammar();
        var language = _this8.kernelManager.getLanguageFor(grammar);
        _this8.kernelManager.getAllKernelSpecsFor(language, function (kernelSpecs) {
          return callback(kernelSpecs);
        });
      });
      this.kernelPicker.onConfirmed = function (_ref3) {
        var kernelSpec = _ref3.kernelSpec;
        return _this8.handleKernelCommand({
          command: 'switch-kernel',
          kernelSpec: kernelSpec
        });
      };
    }
    this.kernelPicker.toggle();
  },

  showWSKernelPicker: function showWSKernelPicker() {
    var _this9 = this;

    if (!this.wsKernelPicker) {
      this.wsKernelPicker = new _wsKernelPicker2['default'](function (kernel) {
        _this9.clearResultBubbles();

        var grammar = kernel.grammar;

        _this9.kernelManager.destroyRunningKernelFor(grammar);

        _this9.kernelManager.setRunningKernelFor(grammar, kernel);
        _this9.onKernelChanged(kernel);
      });
    }

    var grammar = this.editor.getGrammar();
    var language = this.kernelManager.getLanguageFor(grammar);

    this.wsKernelPicker.toggle(grammar, function (kernelSpec) {
      return _this9.kernelManager.kernelSpecProvidesLanguage(kernelSpec, language);
    });
  }
};

exports['default'] = Hydrogen;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRTZDLE1BQU07O3NCQUVyQyxRQUFROzs7OzBCQUVDLGVBQWU7Ozs7OEJBQ1gsb0JBQW9COzs7OzRCQUN0QixpQkFBaUI7Ozs7OEJBQ2Ysb0JBQW9COzs7OzJCQUN2QixnQkFBZ0I7Ozs7c0JBRXJCLFVBQVU7Ozs7NkJBQ0gsa0JBQWtCOzs7O3lCQUN0QixhQUFhOzs7O29DQUNGLHlCQUF5Qjs7Ozt5Q0FDN0IsZ0NBQWdDOzs7O21CQUM3QyxPQUFPOzs7O0FBakJ2QixXQUFXLENBQUM7O0FBbUJaLElBQU0sUUFBUSxHQUFHO0FBQ2YsUUFBTSxFQUFFLG9CQUFPLE1BQU07QUFDckIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLGVBQWEsRUFBRSxJQUFJO0FBQ25CLFdBQVMsRUFBRSxJQUFJOztBQUVmLFFBQU0sRUFBRSxJQUFJO0FBQ1osUUFBTSxFQUFFLElBQUk7QUFDWixpQkFBZSxFQUFFLElBQUk7O0FBRXJCLGtCQUFnQixFQUFFLElBQUk7QUFDdEIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLGNBQVksRUFBRSxJQUFJO0FBQ2xCLHVCQUFxQixFQUFFLEtBQUs7O0FBRTVCLFVBQVEsRUFBQSxvQkFBRzs7O0FBQ1QsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsZ0NBQW1CLENBQUM7QUFDekMsUUFBSSxDQUFDLFdBQVcsR0FBRyw4QkFBaUIsQ0FBQztBQUNyQyxRQUFJLENBQUMsU0FBUyxHQUFHLDJCQUFjLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVyRSxRQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFMUIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENB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QUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hELGVBQUssZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzlCLENBQUMsQ0FBQztLQUNKOztBQUVELFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDekMsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTVELFFBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFBLFVBQVU7YUFDNUMsT0FBSyxhQUFhLENBQUMsMEJBQTBCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztLQUFBLENBQ3BFLENBQUM7R0FDSDtDQUNGLENBQUM7O3FCQUVhLFFBQVEiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCBSZXN1bHRWaWV3IGZyb20gJy4vcmVzdWx0LXZpZXcnO1xuaW1wb3J0IFNpZ25hbExpc3RWaWV3IGZyb20gJy4vc2lnbmFsLWxpc3Qtdmlldyc7XG5pbXBvcnQgS2VybmVsUGlja2VyIGZyb20gJy4va2VybmVsLXBpY2tlcic7XG5pbXBvcnQgV1NLZXJuZWxQaWNrZXIgZnJvbSAnLi93cy1rZXJuZWwtcGlja2VyJztcbmltcG9ydCBDb2RlTWFuYWdlciBmcm9tICcuL2NvZGUtbWFuYWdlcic7XG5cbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IEtlcm5lbE1hbmFnZXIgZnJvbSAnLi9rZXJuZWwtbWFuYWdlcic7XG5pbXBvcnQgSW5zcGVjdG9yIGZyb20gJy4vaW5zcGVjdG9yJztcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL2F1dG9jb21wbGV0ZS1wcm92aWRlcic7XG5pbXBvcnQgSHlkcm9nZW5Qcm92aWRlciBmcm9tICcuL3BsdWdpbi1hcGkvaHlkcm9nZW4tcHJvdmlkZXInO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZyc7XG5cbmNvbnN0IEh5ZHJvZ2VuID0ge1xuICBjb25maWc6IENvbmZpZy5zY2hlbWEsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAga2VybmVsTWFuYWdlcjogbnVsbCxcbiAgaW5zcGVjdG9yOiBudWxsLFxuXG4gIGVkaXRvcjogbnVsbCxcbiAga2VybmVsOiBudWxsLFxuICBtYXJrZXJCdWJibGVNYXA6IG51bGwsXG5cbiAgc3RhdHVzQmFyRWxlbWVudDogbnVsbCxcbiAgc3RhdHVzQmFyVGlsZTogbnVsbCxcblxuICB3YXRjaFNpZGViYXI6IG51bGwsXG4gIHdhdGNoU2lkZWJhcklzVmlzaWJsZTogZmFsc2UsXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLmtlcm5lbE1hbmFnZXIgPSBuZXcgS2VybmVsTWFuYWdlcigpO1xuICAgIHRoaXMuY29kZU1hbmFnZXIgPSBuZXcgQ29kZU1hbmFnZXIoKTtcbiAgICB0aGlzLmluc3BlY3RvciA9IG5ldyBJbnNwZWN0b3IodGhpcy5rZXJuZWxNYW5hZ2VyLCB0aGlzLmNvZGVNYW5hZ2VyKTtcblxuICAgIHRoaXMubWFya2VyQnViYmxlTWFwID0ge307XG5cbiAgICB0aGlzLnN0YXR1c0JhckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLnN0YXR1c0JhckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaHlkcm9nZW4tc3RhdHVzJywgJ2lubGluZS1ibG9jaycpO1xuICAgIHRoaXMuc3RhdHVzQmFyRWxlbWVudC5vbmNsaWNrID0gdGhpcy5zaG93S2VybmVsQ29tbWFuZHMuYmluZCh0aGlzKTtcblxuICAgIHRoaXMub25FZGl0b3JDaGFuZ2VkKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdoeWRyb2dlbjpydW4nOiAoKSA9PiB0aGlzLnJ1bigpLFxuICAgICAgJ2h5ZHJvZ2VuOnJ1bi1hbGwnOiAoKSA9PiB0aGlzLnJ1bkFsbCgpLFxuICAgICAgJ2h5ZHJvZ2VuOnJ1bi1hbGwtYWJvdmUnOiAoKSA9PiB0aGlzLnJ1bkFsbEFib3ZlKCksXG4gICAgICAnaHlkcm9nZW46cnVuLWFuZC1tb3ZlLWRvd24nOiAoKSA9PiB0aGlzLnJ1bih0cnVlKSxcbiAgICAgICdoeWRyb2dlbjpydW4tY2VsbCc6ICgpID0+IHRoaXMucnVuQ2VsbCgpLFxuICAgICAgJ2h5ZHJvZ2VuOnJ1bi1jZWxsLWFuZC1tb3ZlLWRvd24nOiAoKSA9PiB0aGlzLnJ1bkNlbGwodHJ1ZSksXG4gICAgICAnaHlkcm9nZW46dG9nZ2xlLXdhdGNoZXMnOiAoKSA9PiB0aGlzLnRvZ2dsZVdhdGNoU2lkZWJhcigpLFxuICAgICAgJ2h5ZHJvZ2VuOnNlbGVjdC1rZXJuZWwnOiAoKSA9PiB0aGlzLnNob3dLZXJuZWxQaWNrZXIoKSxcbiAgICAgICdoeWRyb2dlbjpjb25uZWN0LXRvLXJlbW90ZS1rZXJuZWwnOiAoKSA9PiB0aGlzLnNob3dXU0tlcm5lbFBpY2tlcigpLFxuICAgICAgJ2h5ZHJvZ2VuOmFkZC13YXRjaCc6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLndhdGNoU2lkZWJhcklzVmlzaWJsZSkgdGhpcy50b2dnbGVXYXRjaFNpZGViYXIoKTtcbiAgICAgICAgaWYgKHRoaXMud2F0Y2hTaWRlYmFyKSB0aGlzLndhdGNoU2lkZWJhci5hZGRXYXRjaEZyb21FZGl0b3IoKTtcbiAgICAgIH0sXG4gICAgICAnaHlkcm9nZW46cmVtb3ZlLXdhdGNoJzogKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMud2F0Y2hTaWRlYmFySXNWaXNpYmxlKSB0aGlzLnRvZ2dsZVdhdGNoU2lkZWJhcigpO1xuICAgICAgICBpZiAodGhpcy53YXRjaFNpZGViYXIpIHRoaXMud2F0Y2hTaWRlYmFyLnJlbW92ZVdhdGNoKCk7XG4gICAgICB9LFxuICAgICAgJ2h5ZHJvZ2VuOnVwZGF0ZS1rZXJuZWxzJzogKCkgPT4gdGhpcy5rZXJuZWxNYW5hZ2VyLnVwZGF0ZUtlcm5lbFNwZWNzKCksXG4gICAgICAnaHlkcm9nZW46dG9nZ2xlLWluc3BlY3Rvcic6ICgpID0+IHRoaXMuaW5zcGVjdG9yLnRvZ2dsZSgpLFxuICAgICAgJ2h5ZHJvZ2VuOmludGVycnVwdC1rZXJuZWwnOiAoKSA9PlxuICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiAnaW50ZXJydXB0LWtlcm5lbCcgfSksXG4gICAgICAnaHlkcm9nZW46cmVzdGFydC1rZXJuZWwnOiAoKSA9PlxuICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiAncmVzdGFydC1rZXJuZWwnIH0pLFxuICAgICAgJ2h5ZHJvZ2VuOnNodXRkb3duLWtlcm5lbCc6ICgpID0+XG4gICAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCh7IGNvbW1hbmQ6ICdzaHV0ZG93bi1rZXJuZWwnIH0pLFxuICAgIH0pKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2h5ZHJvZ2VuOmNsZWFyLXJlc3VsdHMnOiAoKSA9PiB0aGlzLmNsZWFyUmVzdWx0QnViYmxlcygpIH0pKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKChpdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbSAmJiBpdGVtID09PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpIHtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNoYW5nZWQoaXRlbSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5oeWRyb2dlblByb3ZpZGVyID0gbnVsbDtcbiAgfSxcblxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmtlcm5lbE1hbmFnZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuc3RhdHVzQmFyVGlsZS5kZXN0cm95KCk7XG4gIH0sXG5cbiAgcHJvdmlkZUh5ZHJvZ2VuKCkge1xuICAgIGlmICghdGhpcy5oeWRyb2dlblByb3ZpZGVyKSB7XG4gICAgICB0aGlzLmh5ZHJvZ2VuUHJvdmlkZXIgPSBuZXcgSHlkcm9nZW5Qcm92aWRlcih0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5oeWRyb2dlblByb3ZpZGVyO1xuICB9LFxuXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLnN0YXR1c0JhclRpbGUgPSBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5zdGF0dXNCYXJFbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICB9KTtcbiAgfSxcblxuXG4gIHByb3ZpZGUoKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnSHlkcm9nZW4uYXV0b2NvbXBsZXRlJykgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBBdXRvY29tcGxldGVQcm92aWRlcih0aGlzLmtlcm5lbE1hbmFnZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuXG4gIG9uRWRpdG9yQ2hhbmdlZChlZGl0b3IpIHtcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvcjtcbiAgICBsZXQga2VybmVsO1xuICAgIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICAgIGNvbnN0IGxhbmd1YWdlID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuICAgICAga2VybmVsID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldFJ1bm5pbmdLZXJuZWxGb3IobGFuZ3VhZ2UpO1xuICAgICAgdGhpcy5jb2RlTWFuYWdlci5lZGl0b3IgPSB0aGlzLmVkaXRvcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5rZXJuZWwgIT09IGtlcm5lbCkge1xuICAgICAgdGhpcy5vbktlcm5lbENoYW5nZWQoa2VybmVsKTtcbiAgICB9XG4gIH0sXG5cblxuICBvbktlcm5lbENoYW5nZWQoa2VybmVsKSB7XG4gICAgdGhpcy5rZXJuZWwgPSBrZXJuZWw7XG4gICAgdGhpcy5zZXRTdGF0dXNCYXIoKTtcbiAgICB0aGlzLnNldFdhdGNoU2lkZWJhcih0aGlzLmtlcm5lbCk7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Uta2VybmVsJywgdGhpcy5rZXJuZWwpO1xuICB9LFxuXG5cbiAgc2V0U3RhdHVzQmFyKCkge1xuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbGVtZW50KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzZXRTdGF0dXNCYXI6IHRoZXJlIGlzIG5vIHN0YXR1cyBiYXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyU3RhdHVzQmFyKCk7XG5cbiAgICBpZiAodGhpcy5rZXJuZWwpIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmtlcm5lbC5zdGF0dXNWaWV3LmVsZW1lbnQpO1xuICAgIH1cbiAgfSxcblxuXG4gIGNsZWFyU3RhdHVzQmFyKCkge1xuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbGVtZW50KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdjbGVhclN0YXR1c0JhcjogdGhlcmUgaXMgbm8gc3RhdHVzIGJhcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLnN0YXR1c0JhckVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICB0aGlzLnN0YXR1c0JhckVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5zdGF0dXNCYXJFbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgfVxuICB9LFxuXG5cbiAgc2V0V2F0Y2hTaWRlYmFyKGtlcm5lbCkge1xuICAgIGxvZygnc2V0V2F0Y2hTaWRlYmFyOicsIGtlcm5lbCk7XG5cbiAgICBjb25zdCBzaWRlYmFyID0gKGtlcm5lbCkgPyBrZXJuZWwud2F0Y2hTaWRlYmFyIDogbnVsbDtcbiAgICBpZiAodGhpcy53YXRjaFNpZGViYXIgPT09IHNpZGViYXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy53YXRjaFNpZGViYXIgJiYgdGhpcy53YXRjaFNpZGViYXIudmlzaWJsZSkge1xuICAgICAgdGhpcy53YXRjaFNpZGViYXIuaGlkZSgpO1xuICAgIH1cblxuICAgIHRoaXMud2F0Y2hTaWRlYmFyID0gc2lkZWJhcjtcblxuICAgIGlmICh0aGlzLndhdGNoU2lkZWJhciAmJiB0aGlzLndhdGNoU2lkZWJhcklzVmlzaWJsZSkge1xuICAgICAgdGhpcy53YXRjaFNpZGViYXIuc2hvdygpO1xuICAgIH1cbiAgfSxcblxuXG4gIHRvZ2dsZVdhdGNoU2lkZWJhcigpIHtcbiAgICBpZiAodGhpcy53YXRjaFNpZGViYXJJc1Zpc2libGUpIHtcbiAgICAgIGxvZygndG9nZ2xlV2F0Y2hTaWRlYmFyOiBoaWRpbmcgc2lkZWJhcicpO1xuICAgICAgdGhpcy53YXRjaFNpZGViYXJJc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLndhdGNoU2lkZWJhcikgdGhpcy53YXRjaFNpZGViYXIuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ3RvZ2dsZVdhdGNoU2lkZWJhcjogc2hvd2luZyBzaWRlYmFyJyk7XG4gICAgICB0aGlzLndhdGNoU2lkZWJhcklzVmlzaWJsZSA9IHRydWU7XG4gICAgICBpZiAodGhpcy53YXRjaFNpZGViYXIpIHRoaXMud2F0Y2hTaWRlYmFyLnNob3coKTtcbiAgICB9XG4gIH0sXG5cblxuICBzaG93S2VybmVsQ29tbWFuZHMoKSB7XG4gICAgaWYgKCF0aGlzLnNpZ25hbExpc3RWaWV3KSB7XG4gICAgICB0aGlzLnNpZ25hbExpc3RWaWV3ID0gbmV3IFNpZ25hbExpc3RWaWV3KHRoaXMua2VybmVsTWFuYWdlcik7XG4gICAgICB0aGlzLnNpZ25hbExpc3RWaWV3Lm9uQ29uZmlybWVkID0ga2VybmVsQ29tbWFuZCA9PlxuICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoa2VybmVsQ29tbWFuZCk7XG4gICAgfVxuICAgIHRoaXMuc2lnbmFsTGlzdFZpZXcudG9nZ2xlKCk7XG4gIH0sXG5cblxuICBoYW5kbGVLZXJuZWxDb21tYW5kKHsga2VybmVsLCBjb21tYW5kLCBncmFtbWFyLCBsYW5ndWFnZSwga2VybmVsU3BlYyB9KSB7XG4gICAgbG9nKCdoYW5kbGVLZXJuZWxDb21tYW5kOicsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAoIWdyYW1tYXIpIHtcbiAgICAgIGdyYW1tYXIgPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgfVxuICAgIGlmICghbGFuZ3VhZ2UpIHtcbiAgICAgIGxhbmd1YWdlID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuICAgIH1cbiAgICBpZiAoIWtlcm5lbCkge1xuICAgICAga2VybmVsID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldFJ1bm5pbmdLZXJuZWxGb3IobGFuZ3VhZ2UpO1xuICAgIH1cblxuICAgIGlmICgha2VybmVsKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYE5vIHJ1bm5pbmcga2VybmVsIGZvciBsYW5ndWFnZSBcXGAke2xhbmd1YWdlfVxcYCBmb3VuZGA7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT09ICdpbnRlcnJ1cHQta2VybmVsJykge1xuICAgICAga2VybmVsLmludGVycnVwdCgpO1xuICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gJ3Jlc3RhcnQta2VybmVsJykge1xuICAgICAgdGhpcy5jbGVhclJlc3VsdEJ1YmJsZXMoKTtcbiAgICAgIHRoaXMua2VybmVsTWFuYWdlci5yZXN0YXJ0UnVubmluZ0tlcm5lbEZvcihncmFtbWFyLCB0aGlzLm9uS2VybmVsQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09ICdzaHV0ZG93bi1rZXJuZWwnKSB7XG4gICAgICB0aGlzLmNsZWFyUmVzdWx0QnViYmxlcygpO1xuICAgICAgLy8gTm90ZSB0aGF0IGRlc3Ryb3kgYWxvbmUgZG9lcyBub3Qgc2h1dCBkb3duIGEgV1NLZXJuZWxcbiAgICAgIGtlcm5lbC5zaHV0ZG93bigpO1xuICAgICAgdGhpcy5rZXJuZWxNYW5hZ2VyLmRlc3Ryb3lSdW5uaW5nS2VybmVsRm9yKGdyYW1tYXIpO1xuICAgICAgdGhpcy5vbktlcm5lbENoYW5nZWQoKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09ICdzd2l0Y2gta2VybmVsJykge1xuICAgICAgdGhpcy5jbGVhclJlc3VsdEJ1YmJsZXMoKTtcbiAgICAgIHRoaXMua2VybmVsTWFuYWdlci5kZXN0cm95UnVubmluZ0tlcm5lbEZvcihncmFtbWFyKTtcbiAgICAgIHRoaXMua2VybmVsTWFuYWdlci5zdGFydEtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCB0aGlzLm9uS2VybmVsQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09ICdyZW5hbWUta2VybmVsJyAmJiBrZXJuZWwucHJvbXB0UmVuYW1lKSB7XG4gICAgICBrZXJuZWwucHJvbXB0UmVuYW1lKCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSAnZGlzY29ubmVjdC1rZXJuZWwnKSB7XG4gICAgICB0aGlzLmNsZWFyUmVzdWx0QnViYmxlcygpO1xuICAgICAgdGhpcy5rZXJuZWxNYW5hZ2VyLmRlc3Ryb3lSdW5uaW5nS2VybmVsRm9yKGdyYW1tYXIpO1xuICAgICAgdGhpcy5vbktlcm5lbENoYW5nZWQoKTtcbiAgICB9XG4gIH0sXG5cblxuICBjcmVhdGVSZXN1bHRCdWJibGUoY29kZSwgcm93KSB7XG4gICAgaWYgKHRoaXMua2VybmVsKSB7XG4gICAgICB0aGlzLl9jcmVhdGVSZXN1bHRCdWJibGUodGhpcy5rZXJuZWwsIGNvZGUsIHJvdyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5rZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsRm9yKHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKSwgKGtlcm5lbCkgPT4ge1xuICAgICAgdGhpcy5vbktlcm5lbENoYW5nZWQoa2VybmVsKTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShrZXJuZWwsIGNvZGUsIHJvdyk7XG4gICAgfSk7XG4gIH0sXG5cblxuICBfY3JlYXRlUmVzdWx0QnViYmxlKGtlcm5lbCwgY29kZSwgcm93KSB7XG4gICAgaWYgKHRoaXMud2F0Y2hTaWRlYmFyLmVsZW1lbnQuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgIHRoaXMud2F0Y2hTaWRlYmFyLnJ1bigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJCdWJibGVzT25Sb3cocm93KTtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5pbnNlcnRSZXN1bHRCdWJibGUocm93KTtcbiAgICBrZXJuZWwuZXhlY3V0ZShjb2RlLCAocmVzdWx0KSA9PiB7XG4gICAgICB2aWV3LmFkZFJlc3VsdChyZXN1bHQpO1xuICAgIH0pO1xuICB9LFxuXG5cbiAgaW5zZXJ0UmVzdWx0QnViYmxlKHJvdykge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGxldCBsaW5lTGVuZ3RoID0gYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3cocm93KTtcblxuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbih7XG4gICAgICByb3csXG4gICAgICBjb2x1bW46IGxpbmVMZW5ndGgsXG4gICAgfSwgeyBpbnZhbGlkYXRlOiAndG91Y2gnIH0pO1xuXG4gICAgY29uc3QgdmlldyA9IG5ldyBSZXN1bHRWaWV3KG1hcmtlcik7XG4gICAgdmlldy5zcGluKCk7XG4gICAgY29uc3QgeyBlbGVtZW50IH0gPSB2aWV3O1xuXG4gICAgY29uc3QgbGluZUhlaWdodCA9IHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuICAgIHZpZXcuc3Bpbm5lci5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYFxuICAgICAgd2lkdGg6ICR7bGluZUhlaWdodCArIDJ9cHg7XG4gICAgICBoZWlnaHQ6ICR7bGluZUhlaWdodCAtIDR9cHg7YCk7XG4gICAgdmlldy5zdGF0dXNDb250YWluZXIuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBoZWlnaHQ6ICR7bGluZUhlaWdodH1weGApO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBcbiAgICAgIG1hcmdpbi1sZWZ0OiAke2xpbmVMZW5ndGggKyAxfWNoO1xuICAgICAgbWFyZ2luLXRvcDogLSR7bGluZUhlaWdodH1weDtcbiAgICAgIG1heC13aWR0aDogJHt0aGlzLmVkaXRvci53aWR0aH1weGApO1xuXG4gICAgdGhpcy5lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIHBvc2l0aW9uOiAnYWZ0ZXInLFxuICAgIH0pO1xuXG4gICAgdGhpcy5tYXJrZXJCdWJibGVNYXBbbWFya2VyLmlkXSA9IHZpZXc7XG4gICAgbWFya2VyLm9uRGlkQ2hhbmdlKChldmVudCkgPT4ge1xuICAgICAgbG9nKCdtYXJrZXIub25EaWRDaGFuZ2U6JywgbWFya2VyKTtcbiAgICAgIGlmICghZXZlbnQuaXNWYWxpZCkge1xuICAgICAgICB2aWV3LmRlc3Ryb3koKTtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICAgICAgZGVsZXRlIHRoaXMubWFya2VyQnViYmxlTWFwW21hcmtlci5pZF07XG4gICAgICB9IGVsc2UgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlsaW5lJykpIHtcbiAgICAgICAgbGluZUxlbmd0aCA9IG1hcmtlci5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKCkuY29sdW1uO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6ICR7bGluZUxlbmd0aCArIDF9Y2g7XG4gICAgICAgICAgbWFyZ2luLXRvcDogLSR7bGluZUhlaWdodH1weGApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB2aWV3O1xuICB9LFxuXG5cbiAgY2xlYXJSZXN1bHRCdWJibGVzKCkge1xuICAgIF8uZm9yRWFjaCh0aGlzLm1hcmtlckJ1YmJsZU1hcCwgYnViYmxlID0+IGJ1YmJsZS5kZXN0cm95KCkpO1xuICAgIHRoaXMubWFya2VyQnViYmxlTWFwID0ge307XG4gIH0sXG5cblxuICBjbGVhckJ1YmJsZXNPblJvdyhyb3cpIHtcbiAgICBsb2coJ2NsZWFyQnViYmxlc09uUm93OicsIHJvdyk7XG4gICAgXy5mb3JFYWNoKHRoaXMubWFya2VyQnViYmxlTWFwLCAoYnViYmxlKSA9PiB7XG4gICAgICBjb25zdCB7IG1hcmtlciB9ID0gYnViYmxlO1xuICAgICAgY29uc3QgcmFuZ2UgPSBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKTtcbiAgICAgIGlmIChyYW5nZS5zdGFydC5yb3cgPD0gcm93ICYmIHJvdyA8PSByYW5nZS5lbmQucm93KSB7XG4gICAgICAgIGxvZygnY2xlYXJCdWJibGVzT25Sb3c6Jywgcm93LCBidWJibGUpO1xuICAgICAgICBidWJibGUuZGVzdHJveSgpO1xuICAgICAgICBkZWxldGUgdGhpcy5tYXJrZXJCdWJibGVNYXBbbWFya2VyLmlkXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuXG4gIHJ1bihtb3ZlRG93biA9IGZhbHNlKSB7XG4gICAgY29uc3QgY29kZUJsb2NrID0gdGhpcy5jb2RlTWFuYWdlci5maW5kQ29kZUJsb2NrKCk7XG4gICAgaWYgKCFjb2RlQmxvY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBbY29kZSwgcm93XSA9IGNvZGVCbG9jaztcbiAgICBpZiAoY29kZSkge1xuICAgICAgaWYgKG1vdmVEb3duID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuY29kZU1hbmFnZXIubW92ZURvd24ocm93KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRlUmVzdWx0QnViYmxlKGNvZGUsIHJvdyk7XG4gICAgfVxuICB9LFxuXG5cbiAgcnVuQWxsKCkge1xuICAgIGlmICh0aGlzLmtlcm5lbCkge1xuICAgICAgdGhpcy5fcnVuQWxsKHRoaXMua2VybmVsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWxGb3IodGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpLCAoa2VybmVsKSA9PiB7XG4gICAgICB0aGlzLm9uS2VybmVsQ2hhbmdlZChrZXJuZWwpO1xuICAgICAgdGhpcy5fcnVuQWxsKGtlcm5lbCk7XG4gICAgfSk7XG4gIH0sXG5cblxuICBfcnVuQWxsKGtlcm5lbCkge1xuICAgIGNvbnN0IGNlbGxzID0gdGhpcy5jb2RlTWFuYWdlci5nZXRDZWxscygpO1xuICAgIF8uZm9yRWFjaChjZWxscywgKHsgc3RhcnQsIGVuZCB9KSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlTWFuYWdlci5nZXRUZXh0SW5SYW5nZShzdGFydCwgZW5kKTtcbiAgICAgIGNvbnN0IGVuZFJvdyA9IHRoaXMuY29kZU1hbmFnZXIuZXNjYXBlQmxhbmtSb3dzKHN0YXJ0LnJvdywgZW5kLnJvdyk7XG4gICAgICB0aGlzLl9jcmVhdGVSZXN1bHRCdWJibGUoa2VybmVsLCBjb2RlLCBlbmRSb3cpO1xuICAgIH0pO1xuICB9LFxuXG5cbiAgcnVuQWxsQWJvdmUoKSB7XG4gICAgY29uc3QgY3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgIGNvbnN0IHJvdyA9IHRoaXMuY29kZU1hbmFnZXIuZXNjYXBlQmxhbmtSb3dzKDAsIGN1cnNvci5nZXRCdWZmZXJSb3coKSk7XG4gICAgY29uc3QgY29kZSA9IHRoaXMuY29kZU1hbmFnZXIuZ2V0Um93cygwLCByb3cpO1xuXG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlUmVzdWx0QnViYmxlKGNvZGUsIHJvdyk7XG4gICAgfVxuICB9LFxuXG5cbiAgcnVuQ2VsbChtb3ZlRG93biA9IGZhbHNlKSB7XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLmNvZGVNYW5hZ2VyLmdldEN1cnJlbnRDZWxsKCk7XG4gICAgY29uc3QgY29kZSA9IHRoaXMuY29kZU1hbmFnZXIuZ2V0VGV4dEluUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5jb2RlTWFuYWdlci5lc2NhcGVCbGFua1Jvd3Moc3RhcnQucm93LCBlbmQucm93KTtcblxuICAgIGlmIChjb2RlKSB7XG4gICAgICBpZiAobW92ZURvd24gPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5jb2RlTWFuYWdlci5tb3ZlRG93bihlbmRSb3cpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGVSZXN1bHRCdWJibGUoY29kZSwgZW5kUm93KTtcbiAgICB9XG4gIH0sXG5cblxuICBzaG93S2VybmVsUGlja2VyKCkge1xuICAgIGlmICghdGhpcy5rZXJuZWxQaWNrZXIpIHtcbiAgICAgIHRoaXMua2VybmVsUGlja2VyID0gbmV3IEtlcm5lbFBpY2tlcigoY2FsbGJhY2spID0+IHtcbiAgICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmtlcm5lbE1hbmFnZXIuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG4gICAgICAgIHRoaXMua2VybmVsTWFuYWdlci5nZXRBbGxLZXJuZWxTcGVjc0ZvcihsYW5ndWFnZSwga2VybmVsU3BlY3MgPT5cbiAgICAgICAgICBjYWxsYmFjayhrZXJuZWxTcGVjcykpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci5vbkNvbmZpcm1lZCA9ICh7IGtlcm5lbFNwZWMgfSkgPT5cbiAgICAgICAgdGhpcy5oYW5kbGVLZXJuZWxDb21tYW5kKHtcbiAgICAgICAgICBjb21tYW5kOiAnc3dpdGNoLWtlcm5lbCcsXG4gICAgICAgICAga2VybmVsU3BlYyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMua2VybmVsUGlja2VyLnRvZ2dsZSgpO1xuICB9LFxuXG5cbiAgc2hvd1dTS2VybmVsUGlja2VyKCkge1xuICAgIGlmICghdGhpcy53c0tlcm5lbFBpY2tlcikge1xuICAgICAgdGhpcy53c0tlcm5lbFBpY2tlciA9IG5ldyBXU0tlcm5lbFBpY2tlcigoa2VybmVsKSA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJSZXN1bHRCdWJibGVzKCk7XG5cbiAgICAgICAgY29uc3QgeyBncmFtbWFyIH0gPSBrZXJuZWw7XG4gICAgICAgIHRoaXMua2VybmVsTWFuYWdlci5kZXN0cm95UnVubmluZ0tlcm5lbEZvcihncmFtbWFyKTtcblxuICAgICAgICB0aGlzLmtlcm5lbE1hbmFnZXIuc2V0UnVubmluZ0tlcm5lbEZvcihncmFtbWFyLCBrZXJuZWwpO1xuICAgICAgICB0aGlzLm9uS2VybmVsQ2hhbmdlZChrZXJuZWwpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMua2VybmVsTWFuYWdlci5nZXRMYW5ndWFnZUZvcihncmFtbWFyKTtcblxuICAgIHRoaXMud3NLZXJuZWxQaWNrZXIudG9nZ2xlKGdyYW1tYXIsIGtlcm5lbFNwZWMgPT5cbiAgICAgIHRoaXMua2VybmVsTWFuYWdlci5rZXJuZWxTcGVjUHJvdmlkZXNMYW5ndWFnZShrZXJuZWxTcGVjLCBsYW5ndWFnZSksXG4gICAgKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEh5ZHJvZ2VuO1xuIl19