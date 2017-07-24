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
      token = process.env.GITHUB_TOKEN || atom.config.get('sync-settings.personalAccessToken');
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
      var cmtend, cmtstart, ext, file, files, initPath, j, len, path, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
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
        initPath = atom.getUserInitScriptPath();
        path = require('path');
        files[path.basename(initPath)] = {
          content: (ref3 = this.fileContent(initPath)) != null ? ref3 : "# initialization file (not found)"
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
                  if (atom.config.get('sync-settings.removeObsoletePackage')) {
                    _this.removeObsoletePackages(JSON.parse(file.content), cb);
                  }
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
              case 'init.js':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.js", file.content);
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
    removeObsoletePackages: function(remaining_packages, cb) {
      var concurrency, failed, i, installed_packages, j, k, keep_installed_package, len, notifications, obsolete_packages, p, pkg, ref1, removeNextPackage, results, succeeded;
      installed_packages = this.getPackages();
      obsolete_packages = [];
      for (j = 0, len = installed_packages.length; j < len; j++) {
        pkg = installed_packages[j];
        keep_installed_package = (function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = remaining_packages.length; k < len1; k++) {
            p = remaining_packages[k];
            if (p.name === pkg.name) {
              results.push(p);
            }
          }
          return results;
        })();
        if (keep_installed_package.length === 0) {
          obsolete_packages.push(pkg);
        }
      }
      if (obsolete_packages.length === 0) {
        atom.notifications.addInfo("Sync-settings: no packages to remove");
        return typeof cb === "function" ? cb() : void 0;
      }
      notifications = {};
      succeeded = [];
      failed = [];
      removeNextPackage = (function(_this) {
        return function() {
          var count, failedStr, i;
          if (obsolete_packages.length > 0) {
            pkg = obsolete_packages.shift();
            i = succeeded.length + failed.length + Object.keys(notifications).length + 1;
            count = i + obsolete_packages.length;
            notifications[pkg.name] = atom.notifications.addInfo("Sync-settings: removing " + pkg.name + " (" + i + "/" + count + ")", {
              dismissable: true
            });
            return (function(pkg) {
              return _this.removePackage(pkg, function(error) {
                notifications[pkg.name].dismiss();
                delete notifications[pkg.name];
                if (error != null) {
                  failed.push(pkg.name);
                  atom.notifications.addWarning("Sync-settings: failed to remove " + pkg.name);
                } else {
                  succeeded.push(pkg.name);
                }
                return removeNextPackage();
              });
            })(pkg);
          } else if (Object.keys(notifications).length === 0) {
            if (failed.length === 0) {
              atom.notifications.addSuccess("Sync-settings: finished removing " + succeeded.length + " packages");
            } else {
              failed.sort();
              failedStr = failed.join(', ');
              atom.notifications.addWarning("Sync-settings: finished removing packages (" + failed.length + " failed: " + failedStr + ")", {
                dismissable: true
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      concurrency = Math.min(obsolete_packages.length, 8);
      results = [];
      for (i = k = 0, ref1 = concurrency; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(removeNextPackage());
      }
      return results;
    },
    removePackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Removing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.uninstall(pack, function(error) {
        var ref1;
        if (error != null) {
          console.error("Removing " + type + " " + pack.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
        } else {
          console.info("Removing " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
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
      }, function(err, res) {
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
      });
    }
  };

  module.exports = SyncSettings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9zeW5jLXNldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUEsbUhBQUE7SUFBQTs7RUFBQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3BCLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQThCLEVBQTlCLEVBQUMsa0JBQUQsRUFBWTs7RUFDWixtQkFBQSxHQUFzQjs7RUFHdEIsV0FBQSxHQUFjOztFQUNkLFdBQUEsR0FBYyxDQUNaLHNCQURZLEVBRVosbUNBRlksRUFHWixnQ0FIWSxFQUlaLCtCQUpZOztFQU9kLFlBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FBUjtJQUVBLFFBQUEsRUFBVSxTQUFBO2FBRVIsWUFBQSxDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUVYLGNBQUE7O1lBQUEsWUFBYSxPQUFBLENBQVEsUUFBUjs7O1lBQ2IsaUJBQWtCLE9BQUEsQ0FBUSxtQkFBUjs7VUFFbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxzQkFBcEMsRUFBNEQsU0FBQTttQkFDMUQsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUQwRCxDQUE1RDtVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsdUJBQXBDLEVBQTZELFNBQUE7bUJBQzNELEtBQUMsQ0FBQSxPQUFELENBQUE7VUFEMkQsQ0FBN0Q7VUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLDJCQUFwQyxFQUFpRSxTQUFBO21CQUMvRCxLQUFDLENBQUEsVUFBRCxDQUFBO1VBRCtELENBQWpFO1VBRUEsSUFBSSxDQUFD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QixDQUE4Qix3REFBQSxHQUEyRCxHQUFHLENBQUMsRUFBL0QsR0FBb0UsdUNBQWxHLEVBRkY7U0FBQSxNQUFBO1VBSUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0Qix1Q0FBNUIsRUFKRjs7MENBTUE7TUFoQkEsQ0FGRjtJQURVLENBeGFaOzs7RUE2YkYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3Y2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyBpbXBvcnRzXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbltHaXRIdWJBcGksIFBhY2thZ2VNYW5hZ2VyXSA9IFtdXG5Gb3JrR2lzdElkSW5wdXRWaWV3ID0gbnVsbFxuXG4jIGNvbnN0YW50c1xuREVTQ1JJUFRJT04gPSAnQXRvbSBjb25maWd1cmF0aW9uIHN0b3JhZ2Ugb3BlcmF0ZWQgYnkgaHR0cDovL2F0b20uaW8vcGFja2FnZXMvc3luYy1zZXR0aW5ncydcblJFTU9WRV9LRVlTID0gW1xuICAnc3luYy1zZXR0aW5ncy5naXN0SWQnLFxuICAnc3luYy1zZXR0aW5ncy5wZXJzb25hbEFjY2Vzc1Rva2VuJyxcbiAgJ3N5bmMtc2V0dGluZ3MuX2FuYWx5dGljc1VzZXJJZCcsICAjIGtlZXAgbGVnYWN5IGtleSBpbiBibGFja2xpc3RcbiAgJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJyxcbl1cblxuU3luY1NldHRpbmdzID1cbiAgY29uZmlnOiByZXF1aXJlKCcuL2NvbmZpZy5jb2ZmZWUnKVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgICMgc3BlZWR1cCBhY3RpdmF0aW9uIGJ5IGFzeW5jIGluaXRpYWxpemluZ1xuICAgIHNldEltbWVkaWF0ZSA9PlxuICAgICAgIyBhY3R1YWwgaW5pdGlhbGl6YXRpb24gYWZ0ZXIgYXRvbSBoYXMgbG9hZGVkXG4gICAgICBHaXRIdWJBcGkgPz0gcmVxdWlyZSAnZ2l0aHViJ1xuICAgICAgUGFja2FnZU1hbmFnZXIgPz0gcmVxdWlyZSAnLi9wYWNrYWdlLW1hbmFnZXInXG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczpiYWNrdXBcIiwgPT5cbiAgICAgICAgQGJhY2t1cCgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6cmVzdG9yZVwiLCA9PlxuICAgICAgICBAcmVzdG9yZSgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6dmlldy1iYWNrdXBcIiwgPT5cbiAgICAgICAgQHZpZXdCYWNrdXAoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOmNoZWNrLWJhY2t1cFwiLCA9PlxuICAgICAgICBAY2hlY2tGb3JVcGRhdGUoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOmZvcmtcIiwgPT5cbiAgICAgICAgQGlucHV0Rm9ya0dpc3RJZCgpXG5cbiAgICAgIG1hbmRhdG9yeVNldHRpbmdzQXBwbGllZCA9IEBjaGVja01hbmRhdG9yeVNldHRpbmdzKClcbiAgICAgIEBjaGVja0ZvclVwZGF0ZSgpIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5jaGVja0ZvclVwZGF0ZWRCYWNrdXAnKSBhbmQgbWFuZGF0b3J5U2V0dGluZ3NBcHBsaWVkXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAaW5wdXRWaWV3Py5kZXN0cm95KClcblxuICBzZXJpYWxpemU6IC0+XG5cbiAgZ2V0R2lzdElkOiAtPlxuICAgIGdpc3RJZCA9IGF0b20uY29uZmlnLmdldCAnc3luYy1zZXR0aW5ncy5naXN0SWQnXG4gICAgaWYgZ2lzdElkXG4gICAgICBnaXN0SWQgPSBnaXN0SWQudHJpbSgpXG4gICAgcmV0dXJuIGdpc3RJZFxuXG4gIGdldFBlcnNvbmFsQWNjZXNzVG9rZW46IC0+XG4gICAgdG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gb3IgYXRvbS5jb25maWcuZ2V0ICdzeW5jLXNldHRpbmdzLnBlcnNvbmFsQWNjZXNzVG9rZW4nXG4gICAgaWYgdG9rZW5cbiAgICAgIHRva2VuID0gdG9rZW4udHJpbSgpXG4gICAgcmV0dXJuIHRva2VuXG5cbiAgY2hlY2tNYW5kYXRvcnlTZXR0aW5nczogLT5cbiAgICBtaXNzaW5nU2V0dGluZ3MgPSBbXVxuICAgIGlmIG5vdCBAZ2V0R2lzdElkKClcbiAgICAgIG1pc3NpbmdTZXR0aW5ncy5wdXNoKFwiR2lzdCBJRFwiKVxuICAgIGlmIG5vdCBAZ2V0UGVyc29uYWxBY2Nlc3NUb2tlbigpXG4gICAgICBtaXNzaW5nU2V0dGluZ3MucHVzaChcIkdpdEh1YiBwZXJzb25hbCBhY2Nlc3MgdG9rZW5cIilcbiAgICBpZiBtaXNzaW5nU2V0dGluZ3MubGVuZ3RoXG4gICAgICBAbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzKG1pc3NpbmdTZXR0aW5ncylcbiAgICByZXR1cm4gbWlzc2luZ1NldHRpbmdzLmxlbmd0aCBpcyAwXG5cbiAgY2hlY2tGb3JVcGRhdGU6IChjYj1udWxsKSAtPlxuICAgIGlmIEBnZXRHaXN0SWQoKVxuICAgICAgY29uc29sZS5kZWJ1ZygnY2hlY2tpbmcgbGF0ZXN0IGJhY2t1cC4uLicpXG4gICAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZ2V0XG4gICAgICAgIGlkOiBAZ2V0R2lzdElkKClcbiAgICAgICwgKGVyciwgcmVzKSA9PlxuICAgICAgICBpZiBlcnJcbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZ2lzdC4gZG9lcyBpdCBleGlzdHM/XCIsIGVyclxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXJyLm1lc3NhZ2UpLm1lc3NhZ2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnR2lzdCBJRCBOb3QgRm91bmQnIGlmIG1lc3NhZ2UgaXMgJ05vdCBGb3VuZCdcbiAgICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICAgIGlmIG5vdCByZXM/Lmhpc3Rvcnk/WzBdPy52ZXJzaW9uP1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgXCJjb3VsZCBub3QgaW50ZXJwcmV0IHJlc3VsdDpcIiwgcmVzXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLlwiXG4gICAgICAgICAgcmV0dXJuIGNiPygpXG5cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcImxhdGVzdCBiYWNrdXAgdmVyc2lvbiAje3Jlcy5oaXN0b3J5WzBdLnZlcnNpb259XCIpXG4gICAgICAgIGlmIHJlcy5oaXN0b3J5WzBdLnZlcnNpb24gaXNudCBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJylcbiAgICAgICAgICBAbm90aWZ5TmV3ZXJCYWNrdXAoKVxuICAgICAgICBlbHNlIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MucXVpZXRVcGRhdGVDaGVjaycpXG4gICAgICAgICAgQG5vdGlmeUJhY2t1cFVwdG9kYXRlKClcblxuICAgICAgICBjYj8oKVxuICAgIGVsc2VcbiAgICAgIEBub3RpZnlNaXNzaW5nTWFuZGF0b3J5U2V0dGluZ3MoW1wiR2lzdCBJRFwiXSlcblxuICBub3RpZnlOZXdlckJhY2t1cDogLT5cbiAgICAjIHdlIG5lZWQgdGhlIGFjdHVhbCBlbGVtZW50IGZvciBkaXNwYXRjaGluZyBvbiBpdFxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJzeW5jLXNldHRpbmdzOiBZb3VyIHNldHRpbmdzIGFyZSBvdXQgb2YgZGF0ZS5cIixcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBidXR0b25zOiBbe1xuICAgICAgICB0ZXh0OiBcIkJhY2t1cFwiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcInN5bmMtc2V0dGluZ3M6YmFja3VwXCJcbiAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiVmlldyBiYWNrdXBcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPlxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgXCJzeW5jLXNldHRpbmdzOnZpZXctYmFja3VwXCJcbiAgICAgIH0sIHtcbiAgICAgICAgdGV4dDogXCJSZXN0b3JlXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwic3luYy1zZXR0aW5nczpyZXN0b3JlXCJcbiAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiRGlzbWlzc1wiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+IG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgIH1dXG5cbiAgbm90aWZ5QmFja3VwVXB0b2RhdGU6IC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJzeW5jLXNldHRpbmdzOiBMYXRlc3QgYmFja3VwIGlzIGFscmVhZHkgYXBwbGllZC5cIlxuXG5cbiAgbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzOiAobWlzc2luZ1NldHRpbmdzKSAtPlxuICAgIGNvbnRleHQgPSB0aGlzXG4gICAgZXJyb3JNc2cgPSBcInN5bmMtc2V0dGluZ3M6IE1hbmRhdG9yeSBzZXR0aW5ncyBtaXNzaW5nOiBcIiArIG1pc3NpbmdTZXR0aW5ncy5qb2luKCcsICcpXG5cbiAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgZXJyb3JNc2csXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgdGV4dDogXCJQYWNrYWdlIHNldHRpbmdzXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICAgIGNvbnRleHQuZ29Ub1BhY2thZ2VTZXR0aW5ncygpXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9XVxuXG4gIGJhY2t1cDogKGNiPW51bGwpIC0+XG4gICAgZmlsZXMgPSB7fVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU2V0dGluZ3MnKVxuICAgICAgZmlsZXNbXCJzZXR0aW5ncy5qc29uXCJdID0gY29udGVudDogQGdldEZpbHRlcmVkU2V0dGluZ3MoKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jUGFja2FnZXMnKVxuICAgICAgZmlsZXNbXCJwYWNrYWdlcy5qc29uXCJdID0gY29udGVudDogSlNPTi5zdHJpbmdpZnkoQGdldFBhY2thZ2VzKCksIG51bGwsICdcXHQnKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jS2V5bWFwJylcbiAgICAgIGZpbGVzW1wia2V5bWFwLmNzb25cIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20ua2V5bWFwcy5nZXRVc2VyS2V5bWFwUGF0aCgpKSA/IFwiIyBrZXltYXAgZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTdHlsZXMnKVxuICAgICAgZmlsZXNbXCJzdHlsZXMubGVzc1wiXSA9IGNvbnRlbnQ6IChAZmlsZUNvbnRlbnQgYXRvbS5zdHlsZXMuZ2V0VXNlclN0eWxlU2hlZXRQYXRoKCkpID8gXCIvLyBzdHlsZXMgZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNJbml0JylcbiAgICAgIGluaXRQYXRoID0gYXRvbS5nZXRVc2VySW5pdFNjcmlwdFBhdGgoKVxuICAgICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgZmlsZXNbcGF0aC5iYXNlbmFtZShpbml0UGF0aCldID0gY29udGVudDogKEBmaWxlQ29udGVudCBpbml0UGF0aCkgPyBcIiMgaW5pdGlhbGl6YXRpb24gZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTbmlwcGV0cycpXG4gICAgICBmaWxlc1tcInNuaXBwZXRzLmNzb25cIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9zbmlwcGV0cy5jc29uXCIpID8gXCIjIHNuaXBwZXRzIGZpbGUgKG5vdCBmb3VuZClcIlxuXG4gICAgZm9yIGZpbGUgaW4gYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLmV4dHJhRmlsZXMnKSA/IFtdXG4gICAgICBleHQgPSBmaWxlLnNsaWNlKGZpbGUubGFzdEluZGV4T2YoXCIuXCIpKS50b0xvd2VyQ2FzZSgpXG4gICAgICBjbXRzdGFydCA9IFwiI1wiXG4gICAgICBjbXRzdGFydCA9IFwiLy9cIiBpZiBleHQgaW4gW1wiLmxlc3NcIiwgXCIuc2Nzc1wiLCBcIi5qc1wiXVxuICAgICAgY210c3RhcnQgPSBcIi8qXCIgaWYgZXh0IGluIFtcIi5jc3NcIl1cbiAgICAgIGNtdGVuZCA9IFwiXCJcbiAgICAgIGNtdGVuZCA9IFwiKi9cIiBpZiBleHQgaW4gW1wiLmNzc1wiXVxuICAgICAgZmlsZXNbZmlsZV0gPVxuICAgICAgICBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi8je2ZpbGV9XCIpID8gXCIje2NtdHN0YXJ0fSAje2ZpbGV9IChub3QgZm91bmQpICN7Y210ZW5kfVwiXG5cbiAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZWRpdFxuICAgICAgaWQ6IEBnZXRHaXN0SWQoKVxuICAgICAgZGVzY3JpcHRpb246IGF0b20uY29uZmlnLmdldCAnc3luYy1zZXR0aW5ncy5naXN0RGVzY3JpcHRpb24nXG4gICAgICBmaWxlczogZmlsZXNcbiAgICAsIChlcnIsIHJlcykgLT5cbiAgICAgIGlmIGVyclxuICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3IgYmFja2luZyB1cCBkYXRhOiBcIitlcnIubWVzc2FnZSwgZXJyXG4gICAgICAgIHRyeVxuICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgbWVzc2FnZSA9ICdHaXN0IElEIE5vdCBGb3VuZCcgaWYgbWVzc2FnZSBpcyAnTm90IEZvdW5kJ1xuICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciBiYWNraW5nIHVwIHlvdXIgc2V0dGluZ3MuIChcIittZXNzYWdlK1wiKVwiXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnc3luYy1zZXR0aW5ncy5fbGFzdEJhY2t1cEhhc2gnLCByZXMuaGlzdG9yeVswXS52ZXJzaW9uKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcInN5bmMtc2V0dGluZ3M6IFlvdXIgc2V0dGluZ3Mgd2VyZSBzdWNjZXNzZnVsbHkgYmFja2VkIHVwLiA8YnIvPjxhIGhyZWY9J1wiK3Jlcy5odG1sX3VybCtcIic+Q2xpY2sgaGVyZSB0byBvcGVuIHlvdXIgR2lzdC48L2E+XCJcbiAgICAgIGNiPyhlcnIsIHJlcylcblxuICB2aWV3QmFja3VwOiAtPlxuICAgIFNoZWxsID0gcmVxdWlyZSAnc2hlbGwnXG4gICAgZ2lzdElkID0gQGdldEdpc3RJZCgpXG4gICAgU2hlbGwub3BlbkV4dGVybmFsIFwiaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vI3tnaXN0SWR9XCJcblxuICBnZXRQYWNrYWdlczogLT5cbiAgICBwYWNrYWdlcyA9IFtdXG4gICAgZm9yIGksIG1ldGFkYXRhIG9mIEBfZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhV2l0aG91dER1cGxpY2F0ZXMoKVxuICAgICAge25hbWUsIHZlcnNpb24sIHRoZW1lLCBhcG1JbnN0YWxsU291cmNlfSA9IG1ldGFkYXRhXG4gICAgICBwYWNrYWdlcy5wdXNoKHtuYW1lLCB2ZXJzaW9uLCB0aGVtZSwgYXBtSW5zdGFsbFNvdXJjZX0pXG4gICAgXy5zb3J0QnkocGFja2FnZXMsICduYW1lJylcblxuICBfZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhV2l0aG91dER1cGxpY2F0ZXM6IC0+XG4gICAgcGF0aDJtZXRhZGF0YSA9IHt9XG4gICAgcGFja2FnZV9tZXRhZGF0YSA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhKClcbiAgICBmb3IgcGF0aCwgaSBpbiBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VQYXRocygpXG4gICAgICBwYXRoMm1ldGFkYXRhW2ZzLnJlYWxwYXRoU3luYyhwYXRoKV0gPSBwYWNrYWdlX21ldGFkYXRhW2ldXG5cbiAgICBwYWNrYWdlcyA9IFtdXG4gICAgZm9yIGksIHBrZ19uYW1lIG9mIGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKClcbiAgICAgIHBrZ19wYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgocGtnX25hbWUpXG4gICAgICBpZiBwYXRoMm1ldGFkYXRhW3BrZ19wYXRoXVxuICAgICAgICBwYWNrYWdlcy5wdXNoKHBhdGgybWV0YWRhdGFbcGtnX3BhdGhdKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmVycm9yKCdjb3VsZCBub3QgY29ycmVsYXRlIHBhY2thZ2UgbmFtZSwgcGF0aCwgYW5kIG1ldGFkYXRhJylcbiAgICBwYWNrYWdlc1xuXG4gIHJlc3RvcmU6IChjYj1udWxsKSAtPlxuICAgIEBjcmVhdGVDbGllbnQoKS5naXN0cy5nZXRcbiAgICAgIGlkOiBAZ2V0R2lzdElkKClcbiAgICAsIChlcnIsIHJlcykgPT5cbiAgICAgIGlmIGVyclxuICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZ2lzdC4gZG9lcyBpdCBleGlzdHM/XCIsIGVyclxuICAgICAgICB0cnlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlcnIubWVzc2FnZSkubWVzc2FnZVxuICAgICAgICAgIG1lc3NhZ2UgPSAnR2lzdCBJRCBOb3QgRm91bmQnIGlmIG1lc3NhZ2UgaXMgJ05vdCBGb3VuZCdcbiAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgICByZXR1cm5cblxuICAgICAgY2FsbGJhY2tBc3luYyA9IGZhbHNlXG5cbiAgICAgIGZvciBvd24gZmlsZW5hbWUsIGZpbGUgb2YgcmVzLmZpbGVzXG4gICAgICAgIHN3aXRjaCBmaWxlbmFtZVxuICAgICAgICAgIHdoZW4gJ3NldHRpbmdzLmpzb24nXG4gICAgICAgICAgICBAYXBwbHlTZXR0aW5ncyAnJywgSlNPTi5wYXJzZShmaWxlLmNvbnRlbnQpIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU2V0dGluZ3MnKVxuXG4gICAgICAgICAgd2hlbiAncGFja2FnZXMuanNvbidcbiAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jUGFja2FnZXMnKVxuICAgICAgICAgICAgICBjYWxsYmFja0FzeW5jID0gdHJ1ZVxuICAgICAgICAgICAgICBAaW5zdGFsbE1pc3NpbmdQYWNrYWdlcyBKU09OLnBhcnNlKGZpbGUuY29udGVudCksIGNiXG4gICAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5yZW1vdmVPYnNvbGV0ZVBhY2thZ2UnKVxuICAgICAgICAgICAgICAgIEByZW1vdmVPYnNvbGV0ZVBhY2thZ2VzIEpTT04ucGFyc2UoZmlsZS5jb250ZW50KSwgY2JcblxuICAgICAgICAgIHdoZW4gJ2tleW1hcC5jc29uJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmtleW1hcHMuZ2V0VXNlcktleW1hcFBhdGgoKSwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jS2V5bWFwJylcblxuICAgICAgICAgIHdoZW4gJ3N0eWxlcy5sZXNzJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLnN0eWxlcy5nZXRVc2VyU3R5bGVTaGVldFBhdGgoKSwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU3R5bGVzJylcblxuICAgICAgICAgIHdoZW4gJ2luaXQuY29mZmVlJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvaW5pdC5jb2ZmZWVcIiwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jSW5pdCcpXG5cbiAgICAgICAgICB3aGVuICdpbml0LmpzJ1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvaW5pdC5qc1wiLCBmaWxlLmNvbnRlbnQgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNJbml0JylcblxuICAgICAgICAgIHdoZW4gJ3NuaXBwZXRzLmNzb24nXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9zbmlwcGV0cy5jc29uXCIsIGZpbGUuY29udGVudCBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1NuaXBwZXRzJylcblxuICAgICAgICAgIGVsc2UgZnMud3JpdGVGaWxlU3luYyBcIiN7YXRvbS5jb25maWcuY29uZmlnRGlyUGF0aH0vI3tmaWxlbmFtZX1cIiwgZmlsZS5jb250ZW50XG5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnc3luYy1zZXR0aW5ncy5fbGFzdEJhY2t1cEhhc2gnLCByZXMuaGlzdG9yeVswXS52ZXJzaW9uKVxuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcInN5bmMtc2V0dGluZ3M6IFlvdXIgc2V0dGluZ3Mgd2VyZSBzdWNjZXNzZnVsbHkgc3luY2hyb25pemVkLlwiXG5cbiAgICAgIGNiPygpIHVubGVzcyBjYWxsYmFja0FzeW5jXG5cbiAgY3JlYXRlQ2xpZW50OiAtPlxuICAgIHRva2VuID0gQGdldFBlcnNvbmFsQWNjZXNzVG9rZW4oKVxuICAgIGNvbnNvbGUuZGVidWcgXCJDcmVhdGluZyBHaXRIdWJBcGkgY2xpZW50IHdpdGggdG9rZW4gPSAje3Rva2VufVwiXG4gICAgZ2l0aHViID0gbmV3IEdpdEh1YkFwaVxuICAgICAgdmVyc2lvbjogJzMuMC4wJ1xuICAgICAgIyBkZWJ1ZzogdHJ1ZVxuICAgICAgcHJvdG9jb2w6ICdodHRwcydcbiAgICBnaXRodWIuYXV0aGVudGljYXRlXG4gICAgICB0eXBlOiAnb2F1dGgnXG4gICAgICB0b2tlbjogdG9rZW5cbiAgICBnaXRodWJcblxuICBnZXRGaWx0ZXJlZFNldHRpbmdzOiAtPlxuICAgICMgXy5jbG9uZSgpIGRvZXNuJ3QgZGVlcCBjbG9uZSB0aHVzIHdlIGFyZSB1c2luZyBKU09OIHBhcnNlIHRyaWNrXG4gICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGF0b20uY29uZmlnLnNldHRpbmdzKSlcbiAgICBibGFja2xpc3RlZEtleXMgPSBSRU1PVkVfS0VZUy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLmJsYWNrbGlzdGVkS2V5cycpID8gW10pXG4gICAgZm9yIGJsYWNrbGlzdGVkS2V5IGluIGJsYWNrbGlzdGVkS2V5c1xuICAgICAgYmxhY2tsaXN0ZWRLZXkgPSBibGFja2xpc3RlZEtleS5zcGxpdChcIi5cIilcbiAgICAgIEBfcmVtb3ZlUHJvcGVydHkoc2V0dGluZ3MsIGJsYWNrbGlzdGVkS2V5KVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgJ1xcdCcpXG5cbiAgX3JlbW92ZVByb3BlcnR5OiAob2JqLCBrZXkpIC0+XG4gICAgbGFzdEtleSA9IGtleS5sZW5ndGggaXMgMVxuICAgIGN1cnJlbnRLZXkgPSBrZXkuc2hpZnQoKVxuXG4gICAgaWYgbm90IGxhc3RLZXkgYW5kIF8uaXNPYmplY3Qob2JqW2N1cnJlbnRLZXldKSBhbmQgbm90IF8uaXNBcnJheShvYmpbY3VycmVudEtleV0pXG4gICAgICBAX3JlbW92ZVByb3BlcnR5KG9ialtjdXJyZW50S2V5XSwga2V5KVxuICAgIGVsc2VcbiAgICAgIGRlbGV0ZSBvYmpbY3VycmVudEtleV1cblxuICBnb1RvUGFja2FnZVNldHRpbmdzOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oXCJhdG9tOi8vY29uZmlnL3BhY2thZ2VzL3N5bmMtc2V0dGluZ3NcIilcblxuICBhcHBseVNldHRpbmdzOiAocHJlZiwgc2V0dGluZ3MpIC0+XG4gICAgZm9yIGtleSwgdmFsdWUgb2Ygc2V0dGluZ3NcbiAgICAgIGtleVBhdGggPSBcIiN7cHJlZn0uI3trZXl9XCJcbiAgICAgIGlzQ29sb3IgPSBmYWxzZVxuICAgICAgaWYgXy5pc09iamVjdCh2YWx1ZSlcbiAgICAgICAgdmFsdWVLZXlzID0gT2JqZWN0LmtleXModmFsdWUpXG4gICAgICAgIGNvbG9yS2V5cyA9IFsnYWxwaGEnLCAnYmx1ZScsICdncmVlbicsICdyZWQnXVxuICAgICAgICBpc0NvbG9yID0gXy5pc0VxdWFsKF8uc29ydEJ5KHZhbHVlS2V5cyksIGNvbG9yS2V5cylcbiAgICAgIGlmIF8uaXNPYmplY3QodmFsdWUpIGFuZCBub3QgXy5pc0FycmF5KHZhbHVlKSBhbmQgbm90IGlzQ29sb3JcbiAgICAgICAgQGFwcGx5U2V0dGluZ3Mga2V5UGF0aCwgdmFsdWVcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5kZWJ1ZyBcImNvbmZpZy5zZXQgI3trZXlQYXRoWzEuLi5dfT0je3ZhbHVlfVwiXG4gICAgICAgIGF0b20uY29uZmlnLnNldCBrZXlQYXRoWzEuLi5dLCB2YWx1ZVxuXG4gIHJlbW92ZU9ic29sZXRlUGFja2FnZXM6IChyZW1haW5pbmdfcGFja2FnZXMsIGNiKSAtPlxuICAgIGluc3RhbGxlZF9wYWNrYWdlcyA9IEBnZXRQYWNrYWdlcygpXG4gICAgb2Jzb2xldGVfcGFja2FnZXMgPSBbXVxuICAgIGZvciBwa2cgaW4gaW5zdGFsbGVkX3BhY2thZ2VzXG4gICAgICBrZWVwX2luc3RhbGxlZF9wYWNrYWdlID0gKHAgZm9yIHAgaW4gcmVtYWluaW5nX3BhY2thZ2VzIHdoZW4gcC5uYW1lIGlzIHBrZy5uYW1lKVxuICAgICAgaWYga2VlcF9pbnN0YWxsZWRfcGFja2FnZS5sZW5ndGggaXMgMFxuICAgICAgICBvYnNvbGV0ZV9wYWNrYWdlcy5wdXNoKHBrZylcbiAgICBpZiBvYnNvbGV0ZV9wYWNrYWdlcy5sZW5ndGggaXMgMFxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJTeW5jLXNldHRpbmdzOiBubyBwYWNrYWdlcyB0byByZW1vdmVcIlxuICAgICAgcmV0dXJuIGNiPygpXG5cbiAgICBub3RpZmljYXRpb25zID0ge31cbiAgICBzdWNjZWVkZWQgPSBbXVxuICAgIGZhaWxlZCA9IFtdXG4gICAgcmVtb3ZlTmV4dFBhY2thZ2UgPSA9PlxuICAgICAgaWYgb2Jzb2xldGVfcGFja2FnZXMubGVuZ3RoID4gMFxuICAgICAgICAjIHN0YXJ0IHJlbW92aW5nIG5leHQgcGFja2FnZVxuICAgICAgICBwa2cgPSBvYnNvbGV0ZV9wYWNrYWdlcy5zaGlmdCgpXG4gICAgICAgIGkgPSBzdWNjZWVkZWQubGVuZ3RoICsgZmFpbGVkLmxlbmd0aCArIE9iamVjdC5rZXlzKG5vdGlmaWNhdGlvbnMpLmxlbmd0aCArIDFcbiAgICAgICAgY291bnQgPSBpICsgb2Jzb2xldGVfcGFja2FnZXMubGVuZ3RoXG4gICAgICAgIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJTeW5jLXNldHRpbmdzOiByZW1vdmluZyAje3BrZy5uYW1lfSAoI3tpfS8je2NvdW50fSlcIiwge2Rpc21pc3NhYmxlOiB0cnVlfVxuICAgICAgICBkbyAocGtnKSA9PlxuICAgICAgICAgIEByZW1vdmVQYWNrYWdlIHBrZywgKGVycm9yKSAtPlxuICAgICAgICAgICAgIyByZW1vdmFsIG9mIHBhY2thZ2UgZmluaXNoZWRcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdLmRpc21pc3MoKVxuICAgICAgICAgICAgZGVsZXRlIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdXG4gICAgICAgICAgICBpZiBlcnJvcj9cbiAgICAgICAgICAgICAgZmFpbGVkLnB1c2gocGtnLm5hbWUpXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiU3luYy1zZXR0aW5nczogZmFpbGVkIHRvIHJlbW92ZSAje3BrZy5uYW1lfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN1Y2NlZWRlZC5wdXNoKHBrZy5uYW1lKVxuICAgICAgICAgICAgIyB0cmlnZ2VyIG5leHQgcGFja2FnZVxuICAgICAgICAgICAgcmVtb3ZlTmV4dFBhY2thZ2UoKVxuICAgICAgZWxzZSBpZiBPYmplY3Qua2V5cyhub3RpZmljYXRpb25zKS5sZW5ndGggaXMgMFxuICAgICAgICAjIGxhc3QgcGFja2FnZSByZW1vdmFsIGZpbmlzaGVkXG4gICAgICAgIGlmIGZhaWxlZC5sZW5ndGggaXMgMFxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwiU3luYy1zZXR0aW5nczogZmluaXNoZWQgcmVtb3ZpbmcgI3tzdWNjZWVkZWQubGVuZ3RofSBwYWNrYWdlc1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWlsZWQuc29ydCgpXG4gICAgICAgICAgZmFpbGVkU3RyID0gZmFpbGVkLmpvaW4oJywgJylcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlN5bmMtc2V0dGluZ3M6IGZpbmlzaGVkIHJlbW92aW5nIHBhY2thZ2VzICgje2ZhaWxlZC5sZW5ndGh9IGZhaWxlZDogI3tmYWlsZWRTdHJ9KVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgIGNiPygpXG4gICAgIyBzdGFydCBhcyBtYW55IHBhY2thZ2UgcmVtb3ZhbCBpbiBwYXJhbGxlbCBhcyBkZXNpcmVkXG4gICAgY29uY3VycmVuY3kgPSBNYXRoLm1pbiBvYnNvbGV0ZV9wYWNrYWdlcy5sZW5ndGgsIDhcbiAgICBmb3IgaSBpbiBbMC4uLmNvbmN1cnJlbmN5XVxuICAgICAgcmVtb3ZlTmV4dFBhY2thZ2UoKVxuXG4gIHJlbW92ZVBhY2thZ2U6IChwYWNrLCBjYikgLT5cbiAgICB0eXBlID0gaWYgcGFjay50aGVtZSB0aGVuICd0aGVtZScgZWxzZSAncGFja2FnZSdcbiAgICBjb25zb2xlLmluZm8oXCJSZW1vdmluZyAje3R5cGV9ICN7cGFjay5uYW1lfS4uLlwiKVxuICAgIHBhY2thZ2VNYW5hZ2VyID0gbmV3IFBhY2thZ2VNYW5hZ2VyKClcbiAgICBwYWNrYWdlTWFuYWdlci51bmluc3RhbGwgcGFjaywgKGVycm9yKSAtPlxuICAgICAgaWYgZXJyb3I/XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJSZW1vdmluZyAje3R5cGV9ICN7cGFjay5uYW1lfSBmYWlsZWRcIiwgZXJyb3Iuc3RhY2sgPyBlcnJvciwgZXJyb3Iuc3RkZXJyKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJSZW1vdmluZyAje3R5cGV9ICN7cGFjay5uYW1lfVwiKVxuICAgICAgY2I/KGVycm9yKVxuXG4gIGluc3RhbGxNaXNzaW5nUGFja2FnZXM6IChwYWNrYWdlcywgY2IpIC0+XG4gICAgYXZhaWxhYmxlX3BhY2thZ2VzID0gQGdldFBhY2thZ2VzKClcbiAgICBtaXNzaW5nX3BhY2thZ2VzID0gW11cbiAgICBmb3IgcGtnIGluIHBhY2thZ2VzXG4gICAgICBhdmFpbGFibGVfcGFja2FnZSA9IChwIGZvciBwIGluIGF2YWlsYWJsZV9wYWNrYWdlcyB3aGVuIHAubmFtZSBpcyBwa2cubmFtZSlcbiAgICAgIGlmIGF2YWlsYWJsZV9wYWNrYWdlLmxlbmd0aCBpcyAwXG4gICAgICAgICMgbWlzc2luZyBpZiBub3QgeWV0IGluc3RhbGxlZFxuICAgICAgICBtaXNzaW5nX3BhY2thZ2VzLnB1c2gocGtnKVxuICAgICAgZWxzZSBpZiBub3QoISFwa2cuYXBtSW5zdGFsbFNvdXJjZSBpcyAhIWF2YWlsYWJsZV9wYWNrYWdlWzBdLmFwbUluc3RhbGxTb3VyY2UpXG4gICAgICAgICMgb3IgaW5zdGFsbGVkIGJ1dCB3aXRoIGRpZmZlcmVudCBhcG0gaW5zdGFsbCBzb3VyY2VcbiAgICAgICAgbWlzc2luZ19wYWNrYWdlcy5wdXNoKHBrZylcbiAgICBpZiBtaXNzaW5nX3BhY2thZ2VzLmxlbmd0aCBpcyAwXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIlN5bmMtc2V0dGluZ3M6IG5vIHBhY2thZ2VzIHRvIGluc3RhbGxcIlxuICAgICAgcmV0dXJuIGNiPygpXG5cbiAgICBub3RpZmljYXRpb25zID0ge31cbiAgICBzdWNjZWVkZWQgPSBbXVxuICAgIGZhaWxlZCA9IFtdXG4gICAgaW5zdGFsbE5leHRQYWNrYWdlID0gPT5cbiAgICAgIGlmIG1pc3NpbmdfcGFja2FnZXMubGVuZ3RoID4gMFxuICAgICAgICAjIHN0YXJ0IGluc3RhbGxpbmcgbmV4dCBwYWNrYWdlXG4gICAgICAgIHBrZyA9IG1pc3NpbmdfcGFja2FnZXMuc2hpZnQoKVxuICAgICAgICBpID0gc3VjY2VlZGVkLmxlbmd0aCArIGZhaWxlZC5sZW5ndGggKyBPYmplY3Qua2V5cyhub3RpZmljYXRpb25zKS5sZW5ndGggKyAxXG4gICAgICAgIGNvdW50ID0gaSArIG1pc3NpbmdfcGFja2FnZXMubGVuZ3RoXG4gICAgICAgIG5vdGlmaWNhdGlvbnNbcGtnLm5hbWVdID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJTeW5jLXNldHRpbmdzOiBpbnN0YWxsaW5nICN7cGtnLm5hbWV9ICgje2l9LyN7Y291bnR9KVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgIGRvIChwa2cpID0+XG4gICAgICAgICAgQGluc3RhbGxQYWNrYWdlIHBrZywgKGVycm9yKSAtPlxuICAgICAgICAgICAgIyBpbnN0YWxsYXRpb24gb2YgcGFja2FnZSBmaW5pc2hlZFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uc1twa2cubmFtZV0uZGlzbWlzcygpXG4gICAgICAgICAgICBkZWxldGUgbm90aWZpY2F0aW9uc1twa2cubmFtZV1cbiAgICAgICAgICAgIGlmIGVycm9yP1xuICAgICAgICAgICAgICBmYWlsZWQucHVzaChwa2cubmFtZSlcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJTeW5jLXNldHRpbmdzOiBmYWlsZWQgdG8gaW5zdGFsbCAje3BrZy5uYW1lfVwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN1Y2NlZWRlZC5wdXNoKHBrZy5uYW1lKVxuICAgICAgICAgICAgIyB0cmlnZ2VyIG5leHQgcGFja2FnZVxuICAgICAgICAgICAgaW5zdGFsbE5leHRQYWNrYWdlKClcbiAgICAgIGVsc2UgaWYgT2JqZWN0LmtleXMobm90aWZpY2F0aW9ucykubGVuZ3RoIGlzIDBcbiAgICAgICAgIyBsYXN0IHBhY2thZ2UgaW5zdGFsbGF0aW9uIGZpbmlzaGVkXG4gICAgICAgIGlmIGZhaWxlZC5sZW5ndGggaXMgMFxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwiU3luYy1zZXR0aW5nczogZmluaXNoZWQgaW5zdGFsbGluZyAje3N1Y2NlZWRlZC5sZW5ndGh9IHBhY2thZ2VzXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhaWxlZC5zb3J0KClcbiAgICAgICAgICBmYWlsZWRTdHIgPSBmYWlsZWQuam9pbignLCAnKVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiU3luYy1zZXR0aW5nczogZmluaXNoZWQgaW5zdGFsbGluZyBwYWNrYWdlcyAoI3tmYWlsZWQubGVuZ3RofSBmYWlsZWQ6ICN7ZmFpbGVkU3RyfSlcIiwge2Rpc21pc3NhYmxlOiB0cnVlfVxuICAgICAgICBjYj8oKVxuICAgICMgc3RhcnQgYXMgbWFueSBwYWNrYWdlIGluc3RhbGxhdGlvbnMgaW4gcGFyYWxsZWwgYXMgZGVzaXJlZFxuICAgIGNvbmN1cnJlbmN5ID0gTWF0aC5taW4gbWlzc2luZ19wYWNrYWdlcy5sZW5ndGgsIDhcbiAgICBmb3IgaSBpbiBbMC4uLmNvbmN1cnJlbmN5XVxuICAgICAgaW5zdGFsbE5leHRQYWNrYWdlKClcblxuICBpbnN0YWxsUGFja2FnZTogKHBhY2ssIGNiKSAtPlxuICAgIHR5cGUgPSBpZiBwYWNrLnRoZW1lIHRoZW4gJ3RoZW1lJyBlbHNlICdwYWNrYWdlJ1xuICAgIGNvbnNvbGUuaW5mbyhcIkluc3RhbGxpbmcgI3t0eXBlfSAje3BhY2submFtZX0uLi5cIilcbiAgICBwYWNrYWdlTWFuYWdlciA9IG5ldyBQYWNrYWdlTWFuYWdlcigpXG4gICAgcGFja2FnZU1hbmFnZXIuaW5zdGFsbCBwYWNrLCAoZXJyb3IpIC0+XG4gICAgICBpZiBlcnJvcj9cbiAgICAgICAgY29uc29sZS5lcnJvcihcIkluc3RhbGxpbmcgI3t0eXBlfSAje3BhY2submFtZX0gZmFpbGVkXCIsIGVycm9yLnN0YWNrID8gZXJyb3IsIGVycm9yLnN0ZGVycilcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5pbmZvKFwiSW5zdGFsbGVkICN7dHlwZX0gI3twYWNrLm5hbWV9XCIpXG4gICAgICBjYj8oZXJyb3IpXG5cbiAgZmlsZUNvbnRlbnQ6IChmaWxlUGF0aCkgLT5cbiAgICB0cnlcbiAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtlbmNvZGluZzogJ3V0ZjgnfSkgb3IgbnVsbFxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciByZWFkaW5nIGZpbGUgI3tmaWxlUGF0aH0uIFByb2JhYmx5IGRvZXNuJ3QgZXhpc3QuXCIsIGVcbiAgICAgIG51bGxcblxuICBpbnB1dEZvcmtHaXN0SWQ6IC0+XG4gICAgRm9ya0dpc3RJZElucHV0VmlldyA/PSByZXF1aXJlICcuL2ZvcmstZ2lzdGlkLWlucHV0LXZpZXcnXG4gICAgQGlucHV0VmlldyA9IG5ldyBGb3JrR2lzdElkSW5wdXRWaWV3KClcbiAgICBAaW5wdXRWaWV3LnNldENhbGxiYWNrSW5zdGFuY2UodGhpcylcblxuICBmb3JrR2lzdElkOiAoZm9ya0lkKSAtPlxuICAgIEBjcmVhdGVDbGllbnQoKS5naXN0cy5mb3JrXG4gICAgICBpZDogZm9ya0lkXG4gICAgLCAoZXJyLCByZXMpIC0+XG4gICAgICBpZiBlcnJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXJyLm1lc3NhZ2UpLm1lc3NhZ2VcbiAgICAgICAgICBtZXNzYWdlID0gXCJHaXN0IElEIE5vdCBGb3VuZFwiIGlmIG1lc3NhZ2UgaXMgXCJOb3QgRm91bmRcIlxuICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciBmb3JraW5nIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgICByZXR1cm4gY2I/KClcblxuICAgICAgaWYgcmVzLmlkXG4gICAgICAgIGF0b20uY29uZmlnLnNldCBcInN5bmMtc2V0dGluZ3MuZ2lzdElkXCIsIHJlcy5pZFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcInN5bmMtc2V0dGluZ3M6IEZvcmtlZCBzdWNjZXNzZnVsbHkgdG8gdGhlIG5ldyBHaXN0IElEIFwiICsgcmVzLmlkICsgXCIgd2hpY2ggaGFzIGJlZW4gc2F2ZWQgdG8geW91ciBjb25maWcuXCJcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgZm9ya2luZyBzZXR0aW5nc1wiXG5cbiAgICAgIGNiPygpXG5cbm1vZHVsZS5leHBvcnRzID0gU3luY1NldHRpbmdzXG4iXX0=
