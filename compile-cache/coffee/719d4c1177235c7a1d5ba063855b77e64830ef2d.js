(function() {
  var ColorContext, ColorSearch, Emitter, Minimatch, registry, _ref;

  _ref = [], Emitter = _ref[0], Minimatch = _ref[1], ColorContext = _ref[2], registry = _ref[3];

  module.exports = ColorSearch = (function() {
    ColorSearch.deserialize = function(state) {
      return new ColorSearch(state.options);
    };

    function ColorSearch(options) {
      var subscription, _ref1;
      this.options = options != null ? options : {};
      _ref1 = this.options, this.sourceNames = _ref1.sourceNames, this.ignoredNameSources = _ref1.ignoredNames, this.context = _ref1.context, this.project = _ref1.project;
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      if (this.project != null) {
        this.init();
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pkg.mainModule.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    }

    ColorSearch.prototype.init = function() {
      var error, ignore, _i, _len, _ref1;
      if (Minimatch == null) {
        Minimatch = require('minimatch').Minimatch;
      }
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (this.context == null) {
        this.context = new ColorContext({
          registry: this.project.getColorExpressionsRegistry()
        });
      }
      this.parser = this.context.parser;
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      if (this.ignoredNameSources == null) {
        this.ignoredNameSources = [];
      }
      this.ignoredNames = [];
      _ref1 = this.ignoredNameSources;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignore = _ref1[_i];
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
      if (this.searchRequested) {
        return this.search();
      }
    };

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
      if (this.project == null) {
        this.searchRequested = true;
        return;
      }
      re = new RegExp(this.project.getColorExpressionsRegistry().getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, scope, _i, _len, _ref1, _ref2;
          relativePath = atom.project.relativize(m.filePath);
          scope = _this.project.scopeFromFileName(relativePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref1 = m.matches;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
            result.color = _this.parser.parse(result.matchText, scope);
            if (!((_ref2 = result.color) != null ? _ref2.isValid() : void 0)) {
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
      var ignoredName, _i, _len, _ref1;
      _ref1 = this.ignoredNames;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignoredName = _ref1[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    ColorSearch.prototype.serialize = function() {
      return {
        deserializer: 'ColorSearch',
        options: {
          sourceNames: this.sourceNames,
          ignoredNames: this.ignoredNameSources
        }
      };
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2VhcmNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2REFBQTs7QUFBQSxFQUFBLE9BQStDLEVBQS9DLEVBQUMsaUJBQUQsRUFBVSxtQkFBVixFQUFxQixzQkFBckIsRUFBbUMsa0JBQW5DLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxXQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRCxHQUFBO2FBQWUsSUFBQSxXQUFBLENBQVksS0FBSyxDQUFDLE9BQWxCLEVBQWY7SUFBQSxDQUFkLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxPQUFGLEdBQUE7QUFDWCxVQUFBLG1CQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsNEJBQUEsVUFBUSxFQUNyQixDQUFBO0FBQUEsTUFBQSxRQUF3RSxJQUFDLENBQUEsT0FBekUsRUFBQyxJQUFDLENBQUEsb0JBQUEsV0FBRixFQUE2QixJQUFDLENBQUEsMkJBQWYsWUFBZixFQUFrRCxJQUFDLENBQUEsZ0JBQUEsT0FBbkQsRUFBNEQsSUFBQyxDQUFBLGdCQUFBLE9BQTdELENBQUE7QUFDQSxNQUFBLElBQWtDLGVBQWxDO0FBQUEsUUFBQyxVQUFXLE9BQUEsQ0FBUSxNQUFSLEVBQVgsT0FBRCxDQUFBO09BREE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRlgsQ0FBQTtBQUlBLE1BQUEsSUFBRyxvQkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBZCxDQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-search.coffee
