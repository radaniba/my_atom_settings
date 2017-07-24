Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atomTernjsDocumentation = require('./atom-ternjs-documentation');

var _atomTernjsDocumentation2 = _interopRequireDefault(_atomTernjsDocumentation);

var _atomTernjsReference = require('./atom-ternjs-reference');

var _atomTernjsReference2 = _interopRequireDefault(_atomTernjsReference);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsType = require('./atom-ternjs-type');

var _atomTernjsType2 = _interopRequireDefault(_atomTernjsType);

var _atomTernjsConfig = require('./atom-ternjs-config');

var _atomTernjsConfig2 = _interopRequireDefault(_atomTernjsConfig);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _atomTernjsProvider = require('./atom-ternjs-provider');

var _atomTernjsProvider2 = _interopRequireDefault(_atomTernjsProvider);

var _atomTernjsRename = require('./atom-ternjs-rename');

var _atomTernjsRename2 = _interopRequireDefault(_atomTernjsRename);

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

'use babel';

var Server = require('./atom-ternjs-server');
var Client = require('./atom-ternjs-client');

var Manager = (function () {
  function Manager() {
    _classCallCheck(this, Manager);

    this.initCalled = false;
    this.initialised = false;

    this.disposables = [];
    this.grammars = ['JavaScript', 'Babel ES6 JavaScript'];

    this.clients = [];
    this.client = undefined;
    this.servers = [];
    this.server = undefined;

    this.editors = [];
  }

  _createClass(Manager, [{
    key: 'init',
    value: function init() {
      var _this = this;

      _atomTernjsPackageConfig2['default'].registerEvents();
      this.initServers();

      this.disposables.push(atom.project.onDidChangePaths(function (paths) {

        _this.destroyServer(paths);
        _this.checkPaths(paths);
        _this.setActiveServerAndClient();
      }));

      this.initCalled = true;
    }
  }, {
    key: 'activate',
    value: function activate() {

      this.initialised = true;
      this.registerEvents();
      this.registerCommands();
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);

      for (var server of this.servers) {

        server.destroy();
        server = undefined;
      }
      this.servers = [];
      this.clients = [];

      this.server = undefined;
      this.client = undefined;

      _atomTernjsDocumentation2['default'] && _atomTernjsDocumentation2['default'].destroy();
      _atomTernjsReference2['default'] && _atomTernjsReference2['default'].destroy();
      _atomTernjsType2['default'] && _atomTernjsType2['default'].destroy();
      _atomTernjsPackageConfig2['default'] && _atomTernjsPackageConfig2['default'].destroy();
      _atomTernjsRename2['default'] && _atomTernjsRename2['default'].destroy();
      _atomTernjsConfig2['default'] && _atomTernjsConfig2['default'].destroy();
      _atomTernjsProvider2['default'] && _atomTernjsProvider2['default'].destroy();

      this.initialised = false;
      this.initCalled = false;
    }
  }, {
    key: 'initServers',
    value: function initServers() {
      var _this2 = this;

      var projectDirectories = atom.project.getDirectories();

      projectDirectories.forEach(function (projectDirectory) {

        var directory = atom.project.relativizePath(projectDirectory.path)[0];

        if ((0, _atomTernjsHelper.isDirectory)(directory)) {

          _this2.startServer(directory);
        }
      });
    }
  }, {
    key: 'startServer',
    value: function startServer(dir) {

      if (this.getServerForProject(dir)) {

        return;
      }

      var client = this.getClientForProject(dir);

      if (!client) {

        var clientIdx = this.clients.push(new Client(dir)) - 1;
        client = this.clients[clientIdx];
      }

      this.servers.push(new Server(dir, client));

      if (this.servers.length === this.clients.length) {

        if (!this.initialised) {

          this.activate();
        }

        this.setActiveServerAndClient(dir);
      }
    }
  }, {
    key: 'setActiveServerAndClient',
    value: function setActiveServerAndClient(URI) {

      if (!URI) {

        var activePane = atom.workspace.getActivePaneItem();

        if (activePane && activePane.getURI) {

          URI = activePane.getURI();
        } else {

          this.server = undefined;
          this.client = undefined;

          return;
        }
      }

      var dir = atom.project.relativizePath(URI)[0];
      var server = this.getServerForProject(dir);
      var client = this.getClientForProject(dir);

      if (server && client) {

        this.server = server;
        _atomTernjsConfig2['default'].gatherData();
        this.client = client;
      } else {

        this.server = undefined;
        _atomTernjsConfig2['default'].clear();
        this.client = undefined;
      }
    }
  }, {
    key: 'checkPaths',
    value: function checkPaths(paths) {

      for (var path of paths) {

        var dir = atom.project.relativizePath(path)[0];

        if ((0, _atomTernjsHelper.isDirectory)(dir)) {

          this.startServer(dir);
        }
      }
    }
  }, {
    key: 'destroyServer',
    value: function destroyServer(paths) {

      if (this.servers.length === 0) {

        return;
      }

      var serverIdx = undefined;

      for (var i = 0; i < this.servers.length; i++) {

        if (paths.indexOf(this.servers[i].projectDir) === -1) {

          serverIdx = i;
          break;
        }
      }

      if (serverIdx === undefined) {

        return;
      }

      var server = this.servers[serverIdx];
      var client = this.getClientForProject(server.projectDir);
      client = undefined;

      server.destroy();
      server = undefined;

      this.servers.splice(serverIdx, 1);
    }
  }, {
    key: 'getServerForProject',
    value: function getServerForProject(projectDir) {

      for (var server of this.servers) {

        if (server.projectDir === projectDir) {

          return server;
        }
      }

      return false;
    }
  }, {
    key: 'getClientForProject',
    value: function getClientForProject(projectDir) {

      for (var client of this.clients) {

        if (client.projectDir === projectDir) {

          return client;
        }
      }

      return false;
    }
  }, {
    key: 'getEditor',
    value: function getEditor(editor) {

      for (var _editor of this.editors) {

        if (_editor.id === editor.id) {

          return _editor;
        }
      }
    }
  }, {
    key: 'isValidEditor',
    value: function isValidEditor(editor) {

      if (!editor || !editor.getGrammar || editor.mini) {

        return;
      }

      if (!editor.getGrammar()) {

        return;
      }

      if (this.grammars.indexOf(editor.getGrammar().name) === -1) {

        return false;
      }

      return true;
    }
  }, {
    key: 'onDidChangeCursorPosition',
    value: function onDidChangeCursorPosition(editor, e) {

      if (_atomTernjsPackageConfig2['default'].options.inlineFnCompletion) {

        _atomTernjsType2['default'].queryType(editor, e.cursor);
      }
    }
  }, {
    key: 'registerEvents',
    value: function registerEvents() {
      var _this3 = this;

      this.disposables.push(atom.workspace.observeTextEditors(function (editor) {

        if (!_this3.isValidEditor(editor)) {

          return;
        }

        // Register valid editor
        _this3.editors.push({

          id: editor.id,
          diffs: []
        });

        if (!_this3.initCalled) {

          _this3.init();
        }

        _this3.disposables.push(editor.onDidChangeCursorPosition(function (e) {

          _atomTernjsEvents2['default'].emit('type-destroy-overlay');
          _atomTernjsEvents2['default'].emit('documentation-destroy-overlay');
        }));

        _this3.disposables.push(editor.onDidChangeCursorPosition((0, _underscorePlus.debounce)(_this3.onDidChangeCursorPosition.bind(_this3, editor), 300)));

        _this3.disposables.push(editor.getBuffer().onDidSave(function (e) {

          if (_this3.client) {

            _this3.client.update(editor);
          }
        }));

        _this3.disposables.push(editor.getBuffer().onDidChange(function (e) {

          _this3.getEditor(editor).diffs.push(e);
        }));
      }));

      this.disposables.push(atom.workspace.onDidChangeActivePaneItem(function (item) {

        _atomTernjsEvents2['default'].emit('config-clear');
        _atomTernjsEvents2['default'].emit('type-destroy-overlay');
        _atomTernjsEvents2['default'].emit('documentation-destroy-overlay');
        _atomTernjsEvents2['default'].emit('rename-hide');

        if (!_this3.isValidEditor(item)) {

          _atomTernjsEvents2['default'].emit('reference-hide');
        } else {

          _this3.setActiveServerAndClient(item.getURI());
        }
      }));
    }
  }, {
    key: 'registerCommands',
    value: function registerCommands() {
      var _this4 = this;

      this.disposables.push(atom.commands.add('atom-text-editor', 'core:cancel', function (e) {

        _atomTernjsEvents2['default'].emit('config-clear');
        _atomTernjsEvents2['default'].emit('type-destroy-overlay');
        _atomTernjsEvents2['default'].emit('documentation-destroy-overlay');
        _atomTernjsEvents2['default'].emit('reference-hide');
        _atomTernjsEvents2['default'].emit('rename-hide');
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:listFiles', function (e) {

        if (_this4.client) {

          _this4.client.files().then(function (data) {

            console.dir(data);
          });
        }
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:flush', function (e) {

        if (_this4.server) {

          _this4.server.flush();
        }
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:navigateBack', function (e) {

        _servicesNavigation2['default'].goTo(-1);
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:navigateForward', function (e) {

        _servicesNavigation2['default'].goTo(1);
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:definition', function (e) {

        if (_this4.client) {

          _this4.client.definition();
        }
      }));

      this.disposables.push(atom.commands.add('atom-workspace', 'atom-ternjs:restart', function (e) {

        _this4.restartServer();
      }));
    }
  }, {
    key: 'restartServer',
    value: function restartServer() {

      if (!this.server) {

        return;
      }

      var dir = this.server.projectDir;
      var serverIdx = undefined;

      for (var i = 0; i < this.servers.length; i++) {

        if (dir === this.servers[i].projectDir) {

          serverIdx = i;
          break;
        }
      }

      if (this.server) {

        this.server.destroy();
      }

      this.server = undefined;
      this.servers.splice(serverIdx, 1);
      this.startServer(dir);
    }
  }]);

  return Manager;
})();

