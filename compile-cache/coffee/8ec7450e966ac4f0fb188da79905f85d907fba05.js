(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe('python-indent', function() {
    var FILE_NAME, PythonIndent, buffer, editor, grammar, pythonIndent;
    PythonIndent = require('../lib/python-indent');
    grammar = 'Python';
    FILE_NAME = 'fixture.py';
    editor = null;
    buffer = null;
    pythonIndent = null;
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
        return atom.packages.activatePackage('python-indent').then(function() {
          return pythonIndent = new PythonIndent();
        });
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
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(9));
        });
        it('indents after open tuple', function() {
          editor.insertText('tup = (True, False,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(7));
        });
        it('indents after open bracket', function() {
          editor.insertText('a_list = ["1", "2",\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(10));
        });
        it('does not do any special indentation when delimiter is closed', function() {
          editor.insertText('def test(param_a, param_b, param_c):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        it('keeps indentation on succeding open lines', function() {
          editor.insertText('def test(param_a,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_b,\n');
          editor.autoIndentSelectedRows(2);
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(9));
        });
        return it('allows for fluid indent in multi-level situations', function() {
          editor.insertText('class TheClass(object):\n');
          editor.autoIndentSelectedRows(1);
          editor.insertText('def test(param_a, param_b,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_c):\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(3)).toBe(' '.repeat(8));
          editor.insertText('a_list = ["1", "2", "3",\n');
          pythonIndent.properlyIndent();
          editor.insertText('"4"]\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(5)).toBe(' '.repeat(8));
        });
      });
      return describe('when unindenting after newline :: aligned with opening delimiter', function() {
        it('unindents after close def params', function() {
          editor.insertText('def test(param_a,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_b):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(4));
        });
        it('unindents after close tuple', function() {
          editor.insertText('tup = (True, False,\n');
          pythonIndent.properlyIndent();
          editor.insertText('False)\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
        return it('unindents after close bracket', function() {
          editor.insertText('a_list = ["1", "2",\n');
          pythonIndent.properlyIndent();
          editor.insertText('"3"]\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
      });
    });
    return describe('hanging', function() {
      return describe('when indenting after newline', function() {
        it('hanging indents after open def params', function() {
          editor.insertText('def test(\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indents after open tuple', function() {
          editor.insertText('tup = (\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indents after open bracket', function() {
          editor.insertText('a_list = [\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        it('indentation on succeding open lines', function() {
          editor.insertText('def test(\n');
          pythonIndent.properlyIndent();
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
          pythonIndent.properlyIndent();
          editor.insertText('param_a, param_b,\n');
          editor.autoIndentSelectedRows(3);
          editor.insertText('param_c):\n');
          editor.autoIndentSelectedRows(4);
          expect(buffer.lineForRow(4)).toBe(' '.repeat(4));
          editor.insertText('a_list = [\n');
          pythonIndent.properlyIndent();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L3NwZWMvcHl0aG9uLWluZGVudC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLFFBRFYsQ0FBQTtBQUFBLElBRUEsU0FBQSxHQUFZLFlBRlosQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBSFQsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFTLElBSlQsQ0FBQTtBQUFBLElBS0EsWUFBQSxHQUFlLElBTGYsQ0FBQTtBQUFBLElBT0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLEVBQUQsR0FBQTtBQUNsQyxVQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLElBQW5CLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBcEIsQ0FGQSxDQUFBO2lCQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FMa0I7UUFBQSxDQUFwQyxFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNaLFlBQUEseUJBQUE7QUFBQSxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FBWCxDQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/spec/python-indent-spec.coffee
