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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL2xpYi9taW5pbWFwLWN1cnNvcmxpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFBOztBQUlYLElBQUksd0JBQXdCLEdBQUcsSUFBSSxDQUFBOztxQkFFcEI7O0FBRWIsUUFBTSxFQUFFLEtBQUs7O0FBRWIsVUFBUSxFQUFDLG9CQUFHO0FBQUUsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0dBQUU7O0FBRWxDLFVBQVEsRUFBRSxFQUFFOztBQUVaLFVBQVEsRUFBQyxrQkFBQyxLQUFLLEVBQUUsRUFBRTs7QUFFbkIseUJBQXVCLEVBQUMsaUNBQUMsT0FBTyxFQUFFO0FBQ2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUNoRDs7QUFFRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUFFLGFBQU07S0FBRTtBQUM3QixRQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzNDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0dBQ3BCOztBQUVELGdCQUFjLEVBQUMsMEJBQUc7OztBQUNoQixRQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFBRSxhQUFNO0tBQUU7O0FBRTNCLFFBQUksQ0FBQyxhQUFhLEdBQUcsVUE1QmhCLG1CQUFtQixFQTRCc0IsQ0FBQTtBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ3BFLFVBQUksd0JBQXdCLEtBQUssSUFBSSxFQUFFO0FBQ3JDLGdDQUF3QixHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO09BQ25FOztBQUVELFVBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUE7QUFDckIsVUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNyRCxZQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUE7O0FBRTNCLFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUM5QyxlQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDakIsY0FBSyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3ZDLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdEIsZUFBTyxNQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUN6QixDQUFDLENBQUE7O0FBRUYsWUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3JDLENBQUMsQ0FBQTtHQUNIOztBQUVELGtCQUFnQixFQUFDLDRCQUFHO0FBQ2xCLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQUUsYUFBTTtLQUFFOztBQUU1QixTQUFLLElBQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFBRSxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQUU7QUFDL0QsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7QUFDbkIsUUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ25DLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDN0I7O0NBRUYiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWN1cnNvcmxpbmUvbGliL21pbmltYXAtY3Vyc29ybGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG52YXIgTWluaW1hcEN1cnNvckxpbmVCaW5kaW5nID0gbnVsbFxuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgYWN0aXZlOiBmYWxzZSxcblxuICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9LFxuXG4gIGJpbmRpbmdzOiB7fSxcblxuICBhY3RpdmF0ZSAoc3RhdGUpIHt9LFxuXG4gIGNvbnN1bWVNaW5pbWFwU2VydmljZVYxIChtaW5pbWFwKSB7XG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMubWluaW1hcC5yZWdpc3RlclBsdWdpbignY3Vyc29ybGluZScsIHRoaXMpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICB0aGlzLm1pbmltYXAudW5yZWdpc3RlclBsdWdpbignY3Vyc29ybGluZScpXG4gICAgdGhpcy5taW5pbWFwID0gbnVsbFxuICB9LFxuXG4gIGFjdGl2YXRlUGx1Z2luICgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcblxuICAgIHRoaXMubWluaW1hcHNTdWJzY3JpcHRpb24gPSB0aGlzLm1pbmltYXAub2JzZXJ2ZU1pbmltYXBzKChtaW5pbWFwKSA9PiB7XG4gICAgICBpZiAoTWluaW1hcEN1cnNvckxpbmVCaW5kaW5nID09PSBudWxsKSB7XG4gICAgICAgIE1pbmltYXBDdXJzb3JMaW5lQmluZGluZyA9IHJlcXVpcmUoJy4vbWluaW1hcC1jdXJzb3JsaW5lLWJpbmRpbmcnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBpZCA9IG1pbmltYXAuaWRcbiAgICAgIGNvbnN0IGJpbmRpbmcgPSBuZXcgTWluaW1hcEN1cnNvckxpbmVCaW5kaW5nKG1pbmltYXApXG4gICAgICB0aGlzLmJpbmRpbmdzW2lkXSA9IGJpbmRpbmdcblxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gbWluaW1hcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBiaW5kaW5nLmRlc3Ryb3koKVxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHN1YnNjcmlwdGlvbilcbiAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICBkZWxldGUgdGhpcy5iaW5kaW5nc1tpZF1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKVxuICAgIH0pXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkgeyByZXR1cm4gfVxuXG4gICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmJpbmRpbmdzKSB7IHRoaXMuYmluZGluZ3NbaWRdLmRlc3Ryb3koKSB9XG4gICAgdGhpcy5iaW5kaW5ncyA9IHt9XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgIHRoaXMubWluaW1hcHNTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG5cbn1cbiJdfQ==