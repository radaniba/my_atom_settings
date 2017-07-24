(function() {
  var BufferedProcess, DESCRIPTION, ForkGistIdInputView, GitHubApi, PackageManager, REMOVE_KEYS, SyncSettings, _, fs, ref,
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  _ = require('underscore-plus');

  ref = [], GitHubApi = ref[0], PackageManager = ref[1];

  ForkGistIdInputView = null;

  DESCRIPTION = 'Atom configuration storage operated by http://atom.io/packages/sync-settings';

  REMOVE_KEYS = ['sync-settings.gistId', 'sync-settings.personalAccessToken', 'sync-settings._analyticsUserId', 'sync-settings._lastBackupHash'];

  SyncSettings = {
    config: require('./config.coffee'),
    activate: function() {
      return setImmediate((function(_this) {
        return function() {
          var mandatorySettingsApplied;
          if (GitHubApi == null) {
            GitHubApi = require('github');
          }
          if (PackageManager == null) {
            PackageManager = require('./package-manager');
          }
          atom.commands.add('atom-workspace', "sync-settings:backup", function() {
            return _this.backup();
          });
          atom.commands.add('atom-workspace', "sync-settings:restore", function() {
            return _this.restore();
          });
          atom.commands.add('atom-workspace', "sync-settings:view-backup", function() {
            return _this.viewBackup();
          });
          atom.commands.add('atom-workspace', "sync-settings:check-backup", function() {
            return _this.checkForUpdate();
          });
          atom.commands.add('atom-workspace', "sync-settings:fork", function() {
            return _this.inputForkGistId();
          });
          mandatorySettingsApplied = _this.checkMandatorySettings();
          if (atom.config.get('sync-settings.checkForUpdatedBackup') && mandatorySettingsApplied) {
            return _this.checkForUpdate();
          }
        };
      })(this));
    },
    deactivate: function() {
      var ref1;
      return (ref1 = this.inputView) != null ? ref1.destroy() : void 0;
    },
    serialize: function() {},
    getGistId: function() {
      var gistId;
      gistId = atom.config.get('sync-settings.gistId');
      if (gistId) {
        gistId = gistId.trim();
      }
      return gistId;
    },
    getPersonalAccessToken: function() {
      var token;
      token = atom.config.get('sync-settings.personalAccessToken');
      if (token) {
        token = token.trim();
      }
      return token;
    },
    checkMandatorySettings: function() {
      var missingSettings;
      missingSettings = [];
      if (!this.getGistId()) {
        missingSettings.push("Gist ID");
      }
      if (!this.getPersonalAccessToken()) {
        missingSettings.push("GitHub personal access token");
      }
      if (missingSettings.length) {
        this.notifyMissingMandatorySettings(missingSettings);
      }
      return missingSettings.length === 0;
    },
    checkForUpdate: function(cb) {
      if (cb == null) {
        cb = null;
      }
      if (this.getGistId()) {
        console.debug('checking latest backup...');
        return this.createClient().gists.get({
          id: this.getGistId()
        }, (function(_this) {
          return function(err, res) {
            var SyntaxError, message, ref1, ref2;
            if (err) {
              console.error("error while retrieving the gist. does it exists?", err);
              try {
                message = JSON.parse(err.message).message;
                if (message === 'Not Found') {
                  message = 'Gist ID Not Found';
                }
              } catch (error1) {
                SyntaxError = error1;
                message = err.message;
              }
              atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
              return typeof cb === "function" ? cb() : void 0;
            }
            if ((res != null ? (ref1 = res.history) != null ? (ref2 = ref1[0]) != null ? ref2.version : void 0 : void 0 : void 0) == null) {
              console.error("could not interpret result:", res);
              atom.notifications.addError("sync-settings: Error retrieving your settings.");
              return typeof cb === "function" ? cb() : void 0;
            }
            console.debug("latest backup version " + res.history[0].version);
            if (res.history[0].version !== atom.config.get('sync-settings._lastBackupHash')) {
              _this.notifyNewerBackup();
            } else if (!atom.config.get('sync-settings.quietUpdateCheck')) {
              _this.notifyBackupUptodate();
            }
            return typeof cb === "function" ? cb() : void 0;
          };
        })(this));
      } else {
        return this.notifyMissingMandatorySettings(["Gist ID"]);
      }
    },
    notifyNewerBackup: function() {
      var notification, workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return notification = atom.notifications.addWarning("sync-settings: Your settings are out of date.", {
        dismissable: true,
        buttons: [
          {
            text: "Backup",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:backup");
              return notification.dismiss();
            }
          }, {
            text: "View backup",
            onDidClick: function() {
              return atom.commands.dispatch(workspaceElement, "sync-settings:view-backup");
            }
          }, {
            text: "Restore",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:restore");
              return notification.dismiss();
            }
          }, {
            text: "Dismiss",
            onDidClick: function() {
              return notification.dismiss();
            }
          }
        ]
      });
    },
    notifyBackupUptodate: function() {
      return atom.notifications.addSuccess("sync-settings: Latest backup is already applied.");
    },
    notifyMissingMandatorySettings: function(missingSettings) {
      var context, errorMsg, notification;
      context = this;
      errorMsg = "sync-settings: Mandatory settings missing: " + missingSettings.join(', ');
      return notification = atom.notifications.addError(errorMsg, {
        dismissable: true,
        buttons: [
          {
            text: "Package settings",
            onDidClick: function() {
              context.goToPackageSettings();
              return notification.dismiss();
            }
          }
        ]
      });
    },
    backup: function(cb) {
      var cmtend, cmtstart, ext, file, files, j, len, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
      if (cb == null) {
        cb = null;
      }
      files = {};
      if (atom.config.get('sync-settings.syncSettings')) {
        files["settings.json"] = {
          content: this.getFilteredSettings()
        };
      }
      if (atom.config.get('sync-settings.syncPackages')) {
        files["packages.json"] = {
          content: JSON.stringify(this.getPackages(), null, '\t')
        };
      }
      if (atom.config.get('sync-settings.syncKeymap')) {
        files["keymap.cson"] = {
          content: (ref1 = this.fileContent(atom.keymaps.getUserKeymapPath())) != null ? ref1 : "# keymap file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncStyles')) {
        files["styles.less"] = {
          content: (ref2 = this.fileContent(atom.styles.getUserStyleSheetPath())) != null ? ref2 : "// styles file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncInit')) {
        files["init.coffee"] = {
          content: (ref3 = this.fileContent(atom.config.configDirPath + "/init.coffee")) != null ? ref3 : "# initialization file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncSnippets')) {
        files["snippets.cson"] = {
          content: (ref4 = this.fileContent(atom.config.configDirPath + "/snippets.cson")) != null ? ref4 : "# snippets file (not found)"
        };
      }
      ref6 = (ref5 = atom.config.get('sync-settings.extraFiles')) != null ? ref5 : [];
      for (j = 0, len = ref6.length; j < len; j++) {
        file = ref6[j];
        ext = file.slice(file.lastIndexOf(".")).toLowerCase();
        cmtstart = "#";
        if (ext === ".less" || ext === ".scss" || ext === ".js") {
          cmtstart = "//";
        }
        if (ext === ".css") {
          cmtstart = "/*";
        }
        cmtend = "";
        if (ext === ".css") {
          cmtend = "*/";
        }
        files[file] = {
          content: (ref7 = this.fileContent(atom.config.configDirPath + ("/" + file))) != null ? ref7 : cmtstart + " " + file + " (not found) " + cmtend
        };
      }
      return this.createClient().gists.edit({
        id: this.getGistId(),
        description: atom.config.get('sync-settings.gistDescription'),
        files: files
      }, function(err, res) {
        var SyntaxError, message;
        if (err) {
          console.error("error backing up data: " + err.message, err);
          try {
            message = JSON.parse(err.message).message;
            if (message === 'Not Found') {
              message = 'Gist ID Not Found';
            }
          } catch (error1) {
            SyntaxError = error1;
            message = err.message;
          }
          atom.notifications.addError("sync-settings: Error backing up your settings. (" + message + ")");
        } else {
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully backed up. <br/><a href='" + res.html_url + "'>Click here to open your Gist.</a>");
        }
        return typeof cb === "function" ? cb(err, res) : void 0;
      });
    },
    viewBackup: function() {
      var Shell, gistId;
      Shell = require('shell');
      gistId = this.getGistId();
      return Shell.openExternal("https://gist.github.com/" + gistId);
    },
    getPackages: function() {
      var apmInstallSource, i, metadata, name, packages, ref1, theme, version;
      packages = [];
      ref1 = this._getAvailablePackageMetadataWithoutDuplicates();
      for (i in ref1) {
        metadata = ref1[i];
        name = metadata.name, version = metadata.version, theme = metadata.theme, apmInstallSource = metadata.apmInstallSource;
        packages.push({
          name: name,
          version: version,
          theme: theme,
          apmInstallSource: apmInstallSource
        });
      }
      return _.sortBy(packages, 'name');
    },
    _getAvailablePackageMetadataWithoutDuplicates: function() {
      var i, j, len, package_metadata, packages, path, path2metadata, pkg_name, pkg_path, ref1, ref2;
      path2metadata = {};
      package_metadata = atom.packages.getAvailablePackageMetadata();
      ref1 = atom.packages.getAvailablePackagePaths();
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        path = ref1[i];
        path2metadata[fs.realpathSync(path)] = package_metadata[i];
      }
      packages = [];
      ref2 = atom.packages.getAvailablePackageNames();
      for (i in ref2) {
        pkg_name = ref2[i];
        pkg_path = atom.packages.resolvePackagePath(pkg_name);
        if (path2metadata[pkg_path]) {
          packages.push(path2metadata[pkg_path]);
        } else {
          console.error('could not correlate package name, path, and metadata');
        }
      }
      return packages;
    },
    restore: function(cb) {
      if (cb == null) {
        cb = null;
      }
      return this.createClient().gists.get({
        id: this.getGistId()
      }, (function(_this) {
        return function(err, res) {
          var SyntaxError, callbackAsync, file, filename, message, ref1;
          if (err) {
            console.error("error while retrieving the gist. does it exists?", err);
            try {
              message = JSON.parse(err.message).message;
              if (message === 'Not Found') {
                message = 'Gist ID Not Found';
              }
            } catch (error1) {
              SyntaxError = error1;
              message = err.message;
            }
            atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
            return;
          }
          callbackAsync = false;
          ref1 = res.files;
          for (filename in ref1) {
            if (!hasProp.call(ref1, filename)) continue;
            file = ref1[filename];
            switch (filename) {
              case 'settings.json':
                if (atom.config.get('sync-settings.syncSettings')) {
                  _this.applySettings('', JSON.parse(file.content));
                }
                break;
              case 'packages.json':
                if (atom.config.get('sync-settings.syncPackages')) {
                  callbackAsync = true;
                  _this.installMissingPackages(JSON.parse(file.content), cb);
                }
                break;
              case 'keymap.cson':
                if (atom.config.get('sync-settings.syncKeymap')) {
                  fs.writeFileSync(atom.keymaps.getUserKeymapPath(), file.content);
                }
                break;
              case 'styles.less':
                if (atom.config.get('sync-settings.syncStyles')) {
                  fs.writeFileSync(atom.styles.getUserStyleSheetPath(), file.content);
                }
                break;
              case 'init.coffee':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.coffee", file.content);
                }
                break;
              case 'snippets.cson':
                if (atom.config.get('sync-settings.syncSnippets')) {
                  fs.writeFileSync(atom.config.configDirPath + "/snippets.cson", file.content);
                }
                break;
              default:
                fs.writeFileSync(atom.config.configDirPath + "/" + filename, file.content);
            }
          }
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully synchronized.");
          if (!callbackAsync) {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this));
    },
    createClient: function() {
      var github, token;
      token = this.getPersonalAccessToken();
      console.debug("Creating GitHubApi client with token = " + token);
      github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https'
      });
      github.authenticate({
        type: 'oauth',
        token: token
      });
      return github;
    },
    getFilteredSettings: function() {
      var blacklistedKey, blacklistedKeys, j, len, ref1, settings;
      settings = JSON.parse(JSON.stringify(atom.config.settings));
      blacklistedKeys = REMOVE_KEYS.concat((ref1 = atom.config.get('sync-settings.blacklistedKeys')) != null ? ref1 : []);
      for (j = 0, len = blacklistedKeys.length; j < len; j++) {
        blacklistedKey = blacklistedKeys[j];
        blacklistedKey = blacklistedKey.split(".");
        this._removeProperty(settings, blacklistedKey);
      }
      return JSON.stringify(settings, null, '\t');
    },
    _removeProperty: function(obj, key) {
      var currentKey, lastKey;
      lastKey = key.length === 1;
      currentKey = key.shift();
      if (!lastKey && _.isObject(obj[currentKey]) && !_.isArray(obj[currentKey])) {
        return this._removeProperty(obj[currentKey], key);
      } else {
        return delete obj[currentKey];
      }
    },
    goToPackageSettings: function() {
      return atom.workspace.open("atom://config/packages/sync-settings");
    },
    applySettings: function(pref, settings) {
      var colorKeys, isColor, key, keyPath, results, value, valueKeys;
      results = [];
      for (key in settings) {
        value = settings[key];
        keyPath = pref + "." + key;
        isColor = false;
        if (_.isObject(value)) {
          valueKeys = Object.keys(value);
          colorKeys = ['alpha', 'blue', 'green', 'red'];
          isColor = _.isEqual(_.sortBy(valueKeys), colorKeys);
        }
        if (_.isObject(value) && !_.isArray(value) && !isColor) {
          results.push(this.applySettings(keyPath, value));
        } else {
          console.debug("config.set " + keyPath.slice(1) + "=" + value);
          results.push(atom.config.set(keyPath.slice(1), value));
        }
      }
      return results;
    },
    installMissingPackages: function(packages, cb) {
      var available_package, available_packages, concurrency, failed, i, installNextPackage, j, k, len, missing_packages, notifications, p, pkg, ref1, results, succeeded;
      available_packages = this.getPackages();
      missing_packages = [];
      for (j = 0, len = packages.length; j < len; j++) {
        pkg = packages[j];
        available_package = (function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = available_packages.length; k < len1; k++) {
            p = available_packages[k];
            if (p.name === pkg.name) {
              results.push(p);
            }
          }
          return results;
        })();
        if (available_package.length === 0) {
          missing_packages.push(pkg);
        } else if (!(!!pkg.apmInstallSource === !!available_package[0].apmInstallSource)) {
          missing_packages.push(pkg);
        }
      }
      if (missing_packages.length === 0) {
        atom.notifications.addInfo("Sync-settings: no packages to install");
        return typeof cb === "function" ? cb() : void 0;
      }
      notifications = {};
      succeeded = [];
      failed = [];
      installNextPackage = (function(_this) {
        return function() {
          var count, failedStr, i;
          if (missing_packages.length > 0) {
            pkg = missing_packages.shift();
            i = succeeded.length + failed.length + Object.keys(notifications).length + 1;
            count = i + missing_packages.length;
            notifications[pkg.name] = atom.notifications.addInfo("Sync-settings: installing " + pkg.name + " (" + i + "/" + count + ")", {
              dismissable: true
            });
            return (function(pkg) {
              return _this.installPackage(pkg, function(error) {
                notifications[pkg.name].dismiss();
                delete notifications[pkg.name];
                if (error != null) {
                  failed.push(pkg.name);
                  atom.notifications.addWarning("Sync-settings: failed to install " + pkg.name);
                } else {
                  succeeded.push(pkg.name);
                }
                return installNextPackage();
              });
            })(pkg);
          } else if (Object.keys(notifications).length === 0) {
            if (failed.length === 0) {
              atom.notifications.addSuccess("Sync-settings: finished installing " + succeeded.length + " packages");
            } else {
              failed.sort();
              failedStr = failed.join(', ');
              atom.notifications.addWarning("Sync-settings: finished installing packages (" + failed.length + " failed: " + failedStr + ")", {
                dismissable: true
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      concurrency = Math.min(missing_packages.length, 8);
      results = [];
      for (i = k = 0, ref1 = concurrency; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(installNextPackage());
      }
      return results;
    },
    installPackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Installing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.install(pack, function(error) {
        var ref1;
        if (error != null) {
          console.error("Installing " + type + " " + pack.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
        } else {
          console.info("Installed " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
    },
    fileContent: function(filePath) {
      var e;
      try {
        return fs.readFileSync(filePath, {
          encoding: 'utf8'
        }) || null;
      } catch (error1) {
        e = error1;
        console.error("Error reading file " + filePath + ". Probably doesn't exist.", e);
        return null;
      }
    },
    inputForkGistId: function() {
      if (ForkGistIdInputView == null) {
        ForkGistIdInputView = require('./fork-gistid-input-view');
      }
      this.inputView = new ForkGistIdInputView();
      return this.inputView.setCallbackInstance(this);
    },
    forkGistId: function(forkId) {
      return this.createClient().gists.fork({
        id: forkId
      }, (function(_this) {
        return function(err, res) {
          var SyntaxError, message;
          if (err) {
            try {
              message = JSON.parse(err.message).message;
              if (message === "Not Found") {
                message = "Gist ID Not Found";
              }
            } catch (error1) {
              SyntaxError = error1;
              message = err.message;
            }
            atom.notifications.addError("sync-settings: Error forking settings. (" + message + ")");
            return typeof cb === "function" ? cb() : void 0;
          }
          if (res.id) {
            atom.config.set("sync-settings.gistId", res.id);
            atom.notifications.addSuccess("sync-settings: Forked successfully to the new Gist ID " + res.id + " which has been saved to your config.");
          } else {
            atom.notifications.addError("sync-settings: Error forking settings");
          }
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    }
  };

  module.exports = SyncSettings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9zeW5jLXNldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUEsbUhBQUE7SUFBQTs7RUFBQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3BCLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQThCLEVBQTlCLEVBQUMsa0JBQUQsRUFBWTs7RUFDWixtQkFBQSxHQUFzQjs7RUFHdEIsV0FBQSxHQUFjOztFQUNkLFdBQUEsR0FBYyxDQUNaLHNCQURZLEVBRVosbUNBRlksRUFHWixnQ0FIWSxFQUlaLCtCQUpZOztFQU9kLFlBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FBUjtJQUVBLFFBQUEsRUFBVSxTQUFBO2FBRVIsWUFBQSxDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUVYLGNBQUE7O1lBQUEsWUFBYSxPQUFBLENBQVEsUUFBUjs7O1lBQ2IsaUJBQWtCLE9BQUEsQ0FBUSxtQkFBUjs7VUFFbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxzQkFBcEMsRUFBNEQsU0FBQTttQkFDMUQsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUQwRCxDQUE1RDtVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsdUJBQXBDLEVBQTZELFNBQUE7bUJBQzNELEtBQUMsQ0FBQSxPQUFELENBQUE7VUFEMkQsQ0FBN0Q7VUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLDJCQUFwQyxFQUFpRSxTQUFBO21CQUMvRCxLQUFDLENBQUEsVUFBRCxDQUFBO1VBRCtELENBQWpFO1VBRUEsSUFBSSxDQUFD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Q0FBQSxJQUFBLENBRkY7SUFEVSxDQXZXWjs7O0VBNFhGLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBNVlqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgaW1wb3J0c1xue0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5bR2l0SHViQXBpLCBQYWNrYWdlTWFuYWdlcl0gPSBbXVxuRm9ya0dpc3RJZElucHV0VmlldyA9IG51bGxcblxuIyBjb25zdGFudHNcbkRFU0NSSVBUSU9OID0gJ0F0b20gY29uZmlndXJhdGlvbiBzdG9yYWdlIG9wZXJhdGVkIGJ5IGh0dHA6Ly9hdG9tLmlvL3BhY2thZ2VzL3N5bmMtc2V0dGluZ3MnXG5SRU1PVkVfS0VZUyA9IFtcbiAgJ3N5bmMtc2V0dGluZ3MuZ2lzdElkJyxcbiAgJ3N5bmMtc2V0dGluZ3MucGVyc29uYWxBY2Nlc3NUb2tlbicsXG4gICdzeW5jLXNldHRpbmdzLl9hbmFseXRpY3NVc2VySWQnLCAgIyBrZWVwIGxlZ2FjeSBrZXkgaW4gYmxhY2tsaXN0XG4gICdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcsXG5dXG5cblN5bmNTZXR0aW5ncyA9XG4gIGNvbmZpZzogcmVxdWlyZSgnLi9jb25maWcuY29mZmVlJylcblxuICBhY3RpdmF0ZTogLT5cbiAgICAjIHNwZWVkdXAgYWN0aXZhdGlvbiBieSBhc3luYyBpbml0aWFsaXppbmdcbiAgICBzZXRJbW1lZGlhdGUgPT5cbiAgICAgICMgYWN0dWFsIGluaXRpYWxpemF0aW9uIGFmdGVyIGF0b20gaGFzIGxvYWRlZFxuICAgICAgR2l0SHViQXBpID89IHJlcXVpcmUgJ2dpdGh1YidcbiAgICAgIFBhY2thZ2VNYW5hZ2VyID89IHJlcXVpcmUgJy4vcGFja2FnZS1tYW5hZ2VyJ1xuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6YmFja3VwXCIsID0+XG4gICAgICAgIEBiYWNrdXAoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOnJlc3RvcmVcIiwgPT5cbiAgICAgICAgQHJlc3RvcmUoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOnZpZXctYmFja3VwXCIsID0+XG4gICAgICAgIEB2aWV3QmFja3VwKClcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczpjaGVjay1iYWNrdXBcIiwgPT5cbiAgICAgICAgQGNoZWNrRm9yVXBkYXRlKClcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczpmb3JrXCIsID0+XG4gICAgICAgIEBpbnB1dEZvcmtHaXN0SWQoKVxuXG4gICAgICBtYW5kYXRvcnlTZXR0aW5nc0FwcGxpZWQgPSBAY2hlY2tNYW5kYXRvcnlTZXR0aW5ncygpXG4gICAgICBAY2hlY2tGb3JVcGRhdGUoKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuY2hlY2tGb3JVcGRhdGVkQmFja3VwJykgYW5kIG1hbmRhdG9yeVNldHRpbmdzQXBwbGllZFxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGlucHV0Vmlldz8uZGVzdHJveSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuXG4gIGdldEdpc3RJZDogLT5cbiAgICBnaXN0SWQgPSBhdG9tLmNvbmZpZy5nZXQgJ3N5bmMtc2V0dGluZ3MuZ2lzdElkJ1xuICAgIGlmIGdpc3RJZFxuICAgICAgZ2lzdElkID0gZ2lzdElkLnRyaW0oKVxuICAgIHJldHVybiBnaXN0SWRcblxuICBnZXRQZXJzb25hbEFjY2Vzc1Rva2VuOiAtPlxuICAgIHRva2VuID0gYXRvbS5jb25maWcuZ2V0ICdzeW5jLXNldHRpbmdzLnBlcnNvbmFsQWNjZXNzVG9rZW4nXG4gICAgaWYgdG9rZW5cbiAgICAgIHRva2VuID0gdG9rZW4udHJpbSgpXG4gICAgcmV0dXJuIHRva2VuXG5cbiAgY2hlY2tNYW5kYXRvcnlTZXR0aW5nczogLT5cbiAgICBtaXNzaW5nU2V0dGluZ3MgPSBbXVxuICAgIGlmIG5vdCBAZ2V0R2lzdElkKClcbiAgICAgIG1pc3NpbmdTZXR0aW5ncy5wdXNoKFwiR2lzdCBJRFwiKVxuICAgIGlmIG5vdCBAZ2V0UGVyc29uYWxBY2Nlc3NUb2tlbigpXG4gICAgICBtaXNzaW5nU2V0dGluZ3MucHVzaChcIkdpdEh1YiBwZXJzb25hbCBhY2Nlc3MgdG9rZW5cIilcbiAgICBpZiBtaXNzaW5nU2V0dGluZ3MubGVuZ3RoXG4gICAgICBAbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzKG1pc3NpbmdTZXR0aW5ncylcbiAgICByZXR1cm4gbWlzc2luZ1NldHRpbmdzLmxlbmd0aCBpcyAwXG5cbiAgY2hlY2tGb3JVcGRhdGU6IChjYj1udWxsKSAtPlxuICAgIGlmIEBnZXRHaXN0SWQoKVxuICAgICAgY29uc29sZS5kZWJ1ZygnY2hlY2tpbmcgbGF0ZXN0IGJhY2t1cC4uLicpXG4gICAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZ2V0XG4gICAgICAgIGlkOiBAZ2V0R2lzdElkKClcbiAgICAgICwgKGVyciwgcmVzKSA9PlxuICAgICAgICBpZiBlcnJcbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZ2lzdC4gZG9lcyBpdCBleGlzdHM/XCIsIGVyclxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXJyLm1lc3NhZ2UpLm1lc3NhZ2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnR2lzdCBJRCBOb3QgRm91bmQnIGlmIG1lc3NhZ2UgaXMgJ05vdCBGb3VuZCdcbiAgICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICAgIGlmIG5vdCByZXM/Lmhpc3Rvcnk/WzBdPy52ZXJzaW9uP1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgXCJjb3VsZCBub3QgaW50ZXJwcmV0IHJlc3VsdDpcIiwgcmVzXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLlwiXG4gICAgICAgICAgcmV0dXJuIGNiPygpXG5cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcImxhdGVzdCBiYWNrdXAgdmVyc2lvbiAje3Jlcy5oaXN0b3J5WzBdLnZlcnNpb259XCIpXG4gICAgICAgIGlmIHJlcy5oaXN0b3J5WzBdLnZlcnNpb24gaXNudCBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJylcbiAgICAgICAgICBAbm90aWZ5TmV3ZXJCYWNrdXAoKVxuICAgICAgICBlbHNlIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MucXVpZXRVcGRhdGVDaGVjaycpXG4gICAgICAgICAgQG5vdGlmeUJhY2t1cFVwdG9kYXRlKClcblxuICAgICAgICBjYj8oKVxuICAgIGVsc2VcbiAgICAgIEBub3RpZnlNaXNzaW5nTWFuZGF0b3J5U2V0dGluZ3MoW1wiR2lzdCBJRFwiXSlcblxuICBub3RpZnlOZXdlckJhY2t1cDogLT5cbiAgICAjIHdlIG5lZWQgdGhlIGFjdHVhbCBlbGVtZW50IGZvciBkaXNwYXRjaGluZyBvbiBpdFxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJzeW5jLXNldHRpbmdzOiBZb3VyIHNldHRpbmdzIGFyZSBvdXQgb2YgZGF0ZS5cIixcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBidXR0b25zOiBbe1xuICAgICAgICB0ZXh0OiBcIkJhY2t1cFwiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcInN5bmMtc2V0dGluZ3M6YmFja3VwXCJcbiAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiVmlldyBiYWNrdXBcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPlxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgXCJzeW5jLXNldHRpbmdzOnZpZXctYmFja3VwXCJcbiAgICAgIH0sIHtcbiAgICAgICAgdGV4dDogXCJSZXN0b3JlXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwic3luYy1zZXR0aW5nczpyZXN0b3JlXCJcbiAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiRGlzbWlzc1wiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+IG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgIH1dXG5cbiAgbm90aWZ5QmFja3VwVXB0b2RhdGU6IC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJzeW5jLXNldHRpbmdzOiBMYXRlc3QgYmFja3VwIGlzIGFscmVhZHkgYXBwbGllZC5cIlxuXG5cbiAgbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzOiAobWlzc2luZ1NldHRpbmdzKSAtPlxuICAgIGNvbnRleHQgPSB0aGlzXG4gICAgZXJyb3JNc2cgPSBcInN5bmMtc2V0dGluZ3M6IE1hbmRhdG9yeSBzZXR0aW5ncyBtaXNzaW5nOiBcIiArIG1pc3NpbmdTZXR0aW5ncy5qb2luKCcsICcpXG5cbiAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgZXJyb3JNc2csXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgdGV4dDogXCJQYWNrYWdlIHNldHRpbmdzXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICAgIGNvbnRleHQuZ29Ub1BhY2thZ2VTZXR0aW5ncygpXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9XVxuXG4gIGJhY2t1cDogKGNiPW51bGwpIC0+XG4gICAgZmlsZXMgPSB7fVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU2V0dGluZ3MnKVxuICAgICAgZmlsZXNbXCJzZXR0aW5ncy5qc29uXCJdID0gY29udGVudDogQGdldEZpbHRlcmVkU2V0dGluZ3MoKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jUGFja2FnZXMnKVxuICAgICAgZmlsZXNbXCJwYWNrYWdlcy5qc29uXCJdID0gY29udGVudDogSlNPTi5zdHJpbmdpZnkoQGdldFBhY2thZ2VzKCksIG51bGwsICdcXHQnKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jS2V5bWFwJylcbiAgICAgIGZpbGVzW1wia2V5bWFwLmNzb25cIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20ua2V5bWFwcy5nZXRVc2VyS2V5bWFwUGF0aCgpKSA/IFwiIyBrZXltYXAgZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTdHlsZXMnKVxuICAgICAgZmlsZXNbXCJzdHlsZXMubGVzc1wiXSA9IGNvbnRlbnQ6IChAZmlsZUNvbnRlbnQgYXRvbS5zdHlsZXMuZ2V0VXNlclN0eWxlU2hlZXRQYXRoKCkpID8gXCIvLyBzdHlsZXMgZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNJbml0JylcbiAgICAgIGZpbGVzW1wiaW5pdC5jb2ZmZWVcIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9pbml0LmNvZmZlZVwiKSA/IFwiIyBpbml0aWFsaXphdGlvbiBmaWxlIChub3QgZm91bmQpXCJcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1NuaXBwZXRzJylcbiAgICAgIGZpbGVzW1wic25pcHBldHMuY3NvblwiXSA9IGNvbnRlbnQ6IChAZmlsZUNvbnRlbnQgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCArIFwiL3NuaXBwZXRzLmNzb25cIikgPyBcIiMgc25pcHBldHMgZmlsZSAobm90IGZvdW5kKVwiXG5cbiAgICBmb3IgZmlsZSBpbiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuZXh0cmFGaWxlcycpID8gW11cbiAgICAgIGV4dCA9IGZpbGUuc2xpY2UoZmlsZS5sYXN0SW5kZXhPZihcIi5cIikpLnRvTG93ZXJDYXNlKClcbiAgICAgIGNtdHN0YXJ0ID0gXCIjXCJcbiAgICAgIGNtdHN0YXJ0ID0gXCIvL1wiIGlmIGV4dCBpbiBbXCIubGVzc1wiLCBcIi5zY3NzXCIsIFwiLmpzXCJdXG4gICAgICBjbXRzdGFydCA9IFwiLypcIiBpZiBleHQgaW4gW1wiLmNzc1wiXVxuICAgICAgY210ZW5kID0gXCJcIlxuICAgICAgY210ZW5kID0gXCIqL1wiIGlmIGV4dCBpbiBbXCIuY3NzXCJdXG4gICAgICBmaWxlc1tmaWxlXSA9XG4gICAgICAgIGNvbnRlbnQ6IChAZmlsZUNvbnRlbnQgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCArIFwiLyN7ZmlsZX1cIikgPyBcIiN7Y210c3RhcnR9ICN7ZmlsZX0gKG5vdCBmb3VuZCkgI3tjbXRlbmR9XCJcblxuICAgIEBjcmVhdGVDbGllbnQoKS5naXN0cy5lZGl0XG4gICAgICBpZDogQGdldEdpc3RJZCgpXG4gICAgICBkZXNjcmlwdGlvbjogYXRvbS5jb25maWcuZ2V0ICdzeW5jLXNldHRpbmdzLmdpc3REZXNjcmlwdGlvbidcbiAgICAgIGZpbGVzOiBmaWxlc1xuICAgICwgKGVyciwgcmVzKSAtPlxuICAgICAgaWYgZXJyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgXCJlcnJvciBiYWNraW5nIHVwIGRhdGE6IFwiK2Vyci5tZXNzYWdlLCBlcnJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXJyLm1lc3NhZ2UpLm1lc3NhZ2VcbiAgICAgICAgICBtZXNzYWdlID0gJ0dpc3QgSUQgTm90IEZvdW5kJyBpZiBtZXNzYWdlIGlzICdOb3QgRm91bmQnXG4gICAgICAgIGNhdGNoIFN5bnRheEVycm9yXG4gICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIGJhY2tpbmcgdXAgeW91ciBzZXR0aW5ncy4gKFwiK21lc3NhZ2UrXCIpXCJcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcsIHJlcy5oaXN0b3J5WzBdLnZlcnNpb24pXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogWW91ciBzZXR0aW5ncyB3ZXJlIHN1Y2Nlc3NmdWxseSBiYWNrZWQgdXAuIDxici8+PGEgaHJlZj0nXCIrcmVzLmh0bWxfdXJsK1wiJz5DbGljayBoZXJlIHRvIG9wZW4geW91ciBHaXN0LjwvYT5cIlxuICAgICAgY2I/KGVyciwgcmVzKVxuXG4gIHZpZXdCYWNrdXA6IC0+XG4gICAgU2hlbGwgPSByZXF1aXJlICdzaGVsbCdcbiAgICBnaXN0SWQgPSBAZ2V0R2lzdElkKClcbiAgICBTaGVsbC5vcGVuRXh0ZXJuYWwgXCJodHRwczovL2dpc3QuZ2l0aHViLmNvbS8je2dpc3RJZH1cIlxuXG4gIGdldFBhY2thZ2VzOiAtPlxuICAgIHBhY2thZ2VzID0gW11cbiAgICBmb3IgaSwgbWV0YWRhdGEgb2YgQF9nZXRBdmFpbGFibGVQYWNrYWdlTWV0YWRhdGFXaXRob3V0RHVwbGljYXRlcygpXG4gICAgICB7bmFtZSwgdmVyc2lvbiwgdGhlbWUsIGFwbUluc3RhbGxTb3VyY2V9ID0gbWV0YWRhdGFcbiAgICAgIHBhY2thZ2VzLnB1c2goe25hbWUsIHZlcnNpb24sIHRoZW1lLCBhcG1JbnN0YWxsU291cmNlfSlcbiAgICBfLnNvcnRCeShwYWNrYWdlcywgJ25hbWUnKVxuXG4gIF9nZXRBdmFpbGFibGVQYWNrYWdlTWV0YWRhdGFXaXRob3V0RHVwbGljYXRlczogLT5cbiAgICBwYXRoMm1ldGFkYXRhID0ge31cbiAgICBwYWNrYWdlX21ldGFkYXRhID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTWV0YWRhdGEoKVxuICAgIGZvciBwYXRoLCBpIGluIGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZVBhdGhzKClcbiAgICAgIHBhdGgybWV0YWRhdGFbZnMucmVhbHBhdGhTeW5jKHBhdGgpXSA9IHBhY2thZ2VfbWV0YWRhdGFbaV1cblxuICAgIHBhY2thZ2VzID0gW11cbiAgICBmb3IgaSwgcGtnX25hbWUgb2YgYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKVxuICAgICAgcGtnX3BhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aChwa2dfbmFtZSlcbiAgICAgIGlmIHBhdGgybWV0YWRhdGFbcGtnX3BhdGhdXG4gICAgICAgIHBhY2thZ2VzLnB1c2gocGF0aDJtZXRhZGF0YVtwa2dfcGF0aF0pXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2NvdWxkIG5vdCBjb3JyZWxhdGUgcGFja2FnZSBuYW1lLCBwYXRoLCBhbmQgbWV0YWRhdGEnKVxuICAgIHBhY2thZ2VzXG5cbiAgcmVzdG9yZTogKGNiPW51bGwpIC0+XG4gICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmdldFxuICAgICAgaWQ6IEBnZXRHaXN0SWQoKVxuICAgICwgKGVyciwgcmVzKSA9PlxuICAgICAgaWYgZXJyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgXCJlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBnaXN0LiBkb2VzIGl0IGV4aXN0cz9cIiwgZXJyXG4gICAgICAgIHRyeVxuICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgbWVzc2FnZSA9ICdHaXN0IElEIE5vdCBGb3VuZCcgaWYgbWVzc2FnZSBpcyAnTm90IEZvdW5kJ1xuICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciByZXRyaWV2aW5nIHlvdXIgc2V0dGluZ3MuIChcIittZXNzYWdlK1wiKVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBjYWxsYmFja0FzeW5jID0gZmFsc2VcblxuICAgICAgZm9yIG93biBmaWxlbmFtZSwgZmlsZSBvZiByZXMuZmlsZXNcbiAgICAgICAgc3dpdGNoIGZpbGVuYW1lXG4gICAgICAgICAgd2hlbiAnc2V0dGluZ3MuanNvbidcbiAgICAgICAgICAgIEBhcHBseVNldHRpbmdzICcnLCBKU09OLnBhcnNlKGZpbGUuY29udGVudCkgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTZXR0aW5ncycpXG5cbiAgICAgICAgICB3aGVuICdwYWNrYWdlcy5qc29uJ1xuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNQYWNrYWdlcycpXG4gICAgICAgICAgICAgIGNhbGxiYWNrQXN5bmMgPSB0cnVlXG4gICAgICAgICAgICAgIEBpbnN0YWxsTWlzc2luZ1BhY2thZ2VzIEpTT04ucGFyc2UoZmlsZS5jb250ZW50KSwgY2JcblxuICAgICAgICAgIHdoZW4gJ2tleW1hcC5jc29uJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmtleW1hcHMuZ2V0VXNlcktleW1hcFBhdGgoKSwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jS2V5bWFwJylcblxuICAgICAgICAgIHdoZW4gJ3N0eWxlcy5sZXNzJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLnN0eWxlcy5nZXRVc2VyU3R5bGVTaGVldFBhdGgoKSwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU3R5bGVzJylcblxuICAgICAgICAgIHdoZW4gJ2luaXQuY29mZmVlJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvaW5pdC5jb2ZmZWVcIiwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jSW5pdCcpXG5cbiAgICAgICAgICB3aGVuICdzbmlwcGV0cy5jc29uJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvc25pcHBldHMuY3NvblwiLCBmaWxlLmNvbnRlbnQgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTbmlwcGV0cycpXG5cbiAgICAgICAgICBlbHNlIGZzLndyaXRlRmlsZVN5bmMgXCIje2F0b20uY29uZmlnLmNvbmZpZ0RpclBhdGh9LyN7ZmlsZW5hbWV9XCIsIGZpbGUuY29udGVudFxuXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJywgcmVzLmhpc3RvcnlbMF0udmVyc2lvbilcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJzeW5jLXNldHRpbmdzOiBZb3VyIHNldHRpbmdzIHdlcmUgc3VjY2Vzc2Z1bGx5IHN5bmNocm9uaXplZC5cIlxuXG4gICAgICBjYj8oKSB1bmxlc3MgY2FsbGJhY2tBc3luY1xuXG4gIGNyZWF0ZUNsaWVudDogLT5cbiAgICB0b2tlbiA9IEBnZXRQZXJzb25hbEFjY2Vzc1Rva2VuKClcbiAgICBjb25zb2xlLmRlYnVnIFwiQ3JlYXRpbmcgR2l0SHViQXBpIGNsaWVudCB3aXRoIHRva2VuID0gI3t0b2tlbn1cIlxuICAgIGdpdGh1YiA9IG5ldyBHaXRIdWJBcGlcbiAgICAgIHZlcnNpb246ICczLjAuMCdcbiAgICAgICMgZGVidWc6IHRydWVcbiAgICAgIHByb3RvY29sOiAnaHR0cHMnXG4gICAgZ2l0aHViLmF1dGhlbnRpY2F0ZVxuICAgICAgdHlwZTogJ29hdXRoJ1xuICAgICAgdG9rZW46IHRva2VuXG4gICAgZ2l0aHViXG5cbiAgZ2V0RmlsdGVyZWRTZXR0aW5nczogLT5cbiAgICAjIF8uY2xvbmUoKSBkb2Vzbid0IGRlZXAgY2xvbmUgdGh1cyB3ZSBhcmUgdXNpbmcgSlNPTiBwYXJzZSB0cmlja1xuICAgIHNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhdG9tLmNvbmZpZy5zZXR0aW5ncykpXG4gICAgYmxhY2tsaXN0ZWRLZXlzID0gUkVNT1ZFX0tFWVMuY29uY2F0KGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5ibGFja2xpc3RlZEtleXMnKSA/IFtdKVxuICAgIGZvciBibGFja2xpc3RlZEtleSBpbiBibGFja2xpc3RlZEtleXNcbiAgICAgIGJsYWNrbGlzdGVkS2V5ID0gYmxhY2tsaXN0ZWRLZXkuc3BsaXQoXCIuXCIpXG4gICAgICBAX3JlbW92ZVByb3BlcnR5KHNldHRpbmdzLCBibGFja2xpc3RlZEtleSlcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsICdcXHQnKVxuXG4gIF9yZW1vdmVQcm9wZXJ0eTogKG9iaiwga2V5KSAtPlxuICAgIGxhc3RLZXkgPSBrZXkubGVuZ3RoIGlzIDFcbiAgICBjdXJyZW50S2V5ID0ga2V5LnNoaWZ0KClcblxuICAgIGlmIG5vdCBsYXN0S2V5IGFuZCBfLmlzT2JqZWN0KG9ialtjdXJyZW50S2V5XSkgYW5kIG5vdCBfLmlzQXJyYXkob2JqW2N1cnJlbnRLZXldKVxuICAgICAgQF9yZW1vdmVQcm9wZXJ0eShvYmpbY3VycmVudEtleV0sIGtleSlcbiAgICBlbHNlXG4gICAgICBkZWxldGUgb2JqW2N1cnJlbnRLZXldXG5cbiAgZ29Ub1BhY2thZ2VTZXR0aW5nczogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFwiYXRvbTovL2NvbmZpZy9wYWNrYWdlcy9zeW5jLXNldHRpbmdzXCIpXG5cbiAgYXBwbHlTZXR0aW5nczogKHByZWYsIHNldHRpbmdzKSAtPlxuICAgIGZvciBrZXksIHZhbHVlIG9mIHNldHRpbmdzXG4gICAgICBrZXlQYXRoID0gXCIje3ByZWZ9LiN7a2V5fVwiXG4gICAgICBpc0NvbG9yID0gZmFsc2VcbiAgICAgIGlmIF8uaXNPYmplY3QodmFsdWUpXG4gICAgICAgIHZhbHVlS2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKVxuICAgICAgICBjb2xvcktleXMgPSBbJ2FscGhhJywgJ2JsdWUnLCAnZ3JlZW4nLCAncmVkJ11cbiAgICAgICAgaXNDb2xvciA9IF8uaXNFcXVhbChfLnNvcnRCeSh2YWx1ZUtleXMpLCBjb2xvcktleXMpXG4gICAgICBpZiBfLmlzT2JqZWN0KHZhbHVlKSBhbmQgbm90IF8uaXNBcnJheSh2YWx1ZSkgYW5kIG5vdCBpc0NvbG9yXG4gICAgICAgIEBhcHBseVNldHRpbmdzIGtleVBhdGgsIHZhbHVlXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUuZGVidWcgXCJjb25maWcuc2V0ICN7a2V5UGF0aFsxLi4uXX09I3t2YWx1ZX1cIlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQga2V5UGF0aFsxLi4uXSwgdmFsdWVcblxuICBpbnN0YWxsTWlzc2luZ1BhY2thZ2VzOiAocGFja2FnZXMsIGNiKSAtPlxuICAgIGF2YWlsYWJsZV9wYWNrYWdlcyA9IEBnZXRQYWNrYWdlcygpXG4gICAgbWlzc2luZ19wYWNrYWdlcyA9IFtdXG4gICAgZm9yIHBrZyBpbiBwYWNrYWdlc1xuICAgICAgYXZhaWxhYmxlX3BhY2thZ2UgPSAocCBmb3IgcCBpbiBhdmFpbGFibGVfcGFja2FnZXMgd2hlbiBwLm5hbWUgaXMgcGtnLm5hbWUpXG4gICAgICBpZiBhdmFpbGFibGVfcGFja2FnZS5sZW5ndGggaXMgMFxuICAgICAgICAjIG1pc3NpbmcgaWYgbm90IHlldCBpbnN0YWxsZWRcbiAgICAgICAgbWlzc2luZ19wYWNrYWdlcy5wdXNoKHBrZylcbiAgICAgIGVsc2UgaWYgbm90KCEhcGtnLmFwbUluc3RhbGxTb3VyY2UgaXMgISFhdmFpbGFibGVfcGFja2FnZVswXS5hcG1JbnN0YWxsU291cmNlKVxuICAgICAgICAjIG9yIGluc3RhbGxlZCBidXQgd2l0aCBkaWZmZXJlbnQgYXBtIGluc3RhbGwgc291cmNlXG4gICAgICAgIG1pc3NpbmdfcGFja2FnZXMucHVzaChwa2cpXG4gICAgaWYgbWlzc2luZ19wYWNrYWdlcy5sZW5ndGggaXMgMFxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJTeW5jLXNldHRpbmdzOiBubyBwYWNrYWdlcyB0byBpbnN0YWxsXCJcbiAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgbm90aWZpY2F0aW9ucyA9IHt9XG4gICAgc3VjY2VlZGVkID0gW11cbiAgICBmYWlsZWQgPSBbXVxuICAgIGluc3RhbGxOZXh0UGFja2FnZSA9ID0+XG4gICAgICBpZiBtaXNzaW5nX3BhY2thZ2VzLmxlbmd0aCA+IDBcbiAgICAgICAgIyBzdGFydCBpbnN0YWxsaW5nIG5leHQgcGFja2FnZVxuICAgICAgICBwa2cgPSBtaXNzaW5nX3BhY2thZ2VzLnNoaWZ0KClcbiAgICAgICAgaSA9IHN1Y2NlZWRlZC5sZW5ndGggKyBmYWlsZWQubGVuZ3RoICsgT2JqZWN0LmtleXMobm90aWZpY2F0aW9ucykubGVuZ3RoICsgMVxuICAgICAgICBjb3VudCA9IGkgKyBtaXNzaW5nX3BhY2thZ2VzLmxlbmd0aFxuICAgICAgICBub3RpZmljYXRpb25zW3BrZy5uYW1lXSA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiU3luYy1zZXR0aW5nczogaW5zdGFsbGluZyAje3BrZy5uYW1lfSAoI3tpfS8je2NvdW50fSlcIiwge2Rpc21pc3NhYmxlOiB0cnVlfVxuICAgICAgICBkbyAocGtnKSA9PlxuICAgICAgICAgIEBpbnN0YWxsUGFja2FnZSBwa2csIChlcnJvcikgLT5cbiAgICAgICAgICAgICMgaW5zdGFsbGF0aW9uIG9mIHBhY2thZ2UgZmluaXNoZWRcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdLmRpc21pc3MoKVxuICAgICAgICAgICAgZGVsZXRlIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdXG4gICAgICAgICAgICBpZiBlcnJvcj9cbiAgICAgICAgICAgICAgZmFpbGVkLnB1c2gocGtnLm5hbWUpXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiU3luYy1zZXR0aW5nczogZmFpbGVkIHRvIGluc3RhbGwgI3twa2cubmFtZX1cIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdWNjZWVkZWQucHVzaChwa2cubmFtZSlcbiAgICAgICAgICAgICMgdHJpZ2dlciBuZXh0IHBhY2thZ2VcbiAgICAgICAgICAgIGluc3RhbGxOZXh0UGFja2FnZSgpXG4gICAgICBlbHNlIGlmIE9iamVjdC5rZXlzKG5vdGlmaWNhdGlvbnMpLmxlbmd0aCBpcyAwXG4gICAgICAgICMgbGFzdCBwYWNrYWdlIGluc3RhbGxhdGlvbiBmaW5pc2hlZFxuICAgICAgICBpZiBmYWlsZWQubGVuZ3RoIGlzIDBcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcIlN5bmMtc2V0dGluZ3M6IGZpbmlzaGVkIGluc3RhbGxpbmcgI3tzdWNjZWVkZWQubGVuZ3RofSBwYWNrYWdlc1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWlsZWQuc29ydCgpXG4gICAgICAgICAgZmFpbGVkU3RyID0gZmFpbGVkLmpvaW4oJywgJylcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlN5bmMtc2V0dGluZ3M6IGZpbmlzaGVkIGluc3RhbGxpbmcgcGFja2FnZXMgKCN7ZmFpbGVkLmxlbmd0aH0gZmFpbGVkOiAje2ZhaWxlZFN0cn0pXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgY2I/KClcbiAgICAjIHN0YXJ0IGFzIG1hbnkgcGFja2FnZSBpbnN0YWxsYXRpb25zIGluIHBhcmFsbGVsIGFzIGRlc2lyZWRcbiAgICBjb25jdXJyZW5jeSA9IE1hdGgubWluIG1pc3NpbmdfcGFja2FnZXMubGVuZ3RoLCA4XG4gICAgZm9yIGkgaW4gWzAuLi5jb25jdXJyZW5jeV1cbiAgICAgIGluc3RhbGxOZXh0UGFja2FnZSgpXG5cbiAgaW5zdGFsbFBhY2thZ2U6IChwYWNrLCBjYikgLT5cbiAgICB0eXBlID0gaWYgcGFjay50aGVtZSB0aGVuICd0aGVtZScgZWxzZSAncGFja2FnZSdcbiAgICBjb25zb2xlLmluZm8oXCJJbnN0YWxsaW5nICN7dHlwZX0gI3twYWNrLm5hbWV9Li4uXCIpXG4gICAgcGFja2FnZU1hbmFnZXIgPSBuZXcgUGFja2FnZU1hbmFnZXIoKVxuICAgIHBhY2thZ2VNYW5hZ2VyLmluc3RhbGwgcGFjaywgKGVycm9yKSAtPlxuICAgICAgaWYgZXJyb3I/XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnN0YWxsaW5nICN7dHlwZX0gI3twYWNrLm5hbWV9IGZhaWxlZFwiLCBlcnJvci5zdGFjayA/IGVycm9yLCBlcnJvci5zdGRlcnIpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIkluc3RhbGxlZCAje3R5cGV9ICN7cGFjay5uYW1lfVwiKVxuICAgICAgY2I/KGVycm9yKVxuXG4gIGZpbGVDb250ZW50OiAoZmlsZVBhdGgpIC0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGY4J30pIG9yIG51bGxcbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmVycm9yIFwiRXJyb3IgcmVhZGluZyBmaWxlICN7ZmlsZVBhdGh9LiBQcm9iYWJseSBkb2Vzbid0IGV4aXN0LlwiLCBlXG4gICAgICBudWxsXG5cbiAgaW5wdXRGb3JrR2lzdElkOiAtPlxuICAgIEZvcmtHaXN0SWRJbnB1dFZpZXcgPz0gcmVxdWlyZSAnLi9mb3JrLWdpc3RpZC1pbnB1dC12aWV3J1xuICAgIEBpbnB1dFZpZXcgPSBuZXcgRm9ya0dpc3RJZElucHV0VmlldygpXG4gICAgQGlucHV0Vmlldy5zZXRDYWxsYmFja0luc3RhbmNlKHRoaXMpXG5cbiAgZm9ya0dpc3RJZDogKGZvcmtJZCkgLT5cbiAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZm9ya1xuICAgICAgaWQ6IGZvcmtJZFxuICAgICwgKGVyciwgcmVzKSA9PlxuICAgICAgaWYgZXJyXG4gICAgICAgIHRyeVxuICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgbWVzc2FnZSA9IFwiR2lzdCBJRCBOb3QgRm91bmRcIiBpZiBtZXNzYWdlIGlzIFwiTm90IEZvdW5kXCJcbiAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgZm9ya2luZyBzZXR0aW5ncy4gKFwiK21lc3NhZ2UrXCIpXCJcbiAgICAgICAgcmV0dXJuIGNiPygpXG5cbiAgICAgIGlmIHJlcy5pZFxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgXCJzeW5jLXNldHRpbmdzLmdpc3RJZFwiLCByZXMuaWRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJzeW5jLXNldHRpbmdzOiBGb3JrZWQgc3VjY2Vzc2Z1bGx5IHRvIHRoZSBuZXcgR2lzdCBJRCBcIiArIHJlcy5pZCArIFwiIHdoaWNoIGhhcyBiZWVuIHNhdmVkIHRvIHlvdXIgY29uZmlnLlwiXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIGZvcmtpbmcgc2V0dGluZ3NcIlxuXG4gICAgICBjYj8oKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNTZXR0aW5nc1xuIl19
