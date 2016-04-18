(function() {
  var Kernel, KernelManager, child_process, _;

  _ = require('lodash');

  child_process = require('child_process');

  Kernel = require('./kernel');

  module.exports = KernelManager = {
    runningKernels: {},
    getAvailableKernels: _.memoize(function() {
      var out;
      out = child_process.spawnSync('ipython', ['kernelspec', 'list', '--json']).stdout.toString();
      return _.pluck(JSON.parse(out).kernelspecs, 'spec');
    }),
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
    getConfigJson: function(key) {
      var error, value;
      if (!(value = atom.config.get("Hydrogen." + key))) {
        return {};
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUhULENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2I7QUFBQSxJQUFBLGNBQUEsRUFBZ0IsRUFBaEI7QUFBQSxJQUVBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxPQUFGLENBQVUsU0FBQSxHQUFBO0FBQzNCLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLGFBQWEsQ0FBQyxTQUFkLENBQXdCLFNBQXhCLEVBQWtDLENBQUMsWUFBRCxFQUFjLE1BQWQsRUFBc0IsUUFBdEIsQ0FBbEMsQ0FBa0UsQ0FBQyxNQUFNLENBQUMsUUFBMUUsQ0FBQSxDQUFOLENBQUE7YUFDQSxDQUFDLENBQUMsS0FBRixDQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQUMsV0FBeEIsRUFBcUMsTUFBckMsRUFGMkI7SUFBQSxDQUFWLENBRnJCO0FBQUEsSUFNQSxpQkFBQSxFQUFtQixTQUFBLEdBQUE7QUFDZixhQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLGNBQVQsQ0FBUCxDQURlO0lBQUEsQ0FObkI7QUFBQSxJQVNBLGVBQUEsRUFBaUIsU0FBQyxRQUFELEdBQUE7QUFDYixVQUFBLHNDQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFuQixDQUFBO0FBQUEsTUFDQSxvQkFBQSxHQUF1QixDQUFDLENBQUMsTUFBRixDQUFTLGdCQUFULEVBQTJCLFNBQUMsWUFBRCxFQUFlLFdBQWYsR0FBQTtBQUM5QyxlQUFPLFdBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBQSxLQUE2QixRQUFRLENBQUMsV0FBVCxDQUFBLENBQXBDLENBRDhDO01BQUEsQ0FBM0IsQ0FEdkIsQ0FBQTtBQUlBLE1BQUEsSUFBRywrQkFBSDtBQUNJLGVBQU8sb0JBQXFCLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBeEIsQ0FBQSxDQUFQLENBREo7T0FBQSxNQUFBO0FBR0ksZUFBTyxRQUFQLENBSEo7T0FMYTtJQUFBLENBVGpCO0FBQUEsSUFtQkEsYUFBQSxFQUFlLFNBQUMsR0FBRCxHQUFBO0FBQ1gsVUFBQSxZQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBaUIsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixXQUFBLEdBQVcsR0FBNUIsQ0FBUixDQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BQUE7QUFDQTtBQUNJLGVBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLENBQVAsQ0FESjtPQUFBLGNBQUE7QUFHSSxRQURFLGNBQ0YsQ0FBQTtlQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNkIsa0NBQUEsR0FBa0MsR0FBL0QsRUFBc0U7QUFBQSxVQUFBLE1BQUEsRUFBUSxLQUFSO1NBQXRFLEVBSEo7T0FGVztJQUFBLENBbkJmO0FBQUEsSUEwQkEsYUFBQSxFQUFlLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEdBQUE7O1FBQWEsUUFBTTtPQUM5QjtBQUFBLE1BQUEsSUFBOEMsS0FBOUM7QUFBQSxRQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxhQUFELENBQWUsR0FBZixDQUFSLEVBQTZCLEtBQTdCLENBQVIsQ0FBQTtPQUFBO2FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWlCLFdBQUEsR0FBVyxHQUE1QixFQUFtQyxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWYsQ0FBbkMsRUFGVztJQUFBLENBMUJmO0FBQUEsSUE4QkEsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBZSxrQkFBZixFQUFIO0lBQUEsQ0E5QnJCO0FBQUEsSUFnQ0Esd0JBQUEsRUFBMEIsU0FBQyxlQUFELEdBQUE7QUFDdEIsVUFBQSw0REFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQyxPQUFsQyxDQURBLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixlQUFqQixDQUhYLENBQUE7QUFBQSxNQUtBLGVBQUEsR0FBa0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFULEVBQWtCLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLFlBQUEsY0FBQTtBQUFBLFFBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsUUFBeEIsQ0FBQTs7VUFDQSxpQkFBa0IsTUFBTSxDQUFDO1NBRHpCO0FBR0EsZUFBTyx3QkFBQSxJQUNBLFFBQVEsQ0FBQyxXQUFULENBQUEsQ0FBQSxLQUEwQixjQUFjLENBQUMsV0FBZixDQUFBLENBRGpDLENBSmdDO01BQUEsQ0FBbEIsQ0FMbEIsQ0FBQTtBQVlBLE1BQUEsSUFBRyxlQUFlLENBQUMsTUFBaEIsS0FBMEIsQ0FBN0I7QUFDSSxRQUFBLFVBQUEsR0FBYSxlQUFnQixDQUFBLENBQUEsQ0FBN0IsQ0FESjtPQVpBO0FBY0EsTUFBQSxJQUFHLFlBQUEsR0FBZSxJQUFDLENBQUEsYUFBRCxDQUFlLGlCQUFmLENBQWtDLENBQUEsZUFBQSxDQUFwRDtBQUNJLFFBQUEsVUFBQSxHQUFhLENBQUMsQ0FBQyxNQUFGLENBQVMsZUFBVCxFQUEwQixTQUFDLENBQUQsR0FBQTtpQkFBTyxDQUFDLENBQUMsWUFBRixLQUFrQixhQUF6QjtRQUFBLENBQTFCLENBQWlFLENBQUEsQ0FBQSxDQUE5RSxDQURKO09BZEE7QUFnQkEsYUFBTyxDQUFDLENBQUMsTUFBRixDQUFTLFVBQVQsRUFBcUI7QUFBQSxRQUFDLGVBQUEsRUFBaUIsZUFBbEI7T0FBckIsQ0FBUCxDQWpCc0I7SUFBQSxDQWhDMUI7QUFBQSxJQW1EQSxpQkFBQSxFQUFtQixTQUFDLFFBQUQsR0FBQTtBQUNmLGFBQU8sK0NBQVAsQ0FEZTtJQUFBLENBbkRuQjtBQUFBLElBc0RBLDJCQUFBLEVBQTZCLFNBQUMsUUFBRCxHQUFBO0FBQ3pCLE1BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLFFBQWpCLENBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBRyxxQ0FBSDtBQUNJLGVBQU8sSUFBQyxDQUFBLGNBQWUsQ0FBQSxRQUFBLENBQXZCLENBREo7T0FBQSxNQUFBO0FBR0ksZUFBTyxJQUFQLENBSEo7T0FGeUI7SUFBQSxDQXREN0I7QUFBQSxJQTZEQSx3QkFBQSxFQUEwQixTQUFDLFFBQUQsR0FBQTtBQUN0QixhQUFPLGtEQUFQLENBRHNCO0lBQUEsQ0E3RDFCO0FBQUEsSUFnRUEsMEJBQUEsRUFBNEIsU0FBQyxRQUFELEdBQUE7QUFDeEIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLDJCQUFELENBQTZCLFFBQTdCLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxjQUFIO2VBQ0ksTUFBTSxDQUFDLFNBQVAsQ0FBQSxFQURKO09BRndCO0lBQUEsQ0FoRTVCO0FBQUEsSUFxRUEsd0JBQUEsRUFBMEIsU0FBQyxRQUFELEdBQUE7QUFDdEIsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsUUFBakIsQ0FBWCxDQUFBO0FBQ0EsTUFBQSxJQUFHLHFDQUFIO0FBQ0ksUUFBQSxJQUFDLENBQUEsY0FBZSxDQUFBLFFBQUEsQ0FBUyxDQUFDLE9BQTFCLENBQUEsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFBLElBQVEsQ0FBQSxjQUFlLENBQUEsUUFBQSxFQUYzQjtPQUZzQjtJQUFBLENBckUxQjtBQUFBLElBMkVBLFdBQUEsRUFBYSxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLGNBQXJCLEdBQUE7QUFDVCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFwQixDQUFBLENBQWpCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLFVBQVAsRUFBbUIsTUFBbkIsRUFBMkIsY0FBM0IsQ0FEYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsY0FBZSxDQUFBLFFBQUEsQ0FBaEIsR0FBNEIsTUFGNUIsQ0FBQTtBQUdBLGFBQU8sTUFBUCxDQUpTO0lBQUEsQ0EzRWI7QUFBQSxJQWlGQSxPQUFBLEVBQVMsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixTQUFqQixHQUFBO0FBQ0wsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLDJCQUFELENBQTZCLFFBQTdCLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxjQUFIO2VBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLFNBQXJCLEVBREo7T0FBQSxNQUFBO0FBR0ksY0FBTSxpQkFBTixDQUhKO09BRks7SUFBQSxDQWpGVDtBQUFBLElBd0ZBLFFBQUEsRUFBVSxTQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLFNBQWpCLEdBQUE7QUFDTixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsUUFBN0IsQ0FBVCxDQUFBO0FBQ0EsTUFBQSxJQUFHLGNBQUg7ZUFDSSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQixFQUFzQixTQUF0QixFQURKO09BQUEsTUFBQTtBQUdJLGNBQU0saUJBQU4sQ0FISjtPQUZNO0lBQUEsQ0F4RlY7QUFBQSxJQStGQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2FBQ0wsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFDLENBQUEsY0FBWCxFQUEyQixTQUFDLE1BQUQsR0FBQTtlQUFZLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFBWjtNQUFBLENBQTNCLEVBREs7SUFBQSxDQS9GVDtHQU5KLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
