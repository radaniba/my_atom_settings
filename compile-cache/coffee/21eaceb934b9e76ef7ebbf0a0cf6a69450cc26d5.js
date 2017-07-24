(function() {
  var $, $$, BranchDialog, BranchView, CommitDialog, ConfirmDialog, CreateTagDialog, DeleteDialog, DiffView, FileView, FlowDialog, GitControlView, LogView, MenuView, MergeDialog, MidrebaseDialog, ProjectDialog, PushDialog, PushTagsDialog, RebaseDialog, View, child_process, git, gitWorkspaceTitle, ref, runShell,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$, $$ = ref.$$;

  child_process = require('child_process');

  git = require('./git');

  BranchView = require('./views/branch-view');

  DiffView = require('./views/diff-view');

  FileView = require('./views/file-view');

  LogView = require('./views/log-view');

  MenuView = require('./views/menu-view');

  ProjectDialog = require('./dialogs/project-dialog');

  BranchDialog = require('./dialogs/branch-dialog');

  CommitDialog = require('./dialogs/commit-dialog');

  ConfirmDialog = require('./dialogs/confirm-dialog');

  CreateTagDialog = require('./dialogs/create-tag-dialog');

  DeleteDialog = require('./dialogs/delete-dialog');

  MergeDialog = require('./dialogs/merge-dialog');

  FlowDialog = require('./dialogs/flow-dialog');

  PushDialog = require('./dialogs/push-dialog');

  PushTagsDialog = require('./dialogs/push-tags-dialog');

  RebaseDialog = require('./dialogs/rebase-dialog');

  MidrebaseDialog = require('./dialogs/midrebase-dialog');

  runShell = function(cmd, output) {
    var shell;
    shell = child_process.execSync(cmd, {
      encoding: 'utf8'
    }).trim();
    if (shell === output) {
      return true;
    } else if (shell !== output) {
      return false;
    }
  };

  gitWorkspaceTitle = '';

  module.exports = GitControlView = (function(superClass) {
    extend(GitControlView, superClass);

    function GitControlView() {
      this.tag = bind(this.tag, this);
      this.midrebase = bind(this.midrebase, this);
      this.rebase = bind(this.rebase, this);
      this.flow = bind(this.flow, this);
      this.merge = bind(this.merge, this);
      return GitControlView.__super__.constructor.apply(this, arguments);
    }

    GitControlView.content = function() {
      if (git.isInitialised()) {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            _this.subview('menuView', new MenuView());
            _this.div({
              "class": 'content',
              outlet: 'contentView'
            }, function() {
              _this.div({
                "class": 'sidebar'
              }, function() {
                _this.subview('filesView', new FileView());
                _this.subview('localBranchView', new BranchView({
                  name: 'Local',
                  local: true
                }));
                return _this.subview('remoteBranchView', new BranchView({
                  name: 'Remote'
                }));
              });
              _this.div({
                "class": 'domain'
              }, function() {
                return _this.subview('diffView', new DiffView());
              });
              _this.subview('projectDialog', new ProjectDialog());
              _this.subview('branchDialog', new BranchDialog());
              _this.subview('commitDialog', new CommitDialog());
              _this.subview('createtagDialog', new CreateTagDialog());
              _this.subview('mergeDialog', new MergeDialog());
              _this.subview('flowDialog', new FlowDialog());
              _this.subview('pushDialog', new PushDialog());
              _this.subview('pushtagDialog', new PushTagsDialog());
              _this.subview('rebaseDialog', new RebaseDialog());
              return _this.subview('midrebaseDialog', new MidrebaseDialog());
            });
            return _this.subview('logView', new LogView());
          };
        })(this));
      } else {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            return _this.subview('logView', new LogView());
          };
        })(this));
      }
    };

    GitControlView.prototype.serialize = function() {};

    GitControlView.prototype.initialize = function() {
      console.log('GitControlView: initialize');
      git.setLogger((function(_this) {
        return function(log, iserror) {
          return _this.logView.log(log, iserror);
        };
      })(this));
      this.active = true;
      this.branchSelected = null;
      if (!git.isInitialised()) {
        git.alert("> This project is not a git repository. Either open another project or create a repository.");
      } else {
        this.setWorkspaceTitle(git.getRepository().path.split('/').reverse()[1]);
      }
      this.update(true);
    };

    GitControlView.prototype.destroy = function() {
      console.log('GitControlView: destroy');
      this.active = false;
    };

    GitControlView.prototype.setWorkspaceTitle = function(title) {
      return gitWorkspaceTitle = title;
    };

    GitControlView.prototype.getTitle = function() {
      return 'git:control';
    };

    GitControlView.prototype.update = function(nofetch) {
      if (git.isInitialised()) {
        this.loadBranches();
        this.showStatus();
        this.filesView.setWorkspaceTitle(gitWorkspaceTitle);
        if (!nofetch) {
          this.fetchMenuClick();
          if (this.diffView) {
            this.diffView.clearAll();
          }
        }
      }
    };

    GitControlView.prototype.loadLog = function() {
      git.log(this.selectedBranch).then(function(logs) {
        console.log('git.log', logs);
      });
    };

    GitControlView.prototype.checkoutBranch = function(branch, remote) {
      git.checkout(branch, remote).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.branchCount = function(count) {
      var remotes;
      if (git.isInitialised()) {
        remotes = git.hasOrigin();
        this.menuView.activate('upstream', remotes && count.behind);
        this.menuView.activate('downstream', remotes && (count.ahead || !git.getRemoteBranch()));
        this.menuView.activate('remote', remotes);
      }
    };

    GitControlView.prototype.loadBranches = function() {
      if (git.isInitialised()) {
        this.selectedBranch = git.getLocalBranch();
        git.getBranches().then((function(_this) {
          return function(branches) {
            _this.branches = branches;
            _this.remoteBranchView.addAll(branches.remote);
            _this.localBranchView.addAll(branches.local, true);
          };
        })(this));
      }
    };

    GitControlView.prototype.showSelectedFiles = function() {
      this.menuView.activate('file', this.filesView.hasSelected());
      this.menuView.activate('file.merging', this.filesView.hasSelected() || git.isMerging());
    };

    GitControlView.prototype.showStatus = function() {
      git.status().then((function(_this) {
        return function(files) {
          _this.filesView.addAll(files);
        };
      })(this));
    };

    GitControlView.prototype.projectMenuClick = function() {
      this.projectDialog.activate();
    };

    GitControlView.prototype.branchMenuClick = function() {
      this.branchDialog.activate();
    };

    GitControlView.prototype.compareMenuClick = function() {
      git.diff(this.filesView.getSelected().all.join(' ')).then((function(_this) {
        return function(diffs) {
          return _this.diffView.addAll(diffs);
        };
      })(this));
    };

    GitControlView.prototype.commitMenuClick = function() {
      if (!(this.filesView.hasSelected() || git.isMerging())) {
        return;
      }
      this.commitDialog.activate();
    };

    GitControlView.prototype.commit = function() {
      var files, msg;
      if (!this.filesView.hasSelected()) {
        return;
      }
      msg = this.commitDialog.getMessage();
      files = this.filesView.getSelected();
      this.filesView.unselectAll();
      git.add(files.add).then(function() {
        return git.remove(files.rem);
      }).then(function() {
        return git.commit(msg);
      }).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.createBranch = function(branch) {
      git.createBranch(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.deleteBranch = function(branch) {
      var confirmCb, forceDeleteCallback;
      confirmCb = (function(_this) {
        return function(params) {
          git.deleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      forceDeleteCallback = (function(_this) {
        return function(params) {
          return git.forceDeleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      this.contentView.append(new DeleteDialog({
        hdr: 'Delete Branch',
        msg: "Are you sure you want to delete the local branch '" + branch + "'?",
        cb: confirmCb,
        fdCb: forceDeleteCallback,
        branch: branch
      }));
    };

    GitControlView.prototype.fetchMenuClick = function() {
      if (git.isInitialised()) {
        if (!git.hasOrigin()) {
          return;
        }
      }
      git.fetch().then((function(_this) {
        return function() {
          return _this.loadBranches();
        };
      })(this));
    };

    GitControlView.prototype.mergeMenuClick = function() {
      this.mergeDialog.activate(this.branches.local);
    };

    GitControlView.prototype.merge = function(branch, noff) {
      git.merge(branch, noff).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.flowMenuClick = function() {
      this.flowDialog.activate(this.branches.local);
    };

    GitControlView.prototype.flow = function(type, action, branch) {
      git.flow(type, action, branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.ptagMenuClick = function() {
      this.pushtagDialog.activate();
    };

    GitControlView.prototype.ptag = function(remote) {
      git.ptag(remote).then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullMenuClick = function() {
      git.pull().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullupMenuClick = function() {
      git.pullup().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pushMenuClick = function() {
      git.getBranches().then((function(_this) {
        return function(branches) {
          return _this.pushDialog.activate(branches.remote);
        };
      })(this));
    };

    GitControlView.prototype.push = function(remote, branches, force) {
      return git.push(remote, branches, force).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.rebaseMenuClick = function() {
      var check;
      check = runShell('ls `git rev-parse --git-dir` | grep rebase || echo norebase', 'norebase');
      if (check === true) {
        this.rebaseDialog.activate(this.branches.local);
      } else if (check === false) {
        this.midrebaseDialog.activate();
      }
    };

    GitControlView.prototype.rebase = function(branch) {
      git.rebase(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.midrebase = function(contin, abort, skip) {
      git.midrebase(contin, abort, skip).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.resetMenuClick = function() {
      var files;
      if (!this.filesView.hasSelected()) {
        return;
      }
      files = this.filesView.getSelected();
      return atom.confirm({
        message: "Reset will erase changes since the last commit in the selected files. Are you sure?",
        buttons: {
          Cancel: (function(_this) {
            return function() {};
          })(this),
          Reset: (function(_this) {
            return function() {
              git.reset(files.all).then(function() {
                return _this.update();
              });
            };
          })(this)
        }
      });
    };

    GitControlView.prototype.tagMenuClick = function() {
      this.createtagDialog.activate();
    };

    GitControlView.prototype.tag = function(name, href, msg) {
      git.tag(name, href, msg).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    return GitControlView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LWNvbnRyb2wtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlUQUFBO0lBQUE7Ozs7RUFBQSxNQUFnQixPQUFBLENBQVEsc0JBQVIsQ0FBaEIsRUFBQyxlQUFELEVBQU8sU0FBUCxFQUFVOztFQUVWLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVI7O0VBRWhCLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSOztFQUNiLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztFQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVI7O0VBRVgsYUFBQSxHQUFnQixPQUFBLENBQVEsMEJBQVI7O0VBQ2hCLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVI7O0VBQ2YsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDaEIsZUFBQSxHQUFrQixPQUFBLENBQVEsNkJBQVI7O0VBQ2xCLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVI7O0VBQ2YsV0FBQSxHQUFjLE9BQUEsQ0FBUSx3QkFBUjs7RUFDZCxVQUFBLEdBQWEsT0FBQSxDQUFRLHVCQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsdUJBQVI7O0VBQ2IsY0FBQSxHQUFpQixPQUFBLENBQVEsNEJBQVI7O0VBQ2pCLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVI7O0VBQ2YsZUFBQSxHQUFrQixPQUFBLENBQVEsNEJBQVI7O0VBRWxCLFFBQUEsR0FBVyxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBQ1QsUUFBQTtJQUFBLEtB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QUFBLENBQUEsSUFBQSxDQUFSO1VBRUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7Y0FDTCxHQUFHLENBQUMsS0FBSixDQUFVLEtBQUssQ0FBQyxHQUFoQixDQUFvQixDQUFDLElBQXJCLENBQTBCLFNBQUE7dUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtjQUFILENBQTFCO1lBREs7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRlA7U0FGRjtPQURGO0lBTGM7OzZCQWNoQixZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBQTtJQURZOzs2QkFJZCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEdBQWI7TUFDSCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLEdBQXBCLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFERzs7OztLQWxQc0I7QUFuQzdCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsICQsICQkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5jaGlsZF9wcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcblxuZ2l0ID0gcmVxdWlyZSAnLi9naXQnXG5cbkJyYW5jaFZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2JyYW5jaC12aWV3J1xuRGlmZlZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2RpZmYtdmlldydcbkZpbGVWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9maWxlLXZpZXcnXG5Mb2dWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sb2ctdmlldydcbk1lbnVWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9tZW51LXZpZXcnXG5cblByb2plY3REaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvcHJvamVjdC1kaWFsb2cnXG5CcmFuY2hEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvYnJhbmNoLWRpYWxvZydcbkNvbW1pdERpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9jb21taXQtZGlhbG9nJ1xuQ29uZmlybURpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9jb25maXJtLWRpYWxvZydcbkNyZWF0ZVRhZ0RpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9jcmVhdGUtdGFnLWRpYWxvZydcbkRlbGV0ZURpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9kZWxldGUtZGlhbG9nJ1xuTWVyZ2VEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvbWVyZ2UtZGlhbG9nJ1xuRmxvd0RpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9mbG93LWRpYWxvZydcblB1c2hEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvcHVzaC1kaWFsb2cnXG5QdXNoVGFnc0RpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9wdXNoLXRhZ3MtZGlhbG9nJ1xuUmViYXNlRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL3JlYmFzZS1kaWFsb2cnXG5NaWRyZWJhc2VEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvbWlkcmViYXNlLWRpYWxvZydcblxucnVuU2hlbGwgPSAoY21kLCBvdXRwdXQpIC0+XG4gIHNoZWxsID0gY2hpbGRfcHJvY2Vzcy5leGVjU3luYyhjbWQsIHsgZW5jb2Rpbmc6ICd1dGY4J30pLnRyaW0oKVxuICBpZiBzaGVsbCBpcyBvdXRwdXRcbiAgICByZXR1cm4gdHJ1ZVxuICBlbHNlIGlmIHNoZWxsIGlzbnQgb3V0cHV0XG4gICAgcmV0dXJuIGZhbHNlXG5cbmdpdFdvcmtzcGFjZVRpdGxlID0gJydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2l0Q29udHJvbFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIEBkaXYgY2xhc3M6ICdnaXQtY29udHJvbCcsID0+XG4gICAgICAgIEBzdWJ2aWV3ICdtZW51VmlldycsIG5ldyBNZW51VmlldygpXG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb250ZW50Jywgb3V0bGV0OiAnY29udGVudFZpZXcnLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdzaWRlYmFyJywgPT5cbiAgICAgICAgICAgIEBzdWJ2aWV3ICdmaWxlc1ZpZXcnLCBuZXcgRmlsZVZpZXcoKVxuICAgICAgICAgICAgQHN1YnZpZXcgJ2xvY2FsQnJhbmNoVmlldycsIG5ldyBCcmFuY2hWaWV3KG5hbWU6ICdMb2NhbCcsIGxvY2FsOiB0cnVlKVxuICAgICAgICAgICAgQHN1YnZpZXcgJ3JlbW90ZUJyYW5jaFZpZXcnLCBuZXcgQnJhbmNoVmlldyhuYW1lOiAnUmVtb3RlJylcbiAgICAgICAgICBAZGl2IGNsYXNzOiAnZG9tYWluJywgPT5cbiAgICAgICAgICAgIEBzdWJ2aWV3ICdkaWZmVmlldycsIG5ldyBEaWZmVmlldygpXG4gICAgICAgICAgQHN1YnZpZXcgJ3Byb2plY3REaWFsb2cnLCBuZXcgUHJvamVjdERpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ2JyYW5jaERpYWxvZycsIG5ldyBCcmFuY2hEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdjb21taXREaWFsb2cnLCBuZXcgQ29tbWl0RGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnY3JlYXRldGFnRGlhbG9nJywgbmV3IENyZWF0ZVRhZ0RpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ21lcmdlRGlhbG9nJywgbmV3IE1lcmdlRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnZmxvd0RpYWxvZycsIG5ldyBGbG93RGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAncHVzaERpYWxvZycsIG5ldyBQdXNoRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAncHVzaHRhZ0RpYWxvZycsIG5ldyBQdXNoVGFnc0RpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ3JlYmFzZURpYWxvZycsIG5ldyBSZWJhc2VEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdtaWRyZWJhc2VEaWFsb2cnLCBuZXcgTWlkcmViYXNlRGlhbG9nKClcbiAgICAgICAgQHN1YnZpZXcgJ2xvZ1ZpZXcnLCBuZXcgTG9nVmlldygpXG4gICAgZWxzZSAjVGhpcyBpcyBzbyB0aGF0IG5vIGVycm9yIG1lc3NhZ2VzIGNhbiBiZSBjcmVhdGVkIGJ5IHB1c2hpbmcgYnV0dG9ucyB0aGF0IGFyZSB1bmF2YWlsYWJsZS5cbiAgICAgIEBkaXYgY2xhc3M6ICdnaXQtY29udHJvbCcsID0+XG4gICAgICAgIEBzdWJ2aWV3ICdsb2dWaWV3JywgbmV3IExvZ1ZpZXcoKVxuXG4gIHNlcmlhbGl6ZTogLT5cblxuICBpbml0aWFsaXplOiAtPlxuICAgIGNvbnNvbGUubG9nICdHaXRDb250cm9sVmlldzogaW5pdGlhbGl6ZSdcblxuICAgIGdpdC5zZXRMb2dnZXIgKGxvZywgaXNlcnJvcikgPT4gQGxvZ1ZpZXcubG9nKGxvZywgaXNlcnJvcilcblxuICAgIEBhY3RpdmUgPSB0cnVlXG4gICAgQGJyYW5jaFNlbGVjdGVkID0gbnVsbFxuXG4gICAgaWYgIWdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIGdpdC5hbGVydCBcIj4gVGhpcyBwcm9qZWN0IGlzIG5vdCBhIGdpdCByZXBvc2l0b3J5LiBFaXRoZXIgb3BlbiBhbm90aGVyIHByb2plY3Qgb3IgY3JlYXRlIGEgcmVwb3NpdG9yeS5cIlxuICAgIGVsc2VcbiAgICAgIEBzZXRXb3Jrc3BhY2VUaXRsZShnaXQuZ2V0UmVwb3NpdG9yeSgpLnBhdGguc3BsaXQoJy8nKS5yZXZlcnNlKClbMV0pXG4gICAgQHVwZGF0ZSh0cnVlKVxuXG4gICAgcmV0dXJuXG5cbiAgZGVzdHJveTogLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbFZpZXc6IGRlc3Ryb3knXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgcmV0dXJuXG5cbiAgc2V0V29ya3NwYWNlVGl0bGU6ICh0aXRsZSkgLT5cbiAgICBnaXRXb3Jrc3BhY2VUaXRsZSA9IHRpdGxlXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgcmV0dXJuICdnaXQ6Y29udHJvbCdcblxuICB1cGRhdGU6IChub2ZldGNoKSAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIEBsb2FkQnJhbmNoZXMoKVxuICAgICAgQHNob3dTdGF0dXMoKVxuICAgICAgQGZpbGVzVmlldy5zZXRXb3Jrc3BhY2VUaXRsZShnaXRXb3Jrc3BhY2VUaXRsZSlcbiAgICAgIHVubGVzcyBub2ZldGNoXG4gICAgICAgIEBmZXRjaE1lbnVDbGljaygpXG4gICAgICAgIGlmIEBkaWZmVmlld1xuICAgICAgICAgIEBkaWZmVmlldy5jbGVhckFsbCgpXG5cbiAgICByZXR1cm5cblxuICBsb2FkTG9nOiAtPlxuICAgIGdpdC5sb2coQHNlbGVjdGVkQnJhbmNoKS50aGVuIChsb2dzKSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2dpdC5sb2cnLCBsb2dzXG4gICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICBjaGVja291dEJyYW5jaDogKGJyYW5jaCwgcmVtb3RlKSAtPlxuICAgIGdpdC5jaGVja291dChicmFuY2gsIHJlbW90ZSkudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICBicmFuY2hDb3VudDogKGNvdW50KSAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIHJlbW90ZXMgPSBnaXQuaGFzT3JpZ2luKClcblxuICAgICAgQG1lbnVWaWV3LmFjdGl2YXRlKCd1cHN0cmVhbScsIHJlbW90ZXMgYW5kIGNvdW50LmJlaGluZClcbiAgICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgnZG93bnN0cmVhbScsIHJlbW90ZXMgYW5kIChjb3VudC5haGVhZCBvciAhZ2l0LmdldFJlbW90ZUJyYW5jaCgpKSlcbiAgICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgncmVtb3RlJywgcmVtb3RlcylcbiAgICByZXR1cm5cblxuICBsb2FkQnJhbmNoZXM6IC0+XG4gICAgaWYgZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgQHNlbGVjdGVkQnJhbmNoID0gZ2l0LmdldExvY2FsQnJhbmNoKClcblxuICAgICAgZ2l0LmdldEJyYW5jaGVzKCkudGhlbiAoYnJhbmNoZXMpID0+XG4gICAgICAgIEBicmFuY2hlcyA9IGJyYW5jaGVzXG4gICAgICAgIEByZW1vdGVCcmFuY2hWaWV3LmFkZEFsbChicmFuY2hlcy5yZW1vdGUpXG4gICAgICAgIEBsb2NhbEJyYW5jaFZpZXcuYWRkQWxsKGJyYW5jaGVzLmxvY2FsLCB0cnVlKVxuICAgICAgICByZXR1cm5cblxuICAgIHJldHVyblxuXG4gIHNob3dTZWxlY3RlZEZpbGVzOiAtPlxuICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgnZmlsZScsIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKSlcbiAgICBAbWVudVZpZXcuYWN0aXZhdGUoJ2ZpbGUubWVyZ2luZycsIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKSBvciBnaXQuaXNNZXJnaW5nKCkpXG4gICAgcmV0dXJuXG5cbiAgc2hvd1N0YXR1czogLT5cbiAgICBnaXQuc3RhdHVzKCkudGhlbiAoZmlsZXMpID0+XG4gICAgICBAZmlsZXNWaWV3LmFkZEFsbChmaWxlcylcbiAgICAgIHJldHVyblxuICAgIHJldHVyblxuXG4gIHByb2plY3RNZW51Q2xpY2s6IC0+XG4gICAgQHByb2plY3REaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIGJyYW5jaE1lbnVDbGljazogLT5cbiAgICBAYnJhbmNoRGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICBjb21wYXJlTWVudUNsaWNrOiAtPlxuICAgIGdpdC5kaWZmKEBmaWxlc1ZpZXcuZ2V0U2VsZWN0ZWQoKS5hbGwuam9pbignICcpKS50aGVuIChkaWZmcykgPT4gQGRpZmZWaWV3LmFkZEFsbChkaWZmcylcbiAgICByZXR1cm5cblxuICBjb21taXRNZW51Q2xpY2s6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKCkgb3IgZ2l0LmlzTWVyZ2luZygpXG5cbiAgICBAY29tbWl0RGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICBjb21taXQ6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKClcblxuICAgIG1zZyA9IEBjb21taXREaWFsb2cuZ2V0TWVzc2FnZSgpXG5cbiAgICBmaWxlcyA9IEBmaWxlc1ZpZXcuZ2V0U2VsZWN0ZWQoKVxuICAgIEBmaWxlc1ZpZXcudW5zZWxlY3RBbGwoKVxuXG4gICAgZ2l0LmFkZChmaWxlcy5hZGQpXG4gICAgICAudGhlbiAtPiBnaXQucmVtb3ZlKGZpbGVzLnJlbSlcbiAgICAgIC50aGVuIC0+IGdpdC5jb21taXQobXNnKVxuICAgICAgLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgY3JlYXRlQnJhbmNoOiAoYnJhbmNoKSAtPlxuICAgIGdpdC5jcmVhdGVCcmFuY2goYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIGRlbGV0ZUJyYW5jaDogKGJyYW5jaCkgLT5cbiAgICBjb25maXJtQ2IgPSAocGFyYW1zKSA9PlxuICAgICAgZ2l0LmRlbGV0ZUJyYW5jaChwYXJhbXMuYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBmb3JjZURlbGV0ZUNhbGxiYWNrID0gKHBhcmFtcykgPT5cbiAgICAgIGdpdC5mb3JjZURlbGV0ZUJyYW5jaChwYXJhbXMuYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuXG4gICAgQGNvbnRlbnRWaWV3LmFwcGVuZCBuZXcgRGVsZXRlRGlhbG9nXG4gICAgICBoZHI6ICdEZWxldGUgQnJhbmNoJ1xuICAgICAgbXNnOiBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhlIGxvY2FsIGJyYW5jaCAnI3ticmFuY2h9Jz9cIlxuICAgICAgY2I6IGNvbmZpcm1DYlxuICAgICAgZmRDYjogZm9yY2VEZWxldGVDYWxsYmFja1xuICAgICAgYnJhbmNoOiBicmFuY2hcbiAgICByZXR1cm5cblxuICBmZXRjaE1lbnVDbGljazogLT5cbiAgICBpZiBnaXQuaXNJbml0aWFsaXNlZCgpXG4gICAgICByZXR1cm4gdW5sZXNzIGdpdC5oYXNPcmlnaW4oKVxuXG4gICAgZ2l0LmZldGNoKCkudGhlbiA9PiBAbG9hZEJyYW5jaGVzKClcbiAgICByZXR1cm5cblxuICBtZXJnZU1lbnVDbGljazogLT5cbiAgICBAbWVyZ2VEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIHJldHVyblxuXG4gIG1lcmdlOiAoYnJhbmNoLG5vZmYpID0+XG4gICAgZ2l0Lm1lcmdlKGJyYW5jaCxub2ZmKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIGZsb3dNZW51Q2xpY2s6IC0+XG4gICAgQGZsb3dEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIHJldHVyblxuXG4gIGZsb3c6ICh0eXBlLGFjdGlvbixicmFuY2gpID0+XG4gICAgZ2l0LmZsb3codHlwZSxhY3Rpb24sYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIHB0YWdNZW51Q2xpY2s6IC0+XG4gICAgQHB1c2h0YWdEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIHB0YWc6IChyZW1vdGUpIC0+XG4gICAgZ2l0LnB0YWcocmVtb3RlKS50aGVuID0+IEB1cGRhdGUodHJ1ZSlcbiAgICByZXR1cm5cblxuICBwdWxsTWVudUNsaWNrOiAtPlxuICAgIGdpdC5wdWxsKCkudGhlbiA9PiBAdXBkYXRlKHRydWUpXG4gICAgcmV0dXJuXG5cbiAgcHVsbHVwTWVudUNsaWNrOiAtPlxuICAgIGdpdC5wdWxsdXAoKS50aGVuID0+IEB1cGRhdGUodHJ1ZSlcbiAgICByZXR1cm5cblxuICBwdXNoTWVudUNsaWNrOiAtPlxuICAgIGdpdC5nZXRCcmFuY2hlcygpLnRoZW4gKGJyYW5jaGVzKSA9PiAgQHB1c2hEaWFsb2cuYWN0aXZhdGUoYnJhbmNoZXMucmVtb3RlKVxuICAgIHJldHVyblxuXG4gIHB1c2g6IChyZW1vdGUsIGJyYW5jaGVzLCBmb3JjZSkgLT5cbiAgICBnaXQucHVzaChyZW1vdGUsYnJhbmNoZXMsZm9yY2UpLnRoZW4gPT4gQHVwZGF0ZSgpXG5cbiAgcmViYXNlTWVudUNsaWNrOiAtPlxuICAgIGNoZWNrID0gcnVuU2hlbGwoJ2xzIGBnaXQgcmV2LXBhcnNlIC0tZ2l0LWRpcmAgfCBncmVwIHJlYmFzZSB8fCBlY2hvIG5vcmViYXNlJywnbm9yZWJhc2UnKVxuICAgIGlmIGNoZWNrIGlzIHRydWVcbiAgICAgIEByZWJhc2VEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIGVsc2UgaWYgY2hlY2sgaXMgZmFsc2VcbiAgICAgIEBtaWRyZWJhc2VEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIHJlYmFzZTogKGJyYW5jaCkgPT5cbiAgICBnaXQucmViYXNlKGJyYW5jaCkudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICBtaWRyZWJhc2U6IChjb250aW4sIGFib3J0LCBza2lwKSA9PlxuICAgIGdpdC5taWRyZWJhc2UoY29udGluLGFib3J0LHNraXApLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgcmVzZXRNZW51Q2xpY2s6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKClcblxuICAgIGZpbGVzID0gQGZpbGVzVmlldy5nZXRTZWxlY3RlZCgpXG5cbiAgICBhdG9tLmNvbmZpcm1cbiAgICAgIG1lc3NhZ2U6IFwiUmVzZXQgd2lsbCBlcmFzZSBjaGFuZ2VzIHNpbmNlIHRoZSBsYXN0IGNvbW1pdCBpbiB0aGUgc2VsZWN0ZWQgZmlsZXMuIEFyZSB5b3Ugc3VyZT9cIlxuICAgICAgYnV0dG9uczpcbiAgICAgICAgQ2FuY2VsOiA9PlxuICAgICAgICAgIHJldHVyblxuICAgICAgICBSZXNldDogPT5cbiAgICAgICAgICBnaXQucmVzZXQoZmlsZXMuYWxsKS50aGVuID0+IEB1cGRhdGUoKVxuICAgICAgICAgIHJldHVyblxuXG4gIHRhZ01lbnVDbGljazogLT5cbiAgICBAY3JlYXRldGFnRGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICB0YWc6IChuYW1lLCBocmVmLCBtc2cpID0+XG4gICAgZ2l0LnRhZyhuYW1lLCBocmVmLCBtc2cpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG4iXX0=
