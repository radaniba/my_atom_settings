(function() {
  var ColorParser, ColorScanner, countLines, getRegistry;

  countLines = require('./utils').countLines;

  getRegistry = require('./color-expressions').getRegistry;

  ColorParser = require('./color-parser');

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxTQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0MsY0FBZSxPQUFBLENBQVEscUJBQVIsRUFBZixXQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLDBCQUFGLE9BQVcsSUFBVCxPQUNkLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFuQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFEckIsQ0FEVztJQUFBLENBQWI7O0FBQUEsMkJBSUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNMLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQVAsRUFBOEIsR0FBOUIsRUFESztJQUFBLENBSlgsQ0FBQTs7QUFBQSwyQkFPQSxpQkFBQSxHQUFtQixTQUFDLEtBQUQsR0FBQTthQUNiLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQVYsQ0FBNEIsS0FBNUIsQ0FBUCxFQUEyQyxHQUEzQyxFQURhO0lBQUEsQ0FQbkIsQ0FBQTs7QUFBQSwyQkFVQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEtBQWQsR0FBQTtBQUNOLFVBQUEsaURBQUE7O1FBRG9CLFFBQU07T0FDMUI7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsU0FBUCxHQUFtQixLQURuQixDQUFBO0FBR0EsTUFBQSxJQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBWDtBQUNFLFFBQUMsWUFBYSxRQUFkLENBQUE7QUFBQSxRQUNDLFlBQWEsT0FBYixTQURELENBQUE7QUFBQSxRQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFkLEVBQXlCLEtBQXpCLENBSFIsQ0FBQTtBQUtBLFFBQUEsSUFBRyxDQUFDLEtBQUEsR0FBUSxTQUFTLENBQUMsT0FBVixDQUFrQixLQUFLLENBQUMsZUFBeEIsQ0FBVCxDQUFBLEdBQXFELENBQXhEO0FBQ0UsVUFBQSxTQUFBLElBQWEsQ0FBQSxTQUFVLENBQUMsTUFBWCxHQUFvQixLQUFwQixHQUE0QixLQUFLLENBQUMsZUFBZSxDQUFDLE1BQS9ELENBQUE7QUFBQSxVQUNBLFNBQUEsR0FBWSxLQUFLLENBQUMsZUFEbEIsQ0FERjtTQUxBO2VBU0E7QUFBQSxVQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sU0FEUDtBQUFBLFVBRUEsU0FBQSxFQUFXLFNBRlg7QUFBQSxVQUdBLEtBQUEsRUFBTyxDQUNMLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFEakIsRUFFTCxTQUZLLENBSFA7QUFBQSxVQU9BLElBQUEsRUFBTSxVQUFBLENBQVcsSUFBSyxxREFBaEIsQ0FBQSxHQUFvRCxDQVAxRDtVQVZGO09BSk07SUFBQSxDQVZSLENBQUE7O3dCQUFBOztNQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-scanner.coffee
