(function() {
  var CompositeDisposable, Emitter, GitRepositoryAsync, ProjectRepositories, ref, utils;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  utils = require('./utils');

  GitRepositoryAsync = require('./gitrepositoryasync');

  module.exports = ProjectRepositories = (function() {
    ProjectRepositories.prototype.projectSubscriptions = null;

    ProjectRepositories.prototype.repositorySubscriptions = null;

    function ProjectRepositories(ignoredRepositories) {
      this.ignoredRepositories = ignoredRepositories;
      this.emitter = new Emitter;
      this.repositoryMap = new Map;
      this.projectSubscriptions = new CompositeDisposable;
      this.repositorySubscriptions = new CompositeDisposable;
      this.projectSubscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.subscribeUpdateRepositories();
        };
      })(this)));
      this.subscribeUpdateRepositories();
    }

    ProjectRepositories.prototype.destruct = function() {
      var ref1, ref2, ref3, ref4, ref5;
      if ((ref1 = this.projectSubscriptions) != null) {
        ref1.dispose();
      }
      this.projectSubscriptions = null;
      if ((ref2 = this.repositorySubscriptions) != null) {
        ref2.dispose();
      }
      this.repositorySubscriptions = null;
      this.ignoredRepositories = null;
      if ((ref3 = this.repositoryMap) != null) {
        ref3.clear();
      }
      this.repositoryMap = null;
      if ((ref4 = this.emitter) != null) {
        ref4.clear();
      }
      if ((ref5 = this.emitter) != null) {
        ref5.dispose();
      }
      return this.emitter = null;
    };

    ProjectRepositories.prototype.subscribeUpdateRepositories = function() {
      var i, len, ref1, ref2, repo, repoPromises, repositoryMap, tmpRepositorySubscriptions;
      if ((ref1 = this.repositorySubscriptions) != null) {
        ref1.dispose();
      }
      tmpRepositorySubscriptions = new CompositeDisposable;
      repositoryMap = new Map();
      repoPromises = [];
      ref2 = atom.project.getRepositories();
      for (i = 0, len = ref2.length; i < len; i++) {
        repo = ref2[i];
        if (repo != null) {
          repoPromises.push(this.doSubscribeUpdateRepository(repo, repositoryMap, tmpRepositorySubscriptions));
        }
      }
      return utils.settle(repoPromises).then((function(_this) {
        return function() {
          if (_this.repositoryMap != null) {
            _this.repositorySubscriptions = tmpRepositorySubscriptions;
            _this.repositoryMap = repositoryMap;
            return _this.emitter.emit('did-change-repos', _this.repositoryMap);
          } else {
            return tmpRepositorySubscriptions.dispose();
          }
        };
      })(this))["catch"](function(err) {
        console.error(err);
        return Promise.reject(err);
      });
    };

    ProjectRepositories.prototype.doSubscribeUpdateRepository = function(repo, repositoryMap, repositorySubscriptions) {
      var repoasync;
      if (repo.async != null) {
        repoasync = repo.async;
      } else {
        repoasync = new GitRepositoryAsync(repo);
      }
      return repoasync.getShortHead().then(function(shortHead) {
        if (!typeof shortHead === 'string') {
          return Promise.reject('Got invalid short head for repo');
        }
      }).then((function(_this) {
        return function() {
          return repoasync.getWorkingDirectory().then(function(directory) {
            var repoPath;
            if (!typeof directory === 'string') {
              return Promise.reject('Got invalid working directory path for repo');
            }
            repoPath = utils.normalizePath(directory);
            if (!_this.isRepositoryIgnored(repoPath)) {
              repositoryMap.set(repoPath, repoasync);
              return _this.subscribeToRepo(repoPath, repoasync, repositorySubscriptions);
            }
          });
        };
      })(this))["catch"](function(error) {
        console.warn('Ignoring respority due to error:', error, repo);
        return Promise.resolve();
      });
    };

    ProjectRepositories.prototype.subscribeToRepo = function(repoPath, repo, repositorySubscriptions) {
      if (repositorySubscriptions != null) {
        repositorySubscriptions.add(repo.onDidChangeStatuses((function(_this) {
          return function() {
            var ref1, ref2;
            if ((ref1 = _this.repositoryMap) != null ? ref1.has(repoPath) : void 0) {
              return (ref2 = _this.emitter) != null ? ref2.emit('did-change-repo-status', {
                repo: repo,
                repoPath: repoPath
              }) : void 0;
            }
          };
        })(this)));
      }
      return repositorySubscriptions != null ? repositorySubscriptions.add(repo.onDidChangeStatus((function(_this) {
        return function() {
          var ref1, ref2;
          if ((ref1 = _this.repositoryMap) != null ? ref1.has(repoPath) : void 0) {
            return (ref2 = _this.emitter) != null ? ref2.emit('did-change-repo-status', {
              repo: repo,
              repoPath: repoPath
            }) : void 0;
          }
        };
      })(this))) : void 0;
    };

    ProjectRepositories.prototype.getRepositories = function() {
      return this.repositoryMap;
    };

    ProjectRepositories.prototype.setIgnoredRepositories = function(ignoredRepositories) {
      this.ignoredRepositories = ignoredRepositories;
      return this.subscribeUpdateRepositories();
    };

    ProjectRepositories.prototype.isRepositoryIgnored = function(repoPath) {
      return this.ignoredRepositories.has(repoPath);
    };

    ProjectRepositories.prototype.onDidChange = function(evtType, handler) {
      return this.emitter.on('did-change-' + evtType, handler);
    };

    return ProjectRepositories;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90cmVlLXZpZXctZ2l0LXN0YXR1cy9saWIvcmVwb3NpdG9yaWVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDdEIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUjs7RUFHckIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7a0NBRXJCLG9CQUFBLEdBQXNCOztrQ0FDdEIsdUJBQUEsR0FBeUI7O0lBRVosNkJBQUMsbUJBQUQ7TUFBQyxJQUFDLENBQUEsc0JBQUQ7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO01BQzVCLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFJO01BQy9CLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUEwQixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFFdEQsS0FBQyxDQUFBLDJCQUFELENBQUE7UUFGc0Q7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBQTFCO01BR0EsSUFBQyxDQUFBLDJCQUFELENBQUE7SUFSVzs7a0NBVWIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBOztZQUFxQixDQUFFLE9BQXZCLENBQUE7O01BQ0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCOztZQUNBLENBQUUsT0FBMUIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsdUJBQUQsR0FBMkI7TUFDM0IsSUFBQyxDQUFBLG1CQUFELEdBQXVCOztZQUNULENBQUUsS0FBaEIsQ0FBQTs7TUFDQSxJ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QSwrQ0FBaUIsQ0FBRSxHQUFoQixDQUFvQixRQUFwQixVQUFIOzBEQUNVLENBQUUsSUFBVixDQUFlLHdCQUFmLEVBQXlDO2dCQUFFLE1BQUEsSUFBRjtnQkFBUSxVQUFBLFFBQVI7ZUFBekMsV0FERjs7VUFGb0Q7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBQTdCOzsrQ0FJQSx1QkFBdUIsQ0FBRSxHQUF6QixDQUE2QixJQUFJLENBQUMsaUJBQUwsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBRWxELGNBQUE7VUFBQSwrQ0FBaUIsQ0FBRSxHQUFoQixDQUFvQixRQUFwQixVQUFIO3dEQUNVLENBQUUsSUFBVixDQUFlLHdCQUFmLEVBQXlDO2NBQUUsTUFBQSxJQUFGO2NBQVEsVUFBQSxRQUFSO2FBQXpDLFdBREY7O1FBRmtEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQUE3QjtJQUxlOztrQ0FVakIsZUFBQSxHQUFpQixTQUFBO0FBQ2YsYUFBTyxJQUFDLENBQUE7SUFETzs7a0NBR2pCLHNCQUFBLEdBQXdCLFNBQUMsbUJBQUQ7TUFBQyxJQUFDLENBQUEsc0JBQUQ7YUFDdkIsSUFBQyxDQUFBLDJCQUFELENBQUE7SUFEc0I7O2tDQUd4QixtQkFBQSxHQUFxQixTQUFDLFFBQUQ7QUFDbkIsYUFBTyxJQUFDLENBQUEsbUJBQW1CLENBQUMsR0FBckIsQ0FBeUIsUUFBekI7SUFEWTs7a0NBR3JCLFdBQUEsR0FBYSxTQUFDLE9BQUQsRUFBVSxPQUFWO0FBQ1gsYUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFBLEdBQWdCLE9BQTVCLEVBQXFDLE9BQXJDO0lBREk7Ozs7O0FBM0dmIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbnV0aWxzID0gcmVxdWlyZSAnLi91dGlscydcbkdpdFJlcG9zaXRvcnlBc3luYyA9IHJlcXVpcmUgJy4vZ2l0cmVwb3NpdG9yeWFzeW5jJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvamVjdFJlcG9zaXRvcmllc1xuXG4gIHByb2plY3RTdWJzY3JpcHRpb25zOiBudWxsXG4gIHJlcG9zaXRvcnlTdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAaWdub3JlZFJlcG9zaXRvcmllcykgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHJlcG9zaXRvcnlNYXAgPSBuZXcgTWFwXG4gICAgQHByb2plY3RTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBwcm9qZWN0U3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgPT5cbiAgICAgICMgUmVmcmVzaCBTQ00gcmVzcG9yaXR5IHN1YnNjcmlwdGlvbnNcbiAgICAgIEBzdWJzY3JpYmVVcGRhdGVSZXBvc2l0b3JpZXMoKVxuICAgIEBzdWJzY3JpYmVVcGRhdGVSZXBvc2l0b3JpZXMoKVxuXG4gIGRlc3RydWN0OiAtPlxuICAgIEBwcm9qZWN0U3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHByb2plY3RTdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHJlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEBpZ25vcmVkUmVwb3NpdG9yaWVzID0gbnVsbFxuICAgIEByZXBvc2l0b3J5TWFwPy5jbGVhcigpXG4gICAgQHJlcG9zaXRvcnlNYXAgPSBudWxsXG4gICAgQGVtaXR0ZXI/LmNsZWFyKClcbiAgICBAZW1pdHRlcj8uZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIgPSBudWxsXG5cbiAgc3Vic2NyaWJlVXBkYXRlUmVwb3NpdG9yaWVzOiAtPlxuICAgIEByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgdG1wUmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHJlcG9zaXRvcnlNYXAgPSBuZXcgTWFwKClcbiAgICByZXBvUHJvbWlzZXMgPSBbXVxuICAgIGZvciByZXBvIGluIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKSB3aGVuIHJlcG8/XG4gICAgICByZXBvUHJvbWlzZXMucHVzaCBAZG9TdWJzY3JpYmVVcGRhdGVSZXBvc2l0b3J5KFxuICAgICAgICByZXBvLCByZXBvc2l0b3J5TWFwLCB0bXBSZXBvc2l0b3J5U3Vic2NyaXB0aW9uc1xuICAgICAgKVxuICAgIHJldHVybiB1dGlscy5zZXR0bGUocmVwb1Byb21pc2VzKVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgIyBWZXJpZnkgaWYgdGhlIHJlcG9zaXRvcmllcyBpbnN0YW5jZSBoYXZlbid0IGJlZW4geWV0XG4gICAgICAgICMgZGVzdHJ1Y3RlZCAoaS5lLiBpZiB3ZSBhcmUgc3RpbGwgXCJ0b2dnbGVkXCIpXG4gICAgICAgIGlmIEByZXBvc2l0b3J5TWFwP1xuICAgICAgICAgIEByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucyA9IHRtcFJlcG9zaXRvcnlTdWJzY3JpcHRpb25zXG4gICAgICAgICAgQHJlcG9zaXRvcnlNYXAgPSByZXBvc2l0b3J5TWFwXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS1yZXBvcycsIEByZXBvc2l0b3J5TWFwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0bXBSZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIClcbiAgICAgIC5jYXRjaCgoZXJyKSAtPlxuICAgICAgICAjIExvZyBlcnJvclxuICAgICAgICBjb25zb2xlLmVycm9yIGVyclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgICAgKVxuXG4gIGRvU3Vic2NyaWJlVXBkYXRlUmVwb3NpdG9yeTogKHJlcG8sIHJlcG9zaXRvcnlNYXAsIHJlcG9zaXRvcnlTdWJzY3JpcHRpb25zKSAtPlxuICAgIGlmIHJlcG8uYXN5bmM/XG4gICAgICByZXBvYXN5bmMgPSByZXBvLmFzeW5jXG4gICAgZWxzZVxuICAgICAgcmVwb2FzeW5jID0gbmV3IEdpdFJlcG9zaXRvcnlBc3luYyhyZXBvKVxuXG4gICAgIyBWYWxpZGF0ZSByZXBvIHRvIGF2b2lkIGVycm9ycyBmcm9tIHRoaXJkcGFydHkgcmVwbyBoYW5kbGVyc1xuICAgIHJldHVybiByZXBvYXN5bmMuZ2V0U2hvcnRIZWFkKClcbiAgICAgIC50aGVuKChzaG9ydEhlYWQpIC0+XG4gICAgICAgIGlmIG5vdCB0eXBlb2Ygc2hvcnRIZWFkIGlzICdzdHJpbmcnXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdHb3QgaW52YWxpZCBzaG9ydCBoZWFkIGZvciByZXBvJylcbiAgICAgIClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIHJldHVybiByZXBvYXN5bmMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICAgICAgLnRoZW4oKGRpcmVjdG9yeSkgPT5cbiAgICAgICAgICAgIGlmIG5vdCB0eXBlb2YgZGlyZWN0b3J5IGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcbiAgICAgICAgICAgICAgICAnR290IGludmFsaWQgd29ya2luZyBkaXJlY3RvcnkgcGF0aCBmb3IgcmVwbydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgcmVwb1BhdGggPSB1dGlscy5ub3JtYWxpemVQYXRoKGRpcmVjdG9yeSlcbiAgICAgICAgICAgIGlmICFAaXNSZXBvc2l0b3J5SWdub3JlZChyZXBvUGF0aClcbiAgICAgICAgICAgICAgcmVwb3NpdG9yeU1hcC5zZXQgcmVwb1BhdGgsIHJlcG9hc3luY1xuICAgICAgICAgICAgICBAc3Vic2NyaWJlVG9SZXBvIHJlcG9QYXRoLCByZXBvYXN5bmMsIHJlcG9zaXRvcnlTdWJzY3JpcHRpb25zXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICAgLmNhdGNoKChlcnJvcikgLT5cbiAgICAgICAgY29uc29sZS53YXJuICdJZ25vcmluZyByZXNwb3JpdHkgZHVlIHRvIGVycm9yOicsIGVycm9yLCByZXBvXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgKVxuXG4gIHN1YnNjcmliZVRvUmVwbzogKHJlcG9QYXRoLCByZXBvLCByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucykgLT5cbiAgICByZXBvc2l0b3J5U3Vic2NyaXB0aW9ucz8uYWRkIHJlcG8ub25EaWRDaGFuZ2VTdGF0dXNlcyA9PlxuICAgICAgIyBTYW5pdHkgY2hlY2tcbiAgICAgIGlmIEByZXBvc2l0b3J5TWFwPy5oYXMocmVwb1BhdGgpXG4gICAgICAgIEBlbWl0dGVyPy5lbWl0ICdkaWQtY2hhbmdlLXJlcG8tc3RhdHVzJywgeyByZXBvLCByZXBvUGF0aCB9XG4gICAgcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM/LmFkZCByZXBvLm9uRGlkQ2hhbmdlU3RhdHVzID0+XG4gICAgICAjIFNhbml0eSBjaGVja1xuICAgICAgaWYgQHJlcG9zaXRvcnlNYXA/LmhhcyhyZXBvUGF0aClcbiAgICAgICAgQGVtaXR0ZXI/LmVtaXQgJ2RpZC1jaGFuZ2UtcmVwby1zdGF0dXMnLCB7IHJlcG8sIHJlcG9QYXRoIH1cblxuICBnZXRSZXBvc2l0b3JpZXM6ICgpIC0+XG4gICAgcmV0dXJuIEByZXBvc2l0b3J5TWFwXG5cbiAgc2V0SWdub3JlZFJlcG9zaXRvcmllczogKEBpZ25vcmVkUmVwb3NpdG9yaWVzKSAtPlxuICAgIEBzdWJzY3JpYmVVcGRhdGVSZXBvc2l0b3JpZXMoKVxuXG4gIGlzUmVwb3NpdG9yeUlnbm9yZWQ6IChyZXBvUGF0aCkgLT5cbiAgICByZXR1cm4gQGlnbm9yZWRSZXBvc2l0b3JpZXMuaGFzKHJlcG9QYXRoKVxuXG4gIG9uRGlkQ2hhbmdlOiAoZXZ0VHlwZSwgaGFuZGxlcikgLT5cbiAgICByZXR1cm4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtJyArIGV2dFR5cGUsIGhhbmRsZXJcbiJdfQ==
