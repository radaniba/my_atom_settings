Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _resolveFrom = require('resolve-from');

var _resolveFrom2 = _interopRequireDefault(_resolveFrom);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

'use babel';

var Server = (function () {
  function Server(projectRoot, client) {
    _classCallCheck(this, Server);

    this.client = client;

    this.child = null;

    this.resolves = {};
    this.rejects = {};

    this.projectDir = projectRoot;
    this.distDir = _path2['default'].resolve(__dirname, '../node_modules/tern');

    this.defaultConfig = {

      libs: [],
      loadEagerly: false,
      plugins: {

        doc_comment: true
      },
      ecmaScript: true,
      ecmaVersion: 6,
      dependencyBudget: 20000
    };

    var homeDir = process.env.HOME || process.env.USERPROFILE;

    if (homeDir && _fs2['default'].existsSync(_path2['default'].resolve(homeDir, '.tern-config'))) {

      this.defaultConfig = this.readProjectFile(_path2['default'].resolve(homeDir, '.tern-config'));
    }

    this.projectFileName = '.tern-project';
    this.disableLoadingLocal = false;

    this.init();
  }

  _createClass(Server, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (!this.projectDir) {

        return;
      }

      this.config = this.readProjectFile(_path2['default'].resolve(this.projectDir, this.projectFileName));

      if (!this.config) {

        this.config = this.defaultConfig;
      }

      this.config.async = _atomTernjsPackageConfig2['default'].options.ternServerGetFileAsync;
      this.config.dependencyBudget = _atomTernjsPackageConfig2['default'].options.ternServerDependencyBudget;

      if (!this.config.plugins['doc_comment']) {

        this.config.plugins['doc_comment'] = true;
      }

      var defs = this.findDefs(this.projectDir, this.config);
      var plugins = this.loadPlugins(this.projectDir, this.config);
      var files = [];

      if (this.config.loadEagerly) {

        this.config.loadEagerly.forEach(function (pat) {

          _glob2['default'].sync(pat, { cwd: _this.projectDir }).forEach(function (file) {

            files.push(file);
          });
        });
      }

      this.child = _child_process2['default'].fork(_path2['default'].resolve(__dirname, './atom-ternjs-server-worker.js'));
      this.child.on('message', this.onWorkerMessage.bind(this));
      this.child.on('error', this.onError);
      this.child.on('disconnect', this.onDisconnect);
      this.child.send({

        type: 'init',
        dir: this.projectDir,
        config: this.config,
        defs: defs,
        plugins: plugins,
        files: files
      });
    }
  }, {
    key: 'onError',
    value: function onError(e) {

      try {

        this.child.disconnect();
      } catch (ee) {

        console.warn(ee);
      }

      this.restart('Child process error: ' + e);
    }
  }, {
    key: 'onDisconnect',
    value: function onDisconnect(e) {

      console.warn(e);
    }
  }, {
    key: 'request',
    value: function request(type, data) {
      var _this2 = this;

      var requestID = _nodeUuid2['default'].v1();

      return new Promise(function (resolve, reject) {

        _this2.resolves[requestID] = resolve;
        _this2.rejects[requestID] = reject;

        _this2.child.send({

          type: type,
          id: requestID,
          data: data
        });
      });
    }
  }, {
    key: 'flush',
    value: function flush() {

      this.request('flush', {}).then(function () {

        atom.notifications.addInfo('All files fetched and analyzed.');
      });
    }
  }, {
    key: 'dontLoad',
    value: function dontLoad(file) {

      if (!this.config.dontLoad) {

        return;
      }

      return this.config.dontLoad.some(function (pat) {

        return (0, _minimatch2['default'])(file, pat);
      });
    }
  }, {
    key: 'restart',
    value: function restart(message) {

      atom.notifications.addError(message, {

        dismissable: false
      });

      for (var key in this.rejects) {

        this.rejects[key]({});
      }

      this.resolves = {};
      this.rejects = {};

      _atomTernjsManager2['default'].restartServer();
    }
  }, {
    key: 'onWorkerMessage',
    value: function onWorkerMessage(e) {

      if (e.error && e.error.isUncaughtException) {

        this.restart('UncaughtException: ' + e.error.message + '. Restarting Server...');

        return;
      }

      var isError = e.error !== 'null' && e.error !== 'undefined';

      if (isError) {

        console.error(e);
      }

      if (!e.type && this.resolves[e.id]) {

        if (isError) {

          this.rejects[e.id](e.error);
        } else {

          this.resolves[e.id](e.data);
        }

        delete this.resolves[e.id];
        delete this.rejects[e.id];
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      if (!this.child) {

        return;
      }

      this.child.disconnect();
      this.child = undefined;
    }
  }, {
    key: 'readJSON',
    value: function readJSON(fileName) {

      if ((0, _atomTernjsHelper.fileExists)(fileName) !== undefined) {

        return false;
      }

      var file = _fs2['default'].readFileSync(fileName, 'utf8');

      try {

        return JSON.parse(file);
      } catch (e) {

        atom.notifications.addError('Bad JSON in ' + fileName + ': ' + e.message, {

          dismissable: true
        });
        this.destroy();
      }
    }
  }, {
    key: 'mergeObjects',
    value: function mergeObjects(base, value) {

      if (!base) {

        return value;
      }

      if (!value) {

        return base;
      }

      var result = {};

      for (var prop in base) {

        result[prop] = base[prop];
      }

      for (var prop in value) {

        result[prop] = value[prop];
      }

      return result;
    }
  }, {
    key: 'readProjectFile',
    value: function readProjectFile(fileName) {

      var data = this.readJSON(fileName);

      if (!data) {

        return false;
      }

      for (var option in this.defaultConfig) {

        if (!data.hasOwnProperty(option)) {

          data[option] = this.defaultConfig[option];
        } else if (option === 'plugins') {

          data[option] = this.mergeObjects(this.defaultConfig[option], data[option]);
        }
      }

      return data;
    }
  }, {
    key: 'findFile',
    value: function findFile(file, projectDir, fallbackDir) {

      var local = _path2['default'].resolve(projectDir, file);

      if (!this.disableLoadingLocal && _fs2['default'].existsSync(local)) {

        return local;
      }

      var shared = _path2['default'].resolve(fallbackDir, file);

      if (_fs2['default'].existsSync(shared)) {

        return shared;
      }
    }
  }, {
    key: 'findDefs',
    value: function findDefs(projectDir, config) {

      var defs = [];
      var src = config.libs.slice();

      if (config.ecmaScript && src.indexOf('ecmascript') === -1) {

        src.unshift('ecmascript');
      }

      for (var i = 0; i < src.length; ++i) {

        var file = src[i];

        if (!/\.json$/.test(file)) {

          file = file + '.json';
        }

        var found = this.findFile(file, projectDir, _path2['default'].resolve(this.distDir, 'defs')) || (0, _resolveFrom2['default'])(projectDir, 'tern-' + src[i]);

        if (!found) {

          try {

            found = require.resolve('tern-' + src[i]);
          } catch (e) {

            atom.notifications.addError('Failed to find library ' + src[i] + '\n', {

              dismissable: true
            });
            continue;
          }
        }

        if (found) {

          defs.push(this.readJSON(found));
        }
      }

      return defs;
    }
  }, {
    key: 'loadPlugins',
    value: function loadPlugins(projectDir, config) {

      var plugins = config.plugins;
      var options = {};
      this.config.pluginImports = [];

      for (var plugin in plugins) {

        var val = plugins[plugin];

        if (!val) {

          continue;
        }

        var found = this.findFile(plugin + '.js', projectDir, _path2['default'].resolve(this.distDir, 'plugin')) || (0, _resolveFrom2['default'])(projectDir, 'tern-' + plugin);

        if (!found) {

          try {

            found = require.resolve('tern-' + plugin);
          } catch (e) {

            console.warn(e);
          }
        }

        if (!found) {

          try {

            found = require.resolve(this.projectDir + '/node_modules/tern-' + plugin);
          } catch (e) {

            atom.notifications.addError('Failed to find plugin ' + plugin + '\n', {

              dismissable: true
            });
            continue;
          }
        }

        this.config.pluginImports.push(found);
        options[_path2['default'].basename(plugin)] = val;
      }

      return options;
    }
  }]);

  return Server;
})();

