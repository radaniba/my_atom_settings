(function() {
  var CompositeDisposable, helpers, os, path, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  helpers = require('atom-linter');

  path = require('path');

  _ = require('lodash');

  os = require('os');

  module.exports = {
    config: {
      executable: {
        type: 'string',
        "default": 'pylint',
        description: 'Command or path to executable. Use %p for current project directory (no trailing /).'
      },
      pythonPath: {
        type: 'string',
        "default": '',
        description: 'Paths to be added to $PYTHONPATH. Use %p for current project directory or %f for the directory of the current file.'
      },
      rcFile: {
        type: 'string',
        "default": '',
        description: 'Path to pylintrc file. Use %p for the current project directory or %f for the directory of the current file.'
      },
      workingDirectory: {
        type: 'string',
        "default": '%p',
        description: 'Directory pylint is run from. Use %p for the current project directory or %f for the directory of the current file.'
      },
      messageFormat: {
        type: 'string',
        "default": '%i %m',
        description: 'Format for Pylint messages where %m is the message, %i is the numeric mesasge ID (e.g. W0613) and %s is the human-readable message ID (e.g. unused-argument).'
      }
    },
    activate: function() {
      require('atom-package-deps').install();
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-pylint.executable', (function(_this) {
        return function(newExecutableValue) {
          return _this.executable = newExecutableValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-pylint.rcFile', (function(_this) {
        return function(newRcFileValue) {
          return _this.rcFile = newRcFileValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-pylint.messageFormat', (function(_this) {
        return function(newMessageFormatValue) {
          return _this.messageFormat = newMessageFormatValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-pylint.pythonPath', (function(_this) {
        return function(newPythonPathValue) {
          return _this.pythonPath = _.trim(newPythonPathValue, path.delimiter);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-pylint.workingDirectory', (function(_this) {
        return function(newCwd) {
          return _this.cwd = _.trim(newCwd, path.delimiter);
        };
      })(this)));
      this.regex = '^(?<line>\\d+),(?<col>\\d+),(?<type>\\w+),(\\w\\d+):(?<message>.*)\\r?$';
      return this.errorWhitelist = [/^No config file found, using default configuration$/];
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'Pylint',
        grammarScopes: ['source.python'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(activeEditor) {
            var file;
            file = activeEditor.getPath();
            return helpers.tempFile(path.basename(file), activeEditor.getText(), function(tmpFilename) {
              var args, cwd, env, executable, fileDir, format, pattern, projDir, pythonPath, rcFile, value, _ref;
              projDir = _this.getProjDir(file) || path.dirname(file);
              fileDir = path.dirname(file);
              cwd = _this.cwd.replace(/%f/g, fileDir).replace(/%p/g, projDir);
              executable = _this.executable.replace(/%p/g, projDir);
              pythonPath = _this.pythonPath.replace(/%f/g, fileDir).replace(/%p/g, projDir);
              env = Object.create(process.env, {
                PYTHONPATH: {
                  value: _.compact([process.env.PYTHONPATH, fileDir, projDir, pythonPath]).join(path.delimiter),
                  enumerable: true
                }
              });
              format = _this.messageFormat;
              _ref = {
                '%m': 'msg',
                '%i': 'msg_id',
                '%s': 'symbol'
              };
              for (pattern in _ref) {
                value = _ref[pattern];
                format = format.replace(new RegExp(pattern, 'g'), "{" + value + "}");
              }
              args = ["--msg-template='{line},{column},{category},{msg_id}:" + format + "'", '--reports=n', '--output-format=text'];
              if (_this.rcFile) {
                rcFile = _this.rcFile.replace(/%p/g, projDir).replace(/%f/g, fileDir);
                args.push("--rcfile=" + rcFile);
              }
              args.push(tmpFilename);
              return helpers.exec(executable, args, {
                env: env,
                cwd: cwd,
                stream: 'both'
              }).then(function(data) {
                var filteredErrors;
                filteredErrors = _this.filterWhitelistedErrors(data.stderr);
                if (filteredErrors) {
                  throw new Error(filteredErrors);
                }
                return helpers.parse(data.stdout, _this.regex, {
                  filePath: file
                }).filter(function(lintIssue) {
                  return lintIssue.type !== 'info';
                }).map(function(lintIssue) {
                  var colEnd, colStart, lineEnd, lineStart, _ref1, _ref2, _ref3;
                  _ref1 = lintIssue.range, (_ref2 = _ref1[0], lineStart = _ref2[0], colStart = _ref2[1]), (_ref3 = _ref1[1], lineEnd = _ref3[0], colEnd = _ref3[1]);
                  if (lineStart === lineEnd && (colStart <= colEnd && colEnd <= 0)) {
                    return _.merge({}, lintIssue, {
                      range: helpers.rangeFromLineNumber(activeEditor, lineStart, colStart)
                    });
                  }
                  return lintIssue;
                });
              });
            });
          };
        })(this)
      };
    },
    getProjDir: function(filePath) {
      return atom.project.relativizePath(filePath)[0];
    },
    filterWhitelistedErrors: function(output) {
      var filteredOutputLines, outputLines;
      outputLines = _.compact(output.split(os.EOL));
      filteredOutputLines = _.reject(outputLines, (function(_this) {
        return function(outputLine) {
          return _.some(_this.errorWhitelist, function(errorRegex) {
            return errorRegex.test(outputLine);
          });
        };
      })(this));
      return filteredOutputLines.join(os.EOL);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcHlsaW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5Q0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSkwsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFFBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxzRkFGYjtPQURGO0FBQUEsTUFJQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHFIQUZiO09BTEY7QUFBQSxNQVNBLE1BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsOEdBRmI7T0FWRjtBQUFBLE1BY0EsZ0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEscUhBRmI7T0FmRjtBQUFBLE1BbUJBLGFBQUEsRUFDRTtBQUFB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

//# sourceURL=/Users/Rad/.atom/packages/linter-pylint/lib/main.coffee
