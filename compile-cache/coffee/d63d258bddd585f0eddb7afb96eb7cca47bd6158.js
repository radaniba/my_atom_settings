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
        return this.subscriptions.add(atom.config.observe('markdown-preview-enhanced.previewTheme', (function(_this) {
          return function() {
            var previewTheme;
            previewTheme = atom.config.get('markdown-preview-enhanced.previewTheme');
            return loadPreviewTheme(previewTheme, true);
          };
        })(this)));
      }
    },
    customizeCSS: function() {
      return atom.workspace.open("atom://.atom/stylesheet").then(function(editor) {
        var customCssTemplate, text;
        customCssTemplate = "\n\n/*\n * markdown-preview-enhanced custom style\n */\n.markdown-preview-enhanced-custom {\n  // please write your custom style here\n  // eg:\n  //  color: blue;          // change font color\n  //  font-size: 14px;      // change font size\n  //\n\n  // custom pdf output style\n  @media print {\n\n  }\n\n  // custom phantomjs png/jpeg export style\n  &.phantomjs-image {\n\n  }\n\n  //custom phantomjs pdf export style\n  &.phantomjs-pdf {\n\n  }\n\n  // custom presentation style\n  .preview-slides .slide,\n  &[data-presentation-mode] {\n    // eg\n    // background-color: #000;\n  }\n}\n\n// please don't modify the .markdown-preview-enhanced section below\n.markdown-preview-enhanced {\n  .markdown-preview-enhanced-custom() !important;\n}";
        text = editor.getText();
        if (text.indexOf('.markdown-preview-enhanced-custom {') < 0 || text.indexOf('.markdown-preview-enhanced {') < 0) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUhBQUE7SUFBQTs7RUFBQSxNQUFrRCxPQUFBLENBQVEsTUFBUixDQUFsRCxFQUFDLDZDQUFELEVBQXNCLHFCQUF0QixFQUErQix5QkFBL0IsRUFBMEM7O0VBQzFDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixtQkFBb0IsT0FBQSxDQUFRLFNBQVI7O0VBQ3JCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLHVCQUFBLEdBQ2Y7SUFBQSxPQUFBLEVBQVMsSUFBVDtJQUNBLFVBQUEsRUFBWSxJQURaO0lBRUEsb0JBQUEsRUFBc0IsSUFGdEI7SUFHQSxlQUFBLEVBQWlCLElBSGpCO0lBSUEsY0FBQSxFQUFnQixJQUpoQjtJQUtBLE1BQUEsRUFBUSxZQUxSO0lBT0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUdSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFFckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJO01BR1osSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUEwRCxDQUFDLEtBQTNELENBQWlFLEdBQWpFLENBQXFFLENBQUMsR0FBdEUsQ0FBMEUsU0FBQyxDQUFEO2VBQUssQ0FBQyxDQUFDLElBQUYsQ0FBQTtNQUFMLENBQTFFLENBQUEsSUFBNEYsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixXQUFsQjtNQUc5RyxJQUFDLENBQUEsYUFBYSxD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TUFBQSx3Q0FBVyxDQUFFLE9BQVYsQ0FBQSxVQUFIO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiwyREFBM0IsRUFIRjs7SUFEZ0IsQ0FqVWxCOztBQVBGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIsIERpcmVjdG9yeSwgRmlsZX0gPSByZXF1aXJlICdhdG9tJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57bG9hZFByZXZpZXdUaGVtZX0gPSByZXF1aXJlICcuL3N0eWxlJ1xuSG9vayA9IHJlcXVpcmUgJy4vaG9vaydcbmNvbmZpZ1NjaGVtYSA9IHJlcXVpcmUgJy4vY29uZmlnLXNjaGVtYSdcblxubW9kdWxlLmV4cG9ydHMgPSBNYXJrZG93blByZXZpZXdFbmhhbmNlZCA9XG4gIHByZXZpZXc6IG51bGwsXG4gIGthdGV4U3R5bGU6IG51bGwsXG4gIGRvY3VtZW50RXhwb3J0ZXJWaWV3OiBudWxsLFxuICBpbWFnZUhlbHBlclZpZXc6IG51bGwsXG4gIGZpbGVFeHRlbnNpb25zOiBudWxsLFxuICBjb25maWc6IGNvbmZpZ1NjaGVtYSxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgY29uc29sZS5sb2cgJ2FjdHZhdGUgbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCcsIHN0YXRlXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAaG9vayA9IG5ldyBIb29rXG5cbiAgICAjIGZpbGUgZXh0ZW5zaW9ucz9cbiAgICBAZmlsZUV4dGVuc2lvbnMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZmlsZUV4dGVuc2lvbicpLnNwbGl0KCcsJykubWFwKCh4KS0+eC50cmltKCkpIG9yIFsnLm1kJywgJy5tbWFyaycsICcubWFya2Rvd24nXVxuXG4gICAgIyBzZXQgb3BlbmVyXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpKT0+XG4gICAgICBpZiAodXJpLnN0YXJ0c1dpdGgoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6Ly8nKSlcbiAgICAgICAgcmV0dXJuIEBwcmV2aWV3XG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpjdXN0b21pemUtY3NzJzogPT4gQGN1c3RvbWl6ZUNTUygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDpjcmVhdGUtdG9jJzogPT4gQGNyZWF0ZVRPQygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDp0b2dnbGUtc2Nyb2xsLXN5bmMnOiA9PiBAdG9nZ2xlU2Nyb2xsU3luYygpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDp0b2dnbGUtbGl2ZS11cGRhdGUnOiA9PiBAdG9nZ2xlTGl2ZVVwZGF0ZSgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDp0b2dnbGUtYnJlYWstb24tc2luZ2xlLW5ld2xpbmUnOiA9PiBAdG9nZ2xlQnJlYWtPblNpbmdsZU5ld2xpbmUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6aW5zZXJ0LXRhYmxlJzogPT4gQGluc2VydFRhYmxlKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmltYWdlLWhlbHBlcic6ID0+IEBzdGFydEltYWdlSGVscGVyKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmNvbmZpZy1tZXJtYWlkJzogPT4gQG9wZW5NZXJtYWlkQ29uZmlnKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOmNvbmZpZy1oZWFkZXItZm9vdGVyJzogPT4gQG9wZW5IZWFkZXJGb290ZXJDb25maWcoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6aW5zZXJ0LW5ldy1zbGlkZSc6ID0+IEBpbnNlcnROZXdTbGlkZSgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZDppbnNlcnQtcGFnZS1icmVhayc6ID0+IEBpbnNlcnRQYWdlQnJlYWsoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6dG9nZ2xlLXplbi1tb2RlJzogPT4gQHRvZ2dsZVplbk1vZGUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6cnVuLWNvZGUtY2h1bmsnOiA9PiBAcnVuQ29kZUNodW5rKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkOnJ1bi1hbGwtY29kZS1jaHVua3MnOiA9PiBAcnVuQWxsQ29kZUNodW5rcygpXG5cblxuICAgICMgd2hlbiB0aGUgcHJldmlldyBpcyBkaXNwbGF5ZWRcbiAgICAjIHByZXZpZXcgd2lsbCBkaXNwbGF5IHRoZSBjb250ZW50IG9mIHBhbmUgdGhhdCBpcyBhY3RpdmF0ZWRcbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChlZGl0b3IpPT5cbiAgICBcdGlmIGVkaXRvciBhbmRcbiAgICAgICAgXHRlZGl0b3IuYnVmZmVyIGFuZFxuICAgICAgICBcdGVkaXRvci5nZXRHcmFtbWFyIGFuZFxuICAgICAgICBcdGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lID09ICdzb3VyY2UuZ2ZtJyBhbmRcbiAgICAgICAgXHRAcHJldmlldz8uaXNPbkRvbSgpXG4gICAgICAgIGlmIEBwcmV2aWV3LmVkaXRvciAhPSBlZGl0b3JcbiAgICAgICAgICBAcHJldmlldy5iaW5kRWRpdG9yKGVkaXRvcilcblxuICAgICMgYXV0b21hdGljYWxseSBvcGVuIHByZXZpZXcgd2hlbiBhY3RpdmF0ZSBhIG1hcmtkb3duIGZpbGVcbiAgICAjIGlmICdvcGVuUHJldmlld1BhbmVBdXRvbWF0aWNhbGx5JyBvcHRpb24gaXMgZW5hYmxlXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRPcGVuIChldmVudCk9PlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9wZW5QcmV2aWV3UGFuZUF1dG9tYXRpY2FsbHknKVxuICAgICAgICBpZiBldmVudC51cmkgYW5kXG4gICAgICAgICAgICBldmVudC5pdGVtIGFuZFxuICAgICAgICAgICAgcGF0aC5leHRuYW1lKGV2ZW50LnVyaSkgaW4gQGZpbGVFeHRlbnNpb25zXG4gICAgICAgICAgcGFuZSA9IGV2ZW50LnBhbmVcbiAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICMgaWYgdGhlIG1hcmtkb3duIGZpbGUgaXMgb3BlbmVkIG9uIHRoZSByaWdodCBwYW5lLCB0aGVuIG1vdmUgaXQgdG8gdGhlIGxlZnQgcGFuZS4gSXNzdWUgIzI1XG4gICAgICAgICAgaWYgcGFuZSAhPSBwYW5lc1swXVxuICAgICAgICAgICAgcGFuZS5tb3ZlSXRlbVRvUGFuZShldmVudC5pdGVtLCBwYW5lc1swXSwgMCkgIyBtb3ZlIG1kIHRvIGxlZnQgcGFuZS5cbiAgICAgICAgICAgIHBhbmVzWzBdLnNldEFjdGl2ZUl0ZW0oZXZlbnQuaXRlbSlcblxuICAgICAgICAgIGVkaXRvciA9IGV2ZW50Lml0ZW1cbiAgICAgICAgICBAc3RhcnRNRFByZXZpZXcoZWRpdG9yKVxuXG4gICAgICAjIGNoZWNrIHplbiBtb2RlXG4gICAgICBpZiBldmVudC51cmkgYW5kIGV2ZW50Lml0ZW0gYW5kIHBhdGguZXh0bmFtZShldmVudC51cmkpIGluIEBmaWxlRXh0ZW5zaW9uc1xuICAgICAgICBlZGl0b3IgPSBldmVudC5pdGVtXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZ2V0RWxlbWVudCgpXG4gICAgICAgIGlmIGVkaXRvciBhbmQgZWRpdG9yLmJ1ZmZlclxuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVaZW5Nb2RlJylcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW1hcmtkb3duLXplbicsICcnKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW1hcmtkb3duLXplbicpXG5cbiAgICAjIHplbiBtb2RlIG9ic2VydmF0aW9uXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZW5hYmxlWmVuTW9kZScsIChlbmFibGVaZW5Nb2RlKT0+XG4gICAgICBwYW5lSXRlbXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuICAgICAgZm9yIGVkaXRvciBpbiBwYW5lSXRlbXNcbiAgICAgICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuZ2V0UGF0aCBhbmQgcGF0aC5leHRuYW1lKGVkaXRvci5nZXRQYXRoKCkgb3IgJycpIGluIEBmaWxlRXh0ZW5zaW9uc1xuICAgICAgICAgIGlmIGVkaXRvci5idWZmZXJcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZ2V0RWxlbWVudCgpXG4gICAgICAgICAgICBpZiBlbmFibGVaZW5Nb2RlXG4gICAgICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW1hcmtkb3duLXplbicsICcnKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBlZGl0b3JFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nKVxuXG4gICAgICBpZiBlbmFibGVaZW5Nb2RlXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhdG9tLXdvcmtzcGFjZScpP1swXT8uc2V0QXR0cmlidXRlKCdkYXRhLW1hcmtkb3duLXplbicsICcnKVxuICAgICAgZWxzZVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXRvbS13b3Jrc3BhY2UnKT9bMF0/LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1tYXJrZG93bi16ZW4nKVxuXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5kaXNwb3NlKClcbiAgICBAaG9vay5kaXNwb3NlKClcblxuICAgIEBpbWFnZUhlbHBlclZpZXc/LmRlc3Ryb3koKVxuICAgIEBpbWFnZUhlbHBlclZpZXcgPSBudWxsXG4gICAgQGRvY3VtZW50RXhwb3J0ZXJWaWV3Py5kZXN0cm95KClcbiAgICBAZG9jdW1lbnRFeHBvcnRlclZpZXcgPSBudWxsXG4gICAgQHByZXZpZXc/LmRlc3Ryb3koKVxuICAgIEBwcmV2aWV3ID0gbnVsbFxuXG4gICAgIyBjb25zb2xlLmxvZyAnZGVhY3RpdmF0ZSBtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkJ1xuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAcHJldmlldz8uaXNPbkRvbSgpXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oQHByZXZpZXcpXG4gICAgICBwYW5lLmRlc3Ryb3lJdGVtKEBwcmV2aWV3KSAjIHRoaXMgd2lsbCB0cmlnZ2VyIEBwcmV2aWV3LmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgICMjIGNoZWNrIGlmIGl0IGlzIHZhbGlkIG1hcmtkb3duIGZpbGVcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgQHN0YXJ0TURQcmV2aWV3KGVkaXRvcilcblxuICBzdGFydE1EUHJldmlldzogKGVkaXRvciktPlxuICAgIE1hcmtkb3duUHJldmlld0VuaGFuY2VkVmlldyA9IHJlcXVpcmUgJy4vbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC12aWV3J1xuICAgIEV4cG9ydGVyVmlldyA9IHJlcXVpcmUgJy4vZXhwb3J0ZXItdmlldydcblxuICAgIEBwcmV2aWV3ID89IG5ldyBNYXJrZG93blByZXZpZXdFbmhhbmNlZFZpZXcoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQ6Ly9wcmV2aWV3JywgdGhpcylcbiAgICBpZiBAcHJldmlldy5lZGl0b3IgPT0gZWRpdG9yXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2UgaWYgQGNoZWNrVmFsaWRNYXJrZG93bkZpbGUoZWRpdG9yKVxuICAgICAgQGFwcGVuZEdsb2JhbFN0eWxlKClcbiAgICAgIEBwcmV2aWV3LmJpbmRFZGl0b3IoZWRpdG9yKVxuXG4gICAgICBAZG9jdW1lbnRFeHBvcnRlclZpZXcgPz0gbmV3IEV4cG9ydGVyVmlldygpXG4gICAgICBAcHJldmlldy5kb2N1bWVudEV4cG9ydGVyVmlldyA9IEBkb2N1bWVudEV4cG9ydGVyVmlld1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcblxuICBjaGVja1ZhbGlkTWFya2Rvd25GaWxlOiAoZWRpdG9yKS0+XG4gICAgaWYgIWVkaXRvciBvciAhZWRpdG9yLmdldEZpbGVOYW1lKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTWFya2Rvd24gZmlsZSBzaG91bGQgYmUgc2F2ZWQgZmlyc3QuJylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgZmlsZU5hbWUgPSBlZGl0b3IuZ2V0RmlsZU5hbWUoKSBvciAnJ1xuICAgIGlmICEocGF0aC5leHRuYW1lKGZpbGVOYW1lKSBpbiBAZmlsZUV4dGVuc2lvbnMpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJJbnZhbGlkIE1hcmtkb3duIGZpbGU6ICN7ZmlsZU5hbWV9IHdpdGggd3JvbmcgZXh0ZW5zaW9uICN7cGF0aC5leHRuYW1lKGZpbGVOYW1lKX0uXCIsIGRldGFpbDogXCJvbmx5ICcje0BmaWxlRXh0ZW5zaW9ucy5qb2luKCcsICcpfScgYXJlIHN1cHBvcnRlZC5cIiApXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGJ1ZmZlciA9IGVkaXRvci5idWZmZXJcbiAgICBpZiAhYnVmZmVyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgTWFya2Rvd24gZmlsZTogJyArIGZpbGVOYW1lKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGFwcGVuZEdsb2JhbFN0eWxlOiAoKS0+XG4gICAgaWYgbm90IEBrYXRleFN0eWxlXG4gICAgICBAa2F0ZXhTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2xpbmsnXG4gICAgICBAa2F0ZXhTdHlsZS5yZWwgPSAnc3R5bGVzaGVldCdcbiAgICAgIEBrYXRleFN0eWxlLmhyZWYgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vbm9kZV9tb2R1bGVzL2thdGV4L2Rpc3Qva2F0ZXgubWluLmNzcycpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKEBrYXRleFN0eWxlKVxuXG4gICAgICAjIGNoYW5nZSB0aGVtZVxuICAgICAgIyBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnY29yZS50aGVtZXMnLCAoKT0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wcmV2aWV3VGhlbWUnLCAoKT0+XG4gICAgICAgIHByZXZpZXdUaGVtZSA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wcmV2aWV3VGhlbWUnKVxuICAgICAgICBsb2FkUHJldmlld1RoZW1lIHByZXZpZXdUaGVtZSwgdHJ1ZVxuXG4gIGN1c3RvbWl6ZUNTUzogKCktPlxuICAgIGF0b20ud29ya3NwYWNlXG4gICAgICAub3BlbihcImF0b206Ly8uYXRvbS9zdHlsZXNoZWV0XCIpXG4gICAgICAudGhlbiAoZWRpdG9yKS0+XG4gICAgICAgIGN1c3RvbUNzc1RlbXBsYXRlID0gXCJcIlwiXFxuXG4vKlxuICogbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBjdXN0b20gc3R5bGVcbiAqL1xuLm1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQtY3VzdG9tIHtcbiAgLy8gcGxlYXNlIHdyaXRlIHlvdXIgY3VzdG9tIHN0eWxlIGhlcmVcbiAgLy8gZWc6XG4gIC8vICBjb2xvcjogYmx1ZTsgICAgICAgICAgLy8gY2hhbmdlIGZvbnQgY29sb3JcbiAgLy8gIGZvbnQtc2l6ZTogMTRweDsgICAgICAvLyBjaGFuZ2UgZm9udCBzaXplXG4gIC8vXG5cbiAgLy8gY3VzdG9tIHBkZiBvdXRwdXQgc3R5bGVcbiAgQG1lZGlhIHByaW50IHtcblxuICB9XG5cbiAgLy8gY3VzdG9tIHBoYW50b21qcyBwbmcvanBlZyBleHBvcnQgc3R5bGVcbiAgJi5waGFudG9tanMtaW1hZ2Uge1xuXG4gIH1cblxuICAvL2N1c3RvbSBwaGFudG9tanMgcGRmIGV4cG9ydCBzdHlsZVxuICAmLnBoYW50b21qcy1wZGYge1xuXG4gIH1cblxuICAvLyBjdXN0b20gcHJlc2VudGF0aW9uIHN0eWxlXG4gIC5wcmV2aWV3LXNsaWRlcyAuc2xpZGUsXG4gICZbZGF0YS1wcmVzZW50YXRpb24tbW9kZV0ge1xuICAgIC8vIGVnXG4gICAgLy8gYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcbiAgfVxufVxuXG4vLyBwbGVhc2UgZG9uJ3QgbW9kaWZ5IHRoZSAubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBzZWN0aW9uIGJlbG93XG4ubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCB7XG4gIC5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLWN1c3RvbSgpICFpbXBvcnRhbnQ7XG59XG5cIlwiXCJcbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgdGV4dC5pbmRleE9mKCcubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC1jdXN0b20geycpIDwgMCBvciB0ZXh0LmluZGV4T2YoJy5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkIHsnKSA8IDBcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0ICsgY3VzdG9tQ3NzVGVtcGxhdGUpXG5cbiAgIyBpbnNlcnQgdG9jIHRhYmxlXG4gICMgaWYgbWFya2Rvd24gcHJldmlldyBpcyBub3Qgb3BlbmVkLCB0aGVuIG9wZW4gdGhlIHByZXZpZXdcbiAgY3JlYXRlVE9DOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBpZiBlZGl0b3IgYW5kIEBzdGFydE1EUHJldmlldyhlZGl0b3IpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuPCEtLSB0b2Mgb3JkZXJlZExpc3Q6MCBkZXB0aEZyb206MSBkZXB0aFRvOjYgLS0+XFxuPCEtLSB0b2NzdG9wIC0tPlxcbicpXG5cbiAgdG9nZ2xlU2Nyb2xsU3luYzogKCktPlxuICAgIGZsYWcgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYydcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuc2Nyb2xsU3luYycsICFmbGFnKVxuXG4gICAgaWYgIWZsYWdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdTY3JvbGwgU3luYyBlbmFibGVkJylcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnU2Nyb2xsIFN5bmMgZGlzYWJsZWQnKVxuXG4gIHRvZ2dsZUxpdmVVcGRhdGU6ICgpLT5cbiAgICBmbGFnID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmxpdmVVcGRhdGUnXG4gICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmxpdmVVcGRhdGUnLCAhZmxhZylcblxuICAgIGlmICFmbGFnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTGl2ZSBVcGRhdGUgZW5hYmxlZCcpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0xpdmUgVXBkYXRlIGRpc2FibGVkJylcblxuICB0b2dnbGVCcmVha09uU2luZ2xlTmV3bGluZTogKCktPlxuICAgIGZsYWcgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuYnJlYWtPblNpbmdsZU5ld2xpbmUnXG4gICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmJyZWFrT25TaW5nbGVOZXdsaW5lJywgIWZsYWcpXG5cbiAgICBpZiAhZmxhZ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0VuYWJsZWQgYnJlYWtpbmcgb24gc2luZ2xlIG5ld2xpbmUnKVxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdEaXNhYmxlZCBicmVha2luZyBvbiBzaW5nbGUgbmV3bGluZScpXG5cbiAgaW5zZXJ0VGFibGU6ICgpLT5cbiAgICBhZGRTcGFjZSA9IChudW0pLT5cbiAgICAgIG91dHB1dCA9ICcnXG4gICAgICBmb3IgaSBpbiBbMC4uLm51bV1cbiAgICAgICAgb3V0cHV0ICs9ICcgJ1xuICAgICAgcmV0dXJuIG91dHB1dFxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBjdXJzb3JQb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJcIlwifCAgIHwgICB8XG4gICN7YWRkU3BhY2UoY3Vyc29yUG9zLmNvbHVtbil9fC0tLXwtLS18XG4gICN7YWRkU3BhY2UoY3Vyc29yUG9zLmNvbHVtbil9fCAgIHwgICB8XG4gIFwiXCJcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtjdXJzb3JQb3Mucm93LCBjdXJzb3JQb3MuY29sdW1uICsgMl0pXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gaW5zZXJ0IHRhYmxlJylcblxuICAjIHN0YXJ0IGltYWdlIGhlbHBlclxuICBzdGFydEltYWdlSGVscGVyOiAoKS0+XG4gICAgSW1hZ2VIZWxwZXJWaWV3ID0gcmVxdWlyZSAnLi9pbWFnZS1oZWxwZXItdmlldydcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGVkaXRvciBhbmQgZWRpdG9yLmJ1ZmZlclxuICAgICAgQGltYWdlSGVscGVyVmlldyA/PSBuZXcgSW1hZ2VIZWxwZXJWaWV3KClcbiAgICAgIEBpbWFnZUhlbHBlclZpZXcuZGlzcGxheShlZGl0b3IpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gb3BlbiBJbWFnZSBIZWxwZXIgcGFuZWwnKVxuXG4gIG9wZW5NZXJtYWlkQ29uZmlnOiAoKS0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLnJlc29sdmUoYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCwgJy4vbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC9tZXJtYWlkX2NvbmZpZy5qcycpKVxuXG4gIG9wZW5IZWFkZXJGb290ZXJDb25maWc6ICgpLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL3BoYW50b21qc19oZWFkZXJfZm9vdGVyX2NvbmZpZy5qcycpKVxuXG4gIHRvZ2dsZVplbk1vZGU6ICgpLT5cbiAgICBlbmFibGVaZW5Nb2RlID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmVuYWJsZVplbk1vZGUnKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5lbmFibGVaZW5Nb2RlJywgIWVuYWJsZVplbk1vZGUpXG4gICAgaWYgIWVuYWJsZVplbk1vZGVcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCd6ZW4gbW9kZSBlbmFibGVkJylcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnemVuIG1vZGUgZGlzYWJsZWQnKVxuXG4gIGluc2VydE5ld1NsaWRlOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnPCEtLSBzbGlkZSAtLT5cXG4nXG5cbiAgaW5zZXJ0UGFnZUJyZWFrOiAoKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yIGFuZCBlZGl0b3IuYnVmZmVyXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnPCEtLSBwYWdlYnJlYWsgLS0+XFxuJ1xuXG4gICMgSE9PS1MgSXNzdWUgIzEwMVxuICBvbldpbGxQYXJzZU1hcmtkb3duOiAoY2FsbGJhY2spLT5cbiAgICBAaG9vay5vbiAnb24td2lsbC1wYXJzZS1tYXJrZG93bicsIGNhbGxiYWNrXG5cbiAgb25EaWRQYXJzZU1hcmtkb3duOiAoY2FsbGJhY2spLT5cbiAgICBAaG9vay5vbiAnb24tZGlkLXBhcnNlLW1hcmtkb3duJywgY2FsbGJhY2tcblxuICBvbkRpZFJlbmRlclByZXZpZXc6IChjYWxsYmFjayktPlxuICAgIEBlbWl0dGVyLm9uICdvbi1kaWQtcmVuZGVyLXByZXZpZXcnLCBjYWxsYmFja1xuXG5cbiAgcnVuQ29kZUNodW5rOiAoKS0+XG4gICAgaWYgQHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgQHByZXZpZXcucnVuQ29kZUNodW5rKClcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnWW91IG5lZWQgdG8gc3RhcnQgbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBwcmV2aWV3IGZpcnN0JylcblxuICBydW5BbGxDb2RlQ2h1bmtzOiAoKS0+XG4gICAgaWYgQHByZXZpZXc/LmlzT25Eb20oKVxuICAgICAgQHByZXZpZXcucnVuQWxsQ29kZUNodW5rcygpXG4gICAgZWxzZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1lvdSBuZWVkIHRvIHN0YXJ0IG1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgcHJldmlldyBmaXJzdCcpXG4iXX0=
