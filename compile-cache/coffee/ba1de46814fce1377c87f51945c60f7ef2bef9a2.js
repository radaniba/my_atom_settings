(function() {
  var $, $$$, CACHE, CompositeDisposable, Directory, Emitter, File, MarkdownPreviewEnhancedView, ScrollView, allowUnsafeEval, allowUnsafeNewFunction, cheerio, codeChunkAPI, ebookConvert, exec, fs, katex, loadMathJax, loadPreviewTheme, markdownConvert, matter, pandocConvert, path, pdf, plantumlAPI, protocolsWhiteListRegExp, ref, ref1, ref2, temp,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable, File = ref.File, Directory = ref.Directory;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  path = require('path');

  fs = require('fs');

  temp = require('temp').track();

  exec = require('child_process').exec;

  pdf = require('html-pdf');

  katex = require('katex');

  matter = require('gray-matter');

  ref2 = require('loophole'), allowUnsafeEval = ref2.allowUnsafeEval, allowUnsafeNewFunction = ref2.allowUnsafeNewFunction;

  cheerio = null;

  loadPreviewTheme = require('./style').loadPreviewTheme;

  plantumlAPI = require('./puml');

  ebookConvert = require('./ebook-convert');

  loadMathJax = require('./mathjax-wrapper').loadMathJax;

  pandocConvert = require('./pandoc-convert').pandocConvert;

  markdownConvert = require('./markdown-convert');

  codeChunkAPI = require('./code-chunk');

  CACHE = require('./cache');

  protocolsWhiteListRegExp = require('./protocols-whitelist').protocolsWhiteListRegExp;

  module.exports = MarkdownPreviewEnhancedView = (function(superClass) {
    extend(MarkdownPreviewEnhancedView, superClass);

    function MarkdownPreviewEnhancedView(uri, mainModule) {
      MarkdownPreviewEnhancedView.__super__.constructor.apply(this, arguments);
      this.uri = uri;
      this.mainModule = mainModule;
      this.protocal = 'markdown-preview-enhanced://';
      this.editor = null;
      this.tocConfigs = null;
      this.scrollMap = null;
      this.fileDirectoryPath = null;
      this.projectDirectoryPath = null;
      this.disposables = null;
      this.liveUpdate = true;
      this.scrollSync = true;
      this.scrollDuration = null;
      this.textChanged = false;
      this.usePandocParser = false;
      this.mathRenderingOption = atom.config.get('markdown-preview-enhanced.mathRenderingOption');
      this.mathRenderingOption = this.mathRenderingOption === 'None' ? null : this.mathRenderingOption;
      this.mathJaxProcessEnvironments = atom.config.get('markdown-preview-enhanced.mathJaxProcessEnvironments');
      this.parseDelay = Date.now();
      this.editorScrollDelay = Date.now();
      this.previewScrollDelay = Date.now();
      this.documentExporterView = null;
      this.parseMD = null;
      this.buildScrollMap = null;
      this.processFrontMatter = null;
      this.Viz = null;
      this.firstTimeRenderMarkdowon = true;
      this.presentationMode = false;
      this.slideConfigs = null;
      this.graphData = null;
      this.codeChunksData = {};
      this.filesCache = {};
      window.addEventListener('resize', this.resizeEvent.bind(this));
      atom.commands.add(this.element, {
        'markdown-preview-enhanced:open-in-browser': (function(_this) {
          return function() {
            return _this.openInBrowser();
          };
        })(this),
        'markdown-preview-enhanced:export-to-disk': (function(_this) {
          return function() {
            return _this.exportToDisk();
          };
        })(this),
        'markdown-preview-enhanced:pandoc-document-export': (function(_this) {
          return function() {
            return _this.pandocDocumentExport();
          };
        })(this),
        'markdown-preview-enhanced:save-as-markdown': (function(_this) {
          return function() {
            return _this.saveAsMarkdown();
          };
        })(this),
        'core:copy': (function(_this) {
          return function() {
            return _this.copyToClipboard();
          };
        })(this)
      });
      this.settingsDisposables = new CompositeDisposable();
      this.initSettingsEvents();
    }

    MarkdownPreviewEnhancedView.content = function() {
      return this.div({
        "class": 'markdown-preview-enhanced native-key-bindings',
        tabindex: -1,
        style: "background-color: #fff; padding: 32px; color: #222;"
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": "markdown-spinner"
          }, 'Loading Markdown\u2026');
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.getTitle = function() {
      return this.getFileName() + ' preview';
    };

    MarkdownPreviewEnhancedView.prototype.getFileName = function() {
      if (this.editor) {
        return this.editor.getFileName();
      } else {
        return 'unknown';
      }
    };

    MarkdownPreviewEnhancedView.prototype.getIconName = function() {
      return 'markdown';
    };

    MarkdownPreviewEnhancedView.prototype.getURI = function() {
      return this.uri;
    };

    MarkdownPreviewEnhancedView.prototype.getProjectDirectoryPath = function() {
      var editorPath, k, len, projectDirectories, projectDirectory;
      if (!this.editor) {
        return '';
      }
      editorPath = this.editor.getPath();
      projectDirectories = atom.project.rootDirectories;
      for (k = 0, len = projectDirectories.length; k < len; k++) {
        projectDirectory = projectDirectories[k];
        if (projectDirectory.contains(editorPath)) {
          return projectDirectory.getPath();
        }
      }
      return '';
    };

    MarkdownPreviewEnhancedView.prototype.setTabTitle = function(title) {
      var tabTitle;
      tabTitle = $('[data-type="MarkdownPreviewEnhancedView"] div.title');
      if (tabTitle.length) {
        return tabTitle[0].innerText = title;
      }
    };

    MarkdownPreviewEnhancedView.prototype.updateTabTitle = function() {
      return this.setTabTitle(this.getTitle());
    };

    MarkdownPreviewEnhancedView.prototype.setMermaidTheme = function(mermaidTheme) {
      var mermaidStyle, mermaidThemeStyle, ref3;
      mermaidThemeStyle = fs.readFileSync(path.resolve(__dirname, '../dependencies/mermaid/' + mermaidTheme), {
        encoding: 'utf-8'
      }).toString();
      mermaidStyle = document.getElementById('mermaid-style');
      if (mermaidStyle) {
        mermaidStyle.remove();
      }
      mermaidStyle = document.createElement('style');
      mermaidStyle.id = 'mermaid-style';
      document.getElementsByTagName('head')[0].appendChild(mermaidStyle);
      mermaidStyle.innerHTML = mermaidThemeStyle;
      if ((ref3 = this.graphData) != null) {
        ref3.mermaid_s = [];
      }
      return this.renderMarkdown();
    };

    MarkdownPreviewEnhancedView.prototype.bindEditor = function(editor) {
      var ref3;
      if (!this.editor) {
        return atom.workspace.open(this.uri, {
          split: 'right',
          activatePane: false,
          searchAllPanes: false
        }).then((function(_this) {
          return function(e) {
            var previewTheme;
            previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
            return loadPreviewTheme(previewTheme, true, function() {
              return _this.initEvents(editor);
            });
          };
        })(this));
      } else {
        CACHE[this.editor.getPath()] = {
          html: ((ref3 = this.element) != null ? ref3.innerHTML : void 0) || '',
          codeChunksData: this.codeChunksData,
          graphData: this.graphData,
          presentationMode: this.presentationMode,
          slideConfigs: this.slideConfigs,
          filesCache: this.filesCache
        };
        return setTimeout((function(_this) {
          return function() {
            return _this.initEvents(editor);
          };
        })(this), 0);
      }
    };

    MarkdownPreviewEnhancedView.prototype.initEvents = function(editor) {
      var d, ref3, ref4, ref5, ref6, ref7;
      this.editor = editor;
      this.updateTabTitle();
      this.element.removeAttribute('style');
      if (!this.parseMD) {
        ref3 = require('./md'), this.parseMD = ref3.parseMD, this.buildScrollMap = ref3.buildScrollMap, this.processFrontMatter = ref3.processFrontMatter;
        require('../dependencies/wavedrom/default.js');
        require('../dependencies/wavedrom/wavedrom.min.js');
      }
      this.tocConfigs = null;
      this.scrollMap = null;
      this.fileDirectoryPath = this.editor.getDirectoryPath();
      this.projectDirectoryPath = this.getProjectDirectoryPath();
      this.firstTimeRenderMarkdowon = true;
      this.filesCache = {};
      if (this.disposables) {
        this.disposables.dispose();
      }
      this.disposables = new CompositeDisposable();
      this.initEditorEvent();
      this.initViewEvent();
      d = CACHE[this.editor.getPath()];
      if (d) {
        this.element.innerHTML = d.html;
        this.graphData = d.graphData;
        this.codeChunksData = d.codeChunksData;
        this.presentationMode = d.presentationMode;
        this.slideConfigs = d.slideConfigs;
        this.filesCache = d.filesCache;
        if (this.presentationMode) {
          this.element.setAttribute('data-presentation-preview-mode', '');
        } else {
          this.element.removeAttribute('data-presentation-preview-mode');
        }
        this.setInitialScrollPos();
        if ((ref4 = this.element.getElementsByClassName('back-to-top-btn')) != null) {
          if ((ref5 = ref4[0]) != null) {
            ref5.onclick = (function(_this) {
              return function() {
                return _this.element.scrollTop = 0;
              };
            })(this);
          }
        }
        if ((ref6 = this.element.getElementsByClassName('refresh-btn')) != null) {
          if ((ref7 = ref6[0]) != null) {
            ref7.onclick = (function(_this) {
              return function() {
                _this.filesCache = {};
                codeChunkAPI.clearCache();
                return _this.renderMarkdown();
              };
            })(this);
          }
        }
        this.bindTagAClickEvent();
        this.renderPlantUML();
        this.setupCodeChunks();
      } else {
        this.renderMarkdown();
      }
      return this.scrollMap = null;
    };

    MarkdownPreviewEnhancedView.prototype.initEditorEvent = function() {
      var editorElement;
      editorElement = this.editor.getElement();
      this.disposables.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          _this.setTabTitle('unknown preview');
          if (_this.disposables) {
            _this.disposables.dispose();
            _this.disposables = null;
          }
          _this.editor = null;
          _this.element.onscroll = null;
          return _this.element.innerHTML = '<p style="font-size: 24px;"> Open a markdown file to start preview </p>';
        };
      })(this)));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          if (_this.liveUpdate && !_this.usePandocParser) {
            return _this.updateMarkdown();
          }
        };
      })(this)));
      this.disposables.add(this.editor.onDidSave((function(_this) {
        return function() {
          if (!_this.liveUpdate || _this.usePandocParser) {
            _this.textChanged = true;
            return _this.updateMarkdown();
          }
        };
      })(this)));
      this.disposables.add(this.editor.onDidChangeModified((function(_this) {
        return function() {
          if (!_this.liveUpdate || _this.usePandocParser) {
            return _this.textChanged = true;
          }
        };
      })(this)));
      this.disposables.add(editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          var editorHeight, firstVisibleScreenRow, lastVisibleScreenRow, lineNo;
          if (!_this.scrollSync || !_this.element || _this.textChanged || !_this.editor || _this.presentationMode) {
            return;
          }
          if (Date.now() < _this.editorScrollDelay) {
            return;
          }
          editorHeight = _this.editor.getElement().getHeight();
          firstVisibleScreenRow = _this.editor.getFirstVisibleScreenRow();
          lastVisibleScreenRow = firstVisibleScreenRow + Math.floor(editorHeight / _this.editor.getLineHeightInPixels());
          lineNo = Math.floor((firstVisibleScreenRow + lastVisibleScreenRow) / 2);
          if (_this.scrollMap == null) {
            _this.scrollMap = _this.buildScrollMap(_this);
          }
          _this.previewScrollDelay = Date.now() + 500;
          if (firstVisibleScreenRow === 0) {
            return _this.scrollToPos(0);
          }
          if (lineNo in _this.scrollMap) {
            return _this.scrollToPos(_this.scrollMap[lineNo] - editorHeight / 2);
          }
        };
      })(this)));
      return this.disposables.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(event) {
          var lineNo;
          if (!_this.scrollSync || !_this.element || _this.textChanged) {
            return;
          }
          if (Date.now() < _this.parseDelay) {
            return;
          }
          _this.editorScrollDelay = Date.now() + 500;
          _this.previewScrollDelay = Date.now() + 500;
          if (_this.presentationMode && _this.slideConfigs) {
            return _this.scrollSyncForPresentation(event.newBufferPosition.row);
          }
          if (event.oldScreenPosition.row !== event.newScreenPosition.row || event.oldScreenPosition.column === 0) {
            lineNo = event.newScreenPosition.row;
            if (lineNo <= 1) {
              _this.scrollToPos(0);
              return;
            } else if (lineNo >= _this.editor.getScreenLineCount() - 2) {
              _this.scrollToPos(_this.element.scrollHeight - 16);
              return;
            }
            return _this.scrollSyncToLineNo(lineNo);
          }
        };
      })(this)));
    };

    MarkdownPreviewEnhancedView.prototype.initViewEvent = function() {
      return this.element.onscroll = (function(_this) {
        return function() {
          var count, i, j, mid, screenRow, top;
          if (!_this.editor || !_this.scrollSync || _this.textChanged || _this.presentationMode) {
            return;
          }
          if (Date.now() < _this.previewScrollDelay) {
            return;
          }
          if (_this.element.scrollTop === 0) {
            _this.editorScrollDelay = Date.now() + 500;
            return _this.scrollToPos(0, _this.editor.getElement());
          }
          top = _this.element.scrollTop + _this.element.offsetHeight / 2;
          if (_this.scrollMap == null) {
            _this.scrollMap = _this.buildScrollMap(_this);
          }
          i = 0;
          j = _this.scrollMap.length - 1;
          count = 0;
          screenRow = -1;
          while (count < 20) {
            if (Math.abs(top - _this.scrollMap[i]) < 20) {
              screenRow = i;
              break;
            } else if (Math.abs(top - _this.scrollMap[j]) < 20) {
              screenRow = j;
              break;
            } else {
              mid = Math.floor((i + j) / 2);
              if (top > _this.scrollMap[mid]) {
                i = mid;
              } else {
                j = mid;
              }
            }
            count++;
          }
          if (screenRow === -1) {
            screenRow = mid;
          }
          _this.scrollToPos(screenRow * _this.editor.getLineHeightInPixels() - _this.element.offsetHeight / 2, _this.editor.getElement());
          return _this.editorScrollDelay = Date.now() + 500;
        };
      })(this);
    };

    MarkdownPreviewEnhancedView.prototype.initSettingsEvents = function() {
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.breakOnSingleNewline', (function(_this) {
        return function(breakOnSingleNewline) {
          _this.parseDelay = Date.now();
          return _this.renderMarkdown();
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.enableTypographer', (function(_this) {
        return function(enableTypographer) {
          return _this.renderMarkdown();
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.liveUpdate', (function(_this) {
        return function(flag) {
          _this.liveUpdate = flag;
          return _this.scrollMap = null;
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.scrollSync', (function(_this) {
        return function(flag) {
          _this.scrollSync = flag;
          return _this.scrollMap = null;
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.scrollDuration', (function(_this) {
        return function(duration) {
          duration = parseInt(duration) || 0;
          if (duration < 0) {
            return _this.scrollDuration = 120;
          } else {
            return _this.scrollDuration = duration;
          }
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.mathRenderingOption', (function(_this) {
        return function(option) {
          _this.mathRenderingOption = option;
          return _this.renderMarkdown();
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.usePandocParser', (function(_this) {
        return function(flag) {
          _this.usePandocParser = flag;
          return _this.renderMarkdown();
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.mermaidTheme', (function(_this) {
        return function(theme) {
          return _this.setMermaidTheme(theme);
        };
      })(this)));
      this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.frontMatterRenderingOption', (function(_this) {
        return function() {
          return _this.renderMarkdown();
        };
      })(this)));
      return this.settingsDisposables.add(atom.config.observe('markdown-preview-enhanced.showBackToTopButton', (function(_this) {
        return function(flag) {
          var ref3;
          _this.showBackToTopButton = flag;
          if (flag) {
            return _this.addBackToTopButton();
          } else {
            return (ref3 = document.getElementsByClassName('back-to-top-btn')[0]) != null ? ref3.remove() : void 0;
          }
        };
      })(this)));
    };

    MarkdownPreviewEnhancedView.prototype.scrollSyncForPresentation = function(bufferLineNo) {
      var i, slideElement;
      i = this.slideConfigs.length - 1;
      while (i >= 0) {
        if (bufferLineNo >= this.slideConfigs[i].line) {
          break;
        }
        i -= 1;
      }
      slideElement = this.element.querySelector(".slide[data-offset=\"" + i + "\"]");
      if (!slideElement) {
        return;
      }
      return this.element.scrollTop = -this.element.offsetHeight / 2 + (slideElement.offsetTop + slideElement.offsetHeight / 2) * parseFloat(slideElement.style.zoom);
    };

    MarkdownPreviewEnhancedView.prototype.scrollSyncToLineNo = function(lineNo) {
      var editorElement, firstVisibleScreenRow, posRatio, scrollTop;
      if (this.scrollMap == null) {
        this.scrollMap = this.buildScrollMap(this);
      }
      editorElement = this.editor.getElement();
      firstVisibleScreenRow = this.editor.getFirstVisibleScreenRow();
      posRatio = (lineNo - firstVisibleScreenRow) / (editorElement.getHeight() / this.editor.getLineHeightInPixels());
      scrollTop = this.scrollMap[lineNo] - (posRatio > 1 ? 1 : posRatio) * editorElement.getHeight();
      if (scrollTop < 0) {
        scrollTop = 0;
      }
      return this.scrollToPos(scrollTop);
    };

    MarkdownPreviewEnhancedView.prototype.scrollToPos = function(scrollTop, editorElement) {
      var delay, helper;
      if (editorElement == null) {
        editorElement = null;
      }
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      if (!this.editor || !this.editor.alive || scrollTop < 0) {
        return;
      }
      delay = 10;
      helper = (function(_this) {
        return function(duration) {
          if (duration == null) {
            duration = 0;
          }
          return _this.scrollTimeout = setTimeout(function() {
            var difference, perTick, s;
            if (duration <= 0) {
              if (editorElement) {
                _this.editorScrollDelay = Date.now() + 500;
                editorElement.setScrollTop(scrollTop);
              } else {
                _this.previewScrollDelay = Date.now() + 500;
                _this.element.scrollTop = scrollTop;
              }
              return;
            }
            if (editorElement) {
              difference = scrollTop - editorElement.getScrollTop();
            } else {
              difference = scrollTop - _this.element.scrollTop;
            }
            perTick = difference / duration * delay;
            if (editorElement) {
              _this.editorScrollDelay = Date.now() + 500;
              s = editorElement.getScrollTop() + perTick;
              editorElement.setScrollTop(s);
              if (s === scrollTop) {
                return;
              }
            } else {
              _this.previewScrollDelay = Date.now() + 500;
              _this.element.scrollTop += perTick;
              if (_this.element.scrollTop === scrollTop) {
                return;
              }
            }
            return helper(duration - delay);
          }, delay);
        };
      })(this);
      return helper(this.scrollDuration);
    };

    MarkdownPreviewEnhancedView.prototype.formatStringBeforeParsing = function(str) {
      return this.mainModule.hook.chain('on-will-parse-markdown', str);
    };

    MarkdownPreviewEnhancedView.prototype.formatStringAfterParsing = function(str) {
      return this.mainModule.hook.chain('on-did-parse-markdown', str);
    };

    MarkdownPreviewEnhancedView.prototype.updateMarkdown = function() {
      this.editorScrollDelay = Date.now() + 500;
      this.previewScrollDelay = Date.now() + 500;
      return this.renderMarkdown();
    };

    MarkdownPreviewEnhancedView.prototype.renderMarkdown = function() {
      if (Date.now() < this.parseDelay || !this.editor || !this.element) {
        this.textChanged = false;
        return;
      }
      this.parseDelay = Date.now() + 200;
      return this.parseMD(this.formatStringBeforeParsing(this.editor.getText()), {
        isForPreview: true,
        markdownPreview: this,
        fileDirectoryPath: this.fileDirectoryPath,
        projectDirectoryPath: this.projectDirectoryPath
      }, (function(_this) {
        return function(arg) {
          var html, slideConfigs, yamlConfig;
          html = arg.html, slideConfigs = arg.slideConfigs, yamlConfig = arg.yamlConfig;
          html = _this.formatStringAfterParsing(html);
          if (slideConfigs.length) {
            html = _this.parseSlides(html, slideConfigs, yamlConfig);
            _this.element.setAttribute('data-presentation-preview-mode', '');
            _this.presentationMode = true;
            _this.slideConfigs = slideConfigs;
          } else {
            _this.element.removeAttribute('data-presentation-preview-mode');
            _this.presentationMode = false;
          }
          _this.element.innerHTML = html;
          _this.graphData = {};
          _this.bindEvents();
          _this.mainModule.emitter.emit('on-did-render-preview', {
            htmlString: html,
            previewElement: _this.element
          });
          _this.setInitialScrollPos();
          _this.addBackToTopButton();
          _this.addRefreshButton();
          return _this.textChanged = false;
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.setInitialScrollPos = function() {
      var cursor, t;
      if (this.firstTimeRenderMarkdowon) {
        this.firstTimeRenderMarkdowon = false;
        cursor = this.editor.cursors[0];
        if (!cursor) {
          return;
        }
        if (this.presentationMode) {
          return this.scrollSyncForPresentation(cursor.getBufferRow());
        } else {
          t = this.scrollDuration;
          this.scrollDuration = 0;
          this.scrollSyncToLineNo(cursor.getScreenRow());
          return this.scrollDuration = t;
        }
      }
    };

    MarkdownPreviewEnhancedView.prototype.addBackToTopButton = function() {
      var backToTopBtn;
      if (this.showBackToTopButton && this.element.scrollHeight > this.element.offsetHeight) {
        backToTopBtn = document.createElement('div');
        backToTopBtn.classList.add('back-to-top-btn');
        backToTopBtn.classList.add('btn');
        backToTopBtn.innerHTML = '<span>⬆︎</span>';
        this.element.appendChild(backToTopBtn);
        return backToTopBtn.onclick = (function(_this) {
          return function() {
            return _this.element.scrollTop = 0;
          };
        })(this);
      }
    };

    MarkdownPreviewEnhancedView.prototype.addRefreshButton = function() {
      var refreshBtn;
      refreshBtn = document.createElement('div');
      refreshBtn.classList.add('refresh-btn');
      refreshBtn.classList.add('btn');
      refreshBtn.innerHTML = '<span>⟳</span>';
      this.element.appendChild(refreshBtn);
      return refreshBtn.onclick = (function(_this) {
        return function() {
          _this.filesCache = {};
          codeChunkAPI.clearCache();
          return _this.renderMarkdown();
        };
      })(this);
    };

    MarkdownPreviewEnhancedView.prototype.bindEvents = function() {
      this.bindTagAClickEvent();
      this.setupCodeChunks();
      this.initTaskList();
      this.renderMermaid();
      this.renderPlantUML();
      this.renderWavedrom();
      this.renderViz();
      this.renderKaTeX();
      this.renderMathJax();
      return this.scrollMap = null;
    };

    MarkdownPreviewEnhancedView.prototype.bindTagAClickEvent = function() {
      var a, analyzeHref, as, href, k, len, results;
      as = this.element.getElementsByTagName('a');
      analyzeHref = (function(_this) {
        return function(href) {
          var targetElement;
          if (href && href[0] === '#') {
            targetElement = _this.element.querySelector("[id=\"" + (href.slice(1)) + "\"]");
            if (targetElement) {
              return a.onclick = function() {
                var el, offsetTop;
                offsetTop = 0;
                el = targetElement;
                while (el && el !== _this.element) {
                  offsetTop += el.offsetTop;
                  el = el.offsetParent;
                }
                if (_this.element.scrollTop > offsetTop) {
                  return _this.element.scrollTop = offsetTop - 32 - targetElement.offsetHeight;
                } else {
                  return _this.element.scrollTop = offsetTop;
                }
              };
            }
          } else {
            return a.onclick = function() {
              var openFilePath, ref3;
              if (!href) {
                return;
              }
              if (href.match(/^(http|https)\:\/\//)) {
                return;
              }
              if ((ref3 = path.extname(href)) === '.pdf' || ref3 === '.xls' || ref3 === '.xlsx' || ref3 === '.doc' || ref3 === '.ppt' || ref3 === '.docx' || ref3 === '.pptx') {
                return _this.openFile(href);
              } else if (href.match(/^file\:\/\/\//)) {
                openFilePath = href.slice(8);
                openFilePath = openFilePath.replace(/\.md(\s*)\#(.+)$/, '.md');
                return atom.workspace.open(openFilePath, {
                  split: 'left',
                  searchAllPanes: true
                });
              } else {
                return _this.openFile(href);
              }
            };
          }
        };
      })(this);
      results = [];
      for (k = 0, len = as.length; k < len; k++) {
        a = as[k];
        href = a.getAttribute('href');
        results.push(analyzeHref(href));
      }
      return results;
    };

    MarkdownPreviewEnhancedView.prototype.setupCodeChunks = function() {
      var codeChunk, codeChunks, k, len, needToSetupChunksId, newCodeChunksData, setupCodeChunk;
      codeChunks = this.element.getElementsByClassName('code-chunk');
      if (!codeChunks.length) {
        return;
      }
      newCodeChunksData = {};
      needToSetupChunksId = false;
      setupCodeChunk = (function(_this) {
        return function(codeChunk) {
          var child, children, dataArgs, i, id, idMatch, outputDiv, outputElement, ref3, ref4, ref5, runAllBtn, runBtn, running;
          dataArgs = codeChunk.getAttribute('data-args');
          idMatch = dataArgs.match(/\s*id\s*:\s*\"([^\"]*)\"/);
          if (idMatch && idMatch[1]) {
            id = idMatch[1];
            codeChunk.id = 'code_chunk_' + id;
            running = ((ref3 = _this.codeChunksData[id]) != null ? ref3.running : void 0) || false;
            if (running) {
              codeChunk.classList.add('running');
            }
            children = codeChunk.children;
            i = children.length - 1;
            while (i >= 0) {
              child = children[i];
              if (child.classList.contains('output-div') || child.classList.contains('output-element')) {
                child.remove();
              }
              i -= 1;
            }
            outputDiv = (ref4 = _this.codeChunksData[id]) != null ? ref4.outputDiv : void 0;
            outputElement = (ref5 = _this.codeChunksData[id]) != null ? ref5.outputElement : void 0;
            if (outputElement) {
              codeChunk.appendChild(outputElement);
            }
            if (outputDiv) {
              codeChunk.appendChild(outputDiv);
            }
            newCodeChunksData[id] = {
              running: running,
              outputDiv: outputDiv,
              outputElement: outputElement
            };
          } else {
            needToSetupChunksId = true;
          }
          runBtn = codeChunk.getElementsByClassName('run-btn')[0];
          if (runBtn != null) {
            runBtn.addEventListener('click', function() {
              return _this.runCodeChunk(codeChunk);
            });
          }
          runAllBtn = codeChunk.getElementsByClassName('run-all-btn')[0];
          return runAllBtn != null ? runAllBtn.addEventListener('click', function() {
            return _this.runAllCodeChunks();
          }) : void 0;
        };
      })(this);
      for (k = 0, len = codeChunks.length; k < len; k++) {
        codeChunk = codeChunks[k];
        if (needToSetupChunksId) {
          break;
        }
        setupCodeChunk(codeChunk);
      }
      if (needToSetupChunksId) {
        this.setupCodeChunksId();
      }
      return this.codeChunksData = newCodeChunksData;
    };

    MarkdownPreviewEnhancedView.prototype.setupCodeChunksId = function() {
      var buffer, cmd, curScreenPos, dataArgs, i, id, idMatch, line, lineNo, lines, match;
      buffer = this.editor.buffer;
      if (!buffer) {
        return;
      }
      lines = buffer.lines;
      lineNo = 0;
      curScreenPos = this.editor.getCursorScreenPosition();
      while (lineNo < lines.length) {
        line = lines[lineNo];
        match = line.match(/^\`\`\`\{(.+)\}(\s*)/);
        if (match) {
          cmd = match[1];
          dataArgs = '';
          i = cmd.indexOf(' ');
          if (i > 0) {
            dataArgs = cmd.slice(i + 1, cmd.length).trim();
            cmd = cmd.slice(0, i);
          }
          idMatch = match[1].match(/\s*id\s*:\s*\"([^\"]*)\"/);
          if (!idMatch) {
            id = (new Date().getTime()).toString(36);
            line = line.trimRight();
            line = line.replace(/}$/, (!dataArgs ? '' : ',') + ' id:"' + id + '"}');
            this.parseDelay = Date.now() + 500;
            buffer.setTextInRange([[lineNo, 0], [lineNo + 1, 0]], line + '\n');
          }
        }
        lineNo += 1;
      }
      return this.editor.setCursorScreenPosition(curScreenPos);
    };

    MarkdownPreviewEnhancedView.prototype.getNearestCodeChunk = function() {
      var bufferRow, codeChunk, codeChunks, i, lineNo;
      bufferRow = this.editor.getCursorBufferPosition().row;
      codeChunks = this.element.getElementsByClassName('code-chunk');
      i = codeChunks.length - 1;
      while (i >= 0) {
        codeChunk = codeChunks[i];
        lineNo = parseInt(codeChunk.getAttribute('data-line'));
        if (lineNo <= bufferRow) {
          return codeChunk;
        }
        i -= 1;
      }
      return null;
    };

    MarkdownPreviewEnhancedView.prototype.parseCodeChunk = function(codeChunk) {
      var cmd, code, codeChunks, dataArgs, error, i, id, last, lastCode, lastOptions, options, ref3;
      code = codeChunk.getAttribute('data-code');
      dataArgs = codeChunk.getAttribute('data-args');
      options = null;
      try {
        allowUnsafeEval(function() {
          return options = eval("({" + dataArgs + "})");
        });
      } catch (error1) {
        error = error1;
        atom.notifications.addError('Invalid options', {
          detail: dataArgs
        });
        return false;
      }
      id = options.id;
      if (options["continue"]) {
        last = null;
        if (options["continue"] === true) {
          codeChunks = this.element.getElementsByClassName('code-chunk');
          i = codeChunks.length - 1;
          while (i >= 0) {
            if (codeChunks[i] === codeChunk) {
              last = codeChunks[i - 1];
              break;
            }
            i--;
          }
        } else {
          last = document.getElementById('code_chunk_' + options["continue"]);
        }
        if (last) {
          ref3 = this.parseCodeChunk(last) || {}, lastCode = ref3.code, lastOptions = ref3.options;
          lastOptions = lastOptions || {};
          code = (lastCode || '') + '\n' + code;
          options = Object.assign({}, lastOptions, options);
        } else {
          atom.notifications.addError('Invalid continue for code chunk ' + (options.id || ''), {
            detail: options["continue"].toString()
          });
          return false;
        }
      }
      cmd = options.cmd || codeChunk.getAttribute('data-lang');
      return {
        cmd: cmd,
        options: options,
        code: code,
        id: id
      };
    };

    MarkdownPreviewEnhancedView.prototype.runCodeChunk = function(codeChunk) {
      var cmd, code, id, options, outputElement, parseResult, ref3, ref4, ref5;
      if (codeChunk == null) {
        codeChunk = null;
      }
      if (!codeChunk) {
        codeChunk = this.getNearestCodeChunk();
      }
      if (!codeChunk) {
        return;
      }
      if (codeChunk.classList.contains('running')) {
        return;
      }
      parseResult = this.parseCodeChunk(codeChunk);
      if (!parseResult) {
        return;
      }
      code = parseResult.code, options = parseResult.options, cmd = parseResult.cmd, id = parseResult.id;
      if (!id) {
        return atom.notifications.addError('Code chunk error', {
          detail: 'id is not found or just updated.'
        });
      }
      codeChunk.classList.add('running');
      if (this.codeChunksData[id]) {
        this.codeChunksData[id].running = true;
      } else {
        this.codeChunksData[id] = {
          running: true
        };
      }
      if (options.element) {
        outputElement = (ref3 = codeChunk.getElementsByClassName('output-element')) != null ? ref3[0] : void 0;
        if (!outputElement) {
          outputElement = document.createElement('div');
          outputElement.classList.add('output-element');
          codeChunk.appendChild(outputElement);
        }
        outputElement.innerHTML = options.element;
      } else {
        if ((ref4 = codeChunk.getElementsByClassName('output-element')) != null) {
          if ((ref5 = ref4[0]) != null) {
            ref5.remove();
          }
        }
        outputElement = null;
      }
      return codeChunkAPI.run(code, this.fileDirectoryPath, cmd, options, (function(_this) {
        return function(error, data, options) {
          var imageData, imageElement, k, len, outputDiv, preElement, ref6, scriptElement, scriptElements;
          codeChunk = document.getElementById('code_chunk_' + id);
          if (!codeChunk) {
            return;
          }
          codeChunk.classList.remove('running');
          if (error) {
            return;
          }
          data = (data || '').toString();
          outputDiv = (ref6 = codeChunk.getElementsByClassName('output-div')) != null ? ref6[0] : void 0;
          if (!outputDiv) {
            outputDiv = document.createElement('div');
            outputDiv.classList.add('output-div');
          } else {
            outputDiv.innerHTML = '';
          }
          if (options.output === 'html') {
            outputDiv.innerHTML = data;
          } else if (options.output === 'png') {
            imageElement = document.createElement('img');
            imageData = Buffer(data).toString('base64');
            imageElement.setAttribute('src', "data:image/png;charset=utf-8;base64," + imageData);
            outputDiv.appendChild(imageElement);
          } else if (options.output === 'markdown') {
            _this.parseMD(data, {
              fileDirectoryPath: _this.fileDirectoryPath,
              projectDirectoryPath: _this.projectDirectoryPath
            }, function(arg) {
              var html;
              html = arg.html;
              outputDiv.innerHTML = html;
              return _this.scrollMap = null;
            });
          } else if (options.output === 'none') {
            outputDiv.remove();
            outputDiv = null;
          } else {
            if (data != null ? data.length : void 0) {
              preElement = document.createElement('pre');
              preElement.innerText = data;
              preElement.classList.add('editor-colors');
              preElement.classList.add('lang-text');
              outputDiv.appendChild(preElement);
            }
          }
          if (outputDiv) {
            codeChunk.appendChild(outputDiv);
            _this.scrollMap = null;
          }
          if (options.matplotlib || options.mpl) {
            scriptElements = outputDiv.getElementsByTagName('script');
            if (scriptElements.length) {
              if (window.d3 == null) {
                window.d3 = require('../dependencies/mpld3/d3.v3.min.js');
              }
              if (window.mpld3 == null) {
                window.mpld3 = require('../dependencies/mpld3/mpld3.v0.3.min.js');
              }
              for (k = 0, len = scriptElements.length; k < len; k++) {
                scriptElement = scriptElements[k];
                code = scriptElement.innerHTML;
                allowUnsafeNewFunction(function() {
                  return allowUnsafeEval(function() {
                    return eval(code);
                  });
                });
              }
            }
          }
          return _this.codeChunksData[id] = {
            running: false,
            outputDiv: outputDiv,
            outputElement: outputElement
          };
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.runAllCodeChunks = function() {
      var chunk, codeChunks, k, len, results;
      codeChunks = this.element.getElementsByClassName('code-chunk');
      results = [];
      for (k = 0, len = codeChunks.length; k < len; k++) {
        chunk = codeChunks[k];
        results.push(this.runCodeChunk(chunk));
      }
      return results;
    };

    MarkdownPreviewEnhancedView.prototype.initTaskList = function() {
      var checkbox, checkboxs, k, len, results, this_;
      checkboxs = this.element.getElementsByClassName('task-list-item-checkbox');
      results = [];
      for (k = 0, len = checkboxs.length; k < len; k++) {
        checkbox = checkboxs[k];
        this_ = this;
        results.push(checkbox.onclick = function() {
          var buffer, checked, line, lineNo;
          if (!this_.editor) {
            return;
          }
          checked = this.checked;
          buffer = this_.editor.buffer;
          if (!buffer) {
            return;
          }
          lineNo = parseInt(this.parentElement.getAttribute('data-line'));
          line = buffer.lines[lineNo];
          if (checked) {
            line = line.replace('[ ]', '[x]');
          } else {
            line = line.replace(/\[(x|X)\]/, '[ ]');
          }
          this_.parseDelay = Date.now() + 500;
          return buffer.setTextInRange([[lineNo, 0], [lineNo + 1, 0]], line + '\n');
        });
      }
      return results;
    };

    MarkdownPreviewEnhancedView.prototype.renderMermaid = function() {
      var els, notProcessedEls;
      els = this.element.getElementsByClassName('mermaid mpe-graph');
      if (els.length) {
        this.graphData.mermaid_s = Array.prototype.slice.call(els);
        notProcessedEls = this.element.querySelectorAll('.mermaid.mpe-graph:not([data-processed])');
        if (notProcessedEls.length) {
          mermaid.init(null, notProcessedEls);
        }

        /*
         * the code below doesn't seem to be working
         * I think mermaidAPI.render function has bug
        cb = (el)->
          (svgGraph)->
            el.innerHTML = svgGraph
            el.setAttribute 'data-processed', 'true'
        
             * the code below is a hackable way to solve mermaid bug
            el.firstChild.style.height = el.getAttribute('viewbox').split(' ')[3] + 'px'
        
        for el in els
          offset = parseInt(el.getAttribute('data-offset'))
          el.id = 'mermaid'+offset
        
          mermaidAPI.render el.id, el.getAttribute('data-original'), cb(el)
         */
        return this.previewScrollDelay = Date.now() + 500;
      }
    };

    MarkdownPreviewEnhancedView.prototype.renderWavedrom = function() {
      var el, els, k, len, offset, text;
      els = this.element.getElementsByClassName('wavedrom mpe-graph');
      if (els.length) {
        this.graphData.wavedrom_s = Array.prototype.slice.call(els);
        for (k = 0, len = els.length; k < len; k++) {
          el = els[k];
          if (el.getAttribute('data-processed') !== 'true') {
            offset = parseInt(el.getAttribute('data-offset'));
            el.id = 'wavedrom' + offset;
            text = el.getAttribute('data-original').trim();
            if (!text.length) {
              continue;
            }
            allowUnsafeEval((function(_this) {
              return function() {
                var content, error;
                try {
                  content = eval("(" + text + ")");
                  WaveDrom.RenderWaveForm(offset, content, 'wavedrom');
                  el.setAttribute('data-processed', 'true');
                  return _this.scrollMap = null;
                } catch (error1) {
                  error = error1;
                  return el.innerText = 'failed to eval WaveDrom code.';
                }
              };
            })(this));
          }
        }
        return this.previewScrollDelay = Date.now() + 500;
      }
    };

    MarkdownPreviewEnhancedView.prototype.renderPlantUML = function() {
      var el, els, helper, k, len, results;
      els = this.element.getElementsByClassName('plantuml mpe-graph');
      if (els.length) {
        this.graphData.plantuml_s = Array.prototype.slice.call(els);
      }
      helper = (function(_this) {
        return function(el, text) {
          return plantumlAPI.render(text, function(outputHTML) {
            el.innerHTML = outputHTML;
            el.setAttribute('data-processed', true);
            return _this.scrollMap = null;
          });
        };
      })(this);
      results = [];
      for (k = 0, len = els.length; k < len; k++) {
        el = els[k];
        if (el.getAttribute('data-processed') !== 'true') {
          helper(el, el.getAttribute('data-original'));
          results.push(el.innerText = 'rendering graph...\n');
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    MarkdownPreviewEnhancedView.prototype.renderViz = function(element) {
      var content, el, els, error, k, len, options, results;
      if (element == null) {
        element = this.element;
      }
      els = element.getElementsByClassName('viz mpe-graph');
      if (els.length) {
        this.graphData.viz_s = Array.prototype.slice.call(els);
        if (this.Viz == null) {
          this.Viz = require('../dependencies/viz/viz.js');
        }
        results = [];
        for (k = 0, len = els.length; k < len; k++) {
          el = els[k];
          if (el.getAttribute('data-processed') !== 'true') {
            try {
              content = el.getAttribute('data-original');
              options = {};
              content = content.trim().replace(/^engine(\s)*[:=]([^\n]+)/, function(a, b, c) {
                var ref3;
                if ((ref3 = c != null ? c.trim() : void 0) === 'circo' || ref3 === 'dot' || ref3 === 'fdp' || ref3 === 'neato' || ref3 === 'osage' || ref3 === 'twopi') {
                  options.engine = c.trim();
                }
                return '';
              });
              el.innerHTML = this.Viz(content, options);
              results.push(el.setAttribute('data-processed', true));
            } catch (error1) {
              error = error1;
              results.push(el.innerHTML = error);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    MarkdownPreviewEnhancedView.prototype.renderMathJax = function() {
      var callback, el, els, k, len, unprocessedElements;
      if (this.mathRenderingOption !== 'MathJax' && !this.usePandocParser) {
        return;
      }
      if (typeof MathJax === 'undefined') {
        return loadMathJax(document, (function(_this) {
          return function() {
            return _this.renderMathJax();
          };
        })(this));
      }
      if (this.mathJaxProcessEnvironments || this.usePandocParser) {
        return MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.element], (function(_this) {
          return function() {
            return _this.scrollMap = null;
          };
        })(this));
      }
      els = this.element.getElementsByClassName('mathjax-exps');
      if (!els.length) {
        return;
      }
      unprocessedElements = [];
      for (k = 0, len = els.length; k < len; k++) {
        el = els[k];
        if (!el.hasAttribute('data-processed')) {
          el.setAttribute('data-original', el.textContent);
          unprocessedElements.push(el);
        }
      }
      callback = (function(_this) {
        return function() {
          var l, len1;
          for (l = 0, len1 = unprocessedElements.length; l < len1; l++) {
            el = unprocessedElements[l];
            el.setAttribute('data-processed', true);
          }
          return _this.scrollMap = null;
        };
      })(this);
      if (unprocessedElements.length === els.length) {
        return MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.element], callback);
      } else if (unprocessedElements.length) {
        return MathJax.Hub.Typeset(unprocessedElements, callback);
      }
    };

    MarkdownPreviewEnhancedView.prototype.renderKaTeX = function() {
      var dataOriginal, displayMode, el, els, error, k, len, results;
      if (this.mathRenderingOption !== 'KaTeX') {
        return;
      }
      els = this.element.getElementsByClassName('katex-exps');
      results = [];
      for (k = 0, len = els.length; k < len; k++) {
        el = els[k];
        if (el.hasAttribute('data-processed')) {
          continue;
        } else {
          displayMode = el.hasAttribute('display-mode');
          dataOriginal = el.textContent;
          try {
            katex.render(el.textContent, el, {
              displayMode: displayMode
            });
          } catch (error1) {
            error = error1;
            el.innerHTML = "<span style=\"color: #ee7f49; font-weight: 500;\">" + error + "</span>";
          }
          el.setAttribute('data-processed', 'true');
          results.push(el.setAttribute('data-original', dataOriginal));
        }
      }
      return results;
    };

    MarkdownPreviewEnhancedView.prototype.resizeEvent = function() {
      return this.scrollMap = null;
    };


    /*
    convert './a.txt' '/a.txt'
     */

    MarkdownPreviewEnhancedView.prototype.resolveFilePath = function(filePath, relative) {
      if (filePath == null) {
        filePath = '';
      }
      if (relative == null) {
        relative = false;
      }
      if (filePath.match(protocolsWhiteListRegExp)) {
        return filePath;
      } else if (filePath.startsWith('/')) {
        if (relative) {
          return path.relative(this.fileDirectoryPath, path.resolve(this.projectDirectoryPath, '.' + filePath));
        } else {
          return 'file:///' + path.resolve(this.projectDirectoryPath, '.' + filePath);
        }
      } else {
        if (relative) {
          return filePath;
        } else {
          return 'file:///' + path.resolve(this.fileDirectoryPath, filePath);
        }
      }
    };

    MarkdownPreviewEnhancedView.prototype.openInBrowser = function(isForPresentationPrint) {
      if (isForPresentationPrint == null) {
        isForPresentationPrint = false;
      }
      if (!this.editor) {
        return;
      }
      return this.getHTMLContent({
        offline: true,
        isForPrint: isForPresentationPrint
      }, (function(_this) {
        return function(htmlContent) {
          return temp.open({
            prefix: 'markdown-preview-enhanced',
            suffix: '.html'
          }, function(err, info) {
            if (err) {
              throw err;
            }
            return fs.write(info.fd, htmlContent, function(err) {
              var url;
              if (err) {
                throw err;
              }
              if (isForPresentationPrint) {
                url = 'file:///' + info.path + '?print-pdf';
                return atom.notifications.addInfo('Please copy and open the link below in Chrome.\nThen Right Click -> Print -> Save as Pdf.', {
                  dismissable: true,
                  detail: url
                });
              } else {
                return _this.openFile(info.path);
              }
            });
          });
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.exportToDisk = function() {
      return this.documentExporterView.display(this);
    };

    MarkdownPreviewEnhancedView.prototype.openFile = function(filePath) {
      var cmd;
      if (process.platform === 'win32') {
        cmd = 'explorer';
      } else if (process.platform === 'darwin') {
        cmd = 'open';
      } else {
        cmd = 'xdg-open';
      }
      return exec(cmd + " " + filePath);
    };

    MarkdownPreviewEnhancedView.prototype.insertCodeChunksResult = function(htmlContent) {
      var $codeChunk, $g, $s, c, cmd, code, codeChunk, codeChunks, dataArgs, e, g, gs, html, id, jsCode, k, l, len, len1, len2, len3, n, o, options, outputDiv, outputElement, ref3, ref4, ref5, requireCache, requirePath, requires, requiresStr, s, scriptsStr, ss;
      if (cheerio == null) {
        cheerio = require('cheerio');
      }
      $ = cheerio.load(htmlContent, {
        decodeEntities: false
      });
      codeChunks = $('.code-chunk');
      jsCode = '';
      requireCache = {};
      scriptsStr = "";
      for (k = 0, len = codeChunks.length; k < len; k++) {
        codeChunk = codeChunks[k];
        $codeChunk = $(codeChunk);
        dataArgs = $codeChunk.attr('data-args').unescape();
        options = null;
        try {
          allowUnsafeEval(function() {
            return options = eval("({" + dataArgs + "})");
          });
        } catch (error1) {
          e = error1;
          continue;
        }
        id = options.id;
        if (!id) {
          continue;
        }
        cmd = options.cmd || $codeChunk.attr('data-lang');
        code = $codeChunk.attr('data-code').unescape();
        outputDiv = (ref3 = this.codeChunksData[id]) != null ? ref3.outputDiv : void 0;
        outputElement = (ref4 = this.codeChunksData[id]) != null ? ref4.outputElement : void 0;
        if (outputDiv) {
          $codeChunk.append("<div class=\"output-div\">" + outputDiv.innerHTML + "</div>");
          if (options.matplotlib || options.mpl) {
            gs = $('.output-div > div', $codeChunk);
            if (gs) {
              for (l = 0, len1 = gs.length; l < len1; l++) {
                g = gs[l];
                $g = $(g);
                if ((ref5 = $g.attr('id')) != null ? ref5.match(/fig\_/) : void 0) {
                  $g.html('');
                }
              }
            }
            ss = $('.output-div > script', $codeChunk);
            if (ss) {
              for (n = 0, len2 = ss.length; n < len2; n++) {
                s = ss[n];
                $s = $(s);
                c = $s.html();
                $s.remove();
                jsCode += c + '\n';
              }
            }
          }
        }
        if (options.element) {
          $codeChunk.append("<div class=\"output-element\">" + options.element + "</div>");
        }
        if (cmd === 'javascript') {
          requires = options.require || [];
          if (typeof requires === 'string') {
            requires = [requires];
          }
          requiresStr = "";
          for (o = 0, len3 = requires.length; o < len3; o++) {
            requirePath = requires[o];
            if (requirePath.match(/^(http|https)\:\/\//)) {
              if (!requireCache[requirePath]) {
                requireCache[requirePath] = true;
                scriptsStr += "<script src=\"" + requirePath + "\"></script>\n";
              }
            } else {
              requirePath = path.resolve(this.fileDirectoryPath, requirePath);
              if (!requireCache[requirePath]) {
                requiresStr += fs.readFileSync(requirePath, {
                  encoding: 'utf-8'
                }) + '\n';
                requireCache[requirePath] = true;
              }
            }
          }
          jsCode += requiresStr + code + '\n';
        }
      }
      html = $.html();
      if (scriptsStr) {
        html += scriptsStr + "\n";
      }
      if (jsCode) {
        html += "<script data-js-code>" + jsCode + "</script>";
      }
      return html;
    };

    MarkdownPreviewEnhancedView.prototype.getHTMLContent = function(arg, callback) {
      var isForPrint, mathRenderingOption, offline, phantomjsType, res, useRelativeImagePath;
      isForPrint = arg.isForPrint, offline = arg.offline, useRelativeImagePath = arg.useRelativeImagePath, phantomjsType = arg.phantomjsType;
      if (isForPrint == null) {
        isForPrint = false;
      }
      if (offline == null) {
        offline = false;
      }
      if (useRelativeImagePath == null) {
        useRelativeImagePath = false;
      }
      if (phantomjsType == null) {
        phantomjsType = false;
      }
      if (!this.editor) {
        return callback();
      }
      mathRenderingOption = atom.config.get('markdown-preview-enhanced.mathRenderingOption');
      return res = this.parseMD(this.formatStringBeforeParsing(this.editor.getText()), {
        useRelativeImagePath: useRelativeImagePath,
        fileDirectoryPath: this.fileDirectoryPath,
        projectDirectoryPath: this.projectDirectoryPath,
        markdownPreview: this,
        hideFrontMatter: true
      }, (function(_this) {
        return function(arg1) {
          var block, dependencies, html, htmlContent, inline, mathJaxProcessEnvironments, mathStyle, phantomjsClass, presentationConfig, presentationInitScript, presentationScript, presentationStyle, previewTheme, slideConfigs, title, yamlConfig;
          html = arg1.html, yamlConfig = arg1.yamlConfig, slideConfigs = arg1.slideConfigs;
          htmlContent = _this.formatStringAfterParsing(html);
          yamlConfig = yamlConfig || {};
          htmlContent = _this.insertCodeChunksResult(htmlContent);
          if (mathRenderingOption === 'KaTeX') {
            if (offline) {
              mathStyle = "<link rel=\"stylesheet\" href=\"file:///" + (path.resolve(__dirname, '../node_modules/katex/dist/katex.min.css')) + "\">";
            } else {
              mathStyle = "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css\">";
            }
          } else if (mathRenderingOption === 'MathJax') {
            inline = atom.config.get('markdown-preview-enhanced.indicatorForMathRenderingInline');
            block = atom.config.get('markdown-preview-enhanced.indicatorForMathRenderingBlock');
            mathJaxProcessEnvironments = atom.config.get('markdown-preview-enhanced.mathJaxProcessEnvironments');
            if (offline) {
              mathStyle = "<script type=\"text/x-mathjax-config\"> MathJax.Hub.Config({ messageStyle: 'none', tex2jax: {inlineMath: " + inline + ", displayMath: " + block + ", processEnvironments: " + mathJaxProcessEnvironments + ", processEscapes: true} }); </script> <script type=\"text/javascript\" async src=\"file://" + (path.resolve(__dirname, '../dependencies/mathjax/MathJax.js?config=TeX-AMS_CHTML')) + "\"></script>";
            } else {
              mathStyle = "<script type=\"text/x-mathjax-config\"> MathJax.Hub.Config({ messageStyle: 'none', tex2jax: {inlineMath: " + inline + ", displayMath: " + block + ", processEnvironments: " + mathJaxProcessEnvironments + ", processEscapes: true} }); </script> <script type=\"text/javascript\" async src=\"https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML\"></script>";
            }
          } else {
            mathStyle = '';
          }
          if (slideConfigs.length) {
            htmlContent = _this.parseSlidesForExport(htmlContent, slideConfigs, useRelativeImagePath);
            if (offline) {
              presentationScript = "<script src='file:///" + (path.resolve(__dirname, '../dependencies/reveal/lib/js/head.min.js')) + "'></script> <script src='file:///" + (path.resolve(__dirname, '../dependencies/reveal/js/reveal.js')) + "'></script>";
            } else {
              presentationScript = "<script src='https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.4.1/lib/js/head.min.js'></script> <script src='https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.4.1/js/reveal.min.js'></script>";
            }
            presentationConfig = yamlConfig['presentation'] || {};
            dependencies = presentationConfig.dependencies || [];
            if (presentationConfig.enableSpeakerNotes) {
              if (offline) {
                dependencies.push({
                  src: path.resolve(__dirname, '../dependencies/reveal/plugin/notes/notes.js'),
                  async: true
                });
              } else {
                dependencies.push({
                  src: 'revealjs_deps/notes.js',
                  async: true
                });
              }
            }
            presentationConfig.dependencies = dependencies;
            presentationStyle = "\n<style>\n" + (fs.readFileSync(path.resolve(__dirname, '../dependencies/reveal/reveal.css'))) + "\n\n" + (isForPrint ? fs.readFileSync(path.resolve(__dirname, '../dependencies/reveal/pdf.css')) : '') + "\n</style>";
            presentationInitScript = "<script>\n  Reveal.initialize(" + (JSON.stringify(Object.assign({
              margin: 0.1
            }, presentationConfig))) + ")\n</script>";
          } else {
            presentationScript = '';
            presentationStyle = '';
            presentationInitScript = '';
          }
          phantomjsClass = "";
          if (phantomjsType) {
            if (phantomjsType === '.pdf') {
              phantomjsClass = 'phantomjs-pdf';
            } else if (phantomjsType === '.png' || phantomjsType === '.jpeg') {
              phantomjsClass = 'phantomjs-image';
            }
          }
          title = _this.getFileName();
          title = title.slice(0, title.length - path.extname(title).length);
          previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
          if (isForPrint && atom.config.get('markdown-preview-enhanced.pdfUseGithub')) {
            previewTheme = 'mpe-github-syntax';
          }
          return loadPreviewTheme(previewTheme, false, function(error, css) {
            if (error) {
              return callback();
            }
            return callback("<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\n    " + presentationStyle + "\n\n    <style>\n    " + css + "\n    </style>\n\n    " + mathStyle + "\n\n    " + presentationScript + "\n  </head>\n  <body class=\"markdown-preview-enhanced " + phantomjsClass + "\"\n      " + (_this.presentationMode ? 'data-presentation-mode' : '') + ">\n\n  " + htmlContent + "\n\n  </body>\n  " + presentationInitScript + "\n</html>");
          });
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.printPDF = function(htmlPath, dest) {
      var BrowserWindow, landscape, lastIndexOfSlash, marginsType, pdfName, win;
      if (!this.editor) {
        return;
      }
      BrowserWindow = require('electron').remote.BrowserWindow;
      win = new BrowserWindow({
        show: false
      });
      win.loadURL(htmlPath);
      marginsType = atom.config.get('markdown-preview-enhanced.marginsType');
      marginsType = marginsType === 'default margin' ? 0 : marginsType === 'no margin' ? 1 : 2;
      landscape = atom.config.get('markdown-preview-enhanced.orientation') === 'landscape';
      lastIndexOfSlash = dest.lastIndexOf('/' || 0);
      pdfName = dest.slice(lastIndexOfSlash + 1);
      return win.webContents.on('did-finish-load', (function(_this) {
        return function() {
          return setTimeout(function() {
            return win.webContents.printToPDF({
              pageSize: atom.config.get('markdown-preview-enhanced.exportPDFPageFormat'),
              landscape: landscape,
              printBackground: atom.config.get('markdown-preview-enhanced.printBackground'),
              marginsType: marginsType
            }, function(err, data) {
              var destFile;
              if (err) {
                throw err;
              }
              destFile = new File(dest);
              return destFile.create().then(function(flag) {
                destFile.write(data);
                atom.notifications.addInfo("File " + pdfName + " was created", {
                  detail: "path: " + dest
                });
                if (atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically')) {
                  return _this.openFile(dest);
                }
              });
            });
          }, 500);
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.saveAsPDF = function(dest) {
      if (!this.editor) {
        return;
      }
      if (this.presentationMode) {
        this.openInBrowser(true);
        return;
      }
      return this.getHTMLContent({
        isForPrint: true,
        offline: true
      }, (function(_this) {
        return function(htmlContent) {
          return temp.open({
            prefix: 'markdown-preview-enhanced',
            suffix: '.html'
          }, function(err, info) {
            if (err) {
              throw err;
            }
            return fs.write(info.fd, htmlContent, function(err) {
              if (err) {
                throw err;
              }
              return _this.printPDF("file://" + info.path, dest);
            });
          });
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.saveAsHTML = function(dest, offline, useRelativeImagePath) {
      if (offline == null) {
        offline = true;
      }
      if (!this.editor) {
        return;
      }
      return this.getHTMLContent({
        isForPrint: false,
        offline: offline,
        useRelativeImagePath: useRelativeImagePath
      }, (function(_this) {
        return function(htmlContent) {
          var depsDir, depsDirName, destFile, htmlFileName;
          htmlFileName = path.basename(dest);
          if (!offline && htmlContent.indexOf('[{"src":"revealjs_deps/notes.js","async":true}]') >= 0) {
            depsDirName = path.resolve(path.dirname(dest), 'revealjs_deps');
            depsDir = new Directory(depsDirName);
            depsDir.create().then(function(flag) {
              true;
              fs.createReadStream(path.resolve(__dirname, '../dependencies/reveal/plugin/notes/notes.js')).pipe(fs.createWriteStream(path.resolve(depsDirName, 'notes.js')));
              return fs.createReadStream(path.resolve(__dirname, '../dependencies/reveal/plugin/notes/notes.html')).pipe(fs.createWriteStream(path.resolve(depsDirName, 'notes.html')));
            });
          }
          destFile = new File(dest);
          return destFile.create().then(function(flag) {
            destFile.write(htmlContent);
            return atom.notifications.addInfo("File " + htmlFileName + " was created", {
              detail: "path: " + dest
            });
          });
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.parseSlides = function(html, slideConfigs, yamlConfig) {
      var height, iframeString, k, len, loop_, muted_, offset, output, presentationConfig, ratio, slide, slideConfig, slides, styleString, videoLoop, videoMuted, videoString, width, zoom;
      slides = html.split('<div class="new-slide"></div>');
      slides = slides.slice(1);
      output = '';
      offset = 0;
      width = 960;
      height = 700;
      if (yamlConfig && yamlConfig['presentation']) {
        presentationConfig = yamlConfig['presentation'];
        width = presentationConfig['width'] || 960;
        height = presentationConfig['height'] || 700;
      }
      ratio = height / width * 100 + '%';
      zoom = (this.element.offsetWidth - 128) / width;
      for (k = 0, len = slides.length; k < len; k++) {
        slide = slides[k];
        slideConfig = slideConfigs[offset];
        styleString = '';
        videoString = '';
        iframeString = '';
        if (slideConfig['data-background-image']) {
          styleString += "background-image: url('" + (this.resolveFilePath(slideConfig['data-background-image'])) + "');";
          if (slideConfig['data-background-size']) {
            styleString += "background-size: " + slideConfig['data-background-size'] + ";";
          } else {
            styleString += "background-size: cover;";
          }
          if (slideConfig['data-background-position']) {
            styleString += "background-position: " + slideConfig['data-background-position'] + ";";
          } else {
            styleString += "background-position: center;";
          }
          if (slideConfig['data-background-repeat']) {
            styleString += "background-repeat: " + slideConfig['data-background-repeat'] + ";";
          } else {
            styleString += "background-repeat: no-repeat;";
          }
        } else if (slideConfig['data-background-color']) {
          styleString += "background-color: " + slideConfig['data-background-color'] + " !important;";
        } else if (slideConfig['data-background-video']) {
          videoMuted = slideConfig['data-background-video-muted'];
          videoLoop = slideConfig['data-background-video-loop'];
          muted_ = videoMuted ? 'muted' : '';
          loop_ = videoLoop ? 'loop' : '';
          videoString = "<video " + muted_ + " " + loop_ + " playsinline autoplay class=\"background-video\" src=\"" + (this.resolveFilePath(slideConfig['data-background-video'])) + "\">\n</video>";
        } else if (slideConfig['data-background-iframe']) {
          iframeString = "<iframe class=\"background-iframe\" src=\"" + (this.resolveFilePath(slideConfig['data-background-iframe'])) + "\" frameborder=\"0\" > </iframe>\n<div class=\"background-iframe-overlay\"></div>";
        }
        output += "<div class='slide' data-offset='" + offset + "' style=\"width: " + width + "px; height: " + height + "px; zoom: " + zoom + "; " + styleString + "\">\n  " + videoString + "\n  " + iframeString + "\n  <section>" + slide + "</section>\n</div>";
        offset += 1;
      }
      output = output.replace(/(<aside\b[^>]*>)[^<>]*(<\/aside>)/ig, '');
      return "<div class=\"preview-slides\">\n  " + output + "\n</div>";
    };

    MarkdownPreviewEnhancedView.prototype.parseSlidesForExport = function(html, slideConfigs, useRelativeImagePath) {
      var attrString, i, output, parseAttrString, slide, slideConfig, slides;
      slides = html.split('<div class="new-slide"></div>');
      slides = slides.slice(1);
      output = '';
      parseAttrString = (function(_this) {
        return function(slideConfig) {
          var attrString;
          attrString = '';
          if (slideConfig['data-background-image']) {
            attrString += " data-background-image='" + (_this.resolveFilePath(slideConfig['data-background-image'], useRelativeImagePath)) + "'";
          }
          if (slideConfig['data-background-size']) {
            attrString += " data-background-size='" + slideConfig['data-background-size'] + "'";
          }
          if (slideConfig['data-background-position']) {
            attrString += " data-background-position='" + slideConfig['data-background-position'] + "'";
          }
          if (slideConfig['data-background-repeat']) {
            attrString += " data-background-repeat='" + slideConfig['data-background-repeat'] + "'";
          }
          if (slideConfig['data-background-color']) {
            attrString += " data-background-color='" + slideConfig['data-background-color'] + "'";
          }
          if (slideConfig['data-notes']) {
            attrString += " data-notes='" + slideConfig['data-notes'] + "'";
          }
          if (slideConfig['data-background-video']) {
            attrString += " data-background-video='" + (_this.resolveFilePath(slideConfig['data-background-video'], useRelativeImagePath)) + "'";
          }
          if (slideConfig['data-background-video-loop']) {
            attrString += " data-background-video-loop";
          }
          if (slideConfig['data-background-video-muted']) {
            attrString += " data-background-video-muted";
          }
          if (slideConfig['data-transition']) {
            attrString += " data-transition='" + slideConfig['data-transition'] + "'";
          }
          if (slideConfig['data-background-iframe']) {
            attrString += " data-background-iframe='" + (_this.resolveFilePath(slideConfig['data-background-iframe'], useRelativeImagePath)) + "'";
          }
          return attrString;
        };
      })(this);
      i = 0;
      while (i < slides.length) {
        slide = slides[i];
        slideConfig = slideConfigs[i];
        attrString = parseAttrString(slideConfig);
        if (!slideConfig['vertical']) {
          if (i > 0 && slideConfigs[i - 1]['vertical']) {
            output += '</section>';
          }
          if (i < slides.length - 1 && slideConfigs[i + 1]['vertical']) {
            output += "<section>";
          }
        }
        output += "<section " + attrString + ">" + slide + "</section>";
        i += 1;
      }
      if (i > 0 && slideConfigs[i - 1]['vertical']) {
        output += "</section>";
      }
      return "<div class=\"reveal\">\n  <div class=\"slides\">\n    " + output + "\n  </div>\n</div>";
    };

    MarkdownPreviewEnhancedView.prototype.loadPhantomJSHeaderFooterConfig = function() {
      var configFile, configPath, error;
      configPath = path.resolve(atom.config.configDirPath, './markdown-preview-enhanced/phantomjs_header_footer_config.js');
      try {
        delete require.cache[require.resolve(configPath)];
        return require(configPath) || {};
      } catch (error1) {
        error = error1;
        configFile = new File(configPath);
        configFile.create().then(function(flag) {
          if (!flag) {
            atom.notifications.addError('Failed to load phantomjs_header_footer_config.js', {
              detail: 'there might be errors in your config file'
            });
            return;
          }
          return configFile.write("'use strict'\n/*\nconfigure header and footer (and other options)\nmore information can be found here:\n    https://github.com/marcbachmann/node-html-pdf\nAttention: this config will override your config in exporter panel.\n\neg:\n\n  let config = {\n    \"header\": {\n      \"height\": \"45mm\",\n      \"contents\": '<div style=\"text-align: center;\">Author: Marc Bachmann</div>'\n    },\n    \"footer\": {\n      \"height\": \"28mm\",\n      \"contents\": '<span style=\"color: #444;\">{{page}}</span>/<span>{{pages}}</span>'\n    }\n  }\n*/\n// you can edit the 'config' variable below\nlet config = {\n}\n\nmodule.exports = config || {}");
        });
        return {};
      }
    };

    MarkdownPreviewEnhancedView.prototype.phantomJSExport = function(dest) {
      if (!this.editor) {
        return;
      }
      if (this.presentationMode) {
        this.openInBrowser(true);
        return;
      }
      return this.getHTMLContent({
        isForPrint: true,
        offline: true,
        phantomjsType: path.extname(dest)
      }, (function(_this) {
        return function(htmlContent) {
          var config, fileType, format, margin, orientation;
          fileType = atom.config.get('markdown-preview-enhanced.phantomJSExportFileType');
          format = atom.config.get('markdown-preview-enhanced.exportPDFPageFormat');
          orientation = atom.config.get('markdown-preview-enhanced.orientation');
          margin = atom.config.get('markdown-preview-enhanced.phantomJSMargin').trim();
          if (!margin.length) {
            margin = '1cm';
          } else {
            margin = margin.split(',').map(function(m) {
              return m.trim();
            });
            if (margin.length === 1) {
              margin = margin[0];
            } else if (margin.length === 2) {
              margin = {
                'top': margin[0],
                'bottom': margin[0],
                'left': margin[1],
                'right': margin[1]
              };
            } else if (margin.length === 4) {
              margin = {
                'top': margin[0],
                'right': margin[1],
                'bottom': margin[2],
                'left': margin[3]
              };
            } else {
              margin = '1cm';
            }
          }
          config = _this.loadPhantomJSHeaderFooterConfig();
          return pdf.create(htmlContent, Object.assign({
            type: fileType,
            format: format,
            orientation: orientation,
            border: margin,
            quality: '75',
            timeout: 60000,
            script: path.join(__dirname, '../dependencies/phantomjs/pdf_a4_portrait.js')
          }, config)).toFile(dest, function(err, res) {
            var fileName, lastIndexOfSlash;
            if (err) {
              return atom.notifications.addError(err);
            } else {
              lastIndexOfSlash = dest.lastIndexOf('/' || 0);
              fileName = dest.slice(lastIndexOfSlash + 1);
              atom.notifications.addInfo("File " + fileName + " was created", {
                detail: "path: " + dest
              });
              if (atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically')) {
                return _this.openFile(dest);
              }
            }
          });
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.generateEbook = function(dest) {
      return this.parseMD(this.formatStringBeforeParsing(this.editor.getText()), {
        isForEbook: true,
        fileDirectoryPath: this.fileDirectoryPath,
        projectDirectoryPath: this.projectDirectoryPath,
        hideFrontMatter: true
      }, (function(_this) {
        return function(arg) {
          var async, asyncFunctions, children, cover, div, ebookConfig, error, filePath, getStructure, heading, headingOffset, html, i, id, imagesToDownload, img, k, l, len, len1, level, obj, outputHTML, ref3, ref4, request, src, structure, text, yamlConfig;
          html = arg.html, yamlConfig = arg.yamlConfig;
          html = _this.formatStringAfterParsing(html);
          ebookConfig = null;
          if (yamlConfig) {
            ebookConfig = yamlConfig['ebook'];
          }
          if (!ebookConfig) {
            return atom.notifications.addError('ebook config not found', {
              detail: 'please insert ebook front-matter to your markdown file'
            });
          } else {
            atom.notifications.addInfo('Your document is being prepared', {
              detail: ':)'
            });
            if (ebookConfig.cover) {
              cover = ebookConfig.cover;
              if (cover.startsWith('./') || cover.startsWith('../')) {
                cover = path.resolve(_this.fileDirectoryPath, cover);
                ebookConfig.cover = cover;
              } else if (cover.startsWith('/')) {
                cover = path.resolve(_this.projectDirectoryPath, '.' + cover);
                ebookConfig.cover = cover;
              }
            }
            div = document.createElement('div');
            div.innerHTML = html;
            structure = [];
            headingOffset = 0;
            getStructure = function(ul, level) {
              var a, filePath, heading, id, k, len, li, ref3, ref4, ref5, results;
              ref3 = ul.children;
              results = [];
              for (k = 0, len = ref3.length; k < len; k++) {
                li = ref3[k];
                a = (ref4 = li.children[0]) != null ? (ref5 = ref4.getElementsByTagName('a')) != null ? ref5[0] : void 0 : void 0;
                if (!a) {
                  continue;
                }
                filePath = a.getAttribute('href');
                heading = a.innerHTML;
                id = 'ebook-heading-id-' + headingOffset;
                structure.push({
                  level: level,
                  filePath: filePath,
                  heading: heading,
                  id: id
                });
                headingOffset += 1;
                a.href = '#' + id;
                if (li.childElementCount > 1) {
                  results.push(getStructure(li.children[1], level + 1));
                } else {
                  results.push(void 0);
                }
              }
              return results;
            };
            children = div.children;
            i = children.length - 1;
            while (i >= 0) {
              if (children[i].tagName === 'UL') {
                getStructure(children[i], 0);
                break;
              }
              i -= 1;
            }
            outputHTML = div.innerHTML;
            for (k = 0, len = structure.length; k < len; k++) {
              obj = structure[k];
              heading = obj.heading;
              id = obj.id;
              level = obj.level;
              filePath = obj.filePath;
              if (filePath.startsWith('file:///')) {
                filePath = filePath.slice(8);
              }
              try {
                text = fs.readFileSync(filePath, {
                  encoding: 'utf-8'
                });
                _this.parseMD(_this.formatStringBeforeParsing(text), {
                  isForEbook: true,
                  projectDirectoryPath: _this.projectDirectoryPath,
                  fileDirectoryPath: path.dirname(filePath)
                }, function(arg1) {
                  var html;
                  html = arg1.html;
                  html = _this.formatStringAfterParsing(html);
                  div.innerHTML = html;
                  if (div.childElementCount) {
                    div.children[0].id = id;
                    div.children[0].setAttribute('ebook-toc-level-' + (level + 1), '');
                    div.children[0].setAttribute('heading', heading);
                  }
                  return outputHTML += div.innerHTML;
                });
              } catch (error1) {
                error = error1;
                atom.notifications.addError('Ebook generation: Failed to load file', {
                  detail: filePath + '\n ' + error
                });
                return;
              }
            }
            div.innerHTML = outputHTML;
            _this.renderViz(div);
            imagesToDownload = [];
            if ((ref3 = path.extname(dest)) === '.epub' || ref3 === '.mobi') {
              ref4 = div.getElementsByTagName('img');
              for (l = 0, len1 = ref4.length; l < len1; l++) {
                img = ref4[l];
                src = img.getAttribute('src');
                if (src.startsWith('http://') || src.startsWith('https://')) {
                  imagesToDownload.push(img);
                }
              }
            }
            request = require('request');
            async = require('async');
            if (imagesToDownload.length) {
              atom.notifications.addInfo('downloading images...');
            }
            asyncFunctions = imagesToDownload.map(function(img) {
              return function(callback) {
                var httpSrc, savePath, stream;
                httpSrc = img.getAttribute('src');
                savePath = Math.random().toString(36).substr(2, 9) + '_' + path.basename(httpSrc);
                savePath = path.resolve(_this.fileDirectoryPath, savePath);
                stream = request(httpSrc).pipe(fs.createWriteStream(savePath));
                return stream.on('finish', function() {
                  img.setAttribute('src', 'file:///' + savePath);
                  return callback(null, savePath);
                });
              };
            });
            return async.parallel(asyncFunctions, function(error, downloadedImagePaths) {
              var base64, coverImg, imageElements, imageType, len2, mathStyle, n, ref5, title;
              if (downloadedImagePaths == null) {
                downloadedImagePaths = [];
              }
              if (path.extname(dest) === '.html') {
                if (ebookConfig.cover) {
                  cover = ebookConfig.cover[0] === '/' ? 'file:///' + ebookConfig.cover : ebookConfig.cover;
                  coverImg = document.createElement('img');
                  coverImg.setAttribute('src', cover);
                  div.insertBefore(coverImg, div.firstChild);
                }
                imageElements = div.getElementsByTagName('img');
                for (n = 0, len2 = imageElements.length; n < len2; n++) {
                  img = imageElements[n];
                  src = img.getAttribute('src');
                  if (src.startsWith('file:///')) {
                    src = src.slice(8);
                    imageType = path.extname(src).slice(1);
                    try {
                      base64 = new Buffer(fs.readFileSync(src)).toString('base64');
                      img.setAttribute('src', "data:image/" + imageType + ";charset=utf-8;base64," + base64);
                    } catch (error1) {
                      error = error1;
                      throw 'Image file not found: ' + src;
                    }
                  }
                }
              }
              outputHTML = div.innerHTML;
              title = ebookConfig.title || 'no title';
              mathStyle = '';
              if (outputHTML.indexOf('class="katex"') > 0) {
                if (path.extname(dest) === '.html' && ((ref5 = ebookConfig.html) != null ? ref5.cdn : void 0)) {
                  mathStyle = "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css\">";
                } else {
                  mathStyle = "<link rel=\"stylesheet\" href=\"file:///" + (path.resolve(__dirname, '../node_modules/katex/dist/katex.min.css')) + "\">";
                }
              }
              return loadPreviewTheme('mpe-github-syntax', false, function(error, css) {
                var deleteDownloadedImages, fileName;
                if (error) {
                  css = '';
                }
                outputHTML = "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\n    <style>\n    " + css + "\n    </style>\n\n    " + mathStyle + "\n  </head>\n  <body class=\"markdown-preview-enhanced\">\n  " + outputHTML + "\n  </body>\n</html>";
                fileName = path.basename(dest);
                if (path.extname(dest) === '.html') {
                  fs.writeFile(dest, outputHTML, function(err) {
                    if (err) {
                      throw err;
                    }
                    return atom.notifications.addInfo("File " + fileName + " was created", {
                      detail: "path: " + dest
                    });
                  });
                  return;
                }
                deleteDownloadedImages = function() {
                  return downloadedImagePaths.forEach(function(imagePath) {
                    return fs.unlink(imagePath);
                  });
                };
                return temp.open({
                  prefix: 'markdown-preview-enhanced',
                  suffix: '.html'
                }, function(err, info) {
                  if (err) {
                    deleteDownloadedImages();
                    throw err;
                  }
                  return fs.write(info.fd, outputHTML, function(err) {
                    if (err) {
                      deleteDownloadedImages();
                      throw err;
                    }
                    return ebookConvert(info.path, dest, ebookConfig, function(err) {
                      deleteDownloadedImages();
                      if (err) {
                        throw err;
                      }
                      return atom.notifications.addInfo("File " + fileName + " was created", {
                        detail: "path: " + dest
                      });
                    });
                  });
                });
              });
            });
          }
        };
      })(this));
    };

    MarkdownPreviewEnhancedView.prototype.pandocDocumentExport = function() {
      var content, data, end;
      data = this.processFrontMatter(this.editor.getText()).data;
      content = this.editor.getText().trim();
      if (content.startsWith('---\n')) {
        end = content.indexOf('---\n', 4);
        content = content.slice(end + 4);
      }
      return pandocConvert(content, {
        fileDirectoryPath: this.fileDirectoryPath,
        projectDirectoryPath: this.projectDirectoryPath,
        sourceFilePath: this.editor.getPath()
      }, data, function(err, outputFilePath) {
        if (err) {
          return atom.notifications.addError('pandoc error', {
            detail: err
          });
        }
        return atom.notifications.addInfo("File " + (path.basename(outputFilePath)) + " was created", {
          detail: "path: " + outputFilePath
        });
      });
    };

    MarkdownPreviewEnhancedView.prototype.saveAsMarkdown = function() {
      var config, content, data, end;
      data = this.processFrontMatter(this.editor.getText()).data;
      data = data || {};
      content = this.editor.getText().trim();
      if (content.startsWith('---\n')) {
        end = content.indexOf('---\n', 4);
        content = content.slice(end + 4);
      }
      config = data.markdown || {};
      if (!config.image_dir) {
        config.image_dir = atom.config.get('markdown-preview-enhanced.imageFolderPath');
      }
      if (!config.path) {
        config.path = path.basename(this.editor.getPath()).replace(/\.md$/, '_.md');
      }
      if (config.front_matter) {
        content = matter.stringify(content, config.front_matter);
      }
      return markdownConvert(content, {
        projectDirectoryPath: this.projectDirectoryPath,
        fileDirectoryPath: this.fileDirectoryPath
      }, config);
    };

    MarkdownPreviewEnhancedView.prototype.copyToClipboard = function() {
      var selectedText, selection;
      if (!this.editor) {
        return false;
      }
      selection = window.getSelection();
      selectedText = selection.toString();
      atom.clipboard.write(selectedText);
      return true;
    };

    MarkdownPreviewEnhancedView.prototype.destroy = function() {
      var key;
      this.element.remove();
      this.editor = null;
      if (this.disposables) {
        this.disposables.dispose();
        this.disposables = null;
      }
      if (this.settingsDisposables) {
        this.settingsDisposables.dispose();
        this.settingsDisposables = null;
      }
      for (key in CACHE) {
        delete CACHE[key];
      }
      return this.mainModule.preview = null;
    };

    MarkdownPreviewEnhancedView.prototype.getElement = function() {
      return this.element;
    };

    return MarkdownPreviewEnhancedView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvVkFBQTtJQUFBOzs7RUFBQSxNQUFrRCxPQUFBLENBQVEsTUFBUixDQUFsRCxFQUFDLHFCQUFELEVBQVUsNkNBQVYsRUFBK0IsZUFBL0IsRUFBcUM7O0VBQ3JDLE9BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLFVBQUQsRUFBSSxjQUFKLEVBQVM7O0VBQ1QsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ04sT0FBUSxPQUFBLENBQVEsZUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFVBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsYUFBUjs7RUFDVCxPQUE0QyxPQUFBLENBQVEsVUFBUixDQUE1QyxFQUFDLHNDQUFELEVBQWtCOztFQUNsQixPQUFBLEdBQVU7O0VBRVQsbUJBQW9CLE9BQUEsQ0FBUSxTQUFSOztFQUNyQixXQUFBLEdBQWMsT0FBQSxDQUFRLFFBQVI7O0VBQ2QsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZCxjQUFlLE9BQUEsQ0FBUSxtQkFBUjs7RUFDZixnQkFBaUIsT0FBQSxDQUFRLGtCQUFSOztFQUNsQixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDbEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSOztFQUNmLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFDUCwyQkFBNEIsT0FBQSxDQUFRLHVC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QUFDLE9BQXJCLENBQUE7UUFDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGekI7O0FBS0EsV0FBQSxZQUFBO1FBQ0UsT0FBTyxLQUFNLENBQUEsR0FBQTtBQURmO2FBR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLEdBQXNCO0lBaEJmOzswQ0FrQlQsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUE7SUFEUzs7OztLQWoyRDRCO0FBdkIxQyIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBGaWxlLCBEaXJlY3Rvcnl9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCAkJCQsIFNjcm9sbFZpZXd9ICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xudGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpXG57ZXhlY30gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xucGRmID0gcmVxdWlyZSAnaHRtbC1wZGYnXG5rYXRleCA9IHJlcXVpcmUgJ2thdGV4J1xubWF0dGVyID0gcmVxdWlyZSgnZ3JheS1tYXR0ZXInKVxue2FsbG93VW5zYWZlRXZhbCwgYWxsb3dVbnNhZmVOZXdGdW5jdGlvbn0gPSByZXF1aXJlICdsb29waG9sZSdcbmNoZWVyaW8gPSBudWxsXG5cbntsb2FkUHJldmlld1RoZW1lfSA9IHJlcXVpcmUgJy4vc3R5bGUnXG5wbGFudHVtbEFQSSA9IHJlcXVpcmUgJy4vcHVtbCdcbmVib29rQ29udmVydCA9IHJlcXVpcmUgJy4vZWJvb2stY29udmVydCdcbntsb2FkTWF0aEpheH0gPSByZXF1aXJlICcuL21hdGhqYXgtd3JhcHBlcidcbntwYW5kb2NDb252ZXJ0fSA9IHJlcXVpcmUgJy4vcGFuZG9jLWNvbnZlcnQnXG5tYXJrZG93bkNvbnZlcnQgPSByZXF1aXJlICcuL21hcmtkb3duLWNvbnZlcnQnXG5jb2RlQ2h1bmtBUEkgPSByZXF1aXJlICcuL2NvZGUtY2h1bmsnXG5DQUNIRSA9IHJlcXVpcmUgJy4vY2FjaGUnXG57cHJvdG9jb2xzV2hpdGVMaXN0UmVnRXhwfSA9IHJlcXVpcmUgJy4vcHJvdG9jb2xzLXdoaXRlbGlzdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWFya2Rvd25QcmV2aWV3RW5oYW5jZWRWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICBjb25zdHJ1Y3RvcjogKHVyaSwgbWFpbk1vZHVsZSktPlxuICAgIHN1cGVyXG5cbiAgICBAdXJpID0gdXJpXG4gICAgQG1haW5Nb2R1bGUgPSBtYWluTW9kdWxlXG4gICAgQHByb3RvY2FsID0gJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6Ly8nXG4gICAgQGVkaXRvciA9IG51bGxcblxuICAgIEB0b2NDb25maWdzID0gbnVsbFxuICAgIEBzY3JvbGxNYXAgPSBudWxsXG4gICAgQGZpbGVEaXJlY3RvcnlQYXRoID0gbnVsbFxuICAgIEBwcm9qZWN0RGlyZWN0b3J5UGF0aCA9IG51bGxcblxuICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcblxuICAgIEBsaXZlVXBkYXRlID0gdHJ1ZVxuICAgIEBzY3JvbGxTeW5jID0gdHJ1ZVxuICAgIEBzY3JvbGxEdXJhdGlvbiA9IG51bGxcbiAgICBAdGV4dENoYW5nZWQgPSBmYWxzZVxuICAgIEB1c2VQYW5kb2NQYXJzZXIgPSBmYWxzZVxuXG4gICAgQG1hdGhSZW5kZXJpbmdPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicpXG4gICAgQG1hdGhSZW5kZXJpbmdPcHRpb24gPSBpZiBAbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTm9uZScgdGhlbiBudWxsIGVsc2UgQG1hdGhSZW5kZXJpbmdPcHRpb25cbiAgICBAbWF0aEpheFByb2Nlc3NFbnZpcm9ubWVudHMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aEpheFByb2Nlc3NFbnZpcm9ubWVudHMnKVxuXG4gICAgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpXG4gICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKVxuICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpXG5cbiAgICBAZG9jdW1lbnRFeHBvcnRlclZpZXcgPSBudWxsICMgYmluZGVkIGluIG1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuY29mZmVlIHN0YXJ0TUQgZnVuY3Rpb25cblxuICAgICMgdGhpcyB0d28gdmFyaWFibGVzIHdpbGwgYmUgZ290IGZyb20gJy4vbWQnXG4gICAgQHBhcnNlTUQgPSBudWxsXG4gICAgQGJ1aWxkU2Nyb2xsTWFwID0gbnVsbFxuICAgIEBwcm9jZXNzRnJvbnRNYXR0ZXIgPSBudWxsXG5cbiAgICAjIHRoaXMgdmFyaWFibGUgd2lsbCBiZSBnb3QgZnJvbSAndml6LmpzJ1xuICAgIEBWaXogPSBudWxsXG5cbiAgICAjIHRoaXMgdmFyaWFibGUgd2lsbCBjaGVjayBpZiBpdCBpcyB0aGUgZmlyc3QgdGltZSB0byByZW5kZXIgbWFya2Rvd25cbiAgICBAZmlyc3RUaW1lUmVuZGVyTWFya2Rvd29uID0gdHJ1ZVxuXG4gICAgIyBwcmVzZW50YXRpb24gbW9kZVxuICAgIEBwcmVzZW50YXRpb25Nb2RlID0gZmFsc2VcbiAgICBAc2xpZGVDb25maWdzID0gbnVsbFxuXG4gICAgIyBncmFwaCBkYXRhIHVzZWQgdG8gc2F2ZSByZW5kZXJlZCBncmFwaHNcbiAgICBAZ3JhcGhEYXRhID0gbnVsbFxuICAgIEBjb2RlQ2h1bmtzRGF0YSA9IHt9XG5cbiAgICAjIGZpbGVzIGNhY2hlIGZvciBkb2N1bWVudCBpbXBvcnRcbiAgICBAZmlsZXNDYWNoZSA9IHt9XG5cbiAgICAjIHdoZW4gcmVzaXplIHRoZSB3aW5kb3csIGNsZWFyIHRoZSBlZGl0b3JcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgQHJlc2l6ZUV2ZW50LmJpbmQodGhpcylcblxuICAgICMgcmlnaHQgY2xpY2sgZXZlbnRcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOm9wZW4taW4tYnJvd3Nlcic6ID0+IEBvcGVuSW5Ccm93c2VyKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmV4cG9ydC10by1kaXNrJzogPT4gQGV4cG9ydFRvRGlzaygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpwYW5kb2MtZG9jdW1lbnQtZXhwb3J0JzogPT4gQHBhbmRvY0RvY3VtZW50RXhwb3J0KClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnNhdmUtYXMtbWFya2Rvd24nOiA9PiBAc2F2ZUFzTWFya2Rvd24oKVxuICAgICAgJ2NvcmU6Y29weSc6ID0+IEBjb3B5VG9DbGlwYm9hcmQoKVxuXG4gICAgIyBpbml0IHNldHRpbmdzXG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGluaXRTZXR0aW5nc0V2ZW50cygpXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMSwgc3R5bGU6IFwiYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgcGFkZGluZzogMzJweDsgY29sb3I6ICMyMjI7XCIsID0+XG4gICAgICAjIEBwIHN0eWxlOiAnZm9udC1zaXplOiAyNHB4JywgJ2xvYWRpbmcgcHJldmlldy4uLidcbiAgICAgIEBkaXYgY2xhc3M6IFwibWFya2Rvd24tc3Bpbm5lclwiLCAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgQGdldEZpbGVOYW1lKCkgKyAnIHByZXZpZXcnXG5cbiAgZ2V0RmlsZU5hbWU6IC0+XG4gICAgaWYgQGVkaXRvclxuICAgICAgQGVkaXRvci5nZXRGaWxlTmFtZSgpXG4gICAgZWxzZVxuICAgICAgJ3Vua25vd24nXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgJ21hcmtkb3duJ1xuXG4gIGdldFVSSTogLT5cbiAgICBAdXJpXG5cbiAgZ2V0UHJvamVjdERpcmVjdG9yeVBhdGg6IC0+XG4gICAgaWYgIUBlZGl0b3JcbiAgICAgIHJldHVybiAnJ1xuXG4gICAgZWRpdG9yUGF0aCA9IEBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgcHJvamVjdERpcmVjdG9yaWVzID0gYXRvbS5wcm9qZWN0LnJvb3REaXJlY3Rvcmllc1xuICAgIGZvciBwcm9qZWN0RGlyZWN0b3J5IGluIHByb2plY3REaXJlY3Rvcmllc1xuICAgICAgaWYgKHByb2plY3REaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yUGF0aCkpICMgZWRpdG9yIGJlbG9uZ3MgdG8gdGhpcyBwcm9qZWN0XG4gICAgICAgIHJldHVybiBwcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKVxuXG4gICAgcmV0dXJuICcnXG5cbiAgc2V0VGFiVGl0bGU6ICh0aXRsZSktPlxuICAgIHRhYlRpdGxlID0gJCgnW2RhdGEtdHlwZT1cIk1hcmtkb3duUHJldmlld0VuaGFuY2VkVmlld1wiXSBkaXYudGl0bGUnKVxuICAgIGlmIHRhYlRpdGxlLmxlbmd0aFxuICAgICAgdGFiVGl0bGVbMF0uaW5uZXJUZXh0ID0gdGl0bGVcblxuICB1cGRhdGVUYWJUaXRsZTogLT5cbiAgICBAc2V0VGFiVGl0bGUoQGdldFRpdGxlKCkpXG5cbiAgc2V0TWVybWFpZFRoZW1lOiAobWVybWFpZFRoZW1lKS0+XG4gICAgbWVybWFpZFRoZW1lU3R5bGUgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9tZXJtYWlkLycrbWVybWFpZFRoZW1lKSwge2VuY29kaW5nOiAndXRmLTgnfSkudG9TdHJpbmcoKVxuICAgIG1lcm1haWRTdHlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXJtYWlkLXN0eWxlJylcblxuICAgIGlmIG1lcm1haWRTdHlsZVxuICAgICAgbWVybWFpZFN0eWxlLnJlbW92ZSgpXG5cbiAgICBtZXJtYWlkU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgbWVybWFpZFN0eWxlLmlkID0gJ21lcm1haWQtc3R5bGUnXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChtZXJtYWlkU3R5bGUpXG5cbiAgICBtZXJtYWlkU3R5bGUuaW5uZXJIVE1MID0gbWVybWFpZFRoZW1lU3R5bGVcblxuICAgICMgcmVuZGVyIG1lcm1haWQgZ3JhcGhzIGFnYWluXG4gICAgIyBlbHMgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZXJtYWlkJylcbiAgICBAZ3JhcGhEYXRhPy5tZXJtYWlkX3MgPSBbXVxuICAgIEByZW5kZXJNYXJrZG93bigpXG5cbiAgYmluZEVkaXRvcjogKGVkaXRvciktPlxuICAgIGlmIG5vdCBAZWRpdG9yXG4gICAgICBhdG9tLndvcmtzcGFjZVxuICAgICAgICAgIC5vcGVuIEB1cmksXG4gICAgICAgICAgICAgICAgc3BsaXQ6ICdyaWdodCcsXG4gICAgICAgICAgICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgICAgICAgICAudGhlbiAoZSk9PlxuICAgICAgICAgICAgcHJldmlld1RoZW1lID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnByZXZpZXdUaGVtZScpXG4gICAgICAgICAgICBsb2FkUHJldmlld1RoZW1lIHByZXZpZXdUaGVtZSwgdHJ1ZSwgKCk9PlxuICAgICAgICAgICAgICBAaW5pdEV2ZW50cyhlZGl0b3IpXG5cbiAgICBlbHNlXG4gICAgICAjIHNhdmUgY2FjaGVcbiAgICAgIENBQ0hFW0BlZGl0b3IuZ2V0UGF0aCgpXSA9IHtcbiAgICAgICAgaHRtbDogQGVsZW1lbnQ/LmlubmVySFRNTCBvciAnJyxcbiAgICAgICAgY29kZUNodW5rc0RhdGE6IEBjb2RlQ2h1bmtzRGF0YSxcbiAgICAgICAgZ3JhcGhEYXRhOiBAZ3JhcGhEYXRhLFxuICAgICAgICBwcmVzZW50YXRpb25Nb2RlOiBAcHJlc2VudGF0aW9uTW9kZSxcbiAgICAgICAgc2xpZGVDb25maWdzOiBAc2xpZGVDb25maWdzLFxuICAgICAgICBmaWxlc0NhY2hlOiBAZmlsZXNDYWNoZSxcbiAgICAgIH1cblxuICAgICAgIyBAZWxlbWVudC5pbm5lckhUTUwgPSAnPHAgc3R5bGU9XCJmb250LXNpemU6IDI0cHg7XCI+IGxvYWRpbmcgcHJldmlldy4uLiA8YnI+dHlwZSBzb21ldGhpbmcgaWYgcHJldmlldyBkb2VzblxcJ3QgcmVuZGVyIDooIDwvcD4nXG5cbiAgICAgIHNldFRpbWVvdXQoKCk9PlxuICAgICAgICBAaW5pdEV2ZW50cyhlZGl0b3IpXG4gICAgICAsIDApXG5cbiAgaW5pdEV2ZW50czogKGVkaXRvciktPlxuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBAdXBkYXRlVGFiVGl0bGUoKVxuICAgIEBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKVxuXG4gICAgaWYgbm90IEBwYXJzZU1EXG4gICAgICB7QHBhcnNlTUQsIEBidWlsZFNjcm9sbE1hcCwgQHByb2Nlc3NGcm9udE1hdHRlcn0gPSByZXF1aXJlICcuL21kJ1xuICAgICAgcmVxdWlyZSAnLi4vZGVwZW5kZW5jaWVzL3dhdmVkcm9tL2RlZmF1bHQuanMnXG4gICAgICByZXF1aXJlICcuLi9kZXBlbmRlbmNpZXMvd2F2ZWRyb20vd2F2ZWRyb20ubWluLmpzJ1xuXG4gICAgQHRvY0NvbmZpZ3MgPSBudWxsXG4gICAgQHNjcm9sbE1hcCA9IG51bGxcbiAgICBAZmlsZURpcmVjdG9yeVBhdGggPSBAZWRpdG9yLmdldERpcmVjdG9yeVBhdGgoKVxuICAgIEBwcm9qZWN0RGlyZWN0b3J5UGF0aCA9IEBnZXRQcm9qZWN0RGlyZWN0b3J5UGF0aCgpXG4gICAgQGZpcnN0VGltZVJlbmRlck1hcmtkb3dvbiA9IHRydWVcbiAgICBAZmlsZXNDYWNoZSA9IHt9XG5cbiAgICBpZiBAZGlzcG9zYWJsZXMgIyByZW1vdmUgYWxsIGJpbmRlZCBldmVudHNcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAaW5pdEVkaXRvckV2ZW50KClcbiAgICBAaW5pdFZpZXdFdmVudCgpXG5cbiAgICAjIHJlc3RvcmUgcHJldmlld1xuICAgIGQgPSBDQUNIRVtAZWRpdG9yLmdldFBhdGgoKV1cbiAgICBpZiBkXG4gICAgICBAZWxlbWVudC5pbm5lckhUTUwgPSBkLmh0bWxcbiAgICAgIEBncmFwaERhdGEgPSBkLmdyYXBoRGF0YVxuICAgICAgQGNvZGVDaHVua3NEYXRhID0gZC5jb2RlQ2h1bmtzRGF0YVxuICAgICAgQHByZXNlbnRhdGlvbk1vZGUgPSBkLnByZXNlbnRhdGlvbk1vZGVcbiAgICAgIEBzbGlkZUNvbmZpZ3MgPSBkLnNsaWRlQ29uZmlnc1xuICAgICAgQGZpbGVzQ2FjaGUgPSBkLmZpbGVzQ2FjaGVcblxuICAgICAgaWYgQHByZXNlbnRhdGlvbk1vZGVcbiAgICAgICAgQGVsZW1lbnQuc2V0QXR0cmlidXRlICdkYXRhLXByZXNlbnRhdGlvbi1wcmV2aWV3LW1vZGUnLCAnJ1xuICAgICAgZWxzZVxuICAgICAgICBAZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUgJ2RhdGEtcHJlc2VudGF0aW9uLXByZXZpZXctbW9kZSdcblxuICAgICAgQHNldEluaXRpYWxTY3JvbGxQb3MoKVxuICAgICAgIyBjb25zb2xlLmxvZyAncmVzdG9yZSAnICsgQGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgIyByZXNldCBiYWNrIHRvIHRvcCBidXR0b24gb25jbGljayBldmVudFxuICAgICAgQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYmFjay10by10b3AtYnRuJyk/WzBdPy5vbmNsaWNrID0gKCk9PlxuICAgICAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSAwXG5cbiAgICAgICMgcmVzZXQgcmVmcmVzaCBidXR0b24gb25jbGljayBldmVudFxuICAgICAgQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmVmcmVzaC1idG4nKT9bMF0/Lm9uY2xpY2sgPSAoKT0+XG4gICAgICAgIEBmaWxlc0NhY2hlID0ge31cbiAgICAgICAgY29kZUNodW5rQVBJLmNsZWFyQ2FjaGUoKVxuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAjIHJlYmluZCB0YWcgYSBjbGljayBldmVudFxuICAgICAgQGJpbmRUYWdBQ2xpY2tFdmVudCgpXG5cbiAgICAgICMgcmVuZGVyIHBsYW50dW1sIGluIGNhc2VcbiAgICAgIEByZW5kZXJQbGFudFVNTCgpXG5cbiAgICAgICMgcmVzZXQgY29kZSBjaHVua3NcbiAgICAgIEBzZXR1cENvZGVDaHVua3MoKVxuICAgIGVsc2VcbiAgICAgIEByZW5kZXJNYXJrZG93bigpXG4gICAgQHNjcm9sbE1hcCA9IG51bGxcblxuICBpbml0RWRpdG9yRXZlbnQ6IC0+XG4gICAgZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ICgpPT5cbiAgICAgIEBzZXRUYWJUaXRsZSgndW5rbm93biBwcmV2aWV3JylcbiAgICAgIGlmIEBkaXNwb3NhYmxlc1xuICAgICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcbiAgICAgIEBlZGl0b3IgPSBudWxsXG4gICAgICBAZWxlbWVudC5vbnNjcm9sbCA9IG51bGxcblxuICAgICAgQGVsZW1lbnQuaW5uZXJIVE1MID0gJzxwIHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPiBPcGVuIGEgbWFya2Rvd24gZmlsZSB0byBzdGFydCBwcmV2aWV3IDwvcD4nXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCk9PlxuICAgICAgIyBAdGV4dENoYW5nZWQgPSB0cnVlICMgdGhpcyBsaW5lIGhhcyBwcm9ibGVtLlxuICAgICAgaWYgQGxpdmVVcGRhdGUgYW5kICFAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB1cGRhdGVNYXJrZG93bigpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTYXZlICgpPT5cbiAgICAgIGlmIG5vdCBAbGl2ZVVwZGF0ZSBvciBAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB0ZXh0Q2hhbmdlZCA9IHRydWVcbiAgICAgICAgQHVwZGF0ZU1hcmtkb3duKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZU1vZGlmaWVkICgpPT5cbiAgICAgIGlmIG5vdCBAbGl2ZVVwZGF0ZSBvciBAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB0ZXh0Q2hhbmdlZCA9IHRydWVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCAoKT0+XG4gICAgICBpZiAhQHNjcm9sbFN5bmMgb3IgIUBlbGVtZW50IG9yIEB0ZXh0Q2hhbmdlZCBvciAhQGVkaXRvciBvciBAcHJlc2VudGF0aW9uTW9kZVxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAZWRpdG9yU2Nyb2xsRGVsYXlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGVkaXRvckhlaWdodCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpLmdldEhlaWdodCgpXG5cbiAgICAgIGZpcnN0VmlzaWJsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGxhc3RWaXNpYmxlU2NyZWVuUm93ID0gZmlyc3RWaXNpYmxlU2NyZWVuUm93ICsgTWF0aC5mbG9vcihlZGl0b3JIZWlnaHQgLyBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKVxuXG4gICAgICBsaW5lTm8gPSBNYXRoLmZsb29yKChmaXJzdFZpc2libGVTY3JlZW5Sb3cgKyBsYXN0VmlzaWJsZVNjcmVlblJvdykgLyAyKVxuXG4gICAgICBAc2Nyb2xsTWFwID89IEBidWlsZFNjcm9sbE1hcCh0aGlzKVxuXG4gICAgICAjIGRpc2FibGUgbWFya2Rvd25IdG1sVmlldyBvbnNjcm9sbFxuICAgICAgQHByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcblxuICAgICAgIyBzY3JvbGwgcHJldmlldyB0byBtb3N0IHRvcCBhcyBlZGl0b3IgaXMgYXQgbW9zdCB0b3AuXG4gICAgICByZXR1cm4gQHNjcm9sbFRvUG9zKDApIGlmIGZpcnN0VmlzaWJsZVNjcmVlblJvdyA9PSAwXG5cbiAgICAgICMgQGVsZW1lbnQuc2Nyb2xsVG9wID0gQHNjcm9sbE1hcFtsaW5lTm9dIC0gZWRpdG9ySGVpZ2h0IC8gMlxuICAgICAgaWYgbGluZU5vIG9mIEBzY3JvbGxNYXAgdGhlbiBAc2Nyb2xsVG9Qb3MoQHNjcm9sbE1hcFtsaW5lTm9dLWVkaXRvckhlaWdodCAvIDIpXG5cbiAgICAjIG1hdGNoIG1hcmtkb3duIHByZXZpZXcgdG8gY3Vyc29yIHBvc2l0aW9uXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KT0+XG4gICAgICBpZiAhQHNjcm9sbFN5bmMgb3IgIUBlbGVtZW50IG9yIEB0ZXh0Q2hhbmdlZFxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAcGFyc2VEZWxheVxuICAgICAgICByZXR1cm5cblxuICAgICAgIyB0cmFjayBjdXJybmV0IHRpbWUgdG8gZGlzYWJsZSBvbkRpZENoYW5nZVNjcm9sbFRvcFxuICAgICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgICAgIyBkaXNhYmxlIHByZXZpZXcgb25zY3JvbGxcbiAgICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlIGFuZCBAc2xpZGVDb25maWdzXG4gICAgICAgIHJldHVybiBAc2Nyb2xsU3luY0ZvclByZXNlbnRhdGlvbihldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3cpXG5cbiAgICAgIGlmIGV2ZW50Lm9sZFNjcmVlblBvc2l0aW9uLnJvdyAhPSBldmVudC5uZXdTY3JlZW5Qb3NpdGlvbi5yb3cgb3IgZXZlbnQub2xkU2NyZWVuUG9zaXRpb24uY29sdW1uID09IDBcbiAgICAgICAgbGluZU5vID0gZXZlbnQubmV3U2NyZWVuUG9zaXRpb24ucm93XG4gICAgICAgIGlmIGxpbmVObyA8PSAxICAjIGZpcnN0IDJuZCByb3dzXG4gICAgICAgICAgQHNjcm9sbFRvUG9zKDApXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgbGluZU5vID49IEBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgLSAyICMgbGFzdCAybmQgcm93c1xuICAgICAgICAgIEBzY3JvbGxUb1BvcyhAZWxlbWVudC5zY3JvbGxIZWlnaHQgLSAxNilcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBAc2Nyb2xsU3luY1RvTGluZU5vKGxpbmVObylcblxuICBpbml0Vmlld0V2ZW50OiAtPlxuICAgIEBlbGVtZW50Lm9uc2Nyb2xsID0gKCk9PlxuICAgICAgaWYgIUBlZGl0b3Igb3IgIUBzY3JvbGxTeW5jIG9yIEB0ZXh0Q2hhbmdlZCBvciBAcHJlc2VudGF0aW9uTW9kZVxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAcHJldmlld1Njcm9sbERlbGF5XG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBAZWxlbWVudC5zY3JvbGxUb3AgPT0gMCAjIG1vc3QgdG9wXG4gICAgICAgIEBlZGl0b3JTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcbiAgICAgICAgcmV0dXJuIEBzY3JvbGxUb1BvcyAwLCBAZWRpdG9yLmdldEVsZW1lbnQoKVxuXG4gICAgICB0b3AgPSBAZWxlbWVudC5zY3JvbGxUb3AgKyBAZWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyXG5cbiAgICAgICMgdHJ5IHRvIGZpbmQgY29ycmVzcG9uZGluZyBzY3JlZW4gYnVmZmVyIHJvd1xuICAgICAgQHNjcm9sbE1hcCA/PSBAYnVpbGRTY3JvbGxNYXAodGhpcylcblxuICAgICAgaSA9IDBcbiAgICAgIGogPSBAc2Nyb2xsTWFwLmxlbmd0aCAtIDFcbiAgICAgIGNvdW50ID0gMFxuICAgICAgc2NyZWVuUm93ID0gLTFcblxuICAgICAgd2hpbGUgY291bnQgPCAyMFxuICAgICAgICBpZiBNYXRoLmFicyh0b3AgLSBAc2Nyb2xsTWFwW2ldKSA8IDIwXG4gICAgICAgICAgc2NyZWVuUm93ID0gaVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2UgaWYgTWF0aC5hYnModG9wIC0gQHNjcm9sbE1hcFtqXSkgPCAyMFxuICAgICAgICAgIHNjcmVlblJvdyA9IGpcbiAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbWlkID0gTWF0aC5mbG9vcigoaSArIGopIC8gMilcbiAgICAgICAgICBpZiB0b3AgPiBAc2Nyb2xsTWFwW21pZF1cbiAgICAgICAgICAgIGkgPSBtaWRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBqID0gbWlkXG5cbiAgICAgICAgY291bnQrK1xuXG4gICAgICBpZiBzY3JlZW5Sb3cgPT0gLTFcbiAgICAgICAgc2NyZWVuUm93ID0gbWlkXG5cbiAgICAgIEBzY3JvbGxUb1BvcyhzY3JlZW5Sb3cgKiBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpIC0gQGVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMiwgQGVkaXRvci5nZXRFbGVtZW50KCkpXG4gICAgICAjIEBlZGl0b3IuZ2V0RWxlbWVudCgpLnNldFNjcm9sbFRvcFxuXG4gICAgICAjIHRyYWNrIGN1cnJuZXQgdGltZSB0byBkaXNhYmxlIG9uRGlkQ2hhbmdlU2Nyb2xsVG9wXG4gICAgICBAZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgaW5pdFNldHRpbmdzRXZlbnRzOiAtPlxuICAgICMgYnJlYWsgbGluZT9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5icmVha09uU2luZ2xlTmV3bGluZScsXG4gICAgICAoYnJlYWtPblNpbmdsZU5ld2xpbmUpPT5cbiAgICAgICAgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpICMgPC0gZml4ICdsb2FkaW5nIHByZXZpZXcnIHN0dWNrIGJ1Z1xuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgIyB0eXBvZ3JhcGhlcj9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVUeXBvZ3JhcGhlcicsXG4gICAgICAoZW5hYmxlVHlwb2dyYXBoZXIpPT5cbiAgICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgbGl2ZVVwZGF0ZT9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5saXZlVXBkYXRlJyxcbiAgICAgIChmbGFnKSA9PlxuICAgICAgICBAbGl2ZVVwZGF0ZSA9IGZsYWdcbiAgICAgICAgQHNjcm9sbE1hcCA9IG51bGxcblxuICAgICMgc2Nyb2xsIHN5bmM/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYycsXG4gICAgICAoZmxhZykgPT5cbiAgICAgICAgQHNjcm9sbFN5bmMgPSBmbGFnXG4gICAgICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgICAjIHNjcm9sbCBkdXJhdGlvblxuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnNjcm9sbER1cmF0aW9uJywgKGR1cmF0aW9uKT0+XG4gICAgICBkdXJhdGlvbiA9IHBhcnNlSW50KGR1cmF0aW9uKSBvciAwXG4gICAgICBpZiBkdXJhdGlvbiA8IDBcbiAgICAgICAgQHNjcm9sbER1cmF0aW9uID0gMTIwXG4gICAgICBlbHNlXG4gICAgICAgIEBzY3JvbGxEdXJhdGlvbiA9IGR1cmF0aW9uXG5cbiAgICAjIG1hdGg/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicsXG4gICAgICAob3B0aW9uKSA9PlxuICAgICAgICBAbWF0aFJlbmRlcmluZ09wdGlvbiA9IG9wdGlvblxuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgIyBwYW5kb2MgcGFyc2VyP1xuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVBhbmRvY1BhcnNlcicsIChmbGFnKT0+XG4gICAgICBAdXNlUGFuZG9jUGFyc2VyID0gZmxhZ1xuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgbWVybWFpZCB0aGVtZVxuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1lcm1haWRUaGVtZScsXG4gICAgICAodGhlbWUpID0+XG4gICAgICAgIEBzZXRNZXJtYWlkVGhlbWUgdGhlbWUgIyBoYWNrIHRvIHNvbHZlIGh0dHBzOi8vZ2l0aHViLmNvbS9leHVwZXJvL3NhdmVTdmdBc1BuZy9pc3N1ZXMvMTI4IHByb2JsZW1cbiAgICAgICAgIyBAZWxlbWVudC5zZXRBdHRyaWJ1dGUgJ2RhdGEtbWVybWFpZC10aGVtZScsIHRoZW1lXG5cbiAgICAjIHJlbmRlciBmcm9udCBtYXR0ZXIgYXMgdGFibGU/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24nLCAoKSA9PlxuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgc2hvdyBiYWNrIHRvIHRvcCBidXR0b24/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2hvd0JhY2tUb1RvcEJ1dHRvbicsIChmbGFnKT0+XG4gICAgICBAc2hvd0JhY2tUb1RvcEJ1dHRvbiA9IGZsYWdcbiAgICAgIGlmIGZsYWdcbiAgICAgICAgQGFkZEJhY2tUb1RvcEJ1dHRvbigpXG4gICAgICBlbHNlXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2JhY2stdG8tdG9wLWJ0bicpWzBdPy5yZW1vdmUoKVxuXG4gIHNjcm9sbFN5bmNGb3JQcmVzZW50YXRpb246IChidWZmZXJMaW5lTm8pLT5cbiAgICBpID0gQHNsaWRlQ29uZmlncy5sZW5ndGggLSAxXG4gICAgd2hpbGUgaSA+PSAwXG4gICAgICBpZiBidWZmZXJMaW5lTm8gPj0gQHNsaWRlQ29uZmlnc1tpXS5saW5lXG4gICAgICAgIGJyZWFrXG4gICAgICBpLT0xXG4gICAgc2xpZGVFbGVtZW50ID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZVtkYXRhLW9mZnNldD1cXFwiI3tpfVxcXCJdXCIpXG5cbiAgICByZXR1cm4gaWYgbm90IHNsaWRlRWxlbWVudFxuXG4gICAgIyBzZXQgc2xpZGUgdG8gbWlkZGxlIG9mIHByZXZpZXdcbiAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSAtQGVsZW1lbnQub2Zmc2V0SGVpZ2h0LzIgKyAoc2xpZGVFbGVtZW50Lm9mZnNldFRvcCArIHNsaWRlRWxlbWVudC5vZmZzZXRIZWlnaHQvMikqcGFyc2VGbG9hdChzbGlkZUVsZW1lbnQuc3R5bGUuem9vbSlcblxuICAjIGxpbmVObyBoZXJlIGlzIHNjcmVlbiBidWZmZXIgcm93LlxuICBzY3JvbGxTeW5jVG9MaW5lTm86IChsaW5lTm8pLT5cbiAgICBAc2Nyb2xsTWFwID89IEBidWlsZFNjcm9sbE1hcCh0aGlzKVxuXG4gICAgZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpXG5cbiAgICBmaXJzdFZpc2libGVTY3JlZW5Sb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgcG9zUmF0aW8gPSAobGluZU5vIC0gZmlyc3RWaXNpYmxlU2NyZWVuUm93KSAvIChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcblxuICAgIHNjcm9sbFRvcCA9IEBzY3JvbGxNYXBbbGluZU5vXSAtIChpZiBwb3NSYXRpbyA+IDEgdGhlbiAxIGVsc2UgcG9zUmF0aW8pICogZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKVxuICAgIHNjcm9sbFRvcCA9IDAgaWYgc2Nyb2xsVG9wIDwgMFxuXG4gICAgQHNjcm9sbFRvUG9zIHNjcm9sbFRvcFxuXG4gICMgc21vb3RoIHNjcm9sbCBAZWxlbWVudCB0byBzY3JvbGxUb3BcbiAgIyBpZiBlZGl0b3JFbGVtZW50IGlzIHByb3ZpZGVkLCB0aGVuIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcbiAgc2Nyb2xsVG9Qb3M6IChzY3JvbGxUb3AsIGVkaXRvckVsZW1lbnQ9bnVsbCktPlxuICAgIGlmIEBzY3JvbGxUaW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQgQHNjcm9sbFRpbWVvdXRcbiAgICAgIEBzY3JvbGxUaW1lb3V0ID0gbnVsbFxuXG4gICAgaWYgbm90IEBlZGl0b3Igb3Igbm90IEBlZGl0b3IuYWxpdmUgb3Igc2Nyb2xsVG9wIDwgMFxuICAgICAgcmV0dXJuXG5cbiAgICBkZWxheSA9IDEwXG5cbiAgICBoZWxwZXIgPSAoZHVyYXRpb249MCk9PlxuICAgICAgQHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgIGlmIGR1cmF0aW9uIDw9IDBcbiAgICAgICAgICBpZiBlZGl0b3JFbGVtZW50XG4gICAgICAgICAgICBAZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCBzY3JvbGxUb3BcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcHJldmlld1Njcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudFxuICAgICAgICAgIGRpZmZlcmVuY2UgPSBzY3JvbGxUb3AgLSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkaWZmZXJlbmNlID0gc2Nyb2xsVG9wIC0gQGVsZW1lbnQuc2Nyb2xsVG9wXG5cbiAgICAgICAgcGVyVGljayA9IGRpZmZlcmVuY2UgLyBkdXJhdGlvbiAqIGRlbGF5XG5cbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudFxuICAgICAgICAgICMgZGlzYWJsZSBlZGl0b3Igc2Nyb2xsXG4gICAgICAgICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgICAgcyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgKyBwZXJUaWNrXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Agc1xuICAgICAgICAgIHJldHVybiBpZiBzID09IHNjcm9sbFRvcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBkaXNhYmxlIHByZXZpZXcgb25zY3JvbGxcbiAgICAgICAgICBAcHJldmlld1Njcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wICs9IHBlclRpY2tcbiAgICAgICAgICByZXR1cm4gaWYgQGVsZW1lbnQuc2Nyb2xsVG9wID09IHNjcm9sbFRvcFxuXG4gICAgICAgIGhlbHBlciBkdXJhdGlvbi1kZWxheVxuICAgICAgLCBkZWxheVxuXG4gICAgaGVscGVyKEBzY3JvbGxEdXJhdGlvbilcblxuICBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nOiAoc3RyKS0+XG4gICAgQG1haW5Nb2R1bGUuaG9vay5jaGFpbignb24td2lsbC1wYXJzZS1tYXJrZG93bicsIHN0cilcblxuICBmb3JtYXRTdHJpbmdBZnRlclBhcnNpbmc6IChzdHIpLT5cbiAgICBAbWFpbk1vZHVsZS5ob29rLmNoYWluKCdvbi1kaWQtcGFyc2UtbWFya2Rvd24nLCBzdHIpXG5cbiAgdXBkYXRlTWFya2Rvd246IC0+XG4gICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gIHJlbmRlck1hcmtkb3duOiAtPlxuICAgIGlmIERhdGUubm93KCkgPCBAcGFyc2VEZWxheSBvciAhQGVkaXRvciBvciAhQGVsZW1lbnRcbiAgICAgIEB0ZXh0Q2hhbmdlZCA9IGZhbHNlXG4gICAgICByZXR1cm5cbiAgICBAcGFyc2VEZWxheSA9IERhdGUubm93KCkgKyAyMDBcblxuICAgIEBwYXJzZU1EIEBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nKEBlZGl0b3IuZ2V0VGV4dCgpKSwge2lzRm9yUHJldmlldzogdHJ1ZSwgbWFya2Rvd25QcmV2aWV3OiB0aGlzLCBAZmlsZURpcmVjdG9yeVBhdGgsIEBwcm9qZWN0RGlyZWN0b3J5UGF0aH0sICh7aHRtbCwgc2xpZGVDb25maWdzLCB5YW1sQ29uZmlnfSk9PlxuICAgICAgaHRtbCA9IEBmb3JtYXRTdHJpbmdBZnRlclBhcnNpbmcoaHRtbClcblxuICAgICAgaWYgc2xpZGVDb25maWdzLmxlbmd0aFxuICAgICAgICBodG1sID0gQHBhcnNlU2xpZGVzKGh0bWwsIHNsaWRlQ29uZmlncywgeWFtbENvbmZpZylcbiAgICAgICAgQGVsZW1lbnQuc2V0QXR0cmlidXRlICdkYXRhLXByZXNlbnRhdGlvbi1wcmV2aWV3LW1vZGUnLCAnJ1xuICAgICAgICBAcHJlc2VudGF0aW9uTW9kZSA9IHRydWVcbiAgICAgICAgQHNsaWRlQ29uZmlncyA9IHNsaWRlQ29uZmlnc1xuICAgICAgZWxzZVxuICAgICAgICBAZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUgJ2RhdGEtcHJlc2VudGF0aW9uLXByZXZpZXctbW9kZSdcbiAgICAgICAgQHByZXNlbnRhdGlvbk1vZGUgPSBmYWxzZVxuXG4gICAgICBAZWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG4gICAgICBAZ3JhcGhEYXRhID0ge31cbiAgICAgIEBiaW5kRXZlbnRzKClcblxuICAgICAgQG1haW5Nb2R1bGUuZW1pdHRlci5lbWl0ICdvbi1kaWQtcmVuZGVyLXByZXZpZXcnLCB7aHRtbFN0cmluZzogaHRtbCwgcHJldmlld0VsZW1lbnQ6IEBlbGVtZW50fVxuXG4gICAgICBAc2V0SW5pdGlhbFNjcm9sbFBvcygpXG4gICAgICBAYWRkQmFja1RvVG9wQnV0dG9uKClcbiAgICAgIEBhZGRSZWZyZXNoQnV0dG9uKClcblxuICAgICAgQHRleHRDaGFuZ2VkID0gZmFsc2VcblxuICBzZXRJbml0aWFsU2Nyb2xsUG9zOiAtPlxuICAgIGlmIEBmaXJzdFRpbWVSZW5kZXJNYXJrZG93b25cbiAgICAgIEBmaXJzdFRpbWVSZW5kZXJNYXJrZG93b24gPSBmYWxzZVxuICAgICAgY3Vyc29yID0gQGVkaXRvci5jdXJzb3JzWzBdXG4gICAgICByZXR1cm4gaWYgbm90IGN1cnNvclxuICAgICAgaWYgQHByZXNlbnRhdGlvbk1vZGVcbiAgICAgICAgQHNjcm9sbFN5bmNGb3JQcmVzZW50YXRpb24gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBlbHNlXG4gICAgICAgIHQgPSBAc2Nyb2xsRHVyYXRpb25cbiAgICAgICAgQHNjcm9sbER1cmF0aW9uID0gMFxuICAgICAgICBAc2Nyb2xsU3luY1RvTGluZU5vIGN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgICAgICBAc2Nyb2xsRHVyYXRpb24gPSB0XG5cbiAgYWRkQmFja1RvVG9wQnV0dG9uOiAtPlxuICAgICMgVE9ETzogY2hlY2sgY29uZmlnXG5cbiAgICAjIGFkZCBiYWNrIHRvIHRvcCBidXR0b24gIzIyMlxuICAgIGlmIEBzaG93QmFja1RvVG9wQnV0dG9uIGFuZCBAZWxlbWVudC5zY3JvbGxIZWlnaHQgPiBAZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICAgIGJhY2tUb1RvcEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBiYWNrVG9Ub3BCdG4uY2xhc3NMaXN0LmFkZCgnYmFjay10by10b3AtYnRuJylcbiAgICAgIGJhY2tUb1RvcEJ0bi5jbGFzc0xpc3QuYWRkKCdidG4nKVxuICAgICAgYmFja1RvVG9wQnRuLmlubmVySFRNTCA9ICc8c3Bhbj7irIbvuI48L3NwYW4+J1xuICAgICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoYmFja1RvVG9wQnRuKVxuXG4gICAgICBiYWNrVG9Ub3BCdG4ub25jbGljayA9ICgpPT5cbiAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuXG4gIGFkZFJlZnJlc2hCdXR0b246IC0+XG4gICAgcmVmcmVzaEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcmVmcmVzaEJ0bi5jbGFzc0xpc3QuYWRkKCdyZWZyZXNoLWJ0bicpXG4gICAgcmVmcmVzaEJ0bi5jbGFzc0xpc3QuYWRkKCdidG4nKVxuICAgIHJlZnJlc2hCdG4uaW5uZXJIVE1MID0gJzxzcGFuPuKfszwvc3Bhbj4nXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQocmVmcmVzaEJ0bilcblxuICAgIHJlZnJlc2hCdG4ub25jbGljayA9ICgpPT5cbiAgICAgICMgY2xlYXIgY2FjaGVcbiAgICAgIEBmaWxlc0NhY2hlID0ge31cbiAgICAgIGNvZGVDaHVua0FQSS5jbGVhckNhY2hlKClcblxuICAgICAgIyByZW5kZXIgYWdhaW5cbiAgICAgIEByZW5kZXJNYXJrZG93bigpXG5cbiAgYmluZEV2ZW50czogLT5cbiAgICBAYmluZFRhZ0FDbGlja0V2ZW50KClcbiAgICBAc2V0dXBDb2RlQ2h1bmtzKClcbiAgICBAaW5pdFRhc2tMaXN0KClcbiAgICBAcmVuZGVyTWVybWFpZCgpXG4gICAgQHJlbmRlclBsYW50VU1MKClcbiAgICBAcmVuZGVyV2F2ZWRyb20oKVxuICAgIEByZW5kZXJWaXooKVxuICAgIEByZW5kZXJLYVRlWCgpXG4gICAgQHJlbmRlck1hdGhKYXgoKVxuICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgIyA8YSBocmVmPVwiXCIgPiAuLi4gPC9hPiBjbGljayBldmVudFxuICBiaW5kVGFnQUNsaWNrRXZlbnQ6ICgpLT5cbiAgICBhcyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcblxuICAgIGFuYWx5emVIcmVmID0gKGhyZWYpPT5cbiAgICAgIGlmIGhyZWYgYW5kIGhyZWZbMF0gPT0gJyMnXG4gICAgICAgIHRhcmdldEVsZW1lbnQgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiW2lkPVxcXCIje2hyZWYuc2xpY2UoMSl9XFxcIl1cIikgIyBmaXggbnVtYmVyIGlkIGJ1Z1xuICAgICAgICBpZiB0YXJnZXRFbGVtZW50XG4gICAgICAgICAgYS5vbmNsaWNrID0gKCk9PlxuICAgICAgICAgICAgIyBqdW1wIHRvIHRhZyBwb3NpdGlvblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gMFxuICAgICAgICAgICAgZWwgPSB0YXJnZXRFbGVtZW50XG4gICAgICAgICAgICB3aGlsZSBlbCBhbmQgZWwgIT0gQGVsZW1lbnRcbiAgICAgICAgICAgICAgb2Zmc2V0VG9wICs9IGVsLm9mZnNldFRvcFxuICAgICAgICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudFxuXG4gICAgICAgICAgICBpZiBAZWxlbWVudC5zY3JvbGxUb3AgPiBvZmZzZXRUb3BcbiAgICAgICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gb2Zmc2V0VG9wIC0gMzIgLSB0YXJnZXRFbGVtZW50Lm9mZnNldEhlaWdodFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSBvZmZzZXRUb3BcbiAgICAgIGVsc2VcbiAgICAgICAgYS5vbmNsaWNrID0gKCk9PlxuICAgICAgICAgIHJldHVybiBpZiAhaHJlZlxuICAgICAgICAgIHJldHVybiBpZiBocmVmLm1hdGNoKC9eKGh0dHB8aHR0cHMpXFw6XFwvXFwvLykgIyB0aGUgZGVmYXVsdCBiZWhhdmlvciB3aWxsIG9wZW4gYnJvd3NlciBmb3IgdGhhdCB1cmwuXG5cbiAgICAgICAgICBpZiBwYXRoLmV4dG5hbWUoaHJlZikgaW4gWycucGRmJywgJy54bHMnLCAnLnhsc3gnLCAnLmRvYycsICcucHB0JywgJy5kb2N4JywgJy5wcHR4J10gIyBpc3N1ZSAjOTdcbiAgICAgICAgICAgIEBvcGVuRmlsZSBocmVmXG4gICAgICAgICAgZWxzZSBpZiBocmVmLm1hdGNoKC9eZmlsZVxcOlxcL1xcL1xcLy8pXG4gICAgICAgICAgICAjIGlmIGhyZWYuc3RhcnRzV2l0aCAnZmlsZTovLy8nXG4gICAgICAgICAgICBvcGVuRmlsZVBhdGggPSBocmVmLnNsaWNlKDgpICMgcmVtb3ZlIHByb3RvY2FsXG4gICAgICAgICAgICBvcGVuRmlsZVBhdGggPSBvcGVuRmlsZVBhdGgucmVwbGFjZSgvXFwubWQoXFxzKilcXCMoLispJC8sICcubWQnKSAjIHJlbW92ZSAjYW5jaG9yXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIG9wZW5GaWxlUGF0aCxcbiAgICAgICAgICAgICAgc3BsaXQ6ICdsZWZ0JyxcbiAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb3BlbkZpbGUgaHJlZlxuXG4gICAgZm9yIGEgaW4gYXNcbiAgICAgIGhyZWYgPSBhLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICBhbmFseXplSHJlZihocmVmKVxuXG4gIHNldHVwQ29kZUNodW5rczogKCktPlxuICAgIGNvZGVDaHVua3MgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2RlLWNodW5rJylcbiAgICByZXR1cm4gaWYgIWNvZGVDaHVua3MubGVuZ3RoXG5cbiAgICBuZXdDb2RlQ2h1bmtzRGF0YSA9IHt9XG4gICAgbmVlZFRvU2V0dXBDaHVua3NJZCA9IGZhbHNlXG4gICAgc2V0dXBDb2RlQ2h1bmsgPSAoY29kZUNodW5rKT0+XG4gICAgICBkYXRhQXJncyA9IGNvZGVDaHVuay5nZXRBdHRyaWJ1dGUoJ2RhdGEtYXJncycpXG4gICAgICBpZE1hdGNoID0gZGF0YUFyZ3MubWF0Y2goL1xccyppZFxccyo6XFxzKlxcXCIoW15cXFwiXSopXFxcIi8pXG4gICAgICBpZiBpZE1hdGNoIGFuZCBpZE1hdGNoWzFdXG4gICAgICAgIGlkID0gaWRNYXRjaFsxXVxuICAgICAgICBjb2RlQ2h1bmsuaWQgPSAnY29kZV9jaHVua18nICsgaWRcbiAgICAgICAgcnVubmluZyA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/LnJ1bm5pbmcgb3IgZmFsc2VcbiAgICAgICAgY29kZUNodW5rLmNsYXNzTGlzdC5hZGQoJ3J1bm5pbmcnKSBpZiBydW5uaW5nXG5cbiAgICAgICAgIyByZW1vdmUgb3V0cHV0LWRpdiBhbmQgb3V0cHV0LWVsZW1lbnRcbiAgICAgICAgY2hpbGRyZW4gPSBjb2RlQ2h1bmsuY2hpbGRyZW5cbiAgICAgICAgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgIGlmIGNoaWxkLmNsYXNzTGlzdC5jb250YWlucygnb3V0cHV0LWRpdicpIG9yIGNoaWxkLmNsYXNzTGlzdC5jb250YWlucygnb3V0cHV0LWVsZW1lbnQnKVxuICAgICAgICAgICAgY2hpbGQucmVtb3ZlKClcbiAgICAgICAgICBpIC09IDFcblxuICAgICAgICBvdXRwdXREaXYgPSBAY29kZUNodW5rc0RhdGFbaWRdPy5vdXRwdXREaXZcbiAgICAgICAgb3V0cHV0RWxlbWVudCA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/Lm91dHB1dEVsZW1lbnRcblxuICAgICAgICBjb2RlQ2h1bmsuYXBwZW5kQ2hpbGQob3V0cHV0RWxlbWVudCkgaWYgb3V0cHV0RWxlbWVudFxuICAgICAgICBjb2RlQ2h1bmsuYXBwZW5kQ2hpbGQob3V0cHV0RGl2KSBpZiBvdXRwdXREaXZcblxuICAgICAgICBuZXdDb2RlQ2h1bmtzRGF0YVtpZF0gPSB7cnVubmluZywgb3V0cHV0RGl2LCBvdXRwdXRFbGVtZW50fVxuICAgICAgZWxzZSAjIGlkIG5vdCBleGlzdCwgY3JlYXRlIG5ldyBpZFxuICAgICAgICBuZWVkVG9TZXR1cENodW5rc0lkID0gdHJ1ZVxuXG4gICAgICBydW5CdG4gPSBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncnVuLWJ0bicpWzBdXG4gICAgICBydW5CdG4/LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKCk9PlxuICAgICAgICBAcnVuQ29kZUNodW5rKGNvZGVDaHVuaylcblxuICAgICAgcnVuQWxsQnRuID0gY29kZUNodW5rLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3J1bi1hbGwtYnRuJylbMF1cbiAgICAgIHJ1bkFsbEJ0bj8uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoKT0+XG4gICAgICAgIEBydW5BbGxDb2RlQ2h1bmtzKClcblxuICAgIGZvciBjb2RlQ2h1bmsgaW4gY29kZUNodW5rc1xuICAgICAgYnJlYWsgaWYgbmVlZFRvU2V0dXBDaHVua3NJZFxuICAgICAgc2V0dXBDb2RlQ2h1bmsoY29kZUNodW5rKVxuXG4gICAgaWYgbmVlZFRvU2V0dXBDaHVua3NJZFxuICAgICAgQHNldHVwQ29kZUNodW5rc0lkKClcblxuICAgIEBjb2RlQ2h1bmtzRGF0YSA9IG5ld0NvZGVDaHVua3NEYXRhICMga2V5IGlzIGNvZGVDaHVua0lkLCB2YWx1ZSBpcyB7cnVubmluZywgb3V0cHV0RGl2fVxuXG4gIHNldHVwQ29kZUNodW5rc0lkOiAoKS0+XG4gICAgYnVmZmVyID0gQGVkaXRvci5idWZmZXJcbiAgICByZXR1cm4gaWYgIWJ1ZmZlclxuXG4gICAgbGluZXMgPSBidWZmZXIubGluZXNcbiAgICBsaW5lTm8gPSAwXG4gICAgY3VyU2NyZWVuUG9zID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG5cbiAgICB3aGlsZSBsaW5lTm8gPCBsaW5lcy5sZW5ndGhcbiAgICAgIGxpbmUgPSBsaW5lc1tsaW5lTm9dXG4gICAgICBtYXRjaCA9IGxpbmUubWF0Y2goL15cXGBcXGBcXGBcXHsoLispXFx9KFxccyopLylcbiAgICAgIGlmIG1hdGNoXG4gICAgICAgIGNtZCA9IG1hdGNoWzFdXG4gICAgICAgIGRhdGFBcmdzID0gJydcbiAgICAgICAgaSA9IGNtZC5pbmRleE9mKCcgJylcbiAgICAgICAgaWYgaSA+IDBcbiAgICAgICAgICBkYXRhQXJncyA9IGNtZC5zbGljZShpICsgMSwgY21kLmxlbmd0aCkudHJpbSgpXG4gICAgICAgICAgY21kID0gY21kLnNsaWNlKDAsIGkpXG5cbiAgICAgICAgaWRNYXRjaCA9IG1hdGNoWzFdLm1hdGNoKC9cXHMqaWRcXHMqOlxccypcXFwiKFteXFxcIl0qKVxcXCIvKVxuICAgICAgICBpZiAhaWRNYXRjaFxuICAgICAgICAgIGlkID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZygzNilcblxuICAgICAgICAgIGxpbmUgPSBsaW5lLnRyaW1SaWdodCgpXG4gICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvfSQvLCAoaWYgIWRhdGFBcmdzIHRoZW4gJycgZWxzZSAnLCcpICsgJyBpZDpcIicgKyBpZCArICdcIn0nKVxuXG4gICAgICAgICAgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwICMgcHJldmVudCByZW5kZXJNYXJrZG93blxuXG4gICAgICAgICAgYnVmZmVyLnNldFRleHRJblJhbmdlKFtbbGluZU5vLCAwXSwgW2xpbmVObysxLCAwXV0sIGxpbmUgKyAnXFxuJylcblxuICAgICAgbGluZU5vICs9IDFcblxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oY3VyU2NyZWVuUG9zKSAjIHJlc3RvcmUgY3Vyc29yIHBvc2l0aW9uLlxuXG4gICAgICAjIFRoaXMgd2lsbCBjYXVzZSBNYXhpbXVtIHNpemUgZXhjZWVkZWRcbiAgICAgICMgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpXG4gICAgICAjIEByZW5kZXJNYXJrZG93bigpXG5cbiAgZ2V0TmVhcmVzdENvZGVDaHVuazogKCktPlxuICAgIGJ1ZmZlclJvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICBjb2RlQ2h1bmtzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29kZS1jaHVuaycpXG4gICAgaSA9IGNvZGVDaHVua3MubGVuZ3RoIC0gMVxuICAgIHdoaWxlIGkgPj0gMFxuICAgICAgY29kZUNodW5rID0gY29kZUNodW5rc1tpXVxuICAgICAgbGluZU5vID0gcGFyc2VJbnQoY29kZUNodW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1saW5lJykpXG4gICAgICBpZiBsaW5lTm8gPD0gYnVmZmVyUm93XG4gICAgICAgIHJldHVybiBjb2RlQ2h1bmtcbiAgICAgIGktPTFcbiAgICByZXR1cm4gbnVsbFxuXG4gICMgcmV0dXJuIGZhbHNlIGlmIG1lZXQgZXJyb3JcbiAgIyBvdGhlcndpc2UgcmV0dXJuXG4gICMge1xuICAjICAgY21kLFxuICAjICAgb3B0aW9ucyxcbiAgIyAgIGNvZGUsXG4gICMgICBpZCxcbiAgIyB9XG4gIHBhcnNlQ29kZUNodW5rOiAoY29kZUNodW5rKS0+XG4gICAgY29kZSA9IGNvZGVDaHVuay5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29kZScpXG4gICAgZGF0YUFyZ3MgPSBjb2RlQ2h1bmsuZ2V0QXR0cmlidXRlKCdkYXRhLWFyZ3MnKVxuXG4gICAgb3B0aW9ucyA9IG51bGxcbiAgICB0cnlcbiAgICAgIGFsbG93VW5zYWZlRXZhbCAtPlxuICAgICAgICBvcHRpb25zID0gZXZhbChcIih7I3tkYXRhQXJnc319KVwiKVxuICAgICAgIyBvcHRpb25zID0gSlNPTi5wYXJzZSAneycrZGF0YUFyZ3MucmVwbGFjZSgoLyhbKFxcdyl8KFxcLSldKykoOikvZyksIFwiXFxcIiQxXFxcIiQyXCIpLnJlcGxhY2UoKC8nL2cpLCBcIlxcXCJcIikrJ30nXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCBvcHRpb25zJywgZGV0YWlsOiBkYXRhQXJncylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWQgPSBvcHRpb25zLmlkXG5cbiAgICAjIGNoZWNrIG9wdGlvbnMuY29udGludWVcbiAgICBpZiBvcHRpb25zLmNvbnRpbnVlXG4gICAgICBsYXN0ID0gbnVsbFxuICAgICAgaWYgb3B0aW9ucy5jb250aW51ZSA9PSB0cnVlXG4gICAgICAgIGNvZGVDaHVua3MgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICdjb2RlLWNodW5rJ1xuICAgICAgICBpID0gY29kZUNodW5rcy5sZW5ndGggLSAxXG4gICAgICAgIHdoaWxlIGkgPj0gMFxuICAgICAgICAgIGlmIGNvZGVDaHVua3NbaV0gPT0gY29kZUNodW5rXG4gICAgICAgICAgICBsYXN0ID0gY29kZUNodW5rc1tpIC0gMV1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaS0tXG4gICAgICBlbHNlICMgaWRcbiAgICAgICAgbGFzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlX2NodW5rXycgKyBvcHRpb25zLmNvbnRpbnVlKVxuXG4gICAgICBpZiBsYXN0XG4gICAgICAgIHtjb2RlOiBsYXN0Q29kZSwgb3B0aW9uczogbGFzdE9wdGlvbnN9ID0gQHBhcnNlQ29kZUNodW5rKGxhc3QpIG9yIHt9XG4gICAgICAgIGxhc3RPcHRpb25zID0gbGFzdE9wdGlvbnMgb3Ige31cbiAgICAgICAgY29kZSA9IChsYXN0Q29kZSBvciAnJykgKyAnXFxuJyArIGNvZGVcblxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgbGFzdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCBjb250aW51ZSBmb3IgY29kZSBjaHVuayAnICsgKG9wdGlvbnMuaWQgb3IgJycpLCBkZXRhaWw6IG9wdGlvbnMuY29udGludWUudG9TdHJpbmcoKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjbWQgPSAgb3B0aW9ucy5jbWQgb3IgY29kZUNodW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1sYW5nJykgIyBuZWVkIHRvIHB1dCBoZXJlIGJlY2F1c2Ugb3B0aW9ucyBtaWdodCBiZSBtb2RpZmllZCBiZWZvcmVcbiAgICByZXR1cm4ge2NtZCwgb3B0aW9ucywgY29kZSwgaWR9XG5cblxuXG4gIHJ1bkNvZGVDaHVuazogKGNvZGVDaHVuaz1udWxsKS0+XG4gICAgY29kZUNodW5rID0gQGdldE5lYXJlc3RDb2RlQ2h1bmsoKSBpZiBub3QgY29kZUNodW5rXG4gICAgcmV0dXJuIGlmIG5vdCBjb2RlQ2h1bmtcbiAgICByZXR1cm4gaWYgY29kZUNodW5rLmNsYXNzTGlzdC5jb250YWlucygncnVubmluZycpXG5cbiAgICBwYXJzZVJlc3VsdCA9IEBwYXJzZUNvZGVDaHVuayhjb2RlQ2h1bmspXG4gICAgcmV0dXJuIGlmICFwYXJzZVJlc3VsdFxuICAgIHtjb2RlLCBvcHRpb25zLCBjbWQsIGlkfSA9IHBhcnNlUmVzdWx0XG5cbiAgICBpZiAhaWRcbiAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0NvZGUgY2h1bmsgZXJyb3InLCBkZXRhaWw6ICdpZCBpcyBub3QgZm91bmQgb3IganVzdCB1cGRhdGVkLicpXG5cbiAgICBjb2RlQ2h1bmsuY2xhc3NMaXN0LmFkZCgncnVubmluZycpXG4gICAgaWYgQGNvZGVDaHVua3NEYXRhW2lkXVxuICAgICAgQGNvZGVDaHVua3NEYXRhW2lkXS5ydW5uaW5nID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBjb2RlQ2h1bmtzRGF0YVtpZF0gPSB7cnVubmluZzogdHJ1ZX1cblxuICAgICMgY2hlY2sgb3B0aW9ucyBgZWxlbWVudGBcbiAgICBpZiBvcHRpb25zLmVsZW1lbnRcbiAgICAgIG91dHB1dEVsZW1lbnQgPSBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnb3V0cHV0LWVsZW1lbnQnKT9bMF1cbiAgICAgIGlmICFvdXRwdXRFbGVtZW50ICMgY3JlYXRlIGFuZCBhcHBlbmQgYG91dHB1dC1lbGVtZW50YCBkaXZcbiAgICAgICAgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgb3V0cHV0RWxlbWVudC5jbGFzc0xpc3QuYWRkICdvdXRwdXQtZWxlbWVudCdcbiAgICAgICAgY29kZUNodW5rLmFwcGVuZENoaWxkIG91dHB1dEVsZW1lbnRcblxuICAgICAgb3V0cHV0RWxlbWVudC5pbm5lckhUTUwgPSBvcHRpb25zLmVsZW1lbnRcbiAgICBlbHNlXG4gICAgICBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnb3V0cHV0LWVsZW1lbnQnKT9bMF0/LnJlbW92ZSgpXG4gICAgICBvdXRwdXRFbGVtZW50ID0gbnVsbFxuXG4gICAgY29kZUNodW5rQVBJLnJ1biBjb2RlLCBAZmlsZURpcmVjdG9yeVBhdGgsIGNtZCwgb3B0aW9ucywgKGVycm9yLCBkYXRhLCBvcHRpb25zKT0+XG4gICAgICAjIGdldCBuZXcgY29kZUNodW5rXG4gICAgICBjb2RlQ2h1bmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZV9jaHVua18nICsgaWQpXG4gICAgICByZXR1cm4gaWYgbm90IGNvZGVDaHVua1xuICAgICAgY29kZUNodW5rLmNsYXNzTGlzdC5yZW1vdmUoJ3J1bm5pbmcnKVxuXG4gICAgICByZXR1cm4gaWYgZXJyb3IgIyBvciAhZGF0YVxuICAgICAgZGF0YSA9IChkYXRhIG9yICcnKS50b1N0cmluZygpXG5cbiAgICAgIG91dHB1dERpdiA9IGNvZGVDaHVuay5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdvdXRwdXQtZGl2Jyk/WzBdXG4gICAgICBpZiAhb3V0cHV0RGl2XG4gICAgICAgIG91dHB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgb3V0cHV0RGl2LmNsYXNzTGlzdC5hZGQgJ291dHB1dC1kaXYnXG4gICAgICBlbHNlXG4gICAgICAgIG91dHB1dERpdi5pbm5lckhUTUwgPSAnJ1xuXG4gICAgICBpZiBvcHRpb25zLm91dHB1dCA9PSAnaHRtbCdcbiAgICAgICAgb3V0cHV0RGl2LmlubmVySFRNTCA9IGRhdGFcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy5vdXRwdXQgPT0gJ3BuZydcbiAgICAgICAgaW1hZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnaW1nJ1xuICAgICAgICBpbWFnZURhdGEgPSBCdWZmZXIoZGF0YSkudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIGltYWdlRWxlbWVudC5zZXRBdHRyaWJ1dGUgJ3NyYycsICBcImRhdGE6aW1hZ2UvcG5nO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCN7aW1hZ2VEYXRhfVwiXG4gICAgICAgIG91dHB1dERpdi5hcHBlbmRDaGlsZCBpbWFnZUVsZW1lbnRcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy5vdXRwdXQgPT0gJ21hcmtkb3duJ1xuICAgICAgICBAcGFyc2VNRCBkYXRhLCB7QGZpbGVEaXJlY3RvcnlQYXRoLCBAcHJvamVjdERpcmVjdG9yeVBhdGh9LCAoe2h0bWx9KT0+XG4gICAgICAgICAgb3V0cHV0RGl2LmlubmVySFRNTCA9IGh0bWxcbiAgICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuICAgICAgZWxzZSBpZiBvcHRpb25zLm91dHB1dCA9PSAnbm9uZSdcbiAgICAgICAgb3V0cHV0RGl2LnJlbW92ZSgpXG4gICAgICAgIG91dHB1dERpdiA9IG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgZGF0YT8ubGVuZ3RoXG4gICAgICAgICAgcHJlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3ByZSdcbiAgICAgICAgICBwcmVFbGVtZW50LmlubmVyVGV4dCA9IGRhdGFcbiAgICAgICAgICBwcmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2VkaXRvci1jb2xvcnMnKVxuICAgICAgICAgIHByZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbGFuZy10ZXh0JylcbiAgICAgICAgICBvdXRwdXREaXYuYXBwZW5kQ2hpbGQgcHJlRWxlbWVudFxuXG4gICAgICBpZiBvdXRwdXREaXZcbiAgICAgICAgY29kZUNodW5rLmFwcGVuZENoaWxkIG91dHB1dERpdlxuICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICAgICAjIGNoZWNrIG1hdHBsb3RsaWIgfCBtcGxcbiAgICAgIGlmIG9wdGlvbnMubWF0cGxvdGxpYiBvciBvcHRpb25zLm1wbFxuICAgICAgICBzY3JpcHRFbGVtZW50cyA9IG91dHB1dERpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcbiAgICAgICAgaWYgc2NyaXB0RWxlbWVudHMubGVuZ3RoXG4gICAgICAgICAgd2luZG93LmQzID89IHJlcXVpcmUoJy4uL2RlcGVuZGVuY2llcy9tcGxkMy9kMy52My5taW4uanMnKVxuICAgICAgICAgIHdpbmRvdy5tcGxkMyA/PSByZXF1aXJlKCcuLi9kZXBlbmRlbmNpZXMvbXBsZDMvbXBsZDMudjAuMy5taW4uanMnKVxuICAgICAgICAgIGZvciBzY3JpcHRFbGVtZW50IGluIHNjcmlwdEVsZW1lbnRzXG4gICAgICAgICAgICBjb2RlID0gc2NyaXB0RWxlbWVudC5pbm5lckhUTUxcbiAgICAgICAgICAgIGFsbG93VW5zYWZlTmV3RnVuY3Rpb24gLT4gYWxsb3dVbnNhZmVFdmFsIC0+XG4gICAgICAgICAgICAgIGV2YWwoY29kZSlcblxuICAgICAgQGNvZGVDaHVua3NEYXRhW2lkXSA9IHtydW5uaW5nOiBmYWxzZSwgb3V0cHV0RGl2LCBvdXRwdXRFbGVtZW50fVxuXG4gIHJ1bkFsbENvZGVDaHVua3M6ICgpLT5cbiAgICBjb2RlQ2h1bmtzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29kZS1jaHVuaycpXG4gICAgZm9yIGNodW5rIGluIGNvZGVDaHVua3NcbiAgICAgIEBydW5Db2RlQ2h1bmsoY2h1bmspXG5cbiAgaW5pdFRhc2tMaXN0OiAoKS0+XG4gICAgY2hlY2tib3hzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGFzay1saXN0LWl0ZW0tY2hlY2tib3gnKVxuICAgIGZvciBjaGVja2JveCBpbiBjaGVja2JveHNcbiAgICAgIHRoaXNfID0gdGhpc1xuICAgICAgY2hlY2tib3gub25jbGljayA9ICgpLT5cbiAgICAgICAgaWYgIXRoaXNfLmVkaXRvclxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWRcbiAgICAgICAgYnVmZmVyID0gdGhpc18uZWRpdG9yLmJ1ZmZlclxuXG4gICAgICAgIGlmICFidWZmZXJcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBsaW5lTm8gPSBwYXJzZUludCh0aGlzLnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWxpbmUnKSlcbiAgICAgICAgbGluZSA9IGJ1ZmZlci5saW5lc1tsaW5lTm9dXG5cbiAgICAgICAgaWYgY2hlY2tlZFxuICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ1sgXScsICdbeF0nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvXFxbKHh8WClcXF0vLCAnWyBdJylcblxuICAgICAgICB0aGlzXy5wYXJzZURlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbW2xpbmVObywgMF0sIFtsaW5lTm8rMSwgMF1dLCBsaW5lICsgJ1xcbicpXG5cbiAgcmVuZGVyTWVybWFpZDogKCktPlxuICAgIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lcm1haWQgbXBlLWdyYXBoJylcbiAgICBpZiBlbHMubGVuZ3RoXG4gICAgICBAZ3JhcGhEYXRhLm1lcm1haWRfcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVscylcblxuICAgICAgbm90UHJvY2Vzc2VkRWxzID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lcm1haWQubXBlLWdyYXBoOm5vdChbZGF0YS1wcm9jZXNzZWRdKScpXG5cbiAgICAgIGlmIG5vdFByb2Nlc3NlZEVscy5sZW5ndGhcbiAgICAgICAgbWVybWFpZC5pbml0IG51bGwsIG5vdFByb2Nlc3NlZEVsc1xuXG4gICAgICAjIyNcbiAgICAgICMgdGhlIGNvZGUgYmVsb3cgZG9lc24ndCBzZWVtIHRvIGJlIHdvcmtpbmdcbiAgICAgICMgSSB0aGluayBtZXJtYWlkQVBJLnJlbmRlciBmdW5jdGlvbiBoYXMgYnVnXG4gICAgICBjYiA9IChlbCktPlxuICAgICAgICAoc3ZnR3JhcGgpLT5cbiAgICAgICAgICBlbC5pbm5lckhUTUwgPSBzdmdHcmFwaFxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCAndHJ1ZSdcblxuICAgICAgICAgICMgdGhlIGNvZGUgYmVsb3cgaXMgYSBoYWNrYWJsZSB3YXkgdG8gc29sdmUgbWVybWFpZCBidWdcbiAgICAgICAgICBlbC5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9IGVsLmdldEF0dHJpYnV0ZSgndmlld2JveCcpLnNwbGl0KCcgJylbM10gKyAncHgnXG5cbiAgICAgIGZvciBlbCBpbiBlbHNcbiAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpKVxuICAgICAgICBlbC5pZCA9ICdtZXJtYWlkJytvZmZzZXRcblxuICAgICAgICBtZXJtYWlkQVBJLnJlbmRlciBlbC5pZCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJyksIGNiKGVsKVxuICAgICAgIyMjXG5cbiAgICAgICMgZGlzYWJsZSBAZWxlbWVudCBvbnNjcm9sbFxuICAgICAgQHByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcblxuICByZW5kZXJXYXZlZHJvbTogKCktPlxuICAgIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dhdmVkcm9tIG1wZS1ncmFwaCcpXG4gICAgaWYgZWxzLmxlbmd0aFxuICAgICAgQGdyYXBoRGF0YS53YXZlZHJvbV9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuXG4gICAgICAjIFdhdmVEcm9tLlJlbmRlcldhdmVGb3JtKDAsIFdhdmVEcm9tLmV2YSgnYTAnKSwgJ2EnKVxuICAgICAgZm9yIGVsIGluIGVsc1xuICAgICAgICBpZiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgIT0gJ3RydWUnXG4gICAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpKVxuICAgICAgICAgIGVsLmlkID0gJ3dhdmVkcm9tJytvZmZzZXRcbiAgICAgICAgICB0ZXh0ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykudHJpbSgpXG4gICAgICAgICAgY29udGludWUgaWYgbm90IHRleHQubGVuZ3RoXG5cbiAgICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgPT5cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBjb250ZW50ID0gZXZhbChcIigje3RleHR9KVwiKSAjIGV2YWwgZnVuY3Rpb24gaGVyZVxuICAgICAgICAgICAgICBXYXZlRHJvbS5SZW5kZXJXYXZlRm9ybShvZmZzZXQsIGNvbnRlbnQsICd3YXZlZHJvbScpXG4gICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCAndHJ1ZSdcblxuICAgICAgICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuICAgICAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gJ2ZhaWxlZCB0byBldmFsIFdhdmVEcm9tIGNvZGUuJ1xuXG4gICAgICAjIGRpc2FibGUgQGVsZW1lbnQgb25zY3JvbGxcbiAgICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgcmVuZGVyUGxhbnRVTUw6ICgpLT5cbiAgICBlbHMgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwbGFudHVtbCBtcGUtZ3JhcGgnKVxuXG4gICAgaWYgZWxzLmxlbmd0aFxuICAgICAgQGdyYXBoRGF0YS5wbGFudHVtbF9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuXG4gICAgaGVscGVyID0gKGVsLCB0ZXh0KT0+XG4gICAgICBwbGFudHVtbEFQSS5yZW5kZXIgdGV4dCwgKG91dHB1dEhUTUwpPT5cbiAgICAgICAgZWwuaW5uZXJIVE1MID0gb3V0cHV0SFRNTFxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUgJ2RhdGEtcHJvY2Vzc2VkJywgdHJ1ZVxuICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICAgZm9yIGVsIGluIGVsc1xuICAgICAgaWYgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb2Nlc3NlZCcpICE9ICd0cnVlJ1xuICAgICAgICBoZWxwZXIoZWwsIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbCcpKVxuICAgICAgICBlbC5pbm5lclRleHQgPSAncmVuZGVyaW5nIGdyYXBoLi4uXFxuJ1xuXG4gIHJlbmRlclZpejogKGVsZW1lbnQ9QGVsZW1lbnQpLT5cbiAgICBlbHMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3ZpeiBtcGUtZ3JhcGgnKVxuXG4gICAgaWYgZWxzLmxlbmd0aFxuICAgICAgQGdyYXBoRGF0YS52aXpfcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVscylcblxuICAgICAgQFZpeiA/PSByZXF1aXJlKCcuLi9kZXBlbmRlbmNpZXMvdml6L3Zpei5qcycpXG4gICAgICBmb3IgZWwgaW4gZWxzXG4gICAgICAgIGlmIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9jZXNzZWQnKSAhPSAndHJ1ZSdcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIGNvbnRlbnQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwnKVxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9XG5cbiAgICAgICAgICAgICMgY2hlY2sgZW5naW5lXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC50cmltKCkucmVwbGFjZSAvXmVuZ2luZShcXHMpKls6PV0oW15cXG5dKykvLCAoYSwgYiwgYyktPlxuICAgICAgICAgICAgICBvcHRpb25zLmVuZ2luZSA9IGMudHJpbSgpIGlmIGM/LnRyaW0oKSBpbiBbJ2NpcmNvJywgJ2RvdCcsICdmZHAnLCAnbmVhdG8nLCAnb3NhZ2UnLCAndHdvcGknXVxuICAgICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gQFZpeihjb250ZW50LCBvcHRpb25zKSAjIGRlZmF1bHQgc3ZnXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUgJ2RhdGEtcHJvY2Vzc2VkJywgdHJ1ZVxuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBlcnJvclxuXG4gIHJlbmRlck1hdGhKYXg6ICgpLT5cbiAgICByZXR1cm4gaWYgQG1hdGhSZW5kZXJpbmdPcHRpb24gIT0gJ01hdGhKYXgnIGFuZCAhQHVzZVBhbmRvY1BhcnNlclxuICAgIGlmIHR5cGVvZihNYXRoSmF4KSA9PSAndW5kZWZpbmVkJ1xuICAgICAgcmV0dXJuIGxvYWRNYXRoSmF4IGRvY3VtZW50LCAoKT0+IEByZW5kZXJNYXRoSmF4KClcblxuICAgIGlmIEBtYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cyBvciBAdXNlUGFuZG9jUGFyc2VyXG4gICAgICByZXR1cm4gTWF0aEpheC5IdWIuUXVldWUgWydUeXBlc2V0JywgTWF0aEpheC5IdWIsIEBlbGVtZW50XSwgKCk9PiBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICAgZWxzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWF0aGpheC1leHBzJylcbiAgICByZXR1cm4gaWYgIWVscy5sZW5ndGhcblxuICAgIHVucHJvY2Vzc2VkRWxlbWVudHMgPSBbXVxuICAgIGZvciBlbCBpbiBlbHNcbiAgICAgIGlmICFlbC5oYXNBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJylcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlICdkYXRhLW9yaWdpbmFsJywgZWwudGV4dENvbnRlbnRcbiAgICAgICAgdW5wcm9jZXNzZWRFbGVtZW50cy5wdXNoIGVsXG5cbiAgICBjYWxsYmFjayA9ICgpPT5cbiAgICAgIGZvciBlbCBpbiB1bnByb2Nlc3NlZEVsZW1lbnRzXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCB0cnVlXG4gICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICAgaWYgdW5wcm9jZXNzZWRFbGVtZW50cy5sZW5ndGggPT0gZWxzLmxlbmd0aFxuICAgICAgTWF0aEpheC5IdWIuUXVldWUgWydUeXBlc2V0JywgTWF0aEpheC5IdWIsIEBlbGVtZW50XSwgY2FsbGJhY2tcbiAgICBlbHNlIGlmIHVucHJvY2Vzc2VkRWxlbWVudHMubGVuZ3RoXG4gICAgICBNYXRoSmF4Lkh1Yi5UeXBlc2V0IHVucHJvY2Vzc2VkRWxlbWVudHMsIGNhbGxiYWNrXG5cbiAgcmVuZGVyS2FUZVg6ICgpLT5cbiAgICByZXR1cm4gaWYgQG1hdGhSZW5kZXJpbmdPcHRpb24gIT0gJ0thVGVYJ1xuICAgIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2thdGV4LWV4cHMnKVxuXG4gICAgZm9yIGVsIGluIGVsc1xuICAgICAgaWYgZWwuaGFzQXR0cmlidXRlKCdkYXRhLXByb2Nlc3NlZCcpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBlbHNlXG4gICAgICAgIGRpc3BsYXlNb2RlID0gZWwuaGFzQXR0cmlidXRlKCdkaXNwbGF5LW1vZGUnKVxuICAgICAgICBkYXRhT3JpZ2luYWwgPSBlbC50ZXh0Q29udGVudFxuICAgICAgICB0cnlcbiAgICAgICAgICBrYXRleC5yZW5kZXIoZWwudGV4dENvbnRlbnQsIGVsLCB7ZGlzcGxheU1vZGV9KVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGVsLmlubmVySFRNTCA9IFwiPHNwYW4gc3R5bGU9XFxcImNvbG9yOiAjZWU3ZjQ5OyBmb250LXdlaWdodDogNTAwO1xcXCI+I3tlcnJvcn08L3NwYW4+XCJcblxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJywgJ3RydWUnKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwnLCBkYXRhT3JpZ2luYWwpXG5cbiAgcmVzaXplRXZlbnQ6ICgpLT5cbiAgICBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICMjI1xuICBjb252ZXJ0ICcuL2EudHh0JyAnL2EudHh0J1xuICAjIyNcbiAgcmVzb2x2ZUZpbGVQYXRoOiAoZmlsZVBhdGg9JycsIHJlbGF0aXZlPWZhbHNlKS0+XG4gICAgaWYgZmlsZVBhdGgubWF0Y2gocHJvdG9jb2xzV2hpdGVMaXN0UmVnRXhwKVxuICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgZWxzZSBpZiBmaWxlUGF0aC5zdGFydHNXaXRoKCcvJylcbiAgICAgIGlmIHJlbGF0aXZlXG4gICAgICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKEBmaWxlRGlyZWN0b3J5UGF0aCwgcGF0aC5yZXNvbHZlKEBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nK2ZpbGVQYXRoKSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICdmaWxlOi8vLycrcGF0aC5yZXNvbHZlKEBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nK2ZpbGVQYXRoKVxuICAgIGVsc2VcbiAgICAgIGlmIHJlbGF0aXZlXG4gICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJ2ZpbGU6Ly8vJytwYXRoLnJlc29sdmUoQGZpbGVEaXJlY3RvcnlQYXRoLCBmaWxlUGF0aClcblxuICAjIyBVdGlsaXRpZXNcbiAgb3BlbkluQnJvd3NlcjogKGlzRm9yUHJlc2VudGF0aW9uUHJpbnQ9ZmFsc2UpLT5cbiAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcblxuICAgIEBnZXRIVE1MQ29udGVudCBvZmZsaW5lOiB0cnVlLCBpc0ZvclByaW50OiBpc0ZvclByZXNlbnRhdGlvblByaW50LCAoaHRtbENvbnRlbnQpPT5cbiAgICAgIHRlbXAub3BlblxuICAgICAgICBwcmVmaXg6ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkJyxcbiAgICAgICAgc3VmZml4OiAnLmh0bWwnLCAoZXJyLCBpbmZvKT0+XG4gICAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gICAgICAgICAgZnMud3JpdGUgaW5mby5mZCwgaHRtbENvbnRlbnQsIChlcnIpPT5cbiAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgIGlmIGlzRm9yUHJlc2VudGF0aW9uUHJpbnRcbiAgICAgICAgICAgICAgdXJsID0gJ2ZpbGU6Ly8vJyArIGluZm8ucGF0aCArICc/cHJpbnQtcGRmJ1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnUGxlYXNlIGNvcHkgYW5kIG9wZW4gdGhlIGxpbmsgYmVsb3cgaW4gQ2hyb21lLlxcblRoZW4gUmlnaHQgQ2xpY2sgLT4gUHJpbnQgLT4gU2F2ZSBhcyBQZGYuJywgZGlzbWlzc2FibGU6IHRydWUsIGRldGFpbDogdXJsKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAjIyBvcGVuIGluIGJyb3dzZXJcbiAgICAgICAgICAgICAgQG9wZW5GaWxlIGluZm8ucGF0aFxuXG4gIGV4cG9ydFRvRGlzazogKCktPlxuICAgIEBkb2N1bWVudEV4cG9ydGVyVmlldy5kaXNwbGF5KHRoaXMpXG5cbiAgIyBvcGVuIGh0bWwgZmlsZSBpbiBicm93c2VyIG9yIG9wZW4gcGRmIGZpbGUgaW4gcmVhZGVyIC4uLiBldGNcbiAgb3BlbkZpbGU6IChmaWxlUGF0aCktPlxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJ1xuICAgICAgY21kID0gJ2V4cGxvcmVyJ1xuICAgIGVsc2UgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnZGFyd2luJ1xuICAgICAgY21kID0gJ29wZW4nXG4gICAgZWxzZVxuICAgICAgY21kID0gJ3hkZy1vcGVuJ1xuXG4gICAgZXhlYyBcIiN7Y21kfSAje2ZpbGVQYXRofVwiXG5cbiAgIyNcbiAgIyMge0Z1bmN0aW9ufSBjYWxsYmFjayAoaHRtbENvbnRlbnQpXG4gIGluc2VydENvZGVDaHVua3NSZXN1bHQ6IChodG1sQ29udGVudCktPlxuICAgICMgaW5zZXJ0IG91dHB1dERpdiBhbmQgb3V0cHV0RWxlbWVudCBhY2NvcmRpbmdseVxuICAgIGNoZWVyaW8gPz0gcmVxdWlyZSAnY2hlZXJpbydcbiAgICAkID0gY2hlZXJpby5sb2FkKGh0bWxDb250ZW50LCB7ZGVjb2RlRW50aXRpZXM6IGZhbHNlfSlcbiAgICBjb2RlQ2h1bmtzID0gJCgnLmNvZGUtY2h1bmsnKVxuICAgIGpzQ29kZSA9ICcnXG4gICAgcmVxdWlyZUNhY2hlID0ge30gIyBrZXkgaXMgcGF0aFxuICAgIHNjcmlwdHNTdHIgPSBcIlwiXG5cbiAgICBmb3IgY29kZUNodW5rIGluIGNvZGVDaHVua3NcbiAgICAgICRjb2RlQ2h1bmsgPSAkKGNvZGVDaHVuaylcbiAgICAgIGRhdGFBcmdzID0gJGNvZGVDaHVuay5hdHRyKCdkYXRhLWFyZ3MnKS51bmVzY2FwZSgpXG5cbiAgICAgIG9wdGlvbnMgPSBudWxsXG4gICAgICB0cnlcbiAgICAgICAgYWxsb3dVbnNhZmVFdmFsIC0+XG4gICAgICAgICAgb3B0aW9ucyA9IGV2YWwoXCIoeyN7ZGF0YUFyZ3N9fSlcIilcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgY29udGludWVcblxuICAgICAgaWQgPSBvcHRpb25zLmlkXG4gICAgICBjb250aW51ZSBpZiAhaWRcblxuICAgICAgY21kID0gb3B0aW9ucy5jbWQgb3IgJGNvZGVDaHVuay5hdHRyKCdkYXRhLWxhbmcnKVxuICAgICAgY29kZSA9ICRjb2RlQ2h1bmsuYXR0cignZGF0YS1jb2RlJykudW5lc2NhcGUoKVxuXG4gICAgICBvdXRwdXREaXYgPSBAY29kZUNodW5rc0RhdGFbaWRdPy5vdXRwdXREaXZcbiAgICAgIG91dHB1dEVsZW1lbnQgPSBAY29kZUNodW5rc0RhdGFbaWRdPy5vdXRwdXRFbGVtZW50XG5cbiAgICAgIGlmIG91dHB1dERpdiAjIGFwcGVuZCBvdXRwdXREaXYgcmVzdWx0XG4gICAgICAgICRjb2RlQ2h1bmsuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwib3V0cHV0LWRpdlxcXCI+I3tvdXRwdXREaXYuaW5uZXJIVE1MfTwvZGl2PlwiKVxuICAgICAgICBpZiBvcHRpb25zLm1hdHBsb3RsaWIgb3Igb3B0aW9ucy5tcGxcbiAgICAgICAgICAjIHJlbW92ZSBpbm5lckhUTUwgb2YgPGRpdiBpZD1cImZpZ18uLi5cIj48L2Rpdj5cbiAgICAgICAgICAjIHRoaXMgaXMgZm9yIGZpeGluZyBtcGxkMyBleHBvcnRpbmcgaXNzdWUuXG4gICAgICAgICAgZ3MgPSAkKCcub3V0cHV0LWRpdiA+IGRpdicsICRjb2RlQ2h1bmspXG4gICAgICAgICAgaWYgZ3NcbiAgICAgICAgICAgIGZvciBnIGluIGdzXG4gICAgICAgICAgICAgICRnID0gJChnKVxuICAgICAgICAgICAgICBpZiAkZy5hdHRyKCdpZCcpPy5tYXRjaCgvZmlnXFxfLylcbiAgICAgICAgICAgICAgICAkZy5odG1sKCcnKVxuXG4gICAgICAgICAgc3MgPSAkKCcub3V0cHV0LWRpdiA+IHNjcmlwdCcsICRjb2RlQ2h1bmspXG4gICAgICAgICAgaWYgc3NcbiAgICAgICAgICAgIGZvciBzIGluIHNzXG4gICAgICAgICAgICAgICRzID0gJChzKVxuICAgICAgICAgICAgICBjID0gJHMuaHRtbCgpXG4gICAgICAgICAgICAgICRzLnJlbW92ZSgpXG4gICAgICAgICAgICAgIGpzQ29kZSArPSAoYyArICdcXG4nKVxuXG4gICAgICBpZiBvcHRpb25zLmVsZW1lbnRcbiAgICAgICAgJGNvZGVDaHVuay5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJvdXRwdXQtZWxlbWVudFxcXCI+I3tvcHRpb25zLmVsZW1lbnR9PC9kaXY+XCIpXG5cbiAgICAgIGlmIGNtZCA9PSAnamF2YXNjcmlwdCdcbiAgICAgICAgcmVxdWlyZXMgPSBvcHRpb25zLnJlcXVpcmUgb3IgW11cbiAgICAgICAgaWYgdHlwZW9mKHJlcXVpcmVzKSA9PSAnc3RyaW5nJ1xuICAgICAgICAgIHJlcXVpcmVzID0gW3JlcXVpcmVzXVxuICAgICAgICByZXF1aXJlc1N0ciA9IFwiXCJcbiAgICAgICAgZm9yIHJlcXVpcmVQYXRoIGluIHJlcXVpcmVzXG4gICAgICAgICAgIyBUT0RPOiBjc3NcbiAgICAgICAgICBpZiByZXF1aXJlUGF0aC5tYXRjaCgvXihodHRwfGh0dHBzKVxcOlxcL1xcLy8pXG4gICAgICAgICAgICBpZiAoIXJlcXVpcmVDYWNoZVtyZXF1aXJlUGF0aF0pXG4gICAgICAgICAgICAgIHJlcXVpcmVDYWNoZVtyZXF1aXJlUGF0aF0gPSB0cnVlXG4gICAgICAgICAgICAgIHNjcmlwdHNTdHIgKz0gXCI8c2NyaXB0IHNyYz1cXFwiI3tyZXF1aXJlUGF0aH1cXFwiPjwvc2NyaXB0PlxcblwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVxdWlyZVBhdGggPSBwYXRoLnJlc29sdmUoQGZpbGVEaXJlY3RvcnlQYXRoLCByZXF1aXJlUGF0aClcbiAgICAgICAgICAgIGlmICFyZXF1aXJlQ2FjaGVbcmVxdWlyZVBhdGhdXG4gICAgICAgICAgICAgIHJlcXVpcmVzU3RyICs9IChmcy5yZWFkRmlsZVN5bmMocmVxdWlyZVBhdGgsIHtlbmNvZGluZzogJ3V0Zi04J30pICsgJ1xcbicpXG4gICAgICAgICAgICAgIHJlcXVpcmVDYWNoZVtyZXF1aXJlUGF0aF0gPSB0cnVlXG5cbiAgICAgICAganNDb2RlICs9IChyZXF1aXJlc1N0ciArIGNvZGUgKyAnXFxuJylcblxuICAgIGh0bWwgPSAkLmh0bWwoKVxuICAgIGh0bWwgKz0gXCIje3NjcmlwdHNTdHJ9XFxuXCIgaWYgc2NyaXB0c1N0clxuICAgIGh0bWwgKz0gXCI8c2NyaXB0IGRhdGEtanMtY29kZT4je2pzQ29kZX08L3NjcmlwdD5cIiBpZiBqc0NvZGVcbiAgICByZXR1cm4gaHRtbFxuXG4gICMjXG4gICMge0Z1bmN0aW9ufSBjYWxsYmFjayAoaHRtbENvbnRlbnQpXG4gIGdldEhUTUxDb250ZW50OiAoe2lzRm9yUHJpbnQsIG9mZmxpbmUsIHVzZVJlbGF0aXZlSW1hZ2VQYXRoLCBwaGFudG9tanNUeXBlfSwgY2FsbGJhY2spLT5cbiAgICBpc0ZvclByaW50ID89IGZhbHNlXG4gICAgb2ZmbGluZSA/PSBmYWxzZVxuICAgIHVzZVJlbGF0aXZlSW1hZ2VQYXRoID89IGZhbHNlXG4gICAgcGhhbnRvbWpzVHlwZSA/PSBmYWxzZSAjIHBkZiB8IHBuZyB8IGpwZWcgfCBmYWxzZVxuICAgIHJldHVybiBjYWxsYmFjaygpIGlmIG5vdCBAZWRpdG9yXG5cbiAgICBtYXRoUmVuZGVyaW5nT3B0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hdGhSZW5kZXJpbmdPcHRpb24nKVxuXG4gICAgcmVzID0gQHBhcnNlTUQgQGZvcm1hdFN0cmluZ0JlZm9yZVBhcnNpbmcoQGVkaXRvci5nZXRUZXh0KCkpLCB7dXNlUmVsYXRpdmVJbWFnZVBhdGgsIEBmaWxlRGlyZWN0b3J5UGF0aCwgQHByb2plY3REaXJlY3RvcnlQYXRoLCBtYXJrZG93blByZXZpZXc6IHRoaXMsIGhpZGVGcm9udE1hdHRlcjogdHJ1ZX0sICh7aHRtbCwgeWFtbENvbmZpZywgc2xpZGVDb25maWdzfSk9PlxuICAgICAgaHRtbENvbnRlbnQgPSBAZm9ybWF0U3RyaW5nQWZ0ZXJQYXJzaW5nKGh0bWwpXG4gICAgICB5YW1sQ29uZmlnID0geWFtbENvbmZpZyBvciB7fVxuXG5cbiAgICAgICMgcmVwbGFjZSBjb2RlIGNodW5rcyBpbnNpZGUgaHRtbENvbnRlbnRcbiAgICAgIGh0bWxDb250ZW50ID0gQGluc2VydENvZGVDaHVua3NSZXN1bHQgaHRtbENvbnRlbnRcblxuICAgICAgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnS2FUZVgnXG4gICAgICAgIGlmIG9mZmxpbmVcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCJcbiAgICAgICAgICAgICAgICBocmVmPVxcXCJmaWxlOi8vLyN7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL25vZGVfbW9kdWxlcy9rYXRleC9kaXN0L2thdGV4Lm1pbi5jc3MnKX1cXFwiPlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj1cXFwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvS2FUZVgvMC43LjEva2F0ZXgubWluLmNzc1xcXCI+XCJcbiAgICAgIGVsc2UgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTWF0aEpheCdcbiAgICAgICAgaW5saW5lID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmluZGljYXRvckZvck1hdGhSZW5kZXJpbmdJbmxpbmUnKVxuICAgICAgICBibG9jayA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nQmxvY2snKVxuICAgICAgICBtYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cycpXG4gICAgICAgIGlmIG9mZmxpbmVcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC94LW1hdGhqYXgtY29uZmlnXFxcIj5cbiAgICAgICAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICAgICAgICAgIG1lc3NhZ2VTdHlsZTogJ25vbmUnLFxuICAgICAgICAgICAgICB0ZXgyamF4OiB7aW5saW5lTWF0aDogI3tpbmxpbmV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGg6ICN7YmxvY2t9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vudmlyb25tZW50czogI3ttYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50c30sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXNjYXBlczogdHJ1ZX1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC9qYXZhc2NyaXB0XFxcIiBhc3luYyBzcmM9XFxcImZpbGU6Ly8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvbWF0aGpheC9NYXRoSmF4LmpzP2NvbmZpZz1UZVgtQU1TX0NIVE1MJyl9XFxcIj48L3NjcmlwdD5cbiAgICAgICAgICBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBpbmxpbmVNYXRoOiBbIFsnJCcsJyQnXSwgW1wiXFxcXChcIixcIlxcXFwpXCJdIF0sXG4gICAgICAgICAgIyBkaXNwbGF5TWF0aDogWyBbJyQkJywnJCQnXSwgW1wiXFxcXFtcIixcIlxcXFxdXCJdIF1cbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC94LW1hdGhqYXgtY29uZmlnXFxcIj5cbiAgICAgICAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICAgICAgICAgIG1lc3NhZ2VTdHlsZTogJ25vbmUnLFxuICAgICAgICAgICAgICB0ZXgyamF4OiB7aW5saW5lTWF0aDogI3tpbmxpbmV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGg6ICN7YmxvY2t9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vudmlyb25tZW50czogI3ttYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50c30sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXNjYXBlczogdHJ1ZX1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC9qYXZhc2NyaXB0XFxcIiBhc3luYyBzcmM9XFxcImh0dHBzOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanM/Y29uZmlnPVRlWC1NTUwtQU1fQ0hUTUxcXFwiPjwvc2NyaXB0PlxuICAgICAgICAgIFwiXG4gICAgICBlbHNlXG4gICAgICAgIG1hdGhTdHlsZSA9ICcnXG5cbiAgICAgICMgcHJlc2VudGF0aW9uXG4gICAgICBpZiBzbGlkZUNvbmZpZ3MubGVuZ3RoXG4gICAgICAgIGh0bWxDb250ZW50ID0gQHBhcnNlU2xpZGVzRm9yRXhwb3J0KGh0bWxDb250ZW50LCBzbGlkZUNvbmZpZ3MsIHVzZVJlbGF0aXZlSW1hZ2VQYXRoKVxuICAgICAgICBpZiBvZmZsaW5lXG4gICAgICAgICAgcHJlc2VudGF0aW9uU2NyaXB0ID0gXCJcbiAgICAgICAgICA8c2NyaXB0IHNyYz0nZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcmV2ZWFsL2xpYi9qcy9oZWFkLm1pbi5qcycpfSc+PC9zY3JpcHQ+XG4gICAgICAgICAgPHNjcmlwdCBzcmM9J2ZpbGU6Ly8vI3twYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3JldmVhbC9qcy9yZXZlYWwuanMnKX0nPjwvc2NyaXB0PlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcmVzZW50YXRpb25TY3JpcHQgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgc3JjPSdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9yZXZlYWwuanMvMy40LjEvbGliL2pzL2hlYWQubWluLmpzJz48L3NjcmlwdD5cbiAgICAgICAgICA8c2NyaXB0IHNyYz0naHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvcmV2ZWFsLmpzLzMuNC4xL2pzL3JldmVhbC5taW4uanMnPjwvc2NyaXB0PlwiXG5cbiAgICAgICAgcHJlc2VudGF0aW9uQ29uZmlnID0geWFtbENvbmZpZ1sncHJlc2VudGF0aW9uJ10gb3Ige31cbiAgICAgICAgZGVwZW5kZW5jaWVzID0gcHJlc2VudGF0aW9uQ29uZmlnLmRlcGVuZGVuY2llcyBvciBbXVxuICAgICAgICBpZiBwcmVzZW50YXRpb25Db25maWcuZW5hYmxlU3BlYWtlck5vdGVzXG4gICAgICAgICAgaWYgb2ZmbGluZVxuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLnB1c2gge3NyYzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcGx1Z2luL25vdGVzL25vdGVzLmpzJyksIGFzeW5jOiB0cnVlfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlcGVuZGVuY2llcy5wdXNoIHtzcmM6ICdyZXZlYWxqc19kZXBzL25vdGVzLmpzJywgYXN5bmM6IHRydWV9ICMgVE9ETzogY29weSBub3Rlcy5qcyBmaWxlIHRvIGNvcnJlc3BvbmRpbmcgZm9sZGVyXG4gICAgICAgIHByZXNlbnRhdGlvbkNvbmZpZy5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXNcblxuICAgICAgICAjICAgICAgIDxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj0nZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcmV2ZWFsL3JldmVhbC5jc3MnKX0nPlxuICAgICAgICBwcmVzZW50YXRpb25TdHlsZSA9IFwiXCJcIlxuXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgI3tmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcmV2ZWFsLmNzcycpKX1cblxuICAgICAgICAje2lmIGlzRm9yUHJpbnQgdGhlbiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcGRmLmNzcycpKSBlbHNlICcnfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgcHJlc2VudGF0aW9uSW5pdFNjcmlwdCA9IFwiXCJcIlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgIFJldmVhbC5pbml0aWFsaXplKCN7SlNPTi5zdHJpbmdpZnkoT2JqZWN0LmFzc2lnbih7bWFyZ2luOiAwLjF9LCBwcmVzZW50YXRpb25Db25maWcpKX0pXG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgcHJlc2VudGF0aW9uU2NyaXB0ID0gJydcbiAgICAgICAgcHJlc2VudGF0aW9uU3R5bGUgPSAnJ1xuICAgICAgICBwcmVzZW50YXRpb25Jbml0U2NyaXB0ID0gJydcblxuICAgICAgIyBwaGFudG9tanNcbiAgICAgIHBoYW50b21qc0NsYXNzID0gXCJcIlxuICAgICAgaWYgcGhhbnRvbWpzVHlwZVxuICAgICAgICBpZiBwaGFudG9tanNUeXBlID09ICcucGRmJ1xuICAgICAgICAgIHBoYW50b21qc0NsYXNzID0gJ3BoYW50b21qcy1wZGYnXG4gICAgICAgIGVsc2UgaWYgcGhhbnRvbWpzVHlwZSA9PSAnLnBuZycgb3IgcGhhbnRvbWpzVHlwZSA9PSAnLmpwZWcnXG4gICAgICAgICAgcGhhbnRvbWpzQ2xhc3MgPSAncGhhbnRvbWpzLWltYWdlJ1xuXG4gICAgICB0aXRsZSA9IEBnZXRGaWxlTmFtZSgpXG4gICAgICB0aXRsZSA9IHRpdGxlLnNsaWNlKDAsIHRpdGxlLmxlbmd0aCAtIHBhdGguZXh0bmFtZSh0aXRsZSkubGVuZ3RoKSAjIHJlbW92ZSAnLm1kJ1xuXG4gICAgICBwcmV2aWV3VGhlbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJldmlld1RoZW1lJylcbiAgICAgIGlmIGlzRm9yUHJpbnQgYW5kIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZVc2VHaXRodWInKVxuICAgICAgICBwcmV2aWV3VGhlbWUgPSAnbXBlLWdpdGh1Yi1zeW50YXgnXG5cbiAgICAgIGxvYWRQcmV2aWV3VGhlbWUgcHJldmlld1RoZW1lLCBmYWxzZSwgKGVycm9yLCBjc3MpPT5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCkgaWYgZXJyb3JcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrIFwiXCJcIlxuICAgIDwhRE9DVFlQRSBodG1sPlxuICAgIDxodG1sPlxuICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT4je3RpdGxlfTwvdGl0bGU+XG4gICAgICAgIDxtZXRhIGNoYXJzZXQ9XFxcInV0Zi04XFxcIj5cbiAgICAgICAgPG1ldGEgbmFtZT1cXFwidmlld3BvcnRcXFwiIGNvbnRlbnQ9XFxcIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcXFwiPlxuXG4gICAgICAgICN7cHJlc2VudGF0aW9uU3R5bGV9XG5cbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAje2Nzc31cbiAgICAgICAgPC9zdHlsZT5cblxuICAgICAgICAje21hdGhTdHlsZX1cblxuICAgICAgICAje3ByZXNlbnRhdGlvblNjcmlwdH1cbiAgICAgIDwvaGVhZD5cbiAgICAgIDxib2R5IGNsYXNzPVxcXCJtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkICN7cGhhbnRvbWpzQ2xhc3N9XFxcIlxuICAgICAgICAgICN7aWYgQHByZXNlbnRhdGlvbk1vZGUgdGhlbiAnZGF0YS1wcmVzZW50YXRpb24tbW9kZScgZWxzZSAnJ30+XG5cbiAgICAgICN7aHRtbENvbnRlbnR9XG5cbiAgICAgIDwvYm9keT5cbiAgICAgICN7cHJlc2VudGF0aW9uSW5pdFNjcmlwdH1cbiAgICA8L2h0bWw+XG4gICAgICBcIlwiXCJcblxuICAjIGFwaSBkb2MgW3ByaW50VG9QREZdIGZ1bmN0aW9uXG4gICMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vZWxlY3Ryb24vYmxvYi9tYXN0ZXIvZG9jcy9hcGkvd2ViLWNvbnRlbnRzLm1kXG4gIHByaW50UERGOiAoaHRtbFBhdGgsIGRlc3QpLT5cbiAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcblxuICAgIHtCcm93c2VyV2luZG93fSA9IHJlcXVpcmUoJ2VsZWN0cm9uJykucmVtb3RlXG4gICAgd2luID0gbmV3IEJyb3dzZXJXaW5kb3cgc2hvdzogZmFsc2VcbiAgICB3aW4ubG9hZFVSTCBodG1sUGF0aFxuXG4gICAgIyBnZXQgbWFyZ2lucyB0eXBlXG4gICAgbWFyZ2luc1R5cGUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWFyZ2luc1R5cGUnKVxuICAgIG1hcmdpbnNUeXBlID0gaWYgbWFyZ2luc1R5cGUgPT0gJ2RlZmF1bHQgbWFyZ2luJyB0aGVuIDAgZWxzZVxuICAgICAgICAgICAgICAgICAgaWYgbWFyZ2luc1R5cGUgPT0gJ25vIG1hcmdpbicgdGhlbiAxIGVsc2UgMlxuXG5cbiAgICAjIGdldCBvcmllbnRhdGlvblxuICAgIGxhbmRzY2FwZSA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5vcmllbnRhdGlvbicpID09ICdsYW5kc2NhcGUnXG5cbiAgICBsYXN0SW5kZXhPZlNsYXNoID0gZGVzdC5sYXN0SW5kZXhPZiAnLycgb3IgMFxuICAgIHBkZk5hbWUgPSBkZXN0LnNsaWNlKGxhc3RJbmRleE9mU2xhc2ggKyAxKVxuXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkaWQtZmluaXNoLWxvYWQnLCAoKT0+XG4gICAgICBzZXRUaW1lb3V0KCgpPT5cbiAgICAgICAgd2luLndlYkNvbnRlbnRzLnByaW50VG9QREZcbiAgICAgICAgICBwYWdlU2l6ZTogYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmV4cG9ydFBERlBhZ2VGb3JtYXQnKSxcbiAgICAgICAgICBsYW5kc2NhcGU6IGxhbmRzY2FwZSxcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wcmludEJhY2tncm91bmQnKSxcbiAgICAgICAgICBtYXJnaW5zVHlwZTogbWFyZ2luc1R5cGUsIChlcnIsIGRhdGEpPT5cbiAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcblxuICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkZXN0KVxuICAgICAgICAgICAgZGVzdEZpbGUuY3JlYXRlKCkudGhlbiAoZmxhZyk9PlxuICAgICAgICAgICAgICBkZXN0RmlsZS53cml0ZSBkYXRhXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiRmlsZSAje3BkZk5hbWV9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje2Rlc3R9XCJcbiAgICAgICAgICAgICAgIyBvcGVuIHBkZlxuICAgICAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmT3BlbkF1dG9tYXRpY2FsbHknKVxuICAgICAgICAgICAgICAgIEBvcGVuRmlsZSBkZXN0XG4gICAgICAsIDUwMClcblxuICBzYXZlQXNQREY6IChkZXN0KS0+XG4gICAgcmV0dXJuIGlmIG5vdCBAZWRpdG9yXG5cbiAgICBpZiBAcHJlc2VudGF0aW9uTW9kZSAjIGZvciBwcmVzZW50YXRpb24sIG5lZWQgdG8gcHJpbnQgZnJvbSBjaHJvbWVcbiAgICAgIEBvcGVuSW5Ccm93c2VyKHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIEBnZXRIVE1MQ29udGVudCBpc0ZvclByaW50OiB0cnVlLCBvZmZsaW5lOiB0cnVlLCAoaHRtbENvbnRlbnQpPT5cbiAgICAgIHRlbXAub3BlblxuICAgICAgICBwcmVmaXg6ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkJyxcbiAgICAgICAgc3VmZml4OiAnLmh0bWwnLCAoZXJyLCBpbmZvKT0+XG4gICAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuICAgICAgICAgIGZzLndyaXRlIGluZm8uZmQsIGh0bWxDb250ZW50LCAoZXJyKT0+XG4gICAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgICBAcHJpbnRQREYgXCJmaWxlOi8vI3tpbmZvLnBhdGh9XCIsIGRlc3RcblxuICBzYXZlQXNIVE1MOiAoZGVzdCwgb2ZmbGluZT10cnVlLCB1c2VSZWxhdGl2ZUltYWdlUGF0aCktPlxuICAgIHJldHVybiBpZiBub3QgQGVkaXRvclxuXG4gICAgQGdldEhUTUxDb250ZW50IGlzRm9yUHJpbnQ6IGZhbHNlLCBvZmZsaW5lOiBvZmZsaW5lLCB1c2VSZWxhdGl2ZUltYWdlUGF0aDogdXNlUmVsYXRpdmVJbWFnZVBhdGgsIChodG1sQ29udGVudCk9PlxuXG4gICAgICBodG1sRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGRlc3QpXG5cbiAgICAgICMgcHJlc2VudGF0aW9uIHNwZWFrZXIgbm90ZXNcbiAgICAgICMgY29weSBkZXBlbmRlbmN5IGZpbGVzXG4gICAgICBpZiAhb2ZmbGluZSBhbmQgaHRtbENvbnRlbnQuaW5kZXhPZignW3tcInNyY1wiOlwicmV2ZWFsanNfZGVwcy9ub3Rlcy5qc1wiLFwiYXN5bmNcIjp0cnVlfV0nKSA+PSAwXG4gICAgICAgIGRlcHNEaXJOYW1lID0gcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShkZXN0KSwgJ3JldmVhbGpzX2RlcHMnKVxuICAgICAgICBkZXBzRGlyID0gbmV3IERpcmVjdG9yeShkZXBzRGlyTmFtZSlcbiAgICAgICAgZGVwc0Rpci5jcmVhdGUoKS50aGVuIChmbGFnKS0+XG4gICAgICAgICAgdHJ1ZVxuICAgICAgICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcGx1Z2luL25vdGVzL25vdGVzLmpzJykpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5yZXNvbHZlKGRlcHNEaXJOYW1lLCAnbm90ZXMuanMnKSkpXG4gICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3JldmVhbC9wbHVnaW4vbm90ZXMvbm90ZXMuaHRtbCcpKS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHBhdGgucmVzb2x2ZShkZXBzRGlyTmFtZSwgJ25vdGVzLmh0bWwnKSkpXG5cbiAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZGVzdClcbiAgICAgIGRlc3RGaWxlLmNyZWF0ZSgpLnRoZW4gKGZsYWcpLT5cbiAgICAgICAgZGVzdEZpbGUud3JpdGUgaHRtbENvbnRlbnRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJGaWxlICN7aHRtbEZpbGVOYW1lfSB3YXMgY3JlYXRlZFwiLCBkZXRhaWw6IFwicGF0aDogI3tkZXN0fVwiKVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgUHJlc2VudGF0aW9uXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIHBhcnNlU2xpZGVzOiAoaHRtbCwgc2xpZGVDb25maWdzLCB5YW1sQ29uZmlnKS0+XG4gICAgc2xpZGVzID0gaHRtbC5zcGxpdCAnPGRpdiBjbGFzcz1cIm5ldy1zbGlkZVwiPjwvZGl2PidcbiAgICBzbGlkZXMgPSBzbGlkZXMuc2xpY2UoMSlcbiAgICBvdXRwdXQgPSAnJ1xuXG4gICAgb2Zmc2V0ID0gMFxuICAgIHdpZHRoID0gOTYwXG4gICAgaGVpZ2h0ID0gNzAwXG5cbiAgICBpZiB5YW1sQ29uZmlnIGFuZCB5YW1sQ29uZmlnWydwcmVzZW50YXRpb24nXVxuICAgICAgcHJlc2VudGF0aW9uQ29uZmlnID0geWFtbENvbmZpZ1sncHJlc2VudGF0aW9uJ11cbiAgICAgIHdpZHRoID0gcHJlc2VudGF0aW9uQ29uZmlnWyd3aWR0aCddIG9yIDk2MFxuICAgICAgaGVpZ2h0ID0gcHJlc2VudGF0aW9uQ29uZmlnWydoZWlnaHQnXSBvciA3MDBcblxuICAgIHJhdGlvID0gaGVpZ2h0IC8gd2lkdGggKiAxMDAgKyAnJSdcbiAgICB6b29tID0gKEBlbGVtZW50Lm9mZnNldFdpZHRoIC0gMTI4KS93aWR0aCAjIyA2NCBpcyAyKnBhZGRpbmdcblxuICAgIGZvciBzbGlkZSBpbiBzbGlkZXNcbiAgICAgICMgc2xpZGUgPSBzbGlkZS50cmltKClcbiAgICAgICMgaWYgc2xpZGUubGVuZ3RoXG4gICAgICBzbGlkZUNvbmZpZyA9IHNsaWRlQ29uZmlnc1tvZmZzZXRdXG4gICAgICBzdHlsZVN0cmluZyA9ICcnXG4gICAgICB2aWRlb1N0cmluZyA9ICcnXG4gICAgICBpZnJhbWVTdHJpbmcgPSAnJ1xuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pbWFnZSddXG4gICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcje0ByZXNvbHZlRmlsZVBhdGgoc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pbWFnZSddKX0nKTtcIlxuXG4gICAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtc2l6ZSddXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXNpemU6ICN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1zaXplJ119O1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHlsZVN0cmluZyArPSBcImJhY2tncm91bmQtc2l6ZTogY292ZXI7XCJcblxuICAgICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXBvc2l0aW9uJ11cbiAgICAgICAgICBzdHlsZVN0cmluZyArPSBcImJhY2tncm91bmQtcG9zaXRpb246ICN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1wb3NpdGlvbiddfTtcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7XCJcblxuICAgICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXJlcGVhdCddXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXJlcGVhdDogI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXJlcGVhdCddfTtcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1wiXG5cbiAgICAgIGVsc2UgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1jb2xvciddXG4gICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1jb2xvcjogI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWNvbG9yJ119ICFpbXBvcnRhbnQ7XCJcblxuICAgICAgZWxzZSBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvJ11cbiAgICAgICAgdmlkZW9NdXRlZCA9IHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8tbXV0ZWQnXVxuICAgICAgICB2aWRlb0xvb3AgPSBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLWxvb3AnXVxuXG4gICAgICAgIG11dGVkXyA9IGlmIHZpZGVvTXV0ZWQgdGhlbiAnbXV0ZWQnIGVsc2UgJydcbiAgICAgICAgbG9vcF8gPSBpZiB2aWRlb0xvb3AgdGhlbiAnbG9vcCcgZWxzZSAnJ1xuXG4gICAgICAgIHZpZGVvU3RyaW5nID0gXCJcIlwiXG4gICAgICAgIDx2aWRlbyAje211dGVkX30gI3tsb29wX30gcGxheXNpbmxpbmUgYXV0b3BsYXkgY2xhc3M9XFxcImJhY2tncm91bmQtdmlkZW9cXFwiIHNyYz1cXFwiI3tAcmVzb2x2ZUZpbGVQYXRoKHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8nXSl9XFxcIj5cbiAgICAgICAgPC92aWRlbz5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgICMgICAgICAgICAgIDxzb3VyY2Ugc3JjPVxcXCIje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8nXX1cXFwiPlxuXG4gICAgICBlbHNlIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtaWZyYW1lJ11cbiAgICAgICAgaWZyYW1lU3RyaW5nID0gXCJcIlwiXG4gICAgICAgIDxpZnJhbWUgY2xhc3M9XFxcImJhY2tncm91bmQtaWZyYW1lXFxcIiBzcmM9XFxcIiN7QHJlc29sdmVGaWxlUGF0aChzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZSddKX1cXFwiIGZyYW1lYm9yZGVyPVwiMFwiID4gPC9pZnJhbWU+XG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmQtaWZyYW1lLW92ZXJsYXlcXFwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgb3V0cHV0ICs9IFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdzbGlkZScgZGF0YS1vZmZzZXQ9JyN7b2Zmc2V0fScgc3R5bGU9XCJ3aWR0aDogI3t3aWR0aH1weDsgaGVpZ2h0OiAje2hlaWdodH1weDsgem9vbTogI3t6b29tfTsgI3tzdHlsZVN0cmluZ31cIj5cbiAgICAgICAgICAje3ZpZGVvU3RyaW5nfVxuICAgICAgICAgICN7aWZyYW1lU3RyaW5nfVxuICAgICAgICAgIDxzZWN0aW9uPiN7c2xpZGV9PC9zZWN0aW9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgb2Zmc2V0ICs9IDFcblxuICAgICMgcmVtb3ZlIDxhc2lkZSBjbGFzcz1cIm5vdGVzXCI+IC4uLiA8L2FzaWRlPlxuICAgIG91dHB1dCA9IG91dHB1dC5yZXBsYWNlKC8oPGFzaWRlXFxiW14+XSo+KVtePD5dKig8XFwvYXNpZGU+KS9pZywgJycpXG5cbiAgICBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwicHJldmlldy1zbGlkZXNcIj5cbiAgICAgICN7b3V0cHV0fVxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG4gIHBhcnNlU2xpZGVzRm9yRXhwb3J0OiAoaHRtbCwgc2xpZGVDb25maWdzLCB1c2VSZWxhdGl2ZUltYWdlUGF0aCktPlxuICAgIHNsaWRlcyA9IGh0bWwuc3BsaXQgJzxkaXYgY2xhc3M9XCJuZXctc2xpZGVcIj48L2Rpdj4nXG4gICAgc2xpZGVzID0gc2xpZGVzLnNsaWNlKDEpXG4gICAgb3V0cHV0ID0gJydcblxuICAgIHBhcnNlQXR0clN0cmluZyA9IChzbGlkZUNvbmZpZyk9PlxuICAgICAgYXR0clN0cmluZyA9ICcnXG4gICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWltYWdlJ11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLWJhY2tncm91bmQtaW1hZ2U9JyN7QHJlc29sdmVGaWxlUGF0aChzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWltYWdlJ10sIHVzZVJlbGF0aXZlSW1hZ2VQYXRoKX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1zaXplJ11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLWJhY2tncm91bmQtc2l6ZT0nI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXNpemUnXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1wb3NpdGlvbiddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLXBvc2l0aW9uPScje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtcG9zaXRpb24nXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1yZXBlYXQnXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC1yZXBlYXQ9JyN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1yZXBlYXQnXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1jb2xvciddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLWNvbG9yPScje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtY29sb3InXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtbm90ZXMnXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtbm90ZXM9JyN7c2xpZGVDb25maWdbJ2RhdGEtbm90ZXMnXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC12aWRlbyddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLXZpZGVvPScje0ByZXNvbHZlRmlsZVBhdGgoc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC12aWRlbyddLCB1c2VSZWxhdGl2ZUltYWdlUGF0aCl9J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8tbG9vcCddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLWxvb3BcIlxuXG4gICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLW11dGVkJ11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLWJhY2tncm91bmQtdmlkZW8tbXV0ZWRcIlxuXG4gICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS10cmFuc2l0aW9uJ11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLXRyYW5zaXRpb249JyN7c2xpZGVDb25maWdbJ2RhdGEtdHJhbnNpdGlvbiddfSdcIlxuXG4gICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZSddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZT0nI3tAcmVzb2x2ZUZpbGVQYXRoKHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtaWZyYW1lJ10sIHVzZVJlbGF0aXZlSW1hZ2VQYXRoKX0nXCJcbiAgICAgIGF0dHJTdHJpbmdcblxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IHNsaWRlcy5sZW5ndGhcbiAgICAgIHNsaWRlID0gc2xpZGVzW2ldXG4gICAgICBzbGlkZUNvbmZpZyA9IHNsaWRlQ29uZmlnc1tpXVxuICAgICAgYXR0clN0cmluZyA9IHBhcnNlQXR0clN0cmluZyhzbGlkZUNvbmZpZylcblxuICAgICAgaWYgIXNsaWRlQ29uZmlnWyd2ZXJ0aWNhbCddXG4gICAgICAgIGlmIGkgPiAwIGFuZCBzbGlkZUNvbmZpZ3NbaS0xXVsndmVydGljYWwnXSAjIGVuZCBvZiB2ZXJ0aWNhbCBzbGlkZXNcbiAgICAgICAgICBvdXRwdXQgKz0gJzwvc2VjdGlvbj4nXG4gICAgICAgIGlmIGkgPCBzbGlkZXMubGVuZ3RoIC0gMSBhbmQgc2xpZGVDb25maWdzW2krMV1bJ3ZlcnRpY2FsJ10gIyBzdGFydCBvZiB2ZXJ0aWNhbCBzbGlkZXNcbiAgICAgICAgICBvdXRwdXQgKz0gXCI8c2VjdGlvbj5cIlxuXG4gICAgICBvdXRwdXQgKz0gXCI8c2VjdGlvbiAje2F0dHJTdHJpbmd9PiN7c2xpZGV9PC9zZWN0aW9uPlwiXG4gICAgICBpICs9IDFcblxuICAgIGlmIGkgPiAwIGFuZCBzbGlkZUNvbmZpZ3NbaS0xXVsndmVydGljYWwnXSAjIGVuZCBvZiB2ZXJ0aWNhbCBzbGlkZXNcbiAgICAgIG91dHB1dCArPSBcIjwvc2VjdGlvbj5cIlxuXG4gICAgXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInJldmVhbFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNsaWRlc1wiPlxuICAgICAgICAje291dHB1dH1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgUGhhbnRvbUpTXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIGxvYWRQaGFudG9tSlNIZWFkZXJGb290ZXJDb25maWc6ICgpLT5cbiAgICAjIG1lcm1haWRfY29uZmlnLmpzXG4gICAgY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL3BoYW50b21qc19oZWFkZXJfZm9vdGVyX2NvbmZpZy5qcycpXG4gICAgdHJ5XG4gICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoY29uZmlnUGF0aCldICMgcmV0dXJuIHVuY2FjaGVkXG4gICAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKSBvciB7fVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25maWdGaWxlID0gbmV3IEZpbGUoY29uZmlnUGF0aClcbiAgICAgIGNvbmZpZ0ZpbGUuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgICBpZiAhZmxhZyAjIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gbG9hZCBwaGFudG9tanNfaGVhZGVyX2Zvb3Rlcl9jb25maWcuanMnLCBkZXRhaWw6ICd0aGVyZSBtaWdodCBiZSBlcnJvcnMgaW4geW91ciBjb25maWcgZmlsZScpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgY29uZmlnRmlsZS53cml0ZSBcIlwiXCJcbid1c2Ugc3RyaWN0J1xuLypcbmNvbmZpZ3VyZSBoZWFkZXIgYW5kIGZvb3RlciAoYW5kIG90aGVyIG9wdGlvbnMpXG5tb3JlIGluZm9ybWF0aW9uIGNhbiBiZSBmb3VuZCBoZXJlOlxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjYmFjaG1hbm4vbm9kZS1odG1sLXBkZlxuQXR0ZW50aW9uOiB0aGlzIGNvbmZpZyB3aWxsIG92ZXJyaWRlIHlvdXIgY29uZmlnIGluIGV4cG9ydGVyIHBhbmVsLlxuXG5lZzpcblxuICBsZXQgY29uZmlnID0ge1xuICAgIFwiaGVhZGVyXCI6IHtcbiAgICAgIFwiaGVpZ2h0XCI6IFwiNDVtbVwiLFxuICAgICAgXCJjb250ZW50c1wiOiAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj5BdXRob3I6IE1hcmMgQmFjaG1hbm48L2Rpdj4nXG4gICAgfSxcbiAgICBcImZvb3RlclwiOiB7XG4gICAgICBcImhlaWdodFwiOiBcIjI4bW1cIixcbiAgICAgIFwiY29udGVudHNcIjogJzxzcGFuIHN0eWxlPVwiY29sb3I6ICM0NDQ7XCI+e3twYWdlfX08L3NwYW4+LzxzcGFuPnt7cGFnZXN9fTwvc3Bhbj4nXG4gICAgfVxuICB9XG4qL1xuLy8geW91IGNhbiBlZGl0IHRoZSAnY29uZmlnJyB2YXJpYWJsZSBiZWxvd1xubGV0IGNvbmZpZyA9IHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25maWcgfHwge31cblwiXCJcIlxuICAgICAgcmV0dXJuIHt9XG5cbiAgcGhhbnRvbUpTRXhwb3J0OiAoZGVzdCktPlxuICAgIHJldHVybiBpZiBub3QgQGVkaXRvclxuXG4gICAgaWYgQHByZXNlbnRhdGlvbk1vZGUgIyBmb3IgcHJlc2VudGF0aW9uLCBuZWVkIHRvIHByaW50IGZyb20gY2hyb21lXG4gICAgICBAb3BlbkluQnJvd3Nlcih0cnVlKVxuICAgICAgcmV0dXJuXG5cbiAgICBAZ2V0SFRNTENvbnRlbnQgaXNGb3JQcmludDogdHJ1ZSwgb2ZmbGluZTogdHJ1ZSwgcGhhbnRvbWpzVHlwZTogcGF0aC5leHRuYW1lKGRlc3QpLCAoaHRtbENvbnRlbnQpPT5cblxuICAgICAgZmlsZVR5cGUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGhhbnRvbUpTRXhwb3J0RmlsZVR5cGUnKVxuICAgICAgZm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmV4cG9ydFBERlBhZ2VGb3JtYXQnKVxuICAgICAgb3JpZW50YXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQub3JpZW50YXRpb24nKVxuICAgICAgbWFyZ2luID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBoYW50b21KU01hcmdpbicpLnRyaW0oKVxuXG4gICAgICBpZiAhbWFyZ2luLmxlbmd0aFxuICAgICAgICBtYXJnaW4gPSAnMWNtJ1xuICAgICAgZWxzZVxuICAgICAgICBtYXJnaW4gPSBtYXJnaW4uc3BsaXQoJywnKS5tYXAgKG0pLT5tLnRyaW0oKVxuICAgICAgICBpZiBtYXJnaW4ubGVuZ3RoID09IDFcbiAgICAgICAgICBtYXJnaW4gPSBtYXJnaW5bMF1cbiAgICAgICAgZWxzZSBpZiBtYXJnaW4ubGVuZ3RoID09IDJcbiAgICAgICAgICBtYXJnaW4gPSB7J3RvcCc6IG1hcmdpblswXSwgJ2JvdHRvbSc6IG1hcmdpblswXSwgJ2xlZnQnOiBtYXJnaW5bMV0sICdyaWdodCc6IG1hcmdpblsxXX1cbiAgICAgICAgZWxzZSBpZiBtYXJnaW4ubGVuZ3RoID09IDRcbiAgICAgICAgICBtYXJnaW4gPSB7J3RvcCc6IG1hcmdpblswXSwgJ3JpZ2h0JzogbWFyZ2luWzFdLCAnYm90dG9tJzogbWFyZ2luWzJdLCAnbGVmdCc6IG1hcmdpblszXX1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcmdpbiA9ICcxY20nXG5cbiAgICAgICMgZ2V0IGhlYWRlciBhbmQgZm9vdGVyXG4gICAgICBjb25maWcgPSBAbG9hZFBoYW50b21KU0hlYWRlckZvb3RlckNvbmZpZygpXG5cbiAgICAgIHBkZlxuICAgICAgICAuY3JlYXRlIGh0bWxDb250ZW50LCBPYmplY3QuYXNzaWduKHt0eXBlOiBmaWxlVHlwZSwgZm9ybWF0OiBmb3JtYXQsIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbiwgYm9yZGVyOiBtYXJnaW4sIHF1YWxpdHk6ICc3NScsIHRpbWVvdXQ6IDYwMDAwLCBzY3JpcHQ6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcGhhbnRvbWpzL3BkZl9hNF9wb3J0cmFpdC5qcycpfSwgY29uZmlnKVxuICAgICAgICAudG9GaWxlIGRlc3QsIChlcnIsIHJlcyk9PlxuICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIGVyclxuICAgICAgICAgICMgb3BlbiBwZGZcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBsYXN0SW5kZXhPZlNsYXNoID0gZGVzdC5sYXN0SW5kZXhPZiAnLycgb3IgMFxuICAgICAgICAgICAgZmlsZU5hbWUgPSBkZXN0LnNsaWNlKGxhc3RJbmRleE9mU2xhc2ggKyAxKVxuXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIkZpbGUgI3tmaWxlTmFtZX0gd2FzIGNyZWF0ZWRcIiwgZGV0YWlsOiBcInBhdGg6ICN7ZGVzdH1cIlxuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JylcbiAgICAgICAgICAgICAgQG9wZW5GaWxlIGRlc3RcblxuICAjIyBFQk9PS1xuICBnZW5lcmF0ZUVib29rOiAoZGVzdCktPlxuICAgIEBwYXJzZU1EIEBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nKEBlZGl0b3IuZ2V0VGV4dCgpKSwge2lzRm9yRWJvb2s6IHRydWUsIEBmaWxlRGlyZWN0b3J5UGF0aCwgQHByb2plY3REaXJlY3RvcnlQYXRoLCBoaWRlRnJvbnRNYXR0ZXI6dHJ1ZX0sICh7aHRtbCwgeWFtbENvbmZpZ30pPT5cbiAgICAgIGh0bWwgPSBAZm9ybWF0U3RyaW5nQWZ0ZXJQYXJzaW5nKGh0bWwpXG5cbiAgICAgIGVib29rQ29uZmlnID0gbnVsbFxuICAgICAgaWYgeWFtbENvbmZpZ1xuICAgICAgICBlYm9va0NvbmZpZyA9IHlhbWxDb25maWdbJ2Vib29rJ11cblxuICAgICAgaWYgIWVib29rQ29uZmlnXG4gICAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2Vib29rIGNvbmZpZyBub3QgZm91bmQnLCBkZXRhaWw6ICdwbGVhc2UgaW5zZXJ0IGVib29rIGZyb250LW1hdHRlciB0byB5b3VyIG1hcmtkb3duIGZpbGUnKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnWW91ciBkb2N1bWVudCBpcyBiZWluZyBwcmVwYXJlZCcsIGRldGFpbDogJzopJylcblxuICAgICAgICBpZiBlYm9va0NvbmZpZy5jb3ZlciAjIGNoYW5nZSBjb3ZlciB0byBhYnNvbHV0ZSBwYXRoIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgIGNvdmVyID0gZWJvb2tDb25maWcuY292ZXJcbiAgICAgICAgICBpZiBjb3Zlci5zdGFydHNXaXRoKCcuLycpIG9yIGNvdmVyLnN0YXJ0c1dpdGgoJy4uLycpXG4gICAgICAgICAgICBjb3ZlciA9IHBhdGgucmVzb2x2ZShAZmlsZURpcmVjdG9yeVBhdGgsIGNvdmVyKVxuICAgICAgICAgICAgZWJvb2tDb25maWcuY292ZXIgPSBjb3ZlclxuICAgICAgICAgIGVsc2UgaWYgY292ZXIuc3RhcnRzV2l0aCgnLycpXG4gICAgICAgICAgICBjb3ZlciA9IHBhdGgucmVzb2x2ZShAcHJvamVjdERpcmVjdG9yeVBhdGgsICcuJytjb3ZlcilcbiAgICAgICAgICAgIGVib29rQ29uZmlnLmNvdmVyID0gY292ZXJcblxuICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICAgIHN0cnVjdHVyZSA9IFtdICMge2xldmVsOjAsIGZpbGVQYXRoOiAncGF0aCB0byBmaWxlJywgaGVhZGluZzogJycsIGlkOiAnJ31cbiAgICAgICAgaGVhZGluZ09mZnNldCA9IDBcblxuICAgICAgICAjIGxvYWQgdGhlIGxhc3QgdWwsIGFuYWx5emUgdG9jIGxpbmtzLlxuICAgICAgICBnZXRTdHJ1Y3R1cmUgPSAodWwsIGxldmVsKS0+XG4gICAgICAgICAgZm9yIGxpIGluIHVsLmNoaWxkcmVuXG4gICAgICAgICAgICBhID0gbGkuY2hpbGRyZW5bMF0/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJyk/WzBdXG4gICAgICAgICAgICBjb250aW51ZSBpZiBub3QgYVxuICAgICAgICAgICAgZmlsZVBhdGggPSBhLmdldEF0dHJpYnV0ZSgnaHJlZicpICMgYXNzdW1lIG1hcmtkb3duIGZpbGUgcGF0aFxuICAgICAgICAgICAgaGVhZGluZyA9IGEuaW5uZXJIVE1MXG4gICAgICAgICAgICBpZCA9ICdlYm9vay1oZWFkaW5nLWlkLScraGVhZGluZ09mZnNldFxuXG4gICAgICAgICAgICBzdHJ1Y3R1cmUucHVzaCB7bGV2ZWw6IGxldmVsLCBmaWxlUGF0aDogZmlsZVBhdGgsIGhlYWRpbmc6IGhlYWRpbmcsIGlkOiBpZH1cbiAgICAgICAgICAgIGhlYWRpbmdPZmZzZXQgKz0gMVxuXG4gICAgICAgICAgICBhLmhyZWYgPSAnIycraWQgIyBjaGFuZ2UgaWRcblxuICAgICAgICAgICAgaWYgbGkuY2hpbGRFbGVtZW50Q291bnQgPiAxXG4gICAgICAgICAgICAgIGdldFN0cnVjdHVyZShsaS5jaGlsZHJlblsxXSwgbGV2ZWwrMSlcblxuICAgICAgICBjaGlsZHJlbiA9IGRpdi5jaGlsZHJlblxuICAgICAgICBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMVxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICBpZiBjaGlsZHJlbltpXS50YWdOYW1lID09ICdVTCcgIyBmaW5kIHRhYmxlIG9mIGNvbnRlbnRzXG4gICAgICAgICAgICBnZXRTdHJ1Y3R1cmUoY2hpbGRyZW5baV0sIDApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGkgLT0gMVxuXG4gICAgICAgIG91dHB1dEhUTUwgPSBkaXYuaW5uZXJIVE1MXG5cbiAgICAgICAgIyBhcHBlbmQgZmlsZXMgYWNjb3JkaW5nIHRvIHN0cnVjdHVyZVxuICAgICAgICBmb3Igb2JqIGluIHN0cnVjdHVyZVxuICAgICAgICAgIGhlYWRpbmcgPSBvYmouaGVhZGluZ1xuICAgICAgICAgIGlkID0gb2JqLmlkXG4gICAgICAgICAgbGV2ZWwgPSBvYmoubGV2ZWxcbiAgICAgICAgICBmaWxlUGF0aCA9IG9iai5maWxlUGF0aFxuXG4gICAgICAgICAgaWYgZmlsZVBhdGguc3RhcnRzV2l0aCgnZmlsZTovLy8nKVxuICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSg4KVxuXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KVxuICAgICAgICAgICAgQHBhcnNlTUQgQGZvcm1hdFN0cmluZ0JlZm9yZVBhcnNpbmcodGV4dCksIHtpc0ZvckVib29rOiB0cnVlLCBwcm9qZWN0RGlyZWN0b3J5UGF0aDogQHByb2plY3REaXJlY3RvcnlQYXRoLCBmaWxlRGlyZWN0b3J5UGF0aDogcGF0aC5kaXJuYW1lKGZpbGVQYXRoKX0sICh7aHRtbH0pPT5cbiAgICAgICAgICAgICAgaHRtbCA9IEBmb3JtYXRTdHJpbmdBZnRlclBhcnNpbmcoaHRtbClcblxuICAgICAgICAgICAgICAjIGFkZCB0byBUT0NcbiAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IGh0bWxcbiAgICAgICAgICAgICAgaWYgZGl2LmNoaWxkRWxlbWVudENvdW50XG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuWzBdLmlkID0gaWRcbiAgICAgICAgICAgICAgICBkaXYuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdlYm9vay10b2MtbGV2ZWwtJysobGV2ZWwrMSksICcnKVxuICAgICAgICAgICAgICAgIGRpdi5jaGlsZHJlblswXS5zZXRBdHRyaWJ1dGUoJ2hlYWRpbmcnLCBoZWFkaW5nKVxuXG4gICAgICAgICAgICAgIG91dHB1dEhUTUwgKz0gZGl2LmlubmVySFRNTFxuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0Vib29rIGdlbmVyYXRpb246IEZhaWxlZCB0byBsb2FkIGZpbGUnLCBkZXRhaWw6IGZpbGVQYXRoICsgJ1xcbiAnICsgZXJyb3IpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAjIHJlbmRlciB2aXpcbiAgICAgICAgZGl2LmlubmVySFRNTCA9IG91dHB1dEhUTUxcbiAgICAgICAgQHJlbmRlclZpeihkaXYpXG5cbiAgICAgICAgIyBkb3dubG9hZCBpbWFnZXMgZm9yIC5lcHViIGFuZCAubW9iaVxuICAgICAgICBpbWFnZXNUb0Rvd25sb2FkID0gW11cbiAgICAgICAgaWYgcGF0aC5leHRuYW1lKGRlc3QpIGluIFsnLmVwdWInLCAnLm1vYmknXVxuICAgICAgICAgIGZvciBpbWcgaW4gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVxuICAgICAgICAgICAgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgICAgICAgIGlmIHNyYy5zdGFydHNXaXRoKCdodHRwOi8vJykgb3Igc3JjLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJylcbiAgICAgICAgICAgICAgaW1hZ2VzVG9Eb3dubG9hZC5wdXNoKGltZylcblxuICAgICAgICByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpXG4gICAgICAgIGFzeW5jID0gcmVxdWlyZSgnYXN5bmMnKVxuXG4gICAgICAgIGlmIGltYWdlc1RvRG93bmxvYWQubGVuZ3RoXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ2Rvd25sb2FkaW5nIGltYWdlcy4uLicpXG5cbiAgICAgICAgYXN5bmNGdW5jdGlvbnMgPSBpbWFnZXNUb0Rvd25sb2FkLm1hcCAoaW1nKT0+XG4gICAgICAgICAgKGNhbGxiYWNrKT0+XG4gICAgICAgICAgICBodHRwU3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgICAgICAgIHNhdmVQYXRoID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpICsgJ18nICsgcGF0aC5iYXNlbmFtZShodHRwU3JjKVxuICAgICAgICAgICAgc2F2ZVBhdGggPSAgcGF0aC5yZXNvbHZlKEBmaWxlRGlyZWN0b3J5UGF0aCwgc2F2ZVBhdGgpXG5cbiAgICAgICAgICAgIHN0cmVhbSA9IHJlcXVlc3QoaHR0cFNyYykucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShzYXZlUGF0aCkpXG5cbiAgICAgICAgICAgIHN0cmVhbS5vbiAnZmluaXNoJywgKCktPlxuICAgICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlICdzcmMnLCAnZmlsZTovLy8nK3NhdmVQYXRoXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHNhdmVQYXRoKVxuXG5cbiAgICAgICAgYXN5bmMucGFyYWxsZWwgYXN5bmNGdW5jdGlvbnMsIChlcnJvciwgZG93bmxvYWRlZEltYWdlUGF0aHM9W10pPT5cbiAgICAgICAgICAjIGNvbnZlcnQgaW1hZ2UgdG8gYmFzZTY0IGlmIG91dHB1dCBodG1sXG4gICAgICAgICAgaWYgcGF0aC5leHRuYW1lKGRlc3QpID09ICcuaHRtbCdcbiAgICAgICAgICAgICMgY2hlY2sgY292ZXJcbiAgICAgICAgICAgIGlmIGVib29rQ29uZmlnLmNvdmVyXG4gICAgICAgICAgICAgIGNvdmVyID0gaWYgZWJvb2tDb25maWcuY292ZXJbMF0gPT0gJy8nIHRoZW4gJ2ZpbGU6Ly8vJyArIGVib29rQ29uZmlnLmNvdmVyIGVsc2UgZWJvb2tDb25maWcuY292ZXJcbiAgICAgICAgICAgICAgY292ZXJJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuICAgICAgICAgICAgICBjb3ZlckltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGNvdmVyKVxuICAgICAgICAgICAgICBkaXYuaW5zZXJ0QmVmb3JlKGNvdmVySW1nLCBkaXYuZmlyc3RDaGlsZClcblxuICAgICAgICAgICAgaW1hZ2VFbGVtZW50cyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylcbiAgICAgICAgICAgIGZvciBpbWcgaW4gaW1hZ2VFbGVtZW50c1xuICAgICAgICAgICAgICBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKVxuICAgICAgICAgICAgICBpZiBzcmMuc3RhcnRzV2l0aCgnZmlsZTovLy8nKVxuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zbGljZSg4KVxuICAgICAgICAgICAgICAgIGltYWdlVHlwZSA9IHBhdGguZXh0bmFtZShzcmMpLnNsaWNlKDEpXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICBiYXNlNjQgPSBuZXcgQnVmZmVyKGZzLnJlYWRGaWxlU3luYyhzcmMpKS50b1N0cmluZygnYmFzZTY0JylcblxuICAgICAgICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgXCJkYXRhOmltYWdlLyN7aW1hZ2VUeXBlfTtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwje2Jhc2U2NH1cIilcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgICAgICAgdGhyb3cgJ0ltYWdlIGZpbGUgbm90IGZvdW5kOiAnICsgc3JjXG5cbiAgICAgICAgICAjIHJldHJpZXZlIGh0bWxcbiAgICAgICAgICBvdXRwdXRIVE1MID0gZGl2LmlubmVySFRNTFxuXG4gICAgICAgICAgdGl0bGUgPSBlYm9va0NvbmZpZy50aXRsZSBvciAnbm8gdGl0bGUnXG5cbiAgICAgICAgICBtYXRoU3R5bGUgPSAnJ1xuICAgICAgICAgIGlmIG91dHB1dEhUTUwuaW5kZXhPZignY2xhc3M9XCJrYXRleFwiJykgPiAwXG4gICAgICAgICAgICBpZiBwYXRoLmV4dG5hbWUoZGVzdCkgPT0gJy5odG1sJyBhbmQgZWJvb2tDb25maWcuaHRtbD8uY2RuXG4gICAgICAgICAgICAgIG1hdGhTdHlsZSA9IFwiPGxpbmsgcmVsPVxcXCJzdHlsZXNoZWV0XFxcIiBocmVmPVxcXCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9LYVRlWC8wLjcuMS9rYXRleC5taW4uY3NzXFxcIj5cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj1cXFwiZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9ub2RlX21vZHVsZXMva2F0ZXgvZGlzdC9rYXRleC5taW4uY3NzJyl9XFxcIj5cIlxuXG4gICAgICAgICAgIyBvbmx5IHVzZSBnaXRodWIgc3R5bGUgZm9yIGVib29rXG4gICAgICAgICAgbG9hZFByZXZpZXdUaGVtZSAnbXBlLWdpdGh1Yi1zeW50YXgnLCBmYWxzZSwgKGVycm9yLCBjc3MpPT5cbiAgICAgICAgICAgIGNzcyA9ICcnIGlmIGVycm9yXG4gICAgICAgICAgICBvdXRwdXRIVE1MID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbD5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDx0aXRsZT4je3RpdGxlfTwvdGl0bGU+XG4gICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVxcXCJ1dGYtOFxcXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVxcXCJ2aWV3cG9ydFxcXCIgY29udGVudD1cXFwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFxcXCI+XG5cbiAgICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICN7Y3NzfVxuICAgICAgICAgICAgPC9zdHlsZT5cblxuICAgICAgICAgICAgI3ttYXRoU3R5bGV9XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5IGNsYXNzPVxcXCJtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkXFxcIj5cbiAgICAgICAgICAje291dHB1dEhUTUx9XG4gICAgICAgICAgPC9ib2R5PlxuICAgICAgICA8L2h0bWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGRlc3QpXG5cbiAgICAgICAgICAgICMgc2F2ZSBhcyBodG1sXG4gICAgICAgICAgICBpZiBwYXRoLmV4dG5hbWUoZGVzdCkgPT0gJy5odG1sJ1xuICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgZGVzdCwgb3V0cHV0SFRNTCwgKGVycik9PlxuICAgICAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIkZpbGUgI3tmaWxlTmFtZX0gd2FzIGNyZWF0ZWRcIiwgZGV0YWlsOiBcInBhdGg6ICN7ZGVzdH1cIilcbiAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICMgdGhpcyBmdW5jIHdpbGwgYmUgY2FsbGVkIGxhdGVyXG4gICAgICAgICAgICBkZWxldGVEb3dubG9hZGVkSW1hZ2VzID0gKCktPlxuICAgICAgICAgICAgICBkb3dubG9hZGVkSW1hZ2VQYXRocy5mb3JFYWNoIChpbWFnZVBhdGgpLT5cbiAgICAgICAgICAgICAgICBmcy51bmxpbmsoaW1hZ2VQYXRoKVxuXG4gICAgICAgICAgICAjIHVzZSBlYm9vay1jb252ZXJ0IHRvIGdlbmVyYXRlIGVQdWIsIG1vYmksIFBERi5cbiAgICAgICAgICAgIHRlbXAub3BlblxuICAgICAgICAgICAgICBwcmVmaXg6ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkJyxcbiAgICAgICAgICAgICAgc3VmZml4OiAnLmh0bWwnLCAoZXJyLCBpbmZvKT0+XG4gICAgICAgICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICAgICAgICBkZWxldGVEb3dubG9hZGVkSW1hZ2VzKClcbiAgICAgICAgICAgICAgICAgIHRocm93IGVyclxuXG4gICAgICAgICAgICAgICAgZnMud3JpdGUgaW5mby5mZCwgb3V0cHV0SFRNTCwgKGVycik9PlxuICAgICAgICAgICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURvd25sb2FkZWRJbWFnZXMoKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJcblxuICAgICAgICAgICAgICAgICAgZWJvb2tDb252ZXJ0IGluZm8ucGF0aCwgZGVzdCwgZWJvb2tDb25maWcsIChlcnIpPT5cbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlRG93bmxvYWRlZEltYWdlcygpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJGaWxlICN7ZmlsZU5hbWV9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje2Rlc3R9XCJcblxuICBwYW5kb2NEb2N1bWVudEV4cG9ydDogLT5cbiAgICB7ZGF0YX0gPSBAcHJvY2Vzc0Zyb250TWF0dGVyKEBlZGl0b3IuZ2V0VGV4dCgpKVxuXG4gICAgY29udGVudCA9IEBlZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuICAgIGlmIGNvbnRlbnQuc3RhcnRzV2l0aCgnLS0tXFxuJylcbiAgICAgIGVuZCA9IGNvbnRlbnQuaW5kZXhPZignLS0tXFxuJywgNClcbiAgICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKGVuZCs0KVxuXG4gICAgcGFuZG9jQ29udmVydCBjb250ZW50LCB7QGZpbGVEaXJlY3RvcnlQYXRoLCBAcHJvamVjdERpcmVjdG9yeVBhdGgsIHNvdXJjZUZpbGVQYXRoOiBAZWRpdG9yLmdldFBhdGgoKX0sIGRhdGEsIChlcnIsIG91dHB1dEZpbGVQYXRoKS0+XG4gICAgICBpZiBlcnJcbiAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciAncGFuZG9jIGVycm9yJywgZGV0YWlsOiBlcnJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiRmlsZSAje3BhdGguYmFzZW5hbWUob3V0cHV0RmlsZVBhdGgpfSB3YXMgY3JlYXRlZFwiLCBkZXRhaWw6IFwicGF0aDogI3tvdXRwdXRGaWxlUGF0aH1cIlxuXG4gIHNhdmVBc01hcmtkb3duOiAoKS0+XG4gICAge2RhdGF9ID0gQHByb2Nlc3NGcm9udE1hdHRlcihAZWRpdG9yLmdldFRleHQoKSlcbiAgICBkYXRhID0gZGF0YSBvciB7fVxuXG4gICAgY29udGVudCA9IEBlZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuICAgIGlmIGNvbnRlbnQuc3RhcnRzV2l0aCgnLS0tXFxuJylcbiAgICAgIGVuZCA9IGNvbnRlbnQuaW5kZXhPZignLS0tXFxuJywgNClcbiAgICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKGVuZCs0KVxuXG4gICAgY29uZmlnID0gZGF0YS5tYXJrZG93biBvciB7fVxuICAgIGlmICFjb25maWcuaW1hZ2VfZGlyXG4gICAgICBjb25maWcuaW1hZ2VfZGlyID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmltYWdlRm9sZGVyUGF0aCcpXG5cbiAgICBpZiAhY29uZmlnLnBhdGhcbiAgICAgIGNvbmZpZy5wYXRoID0gcGF0aC5iYXNlbmFtZShAZWRpdG9yLmdldFBhdGgoKSkucmVwbGFjZSgvXFwubWQkLywgJ18ubWQnKVxuXG4gICAgaWYgY29uZmlnLmZyb250X21hdHRlclxuICAgICAgY29udGVudCA9IG1hdHRlci5zdHJpbmdpZnkoY29udGVudCwgY29uZmlnLmZyb250X21hdHRlcilcblxuICAgIG1hcmtkb3duQ29udmVydCBjb250ZW50LCB7QHByb2plY3REaXJlY3RvcnlQYXRoLCBAZmlsZURpcmVjdG9yeVBhdGh9LCBjb25maWdcblxuICBjb3B5VG9DbGlwYm9hcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBAZWRpdG9yXG5cbiAgICBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2VsZWN0ZWRUZXh0KVxuICAgIHRydWVcblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG4gICAgQGVkaXRvciA9IG51bGxcblxuICAgIGlmIEBkaXNwb3NhYmxlc1xuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gICAgaWYgQHNldHRpbmdzRGlzcG9zYWJsZXNcbiAgICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgQHNldHRpbmdzRGlzcG9zYWJsZXMgPSBudWxsXG5cbiAgICAjIGNsZWFyIENBQ0hFXG4gICAgZm9yIGtleSBvZiBDQUNIRVxuICAgICAgZGVsZXRlKENBQ0hFW2tleV0pXG5cbiAgICBAbWFpbk1vZHVsZS5wcmV2aWV3ID0gbnVsbCAjIHVuYmluZFxuXG4gIGdldEVsZW1lbnQ6IC0+XG4gICAgQGVsZW1lbnRcbiJdfQ==
