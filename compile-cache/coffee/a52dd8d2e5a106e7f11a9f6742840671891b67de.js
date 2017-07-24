(function() {
  var RemoteListView, experimentalFeaturesEnabled, getUpstreamBranch, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  getUpstreamBranch = function(repo) {
    var branch, remote, upstream, _ref;
    upstream = repo.getUpstreamBranch();
    _ref = upstream.substring('refs/remotes/'.length).split('/'), remote = _ref[0], branch = _ref[1];
    return {
      remote: remote,
      branch: branch
    };
  };

  module.exports = function(repo, _arg) {
    var branch, extraArgs, rebase, remote, _ref;
    rebase = (_arg != null ? _arg : {}).rebase;
    extraArgs = rebase ? ['--rebase'] : [];
    if (experimentalFeaturesEnabled()) {
      _ref = getUpstreamBranch(repo), remote = _ref.remote, branch = _ref.branch;
      return pull(repo, {
        remote: remote,
        branch: branch,
        extraArgs: extraArgs
      });
    } else {
      return git.cmd(['remote'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return new RemoteListView(repo, data, {
          mode: 'pull',
          extraArgs: extraArgs
        }).result;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1wdWxsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5RUFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsMkJBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUlBLDJCQUFBLEdBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsVUFBaEIsQ0FBVixDQUFBO1dBQ0EsT0FBTyxDQUFDLHNCQUFSLElBQW1DLE9BQU8sQ0FBQyxhQUZmO0VBQUEsQ0FKOUIsQ0FBQTs7QUFBQSxFQVFBLGlCQUFBLEdBQW9CLFNBQUMsSUFBRCxHQUFBO0FBQ2xCLFFBQUEsOEJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsaUJBQUwsQ0FBQSxDQUFYLENBQUE7QUFBQSxJQUNBLE9BQW1CLFFBQVEsQ0FBQyxTQUFULENBQW1CLGVBQWUsQ0FBQyxNQUFuQyxDQUEwQyxDQUFDLEtBQTNDLENBQWlELEdBQWpELENBQW5CLEVBQUMsZ0JBQUQsRUFBUyxnQkFEVCxDQUFBO1dBRUE7QUFBQSxNQUFFLFFBQUEsTUFBRjtBQUFBLE1BQVUsUUFBQSxNQUFWO01BSGtCO0VBQUEsQ0FScEIsQ0FBQTs7QUFBQSxFQWFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUNmLFFBQUEsdUNBQUE7QUFBQSxJQUR1Qix5QkFBRCxPQUFTLElBQVIsTUFDdkIsQ0FBQTtBQUFBLElBQUEsU0FBQSxHQUFlLE1BQUgsR0FBZSxDQUFDLFVBQUQsQ0FBZixHQUFpQyxFQUE3QyxDQUFBO0FBQ0EsSUFBQSxJQUFHLDJCQUFBLENBQUEsQ0FBSDtBQUNFLE1BQUEsT0FBbUIsaUJBQUEsQ0FBa0IsSUFBbEIsQ0FBbkIsRUFBQyxjQUFBLE1BQUQsRUFBUyxjQUFBLE1BQVQsQ0FBQTthQUNBLElBQUEsQ0FBSyxJQUFMLEVBQVc7QUFBQSxRQUFDLFFBQUEsTUFBRDtBQUFBLFFBQVMsUUFBQSxNQUFUO0FBQUEsUUFBaUIsV0FBQSxTQUFqQjtPQUFYLEVBRkY7S0FBQSxNQUFBO2FBSUUsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsQ0FBUixFQUFvQjtBQUFBLFFBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBcEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQsR0FBQTtlQUFVLEdBQUEsQ0FBQSxjQUFJLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQjtBQUFBLFVBQUEsSUFBQSxFQUFNLE1BQU47QUFBQSxVQUFjLFNBQUEsRUFBVyxTQUF6QjtTQUEzQixDQUE4RCxDQUFDLE9BQTdFO01BQUEsQ0FETixFQUpGO0tBRmU7RUFBQSxDQWJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/models/git-pull.coffee
