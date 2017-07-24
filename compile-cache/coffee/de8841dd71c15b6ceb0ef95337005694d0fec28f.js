(function() {
  var CompositeDisposable, DiffViewEditor, Directory, File, LoadingView, SplitDiff, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffViewEditor = require('./build-lines');

  LoadingView = require('./loading-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require("./config-schema");

  path = require('path');

  module.exports = SplitDiff = {
    config: configSchema,
    subscriptions: null,
    diffViewEditor1: null,
    diffViewEditor2: null,
    editorSubscriptions: null,
    isWhitespaceIgnored: false,
    isWordDiffEnabled: true,
    linkedDiffChunks: null,
    diffChunkPointer: 0,
    isFirstChunkSelect: true,
    wasEditor1SoftWrapped: false,
    wasEditor2SoftWrapped: false,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    loadingView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'split-diff:enable': (function(_this) {
          return function() {
            return _this.diffPanes();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            return _this.nextDiff();
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            return _this.prevDiff();
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            return _this.copyChunkToRight();
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            return _this.copyChunkToLeft();
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
      this.disable(false);
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable(true);
      } else {
        return this.diffPanes();
      }
    },
    disable: function(displayMsg) {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffViewEditor1 != null) {
        if (this.wasEditor1SoftWrapped) {
          this.diffViewEditor1.enableSoftWrap();
        }
        if (this.wasEditor1Created) {
          this.diffViewEditor1.cleanUp();
        }
      }
      if (this.diffViewEditor2 != null) {
        if (this.wasEditor2SoftWrapped) {
          this.diffViewEditor2.enableSoftWrap();
        }
        if (this.wasEditor2Created) {
          this.diffViewEditor2.cleanUp();
        }
      }
      this._clearDiff();
      this.diffChunkPointer = 0;
      this.isFirstChunkSelect = true;
      this.wasEditor1SoftWrapped = false;
      this.wasEditor1Created = false;
      this.wasEditor2SoftWrapped = false;
      this.wasEditor2Created = false;
      this.hasGitRepo = false;
      if (displayMsg) {
        return atom.notifications.addInfo('Split Diff Disabled', {
          dismissable: false
        });
      }
    },
    toggleIgnoreWhitespace: function() {
      this._setConfig('ignoreWhitespace', !this.isWhitespaceIgnored);
      return this.isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
    },
    nextDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer++;
        if (this.diffChunkPointer >= this.linkedDiffChunks.length) {
          this.diffChunkPointer = 0;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    prevDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer--;
        if (this.diffChunkPointer < 0) {
          this.diffChunkPointer = this.linkedDiffChunks.length - 1;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    copyChunkToRight: function() {
      var diffChunk, k, len, lineRange, linesToMove, moveText, offset, results;
      linesToMove = this.diffViewEditor1.getCursorDiffLines();
      offset = 0;
      results = [];
      for (k = 0, len = linesToMove.length; k < len; k++) {
        lineRange = linesToMove[k];
        results.push((function() {
          var l, len1, ref1, results1;
          ref1 = this.linkedDiffChunks;
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            diffChunk = ref1[l];
            if (lineRange.start.row === diffChunk.oldLineStart) {
              moveText = this.diffViewEditor1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
              this.diffViewEditor2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], moveText);
              results1.push(offset += (diffChunk.oldLineEnd - diffChunk.oldLineStart) - (diffChunk.newLineEnd - diffChunk.newLineStart));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    },
    copyChunkToLeft: function() {
      var diffChunk, k, len, lineRange, linesToMove, moveText, offset, results;
      linesToMove = this.diffViewEditor2.getCursorDiffLines();
      offset = 0;
      results = [];
      for (k = 0, len = linesToMove.length; k < len; k++) {
        lineRange = linesToMove[k];
        results.push((function() {
          var l, len1, ref1, results1;
          ref1 = this.linkedDiffChunks;
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            diffChunk = ref1[l];
            if (lineRange.start.row === diffChunk.newLineStart) {
              moveText = this.diffViewEditor2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
              this.diffViewEditor1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], moveText);
              results1.push(offset += (diffChunk.newLineEnd - diffChunk.newLineStart) - (diffChunk.oldLineEnd - diffChunk.oldLineStart));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    },
    diffPanes: function() {
      var detailMsg, editors;
      this.disable(false);
      editors = this._getVisibleEditors();
      this.editorSubscriptions = new CompositeDisposable();
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
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
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
      this.editorSubscriptions.add(atom.contextMenu.add({
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
      detailMsg = 'Ignore Whitespace: ' + this.isWhitespaceIgnored;
      detailMsg += '\nShow Word Diff: ' + this.isWordDiffEnabled;
      detailMsg += '\nSync Horizontal Scroll: ' + this._getConfig('syncHorizontalScroll');
      return atom.notifications.addInfo('Split Diff Enabled', {
        detail: detailMsg,
        dismissable: false
      });
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, computedDiff, editorPaths, exit, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      this.isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, this.isWhitespaceIgnored];
      computedDiff = '';
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          theOutput = output;
          return computedDiff = JSON.parse(output);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          _this.loadingView.hide();
          if (code === 0) {
            return _this._resumeUpdateDiff(editors, computedDiff);
          } else {
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
      var syncHorizontalScroll;
      this.linkedDiffChunks = this._evaluateDiffOrder(computedDiff.chunks);
      this._clearDiff();
      this._displayDiff(editors, computedDiff);
      this.isWordDiffEnabled = this._getConfig('diffWords');
      if (this.isWordDiffEnabled) {
        this._highlightWordDiff(this.linkedDiffChunks);
      }
      syncHorizontalScroll = this._getConfig('syncHorizontalScroll');
      this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, syncHorizontalScroll);
      return this.syncScroll.syncPositions();
    },
    _getVisibleEditors: function() {
      var activeItem, editor1, editor2, editors, k, leftPane, len, p, panes, rightPane;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (k = 0, len = panes.length; k < len; k++) {
        p = panes[k];
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
        leftPane = atom.workspace.getActivePane();
        leftPane.addItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPane = atom.workspace.getActivePane().splitRight();
        rightPane.addItem(editor2);
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      if (editor1.isSoftWrapped()) {
        this.wasEditor1SoftWrapped = true;
        editor1.setSoftWrapped(false);
      }
      if (editor2.isSoftWrapped()) {
        this.wasEditor2SoftWrapped = true;
        editor2.setSoftWrapped(false);
      }
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
      }
      editors = {
        editor1: editor1,
        editor2: editor2
      };
      return editors;
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, k, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = k = 0, len = ref1.length; k < len; i = ++k) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.setText(gitHeadText);
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
    _selectDiffs: function(diffChunk) {
      if ((diffChunk != null) && (this.diffViewEditor1 != null) && (this.diffViewEditor2 != null)) {
        this.diffViewEditor1.deselectAllLines();
        this.diffViewEditor2.deselectAllLines();
        if (diffChunk.oldLineStart != null) {
          this.diffViewEditor1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
          this.diffViewEditor2.getEditor().scrollToBufferPosition([diffChunk.oldLineStart, 0]);
        }
        if (diffChunk.newLineStart != null) {
          this.diffViewEditor2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
          return this.diffViewEditor2.getEditor().scrollToBufferPosition([diffChunk.newLineStart, 0]);
        }
      }
    },
    _clearDiff: function() {
      if (this.loadingView != null) {
        this.loadingView.hide();
      }
      if (this.diffViewEditor1 != null) {
        this.diffViewEditor1.destroyMarkers();
        this.diffViewEditor1 = null;
      }
      if (this.diffViewEditor2 != null) {
        this.diffViewEditor2.destroyMarkers();
        this.diffViewEditor2 = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        return this.syncScroll = null;
      }
    },
    _displayDiff: function(editors, computedDiff) {
      var leftColor, rightColor;
      this.diffViewEditor1 = new DiffViewEditor(editors.editor1);
      this.diffViewEditor2 = new DiffViewEditor(editors.editor2);
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      if (leftColor === 'green') {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'added');
      } else {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'removed');
      }
      if (rightColor === 'green') {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'added');
      } else {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'removed');
      }
      this.diffViewEditor1.setLineOffsets(computedDiff.oldLineOffsets);
      return this.diffViewEditor2.setLineOffsets(computedDiff.newLineOffsets);
    },
    _evaluateDiffOrder: function(chunks) {
      var c, diffChunk, diffChunks, k, len, newLineNumber, oldLineNumber, prevChunk;
      oldLineNumber = 0;
      newLineNumber = 0;
      prevChunk = null;
      diffChunks = [];
      for (k = 0, len = chunks.length; k < len; k++) {
        c = chunks[k];
        if (c.added != null) {
          if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber + c.count,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          newLineNumber += c.count;
        } else if (c.removed != null) {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber + c.count
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          oldLineNumber += c.count;
        } else {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          } else if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          }
          prevChunk = null;
          oldLineNumber += c.count;
          newLineNumber += c.count;
        }
      }
      if ((prevChunk != null) && (prevChunk.added != null)) {
        diffChunk = {
          newLineStart: newLineNumber - prevChunk.count,
          newLineEnd: newLineNumber
        };
        diffChunks.push(diffChunk);
      } else if ((prevChunk != null) && (prevChunk.removed != null)) {
        diffChunk = {
          oldLineStart: oldLineNumber - prevChunk.count,
          oldLineEnd: oldLineNumber
        };
        diffChunks.push(diffChunk);
      }
      return diffChunks;
    },
    _highlightWordDiff: function(chunks) {
      var ComputeWordDiff, c, excessLines, i, j, k, l, leftColor, len, lineRange, ref1, results, rightColor, wordDiff;
      ComputeWordDiff = require('./compute-word-diff');
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      results = [];
      for (k = 0, len = chunks.length; k < len; k++) {
        c = chunks[k];
        if ((c.newLineStart != null) && (c.oldLineStart != null)) {
          lineRange = 0;
          excessLines = 0;
          if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
            lineRange = c.newLineEnd - c.newLineStart;
            excessLines = (c.oldLineEnd - c.oldLineStart) - lineRange;
          } else {
            lineRange = c.oldLineEnd - c.oldLineStart;
            excessLines = (c.newLineEnd - c.newLineStart) - lineRange;
          }
          for (i = l = 0, ref1 = lineRange; l < ref1; i = l += 1) {
            wordDiff = ComputeWordDiff.computeWordDiff(this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i), this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i), this.isWhitespaceIgnored);
            if (leftColor === 'green') {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'removed', this.isWhitespaceIgnored);
            }
            if (rightColor === 'green') {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'removed', this.isWhitespaceIgnored);
            }
          }
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (j = m = 0, ref2 = excessLines; m < ref2; j = m += 1) {
              if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
                if (leftColor === 'green') {
                  results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else if ((c.newLineEnd - c.newLineStart) > (c.oldLineEnd - c.oldLineStart)) {
                if (rightColor === 'green') {
                  results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else if (c.newLineStart != null) {
          lineRange = c.newLineEnd - c.newLineStart;
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (i = m = 0, ref2 = lineRange; m < ref2; i = m += 1) {
              if (rightColor === 'green') {
                results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return results1;
          }).call(this));
        } else if (c.oldLineStart != null) {
          lineRange = c.oldLineEnd - c.oldLineStart;
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (i = m = 0, ref2 = lineRange; m < ref2; i = m += 1) {
              if (leftColor === 'green') {
                results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQix5QkFBdEIsRUFBaUM7O0VBQ2pDLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGVBQVI7O0VBQ2pCLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtJQUFBLE1BQUEsRUFBUSxZQUFSO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFFQSxlQUFBLEVBQWlCLElBRmpCO0lBR0EsZUFBQSxFQUFpQixJQUhqQjtJQUlBLG1CQUFBLEVBQXFCLElBSnJCO0lBS0EsbUJBQUEsRUFBcUIsS0FMckI7SUFNQSxpQkFBQSxFQUFtQixJQU5uQjtJQU9BLGdCQUFBLEVBQWtCLElBUGxCO0lBUUEsZ0JBQUEsRUFBa0IsQ0FSbEI7SUFTQSxrQkFBQSxFQUFvQixJQVRwQjtJQVVBLHFCQUFBLEVBQXVCLEtBVnZCO0lBV0EscUJBQUEsRUFBdUIsS0FYdkI7SUFZQSxTQUFBLEVBQVcsS0FaWDtJQWFBLGlCQUFBLEVBQW1CLEtBYm5CO0lBY0EsaUJBQUEsRUFBbUIsS0FkbkI7SUFlQSxVQUFBLEVBQVksS0FmWjtJQWdCQSxPQUFBLEVBQVMsSUFoQlQ7SUFpQkEsV0FBQSxFQUFhLElBakJiO0lBbUJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFB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ZWN0b3J5LCBGaWxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EaWZmVmlld0VkaXRvciA9IHJlcXVpcmUgJy4vYnVpbGQtbGluZXMnXG5Mb2FkaW5nVmlldyA9IHJlcXVpcmUgJy4vbG9hZGluZy12aWV3J1xuU3luY1Njcm9sbCA9IHJlcXVpcmUgJy4vc3luYy1zY3JvbGwnXG5jb25maWdTY2hlbWEgPSByZXF1aXJlIFwiLi9jb25maWctc2NoZW1hXCJcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwbGl0RGlmZiA9XG4gIGNvbmZpZzogY29uZmlnU2NoZW1hXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgZGlmZlZpZXdFZGl0b3IxOiBudWxsXG4gIGRpZmZWaWV3RWRpdG9yMjogbnVsbFxuICBlZGl0b3JTdWJzY3JpcHRpb25zOiBudWxsXG4gIGlzV2hpdGVzcGFjZUlnbm9yZWQ6IGZhbHNlXG4gIGlzV29yZERpZmZFbmFibGVkOiB0cnVlXG4gIGxpbmtlZERpZmZDaHVua3M6IG51bGxcbiAgZGlmZkNodW5rUG9pbnRlcjogMFxuICBpc0ZpcnN0Q2h1bmtTZWxlY3Q6IHRydWVcbiAgd2FzRWRpdG9yMVNvZnRXcmFwcGVkOiBmYWxzZVxuICB3YXNFZGl0b3IyU29mdFdyYXBwZWQ6IGZhbHNlXG4gIGlzRW5hYmxlZDogZmFsc2VcbiAgd2FzRWRpdG9yMUNyZWF0ZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjJDcmVhdGVkOiBmYWxzZVxuICBoYXNHaXRSZXBvOiBmYWxzZVxuICBwcm9jZXNzOiBudWxsXG4gIGxvYWRpbmdWaWV3OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3NwbGl0LWRpZmY6ZW5hYmxlJzogPT4gQGRpZmZQYW5lcygpXG4gICAgICAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnOiA9PiBAbmV4dERpZmYoKVxuICAgICAgJ3NwbGl0LWRpZmY6cHJldi1kaWZmJzogPT4gQHByZXZEaWZmKClcbiAgICAgICdzcGxpdC1kaWZmOmNvcHktdG8tcmlnaHQnOiA9PiBAY29weUNodW5rVG9SaWdodCgpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnOiA9PiBAY29weUNodW5rVG9MZWZ0KClcbiAgICAgICdzcGxpdC1kaWZmOmRpc2FibGUnOiA9PiBAZGlzYWJsZSgpXG4gICAgICAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZSc6ID0+IEB0b2dnbGVJZ25vcmVXaGl0ZXNwYWNlKClcbiAgICAgICdzcGxpdC1kaWZmOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc2FibGUoZmFsc2UpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGVcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBzcGxpdCBkaWZmXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAaXNFbmFibGVkXG4gICAgICBAZGlzYWJsZSh0cnVlKVxuICAgIGVsc2VcbiAgICAgIEBkaWZmUGFuZXMoKVxuXG4gICMgY2FsbGVkIGJ5IFwiRGlzYWJsZVwiIGNvbW1hbmRcbiAgIyByZW1vdmVzIGRpZmYgYW5kIHN5bmMgc2Nyb2xsLCBkaXNwb3NlcyBvZiBzdWJzY3JpcHRpb25zXG4gIGRpc2FibGU6IChkaXNwbGF5TXNnKSAtPlxuICAgIEBpc0VuYWJsZWQgPSBmYWxzZVxuXG4gICAgaWYgQGVkaXRvclN1YnNjcmlwdGlvbnM/XG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgaWYgQGRpZmZWaWV3RWRpdG9yMT9cbiAgICAgIGlmIEB3YXNFZGl0b3IxU29mdFdyYXBwZWRcbiAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5lbmFibGVTb2Z0V3JhcCgpXG4gICAgICBpZiBAd2FzRWRpdG9yMUNyZWF0ZWRcbiAgICAgICAgQGRpZmZWaWV3RWRpdG9yMS5jbGVhblVwKClcblxuICAgIGlmIEBkaWZmVmlld0VkaXRvcjI/XG4gICAgICBpZiBAd2FzRWRpdG9yMlNvZnRXcmFwcGVkXG4gICAgICAgIEBkaWZmVmlld0VkaXRvcjIuZW5hYmxlU29mdFdyYXAoKVxuICAgICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlld0VkaXRvcjIuY2xlYW5VcCgpXG5cbiAgICBAX2NsZWFyRGlmZigpXG5cbiAgICBAZGlmZkNodW5rUG9pbnRlciA9IDBcbiAgICBAaXNGaXJzdENodW5rU2VsZWN0ID0gdHJ1ZVxuICAgIEB3YXNFZGl0b3IxU29mdFdyYXBwZWQgPSBmYWxzZVxuICAgIEB3YXNFZGl0b3IxQ3JlYXRlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJTb2Z0V3JhcHBlZCA9IGZhbHNlXG4gICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gZmFsc2VcbiAgICBAaGFzR2l0UmVwbyA9IGZhbHNlXG5cbiAgICBpZiBkaXNwbGF5TXNnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnU3BsaXQgRGlmZiBEaXNhYmxlZCcsIHtkaXNtaXNzYWJsZTogZmFsc2V9KVxuXG4gICMgY2FsbGVkIGJ5IFwidG9nZ2xlIGlnbm9yZSB3aGl0ZXNwYWNlXCIgY29tbWFuZFxuICAjIHRvZ2dsZXMgaWdub3Jpbmcgd2hpdGVzcGFjZSBhbmQgcmVmcmVzaGVzIHRoZSBkaWZmXG4gIHRvZ2dsZUlnbm9yZVdoaXRlc3BhY2U6IC0+XG4gICAgQF9zZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnLCAhQGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgQGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgIUBpc0ZpcnN0Q2h1bmtTZWxlY3RcbiAgICAgIEBkaWZmQ2h1bmtQb2ludGVyKytcbiAgICAgIGlmIEBkaWZmQ2h1bmtQb2ludGVyID49IEBsaW5rZWREaWZmQ2h1bmtzLmxlbmd0aFxuICAgICAgICBAZGlmZkNodW5rUG9pbnRlciA9IDBcbiAgICBlbHNlXG4gICAgICBAaXNGaXJzdENodW5rU2VsZWN0ID0gZmFsc2VcblxuICAgIEBfc2VsZWN0RGlmZnMoQGxpbmtlZERpZmZDaHVua3NbQGRpZmZDaHVua1BvaW50ZXJdKVxuXG4gICMgY2FsbGVkIGJ5IFwiTW92ZSB0byBwcmV2aW91cyBkaWZmXCIgY29tbWFuZFxuICBwcmV2RGlmZjogLT5cbiAgICBpZiAhQGlzRmlyc3RDaHVua1NlbGVjdFxuICAgICAgQGRpZmZDaHVua1BvaW50ZXItLVxuICAgICAgaWYgQGRpZmZDaHVua1BvaW50ZXIgPCAwXG4gICAgICAgIEBkaWZmQ2h1bmtQb2ludGVyID0gQGxpbmtlZERpZmZDaHVua3MubGVuZ3RoIC0gMVxuICAgIGVsc2VcbiAgICAgIEBpc0ZpcnN0Q2h1bmtTZWxlY3QgPSBmYWxzZVxuXG4gICAgQF9zZWxlY3REaWZmcyhAbGlua2VkRGlmZkNodW5rc1tAZGlmZkNodW5rUG9pbnRlcl0pXG5cbiAgY29weUNodW5rVG9SaWdodDogKCkgLT5cbiAgICBsaW5lc1RvTW92ZSA9IEBkaWZmVmlld0VkaXRvcjEuZ2V0Q3Vyc29yRGlmZkxpbmVzKClcbiAgICBvZmZzZXQgPSAwICMga2VlcCB0cmFjayBvZiBsaW5lIG9mZnNldCAodXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaHVua3MgYmVpbmcgbW92ZWQpXG4gICAgZm9yIGxpbmVSYW5nZSBpbiBsaW5lc1RvTW92ZVxuICAgICAgZm9yIGRpZmZDaHVuayBpbiBAbGlua2VkRGlmZkNodW5rc1xuICAgICAgICBpZiBsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5vbGRMaW5lU3RhcnRcbiAgICAgICAgICBtb3ZlVGV4dCA9IEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kLCAwXV0pXG4gICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQsIDBdLCBbZGlmZkNodW5rLm5ld0xpbmVFbmQgKyBvZmZzZXQsIDBdXSwgbW92ZVRleHQpXG4gICAgICAgICAgIyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5uZXdMaW5lRW5kIC0gZGlmZkNodW5rLm5ld0xpbmVTdGFydClcblxuICBjb3B5Q2h1bmtUb0xlZnQ6ICgpIC0+XG4gICAgbGluZXNUb01vdmUgPSBAZGlmZlZpZXdFZGl0b3IyLmdldEN1cnNvckRpZmZMaW5lcygpXG4gICAgb2Zmc2V0ID0gMCAjIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuICAgIGZvciBsaW5lUmFuZ2UgaW4gbGluZXNUb01vdmVcbiAgICAgIGZvciBkaWZmQ2h1bmsgaW4gQGxpbmtlZERpZmZDaHVua3NcbiAgICAgICAgaWYgbGluZVJhbmdlLnN0YXJ0LnJvdyA9PSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0XG4gICAgICAgICAgbW92ZVRleHQgPSBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIFtkaWZmQ2h1bmsubmV3TGluZUVuZCwgMF1dKVxuICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIG1vdmVUZXh0KVxuICAgICAgICAgICMgb2Zmc2V0IHdpbGwgYmUgdGhlIGFtb3VudCBvZiBsaW5lcyB0byBiZSBjb3BpZWQgbWludXMgdGhlIGFtb3VudCBvZiBsaW5lcyBvdmVyd3JpdHRlblxuICAgICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpXG5cbiAgIyBjYWxsZWQgYnkgdGhlIGNvbW1hbmRzIGVuYWJsZS90b2dnbGUgdG8gZG8gaW5pdGlhbCBkaWZmXG4gICMgc2V0cyB1cCBzdWJzY3JpcHRpb25zIGZvciBhdXRvIGRpZmYgYW5kIGRpc2FibGluZyB3aGVuIGEgcGFuZSBpcyBkZXN0cm95ZWRcbiAgZGlmZlBhbmVzOiAtPlxuICAgICMgaW4gY2FzZSBlbmFibGUgd2FzIGNhbGxlZCBhZ2FpblxuICAgIEBkaXNhYmxlKGZhbHNlKVxuXG4gICAgZWRpdG9ycyA9IEBfZ2V0VmlzaWJsZUVkaXRvcnMoKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZFN0b3BDaGFuZ2luZyA9PlxuICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcbiAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWREZXN0cm95ID0+XG4gICAgICBAZGlzYWJsZSh0cnVlKVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWREZXN0cm95ID0+XG4gICAgICBAZGlzYWJsZSh0cnVlKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdzcGxpdC1kaWZmJywgKCkgPT5cbiAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAjIHVwZGF0ZSBkaWZmIGlmIHRoZXJlIGlzIG5vIGdpdCByZXBvIChubyBvbmNoYW5nZSBmaXJlZClcbiAgICBpZiAhQGhhc0dpdFJlcG9cbiAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAjIGFkZCBhcHBsaWNhdGlvbiBtZW51IGl0ZW1zXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubWVudS5hZGQgW1xuICAgICAge1xuICAgICAgICAnbGFiZWwnOiAnUGFja2FnZXMnXG4gICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJ1xuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIE5leHQgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdNb3ZlIHRvIFByZXZpb3VzIERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOnByZXYtZGlmZicgfVxuICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIExlZnQnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmNvcHktdG8tbGVmdCd9XG4gICAgICAgICAgXVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgICdsYWJlbCc6ICdTcGxpdCBEaWZmJyxcbiAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBOZXh0IERpZmYnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOm5leHQtZGlmZicgfVxuICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBMZWZ0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnfVxuICAgICAgICBdXG4gICAgICB9XVxuICAgIH1cblxuICAgIGRldGFpbE1zZyA9ICdJZ25vcmUgV2hpdGVzcGFjZTogJyArIEBpc1doaXRlc3BhY2VJZ25vcmVkXG4gICAgZGV0YWlsTXNnICs9ICdcXG5TaG93IFdvcmQgRGlmZjogJyArIEBpc1dvcmREaWZmRW5hYmxlZFxuICAgIGRldGFpbE1zZyArPSAnXFxuU3luYyBIb3Jpem9udGFsIFNjcm9sbDogJyArIEBfZ2V0Q29uZmlnKCdzeW5jSG9yaXpvbnRhbFNjcm9sbCcpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1NwbGl0IERpZmYgRW5hYmxlZCcsIHtkZXRhaWw6IGRldGFpbE1zZywgZGlzbWlzc2FibGU6IGZhbHNlfSlcblxuICAjIGNhbGxlZCBieSBib3RoIGRpZmZQYW5lcyBhbmQgdGhlIGVkaXRvciBzdWJzY3JpcHRpb24gdG8gdXBkYXRlIHRoZSBkaWZmXG4gIHVwZGF0ZURpZmY6IChlZGl0b3JzKSAtPlxuICAgIEBpc0VuYWJsZWQgPSB0cnVlXG5cbiAgICBpZiBAcHJvY2Vzcz9cbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG5cbiAgICBAaXNXaGl0ZXNwYWNlSWdub3JlZCA9IEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJylcblxuICAgIGVkaXRvclBhdGhzID0gQF9jcmVhdGVUZW1wRmlsZXMoZWRpdG9ycylcblxuICAgICMgY3JlYXRlIHRoZSBsb2FkaW5nIHZpZXcgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICBpZiAhQGxvYWRpbmdWaWV3P1xuICAgICAgQGxvYWRpbmdWaWV3ID0gbmV3IExvYWRpbmdWaWV3KClcbiAgICAgIEBsb2FkaW5nVmlldy5jcmVhdGVNb2RhbCgpXG4gICAgQGxvYWRpbmdWaWV3LnNob3coKVxuXG4gICAgIyAtLS0ga2ljayBvZmYgYmFja2dyb3VuZCBwcm9jZXNzIHRvIGNvbXB1dGUgZGlmZiAtLS1cbiAgICB7QnVmZmVyZWROb2RlUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuICAgIGNvbW1hbmQgPSBwYXRoLnJlc29sdmUgX19kaXJuYW1lLCBcIi4vY29tcHV0ZS1kaWZmLmpzXCJcbiAgICBhcmdzID0gW2VkaXRvclBhdGhzLmVkaXRvcjFQYXRoLCBlZGl0b3JQYXRocy5lZGl0b3IyUGF0aCwgQGlzV2hpdGVzcGFjZUlnbm9yZWRdXG4gICAgY29tcHV0ZWREaWZmID0gJydcbiAgICB0aGVPdXRwdXQgPSAnJ1xuICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICB0aGVPdXRwdXQgPSBvdXRwdXRcbiAgICAgIGNvbXB1dGVkRGlmZiA9IEpTT04ucGFyc2Uob3V0cHV0KVxuICAgIHN0ZGVyciA9IChlcnIpID0+XG4gICAgICB0aGVPdXRwdXQgPSBlcnJcbiAgICBleGl0ID0gKGNvZGUpID0+XG4gICAgICBAbG9hZGluZ1ZpZXcuaGlkZSgpXG5cbiAgICAgIGlmIGNvZGUgPT0gMFxuICAgICAgICBAX3Jlc3VtZVVwZGF0ZURpZmYoZWRpdG9ycywgY29tcHV0ZWREaWZmKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZygnQnVmZmVyZWROb2RlUHJvY2VzcyBjb2RlIHdhcyAnICsgY29kZSlcbiAgICAgICAgY29uc29sZS5sb2codGhlT3V0cHV0KVxuICAgIEBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkTm9kZVByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcbiAgICAjIC0tLSBraWNrIG9mZiBiYWNrZ3JvdW5kIHByb2Nlc3MgdG8gY29tcHV0ZSBkaWZmIC0tLVxuXG4gICMgcmVzdW1lcyBhZnRlciB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgcmV0dXJuc1xuICBfcmVzdW1lVXBkYXRlRGlmZjogKGVkaXRvcnMsIGNvbXB1dGVkRGlmZikgLT5cbiAgICBAbGlua2VkRGlmZkNodW5rcyA9IEBfZXZhbHVhdGVEaWZmT3JkZXIoY29tcHV0ZWREaWZmLmNodW5rcylcblxuICAgIEBfY2xlYXJEaWZmKClcbiAgICBAX2Rpc3BsYXlEaWZmKGVkaXRvcnMsIGNvbXB1dGVkRGlmZilcblxuICAgIEBpc1dvcmREaWZmRW5hYmxlZCA9IEBfZ2V0Q29uZmlnKCdkaWZmV29yZHMnKVxuICAgIGlmIEBpc1dvcmREaWZmRW5hYmxlZFxuICAgICAgQF9oaWdobGlnaHRXb3JkRGlmZihAbGlua2VkRGlmZkNodW5rcylcblxuICAgIHN5bmNIb3Jpem9udGFsU2Nyb2xsID0gQF9nZXRDb25maWcoJ3N5bmNIb3Jpem9udGFsU2Nyb2xsJylcbiAgICBAc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKGVkaXRvcnMuZWRpdG9yMSwgZWRpdG9ycy5lZGl0b3IyLCBzeW5jSG9yaXpvbnRhbFNjcm9sbClcbiAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcblxuICAjIGdldHMgdHdvIHZpc2libGUgZWRpdG9yc1xuICAjIGF1dG8gb3BlbnMgbmV3IGVkaXRvcnMgc28gdGhlcmUgYXJlIHR3byB0byBkaWZmIHdpdGhcbiAgX2dldFZpc2libGVFZGl0b3JzOiAtPlxuICAgIGVkaXRvcjEgPSBudWxsXG4gICAgZWRpdG9yMiA9IG51bGxcblxuICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgIGZvciBwIGluIHBhbmVzXG4gICAgICBhY3RpdmVJdGVtID0gcC5nZXRBY3RpdmVJdGVtKClcbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihhY3RpdmVJdGVtKVxuICAgICAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgICAgICBlZGl0b3IxID0gYWN0aXZlSXRlbVxuICAgICAgICBlbHNlIGlmIGVkaXRvcjIgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjIgPSBhY3RpdmVJdGVtXG4gICAgICAgICAgYnJlYWtcblxuICAgICMgYXV0byBvcGVuIGVkaXRvciBwYW5lcyBzbyB3ZSBoYXZlIHR3byB0byBkaWZmIHdpdGhcbiAgICBpZiBlZGl0b3IxID09IG51bGxcbiAgICAgIGVkaXRvcjEgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjFDcmVhdGVkID0gdHJ1ZVxuICAgICAgbGVmdFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgIGxlZnRQYW5lLmFkZEl0ZW0oZWRpdG9yMSlcbiAgICBpZiBlZGl0b3IyID09IG51bGxcbiAgICAgIGVkaXRvcjIgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgICAgQHdhc0VkaXRvcjJDcmVhdGVkID0gdHJ1ZVxuICAgICAgZWRpdG9yMi5zZXRHcmFtbWFyKGVkaXRvcjEuZ2V0R3JhbW1hcigpKVxuICAgICAgcmlnaHRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLnNwbGl0UmlnaHQoKVxuICAgICAgcmlnaHRQYW5lLmFkZEl0ZW0oZWRpdG9yMilcblxuICAgIEBfc2V0dXBHaXRSZXBvKGVkaXRvcjEsIGVkaXRvcjIpXG5cbiAgICAjIHVuZm9sZCBhbGwgbGluZXMgc28gZGlmZnMgcHJvcGVybHkgYWxpZ25cbiAgICBlZGl0b3IxLnVuZm9sZEFsbCgpXG4gICAgZWRpdG9yMi51bmZvbGRBbGwoKVxuXG4gICAgIyB0dXJuIG9mZiBzb2Z0IHdyYXAgc2V0dGluZyBmb3IgdGhlc2UgZWRpdG9ycyBzbyBkaWZmcyBwcm9wZXJseSBhbGlnblxuICAgIGlmIGVkaXRvcjEuaXNTb2Z0V3JhcHBlZCgpXG4gICAgICBAd2FzRWRpdG9yMVNvZnRXcmFwcGVkID0gdHJ1ZVxuICAgICAgZWRpdG9yMS5zZXRTb2Z0V3JhcHBlZChmYWxzZSlcbiAgICBpZiBlZGl0b3IyLmlzU29mdFdyYXBwZWQoKVxuICAgICAgQHdhc0VkaXRvcjJTb2Z0V3JhcHBlZCA9IHRydWVcbiAgICAgIGVkaXRvcjIuc2V0U29mdFdyYXBwZWQoZmFsc2UpXG5cbiAgICAjIHdhbnQgdG8gc2Nyb2xsIGEgbmV3bHkgY3JlYXRlZCBlZGl0b3IgdG8gdGhlIGZpcnN0IGVkaXRvcidzIHBvc2l0aW9uXG4gICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yMSkuZm9jdXMoKVxuXG4gICAgZWRpdG9ycyA9XG4gICAgICBlZGl0b3IxOiBlZGl0b3IxXG4gICAgICBlZGl0b3IyOiBlZGl0b3IyXG5cbiAgICByZXR1cm4gZWRpdG9yc1xuXG4gIF9zZXR1cEdpdFJlcG86IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gZWRpdG9yMS5nZXRQYXRoKClcbiAgICAjIG9ubHkgc2hvdyBnaXQgY2hhbmdlcyBpZiB0aGUgcmlnaHQgZWRpdG9yIGlzIGVtcHR5XG4gICAgaWYgZWRpdG9yMVBhdGg/ICYmIChlZGl0b3IyLmdldExpbmVDb3VudCgpID09IDEgJiYgZWRpdG9yMi5saW5lVGV4dEZvckJ1ZmZlclJvdygwKSA9PSAnJylcbiAgICAgIGZvciBkaXJlY3RvcnksIGkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgaWYgZWRpdG9yMVBhdGggaXMgZGlyZWN0b3J5LmdldFBhdGgoKSBvciBkaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgcHJvamVjdFJlcG8gPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICAgICAgICBpZiBwcm9qZWN0UmVwbz8gJiYgcHJvamVjdFJlcG8ucmVwbz9cbiAgICAgICAgICAgIHJlbGF0aXZlRWRpdG9yMVBhdGggPSBwcm9qZWN0UmVwby5yZWxhdGl2aXplKGVkaXRvcjFQYXRoKVxuICAgICAgICAgICAgZ2l0SGVhZFRleHQgPSBwcm9qZWN0UmVwby5yZXBvLmdldEhlYWRCbG9iKHJlbGF0aXZlRWRpdG9yMVBhdGgpXG4gICAgICAgICAgICBpZiBnaXRIZWFkVGV4dD9cbiAgICAgICAgICAgICAgZWRpdG9yMi5zZXRUZXh0KGdpdEhlYWRUZXh0KVxuICAgICAgICAgICAgICBAaGFzR2l0UmVwbyA9IHRydWVcbiAgICAgICAgICAgICAgYnJlYWtcblxuICAjIGNyZWF0ZXMgdGVtcCBmaWxlcyBzbyB0aGUgY29tcHV0ZSBkaWZmIHByb2Nlc3MgY2FuIGdldCB0aGUgdGV4dCBlYXNpbHlcbiAgX2NyZWF0ZVRlbXBGaWxlczogKGVkaXRvcnMpIC0+XG4gICAgZWRpdG9yMVBhdGggPSAnJ1xuICAgIGVkaXRvcjJQYXRoID0gJydcbiAgICB0ZW1wRm9sZGVyUGF0aCA9IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpICsgJy9zcGxpdC1kaWZmJ1xuXG4gICAgZWRpdG9yMVBhdGggPSB0ZW1wRm9sZGVyUGF0aCArICcvc3BsaXQtZGlmZiAxJ1xuICAgIGVkaXRvcjFUZW1wRmlsZSA9IG5ldyBGaWxlKGVkaXRvcjFQYXRoKVxuICAgIGVkaXRvcjFUZW1wRmlsZS53cml0ZVN5bmMoZWRpdG9ycy5lZGl0b3IxLmdldFRleHQoKSlcblxuICAgIGVkaXRvcjJQYXRoID0gdGVtcEZvbGRlclBhdGggKyAnL3NwbGl0LWRpZmYgMidcbiAgICBlZGl0b3IyVGVtcEZpbGUgPSBuZXcgRmlsZShlZGl0b3IyUGF0aClcbiAgICBlZGl0b3IyVGVtcEZpbGUud3JpdGVTeW5jKGVkaXRvcnMuZWRpdG9yMi5nZXRUZXh0KCkpXG5cbiAgICBlZGl0b3JQYXRocyA9XG4gICAgICBlZGl0b3IxUGF0aDogZWRpdG9yMVBhdGhcbiAgICAgIGVkaXRvcjJQYXRoOiBlZGl0b3IyUGF0aFxuXG4gICAgcmV0dXJuIGVkaXRvclBhdGhzXG5cbiAgX3NlbGVjdERpZmZzOiAoZGlmZkNodW5rKSAtPlxuICAgIGlmIGRpZmZDaHVuaz8gJiYgQGRpZmZWaWV3RWRpdG9yMT8gJiYgQGRpZmZWaWV3RWRpdG9yMj9cbiAgICAgIEBkaWZmVmlld0VkaXRvcjEuZGVzZWxlY3RBbGxMaW5lcygpXG4gICAgICBAZGlmZlZpZXdFZGl0b3IyLmRlc2VsZWN0QWxsTGluZXMoKVxuXG4gICAgICBpZiBkaWZmQ2h1bmsub2xkTGluZVN0YXJ0P1xuICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNlbGVjdExpbmVzKGRpZmZDaHVuay5vbGRMaW5lU3RhcnQsIGRpZmZDaHVuay5vbGRMaW5lRW5kKVxuICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdKVxuICAgICAgaWYgZGlmZkNodW5rLm5ld0xpbmVTdGFydD9cbiAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZWxlY3RMaW5lcyhkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCBkaWZmQ2h1bmsubmV3TGluZUVuZClcbiAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5nZXRFZGl0b3IoKS5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCAwXSlcblxuICAjIHJlbW92ZXMgZGlmZiBhbmQgc3luYyBzY3JvbGxcbiAgX2NsZWFyRGlmZjogLT5cbiAgICBpZiBAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcuaGlkZSgpXG5cbiAgICBpZiBAZGlmZlZpZXdFZGl0b3IxP1xuICAgICAgQGRpZmZWaWV3RWRpdG9yMS5kZXN0cm95TWFya2VycygpXG4gICAgICBAZGlmZlZpZXdFZGl0b3IxID0gbnVsbFxuXG4gICAgaWYgQGRpZmZWaWV3RWRpdG9yMj9cbiAgICAgIEBkaWZmVmlld0VkaXRvcjIuZGVzdHJveU1hcmtlcnMoKVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMiA9IG51bGxcblxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAjIGRpc3BsYXlzIHRoZSBkaWZmIHZpc3VhbGx5IGluIHRoZSBlZGl0b3JzXG4gIF9kaXNwbGF5RGlmZjogKGVkaXRvcnMsIGNvbXB1dGVkRGlmZikgLT5cbiAgICBAZGlmZlZpZXdFZGl0b3IxID0gbmV3IERpZmZWaWV3RWRpdG9yKGVkaXRvcnMuZWRpdG9yMSlcbiAgICBAZGlmZlZpZXdFZGl0b3IyID0gbmV3IERpZmZWaWV3RWRpdG9yKGVkaXRvcnMuZWRpdG9yMilcblxuICAgIGxlZnRDb2xvciA9IEBfZ2V0Q29uZmlnKCdsZWZ0RWRpdG9yQ29sb3InKVxuICAgIHJpZ2h0Q29sb3IgPSBAX2dldENvbmZpZygncmlnaHRFZGl0b3JDb2xvcicpXG4gICAgaWYgbGVmdENvbG9yID09ICdncmVlbidcbiAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0TGluZUhpZ2hsaWdodHMoY29tcHV0ZWREaWZmLnJlbW92ZWRMaW5lcywgJ2FkZGVkJylcbiAgICBlbHNlXG4gICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldExpbmVIaWdobGlnaHRzKGNvbXB1dGVkRGlmZi5yZW1vdmVkTGluZXMsICdyZW1vdmVkJylcbiAgICBpZiByaWdodENvbG9yID09ICdncmVlbidcbiAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0TGluZUhpZ2hsaWdodHMoY29tcHV0ZWREaWZmLmFkZGVkTGluZXMsICdhZGRlZCcpXG4gICAgZWxzZVxuICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRMaW5lSGlnaGxpZ2h0cyhjb21wdXRlZERpZmYuYWRkZWRMaW5lcywgJ3JlbW92ZWQnKVxuXG4gICAgQGRpZmZWaWV3RWRpdG9yMS5zZXRMaW5lT2Zmc2V0cyhjb21wdXRlZERpZmYub2xkTGluZU9mZnNldHMpXG4gICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRMaW5lT2Zmc2V0cyhjb21wdXRlZERpZmYubmV3TGluZU9mZnNldHMpXG5cbiAgIyBwdXRzIHRoZSBjaHVua3MgaW50byBvcmRlciBzbyBuZXh0RGlmZiBhbmQgcHJldkRpZmYgYXJlIGluIG9yZGVyXG4gIF9ldmFsdWF0ZURpZmZPcmRlcjogKGNodW5rcykgLT5cbiAgICBvbGRMaW5lTnVtYmVyID0gMFxuICAgIG5ld0xpbmVOdW1iZXIgPSAwXG4gICAgcHJldkNodW5rID0gbnVsbFxuICAgICMgbWFwcGluZyBvZiBjaHVua3MgYmV0d2VlbiB0aGUgdHdvIHBhbmVzXG4gICAgZGlmZkNodW5rcyA9IFtdXG5cbiAgICBmb3IgYyBpbiBjaHVua3NcbiAgICAgIGlmIGMuYWRkZWQ/XG4gICAgICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlciArIGMuY291bnRcbiAgICAgICAgICAgIG9sZExpbmVTdGFydDogb2xkTGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudFxuICAgICAgICAgICAgb2xkTGluZUVuZDogb2xkTGluZU51bWJlclxuICAgICAgICAgIGRpZmZDaHVua3MucHVzaChkaWZmQ2h1bmspXG4gICAgICAgICAgcHJldkNodW5rID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJldkNodW5rID0gY1xuXG4gICAgICAgIG5ld0xpbmVOdW1iZXIgKz0gYy5jb3VudFxuICAgICAgZWxzZSBpZiBjLnJlbW92ZWQ/XG4gICAgICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLmFkZGVkP1xuICAgICAgICAgIGRpZmZDaHVuayA9XG4gICAgICAgICAgICBuZXdMaW5lU3RhcnQ6IG5ld0xpbmVOdW1iZXIgLSBwcmV2Q2h1bmsuY291bnRcbiAgICAgICAgICAgIG5ld0xpbmVFbmQ6IG5ld0xpbmVOdW1iZXJcbiAgICAgICAgICAgIG9sZExpbmVTdGFydDogb2xkTGluZU51bWJlclxuICAgICAgICAgICAgb2xkTGluZUVuZDogb2xkTGluZU51bWJlciArIGMuY291bnRcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuICAgICAgICAgIHByZXZDaHVuayA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByZXZDaHVuayA9IGNcblxuICAgICAgICBvbGRMaW5lTnVtYmVyICs9IGMuY291bnRcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcHJldkNodW5rPyAmJiBwcmV2Q2h1bmsuYWRkZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogKG5ld0xpbmVOdW1iZXIgLSBwcmV2Q2h1bmsuY291bnQpXG4gICAgICAgICAgICBuZXdMaW5lRW5kOiBuZXdMaW5lTnVtYmVyXG4gICAgICAgICAgICBvbGRMaW5lU3RhcnQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICAgIG9sZExpbmVFbmQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuICAgICAgICBlbHNlIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgICAgIG5ld0xpbmVTdGFydDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlclxuICAgICAgICAgICAgb2xkTGluZVN0YXJ0OiAob2xkTGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudClcbiAgICAgICAgICAgIG9sZExpbmVFbmQ6IG9sZExpbmVOdW1iZXJcbiAgICAgICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuXG4gICAgICAgIHByZXZDaHVuayA9IG51bGxcbiAgICAgICAgb2xkTGluZU51bWJlciArPSBjLmNvdW50XG4gICAgICAgIG5ld0xpbmVOdW1iZXIgKz0gYy5jb3VudFxuXG4gICAgIyBhZGQgdGhlIHByZXZDaHVuayBpZiB0aGUgbG9vcCBmaW5pc2hlZFxuICAgIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLmFkZGVkP1xuICAgICAgZGlmZkNodW5rID1cbiAgICAgICAgbmV3TGluZVN0YXJ0OiAobmV3TGluZU51bWJlciAtIHByZXZDaHVuay5jb3VudClcbiAgICAgICAgbmV3TGluZUVuZDogbmV3TGluZU51bWJlclxuICAgICAgZGlmZkNodW5rcy5wdXNoKGRpZmZDaHVuaylcbiAgICBlbHNlIGlmIHByZXZDaHVuaz8gJiYgcHJldkNodW5rLnJlbW92ZWQ/XG4gICAgICBkaWZmQ2h1bmsgPVxuICAgICAgICBvbGRMaW5lU3RhcnQ6IChvbGRMaW5lTnVtYmVyIC0gcHJldkNodW5rLmNvdW50KVxuICAgICAgICBvbGRMaW5lRW5kOiBvbGRMaW5lTnVtYmVyXG4gICAgICBkaWZmQ2h1bmtzLnB1c2goZGlmZkNodW5rKVxuXG4gICAgcmV0dXJuIGRpZmZDaHVua3NcblxuICAjIGhpZ2hsaWdodHMgdGhlIHdvcmQgZGlmZmVyZW5jZXMgYmV0d2VlbiBsaW5lc1xuICBfaGlnaGxpZ2h0V29yZERpZmY6IChjaHVua3MpIC0+XG4gICAgQ29tcHV0ZVdvcmREaWZmID0gcmVxdWlyZSAnLi9jb21wdXRlLXdvcmQtZGlmZidcbiAgICBsZWZ0Q29sb3IgPSBAX2dldENvbmZpZygnbGVmdEVkaXRvckNvbG9yJylcbiAgICByaWdodENvbG9yID0gQF9nZXRDb25maWcoJ3JpZ2h0RWRpdG9yQ29sb3InKVxuICAgIGZvciBjIGluIGNodW5rc1xuICAgICAgIyBtYWtlIHN1cmUgdGhpcyBjaHVuayBtYXRjaGVzIHRvIGFub3RoZXJcbiAgICAgIGlmIGMubmV3TGluZVN0YXJ0PyAmJiBjLm9sZExpbmVTdGFydD9cbiAgICAgICAgbGluZVJhbmdlID0gMFxuICAgICAgICBleGNlc3NMaW5lcyA9IDBcbiAgICAgICAgaWYgKGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0KSA8IChjLm9sZExpbmVFbmQgLSBjLm9sZExpbmVTdGFydClcbiAgICAgICAgICBsaW5lUmFuZ2UgPSBjLm5ld0xpbmVFbmQgLSBjLm5ld0xpbmVTdGFydFxuICAgICAgICAgIGV4Y2Vzc0xpbmVzID0gKGMub2xkTGluZUVuZCAtIGMub2xkTGluZVN0YXJ0KSAtIGxpbmVSYW5nZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGluZVJhbmdlID0gYy5vbGRMaW5lRW5kIC0gYy5vbGRMaW5lU3RhcnRcbiAgICAgICAgICBleGNlc3NMaW5lcyA9IChjLm5ld0xpbmVFbmQgLSBjLm5ld0xpbmVTdGFydCkgLSBsaW5lUmFuZ2VcbiAgICAgICAgIyBmaWd1cmUgb3V0IGRpZmYgYmV0d2VlbiBsaW5lcyBhbmQgaGlnaGxpZ2h0XG4gICAgICAgIGZvciBpIGluIFswIC4uLiBsaW5lUmFuZ2VdIGJ5IDFcbiAgICAgICAgICB3b3JkRGlmZiA9IENvbXB1dGVXb3JkRGlmZi5jb21wdXRlV29yZERpZmYoQGRpZmZWaWV3RWRpdG9yMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhjLm9sZExpbmVTdGFydCArIGkpLCBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMubmV3TGluZVN0YXJ0ICsgaSksIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAgIGlmIGxlZnRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldFdvcmRIaWdobGlnaHRzKGMub2xkTGluZVN0YXJ0ICsgaSwgd29yZERpZmYucmVtb3ZlZFdvcmRzLCAnYWRkZWQnLCBAaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldFdvcmRIaWdobGlnaHRzKGMub2xkTGluZVN0YXJ0ICsgaSwgd29yZERpZmYucmVtb3ZlZFdvcmRzLCAncmVtb3ZlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAgIGlmIHJpZ2h0Q29sb3IgPT0gJ2dyZWVuJ1xuICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRXb3JkSGlnaGxpZ2h0cyhjLm5ld0xpbmVTdGFydCArIGksIHdvcmREaWZmLmFkZGVkV29yZHMsICdhZGRlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0V29yZEhpZ2hsaWdodHMoYy5uZXdMaW5lU3RhcnQgKyBpLCB3b3JkRGlmZi5hZGRlZFdvcmRzLCAncmVtb3ZlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAjIGZ1bGx5IGhpZ2hsaWdodCBleHRyYSBsaW5lc1xuICAgICAgICBmb3IgaiBpbiBbMCAuLi4gZXhjZXNzTGluZXNdIGJ5IDFcbiAgICAgICAgICAjIGNoZWNrIHdoZXRoZXIgZXhjZXNzIGxpbmUgaXMgaW4gZWRpdG9yMSBvciBlZGl0b3IyXG4gICAgICAgICAgaWYgKGMubmV3TGluZUVuZCAtIGMubmV3TGluZVN0YXJ0KSA8IChjLm9sZExpbmVFbmQgLSBjLm9sZExpbmVTdGFydClcbiAgICAgICAgICAgIGlmIGxlZnRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0V29yZEhpZ2hsaWdodHMoYy5vbGRMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMub2xkTGluZVN0YXJ0ICsgbGluZVJhbmdlICsgail9XSwgJ2FkZGVkJywgQGlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0V29yZEhpZ2hsaWdodHMoYy5vbGRMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMub2xkTGluZVN0YXJ0ICsgbGluZVJhbmdlICsgail9XSwgJ3JlbW92ZWQnLCBAaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICBlbHNlIGlmIChjLm5ld0xpbmVFbmQgLSBjLm5ld0xpbmVTdGFydCkgPiAoYy5vbGRMaW5lRW5kIC0gYy5vbGRMaW5lU3RhcnQpXG4gICAgICAgICAgICBpZiByaWdodENvbG9yID09ICdncmVlbidcbiAgICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRXb3JkSGlnaGxpZ2h0cyhjLm5ld0xpbmVTdGFydCArIGxpbmVSYW5nZSArIGosIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5uZXdMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqKX1dLCAnYWRkZWQnLCBAaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQGRpZmZWaWV3RWRpdG9yMi5zZXRXb3JkSGlnaGxpZ2h0cyhjLm5ld0xpbmVTdGFydCArIGxpbmVSYW5nZSArIGosIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IEBkaWZmVmlld0VkaXRvcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coYy5uZXdMaW5lU3RhcnQgKyBsaW5lUmFuZ2UgKyBqKX1dLCAncmVtb3ZlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgZWxzZSBpZiBjLm5ld0xpbmVTdGFydD9cbiAgICAgICAgIyBmdWxseSBoaWdobGlnaHQgY2h1bmtzIHRoYXQgZG9uJ3QgbWF0Y2ggdXAgdG8gYW5vdGhlclxuICAgICAgICBsaW5lUmFuZ2UgPSBjLm5ld0xpbmVFbmQgLSBjLm5ld0xpbmVTdGFydFxuICAgICAgICBmb3IgaSBpbiBbMCAuLi4gbGluZVJhbmdlXSBieSAxXG4gICAgICAgICAgaWYgcmlnaHRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IyLnNldFdvcmRIaWdobGlnaHRzKGMubmV3TGluZVN0YXJ0ICsgaSwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogQGRpZmZWaWV3RWRpdG9yMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhjLm5ld0xpbmVTdGFydCArIGkpfV0sICdhZGRlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjIuc2V0V29yZEhpZ2hsaWdodHMoYy5uZXdMaW5lU3RhcnQgKyBpLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMubmV3TGluZVN0YXJ0ICsgaSl9XSwgJ3JlbW92ZWQnLCBAaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICAgIGVsc2UgaWYgYy5vbGRMaW5lU3RhcnQ/XG4gICAgICAgICMgZnVsbHkgaGlnaGxpZ2h0IGNodW5rcyB0aGF0IGRvbid0IG1hdGNoIHVwIHRvIGFub3RoZXJcbiAgICAgICAgbGluZVJhbmdlID0gYy5vbGRMaW5lRW5kIC0gYy5vbGRMaW5lU3RhcnRcbiAgICAgICAgZm9yIGkgaW4gWzAgLi4uIGxpbmVSYW5nZV0gYnkgMVxuICAgICAgICAgIGlmIGxlZnRDb2xvciA9PSAnZ3JlZW4nXG4gICAgICAgICAgICBAZGlmZlZpZXdFZGl0b3IxLnNldFdvcmRIaWdobGlnaHRzKGMub2xkTGluZVN0YXJ0ICsgaSwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogQGRpZmZWaWV3RWRpdG9yMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhjLm9sZExpbmVTdGFydCArIGkpfV0sICdhZGRlZCcsIEBpc1doaXRlc3BhY2VJZ25vcmVkKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaWZmVmlld0VkaXRvcjEuc2V0V29yZEhpZ2hsaWdodHMoYy5vbGRMaW5lU3RhcnQgKyBpLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBAZGlmZlZpZXdFZGl0b3IxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGMub2xkTGluZVN0YXJ0ICsgaSl9XSwgJ3JlbW92ZWQnLCBAaXNXaGl0ZXNwYWNlSWdub3JlZClcblxuXG4gIF9nZXRDb25maWc6IChjb25maWcpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwic3BsaXQtZGlmZi4je2NvbmZpZ31cIilcblxuICBfc2V0Q29uZmlnOiAoY29uZmlnLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiLCB2YWx1ZSlcbiJdfQ==
