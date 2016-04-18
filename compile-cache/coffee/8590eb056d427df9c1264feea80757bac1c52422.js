(function() {
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
      return require('atom-package-deps').install();
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'pep8',
        grammarScopes: ['source.python'],
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var filePath, ignoreCodes, maxLineLength, msgtype, parameters;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcGVwOC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxrQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE1BRFQ7T0FERjtBQUFBLE1BR0EsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBRFQ7T0FKRjtBQUFBLE1BTUEsZ0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsdUZBRmI7T0FQRjtBQUFBLE1BVUEsMEJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BWEY7S0FERjtBQUFBLElBZUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQUEsRUFEUTtJQUFBLENBZlY7QUFBQSxJQWtCQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxpQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBQVYsQ0FBQTthQUNBLFFBQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE1BQU47QUFBQSxRQUNBLGFBQUEsRUFBZSxDQUFDLGVBQUQsQ0FEZjtBQUFBLFFBRUEsS0FBQSxFQUFPLE1BRlA7QUFBQSxRQUdBLFNBQUEsRUFBVyxJQUhYO0FBQUEsUUFJQSxJQUFBLEVBQU0sU0FBQyxVQUFELEdBQUE7QUFDSixjQUFBLHlEQUFBO0FBQUEsVUFBQSxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFYLENBQUE7QUFBQSxVQUNBLFVBQUEsR0FBYSxFQURiLENBQUE7QUFFQSxVQUFBLElBQUcsYUFBQSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCLENBQW5CO0FBQ0UsWUFBQSxVQUFVLENBQUMsSUFBWCxDQUFpQixvQkFBQSxHQUFvQixhQUFyQyxDQUFBLENBREY7V0FGQTtBQUlBLFVBQUEsSUFBRyxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFqQjtBQUNFLFlBQUEsVUFBVSxDQUFDLElBQVgsQ0FBaUIsV0FBQSxHQUFVLENBQUMsV0FBVyxDQUFDLElBQVosQ0FBaUIsR0FBakIsQ0FBRCxDQUEzQixDQUFBLENBREY7V0FKQTtBQUFBLFVBTUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsR0FBaEIsQ0FOQSxDQUFBO0FBQUEsVUFPQSxPQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUFILEdBQWtFLFNBQWxFLEdBQWlGLE9BUDNGLENBQUE7QUFRQSxpQkFBTyxPQUFPLENBQUMsSUFBUixDQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FBYixFQUFnRSxVQUFoRSxFQUE0RTtBQUFBLFlBQUMsS0FBQSxFQUFPLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBUjtXQUE1RSxDQUEwRyxDQUFDLElBQTNHLENBQWdILFNBQUMsTUFBRCxHQUFBO0FBQ3JILGdCQUFBLGlDQUFBO0FBQUEsWUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFBO0FBQUEsWUFDQSxLQUFBLEdBQVEseUJBRFIsQ0FBQTtBQUVBLG1CQUFNLENBQUMsS0FBQSxHQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxDQUFULENBQUEsS0FBa0MsSUFBeEMsR0FBQTtBQUNFLGNBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLENBQUEsSUFBc0IsQ0FBN0IsQ0FBQTtBQUFBLGNBQ0EsR0FBQSxHQUFNLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLENBQUEsSUFBc0IsQ0FENUIsQ0FBQTtBQUFBLGNBRUEsUUFBUSxDQUFDLElBQVQsQ0FBYztBQUFBLGdCQUNaLElBQUEsRUFBTSxPQURNO0FBQUEsZ0JBRVosSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBRkE7QUFBQSxnQkFHWixVQUFBLFFBSFk7QUFBQSxnQkFJWixLQUFBLEVBQU8sQ0FBQyxDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsR0FBQSxHQUFNLENBQWpCLENBQUQsRUFBc0IsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLEdBQVgsQ0FBdEIsQ0FKSztlQUFkLENBRkEsQ0FERjtZQUFBLENBRkE7QUFXQSxtQkFBTyxRQUFQLENBWnFIO1VBQUEsQ0FBaEgsQ0FBUCxDQVRJO1FBQUEsQ0FKTjtRQUhXO0lBQUEsQ0FsQmY7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/linter-pep8/lib/main.coffee
