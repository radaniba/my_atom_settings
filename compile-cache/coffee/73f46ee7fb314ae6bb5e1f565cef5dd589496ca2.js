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
        } else if (data.hasOwnProperty('text/markdown')) {
          mime = 'text/markdown';
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSk4sQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBTlYsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVGYsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDVyxJQUFBLGdCQUFFLFVBQUYsRUFBZSxNQUFmLEVBQXdCLFVBQXhCLEdBQUE7QUFDVCxVQUFBLHVFQUFBO0FBQUEsTUFEVSxJQUFDLENBQUEsYUFBQSxVQUNYLENBQUE7QUFBQSxNQUR1QixJQUFDLENBQUEsU0FBQSxNQUN4QixDQUFBO0FBQUEsTUFEZ0MsSUFBQyxDQUFBLGFBQUEsVUFDakMsQ0FBQTtBQUFBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCLElBQUMsQ0FBQSxVQUE3QixDQUFBLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosRUFBcUMsSUFBQyxDQUFBLE1BQXRDLENBREEsQ0FBQTtBQUFBLE1BRUEsT0FB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel.coffee
