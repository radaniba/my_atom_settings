'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StatusView = (function () {
  function StatusView(language) {
    _classCallCheck(this, StatusView);

    this.language = language;
    this.element = document.createElement('a');

    this.element.textContent = this.language + ': starting';
  }

  _createClass(StatusView, [{
    key: 'setStatus',
    value: function setStatus(status) {
      this.element.textContent = this.language + ': ' + status;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.element.textContent = '';
      this.element.remove();
    }
  }]);

  return StatusView;
})();

exports['default'] = StatusView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3N0YXR1cy12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLFVBQVU7QUFFbEIsV0FGUSxVQUFVLENBRWpCLFFBQVEsRUFBRTswQkFGSCxVQUFVOztBQUczQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTNDLFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFNLElBQUksQ0FBQyxRQUFRLGVBQVksQ0FBQztHQUN6RDs7ZUFQa0IsVUFBVTs7V0FVcEIsbUJBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFNLElBQUksQ0FBQyxRQUFRLFVBQUssTUFBTSxBQUFFLENBQUM7S0FDMUQ7OztXQUdNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7OztTQWxCa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvc3RhdHVzLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHVzVmlldyB7XG5cbiAgY29uc3RydWN0b3IobGFuZ3VhZ2UpIHtcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXG4gICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gYCR7dGhpcy5sYW5ndWFnZX06IHN0YXJ0aW5nYDtcbiAgfVxuXG5cbiAgc2V0U3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IGAke3RoaXMubGFuZ3VhZ2V9OiAke3N0YXR1c31gO1xuICB9XG5cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9ICcnO1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxufVxuIl19