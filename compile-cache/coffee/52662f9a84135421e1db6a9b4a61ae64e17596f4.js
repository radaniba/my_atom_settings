(function() {
  var BranchListView, OutputViewManager, PullBranchListView, branchFilter, git, notifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  branchFilter = function(item) {
    return item !== '' && item.indexOf('origin/HEAD') < 0;
  };

  module.exports = PullBranchListView = (function(_super) {
    __extends(PullBranchListView, _super);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data, remote, extraArgs) {
      this.repo = repo;
      this.data = data;
      this.remote = remote;
      this.extraArgs = extraArgs;
      PullBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PullBranchListView.prototype.parseData = function() {
      var branches, currentBranch, items;
      this.currentBranchString = '== Current ==';
      currentBranch = {
        name: this.currentBranchString
      };
      items = this.data.split("\n");
      branches = items.filter(branchFilter).map(function(item) {
        return {
          name: item.replace(/\s/g, '')
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems([currentBranch].concat(branches));
      }
      return this.focusFilterEditor();
    };

    PullBranchListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      if (name === this.currentBranchString) {
        this.pull();
      } else {
        this.pull(name.substring(name.indexOf('/') + 1));
      }
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var args, startMessage, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve();
          view.setContent(data).finish();
          return startMessage.dismiss();
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQURwQixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBSGpCLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7V0FBVSxJQUFBLEtBQVUsRUFBVixJQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLGFBQWIsQ0FBQSxHQUE4QixFQUF6RDtFQUFBLENBTGYsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBR1E7QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsaUNBQUEsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFTLElBQVQsRUFBZ0IsTUFBaEIsRUFBeUIsU0FBekIsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE9BQUEsSUFDWixDQUFBO0FBQUEsTUFEa0IsSUFBQyxDQUFBLE9BQUEsSUFDbkIsQ0FBQTtBQUFBLE1BRHlCLElBQUMsQ0FBQSxTQUFBLE1BQzFCLENBQUE7QUFBQSxNQURrQyxJQUFDLENBQUEsWUFBQSxTQUNuQyxDQUFBO0FBQUEsTUFBQSxvREFBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FB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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/views/pull-branch-list-view.coffee
