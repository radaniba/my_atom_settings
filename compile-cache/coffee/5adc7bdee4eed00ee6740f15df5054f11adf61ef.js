(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var branch, branchInfo, ref, remote;
    branchInfo = (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
    remote = branchInfo[0];
    branch = branchInfo.slice(1).join('/');
    return [remote, branch];
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (extraArgs == null) {
      extraArgs = [];
    }
    view = OutputViewManager.create();
    startMessage = notifier.addInfo("Pulling...", {
      dismissable: true
    });
    args = ['pull'].concat(extraArgs).concat(getUpstream(repo)).filter(emptyOrUndefined);
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    }).then(function(data) {
      view.setContent(data).finish();
      return startMessage.dismiss();
    })["catch"](function(error) {
      view.setContent(error).finish();
      return startMessage.dismiss();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL19wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLGdCQUFBLEdBQW1CLFNBQUMsS0FBRDtXQUFXLEtBQUEsS0FBVyxFQUFYLElBQWtCLEtBQUEsS0FBVztFQUF4Qzs7RUFFbkIsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFFBQUE7SUFBQSxVQUFBLGlEQUFxQyxDQUFFLFNBQTFCLENBQW9DLGVBQWUsQ0FBQyxNQUFwRCxDQUEyRCxDQUFDLEtBQTVELENBQWtFLEdBQWxFO0lBQ2IsTUFBQSxHQUFTLFVBQVcsQ0FBQSxDQUFBO0lBQ3BCLE1BQUEsR0FBUyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixDQUFtQixDQUFDLElBQXBCLENBQXlCLEdBQXpCO1dBQ1QsQ0FBQyxNQUFELEVBQVMsTUFBVDtFQUpZOztFQU1kLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLDJCQUFELE1BQVk7O01BQ2xDLFlBQWE7O0lBQ2IsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7SUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7TUFBQSxXQUFBLEVBQWEsSUFBYjtLQUEvQjtJQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxXQUFBLENBQVksSUFBWixDQUFsQyxDQUFvRCxDQUFDLE1BQXJELENBQTRELGdCQUE1RDtXQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxFQUErQztNQUFDLEtBQUEsRUFBTyxJQUFSO0tBQS9DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO01BQ0osSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2FBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtJQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtNQUNMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTthQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7SUFGSyxDQUpQO0VBTGU7QUFaakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5lbXB0eU9yVW5kZWZpbmVkID0gKHRoaW5nKSAtPiB0aGluZyBpc250ICcnIGFuZCB0aGluZyBpc250IHVuZGVmaW5lZFxuXG5nZXRVcHN0cmVhbSA9IChyZXBvKSAtPlxuICBicmFuY2hJbmZvID0gcmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpPy5zdWJzdHJpbmcoJ3JlZnMvcmVtb3Rlcy8nLmxlbmd0aCkuc3BsaXQoJy8nKVxuICByZW1vdGUgPSBicmFuY2hJbmZvWzBdXG4gIGJyYW5jaCA9IGJyYW5jaEluZm8uc2xpY2UoMSkuam9pbignLycpXG4gIFtyZW1vdGUsIGJyYW5jaF1cblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2V4dHJhQXJnc309e30pIC0+XG4gIGV4dHJhQXJncyA/PSBbXVxuICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1bGxpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgYXJncyA9IFsncHVsbCddLmNvbmNhdChleHRyYUFyZ3MpLmNvbmNhdChnZXRVcHN0cmVhbShyZXBvKSkuZmlsdGVyKGVtcHR5T3JVbmRlZmluZWQpXG4gIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgLnRoZW4gKGRhdGEpIC0+XG4gICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
