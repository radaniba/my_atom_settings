Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

'use babel';

var MinimapCursorLineBinding = null;

exports['default'] = {

  active: false,

  isActive: function isActive() {
    return this.active;
  },

  bindings: {},

  activate: function activate(state) {},

  consumeMinimapServiceV1: function consumeMinimapServiceV1(minimap) {
    this.minimap = minimap;
    this.minimap.registerPlugin('cursorline', this);
  },

  deactivate: function deactivate() {
    if (!this.minimap) {
      return;
    }
    this.minimap.unregisterPlugin('cursorline');
    this.minimap = null;
  },

  activatePlugin: function activatePlugin() {
    var _this = this;

    if (this.active) {
      return;
    }

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;

    this.minimapsSubscription = this.minimap.observeMinimaps(function (minimap) {
      if (MinimapCursorLineBinding === null) {
        MinimapCursorLineBinding = require('./minimap-cursorline-binding');
      }

      var id = minimap.id;
      var binding = new MinimapCursorLineBinding(minimap);
      _this.bindings[id] = binding;

      var subscription = minimap.onDidDestroy(function () {
        binding.destroy();
        _this.subscriptions.remove(subscription);
        subscription.dispose();
        delete _this.bindings[id];
      });

      _this.subscriptions.add(subscription);
    });
  },

  deactivatePlugin: function deactivatePlugin() {
    if (!this.active) {
      return;
    }

    for (var id in this.bindings) {
      this.bindings[id].destroy();
    }
    this.bindings = {};
    this.active = false;
    this.minimapsSubscription.dispose();
    this.subscriptions.dispose();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL2xpYi9taW5pbWFwLWN1cnNvcmxpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFBOztBQUlYLElBQUksd0JBQXdCLEdBQUcsSUFBSSxDQUFBOztxQkFFcEI7O0FBRWIsUUFBTSxFQUFFLEtBQUs7O0FBRWIsVUFBUSxFQUFDLG9CQUFHO0FBQUUsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0dBQUU7O0FBRWxDLFVBQVEsRUFBRSxFQUFFOztBQUVaLFVBQVEsRUFBQyxrQkFBQyxLQUFLLEVBQUUsRUFBRTs7QUFFbkIseUJBQXVCLEVBQUMsaUNBQUMsT0FBTyxFQUFFO0FBQ2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUNoRDs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUFFLGFBQU07S0FBRTtBQUM3QixRQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzNDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0dBQ3BCOztBQUVELGdCQUFjLEVBQUMsMEJBQUc7OztBQUNoQixRQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFBRSxhQUFNO0tBQUU7O0FBRTNCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7O0FBRWxCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUNwRSxVQUFJLHdCQUF3QixLQUFLLElBQUksRUFBRTtBQUNyQyxnQ0FBd0IsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQTtPQUNuRTs7QUFFRCxVQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFBO0FBQ3JCLFVBQU0sT0FBTyxHQUFHLElBQUksd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDckQsWUFBSyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFBOztBQUUzQixVQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDOUMsZUFBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2pCLGNBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN2QyxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3RCLGVBQU8sTUFBSyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7T0FDekIsQ0FBQyxDQUFBOztBQUVGLFlBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUNyQyxDQUFDLENBQUE7R0FDSDs7QUFFRCxrQkFBZ0IsRUFBQyw0QkFBRztBQUNsQixRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUFFLGFBQU07S0FBRTs7QUFFNUIsU0FBSyxJQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQUUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUFFO0FBQy9ELFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO0FBQ25CLFFBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNuQyxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQzdCOztDQUVGIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL2xpYi9taW5pbWFwLWN1cnNvcmxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxudmFyIE1pbmltYXBDdXJzb3JMaW5lQmluZGluZyA9IG51bGxcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGFjdGl2ZTogZmFsc2UsXG5cbiAgaXNBY3RpdmUgKCkgeyByZXR1cm4gdGhpcy5hY3RpdmUgfSxcblxuICBiaW5kaW5nczoge30sXG5cbiAgYWN0aXZhdGUgKHN0YXRlKSB7fSxcblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMSAobWluaW1hcCkge1xuICAgIHRoaXMubWluaW1hcCA9IG1pbmltYXBcbiAgICB0aGlzLm1pbmltYXAucmVnaXN0ZXJQbHVnaW4oJ2N1cnNvcmxpbmUnLCB0aGlzKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgdGhpcy5taW5pbWFwLnVucmVnaXN0ZXJQbHVnaW4oJ2N1cnNvcmxpbmUnKVxuICAgIHRoaXMubWluaW1hcCA9IG51bGxcbiAgfSxcblxuICBhY3RpdmF0ZVBsdWdpbiAoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlXG5cbiAgICB0aGlzLm1pbmltYXBzU3Vic2NyaXB0aW9uID0gdGhpcy5taW5pbWFwLm9ic2VydmVNaW5pbWFwcygobWluaW1hcCkgPT4ge1xuICAgICAgaWYgKE1pbmltYXBDdXJzb3JMaW5lQmluZGluZyA9PT0gbnVsbCkge1xuICAgICAgICBNaW5pbWFwQ3Vyc29yTGluZUJpbmRpbmcgPSByZXF1aXJlKCcuL21pbmltYXAtY3Vyc29ybGluZS1iaW5kaW5nJylcbiAgICAgIH1cblxuICAgICAgY29uc3QgaWQgPSBtaW5pbWFwLmlkXG4gICAgICBjb25zdCBiaW5kaW5nID0gbmV3IE1pbmltYXBDdXJzb3JMaW5lQmluZGluZyhtaW5pbWFwKVxuICAgICAgdGhpcy5iaW5kaW5nc1tpZF0gPSBiaW5kaW5nXG5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IG1pbmltYXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgYmluZGluZy5kZXN0cm95KClcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb24pXG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgZGVsZXRlIHRoaXMuYmluZGluZ3NbaWRdXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbilcbiAgICB9KVxuICB9LFxuXG4gIGRlYWN0aXZhdGVQbHVnaW4gKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHsgcmV0dXJuIH1cblxuICAgIGZvciAoY29uc3QgaWQgaW4gdGhpcy5iaW5kaW5ncykgeyB0aGlzLmJpbmRpbmdzW2lkXS5kZXN0cm95KCkgfVxuICAgIHRoaXMuYmluZGluZ3MgPSB7fVxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICB0aGlzLm1pbmltYXBzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxuXG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/minimap-cursorline/lib/minimap-cursorline.js
