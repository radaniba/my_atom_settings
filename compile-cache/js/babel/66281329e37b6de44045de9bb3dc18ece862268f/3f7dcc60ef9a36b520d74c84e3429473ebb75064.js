'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (!LINE_REGEXP.test(line)) {
        return [];
      }

      var realPrefixRegExp = new RegExp('[\'"]((?:.+?)*' + escapeRegExp(prefix) + ')');
      try {
        var realPrefixMathes = realPrefixRegExp.exec(line);
        if (!realPrefixMathes) {
          return [];
        }

        var realPrefix = realPrefixMathes[1];

        if (realPrefix[0] === '.') {
          return this.lookupLocal(realPrefix, path.dirname(editor.getPath()));
        }

        return this.lookupGlobal(realPrefix);
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
      var _this = this;

      var filterPrefix = prefix.replace(path.dirname(prefix), '').replace('/', '');
      if (filterPrefix[filterPrefix.length - 1] === '/') {
        filterPrefix = '';
      }
      var lookupDirname = path.resolve(dirname, prefix).replace(new RegExp(filterPrefix + '$'), '');

      return readdir(lookupDirname).filter(function (filename) {
        return filename[0] !== '.';
      }).map(function (pathname) {
        return {
          text: _this.normalizeLocal(pathname),
          displayText: pathname,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this.filterSuggestions(filterPrefix, suggestions);
      })['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
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
      var _this2 = this;

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return [];
      }

      var nodeModulesPath = path.join(projectPath, 'node_modules');
      if (prefix.indexOf('/') !== -1) {
        return this.lookupLocal('./' + prefix, nodeModulesPath);
      }

      return readdir(nodeModulesPath).then(function (libs) {
        return libs.concat(internalModules);
      }).map(function (lib) {
        return {
          text: lib,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this2.filterSuggestions(prefix, suggestions);
      })['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      });
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNwRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdEQsSUFBTSxXQUFXLEdBQUcsNEVBQTRFLENBQUM7O0lBRTNGLGtCQUFrQjtBQUNYLFdBRFAsa0JBQWtCLEdBQ1I7MEJBRFYsa0JBQWtCOztBQUVwQixRQUFJLENBQUMsUUFBUSxHQUFHLDBEQUEwRCxDQUFDO0FBQzNFLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyx5Q0FBeUMsQ0FBQztBQUNwRSxRQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0dBQzVCOztlQUxHLGtCQUFrQjs7V0FPUix3QkFBQyxJQUFnQyxFQUFFO1VBQWpDLE1BQU0sR0FBUCxJQUFnQyxDQUEvQixNQUFNO1VBQUUsY0FBYyxHQUF2QixJQUFnQyxDQUF2QixjQUFjO1VBQUUsTUFBTSxHQUEvQixJQUFnQyxDQUFQLE1BQU07O0FBQzVDLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMzQixlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLG9CQUFpQixZQUFZLENBQUMsTUFBTSxDQUFDLE9BQUksQ0FBQztBQUM3RSxVQUFJO0FBQ0YsWUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3JCLGlCQUFPLEVBQUUsQ0FBQztTQUNYOztBQUVELFlBQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxZQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDekIsaUJBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3JFOztBQUVELGVBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUN0QyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsZUFBTyxFQUFFLENBQUM7T0FDWDtLQUNGOzs7V0FFZ0IsMkJBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRTtBQUNyQyxhQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxXQUFHLEVBQUUsTUFBTTtPQUNaLENBQUMsQ0FBQztLQUNKOzs7V0FFVSxxQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFOzs7QUFDM0IsVUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0UsVUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDakQsb0JBQVksR0FBRyxFQUFFLENBQUM7T0FDbkI7QUFDRCxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUksWUFBWSxPQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRWhHLGFBQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUNqRCxlQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUM7T0FDNUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUNuQixlQUFPO0FBQ0wsY0FBSSxFQUFFLE1BQUssY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNuQyxxQkFBVyxFQUFFLFFBQVE7QUFDckIsY0FBSSxFQUFFLFNBQVM7U0FDaEIsQ0FBQztPQUNILENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxXQUFXLEVBQUs7QUFDdkIsZUFBTyxNQUFLLGlCQUFpQixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztPQUMxRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLFlBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdkIsZ0JBQU0sQ0FBQyxDQUFDO1NBQ1Q7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRWEsd0JBQUMsUUFBUSxFQUFFO0FBQ3ZCLGFBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN2RDs7O1dBRVcsc0JBQUMsTUFBTSxFQUFFOzs7QUFDbkIsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsV0FBVyxFQUFFO0FBQ2hCLGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDL0QsVUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzlCLGVBQU8sSUFBSSxDQUFDLFdBQVcsUUFBTSxNQUFNLEVBQUksZUFBZSxDQUFDLENBQUM7T0FDekQ7O0FBRUQsYUFBTyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQzdDLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUNyQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ2QsZUFBTztBQUNMLGNBQUksRUFBRSxHQUFHO0FBQ1QsY0FBSSxFQUFFLFNBQVM7U0FDaEIsQ0FBQztPQUNILENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxXQUFXLEVBQUs7QUFDdkIsZUFBTyxPQUFLLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztPQUNwRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNkLFlBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdkIsZ0JBQU0sQ0FBQyxDQUFDO1NBQ1Q7T0FDRixDQUFDLENBQUM7S0FDSjs7O1NBM0ZHLGtCQUFrQjs7O0FBOEZ4QixNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5jb25zdCByZWFkZGlyID0gUHJvbWlzZS5wcm9taXNpZnkocmVxdWlyZSgnZnMnKS5yZWFkZGlyKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmdXp6YWxkcmluID0gcmVxdWlyZSgnZnV6emFsZHJpbicpO1xuY29uc3QgZXNjYXBlUmVnRXhwID0gcmVxdWlyZSgnbG9kYXNoLmVzY2FwZXJlZ2V4cCcpO1xuY29uc3QgaW50ZXJuYWxNb2R1bGVzID0gcmVxdWlyZSgnLi9pbnRlcm5hbC1tb2R1bGVzJyk7XG5cbmNvbnN0IExJTkVfUkVHRVhQID0gL3JlcXVpcmV8aW1wb3J0fGV4cG9ydFxccysoPzpcXCp8e1thLXpBLVowLTlfJCxcXHNdK30pK1xccytmcm9tfH1cXHMqZnJvbVxccypbJ1wiXS87XG5cbmNsYXNzIENvbXBsZXRpb25Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5qcyAuc3RyaW5nLnF1b3RlZCwgLnNvdXJjZS5jb2ZmZWUgLnN0cmluZy5xdW90ZWQnO1xuICAgIHRoaXMuZGlzYWJsZUZvclNlbGVjdG9yID0gJy5zb3VyY2UuanMgLmNvbW1lbnQsIHNvdXJjZS5qcyAua2V5d29yZCc7XG4gICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDE7XG4gIH1cblxuICBnZXRTdWdnZXN0aW9ucyh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4fSkge1xuICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pO1xuICAgIGlmICghTElORV9SRUdFWFAudGVzdChsaW5lKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWxQcmVmaXhSZWdFeHAgPSBuZXcgUmVnRXhwKGBbJ1wiXSgoPzouKz8pKiR7ZXNjYXBlUmVnRXhwKHByZWZpeCl9KWApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZWFsUHJlZml4TWF0aGVzID0gcmVhbFByZWZpeFJlZ0V4cC5leGVjKGxpbmUpO1xuICAgICAgaWYgKCFyZWFsUHJlZml4TWF0aGVzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVhbFByZWZpeCA9IHJlYWxQcmVmaXhNYXRoZXNbMV07XG5cbiAgICAgIGlmIChyZWFsUHJlZml4WzBdID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwocmVhbFByZWZpeCwgcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubG9va3VwR2xvYmFsKHJlYWxQcmVmaXgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBmaWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKSB7XG4gICAgcmV0dXJuIGZ1enphbGRyaW4uZmlsdGVyKHN1Z2dlc3Rpb25zLCBwcmVmaXgsIHtcbiAgICAgIGtleTogJ3RleHQnXG4gICAgfSk7XG4gIH1cblxuICBsb29rdXBMb2NhbChwcmVmaXgsIGRpcm5hbWUpIHtcbiAgICBsZXQgZmlsdGVyUHJlZml4ID0gcHJlZml4LnJlcGxhY2UocGF0aC5kaXJuYW1lKHByZWZpeCksICcnKS5yZXBsYWNlKCcvJywgJycpO1xuICAgIGlmIChmaWx0ZXJQcmVmaXhbZmlsdGVyUHJlZml4Lmxlbmd0aCAtIDFdID09PSAnLycpIHtcbiAgICAgIGZpbHRlclByZWZpeCA9ICcnO1xuICAgIH1cbiAgICBjb25zdCBsb29rdXBEaXJuYW1lID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUsIHByZWZpeCkucmVwbGFjZShuZXcgUmVnRXhwKGAke2ZpbHRlclByZWZpeH0kYCksICcnKTtcblxuICAgIHJldHVybiByZWFkZGlyKGxvb2t1cERpcm5hbWUpLmZpbHRlcigoZmlsZW5hbWUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlbmFtZVswXSAhPT0gJy4nO1xuICAgIH0pLm1hcCgocGF0aG5hbWUpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IHRoaXMubm9ybWFsaXplTG9jYWwocGF0aG5hbWUpLFxuICAgICAgICBkaXNwbGF5VGV4dDogcGF0aG5hbWUsXG4gICAgICAgIHR5cGU6ICdwYWNrYWdlJ1xuICAgICAgfTtcbiAgICB9KS50aGVuKChzdWdnZXN0aW9ucykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyU3VnZ2VzdGlvbnMoZmlsdGVyUHJlZml4LCBzdWdnZXN0aW9ucyk7XG4gICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBub3JtYWxpemVMb2NhbChmaWxlbmFtZSkge1xuICAgIHJldHVybiBmaWxlbmFtZS5yZXBsYWNlKC9cXC4oanN8ZXM2fGpzeHxjb2ZmZWUpJC8sICcnKTtcbiAgfVxuXG4gIGxvb2t1cEdsb2JhbChwcmVmaXgpIHtcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIGlmICghcHJvamVjdFBhdGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlTW9kdWxlc1BhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsICdub2RlX21vZHVsZXMnKTtcbiAgICBpZiAocHJlZml4LmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKGAuLyR7cHJlZml4fWAsIG5vZGVNb2R1bGVzUGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWRkaXIobm9kZU1vZHVsZXNQYXRoKS50aGVuKChsaWJzKSA9PiB7XG4gICAgICByZXR1cm4gbGlicy5jb25jYXQoaW50ZXJuYWxNb2R1bGVzKTtcbiAgICB9KS5tYXAoKGxpYikgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dDogbGliLFxuICAgICAgICB0eXBlOiAncGFja2FnZSdcbiAgICAgIH07XG4gICAgfSkudGhlbigoc3VnZ2VzdGlvbnMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlclN1Z2dlc3Rpb25zKHByZWZpeCwgc3VnZ2VzdGlvbnMpO1xuICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGxldGlvblByb3ZpZGVyO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/autocomplete-modules/src/completion-provider.js
