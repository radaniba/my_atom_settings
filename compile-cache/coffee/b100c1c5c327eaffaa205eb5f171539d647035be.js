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
