Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var MinimapCursorLineBinding = (function () {
  function MinimapCursorLineBinding(minimap) {
    var _this = this;

    _classCallCheck(this, MinimapCursorLineBinding);

    this.minimap = minimap;
    this.subscriptions = new _atom.CompositeDisposable();
    this.editor = this.minimap.getTextEditor();
    this.decorationsByMarkerId = {};
    this.decorationSubscriptionsByMarkerId = {};

    this.subscriptions.add(this.editor.observeCursors(function (cursor) {
      _this.handleMarker(cursor.getMarker());
    }));
  }

  _createClass(MinimapCursorLineBinding, [{
    key: 'handleMarker',
    value: function handleMarker(marker) {
      var _this2 = this;

      var id = marker.id;

      var decoration = this.minimap.decorateMarker(marker, { type: 'line', 'class': 'cursor-line' });
      this.decorationsByMarkerId[id] = decoration;
      this.decorationSubscriptionsByMarkerId[id] = decoration.onDidDestroy(function () {
        _this2.decorationSubscriptionsByMarkerId[id].dispose();

        delete _this2.decorationsByMarkerId[id];
        delete _this2.decorationSubscriptionsByMarkerId[id];
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      for (var id in this.decorationsByMarkerId) {
        var decoration = this.decorationsByMarkerId[id];
        this.decorationSubscriptionsByMarkerId[id].dispose();
        decoration.destroy();

        delete this.decorationsByMarkerId[id];
        delete this.decorationSubscriptionsByMarkerId[id];
      }

      this.subscriptions.dispose();
    }
  }]);

  return MinimapCursorLineBinding;
})();

exports['default'] = MinimapCursorLineBinding;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL2xpYi9taW5pbWFwLWN1cnNvcmxpbmUtYmluZGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFBOztJQUlVLHdCQUF3QjtBQUUvQixXQUZPLHdCQUF3QixDQUU5QixPQUFPLEVBQUU7OzswQkFGSCx3QkFBd0I7O0FBR3pDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFBO0FBQzFDLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUE7QUFDL0IsUUFBSSxDQUFDLGlDQUFpQyxHQUFHLEVBQUUsQ0FBQTs7QUFFM0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDNUQsWUFBSyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7S0FDdEMsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUFaa0Isd0JBQXdCOztXQWM5QixzQkFBQyxNQUFNLEVBQUU7OztVQUNaLEVBQUUsR0FBSyxNQUFNLENBQWIsRUFBRTs7QUFDVixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FDNUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFPLGFBQWEsRUFBRSxDQUMvQyxDQUFBO0FBQ0QsVUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtBQUMzQyxVQUFJLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQ3pFLGVBQUssaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRXBELGVBQU8sT0FBSyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQyxlQUFPLE9BQUssaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUE7T0FDbEQsQ0FBQyxDQUFBO0tBQ0g7OztXQUVPLG1CQUFHO0FBQ1QsV0FBSyxJQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7QUFDM0MsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ2pELFlBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNwRCxrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVwQixlQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQyxlQUFPLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsRDs7QUFFRCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0F2Q2tCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWN1cnNvcmxpbmUvbGliL21pbmltYXAtY3Vyc29ybGluZS1iaW5kaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pbmltYXBDdXJzb3JMaW5lQmluZGluZyB7XG5cbiAgY29uc3RydWN0b3IgKG1pbmltYXApIHtcbiAgICB0aGlzLm1pbmltYXAgPSBtaW5pbWFwXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZWRpdG9yID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKVxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWRpdG9yLm9ic2VydmVDdXJzb3JzKChjdXJzb3IpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlTWFya2VyKGN1cnNvci5nZXRNYXJrZXIoKSlcbiAgICB9KSlcbiAgfVxuXG4gIGhhbmRsZU1hcmtlciAobWFya2VyKSB7XG4gICAgY29uc3QgeyBpZCB9ID0gbWFya2VyXG4gICAgY29uc3QgZGVjb3JhdGlvbiA9IHRoaXMubWluaW1hcC5kZWNvcmF0ZU1hcmtlcihcbiAgICAgIG1hcmtlciwgeyB0eXBlOiAnbGluZScsIGNsYXNzOiAnY3Vyc29yLWxpbmUnIH1cbiAgICApXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdID0gZGVjb3JhdGlvblxuICAgIHRoaXMuZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb24ub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXS5kaXNwb3NlKClcblxuICAgICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgIH0pXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkKSB7XG4gICAgICBjb25zdCBkZWNvcmF0aW9uID0gdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgICB0aGlzLmRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0uZGlzcG9zZSgpXG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuXG4gICAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG5cbn1cbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/minimap-cursorline/lib/minimap-cursorline-binding.js
