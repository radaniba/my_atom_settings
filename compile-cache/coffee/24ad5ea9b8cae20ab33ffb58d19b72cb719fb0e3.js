(function() {
  var decimal, float, int, namePrefixes, percent, variables;

  int = '\\d+';

  decimal = "\\." + int;

  float = "(?:" + int + decimal + "|" + int + "|" + decimal + ")";

  percent = "" + float + "%";

  variables = '(?:@[a-zA-Z0-9\\-_]+|\\$[a-zA-Z0-9\\-_]+|[a-zA-Z_][a-zA-Z0-9\\-_]*)';

  namePrefixes = '^| |\\t|:|=|,|\\n|\'|"|\\(|\\[|\\{|>';

  module.exports = {
    int: int,
    float: float,
    percent: percent,
    optionalPercent: "" + float + "%?",
    intOrPercent: "(?:" + percent + "|" + int + ")",
    floatOrPercent: "(?:" + percent + "|" + float + ")",
    comma: '\\s*,\\s*',
    notQuote: "[^\"'\\n\\r]+",
    hexadecimal: '[\\da-fA-F]',
    ps: '\\(\\s*',
    pe: '\\s*\\)',
    variables: variables,
    namePrefixes: namePrefixes,
    createVariableRegExpString: function(variables) {
      var res, v, variableNamesWithPrefix, variableNamesWithoutPrefix, withPrefixes, withoutPrefixes, _i, _j, _len, _len1;
      variableNamesWithPrefix = [];
      variableNamesWithoutPrefix = [];
      withPrefixes = variables.filter(function(v) {
        return !v.noNamePrefix;
      });
      withoutPrefixes = variables.filter(function(v) {
        return v.noNamePrefix;
      });
      res = [];
      if (withPrefixes.length > 0) {
        for (_i = 0, _len = withPrefixes.length; _i < _len; _i++) {
          v = withPrefixes[_i];
          variableNamesWithPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("((?:" + namePrefixes + ")(" + (variableNamesWithPrefix.join('|')) + ")(\\s+!default)?(?!_|-|\\w|\\d|[ \\t]*[\\.:=]))");
      }
      if (withoutPrefixes.length > 0) {
        for (_j = 0, _len1 = withoutPrefixes.length; _j < _len1; _j++) {
          v = withoutPrefixes[_j];
          variableNamesWithoutPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("(" + (variableNamesWithoutPrefix.join('|')) + ")");
      }
      return res.join('|');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVnZXhlcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscURBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sTUFBTixDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFXLEtBQUEsR0FBSyxHQURoQixDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFTLEtBQUEsR0FBSyxHQUFMLEdBQVcsT0FBWCxHQUFtQixHQUFuQixHQUFzQixHQUF0QixHQUEwQixHQUExQixHQUE2QixPQUE3QixHQUFxQyxHQUY5QyxDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLEVBQUEsR0FBRyxLQUFILEdBQVMsR0FIbkIsQ0FBQTs7QUFBQSxFQUlBLFNBQUEsR0FBWSxxRUFKWixDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLHNDQUxmLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLElBQ0EsS0FBQSxFQUFPLEtBRFA7QUFBQSxJQUVBLE9BQUEsRUFBUyxPQUZUO0FBQUEsSUFHQSxlQUFBLEVBQWlCLEVBQUEsR0FBRyxLQUFILEdBQVMsSUFIMUI7QUFBQSxJQUlBLFlBQUEsRUFBZSxLQUFBLEdBQUssT0FBTCxHQUFhLEdBQWIsR0FBZ0IsR0FBaEIsR0FBb0IsR0FKbkM7QUFBQSxJQUtBLGNBQUEsRUFBaUIsS0FBQSxHQUFLLE9BQUwsR0FBYSxHQUFiLEdBQWdCLEtBQWhCLEdBQXNCLEdBTHZDO0FBQUEsSUFNQSxLQUFBLEVBQU8sV0FOUDtBQUFBLElBT0EsUUFBQSxFQUFVLGVBUFY7QUFBQSxJQVFBLFdBQUEsRUFBYSxhQVJiO0FBQUEsSUFTQSxFQUFBLEVBQUksU0FUSjtBQUFBLElBVUEsRUFBQSxFQUFJLFNBVko7QUFBQSxJQVdBLFNBQUEsRUFBVyxTQVhYO0FBQUEsSUFZQSxZQUFBLEVBQWMsWUFaZDtBQUFBLElBYUEsMEJBQUEsRUFBNEIsU0FBQyxTQUFELEdBQUE7QUFDMUIsVUFBQSwrR0FBQTtBQUFBLE1BQUEsdUJBQUEsR0FBMEIsRUFBMUIsQ0FBQTtBQUFBLE1BQ0EsMEJBQUEsR0FBNkIsRUFEN0IsQ0FBQTtBQUFBLE1BRUEsWUFBQSxHQUFlLFNBQVMsQ0FBQyxNQUFWLENBQWlCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBQSxDQUFLLENBQUMsYUFBYjtNQUFBLENBQWpCLENBRmYsQ0FBQTtBQUFBLE1BR0EsZUFBQSxHQUFrQixTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxhQUFUO01BQUEsQ0FBakIsQ0FIbEIsQ0FBQTtBQUFBLE1BS0EsR0FBQSxHQUFNLEVBTE4sQ0FBQTtBQU9BLE1BQUEsSUFBRyxZQUFZLENBQUMsTUFBYixHQUFzQixDQUF6QjtBQUNFLGFBQUEsbURBQUE7K0JBQUE7QUFDRSxVQUFBLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBUCxDQUFlLG9DQUFmLEVBQXFELE1BQXJELENBQTdCLENBQUEsQ0FERjtBQUFBLFNBQUE7QUFBQSxRQUdBLEdBQUcsQ0FBQyxJQUFKLENBQVUsTUFBQSxHQUFNLFlBQU4sR0FBbUIsSUFBbkIsR0FBc0IsQ0FBQyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QixDQUFELENBQXRCLEdBQXlELGlEQUFuRSxDQUhBLENBREY7T0FQQTtBQWFBLE1BQUEsSUFBRyxlQUFlLENBQUMsTUFBaEIsR0FBeUIsQ0FBNUI7QUFDRSxhQUFBLHdEQUFBO2tDQUFBO0FBQ0UsVUFBQSwwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxvQ0FBZixFQUFxRCxNQUFyRCxDQUFoQyxDQUFBLENBREY7QUFBQSxTQUFBO0FBQUEsUUFHQSxHQUFHLENBQUMsSUFBSixDQUFVLEdBQUEsR0FBRSxDQUFDLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQWhDLENBQUQsQ0FBRixHQUF3QyxHQUFsRCxDQUhBLENBREY7T0FiQTthQW1CQSxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQsRUFwQjBCO0lBQUEsQ0FiNUI7R0FSRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/regexes.coffee
