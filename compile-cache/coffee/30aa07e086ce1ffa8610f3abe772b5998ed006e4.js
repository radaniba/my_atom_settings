(function() {
  var Emitter, ExpressionsRegistry, vm, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Emitter = _ref[0], vm = _ref[1];

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, registry, _ref1;
      if (vm == null) {
        vm = require('vm');
      }
      registry = new ExpressionsRegistry(expressionsType);
      _ref1 = serializedData.expressions;
      for (name in _ref1) {
        data = _ref1[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
      if (Emitter == null) {
        Emitter = require('event-kit').Emitter;
      }
      this.colorExpressions = {};
      this.emitter = new Emitter;
      this.regexpStrings = {};
    }

    ExpressionsRegistry.prototype.dispose = function() {
      return this.emitter.dispose();
    };

    ExpressionsRegistry.prototype.onDidAddExpression = function(callback) {
      return this.emitter.on('did-add-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidRemoveExpression = function(callback) {
      return this.emitter.on('did-remove-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidUpdateExpressions = function(callback) {
      return this.emitter.on('did-update-expressions', callback);
    };

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var _ref1, _results;
        _ref1 = this.colorExpressions;
        _results = [];
        for (k in _ref1) {
          e = _ref1[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions, matchScope;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      matchScope = function(a) {
        return function(b) {
          var aa, ab, ba, bb, _ref1, _ref2;
          _ref1 = a.split(':'), aa = _ref1[0], ab = _ref1[1];
          _ref2 = b.split(':'), ba = _ref2[0], bb = _ref2[1];
          return aa === ba && ((ab == null) || (bb == null) || ab === bb);
        };
      };
      return expressions.filter(function(e) {
        return __indexOf.call(e.scopes, '*') >= 0 || e.scopes.some(matchScope(scope));
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      var _base;
      return (_base = this.regexpStrings)['none'] != null ? _base['none'] : _base['none'] = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      var _base;
      return (_base = this.regexpStrings)[scope] != null ? _base[scope] : _base[scope] = this.getExpressionsForScope(scope).map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, scopes, handle) {
      var newExpression;
      if (priority == null) {
        priority = 0;
      }
      if (scopes == null) {
        scopes = ['*'];
      }
      if (typeof priority === 'function') {
        handle = priority;
        scopes = ['*'];
        priority = 0;
      } else if (typeof priority === 'object') {
        if (typeof scopes === 'function') {
          handle = scopes;
        }
        scopes = priority;
        priority = 0;
      }
      if (!(scopes.length === 1 && scopes[0] === '*')) {
        scopes.push('pigments');
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        scopes: scopes,
        priority: priority,
        handle: handle
      });
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression, batch) {
      if (batch == null) {
        batch = false;
      }
      this.regexpStrings = {};
      this.colorExpressions[expression.name] = expression;
      if (!batch) {
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
        this.emitter.emit('did-update-expressions', {
          name: expression.name,
          registry: this
        });
      }
      return expression;
    };

    ExpressionsRegistry.prototype.createExpressions = function(expressions) {
      return this.addExpressions(expressions.map((function(_this) {
        return function(e) {
          var expression, handle, name, priority, regexpString, scopes;
          name = e.name, regexpString = e.regexpString, handle = e.handle, priority = e.priority, scopes = e.scopes;
          if (priority == null) {
            priority = 0;
          }
          expression = new _this.expressionsType({
            name: name,
            regexpString: regexpString,
            scopes: scopes,
            handle: handle
          });
          expression.priority = priority;
          return expression;
        };
      })(this)));
    };

    ExpressionsRegistry.prototype.addExpressions = function(expressions) {
      var expression, _i, _len;
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        expression = expressions[_i];
        this.addExpression(expression, true);
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
      }
      return this.emitter.emit('did-update-expressions', {
        registry: this
      });
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      delete this.colorExpressions[name];
      this.regexpStrings = {};
      this.emitter.emit('did-remove-expression', {
        name: name,
        registry: this
      });
      return this.emitter.emit('did-update-expressions', {
        name: name,
        registry: this
      });
    };

    ExpressionsRegistry.prototype.serialize = function() {
      var expression, key, out, _ref1, _ref2;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      _ref1 = this.colorExpressions;
      for (key in _ref1) {
        expression = _ref1[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (_ref2 = expression.handle) != null ? _ref2.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvZXhwcmVzc2lvbnMtcmVnaXN0cnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUFnQixFQUFoQixFQUFDLGlCQUFELEVBQVUsWUFBVixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxjQUFELEVBQWlCLGVBQWpCLEdBQUE7QUFDWixVQUFBLG1DQUFBOztRQUFBLEtBQU0sT0FBQSxDQUFRLElBQVI7T0FBTjtBQUFBLE1BRUEsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsZUFBcEIsQ0FGZixDQUFBO0FBSUE7QUFBQSxXQUFBLGFBQUE7MkJBQUE7QUFDRSxRQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsZUFBSCxDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsbUJBQWhDLENBQW5CLEVBQXlFO0FBQUEsVUFBQyxTQUFBLE9BQUQ7QUFBQSxVQUFVLFNBQUEsT0FBVjtTQUF6RSxDQUFULENBQUE7QUFBQSxRQUNBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixJQUExQixFQUFnQyxJQUFJLENBQUMsWUFBckMsRUFBbUQsSUFBSSxDQUFDLFFBQXhELEVBQWtFLElBQUksQ0FBQyxNQUF2RSxFQUErRSxNQUEvRSxDQURBLENBREY7QUFBQSxPQUpBO0FBQUEsTUFRQSxRQUFRLENBQUMsYUFBYyxDQUFBLE1BQUEsQ0FBdkIsR0FBaUMsY0FBYyxDQUFDLFlBUmhELENBQUE7YUFVQSxTQVhZO0lBQUEsQ0FBZCxDQUFBOztBQWNhLElBQUEsNkJBQUUsZUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/expressions-registry.coffee
