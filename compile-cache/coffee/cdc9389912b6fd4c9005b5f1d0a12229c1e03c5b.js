(function() {
  var VariableParser, VariableScanner, countLines, _ref;

  _ref = [], VariableParser = _ref[0], countLines = _ref[1];

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      if (VariableParser == null) {
        VariableParser = require('./variable-parser');
      }
      this.parser = params.parser, this.registry = params.registry, this.scope = params.scope;
      if (this.parser == null) {
        this.parser = new VariableParser(this.registry);
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExpForScope(this.scope), 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var index, lastIndex, line, lineCountIndex, match, matchText, regexp, result, v, _i, _len;
      if (start == null) {
        start = 0;
      }
      if (this.registry.getExpressionsForScope(this.scope).length === 0) {
        return;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExp();
      regexp.lastIndex = start;
      while (match = regexp.exec(text)) {
        matchText = match[0];
        index = match.index;
        lastIndex = regexp.lastIndex;
        result = this.parser.parse(matchText);
        if (result != null) {
          result.lastIndex += index;
          if (result.length > 0) {
            result.range[0] += index;
            result.range[1] += index;
            line = -1;
            lineCountIndex = 0;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.range[0] += index;
              v.range[1] += index;
              line = v.line = line + countLines(text.slice(lineCountIndex, +v.range[0] + 1 || 9e9));
              lineCountIndex = v.range[0];
            }
            return result;
          } else {
            regexp.lastIndex = result.lastIndex;
          }
        }
      }
      return void 0;
    };

    return VariableScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7O0FBQUEsRUFBQSxPQUErQixFQUEvQixFQUFDLHdCQUFELEVBQWlCLG9CQUFqQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEseUJBQUMsTUFBRCxHQUFBOztRQUFDLFNBQU87T0FDbkI7O1FBQUEsaUJBQWtCLE9BQUEsQ0FBUSxtQkFBUjtPQUFsQjtBQUFBLE1BRUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsa0JBQUEsUUFBWCxFQUFxQixJQUFDLENBQUEsZUFBQSxLQUZ0QixDQUFBOztRQUdBLElBQUMsQ0FBQSxTQUFjLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxRQUFoQjtPQUpKO0lBQUEsQ0FBYjs7QUFBQSw4QkFNQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ0wsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixJQUFDLENBQUEsS0FBN0IsQ0FBUCxFQUE0QyxJQUE1QyxFQURLO0lBQUEsQ0FOWCxDQUFBOztBQUFBLDhCQVNBLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDTixVQUFBLHFGQUFBOztRQURhLFFBQU07T0FDbkI7QUFBQSxNQUFBLElBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFpQyxJQUFDLENBQUEsS0FBbEMsQ0FBd0MsQ0FBQyxNQUF6QyxLQUFtRCxDQUE3RDtBQUFBLGNBQUEsQ0FBQTtPQUFBOztRQUVBLGFBQWMsT0FBQSxDQUFRLFNBQVIsQ0FBa0IsQ0FBQztPQUZqQztBQUFBLE1BSUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FKVCxDQUFBO0FBQUEsTUFLQSxNQUFNLENBQUMsU0FBUCxHQUFtQixLQUxuQixDQUFBO0FBT0EsYUFBTSxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQWQsR0FBQTtBQUNFLFFBQUMsWUFBYSxRQUFkLENBQUE7QUFBQSxRQUNDLFFBQVMsTUFBVCxLQURELENBQUE7QUFBQSxRQUVDLFlBQWEsT0FBYixTQUZELENBQUE7QUFBQSxRQUlBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFkLENBSlQsQ0FBQTtBQU1BLFFBQUEsSUFBRyxjQUFIO0FBQ0UsVUFBQSxNQUFNLENBQUMsU0FBUCxJQUFvQixLQUFwQixDQUFBO0FBRUEsVUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQW5CO0FBQ0UsWUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQixLQUFuQixDQUFBO0FBQUEsWUFDQSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQixLQURuQixDQUFBO0FBQUEsWUFHQSxJQUFBLEdBQU8sQ0FBQSxDQUhQLENBQUE7QUFBQSxZQUlBLGNBQUEsR0FBaUIsQ0FKakIsQ0FBQTtBQU1BLGlCQUFBLDZDQUFBOzZCQUFBO0FBQ0UsY0FBQSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjLEtBQWQsQ0FBQTtBQUFBLGNBQ0EsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYyxLQURkLENBQUE7QUFBQSxjQUVBLElBQUEsR0FBTyxDQUFDLENBQUMsSUFBRixHQUFTLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBSyw4Q0FBaEIsQ0FGdkIsQ0FBQTtBQUFBLGNBR0EsY0FBQSxHQUFpQixDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FIekIsQ0FERjtBQUFBLGFBTkE7QUFZQSxtQkFBTyxNQUFQLENBYkY7V0FBQSxNQUFBO0FBZUUsWUFBQSxNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsU0FBMUIsQ0FmRjtXQUhGO1NBUEY7TUFBQSxDQVBBO0FBa0NBLGFBQU8sTUFBUCxDQW5DTTtJQUFBLENBVFIsQ0FBQTs7MkJBQUE7O01BSkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variable-scanner.coffee
