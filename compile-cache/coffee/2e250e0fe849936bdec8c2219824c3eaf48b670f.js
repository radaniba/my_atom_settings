(function() {
  var Config, ConfigManager, Kernel, KernelManager, child_process, _;

  _ = require('lodash');

  child_process = require('child_process');

  Config = require('./config');

  ConfigManager = require('./config-manager');

  Kernel = require('./kernel');

  module.exports = KernelManager = {
    runningKernels: {},
    kernelsUpdatedOnce: false,
    getAvailableKernels: function() {
      var kernels, kernelspec;
      kernelspec = Config.getJson('kernelspec', {
        kernelspecs: {}
      });
      kernels = _.pluck(kernelspec.kernelspecs, 'spec');
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
            Config.setJson('kernelspec', kernelspec);
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
        languageMappings = Config.getJson('languageMappings');
        languageMatches = _.filter(languageMappings, function(trueLanguage, languageKey) {
          return (languageKey != null ? languageKey.toLowerCase() : void 0) === language.toLowerCase();
        });
        if (languageMatches[0] != null) {
          return languageMatches[0].toLowerCase();
        }
      }
      return language;
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
      if (display_name = Config.getJson('grammarToKernel')[grammarLanguage]) {
        kernelInfo = _.filter(matchingKernels, function(kernel) {
          return kernel.display_name === display_name;
        })[0];
      }
      return _.assign(kernelInfo, {
        grammarLanguage: grammarLanguage
      });
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
          var kernel, startupCode;
          kernel = new Kernel(kernelInfo, config, filepath);
          _this.runningKernels[kernelInfo.language.toLowerCase()] = kernel;
          startupCode = Config.getJson('startupCode')[kernelInfo.display_name];
          if (startupCode != null) {
            console.log("executing startup code");
            startupCode = startupCode + ' \n';
            kernel.execute(startupCode);
          }
          return typeof onStarted === "function" ? onStarted(kernel) : void 0;
        };
      })(this));
    },
    startKernelIfNeeded: function(language, onStarted) {
      var kernelInfo, message, options, runningKernel;
      console.log("startKernelIfNeeded:", language);
      kernelInfo = this.getKernelInfoForLanguage(language);
      if (kernelInfo == null) {
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
      return this.startKernel(kernelInfo, onStarted);
    },
    destroyRunningKernelForLanguage: function(language) {
      var kernel;
      kernel = this.getRunningKernelForLanguage(language);
      if (kernel != null) {
        kernel.destroy();
        return delete this.runningKernels[kernel.language];
      }
    },
    destroy: function() {
      return _.forEach(this.runningKernels, function(kernel) {
        return kernel.destroy();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUhULENBQUE7O0FBQUEsRUFJQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUpoQixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBTFQsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGFBQUEsR0FDYjtBQUFBLElBQUEsY0FBQSxFQUFnQixFQUFoQjtBQUFBLElBQ0Esa0JBQUEsRUFBb0IsS0FEcEI7QUFBQSxJQUdBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTtBQUNqQixVQUFBLG1CQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxZQUFmLEVBQTZCO0FBQUEsUUFBRSxXQUFBLEVBQVksRUFBZDtPQUE3QixDQUFiLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLFVBQVUsQ0FBQyxXQUFuQixFQUFnQyxNQUFoQyxDQURWLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUF5QixDQUFBLGtCQUF6QjtBQUFBLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBQUE7T0FGQTtBQUdBLGFBQU8sT0FBUCxDQUppQjtJQUFBLENBSHJCO0FBQUEsSUFTQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxtQkFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
