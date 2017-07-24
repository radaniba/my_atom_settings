(function() {
  var config, plugins, proxy;

  proxy = require("../services/php-proxy.coffee");

  config = require("../config.coffee");

  plugins = require("../services/plugin-manager.coffee");

  module.exports = {
    structureStartRegex: /(?:abstract class|class|trait|interface)\s+(\w+)/,
    useStatementRegex: /(?:use)(?:[^\w\\])([\w\\]+)(?![\w\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/,
    cache: [],
    isFunction: false,

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
      if (elements.length === 1) {
        this.isFunction = true;
      } else {
        this.isFunction = false;
      }
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
      if (!calledClass && !this.isFunction) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      if (this.isFunction) {
        methods = proxy.functions();
      } else {
        methods = proxy.methods(calledClass);
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQ0FBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixrREFBckI7QUFBQSxJQUNBLGlCQUFBLEVBQW1CLG9FQURuQjtBQUFBLElBSUEsS0FBQSxFQUFPLEVBSlA7QUFBQSxJQU9BLFVBQUEsRUFBWSxLQVBaO0FBU0E7QUFBQTs7Ozs7Ozs7Ozs7T0FUQTtBQUFBLElBcUJBLGNBQUEsRUFBZ0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWYsR0FBQTtBQUNaLFVBQUEsUUFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLEVBQXlCLGNBQXpCLENBQVgsQ0FBQTtBQUVBLE1BQUEsd0JBQUcsUUFBUSxDQUFFLGdCQUFWLEtBQW9CLENBQXBCLElBQXlCLENBQUEsSUFBNUI7QUFDSSxjQUFBLENBREo7T0FGQTtBQUtBLGFBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLEVBQXVCLGNBQXZCLEVBQXVDLFFBQXZDLENBQVAsQ0FOWTtJQUFBLENBckJoQjtBQTZCQTtBQUFBOzs7O09BN0JBO0FBQUEsSUFrQ0EseUJBQUEsRUFBMkIsU0FBQyxNQUFELEVBQVMsY0FBVCxHQUFBO0FBRXZCLFVBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/php-file-parser.coffee
