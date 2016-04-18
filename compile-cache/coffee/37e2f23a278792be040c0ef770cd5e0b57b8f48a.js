(function() {
  var config, exec, fs, md5, process;

  exec = require("child_process");

  process = require("process");

  config = require("../config.coffee");

  md5 = require('md5');

  fs = require('fs');

  module.exports = {
    data: {
      methods: [],
      autocomplete: [],
      composer: null
    },
    currentProcesses: [],

    /**
     * Executes a command to PHP proxy
     * @param  {string}  command  Command to execute
     * @param  {boolean} async    Must be async or not
     * @param  {array}   options  Options for the command
     * @param  {boolean} noparser Do not use php/parser.php
     * @return {array}           Json of the response
     */
    execute: function(command, async, options, noparser) {
      var args, c, directory, err, processKey, res, stdout, _i, _j, _len, _len1, _ref;
      if (!options) {
        options = {};
      }
      processKey = command.join("_");
      _ref = atom.project.getDirectories();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        directory = _ref[_i];
        for (_j = 0, _len1 = command.length; _j < _len1; _j++) {
          c = command[_j];
          c.replace(/\\/g, '\\\\');
        }
        if (!async) {
          try {
            if (this.currentProcesses[processKey] == null) {
              this.currentProcesses[processKey] = true;
              args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
              if (noparser) {
                args = command;
              }
              stdout = exec.spawnSync(config.config.php, args, options).output[1].toString('ascii');
              delete this.currentProcesses[processKey];
              if (noparser) {
                res = {
                  result: stdout
                };
              } else {
                res = JSON.parse(stdout);
              }
            }
          } catch (_error) {
            err = _error;
            console.log(err);
            res = {
              error: err
            };
          }
          if (!res) {
            return [];
          }
          if (res.error != null) {
            this.printError(res.error);
          }
          return res;
        } else {
          if (this.currentProcesses[processKey] == null) {
            if (processKey.indexOf("--refresh") !== -1) {
              config.statusInProgress.update("Indexing...", true);
            }
            args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
            if (noparser) {
              args = command;
            }
            this.currentProcesses[processKey] = exec.exec(config.config.php + " " + args.join(" "), options, (function(_this) {
              return function(error, stdout, stderr) {
                delete _this.currentProcesses[processKey];
                if (processKey.indexOf("--refresh") !== -1) {
                  config.statusInProgress.update("Indexing...", false);
                }
                return stdout;
              };
            })(this));
          }
        }
      }
    },

    /**
     * Reads an index by its name (file in indexes/index.[name].json)
     * @param {string} name Name of the index to read
     */
    readIndex: function(name) {
      var crypt, directory, err, options, path, _i, _len, _ref;
      _ref = atom.project.getDirectories();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        directory = _ref[_i];
        crypt = md5(directory.path);
        path = __dirname + "/../../indexes/" + crypt + "/index." + name + ".json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (_error) {
          err = _error;
          return [];
        }
        options = {
          encoding: 'UTF-8'
        };
        return JSON.parse(fs.readFileSync(path, options));
        break;
      }
    },

    /**
     * Open and read the composer.json file in the current folder
     */
    readComposer: function() {
      var directory, err, options, path, _i, _len, _ref;
      _ref = atom.project.getDirectories();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        directory = _ref[_i];
        path = "" + directory.path + "/composer.json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (_error) {
          err = _error;
          continue;
        }
        options = {
          encoding: 'UTF-8'
        };
        this.data.composer = JSON.parse(fs.readFileSync(path, options));
        return this.data.composer;
      }
      console.log('Unable to find composer.json file or to open it. The plugin will not work as expected. It only works on composer project');
      throw "Error";
    },

    /**
     * Throw a formatted error
     * @param {object} error Error to show
     */
    printError: function(error) {
      var message;
      this.data.error = true;
      return message = error.message;
    },

    /**
     * Clear all cache of the plugin
     */
    clearCache: function() {
      return this.data = {
        error: false,
        autocomplete: [],
        methods: [],
        composer: null
      };
    },

    /**
     * Autocomplete for classes name
     * @return {array}
     */
    classes: function() {
      return this.readIndex('classes');
    },

    /**
     * Returns composer.json file
     * @return {Object}
     */
    composer: function() {
      return this.readComposer();
    },

    /**
     * Autocomplete for internal PHP constants
     * @return {array}
     */
    constants: function() {
      var res;
      if (this.data.constants == null) {
        res = this.execute(["--constants"], false);
        this.data.constants = res;
      }
      return this.data.constants;
    },

    /**
     * Autocomplete for internal PHP functions
     * @return {array}
     */
    functions: function() {
      var res;
      if (this.data.functions == null) {
        res = this.execute(["--functions"], false);
        this.data.functions = res;
      }
      return this.data.functions;
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    methods: function(className) {
      var res;
      if (this.data.methods[className] == null) {
        res = this.execute(["--methods", "" + className], false);
        this.data.methods[className] = res;
      }
      return this.data.methods[className];
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    autocomplete: function(className, name) {
      var cacheKey, res;
      cacheKey = className + "." + name;
      if (this.data.autocomplete[cacheKey] == null) {
        res = this.execute(["--autocomplete", className, name], false);
        this.data.autocomplete[cacheKey] = res;
      }
      return this.data.autocomplete[cacheKey];
    },

    /**
     * Returns params from the documentation of the given function
     *
     * @param {string} className
     * @param {string} functionName
     */
    docParams: function(className, functionName) {
      var res;
      res = this.execute(["--doc-params", "" + className, "" + functionName], false);
      return res;
    },

    /**
     * Refresh the full index or only for the given classPath
     * @param  {string} classPath Full path (dir) of the class to refresh
     */
    refresh: function(classPath) {
      if (classPath == null) {
        return this.execute(["--refresh"], true);
      } else {
        return this.execute(["--refresh", "" + classPath], true);
      }
    },

    /**
     * Method called on plugin activation
     */
    init: function() {
      this.refresh();
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return editor.onDidSave(function(event) {
            var classPath, directory, path, _i, _len, _ref;
            if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
              _this.clearCache();
              path = event.path;
              _ref = atom.project.getDirectories();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                directory = _ref[_i];
                if (path.indexOf(directory.path) === 0) {
                  classPath = path.substr(0, directory.path.length + 1);
                  path = path.substr(directory.path.length + 1);
                  break;
                }
              }
              return _this.refresh(classPath + path.replace(/\\/g, '/'));
            }
          });
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binPhp', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      return atom.config.onDidChange('atom-autocomplete-php.autoloadPaths', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEJBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUpMLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxJQUFBLEVBQ0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxFQUFUO0FBQUEsTUFDQSxZQUFBLEVBQWMsRUFEZDtBQUFBLE1BRUEsUUFBQSxFQUFVLElBRlY7S0FESjtBQUFBLElBS0EsZ0JBQUEsRUFBa0IsRUFMbEI7QUFPQTtBQUFBOzs7Ozs7O09BUEE7QUFBQSxJQWVBLE9BQUEsRUFBUyxTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCLFFBQTFCLEdBQUE7QUFDTCxVQUFBLDJFQUFBO0FBQUEsTUFBQSxJQUFnQixDQUFBLE9BQWhCO0FBQUEsUUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO09BQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWIsQ0FEYixDQUFBO0FBR0E7QUFBQSxXQUFBLDJDQUFBOzZCQUFBO0FBQ0ksYUFBQSxnREFBQTswQkFBQTtBQUNJLFVBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxL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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/php-proxy.coffee
