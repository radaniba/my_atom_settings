(function() {
  var $$, ListView, OutputViewManager, RemoteBranchListView, SelectListView, _pull, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  RemoteBranchListView = require('./remote-branch-list-view');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, arg1) {
      var ref1;
      this.repo = repo;
      this.data = data1;
      ref1 = arg1 != null ? arg1 : {}, this.mode = ref1.mode, this.tag = ref1.tag, this.extraArgs = ref1.extraArgs;
      ListView.__super__.initialize.apply(this, arguments);
      if (this.tag == null) {
        this.tag = '';
      }
      if (this.extraArgs == null) {
        this.extraArgs = [];
      }
      this.show();
      this.parseData();
      return this.result = new Promise((function(_this) {
        return function(resolve1, reject1) {
          _this.resolve = resolve1;
          _this.reject = reject1;
        };
      })(this));
    };

    ListView.prototype.parseData = function() {
      var items, remotes;
      items = this.data.split("\n");
      remotes = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item
        };
      });
      if (remotes.length === 1) {
        return this.confirmed(remotes[0]);
      } else {
        this.setItems(remotes);
        return this.focusFilterEditor();
      }
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg1) {
      var name;
      name = arg1.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        return git.cmd(['branch', '--no-color', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new Promise(function(resolve, reject) {
              return new RemoteBranchListView(data, remoteName, function(arg1) {
                var args, branchName, name, startMessage, view;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.create();
                startMessage = notifier.addInfo("Pulling...", {
                  dismissable: true
                });
                args = ['pull'].concat(_this.extraArgs, remoteName, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: _this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then(function(data) {
                  resolve(branchName);
                  view.setContent(data).finish();
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  reject();
                  view.setContent(error).finish();
                  return startMessage.dismiss();
                });
              });
            });
          };
        })(this));
      } else {
        return _pull(this.repo, {
          extraArgs: this.extraArgs
        });
      }
    };

    ListView.prototype.confirmed = function(arg1) {
      var name, pullBeforePush;
      name = arg1.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullBeforePush = atom.config.get('git-plus.remoteInteractions.pullBeforePush');
        if (pullBeforePush && atom.config.get('git-plus.remoteInteractions.pullRebase')) {
          this.extraArgs = '--rebase';
        }
        if (pullBeforePush) {
          this.pull(name).then((function(_this) {
            return function(branch) {
              return _this.execute(name, null, branch);
            };
          })(this));
        } else {
          this.execute(name);
        }
      } else if (this.mode === 'push -u') {
        this.pushAndSetUpstream(name);
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs, branch) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        if (branch != null) {
          view = OutputViewManager.create();
          args = [this.mode];
          if (extraArgs.length > 0) {
            args.push(extraArgs);
          }
          args = args.concat([remote, branch]);
          message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
          startMessage = notifier.addInfo(message, {
            dismissable: true
          });
          return git.cmd(args, {
            cwd: this.repo.getWorkingDirectory()
          }, {
            color: true
          }).then((function(_this) {
            return function(data) {
              if (data !== '') {
                view.setContent(data).finish();
              }
              startMessage.dismiss();
              return git.refresh(_this.repo);
            };
          })(this))["catch"]((function(_this) {
            return function(data) {
              if (data !== '') {
                view.setContent(data).finish();
              }
              return startMessage.dismiss();
            };
          })(this));
        } else {
          return git.cmd(['branch', '--no-color', '-r'], {
            cwd: this.repo.getWorkingDirectory()
          }).then((function(_this) {
            return function(data) {
              return new RemoteBranchListView(data, remote, function(arg1) {
                var branchName, name;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.create();
                startMessage = notifier.addInfo("Pushing...", {
                  dismissable: true
                });
                args = ['push'].concat(extraArgs, remote, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then((function(_this) {
                  return function(data) {
                    view.setContent(data).finish();
                    startMessage.dismiss();
                    return git.refresh(_this.repo);
                  };
                })(this))["catch"]((function(_this) {
                  return function(error) {
                    view.setContent(error).finish();
                    return startMessage.dismiss();
                  };
                })(this));
              });
            };
          })(this));
        }
      } else {
        view = OutputViewManager.create();
        args = [this.mode];
        if (extraArgs.length > 0) {
          args.push(extraArgs);
        }
        args = args.concat([remote, this.tag]).filter(function(arg) {
          return arg !== '';
        });
        message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
        startMessage = notifier.addInfo(message, {
          dismissable: true
        });
        return git.cmd(args, {
          cwd: this.repo.getWorkingDirectory()
        }, {
          color: true
        }).then((function(_this) {
          return function(data) {
            if (data !== '') {
              view.setContent(data).finish();
            }
            startMessage.dismiss();
            return git.refresh(_this.repo);
          };
        })(this))["catch"]((function(_this) {
          return function(data) {
            if (data !== '') {
              view.setContent(data).finish();
            }
            return startMessage.dismiss();
          };
        })(this));
      }
    };

    ListView.prototype.pushAndSetUpstream = function(remote) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      view = OutputViewManager.create();
      args = ['push', '-u', remote, 'HEAD'].filter(function(arg) {
        return arg !== '';
      });
      message = "Pushing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdHQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixvQkFBQSxHQUF1QixPQUFBLENBQVEsMkJBQVI7O0VBRXZCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7dUJBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxJQUFmO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7NEJBQU8sT0FBMEIsSUFBekIsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsV0FBQSxLQUFLLElBQUMsQ0FBQSxpQkFBQTtNQUN4QywwQ0FBQSxTQUFBOztRQUNBLElBQUMsQ0FBQSxNQUFPOzs7UUFDUixJQUFDLENBQUEsWUFBYTs7TUFDZCxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQsRUFBVyxPQUFYO1VBQUMsS0FBQyxDQUFBLFVBQUQ7VUFBVSxLQUFDLENBQUEsU0FBRDtRQUFYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBTko7O3VCQVFaLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaO01BQ1IsT0FBQSxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBQyxJQUFEO2VBQVUsSUFBQSxLQUFVO01BQXBCLENBQWIsQ0FBb0MsQ0FBQyxHQUFyQyxDQUF5QyxTQUFDLElBQUQ7ZUFBVTtVQUFFLElBQUEsRUFBTSxJQUFSOztNQUFWLENBQXpDO01BQ1YsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQjtlQUNFLElBQUMsQ0FBQSxTQUFELENBQVcsT0FBUSxDQUFBLENBQUEsQ0FBbkIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVY7ZUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUpGOztJQUhTOzt1QkFTWCxZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O3VCQUVkLElBQUEsR0FBTSxTQUFBOztRQUNKLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFISTs7dUJBS04sU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBQUg7O3VCQUVYLElBQUEsR0FBTSxTQUFBO0FBQUcsVUFBQTsrQ0FBTSxDQUFFLE9BQVIsQ0FBQTtJQUFIOzt1QkFFTixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1gsVUFBQTtNQURhLE9BQUQ7YUFDWixFQUFBLENBQUcsU0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksSUFBSjtNQURDLENBQUg7SUFEVzs7dUJBSWIsSUFBQSxHQUFNLFNBQUMsVUFBRDtNQUNKLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQixDQUFIO2VBQ0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxZQUFYLEVBQXlCLElBQXpCLENBQVIsRUFBd0M7VUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7U0FBeEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7bUJBQ0EsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtxQkFDTixJQUFBLG9CQUFBLENBQXFCLElBQXJCLEVBQTJCLFVBQTNCLEVBQXVDLFNBQUMsSUFBRDtBQUN6QyxvQkFBQTtnQkFEMkMsT0FBRDtnQkFDMUMsVUFBQSxHQUFhLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQUEsR0FBb0IsQ0FBbkM7Z0JBQ2IsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7Z0JBQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO2tCQUFBLFdBQUEsRUFBYSxJQUFiO2lCQUEvQjtnQkFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxTQUFqQixFQUE0QixVQUE1QixFQUF3QyxVQUF4QyxDQUFtRCxDQUFDLE1BQXBELENBQTJELFNBQUMsR0FBRDt5QkFBUyxHQUFBLEtBQVM7Z0JBQWxCLENBQTNEO3VCQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO2tCQUFBLEdBQUEsRUFBSyxLQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtpQkFBZCxFQUFnRDtrQkFBQyxLQUFBLEVBQU8sSUFBUjtpQkFBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7a0JBQ0osT0FBQSxDQUFRLFVBQVI7a0JBQ0EsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2tCQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7eUJBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtnQkFKSSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxTQUFDLEtBQUQ7a0JBQ0wsTUFBQSxDQUFBO2tCQUNBLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTt5QkFDQSxZQUFZLENBQUMsT0FBYixDQUFBO2dCQUhLLENBTlA7Y0FMeUMsQ0FBdkM7WUFETSxDQUFSO1VBREE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sRUFERjtPQUFBLE1BQUE7ZUFvQkUsS0FBQSxDQUFNLElBQUMsQ0FBQSxJQUFQLEVBQWE7VUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBQVo7U0FBYixFQXBCRjs7SUFESTs7dUJBdUJOLFNBQUEsR0FBVyxTQUFDLElBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxNQUFaO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBREY7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxhQUFaO1FBQ0gsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQUFlLFNBQWYsRUFGRztPQUFBLE1BR0EsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLE1BQVo7UUFDSCxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0Q0FBaEI7UUFDakIsSUFBMkIsY0FBQSxJQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQTlDO1VBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxXQUFiOztRQUNBLElBQUcsY0FBSDtVQUNFLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixDQUFXLENBQUMsSUFBWixDQUFpQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLE1BQUQ7cUJBQVksS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsSUFBZixFQUFxQixNQUFyQjtZQUFaO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQURGO1NBQUEsTUFBQTtVQUdFLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQUhGO1NBSEc7T0FBQSxNQU9BLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxTQUFaO1FBQ0gsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBREc7T0FBQSxNQUFBO1FBR0gsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBSEc7O2FBSUwsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQWpCUzs7dUJBbUJYLE9BQUEsR0FBUyxTQUFDLE1BQUQsRUFBWSxTQUFaLEVBQTBCLE1BQTFCO0FBQ1AsVUFBQTs7UUFEUSxTQUFPOzs7UUFBSSxZQUFVOztNQUM3QixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2Q0FBaEIsQ0FBSDtRQUNFLElBQUcsY0FBSDtVQUNFLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO1VBQ1AsSUFBQSxHQUFPLENBQUMsSUFBQyxDQUFBLElBQUY7VUFDUCxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO1lBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBREY7O1VBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFaO1VBQ1AsT0FBQSxHQUFZLENBQUMsSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFULENBQUEsQ0FBQSxHQUF1QixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBeEIsQ0FBQSxHQUEyQztVQUN2RCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEI7WUFBQSxXQUFBLEVBQWEsSUFBYjtXQUExQjtpQkFDZixHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztZQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtXQUFkLEVBQWdEO1lBQUMsS0FBQSxFQUFPLElBQVI7V0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Y0FDSixJQUFHLElBQUEsS0FBVSxFQUFiO2dCQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxFQURGOztjQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7cUJBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtZQUpJO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7Y0FDTCxJQUFHLElBQUEsS0FBVSxFQUFiO2dCQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxFQURGOztxQkFFQSxZQUFZLENBQUMsT0FBYixDQUFBO1lBSEs7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlAsRUFSRjtTQUFBLE1BQUE7aUJBbUJFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELEVBQVcsWUFBWCxFQUF5QixJQUF6QixDQUFSLEVBQXdDO1lBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO1dBQXhDLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxJQUFEO3FCQUNBLElBQUEsb0JBQUEsQ0FBcUIsSUFBckIsRUFBMkIsTUFBM0IsRUFBbUMsU0FBQyxJQUFEO0FBQ3JDLG9CQUFBO2dCQUR1QyxPQUFEO2dCQUN0QyxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxHQUFvQixDQUFuQztnQkFDYixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtnQkFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7a0JBQUEsV0FBQSxFQUFhLElBQWI7aUJBQS9CO2dCQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsRUFBMkIsTUFBM0IsRUFBbUMsVUFBbkMsQ0FBOEMsQ0FBQyxNQUEvQyxDQUFzRCxTQUFDLEdBQUQ7eUJBQVMsR0FBQSxLQUFTO2dCQUFsQixDQUF0RDt1QkFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztrQkFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7aUJBQWQsRUFBZ0Q7a0JBQUMsS0FBQSxFQUFPLElBQVI7aUJBQWhELENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7eUJBQUEsU0FBQyxJQUFEO29CQUNKLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQTtvQkFDQSxZQUFZLENBQUMsT0FBYixDQUFBOzJCQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7a0JBSEk7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxDQUFBLFNBQUEsS0FBQTt5QkFBQSxTQUFDLEtBQUQ7b0JBQ0wsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBOzJCQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7a0JBRks7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO2NBTHFDLENBQW5DO1lBREE7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sRUFuQkY7U0FERjtPQUFBLE1BQUE7UUFvQ0UsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7UUFDUCxJQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsSUFBRjtRQUNQLElBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7VUFDRSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFERjs7UUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBWSxDQUFDLE1BQUQsRUFBUyxJQUFDLENBQUEsR0FBVixDQUFaLENBQTJCLENBQUMsTUFBNUIsQ0FBbUMsU0FBQyxHQUFEO2lCQUFTLEdBQUEsS0FBUztRQUFsQixDQUFuQztRQUNQLE9BQUEsR0FBWSxDQUFDLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBdUIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQXhCLENBQUEsR0FBMkM7UUFDdkQsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBQTBCO1VBQUEsV0FBQSxFQUFhLElBQWI7U0FBMUI7ZUFDZixHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztVQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtTQUFkLEVBQWdEO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7WUFDSixJQUFHLElBQUEsS0FBVSxFQUFiO2NBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLEVBREY7O1lBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTttQkFDQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQUMsQ0FBQSxJQUFiO1VBSkk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sQ0FNQSxFQUFDLEtBQUQsRUFOQSxDQU1PLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsSUFBRDtZQUNMLElBQUcsSUFBQSxLQUFVLEVBQWI7Y0FDRSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUEsRUFERjs7bUJBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTtVQUhLO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5QLEVBM0NGOztJQURPOzt1QkF1RFQsa0JBQUEsR0FBb0IsU0FBQyxNQUFEO0FBQ2xCLFVBQUE7O1FBRG1CLFNBQU87O01BQzFCLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO01BQ1AsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmLEVBQXVCLE1BQXZCLENBQThCLENBQUMsTUFBL0IsQ0FBc0MsU0FBQyxHQUFEO2VBQVMsR0FBQSxLQUFTO01BQWxCLENBQXRDO01BQ1AsT0FBQSxHQUFVO01BQ1YsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBQTBCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBMUI7YUFDZixHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUFkLEVBQWdEO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7UUFDSixJQUFHLElBQUEsS0FBVSxFQUFiO1VBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLEVBREY7O2VBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUhJLENBRE4sQ0FLQSxFQUFDLEtBQUQsRUFMQSxDQUtPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0wsSUFBRyxJQUFBLEtBQVUsRUFBYjtZQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxFQURGOztpQkFFQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSEs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFA7SUFMa0I7Ozs7S0FsSUM7QUFUdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5fcHVsbCA9IHJlcXVpcmUgJy4uL21vZGVscy9fcHVsbCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5SZW1vdGVCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcmVtb3RlLWJyYW5jaC1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwge0Btb2RlLCBAdGFnLCBAZXh0cmFBcmdzfT17fSkgLT5cbiAgICBzdXBlclxuICAgIEB0YWcgPz0gJydcbiAgICBAZXh0cmFBcmdzID89IFtdXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAoQHJlc29sdmUsIEByZWplY3QpID0+XG5cbiAgcGFyc2VEYXRhOiAtPlxuICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIilcbiAgICByZW1vdGVzID0gaXRlbXMuZmlsdGVyKChpdGVtKSAtPiBpdGVtIGlzbnQgJycpLm1hcCAoaXRlbSkgLT4geyBuYW1lOiBpdGVtIH1cbiAgICBpZiByZW1vdGVzLmxlbmd0aCBpcyAxXG4gICAgICBAY29uZmlybWVkIHJlbW90ZXNbMF1cbiAgICBlbHNlXG4gICAgICBAc2V0SXRlbXMgcmVtb3Rlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSBuYW1lXG5cbiAgcHVsbDogKHJlbW90ZU5hbWUpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIG5ldyBSZW1vdGVCcmFuY2hMaXN0VmlldyBkYXRhLCByZW1vdGVOYW1lLCAoe25hbWV9KSA9PlxuICAgICAgICAgICAgYnJhbmNoTmFtZSA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1bGxpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoQGV4dHJhQXJncywgcmVtb3RlTmFtZSwgYnJhbmNoTmFtZSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgICAgICByZXNvbHZlIGJyYW5jaE5hbWVcbiAgICAgICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgIHJlamVjdCgpXG4gICAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIGVsc2VcbiAgICAgIF9wdWxsIEByZXBvLCBleHRyYUFyZ3M6IEBleHRyYUFyZ3NcblxuICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3B1bGwnXG4gICAgICBAcHVsbCBuYW1lXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAnZmV0Y2gtcHJ1bmUnXG4gICAgICBAbW9kZSA9ICdmZXRjaCdcbiAgICAgIEBleGVjdXRlIG5hbWUsICctLXBydW5lJ1xuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3B1c2gnXG4gICAgICBwdWxsQmVmb3JlUHVzaCA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxCZWZvcmVQdXNoJylcbiAgICAgIEBleHRyYUFyZ3MgPSAnLS1yZWJhc2UnIGlmIHB1bGxCZWZvcmVQdXNoIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsUmViYXNlJylcbiAgICAgIGlmIHB1bGxCZWZvcmVQdXNoXG4gICAgICAgIEBwdWxsKG5hbWUpLnRoZW4gKGJyYW5jaCkgPT4gQGV4ZWN1dGUgbmFtZSwgbnVsbCwgYnJhbmNoXG4gICAgICBlbHNlXG4gICAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdwdXNoIC11J1xuICAgICAgQHB1c2hBbmRTZXRVcHN0cmVhbSBuYW1lXG4gICAgZWxzZVxuICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIEBjYW5jZWwoKVxuXG4gIGV4ZWN1dGU6IChyZW1vdGU9JycsIGV4dHJhQXJncz0nJywgYnJhbmNoKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnByb21wdEZvckJyYW5jaCcpXG4gICAgICBpZiBicmFuY2g/XG4gICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgICBhcmdzID0gW0Btb2RlXVxuICAgICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICAgIGFyZ3MucHVzaCBleHRyYUFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtyZW1vdGUsIGJyYW5jaF0pXG4gICAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgbmV3IFJlbW90ZUJyYW5jaExpc3RWaWV3IGRhdGEsIHJlbW90ZSwgKHtuYW1lfSkgLT5cbiAgICAgICAgICAgIGJyYW5jaE5hbWUgPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgICAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdXNoaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBhcmdzID0gWydwdXNoJ10uY29uY2F0KGV4dHJhQXJncywgcmVtb3RlLCBicmFuY2hOYW1lKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAgICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICBlbHNlXG4gICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgIGFyZ3MgPSBbQG1vZGVdXG4gICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICBhcmdzLnB1c2ggZXh0cmFBcmdzXG4gICAgICBhcmdzID0gYXJncy5jb25jYXQoW3JlbW90ZSwgQHRhZ10pLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcblxuICBwdXNoQW5kU2V0VXBzdHJlYW06IChyZW1vdGU9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgYXJncyA9IFsncHVzaCcsICctdScsIHJlbW90ZSwgJ0hFQUQnXS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgbWVzc2FnZSA9IFwiUHVzaGluZy4uLlwiXG4gICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
