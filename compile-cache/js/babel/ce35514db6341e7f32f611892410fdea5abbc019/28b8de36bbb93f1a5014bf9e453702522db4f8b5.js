Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require('child_process');

var _spawnteract = require('spawnteract');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _wsKernel = require('./ws-kernel');

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _zmqKernel = require('./zmq-kernel');

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _kernelPicker = require('./kernel-picker');

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

'use babel';

var KernelManager = (function () {
  function KernelManager() {
    _classCallCheck(this, KernelManager);

    this._runningKernels = {};
    this._kernelSpecs = this.getKernelSpecsFromSettings();
  }

  _createClass(KernelManager, [{
    key: 'destroy',
    value: function destroy() {
      _lodash2['default'].forEach(this._runningKernels, function (kernel) {
        return kernel.destroy();
      });
      this._runningKernels = {};
    }
  }, {
    key: 'setRunningKernelFor',
    value: function setRunningKernelFor(grammar, kernel) {
      var language = this.getLanguageFor(grammar);

      kernel.kernelSpec.language = language;

      this._runningKernels[language] = kernel;
    }
  }, {
    key: 'destroyRunningKernelFor',
    value: function destroyRunningKernelFor(grammar) {
      var language = this.getLanguageFor(grammar);
      var kernel = this._runningKernels[language];
      delete this._runningKernels[language];
      if (kernel) kernel.destroy();
    }
  }, {
    key: 'restartRunningKernelFor',
    value: function restartRunningKernelFor(grammar, onRestarted) {
      var language = this.getLanguageFor(grammar);
      var kernel = this._runningKernels[language];

      if (kernel instanceof _wsKernel2['default']) {
        var future = kernel.restart();
        if (onRestarted) future.then(function () {
          return onRestarted(kernel);
        });
        return;
      }

      if (kernel instanceof _zmqKernel2['default'] && kernel.kernelProcess) {
        var kernelSpec = kernel.kernelSpec;

        this.destroyRunningKernelFor(grammar);
        this.startKernel(kernelSpec, grammar, onRestarted);
        return;
      }

      (0, _log2['default'])('KernelManager: restartRunningKernelFor: ignored', kernel);
      atom.notifications.addWarning('Cannot restart this kernel');
      if (onRestarted) onRestarted(kernel);
    }
  }, {
    key: 'startKernelFor',
    value: function startKernelFor(grammar, onStarted) {
      var _this = this;

      try {
        var rootDirectory = atom.project.rootDirectories[0] ? atom.project.rootDirectories[0].path : _path2['default'].dirname(atom.workspace.getActiveTextEditor().getPath());
        var connectionFile = _path2['default'].join(rootDirectory, 'hydrogen', 'connection.json');
        var connectionString = _fs2['default'].readFileSync(connectionFile, 'utf8');
        var connection = JSON.parse(connectionString);
        this.startExistingKernel(grammar, connection, connectionFile, onStarted);
        return;
      } catch (e) {
        if (e.code !== 'ENOENT') {
          console.error('KernelManager: Cannot start existing kernel:\n', e);
        }
      }

      var language = this.getLanguageFor(grammar);
      this.getKernelSpecFor(language, function (kernelSpec) {
        if (!kernelSpec) {
          var message = 'No kernel for language `' + language + '` found';
          var description = 'Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it.';
          atom.notifications.addError(message, { description: description });
          return;
        }

        _this.startKernel(kernelSpec, grammar, onStarted);
      });
    }
  }, {
    key: 'startExistingKernel',
    value: function startExistingKernel(grammar, connection, connectionFile, onStarted) {
      var language = this.getLanguageFor(grammar);

      (0, _log2['default'])('KernelManager: startExistingKernel: Assuming', language);

      var kernelSpec = {
        display_name: 'Existing Kernel',
        language: language,
        argv: [],
        env: {}
      };

      var kernel = new _zmqKernel2['default'](kernelSpec, grammar, connection, connectionFile);

      this.setRunningKernelFor(grammar, kernel);

      this._executeStartupCode(kernel);

      if (onStarted) onStarted(kernel);
    }
  }, {
    key: 'startKernel',
    value: function startKernel(kernelSpec, grammar, onStarted) {
      var _this2 = this;

      var language = this.getLanguageFor(grammar);

      (0, _log2['default'])('KernelManager: startKernelFor:', language);

      var projectPath = _path2['default'].dirname(atom.workspace.getActiveTextEditor().getPath());
      var spawnOptions = { cwd: projectPath };
      (0, _spawnteract.launchSpec)(kernelSpec, spawnOptions).then(function (_ref) {
        var config = _ref.config;
        var connectionFile = _ref.connectionFile;
        var spawn = _ref.spawn;

        var kernel = new _zmqKernel2['default'](kernelSpec, grammar, config, connectionFile, spawn);
        _this2.setRunningKernelFor(grammar, kernel);

        _this2._executeStartupCode(kernel);

        if (onStarted) onStarted(kernel);
      });
    }
  }, {
    key: '_executeStartupCode',
    value: function _executeStartupCode(kernel) {
      var displayName = kernel.kernelSpec.display_name;
      var startupCode = _config2['default'].getJson('startupCode')[displayName];
      if (startupCode) {
        (0, _log2['default'])('KernelManager: Executing startup code:', startupCode);
        startupCode = startupCode + ' \n';
        kernel.execute(startupCode);
      }
    }
  }, {
    key: 'getAllRunningKernels',
    value: function getAllRunningKernels() {
      return _lodash2['default'].clone(this._runningKernels);
    }
  }, {
    key: 'getRunningKernelFor',
    value: function getRunningKernelFor(language) {
      return this._runningKernels[language];
    }
  }, {
    key: 'getLanguageFor',
    value: function getLanguageFor(grammar) {
      return grammar ? grammar.name.toLowerCase() : null;
    }
  }, {
    key: 'getAllKernelSpecs',
    value: function getAllKernelSpecs(callback) {
      var _this3 = this;

      if (_lodash2['default'].isEmpty(this._kernelSpecs)) {
        return this.updateKernelSpecs(function () {
          return callback(_lodash2['default'].map(_this3._kernelSpecs, 'spec'));
        });
      }
      return callback(_lodash2['default'].map(this._kernelSpecs, 'spec'));
    }
  }, {
    key: 'getAllKernelSpecsFor',
    value: function getAllKernelSpecsFor(language, callback) {
      var _this4 = this;

      if (language) {
        return this.getAllKernelSpecs(function (kernelSpecs) {
          var specs = kernelSpecs.filter(function (spec) {
            return _this4.kernelSpecProvidesLanguage(spec, language);
          });

          return callback(specs);
        });
      }
      return callback([]);
    }
  }, {
    key: 'getKernelSpecFor',
    value: function getKernelSpecFor(language, callback) {
      var _this5 = this;

      if (!language) {
        return;
      }

      this.getAllKernelSpecsFor(language, function (kernelSpecs) {
        if (kernelSpecs.length <= 1) {
          callback(kernelSpecs[0]);
          return;
        }

        if (!_this5.kernelPicker) {
          _this5.kernelPicker = new _kernelPicker2['default'](function (onUpdated) {
            return onUpdated(kernelSpecs);
          });
          _this5.kernelPicker.onConfirmed = function (_ref2) {
            var kernelSpec = _ref2.kernelSpec;
            return callback(kernelSpec);
          };
        }
        _this5.kernelPicker.toggle();
      });
    }
  }, {
    key: 'kernelSpecProvidesLanguage',
    value: function kernelSpecProvidesLanguage(kernelSpec, language) {
      var kernelLanguage = kernelSpec.language;
      var mappedLanguage = _config2['default'].getJson('languageMappings')[kernelLanguage];

      if (mappedLanguage) {
        return mappedLanguage === language;
      }

      return kernelLanguage.toLowerCase() === language;
    }
  }, {
    key: 'getKernelSpecsFromSettings',
    value: function getKernelSpecsFromSettings() {
      var settings = _config2['default'].getJson('kernelspec');

      if (!settings.kernelspecs) {
        return {};
      }

      // remove invalid entries
      return _lodash2['default'].pickBy(settings.kernelspecs, function (_ref3) {
        var spec = _ref3.spec;
        return spec && spec.language && spec.display_name && spec.argv;
      });
    }
  }, {
    key: 'mergeKernelSpecs',
    value: function mergeKernelSpecs(kernelSpecs) {
      _lodash2['default'].assign(this._kernelSpecs, kernelSpecs);
    }
  }, {
    key: 'updateKernelSpecs',
    value: function updateKernelSpecs(callback) {
      var _this6 = this;

      this._kernelSpecs = this.getKernelSpecsFromSettings;
      this.getKernelSpecsFromJupyter(function (err, kernelSpecsFromJupyter) {
        if (!err) {
          _this6.mergeKernelSpecs(kernelSpecsFromJupyter);
        }

        if (_lodash2['default'].isEmpty(_this6._kernelSpecs)) {
          var message = 'No kernel specs found';
          var options = {
            description: 'Use kernelSpec option in Hydrogen or update IPython/Jupyter to a version that supports: `jupyter kernelspec list --json` or `ipython kernelspec list --json`',
            dismissable: true
          };
          atom.notifications.addError(message, options);
        } else {
          err = null;
          var message = 'Hydrogen Kernels updated:';
          var options = {
            detail: _lodash2['default'].map(_this6._kernelSpecs, 'spec.display_name').join('\n')
          };
          atom.notifications.addInfo(message, options);
        }

        if (callback) callback(err, _this6._kernelSpecs);
      });
    }
  }, {
    key: 'getKernelSpecsFromJupyter',
    value: function getKernelSpecsFromJupyter(callback) {
      var _this7 = this;

      var jupyter = 'jupyter kernelspec list --json --log-level=CRITICAL';
      var ipython = 'ipython kernelspec list --json --log-level=CRITICAL';

      return this.getKernelSpecsFrom(jupyter, function (jupyterError, kernelSpecs) {
        if (!jupyterError) {
          return callback(jupyterError, kernelSpecs);
        }

        return _this7.getKernelSpecsFrom(ipython, function (ipythonError, specs) {
          if (!ipythonError) {
            return callback(ipythonError, specs);
          }
          return callback(jupyterError, specs);
        });
      });
    }
  }, {
    key: 'getKernelSpecsFrom',
    value: function getKernelSpecsFrom(command, callback) {
      var options = { killSignal: 'SIGINT' };
      var kernelSpecs = undefined;
      return (0, _child_process.exec)(command, options, function (err, stdout) {
        if (!err) {
          try {
            kernelSpecs = JSON.parse(stdout).kernelspecs;
          } catch (error) {
            err = error;
            (0, _log2['default'])('Could not parse kernelspecs:', err);
          }
        }

        return callback(err, kernelSpecs);
      });
    }
  }]);

  return KernelManager;
})();

