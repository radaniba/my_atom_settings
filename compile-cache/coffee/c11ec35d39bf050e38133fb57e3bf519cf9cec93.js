(function() {
  var AutocompleteProvider, KernelManager, _;

  _ = require('lodash');

  KernelManager = require('./kernel-manager');

  module.exports = AutocompleteProvider = (function() {
    var selector, selectors;
    selectors = _.map(KernelManager.getAvailableKernels(), function(_arg) {
      var language;
      language = _arg.language;
      return '.source.' + language.replace('coffeescript', 'coffee').replace('javascript', 'js');
    });
    selector = selectors.join(', ');
    return {
      selector: selector,
      disableForSelector: '.comment',
      defaultRegex: /([\w-][\.:\$]?)+$/,
      regexes: {
        r: /([^\d\W]|[.])[\w.$]*$/,
        julia: /([^\d\W]|[\u00A0-\uFFFF])[\w.!\u00A0-\uFFFF]*$/,
        python: /([^\d\W]|[\u00A0-\uFFFF])[\w.\u00A0-\uFFFF]*$/,
        php: /[$a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/
      },
      inclusionPriority: 1,
      getSuggestions: function(_arg) {
        var bufferPosition, editor, hasKernel, language, prefix, scopeDescriptor;
        editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
        console.log("suggestions requested for prefix:", prefix);
        prefix = this.getPrefix(editor, bufferPosition);
        console.log("new prefix:", prefix);
        language = editor.getGrammar().name.toLowerCase();
        hasKernel = KernelManager.languageHasRunningKernel(language);
        if (prefix.trim().length < 3 || !hasKernel) {
          return null;
        } else {
          return new Promise(function(resolve) {
            return KernelManager.complete(language, prefix, function(matches) {
              matches = _.map(matches, function(match) {
                return {
                  text: match,
                  replacementPrefix: prefix,
                  iconHTML: "<img src='" + __dirname + "/../static/logo.svg' style='width: 100%;'>"
                };
              });
              return resolve(matches);
            });
          });
        }
      },
      getPrefix: function(editor, bufferPosition) {
        var language, line, regex, _ref;
        language = editor.getGrammar().name.toLowerCase();
        regex = this.getRegexForLanguage(language);
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        return ((_ref = line.match(regex)) != null ? _ref[0] : void 0) || '';
      },
      getRegexForLanguage: function(language) {
        var trueLanguage;
        trueLanguage = KernelManager.getTrueLanguage(language);
        if (this.regexes[trueLanguage] != null) {
          return this.regexes[trueLanguage];
        } else {
          return this.defaultRegex;
        }
      },
      onDidInsertSuggestion: function(_arg) {
        var editor, suggestion, triggerPosition;
        editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
      },
      dispose: function() {}
    };
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUZoQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsb0JBQUEsR0FBMEIsQ0FBQSxTQUFBLEdBQUE7QUFDdkMsUUFBQSxtQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxHQUFGLENBQU0sYUFBYSxDQUFDLG1CQUFkLENBQUEsQ0FBTixFQUEyQyxTQUFDLElBQUQsR0FBQTtBQUNuRCxVQUFBLFFBQUE7QUFBQSxNQURxRCxXQUFELEtBQUMsUUFDckQsQ0FBQTthQUFBLFVBQUEsR0FBYSxRQUNULENBQUMsT0FEUSxDQUNBLGNBREEsRUFDZ0IsUUFEaEIsQ0FFVCxDQUFDLE9BRlEsQ0FFQSxZQUZBLEVBRWMsSUFGZCxFQURzQztJQUFBLENBQTNDLENBQVosQ0FBQTtBQUFBLElBSUEsUUFBQSxHQUFXLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixDQUpYLENBQUE7QUFLQSxXQUFPO0FBQUEsTUFDSCxRQUFBLEVBQVUsUUFEUDtBQUFBLE1BRUgsa0JBQUEsRUFBb0IsVUFGakI7QUFBQSxNQUlILFlBQUEsRUFBYyxtQkFKWDtBQUFBLE1BS0gsT0FBQSxFQUdJO0FBQUEsUUFBQSxDQUFBLEVBQUcsdUJBQUg7QUFBQSxRQUdBLEtBQUEsRUFBTyxnREFIUDtBQUFBLFFBTUEsTUFBQSxFQUFRLCtDQU5SO0FBQUEsUUFTQSxHQUFBLEVBQUssNENBVEw7T0FSRDtBQUFBLE1Bc0JI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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/autocomplete-provider.coffee
