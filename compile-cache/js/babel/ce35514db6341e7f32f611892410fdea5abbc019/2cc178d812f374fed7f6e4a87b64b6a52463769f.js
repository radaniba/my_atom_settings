Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _notebookEditor = require('./notebook-editor');

var _notebookEditor2 = _interopRequireDefault(_notebookEditor);

var _notebookEditorView = require('./notebook-editor-view');

var _notebookEditorView2 = _interopRequireDefault(_notebookEditorView);

'use babel';

exports['default'] = {

  config: {
    jupyterPath: {
      title: 'Path to jupyter binary',
      description: '',
      type: 'string',
      'default': 'usr/local/bin'
    }
  },

  activate: function activate(state) {
    // console.log('Activated');
    fixPath();
    this.openerDisposable = atom.workspace.addOpener(openURI);
    this.commands = atom.commands.add('.notebook-cell atom-text-editor', 'jupyter-notebook-atom:run', this.run);
    atom.views.addViewProvider({
      modelConstructor: _notebookEditor2['default'],
      createView: function createView(model) {
        var el = document.createElement('div');
        el.classList.add('notebook-wrapper');
        var viewComponent = _reactDom2['default'].render(_react2['default'].createElement(_notebookEditorView2['default'], { store: model }), el);
        return el;
      }
    });
  },

  deactivate: function deactivate() {
    _dispatcher2['default'].dispatch({
      actionType: _dispatcher2['default'].actions.destroy
    });
    this.openerDisposable.dispose();
    this.commands.dispose();
  },

  toggle: function toggle() {
    console.log('JupyterNotebookAtom was toggled!');
    if (this.modalPanel.isVisible()) {
      return this.modalPanel.hide();
    } else {
      return this.modalPanel.show();
    }
  },

  run: function run() {
    // console.log('Run cell');
    _dispatcher2['default'].dispatch({
      actionType: _dispatcher2['default'].actions.run_active_cell
      // cellID: this.props.data.getIn(['metadata', 'id'])
    });
  }

};

function fixPath() {
  var defaultPaths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/sbin', '/usr/sbin', '/sbin', './node_modules/.bin'];
  var jupyterPath = atom.config.get('jupyter-notebook.jupyterPath');
  if (defaultPaths.indexOf(jupyterPath) < 0) defaultPaths.unshift(jupyterPath);
  if (process.platform === 'darwin') {
    process.env.PATH = process.env.PATH.split(_path.delimiter).reduce(function (result, path) {
      if (!result.find(function (item) {
        return item === path;
      })) result.push(path);
      return result;
    }, defaultPaths).join(_path.delimiter);
  }
}

