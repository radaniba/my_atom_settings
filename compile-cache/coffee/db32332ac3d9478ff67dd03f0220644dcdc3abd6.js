(function() {
  var getProjectDir, helpers, path;

  helpers = null;

  path = null;

  getProjectDir = function(filePath) {
    var atomProject;
    if (path == null) {
      path = require('path');
    }
    atomProject = atom.project.relativizePath(filePath)[0];
    if (atomProject === null) {
      return path.dirname(filePath);
    }
    return atomProject;
  };

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
            cwd: getProjectDir(filePath),
            env: process.env,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcHljb2Rlc3R5bGUvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVU7O0VBQ1YsSUFBQSxHQUFPOztFQUdQLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ2QsUUFBQTs7TUFBQSxPQUFRLE9BQUEsQ0FBUSxNQUFSOztJQUNSLFdBQUEsR0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsUUFBNUIsQ0FBc0MsQ0FBQSxDQUFBO0lBQ3BELElBQUcsV0FBQSxLQUFlLElBQWxCO0FBRUUsYUFBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsRUFGVDs7QUFHQSxXQUFPO0VBTk87O0VBUWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsYUFEVDtPQURGO01BR0EsYUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRFQ7T0FKRjtNQU1BLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSw4RkFGYjtPQVBGO01BVUEsMEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BWEY7S0FERjtJQWVBLFFBQUEsRUFBVSxTQUFBO2FBQ1IsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsb0JBQXJDO0lBRFEsQ0FmVjtJQWtCQSxhQUFBLEVBQWUsU0FBQTtBQUNiLFVBQUE7YUFBQSxRQUFBLEdBQ0U7UUFBQSxJQUFBLEVBQU0sYUFBTjtRQUNBLGFBQUEsRUFBZSxDQUFDLGVBQUQsRUFBa0Isc0JBQWxCLENBRGY7UUFFQSxLQUFBLEVBQU8sTUFGUDtRQUdBLFNBQUEsRUFBVyxJQUhYO1FBSUEsSUFBQSxFQUFNLFNBQUMsVUFBRDtBQUNKLGNBQUE7O1lBQUEsVUFBVyxPQUFBLENBQVEsYUFBUjs7VUFDWCxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQTtVQUNYLFVBQUEsR0FBYTtVQUNiLElBQUcsYUFBQSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLENBQW5CO1lBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0Isb0JBQUEsR0FBcUIsYUFBckMsRUFERjs7VUFFQSxJQUFHLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBQWpCO1lBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsV0FBQSxHQUFXLENBQUMsV0FBVyxDQUFDLElBQVosQ0FBaUIsR0FBakIsQ0FBRCxDQUEzQixFQURGOztVQUVBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEdBQWhCO1VBQ0EsT0FBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQ0FBaEIsQ0FBSCxHQUF5RSxTQUF6RSxHQUF3RjtBQUNsRyxpQkFBTyxPQUFPLENBQUMsSUFBUixDQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEIsQ0FBYixFQUFtRSxVQUFuRSxFQUErRTtZQUFDLEdBQUEsRUFBSyxhQUFBLENBQWMsUUFBZCxDQUFOO1lBQStCLEdBQUEsRUFBSyxPQUFPLENBQUMsR0FBNUM7WUFBaUQsS0FBQSxFQUFPLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBeEQ7WUFBOEUsY0FBQSxFQUFnQixJQUE5RjtXQUEvRSxDQUFtTCxDQUFDLElBQXBMLENBQXlMLFNBQUMsTUFBRDtBQUM5TCxnQkFBQTtZQUFBLFFBQUEsR0FBVztZQUNYLEtBQUEsR0FBUTtBQUNSLG1CQUFNLENBQUMsS0FBQSxHQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxDQUFULENBQUEsS0FBa0MsSUFBeEM7Y0FDRSxJQUFBLEdBQU8sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsQ0FBQSxJQUFzQjtjQUM3QixHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsQ0FBQSxJQUFzQjtjQUM1QixRQUFRLENBQUMsSUFBVCxDQUFjO2dCQUNaLElBQUEsRUFBTSxPQURNO2dCQUVaLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUZBO2dCQUdaLFVBQUEsUUFIWTtnQkFJWixLQUFBLEVBQU8sQ0FBQyxDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsR0FBQSxHQUFNLENBQWpCLENBQUQsRUFBc0IsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLEdBQVgsQ0FBdEIsQ0FKSztlQUFkO1lBSEY7QUFTQSxtQkFBTztVQVp1TCxDQUF6TDtRQVZILENBSk47O0lBRlcsQ0FsQmY7O0FBYkYiLCJzb3VyY2VzQ29udGVudCI6WyJoZWxwZXJzID0gbnVsbFxucGF0aCA9IG51bGxcblxuIyBUaGlzIGZ1bmN0aW9uIGlzIGZyb206IGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9saW50ZXItcHlsaW50XG5nZXRQcm9qZWN0RGlyID0gKGZpbGVQYXRoKSAtPlxuICBwYXRoID89IHJlcXVpcmUoJ3BhdGgnKVxuICBhdG9tUHJvamVjdCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF1cbiAgaWYgYXRvbVByb2plY3QgPT0gbnVsbFxuICAgICMgRGVmYXVsdCBwcm9qZWN0IGRpcmV4dG9yeSB0byBmaWxlIGRpcmVjdG9yeSBpZiBwYXRoIGNhbm5vdCBiZSBkZXRlcm1pbmVkXG4gICAgcmV0dXJuIHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgcmV0dXJuIGF0b21Qcm9qZWN0XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGV4ZWN1dGFibGVQYXRoOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdweWNvZGVzdHlsZSdcbiAgICBtYXhMaW5lTGVuZ3RoOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAwXG4gICAgaWdub3JlRXJyb3JDb2RlczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtdXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvciBhIGxpc3Qgb2YgY29kZSB2aXNpdCBodHRwOi8vcHljb2Rlc3R5bGUucmVhZHRoZWRvY3Mub3JnL2VuL2xhdGVzdC9pbnRyby5odG1sI2Vycm9yLWNvZGVzJ1xuICAgIGNvbnZlcnRBbGxFcnJvcnNUb1dhcm5pbmdzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItcHljb2Rlc3R5bGUnKVxuXG4gIHByb3ZpZGVMaW50ZXI6IC0+XG4gICAgcHJvdmlkZXIgPVxuICAgICAgbmFtZTogJ3B5Y29kZXN0eWxlJ1xuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UucHl0aG9uJywgJ3NvdXJjZS5weXRob24uZGphbmdvJ11cbiAgICAgIHNjb3BlOiAnZmlsZScgIyBvciAncHJvamVjdCdcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSAjIG11c3QgYmUgZmFsc2UgZm9yIHNjb3BlOiAncHJvamVjdCdcbiAgICAgIGxpbnQ6ICh0ZXh0RWRpdG9yKS0+XG4gICAgICAgIGhlbHBlcnMgPz0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIHBhcmFtZXRlcnMgPSBbXVxuICAgICAgICBpZiBtYXhMaW5lTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItcHljb2Rlc3R5bGUubWF4TGluZUxlbmd0aCcpXG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKFwiLS1tYXgtbGluZS1sZW5ndGg9I3ttYXhMaW5lTGVuZ3RofVwiKVxuICAgICAgICBpZiBpZ25vcmVDb2RlcyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLXB5Y29kZXN0eWxlLmlnbm9yZUVycm9yQ29kZXMnKVxuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaChcIi0taWdub3JlPSN7aWdub3JlQ29kZXMuam9pbignLCcpfVwiKVxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKVxuICAgICAgICBtc2d0eXBlID0gaWYgYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItcHljb2Rlc3R5bGUuY29udmVydEFsbEVycm9yc1RvV2FybmluZ3MnKSB0aGVuICdXYXJuaW5nJyBlbHNlICdFcnJvcidcbiAgICAgICAgcmV0dXJuIGhlbHBlcnMuZXhlYyhhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1weWNvZGVzdHlsZS5leGVjdXRhYmxlUGF0aCcpLCBwYXJhbWV0ZXJzLCB7Y3dkOiBnZXRQcm9qZWN0RGlyKGZpbGVQYXRoKSwgZW52OiBwcm9jZXNzLmVudiwgc3RkaW46IHRleHRFZGl0b3IuZ2V0VGV4dCgpLCBpZ25vcmVFeGl0Q29kZTogdHJ1ZX0pLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICB0b1JldHVybiA9IFtdXG4gICAgICAgICAgcmVnZXggPSAvc3RkaW46KFxcZCspOihcXGQrKTooLiopL2dcbiAgICAgICAgICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKHJlc3VsdCkpIGlzbnQgbnVsbFxuICAgICAgICAgICAgbGluZSA9IHBhcnNlSW50KG1hdGNoWzFdKSBvciAwXG4gICAgICAgICAgICBjb2wgPSBwYXJzZUludChtYXRjaFsyXSkgb3IgMFxuICAgICAgICAgICAgdG9SZXR1cm4ucHVzaCh7XG4gICAgICAgICAgICAgIHR5cGU6IG1zZ3R5cGVcbiAgICAgICAgICAgICAgdGV4dDogbWF0Y2hbM11cbiAgICAgICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgICAgICAgcmFuZ2U6IFtbbGluZSAtIDEsIGNvbCAtIDFdLCBbbGluZSAtIDEsIGNvbF1dXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiB0b1JldHVyblxuIl19
