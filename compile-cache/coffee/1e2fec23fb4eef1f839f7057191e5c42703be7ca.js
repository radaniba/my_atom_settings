(function() {
  var ColorScanner, countLines;

  countLines = null;

  module.exports = ColorScanner = (function() {
    function ColorScanner(_arg) {
      this.context = (_arg != null ? _arg : {}).context;
      this.parser = this.context.parser;
      this.registry = this.context.registry;
    }

    ColorScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExp(), 'g');
    };

    ColorScanner.prototype.getRegExpForScope = function(scope) {
      return new RegExp(this.registry.getRegExpForScope(scope), 'g');
    };

    ColorScanner.prototype.search = function(text, scope, start) {
      var color, index, lastIndex, match, matchText, regexp;
      if (start == null) {
        start = 0;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExpForScope(scope);
      regexp.lastIndex = start;
      if (match = regexp.exec(text)) {
        matchText = match[0];
        lastIndex = regexp.lastIndex;
        color = this.parser.parse(matchText, scope);
        if ((index = matchText.indexOf(color.colorExpression)) > 0) {
          lastIndex += -matchText.length + index + color.colorExpression.length;
          matchText = color.colorExpression;
        }
        return {
          color: color,
          match: matchText,
          lastIndex: lastIndex,
          range: [lastIndex - matchText.length, lastIndex],
          line: countLines(text.slice(0, +(lastIndex - matchText.length) + 1 || 9e9)) - 1
        };
      }
    };

    return ColorScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0JBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUMsSUFBRCxHQUFBO0FBQ1gsTUFEYSxJQUFDLENBQUEsMEJBQUYsT0FBVyxJQUFULE9BQ2QsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQW5CLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQURyQixDQURXO0lBQUEsQ0FBYjs7QUFBQSwyQkFJQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ0wsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBUCxFQUE4QixHQUE5QixFQURLO0lBQUEsQ0FKWCxDQUFBOztBQUFBLDJCQU9BLGlCQUFBLEdBQW1CLFNBQUMsS0FBRCxHQUFBO2FBQ2IsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixLQUE1QixDQUFQLEVBQTJDLEdBQTNDLEVBRGE7SUFBQSxDQVBuQixDQUFBOztBQUFBLDJCQVVBLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsS0FBZCxHQUFBO0FBQ04sVUFBQSxpREFBQTs7UUFEb0IsUUFBTTtPQUMxQjtBQUFBLE1BQUEsSUFBd0Msa0JBQXhDO0FBQUEsUUFBQyxhQUFjLE9BQUEsQ0FBUSxTQUFSLEVBQWQsVUFBRCxDQUFBO09BQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FGVCxDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsU0FBUCxHQUFtQixLQUhuQixDQUFBO0FBS0EsTUFBQSxJQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBWDtBQUNFLFFBQUMsWUFBYSxRQUFkLENBQUE7QUFBQSxRQUNDLFlBQWEsT0FBYixTQURELENBQUE7QUFBQSxRQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFkLEVBQXlCLEtBQXpCLENBSFIsQ0FBQTtBQU9BLFFBQUEsSUFBRyxDQUFDLEtBQUEsR0FBUSxTQUFTLENBQUMsT0FBVixDQUFrQixLQUFLLENBQUMsZUFBeEIsQ0FBVCxDQUFBLEdBQXFELENBQXhEO0FBQ0UsVUFBQSxTQUFBLElBQWEsQ0FBQSxTQUFVLENBQUMsTUFBWCxHQUFvQixLQUFwQixHQUE0QixLQUFLLENBQUMsZUFBZSxDQUFDLE1BQS9ELENBQUE7QUFBQSxVQUNBLFNBQUEsR0FBWSxLQUFLLENBQUMsZUFEbEIsQ0FERjtTQVBBO2VBV0E7QUFBQSxVQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sU0FEUDtBQUFBLFVBRUEsU0FBQSxFQUFXLFNBRlg7QUFBQSxVQUdBLEtBQUEsRUFBTyxDQUNMLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFEakIsRUFFTCxTQUZLLENBSFA7QUFBQSxVQU9BLElBQUEsRUFBTSxVQUFBLENBQVcsSUFBSyxxREFBaEIsQ0FBQSxHQUFvRCxDQVAxRDtVQVpGO09BTk07SUFBQSxDQVZSLENBQUE7O3dCQUFBOztNQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-scanner.coffee
