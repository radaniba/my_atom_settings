
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(superClass) {
    extend(ElmFormat, superClass);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.isPreInstalled = false;

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.run("elm-format", ['--yes', name], {
            help: {
              link: 'https://github.com/avh4/elm-format#installation-'
            }
          }).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lbG0tZm9ybWF0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxxQkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7d0JBQ3JCLElBQUEsR0FBTTs7d0JBQ04sSUFBQSxHQUFNOzt3QkFDTixjQUFBLEdBQWdCOzt3QkFFaEIsT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7Ozt3QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLEVBQXlCLE1BQXpCLENBQ1gsQ0FBQyxJQURVLENBQ0wsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQ0osS0FBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CLENBQ2pCLE9BRGlCLEVBRWpCLElBRmlCLENBQW5CLEVBSUU7WUFBRSxJQUFBLEVBQU07Y0FBRSxJQUFBLEVBQU0sa0RBQVI7YUFBUjtXQUpGLENBTUEsQ0FBQyxJQU5ELENBTU0sU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLElBQVY7VUFESSxDQU5OO1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBREs7SUFESDs7OztLQVQ2QjtBQU56QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2F2aDQvZWxtLWZvcm1hdFxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRWxtRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImVsbS1mb3JtYXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXRcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgRWxtOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHRlbXBmaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCwgXCIuZWxtXCIpXG4gICAgLnRoZW4gKG5hbWUpID0+XG4gICAgICBAcnVuKFwiZWxtLWZvcm1hdFwiLCBbXG4gICAgICAgICctLXllcycsXG4gICAgICAgIG5hbWVcbiAgICAgICAgXSxcbiAgICAgICAgeyBoZWxwOiB7IGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0I2luc3RhbGxhdGlvbi0nIH0gfVxuICAgICAgKVxuICAgICAgLnRoZW4gKCkgPT5cbiAgICAgICAgQHJlYWRGaWxlKG5hbWUpXG4iXX0=
