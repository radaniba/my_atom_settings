Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _kernel = require('./kernel');

var _kernel2 = _interopRequireDefault(_kernel);

var _inputView = require('./input-view');

var _inputView2 = _interopRequireDefault(_inputView);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var WSKernel = (function (_Kernel) {
  _inherits(WSKernel, _Kernel);

  function WSKernel(kernelSpec, grammar, session) {
    var _this = this;

    _classCallCheck(this, WSKernel);

    _get(Object.getPrototypeOf(WSKernel.prototype), 'constructor', this).call(this, kernelSpec, grammar);
    this.session = session;

    this.session.statusChanged.connect(function () {
      return _this._onStatusChange();
    });
    this._onStatusChange(); // Set initial status correctly
  }

  _createClass(WSKernel, [{
    key: 'interrupt',
    value: function interrupt() {
      return this.session.kernel.interrupt();
    }
  }, {
    key: 'shutdown',
    value: function shutdown() {
      return this.session.kernel.shutdown();
    }
  }, {
    key: 'restart',
    value: function restart() {
      return this.session.kernel.restart();
    }
  }, {
    key: '_onStatusChange',
    value: function _onStatusChange() {
      var status = this.session.status;
      this.statusView.setStatus(status);
      this.executionState = status;
    }
  }, {
    key: '_execute',
    value: function _execute(code, callWatches, onResults) {
      var _this2 = this;

      var future = this.session.kernel.requestExecute({ code: code });

      future.onIOPub = function (message) {
        if (callWatches && message.header.msg_type === 'status' && message.content.execution_state === 'idle') {
          _this2._callWatchCallbacks();
        }

        if (onResults) {
          (0, _log2['default'])('WSKernel: _execute:', message);
          var result = _this2._parseIOMessage(message);
          if (result) onResults(result);
        }
      };

      future.onReply = function (message) {
        if (message.content.status === 'error') {
          return;
        }
        var result = {
          data: 'ok',
          type: 'text',
          stream: 'status'
        };
        if (onResults) onResults(result);
      };

      future.onStdin = function (message) {
        if (message.header.msg_type !== 'input_request') {
          return;
        }

        var prompt = message.content.prompt;

        var inputView = new _inputView2['default']({ prompt: prompt }, function (input) {
          return _this2.session.kernel.sendInputReply({ value: input });
        });

        inputView.attach();
      };
    }
  }, {
    key: 'execute',
    value: function execute(code, onResults) {
      this._execute(code, true, onResults);
    }
  }, {
    key: 'executeWatch',
    value: function executeWatch(code, onResults) {
      this._execute(code, false, onResults);
    }
  }, {
    key: 'complete',
    value: function complete(code, onResults) {
      this.session.kernel.requestComplete({
        code: code,
        cursor_pos: code.length
      }).then(function (message) {
        return onResults(message.content);
      });
    }
  }, {
    key: 'inspect',
    value: function inspect(code, cursorPos, onResults) {
      this.session.kernel.requestInspect({
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      }).then(function (message) {
        return onResults({
          data: message.content.data,
          found: message.content.found
        });
      });
    }
  }, {
    key: 'promptRename',
    value: function promptRename() {
      var _this3 = this;

      var view = new _inputView2['default']({
        prompt: 'Name your current session',
        defaultText: this.session.path,
        allowCancel: true
      }, function (input) {
        return _this3.session.rename(input);
      });

      view.attach();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      (0, _log2['default'])('WSKernel: destroying jupyter-js-services Session');
      this.session.dispose();
      _get(Object.getPrototypeOf(WSKernel.prototype), 'destroy', this).apply(this, arguments);
    }
  }]);

  return WSKernel;
})(_kernel2['default']);

