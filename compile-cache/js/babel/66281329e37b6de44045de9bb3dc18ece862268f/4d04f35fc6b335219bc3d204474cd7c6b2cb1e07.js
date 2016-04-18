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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztJQUV0RCx5QkFBeUI7QUFDbEIsV0FEUCx5QkFBeUIsR0FDZjswQkFEVix5QkFBeUI7O0FBRTNCLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsb0JBQW9CO0FBQzNCLG1CQUFXLEVBQUUsMkVBQTJFO0FBQ3hGLFlBQUksRUFBRSxPQUFPO0FBQ2IsbUJBQVMsQ0FBQyxjQUFjLENBQUM7QUFDekIsYUFBSyxFQUFFO0FBQ0wsY0FBSSxFQUFFLFFBQVE7U0FDZjtPQUNGO0tBQ0YsQ0FBQztHQUNIOztlQWJHLHlCQUF5Qjs7V0FlckIsb0JBQUc7QUFDVCxVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0tBQ3BEOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0FBQy9CLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7S0FDaEM7OztXQUVvQixpQ0FBRztBQUN0QixhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNoQzs7O1NBMUJHLHlCQUF5Qjs7O0FBNkIvQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUkseUJBQXlCLEVBQUUsQ0FBQyIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1tb2R1bGVzL3NyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IENvbXBsZXRpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vY29tcGxldGlvbi1wcm92aWRlcicpO1xuXG5jbGFzcyBBdXRvY29tcGxldGVNb2R1bGVzUGx1Z2luIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB2ZW5kb3JzOiB7XG4gICAgICAgIHRpdGxlOiAnVmVuZG9yIGRpcmVjdG9yaWVzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGxpc3Qgb2YgZGlyZWN0b3JpZXMgdG8gc2VhcmNoIGZvciBtb2R1bGVzIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0IHJvb3QuJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuY29tcGxldGlvblByb3ZpZGVyID0gbmV3IENvbXBsZXRpb25Qcm92aWRlcigpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBkZWxldGUgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXI7XG4gICAgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXIgPSBudWxsO1xuICB9XG5cbiAgZ2V0Q29tcGxldGlvblByb3ZpZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBsZXRpb25Qcm92aWRlcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBdXRvY29tcGxldGVNb2R1bGVzUGx1Z2luKCk7XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/main.js
