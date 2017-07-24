"use babel";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PythonIndent = (function () {
    function PythonIndent() {
        _classCallCheck(this, PythonIndent);
    }

    _createClass(PythonIndent, [{
        key: "indent",
        value: function indent() {
            this.editor = atom.workspace.getActiveTextEditor();

            // Make sure this is a Python file
            if (this.editor.getGrammar().scopeName.substring(0, 13) !== "source.python") {
                return;
            }

            // Get base variables
            var row = this.editor.getCursorBufferPosition().row;
            var col = this.editor.getCursorBufferPosition().column;

            // Parse the entire file up to the current point, keeping track of brackets
            var lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split("\n");
            // At this point, the newline character has just been added,
            // so remove the last element of lines, which will be the empty line
            lines = lines.splice(0, lines.length - 1);

            var parseOutput = PythonIndent.parseLines(lines);
            // openBracketStack: A stack of [row, col] pairs describing where open brackets are
            // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
            //  here the last bracket to be closed was opened and closed.
            // shouldHang: A stack containing the row number where each bracket was closed.
            // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
            var openBracketStack = parseOutput.openBracketStack;
            var lastClosedRow = parseOutput.lastClosedRow;
            var shouldHang = parseOutput.shouldHang;
            var lastColonRow = parseOutput.lastColonRow;

            if (shouldHang) {
                this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
                return;
            }

            if (!(openBracketStack.length || lastClosedRow.length && openBracketStack)) {
                return;
            }

            if (!openBracketStack.length) {
                // Can assume lastClosedRow is not empty
                if (lastClosedRow[1] === row - 1) {
                    // We just closed a bracket on the row, get indentation from the
                    // row where it was opened
                    var indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);

                    if (lastColonRow === row - 1) {
                        // We just finished def/for/if/elif/else/try/except etc. block,
                        // need to increase indent level by 1.
                        indentLevel += 1;
                    }
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                }
                return;
            }

            // Get tab length for context
            var tabLength = this.editor.getTabLength();

            var lastOpenBracketLocations = openBracketStack.pop();

            // Get some booleans to help work through the cases

            // haveClosedBracket is true if we have ever closed a bracket
            var haveClosedBracket = lastClosedRow.length;
            // justOpenedBracket is true if we opened a bracket on the row we just finished
            var justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
            // justClosedBracket is true if we closed a bracket on the row we just finished
            var justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
            // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
            // it is true if the most recently closed bracket pair was opened on
            // a line AFTER the line where the current open bracket
            var closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
            var indentColumn = undefined;

            if (!justOpenedBracket && !justClosedBracket) {
                // The bracket was opened before the previous line,
                // and we did not close a bracket on the previous line.
                // Thus, nothing has happened that could have changed the
                // indentation level since the previous line, so
                // we should use whatever indent we are given.
                return;
            } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
                // A bracket that was opened after the most recent open
                // bracket was closed on the line we just finished typing.
                // We should use whatever indent was used on the row
                // where we opened the bracket we just closed. This needs
                // to be handled as a separate case from the last case below
                // in case the current bracket is using a hanging indent.
                // This handles cases such as
                // x = [0, 1, 2,
                //      [3, 4, 5,
                //       6, 7, 8],
                //      9, 10, 11]
                // which would be correctly handled by the case below, but it also correctly handles
                // x = [
                //     0, 1, 2, [3, 4, 5,
                //               6, 7, 8],
                //     9, 10, 11
                // ]
                // which the last case below would incorrectly indent an extra space
                // before the "9", because it would try to match it up with the
                // open bracket instead of using the hanging indent.
                var previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
                indentColumn = previousIndent * tabLength;
            } else {
                // lastOpenBracketLocations[1] is the column where the bracket was,
                // so need to bump up the indentation by one
                indentColumn = lastOpenBracketLocations[1] + 1;
            }

            // Calculate soft-tabs from spaces (can have remainder)
            var tabs = indentColumn / tabLength;
            var rem = (tabs - Math.floor(tabs)) * tabLength;

            // If there's a remainder, `@editor.buildIndentString` requires the tab to
            // be set past the desired indentation level, thus the ceiling.
            tabs = rem > 0 ? Math.ceil(tabs) : tabs;

            // Offset is the number of spaces to subtract from the soft-tabs if they
            // are past the desired indentation (not divisible by tab length).
            var offset = rem > 0 ? tabLength - rem : 0;

            // I'm glad Atom has an optional `column` param to subtract spaces from
            // soft-tabs, though I don't see it used anywhere in the core.
            // It looks like for hard tabs, the "tabs" input can be fractional and
            // the "column" input is ignored...?
            var indent = this.editor.buildIndentString(tabs, offset);

            // The range of text to replace with our indent
            // will need to change this for hard tabs, especially tricky for when
            // hard tabs have mixture of tabs + spaces, which they can judging from
            // the editor.buildIndentString function
            var startRange = [row, 0];
            var stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
            this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
        }
    }, {
        key: "indentHanging",
        value: function indentHanging(row) {
            // Indent at the current block level plus the setting amount (1 or 2)
            var indent = this.editor.indentationForBufferRow(row) + atom.config.get("python-indent.hangingIndentTabs");

            // Set the indent
            this.editor.setIndentationForBufferRow(row, indent);
        }
    }], [{
        key: "parseLines",
        value: function parseLines(lines) {
            // openBracketStack is an array of [row, col] indicating the location
            // of the opening bracket (square, curly, or parentheses)
            var openBracketStack = [];
            // lastClosedRow is either empty or [rowOpen, rowClose] describing the
            // rows where the latest closed bracket was opened and closed.
            var lastClosedRow = [];
            // If we are in a string, this tells us what character introduced the string
            // i.e., did this string start with ' or with "?
            var stringDelimiter = null;
            // This is the row of the last function definition
            var lastColonRow = NaN;
            // true if we are in a triple quoted string
            var inTripleQuotedString = false;
            // If we have seen two of the same string delimiters in a row,
            // then we have to check the next character to see if it matches
            // in order to correctly parse triple quoted strings.
            var checkNextCharForString = false;
            // true if we should have a hanging indent, false otherwise
            var shouldHang = false;

            // NOTE: this parsing will only be correct if the python code is well-formed
            // statements like "[0, (1, 2])" might break the parsing

            // loop over each line
            var linesLength = lines.length;
            for (var row = 0; row < linesLength; row += 1) {
                var line = lines[row];

                // Keep track of the number of consecutive string delimiter's we've seen
                // in this line; this is used to tell if we are in a triple quoted string
                var numConsecutiveStringDelimiters = 0;
                // boolean, whether or not the current character is being escaped
                // applicable when we are currently in a string
                var isEscaped = false;

                // This is the last defined def/for/if/elif/else/try/except row
                var lastlastColonRow = lastColonRow;
                var lineLength = line.length;
                for (var col = 0; col < lineLength; col += 1) {
                    var c = line[col];

                    if (c === stringDelimiter && !isEscaped) {
                        numConsecutiveStringDelimiters += 1;
                    } else if (checkNextCharForString) {
                        numConsecutiveStringDelimiters = 0;
                        stringDelimiter = null;
                    } else {
                        numConsecutiveStringDelimiters = 0;
                    }

                    checkNextCharForString = false;

                    // If stringDelimiter is set, then we are in a string
                    // Note that this works correctly even for triple quoted strings
                    if (stringDelimiter) {
                        if (isEscaped) {
                            // If current character is escaped, then we do not care what it was,
                            // but since it is impossible for the next character to be escaped as well,
                            // go ahead and set that to false
                            isEscaped = false;
                        } else if (c === stringDelimiter) {
                            // We are seeing the same quote that started the string, i.e. ' or "
                            if (inTripleQuotedString) {
                                if (numConsecutiveStringDelimiters === 3) {
                                    // Breaking out of the triple quoted string...
                                    numConsecutiveStringDelimiters = 0;
                                    stringDelimiter = null;
                                    inTripleQuotedString = false;
                                }
                            } else if (numConsecutiveStringDelimiters === 3) {
                                // reset the count, correctly handles cases like ''''''
                                numConsecutiveStringDelimiters = 0;
                                inTripleQuotedString = true;
                            } else if (numConsecutiveStringDelimiters === 2) {
                                // We are not currently in a triple quoted string, and we've
                                // seen two of the same string delimiter in a row. This could
                                // either be an empty string, i.e. '' or "", or it could be
                                // the start of a triple quoted string. We will check the next
                                // character, and if it matches then we know we're in a triple
                                // quoted string, and if it does not match we know we're not
                                // in a string any more (i.e. it was the empty string).
                                checkNextCharForString = true;
                            } else if (numConsecutiveStringDelimiters === 1) {
                                // We are not in a string that is not triple quoted, and we've
                                // just seen an un-escaped instance of that string delimiter.
                                // In other words, we've left the string.
                                // It is also worth noting that it is impossible for
                                // numConsecutiveStringDelimiters to be 0 at this point, so
                                // this set of if/else if statements covers all cases.
                                stringDelimiter = null;
                            }
                        } else if (c === "\\") {
                            // We are seeing an unescaped backslash, the next character is escaped.
                            // Note that this is not exactly true in raw strings, HOWEVER, in raw
                            // strings you can still escape the quote mark by using a backslash.
                            // Since that's all we really care about as far as escaped characters
                            // go, we can assume we are now escaping the next character.
                            isEscaped = true;
                        }
                    } else if ("[({".includes(c)) {
                        openBracketStack.push([row, col]);
                        // If the only characters after this opening bracket are whitespace,
                        // then we should do a hanging indent. If there are other non-whitespace
                        // characters after this, then they will set the shouldHang boolean to false
                        shouldHang = true;
                    } else if (" \t\r\n".includes(c)) {// just in case there's a new line
                        // If it's whitespace, we don't care at all
                        // this check is necessary so we don't set shouldHang to false even if
                        // someone e.g. just entered a space between the opening bracket and the
                        // newline.
                    } else if (c === "#") {
                            // This check goes as well to make sure we don't set shouldHang
                            // to false in similar circumstances as described in the whitespace section.
                            break;
                        } else {
                            // We've already skipped if the character was white-space, an opening
                            // bracket, or a new line, so that means the current character is not
                            // whitespace and not an opening bracket, so shouldHang needs to get set to
                            // false.
                            shouldHang = false;

                            // Similar to above, we've already skipped all irrelevant characters,
                            // so if we saw a colon earlier in this line, then we would have
                            // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                            // block when it was actually a dictionary being defined, reset the
                            // lastColonRow variable to whatever it was when we started parsing this
                            // line.
                            lastColonRow = lastlastColonRow;

                            if (c === ":") {
                                lastColonRow = row;
                            } else if ("})]".includes(c) && openBracketStack.length) {
                                // The .pop() will take the element off of the openBracketStack as it
                                // adds it to the array for lastClosedRow.
                                lastClosedRow = [openBracketStack.pop()[0], row];
                            } else if ("'\"".includes(c)) {
                                // Starting a string, keep track of what quote was used to start it.
                                stringDelimiter = c;
                                numConsecutiveStringDelimiters += 1;
                            }
                        }
                }
            }
            return { openBracketStack: openBracketStack, lastClosedRow: lastClosedRow, shouldHang: shouldHang, lastColonRow: lastColonRow };
        }
    }]);

    return PythonIndent;
})();

