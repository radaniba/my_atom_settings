(function() {
  var CompositeDisposable, GitFlowData, GitFlowHandler, GitRepositoryAsync, flowIconMap;

  CompositeDisposable = require('atom').CompositeDisposable;

  GitRepositoryAsync = require('./gitrepositoryasync');

  flowIconMap = {
    feature: 'puzzle',
    release: 'package',
    hotfix: 'flame',
    develop: 'home',
    master: 'verified'
  };

  GitFlowData = (function() {
    GitFlowData.prototype.master = null;

    GitFlowData.prototype.develop = null;

    GitFlowData.prototype.feature = null;

    GitFlowData.prototype.release = null;

    GitFlowData.prototype.hotfix = null;

    function GitFlowData(repo) {
      if (!(repo instanceof GitRepositoryAsync)) {
        return;
      }
      repo = repo.repo;
      this.master = repo.getConfigValue('gitflow.branch.master');
      this.develop = repo.getConfigValue('gitflow.branch.develop');
      this.feature = repo.getConfigValue('gitflow.prefix.feature');
      this.release = repo.getConfigValue('gitflow.prefix.release');
      this.hotfix = repo.getConfigValue('gitflow.prefix.hotfix');
    }

    return GitFlowData;

  })();

  module.exports = GitFlowHandler = (function() {
    var startsWith;

    GitFlowHandler.prototype.treeViewUi = null;

    GitFlowHandler.prototype.subscriptions = null;

    function GitFlowHandler(treeViewUi) {
      this.treeViewUi = treeViewUi;
      this.gitFlowEnabled = atom.config.get('tree-view-git-status.gitFlow.enabled');
      this.gitFlowDisplayType = atom.config.get('tree-view-git-status.gitFlow.display_type');
      this.subscriptions = new CompositeDisposable;
      this.subscribeUpdateConfigurations();
    }

    GitFlowHandler.prototype.destruct = function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    };

    GitFlowHandler.prototype.subscribeUpdateConfigurations = function() {
      this.subscriptions.add(atom.config.observe('tree-view-git-status.gitFlow.enabled', (function(_this) {
        return function(newValue) {
          if (_this.gitFlowEnabled !== newValue) {
            _this.gitFlowEnabled = newValue;
            return _this.updateRoots();
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('tree-view-git-status.gitFlow.display_type', (function(_this) {
        return function(newValue) {
          if (_this.gitFlowDisplayType !== newValue) {
            _this.gitFlowDisplayType = newValue;
            return _this.updateRoots();
          }
        };
      })(this)));
    };

    GitFlowHandler.prototype.updateRoots = function() {
      return this.treeViewUi.updateRoots();
    };

    startsWith = function(name, prefix) {
      return prefix === name.substr(0, prefix.length);
    };

    GitFlowHandler.prototype.getFlowConfig = function(repo) {
      return new GitFlowData(repo);
    };

    GitFlowHandler.prototype.applyGitFlowConfig = function(node, gitFlow) {
      var branchName, branchPrefix, iconNode, prefixNode, stateName, workType;
      if (!(node && gitFlow && this.gitFlowEnabled)) {
        return;
      }
      branchPrefix = '';
      branchName = node.textContent;
      workType = branchName;
      if ((gitFlow.feature != null) && startsWith(branchName, gitFlow.feature)) {
        stateName = 'feature';
        branchPrefix = gitFlow.feature;
        workType = 'a feature';
      } else if ((gitFlow.release != null) && startsWith(branchName, gitFlow.release)) {
        stateName = 'release';
        branchPrefix = gitFlow.release;
        workType = 'a release';
      } else if ((gitFlow.hotfix != null) && startsWith(branchName, gitFlow.hotfix)) {
        stateName = 'hotfix';
        branchPrefix = gitFlow.hotfix;
        workType = 'a hotfix';
      } else if ((gitFlow.develop != null) && branchName === gitFlow.develop) {
        stateName = 'develop';
      } else if ((gitFlow.master != null) && branchName === gitFlow.master) {
        stateName = 'master';
      } else {
        return;
      }
      node.dataset.gitFlowState = stateName;
      node.innerText = '';
      node.classList.add('branch-label--flow', "branch-label--flow-" + stateName);
      if (branchPrefix) {
        branchName = branchName.substr(branchPrefix.length);
      } else {
        branchPrefix = branchName;
        branchName = '';
      }
      if (this.gitFlowDisplayType > 1) {
        iconNode = document.createElement('span');
        iconNode.classList.add("icon", "icon-" + flowIconMap[stateName], 'branch-label__icon', "branch-label__icon--" + stateName);
        iconNode.title = "Working on " + workType;
        node.appendChild(iconNode);
      }
      if (branchName === '' || this.gitFlowDisplayType < 3) {
        prefixNode = document.createElement('span');
        prefixNode.classList.add('branch-label__prefix', "branch-label__prefix--" + stateName);
        prefixNode.textContent = branchPrefix;
        node.appendChild(prefixNode);
      }
      if (branchName !== '') {
        return node.appendChild(document.createTextNode(branchName));
      }
    };

    GitFlowHandler.prototype.convertDirectoryStatus = function(repo, status) {
      var newStatus;
      newStatus = null;
      if (repo.isStatusModified(status)) {
        newStatus = 'modified';
      } else if (repo.isStatusNew(status)) {
        newStatus = 'added';
      }
      return newStatus;
    };

    GitFlowHandler.prototype.enhanceBranchName = function(node, repo) {
      if (!this.gitFlowEnabled) {
        return Promise.resolve();
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var flowData;
          flowData = _this.getFlowConfig(repo);
          if (flowData) {
            _this.applyGitFlowConfig(node, flowData);
          }
          return resolve();
        };
      })(this));
    };

    return GitFlowHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvZ2l0Zmxvd2hhbmRsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUjs7RUFFckIsV0FBQSxHQUNFO0lBQUEsT0FBQSxFQUFTLFFBQVQ7SUFDQSxPQUFBLEVBQVMsU0FEVDtJQUVBLE1BQUEsRUFBUSxPQUZSO0lBR0EsT0FBQSxFQUFTLE1BSFQ7SUFJQSxNQUFBLEVBQVEsVUFKUjs7O0VBT0k7MEJBQ0osTUFBQSxHQUFROzswQkFDUixPQUFBLEdBQVM7OzBCQUNULE9BQUEsR0FBUzs7MEJBQ1QsT0FBQSxHQUFTOzswQkFDVCxNQUFBLEdBQVE7O0lBRUsscUJBQUMsSUFBRDtNQUNYLElBQUEsQ0FBQSxDQUFjLElBQUEsWUFBZ0Isa0JBQTlCLENBQUE7QUFBQSxlQUFBOztNQUNBLElBQUEsR0FBTyxJQUFJLENBQUM7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxjQUFMLENBQW9CLHVCQUFwQjtNQUNWLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLGNBQUwsQ0FBb0Isd0JBQXBCO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsY0FBTCxDQUFvQix3QkFBcEI7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxjQUFMLENBQW9CLHdCQUFwQjtNQUNYLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsdUJBQXBCO0lBUEM7Ozs7OztFQVVmLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLFFBQUE7OzZCQUFBLFVBQUEsR0FBWTs7NkJBQ1osYUFBQSxHQUFlOztJQUVGLHdCQUFDLFVBQUQ7TUFBQyxJ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TCxDQUFzQixNQUF0QixDQUFIO1FBQ0UsU0FBQSxHQUFZLFdBRGQ7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsQ0FBSDtRQUNILFNBQUEsR0FBWSxRQURUOztBQUVMLGFBQU87SUFOZTs7NkJBUXhCLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxFQUFPLElBQVA7TUFDakIsSUFBRyxDQUFJLElBQUMsQ0FBQSxjQUFSO0FBQ0UsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLEVBRFQ7O0FBRUEsYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDakIsY0FBQTtVQUFBLFFBQUEsR0FBVyxLQUFDLENBQUEsYUFBRCxDQUFlLElBQWY7VUFDWCxJQUFHLFFBQUg7WUFDRSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsUUFBMUIsRUFERjs7aUJBRUEsT0FBQSxDQUFBO1FBSmlCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBSE07Ozs7O0FBNUlyQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5HaXRSZXBvc2l0b3J5QXN5bmMgPSByZXF1aXJlICcuL2dpdHJlcG9zaXRvcnlhc3luYydcblxuZmxvd0ljb25NYXAgPVxuICBmZWF0dXJlOiAncHV6emxlJ1xuICByZWxlYXNlOiAncGFja2FnZSdcbiAgaG90Zml4OiAnZmxhbWUnXG4gIGRldmVsb3A6ICdob21lJ1xuICBtYXN0ZXI6ICd2ZXJpZmllZCdcblxuXG5jbGFzcyBHaXRGbG93RGF0YVxuICBtYXN0ZXI6IG51bGxcbiAgZGV2ZWxvcDogbnVsbFxuICBmZWF0dXJlOiBudWxsXG4gIHJlbGVhc2U6IG51bGxcbiAgaG90Zml4OiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChyZXBvKSAtPlxuICAgIHJldHVybiB1bmxlc3MgcmVwbyBpbnN0YW5jZW9mIEdpdFJlcG9zaXRvcnlBc3luY1xuICAgIHJlcG8gPSByZXBvLnJlcG9cbiAgICBAbWFzdGVyID0gcmVwby5nZXRDb25maWdWYWx1ZSgnZ2l0Zmxvdy5icmFuY2gubWFzdGVyJylcbiAgICBAZGV2ZWxvcCA9IHJlcG8uZ2V0Q29uZmlnVmFsdWUoJ2dpdGZsb3cuYnJhbmNoLmRldmVsb3AnKVxuICAgIEBmZWF0dXJlID0gcmVwby5nZXRDb25maWdWYWx1ZSgnZ2l0Zmxvdy5wcmVmaXguZmVhdHVyZScpXG4gICAgQHJlbGVhc2UgPSByZXBvLmdldENvbmZpZ1ZhbHVlKCdnaXRmbG93LnByZWZpeC5yZWxlYXNlJylcbiAgICBAaG90Zml4ID0gcmVwby5nZXRDb25maWdWYWx1ZSgnZ2l0Zmxvdy5wcmVmaXguaG90Zml4JylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdpdEZsb3dIYW5kbGVyXG4gIHRyZWVWaWV3VWk6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHRyZWVWaWV3VWkpIC0+XG4gICAgQGdpdEZsb3dFbmFibGVkID1cbiAgICAgIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LWdpdC1zdGF0dXMuZ2l0Rmxvdy5lbmFibGVkJylcbiAgICBAZ2l0Rmxvd0Rpc3BsYXlUeXBlID1cbiAgICAgIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LWdpdC1zdGF0dXMuZ2l0Rmxvdy5kaXNwbGF5X3R5cGUnKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaWJlVXBkYXRlQ29uZmlndXJhdGlvbnMoKVxuXG4gIGRlc3RydWN0OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBzdWJzY3JpYmVVcGRhdGVDb25maWd1cmF0aW9uczogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5naXRGbG93LmVuYWJsZWQnLFxuICAgICAgICAobmV3VmFsdWUpID0+XG4gICAgICAgICAgaWYgQGdpdEZsb3dFbmFibGVkIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBnaXRGbG93RW5hYmxlZCA9IG5ld1ZhbHVlXG4gICAgICAgICAgICBAdXBkYXRlUm9vdHMoKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0cmVlLXZpZXctZ2l0LXN0YXR1cy5naXRGbG93LmRpc3BsYXlfdHlwZScsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICBpZiBAZ2l0Rmxvd0Rpc3BsYXlUeXBlIGlzbnQgbmV3VmFsdWVcbiAgICAgICAgICAgIEBnaXRGbG93RGlzcGxheVR5cGUgPSBuZXdWYWx1ZVxuICAgICAgICAgICAgQHVwZGF0ZVJvb3RzKClcbiAgICApXG5cbiAgdXBkYXRlUm9vdHM6IC0+XG4gICAgQHRyZWVWaWV3VWkudXBkYXRlUm9vdHMoKVxuXG4gIHN0YXJ0c1dpdGggPSAobmFtZSwgcHJlZml4KSAtPlxuICAgIHByZWZpeCA9PSBuYW1lLnN1YnN0cigwLCBwcmVmaXgubGVuZ3RoKVxuXG4gIGdldEZsb3dDb25maWc6IChyZXBvKSAtPiBuZXcgR2l0Rmxvd0RhdGEocmVwbylcblxuICBhcHBseUdpdEZsb3dDb25maWc6IChub2RlLCBnaXRGbG93KSAtPlxuICAgIHJldHVybiB1bmxlc3Mgbm9kZSBhbmQgZ2l0RmxvdyBhbmQgQGdpdEZsb3dFbmFibGVkXG4gICAgYnJhbmNoUHJlZml4ID0gJydcbiAgICBicmFuY2hOYW1lID0gbm9kZS50ZXh0Q29udGVudFxuICAgIHdvcmtUeXBlID0gYnJhbmNoTmFtZVxuICAgICMgQWRkIEdpdCBGbG93IGluZm9ybWF0aW9uXG4gICAgaWYgZ2l0Rmxvdy5mZWF0dXJlPyBhbmQgc3RhcnRzV2l0aChicmFuY2hOYW1lLCBnaXRGbG93LmZlYXR1cmUpXG4gICAgICBzdGF0ZU5hbWUgPSAnZmVhdHVyZSdcbiAgICAgIGJyYW5jaFByZWZpeCA9IGdpdEZsb3cuZmVhdHVyZVxuICAgICAgd29ya1R5cGUgPSAnYSBmZWF0dXJlJ1xuICAgIGVsc2UgaWYgZ2l0Rmxvdy5yZWxlYXNlPyBhbmQgc3RhcnRzV2l0aChicmFuY2hOYW1lLCBnaXRGbG93LnJlbGVhc2UpXG4gICAgICBzdGF0ZU5hbWUgPSAncmVsZWFzZSdcbiAgICAgIGJyYW5jaFByZWZpeCA9IGdpdEZsb3cucmVsZWFzZVxuICAgICAgd29ya1R5cGUgPSAnYSByZWxlYXNlJ1xuICAgIGVsc2UgaWYgZ2l0Rmxvdy5ob3RmaXg/IGFuZCBzdGFydHNXaXRoKGJyYW5jaE5hbWUsIGdpdEZsb3cuaG90Zml4KVxuICAgICAgc3RhdGVOYW1lID0gJ2hvdGZpeCdcbiAgICAgIGJyYW5jaFByZWZpeCA9IGdpdEZsb3cuaG90Zml4XG4gICAgICB3b3JrVHlwZSA9ICdhIGhvdGZpeCdcbiAgICBlbHNlIGlmIGdpdEZsb3cuZGV2ZWxvcD8gYW5kIGJyYW5jaE5hbWUgPT0gZ2l0Rmxvdy5kZXZlbG9wXG4gICAgICBzdGF0ZU5hbWUgPSAnZGV2ZWxvcCdcbiAgICBlbHNlIGlmIGdpdEZsb3cubWFzdGVyPyBhbmQgYnJhbmNoTmFtZSA9PSBnaXRGbG93Lm1hc3RlclxuICAgICAgc3RhdGVOYW1lID0gJ21hc3RlcidcbiAgICBlbHNlXG4gICAgICAjIFdlJ3JlIG5vdCBvbiBhIEdpdCBGbG93IGJyYW5jaCwgZG9uJ3QgZG8gYW55dGhpbmdcbiAgICAgIHJldHVyblxuICAgICMgQWRkIGEgZGF0YS1mbG93IGF0dHJpYnV0ZVxuICAgIG5vZGUuZGF0YXNldC5naXRGbG93U3RhdGUgPSBzdGF0ZU5hbWVcbiAgICBub2RlLmlubmVyVGV4dCA9ICcnXG4gICAgbm9kZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2JyYW5jaC1sYWJlbC0tZmxvdycsXG4gICAgICBcImJyYW5jaC1sYWJlbC0tZmxvdy0je3N0YXRlTmFtZX1cIlxuICAgIClcbiAgICAjIFJlbW92ZSB0aGUgcHJlZml4IGZyb20gdGhlIGJyYW5jaG5hbWUsIG9yIG1vdmUgdGhlIGJyYW5jaG5hbWUgdG8gdGhlXG4gICAgIyBwcmVmaXggaW4gY2FzZSBvZiBtYXN0ZXIgLyBkZXZlbG9wXG4gICAgaWYgYnJhbmNoUHJlZml4XG4gICAgICBicmFuY2hOYW1lID0gYnJhbmNoTmFtZS5zdWJzdHIoYnJhbmNoUHJlZml4Lmxlbmd0aClcbiAgICBlbHNlXG4gICAgICBicmFuY2hQcmVmaXggPSBicmFuY2hOYW1lXG4gICAgICBicmFuY2hOYW1lID0gJydcbiAgICAjIElmIHdlIHdhbnQgdG8gdXNlIGljb25zLCBtYWtlIHN1cmUgd2UgcmVtb3ZlIHRoZSBwcmVmaXhcbiAgICBpZiBAZ2l0Rmxvd0Rpc3BsYXlUeXBlID4gMVxuICAgICAgaWNvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgIGljb25Ob2RlLmNsYXNzTGlzdC5hZGQoXG4gICAgICAgIFwiaWNvblwiLFxuICAgICAgICBcImljb24tI3tmbG93SWNvbk1hcFtzdGF0ZU5hbWVdfVwiXG4gICAgICAgICdicmFuY2gtbGFiZWxfX2ljb24nXG4gICAgICAgIFwiYnJhbmNoLWxhYmVsX19pY29uLS0je3N0YXRlTmFtZX1cIlxuICAgICAgKVxuICAgICAgaWNvbk5vZGUudGl0bGUgPSBcIldvcmtpbmcgb24gI3t3b3JrVHlwZX1cIlxuICAgICAgbm9kZS5hcHBlbmRDaGlsZChpY29uTm9kZSlcbiAgICAjIElmIHdlJ3JlIGFza2VkIHRvIGRpc3BsYXkgdGhlIHByZWZpeCBvciB3ZSdyZSBvbiBtYXN0ZXIvZGV2ZWxvcCwgZGlzcGxheVxuICAgICMgaXQuXG4gICAgaWYgYnJhbmNoTmFtZSA9PSAnJyBvciBAZ2l0Rmxvd0Rpc3BsYXlUeXBlIDwgM1xuICAgICAgcHJlZml4Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgcHJlZml4Tm9kZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgICAnYnJhbmNoLWxhYmVsX19wcmVmaXgnXG4gICAgICAgIFwiYnJhbmNoLWxhYmVsX19wcmVmaXgtLSN7c3RhdGVOYW1lfVwiXG4gICAgICApXG4gICAgICBwcmVmaXhOb2RlLnRleHRDb250ZW50ID0gYnJhbmNoUHJlZml4XG4gICAgICBub2RlLmFwcGVuZENoaWxkKHByZWZpeE5vZGUpXG4gICAgIyBGaW5hbGx5LCBpZiB3ZSBoYXZlIGEgYnJhbmNobmFtZSBsZWZ0IG92ZXIsIGFkZCBpdCBhcyB3ZWxsLlxuICAgIGlmIGJyYW5jaE5hbWUgIT0gJydcbiAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYnJhbmNoTmFtZSkpXG5cbiAgY29udmVydERpcmVjdG9yeVN0YXR1czogKHJlcG8sIHN0YXR1cykgLT5cbiAgICBuZXdTdGF0dXMgPSBudWxsXG4gICAgaWYgcmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1cylcbiAgICAgIG5ld1N0YXR1cyA9ICdtb2RpZmllZCdcbiAgICBlbHNlIGlmIHJlcG8uaXNTdGF0dXNOZXcoc3RhdHVzKVxuICAgICAgbmV3U3RhdHVzID0gJ2FkZGVkJ1xuICAgIHJldHVybiBuZXdTdGF0dXNcblxuICBlbmhhbmNlQnJhbmNoTmFtZTogKG5vZGUsIHJlcG8pIC0+XG4gICAgaWYgbm90IEBnaXRGbG93RW5hYmxlZFxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBmbG93RGF0YSA9IEBnZXRGbG93Q29uZmlnKHJlcG8pXG4gICAgICBpZiBmbG93RGF0YVxuICAgICAgICBAYXBwbHlHaXRGbG93Q29uZmlnKG5vZGUsIGZsb3dEYXRhKVxuICAgICAgcmVzb2x2ZSgpXG4gICAgKVxuIl19
