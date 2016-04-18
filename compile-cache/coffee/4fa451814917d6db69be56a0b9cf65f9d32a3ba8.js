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

    PrettyDiff.prototype.options = {
      _: {
        inchar: "indent_char",
        insize: "indent_size",
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
      "Riot.js": true
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wcmV0dHlkaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLElBQUEsR0FBTSxhQUFOLENBQUE7O0FBQUEseUJBQ0EsT0FBQSxHQUFTO0FBQUEsTUFFUCxDQUFBLEVBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxhQUFSO0FBQUEsUUFDQSxNQUFBLEVBQVEsYUFEUjtBQUFBLFFBRUEsT0FBQSxFQUFTLFNBQUMsT0FBRCxHQUFBO2lCQUNQLE9BQUEsSUFBVyxNQURKO1FBQUEsQ0FGVDtBQUFBLFFBSUEsUUFBQSxFQUFVO1VBQUMsbUJBQUQsRUFBc0IsU0FBQyxpQkFBRCxHQUFBO0FBQzlCLFlBQUEsSUFBSSxpQkFBQSxLQUFxQixJQUF6QjtxQkFDRSxNQURGO2FBQUEsTUFBQTtxQkFDYSxPQURiO2FBRDhCO1VBQUEsQ0FBdEI7U0FKVjtBQUFBLFFBUUEsY0FBQSxFQUFnQix1QkFSaEI7QUFBQSxRQVNBLFFBQUEsRUFBVTtVQUFDLGlCQUFELEVBQW9CLFNBQUMsZUFBRCxHQUFBO0FBQzVCLFlBQUEsSUFBSSxlQUFBLEtBQW1CLEtBQXZCO3FCQUNFLFdBREY7YUFBQSxNQUFBO3FCQUNrQixTQURsQjthQUQ0QjtVQUFBLENBQXBCO1NBVFY7QUFBQSxRQWFBLEtBQUEsRUFBTyxtQkFiUDtBQUFBLFFBY0EsWUFBQSxFQUFjLGdCQWRkO0FBQUEsUUFlQSxRQUFBLEVBQVU7VUFBQyxtQkFBRCxFQUFzQixTQUFDLGlCQUFELEdBQUE7QUFDOUIsWUFBQSxJQUFJLGlCQUFBLEtBQXFCLElBQXpCO3FCQUNFLE1BREY7YUFBQSxNQUFBO3FCQUNhLE9BRGI7YUFEOEI7VUFBQSxDQUF0QjtTQWZWO0FBQUEsUUFtQkEsSUFBQSxFQUFNLGtCQW5CTjtBQUFBLFFBb0JBLEtBQUEsRUFBTywyQkFwQlA7QUFBQSxRQXFCQSxVQUFBLEVBQVksY0FyQlo7QUFBQSxRQXNCQSxRQUFBLEVBQVUsZ0JBdEJWO0FBQUEsUUF1QkEsV0FBQSxFQUFhO1VBQUMsdUJBQUQsRUFBMEIsU0FBQyxxQkFBRCxHQUFBO0FBQ3JDLFlBQUEsSUFBSSxxQkFBQSxLQUF5QixJQUE3QjtxQkFDRSxNQURGO2FBQUEsTUFBQTtxQkFDYSxLQURiO2FBRHFDO1VBQUEsQ0FBMUI7U0F2QmI7QUFBQSxRQTJCQSxXQUFBLEVBQWEsd0JBM0JiO09BSEs7QUFBQSxNQWdDUCxHQUFBLEVBQUssSUFoQ0U7QUFBQSxNQWlDUCxVQUFBLEVBQVksSUFqQ0w7QUFBQSxNQWtDUCxHQUFBLEVBQUssSUFsQ0U7QUFBQSxNQW1DUCxHQUFBLEVBQUssSUFuQ0U7QUFBQSxNQW9DUCxJQUFBLEVBQU0sSUFwQ0M7QUFBQSxNQXFDUCxHQUFBLEVBQUssSUFyQ0U7QUFBQSxNQXNDUCxHQUFBLEVBQUssSUF0Q0U7QUFBQSxNQXVDUCxTQUFBLEVBQVcsSUF2Q0o7QUFBQSxNQXdDUCxHQUFBLEVBQUssSUF4Q0U7QUFBQSxNQXlDUCxVQUFBLEVBQVksSUF6Q0w7QUFBQSxNQTBDUCxHQUFBLEVBQUssSUExQ0U7QUFBQSxNQTJDUCxJQUFBLEVBQU0sSUEzQ0M7QUFBQSxNQTRDUCxJQUFBLEVBQU0sSUE1Q0M7QUFBQSxNQTZDUCxJQUFBLEVBQU0sSUE3Q0M7QUFBQSxNQThDUCxHQUFBLEVBQUssSUE5Q0U7QUFBQSxNQStDUCxJQUFBLEVBQU0sSUEvQ0M7QUFBQSxNQWdEUCxJQUFBLEVBQU0sSUFoREM7QUFBQSxNQWlEUCxJQUFBLEVBQU0sSUFqREM7QUFBQSxNQWtEUCxXQUFBLEVBQWEsSUFsRE47QUFBQSxNQW1EUCxTQUFBLEVBQVcsSUFuREo7S0FEVCxDQUFBOztBQUFBLHlCQXVEQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNsQixjQUFBLHlDQUFBO0FBQUEsVUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBO0FBQUEsVUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBO0FBQUEsVUFJQSxJQUFBLEdBQU8sTUFKUCxDQUFBO0FBS0Esa0JBQU8sUUFBUDtBQUFBLGlCQUNPLEtBRFA7QUFFSSxjQUFBLElBQUEsR0FBTyxLQUFQLENBRko7QUFDTztBQURQLGlCQUdPLFlBSFA7QUFJSSxjQUFBLElBQUEsR0FBTyxNQUFQLENBSko7QUFHTztBQUhQLGlCQUtPLEtBTFA7QUFBQSxpQkFLYyxNQUxkO0FBTUksY0FBQSxJQUFBLEdBQU8sS0FBUCxDQU5KO0FBS2M7QUFMZCxpQkFPTyxLQVBQO0FBUUksY0FBQSxJQUFBLEdBQU8sV0FBUCxDQVJKO0FBT087QUFQUCxpQkFTTyxZQVRQO0FBQUEsaUJBU3FCLFVBVHJCO0FBQUEsaUJBU2lDLFdBVGpDO0FBQUEsaUJBUzhDLE1BVDlDO0FBQUEsaUJBU3NELFNBVHREO0FBVUksY0FBQSxJQUFBLEdBQU8sWUFBUCxDQVZKO0FBU3NEO0FBVHRELGlCQVdPLE1BWFA7QUFZSSxjQUFBLElBQUEsR0FBTyxRQUFQLENBWko7QUFXTztBQVhQLGlCQWFPLEtBYlA7QUFBQSxpQkFhYyxhQWJkO0FBQUEsaUJBYTZCLEtBYjdCO0FBY0ksY0FBQSxJQUFBLEdBQU8sS0FBUCxDQWRKO0FBYTZCO0FBYjdCLGlCQWVPLE1BZlA7QUFnQkksY0FBQSxJQUFBLEdBQU8sTUFBUCxDQWhCSjtBQWVPO0FBZlAsaUJBaUJPLFlBakJQO0FBa0JJLGNBQUEsSUFBQSxHQUFPLFlBQVAsQ0FsQko7QUFpQk87QUFqQlAsaUJBbUJPLE1BbkJQO0FBb0JJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0FwQko7QUFtQk87QUFuQlAsaUJBcUJPLEtBckJQO0FBc0JJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0F0Qko7QUFxQk87QUFyQlAsaUJBdUJPLE1BdkJQO0FBd0JJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0F4Qko7QUF1Qk87QUF2QlAsaUJBeUJPLEtBekJQO0FBMEJJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0ExQko7QUF5Qk87QUF6QlAsaUJBMkJPLE1BM0JQO0FBNEJJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0E1Qko7QUEyQk87QUEzQlAsaUJBNkJPLE1BN0JQO0FBQUEsaUJBNkJlLE1BN0JmO0FBOEJJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0E5Qko7QUE2QmU7QUE3QmYsaUJBK0JPLEtBL0JQO0FBZ0NJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0FoQ0o7QUErQk87QUEvQlA7QUFrQ0ksY0FBQSxJQUFBLEdBQU8sTUFBUCxDQWxDSjtBQUFBLFdBTEE7QUFBQSxVQTBDQSxJQUFBLEdBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsWUFDQSxJQUFBLEVBQU0sSUFETjtBQUFBLFlBRUEsSUFBQSxFQUFNLFVBRk47V0EzQ0YsQ0FBQTtBQUFBLFVBZ0RBLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUFpQixJQUFqQixDQWhEQSxDQUFBO0FBQUEsVUFtREEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLE9BQXZCLENBbkRBLENBQUE7QUFBQSxVQW9EQSxNQUFBLEdBQVMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBcERULENBQUE7QUFBQSxVQXFEQSxNQUFBLEdBQVMsTUFBTyxDQUFBLENBQUEsQ0FyRGhCLENBQUE7aUJBd0RBLE9BQUEsQ0FBUSxNQUFSLEVBekRrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsQ0FBWCxDQUZRO0lBQUEsQ0F2RFYsQ0FBQTs7c0JBQUE7O0tBRHdDLFdBSDFDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautifiers/prettydiff.coffee
