(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe('python-indent', function() {
    var FILE_NAME, buffer, editor, grammar, properlyIndent;
    properlyIndent = require('../lib/python-indent').properlyIndent;
    grammar = 'Python';
    FILE_NAME = 'fixture.py';
    editor = null;
    buffer = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open(FILE_NAME).then(function(ed) {
          editor = ed;
          editor.setSoftTabs(true);
          editor.setTabLength(4);
          return buffer = editor.buffer;
        });
      });
      waitsForPromise(function() {
        var languagePackage, packages;
        packages = atom.packages.getAvailablePackageNames();
        if (__indexOf.call(packages, 'language-python') >= 0) {
          languagePackage = 'language-python';
        } else if (__indexOf.call(packages, 'MagicPython') >= 0) {
          languagePackage = 'MagicPython';
        }
        return atom.packages.activatePackage(languagePackage);
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('python-indent');
      });
    });
    describe('package', function() {
      return it('loads python file and package', function() {
        expect(editor.getPath()).toContain(FILE_NAME);
        return expect(atom.packages.isPackageActive('python-indent')).toBe(true);
      });
    });
    describe('aligned with opening delimiter', function() {
      describe('when indenting after newline', function() {
        it('indents after open def params', function() {
          editor.insertText('def test(param_a, param_b, param_c,\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(9));
        });
        it('indents after open tuple', function() {
          editor.insertText('tup = (True, False,\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(7));
        });
        it('indents after open bracket', function() {
          editor.insertText('a_list = ["1", "2",\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(10));
        });
        it('does not do any special indentation when delimiter is closed', function() {
          editor.insertText('def test(param_a, param_b, param_c):\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        it('keeps indentation on succeding open lines', function() {
          editor.insertText('def test(param_a,\n');
          properlyIndent();
          editor.insertText('param_b,\n');
          editor.autoIndentSelectedRows(2);
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(9));
        });
        return it('allows for fluid indent in multi-level situations', function() {
          editor.insertText('class TheClass(object):\n');
          editor.autoIndentSelectedRows(1);
          editor.insertText('def test(param_a, param_b,\n');
          properlyIndent();
          editor.insertText('param_c):\n');
          properlyIndent();
          expect(buffer.lineForRow(3)).toBe(' '.repeat(8));
          editor.insertText('a_list = ["1", "2", "3",\n');
          properlyIndent();
          editor.insertText('"4"]\n');
          properlyIndent();
          return expect(buffer.lineForRow(5)).toBe(' '.repeat(8));
        });
      });
      return describe('when unindenting after newline :: aligned with opening delimiter', function() {
        it('unindents after close def params', function() {
          editor.insertText('def test(param_a,\n');
          properlyIndent();
          editor.insertText('param_b):\n');
          properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(4));
        });
        it('unindents after close tuple', function() {
          editor.insertText('tup = (True, False,\n');
          properlyIndent();
          editor.insertText('False)\n');
          properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
        return it('unindents after close bracket', function() {
          editor.insertText('a_list = ["1", "2",\n');
          properlyIndent();
          editor.insertText('"3"]\n');
          properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
      });
    });
    return describe('hanging', function() {
      return describe('when indenting after newline', function() {
        it('hanging indents after open def params', function() {
          editor.insertText('def test(\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indents after open tuple', function() {
          editor.insertText('tup = (\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indents after open bracket', function() {
          editor.insertText('a_list = [\n');
          properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indentation on succeding open lines', function() {
          editor.insertText('def test(\n');
          properlyIndent();
          editor.insertText('param_a,\n');
          editor.autoIndentSelectedRows(2);
          editor.insertText('param_b,\n');
          editor.autoIndentSelectedRows(3);
          return expect(buffer.lineForRow(3)).toBe(' '.repeat(4));
        });
        return it('allows for indent in multi-level situations', function() {
          editor.insertText('class TheClass(object):\n');
          editor.autoIndentSelectedRows(1);
          editor.insertText('def test(\n');
          properlyIndent();
          editor.insertText('param_a, param_b,\n');
          editor.autoIndentSelectedRows(3);
          editor.insertText('param_c):\n');
          editor.autoIndentSelectedRows(4);
          expect(buffer.lineForRow(4)).toBe(' '.repeat(4));
          editor.insertText('a_list = [\n');
          properlyIndent();
          editor.insertText('"1", "2", "3",\n');
          editor.autoIndentSelectedRows(6);
          editor.insertText('"4"]\n');
          editor.autoIndentSelectedRows(7);
          return expect(buffer.lineForRow(7)).toBe(' '.repeat(4));
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L3NwZWMvcHl0aG9uLWluZGVudC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLGtEQUFBO0FBQUEsSUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLFFBRFYsQ0FBQTtBQUFBLElBRUEsU0FBQSxHQUFZLFlBRlosQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBSFQsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFTLElBSlQsQ0FBQTtBQUFBLElBTUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLEVBQUQsR0FBQTtBQUNsQyxVQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLElBQW5CLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBcEIsQ0FGQSxDQUFBO2lCQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FMa0I7UUFBQSxDQUFwQyxFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNaLFlBQUEseUJBQUE7QUFBQSxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FBWCxDQUFBO0FBRUEsUUFBQSxJQUFHLGVBQXFCLFFBQXJCLEVB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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/spec/python-indent-spec.coffee