(function() {
  var AutocompleteProvider, Config, KernelManager, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  Config = require('./config');

  KernelManager = require('./kernel-manager');

  module.exports = AutocompleteProvider = (function() {
    var languageMappings, selector, selectors;
    languageMappings = Config.getJson('languageMappings');
    selectors = _.uniq(KernelManager.getAllKernelSpecs().map(function(_arg) {
      var language;
      language = _arg.language;
      if (__indexOf.call(languageMappings, language) >= 0) {
        return '.source.' + languageMappings[language].toLowerCase();
      }
      return '.source.' + language.toLowerCase();
    }));
    selector = selectors.join(', ').replace('coffeescript', 'coffee').replace('javascript', 'js');
    console.log('AutocompleteProvider: selector =', selector);
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
        var bufferPosition, editor, grammar, grammarLanguage, kernel, prefix, scopeDescriptor;
        editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
        console.log("getSuggestions: prefix:", prefix);
        prefix = this.getPrefix(editor, bufferPosition);
        console.log("getSuggestions: new prefix:", prefix);
        if (prefix.trim().length < 3) {
          return null;
        }
        grammar = editor.getGrammar();
        grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
        kernel = KernelManager.getRunningKernelFor(grammarLanguage);
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
        var grammar, grammarLanguage, line, regex, _ref, _ref1;
        grammar = editor.getGrammar();
        grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
        regex = (_ref = this.regexes[grammarLanguage]) != null ? _ref : this.defaultRegex;
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        return ((_ref1 = line.match(regex)) != null ? _ref1[0] : void 0) || '';
      },
      onDidInsertSuggestion: function(_arg) {
        var editor, suggestion, triggerPosition;
        editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
      },
      dispose: function() {}
    };
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFHQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUhoQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsb0JBQUEsR0FBMEIsQ0FBQSxTQUFBLEdBQUE7QUFDdkMsUUFBQSxxQ0FBQTtBQUFBLElBQUEsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLE9BQVAsQ0FBZSxrQkFBZixDQUFuQixDQUFBO0FBQUEsSUFFQSxTQUFBLEdBQVksQ0FBQyxDQUFDLElBQUYsQ0FBTyxhQUFhLENBQUMsaUJBQWQsQ0FBQSxDQUFpQyxDQUFDLEdBQWxDLENBQXNDLFNBQUMsSUFBRCxHQUFBO0FBQ3JELFVBQUEsUUFBQTtBQUFBLE1BRHVELFdBQUQsS0FBQyxRQUN2RCxDQUFBO0FBQUEsTUFBQSxJQUFHLGVBQVksZ0JBQVosRUFBQSxRQUFBLE1BQUg7QUFDSSxlQUFPLFVBQUEsR0FBYSxnQkFBaUIsQ0FBQSxRQUFBLENBQVMsQ0FBQyxXQUEzQixDQUFBLENBQXBCLENBREo7T0FBQTtBQUVBLGFBQU8sVUFBQSxHQUFhLFFBQVEsQ0FBQyxXQUFULENBQUEsQ0FBcEIsQ0FIcUQ7SUFBQSxDQUF0QyxDQUFQLENBRlosQ0FBQTtBQUFBLElBT0EsUUFBQSxHQUFXLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixDQUNQLENBQUMsT0FETSxDQUNFLGNBREYsRUFDa0Is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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/autocomplete-provider.coffee
