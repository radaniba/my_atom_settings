(function() {
  var BufferedProcess, DESCRIPTION, ForkGistIdInputView, GitHubApi, PackageManager, REMOVE_KEYS, SyncSettings, Tracker, fs, _, _ref,
    __hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  _ = require('underscore-plus');

  _ref = [], GitHubApi = _ref[0], PackageManager = _ref[1], Tracker = _ref[2];

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
            GitHubApi = require('github4');
          }
          if (PackageManager == null) {
            PackageManager = require('./package-manager');
          }
          if (Tracker == null) {
            Tracker = require('./tracker');
          }
          atom.commands.add('atom-workspace', "sync-settings:backup", function() {
            _this.backup();
            return _this.tracker.track('Backup');
          });
          atom.commands.add('atom-workspace', "sync-settings:restore", function() {
            _this.restore();
            return _this.tracker.track('Restore');
          });
          atom.commands.add('atom-workspace', "sync-settings:view-backup", function() {
            _this.viewBackup();
            return _this.tracker.track('View backup');
          });
          atom.commands.add('atom-workspace', "sync-settings:check-backup", function() {
            _this.checkForUpdate();
            return _this.tracker.track('Check backup');
          });
          atom.commands.add('atom-workspace', "sync-settings:fork", function() {
            return _this.inputForkGistId();
          });
          mandatorySettingsApplied = _this.checkMandatorySettings();
          if (atom.config.get('sync-settings.checkForUpdatedBackup') && mandatorySettingsApplied) {
            _this.checkForUpdate();
          }
          _this.tracker = new Tracker('sync-settings._analyticsUserId', 'sync-settings.analytics');
          return _this.tracker.trackActivate();
        };
      })(this));
    },
    deactivate: function() {
      var _ref1;
      if ((_ref1 = this.inputView) != null) {
        _ref1.destroy();
      }
      return this.tracker.trackDeactivate();
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
            var SyntaxError, message;
            console.debug(err, res);
            if (err) {
              console.error("error while retrieving the gist. does it exists?", err);
              try {
                message = JSON.parse(err.message).message;
                if (message === 'Not Found') {
                  message = 'Gist ID Not Found';
                }
              } catch (_error) {
                SyntaxError = _error;
                message = err.message;
              }
              atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
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
      var cmtend, cmtstart, ext, file, files, _i, _len, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
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
          content: (_ref1 = this.fileContent(atom.keymaps.getUserKeymapPath())) != null ? _ref1 : "# keymap file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncStyles')) {
        files["styles.less"] = {
          content: (_ref2 = this.fileContent(atom.styles.getUserStyleSheetPath())) != null ? _ref2 : "// styles file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncInit')) {
        files["init.coffee"] = {
          content: (_ref3 = this.fileContent(atom.config.configDirPath + "/init.coffee")) != null ? _ref3 : "# initialization file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncSnippets')) {
        files["snippets.cson"] = {
          content: (_ref4 = this.fileContent(atom.config.configDirPath + "/snippets.cson")) != null ? _ref4 : "# snippets file (not found)"
        };
      }
      _ref6 = (_ref5 = atom.config.get('sync-settings.extraFiles')) != null ? _ref5 : [];
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        file = _ref6[_i];
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
          content: (_ref7 = this.fileContent(atom.config.configDirPath + ("/" + file))) != null ? _ref7 : "" + cmtstart + " " + file + " (not found) " + cmtend
        };
      }
      return this.createClient().gists.edit({
        id: this.getGistId(),
        description: atom.config.get('sync-settings.gistDescription'),
        files: files
      }, function(err, res) {
        var message;
        if (err) {
          console.error("error backing up data: " + err.message, err);
          message = JSON.parse(err.message).message;
          if (message === 'Not Found') {
            message = 'Gist ID Not Found';
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
      var info, name, packages, theme, version, _ref1, _ref2;
      packages = [];
      _ref1 = atom.packages.getLoadedPackages();
      for (name in _ref1) {
        if (!__hasProp.call(_ref1, name)) continue;
        info = _ref1[name];
        _ref2 = info.metadata, name = _ref2.name, version = _ref2.version, theme = _ref2.theme;
        packages.push({
          name: name,
          version: version,
          theme: theme
        });
      }
      return _.sortBy(packages, 'name');
    },
    restore: function(cb) {
      if (cb == null) {
        cb = null;
      }
      return this.createClient().gists.get({
        id: this.getGistId()
      }, (function(_this) {
        return function(err, res) {
          var callbackAsync, file, filename, message, _ref1;
          if (err) {
            console.error("error while retrieving the gist. does it exists?", err);
            message = JSON.parse(err.message).message;
            if (message === 'Not Found') {
              message = 'Gist ID Not Found';
            }
            atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
            return;
          }
          callbackAsync = false;
          _ref1 = res.files;
          for (filename in _ref1) {
            if (!__hasProp.call(_ref1, filename)) continue;
            file = _ref1[filename];
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
                fs.writeFileSync("" + atom.config.configDirPath + "/" + filename, file.content);
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
      var blacklistedKey, blacklistedKeys, settings, _i, _len, _ref1;
      settings = JSON.parse(JSON.stringify(atom.config.settings));
      blacklistedKeys = REMOVE_KEYS.concat((_ref1 = atom.config.get('sync-settings.blacklistedKeys')) != null ? _ref1 : []);
      for (_i = 0, _len = blacklistedKeys.length; _i < _len; _i++) {
        blacklistedKey = blacklistedKeys[_i];
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
      var colorKeys, isColor, key, keyPath, value, valueKeys, _results;
      _results = [];
      for (key in settings) {
        value = settings[key];
        keyPath = "" + pref + "." + key;
        isColor = false;
        if (_.isObject(value)) {
          valueKeys = Object.keys(value);
          colorKeys = ['alpha', 'blue', 'green', 'red'];
          isColor = _.isEqual(_.sortBy(valueKeys), colorKeys);
        }
        if (_.isObject(value) && !_.isArray(value) && !isColor) {
          _results.push(this.applySettings(keyPath, value));
        } else {
          console.debug("config.set " + keyPath.slice(1) + "=" + value);
          _results.push(atom.config.set(keyPath.slice(1), value));
        }
      }
      return _results;
    },
    installMissingPackages: function(packages, cb) {
      var pending, pkg, _i, _len;
      pending = 0;
      for (_i = 0, _len = packages.length; _i < _len; _i++) {
        pkg = packages[_i];
        if (atom.packages.isPackageLoaded(pkg.name)) {
          continue;
        }
        pending++;
        this.installPackage(pkg, function() {
          pending--;
          if (pending === 0) {
            return typeof cb === "function" ? cb() : void 0;
          }
        });
      }
      if (pending === 0) {
        return typeof cb === "function" ? cb() : void 0;
      }
    },
    installPackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Installing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.install(pack, function(error) {
        var _ref1;
        if (error != null) {
          console.error("Installing " + type + " " + pack.name + " failed", (_ref1 = error.stack) != null ? _ref1 : error, error.stderr);
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
      } catch (_error) {
        e = _error;
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
      this.tracker.track('Fork');
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
            } catch (_error) {
              SyntaxError = _error;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9zeW5jLXNldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw2SEFBQTtJQUFBLDZCQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLE9BQXVDLEVBQXZDLEVBQUMsbUJBQUQsRUFBWSx3QkFBWixFQUE0QixpQkFINUIsQ0FBQTs7QUFBQSxFQUlBLG1CQUFBLEdBQXNCLElBSnRCLENBQUE7O0FBQUEsRUFPQSxXQUFBLEdBQWMsOEVBUGQsQ0FBQTs7QUFBQSxFQVFBLFdBQUEsR0FBYyxDQUNaLHNCQURZLEVBRVosbUNBRlksRUFHWixnQ0FIWSxFQUlaLCtCQUpZLENBUmQsQ0FBQTs7QUFBQSxFQWVBLFlBQUEsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUFSO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBRVIsWUFBQSxDQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFFWCxjQUFBLHdCQUFBOztZQUFBLFlBQWEsT0FBQSxDQUFRLFNBQVI7V0FBYjs7WUFDQSxpQkFBa0IsT0FBQSxDQUFRLG1CQUFSO1dBRGxCOztZQUVBLFVBQVcsT0FBQSxDQUFRLFdBQVI7V0FGWDtBQUFBLFVBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxzQkFBcEMsRUFBNEQsU0FBQSxHQUFBO0FBQzFELFlBQUEsS0FBQyxD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

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/lib/sync-settings.coffee
