var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _reactResizableBox = require('react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

var _helpers = require('../helpers');

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  function PanelComponent(props, context) {
    var _this = this;

    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props, context);

    this.onClick = function (e, row) {
      if (process.platform === 'darwin' ? e.metaKey : e.ctrlKey) {
        if (e.shiftKey) {
          (0, _helpers.openExternally)(row);
        } else {
          (0, _helpers.visitMessage)(row, true);
        }
      } else {
        (0, _helpers.visitMessage)(row);
      }
    };

    this.onResize = function (direction, size) {
      _this.setState({ tempHeight: size.height });
    };

    this.onResizeStop = function (direction, size) {
      _this.props.delegate.updatePanelHeight(size.height);
    };

    this.state = {
      messages: this.props.delegate.filteredMessages,
      visibility: this.props.delegate.visibility,
      tempHeight: null
    };
  }

  _createClass(PanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.props.delegate.onDidChangeMessages(function (messages) {
        _this2.setState({ messages: messages });
      });
      this.props.delegate.onDidChangeVisibility(function (visibility) {
        _this2.setState({ visibility: visibility });
      });
      this.props.delegate.onDidChangePanelConfig(function () {
        _this2.setState({ tempHeight: null });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var delegate = this.props.delegate;

      var columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description', onClick: this.onClick }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }];
      if (delegate.panelRepresents === 'Entire Project') {
        columns.push({ key: 'file', label: 'File', sortable: true, onClick: this.onClick });
      }

      var height = undefined;
      var customStyle = { overflowY: 'scroll' };
      if (this.state.tempHeight) {
        height = this.state.tempHeight;
      } else if (delegate.panelTakesMinimumHeight) {
        height = 'auto';
        customStyle.maxHeight = delegate.panelHeight;
      } else {
        height = delegate.panelHeight;
      }
      delegate.setPanelVisibility(this.state.visibility && (!delegate.panelTakesMinimumHeight || !!this.state.messages.length));

      return _react2['default'].createElement(
        _reactResizableBox2['default'],
        { isResizable: { top: true }, onResize: this.onResize, onResizeStop: this.onResizeStop, height: height, width: 'auto', customStyle: customStyle },
        _react2['default'].createElement(
          'div',
          { id: 'linter-panel', tabIndex: '-1' },
          _react2['default'].createElement(_sbReactTable2['default'], {
            rows: this.state.messages,
            columns: columns,

            initialSort: [{ column: 'severity', type: 'desc' }, { column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }],
            sort: _helpers.sortMessages,
            rowKey: function (i) {
              return i.key;
            },

            renderHeaderColumn: function (i) {
              return i.label;
            },
            renderBodyColumn: PanelComponent.renderRowColumn,

            style: { width: '100%' },
            className: 'linter'
          })
        )
      );
    }
  }], [{
    key: 'renderRowColumn',
    value: function renderRowColumn(row, column) {
      var range = (0, _helpers.$range)(row);

      switch (column) {
        case 'file':
          return (0, _helpers.getPathOfMessage)(row);
        case 'line':
          return range ? range.start.row + 1 + ':' + (range.start.column + 1) : '';
        case 'excerpt':
          if (row.version === 1) {
            if (row.html) {
              return _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: row.html } });
            }
            return row.text || '';
          }
          return row.excerpt;
        case 'severity':
          return _helpers.severityNames[row.severity];
        default:
          return row[column];
      }
    }
  }]);

  return PanelComponent;
})(_react2['default'].Component);

