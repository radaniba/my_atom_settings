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
  }

  _createClass(Client, [{
    key: 'completions',
    value: function completions(file, end) {

      return this.post('query', {

        query: {

          type: 'completions',
          file: file,
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
          file: file,
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
          file: file,
          end: end
        }
      });
    }
  }, {
    key: 'updateFull',
    value: function updateFull(editor, editorMeta) {

      if (editorMeta) {

        editorMeta.diffs = [];
      }

      return this.post('query', { files: [{

          type: 'full',
          name: atom.project.relativizePath(editor.getURI())[1],
          text: editor.getText()
        }] });
    }
  }, {
    key: 'updatePart',
    value: function updatePart(editor, editorMeta, start, text) {

      if (editorMeta) {

        editorMeta.diffs = [];
      }

      return this.post('query', [{

        type: 'full',
        name: atom.project.relativizePath(editor.getURI())[1],
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

      var editorMeta = _atomTernjsManager2['default'].getEditor(editor);
      var uRI = editor.getURI();

      if (!uRI) {

        return Promise.reject({ type: 'info', message: _servicesDebug.messages.noURI });
      }

      var file = atom.project.relativizePath(uRI)[1].replace(/\\/g, '/');

      // check if this file is excluded via dontLoad
      if (_atomTernjsManager2['default'].server && _atomTernjsManager2['default'].server.dontLoad(file)) {

        return Promise.resolve({});
      }

      // check if the file is registered, else return
      return this.files().then(function (data) {

        if (data.files) {

          for (var i = 0; i < data.files.length; i++) {

            data.files[i] = data.files[i].replace(/\\/g, '/');
          }
        }

        var registered = data.files && data.files.indexOf(file) > -1;

        if (editorMeta && editorMeta.diffs.length === 0 && registered) {

          return Promise.resolve({});
        }

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
          file: file,
          end: end,
          newName: newName
        }
      });
    }
  }, {
    key: 'type',
    value: function type(editor, position) {

      var file = atom.project.relativizePath(editor.getURI())[1];
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
          file: file,
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
          file: file,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWNsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7aUNBQ0gsdUJBQXVCOzs7O3VDQUNqQiw4QkFBOEI7Ozs7Z0NBR2pELHNCQUFzQjs7a0NBQ04sdUJBQXVCOzs7OzZCQUN2QixrQkFBa0I7O0FBVHpDLFdBQVcsQ0FBQzs7SUFXUyxNQUFNO0FBRWQsV0FGUSxNQUFNLENBRWIsVUFBVSxFQUFFOzBCQUZMLE1BQU07O0FBSXZCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0dBQzlCOztlQUxrQixNQUFNOztXQU9kLHFCQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7O0FBRXJCLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRXhCLGFBQUssRUFBRTs7QUFFTCxjQUFJLEVBQUUsYUFBYTtBQUNuQixjQUFJLEVBQUUsSUFBSTtBQUNWLGFBQUcsRUFBRSxHQUFHO0FBQ1IsZUFBSyxFQUFFLElBQUk7QUFDWCx5QkFBZSxFQUFFLElBQUk7QUFDckIsY0FBSSxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxJQUFJO0FBQ2hDLGVBQUssRUFBRSxxQ0FBYyxPQUFPLENBQUMsS0FBSztBQUNsQyxjQUFJLEVBQUUscUNBQWMsT0FBTyxDQUFDLGFBQWE7QUFDekMsY0FBSSxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxJQUFJO0FBQ2hDLGlCQUFPLEVBQUUscUNBQWMsT0FBTyxDQUFDLE9BQU87QUFDdEMsMkJBQWlCLEVBQUUsSUFBSTtBQUN2Qix5QkFBZSxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxlQUFlO1NBQ3ZEO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVZLHVCQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7O0FBRXZCLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRXhCLGFBQUssRUFB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QUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7V0FDekM7U0FDRjtPQUNGLENBQUMsU0FBTSxDQUFDLFVBQUMsR0FBRyxFQUFLOztBQUVoQixlQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3BCLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx1QkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDeEIsYUFBSyxFQUFFO0FBQ0wsY0FBSSxFQUFFLFlBQVk7QUFDbEIsY0FBSSxFQUFFLElBQUk7QUFDVixlQUFLLEVBQUU7QUFDTCxnQkFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRztBQUNyQixjQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNO1dBQ3ZCO0FBQ0QsYUFBRyxFQUFFO0FBQ0gsZ0JBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUc7QUFDbkIsY0FBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTTtXQUNyQjtTQUNGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVJLGlCQUFHOztBQUVOLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRXhCLGFBQUssRUFBRTs7QUFFTCxjQUFJLEVBQUUsT0FBTztTQUNkOztPQUVGLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7O0FBRWhCLGVBQU8sSUFBSSxDQUFDO09BQ2IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVHLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBRTs7QUFFZixVQUFNLE9BQU8sR0FBRywrQkFBUSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbkQsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQTNRa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCBwYWNrYWdlQ29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtcGFja2FnZS1jb25maWcnO1xuaW1wb3J0IHtcbiAgb3BlbkZpbGVBbmRHb1RvXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCBuYXZpZ2F0aW9uIGZyb20gJy4vc2VydmljZXMvbmF2aWdhdGlvbic7XG5pbXBvcnQge21lc3NhZ2VzfSBmcm9tICcuL3NlcnZpY2VzL2RlYnVnJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0RGlyKSB7XG5cbiAgICB0aGlzLnByb2plY3REaXIgPSBwcm9qZWN0RGlyO1xuICB9XG5cbiAgY29tcGxldGlvbnMoZmlsZSwgZW5kKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAnY29tcGxldGlvbnMnLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgdHlwZXM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVLZXl3b3JkczogdHJ1ZSxcbiAgICAgICAgc29ydDogcGFja2FnZUNvbmZpZy5vcHRpb25zLnNvcnQsXG4gICAgICAgIGd1ZXNzOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuZ3Vlc3MsXG4gICAgICAgIGRvY3M6IHBhY2thZ2VDb25maWcub3B0aW9ucy5kb2N1bWVudGF0aW9uLFxuICAgICAgICB1cmxzOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMudXJscyxcbiAgICAgICAgb3JpZ2luczogcGFja2FnZUNvbmZpZy5vcHRpb25zLm9yaWdpbnMsXG4gICAgICAgIGxpbmVDaGFyUG9zaXRpb25zOiB0cnVlLFxuICAgICAgICBjYXNlSW5zZW5zaXRpdmU6IHBhY2thZ2VDb25maWcub3B0aW9ucy5jYXNlSW5zZW5zaXRpdmVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRvY3VtZW50YXRpb24oZmlsZSwgZW5kKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAnZG9jdW1lbnRhdGlvbicsXG4gICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgIGVuZDogZW5kXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZWZzKGZpbGUsIGVuZCkge1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ3JlZnMnLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlRnVsbChlZGl0b3IsIGVkaXRvck1ldGEpIHtcblxuICAgIGlmIChlZGl0b3JNZXRhKSB7XG5cbiAgICAgIGVkaXRvck1ldGEuZGlmZnMgPSBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHsgZmlsZXM6IFt7XG5cbiAgICAgIHR5cGU6ICdmdWxsJyxcbiAgICAgIG5hbWU6IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdLFxuICAgICAgdGV4dDogZWRpdG9yLmdldFRleHQoKVxuICAgIH1dfSk7XG4gIH1cblxuICB1cGRhdGVQYXJ0KGVkaXRvciwgZWRpdG9yTWV0YSwgc3RhcnQsIHRleHQpIHtcblxuICAgIGlmIChlZGl0b3JNZXRhKSB7XG5cbiAgICAgIGVkaXRvck1ldGEuZGlmZnMgPSBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIFt7XG5cbiAgICAgIHR5cGU6ICdmdWxsJyxcbiAgICAgIG5hbWU6IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdLFxuICAgICAgb2Zmc2V0OiB7XG5cbiAgICAgICAgbGluZTogc3RhcnQsXG4gICAgICAgIGNoOiAwXG4gICAgICB9LFxuICAgICAgdGV4dDogZWRpdG9yLmdldFRleHQoKVxuICAgIH1dKTtcbiAgfVxuXG4gIHVwZGF0ZShlZGl0b3IpIHtcblxuICAgIGNvbnN0IGVkaXRvck1ldGEgPSBtYW5hZ2VyLmdldEVkaXRvcihlZGl0b3IpO1xuICAgIGNvbnN0IHVSSSA9IGVkaXRvci5nZXRVUkkoKTtcblxuICAgIGlmICghdVJJKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7dHlwZTogJ2luZm8nLCBtZXNzYWdlOiBtZXNzYWdlcy5ub1VSSX0pO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgodVJJKVsxXS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICAvLyBjaGVjayBpZiB0aGlzIGZpbGUgaXMgZXhjbHVkZWQgdmlhIGRvbnRMb2FkXG4gICAgaWYgKFxuICAgICAgbWFuYWdlci5zZXJ2ZXIgJiZcbiAgICAgIG1hbmFnZXIuc2VydmVyLmRvbnRMb2FkKGZpbGUpXG4gICAgKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIHRoZSBmaWxlIGlzIHJlZ2lzdGVyZWQsIGVsc2UgcmV0dXJuXG4gICAgcmV0dXJuIHRoaXMuZmlsZXMoKS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgIGlmIChkYXRhLmZpbGVzKSB7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICBkYXRhLmZpbGVzW2ldID0gZGF0YS5maWxlc1tpXS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVnaXN0ZXJlZCA9IGRhdGEuZmlsZXMgJiYgZGF0YS5maWxlcy5pbmRleE9mKGZpbGUpID4gLTE7XG5cbiAgICAgIGlmIChcbiAgICAgICAgZWRpdG9yTWV0YSAmJlxuICAgICAgICBlZGl0b3JNZXRhLmRpZmZzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICByZWdpc3RlcmVkXG4gICAgICApIHtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlZ2lzdGVyZWQpIHtcblxuICAgICAgICAvLyBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICAgIC8vIGlmIGJ1ZmZlci5nZXRNYXhDaGFyYWN0ZXJJbmRleCgpID4gNTAwMFxuICAgICAgICAvLyAgIHN0YXJ0ID0gMFxuICAgICAgICAvLyAgIGVuZCA9IDBcbiAgICAgICAgLy8gICB0ZXh0ID0gJydcbiAgICAgICAgLy8gICBmb3IgZGlmZiBpbiBlZGl0b3JNZXRhLmRpZmZzXG4gICAgICAgIC8vICAgICBzdGFydCA9IE1hdGgubWF4KDAsIGRpZmYub2xkUmFuZ2Uuc3RhcnQucm93IC0gNTApXG4gICAgICAgIC8vICAgICBlbmQgPSBNYXRoLm1pbihidWZmZXIuZ2V0TGluZUNvdW50KCksIGRpZmYub2xkUmFuZ2UuZW5kLnJvdyArIDUpXG4gICAgICAgIC8vICAgICB0ZXh0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKFtbc3RhcnQsIDBdLCBbZW5kLCBidWZmZXIubGluZUxlbmd0aEZvclJvdyhlbmQpXV0pXG4gICAgICAgIC8vICAgcHJvbWlzZSA9IHRoaXMudXBkYXRlUGFydChlZGl0b3IsIGVkaXRvck1ldGEsIHN0YXJ0LCB0ZXh0KVxuICAgICAgICAvLyBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUZ1bGwoZWRpdG9yLCBlZGl0b3JNZXRhKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmFtZShmaWxlLCBlbmQsIG5ld05hbWUpIHtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICdyZW5hbWUnLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgbmV3TmFtZTogbmV3TmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdHlwZShlZGl0b3IsIHBvc2l0aW9uKSB7XG5cbiAgICBjb25zdCBmaWxlID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV07XG4gICAgY29uc3QgZW5kID0ge1xuXG4gICAgICBsaW5lOiBwb3NpdGlvbi5yb3csXG4gICAgICBjaDogcG9zaXRpb24uY29sdW1uXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICd0eXBlJyxcbiAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIHByZWZlckZ1bmN0aW9uOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZWZpbml0aW9uKCkge1xuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG4gICAgY29uc3QgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKTtcbiAgICBjb25zdCBbcHJvamVjdCwgZmlsZV0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZWRpdG9yLmdldFVSSSgpKTtcbiAgICBjb25zdCBlbmQgPSB7XG5cbiAgICAgIGxpbmU6IHBvc2l0aW9uLnJvdyxcbiAgICAgIGNoOiBwb3NpdGlvbi5jb2x1bW5cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ2RlZmluaXRpb24nLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfVxuXG4gICAgfSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICBpZiAoZGF0YSAmJiBkYXRhLnN0YXJ0KSB7XG5cbiAgICAgICAgaWYgKG5hdmlnYXRpb24uc2V0KGRhdGEpKSB7XG5cbiAgICAgICAgICBjb25zdCBwYXRoX3RvX2dvID0gcGF0aC5pc0Fic29sdXRlKGRhdGEuZmlsZSkgPyBkYXRhLmZpbGUgOiBgJHtwcm9qZWN0fS8ke2RhdGEuZmlsZX1gO1xuICAgICAgICAgIG9wZW5GaWxlQW5kR29UbyhkYXRhLnN0YXJ0LCBwYXRoX3RvX2dvKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcblxuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbihmaWxlLCByYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgdHlwZTogJ2RlZmluaXRpb24nLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBzdGFydDoge1xuICAgICAgICAgIGxpbmU6IHJhbmdlLnN0YXJ0LnJvdyxcbiAgICAgICAgICBjaDogcmFuZ2Uuc3RhcnQuY29sdW1uXG4gICAgICAgIH0sXG4gICAgICAgIGVuZDoge1xuICAgICAgICAgIGxpbmU6IHJhbmdlLmVuZC5yb3csXG4gICAgICAgICAgY2g6IHJhbmdlLmVuZC5jb2x1bW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZmlsZXMoKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAnZmlsZXMnXG4gICAgICB9XG5cbiAgICB9KS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgcG9zdCh0eXBlLCBkYXRhKSB7XG5cbiAgICBjb25zdCBwcm9taXNlID0gbWFuYWdlci5zZXJ2ZXIucmVxdWVzdCh0eXBlLCBkYXRhKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59XG4iXX0=