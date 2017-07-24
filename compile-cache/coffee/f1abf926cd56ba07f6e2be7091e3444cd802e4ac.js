(function() {
  var CompositeDisposable, MarkdownTransform, ResultView, transform, transformime;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ResultView = (function() {
    function ResultView(marker) {
      var actionPanel, closeButton, copyButton, openButton, outputContainer, padding, richCloseButton;
      this.marker = marker;
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen', 'output-bubble', 'empty');
      outputContainer = document.createElement('div');
      outputContainer.classList.add('bubble-output-container');
      outputContainer.onmousewheel = function(e) {
        return e.stopPropagation();
      };
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
      richCloseButton = document.createElement('div');
      richCloseButton.classList.add('rich-close-button', 'icon', 'icon-x');
      richCloseButton.onclick = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.element.appendChild(richCloseButton);
      actionPanel = document.createElement('div');
      actionPanel.classList.add('bubble-action-panel');
      this.element.appendChild(actionPanel);
      closeButton = document.createElement('div');
      closeButton.classList.add('action-button', 'close-button', 'icon', 'icon-x');
      closeButton.onclick = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      actionPanel.appendChild(closeButton);
      padding = document.createElement('div');
      padding.classList.add('padding');
      actionPanel.appendChild(padding);
      copyButton = document.createElement('div');
      copyButton.classList.add('action-button', 'copy-button', 'icon', 'icon-clippy');
      copyButton.onclick = (function(_this) {
        return function() {
          atom.clipboard.write(_this.getAllText());
          return atom.notifications.addSuccess('Copied to clipboard');
        };
      })(this);
      actionPanel.appendChild(copyButton);
      openButton = document.createElement('div');
      openButton.classList.add('action-button', 'open-button', 'icon', 'icon-file-symlink-file');
      openButton.onclick = (function(_this) {
        return function() {
          var bubbleText;
          bubbleText = _this.getAllText();
          return atom.workspace.open().then(function(editor) {
            return editor.insertText(bubbleText);
          });
        };
      })(this);
      actionPanel.appendChild(openButton);
      this.setMultiline(false);
      this.tooltips = new CompositeDisposable();
      this.tooltips.add(atom.tooltips.add(copyButton, {
        title: 'Copy to clipboard'
      }));
      this.tooltips.add(atom.tooltips.add(openButton, {
        title: 'Open in new editor'
      }));
      this._hasResult = false;
      return this;
    }

    ResultView.prototype.addResult = function(result) {
      var container, onError, onSuccess;
      console.log('ResultView: Add result', result);
      this.element.classList.remove('empty');
      if (result.stream === 'status') {
        if (!this._hasResult && result.data === 'ok') {
          console.log('ResultView: Show status container');
          this.statusContainer.classList.add('icon', 'icon-check');
          this.statusContainer.style.display = 'inline-block';
        }
        return;
      }
      if (result.stream === 'stderr') {
        container = this.errorContainer;
      } else if (result.stream === 'stdout') {
        container = this.resultContainer;
      } else if (result.stream === 'error') {
        container = this.errorContainer;
      } else {
        container = this.resultContainer;
      }
      onSuccess = (function(_this) {
        return function(_arg) {
          var el, htmlElement, mimeType, mimetype, previousText, text, webview;
          mimetype = _arg.mimetype, el = _arg.el;
          console.log('ResultView: Hide status container');
          _this._hasResult = true;
          _this.statusContainer.style.display = 'none';
          mimeType = mimetype;
          htmlElement = el;
          if (mimeType === 'text/plain') {
            _this.element.classList.remove('rich');
            previousText = _this.getAllText();
            text = result.data['text/plain'];
            if (previousText === '' && text.length < 50 && text.indexOf('\n') === -1) {
              _this.setMultiline(false);
              _this.tooltips.add(atom.tooltips.add(container, {
                title: 'Copy to clipboard'
              }));
              container.onclick = function() {
                atom.clipboard.write(_this.getAllText());
                return atom.notifications.addSuccess('Copied to clipboard');
              };
            } else {
              _this.setMultiline(true);
            }
          } else {
            _this.element.classList.add('rich');
            _this.setMultiline(true);
          }
          if (mimeType === 'application/pdf') {
            webview = document.createElement('webview');
            webview.src = htmlElement.href;
            htmlElement = webview;
          }
          console.log('ResultView: Rendering as MIME ', mimeType);
          console.log('ResultView: Rendering as ', htmlElement);
          container.appendChild(htmlElement);
          if (mimeType === 'text/html') {
            if (_this.getAllText() !== '') {
              _this.element.classList.remove('rich');
            }
          }
          if (mimeType === 'image/svg+xml') {
            container.classList.add('svg');
          }
          if (mimeType === 'text/markdown') {
            _this.element.classList.add('markdown');
            _this.element.classList.remove('rich');
          }
          if (mimeType === 'text/latex') {
            _this.element.classList.add('latex');
          }
          if (_this.errorContainer.getElementsByTagName('span').length === 0) {
            return _this.errorContainer.classList.add('plain-error');
          } else {
            return _this.errorContainer.classList.remove('plain-error');
          }
        };
      })(this);
      onError = function(error) {
        return console.error('ResultView: Rendering error:', error);
      };
      return transform(result.data).then(onSuccess, onError);
    };

    ResultView.prototype.getAllText = function() {
      var errorText, resultText, text;
      text = '';
      resultText = this.resultContainer.innerText.trim();
      if (resultText.length > 0) {
        text += resultText;
      }
      errorText = this.errorContainer.innerText.trim();
      if (errorText.length > 0) {
        text += '\n' + errorText;
      }
      return text;
    };

    ResultView.prototype.setMultiline = function(multiline) {
      if (multiline) {
        return this.element.classList.add('multiline');
      } else {
        return this.element.classList.remove('multiline');
      }
    };

    ResultView.prototype.buildSpinner = function() {
      var container, rect1, rect2, rect3, rect4, rect5;
      container = document.createElement('div');
      container.classList.add('spinner');
      rect1 = document.createElement('div');
      rect1.classList.add('rect1');
      rect2 = document.createElement('div');
      rect2.classList.add('rect2');
      rect3 = document.createElement('div');
      rect3.classList.add('rect3');
      rect4 = document.createElement('div');
      rect4.classList.add('rect4');
      rect5 = document.createElement('div');
      rect5.classList.add('rect5');
      container.appendChild(rect1);
      container.appendChild(rect2);
      container.appendChild(rect3);
      container.appendChild(rect4);
      container.appendChild(rect5);
      return container;
    };

    ResultView.prototype.spin = function(shouldSpin) {
      if (shouldSpin) {
        this.element.classList.remove('empty');
        return this.spinner.style.display = 'block';
      } else {
        return this.spinner.style.display = 'none';
      }
    };

    ResultView.prototype.destroy = function() {
      this.tooltips.dispose();
      if (this.marker != null) {
        this.marker.destroy();
      }
      return this.element.innerHTML = '';
    };

    return ResultView;

  })();

  transformime = require('transformime');

  MarkdownTransform = require('transformime-marked');

  transform = transformime.createTransform([MarkdownTransform]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvcmVzdWx0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJFQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRVcsSUFBQSxvQkFBRSxNQUFGLEdBQUE7QUFDVCxVQUFBLDJGQUFBO0FBQUEsTUFEVSxJQUFDLENBQUEsU0FBQSxNQUNYLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixFQUFtQyxlQUFuQyxFQUFvRCxPQUFwRCxDQURBLENBQUE7QUFBQSxNQUdBLGVBQUEsR0FBa0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FIbEIsQ0FBQTtBQUFBLE1BSUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUExQixDQUE4Qix5QkFBOUIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxlQUFlLENBQUMsWUFBaEIsR0FBK0IsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsZUFBRixDQUFBLEVBQVA7TUFBQSxDQUwvQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsZUFBckIsQ0FOQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZUFBRCxHQUFtQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQVJuQixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQix5QkFBL0Is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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/result-view.coffee
