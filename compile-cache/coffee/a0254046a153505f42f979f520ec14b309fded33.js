(function() {
  var CompositeDisposable, ResultView, SVGTransform, transform, transformime, transformimeJupyter, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

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
          var el, htmlElement, mimeType, mimetype, previousText, text;
          mimetype = _arg.mimetype, el = _arg.el;
          console.log("ResultView: Hide status container");
          _this._hasResult = true;
          _this.statusContainer.style.display = 'none';
          mimeType = mimetype;
          htmlElement = el;
          console.log("ResultView: Rendering as MIME", mimeType);
          console.log("ResultView: Rendering as ", htmlElement);
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
          container.appendChild(htmlElement);
          if (mimeType === 'text/html') {
            if (_this.getAllText() !== '') {
              _this.element.classList.remove('rich');
            }
          }
          if (mimeType === 'image/svg+xml') {
            container.classList.add('svg');
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

  SVGTransform = function(mimetype, value, document) {
    var container, svgElement;
    container = document.createElement('div');
    container.innerHTML = value;
    svgElement = (container.getElementsByTagName('svg'))[0];
    if (svgElement == null) {
      throw new Error('SVGTransform: Error: Failed to create an <svg> element');
    }
    return svgElement;
  };

  SVGTransform.mimetype = 'image/svg+xml';

  transformimeJupyter.consoleTextTransform.mimetype = ['jupyter/console-text', 'text/plain'];

  transform = transformime.createTransform([transformimeJupyter.PDFTransform, transformime.ImageTransformer, SVGTransform, transformimeJupyter.consoleTextTransform, transformimeJupyter.LaTeXTransform, transformimeJupyter.markdownTransform, transformime.HTMLTransformer, transformimeJupyter.ScriptTransform]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvcmVzdWx0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhGQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVXLElBQUEsb0JBQUUsTUFBRixHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFEVSxJQUFDLENBQUEsU0FBQSxNQUNYLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixFQUFtQyxlQUFuQyxFQUFvRCxPQUFwRCxDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFELEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSG5CLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQTNCLENBQStCLHlCQUEvQixDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxlQUFlLENBQUMsWUFBakIsR0FBZ0MsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsZUFBRixDQUFBLEVBQVA7TUFBQSxDQUxoQyxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBQyxDQUFBLGVBQXRCLENBTkEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/result-view.coffee
