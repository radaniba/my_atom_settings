(function() {
  var Color, ColorBuffer, ColorExpression, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, scopeFromFileName, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Task = _ref.Task, Range = _ref.Range;

  Color = require('./color');

  ColorMarker = require('./color-marker');

  ColorExpression = require('./color-expression');

  VariablesCollection = require('./variables-collection');

  scopeFromFileName = require('./scope-from-file-name');

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, saveSubscription, tokenized;
      if (params == null) {
        params = {};
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
          var _ref1;
          return (_ref1 = _this.getColorMarkers()) != null ? _ref1.forEach(function(marker) {
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
        this.editor.findMarkers({
          type: 'pigments-color'
        }).forEach(function(m) {
          return m.destroy();
        });
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
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, _ref1;
          marker = (_ref1 = _this.editor.getMarker(state.markerId)) != null ? _ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
            type: 'pigments-color',
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
      return this.markerLayer.findMarkers({
        type: 'pigments-color'
      }).forEach((function(_this) {
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
        scope: scopeFromFileName(this.editor.getPath())
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
        type: 'pigments-color',
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
                type: 'pigments-color',
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
      properties.type = 'pigments-color';
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
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItYnVmZmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLE9BQThDLE9BQUEsQ0FBUSxNQUFSLENBQTlDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsRUFBK0IsWUFBQSxJQUEvQixFQUFxQyxhQUFBLEtBRHJDLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQUpsQixDQUFBOztBQUFBLEVBS0EsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBTHRCLENBQUE7O0FBQUEsRUFNQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FOcEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHFCQUFDLE1BQUQsR0FBQTtBQUNYLFVBQUEseUNBQUE7O1FBRFksU0FBTztPQUNuQjtBQUFBLE1BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsaUJBQUEsT0FBWCxFQUFvQixzQkFBQSxZQUFwQixDQUFBO0FBQUEsTUFDQyxJQUFDLENBQUEsS0FBTSxJQUFDLENBQUEsT0FBUCxFQURGLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRlgsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-buffer.coffee
