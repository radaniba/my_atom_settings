(function() {
  var CompositeDisposable, JediProvider, cp, errorStatus, isWin,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  cp = require('child_process');

  JediProvider = require('./jedi-python3-provider');

  isWin = /^win/.test(process.platform);

  errorStatus = false;

  module.exports = {
    subscriptions: null,
    config: {
      enablePython2: {
        description: 'Check to enable autocomplete for Python2 (AutoComplete for Python3 will be disabled)',
        type: 'boolean',
        "default": false
      },
      enablePathtopython: {
        description: 'Check to enable above Pathtopython field to work',
        type: 'boolean',
        "default": false
      },
      Pathtopython: {
        description: 'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)',
        type: 'string',
        "default": 'python3'
      }
    },
    provider: null,
    jediServer: null,
    activate: function() {
      var command, env, isPathtopython, isPy2, item, jedipy_filename, new_path_env, path_list, projectPath, spawn, _i, _len, _path_env;
      if (!this.jediServer) {
        projectPath = atom.project.getPaths();
        isPy2 = atom.config.get('python-jedi.enablePython2');
        isPathtopython = atom.config.get('python-jedi.enablePathtopython');
        env = process.env;
        if (isWin) {

        } else {
          _path_env = env.PATH.split(':');
          path_list = ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin'];
          for (_i = 0, _len = path_list.length; _i < _len; _i++) {
            item = path_list[_i];
            if (__indexOf.call(_path_env, item) < 0) {
              _path_env.push(item);
            }
          }
          new_path_env = _path_env.filter(function(p) {
            return p !== "";
          });
          env.PATH = new_path_env.join(":");
        }
        if (isPy2) {
          jedipy_filename = '/jedi-python2-complete.py';
          command = isPathtopython ? atom.config.get('python-jedi.Pathtopython') : "python";
        } else {
          jedipy_filename = '/jedi-python3-complete.py';
          command = isPathtopython ? atom.config.get('python-jedi.Pathtopython') : "python3";
        }
        spawn = cp.spawn;
        this.jediServer = spawn(command, [__dirname + jedipy_filename], {
          env: env
        });
        this.jediServer.on('error', function(err) {
          return console.log(err);
        });
      }
      this.provider = new JediProvider();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'jedi-python3-autocomplete:goto_definitions': (function(_this) {
          return function() {
            return _this.goto_definitions();
          };
        })(this)
      }));
    },
    serialize: function() {
      return this.provider.kill_Jedi(cp, isWin, this.jediServer);
    },
    deactivate: function() {
      errorStatus = this.provider.kill_Jedi(cp, isWin, this.jediServer);
      return this.jediServer = null;
    },
    getProvider: function() {
      return {
        providers: [this.provider]
      };
    },
    goto_definitions: function() {
      var column, editor, path, row, source, title;
      if (editor = atom.workspace.getActiveTextEditor()) {
        title = editor.getTitle().slice(-2);
        if (title === 'py') {
          source = editor.getText();
          row = editor.getCursorBufferPosition().row + 1;
          column = editor.getCursorBufferPosition().column + 1;
          path = editor.getPath();
          return this.provider.goto_def(source, row, column, path);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tamVkaS9saWIvamVkaS1weXRob24zLWF1dG9jb21wbGV0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseURBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxlQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBSlIsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxLQUxkLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxhQUFBLEVBQWUsSUFBZjtBQUFBLElBRUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxzRkFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BREY7QUFBQSxNQUlBLGtCQUFBLEVBQ0k7QUFBQSxRQUFBLFdBQUEsRUFBYSxrREFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BTEo7QUFBQSxNQVFBLFlBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFZLDRHQUFaO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLFNBRlQ7T0FURjtLQUhGO0FBQUEsSUFnQkEsUUFBQSxFQUFVLElBaEJWO0FBQUEsSUFrQkEsVUFBQSxFQUFZLElBbEJaO0FBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/python-jedi/lib/jedi-python3-autocomplete.coffee
