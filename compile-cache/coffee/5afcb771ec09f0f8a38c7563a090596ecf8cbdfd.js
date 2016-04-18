(function() {
  var nestContainingTokens, nestingEndTokens, nestingStartTokens, preprocessAST,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  nestingStartTokens = ['list_item_start', 'blockquote_start', 'loose_item_start'];

  nestingEndTokens = ['list_item_end', 'blockquote_end', 'loose_item_end'];

  nestContainingTokens = ['list_item', 'blockquote', 'loose_item'];

  preprocessAST = function(ast) {
    var currentToken, e, i, nestingLevel, orderedList, orderedListItemNumber, out, subAST, token, tokenIndex, _i, _len, _ref, _ref1, _ref2, _ref3;
    i = 0;
    out = [];
    orderedList = false;
    while (i < ast.length) {
      currentToken = ast[i];
      if (currentToken.type === 'list_start') {
        orderedListItemNumber = 0;
        orderedList = currentToken.ordered;
      } else if (_ref = currentToken.type, __indexOf.call(nestingStartTokens, _ref) >= 0) {
        tokenIndex = nestingStartTokens.indexOf(currentToken.type);
        currentToken.type = nestContainingTokens[tokenIndex];
        i++;
        nestingLevel = 1;
        subAST = [];
        while (true) {
          if (_ref1 = ast[i].type, __indexOf.call(nestingEndTokens, _ref1) >= 0) {
            nestingLevel--;
          } else if (_ref2 = ast[i].type, __indexOf.call(nestingStartTokens, _ref2) >= 0) {
            nestingLevel++;
          }
          if (nestingLevel === 0) {
            break;
          }
          subAST.push(ast[i]);
          i++;
        }
        e = 0;
        _ref3 = preprocessAST(subAST);
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          token = _ref3[_i];
          if (token.nesting == null) {
            token.nesting = [];
          }
          if (token.indent == null) {
            token.indent = '';
          }
          token.nesting.push(currentToken.type);
          if (token.nesting !== [] && token.nesting.length > 1) {
            token.indent = '  ' + token.indent;
          } else if (currentToken.type === 'blockquote') {
            token.indent += '> ';
          } else if (currentToken.type === 'list_item') {
            token.type = 'list_item';
            if (orderedList) {
              orderedListItemNumber++;
              token.indent += "" + orderedListItemNumber + ". ";
            } else {
              token.indent += '- ';
            }
          } else if (e === 0 && token.type === 'text' && currentToken.type === 'loose_item') {
            token.type = 'list_item';
            token.indent += '- ';
          } else {
            token.indent = '  ' + token.indent;
          }
          if (token.type === 'text' && currentToken.type === 'loose_item') {
            token.type = 'paragraph';
          }
          e++;
          out.push(token);
        }
      } else {
        out.push(currentToken);
      }
      i++;
    }
    return out;
  };

  module.exports = preprocessAST;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9wcmVwcm9jZXNzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsa0JBQUEsR0FBcUIsQ0FBQyxpQkFBRCxFQUFvQixrQkFBcEIsRUFBd0Msa0JBQXhDLENBQXJCLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixDQUFDLGVBQUQsRUFBa0IsZ0JBQWxCLEVBQW9DLGdCQUFwQyxDQURuQixDQUFBOztBQUFBLEVBRUEsb0JBQUEsR0FBdUIsQ0FBQyxXQUFELEVBQWMsWUFBZCxFQUE0QixZQUE1QixDQUZ2QixDQUFBOztBQUFBLEVBR0EsYUFBQSxHQUFnQixTQUFDLEdBQUQsR0FBQTtBQUNkLFFBQUEseUlBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxDQUFKLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxFQUROLENBQUE7QUFBQSxJQUVBLFdBQUEsR0FBYyxLQUZkLENBQUE7QUFHQSxXQUFNLENBQUEsR0FBSSxHQUFHLENBQUMsTUFBZCxHQUFBO0FBQ0UsTUFBQSxZQUFBLEdBQWUsR0FBSSxDQUFBLENBQUEsQ0FBbkIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxZQUFZLENBQUMsSUFBYixLQUFxQixZQUF4QjtBQUNFLFFBQUEscUJBQUEsR0FBd0IsQ0FBeEIsQ0FBQTtBQUFBLFFBRUEsV0FBQSxHQUFjLFlBQVksQ0FBQyxPQUYzQixDQURGO09BQUEsTUFJSyxXQUFHLFlBQVksQ0FBQyxJQUFiLEVBQUEsZUFBcUIsa0JBQXJCLEVBQUEsSUFBQSxNQUFIO0FBQ0gsUUFBQSxVQUFBLEdBQWEsa0JBQWtCLENBQUMsT0FBbkIsQ0FBMkIsWUFBWSxDQUFDLElB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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/preprocess.coffee