function openURI(uriToOpen) {
  var notebookExtensions = ['.ipynb'];
  var uriExtension = _path2['default'].extname(uriToOpen).toLowerCase();
  if (notebookExtensions.find(function (extension) {
    return extension === uriExtension;
  })) return new _notebookEditor2['default'](uriToOpen);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztxQkFFa0IsT0FBTzs7Ozt3QkFDSixXQUFXOzs7O29CQUNFLE1BQU07O29CQUNWLE1BQU07Ozs7MEJBQ2IsY0FBYzs7Ozs4QkFDVixtQkFBbUI7Ozs7a0NBQ2Ysd0JBQXdCOzs7O0FBUnZELFdBQVcsQ0FBQzs7cUJBVUc7O0FBRWIsUUFBTSxFQUFFO0FBQ04sZUFBVyxFQUFFO0FBQ1gsV0FBSyxFQUFFLHdCQUF3QjtBQUMvQixpQkFBVyxFQUFFLEVBQUU7QUFDZixVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLGVBQWU7S0FDekI7R0FDRjs7QUFFRCxVQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFOztBQUVkLFdBQU8sRUFBRSxDQUFDO0FBQ1YsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVHLFFBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ3pCLHNCQUFnQiw2QkFBZ0I7QUFDaEMsZ0JBQVUsRUFBRSxvQkFBQSxLQUFLLEVBQUk7QUFDbkIsWUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QyxVQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JDLFlBQUksYUFBYSxHQUFHLHNCQUFTLE1BQU0sQ0FDakMsb0VBQW9CLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxFQUNwQyxFQUFFLENBQUMsQ0FBQztBQUNOLGVBQU8sRUFBRSxDQUFDO09BQ1g7S0FDRixDQUFDLENBQUM7R0FDSjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCw0QkFBVyxRQUFRLENBQUM7QUFDbEIsZ0JBQVUsRUFBRSx3QkFBVyxPQUFPLENBQUMsT0FBTztLQUN2QyxDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUN6Qjs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7QUFDUCxXQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFDaEQsUUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQy9CLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUMvQixNQUFNO0FBQ0wsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7O0FBRUQsS0FBRyxFQUFBLGVBQUc7O0FBRUosNEJBQVcsUUFBUSxDQUFDO0FBQ2xCLGdCQUFVLEVBQUUsd0JBQVcsT0FBTyxDQUFDLGVBQWU7O0tBRS9DLENBQUMsQ0FBQztHQUNKOztDQUVGOztBQUVELFNBQVMsT0FBTyxHQUFHO0FBQ2pCLE1BQUksWUFBWSxHQUFHLENBQ2pCLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixXQUFXLEVBQ1gsT0FBTyxFQUNQLHFCQUFxQixDQUN0QixDQUFDO0FBQ0YsTUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUNsRSxNQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0UsTUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUNqQyxXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLGlCQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLElBQUksRUFBSztBQUM1RSxVQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLEtBQUssSUFBSTtPQUFBLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELGFBQU8sTUFBTSxDQUFDO0tBQ2YsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLGlCQUFXLENBQUM7R0FDbEM7Q0FDRjs7QUFFRCxTQUFTLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDMUIsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RDLE1BQUksWUFBWSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN6RCxNQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7V0FBSSxTQUFTLEtBQUssWUFBWTtHQUFBLENBQUMsRUFBRSxPQUFPLGdDQUFtQixTQUFTLENBQUMsQ0FBQztDQUM1RyIsImZpbGUiOiIvVXNlcnMvUmFkL0RvY3VtZW50cy9EZXYvYXRvbS1ub3RlYm9vay9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHBhdGgsIHtkZWxpbWl0ZXJ9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyJztcbmltcG9ydCBOb3RlYm9va0VkaXRvciBmcm9tICcuL25vdGVib29rLWVkaXRvcic7XG5pbXBvcnQgTm90ZWJvb2tFZGl0b3JWaWV3IGZyb20gJy4vbm90ZWJvb2stZWRpdG9yLXZpZXcnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgY29uZmlnOiB7XG4gICAganVweXRlclBhdGg6IHtcbiAgICAgIHRpdGxlOiAnUGF0aCB0byBqdXB5dGVyIGJpbmFyeScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICd1c3IvbG9jYWwvYmluJ1xuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdBY3RpdmF0ZWQnKTtcbiAgICBmaXhQYXRoKCk7XG4gICAgdGhpcy5vcGVuZXJEaXNwb3NhYmxlID0gYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5VUkkpO1xuICAgIHRoaXMuY29tbWFuZHMgPSBhdG9tLmNvbW1hbmRzLmFkZCgnLm5vdGVib29rLWNlbGwgYXRvbS10ZXh0LWVkaXRvcicsICdqdXB5dGVyLW5vdGVib29rLWF0b206cnVuJywgdGhpcy5ydW4pO1xuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyKHtcbiAgICAgIG1vZGVsQ29uc3RydWN0b3I6IE5vdGVib29rRWRpdG9yLFxuICAgICAgY3JlYXRlVmlldzogbW9kZWwgPT4ge1xuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnbm90ZWJvb2std3JhcHBlcicpO1xuICAgICAgICBsZXQgdmlld0NvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgICA8Tm90ZWJvb2tFZGl0b3JWaWV3IHN0b3JlPXttb2RlbH0gLz4sXG4gICAgICAgICAgZWwpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5kZXN0cm95XG4gICAgfSk7XG4gICAgdGhpcy5vcGVuZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmNvbW1hbmRzLmRpc3Bvc2UoKTtcbiAgfSxcblxuICB0b2dnbGUoKSB7XG4gICAgY29uc29sZS5sb2coJ0p1cHl0ZXJOb3RlYm9va0F0b20gd2FzIHRvZ2dsZWQhJyk7XG4gICAgaWYgKHRoaXMubW9kYWxQYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMubW9kYWxQYW5lbC5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm1vZGFsUGFuZWwuc2hvdygpO1xuICAgIH1cbiAgfSxcblxuICBydW4oKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ1J1biBjZWxsJyk7XG4gICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBEaXNwYXRjaGVyLmFjdGlvbnMucnVuX2FjdGl2ZV9jZWxsXG4gICAgICAvLyBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pXG4gICAgfSk7XG4gIH1cblxufTtcblxuZnVuY3Rpb24gZml4UGF0aCgpIHtcbiAgbGV0IGRlZmF1bHRQYXRocyA9IFtcbiAgICAnL3Vzci9sb2NhbC9iaW4nLFxuICAgICcvdXNyL2JpbicsXG4gICAgJy9iaW4nLFxuICAgICcvdXNyL2xvY2FsL3NiaW4nLFxuICAgICcvdXNyL3NiaW4nLFxuICAgICcvc2JpbicsXG4gICAgJy4vbm9kZV9tb2R1bGVzLy5iaW4nXG4gIF07XG4gIGxldCBqdXB5dGVyUGF0aCA9IGF0b20uY29uZmlnLmdldCgnanVweXRlci1ub3RlYm9vay5qdXB5dGVyUGF0aCcpO1xuICBpZiAoZGVmYXVsdFBhdGhzLmluZGV4T2YoanVweXRlclBhdGgpIDwgMCkgZGVmYXVsdFBhdGhzLnVuc2hpZnQoanVweXRlclBhdGgpO1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBwcm9jZXNzLmVudi5QQVRIID0gcHJvY2Vzcy5lbnYuUEFUSC5zcGxpdChkZWxpbWl0ZXIpLnJlZHVjZSgocmVzdWx0LCBwYXRoKSA9PiB7XG4gICAgICBpZiAoIXJlc3VsdC5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gcGF0aCkpIHJlc3VsdC5wdXNoKHBhdGgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBkZWZhdWx0UGF0aHMpLmpvaW4oZGVsaW1pdGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuVVJJKHVyaVRvT3Blbikge1xuICBjb25zdCBub3RlYm9va0V4dGVuc2lvbnMgPSBbJy5pcHluYiddO1xuICBsZXQgdXJpRXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKHVyaVRvT3BlbikudG9Mb3dlckNhc2UoKTtcbiAgaWYgKG5vdGVib29rRXh0ZW5zaW9ucy5maW5kKGV4dGVuc2lvbiA9PiBleHRlbnNpb24gPT09IHVyaUV4dGVuc2lvbikpIHJldHVybiBuZXcgTm90ZWJvb2tFZGl0b3IodXJpVG9PcGVuKTtcbn1cbiJdfQ==
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/main.js
