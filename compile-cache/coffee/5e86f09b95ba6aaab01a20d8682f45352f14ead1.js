(function() {
  var Entities, blocks, cleanText, decodeHtmlEntities, delimitCode, getAttribute, htmlEntities, isBlock, isVoid, nodeType, stringRepeat, voids, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Entities = require('html-entities').AllHtmlEntities;

  _ = require('lodash');

  blocks = require('./block-tags');

  voids = require('./void-tags');


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

  nodeType = function(node) {
    if (node.nodeName === '#text') {
      return 3;
    } else if (node.tagName != null) {
      return 1;
    } else {
      throw new Error('cannot detect nodeType');
    }
  };

  getAttribute = function(node, attribute) {
    var _ref;
    return ((_ref = _.find(node.attrs, {
      name: attribute
    })) != null ? _ref.value : void 0) || null;
  };

  cleanText = function(node) {
    var parent, text, _ref;
    parent = node.parentNode;
    text = decodeHtmlEntities(node.value);
    if ('pre' !== parent.nodeName && 'pre' !== parent.parentNode.nodeName) {
      text = text.replace(/\s+/g, ' ');
    }
    if ((_ref = parent.nodeName) === 'code' || _ref === 'pre') {
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
    var _ref;
    if (node.nodeName === 'code' && node.parentNode.nodeName === 'pre') {
      return true;
    } else {
      return _ref = node.nodeName, __indexOf.call(blocks, _ref) >= 0;
    }
  };

  isVoid = function(node) {
    var _ref;
    return _ref = node.nodeName, __indexOf.call(voids, _ref) >= 0;
  };

  module.exports = {
    cleanText: cleanText,
    decodeHtmlEntities: decodeHtmlEntities,
    delimitCode: delimitCode,
    getAttribute: getAttribute,
    isBlock: isBlock,
    isVoid: isVoid,
    nodeType: nodeType,
    stringRepeat: stringRepeat
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMklBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLGVBQXBDLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLEtBQUEsR0FBUSxPQUFBLENBQVEsYUFBUixDQUpSLENBQUE7O0FBTUE7QUFBQTs7OztLQU5BOztBQUFBLEVBV0EsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNiLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLEVBQUosQ0FBQTtBQUNBLFdBQUEsSUFBQSxHQUFBO0FBQ0UsTUFBQSxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsUUFBQSxDQUFBLElBQUssQ0FBTCxDQUFkO09BQUE7QUFBQSxNQUNBLENBQUEsS0FBTSxDQUROLENBQUE7QUFFQSxNQUFBLElBQUcsQ0FBSDtBQUNFLFFBQUEsQ0FBQSxJQUFLLENBQUwsQ0FERjtPQUFBLE1BQUE7QUFHRSxjQUhGO09BSEY7SUFBQSxDQURBO0FBUUEsV0FBTyxDQUFQLENBVGE7RUFBQSxDQVhmLENBQUE7O0FBc0JBO0FBQUE7Ozs7OztLQXRCQTs7QUFBQSxFQTZCQSxXQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sU0FBUCxHQUFBO0FBQ1osV0FBTSxNQUFBLENBQUcsVUFBQSxHQUFVLFNBQVYsR0FBb0IsVUFBdkIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxJQUF4QyxDQUFOLEdBQUE7QUFHRSxNQUFBLFNBQUEsSUFBYSxHQUFiLENBSEY7SUFBQSxDQUFBO0FBS0EsSUFBQSxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUwsS0FBVyxHQUFkO0FBQXVCLE1BQUEsSUFBQSxHQUFPLEdBQUEsR0FBTSxJQUFiLENBQXZCO0tBTEE7QUFNQSxJQUFBLElBQUcsSUFBSyxVQUFMLEtBQWUsR0FBbEI7QUFBMkIsTUFBQSxJQUFBLElBQVEsR0FBUixDQUEzQjtLQU5BO0FBT0EsV0FBTyxTQUFBLEdBQVksSUFBWixHQUFtQixTQUExQixDQVJZO0VBQUEsQ0E3QmQsQ0FBQTs7QUFBQSxFQXVDQSxRQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDVCxJQUFBLElBQUcsSUFBSSxDQUFDLFFBQUwsS0FBaUIsT0FBcEI7YUFDRSxFQURGO0tBQUEsTUFFSyxJQUFHLG9CQUFIO2FBQ0gsRUFERztLQUFBLE1BQUE7QUFHSCxZQUFVLElBQUEsS0FBQSxDQUFNLHdCQUFOLENBQVYsQ0FIRztLQUhJO0VBQUEsQ0F2Q1gsQ0FBQTs7QUFBQSxFQWtEQSxZQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sU0FBUCxHQUFBO0FBQ2IsUUFBQSxJQUFBOzs7c0JBQW1DLENBQUUsZUFBckMsSUFBOEMsS0FEakM7RUFBQSxDQWxEZixDQUFBOztBQUFBLEVBcURBLFNBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLFFBQUEsa0JBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsVUFBZCxDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sa0JBQUEsQ0FBbUIsSUFBSSxDQUFDLEtBQXhCLENBRFAsQ0FBQTtBQUdBLElBQUEsSUFBRyxLQUFBLEtBQWMsTUFBTSxDQUFDLFFBQXJCLElBQUEsS0FBQSxLQUErQixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQXBEO0FBQ0UsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEdBQXJCLENBQVAsQ0FERjtLQUhBO0FBTUEsSUFBQSxZQUFHLE1BQU0sQ0FBQyxTQUFQLEtBQW9CLE1BQXBCLElBQUEsSUFBQSxLQUE0QixLQUEvQjthQUdFLEtBSEY7S0FBQSxNQUFBO2FBS0UsSUFBSSxDQUFDLE9BQUwsQ0FDRSxTQURGLEVBQ2EsSUFEYixDQUVDLENBQUMsT0FGRixDQUdFLGdCQUhGLEVBR29CLElBSHBCLENBSUMsQ0FBQyxPQUpGLENBS0UsZ0JBTEYsRUFLb0IsR0FMcEIsQ0FNQyxDQUFDLE9BTkYsQ0FPRSxTQVBGLEVBT2EsS0FQYixFQUxGO0tBUFU7RUFBQSxDQXJEWixDQUFBOztBQUFBLEVBMkVBLFlBQUEsR0FBbUIsSUFBQSxRQUFBLENBQUEsQ0EzRW5CLENBQUE7O0FBQUEsRUE0RUEsa0JBQUEsR0FBcUIsU0FBQyxJQUFELEdBQUE7V0FDbkIsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsSUFBcEIsRUFEbUI7RUFBQSxDQTVFckIsQ0FBQTs7QUFBQSxFQStFQSxPQUFBLEdBQVUsU0FBQyxJQUFELEdBQUE7QUFDUixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUcsSUFBSSxDQUFDLFFBQUwsS0FBaUIsTUFBakIsSUFBNEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFoQixLQUE0QixLQUEzRDthQUNFLEtBREY7S0FBQSxNQUFBO29CQUdFLElBQUksQ0FBQyxRQUFMLEVBQUEsZUFBaUIsTUFBakIsRUFBQSxJQUFBLE9BSEY7S0FEUTtFQUFBLENBL0VWLENBQUE7O0FBQUEsRUFxRkEsTUFBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQVUsUUFBQSxJQUFBO2tCQUFBLElBQUksQ0FBQyxRQUFMLEVBQUEsZUFBaUIsS0FBakIsRUFBQSxJQUFBLE9BQVY7RUFBQSxDQXJGVCxDQUFBOztBQUFBLEVBdUZBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixXQUFBLFNBRGU7QUFBQSxJQUVmLG9CQUFBLGtCQUZlO0FBQUEsSUFHZixhQUFBLFdBSGU7QUFBQSxJQUlmLGNBQUEsWUFKZTtBQUFBLElBS2YsU0FBQSxPQUxlO0FBQUEsSUFNZixRQUFBLE1BTmU7QUFBQSxJQU9mLFVBQUEsUUFQZTtBQUFBLElBUWYsY0FBQSxZQVJlO0dBdkZqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/utils.coffee
