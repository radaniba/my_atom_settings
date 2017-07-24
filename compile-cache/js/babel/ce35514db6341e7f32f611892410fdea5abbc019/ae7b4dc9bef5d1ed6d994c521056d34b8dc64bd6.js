function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libPythonIndent = require("../lib/python-indent");

var _libPythonIndent2 = _interopRequireDefault(_libPythonIndent);

"use babel";

describe("python-indent", function () {
    var FILE_NAME = "fixture.py";
    var buffer = null;
    var editor = null;
    var pythonIndent = null;

    beforeEach(function () {
        waitsForPromise(function () {
            return atom.workspace.open(FILE_NAME).then(function (ed) {
                editor = ed;
                editor.setSoftTabs(true);
                editor.setTabLength(4);
                buffer = editor.buffer;
            });
        });

        waitsForPromise(function () {
            var packages = atom.packages.getAvailablePackageNames();
            var languagePackage = undefined;

            if (packages.indexOf("language-python") > -1) {
                languagePackage = "language-python";
            } else if (packages.indexOf("MagicPython") > -1) {
                languagePackage = "MagicPython";
            }

            return atom.packages.activatePackage(languagePackage);
        });

        waitsForPromise(function () {
            return atom.packages.activatePackage("python-indent").then(function () {
                pythonIndent = new _libPythonIndent2["default"]();
            });
        });
    });

    describe("package", function () {
        return it("loads python file and package", function () {
            expect(editor.getPath()).toContain(FILE_NAME);
            expect(atom.packages.isPackageActive("python-indent")).toBe(true);
        });
    });

    // Aligned with opening delimiter
    describe("aligned with opening delimiter", function () {
        describe("when indenting after newline", function () {
            /*
            def test(param_a, param_b, param_c,
                             param_d):
                    pass
            */
            it("indents after open def params", function () {
                editor.insertText("def test(param_a, param_b, param_c,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(9));
            });

            /*
            x = [0, 1, 2,
                     3, 4, 5]
            */
            it("indents after open bracket with multiple values on the first line", function () {
                editor.insertText("x = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = [0,
                     1]
            */
            it("indents after open bracket with one value on the first line", function () {
                editor.insertText("x = [0,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = [0, 1, 2, [3, 4, 5,
                                         6, 7, 8]]
            */
            it("indeents in nested lists when inner list is on the same line", function () {
                editor.insertText("x = [0, 1, 2, [3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(15));
            });

            /*
            x = [0, 1, 2,
                     [3, 4, 5,
                        6, 7, 8]]
            */
            it("indeents in nested lists when inner list is on a new line", function () {
                editor.insertText("x = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("[3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(6));
            });

            /*
            x = (0, 1, 2,
                     3, 4, 5)
            */
            it("indents after open tuple with multiple values on the first line", function () {
                editor.insertText("x = (0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = (0,
                     1)
            */
            it("indents after open tuple with one value on the first line", function () {
                editor.insertText("x = (0,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = (0, 1, 2, [3, 4, 5,
                                         6, 7, 8],
                     9, 10, 11)
            */
            it("indents in nested lists when inner list is on a new line", function () {
                editor.insertText("x = (0, 1, 2, [3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(15));

                editor.insertText("6, 7, 8],\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(5));
            });

            /*
            x = {0: 0, 1: 1,
                     2: 2, 3: 3}
            */
            it("indents dictionaries when multiple pairs are on the same line", function () {
                editor.insertText("x = {0: 0, 1: 1,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = {0: 0, 1: 1,
                     2: 2, 3: 3, 4: [4, 4,
                                                     4, 4]}
            */
            it("indents dictionaries with a list as a value", function () {
                editor.insertText("x = {0: 0, 1: 1,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("2: 2, 3: 3, 4: [4, 4,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(21));
            });

            /*
            s = "[ will this \"break ( the parsing?"
            */
            it("does not indent with delimiters that are quoted", function () {
                editor.insertText("s = \"[ will this \\\"break ( the parsing?\"\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
            x = ["here(\"(", "is", "a",
                     "list", "of", ["nested]",
                                                    "strings\\"],
                     r"some \[\"[of which are raw",
                     "and some of which are not"]
            */
            it("knows when to indent when some delimiters are literal, and some are not", function () {
                editor.insertText("x = [\"here(\\\"(\", \"is\", \"a\",\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("\"list\", \"of\", [\"nested]\",\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(20));

                editor.insertText("\"strings\\\\\"],\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(5));

                editor.insertText("r\"some \\[\\\"[of which are raw\",\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(5));
            });

            /*
            def test(param_a, param_b, param_c,
                             param_d):
                    pass
            */
            it("indents normally when delimiter is closed", function () {
                editor.insertText("def test(param_a, param_b, param_c):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            def test(param_a,
                             param_b,
                             param_c):
                    pass
            */
            it("keeps indentation on succeding open lines", function () {
                editor.insertText("def test(param_a,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(9));
            });

            /*
            class TheClass(object):
                    def test(param_a, param_b,
                                     param_c):
                            a_list = [1, 2, 3,
                                                4]
            */
            it("allows for fluid indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(param_a, param_b,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_c):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(8));

                editor.insertText("a_list = [1, 2, 3,\n");
                pythonIndent.properlyIndent();
                editor.insertText("4]\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(5)).toBe(" ".repeat(8));
            });

            /*
            def f(arg1, arg2, arg3,
                        arg4, arg5, arg6=")\)",
                        arg7=0):
                    return 0
            */
            it("indents properly when delimiters are an argument default string", function () {
                editor.insertText("def f(arg1, arg2, arg3,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(6));

                editor.insertText("arg4, arg5, arg6=\")\\)\",\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(6));

                editor.insertText("arg7=0):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            for i in range(10):
                    for j in range(20):
                            def f(x=[0,1,2,
                                             3,4,5]):
                                    return x * i * j
            */
            it("indents properly when blocks and lists are deeply nested", function () {
                editor.insertText("for i in range(10):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));

                editor.insertText("for j in range(20):\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(8));

                editor.insertText("def f(x=[0,1,2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(17));

                editor.insertText("3,4,5]):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(4)).toBe(" ".repeat(12));
            });

            /*
            """ quote with a single string delimiter: " """
            var_name = [0, 1, 2,
            */
            it("handles odd number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" quote with a single string delimiter: \" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            """ here is a triple quote with a two string delimiters: "" """
            var_name = [0, 1, 2,
            */
            it("handles even number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" a quote with a two string delimiters: \"\" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is "a triple quote" with three extra" string delimiters" ###
            var_name = [0, 1, 2,
            */
            it("handles three string delimiters spaced out inside triple quoted string", function () {
                editor.insertText("### here is \"a quote\" with extra\" string delimiters\" ###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### string with an \\"escaped delimiter in the middle###
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimieters at the end of a triple quoted string", function () {
                editor.insertText("### string with an \\\"escaped delimiter in the middle###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is a string with an escaped delimiter ending\\###"
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimiters at the end of a quoted string", function () {
                editor.insertText("### here is a string with an escaped delimiter ending\\###\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });
        });

        describe("when unindenting after newline :: aligned with opening delimiter", function () {
            /*
            def test(param_a,
                             param_b):
                    pass
            */
            it("unindents after close def params", function () {
                editor.insertText("def test(param_a,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_b):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            tup = (True, False,
                         False)
            */
            it("unindents after close tuple", function () {
                editor.insertText("tup = (True, False,\n");
                pythonIndent.properlyIndent();
                editor.insertText("False)\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_list = [1, 2,
                                3]
            */
            it("unindents after close bracket", function () {
                editor.insertText("a_list = [1, 2,\n");
                pythonIndent.properlyIndent();
                editor.insertText("3]\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_dict = {0: 0}
            */
            it("unindents after close curly brace", function () {
                editor.insertText("a_dict = {0: 0}\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });
    });

    // Hanging
    describe("hanging", function () {
        describe("when indenting after newline", function () {
            /*
            def test(
                    param_a
            )
            */
            it("hanging indents after open def params", function () {
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            tup = (
                    "elem"
            )
            */
            it("indents after open tuple", function () {
                editor.insertText("tup = (\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            a_list = [
                    "elem"
            ]
            */
            it("indents after open bracket", function () {
                editor.insertText("a_list = [\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            def test(
                    param_a,
                    param_b,
                    param_c
            )
            */
            it("indents on succeding open lines", function () {
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_a,\n");
                editor.autoIndentSelectedRows(2);
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(3);
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            class TheClass(object):
                    def test(
                            param_a, param_b,
                            param_c):
                            a_list = [
                                    "1", "2", "3",
                                    "4"
                            ]
            */
            it("allows for indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_a, param_b,\n");
                editor.autoIndentSelectedRows(3);
                editor.insertText("param_c):\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(4));

                editor.insertText("a_list = [\n");
                pythonIndent.properlyIndent();
                editor.insertText("\"1\", \"2\", \"3\",\n");
                editor.autoIndentSelectedRows(6);
                editor.insertText("\"4\"]\n");
                editor.autoIndentSelectedRows(7);
                expect(buffer.lineForRow(7)).toBe(" ".repeat(4));
            });
        });

        describe("when newline is in a comment", function () {
            /*
            x = [    #
                    0
            ]
            */
            it("indents when delimiter is not commented, but other characters are", function () {
                editor.insertText("x = [ #\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
             * [
             */
            it("does not indent when bracket delimiter is commented", function () {
                editor.insertText("# [\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * (
             */
            it("does not indent when parentheses delimiter is commented", function () {
                editor.insertText("# (\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * {
             */
            it("does not indent when brace delimiter is commented", function () {
                editor.insertText("# {\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * def f():
             */
            it("does not indent when function def is commented", function () {
                editor.insertText("# def f():\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });

        describe("when continuing a hanging indent after opening/closing bracket(s)", function () {
            /*
            alpha = (
                    epsilon(),
                    gamma
            )
            */
            it("continues correctly after bracket is opened and closed on same line", function () {
                editor.insertText("alpha = (\n");
                pythonIndent.properlyIndent();
                editor.insertText("epsilon(),\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            alpha = (
                    epsilon(arg1, arg2,
                                    arg3, arg4),
                    gamma
            )
            */
            it("continues after bracket is opened/closed on different lines", function () {
                editor.insertText("alpha = (\n");
                pythonIndent.properlyIndent();

                editor.insertText("epsilon(arg1, arg2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));

                editor.insertText("arg3, arg4),\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });
        });
    });

    describe("when source is malformed", function () {
        return(

            /*
            class DoesBadlyFormedCodeBreak )
            */
            it("does not throw error or indent when code is malformed", function () {
                editor.insertText("class DoesBadlyFormedCodeBreak )\n");
                expect(function () {
                    return pythonIndent.properlyIndent();
                }).not.toThrow();
                expect(buffer.lineForRow(1)).toBe("");
            })
        );
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9zcGVjL3B5dGhvbi1pbmRlbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzsrQkFDeUIsc0JBQXNCOzs7O0FBRC9DLFdBQVcsQ0FBQzs7QUFFWixRQUFRLENBQUMsZUFBZSxFQUFFLFlBQU07QUFDNUIsUUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDO0FBQy9CLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV4QixjQUFVLENBQUMsWUFBTTtBQUNiLHVCQUFlLENBQUM7bUJBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBRSxFQUFLO0FBQ3hDLHNCQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ1osc0JBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsc0JBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsc0JBQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2FBQzFCLENBQUM7U0FBQSxDQUNMLENBQUM7O0FBRUYsdUJBQWUsQ0FBQyxZQUFNO0FBQ2xCLGdCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDMUQsZ0JBQUksZUFBZSxZQUFBLENBQUM7O0FBRXBCLGdCQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUMxQywrQkFBZSxHQUFHLGlCQUFpQixDQUFDO2FBQ3ZDLE1BQU0sSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdDLCtCQUFlLEdBQUcsYUFBYSxDQUFDO2FBQ25DOztBQUVE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Q0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3BDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7O0FBRUgsWUFBUSxDQUFDLDBCQUEwQixFQUFFOzs7Ozs7QUFLakMsY0FBRSxDQUFDLHVEQUF1RCxFQUFFLFlBQU07QUFDOUQsc0JBQU0sQ0FBQyxVQUFVLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUN4RCxzQkFBTSxDQUFDOzJCQUFNLFlBQVksQ0FBQyxjQUFjLEVBQUU7aUJBQUEsQ0FBQyxDQUMxQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDZixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekMsQ0FBQzs7S0FBQSxDQUNMLENBQUM7Q0FDTCxDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L3NwZWMvcHl0aG9uLWluZGVudC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcbmltcG9ydCBQeXRob25JbmRlbnQgZnJvbSBcIi4uL2xpYi9weXRob24taW5kZW50XCI7XG5kZXNjcmliZShcInB5dGhvbi1pbmRlbnRcIiwgKCkgPT4ge1xuICAgIGNvbnN0IEZJTEVfTkFNRSA9IFwiZml4dHVyZS5weVwiO1xuICAgIGxldCBidWZmZXIgPSBudWxsO1xuICAgIGxldCBlZGl0b3IgPSBudWxsO1xuICAgIGxldCBweXRob25JbmRlbnQgPSBudWxsO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihGSUxFX05BTUUpLnRoZW4oKGVkKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yID0gZWQ7XG4gICAgICAgICAgICAgICAgZWRpdG9yLnNldFNvZnRUYWJzKHRydWUpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5zZXRUYWJMZW5ndGgoNCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyID0gZWRpdG9yLmJ1ZmZlcjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKTtcbiAgICAgICAgICAgIGxldCBsYW5ndWFnZVBhY2thZ2U7XG5cbiAgICAgICAgICAgIGlmIChwYWNrYWdlcy5pbmRleE9mKFwibGFuZ3VhZ2UtcHl0aG9uXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsYW5ndWFnZVBhY2thZ2UgPSBcImxhbmd1YWdlLXB5dGhvblwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYWNrYWdlcy5pbmRleE9mKFwiTWFnaWNQeXRob25cIikgPiAtMSkge1xuICAgICAgICAgICAgICAgIGxhbmd1YWdlUGFja2FnZSA9IFwiTWFnaWNQeXRob25cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGxhbmd1YWdlUGFja2FnZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJweXRob24taW5kZW50XCIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudCA9IG5ldyBQeXRob25JbmRlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShcInBhY2thZ2VcIiwgKCkgPT5cbiAgICAgICAgaXQoXCJsb2FkcyBweXRob24gZmlsZSBhbmQgcGFja2FnZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFBhdGgoKSkudG9Db250YWluKEZJTEVfTkFNRSk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoXCJweXRob24taW5kZW50XCIpKS50b0JlKHRydWUpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBbGlnbmVkIHdpdGggb3BlbmluZyBkZWxpbWl0ZXJcbiAgICBkZXNjcmliZShcImFsaWduZWQgd2l0aCBvcGVuaW5nIGRlbGltaXRlclwiLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBpbmRlbnRpbmcgYWZ0ZXIgbmV3bGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSwgcGFyYW1fYiwgcGFyYW1fYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fZCk6XG4gICAgICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiBkZWYgcGFyYW1zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsIHBhcmFtX2MsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoOSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gWzAsIDEsIDIsXG4gICAgICAgICAgICAgICAgICAgICAzLCA0LCA1XVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBhZnRlciBvcGVuIGJyYWNrZXQgd2l0aCBtdWx0aXBsZSB2YWx1ZXMgb24gdGhlIGZpcnN0IGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFswLFxuICAgICAgICAgICAgICAgICAgICAgMV1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiBicmFja2V0IHdpdGggb25lIHZhbHVlIG9uIHRoZSBmaXJzdCBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbMCxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg1KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSBbMCwgMSwgMiwgWzMsIDQsIDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDYsIDcsIDhdXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZWVudHMgaW4gbmVzdGVkIGxpc3RzIHdoZW4gaW5uZXIgbGlzdCBpcyBvbiB0aGUgc2FtZSBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbMCwgMSwgMiwgWzMsIDQsIDUsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoMTUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFswLCAxLCAyLFxuICAgICAgICAgICAgICAgICAgICAgWzMsIDQsIDUsXG4gICAgICAgICAgICAgICAgICAgICAgICA2LCA3LCA4XV1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVlbnRzIGluIG5lc3RlZCBsaXN0cyB3aGVuIGlubmVyIGxpc3QgaXMgb24gYSBuZXcgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gWzAsIDEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJbMywgNCwgNSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg2KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSAoMCwgMSwgMixcbiAgICAgICAgICAgICAgICAgICAgIDMsIDQsIDUpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gdHVwbGUgd2l0aCBtdWx0aXBsZSB2YWx1ZXMgb24gdGhlIGZpcnN0IGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9ICgwLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9ICgwLFxuICAgICAgICAgICAgICAgICAgICAgMSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiB0dXBsZSB3aXRoIG9uZSB2YWx1ZSBvbiB0aGUgZmlyc3QgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gKDAsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gKDAsIDEsIDIsIFszLCA0LCA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgICAgICAgICAgIDksIDEwLCAxMSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgaW4gbmVzdGVkIGxpc3RzIHdoZW4gaW5uZXIgbGlzdCBpcyBvbiBhIG5ldyBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSAoMCwgMSwgMiwgWzMsIDQsIDUsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoMTUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiNiwgNywgOF0sXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gezA6IDAsIDE6IDEsXG4gICAgICAgICAgICAgICAgICAgICAyOiAyLCAzOiAzfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBkaWN0aW9uYXJpZXMgd2hlbiBtdWx0aXBsZSBwYWlycyBhcmUgb24gdGhlIHNhbWUgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gezA6IDAsIDE6IDEsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gezA6IDAsIDE6IDEsXG4gICAgICAgICAgICAgICAgICAgICAyOiAyLCAzOiAzLCA0OiBbNCwgNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNCwgNF19XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGRpY3Rpb25hcmllcyB3aXRoIGEgbGlzdCBhcyBhIHZhbHVlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSB7MDogMCwgMTogMSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg1KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjI6IDIsIDM6IDMsIDQ6IFs0LCA0LFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDIxKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHMgPSBcIlsgd2lsbCB0aGlzIFxcXCJicmVhayAoIHRoZSBwYXJzaW5nP1wiXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJkb2VzIG5vdCBpbmRlbnQgd2l0aCBkZWxpbWl0ZXJzIHRoYXQgYXJlIHF1b3RlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJzID0gXFxcIlsgd2lsbCB0aGlzIFxcXFxcXFwiYnJlYWsgKCB0aGUgcGFyc2luZz9cXFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFtcImhlcmUoXFxcIihcIiwgXCJpc1wiLCBcImFcIixcbiAgICAgICAgICAgICAgICAgICAgIFwibGlzdFwiLCBcIm9mXCIsIFtcIm5lc3RlZF1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0cmluZ3NcXFxcXCJdLFxuICAgICAgICAgICAgICAgICAgICAgclwic29tZSBcXFtcXFwiW29mIHdoaWNoIGFyZSByYXdcIixcbiAgICAgICAgICAgICAgICAgICAgIFwiYW5kIHNvbWUgb2Ygd2hpY2ggYXJlIG5vdFwiXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwia25vd3Mgd2hlbiB0byBpbmRlbnQgd2hlbiBzb21lIGRlbGltaXRlcnMgYXJlIGxpdGVyYWwsIGFuZCBzb21lIGFyZSBub3RcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9IFtcXFwiaGVyZShcXFxcXFxcIihcXFwiLCBcXFwiaXNcXFwiLCBcXFwiYVxcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwibGlzdFxcXCIsIFxcXCJvZlxcXCIsIFtcXFwibmVzdGVkXVxcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMjApKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcInN0cmluZ3NcXFxcXFxcXFxcXCJdLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiclxcXCJzb21lIFxcXFxbXFxcXFxcXCJbb2Ygd2hpY2ggYXJlIHJhd1xcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg0KSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBkZWYgdGVzdChwYXJhbV9hLCBwYXJhbV9iLCBwYXJhbV9jLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9kKTpcbiAgICAgICAgICAgICAgICAgICAgcGFzc1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBub3JtYWxseSB3aGVuIGRlbGltaXRlciBpcyBjbG9zZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QocGFyYW1fYSwgcGFyYW1fYiwgcGFyYW1fYyk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBkZWYgdGVzdChwYXJhbV9hLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9iLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9jKTpcbiAgICAgICAgICAgICAgICAgICAgcGFzc1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwia2VlcHMgaW5kZW50YXRpb24gb24gc3VjY2VkaW5nIG9wZW4gbGluZXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QocGFyYW1fYSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9iLFxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDkpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgY2xhc3MgVGhlQ2xhc3Mob2JqZWN0KTpcbiAgICAgICAgICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSwgcGFyYW1fYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9jKTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhX2xpc3QgPSBbMSwgMiwgMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDRdXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJhbGxvd3MgZm9yIGZsdWlkIGluZGVudCBpbiBtdWx0aS1sZXZlbCBzaXR1YXRpb25zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDEpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QocGFyYW1fYSwgcGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9jKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg4KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfbGlzdCA9IFsxLCAyLCAzLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjRdXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg1KSkudG9CZShcIiBcIi5yZXBlYXQoOCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBkZWYgZihhcmcxLCBhcmcyLCBhcmczLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnNCwgYXJnNSwgYXJnNj1cIilcXClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZzc9MCk6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIHByb3Blcmx5IHdoZW4gZGVsaW1pdGVycyBhcmUgYW4gYXJndW1lbnQgZGVmYXVsdCBzdHJpbmdcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIGYoYXJnMSwgYXJnMiwgYXJnMyxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg2KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFyZzQsIGFyZzUsIGFyZzY9XFxcIilcXFxcKVxcXCIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNikpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhcmc3PTApOlxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZm9yIGkgaW4gcmFuZ2UoMTApOlxuICAgICAgICAgICAgICAgICAgICBmb3IgaiBpbiByYW5nZSgyMCk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmIGYoeD1bMCwxLDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzLDQsNV0pOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHggKiBpICogalxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBwcm9wZXJseSB3aGVuIGJsb2NrcyBhbmQgbGlzdHMgYXJlIGRlZXBseSBuZXN0ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZm9yIGkgaW4gcmFuZ2UoMTApOlxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZm9yIGogaW4gcmFuZ2UoMjApOlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDgpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIGYoeD1bMCwxLDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygzKSkudG9CZShcIiBcIi5yZXBlYXQoMTcpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiMyw0LDVdKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDQpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBcIlwiXCIgcXVvdGUgd2l0aCBhIHNpbmdsZSBzdHJpbmcgZGVsaW1pdGVyOiBcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhcl9uYW1lID0gWzAsIDEsIDIsXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJoYW5kbGVzIG9kZCBudW1iZXIgb2Ygc3RyaW5nIGRlbGltaXRlcnMgaW5zaWRlIHRyaXBsZSBxdW90ZWQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcXCJcXFwiXFxcIiBxdW90ZSB3aXRoIGEgc2luZ2xlIHN0cmluZyBkZWxpbWl0ZXI6IFxcXCIgXFxcIlxcXCJcXFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBcIlwiXCIgaGVyZSBpcyBhIHRyaXBsZSBxdW90ZSB3aXRoIGEgdHdvIHN0cmluZyBkZWxpbWl0ZXJzOiBcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMixcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImhhbmRsZXMgZXZlbiBudW1iZXIgb2Ygc3RyaW5nIGRlbGltaXRlcnMgaW5zaWRlIHRyaXBsZSBxdW90ZWQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcXCJcXFwiXFxcIiBhIHF1b3RlIHdpdGggYSB0d28gc3RyaW5nIGRlbGltaXRlcnM6IFxcXCJcXFwiIFxcXCJcXFwiXFxcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInZhcl9uYW1lID0gWzAsIDEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgIyMjIGhlcmUgaXMgXCJhIHRyaXBsZSBxdW90ZVwiIHdpdGggdGhyZWUgZXh0cmFcIiBzdHJpbmcgZGVsaW1pdGVyc1wiICMjI1xuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMixcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImhhbmRsZXMgdGhyZWUgc3RyaW5nIGRlbGltaXRlcnMgc3BhY2VkIG91dCBpbnNpZGUgdHJpcGxlIHF1b3RlZCBzdHJpbmdcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyMjIGhlcmUgaXMgXFxcImEgcXVvdGVcXFwiIHdpdGggZXh0cmFcXFwiIHN0cmluZyBkZWxpbWl0ZXJzXFxcIiAjIyNcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ2YXJfbmFtZSA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDEyKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICMjIyBzdHJpbmcgd2l0aCBhbiBcXFxcXCJlc2NhcGVkIGRlbGltaXRlciBpbiB0aGUgbWlkZGxlIyMjXG4gICAgICAgICAgICB2YXJfbmFtZSA9IFswLCAxLCAyLDtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImNvcnJlY3RseSBoYW5kbGVzIGVzY2FwZWQgZGVsaW1pZXRlcnMgYXQgdGhlIGVuZCBvZiBhIHRyaXBsZSBxdW90ZWQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMjIyBzdHJpbmcgd2l0aCBhbiBcXFxcXFxcImVzY2FwZWQgZGVsaW1pdGVyIGluIHRoZSBtaWRkbGUjIyNcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ2YXJfbmFtZSA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDEyKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICMjIyBoZXJlIGlzIGEgc3RyaW5nIHdpdGggYW4gZXNjYXBlZCBkZWxpbWl0ZXIgZW5kaW5nXFxcXCMjI1wiXG4gICAgICAgICAgICB2YXJfbmFtZSA9IFswLCAxLCAyLDtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImNvcnJlY3RseSBoYW5kbGVzIGVzY2FwZWQgZGVsaW1pdGVycyBhdCB0aGUgZW5kIG9mIGEgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIyMgaGVyZSBpcyBhIHN0cmluZyB3aXRoIGFuIGVzY2FwZWQgZGVsaW1pdGVyIGVuZGluZ1xcXFwjIyNcXFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiB1bmluZGVudGluZyBhZnRlciBuZXdsaW5lIDo6IGFsaWduZWQgd2l0aCBvcGVuaW5nIGRlbGltaXRlclwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYik6XG4gICAgICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcInVuaW5kZW50cyBhZnRlciBjbG9zZSBkZWYgcGFyYW1zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYik6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB0dXAgPSAoVHJ1ZSwgRmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgRmFsc2UpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJ1bmluZGVudHMgYWZ0ZXIgY2xvc2UgdHVwbGVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidHVwID0gKFRydWUsIEZhbHNlLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIkZhbHNlKVxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGFfbGlzdCA9IFsxLCAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwidW5pbmRlbnRzIGFmdGVyIGNsb3NlIGJyYWNrZXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYV9saXN0ID0gWzEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiM11cXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBhX2RpY3QgPSB7MDogMH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcInVuaW5kZW50cyBhZnRlciBjbG9zZSBjdXJseSBicmFjZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhX2RpY3QgPSB7MDogMH1cXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gSGFuZ2luZ1xuICAgIGRlc2NyaWJlKFwiaGFuZ2luZ1wiLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBpbmRlbnRpbmcgYWZ0ZXIgbmV3bGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtX2FcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImhhbmdpbmcgaW5kZW50cyBhZnRlciBvcGVuIGRlZiBwYXJhbXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB0dXAgPSAoXG4gICAgICAgICAgICAgICAgICAgIFwiZWxlbVwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gdHVwbGVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidHVwID0gKFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgYV9saXN0ID0gW1xuICAgICAgICAgICAgICAgICAgICBcImVsZW1cIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBhZnRlciBvcGVuIGJyYWNrZXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYV9saXN0ID0gW1xcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtX2EsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtX2IsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtX2NcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgb24gc3VjY2VkaW5nIG9wZW4gbGluZXNcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYSxcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9iLFxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygzKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgY2xhc3MgVGhlQ2xhc3Mob2JqZWN0KTpcbiAgICAgICAgICAgICAgICAgICAgZGVmIHRlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYSwgcGFyYW1fYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbV9jKTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhX2xpc3QgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjFcIiwgXCIyXCIsIFwiM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJhbGxvd3MgZm9yIGluZGVudCBpbiBtdWx0aS1sZXZlbCBzaXR1YXRpb25zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDEpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGVmIHRlc3QoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYSwgcGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMyk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwYXJhbV9jKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoNCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDQpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfbGlzdCA9IFtcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiMVxcXCIsIFxcXCIyXFxcIiwgXFxcIjNcXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cyg2KTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcXCI0XFxcIl1cXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoNyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDcpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzY3JpYmUoXCJ3aGVuIG5ld2xpbmUgaXMgaW4gYSBjb21tZW50XCIsICgpID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gWyAgICAjXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgd2hlbiBkZWxpbWl0ZXIgaXMgbm90IGNvbW1lbnRlZCwgYnV0IG90aGVyIGNoYXJhY3RlcnMgYXJlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbICNcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJkb2VzIG5vdCBpbmRlbnQgd2hlbiBicmFja2V0IGRlbGltaXRlciBpcyBjb21tZW50ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyBbXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogKFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImRvZXMgbm90IGluZGVudCB3aGVuIHBhcmVudGhlc2VzIGRlbGltaXRlciBpcyBjb21tZW50ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyAoXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICoge1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImRvZXMgbm90IGluZGVudCB3aGVuIGJyYWNlIGRlbGltaXRlciBpcyBjb21tZW50ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyB7XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogZGVmIGYoKTpcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJkb2VzIG5vdCBpbmRlbnQgd2hlbiBmdW5jdGlvbiBkZWYgaXMgY29tbWVudGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMgZGVmIGYoKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBjb250aW51aW5nIGEgaGFuZ2luZyBpbmRlbnQgYWZ0ZXIgb3BlbmluZy9jbG9zaW5nIGJyYWNrZXQocylcIiwgKCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGFscGhhID0gKFxuICAgICAgICAgICAgICAgICAgICBlcHNpbG9uKCksXG4gICAgICAgICAgICAgICAgICAgIGdhbW1hXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb250aW51ZXMgY29ycmVjdGx5IGFmdGVyIGJyYWNrZXQgaXMgb3BlbmVkIGFuZCBjbG9zZWQgb24gc2FtZSBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFscGhhID0gKFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImVwc2lsb24oKSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGFscGhhID0gKFxuICAgICAgICAgICAgICAgICAgICBlcHNpbG9uKGFyZzEsIGFyZzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmczLCBhcmc0KSxcbiAgICAgICAgICAgICAgICAgICAgZ2FtbWFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImNvbnRpbnVlcyBhZnRlciBicmFja2V0IGlzIG9wZW5lZC9jbG9zZWQgb24gZGlmZmVyZW50IGxpbmVzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFscGhhID0gKFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZXBzaWxvbihhcmcxLCBhcmcyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDEyKSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFyZzMsIGFyZzQpLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKFwid2hlbiBzb3VyY2UgaXMgbWFsZm9ybWVkXCIsICgpID0+XG5cbiAgICAgICAgLypcbiAgICAgICAgY2xhc3MgRG9lc0JhZGx5Rm9ybWVkQ29kZUJyZWFrIClcbiAgICAgICAgKi9cbiAgICAgICAgaXQoXCJkb2VzIG5vdCB0aHJvdyBlcnJvciBvciBpbmRlbnQgd2hlbiBjb2RlIGlzIG1hbGZvcm1lZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImNsYXNzIERvZXNCYWRseUZvcm1lZENvZGVCcmVhayApXFxuXCIpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpKVxuICAgICAgICAgICAgLm5vdC50b1Rocm93KCk7XG4gICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgIH0pXG4gICAgKTtcbn0pO1xuIl19
//# sourceURL=/Users/Rad/.atom/packages/python-indent/spec/python-indent-spec.js
