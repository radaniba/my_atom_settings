'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ConfigView = undefined;
var _ = require('underscore-plus');

var Config = (function () {
  function Config(manager) {
    _classCallCheck(this, Config);

    this.manager = manager;

    this.config = undefined;
    this.projectConfig = undefined;
    this.editors = [];
  }

  _createClass(Config, [{
    key: 'getContent',
    value: function getContent(filePath, projectRoot) {

      var error = false;
      var content = this.manager.helper.getFileContent(filePath, projectRoot);

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
    value: function prepareLibs(localConfig, configStub) {

      var libs = {};

      if (!localConfig.libs) {

        localConfig.libs = {};
      } else {

        var libsAsObject = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = localConfig.libs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var lib = _step.value;

            libsAsObject[lib] = true;
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

        localConfig.libs = libsAsObject;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(configStub.libs)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var lib = _step2.value;

          if (!localConfig.libs[lib]) {

            libs[lib] = false;
          } else {

            libs[lib] = true;
          }
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(localConfig.libs)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var lib = _step3.value;

          if (lib === 'ecma5' || lib === 'ecma6') {

            atom.notifications.addInfo('You are using a outdated .tern-project file. Please remove libs ecma5, ecma6 manually and restart the Server via Packages -> Atom Ternjs -> Restart server. Then configure the project via Packages -> Atom Ternjs -> Configure project.', {

              dismissable: true
            });
          }

          if (!libs[lib]) {

            libs[lib] = true;
          }
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

      localConfig.libs = libs;

      return localConfig;
    }
  }, {
    key: 'prepareEcma',
    value: function prepareEcma(localConfig, configStub) {

      var ecmaVersions = {};

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(configStub.ecmaVersions)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var lib = _step4.value;

          ecmaVersions[lib] = configStub.ecmaVersions[lib];
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

      localConfig.ecmaVersions = ecmaVersions;

      if (localConfig.ecmaVersion) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {

          for (var _iterator5 = Object.keys(localConfig.ecmaVersions)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var lib = _step5.value;

            if (lib === 'ecmaVersion' + localConfig.ecmaVersion) {

              localConfig.ecmaVersions[lib] = true;
            } else {

              localConfig.ecmaVersions[lib] = false;
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

      return localConfig;
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
        _this.manager.helper.focusEditor();
      });

      cancel.addEventListener('click', function (e) {

        _this.destroyEditors();
        _this.hide();
        _this.manager.helper.focusEditor();
      });
    }
  }, {
    key: 'mergeConfigObjects',
    value: function mergeConfigObjects(obj1, obj2) {

      return _.deepExtend({}, obj1, obj2);
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

      var configStub = this.getContent('../tern-config.json', false);

      if (!configStub) {

        return;
      }

      this.projectConfig = this.getContent('/.tern-project', true);

      this.config = {};
      this.config = this.mergeConfigObjects(this.projectConfig, this.config);

      if (this.projectConfig) {

        this.config = this.prepareEcma(this.config, configStub);
        this.config = this.prepareLibs(this.config, configStub);

        for (var plugin in this.config.plugins) {

          if (this.config.plugins[plugin]) {

            this.config.plugins[plugin].active = true;
          }
        }

        this.config = this.mergeConfigObjects(configStub, this.config);
      } else {

        this.config = configStub;
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
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {

        for (var _iterator6 = this.editors[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var editor = _step6.value;

          var buffer = editor.getModel().getBuffer();
          buffer.destroy();
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

      this.editors = [];
    }
  }, {
    key: 'updateConfig',
    value: function updateConfig() {

      this.config.loadEagerly = [];
      this.config.dontLoad = [];

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.editors[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var editor = _step7.value;

          var buffer = editor.getModel().getBuffer();
          var text = buffer.getText().trim();

          if (text === '') {

            continue;
          }

          this.config[editor.__ternjs_section].push(text);
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

      this.destroyEditors();

      var newConfig = this.buildNewConfig();
      var newConfigJSON = JSON.stringify(newConfig, null, 2);

      this.manager.helper.updateTernFile(newConfigJSON, true);
    }
  }, {
    key: 'buildNewConfig',
    value: function buildNewConfig() {

      var newConfig = {};

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = Object.keys(this.config.ecmaVersions)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var key = _step8.value;

          if (this.config.ecmaVersions[key]) {

            newConfig.ecmaVersion = Number(key[key.length - 1]);
            break;
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

      if (!_.isEmpty(this.config.libs)) {

        newConfig.libs = [];

        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = Object.keys(this.config.libs)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var key = _step9.value;

            if (this.config.libs[key]) {

              newConfig.libs.push(key);
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9['return']) {
              _iterator9['return']();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      if (this.config.loadEagerly.length !== 0) {

        newConfig.loadEagerly = this.config.loadEagerly;
      }

      if (this.config.dontLoad.length !== 0) {

        newConfig.dontLoad = this.config.dontLoad;
      }

      if (this.projectConfig && !_.isEmpty(this.projectConfig.plugins)) {

        newConfig.plugins = this.projectConfig.plugins;
      }

      return newConfig;
    }
  }, {
    key: 'initConfigView',
    value: function initConfigView() {

      if (!ConfigView) {

        ConfigView = require('./atom-ternjs-config-view');
      }

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

      atom.views.getView(this.configPanel).classList.add('atom-ternjs-config-panel');

      if (!this.gatherData()) {

        atom.notifications.addInfo('There is no active project. Please re-open or focus at least one JavaScript file of the project to configure.', {

          dismissable: true
        });
        return;
      }

      this.configView.buildOptionsMarkup(this.manager);
      this.configPanel.show();
    }
  }, {
    key: 'destroy',
    value: function destroy() {

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

exports['default'] = Config;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7QUFFWixJQUFJLFVBQVUsWUFBQSxDQUFDO0FBQ2YsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0lBRWQsTUFBTTtBQUVkLFdBRlEsTUFBTSxDQUViLE9BQU8sRUFBRTswQkFGRixNQUFNOztBQUl2QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7QUFDL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7R0FDbkI7O2VBVGtCLE1BQU07O1dBV2Ysb0JBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTs7QUFFaEMsVUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRXhFLFVBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRVosZUFBTztPQUNSOztBQUVELFVBQUk7O0FBRUYsZUFBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FFL0IsQ0FBQyxPQUFNLENBQUMsRUFBRTs7QUFFVCxZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyx1RUFBdUUsRUFBRTs7QUFFbEcscUJBQVcsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztBQUNILGVBQU87T0FDUjs7QUFFRCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBRVUscUJBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRTs7QUFFbkMsVUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFD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QUFVLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDekI7OztXQUVNLG1CQUFHOztBQUVSLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTs7QUFFbkIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMzQjtBQUNELFVBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDOztBQUU1QixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7O0FBRXBCLFlBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDNUI7QUFDRCxVQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztLQUM5Qjs7O1NBMVdrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiO1xuXG5sZXQgQ29uZmlnVmlldztcbmxldCBfID0gcmVxdWlyZSgndW5kZXJzY29yZS1wbHVzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZyB7XG5cbiAgY29uc3RydWN0b3IobWFuYWdlcikge1xuXG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcblxuICAgIHRoaXMuY29uZmlnID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucHJvamVjdENvbmZpZyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVkaXRvcnMgPSBbXTtcbiAgfVxuXG4gIGdldENvbnRlbnQoZmlsZVBhdGgsIHByb2plY3RSb290KSB7XG5cbiAgICBsZXQgZXJyb3IgPSBmYWxzZTtcbiAgICBsZXQgY29udGVudCA9IHRoaXMubWFuYWdlci5oZWxwZXIuZ2V0RmlsZUNvbnRlbnQoZmlsZVBhdGgsIHByb2plY3RSb290KTtcblxuICAgIGlmICghY29udGVudCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcblxuICAgICAgY29udGVudCA9IEpTT04ucGFyc2UoY29udGVudCk7XG5cbiAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0Vycm9yIHBhcnNpbmcgLnRlcm4tcHJvamVjdC4gUGxlYXNlIGNoZWNrIGlmIGl0IGlzIGEgdmFsaWQgSlNPTiBmaWxlLicsIHtcblxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBwcmVwYXJlTGlicyhsb2NhbENvbmZpZywgY29uZmlnU3R1Yikge1xuXG4gICAgbGV0IGxpYnMgPSB7fTtcblxuICAgIGlmICghbG9jYWxDb25maWcubGlicykge1xuXG4gICAgICBsb2NhbENvbmZpZy5saWJzID0ge307XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICBsZXQgbGlic0FzT2JqZWN0ID0ge307XG4gICAgICBmb3IgKGxldCBsaWIgb2YgbG9jYWxDb25maWcubGlicykge1xuXG4gICAgICAgIGxpYnNBc09iamVjdFtsaWJdID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbG9jYWxDb25maWcubGlicyA9IGxpYnNBc09iamVjdDtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBsaWIgb2YgT2JqZWN0LmtleXMoY29uZmlnU3R1Yi5saWJzKSnCoHtcblxuICAgICAgaWYgKCFsb2NhbENvbmZpZy5saWJzW2xpYl0pIHtcblxuICAgICAgICBsaWJzW2xpYl0gPSBmYWxzZTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBsaWJzW2xpYl0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGxpYiBvZiBPYmplY3Qua2V5cyhsb2NhbENvbmZpZy5saWJzKSkge1xuXG4gICAgICBpZiAobGliID09PSAnZWNtYTUnIHx8IGxpYiA9PT0gJ2VjbWE2Jykge1xuXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3UgYXJlIHVzaW5nIGEgb3V0ZGF0ZWQgLnRlcm4tcHJvamVjdCBmaWxlLiBQbGVhc2UgcmVtb3ZlIGxpYnMgZWNtYTUsIGVjbWE2IG1hbnVhbGx5IGFuZCByZXN0YXJ0IHRoZSBTZXJ2ZXIgdmlhIFBhY2thZ2VzIC0+IEF0b20gVGVybmpzIC0+IFJlc3RhcnQgc2VydmVyLiBUaGVuIGNvbmZpZ3VyZSB0aGUgcHJvamVjdCB2aWEgUGFja2FnZXMgLT4gQXRvbSBUZXJuanMgLT4gQ29uZmlndXJlIHByb2plY3QuJywge1xuXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghbGlic1tsaWJdKSB7XG5cbiAgICAgICAgbGlic1tsaWJdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsb2NhbENvbmZpZy5saWJzID0gbGlicztcblxuICAgIHJldHVybiBsb2NhbENvbmZpZztcbiAgfVxuXG4gIHByZXBhcmVFY21hKGxvY2FsQ29uZmlnLCBjb25maWdTdHViKSB7XG5cbiAgICBsZXQgZWNtYVZlcnNpb25zID0ge307XG5cbiAgICBmb3IgKGxldCBsaWIgb2YgT2JqZWN0LmtleXMoY29uZmlnU3R1Yi5lY21hVmVyc2lvbnMpKSB7XG5cbiAgICAgIGVjbWFWZXJzaW9uc1tsaWJdID0gY29uZmlnU3R1Yi5lY21hVmVyc2lvbnNbbGliXTtcbiAgICB9XG5cbiAgICBsb2NhbENvbmZpZy5lY21hVmVyc2lvbnMgPSBlY21hVmVyc2lvbnM7XG5cbiAgICBpZiAobG9jYWxDb25maWcuZWNtYVZlcnNpb24pIHtcblxuICAgICAgZm9yIChsZXQgbGliIG9mIE9iamVjdC5rZXlzKGxvY2FsQ29uZmlnLmVjbWFWZXJzaW9ucykpIHtcblxuICAgICAgICBpZiAobGliID09PSAnZWNtYVZlcnNpb24nICsgbG9jYWxDb25maWcuZWNtYVZlcnNpb24pIHtcblxuICAgICAgICAgIGxvY2FsQ29uZmlnLmVjbWFWZXJzaW9uc1tsaWJdID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgbG9jYWxDb25maWcuZWNtYVZlcnNpb25zW2xpYl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NhbENvbmZpZztcbiAgfVxuXG4gIHJlZ2lzdGVyRXZlbnRzKCkge1xuXG4gICAgbGV0IGNsb3NlID0gdGhpcy5jb25maWdWaWV3LmdldENsb3NlKCk7XG4gICAgbGV0IGNhbmNlbCA9IHRoaXMuY29uZmlnVmlldy5nZXRDYW5jZWwoKTtcblxuICAgIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcblxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgdGhpcy5tYW5hZ2VyLmhlbHBlci5mb2N1c0VkaXRvcigpO1xuICAgIH0pO1xuXG4gICAgY2FuY2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcblxuICAgICAgdGhpcy5kZXN0cm95RWRpdG9ycygpO1xuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICB0aGlzLm1hbmFnZXIuaGVscGVyLmZvY3VzRWRpdG9yKCk7XG4gICAgfSk7XG4gIH1cblxuICBtZXJnZUNvbmZpZ09iamVjdHMob2JqMSwgb2JqMikge1xuXG4gICAgcmV0dXJuIF8uZGVlcEV4dGVuZCh7fSwgb2JqMSwgb2JqMik7XG4gIH1cblxuICBoaWRlKCkge1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZ1BhbmVsKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZ1BhbmVsLmhpZGUoKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuXG4gICAgdGhpcy5oaWRlKCk7XG4gICAgdGhpcy5kZXN0cm95RWRpdG9ycygpO1xuICAgIHRoaXMuY29uZmlnID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucHJvamVjdENvbmZpZyA9IHVuZGVmaW5lZDtcblxuICAgIGlmICghdGhpcy5jb25maWdWaWV3KSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZ1ZpZXcucmVtb3ZlQ29udGVudCgpO1xuICB9XG5cbiAgZ2F0aGVyRGF0YSgpIHtcblxuICAgIGxldCBjb25maWdTdHViID0gdGhpcy5nZXRDb250ZW50KCcuLi90ZXJuLWNvbmZpZy5qc29uJywgZmFsc2UpO1xuXG4gICAgaWYgKCFjb25maWdTdHViKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnByb2plY3RDb25maWcgPSB0aGlzLmdldENvbnRlbnQoJy8udGVybi1wcm9qZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZ09iamVjdHModGhpcy5wcm9qZWN0Q29uZmlnLCB0aGlzLmNvbmZpZyk7XG5cbiAgICBpZiAodGhpcy5wcm9qZWN0Q29uZmlnKSB7XG5cbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5wcmVwYXJlRWNtYSh0aGlzLmNvbmZpZywgY29uZmlnU3R1Yik7XG4gICAgICB0aGlzLmNvbmZpZyA9IHRoaXMucHJlcGFyZUxpYnModGhpcy5jb25maWcsIGNvbmZpZ1N0dWIpO1xuXG4gICAgICBmb3IgKGxldCBwbHVnaW4gaW4gdGhpcy5jb25maWcucGx1Z2lucykge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5wbHVnaW5zW3BsdWdpbl0pIHtcblxuICAgICAgICAgIHRoaXMuY29uZmlnLnBsdWdpbnNbcGx1Z2luXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZ09iamVjdHMoY29uZmlnU3R1YiwgdGhpcy5jb25maWcpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdGhpcy5jb25maWcgPSBjb25maWdTdHViO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVtb3ZlRWRpdG9yKGVkaXRvcikge1xuXG4gICAgaWYgKCFlZGl0b3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBpZHggPSB0aGlzLmVkaXRvcnMuaW5kZXhPZihlZGl0b3IpO1xuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZWRpdG9ycy5zcGxpY2UoaWR4LCAxKTtcbiAgfVxuXG5cbiAgZGVzdHJveUVkaXRvcnMoKSB7XG5cbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKTtcbiAgICAgIGJ1ZmZlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3JzID0gW107XG4gIH1cblxuICB1cGRhdGVDb25maWcoKSB7XG5cbiAgICB0aGlzLmNvbmZpZy5sb2FkRWFnZXJseSA9IFtdO1xuICAgIHRoaXMuY29uZmlnLmRvbnRMb2FkID0gW107XG5cbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgdGhpcy5lZGl0b3JzKSB7XG5cbiAgICAgIGxldCBidWZmZXIgPSBlZGl0b3IuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKTtcbiAgICAgIGxldCB0ZXh0ID0gYnVmZmVyLmdldFRleHQoKS50cmltKCk7XG5cbiAgICAgIGlmICh0ZXh0ID09PSAnJykge1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbmZpZ1tlZGl0b3IuX190ZXJuanNfc2VjdGlvbl0ucHVzaCh0ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLmRlc3Ryb3lFZGl0b3JzKCk7XG5cbiAgICBsZXQgbmV3Q29uZmlnID0gdGhpcy5idWlsZE5ld0NvbmZpZygpO1xuICAgIGxldCBuZXdDb25maWdKU09OID0gSlNPTi5zdHJpbmdpZnkobmV3Q29uZmlnLCBudWxsLCAyKTtcblxuICAgIHRoaXMubWFuYWdlci5oZWxwZXIudXBkYXRlVGVybkZpbGUobmV3Q29uZmlnSlNPTiwgdHJ1ZSk7XG4gIH1cblxuICBidWlsZE5ld0NvbmZpZygpIHtcblxuICAgIGxldCBuZXdDb25maWcgPSB7fTtcblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmNvbmZpZy5lY21hVmVyc2lvbnMpKSB7XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5lY21hVmVyc2lvbnNba2V5XSkge1xuXG4gICAgICAgIG5ld0NvbmZpZy5lY21hVmVyc2lvbiA9IE51bWJlcihrZXlba2V5Lmxlbmd0aCAtIDFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkodGhpcy5jb25maWcubGlicykpIHtcblxuICAgICAgbmV3Q29uZmlnLmxpYnMgPSBbXTtcblxuICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMuY29uZmlnLmxpYnMpKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmxpYnNba2V5XSkge1xuXG4gICAgICAgICAgbmV3Q29uZmlnLmxpYnMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29uZmlnLmxvYWRFYWdlcmx5Lmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICBuZXdDb25maWcubG9hZEVhZ2VybHkgPSB0aGlzLmNvbmZpZy5sb2FkRWFnZXJseTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWcuZG9udExvYWQubGVuZ3RoICE9PSAwKSB7XG5cbiAgICAgIG5ld0NvbmZpZy5kb250TG9hZCA9IHRoaXMuY29uZmlnLmRvbnRMb2FkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb2plY3RDb25maWcgJiYgIV8uaXNFbXB0eSh0aGlzLnByb2plY3RDb25maWcucGx1Z2lucykpIHtcblxuICAgICAgbmV3Q29uZmlnLnBsdWdpbnMgPSB0aGlzLnByb2plY3RDb25maWcucGx1Z2lucztcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Q29uZmlnO1xuICB9XG5cbiAgaW5pdENvbmZpZ1ZpZXcoKSB7XG5cbiAgICBpZiAoIUNvbmZpZ1ZpZXcpIHtcblxuICAgICAgQ29uZmlnVmlldyA9IHJlcXVpcmUoJy4vYXRvbS10ZXJuanMtY29uZmlnLXZpZXcnKTtcbiAgICB9XG5cblxuICAgIHRoaXMuY29uZmlnVmlldyA9IG5ldyBDb25maWdWaWV3KCk7XG4gICAgdGhpcy5jb25maWdWaWV3LmluaXRpYWxpemUodGhpcyk7XG5cbiAgICB0aGlzLmNvbmZpZ1BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG5cbiAgICAgIGl0ZW06IHRoaXMuY29uZmlnVmlldyxcbiAgICAgIHByaW9yaXR5OiAwXG4gICAgfSk7XG4gICAgdGhpcy5jb25maWdQYW5lbC5oaWRlKCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG4gIH1cblxuICBzaG93KCkge1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZ1ZpZXcpIHtcblxuICAgICAgdGhpcy5pbml0Q29uZmlnVmlldygpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXIoKTtcblxuICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmNvbmZpZ1BhbmVsKS5jbGFzc0xpc3QuYWRkKCdhdG9tLXRlcm5qcy1jb25maWctcGFuZWwnKTtcblxuICAgIGlmICghdGhpcy5nYXRoZXJEYXRhKCkpIHtcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1RoZXJlIGlzIG5vIGFjdGl2ZSBwcm9qZWN0LiBQbGVhc2UgcmUtb3BlbiBvciBmb2N1cyBhdCBsZWFzdCBvbmUgSmF2YVNjcmlwdCBmaWxlIG9mIHRoZSBwcm9qZWN0IHRvIGNvbmZpZ3VyZS4nLCB7XG5cbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnVmlldy5idWlsZE9wdGlvbnNNYXJrdXAodGhpcy5tYW5hZ2VyKTtcbiAgICB0aGlzLmNvbmZpZ1BhbmVsLnNob3coKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG5cbiAgICBpZiAodGhpcy5jb25maWdWaWV3KSB7XG5cbiAgICAgIHRoaXMuY29uZmlnVmlldy5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuY29uZmlnVmlldyA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLmNvbmZpZ1BhbmVsKSB7XG5cbiAgICAgIHRoaXMuY29uZmlnUGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLmNvbmZpZ1BhbmVsID0gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=