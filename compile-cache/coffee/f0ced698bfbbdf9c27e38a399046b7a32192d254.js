(function() {
  var Config, ConfigManager, Kernel, KernelManager, child_process, _;

  _ = require('lodash');

  child_process = require('child_process');

  Config = require('./config');

  ConfigManager = require('./config-manager');

  Kernel = require('./kernel');

  module.exports = KernelManager = {
    _runningKernels: {},
    parseKernelSpecSettings: function() {
      var settings;
      settings = Config.getJson('kernelspec');
      if (!settings.kernelspecs) {
        return {};
      }
      return _.pick(settings.kernelspecs, function(_arg) {
        var spec;
        spec = _arg.spec;
        return (spec != null ? spec.language : void 0) && spec.display_name && spec.argv;
      });
    },
    saveKernelSpecs: function(jsonString) {
      var e, kernelSpecs, message, newKernelSpecs, options;
      console.log('saveKernelSpecs:', jsonString);
      try {
        newKernelSpecs = JSON.parse(jsonString).kernelspecs;
      } catch (_error) {
        e = _error;
        message = 'Cannot parse `ipython kernelspecs` or `jupyter kernelspecs`';
        options = {
          detail: 'Use kernelSpec option in Hydrogen or update IPython/Jupyter to a version that supports: `jupyter kernelspec list --json` or `ipython kernelspec list --json`'
        };
        atom.notifications.addError(message, options);
        return;
      }
      if (newKernelSpecs == null) {
        return;
      }
      kernelSpecs = this.parseKernelSpecSettings();
      _.assign(kernelSpecs, newKernelSpecs);
      Config.setJson('kernelspec', {
        kernelspecs: kernelSpecs
      });
      message = 'Hydrogen Kernels updated:';
      options = {
        detail: (_.pluck(kernelSpecs, 'spec.display_name')).join('\n')
      };
      return atom.notifications.addInfo(message, options);
    },
    updateKernelSpecs: function() {
      var commands;
      commands = ['jupyter kernelspec list --json --log-level=CRITICAL', 'ipython kernelspec list --json --log-level=CRITICAL'];
      return child_process.exec(commands[0], (function(_this) {
        return function(err, stdout, stderr) {
          if (!err) {
            _this.saveKernelSpecs(stdout);
            return;
          }
          console.log('updateKernelSpecs: `jupyter kernelspec` failed', err);
          return child_process.exec(commands[1], function(err, stdout, stderr) {
            if (!err) {
              _this.saveKernelSpecs(stdout);
              return;
            }
            return console.log('updateKernelSpecs: `ipython kernelspec` failed', err);
          });
        };
      })(this));
    },
    getGrammarLanguageFor: function(grammar) {
      return grammar != null ? grammar.name.toLowerCase() : void 0;
    },
    kernelSpecProvidesGrammarLanguage: function(kernelSpec, grammarLanguage) {
      var kernelLanguage, mappedLanguage;
      kernelLanguage = kernelSpec.language;
      mappedLanguage = Config.getJson('languageMappings')[kernelLanguage];
      if (mappedLanguage) {
        return mappedLanguage === grammarLanguage;
      }
      return kernelLanguage.toLowerCase() === grammarLanguage;
    },
    getAllKernelSpecs: function() {
      var kernelSpecs;
      kernelSpecs = _.pluck(this.parseKernelSpecSettings(), 'spec');
      return kernelSpecs;
    },
    getAllKernelSpecsFor: function(grammarLanguage) {
      var kernelSpecs;
      if (grammarLanguage == null) {
        return [];
      }
      kernelSpecs = this.getAllKernelSpecs().filter((function(_this) {
        return function(spec) {
          return _this.kernelSpecProvidesGrammarLanguage(spec, grammarLanguage);
        };
      })(this));
      return kernelSpecs;
    },
    getKernelSpecFor: function(grammarLanguage) {
      var kernelMapping, kernelSpecs, _ref;
      if (grammarLanguage == null) {
        return null;
      }
      kernelMapping = (_ref = Config.getJson('kernelMappings')) != null ? _ref[grammarLanguage] : void 0;
      if (kernelMapping != null) {
        kernelSpecs = this.getAllKernelSpecs().filter(function(spec) {
          return spec.display_name === kernelMapping;
        });
      } else {
        kernelSpecs = this.getAllKernelSpecsFor(grammarLanguage);
      }
      return kernelSpecs[0];
    },
    getAllRunningKernels: function() {
      return _.clone(this._runningKernels);
    },
    getRunningKernelFor: function(grammarLanguage) {
      return this._runningKernels[grammarLanguage];
    },
    startKernelFor: function(grammar, onStarted) {
      var grammarLanguage, kernelSpec, message, options;
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      console.log('startKernelFor:', grammarLanguage);
      kernelSpec = this.getKernelSpecFor(grammarLanguage);
      if (kernelSpec == null) {
        message = "No kernel for language `" + grammarLanguage + "` found";
        options = {
          detail: 'Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it.'
        };
        atom.notifications.addError(message, options);
        return;
      }
      return this.startKernel(kernelSpec, grammar, onStarted);
    },
    startKernel: function(kernelSpec, grammar, onStarted) {
      var grammarLanguage;
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernelSpec.grammarLanguage = grammarLanguage;
      return ConfigManager.writeConfigFile((function(_this) {
        return function(filepath, config) {
          var kernel, startupCode;
          kernel = new Kernel(kernelSpec, grammar, config, filepath);
          _this._runningKernels[grammarLanguage] = kernel;
          startupCode = Config.getJson('startupCode')[kernelSpec.display_name];
          if (startupCode != null) {
            console.log('executing startup code');
            startupCode = startupCode + ' \n';
            kernel.execute(startupCode);
          }
          return typeof onStarted === "function" ? onStarted(kernel) : void 0;
        };
      })(this));
    },
    destroyRunningKernel: function(kernel) {
      delete this._runningKernels[kernel.kernelSpec.grammarLanguage];
      return kernel.destroy();
    },
    destroy: function() {
      return _.forEach(this._runningKernels, function(kernel) {
        return kernel.destroy();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUhULENBQUE7O0FBQUEsRUFJQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUpoQixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBTFQsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGFBQUEsR0FDYjtBQUFBLElBQUEsZUFBQSxFQUFpQixFQUFqQjtBQUFBLElBR0EsdUJBQUEsRUFBeUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsUUFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQWUsWUFBZixDQUFYLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxRQUFlLENBQUMsV0FBaEI7QUFDSSxlQUFPLEVBQVAsQ0FESjtPQUZBO0FBTUEsYUFBTyxDQUFDLENBQUMsSUFBRixDQUFPLFFBQVEsQ0FBQyxXQUFoQixFQUE2QixTQUFDLElBQUQsR0FBQTtBQUNoQyxZQUFBLElBQUE7QUFBQSxRQURrQyxPQUFELEtBQUMsSUFDbEMsQ0FBQTtBQUFBLCtCQUFPLElBQUksQ0FBRSxrQkFBTixJQUFtQixJQUFJLENBQUMsWUFBeEIsSUFBeUMsSUFBSSxDQUFDLElBQXJELENBRGdDO01BQUEsQ0FBN0IsQ0FBUCxDQVBxQjtJQUFBLENBSHpCO0FBQUEsSUFjQSxlQUFBLEVB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
