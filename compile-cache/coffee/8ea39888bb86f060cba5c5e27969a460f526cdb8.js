(function() {
  var VariableExpression;

  module.exports = VariableExpression = (function() {
    VariableExpression.DEFAULT_HANDLE = function(match, solver) {
      var end, name, start, value, _;
      _ = match[0], name = match[1], value = match[2];
      start = _.indexOf(name);
      end = _.indexOf(value) + value.length;
      solver.appendResult(name, value, start, end);
      return solver.endParsing(end);
    };

    function VariableExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("" + this.regexpString, 'm');
      if (this.handle == null) {
        this.handle = this.constructor.DEFAULT_HANDLE;
      }
    }

    VariableExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    VariableExpression.prototype.parse = function(expression) {
      var lastIndex, match, matchText, parsingAborted, results, solver, startIndex;
      parsingAborted = false;
      results = [];
      match = this.regexp.exec(expression);
      if (match != null) {
        matchText = match[0];
        lastIndex = this.regexp.lastIndex;
        startIndex = lastIndex - matchText.length;
        solver = {
          endParsing: function(end) {
            var start;
            start = expression.indexOf(matchText);
            results.lastIndex = end;
            results.range = [start, end];
            return results.match = matchText.slice(start, end);
          },
          abortParsing: function() {
            return parsingAborted = true;
          },
          appendResult: function(name, value, start, end, _arg) {
            var isAlternate, isDefault, noNamePrefix, range, reName, _ref;
            _ref = _arg != null ? _arg : {}, isAlternate = _ref.isAlternate, noNamePrefix = _ref.noNamePrefix, isDefault = _ref.isDefault;
            range = [start, end];
            reName = name.replace('$', '\\$');
            if (!RegExp("" + reName + "(?![-_])").test(value)) {
              return results.push({
                name: name,
                value: value,
                range: range,
                isAlternate: isAlternate,
                noNamePrefix: noNamePrefix,
                "default": isDefault
              });
            }
          }
        };
        this.handle(match, solver);
      }
      if (parsingAborted) {
        return void 0;
      } else {
        return results;
      }
    };

    return VariableExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxrQkFBQyxDQUFBLGNBQUQsR0FBaUIsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2YsVUFBQSwwQkFBQTtBQUFBLE1BQUMsWUFBRCxFQUFJLGVBQUosRUFBVSxnQkFBVixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLENBRFIsQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFBLEdBQW1CLEtBQUssQ0FBQyxNQUYvQixDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQixFQUEwQixLQUExQixFQUFpQyxLQUFqQyxFQUF3QyxHQUF4QyxDQUhBLENBQUE7YUFJQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixFQUxlO0lBQUEsQ0FBakIsQ0FBQTs7QUFPYSxJQUFBLDRCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsb0JBQUEsY0FBYyxJQUFDLENBQUEsY0FBQSxRQUFRLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxjQUFBLE1BQ3hELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQU8sRUFBQSxHQUFHLElBQUMsQ0FBQSxZQUFYLEVBQTJCLEdBQTNCLENBQWQsQ0FBQTs7UUFDQSxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDO09BRmI7SUFBQSxDQVBiOztBQUFBLGlDQVdBLEtBQUEsR0FBTyxTQUFDLFVBQUQsR0FBQTthQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxVQUFiLEVBQWhCO0lBQUEsQ0FYUCxDQUFBOztBQUFBLGlDQWFBLEtBQUEsR0FBTyxTQUFDLFVBQUQsR0FBQTtBQUNMLFVBQUEsd0VBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsS0FBakIsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLEVBRFYsQ0FBQTtBQUFBLE1BR0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FIUixDQUFBO0FBSUEsTUFBQSxJQUFHLGFBQUg7QUFFRSxRQUFDLFlBQWEsUUFBZCxDQUFBO0FBQUEsUUFDQyxZQUFhLElBQUMsQ0FBQSxPQUFkLFNBREQsQ0FBQTtBQUFBLFFBRUEsVUFBQSxHQUFhLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFGbkMsQ0FBQTtBQUFBLFFBSUEsTUFBQSxHQUNFO0FBQUEsVUFBQSxVQUFBLEVBQVksU0FBQyxHQUFELEdBQUE7QUFDVixnQkFBQSxLQUFBO0FBQUEsWUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsU0FBbkIsQ0FBUixDQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsU0FBUixHQUFvQixHQURwQixDQUFBO0FBQUEsWUFFQSxPQUFPLENBQUMsS0FBUixHQUFnQixDQUFDLEtBQUQsRUFBTyxHQUFQLENBRmhCLENBQUE7bUJBR0EsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBVSxtQkFKaEI7VUFBQSxDQUFaO0FBQUEsVUFLQSxZQUFBLEVBQWMsU0FBQSxHQUFBO21CQUNaLGNBQUEsR0FBaUIsS0FETDtVQUFBLENBTGQ7QUFBQSxVQU9BLFlBQUEsRUFBYyxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsS0FBZCxFQUFxQixHQUFyQixFQUEwQixJQUExQixHQUFBO0FBQ1osZ0JBQUEseURBQUE7QUFBQSxrQ0FEc0MsT0FBdUMsSUFBdEMsbUJBQUEsYUFBYSxvQkFBQSxjQUFjLGlCQUFBLFNBQ2xFLENBQUE7QUFBQSxZQUFBLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFBUSxHQUFSLENBQVIsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixFQUFrQixLQUFsQixDQURULENBQUE7QUFFQSxZQUFBLElBQUEsQ0FBQSxNQUFPLENBQUEsRUFBQSxHQUFLLE1BQUwsR0FBWSxVQUFaLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0IsQ0FBUDtxQkFDRSxPQUFPLENBQUMsSUFBUixDQUFhO0FBQUEsZ0JBQ1gsTUFBQSxJQURXO0FBQUEsZ0JBQ0wsT0FBQSxLQURLO0FBQUEsZ0JBQ0UsT0FBQSxLQURGO0FBQUEsZ0JBQ1MsYUFBQSxXQURUO0FBQUEsZ0JBQ3NCLGNBQUEsWUFEdEI7QUFBQSxnQkFFWCxTQUFBLEVBQVMsU0FGRTtlQUFiLEVBREY7YUFIWTtVQUFBLENBUGQ7U0FMRixDQUFBO0FBQUEsUUFxQkEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLEVBQWUsTUFBZixDQXJCQSxDQUZGO09BSkE7QUE2QkEsTUFBQSxJQUFHLGNBQUg7ZUFBdUIsT0FBdkI7T0FBQSxNQUFBO2VBQXNDLFFBQXRDO09BOUJLO0lBQUEsQ0FiUCxDQUFBOzs4QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variable-expression.coffee
