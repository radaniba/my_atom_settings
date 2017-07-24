(function() {
  var CompositeDisposable, Emitter, ProjectRepositories, TreeViewGitStatus, TreeViewUI, ref, utils;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ProjectRepositories = require('./repositories');

  TreeViewUI = require('./treeviewui');

  utils = require('./utils');

  module.exports = TreeViewGitStatus = {
    config: {
      autoToggle: {
        order: 1,
        type: 'boolean',
        "default": true,
        description: 'Show the Git status in the tree view when starting Atom'
      },
      showProjectModifiedStatus: {
        order: 2,
        type: 'boolean',
        "default": true,
        description: 'Mark project folder as modified in case there are any ' + 'uncommited changes'
      },
      showBranchLabel: {
        order: 3,
        type: 'boolean',
        "default": true
      },
      showCommitsAheadLabel: {
        order: 4,
        type: 'boolean',
        "default": true
      },
      showCommitsBehindLabel: {
        order: 5,
        type: 'boolean',
        "default": true
      },
      gitFlow: {
        order: 6,
        type: 'object',
        properties: {
          enabled: {
            order: 1,
            type: 'boolean',
            "default": true,
            title: 'Enable Git Flow',
            description: 'Git Flow support requires you to [install Git Flow](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation) and run `git flow init` on the ' + 'repository you want to work on'
          },
          display_type: {
            order: 2,
            type: 'integer',
            "default": 1,
            title: 'Git Flow display type',
            minimum: 1,
            maximum: 3,
            "enum": [
              {
                value: 1,
                description: 'Show prefix and branchname'
              }, {
                value: 2,
                description: 'Show icon, prefix and branchname'
              }, {
                value: 3,
                description: 'Show icon and branchname'
              }
            ]
          }
        }
      }
    },
    subscriptions: null,
    toggledSubscriptions: null,
    treeView: null,
    subscriptionsOfCommands: null,
    active: false,
    repos: null,
    treeViewUI: null,
    ignoredRepositories: null,
    emitter: null,
    isActivatedFlag: false,
    activate: function() {
      this.emitter = new Emitter;
      this.ignoredRepositories = new Map;
      this.subscriptionsOfCommands = new CompositeDisposable;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.packages.onDidActivateInitialPackages((function(_this) {
        return function() {
          return _this.doInitPackage();
        };
      })(this)));
      this.activateInterval = setInterval(((function(_this) {
        return function() {
          return _this.doInitPackage();
        };
      })(this)), 1000);
      return this.doInitPackage();
    },
    doInitPackage: function() {
      var autoToggle, treeView;
      treeView = this.getTreeView();
      if (!(treeView && !this.active)) {
        return;
      }
      clearInterval(this.activateInterval);
      this.activateInterval = null;
      this.treeView = treeView;
      this.active = true;
      this.subscriptionsOfCommands.add(atom.commands.add('atom-workspace', {
        'tree-view-git-status:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      autoToggle = atom.config.get('tree-view-git-status.autoToggle');
      if (autoToggle) {
        this.toggle();
      }
      this.isActivatedFlag = true;
      return this.emitter.emit('did-activate');
    },
    deactivate: function() {
      var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      this.subscriptions = null;
      if ((ref2 = this.subscriptionsOfCommands) != null) {
        ref2.dispose();
      }
      this.subscriptionsOfCommands = null;
      if ((ref3 = this.toggledSubscriptions) != null) {
        ref3.dispose();
      }
      this.toggledSubscriptions = null;
      this.treeView = null;
      this.active = false;
      this.toggled = false;
      if ((ref4 = this.ignoredRepositories) != null) {
        ref4.clear();
      }
      this.ignoredRepositories = null;
      if ((ref5 = this.repos) != null) {
        ref5.destruct();
      }
      this.repos = null;
      if ((ref6 = this.treeViewUI) != null) {
        ref6.destruct();
      }
      this.treeViewUI = null;
      if ((ref7 = this.emitter) != null) {
        ref7.clear();
      }
      if ((ref8 = this.emitter) != null) {
        ref8.dispose();
      }
      return this.emitter = null;
    },
    isActivated: function() {
      return this.isActivatedFlag;
    },
    toggle: function() {
      var ref1, ref2, ref3;
      if (!this.active) {
        return;
      }
      if (!this.toggled) {
        this.toggled = true;
        this.repos = new ProjectRepositories(this.ignoredRepositories);
        this.treeViewUI = new TreeViewUI(this.treeView, this.repos.getRepositories());
        this.toggledSubscriptions = new CompositeDisposable;
        this.toggledSubscriptions.add(this.repos.onDidChange('repos', (function(_this) {
          return function(repos) {
            var ref1;
            return (ref1 = _this.treeViewUI) != null ? ref1.setRepositories(repos) : void 0;
          };
        })(this)));
        return this.toggledSubscriptions.add(this.repos.onDidChange('repo-status', (function(_this) {
          return function(evt) {
            var ref1, ref2;
            if ((ref1 = _this.repos) != null ? ref1.getRepositories().has(evt.repoPath) : void 0) {
              return (ref2 = _this.treeViewUI) != null ? ref2.updateRootForRepo(evt.repo, evt.repoPath) : void 0;
            }
          };
        })(this)));
      } else {
        this.toggled = false;
        if ((ref1 = this.toggledSubscriptions) != null) {
          ref1.dispose();
        }
        this.toggledSubscriptions = null;
        if ((ref2 = this.repos) != null) {
          ref2.destruct();
        }
        this.repos = null;
        if ((ref3 = this.treeViewUI) != null) {
          ref3.destruct();
        }
        return this.treeViewUI = null;
      }
    },
    getTreeView: function() {
      var ref1, ref2, treeViewPkg;
      if (this.treeView == null) {
        if (atom.packages.getActivePackage('tree-view') != null) {
          treeViewPkg = atom.packages.getActivePackage('tree-view');
        }
        if ((treeViewPkg != null ? (ref1 = treeViewPkg.mainModule) != null ? ref1.getTreeViewInstance : void 0 : void 0) != null) {
          return treeViewPkg.mainModule.getTreeViewInstance();
        }
        if ((treeViewPkg != null ? (ref2 = treeViewPkg.mainModule) != null ? ref2.treeView : void 0 : void 0) != null) {
          return treeViewPkg.mainModule.treeView;
        } else {
          return null;
        }
      } else {
        return this.treeView;
      }
    },
    getRepositories: function() {
      if (this.repos != null) {
        return this.repos.getRepositories();
      } else {
        return null;
      }
    },
    ignoreRepository: function(repoPath) {
      var ref1;
      this.ignoredRepositories.set(utils.normalizePath(repoPath), true);
      return (ref1 = this.repos) != null ? ref1.setIgnoredRepositories(this.ignoredRepositories) : void 0;
    },
    onDidActivate: function(handler) {
      return this.emitter.on('did-activate', handler);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDdEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUFpQixpQkFBQSxHQUVmO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLENBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLFdBQUEsRUFDRSx5REFKRjtPQURGO01BTUEseUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7UUFHQSxXQUFBLEVBQ0Usd0RBQUEsR0FDQSxvQkFMRjtPQVBGO01BYUEsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLENBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtPQWRGO01BaUJBLHFCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO09BbEJGO01BcUJBLHNCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO09BdEJGO01BeUJBLE9BQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxVQUFBLEVBQ0U7VUFBQSxPQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sQ0FBUDtZQUNBLElBQUEsRUFBTSxTQUROO1lBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO1lBR0EsS0FBQSxFQUFPLGlCQUhQO1lBSUEsV0FBQSxFQUNFLHVKQUFBLEdBQ0EsZ0NBTkY7V0FERjtVQVFBLFlBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxDQUFQO1lBQ0EsSUFBQSxFQUFNLFNBRE47WUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7WUFHQSxLQUFBLEVBQU8sdUJBSFA7WUFJQSxPQUFBLEVBQVMsQ0FKVDtZQUtBLE9BQUEsRUFBUyxDQUxUO1lBTUEsQ0FBQSxJQUFBLENBQUEsRUFBTTtjQUNKO2dCQUFDLEtBQUEsRUFBTyxDQUFSO2dCQUFXLFdBQUEsRUFBYSw0QkFBeEI7ZUFESSxFQUVKO2dCQUFDLEtBQUEsRUFBTyxDQUFSO2dCQUFXLFdBQUEsRUFBYSxrQ0FBeEI7ZUFGSSxFQUdKO2dCQUFDLEtBQUEsRUFBTyxDQUFSO2dCQUFXLFdBQUEsRUFBYSwwQkFBeEI7ZUFISTthQU5OO1dBVEY7U0FIRjtPQTFCRjtLQURGO0lBbURBLGFBQUEsRUFBZSxJQW5EZjtJQW9EQSxvQkFBQSxFQUFzQixJQXBEdEI7SUFxREEsUUFBQSxFQUFVLElBckRWO0lBc0RBLHVCQUFBLEVBQXlCLElBdER6QjtJQXVEQSxNQUFBLEVBQVEsS0F2RFI7SUF3REEsS0FBQSxFQUFPLElBeERQO0lBeURBLFVBQUEsRUFBWSxJQXpEWjtJQTBEQSxtQkFBQSxFQUFxQixJQTFEckI7SUEyREEsT0FBQSxFQUFTLElBM0RUO0lBNERBLGVBQUEsRUFBaUIsS0E1RGpCO0lBOERBLFFBQUEsRUFBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLG1CQUFELEdBQXVCLElBQUk7TUFDM0IsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFDL0IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUlyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBZCxDQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVELEtBQUMsQ0FBQSxhQUFELENBQUE7UUFENEQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBQW5CO01BSUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLFdBQUEsQ0FBWSxDQUFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDL0IsS0FBQyxDQUFBLGFBQUQsQ0FBQTtRQUQrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUFaLEVBRWpCLElBRmlCO2FBR3BCLElBQUMsQ0FBQSxhQUFELENBQUE7SUFmUSxDQTlEVjtJQStFQSxhQUFBLEVBQWUsU0FBQTtBQUViLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUNYLElBQUEsQ0FBQSxDQUFjLFFBQUEsSUFBYSxDQUFJLElBQUMsQ0FBQSxNQUFoQyxDQUFBO0FBQUEsZUFBQTs7TUFFQSxhQUFBLENBQWMsSUFBQyxDQUFBLGdCQUFmO01BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVO01BR1YsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEdBQXpCLENBQTZCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDM0I7UUFBQSw2QkFBQSxFQUErQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUM3QixLQUFDLENBQUEsTUFBRCxDQUFBO1VBRDZCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtPQUQyQixDQUE3QjtNQUdBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO01BQ2IsSUFBYSxVQUFiO1FBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxlQUFELEdBQW1CO2FBQ25CLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGNBQWQ7SUFqQmEsQ0EvRWY7SUFrR0EsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztZQUFjLENBQUUsT0FBaEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7WUFDTyxDQUFFLE9BQTFCLENBQUE7O01BQ0EsSUFBQyxDQUFBLHVCQUFELEdBQTJCOztZQUNOLENBQUUsT0FBdkIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7TUFDeEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsT0FBRCxHQUFXOztZQUNTLENBQUUsS0FBdEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUI7O1lBQ2pCLENBQUUsUUFBUixDQUFBOztNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7O1lBQ0UsQ0FBRSxRQUFiLENBQUE7O01BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7WUFDTixDQUFFLEtBQVYsQ0FBQTs7O1lBQ1EsQ0FBRSxPQUFWLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQWxCRCxDQWxHWjtJQXNIQSxXQUFBLEVBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREcsQ0F0SGI7SUF5SEEsTUFBQSxFQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxNQUFmO0FBQUEsZUFBQTs7TUFDQSxJQUFHLENBQUksSUFBQyxDQUFBLE9BQVI7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLG1CQUFBLENBQW9CLElBQUMsQ0FBQSxtQkFBckI7UUFDYixJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBVyxJQUFDLENBQUEsUUFBWixFQUFzQixJQUFDLENBQUEsS0FBSyxDQUFDLGVBQVAsQ0FBQSxDQUF0QjtRQUNsQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtRQUM1QixJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FDRSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVAsQ0FBbUIsT0FBbkIsRUFBNEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQzFCLGdCQUFBOzJEQUFXLENBQUUsZUFBYixDQUE2QixLQUE3QjtVQUQwQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsQ0FERjtlQUlBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUNFLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBUCxDQUFtQixhQUFuQixFQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEdBQUQ7QUFDaEMsZ0JBQUE7WUFBQSx1Q0FBUyxDQUFFLGVBQVIsQ0FBQSxDQUF5QixDQUFDLEdBQTFCLENBQThCLEdBQUcsQ0FBQyxRQUFsQyxVQUFIOzZEQUNhLENBQUUsaUJBQWIsQ0FBK0IsR0FBRyxDQUFDLElBQW5DLEVBQXlDLEdBQUcsQ0FBQyxRQUE3QyxXQURGOztVQURnQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FERixFQVRGO09BQUEsTUFBQTtRQWVFLElBQUMsQ0FBQSxPQUFELEdBQVc7O2NBQ1UsQ0FBRSxPQUF2QixDQUFBOztRQUNBLElBQUMsQ0FBQSxvQkFBRCxHQUF3Qjs7Y0FDbEIsQ0FBRSxRQUFSLENBQUE7O1FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUzs7Y0FDRSxDQUFFLFFBQWIsQ0FBQTs7ZUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBckJoQjs7SUFGTSxDQXpIUjtJQWtKQSxXQUFBLEVBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxJQUFPLHFCQUFQO1FBQ0UsSUFBRyxtREFBSDtVQUNFLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLEVBRGhCOztRQUlBLElBQUcsb0hBQUg7QUFDRSxpQkFBTyxXQUFXLENBQUMsVUFBVSxDQUFDLG1CQUF2QixDQUFBLEVBRFQ7O1FBR0EsSUFBRyx5R0FBSDtBQUNFLGlCQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FEaEM7U0FBQSxNQUFBO0FBR0UsaUJBQU8sS0FIVDtTQVJGO09BQUEsTUFBQTtBQWFFLGVBQU8sSUFBQyxDQUFBLFNBYlY7O0lBRFcsQ0FsSmI7SUFrS0EsZUFBQSxFQUFpQixTQUFBO01BQ1IsSUFBRyxrQkFBSDtlQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLGVBQVAsQ0FBQSxFQUFoQjtPQUFBLE1BQUE7ZUFBOEMsS0FBOUM7O0lBRFEsQ0FsS2pCO0lBcUtBLGdCQUFBLEVBQWtCLFNBQUMsUUFBRDtBQUNoQixVQUFBO01BQUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEdBQXJCLENBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLFFBQXBCLENBQXpCLEVBQXdELElBQXhEOytDQUNNLENBQUUsc0JBQVIsQ0FBK0IsSUFBQyxDQUFBLG1CQUFoQztJQUZnQixDQXJLbEI7SUF5S0EsYUFBQSxFQUFlLFNBQUMsT0FBRDtBQUNiLGFBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksY0FBWixFQUE0QixPQUE1QjtJQURNLENBektmOztBQVBGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblByb2plY3RSZXBvc2l0b3JpZXMgPSByZXF1aXJlICcuL3JlcG9zaXRvcmllcydcblRyZWVWaWV3VUkgPSByZXF1aXJlICcuL3RyZWV2aWV3dWknXG51dGlscyA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZVZpZXdHaXRTdGF0dXMgPVxuXG4gIGNvbmZpZzpcbiAgICBhdXRvVG9nZ2xlOlxuICAgICAgb3JkZXI6IDFcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdTaG93IHRoZSBHaXQgc3RhdHVzIGluIHRoZSB0cmVlIHZpZXcgd2hlbiBzdGFydGluZyBBdG9tJ1xuICAgIHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXM6XG4gICAgICBvcmRlcjogMlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ01hcmsgcHJvamVjdCBmb2xkZXIgYXMgbW9kaWZpZWQgaW4gY2FzZSB0aGVyZSBhcmUgYW55ICcgK1xuICAgICAgICAndW5jb21taXRlZCBjaGFuZ2VzJ1xuICAgIHNob3dCcmFuY2hMYWJlbDpcbiAgICAgIG9yZGVyOiAzXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBzaG93Q29tbWl0c0FoZWFkTGFiZWw6XG4gICAgICBvcmRlcjogNFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd0NvbW1pdHNCZWhpbmRMYWJlbDpcbiAgICAgIG9yZGVyOiA1XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBnaXRGbG93OlxuICAgICAgb3JkZXI6IDZcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBlbmFibGVkOlxuICAgICAgICAgIG9yZGVyOiAxXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgIHRpdGxlOiAnRW5hYmxlIEdpdCBGbG93J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgJ0dpdCBGbG93IHN1cHBvcnQgcmVxdWlyZXMgeW91IHRvIFtpbnN0YWxsIEdpdCBGbG93XShodHRwczovL2dpdGh1Yi5jb20vcGV0ZXJ2YW5kZXJkb2VzL2dpdGZsb3ctYXZoL3dpa2kvSW5zdGFsbGF0aW9uKSBhbmQgcnVuIGBnaXQgZmxvdyBpbml0YCBvbiB0aGUgJyArXG4gICAgICAgICAgICAncmVwb3NpdG9yeSB5b3Ugd2FudCB0byB3b3JrIG9uJ1xuICAgICAgICBkaXNwbGF5X3R5cGU6XG4gICAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICBkZWZhdWx0OiAxXG4gICAgICAgICAgdGl0bGU6ICdHaXQgRmxvdyBkaXNwbGF5IHR5cGUnXG4gICAgICAgICAgbWluaW11bTogMVxuICAgICAgICAgIG1heGltdW06IDNcbiAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICB7dmFsdWU6IDEsIGRlc2NyaXB0aW9uOiAnU2hvdyBwcmVmaXggYW5kIGJyYW5jaG5hbWUnfVxuICAgICAgICAgICAge3ZhbHVlOiAyLCBkZXNjcmlwdGlvbjogJ1Nob3cgaWNvbiwgcHJlZml4IGFuZCBicmFuY2huYW1lJ31cbiAgICAgICAgICAgIHt2YWx1ZTogMywgZGVzY3JpcHRpb246ICdTaG93IGljb24gYW5kIGJyYW5jaG5hbWUnfVxuICAgICAgICAgIF1cblxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIHRvZ2dsZWRTdWJzY3JpcHRpb25zOiBudWxsXG4gIHRyZWVWaWV3OiBudWxsXG4gIHN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzOiBudWxsXG4gIGFjdGl2ZTogZmFsc2VcbiAgcmVwb3M6IG51bGxcbiAgdHJlZVZpZXdVSTogbnVsbFxuICBpZ25vcmVkUmVwb3NpdG9yaWVzOiBudWxsXG4gIGVtaXR0ZXI6IG51bGxcbiAgaXNBY3RpdmF0ZWRGbGFnOiBmYWxzZVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcyA9IG5ldyBNYXBcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAjIFdhaXQgdW5sZXNzIGFsbCBwYWNrYWdlcyBoYXZlIGJlZW4gYWN0aWF2dGVkIGFuZCBkbyBub3QgZm9yY2VmdWxseVxuICAgICMgYWN0aXZhdGUgdGhlIHRyZWUtdmlldy4gSWYgdGhlIHRyZWUtdmlldyBoYXNuJ3QgYmVlbiBhY3RpdmF0ZWQgd2VcbiAgICAjIHNob3VsZCBkbyBub3RoaW5nLlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMgPT5cbiAgICAgIEBkb0luaXRQYWNrYWdlKClcbiAgICAjIFdvcmthcm91bmQgZm9yIHRoZSBpc3N1ZSB0aGF0IFwib25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlc1wiIG5ldmVyIGdldHNcbiAgICAjIGZpcmVkIGlmIG9uZSBvciBtb3JlIHBhY2thZ2VzIGFyZSBmYWlsaW5nIHRvIGluaXRpYWxpemVcbiAgICBAYWN0aXZhdGVJbnRlcnZhbCA9IHNldEludGVydmFsICg9PlxuICAgICAgQGRvSW5pdFBhY2thZ2UoKVxuICAgICksIDEwMDBcbiAgICBAZG9Jbml0UGFja2FnZSgpXG5cbiAgZG9Jbml0UGFja2FnZTogLT5cbiAgICAjIENoZWNrIGlmIHRoZSB0cmVlIHZpZXcgaGFzIGJlZW4gYWxyZWFkeSBpbml0aWFsaXplZFxuICAgIHRyZWVWaWV3ID0gQGdldFRyZWVWaWV3KClcbiAgICByZXR1cm4gdW5sZXNzIHRyZWVWaWV3IGFuZCBub3QgQGFjdGl2ZVxuXG4gICAgY2xlYXJJbnRlcnZhbChAYWN0aXZhdGVJbnRlcnZhbClcbiAgICBAYWN0aXZhdGVJbnRlcnZhbCA9IG51bGxcbiAgICBAdHJlZVZpZXcgPSB0cmVlVmlld1xuICAgIEBhY3RpdmUgPSB0cnVlXG5cbiAgICAjIFRvZ2dsZSB0cmVlLXZpZXctZ2l0LXN0YXR1cy4uLlxuICAgIEBzdWJzY3JpcHRpb25zT2ZDb21tYW5kcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd0cmVlLXZpZXctZ2l0LXN0YXR1czp0b2dnbGUnOiA9PlxuICAgICAgICBAdG9nZ2xlKClcbiAgICBhdXRvVG9nZ2xlID0gYXRvbS5jb25maWcuZ2V0ICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5hdXRvVG9nZ2xlJ1xuICAgIEB0b2dnbGUoKSBpZiBhdXRvVG9nZ2xlXG4gICAgQGlzQWN0aXZhdGVkRmxhZyA9IHRydWVcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWN0aXZhdGUnXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQHN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBudWxsXG4gICAgQHRvZ2dsZWRTdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQHRyZWVWaWV3ID0gbnVsbFxuICAgIEBhY3RpdmUgPSBmYWxzZVxuICAgIEB0b2dnbGVkID0gZmFsc2VcbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcz8uY2xlYXIoKVxuICAgIEBpZ25vcmVkUmVwb3NpdG9yaWVzID0gbnVsbFxuICAgIEByZXBvcz8uZGVzdHJ1Y3QoKVxuICAgIEByZXBvcyA9IG51bGxcbiAgICBAdHJlZVZpZXdVST8uZGVzdHJ1Y3QoKVxuICAgIEB0cmVlVmlld1VJID0gbnVsbFxuICAgIEBlbWl0dGVyPy5jbGVhcigpXG4gICAgQGVtaXR0ZXI/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyID0gbnVsbFxuXG4gIGlzQWN0aXZhdGVkOiAtPlxuICAgIHJldHVybiBAaXNBY3RpdmF0ZWRGbGFnXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVxuICAgIGlmIG5vdCBAdG9nZ2xlZFxuICAgICAgQHRvZ2dsZWQgPSB0cnVlXG4gICAgICBAcmVwb3MgPSBuZXcgUHJvamVjdFJlcG9zaXRvcmllcyhAaWdub3JlZFJlcG9zaXRvcmllcylcbiAgICAgIEB0cmVlVmlld1VJID0gbmV3IFRyZWVWaWV3VUkgQHRyZWVWaWV3LCBAcmVwb3MuZ2V0UmVwb3NpdG9yaWVzKClcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBAcmVwb3Mub25EaWRDaGFuZ2UgJ3JlcG9zJywgKHJlcG9zKSA9PlxuICAgICAgICAgIEB0cmVlVmlld1VJPy5zZXRSZXBvc2l0b3JpZXMgcmVwb3NcbiAgICAgIClcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgIEByZXBvcy5vbkRpZENoYW5nZSAncmVwby1zdGF0dXMnLCAoZXZ0KSA9PlxuICAgICAgICAgIGlmIEByZXBvcz8uZ2V0UmVwb3NpdG9yaWVzKCkuaGFzKGV2dC5yZXBvUGF0aClcbiAgICAgICAgICAgIEB0cmVlVmlld1VJPy51cGRhdGVSb290Rm9yUmVwbyhldnQucmVwbywgZXZ0LnJlcG9QYXRoKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEB0b2dnbGVkID0gZmFsc2VcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgICBAcmVwb3M/LmRlc3RydWN0KClcbiAgICAgIEByZXBvcyA9IG51bGxcbiAgICAgIEB0cmVlVmlld1VJPy5kZXN0cnVjdCgpXG4gICAgICBAdHJlZVZpZXdVSSA9IG51bGxcblxuICBnZXRUcmVlVmlldzogLT5cbiAgICBpZiBub3QgQHRyZWVWaWV3P1xuICAgICAgaWYgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd0cmVlLXZpZXcnKT9cbiAgICAgICAgdHJlZVZpZXdQa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3RyZWUtdmlldycpXG4gICAgICAjIFRPRE8gQ2hlY2sgZm9yIHN1cHBvcnQgb2YgTnVjbGlkZSBUcmVlIFZpZXdcbiAgICAgICMgQXRvbSA+PSAxLjE4LjBcbiAgICAgIGlmIHRyZWVWaWV3UGtnPy5tYWluTW9kdWxlPy5nZXRUcmVlVmlld0luc3RhbmNlP1xuICAgICAgICByZXR1cm4gdHJlZVZpZXdQa2cubWFpbk1vZHVsZS5nZXRUcmVlVmlld0luc3RhbmNlKClcbiAgICAgICMgQXRvbSA8IDEuMTguMFxuICAgICAgaWYgdHJlZVZpZXdQa2c/Lm1haW5Nb2R1bGU/LnRyZWVWaWV3P1xuICAgICAgICByZXR1cm4gdHJlZVZpZXdQa2cubWFpbk1vZHVsZS50cmVlVmlld1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIGVsc2VcbiAgICAgIHJldHVybiBAdHJlZVZpZXdcblxuICBnZXRSZXBvc2l0b3JpZXM6IC0+XG4gICAgcmV0dXJuIGlmIEByZXBvcz8gdGhlbiBAcmVwb3MuZ2V0UmVwb3NpdG9yaWVzKCkgZWxzZSBudWxsXG5cbiAgaWdub3JlUmVwb3NpdG9yeTogKHJlcG9QYXRoKSAtPlxuICAgIEBpZ25vcmVkUmVwb3NpdG9yaWVzLnNldCh1dGlscy5ub3JtYWxpemVQYXRoKHJlcG9QYXRoKSwgdHJ1ZSlcbiAgICBAcmVwb3M/LnNldElnbm9yZWRSZXBvc2l0b3JpZXMoQGlnbm9yZWRSZXBvc2l0b3JpZXMpXG5cbiAgb25EaWRBY3RpdmF0ZTogKGhhbmRsZXIpIC0+XG4gICAgcmV0dXJuIEBlbWl0dGVyLm9uICdkaWQtYWN0aXZhdGUnLCBoYW5kbGVyXG4iXX0=
