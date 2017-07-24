(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, PushBranchListView, SelectListView, _pull, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  PullBranchListView = require('./pull-branch-list-view');

  PushBranchListView = require('./push-branch-list-view');

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
        return function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
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
            return new PullBranchListView(_this.repo, data, remoteName, _this.extraArgs).result;
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
              return new PushBranchListView(_this.repo, data, remote, extraArgs).result;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVI7O0VBQ3JCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx5QkFBUjs7RUFFckIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUixFQUFlLElBQWY7QUFDVixVQUFBO01BRFcsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDs0QkFBTyxPQUEwQixJQUF6QixJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxXQUFBLEtBQUssSUFBQyxDQUFBLGlCQUFBO01BQ3hDLDBDQUFBLFNBQUE7O1FBQ0EsSUFBQyxDQUFBLE1BQU87OztRQUNSLElBQUMsQ0FBQSxZQUFhOztNQUNkLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFXLE1BQVg7VUFBQyxLQUFDLENBQUEsVUFBRDtVQUFVLEtBQUMsQ0FBQSxTQUFEO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFOSjs7dUJBUVos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Qjs7OztLQXhHQztBQVZ2QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vbW9kZWxzL19wdWxsJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblB1bGxCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcHVsbC1icmFuY2gtbGlzdC12aWV3J1xuUHVzaEJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9wdXNoLWJyYW5jaC1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwge0Btb2RlLCBAdGFnLCBAZXh0cmFBcmdzfT17fSkgLT5cbiAgICBzdXBlclxuICAgIEB0YWcgPz0gJydcbiAgICBAZXh0cmFBcmdzID89IFtdXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAoQHJlc29sdmUsIEByZWplY3QpID0+XG5cbiAgcGFyc2VEYXRhOiAtPlxuICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIilcbiAgICByZW1vdGVzID0gaXRlbXMuZmlsdGVyKChpdGVtKSAtPiBpdGVtIGlzbnQgJycpLm1hcCAoaXRlbSkgLT4geyBuYW1lOiBpdGVtIH1cbiAgICBpZiByZW1vdGVzLmxlbmd0aCBpcyAxXG4gICAgICBAY29uZmlybWVkIHJlbW90ZXNbMF1cbiAgICBlbHNlXG4gICAgICBAc2V0SXRlbXMgcmVtb3Rlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe25hbWV9KSAtPlxuICAgICQkIC0+XG4gICAgICBAbGkgbmFtZVxuXG4gIHB1bGw6IChyZW1vdGVOYW1lKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnByb21wdEZvckJyYW5jaCcpXG4gICAgICBnaXQuY21kKFsnYnJhbmNoJywgJy0tbm8tY29sb3InLCAnLXInXSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgbmV3IFB1bGxCcmFuY2hMaXN0VmlldyhAcmVwbywgZGF0YSwgcmVtb3RlTmFtZSwgQGV4dHJhQXJncykucmVzdWx0XG4gICAgZWxzZVxuICAgICAgX3B1bGwgQHJlcG8sIGV4dHJhQXJnczogQGV4dHJhQXJnc1xuXG4gIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAncHVsbCdcbiAgICAgIEBwdWxsIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdmZXRjaC1wcnVuZSdcbiAgICAgIEBtb2RlID0gJ2ZldGNoJ1xuICAgICAgQGV4ZWN1dGUgbmFtZSwgJy0tcHJ1bmUnXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCdcbiAgICAgIHB1bGxCZWZvcmVQdXNoID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbEJlZm9yZVB1c2gnKVxuICAgICAgQGV4dHJhQXJncyA9ICctLXJlYmFzZScgaWYgcHVsbEJlZm9yZVB1c2ggYW5kIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxSZWJhc2UnKVxuICAgICAgaWYgcHVsbEJlZm9yZVB1c2hcbiAgICAgICAgQHB1bGwobmFtZSkudGhlbiAoYnJhbmNoKSA9PiBAZXhlY3V0ZSBuYW1lLCBudWxsLCBicmFuY2hcbiAgICAgIGVsc2VcbiAgICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3B1c2ggLXUnXG4gICAgICBAcHVzaEFuZFNldFVwc3RyZWFtIG5hbWVcbiAgICBlbHNlXG4gICAgICBAZXhlY3V0ZSBuYW1lXG4gICAgQGNhbmNlbCgpXG5cbiAgZXhlY3V0ZTogKHJlbW90ZT0nJywgZXh0cmFBcmdzPScnLCBicmFuY2gpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICAgIGlmIGJyYW5jaD9cbiAgICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgICAgIGFyZ3MgPSBbQG1vZGVdXG4gICAgICAgIGlmIGV4dHJhQXJncy5sZW5ndGggPiAwXG4gICAgICAgICAgYXJncy5wdXNoIGV4dHJhQXJnc1xuICAgICAgICBhcmdzID0gYXJncy5jb25jYXQoW3JlbW90ZSwgYnJhbmNoXSlcbiAgICAgICAgbWVzc2FnZSA9IFwiI3tAbW9kZVswXS50b1VwcGVyQ2FzZSgpK0Btb2RlLnN1YnN0cmluZygxKX1pbmcuLi5cIlxuICAgICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgIGVsc2VcbiAgICAgICAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgICAudGhlbiAoZGF0YSkgPT4gbmV3IFB1c2hCcmFuY2hMaXN0VmlldyhAcmVwbywgZGF0YSwgcmVtb3RlLCBleHRyYUFyZ3MpLnJlc3VsdFxuICAgIGVsc2VcbiAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgYXJncyA9IFtAbW9kZV1cbiAgICAgIGlmIGV4dHJhQXJncy5sZW5ndGggPiAwXG4gICAgICAgIGFyZ3MucHVzaCBleHRyYUFyZ3NcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbcmVtb3RlLCBAdGFnXSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgbWVzc2FnZSA9IFwiI3tAbW9kZVswXS50b1VwcGVyQ2FzZSgpK0Btb2RlLnN1YnN0cmluZygxKX1pbmcuLi5cIlxuICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuXG4gIHB1c2hBbmRTZXRVcHN0cmVhbTogKHJlbW90ZT0nJykgLT5cbiAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICBhcmdzID0gWydwdXNoJywgJy11JywgcmVtb3RlLCAnSEVBRCddLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICBtZXNzYWdlID0gXCJQdXNoaW5nLi4uXCJcbiAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
