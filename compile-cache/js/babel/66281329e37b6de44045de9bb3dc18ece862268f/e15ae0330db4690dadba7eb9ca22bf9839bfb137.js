'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompletionProvider = require('./completion-provider');

var AutocompleteModulesPlugin = (function () {
  function AutocompleteModulesPlugin() {
    _classCallCheck(this, AutocompleteModulesPlugin);
  }

  _createClass(AutocompleteModulesPlugin, [{
    key: 'activate',
    value: function activate() {
      this.completionProvider = new CompletionProvider();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      delete this.completionProvider;
      this.completionProvider = null;
    }
  }, {
    key: 'getCompletionProvider',
    value: function getCompletionProvider() {
      return this.completionProvider;
    }
  }]);

  return AutocompleteModulesPlugin;
})();

module.exports = new AutocompleteModulesPlugin();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztJQUV0RCx5QkFBeUI7V0FBekIseUJBQXlCOzBCQUF6Qix5QkFBeUI7OztlQUF6Qix5QkFBeUI7O1dBQ3JCLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztLQUNwRDs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUMvQixVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0tBQ2hDOzs7V0FFb0IsaUNBQUc7QUFDdEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEM7OztTQVpHLHlCQUF5Qjs7O0FBZS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgQ29tcGxldGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9jb21wbGV0aW9uLXByb3ZpZGVyJyk7XG5cbmNsYXNzIEF1dG9jb21wbGV0ZU1vZHVsZXNQbHVnaW4ge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmNvbXBsZXRpb25Qcm92aWRlciA9IG5ldyBDb21wbGV0aW9uUHJvdmlkZXIoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgZGVsZXRlIHRoaXMuY29tcGxldGlvblByb3ZpZGVyO1xuICAgIHRoaXMuY29tcGxldGlvblByb3ZpZGVyID0gbnVsbDtcbiAgfVxuXG4gIGdldENvbXBsZXRpb25Qcm92aWRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wbGV0aW9uUHJvdmlkZXI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQXV0b2NvbXBsZXRlTW9kdWxlc1BsdWdpbigpO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/main.js
