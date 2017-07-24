'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompletionProvider = require('./completion-provider');

var AutocompleteModulesPlugin = (function () {
  function AutocompleteModulesPlugin() {
    _classCallCheck(this, AutocompleteModulesPlugin);

    this.config = {
      vendors: {
        title: 'Vendor directories',
        description: 'A list of directories to search for modules relative to the project root.',
        type: 'array',
        'default': ['node_modules'],
        items: {
          type: 'string'
        }
      },
      webpack: {
        title: 'Webpack support',
        description: 'Attempts to use the given webpack configuration file resolution settings to search for modules.',
        type: 'boolean',
        'default': false
      },
      webpackConfigFilename: {
        title: 'Webpack configuration filename',
        description: 'When "Webpack support" is enabled this is the config file used to supply module search paths.',
        type: 'string',
        'default': 'webpack.config.js'
      }
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztJQUV0RCx5QkFBeUI7QUFDbEIsV0FEUCx5QkFBeUIsR0FDZjswQkFEVix5QkFBeUI7O0FBRTNCLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsb0JBQW9CO0FBQzNCLG1CQUFXLEVBQUUsMkVBQTJFO0FBQ3hGLFlBQUksRUFBRSxPQUFPO0FBQ2IsbUJBQVMsQ0FBQyxjQUFjLENBQUM7QUFDekIsYUFBSyxFQUFFO0FBQ0wsY0FBSSxFQUFFLFFBQVE7U0FDZjtPQUNGO0FBQ0QsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLGlCQUFpQjtBQUN4QixtQkFBVyxFQUFFLGlHQUFpRztBQUM5RyxZQUFJLEVBQUUsU0FBUztBQUNmLG1CQUFTLEtBQUs7T0FDZjtBQUNELDJCQUFxQixFQUFFO0FBQ3JCLGFBQUssRUFBRSxnQ0FBZ0M7QUFDdkMsbUJBQVcsRUFBRSwrRkFBK0Y7QUFDNUcsWUFBSSxFQUFFLFFBQVE7QUFDZCxtQkFBUyxtQkFBbUI7T0FDN0I7S0FDRixDQUFDO0dBQ0g7O2VBekJHLHlCQUF5Qjs7V0EyQnJCLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztLQUNwRDs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUMvQixVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0tBQ2hDOzs7V0FFb0IsaUNBQUc7QUFDdEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEM7OztTQXRDRyx5QkFBeUI7OztBQXlDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLHlCQUF5QixFQUFFLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtbW9kdWxlcy9zcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBDb21wbGV0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL2NvbXBsZXRpb24tcHJvdmlkZXInKTtcblxuY2xhc3MgQXV0b2NvbXBsZXRlTW9kdWxlc1BsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdmVuZG9yczoge1xuICAgICAgICB0aXRsZTogJ1ZlbmRvciBkaXJlY3RvcmllcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBsaXN0IG9mIGRpcmVjdG9yaWVzIHRvIHNlYXJjaCBmb3IgbW9kdWxlcyByZWxhdGl2ZSB0byB0aGUgcHJvamVjdCByb290LicsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHdlYnBhY2s6IHtcbiAgICAgICAgdGl0bGU6ICdXZWJwYWNrIHN1cHBvcnQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0F0dGVtcHRzIHRvIHVzZSB0aGUgZ2l2ZW4gd2VicGFjayBjb25maWd1cmF0aW9uIGZpbGUgcmVzb2x1dGlvbiBzZXR0aW5ncyB0byBzZWFyY2ggZm9yIG1vZHVsZXMuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHdlYnBhY2tDb25maWdGaWxlbmFtZToge1xuICAgICAgICB0aXRsZTogJ1dlYnBhY2sgY29uZmlndXJhdGlvbiBmaWxlbmFtZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBcIldlYnBhY2sgc3VwcG9ydFwiIGlzIGVuYWJsZWQgdGhpcyBpcyB0aGUgY29uZmlnIGZpbGUgdXNlZCB0byBzdXBwbHkgbW9kdWxlIHNlYXJjaCBwYXRocy4nLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3dlYnBhY2suY29uZmlnLmpzJ1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmNvbXBsZXRpb25Qcm92aWRlciA9IG5ldyBDb21wbGV0aW9uUHJvdmlkZXIoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgZGVsZXRlIHRoaXMuY29tcGxldGlvblByb3ZpZGVyO1xuICAgIHRoaXMuY29tcGxldGlvblByb3ZpZGVyID0gbnVsbDtcbiAgfVxuXG4gIGdldENvbXBsZXRpb25Qcm92aWRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wbGV0aW9uUHJvdmlkZXI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQXV0b2NvbXBsZXRlTW9kdWxlc1BsdWdpbigpO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/main.js
