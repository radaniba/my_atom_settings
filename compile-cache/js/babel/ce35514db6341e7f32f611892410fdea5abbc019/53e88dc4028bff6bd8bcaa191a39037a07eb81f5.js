Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomTernjsHelper = require('./atom-ternjs-helper');

'use babel';

var RenameView = require('./atom-ternjs-rename-view');

var Rename = (function () {
  function Rename() {
    _classCallCheck(this, Rename);

    this.disposables = [];

    this.renameView = new RenameView();
    this.renameView.initialize(this);

    this.renamePanel = atom.workspace.addBottomPanel({

      item: this.renameView,
      priority: 0
    });

    this.renamePanel.hide();

    atom.views.getView(this.renamePanel).classList.add('atom-ternjs-rename-panel', 'panel-bottom');

    this.hideHandler = this.hide.bind(this);
    _atomTernjsEvents2['default'].on('rename-hide', this.hideHandler);

    this.registerCommands();
  }

  _createClass(Rename, [{
    key: 'registerCommands',
    value: function registerCommands() {

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:rename', this.show.bind(this)));
    }
  }, {
    key: 'hide',
    value: function hide() {

      if (!this.renamePanel) {

        return;
      }

      this.renamePanel.hide();

      (0, _atomTernjsHelper.focusEditor)();
    }
  }, {
    key: 'show',
    value: function show() {

      var codeEditor = atom.workspace.getActiveTextEditor();
      var currentNameRange = codeEditor.getLastCursor().getCurrentWordBufferRange({ includeNonWordCharacters: false });
      var currentName = codeEditor.getTextInBufferRange(currentNameRange);

      this.renameView.nameEditor.getModel().setText(currentName);
      this.renameView.nameEditor.getModel().selectAll();

      this.renamePanel.show();
      this.renameView.nameEditor.focus();
    }
  }, {
    key: 'updateAllAndRename',
    value: function updateAllAndRename(newName) {
      var _this = this;

      if (!_atomTernjsManager2['default'].client) {

        this.hide();

        return;
      }

      var idx = 0;
      var editors = atom.workspace.getTextEditors();

      for (var editor of editors) {

        if (!_atomTernjsManager2['default'].isValidEditor(editor) || atom.project.relativizePath(editor.getURI())[0] !== _atomTernjsManager2['default'].client.projectDir) {

          idx++;

          continue;
        }

        _atomTernjsManager2['default'].client.update(editor).then(function (data) {

          if (++idx === editors.length) {

            var activeEditor = atom.workspace.getActiveTextEditor();
            var cursor = activeEditor.getLastCursor();

            if (!cursor) {

              return;
            }

            var position = cursor.getBufferPosition();

            _atomTernjsManager2['default'].client.rename(atom.project.relativizePath(activeEditor.getURI())[1], { line: position.row, ch: position.column }, newName).then(function (data) {

              if (!data) {

                return;
              }

              _this.rename(data);
            })['catch'](function (error) {

              atom.notifications.addError(error, {

                dismissable: false
              });
            });
          }
        });
      }
    }
  }, {
    key: 'rename',
    value: function rename(data) {

      var dir = _atomTernjsManager2['default'].server.projectDir;

      if (!dir) {

        return;
      }

      var translateColumnBy = data.changes[0].text.length - data.name.length;

      for (var change of data.changes) {

        change.file = change.file.replace(/^.\//, '');
        change.file = _path2['default'].resolve(atom.project.relativizePath(dir)[0], change.file);
      }

      var changes = (0, _underscorePlus.uniq)(data.changes, function (item) {

        return JSON.stringify(item);
      });

      var currentFile = false;
      var arr = [];
      var idx = 0;

      for (var change of changes) {

        if (currentFile !== change.file) {

          currentFile = change.file;
          idx = arr.push([]) - 1;
        }

        arr[idx].push(change);
      }

      for (var arrObj of arr) {

        this.openFilesAndRename(arrObj, translateColumnBy);
      }

      this.hide();
    }
  }, {
    key: 'openFilesAndRename',
    value: function openFilesAndRename(obj, translateColumnBy) {
      var _this2 = this;

      atom.workspace.open(obj[0].file).then(function (textEditor) {

        var currentColumnOffset = 0;
        var idx = 0;
        var buffer = textEditor.getBuffer();
        var checkpoint = buffer.createCheckpoint();

        for (var change of obj) {

          _this2.setTextInRange(buffer, change, currentColumnOffset, idx === obj.length - 1, textEditor);
          currentColumnOffset += translateColumnBy;

          idx++;
        }

        buffer.groupChangesSinceCheckpoint(checkpoint);
      });
    }
  }, {
    key: 'setTextInRange',
    value: function setTextInRange(buffer, change, offset, moveCursor, textEditor) {

      change.start += offset;
      change.end += offset;
      var position = buffer.positionForCharacterIndex(change.start);
      length = change.end - change.start;
      var end = position.translate(new _atom.Point(0, length));
      var range = new _atom.Range(position, end);
      buffer.setTextInRange(range, change.text);

      if (!moveCursor) {

        return;
      }

      var cursor = textEditor.getLastCursor();

      cursor && cursor.setBufferPosition(position);
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);

      this.renameView && this.renameView.destroy();
      this.renameView = null;

      this.renamePanel && this.renamePanel.destroy();
      this.renamePanel = null;
    }
  }]);

  return Rename;
})();

