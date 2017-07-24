'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var tokenizedLineForRow = function tokenizedLineForRow(textEditor, lineNumber) {
  return(
    // Uses non-public parts of the Atom API, liable to break at any time!
    textEditor.tokenizedBuffer.tokenizedLineForRow(lineNumber)
  );
};

exports['default'] = {
  tooComplex: function tooComplex(textEditor, message, lineNumber) {
    // C901 - 'FUNCTION' is too complex
    // C901 - 'CLASS.METHOD' is too complex

    // // Get the raw symbol
    var symbol = /'(?:[^.]+\.)?([^']+)'/.exec(message)[1];

    // Some variables
    var lineCount = textEditor.getLineCount();
    var line = undefined;

    // Parse through the lines, starting where `flake8` says it starts
    for (line = lineNumber; line < lineCount; line += 1) {
      var offset = 0;
      var tokenizedLine = tokenizedLineForRow(textEditor, line);
      if (tokenizedLine === undefined) {
        // Doesn't exist if the line is folded
        break;
      }

      var foundDecorator = false;
      for (var i = 0; i < tokenizedLine.tokens.length; i += 1) {
        var token = tokenizedLine.tokens[i];
        if (token.scopes.includes('meta.function.python')) {
          if (token.value === symbol) {
            return {
              line: line,
              col: offset,
              endCol: offset + token.value.length
            };
          }
        }
        // Flag whether we have found the decorator, must be after symbol checks
        if (token.scopes.includes('meta.function.decorator.python')) {
          foundDecorator = true;
        }
        offset += token.value.length;
      }

      if (!foundDecorator) {
        break;
      }
    }

    // Fixing couldn't determine a point, let rangeFromLineNumber make up a range
    return {
      line: line
    };
  },

  importedUnused: function importedUnused(textEditor, message, lineNumber) {
    // F401 - 'SYMBOL' imported but unused

    // Get the raw symbol and split it into the word(s)
    var symbol = /'([^']+)'/.exec(message)[1];

    var _symbol$split$slice = symbol.split('.').slice(-1);

    var _symbol$split$slice2 = _slicedToArray(_symbol$split$slice, 1);

    symbol = _symbol$split$slice2[0];

    var symbolParts = symbol.split(/\s/);

    // Some variables
    var foundImport = false;
    var lineCount = textEditor.getLineCount();
    var line = undefined;
    var start = undefined;
    var end = undefined;

    // Parse through the lines, starting where `flake8` says it starts
    for (line = lineNumber; line < lineCount; line += 1) {
      var offset = 0;
      var tokenizedLine = tokenizedLineForRow(textEditor, line);
      if (tokenizedLine === undefined) {
        // Doesn't exist if the line is folded
        break;
      }
      // Check each token in the line
      for (var i = 0; i < tokenizedLine.tokens.length; i += 1) {
        var token = tokenizedLine.tokens[i];
        // Only match on the name if we have already passed the "import" statement
        if (foundImport && token.value === symbolParts[0]) {
          start = { line: line, col: offset };
          end = { line: line, col: offset + token.value.length };
        }
        // For multi-word symbols('foo as bar'), grab the end point as well
        if (foundImport && symbolParts.length > 1 && token.value === symbolParts[symbolParts.length - 1]) {
          end = { line: line, col: offset + token.value.length };
        }
        // Flag whether we have found the import, must be after symbol checks
        if (token.value === 'import' && token.scopes.includes('keyword.control.import.python')) {
          foundImport = true;
        }
        // If we didn't find what we were looking for, move on in the line
        offset += token.value.length;
      }
    }
    if (start !== undefined && end !== undefined) {
      // We found a valid range
      return {
        line: start.line,
        col: start.col,
        endCol: end.col
      };
    }
    // Fixing couldn't determine a point, let rangeFromLineNumber make up a range
    return {
      line: line
    };
  },

  noLocalsString: function noLocalsString(textEditor, lineNumber) {
    // H501 - do not use locals() for string formatting
    var tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
    if (tokenizedLine === undefined) {
      return {
        line: lineNumber
      };
    }
    var offset = 0;
    for (var i = 0; i < tokenizedLine.tokens.length; i += 1) {
      var token = tokenizedLine.tokens[i];
      if (token.scopes.includes('meta.function-call.python')) {
        if (token.value === 'locals') {
          return {
            line: lineNumber,
            col: offset,
            endCol: offset + token.value.length
          };
        }
      }
      offset += token.value.length;
    }
    return {
      line: lineNumber
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvcmFuZ2VIZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7QUFFWixJQUFNLG1CQUFtQixHQUFHLFNBQXRCLG1CQUFtQixDQUFJLFVBQVUsRUFBRSxVQUFVOzs7QUFFakQsY0FBVSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7O0NBQUEsQ0FBQzs7cUJBRTlDO0FBQ2IsWUFBVSxFQUFBLG9CQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFOzs7OztBQUsxQyxRQUFNLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUd4RCxRQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDNUMsUUFBSSxJQUFJLFlBQUEsQ0FBQzs7O0FBR1QsU0FBSyxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksR0FBRyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRTtBQUNuRCxVQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDZixVQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUQsVUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFOztBQUUvQixjQUFNO09BQ1A7O0FBRUQsVUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZELFlBQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsWUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FB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QUFVO0tBQ2pCLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvcmFuZ2VIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IHRva2VuaXplZExpbmVGb3JSb3cgPSAodGV4dEVkaXRvciwgbGluZU51bWJlcikgPT5cbiAgLy8gVXNlcyBub24tcHVibGljIHBhcnRzIG9mIHRoZSBBdG9tIEFQSSwgbGlhYmxlIHRvIGJyZWFrIGF0IGFueSB0aW1lIVxuICB0ZXh0RWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KGxpbmVOdW1iZXIpO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRvb0NvbXBsZXgodGV4dEVkaXRvciwgbWVzc2FnZSwgbGluZU51bWJlcikge1xuICAgIC8vIEM5MDEgLSAnRlVOQ1RJT04nIGlzIHRvbyBjb21wbGV4XG4gICAgLy8gQzkwMSAtICdDTEFTUy5NRVRIT0QnIGlzIHRvbyBjb21wbGV4XG5cbiAgICAvLyAvLyBHZXQgdGhlIHJhdyBzeW1ib2xcbiAgICBjb25zdCBzeW1ib2wgPSAvJyg/OlteLl0rXFwuKT8oW14nXSspJy8uZXhlYyhtZXNzYWdlKVsxXTtcblxuICAgIC8vIFNvbWUgdmFyaWFibGVzXG4gICAgY29uc3QgbGluZUNvdW50ID0gdGV4dEVkaXRvci5nZXRMaW5lQ291bnQoKTtcbiAgICBsZXQgbGluZTtcblxuICAgIC8vIFBhcnNlIHRocm91Z2ggdGhlIGxpbmVzLCBzdGFydGluZyB3aGVyZSBgZmxha2U4YCBzYXlzIGl0IHN0YXJ0c1xuICAgIGZvciAobGluZSA9IGxpbmVOdW1iZXI7IGxpbmUgPCBsaW5lQ291bnQ7IGxpbmUgKz0gMSkge1xuICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICBjb25zdCB0b2tlbml6ZWRMaW5lID0gdG9rZW5pemVkTGluZUZvclJvdyh0ZXh0RWRpdG9yLCBsaW5lKTtcbiAgICAgIGlmICh0b2tlbml6ZWRMaW5lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gRG9lc24ndCBleGlzdCBpZiB0aGUgbGluZSBpcyBmb2xkZWRcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGxldCBmb3VuZERlY29yYXRvciA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbml6ZWRMaW5lLnRva2Vucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2VuaXplZExpbmUudG9rZW5zW2ldO1xuICAgICAgICBpZiAodG9rZW4uc2NvcGVzLmluY2x1ZGVzKCdtZXRhLmZ1bmN0aW9uLnB5dGhvbicpKSB7XG4gICAgICAgICAgaWYgKHRva2VuLnZhbHVlID09PSBzeW1ib2wpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGxpbmUsXG4gICAgICAgICAgICAgIGNvbDogb2Zmc2V0LFxuICAgICAgICAgICAgICBlbmRDb2w6IG9mZnNldCArIHRva2VuLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEZsYWcgd2hldGhlciB3ZSBoYXZlIGZvdW5kIHRoZSBkZWNvcmF0b3IsIG11c3QgYmUgYWZ0ZXIgc3ltYm9sIGNoZWNrc1xuICAgICAgICBpZiAodG9rZW4uc2NvcGVzLmluY2x1ZGVzKCdtZXRhLmZ1bmN0aW9uLmRlY29yYXRvci5weXRob24nKSkge1xuICAgICAgICAgIGZvdW5kRGVjb3JhdG9yID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gdG9rZW4udmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWZvdW5kRGVjb3JhdG9yKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpeGluZyBjb3VsZG4ndCBkZXRlcm1pbmUgYSBwb2ludCwgbGV0IHJhbmdlRnJvbUxpbmVOdW1iZXIgbWFrZSB1cCBhIHJhbmdlXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmUsXG4gICAgfTtcbiAgfSxcblxuICBpbXBvcnRlZFVudXNlZCh0ZXh0RWRpdG9yLCBtZXNzYWdlLCBsaW5lTnVtYmVyKSB7XG4gICAgLy8gRjQwMSAtICdTWU1CT0wnIGltcG9ydGVkIGJ1dCB1bnVzZWRcblxuICAgIC8vIEdldCB0aGUgcmF3IHN5bWJvbCBhbmQgc3BsaXQgaXQgaW50byB0aGUgd29yZChzKVxuICAgIGxldCBzeW1ib2wgPSAvJyhbXiddKyknLy5leGVjKG1lc3NhZ2UpWzFdO1xuICAgIFtzeW1ib2xdID0gc3ltYm9sLnNwbGl0KCcuJykuc2xpY2UoLTEpO1xuICAgIGNvbnN0IHN5bWJvbFBhcnRzID0gc3ltYm9sLnNwbGl0KC9cXHMvKTtcblxuICAgIC8vIFNvbWUgdmFyaWFibGVzXG4gICAgbGV0IGZvdW5kSW1wb3J0ID0gZmFsc2U7XG4gICAgY29uc3QgbGluZUNvdW50ID0gdGV4dEVkaXRvci5nZXRMaW5lQ291bnQoKTtcbiAgICBsZXQgbGluZTtcbiAgICBsZXQgc3RhcnQ7XG4gICAgbGV0IGVuZDtcblxuICAgIC8vIFBhcnNlIHRocm91Z2ggdGhlIGxpbmVzLCBzdGFydGluZyB3aGVyZSBgZmxha2U4YCBzYXlzIGl0IHN0YXJ0c1xuICAgIGZvciAobGluZSA9IGxpbmVOdW1iZXI7IGxpbmUgPCBsaW5lQ291bnQ7IGxpbmUgKz0gMSkge1xuICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICBjb25zdCB0b2tlbml6ZWRMaW5lID0gdG9rZW5pemVkTGluZUZvclJvdyh0ZXh0RWRpdG9yLCBsaW5lKTtcbiAgICAgIGlmICh0b2tlbml6ZWRMaW5lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gRG9lc24ndCBleGlzdCBpZiB0aGUgbGluZSBpcyBmb2xkZWRcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBDaGVjayBlYWNoIHRva2VuIGluIHRoZSBsaW5lXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2VuaXplZExpbmUudG9rZW5zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5pemVkTGluZS50b2tlbnNbaV07XG4gICAgICAgIC8vIE9ubHkgbWF0Y2ggb24gdGhlIG5hbWUgaWYgd2UgaGF2ZSBhbHJlYWR5IHBhc3NlZCB0aGUgXCJpbXBvcnRcIiBzdGF0ZW1lbnRcbiAgICAgICAgaWYgKGZvdW5kSW1wb3J0ICYmIHRva2VuLnZhbHVlID09PSBzeW1ib2xQYXJ0c1swXSkge1xuICAgICAgICAgIHN0YXJ0ID0geyBsaW5lLCBjb2w6IG9mZnNldCB9O1xuICAgICAgICAgIGVuZCA9IHsgbGluZSwgY29sOiBvZmZzZXQgKyB0b2tlbi52YWx1ZS5sZW5ndGggfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3IgbXVsdGktd29yZCBzeW1ib2xzKCdmb28gYXMgYmFyJyksIGdyYWIgdGhlIGVuZCBwb2ludCBhcyB3ZWxsXG4gICAgICAgIGlmIChmb3VuZEltcG9ydCAmJiBzeW1ib2xQYXJ0cy5sZW5ndGggPiAxXG4gICAgICAgICAgJiYgdG9rZW4udmFsdWUgPT09IHN5bWJvbFBhcnRzW3N5bWJvbFBhcnRzLmxlbmd0aCAtIDFdXG4gICAgICAgICkge1xuICAgICAgICAgIGVuZCA9IHsgbGluZSwgY29sOiBvZmZzZXQgKyB0b2tlbi52YWx1ZS5sZW5ndGggfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGbGFnIHdoZXRoZXIgd2UgaGF2ZSBmb3VuZCB0aGUgaW1wb3J0LCBtdXN0IGJlIGFmdGVyIHN5bWJvbCBjaGVja3NcbiAgICAgICAgaWYgKHRva2VuLnZhbHVlID09PSAnaW1wb3J0JyAmJiB0b2tlbi5zY29wZXMuaW5jbHVkZXMoJ2tleXdvcmQuY29udHJvbC5pbXBvcnQucHl0aG9uJykpIHtcbiAgICAgICAgICBmb3VuZEltcG9ydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgZGlkbid0IGZpbmQgd2hhdCB3ZSB3ZXJlIGxvb2tpbmcgZm9yLCBtb3ZlIG9uIGluIHRoZSBsaW5lXG4gICAgICAgIG9mZnNldCArPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkICYmIGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBXZSBmb3VuZCBhIHZhbGlkIHJhbmdlXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBzdGFydC5saW5lLFxuICAgICAgICBjb2w6IHN0YXJ0LmNvbCxcbiAgICAgICAgZW5kQ29sOiBlbmQuY29sLFxuICAgICAgfTtcbiAgICB9XG4gICAgLy8gRml4aW5nIGNvdWxkbid0IGRldGVybWluZSBhIHBvaW50LCBsZXQgcmFuZ2VGcm9tTGluZU51bWJlciBtYWtlIHVwIGEgcmFuZ2VcbiAgICByZXR1cm4ge1xuICAgICAgbGluZSxcbiAgICB9O1xuICB9LFxuXG4gIG5vTG9jYWxzU3RyaW5nKHRleHRFZGl0b3IsIGxpbmVOdW1iZXIpIHtcbiAgICAvLyBINTAxIC0gZG8gbm90IHVzZSBsb2NhbHMoKSBmb3Igc3RyaW5nIGZvcm1hdHRpbmdcbiAgICBjb25zdCB0b2tlbml6ZWRMaW5lID0gdG9rZW5pemVkTGluZUZvclJvdyh0ZXh0RWRpdG9yLCBsaW5lTnVtYmVyKTtcbiAgICBpZiAodG9rZW5pemVkTGluZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBsaW5lTnVtYmVyLFxuICAgICAgfTtcbiAgICB9XG4gICAgbGV0IG9mZnNldCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbml6ZWRMaW5lLnRva2Vucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZWRMaW5lLnRva2Vuc1tpXTtcbiAgICAgIGlmICh0b2tlbi5zY29wZXMuaW5jbHVkZXMoJ21ldGEuZnVuY3Rpb24tY2FsbC5weXRob24nKSkge1xuICAgICAgICBpZiAodG9rZW4udmFsdWUgPT09ICdsb2NhbHMnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxpbmU6IGxpbmVOdW1iZXIsXG4gICAgICAgICAgICBjb2w6IG9mZnNldCxcbiAgICAgICAgICAgIGVuZENvbDogb2Zmc2V0ICsgdG9rZW4udmFsdWUubGVuZ3RoLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9mZnNldCArPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBsaW5lOiBsaW5lTnVtYmVyLFxuICAgIH07XG4gIH0sXG59O1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/linter-flake8/lib/rangeHelpers.js
