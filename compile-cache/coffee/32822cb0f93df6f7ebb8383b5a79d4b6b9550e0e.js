(function() {
  var CODE_HIGHLIGHT_REGEX, delimitCode, extractRows, fallback, formatHeaderSeparator, formatRow, getAttribute, getColumnWidths, indent, indentChildren, insertText, insertTextBefore, isBlock, isTextNode, languageCodeRewrite, serialize, stringRepeat, treeAdapter, _, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  indent = require('indent');

  serialize = require('parse5').serialize;

  languageCodeRewrite = require('../lib/language-code-rewrites');

  treeAdapter = require('./tree-adapter');

  _ref = require('./utils'), delimitCode = _ref.delimitCode, getAttribute = _ref.getAttribute, stringRepeat = _ref.stringRepeat, isBlock = _ref.isBlock;

  _ref1 = require('./tables'), extractRows = _ref1.extractRows, formatHeaderSeparator = _ref1.formatHeaderSeparator, formatRow = _ref1.formatRow, getColumnWidths = _ref1.getColumnWidths;

  CODE_HIGHLIGHT_REGEX = /(?:highlight highlight|lang(?:uage)?)-(\S+)/;

  insertTextBefore = treeAdapter.insertTextBefore, insertText = treeAdapter.insertText, isTextNode = treeAdapter.isTextNode;

  indentChildren = function(node) {
    var allChildrenAreElements, child, children, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3;
    allChildrenAreElements = true;
    _ref2 = node.childNodes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      child = _ref2[_i];
      if (isTextNode(child)) {
        allChildrenAreElements = false;
      }
    }
    if (allChildrenAreElements) {
      children = [];
      _ref3 = node.childNodes;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        child = _ref3[_j];
        children.push(child);
      }
      for (_k = 0, _len2 = children.length; _k < _len2; _k++) {
        child = children[_k];
        insertTextBefore(node, '\n  ', child);
      }
      return insertText(node, '\n');
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
        var _ref2, _ref3;
        return ((_ref2 = node.parentNode) != null ? (_ref3 = _ref2._converter) != null ? _ref3.filter : void 0 : void 0) === fallback;
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
      replacement: function(content, node, links) {
        var alt, referenceLink, title, url;
        alt = getAttribute(node, 'alt') || '';
        url = getAttribute(node, 'src') || '';
        title = getAttribute(node, 'title');
        referenceLink = _.find(links, {
          url: url,
          title: title
        });
        if (referenceLink) {
          if (alt.toLowerCase() === referenceLink.name) {
            return "![" + alt + "]";
          } else {
            return "![" + alt + "][" + referenceLink.name + "]";
          }
        } else if (title) {
          return "![" + alt + "](" + url + " \"" + title + "\")";
        } else {
          return "![" + alt + "](" + url + ")";
        }
      }
    }, {
      filter: function(node) {
        return node.type === 'checkbox' && node.parentNode.tagName === 'li';
      },
      surroundingBlankLines: false,
      replacement: function(content, node) {
        return (node.checked ? '[x]' : '[ ]') + ' ';
      }
    }, {
      filter: 'table',
      surroundingBlankLines: true,
      replacement: function(content, node) {
        var alignments, columnWidths, i, out, rows, totalCols, _i, _ref2, _ref3;
        _ref2 = extractRows(node), alignments = _ref2.alignments, rows = _ref2.rows;
        columnWidths = getColumnWidths(rows);
        totalCols = rows[0].length;
        out = [formatRow(rows[0], alignments, columnWidths), formatHeaderSeparator(alignments, columnWidths)];
        for (i = _i = 1, _ref3 = rows.length; 1 <= _ref3 ? _i < _ref3 : _i > _ref3; i = 1 <= _ref3 ? ++_i : --_i) {
          out.push(formatRow(rows[i], alignments, columnWidths));
        }
        return out.join('\n');
      }
    }, {
      filter: 'pre',
      surroundingBlankLines: true,
      replacement: function(content, node) {
        var language, _ref2, _ref3, _ref4, _ref5, _ref6;
        if (((_ref2 = node.childNodes[0]) != null ? _ref2.tagName : void 0) === 'code') {
          language = (_ref3 = getAttribute(node.childNodes[0], 'class')) != null ? (_ref4 = _ref3.match(CODE_HIGHLIGHT_REGEX)) != null ? _ref4[1] : void 0 : void 0;
        }
        if ((language == null) && node.parentNode.tagName === 'div') {
          language = (_ref5 = getAttribute(node.parentNode, 'class')) != null ? (_ref6 = _ref5.match(CODE_HIGHLIGHT_REGEX)) != null ? _ref6[1] : void 0 : void 0;
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
        if (node.parentNode.tagName !== 'pre') {
          return delimitCode(content, '`');
        } else {
          return content;
        }
      }
    }, {
      filter: function(node) {
        return node.tagName === 'div' && CODE_HIGHLIGHT_REGEX.test(node.className);
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
        hLevel = node.tagName[1];
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
        prefix = (parent.tagName === 'ol' ? parent.childNodes.indexOf(node) + 1 + '. ' : '- ');
        return prefix + content;
      }
    }, {
      filter: ['ul', 'ol'],
      surroundingBlankLines: true,
      replacement: function(content) {
        return content;
      }
    }, {
      filter: '_comment',
      replacement: function(content) {
        return "<!-- " + content + " -->";
      }
    }, {
      filter: fallback,
      surroundingBlankLines: true,
      replacement: function(content, node) {
        indentChildren(node);
        return serialize({
          children: [node],
          nodeName: '#document-fragment',
          quirksMode: false
        }, {
          treeAdapter: treeAdapter
        });
      }
    }
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9jb252ZXJ0ZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrUUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQURULENBQUE7O0FBQUEsRUFFQyxZQUFhLE9BQUEsQ0FBUSxRQUFSLEVBQWIsU0FGRCxDQUFBOztBQUFBLEVBSUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLCtCQUFSLENBSnRCLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTGQsQ0FBQTs7QUFBQSxFQU1BLE9BQXFELE9BQUEsQ0FBUSxTQUFSLENBQXJELEVBQUMsbUJBQUEsV0FBRCxFQUFjLG9CQUFBLFlBQWQsRUFBNEIsb0JBQUEsWUFBNUIsRUFBMEMsZUFBQSxPQU4xQyxDQUFBOztBQUFBLEVBT0EsUUFLSSxPQUFBLENBQVEsVUFBUixDQUxKLEVBQ0Usb0JBQUEsV0FERixFQUVFLDhCQUFBLHFCQUZGLEVBR0Usa0JBQUEsU0FIRixFQUlFLHdCQUFBLGVBWEYsQ0FBQTs7QUFBQSxFQWNBLG9CQUFBLEdBQXVCLDZDQWR2QixDQUFBOztBQUFBLEVBZUMsK0JBQUEsZ0JBQUQsRUFBbUIseUJBQUEsVUFBbkIsRUFBK0IseUJBQUEsVUFmL0IsQ0FBQTs7QUFBQSxFQWlCQSxjQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsUUFBQSxxRkFBQTtBQUFBLElBQUEsc0JBQUEsR0FBeUIsSUFBekIsQ0FBQTtBQUNBO0FBQUEsU0FBQSw0Q0FBQTt3QkFBQTtBQUNFLE1B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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/converters.coffee
