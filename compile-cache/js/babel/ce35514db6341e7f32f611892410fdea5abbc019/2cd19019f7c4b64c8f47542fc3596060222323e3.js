Object.defineProperty(exports, '__esModule', {
  value: true
});

/* eslint-disable import/no-extraneous-dependencies, import/extensions */

var _atom = require('atom');

/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Some internal variables
'use babel';var baseUrl = 'https://github.com/koalaman/shellcheck/wiki';
var errorCodeRegex = /SC\d{4}/;
var regex = /.+?:(\d+):(\d+):\s(\w+?):\s(.+)/g;

var linkifyErrorCode = function linkifyErrorCode(text) {
  return text.replace(errorCodeRegex, '<a href="' + baseUrl + '/$&">$&</a>');
};

exports['default'] = {
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-shellcheck');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-shellcheck.shellcheckExecutablePath', function (value) {
      _this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-shellcheck.enableNotice', function (value) {
      _this.enableNotice = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-shellcheck.userParameters', function (value) {
      _this.userParameters = value.trim().split(' ').filter(Boolean);
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    var helpers = require('atom-linter');
    var path = require('path');

    return {
      name: 'ShellCheck',
      grammarScopes: ['source.shell'],
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var filePath = textEditor.getPath();
        var text = textEditor.getText();
        var cwd = path.dirname(filePath);
        var showAll = _this2.enableNotice;
        // The first -f parameter overrides any others
        var parameters = [].concat(['-f', 'gcc'], _this2.userParameters, ['-']);
        var options = { stdin: text, cwd: cwd, ignoreExitCode: true };
        return helpers.exec(_this2.executablePath, parameters, options).then(function (output) {
          if (textEditor.getText() !== text) {
            // The text has changed since the lint was triggered, tell Linter not to update
            return null;
          }
          var messages = [];
          var match = regex.exec(output);
          while (match !== null) {
            var type = match[3];
            if (showAll || type === 'warning' || type === 'error') {
              var line = Number.parseInt(match[1], 10) - 1;
              var col = Number.parseInt(match[2], 10) - 1;
              messages.push({
                type: type,
                filePath: filePath,
                range: helpers.rangeFromLineNumber(textEditor, line, col),
                html: linkifyErrorCode(match[4])
              });
            }
            match = regex.exec(output);
          }
          return messages;
        });
      }
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXNoZWxsY2hlY2svbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUdvQyxNQUFNOzs7OztBQUgxQyxXQUFXLENBQUMsQUFPWixJQUFNLE9BQU8sR0FBRyw2Q0FBNkMsQ0FBQztBQUM5RCxJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUM7QUFDakMsSUFBTSxLQUFLLEdBQUcsa0NBQWtDLENBQUM7O0FBRWpELElBQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUcsSUFBSTtTQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsZ0JBQWMsT0FBTyxpQkFBYztDQUFBLENBQUM7O3FCQUVsRDtBQUNiLFVBQVEsRUFBQSxvQkFBRzs7O0FBQ1QsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRTFELFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRDQUE0QyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzNFLFlBQUssY0FBYyxHQUFHLEtBQUssQ0FBQztLQUM3QixDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMvRCxZQUFLLFlBQVksR0FBRyxLQUFLLENBQUM7S0FDM0IsQ0FBQyxDQUNILENBQUM7QUFDRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakUsWUFBSyxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0QsQ0FBQyxDQUNILENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQzlCOztBQUVELGVBQWEsRUFBQSx5QkFBRzs7O0FBQ2QsUUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLFFBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFN0IsV0FBTztBQUNMLFVBQUksRUFBRSxZQUFZO0FBQ2xCLG1CQUFhLEVBQUUsQ0FBQyxjQUFjLENBQUM7QUFDL0IsV0FBSyxFQUFFLE1BQU07QUFDYixlQUFTLEVBQUUsSUFBSTtBQUNmLFVBQUksRUFBRSxjQUFDLFVBQVUsRUFBSztBQUNwQixZQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMsWUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFlBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBTSxPQUFPLEdBQUcsT0FBSyxZQUFZLENBQUM7O0FBRWxDLFlBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBSyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLFlBQU0sT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUMzRCxlQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBSyxjQUFjLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUM3RSxjQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7O0FBRWpDLG1CQUFPLElBQUksQ0FBQztXQUNiO0FBQ0QsY0FBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLGNBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsaUJBQU8sS0FBSyxLQUFLLElBQUksRUFBRTtBQUNyQixnQkFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLGdCQUFJLE9BQU8sSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDckQsa0JBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxrQkFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLHNCQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osb0JBQUksRUFBSixJQUFJO0FBQ0osd0JBQVEsRUFBUixRQUFRO0FBQ1IscUJBQUssRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7QUFDekQsb0JBQUksRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7ZUFDakMsQ0FBQyxDQUFDO2FBQ0o7QUFDRCxpQkFBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDNUI7QUFDRCxpQkFBTyxRQUFRLENBQUM7U0FDakIsQ0FBQyxDQUFDO09BQ0o7S0FDRixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zaGVsbGNoZWNrL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcywgaW1wb3J0L2V4dGVuc2lvbnMgKi9cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbi8qIGVzbGludC1lbmFibGUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9ucyAqL1xuXG4vLyBTb21lIGludGVybmFsIHZhcmlhYmxlc1xuY29uc3QgYmFzZVVybCA9ICdodHRwczovL2dpdGh1Yi5jb20va29hbGFtYW4vc2hlbGxjaGVjay93aWtpJztcbmNvbnN0IGVycm9yQ29kZVJlZ2V4ID0gL1NDXFxkezR9LztcbmNvbnN0IHJlZ2V4ID0gLy4rPzooXFxkKyk6KFxcZCspOlxccyhcXHcrPyk6XFxzKC4rKS9nO1xuXG5jb25zdCBsaW5raWZ5RXJyb3JDb2RlID0gdGV4dCA9PlxuICB0ZXh0LnJlcGxhY2UoZXJyb3JDb2RlUmVnZXgsIGA8YSBocmVmPVwiJHtiYXNlVXJsfS8kJlwiPiQmPC9hPmApO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLXNoZWxsY2hlY2snKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1zaGVsbGNoZWNrLnNoZWxsY2hlY2tFeGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1zaGVsbGNoZWNrLmVuYWJsZU5vdGljZScsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmVuYWJsZU5vdGljZSA9IHZhbHVlO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItc2hlbGxjaGVjay51c2VyUGFyYW1ldGVycycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnVzZXJQYXJhbWV0ZXJzID0gdmFsdWUudHJpbSgpLnNwbGl0KCcgJykuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgfSlcbiAgICApO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIGNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKCdhdG9tLWxpbnRlcicpO1xuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ1NoZWxsQ2hlY2snLFxuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2Uuc2hlbGwnXSxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIGNvbnN0IGN3ZCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IHNob3dBbGwgPSB0aGlzLmVuYWJsZU5vdGljZTtcbiAgICAgICAgLy8gVGhlIGZpcnN0IC1mIHBhcmFtZXRlciBvdmVycmlkZXMgYW55IG90aGVyc1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gW10uY29uY2F0KFsnLWYnLCAnZ2NjJ10sIHRoaXMudXNlclBhcmFtZXRlcnMsIFsnLSddKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgc3RkaW46IHRleHQsIGN3ZCwgaWdub3JlRXhpdENvZGU6IHRydWUgfTtcbiAgICAgICAgcmV0dXJuIGhlbHBlcnMuZXhlYyh0aGlzLmV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCBvcHRpb25zKS50aGVuKChvdXRwdXQpID0+IHtcbiAgICAgICAgICBpZiAodGV4dEVkaXRvci5nZXRUZXh0KCkgIT09IHRleHQpIHtcbiAgICAgICAgICAgIC8vIFRoZSB0ZXh0IGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBsaW50IHdhcyB0cmlnZ2VyZWQsIHRlbGwgTGludGVyIG5vdCB0byB1cGRhdGVcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAgIGxldCBtYXRjaCA9IHJlZ2V4LmV4ZWMob3V0cHV0KTtcbiAgICAgICAgICB3aGlsZSAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBtYXRjaFszXTtcbiAgICAgICAgICAgIGlmIChzaG93QWxsIHx8IHR5cGUgPT09ICd3YXJuaW5nJyB8fCB0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMV0sIDEwKSAtIDE7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbCA9IE51bWJlci5wYXJzZUludChtYXRjaFsyXSwgMTApIC0gMTtcbiAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICByYW5nZTogaGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIGxpbmUsIGNvbCksXG4gICAgICAgICAgICAgICAgaHRtbDogbGlua2lmeUVycm9yQ29kZShtYXRjaFs0XSksXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2ggPSByZWdleC5leGVjKG91dHB1dCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/linter-shellcheck/lib/main.js
