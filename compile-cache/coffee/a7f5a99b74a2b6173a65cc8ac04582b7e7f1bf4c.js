(function() {
  var CompositeDisposable, DiffView, Directory, File, FooterView, LoadingView, SplitDiff, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffView = require('./diff-view');

  LoadingView = require('./ui/loading-view');

  FooterView = require('./ui/footer-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require('./config-schema');

  path = require('path');

  module.exports = SplitDiff = {
    diffView: null,
    config: configSchema,
    subscriptions: null,
    editorSubscriptions: null,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    activate: function(state) {
      window.splitDiffResolves = [];
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace, .tree-view .selected, .tab.texteditor', {
        'split-diff:enable': (function(_this) {
          return function(e) {
            _this.diffPanes(e);
            return e.stopPropagation();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.nextDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.prevDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToRight();
            }
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToLeft();
            }
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable();
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable();
      } else {
        return this.diffPanes();
      }
    },
    disable: function() {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffView != null) {
        if (this.wasEditor1Created) {
          this.diffView.cleanUpEditor(1);
        }
        if (this.wasEditor2Created) {
          this.diffView.cleanUpEditor(2);
        }
        this.diffView.destroy();
        this.diffView = null;
      }
      if (this.footerView != null) {
        this.footerView.destroy();
        this.footerView = null;
      }
      if (this.loadingView != null) {
        this.loadingView.destroy();
        this.loadingView = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      this.wasEditor1Created = false;
      this.wasEditor2Created = false;
      this.hasGitRepo = false;
      if (this._getConfig('hideTreeView')) {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:show');
      }
    },
    toggleIgnoreWhitespace: function() {
      var isWhitespaceIgnored, ref1;
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      this._setConfig('ignoreWhitespace', !isWhitespaceIgnored);
      return (ref1 = this.footerView) != null ? ref1.setIgnoreWhitespace(!isWhitespaceIgnored) : void 0;
    },
    nextDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.nextDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    prevDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.prevDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    copyToRight: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToRight();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    copyToLeft: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToLeft();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    diffPanes: function(event) {
      var editorsPromise, filePath;
      this.disable();
      this.editorSubscriptions = new CompositeDisposable();
      if (event != null ? event.currentTarget.classList.contains('tab') : void 0) {
        filePath = event.currentTarget.path;
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else if ((event != null ? event.currentTarget.classList.contains('list-item') : void 0) && (event != null ? event.currentTarget.classList.contains('file') : void 0)) {
        filePath = event.currentTarget.getPath();
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else {
        editorsPromise = this._getEditorsForQuickDiff();
      }
      return editorsPromise.then((function(editors) {
        if (editors === null) {
          return;
        }
        this._setupVisibleEditors(editors.editor1, editors.editor2);
        this.diffView = new DiffView(editors);
        this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        if (this.footerView == null) {
          this.footerView = new FooterView(this._getConfig('ignoreWhitespace'));
          this.footerView.createPanel();
        }
        this.footerView.show();
        if (!this.hasGitRepo) {
          this.updateDiff(editors);
        }
        this.editorSubscriptions.add(atom.menu.add([
          {
            'label': 'Packages',
            'submenu': [
              {
                'label': 'Split Diff',
                'submenu': [
                  {
                    'label': 'Ignore Whitespace',
                    'command': 'split-diff:ignore-whitespace'
                  }, {
                    'label': 'Move to Next Diff',
                    'command': 'split-diff:next-diff'
                  }, {
                    'label': 'Move to Previous Diff',
                    'command': 'split-diff:prev-diff'
                  }, {
                    'label': 'Copy to Right',
                    'command': 'split-diff:copy-to-right'
                  }, {
                    'label': 'Copy to Left',
                    'command': 'split-diff:copy-to-left'
                  }
                ]
              }
            ]
          }
        ]));
        return this.editorSubscriptions.add(atom.contextMenu.add({
          'atom-text-editor': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }, {
                  'label': 'Copy to Right',
                  'command': 'split-diff:copy-to-right'
                }, {
                  'label': 'Copy to Left',
                  'command': 'split-diff:copy-to-left'
                }
              ]
            }
          ]
        }));
      }).bind(this));
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, editorPaths, exit, isWhitespaceIgnored, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this._getConfig('hideTreeView') && document.querySelector('.tree-view')) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:toggle');
      }
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, isWhitespaceIgnored];
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          var computedDiff, ref1;
          theOutput = output;
          computedDiff = JSON.parse(output);
          _this.process.kill();
          _this.process = null;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          return _this._resumeUpdateDiff(editors, computedDiff);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          var ref1;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          if (code !== 0) {
            console.log('BufferedNodeProcess code was ' + code);
            return console.log(theOutput);
          }
        };
      })(this);
      return this.process = new BufferedNodeProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    _resumeUpdateDiff: function(editors, computedDiff) {
      var leftHighlightType, ref1, ref2, rightHighlightType, scrollSyncType;
      if (this.diffView == null) {
        return;
      }
      this.diffView.clearDiff();
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      leftHighlightType = 'added';
      rightHighlightType = 'removed';
      if (this._getConfig('leftEditorColor') === 'red') {
        leftHighlightType = 'removed';
      }
      if (this._getConfig('rightEditorColor') === 'green') {
        rightHighlightType = 'added';
      }
      this.diffView.displayDiff(computedDiff, leftHighlightType, rightHighlightType, this._getConfig('diffWords'), this._getConfig('ignoreWhitespace'));
      while ((ref1 = window.splitDiffResolves) != null ? ref1.length : void 0) {
        window.splitDiffResolves.pop()(this.diffView.getMarkerLayers());
      }
      if ((ref2 = this.footerView) != null) {
        ref2.setNumDifferences(this.diffView.getNumDifferences());
      }
      scrollSyncType = this._getConfig('scrollSyncType');
      if (scrollSyncType === 'Vertical + Horizontal') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
        return this.syncScroll.syncPositions();
      } else if (scrollSyncType === 'Vertical') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, false);
        return this.syncScroll.syncPositions();
      }
    },
    _getEditorsForQuickDiff: function() {
      var activeItem, editor1, editor2, j, len, p, panes, rightPaneIndex;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (j = 0, len = panes.length; j < len; j++) {
        p = panes[j];
        activeItem = p.getActiveItem();
        if (atom.workspace.isTextEditor(activeItem)) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = atom.workspace.buildTextEditor();
        this.wasEditor1Created = true;
        panes[0].addItem(editor1);
        panes[0].activateItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        if (panes[rightPaneIndex]) {
          panes[rightPaneIndex].addItem(editor2);
          panes[rightPaneIndex].activateItem(editor2);
        } else {
          atom.workspace.paneForItem(editor1).splitRight({
            items: [editor2]
          });
        }
      }
      return Promise.resolve({
        editor1: editor1,
        editor2: editor2
      });
    },
    _getEditorsForDiffWithActive: function(filePath) {
      var activeEditor, editor1, editor2Promise, noActiveEditorMsg, panes, rightPane, rightPaneIndex;
      activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor != null) {
        editor1 = activeEditor;
        this.wasEditor2Created = true;
        panes = atom.workspace.getPanes();
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        rightPane = panes[rightPaneIndex] || atom.workspace.paneForItem(editor1).splitRight();
        if (editor1.getPath() === filePath) {
          filePath = null;
        }
        editor2Promise = atom.workspace.openURIInPane(filePath, rightPane);
        return editor2Promise.then(function(editor2) {
          return {
            editor1: editor1,
            editor2: editor2
          };
        });
      } else {
        noActiveEditorMsg = 'No active file found! (Try focusing a text editor)';
        atom.notifications.addWarning('Split Diff', {
          detail: noActiveEditorMsg,
          dismissable: false,
          icon: 'diff'
        });
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    },
    _setupVisibleEditors: function(editor1, editor2) {
      var BufferExtender, buffer1LineEnding, buffer2LineEnding, lineEndingMsg, shouldNotify, softWrapMsg;
      BufferExtender = require('./buffer-extender');
      buffer1LineEnding = (new BufferExtender(editor1.getBuffer())).getLineEnding();
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
        if (buffer1LineEnding === '\n' || buffer1LineEnding === '\r\n') {
          this.editorSubscriptions.add(editor2.onWillInsertText(function() {
            return editor2.getBuffer().setPreferredLineEnding(buffer1LineEnding);
          }));
        }
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      shouldNotify = !this._getConfig('muteNotifications');
      softWrapMsg = 'Warning: Soft wrap enabled! (Line diffs may not align)';
      if (editor1.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      } else if (editor2.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      buffer2LineEnding = (new BufferExtender(editor2.getBuffer())).getLineEnding();
      if (buffer2LineEnding !== '' && (buffer1LineEnding !== buffer2LineEnding) && editor1.getLineCount() !== 1 && editor2.getLineCount() !== 1 && shouldNotify) {
        lineEndingMsg = 'Warning: Line endings differ!';
        return atom.notifications.addWarning('Split Diff', {
          detail: lineEndingMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, j, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.selectAll();
                editor2.insertText(gitHeadText);
                this.hasGitRepo = true;
                break;
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    },
    _createTempFiles: function(editors) {
      var editor1Path, editor1TempFile, editor2Path, editor2TempFile, editorPaths, tempFolderPath;
      editor1Path = '';
      editor2Path = '';
      tempFolderPath = atom.getConfigDirPath() + '/split-diff';
      editor1Path = tempFolderPath + '/split-diff 1';
      editor1TempFile = new File(editor1Path);
      editor1TempFile.writeSync(editors.editor1.getText());
      editor2Path = tempFolderPath + '/split-diff 2';
      editor2TempFile = new File(editor2Path);
      editor2TempFile.writeSync(editors.editor2.getText());
      editorPaths = {
        editor1Path: editor1Path,
        editor2Path: editor2Path
      };
      return editorPaths;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    },
    getMarkerLayers: function() {
      return new Promise(function(resolve, reject) {
        return window.splitDiffResolves.push(resolve);
      });
    },
    provideSplitDiff: function() {
      return {
        getMarkerLayers: this.getMarkerLayers
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQix5QkFBdEIsRUFBaUM7O0VBQ2pDLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLG1CQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsa0JBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtJQUFBLFFBQUEsRUFBVSxJQUFWO0lBQ0EsTUFBQSxFQUFRLFlBRFI7SUFFQSxhQUFBLEVBQWUsSUFGZjtJQUdBLG1CQUFBLEVBQXFCLElBSHJCO0lBSUEsU0FBQSxFQUFXLEtBSlg7SUFLQSxpQkFBQSxFQUFtQixLQUxuQjtJQU1BLGlCQUFBLEVBQW1CLEtBTm5CO0lBT0EsVUFBQSxFQUFZLEtBUFo7SUFRQSxPQUFBLEVBQVMsSUFSVDtJQVVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixNQUFNLENBQUMsaUJBQVAsR0FBMkI7TUFFM0IsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO2FBQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsdURBQWxCLEVBQ2pCO1FBQUEsbUJBQUEsRUFBcUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO1lBQ25CLEtBQUMsQ0FBQSxT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U0FBaEIsQ0FBMEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFoQixDQUFBLENBQTFCO01BRUEsV0FBQSxHQUNFO1FBQUEsV0FBQSxFQUFhLFdBQWI7UUFDQSxXQUFBLEVBQWEsV0FEYjs7QUFHRixhQUFPO0lBakJTLENBellsQjtJQTZaQSxVQUFBLEVBQVksU0FBQyxNQUFEO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGFBQUEsR0FBYyxNQUE5QjtJQURVLENBN1paO0lBZ2FBLFVBQUEsRUFBWSxTQUFDLE1BQUQsRUFBUyxLQUFUO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGFBQUEsR0FBYyxNQUE5QixFQUF3QyxLQUF4QztJQURVLENBaGFaO0lBcWFBLGVBQUEsRUFBaUIsU0FBQTthQUNYLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7ZUFDVixNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBekIsQ0FBOEIsT0FBOUI7TUFEVSxDQUFSO0lBRFcsQ0FyYWpCO0lBeWFBLGdCQUFBLEVBQWtCLFNBQUE7YUFDaEI7UUFBQSxlQUFBLEVBQWlCLElBQUMsQ0FBQSxlQUFsQjs7SUFEZ0IsQ0F6YWxCOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpcmVjdG9yeSwgRmlsZX0gPSByZXF1aXJlICdhdG9tJ1xuRGlmZlZpZXcgPSByZXF1aXJlICcuL2RpZmYtdmlldydcbkxvYWRpbmdWaWV3ID0gcmVxdWlyZSAnLi91aS9sb2FkaW5nLXZpZXcnXG5Gb290ZXJWaWV3ID0gcmVxdWlyZSAnLi91aS9mb290ZXItdmlldydcblN5bmNTY3JvbGwgPSByZXF1aXJlICcuL3N5bmMtc2Nyb2xsJ1xuY29uZmlnU2NoZW1hID0gcmVxdWlyZSAnLi9jb25maWctc2NoZW1hJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID0gU3BsaXREaWZmID1cbiAgZGlmZlZpZXc6IG51bGxcbiAgY29uZmlnOiBjb25maWdTY2hlbWFcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBlZGl0b3JTdWJzY3JpcHRpb25zOiBudWxsXG4gIGlzRW5hYmxlZDogZmFsc2VcbiAgd2FzRWRpdG9yMUNyZWF0ZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjJDcmVhdGVkOiBmYWxzZVxuICBoYXNHaXRSZXBvOiBmYWxzZVxuICBwcm9jZXNzOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICB3aW5kb3cuc3BsaXREaWZmUmVzb2x2ZXMgPSBbXVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZSwgLnRyZWUtdmlldyAuc2VsZWN0ZWQsIC50YWIudGV4dGVkaXRvcicsXG4gICAgICAnc3BsaXQtZGlmZjplbmFibGUnOiAoZSkgPT5cbiAgICAgICAgQGRpZmZQYW5lcyhlKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQG5leHREaWZmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkaWZmUGFuZXMoKVxuICAgICAgJ3NwbGl0LWRpZmY6cHJldi1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBwcmV2RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQGNvcHlUb1JpZ2h0KClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCc6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAY29weVRvTGVmdCgpXG4gICAgICAnc3BsaXQtZGlmZjpkaXNhYmxlJzogPT4gQGRpc2FibGUoKVxuICAgICAgJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnOiA9PiBAdG9nZ2xlSWdub3JlV2hpdGVzcGFjZSgpXG4gICAgICAnc3BsaXQtZGlmZjp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNhYmxlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAjIGNhbGxlZCBieSBcInRvZ2dsZVwiIGNvbW1hbmRcbiAgIyB0b2dnbGVzIHNwbGl0IGRpZmZcbiAgdG9nZ2xlOiAoKSAtPlxuICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgIEBkaXNhYmxlKClcbiAgICBlbHNlXG4gICAgICBAZGlmZlBhbmVzKClcblxuICAjIGNhbGxlZCBieSBcIkRpc2FibGVcIiBjb21tYW5kXG4gICMgcmVtb3ZlcyBkaWZmIGFuZCBzeW5jIHNjcm9sbCwgZGlzcG9zZXMgb2Ygc3Vic2NyaXB0aW9uc1xuICBkaXNhYmxlOiAoKSAtPlxuICAgIEBpc0VuYWJsZWQgPSBmYWxzZVxuXG4gICAgIyByZW1vdmUgbGlzdGVuZXJzXG4gICAgaWYgQGVkaXRvclN1YnNjcmlwdGlvbnM/XG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgaWYgQHdhc0VkaXRvcjFDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDEpXG4gICAgICBpZiBAd2FzRWRpdG9yMkNyZWF0ZWRcbiAgICAgICAgQGRpZmZWaWV3LmNsZWFuVXBFZGl0b3IoMilcbiAgICAgIEBkaWZmVmlldy5kZXN0cm95KClcbiAgICAgIEBkaWZmVmlldyA9IG51bGxcblxuICAgICMgcmVtb3ZlIHZpZXdzXG4gICAgaWYgQGZvb3RlclZpZXc/XG4gICAgICBAZm9vdGVyVmlldy5kZXN0cm95KClcbiAgICAgIEBmb290ZXJWaWV3ID0gbnVsbFxuICAgIGlmIEBsb2FkaW5nVmlldz9cbiAgICAgIEBsb2FkaW5nVmlldy5kZXN0cm95KClcbiAgICAgIEBsb2FkaW5nVmlldyA9IG51bGxcblxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAgICMgcmVzZXQgYWxsIHZhcmlhYmxlc1xuICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gZmFsc2VcbiAgICBAaGFzR2l0UmVwbyA9IGZhbHNlXG5cbiAgICAjIGF1dG8gaGlkZSB0cmVlIHZpZXcgd2hpbGUgZGlmZmluZyAjODJcbiAgICBpZiBAX2dldENvbmZpZygnaGlkZVRyZWVWaWV3JylcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3RyZWUtdmlldzpzaG93JylcblxuICAjIGNhbGxlZCBieSBcInRvZ2dsZSBpZ25vcmUgd2hpdGVzcGFjZVwiIGNvbW1hbmRcbiAgIyB0b2dnbGVzIGlnbm9yaW5nIHdoaXRlc3BhY2UgYW5kIHJlZnJlc2hlcyB0aGUgZGlmZlxuICB0b2dnbGVJZ25vcmVXaGl0ZXNwYWNlOiAtPlxuICAgIGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgQF9zZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnLCAhaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICBAZm9vdGVyVmlldz8uc2V0SWdub3JlV2hpdGVzcGFjZSghaXNXaGl0ZXNwYWNlSWdub3JlZClcblxuICAjIGNhbGxlZCBieSBcIk1vdmUgdG8gbmV4dCBkaWZmXCIgY29tbWFuZFxuICBuZXh0RGlmZjogLT5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBzZWxlY3RlZEluZGV4ID0gQGRpZmZWaWV3Lm5leHREaWZmKClcbiAgICAgIEBmb290ZXJWaWV3Py5zaG93U2VsZWN0aW9uQ291bnQoIHNlbGVjdGVkSW5kZXggKyAxIClcblxuICAjIGNhbGxlZCBieSBcIk1vdmUgdG8gcHJldmlvdXMgZGlmZlwiIGNvbW1hbmRcbiAgcHJldkRpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IEBkaWZmVmlldy5wcmV2RGlmZigpXG4gICAgICBAZm9vdGVyVmlldz8uc2hvd1NlbGVjdGlvbkNvdW50KCBzZWxlY3RlZEluZGV4ICsgMSApXG5cbiAgIyBjYWxsZWQgYnkgXCJDb3B5IHRvIHJpZ2h0XCIgY29tbWFuZFxuICBjb3B5VG9SaWdodDogLT5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBAZGlmZlZpZXcuY29weVRvUmlnaHQoKVxuICAgICAgQGZvb3RlclZpZXc/LmhpZGVTZWxlY3Rpb25Db3VudCgpXG5cbiAgIyBjYWxsZWQgYnkgXCJDb3B5IHRvIGxlZnRcIiBjb21tYW5kXG4gIGNvcHlUb0xlZnQ6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgQGRpZmZWaWV3LmNvcHlUb0xlZnQoKVxuICAgICAgQGZvb3RlclZpZXc/LmhpZGVTZWxlY3Rpb25Db3VudCgpXG5cbiAgIyBjYWxsZWQgYnkgdGhlIGNvbW1hbmRzIGVuYWJsZS90b2dnbGUgdG8gZG8gaW5pdGlhbCBkaWZmXG4gICMgc2V0cyB1cCBzdWJzY3JpcHRpb25zIGZvciBhdXRvIGRpZmYgYW5kIGRpc2FibGluZyB3aGVuIGEgcGFuZSBpcyBkZXN0cm95ZWRcbiAgIyBldmVudCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBvZiBhIGZpbGUgcGF0aCB0byBkaWZmIHdpdGggY3VycmVudFxuICBkaWZmUGFuZXM6IChldmVudCkgLT5cbiAgICAjIGluIGNhc2UgZW5hYmxlIHdhcyBjYWxsZWQgYWdhaW5cbiAgICBAZGlzYWJsZSgpXG5cbiAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIGlmIGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygndGFiJylcbiAgICAgIGZpbGVQYXRoID0gZXZlbnQuY3VycmVudFRhcmdldC5wYXRoXG4gICAgICBlZGl0b3JzUHJvbWlzZSA9IEBfZ2V0RWRpdG9yc0ZvckRpZmZXaXRoQWN0aXZlKGZpbGVQYXRoKVxuICAgIGVsc2UgaWYgZXZlbnQ/LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsaXN0LWl0ZW0nKSAmJiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGUnKVxuICAgICAgZmlsZVBhdGggPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFBhdGgoKVxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZShmaWxlUGF0aClcbiAgICBlbHNlXG4gICAgICBlZGl0b3JzUHJvbWlzZSA9IEBfZ2V0RWRpdG9yc0ZvclF1aWNrRGlmZigpXG5cbiAgICBlZGl0b3JzUHJvbWlzZS50aGVuICgoZWRpdG9ycykgLT5cbiAgICAgIGlmIGVkaXRvcnMgPT0gbnVsbFxuICAgICAgICByZXR1cm5cbiAgICAgIEBfc2V0dXBWaXNpYmxlRWRpdG9ycyhlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMilcbiAgICAgIEBkaWZmVmlldyA9IG5ldyBEaWZmVmlldyhlZGl0b3JzKVxuXG4gICAgICAjIGFkZCBsaXN0ZW5lcnNcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBkaXNhYmxlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBkaXNhYmxlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc3BsaXQtZGlmZicsICgpID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxuICAgICAgICBAZGlmZlZpZXcuaGFuZGxlQ3Vyc29yQ2hhbmdlKGV2ZW50LmN1cnNvciwgZXZlbnQub2xkQnVmZmVyUG9zaXRpb24sIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMi5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgQGRpZmZWaWV3LmhhbmRsZUN1cnNvckNoYW5nZShldmVudC5jdXJzb3IsIGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWRBZGRDdXJzb3IgKGN1cnNvcikgPT5cbiAgICAgICAgQGRpZmZWaWV3LmhhbmRsZUN1cnNvckNoYW5nZShjdXJzb3IsIC0xLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRBZGRDdXJzb3IgKGN1cnNvcikgPT5cbiAgICAgICAgQGRpZmZWaWV3LmhhbmRsZUN1cnNvckNoYW5nZShjdXJzb3IsIC0xLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuICAgICAgIyBhZGQgdGhlIGJvdHRvbSBVSSBwYW5lbFxuICAgICAgaWYgIUBmb290ZXJWaWV3P1xuICAgICAgICBAZm9vdGVyVmlldyA9IG5ldyBGb290ZXJWaWV3KEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJykpXG4gICAgICAgIEBmb290ZXJWaWV3LmNyZWF0ZVBhbmVsKClcbiAgICAgIEBmb290ZXJWaWV3LnNob3coKVxuXG4gICAgICAjIHVwZGF0ZSBkaWZmIGlmIHRoZXJlIGlzIG5vIGdpdCByZXBvIChubyBvbmNoYW5nZSBmaXJlZClcbiAgICAgIGlmICFAaGFzR2l0UmVwb1xuICAgICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuXG4gICAgICAjIGFkZCBhcHBsaWNhdGlvbiBtZW51IGl0ZW1zXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5tZW51LmFkZCBbXG4gICAgICAgIHtcbiAgICAgICAgICAnbGFiZWwnOiAnUGFja2FnZXMnXG4gICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICAnbGFiZWwnOiAnU3BsaXQgRGlmZidcbiAgICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdJZ25vcmUgV2hpdGVzcGFjZScsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBOZXh0IERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOm5leHQtZGlmZicgfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIFByZXZpb3VzIERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOnByZXYtZGlmZicgfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIFJpZ2h0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0J31cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBMZWZ0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgXVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29udGV4dE1lbnUuYWRkIHtcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbe1xuICAgICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJyxcbiAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0lnbm9yZSBXaGl0ZXNwYWNlJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZScgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBOZXh0IERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOm5leHQtZGlmZicgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBQcmV2aW91cyBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpwcmV2LWRpZmYnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gUmlnaHQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBMZWZ0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnfVxuICAgICAgICAgIF1cbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICAgICkuYmluZCh0aGlzKSAjIG1ha2Ugc3VyZSB0aGUgc2NvcGUgaXMgY29ycmVjdFxuXG4gICMgY2FsbGVkIGJ5IGJvdGggZGlmZlBhbmVzIGFuZCB0aGUgZWRpdG9yIHN1YnNjcmlwdGlvbiB0byB1cGRhdGUgdGhlIGRpZmZcbiAgdXBkYXRlRGlmZjogKGVkaXRvcnMpIC0+XG4gICAgQGlzRW5hYmxlZCA9IHRydWVcblxuICAgICMgYXV0byBoaWRlIHRyZWUgdmlldyB3aGlsZSBkaWZmaW5nICM4MlxuICAgIGlmIEBfZ2V0Q29uZmlnKCdoaWRlVHJlZVZpZXcnKSAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudHJlZS12aWV3JylcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3RyZWUtdmlldzp0b2dnbGUnKVxuXG4gICAgIyBpZiB0aGVyZSBpcyBhIGRpZmYgYmVpbmcgY29tcHV0ZWQgaW4gdGhlIGJhY2tncm91bmQsIGNhbmNlbCBpdFxuICAgIGlmIEBwcm9jZXNzP1xuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAcHJvY2VzcyA9IG51bGxcblxuICAgIGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgZWRpdG9yUGF0aHMgPSBAX2NyZWF0ZVRlbXBGaWxlcyhlZGl0b3JzKVxuXG4gICAgIyBjcmVhdGUgdGhlIGxvYWRpbmcgdmlldyBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuICAgIGlmICFAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcgPSBuZXcgTG9hZGluZ1ZpZXcoKVxuICAgICAgQGxvYWRpbmdWaWV3LmNyZWF0ZU1vZGFsKClcbiAgICBAbG9hZGluZ1ZpZXcuc2hvdygpXG5cbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuICAgIHtCdWZmZXJlZE5vZGVQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZSBfX2Rpcm5hbWUsIFwiLi9jb21wdXRlLWRpZmYuanNcIlxuICAgIGFyZ3MgPSBbZWRpdG9yUGF0aHMuZWRpdG9yMVBhdGgsIGVkaXRvclBhdGhzLmVkaXRvcjJQYXRoLCBpc1doaXRlc3BhY2VJZ25vcmVkXVxuICAgIHRoZU91dHB1dCA9ICcnXG4gICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgIHRoZU91dHB1dCA9IG91dHB1dFxuICAgICAgY29tcHV0ZWREaWZmID0gSlNPTi5wYXJzZShvdXRwdXQpXG4gICAgICBAcHJvY2Vzcy5raWxsKClcbiAgICAgIEBwcm9jZXNzID0gbnVsbFxuICAgICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcbiAgICAgIEBfcmVzdW1lVXBkYXRlRGlmZihlZGl0b3JzLCBjb21wdXRlZERpZmYpXG4gICAgc3RkZXJyID0gKGVycikgPT5cbiAgICAgIHRoZU91dHB1dCA9IGVyclxuICAgIGV4aXQgPSAoY29kZSkgPT5cbiAgICAgIEBsb2FkaW5nVmlldz8uaGlkZSgpXG5cbiAgICAgIGlmIGNvZGUgIT0gMFxuICAgICAgICBjb25zb2xlLmxvZygnQnVmZmVyZWROb2RlUHJvY2VzcyBjb2RlIHdhcyAnICsgY29kZSlcbiAgICAgICAgY29uc29sZS5sb2codGhlT3V0cHV0KVxuICAgIEBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkTm9kZVByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuXG4gICMgcmVzdW1lcyBhZnRlciB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgcmV0dXJuc1xuICBfcmVzdW1lVXBkYXRlRGlmZjogKGVkaXRvcnMsIGNvbXB1dGVkRGlmZikgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBkaWZmVmlldz9cblxuICAgIEBkaWZmVmlldy5jbGVhckRpZmYoKVxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAgIGxlZnRIaWdobGlnaHRUeXBlID0gJ2FkZGVkJ1xuICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdyZW1vdmVkJ1xuICAgIGlmIEBfZ2V0Q29uZmlnKCdsZWZ0RWRpdG9yQ29sb3InKSA9PSAncmVkJ1xuICAgICAgbGVmdEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCdcbiAgICBpZiBAX2dldENvbmZpZygncmlnaHRFZGl0b3JDb2xvcicpID09ICdncmVlbidcbiAgICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdhZGRlZCdcbiAgICBAZGlmZlZpZXcuZGlzcGxheURpZmYoY29tcHV0ZWREaWZmLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBAX2dldENvbmZpZygnZGlmZldvcmRzJyksIEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJykpXG5cbiAgICB3aGlsZSB3aW5kb3cuc3BsaXREaWZmUmVzb2x2ZXM/Lmxlbmd0aFxuICAgICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzLnBvcCgpKEBkaWZmVmlldy5nZXRNYXJrZXJMYXllcnMoKSlcblxuICAgIEBmb290ZXJWaWV3Py5zZXROdW1EaWZmZXJlbmNlcyhAZGlmZlZpZXcuZ2V0TnVtRGlmZmVyZW5jZXMoKSlcblxuICAgIHNjcm9sbFN5bmNUeXBlID0gQF9nZXRDb25maWcoJ3Njcm9sbFN5bmNUeXBlJylcbiAgICBpZiBzY3JvbGxTeW5jVHlwZSA9PSAnVmVydGljYWwgKyBIb3Jpem9udGFsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgdHJ1ZSlcbiAgICAgIEBzeW5jU2Nyb2xsLnN5bmNQb3NpdGlvbnMoKVxuICAgIGVsc2UgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgZmFsc2UpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcblxuICAjIEdldHMgdGhlIGZpcnN0IHR3byB2aXNpYmxlIGVkaXRvcnMgZm91bmQgb3IgY3JlYXRlcyB0aGVtIGFzIG5lZWRlZC5cbiAgIyBSZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB5aWVsZHMgYSB2YWx1ZSBvZiB7ZWRpdG9yMTogVGV4dEVkaXRvciwgZWRpdG9yMjogVGV4dEVkaXRvcn1cbiAgX2dldEVkaXRvcnNGb3JRdWlja0RpZmY6ICgpIC0+XG4gICAgZWRpdG9yMSA9IG51bGxcbiAgICBlZGl0b3IyID0gbnVsbFxuXG4gICAgIyB0cnkgdG8gZmluZCB0aGUgZmlyc3QgdHdvIGVkaXRvcnNcbiAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICBmb3IgcCBpbiBwYW5lc1xuICAgICAgYWN0aXZlSXRlbSA9IHAuZ2V0QWN0aXZlSXRlbSgpXG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoYWN0aXZlSXRlbSlcbiAgICAgICAgaWYgZWRpdG9yMSA9PSBudWxsXG4gICAgICAgICAgZWRpdG9yMSA9IGFjdGl2ZUl0ZW1cbiAgICAgICAgZWxzZSBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgICAgICBlZGl0b3IyID0gYWN0aXZlSXRlbVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAjIGF1dG8gb3BlbiBlZGl0b3IgcGFuZXMgc28gd2UgaGF2ZSB0d28gdG8gZGlmZiB3aXRoXG4gICAgaWYgZWRpdG9yMSA9PSBudWxsXG4gICAgICBlZGl0b3IxID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IHRydWVcbiAgICAgICMgYWRkIGZpcnN0IGVkaXRvciB0byB0aGUgZmlyc3QgcGFuZVxuICAgICAgcGFuZXNbMF0uYWRkSXRlbShlZGl0b3IxKVxuICAgICAgcGFuZXNbMF0uYWN0aXZhdGVJdGVtKGVkaXRvcjEpXG4gICAgaWYgZWRpdG9yMiA9PSBudWxsXG4gICAgICBlZGl0b3IyID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IHRydWVcbiAgICAgIGVkaXRvcjIuc2V0R3JhbW1hcihlZGl0b3IxLmdldEdyYW1tYXIoKSlcbiAgICAgIHJpZ2h0UGFuZUluZGV4ID0gcGFuZXMuaW5kZXhPZihhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKSkgKyAxXG4gICAgICBpZiBwYW5lc1tyaWdodFBhbmVJbmRleF1cbiAgICAgICAgIyBhZGQgc2Vjb25kIGVkaXRvciB0byBleGlzdGluZyBwYW5lIHRvIHRoZSByaWdodCBvZiBmaXJzdCBlZGl0b3JcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFkZEl0ZW0oZWRpdG9yMilcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFjdGl2YXRlSXRlbShlZGl0b3IyKVxuICAgICAgZWxzZVxuICAgICAgICAjIG5vIGV4aXN0aW5nIHBhbmUgc28gc3BsaXQgcmlnaHRcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCh7aXRlbXM6IFtlZGl0b3IyXX0pXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfSlcblxuICAjIEdldHMgdGhlIGFjdGl2ZSBlZGl0b3IgYW5kIG9wZW5zIHRoZSBzcGVjaWZpZWQgZmlsZSB0byB0aGUgcmlnaHQgb2YgaXRcbiAgIyBSZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB5aWVsZHMgYSB2YWx1ZSBvZiB7ZWRpdG9yMTogVGV4dEVkaXRvciwgZWRpdG9yMjogVGV4dEVkaXRvcn1cbiAgX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZTogKGZpbGVQYXRoKSAtPlxuICAgIGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGFjdGl2ZUVkaXRvcj9cbiAgICAgIGVkaXRvcjEgPSBhY3RpdmVFZGl0b3JcbiAgICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IHRydWVcbiAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgIyBnZXQgaW5kZXggb2YgcGFuZSBmb2xsb3dpbmcgYWN0aXZlIGVkaXRvciBwYW5lXG4gICAgICByaWdodFBhbmVJbmRleCA9IHBhbmVzLmluZGV4T2YoYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkpICsgMVxuICAgICAgIyBwYW5lIGlzIGNyZWF0ZWQgaWYgdGhlcmUgaXMgbm90IG9uZSB0byB0aGUgcmlnaHQgb2YgdGhlIGFjdGl2ZSBlZGl0b3JcbiAgICAgIHJpZ2h0UGFuZSA9IHBhbmVzW3JpZ2h0UGFuZUluZGV4XSB8fCBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKS5zcGxpdFJpZ2h0KClcbiAgICAgIGlmIGVkaXRvcjEuZ2V0UGF0aCgpID09IGZpbGVQYXRoXG4gICAgICAgICMgaWYgZGlmZmluZyB3aXRoIGl0c2VsZiwgc2V0IGZpbGVQYXRoIHRvIG51bGwgc28gYW4gZW1wdHkgZWRpdG9yIGlzXG4gICAgICAgICMgb3BlbmVkLCB3aGljaCB3aWxsIGNhdXNlIGEgZ2l0IGRpZmZcbiAgICAgICAgZmlsZVBhdGggPSBudWxsXG4gICAgICBlZGl0b3IyUHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUoZmlsZVBhdGgsIHJpZ2h0UGFuZSlcblxuICAgICAgcmV0dXJuIGVkaXRvcjJQcm9taXNlLnRoZW4gKGVkaXRvcjIpIC0+XG4gICAgICAgIHJldHVybiB7ZWRpdG9yMTogZWRpdG9yMSwgZWRpdG9yMjogZWRpdG9yMn1cbiAgICBlbHNlXG4gICAgICBub0FjdGl2ZUVkaXRvck1zZyA9ICdObyBhY3RpdmUgZmlsZSBmb3VuZCEgKFRyeSBmb2N1c2luZyBhIHRleHQgZWRpdG9yKSdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogbm9BY3RpdmVFZGl0b3JNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcblxuICBfc2V0dXBWaXNpYmxlRWRpdG9yczogKGVkaXRvcjEsIGVkaXRvcjIpIC0+XG4gICAgQnVmZmVyRXh0ZW5kZXIgPSByZXF1aXJlICcuL2J1ZmZlci1leHRlbmRlcidcbiAgICBidWZmZXIxTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMS5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuXG4gICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAjIHdhbnQgdG8gc2Nyb2xsIGEgbmV3bHkgY3JlYXRlZCBlZGl0b3IgdG8gdGhlIGZpcnN0IGVkaXRvcidzIHBvc2l0aW9uXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yMSkuZm9jdXMoKVxuICAgICAgIyBzZXQgdGhlIHByZWZlcnJlZCBsaW5lIGVuZGluZyBiZWZvcmUgaW5zZXJ0aW5nIHRleHQgIzM5XG4gICAgICBpZiBidWZmZXIxTGluZUVuZGluZyA9PSAnXFxuJyB8fCBidWZmZXIxTGluZUVuZGluZyA9PSAnXFxyXFxuJ1xuICAgICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yMi5vbldpbGxJbnNlcnRUZXh0ICgpIC0+XG4gICAgICAgICAgZWRpdG9yMi5nZXRCdWZmZXIoKS5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nKGJ1ZmZlcjFMaW5lRW5kaW5nKVxuXG4gICAgQF9zZXR1cEdpdFJlcG8oZWRpdG9yMSwgZWRpdG9yMilcblxuICAgICMgdW5mb2xkIGFsbCBsaW5lcyBzbyBkaWZmcyBwcm9wZXJseSBhbGlnblxuICAgIGVkaXRvcjEudW5mb2xkQWxsKClcbiAgICBlZGl0b3IyLnVuZm9sZEFsbCgpXG5cbiAgICBzaG91bGROb3RpZnkgPSAhQF9nZXRDb25maWcoJ211dGVOb3RpZmljYXRpb25zJylcbiAgICBzb2Z0V3JhcE1zZyA9ICdXYXJuaW5nOiBTb2Z0IHdyYXAgZW5hYmxlZCEgKExpbmUgZGlmZnMgbWF5IG5vdCBhbGlnbiknXG4gICAgaWYgZWRpdG9yMS5pc1NvZnRXcmFwcGVkKCkgJiYgc2hvdWxkTm90aWZ5XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG4gICAgZWxzZSBpZiBlZGl0b3IyLmlzU29mdFdyYXBwZWQoKSAmJiBzaG91bGROb3RpZnlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogc29mdFdyYXBNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcblxuICAgIGJ1ZmZlcjJMaW5lRW5kaW5nID0gKG5ldyBCdWZmZXJFeHRlbmRlcihlZGl0b3IyLmdldEJ1ZmZlcigpKSkuZ2V0TGluZUVuZGluZygpXG4gICAgaWYgYnVmZmVyMkxpbmVFbmRpbmcgIT0gJycgJiYgKGJ1ZmZlcjFMaW5lRW5kaW5nICE9IGJ1ZmZlcjJMaW5lRW5kaW5nKSAmJiBlZGl0b3IxLmdldExpbmVDb3VudCgpICE9IDEgJiYgZWRpdG9yMi5nZXRMaW5lQ291bnQoKSAhPSAxICYmIHNob3VsZE5vdGlmeVxuICAgICAgIyBwb3Agd2FybmluZyBpZiB0aGUgbGluZSBlbmRpbmdzIGRpZmZlciBhbmQgd2UgaGF2ZW4ndCBkb25lIGFueXRoaW5nIGFib3V0IGl0XG4gICAgICBsaW5lRW5kaW5nTXNnID0gJ1dhcm5pbmc6IExpbmUgZW5kaW5ncyBkaWZmZXIhJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBsaW5lRW5kaW5nTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgX3NldHVwR2l0UmVwbzogKGVkaXRvcjEsIGVkaXRvcjIpIC0+XG4gICAgZWRpdG9yMVBhdGggPSBlZGl0b3IxLmdldFBhdGgoKVxuICAgICMgb25seSBzaG93IGdpdCBjaGFuZ2VzIGlmIHRoZSByaWdodCBlZGl0b3IgaXMgZW1wdHlcbiAgICBpZiBlZGl0b3IxUGF0aD8gJiYgKGVkaXRvcjIuZ2V0TGluZUNvdW50KCkgPT0gMSAmJiBlZGl0b3IyLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApID09ICcnKVxuICAgICAgZm9yIGRpcmVjdG9yeSwgaSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgICBpZiBlZGl0b3IxUGF0aCBpcyBkaXJlY3RvcnkuZ2V0UGF0aCgpIG9yIGRpcmVjdG9yeS5jb250YWlucyhlZGl0b3IxUGF0aClcbiAgICAgICAgICBwcm9qZWN0UmVwbyA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVtpXVxuICAgICAgICAgIGlmIHByb2plY3RSZXBvPyAmJiBwcm9qZWN0UmVwby5yZXBvP1xuICAgICAgICAgICAgcmVsYXRpdmVFZGl0b3IxUGF0aCA9IHByb2plY3RSZXBvLnJlbGF0aXZpemUoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgICBnaXRIZWFkVGV4dCA9IHByb2plY3RSZXBvLnJlcG8uZ2V0SGVhZEJsb2IocmVsYXRpdmVFZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGlmIGdpdEhlYWRUZXh0P1xuICAgICAgICAgICAgICBlZGl0b3IyLnNlbGVjdEFsbCgpXG4gICAgICAgICAgICAgIGVkaXRvcjIuaW5zZXJ0VGV4dChnaXRIZWFkVGV4dClcbiAgICAgICAgICAgICAgQGhhc0dpdFJlcG8gPSB0cnVlXG4gICAgICAgICAgICAgIGJyZWFrXG5cbiAgIyBjcmVhdGVzIHRlbXAgZmlsZXMgc28gdGhlIGNvbXB1dGUgZGlmZiBwcm9jZXNzIGNhbiBnZXQgdGhlIHRleHQgZWFzaWx5XG4gIF9jcmVhdGVUZW1wRmlsZXM6IChlZGl0b3JzKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gJydcbiAgICBlZGl0b3IyUGF0aCA9ICcnXG4gICAgdGVtcEZvbGRlclBhdGggPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSArICcvc3BsaXQtZGlmZidcblxuICAgIGVkaXRvcjFQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMSdcbiAgICBlZGl0b3IxVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IxUGF0aClcbiAgICBlZGl0b3IxVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMS5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3IyUGF0aCA9IHRlbXBGb2xkZXJQYXRoICsgJy9zcGxpdC1kaWZmIDInXG4gICAgZWRpdG9yMlRlbXBGaWxlID0gbmV3IEZpbGUoZWRpdG9yMlBhdGgpXG4gICAgZWRpdG9yMlRlbXBGaWxlLndyaXRlU3luYyhlZGl0b3JzLmVkaXRvcjIuZ2V0VGV4dCgpKVxuXG4gICAgZWRpdG9yUGF0aHMgPVxuICAgICAgZWRpdG9yMVBhdGg6IGVkaXRvcjFQYXRoXG4gICAgICBlZGl0b3IyUGF0aDogZWRpdG9yMlBhdGhcblxuICAgIHJldHVybiBlZGl0b3JQYXRoc1xuXG5cbiAgX2dldENvbmZpZzogKGNvbmZpZykgLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiKVxuXG4gIF9zZXRDb25maWc6IChjb25maWcsIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldChcInNwbGl0LWRpZmYuI3tjb25maWd9XCIsIHZhbHVlKVxuXG5cbiAgIyAtLS0gU0VSVklDRSBBUEkgLS0tXG4gIGdldE1hcmtlckxheWVyczogKCkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzLnB1c2gocmVzb2x2ZSlcblxuICBwcm92aWRlU3BsaXREaWZmOiAtPlxuICAgIGdldE1hcmtlckxheWVyczogQGdldE1hcmtlckxheWVyc1xuIl19
