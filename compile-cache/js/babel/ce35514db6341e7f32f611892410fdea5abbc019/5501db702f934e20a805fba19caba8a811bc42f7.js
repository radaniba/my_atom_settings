'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompletionProvider = require('./completion-provider');

var AutocompleteModulesPlugin = (function () {
  function AutocompleteModulesPlugin() {
    _classCallCheck(this, AutocompleteModulesPlugin);

    this.config = {
      includeExtension: {
        title: 'Include file extension',
        description: "Include the file's extension when filling in the completion.",
        type: 'boolean',
        'default': false
      },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztJQUV0RCx5QkFBeUI7QUFDbEIsV0FEUCx5QkFBeUIsR0FDZjswQkFEVix5QkFBeUI7O0FBRTNCLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixzQkFBZ0IsRUFBRTtBQUNoQixhQUFLLEVBQUUsd0JBQXdCO0FBQy9CLG1CQUFXLEVBQUUsOERBQThEO0FBQzNFLFlBQUksRUFBRSxTQUFTO0FBQ2YsbUJBQVMsS0FBSztPQUNmO0FBQ0QsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLG9CQUFvQjtBQUMzQixtQkFBVyxFQUFFLDJFQUEyRTtBQUN4RixZQUFJLEVBQUUsT0FBTztBQUNiLG1CQUFTLENBQUMsY0FBYyxDQUFDO0FBQ3pCLGFBQUssRUFBRTtBQUNMLGNBQUksRUFBRSxRQUFRO1NBQ2Y7T0FDRjtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxpQkFBaUI7QUFDeEIsbUJBQVcsRUFBRSxpR0FBaUc7QUFDOUcsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxLQUFLO09BQ2Y7QUFDRCwyQkFBcUIsRUFBRTtBQUNyQixhQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLG1CQUFXLEVBQUUsK0ZBQStGO0FBQzVHLFlBQUksRUFBRSxRQUFRO0FBQ2QsbUJBQVMsbUJBQW1CO09BQzdCO0tBQ0YsQ0FBQztHQUNIOztlQS9CRyx5QkFBeUI7O1dBaUNyQixvQkFBRztBQUNULFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7S0FDcEQ7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7QUFDL0IsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztLQUNoQzs7O1dBRW9CLGlDQUFHO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hDOzs7U0E1Q0cseUJBQXlCOzs7QUErQy9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgQ29tcGxldGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9jb21wbGV0aW9uLXByb3ZpZGVyJyk7XG5cbmNsYXNzIEF1dG9jb21wbGV0ZU1vZHVsZXNQbHVnaW4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGluY2x1ZGVFeHRlbnNpb246IHtcbiAgICAgICAgdGl0bGU6ICdJbmNsdWRlIGZpbGUgZXh0ZW5zaW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSW5jbHVkZSB0aGUgZmlsZSdzIGV4dGVuc2lvbiB3aGVuIGZpbGxpbmcgaW4gdGhlIGNvbXBsZXRpb24uXCIsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIH0sXG4gICAgICB2ZW5kb3JzOiB7XG4gICAgICAgIHRpdGxlOiAnVmVuZG9yIGRpcmVjdG9yaWVzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGxpc3Qgb2YgZGlyZWN0b3JpZXMgdG8gc2VhcmNoIGZvciBtb2R1bGVzIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0IHJvb3QuJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgd2VicGFjazoge1xuICAgICAgICB0aXRsZTogJ1dlYnBhY2sgc3VwcG9ydCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQXR0ZW1wdHMgdG8gdXNlIHRoZSBnaXZlbiB3ZWJwYWNrIGNvbmZpZ3VyYXRpb24gZmlsZSByZXNvbHV0aW9uIHNldHRpbmdzIHRvIHNlYXJjaCBmb3IgbW9kdWxlcy4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgd2VicGFja0NvbmZpZ0ZpbGVuYW1lOiB7XG4gICAgICAgIHRpdGxlOiAnV2VicGFjayBjb25maWd1cmF0aW9uIGZpbGVuYW1lJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdXaGVuIFwiV2VicGFjayBzdXBwb3J0XCIgaXMgZW5hYmxlZCB0aGlzIGlzIHRoZSBjb25maWcgZmlsZSB1c2VkIHRvIHN1cHBseSBtb2R1bGUgc2VhcmNoIHBhdGhzLicsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnd2VicGFjay5jb25maWcuanMnXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuY29tcGxldGlvblByb3ZpZGVyID0gbmV3IENvbXBsZXRpb25Qcm92aWRlcigpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBkZWxldGUgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXI7XG4gICAgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXIgPSBudWxsO1xuICB9XG5cbiAgZ2V0Q29tcGxldGlvblByb3ZpZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBsZXRpb25Qcm92aWRlcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBdXRvY29tcGxldGVNb2R1bGVzUGx1Z2luKCk7XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/main.js
