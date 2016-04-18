(function() {
  var bfsOrder, canConvert, cleanText, converters, decodeHtmlEntities, findConverter, fixHeaders, flankingWhitespace, fm, getContent, getNextSibling, getNodeIndex, getPreviousSibling, isBlock, isFlankedByWhitespace, isVoid, marked, nodeType, parseFragment, process, removeEmptyNodes, treeAdapter, treeAdapters, yaml, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fm = require('front-matter');

  marked = require('marked');

  yaml = require('js-yaml');

  _ref = require('parse5'), parseFragment = _ref.parseFragment, treeAdapters = _ref.treeAdapters;

  converters = require('./converters');

  _ref1 = require('./utils'), cleanText = _ref1.cleanText, decodeHtmlEntities = _ref1.decodeHtmlEntities, nodeType = _ref1.nodeType, isBlock = _ref1.isBlock, isVoid = _ref1.isVoid;

  treeAdapter = treeAdapters["default"];


  /**
   * Some people accidently skip levels in their headers (like jumping from h1 to
     h3), which screws up things like tables of contents. This function fixes
     that.
   * The algorithm assumes that relations between nearby headers are correct and
     will try to preserve them. For example, "h1, h3, h3" becomes "h1, h2, h2"
     rather than "h1, h2, h3".
   */

  fixHeaders = function(dom, ensureFirstHeaderIsH1) {
    var child, childHeaderDepth, e, gap, headerDepth, i, lastHeaderDepth, rootDepth, topLevelHeaders, _i, _j, _len, _ref2, _ref3;
    topLevelHeaders = [];
    _ref2 = dom.childNodes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      child = _ref2[_i];
      if (/h[0-6]/.test(child.nodeName)) {
        topLevelHeaders.push(child);
      }
    }
    if (topLevelHeaders.length === 0) {
      return;
    }
    lastHeaderDepth = 0;
    if (!ensureFirstHeaderIsH1) {
      lastHeaderDepth = topLevelHeaders[0].nodeName[1] - 1;
    }
    rootDepth = lastHeaderDepth + 1;
    i = 0;
    while (i < topLevelHeaders.length) {
      headerDepth = parseInt(topLevelHeaders[i].nodeName[1]);
      if ((rootDepth <= headerDepth && headerDepth <= lastHeaderDepth + 1)) {
        lastHeaderDepth = headerDepth;
      } else {
        if (headerDepth <= rootDepth) {
          gap = headerDepth - rootDepth;
        } else {
          gap = headerDepth - (lastHeaderDepth + 1);
        }
        for (e = _j = i, _ref3 = topLevelHeaders.length; i <= _ref3 ? _j < _ref3 : _j > _ref3; e = i <= _ref3 ? ++_j : --_j) {
          childHeaderDepth = parseInt(topLevelHeaders[e].nodeName[1]);
          if (childHeaderDepth >= headerDepth) {
            topLevelHeaders[e].nodeName = 'h' + (childHeaderDepth - gap);
          } else {
            break;
          }
        }
        continue;
      }
      i++;
    }
  };


  /**
   * Flattens DOM tree into single array
   */

  bfsOrder = function(node) {
    var child, elem, inqueue, outqueue, _i, _len, _ref2;
    inqueue = [node];
    outqueue = [];
    while (inqueue.length > 0) {
      elem = inqueue.shift();
      outqueue.push(elem);
      _ref2 = elem.childNodes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        child = _ref2[_i];
        if (nodeType(child) === 1) {
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
    var child, childText, content, previousSibling, whitespaceSeparator, _i, _len, _ref2, _ref3, _ref4;
    if (node.nodeName === '#text') {
      return node.value;
    }
    content = '';
    previousSibling = null;
    _ref2 = node.childNodes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      child = _ref2[_i];
      childText = ((function() {
        switch (nodeType(child)) {
          case 1:
            return child._replacement;
          case 3:
            return cleanText(child);
        }
      })());
      if (child.nodeName === 'br') {
        content = content.trimRight();
      }
      if ((previousSibling != null ? previousSibling.nodeName : void 0) === 'br') {
        childText = childText.trimLeft();
      }
      if (previousSibling != null) {
        whitespaceSeparator = ((((_ref3 = child._whitespace) != null ? _ref3.leading : void 0) || '') + ((previousSibling != null ? (_ref4 = previousSibling._whitespace) != null ? _ref4.trailing : void 0 : void 0) || '')).replace(/\n{3,}/, '\n\n');
        content += whitespaceSeparator;
      }
      content += childText;
      previousSibling = child;
    }
    return content;
  };

  canConvert = function(node, filter) {
    var _ref2;
    if (typeof filter === 'string') {
      return filter === node.nodeName;
    }
    if (Array.isArray(filter)) {
      return _ref2 = node.nodeName.toLowerCase(), __indexOf.call(filter, _ref2) >= 0;
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


  /**
   * @return {Integer} The index of the given `node` relative to all the children
     of its parent
   */

  getNodeIndex = function(node) {
    return node.parentNode.childNodes.indexOf(node);
  };

  getPreviousSibling = function(node) {
    return node.parentNode.childNodes[getNodeIndex(node) - 1];
  };

  getNextSibling = function(node) {
    return node.parentNode.childNodes[getNodeIndex(node) + 1];
  };

  isFlankedByWhitespace = function(side, node) {
    var regExp, sibling;
    if (side === 'left') {
      sibling = getPreviousSibling(node);
      regExp = /\s$/;
    } else {
      sibling = getNextSibling(node);
      regExp = /^\s/;
    }
    if (sibling && !isBlock(sibling)) {
      return regExp.test(getContent(sibling));
    } else {
      return false;
    }
  };

  flankingWhitespace = function(node) {
    var content, hasLeading, hasTrailing, leading, trailing, _ref2, _ref3, _ref4, _ref5;
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
    if ((_ref2 = node.childNodes[0]) != null ? (_ref3 = _ref2._whitespace) != null ? _ref3.leading : void 0 : void 0) {
      leading += node.childNodes[0]._whitespace.leading;
    }
    if ((_ref4 = node.childNodes.slice(-1)[0]) != null ? (_ref5 = _ref4._whitespace) != null ? _ref5.trailing : void 0 : void 0) {
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
    if (node.nodeName !== 'pre' && node.parentNode.nodeName !== 'pre') {
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
    if (node.nodeName === 'li') {
      whitespace.leading = '';
    }
    node._replacement = converter.replacement(content, node, links);
    node._whitespace = whitespace;
  };

  removeEmptyNodes = function(nodes) {
    var child, emptyChildren, nextSibling, node, previousSibling, _i, _j, _len, _len1, _ref2, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      emptyChildren = [];
      _ref2 = node.childNodes;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        child = _ref2[_j];
        if (child.nodeName === '#text' && child.value.trim() === '') {
          previousSibling = getPreviousSibling(child);
          nextSibling = getNextSibling(child);
          if (!previousSibling || !nextSibling || isBlock(previousSibling) || isBlock(nextSibling)) {
            emptyChildren.push(child);
          }
        }
      }
      _results.push((function() {
        var _k, _len2, _results1;
        _results1 = [];
        for (_k = 0, _len2 = emptyChildren.length; _k < _len2; _k++) {
          child = emptyChildren[_k];
          _results1.push(treeAdapter.detachNode(child));
        }
        return _results1;
      })());
    }
    return _results;
  };

  module.exports = function(dirtyMarkdown, options) {
    var ast, content, html, link, links, name, node, nodes, optionalTitle, out, rawLinks, root, title, url, value, _i, _j, _k, _len, _len1, _ref2;
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
    content = fm(dirtyMarkdown);
    if (Object.keys(content.attributes).length !== 0) {
      out += '---\n' + yaml.safeDump(content.attributes).trim() + '\n---\n\n';
    }
    ast = marked.lexer(content.body);
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
    html = marked.parser(ast);
    html = html.replace(/(\d+)\. /g, '$1\\. ');
    root = parseFragment(html);
    removeEmptyNodes([root]);
    fixHeaders(root, options.ensureFirstHeaderIsH1);
    nodes = bfsOrder(root);
    removeEmptyNodes(nodes);
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      node._converter = findConverter(node);
    }
    for (_j = nodes.length - 1; _j >= 0; _j += -1) {
      node = nodes[_j];
      process(node, links);
    }
    out += getContent(root).trimRight() + '\n';
    if (links.length > 0) {
      out += '\n';
    }
    for (_k = 0, _len1 = links.length; _k < _len1; _k++) {
      _ref2 = links[_k], name = _ref2.name, url = _ref2.url, title = _ref2.title;
      optionalTitle = title ? " \"" + title + "\"" : '';
      out += "[" + name + "]: " + url + optionalTitle + "\n";
    }
    return out;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa1VBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsY0FBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLE9BQWdDLE9BQUEsQ0FBUSxRQUFSLENBQWhDLEVBQUMscUJBQUEsYUFBRCxFQUFnQixvQkFBQSxZQUhoQixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLFFBQTZELE9BQUEsQ0FBUSxTQUFSLENBQTdELEVBQUMsa0JBQUEsU0FBRCxFQUFZLDJCQUFBLGtCQUFaLEVBQWdDLGlCQUFBLFFBQWhDLEVBQTBDLGdCQUFBLE9BQTFDLEVBQW1ELGVBQUEsTUFObkQsQ0FBQTs7QUFBQSxFQVFBLFdBQUEsR0FBYyxZQUFZLENBQUMsU0FBRCxDQVIxQixDQUFBOztBQVVBO0FBQUE7Ozs7Ozs7S0FWQTs7QUFBQSxFQWtCQSxVQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0scUJBQU4sR0FBQTtBQUNYLFFBQUEsd0hBQUE7QUFBQSxJQUFBLGVBQUEsR0FBa0IsRUFBbEIsQ0FBQTtBQUNBO0FBQUEsU0FBQSw0Q0FBQTt3QkFBQTtBQUNFLE1BQUEsSUFBRyxRQUFRLENBQUMsSUFBVCxDQUFjLEtBQUssQ0FBQyxRQUFwQixDQUFIO0FBQ0UsUUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsS0FBckIs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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/index.coffee
