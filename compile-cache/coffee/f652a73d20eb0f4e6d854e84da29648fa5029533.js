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
      this.variables = [];
      this.variableNames = [];
      this.colorVariables = [];
      this.variablesByPath = {};
      this.dependencyGraph = {};
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGVzLWNvbGxlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBGQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUE0RCxFQUE1RCxFQUFDLGlCQUFELEVBQVUseUJBQVYsRUFBMkIsc0JBQTNCLEVBQXlDLGVBQXpDLEVBQWdELGtCQUFoRCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLENBRlQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG1CQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQSxtQkFBQSxDQUFvQixLQUFwQixFQURRO0lBQUEsQ0FBZCxDQUFBOztBQUFBLElBR0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsbUJBQUMsQ0FBQSxTQUF2QixFQUFrQyxRQUFsQyxFQUE0QztBQUFBLE1BQzFDLEdBQUEsRUFBSyxTQUFBLEdBQUE7ZUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQWQ7TUFBQSxDQURxQztBQUFBLE1BRTFDLFVBQUEsRUFBWSxJQUY4QjtLQUE1QyxDQUhBLENBQUE7O0FBUWEsSUFBQSw2QkFBQyxLQUFELEdBQUE7O1FBQ1gsVUFBVyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7T0FBM0I7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRlgsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUhiLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEVBSmpCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEVBTGxCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxlQUFE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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/variables-collection.coffee
