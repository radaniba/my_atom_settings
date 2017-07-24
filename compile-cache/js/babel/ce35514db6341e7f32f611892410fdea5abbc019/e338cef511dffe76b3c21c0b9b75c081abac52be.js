Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _statusView = require('./status-view');

var _statusView2 = _interopRequireDefault(_statusView);

var _watchSidebar = require('./watch-sidebar');

var _watchSidebar2 = _interopRequireDefault(_watchSidebar);

var _pluginApiHydrogenKernel = require('./plugin-api/hydrogen-kernel');

var _pluginApiHydrogenKernel2 = _interopRequireDefault(_pluginApiHydrogenKernel);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var Kernel = (function () {
  function Kernel(kernelSpec, grammar) {
    _classCallCheck(this, Kernel);

    this.kernelSpec = kernelSpec;
    this.grammar = grammar;
    this.watchCallbacks = [];

    this.watchSidebar = new _watchSidebar2['default'](this);
    this.statusView = new _statusView2['default'](this.kernelSpec.display_name);

    this.emitter = new _atom.Emitter();

    this.pluginWrapper = null;
  }

  _createClass(Kernel, [{
    key: 'getPluginWrapper',
    value: function getPluginWrapper() {
      if (!this.pluginWrapper) {
        this.pluginWrapper = new _pluginApiHydrogenKernel2['default'](this);
      }

      return this.pluginWrapper;
    }
  }, {
    key: 'addWatchCallback',
    value: function addWatchCallback(watchCallback) {
      this.watchCallbacks.push(watchCallback);
    }
  }, {
    key: '_callWatchCallbacks',
    value: function _callWatchCallbacks() {
      this.watchCallbacks.forEach(function (watchCallback) {
        return watchCallback();
      });
    }
  }, {
    key: 'interrupt',
    value: function interrupt() {
      throw new Error('Kernel: interrupt method not implemented');
    }
  }, {
    key: 'shutdown',
    value: function shutdown() {
      throw new Error('Kernel: shutdown method not implemented');
    }
  }, {
    key: 'execute',
    value: function execute() {
      throw new Error('Kernel: execute method not implemented');
    }
  }, {
    key: 'executeWatch',
    value: function executeWatch() {
      throw new Error('Kernel: executeWatch method not implemented');
    }
  }, {
    key: 'complete',
    value: function complete() {
      throw new Error('Kernel: complete method not implemented');
    }
  }, {
    key: 'inspect',
    value: function inspect() {
      throw new Error('Kernel: inspect method not implemented');
    }
  }, {
    key: '_parseIOMessage',
    value: function _parseIOMessage(message) {
      var result = this._parseDisplayIOMessage(message);

      if (!result) {
        result = this._parseResultIOMessage(message);
      }

      if (!result) {
        result = this._parseErrorIOMessage(message);
      }

      if (!result) {
        result = this._parseStreamIOMessage(message);
      }

      if (!result) {
        result = this._parseExecuteInputIOMessage(message);
      }

      return result;
    }
  }, {
    key: '_parseDisplayIOMessage',
    value: function _parseDisplayIOMessage(message) {
      if (message.header.msg_type === 'display_data') {
        return this._parseDataMime(message.content.data);
      }
      return null;
    }

    /* eslint-disable camelcase*/
  }, {
    key: '_parseResultIOMessage',
    value: function _parseResultIOMessage(message) {
      var msg_type = message.header.msg_type;

      if (msg_type === 'execute_result' || msg_type === 'pyout') {
        return this._parseDataMime(message.content.data);
      }
      return null;
    }

    /* eslint-enable camelcase*/

  }, {
    key: '_parseDataMime',
    value: function _parseDataMime(data) {
      if (!data) {
        return null;
      }

      var mime = this._getMimeType(data);

      if (!mime) {
        return null;
      }

      var result = undefined;
      if (mime === 'text/plain') {
        result = {
          data: {
            'text/plain': data[mime]
          },
          type: 'text',
          stream: 'pyout'
        };
      } else {
        result = {
          data: {},
          type: mime,
          stream: 'pyout'
        };
        result.data[mime] = data[mime];
      }

      return result;
    }
  }, {
    key: '_getMimeType',
    value: function _getMimeType(data) {
      var imageMimes = Object.getOwnPropertyNames(data).filter(function (mime) {
        return mime.startsWith('image/');
      });

      var mime = undefined;
      if (({}).hasOwnProperty.call(data, 'text/html')) {
        mime = 'text/html';
      } else if (({}).hasOwnProperty.call(data, 'image/svg+xml')) {
        mime = 'image/svg+xml';
      } else if (!(imageMimes.length === 0)) {
        mime = imageMimes[0];
      } else if (({}).hasOwnProperty.call(data, 'text/markdown')) {
        mime = 'text/markdown';
      } else if (({}).hasOwnProperty.call(data, 'application/pdf')) {
        mime = 'application/pdf';
      } else if (({}).hasOwnProperty.call(data, 'text/latex')) {
        mime = 'text/latex';
      } else if (({}).hasOwnProperty.call(data, 'text/plain')) {
        mime = 'text/plain';
      }

      return mime;
    }

    /* eslint-disable camelcase*/
  }, {
    key: '_parseErrorIOMessage',
    value: function _parseErrorIOMessage(message) {
      var msg_type = message.header.msg_type;

      if (msg_type === 'error' || msg_type === 'pyerr') {
        return this._parseErrorMessage(message);
      }

      return null;
    }

    /* eslint-enable camelcase*/

  }, {
    key: '_parseErrorMessage',
    value: function _parseErrorMessage(message) {
      var errorString = undefined;
      try {
        errorString = message.content.traceback.join('\n');
      } catch (err) {
        var ename = message.content.ename ? message.content.ename : '';
        var evalue = message.content.evalue ? message.content.evalue : '';
        errorString = ename + ': ' + evalue;
      }

      var result = {
        data: {
          'text/plain': errorString
        },
        type: 'text',
        stream: 'error'
      };

      return result;
    }
  }, {
    key: '_parseStreamIOMessage',
    value: function _parseStreamIOMessage(message) {
      var result = undefined;
      if (message.header.msg_type === 'stream') {
        result = {
          data: {
            'text/plain': message.content.text ? message.content.text : message.content.data
          },
          type: 'text',
          stream: message.content.name
        };

        // For kernels that do not conform to the messaging standard
      } else if (message.idents === 'stdout' || message.idents === 'stream.stdout' || message.content.name === 'stdout') {
          result = {
            data: {
              'text/plain': message.content.text ? message.content.text : message.content.data
            },
            type: 'text',
            stream: 'stdout'
          };

          // For kernels that do not conform to the messaging standard
        } else if (message.idents === 'stderr' || message.idents === 'stream.stderr' || message.content.name === 'stderr') {
            result = {
              data: {
                'text/plain': message.content.text ? message.content.text : message.content.data
              },
              type: 'text',
              stream: 'stderr'
            };
          }

      return result;
    }
  }, {
    key: '_parseExecuteInputIOMessage',
    value: function _parseExecuteInputIOMessage(message) {
      if (message.header.msg_type === 'execute_input') {
        return {
          data: message.content.execution_count,
          type: 'number',
          stream: 'execution_count'
        };
      }

      return null;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      (0, _log2['default'])('Kernel: Destroying base kernel');
      if (this.pluginWrapper) {
        this.pluginWrapper.destroyed = true;
      }
      this.emitter.emit('did-destroy');
      this.emitter.dispose();
    }
  }]);

  return Kernel;
})();

