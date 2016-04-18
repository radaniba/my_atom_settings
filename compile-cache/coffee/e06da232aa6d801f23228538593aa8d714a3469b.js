(function() {
  var Color, ColorExpression, createVariableRegExpString;

  Color = require('./color');

  createVariableRegExpString = require('./regexes').createVariableRegExpString;

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
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
          _ = match[0], name = match[1];
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
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref = re.exec(text), match = _ref[0], _ref) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0MsNkJBQThCLE9BQUEsQ0FBUSxXQUFSLEVBQTlCLDBCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxlQUFDLENBQUEseUJBQUQsR0FBNEIsU0FBQyxPQUFELEdBQUE7YUFDMUIsSUFBQyxDQUFBLGdDQUFELENBQWtDLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQWxDLEVBRDBCO0lBQUEsQ0FBNUIsQ0FBQTs7QUFBQSxJQUdBLGVBQUMsQ0FBQSxzQ0FBRCxHQUF5QyxTQUFDLGNBQUQsR0FBQTthQUN2QywwQkFBQSxDQUEyQixjQUEzQixFQUR1QztJQUFBLENBSHpDLENBQUE7O0FBQUEsSUFNQSxlQUFDLENBQUEsZ0NBQUQsR0FBbUMsU0FBQyxjQUFELEdBQUE7QUFDakMsVUFBQSxtQkFBQTtBQUFBLE1BQUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLHNDQUFELENBQXdDLGNBQXhDLENBQXRCLENBQUE7YUFFSSxJQUFBLGVBQUEsQ0FDRjtBQUFBLFFBQUEsSUFBQSxFQUFNLG9CQUFOO0FBQUEsUUFDQSxZQUFBLEVBQWMsbUJBRGQ7QUFBQSxRQUVBLE1BQUEsRUFBUSxDQUFDLEdBQUQsQ0FGUjtBQUFBLFFBR0EsUUFBQSxFQUFVLENBSFY7QUFBQSxRQUlBLE1BQUEsRUFBUSxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLE9BQXBCLEdBQUE7QUFDTixjQUFBLDZCQUFBO0FBQUEsVUFBQyxZQUFELEVBQUcsZUFBSCxDQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-expression.coffee
