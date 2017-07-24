(function() {
  var CompositeDisposable, extractRange, fs, path, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tokenizedLineForRow = function(textEditor, lineNumber) {
    var tokenBuffer;
    if (textEditor.hasOwnProperty('displayBuffer')) {
      tokenBuffer = textEditor.displayBuffer.tokenizedBuffer;
    } else {
      tokenBuffer = textEditor.tokenizedBuffer;
    }
    return tokenBuffer.tokenizedLineForRow(lineNumber);
  };

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

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
                return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
              }
            }
            if (__indexOf.call(token.scopes, 'meta.function.decorator.python') >= 0) {
              foundDecorator = true;
            }
            offset += token.value.length;
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
          if (token.firstNonWhitespaceIndex !== token.value.length) {
            return [[lineNumber, 0], [lineNumber, offset + token.firstNonWhitespaceIndex]];
          }
          offset += token.value.length;
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
              return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
            }
            if (token.value === 'import' && __indexOf.call(token.scopes, 'keyword.control.import.python') >= 0) {
              foundImport = true;
            }
            offset += token.value.length;
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
            return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
          }
          offset += token.value.length;
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
              return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
            }
          }
          offset += token.value.length;
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
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). ' + 'Use `$PROJECT` or `$PROJECT_NAME` substitutions for project specific paths ' + 'e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
      },
      disableTimeout: {
        type: 'boolean',
        "default": false,
        description: 'Disable the 10 second execution timeout'
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
      require('atom-package-deps').install();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-flake8.disableTimeout', (function(_this) {
        return function(disableTimeout) {
          return _this.disableTimeout = disableTimeout;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getProjDir: function(file) {
      return atom.project.relativizePath(file)[0];
    },
    getProjName: function(projDir) {
      return path.basename(projDir);
    },
    applySubstitutions: function(execPath, projDir) {
      var p, projectName, _i, _len, _ref;
      projectName = this.getProjName(projDir);
      execPath = execPath.replace(/\$PROJECT_NAME/i, projectName);
      execPath = execPath.replace(/\$PROJECT/i, projDir);
      _ref = execPath.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (fs.existsSync(p)) {
          return p;
        }
      }
      return execPath;
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'Flake8',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var cwd, execPath, filePath, fileText, flakeerr, ignoreErrorCodes, maxComplexity, maxLineLength, options, parameters, pep8warn, projDir, projectConfigFile, selectErrors;
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
            options = {
              stdin: fileText,
              cwd: cwd,
              stream: 'both'
            };
            if (_this.disableTimeout) {
              options.timeout = Infinity;
            }
            return helpers.exec(execPath, parameters, options).then(function(result) {
              var col, line, match, regex, toReturn;
              if (result.stderr && result.stderr.length && atom.inDevMode()) {
                console.log('flake8 stderr: ' + result.stderr);
              }
              toReturn = [];
              regex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
              while ((match = regex.exec(result.stdout)) !== null) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnRUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO0FBRXBCLFFBQUEsV0FBQTtBQUFBLElBQUEsSUFBSSxVQUFVLENBQUMsY0FBWCxDQUEwQixlQUExQixDQUFKO0FBR0UsTUFBQSxXQUFBLEdBQWMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxlQUF2QyxDQUhGO0tBQUEsTUFBQTtBQUtFLE1BQUEsV0FBQSxHQUFjLFVBQVUsQ0FBQyxlQUF6QixDQUxGO0tBQUE7V0FNQSxXQUFXLENBQUMsbUJBQVosQ0FBZ0MsVUFBaEMsRUFSb0I7RUFBQSxDQUF0QixDQUFBOztBQUFBLEVBU0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBVEwsQ0FBQTs7QUFBQSxFQVVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVZQLENBQUE7O0FBQUEsRUFXQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBWEQsQ0FBQTs7QUFBQSxFQWFBLFlBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTtBQUNiLFFBQUEsdU5BQUE7QUFBQSxJQURlLFlBQUEsTUFBTSxlQUFBLFNBQVMsa0JBQUEsWUFBWSxpQkFBQSxXQUFXLGtCQUFBLFVBQ3JELENBQUE7QUFBQSxZQUFPLElBQVA7QUFBQSxXQUNPLE1BRFA7QUFJSSxRQUFBLE1BQUEsR0FBUyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixPQUE3QixDQUFzQyxDQUFBLENBQUEsQ0FBL0MsQ0FBQTtBQUNBLGVBQU0sSUFBTixHQUFBO0FBQ0UsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO0FBQUEsVUFDQSxhQUFBLEdBQWdCLG1CQUFBLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBRGhCLENBQUE7QUFFQSxVQUFBLElBQUcsYUFBQSxLQUFpQixNQUFwQjtBQUNFLGtCQURGO1dBRkE7QUFBQSxVQUlBLGNBQUEsR0FBaUIsS0FKakIsQ0FBQTtBQUtBO0FBQUEsZUFBQSwyQ0FBQTs2QkFBQTtBQUNFLFlBQUEsSUFBRyxlQUEwQixLQUFLLENBQUMsTUFBaEMsRUFBQSxzQkFBQSxNQUFIO0FBQ0UsY0FBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsTUFBbEI7QUFDRSx1QkFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBRCxFQUF1QixDQUFDLFVBQUQsRUFBYSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFsQyxDQUF2QixDQUFQLENBREY7ZUFERjthQUFBO0FBR0EsWUFBQSxJQUFHLGVBQW9DLEtBQUssQ0FBQyxNQUExQyxFQUFBLGdDQUFBLE1BQUg7QUFDRSxjQUFBLGNBQUEsR0FBaUIsSUFBakIsQ0FERjthQUhBO0FBQUEsWUFLQSxNQUFBLElBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUx0QixDQURGO0FBQUEsV0FMQTtBQVlBLFVBQUEsSUFBRyxDQUFBLGNBQUg7QUFDRSxrQkFERjtXQVpBO0FBQUEsVUFjQSxVQUFBLElBQWMsQ0FkZCxDQURGO1FBQUEsQ0FMSjtBQUNPO0FBRFAsV0FxQk8sTUFyQlA7QUFBQSxXQXFCZSxNQXJCZjtBQUFBLFdBcUJ1QixNQXJCdkI7QUFBQSxXQXFCK0IsTUFyQi9CO0FBMEJJLFFBQUEsYUFBQSxHQUFnQixtQkFBQSxDQUFvQixVQUFwQixFQUFnQyxVQUFoQyxDQUFoQixDQUFBO0FBQ0EsUUFBQSxJQUFHLGFBQUEsS0FBaUIsTUFBcEI7QUFDRSxnQkFERjtTQURBO0FBQUEsUUFHQSxNQUFBLEdBQVMsQ0FIVCxDQUFBO0FBSUE7QUFBQSxhQUFBLDhDQUFBOzRCQUFBO0FBQ0UsVUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLHVCQUFiO0FBQ0UsbUJBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxDQUFiLENBQUQsRUFBa0IsQ0FBQyxVQUFELEVBQWEsTUFBYixDQUFsQixDQUFQLENBREY7V0FBQTtBQUVBLFVBQUEsSUFBRyxLQUFLLENBQUMsdUJBQU4sS0FBbUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFsRDtBQUNFLG1CQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsQ0FBYixDQUFELEVBQWtCLENBQUMsVUFBRCxFQUFhLE1BQUEsR0FBUyxLQUFLLENBQUMsdUJBQTVCLENBQWxCLENBQVAsQ0FERjtXQUZBO0FBQUEsVUFJQSxNQUFBLElBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUp0QixDQURGO0FBQUEsU0E5Qko7QUFxQitCO0FBckIvQixXQW9DTyxNQXBDUDtBQUFBLFdBb0NlLE1BcENmO0FBdUNJLGVBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBOUIsQ0FBUCxDQXZDSjtBQUFBLFdBd0NPLE1BeENQO0FBMENJLFFBQUEsTUFBQSxHQUFTLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE9BQWpCLENBQTBCLENBQUEsQ0FBQSxDQUFuQyxDQUFBO0FBQUEsUUFDQSxXQUFBLEdBQWMsS0FEZCxDQUFBO0FBRUEsZUFBTSxJQUFOLEdBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxVQUNBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FEaEIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0Usa0JBREY7V0FGQTtBQUlBO0FBQUEsZUFBQSw4Q0FBQTs4QkFBQTtBQUNFLFlBQUEsSUFBRyxXQUFBLElBQWdCLEtBQUssQ0FBQyxLQUFOLEtBQWUsTUFBbEM7QUFDRSxxQkFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBRCxFQUF1QixDQUFDLFVBQUQsRUFBYSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFsQyxDQUF2QixDQUFQLENBREY7YUFBQTtBQUVBLFlBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLFFBQWYsSUFBNEIsZUFBbUMsS0FBSyxDQUFDLE1BQXpDLEVBQUEsK0JBQUEsTUFBL0I7QUFDRSxjQUFBLFdBQUEsR0FBYyxJQUFkLENBREY7YUFGQTtBQUFBLFlBSUEsTUFBQSxJQUFVLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFKdEIsQ0FERjtBQUFBLFdBSkE7QUFBQSxVQVVBLFVBQUEsSUFBYyxDQVZkLENBREY7UUFBQSxDQTVDSjtBQXdDTztBQXhDUCxXQXdETyxNQXhEUDtBQUFBLFdBd0RlLE1BeERmO0FBMkRJLFFBQUEsTUFBQSxHQUFTLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE9BQWpCLENBQTBCLENBQUEsQ0FBQSxDQUFuQyxDQUFBO0FBQUEsUUFDQSxhQUFBLEdBQWdCLG1CQUFBLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBRGhCLENBQUE7QUFFQSxRQUFBLElBQUcsYUFBQSxLQUFpQixNQUFwQjtBQUNFLGdCQURGO1NBRkE7QUFBQSxRQUlBLE1BQUEsR0FBUyxDQUpULENBQUE7QUFLQTtBQUFBLGFBQUEsOENBQUE7NEJBQUE7QUFDRSxVQUFBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxNQUFmLElBQTBCLE1BQUEsSUFBVSxTQUFBLEdBQVksQ0FBbkQ7QUFDRSxtQkFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBRCxFQUF1QixDQUFDLFVBQUQsRUFBYSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFsQyxDQUF2QixDQUFQLENBREY7V0FBQTtBQUFBLFVBRUEsTUFBQSxJQUFVLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFGdEIsQ0FERjtBQUFBLFNBaEVKO0FBd0RlO0FBeERmLFdBb0VPLE1BcEVQO0FBc0VJLGVBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBOUIsQ0FBUCxDQXRFSjtBQUFBLFdBdUVPLE1BdkVQO0FBeUVJLGVBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFiLENBQTlCLENBQVAsQ0F6RUo7QUFBQSxXQTBFTyxNQTFFUDtBQTRFSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0E1RUo7QUFBQSxXQTZFTyxNQTdFUDtBQStFSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0EvRUo7QUFBQSxXQWdGTyxNQWhGUDtBQWtGSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLEVBQXpCLENBQTlCLENBQVAsQ0FsRko7QUFBQSxXQW1GTyxNQW5GUDtBQXFGSSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQTlCLENBQVAsQ0FyRko7QUFBQSxXQXNGTyxNQXRGUDtBQXdGSSxRQUFBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FBaEIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0UsZ0JBREY7U0FEQTtBQUFBLFFBR0EsTUFBQSxHQUFTLENBSFQsQ0FBQTtBQUlBO0FBQUEsYUFBQSw4Q0FBQTs0QkFBQTtBQUNFLFVBQUEsSUFBRyxlQUErQixLQUFLLENBQUMsTUFBckMsRUFBQSwyQkFBQSxNQUFIO0FBQ0UsWUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsUUFBbEI7QUFDRSxxQkFBTyxDQUFDLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBRCxFQUF1QixDQUFDLFVBQUQsRUFBYSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFsQyxDQUF2QixDQUFQLENBREY7YUFERjtXQUFBO0FBQUEsVUFHQSxNQUFBLElBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUh0QixDQURGO0FBQUEsU0E1Rko7QUFzRk87QUF0RlAsV0FpR08sTUFqR1A7QUFtR0ksUUFBQSxVQUFBLEdBQWEsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FBYixDQUFBO0FBQ0EsUUFBQSxJQUFHLFVBQUEsS0FBYyxNQUFqQjtBQUNFLGdCQURGO1NBREE7QUFHQSxlQUFPLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBQSxHQUFZLENBQXpCLENBQUQsRUFBOEIsQ0FBQyxVQUFELEVBQWEsVUFBVSxDQUFDLE1BQXhCLENBQTlCLENBQVAsQ0F0R0o7QUFBQSxLQUFBO0FBdUdBLFdBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxTQUFBLEdBQVksQ0FBekIsQ0FBRCxFQUE4QixDQUFDLFVBQUQsRUFBYSxTQUFiLENBQTlCLENBQVAsQ0F4R2E7RUFBQSxDQWJmLENBQUE7O0FBQUEsRUF1SEEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsUUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDhFQUFBLEdBQ1gsNkVBRFcsR0FFWCxrREFKRjtPQURGO0FBQUEsTUFNQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHlDQUZiO09BUEY7QUFBQSxNQVVBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDBFQUZiO09BWEY7QUFBQSxNQWNBLGFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQURUO09BZkY7QUFBQSxNQWlCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtPQWxCRjtBQUFBLE1Bc0JBLGFBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLCtDQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLENBQUEsQ0FGVDtPQXZCRjtBQUFBLE1BMEJBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BM0JGO0FBQUEsTUE2QkEsWUFBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsNkNBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxPQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLFFBR0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUpGO09BOUJGO0FBQUEsTUFtQ0Esb0JBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDhDQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FwQ0Y7QUFBQSxNQXVDQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSw2Q0FBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BeENGO0tBREY7QUFBQSxJQTZDQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQURqQixDQUFBO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw4QkFBcEIsRUFDakIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsY0FBRCxHQUFBO2lCQUNFLEtBQUMsQ0FBQSxjQUFELEdBQWtCLGVBRHBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEaUIsQ0FBbkIsRUFIUTtJQUFBLENBN0NWO0FBQUEsSUFvREEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQXBEWjtBQUFBLElBdURBLFVBQUEsRUFBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixJQUE1QixDQUFrQyxDQUFBLENBQUEsRUFEeEI7SUFBQSxDQXZEWjtBQUFBLElBMERBLFdBQUEsRUFBYSxTQUFDLE9BQUQsR0FBQTthQUNYLElBQUksQ0FBQyxRQUFMLENBQWMsT0FBZCxFQURXO0lBQUEsQ0ExRGI7QUFBQSxJQTZEQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQsRUFBVyxPQUFYLEdBQUE7QUFDbEIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYixDQUFkLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxRQUFRLENBQUMsT0FBVCxDQUFpQixpQkFBakIsRUFBb0MsV0FBcEMsQ0FEWCxDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0IsT0FBL0IsQ0FGWCxDQUFBO0FBR0E7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxDQUFIO0FBQ0UsaUJBQU8sQ0FBUCxDQURGO1NBREY7QUFBQSxPQUhBO0FBTUEsYUFBTyxRQUFQLENBUGtCO0lBQUEsQ0E3RHBCO0FBQUEsSUFzRUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsaUJBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUixDQUFWLENBQUE7YUFFQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxhQUFBLEVBQWUsQ0FBQyxlQUFELEVBQWtCLHNCQUFsQixDQURmO0FBQUEsUUFFQSxLQUFBLEVBQU8sTUFGUDtBQUFBLFFBR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxRQUlBLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsVUFBRCxHQUFBO0FBQ0osZ0JBQUEsb0tBQUE7QUFBQSxZQUFBLFFBQUEsR0FBVyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQVgsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FEWCxDQUFBO0FBQUEsWUFFQSxVQUFBLEdBQWEsRUFGYixDQUFBO0FBSUEsWUFBQSxJQUFHLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUFuQjtBQUNFLGNBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsbUJBQWhCLEVBQXFDLGFBQXJDLENBQUEsQ0FERjthQUpBO0FBTUEsWUFBQSxJQUFHLENBQUMsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUFwQixDQUFzRSxDQUFDLE1BQTFFO0FBQ0UsY0FBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFoQixFQUE0QixnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixHQUF0QixDQUE1QixDQUFBLENBREY7YUFOQTtBQVFBLFlBQUEsSUFBRyxhQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBbkI7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGtCQUFoQixFQUFvQyxhQUFwQyxDQUFBLENBREY7YUFSQTtBQVVBLFlBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCLENBQUg7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGdCQUFoQixDQUFBLENBREY7YUFWQTtBQVlBLFlBQUEsSUFBRyxDQUFDLFlBQUEsR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLENBQWhCLENBQThELENBQUMsTUFBbEU7QUFDRSxjQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFVBQWhCLEVBQTRCLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLENBQTVCLENBQUEsQ0FERjthQVpBO0FBY0EsWUFBQSxJQUFHLENBQUMsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFyQixDQUFIO0FBQ0UsY0FBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFoQixFQUE0QixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxpQkFBdEMsQ0FBNUIsQ0FBQSxDQURGO2FBZEE7QUFBQSxZQWdCQSxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQWhCQSxDQUFBO0FBQUEsWUFrQkEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBbEJMLENBQUE7QUFBQSxZQW1CQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixDQW5CWCxDQUFBO0FBQUEsWUFvQkEsUUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsQ0FwQlgsQ0FBQTtBQUFBLFlBcUJBLE9BQUEsR0FBVSxLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosQ0FBQSxJQUF5QixJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FyQm5DLENBQUE7QUFBQSxZQXNCQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFwQixFQUFxRSxPQUFyRSxDQUFiLENBdEJYLENBQUE7QUFBQSxZQXVCQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFVLENBQUMsT0FBWCxDQUFBLENBQWIsQ0F2Qk4sQ0FBQTtBQUFBLFlBd0JBLE9BQUEsR0FBVTtBQUFBLGNBQUMsS0FBQSxFQUFPLFFBQVI7QUFBQSxjQUFrQixHQUFBLEVBQUssR0FBdkI7QUFBQSxjQUE0QixNQUFBLEVBQVEsTUFBcEM7YUF4QlYsQ0FBQTtBQXlCQSxZQUFBLElBQUcsS0FBQyxDQUFBLGNBQUo7QUFDRSxjQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFFBQWxCLENBREY7YUF6QkE7QUEyQkEsbUJBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxRQUFiLEVBQXVCLFVBQXZCLEVBQW1DLE9BQW5DLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsU0FBQyxNQUFELEdBQUE7QUFDdEQsa0JBQUEsaUNBQUE7QUFBQSxjQUFBLElBQUksTUFBTSxDQUFDLE1BQVAsSUFBa0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFoQyxJQUEyQyxJQUFJLENBQUMsU0FBTCxDQUFBLENBQS9DO0FBQ0UsZ0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBQSxHQUFvQixNQUFNLENBQUMsTUFBdkMsQ0FBQSxDQURGO2VBQUE7QUFBQSxjQUVBLFFBQUEsR0FBVyxFQUZYLENBQUE7QUFBQSxjQUdBLEtBQUEsR0FBUSx3Q0FIUixDQUFBO0FBS0EscUJBQU0sQ0FBQyxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFNLENBQUMsTUFBbEIsQ0FBVCxDQUFBLEtBQXlDLElBQS9DLEdBQUE7QUFDRSxnQkFBQSxJQUFBLEdBQU8sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsQ0FBQSxJQUFzQixDQUE3QixDQUFBO0FBQUEsZ0JBQ0EsR0FBQSxHQUFNLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLENBQUEsSUFBc0IsQ0FENUIsQ0FBQTtBQUFBLGdCQUVBLFFBQVEsQ0FBQyxJQUFULENBQWM7QUFBQSxrQkFDWixJQUFBLEVBQVMsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFZLEdBQVosSUFBb0IsQ0FBQSxRQUFwQixJQUFvQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksR0FBaEQsSUFBd0QsUUFBM0QsR0FBeUUsT0FBekUsR0FBc0YsU0FEaEY7QUFBQSxrQkFFWixJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEtBQVgsR0FBbUIsS0FBTSxDQUFBLENBQUEsQ0FGbkI7QUFBQSxrQkFHWixVQUFBLFFBSFk7QUFBQSxrQkFJWixLQUFBLEVBQU8sWUFBQSxDQUFhO0FBQUEsb0JBQ2xCLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQURNO0FBQUEsb0JBRWxCLE9BQUEsRUFBUyxLQUFNLENBQUEsQ0FBQSxDQUZHO0FBQUEsb0JBR2xCLFVBQUEsRUFBWSxJQUFBLEdBQU8sQ0FIRDtBQUFBLG9CQUlsQixTQUFBLEVBQVcsR0FKTztBQUFBLG9CQUtsQixZQUFBLFVBTGtCO21CQUFiLENBSks7aUJBQWQsQ0FGQSxDQURGO2NBQUEsQ0FMQTtBQW9CQSxxQkFBTyxRQUFQLENBckJzRDtZQUFBLENBQWpELENBQVAsQ0E1Qkk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOO1FBSlc7SUFBQSxDQXRFZjtHQXhIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.coffee
