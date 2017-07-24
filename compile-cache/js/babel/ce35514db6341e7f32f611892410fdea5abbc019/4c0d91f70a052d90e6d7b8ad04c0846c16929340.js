Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

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
      var file = atom.project.relativizePath(editor.getURI())[1].replace(/\\/g, '/');

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

            (0, _atomTernjsHelper.openFileAndGoTo)(data.start, project + '/' + data.file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWNsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRW9CLHVCQUF1Qjs7Ozt1Q0FDakIsOEJBQThCOzs7O2dDQUdqRCxzQkFBc0I7O2tDQUNOLHVCQUF1Qjs7OztBQVA5QyxXQUFXLENBQUM7O0lBU1MsTUFBTTtBQUVkLFdBRlEsTUFBTSxDQUViLFVBQVUsRUFBRTswQkFGTCxNQUFNOztBQUl2QixRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztHQUM5Qjs7ZUFMa0IsTUFBTTs7V0FPZCxxQkFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFOztBQUVyQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUV4QixhQUFLLEVBQUU7O0FBRUwsY0FBSSxFQUFFLGFBQWE7QUFDbkIsY0FBSSxFQUFFLElBQUk7QUFDVixhQUFHLEVBQUUsR0FBRztBQUNSLGVBQUssRUFBRSxJQUFJO0FBQ1gseUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGNBQUksRUFBRSxxQ0FBYyxPQUFPLENBQUMsSUFBSTtBQUNoQyxlQUFLLEVBQUUscUNBQWMsT0FBTyxDQUFDLEtBQUs7QUFDbEMsY0FBSSxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxhQUFhO0FBQ3pDLGNBQUksRUFBRSxxQ0FBYyxPQUFPLENBQUMsSUFBSTtBQUNoQyxpQkFBTyxFQUFFLHFDQUFjLE9BQU8sQ0FBQyxPQUFPO0FBQ3RDLDJCQUFpQixFQUFFLElBQUk7QUFDdkIseUJBQWUsRUFBRSxxQ0FBYyxPQUFPLENBQUMsZUFBZTtTQUN2RDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx1QkFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFOztBQUV2QixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUV4QixhQUFLLEVBQUU7O0FBRUwsY0FBSSxFQUFFLGVBQWU7QUFDckIs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LGdCQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ3JCLGNBQUUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU07V0FDdkI7QUFDRCxhQUFHLEVBQUU7QUFDSCxnQkFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRztBQUNuQixjQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNO1dBQ3JCO1NBQ0Y7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRUksaUJBQUc7O0FBRU4sYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTs7QUFFeEIsYUFBSyxFQUFFOztBQUVMLGNBQUksRUFBRSxPQUFPO1NBQ2Q7O09BRUYsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSzs7QUFFaEIsZUFBTyxJQUFJLENBQUM7T0FDYixDQUFDLENBQUM7S0FDSjs7O1dBRUcsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFOztBQUVmLFVBQU0sT0FBTyxHQUFHLCtCQUFRLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVuRCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1NBblFrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy1jbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCBwYWNrYWdlQ29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtcGFja2FnZS1jb25maWcnO1xuaW1wb3J0IHtcbiAgb3BlbkZpbGVBbmRHb1RvXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCBuYXZpZ2F0aW9uIGZyb20gJy4vc2VydmljZXMvbmF2aWdhdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdERpcikge1xuXG4gICAgdGhpcy5wcm9qZWN0RGlyID0gcHJvamVjdERpcjtcbiAgfVxuXG4gIGNvbXBsZXRpb25zKGZpbGUsIGVuZCkge1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ2NvbXBsZXRpb25zJyxcbiAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIHR5cGVzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlS2V5d29yZHM6IHRydWUsXG4gICAgICAgIHNvcnQ6IHBhY2thZ2VDb25maWcub3B0aW9ucy5zb3J0LFxuICAgICAgICBndWVzczogcGFja2FnZUNvbmZpZy5vcHRpb25zLmd1ZXNzLFxuICAgICAgICBkb2NzOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuZG9jdW1lbnRhdGlvbixcbiAgICAgICAgdXJsczogcGFja2FnZUNvbmZpZy5vcHRpb25zLnVybHMsXG4gICAgICAgIG9yaWdpbnM6IHBhY2thZ2VDb25maWcub3B0aW9ucy5vcmlnaW5zLFxuICAgICAgICBsaW5lQ2hhclBvc2l0aW9uczogdHJ1ZSxcbiAgICAgICAgY2FzZUluc2Vuc2l0aXZlOiBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuY2FzZUluc2Vuc2l0aXZlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkb2N1bWVudGF0aW9uKGZpbGUsIGVuZCkge1xuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG5cbiAgICAgIHF1ZXJ5OiB7XG5cbiAgICAgICAgdHlwZTogJ2RvY3VtZW50YXRpb24nLFxuICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVmcyhmaWxlLCBlbmQpIHtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICdyZWZzJyxcbiAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgZW5kOiBlbmRcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUZ1bGwoZWRpdG9yLCBlZGl0b3JNZXRhKSB7XG5cbiAgICBpZiAoZWRpdG9yTWV0YSkge1xuXG4gICAgICBlZGl0b3JNZXRhLmRpZmZzID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7IGZpbGVzOiBbe1xuXG4gICAgICB0eXBlOiAnZnVsbCcsXG4gICAgICBuYW1lOiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZWRpdG9yLmdldFVSSSgpKVsxXSxcbiAgICAgIHRleHQ6IGVkaXRvci5nZXRUZXh0KClcbiAgICB9XX0pO1xuICB9XG5cbiAgdXBkYXRlUGFydChlZGl0b3IsIGVkaXRvck1ldGEsIHN0YXJ0LCB0ZXh0KSB7XG5cbiAgICBpZiAoZWRpdG9yTWV0YSkge1xuXG4gICAgICBlZGl0b3JNZXRhLmRpZmZzID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCBbe1xuXG4gICAgICB0eXBlOiAnZnVsbCcsXG4gICAgICBuYW1lOiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZWRpdG9yLmdldFVSSSgpKVsxXSxcbiAgICAgIG9mZnNldDoge1xuXG4gICAgICAgIGxpbmU6IHN0YXJ0LFxuICAgICAgICBjaDogMFxuICAgICAgfSxcbiAgICAgIHRleHQ6IGVkaXRvci5nZXRUZXh0KClcbiAgICB9XSk7XG4gIH1cblxuICB1cGRhdGUoZWRpdG9yKSB7XG5cbiAgICBjb25zdCBlZGl0b3JNZXRhID0gbWFuYWdlci5nZXRFZGl0b3IoZWRpdG9yKTtcbiAgICBjb25zdCBmaWxlID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV0ucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBmaWxlIGlzIGV4Y2x1ZGVkIHZpYSBkb250TG9hZFxuICAgIGlmIChcbiAgICAgIG1hbmFnZXIuc2VydmVyICYmXG4gICAgICBtYW5hZ2VyLnNlcnZlci5kb250TG9hZChmaWxlKVxuICAgICkge1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiB0aGUgZmlsZSBpcyByZWdpc3RlcmVkLCBlbHNlIHJldHVyblxuICAgIHJldHVybiB0aGlzLmZpbGVzKCkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICBpZiAoZGF0YS5maWxlcykge1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5maWxlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgZGF0YS5maWxlc1tpXSA9IGRhdGEuZmlsZXNbaV0ucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlZ2lzdGVyZWQgPSBkYXRhLmZpbGVzICYmIGRhdGEuZmlsZXMuaW5kZXhPZihmaWxlKSA+IC0xO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGVkaXRvck1ldGEgJiZcbiAgICAgICAgZWRpdG9yTWV0YS5kaWZmcy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgcmVnaXN0ZXJlZFxuICAgICAgKSB7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWdpc3RlcmVkKSB7XG5cbiAgICAgICAgLy8gY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgICAvLyBpZiBidWZmZXIuZ2V0TWF4Q2hhcmFjdGVySW5kZXgoKSA+IDUwMDBcbiAgICAgICAgLy8gICBzdGFydCA9IDBcbiAgICAgICAgLy8gICBlbmQgPSAwXG4gICAgICAgIC8vICAgdGV4dCA9ICcnXG4gICAgICAgIC8vICAgZm9yIGRpZmYgaW4gZWRpdG9yTWV0YS5kaWZmc1xuICAgICAgICAvLyAgICAgc3RhcnQgPSBNYXRoLm1heCgwLCBkaWZmLm9sZFJhbmdlLnN0YXJ0LnJvdyAtIDUwKVxuICAgICAgICAvLyAgICAgZW5kID0gTWF0aC5taW4oYnVmZmVyLmdldExpbmVDb3VudCgpLCBkaWZmLm9sZFJhbmdlLmVuZC5yb3cgKyA1KVxuICAgICAgICAvLyAgICAgdGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbW3N0YXJ0LCAwXSwgW2VuZCwgYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3coZW5kKV1dKVxuICAgICAgICAvLyAgIHByb21pc2UgPSB0aGlzLnVwZGF0ZVBhcnQoZWRpdG9yLCBlZGl0b3JNZXRhLCBzdGFydCwgdGV4dClcbiAgICAgICAgLy8gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVGdWxsKGVkaXRvciwgZWRpdG9yTWV0YSk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuXG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSk7XG4gIH1cblxuICByZW5hbWUoZmlsZSwgZW5kLCBuZXdOYW1lKSB7XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAncmVuYW1lJyxcbiAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIG5ld05hbWU6IG5ld05hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHR5cGUoZWRpdG9yLCBwb3NpdGlvbikge1xuXG4gICAgY29uc3QgZmlsZSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0VVJJKCkpWzFdO1xuICAgIGNvbnN0IGVuZCA9IHtcblxuICAgICAgbGluZTogcG9zaXRpb24ucm93LFxuICAgICAgY2g6IHBvc2l0aW9uLmNvbHVtblxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdxdWVyeScsIHtcblxuICAgICAgcXVlcnk6IHtcblxuICAgICAgICB0eXBlOiAndHlwZScsXG4gICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgIGVuZDogZW5kLFxuICAgICAgICBwcmVmZXJGdW5jdGlvbjogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGVmaW5pdGlvbigpIHtcblxuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgY29uc3QgW3Byb2plY3QsIGZpbGVdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSk7XG4gICAgY29uc3QgZW5kID0ge1xuXG4gICAgICBsaW5lOiBwb3NpdGlvbi5yb3csXG4gICAgICBjaDogcG9zaXRpb24uY29sdW1uXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICdkZWZpbml0aW9uJyxcbiAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgZW5kOiBlbmRcbiAgICAgIH1cblxuICAgIH0pLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgaWYgKGRhdGEgJiYgZGF0YS5zdGFydCkge1xuXG4gICAgICAgIGlmIChuYXZpZ2F0aW9uLnNldChkYXRhKSkge1xuXG4gICAgICAgICAgb3BlbkZpbGVBbmRHb1RvKGRhdGEuc3RhcnQsIGAke3Byb2plY3R9LyR7ZGF0YS5maWxlfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuXG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSk7XG4gIH1cblxuICBnZXREZWZpbml0aW9uKGZpbGUsIHJhbmdlKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdCgncXVlcnknLCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICB0eXBlOiAnZGVmaW5pdGlvbicsXG4gICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgbGluZTogcmFuZ2Uuc3RhcnQucm93LFxuICAgICAgICAgIGNoOiByYW5nZS5zdGFydC5jb2x1bW5cbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiB7XG4gICAgICAgICAgbGluZTogcmFuZ2UuZW5kLnJvdyxcbiAgICAgICAgICBjaDogcmFuZ2UuZW5kLmNvbHVtblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmaWxlcygpIHtcblxuICAgIHJldHVybiB0aGlzLnBvc3QoJ3F1ZXJ5Jywge1xuXG4gICAgICBxdWVyeToge1xuXG4gICAgICAgIHR5cGU6ICdmaWxlcydcbiAgICAgIH1cblxuICAgIH0pLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBwb3N0KHR5cGUsIGRhdGEpIHtcblxuICAgIGNvbnN0IHByb21pc2UgPSBtYW5hZ2VyLnNlcnZlci5yZXF1ZXN0KHR5cGUsIGRhdGEpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbn1cbiJdfQ==