(function() {
  module.exports = {
    config: {
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      }
    },
    activate: function(state) {
      return require('./provider').constructor();
    },
    deactivate: function() {
      return require('./provider').dispose();
    },
    getProvider: function() {
      return require('./provider');
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      return require('./provider').setSnippetsManager(snippetsManager);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLENBRlA7QUFBQSxRQUdBLEtBQUEsRUFBTyxtQkFIUDtBQUFBLFFBSUEsV0FBQSxFQUFhLGdEQUpiO09BREY7QUFBQSxNQU1BLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8sQ0FGUDtBQUFBLFFBR0EsTUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsVUFBaEIsQ0FITjtBQUFBLFFBSUEsS0FBQSxFQUFPLGtDQUpQO0FBQUEsUUFLQSxXQUFBLEVBQWEseVJBTGI7T0FQRjtBQUFBLE1BaUJBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8sQ0FGUDtBQUFBLFFBR0EsS0FBQSxFQUFPLHlCQUhQO0FBQUEsUUFJQSxXQUFBLEVBQWEsZzZCQUpiO09BbEJGO0FBQUEsTUFxQ0EsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyxDQUZQO0FBQUEsUUFHQSxLQUFBLEVBQU8sMEJBSFA7QUFBQSxRQUlBLFdBQUEsRUFBYSwwYUFKYjtPQXRDRjtBQUFB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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/main.coffee
