(function() {
  var extractRange, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tokenizedLineForRow = function(textEditor, lineNumber) {
    return textEditor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
  };

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
            if (token.value === 'import' && __indexOf.call(token.scopes, 'keyword.control.flow.python') >= 0) {
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
        description: 'Full path to binary (e.g. /usr/local/bin/flake8)'
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
    provideLinter: function() {
      var helpers, path, provider;
      helpers = require('atom-linter');
      path = require('path');
      return provider = {
        name: 'Flake8',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var cwd, execPath, filePath, fileText, flakeerr, ignoreErrorCodes, maxComplexity, maxLineLength, parameters, pep8warn, projectConfigFile, selectErrors;
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
          execPath = atom.config.get('linter-flake8.executablePath');
          pep8warn = atom.config.get('linter-flake8.pep8ErrorsToWarnings');
          flakeerr = atom.config.get('linter-flake8.flakeErrors');
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
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO1dBQTRCLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLG1CQUF6QyxDQUE2RCxVQUE3RCxFQUE1QjtFQUFBLENBQXRCLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDYixRQUFBLHVOQUFBO0FBQUEsSUFEZSxZQUFBLE1BQU0sZUFBQSxTQUFTLGtCQUFBLFlBQVksaUJBQUEsV0FBVyxrQkFBQSxVQUNyRCxDQUFBO0FBQUEsWUFBTyxJQUFQO0FBQUEsV0FDTyxNQURQO0FBSUksUUFBQSxNQUFBLEdBQVMsdUJBQXVCLENBQUMsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FBc0MsQ0FBQSxDQUFBLENBQS9DLENBQUE7QUFDQSxlQUFNLElBQU4sR0FBQTtBQUNFLFVBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTtBQUFBLFVBQ0EsYUFBQSxHQUFnQixtQkFBQSxDQUFvQixVQUFwQixFQUFnQyxVQUFoQyxDQURoQixDQUFBO0FBRUEsVUFBQSxJQUFHLGFBQUEsS0FBaUIsTUFBcEI7QUFDRSxrQkFERjtXQUZBO0FBQUEsVUFJQSxjQUFBLEdBQWlCLEtBSmpCLENBQUE7QUFLQTtBQUFBLGVBQUEsMkNBQUE7NkJBQUE7QUFDRSxZQUFBLElBQUcsZUFBMEIsS0FBSyxDQUFDLE1BQWhDLEVBQUEsc0JBQUEsTUFBSDtBQUNFLGNBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLE1BQWxCO0FBQ0UsdUJBQU8sQ0FBQyxDQUFDLFVBQUQsRUFBYSxNQUFiLENB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

//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/main.coffee
