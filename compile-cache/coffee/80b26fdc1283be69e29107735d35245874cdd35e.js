(function() {
  var Kernel, KernelManager, fs, jupyterPath, path, _;

  fs = require('fs');

  path = require('path');

  _ = require('lodash');

  jupyterPath = require('./paths').jupyterPath;

  Kernel = require('./kernel');

  module.exports = KernelManager = {
    kernelsDirOptions: jupyterPath('kernels'),
    runningKernels: {},
    pythonInfo: {
      display_name: "Python",
      language: "python"
    },
    availableKernels: null,
    getAvailableKernels: function() {
      var kernelLists, kernels, pythonKernels;
      if (this.availableKernels != null) {
        return this.availableKernels;
      } else {
        kernelLists = _.map(this.kernelsDirOptions, this.getKernelsFromDirectory);
        kernels = [];
        kernels = kernels.concat.apply(kernels, kernelLists);
        kernels = _.map(kernels, (function(_this) {
          return function(kernel) {
            kernel.language = _this.getTrueLanguage(kernel.language);
            return kernel;
          };
        })(this));
        pythonKernels = _.filter(kernels, function(kernel) {
          return kernel.language === 'python';
        });
        if (pythonKernels.length === 0) {
          kernels.push(this.pythonInfo);
        }
        return kernels;
      }
    },
    getRunningKernels: function() {
      return _.clone(this.runningKernels);
    },
    getKernelsFromDirectory: function(directory) {
      var error, kernelNames, kernels;
      try {
        kernelNames = fs.readdirSync(directory);
        kernels = _.map(kernelNames, (function(_this) {
          return function(name) {
            var info, kernelDirPath, kernelFilePath;
            kernelDirPath = path.join(directory, name);
            if (fs.statSync(kernelDirPath).isDirectory()) {
              kernelFilePath = path.join(kernelDirPath, 'kernel.json');
              info = JSON.parse(fs.readFileSync(kernelFilePath));
              if (info.language == null) {
                info.language = info.display_name.toLowerCase();
              }
              return info;
            } else {
              return null;
            }
          };
        })(this));
        kernels = _.filter(kernels);
      } catch (_error) {
        error = _error;
        kernels = [];
      }
      return kernels;
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
    getLanguageMappings: function() {
      var error, languageMappings;
      languageMappings = atom.config.get('Hydrogen.languageMappings');
      if (languageMappings) {
        try {
          return JSON.parse(languageMappings);
        } catch (_error) {
          error = _error;
          console.error(error);
        }
      }
      return {};
    },
    getKernelInfoForLanguage: function(grammarLanguage) {
      var kernelInfo, kernels, language, matchingKernels;
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
      if (matchingKernels.length === 0) {
        return null;
      } else {
        kernelInfo = matchingKernels[0];
        kernelInfo.grammarLanguage = grammarLanguage;
        return kernelInfo;
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FGSixDQUFBOztBQUFBLEVBSUMsY0FBZSxPQUFBLENBQVEsU0FBUixFQUFmLFdBSkQsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQU5ULENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2I7QUFBQSxJQUFBLGlCQUFBLEVBQW1CLFdBQUEsQ0FBWSxTQUFaLENBQW5CO0FBQUEsSUFDQSxjQUFBLEVBQWdCLEVBRGhCO0FBQUEsSUFFQSxVQUFBLEVBQ0k7QUFBQSxNQUFBLFlBQUEsRUFBYyxRQUFkO0FBQUEsTUFDQSxRQUFBLEVBQVUsUUFEVjtLQUhKO0FBQUEsSUFLQSxnQkFBQSxFQUFrQixJQUxsQjtBQUFBLElBT0EsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsbUNBQUE7QUFBQSxNQUFBLElBQUcsNkJBQUg7QUFDSSxlQUFPLElBQUMsQ0FBQSxnQkFBUixDQURKO09BQUEsTUFBQTtBQUdJLFFBQUEsV0FBQSxHQUFjLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGlCQUFQLEVBQTBCLElBQUMsQ0FBQSx1QkFBM0IsQ0FBZCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsRUFEVixDQUFBO0FBQUEsUUFFQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQU0s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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
