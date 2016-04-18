(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      shellcheckExecutablePath: {
        type: 'string',
        title: 'Shellcheck Executable Path',
        "default": 'shellcheck'
      },
      userParameters: {
        type: 'string',
        title: 'Additional Executable Parameters',
        description: 'Additional shellcheck parameters, for example `-x -e SC1090`.',
        "default": ''
      },
      enableNotice: {
        type: 'boolean',
        title: 'Enable Notice Messages',
        "default": false
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-shellcheck.shellcheckExecutablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-shellcheck.enableNotice', (function(_this) {
        return function(enableNotice) {
          return _this.enableNotice = enableNotice;
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-shellcheck.userParameters', (function(_this) {
        return function(userParameters) {
          return _this.userParameters = userParameters.trim().split(' ').filter(Boolean);
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var helpers, path, provider;
      helpers = require('atom-linter');
      path = require('path');
      return provider = {
        grammarScopes: ['source.shell'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var cwd, filePath, parameters, showAll, text;
            filePath = textEditor.getPath();
            text = textEditor.getText();
            cwd = path.dirname(filePath);
            showAll = _this.enableNotice;
            parameters = [].concat(['-f', 'gcc'], _this.userParameters, ['-']);
            return helpers.exec(_this.executablePath, parameters, {
              stdin: text,
              cwd: cwd
            }).then(function(output) {
              var colEnd, colStart, lineEnd, lineStart, match, messages, regex;
              regex = /.+?:(\d+):(\d+):\s(\w+?):\s(.+)/g;
              messages = [];
              while ((match = regex.exec(output)) !== null) {
                if (showAll || match[3] === "warning" || match[3] === "error") {
                  lineStart = match[1] - 1;
                  colStart = match[2] - 1;
                  lineEnd = match[1] - 1;
                  colEnd = textEditor.getBuffer().lineLengthForRow(lineStart);
                  messages.push({
                    type: match[3],
                    filePath: filePath,
                    range: [[lineStart, colStart], [lineEnd, colEnd]],
                    text: match[4]
                  });
                }
              }
              return messages;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItc2hlbGxjaGVjay9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsd0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLEtBQUEsRUFBTyw0QkFEUDtBQUFBLFFBRUEsU0FBQSxFQUFTLFlBRlQ7T0FERjtBQUFBLE1BSUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsS0FBQSxFQUFPLGtDQURQO0FBQUEsUUFFQSxXQUFBLEVBQ0UsK0RBSEY7QUFBQSxRQUlBLFNBQUEsRUFBUyxFQUpUO09BTEY7QUFBQSxNQVVBLFlBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLEtBQUEsRUFBTyx3QkFEUDtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FYRjtLQURGO0FBQUEsSUFnQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQ2xCLDRDQURrQixFQUVqQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxjQUFELEdBQUE7aUJBQ0UsS0FBQyxDQUFBLGNBQUQsR0FBa0IsZUFEcEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFB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

//# sourceURL=/Users/Rad/.atom/packages/linter-shellcheck/lib/main.coffee
