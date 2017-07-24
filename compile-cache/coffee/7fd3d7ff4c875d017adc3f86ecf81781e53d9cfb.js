(function() {
  var CompositeDisposable, Os, Path, RevisionView, disposables, fs, git, nothingToShow, notifier, prepFile, showFile, splitDiff;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  RevisionView = require('../views/git-revision-view');

  nothingToShow = 'Nothing to show.';

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.general.openInPane')) {
      splitDirection = atom.config.get('git-plus.general.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  splitDiff = function(repo, pathToFile) {
    return atom.workspace.open(pathToFile, {
      split: 'left',
      activatePane: false,
      activateItem: true,
      searchAllPanes: false
    }).then(function(editor) {
      return RevisionView.showRevision(repo, editor, repo.branch);
    });
  };

  module.exports = function(repo, arg) {
    var args, diffFilePath, diffStat, file, ref, ref1;
    ref = arg != null ? arg : {}, diffStat = ref.diffStat, file = ref.file;
    if (file == null) {
      file = repo.relativize((ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0);
    }
    if (file && file !== '.' && atom.config.get('git-plus.experimental.useSplitDiff')) {
      return splitDiff(repo, file);
    } else {
      diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
      if (!file) {
        return notifier.addError("No open file. Select 'Diff All'.");
      }
      args = ['diff', '--color=never'];
      if (atom.config.get('git-plus.diffs.includeStagedDiff')) {
        args.push('HEAD');
      }
      if (atom.config.get('git-plus.diffs.wordDiff')) {
        args.push('--word-diff');
      }
      if (!diffStat) {
        args.push(file);
      }
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
      }).then(function() {
        return showFile(diffFilePath);
      }).then(function(textEditor) {
        return disposables.add(textEditor.onDidDestroy(function() {
          return fs.unlink(diffFilePath);
        }));
      })["catch"](function(err) {
        if (err === nothingToShow) {
          return notifier.addInfo(err);
        } else {
          return notifier.addError(err);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLFlBQUEsR0FBZSxPQUFBLENBQVEsNEJBQVI7O0VBRWYsYUFBQSxHQUFnQjs7RUFFaEIsV0FBQSxHQUFjLElBQUk7O0VBRWxCLFFBQUEsR0FBVyxTQUFDLFFBQUQ7QUFDVCxRQUFBO0lBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBQUg7TUFDRSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEI7TUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBK0IsQ0FBQSxPQUFBLEdBQVEsY0FBUixDQUEvQixDQUFBLEVBRkY7O1dBR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO0VBSlM7O0VBTVgsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLFFBQVA7V0FDTCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQ1Ysb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEtBQWdCLENBQW5CO2VBQ0UsTUFBQSxDQUFPLGFBQVAsRUFERjtPQUFBLE1BQUE7ZUFHRSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QixFQUF5QyxTQUFDLEdBQUQ7VUFDdkMsSUFBRyxHQUFIO21CQUFZLE1BQUEsQ0FBTyxHQUFQLEVBQVo7V0FBQSxNQUFBO21CQUE0QixPQUFBLENBQVEsSUFBUixFQUE1Qjs7UUFEdUMsQ0FBekMsRUFIRjs7SUFEVSxDQUFSO0VBREs7O0VBUVgsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLFVBQVA7V0FDVixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsVUFBcEIsRUFBZ0M7TUFDOUIsS0FBQSxFQUFPLE1BRHVCO01BRTlCLFlBQUEsRUFBYyxLQUZnQjtNQUc5QixZQUFBLEVBQWMsSUFIZ0I7TUFJOUIsY0FBQSxFQUFnQixLQUpjO0tBQWhDLENBS0UsQ0FBQyxJQUxILENBS1EsU0FBQyxNQUFEO2FBQVksWUFBWSxDQUFDLFlBQWIsQ0FBMEIsSUFBMUIsRUFBZ0MsTUFBaEMsRUFBd0MsSUFBSSxDQUFDLE1BQTdDO0lBQVosQ0FMUjtFQURVOztFQVFaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO3dCQURzQixNQUFpQixJQUFoQix5QkFBVTs7TUFDakMsT0FBUSxJQUFJLENBQUMsVUFBTCw2REFBb0QsQ0FBRSxPQUF0QyxDQUFBLFVBQWhCOztJQUNSLElBQUcsSUFBQSxJQUFTLElBQUEsS0FBVSxHQUFuQixJQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCLENBQTlCO2FBQ0UsU0FBQSxDQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFERjtLQUFBLE1BQUE7TUFHRSxZQUFBLEdBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQVYsRUFBMEIsb0JBQTFCO01BQ2YsSUFBRyxDQUFJLElBQVA7QUFDRSxlQUFPLFFBQVEsQ0FBQyxRQUFULENBQWtCLGtDQUFsQixFQURUOztNQUVBLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBUyxlQUFUO01BQ1AsSUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFwQjtRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFBOztNQUNBLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBM0I7UUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBQTs7TUFDQSxJQUFBLENBQXNCLFFBQXRCO1FBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBQUE7O2FBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2VBQVUsUUFBQSxDQUFTLG9CQUFDLFdBQVcsRUFBWixDQUFBLEdBQWtCLElBQTNCLEVBQWlDLFlBQWpDO01BQVYsQ0FETixDQUVBLENBQUMsSUFGRCxDQUVNLFNBQUE7ZUFBRyxRQUFBLENBQVMsWUFBVDtNQUFILENBRk4sQ0FHQSxDQUFDLElBSEQsQ0FHTSxTQUFDLFVBQUQ7ZUFDSixXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO2lCQUFHLEVBQUUsQ0FBQyxNQUFILENBQVUsWUFBVjtRQUFILENBQXhCLENBQWhCO01BREksQ0FITixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sU0FBQyxHQUFEO1FBQ0wsSUFBRyxHQUFBLEtBQU8sYUFBVjtpQkFDRSxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQixFQURGO1NBQUEsTUFBQTtpQkFHRSxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQixFQUhGOztNQURLLENBTFAsRUFWRjs7RUFGZTtBQW5DakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuT3MgPSByZXF1aXJlICdvcydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuUmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvZ2l0LXJldmlzaW9uLXZpZXcnXG5cbm5vdGhpbmdUb1Nob3cgPSAnTm90aGluZyB0byBzaG93LidcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG5cbnByZXBGaWxlID0gKHRleHQsIGZpbGVQYXRoKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGlmIHRleHQ/Lmxlbmd0aCBpcyAwXG4gICAgICByZWplY3Qgbm90aGluZ1RvU2hvd1xuICAgIGVsc2VcbiAgICAgIGZzLndyaXRlRmlsZSBmaWxlUGF0aCwgdGV4dCwgZmxhZzogJ3crJywgKGVycikgLT5cbiAgICAgICAgaWYgZXJyIHRoZW4gcmVqZWN0IGVyciBlbHNlIHJlc29sdmUgdHJ1ZVxuXG5zcGxpdERpZmYgPSAocmVwbywgcGF0aFRvRmlsZSkgLT5cbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoVG9GaWxlLCB7XG4gICAgc3BsaXQ6ICdsZWZ0JyxcbiAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlLFxuICAgIGFjdGl2YXRlSXRlbTogdHJ1ZSxcbiAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgfSkudGhlbiAoZWRpdG9yKSAtPiBSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uKHJlcG8sIGVkaXRvciwgcmVwby5icmFuY2gpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtkaWZmU3RhdCwgZmlsZX09e30pIC0+XG4gIGZpbGUgPz0gcmVwby5yZWxhdGl2aXplKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpKVxuICBpZiBmaWxlIGFuZCBmaWxlIGlzbnQgJy4nIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC51c2VTcGxpdERpZmYnKVxuICAgIHNwbGl0RGlmZihyZXBvLCBmaWxlKVxuICBlbHNlXG4gICAgZGlmZkZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCBcImF0b21fZ2l0X3BsdXMuZGlmZlwiKVxuICAgIGlmIG5vdCBmaWxlXG4gICAgICByZXR1cm4gbm90aWZpZXIuYWRkRXJyb3IgXCJObyBvcGVuIGZpbGUuIFNlbGVjdCAnRGlmZiBBbGwnLlwiXG4gICAgYXJncyA9IFsnZGlmZicsICctLWNvbG9yPW5ldmVyJ11cbiAgICBhcmdzLnB1c2ggJ0hFQUQnIGlmIGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYnXG4gICAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZidcbiAgICBhcmdzLnB1c2ggZmlsZSB1bmxlc3MgZGlmZlN0YXRcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+IHByZXBGaWxlKChkaWZmU3RhdCA/ICcnKSArIGRhdGEsIGRpZmZGaWxlUGF0aClcbiAgICAudGhlbiAtPiBzaG93RmlsZSBkaWZmRmlsZVBhdGhcbiAgICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPiBmcy51bmxpbmsgZGlmZkZpbGVQYXRoXG4gICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICBpZiBlcnIgaXMgbm90aGluZ1RvU2hvd1xuICAgICAgICBub3RpZmllci5hZGRJbmZvIGVyclxuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRFcnJvciBlcnJcbiJdfQ==
