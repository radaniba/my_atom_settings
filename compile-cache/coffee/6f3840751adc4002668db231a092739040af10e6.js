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
    function Kernel(kernelSpec, grammar) {
      this.kernelSpec = kernelSpec;
      this.grammar = grammar;
      this.watchCallbacks = [];
      this.watchSidebar = new WatchSidebar(this);
      this.statusView = new StatusView(this.kernelSpec.display_name);
    }

    Kernel.prototype.addWatchCallback = function(watchCallback) {
      return this.watchCallbacks.push(watchCallback);
    };

    Kernel.prototype._callWatchCallbacks = function() {
      return this.watchCallbacks.forEach(function(watchCallback) {
        return watchCallback();
      });
    };

    Kernel.prototype.interrupt = function() {
      throw new Error('Kernel: interrupt method not implemented');
    };

    Kernel.prototype.shutdown = function() {
      throw new Error('Kernel: shutdown method not implemented');
    };

    Kernel.prototype.execute = function(code, onResults) {
      throw new Error('Kernel: execute method not implemented');
    };

    Kernel.prototype.executeWatch = function(code, onResults) {
      throw new Error('Kernel: executeWatch method not implemented');
    };

    Kernel.prototype.complete = function(code, onResults) {
      throw new Error('Kernel: complete method not implemented');
    };

    Kernel.prototype.inspect = function(code, cursor_pos, onResults) {
      throw new Error('Kernel: inspect method not implemented');
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
      return console.log('Kernel: Destroying base kernel');
    };

    return Kernel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSk4sQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQSxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBTlYsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQVJiLENBQUE7O0FBQUEsRUFTQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVGYsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDVyxJQUFBLGdCQUFFLFVBQUYsRUFBZSxPQUFmLEdBQUE7QUFDVCxNQURVLElBQUMsQ0FBQSxhQUFBLFVBQ1gsQ0FBQTtBQUFBLE1BRHVCLElBQUMsQ0FBQSxVQUFBLE9BQ3hCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEVBQWxCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsWUFBQSxDQUFhLElBQWIsQ0FGcEIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxVQUFBLENBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxZQUF2QixDQUhsQixDQURTO0lBQUEsQ0FBYjs7QUFBQSxxQkFPQSxnQkFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel.coffee
