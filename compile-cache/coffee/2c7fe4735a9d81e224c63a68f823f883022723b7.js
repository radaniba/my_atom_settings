(function() {
  var Kernel, KernelManager, child_process, _;

  _ = require('lodash');

  child_process = require('child_process');

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
      var languageMappings, matchingLanguageKeys;
      languageMappings = this.getLanguageMappings();
      matchingLanguageKeys = _.filter(languageMappings, function(trueLanguage, languageKey) {
        return languageKey.toLowerCase() === language.toLowerCase();
      });
      if (matchingLanguageKeys[0] != null) {
        return matchingLanguageKeys[0].toLowerCase();
      } else {
        return language;
      }
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
      language = this.getTrueLanguage(grammarLanguage);
      matchingKernels = _.filter(kernels, function(kernel) {
        var kernelLanguage;
        kernelLanguage = kernel.language;
        if (kernelLanguage == null) {
          kernelLanguage = kernel.display_name;
        }
        return (kernelLanguage != null) && language.toLowerCase() === kernelLanguage.toLowerCase();
      });
      if (matchingKernels.length !== 0) {
        kernelInfo = matchingKernels[0];
      }
      if (display_name = this.getConfigJson('grammarToKernel')[grammarLanguage]) {
        kernelInfo = _.filter(matchingKernels, function(k) {
          return k.display_name === display_name;
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
      language = this.getTrueLanguage(language);
      if (this.runningKernels[language] != null) {
        return this.runningKernels[language];
      } else {
        return null;
      }
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
      language = this.getTrueLanguage(language);
      if (this.runningKernels[language] != null) {
        this.runningKernels[language].destroy();
        return delete this.runningKernels[language];
      }
    },
    startKernel: function(kernelInfo, config, configFilePath) {
      var kernel, language;
      language = this.getTrueLanguage(kernelInfo.language.toLowerCase());
      kernel = new Kernel(kernelInfo, config, configFilePath);
      this.runningKernels[language] = kernel;
      return kernel;
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
    destroy: function() {
      return _.forEach(this.runningKernels, function(kernel) {
        return kernel.destroy();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUhULENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2I7QUFBQSxJQUFBLGNBQUEsRUFBZ0IsRUFBaEI7QUFBQSxJQUNBLGtCQUFBLEVBQW9CLEtBRHBCO0FBQUEsSUFHQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7QUFDakIsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsYUFBRCxDQUFlLFlBQWYsRUFBNkI7QUFBQSxRQUFDLFdBQUEsRUFBWSxFQUFiO09BQTdCLENBQThDLENBQUMsV0FBdkQsRUFBb0UsTUFBcEUsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBeUIsQ0FBQSxrQkFBekI7QUFBQSxRQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO09BREE7YUFFQSxRQUhpQjtJQUFBLENBSHJCO0FBQUEsSUFRQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxtQkFBQTtBQUFBLE1BQUEsbUJBQUEsR0FBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsR0FBRCxHQUFBO0FBQ3BCLGNBQUEsYUFBQTtBQUFBO0FBQ0UsWUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWIs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
