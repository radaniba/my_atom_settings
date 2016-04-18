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
      var _ref;
      this._loadSettingsForEditor(editor);
      this.disposables.add(editor.buffer.onDidSave((function(_this) {
        return function() {
          return _this._loadSettingsForEditor(editor);
        };
      })(this)));
      if ((_ref = editor.displayBuffer) != null ? _ref.onDidTokenize : void 0) {
        return this.disposables.add(editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this._loadSettingsForEditor(editor);
          };
        })(this)));
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi9saWIvYXV0by1kZXRlY3QtaW5kZW50YXRpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ2pELEtBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWpCLEVBRlE7SUFBQSxDQUFWO0FBQUEsSUFLQSxXQUFBLEVBQWEsU0FBQyxNQUFELEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixNQUF4QixDQUFBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWQsQ0FBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDdkMsS0FBQyxDQUFBLHNCQUFELENBQXdCLE1BQXhCLEVBRHVDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsQ0FBakIsQ0FGQSxDQUFBO0FBS0EsTUFBQSxnREFBdUIsQ0FBRSxzQkFBekI7ZUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxhQUFyQixDQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDbEQsS0FBQyxDQUFBLHNCQUFELENBQXdCLE1BQXhCLEVBRGtEO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsQ0FBakIsRUFERjtPQU5XO0lBQUEsQ0FMYjtBQUFBLElBZUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBRFU7SUFBQSxDQWZaO0FBQUEsSUFrQkEsc0JBQUEsRUFBd0IsU0FBQyxNQUFELEdBQUE7QUFDdEIsVUFBQSw4R0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBWixDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsQ0FEWCxDQUFBO0FBQUEsTUFFQSxnQkFBQSxHQUFtQixDQUZuQixDQUFBO0FBQUEsTUFHQSxrQkFBQSxHQUFxQixDQUhyQixDQUFBO0FBQUEsTUFJQSxLQUFBLEdBQVEsS0FKUixDQUFBO0FBT0EsV0FBUyxrR0FBVCxHQUFBO2NBQWdDLENBQUEsR0FBSSxHQUFKLElBQVcsQ0FBQTs7U0FHekM7QUFBQSxRQUFBLElBQVksTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQTVCLENBQVo7QUFBQSxtQkFBQTtTQUFBO0FBQUEsUUFFQSxXQUFBLEdBQWMsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQTVCLENBQThCLENBQUMsS0FBL0IsQ0FBcUMsa0JBQXJDLENBRmQsQ0FBQTtBQUlBLFFBQUEsSUFBRyxXQUFIO0FBQ0UsVUFBQSxVQUFBLEdBQWEsV0FBWSxDQUFBLENBQUEsQ0FBekIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxVQUFXLENBQUEsQ0FBQSxDQUFYLEtBQWlCLElBQXBCO0FBQ0UsWUFBQSxnQkFBQSxFQUFBLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxNQUFBLEdBQVMsVUFBVSxDQUFDLE1BQXBCLENBQUE7QUFHQSxZQUFBLElBQVksTUFBQSxLQUFVLENBQXRCO0FBQUEsdUJBQUE7YUFIQTtBQUFBLFlBS0Esa0JBQUEsRUFMQSxDQUFBO0FBT0EsWUFBQSxJQUFxQixNQUFBLEdBQVMsUUFBVCxJQUFxQixRQUFBLEtBQVksQ0FBdEQ7QUFBQSxjQUFBLFFBQUEsR0FBVyxNQUFYLENBQUE7YUFWRjtXQUZBO0FBQUEsVUFjQSxLQUFBLEdBQVEsSUFkUixDQURGO1NBUEY7QUFBQSxPQVBBO0FBK0JBLE1BQUEsSUFBRyxLQUFIO0FBQ0UsUUFBQSxJQUFHLGdCQUFBLEdBQW1CLGtCQUF0QjtBQUNFLFVBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsS0FBbkIsQ0FBQSxDQUFBO2lCQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0M7QUFBQSxZQUFBLEtBQUEsRUFBTyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUErQixDQUFDLE1BQXZDO1dBQXBDLENBQXBCLEVBRkY7U0FBQSxNQUFBO0FBSUUsVUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixJQUFuQixDQUFBLENBQUE7aUJBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsUUFBcEIsRUFMRjtTQURGO09BQUEsTUFBQTtBQVFJLFFBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQStCLENBQUMsTUFBdkM7U0FBbkMsQ0FBbkIsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQStCLENBQUMsTUFBdkM7U0FBcEMsQ0FBcEIsRUFUSjtPQWhDc0I7SUFBQSxDQWxCeEI7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/auto-detect-indentation.coffee
