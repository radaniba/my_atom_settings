(function() {
  var manuallyIndented;

  manuallyIndented = new WeakSet();

  module.exports = {
    getIndentation: function(editor) {
      var indentationName, softTabs, tabLength;
      softTabs = editor.getSoftTabs();
      tabLength = editor.getTabLength();
      if (softTabs) {
        indentationName = tabLength + ' Spaces';
      } else {
        indentationName = 'Tabs (' + tabLength + ' wide)';
      }
      return indentationName;
    },
    getIndentations: function() {
      return atom.config.get("auto-detect-indentation.indentationTypes");
    },
    autoDetectIndentation: function(editor) {
      var firstSpaces, found, i, length, lineCount, numLinesWithSpaces, numLinesWithTabs, shortest, softTabs, spaceChars, tabLength, _i, _ref;
      lineCount = editor.getLineCount();
      shortest = 0;
      numLinesWithTabs = 0;
      numLinesWithSpaces = 0;
      found = false;
      for (i = _i = 0, _ref = lineCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!(i < 100 || !found)) {
          continue;
        }
        if (editor.isBufferRowCommented(i)) {
          continue;
        }
        firstSpaces = editor.lineTextForBufferRow(i).match(/^([ \t]+)[^ \t]/m);
        if (firstSpaces) {
          spaceChars = firstSpaces[1];
          if (spaceChars[0] === '\t') {
            numLinesWithTabs++;
          } else {
            length = spaceChars.length;
            if (length === 1) {
              continue;
            }
            numLinesWithSpaces++;
            if (length < shortest || shortest === 0) {
              shortest = length;
            }
          }
          found = true;
        }
      }
      softTabs = null;
      tabLength = null;
      if (found) {
        if (numLinesWithTabs > numLinesWithSpaces) {
          softTabs = false;
        } else {
          softTabs = true;
          tabLength = shortest;
        }
      }
      return {
        softTabs: softTabs,
        tabLength: tabLength
      };
    },
    setIndentation: function(editor, indentation, automatic) {
      if (automatic == null) {
        automatic = false;
      }
      if (!automatic) {
        manuallyIndented.add(editor);
      }
      if ("softTabs" in indentation && indentation.softTabs !== null) {
        editor.setSoftTabs(indentation.softTabs);
      } else {
        editor.setSoftTabs(atom.config.get("editor.softTabs", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
      }
      if ("tabLength" in indentation) {
        return editor.setTabLength(indentation.tabLength);
      } else {
        return editor.setTabLength(atom.config.get("editor.tabLength", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
      }
    },
    isManuallyIndented: function(editor) {
      return manuallyIndented.has(editor);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi9saWIvaW5kZW50YXRpb24tbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0JBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUF1QixJQUFBLE9BQUEsQ0FBQSxDQUF2QixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEsb0NBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQVgsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FEWixDQUFBO0FBRUEsTUFBQSxJQUFHLFFBQUg7QUFDRSxRQUFBLGVBQUEsR0FBa0IsU0FBQSxHQUFZLFNBQTlCLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxlQUFBLEdBQWtCLFFBQUEsR0FBVyxTQUFYLEdBQXVCLFFBQXpDLENBSEY7T0FGQTthQU1BLGdCQVBjO0lBQUEsQ0FBaEI7QUFBQSxJQVNBLGVBQUEsRUFBaUIsU0FBQSxHQUFBO2FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBDQUFoQixFQURlO0lBQUEsQ0FUakI7QUFBQSxJQVlBLHFCQUFBLEVBQXVCLFNBQUMsTUFBRCxHQUFBO0FBQ3JCLFVBQUEsbUlBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQVosQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLENBRFgsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsQ0FGbkIsQ0FBQTtBQUFBLE1BR0Esa0JBQUEsR0FBcUIsQ0FIckIsQ0FBQTtBQUFBLE1BSUEsS0FBQSxH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

//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/indentation-manager.coffee
