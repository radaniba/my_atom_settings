(function() {
  var $, BufferedProcess, PyFlake8, Subscriber, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), $ = _ref.$, BufferedProcess = _ref.BufferedProcess;

  Subscriber = require('emissary').Subscriber;

  _ = require('underscore-plus');

  PyFlake8 = (function() {
    PyFlake8.prototype.SPLITTER = '@#@';

    function PyFlake8() {
      this.updateStatus = __bind(this.updateStatus, this);
      this.run = __bind(this.run, this);
      this.handleEvents = __bind(this.handleEvents, this);
      atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this));
    }

    PyFlake8.prototype.destroy = function() {
      return this.unsubscribe;
    };

    PyFlake8.prototype.handleEvents = function(editor) {
      var buffer;
      this.subscribe(atom.workspaceView, 'pane-container:active-pane-item-changed', (function(_this) {
        return function() {
          return _this.run(editor);
        };
      })(this));
      buffer = editor.getBuffer();
      this.subscribe(buffer, 'saved', (function(_this) {
        return function() {
          return buffer.transact(function() {
            return _this.run(editor);
          });
        };
      })(this));
      return this.subscribe(buffer, 'destroyed', (function(_this) {
        return function() {
          return _this.unsubscribe(buffer);
        };
      })(this));
    };

    PyFlake8.prototype.run = function(editor) {
      var args, command, exit, file_path, process, split, stderr, stdout;
      file_path = editor.getUri();
      if (!_.endsWith(file_path, '.py')) {
        return;
      }
      split = this.SPLITTER;
      command = 'flake8';
      args = ["--format=%(row)s" + split + "%(code)s" + split + "%(text)s", file_path];
      stdout = stderr = (function(_this) {
        return function(output) {
          var errors;
          errors = _this.parsePyFlake8Output(output);
          if (errors.length) {
            _this.updateGutter(errors);
            _this.subscribe(atom.workspaceView, 'cursor:moved', function() {
              if (editor.cursors[0]) {
                return _this.updateStatus(errors, editor.cursors[0].getBufferRow());
              }
            });
            return _this.subscribe(editor, 'scroll-top-changed', function() {
              return _this.updateGutter(errors);
            });
          } else {
            return _this.resetState();
          }
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this.resetState();
          }
        };
      })(this);
      return process = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    };

    PyFlake8.prototype.parsePyFlake8Output = function(output) {
      var code, errors, line, lines, row, text, _i, _len, _ref1;
      output = $.trim(output);
      lines = output.split('\n');
      errors = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        _ref1 = line.split(this.SPLITTER), row = _ref1[0], code = _ref1[1], text = _ref1[2];
        row = parseInt(row, 10);
        errors.push({
          row: row,
          code: code,
          text: text
        });
      }
      return errors;
    };

    PyFlake8.prototype.resetState = function(editor) {
      this.updateStatus(null);
      this.updateGutter([]);
      atom.workspaceView.off('cursor:moved');
      return this.unsubscribe(editor);
    };

    PyFlake8.prototype.updateStatus = function(errors, row) {
      var error, html, lineErrors, msg, status, _ref1;
      status = $('#pyflakes-status');
      if (status) {
        status.remove();
      }
      if (!errors || row < 0) {
        return;
      }
      lineErrors = errors.filter(function(error) {
        return error.row === row + 1;
      });
      if (lineErrors.length > 0) {
        error = lineErrors[0];
        msg = "Error: " + error.row + ": " + error.text;
      } else {
        msg = (_ref1 = errors.length) != null ? _ref1 : errors.length + {
          ' PyFlakes errors': ''
        };
      }
      html = '<span id="pyflakes-status" class="inline-block">' + msg + '</span>';
      return atom.workspaceView.statusBar.appendLeft(html);
    };

    PyFlake8.prototype.updateGutter = function(errors) {
      return atom.workspaceView.eachEditorView(function(editorView) {
        var gutter;
        if (editorView.active) {
          gutter = editorView.gutter;
          gutter.removeClassFromAllLines('atom-pyflakes-error');
          return errors.forEach(function(error) {
            return gutter.addClassToLine(error.row - 1, 'atom-pyflakes-error');
          });
        }
      });
    };

    return PyFlake8;

  })();

  Subscriber.includeInto(PyFlake8);

  module.exports = PyFlake8;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFDLFNBQUEsQ0FBRCxFQUFJLHVCQUFBLGVBQUosQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUlNO0FBRUosdUJBQUEsUUFBQSxHQUFVLEtBQVYsQ0FBQTs7QUFFYSxJQUFBLGtCQUFBLEdBQUE7QUFDWCx5REFBQSxDQUFBO0FBQUEsdUNBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUEwQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ3hCLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQUR3QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQUEsQ0FEVztJQUFBLENBRmI7O0FBQUEsdUJBTUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxZQURNO0lBQUEsQ0FOVCxDQUFBOztBQUFBLHVCQVNBLFlBQUEsR0FBYyxTQUFDLE1BQUQsR0FBQTtBQUNaLFVBQUEsTUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsYUFBaEIsRUFBK0IseUNBQS9CLEVBQTBFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3hFLEtBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUR3RTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFFLENB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
//# sourceURL=/Users/Rad/.atom/packages/atom-flake8/lib/pyflake8.coffee