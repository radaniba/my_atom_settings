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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRWtCLE9BQU87Ozs7d0JBQ0osV0FBVzs7OztvQkFDRSxNQUFNOztvQkFDVixNQUFNOzs7OzBCQUNiLGNBQWM7Ozs7OEJBQ1YsbUJBQW1COzs7O2tDQUNmLHdCQUF3Qjs7OztBQVJ2RCxXQUFXLENBQUM7O3FCQVVHOztBQUViLFFBQU0sRUFBRTtBQUNOLGVBQVcsRUFBRTtBQUNYLFdBQUssRUFBRSx3QkFBd0I7QUFDL0IsaUJBQVcsRUFBRSxFQUFFO0FBQ2YsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxlQUFlO0tBQ3pCO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRTs7QUFFZCxXQUFPLEVBQUUsQ0FBQztBQUNWLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxRCxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1RyxRQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN6QixzQkFBZ0IsNkJBQWdCO0FBQ2hDLGdCQUFVLEVBQUUsb0JBQUEsS0FBSyxFQUFJO0FBQ25CLFlBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkMsVUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNyQyxZQUFJLGFBQWEsR0FBRyxzQkFBUyxNQUFNLENBQ2pDLG9FQUFvQixLQUFLLEVBQUUsS0FBSyxBQUFDLEdBQUcsRUFDcEMsRUFBRSxDQUFDLENBQUM7QUFDTixlQUFPLEVBQUUsQ0FBQztPQUNYO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsNEJBQVcsUUFBUSxDQUFDO0FBQ2xCLGdCQUFVLEVBQUUsd0JBQVcsT0FBTyxDQUFDLE9BQU87S0FDdkMsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDekI7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsV0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ2hELFFBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUMvQixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDL0IsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUMvQjtHQUNGOztBQUVELEtBQUcsRUFBQSxlQUFHOztBQUVKLDRCQUFXLFFBQVEsQ0FBQztBQUNsQixnQkFBVSxFQUFFLHdCQUFXLE9BQU8sQ0FBQyxlQUFlOztLQUUvQyxDQUFDLENBQUM7R0FDSjs7Q0FFRjs7QUFFRCxTQUFTLE9BQU8sR0FBRztBQUNqQixNQUFJLFlBQVksR0FBRyxDQUNqQixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLE1BQU0sRUFDTixpQkFBaUIsRUFDakIsV0FBVyxFQUNYLE9BQU8sRUFDUCxxQkFBcUIsQ0FDdEIsQ0FBQztBQUNGLE1BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDbEUsTUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdFLE1BQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7QUFDakMsV0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxpQkFBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUs7QUFDNUUsVUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO2VBQUksSUFBSSxLQUFLLElBQUk7T0FBQSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRCxhQUFPLE1BQU0sQ0FBQztLQUNmLEVBQUUsWUFBWSxDQUFDLENBQUMsSUFBSSxpQkFBVyxDQUFDO0dBQ2xDO0NBQ0Y7O0FBRUQsU0FBUyxPQUFPLENBQUMsU0FBUyxFQUFFO0FBQzFCLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0QyxNQUFJLFlBQVksR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDekQsTUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBQSxTQUFTO1dBQUksU0FBUyxLQUFLLFlBQVk7R0FBQSxDQUFDLEVBQUUsT0FBTyxnQ0FBbUIsU0FBUyxDQUFDLENBQUM7Q0FDNUciLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qdXB5dGVyLW5vdGVib29rL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgcGF0aCwge2RlbGltaXRlcn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IE5vdGVib29rRWRpdG9yIGZyb20gJy4vbm90ZWJvb2stZWRpdG9yJztcbmltcG9ydCBOb3RlYm9va0VkaXRvclZpZXcgZnJvbSAnLi9ub3RlYm9vay1lZGl0b3Itdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBjb25maWc6IHtcbiAgICBqdXB5dGVyUGF0aDoge1xuICAgICAgdGl0bGU6ICdQYXRoIHRvIGp1cHl0ZXIgYmluYXJ5JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ3Vzci9sb2NhbC9iaW4nXG4gICAgfVxuICB9LFxuXG4gIGFjdGl2YXRlKHN0YXRlKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ0FjdGl2YXRlZCcpO1xuICAgIGZpeFBhdGgoKTtcbiAgICB0aGlzLm9wZW5lckRpc3Bvc2FibGUgPSBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIob3BlblVSSSk7XG4gICAgdGhpcy5jb21tYW5kcyA9IGF0b20uY29tbWFuZHMuYWRkKCcubm90ZWJvb2stY2VsbCBhdG9tLXRleHQtZWRpdG9yJywgJ2p1cHl0ZXItbm90ZWJvb2stYXRvbTpydW4nLCB0aGlzLnJ1bik7XG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoe1xuICAgICAgbW9kZWxDb25zdHJ1Y3RvcjogTm90ZWJvb2tFZGl0b3IsXG4gICAgICBjcmVhdGVWaWV3OiBtb2RlbCA9PiB7XG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdub3RlYm9vay13cmFwcGVyJyk7XG4gICAgICAgIGxldCB2aWV3Q29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICAgIDxOb3RlYm9va0VkaXRvclZpZXcgc3RvcmU9e21vZGVsfSAvPixcbiAgICAgICAgICBlbCk7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLmRlc3Ryb3lcbiAgICB9KTtcbiAgICB0aGlzLm9wZW5lckRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIHRoaXMuY29tbWFuZHMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHRvZ2dsZSgpIHtcbiAgICBjb25zb2xlLmxvZygnSnVweXRlck5vdGVib29rQXRvbSB3YXMgdG9nZ2xlZCEnKTtcbiAgICBpZiAodGhpcy5tb2RhbFBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RhbFBhbmVsLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubW9kYWxQYW5lbC5zaG93KCk7XG4gICAgfVxuICB9LFxuXG4gIHJ1bigpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnUnVuIGNlbGwnKTtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5ydW5fYWN0aXZlX2NlbGxcbiAgICAgIC8vIGNlbGxJRDogdGhpcy5wcm9wcy5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSlcbiAgICB9KTtcbiAgfVxuXG59O1xuXG5mdW5jdGlvbiBmaXhQYXRoKCkge1xuICBsZXQgZGVmYXVsdFBhdGhzID0gW1xuICAgICcvdXNyL2xvY2FsL2JpbicsXG4gICAgJy91c3IvYmluJyxcbiAgICAnL2JpbicsXG4gICAgJy91c3IvbG9jYWwvc2JpbicsXG4gICAgJy91c3Ivc2JpbicsXG4gICAgJy9zYmluJyxcbiAgICAnLi9ub2RlX21vZHVsZXMvLmJpbidcbiAgXTtcbiAgbGV0IGp1cHl0ZXJQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdqdXB5dGVyLW5vdGVib29rLmp1cHl0ZXJQYXRoJyk7XG4gIGlmIChkZWZhdWx0UGF0aHMuaW5kZXhPZihqdXB5dGVyUGF0aCkgPCAwKSBkZWZhdWx0UGF0aHMudW5zaGlmdChqdXB5dGVyUGF0aCk7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIHByb2Nlc3MuZW52LlBBVEggPSBwcm9jZXNzLmVudi5QQVRILnNwbGl0KGRlbGltaXRlcikucmVkdWNlKChyZXN1bHQsIHBhdGgpID0+IHtcbiAgICAgIGlmICghcmVzdWx0LmZpbmQoaXRlbSA9PiBpdGVtID09PSBwYXRoKSkgcmVzdWx0LnB1c2gocGF0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIGRlZmF1bHRQYXRocykuam9pbihkZWxpbWl0ZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5VUkkodXJpVG9PcGVuKSB7XG4gIGNvbnN0IG5vdGVib29rRXh0ZW5zaW9ucyA9IFsnLmlweW5iJ107XG4gIGxldCB1cmlFeHRlbnNpb24gPSBwYXRoLmV4dG5hbWUodXJpVG9PcGVuKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAobm90ZWJvb2tFeHRlbnNpb25zLmZpbmQoZXh0ZW5zaW9uID0+IGV4dGVuc2lvbiA9PT0gdXJpRXh0ZW5zaW9uKSkgcmV0dXJuIG5ldyBOb3RlYm9va0VkaXRvcih1cmlUb09wZW4pO1xufVxuIl19
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/main.js
