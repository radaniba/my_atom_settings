'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs').readdir);
var path = require('path');
var fuzzaldrin = require('fuzzaldrin');
var escapeRegExp = require('lodash.escaperegexp');
var get = require('lodash.get');
var internalModules = require('./internal-modules');

var LINE_REGEXP = /require|import|export\s+(?:\*|{[a-zA-Z0-9_$,\s]+})+\s+from|}\s*from\s*['"]/;
var SELECTOR = ['.source.js .string.quoted',
// for babel-language plugin
'.source.js .punctuation.definition.string.begin', '.source.ts .string.quoted', '.source.coffee .string.quoted'];
var SELECTOR_DISABLE = ['.source.js .comment', '.source.js .keyword', '.source.ts .comment', '.source.ts .keyword'];

var CompletionProvider = (function () {
  function CompletionProvider() {
    _classCallCheck(this, CompletionProvider);

    this.selector = SELECTOR.join(', ');
    this.disableForSelector = SELECTOR_DISABLE.join(', ');
    this.inclusionPriority = 1;
  }

  _createClass(CompletionProvider, [{
    key: 'getSuggestions',
    value: function getSuggestions(_ref3) {
      var _this = this;

      var editor = _ref3.editor;
      var bufferPosition = _ref3.bufferPosition;
      var prefix = _ref3.prefix;

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (!LINE_REGEXP.test(line)) {
        return [];
      }

      var realPrefix = this.getRealPrefix(prefix, line);
      if (!realPrefix) {
        return [];
      }

      if (realPrefix[0] === '.') {
        return this.lookupLocal(realPrefix, path.dirname(editor.getPath()));
      }

      var vendors = atom.config.get('autocomplete-modules.vendors');

      var promises = vendors.map(function (vendor) {
        return _this.lookupGlobal(realPrefix, vendor);
      });

      var webpack = atom.config.get('autocomplete-modules.webpack');
      if (webpack) {
        promises.push(this.lookupWebpack(realPrefix));
      }

      return Promise.all(promises).then(function (suggestions) {
        var _ref;

        return (_ref = []).concat.apply(_ref, _toConsumableArray(suggestions));
      });
    }
  }, {
    key: 'getRealPrefix',
    value: function getRealPrefix(prefix, line) {
      try {
        var realPrefixRegExp = new RegExp('[\'"]((?:.+?)*' + escapeRegExp(prefix) + ')');
        var realPrefixMathes = realPrefixRegExp.exec(line);
        if (!realPrefixMathes) {
          return false;
        }

        return realPrefixMathes[1];
      } catch (e) {
        return false;
      }
    }
  }, {
    key: 'filterSuggestions',
    value: function filterSuggestions(prefix, suggestions) {
      return fuzzaldrin.filter(suggestions, prefix, {
        key: 'text'
      });
    }
  }, {
    key: 'lookupLocal',
    value: function lookupLocal(prefix, dirname) {
      var _this2 = this;

      var filterPrefix = prefix.replace(path.dirname(prefix), '').replace('/', '');
      if (filterPrefix[filterPrefix.length - 1] === '/') {
        filterPrefix = '';
      }

      var includeExtension = atom.config.get('autocomplete-modules.includeExtension');
      var lookupDirname = path.resolve(dirname, prefix);
      if (filterPrefix) {
        lookupDirname = lookupDirname.replace(new RegExp(escapeRegExp(filterPrefix) + '$'), '');
      }

      return readdir(lookupDirname)['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }

        return [];
      }).filter(function (filename) {
        return filename[0] !== '.';
      }).map(function (pathname) {
        return {
          text: includeExtension ? pathname : _this2.normalizeLocal(pathname),
          displayText: pathname,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this2.filterSuggestions(filterPrefix, suggestions);
      });
    }
  }, {
    key: 'normalizeLocal',
    value: function normalizeLocal(filename) {
      return filename.replace(/\.(js|es6|jsx|coffee|ts|tsx)$/, '');
    }
  }, {
    key: 'lookupGlobal',
    value: function lookupGlobal(prefix) {
      var _this3 = this;

      var vendor = arguments[1] === undefined ? 'node_modules' : arguments[1];

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return Promise.resolve([]);
      }

      var vendorPath = path.join(projectPath, vendor);
      if (prefix.indexOf('/') !== -1) {
        return this.lookupLocal('./' + prefix, vendorPath);
      }

      return readdir(vendorPath)['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }

        return [];
      }).then(function (libs) {
        return [].concat(_toConsumableArray(internalModules), _toConsumableArray(libs));
      }).map(function (lib) {
        return {
          text: lib,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this3.filterSuggestions(prefix, suggestions);
      });
    }
  }, {
    key: 'lookupWebpack',
    value: function lookupWebpack(prefix) {
      var _this4 = this;

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return Promise.resolve([]);
      }

      var vendors = atom.config.get('autocomplete-modules.vendors');
      var webpackConfig = this.fetchWebpackConfig(projectPath);

      var moduleSearchPaths = get(webpackConfig, 'resolve.modulesDirectories', []);
      moduleSearchPaths = moduleSearchPaths.filter(function (item) {
        return vendors.indexOf(item) === -1;
      });

      return Promise.all(moduleSearchPaths.map(function (searchPath) {
        return _this4.lookupLocal(prefix, searchPath);
      })).then(function (suggestions) {
        var _ref2;

        return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(suggestions));
      });
    }
  }, {
    key: 'fetchWebpackConfig',
    value: function fetchWebpackConfig(rootPath) {
      var webpackConfigFilename = atom.config.get('autocomplete-modules.webpackConfigFilename');
      var webpackConfigPath = path.join(rootPath, webpackConfigFilename);

      try {
        return require(webpackConfigPath); // eslint-disable-line
      } catch (error) {
        return {};
      }
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7OztBQUVaLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNsQyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdEQsSUFBTSxXQUFXLEdBQUcsNEVBQTRFLENBQUM7QUFDakcsSUFBTSxRQUFRLEdBQUcsQ0FDZiwyQkFBMkI7O0FBRTNCLGlEQUFpRCxFQUNqRCwyQkFBMkIsRUFDM0IsK0JBQStCLENBQ2hDLENBQUM7QUFDRixJQUFNLGdCQUFnQixHQUFHLENBQ3ZCLHFCQUFxQixFQUNyQixxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLHFCQUFxQixDQUN0QixDQUFDOztJQUVJLGtCQUFrQjtBQUNYLFdBRFAsa0JBQWtCLEdBQ1I7MEJBRFYsa0JBQWtCOztBQUVwQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxRQUFJLENBQUMs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RyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDaEUsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUzRCxVQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0UsdUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUMxQyxVQUFDLElBQUk7ZUFBSyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLENBQ3ZDLENBQUM7O0FBRUYsYUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FDdEMsVUFBQyxVQUFVO2VBQUssT0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztPQUFBLENBQ3JELENBQUMsQ0FBQyxJQUFJLENBQ0wsVUFBQyxXQUFXOzs7ZUFBSyxTQUFBLEVBQUUsRUFBQyxNQUFNLE1BQUEsMkJBQUksV0FBVyxFQUFDO09BQUEsQ0FDM0MsQ0FBQztLQUNIOzs7V0FFaUIsNEJBQUMsUUFBUSxFQUFFO0FBQzNCLFVBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUM1RixVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUM7O0FBRXJFLFVBQUk7QUFDRixlQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQ25DLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0tBQ0Y7OztTQXBKRyxrQkFBa0I7OztBQXVKeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1tb2R1bGVzL3NyYy9jb21wbGV0aW9uLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuY29uc3QgcmVhZGRpciA9IFByb21pc2UucHJvbWlzaWZ5KHJlcXVpcmUoJ2ZzJykucmVhZGRpcik7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnV6emFsZHJpbiA9IHJlcXVpcmUoJ2Z1enphbGRyaW4nKTtcbmNvbnN0IGVzY2FwZVJlZ0V4cCA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGVyZWdleHAnKTtcbmNvbnN0IGdldCA9IHJlcXVpcmUoJ2xvZGFzaC5nZXQnKTtcbmNvbnN0IGludGVybmFsTW9kdWxlcyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwtbW9kdWxlcycpO1xuXG5jb25zdCBMSU5FX1JFR0VYUCA9IC9yZXF1aXJlfGltcG9ydHxleHBvcnRcXHMrKD86XFwqfHtbYS16QS1aMC05XyQsXFxzXSt9KStcXHMrZnJvbXx9XFxzKmZyb21cXHMqWydcIl0vO1xuY29uc3QgU0VMRUNUT1IgPSBbXG4gICcuc291cmNlLmpzIC5zdHJpbmcucXVvdGVkJyxcbiAgLy8gZm9yIGJhYmVsLWxhbmd1YWdlIHBsdWdpblxuICAnLnNvdXJjZS5qcyAucHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4nLFxuICAnLnNvdXJjZS50cyAuc3RyaW5nLnF1b3RlZCcsXG4gICcuc291cmNlLmNvZmZlZSAuc3RyaW5nLnF1b3RlZCdcbl07XG5jb25zdCBTRUxFQ1RPUl9ESVNBQkxFID0gW1xuICAnLnNvdXJjZS5qcyAuY29tbWVudCcsXG4gICcuc291cmNlLmpzIC5rZXl3b3JkJyxcbiAgJy5zb3VyY2UudHMgLmNvbW1lbnQnLFxuICAnLnNvdXJjZS50cyAua2V5d29yZCdcbl07XG5cbmNsYXNzIENvbXBsZXRpb25Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBTRUxFQ1RPUi5qb2luKCcsICcpO1xuICAgIHRoaXMuZGlzYWJsZUZvclNlbGVjdG9yID0gU0VMRUNUT1JfRElTQUJMRS5qb2luKCcsICcpO1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAxO1xuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnMoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeH0pIHtcbiAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKTtcbiAgICBpZiAoIUxJTkVfUkVHRVhQLnRlc3QobGluZSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCByZWFsUHJlZml4ID0gdGhpcy5nZXRSZWFsUHJlZml4KHByZWZpeCwgbGluZSk7XG4gICAgaWYgKCFyZWFsUHJlZml4KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKHJlYWxQcmVmaXhbMF0gPT09ICcuJykge1xuICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwocmVhbFByZWZpeCwgcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZW5kb3JzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy52ZW5kb3JzJyk7XG5cbiAgICBjb25zdCBwcm9taXNlcyA9IHZlbmRvcnMubWFwKFxuICAgICAgKHZlbmRvcikgPT4gdGhpcy5sb29rdXBHbG9iYWwocmVhbFByZWZpeCwgdmVuZG9yKVxuICAgICk7XG5cbiAgICBjb25zdCB3ZWJwYWNrID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy53ZWJwYWNrJyk7XG4gICAgaWYgKHdlYnBhY2spIHtcbiAgICAgIHByb21pc2VzLnB1c2godGhpcy5sb29rdXBXZWJwYWNrKHJlYWxQcmVmaXgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oXG4gICAgICAoc3VnZ2VzdGlvbnMpID0+IFtdLmNvbmNhdCguLi5zdWdnZXN0aW9ucylcbiAgICApO1xuICB9XG5cbiAgZ2V0UmVhbFByZWZpeChwcmVmaXgsIGxpbmUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVhbFByZWZpeFJlZ0V4cCA9IG5ldyBSZWdFeHAoYFsnXCJdKCg/Oi4rPykqJHtlc2NhcGVSZWdFeHAocHJlZml4KX0pYCk7XG4gICAgICBjb25zdCByZWFsUHJlZml4TWF0aGVzID0gcmVhbFByZWZpeFJlZ0V4cC5leGVjKGxpbmUpO1xuICAgICAgaWYgKCFyZWFsUHJlZml4TWF0aGVzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlYWxQcmVmaXhNYXRoZXNbMV07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZpbHRlclN1Z2dlc3Rpb25zKHByZWZpeCwgc3VnZ2VzdGlvbnMpIHtcbiAgICByZXR1cm4gZnV6emFsZHJpbi5maWx0ZXIoc3VnZ2VzdGlvbnMsIHByZWZpeCwge1xuICAgICAga2V5OiAndGV4dCdcbiAgICB9KTtcbiAgfVxuXG4gIGxvb2t1cExvY2FsKHByZWZpeCwgZGlybmFtZSkge1xuICAgIGxldCBmaWx0ZXJQcmVmaXggPSBwcmVmaXgucmVwbGFjZShwYXRoLmRpcm5hbWUocHJlZml4KSwgJycpLnJlcGxhY2UoJy8nLCAnJyk7XG4gICAgaWYgKGZpbHRlclByZWZpeFtmaWx0ZXJQcmVmaXgubGVuZ3RoIC0gMV0gPT09ICcvJykge1xuICAgICAgZmlsdGVyUHJlZml4ID0gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkZUV4dGVuc2lvbiA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMuaW5jbHVkZUV4dGVuc2lvbicpO1xuICAgIGxldCBsb29rdXBEaXJuYW1lID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUsIHByZWZpeCk7XG4gICAgaWYgKGZpbHRlclByZWZpeCkge1xuICAgICAgbG9va3VwRGlybmFtZSA9IGxvb2t1cERpcm5hbWUucmVwbGFjZShuZXcgUmVnRXhwKGAke2VzY2FwZVJlZ0V4cChmaWx0ZXJQcmVmaXgpfSRgKSwgJycpO1xuICAgIH1cblxuICAgIHJldHVybiByZWFkZGlyKGxvb2t1cERpcm5hbWUpLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfSkuZmlsdGVyKFxuICAgICAgKGZpbGVuYW1lKSA9PiBmaWxlbmFtZVswXSAhPT0gJy4nXG4gICAgKS5tYXAoKHBhdGhuYW1lKSA9PiAoe1xuICAgICAgdGV4dDogaW5jbHVkZUV4dGVuc2lvbiA/IHBhdGhuYW1lIDogdGhpcy5ub3JtYWxpemVMb2NhbChwYXRobmFtZSksXG4gICAgICBkaXNwbGF5VGV4dDogcGF0aG5hbWUsXG4gICAgICB0eXBlOiAncGFja2FnZSdcbiAgICB9KSkudGhlbihcbiAgICAgIChzdWdnZXN0aW9ucykgPT4gdGhpcy5maWx0ZXJTdWdnZXN0aW9ucyhmaWx0ZXJQcmVmaXgsIHN1Z2dlc3Rpb25zKVxuICAgICk7XG4gIH1cblxuICBub3JtYWxpemVMb2NhbChmaWxlbmFtZSkge1xuICAgIHJldHVybiBmaWxlbmFtZS5yZXBsYWNlKC9cXC4oanN8ZXM2fGpzeHxjb2ZmZWV8dHN8dHN4KSQvLCAnJyk7XG4gIH1cblxuICBsb29rdXBHbG9iYWwocHJlZml4LCB2ZW5kb3IgPSAnbm9kZV9tb2R1bGVzJykge1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVuZG9yUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgdmVuZG9yKTtcbiAgICBpZiAocHJlZml4LmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKGAuLyR7cHJlZml4fWAsIHZlbmRvclBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiByZWFkZGlyKHZlbmRvclBhdGgpLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfSkudGhlbihcbiAgICAgIChsaWJzKSA9PiBbLi4uaW50ZXJuYWxNb2R1bGVzLCAuLi5saWJzXVxuICAgICkubWFwKChsaWIpID0+ICh7XG4gICAgICB0ZXh0OiBsaWIsXG4gICAgICB0eXBlOiAncGFja2FnZSdcbiAgICB9KSkudGhlbihcbiAgICAgIChzdWdnZXN0aW9ucykgPT4gdGhpcy5maWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKVxuICAgICk7XG4gIH1cblxuICBsb29rdXBXZWJwYWNrKHByZWZpeCkge1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVuZG9ycyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMudmVuZG9ycycpO1xuICAgIGNvbnN0IHdlYnBhY2tDb25maWcgPSB0aGlzLmZldGNoV2VicGFja0NvbmZpZyhwcm9qZWN0UGF0aCk7XG5cbiAgICBsZXQgbW9kdWxlU2VhcmNoUGF0aHMgPSBnZXQod2VicGFja0NvbmZpZywgJ3Jlc29sdmUubW9kdWxlc0RpcmVjdG9yaWVzJywgW10pO1xuICAgIG1vZHVsZVNlYXJjaFBhdGhzID0gbW9kdWxlU2VhcmNoUGF0aHMuZmlsdGVyKFxuICAgICAgKGl0ZW0pID0+IHZlbmRvcnMuaW5kZXhPZihpdGVtKSA9PT0gLTFcbiAgICApO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKG1vZHVsZVNlYXJjaFBhdGhzLm1hcChcbiAgICAgIChzZWFyY2hQYXRoKSA9PiB0aGlzLmxvb2t1cExvY2FsKHByZWZpeCwgc2VhcmNoUGF0aClcbiAgICApKS50aGVuKFxuICAgICAgKHN1Z2dlc3Rpb25zKSA9PiBbXS5jb25jYXQoLi4uc3VnZ2VzdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIGZldGNoV2VicGFja0NvbmZpZyhyb290UGF0aCkge1xuICAgIGNvbnN0IHdlYnBhY2tDb25maWdGaWxlbmFtZSA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMud2VicGFja0NvbmZpZ0ZpbGVuYW1lJyk7XG4gICAgY29uc3Qgd2VicGFja0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4ocm9vdFBhdGgsIHdlYnBhY2tDb25maWdGaWxlbmFtZSk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUod2VicGFja0NvbmZpZ1BhdGgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wbGV0aW9uUHJvdmlkZXI7XG4iXX0=