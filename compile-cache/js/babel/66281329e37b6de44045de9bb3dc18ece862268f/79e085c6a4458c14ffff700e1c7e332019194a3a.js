Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _portfinder = require('portfinder');

var _portfinder2 = _interopRequireDefault(_portfinder);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _atom = require('atom');

var _pathwatcher = require('pathwatcher');

var _eventKit = require('event-kit');

var _jupyterJsServices = require('jupyter-js-services');

var _xmlhttprequest = require('xmlhttprequest');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _child_process = require('child_process');

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _notebookEditorView = require('./notebook-editor-view');

var _notebookEditorView2 = _interopRequireDefault(_notebookEditorView);

var _notebookCell = require('./notebook-cell');

var _notebookCell2 = _interopRequireDefault(_notebookCell);

'use babel';

global.XMLHttpRequest = _xmlhttprequest.XMLHttpRequest;
global.WebSocket = _ws2['default'];

var NotebookEditor = (function () {
  function NotebookEditor(uri) {
    var _this = this;

    _classCallCheck(this, NotebookEditor);

    this.onAction = function (payload) {
      console.log('Action \'' + payload.actionType.toString() + '\'received in NotebookEditor');
      // TODO: add a notebook ID field to events and filter on it
      var cellInfo = undefined,
          cellIndex = undefined,
          cell = undefined;
      switch (payload.actionType) {
        case _dispatcher2['default'].actions.add_cell:
          var newCell = _immutable2['default'].fromJS({
            cell_type: 'code',
            execution_count: null,
            metadata: {
              collapsed: false
            },
            outputs: [],
            source: []
          });
          _this.state = _this.state.set('cells', _this.state.get('cells').push(newCell));
          _this.setModified(true);
          _this._onChange();
          break;
        case _dispatcher2['default'].actions.cell_source_changed:
          cellInfo = _this.findCellByID(payload.cellID);
          if (!cellInfo || cellInfo === undefined || cellInfo === null) {
            // return console.log('Message is for another notebook');
            return;
          } else {
            var _cellInfo = cellInfo;

            var _cellInfo2 = _slicedToArray(_cellInfo, 2);

            cellIndex = _cellInfo2[0];
            cell = _cellInfo2[1];
          }
          _this.state = _this.state.setIn(['cells', cellIndex, 'source'], payload.source);
          _this.setModified(true);
          break;
        case _dispatcher2['default'].actions.cell_focus:
          var activeCellInfo = _this.findActiveCell();
          if (!activeCellInfo || activeCellInfo === undefined || activeCellInfo === null) {
            // return console.log('Message is for another notebook');
            return;
          } else {
            // console.log(`Cell is at index ${cellIndex}`);

            var _activeCellInfo = _slicedToArray(activeCellInfo, 2);

            activeCellIndex = _activeCellInfo[0];
            activeCell = _activeCellInfo[1];
          }
          _this.state = _this.state.setIn(['cells', activeCellIndex, 'metadata', 'focus'], false);
          cellInfo = _this.findCellByID(payload.cellID);
          if (!cellInfo || cellInfo === undefined || cellInfo === null) {
            // return console.log('Message is for another notebook');
            return;
          } else {
            var _cellInfo3 = cellInfo;

            var _cellInfo32 = _slicedToArray(_cellInfo3, 2);

            cellIndex = _cellInfo32[0];
            cell = _cellInfo32[1];
          }
          _this.state = _this.state.setIn(['cells', cellIndex, 'metadata', 'focus'], payload.isFocused);
          _this._onChange();
          break;
        case _dispatcher2['default'].actions.run_cell:
          _this.runCell(_this.findCellByID(payload.cellID));
          break;
        case _dispatcher2['default'].actions.run_active_cell:
          _this.runCell(_this.findActiveCell());
          break;
        case _dispatcher2['default'].actions.output_received:
          cellInfo = _this.findCellByID(payload.cellID);
          if (!cellInfo || cellInfo === undefined || cellInfo === null) {
            // return console.log('Message is for another notebook');
            return;
          } else {
            var _cellInfo4 = cellInfo;

            var _cellInfo42 = _slicedToArray(_cellInfo4, 2);

            cellIndex = _cellInfo42[0];
            cell = _cellInfo42[1];
          }
          console.log('output_received', payload.message.content);
          var outputBundle = _this.makeOutputBundle(payload.message);
          if (outputBundle) {
            var outputs = _this.state.getIn(['cells', cellIndex, 'outputs']).toJS();
            var index = outputs.findIndex(function (output) {
              return output.output_type === outputBundle.output_type;
            });
            if (index > -1) {
              if (outputBundle.data) {
                outputs[index].data = outputs[index].data.concat(outputBundle.data);
              }
              if (outputBundle.text) {
                if (outputs[index].name === outputBundle.name) {
                  outputs[index].text = outputs[index].text.concat(outputBundle.text);
                } else {
                  outputs = outputs.concat(outputBundle);
                }
              }
            } else {
              outputs = outputs.concat(outputBundle);
            }
            var execution_count = _this.state.getIn(['cells', cellIndex, 'execution_count']);
            if (outputBundle.execution_count) execution_count = outputBundle.execution_count;
            var _newCell = _this.state.getIn(['cells', cellIndex]).merge({
              execution_count: execution_count,
              outputs: outputs
            });
            _this.state = _this.state.setIn(['cells', cellIndex], _newCell);
            _this.setModified(true);
            _this._onChange();
          }
          break;
        case _dispatcher2['default'].actions.interrupt_kernel:
          if (_this.session === undefined || _this.session === null) {
            return atom.notifications.addError('atom-notebook', {
              detail: 'No running Jupyter session. Try closing and re-opening this file.',
              dismissable: true
            });
          }
          _this.session.interrupt().then(function () {
            return console.log('this.session.interrupt');
          });
          break;
        case _dispatcher2['default'].actions.destroy:
          if (_this.session === undefined || _this.session === null) {
            return atom.notifications.addError('atom-notebook', {
              detail: 'No running Jupyter session. Try closing and re-opening this file.',
              dismissable: true
            });
          }
          destroy();
          break;
      }
    };

    this._onChange = function () {
      _this.emitter.emit('state-changed');
    };

    this.modified = false;

    console.log('NotebookEditor created for', uri);
    this.loadNotebookFile(uri);
    this.emitter = new _eventKit.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();
    this.launchKernelGateway();
    _dispatcher2['default'].register(this.onAction);
    //TODO: remove these development handles
    global.editor = this;
    global.Dispatcher = _dispatcher2['default'];
  }

  // atom.deserializers.add(NotebookEditor);

  _createClass(NotebookEditor, [{
    key: 'findCellByID',
    value: function findCellByID(id) {
      return this.state.get('cells').findEntry(function (cell) {
        return cell.getIn(['metadata', 'id']) == id;
      });
    }
  }, {
    key: 'findActiveCell',
    value: function findActiveCell() {
      return this.state.get('cells').findEntry(function (cell) {
        return cell.getIn(['metadata', 'focus']);
      });
    }
  }, {
    key: 'runCell',
    value: function runCell(cellInfo) {
      var future = undefined,
          timer = undefined;
      if (!cellInfo || cellInfo === undefined || cellInfo === null) {
        // return console.log('Message is for another notebook');
        return;
      } else {
        // console.log(`Cell is at index ${cellIndex}`);

        var _cellInfo5 = _slicedToArray(cellInfo, 2);

        cellIndex = _cellInfo5[0];
        cell = _cellInfo5[1];
      }
      if (this.session === undefined || this.session === null) {
        return atom.notifications.addError('atom-notebook', {
          detail: 'No running Jupyter session. Try closing and re-opening this file.',
          dismissable: true
        });
      }
      if (cell.get('cell_type') !== 'code') return;
      this.state = this.state.setIn(['cells', cellIndex, 'outputs'], _immutable2['default'].List());
      future = this.session.execute({ code: cell.get('source') }, false);
      future.onDone = function () {
        console.log('output_received', 'done');
        timer = setTimeout(function () {
          return future.dispose();
        }, 3000);
      };
      future.onIOPub = function (msg) {
        _dispatcher2['default'].dispatch({
          actionType: _dispatcher2['default'].actions.output_received,
          cellID: cell.getIn(['metadata', 'id']),
          message: msg
        });
        clearTimeout(timer);
      };
      this._onChange();
    }
  }, {
    key: 'addStateChangeListener',
    value: function addStateChangeListener(callback) {
      return this.emitter.on('state-changed', callback);
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this.state;
    }
  }, {
    key: 'loadNotebookFile',
    value: function loadNotebookFile(uri) {
      // console.log('LOAD NOTEBOOK FILE');
      this.file = new _pathwatcher.File(uri);
      var parsedFile = this.parseNotebookFile(this.file);
      if (parsedFile.cells) {
        parsedFile.cells = parsedFile.cells.map(function (cell) {
          cell.metadata.id = _uuid2['default'].v4();
          cell.metadata.focus = false;
          return cell;
        });
      } else {
        parsedFile.cells = [{
          cell_type: 'code',
          execution_count: null,
          metadata: {
            collapsed: true
          },
          outputs: [],
          source: []
        }];
      }
      if (parsedFile.cells.length > 0) parsedFile.cells[0].metadata.focus = true;
      this.state = _immutable2['default'].fromJS(parsedFile);
    }
  }, {
    key: 'parseNotebookFile',
    value: function parseNotebookFile(file) {
      var fileString = this.file.readSync();
      return JSON.parse(fileString);
    }
  }, {
    key: 'launchKernelGateway',
    value: function launchKernelGateway() {
      var _this2 = this;

      var language = this.state.getIn(['metadata', 'kernelspec', 'language']);
      _portfinder2['default'].basePort = 8888;
      _portfinder2['default'].getPort({ host: 'localhost' }, function (err, port) {
        if (err) throw err;
        _this2.kernelGateway = (0, _child_process.spawn)('jupyter', ['kernelgateway', '--KernelGatewayApp.ip=localhost', '--KernelGatewayApp.port=' + port], {
          cwd: atom.project.getPaths()[0]
        });
        _this2.kernelGateway.stdout.on('data', function (data) {
          console.log('kernelGateway.stdout  ' + data);
        });
        _this2.kernelGateway.stderr.on('data', function (data) {
          console.log('kernelGateway.stderr ' + data);
          if (data.toString().includes('The Jupyter Kernel Gateway is running at')) {
            (0, _jupyterJsServices.getKernelSpecs)({ baseUrl: 'http://localhost:' + port }).then(function (kernelSpecs) {
              var spec = Object.keys(kernelSpecs.kernelspecs).find(function (kernel) {
                return kernelSpecs.kernelspecs[kernel].spec.language === language;
              });
              console.log('Kernel: ', spec);
              if (spec) {
                (0, _jupyterJsServices.startNewKernel)({
                  baseUrl: 'http://localhost:' + port,
                  wsUrl: 'ws://localhost:' + port,
                  name: spec
                }).then(function (kernel) {
                  _this2.session = kernel;
                });
              }
            });
          }
        });
        _this2.kernelGateway.on('close', function (code) {
          console.log('kernelGateway.close ' + code);
        });
        _this2.kernelGateway.on('exit', function (code) {
          console.log('kernelGateway.exit ' + code);
        });
      });
    }
  }, {
    key: 'makeOutputBundle',
    value: function makeOutputBundle(msg) {
      var json = {};
      json.output_type = msg.header.msg_type;
      switch (json.output_type) {
        case 'clear_output':
          // msg spec v4 had stdout, stderr, display keys
          // v4.1 replaced these with just wait
          // The default behavior is the same (stdout=stderr=display=True, wait=False),
          // so v4 messages will still be properly handled,
          // except for the rarely used clearing less than all output.
          console.log('Not handling clear message!');
          this.clear_output(msg.content.wait || false);
          return;
        case 'stream':
          json.text = msg.content.text.match(/[^\n]+(?:\r?\n|$)/g);
          json.name = msg.content.name;
          break;
        case 'display_data':
          json.data = Object.keys(msg.content.data).reduce(function (result, key) {
            result[key] = msg.content.data[key].match(/[^\n]+(?:\r?\n|$)/g);
            return result;
          }, {});
          json.metadata = msg.content.metadata;
          break;
        case 'execute_result':
          json.data = Object.keys(msg.content.data).reduce(function (result, key) {
            result[key] = msg.content.data[key].match(/[^\n]+(?:\r?\n|$)/g);
            return result;
          }, {});
          json.metadata = msg.content.metadata;
          json.execution_count = msg.content.execution_count;
          break;
        case 'error':
          json.ename = msg.content.ename;
          json.evalue = msg.content.evalue;
          json.traceback = msg.content.traceback;
          break;
        case 'status':
        case 'execute_input':
          return false;
        default:
          console.log('unhandled output message', msg);
          return false;
      }
      return json;
    }
  }, {
    key: 'save',
    value: function save() {
      this.saveAs(this.getPath());
    }
  }, {
    key: 'saveAs',
    value: function saveAs(uri) {
      var nbData = this.asJSON();
      try {
        _fsPlus2['default'].writeFileSync(uri, nbData);
        this.modified = false;
      } catch (e) {
        console.error(e.stack);
        debugger;
      }
      this.emitter.emit('did-change-modified');
    }
  }, {
    key: 'asJSON',
    value: function asJSON() {
      return JSON.stringify(this.state.toJSON(), null, 4);
    }
  }, {
    key: 'shouldPromptToSave',
    value: function shouldPromptToSave() {
      return this.isModified();
    }
  }, {
    key: 'getSaveDialogOptions',
    value: function getSaveDialogOptions() {
      return {};
    }
  }, {
    key: 'isModified',

    // modifiedCallbacks = [];

    value: function isModified() {
      return this.modified;
    }
  }, {
    key: 'setModified',
    value: function setModified(modified) {
      // console.log('setting modified');
      this.modified = modified;
      this.emitter.emit('did-change-modified');
    }
  }, {
    key: 'onDidChangeModified',
    value: function onDidChangeModified(callback) {
      return this.emitter.on('did-change-modified', callback);
    }

    //----------------------------------------
    // Listeners, currently never called
    //----------------------------------------

  }, {
    key: 'onDidChange',
    value: function onDidChange(callback) {
      return this.emitter.on('did-change', callback);
    }
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle(callback) {
      return this.emitter.on('did-change-title', callback);
    }

    //----------------------------------------
    // Various info-fetching methods
    //----------------------------------------

  }, {
    key: 'getTitle',
    value: function getTitle() {
      var filePath = this.getPath();
      if (filePath !== undefined && filePath !== null) {
        return _path2['default'].basename(filePath);
      } else {
        return 'untitled';
      }
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      // console.log('getURI called');
      return this.getPath();
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      // console.log('getPath called');
      return this.file.getPath();
    }
  }, {
    key: 'isEqual',
    value: function isEqual(other) {
      return other instanceof ImageEditor && this.getURI() == other.getURI();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this3 = this;

      console.log('destroy called');
      if (this.subscriptions) this.subscriptions.dispose();
      if (this.session) {
        this.session.shutdown().then(function () {
          _this3.kernelGateway.stdin.pause();
          _this3.kernelGateway.kill();
        });
      }
    }

    //----------------------------------------
    // Serialization (one of these days...)
    //----------------------------------------

    // static deserialize({filePath}) {
    //     if (fs.isFileSync(filePath)) {
    //         new NotebookEditor(filePath);
    //     } else {
    //         console.warn(`Could not deserialize notebook editor for path \
    //                      '${filePath}' because that file no longer exists.`);
    //     }
    // }

    // serialize() {
    //     return {
    //         filePath: this.getPath(),
    //         deserializer: this.constructor.name
    //     }
    // }

  }]);

  return NotebookEditor;
})();

