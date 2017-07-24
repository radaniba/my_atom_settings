Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _transformime = require('transformime');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var transform = (0, _transformime.createTransform)();

var ResultView = (function () {
  function ResultView(marker) {
    var _this = this;

    _classCallCheck(this, ResultView);

    this.marker = marker;
    this.element = document.createElement('div');
    this.element.classList.add('hydrogen', 'output-bubble', 'hidden');

    var outputContainer = document.createElement('div');
    outputContainer.classList.add('bubble-output-container');
    var onWheel = function onWheel(event) {
      var clientHeight = outputContainer.clientHeight;
      var scrollHeight = outputContainer.scrollHeight;
      var scrollTop = outputContainer.scrollTop;
      var atTop = scrollTop !== 0 && event.deltaY < 0;
      var atBottom = scrollTop !== scrollHeight - clientHeight && event.deltaY > 0;

      if (clientHeight < scrollHeight && (atTop || atBottom)) {
        event.stopPropagation();
      }
    };
    outputContainer.addEventListener('wheel', onWheel, { passive: true });
    this.element.appendChild(outputContainer);

    this.resultContainer = document.createElement('div');
    this.resultContainer.classList.add('bubble-result-container');
    outputContainer.appendChild(this.resultContainer);

    this.errorContainer = document.createElement('div');
    this.errorContainer.classList.add('bubble-error-container');
    outputContainer.appendChild(this.errorContainer);

    this.statusContainer = document.createElement('div');
    this.statusContainer.classList.add('bubble-status-container');
    this.spinner = this.buildSpinner();
    this.statusContainer.appendChild(this.spinner);
    outputContainer.appendChild(this.statusContainer);

    var richCloseButton = document.createElement('div');
    richCloseButton.classList.add('rich-close-button', 'icon', 'icon-x');
    richCloseButton.onclick = function () {
      return _this.destroy();
    };
    this.element.appendChild(richCloseButton);

    var actionPanel = document.createElement('div');
    actionPanel.classList.add('bubble-action-panel');
    this.element.appendChild(actionPanel);

    var closeButton = document.createElement('div');
    closeButton.classList.add('action-button', 'close-button', 'icon', 'icon-x');
    closeButton.onclick = function () {
      return _this.destroy();
    };
    actionPanel.appendChild(closeButton);

    var padding = document.createElement('div');
    padding.classList.add('padding');
    actionPanel.appendChild(padding);

    var copyButton = document.createElement('div');
    copyButton.classList.add('action-button', 'copy-button', 'icon', 'icon-clippy');
    copyButton.onclick = function () {
      atom.clipboard.write(_this.getAllText());
      atom.notifications.addSuccess('Copied to clipboard');
    };
    actionPanel.appendChild(copyButton);

    var openButton = document.createElement('div');
    openButton.classList.add('action-button', 'open-button', 'icon', 'icon-file-symlink-file');
    openButton.onclick = function () {
      var bubbleText = _this.getAllText();
      atom.workspace.open().then(function (editor) {
        return editor.insertText(bubbleText);
      });
    };
    actionPanel.appendChild(openButton);

    this.setMultiline(false);

    this.tooltips = new _atom.CompositeDisposable();
    this.addCopyTooltip(copyButton);
    this.tooltips.add(atom.tooltips.add(openButton, { title: 'Open in new editor' }));

    this._hasResult = false;
    this._executionCount = null;

    return this;
  }

  _createClass(ResultView, [{
    key: 'addCopyTooltip',
    value: function addCopyTooltip(element) {
      var _this2 = this;

      this.tooltips.add(atom.tooltips.add(element, {
        title: function title() {
          if (!_this2._executionCount) {
            return 'Copy to clipboard';
          }
          return 'Copy to clipboard (Out[' + _this2._executionCount + '])';
        }
      }));
    }
  }, {
    key: 'addResult',
    value: function addResult(result) {
      var _this3 = this;

      var container = undefined;

      if (result.stream === 'execution_count') {
        this._executionCount = result.data;
        return;
      }

      this.spinner.classList.add('hidden');
      this.element.classList.remove('hidden');

      if (result.stream === 'status') {
        if (!this._hasResult && result.data === 'ok') {
          (0, _log2['default'])('ResultView: Show status container');
          this.statusContainer.classList.add('icon', 'icon-check');
        }
        return;
      }

      (0, _log2['default'])('ResultView: Add result', result);

      if (result.stream === 'stderr') {
        container = this.errorContainer;
      } else if (result.stream === 'stdout') {
        container = this.resultContainer;
      } else if (result.stream === 'error') {
        container = this.errorContainer;
      } else {
        container = this.resultContainer;
      }

      var onSuccess = function onSuccess(_ref) {
        var mimetype = _ref.mimetype;
        var el = _ref.el;

        (0, _log2['default'])('ResultView: Hide status container');
        _this3._hasResult = true;
        _this3.statusContainer.classList.add('hidden');

        var mimeType = mimetype;
        var htmlElement = el;

        if (mimeType === 'text/plain') {
          _this3.element.classList.remove('rich');

          var previousText = _this3.getAllText();
          var text = result.data['text/plain'];
          if (previousText === '' && text.length < 50 && (text.indexOf('\n') === text.length - 1 || text.indexOf('\n') === -1)) {
            _this3.setMultiline(false);

            _this3.addCopyTooltip(container);

            container.onclick = function () {
              atom.clipboard.write(_this3.getAllText());
              atom.notifications.addSuccess('Copied to clipboard');
            };
          } else {
            _this3.setMultiline(true);
          }
        } else {
          _this3.element.classList.add('rich');
          _this3.setMultiline(true);
        }

        if (mimeType === 'application/pdf') {
          var webview = document.createElement('webview');
          webview.src = htmlElement.href;
          htmlElement = webview;
        }

        (0, _log2['default'])('ResultView: Rendering as MIME ', mimeType);
        (0, _log2['default'])('ResultView: Rendering as ', htmlElement);
        // this.getAllText must be called after appending the htmlElement
        // in order to obtain innerText
        container.appendChild(htmlElement);

        if (mimeType === 'text/html') {
          if (_this3.getAllText() !== '') {
            _this3.element.classList.remove('rich');
          }
        }

        if (mimeType === 'image/svg+xml') {
          container.classList.add('svg');
        }

        if (mimeType === 'text/markdown') {
          _this3.element.classList.add('markdown');
          _this3.element.classList.remove('rich');
        }

        if (mimeType === 'text/latex') {
          _this3.element.classList.add('latex');
        }

        if (_this3.errorContainer.getElementsByTagName('span').length === 0) {
          _this3.errorContainer.classList.add('plain-error');
        } else {
          _this3.errorContainer.classList.remove('plain-error');
        }
      };

      var onError = function onError(error) {
        return console.error('ResultView: Rendering error:', error);
      };

      transform(result.data).then(onSuccess, onError);
    }
  }, {
    key: 'getAllText',
    value: function getAllText() {
      var text = '';

      var resultText = this.resultContainer.innerText.trim();
      if (resultText.length > 0) {
        text += resultText;
      }

      var errorText = this.errorContainer.innerText.trim();
      if (errorText.length > 0) {
        text += '\n' + errorText;
      }

      return text;
    }
  }, {
    key: 'setMultiline',
    value: function setMultiline(multiline) {
      if (multiline) {
        this.element.classList.add('multiline');
      } else {
        this.element.classList.remove('multiline');
      }
    }
  }, {
    key: 'buildSpinner',
    value: function buildSpinner() {
      var container = document.createElement('div');
      container.classList.add('spinner');

      var rect1 = document.createElement('div');
      rect1.classList.add('rect1');
      var rect2 = document.createElement('div');
      rect2.classList.add('rect2');
      var rect3 = document.createElement('div');
      rect3.classList.add('rect3');
      var rect4 = document.createElement('div');
      rect4.classList.add('rect4');
      var rect5 = document.createElement('div');
      rect5.classList.add('rect5');

      container.appendChild(rect1);
      container.appendChild(rect2);
      container.appendChild(rect3);
      container.appendChild(rect4);
      container.appendChild(rect5);

      return container;
    }
  }, {
    key: 'spin',
    value: function spin() {
      this.element.classList.remove('hidden');
      this.spinner.classList.remove('hidden');
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.tooltips.dispose();
      if (this.marker) {
        this.marker.destroy();
      }
      this.element.innerHTML = '';
    }
  }]);

  return ResultView;
})();

