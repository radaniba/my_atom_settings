(function() {
  var Subscriber;

  Subscriber = require('emissary').Subscriber;

  module.exports = {
    activate: function(state) {
      return this.subscribe(atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this._handleLoad(editor);
        };
      })(this)));
    },
    _handleLoad: function(editor) {
      this._loadSettingsForEditor(editor);
      return this.subscribe(editor.buffer, 'saved', (function(_this) {
        return function() {
          return _this._loadSettingsForEditor(editor);
        };
      })(this));
    },
    deactivate: function() {
      return this.unsubscribe();
    },
    _loadSettingsForEditor: function(editor) {
      var firstSpaces, found, i, lineCount, numLinesWithSpaces, numLinesWithTabs, shortest, spaceChars, _i, _ref;
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
        firstSpaces = editor.lineForBufferRow(i).match(/^([ \t]+)./m);
        if (firstSpaces) {
          found = true;
          spaceChars = firstSpaces[1];
          if (spaceChars[0] === '\t') {
            numLinesWithTabs++;
          } else {
            numLinesWithSpaces++;
            if (spaceChars.length < shortest || shortest <= 1) {
              shortest = spaceChars.length;
            }
          }
        }
      }
      if (found) {
        if (numLinesWithTabs > numLinesWithSpaces) {
          editor.setSoftTabs(false);
          return editor.setTabLength(atom.config.get("editor.tabLength"));
        } else {
          editor.setSoftTabs(true);
          return editor.setTabLength(shortest);
        }
      }
    }
  };

  Subscriber.extend(module.exports);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNuQyxLQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFEbUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUFYLEVBRFE7SUFBQSxDQUFWO0FBQUEsSUFJQSxXQUFBLEVBQWEsU0FBQyxNQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixNQUF4QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQU0sQ0FBQyxNQUFsQixFQUEwQixPQUExQixFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNqQyxLQUFDLENBQUEsc0JBQUQsQ0FBd0IsTUFBeEIsRUFEaUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQyxFQUZXO0lBQUEsQ0FKYjtBQUFBLElBU0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxXQUFELENBQUEsRUFEVTtJQUFBLENBVFo7QUFBQSxJQVlBLHNCQUFBLEVBQXdCLFNBQUMsTUFBRCxHQUFBO0FBQ3RCLFVBQUEsc0dBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQVosQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLENBRFgsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsQ0FGbkIsQ0FBQTtBQUFBLE1BR0Esa0JBQUEsR0FBcUIsQ0FIckIsQ0FBQTtBQUFBLE1BSUEsS0FBQSxHQUFRLEtBSlIsQ0FBQTtBQU9BLFdBQVMsa0dBQVQsR0FBQTtjQUFnQyxDQUFBLEdBQUksR0FBSixJQUFXLENBQUE7O1NBR3pDO0FBQUEsUUFBQSxJQUFZLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUE1QixDQUFaO0FBQUEsbUJBQUE7U0FBQTtBQUFBLFFBQ0EsV0FBQSxHQUFjLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixDQUF4QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLGFBQWpDLENBRGQsQ0FBQTtBQUVBLFFBQUEsSUFBRyxXQUFIO0FBQ0UsVUFBQSxLQUFBLEdBQVEsSUFBUixDQUFBO0FBQUEsVUFDQSxVQUFBLEdBQWEsV0FBWSxDQUFBLENBQUEsQ0FEekIsQ0FBQTtBQUdBLFVBQUEsSUFBRyxVQUFXLENBQUEsQ0FBQSxDQUFYLEtBQWlCLElBQXBCO0FBQ0UsWUFBQSxnQkFBQSxFQUFBLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxrQkFBQSxFQUFBLENBQUE7QUFJQSxZQUFBLElBQWdDLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLFFBQXBCLElBQWdDLFFBQUEsSUFBWSxDQUE1RTtBQUFBLGNBQUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxNQUF0QixDQUFBO2FBUEY7V0FKRjtTQUxGO0FBQUEsT0FQQTtBQTBCQSxNQUFBLElBQUcsS0FBSDtBQUNFLFFBQUEsSUFBRyxnQkFBQSxHQUFtQixrQkFBdEI7QUFDRSxVQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLEtBQW5CLENBQUEsQ0FBQTtpQkFDQSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQXBCLEVBRkY7U0FBQSxNQUFBO0FBSUUsVUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixJQUFuQixDQUFBLENBQUE7aUJBQ0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsUUFBcEIsRUFMRjtTQURGO09BM0JzQjtJQUFBLENBWnhCO0dBSEYsQ0FBQTs7QUFBQSxFQWtEQSxVQUFVLENBQUMsTUFBWCxDQUFrQixNQUFNLENBQUMsT0FBekIsQ0FsREEsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/auto-detect-indentation.coffee