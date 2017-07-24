(function() {
  var BufferedProcess, Emitter, PackageManager, Q, semver, url, _;

  _ = require('underscore-plus');

  BufferedProcess = require('atom').BufferedProcess;

  Emitter = require('emissary').Emitter;

  Q = require('q');

  semver = require('semver');

  url = require('url');

  Q.stopUnhandledRejectionTracking();

  module.exports = PackageManager = (function() {
    Emitter.includeInto(PackageManager);

    function PackageManager() {
      this.packagePromises = [];
    }

    PackageManager.prototype.runCommand = function(args, callback) {
      var command, errorLines, exit, outputLines, stderr, stdout;
      command = atom.packages.getApmPath();
      outputLines = [];
      stdout = function(lines) {
        return outputLines.push(lines);
      };
      errorLines = [];
      stderr = function(lines) {
        return errorLines.push(lines);
      };
      exit = function(code) {
        return callback(code, outputLines.join('\n'), errorLines.join('\n'));
      };
      args.push('--no-color');
      return new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    };

    PackageManager.prototype.loadFeatured = function(callback) {
      var args, version;
      args = ['featured', '--json'];
      version = atom.getVersion();
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, _ref;
        if (code === 0) {
          try {
            packages = (_ref = JSON.parse(stdout)) != null ? _ref : [];
          } catch (_error) {
            error = _error;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error('Fetching featured packages and themes failed.');
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.loadOutdated = function(callback) {
      var args, version;
      args = ['outdated', '--json'];
      version = atom.getVersion();
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, _ref;
        if (code === 0) {
          try {
            packages = (_ref = JSON.parse(stdout)) != null ? _ref : [];
          } catch (_error) {
            error = _error;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error('Fetching outdated packages and themes failed.');
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.loadPackage = function(packageName, callback) {
      var args;
      args = ['view', packageName, '--json'];
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, _ref;
        if (code === 0) {
          try {
            packages = (_ref = JSON.parse(stdout)) != null ? _ref : [];
          } catch (_error) {
            error = _error;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error("Fetching package '" + packageName + "' failed.");
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.getFeatured = function() {
      return this.featuredPromise != null ? this.featuredPromise : this.featuredPromise = Q.nbind(this.loadFeatured, this)();
    };

    PackageManager.prototype.getOutdated = function() {
      return this.outdatedPromise != null ? this.outdatedPromise : this.outdatedPromise = Q.nbind(this.loadOutdated, this)();
    };

    PackageManager.prototype.getPackage = function(packageName) {
      var _base;
      return (_base = this.packagePromises)[packageName] != null ? _base[packageName] : _base[packageName] = Q.nbind(this.loadPackage, this, packageName)();
    };

    PackageManager.prototype.search = function(query, options) {
      var args, deferred;
      if (options == null) {
        options = {};
      }
      deferred = Q.defer();
      args = ['search', query, '--json'];
      if (options.themes) {
        args.push('--themes');
      } else if (options.packages) {
        args.push('--packages');
      }
      this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, _ref;
        if (code === 0) {
          try {
            packages = (_ref = JSON.parse(stdout)) != null ? _ref : [];
            return deferred.resolve(packages);
          } catch (_error) {
            error = _error;
            return deferred.reject(error);
          }
        } else {
          error = new Error("Searching for \u201C" + query + "\u201D failed.");
          error.stdout = stdout;
          error.stderr = stderr;
          return deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    PackageManager.prototype.update = function(pack, newVersion, callback) {
      var activateOnFailure, activateOnSuccess, args, exit, name, theme;
      name = pack.name, theme = pack.theme;
      activateOnSuccess = !theme && !atom.packages.isPackageDisabled(name);
      activateOnFailure = atom.packages.isPackageActive(name);
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      if (atom.packages.isPackageLoaded(name)) {
        atom.packages.unloadPackage(name);
      }
      args = ['install', "" + name + "@" + newVersion];
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (activateOnSuccess) {
              atom.packages.activatePackage(name);
            } else {
              atom.packages.loadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('updated', pack);
          } else {
            if (activateOnFailure) {
              atom.packages.activatePackage(name);
            }
            error = new Error("Updating to \u201C" + name + "@" + newVersion + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            error.packageInstallError = !theme;
            _this.emitPackageEvent('update-failed', pack, error);
            return callback(error);
          }
        };
      })(this);
      this.emit('package-updating', pack);
      return this.runCommand(args, exit);
    };

    PackageManager.prototype.install = function(pack, callback) {
      var activateOnFailure, activateOnSuccess, args, exit, name, theme, version;
      name = pack.name, version = pack.version, theme = pack.theme;
      activateOnSuccess = !theme && !atom.packages.isPackageDisabled(name);
      activateOnFailure = atom.packages.isPackageActive(name);
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      if (atom.packages.isPackageLoaded(name)) {
        atom.packages.unloadPackage(name);
      }
      args = ['install', "" + name + "@" + version];
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (activateOnSuccess) {
              atom.packages.activatePackage(name);
            } else {
              atom.packages.loadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('installed', pack);
          } else {
            if (activateOnFailure) {
              atom.packages.activatePackage(name);
            }
            error = new Error("Installing \u201C" + name + "@" + version + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            error.packageInstallError = !theme;
            _this.emitPackageEvent('install-failed', pack, error);
            return callback(error);
          }
        };
      })(this);
      return this.runCommand(args, exit);
    };

    PackageManager.prototype.uninstall = function(pack, callback) {
      var name;
      name = pack.name;
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      return this.runCommand(['uninstall', '--hard', name], (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (atom.packages.isPackageLoaded(name)) {
              atom.packages.unloadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('uninstalled', pack);
          } else {
            error = new Error("Uninstalling \u201C" + name + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            _this.emitPackageEvent('uninstall-failed', pack, error);
            return callback(error);
          }
        };
      })(this));
    };

    PackageManager.prototype.canUpgrade = function(installedPackage, availableVersion) {
      var installedVersion;
      if (installedPackage == null) {
        return false;
      }
      installedVersion = installedPackage.metadata.version;
      if (!semver.valid(installedVersion)) {
        return false;
      }
      if (!semver.valid(availableVersion)) {
        return false;
      }
      return semver.gt(availableVersion, installedVersion);
    };

    PackageManager.prototype.getPackageTitle = function(_arg) {
      var name;
      name = _arg.name;
      return _.undasherize(_.uncamelcase(name));
    };

    PackageManager.prototype.getRepositoryUrl = function(_arg) {
      var metadata, repoUrl, repository, _ref, _ref1;
      metadata = _arg.metadata;
      repository = metadata.repository;
      repoUrl = (_ref = (_ref1 = repository != null ? repository.url : void 0) != null ? _ref1 : repository) != null ? _ref : '';
      return repoUrl.replace(/\.git$/, '').replace(/\/+$/, '');
    };

    PackageManager.prototype.getAuthorUserName = function(pack) {
      var chunks, repoName, repoUrl;
      if (!(repoUrl = this.getRepositoryUrl(pack))) {
        return null;
      }
      repoName = url.parse(repoUrl).pathname;
      chunks = repoName.match('/(.+?)/');
      return chunks != null ? chunks[1] : void 0;
    };

    PackageManager.prototype.checkNativeBuildTools = function() {
      var deferred;
      deferred = Q.defer();
      this.runCommand(['install', '--check'], function(code, stdout, stderr) {
        if (code === 0) {
          return deferred.resolve();
        } else {
          return deferred.reject(new Error());
        }
      });
      return deferred.promise;
    };

    PackageManager.prototype.emitPackageEvent = function(eventName, pack, error) {
      var theme, _ref, _ref1;
      theme = (_ref = pack.theme) != null ? _ref : (_ref1 = pack.metadata) != null ? _ref1.theme : void 0;
      eventName = theme ? "theme-" + eventName : "package-" + eventName;
      return this.emit(eventName, pack, error);
    };

    return PackageManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9wYWNrYWdlLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFERCxDQUFBOztBQUFBLEVBRUMsVUFBVyxPQUFBLENBQVEsVUFBUixFQUFYLE9BRkQsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FKVCxDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU9BLENBQUMsQ0FBQyw4QkFBRixDQUFBLENBUEEsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGNBQXBCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLHdCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEVBQW5CLENBRFc7SUFBQSxDQUZiOztBQUFBLDZCQUtBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDVixVQUFBLHNEQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFkLENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsRUFEZCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7ZUFBVyxXQUFXLENBQUMsSUFBWixDQUFpQixLQUFqQixFQUFYO01BQUEs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

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/lib/package-manager.coffee
