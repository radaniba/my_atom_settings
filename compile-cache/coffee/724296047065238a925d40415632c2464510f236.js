(function() {
  var $$, AnsiFilter, BufferedProcess, CodeContext, HeaderView, ScriptOptionsView, ScriptView, View, grammarMap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  grammarMap = require('./grammars');

  _ref = require('atom'), View = _ref.View, BufferedProcess = _ref.BufferedProcess, $$ = _ref.$$;

  CodeContext = require('./code-context');

  HeaderView = require('./header-view');

  ScriptOptionsView = require('./script-options-view');

  AnsiFilter = require('ansi-to-html');

  _ = require('underscore');

  module.exports = ScriptView = (function(_super) {
    __extends(ScriptView, _super);

    function ScriptView() {
      return ScriptView.__super__.constructor.apply(this, arguments);
    }

    ScriptView.bufferedProcess = null;

    ScriptView.content = function() {
      return this.div((function(_this) {
        return function() {
          var css;
          _this.subview('headerView', new HeaderView());
          css = 'tool-panel panel panel-bottom padding script-view native-key-bindings';
          return _this.div({
            "class": css,
            outlet: 'script',
            tabindex: -1
          }, function() {
            return _this.div({
              "class": 'panel-body padded output',
              outlet: 'output'
            });
          });
        };
      })(this));
    };

    ScriptView.prototype.initialize = function(serializeState, runOptions) {
      this.runOptions = runOptions;
      atom.workspaceView.command('script:run', (function(_this) {
        return function() {
          return _this.defaultRun();
        };
      })(this));
      atom.workspaceView.command('script:run-at-line', (function(_this) {
        return function() {
          return _this.lineRun();
        };
      })(this));
      atom.workspaceView.command('script:close-view', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
      atom.workspaceView.command('script:kill-process', (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this));
      return this.ansiFilter = new AnsiFilter;
    };

    ScriptView.prototype.serialize = function() {};

    ScriptView.prototype.updateOptions = function(event) {
      return this.runOptions = event.runOptions;
    };

    ScriptView.prototype.initCodeContext = function(editor) {
      var codeContext, filename, filepath, lang, selection, textSource;
      filename = editor.getTitle();
      filepath = editor.getPath();
      selection = editor.getSelection();
      if (selection.isEmpty()) {
        textSource = editor;
      } else {
        textSource = selection;
      }
      codeContext = new CodeContext(filename, filepath, textSource);
      codeContext.selection = selection;
      lang = this.getLang(editor);
      if (this.validateLang(lang)) {
        codeContext.lang = lang;
      }
      return codeContext;
    };

    ScriptView.prototype.lineRun = function() {
      var codeContext;
      this.resetView();
      codeContext = this.buildCodeContext('Line Based');
      if (!(codeContext == null)) {
        return this.start(codeContext);
      }
    };

    ScriptView.prototype.defaultRun = function() {
      var codeContext;
      this.resetView();
      codeContext = this.buildCodeContext();
      if (!(codeContext == null)) {
        return this.start(codeContext);
      }
    };

    ScriptView.prototype.buildCodeContext = function(argType) {
      var codeContext, cursor, editor;
      if (argType == null) {
        argType = 'Selection Based';
      }
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      codeContext = this.initCodeContext(editor);
      codeContext.argType = argType;
      if (argType === 'Line Based') {
        editor.save();
      } else if (codeContext.selection.isEmpty() && (codeContext.filepath != null)) {
        codeContext.argType = 'File Based';
        editor.save();
      }
      if (argType !== 'File Based') {
        cursor = editor.getCursor();
        codeContext.lineNumber = cursor.getScreenRow() + 1;
      }
      return codeContext;
    };

    ScriptView.prototype.start = function(codeContext) {
      var commandContext;
      if (codeContext.lang == null) {
        return;
      }
      commandContext = this.setupRuntime(codeContext);
      if (commandContext) {
        return this.run(commandContext.command, commandContext.args);
      }
    };

    ScriptView.prototype.resetView = function(title) {
      if (title == null) {
        title = 'Loading...';
      }
      if (!this.hasParent()) {
        atom.workspaceView.prependToBottom(this);
      }
      this.stop();
      this.headerView.title.text(title);
      this.headerView.setStatus('start');
      return this.output.empty();
    };

    ScriptView.prototype.close = function() {
      this.stop();
      if (this.hasParent()) {
        return this.detach();
      }
    };

    ScriptView.prototype.getLang = function(editor) {
      return editor.getGrammar().name;
    };

    ScriptView.prototype.validateLang = function(lang) {
      var err;
      err = null;
      if (lang === 'Null Grammar' || lang === 'Plain Text') {
        err = $$(function() {
          return this.p('You must select a language in the lower left, or save the file with an appropriate extension.');
        });
      } else if (!(lang in grammarMap)) {
        err = $$(function() {
          this.p({
            "class": 'block'
          }, "Command not configured for " + lang + "!");
          return this.p({
            "class": 'block'
          }, (function(_this) {
            return function() {
              _this.text('Add an ');
              _this.a({
                href: "https://github.com/rgbkrk/atom-script/issues/new?title=Add%20support%20for%20" + lang
              }, 'issue on GitHub');
              return _this.text(' or send your own Pull Request.');
            };
          })(this));
        });
      }
      if (err != null) {
        this.handleError(err);
        return false;
      }
      return true;
    };

    ScriptView.prototype.setupRuntime = function(codeContext) {
      var buildArgsArray, commandContext, err, error;
      commandContext = {};
      try {
        if ((this.runOptions.cmd == null) || this.runOptions.cmd === '') {
          commandContext.command = grammarMap[codeContext.lang][codeContext.argType].command;
        } else {
          commandContext.command = this.runOptions.cmd;
        }
        buildArgsArray = grammarMap[codeContext.lang][codeContext.argType].args;
      } catch (_error) {
        error = _error;
        err = $$(function() {
          this.p({
            "class": 'block'
          }, "" + codeContext.argType + " runner not available for " + codeContext.lang + ".");
          return this.p({
            "class": 'block'
          }, (function(_this) {
            return function() {
              _this.text('If it should exist, add an ');
              _this.a({
                href: "https://github.com/rgbkrk/atom-script/issues/new?title=Add%20support%20for%20" + codeContext.lang
              }, 'issue on GitHub');
              return _this.text(', or send your own pull request.');
            };
          })(this));
        });
        this.handleError(err);
        return false;
      }
      if (codeContext.argType === 'Line Based') {
        this.headerView.title.text("" + codeContext.lang + " - " + (codeContext.fileColonLine(false)));
      } else {
        this.headerView.title.text("" + codeContext.lang + " - " + codeContext.filename);
      }
      commandContext.args = buildArgsArray(codeContext);
      return commandContext;
    };

    ScriptView.prototype.handleError = function(err) {
      this.headerView.title.text('Error');
      this.headerView.setStatus('err');
      this.output.append(err);
      return this.stop();
    };

    ScriptView.prototype.run = function(command, extraArgs) {
      var args, exit, options, stderr, stdout;
      atom.emit('achievement:unlock', {
        msg: 'Homestar Runner'
      });
      options = {
        cwd: this.getCwd(),
        env: process.env
      };
      args = (this.runOptions.cmdArgs.concat(extraArgs)).concat(this.runOptions.scriptArgs);
      stdout = (function(_this) {
        return function(output) {
          return _this.display('stdout', output);
        };
      })(this);
      stderr = (function(_this) {
        return function(output) {
          return _this.display('stderr', output);
        };
      })(this);
      exit = (function(_this) {
        return function(returnCode) {
          if (returnCode === 0) {
            _this.headerView.setStatus('stop');
          } else {
            _this.headerView.setStatus('err');
          }
          return console.log("Exited with " + returnCode);
        };
      })(this);
      this.bufferedProcess = new BufferedProcess({
        command: command,
        args: args,
        options: options,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      return this.bufferedProcess.process.on('error', (function(_this) {
        return function(nodeError) {
          return _this.output.append($$(function() {
            this.h1('Unable to run');
            this.pre(_.escape(command));
            this.h2('Is it on your path?');
            return this.pre("PATH: " + (_.escape(process.env.PATH)));
          }));
        };
      })(this));
    };

    ScriptView.prototype.getCwd = function() {
      if ((this.runOptions.workingDirectory == null) || this.runOptions.workingDirectory === '') {
        return atom.project.getPath();
      } else {
        return this.runOptions.workingDirectory;
      }
    };

    ScriptView.prototype.stop = function() {
      if ((this.bufferedProcess != null) && (this.bufferedProcess.process != null)) {
        this.display('stdout', '^C');
        this.headerView.setStatus('kill');
        return this.bufferedProcess.kill();
      }
    };

    ScriptView.prototype.display = function(css, line) {
      line = _.escape(line);
      line = this.ansiFilter.toHtml(line);
      return this.output.append($$(function() {
        return this.pre({
          "class": "line " + css
        }, (function(_this) {
          return function() {
            return _this.raw(line);
          };
        })(this));
      }));
    };

    return ScriptView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0EsT0FBOEIsT0FBQSxDQUFRLE1BQVIsQ0FBOUIsRUFBQyxZQUFBLElBQUQsRUFBTyx1QkFBQSxlQUFQLEVBQXdCLFVBQUEsRUFEeEIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FGZCxDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSGIsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUpwQixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQU5KLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLGVBQUQsR0FBa0IsSUFBbEIsQ0FBQTs7QUFBQSxJQUVBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0gsY0FBQSxHQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxVQUFBLENBQUEsQ0FBM0IsQ0FBQSxDQUFBO0FBQUEsVUFHQSxHQUFBLEdBQU0sdUVBSE4sQ0FBQTtpQkFLQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sR0FBUDtBQUFBLFlBQVksTUFBQSxFQUFRLFFBQXBCO0FBQUEsWUFBOEIsUUFBQSxFQUFVLENBQUEsQ0FBeEM7V0FBTCxFQUFpRCxTQUFBLEdBQUE7bUJBQy9DLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTywwQkFBUDtBQUFBLGNBQW1DLE1BQUEsRUFBUSxRQUEzQzthQUFMLEVBRCtDO1VBQUEsQ0FBakQsRUFORztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFEUTtJQUFBLENBRlYsQ0FBQTs7QUFBQSx5QkFZQSxVQUFBLEdBQVksU0FBQyxjQUFELEVBQWtCLFVBQWxCLEdBQUE7QUFFVixNQUYyQixJQUFDLENBQUEsYUFBQSxVQUU1QixDQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLFlBQTNCLEVBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLG9CQUEzQixFQUFpRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpELENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixtQkFBM0IsRUFBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIscUJBQTNCLEVBQWtELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQsQ0FIQSxDQUFBO2FBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFBLENBQUEsV0FQSjtJQUFBLENBWlosQ0FBQTs7QUFBQSx5QkFxQkEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQXJCWCxDQUFBOztBQUFBLHlCQXVCQSxhQUFBLEdBQWUsU0FBQyxLQUFELEdBQUE7YUFBVyxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQUssQ0FBQyxXQUEvQjtJQUFBLENBdkJmLENBQUE7O0FBQUEseUJBeUJBLGVBQUEsR0FBaUIsU0FBQyxNQUFELEdBQUE7QUFDZixVQUFBLDREQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFYLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBLENBRFgsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FGWixDQUFBO0FBTUEsTUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtBQUNFLFFBQUEsVUFBQSxHQUFhLE1BQWIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLFVBQUEsR0FBYSxTQUFiLENBSEY7T0FOQTtBQUFBLE1BV0EsV0FBQSxHQUFrQixJQUFBLFdBQUEsQ0FBWSxRQUFaLEVBQXNCLFFBQXRCLEVBQWdDLFVBQWhDLENBWGxCLENBQUE7QUFBQSxNQVlBLFdBQVcsQ0FBQyxTQUFaLEdBQXdCLFNBWnhCLENBQUE7QUFBQSxNQWVBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQsQ0FmUCxDQUFBO0FBaUJBLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsQ0FBSDtBQUNFLFFBQUEsV0FBVyxDQUFDLElBQVosR0FBbUIsSUFBbkIsQ0FERjtPQWpCQTtBQW9CQSxhQUFPLFdBQVAsQ0FyQmU7SUFBQSxDQXpCakIsQ0FBQTs7QUFBQSx5QkFnREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsWUFBbEIsQ0FEZCxDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEscUJBQUE7ZUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLFdBQVAsRUFBQTtPQUhPO0lBQUEsQ0FoRFQsQ0FBQTs7QUFBQSx5QkFxREEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQURkLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxxQkFBQTtlQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sV0FBUCxFQUFBO09BSFU7SUFBQSxDQXJEWixDQUFBOztBQUFBLHlCQTBEQSxnQkFBQSxHQUFrQixTQUFDLE9BQUQsR0FBQTtBQUVoQixVQUFBLDJCQUFBOztRQUZpQixVQUFRO09BRXpCO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBVCxDQUFBO0FBRUEsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FGQTtBQUFBLE1BSUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLENBSmQsQ0FBQTtBQUFBLE1BTUEsV0FBVyxDQUFDLE9BQVosR0FBc0IsT0FOdEIsQ0FBQTtBQVFBLE1BQUEsSUFBRyxPQUFBLEtBQVcsWUFBZDtBQUNFLFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFBLENBREY7T0FBQSxNQUVLLElBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUF0QixDQUFBLENBQUEsSUFBb0MsOEJBQXZDO0FBQ0gsUUFBQSxXQUFXLENBQUMsT0FBWixHQUFzQixZQUF0QixDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBREEsQ0FERztPQVZMO0FBZ0JBLE1BQUEsSUFBTyxPQUFBLEtBQVcsWUFBbEI7QUFDRSxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLFFBQ0EsV0FBVyxDQUFDLFVBQVosR0FBeUIsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEdBQXdCLENBRGpELENBREY7T0FoQkE7QUFvQkEsYUFBTyxXQUFQLENBdEJnQjtJQUFBLENBMURsQixDQUFBOztBQUFBLHlCQWtGQSxLQUFBLEdBQU8sU0FBQyxXQUFELEdBQUE7QUFHTCxVQUFBLGNBQUE7QUFBQSxNQUFBLElBQU8sd0JBQVA7QUFHRSxjQUFBLENBSEY7T0FBQTtBQUFBLE1BS0EsY0FBQSxHQUFpQixJQUFDLENBQUEsWUFBRCxDQUFjLFdBQWQsQ0FMakIsQ0FBQTtBQU1BLE1BQUEsSUFBb0QsY0FBcEQ7ZUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQWMsQ0FBQyxPQUFwQixFQUE2QixjQUFjLENBQUMsSUFBNUMsRUFBQTtPQVRLO0lBQUEsQ0FsRlAsQ0FBQTs7QUFBQSx5QkE2RkEsU0FBQSxHQUFXLFNBQUMsS0FBRCxHQUFBOztRQUFDLFFBQVE7T0FJbEI7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFnRCxDQUFBLFNBQUQsQ0FBQSxDQUEvQztBQUFBLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFuQixDQUFtQyxJQUFuQyxDQUFBLENBQUE7T0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQWxCLENBQXVCLEtBQXZCLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCLE9BQXRCLENBTkEsQ0FBQTthQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBLEVBYlM7SUFBQSxDQTdGWCxDQUFBOztBQUFBLHlCQTRHQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsTUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBYSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWI7ZUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBQUE7T0FISztJQUFBLENBNUdQLENBQUE7O0FBQUEseUJBaUhBLE9BQUEsR0FBUyxTQUFDLE1BQUQsR0FBQTthQUFZLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxLQUFoQztJQUFBLENBakhULENBQUE7O0FBQUEseUJBbUhBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLElBQU4sQ0FBQTtBQUdBLE1BQUEsSUFBRyxJQUFBLEtBQVEsY0FBUixJQUEwQixJQUFBLEtBQVEsWUFBckM7QUFDRSxRQUFBLEdBQUEsR0FBTSxFQUFBLENBQUcsU0FBQSxHQUFBO2lCQUNQLElBQUMsQ0FBQSxDQUFELENBQUcsK0ZBQUgsRUFETztRQUFBLENBQUgsQ0FBTixDQURGO09BQUEsTUFPSyxJQUFHLENBQUEsQ0FBSyxJQUFBLElBQVEsVUFBVCxDQUFQO0FBQ0gsUUFBQSxHQUFBLEdBQU0sRUFBQSxDQUFHLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBSCxFQUFvQiw2QkFBQSxHQUE0QixJQUE1QixHQUFrQyxHQUF0RCxDQUFBLENBQUE7aUJBQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBSCxFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtBQUNqQixjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxJQUFBLEVBQU8sK0VBQUEsR0FDeUIsSUFEaEM7ZUFBSCxFQUM0QyxpQkFENUMsQ0FEQSxDQUFBO3FCQUdBLEtBQUMsQ0FBQSxJQUFELENBQU0saUNBQU4sRUFKaUI7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQUZPO1FBQUEsQ0FBSCxDQUFOLENBREc7T0FWTDtBQW1CQSxNQUFBLElBQUcsV0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLENBQUEsQ0FBQTtBQUNBLGVBQU8sS0FBUCxDQUZGO09BbkJBO0FBdUJBLGFBQU8sSUFBUCxDQXhCWTtJQUFBLENBbkhkLENBQUE7O0FBQUEseUJBNklBLFlBQUEsR0FBYyxTQUFDLFdBQUQsR0FBQTtBQUdaLFVBQUEsMENBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsRUFBakIsQ0FBQTtBQUVBO0FBQ0UsUUFBQSxJQUFPLDZCQUFKLElBQXdCLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixLQUFtQixFQUE5QztBQUVFLFVBQUEsY0FBYyxDQUFDLE9BQWYsR0FBeUIsVUFBVyxDQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWtCLENBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxPQUEzRSxDQUZGO1NBQUEsTUFBQTtBQUlFLFVBQUEsY0FBYyxDQUFDLE9BQWYsR0FBeUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFyQyxDQUpGO1NBQUE7QUFBQSxRQU1BLGNBQUEsR0FBaUIsVUFBVyxDQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWtCLENBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxJQU5uRSxDQURGO09BQUEsY0FBQTtBQVVFLFFBREksY0FDSixDQUFBO0FBQUEsUUFBQSxHQUFBLEdBQU0sRUFBQSxDQUFHLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBSCxFQUFtQixFQUFBLEdBQUUsV0FBVyxDQUFDLE9BQWQsR0FBdUIsNEJBQXZCLEdBQWtELFdBQVcsQ0FBQyxJQUE5RCxHQUFvRSxHQUF2RixDQUFBLENBQUE7aUJBQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBSCxFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtBQUNqQixjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sNkJBQU4sQ0FBQSxDQUFBO0FBQUEsY0FDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsSUFBQSxFQUFPLCtFQUFBLEdBQ3lCLFdBQVcsQ0FBQyxJQUQ1QztlQUFILEVBQ3dELGlCQUR4RCxDQURBLENBQUE7cUJBR0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxrQ0FBTixFQUppQjtZQUFBLEVBQUE7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBRk87UUFBQSxDQUFILENBQU4sQ0FBQTtBQUFBLFFBUUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLENBUkEsQ0FBQTtBQVNBLGVBQU8sS0FBUCxDQW5CRjtPQUZBO0FBd0JBLE1BQUEsSUFBRyxXQUFXLENBQUMsT0FBWixLQUF1QixZQUExQjtBQUNFLFFBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBbEIsQ0FBdUIsRUFBQSxHQUFFLFdBQVcsQ0FBQyxJQUFkLEdBQW9CLEtBQXBCLEdBQXdCLENBQUEsV0FBVyxDQUFDLGFBQVosQ0FBMEIsS0FBMUIsQ0FBQSxDQUEvQyxDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFsQixDQUF1QixFQUFBLEdBQUUsV0FBVyxDQUFDLElBQWQsR0FBb0IsS0FBcEIsR0FBd0IsV0FBVyxDQUFDLFFBQTNELENBQUEsQ0FIRjtPQXhCQTtBQUFBLE1BNkJBLGNBQWMsQ0FBQyxJQUFmLEdBQXNCLGNBQUEsQ0FBZSxXQUFmLENBN0J0QixDQUFBO0FBaUNBLGFBQU8sY0FBUCxDQXBDWTtJQUFBLENBN0lkLENBQUE7O0FBQUEseUJBbUxBLFdBQUEsR0FBYSxTQUFDLEdBQUQsR0FBQTtBQUVYLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBbEIsQ0FBdUIsT0FBdkIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0IsS0FBdEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxHQUFmLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxJQUFELENBQUEsRUFMVztJQUFBLENBbkxiLENBQUE7O0FBQUEseUJBMExBLEdBQUEsR0FBSyxTQUFDLE9BQUQsRUFBVSxTQUFWLEdBQUE7QUFDSCxVQUFBLG1DQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLG9CQUFWLEVBQWdDO0FBQUEsUUFBQSxHQUFBLEVBQUssaUJBQUw7T0FBaEMsQ0FBQSxDQUFBO0FBQUEsTUFHQSxPQUFBLEdBQ0U7QUFBQSxRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUw7QUFBQSxRQUNBLEdBQUEsRUFBSyxPQUFPLENBQUMsR0FEYjtPQUpGLENBQUE7QUFBQSxNQU1BLElBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQXBCLENBQTJCLFNBQTNCLENBQUQsQ0FBc0MsQ0FBQyxNQUF2QyxDQUE4QyxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQTFELENBTlAsQ0FBQTtBQUFBLE1BUUEsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFBWSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsTUFBbkIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlQsQ0FBQTtBQUFBLE1BU0EsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFBWSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsTUFBbkIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVFQsQ0FBQTtBQUFBLE1BVUEsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNMLFVBQUEsSUFBRyxVQUFBLEtBQWMsQ0FBakI7QUFDRSxZQUFBLEtBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFzQixNQUF0QixDQUFBLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxLQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0IsS0FBdEIsQ0FBQSxDQUhGO1dBQUE7aUJBSUEsT0FBTyxDQUFDLEdBQVIsQ0FBYSxjQUFBLEdBQWEsVUFBMUIsRUFMSztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVlAsQ0FBQTtBQUFBLE1Ba0JBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsZUFBQSxDQUFnQjtBQUFBLFFBQ3JDLFNBQUEsT0FEcUM7QUFBQSxRQUM1QixNQUFBLElBRDRCO0FBQUEsUUFDdEIsU0FBQSxPQURzQjtBQUFBLFFBQ2IsUUFBQSxNQURhO0FBQUEsUUFDTCxRQUFBLE1BREs7QUFBQSxRQUNHLE1BQUEsSUFESDtPQUFoQixDQWxCdkIsQ0FBQTthQXNCQSxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUF6QixDQUE0QixPQUE1QixFQUFxQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxTQUFELEdBQUE7aUJBQ25DLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEVBQUEsQ0FBRyxTQUFBLEdBQUE7QUFDaEIsWUFBQSxJQUFDLENBQUEsRUFBRCxDQUFJLGVBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxDQUFMLENBREEsQ0FBQTtBQUFBLFlBRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxxQkFBSixDQUZBLENBQUE7bUJBR0EsSUFBQyxDQUFBLEdBQUQsQ0FBTSxRQUFBLEdBQU8sQ0FBQSxDQUFDLENBQUMsTUFBRixDQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBckIsQ0FBQSxDQUFiLEVBSmdCO1VBQUEsQ0FBSCxDQUFmLEVBRG1DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckMsRUF2Qkc7SUFBQSxDQTFMTCxDQUFBOztBQUFBLHlCQXdOQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFPLDBDQUFKLElBQXFDLElBQUMsQ0FBQSxVQUFVLENBQUMsZ0JBQVosS0FBZ0MsRUFBeEU7ZUFDRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBSGQ7T0FETTtJQUFBLENBeE5SLENBQUE7O0FBQUEseUJBOE5BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFFSixNQUFBLElBQUcsOEJBQUEsSUFBc0Isc0NBQXpCO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsSUFBbkIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0IsTUFBdEIsQ0FEQSxDQUFBO2VBRUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFBLEVBSEY7T0FGSTtJQUFBLENBOU5OLENBQUE7O0FBQUEseUJBcU9BLE9BQUEsR0FBUyxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDUCxNQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLElBQW5CLENBRFAsQ0FBQTthQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEVBQUEsQ0FBRyxTQUFBLEdBQUE7ZUFDaEIsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFVBQUEsT0FBQSxFQUFRLE9BQUEsR0FBTSxHQUFkO1NBQUwsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ3pCLEtBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUR5QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLEVBRGdCO01BQUEsQ0FBSCxDQUFmLEVBSk87SUFBQSxDQXJPVCxDQUFBOztzQkFBQTs7S0FEdUIsS0FWekIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/Rad/.atom/packages/script/lib/script-view.coffee