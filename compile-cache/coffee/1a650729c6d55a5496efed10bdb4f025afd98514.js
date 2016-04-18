(function() {
  var ResultView, TextEditorView, WatchView, _;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  _ = require('lodash');

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
      this.addHistoryScrollbar().clearHistory();
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
      this.historyScrollbar.querySelector('.hidden').style.width = (total = this.currentHistory.length * this.historyScrollbar.offsetWidth) + 'px';
      this.historyScrollbar.scrollLeft = total;
      return this;
    };

    WatchView.prototype.addHistoryScrollbar = function() {
      var filler;
      this.historyScrollbar = document.createElement('div');
      filler = document.createElement('div');
      this.historyScrollbar.classList.add('history-scrollbar');
      filler.classList.add('hidden');
      this.historyScrollbar.appendChild(filler);
      this.historyScrollbar.onscroll = (function(_this) {
        return function(currentPos) {
          return function(e) {
            var pos;
            pos = Math.ceil(_this.historyScrollbar.scrollLeft / (_this.historyScrollbar.offsetWidth + 1));
            if (pos >= _this.currentHistory.length) {
              pos = _this.currentHistory.length - 1;
            }
            if (currentPos !== pos) {
              _this.clearResults();
              return _this.resultView.addResult(_this.currentHistory[currentPos = pos]);
            }
          };
        };
      })(this)(0);
      this.element.appendChild(this.historyScrollbar);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2gtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVXLElBQUEsbUJBQUUsTUFBRixFQUFXLE9BQVgsR0FBQTtBQUNULE1BRFUsSUFBQyxDQUFBLFNBQUEsTUFDWCxDQUFBO0FBQUEsTUFEbUIsSUFBQyxDQUFBLFVBQUEsT0FDcEIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFVBQXZCLEVBQW1DLFlBQW5DLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxjQUFBLENBQUEsQ0FIcEIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWhDLENBQW9DLGFBQXBDLENBSkEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsWUFBWSxDQUFDLFFBQWQsQ0FBQSxDQU5mLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixJQUFDLENBQUEsT0FBekIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFD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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watch-view.coffee
