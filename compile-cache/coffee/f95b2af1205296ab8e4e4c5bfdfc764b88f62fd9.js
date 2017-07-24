(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(_super) {
    __extends(PrettyDiff, _super);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.link = "https://github.com/prettydiff/prettydiff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            if (indent_with_tabs === true) {
              return "\t";
            } else {
              return indent_char;
            }
          }
        ],
        insize: [
          "indent_with_tabs", "indent_size", function(indent_with_tabs, indent_size) {
            if (indent_with_tabs === true) {
              return 1;
            } else {
              return indent_size;
            }
          }
        ],
        objsort: function(objsort) {
          return objsort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        cssinsertlines: "newline_between_rules",
        comments: [
          "indent_comments", function(indent_comments) {
            if (indent_comments === false) {
              return "noindent";
            } else {
              return "indent";
            }
          }
        ],
        force: "force_indentation",
        quoteConvert: "convert_quotes",
        vertical: [
          'align_assignments', function(align_assignments) {
            if (align_assignments === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        wrap: "wrap_line_length",
        space: "space_after_anon_function",
        noleadzero: "no_lead_zero",
        endcomma: "end_with_comma",
        methodchain: [
          'break_chained_methods', function(break_chained_methods) {
            if (break_chained_methods === true) {
              return false;
            } else {
              return true;
            }
          }
        ],
        ternaryline: "preserve_ternary_lines"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      Sass: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
      Visualforce: true,
      "Riot.js": true,
      XTemplate: true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var args, lang, output, prettydiff, result, _;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          lang = "auto";
          switch (language) {
            case "CSV":
              lang = "csv";
              break;
            case "Coldfusion":
              lang = "html";
              break;
            case "EJS":
            case "Twig":
              lang = "ejs";
              break;
            case "ERB":
              lang = "html_ruby";
              break;
            case "Handlebars":
            case "Mustache":
            case "Spacebars":
            case "Swig":
            case "Riot.js":
            case "XTemplate":
              lang = "handlebars";
              break;
            case "SGML":
              lang = "markup";
              break;
            case "XML":
            case "Visualforce":
            case "SVG":
              lang = "xml";
              break;
            case "HTML":
              lang = "html";
              break;
            case "JavaScript":
              lang = "javascript";
              break;
            case "JSON":
              lang = "json";
              break;
            case "JSX":
              lang = "jsx";
              break;
            case "JSTL":
              lang = "jsp";
              break;
            case "CSS":
              lang = "css";
              break;
            case "LESS":
              lang = "less";
              break;
            case "SCSS":
            case "Sass":
              lang = "scss";
              break;
            case "TSS":
              lang = "tss";
              break;
            default:
              lang = "auto";
          }
          args = {
            source: text,
            lang: lang,
            mode: "beautify"
          };
          _.merge(options, args);
          _this.verbose('prettydiff', options);
          output = prettydiff.api(options);
          result = output[0];
          return resolve(result);
        };
      })(this));
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wcmV0dHlkaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLElBQUEsR0FBTSxhQUFOLENBQUE7O0FBQUEseUJBQ0EsSUFBQSxHQUFNLDBDQUROLENBQUE7O0FBQUEseUJBRUEsT0FBQSxHQUFTO0FBQUEsTUFFUCxDQUFBLEVBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUTtVQUFDLGtCQUFELEVBQXFCLGFBQXJCLEVBQW9DLFNBQUMsZ0JBQUQsRUFBbUIsV0FBbkIsR0FBQTtBQUMxQyxZQUFBLElBQUksZ0JBQUEsS0FBb0IsSUFBeEI7cUJBQ0UsS0FERjthQUFBLE1BQUE7cUJBQ1ksWUFEWjthQUQwQztVQUFBLENBQXBDO1NBQVI7QUFBQSxRQUlBLE1BQUEsRUFBUTtVQUFDLGtCQUFELEVBQXFCLGFBQXJCLEVBQW9DLFNBQUMsZ0JBQUQsRUFBbUIsV0FBbkIsR0FBQTtBQUMxQyxZQUFBLElBQUksZ0JBQUEsS0FBb0IsSUFBeEI7cUJBQ0UsRUFERjthQUFBLE1BQUE7cUJBQ1MsWUFEVDthQUQwQztVQUFBLENBQXBDO1NBSlI7QUFBQSxRQVFBLE9BQUEsRUFBUyxTQUFDLE9BQUQsR0FBQTtpQkFDUCxPQUFBLElBQVcsTUFESjtRQUFBLENBUlQ7QUFBQSxRQVVBLFFBQUEsRUFBVTtVQUFDLG1CQUFELEVBQXNCLFNBQUMsaUJBQUQsR0FBQTtBQUM5QixZ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

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautifiers/prettydiff.coffee
