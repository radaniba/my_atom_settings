(function() {
  var $, Shell, SimpleGitHubFile, etag, findPR, getNameWithOwner, getRef, getToken, pollStatus, request, tooltip,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = null;

  request = null;

  SimpleGitHubFile = null;

  Shell = null;

  etag = null;

  tooltip = null;

  getToken = function() {
    return atom.config.get("branch-status.personalAccessToken");
  };

  getNameWithOwner = function(editor) {
    var githubURL, nameWithOwner;
    githubURL = new SimpleGitHubFile(editor.getPath()).githubRepoUrl();
    if (!githubURL) {
      return;
    }
    nameWithOwner = githubURL.split('.com/')[1];
    return nameWithOwner != null ? nameWithOwner.replace(/\/+$/, '') : void 0;
  };

  getRef = function() {
    var refName, repo, _ref, _ref1;
    repo = (_ref = atom.project.getRepositories()) != null ? _ref[0] : void 0;
    refName = repo != null ? (_ref1 = repo.branch) != null ? _ref1.replace('refs/heads/', '').trim() : void 0 : void 0;
    return refName;
  };

  findPR = function() {
    var editor, nameWithOwner, owner, ref, requestOptions, token, uri;
    setTimeout(findPR, 5000);
    if (!(ref = getRef())) {
      return;
    }
    if (!(editor = atom.workspace.getActiveTextEditor())) {
      return;
    }
    token = getToken();
    if (!(nameWithOwner = getNameWithOwner(editor))) {
      return;
    }
    owner = nameWithOwner.split('/')[0];
    uri = "https://api.github.com/repos/" + nameWithOwner + "/pulls?head=" + owner + ":" + ref;
    if (token) {
      uri += "&access_token=" + token;
    }
    requestOptions = {
      uri: uri,
      headers: {
        'User-Agent': 'Atom Branch Status 0.8.0'
      }
    };
    return request(requestOptions, (function(_this) {
      return function(error, response, body) {
        var labelElement, link, message, pr, state, _ref;
        if (error) {
          console.error("Error:", error);
        }
        if (error) {
          return;
        }
        if (response.statusCode === 304) {
          return;
        }
        body = JSON.parse(body);
        if (!response.statusCode === 200) {
          if (response.statusCode !== 200) {
            state = response.statusCode;
          }
          message = (body != null ? body.message : void 0) || response.statusMessage;
          console.error(state, message);
          return;
        }
        if ((_ref = $('.branch-status-pr-number')) != null) {
          _ref.remove();
        }
        if (!(pr = body[0])) {
          return;
        }
        link = $("<a class='branch-status-pr-number'> (#" + pr.number + ")</a>");
        link.on("click", function() {
          return Shell.openExternal(pr.html_url);
        });
        labelElement = $('.git-branch .branch-label');
        return labelElement.after(link);
      };
    })(this));
  };

  pollStatus = function() {
    var editor, ifNoneMatch, nameWithOwner, ref, statusRequestOptions, token, uri;
    setTimeout(pollStatus, 5000);
    if (!(ref = getRef())) {
      return;
    }
    if (!(editor = atom.workspace.getActiveTextEditor())) {
      return;
    }
    token = getToken();
    if (!(nameWithOwner = getNameWithOwner(editor))) {
      return;
    }
    uri = "https://api.github.com/repos/" + nameWithOwner + "/statuses/" + ref;
    if (token) {
      uri += "?access_token=" + token;
    }
    ifNoneMatch = etag || "";
    statusRequestOptions = {
      uri: uri,
      headers: {
        'User-Agent': 'Atom Branch Status 0.8.0',
        'If-None-Match': ifNoneMatch
      }
    };
    return request(statusRequestOptions, (function(_this) {
      return function(error, response, body) {
        var branchElement, context, labelElement, link, message, state, status, statusContexts, targetUrl, text, _i, _len;
        if (error) {
          console.error("Error:", error);
        }
        if (error) {
          return;
        }
        if (response.statusCode === 304) {
          return;
        }
        etag = response.headers.etag;
        body = JSON.parse(body);
        if (response.statusCode !== 200) {
          state = response.statusCode;
        }
        message = body.message || response.statusMessage;
        targetUrl = null;
        if (!state) {
          statusContexts = [];
          for (_i = 0, _len = body.length; _i < _len; _i++) {
            status = body[_i];
            context = status.context;
            if (__indexOf.call(statusContexts, context) >= 0) {
              break;
            }
            statusContexts.push(context);
            if (status.state !== "success" || !state) {
              state = status.state;
              message = status.description;
              targetUrl = status.target_url;
              if (state === "error" || state === "failure") {
                break;
              }
            }
          }
        }
        branchElement = $('.git-branch');
        if (state === "success") {
          branchElement.css({
            color: "#0AB254"
          });
        } else if (state === "pending") {
          branchElement.css({
            color: "#FFE754"
          });
        } else if (state === "error" || state === "failure") {
          branchElement.css({
            color: "#FF2F1D"
          });
        } else if (state) {
          branchElement.css({
            color: "#AA8A69"
          });
          console.error(state, message);
        } else {
          branchElement.css({
            color: "inherit"
          });
          message = null;
        }
        if (tooltip != null) {
          tooltip.dispose();
        }
        if (message) {
          tooltip = atom.tooltips.add(branchElement, {
            title: message
          });
        }
        if (targetUrl) {
          labelElement = $('.git-branch .branch-label');
          link = $("<a class='branch-status-target-link'>" + labelElement[0].innerText + "</a>");
          link.on("click", function() {
            return Shell.openExternal(targetUrl);
          });
          return labelElement.html(link);
        } else {
          labelElement = $('.git-branch .branch-label');
          text = $("<span>" + labelElement[0].innerText + "</span>");
          return labelElement.html(text);
        }
      };
    })(this));
  };

  module.exports = {
    config: {
      personalAccessToken: {
        type: "string",
        description: "Your personal GitHub access token",
        "default": ""
      }
    },
    activate: function(state) {
      console.log(state);
      return setTimeout(this.retryStatus, 5000);
    },
    deactivate: function() {},
    serialize: function() {},
    retryStatus: (function(_this) {
      return function() {
        if ($ == null) {
          $ = require('atom-space-pen-views').$;
        }
        if (request == null) {
          request = require('request');
        }
        if (SimpleGitHubFile == null) {
          SimpleGitHubFile = require('./SimpleGitHubFile');
        }
        if (Shell == null) {
          Shell = require('shell');
        }
        findPR();
        return pollStatus();
      };
    })(this)
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9icmFuY2gtc3RhdHVzL2xpYi9icmFuY2gtc3RhdHVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwR0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLElBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxJQURWLENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixJQUZuQixDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLElBSFIsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxJQUxQLENBQUE7O0FBQUEsRUFNQSxPQUFBLEdBQVUsSUFOVixDQUFBOztBQUFBLEVBUUEsUUFBQSxHQUFXLFNBQUEsR0FBQTtXQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEIsRUFEUztFQUFBLENBUlgsQ0FBQTs7QUFBQSxFQWFBLGdCQUFBLEdBQW1CLFNBQUMsTUFBRCxHQUFBO0FBQ2pCLFFBQUEsd0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBZ0IsSUFBQSxnQkFBQSxDQUFpQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQWpCLENBQWtDLENBQUMsYUFBbkMsQ0FBQSxDQUFoQixDQUFBO0FBQ0EsSUFBQSxJQUFBLENBQUEsU0FBQTtBQUFBLFlBQUEsQ0FBQTtLQURBO0FBQUEsSUFFQSxhQUFBLEdBQWdCLFNBQVMsQ0FBQyxLQUFWLENBQWdCLE9BQWhCLENBQXlCLENBQUEsQ0FBQSxDQUZ6QyxDQUFBO21DQUdBLGFBQWEsQ0FBRSxPQUFmLENBQXVCLE1BQXZCLEVBQStCLEVBQS9CLFdBSmlCO0VBQUEsQ0FibkIsQ0FBQTs7QUFBQSxFQW1CQSxNQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsUUFBQSwwQkFBQTtBQUFBLElBQUEsSUFBQSx5REFBdUMsQ0FB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

//# sourceURL=/Users/Rad/.atom/packages/branch-status/lib/branch-status.coffee
