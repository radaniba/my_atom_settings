(function() {
  var VariableScanner, path, registry, scopeFromFileName;

  path = require('path');

  VariableScanner = require('../lib/variable-scanner');

  registry = require('../lib/variable-expressions');

  scopeFromFileName = require('../lib/scope-from-file-name');

  describe('VariableScanner', function() {
    var editor, scanner, scope, text, withScannerForTextEditor, withTextEditor, _ref;
    _ref = [], scanner = _ref[0], editor = _ref[1], text = _ref[2], scope = _ref[3];
    withTextEditor = function(fixture, block) {
      return describe("with " + fixture + " buffer", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open(fixture);
          });
          return runs(function() {
            editor = atom.workspace.getActiveTextEditor();
            text = editor.getText();
            return scope = scopeFromFileName(editor.getPath());
          });
        });
        afterEach(function() {
          editor = null;
          return scope = null;
        });
        return block();
      });
    };
    withScannerForTextEditor = function(fixture, block) {
      return withTextEditor(fixture, function() {
        beforeEach(function() {
          return scanner = new VariableScanner({
            registry: registry,
            scope: scope
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    return describe('::search', function() {
      var result;
      result = [][0];
      withScannerForTextEditor('four-variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text);
        });
        it('returns the first match', function() {
          return expect(result).toBeDefined();
        });
        describe('the result object', function() {
          it('has a match string', function() {
            return expect(result.match).toEqual('base-color = #fff');
          });
          it('has a lastIndex property', function() {
            return expect(result.lastIndex).toEqual(17);
          });
          it('has a range property', function() {
            return expect(result.range).toEqual([0, 17]);
          });
          return it('has a variable result', function() {
            expect(result[0].name).toEqual('base-color');
            expect(result[0].value).toEqual('#fff');
            expect(result[0].range).toEqual([0, 17]);
            return expect(result[0].line).toEqual(0);
          });
        });
        describe('the second result object', function() {
          beforeEach(function() {
            return result = scanner.search(text, result.lastIndex);
          });
          it('has a match string', function() {
            return expect(result.match).toEqual('other-color = transparentize(base-color, 50%)');
          });
          it('has a lastIndex property', function() {
            return expect(result.lastIndex).toEqual(64);
          });
          it('has a range property', function() {
            return expect(result.range).toEqual([19, 64]);
          });
          return it('has a variable result', function() {
            expect(result[0].name).toEqual('other-color');
            expect(result[0].value).toEqual('transparentize(base-color, 50%)');
            expect(result[0].range).toEqual([19, 64]);
            return expect(result[0].line).toEqual(2);
          });
        });
        return describe('successive searches', function() {
          return it('returns a result for each match and then undefined', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, result.lastIndex);
            };
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            return expect(doSearch()).toBeUndefined();
          });
        });
      });
      withScannerForTextEditor('incomplete-stylus-hash.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text);
        });
        return it('does not find any variables', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('variables-in-arguments.scss', function() {
        beforeEach(function() {
          return result = scanner.search(text);
        });
        return it('does not find any variables', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('attribute-selectors.scss', function() {
        beforeEach(function() {
          return result = scanner.search(text);
        });
        return it('does not find any variables', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('variables-in-conditions.scss', function() {
        beforeEach(function() {
          var doSearch;
          result = null;
          doSearch = function() {
            return result = scanner.search(text, result != null ? result.lastIndex : void 0);
          };
          doSearch();
          return doSearch();
        });
        return it('does not find the variable in the if clause', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('variables-after-mixins.scss', function() {
        beforeEach(function() {
          var doSearch;
          result = null;
          doSearch = function() {
            return result = scanner.search(text, result != null ? result.lastIndex : void 0);
          };
          return doSearch();
        });
        return it('finds the variable after the mixin', function() {
          return expect(result).toBeDefined();
        });
      });
      withScannerForTextEditor('variables-from-other-process.less', function() {
        beforeEach(function() {
          var doSearch;
          result = null;
          doSearch = function() {
            return result = scanner.search(text, result != null ? result.lastIndex : void 0);
          };
          return doSearch();
        });
        return it('finds the variable with an interpolation tag', function() {
          return expect(result).toBeDefined();
        });
      });
      return withScannerForTextEditor('crlf.styl', function() {
        beforeEach(function() {
          var doSearch;
          result = null;
          doSearch = function() {
            return result = scanner.search(text, result != null ? result.lastIndex : void 0);
          };
          doSearch();
          return doSearch();
        });
        return it('finds all the variables even with crlf mode', function() {
          return expect(result).toBeDefined();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3ZhcmlhYmxlLXNjYW5uZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FEbEIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDZCQUFSLENBSHBCLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsNEVBQUE7QUFBQSxJQUFBLE9BQWlDLEVBQWpDLEVBQUMsaUJBQUQsRUFBVSxnQkFBVixFQUFrQixjQUFsQixFQUF3QixlQUF4QixDQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWlCLFNBQUMsT0FBRCxFQUFVLEtBQVYsR0FBQTthQUNmLFFBQUEsQ0FBVSxPQUFBLEdBQU8sT0FBUCxHQUFlLFNBQXpCLEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO21CQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixPQUFwQixFQUFIO1VBQUEsQ0FBaEIsQ0FBQSxDQUFBO2lCQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxZQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsWUFDQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQURQLENBQUE7bUJBRUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/variable-scanner-spec.coffee
