(function() {
  var CompositeDisposable, path;

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        title: 'Some Executable Path',
        "default": path.join(__dirname, '..', 'node_modules', 'dockerlint', 'bin', 'dockerlint.js')
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-docker.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'linter-docker',
        grammarScopes: ['source.dockerfile'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var filePath;
            filePath = textEditor.getPath();
            return helpers.execNode(_this.executablePath, [filePath], {
              stream: 'stderr',
              throwOnStdErr: false
            }).then(function(output) {
              var results;
              results = helpers.parse(output, '(?<type>WARN|ERROR):(?<message>.*) on line (?<line>\\d+)');
              return results.map(function(r) {
                r.type = r.type === 'WARN' ? 'Warning' : 'Error';
                r.text = r.text.replace(/^\s+|\s+$/g, "");
                r.filePath = filePath;
                return r;
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZG9ja2VyL2xpYi9pbml0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsS0FBQSxFQUFPLHNCQURQO0FBQUEsUUFFQSxTQUFBLEVBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGNBQTNCLEVBQTJDLFlBQTNDLEVBQXlELEtBQXpELEVBQWdFLGVBQWhFLENBRlQ7T0FERjtLQURGO0FBQUEsSUFLQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBRVIsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDhCQUFwQixFQUNqQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxjQUFELEdBQUE7aUJBQ0UsS0FBQyxDQUFBLGNBQUQsR0FBa0IsZUFEcEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURpQixDQUFuQixFQUhRO0lBQUEsQ0FMVjtBQUFBLElBV0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQVhaO0FBQUEsSUFhQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxpQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBQVYsQ0FBQTthQUNBLFFBQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLGVBQU47QUFBQSxRQUNBLGFBQUEsRUFBZSxDQUFDLG1CQUFELENBRGY7QUFBQSxRQUVBLEtBQUEsRUFBTyxNQUZQO0FBQUEsUUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLFFBSUEsSUFBQSxFQUFNLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxVQUFELEdBQUE7QUFDSixnQkFBQSxRQUFBO0FBQUEsWUFBQSxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFYLENBQUE7QUFFQSxtQkFBTyxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFDLENBQUEsY0FBbEIsRUFBa0MsQ0FBQyxRQUFELENBQWxDLEVBQThDO0FBQUEsY0FBQyxNQUFBLEVBQVEsUUFBVDtBQUFBLGNBQW1CLGFBQUEsRUFBYyxLQUFqQzthQUE5QyxDQUNMLENBQUMsSUFESSxDQUNDLFNBQUMsTUFBRCxHQUFBO0FBRUosa0JBQUEsT0FBQTtBQUFBLGNBQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxLQUFSLENBQWMsTUFBZCxFQUFzQiwwREFBdEIsQ0FBVixDQUFBO0FBQ0EscUJBQU8sT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFDLENBQUQsR0FBQTtBQUNqQixnQkFBQSxDQUFDLENBQUMsSUFBRixHQUFZLENBQUMsQ0FBQyxJQUFGLEtBQVUsTUFBYixHQUF5QixTQUF6QixHQUF3QyxPQUFqRCxDQUFBO0FBQUEsZ0JBQ0EsQ0FBQyxDQUFDLElBQUYsR0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxZQUFmLEVBQTZCLEVBQTdCLENBRFQsQ0FBQTtBQUFBLGdCQUVBLENBQUMsQ0FBQyxRQUFGLEdBQWEsUUFGYixDQUFBO0FBR0EsdUJBQU8sQ0FBUCxDQUppQjtjQUFBLENBQVosQ0FBUCxDQUhJO1lBQUEsQ0FERCxDQUFQLENBSEk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOO1FBSFc7SUFBQSxDQWJmO0dBTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/linter-docker/lib/init.coffee
