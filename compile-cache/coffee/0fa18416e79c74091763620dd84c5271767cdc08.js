(function() {
  var Kernel, StatusView, WatchSidebar, child_process, crypto, fs, jmp, path, uuid, zmq, _;

  child_process = require('child_process');

  crypto = require('crypto');

  fs = require('fs');

  path = require('path');

  _ = require('lodash');

  jmp = require('jmp');

  uuid = require('uuid');

  zmq = jmp.zmq;

  StatusView = require('./status-view');

  WatchSidebar = require('./watch-sidebar');

  module.exports = Kernel = (function() {
    function Kernel(kernelInfo, config, configPath) {
      var args, commandString, getKernelNotificationsRegExp, grammar, projectPath;
      this.kernelInfo = kernelInfo;
      this.config = config;
      this.configPath = configPath;
      console.log("Kernel info:", this.kernelInfo);
      console.log("Kernel configuration:", this.config);
      console.log("Kernel configuration file path:", this.configPath);
      this.language = this.kernelInfo.language.toLowerCase();
      this.executionCallbacks = {};
      this.watchCallbacks = [];
      grammar = this.getGrammarForLanguage(this.kernelInfo.grammarLanguage);
      this.watchSidebar = new WatchSidebar(this, grammar);
      this.statusView = new StatusView(this.language);
      projectPath = path.dirname(atom.workspace.getActiveTextEditor().getPath());
      this.connect();
      if (this.language === 'python' && (this.kernelInfo.argv == null)) {
        commandString = "ipython";
        args = ["kernel", "--no-secure", "--hb=" + this.config.hb_port, "--control=" + this.config.control_port, "--shell=" + this.config.shell_port, "--stdin=" + this.config.stdin_port, "--iopub=" + this.config.iopub_port, "--colors=NoColor"];
      } else {
        commandString = _.first(this.kernelInfo.argv);
        args = _.rest(this.kernelInfo.argv);
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
            kernelName = (_ref = _this.kernelInfo.display_name) != null ? _ref : _this.language;
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
            kernelName = (_ref = _this.kernelInfo.display_name) != null ? _ref : _this.language;
            return atom.notifications.addError(kernelName + ' kernel:', {
              detail: data,
              dismissable: true
            });
          }
        };
      })(this));
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
      return this.kernelProcess.kill('SIGINT');
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
      return this.kernelProcess.kill('SIGKILL');
    };

    Kernel.prototype.getGrammarForLanguage = function(language) {
      var matchingGrammars;
      matchingGrammars = atom.grammars.getGrammars().filter(function(grammar) {
        return grammar !== atom.grammars.nullGrammar && (grammar.name != null) && (grammar.name.toLowerCase != null) && grammar.name.toLowerCase() === language;
      });
      if (matchingGrammars[0] == null) {
        throw new Error("No grammar found for language " + language);
      } else {
        return matchingGrammars[0];
      }
    };

    return Kernel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvRkFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUxKLENBQUE7O0FBQUEsRUFNQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FOTixDQUFBOztBQUFBLEVBT0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBUFAsQ0FBQTs7QUFBQSxFQVFBLEdBQUEsR0FBTSxHQUFHLENBQUMsR0FSVixDQUFBOztBQUFBLEVBVUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBVmIsQ0FBQTs7QUFBQSxFQVdBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FYZixDQUFBOztBQUFBLEVBYUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNXLElBQUEsZ0JBQUUsVUFBRixFQUFlLE1BQWYsRUFBd0IsVUFBeEIsR0FBQTtBQUNULFVBQUEsdUVBQUE7QUFBQSxNQURVLElBQUMsQ0FBQSxhQUFBLFVBQ1gsQ0FBQTtBQUFBLE1BRHVCLElBQUMsQ0FBQSxTQUFBLE1BQ3hCLENBQUE7QUFBQSxNQURnQyxJQUFDLENBQUEsYUFBQSxVQUNqQyxDQUFBO0FBQUEsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsSUFBQyxDQUFBLFVBQTdC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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel.coffee
