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
      var classNameParts, definitionPattern, found, fullClass, i, importNameParts, isAliasedImport, j, len, line, lines, matches, methodsRequest, namespacePattern, text, usePattern;
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
      for (i = j = 0, len = lines.length; j < len; i = ++j) {
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
      var bestScore, bestUse, doNewLine, i, j, line, lineCount, lineEnding, lineToInsertAt, matches, placeBelow, ref, scopeDescriptor, score, textToInsert;
      if (className.split('\\').length === 1 || className.indexOf('\\') === 0) {
        return null;
      }
      bestUse = 0;
      bestScore = 0;
      placeBelow = true;
      doNewLine = true;
      lineCount = editor.getLineCount();
      for (i = j = 0, ref = lineCount - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
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
      var firstClassNameParts, i, j, maxLength, ref, secondClassNameParts, totalScore;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      maxLength = 0;
      if (firstClassNameParts.length > secondClassNameParts.length) {
        maxLength = secondClassNameParts.length;
      } else {
        maxLength = firstClassNameParts.length;
      }
      totalScore = 0;
      for (i = j = 0, ref = maxLength - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
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
          regexFunction = new RegExp("function(?:[\\s]+([_a-zA-Z]+))?[\\s]*[\\(](?:(?![a-zA-Z\\_\\\\]*[\\s]*\\" + element + ").)*[,\\s]?([a-zA-Z\\_\\\\]*)[\\s]*\\" + element + "[a-zA-Z0-9\\s\\$\\\\,=\\\"\\\'\(\)]*[\\s]*[\\)]", "g");
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
      var j, len, methods, ref, val, value;
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
      if (!((ref = methods.values) != null ? ref.hasOwnProperty(term) : void 0)) {
        return;
      }
      value = methods.values[term];
      if (value instanceof Array) {
        for (j = 0, len = value.length; j < len; j++) {
          val = value[j];
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
      var className, element, found, j, k, len, len1, loop_index, methods, plugin, ref;
      loop_index = 0;
      className = null;
      if (elements == null) {
        return;
      }
      for (j = 0, len = elements.length; j < len; j++) {
        element = elements[j];
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
        ref = plugins.plugins;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          plugin = ref[k];
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
      var extendsIndex, j, len, line, lines, text, words;
      text = editor.getText();
      lines = text.split('\n');
      for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
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
      var j, len, lineText, lines, result, row, text;
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
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
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
      var element, j, len, propertyIndex, reducedWords, words;
      if (regex.test(lineText)) {
        words = lineText.split(' ');
        propertyIndex = 0;
        for (j = 0, len = words.length; j < len; j++) {
          element = words[j];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVI7O0VBQ1IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFDVCxPQUFBLEdBQVUsT0FBQSxDQUFRLG1DQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxtQkFBQSxFQUFxQixrREFBckI7SUFDQSxpQkFBQSxFQUFtQixvRUFEbkI7SUFJQSxLQUFBLEVBQU8sRUFKUDtJQU9BLFVBQUEsRUFBWSxLQVBaOztBQVNBOzs7Ozs7Ozs7Ozs7SUFZQSxjQUFBLEVBQWdCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxjQUFmO0FBQ1osVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQUF5QixjQUF6QjtNQUVYLHdCQUFHLFFBQVEsQ0FBRSxnQkFBVixLQUFvQixDQUFwQixJQUF5QixDQUFDLElBQTdCO0FBQ0ksZUFESjs7QUFHQSxhQUFPLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQUF1QixjQUF2QixFQUF1QyxRQUF2QztJQU5LLENBckJoQjs7QUE2QkE7Ozs7O0lBS0EseUJBQUEsRUFBMkIsU0FBQyxNQUFELEVBQVMsY0FBVDtBQUV2QixVQUFBO01BQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQUFzQixjQUF0QjtNQUVmLGFBQUEsR0FBZ0I7TUFFaEIsSUFBRyxZQUFIO1FBQ0ksYUFBQSxHQUFnQixJQUFDLENBQUEsS0FBTSxDQUFBLGtCQUFBLEVBRDNCO09BQUEsTUFBQTtRQUlJLGFBQUEsR0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUpwQjs7TUFNQSxJ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S0FBVSxJQUFiO0FBQ0ksbUJBQU8sQ0FBQyxHQUFELEVBQU0sTUFBTixFQURYOztVQUVBLEdBQUE7QUFKSixTQVRKOztBQWNBLGFBQU87SUFmZSxDQXIyQjFCOztBQXMzQkE7Ozs7Ozs7O0lBUUEsZ0JBQUEsRUFBa0IsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixLQUFqQjtBQUNkLFVBQUE7TUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUFIO1FBQ0ksS0FBQSxHQUFRLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZjtRQUNSLGFBQUEsR0FBZ0I7QUFDaEIsYUFBQSx1Q0FBQTs7VUFDSSxJQUFHLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQUEsS0FBeUIsQ0FBQyxDQUE3QjtBQUNJLGtCQURKOztVQUVBLGFBQUE7QUFISjtRQUtFLFlBQUEsR0FBZSxLQUFLLENBQUMsS0FBTixDQUFZLENBQVosRUFBZSxhQUFmLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsR0FBbkM7QUFDZixlQUFPLFlBQVksQ0FBQyxNQUFiLEdBQXNCLEVBVG5DOztBQVVBLGFBQU87SUFYTyxDQTkzQmxCOztBQUxKIiwic291cmNlc0NvbnRlbnQiOlsicHJveHkgPSByZXF1aXJlIFwiLi4vc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZVwiXG5jb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnLmNvZmZlZVwiXG5wbHVnaW5zID0gcmVxdWlyZSBcIi4uL3NlcnZpY2VzL3BsdWdpbi1tYW5hZ2VyLmNvZmZlZVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBzdHJ1Y3R1cmVTdGFydFJlZ2V4OiAvKD86YWJzdHJhY3QgY2xhc3N8Y2xhc3N8dHJhaXR8aW50ZXJmYWNlKVxccysoXFx3KykvXG4gICAgdXNlU3RhdGVtZW50UmVnZXg6IC8oPzp1c2UpKD86W15cXHdcXFxcXSkoW1xcd1xcXFxdKykoPyFbXFx3XFxcXF0pKD86KD86WyBdK2FzWyBdKykoXFx3KykpPyg/OjspL1xuXG4gICAgIyBTaW1wbGUgY2FjaGUgdG8gYXZvaWQgZHVwbGljYXRlIGNvbXB1dGF0aW9uIGZvciBlYWNoIHByb3ZpZGVyc1xuICAgIGNhY2hlOiBbXVxuXG4gICAgIyBpcyBhIG1ldGhvZCBvciBhIHNpbXBsZSBmdW5jdGlvblxuICAgIGlzRnVuY3Rpb246IGZhbHNlXG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIHRoZSBjbGFzcyB0aGUgc3BlY2lmaWVkIHRlcm0gKG1ldGhvZCBvciBwcm9wZXJ0eSkgaXMgYmVpbmcgaW52b2tlZCBvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgIFRleHRFZGl0b3IgdG8gc2VhcmNoIGZvciBuYW1lc3BhY2Ugb2YgdGVybS5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgICB0ZXJtICAgICAgICAgICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtICB7UG9pbnR9ICAgICAgYnVmZmVyUG9zaXRpb24gVGhlIGN1cnNvciBsb2NhdGlvbiB0aGUgdGVybSBpcyBhdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKlxuICAgICAqIEBleGFtcGxlIEludm9raW5nIGl0IG9uIE15TWV0aG9kOjpmb28oKS0+YmFyKCkgd2lsbCBhc2sgd2hhdCBjbGFzcyAnYmFyJyBpcyBpbnZva2VkIG9uLCB3aGljaCB3aWxsIHdoYXRldmVyIHR5cGVcbiAgICAgKiAgICAgICAgICBmb28gcmV0dXJucy5cbiAgICAjIyNcbiAgICBnZXRDYWxsZWRDbGFzczogKGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgICAgIGZ1bGxDYWxsID0gQGdldFN0YWNrQ2xhc3NlcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIGZ1bGxDYWxsPy5sZW5ndGggPT0gMCBvciAhdGVybVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmV0dXJuIEBwYXJzZUVsZW1lbnRzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIGZ1bGxDYWxsKVxuXG4gICAgIyMjKlxuICAgICAqIEdldCBhbGwgdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSBjdXJyZW50IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtUZXh0RWR1dGlyfSBlZGl0b3IgICAgICAgICBBdG9tIHRleHQgZWRpdG9yXG4gICAgICogQHBhcmFtIHtSYW5nZX0gICAgICBidWZmZXJQb3NpdGlvbiBQb3NpdGlvbiBvZiB0aGUgY3VycmVudCBidWZmZXJcbiAgICAjIyNcbiAgICBnZXRBbGxWYXJpYWJsZXNJbkZ1bmN0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICAgICAgIyByZXR1cm4gaWYgbm90IEBpc0luRnVuY3Rpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgaXNJbkZ1bmN0aW9uID0gQGlzSW5GdW5jdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBudWxsXG5cbiAgICAgICAgaWYgaXNJbkZ1bmN0aW9uXG4gICAgICAgICAgICBzdGFydFBvc2l0aW9uID0gQGNhY2hlWydmdW5jdGlvblBvc2l0aW9uJ11cblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdGFydFBvc2l0aW9uID0gWzAsIDBdXG5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbc3RhcnRQb3NpdGlvbiwgW2J1ZmZlclBvc2l0aW9uLnJvdywgYnVmZmVyUG9zaXRpb24uY29sdW1uLTFdXSlcbiAgICAgICAgcmVnZXggPSAvKFxcJFthLXpBLVpfXSspL2dcblxuICAgICAgICBtYXRjaGVzID0gdGV4dC5tYXRjaChyZWdleClcbiAgICAgICAgcmV0dXJuIFtdIGlmIG5vdCBtYXRjaGVzP1xuXG4gICAgICAgIGlmIGlzSW5GdW5jdGlvblxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoIFwiJHRoaXNcIlxuXG4gICAgICAgIHJldHVybiBtYXRjaGVzXG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIHRoZSBmdWxsIGNsYXNzIG5hbWUuIElmIHRoZSBjbGFzcyBuYW1lIGlzIGEgRlFDTiAoRnVsbHkgUXVhbGlmaWVkIENsYXNzIE5hbWUpLCBpdCBhbHJlYWR5IGlzIGEgZnVsbFxuICAgICAqIG5hbWUgYW5kIGl0IGlzIHJldHVybmVkIGFzIGlzLiBPdGhlcndpc2UsIHRoZSBjdXJyZW50IG5hbWVzcGFjZSBhbmQgdXNlIHN0YXRlbWVudHMgYXJlIHNjYW5uZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICBlZGl0b3IgICAgVGV4dCBlZGl0b3IgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gY2xhc3NOYW1lIE5hbWUgb2YgdGhlIGNsYXNzIHRvIHJldHJpZXZlIHRoZSBmdWxsIG5hbWUgb2YuIElmIG51bGwsIHRoZSBjdXJyZW50IGNsYXNzIHdpbGxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgcmV0dXJuZWQgKGlmIGFueSkuXG4gICAgICogQHBhcmFtIHtib29sZWFufSAgICAgbm9DdXJyZW50IERvIG5vdCB1c2UgdGhlIGN1cnJlbnQgY2xhc3MgaWYgY2xhc3NOYW1lIGlzIGVtcHR5XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZ1xuICAgICMjI1xuICAgIGdldEZ1bGxDbGFzc05hbWU6IChlZGl0b3IsIGNsYXNzTmFtZSA9IG51bGwsIG5vQ3VycmVudCA9IGZhbHNlKSAtPlxuICAgICAgICBpZiBjbGFzc05hbWUgPT0gbnVsbFxuICAgICAgICAgICAgY2xhc3NOYW1lID0gJydcblxuICAgICAgICAgICAgaWYgbm9DdXJyZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBpZiBjbGFzc05hbWUgYW5kIGNsYXNzTmFtZVswXSA9PSBcIlxcXFxcIlxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzTmFtZS5zdWJzdHIoMSkgIyBGUUNOLCBub3Qgc3ViamVjdCB0byBhbnkgZnVydGhlciBjb250ZXh0LlxuXG4gICAgICAgIHVzZVBhdHRlcm4gPSAvKD86dXNlKSg/OlteXFx3XFxcXFxcXFxdKShbXFx3XFxcXFxcXFxdKykoPyFbXFx3XFxcXFxcXFxdKSg/Oig/OlsgXSthc1sgXSspKFxcdyspKT8oPzo7KS9cbiAgICAgICAgbmFtZXNwYWNlUGF0dGVybiA9IC8oPzpuYW1lc3BhY2UpKD86W15cXHdcXFxcXFxcXF0pKFtcXHdcXFxcXFxcXF0rKSg/IVtcXHdcXFxcXFxcXF0pKD86OykvXG4gICAgICAgIGRlZmluaXRpb25QYXR0ZXJuID0gLyg/OmFic3RyYWN0IGNsYXNzfGNsYXNzfHRyYWl0fGludGVyZmFjZSlcXHMrKFxcdyspL1xuXG4gICAgICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICBmdWxsQ2xhc3MgPSBjbGFzc05hbWVcblxuICAgICAgICBmb3VuZCA9IGZhbHNlXG5cbiAgICAgICAgZm9yIGxpbmUsaSBpbiBsaW5lc1xuICAgICAgICAgICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2gobmFtZXNwYWNlUGF0dGVybilcblxuICAgICAgICAgICAgaWYgbWF0Y2hlc1xuICAgICAgICAgICAgICAgIGZ1bGxDbGFzcyA9IG1hdGNoZXNbMV0gKyAnXFxcXCcgKyBjbGFzc05hbWVcblxuICAgICAgICAgICAgZWxzZSBpZiBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gbGluZS5tYXRjaCh1c2VQYXR0ZXJuKVxuICAgICAgICAgICAgICAgIGlmIG1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lUGFydHMgPSBjbGFzc05hbWUuc3BsaXQoJ1xcXFwnKVxuICAgICAgICAgICAgICAgICAgICBpbXBvcnROYW1lUGFydHMgPSBtYXRjaGVzWzFdLnNwbGl0KCdcXFxcJylcblxuICAgICAgICAgICAgICAgICAgICBpc0FsaWFzZWRJbXBvcnQgPSBpZiBtYXRjaGVzWzJdIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgY2xhc3NOYW1lID09IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxDbGFzcyA9IGNsYXNzTmFtZSAjIEFscmVhZHkgYSBjb21wbGV0ZSBuYW1lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBbGlhc2VkSW1wb3J0IGFuZCBtYXRjaGVzWzJdID09IGNsYXNzTmFtZVBhcnRzWzBdKSBvciAoIWlzQWxpYXNlZEltcG9ydCBhbmQgaW1wb3J0TmFtZVBhcnRzW2ltcG9ydE5hbWVQYXJ0cy5sZW5ndGggLSAxXSA9PSBjbGFzc05hbWVQYXJ0c1swXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsQ2xhc3MgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVQYXJ0cyA9IGNsYXNzTmFtZVBhcnRzWzEgLi4gY2xhc3NOYW1lUGFydHMubGVuZ3RoXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3NOYW1lUGFydHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsQ2xhc3MgKz0gJ1xcXFwnICsgY2xhc3NOYW1lUGFydHMuam9pbignXFxcXCcpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIG1hdGNoZXMgPSBsaW5lLm1hdGNoKGRlZmluaXRpb25QYXR0ZXJuKVxuXG4gICAgICAgICAgICBpZiBtYXRjaGVzXG4gICAgICAgICAgICAgICAgaWYgbm90IGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZnVsbENsYXNzICs9IG1hdGNoZXNbMV1cblxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgIyBJbiB0aGUgY2xhc3MgbWFwLCBjbGFzc2VzIG5ldmVyIGhhdmUgYSBsZWFkaW5nIHNsYXNoLiBUaGUgbGVhZGluZyBzbGFzaCBvbmx5IGluZGljYXRlcyB0aGF0IGltcG9ydCBydWxlcyBvZlxuICAgICAgICAjIHRoZSBmaWxlIGRvbid0IGFwcGx5LCBidXQgaXQncyB1c2VsZXNzIGFmdGVyIHRoYXQuXG4gICAgICAgIGlmIGZ1bGxDbGFzcyBhbmQgZnVsbENsYXNzWzBdID09ICdcXFxcJ1xuICAgICAgICAgICAgZnVsbENsYXNzID0gZnVsbENsYXNzLnN1YnN0cigxKVxuXG4gICAgICAgIGlmIG5vdCBmb3VuZFxuICAgICAgICAgICAgIyBBdCB0aGlzIHBvaW50LCB0aGlzIGNvdWxkIGVpdGhlciBiZSBhIGNsYXNzIG5hbWUgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgbmFtZXNwYWNlIG9yIGEgZnVsbCBjbGFzcyBuYW1lXG4gICAgICAgICAgICAjIHdpdGhvdXQgYSBsZWFkaW5nIHNsYXNoLiBGb3IgZXhhbXBsZSwgRm9vXFxCYXIgY291bGQgYWxzbyBiZSByZWxhdGl2ZSAoZS5nLiBNeVxcRm9vXFxCYXIpLCBpbiB3aGljaCBjYXNlIGl0c1xuICAgICAgICAgICAgIyBhYnNvbHV0ZSBwYXRoIGlzIGRldGVybWluZWQgYnkgdGhlIG5hbWVzcGFjZSBhbmQgdXNlIHN0YXRlbWVudHMgb2YgdGhlIGZpbGUgY29udGFpbmluZyBpdC5cbiAgICAgICAgICAgIG1ldGhvZHNSZXF1ZXN0ID0gcHJveHkubWV0aG9kcyhmdWxsQ2xhc3MpXG5cbiAgICAgICAgICAgIGlmIG5vdCBtZXRob2RzUmVxdWVzdD8uZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAjIFRoZSBjbGFzcywgZS5nLiBNeVxcRm9vXFxCYXIsIGRpZG4ndCBleGlzdC4gV2UgY2FuIG9ubHkgYXNzdW1lIGl0cyBhbiBhYnNvbHV0ZSBwYXRoLCB1c2luZyBhIG5hbWVzcGFjZVxuICAgICAgICAgICAgICAgICMgc2V0IHVwIGluIGNvbXBvc2VyLmpzb24sIHdpdGhvdXQgYSBsZWFkaW5nIHNsYXNoLlxuICAgICAgICAgICAgICAgIGZ1bGxDbGFzcyA9IGNsYXNzTmFtZVxuXG4gICAgICAgIHJldHVybiBmdWxsQ2xhc3NcblxuICAgICMjIypcbiAgICAgKiBBZGQgdGhlIHVzZSBmb3IgdGhlIGdpdmVuIGNsYXNzIGlmIG5vdCBhbHJlYWR5IGFkZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICAgICAgICAgICBBdG9tIHRleHQgZWRpdG9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgY2xhc3NOYW1lICAgICAgICAgICAgICAgTmFtZSBvZiB0aGUgY2xhc3MgdG8gYWRkLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgYWxsb3dBZGRpdGlvbmFsTmV3bGluZXMgV2hldGhlciB0byBhbGxvdyBhZGRpbmcgYWRkaXRpb25hbCBuZXdsaW5lcyB0byBhdHRlbXB0IHRvIGdyb3VwIHVzZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2ludH0gICAgICAgVGhlIGFtb3VudCBvZiBsaW5lcyBhZGRlZCAoaW5jbHVkaW5nIG5ld2xpbmVzKSwgc28geW91IGNhbiByZWxpYWJseSBhbmQgZWFzaWx5IG9mZnNldCB5b3VyXG4gICAgICogICAgICAgICAgICAgICAgICAgICByb3dzLiBUaGlzIGNvdWxkIGJlIHplcm8gaWYgYSB1c2Ugc3RhdGVtZW50IHdhcyBhbHJlYWR5IHByZXNlbnQuXG4gICAgIyMjXG4gICAgYWRkVXNlQ2xhc3M6IChlZGl0b3IsIGNsYXNzTmFtZSwgYWxsb3dBZGRpdGlvbmFsTmV3bGluZXMpIC0+XG4gICAgICAgIGlmIGNsYXNzTmFtZS5zcGxpdCgnXFxcXCcpLmxlbmd0aCA9PSAxIG9yIGNsYXNzTmFtZS5pbmRleE9mKCdcXFxcJykgPT0gMFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBiZXN0VXNlID0gMFxuICAgICAgICBiZXN0U2NvcmUgPSAwXG4gICAgICAgIHBsYWNlQmVsb3cgPSB0cnVlXG4gICAgICAgIGRvTmV3TGluZSA9IHRydWVcbiAgICAgICAgbGluZUNvdW50ID0gZWRpdG9yLmdldExpbmVDb3VudCgpXG5cbiAgICAgICAgIyBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIHVzZSBzdGF0ZW1lbnQuXG4gICAgICAgIGZvciBpIGluIFswIC4uIGxpbmVDb3VudCAtIDFdXG4gICAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGkpLnRyaW0oKVxuXG4gICAgICAgICAgICBpZiBsaW5lLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtpLCBsaW5lLmxlbmd0aF0pLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgICAgICAgICBpZiBzY29wZURlc2NyaXB0b3IuaW5kZXhPZignLmNvbW1lbnQnKSA+PSAwXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgbGluZS5tYXRjaChAc3RydWN0dXJlU3RhcnRSZWdleClcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBsaW5lLmluZGV4T2YoJ25hbWVzcGFjZSAnKSA+PSAwXG4gICAgICAgICAgICAgICAgYmVzdFVzZSA9IGlcblxuICAgICAgICAgICAgbWF0Y2hlcyA9IEB1c2VTdGF0ZW1lbnRSZWdleC5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgIGlmIG1hdGNoZXM/IGFuZCBtYXRjaGVzWzFdP1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoZXNbMV0gPT0gY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG5cbiAgICAgICAgICAgICAgICBzY29yZSA9IEBzY29yZUNsYXNzTmFtZShjbGFzc05hbWUsIG1hdGNoZXNbMV0pXG5cbiAgICAgICAgICAgICAgICBpZiBzY29yZSA+PSBiZXN0U2NvcmVcbiAgICAgICAgICAgICAgICAgICAgYmVzdFVzZSA9IGlcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmVcblxuICAgICAgICAgICAgICAgICAgICBpZiBAZG9TaGFyZUNvbW1vbk5hbWVzcGFjZVByZWZpeChjbGFzc05hbWUsIG1hdGNoZXNbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBkb05ld0xpbmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VCZWxvdyA9IGlmIGNsYXNzTmFtZS5sZW5ndGggPj0gbWF0Y2hlc1sxXS5sZW5ndGggdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkb05ld0xpbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUJlbG93ID0gdHJ1ZVxuXG4gICAgICAgICMgSW5zZXJ0IHRoZSB1c2Ugc3RhdGVtZW50IGl0c2VsZi5cbiAgICAgICAgbGluZUVuZGluZyA9IGVkaXRvci5nZXRCdWZmZXIoKS5saW5lRW5kaW5nRm9yUm93KDApXG5cbiAgICAgICAgaWYgbm90IGFsbG93QWRkaXRpb25hbE5ld2xpbmVzXG4gICAgICAgICAgICBkb05ld0xpbmUgPSBmYWxzZVxuXG4gICAgICAgIGlmIG5vdCBsaW5lRW5kaW5nXG4gICAgICAgICAgICBsaW5lRW5kaW5nID0gXCJcXG5cIlxuXG4gICAgICAgIHRleHRUb0luc2VydCA9ICcnXG5cbiAgICAgICAgaWYgZG9OZXdMaW5lIGFuZCBwbGFjZUJlbG93XG4gICAgICAgICAgICB0ZXh0VG9JbnNlcnQgKz0gbGluZUVuZGluZ1xuXG4gICAgICAgIHRleHRUb0luc2VydCArPSBcInVzZSAje2NsYXNzTmFtZX07XCIgKyBsaW5lRW5kaW5nXG5cbiAgICAgICAgaWYgZG9OZXdMaW5lIGFuZCBub3QgcGxhY2VCZWxvd1xuICAgICAgICAgICAgdGV4dFRvSW5zZXJ0ICs9IGxpbmVFbmRpbmdcblxuICAgICAgICBsaW5lVG9JbnNlcnRBdCA9IGJlc3RVc2UgKyAoaWYgcGxhY2VCZWxvdyB0aGVuIDEgZWxzZSAwKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tsaW5lVG9JbnNlcnRBdCwgMF0sIFtsaW5lVG9JbnNlcnRBdCwgMF1dLCB0ZXh0VG9JbnNlcnQpXG5cbiAgICAgICAgcmV0dXJuICgxICsgKGlmIGRvTmV3TGluZSB0aGVuIDEgZWxzZSAwKSlcblxuICAgICMjIypcbiAgICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBzcGVjaWZpZWQgY2xhc3MgbmFtZXMgc2hhcmUgYSBjb21tb24gbmFtZXNwYWNlIHByZWZpeC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaXJzdENsYXNzTmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWNvbmRDbGFzc05hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgIyMjXG4gICAgZG9TaGFyZUNvbW1vbk5hbWVzcGFjZVByZWZpeDogKGZpcnN0Q2xhc3NOYW1lLCBzZWNvbmRDbGFzc05hbWUpIC0+XG4gICAgICAgIGZpcnN0Q2xhc3NOYW1lUGFydHMgPSBmaXJzdENsYXNzTmFtZS5zcGxpdCgnXFxcXCcpXG4gICAgICAgIHNlY29uZENsYXNzTmFtZVBhcnRzID0gc2Vjb25kQ2xhc3NOYW1lLnNwbGl0KCdcXFxcJylcblxuICAgICAgICBmaXJzdENsYXNzTmFtZVBhcnRzLnBvcCgpXG4gICAgICAgIHNlY29uZENsYXNzTmFtZVBhcnRzLnBvcCgpXG5cbiAgICAgICAgcmV0dXJuIGlmIGZpcnN0Q2xhc3NOYW1lUGFydHMuam9pbignXFxcXCcpID09IHNlY29uZENsYXNzTmFtZVBhcnRzLmpvaW4oJ1xcXFwnKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG5cbiAgICAjIyMqXG4gICAgICogU2NvcmVzIHRoZSBmaXJzdCBjbGFzcyBuYW1lIGFnYWluc3QgdGhlIHNlY29uZCwgaW5kaWNhdGluZyBob3cgbXVjaCB0aGV5ICdtYXRjaCcgZWFjaCBvdGhlci4gVGhpcyBjYW4gYmUgdXNlZFxuICAgICAqIHRvIGUuZy4gZmluZCBhbiBhcHByb3ByaWF0ZSBsb2NhdGlvbiB0byBwbGFjZSBhIGNsYXNzIGluIGFuIGV4aXN0aW5nIGxpc3Qgb2YgY2xhc3Nlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaXJzdENsYXNzTmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWNvbmRDbGFzc05hbWVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Zsb2F0fVxuICAgICMjI1xuICAgIHNjb3JlQ2xhc3NOYW1lOiAoZmlyc3RDbGFzc05hbWUsIHNlY29uZENsYXNzTmFtZSkgLT5cbiAgICAgICAgZmlyc3RDbGFzc05hbWVQYXJ0cyA9IGZpcnN0Q2xhc3NOYW1lLnNwbGl0KCdcXFxcJylcbiAgICAgICAgc2Vjb25kQ2xhc3NOYW1lUGFydHMgPSBzZWNvbmRDbGFzc05hbWUuc3BsaXQoJ1xcXFwnKVxuXG4gICAgICAgIG1heExlbmd0aCA9IDBcblxuICAgICAgICBpZiBmaXJzdENsYXNzTmFtZVBhcnRzLmxlbmd0aCA+IHNlY29uZENsYXNzTmFtZVBhcnRzLmxlbmd0aFxuICAgICAgICAgICAgbWF4TGVuZ3RoID0gc2Vjb25kQ2xhc3NOYW1lUGFydHMubGVuZ3RoXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWF4TGVuZ3RoID0gZmlyc3RDbGFzc05hbWVQYXJ0cy5sZW5ndGhcblxuICAgICAgICB0b3RhbFNjb3JlID0gMFxuXG4gICAgICAgICMgTk9URTogV2UgZG9uJ3Qgc2NvcmUgdGhlIGxhc3QgcGFydC5cbiAgICAgICAgZm9yIGkgaW4gWzAgLi4gbWF4TGVuZ3RoIC0gMl1cbiAgICAgICAgICAgIGlmIGZpcnN0Q2xhc3NOYW1lUGFydHNbaV0gPT0gc2Vjb25kQ2xhc3NOYW1lUGFydHNbaV1cbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlICs9IDJcblxuICAgICAgICBpZiBAZG9TaGFyZUNvbW1vbk5hbWVzcGFjZVByZWZpeChmaXJzdENsYXNzTmFtZSwgc2Vjb25kQ2xhc3NOYW1lKVxuICAgICAgICAgICAgaWYgZmlyc3RDbGFzc05hbWUubGVuZ3RoID09IHNlY29uZENsYXNzTmFtZS5sZW5ndGhcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlICs9IDJcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3RpY2sgY2xvc2VyIHRvIGl0ZW1zIHRoYXQgYXJlIHNtYWxsZXIgaW4gbGVuZ3RoIHRoYW4gaXRlbXMgdGhhdCBhcmUgbGFyZ2VyIGluIGxlbmd0aC5cbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlIC09IDAuMDAxICogTWF0aC5hYnMoc2Vjb25kQ2xhc3NOYW1lLmxlbmd0aCAtIGZpcnN0Q2xhc3NOYW1lLmxlbmd0aClcblxuICAgICAgICByZXR1cm4gdG90YWxTY29yZVxuXG4gICAgIyMjKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gbmFtZSBpcyBhIGNsYXNzIG9yIG5vdFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gIG5hbWUgTmFtZSB0byBjaGVja1xuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgIyMjXG4gICAgaXNDbGFzczogKG5hbWUpIC0+XG4gICAgICAgIHJldHVybiBuYW1lLnN1YnN0cigwLDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKSA9PSBuYW1lXG5cbiAgICAjIyMqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGJ1ZmZlciBpcyBpbiBhIGZ1bmN0b24gb3Igbm90XG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBBdG9tIHRleHQgZWRpdG9yXG4gICAgICogQHBhcmFtIHtSYW5nZX0gICAgICBidWZmZXJQb3NpdGlvbiBQb3NpdGlvbiBvZiB0aGUgY3VycmVudCBidWZmZXJcbiAgICAgKiBAcmV0dXJuIGJvb2xcbiAgICAjIyNcbiAgICBpc0luRnVuY3Rpb246IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcblxuICAgICAgICAjIElmIGxhc3QgcmVxdWVzdCB3YXMgdGhlIHNhbWVcbiAgICAgICAgaWYgQGNhY2hlW3RleHRdP1xuICAgICAgICAgIHJldHVybiBAY2FjaGVbdGV4dF1cblxuICAgICAgICAjIFJlaW5pdGlhbGl6ZSBjdXJyZW50IGNhY2hlXG4gICAgICAgIEBjYWNoZSA9IFtdXG5cbiAgICAgICAgcm93ID0gYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgIHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuXG4gICAgICAgIG9wZW5lZEJsb2NrcyA9IDBcbiAgICAgICAgY2xvc2VkQmxvY2tzID0gMFxuXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlXG5cbiAgICAgICAgIyBmb3IgZWFjaCByb3dcbiAgICAgICAgd2hpbGUgcm93ICE9IC0xXG4gICAgICAgICAgICBsaW5lID0gcm93c1tyb3ddXG5cbiAgICAgICAgICAgICMgaXNzdWUgIzYxXG4gICAgICAgICAgICBpZiBub3QgbGluZVxuICAgICAgICAgICAgICAgIHJvdy0tXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgY2hhcmFjdGVyID0gMFxuICAgICAgICAgICAgbGluZUxlbmd0aCA9IGxpbmUubGVuZ3RoXG4gICAgICAgICAgICBsYXN0Q2hhaW4gPSBudWxsXG5cbiAgICAgICAgICAgICMgU2NhbiB0aGUgZW50aXJlIGxpbmUsIGZldGNoaW5nIHRoZSBzY29wZSBmb3IgZWFjaCBjaGFyYWN0ZXIgcG9zaXRpb24gYXMgb25lIGxpbmUgY2FuIGNvbnRhaW4gYm90aCBhIHNjb3BlIHN0YXJ0XG4gICAgICAgICAgICAjIGFuZCBlbmQgc3VjaCBhcyBcIn0gZWxzZWlmICh0cnVlKSB7XCIuIEhlcmUgdGhlIHNjb3BlIGRlc2NyaXB0b3Igd2lsbCBkaWZmZXIgZm9yIGRpZmZlcmVudCBjaGFyYWN0ZXIgcG9zaXRpb25zIG9uXG4gICAgICAgICAgICAjIHRoZSBsaW5lLlxuICAgICAgICAgICAgd2hpbGUgY2hhcmFjdGVyIDw9IGxpbmUubGVuZ3RoXG4gICAgICAgICAgICAgICAgIyBHZXQgY2hhaW4gb2YgYWxsIHNjb3Blc1xuICAgICAgICAgICAgICAgIGNoYWluID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIGNoYXJhY3Rlcl0pLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgICAgICAgICAgICAgIyBOT1RFOiBBdG9tIHF1aXJrOiBib3RoIGxpbmUubGVuZ3RoIGFuZCBsaW5lLmxlbmd0aCAtIDEgcmV0dXJuIHRoZSBzYW1lIHNjb3BlIGRlc2NyaXB0b3IsIEJVVCB5b3UgY2FuJ3Qgc2tpcFxuICAgICAgICAgICAgICAgICMgc2Nhbm5pbmcgbGluZS5sZW5ndGggYXMgc29tZXRpbWVzIGxpbmUubGVuZ3RoIC0gMSBkb2VzIG5vdCByZXR1cm4gYSBzY29wZSBkZXNjcmlwdG9yIGF0IGFsbC5cbiAgICAgICAgICAgICAgICBpZiBub3QgKGNoYXJhY3RlciA9PSBsaW5lLmxlbmd0aCBhbmQgY2hhaW4gPT0gbGFzdENoYWluKVxuICAgICAgICAgICAgICAgICAgICAjIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgY2hhaW4uaW5kZXhPZihcInNjb3BlLmVuZFwiKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VkQmxvY2tzKytcbiAgICAgICAgICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgY2hhaW4uaW5kZXhPZihcInNjb3BlLmJlZ2luXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuZWRCbG9ja3MrK1xuXG4gICAgICAgICAgICAgICAgbGFzdENoYWluID0gY2hhaW5cbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIrK1xuXG4gICAgICAgICAgICAjIEdldCBjaGFpbiBvZiBhbGwgc2NvcGVzXG4gICAgICAgICAgICBjaGFpbiA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbcm93LCBsaW5lLmxlbmd0aF0pLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgICAgICAgICAjIGZ1bmN0aW9uXG4gICAgICAgICAgICBpZiBjaGFpbi5pbmRleE9mKFwiZnVuY3Rpb25cIikgIT0gLTFcbiAgICAgICAgICAgICAgICAjIElmIG1vcmUgb3BlbmVkYmxvY2tzIHRoYW4gY2xvc2VkYmxvY2tzLCB3ZSBhcmUgaW4gYSBmdW5jdGlvbi4gT3RoZXJ3aXNlLCBjb3VsZCBiZSBhIGNsb3N1cmUsIGNvbnRpbnVlIGxvb2tpbmcuXG4gICAgICAgICAgICAgICAgaWYgb3BlbmVkQmxvY2tzID4gY2xvc2VkQmxvY2tzXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgQGNhY2hlW1wiZnVuY3Rpb25Qb3NpdGlvblwiXSA9IFtyb3csIDBdXG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgcm93LS1cblxuICAgICAgICBAY2FjaGVbdGV4dF0gPSByZXN1bHRcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICAqIFJldHJpZXZlcyB0aGUgc3RhY2sgb2YgZWxlbWVudHMgaW4gYSBzdGFjayBvZiBjYWxscyBzdWNoIGFzIFwic2VsZjo6eHh4LT54eHh4XCIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0gIHtQb2ludH0gICAgICAgcG9zaXRpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAjIyNcbiAgICBnZXRTdGFja0NsYXNzZXM6IChlZGl0b3IsIHBvc2l0aW9uKSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIHBvc2l0aW9uP1xuXG4gICAgICAgIGxpbmUgPSBwb3NpdGlvbi5yb3dcblxuICAgICAgICBmaW5pc2hlZCA9IGZhbHNlXG4gICAgICAgIHBhcmVudGhlc2VzT3BlbmVkID0gMFxuICAgICAgICBwYXJlbnRoZXNlc0Nsb3NlZCA9IDBcbiAgICAgICAgc3F1aWdnbGVCcmFja2V0c09wZW5lZCA9IDBcbiAgICAgICAgc3F1aWdnbGVCcmFja2V0c0Nsb3NlZCA9IDBcblxuICAgICAgICB3aGlsZSBsaW5lID4gMFxuICAgICAgICAgICAgbGluZVRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZSlcbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgbGluZVRleHRcblxuICAgICAgICAgICAgaWYgbGluZSAhPSBwb3NpdGlvbi5yb3dcbiAgICAgICAgICAgICAgICBpID0gKGxpbmVUZXh0Lmxlbmd0aCAtIDEpXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpID0gcG9zaXRpb24uY29sdW1uIC0gMVxuXG4gICAgICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgICAgICBpZiBsaW5lVGV4dFtpXSA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgKytwYXJlbnRoZXNlc09wZW5lZFxuXG4gICAgICAgICAgICAgICAgICAgICMgVGlja2V0ICMxNjQgLSBXZSdyZSB3YWxraW5nIGJhY2t3YXJkcywgaWYgd2UgZmluZCBhbiBvcGVuaW5nIHBhcmFudGhlc2lzIHRoYXQgaGFzbid0IGJlZW4gY2xvc2VkXG4gICAgICAgICAgICAgICAgICAgICMgYW55d2hlcmUsIHdlIGtub3cgd2UgbXVzdCBzdG9wLlxuICAgICAgICAgICAgICAgICAgICBpZiBwYXJlbnRoZXNlc09wZW5lZCA+IHBhcmVudGhlc2VzQ2xvc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICArK2lcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZVRleHRbaV0gPT0gJyknXG4gICAgICAgICAgICAgICAgICAgICsrcGFyZW50aGVzZXNDbG9zZWRcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZVRleHRbaV0gPT0gJ3snXG4gICAgICAgICAgICAgICAgICAgICsrc3F1aWdnbGVCcmFja2V0c09wZW5lZFxuXG4gICAgICAgICAgICAgICAgICAgICMgU2FtZSBhcyBhYm92ZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgc3F1aWdnbGVCcmFja2V0c09wZW5lZCA+IHNxdWlnZ2xlQnJhY2tldHNDbG9zZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lVGV4dFtpXSA9PSAnfSdcbiAgICAgICAgICAgICAgICAgICAgKytzcXVpZ2dsZUJyYWNrZXRzQ2xvc2VkXG5cbiAgICAgICAgICAgICAgICAjIFRoZXNlIHdpbGwgbm90IGJlIHRoZSBzYW1lIGlmLCBmb3IgZXhhbXBsZSwgd2UndmUgZW50ZXJlZCBhIGNsb3N1cmUuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRoZXNlc09wZW5lZCA9PSBwYXJlbnRoZXNlc0Nsb3NlZCBhbmQgc3F1aWdnbGVCcmFja2V0c09wZW5lZCA9PSBzcXVpZ2dsZUJyYWNrZXRzQ2xvc2VkXG4gICAgICAgICAgICAgICAgICAgICMgVmFyaWFibGUgZGVmaW5pdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZVRleHRbaV0gPT0gJyQnXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lVGV4dFtpXSA9PSAnOycgb3IgbGluZVRleHRbaV0gPT0gJz0nXG4gICAgICAgICAgICAgICAgICAgICAgICArK2lcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2xpbmUsIGldKS5nZXRTY29wZUNoYWluKClcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBMYW5ndWFnZSBjb25zdHJ1Y3RzLCBzdWNoIGFzIGVjaG8gYW5kIHByaW50LCBkb24ndCByZXF1aXJlIHBhcmFudGhlc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NvcGVEZXNjcmlwdG9yLmluZGV4T2YoJy5mdW5jdGlvbi5jb25zdHJ1Y3QnKSA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgLS1pXG5cbiAgICAgICAgICAgIGlmIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgLS1saW5lXG5cbiAgICAgICAgIyBGZXRjaCBldmVyeXRoaW5nIHdlIHJhbiB0aHJvdWdoIHVwIHVudGlsIHRoZSBsb2NhdGlvbiB3ZSBzdGFydGVkIGZyb20uXG4gICAgICAgIHRleHRTbGljZSA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW2xpbmUsIGldLCBwb3NpdGlvbl0pLnRyaW0oKVxuXG4gICAgICAgIHJldHVybiBAcGFyc2VTdGFja0NsYXNzKHRleHRTbGljZSlcblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIGNvbnRlbnQgaW5zaWRlIHBhcmFudGhlc2VzIChpbmNsdWRpbmcgbmVzdGVkIHBhcmFudGhlc2VzKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gIHRleHQgU3RyaW5nIHRvIGFuYWx5emUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBrZWVwIHN0cmluZyBpbnNpZGUgcGFyZW50aGVzaXNcbiAgICAgKiBAcmV0dXJuIFN0cmluZ1xuICAgICMjI1xuICAgIHN0cmlwUGFyYW50aGVzZXNDb250ZW50OiAodGV4dCwga2VlcFN0cmluZykgLT5cbiAgICAgICAgaSA9IDBcbiAgICAgICAgb3BlbkNvdW50ID0gMFxuICAgICAgICBjbG9zZUNvdW50ID0gMFxuICAgICAgICBzdGFydEluZGV4ID0gLTFcblxuICAgICAgICB3aGlsZSBpIDwgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIHRleHRbaV0gPT0gJygnXG4gICAgICAgICAgICAgICAgKytvcGVuQ291bnRcblxuICAgICAgICAgICAgICAgIGlmIG9wZW5Db3VudCA9PSAxXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBpXG5cbiAgICAgICAgICAgIGVsc2UgaWYgdGV4dFtpXSA9PSAnKSdcbiAgICAgICAgICAgICAgICArK2Nsb3NlQ291bnRcblxuICAgICAgICAgICAgICAgIGlmIGNsb3NlQ291bnQgPT0gb3BlbkNvdW50XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsTGVuZ3RoID0gdGV4dC5sZW5ndGhcblxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgaSsxKVxuICAgICAgICAgICAgICAgICAgICByZWcgPSAvW1wiKF1bXFxzXSpbXFwnXFxcIl1bXFxzXSooW15cXFwiXFwnXSspW1xcc10qW1xcXCJcXCddW1xcc10qW1wiKV0vZ1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIG9wZW5Db3VudCA9PSAxIGFuZCByZWcuZXhlYyhjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHIoMCwgc3RhcnRJbmRleCArIDEpICsgdGV4dC5zdWJzdHIoaSwgdGV4dC5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGkgLT0gKG9yaWdpbmFsTGVuZ3RoIC0gdGV4dC5sZW5ndGgpXG5cbiAgICAgICAgICAgICAgICAgICAgb3BlbkNvdW50ID0gMFxuICAgICAgICAgICAgICAgICAgICBjbG9zZUNvdW50ID0gMFxuXG4gICAgICAgICAgICArK2lcblxuICAgICAgICByZXR1cm4gdGV4dFxuXG4gICAgIyMjKlxuICAgICAqIFBhcnNlIHN0YWNrIGNsYXNzIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgU3RyaW5nIG9mIHRoZSBzdGFjayBjbGFzc1xuICAgICAqIEByZXR1cm4gQXJyYXlcbiAgICAjIyNcbiAgICBwYXJzZVN0YWNrQ2xhc3M6ICh0ZXh0KSAtPlxuICAgICAgICAjIFJlbW92ZSBzaW5nZSBsaW5lIGNvbW1lbnRzXG4gICAgICAgIHJlZ3ggPSAvXFwvXFwvLipcXG4vZ1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlIHJlZ3gsIChtYXRjaCkgPT5cbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgICMgUmVtb3ZlIG11bHRpIGxpbmUgY29tbWVudHNcbiAgICAgICAgcmVneCA9IC9cXC9cXCpbXihcXCpcXC8pXSpcXCpcXC8vZ1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlIHJlZ3gsIChtYXRjaCkgPT5cbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgICMgUmVtb3ZlIGNvbnRlbnQgaW5zaWRlIHBhcmFudGhlc2VzIChpbmNsdWRpbmcgbmVzdGVkIHBhcmFudGhlc2VzKS5cbiAgICAgICAgdGV4dCA9IEBzdHJpcFBhcmFudGhlc2VzQ29udGVudCh0ZXh0LCB0cnVlKVxuXG4gICAgICAgICMgR2V0IHRoZSBmdWxsIHRleHRcbiAgICAgICAgcmV0dXJuIFtdIGlmIG5vdCB0ZXh0XG5cbiAgICAgICAgZWxlbWVudHMgPSB0ZXh0LnNwbGl0KC8oPzpcXC1cXD58OjopLylcbiAgICAgICAgIyBlbGVtZW50cyA9IHRleHQuc3BsaXQoXCItPlwiKVxuXG4gICAgICAgIGlmIGVsZW1lbnRzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgQGlzRnVuY3Rpb24gPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaXNGdW5jdGlvbiA9IGZhbHNlXG5cbiAgICAgICAgIyBSZW1vdmUgcGFyZW50aGVzaXMgYW5kIHdoaXRlc3BhY2VzXG4gICAgICAgIGZvciBrZXksIGVsZW1lbnQgb2YgZWxlbWVudHNcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnJlcGxhY2UgL15cXHMrfFxccyskL2csIFwiXCJcbiAgICAgICAgICAgIGlmIGVsZW1lbnRbMF0gPT0gJ3snIG9yIGVsZW1lbnRbMF0gPT0gJ1snXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQuc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICBlbHNlIGlmIGVsZW1lbnQuaW5kZXhPZigncmV0dXJuICcpID09IDBcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5zdWJzdHJpbmcoJ3JldHVybiAnLmxlbmd0aClcblxuICAgICAgICAgICAgZWxlbWVudHNba2V5XSA9IGVsZW1lbnRcblxuICAgICAgICByZXR1cm4gZWxlbWVudHNcblxuICAgICMjIypcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSB2YXJpYWJsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge1JhbmdlfSAgICAgIGJ1ZmZlclBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICBlbGVtZW50ICAgICAgICBWYXJpYWJsZSB0byBzZWFyY2hcbiAgICAjIyNcbiAgICBnZXRWYXJpYWJsZVR5cGU6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlbGVtZW50KSAtPlxuICAgICAgICBpZiBlbGVtZW50LnJlcGxhY2UoL1tcXCRdW2EtekEtWjAtOV9dKy9nLCBcIlwiKS50cmltKCkubGVuZ3RoID4gMFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBpZiBlbGVtZW50LnRyaW0oKS5sZW5ndGggPT0gMFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBiZXN0TWF0Y2ggPSBudWxsXG4gICAgICAgIGJlc3RNYXRjaFJvdyA9IG51bGxcblxuICAgICAgICAjIFJlZ2V4IHZhcmlhYmxlIGRlZmluaXRpb25cbiAgICAgICAgcmVnZXhFbGVtZW50ID0gbmV3IFJlZ0V4cChcIlxcXFwje2VsZW1lbnR9W1xcXFxzXSo9W1xcXFxzXSooW147XSspO1wiLCBcImdcIilcbiAgICAgICAgcmVnZXhOZXdJbnN0YW5jZSA9IG5ldyBSZWdFeHAoXCJcXFxcI3tlbGVtZW50fVtcXFxcc10qPVtcXFxcc10qbmV3W1xcXFxzXSpcXFxcXFxcXD8oW2EtekEtWl1bYS16QS1aX1xcXFxcXFxcXSopKyg/OiguKyk/KTtcIiwgXCJnXCIpXG4gICAgICAgIHJlZ2V4Q2F0Y2ggPSBuZXcgUmVnRXhwKFwiY2F0Y2hbXFxcXHNdKlxcXFwoW1xcXFxzXSooW0EtWmEtejAtOV9cXFxcXFxcXF0rKVtcXFxcc10rXFxcXCN7ZWxlbWVudH1bXFxcXHNdKlxcXFwpXCIsIFwiZ1wiKVxuXG4gICAgICAgIGxpbmVOdW1iZXIgPSBidWZmZXJQb3NpdGlvbi5yb3cgLSAxXG5cbiAgICAgICAgd2hpbGUgbGluZU51bWJlciA+IDBcbiAgICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZU51bWJlcilcblxuICAgICAgICAgICAgaWYgbm90IGJlc3RNYXRjaFxuICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yICR4ID0gbmV3IFhYWFhYKClcbiAgICAgICAgICAgICAgICBtYXRjaGVzTmV3ID0gcmVnZXhOZXdJbnN0YW5jZS5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgICAgICBpZiBudWxsICE9IG1hdGNoZXNOZXdcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoUm93ID0gbGluZU51bWJlclxuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IsIG1hdGNoZXNOZXdbMV0pXG5cbiAgICAgICAgICAgIGlmIG5vdCBiZXN0TWF0Y2hcbiAgICAgICAgICAgICAgICAjIENoZWNrIGZvciBjYXRjaChYWFggJHh4eClcbiAgICAgICAgICAgICAgICBtYXRjaGVzQ2F0Y2ggPSByZWdleENhdGNoLmV4ZWMobGluZSlcblxuICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc0NhdGNoXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaFJvdyA9IGxpbmVOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCBtYXRjaGVzQ2F0Y2hbMV0pXG5cbiAgICAgICAgICAgIGlmIG5vdCBiZXN0TWF0Y2hcbiAgICAgICAgICAgICAgICAjIENoZWNrIGZvciBhIHZhcmlhYmxlIGFzc2lnbm1lbnQgJHggPSAuLi5cbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhFbGVtZW50LmV4ZWMobGluZSlcblxuICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMgPSBAcGFyc2VTdGFja0NsYXNzKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5wdXNoKFwiXCIpICPCoFB1c2ggb25lIG1vcmUgZWxlbWVudCB0byBnZXQgZnVsbHkgdGhlIGxhc3QgY2xhc3NcblxuICAgICAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICByb3cgOiBsaW5lTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuXG4gICAgICAgICAgICAgICAgICAgICMgTk9URTogYmVzdE1hdGNoIGNvdWxkIG5vdyBiZSBudWxsLCBidXQgdGhpcyBsaW5lIGlzIHN0aWxsIHRoZSBjbG9zZXN0IG1hdGNoLiBUaGUgZmFjdCB0aGF0IHdlXG4gICAgICAgICAgICAgICAgICAgICMgZG9uJ3QgcmVjb2duaXplIHRoZSBjbGFzcyBuYW1lIGlzIGlycmVsZXZhbnQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaFJvdyA9IGxpbmVOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gQHBhcnNlRWxlbWVudHMoZWRpdG9yLCBuZXdQb3NpdGlvbiwgZWxlbWVudHMpXG5cbiAgICAgICAgICAgIGlmIG5vdCBiZXN0TWF0Y2hcbiAgICAgICAgICAgICAgICAjIENoZWNrIGZvciBmdW5jdGlvbiBvciBjbG9zdXJlIHBhcmFtZXRlciB0eXBlIGhpbnRzIGFuZCB0aGUgZG9jYmxvY2suXG4gICAgICAgICAgICAgICAgcmVnZXhGdW5jdGlvbiA9IG5ldyBSZWdFeHAoXCJmdW5jdGlvbig/OltcXFxcc10rKFtfYS16QS1aXSspKT9bXFxcXHNdKltcXFxcKF0oPzooPyFbYS16QS1aXFxcXF9cXFxcXFxcXF0qW1xcXFxzXSpcXFxcI3tlbGVtZW50fSkuKSpbLFxcXFxzXT8oW2EtekEtWlxcXFxfXFxcXFxcXFxdKilbXFxcXHNdKlxcXFwje2VsZW1lbnR9W2EtekEtWjAtOVxcXFxzXFxcXCRcXFxcXFxcXCw9XFxcXFxcXCJcXFxcXFwnXFwoXFwpXSpbXFxcXHNdKltcXFxcKV1cIiwgXCJnXCIpXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4RnVuY3Rpb24uZXhlYyhsaW5lKVxuXG4gICAgICAgICAgICAgICAgaWYgbnVsbCAhPSBtYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgIHR5cGVIaW50ID0gbWF0Y2hlc1syXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHR5cGVIaW50Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IsIHR5cGVIaW50KVxuXG4gICAgICAgICAgICAgICAgICAgIGZ1bmNOYW1lID0gbWF0Y2hlc1sxXVxuXG4gICAgICAgICAgICAgICAgICAgICMgQ2FuIGJlIGVtcHR5IGZvciBjbG9zdXJlcy5cbiAgICAgICAgICAgICAgICAgICAgaWYgZnVuY05hbWUgYW5kIGZ1bmNOYW1lLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IHByb3h5LmRvY1BhcmFtcyhAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IpLCBmdW5jTmFtZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyYW1zLnBhcmFtcz8gYW5kIHBhcmFtcy5wYXJhbXNbZWxlbWVudF0/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgcGFyYW1zLnBhcmFtc1tlbGVtZW50XS50eXBlLCB0cnVlKVxuXG4gICAgICAgICAgICBjaGFpbiA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgbGluZS5sZW5ndGhdKS5nZXRTY29wZUNoYWluKClcblxuICAgICAgICAgICAgIyBBbm5vdGF0aW9ucyBpbiBjb21tZW50cyBjYW4gb3B0aW9uYWxseSBvdmVycmlkZSB0aGUgdmFyaWFibGUgdHlwZS5cbiAgICAgICAgICAgIGlmIGNoYWluLmluZGV4T2YoXCJjb21tZW50XCIpICE9IC0xXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiB0aGUgbGluZSBiZWZvcmUgY29udGFpbnMgYSAvKiogQHZhciBGb29UeXBlICovLCB3aGljaCBvdmVycmlkZXMgdGhlIHR5cGUgb2YgdGhlIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgIyBpbW1lZGlhdGVseSBiZWxvdyBpdC4gVGhpcyB3aWxsIG5vdCBldmFsdWF0ZSB0byAvKiogQHZhciBGb29UeXBlICRzb21lVmFyICovIChzZWUgYmVsb3cgZm9yIHRoYXQpLlxuICAgICAgICAgICAgICAgIGlmIGJlc3RNYXRjaFJvdyBhbmQgbGluZU51bWJlciA9PSAoYmVzdE1hdGNoUm93IC0gMSlcbiAgICAgICAgICAgICAgICAgICAgcmVnZXhWYXIgPSAvXFxAdmFyW1xcc10rKFthLXpBLVpfXFxcXF0rKSg/IVtcXHddK1xcJCkvZ1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhWYXIuZXhlYyhsaW5lKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgbWF0Y2hlc1sxXSlcblxuICAgICAgICAgICAgICAgICMgQ2hlY2sgaWYgdGhlcmUgaXMgYW4gUEhQU3Rvcm0tc3R5bGUgdHlwZSBpbmxpbmUgZG9jYmxvY2sgcHJlc2VudCAvKiogQHZhciBGb29UeXBlICRzb21lVmFyICovLlxuICAgICAgICAgICAgICAgIHJlZ2V4VmFyV2l0aFZhck5hbWUgPSBuZXcgUmVnRXhwKFwiXFxcXEB2YXJbXFxcXHNdKyhbYS16QS1aX1xcXFxcXFxcXSspW1xcXFxzXStcXFxcI3tlbGVtZW50fVwiLCBcImdcIilcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhWYXJXaXRoVmFyTmFtZS5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgICAgICBpZiBudWxsICE9IG1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgbWF0Y2hlc1sxXSlcblxuICAgICAgICAgICAgICAgICMgQ2hlY2sgaWYgdGhlcmUgaXMgYW4gSW50ZWxsaUotc3R5bGUgdHlwZSBpbmxpbmUgZG9jYmxvY2sgcHJlc2VudCAvKiogQHZhciAkc29tZVZhciBGb29UeXBlICovLlxuICAgICAgICAgICAgICAgIHJlZ2V4VmFyV2l0aFZhck5hbWUgPSBuZXcgUmVnRXhwKFwiXFxcXEB2YXJbXFxcXHNdK1xcXFwje2VsZW1lbnR9W1xcXFxzXSsoW2EtekEtWl9cXFxcXFxcXF0rKVwiLCBcImdcIilcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhWYXJXaXRoVmFyTmFtZS5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgICAgICBpZiBudWxsICE9IG1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgbWF0Y2hlc1sxXSlcblxuICAgICAgICAgICAgIyBXZSd2ZSByZWFjaGVkIHRoZSBmdW5jdGlvbiBkZWZpbml0aW9uLCBvdGhlciB2YXJpYWJsZXMgZG9uJ3QgYXBwbHkgdG8gdGhpcyBzY29wZS5cbiAgICAgICAgICAgIGlmIGNoYWluLmluZGV4T2YoXCJmdW5jdGlvblwiKSAhPSAtMVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIC0tbGluZU51bWJlclxuXG4gICAgICAgIHJldHVybiBiZXN0TWF0Y2hcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY2xhc3MgbWVtYmVyIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24gaW4gdGhlIGVkaXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICAgICAgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgdGVybSAgICAgICAgICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9ICAgICAgYnVmZmVyUG9zaXRpb24gVGhlIGN1cnNvciBsb2NhdGlvbiB0aGUgdGVybSBpcyBhdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgIGNhbGxlZENsYXNzICAgIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjYWxsZWQgY2xhc3MgKG9wdGlvbmFsKS5cbiAgICAjIyNcbiAgICBnZXRNZW1iZXJDb250ZXh0OiAoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbiwgY2FsbGVkQ2xhc3MpIC0+XG4gICAgICAgIGlmIG5vdCBjYWxsZWRDbGFzc1xuICAgICAgICAgICAgY2FsbGVkQ2xhc3MgPSBAZ2V0Q2FsbGVkQ2xhc3MoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbilcblxuICAgICAgICBpZiBub3QgY2FsbGVkQ2xhc3MgJiYgbm90IEBpc0Z1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBwcm94eSA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUnXG4gICAgICAgIGlmIEBpc0Z1bmN0aW9uXG4gICAgICAgICAgbWV0aG9kcyA9IHByb3h5LmZ1bmN0aW9ucygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtZXRob2RzID0gcHJveHkubWV0aG9kcyhjYWxsZWRDbGFzcylcblxuICAgICAgICBpZiBub3QgbWV0aG9kcyB8fCBub3QgbWV0aG9kcz9cbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGlmIG1ldGhvZHMuZXJyb3I/IGFuZCBtZXRob2RzLmVycm9yICE9ICcnXG4gICAgICAgICAgICBpZiBjb25maWcuY29uZmlnLnZlcmJvc2VFcnJvcnNcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBnZXQgbWV0aG9kcyBmb3IgJyArIGNhbGxlZENsYXNzLCB7XG4gICAgICAgICAgICAgICAgICAgICdkZXRhaWwnOiBtZXRob2RzLmVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICdGYWlsZWQgdG8gZ2V0IG1ldGhvZHMgZm9yICcgKyBjYWxsZWRDbGFzcyArICcgOiAnICsgbWV0aG9kcy5lcnJvci5tZXNzYWdlXG5cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiAhbWV0aG9kcy52YWx1ZXM/Lmhhc093blByb3BlcnR5KHRlcm0pXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB2YWx1ZSA9IG1ldGhvZHMudmFsdWVzW3Rlcm1dXG5cbiAgICAgICAgIyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgbWF0Y2hlcywganVzdCBzZWxlY3QgdGhlIGZpcnN0IG1ldGhvZC5cbiAgICAgICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZm9yIHZhbCBpbiB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIHZhbC5pc01ldGhvZFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgIHJldHVybiB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICAqIFBhcnNlIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBnaXZlbiBhcnJheSB0byByZXR1cm4gdGhlIGxhc3QgY2xhc3NOYW1lIChpZiBhbnkpXG4gICAgICogQHBhcmFtICBBcnJheSBlbGVtZW50cyBFbGVtZW50cyB0byBwYXJzZVxuICAgICAqIEByZXR1cm4gc3RyaW5nfG51bGwgZnVsbCBjbGFzcyBuYW1lIG9mIHRoZSBsYXN0IGVsZW1lbnRcbiAgICAjIyNcbiAgICBwYXJzZUVsZW1lbnRzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZWxlbWVudHMpIC0+XG4gICAgICAgIGxvb3BfaW5kZXggPSAwXG4gICAgICAgIGNsYXNzTmFtZSAgPSBudWxsXG4gICAgICAgIGlmIG5vdCBlbGVtZW50cz9cbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGZvciBlbGVtZW50IGluIGVsZW1lbnRzXG4gICAgICAgICAgICAjICR0aGlzIGtleXdvcmRcbiAgICAgICAgICAgIGlmIGxvb3BfaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIGlmIGVsZW1lbnRbMF0gPT0gJyQnXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IEBnZXRWYXJpYWJsZVR5cGUoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZWxlbWVudClcblxuICAgICAgICAgICAgICAgICAgICAjIE5PVEU6IFRoZSB0eXBlIG9mICR0aGlzIGNhbiBhbHNvIGJlIG92ZXJyaWRkZW4gbG9jYWxseSBieSBhIGRvY2Jsb2NrLlxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50ID09ICckdGhpcycgYW5kIG5vdCBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvcilcblxuICAgICAgICAgICAgICAgICAgICBsb29wX2luZGV4KytcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZWxlbWVudCA9PSAnc3RhdGljJyBvciBlbGVtZW50ID09ICdzZWxmJ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IpXG4gICAgICAgICAgICAgICAgICAgIGxvb3BfaW5kZXgrK1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlbGVtZW50ID09ICdwYXJlbnQnXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IEBnZXRQYXJlbnRDbGFzcyhlZGl0b3IpXG4gICAgICAgICAgICAgICAgICAgIGxvb3BfaW5kZXgrK1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IsIGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGxvb3BfaW5kZXgrK1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAjIExhc3QgZWxlbWVudFxuICAgICAgICAgICAgaWYgbG9vcF9pbmRleCA+PSBlbGVtZW50cy5sZW5ndGggLSAxXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgaWYgY2xhc3NOYW1lID09IG51bGxcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjIENoZWNrIGF1dG9jb21wbGV0ZSBmcm9tIHBsdWdpbnNcbiAgICAgICAgICAgIGZvdW5kID0gbnVsbFxuICAgICAgICAgICAgZm9yIHBsdWdpbiBpbiBwbHVnaW5zLnBsdWdpbnNcbiAgICAgICAgICAgICAgICBjb250aW51ZSB1bmxlc3MgcGx1Z2luLmF1dG9jb21wbGV0ZT9cbiAgICAgICAgICAgICAgICBmb3VuZCA9IHBsdWdpbi5hdXRvY29tcGxldGUoY2xhc3NOYW1lLCBlbGVtZW50KVxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGZvdW5kXG5cbiAgICAgICAgICAgIGlmIGZvdW5kXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gZm91bmRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXRob2RzID0gcHJveHkuYXV0b2NvbXBsZXRlKGNsYXNzTmFtZSwgZWxlbWVudClcblxuICAgICAgICAgICAgICAgICMgRWxlbWVudCBub3QgZm91bmQgb3Igbm8gcmV0dXJuIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgbm90IG1ldGhvZHMuY2xhc3M/IG9yIG5vdCBAaXNDbGFzcyhtZXRob2RzLmNsYXNzKVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBtZXRob2RzLmNsYXNzXG5cbiAgICAgICAgICAgIGxvb3BfaW5kZXgrK1xuXG4gICAgICAgICPCoElmIG5vIGRhdGEgb3IgYSB2YWxpZCBlbmQgb2YgbGluZSwgT0tcbiAgICAgICAgaWYgZWxlbWVudHMubGVuZ3RoID4gMCBhbmQgKGVsZW1lbnRzW2VsZW1lbnRzLmxlbmd0aC0xXS5sZW5ndGggPT0gMCBvciBlbGVtZW50c1tlbGVtZW50cy5sZW5ndGgtMV0ubWF0Y2goLyhbYS16QS1aMC05XSQpL2cpKVxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzTmFtZVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgZnVsbCB3b3JkcyBmcm9tIHRoZSBidWZmZXIgcG9zaXRpb24gZ2l2ZW4uXG4gICAgICogRS5nLiBHZXR0aW5nIGEgY2xhc3Mgd2l0aCBpdHMgbmFtZXNwYWNlLlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9ICAgICBlZGl0b3IgICBUZXh0RWRpdG9yIHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0gIHtCdWZmZXJQb3NpdGlvbn0gcG9zaXRpb24gQnVmZmVyUG9zaXRpb24gdG8gc3RhcnQgc2VhcmNoaW5nIGZyb20uXG4gICAgICogQHJldHVybiB7c3RyaW5nfSAgUmV0dXJucyBhIHN0cmluZyBvZiB0aGUgY2xhc3MuXG4gICAgIyMjXG4gICAgZ2V0RnVsbFdvcmRGcm9tQnVmZmVyUG9zaXRpb246IChlZGl0b3IsIHBvc2l0aW9uKSAtPlxuICAgICAgICBmb3VuZFN0YXJ0ID0gZmFsc2VcbiAgICAgICAgZm91bmRFbmQgPSBmYWxzZVxuICAgICAgICBzdGFydEJ1ZmZlclBvc2l0aW9uID0gW11cbiAgICAgICAgZW5kQnVmZmVyUG9zaXRpb24gPSBbXVxuICAgICAgICBmb3J3YXJkUmVnZXggPSAvLXwoPzpcXCgpW1xcd1xcW1xcJFxcKFxcXFxdfFxcc3xcXCl8O3wnfCx8XCJ8XFx8L1xuICAgICAgICBiYWNrd2FyZFJlZ2V4ID0gL1xcKHxcXHN8XFwpfDt8J3wsfFwifFxcfC9cbiAgICAgICAgaW5kZXggPSAtMVxuICAgICAgICBwcmV2aW91c1RleHQgPSAnJ1xuXG4gICAgICAgIGxvb3BcbiAgICAgICAgICAgIGluZGV4KytcbiAgICAgICAgICAgIHN0YXJ0QnVmZmVyUG9zaXRpb24gPSBbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4gLSBpbmRleCAtIDFdXG4gICAgICAgICAgICByYW5nZSA9IFtbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW5dLCBbc3RhcnRCdWZmZXJQb3NpdGlvblswXSwgc3RhcnRCdWZmZXJQb3NpdGlvblsxXV1dXG4gICAgICAgICAgICBjdXJyZW50VGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICAgIGlmIGJhY2t3YXJkUmVnZXgudGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKSB8fCBzdGFydEJ1ZmZlclBvc2l0aW9uWzFdID09IC0xIHx8IGN1cnJlbnRUZXh0ID09IHByZXZpb3VzVGV4dFxuICAgICAgICAgICAgICAgIGZvdW5kU3RhcnQgPSB0cnVlXG4gICAgICAgICAgICBwcmV2aW91c1RleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgICBicmVhayBpZiBmb3VuZFN0YXJ0XG4gICAgICAgIGluZGV4ID0gLTFcbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgaW5kZXgrK1xuICAgICAgICAgICAgZW5kQnVmZmVyUG9zaXRpb24gPSBbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4gKyBpbmRleCArIDFdXG4gICAgICAgICAgICByYW5nZSA9IFtbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW5dLCBbZW5kQnVmZmVyUG9zaXRpb25bMF0sIGVuZEJ1ZmZlclBvc2l0aW9uWzFdXV1cbiAgICAgICAgICAgIGN1cnJlbnRUZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgICAgaWYgZm9yd2FyZFJlZ2V4LnRlc3QoY3VycmVudFRleHQpIHx8IGVuZEJ1ZmZlclBvc2l0aW9uWzFdID09IDUwMCB8fCBjdXJyZW50VGV4dCA9PSBwcmV2aW91c1RleHRcbiAgICAgICAgICAgICAgICBmb3VuZEVuZCA9IHRydWVcbiAgICAgICAgICAgIHByZXZpb3VzVGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICAgIGJyZWFrIGlmIGZvdW5kRW5kXG5cbiAgICAgICAgc3RhcnRCdWZmZXJQb3NpdGlvblsxXSArPSAxXG4gICAgICAgIGVuZEJ1ZmZlclBvc2l0aW9uWzFdIC09IDFcbiAgICAgICAgcmV0dXJuIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbc3RhcnRCdWZmZXJQb3NpdGlvbiwgZW5kQnVmZmVyUG9zaXRpb25dKVxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIGNvcnJlY3Qgc2VsZWN0b3Igd2hlbiBhIGNsYXNzIG9yIG5hbWVzcGFjZSBpcyBjbGlja2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSAgZXZlbnQgIEEgalF1ZXJ5IGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7b2JqZWN0fG51bGx9IEEgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGpRdWVyeS5cbiAgICAjIyNcbiAgICBnZXRDbGFzc1NlbGVjdG9yRnJvbUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIHNlbGVjdG9yID0gZXZlbnQuY3VycmVudFRhcmdldFxuXG4gICAgICAgICQgPSByZXF1aXJlICdqcXVlcnknXG5cbiAgICAgICAgaWYgJChzZWxlY3RvcikuaGFzQ2xhc3MoJ2J1aWx0aW4nKSBvciAkKHNlbGVjdG9yKS5jaGlsZHJlbignLmJ1aWx0aW4nKS5sZW5ndGggPiAwXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGlmICQoc2VsZWN0b3IpLnBhcmVudCgpLmhhc0NsYXNzKCdmdW5jdGlvbiBhcmd1bWVudCcpXG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3RvcikucGFyZW50KCkuY2hpbGRyZW4oJy5uYW1lc3BhY2UsIC5jbGFzczpub3QoLm9wZXJhdG9yKTpub3QoLmNvbnN0YW50KScpXG5cbiAgICAgICAgaWYgJChzZWxlY3RvcikucHJldigpLmhhc0NsYXNzKCduYW1lc3BhY2UnKSAmJiAkKHNlbGVjdG9yKS5oYXNDbGFzcygnY2xhc3MnKVxuICAgICAgICAgICAgcmV0dXJuICQoWyQoc2VsZWN0b3IpLnByZXYoKVswXSwgc2VsZWN0b3JdKVxuXG4gICAgICAgIGlmICQoc2VsZWN0b3IpLm5leHQoKS5oYXNDbGFzcygnY2xhc3MnKSAmJiAkKHNlbGVjdG9yKS5oYXNDbGFzcygnbmFtZXNwYWNlJylcbiAgICAgICAgICAgcmV0dXJuICQoW3NlbGVjdG9yLCAkKHNlbGVjdG9yKS5uZXh0KClbMF1dKVxuXG4gICAgICAgIGlmICQoc2VsZWN0b3IpLnByZXYoKS5oYXNDbGFzcygnbmFtZXNwYWNlJykgfHwgJChzZWxlY3RvcikubmV4dCgpLmhhc0NsYXNzKCdpbmhlcml0ZWQtY2xhc3MnKVxuICAgICAgICAgICAgcmV0dXJuICQoc2VsZWN0b3IpLnBhcmVudCgpLmNoaWxkcmVuKCcubmFtZXNwYWNlLCAuaW5oZXJpdGVkLWNsYXNzJylcblxuICAgICAgICByZXR1cm4gc2VsZWN0b3JcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBwYXJlbnQgY2xhc3Mgb2YgdGhlIGN1cnJlbnQgY2xhc3Mgb3BlbmVkIGluIHRoZSBlZGl0b3JcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgRWRpdG9yIHdpdGggdGhlIGNsYXNzIGluLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICBUaGUgbmFtZXNwYWNlIGFuZCBjbGFzcyBvZiB0aGUgcGFyZW50XG4gICAgIyMjXG4gICAgZ2V0UGFyZW50Q2xhc3M6IChlZGl0b3IpIC0+XG4gICAgICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgbGluZSA9IGxpbmUudHJpbSgpXG5cbiAgICAgICAgICAgICMgSWYgd2UgZm91bmQgZXh0ZW5kcyBrZXl3b3JkLCByZXR1cm4gdGhlIGNsYXNzXG4gICAgICAgICAgICBpZiBsaW5lLmluZGV4T2YoJ2V4dGVuZHMgJykgIT0gLTFcbiAgICAgICAgICAgICAgICB3b3JkcyA9IGxpbmUuc3BsaXQoJyAnKVxuICAgICAgICAgICAgICAgIGV4dGVuZHNJbmRleCA9IHdvcmRzLmluZGV4T2YoJ2V4dGVuZHMnKVxuICAgICAgICAgICAgICAgIHJldHVybiBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IsIHdvcmRzW2V4dGVuZHNJbmRleCArIDFdKVxuXG4gICAgIyMjKlxuICAgICAqIEZpbmRzIHRoZSBidWZmZXIgcG9zaXRpb24gb2YgdGhlIHdvcmQgZ2l2ZW5cbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGV4dEVkaXRvciB0byBzZWFyY2hcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgICB0ZXJtICAgVGhlIGZ1bmN0aW9uIG5hbWUgdG8gc2VhcmNoIGZvclxuICAgICAqIEByZXR1cm4ge21peGVkfSAgICAgICAgICAgICBFaXRoZXIgbnVsbCBvciB0aGUgYnVmZmVyIHBvc2l0aW9uIG9mIHRoZSBmdW5jdGlvbi5cbiAgICAjIyNcbiAgICBmaW5kQnVmZmVyUG9zaXRpb25PZldvcmQ6IChlZGl0b3IsIHRlcm0sIHJlZ2V4LCBsaW5lID0gbnVsbCkgLT5cbiAgICAgICAgaWYgbGluZSAhPSBudWxsXG4gICAgICAgICAgICBsaW5lVGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lKVxuICAgICAgICAgICAgcmVzdWx0ID0gQGNoZWNrTGluZUZvcldvcmQobGluZVRleHQsIHRlcm0sIHJlZ2V4KVxuICAgICAgICAgICAgaWYgcmVzdWx0ICE9IG51bGxcbiAgICAgICAgICAgICAgICByZXR1cm4gW2xpbmUsIHJlc3VsdF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICAgIHJvdyA9IDBcbiAgICAgICAgICAgIGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGNoZWNrTGluZUZvcldvcmQobGluZSwgdGVybSwgcmVnZXgpXG4gICAgICAgICAgICAgICAgaWYgcmVzdWx0ICE9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtyb3csIHJlc3VsdF1cbiAgICAgICAgICAgICAgICByb3crK1xuICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICMjIypcbiAgICAgKiBDaGVja3MgdGhlIGxpbmVUZXh0IGZvciB0aGUgdGVybSBhbmQgcmVnZXggbWF0Y2hlc1xuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICBsaW5lVGV4dCBUaGUgbGluZSBvZiB0ZXh0IHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICB0ZXJtICAgICBUZXJtIHRvIGxvb2sgZm9yLlxuICAgICAqIEBwYXJhbSAge3JlZ2V4fSAgICByZWdleCAgICBSZWdleCB0byBydW4gb24gdGhlIGxpbmUgdG8gbWFrZSBzdXJlIGl0J3MgdmFsaWRcbiAgICAgKiBAcmV0dXJuIHtudWxsfGludH0gICAgICAgICAgUmV0dXJucyBudWxsIGlmIG5vdGhpbmcgd2FzIGZvdW5kIG9yIGFuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZiB0aGUgY29sdW1uIHRoZSB0ZXJtIGlzIG9uLlxuICAgICMjI1xuICAgIGNoZWNrTGluZUZvcldvcmQ6IChsaW5lVGV4dCwgdGVybSwgcmVnZXgpIC0+XG4gICAgICAgIGlmIHJlZ2V4LnRlc3QobGluZVRleHQpXG4gICAgICAgICAgICB3b3JkcyA9IGxpbmVUZXh0LnNwbGl0KCcgJylcbiAgICAgICAgICAgIHByb3BlcnR5SW5kZXggPSAwXG4gICAgICAgICAgICBmb3IgZWxlbWVudCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgIGlmIGVsZW1lbnQuaW5kZXhPZih0ZXJtKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIHByb3BlcnR5SW5kZXgrKztcblxuICAgICAgICAgICAgICByZWR1Y2VkV29yZHMgPSB3b3Jkcy5zbGljZSgwLCBwcm9wZXJ0eUluZGV4KS5qb2luKCcgJylcbiAgICAgICAgICAgICAgcmV0dXJuIHJlZHVjZWRXb3Jkcy5sZW5ndGggKyAxXG4gICAgICAgIHJldHVybiBudWxsXG4iXX0=
