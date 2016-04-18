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

var _transformime = require('transformime');

var _transformimeJupyterTransformers = require('transformime-jupyter-transformers');

'use babel';

var DisplayArea = (function (_React$Component) {
  _inherits(DisplayArea, _React$Component);

  function DisplayArea(props) {
    _classCallCheck(this, DisplayArea);

    _get(Object.getPrototypeOf(DisplayArea.prototype), 'constructor', this).call(this, props);
    this.transformer = new _transformime.Transformime();
    this.transformer.transformers.push(new _transformimeJupyterTransformers.StreamTransformer());
    this.transformer.transformers.push(new _transformimeJupyterTransformers.TracebackTransformer());
    this.transformer.transformers.push(new _transformimeJupyterTransformers.MarkdownTransformer());
    this.transformer.transformers.push(new _transformimeJupyterTransformers.LaTeXTransformer());
    this.transformer.transformers.push(new _transformimeJupyterTransformers.PDFTransformer());
    this.state = {
      outputs: []
    };
  }

  _createClass(DisplayArea, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.transformMimeBundle(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.transformMimeBundle(nextProps);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', { className: 'cell-display-area native-key-bindings',
        tabIndex: '-1',
        dangerouslySetInnerHTML: { __html: this.state.outputs.join('') }
      });
    }
  }, {
    key: 'transformMimeBundle',
    value: function transformMimeBundle(props) {
      var _this = this;

      if (props.data.get('outputs')) {
        var promises = props.data.get('outputs').toJS().map(function (output) {
          var mimeBundle = _this.makeMimeBundle(output);
          if (mimeBundle) {
            return _this.transformer.transformRichest(mimeBundle, document).then(function (mime) {
              return mime.el.outerHTML;
            });
          } else return;
        });
        Promise.all(promises).then(function (outputs) {
          _this.setState({ outputs: outputs });
        });
      }
    }
  }, {
    key: 'makeMimeBundle',
    value: function makeMimeBundle(msg) {
      var bundle = {};
      switch (msg.output_type) {
        case 'execute_result':
        case 'display_data':
          bundle = msg.data;
          break;
        case 'stream':
          bundle = { 'text/plain': msg.text.join('') };
          // bundle = {'jupyter/stream': msg};
          break;
        case 'error':
          bundle = {
            'jupyter/traceback': msg
          };
          break;
        default:
          console.warn('Unrecognized output type: ' + msg.output_type);
          bundle = {
            'text/plain': 'Unrecognized output type' + JSON.stringify(msg)
          };
      }
      return bundle;
    }
  }]);

  return DisplayArea;
})(_react2['default'].Component);

