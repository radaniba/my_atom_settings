(function() {
  var CompositeDisposable, Emitter, Metrics, ref,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  Metrics = null;

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
      var ref1;
      if ((ref1 = grammar.packageName) === 'language-python' || ref1 === 'MagicPython' || ref1 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref1;
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
      ref1 = require('kite-installer'), AccountManager = ref1.AccountManager, AtomHelper = ref1.AtomHelper, DecisionMaker = ref1.DecisionMaker, Installation = ref1.Installation, Installer = ref1.Installer, Metrics = ref1.Metrics, StateController = ref1.StateController;
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
              var installer, pane, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                Metrics.Tracker.trackEvent("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                Metrics.Tracker.trackEvent("flow aborted");
                return atom.config.set('autocomplete-python.useKite', false);
              });
              installer = new Installer(atom.project.getPaths());
              installer.init(_this.installation.flow);
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                Metrics.Tracker.trackEvent("skipped kite");
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
      this._loadKite();
      return this.trackCompletions();
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
        promises.push(atom.packages.activatePackage('kite'));
        Metrics.Tracker.name = "atom kite+acp";
      }
      return Promise.all(promises).then((function(_this) {
        return function(arg) {
          var autocompleteManager, autocompletePlus, getSuggestions, kite, safeConfirm, safeDisplaySuggestions;
          autocompletePlus = arg[0], kite = arg[1];
          if (kite != null) {
            _this.kiteProvider = kite.mainModule.completions();
            getSuggestions = _this.kiteProvider.getSuggestions;
            _this.kiteProvider.getSuggestions = function() {
              var args;
              args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              return getSuggestions.apply(_this.kiteProvider, args).then(function(suggestions) {
                _this.lastKiteSuggestions = suggestions;
                _this.kiteSuggested = true;
                return suggestions;
              })["catch"](function(err) {
                _this.lastKiteSuggestions = [];
                _this.kiteSuggested = false;
                throw err;
              });
            };
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
    trackUsedSuggestion: function(suggestion, editor) {
      if (/\.py$/.test(editor.getPath()) && (this.kiteProvider != null)) {
        if (this.lastKiteSuggestions != null) {
          if (indexOf.call(this.lastKiteSuggestions, suggestion) >= 0) {
            if (this.hasSameSuggestion(suggestion, this.provider.lastSuggestions)) {
              return this.track('used completion returned by Kite but also returned by Jedi');
            } else {
              return this.track('used completion returned by Kite but not Jedi');
            }
          } else if (indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            if (this.hasSameSuggestion(suggestion, this.lastKiteSuggestions)) {
              return this.track('used completion returned by Jedi but also returned by Kite');
            } else {
              if (this.kiteSuggested) {
                return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)');
              } else {
                return this.track('used completion returned by Jedi but not Kite (not-whitelisted filepath)');
              }
            }
          } else {
            return this.track('used completion from neither Kite nor Jedi');
          }
        } else {
          if (indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            return this.track('used completion returned by Jedi');
          } else {
            return this.track('used completion not returned by Jedi');
          }
        }
      }
    },
    hasSameSuggestion: function(suggestion, suggestions) {
      return suggestions.some(function(s) {
        return s.text === suggestion.text;
      });
    },
    track: function(msg, data) {
      return Metrics.Tracker.trackEvent(msg, data);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMENBQUE7SUFBQTs7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFFdEIsT0FBQSxHQUFVOztFQUVWLE1BQU0sQ0FBQyxLQUFQLEdBQWU7O0VBQ2YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sMkNBSFA7UUFJQSxXQUFBLEVBQWEsbUlBSmI7T0FERjtNQU9BLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLG1CQUhQO1FBSUEsV0FBQSxFQUFhLGdEQUpiO09BUkY7TUFhQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFVBQWhCLENBSE47UUFJQSxLQUFBLEVBQU8sa0NBSlA7UUFLQSxXQUFBLEVBQWEseVJBTGI7T0FkRjtNQXdCQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLHlCQUhQO1FBSUEsV0FBQSxFQUFhLGc2QkFKYjtPQXpCRjtNQTRDQSxV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QSxLQUFELENBQU8sa0NBQVAsRUFERjtXQUFBLE1BQUE7bUJBR0UsSUFBQyxDQUFBLEtBQUQsQ0FBTyxzQ0FBUCxFQUhGO1dBakJGO1NBREY7O0lBRG1CLENBOVJyQjtJQXNUQSxpQkFBQSxFQUFtQixTQUFDLFVBQUQsRUFBYSxXQUFiO2FBQ2pCLFdBQVcsQ0FBQyxJQUFaLENBQWlCLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLEtBQVUsVUFBVSxDQUFDO01BQTVCLENBQWpCO0lBRGlCLENBdFRuQjtJQXlUQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sSUFBTjthQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBaEIsQ0FBMkIsR0FBM0IsRUFBZ0MsSUFBaEM7SUFESyxDQXpUUDs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbk1ldHJpY3MgPSBudWxsXG5cbndpbmRvdy5ERUJVRyA9IGZhbHNlXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB1c2VLaXRlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMFxuICAgICAgdGl0bGU6ICdVc2UgS2l0ZS1wb3dlcmVkIENvbXBsZXRpb25zIChtYWNPUyBvbmx5KSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydLaXRlIGlzIGEgY2xvdWQgcG93ZXJlZCBhdXRvY29tcGxldGUgZW5naW5lLiBJdCBwcm92aWRlc1xuICAgICAgc2lnbmlmaWNhbnRseSBtb3JlIGF1dG9jb21wbGV0ZSBzdWdnZXN0aW9ucyB0aGFuIHRoZSBsb2NhbCBKZWRpIGVuZ2luZS4nJydcbiAgICBzaG93RGVzY3JpcHRpb25zOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMVxuICAgICAgdGl0bGU6ICdTaG93IERlc2NyaXB0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBkb2Mgc3RyaW5ncyBmcm9tIGZ1bmN0aW9ucywgY2xhc3NlcywgZXRjLidcbiAgICB1c2VTbmlwcGV0czpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnbm9uZSdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBlbnVtOiBbJ25vbmUnLCAnYWxsJywgJ3JlcXVpcmVkJ11cbiAgICAgIHRpdGxlOiAnQXV0b2NvbXBsZXRlIEZ1bmN0aW9uIFBhcmFtZXRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQXV0b21hdGljYWxseSBjb21wbGV0ZSBmdW5jdGlvbiBhcmd1bWVudHMgYWZ0ZXIgdHlwaW5nXG4gICAgICBsZWZ0IHBhcmVudGhlc2lzIGNoYXJhY3Rlci4gVXNlIGNvbXBsZXRpb24ga2V5IHRvIGp1bXAgYmV0d2VlblxuICAgICAgYXJndW1lbnRzLiBTZWUgYGF1dG9jb21wbGV0ZS1weXRob246Y29tcGxldGUtYXJndW1lbnRzYCBjb21tYW5kIGlmIHlvdVxuICAgICAgd2FudCB0byB0cmlnZ2VyIGFyZ3VtZW50IGNvbXBsZXRpb25zIG1hbnVhbGx5LiBTZWUgUkVBRE1FIGlmIGl0IGRvZXMgbm90XG4gICAgICB3b3JrIGZvciB5b3UuJycnXG4gICAgcHl0aG9uUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiAzXG4gICAgICB0aXRsZTogJ1B5dGhvbiBFeGVjdXRhYmxlIFBhdGhzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ09wdGlvbmFsIHNlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBwYXRocyB0byBweXRob25cbiAgICAgIGV4ZWN1dGFibGVzIChpbmNsdWRpbmcgZXhlY3V0YWJsZSBuYW1lcyksIHdoZXJlIHRoZSBmaXJzdCBvbmUgd2lsbCB0YWtlXG4gICAgICBoaWdoZXIgcHJpb3JpdHkgb3ZlciB0aGUgbGFzdCBvbmUuIEJ5IGRlZmF1bHQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aWxsXG4gICAgICBhdXRvbWF0aWNhbGx5IGxvb2sgZm9yIHZpcnR1YWwgZW52aXJvbm1lbnRzIGluc2lkZSBvZiB5b3VyIHByb2plY3QgYW5kXG4gICAgICB0cnkgdG8gdXNlIHRoZW0gYXMgd2VsbCBhcyB0cnkgdG8gZmluZCBnbG9iYWwgcHl0aG9uIGV4ZWN1dGFibGUuIElmIHlvdVxuICAgICAgdXNlIHRoaXMgY29uZmlnLCBhdXRvbWF0aWMgbG9va3VwIHdpbGwgaGF2ZSBsb3dlc3QgcHJpb3JpdHkuXG4gICAgICBVc2UgYCRQUk9KRUNUYCBvciBgJFBST0pFQ1RfTkFNRWAgc3Vic3RpdHV0aW9uIGZvciBwcm9qZWN0LXNwZWNpZmljXG4gICAgICBwYXRocyB0byBwb2ludCBvbiBleGVjdXRhYmxlcyBpbiB2aXJ0dWFsIGVudmlyb25tZW50cy5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYC9Vc2Vycy9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2Jpbi9weXRob247JFBST0pFQ1QvdmVudi9iaW4vcHl0aG9uMzsvdXNyL2Jpbi9weXRob25gLlxuICAgICAgU3VjaCBjb25maWcgd2lsbCBmYWxsIGJhY2sgb24gYC91c3IvYmluL3B5dGhvbmAgZm9yIHByb2plY3RzIG5vdCBwcmVzZW50ZWRcbiAgICAgIHdpdGggc2FtZSBuYW1lIGluIGAudmlydHVhbGVudnNgIGFuZCB3aXRob3V0IGB2ZW52YCBmb2xkZXIgaW5zaWRlIG9mIG9uZVxuICAgICAgb2YgcHJvamVjdCBmb2xkZXJzLlxuICAgICAgSWYgeW91IGFyZSB1c2luZyBweXRob24zIGV4ZWN1dGFibGUgd2hpbGUgY29kaW5nIGZvciBweXRob24yIHlvdSB3aWxsIGdldFxuICAgICAgcHl0aG9uMiBjb21wbGV0aW9ucyBmb3Igc29tZSBidWlsdC1pbnMuJycnXG4gICAgZXh0cmFQYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDRcbiAgICAgIHRpdGxlOiAnRXh0cmEgUGF0aHMgRm9yIFBhY2thZ2VzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBtb2R1bGVzIHRvIGFkZGl0aW9uYWxseVxuICAgICAgaW5jbHVkZSBmb3IgYXV0b2NvbXBsZXRlLiBZb3UgY2FuIHVzZSBzYW1lIHN1YnN0aXR1dGlvbnMgYXMgaW5cbiAgICAgIGBQeXRob24gRXhlY3V0YWJsZSBQYXRoc2AuXG4gICAgICBOb3RlIHRoYXQgaXQgc3RpbGwgc2hvdWxkIGJlIHZhbGlkIHB5dGhvbiBwYWNrYWdlLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgJFBST0pFQ1QvZW52L2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2BcbiAgICAgIG9yXG4gICAgICBgL1VzZXIvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgLlxuICAgICAgWW91IGRvbid0IG5lZWQgdG8gc3BlY2lmeSBleHRyYSBwYXRocyBmb3IgbGlicmFyaWVzIGluc3RhbGxlZCB3aXRoIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZSB5b3UgdXNlLicnJ1xuICAgIGNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA1XG4gICAgICB0aXRsZTogJ0Nhc2UgSW5zZW5zaXRpdmUgQ29tcGxldGlvbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGNvbXBsZXRpb24gaXMgYnkgZGVmYXVsdCBjYXNlIGluc2Vuc2l0aXZlLidcbiAgICB0cmlnZ2VyQ29tcGxldGlvblJlZ2V4OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcoW1xcLlxcIChdfFthLXpBLVpfXVthLXpBLVowLTlfXSopJ1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHRpdGxlOiAnUmVnZXggVG8gVHJpZ2dlciBBdXRvY29tcGxldGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQnkgZGVmYXVsdCBjb21wbGV0aW9ucyB0cmlnZ2VyZWQgYWZ0ZXIgd29yZHMsIGRvdHMsIHNwYWNlc1xuICAgICAgYW5kIGxlZnQgcGFyZW50aGVzaXMuIFlvdSB3aWxsIG5lZWQgdG8gcmVzdGFydCB5b3VyIGVkaXRvciBhZnRlciBjaGFuZ2luZ1xuICAgICAgdGhpcy4nJydcbiAgICBmdXp6eU1hdGNoZXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA3XG4gICAgICB0aXRsZTogJ1VzZSBGdXp6eSBNYXRjaGVyIEZvciBDb21wbGV0aW9ucy4nXG4gICAgICBkZXNjcmlwdGlvbjogJycnVHlwaW5nIGBzdGRyYCB3aWxsIG1hdGNoIGBzdGRlcnJgLlxuICAgICAgRmlyc3QgY2hhcmFjdGVyIHNob3VsZCBhbHdheXMgbWF0Y2guIFVzZXMgYWRkaXRpb25hbCBjYWNoaW5nIHRodXNcbiAgICAgIGNvbXBsZXRpb25zIHNob3VsZCBiZSBmYXN0ZXIuIE5vdGUgdGhhdCB0aGlzIHNldHRpbmcgZG9lcyBub3QgYWZmZWN0XG4gICAgICBidWlsdC1pbiBhdXRvY29tcGxldGUtcGx1cyBwcm92aWRlci4nJydcbiAgICBvdXRwdXRQcm92aWRlckVycm9yczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA4XG4gICAgICB0aXRsZTogJ091dHB1dCBQcm92aWRlciBFcnJvcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSB0aGUgcHJvdmlkZXIgZXJyb3JzIHdoZW5cbiAgICAgIHRoZXkgaGFwcGVuLiBCeSBkZWZhdWx0IHRoZXkgYXJlIGhpZGRlbi4gTm90ZSB0aGF0IGNyaXRpY2FsIGVycm9ycyBhcmVcbiAgICAgIGFsd2F5cyBzaG93bi4nJydcbiAgICBvdXRwdXREZWJ1ZzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA5XG4gICAgICB0aXRsZTogJ091dHB1dCBEZWJ1ZyBMb2dzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgZGVidWcgaW5mb3JtYXRpb24gaW5cbiAgICAgIGRldmVsb3BlciB0b29scyBsb2dzLiBNYXkgc2xvdyBkb3duIHlvdXIgZWRpdG9yLicnJ1xuICAgIHNob3dUb29sdGlwczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxMFxuICAgICAgdGl0bGU6ICdTaG93IFRvb2x0aXBzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIG9iamVjdCB1bmRlciB0aGUgY3Vyc29yJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0VYUEVSSU1FTlRBTCBGRUFUVVJFIFdISUNIIElTIE5PVCBGSU5JU0hFRCBZRVQuXG4gICAgICBGZWVkYmFjayBhbmQgaWRlYXMgYXJlIHdlbGNvbWUgb24gZ2l0aHViLicnJ1xuICAgIHN1Z2dlc3Rpb25Qcmlvcml0eTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogM1xuICAgICAgbWluaW11bTogMFxuICAgICAgbWF4aW11bTogOTlcbiAgICAgIG9yZGVyOiAxMVxuICAgICAgdGl0bGU6ICdTdWdnZXN0aW9uIFByaW9yaXR5J1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1lvdSBjYW4gdXNlIHRoaXMgdG8gc2V0IHRoZSBwcmlvcml0eSBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvblxuICAgICAgc3VnZ2VzdGlvbnMuIEZvciBleGFtcGxlLCB5b3UgY2FuIHVzZSBsb3dlciB2YWx1ZSB0byBnaXZlIGhpZ2hlciBwcmlvcml0eVxuICAgICAgZm9yIHNuaXBwZXRzIGNvbXBsZXRpb25zIHdoaWNoIGhhcyBwcmlvcml0eSBvZiAyLicnJ1xuXG4gIGluc3RhbGxhdGlvbjogbnVsbFxuXG4gIF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQ6IChncmFtbWFyKSAtPlxuICAgICMgdGhpcyBzaG91bGQgYmUgc2FtZSB3aXRoIGFjdGl2YXRpb25Ib29rcyBuYW1lc1xuICAgIGlmIGdyYW1tYXIucGFja2FnZU5hbWUgaW4gWydsYW5ndWFnZS1weXRob24nLCAnTWFnaWNQeXRob24nLCAnYXRvbS1kamFuZ28nXVxuICAgICAgQHByb3ZpZGVyLmxvYWQoKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWxvYWQtcHJvdmlkZXInXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgX2xvYWRLaXRlOiAtPlxuICAgIGZpcnN0SW5zdGFsbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcpID09IG51bGxcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnLCB0cnVlKVxuICAgIGxvbmdSdW5uaW5nID0gcmVxdWlyZSgncHJvY2VzcycpLnVwdGltZSgpID4gMTBcbiAgICBpZiBmaXJzdEluc3RhbGwgYW5kIGxvbmdSdW5uaW5nXG4gICAgICBldmVudCA9IFwiaW5zdGFsbGVkXCJcbiAgICBlbHNlIGlmIGZpcnN0SW5zdGFsbFxuICAgICAgZXZlbnQgPSBcInVwZ3JhZGVkXCJcbiAgICBlbHNlXG4gICAgICBldmVudCA9IFwicmVzdGFydGVkXCJcblxuICAgIHtcbiAgICAgIEFjY291bnRNYW5hZ2VyLFxuICAgICAgQXRvbUhlbHBlcixcbiAgICAgIERlY2lzaW9uTWFrZXIsXG4gICAgICBJbnN0YWxsYXRpb24sXG4gICAgICBJbnN0YWxsZXIsXG4gICAgICBNZXRyaWNzLFxuICAgICAgU3RhdGVDb250cm9sbGVyXG4gICAgfSA9IHJlcXVpcmUgJ2tpdGUtaW5zdGFsbGVyJ1xuICAgIEFjY291bnRNYW5hZ2VyLmluaXRDbGllbnQgJ2FscGhhLmtpdGUuY29tJywgLTEsIHRydWVcbiAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlciBJbnN0YWxsYXRpb24sIChtKSAtPiBtLmVsZW1lbnRcbiAgICBlZGl0b3JDZmcgPVxuICAgICAgVVVJRDogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21ldHJpY3MudXNlcklkJylcbiAgICAgIG5hbWU6ICdhdG9tJ1xuICAgIHBsdWdpbkNmZyA9XG4gICAgICBuYW1lOiAnYXV0b2NvbXBsZXRlLXB5dGhvbidcbiAgICBkbSA9IG5ldyBEZWNpc2lvbk1ha2VyIGVkaXRvckNmZywgcGx1Z2luQ2ZnXG5cbiAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBhY3BcIlxuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uID0gKCkgPT5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYW5JbnN0YWxsID0gU3RhdGVDb250cm9sbGVyLmNhbkluc3RhbGxLaXRlKClcbiAgICAgIHRocm90dGxlID0gZG0uc2hvdWxkT2ZmZXJLaXRlKGV2ZW50KVxuICAgICAgUHJvbWlzZS5hbGwoW3Rocm90dGxlLCBjYW5JbnN0YWxsXSkudGhlbigodmFsdWVzKSA9PlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgdmFyaWFudCA9IHZhbHVlc1swXVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMgPSB2YXJpYW50XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aXRsZSA9IFwiQ2hvb3NlIGEgYXV0b2NvbXBsZXRlLXB5dGhvbiBlbmdpbmVcIlxuICAgICAgICBAaW5zdGFsbGF0aW9uID0gbmV3IEluc3RhbGxhdGlvbiB2YXJpYW50LCB0aXRsZVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmFjY291bnRDcmVhdGVkKCgpID0+XG4gICAgICAgICAgTWV0cmljcy5UcmFja2VyLnRyYWNrRXZlbnQgXCJhY2NvdW50IGNyZWF0ZWRcIlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgdHJ1ZVxuICAgICAgICApXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvd1NraXBwZWQoKCkgPT5cbiAgICAgICAgICBNZXRyaWNzLlRyYWNrZXIudHJhY2tFdmVudCBcImZsb3cgYWJvcnRlZFwiXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICApXG4gICAgICAgIGluc3RhbGxlciA9IG5ldyBJbnN0YWxsZXIoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpXG4gICAgICAgIGluc3RhbGxlci5pbml0IEBpbnN0YWxsYXRpb24uZmxvd1xuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvdy5vblNraXBJbnN0YWxsICgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICAgIE1ldHJpY3MuVHJhY2tlci50cmFja0V2ZW50IFwic2tpcHBlZCBraXRlXCJcbiAgICAgICAgICBwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICAgICAgcGFuZS5hZGRJdGVtIEBpbnN0YWxsYXRpb24sIGluZGV4OiAwXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCAwXG4gICAgICAsIChlcnIpID0+XG4gICAgICAgIGlmIGVyci50eXBlID09ICdkZW5pZWQnXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgKSBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuICAgICAgICBBdG9tSGVscGVyLmVuYWJsZVBhY2thZ2UoKVxuICAgICAgZWxzZVxuICAgICAgICBBdG9tSGVscGVyLmRpc2FibGVQYWNrYWdlKClcblxuICBsb2FkOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChncmFtbWFyKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQF9sb2FkS2l0ZSgpXG4gICAgQHRyYWNrQ29tcGxldGlvbnMoKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUoJy4vcHJvdmlkZXInKVxuICAgIGlmIHR5cGVvZiBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcyA9PSAnZnVuY3Rpb24nIGFuZFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcygpXG4gICAgICBAbG9hZCgpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAbG9hZCgpXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAcHJvdmlkZXIuZGlzcG9zZSgpIGlmIEBwcm92aWRlclxuICAgIEBpbnN0YWxsYXRpb24uZGVzdHJveSgpIGlmIEBpbnN0YWxsYXRpb25cblxuICBnZXRQcm92aWRlcjogLT5cbiAgICByZXR1cm4gQHByb3ZpZGVyXG5cbiAgZ2V0SHlwZXJjbGlja1Byb3ZpZGVyOiAtPlxuICAgIHJldHVybiByZXF1aXJlKCcuL2h5cGVyY2xpY2stcHJvdmlkZXInKVxuXG4gIGNvbnN1bWVTbmlwcGV0czogKHNuaXBwZXRzTWFuYWdlcikgLT5cbiAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1sb2FkLXByb3ZpZGVyJywgPT5cbiAgICAgIEBwcm92aWRlci5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIHRyYWNrQ29tcGxldGlvbnM6IC0+XG4gICAgcHJvbWlzZXMgPSBbYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJyldXG5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2tpdGUnKT9cbiAgICAgIHByb21pc2VzLnB1c2goYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKSlcbiAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuIChbYXV0b2NvbXBsZXRlUGx1cywga2l0ZV0pID0+XG4gICAgICBpZiBraXRlP1xuICAgICAgICBAa2l0ZVByb3ZpZGVyID0ga2l0ZS5tYWluTW9kdWxlLmNvbXBsZXRpb25zKClcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgPSBAa2l0ZVByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zXG4gICAgICAgIEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMgPSAoYXJncy4uLikgPT5cbiAgICAgICAgICBnZXRTdWdnZXN0aW9ucy5hcHBseShAa2l0ZVByb3ZpZGVyLCBhcmdzKVxuICAgICAgICAgIC50aGVuIChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIEBraXRlU3VnZ2VzdGVkID0gdHJ1ZVxuICAgICAgICAgICAgc3VnZ2VzdGlvbnNcbiAgICAgICAgICAuY2F0Y2ggKGVycikgPT5cbiAgICAgICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgICAgIEBraXRlU3VnZ2VzdGVkID0gZmFsc2VcbiAgICAgICAgICAgIHRocm93IGVyclxuXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gYXV0b2NvbXBsZXRlUGx1cy5tYWluTW9kdWxlLmdldEF1dG9jb21wbGV0ZU1hbmFnZXIoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIGF1dG9jb21wbGV0ZU1hbmFnZXI/IGFuZCBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm0/IGFuZCBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucz9cblxuICAgICAgc2FmZUNvbmZpcm0gPSBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm1cbiAgICAgIHNhZmVEaXNwbGF5U3VnZ2VzdGlvbnMgPSBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9uc1xuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMgPSAoc3VnZ2VzdGlvbnMsIG9wdGlvbnMpID0+XG4gICAgICAgIEB0cmFja1N1Z2dlc3Rpb25zKHN1Z2dlc3Rpb25zLCBhdXRvY29tcGxldGVNYW5hZ2VyLmVkaXRvcilcbiAgICAgICAgc2FmZURpc3BsYXlTdWdnZXN0aW9ucy5jYWxsKGF1dG9jb21wbGV0ZU1hbmFnZXIsIHN1Z2dlc3Rpb25zLCBvcHRpb25zKVxuXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm0gPSAoc3VnZ2VzdGlvbikgPT5cbiAgICAgICAgQHRyYWNrVXNlZFN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgYXV0b2NvbXBsZXRlTWFuYWdlci5lZGl0b3IpXG4gICAgICAgIHNhZmVDb25maXJtLmNhbGwoYXV0b2NvbXBsZXRlTWFuYWdlciwgc3VnZ2VzdGlvbilcblxuICB0cmFja1N1Z2dlc3Rpb25zOiAoc3VnZ2VzdGlvbnMsIGVkaXRvcikgLT5cbiAgICBpZiAvXFwucHkkLy50ZXN0KGVkaXRvci5nZXRQYXRoKCkpIGFuZCBAa2l0ZVByb3ZpZGVyP1xuICAgICAgaGFzS2l0ZVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuc29tZSAocykgPT4gcy5wcm92aWRlciBpcyBAa2l0ZVByb3ZpZGVyXG4gICAgICBoYXNKZWRpU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5zb21lIChzKSA9PiBzLnByb3ZpZGVyIGlzIEBwcm92aWRlclxuXG4gICAgICBpZiBoYXNLaXRlU3VnZ2VzdGlvbnMgYW5kIGhhc0plZGlTdWdnZXN0aW9uc1xuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgYm90aCBLaXRlIGFuZCBKZWRpIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZSBpZiBoYXNLaXRlU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIEtpdGUgYnV0IG5vdCBKZWRpIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZSBpZiBoYXNKZWRpU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIEplZGkgYnV0IG5vdCBLaXRlIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZVxuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgbmVpdGhlciBLaXRlIG5vciBKZWRpIGNvbXBsZXRpb25zJ1xuXG4gIHRyYWNrVXNlZFN1Z2dlc3Rpb246IChzdWdnZXN0aW9uLCBlZGl0b3IpIC0+XG4gICAgaWYgL1xcLnB5JC8udGVzdChlZGl0b3IuZ2V0UGF0aCgpKSBhbmQgQGtpdGVQcm92aWRlcj9cbiAgICAgIGlmIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zP1xuICAgICAgICBpZiBzdWdnZXN0aW9uIGluIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgICAgaWYgQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMpXG4gICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBLaXRlIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEplZGknXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgS2l0ZSBidXQgbm90IEplZGknXG4gICAgICAgIGVsc2UgaWYgc3VnZ2VzdGlvbiBpbiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zXG4gICAgICAgICAgaWYgQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zKVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgYWxzbyByZXR1cm5lZCBieSBLaXRlJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBraXRlU3VnZ2VzdGVkXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlICh3aGl0ZWxpc3RlZCBmaWxlcGF0aCknXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub3Qtd2hpdGVsaXN0ZWQgZmlsZXBhdGgpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gZnJvbSBuZWl0aGVyIEtpdGUgbm9yIEplZGknXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHN1Z2dlc3Rpb24gaW4gQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9uc1xuICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiBub3QgcmV0dXJuZWQgYnkgSmVkaSdcblxuICBoYXNTYW1lU3VnZ2VzdGlvbjogKHN1Z2dlc3Rpb24sIHN1Z2dlc3Rpb25zKSAtPlxuICAgIHN1Z2dlc3Rpb25zLnNvbWUgKHMpIC0+IHMudGV4dCBpcyBzdWdnZXN0aW9uLnRleHRcblxuICB0cmFjazogKG1zZywgZGF0YSkgLT5cbiAgICBNZXRyaWNzLlRyYWNrZXIudHJhY2tFdmVudCBtc2csIGRhdGFcbiJdfQ==
