(function() {
  var helpers;

  helpers = null;

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": 'pycodestyle'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        description: 'For a list of code visit http://pycodestyle.readthedocs.org/en/latest/intro.html#error-codes'
      },
      convertAllErrorsToWarnings: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      return require('atom-package-deps').install('linter-pycodestyle');
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'pycodestyle',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var filePath, ignoreCodes, maxLineLength, msgtype, parameters;
          if (helpers == null) {
            helpers = require('atom-linter');
          }
          filePath = textEditor.getPath();
          parameters = [];
          if (maxLineLength = atom.config.get('linter-pycodestyle.maxLineLength')) {
            parameters.push("--max-line-length=" + maxLineLength);
          }
          if (ignoreCodes = atom.config.get('linter-pycodestyle.ignoreErrorCodes')) {
            parameters.push("--ignore=" + (ignoreCodes.join(',')));
          }
          parameters.push('-');
          msgtype = atom.config.get('linter-pycodestyle.convertAllErrorsToWarnings') ? 'Warning' : 'Error';
          return helpers.exec(atom.config.get('linter-pycodestyle.executablePath'), parameters, {
            stdin: textEditor.getText(),
            ignoreExitCode: true
          }).then(function(result) {
            var col, line, match, regex, toReturn;
            toReturn = [];
            regex = /stdin:(\d+):(\d+):(.*)/g;
            while ((match = regex.exec(result)) !== null) {
              line = parseInt(match[1]) || 0;
              col = parseInt(match[2]) || 0;
              toReturn.push({
                type: msgtype,
                text: match[3],
                filePath: filePath,
                range: [[line - 1, col - 1], [line - 1, col]]
              });
            }
            return toReturn;
          });
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcHljb2Rlc3R5bGUvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVU7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxhQURUO09BREY7TUFHQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FEVDtPQUpGO01BTUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLDhGQUZiO09BUEY7TUFVQSwwQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7T0FYRjtLQURGO0lBZUEsUUFBQSxFQUFVLFNBQUE7YUFDUixPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFxQyxvQkFBckM7SUFEUSxDQWZWO0lBa0JBLGFBQUEsRUFBZSxTQUFBO0FBQ2IsVUFBQTthQUFBLFFBQUEsR0FDRTtRQUFBLElBQUEsRUFBTSxhQUFOO1FBQ0EsYUFBQSxFQUFlLENBQUMsZUFBRCxFQUFrQixzQkFBbEIsQ0FEZjtRQUVBLEtBQUEsRUFBTyxNQUZQO1FBR0EsU0FBQSxFQUFXLElBSFg7UUFJQSxJQUFBLEVBQU0sU0FBQyxVQUFEO0FBQ0osY0FBQTs7WUFBQSxVQUFXLE9BQUEsQ0FBUSxhQUFSOztVQUNYLFFBQUEsR0FBVyxVQUFVLENBQUMsT0FBWCxDQUFBO1VBQ1gsVUFBQSxHQUFhO1VBQ2IsSUFBRyxhQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBbkI7WUFDRSxVQUFVLENBQUMsSUFBWCxDQUFnQixvQkFBQSxHQUFxQixhQUFyQyxFQURGOztVQUVBLElBQUcsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FBakI7WUFDRSxVQUFVLENBQUMsSUFBWCxDQUFnQixXQUFBLEdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBWixDQUFpQixHQUFqQixDQUFELENBQTNCLEVBREY7O1VBRUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsR0FBaEI7VUFDQSxPQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtDQUFoQixDQUFILEdBQXlFLFNBQXpFLEdBQXdGO0FBQ2xHLGlCQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUFiLEVBQW1FLFVBQW5FLEVBQStFO1lBQUMsS0FBQSxFQUFPLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBUjtZQUE4QixjQUFBLEVBQWdCLElBQTlDO1dBQS9FLENBQW1JLENBQUMsSUFBcEksQ0FBeUksU0FBQyxNQUFEO0FBQzlJLGdCQUFBO1lBQUEsUUFBQSxHQUFXO1lBQ1gsS0FBQSxHQUFRO0FBQ1IsbUJBQU0sQ0FBQyxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLENBQVQsQ0FBQSxLQUFrQyxJQUF4QztjQUNFLElBQUEsR0FBTyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixDQUFBLElBQXNCO2NBQzdCLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixDQUFBLElBQXNCO2NBQzVCLFFBQVEsQ0FBQyxJQUFULENBQWM7Z0JBQ1osSUFBQSxFQUFNLE9BRE07Z0JBRVosSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRkE7Z0JBR1osVUFBQSxRQUhZO2dCQUlaLEtBQUEsRUFBTyxDQUFDLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxHQUFBLEdBQU0sQ0FBakIsQ0FBRCxFQUFzQixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsR0FBWCxDQUF0QixDQUpLO2VBQWQ7WUFIRjtBQVNBLG1CQUFPO1VBWnVJLENBQXpJO1FBVkgsQ0FKTjs7SUFGVyxDQWxCZjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbImhlbHBlcnMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGV4ZWN1dGFibGVQYXRoOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdweWNvZGVzdHlsZSdcbiAgICBtYXhMaW5lTGVuZ3RoOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAwXG4gICAgaWdub3JlRXJyb3JDb2RlczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtdXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvciBhIGxpc3Qgb2YgY29kZSB2aXNpdCBodHRwOi8vcHljb2Rlc3R5bGUucmVhZHRoZWRvY3Mub3JnL2VuL2xhdGVzdC9pbnRyby5odG1sI2Vycm9yLWNvZGVzJ1xuICAgIGNvbnZlcnRBbGxFcnJvcnNUb1dhcm5pbmdzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItcHljb2Rlc3R5bGUnKVxuXG4gIHByb3ZpZGVMaW50ZXI6IC0+XG4gICAgcHJvdmlkZXIgPVxuICAgICAgbmFtZTogJ3B5Y29kZXN0eWxlJ1xuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UucHl0aG9uJywgJ3NvdXJjZS5weXRob24uZGphbmdvJ11cbiAgICAgIHNjb3BlOiAnZmlsZScgIyBvciAncHJvamVjdCdcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSAjIG11c3QgYmUgZmFsc2UgZm9yIHNjb3BlOiAncHJvamVjdCdcbiAgICAgIGxpbnQ6ICh0ZXh0RWRpdG9yKS0+XG4gICAgICAgIGhlbHBlcnMgPz0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIHBhcmFtZXRlcnMgPSBbXVxuICAgICAgICBpZiBtYXhMaW5lTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItcHljb2Rlc3R5bGUubWF4TGluZUxlbmd0aCcpXG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKFwiLS1tYXgtbGluZS1sZW5ndGg9I3ttYXhMaW5lTGVuZ3RofVwiKVxuICAgICAgICBpZiBpZ25vcmVDb2RlcyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLXB5Y29kZXN0eWxlLmlnbm9yZUVycm9yQ29kZXMnKVxuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaChcIi0taWdub3JlPSN7aWdub3JlQ29kZXMuam9pbignLCcpfVwiKVxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKVxuICAgICAgICBtc2d0eXBlID0gaWYgYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItcHljb2Rlc3R5bGUuY29udmVydEFsbEVycm9yc1RvV2FybmluZ3MnKSB0aGVuICdXYXJuaW5nJyBlbHNlICdFcnJvcidcbiAgICAgICAgcmV0dXJuIGhlbHBlcnMuZXhlYyhhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1weWNvZGVzdHlsZS5leGVjdXRhYmxlUGF0aCcpLCBwYXJhbWV0ZXJzLCB7c3RkaW46IHRleHRFZGl0b3IuZ2V0VGV4dCgpLCBpZ25vcmVFeGl0Q29kZTogdHJ1ZX0pLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICB0b1JldHVybiA9IFtdXG4gICAgICAgICAgcmVnZXggPSAvc3RkaW46KFxcZCspOihcXGQrKTooLiopL2dcbiAgICAgICAgICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKHJlc3VsdCkpIGlzbnQgbnVsbFxuICAgICAgICAgICAgbGluZSA9IHBhcnNlSW50KG1hdGNoWzFdKSBvciAwXG4gICAgICAgICAgICBjb2wgPSBwYXJzZUludChtYXRjaFsyXSkgb3IgMFxuICAgICAgICAgICAgdG9SZXR1cm4ucHVzaCh7XG4gICAgICAgICAgICAgIHR5cGU6IG1zZ3R5cGVcbiAgICAgICAgICAgICAgdGV4dDogbWF0Y2hbM11cbiAgICAgICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgICAgICAgcmFuZ2U6IFtbbGluZSAtIDEsIGNvbCAtIDFdLCBbbGluZSAtIDEsIGNvbF1dXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiB0b1JldHVyblxuIl19
