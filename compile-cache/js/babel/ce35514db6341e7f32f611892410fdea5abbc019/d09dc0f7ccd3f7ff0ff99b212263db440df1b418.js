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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _underscorePlus = require('underscore-plus');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

'use babel';

var ReferenceView = require('./atom-ternjs-reference-view');

var Reference = (function () {
  function Reference() {
    _classCallCheck(this, Reference);

    this.disposables = [];
    this.references = [];

    this.referenceView = new ReferenceView();
    this.referenceView.initialize(this);

    this.referencePanel = atom.workspace.addBottomPanel({

      item: this.referenceView,
      priority: 0
    });

    this.referencePanel.hide();

    atom.views.getView(this.referencePanel).classList.add('atom-ternjs-reference-panel', 'panel-bottom');

    this.hideHandler = this.hide.bind(this);
    _atomTernjsEvents2['default'].on('reference-hide', this.hideHandler);

    this.registerCommands();
  }

  _createClass(Reference, [{
    key: 'registerCommands',
    value: function registerCommands() {

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:references', this.findReference.bind(this)));
    }
  }, {
    key: 'goToReference',
    value: function goToReference(idx) {

      var ref = this.references.refs[idx];

      if (_servicesNavigation2['default'].set(ref)) {

        (0, _atomTernjsHelper.openFileAndGoTo)(ref.start, ref.file);
      }
    }
  }, {
    key: 'findReference',
    value: function findReference() {
      var _this = this;

      var editor = atom.workspace.getActiveTextEditor();
      var cursor = editor.getLastCursor();

      if (!_atomTernjsManager2['default'].client || !editor || !cursor) {

        return;
      }

      var position = cursor.getBufferPosition();

      _atomTernjsManager2['default'].client.update(editor).then(function (data) {
        _atomTernjsManager2['default'].client.refs(atom.project.relativizePath(editor.getURI())[1], { line: position.row, ch: position.column }).then(function (data) {

          if (!data) {

            atom.notifications.addInfo('No references found.', { dismissable: false });

            return;
          }

          _this.references = data;

          for (var reference of data.refs) {

            reference.file = reference.file.replace(/^.\//, '');
            reference.file = _path2['default'].resolve(atom.project.relativizePath(_atomTernjsManager2['default'].server.projectDir)[0], reference.file);
          }

          data.refs = (0, _underscorePlus.uniq)(data.refs, function (item) {

            return JSON.stringify(item);
          });

          data = _this.gatherMeta(data);
          _this.referenceView.buildItems(data);
          _this.referencePanel.show();
        });
      });
    }
  }, {
    key: 'gatherMeta',
    value: function gatherMeta(data) {

      for (var item of data.refs) {

        var content = _fs2['default'].readFileSync(item.file, 'utf8');
        var buffer = new _atom.TextBuffer({ text: content });

        item.position = buffer.positionForCharacterIndex(item.start);
        item.lineText = buffer.lineForRow(item.position.row);

        buffer.destroy();
      }

      return data;
    }
  }, {
    key: 'hide',
    value: function hide() {

      if (!this.referencePanel || !this.referencePanel.visible) {

        return;
      }

      this.referencePanel.hide();

      (0, _atomTernjsHelper.focusEditor)();
    }
  }, {
    key: 'show',
    value: function show() {

      this.referencePanel.show();
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      this.referenceView && this.referenceView.destroy();
      this.referenceView = null;

      this.referencePanel && this.referencePanel.destroy();
      this.referencePanel = null;
    }
  }]);

  return Reference;
})();

exports['default'] = new Reference();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXJlZmVyZW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2lDQUlvQix1QkFBdUI7Ozs7Z0NBQ3ZCLHNCQUFzQjs7OztrQkFDM0IsSUFBSTs7Ozs4QkFDQSxpQkFBaUI7O29CQUNuQixNQUFNOzs7O29CQUNFLE1BQU07O2dDQUl4QixzQkFBc0I7O2tDQUNOLHVCQUF1Qjs7OztBQWQ5QyxXQUFXLENBQUM7O0FBRVosSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0lBY3hELFNBQVM7QUFFRixXQUZQLFNBQVMsR0FFQzswQkFGVixTQUFTOztBQUlYLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVyQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXBDLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7O0FBRWxELFVBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtBQUN4QixjQUFRLEVBQUUsQ0FBQztLQUNaLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUUzQixRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFckcsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxrQ0FBUSxFQUFFLENBQUMsZ0JBQWdC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R0FBRyxnQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuRCxZQUFNLE1BQU0sR0FBRyxxQkFBZSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDOztBQUVqRCxZQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0QsWUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXJELGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQjs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFRyxnQkFBRzs7QUFFTCxVQUNFLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFDcEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFDNUI7O0FBRUEsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRTNCLDBDQUFhLENBQUM7S0FDZjs7O1dBRUcsZ0JBQUc7O0FBRUwsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUM1Qjs7O1dBRU0sbUJBQUc7O0FBRVIsVUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25ELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDOztBQUUxQixVQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckQsVUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7S0FDNUI7OztTQWxJRyxTQUFTOzs7cUJBcUlBLElBQUksU0FBUyxFQUFFIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXJlZmVyZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBSZWZlcmVuY2VWaWV3ID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1yZWZlcmVuY2UtdmlldycpO1xuXG5pbXBvcnQgbWFuYWdlciBmcm9tICcuL2F0b20tdGVybmpzLW1hbmFnZXInO1xuaW1wb3J0IGVtaXR0ZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1ldmVudHMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7dW5pcX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIG9wZW5GaWxlQW5kR29UbyxcbiAgZm9jdXNFZGl0b3Jcbn0gZnJvbSAnLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuaW1wb3J0IG5hdmlnYXRpb24gZnJvbSAnLi9zZXJ2aWNlcy9uYXZpZ2F0aW9uJztcblxuY2xhc3MgUmVmZXJlbmNlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcbiAgICB0aGlzLnJlZmVyZW5jZXMgPSBbXTtcblxuICAgIHRoaXMucmVmZXJlbmNlVmlldyA9IG5ldyBSZWZlcmVuY2VWaWV3KCk7XG4gICAgdGhpcy5yZWZlcmVuY2VWaWV3LmluaXRpYWxpemUodGhpcyk7XG5cbiAgICB0aGlzLnJlZmVyZW5jZVBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoe1xuXG4gICAgICBpdGVtOiB0aGlzLnJlZmVyZW5jZVZpZXcsXG4gICAgICBwcmlvcml0eTogMFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWZlcmVuY2VQYW5lbC5oaWRlKCk7XG5cbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5yZWZlcmVuY2VQYW5lbCkuY2xhc3NMaXN0LmFkZCgnYXRvbS10ZXJuanMtcmVmZXJlbmNlLXBhbmVsJywgJ3BhbmVsLWJvdHRvbScpO1xuXG4gICAgdGhpcy5oaWRlSGFuZGxlciA9IHRoaXMuaGlkZS5iaW5kKHRoaXMpO1xuICAgIGVtaXR0ZXIub24oJ3JlZmVyZW5jZS1oaWRlJywgdGhpcy5oaWRlSGFuZGxlcik7XG5cbiAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6cmVmZXJlbmNlcycsIHRoaXMuZmluZFJlZmVyZW5jZS5iaW5kKHRoaXMpKSk7XG4gIH1cblxuICBnb1RvUmVmZXJlbmNlKGlkeCkge1xuXG4gICAgY29uc3QgcmVmID0gdGhpcy5yZWZlcmVuY2VzLnJlZnNbaWR4XTtcblxuICAgIGlmIChuYXZpZ2F0aW9uLnNldChyZWYpKSB7XG5cbiAgICAgIG9wZW5GaWxlQW5kR29UbyhyZWYuc3RhcnQsIHJlZi5maWxlKTtcbiAgICB9XG4gIH1cblxuICBmaW5kUmVmZXJlbmNlKCkge1xuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG5cbiAgICBpZiAoXG4gICAgICAhbWFuYWdlci5jbGllbnQgfHxcbiAgICAgICFlZGl0b3IgfHxcbiAgICAgICFjdXJzb3JcbiAgICApIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICBtYW5hZ2VyLmNsaWVudC51cGRhdGUoZWRpdG9yKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICBtYW5hZ2VyLmNsaWVudC5yZWZzKGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdLCB7bGluZTogcG9zaXRpb24ucm93LCBjaDogcG9zaXRpb24uY29sdW1ufSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIGlmICghZGF0YSkge1xuXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ05vIHJlZmVyZW5jZXMgZm91bmQuJywgeyBkaXNtaXNzYWJsZTogZmFsc2UgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZmVyZW5jZXMgPSBkYXRhO1xuXG4gICAgICAgIGZvciAobGV0IHJlZmVyZW5jZSBvZiBkYXRhLnJlZnMpIHtcblxuICAgICAgICAgIHJlZmVyZW5jZS5maWxlID0gcmVmZXJlbmNlLmZpbGUucmVwbGFjZSgvXi5cXC8vLCAnJyk7XG4gICAgICAgICAgcmVmZXJlbmNlLmZpbGUgPSBwYXRoLnJlc29sdmUoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKG1hbmFnZXIuc2VydmVyLnByb2plY3REaXIpWzBdLCByZWZlcmVuY2UuZmlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLnJlZnMgPSB1bmlxKGRhdGEucmVmcywgKGl0ZW0pID0+IHtcblxuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShpdGVtKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGF0YSA9IHRoaXMuZ2F0aGVyTWV0YShkYXRhKTtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2VWaWV3LmJ1aWxkSXRlbXMoZGF0YSk7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlUGFuZWwuc2hvdygpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnYXRoZXJNZXRhKGRhdGEpIHtcblxuICAgIGZvciAobGV0IGl0ZW0gb2YgZGF0YS5yZWZzKSB7XG5cbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaXRlbS5maWxlLCAndXRmOCcpO1xuICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFRleHRCdWZmZXIoeyB0ZXh0OiBjb250ZW50IH0pO1xuXG4gICAgICBpdGVtLnBvc2l0aW9uID0gYnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoaXRlbS5zdGFydCk7XG4gICAgICBpdGVtLmxpbmVUZXh0ID0gYnVmZmVyLmxpbmVGb3JSb3coaXRlbS5wb3NpdGlvbi5yb3cpO1xuXG4gICAgICBidWZmZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgaGlkZSgpIHtcblxuICAgIGlmIChcbiAgICAgICF0aGlzLnJlZmVyZW5jZVBhbmVsIHx8XG4gICAgICAhdGhpcy5yZWZlcmVuY2VQYW5lbC52aXNpYmxlXG4gICAgKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVBhbmVsLmhpZGUoKTtcblxuICAgIGZvY3VzRWRpdG9yKCk7XG4gIH1cblxuICBzaG93KCkge1xuXG4gICAgdGhpcy5yZWZlcmVuY2VQYW5lbC5zaG93KCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgdGhpcy5yZWZlcmVuY2VWaWV3ICYmIHRoaXMucmVmZXJlbmNlVmlldy5kZXN0cm95KCk7XG4gICAgdGhpcy5yZWZlcmVuY2VWaWV3ID0gbnVsbDtcblxuICAgIHRoaXMucmVmZXJlbmNlUGFuZWwgJiYgdGhpcy5yZWZlcmVuY2VQYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5yZWZlcmVuY2VQYW5lbCA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFJlZmVyZW5jZSgpO1xuIl19