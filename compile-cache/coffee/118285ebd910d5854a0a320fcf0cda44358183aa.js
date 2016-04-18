(function() {
  var AutocompleteAwk;

  AutocompleteAwk = require('../lib/main');

  describe("AutocompleteAwk", function() {
    var editor, getCompletions, provider, _ref;
    _ref = [], editor = _ref[0], provider = _ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getKeywordCompletions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-awk');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-awk');
      });
      runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-awk').mainModule.getProvider();
      });
      waitsFor(function() {
        return Object.keys(provider.keywords).length > 0;
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.awk');
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    it("returns completions on text input", function() {
      editor.setText('');
      expect(getCompletions().length).toBe(0);
      editor.setText('B');
      return expect(getCompletions().length).toBeGreaterThan(0);
    });
    it("returns no completions in comment", function() {
      editor.setText('# B');
      editor.setCursorBufferPosition([0, 1]);
      return expect(getCompletions().length).toBe(0);
    });
    return it("returns no completions in string", function() {
      editor.setText('"B"');
      editor.setCursorBufferPosition([0, 1]);
      return expect(getCompletions().length).toBe(0);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtYXdrL3NwZWMvcHJvdmlkZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZUFBQTs7QUFBQSxFQUFBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLGFBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSxzQ0FBQTtBQUFBLElBQUEsT0FBcUIsRUFBckIsRUFBQyxnQkFBRCxFQUFTLGtCQUFULENBQUE7QUFBQSxJQUVBLGNBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxtQ0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsTUFBTSxDQUFDLHVDQUFQLENBQUEsQ0FEUixDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FGTixDQUFBO0FBQUEsTUFHQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUF0QixDQUhULENBQUE7QUFBQSxNQUlBLE9BQUEsR0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxRQUNBLGNBQUEsRUFBZ0IsR0FEaEI7QUFBQSxRQUVBLGVBQUEsRUFBaUIsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FGakI7QUFBQSxRQUdBLE1BQUEsRUFBUSxNQUhSO09BTEYsQ0FBQTthQVNBLFFBQVEsQ0FBQyxxQkFBVCxDQUErQixPQUEvQixFQVZlO0lBQUEsQ0FGakIsQ0FBQTtBQUFBLElBY0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBQUg7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGNBQTlCLEVBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7QUFBQSxNQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixrQkFBL0IsQ0FBa0QsQ0FBQyxVQUFVLENBQUMsV0FBOUQsQ0FBQSxFQURSO01BQUEsQ0FBTCxDQUhBLENBQUE7QUFBQSxNQU1BLFFBQUEsQ0FBUyxTQUFBLEdBQUE7ZUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxRQUFyQixDQUE4QixDQUFDLE1BQS9CLEdBQXdDLEVBQTNDO01BQUEsQ0FBVCxDQU5BLENBQUE7QUFBQSxNQU9BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBQUg7TUFBQSxDQUFoQixDQVBBLENBQUE7YUFRQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxFQUFaO01BQUEsQ0FBTCxFQVRTO0lBQUEsQ0FBWCxDQWRBLENBQUE7QUFBQSxJQXlCQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxFQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLGNBQUEsQ0FBQSxDQUFnQixDQUFDLE1BQXhCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsQ0FBckMsQ0FEQSxDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsT0FBUCxDQUFlLEdBQWYsQ0FIQSxDQUFBO2FBSUEsTUFBQSxDQUFPLGNBQUEsQ0FBQSxDQUFnQixDQUFDLE1BQXhCLENBQStCLENBQUMsZUFBaEMsQ0FBZ0QsQ0FBaEQsRUFMc0M7SUFBQSxDQUF4QyxDQXpCQSxDQUFBO0FBQUEsSUFnQ0EsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxNQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsS0FBZixDQUFBLENBQUE7QUFBQSxNQUVBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxjQUFBLENBQUEsQ0FBZ0IsQ0FBQyxNQUF4QixDQUErQixDQUFDLElBQWhDLENBQXFDLENBQXJDLEVBSnNDO0lBQUEsQ0FBeEMsQ0FoQ0EsQ0FBQTtXQXNDQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxLQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0IsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLGNBQUEsQ0FBQSxDQUFnQixDQUFDLE1BQXhCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsQ0FBckMsRUFKcUM7SUFBQSxDQUF2QyxFQXZDMEI7RUFBQSxDQUE1QixDQVBBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-awk/spec/provider-spec.coffee
