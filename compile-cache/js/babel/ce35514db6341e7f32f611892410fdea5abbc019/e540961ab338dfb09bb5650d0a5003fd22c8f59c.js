Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atom = require('atom');

var _atomTernjsHelper = require('./atom-ternjs-helper');

'use babel';

var TypeView = require('./atom-ternjs-type-view');
var TOLERANCE = 20;

var Type = (function () {
  function Type() {
    _classCallCheck(this, Type);

    this.view = undefined;
    this.overlayDecoration = undefined;

    this.view = new TypeView();
    this.view.initialize(this);

    atom.views.getView(atom.workspace).appendChild(this.view);

    this.destroyOverlayHandler = this.destroyOverlay.bind(this);

    _atomTernjsEvents2['default'].on('type-destroy-overlay', this.destroyOverlayHandler);
  }

  _createClass(Type, [{
    key: 'setPosition',
    value: function setPosition() {

      this.destroyOverlay();

      var editor = atom.workspace.getActiveTextEditor();

      if (!editor) {

        return;
      }

      var marker = editor.getLastCursor && editor.getLastCursor().getMarker();

      if (!marker) {

        return;
      }

      this.overlayDecoration = editor.decorateMarker(marker, {

        type: 'overlay',
        item: this.view,
        'class': 'atom-ternjs-type',
        position: 'tale',
        invalidate: 'touch'
      });
    }
  }, {
    key: 'queryType',
    value: function queryType(editor, cursor) {
      var _this = this;

      this.destroyOverlay();

      if (!_atomTernjsPackageConfig2['default'].options.inlineFnCompletion || !cursor || cursor.destroyed || !_atomTernjsManager2['default'].client) {

        return;
      }

      var scopeDescriptor = cursor.getScopeDescriptor();

      if (scopeDescriptor.scopes.join().match(/comment/)) {

        return;
      }

      var rowStart = 0;
      var rangeBefore = false;
      var tmp = false;
      var may = 0;
      var may2 = 0;
      var skipCounter = 0;
      var skipCounter2 = 0;
      var paramPosition = 0;
      var position = cursor.getBufferPosition();
      var buffer = editor.getBuffer();

      if (position.row - TOLERANCE < 0) {

        rowStart = 0;
      } else {

        rowStart = position.row - TOLERANCE;
      }

      buffer.backwardsScanInRange(/\]|\[|\(|\)|\,|\{|\}/g, new _atom.Range([rowStart, 0], [position.row, position.column]), function (obj) {

        // return early if we are inside a string
        if (editor.scopeDescriptorForBufferPosition(obj.range.start).scopes.join().match(/string/)) {

          return;
        }

        if (obj.matchText === '}') {

          may++;
          return;
        }

        if (obj.matchText === ']') {

          if (!tmp) {

            skipCounter2++;
          }

          may2++;
          return;
        }

        if (obj.matchText === '{') {

          if (!may) {

            rangeBefore = false;
            obj.stop();

            return;
          }

          may--;
          return;
        }

        if (obj.matchText === '[') {

          if (skipCounter2) {

            skipCounter2--;
          }

          if (!may2) {

            rangeBefore = false;
            obj.stop();
            return;
          }

          may2--;
          return;
        }

        if (obj.matchText === ')' && !tmp) {

          skipCounter++;
          return;
        }

        if (obj.matchText === ',' && !skipCounter && !skipCounter2 && !may && !may2) {

          paramPosition++;
          return;
        }

        if (obj.matchText === ',') {

          return;
        }

        if (obj.matchText === '(' && skipCounter) {

          skipCounter--;
          return;
        }

        if (skipCounter || skipCounter2) {

          return;
        }

        if (obj.matchText === '(' && !tmp) {

          rangeBefore = obj.range;
          obj.stop();

          return;
        }

        tmp = obj.matchText;
      });

      if (!rangeBefore) {

        return;
      }

      _atomTernjsManager2['default'].client.update(editor).then(function (data) {

        _atomTernjsManager2['default'].client.type(editor, rangeBefore.start).then(function (data) {

          if (!data || data.type === '?' || !data.exprName) {

            return;
          }

          var type = (0, _atomTernjsHelper.prepareType)(data);
          var params = (0, _atomTernjsHelper.extractParams)(type);
          (0, _atomTernjsHelper.formatType)(data);

          if (params && params[paramPosition]) {

            var offsetFix = paramPosition > 0 ? ' ' : '';
            data.type = data.type.replace(params[paramPosition], offsetFix + '<span class="text-info">' + params[paramPosition] + '</span>');
          }

          if (data.doc && _atomTernjsPackageConfig2['default'].options.inlineFnCompletionDocumentation) {

            data.doc = data.doc && data.doc.replace(/(?:\r\n|\r|\n)/g, '<br />');
            data.doc = (0, _atomTernjsHelper.prepareInlineDocs)(data.doc);
          }

          _this.view.setData(data);

          _this.setPosition();
        });
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      _atomTernjsEvents2['default'].off('destroy-type-overlay', this.destroyOverlayHandler);

      this.destroyOverlay();

      if (this.view) {

        this.view.destroy();
        this.view = null;
      }
    }
  }, {
    key: 'destroyOverlay',
    value: function destroyOverlay() {

      if (this.overlayDecoration) {

        this.overlayDecoration.destroy();
      }

      this.overlayDecoration = null;
    }
  }]);

  return Type;
})();

exports['default'] = new Type();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXR5cGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FLb0IsdUJBQXVCOzs7O3VDQUNqQiw4QkFBOEI7Ozs7Z0NBQ3BDLHNCQUFzQjs7OztvQkFDdEIsTUFBTTs7Z0NBTW5CLHNCQUFzQjs7QUFkN0IsV0FBVyxDQUFDOztBQUVaLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3BELElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7SUFhZixJQUFJO0FBRUcsV0FGUCxJQUFJLEdBRU07MEJBRlYsSUFBSTs7QUFJTixRQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUN0QixRQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDOztBQUVuQyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDM0IsUUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNCLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUxRCxRQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTVELGtDQUFRLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztHQUNoRTs7ZUFmRyxJQUFJOztXQWlCRyx1QkFBRzs7QUFFWixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXRCLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFcEQsVUFBSSxDQUFDLE1BQU0sRUFBRTs7QUFFWCxlQUFP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eEIsZ0JBQUssV0FBVyxFQUFFLENBQUM7U0FDcEIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHOztBQUVSLG9DQUFRLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFaEUsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV0QixVQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7O0FBRWIsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQixZQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztPQUNsQjtLQUNGOzs7V0FFYSwwQkFBRzs7QUFFZixVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs7QUFFMUIsWUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2xDOztBQUVELFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7S0FDL0I7OztTQW5QRyxJQUFJOzs7cUJBc1BLLElBQUksSUFBSSxFQUFFIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXR5cGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgVHlwZVZpZXcgPSByZXF1aXJlKCcuL2F0b20tdGVybmpzLXR5cGUtdmlldycpO1xuY29uc3QgVE9MRVJBTkNFID0gMjA7XG5cbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCBlbWl0dGVyIGZyb20gJy4vYXRvbS10ZXJuanMtZXZlbnRzJztcbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgcHJlcGFyZVR5cGUsXG4gIHByZXBhcmVJbmxpbmVEb2NzLFxuICBleHRyYWN0UGFyYW1zLFxuICBmb3JtYXRUeXBlXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcblxuY2xhc3MgVHlwZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB0aGlzLnZpZXcgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5vdmVybGF5RGVjb3JhdGlvbiA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMudmlldyA9IG5ldyBUeXBlVmlldygpO1xuICAgIHRoaXMudmlldy5pbml0aWFsaXplKHRoaXMpO1xuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xuXG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheUhhbmRsZXIgPSB0aGlzLmRlc3Ryb3lPdmVybGF5LmJpbmQodGhpcyk7XG5cbiAgICBlbWl0dGVyLm9uKCd0eXBlLWRlc3Ryb3ktb3ZlcmxheScsIHRoaXMuZGVzdHJveU92ZXJsYXlIYW5kbGVyKTtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKCkge1xuXG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheSgpO1xuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgaWYgKCFlZGl0b3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yICYmIGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0TWFya2VyKCk7XG5cbiAgICBpZiAoIW1hcmtlcikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vdmVybGF5RGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcblxuICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgaXRlbTogdGhpcy52aWV3LFxuICAgICAgY2xhc3M6ICdhdG9tLXRlcm5qcy10eXBlJyxcbiAgICAgIHBvc2l0aW9uOiAndGFsZScsXG4gICAgICBpbnZhbGlkYXRlOiAndG91Y2gnXG4gICAgfSk7XG4gIH1cblxuICBxdWVyeVR5cGUoZWRpdG9yLCBjdXJzb3IpIHtcblxuICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIGlmIChcbiAgICAgICFwYWNrYWdlQ29uZmlnLm9wdGlvbnMuaW5saW5lRm5Db21wbGV0aW9uIHx8XG4gICAgICAhY3Vyc29yIHx8XG4gICAgICBjdXJzb3IuZGVzdHJveWVkIHx8XG4gICAgICAhbWFuYWdlci5jbGllbnRcbiAgICApIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlRGVzY3JpcHRvciA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKTtcblxuICAgIGlmIChzY29wZURlc2NyaXB0b3Iuc2NvcGVzLmpvaW4oKS5tYXRjaCgvY29tbWVudC8pKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcm93U3RhcnQgPSAwO1xuICAgIGxldCByYW5nZUJlZm9yZSA9IGZhbHNlO1xuICAgIGxldCB0bXAgPSBmYWxzZTtcbiAgICBsZXQgbWF5ID0gMDtcbiAgICBsZXQgbWF5MiA9IDA7XG4gICAgbGV0IHNraXBDb3VudGVyID0gMDtcbiAgICBsZXQgc2tpcENvdW50ZXIyID0gMDtcbiAgICBsZXQgcGFyYW1Qb3NpdGlvbiA9IDA7XG4gICAgY29uc3QgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKTtcbiAgICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG5cbiAgICBpZiAocG9zaXRpb24ucm93IC0gVE9MRVJBTkNFIDwgMCkge1xuXG4gICAgICByb3dTdGFydCA9IDA7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICByb3dTdGFydCA9IHBvc2l0aW9uLnJvdyAtIFRPTEVSQU5DRTtcbiAgICB9XG5cbiAgICBidWZmZXIuYmFja3dhcmRzU2NhbkluUmFuZ2UoL1xcXXxcXFt8XFwofFxcKXxcXCx8XFx7fFxcfS9nLCBuZXcgUmFuZ2UoW3Jvd1N0YXJ0LCAwXSwgW3Bvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uXSksIChvYmopID0+IHtcblxuICAgICAgLy8gcmV0dXJuIGVhcmx5IGlmIHdlIGFyZSBpbnNpZGUgYSBzdHJpbmdcbiAgICAgIGlmIChlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ob2JqLnJhbmdlLnN0YXJ0KS5zY29wZXMuam9pbigpLm1hdGNoKC9zdHJpbmcvKSkge1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICd9Jykge1xuXG4gICAgICAgIG1heSsrO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmoubWF0Y2hUZXh0ID09PSAnXScpIHtcblxuICAgICAgICBpZiAoIXRtcCkge1xuXG4gICAgICAgICAgc2tpcENvdW50ZXIyKys7XG4gICAgICAgIH1cblxuICAgICAgICBtYXkyKys7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICd7Jykge1xuXG4gICAgICAgIGlmICghbWF5KSB7XG5cbiAgICAgICAgICByYW5nZUJlZm9yZSA9IGZhbHNlO1xuICAgICAgICAgIG9iai5zdG9wKCk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtYXktLTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJ1snKSB7XG5cbiAgICAgICAgaWYgKHNraXBDb3VudGVyMikge1xuXG4gICAgICAgICAgc2tpcENvdW50ZXIyLS07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1heTIpIHtcblxuICAgICAgICAgIHJhbmdlQmVmb3JlID0gZmFsc2U7XG4gICAgICAgICAgb2JqLnN0b3AoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtYXkyLS07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICcpJyAmJiAhdG1wKSB7XG5cbiAgICAgICAgc2tpcENvdW50ZXIrKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJywnICYmICFza2lwQ291bnRlciAmJiAhc2tpcENvdW50ZXIyICYmICFtYXkgJiYgIW1heTIpIHtcblxuICAgICAgICBwYXJhbVBvc2l0aW9uKys7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICcsJykge1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICcoJyAmJiBza2lwQ291bnRlcikge1xuXG4gICAgICAgIHNraXBDb3VudGVyLS07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNraXBDb3VudGVyIHx8IHNraXBDb3VudGVyMikge1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICcoJyAmJiAhdG1wKSB7XG5cbiAgICAgICAgcmFuZ2VCZWZvcmUgPSBvYmoucmFuZ2U7XG4gICAgICAgIG9iai5zdG9wKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0bXAgPSBvYmoubWF0Y2hUZXh0O1xuICAgIH0pO1xuXG4gICAgaWYgKCFyYW5nZUJlZm9yZSkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICBtYW5hZ2VyLmNsaWVudC50eXBlKGVkaXRvciwgcmFuZ2VCZWZvcmUuc3RhcnQpLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgICBpZiAoIWRhdGEgfHwgZGF0YS50eXBlID09PSAnPycgfHwgIWRhdGEuZXhwck5hbWUpIHtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBwcmVwYXJlVHlwZShkYXRhKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gZXh0cmFjdFBhcmFtcyh0eXBlKTtcbiAgICAgICAgZm9ybWF0VHlwZShkYXRhKTtcblxuICAgICAgICBpZiAocGFyYW1zICYmIHBhcmFtc1twYXJhbVBvc2l0aW9uXSkge1xuXG4gICAgICAgICAgY29uc3Qgb2Zmc2V0Rml4ID0gcGFyYW1Qb3NpdGlvbiA+IDAgPyAnICcgOiAnJztcbiAgICAgICAgICBkYXRhLnR5cGUgPSBkYXRhLnR5cGUucmVwbGFjZShwYXJhbXNbcGFyYW1Qb3NpdGlvbl0sIGAke29mZnNldEZpeH08c3BhbiBjbGFzcz1cInRleHQtaW5mb1wiPiR7cGFyYW1zW3BhcmFtUG9zaXRpb25dfTwvc3Bhbj5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkYXRhLmRvYyAmJlxuICAgICAgICAgIHBhY2thZ2VDb25maWcub3B0aW9ucy5pbmxpbmVGbkNvbXBsZXRpb25Eb2N1bWVudGF0aW9uXG4gICAgICAgICkge1xuXG4gICAgICAgICAgZGF0YS5kb2MgPSBkYXRhLmRvYyAmJiBkYXRhLmRvYy5yZXBsYWNlKC8oPzpcXHJcXG58XFxyfFxcbikvZywgJzxiciAvPicpO1xuICAgICAgICAgIGRhdGEuZG9jID0gcHJlcGFyZUlubGluZURvY3MoZGF0YS5kb2MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aWV3LnNldERhdGEoZGF0YSk7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgZW1pdHRlci5vZmYoJ2Rlc3Ryb3ktdHlwZS1vdmVybGF5JywgdGhpcy5kZXN0cm95T3ZlcmxheUhhbmRsZXIpO1xuXG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheSgpO1xuXG4gICAgaWYgKHRoaXMudmlldykge1xuXG4gICAgICB0aGlzLnZpZXcuZGVzdHJveSgpO1xuICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95T3ZlcmxheSgpIHtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlEZWNvcmF0aW9uKSB7XG5cbiAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24uZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBUeXBlKCk7XG4iXX0=