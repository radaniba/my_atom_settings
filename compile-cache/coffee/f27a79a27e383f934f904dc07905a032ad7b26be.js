(function() {
  var BufferedProcess, Emitter, Runner, fs, path, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, BufferedProcess = _ref.BufferedProcess;

  fs = require('fs');

  path = require('path');

  module.exports = Runner = (function() {
    Runner.prototype.bufferedProcess = null;

    function Runner(scriptOptions, emitter) {
      this.scriptOptions = scriptOptions;
      this.emitter = emitter != null ? emitter : new Emitter;
      this.createOnErrorFunc = __bind(this.createOnErrorFunc, this);
      this.onExit = __bind(this.onExit, this);
      this.stderrFunc = __bind(this.stderrFunc, this);
      this.stdoutFunc = __bind(this.stdoutFunc, this);
    }

    Runner.prototype.run = function(command, extraArgs, codeContext, inputString) {
      var args, exit, options, stderr, stdout;
      if (inputString == null) {
        inputString = null;
      }
      this.startTime = new Date();
      args = this.args(codeContext, extraArgs);
      options = this.options();
      stdout = this.stdoutFunc;
      stderr = this.stderrFunc;
      exit = this.onExit;
      this.bufferedProcess = new BufferedProcess({
        command: command,
        args: args,
        options: options,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      if (inputString) {
        this.bufferedProcess.process.stdin.write(inputString);
        this.bufferedProcess.process.stdin.end();
      }
      return this.bufferedProcess.onWillThrowError(this.createOnErrorFunc(command));
    };

    Runner.prototype.stdoutFunc = function(output) {
      return this.emitter.emit('did-write-to-stdout', {
        message: output
      });
    };

    Runner.prototype.onDidWriteToStdout = function(callback) {
      return this.emitter.on('did-write-to-stdout', callback);
    };

    Runner.prototype.stderrFunc = function(output) {
      return this.emitter.emit('did-write-to-stderr', {
        message: output
      });
    };

    Runner.prototype.onDidWriteToStderr = function(callback) {
      return this.emitter.on('did-write-to-stderr', callback);
    };

    Runner.prototype.destroy = function() {
      return this.emitter.dispose();
    };

    Runner.prototype.getCwd = function() {
      var cwd, paths, workingDirectoryProvided, _base, _ref1, _ref2, _ref3;
      cwd = this.scriptOptions.workingDirectory;
      workingDirectoryProvided = (cwd != null) && cwd !== '';
      if (!workingDirectoryProvided) {
        switch (atom.config.get('script.cwdBehavior')) {
          case 'First project directory':
            paths = atom.project.getPaths();
            if ((paths != null ? paths.length : void 0) > 0) {
              try {
                cwd = fs.statSync(paths[0]).isDirectory() ? paths[0] : path.join(paths[0], '..');
              } catch (_error) {}
            }
            break;
          case 'Project directory of the script':
            cwd = this.getProjectPath();
            break;
          case 'Directory of the script':
            cwd = ((_ref1 = atom.workspace.getActivePaneItem()) != null ? (_ref2 = _ref1.buffer) != null ? (_ref3 = _ref2.file) != null ? typeof _ref3.getParent === "function" ? typeof (_base = _ref3.getParent()).getPath === "function" ? _base.getPath() : void 0 : void 0 : void 0 : void 0 : void 0) || '';
        }
      }
      return cwd;
    };

    Runner.prototype.stop = function() {
      if (this.bufferedProcess != null) {
        this.bufferedProcess.kill();
        return this.bufferedProcess = null;
      }
    };

    Runner.prototype.onExit = function(returnCode) {
      var executionTime;
      this.bufferedProcess = null;
      if ((atom.config.get('script.enableExecTime')) === true && this.startTime) {
        executionTime = (new Date().getTime() - this.startTime.getTime()) / 1000;
      }
      return this.emitter.emit('did-exit', {
        executionTime: executionTime,
        returnCode: returnCode
      });
    };

    Runner.prototype.onDidExit = function(callback) {
      return this.emitter.on('did-exit', callback);
    };

    Runner.prototype.createOnErrorFunc = function(command) {
      return (function(_this) {
        return function(nodeError) {
          _this.bufferedProcess = null;
          _this.emitter.emit('did-not-run', {
            command: command
          });
          return nodeError.handle();
        };
      })(this);
    };

    Runner.prototype.onDidNotRun = function(callback) {
      return this.emitter.on('did-not-run', callback);
    };

    Runner.prototype.options = function() {
      return {
        cwd: this.getCwd(),
        env: this.scriptOptions.mergedEnv(process.env)
      };
    };

    Runner.prototype.fillVarsInArg = function(arg, codeContext, project_path) {
      if (codeContext.filepath != null) {
        arg = arg.replace(/{FILE_ACTIVE}/g, codeContext.filepath);
        arg = arg.replace(/{FILE_ACTIVE_PATH}/g, path.join(codeContext.filepath, '..'));
      }
      if (codeContext.filename != null) {
        arg = arg.replace(/{FILE_ACTIVE_NAME}/g, codeContext.filename);
        arg = arg.replace(/{FILE_ACTIVE_NAME_BASE}/g, path.basename(codeContext.filename, path.extname(codeContext.filename)));
      }
      if (project_path != null) {
        arg = arg.replace(/{PROJECT_PATH}/g, project_path);
      }
      return arg;
    };

    Runner.prototype.args = function(codeContext, extraArgs) {
      var arg, args, project_path;
      args = (this.scriptOptions.cmdArgs.concat(extraArgs)).concat(this.scriptOptions.scriptArgs);
      project_path = this.getProjectPath || '';
      args = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          _results.push(this.fillVarsInArg(arg, codeContext, project_path));
        }
        return _results;
      }).call(this);
      if ((this.scriptOptions.cmd == null) || this.scriptOptions.cmd === '') {
        args = codeContext.shebangCommandArgs().concat(args);
      }
      return args;
    };

    Runner.prototype.getProjectPath = function() {
      var filePath, projectPath, projectPaths, _i, _len;
      filePath = atom.workspace.getActiveTextEditor().getPath();
      projectPaths = atom.project.getPaths();
      for (_i = 0, _len = projectPaths.length; _i < _len; _i++) {
        projectPath = projectPaths[_i];
        if (filePath.indexOf(projectPath) > -1) {
          if (fs.statSync(projectPath).isDirectory()) {
            return projectPath;
          } else {
            return path.join(projectPath, '..');
          }
        }
      }
    };

    return Runner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3J1bm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsZUFBQSxPQUFELEVBQVUsdUJBQUEsZUFBVixDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oscUJBQUEsZUFBQSxHQUFpQixJQUFqQixDQUFBOztBQU1hLElBQUEsZ0JBQUUsYUFBRixFQUFrQixPQUFsQixHQUFBO0FBQTBDLE1BQXpDLElBQUMsQ0FBQSxnQkFBQSxhQUF3QyxDQUFBO0FBQUEsTUFBekIsSUFBQyxDQUFBLDRCQUFBLFVBQVUsR0FBQSxDQUFBLE9BQWMsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQTFDO0lBQUEsQ0FOYjs7QUFBQSxxQkFRQSxHQUFBLEdBQUssU0FBQyxPQUFELEVBQVUsU0FBVixFQUFxQixXQUFyQixFQUFrQyxXQUFsQyxHQUFBO0FBQ0gsVUFBQSxtQ0FBQTs7UUFEcUMsY0FBYztPQUNuRDtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxJQUFBLENBQUEsQ0FBakIsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFELENBQU0sV0FBTixFQUFtQixTQUFuQixDQUZQLENBQUE7QUFBQSxNQUdBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBRCxDQUFBLENBSFYs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

//# sourceURL=/Users/Rad/.atom/packages/script/lib/runner.coffee
