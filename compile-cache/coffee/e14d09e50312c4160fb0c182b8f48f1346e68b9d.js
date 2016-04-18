(function() {
  var CODE_HIGHLIGHT_REGEX, delimitCode, extractRows, fallback, formatHeaderSeparator, formatRow, getAttribute, getColumnWidths, indent, indentChildren, isBlock, languageCodeRewrite, serialize, stringRepeat, treeAdapter, treeAdapters, _, _ref, _ref1, _ref2,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  indent = require('indent');

  _ref = require('parse5'), serialize = _ref.serialize, treeAdapters = _ref.treeAdapters;

  languageCodeRewrite = require('../lib/language-code-rewrites');

  _ref1 = require('./utils'), delimitCode = _ref1.delimitCode, getAttribute = _ref1.getAttribute, stringRepeat = _ref1.stringRepeat, isBlock = _ref1.isBlock;

  _ref2 = require('./tables'), extractRows = _ref2.extractRows, formatHeaderSeparator = _ref2.formatHeaderSeparator, formatRow = _ref2.formatRow, getColumnWidths = _ref2.getColumnWidths;

  treeAdapter = treeAdapters["default"];

  CODE_HIGHLIGHT_REGEX = /highlight highlight-(\S+)/;

  indentChildren = function(node) {
    var allChildrenAreElements, child, children, _i, _j, _k, _len, _len1, _len2, _ref3, _ref4;
    allChildrenAreElements = true;
    _ref3 = node.childNodes;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      child = _ref3[_i];
      if (child.nodeName === '#text') {
        allChildrenAreElements = false;
      }
    }
    if (allChildrenAreElements) {
      children = [];
      _ref4 = node.childNodes;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        child = _ref4[_j];
        children.push(child);
      }
      for (_k = 0, _len2 = children.length; _k < _len2; _k++) {
        child = children[_k];
        treeAdapter.insertTextBefore(node, '\n  ', child);
      }
      return treeAdapter.insertText(node, '\n');
    }
  };

  fallback = function() {
    return true;
  };


  /**
   * This array holds a set of "converters" that process DOM nodes and output
     Markdown. The `filter` property determines what nodes the converter is run
     on. The `replacement` function takes the content of the node and the node
     itself and returns a string of Markdown. The `surroundingBlankLines` option
     determines whether or not the block should have a blank line before and after
     it. Converters are matched to nodes starting from the top of the converters
     list and testing each one downwards.
   * @type {Array}
   */

  module.exports = [
    {
      filter: function(node) {
        var _ref3, _ref4;
        return ((_ref3 = node.parentNode) != null ? (_ref4 = _ref3._converter) != null ? _ref4.filter : void 0 : void 0) === fallback;
      },
      surroundingBlankLines: false,
      replacement: function(content, node) {
        indentChildren(node);
        return '';
      }
    }, {
      filter: 'p',
      surroundingBlankLines: true,
      replacement: function(content) {
        return content;
      }
    }, {
      filter: ['td', 'th'],
      surroundingBlankLines: false,
      replacement: function(content) {
        return content;
      }
    }, {
      filter: ['tbody', 'thead', 'tr'],
      surroundingBlankLines: false,
      replacement: function() {
        return '';
      }
    }, {
      filter: ['del', 's', 'strike'],
      surroundingBlankLines: false,
      replacement: function(content) {
        return "~~" + content + "~~";
      }
    }, {
      filter: ['em', 'i'],
      surroundingBlankLines: false,
      replacement: function(content) {
        return "_" + content + "_";
      }
    }, {
      filter: ['strong', 'b'],
      surroundingBlankLines: false,
      replacement: function(content) {
        return "**" + content + "**";
      }
    }, {
      filter: 'br',
      surroundingBlankLines: false,
      trailingWhitespace: '\n',
      replacement: function() {
        return '<br>';
      }
    }, {
      filter: 'a',
      surroundingBlankLines: false,
      replacement: function(content, node, links) {
        var referenceLink, title, url;
        url = getAttribute(node, 'href') || '';
        title = getAttribute(node, 'title');
        referenceLink = _.find(links, {
          url: url,
          title: title
        });
        if (referenceLink) {
          if (content.toLowerCase() === referenceLink.name) {
            return "[" + content + "]";
          } else {
            return "[" + content + "][" + referenceLink.name + "]";
          }
        } else if (!title && url !== '' && content === url) {
          return "<" + url + ">";
        } else if (title) {
          return "[" + content + "](" + url + " \"" + title + "\")";
        } else {
          return "[" + content + "](" + url + ")";
        }
      }
    }, {
      filter: 'img',
      surroundingBlankLines: false,
      replacement: function(content, node) {
        var alt, title, url;
        alt = getAttribute(node, 'alt') || '';
        url = getAttribute(node, 'src') || '';
        title = getAttribute(node, 'title');
        if (title) {
          return "![" + alt + "](" + url + " \"" + title + "\")";
        } else {
          return "![" + alt + "](" + url + ")";
        }
      }
    }, {
      filter: function(node) {
        return node.type === 'checkbox' && node.parentNode.nodeName === 'li';
      },
      surroundingBlankLines: false,
      replacement: function(content, node) {
        return (node.checked ? '[x]' : '[ ]') + ' ';
      }
    }, {
      filter: 'table',
      surroundingBlankLines: true,
      replacement: function(content, node) {
        var alignments, columnWidths, i, out, rows, totalCols, _i, _ref3, _ref4;
        _ref3 = extractRows(node), alignments = _ref3.alignments, rows = _ref3.rows;
        columnWidths = getColumnWidths(rows);
        totalCols = rows[0].length;
        out = [formatRow(rows[0], alignments, columnWidths), formatHeaderSeparator(alignments, columnWidths)];
        for (i = _i = 1, _ref4 = rows.length; 1 <= _ref4 ? _i < _ref4 : _i > _ref4; i = 1 <= _ref4 ? ++_i : --_i) {
          out.push(formatRow(rows[i], alignments, columnWidths));
        }
        return out.join('\n');
      }
    }, {
      filter: 'pre',
      surroundingBlankLines: true,
      replacement: function(content, node) {
        var language, _ref3, _ref4, _ref5, _ref6, _ref7;
        if (((_ref3 = node.childNodes[0]) != null ? _ref3.nodeName : void 0) === 'code') {
          language = (_ref4 = getAttribute(node.childNodes[0], 'class')) != null ? (_ref5 = _ref4.match(/lang-([^\s]+)/)) != null ? _ref5[1] : void 0 : void 0;
        }
        if ((language == null) && node.parentNode.nodeName === 'div') {
          language = (_ref6 = getAttribute(node.parentNode, 'class')) != null ? (_ref7 = _ref6.match(CODE_HIGHLIGHT_REGEX)) != null ? _ref7[1] : void 0 : void 0;
        }
        if (language != null) {
          language = language.toLowerCase();
          if (languageCodeRewrite[language] != null) {
            language = languageCodeRewrite[language];
          }
        }
        return delimitCode("" + (language || '') + "\n" + content, '```');
      }
    }, {
      filter: 'code',
      surroundingBlankLines: false,
      replacement: function(content, node) {
        if (node.parentNode.nodeName !== 'pre') {
          return delimitCode(content, '`');
        } else {
          return content;
        }
      }
    }, {
      filter: function(node) {
        return node.nodeName === 'div' && CODE_HIGHLIGHT_REGEX.test(node.className);
      },
      surroundingBlankLines: true,
      replacement: function(content) {
        return content;
      }
    }, {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      surroundingBlankLines: true,
      replacement: function(content, node) {
        var hLevel;
        hLevel = node.nodeName[1];
        return "" + (stringRepeat('#', hLevel)) + " " + content;
      }
    }, {
      filter: 'hr',
      surroundingBlankLines: true,
      replacement: function() {
        return stringRepeat('-', 80);
      }
    }, {
      filter: 'blockquote',
      surroundingBlankLines: true,
      replacement: function(content) {
        return indent(content, '> ');
      }
    }, {
      filter: 'li',
      surroundingBlankLines: false,
      trailingWhitespace: '\n',
      replacement: function(content, node) {
        var parent, prefix;
        if (__indexOf.call(content, '\n') >= 0) {
          content = indent(content, '  ').trimLeft();
        }
        parent = node.parentNode;
        prefix = (parent.nodeName === 'ol' ? parent.childNodes.indexOf(node) + 1 + '. ' : '- ');
        return prefix + content;
      }
    }, {
      filter: ['ul', 'ol'],
      surroundingBlankLines: true,
      replacement: function(content) {
        return content;
      }
    }, {
      filter: fallback,
      surroundingBlankLines: true,
      replacement: function(content, node) {
        indentChildren(node);
        return serialize({
          nodeName: '#document-fragment',
          quirksMode: false,
          childNodes: [node]
        });
      }
    }
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9jb252ZXJ0ZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwUEFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxPQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QixFQUFDLGlCQUFBLFNBQUQsRUFBWSxvQkFBQSxZQUZaLENBQUE7O0FBQUEsRUFJQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsK0JBQVIsQ0FKdEIsQ0FBQTs7QUFBQSxFQUtBLFFBQXFELE9BQUEsQ0FBUSxTQUFSLENBQXJELEVBQUMsb0JBQUEsV0FBRCxFQUFjLHFCQUFBLFlBQWQsRUFBNEIscUJBQUEsWUFBNUIsRUFBMEMsZ0JBQUEsT0FMMUMsQ0FBQTs7QUFBQSxFQU1BLFFBS0ksT0FBQSxDQUFRLFVBQVIsQ0FMSixFQUNFLG9CQUFBLFdBREYsRUFFRSw4QkFBQSxxQkFGRixFQUdFLGtCQUFBLFNBSEYsRUFJRSx3QkFBQSxlQVZGLENBQUE7O0FBQUEsRUFhQSxXQUFBLEdBQWMsWUFBWSxDQUFDLFNBQUQsQ0FiMUIsQ0FBQTs7QUFBQSxFQWVBLG9CQUFBLEdBQXVCLDJCQWZ2QixDQUFBOztBQUFBLEVBaUJBLGNBQUEsR0FBaUIsU0FBQyxJQUFELEdBQUE7QUFDZixRQUFBLHFGQUFBO0FBQUEsSUFBQSxzQkFBQSxHQUF5QixJQUF6QixDQUFBO0FBQ0E7QUFBQSxTQUFBLDRDQUFBO3dCQUFBO0FBQ0UsTUFBQSxJQUFHLEtBQUssQ0FBQyxRQUFOLEtBQWtCLE9BQXJC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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/converters.coffee
