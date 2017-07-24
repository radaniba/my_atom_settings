(function() {
  var Config, ConfigManager, Kernel, KernelManager, child_process, fs, path, _;

  _ = require('lodash');

  child_process = require('child_process');

  fs = require('fs');

  path = require('path');

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
      return _.pickBy(settings.kernelspecs, function(_arg) {
        var spec;
        spec = _arg.spec;
        return (spec != null ? spec.language : void 0) && spec.display_name && spec.argv;
      });
    },
    setKernelMapping: function(kernel, grammar) {
      var mapping;
      mapping = {};
      mapping[this.getGrammarLanguageFor(grammar)] = kernel.display_name;
      return Config.setJson('kernelMappings', mapping, true);
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
        detail: (_.map(kernelSpecs, 'spec.display_name')).join('\n')
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
      kernelSpecs = _.map(this.parseKernelSpecSettings(), 'spec');
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
      var config, customKernelConnectionPath, data, e, finishKernelStartup, grammarLanguage, kernel;
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernelSpec.grammarLanguage = grammarLanguage;
      customKernelConnectionPath = path.join(atom.project.rootDirectories[0].path, 'hydrogen', 'connection.json');
      finishKernelStartup = (function(_this) {
        return function(kernel) {
          var startupCode;
          _this._runningKernels[grammarLanguage] = kernel;
          startupCode = Config.getJson('startupCode')[kernelSpec.display_name];
          if (startupCode != null) {
            console.log('executing startup code');
            startupCode = startupCode + ' \n';
            kernel.execute(startupCode);
          }
          return typeof onStarted === "function" ? onStarted(kernel) : void 0;
        };
      })(this);
      try {
        data = fs.readFileSync(customKernelConnectionPath, 'utf8');
        config = JSON.parse(data);
        console.log("Using custom kernel connection: ", customKernelConnectionPath);
        kernel = new Kernel(kernelSpec, grammar, config, customKernelConnectionPath, true);
        return finishKernelStartup(kernel);
      } catch (_error) {
        e = _error;
        if (e.code !== 'ENOENT') {
          trow(e);
        }
        console.log(e);
        return ConfigManager.writeConfigFile((function(_this) {
          return function(filepath, config) {
            var onlyConnect;
            kernel = new Kernel(kernelSpec, grammar, config, filepath, onlyConnect = false);
            return finishKernelStartup(kernel);
          };
        })(this));
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBTFQsQ0FBQTs7QUFBQSxFQU1BLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTmhCLENBQUE7O0FBQUEsRUFPQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FQVCxDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsYUFBQSxHQUNiO0FBQUEsSUFBQSxlQUFBLEVBQWlCLEVBQWpCO0FBQUEsSUFHQSx1QkFBQSxFQUF5QixTQUFBLEdBQUE7QUFDckIsVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxZQUFmLENBQVgsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLFFBQWUsQ0FBQyxXQUFoQjtBQUNJLGVBQU8sRUFBUCxDQURKO09BRkE7QUFNQSxhQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsUUFBUSxDQUFDLFdBQWxCLEVBQStCLFNBQUMsSUFBRCxHQUFBO0FBQ2xDLFlBQUEsSUFBQTtBQUFBLFFBRG9DLE9BQUQsS0FBQyxJQUNwQyxDQUFBO0FBQUEsK0JBQU8sSUFBSSxDQUFFLGtCQUFOLElBQW1CLElB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
