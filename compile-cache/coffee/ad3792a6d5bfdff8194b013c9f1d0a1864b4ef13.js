
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "coffeescript", "coldfusion", "cpp", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "markdown", 'marko', "mustache", "objective-c", "pawn", "perl", "php", "puppet", "python", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "vala", "visualforce", "xml", "xtemplate"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(_arg) {
      var extension, grammar, name, namespace;
      name = _arg.name, namespace = _arg.namespace, grammar = _arg.grammar, extension = _arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsb0JBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FMSixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBSXJCLHdCQUFBLGFBQUEsR0FBZSxDQUNiLE1BRGEsRUFFYixTQUZhLEVBR2IsU0FIYSxFQUliLEdBSmEsRUFLYixjQUxhLEVBTWIsWUFOYSxFQU9iLEtBUGEsRUFRYixLQVJhLEVBU2IsS0FUYSxFQVViLEdBVmEsRUFXYixLQVhhLEVBWWIsS0FaYSxFQWFiLEtBYmEsRUFjYixRQWRhLEVBZWIsU0FmYSxFQWdCYixJQWhCYSxFQWlCYixTQWpCYSxFQWtCYixZQWxCYSxFQW1CYixTQW5CYSxFQW9CYixNQXBCYSxFQXFCYixNQXJCYSxFQXNCYixNQXRCYSxFQXVCYixZQXZCYSxFQXdCYixNQXhCYSxFQXlCYixLQXpCYSxFQTBCYixPQTFCYSxFQTJCYixNQTNCYSxFQTRCYixVQTVCYSxFQTZCYixPQTdCYSxFQThCYixVQTlCYSxFQStCYixhQS9CYSxFQWdDYixNQWhDYSxFQWlDYixNQWpDYSxFQWtDYixLQWxDYSxFQW1DYixRQW5DYSxFQW9DYixRQXBDYSxFQXFDYixRQXJDYSxFQXNDYixNQXRDYSxFQXVDYixNQXZDYSxFQXdDYixNQXhDYSxFQXlDYixNQXpDYSxFQTBDYixXQTFDYSxFQTJDYixLQTNDYSxFQTRDYixLQTVDYSxFQTZDYixNQTdDYSxFQThDYixLQTlDYSxFQStDYixNQS9DYSxFQWdEYixZQWhEYSxFQWlEYixNQWpEYSxFQWtEYixhQWxEYSxFQW1EYixLQW5EYSxFQW9EYixXQXBEYSxDQUFmLENBQUE7O0FBdURBO0FBQUE7O09BdkRBOztBQUFBLHdCQTBEQSxTQUFBLEdBQVcsSUExRFgsQ0FBQTs7QUE0REE7QUFBQTs7T0E1REE7O0FBQUEsd0JBK0RBLFVBQUEsR0FBWSxJQS9EWixDQUFBOztBQWlFQTtBQUFBOztPQWpFQTs7QUFvRWEsSUFBQSxtQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGFBQVAsRUFBc0IsU0FBQyxJQUFELEdBQUE7ZUFDakMsT0FBQSxDQUFTLElBQUEsR0FBSSxJQUFiLEVBRGlDO01BQUEsQ0FBdEIsQ0FBYixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLFNBQVAsRUFBa0IsU0FBQyxRQUFELEdBQUE7ZUFBYyxRQUFRLENBQUMsVUFBdkI7TUFBQSxDQUFsQixDQUhkLENBRFc7SUFBQSxDQXBFYjs7QUEwRUE7QUFBQTs7T0ExRUE7O0FBQUEsd0JBNkVBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUVaLFVBQUEsbUNBQUE7QUFBQSxNQUZjLFlBQUEsTUFBTSxpQkFBQSxXQUFXLGVBQUEsU0FBUyxpQkFBQSxTQUV4QyxDQUFBO2FBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FDRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsSUFBbkIsRUFBeUIsSUFBekIsRUFBZDtNQUFBLENBQXJCLENBREYsRUFFRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsU0FBbkIsRUFBOEIsU0FBOUIsRUFBZDtNQUFBLENBQXJCLENBRkYsRUFHRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsUUFBcEIsRUFBOEIsT0FBOUIsRUFBZDtNQUFBLENBQXJCLENBSEYsRUFJRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsVUFBcEIsRUFBZ0MsU0FBaEMsRUFBZDtNQUFBLENBQXJCLENBSkYsRUFGWTtJQUFBLENBN0VkLENBQUE7O3FCQUFBOztNQWJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/languages/index.coffee
