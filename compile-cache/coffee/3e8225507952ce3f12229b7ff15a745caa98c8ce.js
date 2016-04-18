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
        var bufferPosition, editor, kernel, language, prefix, scopeDescriptor;
        editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
        console.log("getSuggestions: prefix:", prefix);
        prefix = this.getPrefix(editor, bufferPosition);
        console.log("getSuggestions: new prefix:", prefix);
        if (prefix.trim().length < 3) {
          return null;
        }
        language = editor.getGrammar().name.toLowerCase();
        kernel = KernelManager.getRunningKernelForLanguage(language);
        if (kernel == null) {
          return null;
        }
        return new Promise(function(resolve) {
          return kernel.complete(prefix, function(matches) {
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
