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
      return this.hasGitRepo = false;
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
      var leftHighlightType, ref1, rightHighlightType, scrollSyncType;
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
      if ((ref1 = this.footerView) != null) {
        ref1.setNumDifferences(this.diffView.getNumDifferences());
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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQix5QkFBdEIsRUFBaUM7O0VBQ2pDLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLG1CQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsa0JBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtJQUFBLFFBQUEsRUFBVSxJQUFWO0lBQ0EsTUFBQSxFQUFRLFlBRFI7SUFFQSxhQUFBLEVBQWUsSUFGZjtJQUdBLG1CQUFBLEVBQXFCLElBSHJCO0lBSUEsU0FBQSxFQUFXLEtBSlg7SUFLQSxpQkFBQSxFQUFtQixLQUxuQjtJQU1BLGlCQUFBLEVBQW1CLEtBTm5CO0lBT0EsVUFBQSxFQUFZLEtBUFo7SUFRQSxPQUFBLEVBQVMsSUFSVDtJQVVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUE7YUFFckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQix1REFBbEIsRUFDakI7UUFBQSxtQkFBQSxFQUFxQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7WUFDbkIsS0FBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYO21CQUNBLENBQUMsQ0FB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bVhBLGdCQUFBLEVBQWtCLFNBQUMsT0FBRDtBQUNoQixVQUFBO01BQUEsV0FBQSxHQUFjO01BQ2QsV0FBQSxHQUFjO01BQ2QsY0FBQSxHQUFpQixJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUFBLEdBQTBCO01BRTNDLFdBQUEsR0FBYyxjQUFBLEdBQWlCO01BQy9CLGVBQUEsR0FBc0IsSUFBQSxJQUFBLENBQUssV0FBTDtNQUN0QixlQUFlLENBQUMsU0FBaEIsQ0FBMEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFoQixDQUFBLENBQTFCO01BRUEsV0FBQSxHQUFjLGNBQUEsR0FBaUI7TUFDL0IsZUFBQSxHQUFzQixJQUFBLElBQUEsQ0FBSyxXQUFMO01BQ3RCLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixPQUFPLENBQUMsT0FBTyxDQUFDLE9BQWhCLENBQUEsQ0FBMUI7TUFFQSxXQUFBLEdBQ0U7UUFBQSxXQUFBLEVBQWEsV0FBYjtRQUNBLFdBQUEsRUFBYSxXQURiOztBQUdGLGFBQU87SUFqQlMsQ0FuWGxCO0lBdVlBLFVBQUEsRUFBWSxTQUFDLE1BQUQ7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBQSxHQUFjLE1BQTlCO0lBRFUsQ0F2WVo7SUEwWUEsVUFBQSxFQUFZLFNBQUMsTUFBRCxFQUFTLEtBQVQ7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBQSxHQUFjLE1BQTlCLEVBQXdDLEtBQXhDO0lBRFUsQ0ExWVo7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlyZWN0b3J5LCBGaWxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EaWZmVmlldyA9IHJlcXVpcmUgJy4vZGlmZi12aWV3J1xuTG9hZGluZ1ZpZXcgPSByZXF1aXJlICcuL3VpL2xvYWRpbmctdmlldydcbkZvb3RlclZpZXcgPSByZXF1aXJlICcuL3VpL2Zvb3Rlci12aWV3J1xuU3luY1Njcm9sbCA9IHJlcXVpcmUgJy4vc3luYy1zY3JvbGwnXG5jb25maWdTY2hlbWEgPSByZXF1aXJlICcuL2NvbmZpZy1zY2hlbWEnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPSBTcGxpdERpZmYgPVxuICBkaWZmVmlldzogbnVsbFxuICBjb25maWc6IGNvbmZpZ1NjaGVtYVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGVkaXRvclN1YnNjcmlwdGlvbnM6IG51bGxcbiAgaXNFbmFibGVkOiBmYWxzZVxuICB3YXNFZGl0b3IxQ3JlYXRlZDogZmFsc2VcbiAgd2FzRWRpdG9yMkNyZWF0ZWQ6IGZhbHNlXG4gIGhhc0dpdFJlcG86IGZhbHNlXG4gIHByb2Nlc3M6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZSwgLnRyZWUtdmlldyAuc2VsZWN0ZWQsIC50YWIudGV4dGVkaXRvcicsXG4gICAgICAnc3BsaXQtZGlmZjplbmFibGUnOiAoZSkgPT5cbiAgICAgICAgQGRpZmZQYW5lcyhlKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQG5leHREaWZmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkaWZmUGFuZXMoKVxuICAgICAgJ3NwbGl0LWRpZmY6cHJldi1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBwcmV2RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQGNvcHlUb1JpZ2h0KClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCc6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAY29weVRvTGVmdCgpXG4gICAgICAnc3BsaXQtZGlmZjpkaXNhYmxlJzogPT4gQGRpc2FibGUoKVxuICAgICAgJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnOiA9PiBAdG9nZ2xlSWdub3JlV2hpdGVzcGFjZSgpXG4gICAgICAnc3BsaXQtZGlmZjp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNhYmxlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAjIGNhbGxlZCBieSBcInRvZ2dsZVwiIGNvbW1hbmRcbiAgIyB0b2dnbGVzIHNwbGl0IGRpZmZcbiAgdG9nZ2xlOiAoKSAtPlxuICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgIEBkaXNhYmxlKClcbiAgICBlbHNlXG4gICAgICBAZGlmZlBhbmVzKClcblxuICAjIGNhbGxlZCBieSBcIkRpc2FibGVcIiBjb21tYW5kXG4gICMgcmVtb3ZlcyBkaWZmIGFuZCBzeW5jIHNjcm9sbCwgZGlzcG9zZXMgb2Ygc3Vic2NyaXB0aW9uc1xuICBkaXNhYmxlOiAoKSAtPlxuICAgIEBpc0VuYWJsZWQgPSBmYWxzZVxuXG4gICAgIyByZW1vdmUgbGlzdGVuZXJzXG4gICAgaWYgQGVkaXRvclN1YnNjcmlwdGlvbnM/XG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgaWYgQHdhc0VkaXRvcjFDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDEpXG4gICAgICBpZiBAd2FzRWRpdG9yMkNyZWF0ZWRcbiAgICAgICAgQGRpZmZWaWV3LmNsZWFuVXBFZGl0b3IoMilcbiAgICAgIEBkaWZmVmlldy5kZXN0cm95KClcbiAgICAgIEBkaWZmVmlldyA9IG51bGxcblxuICAgICMgcmVtb3ZlIHZpZXdzXG4gICAgaWYgQGZvb3RlclZpZXc/XG4gICAgICBAZm9vdGVyVmlldy5kZXN0cm95KClcbiAgICAgIEBmb290ZXJWaWV3ID0gbnVsbFxuICAgIGlmIEBsb2FkaW5nVmlldz9cbiAgICAgIEBsb2FkaW5nVmlldy5kZXN0cm95KClcbiAgICAgIEBsb2FkaW5nVmlldyA9IG51bGxcblxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAgICMgcmVzZXQgYWxsIHZhcmlhYmxlc1xuICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gZmFsc2VcbiAgICBAaGFzR2l0UmVwbyA9IGZhbHNlXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGUgaWdub3JlIHdoaXRlc3BhY2VcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBpZ25vcmluZyB3aGl0ZXNwYWNlIGFuZCByZWZyZXNoZXMgdGhlIGRpZmZcbiAgdG9nZ2xlSWdub3JlV2hpdGVzcGFjZTogLT5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIEBfc2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJywgIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgQGZvb3RlclZpZXc/LnNldElnbm9yZVdoaXRlc3BhY2UoIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IEBkaWZmVmlldy5uZXh0RGlmZigpXG4gICAgICBAZm9vdGVyVmlldz8uc2hvd1NlbGVjdGlvbkNvdW50KCBzZWxlY3RlZEluZGV4ICsgMSApXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIHByZXZpb3VzIGRpZmZcIiBjb21tYW5kXG4gIHByZXZEaWZmOiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIHNlbGVjdGVkSW5kZXggPSBAZGlmZlZpZXcucHJldkRpZmYoKVxuICAgICAgQGZvb3RlclZpZXc/LnNob3dTZWxlY3Rpb25Db3VudCggc2VsZWN0ZWRJbmRleCArIDEgKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byByaWdodFwiIGNvbW1hbmRcbiAgY29weVRvUmlnaHQ6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgQGRpZmZWaWV3LmNvcHlUb1JpZ2h0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byBsZWZ0XCIgY29tbWFuZFxuICBjb3B5VG9MZWZ0OiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIEBkaWZmVmlldy5jb3B5VG9MZWZ0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IHRoZSBjb21tYW5kcyBlbmFibGUvdG9nZ2xlIHRvIGRvIGluaXRpYWwgZGlmZlxuICAjIHNldHMgdXAgc3Vic2NyaXB0aW9ucyBmb3IgYXV0byBkaWZmIGFuZCBkaXNhYmxpbmcgd2hlbiBhIHBhbmUgaXMgZGVzdHJveWVkXG4gICMgZXZlbnQgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgb2YgYSBmaWxlIHBhdGggdG8gZGlmZiB3aXRoIGN1cnJlbnRcbiAgZGlmZlBhbmVzOiAoZXZlbnQpIC0+XG4gICAgIyBpbiBjYXNlIGVuYWJsZSB3YXMgY2FsbGVkIGFnYWluXG4gICAgQGRpc2FibGUoKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBpZiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYicpXG4gICAgICBmaWxlUGF0aCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQucGF0aFxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZShmaWxlUGF0aClcbiAgICBlbHNlIGlmIGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbGlzdC1pdGVtJykgJiYgZXZlbnQ/LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlJylcbiAgICAgIGZpbGVQYXRoID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRQYXRoKClcbiAgICAgIGVkaXRvcnNQcm9taXNlID0gQF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmUoZmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JRdWlja0RpZmYoKVxuXG4gICAgZWRpdG9yc1Byb21pc2UudGhlbiAoKGVkaXRvcnMpIC0+XG4gICAgICBpZiBlZGl0b3JzID09IG51bGxcbiAgICAgICAgcmV0dXJuXG4gICAgICBAX3NldHVwVmlzaWJsZUVkaXRvcnMoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIpXG4gICAgICBAZGlmZlZpZXcgPSBuZXcgRGlmZlZpZXcoZWRpdG9ycylcblxuICAgICAgIyBhZGQgbGlzdGVuZXJzXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NwbGl0LWRpZmYnLCAoKSA9PlxuICAgICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuXG4gICAgICAjIGFkZCB0aGUgYm90dG9tIFVJIHBhbmVsXG4gICAgICBpZiAhQGZvb3RlclZpZXc/XG4gICAgICAgIEBmb290ZXJWaWV3ID0gbmV3IEZvb3RlclZpZXcoQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKSlcbiAgICAgICAgQGZvb3RlclZpZXcuY3JlYXRlUGFuZWwoKVxuICAgICAgQGZvb3RlclZpZXcuc2hvdygpXG5cbiAgICAgICMgdXBkYXRlIGRpZmYgaWYgdGhlcmUgaXMgbm8gZ2l0IHJlcG8gKG5vIG9uY2hhbmdlIGZpcmVkKVxuICAgICAgaWYgIUBoYXNHaXRSZXBvXG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAgICMgYWRkIGFwcGxpY2F0aW9uIG1lbnUgaXRlbXNcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLm1lbnUuYWRkIFtcbiAgICAgICAge1xuICAgICAgICAgICdsYWJlbCc6ICdQYWNrYWdlcydcbiAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJ1xuICAgICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0lnbm9yZSBXaGl0ZXNwYWNlJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZScgfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gUmlnaHQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnfVxuICAgICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb250ZXh0TWVudS5hZGQge1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgICAgJ2xhYmVsJzogJ1NwbGl0IERpZmYnLFxuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIFByZXZpb3VzIERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOnByZXYtZGlmZicgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgXVxuICAgICAgICB9XVxuICAgICAgfVxuICAgICAgKS5iaW5kKHRoaXMpICMgbWFrZSBzdXJlIHRoZSBzY29wZSBpcyBjb3JyZWN0XG5cbiAgIyBjYWxsZWQgYnkgYm90aCBkaWZmUGFuZXMgYW5kIHRoZSBlZGl0b3Igc3Vic2NyaXB0aW9uIHRvIHVwZGF0ZSB0aGUgZGlmZlxuICB1cGRhdGVEaWZmOiAoZWRpdG9ycykgLT5cbiAgICBAaXNFbmFibGVkID0gdHJ1ZVxuXG4gICAgIyBpZiB0aGVyZSBpcyBhIGRpZmYgYmVpbmcgY29tcHV0ZWQgaW4gdGhlIGJhY2tncm91bmQsIGNhbmNlbCBpdFxuICAgIGlmIEBwcm9jZXNzP1xuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAcHJvY2VzcyA9IG51bGxcblxuICAgIGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgZWRpdG9yUGF0aHMgPSBAX2NyZWF0ZVRlbXBGaWxlcyhlZGl0b3JzKVxuXG4gICAgIyBjcmVhdGUgdGhlIGxvYWRpbmcgdmlldyBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuICAgIGlmICFAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcgPSBuZXcgTG9hZGluZ1ZpZXcoKVxuICAgICAgQGxvYWRpbmdWaWV3LmNyZWF0ZU1vZGFsKClcbiAgICBAbG9hZGluZ1ZpZXcuc2hvdygpXG5cbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuICAgIHtCdWZmZXJlZE5vZGVQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZSBfX2Rpcm5hbWUsIFwiLi9jb21wdXRlLWRpZmYuanNcIlxuICAgIGFyZ3MgPSBbZWRpdG9yUGF0aHMuZWRpdG9yMVBhdGgsIGVkaXRvclBhdGhzLmVkaXRvcjJQYXRoLCBpc1doaXRlc3BhY2VJZ25vcmVkXVxuICAgIHRoZU91dHB1dCA9ICcnXG4gICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgIHRoZU91dHB1dCA9IG91dHB1dFxuICAgICAgY29tcHV0ZWREaWZmID0gSlNPTi5wYXJzZShvdXRwdXQpXG4gICAgICBAcHJvY2Vzcy5raWxsKClcbiAgICAgIEBwcm9jZXNzID0gbnVsbFxuICAgICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcbiAgICAgIEBfcmVzdW1lVXBkYXRlRGlmZihlZGl0b3JzLCBjb21wdXRlZERpZmYpXG4gICAgc3RkZXJyID0gKGVycikgPT5cbiAgICAgIHRoZU91dHB1dCA9IGVyclxuICAgIGV4aXQgPSAoY29kZSkgPT5cbiAgICAgIEBsb2FkaW5nVmlldz8uaGlkZSgpXG5cbiAgICAgIGlmIGNvZGUgIT0gMFxuICAgICAgICBjb25zb2xlLmxvZygnQnVmZmVyZWROb2RlUHJvY2VzcyBjb2RlIHdhcyAnICsgY29kZSlcbiAgICAgICAgY29uc29sZS5sb2codGhlT3V0cHV0KVxuICAgIEBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkTm9kZVByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuXG4gICMgcmVzdW1lcyBhZnRlciB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgcmV0dXJuc1xuICBfcmVzdW1lVXBkYXRlRGlmZjogKGVkaXRvcnMsIGNvbXB1dGVkRGlmZikgLT5cbiAgICBAZGlmZlZpZXcuY2xlYXJEaWZmKClcbiAgICBpZiBAc3luY1Njcm9sbD9cbiAgICAgIEBzeW5jU2Nyb2xsLmRpc3Bvc2UoKVxuICAgICAgQHN5bmNTY3JvbGwgPSBudWxsXG5cbiAgICBsZWZ0SGlnaGxpZ2h0VHlwZSA9ICdhZGRlZCdcbiAgICByaWdodEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCdcbiAgICBpZiBAX2dldENvbmZpZygnbGVmdEVkaXRvckNvbG9yJykgPT0gJ3JlZCdcbiAgICAgIGxlZnRIaWdobGlnaHRUeXBlID0gJ3JlbW92ZWQnXG4gICAgaWYgQF9nZXRDb25maWcoJ3JpZ2h0RWRpdG9yQ29sb3InKSA9PSAnZ3JlZW4nXG4gICAgICByaWdodEhpZ2hsaWdodFR5cGUgPSAnYWRkZWQnXG4gICAgQGRpZmZWaWV3LmRpc3BsYXlEaWZmKGNvbXB1dGVkRGlmZiwgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgQF9nZXRDb25maWcoJ2RpZmZXb3JkcycpLCBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpKVxuXG4gICAgQGZvb3RlclZpZXc/LnNldE51bURpZmZlcmVuY2VzKEBkaWZmVmlldy5nZXROdW1EaWZmZXJlbmNlcygpKVxuXG4gICAgc2Nyb2xsU3luY1R5cGUgPSBAX2dldENvbmZpZygnc2Nyb2xsU3luY1R5cGUnKVxuICAgIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCArIEhvcml6b250YWwnXG4gICAgICBAc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKGVkaXRvcnMuZWRpdG9yMSwgZWRpdG9ycy5lZGl0b3IyLCB0cnVlKVxuICAgICAgQHN5bmNTY3JvbGwuc3luY1Bvc2l0aW9ucygpXG4gICAgZWxzZSBpZiBzY3JvbGxTeW5jVHlwZSA9PSAnVmVydGljYWwnXG4gICAgICBAc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKGVkaXRvcnMuZWRpdG9yMSwgZWRpdG9ycy5lZGl0b3IyLCBmYWxzZSlcbiAgICAgIEBzeW5jU2Nyb2xsLnN5bmNQb3NpdGlvbnMoKVxuXG4gICMgR2V0cyB0aGUgZmlyc3QgdHdvIHZpc2libGUgZWRpdG9ycyBmb3VuZCBvciBjcmVhdGVzIHRoZW0gYXMgbmVlZGVkLlxuICAjIFJldHVybnMgYSBQcm9taXNlIHdoaWNoIHlpZWxkcyBhIHZhbHVlIG9mIHtlZGl0b3IxOiBUZXh0RWRpdG9yLCBlZGl0b3IyOiBUZXh0RWRpdG9yfVxuICBfZ2V0RWRpdG9yc0ZvclF1aWNrRGlmZjogKCkgLT5cbiAgICBlZGl0b3IxID0gbnVsbFxuICAgIGVkaXRvcjIgPSBudWxsXG5cbiAgICAjIHRyeSB0byBmaW5kIHRoZSBmaXJzdCB0d28gZWRpdG9yc1xuICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgIGZvciBwIGluIHBhbmVzXG4gICAgICBhY3RpdmVJdGVtID0gcC5nZXRBY3RpdmVJdGVtKClcbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihhY3RpdmVJdGVtKVxuICAgICAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgICAgICBlZGl0b3IxID0gYWN0aXZlSXRlbVxuICAgICAgICBlbHNlIGlmIGVkaXRvcjIgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjIgPSBhY3RpdmVJdGVtXG4gICAgICAgICAgYnJlYWtcblxuICAgICMgYXV0byBvcGVuIGVkaXRvciBwYW5lcyBzbyB3ZSBoYXZlIHR3byB0byBkaWZmIHdpdGhcbiAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgIGVkaXRvcjEgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjFDcmVhdGVkID0gdHJ1ZVxuICAgICAgIyBhZGQgZmlyc3QgZWRpdG9yIHRvIHRoZSBmaXJzdCBwYW5lXG4gICAgICBwYW5lc1swXS5hZGRJdGVtKGVkaXRvcjEpXG4gICAgICBwYW5lc1swXS5hY3RpdmF0ZUl0ZW0oZWRpdG9yMSlcbiAgICBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgIGVkaXRvcjIgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gdHJ1ZVxuICAgICAgZWRpdG9yMi5zZXRHcmFtbWFyKGVkaXRvcjEuZ2V0R3JhbW1hcigpKVxuICAgICAgcmlnaHRQYW5lSW5kZXggPSBwYW5lcy5pbmRleE9mKGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpKSArIDFcbiAgICAgIGlmIHBhbmVzW3JpZ2h0UGFuZUluZGV4XVxuICAgICAgICAjIGFkZCBzZWNvbmQgZWRpdG9yIHRvIGV4aXN0aW5nIHBhbmUgdG8gdGhlIHJpZ2h0IG9mIGZpcnN0IGVkaXRvclxuICAgICAgICBwYW5lc1tyaWdodFBhbmVJbmRleF0uYWRkSXRlbShlZGl0b3IyKVxuICAgICAgICBwYW5lc1tyaWdodFBhbmVJbmRleF0uYWN0aXZhdGVJdGVtKGVkaXRvcjIpXG4gICAgICBlbHNlXG4gICAgICAgICMgbm8gZXhpc3RpbmcgcGFuZSBzbyBzcGxpdCByaWdodFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKS5zcGxpdFJpZ2h0KHtpdGVtczogW2VkaXRvcjJdfSlcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe2VkaXRvcjE6IGVkaXRvcjEsIGVkaXRvcjI6IGVkaXRvcjJ9KVxuXG4gICMgR2V0cyB0aGUgYWN0aXZlIGVkaXRvciBhbmQgb3BlbnMgdGhlIHNwZWNpZmllZCBmaWxlIHRvIHRoZSByaWdodCBvZiBpdFxuICAjIFJldHVybnMgYSBQcm9taXNlIHdoaWNoIHlpZWxkcyBhIHZhbHVlIG9mIHtlZGl0b3IxOiBUZXh0RWRpdG9yLCBlZGl0b3IyOiBUZXh0RWRpdG9yfVxuICBfZ2V0RWRpdG9yc0ZvckRpZmZXaXRoQWN0aXZlOiAoZmlsZVBhdGgpIC0+XG4gICAgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgYWN0aXZlRWRpdG9yP1xuICAgICAgZWRpdG9yMSA9IGFjdGl2ZUVkaXRvclxuICAgICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gdHJ1ZVxuICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgICAjIGdldCBpbmRleCBvZiBwYW5lIGZvbGxvd2luZyBhY3RpdmUgZWRpdG9yIHBhbmVcbiAgICAgIHJpZ2h0UGFuZUluZGV4ID0gcGFuZXMuaW5kZXhPZihhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IxKSkgKyAxXG4gICAgICAjIHBhbmUgaXMgY3JlYXRlZCBpZiB0aGVyZSBpcyBub3Qgb25lIHRvIHRoZSByaWdodCBvZiB0aGUgYWN0aXZlIGVkaXRvclxuICAgICAgcmlnaHRQYW5lID0gcGFuZXNbcmlnaHRQYW5lSW5kZXhdIHx8IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpLnNwbGl0UmlnaHQoKVxuICAgICAgaWYgZWRpdG9yMS5nZXRQYXRoKCkgPT0gZmlsZVBhdGhcbiAgICAgICAgIyBpZiBkaWZmaW5nIHdpdGggaXRzZWxmLCBzZXQgZmlsZVBhdGggdG8gbnVsbCBzbyBhbiBlbXB0eSBlZGl0b3IgaXNcbiAgICAgICAgIyBvcGVuZWQsIHdoaWNoIHdpbGwgY2F1c2UgYSBnaXQgZGlmZlxuICAgICAgICBmaWxlUGF0aCA9IG51bGxcbiAgICAgIGVkaXRvcjJQcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZShmaWxlUGF0aCwgcmlnaHRQYW5lKVxuXG4gICAgICByZXR1cm4gZWRpdG9yMlByb21pc2UudGhlbiAoZWRpdG9yMikgLT5cbiAgICAgICAgcmV0dXJuIHtlZGl0b3IxOiBlZGl0b3IxLCBlZGl0b3IyOiBlZGl0b3IyfVxuICAgIGVsc2VcbiAgICAgIG5vQWN0aXZlRWRpdG9yTXNnID0gJ05vIGFjdGl2ZSBmaWxlIGZvdW5kISAoVHJ5IGZvY3VzaW5nIGEgdGV4dCBlZGl0b3IpJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBub0FjdGl2ZUVkaXRvck1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKVxuXG4gIF9zZXR1cFZpc2libGVFZGl0b3JzOiAoZWRpdG9yMSwgZWRpdG9yMikgLT5cbiAgICBCdWZmZXJFeHRlbmRlciA9IHJlcXVpcmUgJy4vYnVmZmVyLWV4dGVuZGVyJ1xuICAgIGJ1ZmZlcjFMaW5lRW5kaW5nID0gKG5ldyBCdWZmZXJFeHRlbmRlcihlZGl0b3IxLmdldEJ1ZmZlcigpKSkuZ2V0TGluZUVuZGluZygpXG5cbiAgICBpZiBAd2FzRWRpdG9yMkNyZWF0ZWRcbiAgICAgICMgd2FudCB0byBzY3JvbGwgYSBuZXdseSBjcmVhdGVkIGVkaXRvciB0byB0aGUgZmlyc3QgZWRpdG9yJ3MgcG9zaXRpb25cbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IxKS5mb2N1cygpXG4gICAgICAjIHNldCB0aGUgcHJlZmVycmVkIGxpbmUgZW5kaW5nIGJlZm9yZSBpbnNlcnRpbmcgdGV4dCAjMzlcbiAgICAgIGlmIGJ1ZmZlcjFMaW5lRW5kaW5nID09ICdcXG4nIHx8IGJ1ZmZlcjFMaW5lRW5kaW5nID09ICdcXHJcXG4nXG4gICAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3IyLm9uV2lsbEluc2VydFRleHQgKCkgLT5cbiAgICAgICAgICBlZGl0b3IyLmdldEJ1ZmZlcigpLnNldFByZWZlcnJlZExpbmVFbmRpbmcoYnVmZmVyMUxpbmVFbmRpbmcpXG5cbiAgICBAX3NldHVwR2l0UmVwbyhlZGl0b3IxLCBlZGl0b3IyKVxuXG4gICAgIyB1bmZvbGQgYWxsIGxpbmVzIHNvIGRpZmZzIHByb3Blcmx5IGFsaWduXG4gICAgZWRpdG9yMS51bmZvbGRBbGwoKVxuICAgIGVkaXRvcjIudW5mb2xkQWxsKClcblxuICAgIHNob3VsZE5vdGlmeSA9ICFAX2dldENvbmZpZygnbXV0ZU5vdGlmaWNhdGlvbnMnKVxuICAgIHNvZnRXcmFwTXNnID0gJ1dhcm5pbmc6IFNvZnQgd3JhcCBlbmFibGVkISAoTGluZSBkaWZmcyBtYXkgbm90IGFsaWduKSdcbiAgICBpZiBlZGl0b3IxLmlzU29mdFdyYXBwZWQoKSAmJiBzaG91bGROb3RpZnlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogc29mdFdyYXBNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcbiAgICBlbHNlIGlmIGVkaXRvcjIuaXNTb2Z0V3JhcHBlZCgpICYmIHNob3VsZE5vdGlmeVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBzb2Z0V3JhcE1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuXG4gICAgYnVmZmVyMkxpbmVFbmRpbmcgPSAobmV3IEJ1ZmZlckV4dGVuZGVyKGVkaXRvcjIuZ2V0QnVmZmVyKCkpKS5nZXRMaW5lRW5kaW5nKClcbiAgICBpZiBidWZmZXIyTGluZUVuZGluZyAhPSAnJyAmJiAoYnVmZmVyMUxpbmVFbmRpbmcgIT0gYnVmZmVyMkxpbmVFbmRpbmcpICYmIGVkaXRvcjEuZ2V0TGluZUNvdW50KCkgIT0gMSAmJiBlZGl0b3IyLmdldExpbmVDb3VudCgpICE9IDEgJiYgc2hvdWxkTm90aWZ5XG4gICAgICAjIHBvcCB3YXJuaW5nIGlmIHRoZSBsaW5lIGVuZGluZ3MgZGlmZmVyIGFuZCB3ZSBoYXZlbid0IGRvbmUgYW55dGhpbmcgYWJvdXQgaXRcbiAgICAgIGxpbmVFbmRpbmdNc2cgPSAnV2FybmluZzogTGluZSBlbmRpbmdzIGRpZmZlciEnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IGxpbmVFbmRpbmdNc2csIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcblxuICBfc2V0dXBHaXRSZXBvOiAoZWRpdG9yMSwgZWRpdG9yMikgLT5cbiAgICBlZGl0b3IxUGF0aCA9IGVkaXRvcjEuZ2V0UGF0aCgpXG4gICAgIyBvbmx5IHNob3cgZ2l0IGNoYW5nZXMgaWYgdGhlIHJpZ2h0IGVkaXRvciBpcyBlbXB0eVxuICAgIGlmIGVkaXRvcjFQYXRoPyAmJiAoZWRpdG9yMi5nZXRMaW5lQ291bnQoKSA9PSAxICYmIGVkaXRvcjIubGluZVRleHRGb3JCdWZmZXJSb3coMCkgPT0gJycpXG4gICAgICBmb3IgZGlyZWN0b3J5LCBpIGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgIGlmIGVkaXRvcjFQYXRoIGlzIGRpcmVjdG9yeS5nZXRQYXRoKCkgb3IgZGlyZWN0b3J5LmNvbnRhaW5zKGVkaXRvcjFQYXRoKVxuICAgICAgICAgIHByb2plY3RSZXBvID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW2ldXG4gICAgICAgICAgaWYgcHJvamVjdFJlcG8/ICYmIHByb2plY3RSZXBvLnJlcG8/XG4gICAgICAgICAgICByZWxhdGl2ZUVkaXRvcjFQYXRoID0gcHJvamVjdFJlcG8ucmVsYXRpdml6ZShlZGl0b3IxUGF0aClcbiAgICAgICAgICAgIGdpdEhlYWRUZXh0ID0gcHJvamVjdFJlcG8ucmVwby5nZXRIZWFkQmxvYihyZWxhdGl2ZUVkaXRvcjFQYXRoKVxuICAgICAgICAgICAgaWYgZ2l0SGVhZFRleHQ/XG4gICAgICAgICAgICAgIGVkaXRvcjIuc2VsZWN0QWxsKClcbiAgICAgICAgICAgICAgZWRpdG9yMi5pbnNlcnRUZXh0KGdpdEhlYWRUZXh0KVxuICAgICAgICAgICAgICBAaGFzR2l0UmVwbyA9IHRydWVcbiAgICAgICAgICAgICAgYnJlYWtcblxuICAjIGNyZWF0ZXMgdGVtcCBmaWxlcyBzbyB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgY2FuIGdldCB0aGUgdGV4dCBlYXNpbHlcbiAgX2NyZWF0ZVRlbXBGaWxlczogKGVkaXRvcnMpIC0+XG4gICAgZWRpdG9yMVBhdGggPSAnJ1xuICAgIGVkaXRvcjJQYXRoID0gJydcbiAgICB0ZW1wRm9sZGVyUGF0aCA9IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpICsgJy9zcGxpdC1kaWZmJ1xuXG4gICAgZWRpdG9yMVBhdGggPSB0ZW1wRm9sZGVyUGF0aCArICcvc3BsaXQtZGlmZiAxJ1xuICAgIGVkaXRvcjFUZW1wRmlsZSA9IG5ldyBGaWxlKGVkaXRvcjFQYXRoKVxuICAgIGVkaXRvcjFUZW1wRmlsZS53cml0ZVN5bmMoZWRpdG9ycy5lZGl0b3IxLmdldFRleHQoKSlcblxuICAgIGVkaXRvcjJQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMidcbiAgICBlZGl0b3IyVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IyUGF0aClcbiAgICBlZGl0b3IyVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMi5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3JQYXRocyA9XG4gICAgICBlZGl0b3IxUGF0aDogZWRpdG9yMVBhdGhcbiAgICAgIGVkaXRvcjJQYXRoOiBlZGl0b3IyUGF0aFxuXG4gICAgcmV0dXJuIGVkaXRvclBhdGhzXG5cblxuICBfZ2V0Q29uZmlnOiAoY29uZmlnKSAtPlxuICAgIGF0b20uY29uZmlnLmdldChcInNwbGl0LWRpZmYuI3tjb25maWd9XCIpXG5cbiAgX3NldENvbmZpZzogKGNvbmZpZywgdmFsdWUpIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwic3BsaXQtZGlmZi4je2NvbmZpZ31cIiwgdmFsdWUpXG4iXX0=