module.exports = PanelComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2NvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7OzRCQUNGLGdCQUFnQjs7OztpQ0FDZCxxQkFBcUI7Ozs7dUJBQ3NELFlBQVk7O0lBSTFHLGNBQWM7WUFBZCxjQUFjOztBQVNQLFdBVFAsY0FBYyxDQVNOLEtBQWEsRUFBRSxPQUFnQixFQUFFOzs7MEJBVHpDLGNBQWM7O0FBVWhCLCtCQVZFLGNBQWMsNkNBVVYsS0FBSyxFQUFFLE9BQU8sRUFBQzs7U0FrQnZCLE9BQU8sR0FBRyxVQUFDLENBQUMsRUFBYyxHQUFHLEVBQW9CO0FBQy9DLFVBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3pELFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNkLHVDQUFlLEdBQUcsQ0FBQyxDQUFBO1NBQ3BCLE1BQU07QUFDTCxxQ0FBYSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDeEI7T0FDRixNQUFNO0FBQ0wsbUNBQWEsR0FBRyxDQUFDLENBQUE7T0FDbEI7S0FDRjs7U0FDRCxRQUFRLEdBQUcsVUFBQyxTQUFTLEVBQVMsSUFBSSxFQUF3QztBQUN4RSxZQUFLLFFBQVEsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtLQUMzQzs7U0FDRCxZQUFZLEdBQUcsVUFBQyxTQUFTLEVBQVMsSUFBSSxFQUF3QztBQUM1RSxZQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ25EOztBQWpDQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsY0FBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQjtB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QkFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQ1oscUJBQU8sMkNBQU0sdUJBQXVCLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxBQUFDLEdBQUcsQ0FBQTthQUMvRDtBQUNELG1CQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1dBQ3RCO0FBQ0QsaUJBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQTtBQUFBLEFBQ3BCLGFBQUssVUFBVTtBQUNiLGlCQUFPLHVCQUFjLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUFBLEFBQ3BDO0FBQ0UsaUJBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQUEsT0FDckI7S0FDRjs7O1NBL0dHLGNBQWM7R0FBUyxtQkFBTSxTQUFTOztBQWtINUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUEiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFJlYWN0VGFibGUgZnJvbSAnc2ItcmVhY3QtdGFibGUnXG5pbXBvcnQgUmVzaXphYmxlQm94IGZyb20gJ3JlYWN0LXJlc2l6YWJsZS1ib3gnXG5pbXBvcnQgeyAkcmFuZ2UsIHNldmVyaXR5TmFtZXMsIHNvcnRNZXNzYWdlcywgdmlzaXRNZXNzYWdlLCBvcGVuRXh0ZXJuYWxseSwgZ2V0UGF0aE9mTWVzc2FnZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBEZWxlZ2F0ZSBmcm9tICcuL2RlbGVnYXRlJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBkZWxlZ2F0ZTogRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LFxuICAgIHZpc2liaWxpdHk6IGJvb2xlYW4sXG4gICAgdGVtcEhlaWdodDogP251bWJlcixcbiAgfTtcbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCwgY29udGV4dDogP09iamVjdCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtZXNzYWdlczogdGhpcy5wcm9wcy5kZWxlZ2F0ZS5maWx0ZXJlZE1lc3NhZ2VzLFxuICAgICAgdmlzaWJpbGl0eTogdGhpcy5wcm9wcy5kZWxlZ2F0ZS52aXNpYmlsaXR5LFxuICAgICAgdGVtcEhlaWdodDogbnVsbCxcbiAgICB9XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vbkRpZENoYW5nZU1lc3NhZ2VzKChtZXNzYWdlcykgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2VzIH0pXG4gICAgfSlcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uRGlkQ2hhbmdlVmlzaWJpbGl0eSgodmlzaWJpbGl0eSkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZpc2liaWxpdHkgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VQYW5lbENvbmZpZygoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdGVtcEhlaWdodDogbnVsbCB9KVxuICAgIH0pXG4gIH1cbiAgb25DbGljayA9IChlOiBNb3VzZUV2ZW50LCByb3c6IExpbnRlck1lc3NhZ2UpID0+IHtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpIHtcbiAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgIG9wZW5FeHRlcm5hbGx5KHJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpc2l0TWVzc2FnZShyb3csIHRydWUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZpc2l0TWVzc2FnZShyb3cpXG4gICAgfVxuICB9XG4gIG9uUmVzaXplID0gKGRpcmVjdGlvbjogJ3RvcCcsIHNpemU6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBzaXplLmhlaWdodCB9KVxuICB9XG4gIG9uUmVzaXplU3RvcCA9IChkaXJlY3Rpb246ICd0b3AnLCBzaXplOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLnVwZGF0ZVBhbmVsSGVpZ2h0KHNpemUuaGVpZ2h0KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgIHsga2V5OiAnc2V2ZXJpdHknLCBsYWJlbDogJ1NldmVyaXR5Jywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIHsga2V5OiAnbGludGVyTmFtZScsIGxhYmVsOiAnUHJvdmlkZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgeyBrZXk6ICdleGNlcnB0JywgbGFiZWw6ICdEZXNjcmlwdGlvbicsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgICAgeyBrZXk6ICdsaW5lJywgbGFiZWw6ICdMaW5lJywgc29ydGFibGU6IHRydWUsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgIF1cbiAgICBpZiAoZGVsZWdhdGUucGFuZWxSZXByZXNlbnRzID09PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICBjb2x1bW5zLnB1c2goeyBrZXk6ICdmaWxlJywgbGFiZWw6ICdGaWxlJywgc29ydGFibGU6IHRydWUsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9KVxuICAgIH1cblxuICAgIGxldCBoZWlnaHRcbiAgICBjb25zdCBjdXN0b21TdHlsZTogT2JqZWN0ID0geyBvdmVyZmxvd1k6ICdzY3JvbGwnIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50ZW1wSGVpZ2h0KSB7XG4gICAgICBoZWlnaHQgPSB0aGlzLnN0YXRlLnRlbXBIZWlnaHRcbiAgICB9IGVsc2UgaWYgKGRlbGVnYXRlLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0KSB7XG4gICAgICBoZWlnaHQgPSAnYXV0bydcbiAgICAgIGN1c3RvbVN0eWxlLm1heEhlaWdodCA9IGRlbGVnYXRlLnBhbmVsSGVpZ2h0XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlaWdodCA9IGRlbGVnYXRlLnBhbmVsSGVpZ2h0XG4gICAgfVxuICAgIGRlbGVnYXRlLnNldFBhbmVsVmlzaWJpbGl0eSh0aGlzLnN0YXRlLnZpc2liaWxpdHkgJiYgKCFkZWxlZ2F0ZS5wYW5lbFRha2VzTWluaW11bUhlaWdodCB8fCAhIXRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoKSlcblxuICAgIHJldHVybiAoXG4gICAgICA8UmVzaXphYmxlQm94IGlzUmVzaXphYmxlPXt7IHRvcDogdHJ1ZSB9fSBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX0gb25SZXNpemVTdG9wPXt0aGlzLm9uUmVzaXplU3RvcH0gaGVpZ2h0PXtoZWlnaHR9IHdpZHRoPVwiYXV0b1wiIGN1c3RvbVN0eWxlPXtjdXN0b21TdHlsZX0+XG4gICAgICAgIDxkaXYgaWQ9XCJsaW50ZXItcGFuZWxcIiB0YWJJbmRleD1cIi0xXCI+XG4gICAgICAgICAgPFJlYWN0VGFibGVcbiAgICAgICAgICAgIHJvd3M9e3RoaXMuc3RhdGUubWVzc2FnZXN9XG4gICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuXG4gICAgICAgICAgICBpbml0aWFsU29ydD17W3sgY29sdW1uOiAnc2V2ZXJpdHknLCB0eXBlOiAnZGVzYycgfSwgeyBjb2x1bW46ICdmaWxlJywgdHlwZTogJ2FzYycgfSwgeyBjb2x1bW46ICdsaW5lJywgdHlwZTogJ2FzYycgfV19XG4gICAgICAgICAgICBzb3J0PXtzb3J0TWVzc2FnZXN9XG4gICAgICAgICAgICByb3dLZXk9e2kgPT4gaS5rZXl9XG5cbiAgICAgICAgICAgIHJlbmRlckhlYWRlckNvbHVtbj17aSA9PiBpLmxhYmVsfVxuICAgICAgICAgICAgcmVuZGVyQm9keUNvbHVtbj17UGFuZWxDb21wb25lbnQucmVuZGVyUm93Q29sdW1ufVxuXG4gICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJsaW50ZXJcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9SZXNpemFibGVCb3g+XG4gICAgKVxuICB9XG4gIHN0YXRpYyByZW5kZXJSb3dDb2x1bW4ocm93OiBMaW50ZXJNZXNzYWdlLCBjb2x1bW46IHN0cmluZyk6IHN0cmluZyB8IE9iamVjdCB7XG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2Uocm93KVxuXG4gICAgc3dpdGNoIChjb2x1bW4pIHtcbiAgICAgIGNhc2UgJ2ZpbGUnOlxuICAgICAgICByZXR1cm4gZ2V0UGF0aE9mTWVzc2FnZShyb3cpXG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIHJhbmdlID8gYCR7cmFuZ2Uuc3RhcnQucm93ICsgMX06JHtyYW5nZS5zdGFydC5jb2x1bW4gKyAxfWAgOiAnJ1xuICAgICAgY2FzZSAnZXhjZXJwdCc6XG4gICAgICAgIGlmIChyb3cudmVyc2lvbiA9PT0gMSkge1xuICAgICAgICAgIGlmIChyb3cuaHRtbCkge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogcm93Lmh0bWwgfX0gLz5cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJvdy50ZXh0IHx8ICcnXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvdy5leGNlcnB0XG4gICAgICBjYXNlICdzZXZlcml0eSc6XG4gICAgICAgIHJldHVybiBzZXZlcml0eU5hbWVzW3Jvdy5zZXZlcml0eV1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiByb3dbY29sdW1uXVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsQ29tcG9uZW50XG4iXX0=