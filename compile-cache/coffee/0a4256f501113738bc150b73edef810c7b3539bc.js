
/*
 */

(function() {
  var Beautifier, Lua, format, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  format = require('./beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://www.perl.org/";

    Lua.prototype.isPreInstalled = false;

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size)));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7QUFBQTtBQUFBLE1BQUEsNkJBQUE7SUFBQTs7O0VBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQOztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixNQUFBLEdBQVMsT0FBQSxDQUFRLGNBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7a0JBQ3JCLElBQUEsR0FBTTs7a0JBQ04sSUFBQSxHQUFNOztrQkFDTixjQUFBLEdBQWdCOztrQkFFaEIsT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7OztrQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNKLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1gsWUFBQTtBQUFBO2lCQUNFLE9BQUEsQ0FBUSxNQUFBLENBQU8sSUFBUCxFQUFhLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBcEIsQ0FBMkIsT0FBTyxDQUFDLFdBQW5DLENBQWIsQ0FBUixFQURGO1NBQUEsY0FBQTtVQUVNO2lCQUNKLE1BQUEsQ0FBTyxLQUFQLEVBSEY7O01BRFcsQ0FBVDtJQURJOzs7O0tBVHVCO0FBUm5DIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIyNcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuZm9ybWF0ID0gcmVxdWlyZSAnLi9iZWF1dGlmaWVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEx1YSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJMdWEgYmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cucGVybC5vcmcvXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIEx1YTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBuZXcgQFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHRyeVxuICAgICAgICByZXNvbHZlIGZvcm1hdCB0ZXh0LCBvcHRpb25zLmluZGVudF9jaGFyLnJlcGVhdCBvcHRpb25zLmluZGVudF9zaXplXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZWplY3QgZXJyb3JcbiJdfQ==
