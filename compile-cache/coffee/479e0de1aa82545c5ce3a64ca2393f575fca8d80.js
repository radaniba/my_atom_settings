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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDdEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUFpQixpQkFBQSxHQUVmO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQ0UseURBSEY7T0FERjtNQUtBLHlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFDRSx3REFBQSxHQUNBLG9CQUpGO09BTkY7TUFXQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQVpGO01BY0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BZkY7TUFpQkEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BbEJGO0tBREY7SUFzQkEsYUFBQSxFQUFlLElBdEJmO0lBdUJBLG9CQUFBLEVBQXNCLElBdkJ0QjtJQXdCQSxRQUFBLEVBQVUsSUF4QlY7SUF5QkEsdUJBQUEsRUFBeUIsSUF6QnpCO0lBMEJBLE1BQUEsRUFBUSxLQTFCUjtJQTJCQSxLQUFBLEVBQU8s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QUNFLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLEVBRGhCOztRQUdBLElBQUcseUdBQUg7QUFDRSxpQkFBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBRGhDO1NBQUEsTUFBQTtBQUdFLGlCQUFPLEtBSFQ7U0FKRjtPQUFBLE1BQUE7QUFTRSxlQUFPLElBQUMsQ0FBQSxTQVRWOztJQURXLENBNUdiO0lBd0hBLGVBQUEsRUFBaUIsU0FBQTtNQUNSLElBQUcsa0JBQUg7ZUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUEsRUFBaEI7T0FBQSxNQUFBO2VBQThDLEtBQTlDOztJQURRLENBeEhqQjtJQTJIQSxnQkFBQSxFQUFrQixTQUFDLFFBQUQ7QUFDaEIsVUFBQTtNQUFBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxHQUFyQixDQUF5QixLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixDQUF6QixFQUF3RCxJQUF4RDsrQ0FDTSxDQUFFLHNCQUFSLENBQStCLElBQUMsQ0FBQSxtQkFBaEM7SUFGZ0IsQ0EzSGxCO0lBK0hBLGFBQUEsRUFBZSxTQUFDLE9BQUQ7QUFDYixhQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsT0FBNUI7SUFETSxDQS9IZjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5Qcm9qZWN0UmVwb3NpdG9yaWVzID0gcmVxdWlyZSAnLi9yZXBvc2l0b3JpZXMnXG5UcmVlVmlld1VJID0gcmVxdWlyZSAnLi90cmVldmlld3VpJ1xudXRpbHMgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVWaWV3R2l0U3RhdHVzID1cblxuICBjb25maWc6XG4gICAgYXV0b1RvZ2dsZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdTaG93IHRoZSBHaXQgc3RhdHVzIGluIHRoZSB0cmVlIHZpZXcgd2hlbiBzdGFydGluZyBBdG9tJ1xuICAgIHNob3dQcm9qZWN0TW9kaWZpZWRTdGF0dXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnTWFyayBwcm9qZWN0IGZvbGRlciBhcyBtb2RpZmllZCBpbiBjYXNlIHRoZXJlIGFyZSBhbnkgJyArXG4gICAgICAgICd1bmNvbW1pdGVkIGNoYW5nZXMnXG4gICAgc2hvd0JyYW5jaExhYmVsOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd0NvbW1pdHNBaGVhZExhYmVsOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd0NvbW1pdHNCZWhpbmRMYWJlbDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgdG9nZ2xlZFN1YnNjcmlwdGlvbnM6IG51bGxcbiAgdHJlZVZpZXc6IG51bGxcbiAgc3Vic2NyaXB0aW9uc09mQ29tbWFuZHM6IG51bGxcbiAgYWN0aXZlOiBmYWxzZVxuICByZXBvczogbnVsbFxuICB0cmVlVmlld1VJOiBudWxsXG4gIGlnbm9yZWRSZXBvc2l0b3JpZXM6IG51bGxcbiAgZW1pdHRlcjogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcyA9IG5ldyBNYXBcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICBAZG9Jbml0UGFja2FnZSgpXG4gICAgIyBXb3JrYXJvdW5kIGZvciB0aGUgaXNzZSB0aGF0IFwib25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlc1wiIG5ldmVyIGdldHNcbiAgICAjIGZpcmVkIGlmIG9uZSBvciBtb3JlIHBhY2thZ2VzIGFyZSBmYWlsaW5nIHRvIGluaXRpYWxpemVcbiAgICBAYWN0aXZhdGVJbnRlcnZhbCA9IHNldEludGVydmFsICg9PlxuICAgICAgICBAZG9Jbml0UGFja2FnZSgpXG4gICAgICApLCAxMDAwXG4gICAgQGRvSW5pdFBhY2thZ2UoKVxuXG4gIGRvSW5pdFBhY2thZ2U6IC0+XG4gICAgIyBDaGVjayBpZiB0aGUgdHJlZSB2aWV3IGhhcyBiZWVuIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgICB0cmVlVmlldyA9IEBnZXRUcmVlVmlldygpXG4gICAgcmV0dXJuIHVubGVzcyB0cmVlVmlldyBhbmQgbm90IEBhY3RpdmVcblxuICAgIGNsZWFySW50ZXJ2YWwoQGFjdGl2YXRlSW50ZXJ2YWwpXG4gICAgQHRyZWVWaWV3ID0gdHJlZVZpZXdcbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gICAgIyBUb2dnbGUgdHJlZS12aWV3LWdpdC1zdGF0dXMuLi5cbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndHJlZS12aWV3LWdpdC1zdGF0dXM6dG9nZ2xlJzogPT5cbiAgICAgICAgQHRvZ2dsZSgpXG4gICAgYXV0b1RvZ2dsZSA9IGF0b20uY29uZmlnLmdldCAndHJlZS12aWV3LWdpdC1zdGF0dXMuYXV0b1RvZ2dsZSdcbiAgICBAdG9nZ2xlKCkgaWYgYXV0b1RvZ2dsZVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hY3RpdmF0ZSdcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICBAc3Vic2NyaXB0aW9uc09mQ29tbWFuZHM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zT2ZDb21tYW5kcyA9IG51bGxcbiAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICBAdHJlZVZpZXcgPSBudWxsXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgQHRvZ2dsZWQgPSBmYWxzZVxuICAgIEBpZ25vcmVkUmVwb3NpdG9yaWVzPy5jbGVhcigpXG4gICAgQGlnbm9yZWRSZXBvc2l0b3JpZXMgPSBudWxsXG4gICAgQHJlcG9zPy5kZXN0cnVjdCgpXG4gICAgQHJlcG9zID0gbnVsbFxuICAgIEB0cmVlVmlld1VJPy5kZXN0cnVjdCgpXG4gICAgQHRyZWVWaWV3VUkgPSBudWxsXG4gICAgQGVtaXR0ZXI/LmNsZWFyKClcbiAgICBAZW1pdHRlcj8uZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIgPSBudWxsXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVxuICAgIGlmIG5vdCBAdG9nZ2xlZFxuICAgICAgQHRvZ2dsZWQgPSB0cnVlXG4gICAgICBAcmVwb3MgPSBuZXcgUHJvamVjdFJlcG9zaXRvcmllcyhAaWdub3JlZFJlcG9zaXRvcmllcylcbiAgICAgIEB0cmVlVmlld1VJID0gbmV3IFRyZWVWaWV3VUkgQHRyZWVWaWV3LCBAcmVwb3MuZ2V0UmVwb3NpdG9yaWVzKClcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBAcmVwb3Mub25EaWRDaGFuZ2UgJ3JlcG9zJywgKHJlcG9zKSA9PlxuICAgICAgICAgIEB0cmVlVmlld1VJPy5zZXRSZXBvc2l0b3JpZXMgcmVwb3NcbiAgICAgIClcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgIEByZXBvcy5vbkRpZENoYW5nZSAncmVwby1zdGF0dXMnLCAoZXZ0KSA9PlxuICAgICAgICAgIGlmIEByZXBvcz8uZ2V0UmVwb3NpdG9yaWVzKCkuaGFzKGV2dC5yZXBvUGF0aClcbiAgICAgICAgICAgIEB0cmVlVmlld1VJPy51cGRhdGVSb290Rm9yUmVwbyhldnQucmVwbywgZXZ0LnJlcG9QYXRoKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEB0b2dnbGVkID0gZmFsc2VcbiAgICAgIEB0b2dnbGVkU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgICBAdG9nZ2xlZFN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgICBAcmVwb3M/LmRlc3RydWN0KClcbiAgICAgIEByZXBvcyA9IG51bGxcbiAgICAgIEB0cmVlVmlld1VJPy5kZXN0cnVjdCgpXG4gICAgICBAdHJlZVZpZXdVSSA9IG51bGxcblxuICBnZXRUcmVlVmlldzogLT5cbiAgICBpZiBub3QgQHRyZWVWaWV3P1xuICAgICAgaWYgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd0cmVlLXZpZXcnKT9cbiAgICAgICAgdHJlZVZpZXdQa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3RyZWUtdmlldycpXG4gICAgICAjIFRPRE8gQ2hlY2sgZm9yIHN1cHBvcnQgb2YgTnVjbGlkZSBUcmVlIFZpZXdcbiAgICAgIGlmIHRyZWVWaWV3UGtnPy5tYWluTW9kdWxlPy50cmVlVmlldz9cbiAgICAgICAgcmV0dXJuIHRyZWVWaWV3UGtnLm1haW5Nb2R1bGUudHJlZVZpZXdcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBlbHNlXG4gICAgICByZXR1cm4gQHRyZWVWaWV3XG5cbiAgZ2V0UmVwb3NpdG9yaWVzOiAtPlxuICAgIHJldHVybiBpZiBAcmVwb3M/IHRoZW4gQHJlcG9zLmdldFJlcG9zaXRvcmllcygpIGVsc2UgbnVsbFxuXG4gIGlnbm9yZVJlcG9zaXRvcnk6IChyZXBvUGF0aCkgLT5cbiAgICBAaWdub3JlZFJlcG9zaXRvcmllcy5zZXQodXRpbHMubm9ybWFsaXplUGF0aChyZXBvUGF0aCksIHRydWUpXG4gICAgQHJlcG9zPy5zZXRJZ25vcmVkUmVwb3NpdG9yaWVzKEBpZ25vcmVkUmVwb3NpdG9yaWVzKVxuXG4gIG9uRGlkQWN0aXZhdGU6IChoYW5kbGVyKSAtPlxuICAgIHJldHVybiBAZW1pdHRlci5vbiAnZGlkLWFjdGl2YXRlJywgaGFuZGxlclxuIl19
