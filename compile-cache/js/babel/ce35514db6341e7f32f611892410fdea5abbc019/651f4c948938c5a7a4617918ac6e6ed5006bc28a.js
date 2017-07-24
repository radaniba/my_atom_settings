Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _atomTernjsHelper2 = require('././atom-ternjs-helper');

var _servicesDebug = require('./services/debug');

var _servicesDebug2 = _interopRequireDefault(_servicesDebug);

'use babel';

var DocumentationView = require('./atom-ternjs-documentation-view');

var Documentation = (function () {
  function Documentation() {
    _classCallCheck(this, Documentation);

    this.disposables = [];

    this.view = new DocumentationView();
    this.view.initialize(this);

    atom.views.getView(atom.workspace).appendChild(this.view);

    this.destroyDocumenationHandler = this.destroyOverlay.bind(this);
    _atomTernjsEvents2['default'].on('documentation-destroy-overlay', this.destroyDocumenationHandler);

    this.registerCommands();
  }

  _createClass(Documentation, [{
    key: 'registerCommands',
    value: function registerCommands() {

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:documentation', this.request.bind(this)));
    }
  }, {
    key: 'request',
    value: function request() {
      var _this = this;

      var editor = atom.workspace.getActiveTextEditor();

      if (!editor || !_atomTernjsManager2['default'].client) {

        return;
      }

      var cursor = editor.getLastCursor();
      var position = cursor.getBufferPosition();

      _atomTernjsManager2['default'].client.update(editor).then(function (data) {

        _atomTernjsManager2['default'].client.documentation(atom.project.relativizePath(editor.getURI())[1], {

          line: position.row,
          ch: position.column

        }).then(function (data) {

          if (!data) {

            return;
          }

          _this.view.setData({

            doc: (0, _atomTernjsHelper2.replaceTags)(data.doc),
            origin: data.origin,
            type: (0, _atomTernjsHelper2.formatType)(data),
            url: data.url || ''
          });

          _this.show();
        });
      })['catch'](function (err) {

        err && _servicesDebug2['default'].handleReject(err.type, err.message);
      });
    }
  }, {
    key: 'show',
    value: function show() {

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
        'class': 'atom-ternjs-documentation',
        position: 'tale',
        invalidate: 'touch'
      });
    }
  }, {
    key: 'destroyOverlay',
    value: function destroyOverlay() {

      if (this.overlayDecoration) {

        this.overlayDecoration.destroy();
      }

      this.overlayDecoration = null;
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);

      this.destroyOverlay();

      if (this.view) {

        this.view.destroy();
        this.view = undefined;
      }
    }
  }]);

  return Documentation;
})();

