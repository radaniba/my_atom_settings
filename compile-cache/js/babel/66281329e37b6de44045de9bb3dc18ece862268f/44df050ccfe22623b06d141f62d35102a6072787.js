Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _pathwatcher = require('pathwatcher');

var _pathwatcher2 = _interopRequireDefault(_pathwatcher);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _notebookCell = require('./notebook-cell');

var _notebookCell2 = _interopRequireDefault(_notebookCell);

'use babel';

var NotebookEditorView = (function (_React$Component) {
  _inherits(NotebookEditorView, _React$Component);

  function NotebookEditorView(props) {
    var _this = this;

    _classCallCheck(this, NotebookEditorView);

    _get(Object.getPrototypeOf(NotebookEditorView.prototype), 'constructor', this).call(this, props);

    this._fetchState = function () {
      // console.log('fetching NE state');
      if (_this.store !== undefined) {
        return _this.store.getState();
      } else {
        return _immutable2['default'].Map();
      }
    };

    this._onChange = function () {
      var newState = _this._fetchState();
      // console.log('Setting state:', newState.toString());
      _this.setState({ data: newState });
    };

    this.state = {
      data: this.props.store.getState()
    };
    this.store = props.store;
    this.subscriptions = new _atom.CompositeDisposable();
    //TODO: remove these development handles
    global.editorView = this;
  }

  _createClass(NotebookEditorView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.subscriptions.add(this.store.addStateChangeListener(this._onChange));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {}
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      // console.log('notebookeditorview render called');
      var language = this.state.data.getIn(['metadata', 'language_info', 'name']);
      // console.log('Language:', language);
      var notebookCells = this.state.data.get('cells').map(function (cell) {
        cell = cell.set('language', language);
        return _react2['default'].createElement(_notebookCell2['default'], {
          data: cell,
          key: cell.getIn(['metadata', 'id']),
          language: language
        });
      });
      return _react2['default'].createElement(
        'div',
        { className: 'notebook-editor' },
        _react2['default'].createElement(
          'header',
          { className: 'notebook-toolbar' },
          _react2['default'].createElement('button', { className: 'btn icon inline-block-tight icon-plus add-cell', onClick: this.addCell }),
          _react2['default'].createElement(
            'div',
            { className: 'inline-block btn-group' },
            _react2['default'].createElement('button', { className: 'btn icon icon-playback-play', onClick: this.runActiveCell }),
            _react2['default'].createElement('button', { className: 'btn icon icon-primitive-square', onClick: this.interruptKernel })
          )
        ),
        _react2['default'].createElement(
          'div',
          { className: 'notebook-cells-container' },
          _react2['default'].createElement(
            'div',
            { className: 'redundant-cells-container' },
            notebookCells
          )
        )
      );
    }
  }, {
    key: 'addCell',
    value: function addCell() {
      Dispatcher.dispatch({
        actionType: Dispatcher.actions.add_cell
        // cellID: this.props.data.getIn(['metadata', 'id'])
      });
    }
  }, {
    key: 'runActiveCell',
    value: function runActiveCell() {
      Dispatcher.dispatch({
        actionType: Dispatcher.actions.run_active_cell
        // cellID: this.props.data.getIn(['metadata', 'id'])
      });
    }
  }, {
    key: 'interruptKernel',
    value: function interruptKernel() {
      Dispatcher.dispatch({
        actionType: Dispatcher.actions.interrupt_kernel
        // cellID: this.props.data.getIn(['metadata', 'id'])
      });
    }
  }]);

  return NotebookEditorView;
})(_react2['default'].Component);

exports['default'] = NotebookEditorView;
module.exports = exports['default'];

// private onChange handler for use in callbacks

