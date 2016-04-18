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
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). Use `$PROJECT` substitutions for project specific paths e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
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
            execPath = fs.normalize(atom.config.get('linter-flake8.executablePath'));
            pep8warn = atom.config.get('linter-flake8.pep8ErrorsToWarnings');
            flakeerr = atom.config.get('linter-flake8.flakeErrors');
            projDir = _this.getProjDir(filePath) || path.dirname(filePath);
            execPath = _this.applySubstitutions(atom.config.get('linter-flake8.executablePath'), projDir);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQ0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO1dBQ3BCLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLG1CQUF6QyxDQUE2RCxVQUE3RCxFQURvQjtFQUFBLENBQXRCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2IsUUFBQSx1TkFBQTtBQUFBLElBRGUsWUFBQSxNQUFNLGVBQUEsU0FBUyxrQkFBQSxZQUFZLGlCQUFBLFdBQVcsa0JBQUEsVUFDckQsQ0FBQTtBQUFBLFlBQU8sSUFBUDtBQUFBLFdBQ08sTUFEUDtBQUlJLFFBQUEsTUFBQSxHQUFTLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLE9BQTdCLENBQXNDLENBQUEsQ0FBQSxDQUEvQyxDQUFBO0FBQ0EsZUFBTSxJQUFOLEdBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxVQUNBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FEaEIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0Usa0JBREY7V0FGQTtBQUFBLFVBSUEsY0FBQSxHQUFpQixLQUpqQixDQUFBO0FBS0E7QUFBQSxlQUFBLDJDQUFBOzZCQUFBO0FBQ0UsWUFBQSxJQUFHLGVBQTBCLEtBQUssQ0FBQyxNQUFoQyxFQUFBLHNCQUFBLE1BQUg7QUFDRSxjQUFBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FB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

//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.coffee
