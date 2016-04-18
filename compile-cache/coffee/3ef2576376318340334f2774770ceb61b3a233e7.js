(function() {
  var StatusInProgress, fs, namespace;

  fs = require('fs');

  namespace = require('./services/namespace.coffee');

  StatusInProgress = require("./services/status-in-progress.coffee");

  module.exports = {
    config: {},
    statusInProgress: null,

    /**
     * Get plugin configuration
     */
    getConfig: function() {
      this.config['php_documentation_base_url'] = {
        functions: 'https://secure.php.net/function.'
      };
      this.config['composer'] = atom.config.get('atom-autocomplete-php.binComposer');
      this.config['php'] = atom.config.get('atom-autocomplete-php.binPhp');
      this.config['autoload'] = atom.config.get('atom-autocomplete-php.autoloadPaths');
      this.config['classmap'] = atom.config.get('atom-autocomplete-php.classMapFiles');
      this.config['packagePath'] = atom.packages.resolvePackagePath('atom-autocomplete-php');
      this.config['verboseErrors'] = atom.config.get('atom-autocomplete-php.verboseErrors');
      return this.config['insertNewlinesForUseStatements'] = atom.config.get('atom-autocomplete-php.insertNewlinesForUseStatements');
    },

    /**
     * Writes configuration in "php lib" folder
     */
    writeConfig: function() {
      var classmap, classmaps, file, files, text, _i, _j, _len, _len1, _ref, _ref1;
      this.getConfig();
      files = "";
      _ref = this.config.autoload;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        files += "'" + file + "',";
      }
      classmaps = "";
      _ref1 = this.config.classmap;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        classmap = _ref1[_j];
        classmaps += "'" + classmap + "',";
      }
      text = "<?php $config = array( 'composer' => '" + this.config.composer + "', 'php' => '" + this.config.php + "', 'autoload' => array(" + files + "), 'classmap' => array(" + classmaps + ") );";
      return fs.writeFileSync(this.config.packagePath + '/php/tmp.php', text);
    },

    /**
     * Tests the user's PHP and Composer configuration.
     * @return {bool}
     */
    testConfig: function(interactive) {
      var errorMessage, errorTitle, exec, testResult;
      this.getConfig();
      exec = require("child_process");
      testResult = exec.spawnSync(this.config.php, ["-v"]);
      errorTitle = 'atom-autocomplete-php - Incorrect setup!';
      errorMessage = 'Either PHP or Composer is not correctly set up and as a result PHP autocompletion will not work. ' + 'Please visit the settings screen to correct this error. If you are not specifying an absolute path for PHP or ' + 'Composer, make sure they are in your PATH. Feel free to look package\'s README for configuration examples';
      if (testResult.status = null || testResult.status !== 0) {
        atom.notifications.addError(errorTitle, {
          'detail': errorMessage
        });
        return false;
      }
      testResult = exec.spawnSync(this.config.php, [this.config.composer, "--version"]);
      if (testResult.status = null || testResult.status !== 0) {
        testResult = exec.spawnSync(this.config.composer, ["--version"]);
        if (testResult.status = null || testResult.status !== 0) {
          atom.notifications.addError(errorTitle, {
            'detail': errorMessage
          });
          return false;
        }
      }
      if (interactive) {
        atom.notifications.addSuccess('atom-autocomplete-php - Success', {
          'detail': 'Configuration OK !'
        });
      }
      return true;
    },

    /**
     * Init function called on package activation
     * Register config events and write the first config
     */
    init: function() {
      this.statusInProgress = new StatusInProgress;
      this.statusInProgress.hide();
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:namespace': (function(_this) {
          return function() {
            return namespace.createNamespace(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:configuration': (function(_this) {
          return function() {
            return _this.testConfig(true);
          };
        })(this)
      });
      this.writeConfig();
      atom.config.onDidChange('atom-autocomplete-php.binPhp', (function(_this) {
        return function() {
          _this.writeConfig();
          return _this.testConfig(true);
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          _this.writeConfig();
          return _this.testConfig(true);
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.autoloadPaths', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.classMapFiles', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.verboseErrors', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      return atom.config.onDidChange('atom-autocomplete-php.insertNewlinesForUseStatements', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2NvbmZpZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0NBQVIsQ0FGbkIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRUk7QUFBQSxJQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsSUFDQSxnQkFBQSxFQUFrQixJQURsQjtBQUdBO0FBQUE7O09BSEE7QUFBQSxJQU1BLFNBQUEsRUFBVyxTQUFBLEdBQUE7QUFFUCxNQUFBLElBQUMsQ0FBQSxNQUFPLENBQUEsNEJBQUEsQ0FBUixHQUF3QztBQUFBLFFBQ3BDLFNBQUEsRUFBVyxrQ0FEeUI7T0FBeEMsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUp0QixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLENBTGpCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxNQUFPLENBQUEsVUFBQSxDQUFSLEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FOdEIsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0s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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/config.coffee
