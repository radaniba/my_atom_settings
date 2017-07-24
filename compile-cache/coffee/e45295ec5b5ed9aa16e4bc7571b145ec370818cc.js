(function() {
  var CompositeDisposable, MarkdownTransform, ResultView, transform, transformime, transformimeJupyter;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ResultView = (function() {
    function ResultView(marker) {
      var padding;
      this.marker = marker;
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen', 'output-bubble', 'empty');
      this.outputContainer = document.createElement('div');
      this.outputContainer.classList.add('bubble-output-container');
      this.outputContainer.onmousewheel = function(e) {
        return e.stopPropagation();
      };
      this.element.appendChild(this.outputContainer);
      this.resultContainer = document.createElement('div');
      this.resultContainer.classList.add('bubble-result-container');
      this.outputContainer.appendChild(this.resultContainer);
      this.errorContainer = document.createElement('div');
      this.errorContainer.classList.add('bubble-error-container');
      this.outputContainer.appendChild(this.errorContainer);
      this.statusContainer = document.createElement('div');
      this.statusContainer.classList.add('bubble-status-container');
      this.spinner = this.buildSpinner();
      this.statusContainer.appendChild(this.spinner);
      this.outputContainer.appendChild(this.statusContainer);
      this.richCloseButton = document.createElement('div');
      this.richCloseButton.classList.add('rich-close-button', 'icon', 'icon-x');
      this.richCloseButton.onclick = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.element.appendChild(this.richCloseButton);
      this.actionPanel = document.createElement('div');
      this.actionPanel.classList.add('bubble-action-panel');
      this.element.appendChild(this.actionPanel);
      this.closeButton = document.createElement('div');
      this.closeButton.classList.add('action-button', 'close-button', 'icon', 'icon-x');
      this.closeButton.onclick = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.actionPanel.appendChild(this.closeButton);
      padding = document.createElement('div');
      padding.classList.add('padding');
      this.actionPanel.appendChild(padding);
      this.copyButton = document.createElement('div');
      this.copyButton.classList.add('action-button', 'copy-button', 'icon', 'icon-clippy');
      this.copyButton.onclick = (function(_this) {
        return function() {
          atom.clipboard.write(_this.getAllText());
          return atom.notifications.addSuccess("Copied to clipboard");
        };
      })(this);
      this.actionPanel.appendChild(this.copyButton);
      this.openButton = document.createElement('div');
      this.openButton.classList.add('action-button', 'open-button', 'icon', 'icon-file-symlink-file');
      this.openButton.onclick = (function(_this) {
        return function() {
          var bubbleText;
          bubbleText = _this.getAllText();
          return atom.workspace.open().then(function(editor) {
            return editor.insertText(bubbleText);
          });
        };
      })(this);
      this.actionPanel.appendChild(this.openButton);
      this.setMultiline(false);
      this.tooltips = new CompositeDisposable();
      this.tooltips.add(atom.tooltips.add(this.copyButton, {
        title: "Copy to clipboard"
      }));
      this.tooltips.add(atom.tooltips.add(this.openButton, {
        title: "Open in new editor"
      }));
      this._hasResult = false;
      return this;
    }

    ResultView.prototype.addResult = function(result) {
      var container, onError, onSuccess;
      console.log("ResultView: Add result", result);
      this.element.classList.remove('empty');
      if (result.stream === 'status') {
        if (!this._hasResult && result.data === 'ok') {
          console.log("ResultView: Show status container");
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
          console.log("ResultView: Hide status container");
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
                title: "Copy to clipboard"
              }));
              container.onclick = function() {
                atom.clipboard.write(_this.getAllText());
                return atom.notifications.addSuccess("Copied to clipboard");
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
          console.log("ResultView: Rendering as MIME", mimeType);
          console.log("ResultView: Rendering as ", htmlElement);
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
          if (_this.errorContainer.getElementsByTagName('span').length === 0) {
            return _this.errorContainer.classList.add('plain-error');
          } else {
            return _this.errorContainer.classList.remove('plain-error');
          }
        };
      })(this);
      onError = function(error) {
        return console.error("ResultView: Rendering error:", error);
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
      this.element.innerHTML = '';
      return this.element.remove();
    };

    ResultView.prototype.getElement = function() {
      return this.element;
    };

    return ResultView;

  })();

  transformime = require('transformime');

  transformimeJupyter = require('transformime-jupyter-transformers');

  MarkdownTransform = require('transformime-marked');

  transformimeJupyter.consoleTextTransform.mimetype = ['jupyter/console-text', 'text/plain'];

  transform = transformime.createTransform([transformime.ImageTransformer, transformimeJupyter.SVGTransform, transformimeJupyter.consoleTextTransform, MarkdownTransform, transformimeJupyter.PDFTransform, transformimeJupyter.LaTeXTransform, transformime.HTMLTransformer]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvcmVzdWx0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdHQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRVcsSUFBQSxvQkFBRSxNQUFGLEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFVBQXZCLEVBQW1DLGVBQW5DLEVBQW9ELE9BQXBELENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FIbkIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBM0IsQ0FBK0IseUJBQS9CLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxZQUFqQixHQUFnQyxTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFBUDtNQUFBLENBTGhDLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixJQUFDLENBQUEsZUFBdEIsQ0FOQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZUFBRCxHQUFtQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQVJuQixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/result-view.coffee