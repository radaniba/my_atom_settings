(function() {
  var extractRange, fs, path, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tokenizedLineForRow = function(textEditor, lineNumber) {
    return textEditor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
  };

  fs = require('fs');

  path = require('path');

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
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). ' + 'Use `$PROJECT` or `$PROJECT_NAME` substitutions for project specific paths ' + 'e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
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
              cwd: cwd,
              stream: 'both'
            }).then(function(result) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO1dBQ3BCLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLG1CQUF6QyxDQUE2RCxVQUE3RCxFQURvQjtFQUFBLENBQXRCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQU1BLFlBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTtBQUNiLFFBQUEsdU5BQUE7QUFBQSxJQURlLFlBQUEsTUFBTSxlQUFBLFNBQVMsa0JBQUEsWUFBWSxpQkFBQSxXQUFXLGtCQUFBLFVBQ3JELENBQUE7QUFBQSxZQUFPLElBQVA7QUFBQSxXQUNPLE1BRFA7QUFJSSxRQUFBLE1BQUEsR0FBUyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixPQUE3QixDQUFzQyxDQUFBLENBQUEsQ0FBL0MsQ0FBQTtBQUNBLGVBQU0sSUFBTixHQUFBO0FBQ0UsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO0FBQUEsVUFDQSxhQUFBLEdBQWdCLG1CQUFBLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBRGhCLENBQUE7QUFFQSxVQUFBLElBQUcsYUFBQSxLQUFpQixNQUFwQjtBQUNFLGtCQURGO1dBRkE7QUFBQSxVQUlBLGNBQUEsR0FBaUIsS0FKakIsQ0FBQTtBQUtBO0FBQUEsZUFBQSwyQ0FBQTs2QkFBQTtBQUNFLFlBQUEsSUFBRyxlQUEwQixLQUFLLENBQUMsTUFBaEMsRUFB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

//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.coffee
