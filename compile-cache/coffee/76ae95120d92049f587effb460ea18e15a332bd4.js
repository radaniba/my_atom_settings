(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteLocalBranch, GitDeleteRemoteBranch, GitDiff, GitDiffAll, GitDifftool, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles;
    GitBranch = require('./models/git-branch');
    GitDeleteLocalBranch = require('./models/git-delete-local-branch.coffee');
    GitDeleteRemoteBranch = require('./models/git-delete-remote-branch.coffee');
    GitCheckoutAllFiles = require('./models/git-checkout-all-files');
    GitCheckoutCurrentFile = require('./models/git-checkout-current-file');
    GitCherryPick = require('./models/git-cherry-pick');
    GitCommit = require('./models/git-commit');
    GitCommitAmend = require('./models/git-commit-amend');
    GitDiff = require('./models/git-diff');
    GitDifftool = require('./models/git-difftool');
    GitDiffAll = require('./models/git-diff-all');
    GitFetch = require('./models/git-fetch');
    GitFetchPrune = require('./models/git-fetch-prune.coffee');
    GitInit = require('./models/git-init');
    GitLog = require('./models/git-log');
    GitPull = require('./models/git-pull');
    GitPush = require('./models/git-push');
    GitRemove = require('./models/git-remove');
    GitShow = require('./models/git-show');
    GitStageFiles = require('./models/git-stage-files');
    GitStageHunk = require('./models/git-stage-hunk');
    GitStashApply = require('./models/git-stash-apply');
    GitStashDrop = require('./models/git-stash-drop');
    GitStashPop = require('./models/git-stash-pop');
    GitStashSave = require('./models/git-stash-save');
    GitStashSaveMessage = require('./models/git-stash-save-message');
    GitStatus = require('./models/git-status');
    GitTags = require('./models/git-tags');
    GitUnstageFiles = require('./models/git-unstage-files');
    GitRun = require('./models/git-run');
    GitMerge = require('./models/git-merge');
    GitRebase = require('./models/git-rebase');
    GitOpenChangedFiles = require('./models/git-open-changed-files');
    return git.getRepo().then(function(repo) {
      var commands, currentFile, _ref;
      currentFile = repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
      git.refresh(repo);
      commands = [];
      commands.push([
        'git-plus:add', 'Add', function() {
          return git.add(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:add-modified', 'Add Modified', function() {
          return git.add(repo, {
            update: true
          });
        }
      ]);
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return git.add(repo);
        }
      ]);
      commands.push([
        'git-plus:log', 'Log', function() {
          return GitLog(repo);
        }
      ]);
      commands.push([
        'git-plus:log-current-file', 'Log Current File', function() {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove-current-file', 'Remove Current File', function() {
          return GitRemove(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-all-files', 'Checkout All Files', function() {
          return GitCheckoutAllFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-current-file', 'Checkout Current File', function() {
          return GitCheckoutCurrentFile(repo);
        }
      ]);
      commands.push([
        'git-plus:commit', 'Commit', function() {
          return GitCommit(repo);
        }
      ]);
      commands.push([
        'git-plus:commit-all', 'Commit All', function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        }
      ]);
      commands.push([
        'git-plus:commit-amend', 'Commit Amend', function() {
          return GitCommitAmend(repo);
        }
      ]);
      commands.push([
        'git-plus:add-and-commit', 'Add And Commit', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-and-commit-and-push', 'Add And Commit And Push', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-and-commit', 'Add All And Commit', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-commit-and-push', 'Add All, Commit And Push', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:commit-all-and-push', 'Commit All And Push', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              stageChanges: true,
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:checkout', 'Checkout', function() {
          return GitBranch.gitBranches(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-remote', 'Checkout Remote', function() {
          return GitBranch.gitRemoteBranches(repo);
        }
      ]);
      commands.push([
        'git-plus:new-branch', 'Checkout New Branch', function() {
          return GitBranch.newBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-local-branch', 'Delete Local Branch', function() {
          return GitDeleteLocalBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-remote-branch', 'Delete Remote Branch', function() {
          return GitDeleteRemoteBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:cherry-pick', 'Cherry-Pick', function() {
          return GitCherryPick(repo);
        }
      ]);
      commands.push([
        'git-plus:diff', 'Diff', function() {
          return GitDiff(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:difftool', 'Difftool', function() {
          return GitDifftool(repo);
        }
      ]);
      commands.push([
        'git-plus:diff-all', 'Diff All', function() {
          return GitDiffAll(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch', 'Fetch', function() {
          return GitFetch(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch-prune', 'Fetch Prune', function() {
          return GitFetchPrune(repo);
        }
      ]);
      commands.push([
        'git-plus:pull', 'Pull', function() {
          return GitPull(repo);
        }
      ]);
      commands.push([
        'git-plus:pull-using-rebase', 'Pull Using Rebase', function() {
          return GitPull(repo, {
            rebase: true
          });
        }
      ]);
      commands.push([
        'git-plus:push', 'Push', function() {
          return GitPush(repo);
        }
      ]);
      commands.push([
        'git-plus:push-set-upstream', 'Push -u', function() {
          return GitPush(repo, {
            setUpstream: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove', 'Remove', function() {
          return GitRemove(repo, {
            showSelector: true
          });
        }
      ]);
      commands.push([
        'git-plus:reset', 'Reset HEAD', function() {
          return git.reset(repo);
        }
      ]);
      commands.push([
        'git-plus:show', 'Show', function() {
          return GitShow(repo);
        }
      ]);
      commands.push([
        'git-plus:stage-files', 'Stage Files', function() {
          return GitStageFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:unstage-files', 'Unstage Files', function() {
          return GitUnstageFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:stage-hunk', 'Stage Hunk', function() {
          return GitStageHunk(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save', 'Stash: Save Changes', function() {
          return GitStashSave(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save-message', 'Stash: Save Changes With Message', function() {
          return GitStashSaveMessage(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-pop', 'Stash: Apply (Pop)', function() {
          return GitStashPop(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-apply', 'Stash: Apply (Keep)', function() {
          return GitStashApply(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-delete', 'Stash: Delete (Drop)', function() {
          return GitStashDrop(repo);
        }
      ]);
      commands.push([
        'git-plus:status', 'Status', function() {
          return GitStatus(repo);
        }
      ]);
      commands.push([
        'git-plus:tags', 'Tags', function() {
          return GitTags(repo);
        }
      ]);
      commands.push([
        'git-plus:run', 'Run', function() {
          return new GitRun(repo);
        }
      ]);
      commands.push([
        'git-plus:merge', 'Merge', function() {
          return GitMerge(repo);
        }
      ]);
      commands.push([
        'git-plus:merge-remote', 'Merge Remote', function() {
          return GitMerge(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:merge-no-fast-forward', 'Merge without fast-forward', function() {
          return GitMerge(repo, {
            no_fast_forward: true
          });
        }
      ]);
      commands.push([
        'git-plus:rebase', 'Rebase', function() {
          return GitRebase(repo);
        }
      ]);
      commands.push([
        'git-plus:git-open-changed-files', 'Open Changed Files', function() {
          return GitOpenChangedFiles(repo);
        }
      ]);
      return commands;
    });
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LXBsdXMtY29tbWFuZHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixRQUFBLGdjQUFBO0FBQUEsSUFBQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQUF6QixDQUFBO0FBQUEsSUFDQSxvQkFBQSxHQUF5QixPQUFBLENBQVEseUNBQVIsQ0FEekIsQ0FBQTtBQUFBLElBRUEscUJBQUEsR0FBeUIsT0FBQSxDQUFRLDBDQUFSLENBRnpCLENBQUE7QUFBQSxJQUdBLG1CQUFBLEdBQXlCLE9BQUEsQ0FBUSxpQ0FBUixDQUh6QixDQUFBO0FBQUEsSUFJQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsb0NBQVIsQ0FKekIsQ0FBQTtBQUFBLElBS0EsYUFBQSxHQUF5QixPQUFBLENBQVEsMEJBQVIsQ0FMekIsQ0FBQTtBQUFBLElBTUEsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVIsQ0FOekIsQ0FBQTtBQUFBLElBT0EsY0FBQSxHQUF5QixPQUFBLENBQVEsMkJBQVIsQ0FQekIsQ0FBQTtBQUFBLElBUUEsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVIsQ0FSekIsQ0FBQTtBQUFBLElBU0EsV0FBQSxHQUF5QixPQUFBLENBQVEsdUJBQVIsQ0FUekIsQ0FBQTtBQUFBLElBVUEsVUFBQSxHQUF5QixPQUFBLENBQVEsdUJBQVIsQ0FWekIsQ0FBQTtBQUFBLElBV0EsUUFBQSxHQUF5QixPQUFBLENBQVEsb0JBQVIsQ0FYekIsQ0FBQTtBQUFBLElBWUEsYUFBQSxHQUF5QixPQUFBLENBQVEsaUNB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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/git-plus-commands.coffee