exports['default'] = DisplayArea;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvanVweXRlci1ub3RlYm9vay9saWIvZGlzcGxheS1hcmVhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7OzRCQUNFLGNBQWM7OytDQU9sQyxtQ0FBbUM7O0FBVjFDLFdBQVcsQ0FBQzs7SUFZUyxXQUFXO1lBQVgsV0FBVzs7QUFFbkIsV0FGUSxXQUFXLENBRWxCLEtBQUssRUFBRTswQkFGQSxXQUFXOztBQUc1QiwrQkFIaUIsV0FBVyw2Q0FHdEIsS0FBSyxFQUFFO0FBQ2YsUUFBSSxDQUFDLFdBQVcsR0FBRyxnQ0FBa0IsQ0FBQztBQUN0QyxRQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsd0RBQXVCLENBQUMsQ0FBQztBQUM1RCxRQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsMkRBQTBCLENBQUMsQ0FBQztBQUMvRCxRQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsMERBQXlCLENBQUMsQ0FBQztBQUM5RCxRQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsdURBQXNCLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMscURBQW9CLENBQUMsQ0FBQztBQUN2RCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsYUFBTyxFQUFFLEVBQUU7S0FDWixDQUFDO0dBQ0g7O2VBYmtCLFdBQVc7O1dBZVosOEJBQUc7QUFDbkIsVUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN0Qzs7O1dBRXdCLG1DQUFDLFNBQVMsRUFBRTtBQUNuQyxVQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDckM7OztXQUVLLGtCQUFHO0FBQ1AsYUFDRSwwQ0FBSyxTQUFTLEVBQUMsdUNBQXVDO0FBQ3BELGdCQUFRLEVBQUMsSUFBSTtBQUNiLCtCQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBQyxBQUFDO1FBRTNELENBQ047S0FDSDs7O1dBRWtCLDZCQUFDLEtBQUssRUFBRTs7O0FBQ3pCLFVBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDN0IsWUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzVELGNBQUksVUFBVSxHQUFHLE1BQUssY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdDLGNBQUksVUFBVSxFQUFFO0FBQ2QsbUJBQU8sTUFBSyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7cUJBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTO2FBQUEsQ0FBQyxDQUFDO1dBQ2hHLE1BQU0sT0FBTztTQUNqQixDQUFDLENBQUM7QUFDRCxlQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNwQyxnQkFBSyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUMsQ0FBQztTQUMxQixDQUFDLENBQUM7T0FDSjtLQUNGOzs7V0FFYSx3QkFBQyxHQUFHLEVBQUU7QUFDbkIsVUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGNBQVEsR0FBRyxDQUFDLFdBQVc7QUFDdEIsYUFBSyxnQkFBZ0IsQ0FBQztBQUN0QixhQUFLLGNBQWM7QUFDbEIsZ0JBQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ2xCLGdCQUFNO0FBQUEsQUFDUCxhQUFLLFFBQVE7QUFDWixnQkFBTSxHQUFHLEVBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUM7O0FBRTNDLGdCQUFNO0FBQUEsQUFDUCxhQUFLLE9BQU87QUFDWCxnQkFBTSxHQUFHO0FBQ1IsK0JBQW1CLEVBQUUsR0FBRztXQUN4QixDQUFDO0FBQ0YsZ0JBQU07QUFBQSxBQUNQO0FBQ0MsaUJBQU8sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdELGdCQUFNLEdBQUc7QUFDUix3QkFBWSxFQUFFLDBCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO1dBQzlELENBQUM7QUFBQSxPQUNIO0FBQ0QsYUFBTyxNQUFNLENBQUM7S0FDZDs7O1NBdEVrQixXQUFXO0dBQVMsbUJBQU0sU0FBUzs7cUJBQW5DLFdBQVciLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qdXB5dGVyLW5vdGVib29rL2xpYi9kaXNwbGF5LWFyZWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7VHJhbnNmb3JtaW1lfSBmcm9tICd0cmFuc2Zvcm1pbWUnO1xuaW1wb3J0IHtcbiAgU3RyZWFtVHJhbnNmb3JtZXIsXG4gIFRyYWNlYmFja1RyYW5zZm9ybWVyLFxuICBNYXJrZG93blRyYW5zZm9ybWVyLFxuICBMYVRlWFRyYW5zZm9ybWVyLFxuICBQREZUcmFuc2Zvcm1lclxufSBmcm9tICd0cmFuc2Zvcm1pbWUtanVweXRlci10cmFuc2Zvcm1lcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5QXJlYSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cdFx0dGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1pbWUoKTtcblx0XHR0aGlzLnRyYW5zZm9ybWVyLnRyYW5zZm9ybWVycy5wdXNoKG5ldyBTdHJlYW1UcmFuc2Zvcm1lcigpKTtcblx0XHR0aGlzLnRyYW5zZm9ybWVyLnRyYW5zZm9ybWVycy5wdXNoKG5ldyBUcmFjZWJhY2tUcmFuc2Zvcm1lcigpKTtcblx0XHR0aGlzLnRyYW5zZm9ybWVyLnRyYW5zZm9ybWVycy5wdXNoKG5ldyBNYXJrZG93blRyYW5zZm9ybWVyKCkpO1xuXHRcdHRoaXMudHJhbnNmb3JtZXIudHJhbnNmb3JtZXJzLnB1c2gobmV3IExhVGVYVHJhbnNmb3JtZXIoKSk7XG5cdFx0dGhpcy50cmFuc2Zvcm1lci50cmFuc2Zvcm1lcnMucHVzaChuZXcgUERGVHJhbnNmb3JtZXIoKSk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG91dHB1dHM6IFtdXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnRyYW5zZm9ybU1pbWVCdW5kbGUodGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgIHRoaXMudHJhbnNmb3JtTWltZUJ1bmRsZShuZXh0UHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNlbGwtZGlzcGxheS1hcmVhIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUub3V0cHV0cy5qb2luKCcnKX19XG4gICAgICA+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgdHJhbnNmb3JtTWltZUJ1bmRsZShwcm9wcykge1xuICAgIGlmIChwcm9wcy5kYXRhLmdldCgnb3V0cHV0cycpKSB7XG4gICAgICBsZXQgcHJvbWlzZXMgPSBwcm9wcy5kYXRhLmdldCgnb3V0cHV0cycpLnRvSlMoKS5tYXAob3V0cHV0ID0+IHtcbiAgICAgICAgbGV0IG1pbWVCdW5kbGUgPSB0aGlzLm1ha2VNaW1lQnVuZGxlKG91dHB1dCk7XG4gICAgICAgIGlmIChtaW1lQnVuZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZXIudHJhbnNmb3JtUmljaGVzdChtaW1lQnVuZGxlLCBkb2N1bWVudCkudGhlbihtaW1lID0+IG1pbWUuZWwub3V0ZXJIVE1MKTtcbiAgICAgICAgfSBlbHNlIHJldHVybjtcbiAgXHRcdH0pO1xuICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4ob3V0cHV0cyA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe291dHB1dHN9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIG1ha2VNaW1lQnVuZGxlKG1zZykge1xuICBcdGxldCBidW5kbGUgPSB7fTtcbiAgXHRzd2l0Y2ggKG1zZy5vdXRwdXRfdHlwZSkge1xuICBcdFx0Y2FzZSAnZXhlY3V0ZV9yZXN1bHQnOlxuICBcdFx0Y2FzZSAnZGlzcGxheV9kYXRhJzpcbiAgXHRcdFx0YnVuZGxlID0gbXNnLmRhdGE7XG4gIFx0XHRcdGJyZWFrO1xuICBcdFx0Y2FzZSAnc3RyZWFtJzpcbiAgXHRcdFx0YnVuZGxlID0geyd0ZXh0L3BsYWluJzogbXNnLnRleHQuam9pbignJyl9O1xuICBcdFx0XHQvLyBidW5kbGUgPSB7J2p1cHl0ZXIvc3RyZWFtJzogbXNnfTtcbiAgXHRcdFx0YnJlYWs7XG4gIFx0XHRjYXNlICdlcnJvcic6XG4gIFx0XHRcdGJ1bmRsZSA9IHtcbiAgXHRcdFx0XHQnanVweXRlci90cmFjZWJhY2snOiBtc2dcbiAgXHRcdFx0fTtcbiAgXHRcdFx0YnJlYWs7XG4gIFx0XHRkZWZhdWx0OlxuICBcdFx0XHRjb25zb2xlLndhcm4oJ1VucmVjb2duaXplZCBvdXRwdXQgdHlwZTogJyArIG1zZy5vdXRwdXRfdHlwZSk7XG4gIFx0XHRcdGJ1bmRsZSA9IHtcbiAgXHRcdFx0XHQndGV4dC9wbGFpbic6ICdVbnJlY29nbml6ZWQgb3V0cHV0IHR5cGUnICsgSlNPTi5zdHJpbmdpZnkobXNnKVxuICBcdFx0XHR9O1xuICBcdH1cbiAgXHRyZXR1cm4gYnVuZGxlO1xuICB9XG5cbn1cbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/lib/display-area.js
