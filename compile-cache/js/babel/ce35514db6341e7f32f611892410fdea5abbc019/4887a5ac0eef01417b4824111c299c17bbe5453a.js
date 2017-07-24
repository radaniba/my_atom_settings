Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _resultView = require('./result-view');

var _resultView2 = _interopRequireDefault(_resultView);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var WatchView = (function () {
  function WatchView(kernel) {
    _classCallCheck(this, WatchView);

    this.kernel = kernel;
    this.element = document.createElement('div');
    this.element.classList.add('hydrogen', 'watch-view');

    this.inputEditor = new _atom.TextEditor();
    this.inputEditor.element.classList.add('watch-input');
    this.inputEditor.setGrammar(this.kernel.grammar);
    this.inputEditor.setSoftWrapped(true);
    this.inputEditor.setLineNumberGutterVisible(false);
    this.inputEditor.moveToTop();

    this.resultView = new _resultView2['default']();
    this.resultView.setMultiline(true);

    this.element.appendChild(this.inputEditor.element);
    this.element.appendChild(this.resultView.element);

    this.addHistorySwitch().clearHistory();
  }

  _createClass(WatchView, [{
    key: 'clearHistory',
    value: function clearHistory() {
      var currentHistory = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      this.currentHistory = currentHistory;
      return this;
    }
  }, {
    key: 'addToHistory',
    value: function addToHistory(result) {
      if (result.stream === 'status' || result.stream === 'execution_count') return;
      this.currentHistory.push(result);
      this.currentHistory.pos = this.currentHistory.length - 1;
      this.counter.innerText = this.currentHistory.length + ' / ' + this.currentHistory.length;
      var total = this.currentHistory.length * this.scrollbar.offsetWidth;
      this.scrollbar.querySelector('.hidden').style.width = total + 'px';
      this.scrollbar.scrollLeft = total;
      this.historySwitch.classList.add('show');
    }
  }, {
    key: 'addHistorySwitch',
    value: function addHistorySwitch() {
      var _this = this;

      this.historySwitch = document.createElement('div');
      this.historySwitch.classList.add('history-switch', 'hide');

      this.scrollbar = document.createElement('div');
      var filler = document.createElement('div');
      this.scrollbar.classList.add('scrollbar');
      filler.classList.add('hidden');
      this.scrollbar.appendChild(filler);
      this.scrollbar.onscroll = function () {
        _this.currentHistory.pos = Math.ceil(_this.scrollbar.scrollLeft / (_this.scrollbar.offsetWidth + 1));
        _this.counter.innerText = _this.currentHistory.pos + 1 + ' / ' + _this.currentHistory.length;
        _this.clearResults();
        _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
      };

      this.counter = document.createElement('div');
      this.counter.classList.add('counter');

      var nextButton = document.createElement('button');
      nextButton.classList.add('btn', 'btn-xs', 'icon', 'icon-chevron-right', 'next-btn');
      nextButton.onclick = function () {
        if (_this.currentHistory.pos && _this.currentHistory.pos !== _this.currentHistory.length - 1) {
          _this.currentHistory.pos += 1;
          _this.counter.innerText = _this.currentHistory.pos + 1 + ' / ' + _this.currentHistory.length;
          _this.scrollbar.scrollLeft = _this.currentHistory.pos * (_this.scrollbar.offsetWidth + 1);
          _this.clearResults();
          _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
        }
      };

      var prevButton = document.createElement('button');
      prevButton.classList.add('btn', 'btn-xs', 'icon', 'icon-chevron-left');
      prevButton.onclick = function () {
        if (_this.currentHistory.pos && _this.currentHistory.pos !== 0) {
          _this.currentHistory.pos -= 1;
          _this.counter.innerText = _this.currentHistory.pos + 1 + ' / ' + _this.currentHistory.length;
          _this.scrollbar.scrollLeft = _this.currentHistory.pos * (_this.scrollbar.offsetWidth + 1);
          _this.clearResults();
          _this.resultView.addResult(_this.currentHistory[_this.currentHistory.pos]);
        }
      };

      this.historySwitch.appendChild(prevButton);
      this.historySwitch.appendChild(this.counter);
      this.historySwitch.appendChild(nextButton);
      this.historySwitch.appendChild(this.scrollbar);
      this.element.appendChild(this.historySwitch);
      return this;
    }
  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      var code = this.getCode();
      this.clearResults();
      (0, _log2['default'])('watchview running:', code);
      if (code && code.length && code.length > 0) {
        this.kernel.executeWatch(code, function (result) {
          (0, _log2['default'])('watchview got result:', result);
          _this2.resultView.addResult(result);
          _this2.addToHistory(result);
        });
      }
    }
  }, {
    key: 'setCode',
    value: function setCode(code) {
      this.inputEditor.setText(code);
    }
  }, {
    key: 'getCode',
    value: function getCode() {
      return this.inputEditor.getText();
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.inputEditor.element.focus();
    }
  }, {
    key: 'clearResults',
    value: function clearResults() {
      try {
        this.element.removeChild(this.resultView.element);
        this.resultView.destroy();
      } catch (e) {
        console.error(e);
      }

      this.resultView = new _resultView2['default']();
      this.resultView.setMultiline(true);
      this.element.appendChild(this.resultView.element);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearResults();
      this.element.parentNode.removeChild(this.element);
    }
  }]);

  return WatchView;
})();

