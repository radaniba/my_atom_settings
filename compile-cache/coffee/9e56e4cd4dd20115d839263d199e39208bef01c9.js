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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQix5QkFBdEIsRUFBaUM7O0VBQ2pDLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLG1CQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsa0JBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtJQUFBLFFBQUEsRUFBVSxJQUFWO0lBQ0EsTUFBQSxFQUFRLFlBRFI7SUFFQSxhQUFBLEVBQWUsSUFGZjtJQUdBLG1CQUFBLEVBQXFCLElBSHJCO0lBSUEsU0FBQSxFQUFXLEtBSlg7SUFLQSxpQkFBQSxFQUFtQixLQUxuQjtJQU1BLGlCQUFBLEVBQW1CLEtBTm5CO0lBT0EsVUFBQSxFQUFZLEtBUFo7SUFRQSxPQUFBLEVBQVMsSUFSVDtJQVVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixNQUFNLENBQUMsaUJBQVAsR0FBMkI7TUFFM0IsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO2FBQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsdURBQWxCLEVBQ2pCO1FBQUEsbUJBQUEsRUFBcUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO1lBQ25CLEtBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWDttQkFDQSxDQUFDLENBQUMsZUFBRixDQUFBO1VBRm1CO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtRQUdBLHNCQUFBLEVBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDdEIsSUFBRyxLQUFDLENBQUEsU0FBSjtxQkFDRSxLQUFDLENBQUEsUUFBRCxDQUFBLEVBREY7YUFBQSxNQUFBO3FCQUdFLEtBQUMsQ0FBQSxTQUFELENBQUEsRUFIRjs7VUFEc0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSHhCO1FBUUEsc0JBQUEsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN0QixJQUFHLEtBQUMsQ0FBQSxTQUFKO3FCQUNFLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFERjthQUFBLE1BQUE7cUJBR0UsS0FBQyxDQUFBLFNBQUQsQ0FBQSxFQUhGOztVQURzQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSeEI7UUFhQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQzFCLElBQUcsS0FBQyxDQUFBLFNBQUo7cUJBQ0UsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQURGOztVQUQwQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FiNUI7UUFnQkEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN6QixJQUFHLEtBQUMsQ0FBQSxTQUFKO3FCQUNFLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFERjs7VUFEeUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBaEIzQjtRQW1CQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FuQnRCO1FBb0JBLDhCQUFBLEVBQWdDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLHNCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FwQmhDO1FBcUJBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQXJCckI7T0FEaUIsQ0FBbkI7SUFKUSxDQVZWO0lBc0NBLFVBQUEsRUFBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRlUsQ0F0Q1o7SUE0Q0EsTUFBQSxFQUFRLFNBQUE7TUFDTixJQUFHLElBQUMsQ0FBQSxTQUFKO2VBQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQUEsRUFIRjs7SUFETSxDQTVDUjtJQW9EQSxPQUFBLEVBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFHYixJQUFHLGdDQUFIO1FBQ0UsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE9BQXJCLENBQUE7UUFDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGekI7O01BSUEsSUFBRyxxQkFBSDtRQUNFLElBQUcsSUFBQyxDQUFBLGlCQUFKO1VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQXdCLENBQXhCLEVBREY7O1FBRUEsSUFBRyxJQUFDLENBQUEsaUJBQUo7VUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBd0IsQ0FBeEIsRUFERjs7UUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FOZDs7TUFTQSxJQUFHLHVCQUFIO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUE7UUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRmhCOztNQUdBLElBQUcsd0JBQUg7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FGakI7O01BSUEsSUFBRyx1QkFBSDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO1FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUZoQjs7TUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDckIsSUFBQyxDQUFBLGlCQUFELEdBQXFCO01BQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWM7TUFHZCxJQUFHLElBQUMsQ0FBQSxVQUFELENBQVksY0FBWixDQUFIO2VBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQsZ0JBQTNELEVBREY7O0lBbENPLENBcERUO0lBMkZBLHNCQUFBLEVBQXdCLFNBQUE7QUFDdEIsVUFBQTtNQUFBLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSxVQUFELENBQVksa0JBQVo7TUFDdEIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxrQkFBWixFQUFnQyxDQUFDLG1CQUFqQztvREFDVyxDQUFFLG1CQUFiLENBQWlDLENBQUMsbUJBQWxDO0lBSHNCLENBM0Z4QjtJQWlHQSxRQUFBLEVBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFHLHFCQUFIO1FBQ0UsYUFBQSxHQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBQTtzREFDTCxDQUFFLGtCQUFiLENBQWlDLGFBQUEsR0FBZ0IsQ0FBakQsV0FGRjs7SUFEUSxDQWpHVjtJQXVHQSxRQUFBLEVBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFHLHFCQUFIO1FBQ0UsYUFBQSxHQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBQTtzREFDTCxDQUFFLGtCQUFiLENBQWlDLGFBQUEsR0FBZ0IsQ0FBakQsV0FGRjs7SUFEUSxDQXZHVjtJQTZHQSxXQUFBLEVBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxJQUFHLHFCQUFIO1FBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQUE7c0RBQ1csQ0FBRSxrQkFBYixDQUFBLFdBRkY7O0lBRFcsQ0E3R2I7SUFtSEEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsSUFBRyxxQkFBSDtRQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixDQUFBO3NEQUNXLENBQUUsa0JBQWIsQ0FBQSxXQUZGOztJQURVLENBbkhaO0lBMkhBLFNBQUEsRUFBVyxTQUFDLEtBQUQ7QUFFVCxVQUFBO01BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUVBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQUE7TUFFM0Isb0JBQUcsS0FBSyxDQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBL0IsQ0FBd0MsS0FBeEMsVUFBSDtRQUNFLFFBQUEsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQy9CLGNBQUEsR0FBaUIsSUFBQyxDQUFBLDRCQUFELENBQThCLFFBQTlCLEVBRm5CO09BQUEsTUFHSyxxQkFBRyxLQUFLLENBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUEvQixDQUF3QyxXQUF4QyxXQUFBLHFCQUF3RCxLQUFLLENBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUEvQixDQUF3QyxNQUF4QyxXQUEzRDtRQUNILFFBQUEsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQXBCLENBQUE7UUFDWCxjQUFBLEdBQWlCLElBQUMsQ0FBQSw0QkFBRCxDQUE4QixRQUE5QixFQUZkO09BQUEsTUFBQTtRQUlILGNBQUEsR0FBaUIsSUFBQyxDQUFBLHVCQUFELENBQUEsRUFKZDs7YUFNTCxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFDLFNBQUMsT0FBRDtRQUNuQixJQUFHLE9BQUEsS0FBVyxJQUFkO0FBQ0UsaUJBREY7O1FBRUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLE9BQU8sQ0FBQyxPQUE5QixFQUF1QyxPQUFPLENBQUMsT0FBL0M7UUFDQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBUyxPQUFUO1FBR2hCLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxHQUFyQixDQUF5QixPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFoQixDQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUN6RCxLQUFDLENBQUEsVUFBRCxDQUFZLE9BQVo7VUFEeUQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQXpCO1FBRUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEdBQXJCLENBQXlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWhCLENBQWtDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ3pELEtBQUMsQ0FBQSxVQUFELENBQVksT0FBWjtVQUR5RDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBekI7UUFFQSxJQUFDLENBQUEsbUJBQW1CLENBQUMsR0FBckIsQ0FBeUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFoQixDQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNwRCxLQUFDLENBQUEsT0FBRCxDQUFBO1VBRG9EO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUF6QjtRQUVBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxHQUFyQixDQUF5QixPQUFPLENBQUMsT0FBTyxDQUFDLFlBQWhCLENBQTZCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ3BELEtBQUMsQ0FBQSxPQUFELENBQUE7VUFEb0Q7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQXpCO1FBRUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEdBQXJCLENBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixZQUF4QixFQUFzQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUM3RCxLQUFDLENBQUEsVUFBRCxDQUFZLE9BQVo7VUFENkQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLENBQXpCO1FBSUEsSUFBSSx1QkFBSjtVQUNFLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFELENBQVksa0JBQVosQ0FBWDtVQUNsQixJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosQ0FBQSxFQUZGOztRQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBO1FBR0EsSUFBRyxDQUFDLElBQUMsQ0FBQSxVQUFMO1VBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaLEVBREY7O1FBSUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEdBQXJCLENBQXlCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixDQUFjO1VBQ3JDO1lBQ0UsT0FBQSxFQUFTLFVBRFg7WUFFRSxTQUFBLEVBQVc7Y0FDVDtnQkFBQSxPQUFBLEVBQVMsWUFBVDtnQkFDQSxTQUFBLEVBQVc7a0JBQ1Q7b0JBQUUsT0FBQSxFQUFTLG1CQUFYO29CQUFnQyxTQUFBLEVBQVcsOEJBQTNDO21CQURTLEVBRVQ7b0JBQUUsT0FBQSxFQUFTLG1CQUFYO29CQUFnQyxTQUFBLEVBQVcsc0JBQTNDO21CQUZTLEVBR1Q7b0JBQUUsT0FBQSxFQUFTLHVCQUFYO29CQUFvQyxTQUFBLEVBQVcsc0JBQS9DO21CQUhTLEVBSVQ7b0JBQUUsT0FBQSxFQUFTLGVBQVg7b0JBQTRCLFNBQUEsRUFBVywwQkFBdkM7bUJBSlMsRUFLVDtvQkFBRSxPQUFBLEVBQVMsY0FBWDtvQkFBMkIsU0FBQSxFQUFXLHlCQUF0QzttQkFMUztpQkFEWDtlQURTO2FBRmI7V0FEcUM7U0FBZCxDQUF6QjtlQWVBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxHQUFyQixDQUF5QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQWpCLENBQXFCO1VBQzVDLGtCQUFBLEVBQW9CO1lBQUM7Y0FDbkIsT0FBQSxFQUFTLFlBRFU7Y0FFbkIsU0FBQSxFQUFXO2dCQUNUO2tCQUFFLE9BQUEsRUFBUyxtQkFBWDtrQkFBZ0MsU0FBQSxFQUFXLDhCQUEzQztpQkFEUyxFQUVUO2tCQUFFLE9BQUEsRUFBUyxtQkFBWDtrQkFBZ0MsU0FBQSxFQUFXLHNCQUEzQztpQkFGUyxFQUdUO2tCQUFFLE9BQUEsRUFBUyx1QkFBWDtrQkFBb0MsU0FBQSxFQUFXLHNCQUEvQztpQkFIUyxFQUlUO2tCQUFFLE9BQUEsRUFBUyxlQUFYO2tCQUE0QixTQUFBLEVBQVcsMEJBQXZDO2lCQUpTLEVBS1Q7a0JBQUUsT0FBQSxFQUFTLGNBQVg7a0JBQTJCLFNBQUEsRUFBVyx5QkFBdEM7aUJBTFM7ZUFGUTthQUFEO1dBRHdCO1NBQXJCLENBQXpCO01BNUNtQixDQUFELENBd0RqQixDQUFDLElBeERnQixDQXdEWCxJQXhEVyxDQUFwQjtJQWZTLENBM0hYO0lBcU1BLFVBQUEsRUFBWSxTQUFDLE9BQUQ7QUFDVixVQUFBO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUdiLElBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBWSxjQUFaLENBQUEsSUFBK0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsQ0FBbEM7UUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCxrQkFBM0QsRUFERjs7TUFJQSxJQUFHLG9CQUFIO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7UUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBRmI7O01BSUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxrQkFBWjtNQUN0QixXQUFBLEdBQWMsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQWxCO01BR2QsSUFBSSx3QkFBSjtRQUNFLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsV0FBQSxDQUFBO1FBQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUFBLEVBRkY7O01BR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7TUFHQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7TUFDeEIsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixtQkFBeEI7TUFDVixJQUFBLEdBQU8sQ0FBQyxXQUFXLENBQUMsV0FBYixFQUEwQixXQUFXLENBQUMsV0FBdEMsRUFBbUQsbUJBQW5EO01BQ1AsU0FBQSxHQUFZO01BQ1osTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO0FBQ1AsY0FBQTtVQUFBLFNBQUEsR0FBWTtVQUNaLFlBQUEsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQVg7VUFDZixLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxPQUFELEdBQVc7O2dCQUNDLENBQUUsSUFBZCxDQUFBOztpQkFDQSxLQUFDLENBQUEsaUJBQUQsQ0FBbUIsT0FBbkIsRUFBNEIsWUFBNUI7UUFOTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFPVCxNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7aUJBQ1AsU0FBQSxHQUFZO1FBREw7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRVQsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ0wsY0FBQTs7Z0JBQVksQ0FBRSxJQUFkLENBQUE7O1VBRUEsSUFBRyxJQUFBLEtBQVEsQ0FBWDtZQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksK0JBQUEsR0FBa0MsSUFBOUM7bUJBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBRkY7O1FBSEs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2FBTVAsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLG1CQUFBLENBQW9CO1FBQUMsU0FBQSxPQUFEO1FBQVUsTUFBQSxJQUFWO1FBQWdCLFFBQUEsTUFBaEI7UUFBd0IsUUFBQSxNQUF4QjtRQUFnQyxNQUFBLElBQWhDO09BQXBCO0lBekNMLENBck1aO0lBa1BBLGlCQUFBLEVBQW1CLFNBQUMsT0FBRCxFQUFVLFlBQVY7QUFDakIsVUFBQTtNQUFBLElBQWMscUJBQWQ7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBO01BQ0EsSUFBRyx1QkFBSDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO1FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUZoQjs7TUFJQSxpQkFBQSxHQUFvQjtNQUNwQixrQkFBQSxHQUFxQjtNQUNyQixJQUFHLElBQUMsQ0FBQSxVQUFELENBQVksaUJBQVosQ0FBQSxLQUFrQyxLQUFyQztRQUNFLGlCQUFBLEdBQW9CLFVBRHRCOztNQUVBLElBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBWSxrQkFBWixDQUFBLEtBQW1DLE9BQXRDO1FBQ0Usa0JBQUEsR0FBcUIsUUFEdkI7O01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQXNCLFlBQXRCLEVBQW9DLGlCQUFwQyxFQUF1RCxrQkFBdkQsRUFBMkUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaLENBQTNFLEVBQXFHLElBQUMsQ0FBQSxVQUFELENBQVksa0JBQVosQ0FBckc7QUFFQSw2REFBOEIsQ0FBRSxlQUFoQztRQUNFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUF6QixDQUFBLENBQUEsQ0FBK0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQUEsQ0FBL0I7TUFERjs7WUFHVyxDQUFFLGlCQUFiLENBQStCLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQVYsQ0FBQSxDQUEvQjs7TUFFQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxVQUFELENBQVksZ0JBQVo7TUFDakIsSUFBRyxjQUFBLEtBQWtCLHVCQUFyQjtRQUNFLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFXLE9BQU8sQ0FBQyxPQUFuQixFQUE0QixPQUFPLENBQUMsT0FBcEMsRUFBNkMsSUFBN0M7ZUFDbEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxhQUFaLENBQUEsRUFGRjtPQUFBLE1BR0ssSUFBRyxjQUFBLEtBQWtCLFVBQXJCO1FBQ0gsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxVQUFBLENBQVcsT0FBTyxDQUFDLE9BQW5CLEVBQTRCLE9BQU8sQ0FBQyxPQUFwQyxFQUE2QyxLQUE3QztlQUNsQixJQUFDLENBQUEsVUFBVSxDQUFDLGFBQVosQ0FBQSxFQUZHOztJQXpCWSxDQWxQbkI7SUFpUkEsdUJBQUEsRUFBeUIsU0FBQTtBQUN2QixVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsT0FBQSxHQUFVO01BR1YsS0FBQSxHQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBZixDQUFBO0FBQ1IsV0FBQSx1Q0FBQTs7UUFDRSxVQUFBLEdBQWEsQ0FBQyxDQUFDLGFBQUYsQ0FBQTtRQUNiLElBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQTRCLFVBQTVCLENBQUg7VUFDRSxJQUFHLE9BQUEsS0FBVyxJQUFkO1lBQ0UsT0FBQSxHQUFVLFdBRFo7V0FBQSxNQUVLLElBQUcsT0FBQSxLQUFXLElBQWQ7WUFDSCxPQUFBLEdBQVU7QUFDVixrQkFGRztXQUhQOztBQUZGO01BVUEsSUFBRyxPQUFBLEtBQVcsSUFBZDtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQTtRQUNWLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUVyQixLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBVCxDQUFpQixPQUFqQjtRQUNBLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFULENBQXNCLE9BQXRCLEVBTEY7O01BTUEsSUFBRyxPQUFBLEtBQVcsSUFBZDtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQTtRQUNWLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUNyQixPQUFPLENBQUMsVUFBUixDQUFtQixPQUFPLENBQUMsVUFBUixDQUFBLENBQW5CO1FBQ0EsY0FBQSxHQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixPQUEzQixDQUFkLENBQUEsR0FBcUQ7UUFDdEUsSUFBRyxLQUFNLENBQUEsY0FBQSxDQUFUO1VBRUUsS0FBTSxDQUFBLGNBQUEsQ0FBZSxDQUFDLE9BQXRCLENBQThCLE9BQTlCO1VBQ0EsS0FBTSxDQUFBLGNBQUEsQ0FBZSxDQUFDLFlBQXRCLENBQW1DLE9BQW5DLEVBSEY7U0FBQSxNQUFBO1VBTUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFmLENBQTJCLE9BQTNCLENBQW1DLENBQUMsVUFBcEMsQ0FBK0M7WUFBQyxLQUFBLEVBQU8sQ0FBQyxPQUFELENBQVI7V0FBL0MsRUFORjtTQUxGOztBQWFBLGFBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0I7UUFBQyxPQUFBLEVBQVMsT0FBVjtRQUFtQixPQUFBLEVBQVMsT0FBNUI7T0FBaEI7SUFuQ2dCLENBalJ6QjtJQXdUQSw0QkFBQSxFQUE4QixTQUFDLFFBQUQ7QUFDNUIsVUFBQTtNQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDZixJQUFHLG9CQUFIO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsSUFBQyxDQUFBLGlCQUFELEdBQXFCO1FBQ3JCLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQTtRQUVSLGNBQUEsR0FBaUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkIsT0FBM0IsQ0FBZCxDQUFBLEdBQXFEO1FBRXRFLFNBQUEsR0FBWSxLQUFNLENBQUEsY0FBQSxDQUFOLElBQXlCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixPQUEzQixDQUFtQyxDQUFDLFVBQXBDLENBQUE7UUFDckMsSUFBRyxPQUFPLENBQUMsT0FBUixDQUFBLENBQUEsS0FBcUIsUUFBeEI7VUFHRSxRQUFBLEdBQVcsS0FIYjs7UUFJQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QixRQUE3QixFQUF1QyxTQUF2QztBQUVqQixlQUFPLGNBQWMsQ0FBQyxJQUFmLENBQW9CLFNBQUMsT0FBRDtBQUN6QixpQkFBTztZQUFDLE9BQUEsRUFBUyxPQUFWO1lBQW1CLE9BQUEsRUFBUyxPQUE1Qjs7UUFEa0IsQ0FBcEIsRUFkVDtPQUFBLE1BQUE7UUFpQkUsaUJBQUEsR0FBb0I7UUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixZQUE5QixFQUE0QztVQUFDLE1BQUEsRUFBUSxpQkFBVDtVQUE0QixXQUFBLEVBQWEsS0FBekM7VUFBZ0QsSUFBQSxFQUFNLE1BQXREO1NBQTVDO0FBQ0EsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixFQW5CVDs7QUFxQkEsYUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtJQXZCcUIsQ0F4VDlCO0lBaVZBLG9CQUFBLEVBQXNCLFNBQUMsT0FBRCxFQUFVLE9BQVY7QUFDcEIsVUFBQTtNQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSO01BQ2pCLGlCQUFBLEdBQW9CLENBQUssSUFBQSxjQUFBLENBQWUsT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFmLENBQUwsQ0FBeUMsQ0FBQyxhQUExQyxDQUFBO01BRXBCLElBQUcsSUFBQyxDQUFBLGlCQUFKO1FBRUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE9BQW5CLENBQTJCLENBQUMsS0FBNUIsQ0FBQTtRQUVBLElBQUcsaUJBQUEsS0FBcUIsSUFBckIsSUFBNkIsaUJBQUEsS0FBcUIsTUFBckQ7VUFDRSxJQUFDLENBQUEsbUJBQW1CLENBQUMsR0FBckIsQ0FBeUIsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUE7bUJBQ2hELE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyxzQkFBcEIsQ0FBMkMsaUJBQTNDO1VBRGdELENBQXpCLENBQXpCLEVBREY7U0FKRjs7TUFRQSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQWYsRUFBd0IsT0FBeEI7TUFHQSxPQUFPLENBQUMsU0FBUixDQUFBO01BQ0EsT0FBTyxDQUFDLFNBQVIsQ0FBQTtNQUVBLFlBQUEsR0FBZSxDQUFDLElBQUMsQ0FBQSxVQUFELENBQVksbUJBQVo7TUFDaEIsV0FBQSxHQUFjO01BQ2QsSUFBRyxPQUFPLENBQUMsYUFBUixDQUFBLENBQUEsSUFBMkIsWUFBOUI7UUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLFlBQTlCLEVBQTRDO1VBQUMsTUFBQSxFQUFRLFdBQVQ7VUFBc0IsV0FBQSxFQUFhLEtBQW5DO1VBQTBDLElBQUEsRUFBTSxNQUFoRDtTQUE1QyxFQURGO09BQUEsTUFFSyxJQUFHLE9BQU8sQ0FBQyxhQUFSLENBQUEsQ0FBQSxJQUEyQixZQUE5QjtRQUNILElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsWUFBOUIsRUFBNEM7VUFBQyxNQUFBLEVBQVEsV0FBVDtVQUFzQixXQUFBLEVBQWEsS0FBbkM7VUFBMEMsSUFBQSxFQUFNLE1BQWhEO1NBQTVDLEVBREc7O01BR0wsaUJBQUEsR0FBb0IsQ0FBSyxJQUFBLGNBQUEsQ0FBZSxPQUFPLENBQUMsU0FBUixDQUFBLENBQWYsQ0FBTCxDQUF5QyxDQUFDLGFBQTFDLENBQUE7TUFDcEIsSUFBRyxpQkFBQSxLQUFxQixFQUFyQixJQUEyQixDQUFDLGlCQUFBLEtBQXFCLGlCQUF0QixDQUEzQixJQUF1RSxPQUFPLENBQUMsWUFBUixDQUFBLENBQUEsS0FBMEIsQ0FBakcsSUFBc0csT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFBLEtBQTBCLENBQWhJLElBQXFJLFlBQXhJO1FBRUUsYUFBQSxHQUFnQjtlQUNoQixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLFlBQTlCLEVBQTRDO1VBQUMsTUFBQSxFQUFRLGFBQVQ7VUFBd0IsV0FBQSxFQUFhLEtBQXJDO1VBQTRDLElBQUEsRUFBTSxNQUFsRDtTQUE1QyxFQUhGOztJQTFCb0IsQ0FqVnRCO0lBZ1hBLGFBQUEsRUFBZSxTQUFDLE9BQUQsRUFBVSxPQUFWO0FBQ2IsVUFBQTtNQUFBLFdBQUEsR0FBYyxPQUFPLENBQUMsT0FBUixDQUFBO01BRWQsSUFBRyxxQkFBQSxJQUFnQixDQUFDLE9BQU8sQ0FBQyxZQUFSLENBQUEsQ0FBQSxLQUEwQixDQUExQixJQUErQixPQUFPLENBQUMsb0JBQVIsQ0FBNkIsQ0FBN0IsQ0FBQSxLQUFtQyxFQUFuRSxDQUFuQjtBQUNFO0FBQUE7YUFBQSw4Q0FBQTs7VUFDRSxJQUFHLFdBQUEsS0FBZSxTQUFTLENBQUMsT0FBVixDQUFBLENBQWYsSUFBc0MsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsV0FBbkIsQ0FBekM7WUFDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFiLENBQUEsQ0FBK0IsQ0FBQSxDQUFBO1lBQzdDLElBQUcscUJBQUEsSUFBZ0IsMEJBQW5CO2NBQ0UsbUJBQUEsR0FBc0IsV0FBVyxDQUFDLFVBQVosQ0FBdUIsV0FBdkI7Y0FDdEIsV0FBQSxHQUFjLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBakIsQ0FBNkIsbUJBQTdCO2NBQ2QsSUFBRyxtQkFBSDtnQkFDRSxPQUFPLENBQUMsU0FBUixDQUFBO2dCQUNBLE9BQU8sQ0FBQyxVQUFSLENBQW1CLFdBQW5CO2dCQUNBLElBQUMsQ0FBQSxVQUFELEdBQWM7QUFDZCxzQkFKRjtlQUFBLE1BQUE7cUNBQUE7ZUFIRjthQUFBLE1BQUE7bUNBQUE7YUFGRjtXQUFBLE1BQUE7aUNBQUE7O0FBREY7dUJBREY7O0lBSGEsQ0FoWGY7SUFpWUEsZ0JBQUEsRUFBa0IsU0FBQyxPQUFEO0FBQ2hCLFVBQUE7TUFBQSxXQUFBLEdBQWM7TUFDZCxXQUFBLEdBQWM7TUFDZCxjQUFBLEdBQWlCLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQUEsR0FBMEI7TUFFM0MsV0FBQSxHQUFjLGNBQUEsR0FBaUI7TUFDL0IsZUFBQSxHQUFzQixJQUFBLElBQUEsQ0FBSyxXQUFMO01BQ3RCLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixPQUFPLENBQUMsT0FBTyxDQUFDLE9BQWhCLENBQUEsQ0FBMUI7TUFFQSxXQUFBLEdBQWMsY0FBQSxHQUFpQjtNQUMvQixlQUFBLEdBQXNCLElBQUEsSUFBQSxDQUFLLFdBQUw7TUFDdEIsZUFBZSxDQUFDLFNBQWhCLENBQTBCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBaEIsQ0FBQSxDQUExQjtNQUVBLFdBQUEsR0FDRTtRQUFBLFdBQUEsRUFBYSxXQUFiO1FBQ0EsV0FBQSxFQUFhLFdBRGI7O0FBR0YsYUFBTztJQWpCUyxDQWpZbEI7SUFxWkEsVUFBQSxFQUFZLFNBQUMsTUFBRDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUI7SUFEVSxDQXJaWjtJQXdaQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUIsRUFBd0MsS0FBeEM7SUFEVSxDQXhaWjtJQTZaQSxlQUFBLEVBQWlCLFNBQUE7YUFDWCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO2VBQ1YsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQXpCLENBQThCLE9BQTlCO01BRFUsQ0FBUjtJQURXLENBN1pqQjtJQWlhQSxnQkFBQSxFQUFrQixTQUFBO2FBQ2hCO1FBQUEsZUFBQSxFQUFpQixJQUFDLENBQUEsZUFBbEI7O0lBRGdCLENBamFsQjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3RvcnksIEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRpZmZWaWV3ID0gcmVxdWlyZSAnLi9kaWZmLXZpZXcnXG5Mb2FkaW5nVmlldyA9IHJlcXVpcmUgJy4vdWkvbG9hZGluZy12aWV3J1xuRm9vdGVyVmlldyA9IHJlcXVpcmUgJy4vdWkvZm9vdGVyLXZpZXcnXG5TeW5jU2Nyb2xsID0gcmVxdWlyZSAnLi9zeW5jLXNjcm9sbCdcbmNvbmZpZ1NjaGVtYSA9IHJlcXVpcmUgJy4vY29uZmlnLXNjaGVtYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwbGl0RGlmZiA9XG4gIGRpZmZWaWV3OiBudWxsXG4gIGNvbmZpZzogY29uZmlnU2NoZW1hXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgZWRpdG9yU3Vic2NyaXB0aW9uczogbnVsbFxuICBpc0VuYWJsZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjFDcmVhdGVkOiBmYWxzZVxuICB3YXNFZGl0b3IyQ3JlYXRlZDogZmFsc2VcbiAgaGFzR2l0UmVwbzogZmFsc2VcbiAgcHJvY2VzczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzID0gW11cblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UsIC50cmVlLXZpZXcgLnNlbGVjdGVkLCAudGFiLnRleHRlZGl0b3InLFxuICAgICAgJ3NwbGl0LWRpZmY6ZW5hYmxlJzogKGUpID0+XG4gICAgICAgIEBkaWZmUGFuZXMoZSlcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBuZXh0RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOnByZXYtZGlmZic6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAcHJldkRpZmYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRpZmZQYW5lcygpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0JzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBjb3B5VG9SaWdodCgpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQGNvcHlUb0xlZnQoKVxuICAgICAgJ3NwbGl0LWRpZmY6ZGlzYWJsZSc6ID0+IEBkaXNhYmxlKClcbiAgICAgICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJzogPT4gQHRvZ2dsZUlnbm9yZVdoaXRlc3BhY2UoKVxuICAgICAgJ3NwbGl0LWRpZmY6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGVcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBzcGxpdCBkaWZmXG4gIHRvZ2dsZTogKCkgLT5cbiAgICBpZiBAaXNFbmFibGVkXG4gICAgICBAZGlzYWJsZSgpXG4gICAgZWxzZVxuICAgICAgQGRpZmZQYW5lcygpXG5cbiAgIyBjYWxsZWQgYnkgXCJEaXNhYmxlXCIgY29tbWFuZFxuICAjIHJlbW92ZXMgZGlmZiBhbmQgc3luYyBzY3JvbGwsIGRpc3Bvc2VzIG9mIHN1YnNjcmlwdGlvbnNcbiAgZGlzYWJsZTogKCkgLT5cbiAgICBAaXNFbmFibGVkID0gZmFsc2VcblxuICAgICMgcmVtb3ZlIGxpc3RlbmVyc1xuICAgIGlmIEBlZGl0b3JTdWJzY3JpcHRpb25zP1xuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIGlmIEB3YXNFZGl0b3IxQ3JlYXRlZFxuICAgICAgICBAZGlmZlZpZXcuY2xlYW5VcEVkaXRvcigxKVxuICAgICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDIpXG4gICAgICBAZGlmZlZpZXcuZGVzdHJveSgpXG4gICAgICBAZGlmZlZpZXcgPSBudWxsXG5cbiAgICAjIHJlbW92ZSB2aWV3c1xuICAgIGlmIEBmb290ZXJWaWV3P1xuICAgICAgQGZvb3RlclZpZXcuZGVzdHJveSgpXG4gICAgICBAZm9vdGVyVmlldyA9IG51bGxcbiAgICBpZiBAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcuZGVzdHJveSgpXG4gICAgICBAbG9hZGluZ1ZpZXcgPSBudWxsXG5cbiAgICBpZiBAc3luY1Njcm9sbD9cbiAgICAgIEBzeW5jU2Nyb2xsLmRpc3Bvc2UoKVxuICAgICAgQHN5bmNTY3JvbGwgPSBudWxsXG5cbiAgICAjIHJlc2V0IGFsbCB2YXJpYWJsZXNcbiAgICBAd2FzRWRpdG9yMUNyZWF0ZWQgPSBmYWxzZVxuICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IGZhbHNlXG4gICAgQGhhc0dpdFJlcG8gPSBmYWxzZVxuXG4gICAgIyBhdXRvIGhpZGUgdHJlZSB2aWV3IHdoaWxlIGRpZmZpbmcgIzgyXG4gICAgaWYgQF9nZXRDb25maWcoJ2hpZGVUcmVlVmlldycpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICd0cmVlLXZpZXc6c2hvdycpXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGUgaWdub3JlIHdoaXRlc3BhY2VcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBpZ25vcmluZyB3aGl0ZXNwYWNlIGFuZCByZWZyZXNoZXMgdGhlIGRpZmZcbiAgdG9nZ2xlSWdub3JlV2hpdGVzcGFjZTogLT5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIEBfc2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJywgIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgQGZvb3RlclZpZXc/LnNldElnbm9yZVdoaXRlc3BhY2UoIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IEBkaWZmVmlldy5uZXh0RGlmZigpXG4gICAgICBAZm9vdGVyVmlldz8uc2hvd1NlbGVjdGlvbkNvdW50KCBzZWxlY3RlZEluZGV4ICsgMSApXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIHByZXZpb3VzIGRpZmZcIiBjb21tYW5kXG4gIHByZXZEaWZmOiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIHNlbGVjdGVkSW5kZXggPSBAZGlmZlZpZXcucHJldkRpZmYoKVxuICAgICAgQGZvb3RlclZpZXc/LnNob3dTZWxlY3Rpb25Db3VudCggc2VsZWN0ZWRJbmRleCArIDEgKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byByaWdodFwiIGNvbW1hbmRcbiAgY29weVRvUmlnaHQ6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgQGRpZmZWaWV3LmNvcHlUb1JpZ2h0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byBsZWZ0XCIgY29tbWFuZFxuICBjb3B5VG9MZWZ0OiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIEBkaWZmVmlldy5jb3B5VG9MZWZ0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IHRoZSBjb21tYW5kcyBlbmFibGUvdG9nZ2xlIHRvIGRvIGluaXRpYWwgZGlmZlxuICAjIHNldHMgdXAgc3Vic2NyaXB0aW9ucyBmb3IgYXV0byBkaWZmIGFuZCBkaXNhYmxpbmcgd2hlbiBhIHBhbmUgaXMgZGVzdHJveWVkXG4gICMgZXZlbnQgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgb2YgYSBmaWxlIHBhdGggdG8gZGlmZiB3aXRoIGN1cnJlbnRcbiAgZGlmZlBhbmVzOiAoZXZlbnQpIC0+XG4gICAgIyBpbiBjYXNlIGVuYWJsZSB3YXMgY2FsbGVkIGFnYWluXG4gICAgQGRpc2FibGUoKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBpZiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYicpXG4gICAgICBmaWxlUGF0aCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQucGF0aFxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZShmaWxlUGF0aClcbiAgICBlbHNlIGlmIGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbGlzdC1pdGVtJykgJiYgZXZlbnQ/LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlJylcbiAgICAgIGZpbGVQYXRoID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRQYXRoKClcbiAgICAgIGVkaXRvcnNQcm9taXNlID0gQF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmUoZmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JRdWlja0RpZmYoKVxuXG4gICAgZWRpdG9yc1Byb21pc2UudGhlbiAoKGVkaXRvcnMpIC0+XG4gICAgICBpZiBlZGl0b3JzID09IG51bGxcbiAgICAgICAgcmV0dXJuXG4gICAgICBAX3NldHVwVmlzaWJsZUVkaXRvcnMoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIpXG4gICAgICBAZGlmZlZpZXcgPSBuZXcgRGlmZlZpZXcoZWRpdG9ycylcblxuICAgICAgIyBhZGQgbGlzdGVuZXJzXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NwbGl0LWRpZmYnLCAoKSA9PlxuICAgICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuXG4gICAgICAjIGFkZCB0aGUgYm90dG9tIFVJIHBhbmVsXG4gICAgICBpZiAhQGZvb3RlclZpZXc/XG4gICAgICAgIEBmb290ZXJWaWV3ID0gbmV3IEZvb3RlclZpZXcoQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKSlcbiAgICAgICAgQGZvb3RlclZpZXcuY3JlYXRlUGFuZWwoKVxuICAgICAgQGZvb3RlclZpZXcuc2hvdygpXG5cbiAgICAgICMgdXBkYXRlIGRpZmYgaWYgdGhlcmUgaXMgbm8gZ2l0IHJlcG8gKG5vIG9uY2hhbmdlIGZpcmVkKVxuICAgICAgaWYgIUBoYXNHaXRSZXBvXG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAgICMgYWRkIGFwcGxpY2F0aW9uIG1lbnUgaXRlbXNcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLm1lbnUuYWRkIFtcbiAgICAgICAge1xuICAgICAgICAgICdsYWJlbCc6ICdQYWNrYWdlcydcbiAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJ1xuICAgICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0lnbm9yZSBXaGl0ZXNwYWNlJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZScgfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gUmlnaHQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb250ZXh0TWVudS5hZGQge1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgICAgJ2xhYmVsJzogJ1NwbGl0IERpZmYnLFxuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIFByZXZpb3VzIERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOnByZXYtZGlmZicgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgXVxuICAgICAgICB9XVxuICAgICAgfVxuICAgICAgKS5iaW5kKHRoaXMpICMgbWFrZSBzdXJlIHRoZSBzY29wZSBpcyBjb3JyZWN0XG5cbiAgIyBjYWxsZWQgYnkgYm90aCBkaWZmUGFuZXMgYW5kIHRoZSBlZGl0b3Igc3Vic2NyaXB0aW9uIHRvIHVwZGF0ZSB0aGUgZGlmZlxuICB1cGRhdGVEaWZmOiAoZWRpdG9ycykgLT5cbiAgICBAaXNFbmFibGVkID0gdHJ1ZVxuXG4gICAgIyBhdXRvIGhpZGUgdHJlZSB2aWV3IHdoaWxlIGRpZmZpbmcgIzgyXG4gICAgaWYgQF9nZXRDb25maWcoJ2hpZGVUcmVlVmlldycpICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmVlLXZpZXcnKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAndHJlZS12aWV3OnRvZ2dsZScpXG5cbiAgICAjIGlmIHRoZXJlIGlzIGEgZGlmZiBiZWluZyBjb21wdXRlZCBpbiB0aGUgYmFja2dyb3VuZCwgY2FuY2VsIGl0XG4gICAgaWYgQHByb2Nlc3M/XG4gICAgICBAcHJvY2Vzcy5raWxsKClcbiAgICAgIEBwcm9jZXNzID0gbnVsbFxuXG4gICAgaXNXaGl0ZXNwYWNlSWdub3JlZCA9IEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJylcbiAgICBlZGl0b3JQYXRocyA9IEBfY3JlYXRlVGVtcEZpbGVzKGVkaXRvcnMpXG5cbiAgICAjIGNyZWF0ZSB0aGUgbG9hZGluZyB2aWV3IGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0XG4gICAgaWYgIUBsb2FkaW5nVmlldz9cbiAgICAgIEBsb2FkaW5nVmlldyA9IG5ldyBMb2FkaW5nVmlldygpXG4gICAgICBAbG9hZGluZ1ZpZXcuY3JlYXRlTW9kYWwoKVxuICAgIEBsb2FkaW5nVmlldy5zaG93KClcblxuICAgICMgLS0tIGtpY2sgb2ZmIGJhY2tncm91bmQgcHJvY2VzcyB0byBjb21wdXRlIGRpZmYgLS0tXG4gICAge0J1ZmZlcmVkTm9kZVByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlIF9fZGlybmFtZSwgXCIuL2NvbXB1dGUtZGlmZi5qc1wiXG4gICAgYXJncyA9IFtlZGl0b3JQYXRocy5lZGl0b3IxUGF0aCwgZWRpdG9yUGF0aHMuZWRpdG9yMlBhdGgsIGlzV2hpdGVzcGFjZUlnbm9yZWRdXG4gICAgdGhlT3V0cHV0ID0gJydcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgdGhlT3V0cHV0ID0gb3V0cHV0XG4gICAgICBjb21wdXRlZERpZmYgPSBKU09OLnBhcnNlKG91dHB1dClcbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG4gICAgICBAbG9hZGluZ1ZpZXc/LmhpZGUoKVxuICAgICAgQF9yZXN1bWVVcGRhdGVEaWZmKGVkaXRvcnMsIGNvbXB1dGVkRGlmZilcbiAgICBzdGRlcnIgPSAoZXJyKSA9PlxuICAgICAgdGhlT3V0cHV0ID0gZXJyXG4gICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcblxuICAgICAgaWYgY29kZSAhPSAwXG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWZmZXJlZE5vZGVQcm9jZXNzIGNvZGUgd2FzICcgKyBjb2RlKVxuICAgICAgICBjb25zb2xlLmxvZyh0aGVPdXRwdXQpXG4gICAgQHByb2Nlc3MgPSBuZXcgQnVmZmVyZWROb2RlUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICMgLS0tIGtpY2sgb2ZmIGJhY2tncm91bmQgcHJvY2VzcyB0byBjb21wdXRlIGRpZmYgLS0tXG5cbiAgIyByZXN1bWVzIGFmdGVyIHRoZSBjb21wdXRlIGRpZmYgcHJvY2VzcyByZXR1cm5zXG4gIF9yZXN1bWVVcGRhdGVEaWZmOiAoZWRpdG9ycywgY29tcHV0ZWREaWZmKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGRpZmZWaWV3P1xuICAgIFxuICAgIEBkaWZmVmlldy5jbGVhckRpZmYoKVxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAgIGxlZnRIaWdobGlnaHRUeXBlID0gJ2FkZGVkJ1xuICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdyZW1vdmVkJ1xuICAgIGlmIEBfZ2V0Q29uZmlnKCdsZWZ0RWRpdG9yQ29sb3InKSA9PSAncmVkJ1xuICAgICAgbGVmdEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCdcbiAgICBpZiBAX2dldENvbmZpZygncmlnaHRFZGl0b3JDb2xvcicpID09ICdncmVlbidcbiAgICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdhZGRlZCdcbiAgICBAZGlmZlZpZXcuZGlzcGxheURpZmYoY29tcHV0ZWREaWZmLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBAX2dldENvbmZpZygnZGlmZldvcmRzJyksIEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJykpXG5cbiAgICB3aGlsZSB3aW5kb3cuc3BsaXREaWZmUmVzb2x2ZXM/Lmxlbmd0aFxuICAgICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzLnBvcCgpKEBkaWZmVmlldy5nZXRNYXJrZXJMYXllcnMoKSlcblxuICAgIEBmb290ZXJWaWV3Py5zZXROdW1EaWZmZXJlbmNlcyhAZGlmZlZpZXcuZ2V0TnVtRGlmZmVyZW5jZXMoKSlcblxuICAgIHNjcm9sbFN5bmNUeXBlID0gQF9nZXRDb25maWcoJ3Njcm9sbFN5bmNUeXBlJylcbiAgICBpZiBzY3JvbGxTeW5jVHlwZSA9PSAnVmVydGljYWwgKyBIb3Jpem9udGFsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgdHJ1ZSlcbiAgICAgIEBzeW5jU2Nyb2xsLnN5bmNQb3NpdGlvbnMoKVxuICAgIGVsc2UgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsJ1xuICAgICAgQHN5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMiwgZmFsc2UpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcblxuICAjIEdldHMgdGhlIGZpcnN0IHR3byB2aXNpYmxlIGVkaXRvcnMgZm91bmQgb3IgY3JlYXRlcyB0aGVtIGFzIG5lZWRlZC5cbiAgIyBSZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB5aWVsZHMgYSB2YWx1ZSBvZiB7ZWRpdG9yMTogVGV4dEVkaXRvciwgZWRpdG9yMjogVGV4dEVkaXRvcn1cbiAgX2dldEVkaXRvcnNGb3JRdWlja0RpZmY6ICgpIC0+XG4gICAgZWRpdG9yMSA9IG51bGxcbiAgICBlZGl0b3IyID0gbnVsbFxuXG4gICAgIyB0cnkgdG8gZmluZCB0aGUgZmlyc3QgdHdvIGVkaXRvcnNcbiAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICBmb3IgcCBpbiBwYW5lc1xuICAgICAgYWN0aXZlSXRlbSA9IHAuZ2V0QWN0aXZlSXRlbSgpXG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoYWN0aXZlSXRlbSlcbiAgICAgICAgaWYgZWRpdG9yMSA9PSBudWxsXG4gICAgICAgICAgZWRpdG9yMSA9IGFjdGl2ZUl0ZW1cbiAgICAgICAgZWxzZSBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgICAgICBlZGl0b3IyID0gYWN0aXZlSXRlbVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAjIGF1dG8gb3BlbiBlZGl0b3IgcGFuZXMgc28gd2UgaGF2ZSB0d28gdG8gZGlmZiB3aXRoXG4gICAgaWYgZWRpdG9yMSA9PSBudWxsXG4gICAgICBlZGl0b3IxID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IHRydWVcbiAgICAgICMgYWRkIGZpcnN0IGVkaXRvciB0byB0aGUgZmlyc3QgcGFuZVxuICAgICAgcGFuZXNbMF0uYWRkSXRlbShlZGl0b3IxKVxuICAgICAgcGFuZXNbMF0uYWN0aXZhdGVJdGVtKGVkaXRvcjEpXG4gICAgaWYgZWRpdG9yMiA9PSBudWxsXG4gICAgICBlZGl0b3IyID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IHRydWVcbiAgICAgIGVkaXRvcjIuc2V0R3JhbW1hcihlZGl0b3IxLmdldEdyYW1tYXIoKSlcbiAgICAgIHJpZ2h0UGFuZUluZGV4ID0gcGFuZXMuaW5kZXhPZihhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKSkgKyAxXG4gICAgICBpZiBwYW5lc1tyaWdodFBhbmVJbmRleF1cbiAgICAgICAgIyBhZGQgc2Vjb25kIGVkaXRvciB0byBleGlzdGluZyBwYW5lIHRvIHRoZSByaWdodCBvZiBmaXJzdCBlZGl0b3JcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFkZEl0ZW0oZWRpdG9yMilcbiAgICAgICAgcGFuZXNbcmlnaHRQYW5lSW5kZXhdLmFjdGl2YXRlSXRlbShlZGl0b3IyKVxuICAgICAgZWxzZVxuICAgICAgICAjIG5vIGV4aXN0aW5nIHBhbmUgc28gc3BsaXQgcmlnaHRcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCh7aXRlbXM6IFtlZGl0b3IyXX0pXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfSlcblxuICAjIEdldHMgdGhlIGFjdGl2ZSBlZGl0b3IgYW5kIG9wZW5zIHRoZSBzcGVjaWZpZWQgZmlsZSB0byB0aGUgcmlnaHQgb2YgaXRcbiAgIyBSZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB5aWVsZHMgYSB2YWx1ZSBvZiB7ZWRpdG9yMTogVGV4dEVkaXRvciwgZWRpdG9yMjogVGV4dEVkaXRvcn1cbiAgX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZTogKGZpbGVQYXRoKSAtPlxuICAgIGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGFjdGl2ZUVkaXRvcj9cbiAgICAgIGVkaXRvcjEgPSBhY3RpdmVFZGl0b3JcbiAgICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IHRydWVcbiAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgIyBnZXQgaW5kZXggb2YgcGFuZSBmb2xsb3dpbmcgYWN0aXZlIGVkaXRvciBwYW5lXG4gICAgICByaWdodFBhbmVJbmRleCA9IHBhbmVzLmluZGV4T2YoYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkpICsgMVxuICAgICAgIyBwYW5lIGlzIGNyZWF0ZWQgaWYgdGhlcmUgaXMgbm90IG9uZSB0byB0aGUgcmlnaHQgb2YgdGhlIGFjdGl2ZSBlZGl0b3JcbiAgICAgIHJpZ2h0UGFuZSA9IHBhbmVzW3JpZ2h0UGFuZUluZGV4XSB8fCBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKS5zcGxpdFJpZ2h0KClcbiAgICAgIGlmIGVkaXRvcjEuZ2V0UGF0aCgpID09IGZpbGVQYXRoXG4gICAgICAgICMgaWYgZGlmZmluZyB3aXRoIGl0c2VsZiwgc2V0IGZpbGVQYXRoIHRvIG51bGwgc28gYW4gZW1wdHkgZWRpdG9yIGlzXG4gICAgICAgICMgb3BlbmVkLCB3aGljaCB3aWxsIGNhdXNlIGEgZ2l0IGRpZmZcbiAgICAgICAgZmlsZVBhdGggPSBudWxsXG4gICAgICBlZGl0b3IyUHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUoZmlsZVBhdGgsIHJpZ2h0UGFuZSlcblxuICAgICAgcmV0dXJuIGVkaXRvcjJQcm9taXNlLnRoZW4gKGVkaXRvcjIpIC0+XG4gICAgICAgIHJldHVybiB7ZWRpdG9yMTogZWRpdG9yMSwgZWRpdG9yMjogZWRpdG9yMn1cbiAgICBlbHNlXG4gICAgICBub0FjdGl2ZUVkaXRvck1zZyA9ICdObyBhY3RpdmUgZmlsZSBmb3VuZCEgKFRyeSBmb2N1c2luZyBhIHRleHQgZWRpdG9yKSdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogbm9BY3RpdmVFZGl0b3JNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcblxuICBfc2V0dXBWaXNpYmxlRWRpdG9yczogKGVkaXRvcjEsIGVkaXRvcjIpIC0+XG4gICAgQnVmZmVyRXh0ZW5kZXIgPSByZXF1aXJlICcuL2J1ZmZlci1leHRlbmRlcidcbiAgICBidWZmZXIxTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMS5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuXG4gICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAjIHdhbnQgdG8gc2Nyb2xsIGEgbmV3bHkgY3JlYXRlZCBlZGl0b3IgdG8gdGhlIGZpcnN0IGVkaXRvcidzIHBvc2l0aW9uXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yMSkuZm9jdXMoKVxuICAgICAgIyBzZXQgdGhlIHByZWZlcnJlZCBsaW5lIGVuZGluZyBiZWZvcmUgaW5zZXJ0aW5nIHRleHQgIzM5XG4gICAgICBpZiBidWZmZXIxTGluZUVuZGluZyA9PSAnXFxuJyB8fCBidWZmZXIxTGluZUVuZGluZyA9PSAnXFxyXFxuJ1xuICAgICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yMi5vbldpbGxJbnNlcnRUZXh0ICgpIC0+XG4gICAgICAgICAgZWRpdG9yMi5nZXRCdWZmZXIoKS5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nKGJ1ZmZlcjFMaW5lRW5kaW5nKVxuXG4gICAgQF9zZXR1cEdpdFJlcG8oZWRpdG9yMSwgZWRpdG9yMilcblxuICAgICMgdW5mb2xkIGFsbCBsaW5lcyBzbyBkaWZmcyBwcm9wZXJseSBhbGlnblxuICAgIGVkaXRvcjEudW5mb2xkQWxsKClcbiAgICBlZGl0b3IyLnVuZm9sZEFsbCgpXG5cbiAgICBzaG91bGROb3RpZnkgPSAhQF9nZXRDb25maWcoJ211dGVOb3RpZmljYXRpb25zJylcbiAgICBzb2Z0V3JhcE1zZyA9ICdXYXJuaW5nOiBTb2Z0IHdyYXAgZW5hYmxlZCEgKExpbmUgZGlmZnMgbWF5IG5vdCBhbGlnbiknXG4gICAgaWYgZWRpdG9yMS5pc1NvZnRXcmFwcGVkKCkgJiYgc2hvdWxkTm90aWZ5XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG4gICAgZWxzZSBpZiBlZGl0b3IyLmlzU29mdFdyYXBwZWQoKSAmJiBzaG91bGROb3RpZnlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogc29mdFdyYXBNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcblxuICAgIGJ1ZmZlcjJMaW5lRW5kaW5nID0gKG5ldyBCdWZmZXJFeHRlbmRlcihlZGl0b3IyLmdldEJ1ZmZlcigpKSkuZ2V0TGluZUVuZGluZygpXG4gICAgaWYgYnVmZmVyMkxpbmVFbmRpbmcgIT0gJycgJiYgKGJ1ZmZlcjFMaW5lRW5kaW5nICE9IGJ1ZmZlcjJMaW5lRW5kaW5nKSAmJiBlZGl0b3IxLmdldExpbmVDb3VudCgpICE9IDEgJiYgZWRpdG9yMi5nZXRMaW5lQ291bnQoKSAhPSAxICYmIHNob3VsZE5vdGlmeVxuICAgICAgIyBwb3Agd2FybmluZyBpZiB0aGUgbGluZSBlbmRpbmdzIGRpZmZlciBhbmQgd2UgaGF2ZW4ndCBkb25lIGFueXRoaW5nIGFib3V0IGl0XG4gICAgICBsaW5lRW5kaW5nTXNnID0gJ1dhcm5pbmc6IExpbmUgZW5kaW5ncyBkaWZmZXIhJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBsaW5lRW5kaW5nTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgX3NldHVwR2l0UmVwbzogKGVkaXRvcjEsIGVkaXRvcjIpIC0+XG4gICAgZWRpdG9yMVBhdGggPSBlZGl0b3IxLmdldFBhdGgoKVxuICAgICMgb25seSBzaG93IGdpdCBjaGFuZ2VzIGlmIHRoZSByaWdodCBlZGl0b3IgaXMgZW1wdHlcbiAgICBpZiBlZGl0b3IxUGF0aD8gJiYgKGVkaXRvcjIuZ2V0TGluZUNvdW50KCkgPT0gMSAmJiBlZGl0b3IyLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApID09ICcnKVxuICAgICAgZm9yIGRpcmVjdG9yeSwgaSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgICBpZiBlZGl0b3IxUGF0aCBpcyBkaXJlY3RvcnkuZ2V0UGF0aCgpIG9yIGRpcmVjdG9yeS5jb250YWlucyhlZGl0b3IxUGF0aClcbiAgICAgICAgICBwcm9qZWN0UmVwbyA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVtpXVxuICAgICAgICAgIGlmIHByb2plY3RSZXBvPyAmJiBwcm9qZWN0UmVwby5yZXBvP1xuICAgICAgICAgICAgcmVsYXRpdmVFZGl0b3IxUGF0aCA9IHByb2plY3RSZXBvLnJlbGF0aXZpemUoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgICBnaXRIZWFkVGV4dCA9IHByb2plY3RSZXBvLnJlcG8uZ2V0SGVhZEJsb2IocmVsYXRpdmVFZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGlmIGdpdEhlYWRUZXh0P1xuICAgICAgICAgICAgICBlZGl0b3IyLnNlbGVjdEFsbCgpXG4gICAgICAgICAgICAgIGVkaXRvcjIuaW5zZXJ0VGV4dChnaXRIZWFkVGV4dClcbiAgICAgICAgICAgICAgQGhhc0dpdFJlcG8gPSB0cnVlXG4gICAgICAgICAgICAgIGJyZWFrXG5cbiAgIyBjcmVhdGVzIHRlbXAgZmlsZXMgc28gdGhlIGNvbXB1dGUgZGlmZiBwcm9jZXNzIGNhbiBnZXQgdGhlIHRleHQgZWFzaWx5XG4gIF9jcmVhdGVUZW1wRmlsZXM6IChlZGl0b3JzKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gJydcbiAgICBlZGl0b3IyUGF0aCA9ICcnXG4gICAgdGVtcEZvbGRlclBhdGggPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSArICcvc3BsaXQtZGlmZidcblxuICAgIGVkaXRvcjFQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMSdcbiAgICBlZGl0b3IxVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IxUGF0aClcbiAgICBlZGl0b3IxVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMS5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3IyUGF0aCA9IHRlbXBGb2xkZXJQYXRoICsgJy9zcGxpdC1kaWZmIDInXG4gICAgZWRpdG9yMlRlbXBGaWxlID0gbmV3IEZpbGUoZWRpdG9yMlBhdGgpXG4gICAgZWRpdG9yMlRlbXBGaWxlLndyaXRlU3luYyhlZGl0b3JzLmVkaXRvcjIuZ2V0VGV4dCgpKVxuXG4gICAgZWRpdG9yUGF0aHMgPVxuICAgICAgZWRpdG9yMVBhdGg6IGVkaXRvcjFQYXRoXG4gICAgICBlZGl0b3IyUGF0aDogZWRpdG9yMlBhdGhcblxuICAgIHJldHVybiBlZGl0b3JQYXRoc1xuXG5cbiAgX2dldENvbmZpZzogKGNvbmZpZykgLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiKVxuXG4gIF9zZXRDb25maWc6IChjb25maWcsIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldChcInNwbGl0LWRpZmYuI3tjb25maWd9XCIsIHZhbHVlKVxuXG5cbiAgIyAtLS0gU0VSVklDRSBBUEkgLS0tXG4gIGdldE1hcmtlckxheWVyczogKCkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzLnB1c2gocmVzb2x2ZSlcblxuICBwcm92aWRlU3BsaXREaWZmOiAtPlxuICAgIGdldE1hcmtlckxheWVyczogQGdldE1hcmtlckxheWVyc1xuIl19
