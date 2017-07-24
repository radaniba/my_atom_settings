
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.isPreInstalled = false;

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("autopep8", [tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0], {
        help: {
          link: "https://github.com/hhatto/autopep8"
        }
      }).then((function(_this) {
        return function() {
          var editor, filePath, projectPath;
          if (options.sort_imports) {
            editor = atom.workspace.getActiveTextEditor();
            filePath = editor.getPath();
            projectPath = atom.project.relativizePath(filePath)[0];
            return _this.run("isort", ["-sp", projectPath, tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9hdXRvcGVwOC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsb0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3VCQUVyQixJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBQ04sY0FBQSxHQUFnQjs7dUJBRWhCLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7dUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLENBQ2YsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURJLEVBRWYsSUFGZSxFQUd3QywrQkFBdkQsR0FBQSxDQUFDLG1CQUFELEVBQXNCLEVBQUEsR0FBRyxPQUFPLENBQUMsZUFBakMsQ0FBQSxHQUFBLE1BSGUsRUFJK0IsMkJBQTlDLEdBQUEsQ0FBQyxlQUFELEVBQWlCLEVBQUEsR0FBRyxPQUFPLENBQUMsV0FBNUIsQ0FBQSxHQUFBLE1BSmUsRUFLK0Isc0JBQTlDLEdBQUEsQ0FBQyxVQUFELEVBQVksRUFBQSxHQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLEdBQXBCLENBQUQsQ0FBZCxDQUFBLEdBQUEsTUFMZSxDQUFqQixFQU1LO1FBQUEsSUFBQSxFQUFNO1VBQ1AsSUFBQSxFQUFNLG9DQURDO1NBQU47T0FOTCxDQVNFLENBQUMsSUFUSCxDQVNRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNKLGNBQUE7VUFBQSxJQUFHLE9BQU8sQ0FBQyxZQUFYO1lBQ0UsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtZQUNULFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO1lBQ1gsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFzQyxDQUFBLENBQUE7bUJBRXBELEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUNFLENBQUMsS0FBRCxFQUFRLFdBQVIsRUFBcUIsUUFBckIsQ0FERixFQUVFO2NBQUEsSUFBQSxFQUFNO2dCQUNKLElBQUEsRUFBTSx5Q0FERjtlQUFOO2FBRkYsQ0FLQSxDQUFDLElBTEQsQ0FLTSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBTE4sRUFMRjtXQUFBLE1BQUE7bUJBY0UsS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBZEY7O1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVFI7SUFEUTs7OztLQVY0QjtBQVB4QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2hoYXR0by9hdXRvcGVwOFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBdXRvcGVwOCBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiBcImF1dG9wZXA4XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFB5dGhvbjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwiYXV0b3BlcDhcIiwgW1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXCItaVwiXG4gICAgICBbXCItLW1heC1saW5lLWxlbmd0aFwiLCBcIiN7b3B0aW9ucy5tYXhfbGluZV9sZW5ndGh9XCJdIGlmIG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoP1xuICAgICAgW1wiLS1pbmRlbnQtc2l6ZVwiLFwiI3tvcHRpb25zLmluZGVudF9zaXplfVwiXSBpZiBvcHRpb25zLmluZGVudF9zaXplP1xuICAgICAgW1wiLS1pZ25vcmVcIixcIiN7b3B0aW9ucy5pZ25vcmUuam9pbignLCcpfVwiXSBpZiBvcHRpb25zLmlnbm9yZT9cbiAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XCJcbiAgICAgIH0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBpZiBvcHRpb25zLnNvcnRfaW1wb3J0c1xuICAgICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgICAgICAgQHJ1bihcImlzb3J0XCIsXG4gICAgICAgICAgICBbXCItc3BcIiwgcHJvamVjdFBhdGgsIHRlbXBGaWxlXSxcbiAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vdGltb3RoeWNyb3NsZXkvaXNvcnRcIlxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
