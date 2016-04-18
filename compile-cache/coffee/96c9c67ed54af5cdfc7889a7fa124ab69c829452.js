
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "coffeescript", "coldfusion", "cpp", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "java", "javascript", "json", "jsx", "less", "markdown", 'marko', "mustache", "objective-c", "pawn", "perl", "php", "puppet", "python", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "vala", "visualforce", "xml", "xtemplate"];


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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsb0JBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FMSixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBSXJCLHdCQUFBLGFBQUEsR0FBZSxDQUNiLE1BRGEsRUFFYixTQUZhLEVBR2IsU0FIYSxFQUliLEdBSmEsRUFLYixjQUxhLEVBTWIsWUFOYSxFQU9iLEtBUGEsRUFRYixLQVJhLEVBU2IsS0FUYSxFQVViLEdBVmEsRUFXYixLQVhhLEVBWWIsS0FaYSxFQWFiLEtBYmEsRUFjYixRQWRhLEVBZWIsU0FmYSxFQWdCYixJQWhCYSxFQWlCYixTQWpCYSxFQWtCYixZQWxCYSxFQW1CYixTQW5CYSxFQW9CYixNQXBCYSxFQXFCYixNQXJCYSxFQXNCYixZQXRCYSxFQXVCYixNQXZCYSxFQXdCYixLQXhCYSxFQXlCYixNQXpCYSxFQTBCYixVQTFCYSxFQTJCYixPQTNCYSxFQTRCYixVQTVCYSxFQTZCYixhQTdCYSxFQThCYixNQTlCYSxFQStCYixNQS9CYSxFQWdDYixLQWhDYSxFQWlDYixRQWpDYSxFQWtDYixRQWxDYSxFQW1DYixRQW5DYSxFQW9DYixNQXBDYSxFQXFDYixNQXJDYSxFQXNDYixNQXRDYSxFQXVDYixNQXZDYSxFQXdDYixXQXhDYSxFQXlDYixLQXpDYSxFQTBDYixLQTFDYSxFQTJDYixNQTNDYSxFQTRDYixLQTVDYSxFQTZDYixNQTdDYSxFQThDYixZQTlDYSxFQStDYixNQS9DYSxFQWdEYixhQWhEYSxFQWlEYixLQWpEYSxFQWtEYixXQWxEYSxDQUFmLENBQUE7O0FBcURBO0FBQUE7O09BckRBOztBQUFBLHdCQXdEQSxTQUFBLEdBQVcsSUF4RFgsQ0FBQTs7QUEwREE7QUFBQTs7T0ExREE7O0FBQUEsd0JBNkRBLFVBQUEsR0FBWSxJQTdEWixDQUFBOztBQStEQTtBQUFBOztPQS9EQTs7QUFrRWEsSUFBQSxtQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGFBQVAsRUFBc0IsU0FBQyxJQUFELEdBQUE7ZUFDakMsT0FBQSxDQUFTLElBQUEsR0FBSSxJQUFiLEVBRGlDO01BQUEsQ0FBdEIsQ0FBYixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLFNBQVAsRUFBa0IsU0FBQyxRQUFELEdBQUE7ZUFBYyxRQUFRLENBQUMsVUFBdkI7TUFBQSxDQUFsQixDQUhkLENBRFc7SUFBQSxDQWxFYjs7QUF3RUE7QUFBQTs7T0F4RUE7O0FBQUEsd0JBMkVBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUVaLFVBQUEsbUNBQUE7QUFBQSxNQUZjLFlBQUEsTUFBTSxpQkFBQSxXQUFXLGVBQUEsU0FBUyxpQkFBQSxTQUV4QyxDQUFBO2FBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FDRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsSUFBbkIsRUFBeUIsSUFBekIsRUFBZDtNQUFBLENBQXJCLENBREYsRUFFRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsU0FBbkIsRUFBOEIsU0FBOUIsRUFBZDtNQUFBLENBQXJCLENBRkYsRUFHRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsUUFBcEIsRUFBOEIsT0FBOUIsRUFBZDtNQUFBLENBQXJCLENBSEYsRUFJRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsVUFBcEIsRUFBZ0MsU0FBaEMsRUFBZDtNQUFBLENBQXJCLENBSkYsRUFGWTtJQUFBLENBM0VkLENBQUE7O3FCQUFBOztNQWJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/languages/index.coffee
