Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomMessagePanel = require('atom-message-panel');

var _transformime = require('transformime');

var transformime = _interopRequireWildcard(_transformime);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var transform = transformime.createTransform();

var Inspector = (function () {
  function Inspector(kernelManager, codeManager) {
    _classCallCheck(this, Inspector);

    this.kernelManager = kernelManager;
    this.codeManager = codeManager;
    this._lastInspectionResult = '';
  }

  _createClass(Inspector, [{
    key: 'toggle',
    value: function toggle() {
      var _this = this;

      var editor = atom.workspace.getActiveTextEditor();
      var grammar = editor.getGrammar();
      var language = this.kernelManager.getLanguageFor(grammar);
      var kernel = this.kernelManager.getRunningKernelFor(language);
      if (!kernel) {
        atom.notifications.addInfo('No kernel running!');
        if (this.view) this.view.close();
        return;
      }

      if (!this.view) {
        this.view = new _atomMessagePanel.MessagePanelView({
          title: 'Hydrogen Inspector',
          closeMethod: 'destroy'
        });
      }

      var _codeManager$getCodeToInspect = this.codeManager.getCodeToInspect();

      var _codeManager$getCodeToInspect2 = _slicedToArray(_codeManager$getCodeToInspect, 2);

      var code = _codeManager$getCodeToInspect2[0];
      var cursorPos = _codeManager$getCodeToInspect2[1];

      if (!code || cursorPos === 0) {
        atom.notifications.addInfo('No code to introspect!');
        return;
      }

      kernel.inspect(code, cursorPos, function (result) {
        return(
          // TODO: handle case when inspect request returns an error
          _this.showInspectionResult(result)
        );
      });
    }
  }, {
    key: 'showInspectionResult',
    value: function showInspectionResult(result) {
      var _this2 = this;

      (0, _log2['default'])('Inspector: Result:', result);

      if (!result.found) {
        atom.notifications.addInfo('No introspection available!');
        if (this.view) this.view.close();
        return;
      }

      var onInspectResult = function onInspectResult(_ref) {
        var mimetype = _ref.mimetype;
        var el = _ref.el;

        if (mimetype === 'text/plain') {
          var lines = el.innerHTML.split('\n');
          var firstline = lines[0];
          lines.splice(0, 1);
          var message = lines.join('\n');

          if (_this2._lastInspectionResult === message && _this2.view.panel) {
            if (_this2.view) _this2.view.close();
            return;
          }

          _this2.view.clear();
          _this2.view.attach();
          _this2.view.add(new _atomMessagePanel.PlainMessageView({
            message: firstline,
            className: 'inspect-message',
            raw: true
          }));
          _this2.view.add(new _atomMessagePanel.PlainMessageView({
            message: message,
            className: 'inspect-message',
            raw: true
          }));

          _this2._lastInspectionResult = message;
          return;
        } else if (mimetype === 'text/html' || mimetype === 'text/markdown') {
          var container = document.createElement('div');
          container.appendChild(el);
          var message = container.innerHTML;
          if (_this2._lastInspectionResult === message && _this2.view.panel) {
            if (_this2.view) _this2.view.close();
            return;
          }

          _this2.view.clear();
          _this2.view.attach();
          _this2.view.add(new _atomMessagePanel.PlainMessageView({
            message: message,
            className: 'inspect-message',
            raw: true
          }));

          _this2._lastInspectionResult = message;
          return;
        }

        console.error('Inspector: Rendering error:', mimetype, el);
        atom.notifications.addInfo('Cannot render introspection result!');
        if (_this2.view) _this2.view.close();
      };

      var onError = function onError(error) {
        console.error('Inspector: Rendering error:', error);
        atom.notifications.addInfo('Cannot render introspection result!');
        if (_this2.view) _this2.view.close();
      };

      transform(result.data).then(onInspectResult, onError);
    }
  }]);

  return Inspector;
})();

