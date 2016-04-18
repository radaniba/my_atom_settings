(function() {
  var Conflict, Directory, GitOps, MergeConflictsView, MergeState, path, util, _;

  Directory = require('atom').Directory;

  path = require('path');

  _ = require('underscore-plus');

  MergeConflictsView = require('../../lib/view/merge-conflicts-view').MergeConflictsView;

  MergeState = require('../../lib/merge-state').MergeState;

  Conflict = require('../../lib/conflict').Conflict;

  GitOps = require('../../lib/git').GitOps;

  util = require('../util');

  describe('MergeConflictsView', function() {
    var context, fullPath, pkg, repoPath, state, view, _ref;
    _ref = [], view = _ref[0], context = _ref[1], state = _ref[2], pkg = _ref[3];
    fullPath = function(fname) {
      return path.join(atom.project.getPaths()[0], 'path', fname);
    };
    repoPath = function(fname) {
      return context.workingDirectory.relativize(fullPath(fname));
    };
    beforeEach(function() {
      var conflicts, workingDirectory;
      pkg = util.pkgEmitter();
      workingDirectory = new Directory(atom.project.getRepositories()[0].getWorkingDirectory());
      context = {
        isRebase: false,
        workingDirPath: workingDirectory.path,
        workingDirectory: workingDirectory,
        readConflicts: function() {
          return Promise.resolve(conflicts);
        },
        checkoutSide: function() {
          return Promise.resolve();
        }
      };
      conflicts = _.map(['file1.txt', 'file2.txt'], function(fname) {
        return {
          path: repoPath(fname),
          message: 'both modified'
        };
      });
      return util.openPath('triple-2way-diff.txt', function(editorView) {
        state = new MergeState(conflicts, context, false);
        conflicts = Conflict.all(state, editorView.getModel());
        return view = new MergeConflictsView(state, pkg);
      });
    });
    afterEach(function() {
      return pkg.dispose();
    });
    describe('conflict resolution progress', function() {
      var progressFor;
      progressFor = function(filename) {
        return view.pathList.find("li[data-path='" + (repoPath(filename)) + "'] progress")[0];
      };
      it('starts at zero', function() {
        expect(progressFor('file1.txt').value).toBe(0);
        return expect(progressFor('file2.txt').value).toBe(0);
      });
      return it('advances when requested', function() {
        var progress1;
        pkg.didResolveConflict({
          file: fullPath('file1.txt'),
          total: 3,
          resolved: 2
        });
        progress1 = progressFor('file1.txt');
        expect(progress1.value).toBe(2);
        return expect(progress1.max).toBe(3);
      });
    });
    describe('tracking the progress of staging', function() {
      var isMarkedWith;
      isMarkedWith = function(filename, icon) {
        var rs;
        rs = view.pathList.find("li[data-path='" + (repoPath(filename)) + "'] span.icon-" + icon);
        return rs.length !== 0;
      };
      it('starts without files marked as staged', function() {
        expect(isMarkedWith('file1.txt', 'dash')).toBe(true);
        return expect(isMarkedWith('file2.txt', 'dash')).toBe(true);
      });
      return it('marks files as staged on events', function() {
        context.readConflicts = function() {
          return Promise.resolve([
            {
              path: repoPath("file2.txt"),
              message: "both modified"
            }
          ]);
        };
        pkg.didStageFile({
          file: fullPath('file1.txt')
        });
        waitsFor(function() {
          return isMarkedWith('file1.txt', 'check');
        });
        return runs(function() {
          expect(isMarkedWith('file1.txt', 'check')).toBe(true);
          return expect(isMarkedWith('file2.txt', 'dash')).toBe(true);
        });
      });
    });
    return it('minimizes and restores the view on request', function() {
      expect(view.hasClass('minimized')).toBe(false);
      view.minimize();
      expect(view.hasClass('minimized')).toBe(true);
      view.restore();
      return expect(view.hasClass('minimized')).toBe(false);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy92aWV3L21lcmdlLWNvbmZsaWN0cy12aWV3LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBOztBQUFBLEVBQUMsWUFBYSxPQUFBLENBQVEsTUFBUixFQUFiLFNBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUlDLHFCQUFzQixPQUFBLENBQVEscUNBQVIsRUFBdEIsa0JBSkQsQ0FBQTs7QUFBQSxFQU1DLGFBQWMsT0FBQSxDQUFRLHVCQUFSLEVBQWQsVUFORCxDQUFBOztBQUFBLEVBT0MsV0FBWSxPQUFBLENBQVEsb0JBQVIsRUFBWixRQVBELENBQUE7O0FBQUEsRUFRQyxTQUFVLE9BQUEsQ0FBUSxlQUFSLEVBQVYsTUFSRCxDQUFBOztBQUFBLEVBU0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBVFAsQ0FBQTs7QUFBQSxFQVdBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxtREFBQTtBQUFBLElBQUEsT0FBOEIsRUFBOUIsRUFBQyxjQUFELEVBQU8saUJBQVAsRUFBZ0IsZUFBaEIsRUFBdUIsYUFBdkIsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLFNBQUMsS0FBRCxHQUFBO2FBQ1QsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsTUFBdEMsRUFBOEMsS0FBOUMsRUFEUztJQUFBLENBRlgsQ0FBQTtBQUFBLElBS0EsUUFBQSxHQUFXLFNB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

//# sourceURL=/Users/Rad/.atom/packages/merge-conflicts/spec/view/merge-conflicts-view-spec.coffee
