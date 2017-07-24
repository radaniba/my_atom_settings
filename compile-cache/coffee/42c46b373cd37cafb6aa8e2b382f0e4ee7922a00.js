(function() {
  "use strict";
  var Beautifier, JSBeautify,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(_super) {
    var getDefaultLineEnding;

    __extends(JSBeautify, _super);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "JS Beautify";

    JSBeautify.prototype.link = "https://github.com/beautify-web/js-beautify";

    JSBeautify.prototype.options = {
      HTML: true,
      XML: true,
      Handlebars: true,
      Mustache: true,
      JavaScript: true,
      JSON: true,
      CSS: {
        indent_size: true,
        indent_char: true,
        selector_separator_newline: true,
        newline_between_rules: true,
        preserve_newlines: true,
        wrap_line_length: true
      }
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      var _ref;
      this.verbose("JS Beautify language " + language);
      this.info("JS Beautify Options: " + (JSON.stringify(options, null, 4)));
      options.eol = (_ref = getDefaultLineEnding()) != null ? _ref : options.eol;
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var beautifyCSS, beautifyHTML, beautifyJS, err;
          try {
            switch (language) {
              case "JSON":
              case "JavaScript":
                beautifyJS = require("js-beautify");
                text = beautifyJS(text, options);
                return resolve(text);
              case "Handlebars":
              case "Mustache":
                options.indent_handlebars = true;
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                return resolve(text);
              case "HTML (Liquid)":
              case "HTML":
              case "XML":
              case "Web Form/Control (C#)":
              case "Web Handler (C#)":
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                _this.debug("Beautified HTML: " + text);
                return resolve(text);
              case "CSS":
                beautifyCSS = require("js-beautify").css;
                text = beautifyCSS(text, options);
                return resolve(text);
            }
          } catch (_error) {
            err = _error;
            _this.error("JS Beautify error: " + err);
            return reject(err);
          }
        };
      })(this));
    };

    getDefaultLineEnding = function() {
      switch (atom.config.get('line-ending-selector.defaultLineEnding')) {
        case 'LF':
          return '\n';
        case 'CRLF':
          return '\r\n';
        case 'OS Default':
          if (process.platform === 'win32') {
            return '\r\n';
          } else {
            return '\n';
          }
        default:
          return null;
      }
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9qcy1iZWF1dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLFFBQUEsb0JBQUE7O0FBQUEsaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLElBQUEsR0FBTSxhQUFOLENBQUE7O0FBQUEseUJBQ0EsSUFBQSxHQUFNLDZDQUROLENBQUE7O0FBQUEseUJBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxJQUFBLEVBQU0sSUFEQztBQUFBLE1BRVAsR0FBQSxFQUFLLElBRkU7QUFBQSxNQUdQLFVBQUEsRUFBWSxJQUhMO0FBQUEsTUFJUCxRQUFBLEVBQVUsSUFKSDtBQUFBLE1BS1AsVUFBQSxFQUFZLElBTEw7QUFBQSxNQU1QLElBQUEsRUFBTSxJQU5DO0FBQUEsTUFPUCxHQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxJQUFiO0FBQUEsUUFDQSxXQUFBLEVBQWEsSUFEYjtBQUFBLFFBRUEsMEJBQUEsRUFBNEIsSUFGNUI7QUFBQSxRQUdBLHFCQUFBLEVBQXVCLElBSHZCO0FBQUEsUUFJQSxpQkFBQSxFQUFtQixJQUpuQjtBQUFBLFFBS0EsZ0JBQUEsRUFBa0IsSUFMbEI7T0FSSztLQUhULENBQUE7O0FBQUEseUJBbUJBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEdBQUE7QUFDUixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQVUsdUJBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautifiers/js-beautify.coffee