exports['default'] = Inspector;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2luc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztnQ0FFbUQsb0JBQW9COzs0QkFDekMsY0FBYzs7SUFBaEMsWUFBWTs7bUJBRVIsT0FBTzs7OztBQUx2QixXQUFXLENBQUM7O0FBT1osSUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDOztJQUU1QixTQUFTO0FBQ2pCLFdBRFEsU0FBUyxDQUNoQixhQUFhLEVBQUUsV0FBVyxFQUFFOzBCQURyQixTQUFTOztBQUUxQixRQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztBQUNuQyxRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixRQUFJLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDO0dBQ2pDOztlQUxrQixTQUFTOztXQU90QixrQkFBRzs7O0FBQ1AsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELFVBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNwQyxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1RCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2pELFlBQUksSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2pDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNkLFlBQUksQ0FBQyxJQUFJLEdBQUcs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V0FDUjs7QUFFRCxpQkFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbEIsaUJBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ25CLGlCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsdUNBQXFCO0FBQ2pDLG1CQUFPLEVBQVAsT0FBTztBQUNQLHFCQUFTLEVBQUUsaUJBQWlCO0FBQzVCLGVBQUcsRUFBRSxJQUFJO1dBQ1YsQ0FBQyxDQUFDLENBQUM7O0FBRUosaUJBQUsscUJBQXFCLEdBQUcsT0FBTyxDQUFDO0FBQ3JDLGlCQUFPO1NBQ1I7O0FBRUQsZUFBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNsRSxZQUFJLE9BQUssSUFBSSxFQUFFLE9BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2xDLENBQUM7O0FBRUYsVUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksS0FBSyxFQUFLO0FBQ3pCLGVBQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEQsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNsRSxZQUFJLE9BQUssSUFBSSxFQUFFLE9BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2xDLENBQUM7O0FBRUYsZUFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZEOzs7U0ExR2tCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2luc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBNZXNzYWdlUGFuZWxWaWV3LCBQbGFpbk1lc3NhZ2VWaWV3IH0gZnJvbSAnYXRvbS1tZXNzYWdlLXBhbmVsJztcbmltcG9ydCAqIGFzIHRyYW5zZm9ybWltZSBmcm9tICd0cmFuc2Zvcm1pbWUnO1xuXG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcblxuY29uc3QgdHJhbnNmb3JtID0gdHJhbnNmb3JtaW1lLmNyZWF0ZVRyYW5zZm9ybSgpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnNwZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihrZXJuZWxNYW5hZ2VyLCBjb2RlTWFuYWdlcikge1xuICAgIHRoaXMua2VybmVsTWFuYWdlciA9IGtlcm5lbE1hbmFnZXI7XG4gICAgdGhpcy5jb2RlTWFuYWdlciA9IGNvZGVNYW5hZ2VyO1xuICAgIHRoaXMuX2xhc3RJbnNwZWN0aW9uUmVzdWx0ID0gJyc7XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IGxhbmd1YWdlID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMua2VybmVsTWFuYWdlci5nZXRSdW5uaW5nS2VybmVsRm9yKGxhbmd1YWdlKTtcbiAgICBpZiAoIWtlcm5lbCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ05vIGtlcm5lbCBydW5uaW5nIScpO1xuICAgICAgaWYgKHRoaXMudmlldykgdGhpcy52aWV3LmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZpZXcpIHtcbiAgICAgIHRoaXMudmlldyA9IG5ldyBNZXNzYWdlUGFuZWxWaWV3KHtcbiAgICAgICAgdGl0bGU6ICdIeWRyb2dlbiBJbnNwZWN0b3InLFxuICAgICAgICBjbG9zZU1ldGhvZDogJ2Rlc3Ryb3knLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgW2NvZGUsIGN1cnNvclBvc10gPSB0aGlzLmNvZGVNYW5hZ2VyLmdldENvZGVUb0luc3BlY3QoKTtcbiAgICBpZiAoIWNvZGUgfHwgY3Vyc29yUG9zID09PSAwKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTm8gY29kZSB0byBpbnRyb3NwZWN0IScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGtlcm5lbC5pbnNwZWN0KGNvZGUsIGN1cnNvclBvcywgcmVzdWx0ID0+XG4gICAgICAvLyBUT0RPOiBoYW5kbGUgY2FzZSB3aGVuIGluc3BlY3QgcmVxdWVzdCByZXR1cm5zIGFuIGVycm9yXG4gICAgICB0aGlzLnNob3dJbnNwZWN0aW9uUmVzdWx0KHJlc3VsdCkpO1xuICB9XG5cblxuICBzaG93SW5zcGVjdGlvblJlc3VsdChyZXN1bHQpIHtcbiAgICBsb2coJ0luc3BlY3RvcjogUmVzdWx0OicsIHJlc3VsdCk7XG5cbiAgICBpZiAoIXJlc3VsdC5mb3VuZCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ05vIGludHJvc3BlY3Rpb24gYXZhaWxhYmxlIScpO1xuICAgICAgaWYgKHRoaXMudmlldykgdGhpcy52aWV3LmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb25JbnNwZWN0UmVzdWx0ID0gKHsgbWltZXR5cGUsIGVsIH0pID0+IHtcbiAgICAgIGlmIChtaW1ldHlwZSA9PT0gJ3RleHQvcGxhaW4nKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZWwuaW5uZXJIVE1MLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgY29uc3QgZmlyc3RsaW5lID0gbGluZXNbMF07XG4gICAgICAgIGxpbmVzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgIGlmICh0aGlzLl9sYXN0SW5zcGVjdGlvblJlc3VsdCA9PT0gbWVzc2FnZSAmJiB0aGlzLnZpZXcucGFuZWwpIHtcbiAgICAgICAgICBpZiAodGhpcy52aWV3KSB0aGlzLnZpZXcuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZXcuY2xlYXIoKTtcbiAgICAgICAgdGhpcy52aWV3LmF0dGFjaCgpO1xuICAgICAgICB0aGlzLnZpZXcuYWRkKG5ldyBQbGFpbk1lc3NhZ2VWaWV3KHtcbiAgICAgICAgICBtZXNzYWdlOiBmaXJzdGxpbmUsXG4gICAgICAgICAgY2xhc3NOYW1lOiAnaW5zcGVjdC1tZXNzYWdlJyxcbiAgICAgICAgICByYXc6IHRydWUsXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy52aWV3LmFkZChuZXcgUGxhaW5NZXNzYWdlVmlldyh7XG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBjbGFzc05hbWU6ICdpbnNwZWN0LW1lc3NhZ2UnLFxuICAgICAgICAgIHJhdzogdHJ1ZSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuX2xhc3RJbnNwZWN0aW9uUmVzdWx0ID0gbWVzc2FnZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIGlmIChtaW1ldHlwZSA9PT0gJ3RleHQvaHRtbCcgfHwgbWltZXR5cGUgPT09ICd0ZXh0L21hcmtkb3duJykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGNvbnRhaW5lci5pbm5lckhUTUw7XG4gICAgICAgIGlmICh0aGlzLl9sYXN0SW5zcGVjdGlvblJlc3VsdCA9PT0gbWVzc2FnZSAmJiB0aGlzLnZpZXcucGFuZWwpIHtcbiAgICAgICAgICBpZiAodGhpcy52aWV3KSB0aGlzLnZpZXcuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZXcuY2xlYXIoKTtcbiAgICAgICAgdGhpcy52aWV3LmF0dGFjaCgpO1xuICAgICAgICB0aGlzLnZpZXcuYWRkKG5ldyBQbGFpbk1lc3NhZ2VWaWV3KHtcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIGNsYXNzTmFtZTogJ2luc3BlY3QtbWVzc2FnZScsXG4gICAgICAgICAgcmF3OiB0cnVlLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5fbGFzdEluc3BlY3Rpb25SZXN1bHQgPSBtZXNzYWdlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0luc3BlY3RvcjogUmVuZGVyaW5nIGVycm9yOicsIG1pbWV0eXBlLCBlbCk7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQ2Fubm90IHJlbmRlciBpbnRyb3NwZWN0aW9uIHJlc3VsdCEnKTtcbiAgICAgIGlmICh0aGlzLnZpZXcpIHRoaXMudmlldy5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBjb25zdCBvbkVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbnNwZWN0b3I6IFJlbmRlcmluZyBlcnJvcjonLCBlcnJvcik7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQ2Fubm90IHJlbmRlciBpbnRyb3NwZWN0aW9uIHJlc3VsdCEnKTtcbiAgICAgIGlmICh0aGlzLnZpZXcpIHRoaXMudmlldy5jbG9zZSgpO1xuICAgIH07XG5cbiAgICB0cmFuc2Zvcm0ocmVzdWx0LmRhdGEpLnRoZW4ob25JbnNwZWN0UmVzdWx0LCBvbkVycm9yKTtcbiAgfVxufVxuIl19