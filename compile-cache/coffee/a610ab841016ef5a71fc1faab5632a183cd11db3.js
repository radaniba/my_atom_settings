(function() {
  var CompositeDisposable, Emitter, ProjectRepositories, TreeViewGitStatus, TreeViewUI, ref, utils;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ProjectRepositories = require('./repositories');

  TreeViewUI = require('./treeviewui');

  utils = require('./utils');

  module.exports = TreeViewGitStatus = {
    config: {
      autoToggle: {
        type: 'boolean',
        "default": true,
        description: 'Show the Git status in the tree view when starting Atom'
      },
      showProjectModifiedStatus: {
        type: 'boolean',
        "default": true,
        description: 'Mark project folder as modified in case there are any ' + 'uncommited changes'
      },
      showBranchLabel: {
        type: 'boolean',
        "default": true
      },
      showCommitsAheadLabel: {
        type: 'boolean',
        "default": true
      },
      showCommitsBehindLabel: {
        type: 'boolean',
        "default": true
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
      return this.doInitPackage();
    },
    doInitPackage: function() {
      var autoToggle, treeView;
      treeView = this.getTreeView();
      if (!(treeView && !this.active)) {
        return;
      }
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
      var ref1, treeViewPkg;
      if (this.treeView == null) {
        if (atom.packages.getActivePackage('tree-view') != null) {
          treeViewPkg = atom.packages.getActivePackage('tree-view');
        }
        if ((treeViewPkg != null ? (ref1 = treeViewPkg.mainModule) != null ? ref1.treeView : void 0 : void 0) != null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDdEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUFpQixpQkFBQSxHQUVmO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQ0UseURBSEY7T0FERjtNQUtBLHlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFDRSx3REFBQSxHQUNBLG9CQUpGO09BTkY7TUFXQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQVpGO01BY0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BZkY7TUFpQkEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BbEJGO0tBREY7SUFzQkEsYUFBQSxFQUFlLElBdEJmO0lBdUJBLG9CQUFBLEVBQXNCLElBdkJ0QjtJQXdCQSxRQUFBLEVBQVUsSUF4QlY7SUF5QkEsdUJBQUEsRUFBeUIsSUF6QnpCO0lBMEJBLE1BQUEsRUFBUSxLQTFCUjtJQTJCQSxLQUFBLEVBQU8s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OztJQURXLENBdEdiO0lBa0hBLGVBQUEsRUFBaUIsU0FBQTtNQUNSLElBQUcsa0JBQUg7ZUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUEsRUFBaEI7T0FBQSxNQUFBO2VBQThDLEtBQTlDOztJQURRLENBbEhqQjtJQXFIQSxnQkFBQSxFQUFrQixTQUFDLFFBQUQ7QUFDaEIsVUFBQTtNQUFBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxHQUFyQixDQUF5QixLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixDQUF6QixFQUF3RCxJQUF4RDsrQ0FDTSxDQUFFLHNCQUFSLENBQStCLElBQUMsQ0FBQSxtQkFBaEM7SUFGZ0IsQ0FySGxCO0lBeUhBLGFBQUEsRUFBZSxTQUFDLE9BQUQ7QUFDYixhQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsT0FBNUI7SUFETSxDQXpIZjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5Qcm9qZWN0UmVwb3NpdG9yaWVzID0gcmVxdWlyZSAnLi9yZXBvc2l0b3JpZXMnXG5UcmVlVmlld1VJID0gcmVxdWlyZSAnLi90cmVldmlld3VpJ1xudXRpbHMgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVWaWV3R2l0U3RhdHVzID1cblxuICBjb25maWc6XG4gICAgYXV0b1RvZ2dsZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdTaG93IHRoZSBHaXQgc3RhdHVzIGluIHRoZSB0cmVlIHZpZXcgd2hlbiBzdGFydGluZyBBdG9tJ1xuICAgIHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnTWFyayBwcm9qZWN0IGZvbGRlciBhcyBtb2RpZmllZCBpbiBjYXNlIHRoZXJlIGFyZSBhbnkgJyArXG4gICAgICAgICd1bmNvbW1pdGVkIGNoYW5nZXMnXG4gICAgc2hvd0JyYW5jaExhYmVsOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd0NvbW1pdHNBaGVhZExhYmVsOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd0NvbW1pdHNCZWhpbmRMYWJlbDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgdG9nZ2xlZFN1YnNjcmlwdGlvbnM6IG51bGxcbiAgdHJlZVZpZXc6IG51bGxcbiAgc3Vic2NyaXB0aW9uc09mQ29tbWFuZHM6IG51bGxcbiAgYWN0aXZlOiBmYWxzZVxuICByZXBvczogbnVsbFxuICB0cmVlVmlld1VJOiBudWxsXG4gIGlnbm9yZWRSZXBvc2l0b3JpZXM6IG51bGxcbiAgZW1pdHRlcjogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcyA9IG5ldyBNYXBcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICBAZG9Jbml0UGFja2FnZSgpXG4gICAgQGRvSW5pdFBhY2thZ2UoKVxuXG4gIGRvSW5pdFBhY2thZ2U6IC0+XG4gICAgIyBDaGVjayBpZiB0aGUgdHJlZSB2aWV3IGhhcyBiZWVuIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgICB0cmVlVmlldyA9IEBnZXRUcmVlVmlldygpXG4gICAgcmV0dXJuIHVubGVzcyB0cmVlVmlldyBhbmQgbm90IEBhY3RpdmVcblxuICAgIEB0cmVlVmlldyA9IHRyZWVWaWV3XG4gICAgQGFjdGl2ZSA9IHRydWVcblxuICAgICMgVG9nZ2xlIHRyZWUtdmlldy1naXQtc3RhdHVzLi4uXG4gICAgQHN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3RyZWUtdmlldy1naXQtc3RhdHVzOnRvZ2dsZSc6ID0+XG4gICAgICAgIEB0b2dnbGUoKVxuICAgIGF1dG9Ub2dnbGUgPSBhdG9tLmNvbmZpZy5nZXQgJ3RyZWUtdmlldy1naXQtc3RhdHVzLmF1dG9Ub2dnbGUnXG4gICAgQHRvZ2dsZSgpIGlmIGF1dG9Ub2dnbGVcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWN0aXZhdGUnXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQHN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBudWxsXG4gICAgQHRvZ2dsZWRTdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQHRyZWVWaWV3ID0gbnVsbFxuICAgIEBhY3RpdmUgPSBmYWxzZVxuICAgIEB0b2dnbGVkID0gZmFsc2VcbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcz8uY2xlYXIoKVxuICAgIEBpZ25vcmVkUmVwb3NpdG9yaWVzID0gbnVsbFxuICAgIEByZXBvcz8uZGVzdHJ1Y3QoKVxuICAgIEByZXBvcyA9IG51bGxcbiAgICBAdHJlZVZpZXdVST8uZGVzdHJ1Y3QoKVxuICAgIEB0cmVlVmlld1VJID0gbnVsbFxuICAgIEBlbWl0dGVyPy5jbGVhcigpXG4gICAgQGVtaXR0ZXI/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyID0gbnVsbFxuXG4gIHRvZ2dsZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVcbiAgICBpZiBub3QgQHRvZ2dsZWRcbiAgICAgIEB0b2dnbGVkID0gdHJ1ZVxuICAgICAgQHJlcG9zID0gbmV3IFByb2plY3RSZXBvc2l0b3JpZXMoQGlnbm9yZWRSZXBvc2l0b3JpZXMpXG4gICAgICBAdHJlZVZpZXdVSSA9IG5ldyBUcmVlVmlld1VJIEB0cmVlVmlldywgQHJlcG9zLmdldFJlcG9zaXRvcmllcygpXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgQHRvZ2dsZWRTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgQHJlcG9zLm9uRGlkQ2hhbmdlICdyZXBvcycsIChyZXBvcykgPT5cbiAgICAgICAgICBAdHJlZVZpZXdVST8uc2V0UmVwb3NpdG9yaWVzIHJlcG9zXG4gICAgICApXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBAcmVwb3Mub25EaWRDaGFuZ2UgJ3JlcG8tc3RhdHVzJywgKGV2dCkgPT5cbiAgICAgICAgICBpZiBAcmVwb3M/LmdldFJlcG9zaXRvcmllcygpLmhhcyhldnQucmVwb1BhdGgpXG4gICAgICAgICAgICBAdHJlZVZpZXdVST8udXBkYXRlUm9vdEZvclJlcG8oZXZ0LnJlcG8sIGV2dC5yZXBvUGF0aClcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAdG9nZ2xlZCA9IGZhbHNlXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgICAgQHRvZ2dsZWRTdWJzY3JpcHRpb25zID0gbnVsbFxuICAgICAgQHJlcG9zPy5kZXN0cnVjdCgpXG4gICAgICBAcmVwb3MgPSBudWxsXG4gICAgICBAdHJlZVZpZXdVST8uZGVzdHJ1Y3QoKVxuICAgICAgQHRyZWVWaWV3VUkgPSBudWxsXG5cbiAgZ2V0VHJlZVZpZXc6IC0+XG4gICAgaWYgbm90IEB0cmVlVmlldz9cbiAgICAgIGlmIGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgndHJlZS12aWV3Jyk/XG4gICAgICAgIHRyZWVWaWV3UGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd0cmVlLXZpZXcnKVxuICAgICAgIyBUT0RPIENoZWNrIGZvciBzdXBwb3J0IG9mIE51Y2xpZGUgVHJlZSBWaWV3XG4gICAgICBpZiB0cmVlVmlld1BrZz8ubWFpbk1vZHVsZT8udHJlZVZpZXc/XG4gICAgICAgIHJldHVybiB0cmVlVmlld1BrZy5tYWluTW9kdWxlLnRyZWVWaWV3XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIEB0cmVlVmlld1xuXG4gIGdldFJlcG9zaXRvcmllczogLT5cbiAgICByZXR1cm4gaWYgQHJlcG9zPyB0aGVuIEByZXBvcy5nZXRSZXBvc2l0b3JpZXMoKSBlbHNlIG51bGxcblxuICBpZ25vcmVSZXBvc2l0b3J5OiAocmVwb1BhdGgpIC0+XG4gICAgQGlnbm9yZWRSZXBvc2l0b3JpZXMuc2V0KHV0aWxzLm5vcm1hbGl6ZVBhdGgocmVwb1BhdGgpLCB0cnVlKVxuICAgIEByZXBvcz8uc2V0SWdub3JlZFJlcG9zaXRvcmllcyhAaWdub3JlZFJlcG9zaXRvcmllcylcblxuICBvbkRpZEFjdGl2YXRlOiAoaGFuZGxlcikgLT5cbiAgICByZXR1cm4gQGVtaXR0ZXIub24gJ2RpZC1hY3RpdmF0ZScsIGhhbmRsZXJcbiJdfQ==
