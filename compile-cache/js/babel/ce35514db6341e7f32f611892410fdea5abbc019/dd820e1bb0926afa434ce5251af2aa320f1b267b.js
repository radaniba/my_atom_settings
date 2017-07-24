Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jmp = require('jmp');

var _jmp2 = _interopRequireDefault(_jmp);

var _uuidV4 = require('uuid/v4');

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _kernel = require('./kernel');

var _kernel2 = _interopRequireDefault(_kernel);

var _inputView = require('./input-view');

var _inputView2 = _interopRequireDefault(_inputView);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var ZMQKernel = (function (_Kernel) {
  _inherits(ZMQKernel, _Kernel);

  function ZMQKernel(kernelSpec, grammar, connection, connectionFile, kernelProcess) {
    var _this = this;

    _classCallCheck(this, ZMQKernel);

    _get(Object.getPrototypeOf(ZMQKernel.prototype), 'constructor', this).call(this, kernelSpec, grammar);
    this.connection = connection;
    this.connectionFile = connectionFile;
    this.kernelProcess = kernelProcess;

    this.executionCallbacks = {};

    this._connect();

    if (this.kernelProcess) {
      (0, _log2['default'])('ZMQKernel: @kernelProcess:', this.kernelProcess);

      this.kernelProcess.stdout.on('data', function (data) {
        data = data.toString();

        if (atom.config.get('Hydrogen.kernelNotifications')) {
          atom.notifications.addInfo(_this.kernelSpec.display_name, {
            description: data,
            dismissable: true
          });
        } else {
          (0, _log2['default'])('ZMQKernel: stdout:', data);
        }
      });

      this.kernelProcess.stderr.on('data', function (data) {
        atom.notifications.addError(_this.kernelSpec.display_name, {
          description: data.toString(),
          dismissable: true
        });
      });
    } else {
      (0, _log2['default'])('ZMQKernel: connectionFile:', this.connectionFile);
      atom.notifications.addInfo('Using an existing kernel connection');
    }
  }

  _createClass(ZMQKernel, [{
    key: '_connect',
    value: function _connect() {
      var scheme = this.connection.signature_scheme.slice('hmac-'.length);
      var key = this.connection.key;

      this.shellSocket = new _jmp2['default'].Socket('dealer', scheme, key);
      this.controlSocket = new _jmp2['default'].Socket('dealer', scheme, key);
      this.stdinSocket = new _jmp2['default'].Socket('dealer', scheme, key);
      this.ioSocket = new _jmp2['default'].Socket('sub', scheme, key);

      var id = (0, _uuidV42['default'])();
      this.shellSocket.identity = 'dealer' + id;
      this.controlSocket.identity = 'control' + id;
      this.stdinSocket.identity = 'dealer' + id;
      this.ioSocket.identity = 'sub' + id;

      var address = this.connection.transport + '://' + this.connection.ip + ':';
      this.shellSocket.connect(address + this.connection.shell_port);
      this.controlSocket.connect(address + this.connection.control_port);
      this.ioSocket.connect(address + this.connection.iopub_port);
      this.ioSocket.subscribe('');
      this.stdinSocket.connect(address + this.connection.stdin_port);

      this.shellSocket.on('message', this.onShellMessage.bind(this));
      this.ioSocket.on('message', this.onIOMessage.bind(this));
      this.stdinSocket.on('message', this.onStdinMessage.bind(this));

      this.shellSocket.on('connect', function () {
        return (0, _log2['default'])('shellSocket connected');
      });
      this.controlSocket.on('connect', function () {
        return (0, _log2['default'])('controlSocket connected');
      });
      this.ioSocket.on('connect', function () {
        return (0, _log2['default'])('ioSocket connected');
      });
      this.stdinSocket.on('connect', function () {
        return (0, _log2['default'])('stdinSocket connected');
      });

      try {
        this.shellSocket.monitor();
        this.controlSocket.monitor();
        this.ioSocket.monitor();
        this.stdinSocket.monitor();
      } catch (err) {
        console.error('Kernel:', err);
      }
    }
  }, {
    key: 'interrupt',
    value: function interrupt() {
      if (process.platform === 'win32') {
        atom.notifications.addWarning('Cannot interrupt this kernel', {
          detail: 'Kernel interruption is currently not supported in Windows.'
        });
      } else if (this.kernelProcess) {
        (0, _log2['default'])('ZMQKernel: sending SIGINT');
        this.kernelProcess.kill('SIGINT');
      } else {
        (0, _log2['default'])('ZMQKernel: cannot interrupt an existing kernel');
        atom.notifications.addWarning('Cannot interrupt an existing kernel');
      }
    }
  }, {
    key: '_kill',
    value: function _kill() {
      if (this.kernelProcess) {
        (0, _log2['default'])('ZMQKernel: sending SIGKILL');
        this.kernelProcess.kill('SIGKILL');
      } else {
        (0, _log2['default'])('ZMQKernel: cannot kill an existing kernel');
        atom.notifications.addWarning('Cannot kill this kernel');
      }
    }
  }, {
    key: 'shutdown',
    value: function shutdown() {
      var restart = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var requestId = 'shutdown_' + (0, _uuidV42['default'])();
      var message = this._createMessage('shutdown_request', requestId);

      message.content = { restart: restart };

      this.shellSocket.send(new _jmp2['default'].Message(message));
    }

    // onResults is a callback that may be called multiple times
    // as results come in from the kernel
  }, {
    key: '_execute',
    value: function _execute(code, requestId, onResults) {
      var message = this._createMessage('execute_request', requestId);

      message.content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp2['default'].Message(message));
    }
  }, {
    key: 'execute',
    value: function execute(code, onResults) {
      (0, _log2['default'])('Kernel.execute:', code);

      var requestId = 'execute_' + (0, _uuidV42['default'])();
      this._execute(code, requestId, onResults);
    }
  }, {
    key: 'executeWatch',
    value: function executeWatch(code, onResults) {
      (0, _log2['default'])('Kernel.executeWatch:', code);

      var requestId = 'watch_' + (0, _uuidV42['default'])();
      this._execute(code, requestId, onResults);
    }
  }, {
    key: 'complete',
    value: function complete(code, onResults) {
      (0, _log2['default'])('Kernel.complete:', code);

      var requestId = 'complete_' + (0, _uuidV42['default'])();

      var message = this._createMessage('complete_request', requestId);

      message.content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: code.length
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp2['default'].Message(message));
    }
  }, {
    key: 'inspect',
    value: function inspect(code, cursorPos, onResults) {
      (0, _log2['default'])('Kernel.inspect:', code, cursorPos);

      var requestId = 'inspect_' + (0, _uuidV42['default'])();

      var message = this._createMessage('inspect_request', requestId);

      message.content = {
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp2['default'].Message(message));
    }
  }, {
    key: 'inputReply',
    value: function inputReply(input) {
      var requestId = 'input_reply_' + (0, _uuidV42['default'])();

      var message = this._createMessage('input_reply', requestId);

      message.content = { value: input };

      this.stdinSocket.send(new _jmp2['default'].Message(message));
    }

    /* eslint-disable camelcase*/
  }, {
    key: 'onShellMessage',
    value: function onShellMessage(message) {
      (0, _log2['default'])('shell message:', message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (!callback) {
        return;
      }

      var status = message.content.status;

      if (status === 'error') {
        // Drop 'status: error' shell messages, wait for IO messages instead
        return;
      }

      if (status === 'ok') {
        var msg_type = message.header.msg_type;

        if (msg_type === 'execution_reply') {
          callback({
            data: 'ok',
            type: 'text',
            stream: 'status'
          });
        } else if (msg_type === 'complete_reply') {
          callback(message.content);
        } else if (msg_type === 'inspect_reply') {
          callback({
            data: message.content.data,
            found: message.content.found
          });
        } else {
          callback({
            data: 'ok',
            type: 'text',
            stream: 'status'
          });
        }
      }
    }
  }, {
    key: 'onStdinMessage',
    value: function onStdinMessage(message) {
      var _this2 = this;

      (0, _log2['default'])('stdin message:', message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === 'input_request') {
        var _prompt = message.content.prompt;

        var inputView = new _inputView2['default']({ prompt: _prompt }, function (input) {
          return _this2.inputReply(input);
        });

        inputView.attach();
      }
    }
  }, {
    key: 'onIOMessage',
    value: function onIOMessage(message) {
      (0, _log2['default'])('IO message:', message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === 'status') {
        var _status = message.content.execution_state;
        this.statusView.setStatus(_status);
        this.executionState = _status;

        var _msg_id = message.parent_header ? message.parent_header.msg_id : null;
        if (_msg_id && _status === 'idle' && _msg_id.startsWith('execute')) {
          this._callWatchCallbacks();
        }
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (!callback) {
        return;
      }

      var result = this._parseIOMessage(message);

      if (result) {
        callback(result);
      }
    }

    /* eslint-enable camelcase*/

  }, {
    key: '_isValidMessage',
    value: function _isValidMessage(message) {
      if (!message) {
        (0, _log2['default'])('Invalid message: null');
        return false;
      }

      if (!message.content) {
        (0, _log2['default'])('Invalid message: Missing content');
        return false;
      }

      if (message.content.execution_state === 'starting') {
        // Kernels send a starting status message with an empty parent_header
        (0, _log2['default'])('Dropped starting status IO message');
        return false;
      }

      if (!message.parent_header) {
        (0, _log2['default'])('Invalid message: Missing parent_header');
        return false;
      }

      if (!message.parent_header.msg_id) {
        (0, _log2['default'])('Invalid message: Missing parent_header.msg_id');
        return false;
      }

      if (!message.parent_header.msg_type) {
        (0, _log2['default'])('Invalid message: Missing parent_header.msg_type');
        return false;
      }

      if (!message.header) {
        (0, _log2['default'])('Invalid message: Missing header');
        return false;
      }

      if (!message.header.msg_id) {
        (0, _log2['default'])('Invalid message: Missing header.msg_id');
        return false;
      }

      if (!message.header.msg_type) {
        (0, _log2['default'])('Invalid message: Missing header.msg_type');
        return false;
      }

      return true;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      (0, _log2['default'])('ZMQKernel: destroy:', this);

      this.shutdown();

      if (this.kernelProcess) {
        this._kill();
        _fs2['default'].unlink(this.connectionFile);
      }

      this.shellSocket.close();
      this.controlSocket.close();
      this.ioSocket.close();
      this.stdinSocket.close();

      _get(Object.getPrototypeOf(ZMQKernel.prototype), 'destroy', this).apply(this, arguments);
    }
  }, {
    key: '_getUsername',
    value: function _getUsername() {
      return process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
    }
  }, {
    key: '_createMessage',
    value: function _createMessage(msgType) {
      var msgId = arguments.length <= 1 || arguments[1] === undefined ? (0, _uuidV42['default'])() : arguments[1];

      var message = {
        header: {
          username: this._getUsername(),
          session: '00000000-0000-0000-0000-000000000000',
          msg_type: msgType,
          msg_id: msgId,
          date: new Date(),
          version: '5.0'
        },
        metadata: {},
        parent_header: {},
        content: {}
      };

      return message;
    }
  }]);

  return ZMQKernel;
})(_kernel2['default']);

