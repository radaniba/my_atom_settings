Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

var _servicesDebug = require('./services/debug');

'use babel';

var Client = (function () {
  function Client(projectDir) {
    _classCallCheck(this, Client);

    this.projectDir = projectDir;
    // collection files the server currently holds in its set of analyzed files
    this.analyzedFiles = [];
  }

  _createClass(Client, [{
    key: 'completions',
    value: function completions(file, end) {

      return this.post('query', {

        query: {

          type: 'completions',
          file: _path2['default'].normalize(file),
          end: end,
          types: true,
          includeKeywords: true,
          sort: _atomTernjsPackageConfig2['default'].options.sort,
          guess: _atomTernjsPackageConfig2['default'].options.guess,
          docs: _atomTernjsPackageConfig2['default'].options.documentation,
          urls: _atomTernjsPackageConfig2['default'].options.urls,
          origins: _atomTernjsPackageConfig2['default'].options.origins,
          lineCharPositions: true,
          caseInsensitive: _atomTernjsPackageConfig2['default'].options.caseInsensitive
        }
      });
    }
  }, {
    key: 'documentation',
    value: function documentation(file, end) {

      return this.post('query', {

        query: {

          type: 'documentation',
          file: _path2['default'].normalize(file),
          end: end
        }
      });
    }
  }, {
    key: 'refs',
    value: function refs(file, end) {

      return this.post('query', {

        query: {

          type: 'refs',
          file: _path2['default'].normalize(file),
          end: end
        }
      });
    }
  }, {
    key: 'updateFull',
    value: function updateFull(editor, editorMeta) {

      if (editorMeta) {

        editorMeta.isDirty = false;
      }

      return this.post('query', { files: [{

          type: 'full',
          name: _path2['default'].normalize(atom.project.relativizePath(editor.getURI())[1]),
          text: editor.getText()
        }] });
    }
  }, {
    key: 'updatePart',
    value: function updatePart(editor, editorMeta, start, text) {

      if (editorMeta) {

        editorMeta.isDirty = false;
      }

      return this.post('query', [{

        type: 'full',
        name: _path2['default'].normalize(atom.project.relativizePath(editor.getURI())[1]),
        offset: {

          line: start,
          ch: 0
        },
        text: editor.getText()
      }]);
    }
  }, {
    key: 'update',
    value: function update(editor) {
      var _this = this;

      var editorMeta = _atomTernjsManager2['default'].getEditor(editor.id);

      if (!editorMeta) {

        return Promise.reject();
      }

      if (!editorMeta.isDirty) {

        return Promise.resolve({});
      }

      var uRI = editor.getURI();

      if (!uRI) {

        return Promise.reject({ type: 'info', message: _servicesDebug.messages.noURI });
      }

      var file = _path2['default'].normalize(atom.project.relativizePath(uRI)[1]);

      // check if this file is excluded via dontLoad
      if (_atomTernjsManager2['default'].server && _atomTernjsManager2['default'].server.dontLoad(file)) {

        return Promise.resolve({});
      }

      // do not request files if we already know it is registered
      if (this.analyzedFiles.includes(file)) {

        return this.updateFull(editor, editorMeta);
      }

      // check if the file is registered, else return
      return this.files().then(function (data) {

        var files = data.files;

        if (files) {

          files.forEach(function (file) {
            return file = _path2['default'].normalize(file);
          });
          _this.analyzedFiles = files;
        }

        var registered = files && files.includes(file);

        if (registered) {

          // const buffer = editor.getBuffer();
          // if buffer.getMaxCharacterIndex() > 5000
          //   start = 0
          //   end = 0
          //   text = ''
          //   for diff in editorMeta.diffs
          //     start = Math.max(0, diff.oldRange.start.row - 50)
          //     end = Math.min(buffer.getLineCount(), diff.oldRange.end.row + 5)
          //     text = buffer.getTextInRange([[start, 0], [end, buffer.lineLengthForRow(end)]])
          //   promise = this.updatePart(editor, editorMeta, start, text)
          // else
          return _this.updateFull(editor, editorMeta);
        } else {

          return Promise.resolve({});
        }
      })['catch'](function (err) {

        console.error(err);
      });
    }
  }, {
    key: 'rename',
    value: function rename(file, end, newName) {

      return this.post('query', {

        query: {

          type: 'rename',
          file: _path2['default'].normalize(file),
          end: end,
          newName: newName
        }
      });
    }
  }, {
    key: 'type',
    value: function type(editor, position) {

      var file = _path2['default'].normalize(atom.project.relativizePath(editor.getURI())[1]);
      var end = {

        line: position.row,
        ch: position.column
      };

      return this.post('query', {

        query: {

          type: 'type',
          file: file,
          end: end,
          preferFunction: true
        }
      });
    }
  }, {
    key: 'definition',
    value: function definition() {

      var editor = atom.workspace.getActiveTextEditor();
      var cursor = editor.getLastCursor();
      var position = cursor.getBufferPosition();

      var _atom$project$relativizePath = atom.project.relativizePath(editor.getURI());

      var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

      var project = _atom$project$relativizePath2[0];
      var file = _atom$project$relativizePath2[1];

      var end = {

        line: position.row,
        ch: position.column
      };

      return this.post('query', {

        query: {

          type: 'definition',
          file: _path2['default'].normalize(file),
          end: end
        }

      }).then(function (data) {

        if (data && data.start) {

          if (_servicesNavigation2['default'].set(data)) {

            var path_to_go = _path2['default'].isAbsolute(data.file) ? data.file : project + '/' + data.file;
            (0, _atomTernjsHelper.openFileAndGoTo)(data.start, path_to_go);
          }
        }
      })['catch'](function (err) {

        console.error(err);
      });
    }
  }, {
    key: 'getDefinition',
    value: function getDefinition(file, range) {
      return this.post('query', {
        query: {
          type: 'definition',
          file: _path2['default'].normalize(file),
          start: {
            line: range.start.row,
            ch: range.start.column
          },
          end: {
            line: range.end.row,
            ch: range.end.column
          }
        }
      });
    }
  }, {
    key: 'files',
    value: function files() {

      return this.post('query', {

        query: {

          type: 'files'
        }

      }).then(function (data) {

        return data;
      });
    }
  }, {
    key: 'post',
    value: function post(type, data) {

      var promise = _atomTernjsManager2['default'].server.request(type, data);

      return promise;
    }
  }]);

  return Client;
})();