exports['default'] = new Rename();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXJlbmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2dDQUlvQixzQkFBc0I7Ozs7aUNBQ3RCLHVCQUF1Qjs7OztvQkFJcEMsTUFBTTs7OEJBQ00saUJBQWlCOztvQkFDbkIsTUFBTTs7OztnQ0FJaEIsc0JBQXNCOztBQWY3QixXQUFXLENBQUM7O0FBRVosSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0lBZWxELE1BQU07QUFFQyxXQUZQLE1BQU0sR0FFSTswQkFGVixNQUFNOztBQUlSLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDbkMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7O0FBRS9DLFVBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtBQUNyQixjQUFRLEVBQUUsQ0FBQztLQUNaLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUV4QixRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFL0YsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxrQ0FBUSxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFNUMsUUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDekI7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SUFBSSxNQUFNLEVBQUUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtcmVuYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IFJlbmFtZVZpZXcgPSByZXF1aXJlKCcuL2F0b20tdGVybmpzLXJlbmFtZS12aWV3Jyk7XG5cbmltcG9ydCBlbWl0dGVyIGZyb20gJy4vYXRvbS10ZXJuanMtZXZlbnRzJztcbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQge1xuICBQb2ludCxcbiAgUmFuZ2Vcbn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3VuaXF9IGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIGRpc3Bvc2VBbGwsXG4gIGZvY3VzRWRpdG9yXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcblxuY2xhc3MgUmVuYW1lIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcblxuICAgIHRoaXMucmVuYW1lVmlldyA9IG5ldyBSZW5hbWVWaWV3KCk7XG4gICAgdGhpcy5yZW5hbWVWaWV3LmluaXRpYWxpemUodGhpcyk7XG5cbiAgICB0aGlzLnJlbmFtZVBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoe1xuXG4gICAgICBpdGVtOiB0aGlzLnJlbmFtZVZpZXcsXG4gICAgICBwcmlvcml0eTogMFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5hbWVQYW5lbC5oaWRlKCk7XG5cbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5yZW5hbWVQYW5lbCkuY2xhc3NMaXN0LmFkZCgnYXRvbS10ZXJuanMtcmVuYW1lLXBhbmVsJywgJ3BhbmVsLWJvdHRvbScpO1xuXG4gICAgdGhpcy5oaWRlSGFuZGxlciA9IHRoaXMuaGlkZS5iaW5kKHRoaXMpO1xuICAgIGVtaXR0ZXIub24oJ3JlbmFtZS1oaWRlJywgdGhpcy5oaWRlSGFuZGxlcik7XG5cbiAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6cmVuYW1lJywgdGhpcy5zaG93LmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG5cbiAgICBpZiAoIXRoaXMucmVuYW1lUGFuZWwpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVuYW1lUGFuZWwuaGlkZSgpO1xuXG4gICAgZm9jdXNFZGl0b3IoKTtcbiAgfVxuXG4gIHNob3coKSB7XG5cbiAgICBjb25zdCBjb2RlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGN1cnJlbnROYW1lUmFuZ2UgPSBjb2RlRWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKHtpbmNsdWRlTm9uV29yZENoYXJhY3RlcnM6IGZhbHNlfSk7XG4gICAgY29uc3QgY3VycmVudE5hbWUgPSBjb2RlRWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKGN1cnJlbnROYW1lUmFuZ2UpO1xuXG4gICAgdGhpcy5yZW5hbWVWaWV3Lm5hbWVFZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0KGN1cnJlbnROYW1lKTtcbiAgICB0aGlzLnJlbmFtZVZpZXcubmFtZUVkaXRvci5nZXRNb2RlbCgpLnNlbGVjdEFsbCgpO1xuXG4gICAgdGhpcy5yZW5hbWVQYW5lbC5zaG93KCk7XG4gICAgdGhpcy5yZW5hbWVWaWV3Lm5hbWVFZGl0b3IuZm9jdXMoKTtcbiAgfVxuXG4gIHVwZGF0ZUFsbEFuZFJlbmFtZShuZXdOYW1lKSB7XG5cbiAgICBpZiAoIW1hbmFnZXIuY2xpZW50KSB7XG5cbiAgICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGlkeCA9IDA7XG4gICAgY29uc3QgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCk7XG5cbiAgICBmb3IgKGNvbnN0IGVkaXRvciBvZiBlZGl0b3JzKSB7XG5cbiAgICAgIGlmIChcbiAgICAgICAgIW1hbmFnZXIuaXNWYWxpZEVkaXRvcihlZGl0b3IpIHx8XG4gICAgICAgIGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzBdICE9PSBtYW5hZ2VyLmNsaWVudC5wcm9qZWN0RGlyXG4gICAgICApIHtcblxuICAgICAgICBpZHgrKztcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIGlmICgrK2lkeCA9PT0gZWRpdG9ycy5sZW5ndGgpIHtcblxuICAgICAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICBjb25zdCBjdXJzb3IgPSBhY3RpdmVFZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuXG4gICAgICAgICAgaWYgKCFjdXJzb3IpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICAgICAgICBtYW5hZ2VyLmNsaWVudC5yZW5hbWUoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGFjdGl2ZUVkaXRvci5nZXRVUkkoKSlbMV0sIHtsaW5lOiBwb3NpdGlvbi5yb3csIGNoOiBwb3NpdGlvbi5jb2x1bW59LCBuZXdOYW1lKS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghZGF0YSkge1xuXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZW5hbWUoZGF0YSk7XG5cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcblxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLCB7XG5cbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVuYW1lKGRhdGEpIHtcblxuICAgIGNvbnN0IGRpciA9IG1hbmFnZXIuc2VydmVyLnByb2plY3REaXI7XG5cbiAgICBpZiAoIWRpcikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhbnNsYXRlQ29sdW1uQnkgPSBkYXRhLmNoYW5nZXNbMF0udGV4dC5sZW5ndGggLSBkYXRhLm5hbWUubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgY2hhbmdlIG9mIGRhdGEuY2hhbmdlcykge1xuXG4gICAgICBjaGFuZ2UuZmlsZSA9IGNoYW5nZS5maWxlLnJlcGxhY2UoL14uXFwvLywgJycpO1xuICAgICAgY2hhbmdlLmZpbGUgPSBwYXRoLnJlc29sdmUoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGRpcilbMF0sIGNoYW5nZS5maWxlKTtcbiAgICB9XG5cbiAgICBsZXQgY2hhbmdlcyA9IHVuaXEoZGF0YS5jaGFuZ2VzLCAoaXRlbSkgPT4ge1xuXG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoaXRlbSk7XG4gICAgfSk7XG5cbiAgICBsZXQgY3VycmVudEZpbGUgPSBmYWxzZTtcbiAgICBsZXQgYXJyID0gW107XG4gICAgbGV0IGlkeCA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzKSB7XG5cbiAgICAgIGlmIChjdXJyZW50RmlsZSAhPT0gY2hhbmdlLmZpbGUpIHtcblxuICAgICAgICBjdXJyZW50RmlsZSA9IGNoYW5nZS5maWxlO1xuICAgICAgICBpZHggPSBhcnIucHVzaChbXSkgLSAxO1xuICAgICAgfVxuXG4gICAgICBhcnJbaWR4XS5wdXNoKGNoYW5nZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhcnJPYmogb2YgYXJyKSB7XG5cbiAgICAgIHRoaXMub3BlbkZpbGVzQW5kUmVuYW1lKGFyck9iaiwgdHJhbnNsYXRlQ29sdW1uQnkpO1xuICAgIH1cblxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgb3BlbkZpbGVzQW5kUmVuYW1lKG9iaiwgdHJhbnNsYXRlQ29sdW1uQnkpIHtcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4ob2JqWzBdLmZpbGUpLnRoZW4oKHRleHRFZGl0b3IpID0+IHtcblxuICAgICAgbGV0IGN1cnJlbnRDb2x1bW5PZmZzZXQgPSAwO1xuICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgY29uc3QgY2hlY2twb2ludCA9IGJ1ZmZlci5jcmVhdGVDaGVja3BvaW50KCk7XG5cbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIG9iaikge1xuXG4gICAgICAgIHRoaXMuc2V0VGV4dEluUmFuZ2UoYnVmZmVyLCBjaGFuZ2UsIGN1cnJlbnRDb2x1bW5PZmZzZXQsIGlkeCA9PT0gb2JqLmxlbmd0aCAtIDEsIHRleHRFZGl0b3IpO1xuICAgICAgICBjdXJyZW50Q29sdW1uT2Zmc2V0ICs9IHRyYW5zbGF0ZUNvbHVtbkJ5O1xuXG4gICAgICAgIGlkeCsrO1xuICAgICAgfVxuXG4gICAgICBidWZmZXIuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0VGV4dEluUmFuZ2UoYnVmZmVyLCBjaGFuZ2UsIG9mZnNldCwgbW92ZUN1cnNvciwgdGV4dEVkaXRvcikge1xuXG4gICAgY2hhbmdlLnN0YXJ0ICs9IG9mZnNldDtcbiAgICBjaGFuZ2UuZW5kICs9IG9mZnNldDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGNoYW5nZS5zdGFydCk7XG4gICAgbGVuZ3RoID0gY2hhbmdlLmVuZCAtIGNoYW5nZS5zdGFydDtcbiAgICBjb25zdCBlbmQgPSBwb3NpdGlvbi50cmFuc2xhdGUobmV3IFBvaW50KDAsIGxlbmd0aCkpO1xuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLCBlbmQpO1xuICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShyYW5nZSwgY2hhbmdlLnRleHQpO1xuXG4gICAgaWYgKCFtb3ZlQ3Vyc29yKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJzb3IgPSB0ZXh0RWRpdG9yLmdldExhc3RDdXJzb3IoKTtcblxuICAgIGN1cnNvciAmJiBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGRpc3Bvc2VBbGwodGhpcy5kaXNwb3NhYmxlcyk7XG5cbiAgICB0aGlzLnJlbmFtZVZpZXcgJiYgdGhpcy5yZW5hbWVWaWV3LmRlc3Ryb3koKTtcbiAgICB0aGlzLnJlbmFtZVZpZXcgPSBudWxsO1xuXG4gICAgdGhpcy5yZW5hbWVQYW5lbCAmJiB0aGlzLnJlbmFtZVBhbmVsLmRlc3Ryb3koKTtcbiAgICB0aGlzLnJlbmFtZVBhbmVsID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgUmVuYW1lKCk7XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/atom-ternjs/lib/atom-ternjs-rename.js
