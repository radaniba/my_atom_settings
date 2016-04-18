(function() {
  var ExpressionsRegistry, VariableExpression, registry, sass_handler;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('pigments:less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n\\r]+);?', ['*']);

  registry.createExpression('pigments:scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', ['*'], function(match, solver) {
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
        solver.appendResult([all_underscore, match[2], 0, match[0].length]);
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult([all_hyphen, match[2], 0, match[0].length]);
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?;', ['*'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?$', ['*'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult(["var(" + match[1] + ")", match[2], 0, match[0].length]);
    return solver.endParsing(match[0].length);
  });

  registry.createExpression('pigments:stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', ['*'], function(match, solver) {
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

  registry.createExpression('pigments:stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['*']);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FBZSxJQUFBLG1CQUFBLENBQW9CLGtCQUFwQixDQUhoQyxDQUFBOztBQUFBLEVBS0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGVBQTFCLEVBQTJDLHFEQUEzQyxFQUFrRyxDQUFDLEdBQUQsQ0FBbEcsQ0FMQSxDQUFBOztBQUFBLEVBUUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQixFQUFrRCx3RUFBbEQsRUFBNEgsQ0FBQyxHQUFELENBQTVILEVBQW1JLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNqSSxJQUFDLFFBQVMsUUFBVixDQUFBO1dBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFqQyxFQUZpSTtFQUFBLENBQW5JLENBUkEsQ0FBQTs7QUFBQSxFQVlBLFlBQUEsR0FBZSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDYixRQUFBLDBCQUFBO0FBQUEsSUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUNsQixLQUFNLENBQUEsQ0FBQSxDQURZLEVBRWxCLEtBQU0sQ0FBQSxDQUFBLENBRlksRUFHbEIsQ0FIa0IsRUFJbEIsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BSlMsQ0FBcEIsQ0FBQSxDQUFBO0FBT0EsSUFBQSxJQUFHLEtBQU0sQ0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variable-expressions.coffee
