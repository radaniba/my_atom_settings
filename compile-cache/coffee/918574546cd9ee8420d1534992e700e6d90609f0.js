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
    solver.appendResult(match[1], match[2], 0, match[0].length, {
      isDefault: match[3] != null
    });
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult(all_underscore, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult(all_hyphen, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult("var(" + match[1] + ")", match[2], 0, match[0].length);
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
          solver.appendResult(scope.concat(key).join('.'), value, current - buffer.length - 1, current);
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
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

  registry.createExpression('pigments:latex_mix', '\\\\definecolor(\\{[^\\}]+\\})(\\{[^\\}\\n!]+[!][^\\}\\n]+\\})', ['tex'], function(match, solver) {
    var name, value, _;
    _ = match[0], name = match[1], value = match[2];
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FBZSxJQUFBLG1CQUFBLENBQW9CLGtCQUFwQixDQUhoQyxDQUFBOztBQUFBLEVBS0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLHFEQUEzQyxFQUFrRyxDQUFDLE1BQUQsQ0FBbEcsQ0FMQSxDQUFBOztBQUFBLEVBUUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQixFQUFrRCx3RUFBbEQsRUFBNEgsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixDQUE1SCxFQUFzSixTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDcEosSUFBQyxRQUFTLFFBQVYsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBakMsRUFGb0o7RUFBQSxDQUF0SixDQVJBLENBQUE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2IsUUFBQSwwQkFBQTtBQUFBLElBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsS0FBTSxDQUFBLENBQUEsQ0FBMUIsRUFBOEIsS0FBTSxDQUFBLENBQUEsQ0FBcEMsRUFBd0MsQ0FBeEMsRUFBMkMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXBELEVBQTREO0FBQUEsTUFBQSxTQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variable-expressions.coffee
