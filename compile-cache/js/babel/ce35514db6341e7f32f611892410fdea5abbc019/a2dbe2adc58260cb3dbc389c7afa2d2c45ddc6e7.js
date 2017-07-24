Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideLinter = provideLinter;

/**
 * Note that this can't be loaded lazily as `atom` doesn't export it correctly
 * for that, however as this comes from app.asar it is pre-compiled and is
 * essentially "free" as there is no expensive compilation step.
 */

var _atom = require('atom');

// Some local variables
'use babel';

var lazyReq = require('lazy-req')(require);

var _lazyReq = lazyReq('path')('basename', 'delimiter', 'dirname');

var basename = _lazyReq.basename;
var delimiter = _lazyReq.delimiter;
var dirname = _lazyReq.dirname;

var _lazyReq2 = lazyReq('atom-linter')('exec', 'parse', 'rangeFromLineNumber', 'tempFile');

var exec = _lazyReq2.exec;
var parse = _lazyReq2.parse;
var rangeFromLineNumber = _lazyReq2.rangeFromLineNumber;
var tempFile = _lazyReq2.tempFile;

var os = lazyReq('os');var subscriptions = undefined;
var errorWhitelist = [/^No config file found, using default configuration$/];
var lineRegex = '(?<line>\\d+),(?<col>\\d+),(?<type>\\w+),(\\w\\d+):(?<message>.*)\\r?(\\n|$)';

// Settings
var executable = undefined;
var rcFile = undefined;
var messageFormat = undefined;
var pythonPath = undefined;
var workingDirectory = undefined;

function activate() {
  require('atom-package-deps').install('linter-pylint');

  subscriptions = new _atom.CompositeDisposable();

  // FIXME: This should be executablePath, saved for a major version bump
  subscriptions.add(atom.config.observe('linter-pylint.executable', function (value) {
    executable = value;
  }));
  subscriptions.add(atom.config.observe('linter-pylint.rcFile', function (value) {
    rcFile = value;
  }));
  subscriptions.add(atom.config.observe('linter-pylint.messageFormat', function (value) {
    messageFormat = value;
  }));
  subscriptions.add(atom.config.observe('linter-pylint.pythonPath', function (value) {
    pythonPath = value;
  }));
  subscriptions.add(atom.config.observe('linter-pylint.workingDirectory', function (value) {
    workingDirectory = value.replace(delimiter, '');
  }));
}

function deactivate() {
  subscriptions.dispose();
}

function getProjectDir(filePath) {
  var atomProject = atom.project.relativizePath(filePath)[0];
  if (atomProject === null) {
    // Default project dirextory to file directory if path cannot be determined
    return dirname(filePath);
  }
  return atomProject;
}

function filterWhitelistedErrors(stderr) {
  // Split the input and remove blank lines
  var lines = stderr.split(os().EOL).filter(function (line) {
    return !!line;
  });
  var filteredLines = lines.filter(function (line) {
    return(
      // Only keep the line if it is not ignored
      !errorWhitelist.some(function (errorRegex) {
        return errorRegex.test(line);
      })
    );
  });
  return filteredLines.join(os().EOL);
}