exports['default'] = Client;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWNsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7aUNBQ0gsdUJBQXVCOzs7O3VDQUNqQiw4QkFBOEI7Ozs7Z0NBR2pELHNCQUFzQjs7a0NBQ04sdUJBQXVCOzs7OzZCQUN2QixrQkFBa0I7O0FBVHpDLFdBQVcsQ0FBQzs7SUFXUyxNQUFNO0FBRWQsV0FGUSxNQUFNLENBRWIsVUFBVSxFQUFFOzBCQUZMLE1BQU07O0FBSXZCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDOztBQUU3QixRQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztHQUN6Qjs7ZUFQa0IsTUFBTTs7V0FTZCxxQkFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFOztBQUVyQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUV4QixhQUFLLEVBQUU7O0FBRUwsY0FBSSxFQUFFLGFBQWE7QUFDbkIsY0FBSSxFQUFFLGtCQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDMUIsYUFBRyxFQUFFLEdBQUc7QUFDUixlQUFLLEVBQUUsSUFBSTtBQUNYLHlCQUFlLEVBQUUsSUFBSTtBQUNyQixjQUFJLEVBQUUscUNBQWMsT0FBTyxDQUFDLElBQUk7QUFDaEMsZUFBSyxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxLQUFLO0FBQ2xDLGNBQUksRUFBRSxxQ0FBYyxPQUFPLENBQUMsYUFBYTtBQUN6QyxjQUFJLEVBQUUscUNBQWMsT0FBTyxDQUFDLElBQUk7QUFDaEMsaUJBQU8sRUFBRSxxQ0FBYyxPQUFPLENBQUMsT0FBTztBQUN0QywyQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLHlCQUFlLEVBQUUscUNBQWMsT0FBTyxDQUFDLGVBQWU7U0FDdkQ7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRVksdUJBQUMsSUFBSSxFQUFFLEdBQUcsRUFB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QyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7O0FBRWhCLGVBQU8sSUFBSSxDQUFDO09BQ2IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVHLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBRTs7QUFFZixVQUFNLE9BQU8sR0FBRywrQkFBUSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbkQsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQXJSa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCBwYWNrYWdlQ29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtcGFja2FnZS1jb25maWcnO1xuaW1wb3J0IHtcbiAgb3BlbkZpbGVBbmRHb1RvXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCBuYXZpZ2F0aW9uIGZyb20gJy4vc2VydmljZXMvbmF2aWdhdGlvbic7XG5pbXBvcnQge21lc3NhZ2VzfSBmcm9tICcuL3NlcnZpY2VzL2RlYnVnJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0RGlyKSB7XG5cbiAgICB0aGlzLnByb2plY3REaXIgPSBwcm9qZWN0RGlyO1xuICAgIC8vIGNvbGxlY3Rpb24gZmlsZXMgdGhlIHNlcnZlciBjdXJyZW50bHkgaG9sZHMgaW4gaXRzIHNldCBvZiBhbmFseXplZCBmaWxlc1xuICAgIHRoaXMuYW5hbHl6ZWRGaWxlcyA9IFtdO1xuICB9XG5cbiAgY29tcGxldGlvbnMoZmlsZSwgZW5kKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAnY29tcGxldGlvbnMnLFxuICAgICAgICBmaWxlOiBwYXRoLm5vcm1hbGl6ZShmaWxlKSxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIHR5cGVzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlS2V5d29yZHM6IHRydWUsXG4gICAgICAgIHNvcnQ6IHBhY2thZ2VDb25maWcub3B0aW9ucy5zb3J0LFxuICAgICAgICBndWVzczogcGFja2FnZUNvbmZpZy5vcHRpb25zLmd1ZXNzLFxuICAgICAgICBkb2NzOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuZG9jdW1lbnRhdGlvbixcbiAgICAgICAgdXJsczogcGFja2FnZUNvbmZpZy5vcHRpb25zLnVybHMsXG4gICAgICAgIG9yaWdpbnM6IHBhY2thZ2VDb25maWcub3B0aW9ucy5vcmlnaW5zLFxuICAgICAgICBsaW5lQ2hhclBvc2l0aW9uczogdHJ1ZSxcbiAgICAgICAgY2FzZUluc2Vuc2l0aXZlOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuY2FzZUluc2Vuc2l0aXZlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkb2N1bWVudGF0aW9uKGZpbGUsIGVuZCkge1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ2RvY3VtZW50YXRpb24nLFxuICAgICAgICBmaWxlOiBwYXRoLm5vcm1hbGl6ZShmaWxlKSxcbiAgICAgICAgZW5kOiBlbmRcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlZnMoZmlsZSwgZW5kKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAncmVmcycsXG4gICAgICAgIGZpbGU6IHBhdGgubm9ybWFsaXplKGZpbGUpLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlRnVsbChlZGl0b3IsIGVkaXRvck1ldGEpIHtcblxuICAgIGlmIChlZGl0b3JNZXRhKSB7XG5cbiAgICAgIGVkaXRvck1ldGEuaXNEaXJ0eSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5JywgeyBmaWxlczogW3tcblxuICAgICAgdHlwZTogJ2Z1bGwnLFxuICAgICAgbmFtZTogcGF0aC5ub3JtYWxpemUoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV0pLFxuICAgICAgdGV4dDogZWRpdG9yLmdldFRleHQoKVxuICAgIH1dfSk7XG4gIH1cblxuICB1cGRhdGVQYXJ0KGVkaXRvciwgZWRpdG9yTWV0YSwgc3RhcnQsIHRleHQpIHtcblxuICAgIGlmIChlZGl0b3JNZXRhKSB7XG5cbiAgICAgIGVkaXRvck1ldGEuaXNEaXJ0eSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5JywgW3tcblxuICAgICAgdHlwZTogJ2Z1bGwnLFxuICAgICAgbmFtZTogcGF0aC5ub3JtYWxpemUoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV0pLFxuICAgICAgb2Zmc2V0OiB7XG5cbiAgICAgICAgbGluZTogc3RhcnQsXG4gICAgICAgIGNoOiAwXG4gICAgICB9LFxuICAgICAgdGV4dDogZWRpdG9yLmdldFRleHQoKVxuICAgIH1dKTtcbiAgfVxuXG4gIHVwZGF0ZShlZGl0b3IpIHtcblxuICAgIGNvbnN0IGVkaXRvck1ldGEgPSBtYW5hZ2VyLmdldEVkaXRvcihlZGl0b3IuaWQpO1xuXG4gICAgaWYgKCFlZGl0b3JNZXRhKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgIH1cblxuICAgIGlmICghZWRpdG9yTWV0YS5pc0RpcnR5KSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuICAgIH1cblxuICAgIGNvbnN0IHVSSSA9IGVkaXRvci5nZXRVUkkoKTtcblxuICAgIGlmICghdVJJKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7dHlwZTogJ2luZm8nLCBtZXNzYWdlOiBtZXNzYWdlcy5ub1VSSX0pO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSBwYXRoLm5vcm1hbGl6ZShhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgodVJJKVsxXSk7XG5cbiAgICAvLyBjaGVjayBpZiB0aGlzIGZpbGUgaXMgZXhjbHVkZWQgdmlhIGRvbnRMb2FkXG4gICAgaWYgKFxuICAgICAgbWFuYWdlci5zZXJ2ZXIgJiZcbiAgICAgIG1hbmFnZXIuc2VydmVyLmRvbnRMb2FkKGZpbGUpXG4gICAgKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuICAgIH1cblxuICAgIC8vIGRvIG5vdCByZXF1ZXN0IGZpbGVzIGlmIHdlIGFscmVhZHkga25vdyBpdCBpcyByZWdpc3RlcmVkXG4gICAgaWYgKHRoaXMuYW5hbHl6ZWRGaWxlcy5pbmNsdWRlcyhmaWxlKSkge1xuXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVGdWxsKGVkaXRvciwgZWRpdG9yTWV0YSk7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgdGhlIGZpbGUgaXMgcmVnaXN0ZXJlZCwgZWxzZSByZXR1cm5cbiAgICByZXR1cm4gdGhpcy5maWxlcygpLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgY29uc3QgZmlsZXMgPSBkYXRhLmZpbGVzO1xuXG4gICAgICBpZiAoZmlsZXMpIHtcblxuICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gZmlsZSA9IHBhdGgubm9ybWFsaXplKGZpbGUpKTtcbiAgICAgICAgdGhpcy5hbmFseXplZEZpbGVzID0gZmlsZXM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlZ2lzdGVyZWQgPSBmaWxlcyAmJiBmaWxlcy5pbmNsdWRlcyhmaWxlKTtcblxuICAgICAgaWYgKHJlZ2lzdGVyZWQpIHtcblxuICAgICAgICAvLyBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICAgIC8vIGlmIGJ1ZmZlci5nZXRNYXhDaGFyYWN0ZXJJbmRleCgpID4gNTAwMFxuICAgICAgICAvLyAgIHN0YXJ0ID0gMFxuICAgICAgICAvLyAgIGVuZCA9IDBcbiAgICAgICAgLy8gICB0ZXh0ID0gJydcbiAgICAgICAgLy8gICBmb3IgZGlmZiBpbiBlZGl0b3JNZXRhLmRpZmZzXG4gICAgICAgIC8vICAgICBzdGFydCA9IE1hdGgubWF4KDAsIGRpZmYub2xkUmFuZ2Uuc3RhcnQucm93IC0gNTApXG4gICAgICAgIC8vICAgICBlbmQgPSBNYXRoLm1pbihidWZmZXIuZ2V0TGluZUNvdW50KCksIGRpZmYub2xkUmFuZ2UuZW5kLnJvdyArIDUpXG4gICAgICAgIC8vICAgICB0ZXh0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKFtbc3RhcnQsIDBdLCBbZW5kLCBidWZmZXIubGluZUxlbmd0aEZvclJvdyhlbmQpXV0pXG4gICAgICAgIC8vICAgcHJvbWlzZSA9IHRoaXMudXBkYXRlUGFydChlZGl0b3IsIGVkaXRvck1ldGEsIHN0YXJ0LCB0ZXh0KVxuICAgICAgICAvLyBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUZ1bGwoZWRpdG9yLCBlZGl0b3JNZXRhKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmFtZShmaWxlLCBlbmQsIG5ld05hbWUpIHtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICdyZW5hbWUnLFxuICAgICAgICBmaWxlOiBwYXRoLm5vcm1hbGl6ZShmaWxlKSxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIG5ld05hbWU6IG5ld05hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHR5cGUoZWRpdG9yLCBwb3NpdGlvbikge1xuXG4gICAgY29uc3QgZmlsZSA9IHBhdGgubm9ybWFsaXplKGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdKTtcbiAgICBjb25zdCBlbmQgPSB7XG5cbiAgICAgIGxpbmU6IHBvc2l0aW9uLnJvdyxcbiAgICAgIGNoOiBwb3NpdGlvbi5jb2x1bW5cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ3R5cGUnLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgcHJlZmVyRnVuY3Rpb246IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRlZmluaXRpb24oKSB7XG5cbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpO1xuICAgIGNvbnN0IFtwcm9qZWN0LCBmaWxlXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpO1xuICAgIGNvbnN0IGVuZCA9IHtcblxuICAgICAgbGluZTogcG9zaXRpb24ucm93LFxuICAgICAgY2g6IHBvc2l0aW9uLmNvbHVtblxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAnZGVmaW5pdGlvbicsXG4gICAgICAgIGZpbGU6IHBhdGgubm9ybWFsaXplKGZpbGUpLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfVxuXG4gICAgfSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICBpZiAoZGF0YSAmJiBkYXRhLnN0YXJ0KSB7XG5cbiAgICAgICAgaWYgKG5hdmlnYXRpb24uc2V0KGRhdGEpKSB7XG5cbiAgICAgICAgICBjb25zdCBwYXRoX3RvX2dvID0gcGF0aC5pc0Fic29sdXRlKGRhdGEuZmlsZSkgPyBkYXRhLmZpbGUgOiBgJHtwcm9qZWN0fS8ke2RhdGEuZmlsZX1gO1xuICAgICAgICAgIG9wZW5GaWxlQW5kR29UbyhkYXRhLnN0YXJ0LCBwYXRoX3RvX2dvKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcblxuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbihmaWxlLCByYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgdHlwZTogJ2RlZmluaXRpb24nLFxuICAgICAgICBmaWxlOiBwYXRoLm5vcm1hbGl6ZShmaWxlKSxcbiAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICBsaW5lOiByYW5nZS5zdGFydC5yb3csXG4gICAgICAgICAgY2g6IHJhbmdlLnN0YXJ0LmNvbHVtblxuICAgICAgICB9LFxuICAgICAgICBlbmQ6IHtcbiAgICAgICAgICBsaW5lOiByYW5nZS5lbmQucm93LFxuICAgICAgICAgIGNoOiByYW5nZS5lbmQuY29sdW1uXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZpbGVzKCkge1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ2ZpbGVzJ1xuICAgICAgfVxuXG4gICAgfSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIHBvc3QodHlwZSwgZGF0YSkge1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG1hbmFnZXIuc2VydmVyLnJlcXVlc3QodHlwZSwgZGF0YSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxufVxuIl19