(function() {
  var atomRefresh, callGit, cwd, fs, getBranches, git, logcb, noop, parseDefault, parseDiff, parseStatus, path, projectIndex, q, repo, setProjectIndex;

  fs = require('fs');

  path = require('path');

  git = require('git-promise');

  q = require('q');

  logcb = function(log, error) {
    return console[error ? 'error' : 'log'](log);
  };

  repo = void 0;

  cwd = void 0;

  projectIndex = 0;

  noop = function() {
    return q.fcall(function() {
      return true;
    });
  };

  atomRefresh = function() {
    repo.refreshStatus();
  };

  getBranches = function() {
    return q.fcall(function() {
      var branches, h, i, j, len, len1, ref, ref1, refs;
      branches = {
        local: [],
        remote: [],
        tags: []
      };
      refs = repo.getReferences();
      ref = refs.heads;
      for (i = 0, len = ref.length; i < len; i++) {
        h = ref[i];
        branches.local.push(h.replace('refs/heads/', ''));
      }
      ref1 = refs.remotes;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        h = ref1[j];
        branches.remote.push(h.replace('refs/remotes/', ''));
      }
      return branches;
    });
  };

  setProjectIndex = function(index) {
    repo = void 0;
    cwd = void 0;
    projectIndex = index;
    if (atom.project) {
      repo = atom.project.getRepositories()[index];
      cwd = repo ? repo.getWorkingDirectory() : void 0;
    }
  };

  setProjectIndex(projectIndex);

  parseDiff = function(data) {
    return q.fcall(function() {
      var diff, diffs, i, len, line, ref;
      diffs = [];
      diff = {};
      ref = data.split('\n');
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.length) {
          switch (false) {
            case !/^diff --git /.test(line):
              diff = {
                lines: [],
                added: 0,
                removed: 0
              };
              diff['diff'] = line.replace(/^diff --git /, '');
              diffs.push(diff);
              break;
            case !/^index /.test(line):
              diff['index'] = line.replace(/^index /, '');
              break;
            case !/^--- /.test(line):
              diff['---'] = line.replace(/^--- [a|b]\//, '');
              break;
            case !/^\+\+\+ /.test(line):
              diff['+++'] = line.replace(/^\+\+\+ [a|b]\//, '');
              break;
            default:
              diff['lines'].push(line);
              if (/^\+/.test(line)) {
                diff['added']++;
              }
              if (/^-/.test(line)) {
                diff['removed']++;
              }
          }
        }
      }
      return diffs;
    });
  };

  parseStatus = function(data) {
    return q.fcall(function() {
      var files, i, len, line, name, ref, type;
      files = [];
      ref = data.split('\n');
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (!line.length) {
          continue;
        }
        type = line.substring(0, 2);
        name = line.substring(2).trim().replace(new RegExp('\"', 'g'), '');
        files.push({
          name: name,
          selected: (function() {
            switch (type[type.length - 1]) {
              case 'C':
              case 'M':
              case 'R':
              case 'D':
              case 'A':
                return true;
              default:
                return false;
            }
          })(),
          type: (function() {
            switch (type[type.length - 1]) {
              case 'A':
                return 'added';
              case 'C':
                return 'modified';
              case 'D':
                return 'deleted';
              case 'M':
                return 'modified';
              case 'R':
                return 'modified';
              case 'U':
                return 'conflict';
              case '?':
                return 'new';
              default:
                return 'unknown';
            }
          })()
        });
      }
      return files;
    });
  };

  parseDefault = function(data) {
    return q.fcall(function() {
      return true;
    });
  };

  callGit = function(cmd, parser, nodatalog) {
    logcb("> git " + cmd);
    return git(cmd, {
      cwd: cwd
    }).then(function(data) {
      if (!nodatalog) {
        logcb(data);
      }
      return parser(data);
    }).fail(function(e) {
      logcb(e.stdout, true);
      logcb(e.message, true);
    });
  };

  module.exports = {
    isInitialised: function() {
      return cwd;
    },
    alert: function(text) {
      logcb(text);
    },
    setLogger: function(cb) {
      logcb = cb;
    },
    setProjectIndex: setProjectIndex,
    getProjectIndex: function() {
      return projectIndex;
    },
    getRepository: function() {
      return repo;
    },
    count: function(branch) {
      return repo.getAheadBehindCount(branch);
    },
    getLocalBranch: function() {
      return repo.getShortHead();
    },
    getRemoteBranch: function() {
      return repo.getUpstreamBranch();
    },
    isMerging: function() {
      return fs.existsSync(path.join(repo.path, 'MERGE_HEAD'));
    },
    getBranches: getBranches,
    hasRemotes: function() {
      var refs;
      refs = repo.getReferences();
      return refs && refs.remotes && refs.remotes.length;
    },
    hasOrigin: function() {
      return repo.getOriginURL() !== null;
    },
    add: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("add -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    commit: function(message) {
      message = message || Date.now();
      message = message.replace(/"/g, '\\"');
      return callGit("commit --allow-empty-message -m \"" + message + "\"", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    checkout: function(branch, remote) {
      return callGit("checkout " + (remote ? '--track ' : '') + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    createBranch: function(branch) {
      return callGit("branch " + branch, function(data) {
        return callGit("checkout " + branch, function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      });
    },
    deleteBranch: function(branch) {
      return callGit("branch -d " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    forceDeleteBranch: function(branch) {
      return callGit("branch -D " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    diff: function(file) {
      return callGit("--no-pager diff " + (file || ''), parseDiff, true);
    },
    fetch: function() {
      return callGit("fetch --prune", parseDefault);
    },
    merge: function(branch, noff) {
      var noffOutput;
      noffOutput = noff ? "--no-ff" : "";
      return callGit("merge " + noffOutput + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    ptag: function(remote) {
      return callGit("push " + remote + " --tags", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pullup: function() {
      return callGit("pull upstream $(git branch | grep '^\*' | sed -n 's/\*[ ]*//p')", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pull: function() {
      return callGit("pull", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    flow: function(type, action, branch) {
      return callGit("flow " + type + " " + action + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    push: function(remote, branch, force) {
      var cmd, forced;
      forced = force ? "-f" : "";
      cmd = "-c push.default=simple push " + remote + " " + branch + " " + forced + " --porcelain";
      return callGit(cmd, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    log: function(branch) {
      return callGit("log origin/" + (repo.getUpstreamBranch() || 'master') + ".." + branch, parseDefault);
    },
    rebase: function(branch) {
      return callGit("rebase " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    midrebase: function(contin, abort, skip) {
      if (contin) {
        return callGit("rebase --continue", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (abort) {
        return callGit("rebase --abort", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (skip) {
        return callGit("rebase --skip", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      }
    },
    reset: function(files) {
      return callGit("checkout -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    remove: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("rm -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(true);
      });
    },
    status: function() {
      return callGit('status --porcelain --untracked-files=all', parseStatus);
    },
    tag: function(name, href, msg) {
      return callGit("tag -a " + name + " -m '" + msg + "' " + href, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxHQUFBLEdBQU0sT0FBQSxDQUFRLGFBQVI7O0VBQ04sQ0FBQSxHQUFJLE9BQUEsQ0FBUSxHQUFSOztFQUVKLEtBQUEsR0FBUSxTQUFDLEdBQUQsRUFBTSxLQUFOO1dBQ04sT0FBUSxDQUFHLEtBQUgsR0FBYyxPQUFkLEdBQTJCLEtBQTNCLENBQVIsQ0FBMEMsR0FBMUM7RUFETTs7RUFHUixJQUFBLEdBQU87O0VBQ1AsR0FBQSxHQUFNOztFQUNOLFlBQUEsR0FBZTs7RUFFZixJQUFBLEdBQU8sU0FBQTtXQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBQTthQUFHO0lBQUgsQ0FBUjtFQUFIOztFQUVQLFdBQUEsR0FBYyxTQUFBO0lBQ1osSUFBSSxDQUFDLGFBQUwsQ0FBQTtFQURZOztFQUlkLFdBQUEsR0FBYyxTQUFBO1dBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFBO0FBQ3ZCLFVBQUE7TUFBQSxRQUFBLEdBQVc7UUFBQSxLQUFBLEVBQU8sRUFBUDtRQUFXLE1BQUEsRUFBUSxFQUFuQjtRQUF1QixJQUFBLEVBQU0sRUFBN0I7O01BQ1gsSUFBQSxHQUFPLElBQUksQ0FBQyxhQUFMLENBQUE7QUFFUDtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFmLENBQW9CLENBQUMsQ0FBQyxPQUFGLENBQVUsYUFBVixFQUF5QixFQUF6QixDQUFwQjtBQURGO0FBR0E7QUFBQSxXQUFBLHdDQUFBOztRQUNFLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxl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b3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmdpdCA9IHJlcXVpcmUgJ2dpdC1wcm9taXNlJ1xucSA9IHJlcXVpcmUgJ3EnXG5cbmxvZ2NiID0gKGxvZywgZXJyb3IpIC0+XG4gIGNvbnNvbGVbaWYgZXJyb3IgdGhlbiAnZXJyb3InIGVsc2UgJ2xvZyddIGxvZ1xuXG5yZXBvID0gdW5kZWZpbmVkXG5jd2QgPSB1bmRlZmluZWRcbnByb2plY3RJbmRleCA9IDBcblxubm9vcCA9IC0+IHEuZmNhbGwgLT4gdHJ1ZVxuXG5hdG9tUmVmcmVzaCA9IC0+XG4gIHJlcG8ucmVmcmVzaFN0YXR1cygpICMgbm90IHB1YmxpYy9pbiBkb2NzXG4gIHJldHVyblxuXG5nZXRCcmFuY2hlcyA9IC0+IHEuZmNhbGwgLT5cbiAgYnJhbmNoZXMgPSBsb2NhbDogW10sIHJlbW90ZTogW10sIHRhZ3M6IFtdXG4gIHJlZnMgPSByZXBvLmdldFJlZmVyZW5jZXMoKVxuXG4gIGZvciBoIGluIHJlZnMuaGVhZHNcbiAgICBicmFuY2hlcy5sb2NhbC5wdXNoIGgucmVwbGFjZSgncmVmcy9oZWFkcy8nLCAnJylcblxuICBmb3IgaCBpbiByZWZzLnJlbW90ZXNcbiAgICBicmFuY2hlcy5yZW1vdGUucHVzaCBoLnJlcGxhY2UoJ3JlZnMvcmVtb3Rlcy8nLCAnJylcblxuICByZXR1cm4gYnJhbmNoZXNcblxuc2V0UHJvamVjdEluZGV4ID0gKGluZGV4KSAtPlxuICByZXBvID0gdW5kZWZpbmVkXG4gIGN3ZCA9IHVuZGVmaW5lZFxuICBwcm9qZWN0SW5kZXggPSBpbmRleFxuICBpZiBhdG9tLnByb2plY3RcbiAgICByZXBvID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW2luZGV4XVxuICAgIGN3ZCA9IGlmIHJlcG8gdGhlbiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSAjcHJldmVudCBzdGFydHVwIGVycm9ycyBpZiByZXBvIGlzIHVuZGVmaW5lZFxuICByZXR1cm5cbnNldFByb2plY3RJbmRleChwcm9qZWN0SW5kZXgpXG5cbnBhcnNlRGlmZiA9IChkYXRhKSAtPiBxLmZjYWxsIC0+XG4gIGRpZmZzID0gW11cbiAgZGlmZiA9IHt9XG4gIGZvciBsaW5lIGluIGRhdGEuc3BsaXQoJ1xcbicpIHdoZW4gbGluZS5sZW5ndGhcbiAgICBzd2l0Y2hcbiAgICAgIHdoZW4gL15kaWZmIC0tZ2l0IC8udGVzdChsaW5lKVxuICAgICAgICBkaWZmID1cbiAgICAgICAgICBsaW5lczogW11cbiAgICAgICAgICBhZGRlZDogMFxuICAgICAgICAgIHJlbW92ZWQ6IDBcbiAgICAgICAgZGlmZlsnZGlmZiddID0gbGluZS5yZXBsYWNlKC9eZGlmZiAtLWdpdCAvLCAnJylcbiAgICAgICAgZGlmZnMucHVzaCBkaWZmXG4gICAgICB3aGVuIC9eaW5kZXggLy50ZXN0KGxpbmUpXG4gICAgICAgIGRpZmZbJ2luZGV4J10gPSBsaW5lLnJlcGxhY2UoL15pbmRleCAvLCAnJylcbiAgICAgIHdoZW4gL14tLS0gLy50ZXN0KGxpbmUpXG4gICAgICAgIGRpZmZbJy0tLSddID0gbGluZS5yZXBsYWNlKC9eLS0tIFthfGJdXFwvLywgJycpXG4gICAgICB3aGVuIC9eXFwrXFwrXFwrIC8udGVzdChsaW5lKVxuICAgICAgICBkaWZmWycrKysnXSA9IGxpbmUucmVwbGFjZSgvXlxcK1xcK1xcKyBbYXxiXVxcLy8sICcnKVxuICAgICAgZWxzZVxuICAgICAgICBkaWZmWydsaW5lcyddLnB1c2ggbGluZVxuICAgICAgICBkaWZmWydhZGRlZCddKysgaWYgL15cXCsvLnRlc3QobGluZSlcbiAgICAgICAgZGlmZlsncmVtb3ZlZCddKysgaWYgL14tLy50ZXN0KGxpbmUpXG5cbiAgcmV0dXJuIGRpZmZzXG5cbnBhcnNlU3RhdHVzID0gKGRhdGEpIC0+IHEuZmNhbGwgLT5cbiAgZmlsZXMgPSBbXVxuICBmb3IgbGluZSBpbiBkYXRhLnNwbGl0KCdcXG4nKSB3aGVuIGxpbmUubGVuZ3RoXG4gICAgIyBbdHlwZSwgbmFtZV0gPSBsaW5lLnJlcGxhY2UoL1xcIFxcIC9nLCAnICcpLnRyaW0oKS5zcGxpdCgnICcpXG4gICAgdHlwZSA9IGxpbmUuc3Vic3RyaW5nKDAsIDIpXG4gICAgbmFtZSA9IGxpbmUuc3Vic3RyaW5nKDIpLnRyaW0oKS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXCInLCAnZycpLCAnJylcbiAgICBmaWxlcy5wdXNoXG4gICAgICBuYW1lOiBuYW1lXG4gICAgICBzZWxlY3RlZDogc3dpdGNoIHR5cGVbdHlwZS5sZW5ndGggLSAxXVxuICAgICAgICB3aGVuICdDJywnTScsJ1InLCdEJywnQScgdGhlbiB0cnVlXG4gICAgICAgIGVsc2UgZmFsc2VcbiAgICAgIHR5cGU6IHN3aXRjaCB0eXBlW3R5cGUubGVuZ3RoIC0gMV1cbiAgICAgICAgd2hlbiAnQScgdGhlbiAnYWRkZWQnXG4gICAgICAgIHdoZW4gJ0MnIHRoZW4gJ21vZGlmaWVkJyAjJ2NvcGllZCdcbiAgICAgICAgd2hlbiAnRCcgdGhlbiAnZGVsZXRlZCdcbiAgICAgICAgd2hlbiAnTScgdGhlbiAnbW9kaWZpZWQnXG4gICAgICAgIHdoZW4gJ1InIHRoZW4gJ21vZGlmaWVkJyAjJ3JlbmFtZWQnXG4gICAgICAgIHdoZW4gJ1UnIHRoZW4gJ2NvbmZsaWN0J1xuICAgICAgICB3aGVuICc/JyB0aGVuICduZXcnXG4gICAgICAgIGVsc2UgJ3Vua25vd24nXG5cbiAgcmV0dXJuIGZpbGVzXG5cbnBhcnNlRGVmYXVsdCA9IChkYXRhKSAtPiBxLmZjYWxsIC0+XG4gIHJldHVybiB0cnVlXG5cbmNhbGxHaXQgPSAoY21kLCBwYXJzZXIsIG5vZGF0YWxvZykgLT5cbiAgbG9nY2IgXCI+IGdpdCAje2NtZH1cIlxuXG4gIHJldHVybiBnaXQoY21kLCB7Y3dkOiBjd2R9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgbG9nY2IgZGF0YSB1bmxlc3Mgbm9kYXRhbG9nXG4gICAgICByZXR1cm4gcGFyc2VyKGRhdGEpXG4gICAgLmZhaWwgKGUpIC0+XG4gICAgICBsb2djYiBlLnN0ZG91dCwgdHJ1ZVxuICAgICAgbG9nY2IgZS5tZXNzYWdlLCB0cnVlXG4gICAgICByZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBpc0luaXRpYWxpc2VkOiAtPlxuICAgIHJldHVybiBjd2RcblxuICBhbGVydDogKHRleHQpIC0+ICNtYWtpbmcgdGhlIGNvbnNvbGUgYXZhaWxhYmxlIGVsc2V3aGVyZVxuICAgIGxvZ2NiIHRleHRcbiAgICByZXR1cm5cblxuICBzZXRMb2dnZXI6IChjYikgLT5cbiAgICBsb2djYiA9IGNiXG4gICAgcmV0dXJuXG5cbiAgc2V0UHJvamVjdEluZGV4OiBzZXRQcm9qZWN0SW5kZXhcblxuICBnZXRQcm9qZWN0SW5kZXg6IC0+XG4gICAgcmV0dXJuIHByb2plY3RJbmRleFxuXG4gIGdldFJlcG9zaXRvcnk6IC0+XG4gICAgcmV0dXJuIHJlcG9cblxuICBjb3VudDogKGJyYW5jaCkgLT5cbiAgICByZXR1cm4gcmVwby5nZXRBaGVhZEJlaGluZENvdW50KGJyYW5jaClcblxuICBnZXRMb2NhbEJyYW5jaDogLT5cbiAgICByZXR1cm4gcmVwby5nZXRTaG9ydEhlYWQoKVxuXG4gIGdldFJlbW90ZUJyYW5jaDogLT5cbiAgICByZXR1cm4gcmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpXG5cbiAgaXNNZXJnaW5nOiAtPlxuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKHBhdGguam9pbihyZXBvLnBhdGgsICdNRVJHRV9IRUFEJykpXG5cbiAgZ2V0QnJhbmNoZXM6IGdldEJyYW5jaGVzXG5cbiAgaGFzUmVtb3RlczogLT5cbiAgICByZWZzID0gcmVwby5nZXRSZWZlcmVuY2VzKClcbiAgICByZXR1cm4gcmVmcyBhbmQgcmVmcy5yZW1vdGVzIGFuZCByZWZzLnJlbW90ZXMubGVuZ3RoXG5cbiAgaGFzT3JpZ2luOiAtPlxuICAgIHJldHVybiByZXBvLmdldE9yaWdpblVSTCgpIGlzbnQgbnVsbFxuXG4gIGFkZDogKGZpbGVzKSAtPlxuICAgIHJldHVybiBub29wKCkgdW5sZXNzIGZpbGVzLmxlbmd0aFxuICAgIHJldHVybiBjYWxsR2l0IFwiYWRkIC0tICN7ZmlsZXMuam9pbignICcpfVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBjb21taXQ6IChtZXNzYWdlKSAtPlxuICAgIG1lc3NhZ2UgPSBtZXNzYWdlIG9yIERhdGUubm93KClcbiAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcblxuICAgIHJldHVybiBjYWxsR2l0IFwiY29tbWl0IC0tYWxsb3ctZW1wdHktbWVzc2FnZSAtbSBcXFwiI3ttZXNzYWdlfVxcXCJcIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgY2hlY2tvdXQ6IChicmFuY2gsIHJlbW90ZSkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImNoZWNrb3V0ICN7aWYgcmVtb3RlIHRoZW4gJy0tdHJhY2sgJyBlbHNlICcnfSN7YnJhbmNofVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBjcmVhdGVCcmFuY2g6IChicmFuY2gpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJicmFuY2ggI3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgcmV0dXJuIGNhbGxHaXQgXCJjaGVja291dCAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIGRlbGV0ZUJyYW5jaDogKGJyYW5jaCkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImJyYW5jaCAtZCAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0XG5cbiAgZm9yY2VEZWxldGVCcmFuY2g6IChicmFuY2gpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJicmFuY2ggLUQgI3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdFxuXG4gIGRpZmY6IChmaWxlKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwiLS1uby1wYWdlciBkaWZmICN7ZmlsZSBvciAnJ31cIiwgcGFyc2VEaWZmLCB0cnVlXG5cbiAgZmV0Y2g6IC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJmZXRjaCAtLXBydW5lXCIsIHBhcnNlRGVmYXVsdFxuXG4gIG1lcmdlOiAoYnJhbmNoLG5vZmYpIC0+XG4gICAgbm9mZk91dHB1dCA9IGlmIG5vZmYgdGhlbiBcIi0tbm8tZmZcIiBlbHNlIFwiXCJcbiAgICByZXR1cm4gY2FsbEdpdCBcIm1lcmdlICN7bm9mZk91dHB1dH0gI3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIHB0YWc6IChyZW1vdGUpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJwdXNoICN7cmVtb3RlfSAtLXRhZ3NcIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcHVsbHVwOiAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwicHVsbCB1cHN0cmVhbSAkKGdpdCBicmFuY2ggfCBncmVwICdeXFwqJyB8IHNlZCAtbiAncy9cXCpbIF0qLy9wJylcIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcHVsbDogLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcInB1bGxcIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgZmxvdzogKHR5cGUsYWN0aW9uLGJyYW5jaCkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImZsb3cgI3t0eXBlfSAje2FjdGlvbn0gI3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIHB1c2g6IChyZW1vdGUsYnJhbmNoLGZvcmNlKS0+XG4gICAgZm9yY2VkID0gaWYgZm9yY2UgdGhlbiBcIi1mXCIgZWxzZSBcIlwiXG4gICAgY21kID0gXCItYyBwdXNoLmRlZmF1bHQ9c2ltcGxlIHB1c2ggI3tyZW1vdGV9ICN7YnJhbmNofSAje2ZvcmNlZH0gLS1wb3JjZWxhaW5cIlxuICAgIHJldHVybiBjYWxsR2l0IGNtZCwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgbG9nOiAoYnJhbmNoKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwibG9nIG9yaWdpbi8je3JlcG8uZ2V0VXBzdHJlYW1CcmFuY2goKSBvciAnbWFzdGVyJ30uLiN7YnJhbmNofVwiLCBwYXJzZURlZmF1bHRcblxuICByZWJhc2U6IChicmFuY2gpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJyZWJhc2UgI3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIG1pZHJlYmFzZTogKGNvbnRpbixhYm9ydCxza2lwKSAtPlxuICAgIGlmIGNvbnRpblxuICAgICAgcmV0dXJuIGNhbGxHaXQgXCJyZWJhc2UgLS1jb250aW51ZVwiLCAoZGF0YSkgLT5cbiAgICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG4gICAgZWxzZSBpZiBhYm9ydFxuICAgICAgcmV0dXJuIGNhbGxHaXQgXCJyZWJhc2UgLS1hYm9ydFwiLCAoZGF0YSkgLT5cbiAgICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG4gICAgZWxzZSBpZiBza2lwXG4gICAgICByZXR1cm4gY2FsbEdpdCBcInJlYmFzZSAtLXNraXBcIiwgKGRhdGEpIC0+XG4gICAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIHJlc2V0OiAoZmlsZXMpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJjaGVja291dCAtLSAje2ZpbGVzLmpvaW4oJyAnKX1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcmVtb3ZlOiAoZmlsZXMpIC0+XG4gICAgcmV0dXJuIG5vb3AoKSB1bmxlc3MgZmlsZXMubGVuZ3RoXG4gICAgcmV0dXJuIGNhbGxHaXQgXCJybSAtLSAje2ZpbGVzLmpvaW4oJyAnKX1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KHRydWUpXG5cbiAgc3RhdHVzOiAtPlxuICAgIHJldHVybiBjYWxsR2l0ICdzdGF0dXMgLS1wb3JjZWxhaW4gLS11bnRyYWNrZWQtZmlsZXM9YWxsJywgcGFyc2VTdGF0dXNcblxuICB0YWc6IChuYW1lLGhyZWYsbXNnKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwidGFnIC1hICN7bmFtZX0gLW0gJyN7bXNnfScgI3tocmVmfVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcbiJdfQ==
