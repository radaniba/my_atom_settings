(function() {
  var packagesToTest;

  packagesToTest = {
    Python: {
      name: 'language-python',
      file: 'test.py'
    }
  };

  describe('Python autocompletions', function() {
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
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-python');
      });
      return runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-python').mainModule.getProvider();
      });
    });
    return Object.keys(packagesToTest).forEach(function(packageLabel) {
      return describe("" + packageLabel + " files", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(packagesToTest[packageLabel].name);
          });
          waitsForPromise(function() {
            return atom.workspace.open(packagesToTest[packageLabel].file);
          });
          return runs(function() {
            return editor = atom.workspace.getActiveTextEditor();
          });
        });
        it('autocompletes builtins', function() {
          var completions;
          editor.setText('isinstanc');
          editor.setCursorBufferPosition([1, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              var completion, _i, _len;
              for (_i = 0, _len = completions.length; _i < _len; _i++) {
                completion = completions[_i];
                expect(completion.text.length).toBeGreaterThan(0);
                expect(completion.text).toBe('isinstance');
              }
              return expect(completions.length).toBe(1);
            });
          });
        });
        it('autocompletes python keywords', function() {
          var completions;
          editor.setText('impo');
          editor.setCursorBufferPosition([1, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              var completion, _i, _len;
              for (_i = 0, _len = completions.length; _i < _len; _i++) {
                completion = completions[_i];
                if (completion.type === 'keyword') {
                  expect(completion.text).toBe('import');
                }
                expect(completion.text.length).toBeGreaterThan(0);
              }
              console.log(completions);
              return expect(completions.length).toBe(3);
            });
          });
        });
        return it('autocompletes defined functions', function() {
          var completions;
          editor.setText("def hello_world():\n  return True\nhell");
          editor.setCursorBufferPosition([3, 0]);
          completions = getCompletions();
          return waitsForPromise(function() {
            return getCompletions().then(function(completions) {
              expect(completions[0].text).toBe('hello_world');
              return expect(completions.length).toBe(1);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL3NwZWMvcHJvdmlkZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLGNBQUEsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0saUJBQU47QUFBQSxNQUNBLElBQUEsRUFBTSxTQUROO0tBREY7R0FERixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxRQUFBLHNDQUFBO0FBQUEsSUFBQSxPQUFxQixFQUFyQixFQUFDLGdCQUFELEVBQVMsa0JBQVQsQ0FBQTtBQUFBLElBRUEsY0FBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLG1DQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsdUNBQVAsQ0FBQSxDQURSLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUZOLENBQUE7QUFBQSxNQUdBLE1BQUEsR0FBUyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXRCLENBSFQsQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFFBQ0EsY0FBQSxFQUFnQixHQURoQjtBQUFBLFFBRUEsZUFBQSxFQUFpQixNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUZqQjtBQUFBLFFBR0EsTUFBQSxFQUFRLE1BSFI7T0FMRixDQUFBO2FBU0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEIsRUFWZTtJQUFBLENBRmpCLENBQUE7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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/spec/provider-spec.coffee