exports['default'] = new Manager();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs4QkFLdUIsaUJBQWlCOztnQ0FDcEIsc0JBQXNCOzs7O3VDQUNoQiw2QkFBNkI7Ozs7bUNBQ2pDLHlCQUF5Qjs7Ozt1Q0FDckIsOEJBQThCOzs7OzhCQUN2QyxvQkFBb0I7Ozs7Z0NBQ2xCLHNCQUFzQjs7OztnQ0FJbEMsc0JBQXNCOztrQ0FDUix3QkFBd0I7Ozs7Z0NBQzFCLHNCQUFzQjs7OztrQ0FDbEIsdUJBQXVCOzs7O0FBbEI5QyxXQUFXLENBQUM7O0FBRVosSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDL0MsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7O0lBaUJ6QyxPQUFPO0FBRUEsV0FGUCxPQUFPLEdBRUc7MEJBRlYsT0FBTzs7QUFJVCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzs7QUFFekIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUNkLFlBQVksRUFDWixzQkFBc0IsQ0FDdkIsQ0FBQzs7QUFFRixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7R0FDbkI7O2VBbkJHLE9BQU87O1dBcUJQLGdCQUFHOzs7QUFFTCwyQ0FBYyxjQUFjLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRW5CLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBQyxLQUFLLEVBQUs7O0FBRTdELGNBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLGNBQUssVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLGNBQUssd0JBQXdCLEVBQUUsQ0FBQztPQUNqQyxDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztLQUN4Qjs7O1dBRU8sb0JBQUc7O0FBRVQsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFTSxtQkFBRzs7QUFFUix3Q0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRTdCLFdBQUssSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTs7QUFFL0IsY0FBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pCLGNBQU0sR0FBRyxTQUFTLENBQUM7T0FDcEI7QUFDRCxVQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDeEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7O0FBRXhCLDhDQUFpQixxQ0FBYyxPQUFPLEVBQUUsQ0FBQztBQUN6QywwQ0FBYSxpQ0FBVSxPQUFPLEVBQUUsQ0FBQztBQUNqQyxxQ0FBUSw0QkFBSyxPQUFPLEVBQUUsQ0FBQztBQUN2Qiw4Q0FBaUIscUNBQWMsT0FBTyxFQUFFLENBQUM7QUFDekMsdUNBQVUsOEJBQU8sT0FBTyxFQUFFLENBQUM7QUFDM0IsdUNBQVUsOEJBQU8sT0FBTyxFQUFFLENBQUM7QUFDM0IseUNBQVksZ0NBQVMsT0FBTyxFQUFFLENBQUM7O0FBRS9CLFVBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0tBQ3pCOzs7V0FFVSx1QkFBRzs7O0FBRVosVUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV6RCx3QkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxnQkFBZ0IsRUFBSzs7QUFFL0MsWUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXhFLFlBQUksbUNBQVksU0FBUyxDQUFDLEVBQUU7O0FBRTFCLGlCQUFLLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3QjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFVSxxQkFBQyxHQUFHLEVBQUU7O0FBRWYsVUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7O0FBRWpDLGVBQU87T0FDUjs7QUFFRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTNDLFVBQUksQ0FBQyxNQUFNLEVBQUU7O0FBRVgsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkQsY0FBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDbEM7O0FBRUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0FBRTNDLFVBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7O0FBRS9DLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFOztBQUVyQixjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDakI7O0FBRUQsWUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3BDO0tBQ0Y7OztXQUV1QixrQ0FBQyxHQUFHLEVBQUU7O0FBRTVCLFVBQUksQ0FBQyxHQUFHLEVBQUU7O0FBRVIsWUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUVwRCxZQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFOztBQUVuQyxhQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBRTNCLE1BQU07O0FBRUwsY0FBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDeEIsY0FBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7O0FBRXhCLGlCQUFPO1NBQ1I7T0FDRjs7QUFFRCxVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUUzQyxVQUFJLE1BQU0sSUFBSSxNQUFNLEVBQUU7O0FBRXBCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLHNDQUFPLFVBQVUsRUFBRSxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO09BRXRCLE1BQU07O0FBRUwsWUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDeEIsc0NBQU8sS0FBSyxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztPQUN6QjtLQUNGOzs7V0FFUyxvQkFBQyxLQUFLLEVBQUU7O0FBRWhCLFdBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFOztBQUV0QixZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFL0MsWUFBSSxtQ0FBWSxHQUFHLENBQUMsRUFBRTs7QUFFcEIsY0FBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QjtPQUNGO0tBQ0Y7OztXQUVZLHVCQUFDLEtBQUssRUFBRTs7QUFFbkIsVUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRTdCLGVBQU87T0FDUjs7QUFFRCxVQUFJLFNBQVMsWUFBQSxDQUFDOztBQUVkLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7QUFFNUMsWUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7O0FBRXBELG1CQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsZ0JBQU07U0FDUDtPQUNGOztBQUVELFVBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTs7QUFFM0IsZUFBTztPQUNSOztBQUVELFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckMsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6RCxZQUFNLEdBQUcsU0FBUyxDQUFDOztBQUVuQixZQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakIsWUFBTSxHQUFHLFNBQVMsQ0FBQzs7QUFFbkIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFa0IsNkJBQUMsVUFBVSxFQUFFOztBQUU5QixXQUFLLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRS9CLFlBQUksTUFBTSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7O0FBRXBDLGlCQUFPLE1BQU0sQ0FBQztTQUNmO09BQ0Y7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1dBRWtCLDZCQUFDLFVBQVUsRUFBRTs7QUFFOUIsV0FBSyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUUvQixZQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFOztBQUVwQyxpQkFBTyxNQUFNLENBQUM7U0FDZjtPQUNGOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztXQUVRLG1CQUFDLE1BQU0sRUFBRTs7QUFFaEIsV0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUVoQyxZQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRTs7QUFFNUIsaUJBQU8sT0FBTyxDQUFDO1NBQ2hCO09BQ0Y7S0FDRjs7O1dBRVksdUJBQUMsTUFBTSxFQUFFOztBQUVwQixVQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFOztBQUVoRCxlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRTs7QUFFeEIsZUFBTztPQUNSOztBQUVELFVBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFOztBQUUxRCxlQUFPLEtBQUssQ0FBQztPQUNkOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUV3QixtQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFOztBQUVuQyxVQUFJLHFDQUFjLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTs7QUFFNUMsb0NBQUssU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEM7S0FDRjs7O1dBRWEsMEJBQUc7OztBQUVmLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBQyxNQUFNLEVBQUs7O0FBRWxFLFlBQUksQ0FBQyxPQUFLLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTs7QUFFL0IsaUJBQU87U0FDUjs7O0FBR0QsZUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDOztBQUVoQixZQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7QUFDYixlQUFLLEVBQUUsRUFBRTtTQUNWLENBQUMsQ0FBQzs7QUFFSCxZQUFJLENBQUMsT0FBSyxVQUFVLEVBQUU7O0FBRXBCLGlCQUFLLElBQUksRUFBRSxDQUFDO1NBQ2I7O0FBRUQsZUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxVQUFDLENBQUMsRUFBSzs7QUFFNUQsd0NBQVEsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDckMsd0NBQVEsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDL0MsQ0FBQyxDQUFDLENBQUM7O0FBRUosZUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyw4QkFBUyxPQUFLLHlCQUF5QixDQUFDLElBQUksU0FBTyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTFILGVBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQUMsQ0FBQyxFQUFLOztBQUV4RCxjQUFJLE9BQUssTUFBTSxFQUFFOztBQUVmLG1CQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDNUI7U0FDRixDQUFDLENBQUMsQ0FBQzs7QUFFSixlQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFDLENBQUMsRUFBSzs7QUFFMUQsaUJBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEMsQ0FBQyxDQUFDLENBQUM7T0FDTCxDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLFVBQUMsSUFBSSxFQUFLOztBQUV2RSxzQ0FBUSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDN0Isc0NBQVEsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDckMsc0NBQVEsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDOUMsc0NBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUU1QixZQUFJLENBQUMsT0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7O0FBRTdCLHdDQUFRLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBRWhDLE1BQU07O0FBRUwsaUJBQUssd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDOUM7T0FDRixDQUFDLENBQUMsQ0FBQztLQUNMOzs7V0FFZSw0QkFBRzs7O0FBRWpCLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxVQUFDLENBQUMsRUFBSzs7QUFFaEYsc0NBQVEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdCLHNDQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3JDLHNDQUFRLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzlDLHNDQUFRLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQy9CLHNDQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSx1QkFBdUIsRUFBRSxVQUFDLENBQUMsRUFBSzs7QUFFMUYsWUFBSSxPQUFLLE1BQU0sRUFBRTs7QUFFZixpQkFBSyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxFQUFLOztBQUVqQyxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztXQUNuQixDQUFDLENBQUM7U0FDSjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLG1CQUFtQixFQUFFLFVBQUMsQ0FBQyxFQUFLOztBQUV0RixZQUFJLE9BQUssTUFBTSxFQUFFOztBQUVmLGlCQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixFQUFFLFVBQUMsQ0FBQyxFQUFLOztBQUU3Rix3Q0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNyQixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSw2QkFBNkIsRUFBRSxVQUFDLENBQUMsRUFBSzs7QUFFaEcsd0NBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3BCLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLHdCQUF3QixFQUFFLFVBQUMsQ0FBQyxFQUFLOztBQUUzRixZQUFJLE9BQUssTUFBTSxFQUFFOztBQUVmLGlCQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUMxQjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLFVBQUMsQ0FBQyxFQUFLOztBQUV0RixlQUFLLGFBQWEsRUFBRSxDQUFDO09BQ3RCLENBQUMsQ0FBQyxDQUFDO0tBQ0w7OztXQUVZLHlCQUFHOztBQUVkLFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFOztBQUVoQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDakMsVUFBSSxTQUFTLFlBQUEsQ0FBQzs7QUFFZCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0FBRTVDLFlBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFOztBQUV0QyxtQkFBUyxHQUFHLENBQUMsQ0FBQztBQUNkLGdCQUFNO1NBQ1A7T0FDRjs7QUFFRCxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O0FBRWYsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN2Qjs7QUFFRCxVQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN4QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN2Qjs7O1NBblpHLE9BQU87OztxQkFzWkUsSUFBSSxPQUFPLEVBQUUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuL2F0b20tdGVybmpzLXNlcnZlcicpO1xuY29uc3QgQ2xpZW50ID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1jbGllbnQnKTtcblxuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcbmltcG9ydCBlbWl0dGVyIGZyb20gJy4vYXRvbS10ZXJuanMtZXZlbnRzJztcbmltcG9ydCBkb2N1bWVudGF0aW9uIGZyb20gJy4vYXRvbS10ZXJuanMtZG9jdW1lbnRhdGlvbic7XG5pbXBvcnQgcmVmZXJlbmNlIGZyb20gJy4vYXRvbS10ZXJuanMtcmVmZXJlbmNlJztcbmltcG9ydCBwYWNrYWdlQ29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtcGFja2FnZS1jb25maWcnO1xuaW1wb3J0IHR5cGUgZnJvbSAnLi9hdG9tLXRlcm5qcy10eXBlJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9hdG9tLXRlcm5qcy1jb25maWcnO1xuaW1wb3J0IHtcbiAgaXNEaXJlY3RvcnksXG4gIGRpc3Bvc2VBbGxcbn0gZnJvbSAnLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuaW1wb3J0IHByb3ZpZGVyIGZyb20gJy4vYXRvbS10ZXJuanMtcHJvdmlkZXInO1xuaW1wb3J0IHJlbmFtZSBmcm9tICcuL2F0b20tdGVybmpzLXJlbmFtZSc7XG5pbXBvcnQgbmF2aWdhdGlvbiBmcm9tICcuL3NlcnZpY2VzL25hdmlnYXRpb24nO1xuXG5jbGFzcyBNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuaW5pdENhbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGlzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcbiAgICB0aGlzLmdyYW1tYXJzID0gW1xuICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgJ0JhYmVsIEVTNiBKYXZhU2NyaXB0J1xuICAgIF07XG5cbiAgICB0aGlzLmNsaWVudHMgPSBbXTtcbiAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNlcnZlcnMgPSBbXTtcbiAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuZWRpdG9ycyA9IFtdO1xuICB9XG5cbiAgaW5pdCgpIHtcblxuICAgIHBhY2thZ2VDb25maWcucmVnaXN0ZXJFdmVudHMoKTtcbiAgICB0aGlzLmluaXRTZXJ2ZXJzKCk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKHBhdGhzKSA9PiB7XG5cbiAgICAgIHRoaXMuZGVzdHJveVNlcnZlcihwYXRocyk7XG4gICAgICB0aGlzLmNoZWNrUGF0aHMocGF0aHMpO1xuICAgICAgdGhpcy5zZXRBY3RpdmVTZXJ2ZXJBbmRDbGllbnQoKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmluaXRDYWxsZWQgPSB0cnVlO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG5cbiAgICB0aGlzLmluaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG4gICAgdGhpcy5yZWdpc3RlckNvbW1hbmRzKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgZGlzcG9zZUFsbCh0aGlzLmRpc3Bvc2FibGVzKTtcblxuICAgIGZvciAobGV0IHNlcnZlciBvZiB0aGlzLnNlcnZlcnMpIHtcblxuICAgICAgc2VydmVyLmRlc3Ryb3koKTtcbiAgICAgIHNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5zZXJ2ZXJzID0gW107XG4gICAgdGhpcy5jbGllbnRzID0gW107XG5cbiAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcblxuICAgIGRvY3VtZW50YXRpb24gJiYgZG9jdW1lbnRhdGlvbi5kZXN0cm95KCk7XG4gICAgcmVmZXJlbmNlICYmIHJlZmVyZW5jZS5kZXN0cm95KCk7XG4gICAgdHlwZSAmJiB0eXBlLmRlc3Ryb3koKTtcbiAgICBwYWNrYWdlQ29uZmlnICYmIHBhY2thZ2VDb25maWcuZGVzdHJveSgpO1xuICAgIHJlbmFtZSAmJiByZW5hbWUuZGVzdHJveSgpO1xuICAgIGNvbmZpZyAmJiBjb25maWcuZGVzdHJveSgpO1xuICAgIHByb3ZpZGVyICYmIHByb3ZpZGVyLmRlc3Ryb3koKTtcblxuICAgIHRoaXMuaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluaXRDYWxsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGluaXRTZXJ2ZXJzKCkge1xuXG4gICAgY29uc3QgcHJvamVjdERpcmVjdG9yaWVzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk7XG5cbiAgICBwcm9qZWN0RGlyZWN0b3JpZXMuZm9yRWFjaCgocHJvamVjdERpcmVjdG9yeSkgPT4ge1xuXG4gICAgICBjb25zdCBkaXJlY3RvcnkgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocHJvamVjdERpcmVjdG9yeS5wYXRoKVswXTtcblxuICAgICAgaWYgKGlzRGlyZWN0b3J5KGRpcmVjdG9yeSkpIHtcblxuICAgICAgICB0aGlzLnN0YXJ0U2VydmVyKGRpcmVjdG9yeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGFydFNlcnZlcihkaXIpIHtcblxuICAgIGlmICh0aGlzLmdldFNlcnZlckZvclByb2plY3QoZGlyKSkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNsaWVudCA9IHRoaXMuZ2V0Q2xpZW50Rm9yUHJvamVjdChkaXIpO1xuXG4gICAgaWYgKCFjbGllbnQpIHtcblxuICAgICAgbGV0IGNsaWVudElkeCA9IHRoaXMuY2xpZW50cy5wdXNoKG5ldyBDbGllbnQoZGlyKSkgLSAxO1xuICAgICAgY2xpZW50ID0gdGhpcy5jbGllbnRzW2NsaWVudElkeF07XG4gICAgfVxuXG4gICAgdGhpcy5zZXJ2ZXJzLnB1c2gobmV3IFNlcnZlcihkaXIsIGNsaWVudCkpO1xuXG4gICAgaWYgKHRoaXMuc2VydmVycy5sZW5ndGggPT09IHRoaXMuY2xpZW50cy5sZW5ndGgpIHtcblxuICAgICAgaWYgKCF0aGlzLmluaXRpYWxpc2VkKSB7XG5cbiAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEFjdGl2ZVNlcnZlckFuZENsaWVudChkaXIpO1xuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVNlcnZlckFuZENsaWVudChVUkkpIHtcblxuICAgIGlmICghVVJJKSB7XG5cbiAgICAgIGxldCBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcblxuICAgICAgaWYgKGFjdGl2ZVBhbmUgJiYgYWN0aXZlUGFuZS5nZXRVUkkpIHtcblxuICAgICAgICBVUkkgPSBhY3RpdmVQYW5lLmdldFVSSSgpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGRpciA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChVUkkpWzBdO1xuICAgIGxldCBzZXJ2ZXIgPSB0aGlzLmdldFNlcnZlckZvclByb2plY3QoZGlyKTtcbiAgICBsZXQgY2xpZW50ID0gdGhpcy5nZXRDbGllbnRGb3JQcm9qZWN0KGRpcik7XG5cbiAgICBpZiAoc2VydmVyICYmIGNsaWVudCkge1xuXG4gICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgIGNvbmZpZy5nYXRoZXJEYXRhKCk7XG4gICAgICB0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgICAgY29uZmlnLmNsZWFyKCk7XG4gICAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjaGVja1BhdGhzKHBhdGhzKSB7XG5cbiAgICBmb3IgKGxldCBwYXRoIG9mIHBhdGhzKSB7XG5cbiAgICAgIGxldCBkaXIgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocGF0aClbMF07XG5cbiAgICAgIGlmIChpc0RpcmVjdG9yeShkaXIpKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydFNlcnZlcihkaXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lTZXJ2ZXIocGF0aHMpIHtcblxuICAgIGlmICh0aGlzLnNlcnZlcnMubGVuZ3RoID09PSAwKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc2VydmVySWR4O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlcnZlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgaWYgKHBhdGhzLmluZGV4T2YodGhpcy5zZXJ2ZXJzW2ldLnByb2plY3REaXIpID09PSAtMSkge1xuXG4gICAgICAgIHNlcnZlcklkeCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXJ2ZXJJZHggPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlcnZlciA9IHRoaXMuc2VydmVyc1tzZXJ2ZXJJZHhdO1xuICAgIGxldCBjbGllbnQgPSB0aGlzLmdldENsaWVudEZvclByb2plY3Qoc2VydmVyLnByb2plY3REaXIpO1xuICAgIGNsaWVudCA9IHVuZGVmaW5lZDtcblxuICAgIHNlcnZlci5kZXN0cm95KCk7XG4gICAgc2VydmVyID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5zZXJ2ZXJzLnNwbGljZShzZXJ2ZXJJZHgsIDEpO1xuICB9XG5cbiAgZ2V0U2VydmVyRm9yUHJvamVjdChwcm9qZWN0RGlyKSB7XG5cbiAgICBmb3IgKGxldCBzZXJ2ZXIgb2YgdGhpcy5zZXJ2ZXJzKSB7XG5cbiAgICAgIGlmIChzZXJ2ZXIucHJvamVjdERpciA9PT0gcHJvamVjdERpcikge1xuXG4gICAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2V0Q2xpZW50Rm9yUHJvamVjdChwcm9qZWN0RGlyKSB7XG5cbiAgICBmb3IgKGxldCBjbGllbnQgb2YgdGhpcy5jbGllbnRzKSB7XG5cbiAgICAgIGlmIChjbGllbnQucHJvamVjdERpciA9PT0gcHJvamVjdERpcikge1xuXG4gICAgICAgIHJldHVybiBjbGllbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2V0RWRpdG9yKGVkaXRvcikge1xuXG4gICAgZm9yIChsZXQgX2VkaXRvciBvZiB0aGlzLmVkaXRvcnMpIHtcblxuICAgICAgaWYgKF9lZGl0b3IuaWQgPT09IGVkaXRvci5pZCkge1xuXG4gICAgICAgIHJldHVybiBfZWRpdG9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWRFZGl0b3IoZWRpdG9yKSB7XG5cbiAgICBpZiAoIWVkaXRvciB8fCAhZWRpdG9yLmdldEdyYW1tYXIgfHwgZWRpdG9yLm1pbmkpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghZWRpdG9yLmdldEdyYW1tYXIoKSkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ3JhbW1hcnMuaW5kZXhPZihlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWUpID09PSAtMSkge1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBvbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKGVkaXRvciwgZSkge1xuXG4gICAgaWYgKHBhY2thZ2VDb25maWcub3B0aW9ucy5pbmxpbmVGbkNvbXBsZXRpb24pIHtcblxuICAgICAgdHlwZS5xdWVyeVR5cGUoZWRpdG9yLCBlLmN1cnNvcik7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJFdmVudHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcblxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWRFZGl0b3IoZWRpdG9yKSkge1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgZWRpdG9yXG4gICAgICB0aGlzLmVkaXRvcnMucHVzaCh7XG5cbiAgICAgICAgaWQ6IGVkaXRvci5pZCxcbiAgICAgICAgZGlmZnM6IFtdXG4gICAgICB9KTtcblxuICAgICAgaWYgKCF0aGlzLmluaXRDYWxsZWQpIHtcblxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKChlKSA9PiB7XG5cbiAgICAgICAgZW1pdHRlci5lbWl0KCd0eXBlLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgICBlbWl0dGVyLmVtaXQoJ2RvY3VtZW50YXRpb24tZGVzdHJveS1vdmVybGF5Jyk7XG4gICAgICB9KSk7XG5cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihkZWJvdW5jZSh0aGlzLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24uYmluZCh0aGlzLCBlZGl0b3IpLCAzMDApKSk7XG5cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlKChlKSA9PiB7XG5cbiAgICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgICB0aGlzLmNsaWVudC51cGRhdGUoZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlKChlKSA9PiB7XG5cbiAgICAgICAgdGhpcy5nZXRFZGl0b3IoZWRpdG9yKS5kaWZmcy5wdXNoKGUpO1xuICAgICAgfSkpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKChpdGVtKSA9PiB7XG5cbiAgICAgIGVtaXR0ZXIuZW1pdCgnY29uZmlnLWNsZWFyJyk7XG4gICAgICBlbWl0dGVyLmVtaXQoJ3R5cGUtZGVzdHJveS1vdmVybGF5Jyk7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2RvY3VtZW50YXRpb24tZGVzdHJveS1vdmVybGF5Jyk7XG4gICAgICBlbWl0dGVyLmVtaXQoJ3JlbmFtZS1oaWRlJyk7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkRWRpdG9yKGl0ZW0pKSB7XG5cbiAgICAgICAgZW1pdHRlci5lbWl0KCdyZWZlcmVuY2UtaGlkZScpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMuc2V0QWN0aXZlU2VydmVyQW5kQ2xpZW50KGl0ZW0uZ2V0VVJJKCkpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjYW5jZWwnLCAoZSkgPT4ge1xuXG4gICAgICBlbWl0dGVyLmVtaXQoJ2NvbmZpZy1jbGVhcicpO1xuICAgICAgZW1pdHRlci5lbWl0KCd0eXBlLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgZW1pdHRlci5lbWl0KCdkb2N1bWVudGF0aW9uLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgZW1pdHRlci5lbWl0KCdyZWZlcmVuY2UtaGlkZScpO1xuICAgICAgZW1pdHRlci5lbWl0KCdyZW5hbWUtaGlkZScpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpsaXN0RmlsZXMnLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5jbGllbnQpIHtcblxuICAgICAgICB0aGlzLmNsaWVudC5maWxlcygpLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgICAgIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6Zmx1c2gnLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcblxuICAgICAgICB0aGlzLnNlcnZlci5mbHVzaCgpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpuYXZpZ2F0ZUJhY2snLCAoZSkgPT4ge1xuXG4gICAgICBuYXZpZ2F0aW9uLmdvVG8oLTEpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpuYXZpZ2F0ZUZvcndhcmQnLCAoZSkgPT4ge1xuXG4gICAgICBuYXZpZ2F0aW9uLmdvVG8oMSk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmRlZmluaXRpb24nLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5jbGllbnQpIHtcblxuICAgICAgICB0aGlzLmNsaWVudC5kZWZpbml0aW9uKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdG9tLXRlcm5qczpyZXN0YXJ0JywgKGUpID0+IHtcblxuICAgICAgdGhpcy5yZXN0YXJ0U2VydmVyKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgcmVzdGFydFNlcnZlcigpIHtcblxuICAgIGlmICghdGhpcy5zZXJ2ZXIpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkaXIgPSB0aGlzLnNlcnZlci5wcm9qZWN0RGlyO1xuICAgIGxldCBzZXJ2ZXJJZHg7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VydmVycy5sZW5ndGg7IGkrKykge1xuXG4gICAgICBpZiAoZGlyID09PSB0aGlzLnNlcnZlcnNbaV0ucHJvamVjdERpcikge1xuXG4gICAgICAgIHNlcnZlcklkeCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNlcnZlcikge1xuXG4gICAgICB0aGlzLnNlcnZlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZXJ2ZXJzLnNwbGljZShzZXJ2ZXJJZHgsIDEpO1xuICAgIHRoaXMuc3RhcnRTZXJ2ZXIoZGlyKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWFuYWdlcigpO1xuIl19