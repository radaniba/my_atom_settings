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
        'def test(param_a, param_b, param_c,\n         param_d):\n    pass';
        it('indents after open def params', function() {
          editor.insertText('def test(param_a, param_b, param_c,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(9));
        });
        'x = [0, 1, 2,\n     3, 4, 5]';
        it('indents after open bracket with multiple values on the first line', function() {
          editor.insertText('x = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
        });
        'x = [0,\n     1]';
        it('indents after open bracket with one value on the first line', function() {
          editor.insertText('x = [0,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
        });
        'x = [0, 1, 2, [3, 4, 5,\n               6, 7, 8]]';
        it('indeents in nested lists when inner list is on the same line', function() {
          editor.insertText('x = [0, 1, 2, [3, 4, 5,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(15));
        });
        'x = [0, 1, 2,\n     [3, 4, 5,\n      6, 7, 8]]';
        it('indeents in nested lists when inner list is on a new line', function() {
          editor.insertText('x = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
          editor.insertText('[3, 4, 5,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(6));
        });
        'x = (0, 1, 2,\n     3, 4, 5)';
        it('indents after open tuple with multiple values on the first line', function() {
          editor.insertText('x = (0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
        });
        'x = (0,\n     1)';
        it('indents after open tuple with one value on the first line', function() {
          editor.insertText('x = (0,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
        });
        'x = (0, 1, 2, [3, 4, 5,\n               6, 7, 8],\n     9, 10, 11)';
        it('indents in nested lists when inner list is on a new line and a different type', function() {
          editor.insertText('x = (0, 1, 2, [3, 4, 5,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(15));
          editor.insertText('6, 7, 8],\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(5));
        });
        'x = {0: 0, 1: 1,\n     2: 2, 3: 3}';
        it('indents dictionaries when multiple pairs are on the same line', function() {
          editor.insertText('x = {0: 0, 1: 1,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
        });
        'x = {0: 0, 1: 1,\n     2: 2, 3: 3, 4: [4, 4,\n                     4, 4]}';
        it('indents dictionaries with a list as a value', function() {
          editor.insertText('x = {0: 0, 1: 1,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
          editor.insertText('2: 2, 3: 3, 4: [4, 4,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(21));
        });
        's = \'[ will this \'break \( the parsing?\'';
        it('does not indent with delimiters that are quoted', function() {
          editor.insertText('s = \'[ will this \\\'break \( the parsing?\'\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        'x = [\'here(\'(\', \'is\', \'a\',\n     \'list\', \'of\', [\'nested]\',\n                    \'strings\\\'],\n     r\'some \[\'[of which are raw\',\n     \'and some of which are not\']';
        it('knows when to indent when some delimiters are literal, and some are not', function() {
          editor.insertText('x = [\'here(\\\'(\', \'is\', \'a\',\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(5));
          editor.insertText('\'list\', \'of\', [\'nested]\',\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(2)).toBe(' '.repeat(20));
          editor.insertText('\'strings\\\\\'],\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(3)).toBe(' '.repeat(5));
          editor.insertText('r\'some \\[\\\'[of which are raw\',\n');
          editor.autoIndentSelectedRows(4);
          return expect(buffer.lineForRow(4)).toBe(' '.repeat(5));
        });
        'def test(param_a, param_b, param_c,\n         param_d):\n    pass';
        it('indents normally when delimiter is closed', function() {
          editor.insertText('def test(param_a, param_b, param_c):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        'def test(param_a,\n         param_b,\n         param_c):\n    pass';
        it('keeps indentation on succeding open lines', function() {
          editor.insertText('def test(param_a,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_b,\n');
          editor.autoIndentSelectedRows(2);
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(9));
        });
        'class TheClass(object):\n    def test(param_a, param_b,\n             param_c):\n        a_list = [1, 2, 3,\n                  4]';
        it('allows for fluid indent in multi-level situations', function() {
          editor.insertText('class TheClass(object):\n');
          editor.autoIndentSelectedRows(1);
          editor.insertText('def test(param_a, param_b,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_c):\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(3)).toBe(' '.repeat(8));
          editor.insertText('a_list = [1, 2, 3,\n');
          pythonIndent.properlyIndent();
          editor.insertText('4]\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(5)).toBe(' '.repeat(8));
        });
        'def f(arg1, arg2, arg3,\n      arg4, arg5, arg6=\')\)\',\n      arg7=0):\n    return 0';
        it('indents properly when delimiters are an argument default string', function() {
          editor.insertText('def f(arg1, arg2, arg3,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(6));
          editor.insertText('arg4, arg5, arg6=\')\\)\',\n');
          editor.autoIndentSelectedRows(2);
          expect(buffer.lineForRow(2)).toBe(' '.repeat(6));
          editor.insertText('arg7=0):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(3)).toBe(' '.repeat(4));
        });
        'for i in range(10):\n    for j in range(20):\n        def f(x=[0,1,2,\n                 3,4,5]):\n            return x * i * j';
        it('indents properly when blocks and lists are deeply nested', function() {
          editor.insertText('for i in range(10):\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
          editor.insertText('for j in range(20):\n');
          editor.autoIndentSelectedRows(2);
          expect(buffer.lineForRow(2)).toBe(' '.repeat(8));
          editor.insertText('def f(x=[0,1,2,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(3)).toBe(' '.repeat(17));
          editor.insertText('3,4,5]):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(4)).toBe(' '.repeat(12));
        });
        '""" here is a triple quote with a single string delimiter: " """\nvar_name = [0, 1, 2,';
        it('correctly handles odd number of string delimiters inside triple quoted string', function() {
          editor.insertText('""" here is a triple quote with a single string delimiter: " """\n');
          editor.insertText('var_name = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
        });
        '""" here is a triple quote with a two string delimiters: "" """\nvar_name = [0, 1, 2,';
        it('correctly handles even number of string delimiters inside triple quoted string', function() {
          editor.insertText('""" here is a triple quote with a two string delimiters: "" """\n');
          editor.insertText('var_name = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
        });
        "''' here is 'a triple quote' with three extra' string delimiters' '''\nvar_name = [0, 1, 2,";
        it('correctly handles three string delimiters spaced out inside triple quoted string', function() {
          editor.insertText("''' here is 'a triple quote' with three extra' string delimiters' '''\n");
          editor.insertText('var_name = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
        });
        "''' here is a string with an \\'escaped delimiter in the middle'''\nvar_name = [0, 1, 2,";
        it('correctly handles escaped delimieters at the end of a triple quoted string', function() {
          editor.insertText("''' here is a string with an \\'escaped delimiter in the middle'''\n");
          editor.insertText('var_name = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
        });
        "''' here is a string with an escaped delimiter at the end\\''''\nvar_name = [0, 1, 2,";
        return it('correctly handles escaped delimieters at the end of a triple quoted string', function() {
          editor.insertText("''' here is a string with an escaped delimiter at the end\\''''\n");
          editor.insertText('var_name = [0, 1, 2,\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
        });
      });
      return describe('when unindenting after newline :: aligned with opening delimiter', function() {
        'def test(param_a,\n         param_b):\n    pass';
        it('unindents after close def params', function() {
          editor.insertText('def test(param_a,\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_b):\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(4));
        });
        'tup = (True, False,\n       False)';
        it('unindents after close tuple', function() {
          editor.insertText('tup = (True, False,\n');
          pythonIndent.properlyIndent();
          editor.insertText('False)\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
        'a_list = [1, 2,\n          3]';
        it('unindents after close bracket', function() {
          editor.insertText('a_list = [1, 2,\n');
          pythonIndent.properlyIndent();
          editor.insertText('3]\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe('');
        });
        'a_dict = {0: 0}';
        return it('unindents after close curly brace', function() {
          editor.insertText('a_dict = {0: 0}\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
      });
    });
    describe('hanging', function() {
      describe('when indenting after newline', function() {
        'def test(\n    param_a\n)';
        it('hanging indents after open def params', function() {
          editor.insertText('def test(\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        'tup = (\n    "elem"\n)';
        it('indents after open tuple', function() {
          editor.insertText('tup = (\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        'a_list = [\n    "elem"\n]';
        it('indents after open bracket', function() {
          editor.insertText('a_list = [\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        'def test(\n    param_a,\n    param_b,\n    param_c\n)';
        it('indents on succeding open lines', function() {
          editor.insertText('def test(\n');
          pythonIndent.properlyIndent();
          editor.insertText('param_a,\n');
          editor.autoIndentSelectedRows(2);
          editor.insertText('param_b,\n');
          editor.autoIndentSelectedRows(3);
          return expect(buffer.lineForRow(3)).toBe(' '.repeat(4));
        });
        'class TheClass(object):\n    def test(\n        param_a, param_b,\n        param_c):\n        a_list = [\n            "1", "2", "3",\n            "4"\n        ]';
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
      describe('when newline is in a comment', function() {
        'x = [  #\n    0\n]';
        it('indents when delimiter is not commented, but other characters are', function() {
          editor.insertText('x = [ #\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe(' '.repeat(4));
        });
        '# [';
        it('does not indent when bracket delimiter is commented', function() {
          editor.insertText('# [\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        '# (';
        it('does not indent when parentheses delimiter is commented', function() {
          editor.insertText('# (\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        '# {';
        it('does not indent when brace delimiter is commented', function() {
          editor.insertText('# {\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
        '# def f():';
        return it('does not indent when function def is commented', function() {
          editor.insertText('# def f():\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(1)).toBe('');
        });
      });
      return describe('when continuing a hanging indent after opening and closing bracket(s)', function() {
        'alpha = (\n    epsilon(),\n    gamma\n)';
        it('continues correctly after bracket is opened and closed on same line', function() {
          editor.insertText('alpha = (\n');
          pythonIndent.properlyIndent();
          editor.insertText('epsilon(),\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(2)).toBe(' '.repeat(4));
        });
        'alpha = (\n    epsilon(arg1, arg2,\n            arg3, arg4),\n    gamma\n)';
        return it('continues correctly after bracket is opened and closed on different lines', function() {
          editor.insertText('alpha = (\n');
          pythonIndent.properlyIndent();
          editor.insertText('epsilon(arg1, arg2,\n');
          pythonIndent.properlyIndent();
          expect(buffer.lineForRow(2)).toBe(' '.repeat(12));
          editor.insertText('arg3, arg4),\n');
          pythonIndent.properlyIndent();
          return expect(buffer.lineForRow(3)).toBe(' '.repeat(4));
        });
      });
    });
    return describe('when source is malformed', function() {
      'class DoesBadlyFormedCodeBreak )';
      return it('does not throw error or indent when code is malformed', function() {
        editor.insertText('class DoesBadlyFormedCodeBreak )\n');
        expect(function() {
          return pythonIndent.properlyIndent();
        }).not.toThrow();
        return expect(buffer.lineForRow(1)).toBe('');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L3NwZWMvcHl0aG9uLWluZGVudC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTtBQUFBLElBQ0EsT0FBQSxHQUFVLFFBRFYsQ0FBQTtBQUFBLElBRUEsU0FBQSxHQUFZLFlBRlosQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBSFQsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFTLElBSlQsQ0FBQTtBQUFBLElBS0EsWUFBQSxHQUFlLElBTGYsQ0FBQTtBQUFBLElBT0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLEVBQUQsR0FBQTtBQUNsQyxVQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLElBQW5CLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBcEIsQ0FGQSxDQUFBO2lCQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FMa0I7UUFBQSxDQUFwQyxFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNaLFlBQUEseUJBQUE7QUFBQSxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FBWCxDQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/python-indent/spec/python-indent-spec.coffee
