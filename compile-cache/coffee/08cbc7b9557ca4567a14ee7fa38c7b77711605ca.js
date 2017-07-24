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
      console.log("Kernel spec:", this.kernelSpec);
      console.log("Kernel configuration:", this.config);
      console.log("Kernel configuration file path:", this.configPath);
      this.language = this.kernelSpec.grammarLanguage;
      this.executionCallbacks = {};
      this.watchCallbacks = [];
      this.watchSidebar = new WatchSidebar(this);
      this.statusView = new StatusView(this.language);
      projectPath = path.dirname(atom.workspace.getActiveTextEditor().getPath());
      this.connect();
      if (this.onlyConnect) {
        atom.notifications.addInfo('Using custom kernel connection:', {
          detail: this.configPath
        });
      } else {
        if (this.language === 'python' && (this.kernelSpec.argv == null)) {
          commandString = "ipython";
          args = ["kernel", "--no-secure", "--hb=" + this.config.hb_port, "--control=" + this.config.control_port, "--shell=" + this.config.shell_port, "--stdin=" + this.config.stdin_port, "--iopub=" + this.config.iopub_port, "--colors=NoColor"];
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
        }
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
            var kernelName, regexp, _ref;
            data = data.toString();
            console.log('Kernel: stdout:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              kernelName = (_ref = _this.kernelSpec.display_name) != null ? _ref : _this.language;
              return atom.notifications.addInfo(kernelName + ' kernel:', {
                detail: data,
                dismissable: true
              });
            }
          };
        })(this));
        this.kernelProcess.stderr.on('data', (function(_this) {
          return function(data) {
            var kernelName, regexp, _ref;
            data = data.toString();
            console.log('Kernel: stderr:', data);
            regexp = getKernelNotificationsRegExp();
            if (regexp != null ? regexp.test(data) : void 0) {
              kernelName = (_ref = _this.kernelSpec.display_name) != null ? _ref : _this.language;
              return atom.notifications.addError(kernelName + ' kernel:', {
                detail: data,
                dismissable: true
              });
            }
          };
        })(this));
      }
    }

    Kernel.prototype.connect = function() {
      var address, err, key, scheme;
      scheme = this.config.signature_scheme.slice('hmac-'.length);
      key = this.config.key;
      this.shellSocket = new jmp.Socket('dealer', scheme, key);
      this.controlSocket = new jmp.Socket('dealer', scheme, key);
      this.ioSocket = new jmp.Socket('sub', scheme, key);
      this.shellSocket.identity = 'dealer' + this.language + process.pid;
      this.controlSocket.identity = 'control' + this.language + process.pid;
      this.ioSocket.identity = 'sub' + this.language + process.pid;
      address = "" + this.config.transport + "://" + this.config.ip + ":";
      this.shellSocket.connect(address + this.config.shell_port);
      this.controlSocket.connect(address + this.config.control_port);
      this.ioSocket.connect(address + this.config.iopub_port);
      this.ioSocket.subscribe('');
      this.shellSocket.on('message', this.onShellMessage.bind(this));
      this.ioSocket.on('message', this.onIOMessage.bind(this));
      this.shellSocket.on('connect', function() {
        return console.log("shellSocket connected");
      });
      this.controlSocket.on('connect', function() {
        return console.log("controlSocket connected");
      });
      this.ioSocket.on('connect', function() {
        return console.log("ioSocket connected");
      });
      try {
        this.shellSocket.monitor();
        this.controlSocket.monitor();
        return this.ioSocket.monitor();
      } catch (_error) {
        err = _error;
        return console.log("Kernel:", err);
      }
    };

    Kernel.prototype.interrupt = function() {
      console.log("sending SIGINT");
      if (!this.onlyConnect) {
        return this.kernelProcess.kill('SIGINT');
      }
    };

    Kernel.prototype._execute = function(code, requestId, onResults) {
      var content, header, message;
      console.log("sending execute");
      header = {
        msg_id: requestId,
        username: "",
        session: "00000000-0000-0000-0000-000000000000",
        msg_type: "execute_request",
        version: "5.0"
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
      requestId = "execute_" + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    Kernel.prototype.executeWatch = function(code, onResults) {
      var requestId;
      requestId = "watch_" + uuid.v4();
      return this._execute(code, requestId, onResults);
    };

    Kernel.prototype.complete = function(code, onResults) {
      var column, content, header, message, requestId;
      console.log("sending completion");
      requestId = "complete_" + uuid.v4();
      column = code.length;
      header = {
        msg_id: requestId,
        username: "",
        session: "00000000-0000-0000-0000-000000000000",
        msg_type: "complete_request",
        version: "5.0"
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
      console.log("sending inspect");
      requestId = "inspect_" + uuid.v4();
      header = {
        msg_id: requestId,
        username: "",
        session: "00000000-0000-0000-0000-000000000000",
        msg_type: "inspect_request",
        version: "5.0"
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
      console.log("shell message:", message);
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
          return callback(message.content.matches);
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
      console.log("IO message:", message);
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
      if (result != null) {
        return callback(result);
      }
    };

    Kernel.prototype._isValidMessage = function(message) {
      if (message == null) {
        console.log("Invalid message: null");
        return false;
      }
      if (message.content == null) {
        console.log("Invalid message: Missing content");
        return false;
      }
      if (message.parent_header == null) {
        console.log("Invalid message: Missing parent_header");
        return false;
      }
      if (message.parent_header.msg_id == null) {
        console.log("Invalid message: Missing parent_header.msg_id");
        return false;
      }
      if (message.parent_header.msg_type == null) {
        console.log("Invalid message: Missing parent_header.msg_type");
        return false;
      }
      if (message.header == null) {
        console.log("Invalid message: Missing header");
        return false;
      }
      if (message.header.msg_id == null) {
        console.log("Invalid message: Missing header.msg_id");
        return false;
      }
      if (message.header.msg_type == null) {
        console.log("Invalid message: Missing header.msg_type");
        return false;
      }
      return true;
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
      var imageMimes, mime, result;
      if (data != null) {
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
      } else if (mime != null) {
        result = {
          data: {},
          type: mime,
          stream: 'pyout'
        };
        result.data[mime] = data[mime];
      }
      return result;
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
      var content, header, message, requestId;
      console.log("sending shutdown");
      requestId = uuid.v4();
      header = {
        msg_id: requestId,
        username: "",
        session: 0,
        msg_type: "shutdown_request",
        version: "5.0"
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
        atom.notifications.addInfo('Custom kernel connection:', {
          detail: "Shutdown request sent to custom kernel connection in " + this.configPath
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
