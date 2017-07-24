(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, scopeFromFileName, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], ColorBuffer = _ref[0], ColorSearch = _ref[1], Palette = _ref[2], ColorMarkerElement = _ref[3], VariablesCollection = _ref[4], PathsLoader = _ref[5], PathsScanner = _ref[6], Emitter = _ref[7], CompositeDisposable = _ref[8], Range = _ref[9], SERIALIZE_VERSION = _ref[10], SERIALIZE_MARKERS_VERSION = _ref[11], THEME_VARIABLES = _ref[12], ATOM_VARIABLES = _ref[13], scopeFromFileName = _ref[14], minimatch = _ref[15];

  compareArray = function(a, b) {
    var i, v, _i, _len;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      markersVersion = SERIALIZE_MARKERS_VERSION;
      if (atom.inDevMode() && atom.project.getPaths().some(function(p) {
        return p.match(/\/pigments$/);
      })) {
        markersVersion += '-dev';
      }
      if ((state != null ? state.version : void 0) !== SERIALIZE_VERSION) {
        state = {};
      }
      if ((state != null ? state.markersVersion : void 0) !== markersVersion) {
        delete state.variables;
        delete state.buffers;
      }
      if (!compareArray(state.globalSourceNames, atom.config.get('pigments.sourceNames')) || !compareArray(state.globalIgnoredNames, atom.config.get('pigments.ignoredNames'))) {
        delete state.variables;
        delete state.buffers;
        delete state.paths;
      }
      return new ColorProject(state);
    };

    function ColorProject(state) {
      var buffers, svgColorExpression, timestamp, variables, _ref1;
      if (state == null) {
        state = {};
      }
      if (Emitter == null) {
        _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
      }
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      this.includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.colorBuffersByEditorId = {};
      this.bufferStates = buffers != null ? buffers : {};
      this.variableExpressionsRegistry = require('./variable-expressions');
      this.colorExpressionsRegistry = require('./color-expressions');
      if (variables != null) {
        this.variables = atom.deserializers.deserialize(variables);
      } else {
        this.variables = new VariablesCollection;
      }
      this.subscriptions.add(this.variables.onDidChange((function(_this) {
        return function(results) {
          return _this.emitVariablesChangeEvent(results);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sourceNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredBufferNames', (function(_this) {
        return function(ignoredBufferNames) {
          _this.ignoredBufferNames = ignoredBufferNames;
          return _this.updateColorBuffers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredScopes', (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.supportedFiletypes', (function(_this) {
        return function() {
          _this.updateIgnoredFiletypes();
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', function(type) {
        if (type != null) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sassShadeAndTintImplementation', (function(_this) {
        return function() {
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      this.subscriptions.add(atom.config.observe('pigments.filetypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = scopes != null ? scopes : [];
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(_arg) {
          var name;
          name = _arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          return _this.variables.evaluateVariables(_this.variables.getVariables(), function() {
            var colorBuffer, id, _ref2, _results;
            _ref2 = _this.colorBuffersByEditorId;
            _results = [];
            for (id in _ref2) {
              colorBuffer = _ref2[id];
              _results.push(colorBuffer.update());
            }
            return _results;
          });
        };
      })(this)));
      this.subscriptions.add(this.variableExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function() {
          if (_this.paths == null) {
            return;
          }
          return _this.reloadVariablesForPaths(_this.getPaths());
        };
      })(this)));
      if (timestamp != null) {
        this.timestamp = new Date(Date.parse(timestamp));
      }
      this.updateIgnoredFiletypes();
      if (this.paths != null) {
        this.initialize();
      }
      this.initializeBuffers();
    }

    ColorProject.prototype.onDidInitialize = function(callback) {
      return this.emitter.on('did-initialize', callback);
    };

    ColorProject.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorProject.prototype.onDidUpdateVariables = function(callback) {
      return this.emitter.on('did-update-variables', callback);
    };

    ColorProject.prototype.onDidCreateColorBuffer = function(callback) {
      return this.emitter.on('did-create-color-buffer', callback);
    };

    ColorProject.prototype.onDidChangeIgnoredScopes = function(callback) {
      return this.emitter.on('did-change-ignored-scopes', callback);
    };

    ColorProject.prototype.onDidChangePaths = function(callback) {
      return this.emitter.on('did-change-paths', callback);
    };

    ColorProject.prototype.observeColorBuffers = function(callback) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        callback(colorBuffer);
      }
      return this.onDidCreateColorBuffer(callback);
    };

    ColorProject.prototype.isInitialized = function() {
      return this.initialized;
    };

    ColorProject.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorProject.prototype.initialize = function() {
      if (this.isInitialized()) {
        return Promise.resolve(this.variables.getVariables());
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      return this.initializePromise = new Promise((function(_this) {
        return function(resolve) {
          return _this.variables.onceInitialized(resolve);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (_this.includeThemes) {
            return _this.includeThemesVariables();
          }
        };
      })(this)).then((function(_this) {
        return function() {
          var variables;
          _this.initialized = true;
          variables = _this.variables.getVariables();
          _this.emitter.emit('did-initialize', variables);
          return variables;
        };
      })(this));
    };

    ColorProject.prototype.destroy = function() {
      var buffer, id, _ref1;
      if (this.destroyed) {
        return;
      }
      if (PathsScanner == null) {
        PathsScanner = require('./paths-scanner');
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        buffer.destroy();
      }
      this.colorBuffersByEditorId = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ColorProject.prototype.reload = function() {
      return this.initialize().then((function(_this) {
        return function() {
          _this.variables.reset();
          _this.paths = [];
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (atom.config.get('pigments.notifyReloads')) {
            return atom.notifications.addSuccess("Pigments successfully reloaded", {
              dismissable: atom.config.get('pigments.dismissableReloadNotifications'),
              description: "Found:\n- **" + _this.paths.length + "** path(s)\n- **" + (_this.getVariables().length) + "** variables(s) including **" + (_this.getColorVariables().length) + "** color(s)"
            });
          } else {
            return console.log("Found:\n- " + _this.paths.length + " path(s)\n- " + (_this.getVariables().length) + " variables(s) including " + (_this.getColorVariables().length) + " color(s)");
          }
        };
      })(this))["catch"](function(reason) {
        var detail, stack;
        detail = reason.message;
        stack = reason.stack;
        atom.notifications.addError("Pigments couldn't be reloaded", {
          detail: detail,
          stack: stack,
          dismissable: true
        });
        return console.error(reason);
      });
    };

    ColorProject.prototype.loadPathsAndVariables = function() {
      var destroyed;
      destroyed = null;
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, path, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return __indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
              path = dirtied[_i];
              if (__indexOf.call(_this.paths, path) < 0) {
                _this.paths.push(path);
              }
            }
            if (_this.variables.length) {
              return dirtied;
            } else {
              return _this.paths;
            }
          } else if (_this.paths == null) {
            return _this.paths = dirtied;
          } else if (!_this.variables.length) {
            return _this.paths;
          } else {
            return [];
          }
        };
      })(this)).then((function(_this) {
        return function(paths) {
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          if (results != null) {
            return _this.variables.updateCollection(results);
          }
        };
      })(this));
    };

    ColorProject.prototype.findAllColors = function() {
      var patterns;
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
        project: this,
        ignoredNames: this.getIgnoredNames(),
        context: this.getContext()
      });
    };

    ColorProject.prototype.setColorPickerAPI = function(colorPickerAPI) {
      this.colorPickerAPI = colorPickerAPI;
    };

    ColorProject.prototype.initializeBuffers = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var buffer, bufferElement, editorPath;
          editorPath = editor.getPath();
          if ((editorPath == null) || _this.isBufferIgnored(editorPath)) {
            return;
          }
          buffer = _this.colorBufferForEditor(editor);
          if (buffer != null) {
            bufferElement = atom.views.getView(buffer);
            return bufferElement.attach();
          }
        };
      })(this)));
    };

    ColorProject.prototype.hasColorBufferForEditor = function(editor) {
      if (this.destroyed || (editor == null)) {
        return false;
      }
      return this.colorBuffersByEditorId[editor.id] != null;
    };

    ColorProject.prototype.colorBufferForEditor = function(editor) {
      var buffer, state, subscription;
      if (this.destroyed) {
        return;
      }
      if (editor == null) {
        return;
      }
      if (ColorBuffer == null) {
        ColorBuffer = require('./color-buffer');
      }
      if (this.colorBuffersByEditorId[editor.id] != null) {
        return this.colorBuffersByEditorId[editor.id];
      }
      if (this.bufferStates[editor.id] != null) {
        state = this.bufferStates[editor.id];
        state.editor = editor;
        state.project = this;
        delete this.bufferStates[editor.id];
      } else {
        state = {
          editor: editor,
          project: this
        };
      }
      this.colorBuffersByEditorId[editor.id] = buffer = new ColorBuffer(state);
      this.subscriptions.add(subscription = buffer.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.remove(subscription);
          subscription.dispose();
          return delete _this.colorBuffersByEditorId[editor.id];
        };
      })(this)));
      this.emitter.emit('did-create-color-buffer', buffer);
      return buffer;
    };

    ColorProject.prototype.colorBufferForPath = function(path) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, _i, _len, _ref1, _ref2, _results;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          _ref2 = atom.workspace.getTextEditors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            editor = _ref2[_i];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              _results.push(bufferElement.attach());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } catch (_error) {
        e = _error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var source, sources, _i, _len, _ref1;
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = (_ref1 = this.ignoredBufferNames) != null ? _ref1 : [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
      return false;
    };

    ColorProject.prototype.getPaths = function() {
      var _ref1;
      return (_ref1 = this.paths) != null ? _ref1.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var _ref1;
      return __indexOf.call((_ref1 = this.paths) != null ? _ref1 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      if (PathsLoader == null) {
        PathsLoader = require('./paths-loader');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, rootPaths, _ref1;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (_ref1 = _this.paths) != null ? _ref1 : [];
          config = {
            knownPaths: knownPaths,
            timestamp: _this.timestamp,
            ignoredNames: _this.getIgnoredNames(),
            paths: rootPaths,
            traverseIntoSymlinkDirectories: atom.config.get('pigments.traverseIntoSymlinkDirectories'),
            sourceNames: _this.getSourceNames(),
            ignoreVcsIgnores: atom.config.get('pigments.ignoreVcsIgnoredPaths')
          };
          return PathsLoader.startTask(config, function(results) {
            var isDescendentOfRootPaths, p, _i, _len;
            for (_i = 0, _len = knownPaths.length; _i < _len; _i++) {
              p = knownPaths[_i];
              isDescendentOfRootPaths = rootPaths.some(function(root) {
                return p.indexOf(root) === 0;
              });
              if (!isDescendentOfRootPaths) {
                if (results.removed == null) {
                  results.removed = [];
                }
                results.removed.push(p);
              }
            }
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.updatePaths = function() {
      if (!this.initialized) {
        return Promise.resolve();
      }
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, p, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return __indexOf.call(removed, p) < 0;
          });
          for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
            p = dirtied[_i];
            if (__indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var source, sources, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (minimatch(path, ignore, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.getSassScopeSuffix()].join(':');
      }
      return scope;
    };

    ColorProject.prototype.getPalette = function() {
      if (Palette == null) {
        Palette = require('./palette');
      }
      if (!this.isInitialized()) {
        return new Palette;
      }
      return new Palette(this.getColorVariables());
    };

    ColorProject.prototype.getContext = function() {
      return this.variables.getContext();
    };

    ColorProject.prototype.getVariables = function() {
      return this.variables.getVariables();
    };

    ColorProject.prototype.getVariableExpressionsRegistry = function() {
      return this.variableExpressionsRegistry;
    };

    ColorProject.prototype.getVariableById = function(id) {
      return this.variables.getVariableById(id);
    };

    ColorProject.prototype.getVariableByName = function(name) {
      return this.variables.getVariableByName(name);
    };

    ColorProject.prototype.getColorVariables = function() {
      return this.variables.getColorVariables();
    };

    ColorProject.prototype.getColorExpressionsRegistry = function() {
      return this.colorExpressionsRegistry;
    };

    ColorProject.prototype.showVariableInFile = function(variable) {
      return atom.workspace.open(variable.path).then(function(editor) {
        var buffer, bufferRange, _ref1;
        if (Range == null) {
          _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
        }
        buffer = editor.getBuffer();
        bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
        return editor.setSelectedBufferRange(bufferRange, {
          autoscroll: true
        });
      });
    };

    ColorProject.prototype.emitVariablesChangeEvent = function(results) {
      return this.emitter.emit('did-update-variables', results);
    };

    ColorProject.prototype.loadVariablesForPath = function(path) {
      return this.loadVariablesForPaths([path]);
    };

    ColorProject.prototype.loadVariablesForPaths = function(paths) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.scanPathsForVariables(paths, function(results) {
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.getVariablesForPath = function(path) {
      return this.variables.getVariablesForPath(path);
    };

    ColorProject.prototype.getVariablesForPaths = function(paths) {
      return this.variables.getVariablesForPaths(paths);
    };

    ColorProject.prototype.deleteVariablesForPath = function(path) {
      return this.deleteVariablesForPaths([path]);
    };

    ColorProject.prototype.deleteVariablesForPaths = function(paths) {
      return this.variables.deleteVariablesForPaths(paths);
    };

    ColorProject.prototype.reloadVariablesForPath = function(path) {
      return this.reloadVariablesForPaths([path]);
    };

    ColorProject.prototype.reloadVariablesForPaths = function(paths) {
      var promise;
      promise = Promise.resolve();
      if (!this.isInitialized()) {
        promise = this.initialize();
      }
      return promise.then((function(_this) {
        return function() {
          if (paths.some(function(path) {
            return __indexOf.call(_this.paths, path) < 0;
          })) {
            return Promise.resolve([]);
          }
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.variables.updateCollection(results, paths);
        };
      })(this));
    };

    ColorProject.prototype.scanPathsForVariables = function(paths, callback) {
      var colorBuffer;
      if (paths.length === 1 && (colorBuffer = this.colorBufferForPath(paths[0]))) {
        return colorBuffer.scanBufferForVariables().then(function(results) {
          return callback(results);
        });
      } else {
        if (PathsScanner == null) {
          PathsScanner = require('./paths-scanner');
        }
        return PathsScanner.startTask(paths.map((function(_this) {
          return function(p) {
            return [p, _this.scopeFromFileName(p)];
          };
        })(this)), this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      if (ATOM_VARIABLES == null) {
        ATOM_VARIABLES = require('./atom-variables');
      }
      iterator = 0;
      variables = [];
      html = '';
      ATOM_VARIABLES.forEach(function(v) {
        return html += "<div class='" + v + "'>" + v + "</div>";
      });
      div = document.createElement('div');
      div.className = 'pigments-sampler';
      div.innerHTML = html;
      document.body.appendChild(div);
      ATOM_VARIABLES.forEach(function(v, i) {
        var color, end, node, variable;
        node = div.children[i];
        color = getComputedStyle(node).color;
        end = iterator + v.length + color.length + 4;
        variable = {
          name: "@" + v,
          line: i,
          value: color,
          range: [iterator, end],
          path: THEME_VARIABLES
        };
        iterator = end;
        return variables.push(variable);
      });
      document.body.removeChild(div);
      return variables;
    };

    ColorProject.prototype.getRootPaths = function() {
      return atom.project.getPaths();
    };

    ColorProject.prototype.getSassScopeSuffix = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.sassShadeAndTintImplementation) != null ? _ref2 : atom.config.get('pigments.sassShadeAndTintImplementation')) != null ? _ref1 : 'compass';
    };

    ColorProject.prototype.setSassShadeAndTintImplementation = function(sassShadeAndTintImplementation) {
      this.sassShadeAndTintImplementation = sassShadeAndTintImplementation;
      return this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
        registry: this.colorExpressionsRegistry
      });
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, _ref1, _ref2;
      names = ['.pigments'];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((_ref2 = atom.config.get('pigments.sourceNames')) != null ? _ref2 : []);
      }
      return names;
    };

    ColorProject.prototype.setSourceNames = function(sourceNames) {
      this.sourceNames = sourceNames != null ? sourceNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return;
      }
      return this.initialize().then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalSourceNames = function(ignoreGlobalSourceNames) {
      this.ignoreGlobalSourceNames = ignoreGlobalSourceNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getSearchNames = function() {
      var names, _ref1, _ref2, _ref3, _ref4;
      names = [];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      names = names.concat((_ref2 = this.searchNames) != null ? _ref2 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((_ref3 = atom.config.get('pigments.sourceNames')) != null ? _ref3 : []);
        names = names.concat((_ref4 = atom.config.get('pigments.extendedSearchNames')) != null ? _ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.setSearchNames = function(searchNames) {
      this.searchNames = searchNames != null ? searchNames : [];
    };

    ColorProject.prototype.setIgnoreGlobalSearchNames = function(ignoreGlobalSearchNames) {
      this.ignoreGlobalSearchNames = ignoreGlobalSearchNames;
    };

    ColorProject.prototype.getIgnoredNames = function() {
      var names, _ref1, _ref2, _ref3;
      names = (_ref1 = this.ignoredNames) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((_ref2 = this.getGlobalIgnoredNames()) != null ? _ref2 : []);
        names = names.concat((_ref3 = atom.config.get('core.ignoredNames')) != null ? _ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var _ref1;
      return (_ref1 = atom.config.get('pigments.ignoredNames')) != null ? _ref1.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames) {
      this.ignoredNames = ignoredNames != null ? ignoredNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return Promise.reject('Project is not initialized yet');
      }
      return this.initialize().then((function(_this) {
        return function() {
          var dirtied;
          dirtied = _this.paths.filter(function(p) {
            return _this.isIgnoredPath(p);
          });
          _this.deleteVariablesForPaths(dirtied);
          _this.paths = _this.paths.filter(function(p) {
            return !_this.isIgnoredPath(p);
          });
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredNames = function(ignoreGlobalIgnoredNames) {
      this.ignoreGlobalIgnoredNames = ignoreGlobalIgnoredNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getIgnoredScopes = function() {
      var scopes, _ref1, _ref2;
      scopes = (_ref1 = this.ignoredScopes) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((_ref2 = atom.config.get('pigments.ignoredScopes')) != null ? _ref2 : []);
      }
      scopes = scopes.concat(this.ignoredFiletypes);
      return scopes;
    };

    ColorProject.prototype.setIgnoredScopes = function(ignoredScopes) {
      this.ignoredScopes = ignoredScopes != null ? ignoredScopes : [];
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredScopes = function(ignoreGlobalIgnoredScopes) {
      this.ignoreGlobalIgnoredScopes = ignoreGlobalIgnoredScopes;
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setSupportedFiletypes = function(supportedFiletypes) {
      this.supportedFiletypes = supportedFiletypes != null ? supportedFiletypes : [];
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.updateIgnoredFiletypes = function() {
      return this.ignoredFiletypes = this.getIgnoredFiletypes();
    };

    ColorProject.prototype.getIgnoredFiletypes = function() {
      var filetypes, scopes, _ref1, _ref2;
      filetypes = (_ref1 = this.supportedFiletypes) != null ? _ref1 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((_ref2 = atom.config.get('pigments.supportedFiletypes')) != null ? _ref2 : []);
      }
      if (filetypes.length === 0) {
        filetypes = ['*'];
      }
      if (filetypes.some(function(type) {
        return type === '*';
      })) {
        return [];
      }
      scopes = filetypes.map(function(ext) {
        var _ref3;
        return (_ref3 = atom.grammars.selectGrammar("file." + ext)) != null ? _ref3.scopeName.replace(/\./g, '\\.') : void 0;
      }).filter(function(scope) {
        return scope != null;
      });
      return ["^(?!\\.(" + (scopes.join('|')) + "))"];
    };

    ColorProject.prototype.setIgnoreGlobalSupportedFiletypes = function(ignoreGlobalSupportedFiletypes) {
      this.ignoreGlobalSupportedFiletypes = ignoreGlobalSupportedFiletypes;
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.themesIncluded = function() {
      return this.includeThemes;
    };

    ColorProject.prototype.setIncludeThemes = function(includeThemes) {
      if (includeThemes === this.includeThemes) {
        return Promise.resolve();
      }
      this.includeThemes = includeThemes;
      if (this.includeThemes) {
        return this.includeThemesVariables();
      } else {
        return this.disposeThemesVariables();
      }
    };

    ColorProject.prototype.includeThemesVariables = function() {
      this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
        return function() {
          var variables;
          if (!_this.includeThemes) {
            return;
          }
          if (THEME_VARIABLES == null) {
            THEME_VARIABLES = require('./uris').THEME_VARIABLES;
          }
          variables = _this.loadThemesVariables();
          return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
        };
      })(this));
      this.subscriptions.add(this.themesSubscription);
      return this.variables.addMany(this.loadThemesVariables());
    };

    ColorProject.prototype.disposeThemesVariables = function() {
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      this.subscriptions.remove(this.themesSubscription);
      this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
      return this.themesSubscription.dispose();
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      data = {
        deserializer: 'ColorProject',
        timestamp: this.getTimestamp(),
        version: SERIALIZE_VERSION,
        markersVersion: SERIALIZE_MARKERS_VERSION,
        globalSourceNames: atom.config.get('pigments.sourceNames'),
        globalIgnoredNames: atom.config.get('pigments.ignoredNames')
      };
      if (this.ignoreGlobalSourceNames != null) {
        data.ignoreGlobalSourceNames = this.ignoreGlobalSourceNames;
      }
      if (this.ignoreGlobalSearchNames != null) {
        data.ignoreGlobalSearchNames = this.ignoreGlobalSearchNames;
      }
      if (this.ignoreGlobalIgnoredNames != null) {
        data.ignoreGlobalIgnoredNames = this.ignoreGlobalIgnoredNames;
      }
      if (this.ignoreGlobalIgnoredScopes != null) {
        data.ignoreGlobalIgnoredScopes = this.ignoreGlobalIgnoredScopes;
      }
      if (this.includeThemes != null) {
        data.includeThemes = this.includeThemes;
      }
      if (this.ignoredScopes != null) {
        data.ignoredScopes = this.ignoredScopes;
      }
      if (this.ignoredNames != null) {
        data.ignoredNames = this.ignoredNames;
      }
      if (this.sourceNames != null) {
        data.sourceNames = this.sourceNames;
      }
      if (this.searchNames != null) {
        data.searchNames = this.searchNames;
      }
      data.buffers = this.serializeBuffers();
      if (this.isInitialized()) {
        data.paths = this.paths;
        data.variables = this.variables.serialize();
      }
      return data;
    };

    ColorProject.prototype.serializeBuffers = function() {
      var colorBuffer, id, out, _ref1;
      out = {};
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItcHJvamVjdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseVJBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BUUksRUFSSixFQUNFLHFCQURGLEVBQ2UscUJBRGYsRUFFRSxpQkFGRixFQUVXLDRCQUZYLEVBRStCLDZCQUYvQixFQUdFLHFCQUhGLEVBR2Usc0JBSGYsRUFJRSxpQkFKRixFQUlXLDZCQUpYLEVBSWdDLGVBSmhDLEVBS0UsNEJBTEYsRUFLcUIsb0NBTHJCLEVBS2dELDBCQUxoRCxFQUtpRSx5QkFMakUsRUFNRSw0QkFORixFQU9FLG9CQVBGLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO0FBQ2IsUUFBQSxjQUFBO0FBQUEsSUFBQSxJQUFvQixXQUFKLElBQWMsV0FBOUI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUFvQixDQUFDLENBQUMsTUFBRixLQUFZLENBQUMsQ0FBQyxNQUFsQztBQUFBLGFBQU8sS0FBUCxDQUFBO0tBREE7QUFFQSxTQUFBLGdEQUFBO2VBQUE7VUFBK0IsQ0FBQSxLQUFPLENBQUUsQ0FBQSxDQUFBO0FBQXhDLGVBQU8sS0FBUDtPQUFBO0FBQUEsS0FGQTtBQUdBLFdBQU8sSUFBUCxDQUphO0VBQUEsQ0FWZixDQUFBOztBQUFBLEVBZ0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFlBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7QUFDWixVQUFBLHFCQUFBO0FBQUEsTUFBQSxJQUFPLHlCQUFQO0FBQ0UsUUFBQSxRQUFpRCxPQUFBLENBQVEsWUFBUixDQUFqRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLGtDQUFBLHlCQUFwQixDQURGO09BQUE7QUFBQSxNQUdBLGNBQUEsR0FBaUIseUJBSGpCLENBQUE7QUFJQSxNQUFBLElBQTRCLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxJQUFxQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF1QixDQUFDLElBQXhCLENBQTZCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxhQUFSLEVBQVA7TUFBQSxDQUE3QixDQUFqRDtBQUFBLFFBQUEsY0FBQSxJQUFrQixNQUFsQixDQUFBO09BSkE7QUFNQSxNQUFBLHFCQUFHLEtBQUssQ0FBRSxpQkFBUCxLQUFvQixpQkFBdkI7QUFDRSxRQUFBLEtBQUEsR0FBUSxFQUFSLENBREY7T0FOQTtBQVNBLE1BQUEscUJBQUcsS0FBSyxDQUFFLHdCQUFQLEtBQTJCLGNBQTlCO0FBQ0UsUUFBQSxNQUFBLENBQUEsS0FBWSxDQUFDLFNBQWIsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFBLEtBQVksQ0FBQyxPQURiLENBREY7T0FUQTtBQWFBLE1BQUEsSUFBRyxDQUFBLFlBQUksQ0FBYSxLQUFLLENBQUMsaUJBQW5CLEVBQXNDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsQ0FBdEMsQ0FBSixJQUFzRixDQUFBLFlBQUksQ0FBYSxLQUFLLENBQUMsa0JBQW5CLEVBQXVDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsQ0FBdkMsQ0FBN0Y7QUFDRSxRQUFBLE1BQUEsQ0FBQSxLQUFZLENBQUMsU0FBYixDQUFBO0FBQUEsUUFDQSxNQUFBLENBQUEsS0FBWSxDQUFDLE9BRGIsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFBLEtBQVksQ0FBQyxLQUZiLENBREY7T0FiQTthQWtCSSxJQUFBLFlBQUEsQ0FBYSxLQUFiLEVBbkJRO0lBQUEsQ0FBZCxDQUFBOztBQXFCYSxJQUFBLHNCQUFDLEtBQUQsR0FBQTtBQUNYLFVBQUEsd0RBQUE7O1FBRFksUUFBTTtPQUNsQjtBQUFBLE1BQUEsSUFBOEQsZUFBOUQ7QUFBQSxRQUFBLFFBQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsZ0JBQUEsT0FBRCxFQUFVLDRCQUFBLG1CQUFWLEVBQStCLGNBQUEsS0FBL0IsQ0FBQTtPQUFBOztRQUNBLHNCQUF1QixPQUFBLENBQVEsd0JBQVI7T0FEdkI7QUFBQSxNQUlFLElBQUMsQ0FBQSxzQkFBQSxhQURILEVBQ2tCLElBQUMsQ0FBQSxxQkFBQSxZQURuQixFQUNpQyxJQUFDLENBQUEsb0JBQUEsV0FEbEMsRUFDK0MsSUFBQyxDQUFBLHNCQUFBLGFBRGhELEVBQytELElBQUMsQ0FBQSxjQUFBLEtBRGhFLEVBQ3VFLElBQUMsQ0FBQSxvQkFBQSxXQUR4RSxFQUNxRixJQUFDLENBQUEsZ0NBQUEsdUJBRHRGLEVBQytHLElBQUMsQ0FBQSxpQ0FBQSx3QkFEaEgsRUFDMEksSUFBQyxDQUFBLGtDQUFBLHlCQUQzSSxFQUNzSyxJQUFDLENBQUEsZ0NBQUEsdUJBRHZLLEVBQ2dNLElBQUMsQ0FBQSx1Q0FBQSw4QkFEak0sRUFDaU8sSUFBQyxDQUFBLDJCQUFBLGtCQURsTyxFQUNzUCxrQkFBQSxTQUR0UCxFQUNpUSxrQkFBQSxTQURqUSxFQUM0USxnQkFBQSxPQUo1USxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQVBYLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFSakIsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCLEVBVDFCLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxZQUFELHFCQUFnQixVQUFVLEVBVjFCLENBQUE7QUFBQSxNQVlBLElBQUMsQ0FBQSwyQkFBRCxHQUErQixPQUFBLENBQVEsd0JBQVIsQ0FaL0IsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLHdCQUFELEdBQTRCLE9BQUEsQ0FBUSxxQkFBUixDQWI1QixDQUFBO0FBZUEsTUFBQSxJQUFHLGlCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBK0IsU0FBL0IsQ0FBYixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUFBLENBQUEsbUJBQWIsQ0FIRjtPQWZBO0FBQUEsTUFvQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7aUJBQ3hDLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixPQUExQixFQUR3QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBQW5CLENBcEJBLENBQUE7QUFBQSxNQXVCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHNCQUFwQixFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUM3RCxLQUFDLENBQUEsV0FBRCxDQUFBLEVBRDZEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0FBbkIsQ0F2QkEsQ0FBQTtBQUFBLE1BMEJBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsdUJBQXBCLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzlELEtBQUMsQ0FBQSxXQUFELENBQUEsRUFEOEQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxDQUFuQixDQTFCQSxDQUFBO0FBQUEsTUE2QkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsa0JBQUYsR0FBQTtBQUNwRSxVQURxRSxLQUFDLENBQUEscUJBQUEsa0JBQ3RFLENBQUE7aUJBQUEsS0FBQyxDQUFBLGtCQUFELENBQUEsRUFEb0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQixDQTdCQSxDQUFBO0FBQUEsTUFnQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix3QkFBcEIsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDL0QsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFEK0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxDQUFuQixDQWhDQSxDQUFBO0FBQUEsTUFtQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw2QkFBcEIsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwRSxVQUFBLEtBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxLQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQUZvRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQW5CLENBbkNBLENBQUE7QUFBQSxNQXVDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHFCQUFwQixFQUEyQyxTQUFDLElBQUQsR0FBQTtBQUM1RCxRQUFBLElBQUcsWUFBSDs7WUFDRSxxQkFBc0IsT0FBQSxDQUFRLHdCQUFSO1dBQXRCO2lCQUNBLGtCQUFrQixDQUFDLGFBQW5CLENBQWlDLElBQWpDLEVBRkY7U0FENEQ7TUFBQSxDQUEzQyxDQUFuQixDQXZDQSxDQUFBO0FBQUEsTUE0Q0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixnQ0FBcEIsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDdkUsS0FBQyxDQUFBLHFCQUFELENBQUEsRUFEdUU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxDQUFuQixDQTVDQSxDQUFBO0FBQUEsTUErQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix5Q0FBcEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDaEYsS0FBQyxDQUFBLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxJQUFsQyxDQUF1Qyx3QkFBdkMsRUFBaUU7QUFBQSxZQUMvRCxRQUFBLEVBQVUsS0FBQyxDQUFBLHdCQURvRDtXQUFqRSxFQURnRjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9ELENBQW5CLENBL0NBLENBQUE7QUFBQSxNQW9EQSxrQkFBQSxHQUFxQixJQUFDLENBQUEsd0JBQXdCLENBQUMsYUFBMUIsQ0FBd0MsdUJBQXhDLENBcERyQixDQUFBO0FBQUEsTUFxREEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQ0FBcEIsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3hFLFVBQUEsa0JBQWtCLENBQUMsTUFBbkIsb0JBQTRCLFNBQVMsRUFBckMsQ0FBQTtpQkFDQSxLQUFDLENBQUEsd0JBQXdCLENBQUMsT0FBTyxDQUFDLElBQWxDLENBQXVDLHdCQUF2QyxFQUFpRTtBQUFBLFlBQy9ELElBQUEsRUFBTSxrQkFBa0IsQ0FBQyxJQURzQztBQUFBLFlBRS9ELFFBQUEsRUFBVSxLQUFDLENBQUEsd0JBRm9EO1dBQWpFLEVBRndFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FBbkIsQ0FyREEsQ0FBQTtBQUFBLE1BNERBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsd0JBQXdCLENBQUMsc0JBQTFCLENBQWlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNsRSxjQUFBLElBQUE7QUFBQSxVQURvRSxPQUFELEtBQUMsSUFDcEUsQ0FBQTtBQUFBLFVBQUEsSUFBYyxxQkFBSixJQUFlLElBQUEsS0FBUSxvQkFBakM7QUFBQSxrQkFBQSxDQUFBO1dBQUE7aUJBQ0EsS0FBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixLQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBQSxDQUE3QixFQUF3RCxTQUFBLEdBQUE7QUFDdEQsZ0JBQUEsZ0NBQUE7QUFBQTtBQUFBO2lCQUFBLFdBQUE7c0NBQUE7QUFBQSw0QkFBQSxXQUFXLENBQUMsTUFBWixDQUFBLEVBQUEsQ0FBQTtBQUFBOzRCQURzRDtVQUFBLENBQXhELEVBRmtFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakQsQ0FBbkIsQ0E1REEsQ0FBQTtBQUFBLE1BaUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsMkJBQTJCLENBQUMsc0JBQTdCLENBQW9ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckUsVUFBQSxJQUFjLG1CQUFkO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO2lCQUNBLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixLQUFDLENBQUEsUUFBRCxDQUFBLENBQXpCLEVBRnFFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEQsQ0FBbkIsQ0FqRUEsQ0FBQTtBQXFFQSxNQUFBLElBQWdELGlCQUFoRDtBQUFBLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxJQUFBLENBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQUwsQ0FBakIsQ0FBQTtPQXJFQTtBQUFBLE1BdUVBLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBdkVBLENBQUE7QUF5RUEsTUFBQSxJQUFpQixrQkFBakI7QUFBQSxRQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO09BekVBO0FBQUEsTUEwRUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0ExRUEsQ0FEVztJQUFBLENBckJiOztBQUFBLDJCQWtHQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksZ0JBQVosRUFBOEIsUUFBOUIsRUFEZTtJQUFBLENBbEdqQixDQUFBOztBQUFBLDJCQXFHQSxZQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCLEVBRFk7SUFBQSxDQXJHZCxDQUFBOztBQUFBLDJCQXdHQSxvQkFBQSxHQUFzQixTQUFDLFFBQUQsR0FBQTthQUNwQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxzQkFBWixFQUFvQyxRQUFwQyxFQURvQjtJQUFBLENBeEd0QixDQUFBOztBQUFBLDJCQTJHQSxzQkFBQSxHQUF3QixTQUFDLFFBQUQsR0FBQTthQUN0QixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx5QkFBWixFQUF1QyxRQUF2QyxFQURzQjtJQUFBLENBM0d4QixDQUFBOztBQUFBLDJCQThHQSx3QkFBQSxHQUEwQixTQUFDLFFBQUQsR0FBQTthQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSwyQkFBWixFQUF5QyxRQUF6QyxFQUR3QjtJQUFBLENBOUcxQixDQUFBOztBQUFBLDJCQWlIQSxnQkFBQSxHQUFrQixTQUFDLFFBQUQsR0FBQTthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQyxFQURnQjtJQUFBLENBakhsQixDQUFBOztBQUFBLDJCQW9IQSxtQkFBQSxHQUFxQixTQUFDLFFBQUQsR0FBQTtBQUNuQixVQUFBLHNCQUFBO0FBQUE7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFBQSxRQUFBLFFBQUEsQ0FBUyxXQUFULENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsUUFBeEIsRUFGbUI7SUFBQSxDQXBIckIsQ0FBQTs7QUFBQSwyQkF3SEEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxZQUFKO0lBQUEsQ0F4SGYsQ0FBQTs7QUFBQSwyQkEwSEEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxVQUFKO0lBQUEsQ0ExSGIsQ0FBQTs7QUFBQSwyQkE0SEEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBcUQsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFyRDtBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQUEsQ0FBaEIsQ0FBUCxDQUFBO09BQUE7QUFDQSxNQUFBLElBQTZCLDhCQUE3QjtBQUFBLGVBQU8sSUFBQyxDQUFBLGlCQUFSLENBQUE7T0FEQTthQUVBLElBQUMsQ0FBQSxpQkFBRCxHQUF5QixJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7aUJBQy9CLEtBQUMsQ0FBQSxTQUFTLENBQUMsZUFBWCxDQUEyQixPQUEzQixFQUQrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsQ0FHekIsQ0FBQyxJQUh3QixDQUduQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNKLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhtQixDQUt6QixDQUFDLElBTHdCLENBS25CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDSixVQUFBLElBQTZCLEtBQUMsQ0FBQSxhQUE5QjttQkFBQSxLQUFDLENBQUEsc0JBQUQsQ0FBQSxFQUFBO1dBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxtQixDQU96QixDQUFDLElBUHdCLENBT25CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDSixjQUFBLFNBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSxXQUFELEdBQWUsSUFBZixDQUFBO0FBQUEsVUFFQSxTQUFBLEdBQVksS0FBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQUEsQ0FGWixDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxnQkFBZCxFQUFnQyxTQUFoQyxDQUhBLENBQUE7aUJBSUEsVUFMSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUG1CLEVBSGY7SUFBQSxDQTVIWixDQUFBOztBQUFBLDJCQTZJQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxpQkFBQTtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGNBQUEsQ0FBQTtPQUFBOztRQUVBLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjtPQUZoQjtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUpiLENBQUE7QUFBQSxNQU1BLFlBQVksQ0FBQyxvQkFBYixDQUFBLENBTkEsQ0FBQTtBQVFBO0FBQUEsV0FBQSxXQUFBOzJCQUFBO0FBQUEsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQUEsQ0FBQTtBQUFBLE9BUkE7QUFBQSxNQVNBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixJQVQxQixDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQVhBLENBQUE7QUFBQSxNQVlBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBWmpCLENBQUE7QUFBQSxNQWNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsRUFBNkIsSUFBN0IsQ0FkQSxDQUFBO2FBZUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsRUFoQk87SUFBQSxDQTdJVCxDQUFBOztBQUFBLDJCQStKQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsS0FBRCxHQUFTLEVBRFQsQ0FBQTtpQkFFQSxLQUFDLENBQUEscUJBQUQsQ0FBQSxFQUhpQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLENBSUEsQ0FBQyxJQUpELENBSU0sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNKLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLENBQUg7bUJBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixnQ0FBOUIsRUFBZ0U7QUFBQSxjQUFBLFdBQUEsRUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBQWI7QUFBQSxjQUF5RSxXQUFBLEVBQWdCLGNBQUEsR0FDM0osS0FBQyxDQUFBLEtBQUssQ0FBQyxNQURvSixHQUM3SSxrQkFENkksR0FDN0gsQ0FBQyxLQUFDLENBQUEsWUFBRCxDQUFBLENBQWUsQ0FBQyxNQUFqQixDQUQ2SCxHQUU1SSw4QkFGNEksR0FFL0csQ0FBQyxLQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFvQixDQUFDLE1BQXRCLENBRitHLEdBRWxGLGFBRlA7YUFBaEUsRUFERjtXQUFBLE1BQUE7bUJBTUUsT0FBTyxDQUFDLEdBQVIsQ0FBZSxZQUFBLEdBQ25CLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFEWSxHQUNMLGNBREssR0FDTyxDQUFDLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZSxDQUFDLE1BQWpCLENBRFAsR0FFSiwwQkFGSSxHQUVxQixDQUFDLEtBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQW9CLENBQUMsTUFBdEIsQ0FGckIsR0FFa0QsV0FGakUsRUFORjtXQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKTixDQWVBLENBQUMsT0FBRCxDQWZBLENBZU8sU0FBQyxNQUFELEdBQUE7QUFDTCxZQUFBLGFBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBaEIsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyxLQURmLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsK0JBQTVCLEVBQTZEO0FBQUEsVUFBQyxRQUFBLE1BQUQ7QUFBQSxVQUFTLE9BQUEsS0FBVDtBQUFBLFVBQWdCLFdBQUEsRUFBYSxJQUE3QjtTQUE3RCxDQUZBLENBQUE7ZUFHQSxPQUFPLENBQUMsS0FBUixDQUFjLE1BQWQsRUFKSztNQUFBLENBZlAsRUFETTtJQUFBLENBL0pSLENBQUE7O0FBQUEsMkJBcUxBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixVQUFBLFNBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxJQUFaLENBQUE7YUFFQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxJQUFiLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUdoQixjQUFBLGdDQUFBO0FBQUEsVUFIa0IsZUFBQSxTQUFTLGVBQUEsT0FHM0IsQ0FBQTtBQUFBLFVBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUNFLFlBQUEsS0FBQyxDQUFBLEtBQUQsR0FBUyxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQsR0FBQTtxQkFBTyxlQUFTLE9BQVQsRUFBQSxDQUFBLE1BQVA7WUFBQSxDQUFkLENBQVQsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLHVCQUFELENBQXlCLE9BQXpCLENBREEsQ0FERjtXQUFBO0FBTUEsVUFBQSxJQUFHLHFCQUFBLElBQVksT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBaEM7QUFDRSxpQkFBQSw4Q0FBQTtpQ0FBQTtrQkFBMEMsZUFBWSxLQUFDLENBQUEsS0FBYixFQUFBLElBQUE7QUFBMUMsZ0JBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixDQUFBO2VBQUE7QUFBQSxhQUFBO0FBSUEsWUFBQSxJQUFHLEtBQUMsQ0FBQSxTQUFTLENBQUMsTUFBZDtxQkFDRSxRQURGO2FBQUEsTUFBQTtxQkFLRSxLQUFDLENBQUEsTUFMSDthQUxGO1dBQUEsTUFZSyxJQUFPLG1CQUFQO21CQUNILEtBQUMsQ0FBQSxLQUFELEdBQVMsUUFETjtXQUFBLE1BSUEsSUFBQSxDQUFBLEtBQVEsQ0FBQSxTQUFTLENBQUMsTUFBbEI7bUJBQ0gsS0FBQyxDQUFBLE1BREU7V0FBQSxNQUFBO21CQUlILEdBSkc7V0F6Qlc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQThCQSxDQUFDLElBOUJELENBOEJNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFDSixLQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBOUJOLENBZ0NBLENBQUMsSUFoQ0QsQ0FnQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO0FBQ0osVUFBQSxJQUF3QyxlQUF4QzttQkFBQSxLQUFDLENBQUEsU0FBUyxDQUFDLGdCQUFYLENBQTRCLE9BQTVCLEVBQUE7V0FESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBaENOLEVBSHFCO0lBQUEsQ0FyTHZCLENBQUE7O0FBQUEsMkJBMk5BLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLFFBQUE7O1FBQUEsY0FBZSxPQUFBLENBQVEsZ0JBQVI7T0FBZjtBQUFBLE1BRUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FGWCxDQUFBO2FBR0ksSUFBQSxXQUFBLENBQ0Y7QUFBQSxRQUFBLFdBQUEsRUFBYSxRQUFiO0FBQUEsUUFDQSxPQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsWUFBQSxFQUFjLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FGZDtBQUFBLFFBR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FIVDtPQURFLEVBSlM7SUFBQSxDQTNOZixDQUFBOztBQUFBLDJCQXFPQSxpQkFBQSxHQUFtQixTQUFFLGNBQUYsR0FBQTtBQUFtQixNQUFsQixJQUFDLENBQUEsaUJBQUEsY0FBaUIsQ0FBbkI7SUFBQSxDQXJPbkIsQ0FBQTs7QUFBQSwyQkErT0EsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO2FBQ2pCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNuRCxjQUFBLGlDQUFBO0FBQUEsVUFBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiLENBQUE7QUFDQSxVQUFBLElBQWMsb0JBQUosSUFBbUIsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsVUFBakIsQ0FBN0I7QUFBQSxrQkFBQSxDQUFBO1dBREE7QUFBQSxVQUdBLE1BQUEsR0FBUyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsQ0FIVCxDQUFBO0FBSUEsVUFBQSxJQUFHLGNBQUg7QUFDRSxZQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQWhCLENBQUE7bUJBQ0EsYUFBYSxDQUFDLE1BQWQsQ0FBQSxFQUZGO1dBTG1EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkIsRUFEaUI7SUFBQSxDQS9PbkIsQ0FBQTs7QUFBQSwyQkF5UEEsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEdBQUE7QUFDdkIsTUFBQSxJQUFnQixJQUFDLENBQUEsU0FBRCxJQUFrQixnQkFBbEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO2FBQ0EsK0NBRnVCO0lBQUEsQ0F6UHpCLENBQUE7O0FBQUEsMkJBNlBBLG9CQUFBLEdBQXNCLFNBQUMsTUFBRCxHQUFBO0FBQ3BCLFVBQUEsMkJBQUE7QUFBQSxNQUFBLElBQVUsSUFBQyxDQUFBLFNBQVg7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7O1FBR0EsY0FBZSxPQUFBLENBQVEsZ0JBQVI7T0FIZjtBQUtBLE1BQUEsSUFBRyw4Q0FBSDtBQUNFLGVBQU8sSUFBQyxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQS9CLENBREY7T0FMQTtBQVFBLE1BQUEsSUFBRyxvQ0FBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxZQUFhLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBdEIsQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLE1BQU4sR0FBZSxNQURmLENBQUE7QUFBQSxRQUVBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLElBRmhCLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBQSxJQUFRLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBSHJCLENBREY7T0FBQSxNQUFBO0FBTUUsUUFBQSxLQUFBLEdBQVE7QUFBQSxVQUFDLFFBQUEsTUFBRDtBQUFBLFVBQVMsT0FBQSxFQUFTLElBQWxCO1NBQVIsQ0FORjtPQVJBO0FBQUEsTUFnQkEsSUFBQyxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXhCLEdBQXFDLE1BQUEsR0FBYSxJQUFBLFdBQUEsQ0FBWSxLQUFaLENBaEJsRCxDQUFBO0FBQUEsTUFrQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLFlBQUEsR0FBZSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BELFVBQUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLFlBQXRCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQSxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSxzQkFBdUIsQ0FBQSxNQUFNLENBQUMsRUFBUCxFQUhxQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQWxDLENBbEJBLENBQUE7QUFBQSxNQXVCQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyx5QkFBZCxFQUF5QyxNQUF6QyxDQXZCQSxDQUFBO2FBeUJBLE9BMUJvQjtJQUFBLENBN1B0QixDQUFBOztBQUFBLDJCQXlSQSxrQkFBQSxHQUFvQixTQUFDLElBQUQsR0FBQTtBQUNsQixVQUFBLHNCQUFBO0FBQUE7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFDRSxRQUFBLElBQXNCLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBbkIsQ0FBQSxDQUFBLEtBQWdDLElBQXREO0FBQUEsaUJBQU8sV0FBUCxDQUFBO1NBREY7QUFBQSxPQURrQjtJQUFBLENBelJwQixDQUFBOztBQUFBLDJCQTZSQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsVUFBQSxzRUFBQTtBQUFBO0FBQUEsV0FBQSxXQUFBOzJCQUFBO0FBQ0UsUUFBQSxJQUFHLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBLENBQWpCLENBQUg7QUFDRSxVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLHNCQUF1QixDQUFBLEVBQUEsQ0FEL0IsQ0FERjtTQURGO0FBQUEsT0FBQTtBQUtBO0FBQ0UsUUFBQSxJQUFHLG1DQUFIO0FBQ0U7QUFBQTtlQUFBLDRDQUFBOytCQUFBO0FBQ0UsWUFBQSxJQUFZLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixDQUFBLElBQW9DLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBakIsQ0FBaEQ7QUFBQSx1QkFBQTthQUFBO0FBQUEsWUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLENBRlQsQ0FBQTtBQUdBLFlBQUEsSUFBRyxjQUFIO0FBQ0UsY0FBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUFoQixDQUFBO0FBQUEsNEJBQ0EsYUFBYSxDQUFDLE1BQWQsQ0FBQSxFQURBLENBREY7YUFBQSxNQUFBO29DQUFBO2FBSkY7QUFBQTswQkFERjtTQURGO09BQUEsY0FBQTtBQVdFLFFBREksVUFDSixDQUFBO2VBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBWEY7T0FOa0I7SUFBQSxDQTdScEIsQ0FBQTs7QUFBQSwyQkFnVEEsZUFBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtBQUNmLFVBQUEsZ0NBQUE7O1FBQUEsWUFBYSxPQUFBLENBQVEsV0FBUjtPQUFiO0FBQUEsTUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFiLENBQXdCLElBQXhCLENBRlAsQ0FBQTtBQUFBLE1BR0EsT0FBQSx1REFBZ0MsRUFIaEMsQ0FBQTtBQUlBLFdBQUEsOENBQUE7NkJBQUE7WUFBdUMsU0FBQSxDQUFVLElBQVYsRUFBZ0IsTUFBaEIsRUFBd0I7QUFBQSxVQUFBLFNBQUEsRUFBVyxJQUFYO0FBQUEsVUFBaUIsR0FBQSxFQUFLLElBQXRCO1NBQXhCO0FBQXZDLGlCQUFPLElBQVA7U0FBQTtBQUFBLE9BSkE7YUFLQSxNQU5lO0lBQUEsQ0FoVGpCLENBQUE7O0FBQUEsMkJBZ1VBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFBRyxVQUFBLEtBQUE7aURBQU0sQ0FBRSxLQUFSLENBQUEsV0FBSDtJQUFBLENBaFVWLENBQUE7O0FBQUEsMkJBa1VBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUFVLE1BQUEsSUFBcUIsWUFBckI7ZUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLEVBQUE7T0FBVjtJQUFBLENBbFVaLENBQUE7O0FBQUEsMkJBb1VBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUFVLFVBQUEsS0FBQTthQUFBLHNEQUFrQixFQUFsQixFQUFBLElBQUEsT0FBVjtJQUFBLENBcFVULENBQUE7O0FBQUEsMkJBc1VBLFNBQUEsR0FBVyxTQUFDLFlBQUQsR0FBQTs7UUFBQyxlQUFhO09BQ3ZCOztRQUFBLGNBQWUsT0FBQSxDQUFRLGdCQUFSO09BQWY7YUFFSSxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ1YsY0FBQSxvQ0FBQTtBQUFBLFVBQUEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBWixDQUFBO0FBQUEsVUFDQSxVQUFBLEdBQWdCLFlBQUgsR0FBcUIsRUFBckIsMkNBQXNDLEVBRG5ELENBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUztBQUFBLFlBQ1AsWUFBQSxVQURPO0FBQUEsWUFFTixXQUFELEtBQUMsQ0FBQSxTQUZNO0FBQUEsWUFHUCxZQUFBLEVBQWMsS0FBQyxDQUFBLGVBQUQsQ0FBQSxDQUhQO0FBQUEsWUFJUCxLQUFBLEVBQU8sU0FKQTtBQUFBLFlBS1AsOEJBQUEsRUFBZ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUx6QjtBQUFBLFlBTVAsV0FBQSxFQUFhLEtBQUMsQ0FBQSxjQUFELENBQUEsQ0FOTjtBQUFBLFlBT1AsZ0JBQUEsRUFBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQVBYO1dBRlQsQ0FBQTtpQkFXQSxXQUFXLENBQUMsU0FBWixDQUFzQixNQUF0QixFQUE4QixTQUFDLE9BQUQsR0FBQTtBQUM1QixnQkFBQSxvQ0FBQTtBQUFBLGlCQUFBLGlEQUFBO2lDQUFBO0FBQ0UsY0FBQSx1QkFBQSxHQUEwQixTQUFTLENBQUMsSUFBVixDQUFlLFNBQUMsSUFBRCxHQUFBO3VCQUN2QyxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsQ0FBQSxLQUFtQixFQURvQjtjQUFBLENBQWYsQ0FBMUIsQ0FBQTtBQUdBLGNBQUEsSUFBQSxDQUFBLHVCQUFBOztrQkFDRSxPQUFPLENBQUMsVUFBVztpQkFBbkI7QUFBQSxnQkFDQSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQWhCLENBQXFCLENBQXJCLENBREEsQ0FERjtlQUpGO0FBQUEsYUFBQTttQkFRQSxPQUFBLENBQVEsT0FBUixFQVQ0QjtVQUFBLENBQTlCLEVBWlU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBSEs7SUFBQSxDQXRVWCxDQUFBOztBQUFBLDJCQWdXQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFBLENBQUEsSUFBaUMsQ0FBQSxXQUFqQztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQLENBQUE7T0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ2hCLGNBQUEsNkJBQUE7QUFBQSxVQURrQixlQUFBLFNBQVMsZUFBQSxPQUMzQixDQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBekIsQ0FBQSxDQUFBO0FBQUEsVUFFQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO21CQUFPLGVBQVMsT0FBVCxFQUFBLENBQUEsTUFBUDtVQUFBLENBQWQsQ0FGVCxDQUFBO0FBR0EsZUFBQSw4Q0FBQTs0QkFBQTtnQkFBcUMsZUFBUyxLQUFDLENBQUEsS0FBVixFQUFBLENBQUE7QUFBckMsY0FBQSxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQUE7YUFBQTtBQUFBLFdBSEE7QUFBQSxVQUtBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBbEMsQ0FMQSxDQUFBO2lCQU1BLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixPQUF6QixFQVBnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLEVBSFc7SUFBQSxDQWhXYixDQUFBOztBQUFBLDJCQTRXQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsR0FBQTtBQUNyQixVQUFBLHlCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7O1FBRUEsWUFBYSxPQUFBLENBQVEsV0FBUjtPQUZiO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFiLENBQXdCLElBQXhCLENBSFAsQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FKVixDQUFBO0FBTUEsV0FBQSw4Q0FBQTs2QkFBQTtZQUF1QyxTQUFBLENBQVUsSUFBVixFQUFnQixNQUFoQixFQUF3QjtBQUFBLFVBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxVQUFpQixHQUFBLEVBQUssSUFBdEI7U0FBeEI7QUFBdkMsaUJBQU8sSUFBUDtTQUFBO0FBQUEsT0FQcUI7SUFBQSxDQTVXdkIsQ0FBQTs7QUFBQSwyQkFxWEEsYUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2IsVUFBQSw4QkFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQUE7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBOztRQUVBLFlBQWEsT0FBQSxDQUFRLFdBQVI7T0FGYjtBQUFBLE1BR0EsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixJQUF4QixDQUhQLENBQUE7QUFBQSxNQUlBLFlBQUEsR0FBZSxJQUFDLENBQUEsZUFBRCxDQUFBLENBSmYsQ0FBQTtBQU1BLFdBQUEsbURBQUE7a0NBQUE7WUFBNEMsU0FBQSxDQUFVLElBQVYsRUFBZ0IsTUFBaEIsRUFBd0I7QUFBQSxVQUFBLFNBQUEsRUFBVyxJQUFYO0FBQUEsVUFBaUIsR0FBQSxFQUFLLElBQXRCO1NBQXhCO0FBQTVDLGlCQUFPLElBQVA7U0FBQTtBQUFBLE9BUGE7SUFBQSxDQXJYZixDQUFBOztBQUFBLDJCQThYQSxpQkFBQSxHQUFtQixTQUFDLElBQUQsR0FBQTtBQUNqQixVQUFBLEtBQUE7O1FBQUEsb0JBQXFCLE9BQUEsQ0FBUSx3QkFBUjtPQUFyQjtBQUFBLE1BRUEsS0FBQSxHQUFRLGlCQUFBLENBQWtCLElBQWxCLENBRlIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxLQUFBLEtBQVMsTUFBVCxJQUFtQixLQUFBLEtBQVMsTUFBL0I7QUFDRSxRQUFBLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFBUSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFSLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBUixDQURGO09BSkE7YUFPQSxNQVJpQjtJQUFBLENBOVhuQixDQUFBOztBQUFBLDJCQWdaQSxVQUFBLEdBQVksU0FBQSxHQUFBOztRQUNWLFVBQVcsT0FBQSxDQUFRLFdBQVI7T0FBWDtBQUVBLE1BQUEsSUFBQSxDQUFBLElBQTJCLENBQUEsYUFBRCxDQUFBLENBQTFCO0FBQUEsZUFBTyxHQUFBLENBQUEsT0FBUCxDQUFBO09BRkE7YUFHSSxJQUFBLE9BQUEsQ0FBUSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFSLEVBSk07SUFBQSxDQWhaWixDQUFBOztBQUFBLDJCQXNaQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxVQUFYLENBQUEsRUFBSDtJQUFBLENBdFpaLENBQUE7O0FBQUEsMkJBd1pBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBQSxFQUFIO0lBQUEsQ0F4WmQsQ0FBQTs7QUFBQSwyQkEwWkEsOEJBQUEsR0FBZ0MsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLDRCQUFKO0lBQUEsQ0ExWmhDLENBQUE7O0FBQUEsMkJBNFpBLGVBQUEsR0FBaUIsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsRUFBM0IsRUFBUjtJQUFBLENBNVpqQixDQUFBOztBQUFBLDJCQThaQSxpQkFBQSxHQUFtQixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsaUJBQVgsQ0FBNkIsSUFBN0IsRUFBVjtJQUFBLENBOVpuQixDQUFBOztBQUFBLDJCQWdhQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQUEsRUFBSDtJQUFBLENBaGFuQixDQUFBOztBQUFBLDJCQWthQSwyQkFBQSxHQUE2QixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEseUJBQUo7SUFBQSxDQWxhN0IsQ0FBQTs7QUFBQSwyQkFvYUEsa0JBQUEsR0FBb0IsU0FBQyxRQUFELEdBQUE7YUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQVEsQ0FBQyxJQUE3QixDQUFrQyxDQUFDLElBQW5DLENBQXdDLFNBQUMsTUFBRCxHQUFBO0FBQ3RDLFlBQUEsMEJBQUE7QUFBQSxRQUFBLElBQThELGFBQTlEO0FBQUEsVUFBQSxRQUF3QyxPQUFBLENBQVEsTUFBUixDQUF4QyxFQUFDLGdCQUFBLE9BQUQsRUFBVSw0QkFBQSxtQkFBVixFQUErQixjQUFBLEtBQS9CLENBQUE7U0FBQTtBQUFBLFFBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FGVCxDQUFBO0FBQUEsUUFJQSxXQUFBLEdBQWMsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FDN0IsTUFBTSxDQUFDLHlCQUFQLENBQWlDLFFBQVEsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFoRCxDQUQ2QixFQUU3QixNQUFNLENBQUMseUJBQVAsQ0FBaUMsUUFBUSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWhELENBRjZCLENBQWpCLENBSmQsQ0FBQTtlQVNBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixXQUE5QixFQUEyQztBQUFBLFVBQUEsVUFBQSxFQUFZLElBQVo7U0FBM0MsRUFWc0M7TUFBQSxDQUF4QyxFQURrQjtJQUFBLENBcGFwQixDQUFBOztBQUFBLDJCQWliQSx3QkFBQSxHQUEwQixTQUFDLE9BQUQsR0FBQTthQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxzQkFBZCxFQUFzQyxPQUF0QyxFQUR3QjtJQUFBLENBamIxQixDQUFBOztBQUFBLDJCQW9iQSxvQkFBQSxHQUFzQixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixDQUFDLElBQUQsQ0FBdkIsRUFBVjtJQUFBLENBcGJ0QixDQUFBOztBQUFBLDJCQXNiQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsR0FBQTthQUNqQixJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO2lCQUNWLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixLQUF2QixFQUE4QixTQUFDLE9BQUQsR0FBQTttQkFBYSxPQUFBLENBQVEsT0FBUixFQUFiO1VBQUEsQ0FBOUIsRUFEVTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFEaUI7SUFBQSxDQXRidkIsQ0FBQTs7QUFBQSwyQkEwYkEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEdBQUE7YUFBVSxJQUFDLENBQUEsU0FBUyxDQUFDLG1CQUFYLENBQStCLElBQS9CLEVBQVY7SUFBQSxDQTFickIsQ0FBQTs7QUFBQSwyQkE0YkEsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEdBQUE7YUFBVyxJQUFDLENBQUEsU0FBUyxDQUFDLG9CQUFYLENBQWdDLEtBQWhDLEVBQVg7SUFBQSxDQTVidEIsQ0FBQTs7QUFBQSwyQkE4YkEsc0JBQUEsR0FBd0IsU0FBQyxJQUFELEdBQUE7YUFBVSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQyxJQUFELENBQXpCLEVBQVY7SUFBQSxDQTlieEIsQ0FBQTs7QUFBQSwyQkFnY0EsdUJBQUEsR0FBeUIsU0FBQyxLQUFELEdBQUE7YUFDdkIsSUFBQyxDQUFBLFNBQVMsQ0FBQyx1QkFBWCxDQUFtQyxLQUFuQyxFQUR1QjtJQUFBLENBaGN6QixDQUFBOztBQUFBLDJCQW1jQSxzQkFBQSxHQUF3QixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFDLElBQUQsQ0FBekIsRUFBVjtJQUFBLENBbmN4QixDQUFBOztBQUFBLDJCQXFjQSx1QkFBQSxHQUF5QixTQUFDLEtBQUQsR0FBQTtBQUN2QixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxPQUFPLENBQUMsT0FBUixDQUFBLENBQVYsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQWdDLENBQUEsYUFBRCxDQUFBLENBQS9CO0FBQUEsUUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFWLENBQUE7T0FEQTthQUdBLE9BQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNKLFVBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUMsSUFBRCxHQUFBO21CQUFVLGVBQVksS0FBQyxDQUFBLEtBQWIsRUFBQSxJQUFBLE1BQVY7VUFBQSxDQUFYLENBQUg7QUFDRSxtQkFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUFQLENBREY7V0FBQTtpQkFHQSxLQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFKSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sQ0FNQSxDQUFDLElBTkQsQ0FNTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7aUJBQ0osS0FBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxLQUFyQyxFQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOTixFQUp1QjtJQUFBLENBcmN6QixDQUFBOztBQUFBLDJCQWtkQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsRUFBUSxRQUFSLEdBQUE7QUFDckIsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQWhCLElBQXNCLENBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFNLENBQUEsQ0FBQSxDQUExQixDQUFkLENBQXpCO2VBQ0UsV0FBVyxDQUFDLHNCQUFaLENBQUEsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxTQUFDLE9BQUQsR0FBQTtpQkFBYSxRQUFBLENBQVMsT0FBVCxFQUFiO1FBQUEsQ0FBMUMsRUFERjtPQUFBLE1BQUE7O1VBR0UsZUFBZ0IsT0FBQSxDQUFRLGlCQUFSO1NBQWhCO2VBRUEsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsQ0FBRCxHQUFBO21CQUFPLENBQUMsQ0FBRCxFQUFJLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFuQixDQUFKLEVBQVA7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBQXZCLEVBQXFFLElBQUMsQ0FBQSwyQkFBdEUsRUFBbUcsU0FBQyxPQUFELEdBQUE7aUJBQWEsUUFBQSxDQUFTLE9BQVQsRUFBYjtRQUFBLENBQW5HLEVBTEY7T0FEcUI7SUFBQSxDQWxkdkIsQ0FBQTs7QUFBQSwyQkEwZEEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsOEJBQUE7QUFBQSxNQUFBLElBQTRDLHVCQUE1QztBQUFBLFFBQUMsa0JBQW1CLE9BQUEsQ0FBUSxRQUFSLEVBQW5CLGVBQUQsQ0FBQTtPQUFBOztRQUNBLGlCQUFrQixPQUFBLENBQVEsa0JBQVI7T0FEbEI7QUFBQSxNQUdBLFFBQUEsR0FBVyxDQUhYLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxFQUpaLENBQUE7QUFBQSxNQUtBLElBQUEsR0FBTyxFQUxQLENBQUE7QUFBQSxNQU1BLGNBQWMsQ0FBQyxPQUFmLENBQXVCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sSUFBQSxJQUFTLGNBQUEsR0FBYyxDQUFkLEdBQWdCLElBQWhCLEdBQW9CLENBQXBCLEdBQXNCLFNBQXRDO01BQUEsQ0FBdkIsQ0FOQSxDQUFBO0FBQUEsTUFRQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FSTixDQUFBO0FBQUEsTUFTQSxHQUFHLENBQUMsU0FBSixHQUFnQixrQkFUaEIsQ0FBQTtBQUFBLE1BVUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsSUFWaEIsQ0FBQTtBQUFBLE1BV0EsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFkLENBQTBCLEdBQTFCLENBWEEsQ0FBQTtBQUFBLE1BYUEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO0FBQ3JCLFlBQUEsMEJBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxHQUFHLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBcEIsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLGdCQUFBLENBQWlCLElBQWpCLENBQXNCLENBQUMsS0FEL0IsQ0FBQTtBQUFBLFFBRUEsR0FBQSxHQUFNLFFBQUEsR0FBVyxDQUFDLENBQUMsTUFBYixHQUFzQixLQUFLLENBQUMsTUFBNUIsR0FBcUMsQ0FGM0MsQ0FBQTtBQUFBLFFBSUEsUUFBQSxHQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU8sR0FBQSxHQUFHLENBQVY7QUFBQSxVQUNBLElBQUEsRUFBTSxDQUROO0FBQUEsVUFFQSxLQUFBLEVBQU8sS0FGUDtBQUFBLFVBR0EsS0FBQSxFQUFPLENBQUMsUUFBRCxFQUFVLEdBQVYsQ0FIUDtBQUFBLFVBSUEsSUFBQSxFQUFNLGVBSk47U0FMRixDQUFBO0FBQUEsUUFXQSxRQUFBLEdBQVcsR0FYWCxDQUFBO2VBWUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxRQUFmLEVBYnFCO01BQUEsQ0FBdkIsQ0FiQSxDQUFBO0FBQUEsTUE0QkEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFkLENBQTBCLEdBQTFCLENBNUJBLENBQUE7QUE2QkEsYUFBTyxTQUFQLENBOUJtQjtJQUFBLENBMWRyQixDQUFBOztBQUFBLDJCQWtnQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLEVBQUg7SUFBQSxDQWxnQmQsQ0FBQTs7QUFBQSwyQkFvZ0JBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixVQUFBLFlBQUE7b0tBQStGLFVBRDdFO0lBQUEsQ0FwZ0JwQixDQUFBOztBQUFBLDJCQXVnQkEsaUNBQUEsR0FBbUMsU0FBRSw4QkFBRixHQUFBO0FBQ2pDLE1BRGtDLElBQUMsQ0FBQSxpQ0FBQSw4QkFDbkMsQ0FBQTthQUFBLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBbEMsQ0FBdUMsd0JBQXZDLEVBQWlFO0FBQUEsUUFDL0QsUUFBQSxFQUFVLElBQUMsQ0FBQSx3QkFEb0Q7T0FBakUsRUFEaUM7SUFBQSxDQXZnQm5DLENBQUE7O0FBQUEsMkJBNGdCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsbUJBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxDQUFDLFdBQUQsQ0FBUixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sOENBQTRCLEVBQTVCLENBRFIsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSx1QkFBUjtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLHFFQUF1RCxFQUF2RCxDQUFSLENBREY7T0FGQTthQUlBLE1BTGM7SUFBQSxDQTVnQmhCLENBQUE7O0FBQUEsMkJBbWhCQSxjQUFBLEdBQWdCLFNBQUUsV0FBRixHQUFBO0FBQ2QsTUFEZSxJQUFDLENBQUEsb0NBQUEsY0FBWSxFQUM1QixDQUFBO0FBQUEsTUFBQSxJQUFjLDBCQUFKLElBQTBCLGdDQUFwQztBQUFBLGNBQUEsQ0FBQTtPQUFBO2FBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixJQUF2QixFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsRUFIYztJQUFBLENBbmhCaEIsQ0FBQTs7QUFBQSwyQkF3aEJBLDBCQUFBLEdBQTRCLFNBQUUsdUJBQUYsR0FBQTtBQUMxQixNQUQyQixJQUFDLENBQUEsMEJBQUEsdUJBQzVCLENBQUE7YUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBRDBCO0lBQUEsQ0F4aEI1QixDQUFBOztBQUFBLDJCQTJoQkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLGlDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sOENBQTRCLEVBQTVCLENBRFIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLDhDQUE0QixFQUE1QixDQUZSLENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsdUJBQVI7QUFDRSxRQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixxRUFBdUQsRUFBdkQsQ0FBUixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sNkVBQStELEVBQS9ELENBRFIsQ0FERjtPQUhBO2FBTUEsTUFQYztJQUFBLENBM2hCaEIsQ0FBQTs7QUFBQSwyQkFvaUJBLGNBQUEsR0FBZ0IsU0FBRSxXQUFGLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLG9DQUFBLGNBQVksRUFBSyxDQUFuQjtJQUFBLENBcGlCaEIsQ0FBQTs7QUFBQSwyQkFzaUJBLDBCQUFBLEdBQTRCLFNBQUUsdUJBQUYsR0FBQTtBQUE0QixNQUEzQixJQUFDLENBQUEsMEJBQUEsdUJBQTBCLENBQTVCO0lBQUEsQ0F0aUI1QixDQUFBOztBQUFBLDJCQXdpQkEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLDBCQUFBO0FBQUEsTUFBQSxLQUFBLGlEQUF3QixFQUF4QixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHdCQUFSO0FBQ0UsUUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sMERBQXdDLEVBQXhDLENBQVIsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLGtFQUFvRCxFQUFwRCxDQURSLENBREY7T0FEQTthQUlBLE1BTGU7SUFBQSxDQXhpQmpCLENBQUE7O0FBQUEsMkJBK2lCQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSxLQUFBOytFQUF3QyxDQUFFLEdBQTFDLENBQThDLFNBQUMsQ0FBRCxHQUFBO0FBQzVDLFFBQUEsSUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLENBQWIsQ0FBSDtpQkFBd0IsQ0FBQSxHQUFJLElBQTVCO1NBQUEsTUFBQTtpQkFBcUMsRUFBckM7U0FENEM7TUFBQSxDQUE5QyxXQURxQjtJQUFBLENBL2lCdkIsQ0FBQTs7QUFBQSwyQkFtakJBLGVBQUEsR0FBaUIsU0FBRSxZQUFGLEdBQUE7QUFDZixNQURnQixJQUFDLENBQUEsc0NBQUEsZUFBYSxFQUM5QixDQUFBO0FBQUEsTUFBQSxJQUFPLDBCQUFKLElBQTBCLGdDQUE3QjtBQUNFLGVBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSxnQ0FBZixDQUFQLENBREY7T0FBQTthQUdBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNqQixjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQsR0FBQTttQkFBTyxLQUFDLENBQUEsYUFBRCxDQUFlLENBQWYsRUFBUDtVQUFBLENBQWQsQ0FBVixDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBekIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO21CQUFPLENBQUEsS0FBRSxDQUFBLGFBQUQsQ0FBZSxDQUFmLEVBQVI7VUFBQSxDQUFkLENBSFQsQ0FBQTtpQkFJQSxLQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFMaUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQUplO0lBQUEsQ0FuakJqQixDQUFBOztBQUFBLDJCQThqQkEsMkJBQUEsR0FBNkIsU0FBRSx3QkFBRixHQUFBO0FBQzNCLE1BRDRCLElBQUMsQ0FBQSwyQkFBQSx3QkFDN0IsQ0FBQTthQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsRUFEMkI7SUFBQSxDQTlqQjdCLENBQUE7O0FBQUEsMkJBaWtCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSxvQkFBQTtBQUFBLE1BQUEsTUFBQSxrREFBMEIsRUFBMUIsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSx5QkFBUjtBQUNFLFFBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLHVFQUEwRCxFQUExRCxDQUFULENBREY7T0FEQTtBQUFBLE1BSUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLGdCQUFmLENBSlQsQ0FBQTthQUtBLE9BTmdCO0lBQUEsQ0Fqa0JsQixDQUFBOztBQUFBLDJCQXlrQkEsZ0JBQUEsR0FBa0IsU0FBRSxhQUFGLEdBQUE7QUFDaEIsTUFEaUIsSUFBQyxDQUFBLHdDQUFBLGdCQUFjLEVBQ2hDLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQURnQjtJQUFBLENBemtCbEIsQ0FBQTs7QUFBQSwyQkE0a0JBLDRCQUFBLEdBQThCLFNBQUUseUJBQUYsR0FBQTtBQUM1QixNQUQ2QixJQUFDLENBQUEsNEJBQUEseUJBQzlCLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQUQ0QjtJQUFBLENBNWtCOUIsQ0FBQTs7QUFBQSwyQkEra0JBLHFCQUFBLEdBQXVCLFNBQUUsa0JBQUYsR0FBQTtBQUNyQixNQURzQixJQUFDLENBQUEsa0RBQUEscUJBQW1CLEVBQzFDLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDJCQUFkLEVBQTJDLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQTNDLEVBRnFCO0lBQUEsQ0Eva0J2QixDQUFBOztBQUFBLDJCQW1sQkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQURFO0lBQUEsQ0FubEJ4QixDQUFBOztBQUFBLDJCQXNsQkEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsK0JBQUE7QUFBQSxNQUFBLFNBQUEsdURBQWtDLEVBQWxDLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsOEJBQVI7QUFDRSxRQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFBViw0RUFBa0UsRUFBbEUsQ0FBWixDQURGO09BRkE7QUFLQSxNQUFBLElBQXFCLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXpDO0FBQUEsUUFBQSxTQUFBLEdBQVksQ0FBQyxHQUFELENBQVosQ0FBQTtPQUxBO0FBT0EsTUFBQSxJQUFhLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxJQUFELEdBQUE7ZUFBVSxJQUFBLEtBQVEsSUFBbEI7TUFBQSxDQUFmLENBQWI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQVBBO0FBQUEsTUFTQSxNQUFBLEdBQVMsU0FBUyxDQUFDLEdBQVYsQ0FBYyxTQUFDLEdBQUQsR0FBQTtBQUNyQixZQUFBLEtBQUE7bUZBQTBDLENBQUUsU0FBUyxDQUFDLE9BQXRELENBQThELEtBQTlELEVBQXFFLEtBQXJFLFdBRHFCO01BQUEsQ0FBZCxDQUVULENBQUMsTUFGUSxDQUVELFNBQUMsS0FBRCxHQUFBO2VBQVcsY0FBWDtNQUFBLENBRkMsQ0FUVCxDQUFBO2FBYUEsQ0FBRSxVQUFBLEdBQVMsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBRCxDQUFULEdBQTJCLElBQTdCLEVBZG1CO0lBQUEsQ0F0bEJyQixDQUFBOztBQUFBLDJCQXNtQkEsaUNBQUEsR0FBbUMsU0FBRSw4QkFBRixHQUFBO0FBQ2pDLE1BRGtDLElBQUMsQ0FBQSxpQ0FBQSw4QkFDbkMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFGaUM7SUFBQSxDQXRtQm5DLENBQUE7O0FBQUEsMkJBMG1CQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxjQUFKO0lBQUEsQ0ExbUJoQixDQUFBOztBQUFBLDJCQTRtQkEsZ0JBQUEsR0FBa0IsU0FBQyxhQUFELEdBQUE7QUFDaEIsTUFBQSxJQUE0QixhQUFBLEtBQWlCLElBQUMsQ0FBQSxhQUE5QztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsYUFGakIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtlQUNFLElBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLHNCQUFELENBQUEsRUFIRjtPQUpnQjtJQUFBLENBNW1CbEIsQ0FBQTs7QUFBQSwyQkFxbkJBLHNCQUFBLEdBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUFaLENBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDeEQsY0FBQSxTQUFBO0FBQUEsVUFBQSxJQUFBLENBQUEsS0FBZSxDQUFBLGFBQWY7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFFQSxVQUFBLElBQTRDLHVCQUE1QztBQUFBLFlBQUMsa0JBQW1CLE9BQUEsQ0FBUSxRQUFSLEVBQW5CLGVBQUQsQ0FBQTtXQUZBO0FBQUEsVUFJQSxTQUFBLEdBQVksS0FBQyxDQUFBLG1CQUFELENBQUEsQ0FKWixDQUFBO2lCQUtBLEtBQUMsQ0FBQSxTQUFTLENBQUMsb0JBQVgsQ0FBZ0MsZUFBaEMsRUFBaUQsU0FBakQsRUFOd0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxDQUF0QixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLGtCQUFwQixDQVJBLENBQUE7YUFTQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBbkIsRUFWc0I7SUFBQSxDQXJuQnhCLENBQUE7O0FBQUEsMkJBaW9CQSxzQkFBQSxHQUF3QixTQUFBLEdBQUE7QUFDdEIsTUFBQSxJQUE0Qyx1QkFBNUM7QUFBQSxRQUFDLGtCQUFtQixPQUFBLENBQVEsUUFBUixFQUFuQixlQUFELENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLElBQUMsQ0FBQSxrQkFBdkIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLHVCQUFYLENBQW1DLENBQUMsZUFBRCxDQUFuQyxDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsT0FBcEIsQ0FBQSxFQUxzQjtJQUFBLENBam9CeEIsQ0FBQTs7QUFBQSwyQkF3b0JBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBTyxJQUFBLElBQUEsQ0FBQSxFQUFQO0lBQUEsQ0F4b0JkLENBQUE7O0FBQUEsMkJBMG9CQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFPLHlCQUFQO0FBQ0UsUUFBQSxRQUFpRCxPQUFBLENBQVEsWUFBUixDQUFqRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLGtDQUFBLHlCQUFwQixDQURGO09BQUE7QUFBQSxNQUdBLElBQUEsR0FDRTtBQUFBLFFBQUEsWUFBQSxFQUFjLGNBQWQ7QUFBQSxRQUNBLFNBQUEsRUFBVyxJQUFDLENBQUEsWUFBRCxDQUFBLENBRFg7QUFBQSxRQUVBLE9BQUEsRUFBUyxpQkFGVDtBQUFBLFFBR0EsY0FBQSxFQUFnQix5QkFIaEI7QUFBQSxRQUlBLGlCQUFBLEVBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsQ0FKbkI7QUFBQSxRQUtBLGtCQUFBLEVBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsQ0FMcEI7T0FKRixDQUFBO0FBV0EsTUFBQSxJQUFHLG9DQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsdUJBQUwsR0FBK0IsSUFBQyxDQUFBLHVCQUFoQyxDQURGO09BWEE7QUFhQSxNQUFBLElBQUcsb0NBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyx1QkFBTCxHQUErQixJQUFDLENBQUEsdUJBQWhDLENBREY7T0FiQTtBQWVBLE1BQUEsSUFBRyxxQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLHdCQUFMLEdBQWdDLElBQUMsQ0FBQSx3QkFBakMsQ0FERjtPQWZBO0FBaUJBLE1BQUEsSUFBRyxzQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLHlCQUFMLEdBQWlDLElBQUMsQ0FBQSx5QkFBbEMsQ0FERjtPQWpCQTtBQW1CQSxNQUFBLElBQUcsMEJBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxhQUFMLEdBQXFCLElBQUMsQ0FBQSxhQUF0QixDQURGO09BbkJBO0FBcUJBLE1BQUEsSUFBRywwQkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBQyxDQUFBLGFBQXRCLENBREY7T0FyQkE7QUF1QkEsTUFBQSxJQUFHLHlCQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsWUFBTCxHQUFvQixJQUFDLENBQUEsWUFBckIsQ0FERjtPQXZCQTtBQXlCQSxNQUFBLElBQUcsd0JBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxXQUFMLEdBQW1CLElBQUMsQ0FBQSxXQUFwQixDQURGO09BekJBO0FBMkJBLE1BQUEsSUFBRyx3QkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsSUFBQyxDQUFBLFdBQXBCLENBREY7T0EzQkE7QUFBQSxNQThCQSxJQUFJLENBQUMsT0FBTCxHQUFlLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBOUJmLENBQUE7QUFnQ0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFDLENBQUEsS0FBZCxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsU0FBTCxHQUFpQixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBQSxDQURqQixDQURGO09BaENBO2FBb0NBLEtBckNTO0lBQUEsQ0Exb0JYLENBQUE7O0FBQUEsMkJBaXJCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSwyQkFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLEVBQU4sQ0FBQTtBQUNBO0FBQUEsV0FBQSxXQUFBO2dDQUFBO0FBQ0UsUUFBQSxHQUFJLENBQUEsRUFBQSxDQUFKLEdBQVUsV0FBVyxDQUFDLFNBQVosQ0FBQSxDQUFWLENBREY7QUFBQSxPQURBO2FBR0EsSUFKZ0I7SUFBQSxDQWpyQmxCLENBQUE7O3dCQUFBOztNQWxCRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-project.coffee
