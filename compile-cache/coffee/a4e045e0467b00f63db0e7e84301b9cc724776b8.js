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
      SplitDiff._setConfig('syncHorizontalScroll', true);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtcmV2aXNpb24tdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLDZDQUFELEVBQXNCOztFQUNyQixJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFFTixTQUFBLEdBQVksT0FBQSxDQUFRLFlBQVI7O0VBR1osTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBRUosZUFBQyxDQUFBLFdBQUQsR0FBZTs7O0FBQ2Y7Ozs7Ozs7Ozs7Ozs7O0lBY0EsZUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCO0FBQ2IsVUFBQTs7UUFEK0IsVUFBUTs7TUFDdkMsT0FBQSxHQUFVLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxFQUNSO1FBQUEsSUFBQSxFQUFNLEtBQU47T0FEUTtNQUdWLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQWxCO01BRUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7TUFFUCxZQUFBLEdBQWU7TUFDZixNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ0wsWUFBQSxJQUFnQjtRQURYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUVULElBQUEsR0FBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNMLElBQUcsSUFBQSxLQUFRLENBQVg7bUJBQ0UsS0FBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLEVBQTZCLE9BQTdCLEVBQXNDLFlBQXRD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LENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWxDO01BRUEsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEdBQTlCLENBQWtDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBaEIsQ0FBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzdELE9BQUEsR0FBVTtpQkFDVixTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQjtRQUY2RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBbEM7TUFHQSxTQUFTLENBQUMsbUJBQW1CLENBQUMsR0FBOUIsQ0FBa0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFoQixDQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDN0QsT0FBQSxHQUFVO2lCQUNWLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQWxCO1FBRjZEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFsQzthQUlBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLE9BQXJCO0lBdkJXOztJQTJCYixlQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsTUFBRCxFQUFTLGFBQVQ7YUFHWixDQUFDLENBQUMsS0FBRixDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNOLElBQVUsYUFBYSxDQUFDLFdBQWQsQ0FBQSxDQUFWO0FBQUEsbUJBQUE7O2lCQUNBLGFBQWEsQ0FBQyxzQkFBZCxDQUFxQztZQUFDLEdBQUEsRUFBSyxLQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBdkIsQ0FBTjtZQUFzQyxNQUFBLEVBQVEsQ0FBOUM7V0FBckM7UUFGTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixFQUdFLEVBSEY7SUFIWTs7Ozs7QUFqS2hCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcblxue0NvbXBvc2l0ZURpc3Bvc2FibGUsIEJ1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlIFwiYXRvbVwiXG57JH0gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXG5TcGxpdERpZmYgPSByZXF1aXJlICdzcGxpdC1kaWZmJ1xuXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdpdFJldmlzaW9uVmlld1xuXG4gIEBGSUxFX1BSRUZJWCA9IFwiVGltZU1hY2hpbmUgLSBcIlxuICAjIyNcbiAgICBUaGlzIGNvZGUgYW5kIHRlY2huaXF1ZSB3YXMgb3JpZ2luYWxseSBmcm9tIGdpdC1oaXN0b3J5IHBhY2thZ2UsXG4gICAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYWtlc2Fua2V5L2dpdC1oaXN0b3J5L2Jsb2IvbWFzdGVyL2xpYi9naXQtaGlzdG9yeS12aWV3LmNvZmZlZVxuXG4gICAgQ2hhbmdlcyB0byBwZXJtaXQgY2xpY2sgYW5kIGRyYWcgaW4gdGhlIHRpbWUgcGxvdCB0byB0cmF2ZWwgaW4gdGltZTpcbiAgICAtIGRvbid0IHdyaXRlIHJldmlzaW9uIHRvIGRpc2sgZm9yIGZhc3RlciBhY2Nlc3MgYW5kIHRvIGdpdmUgdGhlIHVzZXIgZmVlZGJhY2sgd2hlbiBnaXQnaW5nXG4gICAgICBhIHJldiB0byBzaG93IGlzIHNsb3dcbiAgICAtIHJldXNlIHRhYnMgbW9yZSAtIGRvbid0IG9wZW4gYSBuZXcgdGFiIGZvciBldmVyeSByZXYgb2YgdGhlIHNhbWUgZmlsZVxuXG4gICAgQ2hhbmdlcyB0byBwZXJtaXQgc2Nyb2xsaW5nIHRvIHNhbWUgbGluZXMgaW4gdmlldyBpbiB0aGUgZWRpdG9yIHRoZSBoaXN0b3J5IGlzIGZvclxuXG4gICAgdGhhbmsgeW91LCBAamFrZXNhbmtleSFcblxuICAjIyNcbiAgQHNob3dSZXZpc2lvbjogKGVkaXRvciwgcmV2SGFzaCwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuICAgICAgZGlmZjogZmFsc2VcblxuICAgIFNwbGl0RGlmZi5kaXNhYmxlKGZhbHNlKVxuXG4gICAgZmlsZSA9IGVkaXRvci5nZXRQYXRoKClcblxuICAgIGZpbGVDb250ZW50cyA9IFwiXCJcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgICBmaWxlQ29udGVudHMgKz0gb3V0cHV0XG4gICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIEBfc2hvd1JldmlzaW9uKGZpbGUsIGVkaXRvciwgcmV2SGFzaCwgZmlsZUNvbnRlbnRzLCBvcHRpb25zKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJDb3VsZCBub3QgcmV0cmlldmUgcmV2aXNpb24gZm9yICN7cGF0aC5iYXNlbmFtZShmaWxlKX0gKCN7Y29kZX0pXCJcblxuICAgIEBfbG9hZFJldmlzaW9uIGZpbGUsIHJldkhhc2gsIHN0ZG91dCwgZXhpdFxuXG5cbiAgQF9sb2FkUmV2aXNpb246IChmaWxlLCBoYXNoLCBzdGRvdXQsIGV4aXQpIC0+XG4gICAgc2hvd0FyZ3MgPSBbXG4gICAgICBcInNob3dcIixcbiAgICAgIFwiI3toYXNofTouLyN7cGF0aC5iYXNlbmFtZShmaWxlKX1cIlxuICAgIF1cbiAgICAjIGNvbnNvbGUubG9nIFwiY2FsbGluZyBnaXRcIlxuICAgIG5ldyBCdWZmZXJlZFByb2Nlc3Mge1xuICAgICAgY29tbWFuZDogXCJnaXRcIixcbiAgICAgIGFyZ3M6IHNob3dBcmdzLFxuICAgICAgb3B0aW9uczogeyBjd2Q6cGF0aC5kaXJuYW1lKGZpbGUpIH0sXG4gICAgICBzdGRvdXQsXG4gICAgICBleGl0XG4gICAgfVxuXG5cbiAgQF9nZXRJbml0aWFsTGluZU51bWJlcjogKGVkaXRvcikgLT5cbiAgICBlZGl0b3JFbGUgPSBhdG9tLnZpZXdzLmdldFZpZXcgZWRpdG9yXG4gICAgbGluZU51bWJlciA9IDBcbiAgICBpZiBlZGl0b3I/ICYmIGVkaXRvciAhPSAnJ1xuICAgICAgbGluZU51bWJlciA9IGVkaXRvckVsZS5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgICAjIGNvbnNvbGUubG9nIFwiX2dldEluaXRpYWxMaW5lTnVtYmVyXCIsIGxpbmVOdW1iZXJcblxuICAgICAgIyBUT0RPOiB3aHkgLTU/ICB0aGlzIGlzIHdoYXQgaXQgdG9vayB0byBhY3R1YWxseSBzeW5jIHRoZSBsYXN0IGxpbmUgbnVtYmVyXG4gICAgICAjICAgIGJldHdlZW4gdHdvIGVkaXRvcnNcbiAgICAgIHJldHVybiBsaW5lTnVtYmVyIC0gNVxuXG5cbiAgQF9zaG93UmV2aXNpb246IChmaWxlLCBlZGl0b3IsIHJldkhhc2gsIGZpbGVDb250ZW50cywgb3B0aW9ucz17fSkgLT5cbiAgICBvdXRwdXREaXIgPSBcIiN7YXRvbS5nZXRDb25maWdEaXJQYXRoKCl9L2dpdC10aW1lLW1hY2hpbmVcIlxuICAgIGZzLm1rZGlyIG91dHB1dERpciBpZiBub3QgZnMuZXhpc3RzU3luYyBvdXRwdXREaXJcbiAgICBvdXRwdXRGaWxlUGF0aCA9IFwiI3tvdXRwdXREaXJ9LyN7QEZJTEVfUFJFRklYfSN7cGF0aC5iYXNlbmFtZShmaWxlKX1cIlxuICAgIG91dHB1dEZpbGVQYXRoICs9IFwiLmRpZmZcIiBpZiBvcHRpb25zLmRpZmZcbiAgICB0ZW1wQ29udGVudCA9IFwiTG9hZGluZy4uLlwiICsgZWRpdG9yLmJ1ZmZlcj8ubGluZUVuZGluZ0ZvclJvdygwKVxuICAgIGZzLndyaXRlRmlsZSBvdXRwdXRGaWxlUGF0aCwgdGVtcENvbnRlbnQsIChlcnJvcikgPT5cbiAgICAgIGlmIG5vdCBlcnJvclxuICAgICAgICAjIGVkaXRvciAoY3VycmVudCByZXYpIG1heSBoYXZlIGJlZW4gZGVzdHJveWVkLCB3b3Jrc3BhY2Uub3BlbiB3aWxsIGZpbmQgb3JcbiAgICAgICAgIyByZW9wZW4gaXRcbiAgICAgICAgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZSxcbiAgICAgICAgICBzcGxpdDogXCJsZWZ0XCJcbiAgICAgICAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlXG4gICAgICAgICAgYWN0aXZhdGVJdGVtOiB0cnVlXG4gICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IGZhbHNlXG4gICAgICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuIG91dHB1dEZpbGVQYXRoLFxuICAgICAgICAgICAgc3BsaXQ6IFwicmlnaHRcIlxuICAgICAgICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZVxuICAgICAgICAgICAgYWN0aXZhdGVJdGVtOiB0cnVlXG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgICAgICAgICBwcm9taXNlLnRoZW4gKG5ld1RleHRFZGl0b3IpID0+XG4gICAgICAgICAgICBAX3VwZGF0ZU5ld1RleHRFZGl0b3IobmV3VGV4dEVkaXRvciwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMpXG5cblxuXG5cbiAgQF91cGRhdGVOZXdUZXh0RWRpdG9yOiAobmV3VGV4dEVkaXRvciwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMpIC0+XG4gICAgIyBzbGlnaHQgZGVsYXkgc28gdGhlIHVzZXIgZ2V0cyBmZWVkYmFjayBvbiB0aGVpciBhY3Rpb25cbiAgICBfLmRlbGF5ID0+XG4gICAgICBsaW5lRW5kaW5nID0gZWRpdG9yLmJ1ZmZlcj8ubGluZUVuZGluZ0ZvclJvdygwKSB8fCBcIlxcblwiXG4gICAgICBmaWxlQ29udGVudHMgPSBmaWxlQ29udGVudHMucmVwbGFjZSgvKFxcclxcbnxcXG4pL2csIGxpbmVFbmRpbmcpXG4gICAgICBuZXdUZXh0RWRpdG9yLmJ1ZmZlci5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nKGxpbmVFbmRpbmcpXG4gICAgICBuZXdUZXh0RWRpdG9yLnNldFRleHQoZmlsZUNvbnRlbnRzKVxuXG4gICAgICAjIEhBQ0sgQUxFUlQ6IHRoaXMgaXMgcHJvbmUgdG8gZXZlbnR1YWxseSBmYWlsLiBEb24ndCBzaG93IHVzZXIgY2hhbmdlXG4gICAgICAjICBcIndvdWxkIHlvdSBsaWtlIHRvIHNhdmVcIiBtZXNzYWdlIGJldHdlZW4gY2hhbmdlcyB0byByZXYgYmVpbmcgdmlld2VkXG4gICAgICBuZXdUZXh0RWRpdG9yLmJ1ZmZlci5jYWNoZWREaXNrQ29udGVudHMgPSBmaWxlQ29udGVudHNcblxuICAgICAgQF9zcGxpdERpZmYoZWRpdG9yLCBuZXdUZXh0RWRpdG9yKVxuICAgICAgQF9zeW5jU2Nyb2xsKGVkaXRvciwgbmV3VGV4dEVkaXRvcilcbiAgICAgIEBfYWZmaXhUYWJUaXRsZSBuZXdUZXh0RWRpdG9yLCByZXZIYXNoXG4gICAgLCAzMDBcblxuXG4gIEBfYWZmaXhUYWJUaXRsZTogKG5ld1RleHRFZGl0b3IsIHJldkhhc2gpIC0+XG4gICAgIyBzcGVha2luZyBvZiBoYWNrcyB0aGlzIGlzIGFsc28gaGFja2lzaCwgdGhlcmUgaGFzIHRvIGJlIGEgYmV0dGVyIHdheSB0byBjaGFuZ2UgdG9cbiAgICAjIHRhYiB0aXRsZSBhbmQgdW5saW5raW5nIGl0IGZyb20gdGhlIGZpbGUgbmFtZVxuICAgICRlbCA9ICQoYXRvbS52aWV3cy5nZXRWaWV3KG5ld1RleHRFZGl0b3IpKVxuICAgICR0YWJUaXRsZSA9ICRlbC5wYXJlbnRzKCdhdG9tLXBhbmUnKS5maW5kKCdsaS50YWIuYWN0aXZlIC50aXRsZScpXG4gICAgdGl0bGVUZXh0ID0gJHRhYlRpdGxlLnRleHQoKVxuICAgIGlmIHRpdGxlVGV4dC5pbmRleE9mKCdAJykgPj0gMFxuICAgICAgdGl0bGVUZXh0ID0gdGl0bGVUZXh0LnJlcGxhY2UoL1xcQC4qLywgXCJAI3tyZXZIYXNofVwiKVxuICAgIGVsc2VcbiAgICAgIHRpdGxlVGV4dCArPSBcIiBAI3tyZXZIYXNofVwiXG5cbiAgICAkdGFiVGl0bGUudGV4dCh0aXRsZVRleHQpXG5cblxuICBAX3NwbGl0RGlmZjogKGVkaXRvciwgbmV3VGV4dEVkaXRvcikgLT5cbiAgICBlZGl0b3JzID1cbiAgICAgIGVkaXRvcjE6IG5ld1RleHRFZGl0b3IgICAgIyB0aGUgb2xkZXIgcmV2aXNpb25cbiAgICAgIGVkaXRvcjI6IGVkaXRvciAgICAgICAgICAgIyBjdXJyZW50IHJldlxuXG4gICAgU3BsaXREaWZmLl9zZXRDb25maWcgJ3JpZ2h0RWRpdG9yQ29sb3InLCAnZ3JlZW4nXG4gICAgU3BsaXREaWZmLl9zZXRDb25maWcgJ2xlZnRFZGl0b3JDb2xvcicsICdyZWQnXG4gICAgU3BsaXREaWZmLl9zZXRDb25maWcgJ2RpZmZXb3JkcycsIHRydWVcbiAgICBTcGxpdERpZmYuX3NldENvbmZpZyAnaWdub3JlV2hpdGVzcGFjZScsIHRydWVcbiAgICBTcGxpdERpZmYuX3NldENvbmZpZyAnc3luY0hvcml6b250YWxTY3JvbGwnLCB0cnVlXG5cbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBTcGxpdERpZmYudXBkYXRlRGlmZihlZGl0b3JzKSBpZiBlZGl0b3JzP1xuICAgIFNwbGl0RGlmZi5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgIFNwbGl0RGlmZi51cGRhdGVEaWZmKGVkaXRvcnMpIGlmIGVkaXRvcnM/XG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG5cbiAgICBTcGxpdERpZmYudXBkYXRlRGlmZiBlZGl0b3JzXG5cblxuICAjIHN5bmMgc2Nyb2xsIHRvIGVkaXRvciB0aGF0IHdlIGFyZSBzaG93IHJldmlzaW9uIGZvclxuICBAX3N5bmNTY3JvbGw6IChlZGl0b3IsIG5ld1RleHRFZGl0b3IpIC0+XG4gICAgIyB3aXRob3V0IHRoZSBkZWxheSwgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aWxsIGZsdWN0dWF0ZSBzbGlnaHRseSBiZXdlZW5cbiAgICAjIGNhbGxzIHRvIGVkaXRvciBzZXRUZXh0XG4gICAgXy5kZWxheSA9PlxuICAgICAgcmV0dXJuIGlmIG5ld1RleHRFZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgICAgbmV3VGV4dEVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHtyb3c6IEBfZ2V0SW5pdGlhbExpbmVOdW1iZXIoZWRpdG9yKSwgY29sdW1uOiAwfSlcbiAgICAsIDUwXG4iXX0=
