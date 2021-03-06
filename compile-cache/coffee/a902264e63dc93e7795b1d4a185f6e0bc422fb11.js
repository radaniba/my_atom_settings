(function() {
  var ColorExpression, Emitter, ExpressionsRegistry, vm,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('event-kit').Emitter;

  ColorExpression = require('./color-expression');

  vm = require('vm');

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, registry, _ref;
      registry = new ExpressionsRegistry(expressionsType);
      _ref = serializedData.expressions;
      for (name in _ref) {
        data = _ref[name];
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
        var _ref, _results;
        _ref = this.colorExpressions;
        _results = [];
        for (k in _ref) {
          e = _ref[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      return expressions.filter(function(e) {
        return __indexOf.call(e.scopes, '*') >= 0 || __indexOf.call(e.scopes, scope) >= 0;
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
      var expression, key, out, _ref, _ref1;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      _ref = this.colorExpressions;
      for (key in _ref) {
        expression = _ref[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (_ref1 = expression.handle) != null ? _ref1.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvZXhwcmVzc2lvbnMtcmVnaXN0cnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FBRCxDQUFBOztBQUFBLEVBQ0EsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FEbEIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLGNBQUQsRUFBaUIsZUFBakIsR0FBQTtBQUNaLFVBQUEsa0NBQUE7QUFBQSxNQUFBLFFBQUEsR0FBZSxJQUFBLG1CQUFBLENBQW9CLGVBQXBCLENBQWYsQ0FBQTtBQUVBO0FBQUEsV0FBQSxZQUFBOzBCQUFBO0FBQ0UsUUFBQSxNQUFBLEdBQVMsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLG1CQUFoQyxDQUFuQixFQUF5RTtBQUFBLFVBQUMsU0FBQSxPQUFEO0FBQUEsVUFBVSxTQUFBLE9BQVY7U0FBekUsQ0FBVCxDQUFBO0FBQUEsUUFDQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBSSxDQUFDLFlBQXJDLEVBQW1ELElBQUksQ0FBQyxRQUF4RCxFQUFrRSxJQUFJLENBQUMsTUFBdkUsRUFBK0UsTUFBL0UsQ0FEQSxDQURGO0FBQUEsT0FGQTtBQUFBLE1BTUEsUUFBUSxDQUFDLGFBQWMsQ0FBQSxNQUFBLENBQXZCLEdBQWlDLGNBQWMsQ0FBQyxZQU5oRCxDQUFBO2FBUUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/expressions-registry.coffee
