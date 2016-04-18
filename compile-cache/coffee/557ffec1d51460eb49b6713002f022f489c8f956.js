(function() {
  var Range, Shell, SimpleGitHubFile;

  Shell = require('shell');

  Range = require('atom').Range;

  module.exports = SimpleGitHubFile = (function() {
    SimpleGitHubFile.fromPath = function(filePath) {
      return new GitHubFile(filePath);
    };

    function SimpleGitHubFile(filePath) {
      this.filePath = filePath;
      this.repo = atom.project.getRepo();
    }

    SimpleGitHubFile.prototype.open = function() {
      if (this.isOpenable()) {
        return this.openUrlInBrowser(this.blobUrl());
      } else {
        return this.reportValidationErrors();
      }
    };

    SimpleGitHubFile.prototype.blame = function(lineRange) {
      if (this.isOpenable()) {
        return this.openUrlInBrowser(this.blameUrl() + this.getLineRangeSuffix(lineRange));
      } else {
        return this.reportValidationErrors();
      }
    };

    SimpleGitHubFile.prototype.history = function(lineRange) {
      if (this.isOpenable()) {
        return this.openUrlInBrowser(this.historyUrl() + this.getLineRangeSuffix(lineRange));
      } else {
        return this.reportValidationErrors();
      }
    };

    SimpleGitHubFile.prototype.copyUrl = function(lineRange) {
      var url;
      if (this.isOpenable()) {
        url = this.blobUrl();
        return atom.clipboard.write(url + this.getLineRangeSuffix(lineRange));
      } else {
        return this.reportValidationErrors();
      }
    };

    SimpleGitHubFile.prototype.getLineRangeSuffix = function(lineRange) {
      var endRow, startRow;
      if (lineRange && atom.config.get('open-on-github.includeLineNumbersInUrls')) {
        lineRange = Range.fromObject(lineRange);
        startRow = lineRange.start.row + 1;
        endRow = lineRange.end.row + 1;
        if (startRow === endRow) {
          return "#L" + startRow;
        } else {
          return "#L" + startRow + "-L" + endRow;
        }
      } else {
        return '';
      }
    };

    SimpleGitHubFile.prototype.isOpenable = function() {
      return this.validationErrors().length === 0;
    };

    SimpleGitHubFile.prototype.validationErrors = function() {
      if (!this.gitUrl()) {
        return ["No URL defined for remote (" + (this.remoteName()) + ")"];
      }
      if (!this.githubRepoUrl()) {
        return ["Remote URL is not hosted on GitHub.com (" + (this.gitUrl()) + ")"];
      }
      return [];
    };

    SimpleGitHubFile.prototype.reportValidationErrors = function() {
      var error, _i, _len, _ref, _results;
      atom.beep();
      _ref = this.validationErrors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        error = _ref[_i];
        _results.push(console.warn(error));
      }
      return _results;
    };

    SimpleGitHubFile.prototype.openUrlInBrowser = function(url) {
      return Shell.openExternal(url);
    };

    SimpleGitHubFile.prototype.blobUrl = function() {
      return "" + (this.githubRepoUrl()) + "/blob/" + (this.branch()) + "/" + (this.repoRelativePath());
    };

    SimpleGitHubFile.prototype.blameUrl = function() {
      return "" + (this.githubRepoUrl()) + "/blame/" + (this.branch()) + "/" + (this.repoRelativePath());
    };

    SimpleGitHubFile.prototype.historyUrl = function() {
      return "" + (this.githubRepoUrl()) + "/commits/" + (this.branch()) + "/" + (this.repoRelativePath());
    };

    SimpleGitHubFile.prototype.gitUrl = function() {
      var remoteOrBestGuess, _ref;
      remoteOrBestGuess = (_ref = this.remoteName()) != null ? _ref : 'origin';
      return this.repo.getConfigValue("remote." + remoteOrBestGuess + ".url");
    };

    SimpleGitHubFile.prototype.githubRepoUrl = function() {
      var url;
      url = this.gitUrl();
      if (url.match(/https:\/\/[^\/]+\//)) {
        return url.replace(/\.git$/, '');
      } else if (url.match(/git@[^:]+:/)) {
        return url.replace(/^git@([^:]+):(.+)$/, function(match, host, repoPath) {
          return ("http://" + host + "/" + repoPath).replace(/\.git$/, '');
        });
      } else if (url.match(/^git:\/\/[^\/]+\//)) {
        return "http" + (url.substring(3).replace(/\.git$/, ''));
      }
    };

    SimpleGitHubFile.prototype.repoRelativePath = function() {
      return this.repo.relativize(this.filePath);
    };

    SimpleGitHubFile.prototype.remoteName = function() {
      var refName, _ref, _ref1;
      refName = this.repo.getUpstreamBranch();
      return (_ref = refName != null ? (_ref1 = refName.match(/^refs\/remotes\/(.+)\/.*$/)) != null ? _ref1[1] : void 0 : void 0) != null ? _ref : null;
    };

    SimpleGitHubFile.prototype.branch = function() {
      var refName, _ref, _ref1;
      refName = this.repo.getUpstreamBranch();
      return (_ref = refName != null ? (_ref1 = refName.match(/^refs\/remotes\/.*\/(.+)$/)) != null ? _ref1[1] : void 0 : void 0) != null ? _ref : this.repo.getShortHead();
    };

    return SimpleGitHubFile;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBR0osSUFBQSxnQkFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLFFBQUQsR0FBQTthQUNMLElBQUEsVUFBQSxDQUFXLFFBQVgsRUFESztJQUFBLENBQVgsQ0FBQTs7QUFJYSxJQUFBLDBCQUFFLFFBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVIsQ0FEVztJQUFBLENBSmI7O0FBQUEsK0JBUUEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFsQixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBSEY7T0FESTtJQUFBLENBUk4sQ0FBQTs7QUFBQSwrQkFlQSxLQUFBLEdBQU8sU0FBQyxTQUFELEdBQUE7QUFDTCxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLGdCQUFELENBQWtCLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFwQixDQUFoQyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBSEY7T0FESztJQUFB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
//# sourceURL=/Users/Rad/.atom/packages/branch-status/lib/SimpleGitHubFile.coffee