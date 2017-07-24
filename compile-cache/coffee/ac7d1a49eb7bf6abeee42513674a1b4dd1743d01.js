(function() {
  var BufferedProcess, JediProvider, command, jedipy_filename, resetJedi;

  BufferedProcess = require('atom').BufferedProcess;

  command = atom.config.get('python-jedi.Pathtopython');

  jedipy_filename = '/python3_jedi.py';

  resetJedi = function(newValue) {
    var error;
    try {
      atom.packages.disablePackage('python-jedi');
    } catch (_error) {
      error = _error;
      console.log(error);
    }
    atom.packages.enablePackage('python-jedi');
    return command = atom.config.get('python-jedi.Pathtopython');
  };

  module.exports = JediProvider = (function() {
    var opts;

    JediProvider.prototype.id = 'python-jedi';

    JediProvider.prototype.selector = '.source.python';

    JediProvider.prototype.providerblacklist = null;

    opts = {
      stdio: ['pipe', null, null]
    };

    function JediProvider() {
      this.providerblacklist = {
        'autocomplete-plus-fuzzyprovider': '.source.python',
        'autocomplete-plus-symbolprovider': '.source.python'
      };
    }

    JediProvider.prototype.goto_def = function(source, row, column, path) {
      var args, callback, data, exit, goto_def_process, payload, stderr, stdout;
      payload = {
        source: source,
        line: row,
        column: column,
        path: path,
        type: "goto"
      };
      data = JSON.stringify(payload);
      args = [__dirname + jedipy_filename];
      stdout = function(data) {
        var goto_info_objects, key, value, _results;
        goto_info_objects = JSON.parse(data);
        _results = [];
        for (key in goto_info_objects) {
          value = goto_info_objects[key];
          if (value['module_path'] !== null && value['line'] !== null) {
            _results.push(atom.workspace.open(value['module_path'], {
              'initialLine': value['line'] - 1,
              'searchAllPanes': true
            }));
          } else if (value['is_built_in'] && (value['type'] = "module" || "class" || "function")) {
            _results.push(atom.notifications.addInfo("Built In " + value['type'], {
              dismissable: true,
              'detail': "Description: " + value['description'] + ".\nThis is a builtin " + value['type'] + ". Doesn't have module path"
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      stderr = function(error) {
        return console.log(error);
      };
      exit = function(code) {
        return goto_def_process.kill();
      };
      callback = function(errorObject) {
        return console.log(errorObject.error);
      };
      goto_def_process = new BufferedProcess({
        command: command,
        args: args,
        opts: opts,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      goto_def_process.process.stdin.write(data);
      goto_def_process.process.stdin.end();
      return goto_def_process.onWillThrowError(callback);
    };

    JediProvider.prototype.requestHandler = function(options) {
      return new Promise(function(resolve) {
        var args, bufferPosition, callback, column, completion_process, data, exit, hash, line, path, payload, prefix, prefixRegex, prefixRegex_others, prefixcheck, row, stderr, stdout, suggestions, text;
        suggestions = [];
        if (atom.packages.isPackageDisabled('python-jedi')) {
          resolve(suggestions);
        }
        bufferPosition = options.cursor.getBufferPosition();
        text = options.editor.getText();
        row = options.cursor.getBufferPosition().row;
        column = options.cursor.getBufferPosition().column;
        path = options.editor.getPath();
        if (column === 0) {
          resolve(suggestions);
        }
        payload = {
          source: text,
          line: row,
          column: column,
          path: path,
          type: 'autocomplete'
        };
        prefixRegex_others = /[\s()\[\]{}=\-@!$%\^&\?'"\/|\\`~;:<>,*+]/g;
        prefixRegex = /\b((\w+))$/g;
        if (options.prefix.match(prefixRegex)) {
          prefix = options.prefix.match(prefixRegex)[0];
        }
        line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        hash = line.search(/(\#)/g);
        prefixcheck = !prefixRegex_others.test(options.cursor.getCurrentWordPrefix());
        if (hash < 0 && prefixcheck) {
          data = JSON.stringify(payload);
          args = [__dirname + jedipy_filename];
          stdout = function(data) {
            var key, label, list_of_objects, name, type, value;
            list_of_objects = JSON.parse(data);
            if (list_of_objects.length !== 0) {
              for (key in list_of_objects) {
                value = list_of_objects[key];
                label = value.description;
                type = value.type;
                name = value.name;
                if (label.length > 80) {
                  label = label.substr(0, 80);
                }
                suggestions.push({
                  text: name,
                  replacementPrefix: prefix,
                  label: label,
                  type: type
                });
              }
              return resolve(suggestions);
            } else {
              return resolve(suggestions);
            }
          };
          stderr = function(error) {
            return console.log(error);
          };
          exit = function(code) {
            return completion_process.kill();
          };
          callback = function(errorObject) {
            return console.log(errorObject.error);
          };
          completion_process = new BufferedProcess({
            command: command,
            args: args,
            opts: opts,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          completion_process.process.stdin.write(data);
          completion_process.process.stdin.end();
          return completion_process.onWillThrowError(callback);
        } else {
          return resolve(suggestions);
        }
      });
    };

    JediProvider.prototype.error = function(data) {
      return console.log(data);
    };

    return JediProvider;

  })();

  atom.config.observe('python-jedi.Pathtopython', function(newValue) {
    atom.config.set('python-jedi.Pathtopython', newValue);
    return resetJedi(newValue);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tamVkaS9saWIvamVkaS1weXRob24zLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrRUFBQTs7QUFBQSxFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUFELENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixDQURWLENBQUE7O0FBQUEsRUFFQSxlQUFBLEdBQWtCLGtCQUZsQixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsUUFBQSxLQUFBO0FBQUE7QUFDRSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZCxDQUE2QixhQUE3QixDQUFBLENBREY7S0FBQSxjQUFBO0FBR0UsTUFESSxjQUNKLENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWixDQUFBLENBSEY7S0FBQTtBQUFBLElBS0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFkLENBQTRCLGFBQTVCLENBTEEsQ0FBQTtXQU1BLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLEVBUEQ7RUFBQSxDQUpYLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osUUFBQSxJQUFBOztBQUFBLDJCQUFBLEVBQUEsR0FBSSxhQUFKLENBQUE7O0FBQUEsMkJBQ0EsUUFBQSxHQUFVLGdCQURWLENBQUE7O0FBQUEsMkJBRUEsaUJBQUEsR0FBbUIsSUFGbkIsQ0FBQTs7QUFBQSxJQUdBLElBQUEsR0FBTztBQUFBLE1BQUMsS0FBQSxFQUFPLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxJQUFmLENBQVI7S0FI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

//# sourceURL=/Users/Rad/.atom/packages/python-jedi/lib/jedi-python3-provider.coffee
