(function() {
  var $, $$$, CACHE, CompositeDisposable, Directory, Emitter, File, MarkdownPreviewEnhancedView, ScrollView, allowUnsafeEval, allowUnsafeNewFunction, async, cheerio, codeChunkAPI, ebookConvert, exec, fs, katex, loadMathJax, loadPreviewTheme, markdownConvert, matter, pandocConvert, path, pdf, plantumlAPI, princeConvert, protocolsWhiteListRegExp, ref, ref1, ref2, request, temp,
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

  async = null;

  request = null;

  loadPreviewTheme = require('./style').loadPreviewTheme;

  plantumlAPI = require('./puml');

  ebookConvert = require('./ebook-convert');

  loadMathJax = require('./mathjax-wrapper').loadMathJax;

  pandocConvert = require('./pandoc-convert').pandocConvert;

  markdownConvert = require('./markdown-convert');

  princeConvert = require('./prince-convert');

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
      this.presentationZoom = 1;
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
            return loadPreviewTheme(previewTheme, {
              changeStyleElement: true
            }, function() {
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
          var editorHeight, firstVisibleScreenRow, lastVisibleScreenRow, lineNo, targetPos;
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
          targetPos = _this.scrollMap[lineNo] - editorHeight / 2;

          /*
           * Doesn't work very well
          if @presentationMode
            targetPos = targetPos * @presentationZoom
           */
          if (lineNo in _this.scrollMap) {
            return _this.scrollToPos(targetPos);
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
          if (!_this.editor || !_this.scrollSync || _this.textChanged) {
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
          if (_this.presentationMode) {
            top = top / _this.presentationZoom;
          }
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
            _this.scrollMap = null;
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
          return plantumlAPI.render(text, _this.fileDirectoryPath, function(outputHTML) {
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
      var embedLocalImages, isForPrince, isForPrint, mathRenderingOption, offline, phantomjsType, res, useRelativeImagePath;
      isForPrint = arg.isForPrint, offline = arg.offline, useRelativeImagePath = arg.useRelativeImagePath, phantomjsType = arg.phantomjsType, isForPrince = arg.isForPrince, embedLocalImages = arg.embedLocalImages;
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
      if (isForPrince == null) {
        isForPrince = false;
      }
      if (embedLocalImages == null) {
        embedLocalImages = false;
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
          var asyncFunctions, block, dependencies, html, htmlContent, i, inline, mathJaxProcessEnvironments, mathStyle, phantomjsClass, presentationConfig, presentationInitScript, presentationScript, presentationStyle, previewTheme, princeClass, slideConfigs, styleElem, styleElements, styleLess, title, userStyleSheetPath, yamlConfig;
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
          phantomjsClass = '';
          if (phantomjsType) {
            if (phantomjsType === '.pdf') {
              phantomjsClass = 'phantomjs-pdf';
            } else if (phantomjsType === '.png' || phantomjsType === '.jpeg') {
              phantomjsClass = 'phantomjs-image';
            }
          }
          princeClass = '';
          if (isForPrince) {
            princeClass = 'prince';
          }
          title = _this.getFileName();
          title = title.slice(0, title.length - path.extname(title).length);
          previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
          if (isForPrint && atom.config.get('markdown-preview-enhanced.pdfUseGithub')) {
            previewTheme = 'mpe-github-syntax';
          }
          styleLess = '';
          userStyleSheetPath = atom.styles.getUserStyleSheetPath();
          styleElements = atom.styles.getStyleElements();
          i = styleElements.length - 1;
          while (i >= 0) {
            styleElem = styleElements[i];
            if (styleElem.getAttribute('source-path') === userStyleSheetPath) {
              styleLess = styleElem.innerHTML;
              break;
            }
            i -= 1;
          }
          loadPreviewTheme(previewTheme, {
            changeStyleElement: false
          }, function(error, css) {
            if (error) {
              return callback("<pre>" + error + "</pre>");
            }
            return html = "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\n    " + presentationStyle + "\n\n    <style>\n    " + css + "\n    " + styleLess + "\n    </style>\n\n    " + mathStyle + "\n\n    " + presentationScript + "\n  </head>\n  <body class=\"markdown-preview-enhanced " + phantomjsClass + " " + princeClass + "\" " + (_this.presentationMode ? 'data-presentation-mode' : '') + ">\n\n  " + htmlContent + "\n\n  </body>\n  " + presentationInitScript + "\n</html>";
          });
          if (embedLocalImages) {
            if (cheerio == null) {
              cheerio = require('cheerio');
            }
            if (async == null) {
              async = require('async');
            }
            asyncFunctions = [];
            $ = cheerio.load(html);
            $('img').each(function(i, img) {
              var $img, imageType, src;
              $img = $(img);
              src = $img.attr('src');
              if (src.startsWith('file:///')) {
                src = src.slice(8);
                src = src.replace(/\?(\.|\d)+$/, '');
                imageType = path.extname(src).slice(1);
                return asyncFunctions.push(function(cb) {
                  return fs.readFile(src, function(error, data) {
                    var base64;
                    if (error) {
                      return cb();
                    }
                    base64 = new Buffer(data).toString('base64');
                    $img.attr('src', "data:image/" + imageType + ";charset=utf-8;base64," + base64);
                    return cb();
                  });
                });
              }
            });
            return async.parallel(asyncFunctions, function() {
              return callback($.html());
            });
          } else {
            return callback(html);
          }
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

    MarkdownPreviewEnhancedView.prototype.saveAsHTML = function(dest, offline, useRelativeImagePath, embedLocalImages) {
      if (offline == null) {
        offline = true;
      }
      if (!this.editor) {
        return;
      }
      return this.getHTMLContent({
        isForPrint: false,
        offline: offline,
        useRelativeImagePath: useRelativeImagePath,
        embedLocalImages: embedLocalImages
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
      var height, iframeString, k, len, loop_, muted_, offset, output, presentationConfig, slide, slideConfig, slides, styleString, videoLoop, videoMuted, videoString, width, zoom;
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
      zoom = (this.element.offsetWidth - 128) / width;
      this.presentationZoom = zoom;
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

    MarkdownPreviewEnhancedView.prototype.princeExport = function(dest) {
      if (!this.editor) {
        return;
      }
      atom.notifications.addInfo('Your document is being prepared', {
        detail: ':)'
      });
      return this.getHTMLContent({
        offline: true,
        isForPrint: true,
        isForPrince: true
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
              if (_this.presentationMode) {
                url = 'file:///' + info.path + '?print-pdf';
                return atom.notifications.addInfo('Please copy and open the link below in Chrome.\nThen Right Click -> Print -> Save as Pdf.', {
                  dismissable: true,
                  detail: url
                });
              } else {
                return princeConvert(info.path, dest, function(err) {
                  if (err) {
                    throw err;
                  }
                  atom.notifications.addInfo("File " + (path.basename(dest)) + " was created", {
                    detail: "path: " + dest
                  });
                  if (atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically')) {
                    return _this.openFile(dest);
                  }
                });
              }
            });
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
          var asyncFunctions, children, cover, div, ebookConfig, error, filePath, getStructure, heading, headingOffset, html, i, id, imagesToDownload, img, k, l, len, len1, level, obj, outputHTML, ref3, ref4, src, structure, text, yamlConfig;
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
            if (request == null) {
              request = require('request');
            }
            if (async == null) {
              async = require('async');
            }
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
                    src = src.replace(/\?(\.|\d)+$/, '');
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
              return loadPreviewTheme('mpe-github-syntax', {
                changeStyleElement: false
              }, function(error, css) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtWEFBQTtJQUFBOzs7RUFBQSxNQUFrRCxPQUFBLENBQVEsTUFBUixDQUFsRCxFQUFDLHFCQUFELEVBQVUsNkNBQVYsRUFBK0IsZUFBL0IsRUFBcUM7O0VBQ3JDLE9BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLFVBQUQsRUFBSSxjQUFKLEVBQVM7O0VBQ1QsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ04sT0FBUSxPQUFBLENBQVEsZUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFVBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsYUFBUjs7RUFDVCxPQUE0QyxPQUFBLENBQVEsVUFBUixDQUE1QyxFQUFDLHNDQUFELEVBQWtCOztFQUNsQixPQUFBLEdBQVU7O0VBQ1YsS0FBQSxHQUFROztFQUNSLE9BQUEsR0FBVTs7RUFFVCxtQkFBb0IsT0FBQSxDQUFRLFNBQVI7O0VBQ3JCLFdBQUEsR0FBYyxPQUFBLENBQVEsUUFBUjs7RUFDZCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNkLGNBQWUsT0FBQSxDQUFRLG1CQUFSOztFQUNmLGdCQUFpQixPQUFBLENBQVEsa0JBQVI7O0VBQ2xCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFDaEIsWUFBQSxHQUFlLE9BQUEs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LEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFFVixJQUFHLElBQUMsQ0FBQSxXQUFKO1FBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7UUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEtBRmpCOztNQUlBLElBQUcsSUFBQyxDQUFBLG1CQUFKO1FBQ0UsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE9BQXJCLENBQUE7UUFDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGekI7O0FBS0EsV0FBQSxZQUFBO1FBQ0UsT0FBTyxLQUFNLENBQUEsR0FBQTtBQURmO2FBR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLEdBQXNCO0lBaEJmOzswQ0FrQlQsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUE7SUFEUzs7OztLQWw3RDRCO0FBMUIxQyIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBGaWxlLCBEaXJlY3Rvcnl9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCAkJCQsIFNjcm9sbFZpZXd9ICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xudGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpXG57ZXhlY30gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xucGRmID0gcmVxdWlyZSAnaHRtbC1wZGYnXG5rYXRleCA9IHJlcXVpcmUgJ2thdGV4J1xubWF0dGVyID0gcmVxdWlyZSgnZ3JheS1tYXR0ZXInKVxue2FsbG93VW5zYWZlRXZhbCwgYWxsb3dVbnNhZmVOZXdGdW5jdGlvbn0gPSByZXF1aXJlICdsb29waG9sZSdcbmNoZWVyaW8gPSBudWxsXG5hc3luYyA9IG51bGxcbnJlcXVlc3QgPSBudWxsXG5cbntsb2FkUHJldmlld1RoZW1lfSA9IHJlcXVpcmUgJy4vc3R5bGUnXG5wbGFudHVtbEFQSSA9IHJlcXVpcmUgJy4vcHVtbCdcbmVib29rQ29udmVydCA9IHJlcXVpcmUgJy4vZWJvb2stY29udmVydCdcbntsb2FkTWF0aEpheH0gPSByZXF1aXJlICcuL21hdGhqYXgtd3JhcHBlcidcbntwYW5kb2NDb252ZXJ0fSA9IHJlcXVpcmUgJy4vcGFuZG9jLWNvbnZlcnQnXG5tYXJrZG93bkNvbnZlcnQgPSByZXF1aXJlICcuL21hcmtkb3duLWNvbnZlcnQnXG5wcmluY2VDb252ZXJ0ID0gcmVxdWlyZSAnLi9wcmluY2UtY29udmVydCdcbmNvZGVDaHVua0FQSSA9IHJlcXVpcmUgJy4vY29kZS1jaHVuaydcbkNBQ0hFID0gcmVxdWlyZSAnLi9jYWNoZSdcbntwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHB9ID0gcmVxdWlyZSAnLi9wcm90b2NvbHMtd2hpdGVsaXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNYXJrZG93blByZXZpZXdFbmhhbmNlZFZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIGNvbnN0cnVjdG9yOiAodXJpLCBtYWluTW9kdWxlKS0+XG4gICAgc3VwZXJcblxuICAgIEB1cmkgPSB1cmlcbiAgICBAbWFpbk1vZHVsZSA9IG1haW5Nb2R1bGVcbiAgICBAcHJvdG9jYWwgPSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDovLydcbiAgICBAZWRpdG9yID0gbnVsbFxuXG4gICAgQHRvY0NvbmZpZ3MgPSBudWxsXG4gICAgQHNjcm9sbE1hcCA9IG51bGxcbiAgICBAZmlsZURpcmVjdG9yeVBhdGggPSBudWxsXG4gICAgQHByb2plY3REaXJlY3RvcnlQYXRoID0gbnVsbFxuXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gICAgQGxpdmVVcGRhdGUgPSB0cnVlXG4gICAgQHNjcm9sbFN5bmMgPSB0cnVlXG4gICAgQHNjcm9sbER1cmF0aW9uID0gbnVsbFxuICAgIEB0ZXh0Q2hhbmdlZCA9IGZhbHNlXG4gICAgQHVzZVBhbmRvY1BhcnNlciA9IGZhbHNlXG5cbiAgICBAbWF0aFJlbmRlcmluZ09wdGlvbiA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXRoUmVuZGVyaW5nT3B0aW9uJylcbiAgICBAbWF0aFJlbmRlcmluZ09wdGlvbiA9IGlmIEBtYXRoUmVuZGVyaW5nT3B0aW9uID09ICdOb25lJyB0aGVuIG51bGwgZWxzZSBAbWF0aFJlbmRlcmluZ09wdGlvblxuICAgIEBtYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cycpXG5cbiAgICBAcGFyc2VEZWxheSA9IERhdGUubm93KClcbiAgICBAZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpXG4gICAgQHByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KClcblxuICAgIEBkb2N1bWVudEV4cG9ydGVyVmlldyA9IG51bGwgIyBiaW5kZWQgaW4gbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5jb2ZmZWUgc3RhcnRNRCBmdW5jdGlvblxuXG4gICAgIyB0aGlzIHR3byB2YXJpYWJsZXMgd2lsbCBiZSBnb3QgZnJvbSAnLi9tZCdcbiAgICBAcGFyc2VNRCA9IG51bGxcbiAgICBAYnVpbGRTY3JvbGxNYXAgPSBudWxsXG4gICAgQHByb2Nlc3NGcm9udE1hdHRlciA9IG51bGxcblxuICAgICMgdGhpcyB2YXJpYWJsZSB3aWxsIGJlIGdvdCBmcm9tICd2aXouanMnXG4gICAgQFZpeiA9IG51bGxcblxuICAgICMgdGhpcyB2YXJpYWJsZSB3aWxsIGNoZWNrIGlmIGl0IGlzIHRoZSBmaXJzdCB0aW1lIHRvIHJlbmRlciBtYXJrZG93blxuICAgIEBmaXJzdFRpbWVSZW5kZXJNYXJrZG93b24gPSB0cnVlXG5cbiAgICAjIHByZXNlbnRhdGlvbiBtb2RlXG4gICAgQHByZXNlbnRhdGlvbk1vZGUgPSBmYWxzZVxuICAgIEBwcmVzZW50YXRpb25ab29tID0gMVxuICAgIEBzbGlkZUNvbmZpZ3MgPSBudWxsXG5cbiAgICAjIGdyYXBoIGRhdGEgdXNlZCB0byBzYXZlIHJlbmRlcmVkIGdyYXBoc1xuICAgIEBncmFwaERhdGEgPSBudWxsXG4gICAgQGNvZGVDaHVua3NEYXRhID0ge31cblxuICAgICMgZmlsZXMgY2FjaGUgZm9yIGRvY3VtZW50IGltcG9ydFxuICAgIEBmaWxlc0NhY2hlID0ge31cblxuICAgICMgd2hlbiByZXNpemUgdGhlIHdpbmRvdywgY2xlYXIgdGhlIGVkaXRvclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCBAcmVzaXplRXZlbnQuYmluZCh0aGlzKVxuXG4gICAgIyByaWdodCBjbGljayBldmVudFxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6b3Blbi1pbi1icm93c2VyJzogPT4gQG9wZW5JbkJyb3dzZXIoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6ZXhwb3J0LXRvLWRpc2snOiA9PiBAZXhwb3J0VG9EaXNrKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnBhbmRvYy1kb2N1bWVudC1leHBvcnQnOiA9PiBAcGFuZG9jRG9jdW1lbnRFeHBvcnQoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6c2F2ZS1hcy1tYXJrZG93bic6ID0+IEBzYXZlQXNNYXJrZG93bigpXG4gICAgICAnY29yZTpjb3B5JzogPT4gQGNvcHlUb0NsaXBib2FyZCgpXG5cbiAgICAjIGluaXQgc2V0dGluZ3NcbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAaW5pdFNldHRpbmdzRXZlbnRzKClcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBuYXRpdmUta2V5LWJpbmRpbmdzJywgdGFiaW5kZXg6IC0xLCBzdHlsZTogXCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyBwYWRkaW5nOiAzMnB4OyBjb2xvcjogIzIyMjtcIiwgPT5cbiAgICAgICMgQHAgc3R5bGU6ICdmb250LXNpemU6IDI0cHgnLCAnbG9hZGluZyBwcmV2aWV3Li4uJ1xuICAgICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi1zcGlubmVyXCIsICdMb2FkaW5nIE1hcmtkb3duXFx1MjAyNidcblxuICBnZXRUaXRsZTogLT5cbiAgICBAZ2V0RmlsZU5hbWUoKSArICcgcHJldmlldydcblxuICBnZXRGaWxlTmFtZTogLT5cbiAgICBpZiBAZWRpdG9yXG4gICAgICBAZWRpdG9yLmdldEZpbGVOYW1lKClcbiAgICBlbHNlXG4gICAgICAndW5rbm93bidcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICAnbWFya2Rvd24nXG5cbiAgZ2V0VVJJOiAtPlxuICAgIEB1cmlcblxuICBnZXRQcm9qZWN0RGlyZWN0b3J5UGF0aDogLT5cbiAgICBpZiAhQGVkaXRvclxuICAgICAgcmV0dXJuICcnXG5cbiAgICBlZGl0b3JQYXRoID0gQGVkaXRvci5nZXRQYXRoKClcbiAgICBwcm9qZWN0RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3Qucm9vdERpcmVjdG9yaWVzXG4gICAgZm9yIHByb2plY3REaXJlY3RvcnkgaW4gcHJvamVjdERpcmVjdG9yaWVzXG4gICAgICBpZiAocHJvamVjdERpcmVjdG9yeS5jb250YWlucyhlZGl0b3JQYXRoKSkgIyBlZGl0b3IgYmVsb25ncyB0byB0aGlzIHByb2plY3RcbiAgICAgICAgcmV0dXJuIHByb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpXG5cbiAgICByZXR1cm4gJydcblxuICBzZXRUYWJUaXRsZTogKHRpdGxlKS0+XG4gICAgdGFiVGl0bGUgPSAkKCdbZGF0YS10eXBlPVwiTWFya2Rvd25QcmV2aWV3RW5oYW5jZWRWaWV3XCJdIGRpdi50aXRsZScpXG4gICAgaWYgdGFiVGl0bGUubGVuZ3RoXG4gICAgICB0YWJUaXRsZVswXS5pbm5lclRleHQgPSB0aXRsZVxuXG4gIHVwZGF0ZVRhYlRpdGxlOiAtPlxuICAgIEBzZXRUYWJUaXRsZShAZ2V0VGl0bGUoKSlcblxuICBzZXRNZXJtYWlkVGhlbWU6IChtZXJtYWlkVGhlbWUpLT5cbiAgICBtZXJtYWlkVGhlbWVTdHlsZSA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL21lcm1haWQvJyttZXJtYWlkVGhlbWUpLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KS50b1N0cmluZygpXG4gICAgbWVybWFpZFN0eWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lcm1haWQtc3R5bGUnKVxuXG4gICAgaWYgbWVybWFpZFN0eWxlXG4gICAgICBtZXJtYWlkU3R5bGUucmVtb3ZlKClcblxuICAgIG1lcm1haWRTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBtZXJtYWlkU3R5bGUuaWQgPSAnbWVybWFpZC1zdHlsZSdcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKG1lcm1haWRTdHlsZSlcblxuICAgIG1lcm1haWRTdHlsZS5pbm5lckhUTUwgPSBtZXJtYWlkVGhlbWVTdHlsZVxuXG4gICAgIyByZW5kZXIgbWVybWFpZCBncmFwaHMgYWdhaW5cbiAgICAjIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lcm1haWQnKVxuICAgIEBncmFwaERhdGE/Lm1lcm1haWRfcyA9IFtdXG4gICAgQHJlbmRlck1hcmtkb3duKClcblxuICBiaW5kRWRpdG9yOiAoZWRpdG9yKS0+XG4gICAgaWYgbm90IEBlZGl0b3JcbiAgICAgIGF0b20ud29ya3NwYWNlXG4gICAgICAgICAgLm9wZW4gQHVyaSxcbiAgICAgICAgICAgICAgICBzcGxpdDogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiBmYWxzZVxuICAgICAgICAgIC50aGVuIChlKT0+XG4gICAgICAgICAgICBwcmV2aWV3VGhlbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJldmlld1RoZW1lJylcbiAgICAgICAgICAgIGxvYWRQcmV2aWV3VGhlbWUgcHJldmlld1RoZW1lLCB7Y2hhbmdlU3R5bGVFbGVtZW50OiB0cnVlfSwgKCk9PlxuICAgICAgICAgICAgICBAaW5pdEV2ZW50cyhlZGl0b3IpXG5cbiAgICBlbHNlXG4gICAgICAjIHNhdmUgY2FjaGVcbiAgICAgIENBQ0hFW0BlZGl0b3IuZ2V0UGF0aCgpXSA9IHtcbiAgICAgICAgaHRtbDogQGVsZW1lbnQ/LmlubmVySFRNTCBvciAnJyxcbiAgICAgICAgY29kZUNodW5rc0RhdGE6IEBjb2RlQ2h1bmtzRGF0YSxcbiAgICAgICAgZ3JhcGhEYXRhOiBAZ3JhcGhEYXRhLFxuICAgICAgICBwcmVzZW50YXRpb25Nb2RlOiBAcHJlc2VudGF0aW9uTW9kZSxcbiAgICAgICAgc2xpZGVDb25maWdzOiBAc2xpZGVDb25maWdzLFxuICAgICAgICBmaWxlc0NhY2hlOiBAZmlsZXNDYWNoZSxcbiAgICAgIH1cblxuICAgICAgIyBAZWxlbWVudC5pbm5lckhUTUwgPSAnPHAgc3R5bGU9XCJmb250LXNpemU6IDI0cHg7XCI+IGxvYWRpbmcgcHJldmlldy4uLiA8YnI+dHlwZSBzb21ldGhpbmcgaWYgcHJldmlldyBkb2VzblxcJ3QgcmVuZGVyIDooIDwvcD4nXG5cbiAgICAgIHNldFRpbWVvdXQoKCk9PlxuICAgICAgICBAaW5pdEV2ZW50cyhlZGl0b3IpXG4gICAgICAsIDApXG5cbiAgaW5pdEV2ZW50czogKGVkaXRvciktPlxuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBAdXBkYXRlVGFiVGl0bGUoKVxuICAgIEBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKVxuXG4gICAgaWYgbm90IEBwYXJzZU1EXG4gICAgICB7QHBhcnNlTUQsIEBidWlsZFNjcm9sbE1hcCwgQHByb2Nlc3NGcm9udE1hdHRlcn0gPSByZXF1aXJlICcuL21kJ1xuICAgICAgcmVxdWlyZSAnLi4vZGVwZW5kZW5jaWVzL3dhdmVkcm9tL2RlZmF1bHQuanMnXG4gICAgICByZXF1aXJlICcuLi9kZXBlbmRlbmNpZXMvd2F2ZWRyb20vd2F2ZWRyb20ubWluLmpzJ1xuXG4gICAgQHRvY0NvbmZpZ3MgPSBudWxsXG4gICAgQHNjcm9sbE1hcCA9IG51bGxcbiAgICBAZmlsZURpcmVjdG9yeVBhdGggPSBAZWRpdG9yLmdldERpcmVjdG9yeVBhdGgoKVxuICAgIEBwcm9qZWN0RGlyZWN0b3J5UGF0aCA9IEBnZXRQcm9qZWN0RGlyZWN0b3J5UGF0aCgpXG4gICAgQGZpcnN0VGltZVJlbmRlck1hcmtkb3dvbiA9IHRydWVcbiAgICBAZmlsZXNDYWNoZSA9IHt9XG5cbiAgICBpZiBAZGlzcG9zYWJsZXMgIyByZW1vdmUgYWxsIGJpbmRlZCBldmVudHNcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAaW5pdEVkaXRvckV2ZW50KClcbiAgICBAaW5pdFZpZXdFdmVudCgpXG5cbiAgICAjIHJlc3RvcmUgcHJldmlld1xuICAgIGQgPSBDQUNIRVtAZWRpdG9yLmdldFBhdGgoKV1cbiAgICBpZiBkXG4gICAgICBAZWxlbWVudC5pbm5lckhUTUwgPSBkLmh0bWxcbiAgICAgIEBncmFwaERhdGEgPSBkLmdyYXBoRGF0YVxuICAgICAgQGNvZGVDaHVua3NEYXRhID0gZC5jb2RlQ2h1bmtzRGF0YVxuICAgICAgQHByZXNlbnRhdGlvbk1vZGUgPSBkLnByZXNlbnRhdGlvbk1vZGVcbiAgICAgIEBzbGlkZUNvbmZpZ3MgPSBkLnNsaWRlQ29uZmlnc1xuICAgICAgQGZpbGVzQ2FjaGUgPSBkLmZpbGVzQ2FjaGVcblxuICAgICAgaWYgQHByZXNlbnRhdGlvbk1vZGVcbiAgICAgICAgQGVsZW1lbnQuc2V0QXR0cmlidXRlICdkYXRhLXByZXNlbnRhdGlvbi1wcmV2aWV3LW1vZGUnLCAnJ1xuICAgICAgZWxzZVxuICAgICAgICBAZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUgJ2RhdGEtcHJlc2VudGF0aW9uLXByZXZpZXctbW9kZSdcblxuICAgICAgQHNldEluaXRpYWxTY3JvbGxQb3MoKVxuICAgICAgIyBjb25zb2xlLmxvZyAncmVzdG9yZSAnICsgQGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgIyByZXNldCBiYWNrIHRvIHRvcCBidXR0b24gb25jbGljayBldmVudFxuICAgICAgQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYmFjay10by10b3AtYnRuJyk/WzBdPy5vbmNsaWNrID0gKCk9PlxuICAgICAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSAwXG5cbiAgICAgICMgcmVzZXQgcmVmcmVzaCBidXR0b24gb25jbGljayBldmVudFxuICAgICAgQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmVmcmVzaC1idG4nKT9bMF0/Lm9uY2xpY2sgPSAoKT0+XG4gICAgICAgIEBmaWxlc0NhY2hlID0ge31cbiAgICAgICAgY29kZUNodW5rQVBJLmNsZWFyQ2FjaGUoKVxuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAjIHJlYmluZCB0YWcgYSBjbGljayBldmVudFxuICAgICAgQGJpbmRUYWdBQ2xpY2tFdmVudCgpXG5cbiAgICAgICMgcmVuZGVyIHBsYW50dW1sIGluIGNhc2VcbiAgICAgIEByZW5kZXJQbGFudFVNTCgpXG5cbiAgICAgICMgcmVzZXQgY29kZSBjaHVua3NcbiAgICAgIEBzZXR1cENvZGVDaHVua3MoKVxuICAgIGVsc2VcbiAgICAgIEByZW5kZXJNYXJrZG93bigpXG4gICAgQHNjcm9sbE1hcCA9IG51bGxcblxuICBpbml0RWRpdG9yRXZlbnQ6IC0+XG4gICAgZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ICgpPT5cbiAgICAgIEBzZXRUYWJUaXRsZSgndW5rbm93biBwcmV2aWV3JylcbiAgICAgIGlmIEBkaXNwb3NhYmxlc1xuICAgICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcbiAgICAgIEBlZGl0b3IgPSBudWxsXG4gICAgICBAZWxlbWVudC5vbnNjcm9sbCA9IG51bGxcblxuICAgICAgQGVsZW1lbnQuaW5uZXJIVE1MID0gJzxwIHN0eWxlPVwiZm9udC1zaXplOiAyNHB4O1wiPiBPcGVuIGEgbWFya2Rvd24gZmlsZSB0byBzdGFydCBwcmV2aWV3IDwvcD4nXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCk9PlxuICAgICAgIyBAdGV4dENoYW5nZWQgPSB0cnVlICMgdGhpcyBsaW5lIGhhcyBwcm9ibGVtLlxuICAgICAgaWYgQGxpdmVVcGRhdGUgYW5kICFAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB1cGRhdGVNYXJrZG93bigpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTYXZlICgpPT5cbiAgICAgIGlmIG5vdCBAbGl2ZVVwZGF0ZSBvciBAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB0ZXh0Q2hhbmdlZCA9IHRydWVcbiAgICAgICAgQHVwZGF0ZU1hcmtkb3duKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZU1vZGlmaWVkICgpPT5cbiAgICAgIGlmIG5vdCBAbGl2ZVVwZGF0ZSBvciBAdXNlUGFuZG9jUGFyc2VyXG4gICAgICAgIEB0ZXh0Q2hhbmdlZCA9IHRydWVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCAoKT0+XG4gICAgICBpZiAhQHNjcm9sbFN5bmMgb3IgIUBlbGVtZW50IG9yIEB0ZXh0Q2hhbmdlZCBvciAhQGVkaXRvciBvciBAcHJlc2VudGF0aW9uTW9kZVxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAZWRpdG9yU2Nyb2xsRGVsYXlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGVkaXRvckhlaWdodCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpLmdldEhlaWdodCgpXG5cbiAgICAgIGZpcnN0VmlzaWJsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGxhc3RWaXNpYmxlU2NyZWVuUm93ID0gZmlyc3RWaXNpYmxlU2NyZWVuUm93ICsgTWF0aC5mbG9vcihlZGl0b3JIZWlnaHQgLyBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKVxuXG4gICAgICBsaW5lTm8gPSBNYXRoLmZsb29yKChmaXJzdFZpc2libGVTY3JlZW5Sb3cgKyBsYXN0VmlzaWJsZVNjcmVlblJvdykgLyAyKVxuXG4gICAgICBAc2Nyb2xsTWFwID89IEBidWlsZFNjcm9sbE1hcCh0aGlzKVxuXG4gICAgICAjIGRpc2FibGUgbWFya2Rvd25IdG1sVmlldyBvbnNjcm9sbFxuICAgICAgQHByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcblxuICAgICAgIyBzY3JvbGwgcHJldmlldyB0byBtb3N0IHRvcCBhcyBlZGl0b3IgaXMgYXQgbW9zdCB0b3AuXG4gICAgICByZXR1cm4gQHNjcm9sbFRvUG9zKDApIGlmIGZpcnN0VmlzaWJsZVNjcmVlblJvdyA9PSAwXG5cbiAgICAgIHRhcmdldFBvcyA9IEBzY3JvbGxNYXBbbGluZU5vXS1lZGl0b3JIZWlnaHQgLyAyXG4gICAgICAjIyNcbiAgICAgICMgRG9lc24ndCB3b3JrIHZlcnkgd2VsbFxuICAgICAgaWYgQHByZXNlbnRhdGlvbk1vZGVcbiAgICAgICAgdGFyZ2V0UG9zID0gdGFyZ2V0UG9zICogQHByZXNlbnRhdGlvblpvb21cbiAgICAgICMjI1xuXG4gICAgICBpZiBsaW5lTm8gb2YgQHNjcm9sbE1hcCB0aGVuIEBzY3JvbGxUb1Bvcyh0YXJnZXRQb3MpXG5cbiAgICAjIG1hdGNoIG1hcmtkb3duIHByZXZpZXcgdG8gY3Vyc29yIHBvc2l0aW9uXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KT0+XG4gICAgICBpZiAhQHNjcm9sbFN5bmMgb3IgIUBlbGVtZW50IG9yIEB0ZXh0Q2hhbmdlZFxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAcGFyc2VEZWxheVxuICAgICAgICByZXR1cm5cblxuICAgICAgIyB0cmFjayBjdXJybmV0IHRpbWUgdG8gZGlzYWJsZSBvbkRpZENoYW5nZVNjcm9sbFRvcFxuICAgICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgICAgIyBkaXNhYmxlIHByZXZpZXcgb25zY3JvbGxcbiAgICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlIGFuZCBAc2xpZGVDb25maWdzXG4gICAgICAgIHJldHVybiBAc2Nyb2xsU3luY0ZvclByZXNlbnRhdGlvbihldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3cpXG5cbiAgICAgIGlmIGV2ZW50Lm9sZFNjcmVlblBvc2l0aW9uLnJvdyAhPSBldmVudC5uZXdTY3JlZW5Qb3NpdGlvbi5yb3cgb3IgZXZlbnQub2xkU2NyZWVuUG9zaXRpb24uY29sdW1uID09IDBcbiAgICAgICAgbGluZU5vID0gZXZlbnQubmV3U2NyZWVuUG9zaXRpb24ucm93XG4gICAgICAgIGlmIGxpbmVObyA8PSAxICAjIGZpcnN0IDJuZCByb3dzXG4gICAgICAgICAgQHNjcm9sbFRvUG9zKDApXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgbGluZU5vID49IEBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgLSAyICMgbGFzdCAybmQgcm93c1xuICAgICAgICAgIEBzY3JvbGxUb1BvcyhAZWxlbWVudC5zY3JvbGxIZWlnaHQgLSAxNilcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBAc2Nyb2xsU3luY1RvTGluZU5vKGxpbmVObylcblxuICBpbml0Vmlld0V2ZW50OiAtPlxuICAgIEBlbGVtZW50Lm9uc2Nyb2xsID0gKCk9PlxuICAgICAgaWYgIUBlZGl0b3Igb3IgIUBzY3JvbGxTeW5jIG9yIEB0ZXh0Q2hhbmdlZFxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIERhdGUubm93KCkgPCBAcHJldmlld1Njcm9sbERlbGF5XG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBAZWxlbWVudC5zY3JvbGxUb3AgPT0gMCAjIG1vc3QgdG9wXG4gICAgICAgIEBlZGl0b3JTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcbiAgICAgICAgcmV0dXJuIEBzY3JvbGxUb1BvcyAwLCBAZWRpdG9yLmdldEVsZW1lbnQoKVxuXG4gICAgICB0b3AgPSBAZWxlbWVudC5zY3JvbGxUb3AgKyBAZWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyXG5cbiAgICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlXG4gICAgICAgIHRvcCA9IHRvcCAvIEBwcmVzZW50YXRpb25ab29tXG5cbiAgICAgICMgdHJ5IHRvIGZpbmQgY29ycmVzcG9uZGluZyBzY3JlZW4gYnVmZmVyIHJvd1xuICAgICAgQHNjcm9sbE1hcCA/PSBAYnVpbGRTY3JvbGxNYXAodGhpcylcblxuICAgICAgaSA9IDBcbiAgICAgIGogPSBAc2Nyb2xsTWFwLmxlbmd0aCAtIDFcbiAgICAgIGNvdW50ID0gMFxuICAgICAgc2NyZWVuUm93ID0gLTFcblxuICAgICAgd2hpbGUgY291bnQgPCAyMFxuICAgICAgICBpZiBNYXRoLmFicyh0b3AgLSBAc2Nyb2xsTWFwW2ldKSA8IDIwXG4gICAgICAgICAgc2NyZWVuUm93ID0gaVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2UgaWYgTWF0aC5hYnModG9wIC0gQHNjcm9sbE1hcFtqXSkgPCAyMFxuICAgICAgICAgIHNjcmVlblJvdyA9IGpcbiAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbWlkID0gTWF0aC5mbG9vcigoaSArIGopIC8gMilcbiAgICAgICAgICBpZiB0b3AgPiBAc2Nyb2xsTWFwW21pZF1cbiAgICAgICAgICAgIGkgPSBtaWRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBqID0gbWlkXG5cbiAgICAgICAgY291bnQrK1xuXG4gICAgICBpZiBzY3JlZW5Sb3cgPT0gLTFcbiAgICAgICAgc2NyZWVuUm93ID0gbWlkXG5cbiAgICAgIEBzY3JvbGxUb1BvcyhzY3JlZW5Sb3cgKiBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpIC0gQGVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMiwgQGVkaXRvci5nZXRFbGVtZW50KCkpXG4gICAgICAjIEBlZGl0b3IuZ2V0RWxlbWVudCgpLnNldFNjcm9sbFRvcFxuXG4gICAgICAjIHRyYWNrIGN1cnJuZXQgdGltZSB0byBkaXNhYmxlIG9uRGlkQ2hhbmdlU2Nyb2xsVG9wXG4gICAgICBAZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgaW5pdFNldHRpbmdzRXZlbnRzOiAtPlxuICAgICMgYnJlYWsgbGluZT9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5icmVha09uU2luZ2xlTmV3bGluZScsXG4gICAgICAoYnJlYWtPblNpbmdsZU5ld2xpbmUpPT5cbiAgICAgICAgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpICMgPC0gZml4ICdsb2FkaW5nIHByZXZpZXcnIHN0dWNrIGJ1Z1xuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgIyB0eXBvZ3JhcGhlcj9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVUeXBvZ3JhcGhlcicsXG4gICAgICAoZW5hYmxlVHlwb2dyYXBoZXIpPT5cbiAgICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgbGl2ZVVwZGF0ZT9cbiAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5saXZlVXBkYXRlJyxcbiAgICAgIChmbGFnKSA9PlxuICAgICAgICBAbGl2ZVVwZGF0ZSA9IGZsYWdcbiAgICAgICAgQHNjcm9sbE1hcCA9IG51bGxcblxuICAgICMgc2Nyb2xsIHN5bmM/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYycsXG4gICAgICAoZmxhZykgPT5cbiAgICAgICAgQHNjcm9sbFN5bmMgPSBmbGFnXG4gICAgICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgICAjIHNjcm9sbCBkdXJhdGlvblxuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnNjcm9sbER1cmF0aW9uJywgKGR1cmF0aW9uKT0+XG4gICAgICBkdXJhdGlvbiA9IHBhcnNlSW50KGR1cmF0aW9uKSBvciAwXG4gICAgICBpZiBkdXJhdGlvbiA8IDBcbiAgICAgICAgQHNjcm9sbER1cmF0aW9uID0gMTIwXG4gICAgICBlbHNlXG4gICAgICAgIEBzY3JvbGxEdXJhdGlvbiA9IGR1cmF0aW9uXG5cbiAgICAjIG1hdGg/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aFJlbmRlcmluZ09wdGlvbicsXG4gICAgICAob3B0aW9uKSA9PlxuICAgICAgICBAbWF0aFJlbmRlcmluZ09wdGlvbiA9IG9wdGlvblxuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gICAgIyBwYW5kb2MgcGFyc2VyP1xuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVBhbmRvY1BhcnNlcicsIChmbGFnKT0+XG4gICAgICBAdXNlUGFuZG9jUGFyc2VyID0gZmxhZ1xuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgbWVybWFpZCB0aGVtZVxuICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1lcm1haWRUaGVtZScsXG4gICAgICAodGhlbWUpID0+XG4gICAgICAgIEBzZXRNZXJtYWlkVGhlbWUgdGhlbWUgIyBoYWNrIHRvIHNvbHZlIGh0dHBzOi8vZ2l0aHViLmNvbS9leHVwZXJvL3NhdmVTdmdBc1BuZy9pc3N1ZXMvMTI4IHByb2JsZW1cbiAgICAgICAgIyBAZWxlbWVudC5zZXRBdHRyaWJ1dGUgJ2RhdGEtbWVybWFpZC10aGVtZScsIHRoZW1lXG5cbiAgICAjIHJlbmRlciBmcm9udCBtYXR0ZXIgYXMgdGFibGU/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb24nLCAoKSA9PlxuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICMgc2hvdyBiYWNrIHRvIHRvcCBidXR0b24/XG4gICAgQHNldHRpbmdzRGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2hvd0JhY2tUb1RvcEJ1dHRvbicsIChmbGFnKT0+XG4gICAgICBAc2hvd0JhY2tUb1RvcEJ1dHRvbiA9IGZsYWdcbiAgICAgIGlmIGZsYWdcbiAgICAgICAgQGFkZEJhY2tUb1RvcEJ1dHRvbigpXG4gICAgICBlbHNlXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2JhY2stdG8tdG9wLWJ0bicpWzBdPy5yZW1vdmUoKVxuXG4gIHNjcm9sbFN5bmNGb3JQcmVzZW50YXRpb246IChidWZmZXJMaW5lTm8pLT5cbiAgICBpID0gQHNsaWRlQ29uZmlncy5sZW5ndGggLSAxXG4gICAgd2hpbGUgaSA+PSAwXG4gICAgICBpZiBidWZmZXJMaW5lTm8gPj0gQHNsaWRlQ29uZmlnc1tpXS5saW5lXG4gICAgICAgIGJyZWFrXG4gICAgICBpLT0xXG4gICAgc2xpZGVFbGVtZW50ID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZVtkYXRhLW9mZnNldD1cXFwiI3tpfVxcXCJdXCIpXG5cbiAgICByZXR1cm4gaWYgbm90IHNsaWRlRWxlbWVudFxuXG4gICAgIyBzZXQgc2xpZGUgdG8gbWlkZGxlIG9mIHByZXZpZXdcbiAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSAtQGVsZW1lbnQub2Zmc2V0SGVpZ2h0LzIgKyAoc2xpZGVFbGVtZW50Lm9mZnNldFRvcCArIHNsaWRlRWxlbWVudC5vZmZzZXRIZWlnaHQvMikqcGFyc2VGbG9hdChzbGlkZUVsZW1lbnQuc3R5bGUuem9vbSlcblxuICAjIGxpbmVObyBoZXJlIGlzIHNjcmVlbiBidWZmZXIgcm93LlxuICBzY3JvbGxTeW5jVG9MaW5lTm86IChsaW5lTm8pLT5cbiAgICBAc2Nyb2xsTWFwID89IEBidWlsZFNjcm9sbE1hcCh0aGlzKVxuXG4gICAgZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZ2V0RWxlbWVudCgpXG5cbiAgICBmaXJzdFZpc2libGVTY3JlZW5Sb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgcG9zUmF0aW8gPSAobGluZU5vIC0gZmlyc3RWaXNpYmxlU2NyZWVuUm93KSAvIChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcblxuICAgIHNjcm9sbFRvcCA9IEBzY3JvbGxNYXBbbGluZU5vXSAtIChpZiBwb3NSYXRpbyA+IDEgdGhlbiAxIGVsc2UgcG9zUmF0aW8pICogZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKVxuICAgIHNjcm9sbFRvcCA9IDAgaWYgc2Nyb2xsVG9wIDwgMFxuXG4gICAgQHNjcm9sbFRvUG9zIHNjcm9sbFRvcFxuXG4gICMgc21vb3RoIHNjcm9sbCBAZWxlbWVudCB0byBzY3JvbGxUb3BcbiAgIyBpZiBlZGl0b3JFbGVtZW50IGlzIHByb3ZpZGVkLCB0aGVuIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcbiAgc2Nyb2xsVG9Qb3M6IChzY3JvbGxUb3AsIGVkaXRvckVsZW1lbnQ9bnVsbCktPlxuICAgIGlmIEBzY3JvbGxUaW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQgQHNjcm9sbFRpbWVvdXRcbiAgICAgIEBzY3JvbGxUaW1lb3V0ID0gbnVsbFxuXG4gICAgaWYgbm90IEBlZGl0b3Igb3Igbm90IEBlZGl0b3IuYWxpdmUgb3Igc2Nyb2xsVG9wIDwgMFxuICAgICAgcmV0dXJuXG5cbiAgICBkZWxheSA9IDEwXG5cbiAgICBoZWxwZXIgPSAoZHVyYXRpb249MCk9PlxuICAgICAgQHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgIGlmIGR1cmF0aW9uIDw9IDBcbiAgICAgICAgICBpZiBlZGl0b3JFbGVtZW50XG4gICAgICAgICAgICBAZWRpdG9yU2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCBzY3JvbGxUb3BcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcHJldmlld1Njcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudFxuICAgICAgICAgIGRpZmZlcmVuY2UgPSBzY3JvbGxUb3AgLSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkaWZmZXJlbmNlID0gc2Nyb2xsVG9wIC0gQGVsZW1lbnQuc2Nyb2xsVG9wXG5cbiAgICAgICAgcGVyVGljayA9IGRpZmZlcmVuY2UgLyBkdXJhdGlvbiAqIGRlbGF5XG5cbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudFxuICAgICAgICAgICMgZGlzYWJsZSBlZGl0b3Igc2Nyb2xsXG4gICAgICAgICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgICAgcyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgKyBwZXJUaWNrXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Agc1xuICAgICAgICAgIHJldHVybiBpZiBzID09IHNjcm9sbFRvcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBkaXNhYmxlIHByZXZpZXcgb25zY3JvbGxcbiAgICAgICAgICBAcHJldmlld1Njcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wICs9IHBlclRpY2tcbiAgICAgICAgICByZXR1cm4gaWYgQGVsZW1lbnQuc2Nyb2xsVG9wID09IHNjcm9sbFRvcFxuXG4gICAgICAgIGhlbHBlciBkdXJhdGlvbi1kZWxheVxuICAgICAgLCBkZWxheVxuXG4gICAgaGVscGVyKEBzY3JvbGxEdXJhdGlvbilcblxuICBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nOiAoc3RyKS0+XG4gICAgQG1haW5Nb2R1bGUuaG9vay5jaGFpbignb24td2lsbC1wYXJzZS1tYXJrZG93bicsIHN0cilcblxuICBmb3JtYXRTdHJpbmdBZnRlclBhcnNpbmc6IChzdHIpLT5cbiAgICBAbWFpbk1vZHVsZS5ob29rLmNoYWluKCdvbi1kaWQtcGFyc2UtbWFya2Rvd24nLCBzdHIpXG5cbiAgdXBkYXRlTWFya2Rvd246IC0+XG4gICAgQGVkaXRvclNjcm9sbERlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gIHJlbmRlck1hcmtkb3duOiAtPlxuICAgIGlmIERhdGUubm93KCkgPCBAcGFyc2VEZWxheSBvciAhQGVkaXRvciBvciAhQGVsZW1lbnRcbiAgICAgIEB0ZXh0Q2hhbmdlZCA9IGZhbHNlXG4gICAgICByZXR1cm5cbiAgICBAcGFyc2VEZWxheSA9IERhdGUubm93KCkgKyAyMDBcblxuICAgIEBwYXJzZU1EIEBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nKEBlZGl0b3IuZ2V0VGV4dCgpKSwge2lzRm9yUHJldmlldzogdHJ1ZSwgbWFya2Rvd25QcmV2aWV3OiB0aGlzLCBAZmlsZURpcmVjdG9yeVBhdGgsIEBwcm9qZWN0RGlyZWN0b3J5UGF0aH0sICh7aHRtbCwgc2xpZGVDb25maWdzLCB5YW1sQ29uZmlnfSk9PlxuICAgICAgaHRtbCA9IEBmb3JtYXRTdHJpbmdBZnRlclBhcnNpbmcoaHRtbClcblxuICAgICAgaWYgc2xpZGVDb25maWdzLmxlbmd0aFxuICAgICAgICBodG1sID0gQHBhcnNlU2xpZGVzKGh0bWwsIHNsaWRlQ29uZmlncywgeWFtbENvbmZpZylcbiAgICAgICAgQGVsZW1lbnQuc2V0QXR0cmlidXRlICdkYXRhLXByZXNlbnRhdGlvbi1wcmV2aWV3LW1vZGUnLCAnJ1xuICAgICAgICBAcHJlc2VudGF0aW9uTW9kZSA9IHRydWVcbiAgICAgICAgQHNsaWRlQ29uZmlncyA9IHNsaWRlQ29uZmlnc1xuICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBAZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUgJ2RhdGEtcHJlc2VudGF0aW9uLXByZXZpZXctbW9kZSdcbiAgICAgICAgQHByZXNlbnRhdGlvbk1vZGUgPSBmYWxzZVxuXG4gICAgICBAZWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG4gICAgICBAZ3JhcGhEYXRhID0ge31cbiAgICAgIEBiaW5kRXZlbnRzKClcblxuICAgICAgQG1haW5Nb2R1bGUuZW1pdHRlci5lbWl0ICdvbi1kaWQtcmVuZGVyLXByZXZpZXcnLCB7aHRtbFN0cmluZzogaHRtbCwgcHJldmlld0VsZW1lbnQ6IEBlbGVtZW50fVxuXG4gICAgICBAc2V0SW5pdGlhbFNjcm9sbFBvcygpXG4gICAgICBAYWRkQmFja1RvVG9wQnV0dG9uKClcbiAgICAgIEBhZGRSZWZyZXNoQnV0dG9uKClcblxuICAgICAgQHRleHRDaGFuZ2VkID0gZmFsc2VcblxuICBzZXRJbml0aWFsU2Nyb2xsUG9zOiAtPlxuICAgIGlmIEBmaXJzdFRpbWVSZW5kZXJNYXJrZG93b25cbiAgICAgIEBmaXJzdFRpbWVSZW5kZXJNYXJrZG93b24gPSBmYWxzZVxuICAgICAgY3Vyc29yID0gQGVkaXRvci5jdXJzb3JzWzBdXG4gICAgICByZXR1cm4gaWYgbm90IGN1cnNvclxuICAgICAgaWYgQHByZXNlbnRhdGlvbk1vZGVcbiAgICAgICAgQHNjcm9sbFN5bmNGb3JQcmVzZW50YXRpb24gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBlbHNlXG4gICAgICAgIHQgPSBAc2Nyb2xsRHVyYXRpb25cbiAgICAgICAgQHNjcm9sbER1cmF0aW9uID0gMFxuICAgICAgICBAc2Nyb2xsU3luY1RvTGluZU5vIGN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgICAgICBAc2Nyb2xsRHVyYXRpb24gPSB0XG5cbiAgYWRkQmFja1RvVG9wQnV0dG9uOiAtPlxuICAgICMgVE9ETzogY2hlY2sgY29uZmlnXG5cbiAgICAjIGFkZCBiYWNrIHRvIHRvcCBidXR0b24gIzIyMlxuICAgIGlmIEBzaG93QmFja1RvVG9wQnV0dG9uIGFuZCBAZWxlbWVudC5zY3JvbGxIZWlnaHQgPiBAZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICAgIGJhY2tUb1RvcEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBiYWNrVG9Ub3BCdG4uY2xhc3NMaXN0LmFkZCgnYmFjay10by10b3AtYnRuJylcbiAgICAgIGJhY2tUb1RvcEJ0bi5jbGFzc0xpc3QuYWRkKCdidG4nKVxuICAgICAgYmFja1RvVG9wQnRuLmlubmVySFRNTCA9ICc8c3Bhbj7irIbvuI48L3NwYW4+J1xuICAgICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoYmFja1RvVG9wQnRuKVxuXG4gICAgICBiYWNrVG9Ub3BCdG4ub25jbGljayA9ICgpPT5cbiAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuXG4gIGFkZFJlZnJlc2hCdXR0b246IC0+XG4gICAgcmVmcmVzaEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcmVmcmVzaEJ0bi5jbGFzc0xpc3QuYWRkKCdyZWZyZXNoLWJ0bicpXG4gICAgcmVmcmVzaEJ0bi5jbGFzc0xpc3QuYWRkKCdidG4nKVxuICAgIHJlZnJlc2hCdG4uaW5uZXJIVE1MID0gJzxzcGFuPuKfszwvc3Bhbj4nXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQocmVmcmVzaEJ0bilcblxuICAgIHJlZnJlc2hCdG4ub25jbGljayA9ICgpPT5cbiAgICAgICMgY2xlYXIgY2FjaGVcbiAgICAgIEBmaWxlc0NhY2hlID0ge31cbiAgICAgIGNvZGVDaHVua0FQSS5jbGVhckNhY2hlKClcblxuICAgICAgIyByZW5kZXIgYWdhaW5cbiAgICAgIEByZW5kZXJNYXJrZG93bigpXG5cbiAgYmluZEV2ZW50czogLT5cbiAgICBAYmluZFRhZ0FDbGlja0V2ZW50KClcbiAgICBAc2V0dXBDb2RlQ2h1bmtzKClcbiAgICBAaW5pdFRhc2tMaXN0KClcbiAgICBAcmVuZGVyTWVybWFpZCgpXG4gICAgQHJlbmRlclBsYW50VU1MKClcbiAgICBAcmVuZGVyV2F2ZWRyb20oKVxuICAgIEByZW5kZXJWaXooKVxuICAgIEByZW5kZXJLYVRlWCgpXG4gICAgQHJlbmRlck1hdGhKYXgoKVxuICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgIyA8YSBocmVmPVwiXCIgPiAuLi4gPC9hPiBjbGljayBldmVudFxuICBiaW5kVGFnQUNsaWNrRXZlbnQ6ICgpLT5cbiAgICBhcyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcblxuICAgIGFuYWx5emVIcmVmID0gKGhyZWYpPT5cbiAgICAgIGlmIGhyZWYgYW5kIGhyZWZbMF0gPT0gJyMnXG4gICAgICAgIHRhcmdldEVsZW1lbnQgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiW2lkPVxcXCIje2hyZWYuc2xpY2UoMSl9XFxcIl1cIikgIyBmaXggbnVtYmVyIGlkIGJ1Z1xuICAgICAgICBpZiB0YXJnZXRFbGVtZW50XG4gICAgICAgICAgYS5vbmNsaWNrID0gKCk9PlxuICAgICAgICAgICAgIyBqdW1wIHRvIHRhZyBwb3NpdGlvblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gMFxuICAgICAgICAgICAgZWwgPSB0YXJnZXRFbGVtZW50XG4gICAgICAgICAgICB3aGlsZSBlbCBhbmQgZWwgIT0gQGVsZW1lbnRcbiAgICAgICAgICAgICAgb2Zmc2V0VG9wICs9IGVsLm9mZnNldFRvcFxuICAgICAgICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudFxuXG4gICAgICAgICAgICBpZiBAZWxlbWVudC5zY3JvbGxUb3AgPiBvZmZzZXRUb3BcbiAgICAgICAgICAgICAgQGVsZW1lbnQuc2Nyb2xsVG9wID0gb2Zmc2V0VG9wIC0gMzIgLSB0YXJnZXRFbGVtZW50Lm9mZnNldEhlaWdodFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAZWxlbWVudC5zY3JvbGxUb3AgPSBvZmZzZXRUb3BcbiAgICAgIGVsc2VcbiAgICAgICAgYS5vbmNsaWNrID0gKCk9PlxuICAgICAgICAgIHJldHVybiBpZiAhaHJlZlxuICAgICAgICAgIHJldHVybiBpZiBocmVmLm1hdGNoKC9eKGh0dHB8aHR0cHMpXFw6XFwvXFwvLykgIyB0aGUgZGVmYXVsdCBiZWhhdmlvciB3aWxsIG9wZW4gYnJvd3NlciBmb3IgdGhhdCB1cmwuXG5cbiAgICAgICAgICBpZiBwYXRoLmV4dG5hbWUoaHJlZikgaW4gWycucGRmJywgJy54bHMnLCAnLnhsc3gnLCAnLmRvYycsICcucHB0JywgJy5kb2N4JywgJy5wcHR4J10gIyBpc3N1ZSAjOTdcbiAgICAgICAgICAgIEBvcGVuRmlsZSBocmVmXG4gICAgICAgICAgZWxzZSBpZiBocmVmLm1hdGNoKC9eZmlsZVxcOlxcL1xcL1xcLy8pXG4gICAgICAgICAgICAjIGlmIGhyZWYuc3RhcnRzV2l0aCAnZmlsZTovLy8nXG4gICAgICAgICAgICBvcGVuRmlsZVBhdGggPSBocmVmLnNsaWNlKDgpICMgcmVtb3ZlIHByb3RvY2FsXG4gICAgICAgICAgICBvcGVuRmlsZVBhdGggPSBvcGVuRmlsZVBhdGgucmVwbGFjZSgvXFwubWQoXFxzKilcXCMoLispJC8sICcubWQnKSAjIHJlbW92ZSAjYW5jaG9yXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIG9wZW5GaWxlUGF0aCxcbiAgICAgICAgICAgICAgc3BsaXQ6ICdsZWZ0JyxcbiAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb3BlbkZpbGUgaHJlZlxuXG4gICAgZm9yIGEgaW4gYXNcbiAgICAgIGhyZWYgPSBhLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICBhbmFseXplSHJlZihocmVmKVxuXG4gIHNldHVwQ29kZUNodW5rczogKCktPlxuICAgIGNvZGVDaHVua3MgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2RlLWNodW5rJylcbiAgICByZXR1cm4gaWYgIWNvZGVDaHVua3MubGVuZ3RoXG5cbiAgICBuZXdDb2RlQ2h1bmtzRGF0YSA9IHt9XG4gICAgbmVlZFRvU2V0dXBDaHVua3NJZCA9IGZhbHNlXG4gICAgc2V0dXBDb2RlQ2h1bmsgPSAoY29kZUNodW5rKT0+XG4gICAgICBkYXRhQXJncyA9IGNvZGVDaHVuay5nZXRBdHRyaWJ1dGUoJ2RhdGEtYXJncycpXG4gICAgICBpZE1hdGNoID0gZGF0YUFyZ3MubWF0Y2goL1xccyppZFxccyo6XFxzKlxcXCIoW15cXFwiXSopXFxcIi8pXG4gICAgICBpZiBpZE1hdGNoIGFuZCBpZE1hdGNoWzFdXG4gICAgICAgIGlkID0gaWRNYXRjaFsxXVxuICAgICAgICBjb2RlQ2h1bmsuaWQgPSAnY29kZV9jaHVua18nICsgaWRcbiAgICAgICAgcnVubmluZyA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/LnJ1bm5pbmcgb3IgZmFsc2VcbiAgICAgICAgY29kZUNodW5rLmNsYXNzTGlzdC5hZGQoJ3J1bm5pbmcnKSBpZiBydW5uaW5nXG5cbiAgICAgICAgIyByZW1vdmUgb3V0cHV0LWRpdiBhbmQgb3V0cHV0LWVsZW1lbnRcbiAgICAgICAgY2hpbGRyZW4gPSBjb2RlQ2h1bmsuY2hpbGRyZW5cbiAgICAgICAgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgIGlmIGNoaWxkLmNsYXNzTGlzdC5jb250YWlucygnb3V0cHV0LWRpdicpIG9yIGNoaWxkLmNsYXNzTGlzdC5jb250YWlucygnb3V0cHV0LWVsZW1lbnQnKVxuICAgICAgICAgICAgY2hpbGQucmVtb3ZlKClcbiAgICAgICAgICBpIC09IDFcblxuICAgICAgICBvdXRwdXREaXYgPSBAY29kZUNodW5rc0RhdGFbaWRdPy5vdXRwdXREaXZcbiAgICAgICAgb3V0cHV0RWxlbWVudCA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/Lm91dHB1dEVsZW1lbnRcblxuICAgICAgICBjb2RlQ2h1bmsuYXBwZW5kQ2hpbGQob3V0cHV0RWxlbWVudCkgaWYgb3V0cHV0RWxlbWVudFxuICAgICAgICBjb2RlQ2h1bmsuYXBwZW5kQ2hpbGQob3V0cHV0RGl2KSBpZiBvdXRwdXREaXZcblxuICAgICAgICBuZXdDb2RlQ2h1bmtzRGF0YVtpZF0gPSB7cnVubmluZywgb3V0cHV0RGl2LCBvdXRwdXRFbGVtZW50fVxuICAgICAgZWxzZSAjIGlkIG5vdCBleGlzdCwgY3JlYXRlIG5ldyBpZFxuICAgICAgICBuZWVkVG9TZXR1cENodW5rc0lkID0gdHJ1ZVxuXG4gICAgICBydW5CdG4gPSBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncnVuLWJ0bicpWzBdXG4gICAgICBydW5CdG4/LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKCk9PlxuICAgICAgICBAcnVuQ29kZUNodW5rKGNvZGVDaHVuaylcblxuICAgICAgcnVuQWxsQnRuID0gY29kZUNodW5rLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3J1bi1hbGwtYnRuJylbMF1cbiAgICAgIHJ1bkFsbEJ0bj8uYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoKT0+XG4gICAgICAgIEBydW5BbGxDb2RlQ2h1bmtzKClcblxuICAgIGZvciBjb2RlQ2h1bmsgaW4gY29kZUNodW5rc1xuICAgICAgYnJlYWsgaWYgbmVlZFRvU2V0dXBDaHVua3NJZFxuICAgICAgc2V0dXBDb2RlQ2h1bmsoY29kZUNodW5rKVxuXG4gICAgaWYgbmVlZFRvU2V0dXBDaHVua3NJZFxuICAgICAgQHNldHVwQ29kZUNodW5rc0lkKClcblxuICAgIEBjb2RlQ2h1bmtzRGF0YSA9IG5ld0NvZGVDaHVua3NEYXRhICMga2V5IGlzIGNvZGVDaHVua0lkLCB2YWx1ZSBpcyB7cnVubmluZywgb3V0cHV0RGl2fVxuXG4gIHNldHVwQ29kZUNodW5rc0lkOiAoKS0+XG4gICAgYnVmZmVyID0gQGVkaXRvci5idWZmZXJcbiAgICByZXR1cm4gaWYgIWJ1ZmZlclxuXG4gICAgbGluZXMgPSBidWZmZXIubGluZXNcbiAgICBsaW5lTm8gPSAwXG4gICAgY3VyU2NyZWVuUG9zID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG5cbiAgICB3aGlsZSBsaW5lTm8gPCBsaW5lcy5sZW5ndGhcbiAgICAgIGxpbmUgPSBsaW5lc1tsaW5lTm9dXG4gICAgICBtYXRjaCA9IGxpbmUubWF0Y2goL15cXGBcXGBcXGBcXHsoLispXFx9KFxccyopLylcbiAgICAgIGlmIG1hdGNoXG4gICAgICAgIGNtZCA9IG1hdGNoWzFdXG4gICAgICAgIGRhdGFBcmdzID0gJydcbiAgICAgICAgaSA9IGNtZC5pbmRleE9mKCcgJylcbiAgICAgICAgaWYgaSA+IDBcbiAgICAgICAgICBkYXRhQXJncyA9IGNtZC5zbGljZShpICsgMSwgY21kLmxlbmd0aCkudHJpbSgpXG4gICAgICAgICAgY21kID0gY21kLnNsaWNlKDAsIGkpXG5cbiAgICAgICAgaWRNYXRjaCA9IG1hdGNoWzFdLm1hdGNoKC9cXHMqaWRcXHMqOlxccypcXFwiKFteXFxcIl0qKVxcXCIvKVxuICAgICAgICBpZiAhaWRNYXRjaFxuICAgICAgICAgIGlkID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZygzNilcblxuICAgICAgICAgIGxpbmUgPSBsaW5lLnRyaW1SaWdodCgpXG4gICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvfSQvLCAoaWYgIWRhdGFBcmdzIHRoZW4gJycgZWxzZSAnLCcpICsgJyBpZDpcIicgKyBpZCArICdcIn0nKVxuXG4gICAgICAgICAgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwICMgcHJldmVudCByZW5kZXJNYXJrZG93blxuXG4gICAgICAgICAgYnVmZmVyLnNldFRleHRJblJhbmdlKFtbbGluZU5vLCAwXSwgW2xpbmVObysxLCAwXV0sIGxpbmUgKyAnXFxuJylcblxuICAgICAgbGluZU5vICs9IDFcblxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oY3VyU2NyZWVuUG9zKSAjIHJlc3RvcmUgY3Vyc29yIHBvc2l0aW9uLlxuXG4gICAgICAjIFRoaXMgd2lsbCBjYXVzZSBNYXhpbXVtIHNpemUgZXhjZWVkZWRcbiAgICAgICMgQHBhcnNlRGVsYXkgPSBEYXRlLm5vdygpXG4gICAgICAjIEByZW5kZXJNYXJrZG93bigpXG5cbiAgZ2V0TmVhcmVzdENvZGVDaHVuazogKCktPlxuICAgIGJ1ZmZlclJvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICBjb2RlQ2h1bmtzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29kZS1jaHVuaycpXG4gICAgaSA9IGNvZGVDaHVua3MubGVuZ3RoIC0gMVxuICAgIHdoaWxlIGkgPj0gMFxuICAgICAgY29kZUNodW5rID0gY29kZUNodW5rc1tpXVxuICAgICAgbGluZU5vID0gcGFyc2VJbnQoY29kZUNodW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1saW5lJykpXG4gICAgICBpZiBsaW5lTm8gPD0gYnVmZmVyUm93XG4gICAgICAgIHJldHVybiBjb2RlQ2h1bmtcbiAgICAgIGktPTFcbiAgICByZXR1cm4gbnVsbFxuXG4gICMgcmV0dXJuIGZhbHNlIGlmIG1lZXQgZXJyb3JcbiAgIyBvdGhlcndpc2UgcmV0dXJuXG4gICMge1xuICAjICAgY21kLFxuICAjICAgb3B0aW9ucyxcbiAgIyAgIGNvZGUsXG4gICMgICBpZCxcbiAgIyB9XG4gIHBhcnNlQ29kZUNodW5rOiAoY29kZUNodW5rKS0+XG4gICAgY29kZSA9IGNvZGVDaHVuay5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29kZScpXG4gICAgZGF0YUFyZ3MgPSBjb2RlQ2h1bmsuZ2V0QXR0cmlidXRlKCdkYXRhLWFyZ3MnKVxuXG4gICAgb3B0aW9ucyA9IG51bGxcbiAgICB0cnlcbiAgICAgIGFsbG93VW5zYWZlRXZhbCAtPlxuICAgICAgICBvcHRpb25zID0gZXZhbChcIih7I3tkYXRhQXJnc319KVwiKVxuICAgICAgIyBvcHRpb25zID0gSlNPTi5wYXJzZSAneycrZGF0YUFyZ3MucmVwbGFjZSgoLyhbKFxcdyl8KFxcLSldKykoOikvZyksIFwiXFxcIiQxXFxcIiQyXCIpLnJlcGxhY2UoKC8nL2cpLCBcIlxcXCJcIikrJ30nXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCBvcHRpb25zJywgZGV0YWlsOiBkYXRhQXJncylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWQgPSBvcHRpb25zLmlkXG5cbiAgICAjIGNoZWNrIG9wdGlvbnMuY29udGludWVcbiAgICBpZiBvcHRpb25zLmNvbnRpbnVlXG4gICAgICBsYXN0ID0gbnVsbFxuICAgICAgaWYgb3B0aW9ucy5jb250aW51ZSA9PSB0cnVlXG4gICAgICAgIGNvZGVDaHVua3MgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICdjb2RlLWNodW5rJ1xuICAgICAgICBpID0gY29kZUNodW5rcy5sZW5ndGggLSAxXG4gICAgICAgIHdoaWxlIGkgPj0gMFxuICAgICAgICAgIGlmIGNvZGVDaHVua3NbaV0gPT0gY29kZUNodW5rXG4gICAgICAgICAgICBsYXN0ID0gY29kZUNodW5rc1tpIC0gMV1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaS0tXG4gICAgICBlbHNlICMgaWRcbiAgICAgICAgbGFzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlX2NodW5rXycgKyBvcHRpb25zLmNvbnRpbnVlKVxuXG4gICAgICBpZiBsYXN0XG4gICAgICAgIHtjb2RlOiBsYXN0Q29kZSwgb3B0aW9uczogbGFzdE9wdGlvbnN9ID0gQHBhcnNlQ29kZUNodW5rKGxhc3QpIG9yIHt9XG4gICAgICAgIGxhc3RPcHRpb25zID0gbGFzdE9wdGlvbnMgb3Ige31cbiAgICAgICAgY29kZSA9IChsYXN0Q29kZSBvciAnJykgKyAnXFxuJyArIGNvZGVcblxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgbGFzdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCBjb250aW51ZSBmb3IgY29kZSBjaHVuayAnICsgKG9wdGlvbnMuaWQgb3IgJycpLCBkZXRhaWw6IG9wdGlvbnMuY29udGludWUudG9TdHJpbmcoKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjbWQgPSAgb3B0aW9ucy5jbWQgb3IgY29kZUNodW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1sYW5nJykgIyBuZWVkIHRvIHB1dCBoZXJlIGJlY2F1c2Ugb3B0aW9ucyBtaWdodCBiZSBtb2RpZmllZCBiZWZvcmVcbiAgICByZXR1cm4ge2NtZCwgb3B0aW9ucywgY29kZSwgaWR9XG5cblxuXG4gIHJ1bkNvZGVDaHVuazogKGNvZGVDaHVuaz1udWxsKS0+XG4gICAgY29kZUNodW5rID0gQGdldE5lYXJlc3RDb2RlQ2h1bmsoKSBpZiBub3QgY29kZUNodW5rXG4gICAgcmV0dXJuIGlmIG5vdCBjb2RlQ2h1bmtcbiAgICByZXR1cm4gaWYgY29kZUNodW5rLmNsYXNzTGlzdC5jb250YWlucygncnVubmluZycpXG5cbiAgICBwYXJzZVJlc3VsdCA9IEBwYXJzZUNvZGVDaHVuayhjb2RlQ2h1bmspXG4gICAgcmV0dXJuIGlmICFwYXJzZVJlc3VsdFxuICAgIHtjb2RlLCBvcHRpb25zLCBjbWQsIGlkfSA9IHBhcnNlUmVzdWx0XG5cbiAgICBpZiAhaWRcbiAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0NvZGUgY2h1bmsgZXJyb3InLCBkZXRhaWw6ICdpZCBpcyBub3QgZm91bmQgb3IganVzdCB1cGRhdGVkLicpXG5cbiAgICBjb2RlQ2h1bmsuY2xhc3NMaXN0LmFkZCgncnVubmluZycpXG4gICAgaWYgQGNvZGVDaHVua3NEYXRhW2lkXVxuICAgICAgQGNvZGVDaHVua3NEYXRhW2lkXS5ydW5uaW5nID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBjb2RlQ2h1bmtzRGF0YVtpZF0gPSB7cnVubmluZzogdHJ1ZX1cblxuICAgICMgY2hlY2sgb3B0aW9ucyBgZWxlbWVudGBcbiAgICBpZiBvcHRpb25zLmVsZW1lbnRcbiAgICAgIG91dHB1dEVsZW1lbnQgPSBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnb3V0cHV0LWVsZW1lbnQnKT9bMF1cbiAgICAgIGlmICFvdXRwdXRFbGVtZW50ICMgY3JlYXRlIGFuZCBhcHBlbmQgYG91dHB1dC1lbGVtZW50YCBkaXZcbiAgICAgICAgb3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgb3V0cHV0RWxlbWVudC5jbGFzc0xpc3QuYWRkICdvdXRwdXQtZWxlbWVudCdcbiAgICAgICAgY29kZUNodW5rLmFwcGVuZENoaWxkIG91dHB1dEVsZW1lbnRcblxuICAgICAgb3V0cHV0RWxlbWVudC5pbm5lckhUTUwgPSBvcHRpb25zLmVsZW1lbnRcbiAgICBlbHNlXG4gICAgICBjb2RlQ2h1bmsuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnb3V0cHV0LWVsZW1lbnQnKT9bMF0/LnJlbW92ZSgpXG4gICAgICBvdXRwdXRFbGVtZW50ID0gbnVsbFxuXG4gICAgY29kZUNodW5rQVBJLnJ1biBjb2RlLCBAZmlsZURpcmVjdG9yeVBhdGgsIGNtZCwgb3B0aW9ucywgKGVycm9yLCBkYXRhLCBvcHRpb25zKT0+XG4gICAgICAjIGdldCBuZXcgY29kZUNodW5rXG4gICAgICBjb2RlQ2h1bmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZV9jaHVua18nICsgaWQpXG4gICAgICByZXR1cm4gaWYgbm90IGNvZGVDaHVua1xuICAgICAgY29kZUNodW5rLmNsYXNzTGlzdC5yZW1vdmUoJ3J1bm5pbmcnKVxuXG4gICAgICByZXR1cm4gaWYgZXJyb3IgIyBvciAhZGF0YVxuICAgICAgZGF0YSA9IChkYXRhIG9yICcnKS50b1N0cmluZygpXG5cbiAgICAgIG91dHB1dERpdiA9IGNvZGVDaHVuay5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdvdXRwdXQtZGl2Jyk/WzBdXG4gICAgICBpZiAhb3V0cHV0RGl2XG4gICAgICAgIG91dHB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgb3V0cHV0RGl2LmNsYXNzTGlzdC5hZGQgJ291dHB1dC1kaXYnXG4gICAgICBlbHNlXG4gICAgICAgIG91dHB1dERpdi5pbm5lckhUTUwgPSAnJ1xuXG4gICAgICBpZiBvcHRpb25zLm91dHB1dCA9PSAnaHRtbCdcbiAgICAgICAgb3V0cHV0RGl2LmlubmVySFRNTCA9IGRhdGFcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy5vdXRwdXQgPT0gJ3BuZydcbiAgICAgICAgaW1hZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnaW1nJ1xuICAgICAgICBpbWFnZURhdGEgPSBCdWZmZXIoZGF0YSkudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIGltYWdlRWxlbWVudC5zZXRBdHRyaWJ1dGUgJ3NyYycsICBcImRhdGE6aW1hZ2UvcG5nO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCN7aW1hZ2VEYXRhfVwiXG4gICAgICAgIG91dHB1dERpdi5hcHBlbmRDaGlsZCBpbWFnZUVsZW1lbnRcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy5vdXRwdXQgPT0gJ21hcmtkb3duJ1xuICAgICAgICBAcGFyc2VNRCBkYXRhLCB7QGZpbGVEaXJlY3RvcnlQYXRoLCBAcHJvamVjdERpcmVjdG9yeVBhdGh9LCAoe2h0bWx9KT0+XG4gICAgICAgICAgb3V0cHV0RGl2LmlubmVySFRNTCA9IGh0bWxcbiAgICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuICAgICAgZWxzZSBpZiBvcHRpb25zLm91dHB1dCA9PSAnbm9uZSdcbiAgICAgICAgb3V0cHV0RGl2LnJlbW92ZSgpXG4gICAgICAgIG91dHB1dERpdiA9IG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgZGF0YT8ubGVuZ3RoXG4gICAgICAgICAgcHJlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3ByZSdcbiAgICAgICAgICBwcmVFbGVtZW50LmlubmVyVGV4dCA9IGRhdGFcbiAgICAgICAgICBwcmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2VkaXRvci1jb2xvcnMnKVxuICAgICAgICAgIHByZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbGFuZy10ZXh0JylcbiAgICAgICAgICBvdXRwdXREaXYuYXBwZW5kQ2hpbGQgcHJlRWxlbWVudFxuXG4gICAgICBpZiBvdXRwdXREaXZcbiAgICAgICAgY29kZUNodW5rLmFwcGVuZENoaWxkIG91dHB1dERpdlxuICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuXG4gICAgICAjIGNoZWNrIG1hdHBsb3RsaWIgfCBtcGxcbiAgICAgIGlmIG9wdGlvbnMubWF0cGxvdGxpYiBvciBvcHRpb25zLm1wbFxuICAgICAgICBzY3JpcHRFbGVtZW50cyA9IG91dHB1dERpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcbiAgICAgICAgaWYgc2NyaXB0RWxlbWVudHMubGVuZ3RoXG4gICAgICAgICAgd2luZG93LmQzID89IHJlcXVpcmUoJy4uL2RlcGVuZGVuY2llcy9tcGxkMy9kMy52My5taW4uanMnKVxuICAgICAgICAgIHdpbmRvdy5tcGxkMyA/PSByZXF1aXJlKCcuLi9kZXBlbmRlbmNpZXMvbXBsZDMvbXBsZDMudjAuMy5taW4uanMnKVxuICAgICAgICAgIGZvciBzY3JpcHRFbGVtZW50IGluIHNjcmlwdEVsZW1lbnRzXG4gICAgICAgICAgICBjb2RlID0gc2NyaXB0RWxlbWVudC5pbm5lckhUTUxcbiAgICAgICAgICAgIGFsbG93VW5zYWZlTmV3RnVuY3Rpb24gLT4gYWxsb3dVbnNhZmVFdmFsIC0+XG4gICAgICAgICAgICAgIGV2YWwoY29kZSlcblxuICAgICAgQGNvZGVDaHVua3NEYXRhW2lkXSA9IHtydW5uaW5nOiBmYWxzZSwgb3V0cHV0RGl2LCBvdXRwdXRFbGVtZW50fVxuXG4gIHJ1bkFsbENvZGVDaHVua3M6ICgpLT5cbiAgICBjb2RlQ2h1bmtzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29kZS1jaHVuaycpXG4gICAgZm9yIGNodW5rIGluIGNvZGVDaHVua3NcbiAgICAgIEBydW5Db2RlQ2h1bmsoY2h1bmspXG5cbiAgaW5pdFRhc2tMaXN0OiAoKS0+XG4gICAgY2hlY2tib3hzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGFzay1saXN0LWl0ZW0tY2hlY2tib3gnKVxuICAgIGZvciBjaGVja2JveCBpbiBjaGVja2JveHNcbiAgICAgIHRoaXNfID0gdGhpc1xuICAgICAgY2hlY2tib3gub25jbGljayA9ICgpLT5cbiAgICAgICAgaWYgIXRoaXNfLmVkaXRvclxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWRcbiAgICAgICAgYnVmZmVyID0gdGhpc18uZWRpdG9yLmJ1ZmZlclxuXG4gICAgICAgIGlmICFidWZmZXJcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBsaW5lTm8gPSBwYXJzZUludCh0aGlzLnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWxpbmUnKSlcbiAgICAgICAgbGluZSA9IGJ1ZmZlci5saW5lc1tsaW5lTm9dXG5cbiAgICAgICAgaWYgY2hlY2tlZFxuICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ1sgXScsICdbeF0nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvXFxbKHh8WClcXF0vLCAnWyBdJylcblxuICAgICAgICB0aGlzXy5wYXJzZURlbGF5ID0gRGF0ZS5ub3coKSArIDUwMFxuXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbW2xpbmVObywgMF0sIFtsaW5lTm8rMSwgMF1dLCBsaW5lICsgJ1xcbicpXG5cbiAgcmVuZGVyTWVybWFpZDogKCktPlxuICAgIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lcm1haWQgbXBlLWdyYXBoJylcbiAgICBpZiBlbHMubGVuZ3RoXG4gICAgICBAZ3JhcGhEYXRhLm1lcm1haWRfcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVscylcblxuICAgICAgbm90UHJvY2Vzc2VkRWxzID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lcm1haWQubXBlLWdyYXBoOm5vdChbZGF0YS1wcm9jZXNzZWRdKScpXG5cbiAgICAgIGlmIG5vdFByb2Nlc3NlZEVscy5sZW5ndGhcbiAgICAgICAgbWVybWFpZC5pbml0IG51bGwsIG5vdFByb2Nlc3NlZEVsc1xuXG4gICAgICAjIyNcbiAgICAgICMgdGhlIGNvZGUgYmVsb3cgZG9lc24ndCBzZWVtIHRvIGJlIHdvcmtpbmdcbiAgICAgICMgSSB0aGluayBtZXJtYWlkQVBJLnJlbmRlciBmdW5jdGlvbiBoYXMgYnVnXG4gICAgICBjYiA9IChlbCktPlxuICAgICAgICAoc3ZnR3JhcGgpLT5cbiAgICAgICAgICBlbC5pbm5lckhUTUwgPSBzdmdHcmFwaFxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCAndHJ1ZSdcblxuICAgICAgICAgICMgdGhlIGNvZGUgYmVsb3cgaXMgYSBoYWNrYWJsZSB3YXkgdG8gc29sdmUgbWVybWFpZCBidWdcbiAgICAgICAgICBlbC5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9IGVsLmdldEF0dHJpYnV0ZSgndmlld2JveCcpLnNwbGl0KCcgJylbM10gKyAncHgnXG5cbiAgICAgIGZvciBlbCBpbiBlbHNcbiAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpKVxuICAgICAgICBlbC5pZCA9ICdtZXJtYWlkJytvZmZzZXRcblxuICAgICAgICBtZXJtYWlkQVBJLnJlbmRlciBlbC5pZCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJyksIGNiKGVsKVxuICAgICAgIyMjXG5cbiAgICAgICMgZGlzYWJsZSBAZWxlbWVudCBvbnNjcm9sbFxuICAgICAgQHByZXZpZXdTY3JvbGxEZWxheSA9IERhdGUubm93KCkgKyA1MDBcblxuICByZW5kZXJXYXZlZHJvbTogKCktPlxuICAgIGVscyA9IEBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dhdmVkcm9tIG1wZS1ncmFwaCcpXG4gICAgaWYgZWxzLmxlbmd0aFxuICAgICAgQGdyYXBoRGF0YS53YXZlZHJvbV9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuXG4gICAgICAjIFdhdmVEcm9tLlJlbmRlcldhdmVGb3JtKDAsIFdhdmVEcm9tLmV2YSgnYTAnKSwgJ2EnKVxuICAgICAgZm9yIGVsIGluIGVsc1xuICAgICAgICBpZiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgIT0gJ3RydWUnXG4gICAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnNldCcpKVxuICAgICAgICAgIGVsLmlkID0gJ3dhdmVkcm9tJytvZmZzZXRcbiAgICAgICAgICB0ZXh0ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykudHJpbSgpXG4gICAgICAgICAgY29udGludWUgaWYgbm90IHRleHQubGVuZ3RoXG5cbiAgICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgPT5cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBjb250ZW50ID0gZXZhbChcIigje3RleHR9KVwiKSAjIGV2YWwgZnVuY3Rpb24gaGVyZVxuICAgICAgICAgICAgICBXYXZlRHJvbS5SZW5kZXJXYXZlRm9ybShvZmZzZXQsIGNvbnRlbnQsICd3YXZlZHJvbScpXG4gICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCAndHJ1ZSdcblxuICAgICAgICAgICAgICBAc2Nyb2xsTWFwID0gbnVsbFxuICAgICAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gJ2ZhaWxlZCB0byBldmFsIFdhdmVEcm9tIGNvZGUuJ1xuXG4gICAgICAjIGRpc2FibGUgQGVsZW1lbnQgb25zY3JvbGxcbiAgICAgIEBwcmV2aWV3U2Nyb2xsRGVsYXkgPSBEYXRlLm5vdygpICsgNTAwXG5cbiAgcmVuZGVyUGxhbnRVTUw6ICgpLT5cbiAgICBlbHMgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwbGFudHVtbCBtcGUtZ3JhcGgnKVxuXG4gICAgaWYgZWxzLmxlbmd0aFxuICAgICAgQGdyYXBoRGF0YS5wbGFudHVtbF9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuXG4gICAgaGVscGVyID0gKGVsLCB0ZXh0KT0+XG4gICAgICBwbGFudHVtbEFQSS5yZW5kZXIgdGV4dCwgQGZpbGVEaXJlY3RvcnlQYXRoLCAob3V0cHV0SFRNTCk9PlxuICAgICAgICBlbC5pbm5lckhUTUwgPSBvdXRwdXRIVE1MXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCB0cnVlXG4gICAgICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgICBmb3IgZWwgaW4gZWxzXG4gICAgICBpZiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJykgIT0gJ3RydWUnXG4gICAgICAgIGhlbHBlcihlbCwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsJykpXG4gICAgICAgIGVsLmlubmVyVGV4dCA9ICdyZW5kZXJpbmcgZ3JhcGguLi5cXG4nXG5cbiAgcmVuZGVyVml6OiAoZWxlbWVudD1AZWxlbWVudCktPlxuICAgIGVscyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndml6IG1wZS1ncmFwaCcpXG5cbiAgICBpZiBlbHMubGVuZ3RoXG4gICAgICBAZ3JhcGhEYXRhLnZpel9zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuXG4gICAgICBAVml6ID89IHJlcXVpcmUoJy4uL2RlcGVuZGVuY2llcy92aXovdml6LmpzJylcbiAgICAgIGZvciBlbCBpbiBlbHNcbiAgICAgICAgaWYgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb2Nlc3NlZCcpICE9ICd0cnVlJ1xuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgY29udGVudCA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbCcpXG4gICAgICAgICAgICBvcHRpb25zID0ge31cblxuICAgICAgICAgICAgIyBjaGVjayBlbmdpbmVcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnRyaW0oKS5yZXBsYWNlIC9eZW5naW5lKFxccykqWzo9XShbXlxcbl0rKS8sIChhLCBiLCBjKS0+XG4gICAgICAgICAgICAgIG9wdGlvbnMuZW5naW5lID0gYy50cmltKCkgaWYgYz8udHJpbSgpIGluIFsnY2lyY28nLCAnZG90JywgJ2ZkcCcsICduZWF0bycsICdvc2FnZScsICd0d29waSddXG4gICAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBAVml6KGNvbnRlbnQsIG9wdGlvbnMpICMgZGVmYXVsdCBzdmdcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSAnZGF0YS1wcm9jZXNzZWQnLCB0cnVlXG4gICAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGVycm9yXG5cbiAgcmVuZGVyTWF0aEpheDogKCktPlxuICAgIHJldHVybiBpZiBAbWF0aFJlbmRlcmluZ09wdGlvbiAhPSAnTWF0aEpheCcgYW5kICFAdXNlUGFuZG9jUGFyc2VyXG4gICAgaWYgdHlwZW9mKE1hdGhKYXgpID09ICd1bmRlZmluZWQnXG4gICAgICByZXR1cm4gbG9hZE1hdGhKYXggZG9jdW1lbnQsICgpPT4gQHJlbmRlck1hdGhKYXgoKVxuXG4gICAgaWYgQG1hdGhKYXhQcm9jZXNzRW52aXJvbm1lbnRzIG9yIEB1c2VQYW5kb2NQYXJzZXJcbiAgICAgIHJldHVybiBNYXRoSmF4Lkh1Yi5RdWV1ZSBbJ1R5cGVzZXQnLCBNYXRoSmF4Lkh1YiwgQGVsZW1lbnRdLCAoKT0+IEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgICBlbHMgPSBAZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtYXRoamF4LWV4cHMnKVxuICAgIHJldHVybiBpZiAhZWxzLmxlbmd0aFxuXG4gICAgdW5wcm9jZXNzZWRFbGVtZW50cyA9IFtdXG4gICAgZm9yIGVsIGluIGVsc1xuICAgICAgaWYgIWVsLmhhc0F0dHJpYnV0ZSgnZGF0YS1wcm9jZXNzZWQnKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUgJ2RhdGEtb3JpZ2luYWwnLCBlbC50ZXh0Q29udGVudFxuICAgICAgICB1bnByb2Nlc3NlZEVsZW1lbnRzLnB1c2ggZWxcblxuICAgIGNhbGxiYWNrID0gKCk9PlxuICAgICAgZm9yIGVsIGluIHVucHJvY2Vzc2VkRWxlbWVudHNcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlICdkYXRhLXByb2Nlc3NlZCcsIHRydWVcbiAgICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgICBpZiB1bnByb2Nlc3NlZEVsZW1lbnRzLmxlbmd0aCA9PSBlbHMubGVuZ3RoXG4gICAgICBNYXRoSmF4Lkh1Yi5RdWV1ZSBbJ1R5cGVzZXQnLCBNYXRoSmF4Lkh1YiwgQGVsZW1lbnRdLCBjYWxsYmFja1xuICAgIGVsc2UgaWYgdW5wcm9jZXNzZWRFbGVtZW50cy5sZW5ndGhcbiAgICAgIE1hdGhKYXguSHViLlR5cGVzZXQgdW5wcm9jZXNzZWRFbGVtZW50cywgY2FsbGJhY2tcblxuICByZW5kZXJLYVRlWDogKCktPlxuICAgIHJldHVybiBpZiBAbWF0aFJlbmRlcmluZ09wdGlvbiAhPSAnS2FUZVgnXG4gICAgZWxzID0gQGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgna2F0ZXgtZXhwcycpXG5cbiAgICBmb3IgZWwgaW4gZWxzXG4gICAgICBpZiBlbC5oYXNBdHRyaWJ1dGUoJ2RhdGEtcHJvY2Vzc2VkJylcbiAgICAgICAgY29udGludWVcbiAgICAgIGVsc2VcbiAgICAgICAgZGlzcGxheU1vZGUgPSBlbC5oYXNBdHRyaWJ1dGUoJ2Rpc3BsYXktbW9kZScpXG4gICAgICAgIGRhdGFPcmlnaW5hbCA9IGVsLnRleHRDb250ZW50XG4gICAgICAgIHRyeVxuICAgICAgICAgIGthdGV4LnJlbmRlcihlbC50ZXh0Q29udGVudCwgZWwsIHtkaXNwbGF5TW9kZX0pXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgZWwuaW5uZXJIVE1MID0gXCI8c3BhbiBzdHlsZT1cXFwiY29sb3I6ICNlZTdmNDk7IGZvbnQtd2VpZ2h0OiA1MDA7XFxcIj4je2Vycm9yfTwvc3Bhbj5cIlxuXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnZGF0YS1wcm9jZXNzZWQnLCAndHJ1ZScpXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbCcsIGRhdGFPcmlnaW5hbClcblxuICByZXNpemVFdmVudDogKCktPlxuICAgIEBzY3JvbGxNYXAgPSBudWxsXG5cbiAgIyMjXG4gIGNvbnZlcnQgJy4vYS50eHQnICcvYS50eHQnXG4gICMjI1xuICByZXNvbHZlRmlsZVBhdGg6IChmaWxlUGF0aD0nJywgcmVsYXRpdmU9ZmFsc2UpLT5cbiAgICBpZiBmaWxlUGF0aC5tYXRjaChwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHApXG4gICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICBlbHNlIGlmIGZpbGVQYXRoLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgaWYgcmVsYXRpdmVcbiAgICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoQGZpbGVEaXJlY3RvcnlQYXRoLCBwYXRoLnJlc29sdmUoQHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrZmlsZVBhdGgpKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJ2ZpbGU6Ly8vJytwYXRoLnJlc29sdmUoQHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrZmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgaWYgcmVsYXRpdmVcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAnZmlsZTovLy8nK3BhdGgucmVzb2x2ZShAZmlsZURpcmVjdG9yeVBhdGgsIGZpbGVQYXRoKVxuXG4gICMjIFV0aWxpdGllc1xuICBvcGVuSW5Ccm93c2VyOiAoaXNGb3JQcmVzZW50YXRpb25QcmludD1mYWxzZSktPlxuICAgIHJldHVybiBpZiBub3QgQGVkaXRvclxuXG4gICAgQGdldEhUTUxDb250ZW50IG9mZmxpbmU6IHRydWUsIGlzRm9yUHJpbnQ6IGlzRm9yUHJlc2VudGF0aW9uUHJpbnQsIChodG1sQ29udGVudCk9PlxuICAgICAgdGVtcC5vcGVuXG4gICAgICAgIHByZWZpeDogJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQnLFxuICAgICAgICBzdWZmaXg6ICcuaHRtbCcsIChlcnIsIGluZm8pPT5cbiAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG5cbiAgICAgICAgICBmcy53cml0ZSBpbmZvLmZkLCBodG1sQ29udGVudCwgKGVycik9PlxuICAgICAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuICAgICAgICAgICAgaWYgaXNGb3JQcmVzZW50YXRpb25QcmludFxuICAgICAgICAgICAgICB1cmwgPSAnZmlsZTovLy8nICsgaW5mby5wYXRoICsgJz9wcmludC1wZGYnXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdQbGVhc2UgY29weSBhbmQgb3BlbiB0aGUgbGluayBiZWxvdyBpbiBDaHJvbWUuXFxuVGhlbiBSaWdodCBDbGljayAtPiBQcmludCAtPiBTYXZlIGFzIFBkZi4nLCBkaXNtaXNzYWJsZTogdHJ1ZSwgZGV0YWlsOiB1cmwpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICMjIG9wZW4gaW4gYnJvd3NlclxuICAgICAgICAgICAgICBAb3BlbkZpbGUgaW5mby5wYXRoXG5cbiAgZXhwb3J0VG9EaXNrOiAoKS0+XG4gICAgQGRvY3VtZW50RXhwb3J0ZXJWaWV3LmRpc3BsYXkodGhpcylcblxuICAjIG9wZW4gaHRtbCBmaWxlIGluIGJyb3dzZXIgb3Igb3BlbiBwZGYgZmlsZSBpbiByZWFkZXIgLi4uIGV0Y1xuICBvcGVuRmlsZTogKGZpbGVQYXRoKS0+XG4gICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInXG4gICAgICBjbWQgPSAnZXhwbG9yZXInXG4gICAgZWxzZSBpZiBwcm9jZXNzLnBsYXRmb3JtID09ICdkYXJ3aW4nXG4gICAgICBjbWQgPSAnb3BlbidcbiAgICBlbHNlXG4gICAgICBjbWQgPSAneGRnLW9wZW4nXG5cbiAgICBleGVjIFwiI3tjbWR9ICN7ZmlsZVBhdGh9XCJcblxuICAjI1xuICAjIyB7RnVuY3Rpb259IGNhbGxiYWNrIChodG1sQ29udGVudClcbiAgaW5zZXJ0Q29kZUNodW5rc1Jlc3VsdDogKGh0bWxDb250ZW50KS0+XG4gICAgIyBpbnNlcnQgb3V0cHV0RGl2IGFuZCBvdXRwdXRFbGVtZW50IGFjY29yZGluZ2x5XG4gICAgY2hlZXJpbyA/PSByZXF1aXJlICdjaGVlcmlvJ1xuICAgICQgPSBjaGVlcmlvLmxvYWQoaHRtbENvbnRlbnQsIHtkZWNvZGVFbnRpdGllczogZmFsc2V9KVxuICAgIGNvZGVDaHVua3MgPSAkKCcuY29kZS1jaHVuaycpXG4gICAganNDb2RlID0gJydcbiAgICByZXF1aXJlQ2FjaGUgPSB7fSAjIGtleSBpcyBwYXRoXG4gICAgc2NyaXB0c1N0ciA9IFwiXCJcblxuICAgIGZvciBjb2RlQ2h1bmsgaW4gY29kZUNodW5rc1xuICAgICAgJGNvZGVDaHVuayA9ICQoY29kZUNodW5rKVxuICAgICAgZGF0YUFyZ3MgPSAkY29kZUNodW5rLmF0dHIoJ2RhdGEtYXJncycpLnVuZXNjYXBlKClcblxuICAgICAgb3B0aW9ucyA9IG51bGxcbiAgICAgIHRyeVxuICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgLT5cbiAgICAgICAgICBvcHRpb25zID0gZXZhbChcIih7I3tkYXRhQXJnc319KVwiKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBpZCA9IG9wdGlvbnMuaWRcbiAgICAgIGNvbnRpbnVlIGlmICFpZFxuXG4gICAgICBjbWQgPSBvcHRpb25zLmNtZCBvciAkY29kZUNodW5rLmF0dHIoJ2RhdGEtbGFuZycpXG4gICAgICBjb2RlID0gJGNvZGVDaHVuay5hdHRyKCdkYXRhLWNvZGUnKS51bmVzY2FwZSgpXG5cbiAgICAgIG91dHB1dERpdiA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/Lm91dHB1dERpdlxuICAgICAgb3V0cHV0RWxlbWVudCA9IEBjb2RlQ2h1bmtzRGF0YVtpZF0/Lm91dHB1dEVsZW1lbnRcblxuICAgICAgaWYgb3V0cHV0RGl2ICMgYXBwZW5kIG91dHB1dERpdiByZXN1bHRcbiAgICAgICAgJGNvZGVDaHVuay5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJvdXRwdXQtZGl2XFxcIj4je291dHB1dERpdi5pbm5lckhUTUx9PC9kaXY+XCIpXG4gICAgICAgIGlmIG9wdGlvbnMubWF0cGxvdGxpYiBvciBvcHRpb25zLm1wbFxuICAgICAgICAgICMgcmVtb3ZlIGlubmVySFRNTCBvZiA8ZGl2IGlkPVwiZmlnXy4uLlwiPjwvZGl2PlxuICAgICAgICAgICMgdGhpcyBpcyBmb3IgZml4aW5nIG1wbGQzIGV4cG9ydGluZyBpc3N1ZS5cbiAgICAgICAgICBncyA9ICQoJy5vdXRwdXQtZGl2ID4gZGl2JywgJGNvZGVDaHVuaylcbiAgICAgICAgICBpZiBnc1xuICAgICAgICAgICAgZm9yIGcgaW4gZ3NcbiAgICAgICAgICAgICAgJGcgPSAkKGcpXG4gICAgICAgICAgICAgIGlmICRnLmF0dHIoJ2lkJyk/Lm1hdGNoKC9maWdcXF8vKVxuICAgICAgICAgICAgICAgICRnLmh0bWwoJycpXG5cbiAgICAgICAgICBzcyA9ICQoJy5vdXRwdXQtZGl2ID4gc2NyaXB0JywgJGNvZGVDaHVuaylcbiAgICAgICAgICBpZiBzc1xuICAgICAgICAgICAgZm9yIHMgaW4gc3NcbiAgICAgICAgICAgICAgJHMgPSAkKHMpXG4gICAgICAgICAgICAgIGMgPSAkcy5odG1sKClcbiAgICAgICAgICAgICAgJHMucmVtb3ZlKClcbiAgICAgICAgICAgICAganNDb2RlICs9IChjICsgJ1xcbicpXG5cbiAgICAgIGlmIG9wdGlvbnMuZWxlbWVudFxuICAgICAgICAkY29kZUNodW5rLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIm91dHB1dC1lbGVtZW50XFxcIj4je29wdGlvbnMuZWxlbWVudH08L2Rpdj5cIilcblxuICAgICAgaWYgY21kID09ICdqYXZhc2NyaXB0J1xuICAgICAgICByZXF1aXJlcyA9IG9wdGlvbnMucmVxdWlyZSBvciBbXVxuICAgICAgICBpZiB0eXBlb2YocmVxdWlyZXMpID09ICdzdHJpbmcnXG4gICAgICAgICAgcmVxdWlyZXMgPSBbcmVxdWlyZXNdXG4gICAgICAgIHJlcXVpcmVzU3RyID0gXCJcIlxuICAgICAgICBmb3IgcmVxdWlyZVBhdGggaW4gcmVxdWlyZXNcbiAgICAgICAgICAjIFRPRE86IGNzc1xuICAgICAgICAgIGlmIHJlcXVpcmVQYXRoLm1hdGNoKC9eKGh0dHB8aHR0cHMpXFw6XFwvXFwvLylcbiAgICAgICAgICAgIGlmICghcmVxdWlyZUNhY2hlW3JlcXVpcmVQYXRoXSlcbiAgICAgICAgICAgICAgcmVxdWlyZUNhY2hlW3JlcXVpcmVQYXRoXSA9IHRydWVcbiAgICAgICAgICAgICAgc2NyaXB0c1N0ciArPSBcIjxzY3JpcHQgc3JjPVxcXCIje3JlcXVpcmVQYXRofVxcXCI+PC9zY3JpcHQ+XFxuXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXF1aXJlUGF0aCA9IHBhdGgucmVzb2x2ZShAZmlsZURpcmVjdG9yeVBhdGgsIHJlcXVpcmVQYXRoKVxuICAgICAgICAgICAgaWYgIXJlcXVpcmVDYWNoZVtyZXF1aXJlUGF0aF1cbiAgICAgICAgICAgICAgcmVxdWlyZXNTdHIgKz0gKGZzLnJlYWRGaWxlU3luYyhyZXF1aXJlUGF0aCwge2VuY29kaW5nOiAndXRmLTgnfSkgKyAnXFxuJylcbiAgICAgICAgICAgICAgcmVxdWlyZUNhY2hlW3JlcXVpcmVQYXRoXSA9IHRydWVcblxuICAgICAgICBqc0NvZGUgKz0gKHJlcXVpcmVzU3RyICsgY29kZSArICdcXG4nKVxuXG4gICAgaHRtbCA9ICQuaHRtbCgpXG4gICAgaHRtbCArPSBcIiN7c2NyaXB0c1N0cn1cXG5cIiBpZiBzY3JpcHRzU3RyXG4gICAgaHRtbCArPSBcIjxzY3JpcHQgZGF0YS1qcy1jb2RlPiN7anNDb2RlfTwvc2NyaXB0PlwiIGlmIGpzQ29kZVxuICAgIHJldHVybiBodG1sXG5cbiAgIyNcbiAgIyB7RnVuY3Rpb259IGNhbGxiYWNrIChodG1sQ29udGVudClcbiAgZ2V0SFRNTENvbnRlbnQ6ICh7aXNGb3JQcmludCwgb2ZmbGluZSwgdXNlUmVsYXRpdmVJbWFnZVBhdGgsIHBoYW50b21qc1R5cGUsIGlzRm9yUHJpbmNlLCBlbWJlZExvY2FsSW1hZ2VzfSwgY2FsbGJhY2spLT5cbiAgICBpc0ZvclByaW50ID89IGZhbHNlXG4gICAgb2ZmbGluZSA/PSBmYWxzZVxuICAgIHVzZVJlbGF0aXZlSW1hZ2VQYXRoID89IGZhbHNlXG4gICAgcGhhbnRvbWpzVHlwZSA/PSBmYWxzZSAjIHBkZiB8IHBuZyB8IGpwZWcgfCBmYWxzZVxuICAgIGlzRm9yUHJpbmNlID89IGZhbHNlXG4gICAgZW1iZWRMb2NhbEltYWdlcyA/PSBmYWxzZVxuICAgIHJldHVybiBjYWxsYmFjaygpIGlmIG5vdCBAZWRpdG9yXG5cbiAgICBtYXRoUmVuZGVyaW5nT3B0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hdGhSZW5kZXJpbmdPcHRpb24nKVxuXG4gICAgcmVzID0gQHBhcnNlTUQgQGZvcm1hdFN0cmluZ0JlZm9yZVBhcnNpbmcoQGVkaXRvci5nZXRUZXh0KCkpLCB7dXNlUmVsYXRpdmVJbWFnZVBhdGgsIEBmaWxlRGlyZWN0b3J5UGF0aCwgQHByb2plY3REaXJlY3RvcnlQYXRoLCBtYXJrZG93blByZXZpZXc6IHRoaXMsIGhpZGVGcm9udE1hdHRlcjogdHJ1ZX0sICh7aHRtbCwgeWFtbENvbmZpZywgc2xpZGVDb25maWdzfSk9PlxuICAgICAgaHRtbENvbnRlbnQgPSBAZm9ybWF0U3RyaW5nQWZ0ZXJQYXJzaW5nKGh0bWwpXG4gICAgICB5YW1sQ29uZmlnID0geWFtbENvbmZpZyBvciB7fVxuXG5cbiAgICAgICMgcmVwbGFjZSBjb2RlIGNodW5rcyBpbnNpZGUgaHRtbENvbnRlbnRcbiAgICAgIGh0bWxDb250ZW50ID0gQGluc2VydENvZGVDaHVua3NSZXN1bHQgaHRtbENvbnRlbnRcblxuICAgICAgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnS2FUZVgnXG4gICAgICAgIGlmIG9mZmxpbmVcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCJcbiAgICAgICAgICAgICAgICBocmVmPVxcXCJmaWxlOi8vLyN7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL25vZGVfbW9kdWxlcy9rYXRleC9kaXN0L2thdGV4Lm1pbi5jc3MnKX1cXFwiPlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj1cXFwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvS2FUZVgvMC43LjEva2F0ZXgubWluLmNzc1xcXCI+XCJcbiAgICAgIGVsc2UgaWYgbWF0aFJlbmRlcmluZ09wdGlvbiA9PSAnTWF0aEpheCdcbiAgICAgICAgaW5saW5lID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmluZGljYXRvckZvck1hdGhSZW5kZXJpbmdJbmxpbmUnKVxuICAgICAgICBibG9jayA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nQmxvY2snKVxuICAgICAgICBtYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50cycpXG4gICAgICAgIGlmIG9mZmxpbmVcbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC94LW1hdGhqYXgtY29uZmlnXFxcIj5cbiAgICAgICAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICAgICAgICAgIG1lc3NhZ2VTdHlsZTogJ25vbmUnLFxuICAgICAgICAgICAgICB0ZXgyamF4OiB7aW5saW5lTWF0aDogI3tpbmxpbmV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGg6ICN7YmxvY2t9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vudmlyb25tZW50czogI3ttYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50c30sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXNjYXBlczogdHJ1ZX1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC9qYXZhc2NyaXB0XFxcIiBhc3luYyBzcmM9XFxcImZpbGU6Ly8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvbWF0aGpheC9NYXRoSmF4LmpzP2NvbmZpZz1UZVgtQU1TX0NIVE1MJyl9XFxcIj48L3NjcmlwdD5cbiAgICAgICAgICBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBpbmxpbmVNYXRoOiBbIFsnJCcsJyQnXSwgW1wiXFxcXChcIixcIlxcXFwpXCJdIF0sXG4gICAgICAgICAgIyBkaXNwbGF5TWF0aDogWyBbJyQkJywnJCQnXSwgW1wiXFxcXFtcIixcIlxcXFxdXCJdIF1cbiAgICAgICAgICBtYXRoU3R5bGUgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC94LW1hdGhqYXgtY29uZmlnXFxcIj5cbiAgICAgICAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICAgICAgICAgIG1lc3NhZ2VTdHlsZTogJ25vbmUnLFxuICAgICAgICAgICAgICB0ZXgyamF4OiB7aW5saW5lTWF0aDogI3tpbmxpbmV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1hdGg6ICN7YmxvY2t9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vudmlyb25tZW50czogI3ttYXRoSmF4UHJvY2Vzc0Vudmlyb25tZW50c30sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXNjYXBlczogdHJ1ZX1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwidGV4dC9qYXZhc2NyaXB0XFxcIiBhc3luYyBzcmM9XFxcImh0dHBzOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanM/Y29uZmlnPVRlWC1NTUwtQU1fQ0hUTUxcXFwiPjwvc2NyaXB0PlxuICAgICAgICAgIFwiXG4gICAgICBlbHNlXG4gICAgICAgIG1hdGhTdHlsZSA9ICcnXG5cbiAgICAgICMgcHJlc2VudGF0aW9uXG4gICAgICBpZiBzbGlkZUNvbmZpZ3MubGVuZ3RoXG4gICAgICAgIGh0bWxDb250ZW50ID0gQHBhcnNlU2xpZGVzRm9yRXhwb3J0KGh0bWxDb250ZW50LCBzbGlkZUNvbmZpZ3MsIHVzZVJlbGF0aXZlSW1hZ2VQYXRoKVxuICAgICAgICBpZiBvZmZsaW5lXG4gICAgICAgICAgcHJlc2VudGF0aW9uU2NyaXB0ID0gXCJcbiAgICAgICAgICA8c2NyaXB0IHNyYz0nZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcmV2ZWFsL2xpYi9qcy9oZWFkLm1pbi5qcycpfSc+PC9zY3JpcHQ+XG4gICAgICAgICAgPHNjcmlwdCBzcmM9J2ZpbGU6Ly8vI3twYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3JldmVhbC9qcy9yZXZlYWwuanMnKX0nPjwvc2NyaXB0PlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcmVzZW50YXRpb25TY3JpcHQgPSBcIlxuICAgICAgICAgIDxzY3JpcHQgc3JjPSdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9yZXZlYWwuanMvMy40LjEvbGliL2pzL2hlYWQubWluLmpzJz48L3NjcmlwdD5cbiAgICAgICAgICA8c2NyaXB0IHNyYz0naHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvcmV2ZWFsLmpzLzMuNC4xL2pzL3JldmVhbC5taW4uanMnPjwvc2NyaXB0PlwiXG5cbiAgICAgICAgcHJlc2VudGF0aW9uQ29uZmlnID0geWFtbENvbmZpZ1sncHJlc2VudGF0aW9uJ10gb3Ige31cbiAgICAgICAgZGVwZW5kZW5jaWVzID0gcHJlc2VudGF0aW9uQ29uZmlnLmRlcGVuZGVuY2llcyBvciBbXVxuICAgICAgICBpZiBwcmVzZW50YXRpb25Db25maWcuZW5hYmxlU3BlYWtlck5vdGVzXG4gICAgICAgICAgaWYgb2ZmbGluZVxuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLnB1c2gge3NyYzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcGx1Z2luL25vdGVzL25vdGVzLmpzJyksIGFzeW5jOiB0cnVlfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlcGVuZGVuY2llcy5wdXNoIHtzcmM6ICdyZXZlYWxqc19kZXBzL25vdGVzLmpzJywgYXN5bmM6IHRydWV9ICMgVE9ETzogY29weSBub3Rlcy5qcyBmaWxlIHRvIGNvcnJlc3BvbmRpbmcgZm9sZGVyXG4gICAgICAgIHByZXNlbnRhdGlvbkNvbmZpZy5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXNcblxuICAgICAgICAjICAgICAgIDxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj0nZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcmV2ZWFsL3JldmVhbC5jc3MnKX0nPlxuICAgICAgICBwcmVzZW50YXRpb25TdHlsZSA9IFwiXCJcIlxuXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgI3tmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcmV2ZWFsLmNzcycpKX1cblxuICAgICAgICAje2lmIGlzRm9yUHJpbnQgdGhlbiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9yZXZlYWwvcGRmLmNzcycpKSBlbHNlICcnfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgcHJlc2VudGF0aW9uSW5pdFNjcmlwdCA9IFwiXCJcIlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgIFJldmVhbC5pbml0aWFsaXplKCN7SlNPTi5zdHJpbmdpZnkoT2JqZWN0LmFzc2lnbih7bWFyZ2luOiAwLjF9LCBwcmVzZW50YXRpb25Db25maWcpKX0pXG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgcHJlc2VudGF0aW9uU2NyaXB0ID0gJydcbiAgICAgICAgcHJlc2VudGF0aW9uU3R5bGUgPSAnJ1xuICAgICAgICBwcmVzZW50YXRpb25Jbml0U2NyaXB0ID0gJydcblxuICAgICAgIyBwaGFudG9tanNcbiAgICAgIHBoYW50b21qc0NsYXNzID0gJydcbiAgICAgIGlmIHBoYW50b21qc1R5cGVcbiAgICAgICAgaWYgcGhhbnRvbWpzVHlwZSA9PSAnLnBkZidcbiAgICAgICAgICBwaGFudG9tanNDbGFzcyA9ICdwaGFudG9tanMtcGRmJ1xuICAgICAgICBlbHNlIGlmIHBoYW50b21qc1R5cGUgPT0gJy5wbmcnIG9yIHBoYW50b21qc1R5cGUgPT0gJy5qcGVnJ1xuICAgICAgICAgIHBoYW50b21qc0NsYXNzID0gJ3BoYW50b21qcy1pbWFnZSdcblxuICAgICAgcHJpbmNlQ2xhc3MgPSAnJ1xuICAgICAgcHJpbmNlQ2xhc3MgPSAncHJpbmNlJyBpZiBpc0ZvclByaW5jZVxuXG4gICAgICB0aXRsZSA9IEBnZXRGaWxlTmFtZSgpXG4gICAgICB0aXRsZSA9IHRpdGxlLnNsaWNlKDAsIHRpdGxlLmxlbmd0aCAtIHBhdGguZXh0bmFtZSh0aXRsZSkubGVuZ3RoKSAjIHJlbW92ZSAnLm1kJ1xuXG4gICAgICBwcmV2aWV3VGhlbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJldmlld1RoZW1lJylcbiAgICAgIGlmIGlzRm9yUHJpbnQgYW5kIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZVc2VHaXRodWInKVxuICAgICAgICBwcmV2aWV3VGhlbWUgPSAnbXBlLWdpdGh1Yi1zeW50YXgnXG5cbiAgICAgICMgZ2V0IHN0eWxlLmxlc3NcbiAgICAgIHN0eWxlTGVzcyA9ICcnXG4gICAgICB1c2VyU3R5bGVTaGVldFBhdGggPSBhdG9tLnN0eWxlcy5nZXRVc2VyU3R5bGVTaGVldFBhdGgoKVxuICAgICAgc3R5bGVFbGVtZW50cyA9IGF0b20uc3R5bGVzLmdldFN0eWxlRWxlbWVudHMoKVxuICAgICAgaSA9IHN0eWxlRWxlbWVudHMubGVuZ3RoIC0gMVxuICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgIHN0eWxlRWxlbSA9IHN0eWxlRWxlbWVudHNbaV1cbiAgICAgICAgaWYgc3R5bGVFbGVtLmdldEF0dHJpYnV0ZSgnc291cmNlLXBhdGgnKSA9PSB1c2VyU3R5bGVTaGVldFBhdGhcbiAgICAgICAgICBzdHlsZUxlc3MgPSBzdHlsZUVsZW0uaW5uZXJIVE1MXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgaSAtPSAxXG5cbiAgICAgIGxvYWRQcmV2aWV3VGhlbWUgcHJldmlld1RoZW1lLCB7Y2hhbmdlU3R5bGVFbGVtZW50OiBmYWxzZX0sIChlcnJvciwgY3NzKT0+XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhcIjxwcmU+I3tlcnJvcn08L3ByZT5cIikgaWYgZXJyb3JcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgIDwhRE9DVFlQRSBodG1sPlxuICAgIDxodG1sPlxuICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT4je3RpdGxlfTwvdGl0bGU+XG4gICAgICAgIDxtZXRhIGNoYXJzZXQ9XFxcInV0Zi04XFxcIj5cbiAgICAgICAgPG1ldGEgbmFtZT1cXFwidmlld3BvcnRcXFwiIGNvbnRlbnQ9XFxcIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcXFwiPlxuXG4gICAgICAgICN7cHJlc2VudGF0aW9uU3R5bGV9XG5cbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAje2Nzc31cbiAgICAgICAgI3tzdHlsZUxlc3N9XG4gICAgICAgIDwvc3R5bGU+XG5cbiAgICAgICAgI3ttYXRoU3R5bGV9XG5cbiAgICAgICAgI3twcmVzZW50YXRpb25TY3JpcHR9XG4gICAgICA8L2hlYWQ+XG4gICAgICA8Ym9keSBjbGFzcz1cXFwibWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCAje3BoYW50b21qc0NsYXNzfSAje3ByaW5jZUNsYXNzfVxcXCIgI3tpZiBAcHJlc2VudGF0aW9uTW9kZSB0aGVuICdkYXRhLXByZXNlbnRhdGlvbi1tb2RlJyBlbHNlICcnfT5cblxuICAgICAgI3todG1sQ29udGVudH1cblxuICAgICAgPC9ib2R5PlxuICAgICAgI3twcmVzZW50YXRpb25Jbml0U2NyaXB0fVxuICAgIDwvaHRtbD5cbiAgICAgIFwiXCJcIlxuICAgICAgaWYgZW1iZWRMb2NhbEltYWdlcyAjIGVtYmVkIGxvY2FsIGltYWdlcyBhcyBEYXRhIFVSSVxuICAgICAgICBjaGVlcmlvID89IHJlcXVpcmUgJ2NoZWVyaW8nXG4gICAgICAgIGFzeW5jID89IHJlcXVpcmUgJ2FzeW5jJ1xuXG4gICAgICAgIGFzeW5jRnVuY3Rpb25zID0gW11cbiAgICAgICAgJCA9IGNoZWVyaW8ubG9hZChodG1sKVxuICAgICAgICAkKCdpbWcnKS5lYWNoIChpLCBpbWcpLT5cbiAgICAgICAgICAkaW1nID0gJChpbWcpXG4gICAgICAgICAgc3JjID0gJGltZy5hdHRyKCdzcmMnKVxuICAgICAgICAgIGlmIHNyYy5zdGFydHNXaXRoKCdmaWxlOi8vLycpXG4gICAgICAgICAgICBzcmMgPSBzcmMuc2xpY2UoOClcbiAgICAgICAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9cXD8oXFwufFxcZCkrJC8sICcnKSAjIHJlbW92ZSBjYWNoZVxuICAgICAgICAgICAgaW1hZ2VUeXBlID0gcGF0aC5leHRuYW1lKHNyYykuc2xpY2UoMSlcbiAgICAgICAgICAgIGFzeW5jRnVuY3Rpb25zLnB1c2ggKGNiKS0+XG4gICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHNyYywgKGVycm9yLCBkYXRhKS0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKCkgaWYgZXJyb3JcbiAgICAgICAgICAgICAgICBiYXNlNjQgPSBuZXcgQnVmZmVyKGRhdGEpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgICAgICRpbWcuYXR0cignc3JjJywgXCJkYXRhOmltYWdlLyN7aW1hZ2VUeXBlfTtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwje2Jhc2U2NH1cIilcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoKVxuXG4gICAgICAgIGFzeW5jLnBhcmFsbGVsIGFzeW5jRnVuY3Rpb25zLCAoKS0+XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrICQuaHRtbCgpXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhodG1sKVxuXG4gICMgYXBpIGRvYyBbcHJpbnRUb1BERl0gZnVuY3Rpb25cbiAgIyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9lbGVjdHJvbi9ibG9iL21hc3Rlci9kb2NzL2FwaS93ZWItY29udGVudHMubWRcbiAgcHJpbnRQREY6IChodG1sUGF0aCwgZGVzdCktPlxuICAgIHJldHVybiBpZiBub3QgQGVkaXRvclxuXG4gICAge0Jyb3dzZXJXaW5kb3d9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGVcbiAgICB3aW4gPSBuZXcgQnJvd3NlcldpbmRvdyBzaG93OiBmYWxzZVxuICAgIHdpbi5sb2FkVVJMIGh0bWxQYXRoXG5cbiAgICAjIGdldCBtYXJnaW5zIHR5cGVcbiAgICBtYXJnaW5zVHlwZSA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXJnaW5zVHlwZScpXG4gICAgbWFyZ2luc1R5cGUgPSBpZiBtYXJnaW5zVHlwZSA9PSAnZGVmYXVsdCBtYXJnaW4nIHRoZW4gMCBlbHNlXG4gICAgICAgICAgICAgICAgICBpZiBtYXJnaW5zVHlwZSA9PSAnbm8gbWFyZ2luJyB0aGVuIDEgZWxzZSAyXG5cblxuICAgICMgZ2V0IG9yaWVudGF0aW9uXG4gICAgbGFuZHNjYXBlID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9yaWVudGF0aW9uJykgPT0gJ2xhbmRzY2FwZSdcblxuICAgIGxhc3RJbmRleE9mU2xhc2ggPSBkZXN0Lmxhc3RJbmRleE9mICcvJyBvciAwXG4gICAgcGRmTmFtZSA9IGRlc3Quc2xpY2UobGFzdEluZGV4T2ZTbGFzaCArIDEpXG5cbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RpZC1maW5pc2gtbG9hZCcsICgpPT5cbiAgICAgIHNldFRpbWVvdXQoKCk9PlxuICAgICAgICB3aW4ud2ViQ29udGVudHMucHJpbnRUb1BERlxuICAgICAgICAgIHBhZ2VTaXplOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZXhwb3J0UERGUGFnZUZvcm1hdCcpLFxuICAgICAgICAgIGxhbmRzY2FwZTogbGFuZHNjYXBlLFxuICAgICAgICAgIHByaW50QmFja2dyb3VuZDogYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnByaW50QmFja2dyb3VuZCcpLFxuICAgICAgICAgIG1hcmdpbnNUeXBlOiBtYXJnaW5zVHlwZSwgKGVyciwgZGF0YSk9PlxuICAgICAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gICAgICAgICAgICBkZXN0RmlsZSA9IG5ldyBGaWxlKGRlc3QpXG4gICAgICAgICAgICBkZXN0RmlsZS5jcmVhdGUoKS50aGVuIChmbGFnKT0+XG4gICAgICAgICAgICAgIGRlc3RGaWxlLndyaXRlIGRhdGFcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJGaWxlICN7cGRmTmFtZX0gd2FzIGNyZWF0ZWRcIiwgZGV0YWlsOiBcInBhdGg6ICN7ZGVzdH1cIlxuICAgICAgICAgICAgICAjIG9wZW4gcGRmXG4gICAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZPcGVuQXV0b21hdGljYWxseScpXG4gICAgICAgICAgICAgICAgQG9wZW5GaWxlIGRlc3RcbiAgICAgICwgNTAwKVxuXG4gIHNhdmVBc1BERjogKGRlc3QpLT5cbiAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcblxuICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlICMgZm9yIHByZXNlbnRhdGlvbiwgbmVlZCB0byBwcmludCBmcm9tIGNocm9tZVxuICAgICAgQG9wZW5JbkJyb3dzZXIodHJ1ZSlcbiAgICAgIHJldHVyblxuXG4gICAgQGdldEhUTUxDb250ZW50IGlzRm9yUHJpbnQ6IHRydWUsIG9mZmxpbmU6IHRydWUsIChodG1sQ29udGVudCk9PlxuICAgICAgdGVtcC5vcGVuXG4gICAgICAgIHByZWZpeDogJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQnLFxuICAgICAgICBzdWZmaXg6ICcuaHRtbCcsIChlcnIsIGluZm8pPT5cbiAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgZnMud3JpdGUgaW5mby5mZCwgaHRtbENvbnRlbnQsIChlcnIpPT5cbiAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgIEBwcmludFBERiBcImZpbGU6Ly8je2luZm8ucGF0aH1cIiwgZGVzdFxuXG4gIHNhdmVBc0hUTUw6IChkZXN0LCBvZmZsaW5lPXRydWUsIHVzZVJlbGF0aXZlSW1hZ2VQYXRoLCBlbWJlZExvY2FsSW1hZ2VzKS0+XG4gICAgcmV0dXJuIGlmIG5vdCBAZWRpdG9yXG5cbiAgICBAZ2V0SFRNTENvbnRlbnQgaXNGb3JQcmludDogZmFsc2UsIG9mZmxpbmU6IG9mZmxpbmUsIHVzZVJlbGF0aXZlSW1hZ2VQYXRoOiB1c2VSZWxhdGl2ZUltYWdlUGF0aCwgZW1iZWRMb2NhbEltYWdlczogZW1iZWRMb2NhbEltYWdlcywgKGh0bWxDb250ZW50KT0+XG5cbiAgICAgIGh0bWxGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZGVzdClcblxuICAgICAgIyBwcmVzZW50YXRpb24gc3BlYWtlciBub3Rlc1xuICAgICAgIyBjb3B5IGRlcGVuZGVuY3kgZmlsZXNcbiAgICAgIGlmICFvZmZsaW5lIGFuZCBodG1sQ29udGVudC5pbmRleE9mKCdbe1wic3JjXCI6XCJyZXZlYWxqc19kZXBzL25vdGVzLmpzXCIsXCJhc3luY1wiOnRydWV9XScpID49IDBcbiAgICAgICAgZGVwc0Rpck5hbWUgPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGRlc3QpLCAncmV2ZWFsanNfZGVwcycpXG4gICAgICAgIGRlcHNEaXIgPSBuZXcgRGlyZWN0b3J5KGRlcHNEaXJOYW1lKVxuICAgICAgICBkZXBzRGlyLmNyZWF0ZSgpLnRoZW4gKGZsYWcpLT5cbiAgICAgICAgICB0cnVlXG4gICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3JldmVhbC9wbHVnaW4vbm90ZXMvbm90ZXMuanMnKSkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShwYXRoLnJlc29sdmUoZGVwc0Rpck5hbWUsICdub3Rlcy5qcycpKSlcbiAgICAgICAgICBmcy5jcmVhdGVSZWFkU3RyZWFtKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvcmV2ZWFsL3BsdWdpbi9ub3Rlcy9ub3Rlcy5odG1sJykpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5yZXNvbHZlKGRlcHNEaXJOYW1lLCAnbm90ZXMuaHRtbCcpKSlcblxuICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkZXN0KVxuICAgICAgZGVzdEZpbGUuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgICBkZXN0RmlsZS53cml0ZSBodG1sQ29udGVudFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIkZpbGUgI3todG1sRmlsZU5hbWV9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje2Rlc3R9XCIpXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIyBQcmVzZW50YXRpb25cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgcGFyc2VTbGlkZXM6IChodG1sLCBzbGlkZUNvbmZpZ3MsIHlhbWxDb25maWcpLT5cbiAgICBzbGlkZXMgPSBodG1sLnNwbGl0ICc8ZGl2IGNsYXNzPVwibmV3LXNsaWRlXCI+PC9kaXY+J1xuICAgIHNsaWRlcyA9IHNsaWRlcy5zbGljZSgxKVxuICAgIG91dHB1dCA9ICcnXG5cbiAgICBvZmZzZXQgPSAwXG4gICAgd2lkdGggPSA5NjBcbiAgICBoZWlnaHQgPSA3MDBcblxuICAgIGlmIHlhbWxDb25maWcgYW5kIHlhbWxDb25maWdbJ3ByZXNlbnRhdGlvbiddXG4gICAgICBwcmVzZW50YXRpb25Db25maWcgPSB5YW1sQ29uZmlnWydwcmVzZW50YXRpb24nXVxuICAgICAgd2lkdGggPSBwcmVzZW50YXRpb25Db25maWdbJ3dpZHRoJ10gb3IgOTYwXG4gICAgICBoZWlnaHQgPSBwcmVzZW50YXRpb25Db25maWdbJ2hlaWdodCddIG9yIDcwMFxuXG4gICAgIyByYXRpbyA9IGhlaWdodCAvIHdpZHRoICogMTAwICsgJyUnXG4gICAgem9vbSA9IChAZWxlbWVudC5vZmZzZXRXaWR0aCAtIDEyOCkvd2lkdGggIyMgNjQgaXMgMipwYWRkaW5nXG4gICAgQHByZXNlbnRhdGlvblpvb20gPSB6b29tXG5cbiAgICBmb3Igc2xpZGUgaW4gc2xpZGVzXG4gICAgICAjIHNsaWRlID0gc2xpZGUudHJpbSgpXG4gICAgICAjIGlmIHNsaWRlLmxlbmd0aFxuICAgICAgc2xpZGVDb25maWcgPSBzbGlkZUNvbmZpZ3Nbb2Zmc2V0XVxuICAgICAgc3R5bGVTdHJpbmcgPSAnJ1xuICAgICAgdmlkZW9TdHJpbmcgPSAnJ1xuICAgICAgaWZyYW1lU3RyaW5nID0gJydcbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtaW1hZ2UnXVxuICAgICAgICBzdHlsZVN0cmluZyArPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnI3tAcmVzb2x2ZUZpbGVQYXRoKHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtaW1hZ2UnXSl9Jyk7XCJcblxuICAgICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXNpemUnXVxuICAgICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1zaXplOiAje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtc2l6ZSddfTtcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiXG5cbiAgICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1wb3NpdGlvbiddXG4gICAgICAgICAgc3R5bGVTdHJpbmcgKz0gXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiAje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtcG9zaXRpb24nXX07XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1wiXG5cbiAgICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1yZXBlYXQnXVxuICAgICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1yZXBlYXQ6ICN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1yZXBlYXQnXX07XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0eWxlU3RyaW5nICs9IFwiYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcIlxuXG4gICAgICBlbHNlIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtY29sb3InXVxuICAgICAgICBzdHlsZVN0cmluZyArPSBcImJhY2tncm91bmQtY29sb3I6ICN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1jb2xvciddfSAhaW1wb3J0YW50O1wiXG5cbiAgICAgIGVsc2UgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC12aWRlbyddXG4gICAgICAgIHZpZGVvTXV0ZWQgPSBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLW11dGVkJ11cbiAgICAgICAgdmlkZW9Mb29wID0gc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC12aWRlby1sb29wJ11cblxuICAgICAgICBtdXRlZF8gPSBpZiB2aWRlb011dGVkIHRoZW4gJ211dGVkJyBlbHNlICcnXG4gICAgICAgIGxvb3BfID0gaWYgdmlkZW9Mb29wIHRoZW4gJ2xvb3AnIGVsc2UgJydcblxuICAgICAgICB2aWRlb1N0cmluZyA9IFwiXCJcIlxuICAgICAgICA8dmlkZW8gI3ttdXRlZF99ICN7bG9vcF99IHBsYXlzaW5saW5lIGF1dG9wbGF5IGNsYXNzPVxcXCJiYWNrZ3JvdW5kLXZpZGVvXFxcIiBzcmM9XFxcIiN7QHJlc29sdmVGaWxlUGF0aChzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvJ10pfVxcXCI+XG4gICAgICAgIDwvdmlkZW8+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAjICAgICAgICAgICA8c291cmNlIHNyYz1cXFwiI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvJ119XFxcIj5cblxuICAgICAgZWxzZSBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZSddXG4gICAgICAgIGlmcmFtZVN0cmluZyA9IFwiXCJcIlxuICAgICAgICA8aWZyYW1lIGNsYXNzPVxcXCJiYWNrZ3JvdW5kLWlmcmFtZVxcXCIgc3JjPVxcXCIje0ByZXNvbHZlRmlsZVBhdGgoc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pZnJhbWUnXSl9XFxcIiBmcmFtZWJvcmRlcj1cIjBcIiA+IDwvaWZyYW1lPlxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kLWlmcmFtZS1vdmVybGF5XFxcIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIG91dHB1dCArPSBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nc2xpZGUnIGRhdGEtb2Zmc2V0PScje29mZnNldH0nIHN0eWxlPVwid2lkdGg6ICN7d2lkdGh9cHg7IGhlaWdodDogI3toZWlnaHR9cHg7IHpvb206ICN7em9vbX07ICN7c3R5bGVTdHJpbmd9XCI+XG4gICAgICAgICAgI3t2aWRlb1N0cmluZ31cbiAgICAgICAgICAje2lmcmFtZVN0cmluZ31cbiAgICAgICAgICA8c2VjdGlvbj4je3NsaWRlfTwvc2VjdGlvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcbiAgICAgIG9mZnNldCArPSAxXG5cbiAgICAjIHJlbW92ZSA8YXNpZGUgY2xhc3M9XCJub3Rlc1wiPiAuLi4gPC9hc2lkZT5cbiAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvKDxhc2lkZVxcYltePl0qPilbXjw+XSooPFxcL2FzaWRlPikvaWcsICcnKVxuXG4gICAgXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInByZXZpZXctc2xpZGVzXCI+XG4gICAgICAje291dHB1dH1cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxuICBwYXJzZVNsaWRlc0ZvckV4cG9ydDogKGh0bWwsIHNsaWRlQ29uZmlncywgdXNlUmVsYXRpdmVJbWFnZVBhdGgpLT5cbiAgICBzbGlkZXMgPSBodG1sLnNwbGl0ICc8ZGl2IGNsYXNzPVwibmV3LXNsaWRlXCI+PC9kaXY+J1xuICAgIHNsaWRlcyA9IHNsaWRlcy5zbGljZSgxKVxuICAgIG91dHB1dCA9ICcnXG5cbiAgICBwYXJzZUF0dHJTdHJpbmcgPSAoc2xpZGVDb25maWcpPT5cbiAgICAgIGF0dHJTdHJpbmcgPSAnJ1xuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pbWFnZSddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLWltYWdlPScje0ByZXNvbHZlRmlsZVBhdGgoc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pbWFnZSddLCB1c2VSZWxhdGl2ZUltYWdlUGF0aCl9J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtc2l6ZSddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLXNpemU9JyN7c2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1zaXplJ119J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtcG9zaXRpb24nXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC1wb3NpdGlvbj0nI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXBvc2l0aW9uJ119J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtcmVwZWF0J11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLWJhY2tncm91bmQtcmVwZWF0PScje3NsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtcmVwZWF0J119J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtY29sb3InXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC1jb2xvcj0nI3tzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWNvbG9yJ119J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLW5vdGVzJ11cbiAgICAgICAgYXR0clN0cmluZyArPSBcIiBkYXRhLW5vdGVzPScje3NsaWRlQ29uZmlnWydkYXRhLW5vdGVzJ119J1wiXG5cbiAgICAgIGlmIHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8nXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC12aWRlbz0nI3tAcmVzb2x2ZUZpbGVQYXRoKHNsaWRlQ29uZmlnWydkYXRhLWJhY2tncm91bmQtdmlkZW8nXSwgdXNlUmVsYXRpdmVJbWFnZVBhdGgpfSdcIlxuXG4gICAgICBpZiBzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLWxvb3AnXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC12aWRlby1sb29wXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC12aWRlby1tdXRlZCddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS1iYWNrZ3JvdW5kLXZpZGVvLW11dGVkXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtdHJhbnNpdGlvbiddXG4gICAgICAgIGF0dHJTdHJpbmcgKz0gXCIgZGF0YS10cmFuc2l0aW9uPScje3NsaWRlQ29uZmlnWydkYXRhLXRyYW5zaXRpb24nXX0nXCJcblxuICAgICAgaWYgc2xpZGVDb25maWdbJ2RhdGEtYmFja2dyb3VuZC1pZnJhbWUnXVxuICAgICAgICBhdHRyU3RyaW5nICs9IFwiIGRhdGEtYmFja2dyb3VuZC1pZnJhbWU9JyN7QHJlc29sdmVGaWxlUGF0aChzbGlkZUNvbmZpZ1snZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZSddLCB1c2VSZWxhdGl2ZUltYWdlUGF0aCl9J1wiXG4gICAgICBhdHRyU3RyaW5nXG5cbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBzbGlkZXMubGVuZ3RoXG4gICAgICBzbGlkZSA9IHNsaWRlc1tpXVxuICAgICAgc2xpZGVDb25maWcgPSBzbGlkZUNvbmZpZ3NbaV1cbiAgICAgIGF0dHJTdHJpbmcgPSBwYXJzZUF0dHJTdHJpbmcoc2xpZGVDb25maWcpXG5cbiAgICAgIGlmICFzbGlkZUNvbmZpZ1sndmVydGljYWwnXVxuICAgICAgICBpZiBpID4gMCBhbmQgc2xpZGVDb25maWdzW2ktMV1bJ3ZlcnRpY2FsJ10gIyBlbmQgb2YgdmVydGljYWwgc2xpZGVzXG4gICAgICAgICAgb3V0cHV0ICs9ICc8L3NlY3Rpb24+J1xuICAgICAgICBpZiBpIDwgc2xpZGVzLmxlbmd0aCAtIDEgYW5kIHNsaWRlQ29uZmlnc1tpKzFdWyd2ZXJ0aWNhbCddICMgc3RhcnQgb2YgdmVydGljYWwgc2xpZGVzXG4gICAgICAgICAgb3V0cHV0ICs9IFwiPHNlY3Rpb24+XCJcblxuICAgICAgb3V0cHV0ICs9IFwiPHNlY3Rpb24gI3thdHRyU3RyaW5nfT4je3NsaWRlfTwvc2VjdGlvbj5cIlxuICAgICAgaSArPSAxXG5cbiAgICBpZiBpID4gMCBhbmQgc2xpZGVDb25maWdzW2ktMV1bJ3ZlcnRpY2FsJ10gIyBlbmQgb2YgdmVydGljYWwgc2xpZGVzXG4gICAgICBvdXRwdXQgKz0gXCI8L3NlY3Rpb24+XCJcblxuICAgIFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJyZXZlYWxcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzbGlkZXNcIj5cbiAgICAgICAgI3tvdXRwdXR9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIFBoYW50b21KU1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBsb2FkUGhhbnRvbUpTSGVhZGVyRm9vdGVyQ29uZmlnOiAoKS0+XG4gICAgIyBtZXJtYWlkX2NvbmZpZy5qc1xuICAgIGNvbmZpZ1BhdGggPSBwYXRoLnJlc29sdmUoYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCwgJy4vbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC9waGFudG9tanNfaGVhZGVyX2Zvb3Rlcl9jb25maWcuanMnKVxuICAgIHRyeVxuICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKGNvbmZpZ1BhdGgpXSAjIHJldHVybiB1bmNhY2hlZFxuICAgICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCkgb3Ige31cbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uZmlnRmlsZSA9IG5ldyBGaWxlKGNvbmZpZ1BhdGgpXG4gICAgICBjb25maWdGaWxlLmNyZWF0ZSgpLnRoZW4gKGZsYWcpLT5cbiAgICAgICAgaWYgIWZsYWcgIyBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHRvIGxvYWQgcGhhbnRvbWpzX2hlYWRlcl9mb290ZXJfY29uZmlnLmpzJywgZGV0YWlsOiAndGhlcmUgbWlnaHQgYmUgZXJyb3JzIGluIHlvdXIgY29uZmlnIGZpbGUnKVxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGNvbmZpZ0ZpbGUud3JpdGUgXCJcIlwiXG4ndXNlIHN0cmljdCdcbi8qXG5jb25maWd1cmUgaGVhZGVyIGFuZCBmb290ZXIgKGFuZCBvdGhlciBvcHRpb25zKVxubW9yZSBpbmZvcm1hdGlvbiBjYW4gYmUgZm91bmQgaGVyZTpcbiAgICBodHRwczovL2dpdGh1Yi5jb20vbWFyY2JhY2htYW5uL25vZGUtaHRtbC1wZGZcbkF0dGVudGlvbjogdGhpcyBjb25maWcgd2lsbCBvdmVycmlkZSB5b3VyIGNvbmZpZyBpbiBleHBvcnRlciBwYW5lbC5cblxuZWc6XG5cbiAgbGV0IGNvbmZpZyA9IHtcbiAgICBcImhlYWRlclwiOiB7XG4gICAgICBcImhlaWdodFwiOiBcIjQ1bW1cIixcbiAgICAgIFwiY29udGVudHNcIjogJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+QXV0aG9yOiBNYXJjIEJhY2htYW5uPC9kaXY+J1xuICAgIH0sXG4gICAgXCJmb290ZXJcIjoge1xuICAgICAgXCJoZWlnaHRcIjogXCIyOG1tXCIsXG4gICAgICBcImNvbnRlbnRzXCI6ICc8c3BhbiBzdHlsZT1cImNvbG9yOiAjNDQ0O1wiPnt7cGFnZX19PC9zcGFuPi88c3Bhbj57e3BhZ2VzfX08L3NwYW4+J1xuICAgIH1cbiAgfVxuKi9cbi8vIHlvdSBjYW4gZWRpdCB0aGUgJ2NvbmZpZycgdmFyaWFibGUgYmVsb3dcbmxldCBjb25maWcgPSB7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uZmlnIHx8IHt9XG5cIlwiXCJcbiAgICAgIHJldHVybiB7fVxuXG4gIHBoYW50b21KU0V4cG9ydDogKGRlc3QpLT5cbiAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcblxuICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlICMgZm9yIHByZXNlbnRhdGlvbiwgbmVlZCB0byBwcmludCBmcm9tIGNocm9tZVxuICAgICAgQG9wZW5JbkJyb3dzZXIodHJ1ZSlcbiAgICAgIHJldHVyblxuXG4gICAgQGdldEhUTUxDb250ZW50IGlzRm9yUHJpbnQ6IHRydWUsIG9mZmxpbmU6IHRydWUsIHBoYW50b21qc1R5cGU6IHBhdGguZXh0bmFtZShkZXN0KSwgKGh0bWxDb250ZW50KT0+XG5cbiAgICAgIGZpbGVUeXBlID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBoYW50b21KU0V4cG9ydEZpbGVUeXBlJylcbiAgICAgIGZvcm1hdCA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5leHBvcnRQREZQYWdlRm9ybWF0JylcbiAgICAgIG9yaWVudGF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9yaWVudGF0aW9uJylcbiAgICAgIG1hcmdpbiA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5waGFudG9tSlNNYXJnaW4nKS50cmltKClcblxuICAgICAgaWYgIW1hcmdpbi5sZW5ndGhcbiAgICAgICAgbWFyZ2luID0gJzFjbSdcbiAgICAgIGVsc2VcbiAgICAgICAgbWFyZ2luID0gbWFyZ2luLnNwbGl0KCcsJykubWFwIChtKS0+bS50cmltKClcbiAgICAgICAgaWYgbWFyZ2luLmxlbmd0aCA9PSAxXG4gICAgICAgICAgbWFyZ2luID0gbWFyZ2luWzBdXG4gICAgICAgIGVsc2UgaWYgbWFyZ2luLmxlbmd0aCA9PSAyXG4gICAgICAgICAgbWFyZ2luID0geyd0b3AnOiBtYXJnaW5bMF0sICdib3R0b20nOiBtYXJnaW5bMF0sICdsZWZ0JzogbWFyZ2luWzFdLCAncmlnaHQnOiBtYXJnaW5bMV19XG4gICAgICAgIGVsc2UgaWYgbWFyZ2luLmxlbmd0aCA9PSA0XG4gICAgICAgICAgbWFyZ2luID0geyd0b3AnOiBtYXJnaW5bMF0sICdyaWdodCc6IG1hcmdpblsxXSwgJ2JvdHRvbSc6IG1hcmdpblsyXSwgJ2xlZnQnOiBtYXJnaW5bM119XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXJnaW4gPSAnMWNtJ1xuXG4gICAgICAjIGdldCBoZWFkZXIgYW5kIGZvb3RlclxuICAgICAgY29uZmlnID0gQGxvYWRQaGFudG9tSlNIZWFkZXJGb290ZXJDb25maWcoKVxuXG4gICAgICBwZGZcbiAgICAgICAgLmNyZWF0ZSBodG1sQ29udGVudCwgT2JqZWN0LmFzc2lnbih7dHlwZTogZmlsZVR5cGUsIGZvcm1hdDogZm9ybWF0LCBvcmllbnRhdGlvbjogb3JpZW50YXRpb24sIGJvcmRlcjogbWFyZ2luLCBxdWFsaXR5OiAnNzUnLCB0aW1lb3V0OiA2MDAwMCwgc2NyaXB0OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3BoYW50b21qcy9wZGZfYTRfcG9ydHJhaXQuanMnKX0sIGNvbmZpZylcbiAgICAgICAgLnRvRmlsZSBkZXN0LCAoZXJyLCByZXMpPT5cbiAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBlcnJcbiAgICAgICAgICAjIG9wZW4gcGRmXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbGFzdEluZGV4T2ZTbGFzaCA9IGRlc3QubGFzdEluZGV4T2YgJy8nIG9yIDBcbiAgICAgICAgICAgIGZpbGVOYW1lID0gZGVzdC5zbGljZShsYXN0SW5kZXhPZlNsYXNoICsgMSlcblxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJGaWxlICN7ZmlsZU5hbWV9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje2Rlc3R9XCJcbiAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZPcGVuQXV0b21hdGljYWxseScpXG4gICAgICAgICAgICAgIEBvcGVuRmlsZSBkZXN0XG5cbiAgIyMgcHJpbmNlXG4gIHByaW5jZUV4cG9ydDogKGRlc3QpLT5cbiAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnWW91ciBkb2N1bWVudCBpcyBiZWluZyBwcmVwYXJlZCcsIGRldGFpbDogJzopJylcbiAgICBAZ2V0SFRNTENvbnRlbnQgb2ZmbGluZTogdHJ1ZSwgaXNGb3JQcmludDogdHJ1ZSwgaXNGb3JQcmluY2U6IHRydWUsIChodG1sQ29udGVudCk9PlxuXG4gICAgICB0ZW1wLm9wZW5cbiAgICAgICAgcHJlZml4OiAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCdcbiAgICAgICAgc3VmZml4OiAnLmh0bWwnLCAoZXJyLCBpbmZvKT0+XG4gICAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gICAgICAgICAgZnMud3JpdGUgaW5mby5mZCwgaHRtbENvbnRlbnQsIChlcnIpPT5cbiAgICAgICAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgIGlmIEBwcmVzZW50YXRpb25Nb2RlXG4gICAgICAgICAgICAgIHVybCA9ICdmaWxlOi8vLycgKyBpbmZvLnBhdGggKyAnP3ByaW50LXBkZidcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1BsZWFzZSBjb3B5IGFuZCBvcGVuIHRoZSBsaW5rIGJlbG93IGluIENocm9tZS5cXG5UaGVuIFJpZ2h0IENsaWNrIC0+IFByaW50IC0+IFNhdmUgYXMgUGRmLicsIGRpc21pc3NhYmxlOiB0cnVlLCBkZXRhaWw6IHVybClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcHJpbmNlQ29udmVydCBpbmZvLnBhdGgsIGRlc3QsIChlcnIpPT5cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG5cbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIkZpbGUgI3twYXRoLmJhc2VuYW1lKGRlc3QpfSB3YXMgY3JlYXRlZFwiLCBkZXRhaWw6IFwicGF0aDogI3tkZXN0fVwiXG5cbiAgICAgICAgICAgICAgICAjIG9wZW4gcGRmXG4gICAgICAgICAgICAgICAgQG9wZW5GaWxlIGRlc3QgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JylcblxuXG5cbiAgIyMgRUJPT0tcbiAgZ2VuZXJhdGVFYm9vazogKGRlc3QpLT5cbiAgICBAcGFyc2VNRCBAZm9ybWF0U3RyaW5nQmVmb3JlUGFyc2luZyhAZWRpdG9yLmdldFRleHQoKSksIHtpc0ZvckVib29rOiB0cnVlLCBAZmlsZURpcmVjdG9yeVBhdGgsIEBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgaGlkZUZyb250TWF0dGVyOnRydWV9LCAoe2h0bWwsIHlhbWxDb25maWd9KT0+XG4gICAgICBodG1sID0gQGZvcm1hdFN0cmluZ0FmdGVyUGFyc2luZyhodG1sKVxuXG4gICAgICBlYm9va0NvbmZpZyA9IG51bGxcbiAgICAgIGlmIHlhbWxDb25maWdcbiAgICAgICAgZWJvb2tDb25maWcgPSB5YW1sQ29uZmlnWydlYm9vayddXG5cbiAgICAgIGlmICFlYm9va0NvbmZpZ1xuICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdlYm9vayBjb25maWcgbm90IGZvdW5kJywgZGV0YWlsOiAncGxlYXNlIGluc2VydCBlYm9vayBmcm9udC1tYXR0ZXIgdG8geW91ciBtYXJrZG93biBmaWxlJylcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1lvdXIgZG9jdW1lbnQgaXMgYmVpbmcgcHJlcGFyZWQnLCBkZXRhaWw6ICc6KScpXG5cbiAgICAgICAgaWYgZWJvb2tDb25maWcuY292ZXIgIyBjaGFuZ2UgY292ZXIgdG8gYWJzb2x1dGUgcGF0aCBpZiBuZWNlc3NhcnlcbiAgICAgICAgICBjb3ZlciA9IGVib29rQ29uZmlnLmNvdmVyXG4gICAgICAgICAgaWYgY292ZXIuc3RhcnRzV2l0aCgnLi8nKSBvciBjb3Zlci5zdGFydHNXaXRoKCcuLi8nKVxuICAgICAgICAgICAgY292ZXIgPSBwYXRoLnJlc29sdmUoQGZpbGVEaXJlY3RvcnlQYXRoLCBjb3ZlcilcbiAgICAgICAgICAgIGVib29rQ29uZmlnLmNvdmVyID0gY292ZXJcbiAgICAgICAgICBlbHNlIGlmIGNvdmVyLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgICAgICAgY292ZXIgPSBwYXRoLnJlc29sdmUoQHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrY292ZXIpXG4gICAgICAgICAgICBlYm9va0NvbmZpZy5jb3ZlciA9IGNvdmVyXG5cbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgZGl2LmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgICBzdHJ1Y3R1cmUgPSBbXSAjIHtsZXZlbDowLCBmaWxlUGF0aDogJ3BhdGggdG8gZmlsZScsIGhlYWRpbmc6ICcnLCBpZDogJyd9XG4gICAgICAgIGhlYWRpbmdPZmZzZXQgPSAwXG5cbiAgICAgICAgIyBsb2FkIHRoZSBsYXN0IHVsLCBhbmFseXplIHRvYyBsaW5rcy5cbiAgICAgICAgZ2V0U3RydWN0dXJlID0gKHVsLCBsZXZlbCktPlxuICAgICAgICAgIGZvciBsaSBpbiB1bC5jaGlsZHJlblxuICAgICAgICAgICAgYSA9IGxpLmNoaWxkcmVuWzBdPy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpP1swXVxuICAgICAgICAgICAgY29udGludWUgaWYgbm90IGFcbiAgICAgICAgICAgIGZpbGVQYXRoID0gYS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSAjIGFzc3VtZSBtYXJrZG93biBmaWxlIHBhdGhcbiAgICAgICAgICAgIGhlYWRpbmcgPSBhLmlubmVySFRNTFxuICAgICAgICAgICAgaWQgPSAnZWJvb2staGVhZGluZy1pZC0nK2hlYWRpbmdPZmZzZXRcblxuICAgICAgICAgICAgc3RydWN0dXJlLnB1c2gge2xldmVsOiBsZXZlbCwgZmlsZVBhdGg6IGZpbGVQYXRoLCBoZWFkaW5nOiBoZWFkaW5nLCBpZDogaWR9XG4gICAgICAgICAgICBoZWFkaW5nT2Zmc2V0ICs9IDFcblxuICAgICAgICAgICAgYS5ocmVmID0gJyMnK2lkICMgY2hhbmdlIGlkXG5cbiAgICAgICAgICAgIGlmIGxpLmNoaWxkRWxlbWVudENvdW50ID4gMVxuICAgICAgICAgICAgICBnZXRTdHJ1Y3R1cmUobGkuY2hpbGRyZW5bMV0sIGxldmVsKzEpXG5cbiAgICAgICAgY2hpbGRyZW4gPSBkaXYuY2hpbGRyZW5cbiAgICAgICAgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgaWYgY2hpbGRyZW5baV0udGFnTmFtZSA9PSAnVUwnICMgZmluZCB0YWJsZSBvZiBjb250ZW50c1xuICAgICAgICAgICAgZ2V0U3RydWN0dXJlKGNoaWxkcmVuW2ldLCAwKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpIC09IDFcblxuICAgICAgICBvdXRwdXRIVE1MID0gZGl2LmlubmVySFRNTFxuXG4gICAgICAgICMgYXBwZW5kIGZpbGVzIGFjY29yZGluZyB0byBzdHJ1Y3R1cmVcbiAgICAgICAgZm9yIG9iaiBpbiBzdHJ1Y3R1cmVcbiAgICAgICAgICBoZWFkaW5nID0gb2JqLmhlYWRpbmdcbiAgICAgICAgICBpZCA9IG9iai5pZFxuICAgICAgICAgIGxldmVsID0gb2JqLmxldmVsXG4gICAgICAgICAgZmlsZVBhdGggPSBvYmouZmlsZVBhdGhcblxuICAgICAgICAgIGlmIGZpbGVQYXRoLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8vJylcbiAgICAgICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc2xpY2UoOClcblxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmLTgnfSlcbiAgICAgICAgICAgIEBwYXJzZU1EIEBmb3JtYXRTdHJpbmdCZWZvcmVQYXJzaW5nKHRleHQpLCB7aXNGb3JFYm9vazogdHJ1ZSwgcHJvamVjdERpcmVjdG9yeVBhdGg6IEBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgZmlsZURpcmVjdG9yeVBhdGg6IHBhdGguZGlybmFtZShmaWxlUGF0aCl9LCAoe2h0bWx9KT0+XG4gICAgICAgICAgICAgIGh0bWwgPSBAZm9ybWF0U3RyaW5nQWZ0ZXJQYXJzaW5nKGh0bWwpXG5cbiAgICAgICAgICAgICAgIyBhZGQgdG8gVE9DXG4gICAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBodG1sXG4gICAgICAgICAgICAgIGlmIGRpdi5jaGlsZEVsZW1lbnRDb3VudFxuICAgICAgICAgICAgICAgIGRpdi5jaGlsZHJlblswXS5pZCA9IGlkXG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuWzBdLnNldEF0dHJpYnV0ZSgnZWJvb2stdG9jLWxldmVsLScrKGxldmVsKzEpLCAnJylcbiAgICAgICAgICAgICAgICBkaXYuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdoZWFkaW5nJywgaGVhZGluZylcblxuICAgICAgICAgICAgICBvdXRwdXRIVE1MICs9IGRpdi5pbm5lckhUTUxcbiAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdFYm9vayBnZW5lcmF0aW9uOiBGYWlsZWQgdG8gbG9hZCBmaWxlJywgZGV0YWlsOiBmaWxlUGF0aCArICdcXG4gJyArIGVycm9yKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgIyByZW5kZXIgdml6XG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBvdXRwdXRIVE1MXG4gICAgICAgIEByZW5kZXJWaXooZGl2KVxuXG4gICAgICAgICMgZG93bmxvYWQgaW1hZ2VzIGZvciAuZXB1YiBhbmQgLm1vYmlcbiAgICAgICAgaW1hZ2VzVG9Eb3dubG9hZCA9IFtdXG4gICAgICAgIGlmIHBhdGguZXh0bmFtZShkZXN0KSBpbiBbJy5lcHViJywgJy5tb2JpJ11cbiAgICAgICAgICBmb3IgaW1nIGluIGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylcbiAgICAgICAgICAgIHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpXG4gICAgICAgICAgICBpZiBzcmMuc3RhcnRzV2l0aCgnaHR0cDovLycpIG9yIHNyYy5zdGFydHNXaXRoKCdodHRwczovLycpXG4gICAgICAgICAgICAgIGltYWdlc1RvRG93bmxvYWQucHVzaChpbWcpXG5cbiAgICAgICAgcmVxdWVzdCA/PSByZXF1aXJlKCdyZXF1ZXN0JylcbiAgICAgICAgYXN5bmMgPz0gcmVxdWlyZSgnYXN5bmMnKVxuXG4gICAgICAgIGlmIGltYWdlc1RvRG93bmxvYWQubGVuZ3RoXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ2Rvd25sb2FkaW5nIGltYWdlcy4uLicpXG5cbiAgICAgICAgYXN5bmNGdW5jdGlvbnMgPSBpbWFnZXNUb0Rvd25sb2FkLm1hcCAoaW1nKT0+XG4gICAgICAgICAgKGNhbGxiYWNrKT0+XG4gICAgICAgICAgICBodHRwU3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgICAgICAgIHNhdmVQYXRoID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpICsgJ18nICsgcGF0aC5iYXNlbmFtZShodHRwU3JjKVxuICAgICAgICAgICAgc2F2ZVBhdGggPSAgcGF0aC5yZXNvbHZlKEBmaWxlRGlyZWN0b3J5UGF0aCwgc2F2ZVBhdGgpXG5cbiAgICAgICAgICAgIHN0cmVhbSA9IHJlcXVlc3QoaHR0cFNyYykucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShzYXZlUGF0aCkpXG5cbiAgICAgICAgICAgIHN0cmVhbS5vbiAnZmluaXNoJywgKCktPlxuICAgICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlICdzcmMnLCAnZmlsZTovLy8nK3NhdmVQYXRoXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHNhdmVQYXRoKVxuXG5cbiAgICAgICAgYXN5bmMucGFyYWxsZWwgYXN5bmNGdW5jdGlvbnMsIChlcnJvciwgZG93bmxvYWRlZEltYWdlUGF0aHM9W10pPT5cbiAgICAgICAgICAjIGNvbnZlcnQgaW1hZ2UgdG8gYmFzZTY0IGlmIG91dHB1dCBodG1sXG4gICAgICAgICAgaWYgcGF0aC5leHRuYW1lKGRlc3QpID09ICcuaHRtbCdcbiAgICAgICAgICAgICMgY2hlY2sgY292ZXJcbiAgICAgICAgICAgIGlmIGVib29rQ29uZmlnLmNvdmVyXG4gICAgICAgICAgICAgIGNvdmVyID0gaWYgZWJvb2tDb25maWcuY292ZXJbMF0gPT0gJy8nIHRoZW4gJ2ZpbGU6Ly8vJyArIGVib29rQ29uZmlnLmNvdmVyIGVsc2UgZWJvb2tDb25maWcuY292ZXJcbiAgICAgICAgICAgICAgY292ZXJJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuICAgICAgICAgICAgICBjb3ZlckltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGNvdmVyKVxuICAgICAgICAgICAgICBkaXYuaW5zZXJ0QmVmb3JlKGNvdmVySW1nLCBkaXYuZmlyc3RDaGlsZClcblxuICAgICAgICAgICAgaW1hZ2VFbGVtZW50cyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylcbiAgICAgICAgICAgIGZvciBpbWcgaW4gaW1hZ2VFbGVtZW50c1xuICAgICAgICAgICAgICBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKVxuICAgICAgICAgICAgICBpZiBzcmMuc3RhcnRzV2l0aCgnZmlsZTovLy8nKVxuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zbGljZSg4KVxuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9cXD8oXFwufFxcZCkrJC8sICcnKSAjIHJlbW92ZSBjYWNoZVxuICAgICAgICAgICAgICAgIGltYWdlVHlwZSA9IHBhdGguZXh0bmFtZShzcmMpLnNsaWNlKDEpXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICBiYXNlNjQgPSBuZXcgQnVmZmVyKGZzLnJlYWRGaWxlU3luYyhzcmMpKS50b1N0cmluZygnYmFzZTY0JylcblxuICAgICAgICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgXCJkYXRhOmltYWdlLyN7aW1hZ2VUeXBlfTtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwje2Jhc2U2NH1cIilcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgICAgICAgdGhyb3cgJ0ltYWdlIGZpbGUgbm90IGZvdW5kOiAnICsgc3JjXG5cbiAgICAgICAgICAjIHJldHJpZXZlIGh0bWxcbiAgICAgICAgICBvdXRwdXRIVE1MID0gZGl2LmlubmVySFRNTFxuXG4gICAgICAgICAgdGl0bGUgPSBlYm9va0NvbmZpZy50aXRsZSBvciAnbm8gdGl0bGUnXG5cbiAgICAgICAgICBtYXRoU3R5bGUgPSAnJ1xuICAgICAgICAgIGlmIG91dHB1dEhUTUwuaW5kZXhPZignY2xhc3M9XCJrYXRleFwiJykgPiAwXG4gICAgICAgICAgICBpZiBwYXRoLmV4dG5hbWUoZGVzdCkgPT0gJy5odG1sJyBhbmQgZWJvb2tDb25maWcuaHRtbD8uY2RuXG4gICAgICAgICAgICAgIG1hdGhTdHlsZSA9IFwiPGxpbmsgcmVsPVxcXCJzdHlsZXNoZWV0XFxcIiBocmVmPVxcXCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9LYVRlWC8wLjcuMS9rYXRleC5taW4uY3NzXFxcIj5cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBtYXRoU3R5bGUgPSBcIjxsaW5rIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgaHJlZj1cXFwiZmlsZTovLy8je3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9ub2RlX21vZHVsZXMva2F0ZXgvZGlzdC9rYXRleC5taW4uY3NzJyl9XFxcIj5cIlxuXG4gICAgICAgICAgIyBvbmx5IHVzZSBnaXRodWIgc3R5bGUgZm9yIGVib29rXG4gICAgICAgICAgbG9hZFByZXZpZXdUaGVtZSAnbXBlLWdpdGh1Yi1zeW50YXgnLCB7Y2hhbmdlU3R5bGVFbGVtZW50OiBmYWxzZX0sIChlcnJvciwgY3NzKT0+XG4gICAgICAgICAgICBjc3MgPSAnJyBpZiBlcnJvclxuICAgICAgICAgICAgb3V0cHV0SFRNTCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWw+XG4gICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICA8dGl0bGU+I3t0aXRsZX08L3RpdGxlPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cXFwidXRmLThcXFwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cXFwidmlld3BvcnRcXFwiIGNvbnRlbnQ9XFxcIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcXFwiPlxuXG4gICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAje2Nzc31cbiAgICAgICAgICAgIDwvc3R5bGU+XG5cbiAgICAgICAgICAgICN7bWF0aFN0eWxlfVxuICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICA8Ym9keSBjbGFzcz1cXFwibWFya2Rvd24tcHJldmlldy1lbmhhbmNlZFxcXCI+XG4gICAgICAgICAgI3tvdXRwdXRIVE1MfVxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgPC9odG1sPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShkZXN0KVxuXG4gICAgICAgICAgICAjIHNhdmUgYXMgaHRtbFxuICAgICAgICAgICAgaWYgcGF0aC5leHRuYW1lKGRlc3QpID09ICcuaHRtbCdcbiAgICAgICAgICAgICAgZnMud3JpdGVGaWxlIGRlc3QsIG91dHB1dEhUTUwsIChlcnIpPT5cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJGaWxlICN7ZmlsZU5hbWV9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje2Rlc3R9XCIpXG4gICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAjIHRoaXMgZnVuYyB3aWxsIGJlIGNhbGxlZCBsYXRlclxuICAgICAgICAgICAgZGVsZXRlRG93bmxvYWRlZEltYWdlcyA9ICgpLT5cbiAgICAgICAgICAgICAgZG93bmxvYWRlZEltYWdlUGF0aHMuZm9yRWFjaCAoaW1hZ2VQYXRoKS0+XG4gICAgICAgICAgICAgICAgZnMudW5saW5rKGltYWdlUGF0aClcblxuICAgICAgICAgICAgIyB1c2UgZWJvb2stY29udmVydCB0byBnZW5lcmF0ZSBlUHViLCBtb2JpLCBQREYuXG4gICAgICAgICAgICB0ZW1wLm9wZW5cbiAgICAgICAgICAgICAgcHJlZml4OiAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCcsXG4gICAgICAgICAgICAgIHN1ZmZpeDogJy5odG1sJywgKGVyciwgaW5mbyk9PlxuICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgZGVsZXRlRG93bmxvYWRlZEltYWdlcygpXG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnJcblxuICAgICAgICAgICAgICAgIGZzLndyaXRlIGluZm8uZmQsIG91dHB1dEhUTUwsIChlcnIpPT5cbiAgICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVEb3dubG9hZGVkSW1hZ2VzKClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyXG5cbiAgICAgICAgICAgICAgICAgIGVib29rQ29udmVydCBpbmZvLnBhdGgsIGRlc3QsIGVib29rQ29uZmlnLCAoZXJyKT0+XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURvd25sb2FkZWRJbWFnZXMoKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiRmlsZSAje2ZpbGVOYW1lfSB3YXMgY3JlYXRlZFwiLCBkZXRhaWw6IFwicGF0aDogI3tkZXN0fVwiXG5cbiAgcGFuZG9jRG9jdW1lbnRFeHBvcnQ6IC0+XG4gICAge2RhdGF9ID0gQHByb2Nlc3NGcm9udE1hdHRlcihAZWRpdG9yLmdldFRleHQoKSlcblxuICAgIGNvbnRlbnQgPSBAZWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICBpZiBjb250ZW50LnN0YXJ0c1dpdGgoJy0tLVxcbicpXG4gICAgICBlbmQgPSBjb250ZW50LmluZGV4T2YoJy0tLVxcbicsIDQpXG4gICAgICBjb250ZW50ID0gY29udGVudC5zbGljZShlbmQrNClcblxuICAgIHBhbmRvY0NvbnZlcnQgY29udGVudCwge0BmaWxlRGlyZWN0b3J5UGF0aCwgQHByb2plY3REaXJlY3RvcnlQYXRoLCBzb3VyY2VGaWxlUGF0aDogQGVkaXRvci5nZXRQYXRoKCl9LCBkYXRhLCAoZXJyLCBvdXRwdXRGaWxlUGF0aCktPlxuICAgICAgaWYgZXJyXG4gICAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgJ3BhbmRvYyBlcnJvcicsIGRldGFpbDogZXJyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIkZpbGUgI3twYXRoLmJhc2VuYW1lKG91dHB1dEZpbGVQYXRoKX0gd2FzIGNyZWF0ZWRcIiwgZGV0YWlsOiBcInBhdGg6ICN7b3V0cHV0RmlsZVBhdGh9XCJcblxuICBzYXZlQXNNYXJrZG93bjogKCktPlxuICAgIHtkYXRhfSA9IEBwcm9jZXNzRnJvbnRNYXR0ZXIoQGVkaXRvci5nZXRUZXh0KCkpXG4gICAgZGF0YSA9IGRhdGEgb3Ige31cblxuICAgIGNvbnRlbnQgPSBAZWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICBpZiBjb250ZW50LnN0YXJ0c1dpdGgoJy0tLVxcbicpXG4gICAgICBlbmQgPSBjb250ZW50LmluZGV4T2YoJy0tLVxcbicsIDQpXG4gICAgICBjb250ZW50ID0gY29udGVudC5zbGljZShlbmQrNClcblxuICAgIGNvbmZpZyA9IGRhdGEubWFya2Rvd24gb3Ige31cbiAgICBpZiAhY29uZmlnLmltYWdlX2RpclxuICAgICAgY29uZmlnLmltYWdlX2RpciA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5pbWFnZUZvbGRlclBhdGgnKVxuXG4gICAgaWYgIWNvbmZpZy5wYXRoXG4gICAgICBjb25maWcucGF0aCA9IHBhdGguYmFzZW5hbWUoQGVkaXRvci5nZXRQYXRoKCkpLnJlcGxhY2UoL1xcLm1kJC8sICdfLm1kJylcblxuICAgIGlmIGNvbmZpZy5mcm9udF9tYXR0ZXJcbiAgICAgIGNvbnRlbnQgPSBtYXR0ZXIuc3RyaW5naWZ5KGNvbnRlbnQsIGNvbmZpZy5mcm9udF9tYXR0ZXIpXG5cbiAgICBtYXJrZG93bkNvbnZlcnQgY29udGVudCwge0Bwcm9qZWN0RGlyZWN0b3J5UGF0aCwgQGZpbGVEaXJlY3RvcnlQYXRofSwgY29uZmlnXG5cbiAgY29weVRvQ2xpcGJvYXJkOiAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBub3QgQGVkaXRvclxuXG4gICAgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcblxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGVkVGV4dClcbiAgICB0cnVlXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBAZWxlbWVudC5yZW1vdmUoKVxuICAgIEBlZGl0b3IgPSBudWxsXG5cbiAgICBpZiBAZGlzcG9zYWJsZXNcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcblxuICAgIGlmIEBzZXR0aW5nc0Rpc3Bvc2FibGVzXG4gICAgICBAc2V0dGluZ3NEaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIEBzZXR0aW5nc0Rpc3Bvc2FibGVzID0gbnVsbFxuXG4gICAgIyBjbGVhciBDQUNIRVxuICAgIGZvciBrZXkgb2YgQ0FDSEVcbiAgICAgIGRlbGV0ZShDQUNIRVtrZXldKVxuXG4gICAgQG1haW5Nb2R1bGUucHJldmlldyA9IG51bGwgIyB1bmJpbmRcblxuICBnZXRFbGVtZW50OiAtPlxuICAgIEBlbGVtZW50XG4iXX0=
