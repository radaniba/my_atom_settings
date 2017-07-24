(function() {
  var bfsOrder, canConvert, cleanText, convertCommentNode, converters, createElement, decodeHtmlEntities, detachNode, findConverter, fixHeaders, flankingWhitespace, fm, getCommentNodeContent, getContent, getTextNodeContent, insertBefore, insertText, isBlock, isCommentNode, isElementNode, isFlankedByWhitespace, isTextNode, isVoid, marked, parseFragment, process, removeEmptyNodes, treeAdapter, yaml, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  fm = require('front-matter');

  marked = require('marked');

  yaml = require('js-yaml');

  parseFragment = require('parse5').parseFragment;

  converters = require('./converters');

  treeAdapter = require('./tree-adapter');

  _ref = require('./utils'), cleanText = _ref.cleanText, decodeHtmlEntities = _ref.decodeHtmlEntities, isBlock = _ref.isBlock, isVoid = _ref.isVoid;

  createElement = treeAdapter.createElement, detachNode = treeAdapter.detachNode, getCommentNodeContent = treeAdapter.getCommentNodeContent, getTextNodeContent = treeAdapter.getTextNodeContent, insertBefore = treeAdapter.insertBefore, insertText = treeAdapter.insertText, isCommentNode = treeAdapter.isCommentNode, isElementNode = treeAdapter.isElementNode, isTextNode = treeAdapter.isTextNode;


  /**
   * Some people accidently skip levels in their headers (like jumping from h1 to
     h3), which screws up things like tables of contents. This function fixes
     that.
   * The algorithm assumes that relations between nearby headers are correct and
     will try to preserve them. For example, "h1, h3, h3" becomes "h1, h2, h2"
     rather than "h1, h2, h3".
   */

  fixHeaders = function(dom, ensureFirstHeaderIsH1) {
    var child, childHeaderDepth, e, gap, headerDepth, i, lastHeaderDepth, rootDepth, topLevelHeaders, _i, _j, _len, _ref1, _ref2;
    topLevelHeaders = [];
    _ref1 = dom.childNodes;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      if (/h[0-6]/.test(child.tagName)) {
        topLevelHeaders.push(child);
      }
    }
    if (topLevelHeaders.length === 0) {
      return;
    }
    lastHeaderDepth = 0;
    if (!ensureFirstHeaderIsH1) {
      lastHeaderDepth = topLevelHeaders[0].tagName[1] - 1;
    }
    rootDepth = lastHeaderDepth + 1;
    i = 0;
    while (i < topLevelHeaders.length) {
      headerDepth = parseInt(topLevelHeaders[i].tagName[1]);
      if ((rootDepth <= headerDepth && headerDepth <= lastHeaderDepth + 1)) {
        lastHeaderDepth = headerDepth;
      } else {
        if (headerDepth <= rootDepth) {
          gap = headerDepth - rootDepth;
        } else {
          gap = headerDepth - (lastHeaderDepth + 1);
        }
        for (e = _j = i, _ref2 = topLevelHeaders.length; i <= _ref2 ? _j < _ref2 : _j > _ref2; e = i <= _ref2 ? ++_j : --_j) {
          childHeaderDepth = parseInt(topLevelHeaders[e].tagName[1]);
          if (childHeaderDepth >= headerDepth) {
            topLevelHeaders[e].tagName = 'h' + (childHeaderDepth - gap);
          } else {
            break;
          }
        }
        continue;
      }
      i++;
    }
  };

  convertCommentNode = function(node) {
    var commentElement;
    commentElement = createElement('_comment', null, []);
    insertText(commentElement, getCommentNodeContent(node));
    insertBefore(node.parent, commentElement, node);
    detachNode(node);
    return commentElement;
  };


  /**
   * Flattens DOM tree into single array
   */

  bfsOrder = function(node) {
    var child, elem, inqueue, outqueue, _i, _len, _ref1;
    inqueue = [node];
    outqueue = [];
    while (inqueue.length > 0) {
      elem = inqueue.shift();
      outqueue.push(elem);
      _ref1 = elem.childNodes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        child = _ref1[_i];
        if (isCommentNode(child)) {
          child = convertCommentNode(child);
        }
        if (isElementNode(child)) {
          inqueue.push(child);
        }
      }
    }
    outqueue.shift();
    return outqueue;
  };


  /**
   * Contructs a Markdown string of replacement text for a given node
   */

  getContent = function(node) {
    var child, childText, content, previousSibling, whitespaceSeparator, _i, _len, _ref1, _ref2, _ref3;
    if (isTextNode(node)) {
      return getTextNodeContent(node);
    }
    content = '';
    previousSibling = null;
    _ref1 = node.childNodes;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      childText = ((function() {
        if (isElementNode(child)) {
          return child._replacement;
        } else if (isTextNode(child)) {
          return cleanText(child);
        } else {
          throw new Error("Unsupported node type: " + child.type);
        }
      })());
      if (child.tagName === 'br') {
        content = content.trimRight();
      }
      if ((previousSibling != null ? previousSibling.tagName : void 0) === 'br') {
        childText = childText.trimLeft();
      }
      if (previousSibling != null) {
        whitespaceSeparator = ((((_ref2 = child._whitespace) != null ? _ref2.leading : void 0) || '') + ((previousSibling != null ? (_ref3 = previousSibling._whitespace) != null ? _ref3.trailing : void 0 : void 0) || '')).replace(/\n{3,}/, '\n\n');
        content += whitespaceSeparator;
      }
      content += childText;
      previousSibling = child;
    }
    return content;
  };

  canConvert = function(node, filter) {
    var _ref1;
    if (typeof filter === 'string') {
      return filter === node.tagName;
    } else if (Array.isArray(filter)) {
      return _ref1 = node.tagName, __indexOf.call(filter, _ref1) >= 0;
    } else if (typeof filter === 'function') {
      return filter(node);
    } else {
      throw new TypeError('`filter` needs to be a string, array, or function');
    }
  };

  findConverter = function(node) {
    var converter, _i, _len;
    for (_i = 0, _len = converters.length; _i < _len; _i++) {
      converter = converters[_i];
      if (canConvert(node, converter.filter)) {
        return converter;
      }
    }
  };

  isFlankedByWhitespace = function(side, node) {
    var regExp, sibling;
    if (side === 'left') {
      sibling = node.previousSibling;
      regExp = /\s$/;
    } else {
      sibling = node.nextSibling;
      regExp = /^\s/;
    }
    if (sibling && !isBlock(sibling)) {
      return regExp.test(getContent(sibling));
    } else {
      return false;
    }
  };

  flankingWhitespace = function(node) {
    var content, hasLeading, hasTrailing, leading, trailing, _ref1, _ref2, _ref3, _ref4;
    leading = '';
    trailing = '';
    if (!isBlock(node)) {
      content = getContent(node);
      hasLeading = /^\s/.test(content);
      hasTrailing = /\s$/.test(content);
      if (hasLeading && !isFlankedByWhitespace('left', node)) {
        leading = ' ';
      }
      if (hasTrailing && !isFlankedByWhitespace('right', node)) {
        trailing = ' ';
      }
    }
    if ((_ref1 = node.childNodes[0]) != null ? (_ref2 = _ref1._whitespace) != null ? _ref2.leading : void 0 : void 0) {
      leading += node.childNodes[0]._whitespace.leading;
    }
    if ((_ref3 = node.childNodes.slice(-1)[0]) != null ? (_ref4 = _ref3._whitespace) != null ? _ref4.trailing : void 0 : void 0) {
      trailing += node.childNodes.slice(-1)[0]._whitespace.trailing;
    }
    return {
      leading: leading,
      trailing: trailing
    };
  };


  /*
   * Finds a Markdown converter, gets the replacement, and sets it on
   * `_replacement`
   */

  process = function(node, links) {
    var content, converter, whitespace;
    content = getContent(node);
    converter = node._converter;
    if ('pre' !== node.tagName && 'pre' !== node.parentNode.tagName) {
      content = content.trim();
    }
    if (converter.surroundingBlankLines) {
      whitespace = {
        leading: '\n\n',
        trailing: '\n\n'
      };
    } else {
      whitespace = flankingWhitespace(node);
      if (converter.trailingWhitespace != null) {
        whitespace.trailing += converter.trailingWhitespace;
      }
    }
    if (node.tagName === 'li') {
      whitespace.leading = '';
    }
    node._replacement = converter.replacement(content, node, links);
    node._whitespace = whitespace;
  };


  /**
   * Remove whitespace text nodes from children
   */

  removeEmptyNodes = function(node) {
    var child, emptyChildren, nextSibling, previousSibling, _i, _j, _len, _len1, _ref1;
    emptyChildren = [];
    _ref1 = node.childNodes;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      if (isTextNode(child) && getTextNodeContent(child).trim() === '') {
        previousSibling = child.previousSibling;
        nextSibling = child.nextSibling;
        if (!previousSibling || !nextSibling || isBlock(previousSibling) || isBlock(nextSibling)) {
          emptyChildren.push(child);
        }
      }
    }
    for (_j = 0, _len1 = emptyChildren.length; _j < _len1; _j++) {
      child = emptyChildren[_j];
      detachNode(child);
    }
  };

  module.exports = function(dirtyMarkdown, options) {
    var ast, content, html, link, links, name, node, nodes, optionalTitle, out, rawLinks, root, title, url, value, _i, _j, _k, _l, _len, _len1, _len2, _ref1;
    if (options == null) {
      options = {};
    }
    if (typeof dirtyMarkdown !== 'string') {
      throw new TypeError('Markdown input is not a string');
    }
    if (options.ensureFirstHeaderIsH1 == null) {
      options.ensureFirstHeaderIsH1 = true;
    }
    out = '';
    try {
      content = fm(dirtyMarkdown);
      if (Object.keys(content.attributes).length !== 0) {
        out += '---\n' + yaml.safeDump(content.attributes).trim() + '\n---\n\n';
      }
      content = content.body;
    } catch (_error) {
      content = dirtyMarkdown;
    }
    ast = marked.lexer(content);
    rawLinks = ast.links;
    links = [];
    for (link in rawLinks) {
      value = rawLinks[link];
      links.push({
        name: link.toLowerCase(),
        url: value.href,
        title: value.title || null
      });
    }
    links = _.sortBy(links, ['name', 'url']);
    html = marked.parser(ast);
    html = html.replace(/(\d+)\. /g, '$1\\. ');
    root = parseFragment(html, {
      treeAdapter: treeAdapter
    });
    removeEmptyNodes(root);
    fixHeaders(root, options.ensureFirstHeaderIsH1);
    nodes = bfsOrder(root);
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      removeEmptyNodes(node);
    }
    for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
      node = nodes[_j];
      node._converter = findConverter(node);
    }
    for (_k = nodes.length - 1; _k >= 0; _k += -1) {
      node = nodes[_k];
      process(node, links);
    }
    out += getContent(root).trimRight() + '\n';
    if (links.length > 0) {
      out += '\n';
    }
    for (_l = 0, _len2 = links.length; _l < _len2; _l++) {
      _ref1 = links[_l], name = _ref1.name, url = _ref1.url, title = _ref1.title;
      optionalTitle = title ? " \"" + title + "\"" : '';
      out += "[" + name + "]: " + url + optionalTitle + "\n";
    }
    return out;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa1pBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLGNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUhQLENBQUE7O0FBQUEsRUFJQyxnQkFBaUIsT0FBQSxDQUFRLFFBQVIsRUFBakIsYUFKRCxDQUFBOztBQUFBLEVBTUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBTmIsQ0FBQTs7QUFBQSxFQU9BLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FQZCxDQUFBOztBQUFBLEVBUUEsT0FBbUQsT0FBQSxDQUFRLFNBQVIsQ0FBbkQsRUFBQyxpQkFBQSxTQUFELEVBQVksMEJBQUEsa0JBQVosRUFBZ0MsZUFBQSxPQUFoQyxFQUF5QyxjQUFBLE1BUnpDLENBQUE7O0FBQUEsRUFXRSw0QkFBQSxhQURGLEVBRUUseUJBQUEsVUFGRixFQUdFLG9DQUFBLHFCQUhGLEVBSUUsaUNBQUEsa0JBSkYsRUFLRSwyQkFBQSxZQUxGLEVBTUUseUJBQUEsVUFORixFQU9FLDRCQUFBLGFBUEYsRUFRRSw0QkFBQSxhQVJGLEVBU0UseUJBQUEsVUFuQkYsQ0FBQTs7QUFzQkE7QUFBQTs7Ozs7OztLQXRCQTs7QUFBQSxFQThCQSxVQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0scUJBQU4sR0FBQTtBQUNYLFFBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/index.coffee
