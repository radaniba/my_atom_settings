(function() {
  var byline, flake, fs, process, validate;

  process = require('child_process');

  byline = require('byline');

  fs = require('fs');

  validate = function() {
    var editor, filePath;
    editor = atom.workspace.getActiveEditor();
    if (editor == null) {
      return;
    }
    if (editor.getGrammar().name !== 'Python') {
      return;
    }
    filePath = editor.getPath();
    return flake(filePath, function(errors) {
      var error, lines, message, msgPanel, _i, _len;
      msgPanel = require('atom-message-panel');
      if (atom.workspaceView.find('.am-panel').length !== 1) {
        msgPanel.init('<span class="icon-bug"></span> Flake8 report');
        atom.config.observe('flake8.useFoldModeAsDefault', {
          callNow: true
        }, function(value) {
          if (value === true) {
            return msgPanel.fold(0);
          }
        });
      } else {
        msgPanel.clear();
      }
      if (errors.length === 0) {
        msgPanel.append.header('√ No errors were found!', 'text-success');
        atom.workspaceView.find('.line-number').removeClass('text-error');
      } else {
        lines = [];
        for (_i = 0, _len = errors.length; _i < _len; _i++) {
          error = errors[_i];
          if (error.type) {
            message = error.type + " " + error.message;
          } else {
            message = error.message;
          }
          msgPanel.append.lineMessage(error.line, error.position, message, error.evidence, 'text-error');
          lines.push(error.line);
        }
        msgPanel.append.lineIndicators(lines, 'text-error');
      }
      return atom.workspaceView.on('pane-container:active-pane-item-changed destroyed', function() {
        msgPanel.destroy();
        return atom.workspaceView.find('.line-number').removeClass('text-error');
      });
    });
  };

  flake = function(filePath, callback) {
    var currentIndex, errors, flake8Path, ignoreErrors, line_expr, mcCabeComplexityThreshold, output, params, proc, skipLine;
    line_expr = /:(\d+):(\d+): ([CEFW]\d{3}) (.*)/;
    errors = [];
    currentIndex = -1;
    skipLine = false;
    params = ["--show-source", filePath];
    ignoreErrors = atom.config.get("flake8.ignoreErrors");
    mcCabeComplexityThreshold = atom.config.get("flake8.mcCabeComplexityThreshold");
    flake8Path = atom.config.get("flake8.flake8Path");
    if (!fs.existsSync(flake8Path)) {
      errors.push({
        "message": "Unable to get report, please check flake8 bin path",
        "evidence": flake8Path,
        "position": 1,
        "line": 1
      });
      callback(errors);
      return;
    }
    if (!!ignoreErrors) {
      params.push("--ignore=" + ignoreErrors);
    }
    if (!!mcCabeComplexityThreshold) {
      params.push("--max-complexity=" + mcCabeComplexityThreshold);
    }
    proc = process.spawn(flake8Path, params);
    output = byline(proc.stdout);
    output.on('data', (function(_this) {
      return function(line) {
        var matches, message, position, type, _;
        line = line.toString().replace(filePath, "");
        matches = line_expr.exec(line);
        if (matches) {
          _ = matches[0], line = matches[1], position = matches[2], type = matches[3], message = matches[4];
          errors.push({
            "message": message,
            "type": type,
            "position": parseInt(position),
            "line": parseInt(line)
          });
          currentIndex += 1;
          return skipLine = false;
        } else {
          if (!skipLine) {
            errors[currentIndex].evidence = line.toString().trim();
            return skipLine = true;
          }
        }
      };
    })(this));
    return proc.on('exit', function(exit_code, signal) {
      if (exit_code === 1 && errors.length === 0) {
        errors.push({
          "message": "flake8 is crashing, please check flake8 bin path or reinstall flake8",
          "evidence": flake8Path,
          "position": 1,
          "line": 1
        });
      }
      return callback(errors);
    });
  };

  module.exports = {
    configDefaults: {
      flake8Path: "/usr/local/bin/flake8",
      ignoreErrors: "",
      mcCabeComplexityThreshold: "",
      useFoldModeAsDefault: false,
      validateOnSave: true
    },
    activate: function(state) {
      atom.workspaceView.command("flake8:run", (function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
      return atom.config.observe('flake8.validateOnSave', {
        callNow: true
      }, function(value) {
        if (value === true) {
          return atom.workspace.eachEditor(function(editor) {
            return editor.buffer.on('saved', validate);
          });
        } else {
          return atom.workspace.eachEditor(function(editor) {
            return editor.buffer.off('saved', validate);
          });
        }
      });
    },
    run: function() {
      return validate();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZ0JBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFDQSxJQUFBLElBQWMsY0FBZDtBQUFBLFlBQUEsQ0FBQTtLQURBO0FBRUEsSUFBQSxJQUFjLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxJQUFwQixLQUE0QixRQUExQztBQUFBLFlBQUEsQ0FBQTtLQUZBO0FBQUEsSUFJQSxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUpYLENBQUE7V0FNQSxLQUFBLENBQU0sUUFBTixFQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEseUNBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVIsQ0FBWCxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxNQUFyQyxLQUErQyxDQUFsRDtBQUNFLFFBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyw4Q0FBZCxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQ7QUFBQSxVQUFDLE9BQUEsRUFBUyxJQUFWO1NBQW5ELEVBQW9FLFNBQUMsS0FBRCxHQUFBO0FBQ2xFLFVBQUEsSUFB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
//# sourceURL=/Users/Rad/.atom/packages/flake8/lib/flake8.coffee