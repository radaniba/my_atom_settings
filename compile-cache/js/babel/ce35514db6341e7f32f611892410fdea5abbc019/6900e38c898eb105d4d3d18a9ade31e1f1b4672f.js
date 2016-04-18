Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _atom = require('atom');

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

'use babel';

var Editor = (function (_React$Component) {
  _inherits(Editor, _React$Component);

  function Editor(props) {
    var _this = this;

    _classCallCheck(this, Editor);

    _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props);

    this.onTextChanged = function () {
      _dispatcher2['default'].dispatch({
        actionType: _dispatcher2['default'].actions.cell_source_changed,
        cellID: _this.props.data.getIn(['metadata', 'id']),
        source: _this.textEditor.getText()
      });
    };

    this.subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(Editor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.textEditorView = _reactDom2['default'].findDOMNode(this);
      this.textEditor = this.textEditorView.getModel();
      var grammar = Editor.getGrammarForLanguage(this.props.language);
      this.textEditor.setGrammar(grammar);
      this.textEditor.setLineNumberGutterVisible(true);
      // Prevent `this.onTextChanged` on initial `onDidStopChanging`
      setTimeout(function () {
        _this2.subscriptions.add(_this2.textEditor.onDidStopChanging(_this2.onTextChanged));
      }, 1000);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'atom-text-editor',
        { className: 'cell-input' },
        this.props.data.get('source')
      );
    }
  }], [{
    key: 'getGrammarForLanguage',
    value: function getGrammarForLanguage(language) {
      var matchingGrammars = atom.grammars.grammars.filter(function (grammar) {
        return grammar !== atom.grammars.nullGrammar && grammar.name != null && grammar.name.toLowerCase != null && grammar.name.toLowerCase() === language;
      });
      return matchingGrammars[0];
    }
  }]);

  return Editor;
})(_react2['default'].Component);

exports['default'] = Editor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi90ZXh0LWVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozt3QkFDSixXQUFXOzs7O29CQUNFLE1BQU07OzBCQUNqQixjQUFjOzs7O0FBTHJDLFdBQVcsQ0FBQzs7SUFPUyxNQUFNO1lBQU4sTUFBTTs7QUFFZCxXQUZRLE1BQU0sQ0FFYixLQUFLLEVBQUU7OzswQkFGQSxNQUFNOztBQUd2QiwrQkFIaUIsTUFBTSw2Q0FHakIsS0FBSyxFQUFFOztTQXVDZixhQUFhLEdBQUcsWUFBTTtBQUNwQiw4QkFBVyxRQUFRLENBQUM7QUFDbEIsa0JBQVUsRUFBRSx3QkFBVyxPQUFPLENBQUMsbUJBQW1CO0FBQ2xELGNBQU0sRUFBRSxNQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELGNBQU0sRUFBRSxNQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7O0FBNUNDLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7R0FDaEQ7O2VBTGtCLE1BQU07O1dBT1IsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsY0FBYyxHQUFHLHNCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDakQsVUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEUsVUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakQsZ0JBQVUsQ0FBQyxZQUFNO0FBQ2YsZUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQUssVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQUssYUFBYSxDQUFDLENBQUMsQ0FBQTtPQUM5RSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ1Y7OztXQUVvQixpQ0FBRztBQUN0QixhQUFPLEtBQUssQ0FBQztLQUNkOzs7V0FFbUIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM5Qjs7O1dBRUssa0JBQUc7QUFDUCxhQUNFOztVQUFrQixTQUFTLEVBQUMsWUFBWTtRQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO09BQ2IsQ0FDbkI7S0FDSDs7O1dBRTJCLCtCQUFDLFFBQVEsRUFBRTtBQUNyQyxVQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUM5RCxlQUFPLE9BQU8sS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQUFBQyxJQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQUFBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDO09BQ3pKLENBQUMsQ0FBQztBQUNILGFBQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7OztTQXhDa0IsTUFBTTtHQUFTLG1CQUFNLFNBQVM7O3FCQUE5QixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi90ZXh0LWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy50ZXh0RWRpdG9yVmlldyA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMudGV4dEVkaXRvciA9IHRoaXMudGV4dEVkaXRvclZpZXcuZ2V0TW9kZWwoKTtcbiAgICBsZXQgZ3JhbW1hciA9IEVkaXRvci5nZXRHcmFtbWFyRm9yTGFuZ3VhZ2UodGhpcy5wcm9wcy5sYW5ndWFnZSk7XG4gICAgdGhpcy50ZXh0RWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcik7XG4gICAgdGhpcy50ZXh0RWRpdG9yLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKHRydWUpO1xuICAgIC8vIFByZXZlbnQgYHRoaXMub25UZXh0Q2hhbmdlZGAgb24gaW5pdGlhbCBgb25EaWRTdG9wQ2hhbmdpbmdgXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMudGV4dEVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyh0aGlzLm9uVGV4dENoYW5nZWQpKVxuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yIGNsYXNzTmFtZT1cImNlbGwtaW5wdXRcIj5cbiAgICAgICAge3RoaXMucHJvcHMuZGF0YS5nZXQoJ3NvdXJjZScpfVxuICAgICAgPC9hdG9tLXRleHQtZWRpdG9yPlxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgZ2V0R3JhbW1hckZvckxhbmd1YWdlKGxhbmd1YWdlKSB7XG4gICAgbGV0IG1hdGNoaW5nR3JhbW1hcnMgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJzLmZpbHRlcihncmFtbWFyID0+IHtcbiAgICAgIHJldHVybiBncmFtbWFyICE9PSBhdG9tLmdyYW1tYXJzLm51bGxHcmFtbWFyICYmIChncmFtbWFyLm5hbWUgIT0gbnVsbCkgJiYgKGdyYW1tYXIubmFtZS50b0xvd2VyQ2FzZSAhPSBudWxsKSAmJiBncmFtbWFyLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbGFuZ3VhZ2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoaW5nR3JhbW1hcnNbMF07XG4gIH1cblxuICBvblRleHRDaGFuZ2VkID0gKCkgPT4ge1xuICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogRGlzcGF0Y2hlci5hY3Rpb25zLmNlbGxfc291cmNlX2NoYW5nZWQsXG4gICAgICBjZWxsSUQ6IHRoaXMucHJvcHMuZGF0YS5nZXRJbihbJ21ldGFkYXRhJywgJ2lkJ10pLFxuICAgICAgc291cmNlOiB0aGlzLnRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgfSk7XG4gIH1cblxufVxuIl19
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/text-editor.js
