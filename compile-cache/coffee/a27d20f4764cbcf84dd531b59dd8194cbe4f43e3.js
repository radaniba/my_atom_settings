(function() {
  var Config, ConfigManager, Kernel, KernelManager, child_process, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('lodash');

  child_process = require('child_process');

  fs = require('fs');

  path = require('path');

  Config = require('./config');

  ConfigManager = require('./config-manager');

  Kernel = require('./kernel');

  module.exports = KernelManager = (function() {
    function KernelManager() {
      this.getKernelSpecsFromJupyter = __bind(this.getKernelSpecsFromJupyter, this);
      this._runningKernels = {};
      this._kernelSpecs = this.getKernelSpecsFromSettings();
    }

    KernelManager.prototype.destroy = function() {
      return _.forEach(this._runningKernels, (function(_this) {
        return function(kernel) {
          return _this.destroyRunningKernel(kernel);
        };
      })(this));
    };

    KernelManager.prototype.destroyRunningKernel = function(kernel) {
      delete this._runningKernels[kernel.kernelSpec.language];
      return kernel.destroy();
    };

    KernelManager.prototype.startKernelFor = function(grammar, onStarted) {
      if (_.isEmpty(this._kernelSpecs)) {
        return this.updateKernelSpecs((function(_this) {
          return function() {
            return _this._startKernelFor(grammar, onStarted);
          };
        })(this));
      } else {
        return this._startKernelFor(grammar, onStarted);
      }
    };

    KernelManager.prototype._startKernelFor = function(grammar, onStarted) {
      var kernelSpec, language, message, options;
      language = this.getLanguageFor(grammar);
      kernelSpec = this.getKernelSpecFor(language);
      if (kernelSpec == null) {
        message = "No kernel for language `" + language + "` found";
        options = {
          detail: 'Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it.'
        };
        atom.notifications.addError(message, options);
        return;
      }
      console.log('startKernelFor:', language);
      return this.startKernel(kernelSpec, grammar, onStarted);
    };

    KernelManager.prototype.startKernel = function(kernelSpec, grammar, onStarted) {
      var config, connectionFile, data, e, finishKernelStartup, kernel, language, rootDirectory;
      language = this.getLanguageFor(grammar);
      kernelSpec.language = language;
      rootDirectory = atom.project.rootDirectories[0].path;
      connectionFile = path.join(rootDirectory, 'hydrogen', 'connection.json');
      finishKernelStartup = (function(_this) {
        return function(kernel) {
          var startupCode;
          _this._runningKernels[language] = kernel;
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
        data = fs.readFileSync(connectionFile, 'utf8');
        config = JSON.parse(data);
        console.log('KernelManager: Using connection file: ', connectionFile);
        kernel = new Kernel(kernelSpec, grammar, config, connectionFile, true);
        return finishKernelStartup(kernel);
      } catch (_error) {
        e = _error;
        if (e.code !== 'ENOENT') {
          throw e;
        }
        return ConfigManager.writeConfigFile(function(filepath, config) {
          var onlyConnect;
          kernel = new Kernel(kernelSpec, grammar, config, filepath, onlyConnect = false);
          return finishKernelStartup(kernel);
        });
      }
    };

    KernelManager.prototype.getAllRunningKernels = function() {
      return _.clone(this._runningKernels);
    };

    KernelManager.prototype.getRunningKernelFor = function(language) {
      return this._runningKernels[language];
    };

    KernelManager.prototype.getLanguageFor = function(grammar) {
      return grammar != null ? grammar.name.toLowerCase() : void 0;
    };

    KernelManager.prototype.getAllKernelSpecs = function() {
      return _.map(this._kernelSpecs, 'spec');
    };

    KernelManager.prototype.getAllKernelSpecsFor = function(language) {
      var kernelSpecs;
      if (language == null) {
        return [];
      }
      kernelSpecs = this.getAllKernelSpecs().filter((function(_this) {
        return function(spec) {
          return _this.kernelSpecProvidesLanguage(spec, language);
        };
      })(this));
      return kernelSpecs;
    };

    KernelManager.prototype.getKernelSpecFor = function(language) {
      var kernelMapping, kernelSpecs, _ref;
      if (language == null) {
        return null;
      }
      kernelMapping = (_ref = Config.getJson('kernelMappings')) != null ? _ref[language] : void 0;
      if (kernelMapping != null) {
        kernelSpecs = this.getAllKernelSpecs().filter(function(spec) {
          return spec.display_name === kernelMapping;
        });
      } else {
        kernelSpecs = this.getAllKernelSpecsFor(language);
      }
      return kernelSpecs[0];
    };

    KernelManager.prototype.kernelSpecProvidesLanguage = function(kernelSpec, language) {
      var kernelLanguage, mappedLanguage;
      kernelLanguage = kernelSpec.language;
      mappedLanguage = Config.getJson('languageMappings')[kernelLanguage];
      if (mappedLanguage) {
        return mappedLanguage === language;
      }
      return kernelLanguage.toLowerCase() === language;
    };

    KernelManager.prototype.getKernelSpecsFromSettings = function() {
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
    };

    KernelManager.prototype.mergeKernelSpecs = function(kernelSpecs) {
      return _.assign(this._kernelSpecs, kernelSpecs);
    };

    KernelManager.prototype.updateKernelSpecs = function(callback) {
      this._kernelSpecs = this.getKernelSpecsFromSettings;
      return this.getKernelSpecsFromJupyter((function(_this) {
        return function(err, kernelSpecsFromJupyter) {
          var message, options;
          if (!err) {
            _this.mergeKernelSpecs(kernelSpecsFromJupyter);
          }
          if (_.isEmpty(_this._kernelSpecs)) {
            message = 'No kernel specs found';
            options = {
              detail: 'Use kernelSpec option in Hydrogen or update IPython/Jupyter to a version that supports: `jupyter kernelspec list --json` or `ipython kernelspec list --json`',
              dismissable: true
            };
            atom.notifications.addError(message, options);
          } else {
            err = null;
            message = 'Hydrogen Kernels updated:';
            options = {
              detail: (_.map(_this._kernelSpecs, 'spec.display_name')).join('\n')
            };
            atom.notifications.addInfo(message, options);
          }
          return typeof callback === "function" ? callback(err, _this._kernelSpecs) : void 0;
        };
      })(this));
    };

    KernelManager.prototype.getKernelSpecsFromJupyter = function(callback) {
      var ipython, jupyter;
      jupyter = 'jupyter kernelspec list --json --log-level=CRITICAL';
      ipython = 'ipython kernelspec list --json --log-level=CRITICAL';
      return this.getKernelSpecsFrom(jupyter, (function(_this) {
        return function(jupyterError, kernelSpecs) {
          if (!jupyterError) {
            if (typeof callback === "function") {
              callback(jupyterError, kernelSpecs);
            }
            return;
          }
          return _this.getKernelSpecsFrom(ipython, function(ipythonError, kernelSpecs) {
            if (!ipythonError) {
              return typeof callback === "function" ? callback(ipythonError, kernelSpecs) : void 0;
            } else {
              return typeof callback === "function" ? callback(jupyterError, kernelSpecs) : void 0;
            }
          });
        };
      })(this));
    };

    KernelManager.prototype.getKernelSpecsFrom = function(command, callback) {
      var options;
      options = {
        killSignal: 'SIGINT'
      };
      return child_process.exec(command, options, function(err, stdout, stderr) {
        var error, kernelSpecs;
        if (!err) {
          try {
            kernelSpecs = JSON.parse(stdout).kernelspecs;
          } catch (_error) {
            error = _error;
            err = error;
            console.log('Could not parse kernelspecs:', err);
          }
        }
        return typeof callback === "function" ? callback(err, kernelSpecs) : void 0;
      });
    };

    KernelManager.prototype.setKernelMapping = function(kernel, grammar) {
      var language, mapping;
      language = this.getLanguageFor(grammar);
      mapping = {};
      mapping[language] = kernel.display_name;
      return Config.setJson('kernelMappings', mapping, true);
    };

    return KernelManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIva2VybmVsLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdFQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsYUFBQSxHQUFnQixPQUFBLENBQVEsZUFBUixDQURoQixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FMVCxDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQVBULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1csSUFBQSx1QkFBQSxHQUFBO0FBQ1QsbUZBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsRUFBbkIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLDBCQUFELENBQUEsQ0FEaEIsQ0FEUztJQUFBLENBQWI7O0FBQUEsNEJBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNMLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBQyxDQUFBLGVBQVgsRUFBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUFaO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/kernel-manager.coffee
