(function() {
  var ConfigManager, Kernel, KernelManager, child_process, _;

  _ = require('lodash');

  child_process = require('child_process');

  ConfigManager = require('./config-manager');

  Kernel = require('./kernel');

  module.exports = KernelManager = {
    runningKernels: {},
    kernelsUpdatedOnce: false,
    getAvailableKernels: function() {
      var kernels;
      kernels = _.pluck(this.getConfigJson('kernelspec', {
        kernelspecs: {}
      }).kernelspecs, 'spec');
      if (!this.kernelsUpdatedOnce) {
        this.updateKernels();
      }
      return kernels;
    },
    updateKernels: function() {
      var saveKernelsToConfig;
      saveKernelsToConfig = (function(_this) {
        return function(out) {
          var e, kernelspec;
          try {
            kernelspec = JSON.parse(out);
          } catch (_error) {
            e = _error;
            if (!_this.getAvailableKernels().length) {
              atom.notifications.addError("Can't parse neither 'ipython kernelspecs nor 'jupyter kernelspecs'", {
                detail: "Use kernelspec option in Hydrogen options OR update\nyour ipython/jupyter to version that supports kernelspec option:\n$ jupyter kernelspec list --json || ipython kernelspec list --json"
              });
            }
          }
          if (kernelspec != null) {
            _this.setConfigJson('kernelspec', kernelspec);
            return atom.notifications.addInfo('Hydrogen Kernels updated:', {
              detail: (_.pluck(_this.getAvailableKernels(), 'display_name')).join('\n')
            });
          }
        };
      })(this);
      this.kernelsUpdatedOnce = true;
      return child_process.exec('jupyter kernelspec list --json --log-level=CRITICAL', function(e, stdout, stderr) {
        if (!e) {
          return saveKernelsToConfig(stdout);
        }
        return child_process.exec('ipython kernelspec list --json --log-level=CRITICAL', function(e, stdout, stderr) {
          return saveKernelsToConfig(stdout);
        });
      });
    },
    getRunningKernels: function() {
      return _.clone(this.runningKernels);
    },
    getTrueLanguage: function(language) {
      var languageMappings, languageMatches;
      if (language != null) {
        languageMappings = this.getLanguageMappings();
        languageMatches = _.filter(languageMappings, function(trueLanguage, languageKey) {
          return (languageKey != null ? languageKey.toLowerCase() : void 0) === language.toLowerCase();
        });
        if (languageMatches[0] != null) {
          return languageMatches[0].toLowerCase();
        }
      }
      return language;
    },
    getConfigJson: function(key, _default) {
      var error, value;
      if (_default == null) {
        _default = {};
      }
      if (!(value = atom.config.get("Hydrogen." + key))) {
        return _default;
      }
      try {
        return JSON.parse(value);
      } catch (_error) {
        error = _error;
        return atom.notifications.addError("Your Hydrogen config is broken: " + key, {
          detail: error
        });
      }
    },
    setConfigJson: function(key, value, merge) {
      if (merge == null) {
        merge = false;
      }
      if (merge) {
        value = _.merge(this.getConfigJson(key), value);
      }
      return atom.config.set("Hydrogen." + key, JSON.stringify(value));
    },
    getLanguageMappings: function() {
      return this.getConfigJson('languageMappings');
    },
    getKernelInfoForLanguage: function(grammarLanguage) {
      var display_name, kernelInfo, kernels, language, matchingKernels;
      kernels = this.getAvailableKernels();
      console.log("Available kernels:", kernels);
      if (kernels == null) {
        return null;
      }
      language = this.getTrueLanguage(grammarLanguage);
      console.log("Grammar language:", grammarLanguage);
      console.log("True language:", language);
      if (language == null) {
        return null;
      }
      matchingKernels = _.filter(kernels, function(kernel) {
        var kernelLanguage;
        kernelLanguage = kernel.language;
        if (kernelLanguage == null) {
          kernelLanguage = kernel.display_name;
        }
        return language === (kernelLanguage != null ? kernelLanguage.toLowerCase() : void 0);
      });
      if (matchingKernels[0] != null) {
        kernelInfo = matchingKernels[0];
      }
      if (display_name = this.getConfigJson('grammarToKernel')[grammarLanguage]) {
        kernelInfo = _.filter(matchingKernels, function(kernel) {
          return kernel.display_name === display_name;
        })[0];
      }
      return _.assign(kernelInfo, {
        grammarLanguage: grammarLanguage
      });
    },
    languageHasKernel: function(language) {
      return this.getKernelInfoForLanguage(language) != null;
    },
    getRunningKernelForLanguage: function(language) {
      var runningKernel, trueLanguage;
      runningKernel = null;
      trueLanguage = this.getTrueLanguage(language);
      if (trueLanguage != null) {
        runningKernel = this.runningKernels[trueLanguage];
      }
      return runningKernel;
    },
    languageHasRunningKernel: function(language) {
      return this.getRunningKernelForLanguage(language) != null;
    },
    interruptKernelForLanguage: function(language) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        return kernel.interrupt();
      }
    },
    destroyKernelForLanguage: function(language) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        kernel.destroy();
        return delete this.runningKernels[kernel.language];
      }
    },
    startKernel: function(kernelInfo, onStarted) {
      var message, options;
      console.log("startKernel:", kernelInfo);
      if (kernelInfo == null) {
        message = "No kernel info for language `" + language + "` found";
        options = {
          detail: "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it."
        };
        atom.notifications.addError(message, options);
        return;
      }
      return ConfigManager.writeConfigFile((function(_this) {
        return function(filepath, config) {
          var kernel;
          kernel = new Kernel(kernelInfo, config, filepath);
          _this.runningKernels[kernelInfo.language] = kernel;
          return typeof onStarted === "function" ? onStarted(kernel) : void 0;
        };
      })(this));
    },
    startKernelIfNeeded: function(language, onStarted) {
      var kernelInfo, message, options, runningKernel;
      console.log("startKernelIfNeeded:", language);
      if (!this.languageHasKernel(language)) {
        message = "No kernel for language `" + language + "` found";
        options = {
          detail: "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it."
        };
        atom.notifications.addError(message, options);
        return;
      }
      runningKernel = this.getRunningKernelForLanguage(language);
      if (runningKernel != null) {
        if (typeof onStarted === "function") {
          onStarted(runningKernel);
        }
        return;
      }
      kernelInfo = this.getKernelInfoForLanguage(language);
      return this.startKernel(kernelInfo, onStarted);
    },
    execute: function(language, code, onResults) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        return kernel.execute(code, onResults);
      } else {
        throw "No such kernel!";
      }
    },
    complete: function(language, code, onResults) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        return kernel.complete(code, onResults);
      } else {
        throw "No such kernel!";
      }
    },
    inspect: function(language, code, cursor_pos, onResults) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        return kernel.inspect(code, cursor_pos, onResults);
      } else {
        throw "No such kernel!";
      }
    },
    destroy: function() {
      return _.forEach(this.runningKernels, function(kernel) {
        return kernel.destroy();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FKVCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsYUFBQSxHQUNiO0FBQUEsSUFBQSxjQUFBLEVBQWdCLEVBQWhCO0FBQUEsSUFDQSxrQkFBQSxFQUFvQixLQURwQjtBQUFBLElBR0EsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxZQUFmLEVBQTZCO0FBQUEsUUFBQyxXQUFBLEVBQVksRUFBYjtPQUE3QixDQUE4QyxDQUFDLFdBQXZELEVBQW9FLE1BQXBFLENBQVYsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQXlCLENBQUEsa0JBQXpCO0FBQUEsUUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQUEsQ0FBQTtPQURBO2FBRUEsUUFIaUI7SUFBQSxDQUhyQjtBQUFBLElBUUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsbUJBQUE7QUFBQSxNQUFBLG1CQUFBLEdBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNwQixjQUFBLGFBQUE7QUFBQTtB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
