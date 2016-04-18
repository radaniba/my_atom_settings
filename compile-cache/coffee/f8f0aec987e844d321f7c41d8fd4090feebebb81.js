(function() {
  var ResultView, TextEditorView, WatchView;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  ResultView = require('./result-view');

  module.exports = WatchView = (function() {
    function WatchView(kernel, grammar) {
      this.kernel = kernel;
      this.grammar = grammar;
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen', 'watch-view');
      this.inputElement = new TextEditorView();
      this.inputElement.element.classList.add('watch-input');
      this.inputEditor = this.inputElement.getModel();
      this.inputEditor.setGrammar(this.grammar);
      this.inputEditor.setSoftWrapped(true);
      this.inputEditor.setLineNumberGutterVisible(false);
      this.inputEditor.moveToTop();
      this.resultView = new ResultView();
      this.resultView.setMultiline(true);
      this.element.appendChild(this.inputElement.element);
      this.element.appendChild(this.resultView.element);
      this.addHistorySwitch().clearHistory();
    }

    WatchView.prototype.clearHistory = function(currentHistory) {
      this.currentHistory = currentHistory != null ? currentHistory : [];
      return this;
    };

    WatchView.prototype.addToHistory = function(result) {
      var total;
      if (result.data === 'ok') {
        return;
      }
      this.currentHistory.push(result);
      this.currentHistory.pos = this.currentHistory.length - 1;
      this.counter.innerText = "" + this.currentHistory.length + " / " + this.currentHistory.length;
      this.scrollbar.querySelector('.hidden').style.width = (total = this.currentHistory.length * this.scrollbar.offsetWidth) + 'px';
      this.scrollbar.scrollLeft = total;
      this.historySwitch.classList.add('show');
      return this;
    };

    WatchView.prototype.addHistorySwitch = function() {
      var filler;
      this.historySwitch = document.createElement('div');
      this.historySwitch.classList.add('history-switch', 'hide');
      this.scrollbar = document.createElement('div');
      filler = document.createElement('div');
      this.scrollbar.classList.add('scrollbar');
      filler.classList.add('hidden');
      this.scrollbar.appendChild(filler);
      this.scrollbar.onscroll = (function(_this) {
        return function() {
          _this.currentHistory.pos = Math.ceil(_this.scrollbar.scrollLeft / (_this.scrollbar.offsetWidth + 1));
          _this.counter.innerText = "" + (_this.currentHistory.pos + 1) + " / " + _this.currentHistory.length;
          _this.clearResults();
          return _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
        };
      })(this);
      this.counter = document.createElement('div');
      this.counter.classList.add('counter');
      this.nextButton = document.createElement('button');
      this.nextButton.classList.add('btn', 'btn-xs', 'icon', 'icon-chevron-right', 'next-btn');
      this.nextButton.onclick = (function(_this) {
        return function() {
          if (_this.currentHistory.pos !== _this.currentHistory.length - 1 && (_this.currentHistory.pos != null)) {
            _this.currentHistory.pos += 1;
            _this.counter.innerText = "" + (_this.currentHistory.pos + 1) + " / " + _this.currentHistory.length;
            _this.scrollbar.scrollLeft = _this.currentHistory.pos * (_this.scrollbar.offsetWidth + 1);
            _this.clearResults();
            return _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
          }
        };
      })(this);
      this.prevButton = document.createElement('button');
      this.prevButton.classList.add('btn', 'btn-xs', 'icon', 'icon-chevron-left');
      this.prevButton.onclick = (function(_this) {
        return function() {
          if (_this.currentHistory.pos !== 0 && (_this.currentHistory.pos != null)) {
            _this.currentHistory.pos -= 1;
            _this.counter.innerText = "" + (_this.currentHistory.pos + 1) + " / " + _this.currentHistory.length;
            _this.scrollbar.scrollLeft = _this.currentHistory.pos * (_this.scrollbar.offsetWidth + 1);
            _this.clearResults();
            return _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
          }
        };
      })(this);
      this.historySwitch.appendChild(this.prevButton);
      this.historySwitch.appendChild(this.counter);
      this.historySwitch.appendChild(this.nextButton);
      this.historySwitch.appendChild(this.scrollbar);
      this.element.appendChild(this.historySwitch);
      return this;
    };

    WatchView.prototype.run = function() {
      var code;
      code = this.getCode();
      this.clearResults();
      console.log("watchview running:", code);
      if ((code != null) && (code.length != null) && code.length > 0) {
        return this.kernel.executeWatch(code, (function(_this) {
          return function(result) {
            console.log("watchview got result:", result);
            _this.resultView.addResult(result);
            return _this.addToHistory(result);
          };
        })(this));
      }
    };

    WatchView.prototype.setCode = function(code) {
      this.inputEditor.setText(code);
      return this;
    };

    WatchView.prototype.getCode = function() {
      return this.inputElement.getText();
    };

    WatchView.prototype.clearResults = function() {
      var e;
      try {
        this.element.removeChild(this.resultView.element);
        this.resultView.destroy();
      } catch (_error) {
        e = _error;
        console.error(e);
      }
      this.resultView = new ResultView();
      this.resultView.setMultiline(true);
      return this.element.appendChild(this.resultView.element);
    };

    WatchView.prototype.destroy = function() {
      this.clearResults();
      return this.element.parentNode.removeChild(this.element);
    };

    return WatchView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2gtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUNBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUZiLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRVcsSUFBQSxtQkFBRSxNQUFGLEVBQVcsT0FBWCxHQUFBO0FBQ1QsTUFEVSxJQUFDLENBQUEsU0FBQSxNQUNYLENBQUE7QUFBQSxNQURtQixJQUFDLENBQUEsVUFBQSxPQUNwQixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsVUFBdkIsRUFBbUMsWUFBbkMsQ0FEQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLGNBQUEsQ0FBQSxDQUhwQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBaEMsQ0FBb0MsYUFBcEMsQ0FKQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxZQUFZLENBQUMsUUFBZCxDQUFBLENBTmYsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLElBQUMsQ0FBQSxPQUF6QixDQVBBLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUE1QixDQVJBLENBQUE7QUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watch-view.coffee
