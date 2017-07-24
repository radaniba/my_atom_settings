(function() {
  var CompositeDisposable, GitFlowHandler, TreeViewUI, fs, path, utils;

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  fs = require('fs-plus');

  utils = require('./utils');

  GitFlowHandler = require('./gitflowhandler');

  module.exports = TreeViewUI = (function() {
    var ENUM_UPDATE_STATUS, statusUpdatingRoots;

    TreeViewUI.prototype.roots = null;

    TreeViewUI.prototype.repositoryMap = null;

    TreeViewUI.prototype.treeViewRootsMap = null;

    TreeViewUI.prototype.subscriptions = null;

    TreeViewUI.prototype.gitFlowHandler = null;

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
      this.gitFlowHandler = new GitFlowHandler(this);
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
      this.gitFlowHandler = null;
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
      var i, len, ref, repoForRoot, repoSubPath, root, rootPath, rootPathHasGitFolder, rootPathNoSymlink, updatePromises;
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
          rootPathNoSymlink = rootPath;
          if (fs.isSymbolicLinkSync(rootPath)) {
            rootPathNoSymlink = utils.normalizePath(fs.realpathSync(rootPath));
          }
          this.repositoryMap.forEach(function(repo, repoPath) {
            if ((repoForRoot == null) && ((rootPathNoSymlink === repoPath) || (rootPathNoSymlink.indexOf(repoPath) === 0 && !rootPathHasGitFolder))) {
              repoSubPath = path.relative(repoPath, rootPathNoSymlink);
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
          var asyncEvents, branchLabel, commitsAhead, commitsBehind;
          asyncEvents = [];
          container.className = '';
          container.classList.add('tree-view-git-status');
          if (_this.showBranchLabel && (head != null)) {
            branchLabel = document.createElement('span');
            branchLabel.classList.add('branch-label');
            if (/^[a-z_-][a-z\d_-]*$/i.test(head)) {
              container.classList.add('git-branch-' + head);
            }
            branchLabel.textContent = head;
            asyncEvents.push(_this.gitFlowHandler.enhanceBranchName(branchLabel, repo));
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
          return Promise.all(asyncEvents).then(function() {
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
          });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvdHJlZXZpZXd1aS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBQ1IsY0FBQSxHQUFpQixPQUFBLENBQVEsa0JBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCLFFBQUE7O3lCQUFBLEtBQUEsR0FBTzs7eUJBQ1AsYUFBQSxHQUFlOzt5QkFDZixnQkFBQSxHQUFrQjs7eUJBQ2xCLGFBQUEsR0FBZTs7eUJBQ2YsY0FBQSxHQUFnQjs7SUFDaEIsa0JBQUEsR0FDRTtNQUFFLFlBQUEsRUFBYyxDQUFoQjtNQUFtQixRQUFBLEVBQVUsQ0FBN0I7TUFBZ0MsTUFBQSxFQUFRLENBQXhDO01BQTJDLFlBQUEsRUFBYyxDQUF6RDs7O0lBQ0YsbUJBQUEsR0FBc0Isa0JBQWtCLENBQUM7O0lBRTVCLG9CQUFDLFFBQUQsRUFBWSxhQUFaO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFBVyxJQUFDLENBQUEsZ0JBQUQ7TUFFdkIsSUFBQyxDQUFBLHlCQUFELEdBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdEQUFoQjtNQUNGLElBQUMsQ0FBQSxlQUFELEdBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQjtNQUNGLElBQUMsQ0FBQSxxQkFBRCxHQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0Q0FBaEI7TUFDRixJQUFDLENBQUEsc0JBQUQsR0FDRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkNB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QUFDLFdBQWQsR0FBNEI7WUFDNUIsT0FBQSxHQUFVLEtBSlo7O1VBTUEsSUFBRyxPQUFIO1lBQ0UsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFwQixDQUEyQixNQUEzQixFQURGO1dBQUEsTUFBQTtZQUdFLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBcEIsQ0FBd0IsTUFBeEIsRUFIRjs7QUFPQSxpQkFBTyxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixTQUFBO1lBQ25DLFNBQVMsQ0FBQyxTQUFWLEdBQXNCO1lBQ3RCLElBQXFDLG1CQUFyQztjQUFBLFNBQVMsQ0FBQyxXQUFWLENBQXNCLFdBQXRCLEVBQUE7O1lBQ0EsSUFBc0Msb0JBQXRDO2NBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsWUFBdEIsRUFBQTs7WUFDQSxJQUF1QyxxQkFBdkM7cUJBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsYUFBdEIsRUFBQTs7VUFKbUMsQ0FBOUI7UUF2Q0g7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBYlI7SUFOcUI7O3lCQWdFdkIsc0JBQUEsR0FBd0IsU0FBQyxJQUFELEVBQU8sTUFBUDtBQUN0QixVQUFBO01BQUEsU0FBQSxHQUFZO01BQ1osSUFBRyxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsTUFBdEIsQ0FBSDtRQUNFLFNBQUEsR0FBWSxXQURkO09BQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLENBQUg7UUFDSCxTQUFBLEdBQVksUUFEVDs7QUFFTCxhQUFPO0lBTmU7Ozs7O0FBNVIxQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnV0aWxzID0gcmVxdWlyZSAnLi91dGlscydcbkdpdEZsb3dIYW5kbGVyID0gcmVxdWlyZSAnLi9naXRmbG93aGFuZGxlcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmVlVmlld1VJXG5cbiAgcm9vdHM6IG51bGxcbiAgcmVwb3NpdG9yeU1hcDogbnVsbFxuICB0cmVlVmlld1Jvb3RzTWFwOiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgZ2l0Rmxvd0hhbmRsZXI6IG51bGxcbiAgRU5VTV9VUERBVEVfU1RBVFVTID1cbiAgICB7IE5PVF9VUERBVElORzogMCwgVVBEQVRJTkc6IDEsIFFVRVVFRDogMiwgUVVFVUVEX1JFU0VUOiAzIH1cbiAgc3RhdHVzVXBkYXRpbmdSb290cyA9IEVOVU1fVVBEQVRFX1NUQVRVUy5OT1RfVVBEQVRJTkdcblxuICBjb25zdHJ1Y3RvcjogKEB0cmVlVmlldywgQHJlcG9zaXRvcnlNYXApIC0+XG4gICAgIyBSZWFkIGNvbmZpZ3VyYXRpb25cbiAgICBAc2hvd1Byb2plY3RNb2RpZmllZFN0YXR1cyA9XG4gICAgICBhdG9tLmNvbmZpZy5nZXQgJ3RyZWUtdmlldy1naXQtc3RhdHVzLnNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXMnXG4gICAgQHNob3dCcmFuY2hMYWJlbCA9XG4gICAgICBhdG9tLmNvbmZpZy5nZXQgJ3RyZWUtdmlldy1naXQtc3RhdHVzLnNob3dCcmFuY2hMYWJlbCdcbiAgICBAc2hvd0NvbW1pdHNBaGVhZExhYmVsID1cbiAgICAgIGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0NvbW1pdHNBaGVhZExhYmVsJ1xuICAgIEBzaG93Q29tbWl0c0JlaGluZExhYmVsID1cbiAgICAgIGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0NvbW1pdHNCZWhpbmRMYWJlbCdcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAdHJlZVZpZXdSb290c01hcCA9IG5ldyBNYXBcbiAgICBAZ2l0Rmxvd0hhbmRsZXIgPSBuZXcgR2l0Rmxvd0hhbmRsZXIodGhpcylcblxuICAgICMgQmluZCBhZ2FpbnN0IGV2ZW50cyB3aGljaCBhcmUgY2F1c2luZyBhbiB1cGRhdGUgb2YgdGhlIHRyZWUgdmlld1xuICAgIEBzdWJzY3JpYmVVcGRhdGVDb25maWd1cmF0aW9ucygpXG4gICAgQHN1YnNjcmliZVVwZGF0ZVRyZWVWaWV3KClcblxuICAgICMgVHJpZ2dlciBpbml0YWwgdXBkYXRlIG9mIGFsbCByb290IG5vZGVzXG4gICAgQHVwZGF0ZVJvb3RzIHRydWVcblxuICBkZXN0cnVjdDogLT5cbiAgICBAY2xlYXJUcmVlVmlld1Jvb3RNYXAoKVxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICBAdHJlZVZpZXdSb290c01hcCA9IG51bGxcbiAgICBAZ2l0Rmxvd0hhbmRsZXIgPSBudWxsXG4gICAgQHJlcG9zaXRvcnlNYXAgPSBudWxsXG4gICAgQHJvb3RzID0gbnVsbFxuXG4gIHN1YnNjcmliZVVwZGF0ZVRyZWVWaWV3OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG4gICAgICAgIEB1cGRhdGVSb290cyB0cnVlXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuaGlkZVZjc0lnbm9yZWRGaWxlcycsID0+XG4gICAgICAgIEB1cGRhdGVSb290cyB0cnVlXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuaGlkZUlnbm9yZWROYW1lcycsID0+XG4gICAgICAgIEB1cGRhdGVSb290cyB0cnVlXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdjb3JlLmlnbm9yZWROYW1lcycsID0+XG4gICAgICAgIEB1cGRhdGVSb290cyB0cnVlIGlmIGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LmhpZGVJZ25vcmVkTmFtZXMnXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0cmVlLXZpZXcuc29ydEZvbGRlcnNCZWZvcmVGaWxlcycsID0+XG4gICAgICAgIEB1cGRhdGVSb290cyB0cnVlXG4gICAgKVxuXG4gIHN1YnNjcmliZVVwZGF0ZUNvbmZpZ3VyYXRpb25zOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3RyZWUtdmlldy1naXQtc3RhdHVzLnNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXMnLFxuICAgICAgICAobmV3VmFsdWUpID0+XG4gICAgICAgICAgaWYgQHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXMgaXNudCBuZXdWYWx1ZVxuICAgICAgICAgICAgQHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXMgPSBuZXdWYWx1ZVxuICAgICAgICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICApXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0JyYW5jaExhYmVsJyxcbiAgICAgICAgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgIGlmIEBzaG93QnJhbmNoTGFiZWwgaXNudCBuZXdWYWx1ZVxuICAgICAgICAgICAgQHNob3dCcmFuY2hMYWJlbCA9IG5ld1ZhbHVlXG4gICAgICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICApXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAndHJlZS12aWV3LWdpdC1zdGF0dXMuc2hvd0NvbW1pdHNBaGVhZExhYmVsJyxcbiAgICAgICAgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgIGlmIEBzaG93Q29tbWl0c0FoZWFkTGFiZWwgaXNudCBuZXdWYWx1ZVxuICAgICAgICAgICAgQHNob3dDb21taXRzQWhlYWRMYWJlbCA9IG5ld1ZhbHVlXG4gICAgICAgICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5zaG93Q29tbWl0c0JlaGluZExhYmVsJyxcbiAgICAgICAgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgIGlmIEBzaG93Q29tbWl0c0JlaGluZExhYmVsIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBzaG93Q29tbWl0c0JlaGluZExhYmVsID0gbmV3VmFsdWVcbiAgICAgICAgICAgIEB1cGRhdGVSb290cygpXG4gICAgKVxuXG4gIHNldFJlcG9zaXRvcmllczogKHJlcG9zaXRvcmllcykgLT5cbiAgICBpZiByZXBvc2l0b3JpZXM/XG4gICAgICBAcmVwb3NpdG9yeU1hcCA9IHJlcG9zaXRvcmllc1xuICAgICAgQHVwZGF0ZVJvb3RzIHRydWVcblxuICBjbGVhclRyZWVWaWV3Um9vdE1hcDogLT5cbiAgICBAdHJlZVZpZXdSb290c01hcD8uZm9yRWFjaCAocm9vdCwgcm9vdFBhdGgpIC0+XG4gICAgICByb290LnJvb3Q/LmNsYXNzTGlzdD8ucmVtb3ZlKCdzdGF0dXMtbW9kaWZpZWQnLCAnc3RhdHVzLWFkZGVkJylcbiAgICAgIGN1c3RvbUVsZW1lbnRzID0gcm9vdC5jdXN0b21FbGVtZW50c1xuICAgICAgaWYgY3VzdG9tRWxlbWVudHM/LmhlYWRlckdpdFN0YXR1cz9cbiAgICAgICAgcm9vdC5yb290Py5oZWFkZXI/LnJlbW92ZUNoaWxkKGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cylcbiAgICAgICAgY3VzdG9tRWxlbWVudHMuaGVhZGVyR2l0U3RhdHVzID0gbnVsbFxuICAgIEB0cmVlVmlld1Jvb3RzTWFwPy5jbGVhcigpXG5cbiAgdXBkYXRlUm9vdHM6IChyZXNldCkgLT5cbiAgICByZXR1cm4gaWYgbm90IEByZXBvc2l0b3J5TWFwP1xuICAgIGlmIHN0YXR1c1VwZGF0aW5nUm9vdHMgaXMgRU5VTV9VUERBVEVfU1RBVFVTLk5PVF9VUERBVElOR1xuICAgICAgc3RhdHVzVXBkYXRpbmdSb290cyA9IEVOVU1fVVBEQVRFX1NUQVRVUy5VUERBVElOR1xuICAgICAgQHJvb3RzID0gQHRyZWVWaWV3LnJvb3RzXG4gICAgICBAY2xlYXJUcmVlVmlld1Jvb3RNYXAoKSBpZiByZXNldFxuICAgICAgdXBkYXRlUHJvbWlzZXMgPSBbXVxuICAgICAgZm9yIHJvb3QgaW4gQHJvb3RzXG4gICAgICAgIHJvb3RQYXRoID0gdXRpbHMubm9ybWFsaXplUGF0aCByb290LmRpcmVjdG9yeU5hbWUuZGF0YXNldC5wYXRoXG4gICAgICAgIGlmIHJlc2V0XG4gICAgICAgICAgQHRyZWVWaWV3Um9vdHNNYXAuc2V0KHJvb3RQYXRoLCB7cm9vdCwgY3VzdG9tRWxlbWVudHM6IHt9fSlcbiAgICAgICAgcmVwb0ZvclJvb3QgPSBudWxsXG4gICAgICAgIHJlcG9TdWJQYXRoID0gbnVsbFxuICAgICAgICByb290UGF0aEhhc0dpdEZvbGRlciA9IGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHJvb3RQYXRoLCAnLmdpdCcpKVxuICAgICAgICAjIFdvcmthcm91bmQ6IHJlcG9QYXloIGlzIHRoZSByZWFsIHBhdGggb2YgdGhlIHJlcG9zaXRvcnkuIFdoZW4gcm9vdFBhdGhcbiAgICAgICAgIyBpcyBhIHN5bWJvbGljIGxpbmssIGJvdGggZG8gbm90IG5vdCBtYXRjaCBhbmQgdGhlIHJlcG9zaXRvcnkgaXMgbmV2ZXJcbiAgICAgICAgIyBmb3VuZC4gSW4gdGhpcyBjYXNlLCB3ZSBleHBhbmQgdGhlIHN5bWJvbGljIGxpbmssIG1ha2UgaXQgYWJzb2x1dGUgYW5kXG4gICAgICAgICMgbm9ybWFsaXplIGl0IHRvIG1ha2Ugc3VyZSBpdCBtYXRjaGVzLlxuICAgICAgICByb290UGF0aE5vU3ltbGluayA9IHJvb3RQYXRoXG4gICAgICAgIGlmIChmcy5pc1N5bWJvbGljTGlua1N5bmMocm9vdFBhdGgpKVxuICAgICAgICAgIHJvb3RQYXRoTm9TeW1saW5rID0gdXRpbHMubm9ybWFsaXplUGF0aChmcy5yZWFscGF0aFN5bmMocm9vdFBhdGgpKVxuICAgICAgICBAcmVwb3NpdG9yeU1hcC5mb3JFYWNoIChyZXBvLCByZXBvUGF0aCkgLT5cbiAgICAgICAgICBpZiBub3QgcmVwb0ZvclJvb3Q/IGFuZCAoKHJvb3RQYXRoTm9TeW1saW5rIGlzIHJlcG9QYXRoKSBvclxuICAgICAgICAgICAgICAocm9vdFBhdGhOb1N5bWxpbmsuaW5kZXhPZihyZXBvUGF0aCkgaXMgMCBhbmRcbiAgICAgICAgICAgICAgbm90IHJvb3RQYXRoSGFzR2l0Rm9sZGVyKSlcbiAgICAgICAgICAgIHJlcG9TdWJQYXRoID0gcGF0aC5yZWxhdGl2ZSByZXBvUGF0aCwgcm9vdFBhdGhOb1N5bWxpbmtcbiAgICAgICAgICAgIHJlcG9Gb3JSb290ID0gcmVwb1xuICAgICAgICBpZiByZXBvRm9yUm9vdD9cbiAgICAgICAgICBpZiBub3QgcmVwb0ZvclJvb3Q/XG4gICAgICAgICAgICByZXBvRm9yUm9vdCA9IG51bGxcbiAgICAgICAgICB1cGRhdGVQcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgQGRvVXBkYXRlUm9vdE5vZGUgcm9vdCwgcmVwb0ZvclJvb3QsIHJvb3RQYXRoLCByZXBvU3ViUGF0aFxuICAgICAgICAgIClcbiAgICAgICMgV2FpdCB1bnRpbCBhbGwgcm9vdHMgaGF2ZSBiZWVuIHVwZGF0ZWQgYW5kIHRoZW4gY2hlY2tcbiAgICAgICMgaWYgd2UndmUgYSBxdWV1ZWQgdXBkYXRlIHJvb3RzIGpvYlxuICAgICAgdXRpbHMuc2V0dGxlKHVwZGF0ZVByb21pc2VzKVxuICAgICAgLmNhdGNoKChlcnIpIC0+XG4gICAgICAgICMgUHJpbnQgZXJyb3JzIGluIGNhc2UgdGhlcmUgaGF2ZSBiZWVuIGFueS4uLiBhbmQgdGhlbiBjb250aW51dGUgd2l0aFxuICAgICAgICAjIHRoZSBmb2xsb3dpbmcgdGhlbiBibG9ja1xuICAgICAgICBjb25zb2xlLmVycm9yIGVyclxuICAgICAgKVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgbGFzdFN0YXR1cyA9IHN0YXR1c1VwZGF0aW5nUm9vdHNcbiAgICAgICAgc3RhdHVzVXBkYXRpbmdSb290cyA9IEVOVU1fVVBEQVRFX1NUQVRVUy5OT1RfVVBEQVRJTkdcbiAgICAgICAgaWYgbGFzdFN0YXR1cyBpcyBFTlVNX1VQREFURV9TVEFUVVMuUVVFVUVEXG4gICAgICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICAgICAgZWxzZSBpZiBsYXN0U3RhdHVzIGlzIEVOVU1fVVBEQVRFX1NUQVRVUy5RVUVVRURfUkVTRVRcbiAgICAgICAgICBAdXBkYXRlUm9vdHModHJ1ZSlcbiAgICAgIClcblxuXG4gICAgZWxzZSBpZiBzdGF0dXNVcGRhdGluZ1Jvb3RzIGlzIEVOVU1fVVBEQVRFX1NUQVRVUy5VUERBVElOR1xuICAgICAgc3RhdHVzVXBkYXRpbmdSb290cyA9IEVOVU1fVVBEQVRFX1NUQVRVUy5RVUVVRURcblxuICAgIGlmIHN0YXR1c1VwZGF0aW5nUm9vdHMgaXMgRU5VTV9VUERBVEVfU1RBVFVTLlFVRVVFRCBhbmQgcmVzZXRcbiAgICAgIHN0YXR1c1VwZGF0aW5nUm9vdHMgPSBFTlVNX1VQREFURV9TVEFUVVMuUVVFVUVEX1JFU0VUXG5cbiAgdXBkYXRlUm9vdEZvclJlcG86IChyZXBvLCByZXBvUGF0aCkgLT5cbiAgICBAdXBkYXRlUm9vdHMoKSAjIFRPRE8gUmVtb3ZlIHdvcmthcm91bmQuLi5cbiAgICAjIFRPRE8gU29sdmUgY29uY3VycmVuY3kgaXNzdWVzIHdoZW4gdXBkYXRpbmcgdGhlIHJvb3RzXG4gICAgIyBpZiBAdHJlZVZpZXc/IGFuZCBAdHJlZVZpZXdSb290c01hcD9cbiAgICAjICAgQHRyZWVWaWV3Um9vdHNNYXAuZm9yRWFjaCAocm9vdCwgcm9vdFBhdGgpID0+XG4gICAgIyAgICAgIyBDaGVjayBpZiB0aGUgcm9vdCBwYXRoIGlzIHN1YiBwYXRoIG9mIHJlcG8gcGF0aFxuICAgICMgICAgIHJlcG9TdWJQYXRoID0gcGF0aC5yZWxhdGl2ZSByZXBvUGF0aCwgcm9vdFBhdGhcbiAgICAjICAgICBpZiByZXBvU3ViUGF0aC5pbmRleE9mKCcuLicpIGlzbnQgMCBhbmQgcm9vdC5yb290P1xuICAgICMgICAgICAgQGRvVXBkYXRlUm9vdE5vZGUgcm9vdC5yb290LCByZXBvLCByb290UGF0aCwgcmVwb1N1YlBhdGhcblxuICBkb1VwZGF0ZVJvb3ROb2RlOiAocm9vdCwgcmVwbywgcm9vdFBhdGgsIHJlcG9TdWJQYXRoKSAtPlxuICAgIGN1c3RvbUVsZW1lbnRzID0gQHRyZWVWaWV3Um9vdHNNYXAuZ2V0KHJvb3RQYXRoKS5jdXN0b21FbGVtZW50c1xuICAgIHVwZGF0ZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgaWYgQHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXMgYW5kIHJlcG8/XG4gICAgICB1cGRhdGVQcm9taXNlID0gdXBkYXRlUHJvbWlzZS50aGVuICgpIC0+XG4gICAgICAgIGlmIHJlcG9TdWJQYXRoIGlzbnQgJydcbiAgICAgICAgICByZXR1cm4gcmVwby5nZXREaXJlY3RvcnlTdGF0dXMgcmVwb1N1YlBhdGhcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgV29ya2Fyb3VuZCBmb3IgdGhlIGlzc3VlIHRoYXQgJ2dldERpcmVjdG9yeVN0YXR1cycgZG9lc24ndCB3b3JrXG4gICAgICAgICAgIyBvbiB0aGUgcmVwb3NpdG9yeSByb290IGZvbGRlclxuICAgICAgICAgIHJldHVybiB1dGlscy5nZXRSb290RGlyZWN0b3J5U3RhdHVzIHJlcG9cblxuICAgIHJldHVybiB1cGRhdGVQcm9taXNlLnRoZW4oKHN0YXR1cykgPT5cbiAgICAgICMgU2FuaXR5IGNoZWNrLi4uXG4gICAgICByZXR1cm4gdW5sZXNzIEByb290cz9cblxuICAgICAgY29udlN0YXR1cyA9IEBjb252ZXJ0RGlyZWN0b3J5U3RhdHVzIHJlcG8sIHN0YXR1c1xuICAgICAgcm9vdC5jbGFzc0xpc3QucmVtb3ZlKCdzdGF0dXMtbW9kaWZpZWQnLCAnc3RhdHVzLWFkZGVkJylcbiAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZChcInN0YXR1cy0je2NvbnZTdGF0dXN9XCIpIGlmIGNvbnZTdGF0dXM/XG5cbiAgICAgIHNob3dIZWFkZXJHaXRTdGF0dXMgPSBAc2hvd0JyYW5jaExhYmVsIG9yIEBzaG93Q29tbWl0c0FoZWFkTGFiZWwgb3JcbiAgICAgICAgICBAc2hvd0NvbW1pdHNCZWhpbmRMYWJlbFxuXG4gICAgICBpZiBzaG93SGVhZGVyR2l0U3RhdHVzIGFuZCByZXBvPyBhbmQgbm90IGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cz9cbiAgICAgICAgaGVhZGVyR2l0U3RhdHVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGhlYWRlckdpdFN0YXR1cy5jbGFzc0xpc3QuYWRkKCd0cmVlLXZpZXctZ2l0LXN0YXR1cycpXG4gICAgICAgIHJldHVybiBAZ2VuZXJhdGVHaXRTdGF0dXNUZXh0KGhlYWRlckdpdFN0YXR1cywgcmVwbykudGhlbiAtPlxuICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cyA9IGhlYWRlckdpdFN0YXR1c1xuICAgICAgICAgIHJvb3QuaGVhZGVyLmluc2VydEJlZm9yZShcbiAgICAgICAgICAgIGhlYWRlckdpdFN0YXR1cywgcm9vdC5kaXJlY3RvcnlOYW1lLm5leHRTaWJsaW5nXG4gICAgICAgICAgKVxuICAgICAgZWxzZSBpZiBzaG93SGVhZGVyR2l0U3RhdHVzIGFuZCBjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXM/XG4gICAgICAgIHJldHVybiBAZ2VuZXJhdGVHaXRTdGF0dXNUZXh0IGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cywgcmVwb1xuICAgICAgZWxzZSBpZiBjdXN0b21FbGVtZW50cy5oZWFkZXJHaXRTdGF0dXM/XG4gICAgICAgIHJvb3QuaGVhZGVyLnJlbW92ZUNoaWxkKGN1c3RvbUVsZW1lbnRzLmhlYWRlckdpdFN0YXR1cylcbiAgICAgICAgY3VzdG9tRWxlbWVudHMuaGVhZGVyR2l0U3RhdHVzID0gbnVsbFxuICAgIClcblxuICBnZW5lcmF0ZUdpdFN0YXR1c1RleHQ6IChjb250YWluZXIsIHJlcG8pIC0+XG4gICAgZGlzcGxheSA9IGZhbHNlXG4gICAgaGVhZCA9IG51bGxcbiAgICBhaGVhZCA9IGJlaGluZCA9IDBcblxuICAgICMgRW5zdXJlIHJlcG8gc3RhdHVzIGlzIHVwLXRvLWRhdGVcbiAgICByZXBvLnJlZnJlc2hTdGF0dXMoKVxuICAgICAgLnRoZW4gLT5cbiAgICAgICAgcmV0dXJuIHJlcG8uZ2V0U2hvcnRIZWFkKClcbiAgICAgICAgICAudGhlbigoc2hvcnRoZWFkKSAtPlxuICAgICAgICAgICAgaGVhZCA9IHNob3J0aGVhZFxuICAgICAgICAgIClcbiAgICAgIC50aGVuIC0+XG4gICAgICAgICMgU2FuaXR5IGNoZWNrIGluIGNhc2Ugb2YgdGhpcmRwYXJ0eSByZXBvcy4uLlxuICAgICAgICBpZiByZXBvLmdldENhY2hlZFVwc3RyZWFtQWhlYWRCZWhpbmRDb3VudD9cbiAgICAgICAgICByZXR1cm4gcmVwby5nZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQoKVxuICAgICAgICAgIC50aGVuKChjb3VudCkgLT5cbiAgICAgICAgICAgIHthaGVhZCwgYmVoaW5kfSA9IGNvdW50XG4gICAgICAgICAgKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgYXN5bmNFdmVudHMgPSBbXVxuICAgICAgICAjIFJlc2V0IHN0eWxlc1xuICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lID0gICcnXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCd0cmVlLXZpZXctZ2l0LXN0YXR1cycpXG5cbiAgICAgICAgaWYgQHNob3dCcmFuY2hMYWJlbCBhbmQgaGVhZD9cbiAgICAgICAgICBicmFuY2hMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICAgIGJyYW5jaExhYmVsLmNsYXNzTGlzdC5hZGQoJ2JyYW5jaC1sYWJlbCcpXG4gICAgICAgICAgIyBDaGVjayBpZiBicmFuY2ggbmFtZSBjYW4gYmUgYSB2YWxpZCBDU1MgY2xhc3NcbiAgICAgICAgICBpZiAvXlthLXpfLV1bYS16XFxkXy1dKiQvaS50ZXN0KGhlYWQpXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZ2l0LWJyYW5jaC0nICsgaGVhZClcbiAgICAgICAgICBicmFuY2hMYWJlbC50ZXh0Q29udGVudCA9IGhlYWRcblxuICAgICAgICAgICMgRm9yd2FyZCB0byBHaXRGbG93SGFuZGxlciwgdGhpcyBtZXRob2QgcnVucyBhc3luY1xuICAgICAgICAgIGFzeW5jRXZlbnRzLnB1c2goXG4gICAgICAgICAgICBAZ2l0Rmxvd0hhbmRsZXIuZW5oYW5jZUJyYW5jaE5hbWUgYnJhbmNoTGFiZWwsIHJlcG9cbiAgICAgICAgICApXG5cbiAgICAgICAgICAjIE1hcmsgYXMgZGlzcGxheWFibGVcbiAgICAgICAgICBkaXNwbGF5ID0gdHJ1ZVxuICAgICAgICBpZiBAc2hvd0NvbW1pdHNBaGVhZExhYmVsIGFuZCBhaGVhZCA+IDBcbiAgICAgICAgICBjb21taXRzQWhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgICBjb21taXRzQWhlYWQuY2xhc3NMaXN0LmFkZCgnY29tbWl0cy1haGVhZC1sYWJlbCcpXG4gICAgICAgICAgY29tbWl0c0FoZWFkLnRleHRDb250ZW50ID0gYWhlYWRcbiAgICAgICAgICBkaXNwbGF5ID0gdHJ1ZVxuICAgICAgICBpZiBAc2hvd0NvbW1pdHNCZWhpbmRMYWJlbCBhbmQgYmVoaW5kID4gMFxuICAgICAgICAgIGNvbW1pdHNCZWhpbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgICBjb21taXRzQmVoaW5kLmNsYXNzTGlzdC5hZGQoJ2NvbW1pdHMtYmVoaW5kLWxhYmVsJylcbiAgICAgICAgICBjb21taXRzQmVoaW5kLnRleHRDb250ZW50ID0gYmVoaW5kXG4gICAgICAgICAgZGlzcGxheSA9IHRydWVcblxuICAgICAgICBpZiBkaXNwbGF5XG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuXG4gICAgICAgICMgV2FpdCBmb3IgYWxsIGFzeW5jIG1ldGhvZHMgdG8gY29tcGxldGUsIG9yIHJlc29sdmUgaW5zdGFudGx5XG4gICAgICAgICMgaWYgdGhlIGFycmF5IGlzIGVtcHR5LlxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXN5bmNFdmVudHMpLnRoZW4gLT5cbiAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcbiAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgYnJhbmNoTGFiZWwgaWYgYnJhbmNoTGFiZWw/XG4gICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkIGNvbW1pdHNBaGVhZCBpZiBjb21taXRzQWhlYWQ/XG4gICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkIGNvbW1pdHNCZWhpbmQgaWYgY29tbWl0c0JlaGluZD9cblxuICBjb252ZXJ0RGlyZWN0b3J5U3RhdHVzOiAocmVwbywgc3RhdHVzKSAtPlxuICAgIG5ld1N0YXR1cyA9IG51bGxcbiAgICBpZiByZXBvLmlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzKVxuICAgICAgbmV3U3RhdHVzID0gJ21vZGlmaWVkJ1xuICAgIGVsc2UgaWYgcmVwby5pc1N0YXR1c05ldyhzdGF0dXMpXG4gICAgICBuZXdTdGF0dXMgPSAnYWRkZWQnXG4gICAgcmV0dXJuIG5ld1N0YXR1c1xuIl19