exports['default'] = Kernel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV3QixNQUFNOzswQkFFUCxlQUFlOzs7OzRCQUNiLGlCQUFpQjs7Ozt1Q0FDZiw4QkFBOEI7Ozs7bUJBQ3pDLE9BQU87Ozs7QUFQdkIsV0FBVyxDQUFDOztJQVNTLE1BQU07QUFDZCxXQURRLE1BQU0sQ0FDYixVQUFVLEVBQUUsT0FBTyxFQUFFOzBCQURkLE1BQU07O0FBRXZCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDOztBQUV6QixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUFpQixJQUFJLENBQUMsQ0FBQztBQUMzQyxRQUFJLENBQUMsVUFBVSxHQUFHLDRCQUFlLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0IsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7R0FDM0I7O2VBWmtCLE1BQU07O1dBY1QsNEJBQUc7QUFDakIsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGFBQWEsR0FBRyx5Q0FBbUIsSUFBSSxDQUFDLENBQUM7T0FDL0M7O0FBRUQsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzNCOzs7V0FFZSwwQkFBQyxhQUFhLEVBQUU7QUFDOUIsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDekM7OztXQUdrQiwrQkFBRztBQUNwQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLGFBQWE7ZUFBSSxhQUFhLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDL0Q7OztXQUdR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Q3JDLGNBQUksRUFBRSxRQUFRO0FBQ2QsZ0JBQU0sRUFBRSxpQkFBaUI7U0FDMUIsQ0FBQztPQUNIOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVNLG1CQUFHO0FBQ1IsNEJBQUksZ0NBQWdDLENBQUMsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO09BQ3JDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7O1NBNVBrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgRW1pdHRlciB9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgU3RhdHVzVmlldyBmcm9tICcuL3N0YXR1cy12aWV3JztcbmltcG9ydCBXYXRjaFNpZGViYXIgZnJvbSAnLi93YXRjaC1zaWRlYmFyJztcbmltcG9ydCBIeWRyb2dlbktlcm5lbCBmcm9tICcuL3BsdWdpbi1hcGkvaHlkcm9nZW4ta2VybmVsJztcbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXJuZWwge1xuICBjb25zdHJ1Y3RvcihrZXJuZWxTcGVjLCBncmFtbWFyKSB7XG4gICAgdGhpcy5rZXJuZWxTcGVjID0ga2VybmVsU3BlYztcbiAgICB0aGlzLmdyYW1tYXIgPSBncmFtbWFyO1xuICAgIHRoaXMud2F0Y2hDYWxsYmFja3MgPSBbXTtcblxuICAgIHRoaXMud2F0Y2hTaWRlYmFyID0gbmV3IFdhdGNoU2lkZWJhcih0aGlzKTtcbiAgICB0aGlzLnN0YXR1c1ZpZXcgPSBuZXcgU3RhdHVzVmlldyh0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lKTtcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnBsdWdpbldyYXBwZXIgPSBudWxsO1xuICB9XG5cbiAgZ2V0UGx1Z2luV3JhcHBlcigpIHtcbiAgICBpZiAoIXRoaXMucGx1Z2luV3JhcHBlcikge1xuICAgICAgdGhpcy5wbHVnaW5XcmFwcGVyID0gbmV3IEh5ZHJvZ2VuS2VybmVsKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBsdWdpbldyYXBwZXI7XG4gIH1cblxuICBhZGRXYXRjaENhbGxiYWNrKHdhdGNoQ2FsbGJhY2spIHtcbiAgICB0aGlzLndhdGNoQ2FsbGJhY2tzLnB1c2god2F0Y2hDYWxsYmFjayk7XG4gIH1cblxuXG4gIF9jYWxsV2F0Y2hDYWxsYmFja3MoKSB7XG4gICAgdGhpcy53YXRjaENhbGxiYWNrcy5mb3JFYWNoKHdhdGNoQ2FsbGJhY2sgPT4gd2F0Y2hDYWxsYmFjaygpKTtcbiAgfVxuXG5cbiAgaW50ZXJydXB0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignS2VybmVsOiBpbnRlcnJ1cHQgbWV0aG9kIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cblxuICBzaHV0ZG93bigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0tlcm5lbDogc2h1dGRvd24gbWV0aG9kIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cblxuICBleGVjdXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignS2VybmVsOiBleGVjdXRlIG1ldGhvZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG5cbiAgZXhlY3V0ZVdhdGNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignS2VybmVsOiBleGVjdXRlV2F0Y2ggbWV0aG9kIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cblxuICBjb21wbGV0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0tlcm5lbDogY29tcGxldGUgbWV0aG9kIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cblxuICBpbnNwZWN0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignS2VybmVsOiBpbnNwZWN0IG1ldGhvZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG5cbiAgX3BhcnNlSU9NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fcGFyc2VEaXNwbGF5SU9NZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3BhcnNlUmVzdWx0SU9NZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9wYXJzZUVycm9ySU9NZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9wYXJzZVN0cmVhbUlPTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fcGFyc2VFeGVjdXRlSW5wdXRJT01lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgX3BhcnNlRGlzcGxheUlPTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlID09PSAnZGlzcGxheV9kYXRhJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlRGF0YU1pbWUobWVzc2FnZS5jb250ZW50LmRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSovXG4gIF9wYXJzZVJlc3VsdElPTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3QgeyBtc2dfdHlwZSB9ID0gbWVzc2FnZS5oZWFkZXI7XG5cbiAgICBpZiAobXNnX3R5cGUgPT09ICdleGVjdXRlX3Jlc3VsdCcgfHwgbXNnX3R5cGUgPT09ICdweW91dCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZURhdGFNaW1lKG1lc3NhZ2UuY29udGVudC5kYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UqL1xuXG5cbiAgX3BhcnNlRGF0YU1pbWUoZGF0YSkge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWltZSA9IHRoaXMuX2dldE1pbWVUeXBlKGRhdGEpO1xuXG4gICAgaWYgKCFtaW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChtaW1lID09PSAndGV4dC9wbGFpbicpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICd0ZXh0L3BsYWluJzogZGF0YVttaW1lXSxcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBzdHJlYW06ICdweW91dCcsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgICB0eXBlOiBtaW1lLFxuICAgICAgICBzdHJlYW06ICdweW91dCcsXG4gICAgICB9O1xuICAgICAgcmVzdWx0LmRhdGFbbWltZV0gPSBkYXRhW21pbWVdO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIF9nZXRNaW1lVHlwZShkYXRhKSB7XG4gICAgY29uc3QgaW1hZ2VNaW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGRhdGEpLmZpbHRlcihtaW1lID0+IG1pbWUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpO1xuXG4gICAgbGV0IG1pbWU7XG4gICAgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgJ3RleHQvaHRtbCcpKSB7XG4gICAgICBtaW1lID0gJ3RleHQvaHRtbCc7XG4gICAgfSBlbHNlIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdpbWFnZS9zdmcreG1sJykpIHtcbiAgICAgIG1pbWUgPSAnaW1hZ2Uvc3ZnK3htbCc7XG4gICAgfSBlbHNlIGlmICghKGltYWdlTWltZXMubGVuZ3RoID09PSAwKSkge1xuICAgICAgbWltZSA9IGltYWdlTWltZXNbMF07XG4gICAgfSBlbHNlIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICd0ZXh0L21hcmtkb3duJykpIHtcbiAgICAgIG1pbWUgPSAndGV4dC9tYXJrZG93bic7XG4gICAgfSBlbHNlIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsICdhcHBsaWNhdGlvbi9wZGYnKSkge1xuICAgICAgbWltZSA9ICdhcHBsaWNhdGlvbi9wZGYnO1xuICAgIH0gZWxzZSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCAndGV4dC9sYXRleCcpKSB7XG4gICAgICBtaW1lID0gJ3RleHQvbGF0ZXgnO1xuICAgIH0gZWxzZSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCAndGV4dC9wbGFpbicpKSB7XG4gICAgICBtaW1lID0gJ3RleHQvcGxhaW4nO1xuICAgIH1cblxuICAgIHJldHVybiBtaW1lO1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlKi9cbiAgX3BhcnNlRXJyb3JJT01lc3NhZ2UobWVzc2FnZSkge1xuICAgIGNvbnN0IHsgbXNnX3R5cGUgfSA9IG1lc3NhZ2UuaGVhZGVyO1xuXG4gICAgaWYgKG1zZ190eXBlID09PSAnZXJyb3InIHx8IG1zZ190eXBlID09PSAncHllcnInKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VFcnJvck1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UqL1xuXG5cbiAgX3BhcnNlRXJyb3JNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBsZXQgZXJyb3JTdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIGVycm9yU3RyaW5nID0gbWVzc2FnZS5jb250ZW50LnRyYWNlYmFjay5qb2luKCdcXG4nKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IGVuYW1lID0gbWVzc2FnZS5jb250ZW50LmVuYW1lID8gbWVzc2FnZS5jb250ZW50LmVuYW1lIDogJyc7XG4gICAgICBjb25zdCBldmFsdWUgPSBtZXNzYWdlLmNvbnRlbnQuZXZhbHVlID8gbWVzc2FnZS5jb250ZW50LmV2YWx1ZSA6ICcnO1xuICAgICAgZXJyb3JTdHJpbmcgPSBgJHtlbmFtZX06ICR7ZXZhbHVlfWA7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgZGF0YToge1xuICAgICAgICAndGV4dC9wbGFpbic6IGVycm9yU3RyaW5nLFxuICAgICAgfSxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHN0cmVhbTogJ2Vycm9yJyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIF9wYXJzZVN0cmVhbUlPTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAobWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgPT09ICdzdHJlYW0nKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAndGV4dC9wbGFpbic6IG1lc3NhZ2UuY29udGVudC50ZXh0ID8gbWVzc2FnZS5jb250ZW50LnRleHQgOiBtZXNzYWdlLmNvbnRlbnQuZGF0YSxcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBzdHJlYW06IG1lc3NhZ2UuY29udGVudC5uYW1lLFxuICAgICAgfTtcblxuICAgICAgLy8gRm9yIGtlcm5lbHMgdGhhdCBkbyBub3QgY29uZm9ybSB0byB0aGUgbWVzc2FnaW5nIHN0YW5kYXJkXG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLmlkZW50cyA9PT0gJ3N0ZG91dCcgfHxcbiAgICAgIG1lc3NhZ2UuaWRlbnRzID09PSAnc3RyZWFtLnN0ZG91dCcgfHxcbiAgICAgIG1lc3NhZ2UuY29udGVudC5uYW1lID09PSAnc3Rkb3V0Jykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgJ3RleHQvcGxhaW4nOiBtZXNzYWdlLmNvbnRlbnQudGV4dCA/IG1lc3NhZ2UuY29udGVudC50ZXh0IDogbWVzc2FnZS5jb250ZW50LmRhdGEsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgc3RyZWFtOiAnc3Rkb3V0JyxcbiAgICAgIH07XG5cbiAgICAgIC8vIEZvciBrZXJuZWxzIHRoYXQgZG8gbm90IGNvbmZvcm0gdG8gdGhlIG1lc3NhZ2luZyBzdGFuZGFyZFxuICAgIH0gZWxzZSBpZiAobWVzc2FnZS5pZGVudHMgPT09ICdzdGRlcnInIHx8XG4gICAgICBtZXNzYWdlLmlkZW50cyA9PT0gJ3N0cmVhbS5zdGRlcnInIHx8XG4gICAgICBtZXNzYWdlLmNvbnRlbnQubmFtZSA9PT0gJ3N0ZGVycicpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICd0ZXh0L3BsYWluJzogbWVzc2FnZS5jb250ZW50LnRleHQgPyBtZXNzYWdlLmNvbnRlbnQudGV4dCA6IG1lc3NhZ2UuY29udGVudC5kYXRhLFxuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHN0cmVhbTogJ3N0ZGVycicsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBfcGFyc2VFeGVjdXRlSW5wdXRJT01lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSA9PT0gJ2V4ZWN1dGVfaW5wdXQnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBtZXNzYWdlLmNvbnRlbnQuZXhlY3V0aW9uX2NvdW50LFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgc3RyZWFtOiAnZXhlY3V0aW9uX2NvdW50JyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGxvZygnS2VybmVsOiBEZXN0cm95aW5nIGJhc2Uga2VybmVsJyk7XG4gICAgaWYgKHRoaXMucGx1Z2luV3JhcHBlcikge1xuICAgICAgdGhpcy5wbHVnaW5XcmFwcGVyLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==