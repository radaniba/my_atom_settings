(function() {
  var child, filteredEnvironment, fs, path, pty, systemLanguage, _;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = "" + (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (_error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'Terminal-Plus';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1) {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    emitTitle = _.throttle(function() {
      return emit('terminal-plus:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('terminal-plus:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('terminal-plus:exit');
      return callback();
    });
    return process.on('message', function(_arg) {
      var cols, event, rows, text, _ref;
      _ref = _arg != null ? _arg : {}, event = _ref.event, cols = _ref.cols, rows = _ref.rows, text = _ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi9wcm9jZXNzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0REFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FKUixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFvQixDQUFBLFNBQUEsR0FBQTtBQUNsQixRQUFBLGlCQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsYUFBWCxDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFFBQXZCO0FBQ0U7QUFDRSxRQUFBLE9BQUEsR0FBVSwwRUFBVixDQUFBO0FBQUEsUUFDQSxRQUFBLEdBQVcsRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQVgsQ0FBOEMsQ0FBQyxXQUFoRCxDQUFGLEdBQThELFFBRHpFLENBREY7T0FBQSxrQkFERjtLQURBO0FBS0EsV0FBTyxRQUFQLENBTmtCO0VBQUEsQ0FBQSxDQUFILENBQUEsQ0FOakIsQ0FBQTs7QUFBQSxFQWNBLG1CQUFBLEdBQXlCLENBQUEsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsR0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBTyxDQUFDLEdBQWYsRUFBb0IsV0FBcEIsRUFBaUMsaUNBQWpDLEVBQW9FLGdCQUFwRSxFQUFzRixVQUF0RixFQUFrRyxXQUFsRyxFQUErRyxXQUEvRyxFQUE0SCxVQUE1SCxDQUFOLENBQUE7O01BQ0EsR0FBRyxDQUFDLE9BQVE7S0FEWjtBQUFBLElBRUEsR0FBRyxDQUFDLFlBQUosR0FBbUIsZUFGbkIsQ0FBQTtBQUdBLFdBQU8sR0FBUCxDQUp1QjtFQUFBLENBQUEsQ0FBSCxDQUFBLENBZHRCLENBQUE7O0FBQUEsRUFvQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLElBQWIsRUFBbUIsT0FBbkIsR0FBQTtBQUNmLFFBQUEsc0NBQUE7O01BRGtDLFVBQVE7S0FDMUM7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFoQixDQUFBLElBQTJCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixDQUFBLEtBQTJCLENBQUEsQ0FBekQ7QUFDRSxNQUFBLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixDQUFBLENBREY7S0FGQTtBQUFBLElBS0EsVUFBQSxHQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBVCxFQUFnQixJQUFoQixFQUNYO0FBQUEsTUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLE1BQ0EsR0FBQSxFQUFLLG1CQURMO0FBQUEsTUFFQSxJQUFBLEVBQU0sZ0JBRk47S0FEVyxDQUxiLENBQUE7QUFBQSxJQVVBLEtBQUEsR0FBUSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkLENBVmhCLENBQUE7QUFBQSxJQVlBLFNBQUEsR0FBWSxDQUFDLENBQUMsUUFBRixDQUFXLFNBQUEsR0FBQTthQUNyQixJQUFBLENBQUsscUJBQUwsRUFBNEIsVUFBVSxDQUFDLE9BQXZDLEVBRHFCO0lBQUEsQ0FBWCxFQUVWLEdBRlUsRUFFTCxJQUZLLENBWlosQ0FBQTtBQUFBLElBZ0JBLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFDLElBQUQsR0FBQTtBQUNwQixNQUFBLElBQUEsQ0FBSyxvQkFBTCxFQUEyQixJQUEzQixDQUFBLENBQUE7YUFDQSxTQUFBLENBQUEsRUFGb0I7SUFBQSxDQUF0QixDQWhCQSxDQUFBO0FBQUEsSUFvQkEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUEsR0FBQTtBQUNwQixNQUFBLElBQUEsQ0FBSyxvQkFBTCxDQUFBLENBQUE7YUFDQSxRQUFBLENBQUEsRUFGb0I7SUFBQSxDQUF0QixDQXBCQSxDQUFBO1dBd0JBLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLElBQUQsR0FBQTtBQUNwQixVQUFBLDZCQUFBO0FBQUEsNEJBRHFCLE9BQTBCLElBQXpCLGFBQUEsT0FBTyxZQUFBLE1BQU0sWUFBQSxNQUFNLFlBQUEsSUFDekMsQ0FBQTtBQUFBLGNBQU8sS0FBUDtBQUFBLGFBQ08sUUFEUDtpQkFDcUIsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFEckI7QUFBQSxhQUVPLE9BRlA7aUJBRW9CLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCLEVBRnBCO0FBQUEsT0FEb0I7SUFBQSxDQUF0QixFQXpCZTtFQUFBLENBcEJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/terminal-plus/lib/process.coffee
