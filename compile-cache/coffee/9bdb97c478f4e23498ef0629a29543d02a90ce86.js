(function() {
  var $, CompositeDisposable, GitAddAndCommitContext, GitAddContext, GitCheckoutAllFiles, GitCheckoutBranch, GitCheckoutFile, GitCheckoutFileContext, GitCheckoutNewBranch, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteBranch, GitDiff, GitDiffAll, GitDiffBranchFiles, GitDiffBranchFilesContext, GitDiffBranches, GitDiffBranchesContext, GitDiffContext, GitDifftool, GitDifftoolContext, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPaletteView, GitPull, GitPullContext, GitPush, GitPushContext, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageFilesBeta, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFileContext, GitUnstageFiles, OutputViewManager, baseLineGrammar, baseWordGrammar, configurations, contextMenu, currentFile, diffGrammars, getWorkspaceRepos, git, onPathsChanged, setDiffGrammar;

  CompositeDisposable = require('atom').CompositeDisposable;

  $ = require('atom-space-pen-views').$;

  git = require('./git');

  configurations = require('./config');

  contextMenu = require('./context-menu');

  OutputViewManager = require('./output-view-manager');

  GitPaletteView = require('./views/git-palette-view');

  GitAddContext = require('./models/context/git-add-context');

  GitDiffContext = require('./models/context/git-diff-context');

  GitAddAndCommitContext = require('./models/context/git-add-and-commit-context');

  GitCheckoutNewBranch = require('./models/git-checkout-new-branch');

  GitCheckoutBranch = require('./models/git-checkout-branch');

  GitDeleteBranch = require('./models/git-delete-branch');

  GitCheckoutAllFiles = require('./models/git-checkout-all-files');

  GitCheckoutFile = require('./models/git-checkout-file');

  GitCheckoutFileContext = require('./models/context/git-checkout-file-context');

  GitCherryPick = require('./models/git-cherry-pick');

  GitCommit = require('./models/git-commit');

  GitCommitAmend = require('./models/git-commit-amend');

  GitDiff = require('./models/git-diff');

  GitDiffBranches = require('./models/git-diff-branches');

  GitDiffBranchesContext = require('./models/context/git-diff-branches-context');

  GitDiffBranchFiles = require('./models/git-diff-branch-files');

  GitDiffBranchFilesContext = require('./models/context/git-diff-branch-files-context');

  GitDifftool = require('./models/git-difftool');

  GitDifftoolContext = require('./models/context/git-difftool-context');

  GitDiffAll = require('./models/git-diff-all');

  GitFetch = require('./models/git-fetch');

  GitFetchPrune = require('./models/git-fetch-prune.coffee');

  GitInit = require('./models/git-init');

  GitLog = require('./models/git-log');

  GitPull = require('./models/git-pull');

  GitPullContext = require('./models/context/git-pull-context');

  GitPush = require('./models/git-push');

  GitPushContext = require('./models/context/git-push-context');

  GitRemove = require('./models/git-remove');

  GitShow = require('./models/git-show');

  GitStageFiles = require('./models/git-stage-files');

  GitStageFilesBeta = require('./models/git-stage-files-beta');

  GitStageHunk = require('./models/git-stage-hunk');

  GitStashApply = require('./models/git-stash-apply');

  GitStashDrop = require('./models/git-stash-drop');

  GitStashPop = require('./models/git-stash-pop');

  GitStashSave = require('./models/git-stash-save');

  GitStashSaveMessage = require('./models/git-stash-save-message');

  GitStatus = require('./models/git-status');

  GitTags = require('./models/git-tags');

  GitUnstageFiles = require('./models/git-unstage-files');

  GitUnstageFileContext = require('./models/context/git-unstage-file-context');

  GitRun = require('./models/git-run');

  GitMerge = require('./models/git-merge');

  GitRebase = require('./models/git-rebase');

  GitOpenChangedFiles = require('./models/git-open-changed-files');

  diffGrammars = require('./grammars/diff.js');

  baseWordGrammar = __dirname + '/grammars/word-diff.json';

  baseLineGrammar = __dirname + '/grammars/line-diff.json';

  currentFile = function(repo) {
    var ref;
    return repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
  };

  setDiffGrammar = function() {
    var baseGrammar, diffGrammar, enableSyntaxHighlighting, grammar, wordDiff;
    while (atom.grammars.grammarForScopeName('source.diff')) {
      atom.grammars.removeGrammarForScopeName('source.diff');
    }
    enableSyntaxHighlighting = atom.config.get('git-plus.diffs.syntaxHighlighting');
    wordDiff = atom.config.get('git-plus.diffs.wordDiff');
    diffGrammar = null;
    baseGrammar = null;
    if (wordDiff) {
      diffGrammar = diffGrammars.wordGrammar;
      baseGrammar = baseWordGrammar;
    } else {
      diffGrammar = diffGrammars.lineGrammar;
      baseGrammar = baseLineGrammar;
    }
    if (enableSyntaxHighlighting) {
      return atom.grammars.addGrammar(diffGrammar);
    } else {
      grammar = atom.grammars.readGrammarSync(baseGrammar);
      grammar.packageName = 'git-plus';
      return atom.grammars.addGrammar(grammar);
    }
  };

  getWorkspaceRepos = function() {
    return atom.project.getRepositories().filter(function(r) {
      return r != null;
    });
  };

  onPathsChanged = function(gp) {
    if (typeof gp.deactivate === "function") {
      gp.deactivate();
    }
    if (typeof gp.activate === "function") {
      gp.activate();
    }
    if (gp.statusBar) {
      return typeof gp.consumeStatusBar === "function" ? gp.consumeStatusBar(gp.statusBar) : void 0;
    }
  };

  module.exports = {
    config: configurations,
    subscriptions: null,
    provideService: function() {
      return require('./service');
    },
    activate: function(state) {
      var repos;
      setDiffGrammar();
      this.subscriptions = new CompositeDisposable;
      repos = getWorkspaceRepos();
      if (atom.project.getDirectories().length === 0) {
        atom.project.onDidChangePaths((function(_this) {
          return function(paths) {
            return onPathsChanged(_this);
          };
        })(this));
      }
      if (repos.length === 0 && atom.project.getDirectories().length > 0) {
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:init', (function(_this) {
          return function() {
            return GitInit().then(_this.activate);
          };
        })(this)));
      }
      if (repos.length > 0) {
        atom.project.onDidChangePaths((function(_this) {
          return function(paths) {
            return onPathsChanged(_this);
          };
        })(this));
        contextMenu();
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:menu', function() {
          return new GitPaletteView();
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo, {
              file: currentFile(repo)
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-modified', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo, {
              update: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit', function() {
          return git.getRepo().then(function(repo) {
            return GitCommit(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit-all', function() {
          return git.getRepo().then(function(repo) {
            return GitCommit(repo, {
              stageChanges: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit-amend', function() {
          return git.getRepo().then(function(repo) {
            return new GitCommitAmend(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-and-commit', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo, {
              file: currentFile(repo)
            }).then(function() {
              return GitCommit(repo);
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-and-commit-and-push', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo, {
              file: currentFile(repo)
            }).then(function() {
              return GitCommit(repo, {
                andPush: true
              });
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all-and-commit', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo).then(function() {
              return GitCommit(repo);
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all-commit-and-push', function() {
          return git.getRepo().then(function(repo) {
            return git.add(repo).then(function() {
              return GitCommit(repo, {
                andPush: true
              });
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit-all-and-push', function() {
          return git.getRepo().then(function(repo) {
            return GitCommit(repo, {
              stageChanges: true,
              andPush: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout', function() {
          return git.getRepo().then(function(repo) {
            return GitCheckoutBranch(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-remote', function() {
          return git.getRepo().then(function(repo) {
            return GitCheckoutBranch(repo, {
              remote: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-current-file', function() {
          return git.getRepo().then(function(repo) {
            return GitCheckoutFile(repo, {
              file: currentFile(repo)
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-all-files', function() {
          return git.getRepo().then(function(repo) {
            return GitCheckoutAllFiles(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:new-branch', function() {
          return git.getRepo().then(function(repo) {
            return GitCheckoutNewBranch(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:delete-local-branch', function() {
          return git.getRepo().then(function(repo) {
            return GitDeleteBranch(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:delete-remote-branch', function() {
          return git.getRepo().then(function(repo) {
            return GitDeleteBranch(repo, {
              remote: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:cherry-pick', function() {
          return git.getRepo().then(function(repo) {
            return GitCherryPick(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff', function() {
          return git.getRepo().then(function(repo) {
            return GitDiff(repo, {
              file: currentFile(repo)
            });
          });
        }));
        if (atom.config.get('git-plus.experimental.diffBranches')) {
          this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff-branches', function() {
            return git.getRepo().then(function(repo) {
              return GitDiffBranches(repo);
            });
          }));
          this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff-branch-files', function() {
            return git.getRepo().then(function(repo) {
              return GitDiffBranchFiles(repo);
            });
          }));
        }
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:difftool', function() {
          return git.getRepo().then(function(repo) {
            return GitDifftool(repo, {
              file: currentFile(repo)
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff-all', function() {
          return git.getRepo().then(function(repo) {
            return GitDiffAll(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:fetch', function() {
          return git.getRepo().then(function(repo) {
            return GitFetch(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:fetch-prune', function() {
          return git.getRepo().then(function(repo) {
            return GitFetchPrune(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:pull', function() {
          return git.getRepo().then(function(repo) {
            return GitPull(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:push', function() {
          return git.getRepo().then(function(repo) {
            return GitPush(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:push-set-upstream', function() {
          return git.getRepo().then(function(repo) {
            return GitPush(repo, {
              setUpstream: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:remove', function() {
          return git.getRepo().then(function(repo) {
            return GitRemove(repo, {
              showSelector: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:remove-current-file', function() {
          return git.getRepo().then(function(repo) {
            return GitRemove(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:reset', function() {
          return git.getRepo().then(function(repo) {
            return git.reset(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:show', function() {
          return git.getRepo().then(function(repo) {
            return GitShow(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:log', function() {
          return git.getRepo().then(function(repo) {
            return GitLog(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:log-current-file', function() {
          return git.getRepo().then(function(repo) {
            return GitLog(repo, {
              onlyCurrentFile: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stage-hunk', function() {
          return git.getRepo().then(function(repo) {
            return GitStageHunk(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-save', function() {
          return git.getRepo().then(function(repo) {
            return GitStashSave(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-save-message', function() {
          return git.getRepo().then(function(repo) {
            return GitStashSaveMessage(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-pop', function() {
          return git.getRepo().then(function(repo) {
            return GitStashPop(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-apply', function() {
          return git.getRepo().then(function(repo) {
            return GitStashApply(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-delete', function() {
          return git.getRepo().then(function(repo) {
            return GitStashDrop(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:status', function() {
          return git.getRepo().then(function(repo) {
            return GitStatus(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:tags', function() {
          return git.getRepo().then(function(repo) {
            return GitTags(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:run', function() {
          return git.getRepo().then(function(repo) {
            return new GitRun(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:merge', function() {
          return git.getRepo().then(function(repo) {
            return GitMerge(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:merge-remote', function() {
          return git.getRepo().then(function(repo) {
            return GitMerge(repo, {
              remote: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:merge-no-fast-forward', function() {
          return git.getRepo().then(function(repo) {
            return GitMerge(repo, {
              noFastForward: true
            });
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:rebase', function() {
          return git.getRepo().then(function(repo) {
            return GitRebase(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:git-open-changed-files', function() {
          return git.getRepo().then(function(repo) {
            return GitOpenChangedFiles(repo);
          });
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:add', function() {
          return GitAddContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:add-and-commit', function() {
          return GitAddAndCommitContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:checkout-file', function() {
          return GitCheckoutFileContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:diff', function() {
          return GitDiffContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:diff-branches', GitDiffBranchesContext));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:diff-branch-files', GitDiffBranchFilesContext));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:difftool', function() {
          return GitDifftoolContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:pull', function() {
          return GitPullContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:push', function() {
          return GitPushContext();
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:push-set-upstream', function() {
          return GitPushContext({
            setUpstream: true
          });
        }));
        this.subscriptions.add(atom.commands.add('.tree-view', 'git-plus-context:unstage-file', function() {
          return GitUnstageFileContext();
        }));
        this.subscriptions.add(atom.config.observe('git-plus.diffs.syntaxHighlighting', setDiffGrammar));
        this.subscriptions.add(atom.config.observe('git-plus.diffs.wordDiff', setDiffGrammar));
        if (atom.config.get('git-plus.experimental.stageFilesBeta')) {
          this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stage-files', function() {
            return git.getRepo().then(GitStageFilesBeta);
          }));
        } else {
          this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:unstage-files', function() {
            return git.getRepo().then(GitUnstageFiles);
          }));
          this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stage-files', function() {
            return git.getRepo().then(GitStageFiles);
          }));
        }
        return this.subscriptions.add(atom.config.onDidChange('git-plus.experimental.stageFilesBeta', (function(_this) {
          return function() {
            _this.subscriptions.dispose();
            return _this.activate();
          };
        })(this)));
      }
    },
    deactivate: function() {
      var ref;
      this.subscriptions.dispose();
      return (ref = this.statusBarTile) != null ? ref.destroy() : void 0;
    },
    consumeAutosave: function(arg) {
      var dontSaveIf;
      dontSaveIf = arg.dontSaveIf;
      return dontSaveIf(function(paneItem) {
        return paneItem.getPath().includes('COMMIT_EDITMSG');
      });
    },
    consumeStatusBar: function(statusBar1) {
      this.statusBar = statusBar1;
      if (getWorkspaceRepos().length > 0) {
        this.setupBranchesMenuToggle(this.statusBar);
        if (atom.config.get('git-plus.general.enableStatusBarIcon')) {
          return this.setupOutputViewToggle(this.statusBar);
        }
      }
    },
    setupOutputViewToggle: function(statusBar) {
      var div, icon, link;
      div = document.createElement('div');
      div.classList.add('inline-block');
      icon = document.createElement('span');
      icon.textContent = 'git+';
      link = document.createElement('a');
      link.appendChild(icon);
      link.onclick = function(e) {
        return OutputViewManager.getView().toggle();
      };
      atom.tooltips.add(div, {
        title: "Toggle Git-Plus Output Console"
      });
      div.appendChild(link);
      return this.statusBarTile = statusBar.addRightTile({
        item: div,
        priority: 0
      });
    },
    setupBranchesMenuToggle: function(statusBar) {
      return statusBar.getRightTiles().some((function(_this) {
        return function(arg) {
          var item, ref;
          item = arg.item;
          if (item != null ? (ref = item.classList) != null ? typeof ref.contains === "function" ? ref.contains('git-view') : void 0 : void 0 : void 0) {
            $(item).find('.git-branch').on('click', function(arg1) {
              var altKey, shiftKey;
              altKey = arg1.altKey, shiftKey = arg1.shiftKey;
              if (!(altKey || shiftKey)) {
                return atom.commands.dispatch(document.querySelector('atom-workspace'), 'git-plus:checkout');
              }
            });
            return true;
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LXBsdXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBd0IsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLElBQXdCLE9BQUEsQ0FBUSxzQkFBUjs7RUFDekIsR0FBQSxHQUF5QixPQUFBLENBQVEsT0FBUjs7RUFDekIsY0FBQSxHQUF5QixPQUFBLENBQVEsVUFBUjs7RUFDekIsV0FBQSxHQUF5QixPQUFBLENBQVEsZ0JBQVI7O0VBQ3pCLGlCQUFBLEdBQXlCLE9BQUEsQ0FBUSx1QkFBUjs7RUFDekIsY0FBQSxHQUF5QixPQUFBLENBQVEsMEJBQVI7O0VBQ3pCLGFBQUEsR0FBeUIsT0FBQSxDQUFRLGtDQUFSOztFQUN6QixjQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQ0FBUjs7RUFDekIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDZDQUFSOztFQUN6QixvQkFBQSxHQUF5QixPQUFBLENBQVEsa0NBQVI7O0VBQ3pCLGlCQUFBLEdBQXlCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDekIsZUFBQSxHQUF5QixPQUFBLENBQVEsNEJBQVI7O0VBQ3pCLG1CQUFBLEdBQXlCLE9BQUEsQ0FBUSxpQ0FBUjs7RUFDekIsZUFBQSxHQUF5QixPQUFBLENBQVEsNEJBQVI7O0VBQ3pCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw0Q0FBUjs7RUFDekIsYUFBQSxHQUF5QixPQUFBLENBQVEsMEJBQVI7O0VBQ3pCLFNBQUEsR0FBeUIsT0FBQSxDQUFRLHFCQUFSOztFQUN6QixjQUFBLEdBQXlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFDekIsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVI7O0VBQ3pCLGVBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUN6QixzQkFBQSxHQUF5QixPQUFBLENBQVEsNENBQVI7O0VBQ3pCLGtCQUFB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QUFqQixDQUFBO3VCQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixRQUFRLENBQUMsYUFBVCxDQUF1QixnQkFBdkIsQ0FBdkIsRUFBaUUsbUJBQWpFLEVBREY7O1lBRHNDLENBQXhDO0FBR0EsbUJBQU8sS0FKVDs7UUFENkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CO0lBRHVCLENBbkh6Qjs7QUE1RkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gID0gcmVxdWlyZSAnYXRvbSdcbnskfSAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmdpdCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2dpdCdcbmNvbmZpZ3VyYXRpb25zICAgICAgICAgPSByZXF1aXJlICcuL2NvbmZpZydcbmNvbnRleHRNZW51ICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbnRleHQtbWVudSdcbk91dHB1dFZpZXdNYW5hZ2VyICAgICAgPSByZXF1aXJlICcuL291dHB1dC12aWV3LW1hbmFnZXInXG5HaXRQYWxldHRlVmlldyAgICAgICAgID0gcmVxdWlyZSAnLi92aWV3cy9naXQtcGFsZXR0ZS12aWV3J1xuR2l0QWRkQ29udGV4dCAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1jb250ZXh0J1xuR2l0RGlmZkNvbnRleHQgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmYtY29udGV4dCdcbkdpdEFkZEFuZENvbW1pdENvbnRleHQgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1hZGQtYW5kLWNvbW1pdC1jb250ZXh0J1xuR2l0Q2hlY2tvdXROZXdCcmFuY2ggICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jaGVja291dC1uZXctYnJhbmNoJ1xuR2l0Q2hlY2tvdXRCcmFuY2ggICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jaGVja291dC1icmFuY2gnXG5HaXREZWxldGVCcmFuY2ggICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRlbGV0ZS1icmFuY2gnXG5HaXRDaGVja291dEFsbEZpbGVzICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWFsbC1maWxlcydcbkdpdENoZWNrb3V0RmlsZSAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtY2hlY2tvdXQtZmlsZSdcbkdpdENoZWNrb3V0RmlsZUNvbnRleHQgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1jaGVja291dC1maWxlLWNvbnRleHQnXG5HaXRDaGVycnlQaWNrICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZXJyeS1waWNrJ1xuR2l0Q29tbWl0ICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jb21taXQnXG5HaXRDb21taXRBbWVuZCAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZCdcbkdpdERpZmYgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtZGlmZidcbkdpdERpZmZCcmFuY2hlcyAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtZGlmZi1icmFuY2hlcydcbkdpdERpZmZCcmFuY2hlc0NvbnRleHQgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWJyYW5jaGVzLWNvbnRleHQnXG5HaXREaWZmQnJhbmNoRmlsZXMgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoLWZpbGVzJ1xuR2l0RGlmZkJyYW5jaEZpbGVzQ29udGV4dCAgICAgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWJyYW5jaC1maWxlcy1jb250ZXh0J1xuR2l0RGlmZnRvb2wgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmdG9vbCdcbkdpdERpZmZ0b29sQ29udGV4dCAgICAgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1kaWZmdG9vbC1jb250ZXh0J1xuR2l0RGlmZkFsbCAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmLWFsbCdcbkdpdEZldGNoICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtZmV0Y2gnXG5HaXRGZXRjaFBydW5lICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWZldGNoLXBydW5lLmNvZmZlZSdcbkdpdEluaXQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtaW5pdCdcbkdpdExvZyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtbG9nJ1xuR2l0UHVsbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1wdWxsJ1xuR2l0UHVsbENvbnRleHQgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2NvbnRleHQvZ2l0LXB1bGwtY29udGV4dCdcbkdpdFB1c2ggICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcHVzaCdcbkdpdFB1c2hDb250ZXh0ICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9jb250ZXh0L2dpdC1wdXNoLWNvbnRleHQnXG5HaXRSZW1vdmUgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXJlbW92ZSdcbkdpdFNob3cgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc2hvdydcbkdpdFN0YWdlRmlsZXMgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhZ2UtZmlsZXMnXG5HaXRTdGFnZUZpbGVzQmV0YSAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzLWJldGEnXG5HaXRTdGFnZUh1bmsgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YWdlLWh1bmsnXG5HaXRTdGFzaEFwcGx5ICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLWFwcGx5J1xuR2l0U3Rhc2hEcm9wICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFzaC1kcm9wJ1xuR2l0U3Rhc2hQb3AgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFzaC1wb3AnXG5HaXRTdGFzaFNhdmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUnXG5HaXRTdGFzaFNhdmVNZXNzYWdlICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUtbWVzc2FnZSdcbkdpdFN0YXR1cyAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhdHVzJ1xuR2l0VGFncyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC10YWdzJ1xuR2l0VW5zdGFnZUZpbGVzICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC11bnN0YWdlLWZpbGVzJ1xuR2l0VW5zdGFnZUZpbGVDb250ZXh0ICA9IHJlcXVpcmUgJy4vbW9kZWxzL2NvbnRleHQvZ2l0LXVuc3RhZ2UtZmlsZS1jb250ZXh0J1xuR2l0UnVuICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1ydW4nXG5HaXRNZXJnZSAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LW1lcmdlJ1xuR2l0UmViYXNlICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1yZWJhc2UnXG5HaXRPcGVuQ2hhbmdlZEZpbGVzICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LW9wZW4tY2hhbmdlZC1maWxlcydcbmRpZmZHcmFtbWFycyAgICAgICAgICAgPSByZXF1aXJlICcuL2dyYW1tYXJzL2RpZmYuanMnXG5cbmJhc2VXb3JkR3JhbW1hciA9IF9fZGlybmFtZSArICcvZ3JhbW1hcnMvd29yZC1kaWZmLmpzb24nXG5iYXNlTGluZUdyYW1tYXIgPSBfX2Rpcm5hbWUgKyAnL2dyYW1tYXJzL2xpbmUtZGlmZi5qc29uJ1xuXG5jdXJyZW50RmlsZSA9IChyZXBvKSAtPlxuICByZXBvLnJlbGF0aXZpemUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKCkpXG5cbnNldERpZmZHcmFtbWFyID0gLT5cbiAgd2hpbGUgYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lICdzb3VyY2UuZGlmZidcbiAgICBhdG9tLmdyYW1tYXJzLnJlbW92ZUdyYW1tYXJGb3JTY29wZU5hbWUgJ3NvdXJjZS5kaWZmJ1xuXG4gIGVuYWJsZVN5bnRheEhpZ2hsaWdodGluZyA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZGlmZnMuc3ludGF4SGlnaGxpZ2h0aW5nJylcbiAgd29yZERpZmYgPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmRpZmZzLndvcmREaWZmJylcbiAgZGlmZkdyYW1tYXIgPSBudWxsXG4gIGJhc2VHcmFtbWFyID0gbnVsbFxuXG4gIGlmIHdvcmREaWZmXG4gICAgZGlmZkdyYW1tYXIgPSBkaWZmR3JhbW1hcnMud29yZEdyYW1tYXJcbiAgICBiYXNlR3JhbW1hciA9IGJhc2VXb3JkR3JhbW1hclxuICBlbHNlXG4gICAgZGlmZkdyYW1tYXIgPSBkaWZmR3JhbW1hcnMubGluZUdyYW1tYXJcbiAgICBiYXNlR3JhbW1hciA9IGJhc2VMaW5lR3JhbW1hclxuXG4gIGlmIGVuYWJsZVN5bnRheEhpZ2hsaWdodGluZ1xuICAgIGF0b20uZ3JhbW1hcnMuYWRkR3JhbW1hciBkaWZmR3JhbW1hclxuICBlbHNlXG4gICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMucmVhZEdyYW1tYXJTeW5jIGJhc2VHcmFtbWFyXG4gICAgZ3JhbW1hci5wYWNrYWdlTmFtZSA9ICdnaXQtcGx1cydcbiAgICBhdG9tLmdyYW1tYXJzLmFkZEdyYW1tYXIgZ3JhbW1hclxuXG5nZXRXb3Jrc3BhY2VSZXBvcyA9IC0+IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIgKHIpIC0+IHI/XG5cbm9uUGF0aHNDaGFuZ2VkID0gKGdwKSAtPlxuICBncC5kZWFjdGl2YXRlPygpXG4gIGdwLmFjdGl2YXRlPygpXG4gIGdwLmNvbnN1bWVTdGF0dXNCYXI/KGdwLnN0YXR1c0JhcikgaWYgZ3Auc3RhdHVzQmFyXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBjb25maWd1cmF0aW9uc1xuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBwcm92aWRlU2VydmljZTogLT4gcmVxdWlyZSAnLi9zZXJ2aWNlJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgc2V0RGlmZkdyYW1tYXIoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICByZXBvcyA9IGdldFdvcmtzcGFjZVJlcG9zKClcbiAgICBpZiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5sZW5ndGggaXMgMFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHBhdGhzKSA9PiBvblBhdGhzQ2hhbmdlZCh0aGlzKVxuICAgIGlmIHJlcG9zLmxlbmd0aCBpcyAwIGFuZCBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5sZW5ndGggPiAwXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmluaXQnLCA9PiBHaXRJbml0KCkudGhlbihAYWN0aXZhdGUpXG4gICAgaWYgcmVwb3MubGVuZ3RoID4gMFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHBhdGhzKSA9PiBvblBhdGhzQ2hhbmdlZCh0aGlzKVxuICAgICAgY29udGV4dE1lbnUoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czptZW51JywgLT4gbmV3IEdpdFBhbGV0dGVWaWV3KClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6YWRkJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBnaXQuYWRkKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKHJlcG8pKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6YWRkLW1vZGlmaWVkJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBnaXQuYWRkKHJlcG8sIHVwZGF0ZTogdHJ1ZSkpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmFkZC1hbGwnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IGdpdC5hZGQocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmNvbW1pdCcsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0Q29tbWl0KHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpjb21taXQtYWxsJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRDb21taXQocmVwbywgc3RhZ2VDaGFuZ2VzOiB0cnVlKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6Y29tbWl0LWFtZW5kJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBuZXcgR2l0Q29tbWl0QW1lbmQocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0JywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBnaXQuYWRkKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKHJlcG8pKS50aGVuIC0+IEdpdENvbW1pdChyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQtYW5kLXB1c2gnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IGdpdC5hZGQocmVwbywgZmlsZTogY3VycmVudEZpbGUocmVwbykpLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8sIGFuZFB1c2g6IHRydWUpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czphZGQtYWxsLWFuZC1jb21taXQnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IGdpdC5hZGQocmVwbykudGhlbiAtPiBHaXRDb21taXQocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmFkZC1hbGwtY29tbWl0LWFuZC1wdXNoJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBnaXQuYWRkKHJlcG8pLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8sIGFuZFB1c2g6IHRydWUpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpjb21taXQtYWxsLWFuZC1wdXNoJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRDb21taXQocmVwbywgc3RhZ2VDaGFuZ2VzOiB0cnVlLCBhbmRQdXNoOiB0cnVlKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6Y2hlY2tvdXQnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdENoZWNrb3V0QnJhbmNoKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpjaGVja291dC1yZW1vdGUnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdENoZWNrb3V0QnJhbmNoKHJlcG8sIHtyZW1vdGU6IHRydWV9KSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6Y2hlY2tvdXQtY3VycmVudC1maWxlJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRDaGVja291dEZpbGUocmVwbywgZmlsZTogY3VycmVudEZpbGUocmVwbykpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpjaGVja291dC1hbGwtZmlsZXMnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdENoZWNrb3V0QWxsRmlsZXMocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOm5ldy1icmFuY2gnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdENoZWNrb3V0TmV3QnJhbmNoKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpkZWxldGUtbG9jYWwtYnJhbmNoJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXREZWxldGVCcmFuY2gocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmRlbGV0ZS1yZW1vdGUtYnJhbmNoJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXREZWxldGVCcmFuY2gocmVwbywge3JlbW90ZTogdHJ1ZX0pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpjaGVycnktcGljaycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0Q2hlcnJ5UGljayhyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6ZGlmZicsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0RGlmZihyZXBvLCBmaWxlOiBjdXJyZW50RmlsZShyZXBvKSkpXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC5kaWZmQnJhbmNoZXMnKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmRpZmYtYnJhbmNoZXMnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdERpZmZCcmFuY2hlcyhyZXBvKSlcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpkaWZmLWJyYW5jaC1maWxlcycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0RGlmZkJyYW5jaEZpbGVzKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpkaWZmdG9vbCcsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0RGlmZnRvb2wocmVwbywgZmlsZTogY3VycmVudEZpbGUocmVwbykpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpkaWZmLWFsbCcsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0RGlmZkFsbChyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6ZmV0Y2gnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdEZldGNoKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpmZXRjaC1wcnVuZScsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0RmV0Y2hQcnVuZShyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6cHVsbCcsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0UHVsbChyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6cHVzaCcsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0UHVzaChyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6cHVzaC1zZXQtdXBzdHJlYW0nLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdFB1c2gocmVwbywgc2V0VXBzdHJlYW06IHRydWUpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpyZW1vdmUnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdFJlbW92ZShyZXBvLCBzaG93U2VsZWN0b3I6IHRydWUpKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpyZW1vdmUtY3VycmVudC1maWxlJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRSZW1vdmUocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOnJlc2V0JywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBnaXQucmVzZXQocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOnNob3cnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdFNob3cocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmxvZycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0TG9nKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpsb2ctY3VycmVudC1maWxlJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRMb2cocmVwbywgb25seUN1cnJlbnRGaWxlOiB0cnVlKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6c3RhZ2UtaHVuaycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0U3RhZ2VIdW5rKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpzdGFzaC1zYXZlJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRTdGFzaFNhdmUocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOnN0YXNoLXNhdmUtbWVzc2FnZScsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0U3Rhc2hTYXZlTWVzc2FnZShyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6c3Rhc2gtcG9wJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRTdGFzaFBvcChyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6c3Rhc2gtYXBwbHknLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdFN0YXNoQXBwbHkocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOnN0YXNoLWRlbGV0ZScsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0U3Rhc2hEcm9wKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpzdGF0dXMnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdFN0YXR1cyhyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6dGFncycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0VGFncyhyZXBvKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6cnVuJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBuZXcgR2l0UnVuKHJlcG8pKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czptZXJnZScsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0TWVyZ2UocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOm1lcmdlLXJlbW90ZScsIC0+IGdpdC5nZXRSZXBvKCkudGhlbigocmVwbykgLT4gR2l0TWVyZ2UocmVwbywgcmVtb3RlOiB0cnVlKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6bWVyZ2Utbm8tZmFzdC1mb3J3YXJkJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRNZXJnZShyZXBvLCBub0Zhc3RGb3J3YXJkOiB0cnVlKSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXBsdXM6cmViYXNlJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKChyZXBvKSAtPiBHaXRSZWJhc2UocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC1wbHVzOmdpdC1vcGVuLWNoYW5nZWQtZmlsZXMnLCAtPiBnaXQuZ2V0UmVwbygpLnRoZW4oKHJlcG8pIC0+IEdpdE9wZW5DaGFuZ2VkRmlsZXMocmVwbykpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcnLCAnZ2l0LXBsdXMtY29udGV4dDphZGQnLCAtPiBHaXRBZGRDb250ZXh0KClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldycsICdnaXQtcGx1cy1jb250ZXh0OmFkZC1hbmQtY29tbWl0JywgLT4gR2l0QWRkQW5kQ29tbWl0Q29udGV4dCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcnLCAnZ2l0LXBsdXMtY29udGV4dDpjaGVja291dC1maWxlJywgLT4gR2l0Q2hlY2tvdXRGaWxlQ29udGV4dCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcnLCAnZ2l0LXBsdXMtY29udGV4dDpkaWZmJywgLT4gR2l0RGlmZkNvbnRleHQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3JywgJ2dpdC1wbHVzLWNvbnRleHQ6ZGlmZi1icmFuY2hlcycsIEdpdERpZmZCcmFuY2hlc0NvbnRleHRcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldycsICdnaXQtcGx1cy1jb250ZXh0OmRpZmYtYnJhbmNoLWZpbGVzJywgR2l0RGlmZkJyYW5jaEZpbGVzQ29udGV4dFxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3JywgJ2dpdC1wbHVzLWNvbnRleHQ6ZGlmZnRvb2wnLCAtPiBHaXREaWZmdG9vbENvbnRleHQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3JywgJ2dpdC1wbHVzLWNvbnRleHQ6cHVsbCcsIC0+IEdpdFB1bGxDb250ZXh0KClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldycsICdnaXQtcGx1cy1jb250ZXh0OnB1c2gnLCAtPiBHaXRQdXNoQ29udGV4dCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcnLCAnZ2l0LXBsdXMtY29udGV4dDpwdXNoLXNldC11cHN0cmVhbScsIC0+IEdpdFB1c2hDb250ZXh0KHNldFVwc3RyZWFtOiB0cnVlKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3JywgJ2dpdC1wbHVzLWNvbnRleHQ6dW5zdGFnZS1maWxlJywgLT4gR2l0VW5zdGFnZUZpbGVDb250ZXh0KClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdnaXQtcGx1cy5kaWZmcy5zeW50YXhIaWdobGlnaHRpbmcnLCBzZXREaWZmR3JhbW1hclxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2dpdC1wbHVzLmRpZmZzLndvcmREaWZmJywgc2V0RGlmZkdyYW1tYXJcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLnN0YWdlRmlsZXNCZXRhJylcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpzdGFnZS1maWxlcycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbihHaXRTdGFnZUZpbGVzQmV0YSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czp1bnN0YWdlLWZpbGVzJywgLT4gZ2l0LmdldFJlcG8oKS50aGVuKEdpdFVuc3RhZ2VGaWxlcylcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtcGx1czpzdGFnZS1maWxlcycsIC0+IGdpdC5nZXRSZXBvKCkudGhlbihHaXRTdGFnZUZpbGVzKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdnaXQtcGx1cy5leHBlcmltZW50YWwuc3RhZ2VGaWxlc0JldGEnLCA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgICAgQGFjdGl2YXRlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcblxuICBjb25zdW1lQXV0b3NhdmU6ICh7ZG9udFNhdmVJZn0pIC0+XG4gICAgZG9udFNhdmVJZiAocGFuZUl0ZW0pIC0+IHBhbmVJdGVtLmdldFBhdGgoKS5pbmNsdWRlcyAnQ09NTUlUX0VESVRNU0cnXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKEBzdGF0dXNCYXIpIC0+XG4gICAgaWYgZ2V0V29ya3NwYWNlUmVwb3MoKS5sZW5ndGggPiAwXG4gICAgICBAc2V0dXBCcmFuY2hlc01lbnVUb2dnbGUgQHN0YXR1c0JhclxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5nZW5lcmFsLmVuYWJsZVN0YXR1c0Jhckljb24nXG4gICAgICAgIEBzZXR1cE91dHB1dFZpZXdUb2dnbGUgQHN0YXR1c0JhclxuXG4gIHNldHVwT3V0cHV0Vmlld1RvZ2dsZTogKHN0YXR1c0JhcikgLT5cbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgZGl2LmNsYXNzTGlzdC5hZGQgJ2lubGluZS1ibG9jaydcbiAgICBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnc3BhbidcbiAgICBpY29uLnRleHRDb250ZW50ID0gJ2dpdCsnXG4gICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2EnXG4gICAgbGluay5hcHBlbmRDaGlsZCBpY29uXG4gICAgbGluay5vbmNsaWNrID0gKGUpIC0+IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKS50b2dnbGUoKVxuICAgIGF0b20udG9vbHRpcHMuYWRkIGRpdiwgeyB0aXRsZTogXCJUb2dnbGUgR2l0LVBsdXMgT3V0cHV0IENvbnNvbGVcIn1cbiAgICBkaXYuYXBwZW5kQ2hpbGQgbGlua1xuICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSBpdGVtOiBkaXYsIHByaW9yaXR5OiAwXG5cbiAgc2V0dXBCcmFuY2hlc01lbnVUb2dnbGU6IChzdGF0dXNCYXIpIC0+XG4gICAgc3RhdHVzQmFyLmdldFJpZ2h0VGlsZXMoKS5zb21lICh7aXRlbX0pID0+XG4gICAgICBpZiBpdGVtPy5jbGFzc0xpc3Q/LmNvbnRhaW5zPyAnZ2l0LXZpZXcnXG4gICAgICAgICQoaXRlbSkuZmluZCgnLmdpdC1icmFuY2gnKS5vbiAnY2xpY2snLCAoe2FsdEtleSwgc2hpZnRLZXl9KSAtPlxuICAgICAgICAgIHVubGVzcyBhbHRLZXkgb3Igc2hpZnRLZXlcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS13b3Jrc3BhY2UnKSwgJ2dpdC1wbHVzOmNoZWNrb3V0JylcbiAgICAgICAgcmV0dXJuIHRydWVcbiJdfQ==
