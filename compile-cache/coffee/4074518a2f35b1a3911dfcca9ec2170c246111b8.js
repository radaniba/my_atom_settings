(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, SelectListView, experimentalFeaturesEnabled, getUpstreamBranch, git, notifier, _pull, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  PullBranchListView = require('./pull-branch-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  getUpstreamBranch = function(repo) {
    var branch, remote, upstream, _ref1;
    upstream = repo.getUpstreamBranch();
    _ref1 = upstream.substring('refs/remotes/'.length).split('/'), remote = _ref1[0], branch = _ref1[1];
    return {
      remote: remote,
      branch: branch
    };
  };

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data, _arg) {
      var _ref1;
      this.repo = repo;
      this.data = data;
      _ref1 = _arg != null ? _arg : {}, this.mode = _ref1.mode, this.tag = _ref1.tag, this.extraArgs = _ref1.extraArgs;
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
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(_arg) {
      var name;
      name = _arg.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      var branch, remote, _ref1;
      if (experimentalFeaturesEnabled()) {
        _ref1 = getUpstreamBranch(this.repo), remote = _ref1.remote, branch = _ref1.branch;
        return _pull(this.repo, {
          remote: remote,
          branch: branch,
          extraArgs: [this.extraArgs]
        });
      } else {
        return git.cmd(['branch', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new PullBranchListView(_this.repo, data, remoteName, _this.extraArgs).result;
          };
        })(this));
      }
    };

    ListView.prototype.confirmed = function(_arg) {
      var name, pullOption;
      name = _arg.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullOption = atom.config.get('git-plus.pullBeforePush');
        this.extraArgs = (pullOption != null ? pullOption.includes('--rebase') : void 0) ? '--rebase' : '';
        if (!((pullOption != null) && pullOption === 'no')) {
          this.pull(name).then((function(_this) {
            return function() {
              return _this.execute(name);
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

    ListView.prototype.execute = function(remote, extraArgs) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      view = OutputViewManager.create();
      args = [this.mode];
      if (extraArgs.length > 0) {
        args.push(extraArgs);
      }
      args = args.concat([remote, this.tag]).filter(function(arg) {
        return arg !== '';
      });
      message = "" + (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0lBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGlCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FMcEIsQ0FBQTs7QUFBQSxFQU1BLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx5QkFBUixDQU5yQixDQUFBOztBQUFBLEVBUUEsMkJBQUEsR0FBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixVQUFoQixDQUFWLENBQUE7V0FDQSxPQUFPLENBQUMsc0JBQVIsSUFBbUMsT0FBTyxDQUFDLGFBRmY7RUFBQSxDQVI5QixDQUFBOztBQUFBLEVBWUEsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEdBQUE7QUFDbEIsUUFBQSwrQkFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxpQkFBTCxDQUFBLENBQVgsQ0FBQTtBQUFBLElBQ0EsUUFBbUIsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsZUFBZSxDQUFDLE1BQW5DLENBQTBDLENBQUMsS0FBM0MsQ0FBaUQsR0FBakQsQ0FBbkIsRUFBQyxpQkFB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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/views/remote-list-view.coffee
