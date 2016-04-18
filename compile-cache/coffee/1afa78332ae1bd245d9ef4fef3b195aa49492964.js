(function() {
  var AnsiFilter, BufferedProcess, HeaderView, ScriptOptionsView, ScriptView, View, grammarMap, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  grammarMap = require('./grammars');

  _ref = require('atom'), View = _ref.View, BufferedProcess = _ref.BufferedProcess;

  HeaderView = require('./header-view');

  ScriptOptionsView = require('./script-options-view');

  AnsiFilter = require('ansi-to-html');

  _ = require('underscore');

  module.exports = ScriptView = (function(_super) {
    __extends(ScriptView, _super);

    function ScriptView() {
      this.updateOptions = __bind(this.updateOptions, this);
      return ScriptView.__super__.constructor.apply(this, arguments);
    }

    ScriptView.bufferedProcess = null;

    ScriptView.content = function() {
      return this.div((function(_this) {
        return function() {
          _this.subview('headerView', new HeaderView());
          return _this.div({
            "class": 'tool-panel panel panel-bottom padding script-view native-key-bindings',
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

    ScriptView.prototype.initialize = function(serializeState, run_options) {
      atom.workspaceView.command("script:run", (function(_this) {
        return function() {
          return _this.start();
        };
      })(this));
      atom.workspaceView.command("script:close-view", (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
      atom.workspaceView.command("script:kill-process", (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this));
      this.ansiFilter = new AnsiFilter;
      return this.run_options = run_options;
    };

    ScriptView.prototype.serialize = function() {};

    ScriptView.prototype.updateOptions = function(event) {
      console.log(event);
      return this.run_options = event.run_options;
    };

    ScriptView.prototype.start = function() {
      var commandContext, editor;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      this.resetView();
      commandContext = this.setup(editor);
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
      this.headerView.setStatus("start");
      return this.output.empty();
    };

    ScriptView.prototype.close = function() {
      this.stop();
      if (this.hasParent()) {
        return this.detach();
      }
    };

    ScriptView.prototype.getlang = function(editor) {
      var grammar, lang;
      grammar = editor.getGrammar();
      lang = grammar.name;
      return lang;
    };

    ScriptView.prototype.setup = function(editor) {
      var arg, argType, args, commandContext, err, error, filename, filepath, lang, makeargs, selectedText;
      commandContext = {};
      lang = this.getlang(editor);
      err = null;
      if (lang === "Null Grammar" || lang === "Plain Text") {
        err = "Must select a language in the lower left or " + "save the file with an appropriate extension.";
      } else if (!(lang in grammarMap)) {
        err = "Command not configured for " + lang + "!\n\n" + "Add an <a href='https://github.com/rgbkrk/atom-script/issues/" + "new?title=Add%20support%20for%20" + lang + "'>issue on GitHub" + "</a> or send your own Pull Request";
      }
      if (err != null) {
        this.handleError(err);
        return false;
      }
      if ((this.run_options.cmd == null) || this.run_options.cmd === '') {
        commandContext.command = grammarMap[lang].command;
      } else {
        commandContext.command = this.run_options.cmd;
      }
      filename = editor.getTitle();
      selectedText = editor.getSelectedText();
      filepath = editor.getPath();
      if (((selectedText == null) || !selectedText) && (filepath == null)) {
        selectedText = editor.getText();
      }
      if (((selectedText == null) || !selectedText) && (filepath != null)) {
        argType = "File Based";
        arg = filepath;
      } else {
        argType = "Selection Based";
        arg = selectedText;
      }
      makeargs = grammarMap[lang][argType];
      try {
        args = makeargs(arg);
        commandContext.args = args;
      } catch (_error) {
        error = _error;
        err = argType + " Runner not available for " + lang + "\n\n" + "If it should exist add an " + "<a href='https://github.com/rgbkrk/atom-script/issues/" + "new?title=Add%20support%20for%20" + lang + "'>issue on GitHub" + "</a> or send your own Pull Request";
        this.handleError(err);
        return false;
      }
      this.headerView.title.text(lang + " - " + filename);
      return commandContext;
    };

    ScriptView.prototype.handleError = function(err) {
      this.headerView.title.text("Error");
      this.headerView.setStatus("err");
      this.display("error", err);
      return this.stop();
    };

    ScriptView.prototype.run = function(command, args) {
      var exit, options, stderr, stdout;
      atom.emit("achievement:unlock", {
        msg: "Homestar Runner"
      });
      options = {
        cwd: this.getCwd(),
        env: process.env
      };
      args = (this.run_options.cmd_args.concat(args)).concat(this.run_options.script_args);
      stdout = (function(_this) {
        return function(output) {
          return _this.display("stdout", output);
        };
      })(this);
      stderr = (function(_this) {
        return function(output) {
          return _this.display("stderr", output);
        };
      })(this);
      exit = (function(_this) {
        return function(return_code) {
          if (return_code === 0) {
            _this.headerView.setStatus("stop");
          } else {
            _this.headerView.setStatus("err");
          }
          return console.log("Exited with " + return_code);
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
        return function(node_error) {
          _this.output.append("<h1>Unable to run</h1>");
          _this.output.append("<pre>" + (_.escape(command)) + "</pre>");
          _this.output.append("<h2>Is it on your path?</h2>");
          return _this.output.append("<pre>PATH: " + (_.escape(process.env.PATH)) + "</pre>");
        };
      })(this));
    };

    ScriptView.prototype.getCwd = function() {
      if ((this.run_options.cmd_cwd == null) || this.run_options.cmd_cwd === '') {
        return atom.project.getPath();
      } else {
        return this.run_options.cmd_cwd;
      }
    };

    ScriptView.prototype.stop = function() {
      if ((this.bufferedProcess != null) && (this.bufferedProcess.process != null)) {
        this.display("stdout", "^C");
        this.headerView.setStatus("kill");
        return this.bufferedProcess.kill();
      }
    };

    ScriptView.prototype.display = function(css, line) {
      line = _.escape(line);
      line = this.ansiFilter.toHtml(line);
      return this.output.append("<pre class='line " + css + "'>" + line + "</pre>");
    };

    return ScriptView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlHQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLE9BQTBCLE9BQUEsQ0FBUSxNQUFSLENBQTFCLEVBQUMsWUFBQSxJQUFELEVBQU8sdUJBQUEsZUFEUCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUhwQixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBSmIsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUxKLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxlQUFELEdBQWtCLElBQWxCLENBQUE7O0FBQUEsSUFFQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNILFVBQUEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsVUFBQSxDQUFBLENBQTNCLENBQUEsQ0FBQTtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sdUVBQVA7QUFBQSxZQUFnRixNQUFBLEVBQVEsUUFBeEY7QUFBQSxZQUFrRyxRQUFBLEVBQVUsQ0FBQSxDQUE1RztXQUFMLEVBQXFILFNBQUEsR0FBQTttQkFDbkgsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFP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
//# sourceURL=/Users/Rad/.atom/packages/script/lib/script-view.coffee