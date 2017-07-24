Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

// View to display a list of grammars to apply to the current editor.
'use babel';

var SignalListView = (function (_SelectListView) {
  _inherits(SignalListView, _SelectListView);

  function SignalListView() {
    _classCallCheck(this, SignalListView);

    _get(Object.getPrototypeOf(SignalListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SignalListView, [{
    key: 'initialize',
    value: function initialize(getKernelSpecs) {
      this.getKernelSpecs = getKernelSpecs;
      _get(Object.getPrototypeOf(SignalListView.prototype), 'initialize', this).apply(this, arguments);

      this.onConfirmed = null;
      this.list.addClass('mark-active');
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      return 'name';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.cancel();
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(item) {
      var element = document.createElement('li');
      element.textContent = item.name;
      return element;
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      if (this.panel) this.panel.destroy();
      this.panel = null;
      this.editor = null;
    }
  }, {
    key: 'confirmed',
    value: function confirmed(item) {
      (0, _log2['default'])('Selected command:', item);
      if (this.onConfirmed) this.onConfirmed(item);
      this.cancel();
    }
  }, {
    key: 'attach',
    value: function attach() {
      var _this = this;

      this.storeFocusedElement();
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }
      this.focusFilterEditor();

      this.getKernelSpecs(function (kernelSpec) {
        _this.languageOptions = _lodash2['default'].map(kernelSpec, function (spec) {
          return {
            name: spec.display_name,
            kernelSpec: spec
          };
        });

        _this.setItems(_this.languageOptions);
      });
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return 'No running kernels found.';
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.panel) {
        this.cancel();
      } else if (atom.workspace.getActiveTextEditor()) {
        this.editor = atom.workspace.getActiveTextEditor();
        this.attach();
      }
    }
  }]);

  return SignalListView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = SignalListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC1waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7aUNBRStCLHNCQUFzQjs7c0JBQ3ZDLFFBQVE7Ozs7bUJBRU4sT0FBTzs7Ozs7QUFMdkIsV0FBVyxDQUFDOztJQVFTLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FDdkIsb0JBQUMsY0FBYyxFQUFFO0FBQ3pCLFVBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0FBQ3JDLGlDQUhpQixjQUFjLDZDQUdYLFNBQVMsRUFBRTs7QUFFL0IsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDbkM7OztXQUdXLHdCQUFHO0FBQ2IsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRVUscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFVBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsYUFBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2hDLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7V0FFUSxxQkFBRztBQUNWLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCw0QkFBSSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRUssa0JBQUc7OztBQUNQLFVBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQUUsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO09BQUU7QUFDL0UsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFVBQUksQ0FBQyxjQUFjLENBQUMsVUFBQyxVQUFVLEVBQUs7QUFDbEMsY0FBSyxlQUFlLEdBQUcsb0JBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFBLElBQUk7aUJBQzFDO0FBQ0MsZ0JBQUksRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN2QixzQkFBVSxFQUFFLElBQUk7V0FDakI7U0FBQyxDQUFDLENBQUM7O0FBRU4sY0FBSyxRQUFRLENBQUMsTUFBSyxlQUFlLENBQUMsQ0FBQztPQUNyQyxDQUFDLENBQUM7S0FDSjs7O1dBRWMsMkJBQUc7QUFDaEIsYUFBTywyQkFBMkIsQ0FBQztLQUNwQzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZixNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO0FBQy9DLFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ25ELFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmO0tBQ0Y7OztTQS9Ea0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIva2VybmVsLXBpY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBTZWxlY3RMaXN0VmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuXG4vLyBWaWV3IHRvIGRpc3BsYXkgYSBsaXN0IG9mIGdyYW1tYXJzIHRvIGFwcGx5IHRvIHRoZSBjdXJyZW50IGVkaXRvci5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpZ25hbExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXcge1xuICBpbml0aWFsaXplKGdldEtlcm5lbFNwZWNzKSB7XG4gICAgdGhpcy5nZXRLZXJuZWxTcGVjcyA9IGdldEtlcm5lbFNwZWNzO1xuICAgIHN1cGVyLmluaXRpYWxpemUoLi4uYXJndW1lbnRzKTtcblxuICAgIHRoaXMub25Db25maXJtZWQgPSBudWxsO1xuICAgIHRoaXMubGlzdC5hZGRDbGFzcygnbWFyay1hY3RpdmUnKTtcbiAgfVxuXG5cbiAgZ2V0RmlsdGVyS2V5KCkge1xuICAgIHJldHVybiAnbmFtZSc7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gIH1cblxuICB2aWV3Rm9ySXRlbShpdGVtKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIGNhbmNlbGxlZCgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgdGhpcy5lZGl0b3IgPSBudWxsO1xuICB9XG5cbiAgY29uZmlybWVkKGl0ZW0pIHtcbiAgICBsb2coJ1NlbGVjdGVkIGNvbW1hbmQ6JywgaXRlbSk7XG4gICAgaWYgKHRoaXMub25Db25maXJtZWQpIHRoaXMub25Db25maXJtZWQoaXRlbSk7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnN0b3JlRm9jdXNlZEVsZW1lbnQoKTtcbiAgICBpZiAoIXRoaXMucGFuZWwpIHsgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzIH0pOyB9XG4gICAgdGhpcy5mb2N1c0ZpbHRlckVkaXRvcigpO1xuXG4gICAgdGhpcy5nZXRLZXJuZWxTcGVjcygoa2VybmVsU3BlYykgPT4ge1xuICAgICAgdGhpcy5sYW5ndWFnZU9wdGlvbnMgPSBfLm1hcChrZXJuZWxTcGVjLCBzcGVjID0+XG4gICAgICAgICh7XG4gICAgICAgICAgbmFtZTogc3BlYy5kaXNwbGF5X25hbWUsXG4gICAgICAgICAga2VybmVsU3BlYzogc3BlYyxcbiAgICAgICAgfSkpO1xuXG4gICAgICB0aGlzLnNldEl0ZW1zKHRoaXMubGFuZ3VhZ2VPcHRpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEVtcHR5TWVzc2FnZSgpIHtcbiAgICByZXR1cm4gJ05vIHJ1bm5pbmcga2VybmVscyBmb3VuZC4nO1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSB7XG4gICAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgfVxuICB9XG59XG4iXX0=