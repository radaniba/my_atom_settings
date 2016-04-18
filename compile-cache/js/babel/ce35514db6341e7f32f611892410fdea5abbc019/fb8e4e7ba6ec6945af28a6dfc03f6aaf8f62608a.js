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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9ub3RlYm9vay1jZWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O3NCQUNSLFNBQVM7Ozs7MkJBQ1AsYUFBYTs7OztxQkFDWixPQUFPOzs7O3lCQUNILFdBQVc7Ozs7b0JBQ0MsTUFBTTs7MEJBQ2pCLGNBQWM7Ozs7MkJBQ2IsZ0JBQWdCOzs7OzBCQUNyQixlQUFlOzs7O0FBVmxDLFdBQVcsQ0FBQzs7SUFZUyxZQUFZO1lBQVosWUFBWTs7QUFFcEIsV0FGUSxZQUFZLENBRW5CLEtBQUssRUFBRTs7OzBCQUZBLFlBQVk7O0FBRzdCLCtCQUhpQixZQUFZLDZDQUd2QixLQUFLLEVBQUU7O1NBaUNmLE9BQU8sR0FBRyxZQUFNO0FBQ2QsOEJBQVcsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsd0JBQVcsT0FBTyxDQUFDLFFBQVE7QUFDdkMsY0FBTSxFQUFFLE1BQUssS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDbEQsQ0FBQyxDQUFDO0tBQ0o7R0FyQ0E7O2VBSmtCLFlBQVk7O1dBTXpCLGtCQUFHOztBQUVQLFVBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNwQixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDMUUsYUFDRTs7VUFBSyxTQUFTLEVBQUUsZUFBZSxHQUFHLFVBQVUsQUFBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEFBQUM7UUFDMUY7O1lBQUssU0FBUyxFQUFDLHVCQUF1Qjs7VUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRzs7U0FDOUM7UUFDTjs7WUFBSyxTQUFTLEVBQUMsV0FBVztVQUN4Qiw0REFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUMsR0FBRTtVQUMvRCw2REFBYSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUMsR0FBRTtTQUNqQztPQUNGLENBQ047Ozs7OztLQU1IOzs7V0FFYSx3QkFBQyxTQUFTLEVBQUU7QUFDeEIsOEJBQVcsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsd0JBQVcsT0FBTyxDQUFDLFVBQVU7QUFDekMsY0FBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxpQkFBUyxFQUFFLFNBQVM7T0FDckIsQ0FBQyxDQUFDO0tBQ0o7OztTQWxDa0IsWUFBWTtHQUFTLG1CQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9ub3RlYm9vay1jZWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IEZpbGUgZnJvbSAncGF0aHdhdGNoZXInO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IERpc3BsYXlBcmVhIGZyb20gJy4vZGlzcGxheS1hcmVhJztcbmltcG9ydCBFZGl0b3IgZnJvbSAnLi90ZXh0LWVkaXRvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdGVib29rQ2VsbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ0NlbGwgcmVuZGVyaW5nLicpO1xuICAgIGxldCBmb2N1c0NsYXNzID0gJyc7XG4gICAgaWYgKHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2ZvY3VzJ10pKSBmb2N1c0NsYXNzID0gJyBmb2N1c2VkJztcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eydub3RlYm9vay1jZWxsJyArIGZvY3VzQ2xhc3N9IG9uRm9jdXM9e3RoaXMudHJpZ2dlckZvY3VzZWQuYmluZCh0aGlzLCB0cnVlKX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXhlY3V0aW9uLWNvdW50LWxhYmVsXCI+XG4gICAgICAgICAgSW4gW3t0aGlzLnByb3BzLmRhdGEuZ2V0KCdleGVjdXRpb25fY291bnQnKSB8fCAnICd9XTpcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2VsbC1tYWluXCI+XG4gICAgICAgICAgPEVkaXRvciBkYXRhPXt0aGlzLnByb3BzLmRhdGF9IGxhbmd1YWdlPXt0aGlzLnByb3BzLmxhbmd1YWdlfS8+XG4gICAgICAgICAgPERpc3BsYXlBcmVhIGRhdGE9e3RoaXMucHJvcHMuZGF0YX0vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgLy8gPGJ1dHRvblxuICAgIC8vICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGljb24gaWNvbi1wbGF5YmFjay1wbGF5XCJcbiAgICAvLyAgIG9uQ2xpY2s9e3RoaXMucnVuQ2VsbH0gPlxuICAgIC8vICAgUnVuXG4gICAgLy8gPC9idXR0b24+XG4gIH1cblxuICB0cmlnZ2VyRm9jdXNlZChpc0ZvY3VzZWQpIHtcbiAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IERpc3BhdGNoZXIuYWN0aW9ucy5jZWxsX2ZvY3VzLFxuICAgICAgY2VsbElEOiB0aGlzLnByb3BzLmRhdGEuZ2V0SW4oWydtZXRhZGF0YScsICdpZCddKSxcbiAgICAgIGlzRm9jdXNlZDogaXNGb2N1c2VkXG4gICAgfSk7XG4gIH1cblxuICBydW5DZWxsID0gKCkgPT4ge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLnJ1bl9jZWxsLFxuICAgICAgY2VsbElEOiB0aGlzLnByb3BzLmRhdGEuZ2V0SW4oWydtZXRhZGF0YScsICdpZCddKVxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/notebook-cell.js
