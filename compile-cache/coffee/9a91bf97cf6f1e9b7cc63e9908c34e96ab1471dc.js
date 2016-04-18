(function() {
  var delimitCode, fixHeaders, fm, formatTable, indent, longestStringInArray, marked, pad, preprocessAST, stringRepeat, tidyInlineMarkdown, yaml, _ref;

  fm = require('front-matter');

  indent = require('indent');

  marked = require('marked');

  pad = require('pad');

  yaml = require('js-yaml');

  _ref = require('./utils'), stringRepeat = _ref.stringRepeat, longestStringInArray = _ref.longestStringInArray, delimitCode = _ref.delimitCode;

  preprocessAST = require('./preprocess');

  tidyInlineMarkdown = require('./tidy-inline-markdown');


  /**
   * Some people accidently skip levels in their headers (like jumping from h1 to
   * h3), which screws up things like tables of contents. This function fixes
   * that.
  
   * The algorithm assumes that relations between nearby headers are correct and
   * will try to preserve them. For example, "h1, h3, h3" becomes "h1, h2, h2"
   * rather than "h1, h2, h3".
   */

  fixHeaders = function(ast, ensureFirstHeaderIsH1) {
    var e, gap, i, lastHeaderDepth, parentDepth, rootDepth, _ref1;
    i = 0;
    lastHeaderDepth = 0;
    if (!ensureFirstHeaderIsH1) {
      e = 0;
      while (e < ast.length) {
        if (ast[e].type !== 'heading') {
          e++;
        } else {
          lastHeaderDepth = ast[e].depth - 1;
          break;
        }
      }
    }
    rootDepth = lastHeaderDepth + 1;
    while (i < ast.length) {
      if (ast[i].type !== 'heading') {

      } else if ((rootDepth <= (_ref1 = ast[i].depth) && _ref1 <= lastHeaderDepth + 1)) {
        lastHeaderDepth = ast[i].depth;
      } else {
        e = i;
        if (ast[i].depth <= rootDepth) {
          gap = ast[i].depth - rootDepth;
        } else {
          gap = ast[i].depth - (lastHeaderDepth + 1);
        }
        parentDepth = ast[i].depth;
        while (e < ast.length) {
          if (ast[e].type !== 'heading') {

          } else if (ast[e].depth >= parentDepth) {
            ast[e].depth -= gap;
          } else {
            break;
          }
          e++;
        }
        continue;
      }
      i++;
    }
    return ast;
  };

  formatTable = function(token) {
    var alignment, col, colWidth, i, j, out, row, _i, _j, _k, _l, _len, _len1, _m, _ref1, _ref2, _ref3, _ref4, _ref5;
    out = [];
    for (i = _i = 0, _ref1 = token.header.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      col = [token.header[i]];
      for (j = _j = 0, _ref2 = token.cells.length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; j = 0 <= _ref2 ? ++_j : --_j) {
        token.cells[j][i] = (token.cells[j][i] != null ? token.cells[j][i].trim() : '');
        col.push(token.cells[j][i]);
      }
      colWidth = longestStringInArray(col);
      token.header[i] = pad(token.header[i], colWidth);
      alignment = token.align[i];
      token.align[i] = ((function() {
        switch (alignment) {
          case null:
            return pad('', colWidth, '-');
          case 'left':
            return ':' + pad('', colWidth - 1, '-');
          case 'center':
            return ':' + pad('', colWidth - 2, '-') + ':';
          case 'right':
            return pad('', colWidth - 1, '-') + ':';
        }
      })());
      for (j = _k = 0, _ref3 = token.cells.length; 0 <= _ref3 ? _k < _ref3 : _k > _ref3; j = 0 <= _ref3 ? ++_k : --_k) {
        token.cells[j][i] = (alignment === 'right' ? pad(colWidth, token.cells[j][i]) : pad(token.cells[j][i], colWidth));
      }
    }
    if (token.header.length > 1) {
      out.push(token.header.join(' | ').trimRight());
      out.push(token.align.join(' | '));
      _ref4 = token.cells;
      for (_l = 0, _len = _ref4.length; _l < _len; _l++) {
        row = _ref4[_l];
        out.push(row.join(' | ').trimRight());
      }
    } else {
      out.push('| ' + token.header[0].trimRight());
      out.push('| ' + token.align[0]);
      _ref5 = token.cells;
      for (_m = 0, _len1 = _ref5.length; _m < _len1; _m++) {
        row = _ref5[_m];
        out.push('| ' + row[0].trimRight());
      }
    }
    out.push('');
    return out;
  };

  module.exports = function(dirtyMarkdown, options) {
    var ast, content, id, line, link, links, optionalTitle, out, previousToken, token, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
    if (options == null) {
      options = {};
    }
    if (options.ensureFirstHeaderIsH1 == null) {
      options.ensureFirstHeaderIsH1 = true;
    }
    out = [];
    content = fm(dirtyMarkdown);
    if (Object.keys(content.attributes).length !== 0) {
      out.push('---', yaml.safeDump(content.attributes).trim(), '---\n');
    }
    ast = marked.lexer(content.body);
    links = ast.links;
    previousToken = void 0;
    ast = ast.filter(function(token) {
      var _ref1;
      return (_ref1 = token.type) !== 'space' && _ref1 !== 'list_end';
    });
    ast = preprocessAST(ast);
    ast = fixHeaders(ast, options.ensureFirstHeaderIsH1);
    for (_i = 0, _len = ast.length; _i < _len; _i++) {
      token = ast[_i];
      if (token.indent == null) {
        token.indent = '';
      }
      if (token.nesting == null) {
        token.nesting = [];
      }
      switch (token.type) {
        case 'heading':
          if (previousToken != null) {
            out.push('');
          }
          out.push(stringRepeat('#', token.depth) + ' ' + token.text);
          out.push('');
          break;
        case 'paragraph':
          if ((_ref1 = previousToken != null ? previousToken.type : void 0) === 'paragraph' || _ref1 === 'list_item' || _ref1 === 'text') {
            out.push('');
          }
          out.push(token.indent + tidyInlineMarkdown(token).text.replace(/\n/g, ' '));
          break;
        case 'text':
        case 'list_item':
          if ((previousToken != null) && token.type === 'list_item' && (previousToken.nesting.length !== token.nesting.length || (previousToken.type === 'paragraph' && ((_ref2 = previousToken.nesting) != null ? _ref2.length : void 0) >= token.nesting.length))) {
            out.push('');
          }
          out.push(token.indent + tidyInlineMarkdown(token).text);
          break;
        case 'code':
          if (token.lang == null) {
            token.lang = '';
          }
          token.text = delimitCode("" + token.lang + "\n" + token.text + "\n", '```');
          out.push('', indent(token.text, token.indent), '');
          break;
        case 'table':
          if (previousToken != null) {
            out.push('');
          }
          out.push.apply(out, formatTable(token));
          break;
        case 'hr':
          if (previousToken != null) {
            out.push('');
          }
          out.push(token.indent + stringRepeat('-', 80), '');
          break;
        case 'html':
          _ref3 = token.text.split('\n');
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            line = _ref3[_j];
            out.push(line);
          }
          break;
        default:
          throw new Error("Unknown Token: " + token.type);
      }
      previousToken = token;
    }
    if (Object.keys(links).length > 0) {
      out.push('');
    }
    for (id in links) {
      link = links[id];
      optionalTitle = link.title ? " \"" + link.title + "\"" : '';
      out.push("[" + id + "]: " + link.href + optionalTitle);
    }
    out.push('');
    out = out.filter(function(val, i, arr) {
      return !(val === '' && arr[i - 1] === '');
    });
    return out.join('\n');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0pBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLGNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUZULENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBSlAsQ0FBQTs7QUFBQSxFQU1BLE9BQW9ELE9BQUEsQ0FBUSxTQUFSLENBQXBELEVBQUMsb0JBQUEsWUFBRCxFQUFlLDRCQUFBLG9CQUFmLEVBQXFDLG1CQUFBLFdBTnJDLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxjQUFSLENBUGhCLENBQUE7O0FBQUEsRUFRQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVIsQ0FSckIsQ0FBQTs7QUFXQTtBQUFBOzs7Ozs7OztLQVhBOztBQUFBLEVBb0JBLFVBQUEsR0FBYSxTQUFDLEdBQUQsRUFBTSxxQkFBTixHQUFBO0FBQ1gsUUFBQSx5REFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLENBQUosQ0FBQTtBQUFBLElBSUEsZUFBQSxHQUFrQixDQUpsQixDQUFBO0FBTUEsSUFBQSxJQUFHLENBQUEscUJBQUg7QUFDRSxNQUFBLENBQUEsR0FBSSxDQUFKLENBQUE7QUFDQSxhQUFNLENBQUEsR0FBSSxHQUFHLENBQUMsTUFBZCxHQUFBO0FBQ0UsUUFBQSxJQUFHLEdBQUks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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/index.coffee
