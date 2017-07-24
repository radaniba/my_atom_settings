(function() {
  var ExpressionsRegistry, VariableExpression, registry, sass_handler;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('pigments:less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n\\r]+);?', ['less']);

  registry.createExpression('pigments:scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', ['scss', 'sass', 'haml'], function(match, solver) {
    match = match[0];
    return solver.endParsing(match.length - 1);
  });

  sass_handler = function(match, solver) {
    var all_hyphen, all_underscore;
    solver.appendResult([match[1], match[2], 0, match[0].length]);
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult([all_underscore, match[2], 0, match[0].length, true]);
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult([all_hyphen, match[2], 0, match[0].length, true]);
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult(["var(" + match[1] + ")", match[2], 0, match[0].length]);
    return solver.endParsing(match[0].length);
  });

  registry.createExpression('pigments:stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', ['styl', 'stylus'], function(match, solver) {
    var buffer, char, commaSensitiveBegin, commaSensitiveEnd, content, current, inCommaSensitiveContext, key, name, scope, scopeBegin, scopeEnd, value, _i, _len, _ref, _ref1;
    buffer = '';
    _ref = match, match = _ref[0], name = _ref[1], content = _ref[2];
    current = match.indexOf(content);
    scope = [name];
    scopeBegin = /\{/;
    scopeEnd = /\}/;
    commaSensitiveBegin = /\(|\[/;
    commaSensitiveEnd = /\)|\]/;
    inCommaSensitiveContext = false;
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      char = content[_i];
      if (scopeBegin.test(char)) {
        scope.push(buffer.replace(/[\s:]/g, ''));
        buffer = '';
      } else if (scopeEnd.test(char)) {
        scope.pop();
        if (scope.length === 0) {
          return solver.endParsing(current);
        }
      } else if (commaSensitiveBegin.test(char)) {
        buffer += char;
        inCommaSensitiveContext = true;
      } else if (inCommaSensitiveContext) {
        buffer += char;
        inCommaSensitiveContext = !commaSensitiveEnd.test(char);
      } else if (/[,\n]/.test(char)) {
        buffer = buffer.replace(/\s+/g, '');
        if (buffer.length) {
          _ref1 = buffer.split(/\s*:\s*/), key = _ref1[0], value = _ref1[1];
          solver.appendResult([scope.concat(key).join('.'), value, current - buffer.length - 1, current]);
        }
        buffer = '';
      } else {
        buffer += char;
      }
      current++;
    }
    scope.pop();
    if (scope.length === 0) {
      return solver.endParsing(current + 1);
    } else {
      return solver.abortParsing();
    }
  });

  registry.createExpression('pigments:stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['styl', 'stylus']);

  registry.createExpression('pigments:latex', '\\\\definecolor(\\{[^\\}]+\\})\\{([^\\}]+)\\}\\{([^\\}]+)\\}', ['tex'], function(match, solver) {
    var mode, name, value, values, _;
    _ = match[0], name = match[1], mode = match[2], value = match[3];
    value = (function() {
      switch (mode) {
        case 'RGB':
          return "rgb(" + value + ")";
        case 'gray':
          return "gray(" + (Math.round(parseFloat(value) * 100)) + "%)";
        case 'rgb':
          values = value.split(',').map(function(n) {
            return Math.floor(n * 255);
          });
          return "rgb(" + (values.join(',')) + ")";
        case 'cmyk':
          return "cmyk(" + value + ")";
        case 'HTML':
          return "#" + value;
        default:
          return value;
      }
    })();
    solver.appendResult([name, value, 0, _.length, false, true]);
    return solver.endParsing(_.length);
  });

  registry.createExpression('pigments:latex_mix', '\\\\definecolor(\\{[^\\}]+\\})(\\{[^\\}\\n!]+[!][^\\}\\n]+\\})', ['tex'], function(match, solver) {
    var name, value, _;
    _ = match[0], name = match[1], value = match[2];
    solver.appendResult([name, value, 0, _.length, false, true]);
    return solver.endParsing(_.length);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FBZSxJQUFBLG1CQUFBLENBQW9CLGtCQUFwQixDQUhoQyxDQUFBOztBQUFBLEVBS0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLHFEQUEzQyxFQUFrRyxDQUFDLE1BQUQsQ0FBbEcsQ0FMQSxDQUFBOztBQUFBLEVBUUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQixFQUFrRCx3RUFBbEQsRUFBNEgsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixDQUE1SCxFQUFzSixTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDcEosSUFBQyxRQUFTLFFBQVYsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBakMsRUFGb0o7RUFBQSxDQUF0SixDQVJBLENBQUE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2IsUUFBQSwwQkFBQTtBQUFBLElBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FDbEIsS0FBTSxDQUFBLENBQUEsQ0FEWSxFQUVsQixLQUFNLENBQUEsQ0FBQSxDQUZZLEVBR2xCLENBSGtCLEVBSWxCLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUpTLENBQXBCLENBQUEsQ0FBQTtB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variable-expressions.coffee
