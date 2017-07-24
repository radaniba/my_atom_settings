(function() {
  var config, plugins, proxy;

  proxy = require("../services/php-proxy.coffee");

  config = require("../config.coffee");

  plugins = require("../services/plugin-manager.coffee");

  module.exports = {
    structureStartRegex: /(?:abstract class|class|trait|interface)\s+(\w+)/,
    useStatementRegex: /(?:use)(?:[^\w\\])([\w\\]+)(?![\w\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/,
    cache: [],

    /**
     * Retrieves the class the specified term (method or property) is being invoked on.
     *
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     *
     * @return {string}
     *
     * @example Invoking it on MyMethod::foo()->bar() will ask what class 'bar' is invoked on, which will whatever type
     *          foo returns.
     */
    getCalledClass: function(editor, term, bufferPosition) {
      var fullCall;
      fullCall = this.getStackClasses(editor, bufferPosition);
      if ((fullCall != null ? fullCall.length : void 0) === 0 || !term) {
        return;
      }
      return this.parseElements(editor, bufferPosition, fullCall);
    },

    /**
     * Get all variables declared in the current function
     * @param {TextEdutir} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     */
    getAllVariablesInFunction: function(editor, bufferPosition) {
      var isInFunction, matches, regex, startPosition, text;
      isInFunction = this.isInFunction(editor, bufferPosition);
      startPosition = null;
      if (isInFunction) {
        startPosition = this.cache['functionPosition'];
      } else {
        startPosition = [0, 0];
      }
      text = editor.getTextInBufferRange([startPosition, [bufferPosition.row, bufferPosition.column - 1]]);
      regex = /(\$[a-zA-Z_]+)/g;
      matches = text.match(regex);
      if (matches == null) {
        return [];
      }
      if (isInFunction) {
        matches.push("$this");
      }
      return matches;
    },

    /**
     * Retrieves the full class name. If the class name is a FQCN (Fully Qualified Class Name), it already is a full
     * name and it is returned as is. Otherwise, the current namespace and use statements are scanned.
     *
     * @param {TextEditor}  editor    Text editor instance.
     * @param {string|null} className Name of the class to retrieve the full name of. If null, the current class will
     *                                be returned (if any).
     * @param {boolean}     noCurrent Do not use the current class if className is empty
     *
     * @return string
     */
    getFullClassName: function(editor, className, noCurrent) {
      var classNameParts, definitionPattern, found, fullClass, i, importNameParts, isAliasedImport, line, lines, matches, methodsRequest, namespacePattern, text, usePattern, _i, _len;
      if (className == null) {
        className = null;
      }
      if (noCurrent == null) {
        noCurrent = false;
      }
      if (className === null) {
        className = '';
        if (noCurrent) {
          return null;
        }
      }
      if (className && className[0] === "\\") {
        return className.substr(1);
      }
      usePattern = /(?:use)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/;
      namespacePattern = /(?:namespace)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:;)/;
      definitionPattern = /(?:abstract class|class|trait|interface)\s+(\w+)/;
      text = editor.getText();
      lines = text.split('\n');
      fullClass = className;
      found = false;
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        matches = line.match(namespacePattern);
        if (matches) {
          fullClass = matches[1] + '\\' + className;
        } else if (className) {
          matches = line.match(usePattern);
          if (matches) {
            classNameParts = className.split('\\');
            importNameParts = matches[1].split('\\');
            isAliasedImport = matches[2] ? true : false;
            if (className === matches[1]) {
              fullClass = className;
              break;
            } else if ((isAliasedImport && matches[2] === classNameParts[0]) || (!isAliasedImport && importNameParts[importNameParts.length - 1] === classNameParts[0])) {
              found = true;
              fullClass = matches[1];
              classNameParts = classNameParts.slice(1, +classNameParts.length + 1 || 9e9);
              if (classNameParts.length > 0) {
                fullClass += '\\' + classNameParts.join('\\');
              }
              break;
            }
          }
        }
        matches = line.match(definitionPattern);
        if (matches) {
          if (!className) {
            found = true;
            fullClass += matches[1];
          }
          break;
        }
      }
      if (fullClass && fullClass[0] === '\\') {
        fullClass = fullClass.substr(1);
      }
      if (!found) {
        methodsRequest = proxy.methods(fullClass);
        if (!(methodsRequest != null ? methodsRequest.filename : void 0)) {
          fullClass = className;
        }
      }
      return fullClass;
    },

    /**
     * Add the use for the given class if not already added.
     *
     * @param {TextEditor} editor                  Atom text editor.
     * @param {string}     className               Name of the class to add.
     * @param {boolean}    allowAdditionalNewlines Whether to allow adding additional newlines to attempt to group use
     *                                             statements.
     *
     * @return {int}       The amount of lines added (including newlines), so you can reliably and easily offset your
     *                     rows. This could be zero if a use statement was already present.
     */
    addUseClass: function(editor, className, allowAdditionalNewlines) {
      var bestScore, bestUse, doNewLine, i, line, lineCount, lineEnding, lineToInsertAt, matches, placeBelow, scopeDescriptor, score, textToInsert, _i, _ref;
      if (className.split('\\').length === 1 || className.indexOf('\\') === 0) {
        return null;
      }
      bestUse = 0;
      bestScore = 0;
      placeBelow = true;
      doNewLine = true;
      lineCount = editor.getLineCount();
      for (i = _i = 0, _ref = lineCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        line = editor.lineTextForBufferRow(i).trim();
        if (line.length === 0) {
          continue;
        }
        scopeDescriptor = editor.scopeDescriptorForBufferPosition([i, line.length]).getScopeChain();
        if (scopeDescriptor.indexOf('.comment') >= 0) {
          continue;
        }
        if (line.match(this.structureStartRegex)) {
          break;
        }
        if (line.indexOf('namespace ') >= 0) {
          bestUse = i;
        }
        matches = this.useStatementRegex.exec(line);
        if ((matches != null) && (matches[1] != null)) {
          if (matches[1] === className) {
            return 0;
          }
          score = this.scoreClassName(className, matches[1]);
          if (score >= bestScore) {
            bestUse = i;
            bestScore = score;
            if (this.doShareCommonNamespacePrefix(className, matches[1])) {
              doNewLine = false;
              placeBelow = className.length >= matches[1].length ? true : false;
            } else {
              doNewLine = true;
              placeBelow = true;
            }
          }
        }
      }
      lineEnding = editor.getBuffer().lineEndingForRow(0);
      if (!allowAdditionalNewlines) {
        doNewLine = false;
      }
      if (!lineEnding) {
        lineEnding = "\n";
      }
      textToInsert = '';
      if (doNewLine && placeBelow) {
        textToInsert += lineEnding;
      }
      textToInsert += ("use " + className + ";") + lineEnding;
      if (doNewLine && !placeBelow) {
        textToInsert += lineEnding;
      }
      lineToInsertAt = bestUse + (placeBelow ? 1 : 0);
      editor.setTextInBufferRange([[lineToInsertAt, 0], [lineToInsertAt, 0]], textToInsert);
      return 1 + (doNewLine ? 1 : 0);
    },

    /**
     * Returns a boolean indicating if the specified class names share a common namespace prefix.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {boolean}
     */
    doShareCommonNamespacePrefix: function(firstClassName, secondClassName) {
      var firstClassNameParts, secondClassNameParts;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      firstClassNameParts.pop();
      secondClassNameParts.pop();
      if (firstClassNameParts.join('\\') === secondClassNameParts.join('\\')) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Scores the first class name against the second, indicating how much they 'match' each other. This can be used
     * to e.g. find an appropriate location to place a class in an existing list of classes.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {float}
     */
    scoreClassName: function(firstClassName, secondClassName) {
      var firstClassNameParts, i, maxLength, secondClassNameParts, totalScore, _i, _ref;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      maxLength = 0;
      if (firstClassNameParts.length > secondClassNameParts.length) {
        maxLength = secondClassNameParts.length;
      } else {
        maxLength = firstClassNameParts.length;
      }
      totalScore = 0;
      for (i = _i = 0, _ref = maxLength - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (firstClassNameParts[i] === secondClassNameParts[i]) {
          totalScore += 2;
        }
      }
      if (this.doShareCommonNamespacePrefix(firstClassName, secondClassName)) {
        if (firstClassName.length === secondClassName.length) {
          totalScore += 2;
        } else {
          totalScore -= 0.001 * Math.abs(secondClassName.length - firstClassName.length);
        }
      }
      return totalScore;
    },

    /**
     * Checks if the given name is a class or not
     * @param  {string}  name Name to check
     * @return {Boolean}
     */
    isClass: function(name) {
      return name.substr(0, 1).toUpperCase() + name.substr(1) === name;
    },

    /**
     * Checks if the current buffer is in a functon or not
     * @param {TextEditor} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     * @return bool
     */
    isInFunction: function(editor, bufferPosition) {
      var chain, character, closedBlocks, lastChain, line, lineLength, openedBlocks, result, row, rows, text;
      text = editor.getTextInBufferRange([[0, 0], bufferPosition]);
      if (this.cache[text] != null) {
        return this.cache[text];
      }
      this.cache = [];
      row = bufferPosition.row;
      rows = text.split('\n');
      openedBlocks = 0;
      closedBlocks = 0;
      result = false;
      while (row !== -1) {
        line = rows[row];
        if (!line) {
          row--;
          continue;
        }
        character = 0;
        lineLength = line.length;
        lastChain = null;
        while (character <= line.length) {
          chain = editor.scopeDescriptorForBufferPosition([row, character]).getScopeChain();
          if (!(character === line.length && chain === lastChain)) {
            if (chain.indexOf("scope.end") !== -1) {
              closedBlocks++;
            } else if (chain.indexOf("scope.begin") !== -1) {
              openedBlocks++;
            }
          }
          lastChain = chain;
          character++;
        }
        chain = editor.scopeDescriptorForBufferPosition([row, line.length]).getScopeChain();
        if (chain.indexOf("function") !== -1) {
          if (openedBlocks > closedBlocks) {
            result = true;
            this.cache["functionPosition"] = [row, 0];
            break;
          }
        }
        row--;
      }
      this.cache[text] = result;
      return result;
    },

    /**
     * Retrieves the stack of elements in a stack of calls such as "self::xxx->xxxx".
     *
     * @param  {TextEditor} editor
     * @param  {Point}       position
     *
     * @return {Object}
     */
    getStackClasses: function(editor, position) {
      var finished, i, line, lineText, parenthesesClosed, parenthesesOpened, scopeDescriptor, squiggleBracketsClosed, squiggleBracketsOpened, textSlice;
      if (position == null) {
        return;
      }
      line = position.row;
      finished = false;
      parenthesesOpened = 0;
      parenthesesClosed = 0;
      squiggleBracketsOpened = 0;
      squiggleBracketsClosed = 0;
      while (line > 0) {
        lineText = editor.lineTextForBufferRow(line);
        if (!lineText) {
          return;
        }
        if (line !== position.row) {
          i = lineText.length - 1;
        } else {
          i = position.column - 1;
        }
        while (i >= 0) {
          if (lineText[i] === '(') {
            ++parenthesesOpened;
            if (parenthesesOpened > parenthesesClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === ')') {
            ++parenthesesClosed;
          } else if (lineText[i] === '{') {
            ++squiggleBracketsOpened;
            if (squiggleBracketsOpened > squiggleBracketsClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === '}') {
            ++squiggleBracketsClosed;
          } else if (parenthesesOpened === parenthesesClosed && squiggleBracketsOpened === squiggleBracketsClosed) {
            if (lineText[i] === '$') {
              finished = true;
              break;
            } else if (lineText[i] === ';' || lineText[i] === '=') {
              ++i;
              finished = true;
              break;
            } else {
              scopeDescriptor = editor.scopeDescriptorForBufferPosition([line, i]).getScopeChain();
              if (scopeDescriptor.indexOf('.function.construct') > 0) {
                ++i;
                finished = true;
                break;
              }
            }
          }
          --i;
        }
        if (finished) {
          break;
        }
        --line;
      }
      textSlice = editor.getTextInBufferRange([[line, i], position]).trim();
      return this.parseStackClass(textSlice);
    },

    /**
     * Removes content inside parantheses (including nested parantheses).
     * @param {string}  text String to analyze.
     * @param {boolean} keep string inside parenthesis
     * @return String
     */
    stripParanthesesContent: function(text, keepString) {
      var closeCount, content, i, openCount, originalLength, reg, startIndex;
      i = 0;
      openCount = 0;
      closeCount = 0;
      startIndex = -1;
      while (i < text.length) {
        if (text[i] === '(') {
          ++openCount;
          if (openCount === 1) {
            startIndex = i;
          }
        } else if (text[i] === ')') {
          ++closeCount;
          if (closeCount === openCount) {
            originalLength = text.length;
            content = text.substring(startIndex, i + 1);
            reg = /["(][\s]*[\'\"][\s]*([^\"\']+)[\s]*[\"\'][\s]*[")]/g;
            if (openCount === 1 && reg.exec(content)) {
              continue;
            }
            text = text.substr(0, startIndex + 1) + text.substr(i, text.length);
            i -= originalLength - text.length;
            openCount = 0;
            closeCount = 0;
          }
        }
        ++i;
      }
      return text;
    },

    /**
     * Parse stack class elements
     * @param {string} text String of the stack class
     * @return Array
     */
    parseStackClass: function(text) {
      var element, elements, key, regx;
      regx = /\/\/.*\n/g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      regx = /\/\*[^(\*\/)]*\*\//g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      text = this.stripParanthesesContent(text, true);
      if (!text) {
        return [];
      }
      elements = text.split(/(?:\-\>|::)/);
      for (key in elements) {
        element = elements[key];
        element = element.replace(/^\s+|\s+$/g, "");
        if (element[0] === '{' || element[0] === '[') {
          element = element.substring(1);
        } else if (element.indexOf('return ') === 0) {
          element = element.substring('return '.length);
        }
        elements[key] = element;
      }
      return elements;
    },

    /**
     * Get the type of a variable
     *
     * @param {TextEditor} editor
     * @param {Range}      bufferPosition
     * @param {string}     element        Variable to search
     */
    getVariableType: function(editor, bufferPosition, element) {
      var bestMatch, bestMatchRow, chain, elements, funcName, line, lineNumber, matches, matchesCatch, matchesNew, newPosition, params, regexCatch, regexElement, regexFunction, regexNewInstance, regexVar, regexVarWithVarName, typeHint, value;
      if (element.replace(/[\$][a-zA-Z0-9_]+/g, "").trim().length > 0) {
        return null;
      }
      if (element.trim().length === 0) {
        return null;
      }
      bestMatch = null;
      bestMatchRow = null;
      regexElement = new RegExp("\\" + element + "[\\s]*=[\\s]*([^;]+);", "g");
      regexNewInstance = new RegExp("\\" + element + "[\\s]*=[\\s]*new[\\s]*\\\\?([a-zA-Z][a-zA-Z_\\\\]*)+(?:(.+)?);", "g");
      regexCatch = new RegExp("catch[\\s]*\\([\\s]*([A-Za-z0-9_\\\\]+)[\\s]+\\" + element + "[\\s]*\\)", "g");
      lineNumber = bufferPosition.row - 1;
      while (lineNumber > 0) {
        line = editor.lineTextForBufferRow(lineNumber);
        if (!bestMatch) {
          matchesNew = regexNewInstance.exec(line);
          if (null !== matchesNew) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesNew[1]);
          }
        }
        if (!bestMatch) {
          matchesCatch = regexCatch.exec(line);
          if (null !== matchesCatch) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesCatch[1]);
          }
        }
        if (!bestMatch) {
          matches = regexElement.exec(line);
          if (null !== matches) {
            value = matches[1];
            elements = this.parseStackClass(value);
            elements.push("");
            newPosition = {
              row: lineNumber,
              column: bufferPosition.column
            };
            bestMatchRow = lineNumber;
            bestMatch = this.parseElements(editor, newPosition, elements);
          }
        }
        if (!bestMatch) {
          regexFunction = new RegExp("function(?:[\\s]+([a-zA-Z]+))?[\\s]*[\\(](?:(?![a-zA-Z\\_\\\\]*[\\s]*\\" + element + ").)*[,\\s]?([a-zA-Z\\_\\\\]*)[\\s]*\\" + element + "[a-zA-Z0-9\\s\\$\\\\,=\\\"\\\'\(\)]*[\\s]*[\\)]", "g");
          matches = regexFunction.exec(line);
          if (null !== matches) {
            typeHint = matches[2];
            if (typeHint.length > 0) {
              return this.getFullClassName(editor, typeHint);
            }
            funcName = matches[1];
            if (funcName && funcName.length > 0) {
              params = proxy.docParams(this.getFullClassName(editor), funcName);
              if ((params.params != null) && (params.params[element] != null)) {
                return this.getFullClassName(editor, params.params[element].type, true);
              }
            }
          }
        }
        chain = editor.scopeDescriptorForBufferPosition([lineNumber, line.length]).getScopeChain();
        if (chain.indexOf("comment") !== -1) {
          if (bestMatchRow && lineNumber === (bestMatchRow - 1)) {
            regexVar = /\@var[\s]+([a-zA-Z_\\]+)(?![\w]+\$)/g;
            matches = regexVar.exec(line);
            if (null !== matches) {
              return this.getFullClassName(editor, matches[1]);
            }
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+([a-zA-Z_\\\\]+)[\\s]+\\" + element, "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+\\" + element + "[\\s]+([a-zA-Z_\\\\]+)", "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
        }
        if (chain.indexOf("function") !== -1) {
          break;
        }
        --lineNumber;
      }
      return bestMatch;
    },

    /**
     * Retrieves contextual information about the class member at the specified location in the editor.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     * @param {Object}     calledClass    Information about the called class (optional).
     */
    getMemberContext: function(editor, term, bufferPosition, calledClass) {
      var methods, val, value, _i, _len, _ref;
      if (!calledClass) {
        calledClass = this.getCalledClass(editor, term, bufferPosition);
      }
      if (!calledClass) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      methods = proxy.methods(calledClass);
      if (!methods || (methods == null)) {
        return;
      }
      if ((methods.error != null) && methods.error !== '') {
        if (config.config.verboseErrors) {
          atom.notifications.addError('Failed to get methods for ' + calledClass, {
            'detail': methods.error.message
          });
        } else {
          console.log('Failed to get methods for ' + calledClass + ' : ' + methods.error.message);
        }
        return;
      }
      if (!((_ref = methods.values) != null ? _ref.hasOwnProperty(term) : void 0)) {
        return;
      }
      value = methods.values[term];
      if (value instanceof Array) {
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          val = value[_i];
          if (val.isMethod) {
            value = val;
            break;
          }
        }
      }
      return value;
    },

    /**
     * Parse all elements from the given array to return the last className (if any)
     * @param  Array elements Elements to parse
     * @return string|null full class name of the last element
     */
    parseElements: function(editor, bufferPosition, elements) {
      var className, element, found, loop_index, methods, plugin, _i, _j, _len, _len1, _ref;
      loop_index = 0;
      className = null;
      if (elements == null) {
        return;
      }
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        if (loop_index === 0) {
          if (element[0] === '$') {
            className = this.getVariableType(editor, bufferPosition, element);
            if (element === '$this' && !className) {
              className = this.getFullClassName(editor);
            }
            loop_index++;
            continue;
          } else if (element === 'static' || element === 'self') {
            className = this.getFullClassName(editor);
            loop_index++;
            continue;
          } else if (element === 'parent') {
            className = this.getParentClass(editor);
            loop_index++;
            continue;
          } else {
            className = this.getFullClassName(editor, element);
            loop_index++;
            continue;
          }
        }
        if (loop_index >= elements.length - 1) {
          break;
        }
        if (className === null) {
          break;
        }
        found = null;
        _ref = plugins.plugins;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          plugin = _ref[_j];
          if (plugin.autocomplete == null) {
            continue;
          }
          found = plugin.autocomplete(className, element);
          if (found) {
            break;
          }
        }
        if (found) {
          className = found;
        } else {
          methods = proxy.autocomplete(className, element);
          if ((methods["class"] == null) || !this.isClass(methods["class"])) {
            className = null;
            break;
          }
          className = methods["class"];
        }
        loop_index++;
      }
      if (elements.length > 0 && (elements[elements.length - 1].length === 0 || elements[elements.length - 1].match(/([a-zA-Z0-9]$)/g))) {
        return className;
      }
      return null;
    },

    /**
     * Gets the full words from the buffer position given.
     * E.g. Getting a class with its namespace.
     * @param  {TextEditor}     editor   TextEditor to search.
     * @param  {BufferPosition} position BufferPosition to start searching from.
     * @return {string}  Returns a string of the class.
     */
    getFullWordFromBufferPosition: function(editor, position) {
      var backwardRegex, currentText, endBufferPosition, forwardRegex, foundEnd, foundStart, index, previousText, range, startBufferPosition;
      foundStart = false;
      foundEnd = false;
      startBufferPosition = [];
      endBufferPosition = [];
      forwardRegex = /-|(?:\()[\w\[\$\(\\]|\s|\)|;|'|,|"|\|/;
      backwardRegex = /\(|\s|\)|;|'|,|"|\|/;
      index = -1;
      previousText = '';
      while (true) {
        index++;
        startBufferPosition = [position.row, position.column - index - 1];
        range = [[position.row, position.column], [startBufferPosition[0], startBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (backwardRegex.test(editor.getTextInBufferRange(range)) || startBufferPosition[1] === -1 || currentText === previousText) {
          foundStart = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundStart) {
          break;
        }
      }
      index = -1;
      while (true) {
        index++;
        endBufferPosition = [position.row, position.column + index + 1];
        range = [[position.row, position.column], [endBufferPosition[0], endBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (forwardRegex.test(currentText) || endBufferPosition[1] === 500 || currentText === previousText) {
          foundEnd = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundEnd) {
          break;
        }
      }
      startBufferPosition[1] += 1;
      endBufferPosition[1] -= 1;
      return editor.getTextInBufferRange([startBufferPosition, endBufferPosition]);
    },

    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */
    getClassSelectorFromEvent: function(event) {
      var $, selector;
      selector = event.currentTarget;
      $ = require('jquery');
      if ($(selector).hasClass('builtin') || $(selector).children('.builtin').length > 0) {
        return null;
      }
      if ($(selector).parent().hasClass('function argument')) {
        return $(selector).parent().children('.namespace, .class:not(.operator):not(.constant)');
      }
      if ($(selector).prev().hasClass('namespace') && $(selector).hasClass('class')) {
        return $([$(selector).prev()[0], selector]);
      }
      if ($(selector).next().hasClass('class') && $(selector).hasClass('namespace')) {
        return $([selector, $(selector).next()[0]]);
      }
      if ($(selector).prev().hasClass('namespace') || $(selector).next().hasClass('inherited-class')) {
        return $(selector).parent().children('.namespace, .inherited-class');
      }
      return selector;
    },

    /**
     * Gets the parent class of the current class opened in the editor
     * @param  {TextEditor} editor Editor with the class in.
     * @return {string}            The namespace and class of the parent
     */
    getParentClass: function(editor) {
      var extendsIndex, line, lines, text, words, _i, _len;
      text = editor.getText();
      lines = text.split('\n');
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        line = line.trim();
        if (line.indexOf('extends ') !== -1) {
          words = line.split(' ');
          extendsIndex = words.indexOf('extends');
          return this.getFullClassName(editor, words[extendsIndex + 1]);
        }
      }
    },

    /**
     * Finds the buffer position of the word given
     * @param  {TextEditor} editor TextEditor to search
     * @param  {string}     term   The function name to search for
     * @return {mixed}             Either null or the buffer position of the function.
     */
    findBufferPositionOfWord: function(editor, term, regex, line) {
      var lineText, lines, result, row, text, _i, _len;
      if (line == null) {
        line = null;
      }
      if (line !== null) {
        lineText = editor.lineTextForBufferRow(line);
        result = this.checkLineForWord(lineText, term, regex);
        if (result !== null) {
          return [line, result];
        }
      } else {
        text = editor.getText();
        row = 0;
        lines = text.split('\n');
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          result = this.checkLineForWord(line, term, regex);
          if (result !== null) {
            return [row, result];
          }
          row++;
        }
      }
      return null;
    },

    /**
     * Checks the lineText for the term and regex matches
     * @param  {string}   lineText The line of text to check.
     * @param  {string}   term     Term to look for.
     * @param  {regex}    regex    Regex to run on the line to make sure it's valid
     * @return {null|int}          Returns null if nothing was found or an
     *                             int of the column the term is on.
     */
    checkLineForWord: function(lineText, term, regex) {
      var element, propertyIndex, reducedWords, words, _i, _len;
      if (regex.test(lineText)) {
        words = lineText.split(' ');
        propertyIndex = 0;
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          element = words[_i];
          if (element.indexOf(term) !== -1) {
            break;
          }
          propertyIndex++;
        }
        reducedWords = words.slice(0, propertyIndex).join(' ');
        return reducedWords.length + 1;
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQ0FBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixrREFBckI7QUFBQSxJQUNBLGlCQUFBLEVBQW1CLG9FQURuQjtBQUFBLElBSUEsS0FBQSxFQUFPLEVBSlA7QUFNQTtBQUFBOzs7Ozs7Ozs7OztPQU5BO0FBQUEsSUFrQkEsY0FBQSxFQUFnQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ1osVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFBeUIsY0FBekIsQ0FBWCxDQUFBO0FBRUEsTUFBQSx3QkFBRyxRQUFRLENBQUUsZ0JBQVYsS0FBb0IsQ0FBcEIsSUFBeUIsQ0FBQSxJQUE1QjtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBS0EsYUFBTyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsY0FBdkIsRUFBdUMsUUFBdkMsQ0FBUCxDQU5ZO0lBQUEsQ0FsQmhCO0FBMEJBO0FBQUE7Ozs7T0ExQkE7QUFBQSxJQStCQSx5QkFBQSxFQUEyQixTQUFDLE1BQUQsRUFBUyxjQUFULEdBQUE7QUFFdkIsVUFBQSxpREFBQTtBQUFBLE1BQUEsWUFBQSxHQUFl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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/php-file-parser.coffee
