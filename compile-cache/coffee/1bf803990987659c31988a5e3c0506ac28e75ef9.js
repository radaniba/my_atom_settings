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
      var args, c, commandData, directory, err, i, j, len, len1, processKey, ref, res, stdout;
      if (!options) {
        options = {};
      }
      processKey = command.join("_");
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        for (j = 0, len1 = command.length; j < len1; j++) {
          c = command[j];
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
          } catch (error1) {
            err = error1;
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
            config.statusErrorAutocomplete.update("Autocomplete failure", false);
            if (processKey.indexOf("--refresh") !== -1) {
              config.statusInProgress.update("Indexing...", true);
            }
            args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
            if (noparser) {
              args = command;
            }
            this.currentProcesses[processKey] = exec.spawn(config.config.php, args, options);
            this.currentProcesses[processKey].on("exit", (function(_this) {
              return function(exitCode) {
                return delete _this.currentProcesses[processKey];
              };
            })(this));
            commandData = '';
            this.currentProcesses[processKey].stdout.on("data", (function(_this) {
              return function(data) {
                return commandData += data.toString();
              };
            })(this));
            this.currentProcesses[processKey].on("close", (function(_this) {
              return function() {
                if (processKey.indexOf("--functions") !== -1) {
                  try {
                    _this.data.functions = JSON.parse(commandData);
                  } catch (error1) {
                    err = error1;
                    config.statusErrorAutocomplete.update("Autocomplete failure", true);
                  }
                }
                if (processKey.indexOf("--refresh") !== -1) {
                  return config.statusInProgress.update("Indexing...", false);
                }
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
      var crypt, directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        crypt = md5(directory.path);
        path = __dirname + "/../../indexes/" + crypt + "/index." + name + ".json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
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
      var directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        path = directory.path + "/composer.json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
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
      this.data = {
        error: false,
        autocomplete: [],
        methods: [],
        composer: null
      };
      return this.functions();
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
     *
     * @return {array}
     */
    functions: function() {
      if (this.data.functions == null) {
        this.execute(["--functions"], true);
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
            var classPath, directory, i, len, path, ref;
            if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
              _this.clearCache();
              path = event.path;
              ref = atom.project.getDirectories();
              for (i = 0, len = ref.length; i < len; i++) {
                directory = ref[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUjs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxJQUFBLEVBQ0k7TUFBQSxPQUFBLEVBQVMsRUFBVDtNQUNBLFlBQUEsRUFBYyxFQURkO01BRUEsUUFBQSxFQUFVLElBRlY7S0FESjtJQUtBLGdCQUFBLEVBQWtCLEVBTGxCOztBQU9BOzs7Ozs7OztJQVFBLE9BQUEsRUFBUyxTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCLFFBQTFCO0FBQ0wsVUFBQTtNQUFBLElBQWdCLENBQUksT0FBcEI7UUFBQSxPQUFBLEdBQVUsR0FBVjs7TUFDQSxVQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBRWI7QUFBQSxXQUFBLHFDQUFBOztBQUNJLGFBQUEsMkNBQUE7O1VBQ0ksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO0FBREo7UUFHQSxJQUFHLENBQUksS0FBUDtBQUNJO1lBRUksSUFBTyx5Q0FBUDtjQUNJLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxVQUFBLENBQWxCLEdBQWdDO2NBRWhDLElBQUEsR0FBUSxDQUFDLFNBQUEsR0FBWSx1QkFBYixFQUF1QyxTQUFTLENBQUMsSUFBakQsQ0FBc0QsQ0FBQyxNQUF2RCxDQUE4RCxPQUE5RDtjQUNSLElBQUcsUUFBSDtnQkFDSSxJ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LENBQTdEO2FBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHFDQUF4QixFQUErRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzNELEtBQUMsQ0FBQSxVQUFELENBQUE7UUFEMkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9EO0lBMUJFLENBM09OOztBQVBKIiwic291cmNlc0NvbnRlbnQiOlsiZXhlYyA9IHJlcXVpcmUgXCJjaGlsZF9wcm9jZXNzXCJcbnByb2Nlc3MgPSByZXF1aXJlIFwicHJvY2Vzc1wiXG5jb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnLmNvZmZlZVwiXG5tZDUgPSByZXF1aXJlICdtZDUnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZGF0YTpcbiAgICAgICAgbWV0aG9kczogW10sXG4gICAgICAgIGF1dG9jb21wbGV0ZTogW10sXG4gICAgICAgIGNvbXBvc2VyOiBudWxsXG5cbiAgICBjdXJyZW50UHJvY2Vzc2VzOiBbXVxuXG4gICAgIyMjKlxuICAgICAqIEV4ZWN1dGVzIGEgY29tbWFuZCB0byBQSFAgcHJveHlcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBjb21tYW5kICBDb21tYW5kIHRvIGV4ZWN1dGVcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBhc3luYyAgICBNdXN0IGJlIGFzeW5jIG9yIG5vdFxuICAgICAqIEBwYXJhbSAge2FycmF5fSAgIG9wdGlvbnMgIE9wdGlvbnMgZm9yIHRoZSBjb21tYW5kXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gbm9wYXJzZXIgRG8gbm90IHVzZSBwaHAvcGFyc2VyLnBocFxuICAgICAqIEByZXR1cm4ge2FycmF5fSAgICAgICAgICAgSnNvbiBvZiB0aGUgcmVzcG9uc2VcbiAgICAjIyNcbiAgICBleGVjdXRlOiAoY29tbWFuZCwgYXN5bmMsIG9wdGlvbnMsIG5vcGFyc2VyKSAtPlxuICAgICAgICBvcHRpb25zID0ge30gaWYgbm90IG9wdGlvbnNcbiAgICAgICAgcHJvY2Vzc0tleSA9IGNvbW1hbmQuam9pbihcIl9cIilcblxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBmb3IgYyBpbiBjb21tYW5kXG4gICAgICAgICAgICAgICAgYy5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG5cbiAgICAgICAgICAgIGlmIG5vdCBhc3luY1xuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAjIGF2b2lkIG11bHRpcGxlIHByb2Nlc3NlcyBvZiB0aGUgc2FtZSBjb21tYW5kXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XT9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gIFtfX2Rpcm5hbWUgKyBcIi8uLi8uLi9waHAvcGFyc2VyLnBocFwiLCAgZGlyZWN0b3J5LnBhdGhdLmNvbmNhdChjb21tYW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm9wYXJzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gY29tbWFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Rkb3V0ID0gZXhlYy5zcGF3blN5bmMoY29uZmlnLmNvbmZpZy5waHAsIGFyZ3MsIG9wdGlvbnMpLm91dHB1dFsxXS50b1N0cmluZygnYXNjaWknKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm9wYXJzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHN0ZG91dFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IEpTT04ucGFyc2Uoc3Rkb3V0KVxuICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlcnJcbiAgICAgICAgICAgICAgICAgICAgcmVzID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJcblxuICAgICAgICAgICAgICAgIGlmICFyZXNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdXG5cbiAgICAgICAgICAgICAgICBpZiByZXMuZXJyb3I/XG4gICAgICAgICAgICAgICAgICAgIEBwcmludEVycm9yKHJlcy5lcnJvcilcblxuICAgICAgICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub3QgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0/XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zdGF0dXNFcnJvckF1dG9jb21wbGV0ZS51cGRhdGUoXCJBdXRvY29tcGxldGUgZmFpbHVyZVwiLCBmYWxzZSlcblxuICAgICAgICAgICAgICAgICAgICBpZiBwcm9jZXNzS2V5LmluZGV4T2YoXCItLXJlZnJlc2hcIikgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zdGF0dXNJblByb2dyZXNzLnVwZGF0ZShcIkluZGV4aW5nLi4uXCIsIHRydWUpXG5cbiAgICAgICAgICAgICAgICAgICAgYXJncyA9ICBbX19kaXJuYW1lICsgXCIvLi4vLi4vcGhwL3BhcnNlci5waHBcIiwgIGRpcmVjdG9yeS5wYXRoXS5jb25jYXQoY29tbWFuZClcbiAgICAgICAgICAgICAgICAgICAgaWYgbm9wYXJzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBjb21tYW5kXG5cbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0gPSBleGVjLnNwYXduKGNvbmZpZy5jb25maWcucGhwLCBhcmdzLCBvcHRpb25zKSAgICBcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0ub24oXCJleGl0XCIsIChleGl0Q29kZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XVxuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5vbihcImNsb3NlXCIsICgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwcm9jZXNzS2V5LmluZGV4T2YoXCItLWZ1bmN0aW9uc1wiKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGF0YS5mdW5jdGlvbnMgPSBKU09OLnBhcnNlKGNvbW1hbmREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RhdHVzRXJyb3JBdXRvY29tcGxldGUudXBkYXRlKFwiQXV0b2NvbXBsZXRlIGZhaWx1cmVcIiwgdHJ1ZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcHJvY2Vzc0tleS5pbmRleE9mKFwiLS1yZWZyZXNoXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnN0YXR1c0luUHJvZ3Jlc3MudXBkYXRlKFwiSW5kZXhpbmcuLi5cIiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICMjIypcbiAgICAgKiBSZWFkcyBhbiBpbmRleCBieSBpdHMgbmFtZSAoZmlsZSBpbiBpbmRleGVzL2luZGV4LltuYW1lXS5qc29uKVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIGluZGV4IHRvIHJlYWRcbiAgICAjIyNcbiAgICByZWFkSW5kZXg6IChuYW1lKSAtPlxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBjcnlwdCA9IG1kNShkaXJlY3RvcnkucGF0aClcbiAgICAgICAgICAgIHBhdGggPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9pbmRleGVzL1wiICsgY3J5cHQgKyBcIi9pbmRleC5cIiArIG5hbWUgKyBcIi5qc29uXCJcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyB8IGZzLlJfT0spXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICByZXR1cm4gW11cblxuICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICdVVEYtOCdcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLCBvcHRpb25zKSlcblxuICAgICAgICAgICAgYnJlYWtcblxuICAgICMjIypcbiAgICAgKiBPcGVuIGFuZCByZWFkIHRoZSBjb21wb3Nlci5qc29uIGZpbGUgaW4gdGhlIGN1cnJlbnQgZm9sZGVyXG4gICAgIyMjXG4gICAgcmVhZENvbXBvc2VyOiAoKSAtPlxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBwYXRoID0gXCIje2RpcmVjdG9yeS5wYXRofS9jb21wb3Nlci5qc29uXCJcblxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LIHwgZnMuUl9PSylcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiAnVVRGLTgnXG4gICAgICAgICAgICBAZGF0YS5jb21wb3NlciA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgsIG9wdGlvbnMpKVxuICAgICAgICAgICAgcmV0dXJuIEBkYXRhLmNvbXBvc2VyXG5cbiAgICAgICAgY29uc29sZS5sb2cgJ1VuYWJsZSB0byBmaW5kIGNvbXBvc2VyLmpzb24gZmlsZSBvciB0byBvcGVuIGl0LiBUaGUgcGx1Z2luIHdpbGwgbm90IHdvcmsgYXMgZXhwZWN0ZWQuIEl0IG9ubHkgd29ya3Mgb24gY29tcG9zZXIgcHJvamVjdCdcbiAgICAgICAgdGhyb3cgXCJFcnJvclwiXG5cbiAgICAjIyMqXG4gICAgICogVGhyb3cgYSBmb3JtYXR0ZWQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXJyb3IgRXJyb3IgdG8gc2hvd1xuICAgICMjI1xuICAgIHByaW50RXJyb3I6KGVycm9yKSAtPlxuICAgICAgICBAZGF0YS5lcnJvciA9IHRydWVcbiAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcblxuICAgICAgICAjaWYgZXJyb3IuZmlsZT8gYW5kIGVycm9yLmxpbmU/XG4gICAgICAgICAgICAjbWVzc2FnZSA9IG1lc3NhZ2UgKyAnIFtmcm9tIGZpbGUgJyArIGVycm9yLmZpbGUgKyAnIC0gTGluZSAnICsgZXJyb3IubGluZSArICddJ1xuXG4gICAgICAgICN0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcblxuICAgICMjIypcbiAgICAgKiBDbGVhciBhbGwgY2FjaGUgb2YgdGhlIHBsdWdpblxuICAgICMjI1xuICAgIGNsZWFyQ2FjaGU6ICgpIC0+XG4gICAgICAgIEBkYXRhID1cbiAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogW10sXG4gICAgICAgICAgICBtZXRob2RzOiBbXSxcbiAgICAgICAgICAgIGNvbXBvc2VyOiBudWxsXG5cbiAgICAgICAgIyBGaWxsIHRoZSBmdW5jdGlvbnMgYXJyYXkgYmVjYXVzZSBpdCBjYW4gdGFrZSB0aW1lc1xuICAgICAgICBAZnVuY3Rpb25zKClcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIGNsYXNzZXMgbmFtZVxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGNsYXNzZXM6ICgpIC0+XG4gICAgICAgIHJldHVybiBAcmVhZEluZGV4KCdjbGFzc2VzJylcblxuICAgICMjIypcbiAgICAgKiBSZXR1cm5zIGNvbXBvc2VyLmpzb24gZmlsZVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAjIyNcbiAgICBjb21wb3NlcjogKCkgLT5cbiAgICAgICAgcmV0dXJuIEByZWFkQ29tcG9zZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIEF1dG9jb21wbGV0ZSBmb3IgaW50ZXJuYWwgUEhQIGNvbnN0YW50c1xuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGNvbnN0YW50czogKCkgLT5cbiAgICAgICAgaWYgbm90IEBkYXRhLmNvbnN0YW50cz9cbiAgICAgICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tY29uc3RhbnRzXCJdLCBmYWxzZSlcbiAgICAgICAgICAgIEBkYXRhLmNvbnN0YW50cyA9IHJlc1xuXG4gICAgICAgIHJldHVybiBAZGF0YS5jb25zdGFudHNcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIGludGVybmFsIFBIUCBmdW5jdGlvbnNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGZ1bmN0aW9uczogKCkgLT5cbiAgICAgICAgaWYgbm90IEBkYXRhLmZ1bmN0aW9ucz9cbiAgICAgICAgICAgIEBleGVjdXRlKFtcIi0tZnVuY3Rpb25zXCJdLCB0cnVlKVxuXG4gICAgICAgIHJldHVybiBAZGF0YS5mdW5jdGlvbnNcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIG1ldGhvZHMgJiBwcm9wZXJ0aWVzIG9mIGEgY2xhc3NcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBjb21wbGV0ZSBuYW1lICh3aXRoIG5hbWVzcGFjZSlcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBtZXRob2RzOiAoY2xhc3NOYW1lKSAtPlxuICAgICAgICBpZiBub3QgQGRhdGEubWV0aG9kc1tjbGFzc05hbWVdP1xuICAgICAgICAgICAgcmVzID0gQGV4ZWN1dGUoW1wiLS1tZXRob2RzXCIsXCIje2NsYXNzTmFtZX1cIl0sIGZhbHNlKVxuICAgICAgICAgICAgQGRhdGEubWV0aG9kc1tjbGFzc05hbWVdID0gcmVzXG5cbiAgICAgICAgcmV0dXJuIEBkYXRhLm1ldGhvZHNbY2xhc3NOYW1lXVxuXG4gICAgIyMjKlxuICAgICAqIEF1dG9jb21wbGV0ZSBmb3IgbWV0aG9kcyAmIHByb3BlcnRpZXMgb2YgYSBjbGFzc1xuICAgICAqIEBwYXJhbSAge3N0cmluZ30gY2xhc3NOYW1lIENsYXNzIGNvbXBsZXRlIG5hbWUgKHdpdGggbmFtZXNwYWNlKVxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGF1dG9jb21wbGV0ZTogKGNsYXNzTmFtZSwgbmFtZSkgLT5cbiAgICAgICAgY2FjaGVLZXkgPSBjbGFzc05hbWUgKyBcIi5cIiArIG5hbWVcblxuICAgICAgICBpZiBub3QgQGRhdGEuYXV0b2NvbXBsZXRlW2NhY2hlS2V5XT9cbiAgICAgICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tYXV0b2NvbXBsZXRlXCIsIGNsYXNzTmFtZSwgbmFtZV0sIGZhbHNlKVxuICAgICAgICAgICAgQGRhdGEuYXV0b2NvbXBsZXRlW2NhY2hlS2V5XSA9IHJlc1xuXG4gICAgICAgIHJldHVybiBAZGF0YS5hdXRvY29tcGxldGVbY2FjaGVLZXldXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBwYXJhbXMgZnJvbSB0aGUgZG9jdW1lbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZnVuY3Rpb25cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lXG4gICAgIyMjXG4gICAgZG9jUGFyYW1zOiAoY2xhc3NOYW1lLCBmdW5jdGlvbk5hbWUpIC0+XG4gICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tZG9jLXBhcmFtc1wiLCBcIiN7Y2xhc3NOYW1lfVwiLCBcIiN7ZnVuY3Rpb25OYW1lfVwiXSwgZmFsc2UpXG4gICAgICAgIHJldHVybiByZXNcblxuICAgICMjIypcbiAgICAgKiBSZWZyZXNoIHRoZSBmdWxsIGluZGV4IG9yIG9ubHkgZm9yIHRoZSBnaXZlbiBjbGFzc1BhdGhcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNsYXNzUGF0aCBGdWxsIHBhdGggKGRpcikgb2YgdGhlIGNsYXNzIHRvIHJlZnJlc2hcbiAgICAjIyNcbiAgICByZWZyZXNoOiAoY2xhc3NQYXRoKSAtPlxuICAgICAgICBpZiBub3QgY2xhc3NQYXRoP1xuICAgICAgICAgICAgQGV4ZWN1dGUoW1wiLS1yZWZyZXNoXCJdLCB0cnVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZXhlY3V0ZShbXCItLXJlZnJlc2hcIiwgXCIje2NsYXNzUGF0aH1cIl0sIHRydWUpXG5cbiAgICAjIyMqXG4gICAgICogTWV0aG9kIGNhbGxlZCBvbiBwbHVnaW4gYWN0aXZhdGlvblxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEByZWZyZXNoKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTYXZlKChldmVudCkgPT5cbiAgICAgICAgICAgICAgIyBPbmx5IC5waHAgZmlsZVxuICAgICAgICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICAgICAgICBAY2xlYXJDYWNoZSgpXG5cbiAgICAgICAgICAgICAgICAgICMgRm9yIFdpbmRvd3MgLSBSZXBsYWNlIFxcIGluIGNsYXNzIG5hbWVzcGFjZSB0byAvIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAgICMgY29tcG9zZXIgdXNlIC8gaW5zdGVhZCBvZiBcXFxuICAgICAgICAgICAgICAgICAgcGF0aCA9IGV2ZW50LnBhdGhcbiAgICAgICAgICAgICAgICAgIGZvciBkaXJlY3RvcnkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgICBpZiBwYXRoLmluZGV4T2YoZGlyZWN0b3J5LnBhdGgpID09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NQYXRoID0gcGF0aC5zdWJzdHIoMCwgZGlyZWN0b3J5LnBhdGgubGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cihkaXJlY3RvcnkucGF0aC5sZW5ndGgrMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgQHJlZnJlc2goY2xhc3NQYXRoICsgcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJykpXG4gICAgICAgICAgICApXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5iaW5QaHAnLCAoKSA9PlxuICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluQ29tcG9zZXInLCAoKSA9PlxuICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYXV0b2xvYWRQYXRocycsICgpID0+XG4gICAgICAgICAgICBAY2xlYXJDYWNoZSgpXG4iXX0=
