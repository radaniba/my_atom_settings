(function() {
  var Range, Shell, SimpleGitHubFile;

  Shell = require('shell');

  Range = require('atom').Range;

  module.exports = SimpleGitHubFile = (function() {
    SimpleGitHubFile.fromPath = function(filePath) {
      return new GitHubFile(filePath);
    };

    function SimpleGitHubFile(filePath) {
      var _ref;
      this.filePath = filePath;
      this.repo = (_ref = atom.project.getRepositories()) != null ? _ref[0] : void 0;
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