exports['default'] = Server;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXNlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2lDQUVvQix1QkFBdUI7Ozs7Z0NBQ2xCLHNCQUFzQjs7a0JBQ2hDLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFDTixNQUFNOzs7OzZCQUNSLGVBQWU7Ozs7eUJBQ1IsV0FBVzs7Ozt3QkFDaEIsV0FBVzs7OzsyQkFDSixjQUFjOzs7O3VDQUNaLDhCQUE4Qjs7OztBQVh4RCxXQUFXLENBQUM7O0lBYVMsTUFBTTtBQUVkLFdBRlEsTUFBTSxDQUViLFdBQVcsRUFBRSxNQUFNLEVBQUU7MEJBRmQsTUFBTTs7QUFJdkIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXJCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUM7QUFDOUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyxhQUFhLEdBQUc7O0FBRW5CLFVBQUksRUFBRSxFQUFFO0FBQ1IsaUJBQVcsRUFBRSxLQUFLO0FBQ2xCLGFBQU8sRUFBRTs7QUFFUCxtQkFBVyxFQUFFLElBQUk7T0FDbEI7QUFDRCxnQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQVcsRUFBRSxDQUFDO0FBQ2Qsc0JBQWdCLEVBQUUsS0FBSztLQUN4QixDQUFDOztBQUVGLFFBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOztBQUU1RCxRQUFJLE9BQU8sSUFBSSxnQkFB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QztXQUNqQjtTQUNGOztBQUVELFlBQUksQ0FBQyxLQUFLLEVBQUU7O0FBRVYsY0FBSTs7QUFFRixpQkFBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUksSUFBSSxDQUFDLFVBQVUsMkJBQXNCLE1BQU0sQ0FBRyxDQUFDO1dBRTNFLENBQUMsT0FBTyxDQUFDLEVBQUU7O0FBRVYsZ0JBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSw0QkFBMEIsTUFBTSxTQUFNOztBQUUvRCx5QkFBVyxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFDO0FBQ0gscUJBQVM7V0FDVjtTQUNGOztBQUVELFlBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QyxlQUFPLENBQUMsa0JBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO09BQ3RDOztBQUVELGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7U0FwWmtCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLXNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgbWFuYWdlciBmcm9tICcuL2F0b20tdGVybmpzLW1hbmFnZXInO1xuaW1wb3J0IHtmaWxlRXhpc3RzfSBmcm9tICcuL2F0b20tdGVybmpzLWhlbHBlcic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBjcCBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJztcbmltcG9ydCB1dWlkIGZyb20gJ25vZGUtdXVpZCc7XG5pbXBvcnQgcmVzb2x2ZUZyb20gZnJvbSAncmVzb2x2ZS1mcm9tJztcbmltcG9ydCBwYWNrYWdlQ29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtcGFja2FnZS1jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3RSb290LCBjbGllbnQpIHtcblxuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG4gICAgdGhpcy5jaGlsZCA9IG51bGw7XG5cbiAgICB0aGlzLnJlc29sdmVzID0ge307XG4gICAgdGhpcy5yZWplY3RzID0ge307XG5cbiAgICB0aGlzLnByb2plY3REaXIgPSBwcm9qZWN0Um9vdDtcbiAgICB0aGlzLmRpc3REaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vbm9kZV9tb2R1bGVzL3Rlcm4nKTtcblxuICAgIHRoaXMuZGVmYXVsdENvbmZpZyA9IHtcblxuICAgICAgbGliczogW10sXG4gICAgICBsb2FkRWFnZXJseTogZmFsc2UsXG4gICAgICBwbHVnaW5zOiB7XG5cbiAgICAgICAgZG9jX2NvbW1lbnQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBlY21hU2NyaXB0OiB0cnVlLFxuICAgICAgZWNtYVZlcnNpb246IDYsXG4gICAgICBkZXBlbmRlbmN5QnVkZ2V0OiAyMDAwMFxuICAgIH07XG5cbiAgICBjb25zdCBob21lRGlyID0gcHJvY2Vzcy5lbnYuSE9NRSB8fCBwcm9jZXNzLmVudi5VU0VSUFJPRklMRTtcblxuICAgIGlmIChob21lRGlyICYmIGZzLmV4aXN0c1N5bmMocGF0aC5yZXNvbHZlKGhvbWVEaXIsICcudGVybi1jb25maWcnKSkpIHtcblxuICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnID0gdGhpcy5yZWFkUHJvamVjdEZpbGUocGF0aC5yZXNvbHZlKGhvbWVEaXIsICcudGVybi1jb25maWcnKSk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9qZWN0RmlsZU5hbWUgPSAnLnRlcm4tcHJvamVjdCc7XG4gICAgdGhpcy5kaXNhYmxlTG9hZGluZ0xvY2FsID0gZmFsc2U7XG5cbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG5cbiAgICBpZiAoIXRoaXMucHJvamVjdERpcikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLnJlYWRQcm9qZWN0RmlsZShwYXRoLnJlc29sdmUodGhpcy5wcm9qZWN0RGlyLCB0aGlzLnByb2plY3RGaWxlTmFtZSkpO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZykge1xuXG4gICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZGVmYXVsdENvbmZpZztcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZy5hc3luYyA9IHBhY2thZ2VDb25maWcub3B0aW9ucy50ZXJuU2VydmVyR2V0RmlsZUFzeW5jO1xuICAgIHRoaXMuY29uZmlnLmRlcGVuZGVuY3lCdWRnZXQgPSBwYWNrYWdlQ29uZmlnLm9wdGlvbnMudGVyblNlcnZlckRlcGVuZGVuY3lCdWRnZXQ7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLnBsdWdpbnNbJ2RvY19jb21tZW50J10pIHtcblxuICAgICAgdGhpcy5jb25maWcucGx1Z2luc1snZG9jX2NvbW1lbnQnXSA9IHRydWU7XG4gICAgfVxuXG4gICAgbGV0IGRlZnMgPSB0aGlzLmZpbmREZWZzKHRoaXMucHJvamVjdERpciwgdGhpcy5jb25maWcpO1xuICAgIGxldCBwbHVnaW5zID0gdGhpcy5sb2FkUGx1Z2lucyh0aGlzLnByb2plY3REaXIsIHRoaXMuY29uZmlnKTtcbiAgICBsZXQgZmlsZXMgPSBbXTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5sb2FkRWFnZXJseSkge1xuXG4gICAgICB0aGlzLmNvbmZpZy5sb2FkRWFnZXJseS5mb3JFYWNoKChwYXQpID0+IHtcblxuICAgICAgICBnbG9iLnN5bmMocGF0LCB7IGN3ZDogdGhpcy5wcm9qZWN0RGlyIH0pLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuXG4gICAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmNoaWxkID0gY3AuZm9yayhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9hdG9tLXRlcm5qcy1zZXJ2ZXItd29ya2VyLmpzJykpO1xuICAgIHRoaXMuY2hpbGQub24oJ21lc3NhZ2UnLCB0aGlzLm9uV29ya2VyTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmNoaWxkLm9uKCdlcnJvcicsIHRoaXMub25FcnJvcik7XG4gICAgdGhpcy5jaGlsZC5vbignZGlzY29ubmVjdCcsIHRoaXMub25EaXNjb25uZWN0KTtcbiAgICB0aGlzLmNoaWxkLnNlbmQoe1xuXG4gICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICBkaXI6IHRoaXMucHJvamVjdERpcixcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBkZWZzOiBkZWZzLFxuICAgICAgcGx1Z2luczogcGx1Z2lucyxcbiAgICAgIGZpbGVzOiBmaWxlc1xuICAgIH0pO1xuICB9XG5cbiAgb25FcnJvcihlKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICB0aGlzLmNoaWxkLmRpc2Nvbm5lY3QoKTtcblxuICAgIH0gY2F0Y2ggKGVlKSB7XG5cbiAgICAgIGNvbnNvbGUud2FybihlZSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZXN0YXJ0KGBDaGlsZCBwcm9jZXNzIGVycm9yOiAke2V9YCk7XG4gIH1cblxuICBvbkRpc2Nvbm5lY3QoZSkge1xuXG4gICAgY29uc29sZS53YXJuKGUpO1xuICB9XG5cbiAgcmVxdWVzdCh0eXBlLCBkYXRhKSB7XG5cbiAgICBsZXQgcmVxdWVzdElEID0gdXVpZC52MSgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgdGhpcy5yZXNvbHZlc1tyZXF1ZXN0SURdID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMucmVqZWN0c1tyZXF1ZXN0SURdID0gcmVqZWN0O1xuXG4gICAgICB0aGlzLmNoaWxkLnNlbmQoe1xuXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGlkOiByZXF1ZXN0SUQsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZmx1c2goKSB7XG5cbiAgICB0aGlzLnJlcXVlc3QoJ2ZsdXNoJywge30pLnRoZW4oKCkgPT4ge1xuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQWxsIGZpbGVzIGZldGNoZWQgYW5kIGFuYWx5emVkLicpO1xuICAgIH0pO1xuICB9XG5cbiAgZG9udExvYWQoZmlsZSkge1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5kb250TG9hZCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmRvbnRMb2FkLnNvbWUoKHBhdCkgPT4ge1xuXG4gICAgICByZXR1cm4gbWluaW1hdGNoKGZpbGUsIHBhdCk7XG4gICAgfSk7XG4gIH1cblxuICByZXN0YXJ0KG1lc3NhZ2UpIHtcblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7XG5cbiAgICAgIGRpc21pc3NhYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5yZWplY3RzKSB7XG5cbiAgICAgIHRoaXMucmVqZWN0c1trZXldKHt9KTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc29sdmVzID0ge307XG4gICAgdGhpcy5yZWplY3RzID0ge307XG5cbiAgICBtYW5hZ2VyLnJlc3RhcnRTZXJ2ZXIoKTtcbiAgfVxuXG4gIG9uV29ya2VyTWVzc2FnZShlKSB7XG5cbiAgICBpZiAoZS5lcnJvciAmJiBlLmVycm9yLmlzVW5jYXVnaHRFeGNlcHRpb24pIHtcblxuICAgICAgdGhpcy5yZXN0YXJ0KGBVbmNhdWdodEV4Y2VwdGlvbjogJHtlLmVycm9yLm1lc3NhZ2V9LiBSZXN0YXJ0aW5nIFNlcnZlci4uLmApO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXNFcnJvciA9IGUuZXJyb3IgIT09ICdudWxsJyAmJiBlLmVycm9yICE9PSAndW5kZWZpbmVkJztcblxuICAgIGlmIChpc0Vycm9yKSB7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuXG4gICAgaWYgKCFlLnR5cGUgJiYgdGhpcy5yZXNvbHZlc1tlLmlkXSkge1xuXG4gICAgICBpZiAoaXNFcnJvcikge1xuXG4gICAgICAgIHRoaXMucmVqZWN0c1tlLmlkXShlLmVycm9yKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLnJlc29sdmVzW2UuaWRdKGUuZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSB0aGlzLnJlc29sdmVzW2UuaWRdO1xuICAgICAgZGVsZXRlIHRoaXMucmVqZWN0c1tlLmlkXTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgaWYgKCF0aGlzLmNoaWxkKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNoaWxkLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmNoaWxkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmVhZEpTT04oZmlsZU5hbWUpIHtcblxuICAgIGlmIChmaWxlRXhpc3RzKGZpbGVOYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlTmFtZSwgJ3V0ZjgnKTtcblxuICAgIHRyeSB7XG5cbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpbGUpO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEJhZCBKU09OIGluICR7ZmlsZU5hbWV9OiAke2UubWVzc2FnZX1gLCB7XG5cbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgbWVyZ2VPYmplY3RzKGJhc2UsIHZhbHVlKSB7XG5cbiAgICBpZiAoIWJhc2UpIHtcblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHtcblxuICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIGJhc2UpIHtcblxuICAgICAgcmVzdWx0W3Byb3BdID0gYmFzZVtwcm9wXTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdmFsdWUpIHtcblxuICAgICAgcmVzdWx0W3Byb3BdID0gdmFsdWVbcHJvcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJlYWRQcm9qZWN0RmlsZShmaWxlTmFtZSkge1xuXG4gICAgbGV0IGRhdGEgPSB0aGlzLnJlYWRKU09OKGZpbGVOYW1lKTtcblxuICAgIGlmICghZGF0YSkge1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgb3B0aW9uIGluIHRoaXMuZGVmYXVsdENvbmZpZykge1xuXG4gICAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkob3B0aW9uKSkge1xuXG4gICAgICAgIGRhdGFbb3B0aW9uXSA9IHRoaXMuZGVmYXVsdENvbmZpZ1tvcHRpb25dO1xuXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbiA9PT0gJ3BsdWdpbnMnKSB7XG5cbiAgICAgICAgZGF0YVtvcHRpb25dID0gdGhpcy5tZXJnZU9iamVjdHModGhpcy5kZWZhdWx0Q29uZmlnW29wdGlvbl0sIGRhdGFbb3B0aW9uXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBmaW5kRmlsZShmaWxlLCBwcm9qZWN0RGlyLCBmYWxsYmFja0Rpcikge1xuXG4gICAgbGV0IGxvY2FsID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXIsIGZpbGUpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVMb2FkaW5nTG9jYWwgJiYgZnMuZXhpc3RzU3luYyhsb2NhbCkpIHtcblxuICAgICAgcmV0dXJuIGxvY2FsO1xuICAgIH1cblxuICAgIGxldCBzaGFyZWQgPSBwYXRoLnJlc29sdmUoZmFsbGJhY2tEaXIsIGZpbGUpO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2hhcmVkKSkge1xuXG4gICAgICByZXR1cm4gc2hhcmVkO1xuICAgIH1cbiAgfVxuXG4gIGZpbmREZWZzKHByb2plY3REaXIsIGNvbmZpZykge1xuXG4gICAgbGV0IGRlZnMgPSBbXTtcbiAgICBsZXQgc3JjID0gY29uZmlnLmxpYnMuc2xpY2UoKTtcblxuICAgIGlmIChjb25maWcuZWNtYVNjcmlwdCAmJiBzcmMuaW5kZXhPZignZWNtYXNjcmlwdCcpID09PSAtMSkge1xuXG4gICAgICBzcmMudW5zaGlmdCgnZWNtYXNjcmlwdCcpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3JjLmxlbmd0aDsgKytpKSB7XG5cbiAgICAgIGxldCBmaWxlID0gc3JjW2ldO1xuXG4gICAgICBpZiAoIS9cXC5qc29uJC8udGVzdChmaWxlKSkge1xuXG4gICAgICAgIGZpbGUgPSBgJHtmaWxlfS5qc29uYDtcbiAgICAgIH1cblxuICAgICAgbGV0IGZvdW5kID1cbiAgICAgICAgdGhpcy5maW5kRmlsZShmaWxlLCBwcm9qZWN0RGlyLCBwYXRoLnJlc29sdmUodGhpcy5kaXN0RGlyLCAnZGVmcycpKSB8fFxuICAgICAgICByZXNvbHZlRnJvbShwcm9qZWN0RGlyLCBgdGVybi0ke3NyY1tpXX1gKVxuICAgICAgICA7XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYHRlcm4tJHtzcmNbaV19YCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBGYWlsZWQgdG8gZmluZCBsaWJyYXJ5ICR7c3JjW2ldfVxcbmAsIHtcblxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZm91bmQpIHtcblxuICAgICAgICBkZWZzLnB1c2godGhpcy5yZWFkSlNPTihmb3VuZCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWZzO1xuICB9XG5cbiAgbG9hZFBsdWdpbnMocHJvamVjdERpciwgY29uZmlnKSB7XG5cbiAgICBsZXQgcGx1Z2lucyA9IGNvbmZpZy5wbHVnaW5zO1xuICAgIGxldCBvcHRpb25zID0ge307XG4gICAgdGhpcy5jb25maWcucGx1Z2luSW1wb3J0cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgcGx1Z2luIGluIHBsdWdpbnMpIHtcblxuICAgICAgbGV0IHZhbCA9IHBsdWdpbnNbcGx1Z2luXTtcblxuICAgICAgaWYgKCF2YWwpIHtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGZvdW5kID1cbiAgICAgICAgdGhpcy5maW5kRmlsZShgJHtwbHVnaW59LmpzYCwgcHJvamVjdERpciwgcGF0aC5yZXNvbHZlKHRoaXMuZGlzdERpciwgJ3BsdWdpbicpKSB8fFxuICAgICAgICByZXNvbHZlRnJvbShwcm9qZWN0RGlyLCBgdGVybi0ke3BsdWdpbn1gKVxuICAgICAgICA7XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYHRlcm4tJHtwbHVnaW59YCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYCR7dGhpcy5wcm9qZWN0RGlyfS9ub2RlX21vZHVsZXMvdGVybi0ke3BsdWdpbn1gKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBmaW5kIHBsdWdpbiAke3BsdWdpbn1cXG5gLCB7XG5cbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jb25maWcucGx1Z2luSW1wb3J0cy5wdXNoKGZvdW5kKTtcbiAgICAgIG9wdGlvbnNbcGF0aC5iYXNlbmFtZShwbHVnaW4pXSA9IHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfVxufVxuIl19