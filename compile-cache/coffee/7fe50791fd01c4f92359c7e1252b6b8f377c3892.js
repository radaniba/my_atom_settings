(function() {
  var DISABLE_SYNC_LINE, File, HEIGHTS_DELTA, Highlights, TAGS_TO_REPLACE, TAGS_TO_REPLACE_REVERSE, buildScrollMap, checkGraph, cheerio, customSubjects, defaults, enableWikiLinkSyntax, fileImport, frontMatterRenderingOption, fs, getRealDataLine, globalMathTypesettingData, highlighter, insertAnchors, katex, loadMermaidConfig, mathRenderingIndicator, mathRenderingOption, matter, md, mermaidAPI, pandocRender, parseMD, parseMath, path, processFrontMatter, protocolsWhiteListRegExp, remarkable, resolveImagePathAndCodeBlock, scopeForLanguageName, toc, updateTOC, usePandocParser, useStandardCodeFencingForGraphs, uslug, wikiLinkFileExtension;

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

  wikiLinkFileExtension = atom.config.get('markdown-preview-enhanced.wikiLinkFileExtension');

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

  atom.config.observe('markdown-preview-enhanced.wikiLinkFileExtension', function(extension) {
    return wikiLinkFileExtension = extension;
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
    wikiLink = splits.length === 2 ? "" + (splits[1].trim()) + wikiLinkFileExtension : "" + (linkText.replace(/\s/g, '')) + wikiLinkFileExtension;
    return "<a href=\"" + wikiLink + "\">" + linkText + "</a>";
  };

  md.block.ruler.before('code', 'custom-comment', function(state, start, end, silent) {
    var content, e, firstIndexOfSpace, i, key, match, max, option, pos, rest, src, subject, value;
    pos = state.bMarks[start] + state.tShift[start];
    max = state.eMarks[start];
    src = state.src;
    if (pos >= max) {
      return false;
    }
    if (src.startsWith('<!--', pos)) {
      end = src.indexOf('-->', pos + 4);
      if (end >= 0) {
        content = src.slice(pos + 4, end).trim();
        match = content.match(/(\s|\n)/);
        if (!match) {
          firstIndexOfSpace = content.length;
        } else {
          firstIndexOfSpace = match.index;
        }
        subject = content.slice(0, firstIndexOfSpace);
        if (!customSubjects[subject]) {
          state.line = start + 1 + (src.slice(pos + 4, end).match(/\n/g) || []).length;
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
        state.line = start + 1 + (src.slice(pos + 4, end).match(/\n/g) || []).length;
        return true;
      } else {
        return false;
      }
    } else if (src[pos] === '[' && src.slice(pos, max).match(/^\[toc\]\s*$/i)) {
      state.tokens.push({
        type: 'custom',
        subject: 'toc-bracket',
        line: getRealDataLine(state.line),
        option: {}
      });
      state.line = start + 1;
      return true;
    } else {
      return false;
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
          lang = codeBlock.attr('class').replace(/^language-/, '').toLowerCase() || 'text';
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
    var args, codeChunksData, finalize, frontMatterTable, graphData, html, key, markdownPreview, ref, ref1, slideConfigs, tocBracketEnabled, tocConfigs, tocEnabled, tocTable, yamlConfig;
    if (option == null) {
      option = {};
    }
    markdownPreview = option.markdownPreview;
    DISABLE_SYNC_LINE = !option.isForPreview;
    HEIGHTS_DELTA = [];
    tocTable = {};
    tocEnabled = false;
    tocBracketEnabled = false;
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
        } else if (subject === 'toc-bracket') {
          tocBracketEnabled = true;
          return '\n[MPETOC]\n';
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
      var ref2, tocHtml, tocObject;
      if (markdownPreview && tocEnabled && updateTOC(markdownPreview, tocConfigs)) {
        return parseMD(markdownPreview.editor.getText(), option, callback);
      }
      if (tocBracketEnabled) {
        tocObject = toc(tocConfigs.headings, {
          ordered: false,
          depthFrom: 1,
          depthTo: 6,
          tab: (markdownPreview != null ? (ref2 = markdownPreview.editor) != null ? ref2.getTabText() : void 0 : void 0) || '\t'
        });
        DISABLE_SYNC_LINE = true;
        tocHtml = md.render(tocObject.content);
        html = html.replace(/^\s*\[MPETOC\]\s*/gm, tocHtml);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLFVBQUEsR0FBYSxPQUFBLENBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsWUFBakMsRUFBK0MsMkNBQS9DLENBQVI7O0VBQ1osT0FBUSxPQUFBLENBQVEsTUFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGFBQVI7O0VBRVIsYUFBYyxPQUFBLENBQVEsd0NBQVI7O0VBQ2YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNMLHVCQUF3QixPQUFBLENBQVEsb0JBQVI7O0VBQ3pCLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtCQUFSOztFQUNqQixVQUFBLEdBQWEsT0FBQSxDQUFRLHNCQUFSOztFQUNaLDJCQUE0QixPQUFBLENBQVEsdUJBQVI7O0VBQzVCLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFFakIsbUJBQUEsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtDQUFoQjs7RUFDdEIsc0JBQUEsR0FBeUI7SUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQUQsQ0FBUjtJQUFzQixLQUFBLEVBQU8sQ0FBQyxDQUFDLElBQUQsRUFBTyxJQUFQLENBQUQsQ0FBN0I7OztFQUN6Qixv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YSxDQUFDLFFBQWQsQ0FBQSxDQUF0QyxFQURGO2FBYkY7O1FBRlksQ0FBZDtBQWtCQSxlQUFPLFFBQUEsQ0FBUyxDQUFDLENBQUMsSUFBRixDQUFBLENBQVQ7TUF2QmdJLENBQWxJLEVBUlQ7S0FBQSxNQUFBO01Ba0NFLElBQUEsR0FBTyxFQUFFLENBQUMsTUFBSCxDQUFVLFdBQVY7QUFFUCxhQUFPLFFBQUEsQ0FBUyxJQUFULEVBcENUOztFQS9IUTs7RUFxS1YsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixTQUFBLE9BRGU7SUFFZixnQkFBQSxjQUZlO0lBR2Ysb0JBQUEsa0JBSGU7O0FBcmlDakIiLCJzb3VyY2VzQ29udGVudCI6WyJrYXRleCA9IHJlcXVpcmUgJ2thdGV4J1xuY2hlZXJpbyA9IHJlcXVpcmUgJ2NoZWVyaW8nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5yZW1hcmthYmxlID0gcmVxdWlyZSAncmVtYXJrYWJsZSdcbnVzbHVnID0gcmVxdWlyZSAndXNsdWcnXG5IaWdobGlnaHRzID0gcmVxdWlyZShwYXRoLmpvaW4oYXRvbS5nZXRMb2FkU2V0dGluZ3MoKS5yZXNvdXJjZVBhdGgsICdub2RlX21vZHVsZXMvaGlnaGxpZ2h0cy9saWIvaGlnaGxpZ2h0cy5qcycpKVxue0ZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbm1hdHRlciA9IHJlcXVpcmUoJ2dyYXktbWF0dGVyJylcblxue21lcm1haWRBUEl9ID0gcmVxdWlyZSgnLi4vZGVwZW5kZW5jaWVzL21lcm1haWQvbWVybWFpZC5taW4uanMnKVxudG9jID0gcmVxdWlyZSgnLi90b2MnKVxue3Njb3BlRm9yTGFuZ3VhZ2VOYW1lfSA9IHJlcXVpcmUgJy4vZXh0ZW5zaW9uLWhlbHBlcidcbmN1c3RvbVN1YmplY3RzID0gcmVxdWlyZSAnLi9jdXN0b20tY29tbWVudCdcbmZpbGVJbXBvcnQgPSByZXF1aXJlKCcuL2ZpbGUtaW1wb3J0LmNvZmZlZScpXG57cHJvdG9jb2xzV2hpdGVMaXN0UmVnRXhwfSA9IHJlcXVpcmUoJy4vcHJvdG9jb2xzLXdoaXRlbGlzdCcpXG57cGFuZG9jUmVuZGVyfSA9IHJlcXVpcmUoJy4vcGFuZG9jLWNvbnZlcnQnKVxuXG5tYXRoUmVuZGVyaW5nT3B0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hdGhSZW5kZXJpbmdPcHRpb24nKVxubWF0aFJlbmRlcmluZ0luZGljYXRvciA9IGlubGluZTogW1snJCcsICckJ11dLCBibG9jazogW1snJCQnLCAnJCQnXV1cbmVuYWJsZVdpa2lMaW5rU3ludGF4ID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmVuYWJsZVdpa2lMaW5rU3ludGF4Jylcbndpa2lMaW5rRmlsZUV4dGVuc2lvbiA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC53aWtpTGlua0ZpbGVFeHRlbnNpb24nKVxuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24nKVxuZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YSA9IHt9XG51c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMnKVxudXNlUGFuZG9jUGFyc2VyID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVBhbmRvY1BhcnNlcicpXG5cblRBR1NfVE9fUkVQTEFDRSA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgJ1xcJyc6ICcmI3gyNzsnLFxuICAgICdcXC8nLCAnJiN4MkY7JyxcbiAgICAnXFxcXCcsICcmI3g1QzsnLFxufVxuXG5UQUdTX1RPX1JFUExBQ0VfUkVWRVJTRSA9IHtcbiAgICAnJmFtcDsnOiAnJicsXG4gICAgJyZsdDsnOiAnPCcsXG4gICAgJyZndDsnOiAnPicsXG4gICAgJyZxdW90Oyc6ICdcIicsXG4gICAgJyZhcG9zOyc6ICdcXCcnLFxuICAgICcmI3gyNzsnOiAnXFwnJyxcbiAgICAnJiN4MkY7JzogJ1xcLycsXG4gICAgJyYjeDVDOyc6ICdcXFxcJyxcbn1cblxuaGlnaGxpZ2h0ZXIgPSBudWxsXG5TdHJpbmcucHJvdG90eXBlLmVzY2FwZSA9ICgpLT5cbiAgdGhpcy5yZXBsYWNlIC9bJjw+XCInXFwvXFxcXF0vZywgKHRhZyktPiBUQUdTX1RPX1JFUExBQ0VbdGFnXSBvciB0YWdcblxuU3RyaW5nLnByb3RvdHlwZS51bmVzY2FwZSA9ICgpLT5cbiAgdGhpcy5yZXBsYWNlIC9cXCYoYW1wfGx0fGd0fHF1b3R8YXBvc3xcXCN4Mjd8XFwjeDJGfFxcI3g1QylcXDsvZywgKHdob2xlKS0+IFRBR1NfVE9fUkVQTEFDRV9SRVZFUlNFW3dob2xlXSBvciB3aG9sZVxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIyBNZXJtYWlkXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubG9hZE1lcm1haWRDb25maWcgPSAoKS0+XG4gICMgbWVybWFpZF9jb25maWcuanNcbiAgY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL21lcm1haWRfY29uZmlnLmpzJylcbiAgdHJ5XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aClcbiAgY2F0Y2ggZXJyb3JcbiAgICBtZXJtYWlkQ29uZmlnRmlsZSA9IG5ldyBGaWxlKGNvbmZpZ1BhdGgpXG4gICAgbWVybWFpZENvbmZpZ0ZpbGUuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgaWYgIWZsYWcgIyBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIG1lcm1haWRfY29uZmlnLmpzJywgZGV0YWlsOiAndGhlcmUgbWlnaHQgYmUgZXJyb3JzIGluIHlvdXIgY29uZmlnIGZpbGUnKVxuICAgICAgICByZXR1cm5cblxuICAgICAgbWVybWFpZENvbmZpZ0ZpbGUud3JpdGUgXCJcIlwiXG4ndXNlIHN0cmljdCdcbi8vIGNvbmZpZyBtZXJtYWlkIGluaXQgY2FsbFxuLy8gaHR0cDovL2tuc3YuZ2l0aHViLmlvL21lcm1haWQvI2NvbmZpZ3VyYXRpb25cbi8vXG4vLyB5b3UgY2FuIGVkaXQgdGhlICdjb25maWcnIHZhcmlhYmxlIGJlbG93XG4vLyBldmVyeXRpbWUgeW91IGNoYW5nZWQgdGhpcyBmaWxlLCB5b3UgbWF5IG5lZWQgdG8gcmVzdGFydCBhdG9tLlxubGV0IGNvbmZpZyA9IHtcbiAgc3RhcnRPbkxvYWQ6IGZhbHNlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uZmlnIHx8IHtzdGFydE9uTG9hZDogZmFsc2V9XG5cIlwiXCJcbiAgICByZXR1cm4ge3N0YXJ0T25Mb2FkOiBmYWxzZX1cblxubWVybWFpZEFQSS5pbml0aWFsaXplKGxvYWRNZXJtYWlkQ29uZmlnKCkpXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMjIE1hdGhcbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicsXG4gIChvcHRpb24pLT5cbiAgICBpZiBvcHRpb24gPT0gJ05vbmUnXG4gICAgICBtYXRoUmVuZGVyaW5nT3B0aW9uID0gbnVsbFxuICAgIGVsc2VcbiAgICAgIG1hdGhSZW5kZXJpbmdPcHRpb24gPSBvcHRpb25cblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nSW5saW5lJyxcbiAgKGluZGljYXRvclN0ciktPlxuICAgIHRyeVxuICAgICAgaW5kaWNhdG9ycyA9IEpTT04ucGFyc2UoaW5kaWNhdG9yU3RyKS5maWx0ZXIgKHgpLT54Lmxlbmd0aCA9PSAyXG4gICAgICBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmlubGluZSA9IGluZGljYXRvcnNcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5sb2cgZXJyb3JcblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nQmxvY2snLFxuICAoaW5kaWNhdG9yU3RyKS0+XG4gICAgdHJ5XG4gICAgICBpbmRpY2F0b3JzID0gSlNPTi5wYXJzZShpbmRpY2F0b3JTdHIpLmZpbHRlciAoeCktPngubGVuZ3RoID09IDJcbiAgICAgIG1hdGhSZW5kZXJpbmdJbmRpY2F0b3IuYmxvY2sgPSBpbmRpY2F0b3JzXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGNvbnNvbGUubG9nIGVycm9yXG5cbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlV2lraUxpbmtTeW50YXgnLFxuICAoZmxhZyktPlxuICAgIGVuYWJsZVdpa2lMaW5rU3ludGF4ID0gZmxhZ1xuXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLndpa2lMaW5rRmlsZUV4dGVuc2lvbicsIChleHRlbnNpb24pLT5cbiAgd2lraUxpbmtGaWxlRXh0ZW5zaW9uID0gZXh0ZW5zaW9uXG5cbmF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24nLFxuICAoZmxhZyktPlxuICAgIGZyb250TWF0dGVyUmVuZGVyaW5nT3B0aW9uID0gZmxhZ1xuXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMnLCAoZmxhZyktPlxuICB1c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzID0gZmxhZ1xuXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVBhbmRvY1BhcnNlcicsIChmbGFnKS0+XG4gIHVzZVBhbmRvY1BhcnNlciA9IGZsYWdcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyMgUmVtYXJrYWJsZVxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuZGVmYXVsdHMgPVxuICBodG1sOiAgICAgICAgIHRydWUsICAgICAgICAjIEVuYWJsZSBIVE1MIHRhZ3MgaW4gc291cmNlXG4gIHhodG1sT3V0OiAgICAgZmFsc2UsICAgICAgICMgVXNlICcvJyB0byBjbG9zZSBzaW5nbGUgdGFncyAoPGJyIC8+KVxuICBicmVha3M6ICAgICAgIHRydWUsICAgICAgICAjIENvbnZlcnQgJ1xcbicgaW4gcGFyYWdyYXBocyBpbnRvIDxicj5cbiAgbGFuZ1ByZWZpeDogICAnbGFuZ3VhZ2UtJywgIyBDU1MgbGFuZ3VhZ2UgcHJlZml4IGZvciBmZW5jZWQgYmxvY2tzXG4gIGxpbmtpZnk6ICAgICAgdHJ1ZSwgICAgICAgICMgYXV0b2NvbnZlcnQgVVJMLWxpa2UgdGV4dHMgdG8gbGlua3NcbiAgbGlua1RhcmdldDogICAnJywgICAgICAgICAgIyBzZXQgdGFyZ2V0IHRvIG9wZW4gbGluayBpblxuICB0eXBvZ3JhcGhlcjogIHRydWUsICAgICAgICAjIEVuYWJsZSBzbWFydHlwYW50cyBhbmQgb3RoZXIgc3dlZXQgdHJhbnNmb3Jtc1xuXG5tZCA9IG5ldyByZW1hcmthYmxlKCdmdWxsJywgZGVmYXVsdHMpXG5cbkRJU0FCTEVfU1lOQ19MSU5FID0gZmFsc2VcbkhFSUdIVFNfREVMVEEgPSBbXSAjIFtbcmVhbFN0YXJ0LCBzdGFydCwgaGVpZ2h0LCBhY2NdLCAuLi5dIGZvciBpbXBvcnQgZmlsZXNcblxuIyBmaXggZGF0YS1saW5lIGFmdGVyIGltcG9ydCBleHRlcm5hbCBmaWxlc1xuZ2V0UmVhbERhdGFMaW5lID0gKGxpbmVObyktPlxuICByZXR1cm4gbGluZU5vIGlmICFIRUlHSFRTX0RFTFRBLmxlbmd0aFxuICBpID0gSEVJR0hUU19ERUxUQS5sZW5ndGggLSAxXG4gIHdoaWxlIGkgPj0gMFxuICAgIHtyZWFsU3RhcnQsIHN0YXJ0LCBoZWlnaHQsIGFjY30gPSBIRUlHSFRTX0RFTFRBW2ldXG4gICAgaWYgbGluZU5vID09IHN0YXJ0XG4gICAgICAjIGNvbnNvbGUubG9nKGxpbmVObywgSEVJR0hUU19ERUxUQSwgcmVhbFN0YXJ0KVxuICAgICAgcmV0dXJuIHJlYWxTdGFydFxuICAgIGVsc2UgaWYgbGluZU5vID4gc3RhcnRcbiAgICAgIGlmIGxpbmVObyA8IHN0YXJ0ICsgaGVpZ2h0ICMgaW1wb3J0ZWQgY29udGVudFxuICAgICAgICAjIGNvbnNvbGUubG9nKGxpbmVObywgSEVJR0hUU19ERUxUQSwgcmVhbFN0YXJ0KVxuICAgICAgICByZXR1cm4gcmVhbFN0YXJ0XG4gICAgICBlbHNlXG4gICAgICAgICMgY29uc29sZS5sb2cobGluZU5vLCBIRUlHSFRTX0RFTFRBLCBsaW5lTm8gLSBhY2MgLSBoZWlnaHQgKyBpICsgMSlcbiAgICAgICAgcmV0dXJuIGxpbmVObyAtIGFjYyAtIGhlaWdodCArIGkgKyAxXG4gICAgaSAtPSAxXG4gIHJldHVybiBsaW5lTm9cblxuXG5hdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmJyZWFrT25TaW5nbGVOZXdsaW5lJyxcbiAgKGJyZWFrT25TaW5nbGVOZXdsaW5lKS0+XG4gICAgbWQuc2V0KHticmVha3M6IGJyZWFrT25TaW5nbGVOZXdsaW5lfSlcblxuYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVUeXBvZ3JhcGhlcicsIChlbmFibGVUeXBvZ3JhcGhlciktPlxuICBtZC5zZXQoe3R5cG9ncmFwaGVyOiBlbmFibGVUeXBvZ3JhcGhlcn0pXG5cblxuIyBpbmxpbmUgTUFUSCBydWxlXG4jICQuLi4kXG4jICQkLi4uJCRcbm1kLmlubGluZS5ydWxlci5iZWZvcmUgJ2VzY2FwZScsICdtYXRoJyxcbiAgKHN0YXRlLCBzaWxlbnQpLT5cbiAgICBpZiAhbWF0aFJlbmRlcmluZ09wdGlvblxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBvcGVuVGFnID0gbnVsbFxuICAgIGNsb3NlVGFnID0gbnVsbFxuICAgIGRpc3BsYXlNb2RlID0gdHJ1ZVxuICAgIGlubGluZSA9IG1hdGhSZW5kZXJpbmdJbmRpY2F0b3IuaW5saW5lXG4gICAgYmxvY2sgPSBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmJsb2NrXG5cbiAgICBmb3IgYiBpbiBibG9ja1xuICAgICAgaWYgc3RhdGUuc3JjLnN0YXJ0c1dpdGgoYlswXSwgc3RhdGUucG9zKVxuICAgICAgICBvcGVuVGFnID0gYlswXVxuICAgICAgICBjbG9zZVRhZyA9IGJbMV1cbiAgICAgICAgZGlzcGxheU1vZGUgPSB0cnVlXG4gICAgICAgIGJyZWFrXG5cbiAgICBpZiAhb3BlblRhZ1xuICAgICAgZm9yIGkgaW4gaW5saW5lXG4gICAgICAgIGlmIHN0YXRlLnNyYy5zdGFydHNXaXRoKGlbMF0sIHN0YXRlLnBvcylcbiAgICAgICAgICBvcGVuVGFnID0gaVswXVxuICAgICAgICAgIGNsb3NlVGFnID0gaVsxXVxuICAgICAgICAgIGRpc3BsYXlNb2RlID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuXG4gICAgaWYgIW9wZW5UYWdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY29udGVudCA9IG51bGxcbiAgICBlbmQgPSAtMVxuXG4gICAgaSA9IHN0YXRlLnBvcyArIG9wZW5UYWcubGVuZ3RoXG4gICAgd2hpbGUgaSA8IHN0YXRlLnNyYy5sZW5ndGhcbiAgICAgIGlmIHN0YXRlLnNyYy5zdGFydHNXaXRoKGNsb3NlVGFnLCBpKVxuICAgICAgICBlbmQgPSBpXG4gICAgICAgIGJyZWFrXG4gICAgICBlbHNlIGlmIHN0YXRlLnNyY1tpXSA9PSAnXFxcXCdcbiAgICAgICAgaSArPSAxXG4gICAgICBpICs9IDFcblxuICAgIGlmIGVuZCA+PSAwXG4gICAgICBjb250ZW50ID0gc3RhdGUuc3JjLnNsaWNlKHN0YXRlLnBvcyArIG9wZW5UYWcubGVuZ3RoLCBlbmQpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiBjb250ZW50IGFuZCAhc2lsZW50XG4gICAgICBzdGF0ZS5wdXNoXG4gICAgICAgIHR5cGU6ICdtYXRoJ1xuICAgICAgICBjb250ZW50OiBjb250ZW50LnRyaW0oKSxcbiAgICAgICAgb3BlblRhZzogb3BlblRhZ1xuICAgICAgICBjbG9zZVRhZzogY2xvc2VUYWdcbiAgICAgICAgZGlzcGxheU1vZGU6IGRpc3BsYXlNb2RlXG5cbiAgICAgIHN0YXRlLnBvcyArPSAoY29udGVudC5sZW5ndGggKyBvcGVuVGFnLmxlbmd0aCArIGNsb3NlVGFnLmxlbmd0aClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbnBhcnNlTWF0aCA9ICh7Y29udGVudCwgb3BlblRhZywgY2xvc2VUYWcsIGRpc3BsYXlNb2RlfSktPlxuICByZXR1cm4gaWYgIWNvbnRlbnRcbiAgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnS2FUZVgnXG4gICAgaWYgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5pc0ZvclByZXZpZXdcbiAgICAgIGRpc3BsYXlNb2RlQXR0ciA9IGlmIGRpc3BsYXlNb2RlIHRoZW4gJ2Rpc3BsYXktbW9kZScgZWxzZSAnJ1xuICAgICAgaWYgIWdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEua2F0ZXhfcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J2thdGV4LWV4cHMnICN7ZGlzcGxheU1vZGVBdHRyfT4je2NvbnRlbnQuZXNjYXBlKCl9PC9zcGFuPlwiXG4gICAgICBlbHNlXG4gICAgICAgIGVsZW1lbnQgPSBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLmthdGV4X3Muc3BsaWNlKDAsIDEpWzBdXG4gICAgICAgIGlmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykgPT0gY29udGVudCBhbmQgZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2Rpc3BsYXktbW9kZScpID09IGRpc3BsYXlNb2RlXG4gICAgICAgICAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J2thdGV4LWV4cHMnIGRhdGEtb3JpZ2luYWw9XFxcIiN7Y29udGVudH1cXFwiIGRhdGEtcHJvY2Vzc2VkICN7ZGlzcGxheU1vZGVBdHRyfT4je2VsZW1lbnQuaW5uZXJIVE1MfTwvc3Bhbj5cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J2thdGV4LWV4cHMnICN7ZGlzcGxheU1vZGVBdHRyfT4je2NvbnRlbnQuZXNjYXBlKCl9PC9zcGFuPlwiXG5cbiAgICBlbHNlICMgbm90IGZvciBwcmV2aWV3XG4gICAgICB0cnlcbiAgICAgICAgcmV0dXJuIGthdGV4LnJlbmRlclRvU3RyaW5nIGNvbnRlbnQsIHtkaXNwbGF5TW9kZX1cbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVybiBcIjxzcGFuIHN0eWxlPVxcXCJjb2xvcjogI2VlN2Y0OTsgZm9udC13ZWlnaHQ6IDUwMDtcXFwiPiN7ZXJyb3J9PC9zcGFuPlwiXG5cbiAgZWxzZSBpZiBtYXRoUmVuZGVyaW5nT3B0aW9uID09ICdNYXRoSmF4J1xuICAgIHRleHQgPSAob3BlblRhZyArIGNvbnRlbnQgKyBjbG9zZVRhZykucmVwbGFjZSgvXFxuL2csICcnKVxuICAgIHRhZyA9IGlmIGRpc3BsYXlNb2RlIHRoZW4gJ2RpdicgZWxzZSAnc3BhbidcblxuICAgICMgaWYgaXQncyBmb3IgcHJldmlld1xuICAgICMgd2UgbmVlZCB0byBzYXZlIHRoZSBtYXRoIGV4cHJlc3Npb24gZGF0YSB0byAnZGF0YS1vcmlnaW5hbCcgYXR0cmlidXRlXG4gICAgIyB0aGVuIHdlIGNvbXBhcmVkIGl0IHdpdGggdGV4dCB0byBzZWUgd2hldGhlciB0aGUgbWF0aCBleHByZXNzaW9uIGlzIG1vZGlmaWVkIG9yIG5vdC5cbiAgICBpZiBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLmlzRm9yUHJldmlld1xuICAgICAgaWYgIWdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEubWF0aGpheF9zLmxlbmd0aFxuICAgICAgICByZXR1cm4gXCI8I3t0YWd9IGNsYXNzPVxcXCJtYXRoamF4LWV4cHNcXFwiPiN7dGV4dC5lc2NhcGUoKX08LyN7dGFnfT5cIlxuICAgICAgZWxzZVxuICAgICAgICBlbGVtZW50ID0gZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5tYXRoamF4X3Muc3BsaWNlKDAsIDEpWzBdXG4gICAgICAgIGlmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykgPT0gdGV4dCBhbmQgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gdGFnIGFuZCBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS1wcm9jZXNzZWQnKSAgIyBtYXRoIGV4cHJlc3Npb24gbm90IGNoYW5nZWRcbiAgICAgICAgICByZXR1cm4gXCI8I3t0YWd9IGNsYXNzPVxcXCJtYXRoamF4LWV4cHNcXFwiIGRhdGEtb3JpZ2luYWw9XFxcIiN7dGV4dH1cXFwiIGRhdGEtcHJvY2Vzc2VkPiN7ZWxlbWVudC5pbm5lckhUTUx9PC8je3RhZ30+XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBcIjwje3RhZ30gY2xhc3M9XFxcIm1hdGhqYXgtZXhwc1xcXCI+I3t0ZXh0LmVzY2FwZSgpfTwvI3t0YWd9PlwiXG4gICAgZWxzZVxuICAgICAgIyMgdGhpcyBkb2Vzbid0IHdvcmtcbiAgICAgICMgZWxlbWVudCA9IGdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEubWF0aGpheF9zLnNwbGljZSgwLCAxKVswXVxuICAgICAgIyByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtYXRoamF4LWV4cHNcXFwiPiAje2VsZW1lbnQuaW5uZXJIVE1MfSA8L2Rpdj5cIlxuICAgICAgcmV0dXJuIHRleHQuZXNjYXBlKClcblxubWQucmVuZGVyZXIucnVsZXMubWF0aCA9ICh0b2tlbnMsIGlkeCktPlxuICByZXR1cm4gcGFyc2VNYXRoKHRva2Vuc1tpZHhdIG9yIHt9KVxuXG4jIGlubGluZSBbW11dIHJ1bGVcbiMgW1suLi5dXVxubWQuaW5saW5lLnJ1bGVyLmJlZm9yZSAnYXV0b2xpbmsnLCAnd2lraWxpbmsnLFxuICAoc3RhdGUsIHNpbGVudCktPlxuICAgIGlmICFlbmFibGVXaWtpTGlua1N5bnRheCBvciAhc3RhdGUuc3JjLnN0YXJ0c1dpdGgoJ1tbJywgc3RhdGUucG9zKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgY29udGVudCA9IG51bGxcbiAgICB0YWcgPSAnXV0nXG4gICAgZW5kID0gLTFcblxuICAgIGkgPSBzdGF0ZS5wb3MgKyB0YWcubGVuZ3RoXG4gICAgd2hpbGUgaSA8IHN0YXRlLnNyYy5sZW5ndGhcbiAgICAgIGlmIHN0YXRlLnNyY1tpXSA9PSAnXFxcXCdcbiAgICAgICAgaSs9MVxuICAgICAgZWxzZSBpZiBzdGF0ZS5zcmMuc3RhcnRzV2l0aCh0YWcsIGkpXG4gICAgICAgIGVuZCA9IGlcbiAgICAgICAgYnJlYWtcbiAgICAgIGkrPTFcblxuICAgIGlmIGVuZCA+PSAwICMgZm91bmQgXV1cbiAgICAgIGNvbnRlbnQgPSBzdGF0ZS5zcmMuc2xpY2Uoc3RhdGUucG9zICsgdGFnLmxlbmd0aCwgZW5kKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWYgY29udGVudCBhbmQgIXNpbGVudFxuICAgICAgc3RhdGUucHVzaFxuICAgICAgICB0eXBlOiAnd2lraWxpbmsnXG4gICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgIHN0YXRlLnBvcyArPSBjb250ZW50Lmxlbmd0aCArIDIgKiB0YWcubGVuZ3RoXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuXG5tZC5yZW5kZXJlci5ydWxlcy53aWtpbGluayA9ICh0b2tlbnMsIGlkeCktPlxuICB7Y29udGVudH0gPSB0b2tlbnNbaWR4XVxuICBpZiAhY29udGVudFxuICAgIHJldHVyblxuXG4gIHNwbGl0cyA9IGNvbnRlbnQuc3BsaXQoJ3wnKVxuICBsaW5rVGV4dCA9IHNwbGl0c1swXS50cmltKClcbiAgd2lraUxpbmsgPSBpZiBzcGxpdHMubGVuZ3RoID09IDIgdGhlbiBcIiN7c3BsaXRzWzFdLnRyaW0oKX0je3dpa2lMaW5rRmlsZUV4dGVuc2lvbn1cIiBlbHNlIFwiI3tsaW5rVGV4dC5yZXBsYWNlKC9cXHMvZywgJycpfSN7d2lraUxpbmtGaWxlRXh0ZW5zaW9ufVwiXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI3t3aWtpTGlua31cXFwiPiN7bGlua1RleHR9PC9hPlwiXG5cbiMgY3VzdG9tIGNvbW1lbnRcbm1kLmJsb2NrLnJ1bGVyLmJlZm9yZSAnY29kZScsICdjdXN0b20tY29tbWVudCcsXG4gIChzdGF0ZSwgc3RhcnQsIGVuZCwgc2lsZW50KS0+XG4gICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0XSArIHN0YXRlLnRTaGlmdFtzdGFydF1cbiAgICBtYXggPSBzdGF0ZS5lTWFya3Nbc3RhcnRdXG4gICAgc3JjID0gc3RhdGUuc3JjXG5cbiAgICBpZiBwb3MgPj0gbWF4XG4gICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgc3JjLnN0YXJ0c1dpdGgoJzwhLS0nLCBwb3MpXG4gICAgICBlbmQgPSBzcmMuaW5kZXhPZignLS0+JywgcG9zICsgNClcbiAgICAgIGlmIChlbmQgPj0gMClcbiAgICAgICAgY29udGVudCA9IHNyYy5zbGljZShwb3MgKyA0LCBlbmQpLnRyaW0oKVxuXG4gICAgICAgIG1hdGNoID0gY29udGVudC5tYXRjaCgvKFxcc3xcXG4pLykgIyBmaW5kICcgJyBvciAnXFxuJ1xuICAgICAgICBpZiAhbWF0Y2hcbiAgICAgICAgICBmaXJzdEluZGV4T2ZTcGFjZSA9IGNvbnRlbnQubGVuZ3RoXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaXJzdEluZGV4T2ZTcGFjZSA9IG1hdGNoLmluZGV4XG5cbiAgICAgICAgc3ViamVjdCA9IGNvbnRlbnQuc2xpY2UoMCwgZmlyc3RJbmRleE9mU3BhY2UpXG5cbiAgICAgICAgaWYgIWN1c3RvbVN1YmplY3RzW3N1YmplY3RdICMgY2hlY2sgaWYgaXQgaXMgYSB2YWxpZCBzdWJqZWN0XG4gICAgICAgICAgIyBpdCdzIG5vdCBhIHZhbGlkIHN1YmplY3QsIHRoZXJlZm9yZSBlc2NhcGUgaXRcbiAgICAgICAgICBzdGF0ZS5saW5lID0gc3RhcnQgKyAxICsgKHNyYy5zbGljZShwb3MgKyA0LCBlbmQpLm1hdGNoKC9cXG4vZyl8fFtdKS5sZW5ndGhcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgIHJlc3QgPSBjb250ZW50LnNsaWNlKGZpcnN0SW5kZXhPZlNwYWNlKzEpLnRyaW0oKVxuXG4gICAgICAgIG1hdGNoID0gcmVzdC5tYXRjaCgvKD86W15cXHNcXG46XCInXSt8XCJbXlwiXSpcInwnW14nXSonKSsvZykgIyBzcGxpdCBieSBzcGFjZSBhbmQgXFxuZXdsaW5lIGFuZCA6IChub3QgaW4gc2luZ2xlIGFuZCBkb3VibGUgcXVvdGV6eilcblxuICAgICAgICBpZiBtYXRjaCBhbmQgbWF0Y2gubGVuZ3RoICUgMiA9PSAwXG4gICAgICAgICAgb3B0aW9uID0ge31cbiAgICAgICAgICBpID0gMFxuICAgICAgICAgIHdoaWxlIGkgPCBtYXRjaC5sZW5ndGhcbiAgICAgICAgICAgIGtleSA9IG1hdGNoW2ldXG4gICAgICAgICAgICB2YWx1ZSA9IG1hdGNoW2krMV1cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBvcHRpb25ba2V5XSA9IEpTT04ucGFyc2UodmFsdWUpXG4gICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgIG51bGwgIyBkbyBub3RoaW5nXG4gICAgICAgICAgICBpICs9IDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wdGlvbiA9IHt9XG5cbiAgICAgICAgc3RhdGUudG9rZW5zLnB1c2hcbiAgICAgICAgICB0eXBlOiAnY3VzdG9tJ1xuICAgICAgICAgIHN1YmplY3Q6IHN1YmplY3RcbiAgICAgICAgICBsaW5lOiBnZXRSZWFsRGF0YUxpbmUoc3RhdGUubGluZSlcbiAgICAgICAgICBvcHRpb246IG9wdGlvblxuXG4gICAgICAgIHN0YXRlLmxpbmUgPSBzdGFydCArIDEgKyAoc3JjLnNsaWNlKHBvcyArIDQsIGVuZCkubWF0Y2goL1xcbi9nKXx8W10pLmxlbmd0aFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBlbHNlIGlmIHNyY1twb3NdID09ICdbJyBhbmQgc3JjLnNsaWNlKHBvcywgbWF4KS5tYXRjaCgvXlxcW3RvY1xcXVxccyokL2kpICMgW1RPQ11cbiAgICAgIHN0YXRlLnRva2Vucy5wdXNoXG4gICAgICAgIHR5cGU6ICdjdXN0b20nXG4gICAgICAgIHN1YmplY3Q6ICd0b2MtYnJhY2tldCdcbiAgICAgICAgbGluZTogZ2V0UmVhbERhdGFMaW5lKHN0YXRlLmxpbmUpXG4gICAgICAgIG9wdGlvbjoge31cbiAgICAgIHN0YXRlLmxpbmUgPSBzdGFydCArIDFcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiNcbiMgSW5qZWN0IGxpbmUgbnVtYmVycyBmb3Igc3luYyBzY3JvbGwuIE5vdGVzOlxuI1xuIyAtIFdlIHRyYWNrIG9ubHkgaGVhZGluZ3MgYW5kIHBhcmFncmFwaHMgb24gZmlyc3QgbGV2ZWwuIFRoYXQncyBlbm91Z3RoLlxuIyAtIEZvb3Rub3RlcyBjb250ZW50IGNhdXNlcyBqdW1wcy4gTGV2ZWwgbGltaXQgZmlsdGVyIGl0IGF1dG9tYXRpY2FsbHkuXG4jXG4jIFlJWUkgOiDov5nph4zmiJHkuI3ku4Xku4UgbWFwIOS6hiBsZXZlbCAwXG5tZC5yZW5kZXJlci5ydWxlcy5wYXJhZ3JhcGhfb3BlbiA9ICh0b2tlbnMsIGlkeCktPlxuICBsaW5lTm8gPSBudWxsXG4gIGlmIHRva2Vuc1tpZHhdLmxpbmVzIGFuZCAhRElTQUJMRV9TWU5DX0xJTkUgIyAvKiYmIHRva2Vuc1tpZHhdLmxldmVsID09IDAqLylcbiAgICBsaW5lTm8gPSB0b2tlbnNbaWR4XS5saW5lc1swXVxuICAgIHJldHVybiAnPHAgY2xhc3M9XCJzeW5jLWxpbmVcIiBkYXRhLWxpbmU9XCInICsgZ2V0UmVhbERhdGFMaW5lKGxpbmVObykgKyAnXCI+J1xuICByZXR1cm4gJzxwPidcblxuXG4jIHRhc2sgbGlzdFxubWQucmVuZGVyZXIucnVsZXMubGlzdF9pdGVtX29wZW4gPSAodG9rZW5zLCBpZHgpLT5cbiAgaWYgdG9rZW5zW2lkeCArIDJdXG4gICAgY2hpbGRyZW4gPSB0b2tlbnNbaWR4ICsgMl0uY2hpbGRyZW5cbiAgICBpZiAhY2hpbGRyZW4gb3IgIWNoaWxkcmVuWzBdPy5jb250ZW50XG4gICAgICByZXR1cm4gJzxsaT4nXG4gICAgbGluZSA9IGNoaWxkcmVuWzBdLmNvbnRlbnRcbiAgICBpZiBsaW5lLnN0YXJ0c1dpdGgoJ1sgXSAnKSBvciBsaW5lLnN0YXJ0c1dpdGgoJ1t4XSAnKSBvciBsaW5lLnN0YXJ0c1dpdGgoJ1tYXSAnKVxuICAgICAgY2hpbGRyZW5bMF0uY29udGVudCA9IGxpbmUuc2xpY2UoMylcbiAgICAgIGNoZWNrZWQgPSAhKGxpbmVbMV0gPT0gJyAnKVxuICAgICAgY2hlY2tCb3ggPSBcIjxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCIgY2xhc3M9XFxcInRhc2stbGlzdC1pdGVtLWNoZWNrYm94XFxcIiAje2lmIGNoZWNrZWQgdGhlbiAnY2hlY2tlZCcgZWxzZSAnJ30+XCJcbiAgICAgIGxldmVsID0gY2hpbGRyZW5bMF0ubGV2ZWxcbiAgICAgICMgY2hpbGRyZW4gPSBbe2NvbnRlbnQ6IGNoZWNrQm94LCB0eXBlOiAnaHRtbHRhZycsIGxldmVsfSwgLi4uY2hpbGRyZW5dXG4gICAgICBjaGlsZHJlbiA9IFt7Y29udGVudDogY2hlY2tCb3gsIHR5cGU6ICdodG1sdGFnJywgbGV2ZWx9XS5jb25jYXQoY2hpbGRyZW4pXG5cbiAgICAgIHRva2Vuc1tpZHggKyAyXS5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgICByZXR1cm4gJzxsaSBjbGFzcz1cInRhc2stbGlzdC1pdGVtXCI+J1xuICAgIHJldHVybiAnPGxpPidcbiAgZWxzZVxuICAgIHJldHVybiAnPGxpPidcblxuIyBjb2RlIGZlbmNlc1xuIyBtb2RpZmllZCB0byBzdXBwb3J0IGNvZGUgY2h1bmtcbiMgY2hlY2sgaHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcmVtYXJrYWJsZS9ibG9iLzg3NTU1NGFlZGI4NGM5ZGQxOTBkZThkMGI4NmM2NWQyNTcyZWFkZDUvbGliL3J1bGVzLmpzXG5tZC5yZW5kZXJlci5ydWxlcy5mZW5jZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBpbnN0YW5jZSktPlxuICB0b2tlbiA9IHRva2Vuc1tpZHhdXG4gIGxhbmdDbGFzcyA9ICcnXG4gIGxhbmdQcmVmaXggPSBvcHRpb25zLmxhbmdQcmVmaXhcbiAgbGluZVN0ciA9ICcnXG4gIGxhbmdOYW1lID0gdG9rZW4ucGFyYW1zLmVzY2FwZSgpXG5cbiAgaWYgdG9rZW4ucGFyYW1zXG4gICAgbGFuZ0NsYXNzID0gJyBjbGFzcz1cIicgKyBsYW5nUHJlZml4ICsgbGFuZ05hbWUgKyAnXCIgJztcblxuICBpZiB0b2tlbi5saW5lc1xuICAgIGxpbmVTdHIgPSBcIiBkYXRhLWxpbmU9XFxcIiN7Z2V0UmVhbERhdGFMaW5lKHRva2VuLmxpbmVzWzBdKX1cXFwiIFwiXG5cbiAgIyBnZXQgY29kZSBjb250ZW50XG4gIGNvbnRlbnQgPSB0b2tlbi5jb250ZW50LmVzY2FwZSgpXG5cbiAgIyBjb3BpZWQgZnJvbSBnZXRCcmVhayBmdW5jdGlvbi5cbiAgYnJlYWtfID0gJ1xcbidcbiAgaWYgaWR4IDwgdG9rZW5zLmxlbmd0aCAmJiB0b2tlbnNbaWR4XS50eXBlID09ICdsaXN0X2l0ZW1fY2xvc2UnXG4gICAgYnJlYWtfID0gJydcblxuICBpZiBsYW5nTmFtZSA9PSAnbWF0aCdcbiAgICBvcGVuVGFnID0gbWF0aFJlbmRlcmluZ0luZGljYXRvci5ibG9ja1swXVswXSBvciAnJCQnXG4gICAgY2xvc2VUYWcgPSBtYXRoUmVuZGVyaW5nSW5kaWNhdG9yLmJsb2NrWzBdWzFdIG9yICckJCdcbiAgICBtYXRoSHRtbCA9IHBhcnNlTWF0aCh7b3BlblRhZywgY2xvc2VUYWcsIGNvbnRlbnQsIGRpc3BsYXlNb2RlOiB0cnVlfSlcbiAgICByZXR1cm4gXCI8cCAje2xpbmVTdHJ9PiN7bWF0aEh0bWx9PC9wPlwiXG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlJyArIGxhbmdDbGFzcyArIGxpbmVTdHIgKyAnPicgKyBjb250ZW50ICsgJzwvY29kZT48L3ByZT4nICsgYnJlYWtfXG5cbiMgQnVpbGQgb2Zmc2V0cyBmb3IgZWFjaCBsaW5lIChsaW5lcyBjYW4gYmUgd3JhcHBlZClcbiMgVGhhdCdzIGEgYml0IGRpcnR5IHRvIHByb2Nlc3MgZWFjaCBsaW5lIGV2ZXJ5dGltZSwgYnV0IG9rIGZvciBkZW1vLlxuIyBPcHRpbWl6YXRpb25zIGFyZSByZXF1aXJlZCBvbmx5IGZvciBiaWcgdGV4dHMuXG5idWlsZFNjcm9sbE1hcCA9IChtYXJrZG93blByZXZpZXcpLT5cbiAgZWRpdG9yID0gbWFya2Rvd25QcmV2aWV3LmVkaXRvclxuICBtYXJrZG93bkh0bWxWaWV3ID0gbWFya2Rvd25QcmV2aWV3LmdldEVsZW1lbnQoKVxuICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG5cbiAgX3Njcm9sbE1hcCA9IFtdXG4gIG5vbkVtcHR5TGlzdCA9IFtdXG5cbiAgYWNjID0gMFxuXG4gIGxpbmVzQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcblxuICBmb3IgaSBpbiBbMC4uLmxpbmVzQ291bnRdXG4gICAgX3Njcm9sbE1hcC5wdXNoKC0xKVxuXG4gIG5vbkVtcHR5TGlzdC5wdXNoKDApXG4gIF9zY3JvbGxNYXBbMF0gPSAwXG5cbiAgIyDmiormnInmoIforrAgZGF0YS1saW5lIOeahCBlbGVtZW50IOeahCBvZmZzZXRUb3Ag6K6w5b2V5YiwIF9zY3JvbGxNYXBcbiAgIyB3cml0ZSBkb3duIHRoZSBvZmZzZXRUb3Agb2YgZWxlbWVudCB0aGF0IGhhcyAnZGF0YS1saW5lJyBwcm9wZXJ0eSB0byBfc2Nyb2xsTWFwXG4gIGxpbmVFbGVtZW50cyA9IG1hcmtkb3duSHRtbFZpZXcuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc3luYy1saW5lJylcblxuICBmb3IgaSBpbiBbMC4uLmxpbmVFbGVtZW50cy5sZW5ndGhdXG4gICAgZWwgPSBsaW5lRWxlbWVudHNbaV1cbiAgICB0ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWxpbmUnKVxuICAgIGNvbnRpbnVlIGlmICF0XG5cbiAgICB0ID0gZWRpdG9yLnNjcmVlblJvd0ZvckJ1ZmZlclJvdyhwYXJzZUludCh0KSkgIyBnZXQgc2NyZWVuIGJ1ZmZlciByb3dcblxuICAgIGNvbnRpbnVlIGlmICF0XG5cbiAgICAjIHRoaXMgaXMgZm9yIGlnbm9yaW5nIGZvb3Rub3RlIHNjcm9sbCBtYXRjaFxuICAgIGlmIHQgPCBub25FbXB0eUxpc3Rbbm9uRW1wdHlMaXN0Lmxlbmd0aCAtIDFdXG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGluZScpXG4gICAgZWxzZVxuICAgICAgbm9uRW1wdHlMaXN0LnB1c2godClcblxuICAgICAgb2Zmc2V0VG9wID0gMFxuICAgICAgd2hpbGUgZWwgYW5kIGVsICE9IG1hcmtkb3duSHRtbFZpZXdcbiAgICAgICAgb2Zmc2V0VG9wICs9IGVsLm9mZnNldFRvcFxuICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudFxuXG4gICAgICBfc2Nyb2xsTWFwW3RdID0gTWF0aC5yb3VuZChvZmZzZXRUb3ApXG5cbiAgbm9uRW1wdHlMaXN0LnB1c2gobGluZXNDb3VudClcbiAgX3Njcm9sbE1hcC5wdXNoKG1hcmtkb3duSHRtbFZpZXcuc2Nyb2xsSGVpZ2h0KVxuXG4gIHBvcyA9IDBcbiAgZm9yIGkgaW4gWzEuLi5saW5lc0NvdW50XVxuICAgIGlmIF9zY3JvbGxNYXBbaV0gIT0gLTFcbiAgICAgIHBvcysrXG4gICAgICBjb250aW51ZVxuXG4gICAgYSA9IG5vbkVtcHR5TGlzdFtwb3NdXG4gICAgYiA9IG5vbkVtcHR5TGlzdFtwb3MgKyAxXVxuICAgIF9zY3JvbGxNYXBbaV0gPSBNYXRoLnJvdW5kKChfc2Nyb2xsTWFwW2JdICogKGkgLSBhKSArIF9zY3JvbGxNYXBbYV0gKiAoYiAtIGkpKSAvIChiIC0gYSkpXG5cbiAgcmV0dXJuIF9zY3JvbGxNYXAgICMgc2Nyb2xsTWFwJ3MgbGVuZ3RoID09IHNjcmVlbkxpbmVDb3VudFxuXG4jIGdyYXBoVHlwZSA9ICdtZXJtYWlkJyB8ICdwbGFudHVtbCcgfCAnd2F2ZWRyb20nXG5jaGVja0dyYXBoID0gKGdyYXBoVHlwZSwgZ3JhcGhBcnJheT1bXSwgcHJlRWxlbWVudCwgdGV4dCwgb3B0aW9uLCAkLCBvZmZzZXQ9LTEpLT5cbiAgaWYgb3B0aW9uLmlzRm9yUHJldmlld1xuICAgICRwcmVFbGVtZW50ID0gJChwcmVFbGVtZW50KVxuICAgIGlmICFncmFwaEFycmF5Lmxlbmd0aFxuICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtb2Zmc2V0PVxcXCIje29mZnNldH1cXFwiPiN7dGV4dH08L2Rpdj5cIilcbiAgICAgICRlbC5hdHRyICdkYXRhLW9yaWdpbmFsJywgdGV4dFxuXG4gICAgICAkcHJlRWxlbWVudC5yZXBsYWNlV2l0aCAkZWxcbiAgICBlbHNlXG4gICAgICBlbGVtZW50ID0gZ3JhcGhBcnJheS5zcGxpY2UoMCwgMSlbMF0gIyBnZXQgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgIGlmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykgPT0gdGV4dCBhbmQgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgPT0gJ3RydWUnICMgZ3JhcGggbm90IGNoYW5nZWRcbiAgICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtcHJvY2Vzc2VkPVxcXCJ0cnVlXFxcIiBkYXRhLW9mZnNldD1cXFwiI3tvZmZzZXR9XFxcIj4je2VsZW1lbnQuaW5uZXJIVE1MfTwvZGl2PlwiKVxuICAgICAgICAkZWwuYXR0ciAnZGF0YS1vcmlnaW5hbCcsIHRleHRcblxuICAgICAgICAkcHJlRWxlbWVudC5yZXBsYWNlV2l0aCAkZWxcbiAgICAgIGVsc2VcbiAgICAgICAgJGVsID0gJChcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiIGRhdGEtb2Zmc2V0PVxcXCIje29mZnNldH1cXFwiPiN7dGV4dH08L2Rpdj5cIilcbiAgICAgICAgJGVsLmF0dHIoJ2RhdGEtb3JpZ2luYWwnLCB0ZXh0KVxuXG4gICAgICAgICRwcmVFbGVtZW50LnJlcGxhY2VXaXRoICRlbFxuICBlbHNlIGlmIG9wdGlvbi5pc0ZvckVib29rXG4gICAgIyMjIGRvZXNuJ3Qgd29yay4uLlxuICAgIGlmIGdyYXBoVHlwZSA9PSAndml6J1xuICAgICAgVml6ID0gcmVxdWlyZSgnLi4vZGVwZW5kZW5jaWVzL3Zpei92aXouanMnKVxuICAgICAgJGVsID0gJChcIjxkaXY+PC9kaXY+XCIpXG4gICAgICAkZWwuaHRtbChWaXoodGV4dCkpXG4gICAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoICRlbFxuICAgIGVsc2VcbiAgICAgICQocHJlRWxlbWVudCkucmVwbGFjZVdpdGggXCI8cHJlPkdyYXBoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRUJvb2s8L3ByZT5cIlxuICAgICMjI1xuICAgICRlbCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCIje2dyYXBoVHlwZX0gbXBlLWdyYXBoXFxcIiAje2lmIGdyYXBoVHlwZSBpbiBbJ3dhdmVkcm9tJywgJ21lcm1haWQnXSB0aGVuIFwiZGF0YS1vZmZzZXQ9XFxcIiN7b2Zmc2V0fVxcXCJcIiBlbHNlICcnfT5HcmFwaCBpcyBub3Qgc3VwcG9ydGVkIGluIEVCb29rPC9kaXY+XCIpXG4gICAgJGVsLmF0dHIgJ2RhdGEtb3JpZ2luYWwnLCB0ZXh0XG5cbiAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoICRlbFxuICBlbHNlXG4gICAgZWxlbWVudCA9IGdyYXBoQXJyYXkuc3BsaWNlKDAsIDEpWzBdXG4gICAgaWYgZWxlbWVudFxuICAgICAgJChwcmVFbGVtZW50KS5yZXBsYWNlV2l0aCBcIjxkaXYgY2xhc3M9XFxcIiN7Z3JhcGhUeXBlfSBtcGUtZ3JhcGhcXFwiPiN7ZWxlbWVudC5pbm5lckhUTUx9PC9kaXY+XCJcbiAgICBlbHNlXG4gICAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoIFwiPHByZT5wbGVhc2Ugd2FpdCB0aWxsIHByZXZpZXcgZmluaXNoZXMgcmVuZGVyaW5nIGdyYXBoIDwvcHJlPlwiXG5cbiMgcmVzb2x2ZSBpbWFnZSBwYXRoIGFuZCBwcmUgY29kZSBibG9jay4uLlxuIyBjaGVjayBwYXJzZU1EIGZ1bmN0aW9uLCAnb3B0aW9uJyBpcyB0aGUgc2FtZSBhcyB0aGUgb3B0aW9uIGluIHBhc2VNRC5cbnJlc29sdmVJbWFnZVBhdGhBbmRDb2RlQmxvY2sgPSAoaHRtbCwgZ3JhcGhEYXRhPXt9LCBjb2RlQ2h1bmtzRGF0YT17fSwgIG9wdGlvbj17fSktPlxuICB7ZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRofSA9IG9wdGlvblxuXG4gIGlmICFmaWxlRGlyZWN0b3J5UGF0aFxuICAgIHJldHVyblxuXG4gICQgPSBjaGVlcmlvLmxvYWQoaHRtbClcbiAgd2F2ZWRyb21PZmZzZXQgPSAwXG4gIG1lcm1haWRPZmZzZXQgPSAwXG5cbiAgJCgnaW1nLCBhJykuZWFjaCAoaSwgaW1nRWxlbWVudCktPlxuICAgIHNyY1RhZyA9ICdzcmMnXG4gICAgaWYgaW1nRWxlbWVudC5uYW1lID09ICdhJ1xuICAgICAgc3JjVGFnID0gJ2hyZWYnXG5cbiAgICBpbWcgPSAkKGltZ0VsZW1lbnQpXG4gICAgc3JjID0gaW1nLmF0dHIoc3JjVGFnKVxuXG4gICAgaWYgc3JjIGFuZFxuICAgICAgKCEoc3JjLm1hdGNoKHByb3RvY29sc1doaXRlTGlzdFJlZ0V4cCkgb3JcbiAgICAgICAgc3JjLnN0YXJ0c1dpdGgoJ2RhdGE6aW1hZ2UvJykgb3JcbiAgICAgICAgc3JjWzBdID09ICcjJyBvclxuICAgICAgICBzcmNbMF0gPT0gJy8nKSlcbiAgICAgIGlmICFvcHRpb24udXNlUmVsYXRpdmVJbWFnZVBhdGhcbiAgICAgICAgaW1nLmF0dHIoc3JjVGFnLCAnZmlsZTovLy8nK3BhdGgucmVzb2x2ZShmaWxlRGlyZWN0b3J5UGF0aCwgIHNyYykpXG5cbiAgICBlbHNlIGlmIChzcmMgYW5kIHNyY1swXSA9PSAnLycpICAjIGFic29sdXRlIHBhdGhcbiAgICAgIGlmIG9wdGlvbi51c2VSZWxhdGl2ZUltYWdlUGF0aFxuICAgICAgICBpbWcuYXR0cihzcmNUYWcsIHBhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIHBhdGgucmVzb2x2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nICsgc3JjKSkpXG4gICAgICBlbHNlXG4gICAgICAgIGltZy5hdHRyKHNyY1RhZywgJ2ZpbGU6Ly8vJytwYXRoLnJlc29sdmUocHJvamVjdERpcmVjdG9yeVBhdGgsICcuJyArIHNyYykpXG5cbiAgcmVuZGVyQ29kZUJsb2NrID0gKHByZUVsZW1lbnQsIHRleHQsIGxhbmcsIGxpbmVObz1udWxsKS0+XG4gICAgaGlnaGxpZ2h0ZXIgPz0gbmV3IEhpZ2hsaWdodHMoe3JlZ2lzdHJ5OiBhdG9tLmdyYW1tYXJzLCBzY29wZVByZWZpeDogJ21wZS1zeW50YXgtLSd9KVxuICAgIGh0bWwgPSBoaWdobGlnaHRlci5oaWdobGlnaHRTeW5jXG4gICAgICAgICAgICBmaWxlQ29udGVudHM6IHRleHQsXG4gICAgICAgICAgICBzY29wZU5hbWU6IHNjb3BlRm9yTGFuZ3VhZ2VOYW1lKGxhbmcpXG5cbiAgICBoaWdobGlnaHRlZEJsb2NrID0gJChodG1sKVxuICAgIGhpZ2hsaWdodGVkQmxvY2sucmVtb3ZlQ2xhc3MoJ2VkaXRvcicpLmFkZENsYXNzKCdsYW5nLScgKyBsYW5nKVxuXG4gICAgaWYgbGluZU5vICE9IG51bGwgYW5kICFESVNBQkxFX1NZTkNfTElORVxuICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hdHRyKHsnZGF0YS1saW5lJzogbGluZU5vfSkgIyBubyBuZWVkIHRvIGNhbGwgZ2V0UmVhbERhdGFMaW5lIGhlcmVcbiAgICAgIGhpZ2hsaWdodGVkQmxvY2suYWRkQ2xhc3MoJ3N5bmMtbGluZScpXG5cbiAgICAkKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoKGhpZ2hsaWdodGVkQmxvY2spXG5cbiAgIyBwYXJzZSBlZzpcbiAgIyB7bm9kZSBhcmdzOltcIi12XCJdLCBvdXRwdXQ6XCJodG1sXCJ9XG4gIHJlbmRlckNvZGVDaHVuayA9IChwcmVFbGVtZW50LCB0ZXh0LCBwYXJhbWV0ZXJzLCBsaW5lTm89bnVsbCwgY29kZUNodW5rc0RhdGE9e30pLT5cbiAgICBtYXRjaCA9IHBhcmFtZXRlcnMubWF0Y2goL15cXHtcXHMqKFxcXCJbXlxcXCJdKlxcXCJ8W15cXHNdKnxbXn1dKikoLiopfSQvKVxuICAgIGxhbmcgPSBtYXRjaFsxXS50cmltKClcbiAgICBwYXJhbWV0ZXJzID0gbWF0Y2hbMl0udHJpbSgpXG4gICAgbGFuZyA9IGxhbmcuc2xpY2UoMSwgbGFuZy5sZW5ndGgtMSkudHJpbSgpIGlmIGxhbmdbMF0gPT0gJ1wiJ1xuXG4gICAgcmV0dXJuIGlmICFsYW5nXG5cbiAgICBoaWdobGlnaHRlZEJsb2NrID0gJydcbiAgICBidXR0b25Hcm91cCA9ICcnXG4gICAgaWYgbm90IC9cXHMqaGlkZVxccyo6XFxzKnRydWUvLnRlc3QocGFyYW1ldGVycylcbiAgICAgIGhpZ2hsaWdodGVyID89IG5ldyBIaWdobGlnaHRzKHtyZWdpc3RyeTogYXRvbS5ncmFtbWFycywgc2NvcGVQcmVmaXg6ICdtcGUtc3ludGF4LS0nfSlcbiAgICAgIGh0bWwgPSBoaWdobGlnaHRlci5oaWdobGlnaHRTeW5jXG4gICAgICAgICAgICAgIGZpbGVDb250ZW50czogdGV4dCxcbiAgICAgICAgICAgICAgc2NvcGVOYW1lOiBzY29wZUZvckxhbmd1YWdlTmFtZShsYW5nKVxuXG4gICAgICBoaWdobGlnaHRlZEJsb2NrID0gJChodG1sKVxuICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5yZW1vdmVDbGFzcygnZWRpdG9yJykuYWRkQ2xhc3MoJ2xhbmctJyArIGxhbmcpXG5cbiAgICAgIGlmIGxpbmVObyAhPSBudWxsIGFuZCAhRElTQUJMRV9TWU5DX0xJTkVcbiAgICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hdHRyKHsnZGF0YS1saW5lJzogbGluZU5vfSlcbiAgICAgICAgaGlnaGxpZ2h0ZWRCbG9jay5hZGRDbGFzcygnc3luYy1saW5lJylcblxuICAgICAgYnV0dG9uR3JvdXAgPSAnPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPjxkaXYgY2xhc3M9XCJydW4tYnRuIGJ0blwiPjxzcGFuPuKWtu+4jjwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJydW4tYWxsLWJ0biBidG5cXFwiPmFsbDwvZGl2PjwvZGl2PidcblxuICAgIHN0YXR1c0RpdiA9ICc8ZGl2IGNsYXNzPVwic3RhdHVzXCI+cnVubmluZy4uLjwvZGl2PidcblxuICAgICRlbCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJjb2RlLWNodW5rXFxcIj5cIiArIGhpZ2hsaWdodGVkQmxvY2sgKyBidXR0b25Hcm91cCArIHN0YXR1c0RpdiArICc8L2Rpdj4nKVxuICAgICRlbC5hdHRyICdkYXRhLWxhbmcnOiBsYW5nLCAnZGF0YS1hcmdzJzogcGFyYW1ldGVycywgJ2RhdGEtbGluZSc6IGxpbmVObywgJ2RhdGEtY29kZSc6IHRleHQsICdkYXRhLXJvb3QtZGlyZWN0b3J5LXBhdGgnOiBmaWxlRGlyZWN0b3J5UGF0aFxuXG4gICAgJChwcmVFbGVtZW50KS5yZXBsYWNlV2l0aCAkZWxcblxuICAkKCdwcmUnKS5lYWNoIChpLCBwcmVFbGVtZW50KS0+XG4gICAgbGluZU5vID0gbnVsbFxuICAgIGlmIHByZUVsZW1lbnQuY2hpbGRyZW5bMF0/Lm5hbWUgPT0gJ2NvZGUnXG4gICAgICBjb2RlQmxvY2sgPSAkKHByZUVsZW1lbnQpLmNoaWxkcmVuKCkuZmlyc3QoKVxuICAgICAgbGFuZyA9ICd0ZXh0J1xuICAgICAgaWYgY29kZUJsb2NrLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgbGFuZyA9IGNvZGVCbG9jay5hdHRyKCdjbGFzcycpLnJlcGxhY2UoL15sYW5ndWFnZS0vLCAnJykudG9Mb3dlckNhc2UoKSBvciAndGV4dCdcbiAgICAgIHRleHQgPSBjb2RlQmxvY2sudGV4dCgpXG5cbiAgICAgIGxpbmVObyA9IGNvZGVCbG9jay5hdHRyKCdkYXRhLWxpbmUnKVxuICAgIGVsc2VcbiAgICAgIGxhbmcgPSAndGV4dCdcbiAgICAgIGlmIHByZUVsZW1lbnQuY2hpbGRyZW5bMF1cbiAgICAgICAgdGV4dCA9IHByZUVsZW1lbnQuY2hpbGRyZW5bMF0uZGF0YVxuICAgICAgZWxzZVxuICAgICAgICB0ZXh0ID0gJydcblxuICAgIGlmIHVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHNcbiAgICAgIG1lcm1haWRSZWdFeHAgPSAvXlxcQD9tZXJtYWlkL1xuICAgICAgcGxhbnR1bWxSZWdFeHAgPSAvXlxcQD8ocGxhbnR1bWx8cHVtbCkvXG4gICAgICB3YXZlZHJvbVJlZ0V4cCA9IC9eXFxAP3dhdmVkcm9tL1xuICAgICAgdml6UmVnRXhwID0gL15cXEA/KHZpenxkb3QpL1xuICAgIGVsc2UgIyBvbmx5IHdvcmtzIHdpdGggQCBhcHBlbmRlZCBhdCBmcm9udFxuICAgICAgbWVybWFpZFJlZ0V4cCA9IC9eXFxAbWVybWFpZC9cbiAgICAgIHBsYW50dW1sUmVnRXhwID0gL15cXEAocGxhbnR1bWx8cHVtbCkvXG4gICAgICB3YXZlZHJvbVJlZ0V4cCA9IC9eXFxAd2F2ZWRyb20vXG4gICAgICB2aXpSZWdFeHAgPSAvXlxcQCh2aXp8ZG90KS9cblxuXG4gICAgaWYgbGFuZy5tYXRjaCBtZXJtYWlkUmVnRXhwXG4gICAgICBtZXJtYWlkLnBhcnNlRXJyb3IgPSAoZXJyLCBoYXNoKS0+XG4gICAgICAgIHJlbmRlckNvZGVCbG9jayhwcmVFbGVtZW50LCBlcnIsICd0ZXh0JylcblxuICAgICAgZWxlbWVudCA9IGdyYXBoRGF0YS5tZXJtYWlkX3M/WzBdXG4gICAgICAjIHByZXZlbnQgbWVybWFpZEFQSS5wYXJzZSBpZiBjb250ZW50IG5vdCBjaGFuZ2VkXG4gICAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9jZXNzZWQnKSA9PSAndHJ1ZScgJiYgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwnKSA9PSB0ZXh0KSBvciBtZXJtYWlkQVBJLnBhcnNlKHRleHQudHJpbSgpKVxuICAgICAgICBjaGVja0dyYXBoICdtZXJtYWlkJywgZ3JhcGhEYXRhLm1lcm1haWRfcywgcHJlRWxlbWVudCwgdGV4dCwgb3B0aW9uLCAkLCBtZXJtYWlkT2Zmc2V0XG5cbiAgICAgICAgbWVybWFpZE9mZnNldCArPSAxXG5cbiAgICBlbHNlIGlmIGxhbmcubWF0Y2ggcGxhbnR1bWxSZWdFeHBcbiAgICAgIGNoZWNrR3JhcGggJ3BsYW50dW1sJywgZ3JhcGhEYXRhLnBsYW50dW1sX3MsIHByZUVsZW1lbnQsIHRleHQsIG9wdGlvbiwgJFxuXG4gICAgZWxzZSBpZiBsYW5nLm1hdGNoIHdhdmVkcm9tUmVnRXhwXG4gICAgICBjaGVja0dyYXBoICd3YXZlZHJvbScsIGdyYXBoRGF0YS53YXZlZHJvbV9zLCBwcmVFbGVtZW50LCB0ZXh0LCBvcHRpb24sICQsIHdhdmVkcm9tT2Zmc2V0XG4gICAgICB3YXZlZHJvbU9mZnNldCArPSAxXG4gICAgZWxzZSBpZiBsYW5nLm1hdGNoIHZpelJlZ0V4cFxuICAgICAgY2hlY2tHcmFwaCAndml6JywgZ3JhcGhEYXRhLnZpel9zLCBwcmVFbGVtZW50LCB0ZXh0LCBvcHRpb24sICRcbiAgICBlbHNlIGlmIGxhbmdbMF0gPT0gJ3snICYmIGxhbmdbbGFuZy5sZW5ndGgtMV0gPT0gJ30nXG4gICAgICByZW5kZXJDb2RlQ2h1bmsocHJlRWxlbWVudCwgdGV4dCwgbGFuZywgbGluZU5vLCBjb2RlQ2h1bmtzRGF0YSlcbiAgICBlbHNlXG4gICAgICByZW5kZXJDb2RlQmxvY2socHJlRWxlbWVudCwgdGV4dCwgbGFuZywgbGluZU5vKVxuXG4gIHJldHVybiAkLmh0bWwoKVxuXG4jIyNcbiMgcHJvY2VzcyBpbnB1dCBzdHJpbmcsIHNraXAgZnJvbnQtbWF0dGVyXG5cbmlmIGRpc3BsYXkgdGFibGVcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiByZXN0IG9mIGlucHV0IHN0cmluZyBhZnRlciBza2lwcGluZyBmcm9udCBtYXR0ZXIgKGJ1dCB3aXRoICdcXG4nIGluY2x1ZGVkKVxuICAgIHRhYmxlOiBzdHJpbmcgb2YgPHRhYmxlPi4uLjwvdGFibGU+IGdlbmVyYXRlZCBmcm9tIGRhdGFcbiAgfVxuZWxzZVxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IHJlcGxhY2UgLS0tXFxuIHdpdGggYGBgeWFtbFxuICAgIHRhYmxlOiAnJyxcbiAgfVxuIyMjXG5wcm9jZXNzRnJvbnRNYXR0ZXIgPSAoaW5wdXRTdHJpbmcsIGhpZGVGcm9udE1hdHRlcj1mYWxzZSktPlxuICB0b1RhYmxlID0gKGFyZyktPlxuICAgIGlmIGFyZyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICB0Ym9keSA9IFwiPHRib2R5Pjx0cj5cIlxuICAgICAgZm9yIGl0ZW0gaW4gYXJnXG4gICAgICAgIHRib2R5ICs9IFwiPHRkPiN7dG9UYWJsZShpdGVtKX08L3RkPlwiXG4gICAgICB0Ym9keSArPSBcIjwvdHI+PC90Ym9keT5cIlxuXG4gICAgICBcIjx0YWJsZT4je3Rib2R5fTwvdGFibGU+XCJcbiAgICBlbHNlIGlmIHR5cGVvZihhcmcpID09ICdvYmplY3QnXG4gICAgICB0aGVhZCA9IFwiPHRoZWFkPjx0cj5cIlxuICAgICAgdGJvZHkgPSBcIjx0Ym9keT48dHI+XCJcbiAgICAgIGZvciBrZXkgb2YgYXJnXG4gICAgICAgIHRoZWFkICs9IFwiPHRoPiN7a2V5fTwvdGg+XCJcbiAgICAgICAgdGJvZHkgKz0gXCI8dGQ+I3t0b1RhYmxlKGFyZ1trZXldKX08L3RkPlwiXG4gICAgICB0aGVhZCArPSBcIjwvdHI+PC90aGVhZD5cIlxuICAgICAgdGJvZHkgKz0gXCI8L3RyPjwvdGJvZHk+XCJcblxuICAgICAgXCI8dGFibGU+I3t0aGVhZH0je3Rib2R5fTwvdGFibGU+XCJcbiAgICBlbHNlXG4gICAgICBhcmdcblxuICAjIGh0dHBzOi8vcmVnZXhwZXIuY29tL1xuICByID0gL14tezN9W1xcblxccl0oW1xcd3xcXFddKz8pW1xcblxccl0tezN9W1xcblxccl0vXG5cbiAgbWF0Y2ggPSByLmV4ZWMoaW5wdXRTdHJpbmcpXG5cbiAgaWYgbWF0Y2hcbiAgICB5YW1sU3RyID0gbWF0Y2hbMF1cbiAgICBkYXRhID0gbWF0dGVyKHlhbWxTdHIpLmRhdGFcblxuICAgIGlmIHVzZVBhbmRvY1BhcnNlciAjIHVzZSBwYW5kb2MgcGFyc2VyLCBzbyBkb24ndCBjaGFuZ2UgaW5wdXRTdHJpbmdcbiAgICAgIHJldHVybiB7Y29udGVudDogaW5wdXRTdHJpbmcsIHRhYmxlOiAnJywgZGF0YX1cbiAgICBlbHNlIGlmIGhpZGVGcm9udE1hdHRlciBvciBmcm9udE1hdHRlclJlbmRlcmluZ09wdGlvblswXSA9PSAnbicgIyBoaWRlXG4gICAgICBjb250ZW50ID0gJ1xcbicucmVwZWF0KHlhbWxTdHIubWF0Y2goL1xcbi9nKT8ubGVuZ3RoIG9yIDApICsgaW5wdXRTdHJpbmcuc2xpY2UoeWFtbFN0ci5sZW5ndGgpXG4gICAgICByZXR1cm4ge2NvbnRlbnQsIHRhYmxlOiAnJywgZGF0YX1cbiAgICBlbHNlIGlmIGZyb250TWF0dGVyUmVuZGVyaW5nT3B0aW9uWzBdID09ICd0JyAjIHRhYmxlXG4gICAgICBjb250ZW50ID0gJ1xcbicucmVwZWF0KHlhbWxTdHIubWF0Y2goL1xcbi9nKT8ubGVuZ3RoIG9yIDApICsgaW5wdXRTdHJpbmcuc2xpY2UoeWFtbFN0ci5sZW5ndGgpXG5cbiAgICAgICMgdG8gdGFibGVcbiAgICAgIGlmIHR5cGVvZihkYXRhKSA9PSAnb2JqZWN0J1xuICAgICAgICB0YWJsZSA9IHRvVGFibGUoZGF0YSlcbiAgICAgIGVsc2VcbiAgICAgICAgdGFibGUgPSBcIjxwcmU+RmFpbGVkIHRvIHBhcnNlIFlBTUwuPC9wcmU+XCJcblxuICAgICAgcmV0dXJuIHtjb250ZW50LCB0YWJsZSwgZGF0YX1cbiAgICBlbHNlICMgaWYgZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb25bMF0gPT0gJ2MnICMgY29kZSBibG9ja1xuICAgICAgY29udGVudCA9ICdgYGB5YW1sXFxuJyArIG1hdGNoWzFdICsgJ1xcbmBgYFxcbicgKyBpbnB1dFN0cmluZy5zbGljZSh5YW1sU3RyLmxlbmd0aClcblxuICAgICAgcmV0dXJuIHtjb250ZW50LCB0YWJsZTogJycsIGRhdGF9XG5cbiAge2NvbnRlbnQ6IGlucHV0U3RyaW5nLCB0YWJsZTogJyd9XG5cbiMjI1xudXBkYXRlIGVkaXRvciB0b2NcbnJldHVybiB0cnVlIGlmIHRvYyBpcyB1cGRhdGVkXG4jIyNcbnVwZGF0ZVRPQyA9IChtYXJrZG93blByZXZpZXcsIHRvY0NvbmZpZ3MpLT5cbiAgcmV0dXJuIGZhbHNlIGlmICFtYXJrZG93blByZXZpZXcgb3IgdG9jQ29uZmlncy50b2NTdGFydExpbmVfcy5sZW5ndGggIT0gdG9jQ29uZmlncy50b2NFbmRMaW5lX3MubGVuZ3RoXG5cbiAgZXF1YWwgPSAoYXJyMSwgYXJyMiktPlxuICAgIHJldHVybiBmYWxzZSBpZiBhcnIxLmxlbmd0aCAhPSBhcnIyLmxlbmd0aFxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IGFycjEubGVuZ3RoXG4gICAgICBpZiBhcnIxW2ldICE9IGFycjJbaV1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICBpICs9IDFcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRvY05lZWRVcGRhdGUgPSBmYWxzZVxuICBpZiAhbWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3NcbiAgICB0b2NOZWVkVXBkYXRlID0gdHJ1ZVxuICBlbHNlIGlmICFlcXVhbChtYXJrZG93blByZXZpZXcudG9jQ29uZmlncy50b2NPcmRlcmVkX3MsIHRvY0NvbmZpZ3MudG9jT3JkZXJlZF9zKSBvciAhZXF1YWwobWFya2Rvd25QcmV2aWV3LnRvY0NvbmZpZ3MudG9jRGVwdGhGcm9tX3MsIHRvY0NvbmZpZ3MudG9jRGVwdGhGcm9tX3MpIG9yICFlcXVhbChtYXJrZG93blByZXZpZXcudG9jQ29uZmlncy50b2NEZXB0aFRvX3MsIHRvY0NvbmZpZ3MudG9jRGVwdGhUb19zKVxuICAgIHRvY05lZWRVcGRhdGUgPSB0cnVlXG4gIGVsc2VcbiAgICBoZWFkaW5ncyA9IHRvY0NvbmZpZ3MuaGVhZGluZ3NcbiAgICBoZWFkaW5nczIgPSBtYXJrZG93blByZXZpZXcudG9jQ29uZmlncy5oZWFkaW5nc1xuICAgIGlmIGhlYWRpbmdzLmxlbmd0aCAhPSBoZWFkaW5nczIubGVuZ3RoXG4gICAgICB0b2NOZWVkVXBkYXRlID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZvciBpIGluIFswLi4uaGVhZGluZ3MubGVuZ3RoXVxuICAgICAgICBpZiBoZWFkaW5nc1tpXS5jb250ZW50ICE9IGhlYWRpbmdzMltpXS5jb250ZW50IG9yIGhlYWRpbmdzW2ldLmxldmVsICE9IGhlYWRpbmdzMltpXS5sZXZlbFxuICAgICAgICAgIHRvY05lZWRVcGRhdGUgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcblxuICBpZiB0b2NOZWVkVXBkYXRlXG4gICAgZWRpdG9yID0gbWFya2Rvd25QcmV2aWV3LmVkaXRvclxuICAgIGJ1ZmZlciA9IGVkaXRvci5idWZmZXJcbiAgICB0YWIgPSBlZGl0b3IuZ2V0VGFiVGV4dCgpIG9yICdcXHQnXG5cbiAgICBoZWFkaW5ncyA9IHRvY0NvbmZpZ3MuaGVhZGluZ3NcbiAgICB0b2NPcmRlcmVkX3MgPSB0b2NDb25maWdzLnRvY09yZGVyZWRfc1xuICAgIHRvY0RlcHRoRnJvbV9zID0gdG9jQ29uZmlncy50b2NEZXB0aEZyb21fc1xuICAgIHRvY0RlcHRoVG9fcyA9IHRvY0NvbmZpZ3MudG9jRGVwdGhUb19zXG4gICAgdG9jU3RhcnRMaW5lX3MgPSB0b2NDb25maWdzLnRvY1N0YXJ0TGluZV9zXG4gICAgdG9jRW5kTGluZV9zID0gdG9jQ29uZmlncy50b2NFbmRMaW5lX3NcblxuICAgIGlmIGJ1ZmZlclxuICAgICAgaSA9IDBcbiAgICAgIGRlbHRhID0gMFxuICAgICAgd2hpbGUgaSA8IHRvY09yZGVyZWRfcy5sZW5ndGhcbiAgICAgICAgdG9jT3JkZXJlZCA9IHRvY09yZGVyZWRfc1tpXVxuICAgICAgICB0b2NEZXB0aEZyb20gPSB0b2NEZXB0aEZyb21fc1tpXVxuICAgICAgICB0b2NEZXB0aFRvID0gdG9jRGVwdGhUb19zW2ldXG4gICAgICAgIHRvY1N0YXJ0TGluZSA9IHRvY1N0YXJ0TGluZV9zW2ldICsgZGVsdGFcbiAgICAgICAgdG9jRW5kTGluZSA9IHRvY0VuZExpbmVfc1tpXSArIGRlbHRhXG5cbiAgICAgICAgdG9jT2JqZWN0ID0gdG9jKGhlYWRpbmdzLCB7b3JkZXJlZDogdG9jT3JkZXJlZCwgZGVwdGhGcm9tOiB0b2NEZXB0aEZyb20sIGRlcHRoVG86IHRvY0RlcHRoVG8sIHRhYn0pXG5cbiAgICAgICAgYnVmZmVyLnNldFRleHRJblJhbmdlKFtbdG9jU3RhcnRMaW5lKzEsIDBdLCBbdG9jRW5kTGluZSwgMF1dLCAnXFxuXFxuXFxuJylcbiAgICAgICAgYnVmZmVyLmluc2VydChbdG9jU3RhcnRMaW5lKzIsIDBdLCB0b2NPYmplY3QuY29udGVudClcblxuICAgICAgICBkZWx0YSArPSAodG9jU3RhcnRMaW5lICsgdG9jT2JqZWN0LmFycmF5Lmxlbmd0aCArIDMgLSB0b2NFbmRMaW5lKVxuXG4gICAgICAgIG1hcmtkb3duUHJldmlldy5wYXJzZURlbGF5ID0gRGF0ZS5ub3coKSArIDUwMCAjIHByZXZlbnQgcmVuZGVyIGFnYWluXG4gICAgICAgIG1hcmtkb3duUHJldmlldy5lZGl0b3JTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcbiAgICAgICAgbWFya2Rvd25QcmV2aWV3LnByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcblxuICAgICAgICBpICs9IDFcblxuICBtYXJrZG93blByZXZpZXcudG9jQ29uZmlncyA9IHRvY0NvbmZpZ3NcbiAgcmV0dXJuIHRvY05lZWRVcGRhdGVcblxuIyBJbnNlcnQgYW5jaG9ycyBmb3Igc2Nyb2xsIHN5bmMuXG4jIHRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gdXNlUGFuZG9jUGFyc2VyLlxuaW5zZXJ0QW5jaG9ycyA9ICh0ZXh0KS0+XG4gICMgYW5jaG9yIGxvb2tzIGxpa2UgdGhpcyA8cCBkYXRhLWxpbmU9XCIyM1wiIGNsYXNzPVwic3luYy1saW5lXCIgc3R5bGU9XCJtYXJnaW46MDtcIj48L3A+XG4gIGNyZWF0ZUFuY2hvciA9IChsaW5lTm8pLT5cbiAgICBcIjxwIGRhdGEtbGluZT1cXFwiI3tsaW5lTm99XFxcIiBjbGFzcz1cXFwic3luYy1saW5lXFxcIiBzdHlsZT1cXFwibWFyZ2luOjA7XFxcIj48L3A+XFxuXCJcblxuICBvdXRwdXRTdHJpbmcgPSBcIlwiXG4gIGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgaSA9IDBcbiAgd2hpbGUgaSA8IGxpbmVzLmxlbmd0aFxuICAgIGxpbmUgPSBsaW5lc1tpXVxuXG4gICAgIyMjXG4gICAgYWRkIGFuY2hvcnMgd2hlbiBpdCBpc1xuICAgIDEuIGhlYWRpbmdcbiAgICAyLiBpbWFnZVxuICAgIDMuIGNvZGUgYmxvY2sgfCBjaHVua1xuICAgIDQuIEBpbXBvcnRcbiAgICA1LiBjb21tZW50XG4gICAgIyMjXG4gICAgaWYgbGluZS5tYXRjaCAvXihcXCN8XFwhXFxbfGBgYChcXHd8eyl8QGltcG9ydHxcXDwhLS0pL1xuICAgICAgb3V0cHV0U3RyaW5nICs9IGNyZWF0ZUFuY2hvcihpKVxuXG4gICAgaWYgbGluZS5tYXRjaCAvXmBgYChcXHd8eykvICMgYmVnaW4gb2YgY29kZSBibG9ja1xuICAgICAgb3V0cHV0U3RyaW5nICs9IGxpbmUgKyAnXFxuJ1xuICAgICAgaSArPSAxXG4gICAgICB3aGlsZSBpIDwgbGluZXMubGVuZ3RoXG4gICAgICAgIGxpbmUgPSBsaW5lc1tpXVxuICAgICAgICBpZiBsaW5lLm1hdGNoIC9eYGBgXFxzKi8gIyBlbmQgb2YgY29kZSBibG9ja1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvdXRwdXRTdHJpbmcgKz0gbGluZSArICdcXG4nXG4gICAgICAgICAgaSArPSAxXG5cbiAgICBvdXRwdXRTdHJpbmcgKz0gbGluZSArICdcXG4nXG4gICAgaSArPSAxXG5cbiAgb3V0cHV0U3RyaW5nXG5cbiMjI1xuIyBwYXJzZSBtYXJrZG93biBjb250ZW50IHRvIGh0bWxcblxuaW5wdXRTdHJpbmc6ICAgICAgICAgc3RyaW5nLCByZXF1aXJlZFxub3B0aW9uID0ge1xuICB1c2VSZWxhdGl2ZUltYWdlUGF0aDogICAgICAgYm9vbCwgb3B0aW9uYWxcbiAgaXNGb3JQcmV2aWV3OiAgICAgICAgIGJvb2wsIG9wdGlvbmFsXG4gIGlzRm9yRWJvb2s6ICAgICAgICAgICBib29sLCBvcHRpb25hbFxuICBoaWRlRnJvbnRNYXR0ZXI6ICAgICAgYm9vbCwgb3B0aW9uYWxcbiAgbWFya2Rvd25QcmV2aWV3OiAgICAgIE1hcmtkb3duUHJldmlld0VuaGFuY2VkVmlldywgb3B0aW9uYWxcblxuICBmaWxlRGlyZWN0b3J5UGF0aDogICAgc3RyaW5nLCByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGRpcmVjdG9yeSBwYXRoIG9mIHRoZSBtYXJrZG93biBmaWxlLlxuICBwcm9qZWN0RGlyZWN0b3J5UGF0aDogc3RyaW5nLCByZXF1aXJlZFxufVxuY2FsbGJhY2soZGF0YSlcbiMjI1xucGFyc2VNRCA9IChpbnB1dFN0cmluZywgb3B0aW9uPXt9LCBjYWxsYmFjayktPlxuICB7bWFya2Rvd25QcmV2aWV3fSA9IG9wdGlvblxuXG4gIERJU0FCTEVfU1lOQ19MSU5FID0gIShvcHRpb24uaXNGb3JQcmV2aWV3KSAjIHNldCBnbG9iYWwgdmFyaWFibGVcbiAgSEVJR0hUU19ERUxUQSA9IFtdXG5cbiAgIyB0b2NcbiAgdG9jVGFibGUgPSB7fSAjIGVsaW1pbmF0ZSByZXBlYXRlZCBzbHVnXG4gIHRvY0VuYWJsZWQgPSBmYWxzZVxuICB0b2NCcmFja2V0RW5hYmxlZCA9IGZhbHNlXG4gIHRvY0NvbmZpZ3MgPSB7XG4gICAgaGVhZGluZ3M6IFtdLFxuICAgIHRvY1N0YXJ0TGluZV9zOiBbXSxcbiAgICB0b2NFbmRMaW5lX3M6IFtdLFxuICAgIHRvY09yZGVyZWRfczogW10sXG4gICAgdG9jRGVwdGhGcm9tX3M6IFtdLFxuICAgIHRvY0RlcHRoVG9fczogW11cbiAgfVxuXG4gICMgc2xpZGVcbiAgc2xpZGVDb25maWdzID0gW11cblxuICAjIHlhbWxcbiAgeWFtbENvbmZpZyA9IG51bGxcblxuICAjIHdlIHdvbid0IHJlbmRlciB0aGUgZ3JhcGggdGhhdCBoYXNuJ3QgY2hhbmdlZFxuICBncmFwaERhdGEgPSBudWxsXG4gIGNvZGVDaHVua3NEYXRhID0gbnVsbFxuICBpZiBtYXJrZG93blByZXZpZXdcbiAgICBpZiBtYXJrZG93blByZXZpZXcuZ3JhcGhEYXRhXG4gICAgICBncmFwaERhdGEgPSB7fVxuICAgICAgZm9yIGtleSBvZiBtYXJrZG93blByZXZpZXcuZ3JhcGhEYXRhXG4gICAgICAgIGdyYXBoRGF0YVtrZXldID0gbWFya2Rvd25QcmV2aWV3LmdyYXBoRGF0YVtrZXldLnNsaWNlKDApICMgZml4IGlzc3VlIDE3Ny4uLiBhcyB0aGUgYXJyYXkgd2lsbCBiZSBgc3BsaWNlYCBpbiB0aGUgZnV0dXJlLCBzbyBuZWVkIHRvIGNyZWF0ZSBuZXcgYXJyYXkgaGVyZVxuICAgIGNvZGVDaHVua3NEYXRhID0gbWFya2Rvd25QcmV2aWV3LmNvZGVDaHVua3NEYXRhXG5cbiAgIyBzZXQgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YVxuICAjIHNvIHRoYXQgd2Ugd29uJ3QgcmVuZGVyIHRoZSBtYXRoIGV4cHJlc3Npb24gdGhhdCBoYXNuJ3QgY2hhbmdlZFxuICBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhID0ge31cbiAgaWYgbWFya2Rvd25QcmV2aWV3XG4gICAgZ2xvYmFsTWF0aFR5cGVzZXR0aW5nRGF0YS5pc0ZvclByZXZpZXcgPSBvcHRpb24uaXNGb3JQcmV2aWV3XG4gICAgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnS2FUZVgnXG4gICAgICBnbG9iYWxNYXRoVHlwZXNldHRpbmdEYXRhLmthdGV4X3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBtYXJrZG93blByZXZpZXcuZ2V0RWxlbWVudCgpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2thdGV4LWV4cHMnKVxuICAgIGVsc2UgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTWF0aEpheCdcbiAgICAgIGdsb2JhbE1hdGhUeXBlc2V0dGluZ0RhdGEubWF0aGpheF9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgbWFya2Rvd25QcmV2aWV3LmdldEVsZW1lbnQoKS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtYXRoamF4LWV4cHMnKVxuXG4gICMgY2hlY2sgZnJvbnQtbWF0dGVyXG4gIHt0YWJsZTpmcm9udE1hdHRlclRhYmxlLCBjb250ZW50OmlucHV0U3RyaW5nLCBkYXRhOnlhbWxDb25maWd9ID0gcHJvY2Vzc0Zyb250TWF0dGVyKGlucHV0U3RyaW5nLCBvcHRpb24uaGlkZUZyb250TWF0dGVyKVxuICB5YW1sQ29uZmlnID0geWFtbENvbmZpZyBvciB7fVxuXG4gICMgaW5zZXJ0IGFuY2hvcnNcbiAgaWYgdXNlUGFuZG9jUGFyc2VyIGFuZCBvcHRpb24uaXNGb3JQcmV2aWV3XG4gICAgaW5wdXRTdHJpbmcgPSBpbnNlcnRBbmNob3JzKGlucHV0U3RyaW5nKVxuXG4gICMgY2hlY2sgZG9jdW1lbnQgaW1wb3J0c1xuICB7b3V0cHV0U3RyaW5nOmlucHV0U3RyaW5nLCBoZWlnaHRzRGVsdGE6IEhFSUdIVFNfREVMVEF9ID0gZmlsZUltcG9ydChpbnB1dFN0cmluZywge2ZpbGVzQ2FjaGU6IG1hcmtkb3duUHJldmlldz8uZmlsZXNDYWNoZSwgZmlsZURpcmVjdG9yeVBhdGg6IG9wdGlvbi5maWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGg6IG9wdGlvbi5wcm9qZWN0RGlyZWN0b3J5UGF0aCwgZWRpdG9yOiBtYXJrZG93blByZXZpZXc/LmVkaXRvcn0pXG5cbiAgIyBvdmVyd3JpdGUgcmVtYXJrIGhlYWRpbmcgcGFyc2UgZnVuY3Rpb25cbiAgbWQucmVuZGVyZXIucnVsZXMuaGVhZGluZ19vcGVuID0gKHRva2VucywgaWR4KT0+XG4gICAgbGluZSA9IG51bGxcbiAgICBpZCA9IG51bGxcblxuICAgIGlmIHRva2Vuc1tpZHggKyAxXSBhbmQgdG9rZW5zW2lkeCArIDFdLmNvbnRlbnRcbiAgICAgIGlkID0gdXNsdWcodG9rZW5zW2lkeCArIDFdLmNvbnRlbnQpXG4gICAgICBpZiAodG9jVGFibGVbaWRdID49IDApXG4gICAgICAgIHRvY1RhYmxlW2lkXSArPSAxXG4gICAgICAgIGlkID0gaWQgKyAnLScgKyB0b2NUYWJsZVtpZF1cbiAgICAgIGVsc2VcbiAgICAgICAgdG9jVGFibGVbaWRdID0gMFxuXG4gICAgICBpZiAhKHRva2Vuc1tpZHgtMV0/LnN1YmplY3QgPT0gJ3VudG9jJylcbiAgICAgICAgdG9jQ29uZmlncy5oZWFkaW5ncy5wdXNoKHtjb250ZW50OiB0b2tlbnNbaWR4ICsgMV0uY29udGVudCwgbGV2ZWw6IHRva2Vuc1tpZHhdLmhMZXZlbH0pXG5cbiAgICBpZCA9IGlmIGlkIHRoZW4gXCJpZD0je2lkfVwiIGVsc2UgJydcbiAgICBpZiB0b2tlbnNbaWR4XS5saW5lcyBhbmQgIURJU0FCTEVfU1lOQ19MSU5FXG4gICAgICBsaW5lID0gdG9rZW5zW2lkeF0ubGluZXNbMF1cbiAgICAgIHJldHVybiBcIjxoI3t0b2tlbnNbaWR4XS5oTGV2ZWx9IGNsYXNzPVxcXCJzeW5jLWxpbmVcXFwiIGRhdGEtbGluZT1cXFwiI3tnZXRSZWFsRGF0YUxpbmUobGluZSl9XFxcIiAje2lkfT5cIlxuXG4gICAgcmV0dXJuIFwiPGgje3Rva2Vuc1tpZHhdLmhMZXZlbH0gI3tpZH0+XCJcblxuICAjIDwhLS0gc3ViamVjdCBvcHRpb25zLi4uIC0tPlxuICBtZC5yZW5kZXJlci5ydWxlcy5jdXN0b20gPSAodG9rZW5zLCBpZHgpPT5cbiAgICBzdWJqZWN0ID0gdG9rZW5zW2lkeF0uc3ViamVjdFxuXG4gICAgaWYgc3ViamVjdCA9PSAncGFnZWJyZWFrJyBvciBzdWJqZWN0ID09ICduZXdwYWdlJ1xuICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwicGFnZWJyZWFrXCI+IDwvZGl2PidcbiAgICBlbHNlIGlmIHN1YmplY3QgPT0gJ3RvYydcbiAgICAgIHRvY0VuYWJsZWQgPSB0cnVlXG5cbiAgICAgIHRvY0NvbmZpZ3MudG9jU3RhcnRMaW5lX3MucHVzaCB0b2tlbnNbaWR4XS5saW5lXG5cbiAgICAgIG9wdCA9IHRva2Vuc1tpZHhdLm9wdGlvblxuICAgICAgaWYgb3B0Lm9yZGVyZWRMaXN0IGFuZCBvcHQub3JkZXJlZExpc3QgIT0gMFxuICAgICAgICB0b2NDb25maWdzLnRvY09yZGVyZWRfcy5wdXNoIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgdG9jQ29uZmlncy50b2NPcmRlcmVkX3MucHVzaCBmYWxzZVxuXG4gICAgICB0b2NDb25maWdzLnRvY0RlcHRoRnJvbV9zLnB1c2ggb3B0LmRlcHRoRnJvbSB8fCAxXG4gICAgICB0b2NDb25maWdzLnRvY0RlcHRoVG9fcy5wdXNoIG9wdC5kZXB0aFRvIHx8IDZcblxuICAgIGVsc2UgaWYgKHN1YmplY3QgPT0gJ3RvY3N0b3AnKVxuICAgICAgdG9jQ29uZmlncy50b2NFbmRMaW5lX3MucHVzaCB0b2tlbnNbaWR4XS5saW5lXG5cbiAgICBlbHNlIGlmIChzdWJqZWN0ID09ICd0b2MtYnJhY2tldCcpICMgW3RvY11cbiAgICAgIHRvY0JyYWNrZXRFbmFibGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuICdcXG5bTVBFVE9DXVxcbidcblxuICAgIGVsc2UgaWYgc3ViamVjdCA9PSAnc2xpZGUnXG4gICAgICBvcHQgPSB0b2tlbnNbaWR4XS5vcHRpb25cbiAgICAgIG9wdC5saW5lID0gdG9rZW5zW2lkeF0ubGluZVxuICAgICAgc2xpZGVDb25maWdzLnB1c2gob3B0KVxuICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwibmV3LXNsaWRlXCI+PC9kaXY+J1xuICAgIHJldHVybiAnJ1xuXG4gIGZpbmFsaXplID0gKGh0bWwpLT5cbiAgICBpZiBtYXJrZG93blByZXZpZXcgYW5kIHRvY0VuYWJsZWQgYW5kIHVwZGF0ZVRPQyhtYXJrZG93blByZXZpZXcsIHRvY0NvbmZpZ3MpXG4gICAgICByZXR1cm4gcGFyc2VNRChtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldFRleHQoKSwgb3B0aW9uLCBjYWxsYmFjaylcblxuICAgIGlmIHRvY0JyYWNrZXRFbmFibGVkICMgW1RPQ11cbiAgICAgIHRvY09iamVjdCA9IHRvYyh0b2NDb25maWdzLmhlYWRpbmdzLCB7b3JkZXJlZDogZmFsc2UsIGRlcHRoRnJvbTogMSwgZGVwdGhUbzogNiwgdGFiOiBtYXJrZG93blByZXZpZXc/LmVkaXRvcj8uZ2V0VGFiVGV4dCgpIG9yICdcXHQnfSlcbiAgICAgIERJU0FCTEVfU1lOQ19MSU5FID0gdHJ1ZSAjIG90aGVyd2lzZSB0b2NIdG1sIHdpbGwgYnJlYWsgc2Nyb2xsIHN5bmMuXG4gICAgICB0b2NIdG1sID0gbWQucmVuZGVyKHRvY09iamVjdC5jb250ZW50KVxuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSAvXlxccypcXFtNUEVUT0NcXF1cXHMqL2dtLCB0b2NIdG1sXG5cblxuICAgIGh0bWwgPSByZXNvbHZlSW1hZ2VQYXRoQW5kQ29kZUJsb2NrKGh0bWwsIGdyYXBoRGF0YSwgY29kZUNodW5rc0RhdGEsIG9wdGlvbilcbiAgICByZXR1cm4gY2FsbGJhY2soe2h0bWw6IGZyb250TWF0dGVyVGFibGUraHRtbCwgc2xpZGVDb25maWdzLCB5YW1sQ29uZmlnfSlcblxuICBpZiB1c2VQYW5kb2NQYXJzZXIgIyBwYW5kb2MgcGFyc2VyXG4gICAgYXJncyA9IHlhbWxDb25maWcucGFuZG9jX2FyZ3Mgb3IgW11cbiAgICBhcmdzID0gW10gaWYgbm90IChhcmdzIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgaWYgeWFtbENvbmZpZy5iaWJsaW9ncmFwaHkgb3IgeWFtbENvbmZpZy5yZWZlcmVuY2VzXG4gICAgICBhcmdzLnB1c2goJy0tZmlsdGVyJywgJ3BhbmRvYy1jaXRlcHJvYycpXG5cbiAgICBhcmdzID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBhbmRvY0FyZ3VtZW50cycpLnNwbGl0KCcsJykubWFwKCh4KS0+IHgudHJpbSgpKS5jb25jYXQoYXJncylcblxuICAgIHJldHVybiBwYW5kb2NSZW5kZXIgaW5wdXRTdHJpbmcsIHthcmdzLCBwcm9qZWN0RGlyZWN0b3J5UGF0aDogb3B0aW9uLnByb2plY3REaXJlY3RvcnlQYXRoLCBmaWxlRGlyZWN0b3J5UGF0aDogb3B0aW9uLmZpbGVEaXJlY3RvcnlQYXRofSwgKGVycm9yLCBodG1sKS0+XG4gICAgICBodG1sID0gXCI8cHJlPiN7ZXJyb3J9PC9wcmU+XCIgaWYgZXJyb3JcbiAgICAgICMgY29uc29sZS5sb2coaHRtbClcbiAgICAgICMgZm9ybWF0IGJsb2Nrc1xuICAgICAgJCA9IGNoZWVyaW8ubG9hZChodG1sKVxuICAgICAgJCgncHJlJykuZWFjaCAoaSwgcHJlRWxlbWVudCktPlxuICAgICAgICAjIGNvZGUgYmxvY2tcbiAgICAgICAgaWYgcHJlRWxlbWVudC5jaGlsZHJlblswXT8ubmFtZSA9PSAnY29kZSdcbiAgICAgICAgICAkcHJlRWxlbWVudCA9ICQocHJlRWxlbWVudClcbiAgICAgICAgICBjb2RlQmxvY2sgPSAkKHByZUVsZW1lbnQpLmNoaWxkcmVuKCkuZmlyc3QoKVxuICAgICAgICAgIGNsYXNzZXMgPSAoY29kZUJsb2NrLmF0dHIoJ2NsYXNzJyk/LnNwbGl0KCcgJykgb3IgW10pLmZpbHRlciAoeCktPiB4ICE9ICdzb3VyY2VDb2RlJ1xuICAgICAgICAgIGxhbmcgPSBjbGFzc2VzWzBdXG5cbiAgICAgICAgICAjIGdyYXBoc1xuICAgICAgICAgIGlmICRwcmVFbGVtZW50LmF0dHIoJ2NsYXNzJyk/Lm1hdGNoKC8obWVybWFpZHx2aXp8ZG90fHB1bWx8cGxhbnR1bWx8d2F2ZWRyb20pLylcbiAgICAgICAgICAgIGxhbmcgPSAkcHJlRWxlbWVudC5hdHRyKCdjbGFzcycpXG4gICAgICAgICAgY29kZUJsb2NrLmF0dHIoJ2NsYXNzJywgJ2xhbmd1YWdlLScgKyBsYW5nKVxuXG4gICAgICAgICAgIyBjaGVjayBjb2RlIGNodW5rXG4gICAgICAgICAgZGF0YUNvZGVDaHVuayA9ICRwcmVFbGVtZW50LnBhcmVudCgpPy5hdHRyKCdkYXRhLWNvZGUtY2h1bmsnKVxuICAgICAgICAgIGlmIGRhdGFDb2RlQ2h1bmtcbiAgICAgICAgICAgIGNvZGVCbG9jay5hdHRyKCdjbGFzcycsICdsYW5ndWFnZS0nICsgZGF0YUNvZGVDaHVuay51bmVzY2FwZSgpKVxuXG4gICAgICByZXR1cm4gZmluYWxpemUoJC5odG1sKCkpXG4gIGVsc2UgIyByZW1hcmthYmxlIHBhcnNlclxuICAgICMgcGFyc2UgbWFya2Rvd25cbiAgICBodG1sID0gbWQucmVuZGVyKGlucHV0U3RyaW5nKVxuICAgICMgY29uc29sZS5sb2coaHRtbClcbiAgICByZXR1cm4gZmluYWxpemUoaHRtbClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBhcnNlTUQsXG4gIGJ1aWxkU2Nyb2xsTWFwLFxuICBwcm9jZXNzRnJvbnRNYXR0ZXJcbn1cbiJdfQ==
