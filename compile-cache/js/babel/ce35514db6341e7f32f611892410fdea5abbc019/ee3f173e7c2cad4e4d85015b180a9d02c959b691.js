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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9hdG9tLW5vdGVib29rL2xpYi9kaXNwbGF5LWFyZWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7NEJBQ0UsY0FBYzs7K0NBT2xDLG1DQUFtQzs7QUFWMUMsV0FBVyxDQUFDOztJQVlTLFdBQVc7WUFBWCxXQUFXOztBQUVuQixXQUZRLFdBQVcsQ0FFbEIsS0FBSyxFQUFFOzBCQUZBLFdBQVc7O0FBRzVCLCtCQUhpQixXQUFXLDZDQUd0QixLQUFLLEVBQUU7QUFDZixRQUFJLENBQUMsV0FBVyxHQUFHLGdDQUFrQixDQUFDO0FBQ3RDLFFBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyx3REFBdUIsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQywyREFBMEIsQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQywwREFBeUIsQ0FBQyxDQUFDO0FBQzlELFFBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyx1REFBc0IsQ0FBQyxDQUFDO0FBQzNELFFBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxxREFBb0IsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxhQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7R0FDSDs7ZUFia0IsV0FBVzs7V0FlWiw4QkFBRztBQUNuQixVQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3RDOzs7V0FFd0IsbUNBQUMsU0FBUyxFQUFFO0FBQ25DLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyQzs7O1dBRUssa0JBQUc7QUFDUCxhQUNFLDBDQUFLLFNBQVMsRUFBQyx1Q0FBdUM7QUFDcEQsZ0JBQVEsRUFBQyxJQUFJO0FBQ2IsK0JBQXVCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEFBQUM7UUFFM0QsQ0FDTjtLQUNIOzs7V0FFa0IsNkJBQUMsS0FBSyxFQUFFOzs7QUFDekIsVUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM3QixZQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDNUQsY0FBSSxVQUFVLEdBQUcsTUFBSyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0MsY0FBSSxVQUFVLEVBQUU7QUFDZCxtQkFBTyxNQUFLLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtxQkFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVM7YUFBQSxDQUFDLENBQUM7V0FDaEcsTUFBTSxPQUFPO1NBQ2pCLENBQUMsQ0FBQztBQUNELGVBQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ3BDLGdCQUFLLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQyxDQUFDO1NBQzFCLENBQUMsQ0FBQztPQUNKO0tBQ0Y7OztXQUVhLHdCQUFDLEdBQUcsRUFBRTtBQUNuQixVQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsY0FBUSxHQUFHLENBQUMsV0FBVztBQUN0QixhQUFLLGdCQUFnQixDQUFDO0FBQ3RCLGFBQUssY0FBYztBQUNsQixnQkFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDbEIsZ0JBQU07QUFBQSxBQUNQLGFBQUssUUFBUTtBQUNaLGdCQUFNLEdBQUcsRUFBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQzs7QUFFM0MsZ0JBQU07QUFBQSxBQUNQLGFBQUssT0FBTztBQUNYLGdCQUFNLEdBQUc7QUFDUiwrQkFBbUIsRUFBRSxHQUFHO1dBQ3hCLENBQUM7QUFDRixnQkFBTTtBQUFBLEFBQ1A7QUFDQyxpQkFBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0QsZ0JBQU0sR0FBRztBQUNSLHdCQUFZLEVBQUUsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7V0FDOUQsQ0FBQztBQUFBLE9BQ0g7QUFDRCxhQUFPLE1BQU0sQ0FBQztLQUNkOzs7U0F0RWtCLFdBQVc7R0FBUyxtQkFBTSxTQUFTOztxQkFBbkMsV0FBVyIsImZpbGUiOiIvVXNlcnMvUmFkL0RvY3VtZW50cy9EZXYvYXRvbS1ub3RlYm9vay9saWIvZGlzcGxheS1hcmVhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1RyYW5zZm9ybWltZX0gZnJvbSAndHJhbnNmb3JtaW1lJztcbmltcG9ydCB7XG4gIFN0cmVhbVRyYW5zZm9ybWVyLFxuICBUcmFjZWJhY2tUcmFuc2Zvcm1lcixcbiAgTWFya2Rvd25UcmFuc2Zvcm1lcixcbiAgTGFUZVhUcmFuc2Zvcm1lcixcbiAgUERGVHJhbnNmb3JtZXJcbn0gZnJvbSAndHJhbnNmb3JtaW1lLWp1cHl0ZXItdHJhbnNmb3JtZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGxheUFyZWEgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXHRcdHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtaW1lKCk7XG5cdFx0dGhpcy50cmFuc2Zvcm1lci50cmFuc2Zvcm1lcnMucHVzaChuZXcgU3RyZWFtVHJhbnNmb3JtZXIoKSk7XG5cdFx0dGhpcy50cmFuc2Zvcm1lci50cmFuc2Zvcm1lcnMucHVzaChuZXcgVHJhY2ViYWNrVHJhbnNmb3JtZXIoKSk7XG5cdFx0dGhpcy50cmFuc2Zvcm1lci50cmFuc2Zvcm1lcnMucHVzaChuZXcgTWFya2Rvd25UcmFuc2Zvcm1lcigpKTtcblx0XHR0aGlzLnRyYW5zZm9ybWVyLnRyYW5zZm9ybWVycy5wdXNoKG5ldyBMYVRlWFRyYW5zZm9ybWVyKCkpO1xuXHRcdHRoaXMudHJhbnNmb3JtZXIudHJhbnNmb3JtZXJzLnB1c2gobmV3IFBERlRyYW5zZm9ybWVyKCkpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvdXRwdXRzOiBbXVxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy50cmFuc2Zvcm1NaW1lQnVuZGxlKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnRyYW5zZm9ybU1pbWVCdW5kbGUobmV4dFByb3BzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjZWxsLWRpc3BsYXktYXJlYSBuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiB0aGlzLnN0YXRlLm91dHB1dHMuam9pbignJyl9fVxuICAgICAgPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHRyYW5zZm9ybU1pbWVCdW5kbGUocHJvcHMpIHtcbiAgICBpZiAocHJvcHMuZGF0YS5nZXQoJ291dHB1dHMnKSkge1xuICAgICAgbGV0IHByb21pc2VzID0gcHJvcHMuZGF0YS5nZXQoJ291dHB1dHMnKS50b0pTKCkubWFwKG91dHB1dCA9PiB7XG4gICAgICAgIGxldCBtaW1lQnVuZGxlID0gdGhpcy5tYWtlTWltZUJ1bmRsZShvdXRwdXQpO1xuICAgICAgICBpZiAobWltZUJ1bmRsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVyLnRyYW5zZm9ybVJpY2hlc3QobWltZUJ1bmRsZSwgZG9jdW1lbnQpLnRoZW4obWltZSA9PiBtaW1lLmVsLm91dGVySFRNTCk7XG4gICAgICAgIH0gZWxzZSByZXR1cm47XG4gIFx0XHR9KTtcbiAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKG91dHB1dHMgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtvdXRwdXRzfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBtYWtlTWltZUJ1bmRsZShtc2cpIHtcbiAgXHRsZXQgYnVuZGxlID0ge307XG4gIFx0c3dpdGNoIChtc2cub3V0cHV0X3R5cGUpIHtcbiAgXHRcdGNhc2UgJ2V4ZWN1dGVfcmVzdWx0JzpcbiAgXHRcdGNhc2UgJ2Rpc3BsYXlfZGF0YSc6XG4gIFx0XHRcdGJ1bmRsZSA9IG1zZy5kYXRhO1xuICBcdFx0XHRicmVhaztcbiAgXHRcdGNhc2UgJ3N0cmVhbSc6XG4gIFx0XHRcdGJ1bmRsZSA9IHsndGV4dC9wbGFpbic6IG1zZy50ZXh0LmpvaW4oJycpfTtcbiAgXHRcdFx0Ly8gYnVuZGxlID0geydqdXB5dGVyL3N0cmVhbSc6IG1zZ307XG4gIFx0XHRcdGJyZWFrO1xuICBcdFx0Y2FzZSAnZXJyb3InOlxuICBcdFx0XHRidW5kbGUgPSB7XG4gIFx0XHRcdFx0J2p1cHl0ZXIvdHJhY2ViYWNrJzogbXNnXG4gIFx0XHRcdH07XG4gIFx0XHRcdGJyZWFrO1xuICBcdFx0ZGVmYXVsdDpcbiAgXHRcdFx0Y29uc29sZS53YXJuKCdVbnJlY29nbml6ZWQgb3V0cHV0IHR5cGU6ICcgKyBtc2cub3V0cHV0X3R5cGUpO1xuICBcdFx0XHRidW5kbGUgPSB7XG4gIFx0XHRcdFx0J3RleHQvcGxhaW4nOiAnVW5yZWNvZ25pemVkIG91dHB1dCB0eXBlJyArIEpTT04uc3RyaW5naWZ5KG1zZylcbiAgXHRcdFx0fTtcbiAgXHR9XG4gIFx0cmV0dXJuIGJ1bmRsZTtcbiAgfVxuXG59XG4iXX0=
//# sourceURL=/Users/Rad/Documents/Dev/atom-notebook/lib/display-area.js