exports['default'] = ZMQKernel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3ptcS1rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7a0JBRWUsSUFBSTs7OzttQkFDSCxLQUFLOzs7O3NCQUNOLFNBQVM7Ozs7c0JBRUwsVUFBVTs7Ozt5QkFDUCxjQUFjOzs7O21CQUNwQixPQUFPOzs7O0FBUnZCLFdBQVcsQ0FBQzs7SUFVUyxTQUFTO1lBQVQsU0FBUzs7QUFDakIsV0FEUSxTQUFTLENBQ2hCLFVBQVUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUU7OzswQkFEekQsU0FBUzs7QUFFMUIsK0JBRmlCLFNBQVMsNkNBRXBCLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDM0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDN0IsUUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7QUFDckMsUUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7O0FBRW5DLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFaEIsUUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLDRCQUFJLDRCQUE0QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdEQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBSztBQUM3QyxZQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztBQUV2QixZQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQUU7QUFDbkQsY0FBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBSyxVQUFVLENBQUMsWUFBWSxFQUFFO0FBQ3ZELHVCQUFXLEVBQUUsSUFBSTtBQUNqQix1QkFBVyxF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QUFnQjtVQUFkLEtBQUsseURBQUcsMEJBQUk7O0FBQ2xDLFVBQU0sT0FBTyxHQUFHO0FBQ2QsY0FBTSxFQUFFO0FBQ04sa0JBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzdCLGlCQUFPLEVBQUUsc0NBQXNDO0FBQy9DLGtCQUFRLEVBQUUsT0FBTztBQUNqQixnQkFBTSxFQUFFLEtBQUs7QUFDYixjQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDaEIsaUJBQU8sRUFBRSxLQUFLO1NBQ2Y7QUFDRCxnQkFBUSxFQUFFLEVBQUU7QUFDWixxQkFBYSxFQUFFLEVBQUU7QUFDakIsZUFBTyxFQUFFLEVBQUU7T0FDWixDQUFDOztBQUVGLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7U0FuWmtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3ptcS1rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBqbXAgZnJvbSAnam1wJztcbmltcG9ydCB2NCBmcm9tICd1dWlkL3Y0JztcblxuaW1wb3J0IEtlcm5lbCBmcm9tICcuL2tlcm5lbCc7XG5pbXBvcnQgSW5wdXRWaWV3IGZyb20gJy4vaW5wdXQtdmlldyc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWk1RS2VybmVsIGV4dGVuZHMgS2VybmVsIHtcbiAgY29uc3RydWN0b3Ioa2VybmVsU3BlYywgZ3JhbW1hciwgY29ubmVjdGlvbiwgY29ubmVjdGlvbkZpbGUsIGtlcm5lbFByb2Nlc3MpIHtcbiAgICBzdXBlcihrZXJuZWxTcGVjLCBncmFtbWFyKTtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIHRoaXMuY29ubmVjdGlvbkZpbGUgPSBjb25uZWN0aW9uRmlsZTtcbiAgICB0aGlzLmtlcm5lbFByb2Nlc3MgPSBrZXJuZWxQcm9jZXNzO1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3MgPSB7fTtcblxuICAgIHRoaXMuX2Nvbm5lY3QoKTtcblxuICAgIGlmICh0aGlzLmtlcm5lbFByb2Nlc3MpIHtcbiAgICAgIGxvZygnWk1RS2VybmVsOiBAa2VybmVsUHJvY2VzczonLCB0aGlzLmtlcm5lbFByb2Nlc3MpO1xuXG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcblxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdIeWRyb2dlbi5rZXJuZWxOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyh0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lLCB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YSxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZygnWk1RS2VybmVsOiBzdGRvdXQ6JywgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHRoaXMua2VybmVsU3BlYy5kaXNwbGF5X25hbWUsIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS50b1N0cmluZygpLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1pNUUtlcm5lbDogY29ubmVjdGlvbkZpbGU6JywgdGhpcy5jb25uZWN0aW9uRmlsZSk7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnVXNpbmcgYW4gZXhpc3Rpbmcga2VybmVsIGNvbm5lY3Rpb24nKTtcbiAgICB9XG4gIH1cblxuXG4gIF9jb25uZWN0KCkge1xuICAgIGNvbnN0IHNjaGVtZSA9IHRoaXMuY29ubmVjdGlvbi5zaWduYXR1cmVfc2NoZW1lLnNsaWNlKCdobWFjLScubGVuZ3RoKTtcbiAgICBjb25zdCB7IGtleSB9ID0gdGhpcy5jb25uZWN0aW9uO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldCA9IG5ldyBqbXAuU29ja2V0KCdkZWFsZXInLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5jb250cm9sU29ja2V0ID0gbmV3IGptcC5Tb2NrZXQoJ2RlYWxlcicsIHNjaGVtZSwga2V5KTtcbiAgICB0aGlzLnN0ZGluU29ja2V0ID0gbmV3IGptcC5Tb2NrZXQoJ2RlYWxlcicsIHNjaGVtZSwga2V5KTtcbiAgICB0aGlzLmlvU29ja2V0ID0gbmV3IGptcC5Tb2NrZXQoJ3N1YicsIHNjaGVtZSwga2V5KTtcblxuICAgIGNvbnN0IGlkID0gdjQoKTtcbiAgICB0aGlzLnNoZWxsU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmNvbnRyb2xTb2NrZXQuaWRlbnRpdHkgPSBgY29udHJvbCR7aWR9YDtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmlvU29ja2V0LmlkZW50aXR5ID0gYHN1YiR7aWR9YDtcblxuICAgIGNvbnN0IGFkZHJlc3MgPSBgJHt0aGlzLmNvbm5lY3Rpb24udHJhbnNwb3J0fTovLyR7dGhpcy5jb25uZWN0aW9uLmlwfTpgO1xuICAgIHRoaXMuc2hlbGxTb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLnNoZWxsX3BvcnQpO1xuICAgIHRoaXMuY29udHJvbFNvY2tldC5jb25uZWN0KGFkZHJlc3MgKyB0aGlzLmNvbm5lY3Rpb24uY29udHJvbF9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LmNvbm5lY3QoYWRkcmVzcyArIHRoaXMuY29ubmVjdGlvbi5pb3B1Yl9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LnN1YnNjcmliZSgnJyk7XG4gICAgdGhpcy5zdGRpblNvY2tldC5jb25uZWN0KGFkZHJlc3MgKyB0aGlzLmNvbm5lY3Rpb24uc3RkaW5fcG9ydCk7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5vblNoZWxsTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmlvU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5vbklPTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5vblN0ZGluTWVzc2FnZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiBsb2coJ3NoZWxsU29ja2V0IGNvbm5lY3RlZCcpKTtcbiAgICB0aGlzLmNvbnRyb2xTb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiBsb2coJ2NvbnRyb2xTb2NrZXQgY29ubmVjdGVkJykpO1xuICAgIHRoaXMuaW9Tb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiBsb2coJ2lvU29ja2V0IGNvbm5lY3RlZCcpKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0Lm9uKCdjb25uZWN0JywgKCkgPT4gbG9nKCdzdGRpblNvY2tldCBjb25uZWN0ZWQnKSk7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5zaGVsbFNvY2tldC5tb25pdG9yKCk7XG4gICAgICB0aGlzLmNvbnRyb2xTb2NrZXQubW9uaXRvcigpO1xuICAgICAgdGhpcy5pb1NvY2tldC5tb25pdG9yKCk7XG4gICAgICB0aGlzLnN0ZGluU29ja2V0Lm1vbml0b3IoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0tlcm5lbDonLCBlcnIpO1xuICAgIH1cbiAgfVxuXG5cbiAgaW50ZXJydXB0KCkge1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnQ2Fubm90IGludGVycnVwdCB0aGlzIGtlcm5lbCcsIHtcbiAgICAgICAgZGV0YWlsOiAnS2VybmVsIGludGVycnVwdGlvbiBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBpbiBXaW5kb3dzLicsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua2VybmVsUHJvY2Vzcykge1xuICAgICAgbG9nKCdaTVFLZXJuZWw6IHNlbmRpbmcgU0lHSU5UJyk7XG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbCgnU0lHSU5UJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnWk1RS2VybmVsOiBjYW5ub3QgaW50ZXJydXB0IGFuIGV4aXN0aW5nIGtlcm5lbCcpO1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ0Nhbm5vdCBpbnRlcnJ1cHQgYW4gZXhpc3Rpbmcga2VybmVsJyk7XG4gICAgfVxuICB9XG5cblxuICBfa2lsbCgpIHtcbiAgICBpZiAodGhpcy5rZXJuZWxQcm9jZXNzKSB7XG4gICAgICBsb2coJ1pNUUtlcm5lbDogc2VuZGluZyBTSUdLSUxMJyk7XG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbCgnU0lHS0lMTCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1pNUUtlcm5lbDogY2Fubm90IGtpbGwgYW4gZXhpc3Rpbmcga2VybmVsJyk7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnQ2Fubm90IGtpbGwgdGhpcyBrZXJuZWwnKTtcbiAgICB9XG4gIH1cblxuXG4gIHNodXRkb3duKHJlc3RhcnQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBzaHV0ZG93bl8ke3Y0KCl9YDtcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSgnc2h1dGRvd25fcmVxdWVzdCcsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7IHJlc3RhcnQgfTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgam1wLk1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cblxuICAvLyBvblJlc3VsdHMgaXMgYSBjYWxsYmFjayB0aGF0IG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgLy8gYXMgcmVzdWx0cyBjb21lIGluIGZyb20gdGhlIGtlcm5lbFxuICBfZXhlY3V0ZShjb2RlLCByZXF1ZXN0SWQsIG9uUmVzdWx0cykge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKCdleGVjdXRlX3JlcXVlc3QnLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICBzdG9yZV9oaXN0b3J5OiB0cnVlLFxuICAgICAgdXNlcl9leHByZXNzaW9uczoge30sXG4gICAgICBhbGxvd19zdGRpbjogdHJ1ZSxcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgam1wLk1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cblxuICBleGVjdXRlKGNvZGUsIG9uUmVzdWx0cykge1xuICAgIGxvZygnS2VybmVsLmV4ZWN1dGU6JywgY29kZSk7XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgZXhlY3V0ZV8ke3Y0KCl9YDtcbiAgICB0aGlzLl9leGVjdXRlKGNvZGUsIHJlcXVlc3RJZCwgb25SZXN1bHRzKTtcbiAgfVxuXG5cbiAgZXhlY3V0ZVdhdGNoKGNvZGUsIG9uUmVzdWx0cykge1xuICAgIGxvZygnS2VybmVsLmV4ZWN1dGVXYXRjaDonLCBjb2RlKTtcblxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGB3YXRjaF8ke3Y0KCl9YDtcbiAgICB0aGlzLl9leGVjdXRlKGNvZGUsIHJlcXVlc3RJZCwgb25SZXN1bHRzKTtcbiAgfVxuXG5cbiAgY29tcGxldGUoY29kZSwgb25SZXN1bHRzKSB7XG4gICAgbG9nKCdLZXJuZWwuY29tcGxldGU6JywgY29kZSk7XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgY29tcGxldGVfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSgnY29tcGxldGVfcmVxdWVzdCcsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7XG4gICAgICBjb2RlLFxuICAgICAgdGV4dDogY29kZSxcbiAgICAgIGxpbmU6IGNvZGUsXG4gICAgICBjdXJzb3JfcG9zOiBjb2RlLmxlbmd0aCxcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgam1wLk1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cblxuICBpbnNwZWN0KGNvZGUsIGN1cnNvclBvcywgb25SZXN1bHRzKSB7XG4gICAgbG9nKCdLZXJuZWwuaW5zcGVjdDonLCBjb2RlLCBjdXJzb3JQb3MpO1xuXG4gICAgY29uc3QgcmVxdWVzdElkID0gYGluc3BlY3RfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSgnaW5zcGVjdF9yZXF1ZXN0JywgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHtcbiAgICAgIGNvZGUsXG4gICAgICBjdXJzb3JfcG9zOiBjdXJzb3JQb3MsXG4gICAgICBkZXRhaWxfbGV2ZWw6IDAsXG4gICAgfTtcblxuICAgIHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW3JlcXVlc3RJZF0gPSBvblJlc3VsdHM7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0LnNlbmQobmV3IGptcC5NZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGlucHV0UmVwbHkoaW5wdXQpIHtcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgaW5wdXRfcmVwbHlfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSgnaW5wdXRfcmVwbHknLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0geyB2YWx1ZTogaW5wdXQgfTtcblxuICAgIHRoaXMuc3RkaW5Tb2NrZXQuc2VuZChuZXcgam1wLk1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlKi9cbiAgb25TaGVsbE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGxvZygnc2hlbGwgbWVzc2FnZTonLCBtZXNzYWdlKTtcblxuICAgIGlmICghdGhpcy5faXNWYWxpZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1zZ19pZCB9ID0gbWVzc2FnZS5wYXJlbnRfaGVhZGVyO1xuICAgIGxldCBjYWxsYmFjaztcbiAgICBpZiAobXNnX2lkKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW21zZ19pZF07XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc3RhdHVzIH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgLy8gRHJvcCAnc3RhdHVzOiBlcnJvcicgc2hlbGwgbWVzc2FnZXMsIHdhaXQgZm9yIElPIG1lc3NhZ2VzIGluc3RlYWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RhdHVzID09PSAnb2snKSB7XG4gICAgICBjb25zdCB7IG1zZ190eXBlIH0gPSBtZXNzYWdlLmhlYWRlcjtcblxuICAgICAgaWYgKG1zZ190eXBlID09PSAnZXhlY3V0aW9uX3JlcGx5Jykge1xuICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgZGF0YTogJ29rJyxcbiAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgc3RyZWFtOiAnc3RhdHVzJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKG1zZ190eXBlID09PSAnY29tcGxldGVfcmVwbHknKSB7XG4gICAgICAgIGNhbGxiYWNrKG1lc3NhZ2UuY29udGVudCk7XG4gICAgICB9IGVsc2UgaWYgKG1zZ190eXBlID09PSAnaW5zcGVjdF9yZXBseScpIHtcbiAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgIGRhdGE6IG1lc3NhZ2UuY29udGVudC5kYXRhLFxuICAgICAgICAgIGZvdW5kOiBtZXNzYWdlLmNvbnRlbnQuZm91bmQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgIGRhdGE6ICdvaycsXG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHN0cmVhbTogJ3N0YXR1cycsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgb25TdGRpbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGxvZygnc3RkaW4gbWVzc2FnZTonLCBtZXNzYWdlKTtcblxuICAgIGlmICghdGhpcy5faXNWYWxpZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1zZ190eXBlIH0gPSBtZXNzYWdlLmhlYWRlcjtcblxuICAgIGlmIChtc2dfdHlwZSA9PT0gJ2lucHV0X3JlcXVlc3QnKSB7XG4gICAgICBjb25zdCB7IHByb21wdCB9ID0gbWVzc2FnZS5jb250ZW50O1xuXG4gICAgICBjb25zdCBpbnB1dFZpZXcgPSBuZXcgSW5wdXRWaWV3KHsgcHJvbXB0IH0sIGlucHV0ID0+IHRoaXMuaW5wdXRSZXBseShpbnB1dCkpO1xuXG4gICAgICBpbnB1dFZpZXcuYXR0YWNoKCk7XG4gICAgfVxuICB9XG5cblxuICBvbklPTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbG9nKCdJTyBtZXNzYWdlOicsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbXNnX3R5cGUgfSA9IG1lc3NhZ2UuaGVhZGVyO1xuXG4gICAgaWYgKG1zZ190eXBlID09PSAnc3RhdHVzJykge1xuICAgICAgY29uc3Qgc3RhdHVzID0gbWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9zdGF0ZTtcbiAgICAgIHRoaXMuc3RhdHVzVmlldy5zZXRTdGF0dXMoc3RhdHVzKTtcbiAgICAgIHRoaXMuZXhlY3V0aW9uU3RhdGUgPSBzdGF0dXM7XG5cbiAgICAgIGNvbnN0IG1zZ19pZCA9IChtZXNzYWdlLnBhcmVudF9oZWFkZXIpID8gbWVzc2FnZS5wYXJlbnRfaGVhZGVyLm1zZ19pZCA6IG51bGw7XG4gICAgICBpZiAobXNnX2lkICYmIHN0YXR1cyA9PT0gJ2lkbGUnICYmIG1zZ19pZC5zdGFydHNXaXRoKCdleGVjdXRlJykpIHtcbiAgICAgICAgdGhpcy5fY2FsbFdhdGNoQ2FsbGJhY2tzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgeyBtc2dfaWQgfSA9IG1lc3NhZ2UucGFyZW50X2hlYWRlcjtcbiAgICBsZXQgY2FsbGJhY2s7XG4gICAgaWYgKG1zZ19pZCkge1xuICAgICAgY2FsbGJhY2sgPSB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1ttc2dfaWRdO1xuICAgIH1cblxuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZUlPTWVzc2FnZShtZXNzYWdlKTtcblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlKi9cblxuXG4gIF9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICBsb2coJ0ludmFsaWQgbWVzc2FnZTogbnVsbCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5jb250ZW50KSB7XG4gICAgICBsb2coJ0ludmFsaWQgbWVzc2FnZTogTWlzc2luZyBjb250ZW50Jyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGUgPT09ICdzdGFydGluZycpIHtcbiAgICAgIC8vIEtlcm5lbHMgc2VuZCBhIHN0YXJ0aW5nIHN0YXR1cyBtZXNzYWdlIHdpdGggYW4gZW1wdHkgcGFyZW50X2hlYWRlclxuICAgICAgbG9nKCdEcm9wcGVkIHN0YXJ0aW5nIHN0YXR1cyBJTyBtZXNzYWdlJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIpIHtcbiAgICAgIGxvZygnSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXInKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfaWQpIHtcbiAgICAgIGxvZygnSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX2lkJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIubXNnX3R5cGUpIHtcbiAgICAgIGxvZygnSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX3R5cGUnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyKSB7XG4gICAgICBsb2coJ0ludmFsaWQgbWVzc2FnZTogTWlzc2luZyBoZWFkZXInKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyLm1zZ19pZCkge1xuICAgICAgbG9nKCdJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyLm1zZ19pZCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5oZWFkZXIubXNnX3R5cGUpIHtcbiAgICAgIGxvZygnSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlci5tc2dfdHlwZScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICBkZXN0cm95KCkge1xuICAgIGxvZygnWk1RS2VybmVsOiBkZXN0cm95OicsIHRoaXMpO1xuXG4gICAgdGhpcy5zaHV0ZG93bigpO1xuXG4gICAgaWYgKHRoaXMua2VybmVsUHJvY2Vzcykge1xuICAgICAgdGhpcy5fa2lsbCgpO1xuICAgICAgZnMudW5saW5rKHRoaXMuY29ubmVjdGlvbkZpbGUpO1xuICAgIH1cblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuY2xvc2UoKTtcbiAgICB0aGlzLmNvbnRyb2xTb2NrZXQuY2xvc2UoKTtcbiAgICB0aGlzLmlvU29ja2V0LmNsb3NlKCk7XG4gICAgdGhpcy5zdGRpblNvY2tldC5jbG9zZSgpO1xuXG4gICAgc3VwZXIuZGVzdHJveSguLi5hcmd1bWVudHMpO1xuICB9XG5cblxuICBfZ2V0VXNlcm5hbWUoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkxPR05BTUUgfHxcbiAgICAgIHByb2Nlc3MuZW52LlVTRVIgfHxcbiAgICAgIHByb2Nlc3MuZW52LkxOQU1FIHx8XG4gICAgICBwcm9jZXNzLmVudi5VU0VSTkFNRTtcbiAgfVxuXG4gIF9jcmVhdGVNZXNzYWdlKG1zZ1R5cGUsIG1zZ0lkID0gdjQoKSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICBoZWFkZXI6IHtcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMuX2dldFVzZXJuYW1lKCksXG4gICAgICAgIHNlc3Npb246ICcwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAnLFxuICAgICAgICBtc2dfdHlwZTogbXNnVHlwZSxcbiAgICAgICAgbXNnX2lkOiBtc2dJZCxcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgdmVyc2lvbjogJzUuMCcsXG4gICAgICB9LFxuICAgICAgbWV0YWRhdGE6IHt9LFxuICAgICAgcGFyZW50X2hlYWRlcjoge30sXG4gICAgICBjb250ZW50OiB7fSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbn1cbiJdfQ==