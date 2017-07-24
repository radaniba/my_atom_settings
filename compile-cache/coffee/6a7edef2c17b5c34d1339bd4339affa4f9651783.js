(function() {
  var helpers;

  helpers = null;

  module.exports = {
    config: {
      pep8ExecutablePath: {
        type: 'string',
        "default": 'pep8'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        description: 'For a list of code visit http://pep8.readthedocs.org/en/latest/intro.html#error-codes'
      },
      convertAllErrorsToWarnings: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      return require('atom-package-deps').install('linter-pep8');
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'pep8',
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
          if (maxLineLength = atom.config.get('linter-pep8.maxLineLength')) {
            parameters.push("--max-line-length=" + maxLineLength);
          }
          if (ignoreCodes = atom.config.get('linter-pep8.ignoreErrorCodes')) {
            parameters.push("--ignore=" + (ignoreCodes.join(',')));
          }
          parameters.push('-');
          msgtype = atom.config.get('linter-pep8.convertAllErrorsToWarnings') ? 'Warning' : 'Error';
          return helpers.exec(atom.config.get('linter-pep8.pep8ExecutablePath'), parameters, {
            stdin: textEditor.getText()
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcGVwOC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsT0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsTUFEVDtPQURGO0FBQUEsTUFHQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FEVDtPQUpGO0FBQUEsTUFNQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx1RkFGYjtPQVBGO0FBQUEsTUFVQSwwQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FYRjtLQURGO0FBQUEsSUFlQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsYUFBckMsRUFEUTtJQUFBLENBZlY7QUFBQSxJQWtCQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxRQUFBO2FBQUEsUUFBQSxHQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLFFBQ0EsYUFBQSxFQUFlLENBQUMsZUFBRCxFQUFrQixzQkFBbEIsQ0FEZjtBQUFBLFFBRUEsS0FBQSxFQUFPLE1BRlA7QUFBQSxRQUdBLFNBQUEsRUFBVyxJQUhYO0FBQUEsUUFJQSxJQUFBLEVBQU0sU0FBQyxVQUFELEdBQUE7QUFDSixjQUFBLHlEQUFBOztZQUFBLFVBQVcsT0FBQSxDQUFRLGFBQVI7V0FBWDtBQUFBLFVBQ0EsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FEWCxDQUFBO0FBQUEsVUFFQSxVQUFBLEdBQWEsRUFGYixDQUFBO0FBR0EsVUFBQSxJQUFHLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQUFuQjtBQUNFLFlBQUEsVUFBVSxDQUFDLElBQVgsQ0FBaUIsb0JBQUEsR0FBb0IsYUFBckMsQ0FBQSxDQURGO1dBSEE7QUFLQSxVQUFBLElBQUcsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsQ0FBakI7QUFDRSxZQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWlCLFdBQUEsR0FBVSxDQUFDLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEdBQWpCLENBQUQsQ0FBM0IsQ0FBQSxDQURGO1dBTEE7QUFBQSxVQU9BLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEdBQWhCLENBUEEsQ0FBQTtBQUFBLFVBUUEsT0FBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FBSCxHQUFrRSxTQUFsRSxHQUFpRixPQVIzRixDQUFBO0FBU0EsaUJBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQWIsRUFBZ0UsVUFBaEUsRUFBNEU7QUFBQSxZQUFDLEtBQUEsRUFBTyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQVI7V0FBNUUsQ0FBMEcsQ0FBQyxJQUEzRyxDQUFnSCxTQUFDLE1BQUQsR0FBQTtBQUNySCxnQkFBQSxpQ0FBQTtBQUFBLFlBQUEsUUFBQSxHQUFXLEVBQVgsQ0FBQTtBQUFBLFlBQ0EsS0FBQSxHQUFRLHlCQURSLENBQUE7QUFFQSxtQkFBTSxDQUFDLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsQ0FBVCxDQUFBLEtBQWtDLElBQXhDLEdBQUE7QUFDRSxjQUFBLElBQUEsR0FBTyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixDQUFBLElBQXNCLENBQTdCLENBQUE7QUFBQSxjQUNBLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixDQUFBLElBQXNCLENBRDVCLENBQUE7QUFBQSxjQUVBLFFBQVEsQ0FBQyxJQUFULENBQWM7QUFBQSxnQkFDWixJQUFBLEVBQU0sT0FETTtBQUFBLGdCQUVaLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUZBO0FBQUEsZ0JBR1osVUFBQSxRQUhZO0FBQUEsZ0JBSVosS0FBQSxFQUFPLENBQUMsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLEdBQUEsR0FBTSxDQUFqQixDQUFELEVBQXNCLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxHQUFYLENBQXRCLENBSks7ZUFBZCxDQUZBLENBREY7WUFBQSxDQUZBO0FBV0EsbUJBQU8sUUFBUCxDQVpxSDtVQUFBLENBQWhILENBQVAsQ0FWSTtRQUFBLENBSk47UUFGVztJQUFBLENBbEJmO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/linter-pep8/lib/main.coffee
