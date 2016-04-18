(function() {
  var ColorContext, ColorParser, ColorSearch, Emitter, Minimatch, path, registry;

  path = require('path');

  Emitter = require('atom').Emitter;

  Minimatch = require('minimatch').Minimatch;

  registry = require('./color-expressions');

  ColorParser = require('./color-parser');

  ColorContext = require('./color-context');

  module.exports = ColorSearch = (function() {
    ColorSearch.deserialize = function(state) {
      return new ColorSearch(state.options);
    };

    function ColorSearch(options) {
      var error, ignore, ignoredNames, _i, _len, _ref;
      this.options = options != null ? options : {};
      _ref = this.options, this.sourceNames = _ref.sourceNames, ignoredNames = _ref.ignoredNames, this.context = _ref.context;
      this.emitter = new Emitter;
      if (this.context == null) {
        this.context = new ColorContext({
          registry: registry
        });
      }
      this.parser = this.context.parser;
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      if (ignoredNames == null) {
        ignoredNames = [];
      }
      this.ignoredNames = [];
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (ignore != null) {
          try {
            this.ignoredNames.push(new Minimatch(ignore, {
              matchBase: true,
              dot: true
            }));
          } catch (_error) {
            error = _error;
            console.warn("Error parsing ignore pattern (" + ignore + "): " + error.message);
          }
        }
      }
    }

    ColorSearch.prototype.getTitle = function() {
      return 'Pigments Find Results';
    };

    ColorSearch.prototype.getURI = function() {
      return 'pigments://search';
    };

    ColorSearch.prototype.getIconName = function() {
      return "pigments";
    };

    ColorSearch.prototype.onDidFindMatches = function(callback) {
      return this.emitter.on('did-find-matches', callback);
    };

    ColorSearch.prototype.onDidCompleteSearch = function(callback) {
      return this.emitter.on('did-complete-search', callback);
    };

    ColorSearch.prototype.search = function() {
      var promise, re, results;
      re = new RegExp(registry.getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, scope, _i, _len, _ref, _ref1;
          relativePath = atom.project.relativize(m.filePath);
          scope = path.extname(relativePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref = m.matches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            result = _ref[_i];
            result.color = _this.parser.parse(result.matchText, scope);
            if (!((_ref1 = result.color) != null ? _ref1.isValid() : void 0)) {
              continue;
            }
            if (result.range[0] == null) {
              console.warn("Color search returned a result with an invalid range", result);
              continue;
            }
            result.range[0][1] += result.matchText.indexOf(result.color.colorExpression);
            result.matchText = result.color.colorExpression;
            results.push(result);
            newMatches.push(result);
          }
          m.matches = newMatches;
          if (m.matches.length > 0) {
            return _this.emitter.emit('did-find-matches', m);
          }
        };
      })(this));
      return promise.then((function(_this) {
        return function() {
          _this.results = results;
          return _this.emitter.emit('did-complete-search', results);
        };
      })(this));
    };

    ColorSearch.prototype.isIgnored = function(relativePath) {
      var ignoredName, _i, _len, _ref;
      _ref = this.ignoredNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ignoredName = _ref[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    ColorSearch.prototype.serialize = function() {
      return {
        deserializer: 'ColorSearch',
        options: this.options
      };
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2VhcmNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwRUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQyxVQUFXLE9BQUEsQ0FBUSxNQUFSLEVBQVgsT0FERCxDQUFBOztBQUFBLEVBRUMsWUFBYSxPQUFBLENBQVEsV0FBUixFQUFiLFNBRkQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEscUJBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUpkLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBTGYsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFdBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFBZSxJQUFBLFdBQUEsQ0FBWSxLQUFLLENBQUMsT0FBbEIsRUFBZjtJQUFBLENBQWQsQ0FBQTs7QUFFYSxJQUFBLHFCQUFFLE9BQUYsR0FBQTtBQUNYLFVBQUEsMkNBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSw0QkFBQSxVQUFRLEVBQ3JCLENBQUE7QUFBQSxNQUFBLE9BQXlDLElBQUMsQ0FBQSxPQUExQyxFQUFDLElBQUMsQ0FBQSxtQkFBQSxXQUFGLEVBQWUsb0JBQUEsWUFBZixFQUE2QixJQUFDLENBQUEsZUFBQSxPQUE5QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQURYLENBQUE7O1FBRUEsSUFBQyxDQUFBLFVBQWUsSUFBQSxZQUFBLENBQWE7QUFBQSxVQUFDLFVBQUEsUUFBRDtTQUFi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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-search.coffee