exports['default'] = KernelManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBRWMsUUFBUTs7Ozs2QkFDRCxlQUFlOzsyQkFDVCxhQUFhOztrQkFDekIsSUFBSTs7OztvQkFDRixNQUFNOzs7O3NCQUVKLFVBQVU7Ozs7d0JBQ1IsYUFBYTs7Ozt5QkFDWixjQUFjOzs7OzRCQUNYLGlCQUFpQjs7OzttQkFDMUIsT0FBTzs7OztBQVp2QixXQUFXLENBQUM7O0lBY1MsYUFBYTtBQUNyQixXQURRLGFBQWEsR0FDbEI7MEJBREssYUFBYTs7QUFFOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztHQUN2RDs7ZUFKa0IsYUFBYTs7V0FPekIsbUJBQUc7QUFDUiwwQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzVELFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO0tBQzNCOzs7V0FHa0IsNkJBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUNuQyxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QyxZQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXRDLFVBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQ3pDOzs7V0FHc0IsaUNBQUMsT0FBTyxFQUFFO0FBQy9CLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FB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RSxVQUFDLFlBQVksRUFBRSxLQUFLLEVBQUs7QUFDL0QsY0FBSSxDQUFDLFlBQVksRUFBRTtBQUNqQixtQkFBTyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQ3RDO0FBQ0QsaUJBQU8sUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0QyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBR2lCLDRCQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDcEMsVUFBTSxPQUFPLEdBQUcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUM7QUFDekMsVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixhQUFPLHlCQUFLLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFLO0FBQzdDLFlBQUksQ0FBQyxHQUFHLEVBQUU7QUFDUixjQUFJO0FBQ0YsdUJBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQztXQUM5QyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBRyxHQUFHLEtBQUssQ0FBQztBQUNaLGtDQUFJLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1dBQzFDO1NBQ0Y7O0FBRUQsZUFBTyxRQUFRLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO09BQ25DLENBQUMsQ0FBQztLQUNKOzs7U0FuU2tCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBsYXVuY2hTcGVjIH0gZnJvbSAnc3Bhd250ZXJhY3QnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBXU0tlcm5lbCBmcm9tICcuL3dzLWtlcm5lbCc7XG5pbXBvcnQgWk1RS2VybmVsIGZyb20gJy4vem1xLWtlcm5lbCc7XG5pbXBvcnQgS2VybmVsUGlja2VyIGZyb20gJy4va2VybmVsLXBpY2tlcic7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2VybmVsTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3J1bm5pbmdLZXJuZWxzID0ge307XG4gICAgdGhpcy5fa2VybmVsU3BlY3MgPSB0aGlzLmdldEtlcm5lbFNwZWNzRnJvbVNldHRpbmdzKCk7XG4gIH1cblxuXG4gIGRlc3Ryb3koKSB7XG4gICAgXy5mb3JFYWNoKHRoaXMuX3J1bm5pbmdLZXJuZWxzLCBrZXJuZWwgPT4ga2VybmVsLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fcnVubmluZ0tlcm5lbHMgPSB7fTtcbiAgfVxuXG5cbiAgc2V0UnVubmluZ0tlcm5lbEZvcihncmFtbWFyLCBrZXJuZWwpIHtcbiAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG5cbiAgICBrZXJuZWwua2VybmVsU3BlYy5sYW5ndWFnZSA9IGxhbmd1YWdlO1xuXG4gICAgdGhpcy5fcnVubmluZ0tlcm5lbHNbbGFuZ3VhZ2VdID0ga2VybmVsO1xuICB9XG5cblxuICBkZXN0cm95UnVubmluZ0tlcm5lbEZvcihncmFtbWFyKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMuX3J1bm5pbmdLZXJuZWxzW2xhbmd1YWdlXTtcbiAgICBkZWxldGUgdGhpcy5fcnVubmluZ0tlcm5lbHNbbGFuZ3VhZ2VdO1xuICAgIGlmIChrZXJuZWwpIGtlcm5lbC5kZXN0cm95KCk7XG4gIH1cblxuXG4gIHJlc3RhcnRSdW5uaW5nS2VybmVsRm9yKGdyYW1tYXIsIG9uUmVzdGFydGVkKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMuX3J1bm5pbmdLZXJuZWxzW2xhbmd1YWdlXTtcblxuICAgIGlmIChrZXJuZWwgaW5zdGFuY2VvZiBXU0tlcm5lbCkge1xuICAgICAgY29uc3QgZnV0dXJlID0ga2VybmVsLnJlc3RhcnQoKTtcbiAgICAgIGlmIChvblJlc3RhcnRlZCkgZnV0dXJlLnRoZW4oKCkgPT4gb25SZXN0YXJ0ZWQoa2VybmVsKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGtlcm5lbCBpbnN0YW5jZW9mIFpNUUtlcm5lbCAmJiBrZXJuZWwua2VybmVsUHJvY2Vzcykge1xuICAgICAgY29uc3QgeyBrZXJuZWxTcGVjIH0gPSBrZXJuZWw7XG4gICAgICB0aGlzLmRlc3Ryb3lSdW5uaW5nS2VybmVsRm9yKGdyYW1tYXIpO1xuICAgICAgdGhpcy5zdGFydEtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCBvblJlc3RhcnRlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9nKCdLZXJuZWxNYW5hZ2VyOiByZXN0YXJ0UnVubmluZ0tlcm5lbEZvcjogaWdub3JlZCcsIGtlcm5lbCk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ0Nhbm5vdCByZXN0YXJ0IHRoaXMga2VybmVsJyk7XG4gICAgaWYgKG9uUmVzdGFydGVkKSBvblJlc3RhcnRlZChrZXJuZWwpO1xuICB9XG5cblxuICBzdGFydEtlcm5lbEZvcihncmFtbWFyLCBvblN0YXJ0ZWQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgcm9vdERpcmVjdG9yeSA9IChhdG9tLnByb2plY3Qucm9vdERpcmVjdG9yaWVzWzBdKSA/XG4gICAgICAgIGF0b20ucHJvamVjdC5yb290RGlyZWN0b3JpZXNbMF0ucGF0aCA6XG4gICAgICAgIHBhdGguZGlybmFtZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0UGF0aCgpKTtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb25GaWxlID0gcGF0aC5qb2luKFxuICAgICAgICByb290RGlyZWN0b3J5LCAnaHlkcm9nZW4nLCAnY29ubmVjdGlvbi5qc29uJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb25uZWN0aW9uU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGNvbm5lY3Rpb25GaWxlLCAndXRmOCcpO1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IEpTT04ucGFyc2UoY29ubmVjdGlvblN0cmluZyk7XG4gICAgICB0aGlzLnN0YXJ0RXhpc3RpbmdLZXJuZWwoZ3JhbW1hciwgY29ubmVjdGlvbiwgY29ubmVjdGlvbkZpbGUsIG9uU3RhcnRlZCk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignS2VybmVsTWFuYWdlcjogQ2Fubm90IHN0YXJ0IGV4aXN0aW5nIGtlcm5lbDpcXG4nLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG4gICAgdGhpcy5nZXRLZXJuZWxTcGVjRm9yKGxhbmd1YWdlLCAoa2VybmVsU3BlYykgPT4ge1xuICAgICAgaWYgKCFrZXJuZWxTcGVjKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm8ga2VybmVsIGZvciBsYW5ndWFnZSBcXGAke2xhbmd1YWdlfVxcYCBmb3VuZGA7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gJ0NoZWNrIHRoYXQgdGhlIGxhbmd1YWdlIGZvciB0aGlzIGZpbGUgaXMgc2V0IGluIEF0b20gYW5kIHRoYXQgeW91IGhhdmUgYSBKdXB5dGVyIGtlcm5lbCBpbnN0YWxsZWQgZm9yIGl0Lic7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7IGRlc2NyaXB0aW9uIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhcnRLZXJuZWwoa2VybmVsU3BlYywgZ3JhbW1hciwgb25TdGFydGVkKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgc3RhcnRFeGlzdGluZ0tlcm5lbChncmFtbWFyLCBjb25uZWN0aW9uLCBjb25uZWN0aW9uRmlsZSwgb25TdGFydGVkKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuXG4gICAgbG9nKCdLZXJuZWxNYW5hZ2VyOiBzdGFydEV4aXN0aW5nS2VybmVsOiBBc3N1bWluZycsIGxhbmd1YWdlKTtcblxuICAgIGNvbnN0IGtlcm5lbFNwZWMgPSB7XG4gICAgICBkaXNwbGF5X25hbWU6ICdFeGlzdGluZyBLZXJuZWwnLFxuICAgICAgbGFuZ3VhZ2UsXG4gICAgICBhcmd2OiBbXSxcbiAgICAgIGVudjoge30sXG4gICAgfTtcblxuICAgIGNvbnN0IGtlcm5lbCA9IG5ldyBaTVFLZXJuZWwoa2VybmVsU3BlYywgZ3JhbW1hciwgY29ubmVjdGlvbiwgY29ubmVjdGlvbkZpbGUpO1xuXG4gICAgdGhpcy5zZXRSdW5uaW5nS2VybmVsRm9yKGdyYW1tYXIsIGtlcm5lbCk7XG5cbiAgICB0aGlzLl9leGVjdXRlU3RhcnR1cENvZGUoa2VybmVsKTtcblxuICAgIGlmIChvblN0YXJ0ZWQpIG9uU3RhcnRlZChrZXJuZWwpO1xuICB9XG5cblxuICBzdGFydEtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCBvblN0YXJ0ZWQpIHtcbiAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuZ2V0TGFuZ3VhZ2VGb3IoZ3JhbW1hcik7XG5cbiAgICBsb2coJ0tlcm5lbE1hbmFnZXI6IHN0YXJ0S2VybmVsRm9yOicsIGxhbmd1YWdlKTtcblxuICAgIGNvbnN0IHByb2plY3RQYXRoID0gcGF0aC5kaXJuYW1lKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKSxcbiAgICApO1xuICAgIGNvbnN0IHNwYXduT3B0aW9ucyA9IHsgY3dkOiBwcm9qZWN0UGF0aCB9O1xuICAgIGxhdW5jaFNwZWMoa2VybmVsU3BlYywgc3Bhd25PcHRpb25zKVxuICAgIC50aGVuKCh7IGNvbmZpZywgY29ubmVjdGlvbkZpbGUsIHNwYXduIH0pID0+IHtcbiAgICAgIGNvbnN0IGtlcm5lbCA9IG5ldyBaTVFLZXJuZWwoXG4gICAgICAgIGtlcm5lbFNwZWMsIGdyYW1tYXIsXG4gICAgICAgIGNvbmZpZywgY29ubmVjdGlvbkZpbGUsXG4gICAgICAgIHNwYXduLFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2V0UnVubmluZ0tlcm5lbEZvcihncmFtbWFyLCBrZXJuZWwpO1xuXG4gICAgICB0aGlzLl9leGVjdXRlU3RhcnR1cENvZGUoa2VybmVsKTtcblxuICAgICAgaWYgKG9uU3RhcnRlZCkgb25TdGFydGVkKGtlcm5lbCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIF9leGVjdXRlU3RhcnR1cENvZGUoa2VybmVsKSB7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBrZXJuZWwua2VybmVsU3BlYy5kaXNwbGF5X25hbWU7XG4gICAgbGV0IHN0YXJ0dXBDb2RlID0gQ29uZmlnLmdldEpzb24oJ3N0YXJ0dXBDb2RlJylbZGlzcGxheU5hbWVdO1xuICAgIGlmIChzdGFydHVwQ29kZSkge1xuICAgICAgbG9nKCdLZXJuZWxNYW5hZ2VyOiBFeGVjdXRpbmcgc3RhcnR1cCBjb2RlOicsIHN0YXJ0dXBDb2RlKTtcbiAgICAgIHN0YXJ0dXBDb2RlID0gYCR7c3RhcnR1cENvZGV9IFxcbmA7XG4gICAgICBrZXJuZWwuZXhlY3V0ZShzdGFydHVwQ29kZSk7XG4gICAgfVxuICB9XG5cblxuICBnZXRBbGxSdW5uaW5nS2VybmVscygpIHtcbiAgICByZXR1cm4gXy5jbG9uZSh0aGlzLl9ydW5uaW5nS2VybmVscyk7XG4gIH1cblxuXG4gIGdldFJ1bm5pbmdLZXJuZWxGb3IobGFuZ3VhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fcnVubmluZ0tlcm5lbHNbbGFuZ3VhZ2VdO1xuICB9XG5cblxuICBnZXRMYW5ndWFnZUZvcihncmFtbWFyKSB7XG4gICAgcmV0dXJuIChncmFtbWFyKSA/IGdyYW1tYXIubmFtZS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgfVxuXG5cbiAgZ2V0QWxsS2VybmVsU3BlY3MoY2FsbGJhY2spIHtcbiAgICBpZiAoXy5pc0VtcHR5KHRoaXMuX2tlcm5lbFNwZWNzKSkge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlS2VybmVsU3BlY3MoKCkgPT4gY2FsbGJhY2soXy5tYXAodGhpcy5fa2VybmVsU3BlY3MsICdzcGVjJykpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGxiYWNrKF8ubWFwKHRoaXMuX2tlcm5lbFNwZWNzLCAnc3BlYycpKTtcbiAgfVxuXG5cbiAgZ2V0QWxsS2VybmVsU3BlY3NGb3IobGFuZ3VhZ2UsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGxhbmd1YWdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBbGxLZXJuZWxTcGVjcygoa2VybmVsU3BlY3MpID0+IHtcbiAgICAgICAgY29uc3Qgc3BlY3MgPSBrZXJuZWxTcGVjcy5maWx0ZXIoc3BlYyA9PiB0aGlzLmtlcm5lbFNwZWNQcm92aWRlc0xhbmd1YWdlKHNwZWMsIGxhbmd1YWdlKSk7XG5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHNwZWNzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbGJhY2soW10pO1xuICB9XG5cblxuICBnZXRLZXJuZWxTcGVjRm9yKGxhbmd1YWdlLCBjYWxsYmFjaykge1xuICAgIGlmICghbGFuZ3VhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmdldEFsbEtlcm5lbFNwZWNzRm9yKGxhbmd1YWdlLCAoa2VybmVsU3BlY3MpID0+IHtcbiAgICAgIGlmIChrZXJuZWxTcGVjcy5sZW5ndGggPD0gMSkge1xuICAgICAgICBjYWxsYmFjayhrZXJuZWxTcGVjc1swXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmtlcm5lbFBpY2tlcikge1xuICAgICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIob25VcGRhdGVkID0+IG9uVXBkYXRlZChrZXJuZWxTcGVjcykpO1xuICAgICAgICB0aGlzLmtlcm5lbFBpY2tlci5vbkNvbmZpcm1lZCA9ICh7IGtlcm5lbFNwZWMgfSkgPT4gY2FsbGJhY2soa2VybmVsU3BlYyk7XG4gICAgICB9XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAga2VybmVsU3BlY1Byb3ZpZGVzTGFuZ3VhZ2Uoa2VybmVsU3BlYywgbGFuZ3VhZ2UpIHtcbiAgICBjb25zdCBrZXJuZWxMYW5ndWFnZSA9IGtlcm5lbFNwZWMubGFuZ3VhZ2U7XG4gICAgY29uc3QgbWFwcGVkTGFuZ3VhZ2UgPSBDb25maWcuZ2V0SnNvbignbGFuZ3VhZ2VNYXBwaW5ncycpW2tlcm5lbExhbmd1YWdlXTtcblxuICAgIGlmIChtYXBwZWRMYW5ndWFnZSkge1xuICAgICAgcmV0dXJuIG1hcHBlZExhbmd1YWdlID09PSBsYW5ndWFnZTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2VybmVsTGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSA9PT0gbGFuZ3VhZ2U7XG4gIH1cblxuXG4gIGdldEtlcm5lbFNwZWNzRnJvbVNldHRpbmdzKCkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gQ29uZmlnLmdldEpzb24oJ2tlcm5lbHNwZWMnKTtcblxuICAgIGlmICghc2V0dGluZ3Mua2VybmVsc3BlY3MpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgaW52YWxpZCBlbnRyaWVzXG4gICAgcmV0dXJuIF8ucGlja0J5KHNldHRpbmdzLmtlcm5lbHNwZWNzLCAoeyBzcGVjIH0pID0+XG4gICAgICBzcGVjICYmIHNwZWMubGFuZ3VhZ2UgJiYgc3BlYy5kaXNwbGF5X25hbWUgJiYgc3BlYy5hcmd2KTtcbiAgfVxuXG5cbiAgbWVyZ2VLZXJuZWxTcGVjcyhrZXJuZWxTcGVjcykge1xuICAgIF8uYXNzaWduKHRoaXMuX2tlcm5lbFNwZWNzLCBrZXJuZWxTcGVjcyk7XG4gIH1cblxuXG4gIHVwZGF0ZUtlcm5lbFNwZWNzKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fa2VybmVsU3BlY3MgPSB0aGlzLmdldEtlcm5lbFNwZWNzRnJvbVNldHRpbmdzO1xuICAgIHRoaXMuZ2V0S2VybmVsU3BlY3NGcm9tSnVweXRlcigoZXJyLCBrZXJuZWxTcGVjc0Zyb21KdXB5dGVyKSA9PiB7XG4gICAgICBpZiAoIWVycikge1xuICAgICAgICB0aGlzLm1lcmdlS2VybmVsU3BlY3Moa2VybmVsU3BlY3NGcm9tSnVweXRlcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChfLmlzRW1wdHkodGhpcy5fa2VybmVsU3BlY3MpKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnTm8ga2VybmVsIHNwZWNzIGZvdW5kJztcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZSBrZXJuZWxTcGVjIG9wdGlvbiBpbiBIeWRyb2dlbiBvciB1cGRhdGUgSVB5dGhvbi9KdXB5dGVyIHRvIGEgdmVyc2lvbiB0aGF0IHN1cHBvcnRzOiBganVweXRlciBrZXJuZWxzcGVjIGxpc3QgLS1qc29uYCBvciBgaXB5dGhvbiBrZXJuZWxzcGVjIGxpc3QgLS1qc29uYCcsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIH07XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyciA9IG51bGw7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnSHlkcm9nZW4gS2VybmVscyB1cGRhdGVkOic7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgZGV0YWlsOlxuICAgICAgICAgICAgKF8ubWFwKHRoaXMuX2tlcm5lbFNwZWNzLCAnc3BlYy5kaXNwbGF5X25hbWUnKSkuam9pbignXFxuJyksXG4gICAgICAgIH07XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGVyciwgdGhpcy5fa2VybmVsU3BlY3MpO1xuICAgIH0pO1xuICB9XG5cblxuICBnZXRLZXJuZWxTcGVjc0Zyb21KdXB5dGVyKGNhbGxiYWNrKSB7XG4gICAgY29uc3QganVweXRlciA9ICdqdXB5dGVyIGtlcm5lbHNwZWMgbGlzdCAtLWpzb24gLS1sb2ctbGV2ZWw9Q1JJVElDQUwnO1xuICAgIGNvbnN0IGlweXRob24gPSAnaXB5dGhvbiBrZXJuZWxzcGVjIGxpc3QgLS1qc29uIC0tbG9nLWxldmVsPUNSSVRJQ0FMJztcblxuICAgIHJldHVybiB0aGlzLmdldEtlcm5lbFNwZWNzRnJvbShqdXB5dGVyLCAoanVweXRlckVycm9yLCBrZXJuZWxTcGVjcykgPT4ge1xuICAgICAgaWYgKCFqdXB5dGVyRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGp1cHl0ZXJFcnJvciwga2VybmVsU3BlY3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRLZXJuZWxTcGVjc0Zyb20oaXB5dGhvbiwgKGlweXRob25FcnJvciwgc3BlY3MpID0+IHtcbiAgICAgICAgaWYgKCFpcHl0aG9uRXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soaXB5dGhvbkVycm9yLCBzcGVjcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGp1cHl0ZXJFcnJvciwgc3BlY3MpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIGdldEtlcm5lbFNwZWNzRnJvbShjb21tYW5kLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGtpbGxTaWduYWw6ICdTSUdJTlQnIH07XG4gICAgbGV0IGtlcm5lbFNwZWNzO1xuICAgIHJldHVybiBleGVjKGNvbW1hbmQsIG9wdGlvbnMsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBrZXJuZWxTcGVjcyA9IEpTT04ucGFyc2Uoc3Rkb3V0KS5rZXJuZWxzcGVjcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBlcnIgPSBlcnJvcjtcbiAgICAgICAgICBsb2coJ0NvdWxkIG5vdCBwYXJzZSBrZXJuZWxzcGVjczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIGtlcm5lbFNwZWNzKTtcbiAgICB9KTtcbiAgfVxufVxuIl19