exports['default'] = ResultView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3Jlc3VsdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07OzRCQUNWLGNBQWM7O21CQUU5QixPQUFPOzs7O0FBTHZCLFdBQVcsQ0FBQzs7QUFPWixJQUFNLFNBQVMsR0FBRyxvQ0FBaUIsQ0FBQzs7SUFFZixVQUFVO0FBRWxCLFdBRlEsVUFBVSxDQUVqQixNQUFNLEVBQUU7OzswQkFGRCxVQUFVOztBQUczQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRWxFLFFBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEQsbUJBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDekQsUUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksS0FBSyxFQUFLO0FBQ3pCLFVBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUM7QUFDbEQsVUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQztBQUNsRCxVQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDO0FBQzVDLFVBQU0sS0FBSyxHQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsQ0FBQztBQUNwRCxVQUFNLFFBQVEsR0FBSSxTQUFTLEtBQUssWUFBWSxHQUFHLFlBQVksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDOztBQUVqRixVQUFJLFlBQVksR0FB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TyxDQUFDLENBQUM7O0FBRTdCLGVBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFN0IsYUFBTyxTQUFTLENBQUM7S0FDbEI7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN6Qzs7O1dBR00sbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLFlBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdkI7QUFDRCxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7S0FDN0I7OztTQTFRa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvcmVzdWx0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgY3JlYXRlVHJhbnNmb3JtIH0gZnJvbSAndHJhbnNmb3JtaW1lJztcblxuaW1wb3J0IGxvZyBmcm9tICcuL2xvZyc7XG5cbmNvbnN0IHRyYW5zZm9ybSA9IGNyZWF0ZVRyYW5zZm9ybSgpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXN1bHRWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihtYXJrZXIpIHtcbiAgICB0aGlzLm1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaHlkcm9nZW4nLCAnb3V0cHV0LWJ1YmJsZScsICdoaWRkZW4nKTtcblxuICAgIGNvbnN0IG91dHB1dENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG91dHB1dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdidWJibGUtb3V0cHV0LWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudEhlaWdodCA9IG91dHB1dENvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICBjb25zdCBzY3JvbGxIZWlnaHQgPSBvdXRwdXRDb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gb3V0cHV0Q29udGFpbmVyLnNjcm9sbFRvcDtcbiAgICAgIGNvbnN0IGF0VG9wID0gKHNjcm9sbFRvcCAhPT0gMCAmJiBldmVudC5kZWx0YVkgPCAwKTtcbiAgICAgIGNvbnN0IGF0Qm90dG9tID0gKHNjcm9sbFRvcCAhPT0gc2Nyb2xsSGVpZ2h0IC0gY2xpZW50SGVpZ2h0ICYmIGV2ZW50LmRlbHRhWSA+IDApO1xuXG4gICAgICBpZiAoY2xpZW50SGVpZ2h0IDwgc2Nyb2xsSGVpZ2h0ICYmIChhdFRvcCB8fCBhdEJvdHRvbSkpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBvdXRwdXRDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG91dHB1dENvbnRhaW5lcik7XG5cbiAgICB0aGlzLnJlc3VsdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMucmVzdWx0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2J1YmJsZS1yZXN1bHQtY29udGFpbmVyJyk7XG4gICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVzdWx0Q29udGFpbmVyKTtcblxuICAgIHRoaXMuZXJyb3JDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVycm9yQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2J1YmJsZS1lcnJvci1jb250YWluZXInKTtcbiAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lcnJvckNvbnRhaW5lcik7XG5cbiAgICB0aGlzLnN0YXR1c0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuc3RhdHVzQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2J1YmJsZS1zdGF0dXMtY29udGFpbmVyJyk7XG4gICAgdGhpcy5zcGlubmVyID0gdGhpcy5idWlsZFNwaW5uZXIoKTtcbiAgICB0aGlzLnN0YXR1c0NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnNwaW5uZXIpO1xuICAgIG91dHB1dENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnN0YXR1c0NvbnRhaW5lcik7XG5cbiAgICBjb25zdCByaWNoQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByaWNoQ2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgncmljaC1jbG9zZS1idXR0b24nLCAnaWNvbicsICdpY29uLXgnKTtcbiAgICByaWNoQ2xvc2VCdXR0b24ub25jbGljayA9ICgpID0+IHRoaXMuZGVzdHJveSgpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChyaWNoQ2xvc2VCdXR0b24pO1xuXG4gICAgY29uc3QgYWN0aW9uUGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhY3Rpb25QYW5lbC5jbGFzc0xpc3QuYWRkKCdidWJibGUtYWN0aW9uLXBhbmVsJyk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGFjdGlvblBhbmVsKTtcblxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aW9uLWJ1dHRvbicsXG4gICAgICAnY2xvc2UtYnV0dG9uJywgJ2ljb24nLCAnaWNvbi14Jyk7XG4gICAgY2xvc2VCdXR0b24ub25jbGljayA9ICgpID0+IHRoaXMuZGVzdHJveSgpO1xuICAgIGFjdGlvblBhbmVsLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuXG4gICAgY29uc3QgcGFkZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhZGRpbmcuY2xhc3NMaXN0LmFkZCgncGFkZGluZycpO1xuICAgIGFjdGlvblBhbmVsLmFwcGVuZENoaWxkKHBhZGRpbmcpO1xuXG4gICAgY29uc3QgY29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvcHlCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aW9uLWJ1dHRvbicsXG4gICAgICAnY29weS1idXR0b24nLCAnaWNvbicsICdpY29uLWNsaXBweScpO1xuICAgIGNvcHlCdXR0b24ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRoaXMuZ2V0QWxsVGV4dCgpKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb3BpZWQgdG8gY2xpcGJvYXJkJyk7XG4gICAgfTtcbiAgICBhY3Rpb25QYW5lbC5hcHBlbmRDaGlsZChjb3B5QnV0dG9uKTtcblxuICAgIGNvbnN0IG9wZW5CdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvcGVuQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGlvbi1idXR0b24nLFxuICAgICAgJ29wZW4tYnV0dG9uJywgJ2ljb24nLCAnaWNvbi1maWxlLXN5bWxpbmstZmlsZScpO1xuICAgIG9wZW5CdXR0b24ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGJ1YmJsZVRleHQgPSB0aGlzLmdldEFsbFRleHQoKTtcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuKGVkaXRvciA9PiBlZGl0b3IuaW5zZXJ0VGV4dChidWJibGVUZXh0KSk7XG4gICAgfTtcbiAgICBhY3Rpb25QYW5lbC5hcHBlbmRDaGlsZChvcGVuQnV0dG9uKTtcblxuICAgIHRoaXMuc2V0TXVsdGlsaW5lKGZhbHNlKTtcblxuICAgIHRoaXMudG9vbHRpcHMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuYWRkQ29weVRvb2x0aXAoY29weUJ1dHRvbik7XG4gICAgdGhpcy50b29sdGlwcy5hZGQoYXRvbS50b29sdGlwcy5hZGQob3BlbkJ1dHRvbiwgeyB0aXRsZTogJ09wZW4gaW4gbmV3IGVkaXRvcicgfSkpO1xuXG4gICAgdGhpcy5faGFzUmVzdWx0ID0gZmFsc2U7XG4gICAgdGhpcy5fZXhlY3V0aW9uQ291bnQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRDb3B5VG9vbHRpcChlbGVtZW50KSB7XG4gICAgdGhpcy50b29sdGlwcy5hZGQoYXRvbS50b29sdGlwcy5hZGQoZWxlbWVudCwge1xuICAgICAgdGl0bGU6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9leGVjdXRpb25Db3VudCkge1xuICAgICAgICAgIHJldHVybiAnQ29weSB0byBjbGlwYm9hcmQnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgQ29weSB0byBjbGlwYm9hcmQgKE91dFske3RoaXMuX2V4ZWN1dGlvbkNvdW50fV0pYDtcbiAgICAgIH0sXG4gICAgfSkpO1xuICB9XG5cbiAgYWRkUmVzdWx0KHJlc3VsdCkge1xuICAgIGxldCBjb250YWluZXI7XG5cbiAgICBpZiAocmVzdWx0LnN0cmVhbSA9PT0gJ2V4ZWN1dGlvbl9jb3VudCcpIHtcbiAgICAgIHRoaXMuX2V4ZWN1dGlvbkNvdW50ID0gcmVzdWx0LmRhdGE7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zcGlubmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcblxuICAgIGlmIChyZXN1bHQuc3RyZWFtID09PSAnc3RhdHVzJykge1xuICAgICAgaWYgKCF0aGlzLl9oYXNSZXN1bHQgJiYgcmVzdWx0LmRhdGEgPT09ICdvaycpIHtcbiAgICAgICAgbG9nKCdSZXN1bHRWaWV3OiBTaG93IHN0YXR1cyBjb250YWluZXInKTtcbiAgICAgICAgdGhpcy5zdGF0dXNDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaWNvbicsICdpY29uLWNoZWNrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9nKCdSZXN1bHRWaWV3OiBBZGQgcmVzdWx0JywgcmVzdWx0KTtcblxuICAgIGlmIChyZXN1bHQuc3RyZWFtID09PSAnc3RkZXJyJykge1xuICAgICAgY29udGFpbmVyID0gdGhpcy5lcnJvckNvbnRhaW5lcjtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5zdHJlYW0gPT09ICdzdGRvdXQnKSB7XG4gICAgICBjb250YWluZXIgPSB0aGlzLnJlc3VsdENvbnRhaW5lcjtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5zdHJlYW0gPT09ICdlcnJvcicpIHtcbiAgICAgIGNvbnRhaW5lciA9IHRoaXMuZXJyb3JDb250YWluZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lciA9IHRoaXMucmVzdWx0Q29udGFpbmVyO1xuICAgIH1cblxuICAgIGNvbnN0IG9uU3VjY2VzcyA9ICh7IG1pbWV0eXBlLCBlbCB9KSA9PiB7XG4gICAgICBsb2coJ1Jlc3VsdFZpZXc6IEhpZGUgc3RhdHVzIGNvbnRhaW5lcicpO1xuICAgICAgdGhpcy5faGFzUmVzdWx0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhdHVzQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuXG4gICAgICBjb25zdCBtaW1lVHlwZSA9IG1pbWV0eXBlO1xuICAgICAgbGV0IGh0bWxFbGVtZW50ID0gZWw7XG5cbiAgICAgIGlmIChtaW1lVHlwZSA9PT0gJ3RleHQvcGxhaW4nKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyaWNoJyk7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNUZXh0ID0gdGhpcy5nZXRBbGxUZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSByZXN1bHQuZGF0YVsndGV4dC9wbGFpbiddO1xuICAgICAgICBpZiAocHJldmlvdXNUZXh0ID09PSAnJyAmJiB0ZXh0Lmxlbmd0aCA8IDUwXG4gICAgICAgICAmJiAodGV4dC5pbmRleE9mKCdcXG4nKSA9PT0gdGV4dC5sZW5ndGggLSAxIHx8IHRleHQuaW5kZXhPZignXFxuJykgPT09IC0xKSkge1xuICAgICAgICAgIHRoaXMuc2V0TXVsdGlsaW5lKGZhbHNlKTtcblxuICAgICAgICAgIHRoaXMuYWRkQ29weVRvb2x0aXAoY29udGFpbmVyKTtcblxuICAgICAgICAgIGNvbnRhaW5lci5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGhpcy5nZXRBbGxUZXh0KCkpO1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0NvcGllZCB0byBjbGlwYm9hcmQnKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0TXVsdGlsaW5lKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmljaCcpO1xuICAgICAgICB0aGlzLnNldE11bHRpbGluZSh0cnVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1pbWVUeXBlID09PSAnYXBwbGljYXRpb24vcGRmJykge1xuICAgICAgICBjb25zdCB3ZWJ2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpO1xuICAgICAgICB3ZWJ2aWV3LnNyYyA9IGh0bWxFbGVtZW50LmhyZWY7XG4gICAgICAgIGh0bWxFbGVtZW50ID0gd2VidmlldztcbiAgICAgIH1cblxuICAgICAgbG9nKCdSZXN1bHRWaWV3OiBSZW5kZXJpbmcgYXMgTUlNRSAnLCBtaW1lVHlwZSk7XG4gICAgICBsb2coJ1Jlc3VsdFZpZXc6IFJlbmRlcmluZyBhcyAnLCBodG1sRWxlbWVudCk7XG4gICAgICAvLyB0aGlzLmdldEFsbFRleHQgbXVzdCBiZSBjYWxsZWQgYWZ0ZXIgYXBwZW5kaW5nIHRoZSBodG1sRWxlbWVudFxuICAgICAgLy8gaW4gb3JkZXIgdG8gb2J0YWluIGlubmVyVGV4dFxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGh0bWxFbGVtZW50KTtcblxuICAgICAgaWYgKG1pbWVUeXBlID09PSAndGV4dC9odG1sJykge1xuICAgICAgICBpZiAodGhpcy5nZXRBbGxUZXh0KCkgIT09ICcnKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3JpY2gnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWltZVR5cGUgPT09ICdpbWFnZS9zdmcreG1sJykge1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3ZnJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChtaW1lVHlwZSA9PT0gJ3RleHQvbWFya2Rvd24nKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bicpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncmljaCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAobWltZVR5cGUgPT09ICd0ZXh0L2xhdGV4Jykge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbGF0ZXgnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZXJyb3JDb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5lcnJvckNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdwbGFpbi1lcnJvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lcnJvckNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdwbGFpbi1lcnJvcicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkVycm9yID0gZXJyb3IgPT4gY29uc29sZS5lcnJvcignUmVzdWx0VmlldzogUmVuZGVyaW5nIGVycm9yOicsIGVycm9yKTtcblxuICAgIHRyYW5zZm9ybShyZXN1bHQuZGF0YSkudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9XG5cblxuICBnZXRBbGxUZXh0KCkge1xuICAgIGxldCB0ZXh0ID0gJyc7XG5cbiAgICBjb25zdCByZXN1bHRUZXh0ID0gdGhpcy5yZXN1bHRDb250YWluZXIuaW5uZXJUZXh0LnRyaW0oKTtcbiAgICBpZiAocmVzdWx0VGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICB0ZXh0ICs9IHJlc3VsdFRleHQ7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JUZXh0ID0gdGhpcy5lcnJvckNvbnRhaW5lci5pbm5lclRleHQudHJpbSgpO1xuICAgIGlmIChlcnJvclRleHQubGVuZ3RoID4gMCkge1xuICAgICAgdGV4dCArPSBgXFxuJHtlcnJvclRleHR9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG5cbiAgc2V0TXVsdGlsaW5lKG11bHRpbGluZSkge1xuICAgIGlmIChtdWx0aWxpbmUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtdWx0aWxpbmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ211bHRpbGluZScpO1xuICAgIH1cbiAgfVxuXG5cbiAgYnVpbGRTcGlubmVyKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzcGlubmVyJyk7XG5cbiAgICBjb25zdCByZWN0MSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJlY3QxLmNsYXNzTGlzdC5hZGQoJ3JlY3QxJyk7XG4gICAgY29uc3QgcmVjdDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZWN0Mi5jbGFzc0xpc3QuYWRkKCdyZWN0MicpO1xuICAgIGNvbnN0IHJlY3QzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcmVjdDMuY2xhc3NMaXN0LmFkZCgncmVjdDMnKTtcbiAgICBjb25zdCByZWN0NCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJlY3Q0LmNsYXNzTGlzdC5hZGQoJ3JlY3Q0Jyk7XG4gICAgY29uc3QgcmVjdDUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZWN0NS5jbGFzc0xpc3QuYWRkKCdyZWN0NScpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlY3QxKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVjdDIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZWN0Myk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlY3Q0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVjdDUpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG4gIHNwaW4oKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHRoaXMuc3Bpbm5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgfVxuXG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnRvb2x0aXBzLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5tYXJrZXIpIHtcbiAgICAgIHRoaXMubWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB9XG59XG4iXX0=