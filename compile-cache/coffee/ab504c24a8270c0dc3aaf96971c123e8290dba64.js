(function() {
  var Color, ColorContext, ColorExpression, Emitter, VariablesCollection, nextId, registry, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Emitter = _ref[0], ColorExpression = _ref[1], ColorContext = _ref[2], Color = _ref[3], registry = _ref[4];

  nextId = 0;

  module.exports = VariablesCollection = (function() {
    VariablesCollection.deserialize = function(state) {
      return new VariablesCollection(state);
    };

    Object.defineProperty(VariablesCollection.prototype, 'length', {
      get: function() {
        return this.variables.length;
      },
      enumerable: true
    });

    function VariablesCollection(state) {
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      this.reset();
      this.initialize(state != null ? state.content : void 0);
    }

    VariablesCollection.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    VariablesCollection.prototype.onceInitialized = function(callback) {
      var disposable;
      if (callback == null) {
        return;
      }
      if (this.initialized) {
        return callback();
      } else {
        return disposable = this.emitter.on('did-initialize', function() {
          disposable.dispose();
          return callback();
        });
      }
    };

    VariablesCollection.prototype.initialize = function(content) {
      var iteration;
      if (content == null) {
        content = [];
      }
      iteration = (function(_this) {
        return function(cb) {
          var end, start, v;
          start = new Date;
          end = new Date;
          while (content.length > 0 && end - start < 100) {
            v = content.shift();
            _this.restoreVariable(v);
          }
          if (content.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          _this.initialized = true;
          return _this.emitter.emit('did-initialize');
        };
      })(this));
    };

    VariablesCollection.prototype.reset = function() {
      this.variables = [];
      this.variableNames = [];
      this.colorVariables = [];
      this.variablesByPath = {};
      return this.dependencyGraph = {};
    };

    VariablesCollection.prototype.getVariables = function() {
      return this.variables.slice();
    };

    VariablesCollection.prototype.getNonColorVariables = function() {
      return this.getVariables().filter(function(v) {
        return !v.isColor;
      });
    };

    VariablesCollection.prototype.getVariablesForPath = function(path) {
      var _ref1;
      return (_ref1 = this.variablesByPath[path]) != null ? _ref1 : [];
    };

    VariablesCollection.prototype.getVariableByName = function(name) {
      return this.collectVariablesByName([name]).pop();
    };

    VariablesCollection.prototype.getVariableById = function(id) {
      var v, _i, _len, _ref1;
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.id === id) {
          return v;
        }
      }
    };

    VariablesCollection.prototype.getVariablesForPaths = function(paths) {
      var p, res, _i, _len;
      res = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        if (p in this.variablesByPath) {
          res = res.concat(this.variablesByPath[p]);
        }
      }
      return res;
    };

    VariablesCollection.prototype.getColorVariables = function() {
      return this.colorVariables.slice();
    };

    VariablesCollection.prototype.find = function(properties) {
      var _ref1;
      return (_ref1 = this.findAll(properties)) != null ? _ref1[0] : void 0;
    };

    VariablesCollection.prototype.findAll = function(properties) {
      var keys;
      if (properties == null) {
        properties = {};
      }
      keys = Object.keys(properties);
      if (keys.length === 0) {
        return null;
      }
      return this.variables.filter(function(v) {
        return keys.every(function(k) {
          var a, b, _ref1;
          if (((_ref1 = v[k]) != null ? _ref1.isEqual : void 0) != null) {
            return v[k].isEqual(properties[k]);
          } else if (Array.isArray(b = properties[k])) {
            a = v[k];
            return a.length === b.length && a.every(function(value) {
              return __indexOf.call(b, value) >= 0;
            });
          } else {
            return v[k] === properties[k];
          }
        });
      });
    };

    VariablesCollection.prototype.updateCollection = function(collection, paths) {
      var created, destroyed, path, pathsCollection, pathsToDestroy, remainingPaths, results, updated, v, _i, _j, _k, _len, _len1, _len2, _name, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      pathsCollection = {};
      remainingPaths = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        if (pathsCollection[_name = v.path] == null) {
          pathsCollection[_name] = [];
        }
        pathsCollection[v.path].push(v);
        if (_ref1 = v.path, __indexOf.call(remainingPaths, _ref1) < 0) {
          remainingPaths.push(v.path);
        }
      }
      results = {
        created: [],
        destroyed: [],
        updated: []
      };
      for (path in pathsCollection) {
        collection = pathsCollection[path];
        _ref2 = this.updatePathCollection(path, collection, true) || {}, created = _ref2.created, updated = _ref2.updated, destroyed = _ref2.destroyed;
        if (created != null) {
          results.created = results.created.concat(created);
        }
        if (updated != null) {
          results.updated = results.updated.concat(updated);
        }
        if (destroyed != null) {
          results.destroyed = results.destroyed.concat(destroyed);
        }
      }
      if (paths != null) {
        pathsToDestroy = collection.length === 0 ? paths : paths.filter(function(p) {
          return __indexOf.call(remainingPaths, p) < 0;
        });
        for (_j = 0, _len1 = pathsToDestroy.length; _j < _len1; _j++) {
          path = pathsToDestroy[_j];
          _ref3 = this.updatePathCollection(path, collection, true) || {}, created = _ref3.created, updated = _ref3.updated, destroyed = _ref3.destroyed;
          if (created != null) {
            results.created = results.created.concat(created);
          }
          if (updated != null) {
            results.updated = results.updated.concat(updated);
          }
          if (destroyed != null) {
            results.destroyed = results.destroyed.concat(destroyed);
          }
        }
      }
      results = this.updateDependencies(results);
      if (((_ref4 = results.created) != null ? _ref4.length : void 0) === 0) {
        delete results.created;
      }
      if (((_ref5 = results.updated) != null ? _ref5.length : void 0) === 0) {
        delete results.updated;
      }
      if (((_ref6 = results.destroyed) != null ? _ref6.length : void 0) === 0) {
        delete results.destroyed;
      }
      if (results.destroyed != null) {
        _ref7 = results.destroyed;
        for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
          v = _ref7[_k];
          this.deleteVariableReferences(v);
        }
      }
      return this.emitChangeEvent(results);
    };

    VariablesCollection.prototype.updatePathCollection = function(path, collection, batch) {
      var destroyed, pathCollection, results, status, v, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      pathCollection = this.variablesByPath[path] || [];
      results = this.addMany(collection, true);
      destroyed = [];
      for (_i = 0, _len = pathCollection.length; _i < _len; _i++) {
        v = pathCollection[_i];
        status = this.getVariableStatusInCollection(v, collection)[0];
        if (status === 'created') {
          destroyed.push(this.remove(v, true));
        }
      }
      if (destroyed.length > 0) {
        results.destroyed = destroyed;
      }
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          this.deleteVariableReferences(v);
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.add = function(variable, batch) {
      var previousVariable, status, _ref1;
      if (batch == null) {
        batch = false;
      }
      _ref1 = this.getVariableStatus(variable), status = _ref1[0], previousVariable = _ref1[1];
      variable["default"] || (variable["default"] = variable.path.match(/\/.pigments$/));
      switch (status) {
        case 'moved':
          previousVariable.range = variable.range;
          previousVariable.bufferRange = variable.bufferRange;
          return void 0;
        case 'updated':
          return this.updateVariable(previousVariable, variable, batch);
        case 'created':
          return this.createVariable(variable, batch);
      }
    };

    VariablesCollection.prototype.addMany = function(variables, batch) {
      var res, results, status, v, variable, _i, _len;
      if (batch == null) {
        batch = false;
      }
      results = {};
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        res = this.add(variable, true);
        if (res != null) {
          status = res[0], v = res[1];
          if (results[status] == null) {
            results[status] = [];
          }
          results[status].push(v);
        }
      }
      if (batch) {
        return results;
      } else {
        return this.emitChangeEvent(this.updateDependencies(results));
      }
    };

    VariablesCollection.prototype.remove = function(variable, batch) {
      var results;
      if (batch == null) {
        batch = false;
      }
      variable = this.find(variable);
      if (variable == null) {
        return;
      }
      this.variables = this.variables.filter(function(v) {
        return v !== variable;
      });
      if (variable.isColor) {
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
      }
      if (batch) {
        return variable;
      } else {
        results = this.updateDependencies({
          destroyed: [variable]
        });
        this.deleteVariableReferences(variable);
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.removeMany = function(variables, batch) {
      var destroyed, results, v, variable, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      destroyed = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        destroyed.push(this.remove(variable, true));
      }
      results = {
        destroyed: destroyed
      };
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          if (v != null) {
            this.deleteVariableReferences(v);
          }
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.deleteVariablesForPaths = function(paths) {
      return this.removeMany(this.getVariablesForPaths(paths));
    };

    VariablesCollection.prototype.deleteVariableReferences = function(variable) {
      var a, dependencies;
      dependencies = this.getVariableDependencies(variable);
      a = this.variablesByPath[variable.path];
      a.splice(a.indexOf(variable), 1);
      a = this.variableNames;
      a.splice(a.indexOf(variable.name), 1);
      this.removeDependencies(variable.name, dependencies);
      return delete this.dependencyGraph[variable.name];
    };

    VariablesCollection.prototype.getContext = function() {
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (registry == null) {
        registry = require('./color-expressions');
      }
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        registry: registry
      });
    };

    VariablesCollection.prototype.evaluateVariables = function(variables, callback) {
      var iteration, remainingVariables, updated;
      updated = [];
      remainingVariables = variables.slice();
      iteration = (function(_this) {
        return function(cb) {
          var end, isColor, start, v, wasColor;
          start = new Date;
          end = new Date;
          while (remainingVariables.length > 0 && end - start < 100) {
            v = remainingVariables.shift();
            wasColor = v.isColor;
            _this.evaluateVariableColor(v, wasColor);
            isColor = v.isColor;
            if (isColor !== wasColor) {
              updated.push(v);
              if (isColor) {
                _this.buildDependencyGraph(v);
              }
              end = new Date;
            }
          }
          if (remainingVariables.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          if (updated.length > 0) {
            _this.emitChangeEvent(_this.updateDependencies({
              updated: updated
            }));
          }
          return typeof callback === "function" ? callback(updated) : void 0;
        };
      })(this));
    };

    VariablesCollection.prototype.updateVariable = function(previousVariable, variable, batch) {
      var added, newDependencies, previousDependencies, removed, _ref1;
      previousDependencies = this.getVariableDependencies(previousVariable);
      previousVariable.value = variable.value;
      previousVariable.range = variable.range;
      previousVariable.bufferRange = variable.bufferRange;
      this.evaluateVariableColor(previousVariable, previousVariable.isColor);
      newDependencies = this.getVariableDependencies(previousVariable);
      _ref1 = this.diffArrays(previousDependencies, newDependencies), removed = _ref1.removed, added = _ref1.added;
      this.removeDependencies(variable.name, removed);
      this.addDependencies(variable.name, added);
      if (batch) {
        return ['updated', previousVariable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          updated: [previousVariable]
        }));
      }
    };

    VariablesCollection.prototype.restoreVariable = function(variable) {
      var _base, _name;
      if (Color == null) {
        Color = require('./color');
      }
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if (variable.isColor) {
        variable.color = new Color(variable.color);
        variable.color.variables = variable.variables;
        this.colorVariables.push(variable);
        delete variable.variables;
      }
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      return this.buildDependencyGraph(variable);
    };

    VariablesCollection.prototype.createVariable = function(variable, batch) {
      var _base, _name;
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      this.evaluateVariableColor(variable);
      this.buildDependencyGraph(variable);
      if (batch) {
        return ['created', variable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          created: [variable]
        }));
      }
    };

    VariablesCollection.prototype.evaluateVariableColor = function(variable, wasColor) {
      var color, context;
      if (wasColor == null) {
        wasColor = false;
      }
      context = this.getContext();
      color = context.readColor(variable.value, true);
      if (color != null) {
        if (wasColor && color.isEqual(variable.color)) {
          return false;
        }
        variable.color = color;
        variable.isColor = true;
        if (__indexOf.call(this.colorVariables, variable) < 0) {
          this.colorVariables.push(variable);
        }
        return true;
      } else if (wasColor) {
        delete variable.color;
        variable.isColor = false;
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
        return true;
      }
    };

    VariablesCollection.prototype.getVariableStatus = function(variable) {
      if (this.variablesByPath[variable.path] == null) {
        return ['created', variable];
      }
      return this.getVariableStatusInCollection(variable, this.variablesByPath[variable.path]);
    };

    VariablesCollection.prototype.getVariableStatusInCollection = function(variable, collection) {
      var status, v, _i, _len;
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        status = this.compareVariables(v, variable);
        switch (status) {
          case 'identical':
            return ['unchanged', v];
          case 'move':
            return ['moved', v];
          case 'update':
            return ['updated', v];
        }
      }
      return ['created', variable];
    };

    VariablesCollection.prototype.compareVariables = function(v1, v2) {
      var sameLine, sameName, sameRange, sameValue;
      sameName = v1.name === v2.name;
      sameValue = v1.value === v2.value;
      sameLine = v1.line === v2.line;
      sameRange = v1.range[0] === v2.range[0] && v1.range[1] === v2.range[1];
      if ((v1.bufferRange != null) && (v2.bufferRange != null)) {
        sameRange && (sameRange = v1.bufferRange.isEqual(v2.bufferRange));
      }
      if (sameName && sameValue) {
        if (sameRange) {
          return 'identical';
        } else {
          return 'move';
        }
      } else if (sameName) {
        if (sameRange || sameLine) {
          return 'update';
        } else {
          return 'different';
        }
      }
    };

    VariablesCollection.prototype.buildDependencyGraph = function(variable) {
      var a, dependencies, dependency, _base, _i, _len, _ref1, _results;
      dependencies = this.getVariableDependencies(variable);
      _results = [];
      for (_i = 0, _len = dependencies.length; _i < _len; _i++) {
        dependency = dependencies[_i];
        a = (_base = this.dependencyGraph)[dependency] != null ? _base[dependency] : _base[dependency] = [];
        if (_ref1 = variable.name, __indexOf.call(a, _ref1) < 0) {
          _results.push(a.push(variable.name));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.getVariableDependencies = function(variable) {
      var dependencies, v, variables, _i, _len, _ref1, _ref2, _ref3;
      dependencies = [];
      if (_ref1 = variable.value, __indexOf.call(this.variableNames, _ref1) >= 0) {
        dependencies.push(variable.value);
      }
      if (((_ref2 = variable.color) != null ? (_ref3 = _ref2.variables) != null ? _ref3.length : void 0 : void 0) > 0) {
        variables = variable.color.variables;
        for (_i = 0, _len = variables.length; _i < _len; _i++) {
          v = variables[_i];
          if (__indexOf.call(dependencies, v) < 0) {
            dependencies.push(v);
          }
        }
      }
      return dependencies;
    };

    VariablesCollection.prototype.collectVariablesByName = function(names) {
      var v, variables, _i, _len, _ref1, _ref2;
      variables = [];
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (_ref2 = v.name, __indexOf.call(names, _ref2) >= 0) {
          variables.push(v);
        }
      }
      return variables;
    };

    VariablesCollection.prototype.removeDependencies = function(from, to) {
      var dependencies, v, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if (dependencies = this.dependencyGraph[v]) {
          dependencies.splice(dependencies.indexOf(from), 1);
          if (dependencies.length === 0) {
            _results.push(delete this.dependencyGraph[v]);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.addDependencies = function(from, to) {
      var v, _base, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if ((_base = this.dependencyGraph)[v] == null) {
          _base[v] = [];
        }
        _results.push(this.dependencyGraph[v].push(from));
      }
      return _results;
    };

    VariablesCollection.prototype.updateDependencies = function(_arg) {
      var created, createdVariableNames, dependencies, destroyed, dirtyVariableNames, dirtyVariables, name, updated, variable, variables, _i, _j, _k, _len, _len1, _len2;
      created = _arg.created, updated = _arg.updated, destroyed = _arg.destroyed;
      this.updateColorVariablesExpression();
      variables = [];
      dirtyVariableNames = [];
      if (created != null) {
        variables = variables.concat(created);
        createdVariableNames = created.map(function(v) {
          return v.name;
        });
      } else {
        createdVariableNames = [];
      }
      if (updated != null) {
        variables = variables.concat(updated);
      }
      if (destroyed != null) {
        variables = variables.concat(destroyed);
      }
      variables = variables.filter(function(v) {
        return v != null;
      });
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        if (dependencies = this.dependencyGraph[variable.name]) {
          for (_j = 0, _len1 = dependencies.length; _j < _len1; _j++) {
            name = dependencies[_j];
            if (__indexOf.call(dirtyVariableNames, name) < 0 && __indexOf.call(createdVariableNames, name) < 0) {
              dirtyVariableNames.push(name);
            }
          }
        }
      }
      dirtyVariables = this.collectVariablesByName(dirtyVariableNames);
      for (_k = 0, _len2 = dirtyVariables.length; _k < _len2; _k++) {
        variable = dirtyVariables[_k];
        if (this.evaluateVariableColor(variable, variable.isColor)) {
          if (updated == null) {
            updated = [];
          }
          updated.push(variable);
        }
      }
      return {
        created: created,
        destroyed: destroyed,
        updated: updated
      };
    };

    VariablesCollection.prototype.emitChangeEvent = function(_arg) {
      var created, destroyed, updated;
      created = _arg.created, destroyed = _arg.destroyed, updated = _arg.updated;
      if ((created != null ? created.length : void 0) || (destroyed != null ? destroyed.length : void 0) || (updated != null ? updated.length : void 0)) {
        this.updateColorVariablesExpression();
        return this.emitter.emit('did-change', {
          created: created,
          destroyed: destroyed,
          updated: updated
        });
      }
    };

    VariablesCollection.prototype.updateColorVariablesExpression = function() {
      var colorVariables;
      if (registry == null) {
        registry = require('./color-expressions');
      }
      colorVariables = this.getColorVariables();
      if (colorVariables.length > 0) {
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        return registry.addExpression(ColorExpression.colorExpressionForColorVariables(colorVariables));
      } else {
        return registry.removeExpression('pigments:variables');
      }
    };

    VariablesCollection.prototype.diffArrays = function(a, b) {
      var added, removed, v, _i, _j, _len, _len1;
      removed = [];
      added = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        v = a[_i];
        if (__indexOf.call(b, v) < 0) {
          removed.push(v);
        }
      }
      for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
        v = b[_j];
        if (__indexOf.call(a, v) < 0) {
          added.push(v);
        }
      }
      return {
        removed: removed,
        added: added
      };
    };

    VariablesCollection.prototype.serialize = function() {
      return {
        deserializer: 'VariablesCollection',
        content: this.variables.map(function(v) {
          var res;
          res = {
            name: v.name,
            value: v.value,
            path: v.path,
            range: v.range,
            line: v.line
          };
          if (v.isAlternate) {
            res.isAlternate = true;
          }
          if (v.noNamePrefix) {
            res.noNamePrefix = true;
          }
          if (v["default"]) {
            res["default"] = true;
          }
          if (v.isColor) {
            res.isColor = true;
            res.color = v.color.serialize();
            if (v.color.variables != null) {
              res.variables = v.color.variables;
            }
          }
          return res;
        })
      };
    };

    return VariablesCollection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGVzLWNvbGxlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBGQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUE0RCxFQUE1RCxFQUFDLGlCQUFELEVBQVUseUJBQVYsRUFBMkIsc0JBQTNCLEVBQXlDLGVBQXpDLEVBQWdELGtCQUFoRCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLENBRlQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG1CQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQSxtQkFBQSxDQUFvQixLQUFwQixFQURRO0lBQUEsQ0FBZCxDQUFBOztBQUFBLElBR0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsbUJBQUMsQ0FBQSxTQUF2QixFQUFrQyxRQUFsQyxFQUE0QztBQUFBLE1BQzFDLEdBQUEsRUFBSyxTQUFBLEdBQUE7ZUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQWQ7TUFBQSxDQURxQztBQUFBLE1BRTFDLFVBQUEsRUFBWSxJQUY4QjtLQUE1QyxDQUhBLENBQUE7O0FBUWEsSUFBQSw2QkFBQyxLQUFELEdBQUE7O1FBQ1gsVUFBVyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7T0FBM0I7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRlgsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxVQUFELGlCQUFZLEtBQUssQ0FBRSxnQkFBbkIsQ0FMQSxDQURXO0lBQUEsQ0FSYjs7QUFBQSxrQ0FnQkEsV0FBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO2FB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variables-collection.coffee
