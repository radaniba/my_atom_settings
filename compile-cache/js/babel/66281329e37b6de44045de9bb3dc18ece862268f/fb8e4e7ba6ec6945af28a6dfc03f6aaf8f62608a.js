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

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _displayArea = require('./display-area');

var _displayArea2 = _interopRequireDefault(_displayArea);

var _textEditor = require('./text-editor');

var _textEditor2 = _interopRequireDefault(_textEditor);

'use babel';

var NotebookCell = (function (_React$Component) {
  _inherits(NotebookCell, _React$Component);

  function NotebookCell(props) {
    var _this = this;

    _classCallCheck(this, NotebookCell);

    _get(Object.getPrototypeOf(NotebookCell.prototype), 'constructor', this).call(this, props);

    this.runCell = function () {
      _dispatcher2['default'].dispatch({
        actionType: _dispatcher2['default'].actions.run_cell,
        cellID: _this.props.data.getIn(['metadata', 'id'])
      });
    };
  }

  _createClass(NotebookCell, [{
    key: 'render',
    value: function render() {
      // console.log('Cell rendering.');
      var focusClass = '';
      if (this.props.data.getIn(['metadata', 'focus'])) focusClass = ' focused';
      return _react2['default'].createElement(
        'div',
        { className: 'notebook-cell' + focusClass, onFocus: this.triggerFocused.bind(this, true) },
        _react2['default'].createElement(
          'div',
          { className: 'execution-count-label' },
          'In [',
          this.props.data.get('execution_count') || ' ',
          ']:'
        ),
        _react2['default'].createElement(
          'div',
          { className: 'cell-main' },
          _react2['default'].createElement(_textEditor2['default'], { data: this.props.data, language: this.props.language }),
          _react2['default'].createElement(_displayArea2['default'], { data: this.props.data })
        )
      );
      // <button
      //   className="btn btn-primary icon icon-playback-play"
      //   onClick={this.runCell} >
      //   Run
      // </button>
    }
  }, {
    key: 'triggerFocused',
    value: function triggerFocused(isFocused) {
      _dispatcher2['default'].dispatch({
        actionType: _dispatcher2['default'].actions.cell_focus,
        cellID: this.props.data.getIn(['metadata', 'id']),
        isFocused: isFocused
      });
    }
  }]);

  return NotebookCell;
})(_react2['default'].Component);

exports['default'] = NotebookCell;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvbm90ZWJvb2stY2VsbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztzQkFDUixTQUFTOzs7OzJCQUNQLGFBQWE7Ozs7cUJBQ1osT0FBTzs7Ozt5QkFDSCxXQUFXOzs7O29CQUNDLE1BQU07OzBCQUNqQixjQUFjOzs7OzJCQUNiLGdCQUFnQjs7OzswQkFDckIsZUFBZTs7OztBQVZsQyxXQUFXLENBQUM7O0lBWVMsWUFBWTtZQUFaLFlBQVk7O0FBRXBCLFdBRlEsWUFBWSxDQUVuQixLQUFLLEVBQUU7OzswQkFGQSxZQUFZOztBQUc3QiwrQkFIaUIsWUFBWSw2Q0FHdkIsS0FBSyxFQUFFOztTQWlDZixPQUFPLEdBQUcsWUFBTTtBQUNkLDhCQUFXLFFBQVEsQ0FBQztBQUNsQixrQkFBVSxFQUFFLHdCQUFXLE9BQU8sQ0FBQyxRQUFRO0FBQ3ZDLGNBQU0sRUFBRSxNQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ2xELENBQUMsQ0FBQztLQUNKO0dBckNBOztlQUprQixZQUFZOztXQU16QixrQkFBRzs7QUFFUCxVQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzFFLGFBQ0U7O1VBQUssU0FBUyxFQUFFLGVBQWUsR0FBRyxVQUFVLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxBQUFDO1FBQzFGOztZQUFLLFNBQVMsRUFBQyx1QkFBdUI7O1VBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUc7O1NBQzlDO1FBQ047O1lBQUssU0FBUyxFQUFDLFdBQVc7VUFDeEIsNERBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDLEdBQUU7VUFDL0QsNkRBQWEsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxBQUFDLEdBQUU7U0FDakM7T0FDRixDQUNOOzs7Ozs7S0FNSDs7O1dBRWEsd0JBQUMsU0FBUyxFQUFFO0FBQ3hCLDhCQUFXLFFBQVEsQ0FBQztBQUNsQixrQkFBVSxFQUFFLHdCQUFXLE9BQU8sQ0FBQyxVQUFVO0FBQ3pDLGNBQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakQsaUJBQVMsRUFBRSxTQUFTO09BQ3JCLENBQUMsQ0FBQztLQUNKOzs7U0FsQ2tCLFlBQVk7R0FBUyxtQkFBTSxTQUFTOztxQkFBcEMsWUFBWSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2p1cHl0ZXItbm90ZWJvb2svbGliL25vdGVib29rLWNlbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgRmlsZSBmcm9tICdwYXRod2F0Y2hlcic7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQgRGlzcGxheUFyZWEgZnJvbSAnLi9kaXNwbGF5LWFyZWEnO1xuaW1wb3J0IEVkaXRvciBmcm9tICcuL3RleHQtZWRpdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90ZWJvb2tDZWxsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnQ2VsbCByZW5kZXJpbmcuJyk7XG4gICAgbGV0IGZvY3VzQ2xhc3MgPSAnJztcbiAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnZm9jdXMnXSkpIGZvY3VzQ2xhc3MgPSAnIGZvY3VzZWQnO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17J25vdGVib29rLWNlbGwnICsgZm9jdXNDbGFzc30gb25Gb2N1cz17dGhpcy50cmlnZ2VyRm9jdXNlZC5iaW5kKHRoaXMsIHRydWUpfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJleGVjdXRpb24tY291bnQtbGFiZWxcIj5cbiAgICAgICAgICBJbiBbe3RoaXMucHJvcHMuZGF0YS5nZXQoJ2V4ZWN1dGlvbl9jb3VudCcpIHx8ICcgJ31dOlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjZWxsLW1haW5cIj5cbiAgICAgICAgICA8RWRpdG9yIGRhdGE9e3RoaXMucHJvcHMuZGF0YX0gbGFuZ3VhZ2U9e3RoaXMucHJvcHMubGFuZ3VhZ2V9Lz5cbiAgICAgICAgICA8RGlzcGxheUFyZWEgZGF0YT17dGhpcy5wcm9wcy5kYXRhfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICAvLyA8YnV0dG9uXG4gICAgLy8gICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgaWNvbiBpY29uLXBsYXliYWNrLXBsYXlcIlxuICAgIC8vICAgb25DbGljaz17dGhpcy5ydW5DZWxsfSA+XG4gICAgLy8gICBSdW5cbiAgICAvLyA8L2J1dHRvbj5cbiAgfVxuXG4gIHRyaWdnZXJGb2N1c2VkKGlzRm9jdXNlZCkge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLmNlbGxfZm9jdXMsXG4gICAgICBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pLFxuICAgICAgaXNGb2N1c2VkOiBpc0ZvY3VzZWRcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bkNlbGwgPSAoKSA9PiB7XG4gICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBEaXNwYXRjaGVyLmFjdGlvbnMucnVuX2NlbGwsXG4gICAgICBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pXG4gICAgfSk7XG4gIH1cblxufVxuIl19
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/notebook-cell.js
