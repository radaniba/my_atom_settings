Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _underscorePlus = require('underscore-plus');

'use babel';

var ConfigView = require('./atom-ternjs-config-view');

var Config = (function () {
  function Config() {
    _classCallCheck(this, Config);

    this.disposables = [];

    this.config = undefined;
    this.projectConfig = undefined;
    this.editors = [];

    this.configClearHandler = this.clear.bind(this);
    _atomTernjsEvents2['default'].on('config-clear', this.configClearHandler);

    this.registerCommands();
  }

  _createClass(Config, [{
    key: 'registerCommands',
    value: function registerCommands() {

      this.disposables.push(atom.commands.add('atom-workspace', 'atom-ternjs:openConfig', this.show.bind(this)));
    }
  }, {
    key: 'getContent',
    value: function getContent(filePath, projectRoot) {

      var root = undefined;

      if (projectRoot) {

        root = _atomTernjsManager2['default'].server && _atomTernjsManager2['default'].server.projectDir;
      } else {

        root = '';
      }

      var content = (0, _atomTernjsHelper.getFileContent)(filePath, root);

      if (!content) {

        return;
      }

      try {

        content = JSON.parse(content);
      } catch (e) {

        atom.notifications.addInfo('Error parsing .tern-project. Please check if it is a valid JSON file.', {

          dismissable: true
        });
        return;
      }

      return content;
    }
  }, {
    key: 'prepareLibs',
    value: function prepareLibs(configDefault) {

      var libs = {};

      for (var index in configDefault.libs) {

        if (this.projectConfig.libs && this.projectConfig.libs.indexOf(configDefault.libs[index]) > -1) {

          libs[configDefault.libs[index]] = {

            _active: true
          };
        } else {

          libs[configDefault.libs[index]] = {

            _active: false
          };
        }
      }

      this.config.libs = libs;
    }
  }, {
    key: 'prepareEcma',
    value: function prepareEcma(configDefault) {

      var ecmaVersions = {};

      for (var lib of Object.keys(configDefault.ecmaVersions)) {

        ecmaVersions[lib] = configDefault.ecmaVersions[lib];
      }

      this.config.ecmaVersions = ecmaVersions;

      if (this.config.ecmaVersion) {

        for (var lib of Object.keys(this.config.ecmaVersions)) {

          if (lib === 'ecmaVersion' + this.config.ecmaVersion) {

            this.config.ecmaVersions[lib] = true;
          } else {

            this.config.ecmaVersions[lib] = false;
          }
        }
      }
    }
  }, {
    key: 'preparePlugins',
    value: function preparePlugins(availablePlugins) {

      if (!this.config.plugins) {

        this.config.plugins = {};
      }

      // check if there are unknown plugins in .tern-config
      for (var plugin of Object.keys(this.config.plugins)) {

        if (!availablePlugins[plugin]) {

          availablePlugins[plugin] = plugin;
        }
      }

      for (var plugin of Object.keys(availablePlugins)) {

        if (this.config.plugins[plugin]) {

          this.config.plugins[plugin] = this.mergeConfigObjects(availablePlugins[plugin], this.config.plugins[plugin]);
          this.config.plugins[plugin]._active = true;
        } else {

          this.config.plugins[plugin] = availablePlugins[plugin];
          this.config.plugins[plugin]._active = false;
        }
      }
    }
  }, {
    key: 'registerEvents',
    value: function registerEvents() {
      var _this = this;

      var close = this.configView.getClose();
      var cancel = this.configView.getCancel();

      close.addEventListener('click', function (e) {

        _this.updateConfig();
        _this.hide();

        (0, _atomTernjsHelper.focusEditor)();
      });

      cancel.addEventListener('click', function (e) {

        _this.destroyEditors();
        _this.hide();

        (0, _atomTernjsHelper.focusEditor)();
      });
    }
  }, {
    key: 'mergeConfigObjects',
    value: function mergeConfigObjects(obj1, obj2) {

      return (0, _underscorePlus.deepExtend)({}, obj1, obj2);
    }
  }, {
    key: 'hide',
    value: function hide() {

      if (!this.configPanel) {

        return;
      }

      this.configPanel.hide();
    }
  }, {
    key: 'clear',
    value: function clear() {

      this.hide();
      this.destroyEditors();
      this.config = undefined;
      this.projectConfig = undefined;

      if (!this.configView) {

        return;
      }

      this.configView.removeContent();
    }
  }, {
    key: 'gatherData',
    value: function gatherData() {

      var configDefault = this.getContent('../config/tern-config.json', false);
      var pluginsTern = this.getContent('../config/tern-plugins.json', false);

      if (!configDefault) {

        console.error('Could not load: tern-config.json');
        return;
      }

      this.projectConfig = this.getContent('/.tern-project', true);
      this.config = this.projectConfig || {};

      if (!this.projectConfig) {

        this.projectConfig = {};
        this.config = (0, _underscorePlus.clone)(configDefault);
      }

      this.prepareEcma(configDefault);
      this.prepareLibs(configDefault);
      this.preparePlugins(pluginsTern);

      if (!this.config.loadEagerly) {

        this.config.loadEagerly = [];
      }

      if (!this.config.dontLoad) {

        this.config.dontLoad = [];
      }

      return true;
    }
  }, {
    key: 'removeEditor',
    value: function removeEditor(editor) {

      if (!editor) {

        return;
      }

      var idx = this.editors.indexOf(editor);

      if (idx === -1) {

        return;
      }

      this.editors.splice(idx, 1);
    }
  }, {
    key: 'destroyEditors',
    value: function destroyEditors() {

      for (var editor of this.editors) {

        var buffer = editor.getModel().getBuffer();
        buffer.destroy();
      }

      this.editors = [];
    }
  }, {
    key: 'updateConfig',
    value: function updateConfig() {

      this.config.loadEagerly = [];
      this.config.dontLoad = [];

      for (var editor of this.editors) {

        var buffer = editor.getModel().getBuffer();
        var text = buffer.getText().trim();

        if (text === '') {

          continue;
        }

        this.config[editor.__ternjs_section].push(text);
      }

      this.destroyEditors();

      var newConfig = this.buildNewConfig();
      var newConfigJSON = JSON.stringify(newConfig, null, 2);

      (0, _atomTernjsHelper.updateTernFile)(newConfigJSON, true);
    }
  }, {
    key: 'buildNewConfig',
    value: function buildNewConfig() {

      var newConfig = {};

      for (var key of Object.keys(this.config.ecmaVersions)) {

        if (this.config.ecmaVersions[key]) {

          newConfig.ecmaVersion = Number(key[key.length - 1]);
          break;
        }
      }

      if (!(0, _underscorePlus.isEmpty)(this.config.libs)) {

        newConfig.libs = [];

        for (var key of Object.keys(this.config.libs)) {

          if (this.config.libs[key]._active) {

            newConfig.libs.push(key);
          }
        }
      }

      if (this.config.loadEagerly.length !== 0) {

        newConfig.loadEagerly = this.config.loadEagerly;
      }

      if (this.config.dontLoad.length !== 0) {

        newConfig.dontLoad = this.config.dontLoad;
      }

      if (!(0, _underscorePlus.isEmpty)(this.config.plugins)) {

        newConfig.plugins = {};

        for (var key of Object.keys(this.config.plugins)) {

          if (this.config.plugins[key]._active) {

            delete this.config.plugins[key]._active;
            newConfig.plugins[key] = this.config.plugins[key];
          }
        }
      }

      return newConfig;
    }
  }, {
    key: 'initConfigView',
    value: function initConfigView() {

      this.configView = new ConfigView();
      this.configView.initialize(this);

      this.configPanel = atom.workspace.addRightPanel({

        item: this.configView,
        priority: 0
      });
      this.configPanel.hide();

      this.registerEvents();
    }
  }, {
    key: 'show',
    value: function show() {

      if (!this.configView) {

        this.initConfigView();
      }

      this.clear();

      if (!this.gatherData()) {

        return;
      }

      atom.views.getView(this.configPanel).classList.add('atom-ternjs-config-panel');

      this.configView.buildOptionsMarkup();
      this.configPanel.show();
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);

      if (this.configView) {

        this.configView.destroy();
      }
      this.configView = undefined;

      if (this.configPanel) {

        this.configPanel.destroy();
      }
      this.configPanel = undefined;
    }
  }]);

  return Config;
})();

