(function() {
  var CompositeDisposable, helpers;

  CompositeDisposable = require('atom').CompositeDisposable;

  helpers = require('atom-linter');

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        title: 'PHP Executable Path',
        "default": 'php'
      }
    },
    _testBin: function() {
      var message, title;
      title = 'linter-php: Unable to determine PHP version';
      message = 'Unable to determine the version of "' + this.executablePath + '", please verify that this is the right path to PHP.';
      try {
        return helpers.exec(this.executablePath, ['-v']).then((function(_this) {
          return function(output) {
            var regex;
            regex = /PHP (\d+)\.(\d+)\.(\d+)/g;
            if (!regex.exec(output)) {
              atom.notifications.addError(title, {
                detail: message
              });
              return _this.executablePath = '';
            }
          };
        })(this))["catch"](function(e) {
          console.log(e);
          return atom.notifications.addError(title, {
            detail: message
          });
        });
      } catch (_error) {}
    },
    activate: function() {
      require('atom-package-deps').install();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-php.executablePath', (function(_this) {
        return function(executablePath) {
          _this.executablePath = executablePath;
          return _this._testBin();
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'PHP',
        grammarScopes: ['text.html.php', 'source.php'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var command, filePath, parameters, text;
            filePath = textEditor.getPath();
            command = _this.executablePath;
            if (command == null) {
              return Promise.resolve([]);
            }
            parameters = [];
            parameters.push('--syntax-check');
            parameters.push('--define', 'display_errors=On');
            parameters.push('--define', 'log_errors=Off');
            text = textEditor.getText();
            return helpers.exec(command, parameters, {
              stdin: text
            }).then(function(output) {
              var match, messages, regex;
              regex = /^(?:Parse|Fatal) error:\s+(.+) in .+? on line (\d+)/gm;
              messages = [];
              while ((match = regex.exec(output)) !== null) {
                messages.push({
                  type: "Error",
                  filePath: filePath,
                  range: helpers.rangeFromLineNumber(textEditor, match[2] - 1),
                  text: match[1]
                });
              }
              return messages;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcGhwL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0QkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsS0FBQSxFQUFPLHFCQURQO0FBQUEsUUFFQSxTQUFBLEVBQVMsS0FGVDtPQURGO0tBREY7QUFBQSxJQU1BLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLGNBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSw2Q0FBUixDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsc0NBQUEsR0FBeUMsSUFBQyxDQUFBLGNBQTFDLEdBQ1Isc0RBRkYsQ0FBQTtBQUdBO2VBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsY0FBZCxFQUE4QixDQUFDLElBQUQsQ0FBOUIsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3pDLGdCQUFBLEtBQUE7QUFBQSxZQUFBLEtBQUEsR0FBUSwwQkFBUixDQUFBO0FBQ0EsWUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLElBQU4sQ0FBVyxNQUFYLENBQVA7QUFDRSxjQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsS0FBNUIsRUFBbUM7QUFBQSxnQkFBQyxNQUFBLEVBQVEsT0FBVDtlQUFuQyxDQUFBLENBQUE7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

//# sourceURL=/Users/Rad/.atom/packages/linter-php/lib/main.coffee
