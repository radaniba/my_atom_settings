(function() {
  var DISABLE_SYNC_LINE, File, HEIGHTS_DELTA, Highlights, TAGS_TO_REPLACE, TAGS_TO_REPLACE_REVERSE, buildScrollMap, checkGraph, cheerio, customSubjects, defaults, enableWikiLinkSyntax, fileImport, frontMatterRenderingOption, fs, getRealDataLine, globalMathTypesettingData, highlighter, insertAnchors, katex, loadMermaidConfig, mathRenderingIndicator, mathRenderingOption, matter, md, mermaidAPI, pandocRender, parseMD, parseMath, path, processFrontMatter, protocolsWhiteListRegExp, remarkable, resolveImagePathAndCodeBlock, scopeForLanguageName, toc, updateTOC, usePandocParser, useStandardCodeFencingForGraphs, uslug;

  katex = require('katex');

  cheerio = require('cheerio');

  path = require('path');

  fs = require('fs');

  remarkable = require('remarkable');

  uslug = require('uslug');

  Highlights = require(path.join(atom.getLoadSettings().resourcePath, 'node_modules/highlights/lib/highlights.js'));

  File = require('atom').File;

  matter = require('gray-matter');

  mermaidAPI = require('../dependencies/mermaid/mermaid.min.js').mermaidAPI;

  toc = require('./toc');

  scopeForLanguageName = require('./extension-helper').scopeForLanguageName;

  customSubjects = require('./custom-comment');

  fileImport = require('./file-import.coffee');

  protocolsWhiteListRegExp = require('./protocols-whitelist').protocolsWhiteListRegExp;

  pandocRender = require('./pandoc-convert').pandocRender;

  mathRenderingOption = atom.config.get('markdown-preview-enhanced.mathRenderingOption');

  mathRenderingIndicator = {
    inline: [['$', '$']],
    block: [['$$', '$$']]
  };

  enableWikiLinkSyntax = atom.config.get('markdown-preview-enhanced.enableWikiLinkSyntax');

  frontMatterRenderingOption = atom.config.get('markdown-preview-enhanced.frontMatterRenderingOption');

  globalMathTypesettingData = {};

  useStandardCodeFencingForGraphs = atom.config.get('markdown-preview-enhanced.useStandardCodeFencingForGraphs');

  usePandocParser = atom.config.get('markdown-preview-enhanced.usePandocParser');

  TAGS_TO_REPLACE = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '\/': '\/',
    '&#x2F;': '&#x2F;',
    '\\': '\\',
    '&#x5C;': '&#x5C;'
  };

  TAGS_TO_REPLACE_REVERSE = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': '\'',
    '&#x27;': '\'',
    '&#x2F;': '\/',
    '&#x5C;': '\\'
  };

  highlighter = null;

  String.prototype.escape = function() {
    return this.replace(/[&<>"'\/\\]/g, function(tag) {
      return TAGS_TO_REPLACE[tag] || tag;
    });
  };

  String.prototype.unescape = function() {
    return this.replace(/\&(amp|lt|gt|quot|apos|\#x27|\#x2F|\#x5C)\;/g, function(whole) {
      return TAGS_TO_REPLACE_REVERSE[whole] || whole;
    });
  };

  loadMermaidConfig = function() {
    var configPath, error, mermaidConfigFile;
    configPath = path.resolve(atom.config.configDirPath, './markdown-preview-enhanced/mermaid_config.js');
    try {
      return require(configPath);
    } catch (error1) {
      error = error1;
      mermaidConfigFile = new File(configPath);
      mermaidConfigFile.create().then(function(flag) {
        if (!flag) {
          atom.notifications.addError('Failed to load mermaid_config.js', {
            detail: 'there might be errors in your config file'
          });
          return;
        }
        return mermaidConfigFile.write("'use strict'\n// config mermaid init call\n// http://knsv.github.io/mermaid/#configuration\n//\n// you can edit the 'config' variable below\n// everytime you changed this file, you may need to restart atom.\nlet config = {\n  startOnLoad: false\n}\n\nmodule.exports = config || {startOnLoad: false}");
      });
      return {
        startOnLoad: false
      };
    }
  };

  mermaidAPI.initialize(loadMermaidConfig());

  atom.config.observe('markdown-preview-enhanced.mathRenderingOption', function(option) {
    if (option === 'None') {
      return mathRenderingOption = null;
    } else {
      return mathRenderingOption = option;
    }
  });

  atom.config.observe('markdown-preview-enhanced.indicatorForMathRenderingInline', function(indicatorStr) {
    var error, indicators;
    try {
      indicators = JSON.parse(indicatorStr).filter(function(x) {
        return x.length === 2;
      });
      return mathRenderingIndicator.inline = indicators;
    } catch (error1) {
      error = error1;
      return console.log(error);
    }
  });

  atom.config.observe('markdown-preview-enhanced.indicatorForMathRenderingBlock', function(indicatorStr) {
    var error, indicators;
    try {
      indicators = JSON.parse(indicatorStr).filter(function(x) {
        return x.length === 2;
      });
      return mathRenderingIndicator.block = indicators;
    } catch (error1) {
      error = error1;
      return console.log(error);
    }
  });

  atom.config.observe('markdown-preview-enhanced.enableWikiLinkSyntax', function(flag) {
    return enableWikiLinkSyntax = flag;
  });

  atom.config.observe('markdown-preview-enhanced.frontMatterRenderingOption', function(flag) {
    return frontMatterRenderingOption = flag;
  });

  atom.config.observe('markdown-preview-enhanced.useStandardCodeFencingForGraphs', function(flag) {
    return useStandardCodeFencingForGraphs = flag;
  });

  atom.config.observe('markdown-preview-enhanced.usePandocParser', function(flag) {
    return usePandocParser = flag;
  });

  defaults = {
    html: true,
    xhtmlOut: false,
    breaks: true,
    langPrefix: 'language-',
    linkify: true,
    linkTarget: '',
    typographer: true
  };

  md = new remarkable('full', defaults);

  DISABLE_SYNC_LINE = false;

  HEIGHTS_DELTA = [];

  getRealDataLine = function(lineNo) {
    var acc, height, i, realStart, ref, start;
    if (!HEIGHTS_DELTA.length) {
      return lineNo;
    }
    i = HEIGHTS_DELTA.length - 1;
    while (i >= 0) {
      ref = HEIGHTS_DELTA[i], realStart = ref.realStart, start = ref.start, height = ref.height, acc = ref.acc;
      if (lineNo === start) {
        return realStart;
      } else if (lineNo > start) {
        if (lineNo < start + height) {
          return realStart;
        } else {
          return lineNo - acc - height + i + 1;
        }
      }
      i -= 1;
    }
    return lineNo;
  };

  atom.config.observe('markdown-preview-enhanced.breakOnSingleNewline', function(breakOnSingleNewline) {
    return md.set({
      breaks: breakOnSingleNewline
    });
  });

  atom.config.observe('markdown-preview-enhanced.enableTypographer', function(enableTypographer) {
    return md.set({
      typographer: enableTypographer
    });
  });

  md.inline.ruler.before('escape', 'math', function(state, silent) {
    var b, block, closeTag, content, displayMode, end, i, inline, j, k, len, len1, openTag;
    if (!mathRenderingOption) {
      return false;
    }
    openTag = null;
    closeTag = null;
    displayMode = true;
    inline = mathRenderingIndicator.inline;
    block = mathRenderingIndicator.block;
    for (j = 0, len = block.length; j < len; j++) {
      b = block[j];
      if (state.src.startsWith(b[0], state.pos)) {
        openTag = b[0];
        closeTag = b[1];
        displayMode = true;
        break;
      }
    }
    if (!openTag) {
      for (k = 0, len1 = inline.length; k < len1; k++) {
        i = inline[k];
        if (state.src.startsWith(i[0], state.pos)) {
          openTag = i[0];
          closeTag = i[1];
          displayMode = false;
          break;
        }
      }
    }
    if (!openTag) {
      return false;
    }
    content = null;
    end = -1;
    i = state.pos + openTag.length;
    while (i < state.src.length) {
      if (state.src.startsWith(closeTag, i)) {
        end = i;
        break;
      } else if (state.src[i] === '\\') {
        i += 1;
      }
      i += 1;
    }
    if (end >= 0) {
      content = state.src.slice(state.pos + openTag.length, end);
    } else {
      return false;
    }
    if (content && !silent) {
      state.push({
        type: 'math',
        content: content.trim(),
        openTag: openTag,
        closeTag: closeTag,
        displayMode: displayMode
      });
      state.pos += content.length + openTag.length + closeTag.length;
      return true;
    } else {
      return false;
    }
  });

  parseMath = function(arg1) {
    var closeTag, content, displayMode, displayModeAttr, element, error, openTag, tag, text;
    content = arg1.content, openTag = arg1.openTag, closeTag = arg1.closeTag, displayMode = arg1.displayMode;
    if (!content) {
      return;
    }
    if (mathRenderingOption === 'KaTeX') {
      if (globalMathTypesettingData.isForPreview) {
        displayModeAttr = displayMode ? 'display-mode' : '';
        if (!globalMathTypesettingData.katex_s.length) {
          return "<span class='katex-exps' " + displayModeAttr + ">" + (content.escape()) + "</span>";
        } else {
          element = globalMathTypesettingData.katex_s.splice(0, 1)[0];
          if (element.getAttribute('data-original') === content && element.hasAttribute('display-mode') === displayMode) {
            return "<span class='katex-exps' data-original=\"" + content + "\" data-processed " + displayModeAttr + ">" + element.innerHTML + "</span>";
          } else {
            return "<span class='katex-exps' " + displayModeAttr + ">" + (content.escape()) + "</span>";
          }
        }
      } else {
        try {
          return katex.renderToString(content, {
            displayMode: displayMode
          });
        } catch (error1) {
          error = error1;
          return "<span style=\"color: #ee7f49; font-weight: 500;\">" + error + "</span>";
        }
      }
    } else if (mathRenderingOption === 'MathJax') {
      text = (openTag + content + closeTag).replace(/\n/g, '');
      tag = displayMode ? 'div' : 'span';
      if (globalMathTypesettingData.isForPreview) {
        if (!globalMathTypesettingData.mathjax_s.length) {
          return "<" + tag + " class=\"mathjax-exps\">" + (text.escape()) + "</" + tag + ">";
        } else {
          element = globalMathTypesettingData.mathjax_s.splice(0, 1)[0];
          if (element.getAttribute('data-original') === text && element.tagName.toLowerCase() === tag && element.hasAttribute('data-processed')) {
            return "<" + tag + " class=\"mathjax-exps\" data-original=\"" + text + "\" data-processed>" + element.innerHTML + "</" + tag + ">";
          } else {
            return "<" + tag + " class=\"mathjax-exps\">" + (text.escape()) + "</" + tag + ">";
          }
        }
      } else {
        return text.escape();
      }
    }
  };

  md.renderer.rules.math = function(tokens, idx) {
    return parseMath(tokens[idx] || {});
  };

  md.inline.ruler.before('autolink', 'wikilink', function(state, silent) {
    var content, end, i, tag;
    if (!enableWikiLinkSyntax || !state.src.startsWith('[[', state.pos)) {
      return false;
    }
    content = null;
    tag = ']]';
    end = -1;
    i = state.pos + tag.length;
    while (i < state.src.length) {
      if (state.src[i] === '\\') {
        i += 1;
      } else if (state.src.startsWith(tag, i)) {
        end = i;
        break;
      }
      i += 1;
    }
    if (end >= 0) {
      content = state.src.slice(state.pos + tag.length, end);
    } else {
      return false;
    }
    if (content && !silent) {
      state.push({
        type: 'wikilink',
        content: content
      });
      state.pos += content.length + 2 * tag.length;
      return true;
    } else {
      return false;
    }
  });

  md.renderer.rules.wikilink = function(tokens, idx) {
    var content, linkText, splits, wikiLink;
    content = tokens[idx].content;
    if (!content) {
      return;
    }
    splits = content.split('|');
    linkText = splits[0].trim();
    wikiLink = splits.length === 2 ? (splits[1].trim()) + ".md" : linkText + ".md";
    return "<a href=\"" + wikiLink + "\">" + linkText + "</a>";
  };

  md.block.ruler.before('code', 'custom-comment', function(state, start, end, silent) {
    var content, e, firstIndexOfSpace, i, key, match, max, option, pos, rest, subject, value;
    pos = state.bMarks[start] + state.tShift[start];
    max = state.eMarks[start];
    if (pos >= max) {
      return false;
    }
    if (state.src.startsWith('<!--', pos)) {
      end = state.src.indexOf('-->', pos + 4);
      if (end >= 0) {
        content = state.src.slice(pos + 4, end).trim();
        match = content.match(/(\s|\n)/);
        if (!match) {
          firstIndexOfSpace = content.length;
        } else {
          firstIndexOfSpace = match.index;
        }
        subject = content.slice(0, firstIndexOfSpace);
        if (!customSubjects[subject]) {
          state.line = start + 1 + (state.src.slice(pos + 4, end).match(/\n/g) || []).length;
          return true;
        }
        rest = content.slice(firstIndexOfSpace + 1).trim();
        match = rest.match(/(?:[^\s\n:"']+|"[^"]*"|'[^']*')+/g);
        if (match && match.length % 2 === 0) {
          option = {};
          i = 0;
          while (i < match.length) {
            key = match[i];
            value = match[i + 1];
            try {
              option[key] = JSON.parse(value);
            } catch (error1) {
              e = error1;
              null;
            }
            i += 2;
          }
        } else {
          option = {};
        }
        state.tokens.push({
          type: 'custom',
          subject: subject,
          line: getRealDataLine(state.line),
          option: option
        });
        state.line = start + 1 + (state.src.slice(pos + 4, end).match(/\n/g) || []).length;
        return true;
      } else {
        return false;
      }
    }
  });

  md.renderer.rules.paragraph_open = function(tokens, idx) {
    var lineNo;
    lineNo = null;
    if (tokens[idx].lines && !DISABLE_SYNC_LINE) {
      lineNo = tokens[idx].lines[0];
      return '<p class="sync-line" data-line="' + getRealDataLine(lineNo) + '">';
    }
    return '<p>';
  };

  md.renderer.rules.list_item_open = function(tokens, idx) {
    var checkBox, checked, children, level, line, ref;
    if (tokens[idx + 2]) {
      children = tokens[idx + 2].children;
      if (!children || !((ref = children[0]) != null ? ref.content : void 0)) {
        return '<li>';
      }
      line = children[0].content;
      if (line.startsWith('[ ] ') || line.startsWith('[x] ') || line.startsWith('[X] ')) {
        children[0].content = line.slice(3);
        checked = !(line[1] === ' ');
        checkBox = "<input type=\"checkbox\" class=\"task-list-item-checkbox\" " + (checked ? 'checked' : '') + ">";
        level = children[0].level;
        children = [
          {
            content: checkBox,
            type: 'htmltag',
            level: level
          }
        ].concat(children);
        tokens[idx + 2].children = children;
        return '<li class="task-list-item">';
      }
      return '<li>';
    } else {
      return '<li>';
    }
  };

  md.renderer.rules.fence = function(tokens, idx, options, env, instance) {
    var break_, closeTag, content, langClass, langName, langPrefix, lineStr, mathHtml, openTag, token;
    token = tokens[idx];
    langClass = '';
    langPrefix = options.langPrefix;
    lineStr = '';
    langName = token.params.escape();
    if (token.params) {
      langClass = ' class="' + langPrefix + langName + '" ';
    }
    if (token.lines) {
      lineStr = " data-line=\"" + (getRealDataLine(token.lines[0])) + "\" ";
    }
    content = token.content.escape();
    break_ = '\n';
    if (idx < tokens.length && tokens[idx].type === 'list_item_close') {
      break_ = '';
    }
    if (langName === 'math') {
      openTag = mathRenderingIndicator.block[0][0] || '$$';
      closeTag = mathRenderingIndicator.block[0][1] || '$$';
      mathHtml = parseMath({
        openTag: openTag,
        closeTag: closeTag,
        content: content,
        displayMode: true
      });
      return "<p " + lineStr + ">" + mathHtml + "</p>";
    }
    return '<pre><code' + langClass + lineStr + '>' + content + '</code></pre>' + break_;
  };

  buildScrollMap = function(markdownPreview) {
    var _scrollMap, a, acc, b, editor, el, i, j, k, l, lineElements, lines, linesCount, markdownHtmlView, nonEmptyList, offsetTop, pos, ref, ref1, ref2, t;
    editor = markdownPreview.editor;
    markdownHtmlView = markdownPreview.getElement();
    lines = editor.getBuffer().getLines();
    _scrollMap = [];
    nonEmptyList = [];
    acc = 0;
    linesCount = editor.getScreenLineCount();
    for (i = j = 0, ref = linesCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      _scrollMap.push(-1);
    }
    nonEmptyList.push(0);
    _scrollMap[0] = 0;
    lineElements = markdownHtmlView.getElementsByClassName('sync-line');
    for (i = k = 0, ref1 = lineElements.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      el = lineElements[i];
      t = el.getAttribute('data-line');
      if (!t) {
        continue;
      }
      t = editor.screenRowForBufferRow(parseInt(t));
      if (!t) {
        continue;
      }
      if (t < nonEmptyList[nonEmptyList.length - 1]) {
        el.removeAttribute('data-line');
      } else {
        nonEmptyList.push(t);
        offsetTop = 0;
        while (el && el !== markdownHtmlView) {
          offsetTop += el.offsetTop;
          el = el.offsetParent;
        }
        _scrollMap[t] = Math.round(offsetTop);
      }
    }
    nonEmptyList.push(linesCount);
    _scrollMap.push(markdownHtmlView.scrollHeight);
    pos = 0;
    for (i = l = 1, ref2 = linesCount; 1 <= ref2 ? l < ref2 : l > ref2; i = 1 <= ref2 ? ++l : --l) {
      if (_scrollMap[i] !== -1) {
        pos++;
        continue;
      }
      a = nonEmptyList[pos];
      b = nonEmptyList[pos + 1];
      _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
    }
    return _scrollMap;
  };

  checkGraph = function(graphType, graphArray, preElement, text, option, $, offset) {
    var $el, $preElement, element;
    if (graphArray == null) {
      graphArray = [];
    }
    if (offset == null) {
      offset = -1;
    }
    if (option.isForPreview) {
      $preElement = $(preElement);
      if (!graphArray.length) {
        $el = $("<div class=\"" + graphType + " mpe-graph\" data-offset=\"" + offset + "\">" + text + "</div>");
        $el.attr('data-original', text);
        return $preElement.replaceWith($el);
      } else {
        element = graphArray.splice(0, 1)[0];
        if (element.getAttribute('data-original') === text && element.getAttribute('data-processed') === 'true') {
          $el = $("<div class=\"" + graphType + " mpe-graph\" data-processed=\"true\" data-offset=\"" + offset + "\">" + element.innerHTML + "</div>");
          $el.attr('data-original', text);
          return $preElement.replaceWith($el);
        } else {
          $el = $("<div class=\"" + graphType + " mpe-graph\" data-offset=\"" + offset + "\">" + text + "</div>");
          $el.attr('data-original', text);
          return $preElement.replaceWith($el);
        }
      }
    } else if (option.isForEbook) {

      /* doesn't work...
      if graphType == 'viz'
        Viz = require('../dependencies/viz/viz.js')
        $el = $("<div></div>")
        $el.html(Viz(text))
        $(preElement).replaceWith $el
      else
        $(preElement).replaceWith "<pre>Graph is not supported in EBook</pre>"
       */
      $el = $("<div class=\"" + graphType + " mpe-graph\" " + (graphType === 'wavedrom' || graphType === 'mermaid' ? "data-offset=\"" + offset + "\"" : '') + ">Graph is not supported in EBook</div>");
      $el.attr('data-original', text);
      return $(preElement).replaceWith($el);
    } else {
      element = graphArray.splice(0, 1)[0];
      if (element) {
        return $(preElement).replaceWith("<div class=\"" + graphType + " mpe-graph\">" + element.innerHTML + "</div>");
      } else {
        return $(preElement).replaceWith("<pre>please wait till preview finishes rendering graph </pre>");
      }
    }
  };

  resolveImagePathAndCodeBlock = function(html, graphData, codeChunksData, option) {
    var $, fileDirectoryPath, mermaidOffset, projectDirectoryPath, renderCodeBlock, renderCodeChunk, wavedromOffset;
    if (graphData == null) {
      graphData = {};
    }
    if (codeChunksData == null) {
      codeChunksData = {};
    }
    if (option == null) {
      option = {};
    }
    fileDirectoryPath = option.fileDirectoryPath, projectDirectoryPath = option.projectDirectoryPath;
    if (!fileDirectoryPath) {
      return;
    }
    $ = cheerio.load(html);
    wavedromOffset = 0;
    mermaidOffset = 0;
    $('img, a').each(function(i, imgElement) {
      var img, src, srcTag;
      srcTag = 'src';
      if (imgElement.name === 'a') {
        srcTag = 'href';
      }
      img = $(imgElement);
      src = img.attr(srcTag);
      if (src && (!(src.match(protocolsWhiteListRegExp) || src.startsWith('data:image/') || src[0] === '#' || src[0] === '/'))) {
        if (!option.useRelativeImagePath) {
          return img.attr(srcTag, 'file:///' + path.resolve(fileDirectoryPath, src));
        }
      } else if (src && src[0] === '/') {
        if (option.useRelativeImagePath) {
          return img.attr(srcTag, path.relative(fileDirectoryPath, path.resolve(projectDirectoryPath, '.' + src)));
        } else {
          return img.attr(srcTag, 'file:///' + path.resolve(projectDirectoryPath, '.' + src));
        }
      }
    });
    renderCodeBlock = function(preElement, text, lang, lineNo) {
      var highlightedBlock;
      if (lineNo == null) {
        lineNo = null;
      }
      if (highlighter == null) {
        highlighter = new Highlights({
          registry: atom.grammars,
          scopePrefix: 'mpe-syntax--'
        });
      }
      html = highlighter.highlightSync({
        fileContents: text,
        scopeName: scopeForLanguageName(lang)
      });
      highlightedBlock = $(html);
      highlightedBlock.removeClass('editor').addClass('lang-' + lang);
      if (lineNo !== null && !DISABLE_SYNC_LINE) {
        highlightedBlock.attr({
          'data-line': lineNo
        });
        highlightedBlock.addClass('sync-line');
      }
      return $(preElement).replaceWith(highlightedBlock);
    };
    renderCodeChunk = function(preElement, text, parameters, lineNo, codeChunksData) {
      var $el, buttonGroup, highlightedBlock, lang, match, statusDiv;
      if (lineNo == null) {
        lineNo = null;
      }
      if (codeChunksData == null) {
        codeChunksData = {};
      }
      match = parameters.match(/^\{\s*(\"[^\"]*\"|[^\s]*|[^}]*)(.*)}$/);
      lang = match[1].trim();
      parameters = match[2].trim();
      if (lang[0] === '"') {
        lang = lang.slice(1, lang.length - 1).trim();
      }
      if (!lang) {
        return;
      }
      highlightedBlock = '';
      buttonGroup = '';
      if (!/\s*hide\s*:\s*true/.test(parameters)) {
        if (highlighter == null) {
          highlighter = new Highlights({
            registry: atom.grammars,
            scopePrefix: 'mpe-syntax--'
          });
        }
        html = highlighter.highlightSync({
          fileContents: text,
          scopeName: scopeForLanguageName(lang)
        });
        highlightedBlock = $(html);
        highlightedBlock.removeClass('editor').addClass('lang-' + lang);
        if (lineNo !== null && !DISABLE_SYNC_LINE) {
          highlightedBlock.attr({
            'data-line': lineNo
          });
          highlightedBlock.addClass('sync-line');
        }
        buttonGroup = '<div class="btn-group"><div class="run-btn btn"><span>▶︎</span></div><div class=\"run-all-btn btn\">all</div></div>';
      }
      statusDiv = '<div class="status">running...</div>';
      $el = $("<div class=\"code-chunk\">" + highlightedBlock + buttonGroup + statusDiv + '</div>');
      $el.attr({
        'data-lang': lang,
        'data-args': parameters,
        'data-line': lineNo,
        'data-code': text,
        'data-root-directory-path': fileDirectoryPath
      });
      return $(preElement).replaceWith($el);
    };
    $('pre').each(function(i, preElement) {
      var codeBlock, element, lang, lineNo, mermaidRegExp, plantumlRegExp, ref, ref1, text, vizRegExp, wavedromRegExp;
      lineNo = null;
      if (((ref = preElement.children[0]) != null ? ref.name : void 0) === 'code') {
        codeBlock = $(preElement).children().first();
        lang = 'text';
        if (codeBlock.attr('class')) {
          lang = codeBlock.attr('class').replace(/^language-/, '') || 'text';
        }
        text = codeBlock.text();
        lineNo = codeBlock.attr('data-line');
      } else {
        lang = 'text';
        if (preElement.children[0]) {
          text = preElement.children[0].data;
        } else {
          text = '';
        }
      }
      if (useStandardCodeFencingForGraphs) {
        mermaidRegExp = /^\@?mermaid/;
        plantumlRegExp = /^\@?(plantuml|puml)/;
        wavedromRegExp = /^\@?wavedrom/;
        vizRegExp = /^\@?(viz|dot)/;
      } else {
        mermaidRegExp = /^\@mermaid/;
        plantumlRegExp = /^\@(plantuml|puml)/;
        wavedromRegExp = /^\@wavedrom/;
        vizRegExp = /^\@(viz|dot)/;
      }
      if (lang.match(mermaidRegExp)) {
        mermaid.parseError = function(err, hash) {
          return renderCodeBlock(preElement, err, 'text');
        };
        element = (ref1 = graphData.mermaid_s) != null ? ref1[0] : void 0;
        if ((element && element.getAttribute('data-processed') === 'true' && element.getAttribute('data-original') === text) || mermaidAPI.parse(text.trim())) {
          checkGraph('mermaid', graphData.mermaid_s, preElement, text, option, $, mermaidOffset);
          return mermaidOffset += 1;
        }
      } else if (lang.match(plantumlRegExp)) {
        return checkGraph('plantuml', graphData.plantuml_s, preElement, text, option, $);
      } else if (lang.match(wavedromRegExp)) {
        checkGraph('wavedrom', graphData.wavedrom_s, preElement, text, option, $, wavedromOffset);
        return wavedromOffset += 1;
      } else if (lang.match(vizRegExp)) {
        return checkGraph('viz', graphData.viz_s, preElement, text, option, $);
      } else if (lang[0] === '{' && lang[lang.length - 1] === '}') {
        return renderCodeChunk(preElement, text, lang, lineNo, codeChunksData);
      } else {
        return renderCodeBlock(preElement, text, lang, lineNo);
      }
    });
    return $.html();
  };


  /*
   * process input string, skip front-matter
  
  if display table
    return {
      content: rest of input string after skipping front matter (but with '\n' included)
      table: string of <table>...</table> generated from data
    }
  else
    return {
      content: replace ---\n with ```yaml
      table: '',
    }
   */

  processFrontMatter = function(inputString, hideFrontMatter) {
    var content, data, match, r, ref, ref1, table, toTable, yamlStr;
    if (hideFrontMatter == null) {
      hideFrontMatter = false;
    }
    toTable = function(arg) {
      var item, j, key, len, tbody, thead;
      if (arg instanceof Array) {
        tbody = "<tbody><tr>";
        for (j = 0, len = arg.length; j < len; j++) {
          item = arg[j];
          tbody += "<td>" + (toTable(item)) + "</td>";
        }
        tbody += "</tr></tbody>";
        return "<table>" + tbody + "</table>";
      } else if (typeof arg === 'object') {
        thead = "<thead><tr>";
        tbody = "<tbody><tr>";
        for (key in arg) {
          thead += "<th>" + key + "</th>";
          tbody += "<td>" + (toTable(arg[key])) + "</td>";
        }
        thead += "</tr></thead>";
        tbody += "</tr></tbody>";
        return "<table>" + thead + tbody + "</table>";
      } else {
        return arg;
      }
    };
    r = /^-{3}[\n\r]([\w|\W]+?)[\n\r]-{3}[\n\r]/;
    match = r.exec(inputString);
    if (match) {
      yamlStr = match[0];
      data = matter(yamlStr).data;
      if (usePandocParser) {
        return {
          content: inputString,
          table: '',
          data: data
        };
      } else if (hideFrontMatter || frontMatterRenderingOption[0] === 'n') {
        content = '\n'.repeat(((ref = yamlStr.match(/\n/g)) != null ? ref.length : void 0) || 0) + inputString.slice(yamlStr.length);
        return {
          content: content,
          table: '',
          data: data
        };
      } else if (frontMatterRenderingOption[0] === 't') {
        content = '\n'.repeat(((ref1 = yamlStr.match(/\n/g)) != null ? ref1.length : void 0) || 0) + inputString.slice(yamlStr.length);
        if (typeof data === 'object') {
          table = toTable(data);
        } else {
          table = "<pre>Failed to parse YAML.</pre>";
        }
        return {
          content: content,
          table: table,
          data: data
        };
      } else {
        content = '```yaml\n' + match[1] + '\n```\n' + inputString.slice(yamlStr.length);
        return {
          content: content,
          table: '',
          data: data
        };
      }
    }
    return {
      content: inputString,
      table: ''
    };
  };


  /*
  update editor toc
  return true if toc is updated
   */

  updateTOC = function(markdownPreview, tocConfigs) {
    var buffer, delta, editor, equal, headings, headings2, i, j, ref, tab, tocDepthFrom, tocDepthFrom_s, tocDepthTo, tocDepthTo_s, tocEndLine, tocEndLine_s, tocNeedUpdate, tocObject, tocOrdered, tocOrdered_s, tocStartLine, tocStartLine_s;
    if (!markdownPreview || tocConfigs.tocStartLine_s.length !== tocConfigs.tocEndLine_s.length) {
      return false;
    }
    equal = function(arr1, arr2) {
      var i;
      if (arr1.length !== arr2.length) {
        return false;
      }
      i = 0;
      while (i < arr1.length) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
        i += 1;
      }
      return true;
    };
    tocNeedUpdate = false;
    if (!markdownPreview.tocConfigs) {
      tocNeedUpdate = true;
    } else if (!equal(markdownPreview.tocConfigs.tocOrdered_s, tocConfigs.tocOrdered_s) || !equal(markdownPreview.tocConfigs.tocDepthFrom_s, tocConfigs.tocDepthFrom_s) || !equal(markdownPreview.tocConfigs.tocDepthTo_s, tocConfigs.tocDepthTo_s)) {
      tocNeedUpdate = true;
    } else {
      headings = tocConfigs.headings;
      headings2 = markdownPreview.tocConfigs.headings;
      if (headings.length !== headings2.length) {
        tocNeedUpdate = true;
      } else {
        for (i = j = 0, ref = headings.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if (headings[i].content !== headings2[i].content || headings[i].level !== headings2[i].level) {
            tocNeedUpdate = true;
            break;
          }
        }
      }
    }
    if (tocNeedUpdate) {
      editor = markdownPreview.editor;
      buffer = editor.buffer;
      tab = editor.getTabText() || '\t';
      headings = tocConfigs.headings;
      tocOrdered_s = tocConfigs.tocOrdered_s;
      tocDepthFrom_s = tocConfigs.tocDepthFrom_s;
      tocDepthTo_s = tocConfigs.tocDepthTo_s;
      tocStartLine_s = tocConfigs.tocStartLine_s;
      tocEndLine_s = tocConfigs.tocEndLine_s;
      if (buffer) {
        i = 0;
        delta = 0;
        while (i < tocOrdered_s.length) {
          tocOrdered = tocOrdered_s[i];
          tocDepthFrom = tocDepthFrom_s[i];
          tocDepthTo = tocDepthTo_s[i];
          tocStartLine = tocStartLine_s[i] + delta;
          tocEndLine = tocEndLine_s[i] + delta;
          tocObject = toc(headings, {
            ordered: tocOrdered,
            depthFrom: tocDepthFrom,
            depthTo: tocDepthTo,
            tab: tab
          });
          buffer.setTextInRange([[tocStartLine + 1, 0], [tocEndLine, 0]], '\n\n\n');
          buffer.insert([tocStartLine + 2, 0], tocObject.content);
          delta += tocStartLine + tocObject.array.length + 3 - tocEndLine;
          markdownPreview.parseDelay = Date.now() + 500;
          markdownPreview.editorScrollDelay = Date.now() + 500;
          markdownPreview.previewScrollDelay = Date.now() + 500;
          i += 1;
        }
      }
    }
    markdownPreview.tocConfigs = tocConfigs;
    return tocNeedUpdate;
  };

  insertAnchors = function(text) {
    var createAnchor, i, line, lines, outputString;
    createAnchor = function(lineNo) {
      return "<p data-line=\"" + lineNo + "\" class=\"sync-line\" style=\"margin:0;\"></p>\n";
    };
    outputString = "";
    lines = text.split('\n');
    i = 0;
    while (i < lines.length) {
      line = lines[i];

      /*
      add anchors when it is
      1. heading
      2. image
      3. code block | chunk
      4. @import
      5. comment
       */
      if (line.match(/^(\#|\!\[|```(\w|{)|@import|\<!--)/)) {
        outputString += createAnchor(i);
      }
      if (line.match(/^```(\w|{)/)) {
        outputString += line + '\n';
        i += 1;
        while (i < lines.length) {
          line = lines[i];
          if (line.match(/^```\s*/)) {
            break;
          } else {
            outputString += line + '\n';
            i += 1;
          }
        }
      }
      outputString += line + '\n';
      i += 1;
    }
    return outputString;
  };


  /*
   * parse markdown content to html
  
  inputString:         string, required
  option = {
    useRelativeImagePath:       bool, optional
    isForPreview:         bool, optional
    isForEbook:           bool, optional
    hideFrontMatter:      bool, optional
    markdownPreview:      MarkdownPreviewEnhancedView, optional
  
    fileDirectoryPath:    string, required
                          the directory path of the markdown file.
    projectDirectoryPath: string, required
  }
  callback(data)
   */

  parseMD = function(inputString, option, callback) {
    var args, codeChunksData, finalize, frontMatterTable, graphData, html, key, markdownPreview, ref, ref1, slideConfigs, tocConfigs, tocEnabled, tocTable, yamlConfig;
    if (option == null) {
      option = {};
    }
    markdownPreview = option.markdownPreview;
    DISABLE_SYNC_LINE = !option.isForPreview;
    HEIGHTS_DELTA = [];
    tocTable = {};
    tocEnabled = false;
    tocConfigs = {
      headings: [],
      tocStartLine_s: [],
      tocEndLine_s: [],
      tocOrdered_s: [],
      tocDepthFrom_s: [],
      tocDepthTo_s: []
    };
    slideConfigs = [];
    yamlConfig = null;
    graphData = null;
    codeChunksData = null;
    if (markdownPreview) {
      if (markdownPreview.graphData) {
        graphData = {};
        for (key in markdownPreview.graphData) {
          graphData[key] = markdownPreview.graphData[key].slice(0);
        }
      }
      codeChunksData = markdownPreview.codeChunksData;
    }
    globalMathTypesettingData = {};
    if (markdownPreview) {
      globalMathTypesettingData.isForPreview = option.isForPreview;
      if (mathRenderingOption === 'KaTeX') {
        globalMathTypesettingData.katex_s = Array.prototype.slice.call(markdownPreview.getElement().getElementsByClassName('katex-exps'));
      } else if (mathRenderingOption === 'MathJax') {
        globalMathTypesettingData.mathjax_s = Array.prototype.slice.call(markdownPreview.getElement().getElementsByClassName('mathjax-exps'));
      }
    }
    ref = processFrontMatter(inputString, option.hideFrontMatter), frontMatterTable = ref.table, inputString = ref.content, yamlConfig = ref.data;
    yamlConfig = yamlConfig || {};
    if (usePandocParser && option.isForPreview) {
      inputString = insertAnchors(inputString);
    }
    ref1 = fileImport(inputString, {
      filesCache: markdownPreview != null ? markdownPreview.filesCache : void 0,
      fileDirectoryPath: option.fileDirectoryPath,
      projectDirectoryPath: option.projectDirectoryPath,
      editor: markdownPreview != null ? markdownPreview.editor : void 0
    }), inputString = ref1.outputString, HEIGHTS_DELTA = ref1.heightsDelta;
    md.renderer.rules.heading_open = (function(_this) {
      return function(tokens, idx) {
        var id, line, ref2;
        line = null;
        id = null;
        if (tokens[idx + 1] && tokens[idx + 1].content) {
          id = uslug(tokens[idx + 1].content);
          if (tocTable[id] >= 0) {
            tocTable[id] += 1;
            id = id + '-' + tocTable[id];
          } else {
            tocTable[id] = 0;
          }
          if (!(((ref2 = tokens[idx - 1]) != null ? ref2.subject : void 0) === 'untoc')) {
            tocConfigs.headings.push({
              content: tokens[idx + 1].content,
              level: tokens[idx].hLevel
            });
          }
        }
        id = id ? "id=" + id : '';
        if (tokens[idx].lines && !DISABLE_SYNC_LINE) {
          line = tokens[idx].lines[0];
          return "<h" + tokens[idx].hLevel + " class=\"sync-line\" data-line=\"" + (getRealDataLine(line)) + "\" " + id + ">";
        }
        return "<h" + tokens[idx].hLevel + " " + id + ">";
      };
    })(this);
    md.renderer.rules.custom = (function(_this) {
      return function(tokens, idx) {
        var opt, subject;
        subject = tokens[idx].subject;
        if (subject === 'pagebreak' || subject === 'newpage') {
          return '<div class="pagebreak"> </div>';
        } else if (subject === 'toc') {
          tocEnabled = true;
          tocConfigs.tocStartLine_s.push(tokens[idx].line);
          opt = tokens[idx].option;
          if (opt.orderedList && opt.orderedList !== 0) {
            tocConfigs.tocOrdered_s.push(true);
          } else {
            tocConfigs.tocOrdered_s.push(false);
          }
          tocConfigs.tocDepthFrom_s.push(opt.depthFrom || 1);
          tocConfigs.tocDepthTo_s.push(opt.depthTo || 6);
        } else if (subject === 'tocstop') {
          tocConfigs.tocEndLine_s.push(tokens[idx].line);
        } else if (subject === 'slide') {
          opt = tokens[idx].option;
          opt.line = tokens[idx].line;
          slideConfigs.push(opt);
          return '<div class="new-slide"></div>';
        }
        return '';
      };
    })(this);
    finalize = function(html) {
      if (markdownPreview && tocEnabled && updateTOC(markdownPreview, tocConfigs)) {
        return parseMD(markdownPreview.editor.getText(), option, callback);
      }
      html = resolveImagePathAndCodeBlock(html, graphData, codeChunksData, option);
      return callback({
        html: frontMatterTable + html,
        slideConfigs: slideConfigs,
        yamlConfig: yamlConfig
      });
    };
    if (usePandocParser) {
      args = yamlConfig.pandoc_args || [];
      if (!(args instanceof Array)) {
        args = [];
      }
      if (yamlConfig.bibliography || yamlConfig.references) {
        args.push('--filter', 'pandoc-citeproc');
      }
      args = atom.config.get('markdown-preview-enhanced.pandocArguments').split(',').map(function(x) {
        return x.trim();
      }).concat(args);
      return pandocRender(inputString, {
        args: args,
        projectDirectoryPath: option.projectDirectoryPath,
        fileDirectoryPath: option.fileDirectoryPath
      }, function(error, html) {
        var $;
        if (error) {
          html = "<pre>" + error + "</pre>";
        }
        $ = cheerio.load(html);
        $('pre').each(function(i, preElement) {
          var $preElement, classes, codeBlock, dataCodeChunk, lang, ref2, ref3, ref4, ref5;
          if (((ref2 = preElement.children[0]) != null ? ref2.name : void 0) === 'code') {
            $preElement = $(preElement);
            codeBlock = $(preElement).children().first();
            classes = (((ref3 = codeBlock.attr('class')) != null ? ref3.split(' ') : void 0) || []).filter(function(x) {
              return x !== 'sourceCode';
            });
            lang = classes[0];
            if ((ref4 = $preElement.attr('class')) != null ? ref4.match(/(mermaid|viz|dot|puml|plantuml|wavedrom)/) : void 0) {
              lang = $preElement.attr('class');
            }
            codeBlock.attr('class', 'language-' + lang);
            dataCodeChunk = (ref5 = $preElement.parent()) != null ? ref5.attr('data-code-chunk') : void 0;
            if (dataCodeChunk) {
              return codeBlock.attr('class', 'language-' + dataCodeChunk.unescape());
            }
          }
        });
        return finalize($.html());
      });
    } else {
      html = md.render(inputString);
      return finalize(html);
    }
  };

  module.exports = {
    parseMD: parseMD,
    buildScrollMap: buildScrollMap,
    processFrontMatter: processFrontMatter
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLFVBQUEsR0FBYSxPQUFBLENBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsWUFBakMsRUFBK0MsMkNBQS9DLENBQVI7O0VBQ1osT0FBUSxPQUFBLENBQVEsTUFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGFBQVI7O0VBRVIsYUFBYyxPQUFBLENBQVEsd0NBQVI7O0VBQ2YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNMLHVCQUF3QixPQUFBLENBQVEsb0JBQVI7O0VBQ3pCLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtCQUFSOztFQUNqQixVQUFBLEdBQWEsT0FBQSxDQUFRLHNCQUFSOztFQUNaLDJCQUE0QixPQUFBLENBQVEsdUJBQVI7O0VBQzVCLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFFakIsbUJBQUEsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtDQUFoQjs7RUFDdEIsc0JBQUEsR0FBeUI7SUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQUQsQ0FBUjtJQUFzQixLQUFBLEVBQU8sQ0FBQyxDQUFDLElBQUQsRUFBTyxJQUFQLENBQUQsQ0FBN0I7OztFQUN6Qixv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QSxDQUFTLENBQUMsQ0FBQyxJQUFGLENBQUEsQ0FBVDtNQXZCZ0ksQ0FBbEksRUFSVDtLQUFBLE1BQUE7TUFrQ0UsSUFBQSxHQUFPLEVBQUUsQ0FBQyxNQUFILENBQVUsV0FBVjtBQUVQLGFBQU8sUUFBQSxDQUFTLElBQVQsRUFwQ1Q7O0VBbEhROztFQXdKVixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFNBQUEsT0FEZTtJQUVmLGdCQUFBLGNBRmU7SUFHZixvQkFBQSxrQkFIZTs7QUF4Z0NqQiIsInNvdXJjZXNDb250ZW50IjpbImthdGV4ID0gcmVxdWlyZSAna2F0ZXgnXG5jaGVlcmlvID0gcmVxdWlyZSAnY2hlZXJpbydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbnJlbWFya2FibGUgPSByZXF1aXJlICdyZW1hcmthYmxlJ1xudXNsdWcgPSByZXF1aXJlICd1c2x1ZydcbkhpZ2hsaWdodHMgPSByZXF1aXJlKHBhdGguam9pbihhdG9tLmdldExvYWRTZXR0aW5ncygpLnJlc291cmNlUGF0aCwgJ25vZGVfbW9kdWxlcy9oaWdobGlnaHRzL2xpYi9oaWdobGlnaHRzLmpzJykpXG57RmlsZX0gPSByZXF1aXJlICdhdG9tJ1xubWF0dGVyID0gcmVxdWlyZSgnZ3JheS1tYXR0ZXInKVxuXG57bWVybWFpZEFQSX0gPSByZXF1aXJlKCcuLi9kZXBlbmRlbmNpZXMvbWVybWFpZC9tZXJtYWlkLm1pbi5qcycpXG50b2MgPSByZXF1aXJlKCcuL3RvYycpXG57c2NvcGVGb3JMYW5ndWFnZU5hbWV9ID0gcmVxdWlyZSAnLi9leHRlbnNpb24taGVscGVyJ1xuY3VzdG9tU3ViamVjdHMgPSByZXF1aXJlICcuL2N1c3RvbS1jb21tZW50J1xuZmlsZUltcG9ydCA9IHJlcXVpcmUoJy4vZmlsZS1pbXBvcnQuY29mZmVlJylcbntwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHB9ID0gcmVxdWlyZSgnLi9wcm90b2NvbHMtd2hpdGVsaXN0JylcbntwYW5kb2NSZW5kZXJ9ID0gcmVxdWlyZSgnLi9wYW5kb2MtY29udmVydCcpXG5cbm1hdGhSZW5kZXJpbmdPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicpXG5tYXRoUmVuZGVyaW5nSW5kaWNhdG9yID0gaW5saW5lOiBbWyckJywgJyQnXV0sIGJsb2NrOiBbWyckJCcsICckJCddXVxuZW5hYmxlV2lraUxpbmtTeW50YXggPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlV2lraUxpbmtTeW50YXgnKVxuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24nKVxuZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YSA9IHt9XG51c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMnKVxudXNlUGFuZG9jUGFyc2VyID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVBhbmRvY1BhcnNlcicpXG5cblRBR1NfVE9fUkVQTEFDRSA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgJ1xcJyc6ICcmI3gyNzsnLFxuICAgICdcXC8nLCAnJiN4MkY7JyxcbiAgICAnXFxcXCcsICcmI3g1QzsnLFxufVxuXG5UQUdTX1RPX1JFUExBQ0VfUkVWRVJTRSA9IHtcbiAgICAnJmFtcDsnOiAnJicsXG4gICAgJyZsdDsnOiAnPCcsXG4gICAgJyZndDsnOiAnPicsXG4gICAgJyZxdW90Oyc6ICdcIicsXG4gICAgJyZhcG9zOyc6ICdcXCcnLFxuICAgICcmI3gyNzsnOiAnXFwnJyxcbiAgICAnJiN4MkY7JzogJ1xcLycsXG4gICAgJyYjeDVDOyc6ICdcXFxcJyxcbn1cblxuaGlnaGxpZ2h0ZXIgPSBudWxsXG5TdHJpbmcucHJvdG90eXBlLmVzY2FwZSA9ICgpLT5cbiAgdGhpcy5yZXBsYWNlIC9bJjw+XCInXFwvXFxcXF0vZywgKHRhZyktPiBUQUdTX1RPX1JFUExBQ0VbdGFnXSBvciB0YWdcblxuU3RyaW5nLnByb3RvdHlwZS51bmVzY2FwZSA9ICgpLT5cbiAgdGhpcy5yZXBsYWNlIC9cXCYoYW1wfGx0fGd0fHF1b3R8YXBvc3xcXCN4Mjd8XFwjeDJGfFxcI3g1QylcXDsvZywgKHdob2xlKS0+IFRBR1NfVE9fUkVQTEFDRV9SRVZFUlNFW3dob2xlXSBvciB3aG9sZVxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIyBNZXJtYWlkXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubG9hZE1lcm1haWRDb25maWcgPSAoKS0+XG4gICMgbWVybWFpZF9jb25maWcuanNcbiAgY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL21lcm1haWRfY29uZmlnLmpzJylcbiAgdHJ5XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aClcbiAgY2F0Y2ggZXJyb3JcbiAgICBtZXJtYWlkQ29uZmlnRmlsZSA9IG5ldyBGaWxlKGNvbmZpZ1BhdGgpXG4gICAgbWVybWFpZENvbmZpZ0ZpbGUuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgaWYgIWZsYWcgIyBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIG1lcm1haWRfY29uZmlnLmpzJywgZGV0YWlsOiAndGhlcmUgbWlnaHQgYmUgZXJyb3JzIGluIHlvdXIgY29uZmlnIGZpbGUnKVxuICAgICAgICByZXR1cm5cblxuICAgICAgbWVybWFpZENvbmZpZ0ZpbGUud3JpdGUgXCJcIlwiXG4ndXNlIHN0cmljdCdcbi8vIGNvbmZpZyBtZXJtYWlkIGluaXQgY2FsbFxuLy8gaHR0cDovL2tuc3YuZ2l0aHViLmlvL21lcm1haWQvI2NvbmZpZ3VyYXRpb25cbi8vXG4vLyB5b3UgY2FuIGVkaXQgdGhlICdjb25maWcnIHZhcmlhYmxlIGJlbG93XG4vLyBldmVyeXRpbWUgeW91IGNoYW5nZWQgdGhpcyBmaWxlLCB5b3UgbWF5IG5lZWQgdG8gcmVzdGFydCBhdG9tLlxubGV0IGNvbmZpZyA9IHtcbiAgc3RhcnRPbkxvYWQ6IGZhbHNlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uZmlnIHx8IHtzdGFydE9uTG9hZDogZmFsc2V9XG5cIlwiXCJcbiAgICByZXR1cm4ge3N0YXJ0T25Mb2FkOiBmYWxzZX1cblxubWVybWFpZEFQSS5pbml0aWFsaXplKGxvYWRNZXJtYWlkQ29uZmlnKCkpXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMjIE1hdGhcbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicsXG4gIChvcHRpb24pLT5cbiAgICBpZiBvcHRpb24gPT0gJ05vbmUnXG4gICAgICBtYXRoUmVuZGVyaW5nT3B0aW9uID0gbnVsbFxuICAgIGVsc2VcbiAgICAgIG1hdGhSZW5kZXJpbmdPcHRpb24gPSBvcHRpb25cblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nSW5saW5lJyxcbiAgKGluZGljYXRvclN0ciktPlxuICAgIHRyeVxuICAgICAgaW5kaWNhdG9ycyA9IEpTT04ucGFyc2UoaW5kaWNhdG9yU3RyKS5maWx0ZXIgKHgpLT54Lmxlbmd0aCA9PSAyXG4gICAgICBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmlubGluZSA9IGluZGljYXRvcnNcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5sb2cgZXJyb3JcblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nQmxvY2snLFxuICAoaW5kaWNhdG9yU3RyKS0+XG4gICAgdHJ5XG4gICAgICBpbmRpY2F0b3JzID0gSlNPTi5wYXJzZShpbmRpY2F0b3JTdHIpLmZpbHRlciAoeCktPngubGVuZ3RoID09IDJcbiAgICAgIG1hdGhSZW5kZXJpbmdJbmRpY2F0b3IuYmxvY2sgPSBpbmRpY2F0b3JzXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGNvbnNvbGUubG9nIGVycm9yXG5cbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlV2lraUxpbmtTeW50YXgnLFxuICAoZmxhZyktPlxuICAgIGVuYWJsZVdpa2lMaW5rU3ludGF4ID0gZmxhZ1xuXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmZyb250TWF0dGVyUmVuZGVyaW5nT3B0aW9uJyxcbiAgKGZsYWcpLT5cbiAgICBmcm9udE1hdHRlclJlbmRlcmluZ09wdGlvbiA9IGZsYWdcblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC51c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzJywgKGZsYWcpLT5cbiAgdXNlU3RhbmRhcmRDb2RlRmVuY2luZ0ZvckdyYXBocyA9IGZsYWdcblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC51c2VQYW5kb2NQYXJzZXInLCAoZmxhZyktPlxuICB1c2VQYW5kb2NQYXJzZXIgPSBmbGFnXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMjIFJlbWFya2FibGVcbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmRlZmF1bHRzID1cbiAgaHRtbDogICAgICAgICB0cnVlLCAgICAgICAgIyBFbmFibGUgSFRNTCB0YWdzIGluIHNvdXJjZVxuICB4aHRtbE91dDogICAgIGZhbHNlLCAgICAgICAjIFVzZSAnLycgdG8gY2xvc2Ugc2luZ2xlIHRhZ3MgKDxiciAvPilcbiAgYnJlYWtzOiAgICAgICB0cnVlLCAgICAgICAgIyBDb252ZXJ0ICdcXG4nIGluIHBhcmFncmFwaHMgaW50byA8YnI+XG4gIGxhbmdQcmVmaXg6ICAgJ2xhbmd1YWdlLScsICMgQ1NTIGxhbmd1YWdlIHByZWZpeCBmb3IgZmVuY2VkIGJsb2Nrc1xuICBsaW5raWZ5OiAgICAgIHRydWUsICAgICAgICAjIGF1dG9jb252ZXJ0IFVSTC1saWtlIHRleHRzIHRvIGxpbmtzXG4gIGxpbmtUYXJnZXQ6ICAgJycsICAgICAgICAgICMgc2V0IHRhcmdldCB0byBvcGVuIGxpbmsgaW5cbiAgdHlwb2dyYXBoZXI6ICB0cnVlLCAgICAgICAgIyBFbmFibGUgc21hcnR5cGFudHMgYW5kIG90aGVyIHN3ZWV0IHRyYW5zZm9ybXNcblxubWQgPSBuZXcgcmVtYXJrYWJsZSgnZnVsbCcsIGRlZmF1bHRzKVxuXG5ESVNBQkxFX1NZTkNfTElORSA9IGZhbHNlXG5IRUlHSFRTX0RFTFRBID0gW10gIyBbW3JlYWxTdGFydCwgc3RhcnQsIGhlaWdodCwgYWNjXSwgLi4uXSBmb3IgaW1wb3J0IGZpbGVzXG5cbiMgZml4IGRhdGEtbGluZSBhZnRlciBpbXBvcnQgZXh0ZXJuYWwgZmlsZXNcbmdldFJlYWxEYXRhTGluZSA9IChsaW5lTm8pLT5cbiAgcmV0dXJuIGxpbmVObyBpZiAhSEVJR0hUU19ERUxUQS5sZW5ndGhcbiAgaSA9IEhFSUdIVFNfREVMVEEubGVuZ3RoIC0gMVxuICB3aGlsZSBpID49IDBcbiAgICB7cmVhbFN0YXJ0LCBzdGFydCwgaGVpZ2h0LCBhY2N9ID0gSEVJR0hUU19ERUxUQVtpXVxuICAgIGlmIGxpbmVObyA9PSBzdGFydFxuICAgICAgIyBjb25zb2xlLmxvZyhsaW5lTm8sIEhFSUdIVFNfREVMVEEsIHJlYWxTdGFydClcbiAgICAgIHJldHVybiByZWFsU3RhcnRcbiAgICBlbHNlIGlmIGxpbmVObyA+IHN0YXJ0XG4gICAgICBpZiBsaW5lTm8gPCBzdGFydCArIGhlaWdodCAjIGltcG9ydGVkIGNvbnRlbnRcbiAgICAgICAgIyBjb25zb2xlLmxvZyhsaW5lTm8sIEhFSUdIVFNfREVMVEEsIHJlYWxTdGFydClcbiAgICAgICAgcmV0dXJuIHJlYWxTdGFydFxuICAgICAgZWxzZVxuICAgICAgICAjIGNvbnNvbGUubG9nKGxpbmVObywgSEVJR0hUU19ERUxUQSwgbGluZU5vIC0gYWNjIC0gaGVpZ2h0ICsgaSArIDEpXG4gICAgICAgIHJldHVybiBsaW5lTm8gLSBhY2MgLSBoZWlnaHQgKyBpICsgMVxuICAgIGkgLT0gMVxuICByZXR1cm4gbGluZU5vXG5cblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5icmVha09uU2luZ2xlTmV3bGluZScsXG4gIChicmVha09uU2luZ2xlTmV3bGluZSktPlxuICAgIG1kLnNldCh7YnJlYWtzOiBicmVha09uU2luZ2xlTmV3bGluZX0pXG5cbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlVHlwb2dyYXBoZXInLCAoZW5hYmxlVHlwb2dyYXBoZXIpLT5cbiAgbWQuc2V0KHt0eXBvZ3JhcGhlcjogZW5hYmxlVHlwb2dyYXBoZXJ9KVxuXG5cbiMgaW5saW5lIE1BVEggcnVsZVxuIyAkLi4uJFxuIyAkJC4uLiQkXG5tZC5pbmxpbmUucnVsZXIuYmVmb3JlICdlc2NhcGUnLCAnbWF0aCcsXG4gIChzdGF0ZSwgc2lsZW50KS0+XG4gICAgaWYgIW1hdGhSZW5kZXJpbmdPcHRpb25cbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgb3BlblRhZyA9IG51bGxcbiAgICBjbG9zZVRhZyA9IG51bGxcbiAgICBkaXNwbGF5TW9kZSA9IHRydWVcbiAgICBpbmxpbmUgPSBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmlubGluZVxuICAgIGJsb2NrID0gbWF0aFJlbmRlcmluZ0luZGljYXRvci5ibG9ja1xuXG4gICAgZm9yIGIgaW4gYmxvY2tcbiAgICAgIGlmIHN0YXRlLnNyYy5zdGFydHNXaXRoKGJbMF0sIHN0YXRlLnBvcylcbiAgICAgICAgb3BlblRhZyA9IGJbMF1cbiAgICAgICAgY2xvc2VUYWcgPSBiWzFdXG4gICAgICAgIGRpc3BsYXlNb2RlID0gdHJ1ZVxuICAgICAgICBicmVha1xuXG4gICAgaWYgIW9wZW5UYWdcbiAgICAgIGZvciBpIGluIGlubGluZVxuICAgICAgICBpZiBzdGF0ZS5zcmMuc3RhcnRzV2l0aChpWzBdLCBzdGF0ZS5wb3MpXG4gICAgICAgICAgb3BlblRhZyA9IGlbMF1cbiAgICAgICAgICBjbG9zZVRhZyA9IGlbMV1cbiAgICAgICAgICBkaXNwbGF5TW9kZSA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcblxuICAgIGlmICFvcGVuVGFnXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNvbnRlbnQgPSBudWxsXG4gICAgZW5kID0gLTFcblxuICAgIGkgPSBzdGF0ZS5wb3MgKyBvcGVuVGFnLmxlbmd0aFxuICAgIHdoaWxlIGkgPCBzdGF0ZS5zcmMubGVuZ3RoXG4gICAgICBpZiBzdGF0ZS5zcmMuc3RhcnRzV2l0aChjbG9zZVRhZywgaSlcbiAgICAgICAgZW5kID0gaVxuICAgICAgICBicmVha1xuICAgICAgZWxzZSBpZiBzdGF0ZS5zcmNbaV0gPT0gJ1xcXFwnXG4gICAgICAgIGkgKz0gMVxuICAgICAgaSArPSAxXG5cbiAgICBpZiBlbmQgPj0gMFxuICAgICAgY29udGVudCA9IHN0YXRlLnNyYy5zbGljZShzdGF0ZS5wb3MgKyBvcGVuVGFnLmxlbmd0aCwgZW5kKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWYgY29udGVudCBhbmQgIXNpbGVudFxuICAgICAgc3RhdGUucHVzaFxuICAgICAgICB0eXBlOiAnbWF0aCdcbiAgICAgICAgY29udGVudDogY29udGVudC50cmltKCksXG4gICAgICAgIG9wZW5UYWc6IG9wZW5UYWdcbiAgICAgICAgY2xvc2VUYWc6IGNsb3NlVGFnXG4gICAgICAgIGRpc3BsYXlNb2RlOiBkaXNwbGF5TW9kZVxuXG4gICAgICBzdGF0ZS5wb3MgKz0gKGNvbnRlbnQubGVuZ3RoICsgb3BlblRhZy5sZW5ndGggKyBjbG9zZVRhZy5sZW5ndGgpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuXG5wYXJzZU1hdGggPSAoe2NvbnRlbnQsIG9wZW5UYWcsIGNsb3NlVGFnLCBkaXNwbGF5TW9kZX0pLT5cbiAgcmV0dXJuIGlmICFjb250ZW50XG4gIGlmIG1hdGhSZW5kZXJpbmdPcHRpb24gPT0gJ0thVGVYJ1xuICAgIGlmIGdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEuaXNGb3JQcmV2aWV3XG4gICAgICBkaXNwbGF5TW9kZUF0dHIgPSBpZiBkaXNwbGF5TW9kZSB0aGVuICdkaXNwbGF5LW1vZGUnIGVsc2UgJydcbiAgICAgIGlmICFnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLmthdGV4X3MubGVuZ3RoXG4gICAgICAgIHJldHVybiBcIjxzcGFuIGNsYXNzPSdrYXRleC1leHBzJyAje2Rpc3BsYXlNb2RlQXR0cn0+I3tjb250ZW50LmVzY2FwZSgpfTwvc3Bhbj5cIlxuICAgICAgZWxzZVxuICAgICAgICBlbGVtZW50ID0gZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5rYXRleF9zLnNwbGljZSgwLCAxKVswXVxuICAgICAgICBpZiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbCcpID09IGNvbnRlbnQgYW5kIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkaXNwbGF5LW1vZGUnKSA9PSBkaXNwbGF5TW9kZVxuICAgICAgICAgIHJldHVybiBcIjxzcGFuIGNsYXNzPSdrYXRleC1leHBzJyBkYXRhLW9yaWdpbmFsPVxcXCIje2NvbnRlbnR9XFxcIiBkYXRhLXByb2Nlc3NlZCAje2Rpc3BsYXlNb2RlQXR0cn0+I3tlbGVtZW50LmlubmVySFRNTH08L3NwYW4+XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBcIjxzcGFuIGNsYXNzPSdrYXRleC1leHBzJyAje2Rpc3BsYXlNb2RlQXR0cn0+I3tjb250ZW50LmVzY2FwZSgpfTwvc3Bhbj5cIlxuXG4gICAgZWxzZSAjIG5vdCBmb3IgcHJldmlld1xuICAgICAgdHJ5XG4gICAgICAgIHJldHVybiBrYXRleC5yZW5kZXJUb1N0cmluZyBjb250ZW50LCB7ZGlzcGxheU1vZGV9XG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm4gXCI8c3BhbiBzdHlsZT1cXFwiY29sb3I6ICNlZTdmNDk7IGZvbnQtd2VpZ2h0OiA1MDA7XFxcIj4je2Vycm9yfTwvc3Bhbj5cIlxuXG4gIGVsc2UgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTWF0aEpheCdcbiAgICB0ZXh0ID0gKG9wZW5UYWcgKyBjb250ZW50ICsgY2xvc2VUYWcpLnJlcGxhY2UoL1xcbi9nLCAnJylcbiAgICB0YWcgPSBpZiBkaXNwbGF5TW9kZSB0aGVuICdkaXYnIGVsc2UgJ3NwYW4nXG5cbiAgICAjIGlmIGl0J3MgZm9yIHByZXZpZXdcbiAgICAjIHdlIG5lZWQgdG8gc2F2ZSB0aGUgbWF0aCBleHByZXNzaW9uIGRhdGEgdG8gJ2RhdGEtb3JpZ2luYWwnIGF0dHJpYnV0ZVxuICAgICMgdGhlbiB3ZSBjb21wYXJlZCBpdCB3aXRoIHRleHQgdG8gc2VlIHdoZXRoZXIgdGhlIG1hdGggZXhwcmVzc2lvbiBpcyBtb2RpZmllZCBvciBub3QuXG4gICAgaWYgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5pc0ZvclByZXZpZXdcbiAgICAgIGlmICFnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLm1hdGhqYXhfcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIFwiPCN7dGFnfSBjbGFzcz1cXFwibWF0aGpheC1leHBzXFxcIj4je3RleHQuZXNjYXBlKCl9PC8je3RhZ30+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgZWxlbWVudCA9IGdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEubWF0aGpheF9zLnNwbGljZSgwLCAxKVswXVxuICAgICAgICBpZiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbCcpID09IHRleHQgYW5kIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IHRhZyBhbmQgZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgICMgbWF0aCBleHByZXNzaW9uIG5vdCBjaGFuZ2VkXG4gICAgICAgICAgcmV0dXJuIFwiPCN7dGFnfSBjbGFzcz1cXFwibWF0aGpheC1leHBzXFxcIiBkYXRhLW9yaWdpbmFsPVxcXCIje3RleHR9XFxcIiBkYXRhLXByb2Nlc3NlZD4je2VsZW1lbnQuaW5uZXJIVE1MfTwvI3t0YWd9PlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gXCI8I3t0YWd9IGNsYXNzPVxcXCJtYXRoamF4LWV4cHNcXFwiPiN7dGV4dC5lc2NhcGUoKX08LyN7dGFnfT5cIlxuICAgIGVsc2VcbiAgICAgICMjIHRoaXMgZG9lc24ndCB3b3JrXG4gICAgICAjIGVsZW1lbnQgPSBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLm1hdGhqYXhfcy5zcGxpY2UoMCwgMSlbMF1cbiAgICAgICMgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwibWF0aGpheC1leHBzXFxcIj4gI3tlbGVtZW50LmlubmVySFRNTH0gPC9kaXY+XCJcbiAgICAgIHJldHVybiB0ZXh0LmVzY2FwZSgpXG5cbm1kLnJlbmRlcmVyLnJ1bGVzLm1hdGggPSAodG9rZW5zLCBpZHgpLT5cbiAgcmV0dXJuIHBhcnNlTWF0aCh0b2tlbnNbaWR4XSBvciB7fSlcblxuIyBpbmxpbmUgW1tdXSBydWxlXG4jIFtbLi4uXV1cbm1kLmlubGluZS5ydWxlci5iZWZvcmUgJ2F1dG9saW5rJywgJ3dpa2lsaW5rJyxcbiAgKHN0YXRlLCBzaWxlbnQpLT5cbiAgICBpZiAhZW5hYmxlV2lraUxpbmtTeW50YXggb3IgIXN0YXRlLnNyYy5zdGFydHNXaXRoKCdbWycsIHN0YXRlLnBvcylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNvbnRlbnQgPSBudWxsXG4gICAgdGFnID0gJ11dJ1xuICAgIGVuZCA9IC0xXG5cbiAgICBpID0gc3RhdGUucG9zICsgdGFnLmxlbmd0aFxuICAgIHdoaWxlIGkgPCBzdGF0ZS5zcmMubGVuZ3RoXG4gICAgICBpZiBzdGF0ZS5zcmNbaV0gPT0gJ1xcXFwnXG4gICAgICAgIGkrPTFcbiAgICAgIGVsc2UgaWYgc3RhdGUuc3JjLnN0YXJ0c1dpdGgodGFnLCBpKVxuICAgICAgICBlbmQgPSBpXG4gICAgICAgIGJyZWFrXG4gICAgICBpKz0xXG5cbiAgICBpZiBlbmQgPj0gMCAjIGZvdW5kIF1dXG4gICAgICBjb250ZW50ID0gc3RhdGUuc3JjLnNsaWNlKHN0YXRlLnBvcyArIHRhZy5sZW5ndGgsIGVuZClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIGNvbnRlbnQgYW5kICFzaWxlbnRcbiAgICAgIHN0YXRlLnB1c2hcbiAgICAgICAgdHlwZTogJ3dpa2lsaW5rJ1xuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICBzdGF0ZS5wb3MgKz0gY29udGVudC5sZW5ndGggKyAyICogdGFnLmxlbmd0aFxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcblxubWQucmVuZGVyZXIucnVsZXMud2lraWxpbmsgPSAodG9rZW5zLCBpZHgpLT5cbiAge2NvbnRlbnR9ID0gdG9rZW5zW2lkeF1cbiAgaWYgIWNvbnRlbnRcbiAgICByZXR1cm5cblxuICBzcGxpdHMgPSBjb250ZW50LnNwbGl0KCd8JylcbiAgbGlua1RleHQgPSBzcGxpdHNbMF0udHJpbSgpXG4gIHdpa2lMaW5rID0gaWYgc3BsaXRzLmxlbmd0aCA9PSAyIHRoZW4gXCIje3NwbGl0c1sxXS50cmltKCl9Lm1kXCIgZWxzZSBcIiN7bGlua1RleHR9Lm1kXCIgIyBvbmx5IHN1cHBvcnQgLm1kIGZpbGUgZXh0ZW5zaW9uXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI3t3aWtpTGlua31cXFwiPiN7bGlua1RleHR9PC9hPlwiXG5cbiMgY3VzdG9tIGNvbW1lbnRcbm1kLmJsb2NrLnJ1bGVyLmJlZm9yZSAnY29kZScsICdjdXN0b20tY29tbWVudCcsXG4gIChzdGF0ZSwgc3RhcnQsIGVuZCwgc2lsZW50KS0+XG4gICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0XSArIHN0YXRlLnRTaGlmdFtzdGFydF1cbiAgICBtYXggPSBzdGF0ZS5lTWFya3Nbc3RhcnRdXG4gICAgaWYgcG9zID49IG1heFxuICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIHN0YXRlLnNyYy5zdGFydHNXaXRoKCc8IS0tJywgcG9zKVxuICAgICAgZW5kID0gc3RhdGUuc3JjLmluZGV4T2YoJy0tPicsIHBvcyArIDQpXG4gICAgICBpZiAoZW5kID49IDApXG4gICAgICAgIGNvbnRlbnQgPSBzdGF0ZS5zcmMuc2xpY2UocG9zICsgNCwgZW5kKS50cmltKClcblxuICAgICAgICBtYXRjaCA9IGNvbnRlbnQubWF0Y2goLyhcXHN8XFxuKS8pICMgZmluZCAnICcgb3IgJ1xcbidcbiAgICAgICAgaWYgIW1hdGNoXG4gICAgICAgICAgZmlyc3RJbmRleE9mU3BhY2UgPSBjb250ZW50Lmxlbmd0aFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlyc3RJbmRleE9mU3BhY2UgPSBtYXRjaC5pbmRleFxuXG4gICAgICAgIHN1YmplY3QgPSBjb250ZW50LnNsaWNlKDAsIGZpcnN0SW5kZXhPZlNwYWNlKVxuXG4gICAgICAgIGlmICFjdXN0b21TdWJqZWN0c1tzdWJqZWN0XSAjIGNoZWNrIGlmIGl0IGlzIGEgdmFsaWQgc3ViamVjdFxuICAgICAgICAgICMgaXQncyBub3QgYSB2YWxpZCBzdWJqZWN0LCB0aGVyZWZvcmUgZXNjYXBlIGl0XG4gICAgICAgICAgc3RhdGUubGluZSA9IHN0YXJ0ICsgMSArIChzdGF0ZS5zcmMuc2xpY2UocG9zICsgNCwgZW5kKS5tYXRjaCgvXFxuL2cpfHxbXSkubGVuZ3RoXG4gICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICByZXN0ID0gY29udGVudC5zbGljZShmaXJzdEluZGV4T2ZTcGFjZSsxKS50cmltKClcblxuICAgICAgICBtYXRjaCA9IHJlc3QubWF0Y2goLyg/OlteXFxzXFxuOlwiJ10rfFwiW15cIl0qXCJ8J1teJ10qJykrL2cpICMgc3BsaXQgYnkgc3BhY2UgYW5kIFxcbmV3bGluZSBhbmQgOiAobm90IGluIHNpbmdsZSBhbmQgZG91YmxlIHF1b3RlenopXG5cbiAgICAgICAgaWYgbWF0Y2ggYW5kIG1hdGNoLmxlbmd0aCAlIDIgPT0gMFxuICAgICAgICAgIG9wdGlvbiA9IHt9XG4gICAgICAgICAgaSA9IDBcbiAgICAgICAgICB3aGlsZSBpIDwgbWF0Y2gubGVuZ3RoXG4gICAgICAgICAgICBrZXkgPSBtYXRjaFtpXVxuICAgICAgICAgICAgdmFsdWUgPSBtYXRjaFtpKzFdXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgb3B0aW9uW2tleV0gPSBKU09OLnBhcnNlKHZhbHVlKVxuICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICBudWxsICMgZG8gbm90aGluZ1xuICAgICAgICAgICAgaSArPSAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcHRpb24gPSB7fVxuXG4gICAgICAgIHN0YXRlLnRva2Vucy5wdXNoXG4gICAgICAgICAgdHlwZTogJ2N1c3RvbSdcbiAgICAgICAgICBzdWJqZWN0OiBzdWJqZWN0XG4gICAgICAgICAgbGluZTogZ2V0UmVhbERhdGFMaW5lKHN0YXRlLmxpbmUpXG4gICAgICAgICAgb3B0aW9uOiBvcHRpb25cblxuICAgICAgICBzdGF0ZS5saW5lID0gc3RhcnQgKyAxICsgKHN0YXRlLnNyYy5zbGljZShwb3MgKyA0LCBlbmQpLm1hdGNoKC9cXG4vZyl8fFtdKS5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiNcbiMgSW5qZWN0IGxpbmUgbnVtYmVycyBmb3Igc3luYyBzY3JvbGwuIE5vdGVzOlxuI1xuIyAtIFdlIHRyYWNrIG9ubHkgaGVhZGluZ3MgYW5kIHBhcmFncmFwaHMgb24gZmlyc3QgbGV2ZWwuIFRoYXQncyBlbm91Z3RoLlxuIyAtIEZvb3Rub3RlcyBjb250ZW50IGNhdXNlcyBqdW1wcy4gTGV2ZWwgbGltaXQgZmlsdGVyIGl0IGF1dG9tYXRpY2FsbHkuXG4jXG4jIFlJWUkgOiDov5nph4zmiJHkuI3ku4Xku4UgbWFwIOS6hiBsZXZlbCAwXG5tZC5yZW5kZXJlci5ydWxlcy5wYXJhZ3JhcGhfb3BlbiA9ICh0b2tlbnMsIGlkeCktPlxuICBsaW5lTm8gPSBudWxsXG4gIGlmIHRva2Vuc1tpZHhdLmxpbmVzIGFuZCAhRElTQUJMRV9TWU5DX0xJTkUgIyAvKiYmIHRva2Vuc1tpZHhdLmxldmVsID09IDAqLylcbiAgICBsaW5lTm8gPSB0b2tlbnNbaWR4XS5saW5lc1swXVxuICAgIHJldHVybiAnPHAgY2xhc3M9XCJzeW5jLWxpbmVcIiBkYXRhLWxpbmU9XCInICsgZ2V0UmVhbERhdGFMaW5lKGxpbmVObykgKyAnXCI+J1xuICByZXR1cm4gJzxwPidcblxuXG4jIHRhc2sgbGlzdFxubWQucmVuZGVyZXIucnVsZXMubGlzdF9pdGVtX29wZW4gPSAodG9rZW5zLCBpZHgpLT5cbiAgaWYgdG9rZW5zW2lkeCArIDJdXG4gICAgY2hpbGRyZW4gPSB0b2tlbnNbaWR4ICsgMl0uY2hpbGRyZW5cbiAgICBpZiAhY2hpbGRyZW4gb3IgIWNoaWxkcmVuWzBdPy5jb250ZW50XG4gICAgICByZXR1cm4gJzxsaT4nXG4gICAgbGluZSA9IGNoaWxkcmVuWzBdLmNvbnRlbnRcbiAgICBpZiBsaW5lLnN0YXJ0c1dpdGgoJ1sgXSAnKSBvciBsaW5lLnN0YXJ0c1dpdGgoJ1t4XSAnKSBvciBsaW5lLnN0YXJ0c1dpdGgoJ1tYXSAnKVxuICAgICAgY2hpbGRyZW5bMF0uY29udGVudCA9IGxpbmUuc2xpY2UoMylcbiAgICAgIGNoZWNrZWQgPSAhKGxpbmVbMV0gPT0gJyAnKVxuICAgICAgY2hlY2tCb3ggPSBcIjxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCIgY2xhc3M9XFxcInRhc2stbGlzdC1pdGVtLWNoZWNrYm94XFxcIiAje2lmIGNoZWNrZWQgdGhlbiAnY2hlY2tlZCcgZWxzZSAnJ30+XCJcbiAgICAgIGxldmVsID0gY2hpbGRyZW5bMF0ubGV2ZWxcbiAgICAgICMgY2hpbGRyZW4gPSBbe2NvbnRlbnQ6IGNoZWNrQm94LCB0eXBlOiAnaHRtbHRhZycsIGxldmVsfSwgLi4uY2hpbGRyZW5dXG4gICAgICBjaGlsZHJlbiA9IFt7Y29udGVudDogY2hlY2tCb3gsIHR5cGU6ICdodG1sdGFnJywgbGV2ZWx9XS5jb25jYXQoY2hpbGRyZW4pXG5cbiAgICAgIHRva2Vuc1tpZHggKyAyXS5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgICByZXR1cm4gJzxsaSBjbGFzcz1cInRhc2stbGlzdC1pdGVtXCI+J1xuICAgIHJldHVybiAnPGxpPidcbiAgZWxzZVxuICAgIHJldHVybiAnPGxpPidcblxuIyBjb2RlIGZlbmNlc1xuIyBtb2RpZmllZCB0byBzdXBwb3J0IGNvZGUgY2h1bmtcbiMgY2hlY2sgaHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcmVtYXJrYWJsZS9ibG9iLzg3NTU1NGFlZGI4NGM5ZGQxOTBkZThkMGI4NmM2NWQyNTcyZWFkZDUvbGliL3J1bGVzLmpzXG5tZC5yZW5kZXJlci5ydWxlcy5mZW5jZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBpbnN0YW5jZSktPlxuICB0b2tlbiA9IHRva2Vuc1tpZHhdXG4gIGxhbmdDbGFzcyA9ICcnXG4gIGxhbmdQcmVmaXggPSBvcHRpb25zLmxhbmdQcmVmaXhcbiAgbGluZVN0ciA9ICcnXG4gIGxhbmdOYW1lID0gdG9rZW4ucGFyYW1zLmVzY2FwZSgpXG5cbiAgaWYgdG9rZW4ucGFyYW1zXG4gICAgbGFuZ0NsYXNzID0gJyBjbGFzcz1cIicgKyBsYW5nUHJlZml4ICsgbGFuZ05hbWUgKyAnXCIgJztcblxuICBpZiB0b2tlbi5saW5lc1xuICAgIGxpbmVTdHIgPSBcIiBkYXRhLWxpbmU9XFxcIiN7Z2V0UmVhbERhdGFMaW5lKHRva2VuLmxpbmVzWzBdKX1cXFwiIFwiXG5cbiAgIyBnZXQgY29kZSBjb250ZW50XG4gIGNvbnRlbnQgPSB0b2tlbi5jb250ZW50LmVzY2FwZSgpXG5cbiAgIyBjb3BpZWQgZnJvbSBnZXRCcmVhayBmdW5jdGlvbi5cbiAgYnJlYWtfID0gJ1xcbidcbiAgaWYgaWR4IDwgdG9rZW5zLmxlbmd0aCAmJiB0b2tlbnNbaWR4XS50eXBlID09ICdsaXN0X2l0ZW1fY2xvc2UnXG4gICAgYnJlYWtfID0gJydcblxuICBpZiBsYW5nTmFtZSA9PSAnbWF0aCdcbiAgICBvcGVuVGFnID0gbWF0aFJlbmRlcmluZ0luZGljYXRvci5ibG9ja1swXVswXSBvciAnJCQnXG4gICAgY2xvc2VUYWcgPSBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmJsb2NrWzBdWzFdIG9yICckJCdcbiAgICBtYXRoSHRtbCA9IHBhcnNlTWF0aCh7b3BlblRhZywgY2xvc2VUYWcsIGNvbnRlbnQsIGRpc3BsYXlNb2RlOiB0cnVlfSlcbiAgICByZXR1cm4gXCI8cCAje2xpbmVTdHJ9PiN7bWF0aEh0bWx9PC9wPlwiXG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlJyArIGxhbmdDbGFzcyArIGxpbmVTdHIgKyAnPicgKyBjb250ZW50ICsgJzwvY29kZT48L3ByZT4nICsgYnJlYWtfXG5cbiMgQnVpbGQgb2Zmc2V0cyBmb3IgZWFjaCBsaW5lIChsaW5lcyBjYW4gYmUgd3JhcHBlZClcbiMgVGhhdCdzIGEgYml0IGRpcnR5IHRvIHByb2Nlc3MgZWFjaCBsaW5lIGV2ZXJ5dGltZSwgYnV0IG9rIGZvciBkZW1vLlxuIyBPcHRpbWl6YXRpb25zIGFyZSByZXF1aXJlZCBvbmx5IGZvciBiaWcgdGV4dHMuXG5idWlsZFNjcm9sbE1hcCA9IChtYXJrZG93blByZXZpZXcpLT5cbiAgZWRpdG9yID0gbWFya2Rvd25QcmV2aWV3LmVkaXRvclxuICBtYXJrZG93bkh0bWxWaWV3ID0gbWFya2Rvd25QcmV2aWV3LmdldEVsZW1lbnQoKVxuICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG5cbiAgX3Njcm9sbE1hcCA9IFtdXG4gIG5vbkVtcHR5TGlzdCA9IFtdXG5cbiAgYWNjID0gMFxuXG4gIGxpbmVzQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcblxuICBmb3IgaSBpbiBbMC4uLmxpbmVzQ291bnRdXG4gICAgX3Njcm9sbE1hcC5wdXNoKC0xKVxuXG4gIG5vbkVtcHR5TGlzdC5wdXNoKDApXG4gIF9zY3JvbGxNYXBbMF0gPSAwXG5cbiAgIyDmiormnInmoIforrAgZGF0YS1saW5lIOeahCBlbGVtZW50IOeahCBvZmZzZXRUb3Ag6K6w5b2V5YiwIF9zY3JvbGxNYXBcbiAgIyB3cml0ZSBkb3duIHRoZSBvZmZzZXRUb3Agb2YgZWxlbWVudCB0aGF0IGhhcyAnZGF0YS1saW5lJyBwcm9wZXJ0eSB0byBfc2Nyb2xsTWFwXG4gIGxpbmVFbGVtZW50cyA9IG1hcmtkb3duSHRtbFZpZXcuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc3luYy1saW5lJylcblxuICBmb3IgaSBpbiBbMC4uLmxpbmVFbGVtZW50cy5sZW5ndGhdXG4gICAgZWwgPSBsaW5lRWxlbWVudHNbaV1cbiAgICB0ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWxpbmUnKVxuICAgIGNvbnRpbnVlIGlmICF0XG5cbiAgICB0ID0gZWRpdG9yLnNjcmVlblJvd0ZvckJ1ZmZlclJvdyhwYXJzZUludCh0KSkgIyBnZXQgc2NyZWVuIGJ1ZmZlciByb3dcblxuICAgIGNvbnRpbnVlIGlmICF0XG5cbiAgICAjIHRoaXMgaXMgZm9yIGlnbm9yaW5nIGZvb3Rub3RlIHNjcm9sbCBtYXRjaFxuICAgIGlmIHQgPCBub25FbXB0eUxpc3Rbbm9uRW1wdHlMaXN0Lmxlbmd0aCAtIDFdXG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGluZScpXG4gICAgZWxzZVxuICAgICAgbm9uRW1wdHlMaXN0LnB1c2godClcblxuICAgICAgb2Zmc2V0VG9wID0gMFxuICAgICAgd2hpbGUgZWwgYW5kIGVsICE9IG1hcmtkb3duSHRtbFZpZXdcbiAgICAgICAgb2Zmc2V0VG9wICs9IGVsLm9mZnNldFRvcFxuICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudFxuXG4gICAgICBfc2Nyb2xsTWFwW3RdID0gTWF0aC5yb3VuZChvZmZzZXRUb3ApXG5cbiAgbm9uRW1wdHlMaXN0LnB1c2gobGluZXNDb3VudClcbiAgX3Njcm9sbE1hcC5wdXNoKG1hcmtkb3duSHRtbFZpZXcuc2Nyb2xsSGVpZ2h0KVxuXG4gIHBvcyA9IDBcbiAgZm9yIGkgaW4gWzEuLi5saW5lc0NvdW50XVxuICAgIGlmIF9zY3JvbGxNYXBbaV0gIT0gLTFcbiAgICAgIHBvcysrXG4gICAgICBjb250aW51ZVxuXG4gICAgYSA9IG5vbkVtcHR5TGlzdFtwb3NdXG4gICAgYiA9IG5vbkVtcHR5TGlzdFtwb3MgKyAxXVxuICAgIF9zY3JvbGxNYXBbaV0gPSBNYXRoLnJvdW5kKChfc2Nyb2xsTWFwW2JdICogKGkgLSBhKSArIF9zY3JvbGxNYXBbYV0gKiAoYiAtIGkpKSAvIChiIC0gYSkpXG5cbiAgcmV0dXJuIF9zY3JvbGxNYXAgICMgc2Nyb2xsTWFwJ3MgbGVuZ3RoID09IHNjcmVlbkxpbmVDb3VudFxuXG4jIGdyYXBoVHlwZSA9ICdtZXJtYWlkJyB8ICdwbGFudHVtbCcgfCAnd2F2ZWRyb20nXG5jaGVja0dyYXBoID0gKGdyYXBoVHlwZSwgZ3JhcGhBcnJheT1bXSwgcHJlRWxlbWVudCwgdGV4dCwgb3B0aW9uLCAkLCBvZmZzZXQ9LTEpLT5cbiAgaWYgb3B0aW9uLmlzRm9yUHJldmlld1xuICAgICRwcmVFbGVtZW50ID0gJChwcmVFbGVtZW50KVxuICAgIGlmICFncmFwaEFycmF5Lmxlbmd0aFxuICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtb2Zmc2V0PVxcXCIje29mZnNldH1cXFwiPiN7dGV4dH08L2Rpdj5cIilcbiAgICAgICRlbC5hdHRyICdkYXRhLW9yaWdpbmFsJywgdGV4dFxuXG4gICAgICAkcHJlRWxlbWVudC5yZXBsYWNlV2l0aCAkZWxcbiAgICBlbHNlXG4gICAgICBlbGVtZW50ID0gZ3JhcGhBcnJheS5zcGxpY2UoMCwgMSlbMF0gIyBnZXQgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgIGlmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykgPT0gdGV4dCBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgPT0gJ3RydWUnICMgZ3JhcGggbm90IGNoYW5nZWRcbiAgICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtcHJvY2Vzc2VkPVxcXCJ0cnVlXFxcIiBkYXRhLW9mZnNldD1cXFwiI3tvZmZzZXR9XFxcIj4je2VsZW1lbnQuaW5uZXJIVE1MfTwvZGl2PlwiKVxuICAgICAgICAkZWwuYXR0ciAnZGF0YS1vcmlnaW5hbCcsIHRleHRcblxuICAgICAgICAkcHJlRWxlbWVudC5yZXBsYWNlV2l0aCAkZWxcbiAgICAgIGVsc2VcbiAgICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtb2Zmc2V0PVxcXCIje29mZnNldH1cXFwiPiN7dGV4dH08L2Rpdj5cIilcbiAgICAgICAgJGVsLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0ZXh0KVxuXG4gICAgICAgICRwcmVFbGVtZW50LnJlcGxhY2VXaXRoICRlbFxuICBlbHNlIGlmIG9wdGlvbi5pc0ZvckVib29rXG4gICAgIyMjIGRvZXNuJ3Qgd29yay4uLlxuICAgIGlmIGdyYXBoVHlwZSA9PSAndml6J1xuICAgICAgVml6ID0gcmVxdWlyZSgnLi4vZGVwZW5kZW5jaWVzL3Zpei92aXouanMnKVxuICAgICAgJGVsID0gJChcIjxkaXY+PC9kaXY+XCIpXG4gICAgICAkZWwuaHRtbChWaXoodGV4dCkpXG4gICAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoICRlbFxuICAgIGVsc2VcbiAgICAgICQocHJlRWxlbWVudCkucmVwbGFjZVdpdGggXCI8cHJlPkdyYXBoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRUJvb2s8L3ByZT5cIlxuICAgICMjI1xuICAgICRlbCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCIje2dyYXBoVHlwZX0gbXBlLWdyYXBoXFxcIiAje2lmIGdyYXBoVHlwZSBpbiBbJ3dhdmVkcm9tJywgJ21lcm1haWQnXSB0aGVuIFwiZGF0YS1vZmZzZXQ9XFxcIiN7b2Zmc2V0fVxcXCJcIiBlbHNlICcnfT5HcmFwaCBpcyBub3Qgc3VwcG9ydGVkIGluIEVCb29rPC9kaXY+XCIpXG4gICAgJGVsLmF0dHIgJ2RhdGEtb3JpZ2luYWwnLCB0ZXh0XG5cbiAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoICRlbFxuICBlbHNlXG4gICAgZWxlbWVudCA9IGdyYXBoQXJyYXkuc3BsaWNlKDAsIDEpWzBdXG4gICAgaWYgZWxlbWVudFxuICAgICAgJChwcmVFbGVtZW50KS5yZXBsYWNlV2l0aCBcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiPiN7ZWxlbWVudC5pbm5lckhUTUx9PC9kaXY+XCJcbiAgICBlbHNlXG4gICAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoIFwiPHByZT5wbGVhc2Ugd2FpdCB0aWxsIHByZXZpZXcgZmluaXNoZXMgcmVuZGVyaW5nIGdyYXBoIDwvcHJlPlwiXG5cbiMgcmVzb2x2ZSBpbWFnZSBwYXRoIGFuZCBwcmUgY29kZSBibG9jay4uLlxuIyBjaGVjayBwYXJzZU1EIGZ1bmN0aW9uLCAnb3B0aW9uJyBpcyB0aGUgc2FtZSBhcyB0aGUgb3B0aW9uIGluIHBhc2VNRC5cbnJlc29sdmVJbWFnZVBhdGhBbmRDb2RlQmxvY2sgPSAoaHRtbCwgZ3JhcGhEYXRhPXt9LCBjb2RlQ2h1bmtzRGF0YT17fSwgIG9wdGlvbj17fSktPlxuICB7ZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRofSA9IG9wdGlvblxuXG4gIGlmICFmaWxlRGlyZWN0b3J5UGF0aFxuICAgIHJldHVyblxuXG4gICQgPSBjaGVlcmlvLmxvYWQoaHRtbClcbiAgd2F2ZWRyb21PZmZzZXQgPSAwXG4gIG1lcm1haWRPZmZzZXQgPSAwXG5cbiAgJCgnaW1nLCBhJykuZWFjaCAoaSwgaW1nRWxlbWVudCktPlxuICAgIHNyY1RhZyA9ICdzcmMnXG4gICAgaWYgaW1nRWxlbWVudC5uYW1lID09ICdhJ1xuICAgICAgc3JjVGFnID0gJ2hyZWYnXG5cbiAgICBpbWcgPSAkKGltZ0VsZW1lbnQpXG4gICAgc3JjID0gaW1nLmF0dHIoc3JjVGFnKVxuXG4gICAgaWYgc3JjIGFuZFxuICAgICAgKCEoc3JjLm1hdGNoKHByb3RvY29sc1doaXRlTGlzdFJlZ0V4cCkgb3JcbiAgICAgICAgc3JjLnN0YXJ0c1dpdGgoJ2RhdGE6aW1hZ2UvJykgb3JcbiAgICAgICAgc3JjWzBdID09ICcjJyBvclxuICAgICAgICBzcmNbMF0gPT0gJy8nKSlcbiAgICAgIGlmICFvcHRpb24udXNlUmVsYXRpdmVJbWFnZVBhdGhcbiAgICAgICAgaW1nLmF0dHIoc3JjVGFnLCAnZmlsZTovLy8nK3BhdGgucmVzb2x2ZShmaWxlRGlyZWN0b3J5UGF0aCwgIHNyYykpXG5cbiAgICBlbHNlIGlmIChzcmMgYW5kIHNyY1swXSA9PSAnLycpICAjIGFic29sdXRlIHBhdGhcbiAgICAgIGlmIG9wdGlvbi51c2VSZWxhdGl2ZUltYWdlUGF0aFxuICAgICAgICBpbWcuYXR0cihzcmNUYWcsIHBhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIHBhdGgucmVzb2x2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nICsgc3JjKSkpXG4gICAgICBlbHNlXG4gICAgICAgIGltZy5hdHRyKHNyY1RhZywgJ2ZpbGU6Ly8vJytwYXRoLnJlc29sdmUocHJvamVjdERpcmVjdG9yeVBhdGgsICcuJyArIHNyYykpXG5cbiAgcmVuZGVyQ29kZUJsb2NrID0gKHByZUVsZW1lbnQsIHRleHQsIGxhbmcsIGxpbmVObz1udWxsKS0+XG4gICAgaGlnaGxpZ2h0ZXIgPz0gbmV3IEhpZ2hsaWdodHMoe3JlZ2lzdHJ5OiBhdG9tLmdyYW1tYXJzLCBzY29wZVByZWZpeDogJ21wZS1zeW50YXgtLSd9KVxuICAgIGh0bWwgPSBoaWdobGlnaHRlci5oaWdobGlnaHRTeW5jXG4gICAgICAgICAgICBmaWxlQ29udGVudHM6IHRleHQsXG4gICAgICAgICAgICBzY29wZU5hbWU6IHNjb3BlRm9yTGFuZ3VhZ2VOYW1lKGxhbmcpXG5cbiAgICBoaWdobGlnaHRlZEJsb2NrID0gJChodG1sKVxuICAgIGhpZ2hsaWdodGVkQmxvY2sucmVtb3ZlQ2xhc3MoJ2VkaXRvcicpLmFkZENsYXNzKCdsYW5nLScgKyBsYW5nKVxuXG4gICAgaWYgbGluZU5vICE9IG51bGwgYW5kICFESVNBQkxFX1NZTkNfTElORVxuICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hdHRyKHsnZGF0YS1saW5lJzogbGluZU5vfSkgIyBubyBuZWVkIHRvIGNhbGwgZ2V0UmVhbERhdGFMaW5lIGhlcmVcbiAgICAgIGhpZ2hsaWdodGVkQmxvY2suYWRkQ2xhc3MoJ3N5bmMtbGluZScpXG5cbiAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoKGhpZ2hsaWdodGVkQmxvY2spXG5cbiAgIyBwYXJzZSBlZzpcbiAgIyB7bm9kZSBhcmdzOltcIi12XCJdLCBvdXRwdXQ6XCJodG1sXCJ9XG4gIHJlbmRlckNvZGVDaHVuayA9IChwcmVFbGVtZW50LCB0ZXh0LCBwYXJhbWV0ZXJzLCBsaW5lTm89bnVsbCwgY29kZUNodW5rc0RhdGE9e30pLT5cbiAgICBtYXRjaCA9IHBhcmFtZXRlcnMubWF0Y2goL15cXHtcXHMqKFxcXCJbXlxcXCJdKlxcXCJ8W15cXHNdKnxbXn1dKikoLiopfSQvKVxuICAgIGxhbmcgPSBtYXRjaFsxXS50cmltKClcbiAgICBwYXJhbWV0ZXJzID0gbWF0Y2hbMl0udHJpbSgpXG4gICAgbGFuZyA9IGxhbmcuc2xpY2UoMSwgbGFuZy5sZW5ndGgtMSkudHJpbSgpIGlmIGxhbmdbMF0gPT0gJ1wiJ1xuXG4gICAgcmV0dXJuIGlmICFsYW5nXG5cbiAgICBoaWdobGlnaHRlZEJsb2NrID0gJydcbiAgICBidXR0b25Hcm91cCA9ICcnXG4gICAgaWYgbm90IC9cXHMqaGlkZVxccyo6XFxzKnRydWUvLnRlc3QocGFyYW1ldGVycylcbiAgICAgIGhpZ2hsaWdodGVyID89IG5ldyBIaWdobGlnaHRzKHtyZWdpc3RyeTogYXRvbS5ncmFtbWFycywgc2NvcGVQcmVmaXg6ICdtcGUtc3ludGF4LS0nfSlcbiAgICAgIGh0bWwgPSBoaWdobGlnaHRlci5oaWdobGlnaHRTeW5jXG4gICAgICAgICAgICAgIGZpbGVDb250ZW50czogdGV4dCxcbiAgICAgICAgICAgICAgc2NvcGVOYW1lOiBzY29wZUZvckxhbmd1YWdlTmFtZShsYW5nKVxuXG4gICAgICBoaWdobGlnaHRlZEJsb2NrID0gJChodG1sKVxuICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5yZW1vdmVDbGFzcygnZWRpdG9yJykuYWRkQ2xhc3MoJ2xhbmctJyArIGxhbmcpXG5cbiAgICAgIGlmIGxpbmVObyAhPSBudWxsIGFuZCAhRElTQUJMRV9TWU5DX0xJTkVcbiAgICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hdHRyKHsnZGF0YS1saW5lJzogbGluZU5vfSlcbiAgICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hZGRDbGFzcygnc3luYy1saW5lJylcblxuICAgICAgYnV0dG9uR3JvdXAgPSAnPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPjxkaXYgY2xhc3M9XCJydW4tYnRuIGJ0blwiPjxzcGFuPuKWtu+4jjwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJydW4tYWxsLWJ0biBidG5cXFwiPmFsbDwvZGl2PjwvZGl2PidcblxuICAgIHN0YXR1c0RpdiA9ICc8ZGl2IGNsYXNzPVwic3RhdHVzXCI+cnVubmluZy4uLjwvZGl2PidcblxuICAgICRlbCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJjb2RlLWNodW5rXFxcIj5cIiArIGhpZ2hsaWdodGVkQmxvY2sgKyBidXR0b25Hcm91cCArIHN0YXR1c0RpdiArICc8L2Rpdj4nKVxuICAgICRlbC5hdHRyICdkYXRhLWxhbmcnOiBsYW5nLCAnZGF0YS1hcmdzJzogcGFyYW1ldGVycywgJ2RhdGEtbGluZSc6IGxpbmVObywgJ2RhdGEtY29kZSc6IHRleHQsICdkYXRhLXJvb3QtZGlyZWN0b3J5LXBhdGgnOiBmaWxlRGlyZWN0b3J5UGF0aFxuXG4gICAgJChwcmVFbGVtZW50KS5yZXBsYWNlV2l0aCAkZWxcblxuICAkKCdwcmUnKS5lYWNoIChpLCBwcmVFbGVtZW50KS0+XG4gICAgbGluZU5vID0gbnVsbFxuICAgIGlmIHByZUVsZW1lbnQuY2hpbGRyZW5bMF0/Lm5hbWUgPT0gJ2NvZGUnXG4gICAgICBjb2RlQmxvY2sgPSAkKHByZUVsZW1lbnQpLmNoaWxkcmVuKCkuZmlyc3QoKVxuICAgICAgbGFuZyA9ICd0ZXh0J1xuICAgICAgaWYgY29kZUJsb2NrLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgbGFuZyA9IGNvZGVCbG9jay5hdHRyKCdjbGFzcycpLnJlcGxhY2UoL15sYW5ndWFnZS0vLCAnJykgb3IgJ3RleHQnXG4gICAgICB0ZXh0ID0gY29kZUJsb2NrLnRleHQoKVxuXG4gICAgICBsaW5lTm8gPSBjb2RlQmxvY2suYXR0cignZGF0YS1saW5lJylcbiAgICBlbHNlXG4gICAgICBsYW5nID0gJ3RleHQnXG4gICAgICBpZiBwcmVFbGVtZW50LmNoaWxkcmVuWzBdXG4gICAgICAgIHRleHQgPSBwcmVFbGVtZW50LmNoaWxkcmVuWzBdLmRhdGFcbiAgICAgIGVsc2VcbiAgICAgICAgdGV4dCA9ICcnXG5cbiAgICBpZiB1c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzXG4gICAgICBtZXJtYWlkUmVnRXhwID0gL15cXEA/bWVybWFpZC9cbiAgICAgIHBsYW50dW1sUmVnRXhwID0gL15cXEA/KHBsYW50dW1sfHB1bWwpL1xuICAgICAgd2F2ZWRyb21SZWdFeHAgPSAvXlxcQD93YXZlZHJvbS9cbiAgICAgIHZpelJlZ0V4cCA9IC9eXFxAPyh2aXp8ZG90KS9cbiAgICBlbHNlICMgb25seSB3b3JrcyB3aXRoIEAgYXBwZW5kZWQgYXQgZnJvbnRcbiAgICAgIG1lcm1haWRSZWdFeHAgPSAvXlxcQG1lcm1haWQvXG4gICAgICBwbGFudHVtbFJlZ0V4cCA9IC9eXFxAKHBsYW50dW1sfHB1bWwpL1xuICAgICAgd2F2ZWRyb21SZWdFeHAgPSAvXlxcQHdhdmVkcm9tL1xuICAgICAgdml6UmVnRXhwID0gL15cXEAodml6fGRvdCkvXG5cblxuICAgIGlmIGxhbmcubWF0Y2ggbWVybWFpZFJlZ0V4cFxuICAgICAgbWVybWFpZC5wYXJzZUVycm9yID0gKGVyciwgaGFzaCktPlxuICAgICAgICByZW5kZXJDb2RlQmxvY2socHJlRWxlbWVudCwgZXJyLCAndGV4dCcpXG5cbiAgICAgIGVsZW1lbnQgPSBncmFwaERhdGEubWVybWFpZF9zP1swXVxuICAgICAgIyBwcmV2ZW50IG1lcm1haWRBUEkucGFyc2UgaWYgY29udGVudCBub3QgY2hhbmdlZFxuICAgICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgPT0gJ3RydWUnICYmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykgPT0gdGV4dCkgb3IgbWVybWFpZEFQSS5wYXJzZSh0ZXh0LnRyaW0oKSlcbiAgICAgICAgY2hlY2tHcmFwaCAnbWVybWFpZCcsIGdyYXBoRGF0YS5tZXJtYWlkX3MsIHByZUVsZW1lbnQsIHRleHQsIG9wdGlvbiwgJCwgbWVybWFpZE9mZnNldFxuXG4gICAgICAgIG1lcm1haWRPZmZzZXQgKz0gMVxuXG4gICAgZWxzZSBpZiBsYW5nLm1hdGNoIHBsYW50dW1sUmVnRXhwXG4gICAgICBjaGVja0dyYXBoICdwbGFudHVtbCcsIGdyYXBoRGF0YS5wbGFudHVtbF9zLCBwcmVFbGVtZW50LCB0ZXh0LCBvcHRpb24sICRcblxuICAgIGVsc2UgaWYgbGFuZy5tYXRjaCB3YXZlZHJvbVJlZ0V4cFxuICAgICAgY2hlY2tHcmFwaCAnd2F2ZWRyb20nLCBncmFwaERhdGEud2F2ZWRyb21fcywgcHJlRWxlbWVudCwgdGV4dCwgb3B0aW9uLCAkLCB3YXZlZHJvbU9mZnNldFxuICAgICAgd2F2ZWRyb21PZmZzZXQgKz0gMVxuICAgIGVsc2UgaWYgbGFuZy5tYXRjaCB2aXpSZWdFeHBcbiAgICAgIGNoZWNrR3JhcGggJ3ZpeicsIGdyYXBoRGF0YS52aXpfcywgcHJlRWxlbWVudCwgdGV4dCwgb3B0aW9uLCAkXG4gICAgZWxzZSBpZiBsYW5nWzBdID09ICd7JyAmJiBsYW5nW2xhbmcubGVuZ3RoLTFdID09ICd9J1xuICAgICAgcmVuZGVyQ29kZUNodW5rKHByZUVsZW1lbnQsIHRleHQsIGxhbmcsIGxpbmVObywgY29kZUNodW5rc0RhdGEpXG4gICAgZWxzZVxuICAgICAgcmVuZGVyQ29kZUJsb2NrKHByZUVsZW1lbnQsIHRleHQsIGxhbmcsIGxpbmVObylcblxuICByZXR1cm4gJC5odG1sKClcblxuIyMjXG4jIHByb2Nlc3MgaW5wdXQgc3RyaW5nLCBza2lwIGZyb250LW1hdHRlclxuXG5pZiBkaXNwbGF5IHRhYmxlXG4gIHJldHVybiB7XG4gICAgY29udGVudDogcmVzdCBvZiBpbnB1dCBzdHJpbmcgYWZ0ZXIgc2tpcHBpbmcgZnJvbnQgbWF0dGVyIChidXQgd2l0aCAnXFxuJyBpbmNsdWRlZClcbiAgICB0YWJsZTogc3RyaW5nIG9mIDx0YWJsZT4uLi48L3RhYmxlPiBnZW5lcmF0ZWQgZnJvbSBkYXRhXG4gIH1cbmVsc2VcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiByZXBsYWNlIC0tLVxcbiB3aXRoIGBgYHlhbWxcbiAgICB0YWJsZTogJycsXG4gIH1cbiMjI1xucHJvY2Vzc0Zyb250TWF0dGVyID0gKGlucHV0U3RyaW5nLCBoaWRlRnJvbnRNYXR0ZXI9ZmFsc2UpLT5cbiAgdG9UYWJsZSA9IChhcmcpLT5cbiAgICBpZiBhcmcgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgdGJvZHkgPSBcIjx0Ym9keT48dHI+XCJcbiAgICAgIGZvciBpdGVtIGluIGFyZ1xuICAgICAgICB0Ym9keSArPSBcIjx0ZD4je3RvVGFibGUoaXRlbSl9PC90ZD5cIlxuICAgICAgdGJvZHkgKz0gXCI8L3RyPjwvdGJvZHk+XCJcblxuICAgICAgXCI8dGFibGU+I3t0Ym9keX08L3RhYmxlPlwiXG4gICAgZWxzZSBpZiB0eXBlb2YoYXJnKSA9PSAnb2JqZWN0J1xuICAgICAgdGhlYWQgPSBcIjx0aGVhZD48dHI+XCJcbiAgICAgIHRib2R5ID0gXCI8dGJvZHk+PHRyPlwiXG4gICAgICBmb3Iga2V5IG9mIGFyZ1xuICAgICAgICB0aGVhZCArPSBcIjx0aD4je2tleX08L3RoPlwiXG4gICAgICAgIHRib2R5ICs9IFwiPHRkPiN7dG9UYWJsZShhcmdba2V5XSl9PC90ZD5cIlxuICAgICAgdGhlYWQgKz0gXCI8L3RyPjwvdGhlYWQ+XCJcbiAgICAgIHRib2R5ICs9IFwiPC90cj48L3Rib2R5PlwiXG5cbiAgICAgIFwiPHRhYmxlPiN7dGhlYWR9I3t0Ym9keX08L3RhYmxlPlwiXG4gICAgZWxzZVxuICAgICAgYXJnXG5cbiAgIyBodHRwczovL3JlZ2V4cGVyLmNvbS9cbiAgciA9IC9eLXszfVtcXG5cXHJdKFtcXHd8XFxXXSs/KVtcXG5cXHJdLXszfVtcXG5cXHJdL1xuXG4gIG1hdGNoID0gci5leGVjKGlucHV0U3RyaW5nKVxuXG4gIGlmIG1hdGNoXG4gICAgeWFtbFN0ciA9IG1hdGNoWzBdXG4gICAgZGF0YSA9IG1hdHRlcih5YW1sU3RyKS5kYXRhXG5cbiAgICBpZiB1c2VQYW5kb2NQYXJzZXIgIyB1c2UgcGFuZG9jIHBhcnNlciwgc28gZG9uJ3QgY2hhbmdlIGlucHV0U3RyaW5nXG4gICAgICByZXR1cm4ge2NvbnRlbnQ6IGlucHV0U3RyaW5nLCB0YWJsZTogJycsIGRhdGF9XG4gICAgZWxzZSBpZiBoaWRlRnJvbnRNYXR0ZXIgb3IgZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb25bMF0gPT0gJ24nICMgaGlkZVxuICAgICAgY29udGVudCA9ICdcXG4nLnJlcGVhdCh5YW1sU3RyLm1hdGNoKC9cXG4vZyk/Lmxlbmd0aCBvciAwKSArIGlucHV0U3RyaW5nLnNsaWNlKHlhbWxTdHIubGVuZ3RoKVxuICAgICAgcmV0dXJuIHtjb250ZW50LCB0YWJsZTogJycsIGRhdGF9XG4gICAgZWxzZSBpZiBmcm9udE1hdHRlclJlbmRlcmluZ09wdGlvblswXSA9PSAndCcgIyB0YWJsZVxuICAgICAgY29udGVudCA9ICdcXG4nLnJlcGVhdCh5YW1sU3RyLm1hdGNoKC9cXG4vZyk/Lmxlbmd0aCBvciAwKSArIGlucHV0U3RyaW5nLnNsaWNlKHlhbWxTdHIubGVuZ3RoKVxuXG4gICAgICAjIHRvIHRhYmxlXG4gICAgICBpZiB0eXBlb2YoZGF0YSkgPT0gJ29iamVjdCdcbiAgICAgICAgdGFibGUgPSB0b1RhYmxlKGRhdGEpXG4gICAgICBlbHNlXG4gICAgICAgIHRhYmxlID0gXCI8cHJlPkZhaWxlZCB0byBwYXJzZSBZQU1MLjwvcHJlPlwiXG5cbiAgICAgIHJldHVybiB7Y29udGVudCwgdGFibGUsIGRhdGF9XG4gICAgZWxzZSAjIGlmIGZyb250TWF0dGVyUmVuZGVyaW5nT3B0aW9uWzBdID09ICdjJyAjIGNvZGUgYmxvY2tcbiAgICAgIGNvbnRlbnQgPSAnYGBgeWFtbFxcbicgKyBtYXRjaFsxXSArICdcXG5gYGBcXG4nICsgaW5wdXRTdHJpbmcuc2xpY2UoeWFtbFN0ci5sZW5ndGgpXG5cbiAgICAgIHJldHVybiB7Y29udGVudCwgdGFibGU6ICcnLCBkYXRhfVxuXG4gIHtjb250ZW50OiBpbnB1dFN0cmluZywgdGFibGU6ICcnfVxuXG4jIyNcbnVwZGF0ZSBlZGl0b3IgdG9jXG5yZXR1cm4gdHJ1ZSBpZiB0b2MgaXMgdXBkYXRlZFxuIyMjXG51cGRhdGVUT0MgPSAobWFya2Rvd25QcmV2aWV3LCB0b2NDb25maWdzKS0+XG4gIHJldHVybiBmYWxzZSBpZiAhbWFya2Rvd25QcmV2aWV3IG9yIHRvY0NvbmZpZ3MudG9jU3RhcnRMaW5lX3MubGVuZ3RoICE9IHRvY0NvbmZpZ3MudG9jRW5kTGluZV9zLmxlbmd0aFxuXG4gIGVxdWFsID0gKGFycjEsIGFycjIpLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgYXJyMS5sZW5ndGggIT0gYXJyMi5sZW5ndGhcbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBhcnIxLmxlbmd0aFxuICAgICAgaWYgYXJyMVtpXSAhPSBhcnIyW2ldXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgaSArPSAxXG4gICAgcmV0dXJuIHRydWVcblxuICB0b2NOZWVkVXBkYXRlID0gZmFsc2VcbiAgaWYgIW1hcmtkb3duUHJldmlldy50b2NDb25maWdzXG4gICAgdG9jTmVlZFVwZGF0ZSA9IHRydWVcbiAgZWxzZSBpZiAhZXF1YWwobWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3MudG9jT3JkZXJlZF9zLCB0b2NDb25maWdzLnRvY09yZGVyZWRfcykgb3IgIWVxdWFsKG1hcmtkb3duUHJldmlldy50b2NDb25maWdzLnRvY0RlcHRoRnJvbV9zLCB0b2NDb25maWdzLnRvY0RlcHRoRnJvbV9zKSBvciAhZXF1YWwobWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3MudG9jRGVwdGhUb19zLCB0b2NDb25maWdzLnRvY0RlcHRoVG9fcylcbiAgICB0b2NOZWVkVXBkYXRlID0gdHJ1ZVxuICBlbHNlXG4gICAgaGVhZGluZ3MgPSB0b2NDb25maWdzLmhlYWRpbmdzXG4gICAgaGVhZGluZ3MyID0gbWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3MuaGVhZGluZ3NcbiAgICBpZiBoZWFkaW5ncy5sZW5ndGggIT0gaGVhZGluZ3MyLmxlbmd0aFxuICAgICAgdG9jTmVlZFVwZGF0ZSA9IHRydWVcbiAgICBlbHNlXG4gICAgICBmb3IgaSBpbiBbMC4uLmhlYWRpbmdzLmxlbmd0aF1cbiAgICAgICAgaWYgaGVhZGluZ3NbaV0uY29udGVudCAhPSBoZWFkaW5nczJbaV0uY29udGVudCBvciBoZWFkaW5nc1tpXS5sZXZlbCAhPSBoZWFkaW5nczJbaV0ubGV2ZWxcbiAgICAgICAgICB0b2NOZWVkVXBkYXRlID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG5cbiAgaWYgdG9jTmVlZFVwZGF0ZVxuICAgIGVkaXRvciA9IG1hcmtkb3duUHJldmlldy5lZGl0b3JcbiAgICBidWZmZXIgPSBlZGl0b3IuYnVmZmVyXG4gICAgdGFiID0gZWRpdG9yLmdldFRhYlRleHQoKSBvciAnXFx0J1xuXG4gICAgaGVhZGluZ3MgPSB0b2NDb25maWdzLmhlYWRpbmdzXG4gICAgdG9jT3JkZXJlZF9zID0gdG9jQ29uZmlncy50b2NPcmRlcmVkX3NcbiAgICB0b2NEZXB0aEZyb21fcyA9IHRvY0NvbmZpZ3MudG9jRGVwdGhGcm9tX3NcbiAgICB0b2NEZXB0aFRvX3MgPSB0b2NDb25maWdzLnRvY0RlcHRoVG9fc1xuICAgIHRvY1N0YXJ0TGluZV9zID0gdG9jQ29uZmlncy50b2NTdGFydExpbmVfc1xuICAgIHRvY0VuZExpbmVfcyA9IHRvY0NvbmZpZ3MudG9jRW5kTGluZV9zXG5cbiAgICBpZiBidWZmZXJcbiAgICAgIGkgPSAwXG4gICAgICBkZWx0YSA9IDBcbiAgICAgIHdoaWxlIGkgPCB0b2NPcmRlcmVkX3MubGVuZ3RoXG4gICAgICAgIHRvY09yZGVyZWQgPSB0b2NPcmRlcmVkX3NbaV1cbiAgICAgICAgdG9jRGVwdGhGcm9tID0gdG9jRGVwdGhGcm9tX3NbaV1cbiAgICAgICAgdG9jRGVwdGhUbyA9IHRvY0RlcHRoVG9fc1tpXVxuICAgICAgICB0b2NTdGFydExpbmUgPSB0b2NTdGFydExpbmVfc1tpXSArIGRlbHRhXG4gICAgICAgIHRvY0VuZExpbmUgPSB0b2NFbmRMaW5lX3NbaV0gKyBkZWx0YVxuXG4gICAgICAgIHRvY09iamVjdCA9IHRvYyhoZWFkaW5ncywge29yZGVyZWQ6IHRvY09yZGVyZWQsIGRlcHRoRnJvbTogdG9jRGVwdGhGcm9tLCBkZXB0aFRvOiB0b2NEZXB0aFRvLCB0YWJ9KVxuXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbW3RvY1N0YXJ0TGluZSsxLCAwXSwgW3RvY0VuZExpbmUsIDBdXSwgJ1xcblxcblxcbicpXG4gICAgICAgIGJ1ZmZlci5pbnNlcnQoW3RvY1N0YXJ0TGluZSsyLCAwXSwgdG9jT2JqZWN0LmNvbnRlbnQpXG5cbiAgICAgICAgZGVsdGEgKz0gKHRvY1N0YXJ0TGluZSArIHRvY09iamVjdC5hcnJheS5sZW5ndGggKyAzIC0gdG9jRW5kTGluZSlcblxuICAgICAgICBtYXJrZG93blByZXZpZXcucGFyc2VEZWxheSA9IERhdGUubm93KCkgKyA1MDAgIyBwcmV2ZW50IHJlbmRlciBhZ2FpblxuICAgICAgICBtYXJrZG93blByZXZpZXcuZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG4gICAgICAgIG1hcmtkb3duUHJldmlldy5wcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgICAgICAgaSArPSAxXG5cbiAgbWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3MgPSB0b2NDb25maWdzXG4gIHJldHVybiB0b2NOZWVkVXBkYXRlXG5cbiMgSW5zZXJ0IGFuY2hvcnMgZm9yIHNjcm9sbCBzeW5jLlxuIyB0aGlzIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIHVzZVBhbmRvY1BhcnNlci5cbmluc2VydEFuY2hvcnMgPSAodGV4dCktPlxuICAjIGFuY2hvciBsb29rcyBsaWtlIHRoaXMgPHAgZGF0YS1saW5lPVwiMjNcIiBjbGFzcz1cInN5bmMtbGluZVwiIHN0eWxlPVwibWFyZ2luOjA7XCI+PC9wPlxuICBjcmVhdGVBbmNob3IgPSAobGluZU5vKS0+XG4gICAgXCI8cCBkYXRhLWxpbmU9XFxcIiN7bGluZU5vfVxcXCIgY2xhc3M9XFxcInN5bmMtbGluZVxcXCIgc3R5bGU9XFxcIm1hcmdpbjowO1xcXCI+PC9wPlxcblwiXG5cbiAgb3V0cHV0U3RyaW5nID0gXCJcIlxuICBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gIGkgPSAwXG4gIHdoaWxlIGkgPCBsaW5lcy5sZW5ndGhcbiAgICBsaW5lID0gbGluZXNbaV1cblxuICAgICMjI1xuICAgIGFkZCBhbmNob3JzIHdoZW4gaXQgaXNcbiAgICAxLiBoZWFkaW5nXG4gICAgMi4gaW1hZ2VcbiAgICAzLiBjb2RlIGJsb2NrIHwgY2h1bmtcbiAgICA0LiBAaW1wb3J0XG4gICAgNS4gY29tbWVudFxuICAgICMjI1xuICAgIGlmIGxpbmUubWF0Y2ggL14oXFwjfFxcIVxcW3xgYGAoXFx3fHspfEBpbXBvcnR8XFw8IS0tKS9cbiAgICAgIG91dHB1dFN0cmluZyArPSBjcmVhdGVBbmNob3IoaSlcblxuICAgIGlmIGxpbmUubWF0Y2ggL15gYGAoXFx3fHspLyAjIGJlZ2luIG9mIGNvZGUgYmxvY2tcbiAgICAgIG91dHB1dFN0cmluZyArPSBsaW5lICsgJ1xcbidcbiAgICAgIGkgKz0gMVxuICAgICAgd2hpbGUgaSA8IGxpbmVzLmxlbmd0aFxuICAgICAgICBsaW5lID0gbGluZXNbaV1cbiAgICAgICAgaWYgbGluZS5tYXRjaCAvXmBgYFxccyovICMgZW5kIG9mIGNvZGUgYmxvY2tcbiAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgb3V0cHV0U3RyaW5nICs9IGxpbmUgKyAnXFxuJ1xuICAgICAgICAgIGkgKz0gMVxuXG4gICAgb3V0cHV0U3RyaW5nICs9IGxpbmUgKyAnXFxuJ1xuICAgIGkgKz0gMVxuICAgIFxuICBvdXRwdXRTdHJpbmdcblxuIyMjXG4jIHBhcnNlIG1hcmtkb3duIGNvbnRlbnQgdG8gaHRtbFxuXG5pbnB1dFN0cmluZzogICAgICAgICBzdHJpbmcsIHJlcXVpcmVkXG5vcHRpb24gPSB7XG4gIHVzZVJlbGF0aXZlSW1hZ2VQYXRoOiAgICAgICBib29sLCBvcHRpb25hbFxuICBpc0ZvclByZXZpZXc6ICAgICAgICAgYm9vbCwgb3B0aW9uYWxcbiAgaXNGb3JFYm9vazogICAgICAgICAgIGJvb2wsIG9wdGlvbmFsXG4gIGhpZGVGcm9udE1hdHRlcjogICAgICBib29sLCBvcHRpb25hbFxuICBtYXJrZG93blByZXZpZXc6ICAgICAgTWFya2Rvd25QcmV2aWV3RW5oYW5jZWRWaWV3LCBvcHRpb25hbFxuXG4gIGZpbGVEaXJlY3RvcnlQYXRoOiAgICBzdHJpbmcsIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGUgZGlyZWN0b3J5IHBhdGggb2YgdGhlIG1hcmtkb3duIGZpbGUuXG4gIHByb2plY3REaXJlY3RvcnlQYXRoOiBzdHJpbmcsIHJlcXVpcmVkXG59XG5jYWxsYmFjayhkYXRhKVxuIyMjXG5wYXJzZU1EID0gKGlucHV0U3RyaW5nLCBvcHRpb249e30sIGNhbGxiYWNrKS0+XG4gIHttYXJrZG93blByZXZpZXd9ID0gb3B0aW9uXG5cbiAgRElTQUJMRV9TWU5DX0xJTkUgPSAhKG9wdGlvbi5pc0ZvclByZXZpZXcpICMgc2V0IGdsb2JhbCB2YXJpYWJsZVxuICBIRUlHSFRTX0RFTFRBID0gW11cblxuICAjIHRvY1xuICB0b2NUYWJsZSA9IHt9ICMgZWxpbWluYXRlIHJlcGVhdGVkIHNsdWdcbiAgdG9jRW5hYmxlZCA9IGZhbHNlXG4gIHRvY0NvbmZpZ3MgPSB7XG4gICAgaGVhZGluZ3M6IFtdLFxuICAgIHRvY1N0YXJ0TGluZV9zOiBbXSxcbiAgICB0b2NFbmRMaW5lX3M6IFtdLFxuICAgIHRvY09yZGVyZWRfczogW10sXG4gICAgdG9jRGVwdGhGcm9tX3M6IFtdLFxuICAgIHRvY0RlcHRoVG9fczogW11cbiAgfVxuXG4gICMgc2xpZGVcbiAgc2xpZGVDb25maWdzID0gW11cblxuICAjIHlhbWxcbiAgeWFtbENvbmZpZyA9IG51bGxcblxuICAjIHdlIHdvbid0IHJlbmRlciB0aGUgZ3JhcGggdGhhdCBoYXNuJ3QgY2hhbmdlZFxuICBncmFwaERhdGEgPSBudWxsXG4gIGNvZGVDaHVua3NEYXRhID0gbnVsbFxuICBpZiBtYXJrZG93blByZXZpZXdcbiAgICBpZiBtYXJrZG93blByZXZpZXcuZ3JhcGhEYXRhXG4gICAgICBncmFwaERhdGEgPSB7fVxuICAgICAgZm9yIGtleSBvZiBtYXJrZG93blByZXZpZXcuZ3JhcGhEYXRhXG4gICAgICAgIGdyYXBoRGF0YVtrZXldID0gbWFya2Rvd25QcmV2aWV3LmdyYXBoRGF0YVtrZXldLnNsaWNlKDApICMgZml4IGlzc3VlIDE3Ny4uLiBhcyB0aGUgYXJyYXkgd2lsbCBiZSBgc3BsaWNlYCBpbiB0aGUgZnV0dXJlLCBzbyBuZWVkIHRvIGNyZWF0ZSBuZXcgYXJyYXkgaGVyZVxuICAgIGNvZGVDaHVua3NEYXRhID0gbWFya2Rvd25QcmV2aWV3LmNvZGVDaHVua3NEYXRhXG5cbiAgIyBzZXQgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YVxuICAjIHNvIHRoYXQgd2Ugd29uJ3QgcmVuZGVyIHRoZSBtYXRoIGV4cHJlc3Npb24gdGhhdCBoYXNuJ3QgY2hhbmdlZFxuICBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhID0ge31cbiAgaWYgbWFya2Rvd25QcmV2aWV3XG4gICAgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5pc0ZvclByZXZpZXcgPSBvcHRpb24uaXNGb3JQcmV2aWV3XG4gICAgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnS2FUZVgnXG4gICAgICBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLmthdGV4X3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBtYXJrZG93blByZXZpZXcuZ2V0RWxlbWVudCgpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2thdGV4LWV4cHMnKVxuICAgIGVsc2UgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTWF0aEpheCdcbiAgICAgIGdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEubWF0aGpheF9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgbWFya2Rvd25QcmV2aWV3LmdldEVsZW1lbnQoKS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtYXRoamF4LWV4cHMnKVxuXG4gICMgY2hlY2sgZnJvbnQtbWF0dGVyXG4gIHt0YWJsZTpmcm9udE1hdHRlclRhYmxlLCBjb250ZW50OmlucHV0U3RyaW5nLCBkYXRhOnlhbWxDb25maWd9ID0gcHJvY2Vzc0Zyb250TWF0dGVyKGlucHV0U3RyaW5nLCBvcHRpb24uaGlkZUZyb250TWF0dGVyKVxuICB5YW1sQ29uZmlnID0geWFtbENvbmZpZyBvciB7fVxuXG4gICMgaW5zZXJ0IGFuY2hvcnNcbiAgaWYgdXNlUGFuZG9jUGFyc2VyIGFuZCBvcHRpb24uaXNGb3JQcmV2aWV3XG4gICAgaW5wdXRTdHJpbmcgPSBpbnNlcnRBbmNob3JzKGlucHV0U3RyaW5nKVxuXG4gICMgY2hlY2sgZG9jdW1lbnQgaW1wb3J0c1xuICB7b3V0cHV0U3RyaW5nOmlucHV0U3RyaW5nLCBoZWlnaHRzRGVsdGE6IEhFSUdIVFNfREVMVEF9ID0gZmlsZUltcG9ydChpbnB1dFN0cmluZywge2ZpbGVzQ2FjaGU6IG1hcmtkb3duUHJldmlldz8uZmlsZXNDYWNoZSwgZmlsZURpcmVjdG9yeVBhdGg6IG9wdGlvbi5maWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGg6IG9wdGlvbi5wcm9qZWN0RGlyZWN0b3J5UGF0aCwgZWRpdG9yOiBtYXJrZG93blByZXZpZXc/LmVkaXRvcn0pXG5cbiAgIyBvdmVyd3JpdGUgcmVtYXJrIGhlYWRpbmcgcGFyc2UgZnVuY3Rpb25cbiAgbWQucmVuZGVyZXIucnVsZXMuaGVhZGluZ19vcGVuID0gKHRva2VucywgaWR4KT0+XG4gICAgbGluZSA9IG51bGxcbiAgICBpZCA9IG51bGxcblxuICAgIGlmIHRva2Vuc1tpZHggKyAxXSBhbmQgdG9rZW5zW2lkeCArIDFdLmNvbnRlbnRcbiAgICAgIGlkID0gdXNsdWcodG9rZW5zW2lkeCArIDFdLmNvbnRlbnQpXG4gICAgICBpZiAodG9jVGFibGVbaWRdID49IDApXG4gICAgICAgIHRvY1RhYmxlW2lkXSArPSAxXG4gICAgICAgIGlkID0gaWQgKyAnLScgKyB0b2NUYWJsZVtpZF1cbiAgICAgIGVsc2VcbiAgICAgICAgdG9jVGFibGVbaWRdID0gMFxuXG4gICAgICBpZiAhKHRva2Vuc1tpZHgtMV0/LnN1YmplY3QgPT0gJ3VudG9jJylcbiAgICAgICAgdG9jQ29uZmlncy5oZWFkaW5ncy5wdXNoKHtjb250ZW50OiB0b2tlbnNbaWR4ICsgMV0uY29udGVudCwgbGV2ZWw6IHRva2Vuc1tpZHhdLmhMZXZlbH0pXG5cbiAgICBpZCA9IGlmIGlkIHRoZW4gXCJpZD0je2lkfVwiIGVsc2UgJydcbiAgICBpZiB0b2tlbnNbaWR4XS5saW5lcyBhbmQgIURJU0FCTEVfU1lOQ19MSU5FXG4gICAgICBsaW5lID0gdG9rZW5zW2lkeF0ubGluZXNbMF1cbiAgICAgIHJldHVybiBcIjxoI3t0b2tlbnNbaWR4XS5oTGV2ZWx9IGNsYXNzPVxcXCJzeW5jLWxpbmVcXFwiIGRhdGEtbGluZT1cXFwiI3tnZXRSZWFsRGF0YUxpbmUobGluZSl9XFxcIiAje2lkfT5cIlxuXG4gICAgcmV0dXJuIFwiPGgje3Rva2Vuc1tpZHhdLmhMZXZlbH0gI3tpZH0+XCJcblxuICAjIDwhLS0gc3ViamVjdCBvcHRpb25zLi4uIC0tPlxuICBtZC5yZW5kZXJlci5ydWxlcy5jdXN0b20gPSAodG9rZW5zLCBpZHgpPT5cbiAgICBzdWJqZWN0ID0gdG9rZW5zW2lkeF0uc3ViamVjdFxuXG4gICAgaWYgc3ViamVjdCA9PSAncGFnZWJyZWFrJyBvciBzdWJqZWN0ID09ICduZXdwYWdlJ1xuICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwicGFnZWJyZWFrXCI+IDwvZGl2PidcbiAgICBlbHNlIGlmIHN1YmplY3QgPT0gJ3RvYydcbiAgICAgIHRvY0VuYWJsZWQgPSB0cnVlXG5cbiAgICAgIHRvY0NvbmZpZ3MudG9jU3RhcnRMaW5lX3MucHVzaCB0b2tlbnNbaWR4XS5saW5lXG5cbiAgICAgIG9wdCA9IHRva2Vuc1tpZHhdLm9wdGlvblxuICAgICAgaWYgb3B0Lm9yZGVyZWRMaXN0IGFuZCBvcHQub3JkZXJlZExpc3QgIT0gMFxuICAgICAgICB0b2NDb25maWdzLnRvY09yZGVyZWRfcy5wdXNoIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgdG9jQ29uZmlncy50b2NPcmRlcmVkX3MucHVzaCBmYWxzZVxuXG4gICAgICB0b2NDb25maWdzLnRvY0RlcHRoRnJvbV9zLnB1c2ggb3B0LmRlcHRoRnJvbSB8fCAxXG4gICAgICB0b2NDb25maWdzLnRvY0RlcHRoVG9fcy5wdXNoIG9wdC5kZXB0aFRvIHx8IDZcblxuICAgIGVsc2UgaWYgKHN1YmplY3QgPT0gJ3RvY3N0b3AnKVxuICAgICAgdG9jQ29uZmlncy50b2NFbmRMaW5lX3MucHVzaCB0b2tlbnNbaWR4XS5saW5lXG4gICAgZWxzZSBpZiBzdWJqZWN0ID09ICdzbGlkZSdcbiAgICAgIG9wdCA9IHRva2Vuc1tpZHhdLm9wdGlvblxuICAgICAgb3B0LmxpbmUgPSB0b2tlbnNbaWR4XS5saW5lXG4gICAgICBzbGlkZUNvbmZpZ3MucHVzaChvcHQpXG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJuZXctc2xpZGVcIj48L2Rpdj4nXG4gICAgcmV0dXJuICcnXG5cbiAgZmluYWxpemUgPSAoaHRtbCktPlxuICAgIGlmIG1hcmtkb3duUHJldmlldyBhbmQgdG9jRW5hYmxlZCBhbmQgdXBkYXRlVE9DKG1hcmtkb3duUHJldmlldywgdG9jQ29uZmlncylcbiAgICAgIHJldHVybiBwYXJzZU1EKG1hcmtkb3duUHJldmlldy5lZGl0b3IuZ2V0VGV4dCgpLCBvcHRpb24sIGNhbGxiYWNrKVxuXG4gICAgaHRtbCA9IHJlc29sdmVJbWFnZVBhdGhBbmRDb2RlQmxvY2soaHRtbCwgZ3JhcGhEYXRhLCBjb2RlQ2h1bmtzRGF0YSwgb3B0aW9uKVxuICAgIHJldHVybiBjYWxsYmFjayh7aHRtbDogZnJvbnRNYXR0ZXJUYWJsZStodG1sLCBzbGlkZUNvbmZpZ3MsIHlhbWxDb25maWd9KVxuXG4gIGlmIHVzZVBhbmRvY1BhcnNlciAjIHBhbmRvYyBwYXJzZXJcbiAgICBhcmdzID0geWFtbENvbmZpZy5wYW5kb2NfYXJncyBvciBbXVxuICAgIGFyZ3MgPSBbXSBpZiBub3QgKGFyZ3MgaW5zdGFuY2VvZiBBcnJheSlcbiAgICBpZiB5YW1sQ29uZmlnLmJpYmxpb2dyYXBoeSBvciB5YW1sQ29uZmlnLnJlZmVyZW5jZXNcbiAgICAgIGFyZ3MucHVzaCgnLS1maWx0ZXInLCAncGFuZG9jLWNpdGVwcm9jJylcblxuICAgIGFyZ3MgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGFuZG9jQXJndW1lbnRzJykuc3BsaXQoJywnKS5tYXAoKHgpLT4geC50cmltKCkpLmNvbmNhdChhcmdzKVxuXG4gICAgcmV0dXJuIHBhbmRvY1JlbmRlciBpbnB1dFN0cmluZywge2FyZ3MsIHByb2plY3REaXJlY3RvcnlQYXRoOiBvcHRpb24ucHJvamVjdERpcmVjdG9yeVBhdGgsIGZpbGVEaXJlY3RvcnlQYXRoOiBvcHRpb24uZmlsZURpcmVjdG9yeVBhdGh9LCAoZXJyb3IsIGh0bWwpLT5cbiAgICAgIGh0bWwgPSBcIjxwcmU+I3tlcnJvcn08L3ByZT5cIiBpZiBlcnJvclxuICAgICAgIyBjb25zb2xlLmxvZyhodG1sKVxuICAgICAgIyBmb3JtYXQgYmxvY2tzXG4gICAgICAkID0gY2hlZXJpby5sb2FkKGh0bWwpXG4gICAgICAkKCdwcmUnKS5lYWNoIChpLCBwcmVFbGVtZW50KS0+XG4gICAgICAgICMgY29kZSBibG9ja1xuICAgICAgICBpZiBwcmVFbGVtZW50LmNoaWxkcmVuWzBdPy5uYW1lID09ICdjb2RlJ1xuICAgICAgICAgICRwcmVFbGVtZW50ID0gJChwcmVFbGVtZW50KVxuICAgICAgICAgIGNvZGVCbG9jayA9ICQocHJlRWxlbWVudCkuY2hpbGRyZW4oKS5maXJzdCgpXG4gICAgICAgICAgY2xhc3NlcyA9IChjb2RlQmxvY2suYXR0cignY2xhc3MnKT8uc3BsaXQoJyAnKSBvciBbXSkuZmlsdGVyICh4KS0+IHggIT0gJ3NvdXJjZUNvZGUnXG4gICAgICAgICAgbGFuZyA9IGNsYXNzZXNbMF1cblxuICAgICAgICAgICMgZ3JhcGhzXG4gICAgICAgICAgaWYgJHByZUVsZW1lbnQuYXR0cignY2xhc3MnKT8ubWF0Y2goLyhtZXJtYWlkfHZpenxkb3R8cHVtbHxwbGFudHVtbHx3YXZlZHJvbSkvKVxuICAgICAgICAgICAgbGFuZyA9ICRwcmVFbGVtZW50LmF0dHIoJ2NsYXNzJylcbiAgICAgICAgICBjb2RlQmxvY2suYXR0cignY2xhc3MnLCAnbGFuZ3VhZ2UtJyArIGxhbmcpXG5cbiAgICAgICAgICAjIGNoZWNrIGNvZGUgY2h1bmtcbiAgICAgICAgICBkYXRhQ29kZUNodW5rID0gJHByZUVsZW1lbnQucGFyZW50KCk/LmF0dHIoJ2RhdGEtY29kZS1jaHVuaycpXG4gICAgICAgICAgaWYgZGF0YUNvZGVDaHVua1xuICAgICAgICAgICAgY29kZUJsb2NrLmF0dHIoJ2NsYXNzJywgJ2xhbmd1YWdlLScgKyBkYXRhQ29kZUNodW5rLnVuZXNjYXBlKCkpXG5cbiAgICAgIHJldHVybiBmaW5hbGl6ZSgkLmh0bWwoKSlcbiAgZWxzZSAjIHJlbWFya2FibGUgcGFyc2VyXG4gICAgIyBwYXJzZSBtYXJrZG93blxuICAgIGh0bWwgPSBtZC5yZW5kZXIoaW5wdXRTdHJpbmcpXG4gICAgIyBjb25zb2xlLmxvZyhodG1sKVxuICAgIHJldHVybiBmaW5hbGl6ZShodG1sKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcGFyc2VNRCxcbiAgYnVpbGRTY3JvbGxNYXAsXG4gIHByb2Nlc3NGcm9udE1hdHRlclxufVxuIl19
