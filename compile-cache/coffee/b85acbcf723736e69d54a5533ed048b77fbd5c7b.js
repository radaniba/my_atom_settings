(function() {
  var Color, ColorBuffer, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Color = _ref[0], ColorMarker = _ref[1], VariablesCollection = _ref[2], Emitter = _ref[3], CompositeDisposable = _ref[4], Task = _ref[5], Range = _ref[6], fs = _ref[7];

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, saveSubscription, tokenized, _ref1;
      if (params == null) {
        params = {};
      }
      if (Emitter == null) {
        _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Task = _ref1.Task, Range = _ref1.Range;
      }
      this.editor = params.editor, this.project = params.project, colorMarkers = params.colorMarkers;
      this.id = this.editor.id;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.ignoredScopes = [];
      this.colorMarkersByMarkerId = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      tokenized = (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.getColorMarkers()) != null ? _ref2.forEach(function(marker) {
            return marker.checkMarkerScope(true);
          }) : void 0;
        };
      })(this);
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize(tokenized));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize(tokenized));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.initialized && _this.variableInitialized) {
            _this.terminateRunningTask();
          }
          if (_this.timeout != null) {
            return clearTimeout(_this.timeout);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          if (_this.delayBeforeScan === 0) {
            return _this.update();
          } else {
            if (_this.timeout != null) {
              clearTimeout(_this.timeout);
            }
            return _this.timeout = setTimeout(function() {
              _this.update();
              return _this.timeout = null;
            }, _this.delayBeforeScan);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangePath((function(_this) {
        return function(path) {
          if (_this.isVariablesSource()) {
            _this.project.appendPath(path);
          }
          return _this.update();
        };
      })(this)));
      if ((this.project.getPaths() != null) && this.isVariablesSource() && !this.project.hasPath(this.editor.getPath())) {
        if (fs == null) {
          fs = require('fs');
        }
        if (fs.existsSync(this.editor.getPath())) {
          this.project.appendPath(this.editor.getPath());
        } else {
          saveSubscription = this.editor.onDidSave((function(_this) {
            return function(_arg) {
              var path;
              path = _arg.path;
              _this.project.appendPath(path);
              _this.update();
              saveSubscription.dispose();
              return _this.subscriptions.remove(saveSubscription);
            };
          })(this));
          this.subscriptions.add(saveSubscription);
        }
      }
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (!_this.variableInitialized) {
            return;
          }
          return _this.scanBufferForColors().then(function(results) {
            return _this.updateColorMarkers(results);
          });
        };
      })(this)));
      this.subscriptions.add(this.project.onDidChangeIgnoredScopes((function(_this) {
        return function() {
          return _this.updateIgnoredScopes();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.delayBeforeScan', (function(_this) {
        return function(delayBeforeScan) {
          _this.delayBeforeScan = delayBeforeScan != null ? delayBeforeScan : 0;
        };
      })(this)));
      if (this.editor.addMarkerLayer != null) {
        this.markerLayer = this.editor.addMarkerLayer();
      } else {
        this.markerLayer = this.editor;
      }
      if (colorMarkers != null) {
        this.restoreMarkersState(colorMarkers);
        this.cleanUnusedTextEditorMarkers();
      }
      this.updateIgnoredScopes();
      this.initialize();
    }

    ColorBuffer.prototype.onDidUpdateColorMarkers = function(callback) {
      return this.emitter.on('did-update-color-markers', callback);
    };

    ColorBuffer.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorBuffer.prototype.initialize = function() {
      if (this.colorMarkers != null) {
        return Promise.resolve();
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      this.updateVariableRanges();
      this.initializePromise = this.scanBufferForColors().then((function(_this) {
        return function(results) {
          return _this.createColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function(results) {
          _this.colorMarkers = results;
          return _this.initialized = true;
        };
      })(this));
      this.initializePromise.then((function(_this) {
        return function() {
          return _this.variablesAvailable();
        };
      })(this));
      return this.initializePromise;
    };

    ColorBuffer.prototype.restoreMarkersState = function(colorMarkers) {
      if (Color == null) {
        Color = require('./color');
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, _ref1;
          marker = (_ref1 = _this.editor.getMarker(state.markerId)) != null ? _ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
            invalidate: 'touch'
          });
          color = new Color(state.color);
          color.variables = state.variables;
          color.invalid = state.invalid;
          return _this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
            marker: marker,
            color: color,
            text: state.text,
            colorBuffer: _this
          });
        };
      })(this));
    };

    ColorBuffer.prototype.cleanUnusedTextEditorMarkers = function() {
      return this.markerLayer.findMarkers().forEach((function(_this) {
        return function(m) {
          if (_this.colorMarkersByMarkerId[m.id] == null) {
            return m.destroy();
          }
        };
      })(this));
    };

    ColorBuffer.prototype.variablesAvailable = function() {
      if (this.variablesPromise != null) {
        return this.variablesPromise;
      }
      return this.variablesPromise = this.project.initialize().then((function(_this) {
        return function(results) {
          if (_this.destroyed) {
            return;
          }
          if (results == null) {
            return;
          }
          if (_this.isIgnored() && _this.isVariablesSource()) {
            return _this.scanBufferForVariables();
          }
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.variableInitialized = true;
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.update = function() {
      var promise;
      this.terminateRunningTask();
      promise = this.isIgnored() ? this.scanBufferForVariables() : !this.isVariablesSource() ? Promise.resolve([]) : this.project.reloadVariablesForPath(this.editor.getPath());
      return promise.then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.terminateRunningTask = function() {
      var _ref1;
      return (_ref1 = this.task) != null ? _ref1.terminate() : void 0;
    };

    ColorBuffer.prototype.destroy = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.terminateRunningTask();
      this.subscriptions.dispose();
      if ((_ref1 = this.colorMarkers) != null) {
        _ref1.forEach(function(marker) {
          return marker.destroy();
        });
      }
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    ColorBuffer.prototype.isVariablesSource = function() {
      return this.project.isVariablesSourcePath(this.editor.getPath());
    };

    ColorBuffer.prototype.isIgnored = function() {
      var p;
      p = this.editor.getPath();
      return this.project.isIgnoredPath(p) || !atom.project.contains(p);
    };

    ColorBuffer.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorBuffer.prototype.getPath = function() {
      return this.editor.getPath();
    };

    ColorBuffer.prototype.getScope = function() {
      return this.project.scopeFromFileName(this.getPath());
    };

    ColorBuffer.prototype.updateIgnoredScopes = function() {
      var _ref1;
      this.ignoredScopes = this.project.getIgnoredScopes().map(function(scope) {
        try {
          return new RegExp(scope);
        } catch (_error) {}
      }).filter(function(re) {
        return re != null;
      });
      if ((_ref1 = this.getColorMarkers()) != null) {
        _ref1.forEach(function(marker) {
          return marker.checkMarkerScope(true);
        });
      }
      return this.emitter.emit('did-update-color-markers', {
        created: [],
        destroyed: []
      });
    };

    ColorBuffer.prototype.updateVariableRanges = function() {
      var variablesForBuffer;
      variablesForBuffer = this.project.getVariablesForPath(this.editor.getPath());
      return variablesForBuffer.forEach((function(_this) {
        return function(variable) {
          return variable.bufferRange != null ? variable.bufferRange : variable.bufferRange = Range.fromObject([_this.editor.getBuffer().positionForCharacterIndex(variable.range[0]), _this.editor.getBuffer().positionForCharacterIndex(variable.range[1])]);
        };
      })(this));
    };

    ColorBuffer.prototype.scanBufferForVariables = function() {
      var buffer, config, editor, results, taskPath;
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (!this.editor.getPath()) {
        return Promise.resolve([]);
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-variables-handler');
      editor = this.editor;
      buffer = this.editor.getBuffer();
      config = {
        buffer: this.editor.getText(),
        registry: this.project.getVariableExpressionsRegistry().serialize(),
        scope: this.getScope()
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:variables-found', function(variables) {
            return results = results.concat(variables.map(function(variable) {
              variable.path = editor.getPath();
              variable.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
              return variable;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.getMarkerLayer = function() {
      return this.markerLayer;
    };

    ColorBuffer.prototype.getColorMarkers = function() {
      return this.colorMarkers;
    };

    ColorBuffer.prototype.getValidColorMarkers = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.getColorMarkers()) != null ? _ref2.filter(function(m) {
        var _ref3;
        return ((_ref3 = m.color) != null ? _ref3.isValid() : void 0) && !m.isIgnored();
      }) : void 0) != null ? _ref1 : [];
    };

    ColorBuffer.prototype.getColorMarkerAtBufferPosition = function(bufferPosition) {
      var marker, markers, _i, _len;
      markers = this.markerLayer.findMarkers({
        containsBufferPosition: bufferPosition
      });
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        if (this.colorMarkersByMarkerId[marker.id] != null) {
          return this.colorMarkersByMarkerId[marker.id];
        }
      }
    };

    ColorBuffer.prototype.createColorMarkers = function(results) {
      if (this.destroyed) {
        return Promise.resolve([]);
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var newResults, processResults;
          newResults = [];
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            if (_this.editor.isDestroyed()) {
              return resolve([]);
            }
            while (results.length) {
              result = results.shift();
              marker = _this.markerLayer.markBufferRange(result.bufferRange, {
                invalidate: 'touch'
              });
              newResults.push(_this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
                marker: marker,
                color: result.color,
                text: result.match,
                colorBuffer: _this
              }));
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve(newResults);
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.findExistingMarkers = function(results) {
      var newMarkers, toCreate;
      newMarkers = [];
      toCreate = [];
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var processResults;
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            while (results.length) {
              result = results.shift();
              if (marker = _this.findColorMarker(result)) {
                newMarkers.push(marker);
              } else {
                toCreate.push(result);
              }
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve({
              newMarkers: newMarkers,
              toCreate: toCreate
            });
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.updateColorMarkers = function(results) {
      var createdMarkers, newMarkers;
      newMarkers = null;
      createdMarkers = null;
      return this.findExistingMarkers(results).then((function(_this) {
        return function(_arg) {
          var markers, toCreate;
          markers = _arg.newMarkers, toCreate = _arg.toCreate;
          newMarkers = markers;
          return _this.createColorMarkers(toCreate);
        };
      })(this)).then((function(_this) {
        return function(results) {
          var toDestroy;
          createdMarkers = results;
          newMarkers = newMarkers.concat(results);
          if (_this.colorMarkers != null) {
            toDestroy = _this.colorMarkers.filter(function(marker) {
              return __indexOf.call(newMarkers, marker) < 0;
            });
            toDestroy.forEach(function(marker) {
              delete _this.colorMarkersByMarkerId[marker.id];
              return marker.destroy();
            });
          } else {
            toDestroy = [];
          }
          _this.colorMarkers = newMarkers;
          return _this.emitter.emit('did-update-color-markers', {
            created: createdMarkers,
            destroyed: toDestroy
          });
        };
      })(this));
    };

    ColorBuffer.prototype.findColorMarker = function(properties) {
      var marker, _i, _len, _ref1;
      if (properties == null) {
        properties = {};
      }
      if (this.colorMarkers == null) {
        return;
      }
      _ref1 = this.colorMarkers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        if (marker != null ? marker.match(properties) : void 0) {
          return marker;
        }
      }
    };

    ColorBuffer.prototype.findColorMarkers = function(properties) {
      var markers;
      if (properties == null) {
        properties = {};
      }
      markers = this.markerLayer.findMarkers(properties);
      return markers.map((function(_this) {
        return function(marker) {
          return _this.colorMarkersByMarkerId[marker.id];
        };
      })(this)).filter(function(marker) {
        return marker != null;
      });
    };

    ColorBuffer.prototype.findValidColorMarkers = function(properties) {
      return this.findColorMarkers(properties).filter((function(_this) {
        return function(marker) {
          var _ref1;
          return (marker != null) && ((_ref1 = marker.color) != null ? _ref1.isValid() : void 0) && !(marker != null ? marker.isIgnored() : void 0);
        };
      })(this));
    };

    ColorBuffer.prototype.selectColorMarkerAndOpenPicker = function(colorMarker) {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.editor.setSelectedBufferRange(colorMarker.marker.getBufferRange());
      if (!((_ref1 = this.editor.getSelectedText()) != null ? _ref1.match(/^#[0-9a-fA-F]{3,8}$/) : void 0)) {
        return;
      }
      if (this.project.colorPickerAPI != null) {
        return this.project.colorPickerAPI.open(this.editor, this.editor.getLastCursor());
      }
    };

    ColorBuffer.prototype.scanBufferForColors = function(options) {
      var buffer, collection, config, registry, results, taskPath, variables, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (options == null) {
        options = {};
      }
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (Color == null) {
        Color = require('./color');
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
        if (VariablesCollection == null) {
          VariablesCollection = require('./variables-collection');
        }
        collection = new VariablesCollection();
        collection.addMany(options.variables);
        options.variables = collection;
      }
      variables = this.isVariablesSource() ? ((_ref2 = (_ref3 = options.variables) != null ? _ref3.getVariables() : void 0) != null ? _ref2 : []).concat((_ref1 = this.project.getVariables()) != null ? _ref1 : []) : (_ref4 = (_ref5 = options.variables) != null ? _ref5.getVariables() : void 0) != null ? _ref4 : [];
      delete registry.expressions['pigments:variables'];
      delete registry.regexpString;
      config = {
        buffer: this.editor.getText(),
        bufferPath: this.getPath(),
        scope: this.getScope(),
        variables: variables,
        colorVariables: variables.filter(function(v) {
          return v.isColor;
        }),
        registry: registry
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:colors-found', function(colors) {
            return results = results.concat(colors.map(function(res) {
              res.color = new Color(res.color);
              res.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(res.range[0]), buffer.positionForCharacterIndex(res.range[1])]);
              return res;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.serialize = function() {
      var _ref1;
      return {
        id: this.id,
        path: this.editor.getPath(),
        colorMarkers: (_ref1 = this.colorMarkers) != null ? _ref1.map(function(marker) {
          return marker.serialize();
        }) : void 0
      };
    };

    return ColorBuffer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItYnVmZmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5R0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FJSSxFQUpKLEVBQ0UsZUFERixFQUNTLHFCQURULEVBQ3NCLDZCQUR0QixFQUVFLGlCQUZGLEVBRVcsNkJBRlgsRUFFZ0MsY0FGaEMsRUFFc0MsZUFGdEMsRUFHRSxZQUhGLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQyxNQUFELEdBQUE7QUFDWCxVQUFBLGdEQUFBOztRQURZLFNBQU87T0FDbkI7QUFBQSxNQUFBLElBQU8sZUFBUDtBQUNFLFFBQUEsUUFBOEMsT0FBQSxDQUFRLE1BQVIsQ0FBOUMsRUFBQyxnQkFBQSxPQUFELEVBQVUsNEJBQUEsbUJBQVYsRUFBK0IsYUFBQSxJQUEvQixFQUFxQyxjQUFBLEtBQXJDLENBREY7T0FBQTtBQUFBLE1BR0MsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsaUJBQUEsT0FBWCxFQUFvQixzQkFBQSxZQUhwQixDQUFBO0FBQUEsTUFJQyxJQUFDLENBQUEsS0FBTSxJQUFDLENBQUEsT0FBUCxFQUpGLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BTFgsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQU5qQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsYUFBRCxHQUFlLEVBUGYsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCLEVBVDFCLENBQUE7QUFBQSxNQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-buffer.coffee
