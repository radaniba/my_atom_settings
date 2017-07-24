
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(superClass) {
    extend(R, superClass);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.isPreInstalled = false;

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier;
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return this.run("Rscript", [r_beautifier, options.indent_size, this.tempFile("input", text), '>', this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9mb3JtYXRSL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTs7O0VBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQOztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztnQkFDckIsSUFBQSxHQUFNOztnQkFDTixJQUFBLEdBQU07O2dCQUNOLGNBQUEsR0FBZ0I7O2dCQUVoQixPQUFBLEdBQVM7TUFDUCxDQUFBLEVBQUcsSUFESTs7O2dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsV0FBeEI7YUFDZixJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsQ0FDZCxZQURjLEVBRWQsT0FBTyxDQUFDLFdBRk0sRUFHZCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FIYyxFQUlkLEdBSmMsRUFLZCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FMYyxDQUFoQjtJQUZROzs7O0tBVHFCO0FBUmpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBbZm9ybWF0Ul0oaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFIpXG4jIyNcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiZm9ybWF0UlwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByX2JlYXV0aWZpZXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImZvcm1hdFIuclwiKVxuICAgIEBydW4oXCJSc2NyaXB0XCIsIFtcbiAgICAgIHJfYmVhdXRpZmllcixcbiAgICAgIG9wdGlvbnMuaW5kZW50X3NpemUsXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KSxcbiAgICAgICc+JyxcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdKVxuIl19
