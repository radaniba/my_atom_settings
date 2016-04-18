'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs').readdir);
var path = require('path');
var fuzzaldrin = require('fuzzaldrin');
var escapeRegExp = require('lodash.escaperegexp');
var internalModules = require('./internal-modules');

var LINE_REGEXP = /require|import|export\s+(?:\*|{[a-zA-Z0-9_$,\s]+})+\s+from|}\s*from\s*['"]/;

var CompletionProvider = (function () {
  function CompletionProvider() {
    _classCallCheck(this, CompletionProvider);

    this.selector = '.source.js .string.quoted, .source.coffee .string.quoted';
    this.disableForSelector = '.source.js .comment, source.js .keyword';
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

      var realPrefixRegExp = new RegExp('[\'"]((?:.+?)*' + escapeRegExp(prefix) + ')');
      try {
        var _ret = (function () {
          var realPrefixMathes = realPrefixRegExp.exec(line);
          if (!realPrefixMathes) {
            return {
              v: []
            };
          }

          var realPrefix = realPrefixMathes[1];

          if (realPrefix[0] === '.') {
            return {
              v: _this.lookupLocal(realPrefix, path.dirname(editor.getPath()))
            };
          }

          var vendors = atom.config.get('autocomplete-modules.vendors');

          var promises = vendors.map(function (vendor) {
            return _this.lookupGlobal(realPrefix, vendor);
          });

          return {
            v: Promise.all(promises).then(function (suggestions) {
              var _ref2;

              return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(suggestions));
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } catch (e) {
        return [];
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

      var lookupDirname = path.resolve(dirname, prefix).replace(new RegExp(filterPrefix + '$'), '');

      return readdir(lookupDirname)['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }

        return [];
      }).filter(function (filename) {
        return filename[0] !== '.';
      }).map(function (pathname) {
        return {
          text: _this2.normalizeLocal(pathname),
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
      return filename.replace(/\.(js|es6|jsx|coffee)$/, '');
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
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this3.filterSuggestions(prefix, suggestions);
      });
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7OztBQUVaLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV0RCxJQUFNLFdBQVcsR0FBRyw0RUFBNEUsQ0FBQzs7SUFFM0Ysa0JBQWtCO0FBQ1gsV0FEUCxrQkFBa0IsR0FDUjswQkFEVixrQkFBa0I7O0FBRXBCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMERBQTBELENBQUM7QUFDM0UsUUFBSSxDQUFDLGtCQUFrQixHQUFHLHlDQUF5QyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7R0FDNUI7O2VBTEcsa0JBQWtCOztXQU9SLHdCQUFDLElBQWdDLEVBQUU7OztVQUFqQyxNQUFNLEdBQVAsSUFBZ0MsQ0FBL0IsTUFBTTtVQUFFLGNBQWMsR0FBdkIsSUFBZ0MsQ0FBdkIsY0FBYztVQUFFLE1BQU0sR0FBL0IsSUFBZ0MsQ0FBUCxNQUFNOztBQUM1QyxVQUFNLElBQUksR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxD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a0JBQWtCLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtbW9kdWxlcy9zcmMvY29tcGxldGlvbi1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmNvbnN0IHJlYWRkaXIgPSBQcm9taXNlLnByb21pc2lmeShyZXF1aXJlKCdmcycpLnJlYWRkaXIpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZ1enphbGRyaW4gPSByZXF1aXJlKCdmdXp6YWxkcmluJyk7XG5jb25zdCBlc2NhcGVSZWdFeHAgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlcmVnZXhwJyk7XG5jb25zdCBpbnRlcm5hbE1vZHVsZXMgPSByZXF1aXJlKCcuL2ludGVybmFsLW1vZHVsZXMnKTtcblxuY29uc3QgTElORV9SRUdFWFAgPSAvcmVxdWlyZXxpbXBvcnR8ZXhwb3J0XFxzKyg/OlxcKnx7W2EtekEtWjAtOV8kLFxcc10rfSkrXFxzK2Zyb218fVxccypmcm9tXFxzKlsnXCJdLztcblxuY2xhc3MgQ29tcGxldGlvblByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9ICcuc291cmNlLmpzIC5zdHJpbmcucXVvdGVkLCAuc291cmNlLmNvZmZlZSAuc3RyaW5nLnF1b3RlZCc7XG4gICAgdGhpcy5kaXNhYmxlRm9yU2VsZWN0b3IgPSAnLnNvdXJjZS5qcyAuY29tbWVudCwgc291cmNlLmpzIC5rZXl3b3JkJztcbiAgICB0aGlzLmluY2x1c2lvblByaW9yaXR5ID0gMTtcbiAgfVxuXG4gIGdldFN1Z2dlc3Rpb25zKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBwcmVmaXh9KSB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSk7XG4gICAgaWYgKCFMSU5FX1JFR0VYUC50ZXN0KGxpbmUpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgcmVhbFByZWZpeFJlZ0V4cCA9IG5ldyBSZWdFeHAoYFsnXCJdKCg/Oi4rPykqJHtlc2NhcGVSZWdFeHAocHJlZml4KX0pYCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlYWxQcmVmaXhNYXRoZXMgPSByZWFsUHJlZml4UmVnRXhwLmV4ZWMobGluZSk7XG4gICAgICBpZiAoIXJlYWxQcmVmaXhNYXRoZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZWFsUHJlZml4ID0gcmVhbFByZWZpeE1hdGhlc1sxXTtcblxuICAgICAgaWYgKHJlYWxQcmVmaXhbMF0gPT09ICcuJykge1xuICAgICAgICByZXR1cm4gdGhpcy5sb29rdXBMb2NhbChyZWFsUHJlZml4LCBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSkpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2ZW5kb3JzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy52ZW5kb3JzJyk7XG5cbiAgICAgIGNvbnN0IHByb21pc2VzID0gdmVuZG9ycy5tYXAoXG4gICAgICAgICh2ZW5kb3IpID0+IHRoaXMubG9va3VwR2xvYmFsKHJlYWxQcmVmaXgsIHZlbmRvcilcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihcbiAgICAgICAgKHN1Z2dlc3Rpb25zKSA9PiBbXS5jb25jYXQoLi4uc3VnZ2VzdGlvbnMpXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBmaWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKSB7XG4gICAgcmV0dXJuIGZ1enphbGRyaW4uZmlsdGVyKHN1Z2dlc3Rpb25zLCBwcmVmaXgsIHtcbiAgICAgIGtleTogJ3RleHQnXG4gICAgfSk7XG4gIH1cblxuICBsb29rdXBMb2NhbChwcmVmaXgsIGRpcm5hbWUpIHtcbiAgICBsZXQgZmlsdGVyUHJlZml4ID0gcHJlZml4LnJlcGxhY2UocGF0aC5kaXJuYW1lKHByZWZpeCksICcnKS5yZXBsYWNlKCcvJywgJycpO1xuICAgIGlmIChmaWx0ZXJQcmVmaXhbZmlsdGVyUHJlZml4Lmxlbmd0aCAtIDFdID09PSAnLycpIHtcbiAgICAgIGZpbHRlclByZWZpeCA9ICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGxvb2t1cERpcm5hbWUgPSBwYXRoLnJlc29sdmUoZGlybmFtZSwgcHJlZml4KS5yZXBsYWNlKG5ldyBSZWdFeHAoYCR7ZmlsdGVyUHJlZml4fSRgKSwgJycpO1xuXG4gICAgcmV0dXJuIHJlYWRkaXIobG9va3VwRGlybmFtZSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9KS5maWx0ZXIoXG4gICAgICAoZmlsZW5hbWUpID0+IGZpbGVuYW1lWzBdICE9PSAnLidcbiAgICApLm1hcCgocGF0aG5hbWUpID0+ICh7XG4gICAgICB0ZXh0OiB0aGlzLm5vcm1hbGl6ZUxvY2FsKHBhdGhuYW1lKSxcbiAgICAgIGRpc3BsYXlUZXh0OiBwYXRobmFtZSxcbiAgICAgIHR5cGU6ICdwYWNrYWdlJ1xuICAgIH0pKS50aGVuKFxuICAgICAgKHN1Z2dlc3Rpb25zKSA9PiB0aGlzLmZpbHRlclN1Z2dlc3Rpb25zKGZpbHRlclByZWZpeCwgc3VnZ2VzdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZUxvY2FsKGZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIGZpbGVuYW1lLnJlcGxhY2UoL1xcLihqc3xlczZ8anN4fGNvZmZlZSkkLywgJycpO1xuICB9XG5cbiAgbG9va3VwR2xvYmFsKHByZWZpeCwgdmVuZG9yID0gJ25vZGVfbW9kdWxlcycpIHtcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIGlmICghcHJvamVjdFBhdGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIGNvbnN0IHZlbmRvclBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIHZlbmRvcik7XG4gICAgaWYgKHByZWZpeC5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb29rdXBMb2NhbChgLi8ke3ByZWZpeH1gLCB2ZW5kb3JQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVhZGRpcih2ZW5kb3JQYXRoKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0pLnRoZW4oXG4gICAgICAobGlicykgPT4gWy4uLmludGVybmFsTW9kdWxlcywgLi4ubGlic11cbiAgICApLm1hcCgobGliKSA9PiAoe1xuICAgICAgdGV4dDogbGliLFxuICAgICAgdHlwZTogJ3BhY2thZ2UnXG4gICAgfSkpLnRoZW4oXG4gICAgICAoc3VnZ2VzdGlvbnMpID0+IHRoaXMuZmlsdGVyU3VnZ2VzdGlvbnMocHJlZml4LCBzdWdnZXN0aW9ucylcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGxldGlvblByb3ZpZGVyO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/completion-provider.js
