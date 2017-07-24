(function() {
  var StatusErrorAutocomplete, StatusInProgress, fs, namespace;

  fs = require('fs');

  namespace = require('./services/namespace.coffee');

  StatusInProgress = require("./services/status-in-progress.coffee");

  StatusErrorAutocomplete = require("./services/status-error-autocomplete.coffee");

  module.exports = {
    config: {},
    statusInProgress: null,
    statusErrorAutocomplete: null,

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
      var classmap, classmaps, file, files, i, j, len, len1, ref, ref1, text;
      this.getConfig();
      files = "";
      ref = this.config.autoload;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        files += "'" + file + "',";
      }
      classmaps = "";
      ref1 = this.config.classmap;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        classmap = ref1[j];
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
      this.statusErrorAutocomplete = new StatusErrorAutocomplete;
      this.statusErrorAutocomplete.hide();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxTQUFBLEdBQVksT0FBQSxDQUFRLDZCQUFSOztFQUNaLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQ0FBUjs7RUFDbkIsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLDZDQUFSOztFQUUxQixNQUFNLENBQUMsT0FBUCxHQUVJO0lBQUEsTUFBQSxFQUFRLEVBQVI7SUFDQSxnQkFBQSxFQUFrQixJQURsQjtJQUVBLHVCQUFBLEVBQXlCLElBRnpCOztBQUlBOzs7SUFHQSxTQUFBLEVBQVcsU0FBQTtNQUVQLElBQUMsQ0FBQSxNQUFPLENBQUEsNEJBQUEsQ0FBUixHQUF3QztRQUNwQyxTQUFBLEVBQVcsa0NBRHlCOztNQUl4QyxJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBUixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCO01BQ3RCLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQSxDQUFSLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEI7TUFDakIsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQjtNQUN0QixJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBUixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCO01BQ3RCLElBQUMsQ0FBQSxNQUFPLENBQUEsYUFBQSxDQUFSLEdBQXlCLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWQsQ0FBaUMsdUJBQWpDO01BQ3pCLElBQUMsQ0FBQSxNQUFPLENBQUEsZUFBQSxDQUFSLEdBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEI7YUFDM0IsSUFBQyxDQUFBLE1BQU8sQ0FBQSxnQ0FBQSxDQUFSLEdBQTRDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzREFBaEI7SUFackMsQ0FQWDs7QUFxQkE7OztJQUdBLFdBQUEsRUFBYSxTQUFBO0FBQ1QsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELENBQUE7TUFFQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFdBQUEscUNBQUE7O1FBQ0ksS0FBQSxJQUFTLEdBQUEsR0FBSSxJQUFKLEdBQVM7QUFEdEI7TUFHQSxTQUFBLEdBQVk7QUFDWjtBQUFBLFdBQUEsd0NBQUE7O1FBQ0ksU0FBQSxJQUFhLEdBQUEsR0FBSSxRQUFKLEdBQWE7QUFEOUI7TUFHQSxJQUFBLEdBQU8sd0NBQUEsR0FFYyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBRnRCLEdBRStCLGVBRi9CLEdBR1MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUhqQixHQUdxQix5QkFIckIsR0FJbUIsS0FKbkIsR0FJeUIseUJBSnpCLEdBS21CLFNBTG5CLEdBSzZCO2FBSXBDLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQixjQUF2QyxFQUF1RCxJQUF2RDtJQXBCUyxDQXhCYjs7QUE4Q0E7Ozs7SUFJQSxVQUFBLEVBQVksU0FBQyxXQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELENBQUE7TUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVI7TUFDUCxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQXZCLEVBQTRCLENBQUMsSUFBRCxDQUE1QjtNQUViLFVBQUEsR0FBYTtNQUNiLFlBQUEsR0FBZSxtR0FBQSxHQUNiLGdIQURhLEdBRWI7TUFHRixJQUFHLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLElBQUEsSUFBUSxVQUFVLENBQUMsTUFBWCxLQUFxQixDQUFwRDtRQUNJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsVUFBNUIsRUFBd0M7VUFBQyxRQUFBLEVBQVUsWUFBWDtTQUF4QztBQUNBLGVBQU8sTUFGWDs7TUFLQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQXZCLEVBQTRCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFULEVBQW1CLFdBQW5CLENBQTVCO01BRWIsSUFBRyxVQUFVLENBQUMsTUFBWCxHQUFvQixJQUFBLElBQVEsVUFBVSxDQUFDLE1BQVgsS0FBcUIsQ0FBcEQ7UUFDSSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXZCLEVBQWlDLENBQUMsV0FBRCxDQUFqQztRQUdiLElBQUcsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBQSxJQUFRLFVBQVUsQ0FBQyxNQUFYLEtBQXFCLENBQXBEO1VBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixVQUE1QixFQUF3QztZQUFDLFFBQUEsRUFBVSxZQUFYO1dBQXhDO0FBQ0EsaUJBQU8sTUFGWDtTQUpKOztNQVFBLElBQUcsV0FBSDtRQUNJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsaUNBQTlCLEVBQWlFO1VBQUMsUUFBQSxFQUFVLG9CQUFYO1NBQWpFLEVBREo7O0FBR0EsYUFBTztJQTlCQyxDQWxEWjs7QUFrRkE7Ozs7SUFJQSxJQUFBLEVBQU0sU0FBQTtNQUNGLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJO01BQ3hCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUFBO01BRUEsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFDL0IsSUFBQyxDQUFBLHVCQUF1QixDQUFDLElBQXpCLENBQUE7TUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsaUNBQUEsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDbkUsU0FBUyxDQUFDLGVBQVYsQ0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQTFCO1VBRG1FO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQztPQUFwQztNQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSxxQ0FBQSxFQUF1QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUN2RSxLQUFDLENBQUEsVUFBRCxDQUFZLElBQVo7VUFEdUU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZDO09BQXBDO01BR0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3Qiw4QkFBeEIsRUFBd0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BELEtBQUMsQ0FBQSxXQUFELENBQUE7aUJBQ0EsS0FBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO1FBRm9EO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RDtNQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixtQ0FBeEIsRUFBNkQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3pELEtBQUMsQ0FBQSxXQUFELENBQUE7aUJBQ0EsS0FBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO1FBRnlEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3RDtNQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixxQ0FBeEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMzRCxLQUFDLENBQUEsV0FBRCxDQUFBO1FBRDJEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvRDtNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixxQ0FBeEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMzRCxLQUFDLENBQUEsV0FBRCxDQUFBO1FBRDJEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvRDtNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixxQ0FBeEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMzRCxLQUFDLENBQUEsV0FBRCxDQUFBO1FBRDJEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvRDthQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixzREFBeEIsRUFBZ0YsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1RSxLQUFDLENBQUEsV0FBRCxDQUFBO1FBRDRFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRjtJQWxDRSxDQXRGTjs7QUFQSiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMnXG5uYW1lc3BhY2UgPSByZXF1aXJlICcuL3NlcnZpY2VzL25hbWVzcGFjZS5jb2ZmZWUnXG5TdGF0dXNJblByb2dyZXNzID0gcmVxdWlyZSBcIi4vc2VydmljZXMvc3RhdHVzLWluLXByb2dyZXNzLmNvZmZlZVwiXG5TdGF0dXNFcnJvckF1dG9jb21wbGV0ZSA9IHJlcXVpcmUgXCIuL3NlcnZpY2VzL3N0YXR1cy1lcnJvci1hdXRvY29tcGxldGUuY29mZmVlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICAgY29uZmlnOiB7fVxuICAgIHN0YXR1c0luUHJvZ3Jlc3M6IG51bGxcbiAgICBzdGF0dXNFcnJvckF1dG9jb21wbGV0ZTogbnVsbFxuXG4gICAgIyMjKlxuICAgICAqIEdldCBwbHVnaW4gY29uZmlndXJhdGlvblxuICAgICMjI1xuICAgIGdldENvbmZpZzogKCkgLT5cbiAgICAgICAgIyBTZWUgYWxzbyBodHRwczovL3NlY3VyZS5waHAubmV0L3VybGhvd3RvLnBocCAuXG4gICAgICAgIEBjb25maWdbJ3BocF9kb2N1bWVudGF0aW9uX2Jhc2VfdXJsJ10gPSB7XG4gICAgICAgICAgICBmdW5jdGlvbnM6ICdodHRwczovL3NlY3VyZS5waHAubmV0L2Z1bmN0aW9uLidcbiAgICAgICAgfVxuXG4gICAgICAgIEBjb25maWdbJ2NvbXBvc2VyJ10gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5iaW5Db21wb3NlcicpXG4gICAgICAgIEBjb25maWdbJ3BocCddID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluUGhwJylcbiAgICAgICAgQGNvbmZpZ1snYXV0b2xvYWQnXSA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1hdXRvY29tcGxldGUtcGhwLmF1dG9sb2FkUGF0aHMnKVxuICAgICAgICBAY29uZmlnWydjbGFzc21hcCddID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWF1dG9jb21wbGV0ZS1waHAuY2xhc3NNYXBGaWxlcycpXG4gICAgICAgIEBjb25maWdbJ3BhY2thZ2VQYXRoJ10gPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aCgnYXRvbS1hdXRvY29tcGxldGUtcGhwJylcbiAgICAgICAgQGNvbmZpZ1sndmVyYm9zZUVycm9ycyddID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWF1dG9jb21wbGV0ZS1waHAudmVyYm9zZUVycm9ycycpXG4gICAgICAgIEBjb25maWdbJ2luc2VydE5ld2xpbmVzRm9yVXNlU3RhdGVtZW50cyddID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWF1dG9jb21wbGV0ZS1waHAuaW5zZXJ0TmV3bGluZXNGb3JVc2VTdGF0ZW1lbnRzJylcblxuICAgICMjIypcbiAgICAgKiBXcml0ZXMgY29uZmlndXJhdGlvbiBpbiBcInBocCBsaWJcIiBmb2xkZXJcbiAgICAjIyNcbiAgICB3cml0ZUNvbmZpZzogKCkgLT5cbiAgICAgICAgQGdldENvbmZpZygpXG5cbiAgICAgICAgZmlsZXMgPSBcIlwiXG4gICAgICAgIGZvciBmaWxlIGluIEBjb25maWcuYXV0b2xvYWRcbiAgICAgICAgICAgIGZpbGVzICs9IFwiJyN7ZmlsZX0nLFwiXG5cbiAgICAgICAgY2xhc3NtYXBzID0gXCJcIlxuICAgICAgICBmb3IgY2xhc3NtYXAgaW4gQGNvbmZpZy5jbGFzc21hcFxuICAgICAgICAgICAgY2xhc3NtYXBzICs9IFwiJyN7Y2xhc3NtYXB9JyxcIlxuXG4gICAgICAgIHRleHQgPSBcIjw/cGhwXG4gICAgICAgICAgJGNvbmZpZyA9IGFycmF5KFxuICAgICAgICAgICAgJ2NvbXBvc2VyJyA9PiAnI3tAY29uZmlnLmNvbXBvc2VyfScsXG4gICAgICAgICAgICAncGhwJyA9PiAnI3tAY29uZmlnLnBocH0nLFxuICAgICAgICAgICAgJ2F1dG9sb2FkJyA9PiBhcnJheSgje2ZpbGVzfSksXG4gICAgICAgICAgICAnY2xhc3NtYXAnID0+IGFycmF5KCN7Y2xhc3NtYXBzfSlcbiAgICAgICAgICApO1xuICAgICAgICBcIlxuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoQGNvbmZpZy5wYWNrYWdlUGF0aCArICcvcGhwL3RtcC5waHAnLCB0ZXh0KVxuXG4gICAgIyMjKlxuICAgICAqIFRlc3RzIHRoZSB1c2VyJ3MgUEhQIGFuZCBDb21wb3NlciBjb25maWd1cmF0aW9uLlxuICAgICAqIEByZXR1cm4ge2Jvb2x9XG4gICAgIyMjXG4gICAgdGVzdENvbmZpZzogKGludGVyYWN0aXZlKSAtPlxuICAgICAgICBAZ2V0Q29uZmlnKClcblxuICAgICAgICBleGVjID0gcmVxdWlyZSBcImNoaWxkX3Byb2Nlc3NcIlxuICAgICAgICB0ZXN0UmVzdWx0ID0gZXhlYy5zcGF3blN5bmMoQGNvbmZpZy5waHAsIFtcIi12XCJdKVxuXG4gICAgICAgIGVycm9yVGl0bGUgPSAnYXRvbS1hdXRvY29tcGxldGUtcGhwIC0gSW5jb3JyZWN0IHNldHVwISdcbiAgICAgICAgZXJyb3JNZXNzYWdlID0gJ0VpdGhlciBQSFAgb3IgQ29tcG9zZXIgaXMgbm90IGNvcnJlY3RseSBzZXQgdXAgYW5kIGFzIGEgcmVzdWx0IFBIUCBhdXRvY29tcGxldGlvbiB3aWxsIG5vdCB3b3JrLiAnICtcbiAgICAgICAgICAnUGxlYXNlIHZpc2l0IHRoZSBzZXR0aW5ncyBzY3JlZW4gdG8gY29ycmVjdCB0aGlzIGVycm9yLiBJZiB5b3UgYXJlIG5vdCBzcGVjaWZ5aW5nIGFuIGFic29sdXRlIHBhdGggZm9yIFBIUCBvciAnICtcbiAgICAgICAgICAnQ29tcG9zZXIsIG1ha2Ugc3VyZSB0aGV5IGFyZSBpbiB5b3VyIFBBVEguXG4gICAgICAgICAgRmVlbCBmcmVlIHRvIGxvb2sgcGFja2FnZVxcJ3MgUkVBRE1FIGZvciBjb25maWd1cmF0aW9uIGV4YW1wbGVzJ1xuXG4gICAgICAgIGlmIHRlc3RSZXN1bHQuc3RhdHVzID0gbnVsbCBvciB0ZXN0UmVzdWx0LnN0YXR1cyAhPSAwXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3JUaXRsZSwgeydkZXRhaWwnOiBlcnJvck1lc3NhZ2V9KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgIyBUZXN0IENvbXBvc2VyLlxuICAgICAgICB0ZXN0UmVzdWx0ID0gZXhlYy5zcGF3blN5bmMoQGNvbmZpZy5waHAsIFtAY29uZmlnLmNvbXBvc2VyLCBcIi0tdmVyc2lvblwiXSlcblxuICAgICAgICBpZiB0ZXN0UmVzdWx0LnN0YXR1cyA9IG51bGwgb3IgdGVzdFJlc3VsdC5zdGF0dXMgIT0gMFxuICAgICAgICAgICAgdGVzdFJlc3VsdCA9IGV4ZWMuc3Bhd25TeW5jKEBjb25maWcuY29tcG9zZXIsIFtcIi0tdmVyc2lvblwiXSlcblxuICAgICAgICAgICAgIyBUcnkgZXhlY3V0aW5nIENvbXBvc2VyIGRpcmVjdGx5LlxuICAgICAgICAgICAgaWYgdGVzdFJlc3VsdC5zdGF0dXMgPSBudWxsIG9yIHRlc3RSZXN1bHQuc3RhdHVzICE9IDBcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3JUaXRsZSwgeydkZXRhaWwnOiBlcnJvck1lc3NhZ2V9KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIGlmIGludGVyYWN0aXZlXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnYXRvbS1hdXRvY29tcGxldGUtcGhwIC0gU3VjY2VzcycsIHsnZGV0YWlsJzogJ0NvbmZpZ3VyYXRpb24gT0sgISd9KVxuXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIyMqXG4gICAgICogSW5pdCBmdW5jdGlvbiBjYWxsZWQgb24gcGFja2FnZSBhY3RpdmF0aW9uXG4gICAgICogUmVnaXN0ZXIgY29uZmlnIGV2ZW50cyBhbmQgd3JpdGUgdGhlIGZpcnN0IGNvbmZpZ1xuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEBzdGF0dXNJblByb2dyZXNzID0gbmV3IFN0YXR1c0luUHJvZ3Jlc3NcbiAgICAgICAgQHN0YXR1c0luUHJvZ3Jlc3MuaGlkZSgpXG5cbiAgICAgICAgQHN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlID0gbmV3IFN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlXG4gICAgICAgIEBzdGF0dXNFcnJvckF1dG9jb21wbGV0ZS5oaWRlKClcblxuICAgICAgICAjIENvbW1hbmQgZm9yIG5hbWVzcGFjZXNcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2F0b20tYXV0b2NvbXBsZXRlLXBocDpuYW1lc3BhY2UnOiA9PlxuICAgICAgICAgICAgbmFtZXNwYWNlLmNyZWF0ZU5hbWVzcGFjZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuXG4gICAgICAgICMgQ29tbWFuZCB0byB0ZXN0IGNvbmZpZ3VyYXRpb25cbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2F0b20tYXV0b2NvbXBsZXRlLXBocDpjb25maWd1cmF0aW9uJzogPT5cbiAgICAgICAgICAgIEB0ZXN0Q29uZmlnKHRydWUpXG5cbiAgICAgICAgQHdyaXRlQ29uZmlnKClcblxuICAgICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXRvbS1hdXRvY29tcGxldGUtcGhwLmJpblBocCcsICgpID0+XG4gICAgICAgICAgICBAd3JpdGVDb25maWcoKVxuICAgICAgICAgICAgQHRlc3RDb25maWcodHJ1ZSlcblxuICAgICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXRvbS1hdXRvY29tcGxldGUtcGhwLmJpbkNvbXBvc2VyJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG4gICAgICAgICAgICBAdGVzdENvbmZpZyh0cnVlKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYXV0b2xvYWRQYXRocycsICgpID0+XG4gICAgICAgICAgICBAd3JpdGVDb25maWcoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuY2xhc3NNYXBGaWxlcycsICgpID0+XG4gICAgICAgICAgICBAd3JpdGVDb25maWcoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAudmVyYm9zZUVycm9ycycsICgpID0+XG4gICAgICAgICAgICBAd3JpdGVDb25maWcoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuaW5zZXJ0TmV3bGluZXNGb3JVc2VTdGF0ZW1lbnRzJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG4iXX0=