exports['default'] = NotebookEditor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvbm90ZWJvb2stZWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OzswQkFDQSxZQUFZOzs7O3NCQUNwQixTQUFTOzs7O3FCQUNOLE9BQU87Ozs7b0JBQ1IsTUFBTTs7Ozt5QkFDRCxXQUFXOzs7O29CQUNDLE1BQU07OzJCQUNyQixhQUFhOzt3QkFDVixXQUFXOztpQ0FNMUIscUJBQXFCOzs4QkFDQyxnQkFBZ0I7O2tCQUM5QixJQUFJOzs7OzZCQUlaLGVBQWU7OzBCQUNDLGNBQWM7Ozs7a0NBQ04sd0JBQXdCOzs7OzRCQUM5QixpQkFBaUI7Ozs7QUF6QjFDLFdBQVcsQ0FBQzs7QUEwQlosTUFBTSxDQUFDLGNBQWMsaUNBQWlCLENBQUM7QUFDdkMsTUFBTSxDQUFDLFNBQVMsa0JBQUssQ0FBQzs7SUFFRCxjQUFjO0FBRXBCLFdBRk0sY0FBYyxDQUVuQixHQUFHLEVBQUU7OzswQkFGQSxjQUFjOztTQXNCL0IsUUFBUSxHQUFHLFVBQUMsT0FBTyxFQUFLO0FBQ3RCLGFBQU8sQ0FBQyxHQUFHLGVBQVksT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsa0NBQThCLENBQUM7O0FBRW5GLFVBQUksUUFBUSxZQUFBO1VBQ1IsU0FBUyxZQUFBO1VBQ1QsSUFBSSxZQUFBLENBQUM7QUFDVCxjQUFRLE9BQU8sQ0FBQyxVQUFVO0FBQ3hCLGFBQUssd0JBQVcsT0FBTyxDQUFDLFFBQVE7QUFDOUIsY0FBSSxPQUFPLEdBQUcsdUJBQVUsTUFBTSxDQUFDO0FBQzdCLHFCQUFTLEVBQUUsTUFBTTtBQUNqQiwyQkFBZSxFQUFFLElBQUk7QUFDckIsb0JBQVEsRUFBRTtBQUNSLHVCQUFTLEVBQUUsS0FBSzthQUNqQjtBQUNELG1CQUFPLEVBQUUsRUFBRTtBQUNYLGtCQUFNLEVBQUUsRUFBRTtXQUNYLENBQUMsQ0FBQztBQUNILGdCQUFL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QUFDO0tBQ3REOzs7Ozs7OztXQU1PLG9CQUFHO0FBQ1QsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQy9DLGVBQU8sa0JBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2hDLE1BQU07QUFDTCxlQUFPLFVBQVUsQ0FBQztPQUNuQjtLQUNGOzs7V0FFSyxrQkFBRzs7QUFFUCxhQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2Qjs7O1dBRU0sbUJBQUc7O0FBRVIsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCOzs7V0FFTSxpQkFBQyxLQUFLLEVBQUU7QUFDYixhQUFRLEtBQUssWUFBWSxXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBRTtLQUMxRTs7O1dBRU0sbUJBQUc7OztBQUNSLGFBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM5QixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyRCxVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNqQyxpQkFBSyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2pDLGlCQUFLLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMzQixDQUFDLENBQUM7T0FDSjtLQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0ExWWdCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvbm90ZWJvb2stZWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHBvcnRmaW5kZXIgZnJvbSAncG9ydGZpbmRlcic7XG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHV1aWQgZnJvbSAndXVpZCc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtGaWxlfSBmcm9tICdwYXRod2F0Y2hlcic7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge1xuICBsaXN0UnVubmluZ0tlcm5lbHMsXG4gIGNvbm5lY3RUb0tlcm5lbCxcbiAgc3RhcnROZXdLZXJuZWwsXG4gIGdldEtlcm5lbFNwZWNzXG59IGZyb20gJ2p1cHl0ZXItanMtc2VydmljZXMnO1xuaW1wb3J0IHtYTUxIdHRwUmVxdWVzdH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0IHdzIGZyb20gJ3dzJztcbmltcG9ydCB7XG4gIHNwYXduLFxuICBleGVjU3luY1xufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQgTm90ZWJvb2tFZGl0b3JWaWV3IGZyb20gJy4vbm90ZWJvb2stZWRpdG9yLXZpZXcnO1xuaW1wb3J0IE5vdGVib29rQ2VsbCBmcm9tICcuL25vdGVib29rLWNlbGwnO1xuZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0ID0gWE1MSHR0cFJlcXVlc3Q7XG5nbG9iYWwuV2ViU29ja2V0ID0gd3M7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdGVib29rRWRpdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yKHVyaSkge1xuICAgICAgY29uc29sZS5sb2coJ05vdGVib29rRWRpdG9yIGNyZWF0ZWQgZm9yJywgdXJpKTtcbiAgICAgIHRoaXMubG9hZE5vdGVib29rRmlsZSh1cmkpO1xuICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgICB0aGlzLmxhdW5jaEtlcm5lbEdhdGV3YXkoKTtcbiAgICAgIERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAvL1RPRE86IHJlbW92ZSB0aGVzZSBkZXZlbG9wbWVudCBoYW5kbGVzXG4gICAgICBnbG9iYWwuZWRpdG9yID0gdGhpcztcbiAgICAgIGdsb2JhbC5EaXNwYXRjaGVyID0gRGlzcGF0Y2hlcjtcbiAgICB9XG5cbiAgICBmaW5kQ2VsbEJ5SUQoaWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmdldCgnY2VsbHMnKS5maW5kRW50cnkoY2VsbCA9PiBjZWxsLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSkgPT0gaWQpO1xuICAgIH1cblxuICAgIGZpbmRBY3RpdmVDZWxsKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZ2V0KCdjZWxscycpLmZpbmRFbnRyeShjZWxsID0+IGNlbGwuZ2V0SW4oWydtZXRhZGF0YScsICdmb2N1cyddKSk7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coYEFjdGlvbiAnJHtwYXlsb2FkLmFjdGlvblR5cGUudG9TdHJpbmcoKX0ncmVjZWl2ZWQgaW4gTm90ZWJvb2tFZGl0b3JgKTtcbiAgICAgIC8vIFRPRE86IGFkZCBhIG5vdGVib29rIElEIGZpZWxkIHRvIGV2ZW50cyBhbmQgZmlsdGVyIG9uIGl0XG4gICAgICBsZXQgY2VsbEluZm8sXG4gICAgICAgICAgY2VsbEluZGV4LFxuICAgICAgICAgIGNlbGw7XG4gICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIERpc3BhdGNoZXIuYWN0aW9ucy5hZGRfY2VsbDpcbiAgICAgICAgICBsZXQgbmV3Q2VsbCA9IEltbXV0YWJsZS5mcm9tSlMoe1xuICAgICAgICAgICAgY2VsbF90eXBlOiAnY29kZScsXG4gICAgICAgICAgICBleGVjdXRpb25fY291bnQ6IG51bGwsXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3V0cHV0czogW10sXG4gICAgICAgICAgICBzb3VyY2U6IFtdXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUuc2V0KCdjZWxscycsIHRoaXMuc3RhdGUuZ2V0KCdjZWxscycpLnB1c2gobmV3Q2VsbCkpO1xuICAgICAgICAgIHRoaXMuc2V0TW9kaWZpZWQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMuY2VsbF9zb3VyY2VfY2hhbmdlZDpcbiAgICAgICAgICBjZWxsSW5mbyA9IHRoaXMuZmluZENlbGxCeUlEKHBheWxvYWQuY2VsbElEKTtcbiAgICAgICAgICBpZiAoIWNlbGxJbmZvIHx8IGNlbGxJbmZvID09PSB1bmRlZmluZWQgfHwgY2VsbEluZm8gPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBjb25zb2xlLmxvZygnTWVzc2FnZSBpcyBmb3IgYW5vdGhlciBub3RlYm9vaycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBbY2VsbEluZGV4LCBjZWxsXSA9IGNlbGxJbmZvO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZS5zZXRJbihbJ2NlbGxzJywgY2VsbEluZGV4LCAnc291cmNlJ10sIHBheWxvYWQuc291cmNlKTtcbiAgICAgICAgICB0aGlzLnNldE1vZGlmaWVkKHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERpc3BhdGNoZXIuYWN0aW9ucy5jZWxsX2ZvY3VzOlxuICAgICAgICAgIGxldCBhY3RpdmVDZWxsSW5mbyA9IHRoaXMuZmluZEFjdGl2ZUNlbGwoKTtcbiAgICAgICAgICBpZiAoIWFjdGl2ZUNlbGxJbmZvIHx8IGFjdGl2ZUNlbGxJbmZvID09PSB1bmRlZmluZWQgfHwgYWN0aXZlQ2VsbEluZm8gPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBjb25zb2xlLmxvZygnTWVzc2FnZSBpcyBmb3IgYW5vdGhlciBub3RlYm9vaycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBbYWN0aXZlQ2VsbEluZGV4LCBhY3RpdmVDZWxsXSA9IGFjdGl2ZUNlbGxJbmZvO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYENlbGwgaXMgYXQgaW5kZXggJHtjZWxsSW5kZXh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlLnNldEluKFsnY2VsbHMnLCBhY3RpdmVDZWxsSW5kZXgsICdtZXRhZGF0YScsICdmb2N1cyddLCBmYWxzZSk7XG4gICAgICAgICAgY2VsbEluZm8gPSB0aGlzLmZpbmRDZWxsQnlJRChwYXlsb2FkLmNlbGxJRCk7XG4gICAgICAgICAgaWYgKCFjZWxsSW5mbyB8fCBjZWxsSW5mbyA9PT0gdW5kZWZpbmVkIHx8IGNlbGxJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coJ01lc3NhZ2UgaXMgZm9yIGFub3RoZXIgbm90ZWJvb2snKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgW2NlbGxJbmRleCwgY2VsbF0gPSBjZWxsSW5mbztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUuc2V0SW4oWydjZWxscycsIGNlbGxJbmRleCwgJ21ldGFkYXRhJywgJ2ZvY3VzJ10sIHBheWxvYWQuaXNGb2N1c2VkKTtcbiAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERpc3BhdGNoZXIuYWN0aW9ucy5ydW5fY2VsbDpcbiAgICAgICAgICB0aGlzLnJ1bkNlbGwodGhpcy5maW5kQ2VsbEJ5SUQocGF5bG9hZC5jZWxsSUQpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMucnVuX2FjdGl2ZV9jZWxsOlxuICAgICAgICAgIHRoaXMucnVuQ2VsbCh0aGlzLmZpbmRBY3RpdmVDZWxsKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERpc3BhdGNoZXIuYWN0aW9ucy5vdXRwdXRfcmVjZWl2ZWQ6XG4gICAgICAgICAgY2VsbEluZm8gPSB0aGlzLmZpbmRDZWxsQnlJRChwYXlsb2FkLmNlbGxJRCk7XG4gICAgICAgICAgaWYgKCFjZWxsSW5mbyB8fCBjZWxsSW5mbyA9PT0gdW5kZWZpbmVkIHx8IGNlbGxJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coJ01lc3NhZ2UgaXMgZm9yIGFub3RoZXIgbm90ZWJvb2snKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgW2NlbGxJbmRleCwgY2VsbF0gPSBjZWxsSW5mbztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coJ291dHB1dF9yZWNlaXZlZCcsIHBheWxvYWQubWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICBsZXQgb3V0cHV0QnVuZGxlID0gdGhpcy5tYWtlT3V0cHV0QnVuZGxlKHBheWxvYWQubWVzc2FnZSk7XG4gICAgICAgICAgaWYgKG91dHB1dEJ1bmRsZSkge1xuICAgICAgICAgICAgbGV0IG91dHB1dHMgPSB0aGlzLnN0YXRlLmdldEluKFsnY2VsbHMnLCBjZWxsSW5kZXgsICdvdXRwdXRzJ10pLnRvSlMoKTtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IG91dHB1dHMuZmluZEluZGV4KG91dHB1dCA9PiBvdXRwdXQub3V0cHV0X3R5cGUgPT09IG91dHB1dEJ1bmRsZS5vdXRwdXRfdHlwZSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICBpZiAob3V0cHV0QnVuZGxlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRzW2luZGV4XS5kYXRhID0gb3V0cHV0c1tpbmRleF0uZGF0YS5jb25jYXQob3V0cHV0QnVuZGxlLmRhdGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChvdXRwdXRCdW5kbGUudGV4dCkge1xuICAgICAgICAgICAgICAgIGlmIChvdXRwdXRzW2luZGV4XS5uYW1lID09PSBvdXRwdXRCdW5kbGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgb3V0cHV0c1tpbmRleF0udGV4dCA9IG91dHB1dHNbaW5kZXhdLnRleHQuY29uY2F0KG91dHB1dEJ1bmRsZS50ZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgb3V0cHV0cyA9IG91dHB1dHMuY29uY2F0KG91dHB1dEJ1bmRsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvdXRwdXRzID0gb3V0cHV0cy5jb25jYXQob3V0cHV0QnVuZGxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBleGVjdXRpb25fY291bnQgPSB0aGlzLnN0YXRlLmdldEluKFsnY2VsbHMnLCBjZWxsSW5kZXgsICdleGVjdXRpb25fY291bnQnXSk7XG4gICAgICAgICAgICBpZiAob3V0cHV0QnVuZGxlLmV4ZWN1dGlvbl9jb3VudCkgZXhlY3V0aW9uX2NvdW50ID0gb3V0cHV0QnVuZGxlLmV4ZWN1dGlvbl9jb3VudDtcbiAgICAgICAgICAgIGxldCBuZXdDZWxsID0gdGhpcy5zdGF0ZS5nZXRJbihbJ2NlbGxzJywgY2VsbEluZGV4XSkubWVyZ2Uoe1xuICAgICAgICAgICAgICBleGVjdXRpb25fY291bnQsXG4gICAgICAgICAgICAgIG91dHB1dHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUuc2V0SW4oWydjZWxscycsIGNlbGxJbmRleF0sIG5ld0NlbGwpO1xuICAgICAgICAgICAgdGhpcy5zZXRNb2RpZmllZCh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERpc3BhdGNoZXIuYWN0aW9ucy5pbnRlcnJ1cHRfa2VybmVsOlxuICAgICAgICAgIGlmICh0aGlzLnNlc3Npb24gPT09IHVuZGVmaW5lZCB8fCB0aGlzLnNlc3Npb24gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2F0b20tbm90ZWJvb2snLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogJ05vIHJ1bm5pbmcgSnVweXRlciBzZXNzaW9uLiBUcnkgY2xvc2luZyBhbmQgcmUtb3BlbmluZyB0aGlzIGZpbGUuJyxcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnNlc3Npb24uaW50ZXJydXB0KCkudGhlbigoKSA9PiBjb25zb2xlLmxvZygndGhpcy5zZXNzaW9uLmludGVycnVwdCcpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMuZGVzdHJveTpcbiAgICAgICAgICBpZiAodGhpcy5zZXNzaW9uID09PSB1bmRlZmluZWQgfHwgdGhpcy5zZXNzaW9uID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdhdG9tLW5vdGVib29rJywge1xuICAgICAgICAgICAgICBkZXRhaWw6ICdObyBydW5uaW5nIEp1cHl0ZXIgc2Vzc2lvbi4gVHJ5IGNsb3NpbmcgYW5kIHJlLW9wZW5pbmcgdGhpcyBmaWxlLicsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVzdHJveSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJ1bkNlbGwoY2VsbEluZm8pIHtcbiAgICAgIGxldCBmdXR1cmUsIHRpbWVyO1xuICAgICAgaWYgKCFjZWxsSW5mbyB8fCBjZWxsSW5mbyA9PT0gdW5kZWZpbmVkIHx8IGNlbGxJbmZvID09PSBudWxsKSB7XG4gICAgICAgIC8vIHJldHVybiBjb25zb2xlLmxvZygnTWVzc2FnZSBpcyBmb3IgYW5vdGhlciBub3RlYm9vaycpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBbY2VsbEluZGV4LCBjZWxsXSA9IGNlbGxJbmZvO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgQ2VsbCBpcyBhdCBpbmRleCAke2NlbGxJbmRleH1gKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlc3Npb24gPT09IHVuZGVmaW5lZCB8fCB0aGlzLnNlc3Npb24gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXRvbS1ub3RlYm9vaycsIHtcbiAgICAgICAgICBkZXRhaWw6ICdObyBydW5uaW5nIEp1cHl0ZXIgc2Vzc2lvbi4gVHJ5IGNsb3NpbmcgYW5kIHJlLW9wZW5pbmcgdGhpcyBmaWxlLicsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoY2VsbC5nZXQoJ2NlbGxfdHlwZScpICE9PSAnY29kZScpIHJldHVybjtcbiAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlLnNldEluKFsnY2VsbHMnLCBjZWxsSW5kZXgsICdvdXRwdXRzJ10sIEltbXV0YWJsZS5MaXN0KCkpO1xuICAgICAgZnV0dXJlID0gdGhpcy5zZXNzaW9uLmV4ZWN1dGUoe2NvZGU6IGNlbGwuZ2V0KCdzb3VyY2UnKX0sIGZhbHNlKTtcbiAgICAgIGZ1dHVyZS5vbkRvbmUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvdXRwdXRfcmVjZWl2ZWQnLCAnZG9uZScpO1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gZnV0dXJlLmRpc3Bvc2UoKSwgMzAwMCk7XG4gICAgICB9XG4gICAgICBmdXR1cmUub25JT1B1YiA9IChtc2cpID0+IHtcbiAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLm91dHB1dF9yZWNlaXZlZCxcbiAgICAgICAgICBjZWxsSUQ6IGNlbGwuZ2V0SW4oWydtZXRhZGF0YScsICdpZCddKSxcbiAgICAgICAgICBtZXNzYWdlOiBtc2dcbiAgICAgICAgfSk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIGFkZFN0YXRlQ2hhbmdlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3N0YXRlLWNoYW5nZWQnLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3N0YXRlLWNoYW5nZWQnKTtcbiAgICB9XG5cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICAgIH1cblxuICAgIGxvYWROb3RlYm9va0ZpbGUodXJpKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnTE9BRCBOT1RFQk9PSyBGSUxFJyk7XG4gICAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZSh1cmkpO1xuICAgICAgbGV0IHBhcnNlZEZpbGUgPSB0aGlzLnBhcnNlTm90ZWJvb2tGaWxlKHRoaXMuZmlsZSk7XG4gICAgICBpZiAocGFyc2VkRmlsZS5jZWxscykge1xuICAgICAgICBwYXJzZWRGaWxlLmNlbGxzID0gcGFyc2VkRmlsZS5jZWxscy5tYXAoY2VsbCA9PiB7XG4gICAgICAgICAgY2VsbC5tZXRhZGF0YS5pZCA9IHV1aWQudjQoKTtcbiAgICAgICAgICBjZWxsLm1ldGFkYXRhLmZvY3VzID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGNlbGw7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkRmlsZS5jZWxscyA9IFtcbiAgICAgICAgIHtcbiAgICAgICAgICBjZWxsX3R5cGU6ICdjb2RlJyxcbiAgICAgICAgICBleGVjdXRpb25fY291bnQ6IG51bGwsXG4gICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvdXRwdXRzOiBbXSxcbiAgICAgICAgICBzb3VyY2U6IFtdXG4gICAgICAgICB9XG4gICAgICAgXTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWRGaWxlLmNlbGxzLmxlbmd0aCA+IDApIHBhcnNlZEZpbGUuY2VsbHNbMF0ubWV0YWRhdGEuZm9jdXMgPSB0cnVlO1xuICAgICAgdGhpcy5zdGF0ZSA9IEltbXV0YWJsZS5mcm9tSlMocGFyc2VkRmlsZSk7XG4gICAgfVxuXG4gICAgcGFyc2VOb3RlYm9va0ZpbGUoZmlsZSkge1xuICAgICAgbGV0IGZpbGVTdHJpbmcgPSB0aGlzLmZpbGUucmVhZFN5bmMoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpbGVTdHJpbmcpO1xuICAgIH1cblxuICAgIGxhdW5jaEtlcm5lbEdhdGV3YXkoKSB7XG4gICAgICBsZXQgbGFuZ3VhZ2UgPSB0aGlzLnN0YXRlLmdldEluKFsnbWV0YWRhdGEnLCAna2VybmVsc3BlYycsICdsYW5ndWFnZSddKTtcbiAgICAgIHBvcnRmaW5kZXIuYmFzZVBvcnQgPSA4ODg4O1xuICAgICAgcG9ydGZpbmRlci5nZXRQb3J0KHtob3N0OiAnbG9jYWxob3N0J30sIChlcnIsIHBvcnQpID0+IHtcbiAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICB0aGlzLmtlcm5lbEdhdGV3YXkgPSBzcGF3bignanVweXRlcicsIFsna2VybmVsZ2F0ZXdheScsICctLUtlcm5lbEdhdGV3YXlBcHAuaXA9bG9jYWxob3N0JywgYC0tS2VybmVsR2F0ZXdheUFwcC5wb3J0PSR7cG9ydH1gXSwge1xuICAgICAgICAgIGN3ZDogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMua2VybmVsR2F0ZXdheS5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdrZXJuZWxHYXRld2F5LnN0ZG91dCAgJyArIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5rZXJuZWxHYXRld2F5LnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2tlcm5lbEdhdGV3YXkuc3RkZXJyICcgKyBkYXRhKTtcbiAgICAgICAgICBpZiAoZGF0YS50b1N0cmluZygpLmluY2x1ZGVzKCdUaGUgSnVweXRlciBLZXJuZWwgR2F0ZXdheSBpcyBydW5uaW5nIGF0JykpIHtcbiAgICAgICAgICAgIGdldEtlcm5lbFNwZWNzKHtiYXNlVXJsOiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YH0pLnRoZW4oKGtlcm5lbFNwZWNzKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBzcGVjID0gT2JqZWN0LmtleXMoa2VybmVsU3BlY3Mua2VybmVsc3BlY3MpLmZpbmQoa2VybmVsID0+IGtlcm5lbFNwZWNzLmtlcm5lbHNwZWNzW2tlcm5lbF0uc3BlYy5sYW5ndWFnZSA9PT0gbGFuZ3VhZ2UpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnS2VybmVsOiAnLCBzcGVjKTtcbiAgICAgICAgICAgICAgaWYgKHNwZWMpIHtcbiAgICAgICAgICAgICAgICBzdGFydE5ld0tlcm5lbCh7XG4gICAgICAgICAgICAgICAgICBiYXNlVXJsOiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCxcbiAgICAgICAgICAgICAgICAgIHdzVXJsOiBgd3M6Ly9sb2NhbGhvc3Q6JHtwb3J0fWAsXG4gICAgICAgICAgICAgICAgICBuYW1lOiBzcGVjXG4gICAgICAgICAgICAgICAgfSkudGhlbigoa2VybmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnNlc3Npb24gPSBrZXJuZWw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMua2VybmVsR2F0ZXdheS5vbignY2xvc2UnLCAgKGNvZGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygna2VybmVsR2F0ZXdheS5jbG9zZSAnICsgY29kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmtlcm5lbEdhdGV3YXkub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdrZXJuZWxHYXRld2F5LmV4aXQgJyArIGNvZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VPdXRwdXRCdW5kbGUobXNnKSB7XG4gIFx0XHRsZXQganNvbiA9IHt9O1xuICBcdFx0anNvbi5vdXRwdXRfdHlwZSA9IG1zZy5oZWFkZXIubXNnX3R5cGU7XG4gIFx0XHRzd2l0Y2ggKGpzb24ub3V0cHV0X3R5cGUpIHtcbiAgXHRcdFx0Y2FzZSAnY2xlYXJfb3V0cHV0JzpcbiAgXHRcdFx0XHQvLyBtc2cgc3BlYyB2NCBoYWQgc3Rkb3V0LCBzdGRlcnIsIGRpc3BsYXkga2V5c1xuICBcdFx0XHRcdC8vIHY0LjEgcmVwbGFjZWQgdGhlc2Ugd2l0aCBqdXN0IHdhaXRcbiAgXHRcdFx0XHQvLyBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0aGUgc2FtZSAoc3Rkb3V0PXN0ZGVycj1kaXNwbGF5PVRydWUsIHdhaXQ9RmFsc2UpLFxuICBcdFx0XHRcdC8vIHNvIHY0IG1lc3NhZ2VzIHdpbGwgc3RpbGwgYmUgcHJvcGVybHkgaGFuZGxlZCxcbiAgXHRcdFx0XHQvLyBleGNlcHQgZm9yIHRoZSByYXJlbHkgdXNlZCBjbGVhcmluZyBsZXNzIHRoYW4gYWxsIG91dHB1dC5cbiAgXHRcdFx0XHRjb25zb2xlLmxvZygnTm90IGhhbmRsaW5nIGNsZWFyIG1lc3NhZ2UhJyk7XG4gIFx0XHRcdFx0dGhpcy5jbGVhcl9vdXRwdXQobXNnLmNvbnRlbnQud2FpdCB8fCBmYWxzZSk7XG4gIFx0XHRcdFx0cmV0dXJuO1xuICBcdFx0XHRjYXNlICdzdHJlYW0nOlxuICBcdFx0XHRcdGpzb24udGV4dCA9IG1zZy5jb250ZW50LnRleHQubWF0Y2goL1teXFxuXSsoPzpcXHI/XFxufCQpL2cpO1xuICBcdFx0XHRcdGpzb24ubmFtZSA9IG1zZy5jb250ZW50Lm5hbWU7XG4gIFx0XHRcdFx0YnJlYWs7XG4gIFx0XHRcdGNhc2UgJ2Rpc3BsYXlfZGF0YSc6XG4gIFx0XHRcdFx0anNvbi5kYXRhID0gT2JqZWN0LmtleXMobXNnLmNvbnRlbnQuZGF0YSkucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBtc2cuY29udGVudC5kYXRhW2tleV0ubWF0Y2goL1teXFxuXSsoPzpcXHI/XFxufCQpL2cpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9LCB7fSk7XG4gIFx0XHRcdFx0anNvbi5tZXRhZGF0YSA9IG1zZy5jb250ZW50Lm1ldGFkYXRhO1xuICBcdFx0XHRcdGJyZWFrO1xuICBcdFx0XHRjYXNlICdleGVjdXRlX3Jlc3VsdCc6XG4gIFx0XHRcdFx0anNvbi5kYXRhID0gT2JqZWN0LmtleXMobXNnLmNvbnRlbnQuZGF0YSkucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBtc2cuY29udGVudC5kYXRhW2tleV0ubWF0Y2goL1teXFxuXSsoPzpcXHI/XFxufCQpL2cpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9LCB7fSk7XG4gIFx0XHRcdFx0anNvbi5tZXRhZGF0YSA9IG1zZy5jb250ZW50Lm1ldGFkYXRhO1xuICBcdFx0XHRcdGpzb24uZXhlY3V0aW9uX2NvdW50ID0gbXNnLmNvbnRlbnQuZXhlY3V0aW9uX2NvdW50O1xuICBcdFx0XHRcdGJyZWFrO1xuICBcdFx0XHRjYXNlICdlcnJvcic6XG4gIFx0XHRcdFx0anNvbi5lbmFtZSA9IG1zZy5jb250ZW50LmVuYW1lO1xuICBcdFx0XHRcdGpzb24uZXZhbHVlID0gbXNnLmNvbnRlbnQuZXZhbHVlO1xuICBcdFx0XHRcdGpzb24udHJhY2ViYWNrID0gbXNnLmNvbnRlbnQudHJhY2ViYWNrO1xuICBcdFx0XHRcdGJyZWFrO1xuICBcdFx0XHRjYXNlICdzdGF0dXMnOlxuICBcdFx0XHRjYXNlICdleGVjdXRlX2lucHV0JzpcbiAgXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG4gIFx0XHRcdGRlZmF1bHQ6XG4gIFx0XHRcdFx0Y29uc29sZS5sb2coJ3VuaGFuZGxlZCBvdXRwdXQgbWVzc2FnZScsIG1zZyk7XG4gIFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuICBcdFx0fVxuICAgICAgcmV0dXJuIGpzb247XG4gIFx0fVxuXG4gICAgc2F2ZSgpIHtcbiAgICAgIHRoaXMuc2F2ZUFzKHRoaXMuZ2V0UGF0aCgpKTtcbiAgICB9XG5cbiAgICBzYXZlQXModXJpKSB7XG4gICAgICBsZXQgbmJEYXRhID0gdGhpcy5hc0pTT04oKVxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh1cmksIG5iRGF0YSk7XG4gICAgICAgIHRoaXMubW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUuc3RhY2spO1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1vZGlmaWVkJyk7XG4gICAgfVxuXG4gICAgYXNKU09OKCkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUudG9KU09OKCksIG51bGwsIDQpO1xuICAgIH1cblxuICAgIHNob3VsZFByb21wdFRvU2F2ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmlzTW9kaWZpZWQoKTtcbiAgICB9XG5cbiAgICBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBtb2RpZmllZCA9IGZhbHNlO1xuICAgIC8vIG1vZGlmaWVkQ2FsbGJhY2tzID0gW107XG5cbiAgICBpc01vZGlmaWVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMubW9kaWZpZWQ7XG4gICAgfVxuXG4gICAgc2V0TW9kaWZpZWQobW9kaWZpZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzZXR0aW5nIG1vZGlmaWVkJyk7XG4gICAgICB0aGlzLm1vZGlmaWVkID0gbW9kaWZpZWQ7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tb2RpZmllZCcpO1xuICAgIH1cblxuICAgIG9uRGlkQ2hhbmdlTW9kaWZpZWQoY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbW9kaWZpZWQnLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTGlzdGVuZXJzLCBjdXJyZW50bHkgbmV2ZXIgY2FsbGVkXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBvbkRpZENoYW5nZShjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFZhcmlvdXMgaW5mby1mZXRjaGluZyBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBnZXRUaXRsZSgpIHtcbiAgICAgIGxldCBmaWxlUGF0aCA9IHRoaXMuZ2V0UGF0aCgpO1xuICAgICAgaWYgKGZpbGVQYXRoICE9PSB1bmRlZmluZWQgJiYgZmlsZVBhdGggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd1bnRpdGxlZCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VVJJKCkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2dldFVSSSBjYWxsZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBnZXRQYXRoKCkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2dldFBhdGggY2FsbGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBpc0VxdWFsKG90aGVyKSB7XG4gICAgICByZXR1cm4gKG90aGVyIGluc3RhbmNlb2YgSW1hZ2VFZGl0b3IgJiYgdGhpcy5nZXRVUkkoKSA9PSBvdGhlci5nZXRVUkkoKSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdkZXN0cm95IGNhbGxlZCcpO1xuICAgICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIGlmICh0aGlzLnNlc3Npb24pIHtcbiAgICAgICAgdGhpcy5zZXNzaW9uLnNodXRkb3duKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5rZXJuZWxHYXRld2F5LnN0ZGluLnBhdXNlKCk7XG4gICAgICAgICAgdGhpcy5rZXJuZWxHYXRld2F5LmtpbGwoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gU2VyaWFsaXphdGlvbiAob25lIG9mIHRoZXNlIGRheXMuLi4pXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBzdGF0aWMgZGVzZXJpYWxpemUoe2ZpbGVQYXRofSkge1xuICAgIC8vICAgICBpZiAoZnMuaXNGaWxlU3luYyhmaWxlUGF0aCkpIHtcbiAgICAvLyAgICAgICAgIG5ldyBOb3RlYm9va0VkaXRvcihmaWxlUGF0aCk7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICBjb25zb2xlLndhcm4oYENvdWxkIG5vdCBkZXNlcmlhbGl6ZSBub3RlYm9vayBlZGl0b3IgZm9yIHBhdGggXFxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAnJHtmaWxlUGF0aH0nIGJlY2F1c2UgdGhhdCBmaWxlIG5vIGxvbmdlciBleGlzdHMuYCk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG5cbiAgICAvLyBzZXJpYWxpemUoKSB7XG4gICAgLy8gICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICBmaWxlUGF0aDogdGhpcy5nZXRQYXRoKCksXG4gICAgLy8gICAgICAgICBkZXNlcmlhbGl6ZXI6IHRoaXMuY29uc3RydWN0b3IubmFtZVxuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG59XG5cbi8vIGF0b20uZGVzZXJpYWxpemVycy5hZGQoTm90ZWJvb2tFZGl0b3IpO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/notebook-editor.js
