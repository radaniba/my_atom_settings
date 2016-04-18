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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9ub3RlYm9vay1lZGl0b3Itdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztzQkFDUixTQUFTOzs7OzJCQUNQLGFBQWE7Ozs7cUJBQ1osT0FBTzs7Ozt5QkFDSCxXQUFXOzs7O29CQUNDLE1BQU07O2lDQUNaLHNCQUFzQjs7NEJBQ3pCLGlCQUFpQjs7OztBQVQxQyxXQUFXLENBQUM7O0lBV1Msa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFFMUIsV0FGUSxrQkFBa0IsQ0FFekIsS0FBSyxFQUFFOzs7MEJBRkEsa0JBQWtCOztBQUduQywrQkFIaUIsa0JBQWtCLDZDQUc3QixLQUFLLEVBQUU7O1NBd0VmLFdBQVcsR0FBRyxZQUFNOztBQUVsQixVQUFJLE1BQUssS0FBSyxLQUFLLFNBQVMsRUFBRTtBQUM1QixlQUFPLE1BQUssS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQzlCLE1BQU07QUFDTCxlQUFPLHVCQUFVLEdBQUcsRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7O1NBR0QsU0FBUyxHQUFHLFlBQU07QUFDaEIsVUFBSSxRQUFRLEdBQUcsTUFBSyxXQUFXLEVBQUUsQ0FBQzs7QUFFbEMsWUFBSyxRQUFRLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUNqQzs7U0FHRCxLQUFLLEdBQUc7QUFDTixVQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0tBQ2xDO0FBMUZDLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN6QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDOztBQUUvQyxVQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztHQUMxQjs7ZUFSa0Isa0JBQWtCOztXQVVwQiw2QkFBRztBQUNsQixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQzNFOzs7V0FFaUIsNEJBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUV4Qzs7O1dBRW1CLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDOUI7OztXQUVLLGtCQUFHOztBQUVQLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFNUUsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBSztBQUM3RCxZQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEMsZUFDRTtBQUNFLGNBQUksRUFBRSxJQUFJLEFBQUM7QUFDWCxhQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxBQUFDO0FBQ3BDLGtCQUFRLEVBQUUsUUFBUSxBQUFDO1VBQ25CLENBQ0Y7T0FDSCxDQUFDLENBQUM7QUFDSCxhQUNFOztVQUFLLFNBQVMsRUFBQyxpQkFBaUI7UUFDOUI7O1lBQVEsU0FBUyxFQUFDLGtCQUFrQjtVQUNsQyw2Q0FBUSxTQUFTLEVBQUMsZ0RBQWdELEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEFBQUMsR0FBVTtVQUNuRzs7Y0FBSyxTQUFTLEVBQUMsd0JBQXdCO1lBQ3JDLDZDQUFRLFNBQVMsRUFBQyw2QkFBNkIsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQyxHQUFVO1lBQ3RGLDZDQUFRLFNBQVMsRUFBQyxnQ0FBZ0MsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQyxHQUFVO1dBQ3ZGO1NBQ0M7UUFDVDs7WUFBSyxTQUFTLEVBQUMsMEJBQTBCO1VBQ3ZDOztjQUFLLFNBQVMsRUFBQywyQkFBMkI7WUFDdkMsYUFBYTtXQUNWO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztXQUVNLG1CQUFHO0FBQ1IsZ0JBQVUsQ0FBQyxRQUFRLENBQUM7QUFDbEIsa0JBQVUsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVE7O09BRXhDLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx5QkFBRztBQUNkLGdCQUFVLENBQUMsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxlQUFlOztPQUUvQyxDQUFDLENBQUM7S0FDSjs7O1dBRWMsMkJBQUc7QUFDaEIsZ0JBQVUsQ0FBQyxRQUFRLENBQUM7QUFDbEIsa0JBQVUsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQjs7T0FFaEQsQ0FBQyxDQUFDO0tBQ0o7OztTQXpFa0Isa0JBQWtCO0dBQVMsbUJBQU0sU0FBUzs7cUJBQTFDLGtCQUFrQiIsImZpbGUiOiIvVXNlcnMvUmFkL0RvY3VtZW50cy9EZXYvYXRvbS1ub3RlYm9vay9saWIvbm90ZWJvb2stZWRpdG9yLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgRmlsZSBmcm9tICdwYXRod2F0Y2hlcic7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7JCwgU2Nyb2xsVmlld30gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IE5vdGVib29rQ2VsbCBmcm9tICcuL25vdGVib29rLWNlbGwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3RlYm9va0VkaXRvclZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RvcmUgPSBwcm9wcy5zdG9yZTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vVE9ETzogcmVtb3ZlIHRoZXNlIGRldmVsb3BtZW50IGhhbmRsZXNcbiAgICBnbG9iYWwuZWRpdG9yVmlldyA9IHRoaXM7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3RvcmUuYWRkU3RhdGVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSkpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG5cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ25vdGVib29rZWRpdG9ydmlldyByZW5kZXIgY2FsbGVkJyk7XG4gICAgbGV0IGxhbmd1YWdlID0gdGhpcy5zdGF0ZS5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnbGFuZ3VhZ2VfaW5mbycsICduYW1lJ10pO1xuICAgIC8vIGNvbnNvbGUubG9nKCdMYW5ndWFnZTonLCBsYW5ndWFnZSk7XG4gICAgbGV0IG5vdGVib29rQ2VsbHMgPSB0aGlzLnN0YXRlLmRhdGEuZ2V0KCdjZWxscycpLm1hcCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbCA9IGNlbGwuc2V0KCdsYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxOb3RlYm9va0NlbGxcbiAgICAgICAgICBkYXRhPXtjZWxsfVxuICAgICAgICAgIGtleT17Y2VsbC5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pfVxuICAgICAgICAgIGxhbmd1YWdlPXtsYW5ndWFnZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibm90ZWJvb2stZWRpdG9yXCI+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwibm90ZWJvb2stdG9vbGJhclwiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGljb24gaW5saW5lLWJsb2NrLXRpZ2h0IGljb24tcGx1cyBhZGQtY2VsbFwiIG9uQ2xpY2s9e3RoaXMuYWRkQ2VsbH0+PC9idXR0b24+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2lubGluZS1ibG9jayBidG4tZ3JvdXAnPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBpY29uIGljb24tcGxheWJhY2stcGxheScgb25DbGljaz17dGhpcy5ydW5BY3RpdmVDZWxsfT48L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gaWNvbiBpY29uLXByaW1pdGl2ZS1zcXVhcmUnIG9uQ2xpY2s9e3RoaXMuaW50ZXJydXB0S2VybmVsfT48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibm90ZWJvb2stY2VsbHMtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWR1bmRhbnQtY2VsbHMtY29udGFpbmVyXCI+XG4gICAgICAgICAgICB7bm90ZWJvb2tDZWxsc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgYWRkQ2VsbCgpIHtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5hZGRfY2VsbFxuICAgICAgLy8gY2VsbElEOiB0aGlzLnByb3BzLmRhdGEuZ2V0SW4oWydtZXRhZGF0YScsICdpZCddKVxuICAgIH0pO1xuICB9XG5cbiAgcnVuQWN0aXZlQ2VsbCgpIHtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5ydW5fYWN0aXZlX2NlbGxcbiAgICAgIC8vIGNlbGxJRDogdGhpcy5wcm9wcy5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSlcbiAgICB9KTtcbiAgfVxuXG4gIGludGVycnVwdEtlcm5lbCgpIHtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5pbnRlcnJ1cHRfa2VybmVsXG4gICAgICAvLyBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pXG4gICAgfSk7XG4gIH1cblxuICBfZmV0Y2hTdGF0ZSA9ICgpID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZygnZmV0Y2hpbmcgTkUgc3RhdGUnKTtcbiAgICBpZiAodGhpcy5zdG9yZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gSW1tdXRhYmxlLk1hcCgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBwcml2YXRlIG9uQ2hhbmdlIGhhbmRsZXIgZm9yIHVzZSBpbiBjYWxsYmFja3NcbiAgX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgIGxldCBuZXdTdGF0ZSA9IHRoaXMuX2ZldGNoU3RhdGUoKTtcbiAgICAvLyBjb25zb2xlLmxvZygnU2V0dGluZyBzdGF0ZTonLCBuZXdTdGF0ZS50b1N0cmluZygpKTtcbiAgICB0aGlzLnNldFN0YXRlKHtkYXRhOiBuZXdTdGF0ZX0pO1xuICB9O1xuXG4gIC8vIHNldCB0aGUgaW5pdGlhbCBzdGF0ZVxuICBzdGF0ZSA9IHtcbiAgICBkYXRhOiB0aGlzLnByb3BzLnN0b3JlLmdldFN0YXRlKClcbiAgfTtcblxufVxuIl19
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/notebook-editor-view.js
