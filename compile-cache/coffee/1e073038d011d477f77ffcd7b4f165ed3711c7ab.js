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
        var branchElement, context, labelElement, link, message, state, status, statusContexts, targetUrl, _i, _len;
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
            color: "green"
          });
        } else if (state === "pending") {
          branchElement.css({
            color: "yellow"
          });
        } else if (state === "error" || state === "failure") {
          branchElement.css({
            color: "red"
          });
        } else if (state) {
          branchElement.css({
            color: "pink"
          });
          console.error(state, message);
        }
        if (message) {
          if (tooltip != null) {
            tooltip.dispose();
          }
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
