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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9ub3RlYm9vay1lZGl0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7OzBCQUNBLFlBQVk7Ozs7c0JBQ3BCLFNBQVM7Ozs7cUJBQ04sT0FBTzs7OztvQkFDUixNQUFNOzs7O3lCQUNELFdBQVc7Ozs7b0JBQ0MsTUFBTTs7MkJBQ3JCLGFBQWE7O3dCQUNWLFdBQVc7O2lDQU0xQixxQkFBcUI7OzhCQUNDLGdCQUFnQjs7a0JBQzlCLElBQUk7Ozs7NkJBSVosZUFBZTs7MEJBQ0MsY0FBYzs7OztrQ0FDTix3QkFBd0I7Ozs7NEJBQzlCLGlCQUFpQjs7OztBQXpCMUMsV0FBVyxDQUFDOztBQTBCWixNQUFNLENBQUMsY0FBYyxpQ0FBaUIsQ0FBQztBQUN2QyxNQUFNLENBQUMsU0FBUyxrQkFBSyxDQUFDOztJQUVELGNBQWM7QUFFcEIsV0FGTSxjQUFjLENBRW5CLEdBQUcsRUFBRTs7OzBCQUZBLGNBQWM7O1NBc0IvQixRQUFRLEdBQUcsVUFBQyxPQUFPLEVBQUs7QUFDdEIsYUFBTyxDQUFDLEdBQUcsZUFBWSxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxrQ0FBOEIsQ0FBQzs7QUFFbkYsVUFBSSxRQUFRLFlBQUE7VUFDUixTQUFTLFlBQUE7VUFDVCxJQUFJLFlBQUEsQ0FBQztBQUNULGNBQVEsT0FBTyxDQUFDLFVBQVU7QUFDeEIsYUFBSyx3QkFBVyxPQUFPLENBQUMsUUFBUTtBQUM5QixjQUFJLE9BQU8sR0FBRyx1QkFBVSxNQUFNLENBQUM7QUFDN0IscUJBQVMsRUFBRSxNQUFNO0FBQ2pCLDJCQUFlLEVBQUUsSUFBSTtBQUNyQixvQkFBUSxFQUFFO0FBQ1IsdUJBQVMsRUFBRSxLQUFLO2FBQ2pCO0FBQ0QsbUJBQU8sRUFBRSxFQUFFO0FBQ1gsa0JBQU0sRUFBRSxFQUFFO1dBQ1gsQ0FBQyxDQUFDO0FBQ0gsZ0JBQUssS0FB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S0FDdEQ7Ozs7Ozs7O1dBTU8sb0JBQUc7QUFDVCxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxRQUFRLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDL0MsZUFBTyxrQkFBSyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDaEMsTUFBTTtBQUNMLGVBQU8sVUFBVSxDQUFDO09BQ25CO0tBQ0Y7OztXQUVLLGtCQUFHOztBQUVQLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFTSxtQkFBRzs7QUFFUixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7OztXQUVNLGlCQUFDLEtBQUssRUFBRTtBQUNiLGFBQVEsS0FBSyxZQUFZLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFFO0tBQzFFOzs7V0FFTSxtQkFBRzs7O0FBQ1IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzlCLFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JELFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2pDLGlCQUFLLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsaUJBQUssYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzNCLENBQUMsQ0FBQztPQUNKO0tBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQTFZZ0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL1JhZC9Eb2N1bWVudHMvRGV2L2F0b20tbm90ZWJvb2svbGliL25vdGVib29rLWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBwb3J0ZmluZGVyIGZyb20gJ3BvcnRmaW5kZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RmlsZX0gZnJvbSAncGF0aHdhdGNoZXInO1xuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IHtcbiAgbGlzdFJ1bm5pbmdLZXJuZWxzLFxuICBjb25uZWN0VG9LZXJuZWwsXG4gIHN0YXJ0TmV3S2VybmVsLFxuICBnZXRLZXJuZWxTcGVjc1xufSBmcm9tICdqdXB5dGVyLWpzLXNlcnZpY2VzJztcbmltcG9ydCB7WE1MSHR0cFJlcXVlc3R9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCB3cyBmcm9tICd3cyc7XG5pbXBvcnQge1xuICBzcGF3bixcbiAgZXhlY1N5bmNcbn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IE5vdGVib29rRWRpdG9yVmlldyBmcm9tICcuL25vdGVib29rLWVkaXRvci12aWV3JztcbmltcG9ydCBOb3RlYm9va0NlbGwgZnJvbSAnLi9ub3RlYm9vay1jZWxsJztcbmdsb2JhbC5YTUxIdHRwUmVxdWVzdCA9IFhNTEh0dHBSZXF1ZXN0O1xuZ2xvYmFsLldlYlNvY2tldCA9IHdzO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3RlYm9va0VkaXRvciB7XG5cbiAgICBjb25zdHJ1Y3Rvcih1cmkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdOb3RlYm9va0VkaXRvciBjcmVhdGVkIGZvcicsIHVyaSk7XG4gICAgICB0aGlzLmxvYWROb3RlYm9va0ZpbGUodXJpKTtcbiAgICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgdGhpcy5sYXVuY2hLZXJuZWxHYXRld2F5KCk7XG4gICAgICBEaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgLy9UT0RPOiByZW1vdmUgdGhlc2UgZGV2ZWxvcG1lbnQgaGFuZGxlc1xuICAgICAgZ2xvYmFsLmVkaXRvciA9IHRoaXM7XG4gICAgICBnbG9iYWwuRGlzcGF0Y2hlciA9IERpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgZmluZENlbGxCeUlEKGlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5nZXQoJ2NlbGxzJykuZmluZEVudHJ5KGNlbGwgPT4gY2VsbC5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pID09IGlkKTtcbiAgICB9XG5cbiAgICBmaW5kQWN0aXZlQ2VsbCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmdldCgnY2VsbHMnKS5maW5kRW50cnkoY2VsbCA9PiBjZWxsLmdldEluKFsnbWV0YWRhdGEnLCAnZm9jdXMnXSkpO1xuICAgIH1cblxuICAgIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBBY3Rpb24gJyR7cGF5bG9hZC5hY3Rpb25UeXBlLnRvU3RyaW5nKCl9J3JlY2VpdmVkIGluIE5vdGVib29rRWRpdG9yYCk7XG4gICAgICAvLyBUT0RPOiBhZGQgYSBub3RlYm9vayBJRCBmaWVsZCB0byBldmVudHMgYW5kIGZpbHRlciBvbiBpdFxuICAgICAgbGV0IGNlbGxJbmZvLFxuICAgICAgICAgIGNlbGxJbmRleCxcbiAgICAgICAgICBjZWxsO1xuICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMuYWRkX2NlbGw6XG4gICAgICAgICAgbGV0IG5ld0NlbGwgPSBJbW11dGFibGUuZnJvbUpTKHtcbiAgICAgICAgICAgIGNlbGxfdHlwZTogJ2NvZGUnLFxuICAgICAgICAgICAgZXhlY3V0aW9uX2NvdW50OiBudWxsLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgY29sbGFwc2VkOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG91dHB1dHM6IFtdLFxuICAgICAgICAgICAgc291cmNlOiBbXVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlLnNldCgnY2VsbHMnLCB0aGlzLnN0YXRlLmdldCgnY2VsbHMnKS5wdXNoKG5ld0NlbGwpKTtcbiAgICAgICAgICB0aGlzLnNldE1vZGlmaWVkKHRydWUpO1xuICAgICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRGlzcGF0Y2hlci5hY3Rpb25zLmNlbGxfc291cmNlX2NoYW5nZWQ6XG4gICAgICAgICAgY2VsbEluZm8gPSB0aGlzLmZpbmRDZWxsQnlJRChwYXlsb2FkLmNlbGxJRCk7XG4gICAgICAgICAgaWYgKCFjZWxsSW5mbyB8fCBjZWxsSW5mbyA9PT0gdW5kZWZpbmVkIHx8IGNlbGxJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coJ01lc3NhZ2UgaXMgZm9yIGFub3RoZXIgbm90ZWJvb2snKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgW2NlbGxJbmRleCwgY2VsbF0gPSBjZWxsSW5mbztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUuc2V0SW4oWydjZWxscycsIGNlbGxJbmRleCwgJ3NvdXJjZSddLCBwYXlsb2FkLnNvdXJjZSk7XG4gICAgICAgICAgdGhpcy5zZXRNb2RpZmllZCh0cnVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMuY2VsbF9mb2N1czpcbiAgICAgICAgICBsZXQgYWN0aXZlQ2VsbEluZm8gPSB0aGlzLmZpbmRBY3RpdmVDZWxsKCk7XG4gICAgICAgICAgaWYgKCFhY3RpdmVDZWxsSW5mbyB8fCBhY3RpdmVDZWxsSW5mbyA9PT0gdW5kZWZpbmVkIHx8IGFjdGl2ZUNlbGxJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coJ01lc3NhZ2UgaXMgZm9yIGFub3RoZXIgbm90ZWJvb2snKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgW2FjdGl2ZUNlbGxJbmRleCwgYWN0aXZlQ2VsbF0gPSBhY3RpdmVDZWxsSW5mbztcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBDZWxsIGlzIGF0IGluZGV4ICR7Y2VsbEluZGV4fWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZS5zZXRJbihbJ2NlbGxzJywgYWN0aXZlQ2VsbEluZGV4LCAnbWV0YWRhdGEnLCAnZm9jdXMnXSwgZmFsc2UpO1xuICAgICAgICAgIGNlbGxJbmZvID0gdGhpcy5maW5kQ2VsbEJ5SUQocGF5bG9hZC5jZWxsSUQpO1xuICAgICAgICAgIGlmICghY2VsbEluZm8gfHwgY2VsbEluZm8gPT09IHVuZGVmaW5lZCB8fCBjZWxsSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGNvbnNvbGUubG9nKCdNZXNzYWdlIGlzIGZvciBhbm90aGVyIG5vdGVib29rJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFtjZWxsSW5kZXgsIGNlbGxdID0gY2VsbEluZm87XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlLnNldEluKFsnY2VsbHMnLCBjZWxsSW5kZXgsICdtZXRhZGF0YScsICdmb2N1cyddLCBwYXlsb2FkLmlzRm9jdXNlZCk7XG4gICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMucnVuX2NlbGw6XG4gICAgICAgICAgdGhpcy5ydW5DZWxsKHRoaXMuZmluZENlbGxCeUlEKHBheWxvYWQuY2VsbElEKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRGlzcGF0Y2hlci5hY3Rpb25zLnJ1bl9hY3RpdmVfY2VsbDpcbiAgICAgICAgICB0aGlzLnJ1bkNlbGwodGhpcy5maW5kQWN0aXZlQ2VsbCgpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMub3V0cHV0X3JlY2VpdmVkOlxuICAgICAgICAgIGNlbGxJbmZvID0gdGhpcy5maW5kQ2VsbEJ5SUQocGF5bG9hZC5jZWxsSUQpO1xuICAgICAgICAgIGlmICghY2VsbEluZm8gfHwgY2VsbEluZm8gPT09IHVuZGVmaW5lZCB8fCBjZWxsSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGNvbnNvbGUubG9nKCdNZXNzYWdlIGlzIGZvciBhbm90aGVyIG5vdGVib29rJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFtjZWxsSW5kZXgsIGNlbGxdID0gY2VsbEluZm87XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdvdXRwdXRfcmVjZWl2ZWQnLCBwYXlsb2FkLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgbGV0IG91dHB1dEJ1bmRsZSA9IHRoaXMubWFrZU91dHB1dEJ1bmRsZShwYXlsb2FkLm1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChvdXRwdXRCdW5kbGUpIHtcbiAgICAgICAgICAgIGxldCBvdXRwdXRzID0gdGhpcy5zdGF0ZS5nZXRJbihbJ2NlbGxzJywgY2VsbEluZGV4LCAnb3V0cHV0cyddKS50b0pTKCk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBvdXRwdXRzLmZpbmRJbmRleChvdXRwdXQgPT4gb3V0cHV0Lm91dHB1dF90eXBlID09PSBvdXRwdXRCdW5kbGUub3V0cHV0X3R5cGUpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgaWYgKG91dHB1dEJ1bmRsZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0c1tpbmRleF0uZGF0YSA9IG91dHB1dHNbaW5kZXhdLmRhdGEuY29uY2F0KG91dHB1dEJ1bmRsZS5kYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAob3V0cHV0QnVuZGxlLnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0c1tpbmRleF0ubmFtZSA9PT0gb3V0cHV0QnVuZGxlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgIG91dHB1dHNbaW5kZXhdLnRleHQgPSBvdXRwdXRzW2luZGV4XS50ZXh0LmNvbmNhdChvdXRwdXRCdW5kbGUudGV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG91dHB1dHMgPSBvdXRwdXRzLmNvbmNhdChvdXRwdXRCdW5kbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb3V0cHV0cyA9IG91dHB1dHMuY29uY2F0KG91dHB1dEJ1bmRsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXhlY3V0aW9uX2NvdW50ID0gdGhpcy5zdGF0ZS5nZXRJbihbJ2NlbGxzJywgY2VsbEluZGV4LCAnZXhlY3V0aW9uX2NvdW50J10pO1xuICAgICAgICAgICAgaWYgKG91dHB1dEJ1bmRsZS5leGVjdXRpb25fY291bnQpIGV4ZWN1dGlvbl9jb3VudCA9IG91dHB1dEJ1bmRsZS5leGVjdXRpb25fY291bnQ7XG4gICAgICAgICAgICBsZXQgbmV3Q2VsbCA9IHRoaXMuc3RhdGUuZ2V0SW4oWydjZWxscycsIGNlbGxJbmRleF0pLm1lcmdlKHtcbiAgICAgICAgICAgICAgZXhlY3V0aW9uX2NvdW50LFxuICAgICAgICAgICAgICBvdXRwdXRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlLnNldEluKFsnY2VsbHMnLCBjZWxsSW5kZXhdLCBuZXdDZWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0TW9kaWZpZWQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEaXNwYXRjaGVyLmFjdGlvbnMuaW50ZXJydXB0X2tlcm5lbDpcbiAgICAgICAgICBpZiAodGhpcy5zZXNzaW9uID09PSB1bmRlZmluZWQgfHwgdGhpcy5zZXNzaW9uID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdhdG9tLW5vdGVib29rJywge1xuICAgICAgICAgICAgICBkZXRhaWw6ICdObyBydW5uaW5nIEp1cHl0ZXIgc2Vzc2lvbi4gVHJ5IGNsb3NpbmcgYW5kIHJlLW9wZW5pbmcgdGhpcyBmaWxlLicsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXNzaW9uLmludGVycnVwdCgpLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ3RoaXMuc2Vzc2lvbi5pbnRlcnJ1cHQnKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRGlzcGF0Y2hlci5hY3Rpb25zLmRlc3Ryb3k6XG4gICAgICAgICAgaWYgKHRoaXMuc2Vzc2lvbiA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuc2Vzc2lvbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXRvbS1ub3RlYm9vaycsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiAnTm8gcnVubmluZyBKdXB5dGVyIHNlc3Npb24uIFRyeSBjbG9zaW5nIGFuZCByZS1vcGVuaW5nIHRoaXMgZmlsZS4nLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlc3Ryb3koKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBydW5DZWxsKGNlbGxJbmZvKSB7XG4gICAgICBsZXQgZnV0dXJlLCB0aW1lcjtcbiAgICAgIGlmICghY2VsbEluZm8gfHwgY2VsbEluZm8gPT09IHVuZGVmaW5lZCB8fCBjZWxsSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coJ01lc3NhZ2UgaXMgZm9yIGFub3RoZXIgbm90ZWJvb2snKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgW2NlbGxJbmRleCwgY2VsbF0gPSBjZWxsSW5mbztcbiAgICAgICAgLy8gY29uc29sZS5sb2coYENlbGwgaXMgYXQgaW5kZXggJHtjZWxsSW5kZXh9YCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZXNzaW9uID09PSB1bmRlZmluZWQgfHwgdGhpcy5zZXNzaW9uID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2F0b20tbm90ZWJvb2snLCB7XG4gICAgICAgICAgZGV0YWlsOiAnTm8gcnVubmluZyBKdXB5dGVyIHNlc3Npb24uIFRyeSBjbG9zaW5nIGFuZCByZS1vcGVuaW5nIHRoaXMgZmlsZS4nLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGNlbGwuZ2V0KCdjZWxsX3R5cGUnKSAhPT0gJ2NvZGUnKSByZXR1cm47XG4gICAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZS5zZXRJbihbJ2NlbGxzJywgY2VsbEluZGV4LCAnb3V0cHV0cyddLCBJbW11dGFibGUuTGlzdCgpKTtcbiAgICAgIGZ1dHVyZSA9IHRoaXMuc2Vzc2lvbi5leGVjdXRlKHtjb2RlOiBjZWxsLmdldCgnc291cmNlJyl9LCBmYWxzZSk7XG4gICAgICBmdXR1cmUub25Eb25lID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnb3V0cHV0X3JlY2VpdmVkJywgJ2RvbmUnKTtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IGZ1dHVyZS5kaXNwb3NlKCksIDMwMDApO1xuICAgICAgfVxuICAgICAgZnV0dXJlLm9uSU9QdWIgPSAobXNnKSA9PiB7XG4gICAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5vdXRwdXRfcmVjZWl2ZWQsXG4gICAgICAgICAgY2VsbElEOiBjZWxsLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSksXG4gICAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICAgIH0pO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0ZUNoYW5nZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzdGF0ZS1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIF9vbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzdGF0ZS1jaGFuZ2VkJyk7XG4gICAgfVxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgICB9XG5cbiAgICBsb2FkTm90ZWJvb2tGaWxlKHVyaSkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ0xPQUQgTk9URUJPT0sgRklMRScpO1xuICAgICAgdGhpcy5maWxlID0gbmV3IEZpbGUodXJpKTtcbiAgICAgIGxldCBwYXJzZWRGaWxlID0gdGhpcy5wYXJzZU5vdGVib29rRmlsZSh0aGlzLmZpbGUpO1xuICAgICAgaWYgKHBhcnNlZEZpbGUuY2VsbHMpIHtcbiAgICAgICAgcGFyc2VkRmlsZS5jZWxscyA9IHBhcnNlZEZpbGUuY2VsbHMubWFwKGNlbGwgPT4ge1xuICAgICAgICAgIGNlbGwubWV0YWRhdGEuaWQgPSB1dWlkLnY0KCk7XG4gICAgICAgICAgY2VsbC5tZXRhZGF0YS5mb2N1cyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBjZWxsO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZEZpbGUuY2VsbHMgPSBbXG4gICAgICAgICB7XG4gICAgICAgICAgY2VsbF90eXBlOiAnY29kZScsXG4gICAgICAgICAgZXhlY3V0aW9uX2NvdW50OiBudWxsLFxuICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb3V0cHV0czogW10sXG4gICAgICAgICAgc291cmNlOiBbXVxuICAgICAgICAgfVxuICAgICAgIF07XG4gICAgICB9XG4gICAgICBpZiAocGFyc2VkRmlsZS5jZWxscy5sZW5ndGggPiAwKSBwYXJzZWRGaWxlLmNlbGxzWzBdLm1ldGFkYXRhLmZvY3VzID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhdGUgPSBJbW11dGFibGUuZnJvbUpTKHBhcnNlZEZpbGUpO1xuICAgIH1cblxuICAgIHBhcnNlTm90ZWJvb2tGaWxlKGZpbGUpIHtcbiAgICAgIGxldCBmaWxlU3RyaW5nID0gdGhpcy5maWxlLnJlYWRTeW5jKCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShmaWxlU3RyaW5nKTtcbiAgICB9XG5cbiAgICBsYXVuY2hLZXJuZWxHYXRld2F5KCkge1xuICAgICAgbGV0IGxhbmd1YWdlID0gdGhpcy5zdGF0ZS5nZXRJbihbJ21ldGFkYXRhJywgJ2tlcm5lbHNwZWMnLCAnbGFuZ3VhZ2UnXSk7XG4gICAgICBwb3J0ZmluZGVyLmJhc2VQb3J0ID0gODg4ODtcbiAgICAgIHBvcnRmaW5kZXIuZ2V0UG9ydCh7aG9zdDogJ2xvY2FsaG9zdCd9LCAoZXJyLCBwb3J0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgdGhpcy5rZXJuZWxHYXRld2F5ID0gc3Bhd24oJ2p1cHl0ZXInLCBbJ2tlcm5lbGdhdGV3YXknLCAnLS1LZXJuZWxHYXRld2F5QXBwLmlwPWxvY2FsaG9zdCcsIGAtLUtlcm5lbEdhdGV3YXlBcHAucG9ydD0ke3BvcnR9YF0sIHtcbiAgICAgICAgICBjd2Q6IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmtlcm5lbEdhdGV3YXkuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygna2VybmVsR2F0ZXdheS5zdGRvdXQgICcgKyBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMua2VybmVsR2F0ZXdheS5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdrZXJuZWxHYXRld2F5LnN0ZGVyciAnICsgZGF0YSk7XG4gICAgICAgICAgaWYgKGRhdGEudG9TdHJpbmcoKS5pbmNsdWRlcygnVGhlIEp1cHl0ZXIgS2VybmVsIEdhdGV3YXkgaXMgcnVubmluZyBhdCcpKSB7XG4gICAgICAgICAgICBnZXRLZXJuZWxTcGVjcyh7YmFzZVVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWB9KS50aGVuKChrZXJuZWxTcGVjcykgPT4ge1xuICAgICAgICAgICAgICBsZXQgc3BlYyA9IE9iamVjdC5rZXlzKGtlcm5lbFNwZWNzLmtlcm5lbHNwZWNzKS5maW5kKGtlcm5lbCA9PiBrZXJuZWxTcGVjcy5rZXJuZWxzcGVjc1trZXJuZWxdLnNwZWMubGFuZ3VhZ2UgPT09IGxhbmd1YWdlKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0tlcm5lbDogJywgc3BlYyk7XG4gICAgICAgICAgICAgIGlmIChzcGVjKSB7XG4gICAgICAgICAgICAgICAgc3RhcnROZXdLZXJuZWwoe1xuICAgICAgICAgICAgICAgICAgYmFzZVVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWAsXG4gICAgICAgICAgICAgICAgICB3c1VybDogYHdzOi8vbG9jYWxob3N0OiR7cG9ydH1gLFxuICAgICAgICAgICAgICAgICAgbmFtZTogc3BlY1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKGtlcm5lbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zZXNzaW9uID0ga2VybmVsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmtlcm5lbEdhdGV3YXkub24oJ2Nsb3NlJywgIChjb2RlKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2tlcm5lbEdhdGV3YXkuY2xvc2UgJyArIGNvZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5rZXJuZWxHYXRld2F5Lm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygna2VybmVsR2F0ZXdheS5leGl0ICcgKyBjb2RlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlT3V0cHV0QnVuZGxlKG1zZykge1xuICBcdFx0bGV0IGpzb24gPSB7fTtcbiAgXHRcdGpzb24ub3V0cHV0X3R5cGUgPSBtc2cuaGVhZGVyLm1zZ190eXBlO1xuICBcdFx0c3dpdGNoIChqc29uLm91dHB1dF90eXBlKSB7XG4gIFx0XHRcdGNhc2UgJ2NsZWFyX291dHB1dCc6XG4gIFx0XHRcdFx0Ly8gbXNnIHNwZWMgdjQgaGFkIHN0ZG91dCwgc3RkZXJyLCBkaXNwbGF5IGtleXNcbiAgXHRcdFx0XHQvLyB2NC4xIHJlcGxhY2VkIHRoZXNlIHdpdGgganVzdCB3YWl0XG4gIFx0XHRcdFx0Ly8gVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdGhlIHNhbWUgKHN0ZG91dD1zdGRlcnI9ZGlzcGxheT1UcnVlLCB3YWl0PUZhbHNlKSxcbiAgXHRcdFx0XHQvLyBzbyB2NCBtZXNzYWdlcyB3aWxsIHN0aWxsIGJlIHByb3Blcmx5IGhhbmRsZWQsXG4gIFx0XHRcdFx0Ly8gZXhjZXB0IGZvciB0aGUgcmFyZWx5IHVzZWQgY2xlYXJpbmcgbGVzcyB0aGFuIGFsbCBvdXRwdXQuXG4gIFx0XHRcdFx0Y29uc29sZS5sb2coJ05vdCBoYW5kbGluZyBjbGVhciBtZXNzYWdlIScpO1xuICBcdFx0XHRcdHRoaXMuY2xlYXJfb3V0cHV0KG1zZy5jb250ZW50LndhaXQgfHwgZmFsc2UpO1xuICBcdFx0XHRcdHJldHVybjtcbiAgXHRcdFx0Y2FzZSAnc3RyZWFtJzpcbiAgXHRcdFx0XHRqc29uLnRleHQgPSBtc2cuY29udGVudC50ZXh0Lm1hdGNoKC9bXlxcbl0rKD86XFxyP1xcbnwkKS9nKTtcbiAgXHRcdFx0XHRqc29uLm5hbWUgPSBtc2cuY29udGVudC5uYW1lO1xuICBcdFx0XHRcdGJyZWFrO1xuICBcdFx0XHRjYXNlICdkaXNwbGF5X2RhdGEnOlxuICBcdFx0XHRcdGpzb24uZGF0YSA9IE9iamVjdC5rZXlzKG1zZy5jb250ZW50LmRhdGEpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gbXNnLmNvbnRlbnQuZGF0YVtrZXldLm1hdGNoKC9bXlxcbl0rKD86XFxyP1xcbnwkKS9nKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwge30pO1xuICBcdFx0XHRcdGpzb24ubWV0YWRhdGEgPSBtc2cuY29udGVudC5tZXRhZGF0YTtcbiAgXHRcdFx0XHRicmVhaztcbiAgXHRcdFx0Y2FzZSAnZXhlY3V0ZV9yZXN1bHQnOlxuICBcdFx0XHRcdGpzb24uZGF0YSA9IE9iamVjdC5rZXlzKG1zZy5jb250ZW50LmRhdGEpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gbXNnLmNvbnRlbnQuZGF0YVtrZXldLm1hdGNoKC9bXlxcbl0rKD86XFxyP1xcbnwkKS9nKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwge30pO1xuICBcdFx0XHRcdGpzb24ubWV0YWRhdGEgPSBtc2cuY29udGVudC5tZXRhZGF0YTtcbiAgXHRcdFx0XHRqc29uLmV4ZWN1dGlvbl9jb3VudCA9IG1zZy5jb250ZW50LmV4ZWN1dGlvbl9jb3VudDtcbiAgXHRcdFx0XHRicmVhaztcbiAgXHRcdFx0Y2FzZSAnZXJyb3InOlxuICBcdFx0XHRcdGpzb24uZW5hbWUgPSBtc2cuY29udGVudC5lbmFtZTtcbiAgXHRcdFx0XHRqc29uLmV2YWx1ZSA9IG1zZy5jb250ZW50LmV2YWx1ZTtcbiAgXHRcdFx0XHRqc29uLnRyYWNlYmFjayA9IG1zZy5jb250ZW50LnRyYWNlYmFjaztcbiAgXHRcdFx0XHRicmVhaztcbiAgXHRcdFx0Y2FzZSAnc3RhdHVzJzpcbiAgXHRcdFx0Y2FzZSAnZXhlY3V0ZV9pbnB1dCc6XG4gIFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuICBcdFx0XHRkZWZhdWx0OlxuICBcdFx0XHRcdGNvbnNvbGUubG9nKCd1bmhhbmRsZWQgb3V0cHV0IG1lc3NhZ2UnLCBtc2cpO1xuICBcdFx0XHRcdHJldHVybiBmYWxzZTtcbiAgXHRcdH1cbiAgICAgIHJldHVybiBqc29uO1xuICBcdH1cblxuICAgIHNhdmUoKSB7XG4gICAgICB0aGlzLnNhdmVBcyh0aGlzLmdldFBhdGgoKSk7XG4gICAgfVxuXG4gICAgc2F2ZUFzKHVyaSkge1xuICAgICAgbGV0IG5iRGF0YSA9IHRoaXMuYXNKU09OKClcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModXJpLCBuYkRhdGEpO1xuICAgICAgICB0aGlzLm1vZGlmaWVkID0gZmFsc2U7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlLnN0YWNrKTtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tb2RpZmllZCcpO1xuICAgIH1cblxuICAgIGFzSlNPTigpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLnRvSlNPTigpLCBudWxsLCA0KTtcbiAgICB9XG5cbiAgICBzaG91bGRQcm9tcHRUb1NhdmUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc01vZGlmaWVkKCk7XG4gICAgfVxuXG4gICAgZ2V0U2F2ZURpYWxvZ09wdGlvbnMoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICAvLyBtb2RpZmllZENhbGxiYWNrcyA9IFtdO1xuXG4gICAgaXNNb2RpZmllZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLm1vZGlmaWVkO1xuICAgIH1cblxuICAgIHNldE1vZGlmaWVkKG1vZGlmaWVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2V0dGluZyBtb2RpZmllZCcpO1xuICAgICAgdGhpcy5tb2RpZmllZCA9IG1vZGlmaWVkO1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbW9kaWZpZWQnKTtcbiAgICB9XG5cbiAgICBvbkRpZENoYW5nZU1vZGlmaWVkKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1vZGlmaWVkJywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIExpc3RlbmVycywgY3VycmVudGx5IG5ldmVyIGNhbGxlZFxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgb25EaWRDaGFuZ2UoY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBWYXJpb3VzIGluZm8tZmV0Y2hpbmcgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZ2V0VGl0bGUoKSB7XG4gICAgICBsZXQgZmlsZVBhdGggPSB0aGlzLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gdW5kZWZpbmVkICYmIGZpbGVQYXRoICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAndW50aXRsZWQnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFVSSSgpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdnZXRVUkkgY2FsbGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgZ2V0UGF0aCgpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdnZXRQYXRoIGNhbGxlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgaXNFcXVhbChvdGhlcikge1xuICAgICAgcmV0dXJuIChvdGhlciBpbnN0YW5jZW9mIEltYWdlRWRpdG9yICYmIHRoaXMuZ2V0VVJJKCkgPT0gb3RoZXIuZ2V0VVJJKCkpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBjb25zb2xlLmxvZygnZGVzdHJveSBjYWxsZWQnKTtcbiAgICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICBpZiAodGhpcy5zZXNzaW9uKSB7XG4gICAgICAgIHRoaXMuc2Vzc2lvbi5zaHV0ZG93bigpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMua2VybmVsR2F0ZXdheS5zdGRpbi5wYXVzZSgpO1xuICAgICAgICAgIHRoaXMua2VybmVsR2F0ZXdheS5raWxsKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFNlcmlhbGl6YXRpb24gKG9uZSBvZiB0aGVzZSBkYXlzLi4uKVxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gc3RhdGljIGRlc2VyaWFsaXplKHtmaWxlUGF0aH0pIHtcbiAgICAvLyAgICAgaWYgKGZzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKSB7XG4gICAgLy8gICAgICAgICBuZXcgTm90ZWJvb2tFZGl0b3IoZmlsZVBhdGgpO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgZGVzZXJpYWxpemUgbm90ZWJvb2sgZWRpdG9yIGZvciBwYXRoIFxcXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgJyR7ZmlsZVBhdGh9JyBiZWNhdXNlIHRoYXQgZmlsZSBubyBsb25nZXIgZXhpc3RzLmApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgLy8gc2VyaWFsaXplKCkge1xuICAgIC8vICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgZmlsZVBhdGg6IHRoaXMuZ2V0UGF0aCgpLFxuICAgIC8vICAgICAgICAgZGVzZXJpYWxpemVyOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cblxufVxuXG4vLyBhdG9tLmRlc2VyaWFsaXplcnMuYWRkKE5vdGVib29rRWRpdG9yKTtcbiJdfQ==
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/notebook-editor.js
