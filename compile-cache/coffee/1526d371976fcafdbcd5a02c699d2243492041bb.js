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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItcHJvamVjdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseVJBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BUUksRUFSSixFQUNFLHFCQURGLEVBQ2UscUJBRGYsRUFFRSxpQkFGRixFQUVXLDRCQUZYLEVBRStCLDZCQUYvQixFQUdFLHFCQUhGLEVBR2Usc0JBSGYsRUFJRSxpQkFKRixFQUlXLDZCQUpYLEVBSWdDLGVBSmhDLEVBS0UsNEJBTEYsRUFLcUIsb0NBTHJCLEVBS2dELDBCQUxoRCxFQUtpRSx5QkFMakUsRUFNRSw0QkFORixFQU9FLG9CQVBGLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO0FBQ2IsUUFBQSxjQUFBO0FBQUEsSUFBQSxJQUFvQixXQUFKLElBQWMsV0FBOUI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUFvQixDQUFDLENBQUMsTUFBRixLQUFZLENBQUMsQ0FBQyxNQUFsQztBQUFBLGFBQU8sS0FBUCxDQUFBO0tBREE7QUFFQSxTQUFBLGdEQUFBO2VBQUE7VUFBK0IsQ0FBQSxLQUFPLENBQUUsQ0FBQSxDQUFBO0FBQXhDLGVBQU8sS0FBUDtPQUFBO0FBQUEsS0FGQTtBQUdBLFdBQU8sSUFBUCxDQUphO0VBQUEsQ0FWZixDQUFBOztBQUFBLEVBZ0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFlBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7QUFDWixVQUFBLHFCQUFBO0FBQUEsTUFBQSxJQUFPLHlCQUFQO0FBQ0UsUUFBQSxRQUFpRCxPQUFBLENBQVEsWUFBUixDQUFqRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLGtD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-project.coffee
