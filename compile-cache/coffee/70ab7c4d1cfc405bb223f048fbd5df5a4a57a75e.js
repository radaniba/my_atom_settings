(function() {
  var extractRange, fs, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tokenizedLineForRow = function(textEditor, lineNumber) {
    return textEditor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
  };

  fs = require('fs');

  extractRange = function(_arg) {
    var code, colNumber, foundDecorator, foundImport, lineNumber, message, offset, screenLine, symbol, textEditor, token, tokenizedLine, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    code = _arg.code, message = _arg.message, lineNumber = _arg.lineNumber, colNumber = _arg.colNumber, textEditor = _arg.textEditor;
    switch (code) {
      case 'C901':
        symbol = /'(?:[^.]+\.)?([^']+)'/.exec(message)[1];
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          foundDecorator = false;
          _ref = tokenizedLine.tokens;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            token = _ref[_i];
            if (__indexOf.call(token.scopes, 'meta.function.python') >= 0) {
              if (token.value === symbol) {
                return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
              }
            }
            if (__indexOf.call(token.scopes, 'meta.function.decorator.python') >= 0) {
              foundDecorator = true;
            }
            offset += token.bufferDelta;
          }
          if (!foundDecorator) {
            break;
          }
          lineNumber += 1;
        }
        break;
      case 'E125':
      case 'E127':
      case 'E128':
      case 'E131':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref1 = tokenizedLine.tokens;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          token = _ref1[_j];
          if (!token.firstNonWhitespaceIndex) {
            return [[lineNumber, 0], [lineNumber, offset]];
          }
          if (token.firstNonWhitespaceIndex !== token.bufferDelta) {
            return [[lineNumber, 0], [lineNumber, offset + token.firstNonWhitespaceIndex]];
          }
          offset += token.bufferDelta;
        }
        break;
      case 'E262':
      case 'E265':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 1]];
      case 'F401':
        symbol = /'([^']+)'/.exec(message)[1];
        foundImport = false;
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          _ref2 = tokenizedLine.tokens;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            token = _ref2[_k];
            if (foundImport && token.value === symbol) {
              return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
            }
            if (token.value === 'import' && __indexOf.call(token.scopes, 'keyword.control.import.python') >= 0) {
              foundImport = true;
            }
            offset += token.bufferDelta;
          }
          lineNumber += 1;
        }
        break;
      case 'F821':
      case 'F841':
        symbol = /'([^']+)'/.exec(message)[1];
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref3 = tokenizedLine.tokens;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          token = _ref3[_l];
          if (token.value === symbol && offset >= colNumber - 1) {
            return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
          }
          offset += token.bufferDelta;
        }
        break;
      case 'H101':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 3]];
      case 'H201':
        return [[lineNumber, colNumber - 7], [lineNumber, colNumber]];
      case 'H231':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 5]];
      case 'H233':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H236':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 12]];
      case 'H238':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H501':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref4 = tokenizedLine.tokens;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          token = _ref4[_m];
          if (__indexOf.call(token.scopes, 'meta.function-call.python') >= 0) {
            if (token.value === 'locals') {
              return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
            }
          }
          offset += token.bufferDelta;
        }
        break;
      case 'W291':
        screenLine = tokenizedLineForRow(textEditor, lineNumber);
        if (screenLine === void 0) {
          break;
        }
        return [[lineNumber, colNumber - 1], [lineNumber, screenLine.length]];
    }
    return [[lineNumber, colNumber - 1], [lineNumber, colNumber]];
  };

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": 'flake8',
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). ' + 'Use `$PROJECT` substitutions for project specific paths e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
      },
      projectConfigFile: {
        type: 'string',
        "default": '',
        description: 'flake config file relative path from project (e.g. tox.ini or .flake8rc)'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      maxComplexity: {
        description: 'McCabe complexity threshold (`-1` to disable)',
        type: 'integer',
        "default": -1
      },
      hangClosing: {
        type: 'boolean',
        "default": false
      },
      selectErrors: {
        description: 'input "E, W" to include all errors/warnings',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      pep8ErrorsToWarnings: {
        description: 'Convert PEP8 "E" messages to linter warnings',
        type: 'boolean',
        "default": false
      },
      flakeErrors: {
        description: 'Convert Flake "F" messages to linter errors',
        type: 'boolean',
        "default": false
      }
    },
    activate: function() {
      return require('atom-package-deps').install();
    },
    getProjDir: function(file) {
      return atom.project.relativizePath(file)[0];
    },
    applySubstitutions: function(path, projDir) {
      var p, _i, _len, _ref;
      _ref = path.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        p = p.replace(/\$PROJECT/i, projDir);
        if (fs.existsSync(p)) {
          return p;
        }
      }
      return path;
    },
    provideLinter: function() {
      var helpers, path, provider;
      helpers = require('atom-linter');
      path = require('path');
      return provider = {
        name: 'Flake8',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var cwd, execPath, filePath, fileText, flakeerr, ignoreErrorCodes, maxComplexity, maxLineLength, parameters, pep8warn, projDir, projectConfigFile, selectErrors;
            filePath = textEditor.getPath();
            fileText = textEditor.getText();
            parameters = [];
            if (maxLineLength = atom.config.get('linter-flake8.maxLineLength')) {
              parameters.push('--max-line-length', maxLineLength);
            }
            if ((ignoreErrorCodes = atom.config.get('linter-flake8.ignoreErrorCodes')).length) {
              parameters.push('--ignore', ignoreErrorCodes.join(','));
            }
            if (maxComplexity = atom.config.get('linter-flake8.maxComplexity')) {
              parameters.push('--max-complexity', maxComplexity);
            }
            if (atom.config.get('linter-flake8.hangClosing')) {
              parameters.push('--hang-closing');
            }
            if ((selectErrors = atom.config.get('linter-flake8.selectErrors')).length) {
              parameters.push('--select', selectErrors.join(','));
            }
            if ((projectConfigFile = atom.config.get('linter-flake8.projectConfigFile'))) {
              parameters.push('--config', path.join(atom.project.getPaths()[0], projectConfigFile));
            }
            parameters.push('-');
            fs = require('fs-plus');
            pep8warn = atom.config.get('linter-flake8.pep8ErrorsToWarnings');
            flakeerr = atom.config.get('linter-flake8.flakeErrors');
            projDir = _this.getProjDir(filePath) || path.dirname(filePath);
            execPath = fs.normalize(_this.applySubstitutions(atom.config.get('linter-flake8.executablePath'), projDir));
            cwd = path.dirname(textEditor.getPath());
            return helpers.exec(execPath, parameters, {
              stdin: fileText,
              cwd: cwd
            }).then(function(result) {
              var col, line, match, regex, toReturn;
              toReturn = [];
              regex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
              while ((match = regex.exec(result)) !== null) {
                line = parseInt(match[1]) || 0;
                col = parseInt(match[2]) || 0;
                toReturn.push({
                  type: match[4] === 'E' && !pep8warn || match[4] === 'F' && flakeerr ? 'Error' : 'Warning',
                  text: match[3] + ' — ' + match[5],
                  filePath: filePath,
                  range: extractRange({
                    code: match[3],
                    message: match[5],
                    lineNumber: line - 1,
                    colNumber: col,
                    textEditor: textEditor
                  })
                });
              }
              return toReturn;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQ0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO1dBQ3BCLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLG1CQUF6QyxDQUE2RCxVQUE3RCxFQURvQjtFQUFBLENBQXRCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2IsUUFBQSx1TkFBQTtBQUFBLElBRGUsWUFBQSxNQUFNLGVBQUEsU0FBUyxrQkFBQSxZQUFZLGlCQUFBLFdBQVcsa0JBQUEsVUFDckQsQ0FBQTtBQUFBLFlBQU8sSUFBUDtBQUFBLFdBQ08sTUFEUDtBQUlJLFFBQUEsTUFBQSxHQUFTLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLE9BQTdCLENBQXNDLENBQUEsQ0FBQSxDQUEvQyxDQUFBO0FBQ0EsZUFBTSxJQUFOLEdBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxVQUNBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FEaEIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0Usa0JBREY7V0FGQTtBQUFBLFVBSUEsY0FBQSxHQUFpQixLQUpqQixDQUFBO0FBS0E7QUFBQSxlQUFBLDJDQUFBOzZCQUFBO0FBQ0UsWUFBQSxJQUFHLGVBQTBCLEtBQUssQ0FBQyxNQUFoQyxFQUFBLHNCQUFBLE1BQUg7QUFDRSxjQUFBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxNQUFsQjtBQUNFLHVCQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsTUFBYixDQUFELEVBQXVCLENBQUMsVUFBRCxFQUFhLE1BQUEsR0FBUyxLQUFLLENBQUMsV0FBNUIsQ0FBdkIsQ0FBUCxDQURGO2VBREY7YUFBQTtBQUdBLFlBQUEsSUFBRyxlQUFvQyxLQUFLLENBQUMsTUFBMUMsRUFBQSxnQ0FBQSxNQUFIO0FBQ0UsY0FBQSxjQUFBLEdBQWlCLElBQWpCLENBREY7YUFIQTtBQUFBLFlBS0EsTUFBQSxJQUFVLEtBQUssQ0FBQyxXQUxoQixDQURGO0FBQUEsV0FMQTtBQVlBLFVBQUEsSUFBRyxDQUFBLGNBQUg7QUFDRSxrQkFERjtXQVpBO0FBQUEsVUFjQSxVQUFBLElBQWMsQ0FkZCxDQURGO1FBQUEsQ0FMSjtBQUNPO0FBRFAsV0FxQk8sTUFyQlA7QUFBQSxXQXFCZSxNQXJCZjtBQUFBLFdBcUJ1QixNQXJCdkI7QUFBQSxXQXFCK0IsTUFyQi9CO0FBMEJJLFFBQUEsYUFBQSxHQUFnQixtQkFBQSxDQUFvQixVQUFwQixFQUFnQyxVQUFoQyxDQUFoQixDQUFBO0FBQ0EsUUFBQSxJQUFHLGFBQUEsS0FBaUIsTUFBcEI7QUFDRSxnQkFERjtTQURBO0FBQUEsUUFHQSxNQUFBLEdBQVMsQ0FIVCxDQUFBO0FBSUE7QUFBQSxhQUFBLDhDQUFBOzRCQUFBO0FBQ0UsVUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLHVCQUFiO0FBQ0UsbUJBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxDQUFiLENBQUQsRUFBa0IsQ0FBQyxVQUFELEVBQWEsTUFBYixDQUFsQixDQUFQLENBREY7V0FBQTtBQUVBLFVBQUEsSUFBRyxLQUFLLENBQUMsdUJBQU4sS0FBbUMsS0FBSyxDQUFDLFdBQTVDO0FBQ0UsbUJBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxDQUFiLENBQUQsRUFBa0IsQ0FBQyxVQUFELEVBQWEsTUFBQSxHQUFTLEtBQUssQ0FBQyx1QkFBNUIsQ0FBbEIsQ0FBUCxDQURGO1dBRkE7QUFBQSxVQUlBLE1BQUEsSUFBVSxLQUFLLENBQUMsV0FKaEIsQ0FERjtBQUFBLFNBOUJKO0FBcUIrQjtBQXJCL0IsV0FvQ08sTUFwQ1A7QUFBQSxXQW9DZSxNQXBDZjtBQXVDSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0F2Q0o7QUFBQSxXQXdDTyxNQXhDUDtBQTBDSSxRQUFBLE1BQUEsR0FBUyxXQUFXLENBQUMsSUFBWixDQUFpQixPQUFqQixDQUEwQixDQUFBLENBQUEsQ0FBbkMsQ0FBQTtBQUFBLFFBQ0EsV0FBQSxHQUFjLEtBRGQsQ0FBQTtBQUVBLGVBQU0sSUFBTixHQUFBO0FBQ0UsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO0FBQUEsVUFDQSxhQUFBLEdBQWdCLG1CQUFBLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBRGhCLENBQUE7QUFFQSxVQUFBLElBQUcsYUFBQSxLQUFpQixNQUFwQjtBQUNFLGtCQURGO1dBRkE7QUFJQTtBQUFBLGVBQUEsOENBQUE7OEJBQUE7QUFDRSxZQUFBLElBQUcsV0FBQSxJQUFnQixLQUFLLENBQUMsS0FBTixLQUFlLE1BQWxDO0FBQ0UscUJBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxNQUFiLENBQUQsRUFBdUIsQ0FBQyxVQUFELEVBQWEsTUFBQSxHQUFTLEtBQUssQ0FBQyxXQUE1QixDQUF2QixDQUFQLENBREY7YUFBQTtBQUVBLFlBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLFFBQWYsSUFBNEIsZUFBbUMsS0FBSyxDQUFDLE1BQXpDLEVBQUEsK0JBQUEsTUFBL0I7QUFDRSxjQUFBLFdBQUEsR0FBYyxJQUFkLENBREY7YUFGQTtBQUFBLFlBSUEsTUFBQSxJQUFVLEtBQUssQ0FBQyxXQUpoQixDQURGO0FBQUEsV0FKQTtBQUFBLFVBVUEsVUFBQSxJQUFjLENBVmQsQ0FERjtRQUFBLENBNUNKO0FBd0NPO0FBeENQLFdBd0RPLE1BeERQO0FBQUEsV0F3RGUsTUF4RGY7QUEyREksUUFBQSxNQUFBLEdBQVMsV0FBVyxDQUFDLElBQVosQ0FBaUIsT0FBakIsQ0FBMEIsQ0FBQSxDQUFBLENBQW5DLENBQUE7QUFBQSxRQUNBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FEaEIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0UsZ0JBREY7U0FGQTtBQUFBLFFBSUEsTUFBQSxHQUFTLENBSlQsQ0FBQTtBQUtBO0FBQUEsYUFBQSw4Q0FBQTs0QkFBQTtBQUNFLFVBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLE1BQWYsSUFBMEIsTUFBQSxJQUFVLFNBQUEsR0FBWSxDQUFuRDtBQUNFLG1CQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsTUFBYixDQUFELEVBQXVCLENBQUMsVUFBRCxFQUFhLE1BQUEsR0FBUyxLQUFLLENBQUMsV0FBNUIsQ0FBdkIsQ0FBUCxDQURGO1dBQUE7QUFBQSxVQUVBLE1BQUEsSUFBVSxLQUFLLENBQUMsV0FGaEIsQ0FERjtBQUFBLFNBaEVKO0FBd0RlO0FBeERmLFdBb0VPLE1BcEVQO0FBc0VJLGVBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBOUIsQ0FBUCxDQXRFSjtBQUFBLFdBdUVPLE1BdkVQO0FBeUVJLGVBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFiLENBQTlCLENBQVAsQ0F6RUo7QUFBQSxXQTBFTyxNQTFFUDtBQTRFSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0E1RUo7QUFBQSxXQTZFTyxNQTdFUDtBQStFSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0EvRUo7QUFBQSxXQWdGTyxNQWhGUDtBQWtGSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLEVBQXpCLENBQTlCLENBQVAsQ0FsRko7QUFBQSxXQW1GTyxNQW5GUDtBQXFGSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0FyRko7QUFBQSxXQXNGTyxNQXRGUDtBQXdGSSxRQUFBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FBaEIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0UsZ0JBREY7U0FEQTtBQUFBLFFBR0EsTUFBQSxHQUFTLENBSFQsQ0FBQTtBQUlBO0FBQUEsYUFBQSw4Q0FBQTs0QkFBQTtBQUNFLFVBQUEsSUFBRyxlQUErQixLQUFLLENBQUMsTUFBckMsRUFBQSwyQkFBQSxNQUFIO0FBQ0UsWUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsUUFBbEI7QUFDRSxxQkFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBRCxFQUF1QixDQUFDLFVBQUQsRUFBYSxNQUFBLEdBQVMsS0FBSyxDQUFDLFdBQTVCLENBQXZCLENBQVAsQ0FERjthQURGO1dBQUE7QUFBQSxVQUdBLE1BQUEsSUFBVSxLQUFLLENBQUMsV0FIaEIsQ0FERjtBQUFBLFNBNUZKO0FBc0ZPO0FBdEZQLFdBaUdPLE1BakdQO0FBbUdJLFFBQUEsVUFBQSxHQUFhLG1CQUFBLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBQWIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxVQUFBLEtBQWMsTUFBakI7QUFDRSxnQkFERjtTQURBO0FBR0EsZUFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLFNBQUEsR0FBWSxDQUF6QixDQUFELEVBQThCLENBQUMsVUFBRCxFQUFhLFVBQVUsQ0FBQyxNQUF4QixDQUE5QixDQUFQLENBdEdKO0FBQUEsS0FBQTtBQXVHQSxXQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBYixDQUE5QixDQUFQLENBeEdhO0VBQUEsQ0FMZixDQUFBOztBQUFBLEVBK0dBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFFBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw4RUFBQSxHQUNYLDBHQUhGO09BREY7QUFBQSxNQUtBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDBFQUZiO09BTkY7QUFBQSxNQVNBLGFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQURUO09BVkY7QUFBQSxNQVlBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO09BYkY7QUFBQSxNQWlCQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSwrQ0FBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxDQUFBLENBRlQ7T0FsQkY7QUFBQSxNQXFCQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQXRCRjtBQUFBLE1Bd0JBLFlBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDZDQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sT0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEVBRlQ7QUFBQSxRQUdBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FKRjtPQXpCRjtBQUFBLE1BOEJBLG9CQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSw4Q0FBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BL0JGO0FBQUEsTUFrQ0EsV0FBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsNkNBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsS0FGVDtPQW5DRjtLQURGO0FBQUEsSUF3Q0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQUEsRUFEUTtJQUFBLENBeENWO0FBQUEsSUEyQ0EsVUFBQSxFQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLElBQTVCLENBQWtDLENBQUEsQ0FBQSxFQUR4QjtJQUFBLENBM0NaO0FBQUEsSUE4Q0Esa0JBQUEsRUFBb0IsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ2xCLFVBQUEsaUJBQUE7QUFBQTtBQUFBLFdBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLFlBQVYsRUFBd0IsT0FBeEIsQ0FBSixDQUFBO0FBQ0EsUUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxDQUFIO0FBQ0UsaUJBQU8sQ0FBUCxDQURGO1NBRkY7QUFBQSxPQUFBO0FBSUEsYUFBTyxJQUFQLENBTGtCO0lBQUEsQ0E5Q3BCO0FBQUEsSUFxREEsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsdUJBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUixDQUFWLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7YUFHQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxhQUFBLEVBQWUsQ0FBQyxlQUFELEVBQWtCLHNCQUFsQixDQURmO0FBQUEsUUFFQSxLQUFBLEVBQU8sTUFGUDtBQUFBLFFBR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxRQUlBLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsVUFBRCxHQUFBO0FBQ0osZ0JBQUEsMkpBQUE7QUFBQSxZQUFBLFFBQUEsR0FBVyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQVgsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FEWCxDQUFBO0FBQUEsWUFFQSxVQUFBLEdBQWEsRUFGYixDQUFBO0FBSUEsWUFBQSxJQUFHLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUFuQjtBQUNFLGNBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsbUJBQWhCLEVBQXFDLGFBQXJDLENBQUEsQ0FERjthQUpBO0FBTUEsWUFBQSxJQUFHLENBQUMsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUFwQixDQUFzRSxDQUFDLE1BQTFFO0FBQ0UsY0FBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFoQixFQUE0QixnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixHQUF0QixDQUE1QixDQUFBLENBREY7YUFOQTtBQVFBLFlBQUEsSUFBRyxhQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBbkI7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGtCQUFoQixFQUFvQyxhQUFwQyxDQUFBLENBREY7YUFSQTtBQVVBLFlBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCLENBQUg7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGdCQUFoQixDQUFBLENBREY7YUFWQTtBQVlBLFlBQUEsSUFBRyxDQUFDLFlBQUEsR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLENBQWhCLENBQThELENBQUMsTUFBbEU7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFVBQWhCLEVBQTRCLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLENBQTVCLENBQUEsQ0FERjthQVpBO0FBY0EsWUFBQSxJQUFHLENBQUMsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFyQixDQUFIO0FBQ0UsY0FBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFoQixFQUE0QixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxpQkFBdEMsQ0FBNUIsQ0FBQSxDQURGO2FBZEE7QUFBQSxZQWdCQSxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQWhCQSxDQUFBO0FBQUEsWUFrQkEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBbEJMLENBQUE7QUFBQSxZQW1CQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixDQW5CWCxDQUFBO0FBQUEsWUFvQkEsUUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsQ0FwQlgsQ0FBQTtBQUFBLFlBcUJBLE9BQUEsR0FBVSxLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosQ0FBQSxJQUF5QixJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FyQm5DLENBQUE7QUFBQSxZQXNCQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFwQixFQUFxRSxPQUFyRSxDQUFiLENBdEJYLENBQUE7QUFBQSxZQXVCQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFVLENBQUMsT0FBWCxDQUFBLENBQWIsQ0F2Qk4sQ0FBQTtBQXdCQSxtQkFBTyxPQUFPLENBQUMsSUFBUixDQUFhLFFBQWIsRUFBdUIsVUFBdkIsRUFBbUM7QUFBQSxjQUFDLEtBQUEsRUFBTyxRQUFSO0FBQUEsY0FBa0IsR0FBQSxFQUFLLEdBQXZCO2FBQW5DLENBQStELENBQUMsSUFBaEUsQ0FBcUUsU0FBQyxNQUFELEdBQUE7QUFDMUUsa0JBQUEsaUNBQUE7QUFBQSxjQUFBLFFBQUEsR0FBVyxFQUFYLENBQUE7QUFBQSxjQUNBLEtBQUEsR0FBUSx3Q0FEUixDQUFBO0FBR0EscUJBQU0sQ0FBQyxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLENBQVQsQ0FBQSxLQUFrQyxJQUF4QyxHQUFBO0FBQ0UsZ0JBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLENBQUEsSUFBc0IsQ0FBN0IsQ0FBQTtBQUFBLGdCQUNBLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixDQUFBLElBQXNCLENBRDVCLENBQUE7QUFBQSxnQkFFQSxRQUFRLENBQUMsSUFBVCxDQUFjO0FBQUEsa0JBQ1osSUFBQSxFQUFTLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSxHQUFaLElBQW9CLENBQUEsUUFBcEIsSUFBb0MsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFZLEdBQWhELElBQXdELFFBQTNELEdBQXlFLE9BQXpFLEdBQXNGLFNBRGhGO0FBQUEsa0JBRVosSUFBQSxFQUFNLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxLQUFYLEdBQW1CLEtBQU0sQ0FBQSxDQUFBLENBRm5CO0FBQUEsa0JBR1osVUFBQSxRQUhZO0FBQUEsa0JBSVosS0FBQSxFQUFPLFlBQUEsQ0FBYTtBQUFBLG9CQUNsQixJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FETTtBQUFBLG9CQUVsQixPQUFBLEVBQVMsS0FBTSxDQUFBLENBQUEsQ0FGRztBQUFBLG9CQUdsQixVQUFBLEVBQVksSUFBQSxHQUFPLENBSEQ7QUFBQSxvQkFJbEIsU0FBQSxFQUFXLEdBSk87QUFBQSxvQkFLbEIsWUFBQSxVQUxrQjttQkFBYixDQUpLO2lCQUFkLENBRkEsQ0FERjtjQUFBLENBSEE7QUFrQkEscUJBQU8sUUFBUCxDQW5CMEU7WUFBQSxDQUFyRSxDQUFQLENBekJJO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKTjtRQUxXO0lBQUEsQ0FyRGY7R0FoSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.coffee
