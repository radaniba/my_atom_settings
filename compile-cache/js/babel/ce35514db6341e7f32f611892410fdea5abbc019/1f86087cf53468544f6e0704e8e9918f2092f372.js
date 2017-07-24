Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _atomTernjsProvider = require('./atom-ternjs-provider');

var _atomTernjsProvider2 = _interopRequireDefault(_atomTernjsProvider);

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsHyperclickProvider = require('./atom-ternjs-hyperclick-provider');

var _atomTernjsHyperclickProvider2 = _interopRequireDefault(_atomTernjsHyperclickProvider);

'use babel';

var AtomTernjs = (function () {
  function AtomTernjs() {
    _classCallCheck(this, AtomTernjs);

    this.config = _config2['default'];
  }

  _createClass(AtomTernjs, [{
    key: 'activate',
    value: function activate() {

      _atomTernjsManager2['default'].init();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {

      _atomTernjsManager2['default'].destroy();
    }
  }, {
    key: 'provide',
    value: function provide() {

      return _atomTernjsProvider2['default'];
    }
  }, {
    key: 'provideHyperclick',
    value: function provideHyperclick() {
      return _atomTernjsHyperclickProvider2['default'];
    }
  }]);

  return AtomTernjs;
})();

exports['default'] = new AtomTernjs();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBRXlCLFVBQVU7Ozs7a0NBQ2Qsd0JBQXdCOzs7O2lDQUN6Qix1QkFBdUI7Ozs7NENBQ3BCLG1DQUFtQzs7OztBQUwxRCxXQUFXLENBQUM7O0lBT04sVUFBVTtBQUVILFdBRlAsVUFBVSxHQUVBOzBCQUZWLFVBQVU7O0FBSVosUUFBSSxDQUFDLE1BQU0sc0JBQWUsQ0FBQztHQUM1Qjs7ZUFMRyxVQUFVOztXQU9OLG9CQUFHOztBQUVULHFDQUFRLElBQUksRUFBRSxDQUFDO0tBQ2hCOzs7V0FFUyxzQkFBRzs7QUFFWCxxQ0FBUSxPQUFPLEVBQUUsQ0FBQztLQUNuQjs7O1dBRU0sbUJBQUc7O0FBRVIsNkNBQWdCO0tBQ2pCOzs7V0FFZ0IsNkJBQUc7QUFDbEIsdURBQWtCO0tBQ25COzs7U0F4QkcsVUFBVTs7O3FCQTJCRCxJQUFJLFVBQVUsRUFBRSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZGVmYXVsQ29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBwcm92aWRlciBmcm9tICcuL2F0b20tdGVybmpzLXByb3ZpZGVyJztcbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQgaHlwZXJjbGljayBmcm9tICcuL2F0b20tdGVybmpzLWh5cGVyY2xpY2stcHJvdmlkZXInO1xuXG5jbGFzcyBBdG9tVGVybmpzIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuY29uZmlnID0gZGVmYXVsQ29uZmlnO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG5cbiAgICBtYW5hZ2VyLmluaXQoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG5cbiAgICBtYW5hZ2VyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHByb3ZpZGUoKSB7XG5cbiAgICByZXR1cm4gcHJvdmlkZXI7XG4gIH1cblxuICBwcm92aWRlSHlwZXJjbGljaygpIHtcbiAgICByZXR1cm4gaHlwZXJjbGljaztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQXRvbVRlcm5qcygpO1xuIl19