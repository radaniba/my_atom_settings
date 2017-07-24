(function() {
  var $, BufferedProcess, CompositeDisposable, GitRevisionView, SplitDiff, _, fs, path, ref;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  ref = require("atom"), CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  SplitDiff = require('split-diff');

  module.exports = GitRevisionView = (function() {
    function GitRevisionView() {}

    GitRevisionView.FILE_PREFIX = "TimeMachine - ";


    /*
      This code and technique was originally from git-history package,
      see https://github.com/jakesankey/git-history/blob/master/lib/git-history-view.coffee
    
      Changes to permit click and drag in the time plot to travel in time:
      - don't write revision to disk for faster access and to give the user feedback when git'ing
        a rev to show is slow
      - reuse tabs more - don't open a new tab for every rev of the same file
    
      Changes to permit scrolling to same lines in view in the editor the history is for
    
      thank you, @jakesankey!
     */

    GitRevisionView.showRevision = function(editor, revHash, options) {
      var exit, file, fileContents, stdout;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        diff: false
      });
      SplitDiff.disable(false);
      file = editor.getPath();
      fileContents = "";
      stdout = (function(_this) {
        return function(output) {
          return fileContents += output;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this._showRevision(file, editor, revHash, fileContents, options);
          } else {
            return atom.notifications.addError("Could not retrieve revision for " + (path.basename(file)) + " (" + code + ")");
          }
        };
      })(this);
      return this._loadRevision(file, revHash, stdout, exit);
    };

    GitRevisionView._loadRevision = function(file, hash, stdout, exit) {
      var showArgs;
      showArgs = ["show", hash + ":./" + (path.basename(file))];
      return new BufferedProcess({
        command: "git",
        args: showArgs,
        options: {
          cwd: path.dirname(file)
        },
        stdout: stdout,
        exit: exit
      });
    };

    GitRevisionView._getInitialLineNumber = function(editor) {
      var editorEle, lineNumber;
      editorEle = atom.views.getView(editor);
      lineNumber = 0;
      if ((editor != null) && editor !== '') {
        lineNumber = editorEle.getLastVisibleScreenRow();
        return lineNumber - 5;
      }
    };

    GitRevisionView._showRevision = function(file, editor, revHash, fileContents, options) {
      var outputDir, outputFilePath, ref1, tempContent;
      if (options == null) {
        options = {};
      }
      outputDir = (atom.getConfigDirPath()) + "/git-time-machine";
      if (!fs.existsSync(outputDir)) {
        fs.mkdir(outputDir);
      }
      outputFilePath = outputDir + "/" + this.FILE_PREFIX + (path.basename(file));
      if (options.diff) {
        outputFilePath += ".diff";
      }
      tempContent = "Loading..." + ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0);
      return fs.writeFile(outputFilePath, tempContent, (function(_this) {
        return function(error) {
          var promise;
          if (!error) {
            promise = atom.workspace.open(file, {
              split: "left",
              activatePane: false,
              activateItem: true,
              searchAllPanes: false
            });
            return promise.then(function(editor) {
              promise = atom.workspace.open(outputFilePath, {
                split: "right",
                activatePane: false,
                activateItem: true,
                searchAllPanes: false
              });
              return promise.then(function(newTextEditor) {
                return _this._updateNewTextEditor(newTextEditor, editor, revHash, fileContents);
              });
            });
          }
        };
      })(this));
    };

    GitRevisionView._updateNewTextEditor = function(newTextEditor, editor, revHash, fileContents) {
      return _.delay((function(_this) {
        return function() {
          var lineEnding, ref1;
          lineEnding = ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0) || "\n";
          fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
          newTextEditor.buffer.setPreferredLineEnding(lineEnding);
          newTextEditor.setText(fileContents);
          newTextEditor.buffer.cachedDiskContents = fileContents;
          _this._splitDiff(editor, newTextEditor);
          _this._syncScroll(editor, newTextEditor);
          return _this._affixTabTitle(newTextEditor, revHash);
        };
      })(this), 300);
    };

    GitRevisionView._affixTabTitle = function(newTextEditor, revHash) {
      var $el, $tabTitle, titleText;
      $el = $(atom.views.getView(newTextEditor));
      $tabTitle = $el.parents('atom-pane').find('li.tab.active .title');
      titleText = $tabTitle.text();
      if (titleText.indexOf('@') >= 0) {
        titleText = titleText.replace(/\@.*/, "@" + revHash);
      } else {
        titleText += " @" + revHash;
      }
      return $tabTitle.text(titleText);
    };

    GitRevisionView._splitDiff = function(editor, newTextEditor) {
      var editors;
      editors = {
        editor1: newTextEditor,
        editor2: editor
      };
      SplitDiff._setConfig('rightEditorColor', 'green');
      SplitDiff._setConfig('leftEditorColor', 'red');
      SplitDiff._setConfig('diffWords', true);
      SplitDiff._setConfig('ignoreWhitespace', true);
      SplitDiff._setConfig('scrollSyncType', 'Vertical + Horizontal');
      SplitDiff.editorSubscriptions = new CompositeDisposable();
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.diffPanes();
      return SplitDiff.updateDiff(editors);
    };

    GitRevisionView._syncScroll = function(editor, newTextEditor) {
      return _.delay((function(_this) {
        return function() {
          if (newTextEditor.isDestroyed()) {
            return;
          }
          return newTextEditor.scrollToBufferPosition({
            row: _this._getInitialLineNumber(editor),
            column: 0
          });
        };
      })(this), 50);
    };

    return GitRevisionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtcmV2aXNpb24tdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLDZDQUFELEVBQXNCOztFQUNyQixJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFFTixTQUFBLEdBQVksT0FBQSxDQUFRLFlBQVI7O0VBR1osTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBRUosZUFBQyxDQUFBLFdBQUQsR0FBZTs7O0FBQ2Y7Ozs7Ozs7Ozs7Ozs7O0lBY0EsZUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCO0FBQ2IsVUFBQTs7UUFEK0IsVUFBUTs7TUFDdkMsT0FBQSxHQUFVLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxFQUNSO1FBQUEsSUFBQSxFQUFNLEtBQU47T0FEUTtNQUdWLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQWxCO01BRUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7TUFFUCxZQUFBLEdBQWU7TUFDZixNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ0wsWUFBQSxJQUFnQjtRQURYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUVULElBQUEsR0FBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNMLElBQUcsSUFBQSxLQUFRLENBQVg7bUJBQ0UsS0FBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLEVBQTZCLE9BQTdCLEVBQXNDLFlBQXRD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QSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFsQztNQUVBLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUE5QixDQUFrQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQWhCLENBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUM3RCxPQUFBLEdBQVU7aUJBQ1YsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBbEI7UUFGNkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQWxDO01BR0EsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEdBQTlCLENBQWtDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBaEIsQ0FBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzdELE9BQUEsR0FBVTtpQkFDVixTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQjtRQUY2RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBbEM7TUFJQSxTQUFTLENBQUMsU0FBVixDQUFBO2FBQ0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsT0FBckI7SUF4Qlc7O0lBNEJiLGVBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxNQUFELEVBQVMsYUFBVDthQUdaLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ04sSUFBVSxhQUFhLENBQUMsV0FBZCxDQUFBLENBQVY7QUFBQSxtQkFBQTs7aUJBQ0EsYUFBYSxDQUFDLHNCQUFkLENBQXFDO1lBQUMsR0FBQSxFQUFLLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUF2QixDQUFOO1lBQXNDLE1BQUEsRUFBUSxDQUE5QztXQUFyQztRQUZNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBR0UsRUFIRjtJQUhZOzs7OztBQWxLaEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgQnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgXCJhdG9tXCJcbnskfSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5cblNwbGl0RGlmZiA9IHJlcXVpcmUgJ3NwbGl0LWRpZmYnXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2l0UmV2aXNpb25WaWV3XG5cbiAgQEZJTEVfUFJFRklYID0gXCJUaW1lTWFjaGluZSAtIFwiXG4gICMjI1xuICAgIFRoaXMgY29kZSBhbmQgdGVjaG5pcXVlIHdhcyBvcmlnaW5hbGx5IGZyb20gZ2l0LWhpc3RvcnkgcGFja2FnZSxcbiAgICBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2pha2VzYW5rZXkvZ2l0LWhpc3RvcnkvYmxvYi9tYXN0ZXIvbGliL2dpdC1oaXN0b3J5LXZpZXcuY29mZmVlXG5cbiAgICBDaGFuZ2VzIHRvIHBlcm1pdCBjbGljayBhbmQgZHJhZyBpbiB0aGUgdGltZSBwbG90IHRvIHRyYXZlbCBpbiB0aW1lOlxuICAgIC0gZG9uJ3Qgd3JpdGUgcmV2aXNpb24gdG8gZGlzayBmb3IgZmFzdGVyIGFjY2VzcyBhbmQgdG8gZ2l2ZSB0aGUgdXNlciBmZWVkYmFjayB3aGVuIGdpdCdpbmdcbiAgICAgIGEgcmV2IHRvIHNob3cgaXMgc2xvd1xuICAgIC0gcmV1c2UgdGFicyBtb3JlIC0gZG9uJ3Qgb3BlbiBhIG5ldyB0YWIgZm9yIGV2ZXJ5IHJldiBvZiB0aGUgc2FtZSBmaWxlXG5cbiAgICBDaGFuZ2VzIHRvIHBlcm1pdCBzY3JvbGxpbmcgdG8gc2FtZSBsaW5lcyBpbiB2aWV3IGluIHRoZSBlZGl0b3IgdGhlIGhpc3RvcnkgaXMgZm9yXG5cbiAgICB0aGFuayB5b3UsIEBqYWtlc2Fua2V5IVxuXG4gICMjI1xuICBAc2hvd1JldmlzaW9uOiAoZWRpdG9yLCByZXZIYXNoLCBvcHRpb25zPXt9KSAtPlxuICAgIG9wdGlvbnMgPSBfLmRlZmF1bHRzIG9wdGlvbnMsXG4gICAgICBkaWZmOiBmYWxzZVxuXG4gICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG5cbiAgICBmaWxlID0gZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgZmlsZUNvbnRlbnRzID0gXCJcIlxuICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICAgIGZpbGVDb250ZW50cyArPSBvdXRwdXRcbiAgICBleGl0ID0gKGNvZGUpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgQF9zaG93UmV2aXNpb24oZmlsZSwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMsIG9wdGlvbnMpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkNvdWxkIG5vdCByZXRyaWV2ZSByZXZpc2lvbiBmb3IgI3twYXRoLmJhc2VuYW1lKGZpbGUpfSAoI3tjb2RlfSlcIlxuXG4gICAgQF9sb2FkUmV2aXNpb24gZmlsZSwgcmV2SGFzaCwgc3Rkb3V0LCBleGl0XG5cblxuICBAX2xvYWRSZXZpc2lvbjogKGZpbGUsIGhhc2gsIHN0ZG91dCwgZXhpdCkgLT5cbiAgICBzaG93QXJncyA9IFtcbiAgICAgIFwic2hvd1wiLFxuICAgICAgXCIje2hhc2h9Oi4vI3twYXRoLmJhc2VuYW1lKGZpbGUpfVwiXG4gICAgXVxuICAgICMgY29uc29sZS5sb2cgXCJjYWxsaW5nIGdpdFwiXG4gICAgbmV3IEJ1ZmZlcmVkUHJvY2VzcyB7XG4gICAgICBjb21tYW5kOiBcImdpdFwiLFxuICAgICAgYXJnczogc2hvd0FyZ3MsXG4gICAgICBvcHRpb25zOiB7IGN3ZDpwYXRoLmRpcm5hbWUoZmlsZSkgfSxcbiAgICAgIHN0ZG91dCxcbiAgICAgIGV4aXRcbiAgICB9XG5cblxuICBAX2dldEluaXRpYWxMaW5lTnVtYmVyOiAoZWRpdG9yKSAtPlxuICAgIGVkaXRvckVsZSA9IGF0b20udmlld3MuZ2V0VmlldyBlZGl0b3JcbiAgICBsaW5lTnVtYmVyID0gMFxuICAgIGlmIGVkaXRvcj8gJiYgZWRpdG9yICE9ICcnXG4gICAgICBsaW5lTnVtYmVyID0gZWRpdG9yRWxlLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgICMgY29uc29sZS5sb2cgXCJfZ2V0SW5pdGlhbExpbmVOdW1iZXJcIiwgbGluZU51bWJlclxuXG4gICAgICAjIFRPRE86IHdoeSAtNT8gIHRoaXMgaXMgd2hhdCBpdCB0b29rIHRvIGFjdHVhbGx5IHN5bmMgdGhlIGxhc3QgbGluZSBudW1iZXJcbiAgICAgICMgICAgYmV0d2VlbiB0d28gZWRpdG9yc1xuICAgICAgcmV0dXJuIGxpbmVOdW1iZXIgLSA1XG5cblxuICBAX3Nob3dSZXZpc2lvbjogKGZpbGUsIGVkaXRvciwgcmV2SGFzaCwgZmlsZUNvbnRlbnRzLCBvcHRpb25zPXt9KSAtPlxuICAgIG91dHB1dERpciA9IFwiI3thdG9tLmdldENvbmZpZ0RpclBhdGgoKX0vZ2l0LXRpbWUtbWFjaGluZVwiXG4gICAgZnMubWtkaXIgb3V0cHV0RGlyIGlmIG5vdCBmcy5leGlzdHNTeW5jIG91dHB1dERpclxuICAgIG91dHB1dEZpbGVQYXRoID0gXCIje291dHB1dERpcn0vI3tARklMRV9QUkVGSVh9I3twYXRoLmJhc2VuYW1lKGZpbGUpfVwiXG4gICAgb3V0cHV0RmlsZVBhdGggKz0gXCIuZGlmZlwiIGlmIG9wdGlvbnMuZGlmZlxuICAgIHRlbXBDb250ZW50ID0gXCJMb2FkaW5nLi4uXCIgKyBlZGl0b3IuYnVmZmVyPy5saW5lRW5kaW5nRm9yUm93KDApXG4gICAgZnMud3JpdGVGaWxlIG91dHB1dEZpbGVQYXRoLCB0ZW1wQ29udGVudCwgKGVycm9yKSA9PlxuICAgICAgaWYgbm90IGVycm9yXG4gICAgICAgICMgZWRpdG9yIChjdXJyZW50IHJldikgbWF5IGhhdmUgYmVlbiBkZXN0cm95ZWQsIHdvcmtzcGFjZS5vcGVuIHdpbGwgZmluZCBvclxuICAgICAgICAjIHJlb3BlbiBpdFxuICAgICAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbiBmaWxlLFxuICAgICAgICAgIHNwbGl0OiBcImxlZnRcIlxuICAgICAgICAgIGFjdGl2YXRlUGFuZTogZmFsc2VcbiAgICAgICAgICBhY3RpdmF0ZUl0ZW06IHRydWVcbiAgICAgICAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgICAgICAgcHJvbWlzZS50aGVuIChlZGl0b3IpID0+XG4gICAgICAgICAgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4gb3V0cHV0RmlsZVBhdGgsXG4gICAgICAgICAgICBzcGxpdDogXCJyaWdodFwiXG4gICAgICAgICAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlXG4gICAgICAgICAgICBhY3RpdmF0ZUl0ZW06IHRydWVcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiBmYWxzZVxuICAgICAgICAgIHByb21pc2UudGhlbiAobmV3VGV4dEVkaXRvcikgPT5cbiAgICAgICAgICAgIEBfdXBkYXRlTmV3VGV4dEVkaXRvcihuZXdUZXh0RWRpdG9yLCBlZGl0b3IsIHJldkhhc2gsIGZpbGVDb250ZW50cylcblxuXG5cblxuICBAX3VwZGF0ZU5ld1RleHRFZGl0b3I6IChuZXdUZXh0RWRpdG9yLCBlZGl0b3IsIHJldkhhc2gsIGZpbGVDb250ZW50cykgLT5cbiAgICAjIHNsaWdodCBkZWxheSBzbyB0aGUgdXNlciBnZXRzIGZlZWRiYWNrIG9uIHRoZWlyIGFjdGlvblxuICAgIF8uZGVsYXkgPT5cbiAgICAgIGxpbmVFbmRpbmcgPSBlZGl0b3IuYnVmZmVyPy5saW5lRW5kaW5nRm9yUm93KDApIHx8IFwiXFxuXCJcbiAgICAgIGZpbGVDb250ZW50cyA9IGZpbGVDb250ZW50cy5yZXBsYWNlKC8oXFxyXFxufFxcbikvZywgbGluZUVuZGluZylcbiAgICAgIG5ld1RleHRFZGl0b3IuYnVmZmVyLnNldFByZWZlcnJlZExpbmVFbmRpbmcobGluZUVuZGluZylcbiAgICAgIG5ld1RleHRFZGl0b3Iuc2V0VGV4dChmaWxlQ29udGVudHMpXG5cbiAgICAgICMgSEFDSyBBTEVSVDogdGhpcyBpcyBwcm9uZSB0byBldmVudHVhbGx5IGZhaWwuIERvbid0IHNob3cgdXNlciBjaGFuZ2VcbiAgICAgICMgIFwid291bGQgeW91IGxpa2UgdG8gc2F2ZVwiIG1lc3NhZ2UgYmV0d2VlbiBjaGFuZ2VzIHRvIHJldiBiZWluZyB2aWV3ZWRcbiAgICAgIG5ld1RleHRFZGl0b3IuYnVmZmVyLmNhY2hlZERpc2tDb250ZW50cyA9IGZpbGVDb250ZW50c1xuXG4gICAgICBAX3NwbGl0RGlmZihlZGl0b3IsIG5ld1RleHRFZGl0b3IpXG4gICAgICBAX3N5bmNTY3JvbGwoZWRpdG9yLCBuZXdUZXh0RWRpdG9yKVxuICAgICAgQF9hZmZpeFRhYlRpdGxlIG5ld1RleHRFZGl0b3IsIHJldkhhc2hcbiAgICAsIDMwMFxuXG5cbiAgQF9hZmZpeFRhYlRpdGxlOiAobmV3VGV4dEVkaXRvciwgcmV2SGFzaCkgLT5cbiAgICAjIHNwZWFraW5nIG9mIGhhY2tzIHRoaXMgaXMgYWxzbyBoYWNraXNoLCB0aGVyZSBoYXMgdG8gYmUgYSBiZXR0ZXIgd2F5IHRvIGNoYW5nZSB0b1xuICAgICMgdGFiIHRpdGxlIGFuZCB1bmxpbmtpbmcgaXQgZnJvbSB0aGUgZmlsZSBuYW1lXG4gICAgJGVsID0gJChhdG9tLnZpZXdzLmdldFZpZXcobmV3VGV4dEVkaXRvcikpXG4gICAgJHRhYlRpdGxlID0gJGVsLnBhcmVudHMoJ2F0b20tcGFuZScpLmZpbmQoJ2xpLnRhYi5hY3RpdmUgLnRpdGxlJylcbiAgICB0aXRsZVRleHQgPSAkdGFiVGl0bGUudGV4dCgpXG4gICAgaWYgdGl0bGVUZXh0LmluZGV4T2YoJ0AnKSA+PSAwXG4gICAgICB0aXRsZVRleHQgPSB0aXRsZVRleHQucmVwbGFjZSgvXFxALiovLCBcIkAje3Jldkhhc2h9XCIpXG4gICAgZWxzZVxuICAgICAgdGl0bGVUZXh0ICs9IFwiIEAje3Jldkhhc2h9XCJcblxuICAgICR0YWJUaXRsZS50ZXh0KHRpdGxlVGV4dClcblxuXG4gIEBfc3BsaXREaWZmOiAoZWRpdG9yLCBuZXdUZXh0RWRpdG9yKSAtPlxuICAgIGVkaXRvcnMgPVxuICAgICAgZWRpdG9yMTogbmV3VGV4dEVkaXRvciAgICAjIHRoZSBvbGRlciByZXZpc2lvblxuICAgICAgZWRpdG9yMjogZWRpdG9yICAgICAgICAgICAjIGN1cnJlbnQgcmV2XG5cbiAgICBTcGxpdERpZmYuX3NldENvbmZpZyAncmlnaHRFZGl0b3JDb2xvcicsICdncmVlbidcbiAgICBTcGxpdERpZmYuX3NldENvbmZpZyAnbGVmdEVkaXRvckNvbG9yJywgJ3JlZCdcbiAgICBTcGxpdERpZmYuX3NldENvbmZpZyAnZGlmZldvcmRzJywgdHJ1ZVxuICAgIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdpZ25vcmVXaGl0ZXNwYWNlJywgdHJ1ZVxuICAgIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdzY3JvbGxTeW5jVHlwZScsICdWZXJ0aWNhbCArIEhvcml6b250YWwnXG4gICAgXG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZFN0b3BDaGFuZ2luZyA9PlxuICAgICAgU3BsaXREaWZmLnVwZGF0ZURpZmYoZWRpdG9ycykgaWYgZWRpdG9ycz9cbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBTcGxpdERpZmYudXBkYXRlRGlmZihlZGl0b3JzKSBpZiBlZGl0b3JzP1xuICAgIFNwbGl0RGlmZi5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWREZXN0cm95ID0+XG4gICAgICBlZGl0b3JzID0gbnVsbDtcbiAgICAgIFNwbGl0RGlmZi5kaXNhYmxlKGZhbHNlKVxuICAgIFNwbGl0RGlmZi5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWREZXN0cm95ID0+XG4gICAgICBlZGl0b3JzID0gbnVsbDtcbiAgICAgIFNwbGl0RGlmZi5kaXNhYmxlKGZhbHNlKVxuXG4gICAgU3BsaXREaWZmLmRpZmZQYW5lcygpXG4gICAgU3BsaXREaWZmLnVwZGF0ZURpZmYgZWRpdG9yc1xuXG5cbiAgIyBzeW5jIHNjcm9sbCB0byBlZGl0b3IgdGhhdCB3ZSBhcmUgc2hvdyByZXZpc2lvbiBmb3JcbiAgQF9zeW5jU2Nyb2xsOiAoZWRpdG9yLCBuZXdUZXh0RWRpdG9yKSAtPlxuICAgICMgd2l0aG91dCB0aGUgZGVsYXksIHRoZSBzY3JvbGwgcG9zaXRpb24gd2lsbCBmbHVjdHVhdGUgc2xpZ2h0bHkgYmV3ZWVuXG4gICAgIyBjYWxscyB0byBlZGl0b3Igc2V0VGV4dFxuICAgIF8uZGVsYXkgPT5cbiAgICAgIHJldHVybiBpZiBuZXdUZXh0RWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICAgIG5ld1RleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih7cm93OiBAX2dldEluaXRpYWxMaW5lTnVtYmVyKGVkaXRvciksIGNvbHVtbjogMH0pXG4gICAgLCA1MFxuIl19