// set the initial state
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvbm90ZWJvb2stZWRpdG9yLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7c0JBQ1IsU0FBUzs7OzsyQkFDUCxhQUFhOzs7O3FCQUNaLE9BQU87Ozs7eUJBQ0gsV0FBVzs7OztvQkFDQyxNQUFNOztpQ0FDWixzQkFBc0I7OzRCQUN6QixpQkFBaUI7Ozs7QUFUMUMsV0FBVyxDQUFDOztJQVdTLGtCQUFrQjtZQUFsQixrQkFBa0I7O0FBRTFCLFdBRlEsa0JBQWtCLENBRXpCLEtBQUssRUFBRTs7OzBCQUZBLGtCQUFrQjs7QUFHbkMsK0JBSGlCLGtCQUFrQiw2Q0FHN0IsS0FBSyxFQUFFOztTQXdFZixXQUFXLEdBQUcsWUFBTTs7QUFFbEIsVUFBSSxNQUFLLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDNUIsZUFBTyxNQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUM5QixNQUFNO0FBQ0wsZUFBTyx1QkFBVSxHQUFHLEVBQUUsQ0FBQztPQUN4QjtLQUNGOztTQUdELFNBQVMsR0FBRyxZQUFNO0FBQ2hCLFVBQUksUUFBUSxHQUFHLE1BQUssV0FBVyxFQUFFLENBQUM7O0FBRWxDLFlBQUssUUFBUSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDakM7O1NBR0QsS0FBSyxHQUFHO0FBQ04sVUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUNsQztBQTFGQyxRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQzs7QUFFL0MsVUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7R0FDMUI7O2VBUmtCLGtCQUFrQjs7V0FVcEIsNkJBQUc7QUFDbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUMzRTs7O1dBRWlCLDRCQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFFeEM7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7V0FFSyxrQkFBRzs7QUFFUCxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0FBRTVFLFVBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDN0QsWUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RDLGVBQ0U7QUFDRSxjQUFJLEVBQUUsSUFBSSxBQUFDO0FBQ1gsYUFBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQUFBQztBQUNwQyxrQkFBUSxFQUFFLFFBQVEsQUFBQztVQUNuQixDQUNGO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsYUFDRTs7VUFBSyxTQUFTLEVBQUMsaUJBQWlCO1FBQzlCOztZQUFRLFNBQVMsRUFBQyxrQkFBa0I7VUFDbEMsNkNBQVEsU0FBUyxFQUFDLGdEQUFnRCxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxBQUFDLEdBQVU7VUFDbkc7O2NBQUssU0FBUyxFQUFDLHdCQUF3QjtZQUNyQyw2Q0FBUSxTQUFTLEVBQUMsNkJBQTZCLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUMsR0FBVTtZQUN0Riw2Q0FBUSxTQUFTLEVBQUMsZ0NBQWdDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUMsR0FBVTtXQUN2RjtTQUNDO1FBQ1Q7O1lBQUssU0FBUyxFQUFDLDBCQUEwQjtVQUN2Qzs7Y0FBSyxTQUFTLEVBQUMsMkJBQTJCO1lBQ3ZDLGFBQWE7V0FDVjtTQUNGO09BQ0YsQ0FDTjtLQUNIOzs7V0FFTSxtQkFBRztBQUNSLGdCQUFVLENBQUMsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFROztPQUV4QyxDQUFDLENBQUM7S0FDSjs7O1dBRVkseUJBQUc7QUFDZCxnQkFBVSxDQUFDLFFBQVEsQ0FBQztBQUNsQixrQkFBVSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsZUFBZTs7T0FFL0MsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLDJCQUFHO0FBQ2hCLGdCQUFVLENBQUMsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0I7O09BRWhELENBQUMsQ0FBQztLQUNKOzs7U0F6RWtCLGtCQUFrQjtHQUFTLG1CQUFNLFNBQVM7O3FCQUExQyxrQkFBa0IiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qdXB5dGVyLW5vdGVib29rL2xpYi9ub3RlYm9vay1lZGl0b3Itdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCBGaWxlIGZyb20gJ3BhdGh3YXRjaGVyJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHskLCBTY3JvbGxWaWV3fSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgTm90ZWJvb2tDZWxsIGZyb20gJy4vbm90ZWJvb2stY2VsbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdGVib29rRWRpdG9yVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdG9yZSA9IHByb3BzLnN0b3JlO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy9UT0RPOiByZW1vdmUgdGhlc2UgZGV2ZWxvcG1lbnQgaGFuZGxlc1xuICAgIGdsb2JhbC5lZGl0b3JWaWV3ID0gdGhpcztcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdG9yZS5hZGRTdGF0ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcblxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnbm90ZWJvb2tlZGl0b3J2aWV3IHJlbmRlciBjYWxsZWQnKTtcbiAgICBsZXQgbGFuZ3VhZ2UgPSB0aGlzLnN0YXRlLmRhdGEuZ2V0SW4oWydtZXRhZGF0YScsICdsYW5ndWFnZV9pbmZvJywgJ25hbWUnXSk7XG4gICAgLy8gY29uc29sZS5sb2coJ0xhbmd1YWdlOicsIGxhbmd1YWdlKTtcbiAgICBsZXQgbm90ZWJvb2tDZWxscyA9IHRoaXMuc3RhdGUuZGF0YS5nZXQoJ2NlbGxzJykubWFwKChjZWxsKSA9PiB7XG4gICAgICBjZWxsID0gY2VsbC5zZXQoJ2xhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPE5vdGVib29rQ2VsbFxuICAgICAgICAgIGRhdGE9e2NlbGx9XG4gICAgICAgICAga2V5PXtjZWxsLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSl9XG4gICAgICAgICAgbGFuZ3VhZ2U9e2xhbmd1YWdlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJub3RlYm9vay1lZGl0b3JcIj5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJub3RlYm9vay10b29sYmFyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gaWNvbiBpbmxpbmUtYmxvY2stdGlnaHQgaWNvbi1wbHVzIGFkZC1jZWxsXCIgb25DbGljaz17dGhpcy5hZGRDZWxsfT48L2J1dHRvbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0naW5saW5lLWJsb2NrIGJ0bi1ncm91cCc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi1wbGF5YmFjay1wbGF5JyBvbkNsaWNrPXt0aGlzLnJ1bkFjdGl2ZUNlbGx9PjwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBpY29uIGljb24tcHJpbWl0aXZlLXNxdWFyZScgb25DbGljaz17dGhpcy5pbnRlcnJ1cHRLZXJuZWx9PjwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJub3RlYm9vay1jZWxscy1jb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlZHVuZGFudC1jZWxscy1jb250YWluZXJcIj5cbiAgICAgICAgICAgIHtub3RlYm9va0NlbGxzfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBhZGRDZWxsKCkge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLmFkZF9jZWxsXG4gICAgICAvLyBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pXG4gICAgfSk7XG4gIH1cblxuICBydW5BY3RpdmVDZWxsKCkge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLnJ1bl9hY3RpdmVfY2VsbFxuICAgICAgLy8gY2VsbElEOiB0aGlzLnByb3BzLmRhdGEuZ2V0SW4oWydtZXRhZGF0YScsICdpZCddKVxuICAgIH0pO1xuICB9XG5cbiAgaW50ZXJydXB0S2VybmVsKCkge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLmludGVycnVwdF9rZXJuZWxcbiAgICAgIC8vIGNlbGxJRDogdGhpcy5wcm9wcy5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSlcbiAgICB9KTtcbiAgfVxuXG4gIF9mZXRjaFN0YXRlID0gKCkgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKCdmZXRjaGluZyBORSBzdGF0ZScpO1xuICAgIGlmICh0aGlzLnN0b3JlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBJbW11dGFibGUuTWFwKCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIHByaXZhdGUgb25DaGFuZ2UgaGFuZGxlciBmb3IgdXNlIGluIGNhbGxiYWNrc1xuICBfb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgbGV0IG5ld1N0YXRlID0gdGhpcy5fZmV0Y2hTdGF0ZSgpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdTZXR0aW5nIHN0YXRlOicsIG5ld1N0YXRlLnRvU3RyaW5nKCkpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RhdGE6IG5ld1N0YXRlfSk7XG4gIH07XG5cbiAgLy8gc2V0IHRoZSBpbml0aWFsIHN0YXRlXG4gIHN0YXRlID0ge1xuICAgIGRhdGE6IHRoaXMucHJvcHMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9O1xuXG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/notebook-editor-view.js
