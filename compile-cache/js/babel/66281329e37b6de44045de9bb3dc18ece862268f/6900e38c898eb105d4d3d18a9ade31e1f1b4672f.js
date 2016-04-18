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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvdGV4dC1lZGl0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7d0JBQ0osV0FBVzs7OztvQkFDRSxNQUFNOzswQkFDakIsY0FBYzs7OztBQUxyQyxXQUFXLENBQUM7O0lBT1MsTUFBTTtZQUFOLE1BQU07O0FBRWQsV0FGUSxNQUFNLENBRWIsS0FBSyxFQUFFOzs7MEJBRkEsTUFBTTs7QUFHdkIsK0JBSGlCLE1BQU0sNkNBR2pCLEtBQUssRUFBRTs7U0F1Q2YsYUFBYSxHQUFHLFlBQU07QUFDcEIsOEJBQVcsUUFBUSxDQUFDO0FBQ2xCLGtCQUFVLEVBQUUsd0JBQVcsT0FBTyxDQUFDLG1CQUFtQjtBQUNsRCxjQUFNLEVBQUUsTUFBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxjQUFNLEVBQUUsTUFBSyxVQUFVLENBQUMsT0FBTyxFQUFFO09BQ2xDLENBQUMsQ0FBQztLQUNKOztBQTVDQyxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0dBQ2hEOztlQUxrQixNQUFNOztXQU9SLDZCQUFHOzs7QUFDbEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxzQkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2pELFVBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWpELGdCQUFVLENBQUMsWUFBTTtBQUNmLGVBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFLLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUE7T0FDOUUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNWOzs7V0FFb0IsaUNBQUc7QUFDdEIsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1dBRW1CLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDOUI7OztXQUVLLGtCQUFHO0FBQ1AsYUFDRTs7VUFBa0IsU0FBUyxFQUFDLFlBQVk7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztPQUNiLENBQ25CO0tBQ0g7OztXQUUyQiwrQkFBQyxRQUFRLEVBQUU7QUFDckMsVUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDOUQsZUFBTyxPQUFPLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUssT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEFBQUMsSUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEFBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQztPQUN6SixDQUFDLENBQUM7QUFDSCxhQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOzs7U0F4Q2tCLE1BQU07R0FBUyxtQkFBTSxTQUFTOztxQkFBOUIsTUFBTSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2p1cHl0ZXItbm90ZWJvb2svbGliL3RleHQtZWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnRleHRFZGl0b3JWaWV3ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy50ZXh0RWRpdG9yID0gdGhpcy50ZXh0RWRpdG9yVmlldy5nZXRNb2RlbCgpO1xuICAgIGxldCBncmFtbWFyID0gRWRpdG9yLmdldEdyYW1tYXJGb3JMYW5ndWFnZSh0aGlzLnByb3BzLmxhbmd1YWdlKTtcbiAgICB0aGlzLnRleHRFZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKTtcbiAgICB0aGlzLnRleHRFZGl0b3Iuc2V0TGluZU51bWJlckd1dHRlclZpc2libGUodHJ1ZSk7XG4gICAgLy8gUHJldmVudCBgdGhpcy5vblRleHRDaGFuZ2VkYCBvbiBpbml0aWFsIGBvbkRpZFN0b3BDaGFuZ2luZ2BcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50ZXh0RWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKHRoaXMub25UZXh0Q2hhbmdlZCkpXG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tdGV4dC1lZGl0b3IgY2xhc3NOYW1lPVwiY2VsbC1pbnB1dFwiPlxuICAgICAgICB7dGhpcy5wcm9wcy5kYXRhLmdldCgnc291cmNlJyl9XG4gICAgICA8L2F0b20tdGV4dC1lZGl0b3I+XG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHcmFtbWFyRm9yTGFuZ3VhZ2UobGFuZ3VhZ2UpIHtcbiAgICBsZXQgbWF0Y2hpbmdHcmFtbWFycyA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hcnMuZmlsdGVyKGdyYW1tYXIgPT4ge1xuICAgICAgcmV0dXJuIGdyYW1tYXIgIT09IGF0b20uZ3JhbW1hcnMubnVsbEdyYW1tYXIgJiYgKGdyYW1tYXIubmFtZSAhPSBudWxsKSAmJiAoZ3JhbW1hci5uYW1lLnRvTG93ZXJDYXNlICE9IG51bGwpICYmIGdyYW1tYXIubmFtZS50b0xvd2VyQ2FzZSgpID09PSBsYW5ndWFnZTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWF0Y2hpbmdHcmFtbWFyc1swXTtcbiAgfVxuXG4gIG9uVGV4dENoYW5nZWQgPSAoKSA9PiB7XG4gICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBEaXNwYXRjaGVyLmFjdGlvbnMuY2VsbF9zb3VyY2VfY2hhbmdlZCxcbiAgICAgIGNlbGxJRDogdGhpcy5wcm9wcy5kYXRhLmdldEluKFsnbWV0YWRhdGEnLCAnaWQnXSksXG4gICAgICBzb3VyY2U6IHRoaXMudGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/text-editor.js
