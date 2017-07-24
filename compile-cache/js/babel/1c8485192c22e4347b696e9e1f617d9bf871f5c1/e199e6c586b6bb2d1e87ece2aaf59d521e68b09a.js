'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Server = undefined;
var Client = undefined;
var Documentation = undefined;
var Helper = undefined;
var PackageConfig = undefined;
var Config = undefined;
var Type = undefined;
var Reference = undefined;
var Rename = undefined;
var _ = require('underscore-plus');

var Manager = (function () {
  function Manager(provider) {
    _classCallCheck(this, Manager);

    this.provider = provider;

    this.disposables = [];

    this.grammars = ['JavaScript'];

    this.clients = [];
    this.client = undefined;
    this.servers = [];
    this.server = undefined;

    this.editors = [];

    this.rename = undefined;
    this.type = undefined;
    this.reference = undefined;
    this.documentation = undefined;

    this.initialised = false;

    window.setTimeout(this.init.bind(this), 0);
  }

  _createClass(Manager, [{
    key: 'init',
    value: function init() {
      var _this = this;

      Helper = require('./atom-ternjs-helper.coffee');
      PackageConfig = require('./atom-ternjs-package-config');
      Config = require('./atom-ternjs-config');

      this.helper = new Helper(this);
      this.packageConfig = new PackageConfig(this);
      this.config = new Config(this);
      this.provider.init(this);
      this.initServers();

      this.registerHelperCommands();

      this.disposables.push(atom.project.onDidChangePaths(function (paths) {

        _this.destroyServer(paths);
        _this.checkPaths(paths);
        _this.setActiveServerAndClient();
      }));
    }
  }, {
    key: 'activate',
    value: function activate() {

      this.initialised = true;
      this.registerEvents();
      this.registerCommands();
    }
  }, {
    key: 'destroyObject',
    value: function destroyObject(object) {

      if (object) {

        object.destroy();
      }
      object = undefined;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {

        for (var _iterator = this.servers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var server = _step.value;

          server.destroy();
          server = undefined;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.servers = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var client = _step2.value;

          client = undefined;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.clients = [];

      this.server = undefined;
      this.client = undefined;
      this.unregisterEventsAndCommands();
      this.provider = undefined;

      this.destroyObject(this.config);
      this.destroyObject(this.packageConfig);
      this.destroyObject(this.reference);
      this.destroyObject(this.rename);
      this.destroyObject(this.type);
      this.destroyObject(this.helper);

      this.initialised = false;
    }
  }, {
    key: 'unregisterEventsAndCommands',
    value: function unregisterEventsAndCommands() {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {

        for (var _iterator3 = this.disposables[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var disposable = _step3.value;

          if (!disposable) {

            continue;
          }

          disposable.dispose();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.disposables = [];
    }
  }, {
    key: 'initServers',
    value: function initServers() {

      var dirs = atom.project.getDirectories();

      if (dirs.length === 0) {

        return;
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = dirs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var dir = _step4.value;

          dir = atom.project.relativizePath(dir.path)[0];

          if (this.helper.isDirectory(dir)) {

            this.startServer(dir);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: 'startServer',
    value: function startServer(dir) {

      if (!Server) {

        Server = require('./atom-ternjs-server');
      }

      if (this.getServerForProject(dir)) {

        return;
      }

      var client = this.getClientForProject(dir);

      if (!client) {

        if (!Client) {

          Client = require('./atom-ternjs-client');
        }

        var clientIdx = this.clients.push(new Client(this, dir)) - 1;
        client = this.clients[clientIdx];
      }

      this.servers.push(new Server(dir, client, this));

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
        this.config.gatherData();
        this.client = client;
      } else {

        this.server = undefined;
        this.config.clear();
        this.client = undefined;
      }
    }
  }, {
    key: 'checkPaths',
    value: function checkPaths(paths) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {

        for (var _iterator5 = paths[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var path = _step5.value;

          var dir = atom.project.relativizePath(path)[0];

          if (this.helper.isDirectory(dir)) {

            this.startServer(dir);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
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
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {

        for (var _iterator6 = this.servers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var server = _step6.value;

          if (server.projectDir === projectDir) {

            return server;
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return false;
    }
  }, {
    key: 'getClientForProject',
    value: function getClientForProject(projectDir) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {

        for (var _iterator7 = this.clients[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var client = _step7.value;

          if (client.projectDir === projectDir) {

            return client;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7['return']) {
            _iterator7['return']();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return false;
    }
  }, {
    key: 'getEditor',
    value: function getEditor(editor) {
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {

        for (var _iterator8 = this.editors[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _editor = _step8.value;

          if (_editor.id === editor.id) {

            return _editor;
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8['return']) {
            _iterator8['return']();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
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

      if (this.packageConfig.options.inlineFnCompletion) {

        if (!this.type) {

          Type = require('./atom-ternjs-type');
          this.type = new Type(this);
        }

        this.type.queryType(editor, e.cursor);
      }

      if (this.rename) {

        this.rename.hide();
      }
    }
  }, {
    key: 'registerEvents',
    value: function registerEvents() {
      var _this2 = this;

      this.disposables.push(atom.workspace.observeTextEditors(function (editor) {

        if (!_this2.isValidEditor(editor)) {

          return;
        }

        // Register valid editor
        _this2.editors.push({

          id: editor.id,
          diffs: []
        });

        if (!_this2.initCalled) {

          _this2.init();
        }

        var editorView = atom.views.getView(editor);

        if (editorView) {

          _this2.disposables.push(editorView.addEventListener('click', function (e) {

            if (!e[_this2.helper.accessKey]) {

              return;
            }

            if (_this2.client) {

              _this2.client.definition();
            }
          }));
        }

        var scrollView = undefined;

        if (!editorView.shadowRoot) {

          scrollView = editorView.querySelector('.scroll-view');
        } else {

          scrollView = editorView.shadowRoot.querySelector('.scroll-view');
        }

        if (scrollView) {

          _this2.disposables.push(scrollView.addEventListener('mousemove', function (e) {

            if (!e[_this2.helper.accessKey]) {

              return;
            }

            if (e.target.classList.contains('line')) {

              return;
            }

            e.target.classList.add('atom-ternjs-hover');
          }));

          _this2.disposables.push(scrollView.addEventListener('mouseout', function (e) {

            e.target.classList.remove('atom-ternjs-hover');
          }));
        }

        _this2.disposables.push(editor.onDidChangeCursorPosition(function (e) {

          if (_this2.type) {

            _this2.type.destroyOverlay();
          }

          if (_this2.documentation) {

            _this2.documentation.destroyOverlay();
          }
        }));

        _this2.disposables.push(editor.onDidChangeCursorPosition(_.debounce(_this2.onDidChangeCursorPosition.bind(_this2, editor), 300)));

        _this2.disposables.push(editor.getBuffer().onDidSave(function (e) {

          if (_this2.client) {

            _this2.client.update(editor);
          }
        }));

        _this2.disposables.push(editor.getBuffer().onDidChange(function (e) {

          _this2.getEditor(editor).diffs.push(e);
        }));
      }));

      this.disposables.push(atom.workspace.onDidChangeActivePaneItem(function (item) {

        if (_this2.config) {

          _this2.config.clear();
        }

        if (_this2.type) {

          _this2.type.destroyOverlay();
        }

        if (_this2.rename) {

          _this2.rename.hide();
        }

        if (!_this2.isValidEditor(item)) {

          if (_this2.reference) {

            _this2.reference.hide();
          }
        } else {

          _this2.setActiveServerAndClient(item.getURI());
        }
      }));
    }
  }, {
    key: 'registerHelperCommands',
    value: function registerHelperCommands() {
      var _this3 = this;

      this.disposables.push(atom.commands.add('atom-workspace', 'atom-ternjs:openConfig', function (e) {

        if (!_this3.config) {

          _this3.config = new Config(_this3);
        }

        _this3.config.show();
      }));
    }
  }, {
    key: 'registerCommands',
    value: function registerCommands() {
      var _this4 = this;

      this.disposables.push(atom.commands.add('atom-text-editor', 'core:cancel', function (e) {

        if (_this4.config) {

          _this4.config.hide();
        }

        if (_this4.type) {

          _this4.type.destroyOverlay();
        }

        if (_this4.rename) {

          _this4.rename.hide();
        }

        if (_this4.reference) {

          _this4.reference.hide();
        }

        if (_this4.documentation) {

          _this4.documentation.destroyOverlay();
        }
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

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:documentation', function (e) {

        if (!_this4.documentation) {

          Documentation = require('./atom-ternjs-documentation');
          _this4.documentation = new Documentation(_this4);
        }

        if (_this4.client) {

          _this4.documentation.request();
        }
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:references', function (e) {

        if (!_this4.reference) {

          Reference = require('./atom-ternjs-reference');
          _this4.reference = new Reference(_this4);
        }

        _this4.reference.findReference();
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:rename', function (e) {

        if (!_this4.rename) {

          Rename = require('./atom-ternjs-rename');
          _this4.rename = new Rename(_this4);
        }

        _this4.rename.show();
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:markerCheckpointBack', function (e) {

        if (_this4.helper) {

          _this4.helper.markerCheckpointBack();
        }
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:startCompletion', function (e) {

        if (_this4.provider) {

          _this4.provider.forceCompletion();
        }
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

exports['default'] = Manager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0FBRVosSUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsSUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7SUFFZCxPQUFPO0FBRWYsV0FGUSxPQUFPLENBRWQsUUFBUSxFQUFFOzBCQUZILE9BQU87O0FBSXhCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUV6QixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxhQUFhLEdB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QUMsSUFBSSxDQUFDLE1BQU0sRUFBRTs7QUFFaEIsZUFBTztPQUNSOztBQUVELFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDOztBQUVqQyxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0FBRTVDLFlBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFOztBQUV0QyxtQkFBUyxHQUFHLENBQUMsQ0FBQztBQUNkLGdCQUFNO1NBQ1A7T0FDRjs7QUFFRCxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O0FBRWYsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN2Qjs7QUFFRCxVQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN4QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN2Qjs7O1NBdm1Ca0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmxldCBTZXJ2ZXI7XG5sZXQgQ2xpZW50O1xubGV0IERvY3VtZW50YXRpb247XG5sZXQgSGVscGVyO1xubGV0IFBhY2thZ2VDb25maWc7XG5sZXQgQ29uZmlnO1xubGV0IFR5cGU7XG5sZXQgUmVmZXJlbmNlO1xubGV0IFJlbmFtZTtcbmxldCBfID0gcmVxdWlyZSgndW5kZXJzY29yZS1wbHVzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKHByb3ZpZGVyKSB7XG5cbiAgICB0aGlzLnByb3ZpZGVyID0gcHJvdmlkZXI7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gW107XG5cbiAgICB0aGlzLmdyYW1tYXJzID0gWydKYXZhU2NyaXB0J107XG5cbiAgICB0aGlzLmNsaWVudHMgPSBbXTtcbiAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNlcnZlcnMgPSBbXTtcbiAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuZWRpdG9ycyA9IFtdO1xuXG4gICAgdGhpcy5yZW5hbWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50eXBlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmVmZXJlbmNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZG9jdW1lbnRhdGlvbiA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuaW5pdGlhbGlzZWQgPSBmYWxzZTtcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuaW5pdC5iaW5kKHRoaXMpLCAwKTtcbiAgfVxuXG4gIGluaXQoKSB7XG5cbiAgICBIZWxwZXIgPSByZXF1aXJlKCcuL2F0b20tdGVybmpzLWhlbHBlci5jb2ZmZWUnKTtcbiAgICBQYWNrYWdlQ29uZmlnID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1wYWNrYWdlLWNvbmZpZycpO1xuICAgIENvbmZpZyA9IHJlcXVpcmUoJy4vYXRvbS10ZXJuanMtY29uZmlnJyk7XG5cbiAgICB0aGlzLmhlbHBlciA9IG5ldyBIZWxwZXIodGhpcyk7XG4gICAgdGhpcy5wYWNrYWdlQ29uZmlnID0gbmV3IFBhY2thZ2VDb25maWcodGhpcyk7XG4gICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKHRoaXMpO1xuICAgIHRoaXMucHJvdmlkZXIuaW5pdCh0aGlzKTtcbiAgICB0aGlzLmluaXRTZXJ2ZXJzKCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVySGVscGVyQ29tbWFuZHMoKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygocGF0aHMpID0+IHtcblxuICAgICAgdGhpcy5kZXN0cm95U2VydmVyKHBhdGhzKTtcbiAgICAgIHRoaXMuY2hlY2tQYXRocyhwYXRocyk7XG4gICAgICB0aGlzLnNldEFjdGl2ZVNlcnZlckFuZENsaWVudCgpO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuXG4gICAgdGhpcy5pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xuICAgIHRoaXMucmVnaXN0ZXJDb21tYW5kcygpO1xuICB9XG5cbiAgZGVzdHJveU9iamVjdChvYmplY3QpIHtcblxuICAgIGlmIChvYmplY3QpIHtcblxuICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICB9XG4gICAgb2JqZWN0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGZvciAobGV0IHNlcnZlciBvZiB0aGlzLnNlcnZlcnMpIHtcblxuICAgICAgc2VydmVyLmRlc3Ryb3koKTtcbiAgICAgIHNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5zZXJ2ZXJzID0gW107XG5cbiAgICBmb3IgKGxldCBjbGllbnQgb2YgdGhpcy5jbGllbnRzKSB7XG5cbiAgICAgIGNsaWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jbGllbnRzID0gW107XG5cbiAgICB0aGlzLnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnVucmVnaXN0ZXJFdmVudHNBbmRDb21tYW5kcygpO1xuICAgIHRoaXMucHJvdmlkZXIgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmRlc3Ryb3lPYmplY3QodGhpcy5jb25maWcpO1xuICAgIHRoaXMuZGVzdHJveU9iamVjdCh0aGlzLnBhY2thZ2VDb25maWcpO1xuICAgIHRoaXMuZGVzdHJveU9iamVjdCh0aGlzLnJlZmVyZW5jZSk7XG4gICAgdGhpcy5kZXN0cm95T2JqZWN0KHRoaXMucmVuYW1lKTtcbiAgICB0aGlzLmRlc3Ryb3lPYmplY3QodGhpcy50eXBlKTtcbiAgICB0aGlzLmRlc3Ryb3lPYmplY3QodGhpcy5oZWxwZXIpO1xuXG4gICAgdGhpcy5pbml0aWFsaXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgdW5yZWdpc3RlckV2ZW50c0FuZENvbW1hbmRzKCkge1xuXG4gICAgZm9yIChsZXQgZGlzcG9zYWJsZSBvZiB0aGlzLmRpc3Bvc2FibGVzKSB7XG5cbiAgICAgIGlmICghZGlzcG9zYWJsZSkge1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gW107XG4gIH1cblxuICBpbml0U2VydmVycygpIHtcblxuICAgIGxldCBkaXJzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk7XG5cbiAgICBpZiAoZGlycy5sZW5ndGggPT09IDApIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAobGV0IGRpciBvZiBkaXJzKSB7XG5cbiAgICAgIGRpciA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChkaXIucGF0aClbMF07XG5cbiAgICAgIGlmICh0aGlzLmhlbHBlci5pc0RpcmVjdG9yeShkaXIpKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydFNlcnZlcihkaXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0U2VydmVyKGRpcikge1xuXG4gICAgaWYgKCFTZXJ2ZXIpIHtcblxuICAgICAgU2VydmVyID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1zZXJ2ZXInKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRTZXJ2ZXJGb3JQcm9qZWN0KGRpcikpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjbGllbnQgPSB0aGlzLmdldENsaWVudEZvclByb2plY3QoZGlyKTtcblxuICAgIGlmICghY2xpZW50KSB7XG5cbiAgICAgIGlmICghQ2xpZW50KSB7XG5cbiAgICAgICAgQ2xpZW50ID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1jbGllbnQnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGNsaWVudElkeCA9IHRoaXMuY2xpZW50cy5wdXNoKG5ldyBDbGllbnQodGhpcywgZGlyKSkgLSAxO1xuICAgICAgY2xpZW50ID0gdGhpcy5jbGllbnRzW2NsaWVudElkeF07XG4gICAgfVxuXG4gICAgdGhpcy5zZXJ2ZXJzLnB1c2gobmV3IFNlcnZlcihkaXIsIGNsaWVudCwgdGhpcykpO1xuXG4gICAgaWYgKHRoaXMuc2VydmVycy5sZW5ndGggPT09IHRoaXMuY2xpZW50cy5sZW5ndGgpIHtcblxuICAgICAgaWYgKCF0aGlzLmluaXRpYWxpc2VkKSB7XG5cbiAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEFjdGl2ZVNlcnZlckFuZENsaWVudChkaXIpO1xuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVNlcnZlckFuZENsaWVudChVUkkpIHtcblxuICAgIGlmICghVVJJKSB7XG5cbiAgICAgIGxldCBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcblxuICAgICAgaWYgKGFjdGl2ZVBhbmUgJiYgYWN0aXZlUGFuZS5nZXRVUkkpIHtcblxuICAgICAgICBVUkkgPSBhY3RpdmVQYW5lLmdldFVSSSgpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNsaWVudCA9IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGRpciA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChVUkkpWzBdO1xuICAgIGxldCBzZXJ2ZXIgPSB0aGlzLmdldFNlcnZlckZvclByb2plY3QoZGlyKTtcbiAgICBsZXQgY2xpZW50ID0gdGhpcy5nZXRDbGllbnRGb3JQcm9qZWN0KGRpcik7XG5cbiAgICBpZiAoc2VydmVyICYmIGNsaWVudCkge1xuXG4gICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgIHRoaXMuY29uZmlnLmdhdGhlckRhdGEoKTtcbiAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdGhpcy5zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNvbmZpZy5jbGVhcigpO1xuICAgICAgdGhpcy5jbGllbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tQYXRocyhwYXRocykge1xuXG4gICAgZm9yIChsZXQgcGF0aCBvZiBwYXRocykge1xuXG4gICAgICBsZXQgZGlyID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpWzBdO1xuXG4gICAgICBpZiAodGhpcy5oZWxwZXIuaXNEaXJlY3RvcnkoZGlyKSkge1xuXG4gICAgICAgIHRoaXMuc3RhcnRTZXJ2ZXIoZGlyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXN0cm95U2VydmVyKHBhdGhzKSB7XG5cbiAgICBpZiAodGhpcy5zZXJ2ZXJzLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlcnZlcklkeDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgIGlmIChwYXRocy5pbmRleE9mKHRoaXMuc2VydmVyc1tpXS5wcm9qZWN0RGlyKSA9PT0gLTEpIHtcblxuICAgICAgICBzZXJ2ZXJJZHggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2VydmVySWR4ID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZXJ2ZXIgPSB0aGlzLnNlcnZlcnNbc2VydmVySWR4XTtcbiAgICBsZXQgY2xpZW50ID0gdGhpcy5nZXRDbGllbnRGb3JQcm9qZWN0KHNlcnZlci5wcm9qZWN0RGlyKTtcbiAgICBjbGllbnQgPSB1bmRlZmluZWQ7XG5cbiAgICBzZXJ2ZXIuZGVzdHJveSgpO1xuICAgIHNlcnZlciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuc2VydmVycy5zcGxpY2Uoc2VydmVySWR4LCAxKTtcbiAgfVxuXG4gIGdldFNlcnZlckZvclByb2plY3QocHJvamVjdERpcikge1xuXG4gICAgZm9yIChsZXQgc2VydmVyIG9mIHRoaXMuc2VydmVycykge1xuXG4gICAgICBpZiAoc2VydmVyLnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICByZXR1cm4gc2VydmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldENsaWVudEZvclByb2plY3QocHJvamVjdERpcikge1xuXG4gICAgZm9yIChsZXQgY2xpZW50IG9mIHRoaXMuY2xpZW50cykge1xuXG4gICAgICBpZiAoY2xpZW50LnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICByZXR1cm4gY2xpZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldEVkaXRvcihlZGl0b3IpIHtcblxuICAgIGZvciAobGV0IF9lZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGlmIChfZWRpdG9yLmlkID09PSBlZGl0b3IuaWQpIHtcblxuICAgICAgICByZXR1cm4gX2VkaXRvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc1ZhbGlkRWRpdG9yKGVkaXRvcikge1xuXG4gICAgaWYgKCFlZGl0b3IgfHwgIWVkaXRvci5nZXRHcmFtbWFyIHx8IGVkaXRvci5taW5pKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWVkaXRvci5nZXRHcmFtbWFyKCkpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdyYW1tYXJzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lKSA9PT0gLTEpIHtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihlZGl0b3IsIGUpIHtcblxuICAgIGlmICh0aGlzLnBhY2thZ2VDb25maWcub3B0aW9ucy5pbmxpbmVGbkNvbXBsZXRpb24pIHtcblxuICAgICAgaWYgKCF0aGlzLnR5cGUpIHtcblxuICAgICAgICBUeXBlID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy10eXBlJyk7XG4gICAgICAgIHRoaXMudHlwZSA9IG5ldyBUeXBlKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnR5cGUucXVlcnlUeXBlKGVkaXRvciwgZS5jdXJzb3IpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlbmFtZSkge1xuXG4gICAgICB0aGlzLnJlbmFtZS5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJFdmVudHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcblxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWRFZGl0b3IoZWRpdG9yKSkge1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgZWRpdG9yXG4gICAgICB0aGlzLmVkaXRvcnMucHVzaCh7XG5cbiAgICAgICAgaWQ6IGVkaXRvci5pZCxcbiAgICAgICAgZGlmZnM6IFtdXG4gICAgICB9KTtcblxuICAgICAgaWYgKCF0aGlzLmluaXRDYWxsZWQpIHtcblxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcblxuICAgICAgaWYgKGVkaXRvclZpZXcpIHtcblxuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG5cbiAgICAgICAgICBpZiAoIWVbdGhpcy5oZWxwZXIuYWNjZXNzS2V5XSkge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgICAgIHRoaXMuY2xpZW50LmRlZmluaXRpb24oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHNjcm9sbFZpZXc7XG5cbiAgICAgIGlmICghZWRpdG9yVmlldy5zaGFkb3dSb290KSB7XG5cbiAgICAgICAgc2Nyb2xsVmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLnNjcm9sbC12aWV3Jyk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgc2Nyb2xsVmlldyA9IGVkaXRvclZpZXcuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLXZpZXcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbFZpZXcpIHtcblxuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goc2Nyb2xsVmlldy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuXG4gICAgICAgICAgaWYgKCFlW3RoaXMuaGVscGVyLmFjY2Vzc0tleV0pIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2xpbmUnKSkge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYXRvbS10ZXJuanMtaG92ZXInKTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChzY3JvbGxWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGUpID0+IHtcblxuICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2F0b20tdGVybmpzLWhvdmVyJyk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKChlKSA9PiB7XG5cbiAgICAgICAgaWYgKHRoaXMudHlwZSkge1xuXG4gICAgICAgICAgdGhpcy50eXBlLmRlc3Ryb3lPdmVybGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kb2N1bWVudGF0aW9uKSB7XG5cbiAgICAgICAgICB0aGlzLmRvY3VtZW50YXRpb24uZGVzdHJveU92ZXJsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oXy5kZWJvdW5jZSh0aGlzLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24uYmluZCh0aGlzLCBlZGl0b3IpLCAzMDApKSk7XG5cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlKChlKSA9PiB7XG5cbiAgICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgICB0aGlzLmNsaWVudC51cGRhdGUoZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlKChlKSA9PiB7XG5cbiAgICAgICAgdGhpcy5nZXRFZGl0b3IoZWRpdG9yKS5kaWZmcy5wdXNoKGUpO1xuICAgICAgfSkpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKChpdGVtKSA9PiB7XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZykge1xuXG4gICAgICAgIHRoaXMuY29uZmlnLmNsZWFyKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnR5cGUpIHtcblxuICAgICAgICB0aGlzLnR5cGUuZGVzdHJveU92ZXJsYXkoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucmVuYW1lKSB7XG5cbiAgICAgICAgdGhpcy5yZW5hbWUuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZEVkaXRvcihpdGVtKSkge1xuXG4gICAgICAgIGlmICh0aGlzLnJlZmVyZW5jZSkge1xuXG4gICAgICAgICAgdGhpcy5yZWZlcmVuY2UuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdGhpcy5zZXRBY3RpdmVTZXJ2ZXJBbmRDbGllbnQoaXRlbS5nZXRVUkkoKSk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgcmVnaXN0ZXJIZWxwZXJDb21tYW5kcygpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS10ZXJuanM6b3BlbkNvbmZpZycsIChlKSA9PiB7XG5cbiAgICAgIGlmICghdGhpcy5jb25maWcpIHtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IG5ldyBDb25maWcodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29uZmlnLnNob3coKTtcbiAgICB9KSk7XG4gIH1cblxuICByZWdpc3RlckNvbW1hbmRzKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJywgKGUpID0+IHtcblxuICAgICAgaWYgKHRoaXMuY29uZmlnKSB7XG5cbiAgICAgICAgdGhpcy5jb25maWcuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50eXBlKSB7XG5cbiAgICAgICAgdGhpcy50eXBlLmRlc3Ryb3lPdmVybGF5KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnJlbmFtZSkge1xuXG4gICAgICAgIHRoaXMucmVuYW1lLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucmVmZXJlbmNlKSB7XG5cbiAgICAgICAgdGhpcy5yZWZlcmVuY2UuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5kb2N1bWVudGF0aW9uKSB7XG5cbiAgICAgICAgdGhpcy5kb2N1bWVudGF0aW9uLmRlc3Ryb3lPdmVybGF5KCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmxpc3RGaWxlcycsIChlKSA9PiB7XG5cbiAgICAgIGlmICh0aGlzLmNsaWVudCkge1xuXG4gICAgICAgIHRoaXMuY2xpZW50LmZpbGVzKCkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgY29uc29sZS5kaXIoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpmbHVzaCcsIChlKSA9PiB7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuXG4gICAgICAgIHRoaXMuc2VydmVyLmZsdXNoKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmRvY3VtZW50YXRpb24nLCAoZSkgPT4ge1xuXG4gICAgICBpZiAoIXRoaXMuZG9jdW1lbnRhdGlvbikge1xuXG4gICAgICAgIERvY3VtZW50YXRpb24gPSByZXF1aXJlKCcuL2F0b20tdGVybmpzLWRvY3VtZW50YXRpb24nKTtcbiAgICAgICAgdGhpcy5kb2N1bWVudGF0aW9uID0gbmV3IERvY3VtZW50YXRpb24odGhpcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNsaWVudCkge1xuXG4gICAgICAgIHRoaXMuZG9jdW1lbnRhdGlvbi5yZXF1ZXN0KCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOnJlZmVyZW5jZXMnLCAoZSkgPT4ge1xuXG4gICAgICBpZiAoIXRoaXMucmVmZXJlbmNlKSB7XG5cbiAgICAgICAgUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1yZWZlcmVuY2UnKTtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2UgPSBuZXcgUmVmZXJlbmNlKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlZmVyZW5jZS5maW5kUmVmZXJlbmNlKCk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOnJlbmFtZScsIChlKSA9PiB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJlbmFtZSkge1xuXG4gICAgICAgICAgUmVuYW1lID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy1yZW5hbWUnKTtcbiAgICAgICAgICB0aGlzLnJlbmFtZSA9IG5ldyBSZW5hbWUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmFtZS5zaG93KCk7XG4gICAgICB9XG4gICAgKSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bWFya2VyQ2hlY2twb2ludEJhY2snLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5oZWxwZXIpIHtcblxuICAgICAgICB0aGlzLmhlbHBlci5tYXJrZXJDaGVja3BvaW50QmFjaygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpzdGFydENvbXBsZXRpb24nLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5wcm92aWRlcikge1xuXG4gICAgICAgIHRoaXMucHJvdmlkZXIuZm9yY2VDb21wbGV0aW9uKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmRlZmluaXRpb24nLCAoZSkgPT4ge1xuXG4gICAgICBpZiAodGhpcy5jbGllbnQpIHtcblxuICAgICAgICB0aGlzLmNsaWVudC5kZWZpbml0aW9uKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdG9tLXRlcm5qczpyZXN0YXJ0JywgKGUpID0+IHtcblxuICAgICAgdGhpcy5yZXN0YXJ0U2VydmVyKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgcmVzdGFydFNlcnZlcigpIHtcblxuICAgIGlmICghdGhpcy5zZXJ2ZXIpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkaXIgPSB0aGlzLnNlcnZlci5wcm9qZWN0RGlyO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlcnZlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgaWYgKGRpciA9PT0gdGhpcy5zZXJ2ZXJzW2ldLnByb2plY3REaXIpIHtcblxuICAgICAgICBzZXJ2ZXJJZHggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcblxuICAgICAgdGhpcy5zZXJ2ZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VydmVycy5zcGxpY2Uoc2VydmVySWR4LCAxKTtcbiAgICB0aGlzLnN0YXJ0U2VydmVyKGRpcik7XG4gIH1cbn1cbiJdfQ==