exports['default'] = WSKernel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dzLWtlcm5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFbUIsVUFBVTs7Ozt5QkFDUCxjQUFjOzs7O21CQUNwQixPQUFPOzs7O0FBSnZCLFdBQVcsQ0FBQzs7SUFNUyxRQUFRO1lBQVIsUUFBUTs7QUFDaEIsV0FEUSxRQUFRLENBQ2YsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7OzswQkFEdkIsUUFBUTs7QUFFekIsK0JBRmlCLFFBQVEsNkNBRW5CLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDM0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQzthQUFNLE1BQUssZUFBZSxFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQ2pFLFFBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztHQUN4Qjs7ZUFQa0IsUUFBUTs7V0FTbEIscUJBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3hDOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7OztXQUVNLG1CQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDbkMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7S0FDOUI7OztXQUVPLGtCQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFOzs7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QUVXLHdCQUFHOzs7QUFDYixVQUFNLElBQUksR0FBRywyQkFDWDtBQUNFLGNBQU0sRUFBRSwyQkFBMkI7QUFDbkMsbUJBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7QUFDOUIsbUJBQVcsRUFBRSxJQUFJO09BQ2xCLEVBQ0QsVUFBQSxLQUFLO2VBQUksT0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVNLG1CQUFHO0FBQ1IsNEJBQUksa0RBQWtELENBQUMsQ0FBQztBQUN4RCxVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLGlDQXBIaUIsUUFBUSwwQ0FvSFIsU0FBUyxFQUFFO0tBQzdCOzs7U0FySGtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dzLWtlcm5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgS2VybmVsIGZyb20gJy4va2VybmVsJztcbmltcG9ydCBJbnB1dFZpZXcgZnJvbSAnLi9pbnB1dC12aWV3JztcbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXU0tlcm5lbCBleHRlbmRzIEtlcm5lbCB7XG4gIGNvbnN0cnVjdG9yKGtlcm5lbFNwZWMsIGdyYW1tYXIsIHNlc3Npb24pIHtcbiAgICBzdXBlcihrZXJuZWxTcGVjLCBncmFtbWFyKTtcbiAgICB0aGlzLnNlc3Npb24gPSBzZXNzaW9uO1xuXG4gICAgdGhpcy5zZXNzaW9uLnN0YXR1c0NoYW5nZWQuY29ubmVjdCgoKSA9PiB0aGlzLl9vblN0YXR1c0NoYW5nZSgpKTtcbiAgICB0aGlzLl9vblN0YXR1c0NoYW5nZSgpOyAvLyBTZXQgaW5pdGlhbCBzdGF0dXMgY29ycmVjdGx5XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbi5rZXJuZWwuaW50ZXJydXB0KCk7XG4gIH1cblxuICBzaHV0ZG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uLmtlcm5lbC5zaHV0ZG93bigpO1xuICB9XG5cbiAgcmVzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uLmtlcm5lbC5yZXN0YXJ0KCk7XG4gIH1cblxuICBfb25TdGF0dXNDaGFuZ2UoKSB7XG4gICAgY29uc3Qgc3RhdHVzID0gdGhpcy5zZXNzaW9uLnN0YXR1cztcbiAgICB0aGlzLnN0YXR1c1ZpZXcuc2V0U3RhdHVzKHN0YXR1cyk7XG4gICAgdGhpcy5leGVjdXRpb25TdGF0ZSA9IHN0YXR1cztcbiAgfVxuXG4gIF9leGVjdXRlKGNvZGUsIGNhbGxXYXRjaGVzLCBvblJlc3VsdHMpIHtcbiAgICBjb25zdCBmdXR1cmUgPSB0aGlzLnNlc3Npb24ua2VybmVsLnJlcXVlc3RFeGVjdXRlKHsgY29kZSB9KTtcblxuICAgIGZ1dHVyZS5vbklPUHViID0gKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChjYWxsV2F0Y2hlcyAmJlxuICAgICAgICBtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSA9PT0gJ3N0YXR1cycgJiZcbiAgICAgICAgbWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9zdGF0ZSA9PT0gJ2lkbGUnKSB7XG4gICAgICAgIHRoaXMuX2NhbGxXYXRjaENhbGxiYWNrcygpO1xuICAgICAgfVxuXG4gICAgICBpZiAob25SZXN1bHRzKSB7XG4gICAgICAgIGxvZygnV1NLZXJuZWw6IF9leGVjdXRlOicsIG1lc3NhZ2UpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZUlPTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgaWYgKHJlc3VsdCkgb25SZXN1bHRzKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1dHVyZS5vblJlcGx5ID0gKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmNvbnRlbnQuc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgZGF0YTogJ29rJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBzdHJlYW06ICdzdGF0dXMnLFxuICAgICAgfTtcbiAgICAgIGlmIChvblJlc3VsdHMpIG9uUmVzdWx0cyhyZXN1bHQpO1xuICAgIH07XG5cbiAgICBmdXR1cmUub25TdGRpbiA9IChtZXNzYWdlKSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgIT09ICdpbnB1dF9yZXF1ZXN0Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgcHJvbXB0IH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG5cbiAgICAgIGNvbnN0IGlucHV0VmlldyA9IG5ldyBJbnB1dFZpZXcoeyBwcm9tcHQgfSwgaW5wdXQgPT5cbiAgICAgICAgdGhpcy5zZXNzaW9uLmtlcm5lbC5zZW5kSW5wdXRSZXBseSh7IHZhbHVlOiBpbnB1dCB9KSk7XG5cbiAgICAgIGlucHV0Vmlldy5hdHRhY2goKTtcbiAgICB9O1xuICB9XG5cblxuICBleGVjdXRlKGNvZGUsIG9uUmVzdWx0cykge1xuICAgIHRoaXMuX2V4ZWN1dGUoY29kZSwgdHJ1ZSwgb25SZXN1bHRzKTtcbiAgfVxuXG4gIGV4ZWN1dGVXYXRjaChjb2RlLCBvblJlc3VsdHMpIHtcbiAgICB0aGlzLl9leGVjdXRlKGNvZGUsIGZhbHNlLCBvblJlc3VsdHMpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZSwgb25SZXN1bHRzKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbC5yZXF1ZXN0Q29tcGxldGUoe1xuICAgICAgY29kZSxcbiAgICAgIGN1cnNvcl9wb3M6IGNvZGUubGVuZ3RoLFxuICAgIH0pXG4gICAgICAudGhlbihtZXNzYWdlID0+IG9uUmVzdWx0cyhtZXNzYWdlLmNvbnRlbnQpKTtcbiAgfVxuXG4gIGluc3BlY3QoY29kZSwgY3Vyc29yUG9zLCBvblJlc3VsdHMpIHtcbiAgICB0aGlzLnNlc3Npb24ua2VybmVsLnJlcXVlc3RJbnNwZWN0KHtcbiAgICAgIGNvZGUsXG4gICAgICBjdXJzb3JfcG9zOiBjdXJzb3JQb3MsXG4gICAgICBkZXRhaWxfbGV2ZWw6IDAsXG4gICAgfSlcbiAgICAgIC50aGVuKG1lc3NhZ2UgPT5cbiAgICAgICAgb25SZXN1bHRzKHtcbiAgICAgICAgICBkYXRhOiBtZXNzYWdlLmNvbnRlbnQuZGF0YSxcbiAgICAgICAgICBmb3VuZDogbWVzc2FnZS5jb250ZW50LmZvdW5kLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gIH1cblxuICBwcm9tcHRSZW5hbWUoKSB7XG4gICAgY29uc3QgdmlldyA9IG5ldyBJbnB1dFZpZXcoXG4gICAgICB7XG4gICAgICAgIHByb21wdDogJ05hbWUgeW91ciBjdXJyZW50IHNlc3Npb24nLFxuICAgICAgICBkZWZhdWx0VGV4dDogdGhpcy5zZXNzaW9uLnBhdGgsXG4gICAgICAgIGFsbG93Q2FuY2VsOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGlucHV0ID0+IHRoaXMuc2Vzc2lvbi5yZW5hbWUoaW5wdXQpKTtcblxuICAgIHZpZXcuYXR0YWNoKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGxvZygnV1NLZXJuZWw6IGRlc3Ryb3lpbmcganVweXRlci1qcy1zZXJ2aWNlcyBTZXNzaW9uJyk7XG4gICAgdGhpcy5zZXNzaW9uLmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kZXN0cm95KC4uLmFyZ3VtZW50cyk7XG4gIH1cbn1cbiJdfQ==