exports['default'] = WatchView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dhdGNoLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFMkIsTUFBTTs7MEJBRVYsZUFBZTs7OzttQkFDdEIsT0FBTzs7OztBQUx2QixXQUFXLENBQUM7O0lBT1MsU0FBUztBQUVqQixXQUZRLFNBQVMsQ0FFaEIsTUFBTSxFQUFFOzBCQUZELFNBQVM7O0FBRzFCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUVyRCxRQUFJLENBQUMsV0FBVyxHQUFHLHNCQUFnQixDQUFDO0FBQ3BDLFFBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqRCxRQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxRQUFJLENBQUMsV0FBVyxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQWdCLENBQUM7QUFDbkMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRW5DLFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE9B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a2FnZXMvSHlkcm9nZW4vbGliL3dhdGNoLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgUmVzdWx0VmlldyBmcm9tICcuL3Jlc3VsdC12aWV3JztcbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXRjaFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGtlcm5lbCkge1xuICAgIHRoaXMua2VybmVsID0ga2VybmVsO1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoeWRyb2dlbicsICd3YXRjaC12aWV3Jyk7XG5cbiAgICB0aGlzLmlucHV0RWRpdG9yID0gbmV3IFRleHRFZGl0b3IoKTtcbiAgICB0aGlzLmlucHV0RWRpdG9yLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnd2F0Y2gtaW5wdXQnKTtcbiAgICB0aGlzLmlucHV0RWRpdG9yLnNldEdyYW1tYXIodGhpcy5rZXJuZWwuZ3JhbW1hcik7XG4gICAgdGhpcy5pbnB1dEVkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgICB0aGlzLmlucHV0RWRpdG9yLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKGZhbHNlKTtcbiAgICB0aGlzLmlucHV0RWRpdG9yLm1vdmVUb1RvcCgpO1xuXG4gICAgdGhpcy5yZXN1bHRWaWV3ID0gbmV3IFJlc3VsdFZpZXcoKTtcbiAgICB0aGlzLnJlc3VsdFZpZXcuc2V0TXVsdGlsaW5lKHRydWUpO1xuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaW5wdXRFZGl0b3IuZWxlbWVudCk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMucmVzdWx0Vmlldy5lbGVtZW50KTtcblxuICAgIHRoaXMuYWRkSGlzdG9yeVN3aXRjaCgpLmNsZWFySGlzdG9yeSgpO1xuICB9XG5cbiAgY2xlYXJIaXN0b3J5KGN1cnJlbnRIaXN0b3J5ID0gW10pIHtcbiAgICB0aGlzLmN1cnJlbnRIaXN0b3J5ID0gY3VycmVudEhpc3Rvcnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRUb0hpc3RvcnkocmVzdWx0KSB7XG4gICAgaWYgKHJlc3VsdC5zdHJlYW0gPT09ICdzdGF0dXMnIHx8IHJlc3VsdC5zdHJlYW0gPT09ICdleGVjdXRpb25fY291bnQnKSByZXR1cm47XG4gICAgdGhpcy5jdXJyZW50SGlzdG9yeS5wdXNoKHJlc3VsdCk7XG4gICAgdGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgPSB0aGlzLmN1cnJlbnRIaXN0b3J5Lmxlbmd0aCAtIDE7XG4gICAgdGhpcy5jb3VudGVyLmlubmVyVGV4dCA9IGAke3RoaXMuY3VycmVudEhpc3RvcnkubGVuZ3RofSAvICR7dGhpcy5jdXJyZW50SGlzdG9yeS5sZW5ndGh9YDtcbiAgICBjb25zdCB0b3RhbCA9IHRoaXMuY3VycmVudEhpc3RvcnkubGVuZ3RoICogdGhpcy5zY3JvbGxiYXIub2Zmc2V0V2lkdGg7XG4gICAgdGhpcy5zY3JvbGxiYXIucXVlcnlTZWxlY3RvcignLmhpZGRlbicpLnN0eWxlLndpZHRoID0gYCR7dG90YWx9cHhgO1xuICAgIHRoaXMuc2Nyb2xsYmFyLnNjcm9sbExlZnQgPSB0b3RhbDtcbiAgICB0aGlzLmhpc3RvcnlTd2l0Y2guY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICB9XG5cbiAgYWRkSGlzdG9yeVN3aXRjaCgpIHtcbiAgICB0aGlzLmhpc3RvcnlTd2l0Y2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmhpc3RvcnlTd2l0Y2guY2xhc3NMaXN0LmFkZCgnaGlzdG9yeS1zd2l0Y2gnLCAnaGlkZScpO1xuXG4gICAgdGhpcy5zY3JvbGxiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBmaWxsZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLnNjcm9sbGJhci5jbGFzc0xpc3QuYWRkKCdzY3JvbGxiYXInKTtcbiAgICBmaWxsZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgdGhpcy5zY3JvbGxiYXIuYXBwZW5kQ2hpbGQoZmlsbGVyKTtcbiAgICB0aGlzLnNjcm9sbGJhci5vbnNjcm9sbCA9ICgpID0+IHtcbiAgICAgIHRoaXMuY3VycmVudEhpc3RvcnkucG9zID0gTWF0aC5jZWlsKFxuICAgICAgICB0aGlzLnNjcm9sbGJhci5zY3JvbGxMZWZ0IC8gKHRoaXMuc2Nyb2xsYmFyLm9mZnNldFdpZHRoICsgMSkpO1xuICAgICAgdGhpcy5jb3VudGVyLmlubmVyVGV4dCA9IGAke3RoaXMuY3VycmVudEhpc3RvcnkucG9zICsgMX0gLyAke3RoaXMuY3VycmVudEhpc3RvcnkubGVuZ3RofWA7XG4gICAgICB0aGlzLmNsZWFyUmVzdWx0cygpO1xuICAgICAgdGhpcy5yZXN1bHRWaWV3LmFkZFJlc3VsdCh0aGlzLmN1cnJlbnRIaXN0b3J5W3RoaXMuY3VycmVudEhpc3RvcnkucG9zXSk7XG4gICAgfTtcblxuICAgIHRoaXMuY291bnRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuY291bnRlci5jbGFzc0xpc3QuYWRkKCdjb3VudGVyJyk7XG5cbiAgICBjb25zdCBuZXh0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nLCAnYnRuLXhzJywgJ2ljb24nLCAnaWNvbi1jaGV2cm9uLXJpZ2h0JywgJ25leHQtYnRuJyk7XG4gICAgbmV4dEJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuY3VycmVudEhpc3RvcnkucG9zICYmXG4gICAgICAgICAgdGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgIT09IHRoaXMuY3VycmVudEhpc3RvcnkubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRIaXN0b3J5LnBvcyArPSAxO1xuICAgICAgICB0aGlzLmNvdW50ZXIuaW5uZXJUZXh0ID0gYCR7dGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgKyAxfSAvICR7dGhpcy5jdXJyZW50SGlzdG9yeS5sZW5ndGh9YDtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXIuc2Nyb2xsTGVmdCA9IHRoaXMuY3VycmVudEhpc3RvcnkucG9zICogKHRoaXMuc2Nyb2xsYmFyLm9mZnNldFdpZHRoICsgMSk7XG4gICAgICAgIHRoaXMuY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgIHRoaXMucmVzdWx0Vmlldy5hZGRSZXN1bHQodGhpcy5jdXJyZW50SGlzdG9yeVt0aGlzLmN1cnJlbnRIaXN0b3J5LnBvc10pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBwcmV2QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nLCAnYnRuLXhzJywgJ2ljb24nLCAnaWNvbi1jaGV2cm9uLWxlZnQnKTtcbiAgICBwcmV2QnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgJiYgdGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgIT09IDApIHtcbiAgICAgICAgdGhpcy5jdXJyZW50SGlzdG9yeS5wb3MgLT0gMTtcbiAgICAgICAgdGhpcy5jb3VudGVyLmlubmVyVGV4dCA9IGAke3RoaXMuY3VycmVudEhpc3RvcnkucG9zICsgMX0gLyAke3RoaXMuY3VycmVudEhpc3RvcnkubGVuZ3RofWA7XG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyLnNjcm9sbExlZnQgPSB0aGlzLmN1cnJlbnRIaXN0b3J5LnBvcyAqICh0aGlzLnNjcm9sbGJhci5vZmZzZXRXaWR0aCArIDEpO1xuICAgICAgICB0aGlzLmNsZWFyUmVzdWx0cygpO1xuICAgICAgICB0aGlzLnJlc3VsdFZpZXcuYWRkUmVzdWx0KHRoaXMuY3VycmVudEhpc3RvcnlbdGhpcy5jdXJyZW50SGlzdG9yeS5wb3NdKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5oaXN0b3J5U3dpdGNoLmFwcGVuZENoaWxkKHByZXZCdXR0b24pO1xuICAgIHRoaXMuaGlzdG9yeVN3aXRjaC5hcHBlbmRDaGlsZCh0aGlzLmNvdW50ZXIpO1xuICAgIHRoaXMuaGlzdG9yeVN3aXRjaC5hcHBlbmRDaGlsZChuZXh0QnV0dG9uKTtcbiAgICB0aGlzLmhpc3RvcnlTd2l0Y2guYXBwZW5kQ2hpbGQodGhpcy5zY3JvbGxiYXIpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmhpc3RvcnlTd2l0Y2gpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmdldENvZGUoKTtcbiAgICB0aGlzLmNsZWFyUmVzdWx0cygpO1xuICAgIGxvZygnd2F0Y2h2aWV3IHJ1bm5pbmc6JywgY29kZSk7XG4gICAgaWYgKGNvZGUgJiYgY29kZS5sZW5ndGggJiYgY29kZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmtlcm5lbC5leGVjdXRlV2F0Y2goY29kZSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICBsb2coJ3dhdGNodmlldyBnb3QgcmVzdWx0OicsIHJlc3VsdCk7XG4gICAgICAgIHRoaXMucmVzdWx0Vmlldy5hZGRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgdGhpcy5hZGRUb0hpc3RvcnkocmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldENvZGUoY29kZSkge1xuICAgIHRoaXMuaW5wdXRFZGl0b3Iuc2V0VGV4dChjb2RlKTtcbiAgfVxuXG4gIGdldENvZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRFZGl0b3IuZ2V0VGV4dCgpO1xuICB9XG5cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5pbnB1dEVkaXRvci5lbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBjbGVhclJlc3VsdHMoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnJlc3VsdFZpZXcuZWxlbWVudCk7XG4gICAgICB0aGlzLnJlc3VsdFZpZXcuZGVzdHJveSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZXN1bHRWaWV3ID0gbmV3IFJlc3VsdFZpZXcoKTtcbiAgICB0aGlzLnJlc3VsdFZpZXcuc2V0TXVsdGlsaW5lKHRydWUpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnJlc3VsdFZpZXcuZWxlbWVudCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJSZXN1bHRzKCk7XG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIl19