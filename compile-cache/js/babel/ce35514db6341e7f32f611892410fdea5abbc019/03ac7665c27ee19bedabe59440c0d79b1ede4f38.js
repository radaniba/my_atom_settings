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
    this.grammars = ['JavaScript', 'JavaScript (JSX)', 'Babel ES6 JavaScript'];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs4QkFLdUIsaUJBQWlCOztnQ0FDcEIsc0JBQXNCOzs7O3VDQUNoQiw2QkFBNkI7Ozs7bUNBQ2pDLHlCQUF5Qjs7Ozt1Q0FDckIsOEJBQThCOzs7OzhCQUN2QyxvQkFBb0I7Ozs7Z0NBQ2xCLHNCQUFzQjs7OztnQ0FJbEMsc0JBQXNCOztrQ0FDUix3QkFBd0I7Ozs7Z0NBQzFCLHNCQUFzQjs7OztrQ0FDbEIsdUJBQXVCOzs7O0FBbEI5QyxXQUFXLENBQUM7O0FBRVosSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDL0MsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7O0lBaUJ6QyxPQUFPO0FBRUEsV0FGUCxPQUFPLEdBRUc7MEJBRlYsT0FBTzs7QUFJVCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzs7QUFFekIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUNkLFlBQVksRUFDWixrQkFBa0IsRUFDbEIsc0JBQXNCLENBQ3ZCLENBQUM7O0FBRUYsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7O0FBRXhCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQXBCRyxPQUFPOztXQXNCUCxnQkFBRzs7O0FBRUwsMkNBQWMsY0FBYyxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFD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ZXJuanMvbGliL2F0b20tdGVybmpzLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1zZXJ2ZXInKTtcbmNvbnN0IENsaWVudCA9IHJlcXVpcmUoJy4vYXRvbS10ZXJuanMtY2xpZW50Jyk7XG5cbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5pbXBvcnQgZW1pdHRlciBmcm9tICcuL2F0b20tdGVybmpzLWV2ZW50cyc7XG5pbXBvcnQgZG9jdW1lbnRhdGlvbiBmcm9tICcuL2F0b20tdGVybmpzLWRvY3VtZW50YXRpb24nO1xuaW1wb3J0IHJlZmVyZW5jZSBmcm9tICcuL2F0b20tdGVybmpzLXJlZmVyZW5jZSc7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCB0eXBlIGZyb20gJy4vYXRvbS10ZXJuanMtdHlwZSc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtY29uZmlnJztcbmltcG9ydCB7XG4gIGlzRGlyZWN0b3J5LFxuICBkaXNwb3NlQWxsXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCBwcm92aWRlciBmcm9tICcuL2F0b20tdGVybmpzLXByb3ZpZGVyJztcbmltcG9ydCByZW5hbWUgZnJvbSAnLi9hdG9tLXRlcm5qcy1yZW5hbWUnO1xuaW1wb3J0IG5hdmlnYXRpb24gZnJvbSAnLi9zZXJ2aWNlcy9uYXZpZ2F0aW9uJztcblxuY2xhc3MgTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB0aGlzLmluaXRDYWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluaXRpYWxpc2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gW107XG4gICAgdGhpcy5ncmFtbWFycyA9IFtcbiAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICdKYXZhU2NyaXB0IChKU1gpJyxcbiAgICAgICdCYWJlbCBFUzYgSmF2YVNjcmlwdCdcbiAgICBdO1xuXG4gICAgdGhpcy5jbGllbnRzID0gW107XG4gICAgdGhpcy5jbGllbnQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZXJ2ZXJzID0gW107XG4gICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmVkaXRvcnMgPSBbXTtcbiAgfVxuXG4gIGluaXQoKSB7XG5cbiAgICBwYWNrYWdlQ29uZmlnLnJlZ2lzdGVyRXZlbnRzKCk7XG4gICAgdGhpcy5pbml0U2VydmVycygpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKChwYXRocykgPT4ge1xuXG4gICAgICB0aGlzLmRlc3Ryb3lTZXJ2ZXIocGF0aHMpO1xuICAgICAgdGhpcy5jaGVja1BhdGhzKHBhdGhzKTtcbiAgICAgIHRoaXMuc2V0QWN0aXZlU2VydmVyQW5kQ2xpZW50KCk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5pbml0Q2FsbGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuXG4gICAgdGhpcy5pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xuICAgIHRoaXMucmVnaXN0ZXJDb21tYW5kcygpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGRpc3Bvc2VBbGwodGhpcy5kaXNwb3NhYmxlcyk7XG5cbiAgICBmb3IgKGxldCBzZXJ2ZXIgb2YgdGhpcy5zZXJ2ZXJzKSB7XG5cbiAgICAgIHNlcnZlci5kZXN0cm95KCk7XG4gICAgICBzZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuc2VydmVycyA9IFtdO1xuICAgIHRoaXMuY2xpZW50cyA9IFtdO1xuXG4gICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jbGllbnQgPSB1bmRlZmluZWQ7XG5cbiAgICBkb2N1bWVudGF0aW9uICYmIGRvY3VtZW50YXRpb24uZGVzdHJveSgpO1xuICAgIHJlZmVyZW5jZSAmJiByZWZlcmVuY2UuZGVzdHJveSgpO1xuICAgIHR5cGUgJiYgdHlwZS5kZXN0cm95KCk7XG4gICAgcGFja2FnZUNvbmZpZyAmJiBwYWNrYWdlQ29uZmlnLmRlc3Ryb3koKTtcbiAgICByZW5hbWUgJiYgcmVuYW1lLmRlc3Ryb3koKTtcbiAgICBjb25maWcgJiYgY29uZmlnLmRlc3Ryb3koKTtcbiAgICBwcm92aWRlciAmJiBwcm92aWRlci5kZXN0cm95KCk7XG5cbiAgICB0aGlzLmluaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgdGhpcy5pbml0Q2FsbGVkID0gZmFsc2U7XG4gIH1cblxuICBpbml0U2VydmVycygpIHtcblxuICAgIGNvbnN0IHByb2plY3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpO1xuXG4gICAgcHJvamVjdERpcmVjdG9yaWVzLmZvckVhY2goKHByb2plY3REaXJlY3RvcnkpID0+IHtcblxuICAgICAgY29uc3QgZGlyZWN0b3J5ID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHByb2plY3REaXJlY3RvcnkucGF0aClbMF07XG5cbiAgICAgIGlmIChpc0RpcmVjdG9yeShkaXJlY3RvcnkpKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydFNlcnZlcihkaXJlY3RvcnkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRTZXJ2ZXIoZGlyKSB7XG5cbiAgICBpZiAodGhpcy5nZXRTZXJ2ZXJGb3JQcm9qZWN0KGRpcikpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjbGllbnQgPSB0aGlzLmdldENsaWVudEZvclByb2plY3QoZGlyKTtcblxuICAgIGlmICghY2xpZW50KSB7XG5cbiAgICAgIGxldCBjbGllbnRJZHggPSB0aGlzLmNsaWVudHMucHVzaChuZXcgQ2xpZW50KGRpcikpIC0gMTtcbiAgICAgIGNsaWVudCA9IHRoaXMuY2xpZW50c1tjbGllbnRJZHhdO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVycy5wdXNoKG5ldyBTZXJ2ZXIoZGlyLCBjbGllbnQpKTtcblxuICAgIGlmICh0aGlzLnNlcnZlcnMubGVuZ3RoID09PSB0aGlzLmNsaWVudHMubGVuZ3RoKSB7XG5cbiAgICAgIGlmICghdGhpcy5pbml0aWFsaXNlZCkge1xuXG4gICAgICAgIHRoaXMuYWN0aXZhdGUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRBY3RpdmVTZXJ2ZXJBbmRDbGllbnQoZGlyKTtcbiAgICB9XG4gIH1cblxuICBzZXRBY3RpdmVTZXJ2ZXJBbmRDbGllbnQoVVJJKSB7XG5cbiAgICBpZiAoIVVSSSkge1xuXG4gICAgICBsZXQgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG5cbiAgICAgIGlmIChhY3RpdmVQYW5lICYmIGFjdGl2ZVBhbmUuZ2V0VVJJKSB7XG5cbiAgICAgICAgVVJJID0gYWN0aXZlUGFuZS5nZXRVUkkoKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jbGllbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBkaXIgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoVVJJKVswXTtcbiAgICBsZXQgc2VydmVyID0gdGhpcy5nZXRTZXJ2ZXJGb3JQcm9qZWN0KGRpcik7XG4gICAgbGV0IGNsaWVudCA9IHRoaXMuZ2V0Q2xpZW50Rm9yUHJvamVjdChkaXIpO1xuXG4gICAgaWYgKHNlcnZlciAmJiBjbGllbnQpIHtcblxuICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgICBjb25maWcuZ2F0aGVyRGF0YSgpO1xuICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgIGNvbmZpZy5jbGVhcigpO1xuICAgICAgdGhpcy5jbGllbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tQYXRocyhwYXRocykge1xuXG4gICAgZm9yIChsZXQgcGF0aCBvZiBwYXRocykge1xuXG4gICAgICBsZXQgZGlyID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpWzBdO1xuXG4gICAgICBpZiAoaXNEaXJlY3RvcnkoZGlyKSkge1xuXG4gICAgICAgIHRoaXMuc3RhcnRTZXJ2ZXIoZGlyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXN0cm95U2VydmVyKHBhdGhzKSB7XG5cbiAgICBpZiAodGhpcy5zZXJ2ZXJzLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlcnZlcklkeDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgIGlmIChwYXRocy5pbmRleE9mKHRoaXMuc2VydmVyc1tpXS5wcm9qZWN0RGlyKSA9PT0gLTEpIHtcblxuICAgICAgICBzZXJ2ZXJJZHggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2VydmVySWR4ID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZXJ2ZXIgPSB0aGlzLnNlcnZlcnNbc2VydmVySWR4XTtcbiAgICBsZXQgY2xpZW50ID0gdGhpcy5nZXRDbGllbnRGb3JQcm9qZWN0KHNlcnZlci5wcm9qZWN0RGlyKTtcbiAgICBjbGllbnQgPSB1bmRlZmluZWQ7XG5cbiAgICBzZXJ2ZXIuZGVzdHJveSgpO1xuICAgIHNlcnZlciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuc2VydmVycy5zcGxpY2Uoc2VydmVySWR4LCAxKTtcbiAgfVxuXG4gIGdldFNlcnZlckZvclByb2plY3QocHJvamVjdERpcikge1xuXG4gICAgZm9yIChsZXQgc2VydmVyIG9mIHRoaXMuc2VydmVycykge1xuXG4gICAgICBpZiAoc2VydmVyLnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICByZXR1cm4gc2VydmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldENsaWVudEZvclByb2plY3QocHJvamVjdERpcikge1xuXG4gICAgZm9yIChsZXQgY2xpZW50IG9mIHRoaXMuY2xpZW50cykge1xuXG4gICAgICBpZiAoY2xpZW50LnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICByZXR1cm4gY2xpZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldEVkaXRvcihlZGl0b3IpIHtcblxuICAgIGZvciAobGV0IF9lZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGlmIChfZWRpdG9yLmlkID09PSBlZGl0b3IuaWQpIHtcblxuICAgICAgICByZXR1cm4gX2VkaXRvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc1ZhbGlkRWRpdG9yKGVkaXRvcikge1xuXG4gICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRHcmFtbWFyIHx8IGVkaXRvci5taW5pKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWVkaXRvci5nZXRHcmFtbWFyKCkpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdyYW1tYXJzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lKSA9PT0gLTEpIHtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihlZGl0b3IsIGUpIHtcblxuICAgIGlmIChwYWNrYWdlQ29uZmlnLm9wdGlvbnMuaW5saW5lRm5Db21wbGV0aW9uKSB7XG5cbiAgICAgIHR5cGUucXVlcnlUeXBlKGVkaXRvciwgZS5jdXJzb3IpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyRXZlbnRzKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGVkaXRvclxuICAgICAgdGhpcy5lZGl0b3JzLnB1c2goe1xuXG4gICAgICAgIGlkOiBlZGl0b3IuaWQsXG4gICAgICAgIGRpZmZzOiBbXVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghdGhpcy5pbml0Q2FsbGVkKSB7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoZSkgPT4ge1xuXG4gICAgICAgIGVtaXR0ZXIuZW1pdCgndHlwZS1kZXN0cm95LW92ZXJsYXknKTtcbiAgICAgICAgZW1pdHRlci5lbWl0KCdkb2N1bWVudGF0aW9uLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgfSkpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZGVib3VuY2UodGhpcy5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uLmJpbmQodGhpcywgZWRpdG9yKSwgMzAwKSkpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZSgoZSkgPT4ge1xuXG4gICAgICAgIGlmICh0aGlzLmNsaWVudCkge1xuXG4gICAgICAgICAgdGhpcy5jbGllbnQudXBkYXRlKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcblxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSgoZSkgPT4ge1xuXG4gICAgICAgIHRoaXMuZ2V0RWRpdG9yKGVkaXRvcikuZGlmZnMucHVzaChlKTtcbiAgICAgIH0pKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgoaXRlbSkgPT4ge1xuXG4gICAgICBlbWl0dGVyLmVtaXQoJ2NvbmZpZy1jbGVhcicpO1xuICAgICAgZW1pdHRlci5lbWl0KCd0eXBlLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgZW1pdHRlci5lbWl0KCdkb2N1bWVudGF0aW9uLWRlc3Ryb3ktb3ZlcmxheScpO1xuICAgICAgZW1pdHRlci5lbWl0KCdyZW5hbWUtaGlkZScpO1xuXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZEVkaXRvcihpdGVtKSkge1xuXG4gICAgICAgIGVtaXR0ZXIuZW1pdCgncmVmZXJlbmNlLWhpZGUnKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLnNldEFjdGl2ZVNlcnZlckFuZENsaWVudChpdGVtLmdldFVSSSgpKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICByZWdpc3RlckNvbW1hbmRzKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJywgKGUpID0+IHtcblxuICAgICAgZW1pdHRlci5lbWl0KCdjb25maWctY2xlYXInKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgndHlwZS1kZXN0cm95LW92ZXJsYXknKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgnZG9jdW1lbnRhdGlvbi1kZXN0cm95LW92ZXJsYXknKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgncmVmZXJlbmNlLWhpZGUnKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgncmVuYW1lLWhpZGUnKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bGlzdEZpbGVzJywgKGUpID0+IHtcblxuICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgdGhpcy5jbGllbnQuZmlsZXMoKS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgICAgICBjb25zb2xlLmRpcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmZsdXNoJywgKGUpID0+IHtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXIuZmx1c2goKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bmF2aWdhdGVCYWNrJywgKGUpID0+IHtcblxuICAgICAgbmF2aWdhdGlvbi5nb1RvKC0xKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bmF2aWdhdGVGb3J3YXJkJywgKGUpID0+IHtcblxuICAgICAgbmF2aWdhdGlvbi5nb1RvKDEpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpkZWZpbml0aW9uJywgKGUpID0+IHtcblxuICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgdGhpcy5jbGllbnQuZGVmaW5pdGlvbigpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS10ZXJuanM6cmVzdGFydCcsIChlKSA9PiB7XG5cbiAgICAgIHRoaXMucmVzdGFydFNlcnZlcigpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlc3RhcnRTZXJ2ZXIoKSB7XG5cbiAgICBpZiAoIXRoaXMuc2VydmVyKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZGlyID0gdGhpcy5zZXJ2ZXIucHJvamVjdERpcjtcbiAgICBsZXQgc2VydmVySWR4O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlcnZlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgaWYgKGRpciA9PT0gdGhpcy5zZXJ2ZXJzW2ldLnByb2plY3REaXIpIHtcblxuICAgICAgICBzZXJ2ZXJJZHggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcblxuICAgICAgdGhpcy5zZXJ2ZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VydmVycy5zcGxpY2Uoc2VydmVySWR4LCAxKTtcbiAgICB0aGlzLnN0YXJ0U2VydmVyKGRpcik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1hbmFnZXIoKTtcbiJdfQ==