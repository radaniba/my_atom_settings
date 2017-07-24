(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions (macOS only)',
        description: 'Kite is a cloud powered autocomplete engine. It provides\nsignificantly more autocomplete suggestions than the local Jedi engine.'
      },
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
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, DecisionMaker = ref2.DecisionMaker, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
      if (atom.config.get('kite.loggingLevel')) {
        Logger.LEVEL = Logger.LEVELS[atom.config.get('kite.loggingLevel').toUpperCase()];
      }
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, function(m) {
        return m.element;
      });
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      dm = new DecisionMaker(editorCfg, pluginCfg);
      Metrics.Tracker.name = "atom acp";
      atom.packages.onDidActivatePackage((function(_this) {
        return function(pkg) {
          if (pkg.name === 'kite') {
            _this.patchKiteCompletions(pkg);
            return Metrics.Tracker.name = "atom kite+acp";
          }
        };
      })(this));
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, throttle;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          throttle = dm.shouldOfferKite(event);
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([throttle, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                _this.track("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                _this.track("flow aborted");
                return atom.config.set('autocomplete-python.useKite', false);
              });
              projectPath = atom.project.getPaths()[0];
              root = (projectPath != null) && path.relative(os.homedir(), projectPath).indexOf('..') === 0 ? path.parse(projectPath).root : os.homedir();
              installer = new Installer([root]);
              installer.init(_this.installation.flow, function() {
                Logger.verbose('in onFinish');
                return atom.packages.activatePackage('kite');
              });
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                _this.track("skipped kite");
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', function(arg) {
        var newValue, oldValue;
        newValue = arg.newValue, oldValue = arg.oldValue;
        if (newValue) {
          checkKiteInstallation();
          return AtomHelper.enablePackage();
        } else {
          return AtomHelper.disablePackage();
        }
      });
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      this.disposables.add(disposable);
      return this._loadKite();
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    },
    trackCompletions: function() {
      var promises;
      promises = [atom.packages.activatePackage('autocomplete-plus')];
      if (atom.packages.getLoadedPackage('kite') != null) {
        this.disposables.add(atom.config.observe('kite.loggingLevel', function(level) {
          return Logger.LEVEL = Logger.LEVELS[(level != null ? level : 'info').toUpperCase()];
        }));
        promises.push(atom.packages.activatePackage('kite'));
        Metrics.Tracker.name = "atom kite+acp";
      }
      return Promise.all(promises).then((function(_this) {
        return function(arg) {
          var autocompleteManager, autocompletePlus, kite, safeConfirm, safeDisplaySuggestions;
          autocompletePlus = arg[0], kite = arg[1];
          if (kite != null) {
            _this.patchKiteCompletions(kite);
          }
          autocompleteManager = autocompletePlus.mainModule.getAutocompleteManager();
          if (!((autocompleteManager != null) && (autocompleteManager.confirm != null) && (autocompleteManager.displaySuggestions != null))) {
            return;
          }
          safeConfirm = autocompleteManager.confirm;
          safeDisplaySuggestions = autocompleteManager.displaySuggestions;
          autocompleteManager.displaySuggestions = function(suggestions, options) {
            _this.trackSuggestions(suggestions, autocompleteManager.editor);
            return safeDisplaySuggestions.call(autocompleteManager, suggestions, options);
          };
          return autocompleteManager.confirm = function(suggestion) {
            _this.trackUsedSuggestion(suggestion, autocompleteManager.editor);
            return safeConfirm.call(autocompleteManager, suggestion);
          };
        };
      })(this));
    },
    trackSuggestions: function(suggestions, editor) {
      var hasJediSuggestions, hasKiteSuggestions;
      if (/\.py$/.test(editor.getPath()) && (this.kiteProvider != null)) {
        hasKiteSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.kiteProvider;
          };
        })(this));
        hasJediSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.provider;
          };
        })(this));
        if (hasKiteSuggestions && hasJediSuggestions) {
          return this.track('Atom shows both Kite and Jedi completions');
        } else if (hasKiteSuggestions) {
          return this.track('Atom shows Kite but not Jedi completions');
        } else if (hasJediSuggestions) {
          return this.track('Atom shows Jedi but not Kite completions');
        } else {
          return this.track('Atom shows neither Kite nor Jedi completions');
        }
      }
    },
    patchKiteCompletions: function(kite) {
      var getSuggestions;
      if (this.kitePackage != null) {
        return;
      }
      this.kitePackage = kite.mainModule;
      this.kiteProvider = this.kitePackage.completions();
      getSuggestions = this.kiteProvider.getSuggestions;
      return this.kiteProvider.getSuggestions = (function(_this) {
        return function() {
          var args, ref2, ref3;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return getSuggestions != null ? (ref2 = getSuggestions.apply(_this.kiteProvider, args)) != null ? (ref3 = ref2.then(function(suggestions) {
            _this.lastKiteSuggestions = suggestions;
            _this.kiteSuggested = suggestions != null;
            return suggestions;
          })) != null ? ref3["catch"](function(err) {
            _this.lastKiteSuggestions = [];
            _this.kiteSuggested = false;
            throw err;
          }) : void 0 : void 0 : void 0;
        };
      })(this);
    },
    trackUsedSuggestion: function(suggestion, editor) {
      var altSuggestion;
      if (/\.py$/.test(editor.getPath())) {
        if (this.kiteProvider != null) {
          if (this.lastKiteSuggestions != null) {
            if (indexOf.call(this.lastKiteSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.provider.lastSuggestions || []);
              if (altSuggestion != null) {
                return this.track('used completion returned by Kite but also returned by Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion),
                  jediHasDocumentation: this.hasDocumentation(altSuggestion)
                });
              } else {
                return this.track('used completion returned by Kite but not Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.lastKiteSuggestions);
              if (altSuggestion != null) {
                return this.track('used completion returned by Jedi but also returned by Kite', {
                  kiteHasDocumentation: this.hasDocumentation(altSuggestion),
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                if (this.kitePackage.isEditorWhitelisted != null) {
                  if (this.kitePackage.isEditorWhitelisted(editor)) {
                    return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  } else {
                    return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  }
                } else {
                  return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                    jediHasDocumentation: this.hasDocumentation(suggestion)
                  });
                }
              }
            } else {
              return this.track('used completion from neither Kite nor Jedi');
            }
          } else {
            if (this.kitePackage.isEditorWhitelisted != null) {
              if (this.kitePackage.isEditorWhitelisted(editor)) {
                return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else {
              return this.track('used completion returned by Jedi but not Kite (not-whitelisted filepath)', {
                jediHasDocumentation: this.hasDocumentation(suggestion)
              });
            }
          }
        } else {
          if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            return this.track('used completion returned by Jedi', {
              jediHasDocumentation: this.hasDocumentation(suggestion)
            });
          } else {
            return this.track('used completion not returned by Jedi');
          }
        }
      }
    },
    hasSameSuggestion: function(suggestion, suggestions) {
      return suggestions.filter(function(s) {
        return s.text === suggestion.text;
      })[0];
    },
    hasDocumentation: function(suggestion) {
      return ((suggestion.description != null) && suggestion.description !== '') || ((suggestion.descriptionMarkdown != null) && suggestion.descriptionMarkdown !== '');
    },
    track: function(msg, data) {
      var e;
      try {
        return Metrics.Tracker.trackEvent(msg, data);
      } catch (error) {
        e = error;
        if (e instanceof TypeError) {
          return console.error(e);
        } else {
          throw e;
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0VBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixPQUFvQixFQUFwQixFQUFDLGlCQUFELEVBQVU7O0VBRVYsTUFBTSxDQUFDLEtBQVAsR0FBZTs7RUFDZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsT0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTywyQ0FIUDtRQUlBLFdBQUEsRUFBYSxtSUFKYjtPQURGO01BT0EsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sbUJBSFA7UUFJQSxXQUFBLEVBQWEsZ0RBSmI7T0FSRjtNQWFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsVUFBaEIsQ0FITjtRQUlBLEtBQUEsRUFBTyxrQ0FKUDtRQUtBLFdBQUEsRUFBYSx5UkFMYjtPQWRGO01Bd0JBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxF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RU07UUFFSixJQUFHLENBQUEsWUFBYSxTQUFoQjtpQkFDRSxPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsRUFERjtTQUFBLE1BQUE7QUFHRSxnQkFBTSxFQUhSO1NBSkY7O0lBREssQ0E5WFA7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJvcyA9IHJlcXVpcmUgJ29zJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5bTWV0cmljcywgTG9nZ2VyXSA9IFtdXG5cbndpbmRvdy5ERUJVRyA9IGZhbHNlXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB1c2VLaXRlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMFxuICAgICAgdGl0bGU6ICdVc2UgS2l0ZS1wb3dlcmVkIENvbXBsZXRpb25zIChtYWNPUyBvbmx5KSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydLaXRlIGlzIGEgY2xvdWQgcG93ZXJlZCBhdXRvY29tcGxldGUgZW5naW5lLiBJdCBwcm92aWRlc1xuICAgICAgc2lnbmlmaWNhbnRseSBtb3JlIGF1dG9jb21wbGV0ZSBzdWdnZXN0aW9ucyB0aGFuIHRoZSBsb2NhbCBKZWRpIGVuZ2luZS4nJydcbiAgICBzaG93RGVzY3JpcHRpb25zOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMVxuICAgICAgdGl0bGU6ICdTaG93IERlc2NyaXB0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBkb2Mgc3RyaW5ncyBmcm9tIGZ1bmN0aW9ucywgY2xhc3NlcywgZXRjLidcbiAgICB1c2VTbmlwcGV0czpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnbm9uZSdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBlbnVtOiBbJ25vbmUnLCAnYWxsJywgJ3JlcXVpcmVkJ11cbiAgICAgIHRpdGxlOiAnQXV0b2NvbXBsZXRlIEZ1bmN0aW9uIFBhcmFtZXRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQXV0b21hdGljYWxseSBjb21wbGV0ZSBmdW5jdGlvbiBhcmd1bWVudHMgYWZ0ZXIgdHlwaW5nXG4gICAgICBsZWZ0IHBhcmVudGhlc2lzIGNoYXJhY3Rlci4gVXNlIGNvbXBsZXRpb24ga2V5IHRvIGp1bXAgYmV0d2VlblxuICAgICAgYXJndW1lbnRzLiBTZWUgYGF1dG9jb21wbGV0ZS1weXRob246Y29tcGxldGUtYXJndW1lbnRzYCBjb21tYW5kIGlmIHlvdVxuICAgICAgd2FudCB0byB0cmlnZ2VyIGFyZ3VtZW50IGNvbXBsZXRpb25zIG1hbnVhbGx5LiBTZWUgUkVBRE1FIGlmIGl0IGRvZXMgbm90XG4gICAgICB3b3JrIGZvciB5b3UuJycnXG4gICAgcHl0aG9uUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiAzXG4gICAgICB0aXRsZTogJ1B5dGhvbiBFeGVjdXRhYmxlIFBhdGhzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ09wdGlvbmFsIHNlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBwYXRocyB0byBweXRob25cbiAgICAgIGV4ZWN1dGFibGVzIChpbmNsdWRpbmcgZXhlY3V0YWJsZSBuYW1lcyksIHdoZXJlIHRoZSBmaXJzdCBvbmUgd2lsbCB0YWtlXG4gICAgICBoaWdoZXIgcHJpb3JpdHkgb3ZlciB0aGUgbGFzdCBvbmUuIEJ5IGRlZmF1bHQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aWxsXG4gICAgICBhdXRvbWF0aWNhbGx5IGxvb2sgZm9yIHZpcnR1YWwgZW52aXJvbm1lbnRzIGluc2lkZSBvZiB5b3VyIHByb2plY3QgYW5kXG4gICAgICB0cnkgdG8gdXNlIHRoZW0gYXMgd2VsbCBhcyB0cnkgdG8gZmluZCBnbG9iYWwgcHl0aG9uIGV4ZWN1dGFibGUuIElmIHlvdVxuICAgICAgdXNlIHRoaXMgY29uZmlnLCBhdXRvbWF0aWMgbG9va3VwIHdpbGwgaGF2ZSBsb3dlc3QgcHJpb3JpdHkuXG4gICAgICBVc2UgYCRQUk9KRUNUYCBvciBgJFBST0pFQ1RfTkFNRWAgc3Vic3RpdHV0aW9uIGZvciBwcm9qZWN0LXNwZWNpZmljXG4gICAgICBwYXRocyB0byBwb2ludCBvbiBleGVjdXRhYmxlcyBpbiB2aXJ0dWFsIGVudmlyb25tZW50cy5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYC9Vc2Vycy9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2Jpbi9weXRob247JFBST0pFQ1QvdmVudi9iaW4vcHl0aG9uMzsvdXNyL2Jpbi9weXRob25gLlxuICAgICAgU3VjaCBjb25maWcgd2lsbCBmYWxsIGJhY2sgb24gYC91c3IvYmluL3B5dGhvbmAgZm9yIHByb2plY3RzIG5vdCBwcmVzZW50ZWRcbiAgICAgIHdpdGggc2FtZSBuYW1lIGluIGAudmlydHVhbGVudnNgIGFuZCB3aXRob3V0IGB2ZW52YCBmb2xkZXIgaW5zaWRlIG9mIG9uZVxuICAgICAgb2YgcHJvamVjdCBmb2xkZXJzLlxuICAgICAgSWYgeW91IGFyZSB1c2luZyBweXRob24zIGV4ZWN1dGFibGUgd2hpbGUgY29kaW5nIGZvciBweXRob24yIHlvdSB3aWxsIGdldFxuICAgICAgcHl0aG9uMiBjb21wbGV0aW9ucyBmb3Igc29tZSBidWlsdC1pbnMuJycnXG4gICAgZXh0cmFQYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDRcbiAgICAgIHRpdGxlOiAnRXh0cmEgUGF0aHMgRm9yIFBhY2thZ2VzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBtb2R1bGVzIHRvIGFkZGl0aW9uYWxseVxuICAgICAgaW5jbHVkZSBmb3IgYXV0b2NvbXBsZXRlLiBZb3UgY2FuIHVzZSBzYW1lIHN1YnN0aXR1dGlvbnMgYXMgaW5cbiAgICAgIGBQeXRob24gRXhlY3V0YWJsZSBQYXRoc2AuXG4gICAgICBOb3RlIHRoYXQgaXQgc3RpbGwgc2hvdWxkIGJlIHZhbGlkIHB5dGhvbiBwYWNrYWdlLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgJFBST0pFQ1QvZW52L2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2BcbiAgICAgIG9yXG4gICAgICBgL1VzZXIvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgLlxuICAgICAgWW91IGRvbid0IG5lZWQgdG8gc3BlY2lmeSBleHRyYSBwYXRocyBmb3IgbGlicmFyaWVzIGluc3RhbGxlZCB3aXRoIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZSB5b3UgdXNlLicnJ1xuICAgIGNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA1XG4gICAgICB0aXRsZTogJ0Nhc2UgSW5zZW5zaXRpdmUgQ29tcGxldGlvbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGNvbXBsZXRpb24gaXMgYnkgZGVmYXVsdCBjYXNlIGluc2Vuc2l0aXZlLidcbiAgICB0cmlnZ2VyQ29tcGxldGlvblJlZ2V4OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcoW1xcLlxcIChdfFthLXpBLVpfXVthLXpBLVowLTlfXSopJ1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHRpdGxlOiAnUmVnZXggVG8gVHJpZ2dlciBBdXRvY29tcGxldGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQnkgZGVmYXVsdCBjb21wbGV0aW9ucyB0cmlnZ2VyZWQgYWZ0ZXIgd29yZHMsIGRvdHMsIHNwYWNlc1xuICAgICAgYW5kIGxlZnQgcGFyZW50aGVzaXMuIFlvdSB3aWxsIG5lZWQgdG8gcmVzdGFydCB5b3VyIGVkaXRvciBhZnRlciBjaGFuZ2luZ1xuICAgICAgdGhpcy4nJydcbiAgICBmdXp6eU1hdGNoZXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA3XG4gICAgICB0aXRsZTogJ1VzZSBGdXp6eSBNYXRjaGVyIEZvciBDb21wbGV0aW9ucy4nXG4gICAgICBkZXNjcmlwdGlvbjogJycnVHlwaW5nIGBzdGRyYCB3aWxsIG1hdGNoIGBzdGRlcnJgLlxuICAgICAgRmlyc3QgY2hhcmFjdGVyIHNob3VsZCBhbHdheXMgbWF0Y2guIFVzZXMgYWRkaXRpb25hbCBjYWNoaW5nIHRodXNcbiAgICAgIGNvbXBsZXRpb25zIHNob3VsZCBiZSBmYXN0ZXIuIE5vdGUgdGhhdCB0aGlzIHNldHRpbmcgZG9lcyBub3QgYWZmZWN0XG4gICAgICBidWlsdC1pbiBhdXRvY29tcGxldGUtcGx1cyBwcm92aWRlci4nJydcbiAgICBvdXRwdXRQcm92aWRlckVycm9yczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA4XG4gICAgICB0aXRsZTogJ091dHB1dCBQcm92aWRlciBFcnJvcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSB0aGUgcHJvdmlkZXIgZXJyb3JzIHdoZW5cbiAgICAgIHRoZXkgaGFwcGVuLiBCeSBkZWZhdWx0IHRoZXkgYXJlIGhpZGRlbi4gTm90ZSB0aGF0IGNyaXRpY2FsIGVycm9ycyBhcmVcbiAgICAgIGFsd2F5cyBzaG93bi4nJydcbiAgICBvdXRwdXREZWJ1ZzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA5XG4gICAgICB0aXRsZTogJ091dHB1dCBEZWJ1ZyBMb2dzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgZGVidWcgaW5mb3JtYXRpb24gaW5cbiAgICAgIGRldmVsb3BlciB0b29scyBsb2dzLiBNYXkgc2xvdyBkb3duIHlvdXIgZWRpdG9yLicnJ1xuICAgIHNob3dUb29sdGlwczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxMFxuICAgICAgdGl0bGU6ICdTaG93IFRvb2x0aXBzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIG9iamVjdCB1bmRlciB0aGUgY3Vyc29yJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0VYUEVSSU1FTlRBTCBGRUFUVVJFIFdISUNIIElTIE5PVCBGSU5JU0hFRCBZRVQuXG4gICAgICBGZWVkYmFjayBhbmQgaWRlYXMgYXJlIHdlbGNvbWUgb24gZ2l0aHViLicnJ1xuICAgIHN1Z2dlc3Rpb25Qcmlvcml0eTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogM1xuICAgICAgbWluaW11bTogMFxuICAgICAgbWF4aW11bTogOTlcbiAgICAgIG9yZGVyOiAxMVxuICAgICAgdGl0bGU6ICdTdWdnZXN0aW9uIFByaW9yaXR5J1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1lvdSBjYW4gdXNlIHRoaXMgdG8gc2V0IHRoZSBwcmlvcml0eSBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvblxuICAgICAgc3VnZ2VzdGlvbnMuIEZvciBleGFtcGxlLCB5b3UgY2FuIHVzZSBsb3dlciB2YWx1ZSB0byBnaXZlIGhpZ2hlciBwcmlvcml0eVxuICAgICAgZm9yIHNuaXBwZXRzIGNvbXBsZXRpb25zIHdoaWNoIGhhcyBwcmlvcml0eSBvZiAyLicnJ1xuXG4gIGluc3RhbGxhdGlvbjogbnVsbFxuXG4gIF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQ6IChncmFtbWFyKSAtPlxuICAgICMgdGhpcyBzaG91bGQgYmUgc2FtZSB3aXRoIGFjdGl2YXRpb25Ib29rcyBuYW1lc1xuICAgIGlmIGdyYW1tYXIucGFja2FnZU5hbWUgaW4gWydsYW5ndWFnZS1weXRob24nLCAnTWFnaWNQeXRob24nLCAnYXRvbS1kamFuZ28nXVxuICAgICAgQHByb3ZpZGVyLmxvYWQoKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWxvYWQtcHJvdmlkZXInXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgX2xvYWRLaXRlOiAtPlxuICAgIGZpcnN0SW5zdGFsbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcpID09IG51bGxcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnLCB0cnVlKVxuICAgIGxvbmdSdW5uaW5nID0gcmVxdWlyZSgncHJvY2VzcycpLnVwdGltZSgpID4gMTBcbiAgICBpZiBmaXJzdEluc3RhbGwgYW5kIGxvbmdSdW5uaW5nXG4gICAgICBldmVudCA9IFwiaW5zdGFsbGVkXCJcbiAgICBlbHNlIGlmIGZpcnN0SW5zdGFsbFxuICAgICAgZXZlbnQgPSBcInVwZ3JhZGVkXCJcbiAgICBlbHNlXG4gICAgICBldmVudCA9IFwicmVzdGFydGVkXCJcblxuICAgIHtcbiAgICAgIEFjY291bnRNYW5hZ2VyLFxuICAgICAgQXRvbUhlbHBlcixcbiAgICAgIERlY2lzaW9uTWFrZXIsXG4gICAgICBJbnN0YWxsYXRpb24sXG4gICAgICBJbnN0YWxsZXIsXG4gICAgICBNZXRyaWNzLFxuICAgICAgTG9nZ2VyLFxuICAgICAgU3RhdGVDb250cm9sbGVyXG4gICAgfSA9IHJlcXVpcmUgJ2tpdGUtaW5zdGFsbGVyJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpXG4gICAgICBMb2dnZXIuTEVWRUwgPSBMb2dnZXIuTEVWRUxTW2F0b20uY29uZmlnLmdldCgna2l0ZS5sb2dnaW5nTGV2ZWwnKS50b1VwcGVyQ2FzZSgpXVxuXG4gICAgQWNjb3VudE1hbmFnZXIuaW5pdENsaWVudCAnYWxwaGEua2l0ZS5jb20nLCAtMSwgdHJ1ZVxuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyIEluc3RhbGxhdGlvbiwgKG0pIC0+IG0uZWxlbWVudFxuICAgIGVkaXRvckNmZyA9XG4gICAgICBVVUlEOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbWV0cmljcy51c2VySWQnKVxuICAgICAgbmFtZTogJ2F0b20nXG4gICAgcGx1Z2luQ2ZnID1cbiAgICAgIG5hbWU6ICdhdXRvY29tcGxldGUtcHl0aG9uJ1xuICAgIGRtID0gbmV3IERlY2lzaW9uTWFrZXIgZWRpdG9yQ2ZnLCBwbHVnaW5DZmdcblxuICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGFjcFwiXG5cbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpID0+XG4gICAgICBpZiBwa2cubmFtZSBpcyAna2l0ZSdcbiAgICAgICAgQHBhdGNoS2l0ZUNvbXBsZXRpb25zKHBrZylcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20ga2l0ZSthY3BcIlxuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uID0gKCkgPT5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYW5JbnN0YWxsID0gU3RhdGVDb250cm9sbGVyLmNhbkluc3RhbGxLaXRlKClcbiAgICAgIHRocm90dGxlID0gZG0uc2hvdWxkT2ZmZXJLaXRlKGV2ZW50KVxuICAgICAgUHJvbWlzZS5hbGwoW3Rocm90dGxlLCBjYW5JbnN0YWxsXSkudGhlbigodmFsdWVzKSA9PlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgdmFyaWFudCA9IHZhbHVlc1swXVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMgPSB2YXJpYW50XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aXRsZSA9IFwiQ2hvb3NlIGEgYXV0b2NvbXBsZXRlLXB5dGhvbiBlbmdpbmVcIlxuICAgICAgICBAaW5zdGFsbGF0aW9uID0gbmV3IEluc3RhbGxhdGlvbiB2YXJpYW50LCB0aXRsZVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmFjY291bnRDcmVhdGVkKCgpID0+XG4gICAgICAgICAgQHRyYWNrIFwiYWNjb3VudCBjcmVhdGVkXCJcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgKVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmZsb3dTa2lwcGVkKCgpID0+XG4gICAgICAgICAgQHRyYWNrIFwiZmxvdyBhYm9ydGVkXCJcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgIClcbiAgICAgICAgW3Byb2plY3RQYXRoXSA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIHJvb3QgPSBpZiBwcm9qZWN0UGF0aD8gYW5kIHBhdGgucmVsYXRpdmUob3MuaG9tZWRpcigpLCBwcm9qZWN0UGF0aCkuaW5kZXhPZignLi4nKSBpcyAwXG4gICAgICAgICAgcGF0aC5wYXJzZShwcm9qZWN0UGF0aCkucm9vdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3MuaG9tZWRpcigpXG5cbiAgICAgICAgaW5zdGFsbGVyID0gbmV3IEluc3RhbGxlcihbcm9vdF0pXG4gICAgICAgIGluc3RhbGxlci5pbml0IEBpbnN0YWxsYXRpb24uZmxvdywgLT5cbiAgICAgICAgICBMb2dnZXIudmVyYm9zZSgnaW4gb25GaW5pc2gnKVxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdraXRlJylcblxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvdy5vblNraXBJbnN0YWxsICgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICAgIEB0cmFjayBcInNraXBwZWQga2l0ZVwiXG4gICAgICAgICAgcGFuZS5kZXN0cm95QWN0aXZlSXRlbSgpXG4gICAgICAgIHBhbmUuYWRkSXRlbSBAaW5zdGFsbGF0aW9uLCBpbmRleDogMFxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXggMFxuICAgICAgLCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIudHlwZSA9PSAnZGVuaWVkJ1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICkgaWYgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsICh7IG5ld1ZhbHVlLCBvbGRWYWx1ZSB9KSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uKClcbiAgICAgICAgQXRvbUhlbHBlci5lbmFibGVQYWNrYWdlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQXRvbUhlbHBlci5kaXNhYmxlUGFja2FnZSgpXG5cbiAgbG9hZDogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBkaXNwb3NhYmxlID0gZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZ3JhbW1hcilcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBfbG9hZEtpdGUoKVxuICAgICMgQHRyYWNrQ29tcGxldGlvbnMoKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUoJy4vcHJvdmlkZXInKVxuICAgIGlmIHR5cGVvZiBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcyA9PSAnZnVuY3Rpb24nIGFuZFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcygpXG4gICAgICBAbG9hZCgpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAbG9hZCgpXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAcHJvdmlkZXIuZGlzcG9zZSgpIGlmIEBwcm92aWRlclxuICAgIEBpbnN0YWxsYXRpb24uZGVzdHJveSgpIGlmIEBpbnN0YWxsYXRpb25cblxuICBnZXRQcm92aWRlcjogLT5cbiAgICByZXR1cm4gQHByb3ZpZGVyXG5cbiAgZ2V0SHlwZXJjbGlja1Byb3ZpZGVyOiAtPlxuICAgIHJldHVybiByZXF1aXJlKCcuL2h5cGVyY2xpY2stcHJvdmlkZXInKVxuXG4gIGNvbnN1bWVTbmlwcGV0czogKHNuaXBwZXRzTWFuYWdlcikgLT5cbiAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1sb2FkLXByb3ZpZGVyJywgPT5cbiAgICAgIEBwcm92aWRlci5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIHRyYWNrQ29tcGxldGlvbnM6IC0+XG4gICAgcHJvbWlzZXMgPSBbYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJyldXG5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2tpdGUnKT9cblxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdraXRlLmxvZ2dpbmdMZXZlbCcsIChsZXZlbCkgLT5cbiAgICAgICAgTG9nZ2VyLkxFVkVMID0gTG9nZ2VyLkxFVkVMU1sobGV2ZWwgPyAnaW5mbycpLnRvVXBwZXJDYXNlKCldXG5cbiAgICAgIHByb21pc2VzLnB1c2goYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKSlcbiAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuIChbYXV0b2NvbXBsZXRlUGx1cywga2l0ZV0pID0+XG4gICAgICBpZiBraXRlP1xuICAgICAgICBAcGF0Y2hLaXRlQ29tcGxldGlvbnMoa2l0ZSlcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IGF1dG9jb21wbGV0ZVBsdXMubWFpbk1vZHVsZS5nZXRBdXRvY29tcGxldGVNYW5hZ2VyKClcblxuICAgICAgcmV0dXJuIHVubGVzcyBhdXRvY29tcGxldGVNYW5hZ2VyPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnM/XG5cbiAgICAgIHNhZmVDb25maXJtID0gYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtXG4gICAgICBzYWZlRGlzcGxheVN1Z2dlc3Rpb25zID0gYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnNcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zID0gKHN1Z2dlc3Rpb25zLCBvcHRpb25zKSA9PlxuICAgICAgICBAdHJhY2tTdWdnZXN0aW9ucyhzdWdnZXN0aW9ucywgYXV0b2NvbXBsZXRlTWFuYWdlci5lZGl0b3IpXG4gICAgICAgIHNhZmVEaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbChhdXRvY29tcGxldGVNYW5hZ2VyLCBzdWdnZXN0aW9ucywgb3B0aW9ucylcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtID0gKHN1Z2dlc3Rpb24pID0+XG4gICAgICAgIEB0cmFja1VzZWRTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIGF1dG9jb21wbGV0ZU1hbmFnZXIuZWRpdG9yKVxuICAgICAgICBzYWZlQ29uZmlybS5jYWxsKGF1dG9jb21wbGV0ZU1hbmFnZXIsIHN1Z2dlc3Rpb24pXG5cbiAgdHJhY2tTdWdnZXN0aW9uczogKHN1Z2dlc3Rpb25zLCBlZGl0b3IpIC0+XG4gICAgaWYgL1xcLnB5JC8udGVzdChlZGl0b3IuZ2V0UGF0aCgpKSBhbmQgQGtpdGVQcm92aWRlcj9cbiAgICAgIGhhc0tpdGVTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLnNvbWUgKHMpID0+IHMucHJvdmlkZXIgaXMgQGtpdGVQcm92aWRlclxuICAgICAgaGFzSmVkaVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuc29tZSAocykgPT4gcy5wcm92aWRlciBpcyBAcHJvdmlkZXJcblxuICAgICAgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zIGFuZCBoYXNKZWRpU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIGJvdGggS2l0ZSBhbmQgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBLaXRlIGJ1dCBub3QgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzSmVkaVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBKZWRpIGJ1dCBub3QgS2l0ZSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIG5laXRoZXIgS2l0ZSBub3IgSmVkaSBjb21wbGV0aW9ucydcblxuICBwYXRjaEtpdGVDb21wbGV0aW9uczogKGtpdGUpIC0+XG4gICAgcmV0dXJuIGlmIEBraXRlUGFja2FnZT9cblxuICAgIEBraXRlUGFja2FnZSA9IGtpdGUubWFpbk1vZHVsZVxuICAgIEBraXRlUHJvdmlkZXIgPSBAa2l0ZVBhY2thZ2UuY29tcGxldGlvbnMoKVxuICAgIGdldFN1Z2dlc3Rpb25zID0gQGtpdGVQcm92aWRlci5nZXRTdWdnZXN0aW9uc1xuICAgIEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMgPSAoYXJncy4uLikgPT5cbiAgICAgIGdldFN1Z2dlc3Rpb25zPy5hcHBseShAa2l0ZVByb3ZpZGVyLCBhcmdzKVxuICAgICAgPy50aGVuIChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgQGxhc3RLaXRlU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9uc1xuICAgICAgICBAa2l0ZVN1Z2dlc3RlZCA9IHN1Z2dlc3Rpb25zP1xuICAgICAgICBzdWdnZXN0aW9uc1xuICAgICAgPy5jYXRjaCAoZXJyKSA9PlxuICAgICAgICBAbGFzdEtpdGVTdWdnZXN0aW9ucyA9IFtdXG4gICAgICAgIEBraXRlU3VnZ2VzdGVkID0gZmFsc2VcbiAgICAgICAgdGhyb3cgZXJyXG5cbiAgdHJhY2tVc2VkU3VnZ2VzdGlvbjogKHN1Z2dlc3Rpb24sIGVkaXRvcikgLT5cbiAgICBpZiAvXFwucHkkLy50ZXN0KGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpZiBAa2l0ZVByb3ZpZGVyP1xuICAgICAgICBpZiBAbGFzdEtpdGVTdWdnZXN0aW9ucz9cbiAgICAgICAgICBpZiBzdWdnZXN0aW9uIGluIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgICAgICBhbHRTdWdnZXN0aW9uID0gQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgb3IgW10pXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBLaXRlIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgS2l0ZSBidXQgbm90IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgYW5kICBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIGFsdFN1Z2dlc3Rpb24gPSBAaGFzU2FtZVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgQGxhc3RLaXRlU3VnZ2VzdGlvbnMpXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEtpdGUnLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQ/XG4gICAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vbi13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiBmcm9tIG5laXRoZXIgS2l0ZSBub3IgSmVkaSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkP1xuICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAod2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub24td2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vdC13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zIGFuZCBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpJywge1xuICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gbm90IHJldHVybmVkIGJ5IEplZGknXG5cbiAgaGFzU2FtZVN1Z2dlc3Rpb246IChzdWdnZXN0aW9uLCBzdWdnZXN0aW9ucykgLT5cbiAgICBzdWdnZXN0aW9ucy5maWx0ZXIoKHMpIC0+IHMudGV4dCBpcyBzdWdnZXN0aW9uLnRleHQpWzBdXG5cbiAgaGFzRG9jdW1lbnRhdGlvbjogKHN1Z2dlc3Rpb24pIC0+XG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb24/IGFuZCBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uIGlzbnQgJycpIG9yXG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93bj8gYW5kIHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93biBpc250ICcnKVxuXG4gIHRyYWNrOiAobXNnLCBkYXRhKSAtPlxuICAgIHRyeVxuICAgICAgTWV0cmljcy5UcmFja2VyLnRyYWNrRXZlbnQgbXNnLCBkYXRhXG4gICAgY2F0Y2ggZVxuICAgICAgIyBUT0RPOiB0aGlzIHNob3VsZCBiZSByZW1vdmVkIGFmdGVyIGtpdGUtaW5zdGFsbGVyIGlzIGZpeGVkXG4gICAgICBpZiBlIGluc3RhbmNlb2YgVHlwZUVycm9yXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgZVxuIl19
