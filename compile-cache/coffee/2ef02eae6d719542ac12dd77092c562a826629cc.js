(function() {
  var CompositeDisposable, TreeViewUI, fs, path, utils;

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  fs = require('fs-plus');

  utils = require('./utils');

  module.exports = TreeViewUI = (function() {
    var ENUM_UPDATE_STATUS, statusUpdatingRoots;

    TreeViewUI.prototype.roots = null;

    TreeViewUI.prototype.repositoryMap = null;

    TreeViewUI.prototype.treeViewRootsMap = null;

    TreeViewUI.prototype.subscriptions = null;

    ENUM_UPDATE_STATUS = {
      NOT_UPDATING: 0,
      UPDATING: 1,
      QUEUED: 2,
      QUEUED_RESET: 3
    };

    statusUpdatingRoots = ENUM_UPDATE_STATUS.NOT_UPDATING;

    function TreeViewUI(treeView, repositoryMap) {
      this.treeView = treeView;
      this.repositoryMap = repositoryMap;
      this.showProjectModifiedStatus = atom.config.get('tree-view-git-status.showProjectModifiedStatus');
      this.showBranchLabel = atom.config.get('tree-view-git-status.showBranchLabel');
      this.showCommitsAheadLabel = atom.config.get('tree-view-git-status.showCommitsAheadLabel');
      this.showCommitsBehindLabel = atom.config.get('tree-view-git-status.showCommitsBehindLabel');
      this.subscriptions = new CompositeDisposable;
      this.treeViewRootsMap = new Map;
      this.subscribeUpdateConfigurations();
      this.subscribeUpdateTreeView();
      this.updateRoots(true);
    }

    TreeViewUI.prototype.destruct = function() {
      var ref;
      this.clearTreeViewRootMap();
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      this.subscriptions = null;
      this.treeViewRootsMap = null;
      this.repositoryMap = null;
      return this.roots = null;
    };

    TreeViewUI.prototype.subscribeUpdateTreeView = function() {
      this.subscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updateRoots(true);
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('tree-view.hideVcsIgnoredFiles', (function(_this) {
        return function() {
          return _this.updateRoots(true);
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('tree-view.hideIgnoredNames', (function(_this) {
        return function() {
          return _this.updateRoots(true);
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('core.ignoredNames', (function(_this) {
        return function() {
          if (atom.config.get('tree-view.hideIgnoredNames')) {
            return _this.updateRoots(true);
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.onDidChange('tree-view.sortFoldersBeforeFiles', (function(_this) {
        return function() {
          return _this.updateRoots(true);
        };
      })(this)));
    };

    TreeViewUI.prototype.subscribeUpdateConfigurations = function() {
      this.subscriptions.add(atom.config.observe('tree-view-git-status.showProjectModifiedStatus', (function(_this) {
        return function(newValue) {
          if (_this.showProjectModifiedStatus !== newValue) {
            _this.showProjectModifiedStatus = newValue;
            return _this.updateRoots();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tree-view-git-status.showBranchLabel', (function(_this) {
        return function(newValue) {
          if (_this.showBranchLabel !== newValue) {
            _this.showBranchLabel = newValue;
          }
          return _this.updateRoots();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tree-view-git-status.showCommitsAheadLabel', (function(_this) {
        return function(newValue) {
          if (_this.showCommitsAheadLabel !== newValue) {
            _this.showCommitsAheadLabel = newValue;
            return _this.updateRoots();
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('tree-view-git-status.showCommitsBehindLabel', (function(_this) {
        return function(newValue) {
          if (_this.showCommitsBehindLabel !== newValue) {
            _this.showCommitsBehindLabel = newValue;
            return _this.updateRoots();
          }
        };
      })(this)));
    };

    TreeViewUI.prototype.setRepositories = function(repositories) {
      if (repositories != null) {
        this.repositoryMap = repositories;
        return this.updateRoots(true);
      }
    };

    TreeViewUI.prototype.clearTreeViewRootMap = function() {
      var ref, ref1;
      if ((ref = this.treeViewRootsMap) != null) {
        ref.forEach(function(root, rootPath) {
          var customElements, ref1, ref2, ref3, ref4;
          if ((ref1 = root.root) != null) {
            if ((ref2 = ref1.classList) != null) {
              ref2.remove('status-modified', 'status-added');
            }
          }
          customElements = root.customElements;
          if ((customElements != null ? customElements.headerGitStatus : void 0) != null) {
            if ((ref3 = root.root) != null) {
              if ((ref4 = ref3.header) != null) {
                ref4.removeChild(customElements.headerGitStatus);
              }
            }
            return customElements.headerGitStatus = null;
          }
        });
      }
      return (ref1 = this.treeViewRootsMap) != null ? ref1.clear() : void 0;
    };

    TreeViewUI.prototype.updateRoots = function(reset) {
      var i, len, ref, repoForRoot, repoSubPath, root, rootPath, rootPathHasGitFolder, updatePromises;
      if (this.repositoryMap == null) {
        return;
      }
      if (statusUpdatingRoots === ENUM_UPDATE_STATUS.NOT_UPDATING) {
        statusUpdatingRoots = ENUM_UPDATE_STATUS.UPDATING;
        this.roots = this.treeView.roots;
        if (reset) {
          this.clearTreeViewRootMap();
        }
        updatePromises = [];
        ref = this.roots;
        for (i = 0, len = ref.length; i < len; i++) {
          root = ref[i];
          rootPath = utils.normalizePath(root.directoryName.dataset.path);
          if (reset) {
            this.treeViewRootsMap.set(rootPath, {
              root: root,
              customElements: {}
            });
          }
          repoForRoot = null;
          repoSubPath = null;
          rootPathHasGitFolder = fs.existsSync(path.join(rootPath, '.git'));
          this.repositoryMap.forEach(function(repo, repoPath) {
            if ((repoForRoot == null) && ((rootPath === repoPath) || (rootPath.indexOf(repoPath) === 0 && !rootPathHasGitFolder))) {
              repoSubPath = path.relative(repoPath, rootPath);
              return repoForRoot = repo;
            }
          });
          if (repoForRoot != null) {
            if (repoForRoot == null) {
              repoForRoot = null;
            }
            updatePromises.push(this.doUpdateRootNode(root, repoForRoot, rootPath, repoSubPath));
          }
        }
        utils.settle(updatePromises)["catch"](function(err) {
          return console.error(err);
        }).then((function(_this) {
          return function() {
            var lastStatus;
            lastStatus = statusUpdatingRoots;
            statusUpdatingRoots = ENUM_UPDATE_STATUS.NOT_UPDATING;
            if (lastStatus === ENUM_UPDATE_STATUS.QUEUED) {
              return _this.updateRoots();
            } else if (lastStatus === ENUM_UPDATE_STATUS.QUEUED_RESET) {
              return _this.updateRoots(true);
            }
          };
        })(this));
      } else if (statusUpdatingRoots === ENUM_UPDATE_STATUS.UPDATING) {
        statusUpdatingRoots = ENUM_UPDATE_STATUS.QUEUED;
      }
      if (statusUpdatingRoots === ENUM_UPDATE_STATUS.QUEUED && reset) {
        return statusUpdatingRoots = ENUM_UPDATE_STATUS.QUEUED_RESET;
      }
    };

    TreeViewUI.prototype.updateRootForRepo = function(repo, repoPath) {
      return this.updateRoots();
    };

    TreeViewUI.prototype.doUpdateRootNode = function(root, repo, rootPath, repoSubPath) {
      var customElements, updatePromise;
      customElements = this.treeViewRootsMap.get(rootPath).customElements;
      updatePromise = Promise.resolve();
      if (this.showProjectModifiedStatus && (repo != null)) {
        updatePromise = updatePromise.then(function() {
          if (repoSubPath !== '') {
            return repo.getDirectoryStatus(repoSubPath);
          } else {
            return utils.getRootDirectoryStatus(repo);
          }
        });
      }
      return updatePromise.then((function(_this) {
        return function(status) {
          var convStatus, headerGitStatus, showHeaderGitStatus;
          if (_this.roots == null) {
            return;
          }
          convStatus = _this.convertDirectoryStatus(repo, status);
          root.classList.remove('status-modified', 'status-added');
          if (convStatus != null) {
            root.classList.add("status-" + convStatus);
          }
          showHeaderGitStatus = _this.showBranchLabel || _this.showCommitsAheadLabel || _this.showCommitsBehindLabel;
          if (showHeaderGitStatus && (repo != null) && (customElements.headerGitStatus == null)) {
            headerGitStatus = document.createElement('span');
            headerGitStatus.classList.add('tree-view-git-status');
            return _this.generateGitStatusText(headerGitStatus, repo).then(function() {
              customElements.headerGitStatus = headerGitStatus;
              return root.header.insertBefore(headerGitStatus, root.directoryName.nextSibling);
            });
          } else if (showHeaderGitStatus && (customElements.headerGitStatus != null)) {
            return _this.generateGitStatusText(customElements.headerGitStatus, repo);
          } else if (customElements.headerGitStatus != null) {
            root.header.removeChild(customElements.headerGitStatus);
            return customElements.headerGitStatus = null;
          }
        };
      })(this));
    };

    TreeViewUI.prototype.generateGitStatusText = function(container, repo) {
      var ahead, behind, display, head;
      display = false;
      head = null;
      ahead = behind = 0;
      return repo.refreshStatus().then(function() {
        return repo.getShortHead().then(function(shorthead) {
          return head = shorthead;
        });
      }).then(function() {
        if (repo.getCachedUpstreamAheadBehindCount != null) {
          return repo.getCachedUpstreamAheadBehindCount().then(function(count) {
            return ahead = count.ahead, behind = count.behind, count;
          });
        }
      }).then((function(_this) {
        return function() {
          var branchLabel, commitsAhead, commitsBehind;
          container.className = '';
          container.classList.add('tree-view-git-status');
          if (_this.showBranchLabel && (head != null)) {
            branchLabel = document.createElement('span');
            branchLabel.classList.add('branch-label');
            if (/^[a-z_-][a-z\d_-]*$/i.test(head)) {
              container.classList.add('git-branch-' + head);
            }
            branchLabel.textContent = head;
            display = true;
          }
          if (_this.showCommitsAheadLabel && ahead > 0) {
            commitsAhead = document.createElement('span');
            commitsAhead.classList.add('commits-ahead-label');
            commitsAhead.textContent = ahead;
            display = true;
          }
          if (_this.showCommitsBehindLabel && behind > 0) {
            commitsBehind = document.createElement('span');
            commitsBehind.classList.add('commits-behind-label');
            commitsBehind.textContent = behind;
            display = true;
          }
          if (display) {
            container.classList.remove('hide');
          } else {
            container.classList.add('hide');
          }
          container.innerHTML = '';
          if (branchLabel != null) {
            container.appendChild(branchLabel);
          }
          if (commitsAhead != null) {
            container.appendChild(commitsAhead);
          }
          if (commitsBehind != null) {
            return container.appendChild(commitsBehind);
          }
        };
      })(this));
    };

    TreeViewUI.prototype.convertDirectoryStatus = function(repo, status) {
      var newStatus;
      newStatus = null;
      if (repo.isStatusModified(status)) {
        newStatus = 'modified';
      } else if (repo.isStatusNew(status)) {
        newStatus = 'added';
      }
      return newStatus;
    };

    return TreeViewUI;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvdHJlZXZpZXd1aS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsUUFBQTs7eUJBQUEsS0FBQSxHQUFPOzt5QkFDUCxhQUFBLEdBQWU7O3lCQUNmLGdCQUFBLEdBQWtCOzt5QkFDbEIsYUFBQSxHQUFlOztJQUNmLGtCQUFBLEdBQ0U7TUFBRSxZQUFBLEVBQWMsQ0FBaEI7TUFBbUIsUUFBQSxFQUFVLENBQTdCO01BQWdDLE1BQUEsRUFBUSxDQUF4QztNQUEyQyxZQUFBLEVBQWMsQ0FBekQ7OztJQUNGLG1CQUFBLEdBQXNCLGtCQUFrQixDQUFDOztJQUU1QixvQkFBQyxRQUFELEVBQVksYUFBWjtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQVcsSUFBQyxDQUFBLGdCQUFEO01BRXZCLElBQUMsQ0FBQSx5QkFBRCxHQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnREFBaEI7TUFDRixJQUFDLENBQUEsZUFBRCxHQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEI7TUFDRixJQUFDLENBQUEscUJBQUQsR0FDRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNENBQWhCO01BQ0YsSUFBQyxDQUFBLHNCQUFELEdBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQjtNQUVGLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdC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QUEsQ0FBQSxDQUFBLElBQUEsQ0FiUjtJQU5xQjs7eUJBcUR2QixzQkFBQSxHQUF3QixTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ3RCLFVBQUE7TUFBQSxTQUFBLEdBQVk7TUFDWixJQUFHLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixDQUFIO1FBQ0UsU0FBQSxHQUFZLFdBRGQ7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsQ0FBSDtRQUNILFNBQUEsR0FBWSxRQURUOztBQUVMLGFBQU87SUFOZTs7Ozs7QUFyUTFCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xudXRpbHMgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRyZWVWaWV3VUlcblxuICByb290czogbnVsbFxuICByZXBvc2l0b3J5TWFwOiBudWxsXG4gIHRyZWVWaWV3Um9vdHNNYXA6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBFTlVNX1VQREFURV9TVEFUVVMgPVxuICAgIHsgTk9UX1VQREFUSU5HOiAwLCBVUERBVElORzogMSwgUVVFVUVEOiAyLCBRVUVVRURfUkVTRVQ6IDMgfVxuICBzdGF0dXNVcGRhdGluZ1Jvb3RzID0gRU5VTV9VUERBVEVfU1RBVFVTLk5PVF9VUERBVElOR1xuXG4gIGNvbnN0cnVjdG9yOiAoQHRyZWVWaWV3LCBAcmVwb3NpdG9yeU1hcCkgLT5cbiAgICAjIFJlYWQgY29uZmlndXJhdGlvblxuICAgIEBzaG93UHJvamVjdE1vZGlmaWVkU3RhdHVzID1cbiAgICAgIGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd1Byb2plY3RNb2RpZmllZFN0YXR1cydcbiAgICBAc2hvd0JyYW5jaExhYmVsID1cbiAgICAgIGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0JyYW5jaExhYmVsJ1xuICAgIEBzaG93Q29tbWl0c0FoZWFkTGFiZWwgPVxuICAgICAgYXRvbS5jb25maWcuZ2V0ICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5zaG93Q29tbWl0c0FoZWFkTGFiZWwnXG4gICAgQHNob3dDb21taXRzQmVoaW5kTGFiZWwgPVxuICAgICAgYXRvbS5jb25maWcuZ2V0ICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5zaG93Q29tbWl0c0JlaGluZExhYmVsJ1xuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEB0cmVlVmlld1Jvb3RzTWFwID0gbmV3IE1hcFxuXG4gICAgIyBCaW5kIGFnYWluc3QgZXZlbnRzIHdoaWNoIGFyZSBjYXVzaW5nIGFuIHVwZGF0ZSBvZiB0aGUgdHJlZSB2aWV3XG4gICAgQHN1YnNjcmliZVVwZGF0ZUNvbmZpZ3VyYXRpb25zKClcbiAgICBAc3Vic2NyaWJlVXBkYXRlVHJlZVZpZXcoKVxuXG4gICAgIyBUcmlnZ2VyIGluaXRhbCB1cGRhdGUgb2YgYWxsIHJvb3Qgbm9kZXNcbiAgICBAdXBkYXRlUm9vdHMgdHJ1ZVxuXG4gIGRlc3RydWN0OiAtPlxuICAgIEBjbGVhclRyZWVWaWV3Um9vdE1hcCgpXG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEB0cmVlVmlld1Jvb3RzTWFwID0gbnVsbFxuICAgIEByZXBvc2l0b3J5TWFwID0gbnVsbFxuICAgIEByb290cyA9IG51bGxcblxuICBzdWJzY3JpYmVVcGRhdGVUcmVlVmlldzogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyA9PlxuICAgICAgICBAdXBkYXRlUm9vdHMgdHJ1ZVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LmhpZGVWY3NJZ25vcmVkRmlsZXMnLCA9PlxuICAgICAgICBAdXBkYXRlUm9vdHMgdHJ1ZVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnLCA9PlxuICAgICAgICBAdXBkYXRlUm9vdHMgdHJ1ZVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnY29yZS5pZ25vcmVkTmFtZXMnLCA9PlxuICAgICAgICBAdXBkYXRlUm9vdHMgdHJ1ZSBpZiBhdG9tLmNvbmZpZy5nZXQgJ3RyZWUtdmlldy5oaWRlSWdub3JlZE5hbWVzJ1xuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndHJlZS12aWV3LnNvcnRGb2xkZXJzQmVmb3JlRmlsZXMnLCA9PlxuICAgICAgICBAdXBkYXRlUm9vdHMgdHJ1ZVxuICAgIClcblxuICBzdWJzY3JpYmVVcGRhdGVDb25maWd1cmF0aW9uczogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5zaG93UHJvamVjdE1vZGlmaWVkU3RhdHVzJyxcbiAgICAgICAgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgIGlmIEBzaG93UHJvamVjdE1vZGlmaWVkU3RhdHVzIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBzaG93UHJvamVjdE1vZGlmaWVkU3RhdHVzID0gbmV3VmFsdWVcbiAgICAgICAgICAgIEB1cGRhdGVSb290cygpXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3RyZWUtdmlldy1naXQtc3RhdHVzLnNob3dCcmFuY2hMYWJlbCcsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICBpZiBAc2hvd0JyYW5jaExhYmVsIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBzaG93QnJhbmNoTGFiZWwgPSBuZXdWYWx1ZVxuICAgICAgICAgIEB1cGRhdGVSb290cygpXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3RyZWUtdmlldy1naXQtc3RhdHVzLnNob3dDb21taXRzQWhlYWRMYWJlbCcsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICBpZiBAc2hvd0NvbW1pdHNBaGVhZExhYmVsIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBzaG93Q29tbWl0c0FoZWFkTGFiZWwgPSBuZXdWYWx1ZVxuICAgICAgICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICApXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0NvbW1pdHNCZWhpbmRMYWJlbCcsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICBpZiBAc2hvd0NvbW1pdHNCZWhpbmRMYWJlbCBpc250IG5ld1ZhbHVlXG4gICAgICAgICAgICBAc2hvd0NvbW1pdHNCZWhpbmRMYWJlbCA9IG5ld1ZhbHVlXG4gICAgICAgICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIClcblxuICBzZXRSZXBvc2l0b3JpZXM6IChyZXBvc2l0b3JpZXMpIC0+XG4gICAgaWYgcmVwb3NpdG9yaWVzP1xuICAgICAgQHJlcG9zaXRvcnlNYXAgPSByZXBvc2l0b3JpZXNcbiAgICAgIEB1cGRhdGVSb290cyB0cnVlXG5cbiAgY2xlYXJUcmVlVmlld1Jvb3RNYXA6IC0+XG4gICAgQHRyZWVWaWV3Um9vdHNNYXA/LmZvckVhY2ggKHJvb3QsIHJvb3RQYXRoKSAtPlxuICAgICAgcm9vdC5yb290Py5jbGFzc0xpc3Q/LnJlbW92ZSgnc3RhdHVzLW1vZGlmaWVkJywgJ3N0YXR1cy1hZGRlZCcpXG4gICAgICBjdXN0b21FbGVtZW50cyA9IHJvb3QuY3VzdG9tRWxlbWVudHNcbiAgICAgIGlmIGN1c3RvbUVsZW1lbnRzPy5oZWFkZXJHaXRTdGF0dXM/XG4gICAgICAgIHJvb3Qucm9vdD8uaGVhZGVyPy5yZW1vdmVDaGlsZChjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXMpXG4gICAgICAgIGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cyA9IG51bGxcbiAgICBAdHJlZVZpZXdSb290c01hcD8uY2xlYXIoKVxuXG4gIHVwZGF0ZVJvb3RzOiAocmVzZXQpIC0+XG4gICAgcmV0dXJuIGlmIG5vdCBAcmVwb3NpdG9yeU1hcD9cbiAgICBpZiBzdGF0dXNVcGRhdGluZ1Jvb3RzIGlzIEVOVU1fVVBEQVRFX1NUQVRVUy5OT1RfVVBEQVRJTkdcbiAgICAgIHN0YXR1c1VwZGF0aW5nUm9vdHMgPSBFTlVNX1VQREFURV9TVEFUVVMuVVBEQVRJTkdcbiAgICAgIEByb290cyA9IEB0cmVlVmlldy5yb290c1xuICAgICAgQGNsZWFyVHJlZVZpZXdSb290TWFwKCkgaWYgcmVzZXRcbiAgICAgIHVwZGF0ZVByb21pc2VzID0gW11cbiAgICAgIGZvciByb290IGluIEByb290c1xuICAgICAgICByb290UGF0aCA9IHV0aWxzLm5vcm1hbGl6ZVBhdGggcm9vdC5kaXJlY3RvcnlOYW1lLmRhdGFzZXQucGF0aFxuICAgICAgICBpZiByZXNldFxuICAgICAgICAgIEB0cmVlVmlld1Jvb3RzTWFwLnNldChyb290UGF0aCwge3Jvb3QsIGN1c3RvbUVsZW1lbnRzOiB7fX0pXG4gICAgICAgIHJlcG9Gb3JSb290ID0gbnVsbFxuICAgICAgICByZXBvU3ViUGF0aCA9IG51bGxcbiAgICAgICAgcm9vdFBhdGhIYXNHaXRGb2xkZXIgPSBmcy5leGlzdHNTeW5jKHBhdGguam9pbihyb290UGF0aCwgJy5naXQnKSlcbiAgICAgICAgQHJlcG9zaXRvcnlNYXAuZm9yRWFjaCAocmVwbywgcmVwb1BhdGgpIC0+XG4gICAgICAgICAgaWYgbm90IHJlcG9Gb3JSb290PyBhbmQgKChyb290UGF0aCBpcyByZXBvUGF0aCkgb3JcbiAgICAgICAgICAgICAgKHJvb3RQYXRoLmluZGV4T2YocmVwb1BhdGgpIGlzIDAgYW5kIG5vdCByb290UGF0aEhhc0dpdEZvbGRlcikpXG4gICAgICAgICAgICByZXBvU3ViUGF0aCA9IHBhdGgucmVsYXRpdmUgcmVwb1BhdGgsIHJvb3RQYXRoXG4gICAgICAgICAgICByZXBvRm9yUm9vdCA9IHJlcG9cbiAgICAgICAgaWYgcmVwb0ZvclJvb3Q/XG4gICAgICAgICAgaWYgbm90IHJlcG9Gb3JSb290P1xuICAgICAgICAgICAgcmVwb0ZvclJvb3QgPSBudWxsXG4gICAgICAgICAgdXBkYXRlUHJvbWlzZXMucHVzaChcbiAgICAgICAgICAgIEBkb1VwZGF0ZVJvb3ROb2RlIHJvb3QsIHJlcG9Gb3JSb290LCByb290UGF0aCwgcmVwb1N1YlBhdGhcbiAgICAgICAgICApXG4gICAgICAjIFdhaXQgdW50aWwgYWxsIHJvb3RzIGhhdmUgYmVlbiB1cGRhdGVkIGFuZCB0aGVuIGNoZWNrXG4gICAgICAjIGlmIHdlJ3ZlIGEgcXVldWVkIHVwZGF0ZSByb290cyBqb2JcbiAgICAgIHV0aWxzLnNldHRsZSh1cGRhdGVQcm9taXNlcylcbiAgICAgIC5jYXRjaCgoZXJyKSAtPlxuICAgICAgICAjIFByaW50IGVycm9ycyBpbiBjYXNlIHRoZXJlIGhhdmUgYmVlbiBhbnkuLi4gYW5kIHRoZW4gY29udGludXRlIHdpdGhcbiAgICAgICAgIyB0aGUgZm9sbG93aW5nIHRoZW4gYmxvY2tcbiAgICAgICAgY29uc29sZS5lcnJvciBlcnJcbiAgICAgIClcbiAgICAgIC50aGVuKD0+XG4gICAgICAgIGxhc3RTdGF0dXMgPSBzdGF0dXNVcGRhdGluZ1Jvb3RzXG4gICAgICAgIHN0YXR1c1VwZGF0aW5nUm9vdHMgPSBFTlVNX1VQREFURV9TVEFUVVMuTk9UX1VQREFUSU5HXG4gICAgICAgIGlmIGxhc3RTdGF0dXMgaXMgRU5VTV9VUERBVEVfU1RBVFVTLlFVRVVFRFxuICAgICAgICAgIEB1cGRhdGVSb290cygpXG4gICAgICAgIGVsc2UgaWYgbGFzdFN0YXR1cyBpcyBFTlVNX1VQREFURV9TVEFUVVMuUVVFVUVEX1JFU0VUXG4gICAgICAgICAgQHVwZGF0ZVJvb3RzKHRydWUpXG4gICAgICApXG5cblxuICAgIGVsc2UgaWYgc3RhdHVzVXBkYXRpbmdSb290cyBpcyBFTlVNX1VQREFURV9TVEFUVVMuVVBEQVRJTkdcbiAgICAgIHN0YXR1c1VwZGF0aW5nUm9vdHMgPSBFTlVNX1VQREFURV9TVEFUVVMuUVVFVUVEXG5cbiAgICBpZiBzdGF0dXNVcGRhdGluZ1Jvb3RzIGlzIEVOVU1fVVBEQVRFX1NUQVRVUy5RVUVVRUQgYW5kIHJlc2V0XG4gICAgICBzdGF0dXNVcGRhdGluZ1Jvb3RzID0gRU5VTV9VUERBVEVfU1RBVFVTLlFVRVVFRF9SRVNFVFxuXG4gIHVwZGF0ZVJvb3RGb3JSZXBvOiAocmVwbywgcmVwb1BhdGgpIC0+XG4gICAgQHVwZGF0ZVJvb3RzKCkgIyBUT0RPIFJlbW92ZSB3b3JrYXJvdW5kLi4uXG4gICAgIyBUT0RPIFNvbHZlIGNvbmN1cnJlbmN5IGlzc3VlcyB3aGVuIHVwZGF0aW5nIHRoZSByb290c1xuICAgICMgaWYgQHRyZWVWaWV3PyBhbmQgQHRyZWVWaWV3Um9vdHNNYXA/XG4gICAgIyAgIEB0cmVlVmlld1Jvb3RzTWFwLmZvckVhY2ggKHJvb3QsIHJvb3RQYXRoKSA9PlxuICAgICMgICAgICMgQ2hlY2sgaWYgdGhlIHJvb3QgcGF0aCBpcyBzdWIgcGF0aCBvZiByZXBvIHBhdGhcbiAgICAjICAgICByZXBvU3ViUGF0aCA9IHBhdGgucmVsYXRpdmUgcmVwb1BhdGgsIHJvb3RQYXRoXG4gICAgIyAgICAgaWYgcmVwb1N1YlBhdGguaW5kZXhPZignLi4nKSBpc250IDAgYW5kIHJvb3Qucm9vdD9cbiAgICAjICAgICAgIEBkb1VwZGF0ZVJvb3ROb2RlIHJvb3Qucm9vdCwgcmVwbywgcm9vdFBhdGgsIHJlcG9TdWJQYXRoXG5cbiAgZG9VcGRhdGVSb290Tm9kZTogKHJvb3QsIHJlcG8sIHJvb3RQYXRoLCByZXBvU3ViUGF0aCkgLT5cbiAgICBjdXN0b21FbGVtZW50cyA9IEB0cmVlVmlld1Jvb3RzTWFwLmdldChyb290UGF0aCkuY3VzdG9tRWxlbWVudHNcbiAgICB1cGRhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgIGlmIEBzaG93UHJvamVjdE1vZGlmaWVkU3RhdHVzIGFuZCByZXBvP1xuICAgICAgdXBkYXRlUHJvbWlzZSA9IHVwZGF0ZVByb21pc2UudGhlbiAoKSAtPlxuICAgICAgICBpZiByZXBvU3ViUGF0aCBpc250ICcnXG4gICAgICAgICAgcmV0dXJuIHJlcG8uZ2V0RGlyZWN0b3J5U3RhdHVzIHJlcG9TdWJQYXRoXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIFdvcmthcm91bmQgZm9yIHRoZSBpc3N1ZSB0aGF0ICdnZXREaXJlY3RvcnlTdGF0dXMnIGRvZXNuJ3Qgd29ya1xuICAgICAgICAgICMgb24gdGhlIHJlcG9zaXRvcnkgcm9vdCBmb2xkZXJcbiAgICAgICAgICByZXR1cm4gdXRpbHMuZ2V0Um9vdERpcmVjdG9yeVN0YXR1cyByZXBvXG5cbiAgICByZXR1cm4gdXBkYXRlUHJvbWlzZS50aGVuKChzdGF0dXMpID0+XG4gICAgICAjIFNhbml0eSBjaGVjay4uLlxuICAgICAgcmV0dXJuIHVubGVzcyBAcm9vdHM/XG5cbiAgICAgIGNvbnZTdGF0dXMgPSBAY29udmVydERpcmVjdG9yeVN0YXR1cyByZXBvLCBzdGF0dXNcbiAgICAgIHJvb3QuY2xhc3NMaXN0LnJlbW92ZSgnc3RhdHVzLW1vZGlmaWVkJywgJ3N0YXR1cy1hZGRlZCcpXG4gICAgICByb290LmNsYXNzTGlzdC5hZGQoXCJzdGF0dXMtI3tjb252U3RhdHVzfVwiKSBpZiBjb252U3RhdHVzP1xuXG4gICAgICBzaG93SGVhZGVyR2l0U3RhdHVzID0gQHNob3dCcmFuY2hMYWJlbCBvciBAc2hvd0NvbW1pdHNBaGVhZExhYmVsIG9yXG4gICAgICAgICAgQHNob3dDb21taXRzQmVoaW5kTGFiZWxcblxuICAgICAgaWYgc2hvd0hlYWRlckdpdFN0YXR1cyBhbmQgcmVwbz8gYW5kIG5vdCBjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXM/XG4gICAgICAgIGhlYWRlckdpdFN0YXR1cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBoZWFkZXJHaXRTdGF0dXMuY2xhc3NMaXN0LmFkZCgndHJlZS12aWV3LWdpdC1zdGF0dXMnKVxuICAgICAgICByZXR1cm4gQGdlbmVyYXRlR2l0U3RhdHVzVGV4dChoZWFkZXJHaXRTdGF0dXMsIHJlcG8pLnRoZW4gLT5cbiAgICAgICAgICBjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXMgPSBoZWFkZXJHaXRTdGF0dXNcbiAgICAgICAgICByb290LmhlYWRlci5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICBoZWFkZXJHaXRTdGF0dXMsIHJvb3QuZGlyZWN0b3J5TmFtZS5uZXh0U2libGluZ1xuICAgICAgICAgIClcbiAgICAgIGVsc2UgaWYgc2hvd0hlYWRlckdpdFN0YXR1cyBhbmQgY3VzdG9tRWxlbWVudHMuaGVhZGVyR2l0U3RhdHVzP1xuICAgICAgICByZXR1cm4gQGdlbmVyYXRlR2l0U3RhdHVzVGV4dCBjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXMsIHJlcG9cbiAgICAgIGVsc2UgaWYgY3VzdG9tRWxlbWVudHMuaGVhZGVyR2l0U3RhdHVzP1xuICAgICAgICByb290LmhlYWRlci5yZW1vdmVDaGlsZChjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXMpXG4gICAgICAgIGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cyA9IG51bGxcbiAgICApXG5cbiAgZ2VuZXJhdGVHaXRTdGF0dXNUZXh0OiAoY29udGFpbmVyLCByZXBvKSAtPlxuICAgIGRpc3BsYXkgPSBmYWxzZVxuICAgIGhlYWQgPSBudWxsXG4gICAgYWhlYWQgPSBiZWhpbmQgPSAwXG5cbiAgICAjIEVuc3VyZSByZXBvIHN0YXR1cyBpcyB1cC10by1kYXRlXG4gICAgcmVwby5yZWZyZXNoU3RhdHVzKClcbiAgICAgIC50aGVuIC0+XG4gICAgICAgIHJldHVybiByZXBvLmdldFNob3J0SGVhZCgpXG4gICAgICAgICAgLnRoZW4oKHNob3J0aGVhZCkgLT5cbiAgICAgICAgICAgIGhlYWQgPSBzaG9ydGhlYWRcbiAgICAgICAgICApXG4gICAgICAudGhlbiAtPlxuICAgICAgICAjIFNhbml0eSBjaGVjayBpbiBjYXNlIG9mIHRoaXJkcGFydHkgcmVwb3MuLi5cbiAgICAgICAgaWYgcmVwby5nZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQ/XG4gICAgICAgICAgcmV0dXJuIHJlcG8uZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KClcbiAgICAgICAgICAudGhlbigoY291bnQpIC0+XG4gICAgICAgICAgICB7YWhlYWQsIGJlaGluZH0gPSBjb3VudFxuICAgICAgICAgIClcbiAgICAgIC50aGVuID0+XG4gICAgICAgICMgUmVzZXQgc3R5bGVzXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAgJydcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RyZWUtdmlldy1naXQtc3RhdHVzJylcblxuICAgICAgICBpZiBAc2hvd0JyYW5jaExhYmVsIGFuZCBoZWFkP1xuICAgICAgICAgIGJyYW5jaExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgICAgYnJhbmNoTGFiZWwuY2xhc3NMaXN0LmFkZCgnYnJhbmNoLWxhYmVsJylcbiAgICAgICAgICAjIENoZWNrIGlmIGJyYW5jaCBuYW1lIGNhbiBiZSBhIHZhbGlkIENTUyBjbGFzc1xuICAgICAgICAgIGlmIC9eW2Etel8tXVthLXpcXGRfLV0qJC9pLnRlc3QoaGVhZClcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdnaXQtYnJhbmNoLScgKyBoZWFkKVxuICAgICAgICAgIGJyYW5jaExhYmVsLnRleHRDb250ZW50ID0gaGVhZFxuICAgICAgICAgIGRpc3BsYXkgPSB0cnVlXG4gICAgICAgIGlmIEBzaG93Q29tbWl0c0FoZWFkTGFiZWwgYW5kIGFoZWFkID4gMFxuICAgICAgICAgIGNvbW1pdHNBaGVhZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICAgIGNvbW1pdHNBaGVhZC5jbGFzc0xpc3QuYWRkKCdjb21taXRzLWFoZWFkLWxhYmVsJylcbiAgICAgICAgICBjb21taXRzQWhlYWQudGV4dENvbnRlbnQgPSBhaGVhZFxuICAgICAgICAgIGRpc3BsYXkgPSB0cnVlXG4gICAgICAgIGlmIEBzaG93Q29tbWl0c0JlaGluZExhYmVsIGFuZCBiZWhpbmQgPiAwXG4gICAgICAgICAgY29tbWl0c0JlaGluZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICAgIGNvbW1pdHNCZWhpbmQuY2xhc3NMaXN0LmFkZCgnY29tbWl0cy1iZWhpbmQtbGFiZWwnKVxuICAgICAgICAgIGNvbW1pdHNCZWhpbmQudGV4dENvbnRlbnQgPSBiZWhpbmRcbiAgICAgICAgICBkaXNwbGF5ID0gdHJ1ZVxuXG4gICAgICAgIGlmIGRpc3BsYXlcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG5cbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCBicmFuY2hMYWJlbCBpZiBicmFuY2hMYWJlbD9cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkIGNvbW1pdHNBaGVhZCBpZiBjb21taXRzQWhlYWQ/XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCBjb21taXRzQmVoaW5kIGlmIGNvbW1pdHNCZWhpbmQ/XG5cbiAgY29udmVydERpcmVjdG9yeVN0YXR1czogKHJlcG8sIHN0YXR1cykgLT5cbiAgICBuZXdTdGF0dXMgPSBudWxsXG4gICAgaWYgcmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1cylcbiAgICAgIG5ld1N0YXR1cyA9ICdtb2RpZmllZCdcbiAgICBlbHNlIGlmIHJlcG8uaXNTdGF0dXNOZXcoc3RhdHVzKVxuICAgICAgbmV3U3RhdHVzID0gJ2FkZGVkJ1xuICAgIHJldHVybiBuZXdTdGF0dXNcbiJdfQ==
