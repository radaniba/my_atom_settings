(function() {
  var Entities, blocks, cleanText, decodeHtmlEntities, delimitCode, getAttrList, getAttribute, getTextNodeContent, htmlEntities, isBlock, isVoid, stringRepeat, voids, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Entities = require('html-entities').AllHtmlEntities;

  _ = require('lodash');

  blocks = require('./block-tags');

  voids = require('./void-tags');

  _ref = require('./tree-adapter'), getAttrList = _ref.getAttrList, getTextNodeContent = _ref.getTextNodeContent;


  /**
   * @param {String} x The string to be repeated
   * @param {String} n Number of times to repeat the string
   * @return {String} The result of repeating the string
   */

  stringRepeat = function(x, n) {
    var s;
    s = '';
    while (true) {
      if (n & 1) {
        s += x;
      }
      n >>= 1;
      if (n) {
        x += x;
      } else {
        break;
      }
    }
    return s;
  };


  /**
   * Wrap code with delimiters
   * @param {String} code
   * @param {String} delimiter The delimiter to start with, additional backticks
     will be added if needed; like if the code contains a sequence of backticks
     that would end the code block prematurely.
   */

  delimitCode = function(code, delimiter) {
    while (RegExp("([^`]|^)" + delimiter + "([^`]|$)").test(code)) {
      delimiter += '`';
    }
    if (code[0] === '`') {
      code = ' ' + code;
    }
    if (code.slice(-1) === '`') {
      code += ' ';
    }
    return delimiter + code + delimiter;
  };

  getAttribute = function(node, attribute) {
    var _ref1;
    return ((_ref1 = _.find(getAttrList(node), {
      name: attribute
    })) != null ? _ref1.value : void 0) || null;
  };

  cleanText = function(node) {
    var parent, text, _ref1, _ref2;
    parent = node.parentNode;
    text = decodeHtmlEntities(getTextNodeContent(node));
    if ('pre' !== parent.tagName && 'pre' !== ((_ref1 = parent.parentNode) != null ? _ref1.tagName : void 0)) {
      text = text.replace(/\s+/g, ' ');
    }
    if ((_ref2 = parent.tagName) === 'code' || _ref2 === 'pre') {
      return text;
    } else {
      return text.replace(/\u2014/g, '--').replace(/\u2018|\u2019/g, '\'').replace(/\u201c|\u201d/g, '"').replace(/\u2026/g, '...');
    }
  };

  htmlEntities = new Entities();

  decodeHtmlEntities = function(text) {
    return htmlEntities.decode(text);
  };

  isBlock = function(node) {
    var _ref1, _ref2;
    if (node.tagName === 'code' && ((_ref1 = node.parentNode) != null ? _ref1.tagName : void 0) === 'pre') {
      return true;
    } else {
      return _ref2 = node.tagName, __indexOf.call(blocks, _ref2) >= 0;
    }
  };

  isVoid = function(node) {
    var _ref1;
    return _ref1 = node.tagName, __indexOf.call(voids, _ref1) >= 0;
  };

  module.exports = {
    cleanText: cleanText,
    decodeHtmlEntities: decodeHtmlEntities,
    delimitCode: delimitCode,
    getAttribute: getAttribute,
    isBlock: isBlock,
    isVoid: isVoid,
    stringRepeat: stringRepeat
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0tBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLGVBQXBDLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLEtBQUEsR0FBUSxPQUFBLENBQVEsYUFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxPQUFvQyxPQUFBLENBQVEsZ0JBQVIsQ0FBcEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsMEJBQUEsa0JBTGQsQ0FBQTs7QUFPQTtBQUFBOzs7O0tBUEE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO0FBQ2IsUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksRUFBSixDQUFBO0FBQ0EsV0FBQSxJQUFBLEdBQUE7QUFDRSxNQUFBLElBQUcsQ0FBQSxHQUFJLENBQVA7QUFBYyxRQUFBLENBQUEsSUFBSyxDQUFMLENBQWQ7T0FBQTtBQUFBLE1BQ0EsQ0FBQSxLQUFNLENBRE4sQ0FBQTtBQUVBLE1BQUEsSUFBRyxDQUFIO0FBQ0UsUUFBQSxDQUFBLElBQUssQ0FBTCxDQURGO09BQUEsTUFBQTtBQUdFLGNBSEY7T0FIRjtJQUFBLENBREE7QUFRQSxXQUFPLENBQVAsQ0FUYTtFQUFBLENBWmYsQ0FBQTs7QUF1QkE7QUFBQTs7Ozs7O0tBdkJBOztBQUFBLEVBOEJBLFdBQUEsR0FBYyxTQUFDLElBQUQsRUFB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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/utils.coffee
