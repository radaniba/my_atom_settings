(function() {
  var Kernel, StatusView, WatchSidebar, child_process, crypto, fs, path, uuid, zmq, _,
    __slice = [].slice;

  crypto = require('crypto');

  fs = require('fs');

  path = require('path');

  zmq = require('zmq');

  _ = require('lodash');

  child_process = require('child_process');

  uuid = require('uuid');

  StatusView = require('./status-view');

  WatchSidebar = require('./watch-sidebar');

  module.exports = Kernel = (function() {
    function Kernel(kernelInfo, config, configPath) {
      var args, commandString, grammar, projectPath;
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
      console.log("launching kernel:", commandString, args);
      this.kernelProcess = child_process.spawn(commandString, args, {
        cwd: projectPath
      });
      this.kernelProcess.stdout.on('data', function(data) {
        return console.log("kernel process received on stdout:", data.toString());
      });
      this.kernelProcess.stderr.on('data', function(data) {
        return console.error("kernel process received on stderr:", data.toString());
      });
    }

    Kernel.prototype.connect = function() {
      var address;
      this.shellSocket = zmq.socket('dealer');
      this.controlSocket = zmq.socket('dealer');
      this.ioSocket = zmq.socket('sub');
      this.shellSocket.identity = 'dealer' + this.language + process.pid;
      this.controlSocket.identity = 'control' + this.language + process.pid;
      this.ioSocket.identity = 'sub' + this.language + process.pid;
      address = "" + this.config.transport + "://" + this.config.ip + ":";
      this.shellSocket.connect(address + this.config.shell_port);
      this.controlSocket.connect(address + this.config.control_port);
      this.ioSocket.connect(address + this.config.iopub_port);
      this.ioSocket.subscribe('');
      this.shellSocket.on('message', this.onShellMessage.bind(this));
      return this.ioSocket.on('message', this.onIOMessage.bind(this));
    };

    Kernel.prototype.interrupt = function() {
      console.log("sending SIGINT");
      return this.kernelProcess.kill('SIGINT');
    };

    Kernel.prototype.signedSend = function(message, socket) {
      var encodedMessage, hmac, toBuffer;
      encodedMessage = {
        idents: message.idents || [],
        signature: '',
        header: JSON.stringify(message.header),
        parent_header: JSON.stringify(message.parent_header || {}),
        metadata: JSON.stringify(message.metadata || {}),
        content: JSON.stringify(message.content || {})
      };
      if (this.config.key) {
        hmac = crypto.createHmac(this.config.signature_scheme.slice(5), this.config.key);
        toBuffer = function(str) {
          return new Buffer(str, "utf8");
        };
        hmac.update(toBuffer(encodedMessage.header));
        hmac.update(toBuffer(encodedMessage.parent_header));
        hmac.update(toBuffer(encodedMessage.metadata));
        hmac.update(toBuffer(encodedMessage.content));
        encodedMessage.signature = hmac.digest("hex");
      }
      console.log(encodedMessage);
      return socket.send(encodedMessage.idents.concat(['<IDS|MSG>', encodedMessage.signature, encodedMessage.header, encodedMessage.parent_header, encodedMessage.metadata, encodedMessage.content]));
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
      return this.signedSend(message, this.shellSocket);
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
      return this.signedSend(message, this.shellSocket);
    };

    Kernel.prototype.addWatchCallback = function(watchCallback) {
      return this.watchCallbacks.push(watchCallback);
    };

    Kernel.prototype.onShellMessage = function() {
      var callback, errorString, matches, message, msgArray;
      msgArray = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      message = this.parseMessage(msgArray);
      console.log("shell message:", message);
      if (_.has(message, ['parent_header', 'msg_id'])) {
        callback = this.executionCallbacks[message.parent_header.msg_id];
      }
      if ((callback != null) && _.has(message, ['contents', 'status'])) {
        if (message.contents.status === 'ok') {
          if (message.type === 'complete_reply') {
            matches = message.contents.matches;
            return callback(matches);
          } else {
            return callback({
              data: 'ok',
              type: 'text',
              stream: 'status'
            });
          }
        } else if (message.contents.status === 'error') {
          errorString = message.contents.ename;
          if (message.contents.evalue.length > 0) {
            errorString = errorString + "\n" + message.contents.evalue;
          }
          return callback({
            data: errorString,
            type: 'text',
            stream: 'error'
          });
        }
      }
    };

    Kernel.prototype.onIOMessage = function() {
      var callback, message, msgArray, resultObject, status;
      msgArray = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      console.log("IO message");
      _.forEach(msgArray, function(msg) {
        return console.log("io:", msg.toString('utf8'));
      });
      message = this.parseMessage(msgArray);
      console.log(message);
      if (message.type === 'status') {
        status = message.contents.execution_state;
        this.statusView.setStatus(status);
        if (status === 'idle' && _.has(message, ['parent_header', 'msg_id'])) {
          if (message.parent_header.msg_id.startsWith('execute')) {
            _.forEach(this.watchCallbacks, function(watchCallback) {
              return watchCallback();
            });
          }
        }
      }
      if (_.has(message, ['parent_header', 'msg_id'])) {
        callback = this.executionCallbacks[message.parent_header.msg_id];
      }
      if ((callback != null) && (message.parent_header.msg_id != null)) {
        resultObject = this.getResultObject(message);
        if (resultObject != null) {
          return callback(resultObject);
        }
      }
    };

    Kernel.prototype.getResultObject = function(message) {
      var imageKey, imageKeys, stack, _ref;
      if (message.type === 'pyout' || message.type === 'display_data' || message.type === 'execute_result') {
        if (message.contents.data['text/html'] != null) {
          return {
            data: message.contents.data['text/html'],
            type: 'text/html',
            stream: 'pyout'
          };
        }
        if (message.contents.data['image/svg+xml'] != null) {
          return {
            data: message.contents.data['image/svg+xml'],
            type: 'image/svg+xml',
            stream: 'pyout'
          };
        }
        imageKeys = _.filter(_.keys(message.contents.data), function(key) {
          return key.startsWith('image');
        });
        imageKey = imageKeys[0];
        if (imageKey != null) {
          return {
            data: message.contents.data[imageKey],
            type: imageKey,
            stream: 'pyout'
          };
        } else {
          return {
            data: message.contents.data['text/plain'],
            type: 'text',
            stream: 'pyout'
          };
        }
      } else if (message.type === 'stdout' || message.prefix === 'stdout' || message.prefix === 'stream.stdout' || message.contents.name === 'stdout') {
        return {
          data: (_ref = message.contents.text) != null ? _ref : message.contents.data,
          type: 'text',
          stream: 'stdout'
        };
      } else if (message.type === 'pyerr' || message.type === 'error') {
        stack = message.contents.traceback;
        stack = _.map(stack, function(item) {
          return item.trim();
        });
        stack = stack.join('\n');
        return {
          data: stack,
          type: 'text',
          stream: 'error'
        };
      }
    };

    Kernel.prototype.parseMessage = function(msg) {
      var i, msgObject;
      i = 0;
      while (msg[i].toString('utf8') !== '<IDS|MSG>') {
        i++;
      }
      msgObject = {
        prefix: msg[0].toString('utf8'),
        header: JSON.parse(msg[i + 2].toString('utf8')),
        parent_header: JSON.parse(msg[i + 3].toString('utf8')),
        metadata: JSON.parse(msg[i + 4].toString('utf8')),
        contents: JSON.parse(msg[i + 5].toString('utf8'))
      };
      msgObject.type = msgObject.header.msg_type;
      return msgObject;
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
      this.signedSend(message, this.shellSocket);
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
        throw "No grammar found for language " + language;
      } else {
        return matchingGrammars[0];
      }
    };

    return Kernel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrRUFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxlQUFSLENBTGhCLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FUZixDQUFBOztBQUFBLEVBV0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNXLElBQUEsZ0JBQUUsVUFBRixFQUFlLE1BQWYsRUFBd0IsVUFBeEIsR0FBQTtBQUNULFVBQUEseUNBQUE7QUFBQSxNQURVLElBQUMsQ0FBQSxhQUFBLFVBQ1gsQ0FBQTtBQUFBLE1BRHVCLElBQUMsQ0FBQSxTQUFBLE1BQ3hCLENBQUE7QUFBQSxNQURnQyxJQUFDLENBQUEsYUFBQSxVQUNqQyxDQUFBO0FBQUEsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsSUFBQyxDQUFBLFVBQTdCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFD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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel.coffee
