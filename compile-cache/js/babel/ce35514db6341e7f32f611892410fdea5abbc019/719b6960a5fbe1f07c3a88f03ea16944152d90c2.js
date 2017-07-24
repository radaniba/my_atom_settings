Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsHelper = require('./atom-ternjs-helper');

'use babel';

var Hyperclick = (function () {
  function Hyperclick() {
    _classCallCheck(this, Hyperclick);

    this.providerName = 'atom-ternjs-hyperclick';
    this.wordRegExp = new RegExp('(`(\\\\.|[^`\\\\])*`)|(\'(\\\\.|[^\'\\\\])*\')|("(\\\\.|[^"\\\\])*")|([a-zA-Z0-9_$]+)', 'g');
  }

  _createClass(Hyperclick, [{
    key: 'getSuggestionForWord',
    value: function getSuggestionForWord(editor, string, range) {
      return new Promise(function (resolve) {
        if (!string.trim()) {
          return resolve(null);
        }

        if (!_atomTernjsManager2['default'].client) {
          return resolve(null);
        }

        _atomTernjsManager2['default'].client.update(editor).then(function (data) {
          if (!data) {
            return resolve(null);
          }

          _atomTernjsManager2['default'].client.getDefinition(atom.project.relativizePath(editor.getURI())[1], range).then(function (data) {
            if (!data) {
              return resolve(null);
            }

            if (data && data.file) {
              resolve({
                range: range,
                callback: function callback() {
                  (0, _atomTernjsHelper.openFileAndGoTo)(data.start, data.file);
                }
              });
            }

            resolve(null);
          })['catch'](function () {
            return resolve(null);
          });
        });
      });
    }
  }]);

  return Hyperclick;
})();

exports['default'] = new Hyperclick();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWh5cGVyY2xpY2stcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FFb0IsdUJBQXVCOzs7O2dDQUNYLHNCQUFzQjs7QUFIdEQsV0FBVyxDQUFDOztJQUtOLFVBQVU7QUFDSCxXQURQLFVBQVUsR0FDQTswQkFEVixVQUFVOztBQUVaLFFBQUksQ0FBQyxZQUFZLEdBQUcsd0JBQXdCLENBQUM7QUFDN0MsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyx1RkFBdUYsRUFBRSxHQUFHLENBQUMsQ0FBQztHQUM1SDs7ZUFKRyxVQUFVOztXQU1NLDhCQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzFDLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDOUIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUNsQixpQkFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEI7O0FBRUQsWUFBSSxDQUFDLCtCQUFRLE1BQU0sRUFBRTtBQUNuQixpQkFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEI7O0FBRUQsdUNBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0MsY0FBSSxDQUFDLElBQUksRUFBRTtBQUNULG1CQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztXQUN0Qjs7QUFFRCx5Q0FBUSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNsRyxnQkFBSSxDQUFDLElBQUksRUFBRTtBQUNULHFCQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0Qjs7QUFFRCxnQkFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUNyQixxQkFBTyxDQUFDO0FBQ04scUJBQUssRUFBRSxLQUFLO0FBQ1osd0JBQVEsRUFBQSxvQkFBRztBQUNULHlEQUFnQixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDeEM7ZUFDRixDQUFDLENBQUM7YUFDSjs7QUFFRCxtQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ2YsQ0FBQyxTQUFNLENBQUM7bUJBQU0sT0FBTyxDQUFDLElBQUksQ0FBQztXQUFBLENBQUMsQ0FBQztTQUMvQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBdkNHLFVBQVU7OztxQkEwQ0QsSUFBSSxVQUFVLEVBQUUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtaHlwZXJjbGljay1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgbWFuYWdlciBmcm9tICcuL2F0b20tdGVybmpzLW1hbmFnZXInO1xuaW1wb3J0IHsgb3BlbkZpbGVBbmRHb1RvIH0gZnJvbSAnLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuXG5jbGFzcyBIeXBlcmNsaWNrIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm92aWRlck5hbWUgPSAnYXRvbS10ZXJuanMtaHlwZXJjbGljayc7XG4gICAgdGhpcy53b3JkUmVnRXhwID0gbmV3IFJlZ0V4cCgnKGAoXFxcXFxcXFwufFteYFxcXFxcXFxcXSkqYCl8KFxcJyhcXFxcXFxcXC58W15cXCdcXFxcXFxcXF0pKlxcJyl8KFwiKFxcXFxcXFxcLnxbXlwiXFxcXFxcXFxdKSpcIil8KFthLXpBLVowLTlfJF0rKScsICdnJyk7XG4gIH1cblxuICBnZXRTdWdnZXN0aW9uRm9yV29yZChlZGl0b3IsIHN0cmluZywgcmFuZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICghc3RyaW5nLnRyaW0oKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFtYW5hZ2VyLmNsaWVudCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIH1cblxuICAgICAgbWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hbmFnZXIuY2xpZW50LmdldERlZmluaXRpb24oYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV0sIHJhbmdlKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmZpbGUpIHtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICByYW5nZTogcmFuZ2UsXG4gICAgICAgICAgICAgIGNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIG9wZW5GaWxlQW5kR29UbyhkYXRhLnN0YXJ0LCBkYXRhLmZpbGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiByZXNvbHZlKG51bGwpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBIeXBlcmNsaWNrKCk7XG4iXX0=