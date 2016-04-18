(function() {
  var fs, log, os, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  os = require('os');

  path = require('path');

  log = require('./log');

  module.exports = {
    pythonExecutableRe: function() {
      if (/^win/.test(process.platform)) {
        return /^python(\d+(.\d+)?)?\.exe$/;
      } else {
        return /^python(\d+(.\d+)?)?$/;
      }
    },
    possibleGlobalPythonPaths: function() {
      if (/^win/.test(process.platform)) {
        return ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python3.5', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5', "" + (os.homedir()) + "\\AppData\\Local\\Programs\\Python\\Python35-32"];
      } else {
        return ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
      }
    },
    readDir: function(dirPath) {
      try {
        return fs.readdirSync(dirPath);
      } catch (_error) {
        return [];
      }
    },
    isBinary: function(filePath) {
      try {
        fs.accessSync(filePath, fs.X_OK);
        return true;
      } catch (_error) {
        return false;
      }
    },
    lookupInterpreters: function(dirPath) {
      var f, fileName, files, interpreters, matches, potentialInterpreter, _i, _len;
      interpreters = new Set();
      files = this.readDir(dirPath);
      matches = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          if (this.pythonExecutableRe().test(f)) {
            _results.push(f);
          }
        }
        return _results;
      }).call(this);
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        fileName = matches[_i];
        potentialInterpreter = path.join(dirPath, fileName);
        if (this.isBinary(potentialInterpreter)) {
          interpreters.add(potentialInterpreter);
        }
      }
      return interpreters;
    },
    applySubstitutions: function(paths) {
      var modPaths, p, project, projectName, _i, _j, _len, _len1, _ref, _ref1;
      modPaths = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        _ref = atom.project.getPaths();
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          project = _ref[_j];
          _ref1 = project.split(path.sep), projectName = _ref1[_ref1.length - 1];
          p = p.replace(/\$PROJECT_NAME/i, projectName);
          p = p.replace(/\$PROJECT/i, project);
          if (__indexOf.call(modPaths, p) < 0) {
            modPaths.push(p);
          }
        }
      }
      return modPaths;
    },
    getInterpreter: function() {
      var envPath, f, interpreters, p, project, userDefinedPythonPaths, _i, _j, _len, _len1, _ref, _ref1;
      userDefinedPythonPaths = this.applySubstitutions(atom.config.get('autocomplete-python.pythonPaths').split(';'));
      interpreters = new Set((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = userDefinedPythonPaths.length; _i < _len; _i++) {
          p = userDefinedPythonPaths[_i];
          if (this.isBinary(p)) {
            _results.push(p);
          }
        }
        return _results;
      }).call(this));
      if (interpreters.size > 0) {
        log.debug('User defined interpreters found', interpreters);
        return interpreters.keys().next().value;
      }
      log.debug('No user defined interpreter found, trying automatic lookup');
      interpreters = new Set();
      _ref = atom.project.getPaths();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        project = _ref[_i];
        _ref1 = this.readDir(project);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          f = _ref1[_j];
          this.lookupInterpreters(path.join(project, f, 'bin')).forEach(function(i) {
            return interpreters.add(i);
          });
        }
      }
      log.debug('Project level interpreters found', interpreters);
      envPath = (process.env.PATH || '').split(path.delimiter);
      envPath = new Set(envPath.concat(this.possibleGlobalPythonPaths()));
      envPath.forEach((function(_this) {
        return function(potentialPath) {
          return _this.lookupInterpreters(potentialPath).forEach(function(i) {
            return interpreters.add(i);
          });
        };
      })(this));
      log.debug('Total automatically found interpreters', interpreters);
      if (interpreters.size > 0) {
        return interpreters.keys().next().value;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9pbnRlcnByZXRlcnMtbG9va3VwLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGtCQUFBLEVBQW9CLFNBQUEsR0FBQTtBQUNsQixNQUFBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsUUFBcEIsQ0FBSDtBQUNFLGVBQU8sNEJBQVAsQ0FERjtPQUFBLE1BQUE7QUFHRSxlQUFPLHVCQUFQLENBSEY7T0FEa0I7SUFBQSxDQUFwQjtBQUFBLElBTUEseUJBQUEsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLE1BQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxRQUFwQixDQUFIO0FBQ0UsZUFBTyxDQUNMLGVBREssRUFFTCxlQUZLLEVBR0wsZUFISyxFQUlMLHFDQUpLLEVBS0wscUNBTEssRUFNTCxxQ0FOSyxFQU9MLHFDQVBLLEVBUUwscUNBUkssRUFTTCxxQ0FUSyxFQVVMLCtCQVZLLEVBV0wsK0JBWEssRUFZTCwrQkFaSyxFQWFMLEVBQUEsR0FBRSxDQUFDLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBRCxDQUFGLEdBQWdCLGlEQWJYLENBQVAsQ0FERjtPQUFBLE1BQUE7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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/interpreters-lookup.coffee
