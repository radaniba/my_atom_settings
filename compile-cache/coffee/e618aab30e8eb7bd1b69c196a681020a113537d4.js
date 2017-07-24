(function() {
  var ColorContext, ColorScanner, registry;

  ColorScanner = require('../lib/color-scanner');

  ColorContext = require('../lib/color-context');

  registry = require('../lib/color-expressions');

  fdescribe('ColorScanner', function() {
    var editor, lastIndex, result, scanner, text, withScannerForString, withScannerForTextEditor, withTextEditor, _ref;
    _ref = [], scanner = _ref[0], editor = _ref[1], text = _ref[2], result = _ref[3], lastIndex = _ref[4];
    withScannerForString = function(string, block) {
      console.log('here');
      return describe("with '" + (string.replace(/#/g, '+')) + "'", function() {
        beforeEach(function() {
          var context;
          text = string;
          context = new ColorContext({
            registry: registry
          });
          return scanner = new ColorScanner({
            context: context
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    withTextEditor = function(fixture, block) {
      return describe("with " + fixture + " buffer", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open(fixture);
          });
          return runs(function() {
            editor = atom.workspace.getActiveTextEditor();
            return text = editor.getText();
          });
        });
        afterEach(function() {
          return editor = null;
        });
        return block();
      });
    };
    withScannerForTextEditor = function(fixture, block) {
      return withTextEditor(fixture, function() {
        beforeEach(function() {
          var context;
          context = new ColorContext({
            registry: registry
          });
          return scanner = new ColorScanner({
            context: context
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    return describe('::search', function() {
      withScannerForTextEditor('html-entities.html', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'html');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('css-color-with-prefix.less', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'less');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('four-variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([13, 17]);
          });
          it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
          it('stores the matched text', function() {
            return expect(result.match).toEqual('#fff');
          });
          it('stores the last index', function() {
            return expect(result.lastIndex).toEqual(17);
          });
          return it('stores match line', function() {
            return expect(result.line).toEqual(0);
          });
        });
        return describe('successive searches', function() {
          it('returns a buffer color for each match and then undefined', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            return expect(doSearch()).toBeUndefined();
          });
          return it('stores the line of successive matches', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch().line).toEqual(2);
            expect(doSearch().line).toEqual(4);
            return expect(doSearch().line).toEqual(6);
          });
        });
      });
      withScannerForTextEditor('class-after-color.sass', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'sass');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        return describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([15, 20]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
        });
      });
      withScannerForTextEditor('project/styles/variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        return describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([18, 25]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#BF616A');
          });
        });
      });
      withScannerForTextEditor('crlf.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([7, 11]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
        });
        return it('finds the second color', function() {
          var doSearch;
          doSearch = function() {
            return result = scanner.search(text, 'styl', result.lastIndex);
          };
          doSearch();
          return expect(result.color).toBeDefined();
        });
      });
      withScannerForTextEditor('color-in-tag-content.html', function() {
        return it('finds both colors', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          expect(doSearch()).toBeDefined();
          expect(doSearch()).toBeDefined();
          return expect(doSearch()).toBeUndefined();
        });
      });
      withScannerForString('#add-something {}, #acedbe-foo {}, #acedbeef-foo {}', function() {
        return it('does not find any matches', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          return expect(doSearch()).toBeUndefined();
        });
      });
      return withScannerForString('#add_something {}, #acedbe_foo {}, #acedbeef_foo {}', function() {
        return it('does not find any matches', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          return expect(doSearch()).toBeUndefined();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXNjYW5uZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0NBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxTQUFBLENBQVUsY0FBVixFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSw4R0FBQTtBQUFBLElBQUEsT0FBNkMsRUFBN0MsRUFBQyxpQkFBRCxFQUFVLGdCQUFWLEVBQWtCLGNBQWxCLEVBQXdCLGdCQUF4QixFQUFnQyxtQkFBaEMsQ0FBQTtBQUFBLElBRUEsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ3JCLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUEsQ0FBQTthQUNBLFFBQUEsQ0FBVSxRQUFBLEdBQU8sQ0FBQyxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUIsR0FBckIsQ0FBRCxDQUFQLEdBQWtDLEdBQTVDLEVBQWdELFNBQUEsR0FBQTtBQUM5QyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxjQUFBLE9BQUE7QUFBQSxVQUFBLElBQUEsR0FBTyxNQUFQLENBQUE7QUFBQSxVQUNBLE9BQUEsR0FBYyxJQUFBLFlBQUEsQ0FBYTtBQUFBLFlBQUMsVUFBQSxRQUFEO1dBQWIsQ0FEZCxDQUFBO2lCQUVBLE9BQUEsR0FBYyxJQUFBLFlBQUEsQ0FBYTtBQUFBLFlBQUMsU0FBQSxPQUFEO1dBQWIsRUFITDtRQUFBLENBQVgsQ0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-scanner-spec.coffee
