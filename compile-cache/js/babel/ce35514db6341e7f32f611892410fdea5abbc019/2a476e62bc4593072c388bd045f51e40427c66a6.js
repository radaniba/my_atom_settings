'use babel';

/**
 * @version 1.0.0
 *
 *
 * The Plugin API allows you to make Hydrogen awesome.
 * You will be able to interact with this class in your Hydrogen Plugin using
 * Atom's [Service API](http://blog.atom.io/2015/03/25/new-services-API.html).
 *
 * Take a look at our [Example Plugin](https://github.com/lgeiger/hydrogen-example-plugin)
 * and the [Atom Flight Manual](http://flight-manual.atom.io/hacking-atom/) for
 * learning how to interact with Hydrogen in your own plugin.
 *
 * @class HydrogenProvider
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var HydrogenProvider = (function () {
  function HydrogenProvider(_hydrogen) {
    _classCallCheck(this, HydrogenProvider);

    this._hydrogen = _hydrogen;
    this._happy = true;
  }

  /*
   * Calls your callback when the kernel has changed.
   * @param {Function} Callback
   */

  _createClass(HydrogenProvider, [{
    key: 'onDidChangeKernel',
    value: function onDidChangeKernel(callback) {
      this._hydrogen.emitter.on('did-change-kernel', function (kernel) {
        if (kernel) {
          return callback(kernel.getPluginWrapper());
        }
        return callback(null);
      });
    }

    /*
     * Get the `HydrogenKernel` of the currently active text editor.
     * @return {Class} `HydrogenKernel`
     */
  }, {
    key: 'getActiveKernel',
    value: function getActiveKernel() {
      if (!this._hydrogen.kernel) {
        var grammar = this._hydrogen.editor.getGrammar();
        var language = this._hydrogen.kernelManager.getLanguageFor(grammar);
        throw new Error('No running kernel for language `' + language + '` found');
      }

      return this._hydrogen.kernel.getPluginWrapper();
    }
  }]);

  return HydrogenProvider;
})();

exports['default'] = HydrogenProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3BsdWdpbi1hcGkvaHlkcm9nZW4tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQlMsZ0JBQWdCO0FBQ3hCLFdBRFEsZ0JBQWdCLENBQ3ZCLFNBQVMsRUFBRTswQkFESixnQkFBZ0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOzs7Ozs7O2VBSmtCLGdCQUFnQjs7V0FVbEIsMkJBQUMsUUFBUSxFQUFFO0FBQzFCLFVBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLE1BQU0sRUFBSztBQUN6RCxZQUFJLE1BQU0sRUFBRTtBQUNWLGlCQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsZUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdkIsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7O1dBTWMsMkJBQUc7QUFDaEIsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQzFCLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ25ELFlBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0RSxjQUFNLElBQUksS0FBSyxzQ0FBcUMsUUFBUSxhQUFXLENBQUM7T0FDekU7O0FBRUQsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ2pEOzs7U0EvQmtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvcGx1Z2luLWFwaS9oeWRyb2dlbi1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vKipcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICpcbiAqIFRoZSBQbHVnaW4gQVBJIGFsbG93cyB5b3UgdG8gbWFrZSBIeWRyb2dlbiBhd2Vzb21lLlxuICogWW91IHdpbGwgYmUgYWJsZSB0byBpbnRlcmFjdCB3aXRoIHRoaXMgY2xhc3MgaW4geW91ciBIeWRyb2dlbiBQbHVnaW4gdXNpbmdcbiAqIEF0b20ncyBbU2VydmljZSBBUEldKGh0dHA6Ly9ibG9nLmF0b20uaW8vMjAxNS8wMy8yNS9uZXctc2VydmljZXMtQVBJLmh0bWwpLlxuICpcbiAqIFRha2UgYSBsb29rIGF0IG91ciBbRXhhbXBsZSBQbHVnaW5dKGh0dHBzOi8vZ2l0aHViLmNvbS9sZ2VpZ2VyL2h5ZHJvZ2VuLWV4YW1wbGUtcGx1Z2luKVxuICogYW5kIHRoZSBbQXRvbSBGbGlnaHQgTWFudWFsXShodHRwOi8vZmxpZ2h0LW1hbnVhbC5hdG9tLmlvL2hhY2tpbmctYXRvbS8pIGZvclxuICogbGVhcm5pbmcgaG93IHRvIGludGVyYWN0IHdpdGggSHlkcm9nZW4gaW4geW91ciBvd24gcGx1Z2luLlxuICpcbiAqIEBjbGFzcyBIeWRyb2dlblByb3ZpZGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh5ZHJvZ2VuUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihfaHlkcm9nZW4pIHtcbiAgICB0aGlzLl9oeWRyb2dlbiA9IF9oeWRyb2dlbjtcbiAgICB0aGlzLl9oYXBweSA9IHRydWU7XG4gIH1cblxuICAvKlxuICAgKiBDYWxscyB5b3VyIGNhbGxiYWNrIHdoZW4gdGhlIGtlcm5lbCBoYXMgY2hhbmdlZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gQ2FsbGJhY2tcbiAgICovXG4gIG9uRGlkQ2hhbmdlS2VybmVsKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5faHlkcm9nZW4uZW1pdHRlci5vbignZGlkLWNoYW5nZS1rZXJuZWwnLCAoa2VybmVsKSA9PiB7XG4gICAgICBpZiAoa2VybmVsKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhrZXJuZWwuZ2V0UGx1Z2luV3JhcHBlcigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIEdldCB0aGUgYEh5ZHJvZ2VuS2VybmVsYCBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSB0ZXh0IGVkaXRvci5cbiAgICogQHJldHVybiB7Q2xhc3N9IGBIeWRyb2dlbktlcm5lbGBcbiAgICovXG4gIGdldEFjdGl2ZUtlcm5lbCgpIHtcbiAgICBpZiAoIXRoaXMuX2h5ZHJvZ2VuLmtlcm5lbCkge1xuICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuX2h5ZHJvZ2VuLmVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuX2h5ZHJvZ2VuLmtlcm5lbE1hbmFnZXIuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHJ1bm5pbmcga2VybmVsIGZvciBsYW5ndWFnZSBcXGAke2xhbmd1YWdlfVxcYCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9oeWRyb2dlbi5rZXJuZWwuZ2V0UGx1Z2luV3JhcHBlcigpO1xuICB9XG59XG4iXX0=