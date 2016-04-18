(function() {
  var BlendModes, Color, ColorContext, ColorExpression, ColorParser, SVGColors, clamp, clampInt, comma, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, path, pe, percent, ps, split, variables, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  Color = require('./color');

  ColorParser = null;

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  BlendModes = require('./blend-modes');

  _ref = require('./utils'), split = _ref.split, clamp = _ref.clamp, clampInt = _ref.clampInt;

  _ref1 = require('./regexes'), int = _ref1.int, float = _ref1.float, percent = _ref1.percent, optionalPercent = _ref1.optionalPercent, intOrPercent = _ref1.intOrPercent, floatOrPercent = _ref1.floatOrPercent, comma = _ref1.comma, notQuote = _ref1.notQuote, hexadecimal = _ref1.hexadecimal, ps = _ref1.ps, pe = _ref1.pe, variables = _ref1.variables, namePrefixes = _ref1.namePrefixes;

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, expr, sorted, v, _i, _j, _len, _len1, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      this.sortPaths = __bind(this.sortPaths, this);
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted, this.registry = options.registry;
      if (variables == null) {
        variables = [];
      }
      if (colorVariables == null) {
        colorVariables = [];
      }
      if (this.rootPaths == null) {
        this.rootPaths = [];
      }
      if (this.referenceVariable != null) {
        if (this.referencePath == null) {
          this.referencePath = this.referenceVariable.path;
        }
      }
      if (this.sorted) {
        this.variables = variables;
        this.colorVariables = colorVariables;
      } else {
        this.variables = variables.slice().sort(this.sortPaths);
        this.colorVariables = colorVariables.slice().sort(this.sortPaths);
      }
      if (this.vars == null) {
        this.vars = {};
        this.colorVars = {};
        this.defaultVars = {};
        this.defaultColorVars = {};
        _ref2 = this.variables;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          v = _ref2[_i];
          this.vars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultVars[v.name] = v;
          }
        }
        _ref3 = this.colorVariables;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          v = _ref3[_j];
          this.colorVars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if ((this.registry.getExpression('pigments:variables') == null) && this.colorVariables.length > 0) {
        expr = ColorExpression.colorExpressionForColorVariables(this.colorVariables);
        this.registry.addExpression(expr);
      }
      if (this.parser == null) {
        ColorParser = require('./color-parser');
        this.parser = new ColorParser(this.registry, this);
      }
      this.usedVariables = [];
    }

    ColorContext.prototype.sortPaths = function(a, b) {
      var rootA, rootB, rootReference;
      if (this.referencePath != null) {
        if (a.path === b.path) {
          return 0;
        }
        if (a.path === this.referencePath) {
          return 1;
        }
        if (b.path === this.referencePath) {
          return -1;
        }
        rootReference = this.rootPathForPath(this.referencePath);
        rootA = this.rootPathForPath(a.path);
        rootB = this.rootPathForPath(b.path);
        if (rootA === rootB) {
          return 0;
        }
        if (rootA === rootReference) {
          return 1;
        }
        if (rootB === rootReference) {
          return -1;
        }
        return 0;
      } else {
        return 0;
      }
    };

    ColorContext.prototype.rootPathForPath = function(path) {
      var root, _i, _len, _ref2;
      _ref2 = this.rootPaths;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        root = _ref2[_i];
        if (path.indexOf("" + root + "/") === 0) {
          return root;
        }
      }
    };

    ColorContext.prototype.clone = function() {
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        referenceVariable: this.referenceVariable,
        parser: this.parser,
        vars: this.vars,
        colorVars: this.colorVars,
        defaultVars: this.defaultVars,
        defaultColorVars: this.defaultColorVars,
        sorted: true
      });
    };

    ColorContext.prototype.containsVariable = function(variableName) {
      return __indexOf.call(this.getVariablesNames(), variableName) >= 0;
    };

    ColorContext.prototype.hasColorVariables = function() {
      return this.colorVariables.length > 0;
    };

    ColorContext.prototype.getVariables = function() {
      return this.variables;
    };

    ColorContext.prototype.getColorVariables = function() {
      return this.colorVariables;
    };

    ColorContext.prototype.getVariablesNames = function() {
      return this.varNames != null ? this.varNames : this.varNames = Object.keys(this.vars);
    };

    ColorContext.prototype.getVariablesCount = function() {
      return this.varCount != null ? this.varCount : this.varCount = this.getVariablesNames().length;
    };

    ColorContext.prototype.readUsedVariables = function() {
      var usedVariables, v, _i, _len, _ref2;
      usedVariables = [];
      _ref2 = this.usedVariables;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        v = _ref2[_i];
        if (__indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, lookedUpValues, realValue, _ref2, _ref3;
      _ref2 = [], realValue = _ref2[0], lastRealValue = _ref2[1];
      lookedUpValues = [value];
      while ((realValue = (_ref3 = this.vars[value]) != null ? _ref3.value : void 0) && __indexOf.call(lookedUpValues, realValue) < 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
        lookedUpValues.push(realValue);
      }
      if (__indexOf.call(lookedUpValues, realValue) >= 0) {
        return void 0;
      } else {
        return lastRealValue;
      }
    };

    ColorContext.prototype.readColorExpression = function(value) {
      if (this.colorVars[value] != null) {
        this.usedVariables.push(value);
        return this.colorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, result, scope, _ref2;
      if (keepAllVariables == null) {
        keepAllVariables = false;
      }
      realValue = this.readColorExpression(value);
      if (realValue == null) {
        return;
      }
      scope = this.colorVars[value] != null ? path.extname(this.colorVars[value].path) : '*';
      result = this.parser.parse(realValue, scope, false);
      if (result != null) {
        if (result.invalid && (this.defaultColorVars[realValue] != null)) {
          this.usedVariables.push(realValue);
          result = this.readColor(this.defaultColorVars[realValue].value);
          value = realValue;
        }
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        result = this.readColor(this.defaultColorVars[value].value);
      } else {
        if (this.vars[value] != null) {
          this.usedVariables.push(value);
        }
      }
      if ((result != null) && (keepAllVariables || __indexOf.call(this.usedVariables, value) < 0)) {
        result.variables = ((_ref2 = result.variables) != null ? _ref2 : []).concat(this.readUsedVariables());
      }
      return result;
    };

    ColorContext.prototype.readFloat = function(value) {
      var res;
      res = parseFloat(value);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readInt = function(value, base) {
      var res;
      if (base == null) {
        base = 10;
      }
      res = parseInt(value, base);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readPercent = function(value) {
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.defaultVars[value].value);
      }
      return Math.round(parseFloat(value) * 2.55);
    };

    ColorContext.prototype.readIntOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = Math.round(parseFloat(value) * 2.55);
      } else {
        res = parseInt(value);
      }
      return res;
    };

    ColorContext.prototype.readFloatOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = parseFloat(value) / 100;
      } else {
        res = parseFloat(value);
        if (res > 1) {
          res = res / 100;
        }
        res;
      }
      return res;
    };

    ColorContext.prototype.SVGColors = SVGColors;

    ColorContext.prototype.Color = Color;

    ColorContext.prototype.BlendModes = BlendModes;

    ColorContext.prototype.split = function(value) {
      return split(value);
    };

    ColorContext.prototype.clamp = function(value) {
      return clamp(value);
    };

    ColorContext.prototype.clampInt = function(value) {
      return clampInt(value);
    };

    ColorContext.prototype.isInvalid = function(color) {
      return !(color != null ? color.isValid() : void 0);
    };

    ColorContext.prototype.readParam = function(param, block) {
      var name, re, value, _, _ref2;
      re = RegExp("\\$(\\w+):\\s*((-?" + this.float + ")|" + this.variablesRE + ")");
      if (re.test(param)) {
        _ref2 = re.exec(param), _ = _ref2[0], name = _ref2[1], value = _ref2[2];
        return block(name, value);
      }
    };

    ColorContext.prototype.contrast = function(base, dark, light, threshold) {
      var _ref2;
      if (dark == null) {
        dark = new Color('black');
      }
      if (light == null) {
        light = new Color('white');
      }
      if (threshold == null) {
        threshold = 0.43;
      }
      if (dark.luma > light.luma) {
        _ref2 = [dark, light], light = _ref2[0], dark = _ref2[1];
      }
      if (base.luma > threshold) {
        return dark;
      } else {
        return light;
      }
    };

    ColorContext.prototype.mixColors = function(color1, color2, amount, round) {
      var color, inverse;
      if (amount == null) {
        amount = 0.5;
      }
      if (round == null) {
        round = Math.floor;
      }
      inverse = 1 - amount;
      color = new Color;
      color.rgba = [round(color1.red * amount + color2.red * inverse), round(color1.green * amount + color2.green * inverse), round(color1.blue * amount + color2.blue * inverse), color1.alpha * amount + color2.alpha * inverse];
      return color;
    };

    ColorContext.prototype.int = int;

    ColorContext.prototype.float = float;

    ColorContext.prototype.percent = percent;

    ColorContext.prototype.optionalPercent = optionalPercent;

    ColorContext.prototype.intOrPercent = intOrPercent;

    ColorContext.prototype.floatOrPercent = floatOrPercent;

    ColorContext.prototype.comma = comma;

    ColorContext.prototype.notQuote = notQuote;

    ColorContext.prototype.hexadecimal = hexadecimal;

    ColorContext.prototype.ps = ps;

    ColorContext.prototype.pe = pe;

    ColorContext.prototype.variablesRE = variables;

    ColorContext.prototype.namePrefixes = namePrefixes;

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItY29udGV4dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc1BBQUE7SUFBQTt5SkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FEUixDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLElBRmQsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FKWixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLE9BQTJCLE9BQUEsQ0FBUSxTQUFSLENBQTNCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsZ0JBQUEsUUFOZixDQUFBOztBQUFBLEVBT0EsUUFjSSxPQUFBLENBQVEsV0FBUixDQWRKLEVBQ0UsWUFBQSxHQURGLEVBRUUsY0FBQSxLQUZGLEVBR0UsZ0JBQUEsT0FIRixFQUlFLHdCQUFBLGVBSkYsRUFLRSxxQkFBQSxZQUxGLEVBTUUsdUJBQUEsY0FORixFQU9FLGNBQUEsS0FQRixFQVFFLGlCQUFBLFFBUkYsRUFTRSxvQkFBQSxXQVRGLEVBVUUsV0FBQSxFQVZGLEVBV0UsV0FBQSxFQVhGLEVBWUUsa0JBQUEsU0FaRixFQWFFLHFCQUFBLFlBcEJGLENBQUE7O0FBQUEsRUF1QkEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUMsT0FBRCxHQUFBO0FBQ1gsVUFBQSxrRUFBQTs7UUFEWSxVQUFRO09BQ3BCO0FBQUEsbURBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-context.coffee
