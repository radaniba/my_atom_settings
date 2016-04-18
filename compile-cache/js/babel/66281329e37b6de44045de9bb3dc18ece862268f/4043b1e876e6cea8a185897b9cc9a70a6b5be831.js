Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _atom = require('atom');

/**
 * Provides methods to manage minimap plugins.
 * Minimap plugins are Atom packages that will augment the minimap.
 * They have a secondary activation cycle going on constrained by the minimap
 * package activation. A minimap plugin life cycle will generally look
 * like this:
 *
 * 1. The plugin module is activated by Atom through the `activate` method
 * 2. The plugin then register itself as a minimap plugin using `registerPlugin`
 * 3. The plugin is activated/deactivated according to the minimap settings.
 * 4. On the plugin module deactivation, the plugin must unregisters itself
 *    from the minimap using the `unregisterPlugin`.
 *
 * @access public
 */
'use babel';

var PluginManagement = (function (_Mixin) {
  _inherits(PluginManagement, _Mixin);

  function PluginManagement() {
    _classCallCheck(this, PluginManagement);

    _get(Object.getPrototypeOf(PluginManagement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PluginManagement, [{
    key: 'provideMinimapServiceV1',

    /**
     * Returns the Minimap main module instance.
     *
     * @return {Main} The Minimap main module instance.
     */
    value: function provideMinimapServiceV1() {
      return this;
    }

    /**
     * Initializes the properties for plugins' management.
     *
     * @access private
     */
  }, {
    key: 'initializePlugins',
    value: function initializePlugins() {
      /**
       * The registered Minimap plugins stored using their name as key.
       *
       * @type {Object}
       * @access private
       */
      this.plugins = {};
      /**
       * The plugins' subscriptions stored using the plugin names as keys.
       *
       * @type {Object}
       * @access private
       */
      this.pluginsSubscriptions = {};

      /**
       * A map that stores the display order for each plugin
       *
       * @type {Object}
       * @access private
       */
      this.pluginsOrderMap = {};
    }

    /**
     * Registers a minimap `plugin` with the given `name`.
     *
     * @param {string} name The identifying name of the plugin.
     *                      It will be used as activation settings name
     *                      as well as the key to unregister the module.
     * @param {MinimapPlugin} plugin The plugin to register.
     * @emits {did-add-plugin} with the name and a reference to the added plugin.
     * @emits {did-activate-plugin} if the plugin was activated during
     *                              the registration.
     */
  }, {
    key: 'registerPlugin',
    value: function registerPlugin(name, plugin) {
      this.plugins[name] = plugin;
      this.pluginsSubscriptions[name] = new _atom.CompositeDisposable();

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-add-plugin', event);

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.registerPluginControls(name, plugin);
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Unregisters a plugin from the minimap.
     *
     * @param {string} name The identifying name of the plugin to unregister.
     * @emits {did-remove-plugin} with the name and a reference
     *        to the added plugin.
     */
  }, {
    key: 'unregisterPlugin',
    value: function unregisterPlugin(name) {
      var plugin = this.plugins[name];

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.unregisterPluginControls(name);
      }

      delete this.plugins[name];

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-remove-plugin', event);
    }

    /**
     * Toggles the specified plugin activation state.
     *
     * @param  {string} name     The name of the plugin.
     * @param  {boolean} boolean An optional boolean to set the activation
     *                           state of the plugin. If ommitted the new plugin
     *                           state will be the the inverse of its current
     *                           state.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     */
  }, {
    key: 'togglePluginActivation',
    value: function togglePluginActivation(name, boolean) {
      var settingsKey = 'minimap.plugins.' + name;

      if (boolean !== undefined && boolean !== null) {
        atom.config.set(settingsKey, boolean);
      } else {
        atom.config.set(settingsKey, !atom.config.get(settingsKey));
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Deactivates all the plugins registered in the minimap package so far.
     *
     * @emits {did-deactivate-plugin} for each plugin deactivated by the call.
     */
  }, {
    key: 'deactivateAllPlugins',
    value: function deactivateAllPlugins() {
      for (var _ref3 of this.eachPlugin()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var _name = _ref2[0];
        var plugin = _ref2[1];

        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', { name: _name, plugin: plugin });
      }
    }

    /**
     * A generator function to iterate over registered plugins.
     *
     * @return An iterable that yield the name and reference to every plugin
     *         as an array in each iteration.
     */
  }, {
    key: 'eachPlugin',
    value: function* eachPlugin() {
      for (var _name2 in this.plugins) {
        yield [_name2, this.plugins[_name2]];
      }
    }

    /**
     * Updates the plugin activation state according to the current config.
     *
     * @param {string} name The identifying name of the plugin to update.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     * @access private
     */
  }, {
    key: 'updatesPluginActivationState',
    value: function updatesPluginActivationState(name) {
      var plugin = this.plugins[name];
      var pluginActive = plugin.isActive();
      var settingActive = atom.config.get('minimap.plugins.' + name);
      var event = { name: name, plugin: plugin };

      if (settingActive && !pluginActive) {
        plugin.activatePlugin();
        this.emitter.emit('did-activate-plugin', event);
      } else if (pluginActive && !settingActive) {
        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', event);
      }
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will register the commands and setting to manage the plugin
     * activation from the minimap settings.
     *
     * @param {string} name The identifying name of the plugin.
     * @param {MinimapPlugin} plugin The plugin instance to register
     *        controls for.
     * @listens {minimap.plugins.${name}} listen to the setting to update
     *          the plugin state accordingly.
     * @listens {minimap:toggle-${name}} listen to the command on `atom-workspace`
     *          to toggle the plugin state.
     * @access private
     */
  }, {
    key: 'registerPluginControls',
    value: function registerPluginControls(name, plugin) {
      var _this = this;

      var settingsKey = 'minimap.plugins.' + name;
      var orderSettingsKey = 'minimap.plugins.' + name + 'DecorationsZIndex';

      this.config.plugins.properties[name] = {
        type: 'boolean',
        title: name,
        description: 'Whether the ' + name + ' plugin is activated and displayed in the Minimap.',
        'default': true
      };

      this.config.plugins.properties[name + 'DecorationsZIndex'] = {
        type: 'integer',
        title: name + ' decorations order',
        description: 'The relative order of the ' + name + ' plugin\'s decorations in the layer into which they are drawn. Note that this order only apply inside a layer, so highlight-over decorations will always be displayed above line decorations as they are rendered in different layers.',
        'default': 0
      };

      if (atom.config.get(settingsKey) === undefined) {
        atom.config.set(settingsKey, true);
      }

      if (atom.config.get(orderSettingsKey) === undefined) {
        atom.config.set(orderSettingsKey, 0);
      }

      this.pluginsSubscriptions[name].add(atom.config.observe(settingsKey, function () {
        _this.updatesPluginActivationState(name);
      }));

      this.pluginsSubscriptions[name].add(atom.config.observe(orderSettingsKey, function (order) {
        _this.updatePluginsOrderMap(name);
        var event = { name: name, plugin: plugin, order: order };
        _this.emitter.emit('did-change-plugin-order', event);
      }));

      this.pluginsSubscriptions[name].add(atom.commands.add('atom-workspace', _defineProperty({}, 'minimap:toggle-' + name, function () {
        _this.togglePluginActivation(name);
      })));

      this.updatePluginsOrderMap(name);
    }

    /**
     * Updates the display order in the map for the passed-in plugin name.
     *
     * @param  {string} name the name of the plugin to update
     * @access private
     */
  }, {
    key: 'updatePluginsOrderMap',
    value: function updatePluginsOrderMap(name) {
      var orderSettingsKey = 'minimap.plugins.' + name + 'DecorationsZIndex';

      this.pluginsOrderMap[name] = atom.config.get(orderSettingsKey);
    }

    /**
     * Returns the plugins display order mapped by name.
     *
     * @return {Object} The plugins order by name
     */
  }, {
    key: 'getPluginsOrder',
    value: function getPluginsOrder() {
      return this.pluginsOrderMap;
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will unregister the commands and setting that
     * was created previously.
     *
     * @param {string} name The identifying name of the plugin.
     * @access private
     */
  }, {
    key: 'unregisterPluginControls',
    value: function unregisterPluginControls(name) {
      this.pluginsSubscriptions[name].dispose();
      delete this.pluginsSubscriptions[name];
      delete this.config.plugins.properties[name];
    }
  }]);

  return PluginManagement;
})(_mixto2['default']);

exports['default'] = PluginManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL3BsdWdpbi1tYW5hZ2VtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7OztvQkFDVyxNQUFNOzs7Ozs7Ozs7Ozs7Ozs7OztBQUgxQyxXQUFXLENBQUE7O0lBb0JVLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOzs7Ozs7OztXQU1YLG1DQUFHO0FBQUUsYUFBTyxJQUFJLENBQUE7S0FBRTs7Ozs7Ozs7O1dBT3hCLDZCQUFHOzs7Ozs7O0FBT25CLFVBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBT2pCLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7O0FBUTlCLFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFBO0tBQzFCOzs7Ozs7Ozs7Ozs7Ozs7V0FhYyx3QkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFBO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRywrQkFBeUIsQ0FBQTs7QUFFM0QsVUFBSSxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUMxQyxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQTs7QUFFMUMsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO0FBQ3JELFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDMUM7O0FBRUQsVUFBSSxDQUFDLDRCQUE0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c2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL3BsdWdpbi1tYW5hZ2VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IE1peGluIGZyb20gJ21peHRvJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbi8qKlxuICogUHJvdmlkZXMgbWV0aG9kcyB0byBtYW5hZ2UgbWluaW1hcCBwbHVnaW5zLlxuICogTWluaW1hcCBwbHVnaW5zIGFyZSBBdG9tIHBhY2thZ2VzIHRoYXQgd2lsbCBhdWdtZW50IHRoZSBtaW5pbWFwLlxuICogVGhleSBoYXZlIGEgc2Vjb25kYXJ5IGFjdGl2YXRpb24gY3ljbGUgZ29pbmcgb24gY29uc3RyYWluZWQgYnkgdGhlIG1pbmltYXBcbiAqIHBhY2thZ2UgYWN0aXZhdGlvbi4gQSBtaW5pbWFwIHBsdWdpbiBsaWZlIGN5Y2xlIHdpbGwgZ2VuZXJhbGx5IGxvb2tcbiAqIGxpa2UgdGhpczpcbiAqXG4gKiAxLiBUaGUgcGx1Z2luIG1vZHVsZSBpcyBhY3RpdmF0ZWQgYnkgQXRvbSB0aHJvdWdoIHRoZSBgYWN0aXZhdGVgIG1ldGhvZFxuICogMi4gVGhlIHBsdWdpbiB0aGVuIHJlZ2lzdGVyIGl0c2VsZiBhcyBhIG1pbmltYXAgcGx1Z2luIHVzaW5nIGByZWdpc3RlclBsdWdpbmBcbiAqIDMuIFRoZSBwbHVnaW4gaXMgYWN0aXZhdGVkL2RlYWN0aXZhdGVkIGFjY29yZGluZyB0byB0aGUgbWluaW1hcCBzZXR0aW5ncy5cbiAqIDQuIE9uIHRoZSBwbHVnaW4gbW9kdWxlIGRlYWN0aXZhdGlvbiwgdGhlIHBsdWdpbiBtdXN0IHVucmVnaXN0ZXJzIGl0c2VsZlxuICogICAgZnJvbSB0aGUgbWluaW1hcCB1c2luZyB0aGUgYHVucmVnaXN0ZXJQbHVnaW5gLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsdWdpbk1hbmFnZW1lbnQgZXh0ZW5kcyBNaXhpbiB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBNaW5pbWFwIG1haW4gbW9kdWxlIGluc3RhbmNlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNYWlufSBUaGUgTWluaW1hcCBtYWluIG1vZHVsZSBpbnN0YW5jZS5cbiAgICovXG4gIHByb3ZpZGVNaW5pbWFwU2VydmljZVYxICgpIHsgcmV0dXJuIHRoaXMgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcHJvcGVydGllcyBmb3IgcGx1Z2lucycgbWFuYWdlbWVudC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplUGx1Z2lucyAoKSB7XG4gICAgLyoqXG4gICAgICogVGhlIHJlZ2lzdGVyZWQgTWluaW1hcCBwbHVnaW5zIHN0b3JlZCB1c2luZyB0aGVpciBuYW1lIGFzIGtleS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wbHVnaW5zID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgcGx1Z2lucycgc3Vic2NyaXB0aW9ucyBzdG9yZWQgdXNpbmcgdGhlIHBsdWdpbiBuYW1lcyBhcyBrZXlzLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zID0ge31cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIHRoYXQgc3RvcmVzIHRoZSBkaXNwbGF5IG9yZGVyIGZvciBlYWNoIHBsdWdpblxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnBsdWdpbnNPcmRlck1hcCA9IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgbWluaW1hcCBgcGx1Z2luYCB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqICAgICAgICAgICAgICAgICAgICAgIEl0IHdpbGwgYmUgdXNlZCBhcyBhY3RpdmF0aW9uIHNldHRpbmdzIG5hbWVcbiAgICogICAgICAgICAgICAgICAgICAgICAgYXMgd2VsbCBhcyB0aGUga2V5IHRvIHVucmVnaXN0ZXIgdGhlIG1vZHVsZS5cbiAgICogQHBhcmFtIHtNaW5pbWFwUGx1Z2lufSBwbHVnaW4gVGhlIHBsdWdpbiB0byByZWdpc3Rlci5cbiAgICogQGVtaXRzIHtkaWQtYWRkLXBsdWdpbn0gd2l0aCB0aGUgbmFtZSBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIGFkZGVkIHBsdWdpbi5cbiAgICogQGVtaXRzIHtkaWQtYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBhY3RpdmF0ZWQgZHVyaW5nXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlZ2lzdHJhdGlvbi5cbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luIChuYW1lLCBwbHVnaW4pIHtcbiAgICB0aGlzLnBsdWdpbnNbbmFtZV0gPSBwbHVnaW5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgbGV0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1hZGQtcGx1Z2luJywgZXZlbnQpXG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnKSkge1xuICAgICAgdGhpcy5yZWdpc3RlclBsdWdpbkNvbnRyb2xzKG5hbWUsIHBsdWdpbilcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUobmFtZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVycyBhIHBsdWdpbiBmcm9tIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luIHRvIHVucmVnaXN0ZXIuXG4gICAqIEBlbWl0cyB7ZGlkLXJlbW92ZS1wbHVnaW59IHdpdGggdGhlIG5hbWUgYW5kIGEgcmVmZXJlbmNlXG4gICAqICAgICAgICB0byB0aGUgYWRkZWQgcGx1Z2luLlxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbiAobmFtZSkge1xuICAgIGxldCBwbHVnaW4gPSB0aGlzLnBsdWdpbnNbbmFtZV1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJQbHVnaW5Db250cm9scyhuYW1lKVxuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLnBsdWdpbnNbbmFtZV1cblxuICAgIGxldCBldmVudCA9IHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtcmVtb3ZlLXBsdWdpbicsIGV2ZW50KVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNwZWNpZmllZCBwbHVnaW4gYWN0aXZhdGlvbiBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lICAgICBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAcGFyYW0gIHtib29sZWFufSBib29sZWFuIEFuIG9wdGlvbmFsIGJvb2xlYW4gdG8gc2V0IHRoZSBhY3RpdmF0aW9uXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgb2YgdGhlIHBsdWdpbi4gSWYgb21taXR0ZWQgdGhlIG5ldyBwbHVnaW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSB3aWxsIGJlIHRoZSB0aGUgaW52ZXJzZSBvZiBpdHMgY3VycmVudFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLlxuICAgKiBAZW1pdHMge2RpZC1hY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICogQGVtaXRzIHtkaWQtZGVhY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKi9cbiAgdG9nZ2xlUGx1Z2luQWN0aXZhdGlvbiAobmFtZSwgYm9vbGVhbikge1xuICAgIGxldCBzZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfWBcblxuICAgIGlmIChib29sZWFuICE9PSB1bmRlZmluZWQgJiYgYm9vbGVhbiAhPT0gbnVsbCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCBib29sZWFuKVxuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoc2V0dGluZ3NLZXksICFhdG9tLmNvbmZpZy5nZXQoc2V0dGluZ3NLZXkpKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlc1BsdWdpbkFjdGl2YXRpb25TdGF0ZShuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIERlYWN0aXZhdGVzIGFsbCB0aGUgcGx1Z2lucyByZWdpc3RlcmVkIGluIHRoZSBtaW5pbWFwIHBhY2thZ2Ugc28gZmFyLlxuICAgKlxuICAgKiBAZW1pdHMge2RpZC1kZWFjdGl2YXRlLXBsdWdpbn0gZm9yIGVhY2ggcGx1Z2luIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKi9cbiAgZGVhY3RpdmF0ZUFsbFBsdWdpbnMgKCkge1xuICAgIGZvciAobGV0IFtuYW1lLCBwbHVnaW5dIG9mIHRoaXMuZWFjaFBsdWdpbigpKSB7XG4gICAgICBwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbigpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtcGx1Z2luJywgeyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyYXRvciBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgcmVnaXN0ZXJlZCBwbHVnaW5zLlxuICAgKlxuICAgKiBAcmV0dXJuIEFuIGl0ZXJhYmxlIHRoYXQgeWllbGQgdGhlIG5hbWUgYW5kIHJlZmVyZW5jZSB0byBldmVyeSBwbHVnaW5cbiAgICogICAgICAgICBhcyBhbiBhcnJheSBpbiBlYWNoIGl0ZXJhdGlvbi5cbiAgICovXG4gICogZWFjaFBsdWdpbiAoKSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLnBsdWdpbnMpIHtcbiAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLnBsdWdpbnNbbmFtZV1dXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBsdWdpbiBhY3RpdmF0aW9uIHN0YXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBjb25maWcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4gdG8gdXBkYXRlLlxuICAgKiBAZW1pdHMge2RpZC1hY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICogQGVtaXRzIHtkaWQtZGVhY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzLnBsdWdpbnNbbmFtZV1cbiAgICBjb25zdCBwbHVnaW5BY3RpdmUgPSBwbHVnaW4uaXNBY3RpdmUoKVxuICAgIGNvbnN0IHNldHRpbmdBY3RpdmUgPSBhdG9tLmNvbmZpZy5nZXQoYG1pbmltYXAucGx1Z2lucy4ke25hbWV9YClcbiAgICBjb25zdCBldmVudCA9IHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfVxuXG4gICAgaWYgKHNldHRpbmdBY3RpdmUgJiYgIXBsdWdpbkFjdGl2ZSkge1xuICAgICAgcGx1Z2luLmFjdGl2YXRlUGx1Z2luKClcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWN0aXZhdGUtcGx1Z2luJywgZXZlbnQpXG4gICAgfSBlbHNlIGlmIChwbHVnaW5BY3RpdmUgJiYgIXNldHRpbmdBY3RpdmUpIHtcbiAgICAgIHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKClcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1wbHVnaW4nLCBldmVudClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgYG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyB0b2dnbGVkLFxuICAgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgcmVnaXN0ZXIgdGhlIGNvbW1hbmRzIGFuZCBzZXR0aW5nIHRvIG1hbmFnZSB0aGUgcGx1Z2luXG4gICAqIGFjdGl2YXRpb24gZnJvbSB0aGUgbWluaW1hcCBzZXR0aW5ncy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGlkZW50aWZ5aW5nIG5hbWUgb2YgdGhlIHBsdWdpbi5cbiAgICogQHBhcmFtIHtNaW5pbWFwUGx1Z2lufSBwbHVnaW4gVGhlIHBsdWdpbiBpbnN0YW5jZSB0byByZWdpc3RlclxuICAgKiAgICAgICAgY29udHJvbHMgZm9yLlxuICAgKiBAbGlzdGVucyB7bWluaW1hcC5wbHVnaW5zLiR7bmFtZX19IGxpc3RlbiB0byB0aGUgc2V0dGluZyB0byB1cGRhdGVcbiAgICogICAgICAgICAgdGhlIHBsdWdpbiBzdGF0ZSBhY2NvcmRpbmdseS5cbiAgICogQGxpc3RlbnMge21pbmltYXA6dG9nZ2xlLSR7bmFtZX19IGxpc3RlbiB0byB0aGUgY29tbWFuZCBvbiBgYXRvbS13b3Jrc3BhY2VgXG4gICAqICAgICAgICAgIHRvIHRvZ2dsZSB0aGUgcGx1Z2luIHN0YXRlLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luQ29udHJvbHMgKG5hbWUsIHBsdWdpbikge1xuICAgIGNvbnN0IHNldHRpbmdzS2V5ID0gYG1pbmltYXAucGx1Z2lucy4ke25hbWV9YFxuICAgIGNvbnN0IG9yZGVyU2V0dGluZ3NLZXkgPSBgbWluaW1hcC5wbHVnaW5zLiR7bmFtZX1EZWNvcmF0aW9uc1pJbmRleGBcblxuICAgIHRoaXMuY29uZmlnLnBsdWdpbnMucHJvcGVydGllc1tuYW1lXSA9IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiBuYW1lLFxuICAgICAgZGVzY3JpcHRpb246IGBXaGV0aGVyIHRoZSAke25hbWV9IHBsdWdpbiBpcyBhY3RpdmF0ZWQgYW5kIGRpc3BsYXllZCBpbiB0aGUgTWluaW1hcC5gLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cblxuICAgIHRoaXMuY29uZmlnLnBsdWdpbnMucHJvcGVydGllc1tgJHtuYW1lfURlY29yYXRpb25zWkluZGV4YF0gPSB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICB0aXRsZTogYCR7bmFtZX0gZGVjb3JhdGlvbnMgb3JkZXJgLFxuICAgICAgZGVzY3JpcHRpb246IGBUaGUgcmVsYXRpdmUgb3JkZXIgb2YgdGhlICR7bmFtZX0gcGx1Z2luJ3MgZGVjb3JhdGlvbnMgaW4gdGhlIGxheWVyIGludG8gd2hpY2ggdGhleSBhcmUgZHJhd24uIE5vdGUgdGhhdCB0aGlzIG9yZGVyIG9ubHkgYXBwbHkgaW5zaWRlIGEgbGF5ZXIsIHNvIGhpZ2hsaWdodC1vdmVyIGRlY29yYXRpb25zIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhYm92ZSBsaW5lIGRlY29yYXRpb25zIGFzIHRoZXkgYXJlIHJlbmRlcmVkIGluIGRpZmZlcmVudCBsYXllcnMuYCxcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KHNldHRpbmdzS2V5KSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoc2V0dGluZ3NLZXksIHRydWUpXG4gICAgfVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldChvcmRlclNldHRpbmdzS2V5KSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQob3JkZXJTZXR0aW5nc0tleSwgMClcbiAgICB9XG5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKHNldHRpbmdzS2V5LCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUobmFtZSlcbiAgICB9KSlcblxuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0uYWRkKGF0b20uY29uZmlnLm9ic2VydmUob3JkZXJTZXR0aW5nc0tleSwgKG9yZGVyKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZVBsdWdpbnNPcmRlck1hcChuYW1lKVxuICAgICAgY29uc3QgZXZlbnQgPSB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luLCBvcmRlcjogb3JkZXIgfVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGx1Z2luLW9yZGVyJywgZXZlbnQpXG4gICAgfSkpXG5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICBbYG1pbmltYXA6dG9nZ2xlLSR7bmFtZX1gXTogKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZVBsdWdpbkFjdGl2YXRpb24obmFtZSlcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMudXBkYXRlUGx1Z2luc09yZGVyTWFwKG5hbWUpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlzcGxheSBvcmRlciBpbiB0aGUgbWFwIGZvciB0aGUgcGFzc2VkLWluIHBsdWdpbiBuYW1lLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiB0byB1cGRhdGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVQbHVnaW5zT3JkZXJNYXAgKG5hbWUpIHtcbiAgICBjb25zdCBvcmRlclNldHRpbmdzS2V5ID0gYG1pbmltYXAucGx1Z2lucy4ke25hbWV9RGVjb3JhdGlvbnNaSW5kZXhgXG5cbiAgICB0aGlzLnBsdWdpbnNPcmRlck1hcFtuYW1lXSA9IGF0b20uY29uZmlnLmdldChvcmRlclNldHRpbmdzS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBsdWdpbnMgZGlzcGxheSBvcmRlciBtYXBwZWQgYnkgbmFtZS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgcGx1Z2lucyBvcmRlciBieSBuYW1lXG4gICAqL1xuICBnZXRQbHVnaW5zT3JkZXIgKCkgeyByZXR1cm4gdGhpcy5wbHVnaW5zT3JkZXJNYXAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBgbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzYCBzZXR0aW5nIGlzIHRvZ2dsZWQsXG4gICAqIHRoaXMgZnVuY3Rpb24gd2lsbCB1bnJlZ2lzdGVyIHRoZSBjb21tYW5kcyBhbmQgc2V0dGluZyB0aGF0XG4gICAqIHdhcyBjcmVhdGVkIHByZXZpb3VzbHkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbkNvbnRyb2xzIChuYW1lKSB7XG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXVxuICAgIGRlbGV0ZSB0aGlzLmNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXNbbmFtZV1cbiAgfVxufVxuIl19
//# sourceURL=/Users/Rad/.atom/packages/minimap/lib/mixins/plugin-management.js
