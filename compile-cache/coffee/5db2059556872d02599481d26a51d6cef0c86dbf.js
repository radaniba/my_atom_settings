(function() {
  var Color, ColorExpression, createVariableRegExpString, _ref;

  _ref = [], createVariableRegExpString = _ref[0], Color = _ref[1];

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      if (createVariableRegExpString == null) {
        createVariableRegExpString = require('./regexes').createVariableRegExpString;
      }
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var baseColor, evaluated, name, _;
          _ = match[0], _ = match[1], name = match[2];
          if (name == null) {
            name = match[0];
          }
          evaluated = context.readColorExpression(name);
          if (evaluated === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(evaluated);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      if (Color == null) {
        Color = require('./color');
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref1;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref1 = re.exec(text), match = _ref1[0], _ref1) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0RBQUE7O0FBQUEsRUFBQSxPQUFzQyxFQUF0QyxFQUFDLG9DQUFELEVBQTZCLGVBQTdCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxlQUFDLENBQUEseUJBQUQsR0FBNEIsU0FBQyxPQUFELEdBQUE7YUFDMUIsSUFBQyxDQUFBLGdDQUFELENBQWtDLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQWxDLEVBRDBCO0lBQUEsQ0FBNUIsQ0FBQTs7QUFBQSxJQUdBLGVBQUMsQ0FBQSxzQ0FBRCxHQUF5QyxTQUFDLGNBQUQsR0FBQTtBQUN2QyxNQUFBLElBQU8sa0NBQVA7QUFDRSxRQUFDLDZCQUE4QixPQUFBLENBQVEsV0FBUixFQUE5QiwwQkFBRCxDQURGO09BQUE7YUFHQSwwQkFBQSxDQUEyQixjQUEzQixFQUp1QztJQUFBLENBSHpDLENBQUE7O0FBQUEsSUFTQSxlQUFDLENBQUEsZ0NBQUQsR0FBbUMsU0FBQyxjQUFELEdBQUE7QUFDakMsVUFBQSxtQkFBQTtBQUFBLE1BQUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLHNDQUFELENBQXdDLGNBQXhDLENBQXRCLENBQUE7YUFFSSxJQUFBLGVBQUEsQ0FDRjtBQUFBLFFBQUEsSUFBQSxFQUFNLG9CQUFOO0FBQUEsUUFDQSxZQUFBLEVBQWMsbUJBRGQ7QUFBQSxRQUVBLE1BQUEsRUFBUSxDQUFDLEdBQUQsQ0FGUjtBQUFBLFFBR0EsUUFBQSxFQUFVLENBSFY7QUFBQSxRQUlBLE1BQUEsRUFBUSxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLE9BQXBCLEdBQUE7QUFDTixjQUFBLDZCQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-expression.coffee
