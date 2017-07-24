(function() {
  "use strict";
  var Beautifier, SassConvert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(superClass) {
    extend(SassConvert, superClass);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.isPreInstalled = false;

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.run("sass-convert", [this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9zYXNzLWNvbnZlcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzswQkFDckIsSUFBQSxHQUFNOzswQkFDTixJQUFBLEdBQU07OzBCQUNOLGNBQUEsR0FBZ0I7OzBCQUVoQixPQUFBLEdBRUU7TUFBQSxHQUFBLEVBQUssS0FBTDtNQUNBLElBQUEsRUFBTSxLQUROO01BRUEsSUFBQSxFQUFNLEtBRk47OzswQkFJRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLFdBQVQsQ0FBQTthQUVQLElBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxFQUFxQixDQUNuQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEbUIsRUFFbkIsUUFGbUIsRUFFVCxJQUZTLEVBRUgsTUFGRyxFQUVLLElBRkwsQ0FBckI7SUFIUTs7OztLQVgrQjtBQUgzQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTYXNzQ29udmVydCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJTYXNzQ29udmVydFwiXG4gIGxpbms6IFwiaHR0cDovL3Nhc3MtbGFuZy5jb20vZG9jdW1lbnRhdGlvbi9maWxlLlNBU1NfUkVGRVJFTkNFLmh0bWwjc3ludGF4XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczpcbiAgICAjIFRPRE86IEFkZCBzdXBwb3J0IGZvciBvcHRpb25zXG4gICAgQ1NTOiBmYWxzZVxuICAgIFNhc3M6IGZhbHNlXG4gICAgU0NTUzogZmFsc2VcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGxhbmcgPSBsYW5ndWFnZS50b0xvd2VyQ2FzZSgpXG5cbiAgICBAcnVuKFwic2Fzcy1jb252ZXJ0XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpLFxuICAgICAgXCItLWZyb21cIiwgbGFuZywgXCItLXRvXCIsIGxhbmdcbiAgICBdKVxuIl19
