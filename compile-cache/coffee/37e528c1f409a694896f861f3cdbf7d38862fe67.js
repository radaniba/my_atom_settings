(function() {
  var CompositeDisposable, Directory, Emitter, File, Hook, MarkdownPreviewEnhanced, configSchema, loadPreviewTheme, path, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter, Directory = ref.Directory, File = ref.File;

  path = require('path');

  loadPreviewTheme = require('./style').loadPreviewTheme;

  Hook = require('./hook');

  configSchema = require('./config-schema');

  module.exports = MarkdownPreviewEnhanced = {
    preview: null,
    katexStyle: null,
    documentExporterView: null,
    imageHelperView: null,
    fileExtensions: null,
    config: configSchema,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.hook = new Hook;
      this.fileExtensions = atom.config.get('markdown-preview-enhanced.fileExtension').split(',').map(function(x) {
        return x.trim();
      }) || ['.md', '.mmark', '.markdown'];
      this.subscriptions.add(atom.workspace.addOpener((function(_this) {
        return function(uri) {
          if (uri.startsWith('markdown-preview-enhanced://')) {
            return _this.preview;
          }
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'markdown-preview-enhanced:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'markdown-preview-enhanced:customize-css': (function(_this) {
          return function() {
            return _this.customizeCSS();
          };
        })(this),
        'markdown-preview-enhanced:create-toc': (function(_this) {
          return function() {
            return _this.createTOC();
          };
        })(this),
        'markdown-preview-enhanced:toggle-scroll-sync': (function(_this) {
          return function() {
            return _this.toggleScrollSync();
          };
        })(this),
        'markdown-preview-enhanced:toggle-live-update': (function(_this) {
          return function() {
            return _this.toggleLiveUpdate();
          };
        })(this),
        'markdown-preview-enhanced:toggle-break-on-single-newline': (function(_this) {
          return function() {
            return _this.toggleBreakOnSingleNewline();
          };
        })(this),
        'markdown-preview-enhanced:insert-table': (function(_this) {
          return function() {
            return _this.insertTable();
          };
        })(this),
        'markdown-preview-enhanced:image-helper': (function(_this) {
          return function() {
            return _this.startImageHelper();
          };
        })(this),
        'markdown-preview-enhanced:config-mermaid': (function(_this) {
          return function() {
            return _this.openMermaidConfig();
          };
        })(this),
        'markdown-preview-enhanced:config-header-footer': (function(_this) {
          return function() {
            return _this.openHeaderFooterConfig();
          };
        })(this),
        'markdown-preview-enhanced:insert-new-slide': (function(_this) {
          return function() {
            return _this.insertNewSlide();
          };
        })(this),
        'markdown-preview-enhanced:insert-page-break': (function(_this) {
          return function() {
            return _this.insertPageBreak();
          };
        })(this),
        'markdown-preview-enhanced:toggle-zen-mode': (function(_this) {
          return function() {
            return _this.toggleZenMode();
          };
        })(this),
        'markdown-preview-enhanced:run-code-chunk': (function(_this) {
          return function() {
            return _this.runCodeChunk();
          };
        })(this),
        'markdown-preview-enhanced:run-all-code-chunks': (function(_this) {
          return function() {
            return _this.runAllCodeChunks();
          };
        })(this)
      }));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          var ref1;
          if (editor && editor.buffer && editor.getGrammar && editor.getGrammar().scopeName === 'source.gfm' && ((ref1 = _this.preview) != null ? ref1.isOnDom() : void 0)) {
            if (_this.preview.editor !== editor) {
              return _this.preview.bindEditor(editor);
            }
          }
        };
      })(this));
      atom.workspace.onDidOpen((function(_this) {
        return function(event) {
          var editor, editorElement, pane, panes, ref1, ref2;
          if (atom.config.get('markdown-preview-enhanced.openPreviewPaneAutomatically')) {
            if (event.uri && event.item && (ref1 = path.extname(event.uri), indexOf.call(_this.fileExtensions, ref1) >= 0)) {
              pane = event.pane;
              panes = atom.workspace.getPanes();
              if (pane !== panes[0]) {
                pane.moveItemToPane(event.item, panes[0], 0);
                panes[0].setActiveItem(event.item);
              }
              editor = event.item;
              _this.startMDPreview(editor);
            }
          }
          if (event.uri && event.item && (ref2 = path.extname(event.uri), indexOf.call(_this.fileExtensions, ref2) >= 0)) {
            editor = event.item;
            editorElement = editor.getElement();
            if (editor && editor.buffer) {
              if (atom.config.get('markdown-preview-enhanced.enableZenMode')) {
                return editorElement.setAttribute('data-markdown-zen', '');
              } else {
                return editorElement.removeAttribute('data-markdown-zen');
              }
            }
          }
        };
      })(this));
      return this.subscriptions.add(atom.config.observe('markdown-preview-enhanced.enableZenMode', (function(_this) {
        return function(enableZenMode) {
          var editor, editorElement, j, len, paneItems, ref1, ref2, ref3, ref4, ref5;
          paneItems = atom.workspace.getPaneItems();
          for (j = 0, len = paneItems.length; j < len; j++) {
            editor = paneItems[j];
            if (editor && editor.getPath && (ref1 = path.extname(editor.getPath() || ''), indexOf.call(_this.fileExtensions, ref1) >= 0)) {
              if (editor.buffer) {
                editorElement = editor.getElement();
                if (enableZenMode) {
                  editorElement.setAttribute('data-markdown-zen', '');
                } else {
                  editorElement.removeAttribute('data-markdown-zen');
                }
              }
            }
          }
          if (enableZenMode) {
            return (ref2 = document.getElementsByTagName('atom-workspace')) != null ? (ref3 = ref2[0]) != null ? ref3.setAttribute('data-markdown-zen', '') : void 0 : void 0;
          } else {
            return (ref4 = document.getElementsByTagName('atom-workspace')) != null ? (ref5 = ref4[0]) != null ? ref5.removeAttribute('data-markdown-zen') : void 0 : void 0;
          }
        };
      })(this)));
    },
    deactivate: function() {
      var ref1, ref2, ref3;
      this.subscriptions.dispose();
      this.emitter.dispose();
      this.hook.dispose();
      if ((ref1 = this.imageHelperView) != null) {
        ref1.destroy();
      }
      this.imageHelperView = null;
      if ((ref2 = this.documentExporterView) != null) {
        ref2.destroy();
      }
      this.documentExporterView = null;
      if ((ref3 = this.preview) != null) {
        ref3.destroy();
      }
      return this.preview = null;
    },
    toggle: function() {
      var editor, pane, ref1;
      if ((ref1 = this.preview) != null ? ref1.isOnDom() : void 0) {
        pane = atom.workspace.paneForItem(this.preview);
        return pane.destroyItem(this.preview);
      } else {
        editor = atom.workspace.getActiveTextEditor();
        return this.startMDPreview(editor);
      }
    },
    startMDPreview: function(editor) {
      var ExporterView, MarkdownPreviewEnhancedView;
      MarkdownPreviewEnhancedView = require('./markdown-preview-enhanced-view');
      ExporterView = require('./exporter-view');
      if (this.preview == null) {
        this.preview = new MarkdownPreviewEnhancedView('markdown-preview-enhanced://preview', this);
      }
      if (this.preview.editor === editor) {
        return true;
      } else if (this.checkValidMarkdownFile(editor)) {
        this.appendGlobalStyle();
        this.preview.bindEditor(editor);
        if (this.documentExporterView == null) {
          this.documentExporterView = new ExporterView();
        }
        this.preview.documentExporterView = this.documentExporterView;
        return true;
      } else {
        return false;
      }
    },
    checkValidMarkdownFile: function(editor) {
      var buffer, fileName, ref1;
      if (!editor || !editor.getFileName()) {
        atom.notifications.addError('Markdown file should be saved first.');
        return false;
      }
      fileName = editor.getFileName() || '';
      if (!(ref1 = path.extname(fileName), indexOf.call(this.fileExtensions, ref1) >= 0)) {
        atom.notifications.addError("Invalid Markdown file: " + fileName + " with wrong extension " + (path.extname(fileName)) + ".", {
          detail: "only '" + (this.fileExtensions.join(', ')) + "' are supported."
        });
        return false;
      }
      buffer = editor.buffer;
      if (!buffer) {
        atom.notifications.addError('Invalid Markdown file: ' + fileName);
        return false;
      }
      return true;
    },
    appendGlobalStyle: function() {
      if (!this.katexStyle) {
        this.katexStyle = document.createElement('link');
        this.katexStyle.rel = 'stylesheet';
        this.katexStyle.href = path.resolve(__dirname, '../node_modules/katex/dist/katex.min.css');
        document.getElementsByTagName('head')[0].appendChild(this.katexStyle);
        return this.initPreviewTheme();
      }
    },
    initPreviewTheme: function() {
      var previewTheme;
      previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
      return loadPreviewTheme(previewTheme, {
        changeStyleElement: true
      }, (function(_this) {
        return function() {
          var changeTheme;
          changeTheme = function() {
            previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
            return loadPreviewTheme(previewTheme, {
              changeStyleElement: true
            });
          };
          _this.subscriptions.add(atom.config.observe('markdown-preview-enhanced.previewTheme', changeTheme));
          return _this.subscriptions.add(atom.config.observe('markdown-preview-enhanced.whiteBackground', changeTheme));
        };
      })(this));
    },
    customizeCSS: function() {
      return atom.workspace.open("atom://.atom/stylesheet").then(function(editor) {
        var customCssTemplate, text;
        customCssTemplate = "\n\n/*\n * markdown-preview-enhanced custom style\n */\n.markdown-preview-enhanced.markdown-preview-enhanced {\n  // please write your custom style here\n  // eg:\n  //  color: blue;          // change font color\n  //  font-size: 14px;      // change font size\n  //\n\n  // custom pdf output style\n  @media print {\n\n  }\n\n  // custom prince pdf export style\n  &.prince {\n\n  }\n\n  // custom phantomjs png/jpeg export style\n  &.phantomjs-image {\n\n  }\n\n  //custom phantomjs pdf export style\n  &.phantomjs-pdf {\n\n  }\n\n  // custom presentation style\n  .preview-slides .slide,\n  &[data-presentation-mode] {\n    // eg\n    // background-color: #000;\n  }\n}";
        text = editor.getText();
        if (text.indexOf('.markdown-preview-enhanced.markdown-preview-enhanced {') < 0) {
          return editor.setText(text + customCssTemplate);
        }
      });
    },
    createTOC: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor && this.startMDPreview(editor)) {
        return editor.insertText('\n<!-- toc orderedList:0 depthFrom:1 depthTo:6 -->\n<!-- tocstop -->\n');
      }
    },
    toggleScrollSync: function() {
      var flag;
      flag = atom.config.get('markdown-preview-enhanced.scrollSync');
      atom.config.set('markdown-preview-enhanced.scrollSync', !flag);
      if (!flag) {
        return atom.notifications.addInfo('Scroll Sync enabled');
      } else {
        return atom.notifications.addInfo('Scroll Sync disabled');
      }
    },
    toggleLiveUpdate: function() {
      var flag;
      flag = atom.config.get('markdown-preview-enhanced.liveUpdate');
      atom.config.set('markdown-preview-enhanced.liveUpdate', !flag);
      if (!flag) {
        return atom.notifications.addInfo('Live Update enabled');
      } else {
        return atom.notifications.addInfo('Live Update disabled');
      }
    },
    toggleBreakOnSingleNewline: function() {
      var flag;
      flag = atom.config.get('markdown-preview-enhanced.breakOnSingleNewline');
      atom.config.set('markdown-preview-enhanced.breakOnSingleNewline', !flag);
      if (!flag) {
        return atom.notifications.addInfo('Enabled breaking on single newline');
      } else {
        return atom.notifications.addInfo('Disabled breaking on single newline');
      }
    },
    insertTable: function() {
      var addSpace, cursorPos, editor;
      addSpace = function(num) {
        var i, j, output, ref1;
        output = '';
        for (i = j = 0, ref1 = num; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          output += ' ';
        }
        return output;
      };
      editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.buffer) {
        cursorPos = editor.getCursorBufferPosition();
        editor.insertText("|   |   |\n" + (addSpace(cursorPos.column)) + "|---|---|\n" + (addSpace(cursorPos.column)) + "|   |   |");
        return editor.setCursorBufferPosition([cursorPos.row, cursorPos.column + 2]);
      } else {
        return atom.notifications.addError('Failed to insert table');
      }
    },
    startImageHelper: function() {
      var ImageHelperView, editor;
      ImageHelperView = require('./image-helper-view');
      editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.buffer) {
        if (this.imageHelperView == null) {
          this.imageHelperView = new ImageHelperView();
        }
        return this.imageHelperView.display(editor);
      } else {
        return atom.notifications.addError('Failed to open Image Helper panel');
      }
    },
    openMermaidConfig: function() {
      return atom.workspace.open(path.resolve(atom.config.configDirPath, './markdown-preview-enhanced/mermaid_config.js'));
    },
    openHeaderFooterConfig: function() {
      return atom.workspace.open(path.resolve(atom.config.configDirPath, './markdown-preview-enhanced/phantomjs_header_footer_config.js'));
    },
    toggleZenMode: function() {
      var enableZenMode;
      enableZenMode = atom.config.get('markdown-preview-enhanced.enableZenMode');
      atom.config.set('markdown-preview-enhanced.enableZenMode', !enableZenMode);
      if (!enableZenMode) {
        return atom.notifications.addInfo('zen mode enabled');
      } else {
        return atom.notifications.addInfo('zen mode disabled');
      }
    },
    insertNewSlide: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.buffer) {
        return editor.insertText('<!-- slide -->\n');
      }
    },
    insertPageBreak: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.buffer) {
        return editor.insertText('<!-- pagebreak -->\n');
      }
    },
    onWillParseMarkdown: function(callback) {
      return this.hook.on('on-will-parse-markdown', callback);
    },
    onDidParseMarkdown: function(callback) {
      return this.hook.on('on-did-parse-markdown', callback);
    },
    onDidRenderPreview: function(callback) {
      return this.emitter.on('on-did-render-preview', callback);
    },
    runCodeChunk: function() {
      var ref1;
      if ((ref1 = this.preview) != null ? ref1.isOnDom() : void 0) {
        return this.preview.runCodeChunk();
      } else {
        return atom.notifications.addInfo('You need to start markdown-preview-enhanced preview first');
      }
    },
    runAllCodeChunks: function() {
      var ref1;
      if ((ref1 = this.preview) != null ? ref1.isOnDom() : void 0) {
        return this.preview.runAllCodeChunks();
      } else {
        return atom.notifications.addInfo('You need to start markdown-preview-enhanced preview first');
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUhBQUE7SUFBQTs7RUFBQSxNQUFrRCxPQUFBLENBQVEsTUFBUixDQUFsRCxFQUFDLDZDQUFELEVBQXNCLHFCQUF0QixFQUErQix5QkFBL0IsRUFBMEM7O0VBQzFDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixtQkFBb0IsT0FBQSxDQUFRLFNBQVI7O0VBQ3JCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLHVCQUFBLEdBQ2Y7SUFBQSxPQUFBLEVBQVMsSUFBVDtJQUNBLFVBQUEsRUFBWSxJQURaO0lBRUEsb0JBQUEsRUFBc0IsSUFGdEI7SUFHQSxlQUFBLEVBQWlCLElBSGpCO0lBSUEsY0FBQSxFQUFnQixJQUpoQjtJQUtBLE1BQUEsRUFBUSxZQUxSO0lBT0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUdSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFFckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJO01BR1osSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUEwRCxDQUFDLEtBQTNELENBQWlFLEdBQWpFLENBQXFFLENBQUMsR0FBdEUsQ0FBMEUsU0FBQyxDQUFEO2VBQUssQ0FBQyxDQUFDLElBQUYsQ0FBQTtNQUFMLENBQTFFLENBQUEsSUFBNEYsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixXQUFsQjtNQUc5RyxJQUFDLENBQUEsYUFBYSxD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QixTQUFDLFFBQUQ7YUFDbEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksdUJBQVosRUFBcUMsUUFBckM7SUFEa0IsQ0E5VHBCO0lBa1VBLFlBQUEsRUFBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLHdDQUFXLENBQUUsT0FBVixDQUFBLFVBQUg7ZUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsMkRBQTNCLEVBSEY7O0lBRFksQ0FsVWQ7SUF3VUEsZ0JBQUEsRUFBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsd0NBQVcsQ0FBRSxPQUFWLENBQUEsVUFBSDtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsMkRBQTNCLEVBSEY7O0lBRGdCLENBeFVsQjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyLCBEaXJlY3RvcnksIEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue2xvYWRQcmV2aWV3VGhlbWV9ID0gcmVxdWlyZSAnLi9zdHlsZSdcbkhvb2sgPSByZXF1aXJlICcuL2hvb2snXG5jb25maWdTY2hlbWEgPSByZXF1aXJlICcuL2NvbmZpZy1zY2hlbWEnXG5cbm1vZHVsZS5leHBvcnRzID0gTWFya2Rvd25QcmV2aWV3RW5oYW5jZWQgPVxuICBwcmV2aWV3OiBudWxsLFxuICBrYXRleFN0eWxlOiBudWxsLFxuICBkb2N1bWVudEV4cG9ydGVyVmlldzogbnVsbCxcbiAgaW1hZ2VIZWxwZXJWaWV3OiBudWxsLFxuICBmaWxlRXh0ZW5zaW9uczogbnVsbCxcbiAgY29uZmlnOiBjb25maWdTY2hlbWEsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIGNvbnNvbGUubG9nICdhY3R2YXRlIG1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQnLCBzdGF0ZVxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQGhvb2sgPSBuZXcgSG9va1xuXG4gICAgIyBmaWxlIGV4dGVuc2lvbnM/XG4gICAgQGZpbGVFeHRlbnNpb25zID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmZpbGVFeHRlbnNpb24nKS5zcGxpdCgnLCcpLm1hcCgoeCktPngudHJpbSgpKSBvciBbJy5tZCcsICcubW1hcmsnLCAnLm1hcmtkb3duJ11cblxuICAgICMgc2V0IG9wZW5lclxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaSk9PlxuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOi8vJykpXG4gICAgICAgIHJldHVybiBAcHJldmlld1xuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6Y3VzdG9taXplLWNzcyc6ID0+IEBjdXN0b21pemVDU1MoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6Y3JlYXRlLXRvYyc6ID0+IEBjcmVhdGVUT0MoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6dG9nZ2xlLXNjcm9sbC1zeW5jJzogPT4gQHRvZ2dsZVNjcm9sbFN5bmMoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6dG9nZ2xlLWxpdmUtdXBkYXRlJzogPT4gQHRvZ2dsZUxpdmVVcGRhdGUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6dG9nZ2xlLWJyZWFrLW9uLXNpbmdsZS1uZXdsaW5lJzogPT4gQHRvZ2dsZUJyZWFrT25TaW5nbGVOZXdsaW5lKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmluc2VydC10YWJsZSc6ID0+IEBpbnNlcnRUYWJsZSgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDppbWFnZS1oZWxwZXInOiA9PiBAc3RhcnRJbWFnZUhlbHBlcigpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpjb25maWctbWVybWFpZCc6ID0+IEBvcGVuTWVybWFpZENvbmZpZygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpjb25maWctaGVhZGVyLWZvb3Rlcic6ID0+IEBvcGVuSGVhZGVyRm9vdGVyQ29uZmlnKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmluc2VydC1uZXctc2xpZGUnOiA9PiBAaW5zZXJ0TmV3U2xpZGUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6aW5zZXJ0LXBhZ2UtYnJlYWsnOiA9PiBAaW5zZXJ0UGFnZUJyZWFrKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnRvZ2dsZS16ZW4tbW9kZSc6ID0+IEB0b2dnbGVaZW5Nb2RlKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnJ1bi1jb2RlLWNodW5rJzogPT4gQHJ1bkNvZGVDaHVuaygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpydW4tYWxsLWNvZGUtY2h1bmtzJzogPT4gQHJ1bkFsbENvZGVDaHVua3MoKVxuXG5cbiAgICAjIHdoZW4gdGhlIHByZXZpZXcgaXMgZGlzcGxheWVkXG4gICAgIyBwcmV2aWV3IHdpbGwgZGlzcGxheSB0aGUgY29udGVudCBvZiBwYW5lIHRoYXQgaXMgYWN0aXZhdGVkXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoZWRpdG9yKT0+XG4gICAgXHRpZiBlZGl0b3IgYW5kXG4gICAgICAgIFx0ZWRpdG9yLmJ1ZmZlciBhbmRcbiAgICAgICAgXHRlZGl0b3IuZ2V0R3JhbW1hciBhbmRcbiAgICAgICAgXHRlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PSAnc291cmNlLmdmbScgYW5kXG4gICAgICAgIFx0QHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgICBpZiBAcHJldmlldy5lZGl0b3IgIT0gZWRpdG9yXG4gICAgICAgICAgQHByZXZpZXcuYmluZEVkaXRvcihlZGl0b3IpXG5cbiAgICAjIGF1dG9tYXRpY2FsbHkgb3BlbiBwcmV2aWV3IHdoZW4gYWN0aXZhdGUgYSBtYXJrZG93biBmaWxlXG4gICAgIyBpZiAnb3BlblByZXZpZXdQYW5lQXV0b21hdGljYWxseScgb3B0aW9uIGlzIGVuYWJsZVxuICAgIGF0b20ud29ya3NwYWNlLm9uRGlkT3BlbiAoZXZlbnQpPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5vcGVuUHJldmlld1BhbmVBdXRvbWF0aWNhbGx5JylcbiAgICAgICAgaWYgZXZlbnQudXJpIGFuZFxuICAgICAgICAgICAgZXZlbnQuaXRlbSBhbmRcbiAgICAgICAgICAgIHBhdGguZXh0bmFtZShldmVudC51cmkpIGluIEBmaWxlRXh0ZW5zaW9uc1xuICAgICAgICAgIHBhbmUgPSBldmVudC5wYW5lXG4gICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAjIGlmIHRoZSBtYXJrZG93biBmaWxlIGlzIG9wZW5lZCBvbiB0aGUgcmlnaHQgcGFuZSwgdGhlbiBtb3ZlIGl0IHRvIHRoZSBsZWZ0IHBhbmUuIElzc3VlICMyNVxuICAgICAgICAgIGlmIHBhbmUgIT0gcGFuZXNbMF1cbiAgICAgICAgICAgIHBhbmUubW92ZUl0ZW1Ub1BhbmUoZXZlbnQuaXRlbSwgcGFuZXNbMF0sIDApICMgbW92ZSBtZCB0byBsZWZ0IHBhbmUuXG4gICAgICAgICAgICBwYW5lc1swXS5zZXRBY3RpdmVJdGVtKGV2ZW50Lml0ZW0pXG5cbiAgICAgICAgICBlZGl0b3IgPSBldmVudC5pdGVtXG4gICAgICAgICAgQHN0YXJ0TURQcmV2aWV3KGVkaXRvcilcblxuICAgICAgIyBjaGVjayB6ZW4gbW9kZVxuICAgICAgaWYgZXZlbnQudXJpIGFuZCBldmVudC5pdGVtIGFuZCBwYXRoLmV4dG5hbWUoZXZlbnQudXJpKSBpbiBAZmlsZUV4dGVuc2lvbnNcbiAgICAgICAgZWRpdG9yID0gZXZlbnQuaXRlbVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmdldEVsZW1lbnQoKVxuICAgICAgICBpZiBlZGl0b3IgYW5kIGVkaXRvci5idWZmZXJcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlWmVuTW9kZScpXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nLCAnJylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nKVxuXG4gICAgIyB6ZW4gbW9kZSBvYnNlcnZhdGlvblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmVuYWJsZVplbk1vZGUnLCAoZW5hYmxlWmVuTW9kZSk9PlxuICAgICAgcGFuZUl0ZW1zID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKClcbiAgICAgIGZvciBlZGl0b3IgaW4gcGFuZUl0ZW1zXG4gICAgICAgIGlmIGVkaXRvciBhbmQgZWRpdG9yLmdldFBhdGggYW5kIHBhdGguZXh0bmFtZShlZGl0b3IuZ2V0UGF0aCgpIG9yICcnKSBpbiBAZmlsZUV4dGVuc2lvbnNcbiAgICAgICAgICBpZiBlZGl0b3IuYnVmZmVyXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmdldEVsZW1lbnQoKVxuICAgICAgICAgICAgaWYgZW5hYmxlWmVuTW9kZVxuICAgICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nLCAnJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbWFya2Rvd24temVuJylcblxuICAgICAgaWYgZW5hYmxlWmVuTW9kZVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXRvbS13b3Jrc3BhY2UnKT9bMF0/LnNldEF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nLCAnJylcbiAgICAgIGVsc2VcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2F0b20td29ya3NwYWNlJyk/WzBdPy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbWFya2Rvd24temVuJylcblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG4gICAgQGhvb2suZGlzcG9zZSgpXG5cbiAgICBAaW1hZ2VIZWxwZXJWaWV3Py5kZXN0cm95KClcbiAgICBAaW1hZ2VIZWxwZXJWaWV3ID0gbnVsbFxuICAgIEBkb2N1bWVudEV4cG9ydGVyVmlldz8uZGVzdHJveSgpXG4gICAgQGRvY3VtZW50RXhwb3J0ZXJWaWV3ID0gbnVsbFxuICAgIEBwcmV2aWV3Py5kZXN0cm95KClcbiAgICBAcHJldmlldyA9IG51bGxcblxuICAgICMgY29uc29sZS5sb2cgJ2RlYWN0aXZhdGUgbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCdcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKEBwcmV2aWV3KVxuICAgICAgcGFuZS5kZXN0cm95SXRlbShAcHJldmlldykgIyB0aGlzIHdpbGwgdHJpZ2dlciBAcHJldmlldy5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICAjIyBjaGVjayBpZiBpdCBpcyB2YWxpZCBtYXJrZG93biBmaWxlXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIEBzdGFydE1EUHJldmlldyhlZGl0b3IpXG5cbiAgc3RhcnRNRFByZXZpZXc6IChlZGl0b3IpLT5cbiAgICBNYXJrZG93blByZXZpZXdFbmhhbmNlZFZpZXcgPSByZXF1aXJlICcuL21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQtdmlldydcbiAgICBFeHBvcnRlclZpZXcgPSByZXF1aXJlICcuL2V4cG9ydGVyLXZpZXcnXG5cbiAgICBAcHJldmlldyA/PSBuZXcgTWFya2Rvd25QcmV2aWV3RW5oYW5jZWRWaWV3KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOi8vcHJldmlldycsIHRoaXMpXG4gICAgaWYgQHByZXZpZXcuZWRpdG9yID09IGVkaXRvclxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIGlmIEBjaGVja1ZhbGlkTWFya2Rvd25GaWxlKGVkaXRvcilcbiAgICAgIEBhcHBlbmRHbG9iYWxTdHlsZSgpXG4gICAgICBAcHJldmlldy5iaW5kRWRpdG9yKGVkaXRvcilcblxuICAgICAgQGRvY3VtZW50RXhwb3J0ZXJWaWV3ID89IG5ldyBFeHBvcnRlclZpZXcoKVxuICAgICAgQHByZXZpZXcuZG9jdW1lbnRFeHBvcnRlclZpZXcgPSBAZG9jdW1lbnRFeHBvcnRlclZpZXdcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgY2hlY2tWYWxpZE1hcmtkb3duRmlsZTogKGVkaXRvciktPlxuICAgIGlmICFlZGl0b3Igb3IgIWVkaXRvci5nZXRGaWxlTmFtZSgpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ01hcmtkb3duIGZpbGUgc2hvdWxkIGJlIHNhdmVkIGZpcnN0LicpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGZpbGVOYW1lID0gZWRpdG9yLmdldEZpbGVOYW1lKCkgb3IgJydcbiAgICBpZiAhKHBhdGguZXh0bmFtZShmaWxlTmFtZSkgaW4gQGZpbGVFeHRlbnNpb25zKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiSW52YWxpZCBNYXJrZG93biBmaWxlOiAje2ZpbGVOYW1lfSB3aXRoIHdyb25nIGV4dGVuc2lvbiAje3BhdGguZXh0bmFtZShmaWxlTmFtZSl9LlwiLCBkZXRhaWw6IFwib25seSAnI3tAZmlsZUV4dGVuc2lvbnMuam9pbignLCAnKX0nIGFyZSBzdXBwb3J0ZWQuXCIgKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBidWZmZXIgPSBlZGl0b3IuYnVmZmVyXG4gICAgaWYgIWJ1ZmZlclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIE1hcmtkb3duIGZpbGU6ICcgKyBmaWxlTmFtZSlcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIHRydWVcblxuICBhcHBlbmRHbG9iYWxTdHlsZTogKCktPlxuICAgIGlmIG5vdCBAa2F0ZXhTdHlsZVxuICAgICAgQGthdGV4U3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdsaW5rJ1xuICAgICAgQGthdGV4U3R5bGUucmVsID0gJ3N0eWxlc2hlZXQnXG4gICAgICBAa2F0ZXhTdHlsZS5ocmVmID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL25vZGVfbW9kdWxlcy9rYXRleC9kaXN0L2thdGV4Lm1pbi5jc3MnKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChAa2F0ZXhTdHlsZSlcblxuICAgICAgIyBjaGFuZ2UgdGhlbWVcbiAgICAgICMgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2NvcmUudGhlbWVzJywgKCk9PlxuICAgICAgQGluaXRQcmV2aWV3VGhlbWUoKVxuXG4gIGluaXRQcmV2aWV3VGhlbWU6ICgpLT5cbiAgICBwcmV2aWV3VGhlbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJldmlld1RoZW1lJylcbiAgICBsb2FkUHJldmlld1RoZW1lIHByZXZpZXdUaGVtZSwge2NoYW5nZVN0eWxlRWxlbWVudDogdHJ1ZX0sICgpPT5cbiAgICAgIGNoYW5nZVRoZW1lID0gKCktPlxuICAgICAgICBwcmV2aWV3VGhlbWUgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJldmlld1RoZW1lJylcbiAgICAgICAgbG9hZFByZXZpZXdUaGVtZSBwcmV2aWV3VGhlbWUsIHtjaGFuZ2VTdHlsZUVsZW1lbnQ6IHRydWV9XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wcmV2aWV3VGhlbWUnLCBjaGFuZ2VUaGVtZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQud2hpdGVCYWNrZ3JvdW5kJywgY2hhbmdlVGhlbWVcblxuICBjdXN0b21pemVDU1M6ICgpLT5cbiAgICBhdG9tLndvcmtzcGFjZVxuICAgICAgLm9wZW4oXCJhdG9tOi8vLmF0b20vc3R5bGVzaGVldFwiKVxuICAgICAgLnRoZW4gKGVkaXRvciktPlxuICAgICAgICBjdXN0b21Dc3NUZW1wbGF0ZSA9IFwiXCJcIlxcblxuLypcbiAqIG1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgY3VzdG9tIHN0eWxlXG4gKi9cbi5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQge1xuICAvLyBwbGVhc2Ugd3JpdGUgeW91ciBjdXN0b20gc3R5bGUgaGVyZVxuICAvLyBlZzpcbiAgLy8gIGNvbG9yOiBibHVlOyAgICAgICAgICAvLyBjaGFuZ2UgZm9udCBjb2xvclxuICAvLyAgZm9udC1zaXplOiAxNHB4OyAgICAgIC8vIGNoYW5nZSBmb250IHNpemVcbiAgLy9cblxuICAvLyBjdXN0b20gcGRmIG91dHB1dCBzdHlsZVxuICBAbWVkaWEgcHJpbnQge1xuXG4gIH1cblxuICAvLyBjdXN0b20gcHJpbmNlIHBkZiBleHBvcnQgc3R5bGVcbiAgJi5wcmluY2Uge1xuXG4gIH1cblxuICAvLyBjdXN0b20gcGhhbnRvbWpzIHBuZy9qcGVnIGV4cG9ydCBzdHlsZVxuICAmLnBoYW50b21qcy1pbWFnZSB7XG5cbiAgfVxuXG4gIC8vY3VzdG9tIHBoYW50b21qcyBwZGYgZXhwb3J0IHN0eWxlXG4gICYucGhhbnRvbWpzLXBkZiB7XG5cbiAgfVxuXG4gIC8vIGN1c3RvbSBwcmVzZW50YXRpb24gc3R5bGVcbiAgLnByZXZpZXctc2xpZGVzIC5zbGlkZSxcbiAgJltkYXRhLXByZXNlbnRhdGlvbi1tb2RlXSB7XG4gICAgLy8gZWdcbiAgICAvLyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xuICB9XG59XG5cIlwiXCJcbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgdGV4dC5pbmRleE9mKCcubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkIHsnKSA8IDBcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0ICsgY3VzdG9tQ3NzVGVtcGxhdGUpXG5cbiAgIyBpbnNlcnQgdG9jIHRhYmxlXG4gICMgaWYgbWFya2Rvd24gcHJldmlldyBpcyBub3Qgb3BlbmVkLCB0aGVuIG9wZW4gdGhlIHByZXZpZXdcbiAgY3JlYXRlVE9DOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBpZiBlZGl0b3IgYW5kIEBzdGFydE1EUHJldmlldyhlZGl0b3IpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuPCEtLSB0b2Mgb3JkZXJlZExpc3Q6MCBkZXB0aEZyb206MSBkZXB0aFRvOjYgLS0+XFxuPCEtLSB0b2NzdG9wIC0tPlxcbicpXG5cbiAgdG9nZ2xlU2Nyb2xsU3luYzogKCktPlxuICAgIGZsYWcgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYydcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYycsICFmbGFnKVxuXG4gICAgaWYgIWZsYWdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdTY3JvbGwgU3luYyBlbmFibGVkJylcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnU2Nyb2xsIFN5bmMgZGlzYWJsZWQnKVxuXG4gIHRvZ2dsZUxpdmVVcGRhdGU6ICgpLT5cbiAgICBmbGFnID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmxpdmVVcGRhdGUnXG4gICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmxpdmVVcGRhdGUnLCAhZmxhZylcblxuICAgIGlmICFmbGFnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTGl2ZSBVcGRhdGUgZW5hYmxlZCcpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0xpdmUgVXBkYXRlIGRpc2FibGVkJylcblxuICB0b2dnbGVCcmVha09uU2luZ2xlTmV3bGluZTogKCktPlxuICAgIGZsYWcgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuYnJlYWtPblNpbmdsZU5ld2xpbmUnXG4gICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmJyZWFrT25TaW5nbGVOZXdsaW5lJywgIWZsYWcpXG5cbiAgICBpZiAhZmxhZ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0VuYWJsZWQgYnJlYWtpbmcgb24gc2luZ2xlIG5ld2xpbmUnKVxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdEaXNhYmxlZCBicmVha2luZyBvbiBzaW5nbGUgbmV3bGluZScpXG5cbiAgaW5zZXJ0VGFibGU6ICgpLT5cbiAgICBhZGRTcGFjZSA9IChudW0pLT5cbiAgICAgIG91dHB1dCA9ICcnXG4gICAgICBmb3IgaSBpbiBbMC4uLm51bV1cbiAgICAgICAgb3V0cHV0ICs9ICcgJ1xuICAgICAgcmV0dXJuIG91dHB1dFxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBjdXJzb3JQb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJcIlwifCAgIHwgICB8XG4gICN7YWRkU3BhY2UoY3Vyc29yUG9zLmNvbHVtbil9fC0tLXwtLS18XG4gICN7YWRkU3BhY2UoY3Vyc29yUG9zLmNvbHVtbil9fCAgIHwgICB8XG4gIFwiXCJcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtjdXJzb3JQb3Mucm93LCBjdXJzb3JQb3MuY29sdW1uICsgMl0pXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gaW5zZXJ0IHRhYmxlJylcblxuICAjIHN0YXJ0IGltYWdlIGhlbHBlclxuICBzdGFydEltYWdlSGVscGVyOiAoKS0+XG4gICAgSW1hZ2VIZWxwZXJWaWV3ID0gcmVxdWlyZSAnLi9pbWFnZS1oZWxwZXItdmlldydcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGVkaXRvciBhbmQgZWRpdG9yLmJ1ZmZlclxuICAgICAgQGltYWdlSGVscGVyVmlldyA/PSBuZXcgSW1hZ2VIZWxwZXJWaWV3KClcbiAgICAgIEBpbWFnZUhlbHBlclZpZXcuZGlzcGxheShlZGl0b3IpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gb3BlbiBJbWFnZSBIZWxwZXIgcGFuZWwnKVxuXG4gIG9wZW5NZXJtYWlkQ29uZmlnOiAoKS0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLnJlc29sdmUoYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCwgJy4vbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC9tZXJtYWlkX2NvbmZpZy5qcycpKVxuXG4gIG9wZW5IZWFkZXJGb290ZXJDb25maWc6ICgpLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL3BoYW50b21qc19oZWFkZXJfZm9vdGVyX2NvbmZpZy5qcycpKVxuXG4gIHRvZ2dsZVplbk1vZGU6ICgpLT5cbiAgICBlbmFibGVaZW5Nb2RlID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmVuYWJsZVplbk1vZGUnKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVaZW5Nb2RlJywgIWVuYWJsZVplbk1vZGUpXG4gICAgaWYgIWVuYWJsZVplbk1vZGVcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCd6ZW4gbW9kZSBlbmFibGVkJylcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnemVuIG1vZGUgZGlzYWJsZWQnKVxuXG4gIGluc2VydE5ld1NsaWRlOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnPCEtLSBzbGlkZSAtLT5cXG4nXG5cbiAgaW5zZXJ0UGFnZUJyZWFrOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnPCEtLSBwYWdlYnJlYWsgLS0+XFxuJ1xuXG4gICMgSE9PS1MgSXNzdWUgIzEwMVxuICBvbldpbGxQYXJzZU1hcmtkb3duOiAoY2FsbGJhY2spLT5cbiAgICBAaG9vay5vbiAnb24td2lsbC1wYXJzZS1tYXJrZG93bicsIGNhbGxiYWNrXG5cbiAgb25EaWRQYXJzZU1hcmtkb3duOiAoY2FsbGJhY2spLT5cbiAgICBAaG9vay5vbiAnb24tZGlkLXBhcnNlLW1hcmtkb3duJywgY2FsbGJhY2tcblxuICBvbkRpZFJlbmRlclByZXZpZXc6IChjYWxsYmFjayktPlxuICAgIEBlbWl0dGVyLm9uICdvbi1kaWQtcmVuZGVyLXByZXZpZXcnLCBjYWxsYmFja1xuXG5cbiAgcnVuQ29kZUNodW5rOiAoKS0+XG4gICAgaWYgQHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgQHByZXZpZXcucnVuQ29kZUNodW5rKClcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnWW91IG5lZWQgdG8gc3RhcnQgbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBwcmV2aWV3IGZpcnN0JylcblxuICBydW5BbGxDb2RlQ2h1bmtzOiAoKS0+XG4gICAgaWYgQHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgQHByZXZpZXcucnVuQWxsQ29kZUNodW5rcygpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1lvdSBuZWVkIHRvIHN0YXJ0IG1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgcHJldmlldyBmaXJzdCcpXG4iXX0=
