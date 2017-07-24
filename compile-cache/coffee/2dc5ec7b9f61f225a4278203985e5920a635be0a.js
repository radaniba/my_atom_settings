(function() {
  var InputView, Kernel, ZMQKernel, child_process, fs, jmp, path, uuid, zmq, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  child_process = require('child_process');

  path = require('path');

  _ = require('lodash');

  fs = require('fs');

  jmp = require('jmp');

  uuid = require('uuid');

  zmq = jmp.zmq;

  Kernel = require('./kernel');

  InputView = require('./input-view');

  module.exports = ZMQKernel = (function(_super) {
    __extends(ZMQKernel, _super);

    function ZMQKernel(kernelSpec, grammar, connection, connectionFile, kernelProcess) {
      var getKernelNotificationsRegExp;
      this.connection = connection;
      this.connectionFile = connectionFile;
      this.kernelProcess = kernelProcess;
      ZMQKernel.__super__.constructor.call(this, kernelSpec, grammar);
      this.executionCallbacks = {};
      this._connect();
      if (this.kernelProcess != null) {
        console.log('ZMQKernel: @kernelProcess:', this.kernelProcess);
        getKernelNotificationsRegExp = function() {
          var err, flags, pattern;
          try {
            pattern = atom.config.get('Hydrogen.kernelNotifications');
            flags = 'im';
            return new RegExp(pattern, flags);
          } catch (_error) {
            err = _error;
            return null;
          }
        };
        this.kernelProcess.stdout.on('data', (function(_this) {
          return function(data) {
            var regexp;
            data = data.toString();
            console.log('ZMQKernel: stdout:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              return atom.notifications.addInfo(_this.kernelSpec.display_name, {
                description: data,
                dismissable: true
              });
            }
          };
        })(this));
        this.kernelProcess.stderr.on('data', (function(_this) {
          return function(data) {
            var regexp;
            data = data.toString();
            console.log('ZMQKernel: stderr:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              return atom.notifications.addError(_this.kernelSpec.display_name, {
                description: data,
                dismissable: true
              });
            }
          };
        })(this));
      } else {
        console.log('ZMQKernel: connectionFile:', this.connectionFile);
        atom.notifications.addInfo('Using an existing kernel connection');
      }
    }

    ZMQKernel.prototype._connect = function() {
      var address, err, id, key, scheme;
      scheme = this.connection.signature_scheme.slice('hmac-'.length);
      key = this.connection.key;
      this.shellSocket = new jmp.Socket('dealer', scheme, key);
      this.controlSocket = new jmp.Socket('dealer', scheme, key);
      this.stdinSocket = new jmp.Socket('dealer', scheme, key);
      this.ioSocket = new jmp.Socket('sub', scheme, key);
      id = uuid.v4();
      this.shellSocket.identity = 'dealer' + id;
      this.controlSocket.identity = 'control' + id;
      this.stdinSocket.identity = 'dealer' + id;
      this.ioSocket.identity = 'sub' + id;
      address = "" + this.connection.transport + "://" + this.connection.ip + ":";
      this.shellSocket.connect(address + this.connection.shell_port);
      this.controlSocket.connect(address + this.connection.control_port);
      this.ioSocket.connect(address + this.connection.iopub_port);
      this.ioSocket.subscribe('');
      this.stdinSocket.connect(address + this.connection.stdin_port);
      this.shellSocket.on('message', this.onShellMessage.bind(this));
      this.ioSocket.on('message', this.onIOMessage.bind(this));
      this.stdinSocket.on('message', this.onStdinMessage.bind(this));
      this.shellSocket.on('connect', function() {
        return console.log('shellSocket connected');
      });
      this.controlSocket.on('connect', function() {
        return console.log('controlSocket connected');
      });
      this.ioSocket.on('connect', function() {
        return console.log('ioSocket connected');
      });
      this.stdinSocket.on('connect', function() {
        return console.log('stdinSocket connected');
      });
      try {
        this.shellSocket.monitor();
        this.controlSocket.monitor();
        this.ioSocket.monitor();
        return this.stdinSocket.monitor();
      } catch (_error) {
        err = _error;
        return console.error('Kernel:', err);
      }
    };

    ZMQKernel.prototype.interrupt = function() {
      if (this.kernelProcess != null) {
        console.log('ZMQKernel: sending SIGINT');
        return this.kernelProcess.kill('SIGINT');
      } else {
        console.log('ZMQKernel: cannot interrupt an existing kernel');
        return atom.notifications.addWarning('Cannot interrupt this kernel');
      }
    };

    ZMQKernel.prototype._kill = function() {
      if (this.kernelProcess != null) {
        console.log('ZMQKernel: sending SIGKILL');
        return this.kernelProcess.kill('SIGKILL');
      } else {
        console.log('ZMQKernel: cannot kill an existing kernel');
        return atom.notifications.addWarning('Cannot kill this kernel');
      }
    };

    ZMQKernel.prototype.shutdown = function(restart) {
      var message, requestId;
      if (restart == null) {
        restart = false;
      }
      requestId = 'shutdown_' + uuid.v4();
      message = this._createMessage('shutdown_request', requestId);
      message.content = {
        restart: restart
      };
      return this.shellSocket.send(new jmp.Message(message));
    };

    ZMQKernel.prototype._execute = function(code, requestId, onResults) {
      var message;
      message = this._createMessage('execute_request', requestId);
      message.content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    ZMQKernel.prototype.execute = function(code, onResults) {
      var requestId;
      console.log('Kernel.execute:', code);
      requestId = 'execute_' + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    ZMQKernel.prototype.executeWatch = function(code, onResults) {
      var requestId;
      console.log('Kernel.executeWatch:', code);
      requestId = 'watch_' + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    ZMQKernel.prototype.complete = function(code, onResults) {
      var message, requestId;
      console.log('Kernel.complete:', code);
      requestId = 'complete_' + uuid.v4();
      message = this._createMessage('complete_request', requestId);
      message.content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: code.length
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    ZMQKernel.prototype.inspect = function(code, cursor_pos, onResults) {
      var message, requestId;
      console.log('Kernel.inspect:', code, cursor_pos);
      requestId = 'inspect_' + uuid.v4();
      message = this._createMessage('inspect_request', requestId);
      message.content = {
        code: code,
        cursor_pos: cursor_pos,
        detail_level: 0
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    ZMQKernel.prototype.inputReply = function(input) {
      var message, requestId;
      requestId = 'input_reply_' + uuid.v4();
      message = this._createMessage('input_reply', requestId);
      message.content = {
        value: input
      };
      return this.stdinSocket.send(new jmp.Message(message));
    };

    ZMQKernel.prototype.onShellMessage = function(message) {
      var callback, msg_id, msg_type, status;
      console.log('shell message:', message);
      if (!this._isValidMessage(message)) {
        return;
      }
      msg_id = message.parent_header.msg_id;
      if (msg_id != null) {
        callback = this.executionCallbacks[msg_id];
      }
      if (callback == null) {
        return;
      }
      status = message.content.status;
      if (status === 'error') {
        return;
      }
      if (status === 'ok') {
        msg_type = message.header.msg_type;
        if (msg_type === 'execution_reply') {
          return callback({
            data: 'ok',
            type: 'text',
            stream: 'status'
          });
        } else if (msg_type === 'complete_reply') {
          return callback(message.content);
        } else if (msg_type === 'inspect_reply') {
          return callback({
            data: message.content.data,
            found: message.content.found
          });
        } else {
          return callback({
            data: 'ok',
            type: 'text',
            stream: 'status'
          });
        }
      }
    };

    ZMQKernel.prototype.onStdinMessage = function(message) {
      var inputView, msg_type, prompt;
      console.log('stdin message:', message);
      if (!this._isValidMessage(message)) {
        return;
      }
      msg_type = message.header.msg_type;
      if (msg_type === 'input_request') {
        prompt = message.content.prompt;
        inputView = new InputView(prompt, (function(_this) {
          return function(input) {
            return _this.inputReply(input);
          };
        })(this));
        return inputView.attach();
      }
    };

    ZMQKernel.prototype.onIOMessage = function(message) {
      var callback, msg_id, msg_type, result, status, _ref;
      console.log('IO message:', message);
      if (!this._isValidMessage(message)) {
        return;
      }
      msg_type = message.header.msg_type;
      if (msg_type === 'status') {
        status = message.content.execution_state;
        this.statusView.setStatus(status);
        msg_id = (_ref = message.parent_header) != null ? _ref.msg_id : void 0;
        if (status === 'idle' && (msg_id != null ? msg_id.startsWith('execute') : void 0)) {
          this._callWatchCallbacks();
        }
      }
      msg_id = message.parent_header.msg_id;
      if (msg_id != null) {
        callback = this.executionCallbacks[msg_id];
      }
      if (callback == null) {
        return;
      }
      result = this._parseIOMessage(message);
      if (result != null) {
        return callback(result);
      }
    };

    ZMQKernel.prototype._isValidMessage = function(message) {
      if (message == null) {
        console.log('Invalid message: null');
        return false;
      }
      if (message.content == null) {
        console.log('Invalid message: Missing content');
        return false;
      }
      if (message.content.execution_state === 'starting') {
        console.log('Dropped starting status IO message');
        return false;
      }
      if (message.parent_header == null) {
        console.log('Invalid message: Missing parent_header');
        return false;
      }
      if (message.parent_header.msg_id == null) {
        console.log('Invalid message: Missing parent_header.msg_id');
        return false;
      }
      if (message.parent_header.msg_type == null) {
        console.log('Invalid message: Missing parent_header.msg_type');
        return false;
      }
      if (message.header == null) {
        console.log('Invalid message: Missing header');
        return false;
      }
      if (message.header.msg_id == null) {
        console.log('Invalid message: Missing header.msg_id');
        return false;
      }
      if (message.header.msg_type == null) {
        console.log('Invalid message: Missing header.msg_type');
        return false;
      }
      return true;
    };

    ZMQKernel.prototype.destroy = function() {
      console.log('ZMQKernel: destroy:', this);
      this.shutdown();
      if (this.kernelProcess != null) {
        this._kill();
        fs.unlink(this.connectionFile);
      }
      this.shellSocket.close();
      this.controlSocket.close();
      this.ioSocket.close();
      this.stdinSocket.close();
      return ZMQKernel.__super__.destroy.apply(this, arguments);
    };

    ZMQKernel.prototype._getUsername = function() {
      return process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
    };

    ZMQKernel.prototype._createMessage = function(msg_type, msg_id) {
      var message;
      if (msg_id == null) {
        msg_id = uuid.v4();
      }
      message = {
        header: {
          username: this._getUsername(),
          session: '00000000-0000-0000-0000-000000000000',
          msg_type: msg_type,
          msg_id: msg_id,
          date: new Date(),
          version: '5.0'
        },
        metadata: {},
        parent_header: {},
        content: {}
      };
      return message;
    };

    return ZMQKernel;

  })(Kernel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvem1xLWtlcm5lbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0VBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSkwsQ0FBQTs7QUFBQSxFQUtBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUxOLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBT0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQVBWLENBQUE7O0FBQUEsRUFTQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FUVCxDQUFBOztBQUFBLEVBVUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBVlosQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDRixnQ0FBQSxDQUFBOztBQUFhLElBQUEsbUJBQUMsVUFBRCxFQUFhLE9BQWIsRUFBdUIsVUFBdkIsRUFBb0MsY0FBcEMsRUFBcUQsYUFBckQsR0FBQTtBQUNULFVBQUEsNEJBQUE7QUFBQSxNQUQrQixJQUFDLENBQUEsYUFBQSxVQUNoQyxDQUFBO0FBQUEsTUFENEMsSUFBQyxDQUFBLGlCQUFBLGNBQzdDLENBQUE7QUFBQSxNQUQ2RCxJQUFDLENBQUEsZ0JBQUEsYUFDOUQsQ0FBQTtBQUFBLE1BQUEsMkNBQU0sVUFBTixFQUFrQixPQUFsQixDQUFBLENBQUE7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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/zmq-kernel.coffee
