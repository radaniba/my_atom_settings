Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var SignalListView = (function (_SelectListView) {
  _inherits(SignalListView, _SelectListView);

  function SignalListView() {
    _classCallCheck(this, SignalListView);

    _get(Object.getPrototypeOf(SignalListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SignalListView, [{
    key: 'initialize',
    value: function initialize() {
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

      if (this.onConfirmed) {
        this.onConfirmed(item);
      }
      this.cancel();
    }
  }, {
    key: 'attach',
    value: function attach() {
      this.storeFocusedElement();
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }
      this.focusFilterEditor();
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return 'No watches found.';
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

exports['default'] = new SignalListView();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dhdGNoZXMtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2lDQUUrQixzQkFBc0I7O21CQUVyQyxPQUFPOzs7O0FBSnZCLFdBQVcsQ0FBQzs7SUFNTixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7OztlQUFkLGNBQWM7O1dBQ1Isc0JBQUc7QUFDWCxpQ0FGRSxjQUFjLDZDQUVJLFNBQVMsRUFBRTtBQUMvQixVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQzs7O1dBRVcsd0JBQUc7QUFDYixhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFVSxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsVUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxhQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDaEMsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztXQUVRLHFCQUFHO0FBQ1YsVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7S0FDcEI7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLDRCQUFJLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDOztBQUUvQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN4QjtBQUNELFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQUUsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO09BQUU7QUFDL0UsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDMUI7OztXQUVjLDJCQUFHO0FBQ2hCLGFBQU8sbUJBQW1CLENBQUM7S0FDNUI7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ2YsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtBQUMvQyxZQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNuRCxZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZjtLQUNGOzs7U0FyREcsY0FBYzs7O3FCQXdETCxJQUFJLGNBQWMsRUFBRSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93YXRjaGVzLXBpY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBTZWxlY3RMaXN0VmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuaW1wb3J0IGxvZyBmcm9tICcuL2xvZyc7XG5cbmNsYXNzIFNpZ25hbExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXcge1xuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLm9uQ29uZmlybWVkID0gbnVsbDtcbiAgICB0aGlzLmxpc3QuYWRkQ2xhc3MoJ21hcmstYWN0aXZlJyk7XG4gIH1cblxuICBnZXRGaWx0ZXJLZXkoKSB7XG4gICAgcmV0dXJuICduYW1lJztcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgfVxuXG4gIHZpZXdGb3JJdGVtKGl0ZW0pIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgY2FuY2VsbGVkKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICB0aGlzLmVkaXRvciA9IG51bGw7XG4gIH1cblxuICBjb25maXJtZWQoaXRlbSkge1xuICAgIGxvZygnU2VsZWN0ZWQgY29tbWFuZDonLCBpdGVtKTtcblxuICAgIGlmICh0aGlzLm9uQ29uZmlybWVkKSB7XG4gICAgICB0aGlzLm9uQ29uZmlybWVkKGl0ZW0pO1xuICAgIH1cbiAgICB0aGlzLmNhbmNlbCgpO1xuICB9XG5cbiAgYXR0YWNoKCkge1xuICAgIHRoaXMuc3RvcmVGb2N1c2VkRWxlbWVudCgpO1xuICAgIGlmICghdGhpcy5wYW5lbCkgeyB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSk7IH1cbiAgICB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCk7XG4gIH1cblxuICBnZXRFbXB0eU1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuICdObyB3YXRjaGVzIGZvdW5kLic7XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfSBlbHNlIGlmIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFNpZ25hbExpc3RWaWV3KCk7XG4iXX0=