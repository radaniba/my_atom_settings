(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    activate: function(state) {
      this.disposables = new CompositeDisposable;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this._handleLoad(editor);
        };
      })(this)));
    },
    _handleLoad: function(editor) {
      this._loadSettingsForEditor(editor);
      return this.disposables.add(editor.buffer.onDidSave((function(_this) {
        return function() {
          return _this._loadSettingsForEditor(editor);
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    _loadSettingsForEditor: function(editor) {
      var firstSpaces, found, i, length, lineCount, numLinesWithSpaces, numLinesWithTabs, shortest, spaceChars, _i, _ref;
      lineCount = editor.getLineCount();
      shortest = 0;
      numLinesWithTabs = 0;
      numLinesWithSpaces = 0;
      found = false;
      for (i = _i = 0, _ref = lineCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!(i < 100 || !found)) {
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
      if (found) {
        if (numLinesWithTabs > numLinesWithSpaces) {
          editor.setSoftTabs(false);
          return editor.setTabLength(atom.config.get("editor.tabLength", {
            scope: editor.getRootScopeDescriptor().scopes
          }));
        } else {
          editor.setSoftTabs(true);
          return editor.setTabLength(shortest);
        }
      } else {
        editor.setSoftTabs(atom.config.get("editor.softTabs", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
        return editor.setTabLength(atom.config.get("editor.tabLength", {
          scope: editor.getRootScopeDescriptor().scopes
        }));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ2pELEtBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWpCLEVBRlE7SUFBQSxDQUFWO0FBQUEsSUFLQSxXQUFBLEVBQWEsU0FBQyxNQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixNQUF4QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFkLENBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3ZDLEtBQUMsQ0FBQSxzQkFBRCxDQUF3QixNQUF4QixFQUR1QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBQWpCLEVBRlc7SUFBQSxDQUxiO0FBQUEsSUFVQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsRUFEVTtJQUFBLENBVlo7QUFBQSxJQWFBLHNCQUFBLEVBQXdCLFNBQUMsTUFBRCxHQUFBO0FBQ3RCLFVBQUEsOEdBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQVosQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLENBRFgsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsQ0FGbkIsQ0FBQTtBQUFBLE1BR0Esa0JBQUEsR0FBcUIsQ0FIckIsQ0FBQTtBQUFBLE1BSUEsS0FBQSxHQUFRLEtBSlIsQ0FBQTtBQU9BLFdBQVMsa0dBQVQsR0FBQTtjQUFnQyxDQUFBLEdBQUksR0FBSixJQUFXLENBQUE7O1NBS3pDO0FBQUEsUUFBQSxXQUFBLEdBQWMsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQTVCLENBQThCLENBQUMsS0FBL0IsQ0FBcUMsa0JBQXJDLENBQWQsQ0FBQTtBQUVBLFFBQUEsSUFBRyxXQUFIO0FBQ0UsVUFBQSxVQUFBLEdBQWEsV0FBWSxDQUFBLENBQUEsQ0FBekIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxVQUFXLENBQUEsQ0FBQSxDQUFYLEtBQWlCLElBQXBCO0FBQ0UsWUFBQSxnQkFBQSxFQUFBLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxNQUFBLEdBQVMsVUFBVSxDQUFDLE1BQXBCLENBQUE7QUFHQSxZQUFBLElBQVksTUFBQSxLQUFVLENBQXRCO0FBQUEsdUJBQUE7YUFIQTtBQUFBLFlBS0Esa0JBQUEsRUFMQSxDQUFBO0FBT0EsWUFBQSxJQUFxQixNQUFBLEdBQVMsUUFBVCxJQUFxQixRQUFBLEtBQVksQ0FBdEQ7QUFBQSxjQUFBLFFBQUEsR0FBVyxNQUFYLENBQUE7YUFWRjtXQUZBO0FBQUEsVUFjQSxLQUFBLEdBQVEsSUFkUixDQURGO1NBUEY7QUFBQSxPQVBBO0FBK0JBLE1BQUEsSUFBRyxLQUFIO0FBQ0UsUUFBQSxJQUFHLGdCQUFBLEdBQW1CLGtCQUF0QjtBQUNFLFVBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsS0FBbkIsQ0FBQSxDQUFBO2lCQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0M7QUFBQSxZQUFBLEtBQUEsRUFBTyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUErQixDQUFDLE1BQXZDO1dBQXBDLENBQXBCLEVBRkY7U0FBQSxNQUFBO0FBSUUsVUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixJQUFuQixDQUFBLENBQUE7aUJBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsUUFBcEIsRUFMRjtTQURGO09BQUEsTUFBQTtBQVFJLFFBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQStCLENBQUMsTUFBdkM7U0FBbkMsQ0FBbkIsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQStCLENBQUMsTUFBdkM7U0FBcEMsQ0FBcEIsRUFUSjtPQWhDc0I7SUFBQSxDQWJ4QjtHQUhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/auto-detect-indentation.coffee