function provideLinter() {
  return {
    name: 'Pylint',
    grammarScopes: ['source.python'],
    scope: 'file',
    lintOnFly: true,
    lint: function lint(editor) {
      var filePath = editor.getPath();
      var fileDir = dirname(filePath);
      var fileText = editor.getText();
      var projectDir = getProjectDir(filePath);
      var cwd = workingDirectory.replace(/%f/g, fileDir).replace(/%p/g, projectDir);
      var execPath = executable.replace(/%p/g, projectDir);
      var format = messageFormat;
      var patterns = {
        '%m': 'msg',
        '%i': 'msg_id',
        '%s': 'symbol'
      };
      Object.keys(patterns).forEach(function (pattern) {
        format = format.replace(new RegExp(pattern, 'g'), '{' + patterns[pattern] + '}');
      });
      var env = Object.create(process.env, {
        PYTHONPATH: {
          value: [process.env.PYTHONPATH, fileDir, projectDir, pythonPath.replace(/%f/g, fileDir).replace(/%p/g, projectDir)].filter(function (x) {
            return !!x;
          }).join(delimiter),
          enumerable: true
        },
        LANG: { value: 'en_US.UTF-8', enumerable: true }
      });

      var args = ['--msg-template=\'{line},{column},{category},{msg_id}:' + format + '\'', '--reports=n', '--output-format=text'];
      if (rcFile) {
        args.push('--rcfile=' + rcFile.replace(/%p/g, projectDir).replace(/%f/g, fileDir));
      }
      return tempFile(basename(filePath), fileText, function (tmpFileName) {
        args.push(tmpFileName);
        return exec(execPath, args, { env: env, cwd: cwd, stream: 'both' }).then(function (data) {
          var filteredErrors = filterWhitelistedErrors(data.stderr);
          if (filteredErrors) {
            throw new Error(filteredErrors);
          }
          return parse(data.stdout, lineRegex, { filePath: filePath }).filter(function (issue) {
            return issue.type !== 'info';
          }).map(function (issue) {
            var _issue$range = _slicedToArray(issue.range, 2);

            var _issue$range$0 = _slicedToArray(_issue$range[0], 2);

            var lineStart = _issue$range$0[0];
            var colStart = _issue$range$0[1];

            var _issue$range$1 = _slicedToArray(_issue$range[1], 2);

            var lineEnd = _issue$range$1[0];
            var colEnd = _issue$range$1[1];

            if (lineStart === lineEnd && (colStart <= colEnd || colEnd <= 0)) {
              Object.assign(issue, {
                range: rangeFromLineNumber(editor, lineStart, colStart)
              });
            }
            return issue;
          });
        });
      });
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXB5bGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQWVvQyxNQUFNOzs7QUFmMUMsV0FBVyxDQUFDOztBQUVaLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7ZUFDSixPQUFPLENBQUMsTUFBTSxDQUFDLENBQ3RELFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUNuQzs7SUFGTyxRQUFRLFlBQVIsUUFBUTtJQUFFLFNBQVMsWUFBVCxTQUFTO0lBQUUsT0FBTyxZQUFQLE9BQU87O2dCQUdtQixPQUFPLENBQUMsYUFBYSxDQUFDLENBQzNFLE1BQU0sRUFBRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxDQUNuRDs7SUFGTyxJQUFJLGFBQUosSUFBSTtJQUFFLEtBQUssYUFBTCxLQUFLO0lBQUUsbUJBQW1CLGFBQW5CLG1CQUFtQjtJQUFFLFFBQVEsYUFBUixRQUFROztBQUdsRCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQUFTekIsSUFBSSxhQUFhLFlBQUEsQ0FBQztBQUNsQixJQUFNLGNBQWMsR0FBRyxDQUNyQixxREFBcUQsQ0FDdEQsQ0FBQztBQUNGLElBQU0sU0FBUyxHQUFHLDhFQUE4RSxDQUFDOzs7QUFHakcsSUFBSSxVQUFVLFlBQUEsQ0FBQztBQUNmLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksVUFBVSxZQUFBLENBQUM7QUFDZixJQUFJLGdCQUFnQixZQUFBLENBQUM7O0FBRWQsU0FBUyxRQUFRLEdBQUc7QUFDekIsU0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUV0RCxlQUFhLEdBQUcsK0JBQXlCLENBQUM7OztBQUcxQyxlQUFhLENB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QU8sS0FBSyxDQUFDO1dBQ2QsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcHlsaW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IGxhenlSZXEgPSByZXF1aXJlKCdsYXp5LXJlcScpKHJlcXVpcmUpO1xuY29uc3QgeyBiYXNlbmFtZSwgZGVsaW1pdGVyLCBkaXJuYW1lIH0gPSBsYXp5UmVxKCdwYXRoJykoXG4gICdiYXNlbmFtZScsICdkZWxpbWl0ZXInLCAnZGlybmFtZSdcbik7XG5jb25zdCB7IGV4ZWMsIHBhcnNlLCByYW5nZUZyb21MaW5lTnVtYmVyLCB0ZW1wRmlsZSB9ID0gbGF6eVJlcSgnYXRvbS1saW50ZXInKShcbiAgJ2V4ZWMnLCAncGFyc2UnLCAncmFuZ2VGcm9tTGluZU51bWJlcicsICd0ZW1wRmlsZSdcbik7XG5jb25zdCBvcyA9IGxhenlSZXEoJ29zJyk7XG4vKipcbiAqIE5vdGUgdGhhdCB0aGlzIGNhbid0IGJlIGxvYWRlZCBsYXppbHkgYXMgYGF0b21gIGRvZXNuJ3QgZXhwb3J0IGl0IGNvcnJlY3RseVxuICogZm9yIHRoYXQsIGhvd2V2ZXIgYXMgdGhpcyBjb21lcyBmcm9tIGFwcC5hc2FyIGl0IGlzIHByZS1jb21waWxlZCBhbmQgaXNcbiAqIGVzc2VudGlhbGx5IFwiZnJlZVwiIGFzIHRoZXJlIGlzIG5vIGV4cGVuc2l2ZSBjb21waWxhdGlvbiBzdGVwLlxuICovXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbi8vIFNvbWUgbG9jYWwgdmFyaWFibGVzXG5sZXQgc3Vic2NyaXB0aW9ucztcbmNvbnN0IGVycm9yV2hpdGVsaXN0ID0gW1xuICAvXk5vIGNvbmZpZyBmaWxlIGZvdW5kLCB1c2luZyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24kLyxcbl07XG5jb25zdCBsaW5lUmVnZXggPSAnKD88bGluZT5cXFxcZCspLCg/PGNvbD5cXFxcZCspLCg/PHR5cGU+XFxcXHcrKSwoXFxcXHdcXFxcZCspOig/PG1lc3NhZ2U+LiopXFxcXHI/KFxcXFxufCQpJztcblxuLy8gU2V0dGluZ3NcbmxldCBleGVjdXRhYmxlO1xubGV0IHJjRmlsZTtcbmxldCBtZXNzYWdlRm9ybWF0O1xubGV0IHB5dGhvblBhdGg7XG5sZXQgd29ya2luZ0RpcmVjdG9yeTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1weWxpbnQnKTtcblxuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAvLyBGSVhNRTogVGhpcyBzaG91bGQgYmUgZXhlY3V0YWJsZVBhdGgsIHNhdmVkIGZvciBhIG1ham9yIHZlcnNpb24gYnVtcFxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItcHlsaW50LmV4ZWN1dGFibGUnLCB2YWx1ZSA9PiB7XG4gICAgZXhlY3V0YWJsZSA9IHZhbHVlO1xuICB9KSk7XG4gIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1weWxpbnQucmNGaWxlJywgdmFsdWUgPT4ge1xuICAgIHJjRmlsZSA9IHZhbHVlO1xuICB9KSk7XG4gIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1weWxpbnQubWVzc2FnZUZvcm1hdCcsIHZhbHVlID0+IHtcbiAgICBtZXNzYWdlRm9ybWF0ID0gdmFsdWU7XG4gIH0pKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXB5bGludC5weXRob25QYXRoJywgdmFsdWUgPT4ge1xuICAgIHB5dGhvblBhdGggPSB2YWx1ZTtcbiAgfSkpO1xuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItcHlsaW50LndvcmtpbmdEaXJlY3RvcnknLCB2YWx1ZSA9PiB7XG4gICAgd29ya2luZ0RpcmVjdG9yeSA9IHZhbHVlLnJlcGxhY2UoZGVsaW1pdGVyLCAnJyk7XG4gIH0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9qZWN0RGlyKGZpbGVQYXRoKSB7XG4gIGNvbnN0IGF0b21Qcm9qZWN0ID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXTtcbiAgaWYgKGF0b21Qcm9qZWN0ID09PSBudWxsKSB7XG4gICAgLy8gRGVmYXVsdCBwcm9qZWN0IGRpcmV4dG9yeSB0byBmaWxlIGRpcmVjdG9yeSBpZiBwYXRoIGNhbm5vdCBiZSBkZXRlcm1pbmVkXG4gICAgcmV0dXJuIGRpcm5hbWUoZmlsZVBhdGgpO1xuICB9XG4gIHJldHVybiBhdG9tUHJvamVjdDtcbn1cblxuZnVuY3Rpb24gZmlsdGVyV2hpdGVsaXN0ZWRFcnJvcnMoc3RkZXJyKSB7XG4gIC8vIFNwbGl0IHRoZSBpbnB1dCBhbmQgcmVtb3ZlIGJsYW5rIGxpbmVzXG4gIGNvbnN0IGxpbmVzID0gc3RkZXJyLnNwbGl0KG9zKCkuRU9MKS5maWx0ZXIobGluZSA9PiAhIWxpbmUpO1xuICBjb25zdCBmaWx0ZXJlZExpbmVzID0gbGluZXMuZmlsdGVyKGxpbmUgPT5cbiAgICAvLyBPbmx5IGtlZXAgdGhlIGxpbmUgaWYgaXQgaXMgbm90IGlnbm9yZWRcbiAgICAhZXJyb3JXaGl0ZWxpc3Quc29tZShlcnJvclJlZ2V4ID0+IGVycm9yUmVnZXgudGVzdChsaW5lKSlcbiAgKTtcbiAgcmV0dXJuIGZpbHRlcmVkTGluZXMuam9pbihvcygpLkVPTCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTGludGVyKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdQeWxpbnQnLFxuICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLnB5dGhvbiddLFxuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgbGludE9uRmx5OiB0cnVlLFxuICAgIGxpbnQ6IChlZGl0b3IpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBkaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGZpbGVUZXh0ID0gZWRpdG9yLmdldFRleHQoKTtcbiAgICAgIGNvbnN0IHByb2plY3REaXIgPSBnZXRQcm9qZWN0RGlyKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGN3ZCA9IHdvcmtpbmdEaXJlY3RvcnkucmVwbGFjZSgvJWYvZywgZmlsZURpcikucmVwbGFjZSgvJXAvZywgcHJvamVjdERpcik7XG4gICAgICBjb25zdCBleGVjUGF0aCA9IGV4ZWN1dGFibGUucmVwbGFjZSgvJXAvZywgcHJvamVjdERpcik7XG4gICAgICBsZXQgZm9ybWF0ID0gbWVzc2FnZUZvcm1hdDtcbiAgICAgIGNvbnN0IHBhdHRlcm5zID0ge1xuICAgICAgICAnJW0nOiAnbXNnJyxcbiAgICAgICAgJyVpJzogJ21zZ19pZCcsXG4gICAgICAgICclcyc6ICdzeW1ib2wnLFxuICAgICAgfTtcbiAgICAgIE9iamVjdC5rZXlzKHBhdHRlcm5zKS5mb3JFYWNoKHBhdHRlcm4gPT4ge1xuICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksIGB7JHtwYXR0ZXJuc1twYXR0ZXJuXX19YCk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGVudiA9IE9iamVjdC5jcmVhdGUocHJvY2Vzcy5lbnYsIHtcbiAgICAgICAgUFlUSE9OUEFUSDoge1xuICAgICAgICAgIHZhbHVlOiBbXG4gICAgICAgICAgICBwcm9jZXNzLmVudi5QWVRIT05QQVRILCBmaWxlRGlyLCBwcm9qZWN0RGlyLFxuICAgICAgICAgICAgcHl0aG9uUGF0aC5yZXBsYWNlKC8lZi9nLCBmaWxlRGlyKS5yZXBsYWNlKC8lcC9nLCBwcm9qZWN0RGlyKSxcbiAgICAgICAgICBdLmZpbHRlcih4ID0+ICEheCkuam9pbihkZWxpbWl0ZXIpLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIExBTkc6IHsgdmFsdWU6ICdlbl9VUy5VVEYtOCcsIGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICBgLS1tc2ctdGVtcGxhdGU9J3tsaW5lfSx7Y29sdW1ufSx7Y2F0ZWdvcnl9LHttc2dfaWR9OiR7Zm9ybWF0fSdgLFxuICAgICAgICAnLS1yZXBvcnRzPW4nLFxuICAgICAgICAnLS1vdXRwdXQtZm9ybWF0PXRleHQnLFxuICAgICAgXTtcbiAgICAgIGlmIChyY0ZpbGUpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXJjZmlsZT0ke3JjRmlsZS5yZXBsYWNlKC8lcC9nLCBwcm9qZWN0RGlyKS5yZXBsYWNlKC8lZi9nLCBmaWxlRGlyKX1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZW1wRmlsZShiYXNlbmFtZShmaWxlUGF0aCksIGZpbGVUZXh0LCAodG1wRmlsZU5hbWUpID0+IHtcbiAgICAgICAgYXJncy5wdXNoKHRtcEZpbGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIGV4ZWMoZXhlY1BhdGgsIGFyZ3MsIHsgZW52LCBjd2QsIHN0cmVhbTogJ2JvdGgnIH0pLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRFcnJvcnMgPSBmaWx0ZXJXaGl0ZWxpc3RlZEVycm9ycyhkYXRhLnN0ZGVycik7XG4gICAgICAgICAgaWYgKGZpbHRlcmVkRXJyb3JzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZmlsdGVyZWRFcnJvcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcGFyc2UoZGF0YS5zdGRvdXQsIGxpbmVSZWdleCwgeyBmaWxlUGF0aCB9KVxuICAgICAgICAgICAgLmZpbHRlcihpc3N1ZSA9PiBpc3N1ZS50eXBlICE9PSAnaW5mbycpXG4gICAgICAgICAgICAubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgW1tsaW5lU3RhcnQsIGNvbFN0YXJ0XSwgW2xpbmVFbmQsIGNvbEVuZF1dID0gaXNzdWUucmFuZ2U7XG4gICAgICAgICAgICAgIGlmIChsaW5lU3RhcnQgPT09IGxpbmVFbmQgJiYgKGNvbFN0YXJ0IDw9IGNvbEVuZCB8fCBjb2xFbmQgPD0gMCkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGlzc3VlLCB7XG4gICAgICAgICAgICAgICAgICByYW5nZTogcmFuZ2VGcm9tTGluZU51bWJlcihlZGl0b3IsIGxpbmVTdGFydCwgY29sU3RhcnQpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBpc3N1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/linter-pylint/lib/main.js
