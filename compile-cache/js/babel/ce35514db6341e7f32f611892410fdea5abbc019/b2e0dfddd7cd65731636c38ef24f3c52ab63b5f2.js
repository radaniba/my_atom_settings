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
var findBabelConfig = require('find-babel-config');
var internalModules = require('./utils/internal-modules');

var LINE_REGEXP = /require|import|export\s+(?:\*|{[a-zA-Z0-9_$,\s]+})+\s+from|}\s*from\s*['"]/;
var SELECTOR = ['.source.js .string.quoted',

// for babel-language plugin
'.source.js .punctuation.definition.string.end', '.source.js .punctuation.definition.string.begin', '.source.ts .string.quoted', '.source.coffee .string.quoted'];
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
    value: function getSuggestions(_ref) {
      var _this = this;

      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

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

      var babelPluginModuleResolver = atom.config.get('autocomplete-modules.babelPluginModuleResolver');
      if (babelPluginModuleResolver) {
        promises.push(this.lookupbabelPluginModuleResolver(realPrefix));
      }

      return Promise.all(promises).then(function (suggestions) {
        var _ref2;

        return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(suggestions));
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
          type: 'import'
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

      var vendor = arguments.length <= 1 || arguments[1] === undefined ? 'node_modules' : arguments[1];

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
          replacementPrefix: prefix,
          type: 'import'
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

      var webpackRoot = get(webpackConfig, 'resolve.root', '');
      var moduleSearchPaths = get(webpackConfig, 'resolve.modulesDirectories', []);
      moduleSearchPaths = moduleSearchPaths.filter(function (item) {
        return vendors.indexOf(item) === -1;
      });

      return Promise.all(moduleSearchPaths.map(function (searchPath) {
        return _this4.lookupLocal(prefix, path.join(webpackRoot, searchPath));
      })).then(function (suggestions) {
        var _ref3;

        return (_ref3 = []).concat.apply(_ref3, _toConsumableArray(suggestions));
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
  }, {
    key: 'lookupbabelPluginModuleResolver',
    value: function lookupbabelPluginModuleResolver(prefix) {
      var _this5 = this;

      var projectPath = atom.project.getPaths()[0];
      if (projectPath) {
        return findBabelConfig(projectPath).then(function (_ref4) {
          var config = _ref4.config;

          if (config && Array.isArray(config.plugins)) {
            var _ret = (function () {
              // Grab the v1 (module-alias) or v2 (module-resolver) plugin configuration
              var pluginConfig = config.plugins.find(function (p) {
                return p[0] === 'module-alias' || p[0] === 'babel-plugin-module-alias';
              }) || config.plugins.find(function (p) {
                return p[0] === 'module-resolver' || p[0] === 'babel-plugin-module-resolver';
              });
              if (!pluginConfig) {
                return {
                  v: []
                };
              }

              // Only v2 of the plugin supports custom root directories
              var rootPromises = [];
              if (!Array.isArray(pluginConfig[1])) {
                var rootDirs = pluginConfig[1].root || [];
                rootPromises = rootPromises.concat(rootDirs.map(function (r) {
                  var rootDirPath = path.join(projectPath, r);
                  return _this5.lookupLocal('./' + prefix, rootDirPath);
                }));
              }

              // determine the right prefix for the alias config
              // `realPrefix` is the prefix we want to use to find the right file/suggestions
              // when the prefix is a sub module (eg. module/subfile),
              // `modulePrefix` will be "module", and `realPrefix` will be "subfile"
              var prefixSplit = prefix.split('/');
              var modulePrefix = prefixSplit[0];
              var realPrefix = prefixSplit.pop();
              var moduleSearchPath = prefixSplit.join('/');

              // get the alias configs for the specific module
              var aliasConfig = Array.isArray(pluginConfig[1])
              // v1 of the plugin is an array
              ? pluginConfig[1].filter(function (alias) {
                return alias.expose.startsWith(modulePrefix);
              })
              // otherwise it's v2 (an object)
              : Object.keys(pluginConfig[1].alias || {}).filter(function (expose) {
                return expose.startsWith(modulePrefix);
              }).map(function (exp) {
                return {
                  expose: exp,
                  src: pluginConfig[1].alias[exp]
                };
              });

              return {
                v: Promise.all(rootPromises.concat(aliasConfig.map(function (alias) {
                  // The search path is the parent directory of the source directory specified in .babelrc
                  // then we append the `moduleSearchPath` to get the real search path
                  var searchPath = path.join(path.dirname(path.resolve(projectPath, alias.src)), moduleSearchPath);

                  return _this5.lookupLocal(realPrefix, searchPath);
                }))).then(function (suggestions) {
                  var _ref5;

                  return (_ref5 = []).concat.apply(_ref5, _toConsumableArray(suggestions));
                }).then(function (suggestions) {
                  // make sure the suggestions are from the compatible alias
                  if (prefix === realPrefix && aliasConfig.length) {
                    return suggestions.filter(function (sugg) {
                      return aliasConfig.find(function (a) {
                        return a.expose === sugg.text;
                      });
                    });
                  }
                  return suggestions;
                })
              };
            })();

            if (typeof _ret === 'object') return _ret.v;
          }

          return [];
        });
      }
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7OztBQUVaLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNsQyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQzs7QUFFNUQsSUFBTSxXQUFXLEdBQUcsNEVBQTRFLENBQUM7QUFDakcsSUFBTSxRQUFRLEdBQUcsQ0FDZiwyQkFBMkI7OztBQUczQiwrQ0FBK0MsRUFDL0MsaURBQWlELEVBRWpELDJCQUEyQixFQUMzQiwrQkFBK0IsQ0FDaEMsQ0FBQztBQUNGLElBQU0sZ0JBQWdCLEdBQUcsQ0FDdkIscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUNyQixxQkFBcUIsRUFDckIscUJBQXFCLENBQ3RCLENBQUM7O0lBRUksa0JBQWtCO0FBQ1gsV0FEUCxrQkFBa0IsR0FDUjswQkFEVixrQkFBa0I7O0FBRXBCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxRQUFJLENBQUMsa0JB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ZS1tb2R1bGVzL3NyYy9jb21wbGV0aW9uLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuY29uc3QgcmVhZGRpciA9IFByb21pc2UucHJvbWlzaWZ5KHJlcXVpcmUoJ2ZzJykucmVhZGRpcik7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnV6emFsZHJpbiA9IHJlcXVpcmUoJ2Z1enphbGRyaW4nKTtcbmNvbnN0IGVzY2FwZVJlZ0V4cCA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGVyZWdleHAnKTtcbmNvbnN0IGdldCA9IHJlcXVpcmUoJ2xvZGFzaC5nZXQnKTtcbmNvbnN0IGZpbmRCYWJlbENvbmZpZyA9IHJlcXVpcmUoJ2ZpbmQtYmFiZWwtY29uZmlnJyk7XG5jb25zdCBpbnRlcm5hbE1vZHVsZXMgPSByZXF1aXJlKCcuL3V0aWxzL2ludGVybmFsLW1vZHVsZXMnKTtcblxuY29uc3QgTElORV9SRUdFWFAgPSAvcmVxdWlyZXxpbXBvcnR8ZXhwb3J0XFxzKyg/OlxcKnx7W2EtekEtWjAtOV8kLFxcc10rfSkrXFxzK2Zyb218fVxccypmcm9tXFxzKlsnXCJdLztcbmNvbnN0IFNFTEVDVE9SID0gW1xuICAnLnNvdXJjZS5qcyAuc3RyaW5nLnF1b3RlZCcsXG5cbiAgLy8gZm9yIGJhYmVsLWxhbmd1YWdlIHBsdWdpblxuICAnLnNvdXJjZS5qcyAucHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kJyxcbiAgJy5zb3VyY2UuanMgLnB1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luJyxcblxuICAnLnNvdXJjZS50cyAuc3RyaW5nLnF1b3RlZCcsXG4gICcuc291cmNlLmNvZmZlZSAuc3RyaW5nLnF1b3RlZCdcbl07XG5jb25zdCBTRUxFQ1RPUl9ESVNBQkxFID0gW1xuICAnLnNvdXJjZS5qcyAuY29tbWVudCcsXG4gICcuc291cmNlLmpzIC5rZXl3b3JkJyxcbiAgJy5zb3VyY2UudHMgLmNvbW1lbnQnLFxuICAnLnNvdXJjZS50cyAua2V5d29yZCdcbl07XG5cbmNsYXNzIENvbXBsZXRpb25Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBTRUxFQ1RPUi5qb2luKCcsICcpO1xuICAgIHRoaXMuZGlzYWJsZUZvclNlbGVjdG9yID0gU0VMRUNUT1JfRElTQUJMRS5qb2luKCcsICcpO1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAxO1xuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnMoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeH0pIHtcbiAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKTtcbiAgICBpZiAoIUxJTkVfUkVHRVhQLnRlc3QobGluZSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCByZWFsUHJlZml4ID0gdGhpcy5nZXRSZWFsUHJlZml4KHByZWZpeCwgbGluZSk7XG4gICAgaWYgKCFyZWFsUHJlZml4KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKHJlYWxQcmVmaXhbMF0gPT09ICcuJykge1xuICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwocmVhbFByZWZpeCwgcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZW5kb3JzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy52ZW5kb3JzJyk7XG5cbiAgICBjb25zdCBwcm9taXNlcyA9IHZlbmRvcnMubWFwKFxuICAgICAgKHZlbmRvcikgPT4gdGhpcy5sb29rdXBHbG9iYWwocmVhbFByZWZpeCwgdmVuZG9yKVxuICAgICk7XG5cbiAgICBjb25zdCB3ZWJwYWNrID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy53ZWJwYWNrJyk7XG4gICAgaWYgKHdlYnBhY2spIHtcbiAgICAgIHByb21pc2VzLnB1c2godGhpcy5sb29rdXBXZWJwYWNrKHJlYWxQcmVmaXgpKTtcbiAgICB9XG5cbiAgICBjb25zdCBiYWJlbFBsdWdpbk1vZHVsZVJlc29sdmVyID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy5iYWJlbFBsdWdpbk1vZHVsZVJlc29sdmVyJyk7XG4gICAgaWYgKGJhYmVsUGx1Z2luTW9kdWxlUmVzb2x2ZXIpIHtcbiAgICAgIHByb21pc2VzLnB1c2godGhpcy5sb29rdXBiYWJlbFBsdWdpbk1vZHVsZVJlc29sdmVyKHJlYWxQcmVmaXgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oXG4gICAgICAoc3VnZ2VzdGlvbnMpID0+IFtdLmNvbmNhdCguLi5zdWdnZXN0aW9ucylcbiAgICApO1xuICB9XG5cbiAgZ2V0UmVhbFByZWZpeChwcmVmaXgsIGxpbmUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVhbFByZWZpeFJlZ0V4cCA9IG5ldyBSZWdFeHAoYFsnXCJdKCg/Oi4rPykqJHtlc2NhcGVSZWdFeHAocHJlZml4KX0pYCk7XG4gICAgICBjb25zdCByZWFsUHJlZml4TWF0aGVzID0gcmVhbFByZWZpeFJlZ0V4cC5leGVjKGxpbmUpO1xuICAgICAgaWYgKCFyZWFsUHJlZml4TWF0aGVzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlYWxQcmVmaXhNYXRoZXNbMV07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZpbHRlclN1Z2dlc3Rpb25zKHByZWZpeCwgc3VnZ2VzdGlvbnMpIHtcbiAgICByZXR1cm4gZnV6emFsZHJpbi5maWx0ZXIoc3VnZ2VzdGlvbnMsIHByZWZpeCwge1xuICAgICAga2V5OiAndGV4dCdcbiAgICB9KTtcbiAgfVxuXG4gIGxvb2t1cExvY2FsKHByZWZpeCwgZGlybmFtZSkge1xuICAgIGxldCBmaWx0ZXJQcmVmaXggPSBwcmVmaXgucmVwbGFjZShwYXRoLmRpcm5hbWUocHJlZml4KSwgJycpLnJlcGxhY2UoJy8nLCAnJyk7XG4gICAgaWYgKGZpbHRlclByZWZpeFtmaWx0ZXJQcmVmaXgubGVuZ3RoIC0gMV0gPT09ICcvJykge1xuICAgICAgZmlsdGVyUHJlZml4ID0gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkZUV4dGVuc2lvbiA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMuaW5jbHVkZUV4dGVuc2lvbicpO1xuICAgIGxldCBsb29rdXBEaXJuYW1lID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUsIHByZWZpeCk7XG4gICAgaWYgKGZpbHRlclByZWZpeCkge1xuICAgICAgbG9va3VwRGlybmFtZSA9IGxvb2t1cERpcm5hbWUucmVwbGFjZShuZXcgUmVnRXhwKGAke2VzY2FwZVJlZ0V4cChmaWx0ZXJQcmVmaXgpfSRgKSwgJycpO1xuICAgIH1cblxuICAgIHJldHVybiByZWFkZGlyKGxvb2t1cERpcm5hbWUpLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfSkuZmlsdGVyKFxuICAgICAgKGZpbGVuYW1lKSA9PiBmaWxlbmFtZVswXSAhPT0gJy4nXG4gICAgKS5tYXAoKHBhdGhuYW1lKSA9PiAoe1xuICAgICAgdGV4dDogaW5jbHVkZUV4dGVuc2lvbiA/IHBhdGhuYW1lIDogdGhpcy5ub3JtYWxpemVMb2NhbChwYXRobmFtZSksXG4gICAgICBkaXNwbGF5VGV4dDogcGF0aG5hbWUsXG4gICAgICB0eXBlOiAnaW1wb3J0J1xuICAgIH0pKS50aGVuKFxuICAgICAgKHN1Z2dlc3Rpb25zKSA9PiB0aGlzLmZpbHRlclN1Z2dlc3Rpb25zKGZpbHRlclByZWZpeCwgc3VnZ2VzdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZUxvY2FsKGZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIGZpbGVuYW1lLnJlcGxhY2UoL1xcLihqc3xlczZ8anN4fGNvZmZlZXx0c3x0c3gpJC8sICcnKTtcbiAgfVxuXG4gIGxvb2t1cEdsb2JhbChwcmVmaXgsIHZlbmRvciA9ICdub2RlX21vZHVsZXMnKSB7XG4gICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICBpZiAoIXByb2plY3RQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZW5kb3JQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCB2ZW5kb3IpO1xuICAgIGlmIChwcmVmaXguaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwoYC4vJHtwcmVmaXh9YCwgdmVuZG9yUGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWRkaXIodmVuZG9yUGF0aCkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9KS50aGVuKFxuICAgICAgKGxpYnMpID0+IFsuLi5pbnRlcm5hbE1vZHVsZXMsIC4uLmxpYnNdXG4gICAgKS5tYXAoKGxpYikgPT4gKHtcbiAgICAgIHRleHQ6IGxpYixcbiAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXgsXG4gICAgICB0eXBlOiAnaW1wb3J0J1xuICAgIH0pKS50aGVuKFxuICAgICAgKHN1Z2dlc3Rpb25zKSA9PiB0aGlzLmZpbHRlclN1Z2dlc3Rpb25zKHByZWZpeCwgc3VnZ2VzdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIGxvb2t1cFdlYnBhY2socHJlZml4KSB7XG4gICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICBpZiAoIXByb2plY3RQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZW5kb3JzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy52ZW5kb3JzJyk7XG4gICAgY29uc3Qgd2VicGFja0NvbmZpZyA9IHRoaXMuZmV0Y2hXZWJwYWNrQ29uZmlnKHByb2plY3RQYXRoKTtcblxuICAgIGNvbnN0IHdlYnBhY2tSb290ID0gZ2V0KHdlYnBhY2tDb25maWcsICdyZXNvbHZlLnJvb3QnLCAnJyk7XG4gICAgbGV0IG1vZHVsZVNlYXJjaFBhdGhzID0gZ2V0KHdlYnBhY2tDb25maWcsICdyZXNvbHZlLm1vZHVsZXNEaXJlY3RvcmllcycsIFtdKTtcbiAgICBtb2R1bGVTZWFyY2hQYXRocyA9IG1vZHVsZVNlYXJjaFBhdGhzLmZpbHRlcihcbiAgICAgIChpdGVtKSA9PiB2ZW5kb3JzLmluZGV4T2YoaXRlbSkgPT09IC0xXG4gICAgKTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChtb2R1bGVTZWFyY2hQYXRocy5tYXAoXG4gICAgICAoc2VhcmNoUGF0aCkgPT4gdGhpcy5sb29rdXBMb2NhbChwcmVmaXgsIHBhdGguam9pbih3ZWJwYWNrUm9vdCwgc2VhcmNoUGF0aCkpXG4gICAgKSkudGhlbihcbiAgICAgIChzdWdnZXN0aW9ucykgPT4gW10uY29uY2F0KC4uLnN1Z2dlc3Rpb25zKVxuICAgICk7XG4gIH1cblxuICBmZXRjaFdlYnBhY2tDb25maWcocm9vdFBhdGgpIHtcbiAgICBjb25zdCB3ZWJwYWNrQ29uZmlnRmlsZW5hbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1tb2R1bGVzLndlYnBhY2tDb25maWdGaWxlbmFtZScpO1xuICAgIGNvbnN0IHdlYnBhY2tDb25maWdQYXRoID0gcGF0aC5qb2luKHJvb3RQYXRoLCB3ZWJwYWNrQ29uZmlnRmlsZW5hbWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiByZXF1aXJlKHdlYnBhY2tDb25maWdQYXRoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgbG9va3VwYmFiZWxQbHVnaW5Nb2R1bGVSZXNvbHZlcihwcmVmaXgpIHtcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgcmV0dXJuIGZpbmRCYWJlbENvbmZpZyhwcm9qZWN0UGF0aCkudGhlbigoe2NvbmZpZ30pID0+IHtcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBBcnJheS5pc0FycmF5KGNvbmZpZy5wbHVnaW5zKSkge1xuICAgICAgICAgIC8vIEdyYWIgdGhlIHYxIChtb2R1bGUtYWxpYXMpIG9yIHYyIChtb2R1bGUtcmVzb2x2ZXIpIHBsdWdpbiBjb25maWd1cmF0aW9uXG4gICAgICAgICAgY29uc3QgcGx1Z2luQ29uZmlnID0gY29uZmlnLnBsdWdpbnMuZmluZChwID0+IHBbMF0gPT09ICdtb2R1bGUtYWxpYXMnIHx8IHBbMF0gPT09ICdiYWJlbC1wbHVnaW4tbW9kdWxlLWFsaWFzJykgfHxcbiAgICAgICAgICAgIGNvbmZpZy5wbHVnaW5zLmZpbmQocCA9PiBwWzBdID09PSAnbW9kdWxlLXJlc29sdmVyJyB8fCBwWzBdID09PSAnYmFiZWwtcGx1Z2luLW1vZHVsZS1yZXNvbHZlcicpO1xuICAgICAgICAgIGlmICghcGx1Z2luQ29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT25seSB2MiBvZiB0aGUgcGx1Z2luIHN1cHBvcnRzIGN1c3RvbSByb290IGRpcmVjdG9yaWVzXG4gICAgICAgICAgbGV0IHJvb3RQcm9taXNlcyA9IFtdO1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwbHVnaW5Db25maWdbMV0pKSB7XG4gICAgICAgICAgICBjb25zdCByb290RGlycyA9IHBsdWdpbkNvbmZpZ1sxXS5yb290IHx8IFtdO1xuICAgICAgICAgICAgcm9vdFByb21pc2VzID0gcm9vdFByb21pc2VzLmNvbmNhdChyb290RGlycy5tYXAociA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHJvb3REaXJQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCByKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwoYC4vJHtwcmVmaXh9YCwgcm9vdERpclBhdGgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgcmlnaHQgcHJlZml4IGZvciB0aGUgYWxpYXMgY29uZmlnXG4gICAgICAgICAgLy8gYHJlYWxQcmVmaXhgIGlzIHRoZSBwcmVmaXggd2Ugd2FudCB0byB1c2UgdG8gZmluZCB0aGUgcmlnaHQgZmlsZS9zdWdnZXN0aW9uc1xuICAgICAgICAgIC8vIHdoZW4gdGhlIHByZWZpeCBpcyBhIHN1YiBtb2R1bGUgKGVnLiBtb2R1bGUvc3ViZmlsZSksXG4gICAgICAgICAgLy8gYG1vZHVsZVByZWZpeGAgd2lsbCBiZSBcIm1vZHVsZVwiLCBhbmQgYHJlYWxQcmVmaXhgIHdpbGwgYmUgXCJzdWJmaWxlXCJcbiAgICAgICAgICBjb25zdCBwcmVmaXhTcGxpdCA9IHByZWZpeC5zcGxpdCgnLycpO1xuICAgICAgICAgIGNvbnN0IG1vZHVsZVByZWZpeCA9IHByZWZpeFNwbGl0WzBdO1xuICAgICAgICAgIGNvbnN0IHJlYWxQcmVmaXggPSBwcmVmaXhTcGxpdC5wb3AoKTtcbiAgICAgICAgICBjb25zdCBtb2R1bGVTZWFyY2hQYXRoID0gcHJlZml4U3BsaXQuam9pbignLycpO1xuXG4gICAgICAgICAgLy8gZ2V0IHRoZSBhbGlhcyBjb25maWdzIGZvciB0aGUgc3BlY2lmaWMgbW9kdWxlXG4gICAgICAgICAgY29uc3QgYWxpYXNDb25maWcgPSBBcnJheS5pc0FycmF5KHBsdWdpbkNvbmZpZ1sxXSlcbiAgICAgICAgICAgIC8vIHYxIG9mIHRoZSBwbHVnaW4gaXMgYW4gYXJyYXlcbiAgICAgICAgICAgID8gcGx1Z2luQ29uZmlnWzFdLmZpbHRlcihhbGlhcyA9PiBhbGlhcy5leHBvc2Uuc3RhcnRzV2l0aChtb2R1bGVQcmVmaXgpKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGl0J3MgdjIgKGFuIG9iamVjdClcbiAgICAgICAgICAgIDogT2JqZWN0LmtleXMocGx1Z2luQ29uZmlnWzFdLmFsaWFzIHx8IHt9KVxuICAgICAgICAgICAgICAuZmlsdGVyKGV4cG9zZSA9PiBleHBvc2Uuc3RhcnRzV2l0aChtb2R1bGVQcmVmaXgpKVxuICAgICAgICAgICAgICAubWFwKGV4cCA9PiAoe1xuICAgICAgICAgICAgICAgIGV4cG9zZTogZXhwLFxuICAgICAgICAgICAgICAgIHNyYzogcGx1Z2luQ29uZmlnWzFdLmFsaWFzW2V4cF1cbiAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJvb3RQcm9taXNlcy5jb25jYXQoYWxpYXNDb25maWcubWFwKFxuICAgICAgICAgICAgKGFsaWFzKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFRoZSBzZWFyY2ggcGF0aCBpcyB0aGUgcGFyZW50IGRpcmVjdG9yeSBvZiB0aGUgc291cmNlIGRpcmVjdG9yeSBzcGVjaWZpZWQgaW4gLmJhYmVscmNcbiAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBhcHBlbmQgdGhlIGBtb2R1bGVTZWFyY2hQYXRoYCB0byBnZXQgdGhlIHJlYWwgc2VhcmNoIHBhdGhcbiAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICBwYXRoLmRpcm5hbWUocGF0aC5yZXNvbHZlKHByb2plY3RQYXRoLCBhbGlhcy5zcmMpKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVTZWFyY2hQYXRoXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwocmVhbFByZWZpeCwgc2VhcmNoUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKSkpLnRoZW4oXG4gICAgICAgICAgICAoc3VnZ2VzdGlvbnMpID0+IFtdLmNvbmNhdCguLi5zdWdnZXN0aW9ucylcbiAgICAgICAgICApLnRoZW4oc3VnZ2VzdGlvbnMgPT4ge1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBzdWdnZXN0aW9ucyBhcmUgZnJvbSB0aGUgY29tcGF0aWJsZSBhbGlhc1xuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gcmVhbFByZWZpeCAmJiBhbGlhc0NvbmZpZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zLmZpbHRlcihzdWdnID0+XG4gICAgICAgICAgICAgICAgYWxpYXNDb25maWcuZmluZChhID0+IGEuZXhwb3NlID09PSBzdWdnLnRleHQpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wbGV0aW9uUHJvdmlkZXI7XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/completion-provider.js