exports['default'] = new Documentation();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWRvY3VtZW50YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FJb0IsdUJBQXVCOzs7O2dDQUN2QixzQkFBc0I7Ozs7Z0NBQ2pCLHNCQUFzQjs7aUNBSXhDLHdCQUF3Qjs7NkJBQ2Isa0JBQWtCOzs7O0FBWHBDLFdBQVcsQ0FBQzs7QUFFWixJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztJQVdoRSxhQUFhO0FBRU4sV0FGUCxhQUFhLEdBRUg7MEJBRlYsYUFBYTs7QUFJZixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNCLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUxRCxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakUsa0NBQVEsRUFBRSxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztBQUU3RSxRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUN6Qjs7ZUFmRyxhQUFhOztXQWlCRCw0QkFBRzs7QUFFakIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tB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bS10ZXJuanMtZG9jdW1lbnRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBEb2N1bWVudGF0aW9uVmlldyA9IHJlcXVpcmUoJy4vYXRvbS10ZXJuanMtZG9jdW1lbnRhdGlvbi12aWV3Jyk7XG5cbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQgZW1pdHRlciBmcm9tICcuL2F0b20tdGVybmpzLWV2ZW50cyc7XG5pbXBvcnQge2Rpc3Bvc2VBbGx9IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCB7XG4gIHJlcGxhY2VUYWdzLFxuICBmb3JtYXRUeXBlXG59IGZyb20gJy4vLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4vc2VydmljZXMvZGVidWcnO1xuXG5jbGFzcyBEb2N1bWVudGF0aW9uIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcblxuICAgIHRoaXMudmlldyA9IG5ldyBEb2N1bWVudGF0aW9uVmlldygpO1xuICAgIHRoaXMudmlldy5pbml0aWFsaXplKHRoaXMpO1xuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xuXG4gICAgdGhpcy5kZXN0cm95RG9jdW1lbmF0aW9uSGFuZGxlciA9IHRoaXMuZGVzdHJveU92ZXJsYXkuYmluZCh0aGlzKTtcbiAgICBlbWl0dGVyLm9uKCdkb2N1bWVudGF0aW9uLWRlc3Ryb3ktb3ZlcmxheScsIHRoaXMuZGVzdHJveURvY3VtZW5hdGlvbkhhbmRsZXIpO1xuXG4gICAgdGhpcy5yZWdpc3RlckNvbW1hbmRzKCk7XG4gIH1cblxuICByZWdpc3RlckNvbW1hbmRzKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmRvY3VtZW50YXRpb24nLCB0aGlzLnJlcXVlc3QuYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgcmVxdWVzdCgpIHtcblxuICAgIGxldCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG5cbiAgICBpZiAoXG4gICAgICAhZWRpdG9yIHx8XG4gICAgICAhbWFuYWdlci5jbGllbnRcbiAgICApIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgIGxldCBwb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpO1xuXG4gICAgbWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICBtYW5hZ2VyLmNsaWVudC5kb2N1bWVudGF0aW9uKGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdLCB7XG5cbiAgICAgICAgbGluZTogcG9zaXRpb24ucm93LFxuICAgICAgICBjaDogcG9zaXRpb24uY29sdW1uXG5cbiAgICAgIH0pLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgICBpZiAoIWRhdGEpIHtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlldy5zZXREYXRhKHtcblxuICAgICAgICAgIGRvYzogcmVwbGFjZVRhZ3MoZGF0YS5kb2MpLFxuICAgICAgICAgIG9yaWdpbjogZGF0YS5vcmlnaW4sXG4gICAgICAgICAgdHlwZTogZm9ybWF0VHlwZShkYXRhKSxcbiAgICAgICAgICB1cmw6IGRhdGEudXJsIHx8ICcnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuXG4gICAgICBlcnIgJiYgZGVidWcuaGFuZGxlUmVqZWN0KGVyci50eXBlLCBlcnIubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBzaG93KCkge1xuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgaWYgKCFlZGl0b3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yICYmIGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0TWFya2VyKCk7XG5cbiAgICBpZiAoIW1hcmtlcikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vdmVybGF5RGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcblxuICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgaXRlbTogdGhpcy52aWV3LFxuICAgICAgY2xhc3M6ICdhdG9tLXRlcm5qcy1kb2N1bWVudGF0aW9uJyxcbiAgICAgIHBvc2l0aW9uOiAndGFsZScsXG4gICAgICBpbnZhbGlkYXRlOiAndG91Y2gnXG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95T3ZlcmxheSgpIHtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlEZWNvcmF0aW9uKSB7XG5cbiAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24uZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSBudWxsO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGRpc3Bvc2VBbGwodGhpcy5kaXNwb3NhYmxlcyk7XG5cbiAgICB0aGlzLmRlc3Ryb3lPdmVybGF5KCk7XG5cbiAgICBpZiAodGhpcy52aWV3KSB7XG5cbiAgICAgIHRoaXMudmlldy5kZXN0cm95KCk7XG4gICAgICB0aGlzLnZpZXcgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBEb2N1bWVudGF0aW9uKCk7XG4iXX0=