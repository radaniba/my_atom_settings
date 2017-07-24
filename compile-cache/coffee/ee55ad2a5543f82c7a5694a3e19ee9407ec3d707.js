(function() {
  var CompositeDisposable, path;

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        title: 'dockerlint Executable Path',
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
        name: 'dockerlint',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZG9ja2VyL2xpYi9pbml0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVOLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLDRCQURQO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsY0FBM0IsRUFBMkMsWUFBM0MsRUFBeUQsS0FBekQsRUFBZ0UsZUFBaEUsQ0FGVDtPQURGO0tBREY7SUFNQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw4QkFBcEIsRUFDakIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGNBQUQ7aUJBQ0UsS0FBQyxDQUFBLGNBQUQsR0FBa0I7UUFEcEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGlCLENBQW5CO0lBRlEsQ0FOVjtJQVlBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQVpaO0lBZUEsYUFBQSxFQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSO2FBQ1YsUUFBQSxHQUNFO1FBQUEsSUFBQSxFQUFNLFlBQU47UUFDQSxhQUFBLEVBQWUsQ0FBQyxtQkFBRCxDQURmO1FBRUEsS0FBQSxFQUFPLE1BRlA7UUFHQSxTQUFBLEVBQVcsSUFIWDtRQUlBLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFVBQUQ7QUFDSixnQkFBQTtZQUFBLFFBQUEsR0FBVyxVQUFVLENBQUMsT0FBWCxDQUFBO0FBQ1gsbUJBQU8sT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBQyxDQUFBLGNBQWxCLEVBQWtDLENBQUMsUUFBRCxDQUFsQyxFQUE4QztjQUFDLE1BQUEsRUFBUSxRQUFUO2NBQW1CLGFBQUEsRUFBYyxLQUFqQzthQUE5QyxDQUNMLENBQUMsSUFESSxDQUNDLFNBQUMsTUFBRDtBQUNKLGtCQUFBO2NBQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxLQUFSLENBQWMsTUFBZCxFQUFzQiwwREFBdEI7QUFDVixxQkFBTyxPQUFPLENBQUMsR0FBUixDQUFZLFNBQUMsQ0FBRDtnQkFDakIsQ0FBQyxDQUFDLElBQUYsR0FBWSxDQUFDLENBQUMsSUFBRixLQUFVLE1BQWIsR0FBeUIsU0FBekIsR0FBd0M7Z0JBQ2pELENBQUMsQ0FBQyxJQUFGLEdBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFQLENBQWUsWUFBZixFQUE2QixFQUE3QjtnQkFDVCxDQUFDLENBQUMsUUFBRixHQUFhO0FBQ2IsdUJBQU87Y0FKVSxDQUFaO1lBRkgsQ0FERDtVQUZIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOOztJQUhXLENBZmY7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgZXhlY3V0YWJsZVBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgdGl0bGU6ICdkb2NrZXJsaW50IEV4ZWN1dGFibGUgUGF0aCdcbiAgICAgIGRlZmF1bHQ6IHBhdGguam9pbiBfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZG9ja2VybGludCcsICdiaW4nLCAnZG9ja2VybGludC5qcydcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1kb2NrZXIuZXhlY3V0YWJsZVBhdGgnLFxuICAgICAgKGV4ZWN1dGFibGVQYXRoKSA9PlxuICAgICAgICBAZXhlY3V0YWJsZVBhdGggPSBleGVjdXRhYmxlUGF0aFxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgcHJvdmlkZUxpbnRlcjogLT5cbiAgICBoZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgIHByb3ZpZGVyID1cbiAgICAgIG5hbWU6ICdkb2NrZXJsaW50J1xuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuZG9ja2VyZmlsZSddXG4gICAgICBzY29wZTogJ2ZpbGUnICMgb3IgJ3Byb2plY3QnXG4gICAgICBsaW50T25GbHk6IHRydWUgIyBtdXN0IGJlIGZhbHNlIGZvciBzY29wZTogJ3Byb2plY3QnXG4gICAgICBsaW50OiAodGV4dEVkaXRvcikgPT5cbiAgICAgICAgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgICAgICByZXR1cm4gaGVscGVycy5leGVjTm9kZShAZXhlY3V0YWJsZVBhdGgsIFtmaWxlUGF0aF0sIHtzdHJlYW06ICdzdGRlcnInLCB0aHJvd09uU3RkRXJyOmZhbHNlfSlcbiAgICAgICAgICAudGhlbiAob3V0cHV0KSAtPlxuICAgICAgICAgICAgcmVzdWx0cyA9IGhlbHBlcnMucGFyc2Uob3V0cHV0LCAnKD88dHlwZT5XQVJOfEVSUk9SKTooPzxtZXNzYWdlPi4qKSBvbiBsaW5lICg/PGxpbmU+XFxcXGQrKScpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5tYXAgKHIpIC0+XG4gICAgICAgICAgICAgIHIudHlwZSA9IGlmIHIudHlwZSA9PSAnV0FSTicgdGhlbiAnV2FybmluZycgZWxzZSAnRXJyb3InXG4gICAgICAgICAgICAgIHIudGV4dCA9IHIudGV4dC5yZXBsYWNlIC9eXFxzK3xcXHMrJC9nLCBcIlwiXG4gICAgICAgICAgICAgIHIuZmlsZVBhdGggPSBmaWxlUGF0aFxuICAgICAgICAgICAgICByZXR1cm4gclxuIl19
