(function() {
  var Kernel, StatusView, WatchSidebar, child_process, jmp, path, uuid, zmq, _;

  child_process = require('child_process');

  path = require('path');

  _ = require('lodash');

  jmp = require('jmp');

  uuid = require('uuid');

  zmq = jmp.zmq;

  StatusView = require('./status-view');

  WatchSidebar = require('./watch-sidebar');

  module.exports = Kernel = (function() {
    function Kernel(kernelSpec, grammar, config, configPath, onlyConnect) {
      var args, commandString, getKernelNotificationsRegExp, projectPath;
      this.kernelSpec = kernelSpec;
      this.grammar = grammar;
      this.config = config;
      this.configPath = configPath;
      this.onlyConnect = onlyConnect != null ? onlyConnect : false;
      console.log('Kernel spec:', this.kernelSpec);
      console.log('Kernel configuration:', this.config);
      console.log('Kernel configuration file path:', this.configPath);
      this.kernelName = this.kernelSpec.display_name;
      this.executionCallbacks = {};
      this.watchCallbacks = [];
      this.watchSidebar = new WatchSidebar(this);
      this.statusView = new StatusView(this.kernelName);
      projectPath = path.dirname(atom.workspace.getActiveTextEditor().getPath());
      this.connect();
      if (this.onlyConnect) {
        atom.notifications.addInfo('Using custom kernel connection:', {
          detail: this.configPath
        });
      } else {
        commandString = _.head(this.kernelSpec.argv);
        args = _.tail(this.kernelSpec.argv);
        args = _.map(args, (function(_this) {
          return function(arg) {
            if (arg === '{connection_file}') {
              return _this.configPath;
            } else {
              return arg;
            }
          };
        })(this));
        console.log('Kernel: Spawning:', commandString, args);
        this.kernelProcess = child_process.spawn(commandString, args, {
          cwd: projectPath
        });
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
            console.log('Kernel: stdout:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              return atom.notifications.addInfo(_this.kernelName, {
                detail: data,
                dismissable: true
              });
            }
          };
        })(this));
        this.kernelProcess.stderr.on('data', (function(_this) {
          return function(data) {
            var regexp;
            data = data.toString();
            console.log('Kernel: stderr:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              return atom.notifications.addError(_this.kernelName, {
                detail: data,
                dismissable: true
              });
            }
          };
        })(this));
      }
    }

    Kernel.prototype.connect = function() {
      var address, err, id, key, scheme;
      scheme = this.config.signature_scheme.slice('hmac-'.length);
      key = this.config.key;
      this.shellSocket = new jmp.Socket('dealer', scheme, key);
      this.controlSocket = new jmp.Socket('dealer', scheme, key);
      this.ioSocket = new jmp.Socket('sub', scheme, key);
      id = uuid.v4();
      this.shellSocket.identity = 'dealer' + id;
      this.controlSocket.identity = 'control' + id;
      this.ioSocket.identity = 'sub' + id;
      address = "" + this.config.transport + "://" + this.config.ip + ":";
      this.shellSocket.connect(address + this.config.shell_port);
      this.controlSocket.connect(address + this.config.control_port);
      this.ioSocket.connect(address + this.config.iopub_port);
      this.ioSocket.subscribe('');
      this.shellSocket.on('message', this.onShellMessage.bind(this));
      this.ioSocket.on('message', this.onIOMessage.bind(this));
      this.shellSocket.on('connect', function() {
        return console.log('shellSocket connected');
      });
      this.controlSocket.on('connect', function() {
        return console.log('controlSocket connected');
      });
      this.ioSocket.on('connect', function() {
        return console.log('ioSocket connected');
      });
      try {
        this.shellSocket.monitor();
        this.controlSocket.monitor();
        return this.ioSocket.monitor();
      } catch (_error) {
        err = _error;
        return console.error('Kernel:', err);
      }
    };

    Kernel.prototype.interrupt = function() {
      console.log('sending SIGINT');
      if (!this.onlyConnect) {
        return this.kernelProcess.kill('SIGINT');
      }
    };

    Kernel.prototype._execute = function(code, requestId, onResults) {
      var content, header, message;
      header = {
        msg_id: requestId,
        username: '',
        session: '00000000-0000-0000-0000-000000000000',
        msg_type: 'execute_request',
        version: '5.0'
      };
      content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: false
      };
      message = {
        header: header,
        content: content
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    Kernel.prototype.execute = function(code, onResults) {
      var requestId;
      console.log('Kernel.execute:', code);
      requestId = 'execute_' + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    Kernel.prototype.executeWatch = function(code, onResults) {
      var requestId;
      console.log('Kernel.executeWatch:', code);
      requestId = 'watch_' + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    Kernel.prototype.complete = function(code, onResults) {
      var column, content, header, message, requestId;
      console.log('Kernel.complete:', code);
      requestId = 'complete_' + uuid.v4();
      column = code.length;
      header = {
        msg_id: requestId,
        username: '',
        session: '00000000-0000-0000-0000-000000000000',
        msg_type: 'complete_request',
        version: '5.0'
      };
      content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: column
      };
      message = {
        header: header,
        content: content
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    Kernel.prototype.inspect = function(code, cursor_pos, onResults) {
      var content, header, message, requestId;
      console.log('Kernel.inspect:', code, cursor_pos);
      requestId = 'inspect_' + uuid.v4();
      header = {
        msg_id: requestId,
        username: '',
        session: '00000000-0000-0000-0000-000000000000',
        msg_type: 'inspect_request',
        version: '5.0'
      };
      content = {
        code: code,
        cursor_pos: cursor_pos,
        detail_level: 0
      };
      message = {
        header: header,
        content: content
      };
      this.executionCallbacks[requestId] = onResults;
      return this.shellSocket.send(new jmp.Message(message));
    };

    Kernel.prototype.addWatchCallback = function(watchCallback) {
      return this.watchCallbacks.push(watchCallback);
    };

    Kernel.prototype.onShellMessage = function(message) {
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

    Kernel.prototype.onIOMessage = function(message) {
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
          this.watchCallbacks.forEach(function(watchCallback) {
            return watchCallback();
          });
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

    Kernel.prototype._isValidMessage = function(message) {
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

    Kernel.prototype._parseIOMessage = function(message) {
      var result;
      result = this._parseDisplayIOMessage(message);
      if (result == null) {
        result = this._parseResultIOMessage(message);
      }
      if (result == null) {
        result = this._parseErrorIOMessage(message);
      }
      if (result == null) {
        result = this._parseStreamIOMessage(message);
      }
      return result;
    };

    Kernel.prototype._parseDisplayIOMessage = function(message) {
      var result;
      if (message.header.msg_type === 'display_data') {
        result = this._parseDataMime(message.content.data);
      }
      return result;
    };

    Kernel.prototype._parseResultIOMessage = function(message) {
      var msg_type, result;
      msg_type = message.header.msg_type;
      if (msg_type === 'execute_result' || msg_type === 'pyout') {
        result = this._parseDataMime(message.content.data);
      }
      return result;
    };

    Kernel.prototype._parseDataMime = function(data) {
      var mime, result;
      if (data == null) {
        return null;
      }
      mime = this._getMimeType(data);
      if (mime == null) {
        return null;
      }
      if (mime === 'text/plain') {
        result = {
          data: {
            'text/plain': data[mime]
          },
          type: 'text',
          stream: 'pyout'
        };
        result.data['text/plain'] = result.data['text/plain'].trim();
      } else {
        result = {
          data: {},
          type: mime,
          stream: 'pyout'
        };
        result.data[mime] = data[mime];
      }
      return result;
    };

    Kernel.prototype._getMimeType = function(data) {
      var imageMimes, mime;
      imageMimes = Object.getOwnPropertyNames(data).filter(function(mime) {
        return mime.startsWith('image/');
      });
      if (data.hasOwnProperty('text/html')) {
        mime = 'text/html';
      } else if (data.hasOwnProperty('image/svg+xml')) {
        mime = 'image/svg+xml';
      } else if (!(imageMimes.length === 0)) {
        mime = imageMimes[0];
      } else if (data.hasOwnProperty('text/markdown')) {
        mime = 'text/markdown';
      } else if (data.hasOwnProperty('application/pdf')) {
        mime = 'application/pdf';
      } else if (data.hasOwnProperty('text/latex')) {
        mime = 'text/latex';
      } else if (data.hasOwnProperty('text/plain')) {
        mime = 'text/plain';
      }
      return mime;
    };

    Kernel.prototype._parseErrorIOMessage = function(message) {
      var msg_type, result;
      msg_type = message.header.msg_type;
      if (msg_type === 'error' || msg_type === 'pyerr') {
        result = this._parseErrorMessage(message);
      }
      return result;
    };

    Kernel.prototype._parseErrorMessage = function(message) {
      var ename, err, errorString, evalue, result, _ref, _ref1;
      try {
        errorString = message.content.traceback.join('\n');
      } catch (_error) {
        err = _error;
        ename = (_ref = message.content.ename) != null ? _ref : '';
        evalue = (_ref1 = message.content.evalue) != null ? _ref1 : '';
        errorString = ename + ': ' + evalue;
      }
      result = {
        data: {
          'text/plain': errorString
        },
        type: 'text',
        stream: 'error'
      };
      return result;
    };

    Kernel.prototype._parseStreamIOMessage = function(message) {
      var result, _ref, _ref1, _ref2;
      if (message.header.msg_type === 'stream') {
        result = {
          data: {
            'text/plain': (_ref = message.content.text) != null ? _ref : message.content.data
          },
          type: 'text',
          stream: message.content.name
        };
      } else if (message.idents === 'stdout' || message.idents === 'stream.stdout' || message.content.name === 'stdout') {
        result = {
          data: {
            'text/plain': (_ref1 = message.content.text) != null ? _ref1 : message.content.data
          },
          type: 'text',
          stream: 'stdout'
        };
      } else if (message.idents === 'stderr' || message.idents === 'stream.stderr' || message.content.name === 'stderr') {
        result = {
          data: {
            'text/plain': (_ref2 = message.content.text) != null ? _ref2 : message.content.data
          },
          type: 'text',
          stream: 'stderr'
        };
      }
      if ((result != null ? result.data['text/plain'] : void 0) != null) {
        result.data['text/plain'] = result.data['text/plain'].trim();
      }
      return result;
    };

    Kernel.prototype.destroy = function() {
      var content, detail, header, message, requestId;
      console.log('sending shutdown');
      requestId = uuid.v4();
      header = {
        msg_id: requestId,
        username: '',
        session: 0,
        msg_type: 'shutdown_request',
        version: '5.0'
      };
      content = {
        restart: false
      };
      message = {
        header: header,
        content: content
      };
      this.shellSocket.send(new jmp.Message(message));
      this.shellSocket.close();
      this.ioSocket.close();
      if (this.onlyConnect) {
        detail = 'Shutdown request sent to custom kernel connection in ' + this.configPath;
        atom.notifications.addInfo('Custom kernel connection:', {
          detail: detail
        });
      }
      if (!this.onlyConnect) {
        return this.kernelProcess.kill('SIGKILL');
      }
    };

    return Kernel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSk4sQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBTlYsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVGYsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDVyxJQUFBLGdCQUFFLFVBQUYsRUFBZSxPQUFmLEVBQXlCLE1BQXpCLEVBQWtDLFVBQWxDLEVBQStDLFdBQS9DLEdBQUE7QUFDVCxVQUFBLDhEQUFBO0FBQUEsTUFEVSxJQUFDLENBQUEsYUFBQSxVQUNYLENBQUE7QUFBQSxNQUR1QixJQUFDLENBQUEsVUFBQSxPQUN4QixDQUFBO0FBQUEsTUFEaUMsSUFBQyxDQUFBLFNBQUEsTUFDbEMsQ0FBQTtBQUFBLE1BRDBDLElBQUMsQ0FBQSxhQUFBLFVBQzNDLENBQUE7QUFBQSxNQUR1RCxJQUFDLENBQUEsb0NBQUEsY0FBYyxLQUN0RSxDQUFBO0FBQUEsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsSUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel.coffee