exports["default"] = PythonIndent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvcHl0aG9uLWluZGVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxZQUFZO2FBQVosWUFBWTs4QkFBWixZQUFZOzs7aUJBQVosWUFBWTs7ZUFFdkIsa0JBQUc7QUFDTCxnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7OztBQUduRCxnQkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLGVBQWUsRUFBRTtBQUN6RSx1QkFBTzthQUNWOzs7QUFHRCxnQkFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN0RCxnQkFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE1BQU0sQ0FBQzs7O0FBR3pELGdCQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBRy9FLGlCQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFMUMsZ0JBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7OztnQkFNM0MsZ0JBQWdCLEdBQThDLFdBQVcsQ0FBekUsZ0JBQWdCO2dCQUFFLGFBQWEsR0FBK0IsV0FBVyxDQUF2RCxhQUFhO2dCQUFFLFVBQVUs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LEVBQWIsYUFBYSxFQUFFLFVBQVUsRUFBVixVQUFVLEVBQUUsWUFBWSxFQUFaLFlBQVksRUFBRSxDQUFDO1NBQ3hFOzs7V0ExUmdCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvcHl0aG9uLWluZGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB5dGhvbkluZGVudCB7XG5cbiAgICBpbmRlbnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIGEgUHl0aG9uIGZpbGVcbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuc3Vic3RyaW5nKDAsIDEzKSAhPT0gXCJzb3VyY2UucHl0aG9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBiYXNlIHZhcmlhYmxlc1xuICAgICAgICBjb25zdCByb3cgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdztcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5jb2x1bW47XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVudGlyZSBmaWxlIHVwIHRvIHRoZSBjdXJyZW50IHBvaW50LCBrZWVwaW5nIHRyYWNrIG9mIGJyYWNrZXRzXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwgMF0sIFtyb3csIGNvbF1dKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIG5ld2xpbmUgY2hhcmFjdGVyIGhhcyBqdXN0IGJlZW4gYWRkZWQsXG4gICAgICAgIC8vIHNvIHJlbW92ZSB0aGUgbGFzdCBlbGVtZW50IG9mIGxpbmVzLCB3aGljaCB3aWxsIGJlIHRoZSBlbXB0eSBsaW5lXG4gICAgICAgIGxpbmVzID0gbGluZXMuc3BsaWNlKDAsIGxpbmVzLmxlbmd0aCAtIDEpO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlT3V0cHV0ID0gUHl0aG9uSW5kZW50LnBhcnNlTGluZXMobGluZXMpO1xuICAgICAgICAvLyBvcGVuQnJhY2tldFN0YWNrOiBBIHN0YWNrIG9mIFtyb3csIGNvbF0gcGFpcnMgZGVzY3JpYmluZyB3aGVyZSBvcGVuIGJyYWNrZXRzIGFyZVxuICAgICAgICAvLyBsYXN0Q2xvc2VkUm93OiBFaXRoZXIgZW1wdHksIG9yIGFuIGFycmF5IFtyb3dPcGVuLCByb3dDbG9zZV0gZGVzY3JpYmluZyB0aGUgcm93c1xuICAgICAgICAvLyAgaGVyZSB0aGUgbGFzdCBicmFja2V0IHRvIGJlIGNsb3NlZCB3YXMgb3BlbmVkIGFuZCBjbG9zZWQuXG4gICAgICAgIC8vIHNob3VsZEhhbmc6IEEgc3RhY2sgY29udGFpbmluZyB0aGUgcm93IG51bWJlciB3aGVyZSBlYWNoIGJyYWNrZXQgd2FzIGNsb3NlZC5cbiAgICAgICAgLy8gbGFzdENvbG9uUm93OiBUaGUgbGFzdCByb3cgYSBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0IGV0Yy4gYmxvY2sgc3RhcnRlZFxuICAgICAgICBjb25zdCB7IG9wZW5CcmFja2V0U3RhY2ssIGxhc3RDbG9zZWRSb3csIHNob3VsZEhhbmcsIGxhc3RDb2xvblJvdyB9ID0gcGFyc2VPdXRwdXQ7XG5cbiAgICAgICAgaWYgKHNob3VsZEhhbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50SGFuZ2luZyhyb3csIHRoaXMuZWRpdG9yLmJ1ZmZlci5saW5lRm9yUm93KHJvdyAtIDEpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKG9wZW5CcmFja2V0U3RhY2subGVuZ3RoIHx8IChsYXN0Q2xvc2VkUm93Lmxlbmd0aCAmJiBvcGVuQnJhY2tldFN0YWNrKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb3BlbkJyYWNrZXRTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIENhbiBhc3N1bWUgbGFzdENsb3NlZFJvdyBpcyBub3QgZW1wdHlcbiAgICAgICAgICAgIGlmIChsYXN0Q2xvc2VkUm93WzFdID09PSByb3cgLSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UganVzdCBjbG9zZWQgYSBicmFja2V0IG9uIHRoZSByb3csIGdldCBpbmRlbnRhdGlvbiBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIHJvdyB3aGVyZSBpdCB3YXMgb3BlbmVkXG4gICAgICAgICAgICAgICAgbGV0IGluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cobGFzdENsb3NlZFJvd1swXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdENvbG9uUm93ID09PSByb3cgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgZmluaXNoZWQgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCBldGMuIGJsb2NrLFxuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIGluZGVudCBsZXZlbCBieSAxLlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudExldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0YWIgbGVuZ3RoIGZvciBjb250ZXh0XG4gICAgICAgIGNvbnN0IHRhYkxlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRhYkxlbmd0aCgpO1xuXG4gICAgICAgIGNvbnN0IGxhc3RPcGVuQnJhY2tldExvY2F0aW9ucyA9IG9wZW5CcmFja2V0U3RhY2sucG9wKCk7XG5cbiAgICAgICAgLy8gR2V0IHNvbWUgYm9vbGVhbnMgdG8gaGVscCB3b3JrIHRocm91Z2ggdGhlIGNhc2VzXG5cbiAgICAgICAgLy8gaGF2ZUNsb3NlZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBoYXZlIGV2ZXIgY2xvc2VkIGEgYnJhY2tldFxuICAgICAgICBjb25zdCBoYXZlQ2xvc2VkQnJhY2tldCA9IGxhc3RDbG9zZWRSb3cubGVuZ3RoO1xuICAgICAgICAvLyBqdXN0T3BlbmVkQnJhY2tldCBpcyB0cnVlIGlmIHdlIG9wZW5lZCBhIGJyYWNrZXQgb24gdGhlIHJvdyB3ZSBqdXN0IGZpbmlzaGVkXG4gICAgICAgIGNvbnN0IGp1c3RPcGVuZWRCcmFja2V0ID0gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzBdID09PSByb3cgLSAxO1xuICAgICAgICAvLyBqdXN0Q2xvc2VkQnJhY2tldCBpcyB0cnVlIGlmIHdlIGNsb3NlZCBhIGJyYWNrZXQgb24gdGhlIHJvdyB3ZSBqdXN0IGZpbmlzaGVkXG4gICAgICAgIGNvbnN0IGp1c3RDbG9zZWRCcmFja2V0ID0gaGF2ZUNsb3NlZEJyYWNrZXQgJiYgbGFzdENsb3NlZFJvd1sxXSA9PT0gcm93IC0gMTtcbiAgICAgICAgLy8gY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3BlbiBpcyBhbiAqKipleHRyZW1lbHkqKiogbG9uZyBuYW1lLCBhbmRcbiAgICAgICAgLy8gaXQgaXMgdHJ1ZSBpZiB0aGUgbW9zdCByZWNlbnRseSBjbG9zZWQgYnJhY2tldCBwYWlyIHdhcyBvcGVuZWQgb25cbiAgICAgICAgLy8gYSBsaW5lIEFGVEVSIHRoZSBsaW5lIHdoZXJlIHRoZSBjdXJyZW50IG9wZW4gYnJhY2tldFxuICAgICAgICBjb25zdCBjbG9zZWRCcmFja2V0T3BlbmVkQWZ0ZXJMaW5lV2l0aEN1cnJlbnRPcGVuID0gaGF2ZUNsb3NlZEJyYWNrZXQgJiZcbiAgICAgICAgICAgIGxhc3RDbG9zZWRSb3dbMF0gPiBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMF07XG4gICAgICAgIGxldCBpbmRlbnRDb2x1bW47XG5cbiAgICAgICAgaWYgKCFqdXN0T3BlbmVkQnJhY2tldCAmJiAhanVzdENsb3NlZEJyYWNrZXQpIHtcbiAgICAgICAgICAgIC8vIFRoZSBicmFja2V0IHdhcyBvcGVuZWQgYmVmb3JlIHRoZSBwcmV2aW91cyBsaW5lLFxuICAgICAgICAgICAgLy8gYW5kIHdlIGRpZCBub3QgY2xvc2UgYSBicmFja2V0IG9uIHRoZSBwcmV2aW91cyBsaW5lLlxuICAgICAgICAgICAgLy8gVGh1cywgbm90aGluZyBoYXMgaGFwcGVuZWQgdGhhdCBjb3VsZCBoYXZlIGNoYW5nZWQgdGhlXG4gICAgICAgICAgICAvLyBpbmRlbnRhdGlvbiBsZXZlbCBzaW5jZSB0aGUgcHJldmlvdXMgbGluZSwgc29cbiAgICAgICAgICAgIC8vIHdlIHNob3VsZCB1c2Ugd2hhdGV2ZXIgaW5kZW50IHdlIGFyZSBnaXZlbi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChqdXN0Q2xvc2VkQnJhY2tldCAmJiBjbG9zZWRCcmFja2V0T3BlbmVkQWZ0ZXJMaW5lV2l0aEN1cnJlbnRPcGVuKSB7XG4gICAgICAgICAgICAvLyBBIGJyYWNrZXQgdGhhdCB3YXMgb3BlbmVkIGFmdGVyIHRoZSBtb3N0IHJlY2VudCBvcGVuXG4gICAgICAgICAgICAvLyBicmFja2V0IHdhcyBjbG9zZWQgb24gdGhlIGxpbmUgd2UganVzdCBmaW5pc2hlZCB0eXBpbmcuXG4gICAgICAgICAgICAvLyBXZSBzaG91bGQgdXNlIHdoYXRldmVyIGluZGVudCB3YXMgdXNlZCBvbiB0aGUgcm93XG4gICAgICAgICAgICAvLyB3aGVyZSB3ZSBvcGVuZWQgdGhlIGJyYWNrZXQgd2UganVzdCBjbG9zZWQuIFRoaXMgbmVlZHNcbiAgICAgICAgICAgIC8vIHRvIGJlIGhhbmRsZWQgYXMgYSBzZXBhcmF0ZSBjYXNlIGZyb20gdGhlIGxhc3QgY2FzZSBiZWxvd1xuICAgICAgICAgICAgLy8gaW4gY2FzZSB0aGUgY3VycmVudCBicmFja2V0IGlzIHVzaW5nIGEgaGFuZ2luZyBpbmRlbnQuXG4gICAgICAgICAgICAvLyBUaGlzIGhhbmRsZXMgY2FzZXMgc3VjaCBhc1xuICAgICAgICAgICAgLy8geCA9IFswLCAxLCAyLFxuICAgICAgICAgICAgLy8gICAgICBbMywgNCwgNSxcbiAgICAgICAgICAgIC8vICAgICAgIDYsIDcsIDhdLFxuICAgICAgICAgICAgLy8gICAgICA5LCAxMCwgMTFdXG4gICAgICAgICAgICAvLyB3aGljaCB3b3VsZCBiZSBjb3JyZWN0bHkgaGFuZGxlZCBieSB0aGUgY2FzZSBiZWxvdywgYnV0IGl0IGFsc28gY29ycmVjdGx5IGhhbmRsZXNcbiAgICAgICAgICAgIC8vIHggPSBbXG4gICAgICAgICAgICAvLyAgICAgMCwgMSwgMiwgWzMsIDQsIDUsXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgIDYsIDcsIDhdLFxuICAgICAgICAgICAgLy8gICAgIDksIDEwLCAxMVxuICAgICAgICAgICAgLy8gXVxuICAgICAgICAgICAgLy8gd2hpY2ggdGhlIGxhc3QgY2FzZSBiZWxvdyB3b3VsZCBpbmNvcnJlY3RseSBpbmRlbnQgYW4gZXh0cmEgc3BhY2VcbiAgICAgICAgICAgIC8vIGJlZm9yZSB0aGUgXCI5XCIsIGJlY2F1c2UgaXQgd291bGQgdHJ5IHRvIG1hdGNoIGl0IHVwIHdpdGggdGhlXG4gICAgICAgICAgICAvLyBvcGVuIGJyYWNrZXQgaW5zdGVhZCBvZiB1c2luZyB0aGUgaGFuZ2luZyBpbmRlbnQuXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0luZGVudCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGxhc3RDbG9zZWRSb3dbMF0pO1xuICAgICAgICAgICAgaW5kZW50Q29sdW1uID0gcHJldmlvdXNJbmRlbnQgKiB0YWJMZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMV0gaXMgdGhlIGNvbHVtbiB3aGVyZSB0aGUgYnJhY2tldCB3YXMsXG4gICAgICAgICAgICAvLyBzbyBuZWVkIHRvIGJ1bXAgdXAgdGhlIGluZGVudGF0aW9uIGJ5IG9uZVxuICAgICAgICAgICAgaW5kZW50Q29sdW1uID0gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzFdICsgMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSBzb2Z0LXRhYnMgZnJvbSBzcGFjZXMgKGNhbiBoYXZlIHJlbWFpbmRlcilcbiAgICAgICAgbGV0IHRhYnMgPSBpbmRlbnRDb2x1bW4gLyB0YWJMZW5ndGg7XG4gICAgICAgIGNvbnN0IHJlbSA9ICh0YWJzIC0gTWF0aC5mbG9vcih0YWJzKSkgKiB0YWJMZW5ndGg7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUncyBhIHJlbWFpbmRlciwgYEBlZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmdgIHJlcXVpcmVzIHRoZSB0YWIgdG9cbiAgICAgICAgLy8gYmUgc2V0IHBhc3QgdGhlIGRlc2lyZWQgaW5kZW50YXRpb24gbGV2ZWwsIHRodXMgdGhlIGNlaWxpbmcuXG4gICAgICAgIHRhYnMgPSByZW0gPiAwID8gTWF0aC5jZWlsKHRhYnMpIDogdGFicztcblxuICAgICAgICAvLyBPZmZzZXQgaXMgdGhlIG51bWJlciBvZiBzcGFjZXMgdG8gc3VidHJhY3QgZnJvbSB0aGUgc29mdC10YWJzIGlmIHRoZXlcbiAgICAgICAgLy8gYXJlIHBhc3QgdGhlIGRlc2lyZWQgaW5kZW50YXRpb24gKG5vdCBkaXZpc2libGUgYnkgdGFiIGxlbmd0aCkuXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHJlbSA+IDAgPyB0YWJMZW5ndGggLSByZW0gOiAwO1xuXG4gICAgICAgIC8vIEknbSBnbGFkIEF0b20gaGFzIGFuIG9wdGlvbmFsIGBjb2x1bW5gIHBhcmFtIHRvIHN1YnRyYWN0IHNwYWNlcyBmcm9tXG4gICAgICAgIC8vIHNvZnQtdGFicywgdGhvdWdoIEkgZG9uJ3Qgc2VlIGl0IHVzZWQgYW55d2hlcmUgaW4gdGhlIGNvcmUuXG4gICAgICAgIC8vIEl0IGxvb2tzIGxpa2UgZm9yIGhhcmQgdGFicywgdGhlIFwidGFic1wiIGlucHV0IGNhbiBiZSBmcmFjdGlvbmFsIGFuZFxuICAgICAgICAvLyB0aGUgXCJjb2x1bW5cIiBpbnB1dCBpcyBpZ25vcmVkLi4uP1xuICAgICAgICBjb25zdCBpbmRlbnQgPSB0aGlzLmVkaXRvci5idWlsZEluZGVudFN0cmluZyh0YWJzLCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFRoZSByYW5nZSBvZiB0ZXh0IHRvIHJlcGxhY2Ugd2l0aCBvdXIgaW5kZW50XG4gICAgICAgIC8vIHdpbGwgbmVlZCB0byBjaGFuZ2UgdGhpcyBmb3IgaGFyZCB0YWJzLCBlc3BlY2lhbGx5IHRyaWNreSBmb3Igd2hlblxuICAgICAgICAvLyBoYXJkIHRhYnMgaGF2ZSBtaXh0dXJlIG9mIHRhYnMgKyBzcGFjZXMsIHdoaWNoIHRoZXkgY2FuIGp1ZGdpbmcgZnJvbVxuICAgICAgICAvLyB0aGUgZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nIGZ1bmN0aW9uXG4gICAgICAgIGNvbnN0IHN0YXJ0UmFuZ2UgPSBbcm93LCAwXTtcbiAgICAgICAgY29uc3Qgc3RvcFJhbmdlID0gW3JvdywgdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSAqIHRhYkxlbmd0aF07XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHRJblJhbmdlKFtzdGFydFJhbmdlLCBzdG9wUmFuZ2VdLCBpbmRlbnQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUxpbmVzKGxpbmVzKSB7XG4gICAgICAgIC8vIG9wZW5CcmFja2V0U3RhY2sgaXMgYW4gYXJyYXkgb2YgW3JvdywgY29sXSBpbmRpY2F0aW5nIHRoZSBsb2NhdGlvblxuICAgICAgICAvLyBvZiB0aGUgb3BlbmluZyBicmFja2V0IChzcXVhcmUsIGN1cmx5LCBvciBwYXJlbnRoZXNlcylcbiAgICAgICAgY29uc3Qgb3BlbkJyYWNrZXRTdGFjayA9IFtdO1xuICAgICAgICAvLyBsYXN0Q2xvc2VkUm93IGlzIGVpdGhlciBlbXB0eSBvciBbcm93T3Blbiwgcm93Q2xvc2VdIGRlc2NyaWJpbmcgdGhlXG4gICAgICAgIC8vIHJvd3Mgd2hlcmUgdGhlIGxhdGVzdCBjbG9zZWQgYnJhY2tldCB3YXMgb3BlbmVkIGFuZCBjbG9zZWQuXG4gICAgICAgIGxldCBsYXN0Q2xvc2VkUm93ID0gW107XG4gICAgICAgIC8vIElmIHdlIGFyZSBpbiBhIHN0cmluZywgdGhpcyB0ZWxscyB1cyB3aGF0IGNoYXJhY3RlciBpbnRyb2R1Y2VkIHRoZSBzdHJpbmdcbiAgICAgICAgLy8gaS5lLiwgZGlkIHRoaXMgc3RyaW5nIHN0YXJ0IHdpdGggJyBvciB3aXRoIFwiP1xuICAgICAgICBsZXQgc3RyaW5nRGVsaW1pdGVyID0gbnVsbDtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgcm93IG9mIHRoZSBsYXN0IGZ1bmN0aW9uIGRlZmluaXRpb25cbiAgICAgICAgbGV0IGxhc3RDb2xvblJvdyA9IE5hTjtcbiAgICAgICAgLy8gdHJ1ZSBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xuICAgICAgICBsZXQgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBzZWVuIHR3byBvZiB0aGUgc2FtZSBzdHJpbmcgZGVsaW1pdGVycyBpbiBhIHJvdyxcbiAgICAgICAgLy8gdGhlbiB3ZSBoYXZlIHRvIGNoZWNrIHRoZSBuZXh0IGNoYXJhY3RlciB0byBzZWUgaWYgaXQgbWF0Y2hlc1xuICAgICAgICAvLyBpbiBvcmRlciB0byBjb3JyZWN0bHkgcGFyc2UgdHJpcGxlIHF1b3RlZCBzdHJpbmdzLlxuICAgICAgICBsZXQgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xuICAgICAgICAvLyB0cnVlIGlmIHdlIHNob3VsZCBoYXZlIGEgaGFuZ2luZyBpbmRlbnQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAgICBsZXQgc2hvdWxkSGFuZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIE5PVEU6IHRoaXMgcGFyc2luZyB3aWxsIG9ubHkgYmUgY29ycmVjdCBpZiB0aGUgcHl0aG9uIGNvZGUgaXMgd2VsbC1mb3JtZWRcbiAgICAgICAgLy8gc3RhdGVtZW50cyBsaWtlIFwiWzAsICgxLCAyXSlcIiBtaWdodCBicmVhayB0aGUgcGFyc2luZ1xuXG4gICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIGxpbmVcbiAgICAgICAgY29uc3QgbGluZXNMZW5ndGggPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGxpbmVzTGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW3Jvd107XG5cbiAgICAgICAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb25zZWN1dGl2ZSBzdHJpbmcgZGVsaW1pdGVyJ3Mgd2UndmUgc2VlblxuICAgICAgICAgICAgLy8gaW4gdGhpcyBsaW5lOyB0aGlzIGlzIHVzZWQgdG8gdGVsbCBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xuICAgICAgICAgICAgbGV0IG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAvLyBib29sZWFuLCB3aGV0aGVyIG9yIG5vdCB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgYmVpbmcgZXNjYXBlZFxuICAgICAgICAgICAgLy8gYXBwbGljYWJsZSB3aGVuIHdlIGFyZSBjdXJyZW50bHkgaW4gYSBzdHJpbmdcbiAgICAgICAgICAgIGxldCBpc0VzY2FwZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBkZWZpbmVkIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgcm93XG4gICAgICAgICAgICBjb25zdCBsYXN0bGFzdENvbG9uUm93ID0gbGFzdENvbG9uUm93O1xuICAgICAgICAgICAgY29uc3QgbGluZUxlbmd0aCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgbGluZUxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gbGluZVtjb2xdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGMgPT09IHN0cmluZ0RlbGltaXRlciAmJiAhaXNFc2NhcGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyArPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hlY2tOZXh0Q2hhckZvclN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgc3RyaW5nRGVsaW1pdGVyIGlzIHNldCwgdGhlbiB3ZSBhcmUgaW4gYSBzdHJpbmdcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyB3b3JrcyBjb3JyZWN0bHkgZXZlbiBmb3IgdHJpcGxlIHF1b3RlZCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZ0RlbGltaXRlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNFc2NhcGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBjdXJyZW50IGNoYXJhY3RlciBpcyBlc2NhcGVkLCB0aGVuIHdlIGRvIG5vdCBjYXJlIHdoYXQgaXQgd2FzLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHNpbmNlIGl0IGlzIGltcG9zc2libGUgZm9yIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBlc2NhcGVkIGFzIHdlbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnbyBhaGVhZCBhbmQgc2V0IHRoYXQgdG8gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IHN0cmluZ0RlbGltaXRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIHNlZWluZyB0aGUgc2FtZSBxdW90ZSB0aGF0IHN0YXJ0ZWQgdGhlIHN0cmluZywgaS5lLiAnIG9yIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5UcmlwbGVRdW90ZWRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJyZWFraW5nIG91dCBvZiB0aGUgdHJpcGxlIHF1b3RlZCBzdHJpbmcuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nRGVsaW1pdGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IHRoZSBjb3VudCwgY29ycmVjdGx5IGhhbmRsZXMgY2FzZXMgbGlrZSAnJycnJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluVHJpcGxlUXVvdGVkU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBjdXJyZW50bHkgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZywgYW5kIHdlJ3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VlbiB0d28gb2YgdGhlIHNhbWUgc3RyaW5nIGRlbGltaXRlciBpbiBhIHJvdy4gVGhpcyBjb3VsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVpdGhlciBiZSBhbiBlbXB0eSBzdHJpbmcsIGkuZS4gJycgb3IgXCJcIiwgb3IgaXQgY291bGQgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3RhcnQgb2YgYSB0cmlwbGUgcXVvdGVkIHN0cmluZy4gV2Ugd2lsbCBjaGVjayB0aGUgbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYXJhY3RlciwgYW5kIGlmIGl0IG1hdGNoZXMgdGhlbiB3ZSBrbm93IHdlJ3JlIGluIGEgdHJpcGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVvdGVkIHN0cmluZywgYW5kIGlmIGl0IGRvZXMgbm90IG1hdGNoIHdlIGtub3cgd2UncmUgbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW4gYSBzdHJpbmcgYW55IG1vcmUgKGkuZS4gaXQgd2FzIHRoZSBlbXB0eSBzdHJpbmcpLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgbm90IGluIGEgc3RyaW5nIHRoYXQgaXMgbm90IHRyaXBsZSBxdW90ZWQsIGFuZCB3ZSd2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGp1c3Qgc2VlbiBhbiB1bi1lc2NhcGVkIGluc3RhbmNlIG9mIHRoYXQgc3RyaW5nIGRlbGltaXRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdGhlciB3b3Jkcywgd2UndmUgbGVmdCB0aGUgc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0IGlzIGFsc28gd29ydGggbm90aW5nIHRoYXQgaXQgaXMgaW1wb3NzaWJsZSBmb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgdG8gYmUgMCBhdCB0aGlzIHBvaW50LCBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgc2V0IG9mIGlmL2Vsc2UgaWYgc3RhdGVtZW50cyBjb3ZlcnMgYWxsIGNhc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gXCJcXFxcXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBzZWVpbmcgYW4gdW5lc2NhcGVkIGJhY2tzbGFzaCwgdGhlIG5leHQgY2hhcmFjdGVyIGlzIGVzY2FwZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBub3QgZXhhY3RseSB0cnVlIGluIHJhdyBzdHJpbmdzLCBIT1dFVkVSLCBpbiByYXdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZ3MgeW91IGNhbiBzdGlsbCBlc2NhcGUgdGhlIHF1b3RlIG1hcmsgYnkgdXNpbmcgYSBiYWNrc2xhc2guXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGF0J3MgYWxsIHdlIHJlYWxseSBjYXJlIGFib3V0IGFzIGZhciBhcyBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdvLCB3ZSBjYW4gYXNzdW1lIHdlIGFyZSBub3cgZXNjYXBpbmcgdGhlIG5leHQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgaXNFc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJbKHtcIi5pbmNsdWRlcyhjKSkge1xuICAgICAgICAgICAgICAgICAgICBvcGVuQnJhY2tldFN0YWNrLnB1c2goW3JvdywgY29sXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBvbmx5IGNoYXJhY3RlcnMgYWZ0ZXIgdGhpcyBvcGVuaW5nIGJyYWNrZXQgYXJlIHdoaXRlc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gd2Ugc2hvdWxkIGRvIGEgaGFuZ2luZyBpbmRlbnQuIElmIHRoZXJlIGFyZSBvdGhlciBub24td2hpdGVzcGFjZVxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFyYWN0ZXJzIGFmdGVyIHRoaXMsIHRoZW4gdGhleSB3aWxsIHNldCB0aGUgc2hvdWxkSGFuZyBib29sZWFuIHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZEhhbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCIgXFx0XFxyXFxuXCIuaW5jbHVkZXMoYykpIHsgLy8ganVzdCBpbiBjYXNlIHRoZXJlJ3MgYSBuZXcgbGluZVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBpdCdzIHdoaXRlc3BhY2UsIHdlIGRvbid0IGNhcmUgYXQgYWxsXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IHNldCBzaG91bGRIYW5nIHRvIGZhbHNlIGV2ZW4gaWZcbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBlLmcuIGp1c3QgZW50ZXJlZCBhIHNwYWNlIGJldHdlZW4gdGhlIG9wZW5pbmcgYnJhY2tldCBhbmQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ld2xpbmUuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSBcIiNcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNoZWNrIGdvZXMgYXMgd2VsbCB0byBtYWtlIHN1cmUgd2UgZG9uJ3Qgc2V0IHNob3VsZEhhbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gZmFsc2UgaW4gc2ltaWxhciBjaXJjdW1zdGFuY2VzIGFzIGRlc2NyaWJlZCBpbiB0aGUgd2hpdGVzcGFjZSBzZWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBhbHJlYWR5IHNraXBwZWQgaWYgdGhlIGNoYXJhY3RlciB3YXMgd2hpdGUtc3BhY2UsIGFuIG9wZW5pbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gYnJhY2tldCwgb3IgYSBuZXcgbGluZSwgc28gdGhhdCBtZWFucyB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgbm90XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaXRlc3BhY2UgYW5kIG5vdCBhbiBvcGVuaW5nIGJyYWNrZXQsIHNvIHNob3VsZEhhbmcgbmVlZHMgdG8gZ2V0IHNldCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBmYWxzZS5cbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkSGFuZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbWlsYXIgdG8gYWJvdmUsIHdlJ3ZlIGFscmVhZHkgc2tpcHBlZCBhbGwgaXJyZWxldmFudCBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBpZiB3ZSBzYXcgYSBjb2xvbiBlYXJsaWVyIGluIHRoaXMgbGluZSwgdGhlbiB3ZSB3b3VsZCBoYXZlXG4gICAgICAgICAgICAgICAgICAgIC8vIGluY29ycmVjdGx5IHRob3VnaHQgaXQgd2FzIHRoZSBlbmQgb2YgYSBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0XG4gICAgICAgICAgICAgICAgICAgIC8vIGJsb2NrIHdoZW4gaXQgd2FzIGFjdHVhbGx5IGEgZGljdGlvbmFyeSBiZWluZyBkZWZpbmVkLCByZXNldCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFzdENvbG9uUm93IHZhcmlhYmxlIHRvIHdoYXRldmVyIGl0IHdhcyB3aGVuIHdlIHN0YXJ0ZWQgcGFyc2luZyB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpbmUuXG4gICAgICAgICAgICAgICAgICAgIGxhc3RDb2xvblJvdyA9IGxhc3RsYXN0Q29sb25Sb3c7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT09IFwiOlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29sb25Sb3cgPSByb3c7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJ9KV1cIi5pbmNsdWRlcyhjKSAmJiBvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIC5wb3AoKSB3aWxsIHRha2UgdGhlIGVsZW1lbnQgb2ZmIG9mIHRoZSBvcGVuQnJhY2tldFN0YWNrIGFzIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGl0IHRvIHRoZSBhcnJheSBmb3IgbGFzdENsb3NlZFJvdy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDbG9zZWRSb3cgPSBbb3BlbkJyYWNrZXRTdGFjay5wb3AoKVswXSwgcm93XTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIidcXFwiXCIuaW5jbHVkZXMoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0aW5nIGEgc3RyaW5nLCBrZWVwIHRyYWNrIG9mIHdoYXQgcXVvdGUgd2FzIHVzZWQgdG8gc3RhcnQgaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgb3BlbkJyYWNrZXRTdGFjaywgbGFzdENsb3NlZFJvdywgc2hvdWxkSGFuZywgbGFzdENvbG9uUm93IH07XG4gICAgfVxuXG4gICAgaW5kZW50SGFuZ2luZyhyb3cpIHtcbiAgICAgICAgLy8gSW5kZW50IGF0IHRoZSBjdXJyZW50IGJsb2NrIGxldmVsIHBsdXMgdGhlIHNldHRpbmcgYW1vdW50ICgxIG9yIDIpXG4gICAgICAgIGNvbnN0IGluZGVudCA9ICh0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpKSArXG4gICAgICAgICAgICAoYXRvbS5jb25maWcuZ2V0KFwicHl0aG9uLWluZGVudC5oYW5naW5nSW5kZW50VGFic1wiKSk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBpbmRlbnRcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnQpO1xuICAgIH1cbn1cbiJdfQ==