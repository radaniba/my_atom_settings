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
    if (!branchInfo) {
      return null;
    }
    remote = branchInfo[0];
    branch = branchInfo.slice(1).join('/');
    return [remote, branch];
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, upstream, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (upstream = getUpstream(repo)) {
      if (extraArgs == null) {
        extraArgs = [];
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(extraArgs).concat(upstream).filter(emptyOrUndefined);
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
    } else {
      return notifier.addInfo('The current branch is not tracking from upstream');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL19wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLGdCQUFBLEdBQW1CLFNBQUMsS0FBRDtXQUFXLEtBQUEsS0FBVyxFQUFYLElBQWtCLEtBQUEsS0FBVztFQUF4Qzs7RUFFbkIsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFFBQUE7SUFBQSxVQUFBLGlEQUFxQyxDQUFFLFNBQTFCLENBQW9DLGVBQWUsQ0FBQyxNQUFwRCxDQUEyRCxDQUFDLEtBQTVELENBQWtFLEdBQWxFO0lBQ2IsSUFBZSxDQUFJLFVBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLE1BQUEsR0FBUyxVQUFXLENBQUEsQ0FBQTtJQUNwQixNQUFBLEdBQVMsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixHQUF6QjtXQUNULENBQUMsTUFBRCxFQUFTLE1BQVQ7RUFMWTs7RUFPZCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1QiwyQkFBRCxNQUFZO0lBQ2xDLElBQUcsUUFBQSxHQUFXLFdBQUEsQ0FBWSxJQUFaLENBQWQ7O1FBQ0UsWUFBYTs7TUFDYixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtNQUNQLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixZQUFqQixFQUErQjtRQUFBLFdBQUEsRUFBYSxJQUFiO09BQS9CO01BQ2YsSUFBQSxHQUFPLENBQUMsTUFBRCxDQUFRLENBQUMsTUFBVCxDQUFnQixTQUFoQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFFBQWxDLENBQTJDLENBQUMsTUFBNUMsQ0FBbUQsZ0JBQW5EO2FBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUFkLEVBQStDO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBL0MsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7UUFDSixJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7ZUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO01BRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO1FBQ0wsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBO2VBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUZLLENBSlAsRUFMRjtLQUFBLE1BQUE7YUFhRSxRQUFRLENBQUMsT0FBVCxDQUFpQixrREFBakIsRUFiRjs7RUFEZTtBQWJqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbmVtcHR5T3JVbmRlZmluZWQgPSAodGhpbmcpIC0+IHRoaW5nIGlzbnQgJycgYW5kIHRoaW5nIGlzbnQgdW5kZWZpbmVkXG5cbmdldFVwc3RyZWFtID0gKHJlcG8pIC0+XG4gIGJyYW5jaEluZm8gPSByZXBvLmdldFVwc3RyZWFtQnJhbmNoKCk/LnN1YnN0cmluZygncmVmcy9yZW1vdGVzLycubGVuZ3RoKS5zcGxpdCgnLycpXG4gIHJldHVybiBudWxsIGlmIG5vdCBicmFuY2hJbmZvXG4gIHJlbW90ZSA9IGJyYW5jaEluZm9bMF1cbiAgYnJhbmNoID0gYnJhbmNoSW5mby5zbGljZSgxKS5qb2luKCcvJylcbiAgW3JlbW90ZSwgYnJhbmNoXVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZXh0cmFBcmdzfT17fSkgLT5cbiAgaWYgdXBzdHJlYW0gPSBnZXRVcHN0cmVhbShyZXBvKVxuICAgIGV4dHJhQXJncyA/PSBbXVxuICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgYXJncyA9IFsncHVsbCddLmNvbmNhdChleHRyYUFyZ3MpLmNvbmNhdCh1cHN0cmVhbSkuZmlsdGVyKGVtcHR5T3JVbmRlZmluZWQpXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gJ1RoZSBjdXJyZW50IGJyYW5jaCBpcyBub3QgdHJhY2tpbmcgZnJvbSB1cHN0cmVhbSdcbiJdfQ==
