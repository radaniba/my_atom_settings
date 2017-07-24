'use babel';

/*
 * The `HydrogenKernel` class wraps Hydrogen's internal representation of kernels
 * and exposes a small set of methods that should be usable by plugins.
 * @class HydrogenKernel
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var HydrogenKernel = (function () {
  function HydrogenKernel(_kernel) {
    _classCallCheck(this, HydrogenKernel);

    this._kernel = _kernel;
    this.destroyed = false;
  }

  _createClass(HydrogenKernel, [{
    key: '_assertNotDestroyed',
    value: function _assertNotDestroyed() {
      // Internal: plugins might hold references to long-destroyed kernels, so
      // all API calls should guard against this case
      if (this.destroyed) {
        throw new Error('HydrogenKernel: operation not allowed because the kernel has been destroyed');
      }
    }

    /*
     * Calls your callback when the kernel has been destroyed.
     * @param {Function} Callback
     */
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      this._assertNotDestroyed();
      this._kernel.emitter.on('did-destroy', callback);
    }

    /*
     * Get the [connection file](http://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Connecting%20with%20the%20Qt%20Console.html) of the kernel.
     * @return {String} Path to connection file.
     */
  }, {
    key: 'getConnectionFile',
    value: function getConnectionFile() {
      this._assertNotDestroyed();
      var connectionFile = this._kernel.connectionFile;

      if (!connectionFile) {
        throw new Error('No connection file for ' + this._kernel.kernelSpec.display_name + ' kernel found');
      }

      return connectionFile;
    }
  }]);

  return HydrogenKernel;
})();

exports['default'] = HydrogenKernel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3BsdWdpbi1hcGkvaHlkcm9nZW4ta2VybmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztJQVFTLGNBQWM7QUFDdEIsV0FEUSxjQUFjLENBQ3JCLE9BQU8sRUFBRTswQkFERixjQUFjOztBQUUvQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztHQUN4Qjs7ZUFKa0IsY0FBYzs7V0FNZCwrQkFBRzs7O0FBR3BCLFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixjQUFNLElBQUksS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7T0FDaEc7S0FDRjs7Ozs7Ozs7V0FNVyxzQkFBQyxRQUFRLEVBQUU7QUFDckIsVUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNsRDs7Ozs7Ozs7V0FNZ0IsNkJBQUc7QUFDbEIsVUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7VUFDbkIsY0FBYyxHQUFLLElBQUksQ0FBQyxPQUFPLENBQS9CLGNBQWM7O0FBQ3RCLFVBQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsY0FBTSxJQUFJLEtBQUssNkJBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksbUJBQWdCLENBQUM7T0FDaEc7O0FBRUQsYUFBTyxjQUFjLENBQUM7S0FDdkI7OztTQW5Da0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvcGx1Z2luLWFwaS9oeWRyb2dlbi1rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLypcbiAqIFRoZSBgSHlkcm9nZW5LZXJuZWxgIGNsYXNzIHdyYXBzIEh5ZHJvZ2VuJ3MgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2Yga2VybmVsc1xuICogYW5kIGV4cG9zZXMgYSBzbWFsbCBzZXQgb2YgbWV0aG9kcyB0aGF0IHNob3VsZCBiZSB1c2FibGUgYnkgcGx1Z2lucy5cbiAqIEBjbGFzcyBIeWRyb2dlbktlcm5lbFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh5ZHJvZ2VuS2VybmVsIHtcbiAgY29uc3RydWN0b3IoX2tlcm5lbCkge1xuICAgIHRoaXMuX2tlcm5lbCA9IF9rZXJuZWw7XG4gICAgdGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIF9hc3NlcnROb3REZXN0cm95ZWQoKSB7XG4gICAgLy8gSW50ZXJuYWw6IHBsdWdpbnMgbWlnaHQgaG9sZCByZWZlcmVuY2VzIHRvIGxvbmctZGVzdHJveWVkIGtlcm5lbHMsIHNvXG4gICAgLy8gYWxsIEFQSSBjYWxscyBzaG91bGQgZ3VhcmQgYWdhaW5zdCB0aGlzIGNhc2VcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSHlkcm9nZW5LZXJuZWw6IG9wZXJhdGlvbiBub3QgYWxsb3dlZCBiZWNhdXNlIHRoZSBrZXJuZWwgaGFzIGJlZW4gZGVzdHJveWVkJyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQ2FsbHMgeW91ciBjYWxsYmFjayB3aGVuIHRoZSBrZXJuZWwgaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBDYWxsYmFja1xuICAgKi9cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG4gICAgdGhpcy5fa2VybmVsLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgLypcbiAgICogR2V0IHRoZSBbY29ubmVjdGlvbiBmaWxlXShodHRwOi8vanVweXRlci1ub3RlYm9vay5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvZXhhbXBsZXMvTm90ZWJvb2svQ29ubmVjdGluZyUyMHdpdGglMjB0aGUlMjBRdCUyMENvbnNvbGUuaHRtbCkgb2YgdGhlIGtlcm5lbC5cbiAgICogQHJldHVybiB7U3RyaW5nfSBQYXRoIHRvIGNvbm5lY3Rpb24gZmlsZS5cbiAgICovXG4gIGdldENvbm5lY3Rpb25GaWxlKCkge1xuICAgIHRoaXMuX2Fzc2VydE5vdERlc3Ryb3llZCgpO1xuICAgIGNvbnN0IHsgY29ubmVjdGlvbkZpbGUgfSA9IHRoaXMuX2tlcm5lbDtcbiAgICBpZiAoIWNvbm5lY3Rpb25GaWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGNvbm5lY3Rpb24gZmlsZSBmb3IgJHt0aGlzLl9rZXJuZWwua2VybmVsU3BlYy5kaXNwbGF5X25hbWV9IGtlcm5lbCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiBjb25uZWN0aW9uRmlsZTtcbiAgfVxufVxuIl19