exports['default'] = new Config();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2lDQUlvQix1QkFBdUI7Ozs7Z0NBQ3ZCLHNCQUFzQjs7OztnQ0FNbkMsc0JBQXNCOzs4QkFNdEIsaUJBQWlCOztBQWpCeEIsV0FBVyxDQUFDOztBQUVaLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztJQWlCbEQsTUFBTTtBQUVDLFdBRlAsTUFBTSxHQUVJOzBCQUZWLE1BQU07O0FBSVIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVsQixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsa0NBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFcEQsUUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDekI7O2VBZEcsTUFBTTs7V0FnQk0sNEJBQUc7O0FBRWpCLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHdCQUF3QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Rzs7O1dBRVMsb0JBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTs7QUFFaEMsVUFBSSxJQUFJLFlBQUEsQ0FBQzs7QUFFVCxVQUFJLFdBQVcsRUFBRTs7QUFFZixZQUFJLEdBQUcsK0JBQVEsTUFBTSxJ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SUFBSSxDQUFDLFdBQVcsRUFBRTs7QUFFcEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUM1QjtBQUNELFVBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0tBQzlCOzs7U0FuWUcsTUFBTTs7O3FCQXNZRyxJQUFJLE1BQU0sRUFBRSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgQ29uZmlnVmlldyA9IHJlcXVpcmUoJy4vYXRvbS10ZXJuanMtY29uZmlnLXZpZXcnKTtcblxuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCBlbWl0dGVyIGZyb20gJy4vYXRvbS10ZXJuanMtZXZlbnRzJztcbmltcG9ydCB7XG4gIGdldEZpbGVDb250ZW50LFxuICBmb2N1c0VkaXRvcixcbiAgdXBkYXRlVGVybkZpbGUsXG4gIGRpc3Bvc2VBbGxcbn0gZnJvbSAnLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuXG5pbXBvcnQge1xuICBkZWVwRXh0ZW5kLFxuICBjbG9uZSxcbiAgaXNFbXB0eVxufSBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5jbGFzcyBDb25maWcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IFtdO1xuXG4gICAgdGhpcy5jb25maWcgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5wcm9qZWN0Q29uZmlnID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZWRpdG9ycyA9IFtdO1xuXG4gICAgdGhpcy5jb25maWdDbGVhckhhbmRsZXIgPSB0aGlzLmNsZWFyLmJpbmQodGhpcyk7XG4gICAgZW1pdHRlci5vbignY29uZmlnLWNsZWFyJywgdGhpcy5jb25maWdDbGVhckhhbmRsZXIpO1xuXG4gICAgdGhpcy5yZWdpc3RlckNvbW1hbmRzKCk7XG4gIH1cblxuICByZWdpc3RlckNvbW1hbmRzKCkge1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdG9tLXRlcm5qczpvcGVuQ29uZmlnJywgdGhpcy5zaG93LmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIGdldENvbnRlbnQoZmlsZVBhdGgsIHByb2plY3RSb290KSB7XG5cbiAgICBsZXQgcm9vdDtcblxuICAgIGlmIChwcm9qZWN0Um9vdCkge1xuXG4gICAgICByb290ID0gbWFuYWdlci5zZXJ2ZXIgJiYgbWFuYWdlci5zZXJ2ZXIucHJvamVjdERpcjtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJvb3QgPSAnJztcbiAgICB9XG5cbiAgICBsZXQgY29udGVudCA9IGdldEZpbGVDb250ZW50KGZpbGVQYXRoLCByb290KTtcblxuICAgIGlmICghY29udGVudCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcblxuICAgICAgY29udGVudCA9IEpTT04ucGFyc2UoY29udGVudCk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdFcnJvciBwYXJzaW5nIC50ZXJuLXByb2plY3QuIFBsZWFzZSBjaGVjayBpZiBpdCBpcyBhIHZhbGlkIEpTT04gZmlsZS4nLCB7XG5cbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgcHJlcGFyZUxpYnMoY29uZmlnRGVmYXVsdCkge1xuXG4gICAgbGV0IGxpYnMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgaW5kZXggaW4gY29uZmlnRGVmYXVsdC5saWJzKSB7XG5cbiAgICAgIGlmICh0aGlzLnByb2plY3RDb25maWcubGlicyAmJiB0aGlzLnByb2plY3RDb25maWcubGlicy5pbmRleE9mKGNvbmZpZ0RlZmF1bHQubGlic1tpbmRleF0pID4gLTEpIHtcblxuICAgICAgICBsaWJzW2NvbmZpZ0RlZmF1bHQubGlic1tpbmRleF1dID0ge1xuXG4gICAgICAgICAgX2FjdGl2ZTogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGxpYnNbY29uZmlnRGVmYXVsdC5saWJzW2luZGV4XV0gPSB7XG5cbiAgICAgICAgICBfYWN0aXZlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY29uZmlnLmxpYnMgPSBsaWJzO1xuICB9XG5cbiAgcHJlcGFyZUVjbWEoY29uZmlnRGVmYXVsdCkge1xuXG4gICAgbGV0IGVjbWFWZXJzaW9ucyA9IHt9O1xuXG4gICAgZm9yIChsZXQgbGliIG9mIE9iamVjdC5rZXlzKGNvbmZpZ0RlZmF1bHQuZWNtYVZlcnNpb25zKSkge1xuXG4gICAgICBlY21hVmVyc2lvbnNbbGliXSA9IGNvbmZpZ0RlZmF1bHQuZWNtYVZlcnNpb25zW2xpYl07XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWcuZWNtYVZlcnNpb25zID0gZWNtYVZlcnNpb25zO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLmVjbWFWZXJzaW9uKSB7XG5cbiAgICAgIGZvciAobGV0IGxpYiBvZiBPYmplY3Qua2V5cyh0aGlzLmNvbmZpZy5lY21hVmVyc2lvbnMpKSB7XG5cbiAgICAgICAgaWYgKGxpYiA9PT0gJ2VjbWFWZXJzaW9uJyArIHRoaXMuY29uZmlnLmVjbWFWZXJzaW9uKSB7XG5cbiAgICAgICAgICB0aGlzLmNvbmZpZy5lY21hVmVyc2lvbnNbbGliXSA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIHRoaXMuY29uZmlnLmVjbWFWZXJzaW9uc1tsaWJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcmVwYXJlUGx1Z2lucyhhdmFpbGFibGVQbHVnaW5zKSB7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLnBsdWdpbnMpIHtcblxuICAgICAgdGhpcy5jb25maWcucGx1Z2lucyA9IHt9O1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSB1bmtub3duIHBsdWdpbnMgaW4gLnRlcm4tY29uZmlnXG4gICAgZm9yIChjb25zdCBwbHVnaW4gb2YgT2JqZWN0LmtleXModGhpcy5jb25maWcucGx1Z2lucykpIHtcblxuICAgICAgaWYgKCFhdmFpbGFibGVQbHVnaW5zW3BsdWdpbl0pIHtcblxuICAgICAgICBhdmFpbGFibGVQbHVnaW5zW3BsdWdpbl0gPSBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBwbHVnaW4gb2YgT2JqZWN0LmtleXMoYXZhaWxhYmxlUGx1Z2lucykpIHtcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLnBsdWdpbnNbcGx1Z2luXSkge1xuXG4gICAgICAgIHRoaXMuY29uZmlnLnBsdWdpbnNbcGx1Z2luXSA9IHRoaXMubWVyZ2VDb25maWdPYmplY3RzKGF2YWlsYWJsZVBsdWdpbnNbcGx1Z2luXSwgdGhpcy5jb25maWcucGx1Z2luc1twbHVnaW5dKTtcbiAgICAgICAgdGhpcy5jb25maWcucGx1Z2luc1twbHVnaW5dLl9hY3RpdmUgPSB0cnVlO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMuY29uZmlnLnBsdWdpbnNbcGx1Z2luXSA9IGF2YWlsYWJsZVBsdWdpbnNbcGx1Z2luXTtcbiAgICAgICAgdGhpcy5jb25maWcucGx1Z2luc1twbHVnaW5dLl9hY3RpdmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZWdpc3RlckV2ZW50cygpIHtcblxuICAgIGxldCBjbG9zZSA9IHRoaXMuY29uZmlnVmlldy5nZXRDbG9zZSgpO1xuICAgIGxldCBjYW5jZWwgPSB0aGlzLmNvbmZpZ1ZpZXcuZ2V0Q2FuY2VsKCk7XG5cbiAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgICB0aGlzLmhpZGUoKTtcblxuICAgICAgZm9jdXNFZGl0b3IoKTtcbiAgICB9KTtcblxuICAgIGNhbmNlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG5cbiAgICAgIHRoaXMuZGVzdHJveUVkaXRvcnMoKTtcbiAgICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgICBmb2N1c0VkaXRvcigpO1xuICAgIH0pO1xuICB9XG5cbiAgbWVyZ2VDb25maWdPYmplY3RzKG9iajEsIG9iajIpIHtcblxuICAgIHJldHVybiBkZWVwRXh0ZW5kKHt9LCBvYmoxLCBvYmoyKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnUGFuZWwpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnUGFuZWwuaGlkZSgpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG5cbiAgICB0aGlzLmhpZGUoKTtcbiAgICB0aGlzLmRlc3Ryb3lFZGl0b3JzKCk7XG4gICAgdGhpcy5jb25maWcgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5wcm9qZWN0Q29uZmlnID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZ1ZpZXcpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnVmlldy5yZW1vdmVDb250ZW50KCk7XG4gIH1cblxuICBnYXRoZXJEYXRhKCkge1xuXG4gICAgY29uc3QgY29uZmlnRGVmYXVsdCA9IHRoaXMuZ2V0Q29udGVudCgnLi4vY29uZmlnL3Rlcm4tY29uZmlnLmpzb24nLCBmYWxzZSk7XG4gICAgY29uc3QgcGx1Z2luc1Rlcm4gPSB0aGlzLmdldENvbnRlbnQoJy4uL2NvbmZpZy90ZXJuLXBsdWdpbnMuanNvbicsIGZhbHNlKTtcblxuICAgIGlmICghY29uZmlnRGVmYXVsdCkge1xuXG4gICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgbG9hZDogdGVybi1jb25maWcuanNvbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucHJvamVjdENvbmZpZyA9IHRoaXMuZ2V0Q29udGVudCgnLy50ZXJuLXByb2plY3QnLCB0cnVlKTtcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMucHJvamVjdENvbmZpZyB8fCB7fTtcblxuICAgIGlmICghdGhpcy5wcm9qZWN0Q29uZmlnKSB7XG5cbiAgICAgIHRoaXMucHJvamVjdENvbmZpZyA9IHt9O1xuICAgICAgdGhpcy5jb25maWcgPSBjbG9uZShjb25maWdEZWZhdWx0KTtcbiAgICB9XG5cbiAgICB0aGlzLnByZXBhcmVFY21hKGNvbmZpZ0RlZmF1bHQpO1xuICAgIHRoaXMucHJlcGFyZUxpYnMoY29uZmlnRGVmYXVsdCk7XG4gICAgdGhpcy5wcmVwYXJlUGx1Z2lucyhwbHVnaW5zVGVybik7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLmxvYWRFYWdlcmx5KSB7XG5cbiAgICAgIHRoaXMuY29uZmlnLmxvYWRFYWdlcmx5ID0gW107XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5kb250TG9hZCkge1xuXG4gICAgICB0aGlzLmNvbmZpZy5kb250TG9hZCA9IFtdO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVtb3ZlRWRpdG9yKGVkaXRvcikge1xuXG4gICAgaWYgKCFlZGl0b3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBpZHggPSB0aGlzLmVkaXRvcnMuaW5kZXhPZihlZGl0b3IpO1xuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZWRpdG9ycy5zcGxpY2UoaWR4LCAxKTtcbiAgfVxuXG5cbiAgZGVzdHJveUVkaXRvcnMoKSB7XG5cbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKTtcbiAgICAgIGJ1ZmZlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3JzID0gW107XG4gIH1cblxuICB1cGRhdGVDb25maWcoKSB7XG5cbiAgICB0aGlzLmNvbmZpZy5sb2FkRWFnZXJseSA9IFtdO1xuICAgIHRoaXMuY29uZmlnLmRvbnRMb2FkID0gW107XG5cbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKTtcbiAgICAgIGxldCB0ZXh0ID0gYnVmZmVyLmdldFRleHQoKS50cmltKCk7XG5cbiAgICAgIGlmICh0ZXh0ID09PSAnJykge1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbmZpZ1tlZGl0b3IuX190ZXJuanNfc2VjdGlvbl0ucHVzaCh0ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLmRlc3Ryb3lFZGl0b3JzKCk7XG5cbiAgICBsZXQgbmV3Q29uZmlnID0gdGhpcy5idWlsZE5ld0NvbmZpZygpO1xuICAgIGxldCBuZXdDb25maWdKU09OID0gSlNPTi5zdHJpbmdpZnkobmV3Q29uZmlnLCBudWxsLCAyKTtcblxuICAgIHVwZGF0ZVRlcm5GaWxlKG5ld0NvbmZpZ0pTT04sIHRydWUpO1xuICB9XG5cbiAgYnVpbGROZXdDb25maWcoKSB7XG5cbiAgICBsZXQgbmV3Q29uZmlnID0ge307XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5jb25maWcuZWNtYVZlcnNpb25zKSkge1xuXG4gICAgICBpZiAodGhpcy5jb25maWcuZWNtYVZlcnNpb25zW2tleV0pIHtcblxuICAgICAgICBuZXdDb25maWcuZWNtYVZlcnNpb24gPSBOdW1iZXIoa2V5W2tleS5sZW5ndGggLSAxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaXNFbXB0eSh0aGlzLmNvbmZpZy5saWJzKSkge1xuXG4gICAgICBuZXdDb25maWcubGlicyA9IFtdO1xuXG4gICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5jb25maWcubGlicykpIHtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcubGlic1trZXldLl9hY3RpdmUpIHtcblxuICAgICAgICAgIG5ld0NvbmZpZy5saWJzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmNvbmZpZy5sb2FkRWFnZXJseS5sZW5ndGggIT09IDApIHtcblxuICAgICAgbmV3Q29uZmlnLmxvYWRFYWdlcmx5ID0gdGhpcy5jb25maWcubG9hZEVhZ2VybHk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29uZmlnLmRvbnRMb2FkLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICBuZXdDb25maWcuZG9udExvYWQgPSB0aGlzLmNvbmZpZy5kb250TG9hZDtcbiAgICB9XG5cbiAgICBpZiAoIWlzRW1wdHkodGhpcy5jb25maWcucGx1Z2lucykpIHtcblxuICAgICAgbmV3Q29uZmlnLnBsdWdpbnMgPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5jb25maWcucGx1Z2lucykpIHtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcucGx1Z2luc1trZXldLl9hY3RpdmUpIHtcblxuICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbmZpZy5wbHVnaW5zW2tleV0uX2FjdGl2ZTtcbiAgICAgICAgICBuZXdDb25maWcucGx1Z2luc1trZXldID0gdGhpcy5jb25maWcucGx1Z2luc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0NvbmZpZztcbiAgfVxuXG4gIGluaXRDb25maWdWaWV3KCkge1xuXG4gICAgdGhpcy5jb25maWdWaWV3ID0gbmV3IENvbmZpZ1ZpZXcoKTtcbiAgICB0aGlzLmNvbmZpZ1ZpZXcuaW5pdGlhbGl6ZSh0aGlzKTtcblxuICAgIHRoaXMuY29uZmlnUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKHtcblxuICAgICAgaXRlbTogdGhpcy5jb25maWdWaWV3LFxuICAgICAgcHJpb3JpdHk6IDBcbiAgICB9KTtcbiAgICB0aGlzLmNvbmZpZ1BhbmVsLmhpZGUoKTtcblxuICAgIHRoaXMucmVnaXN0ZXJFdmVudHMoKTtcbiAgfVxuXG4gIHNob3coKSB7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnVmlldykge1xuXG4gICAgICB0aGlzLmluaXRDb25maWdWaWV3KCk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuXG4gICAgaWYgKCF0aGlzLmdhdGhlckRhdGEoKSkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuY29uZmlnUGFuZWwpLmNsYXNzTGlzdC5hZGQoJ2F0b20tdGVybmpzLWNvbmZpZy1wYW5lbCcpO1xuXG4gICAgdGhpcy5jb25maWdWaWV3LmJ1aWxkT3B0aW9uc01hcmt1cCgpO1xuICAgIHRoaXMuY29uZmlnUGFuZWwuc2hvdygpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGRpc3Bvc2VBbGwodGhpcy5kaXNwb3NhYmxlcyk7XG5cbiAgICBpZiAodGhpcy5jb25maWdWaWV3KSB7XG5cbiAgICAgIHRoaXMuY29uZmlnVmlldy5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuY29uZmlnVmlldyA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLmNvbmZpZ1BhbmVsKSB7XG5cbiAgICAgIHRoaXMuY29uZmlnUGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLmNvbmZpZ1BhbmVsID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBDb25maWcoKTtcbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/atom-ternjs/lib/atom-ternjs-config.js
