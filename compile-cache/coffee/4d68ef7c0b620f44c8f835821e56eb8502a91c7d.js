(function() {
  var $, JediProvider, errorStatus, resetJedi;

  $ = require('atom-space-pen-views').$;

  errorStatus = false;

  resetJedi = function(newValue) {
    var error;
    try {
      atom.packages.disablePackage('python-jedi');
    } catch (_error) {
      error = _error;
      console.log(error);
    }
    return atom.packages.enablePackage('python-jedi');
  };

  module.exports = JediProvider = (function() {
    JediProvider.prototype.id = 'python-jedi';

    JediProvider.prototype.selector = '.source.python';

    JediProvider.prototype.providerblacklist = null;

    function JediProvider() {
      this.providerblacklist = {
        'autocomplete-plus-fuzzyprovider': '.source.python',
        'autocomplete-plus-symbolprovider': '.source.python'
      };
    }

    JediProvider.prototype.kill_Jedi = function(cp, isWin, jediServer) {
      var error, win_Command;
      this.jediServer = jediServer;
      if (!isWin) {
        try {
          this.jediServer.kill();
        } catch (_error) {
          error = _error;
          errorStatus = true;
        }
      } else {
        try {
          win_Command = 'taskkill /F /PID ' + this.jediServer.pid;
          cp.exec(win_Command);
        } catch (_error) {
          error = _error;
          errorStatus = true;
        }
      }
      return errorStatus;
    };

    JediProvider.prototype.goto_def = function(source, row, column, path) {
      var payload;
      payload = {
        source: source,
        line: row,
        column: column,
        path: path,
        type: "goto"
      };
      return $.ajax({
        url: 'http://127.0.0.1:7777',
        type: 'POST',
        data: JSON.stringify(payload),
        success: function(data) {
          var key, value, _results;
          _results = [];
          for (key in data) {
            value = data[key];
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
        },
        error: function(jqXHR, textStatus, errorThrown) {
          return console.log(textStatus, errorThrown);
        }
      });
    };

    JediProvider.prototype.requestHandler = function(options) {
      return new Promise(function(resolve) {
        var bufferPosition, column, hash, line, path, payload, prefix, prefixRegex, row, suggestions, text, tripleQuotes, _ref;
        suggestions = [];
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
        prefixRegex = /\b((\w+[\w-]*)|([.:;[{(< ]+))$/g;
        prefix = ((_ref = options.prefix.match(prefixRegex)) != null ? _ref[0] : void 0) || '';
        if (prefix === " ") {
          prefix = prefix.replace(/\s/g, '');
        }
        tripleQuotes = /(\'\'\')/g.test(options.cursor.getCurrentWordPrefix());
        line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        hash = line.search(/(\#)/g);
        if (hash < 0 && !tripleQuotes) {
          return $.ajax({
            url: 'http://127.0.0.1:7777',
            type: 'POST',
            data: JSON.stringify(payload),
            success: function(data) {
              var index, label, type;
              if (data.length !== 0) {
                for (index in data) {
                  label = data[index].description;
                  type = data[index].type;
                  if (label.length > 80) {
                    label = label.substr(0, 80);
                  }
                  suggestions.push({
                    text: data[index].name,
                    replacementPrefix: prefix,
                    label: label,
                    type: type
                  });
                }
              }
              return resolve(suggestions);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              return console.log(textStatus, errorThrown);
            }
          });
        } else {
          suggestions = [];
          return resolve(suggestions);
        }
      });
    };

    JediProvider.prototype.error = function(data) {
      console.log("Error communicating with server");
      return console.log(data);
    };

    return JediProvider;

  })();

  atom.config.onDidChange('python-jedi.Pathtopython', function(newValue, oldValue) {
    var isPathtopython;
    isPathtopython = atom.config.get('python-jedi.enablePathtopython');
    if (isPathtopython) {
      atom.config.set('python-jedi.Pathtopython', newValue);
      return resetJedi(newValue);
    }
  });

  atom.config.onDidChange('python-jedi.enablePython2', function(_arg) {
    var newValue, oldValue;
    newValue = _arg.newValue, oldValue = _arg.oldValue;
    return resetJedi(newValue);
  });

  atom.config.onDidChange('python-jedi.enablePathtopython', function(_arg) {
    var newValue, oldValue;
    newValue = _arg.newValue, oldValue = _arg.oldValue;
    return resetJedi(newValue);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tamVkaS9saWIvamVkaS1weXRob24zLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1Q0FBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLHNCQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLEtBRmQsQ0FBQTs7QUFBQSxFQUlBLFNBQUEsR0FBVyxTQUFDLFFBQUQsR0FBQTtBQUNULFFBQUEsS0FBQTtBQUFBO0FBQ0UsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBNkIsYUFBN0IsQ0FBQSxDQURGO0tBQUEsY0FBQTtBQUdFLE1BREksY0FDSixDQUFBO0FBQUEsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosQ0FBQSxDQUhGO0tBQUE7V0FLQSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWQsQ0FBNEIsYUFBNUIsRUFOUztFQUFBLENBSlgsQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwyQkFBQSxFQUFBLEdBQUksYUFBSixDQUFBOztBQUFBLDJCQUNBLFFBQUEsR0FBVSxnQkFEVixDQUFBOztBQUFBLDJCQUVBLGlCQUFBLEdBQW1CLElBRm5CLENBQUE7O0FBSWEsSUFBQSxzQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsaUJBQUQsR0FDRTtBQUFBLFFBQUEsaUNBQUEsRUFBbUMsZ0JBQW5DO0FBQUEsUUFDQSxrQ0FBQSxFQUFvQyxnQkFEcEM7T0FERixDQURXO0lBQUEsQ0FKYjs7QUFBQSwyQkFXQSxTQUFBLEdBQVksU0FBQyxFQUFELEVBQUksS0FBSixFQUFZLFVBQVosR0FBQTtBQUNWLFVBQUEsa0JBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsYUFBQSxVQUN0QixD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

//# sourceURL=/Users/Rad/.atom/packages/python-jedi/lib/jedi-python3-provider.coffee
