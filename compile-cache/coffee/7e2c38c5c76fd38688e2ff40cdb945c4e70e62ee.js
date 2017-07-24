(function() {
  var InputView, Kernel, RenameView, WSKernel, child_process, path, services, uuid, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  child_process = require('child_process');

  path = require('path');

  _ = require('lodash');

  uuid = require('uuid');

  services = require('./jupyter-js-services-shim');

  Kernel = require('./kernel');

  InputView = require('./input-view');

  RenameView = require('./rename-view');

  module.exports = WSKernel = (function(_super) {
    __extends(WSKernel, _super);

    function WSKernel(kernelSpec, grammar, session) {
      this.session = session;
      WSKernel.__super__.constructor.call(this, kernelSpec, grammar);
      this.session.statusChanged.connect((function(_this) {
        return function() {
          return _this._onStatusChange();
        };
      })(this));
      this._onStatusChange();
    }

    WSKernel.prototype.interrupt = function() {
      return this.session.kernel.interrupt();
    };

    WSKernel.prototype.shutdown = function() {
      return this.session.kernel.shutdown();
    };

    WSKernel.prototype.restart = function() {
      return this.session.kernel.restart();
    };

    WSKernel.prototype._onStatusChange = function() {
      return this.statusView.setStatus(this.session.status);
    };

    WSKernel.prototype._execute = function(code, onResults, callWatches) {
      var future;
      future = this.session.kernel.execute({
        code: code
      });
      future.onIOPub = (function(_this) {
        return function(message) {
          var result;
          if (callWatches && message.header.msg_type === 'status' && message.content.execution_state === 'idle') {
            _this._callWatchCallbacks();
          }
          if (onResults != null) {
            console.log('WSKernel: _execute:', message);
            result = _this._parseIOMessage(message);
            if (result != null) {
              return onResults(result);
            }
          }
        };
      })(this);
      future.onReply = function(message) {
        var result;
        if (message.content.status === 'error') {
          return;
        }
        result = {
          data: 'ok',
          type: 'text',
          stream: 'status'
        };
        return typeof onResults === "function" ? onResults(result) : void 0;
      };
      return future.onStdin = (function(_this) {
        return function(message) {
          var inputView, prompt;
          if (message.header.msg_type !== 'input_request') {
            return;
          }
          prompt = message.content.prompt;
          inputView = new InputView(prompt, function(input) {
            return _this.session.kernel.sendInputReply({
              value: input
            });
          });
          return inputView.attach();
        };
      })(this);
    };

    WSKernel.prototype.execute = function(code, onResults) {
      return this._execute(code, onResults, true);
    };

    WSKernel.prototype.executeWatch = function(code, onResults) {
      return this._execute(code, onResults, false);
    };

    WSKernel.prototype.complete = function(code, onResults) {
      return this.session.kernel.complete({
        code: code,
        cursor_pos: code.length
      }).then(function(message) {
        return typeof onResults === "function" ? onResults(message.content) : void 0;
      });
    };

    WSKernel.prototype.inspect = function(code, cursor_pos, onResults) {
      return this.session.kernel.inspect({
        code: code,
        cursor_pos: cursor_pos,
        detail_level: 0
      }).then(function(message) {
        return typeof onResults === "function" ? onResults({
          data: message.content.data,
          found: message.content.found
        }) : void 0;
      });
    };

    WSKernel.prototype.promptRename = function() {
      var view;
      view = new RenameView('Name your current session', this.session.path, (function(_this) {
        return function(input) {
          return _this.session.rename(input);
        };
      })(this));
      return view.attach();
    };

    WSKernel.prototype.destroy = function() {
      console.log('WSKernel: destroying jupyter-js-services Session');
      this.session.dispose();
      return WSKernel.__super__.destroy.apply(this, arguments);
    };

    return WSKernel;

  })(Kernel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd3Mta2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsZUFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSw0QkFBUixDQUxYLENBQUE7O0FBQUEsRUFPQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FQVCxDQUFBOztBQUFBLEVBUUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBUlosQ0FBQTs7QUFBQSxFQVNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVRiLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0YsK0JBQUEsQ0FBQTs7QUFBYSxJQUFBLGtCQUFDLFVBQUQsRUFBYSxPQUFiLEVBQXVCLE9BQXZCLEdBQUE7QUFDVCxNQUQrQixJQUFDLENBQUEsVUFBQSxPQUNoQyxDQUFBO0FBQUEsTUFBQSwwQ0FBTSxVQUFOLEVBQWtCLE9BQWxCLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBdkIsQ0FBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEv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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/ws-kernel.coffee
