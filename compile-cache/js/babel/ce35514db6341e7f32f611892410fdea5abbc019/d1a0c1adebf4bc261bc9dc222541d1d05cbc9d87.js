'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LegacyAdater = (function () {
  function LegacyAdater(textEditor) {
    _classCallCheck(this, LegacyAdater);

    this.textEditor = textEditor;
  }

  _createClass(LegacyAdater, [{
    key: 'enableCache',
    value: function enableCache() {
      this.useCache = true;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      delete this.maxScrollTopCache;
    }
  }, {
    key: 'onDidChangeScrollTop',
    value: function onDidChangeScrollTop(callback) {
      return this.textEditor.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditor.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditor.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.textEditor.getScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.textEditor.getScrollTop();
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditor.getScrollLeft();
        }
        return this.scrollLeftCache;
      }

      return this.textEditor.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }
      var maxScrollTop = this.textEditor.getMaxScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    }
  }]);

  return LegacyAdater;
})();

exports['default'] = LegacyAdater;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvbGVnYWN5LWFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7O0lBS1UsWUFBWTtBQUNuQixXQURPLFlBQVksQ0FDbEIsVUFBVSxFQUFFOzBCQUROLFlBQVk7O0FBQ0osUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7R0FBRTs7ZUFEdEMsWUFBWTs7V0FHbkIsdUJBQUc7QUFBRSxVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtLQUFFOzs7V0FFNUIsc0JBQUc7QUFDWixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7QUFDdkIsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFBO0FBQzFCLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtBQUMzQixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtLQUM5Qjs7O1dBRW9CLDhCQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdEQ7OztXQUVxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZEOzs7V0FFUyxxQkFBRztBQUNYLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNyQixjQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUE7U0FDL0M7QUFDRCxlQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7T0FDeEI7QUFDRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUE7S0FDbkM7OztXQUVZLHdCQUFHO0FBQ2QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3hCLGNBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtTQUNyRDtBQUNELGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtPQUMzQjtBQUNELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUN0Qzs7O1dBRVksc0JBQUMsU0FBUyxFQUFFO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDL0M7OztXQUVhLHlCQUFHO0FBQ2YsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3pCLGNBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtTQUN2RDtBQUNELGVBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtPQUM1Qjs7QUFFRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUE7S0FDdkM7OztXQUVlLDJCQUFHO0FBQ2pCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ25ELGVBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO09BQzlCO0FBQ0QsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUNwRCxVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUE7O0FBRXhELFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixvQkFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFBO09BQ2xEO0FBQ0QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQUUsWUFBSSxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQTtPQUFFO0FBQzVELGFBQU8sWUFBWSxDQUFBO0tBQ3BCOzs7U0FwRWtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvbGVnYWN5LWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lBZGF0ZXIge1xuICBjb25zdHJ1Y3RvciAodGV4dEVkaXRvcikgeyB0aGlzLnRleHRFZGl0b3IgPSB0ZXh0RWRpdG9yIH1cblxuICBlbmFibGVDYWNoZSAoKSB7IHRoaXMudXNlQ2FjaGUgPSB0cnVlIH1cblxuICBjbGVhckNhY2hlICgpIHtcbiAgICB0aGlzLnVzZUNhY2hlID0gZmFsc2VcbiAgICBkZWxldGUgdGhpcy5oZWlnaHRDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsTGVmdENhY2hlXG4gICAgZGVsZXRlIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsVG9wIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxUb3AoY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZVNjcm9sbExlZnQgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZVNjcm9sbExlZnQoY2FsbGJhY2spXG4gIH1cblxuICBnZXRIZWlnaHQgKCkge1xuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuaGVpZ2h0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5oZWlnaHRDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRIZWlnaHQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0Q2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5nZXRIZWlnaHQoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbFRvcENhY2hlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9wQ2FjaGUgPSB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsVG9wKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsVG9wKClcbiAgfVxuXG4gIHNldFNjcm9sbFRvcCAoc2Nyb2xsVG9wKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuICB9XG5cbiAgZ2V0U2Nyb2xsTGVmdCAoKSB7XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxMZWZ0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxMZWZ0Q2FjaGUgPSB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLmdldFNjcm9sbExlZnQoKVxuICB9XG5cbiAgZ2V0TWF4U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy5tYXhTY3JvbGxUb3BDYWNoZSAhPSBudWxsICYmIHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIHJldHVybiB0aGlzLm1heFNjcm9sbFRvcENhY2hlXG4gICAgfVxuICAgIHZhciBtYXhTY3JvbGxUb3AgPSB0aGlzLnRleHRFZGl0b3IuZ2V0TWF4U2Nyb2xsVG9wKClcbiAgICB2YXIgbGluZUhlaWdodCA9IHRoaXMudGV4dEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsUGFzdEVuZCkge1xuICAgICAgbWF4U2Nyb2xsVG9wIC09IHRoaXMuZ2V0SGVpZ2h0KCkgLSAzICogbGluZUhlaWdodFxuICAgIH1cbiAgICBpZiAodGhpcy51c2VDYWNoZSkgeyB0aGlzLm1heFNjcm9sbFRvcENhY2hlID0gbWF4U2Nyb2xsVG9wIH1cbiAgICByZXR1cm4gbWF4U2Nyb2xsVG9wXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/minimap/lib/adapters/legacy-adapter.js
