Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _atomUtils = require('atom-utils');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _minimapQuickSettingsElement = require('./minimap-quick-settings-element');

var _minimapQuickSettingsElement2 = _interopRequireDefault(_minimapQuickSettingsElement);

'use babel';

var SPEC_MODE = atom.inSpecMode();

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap}
 * instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap
 * using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the
 * Minimap model so you should never have to access MinimapElement
 * instances.
 *
 * @example
 * let minimapElement = atom.views.getView(minimap)
 */

var MinimapElement = (function () {
  function MinimapElement() {
    _classCallCheck(this, _MinimapElement);
  }

  _createClass(MinimapElement, [{
    key: 'createdCallback',

    //    ##     ##  #######   #######  ##    ##  ######
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ## ##     ## ##     ## ##  ##   ##
    //    ######### ##     ## ##     ## #####     ######
    //    ##     ## ##     ## ##     ## ##  ##         ##
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ##  #######   #######  ##    ##  ######

    /**
     * DOM callback invoked when a new MinimapElement is created.
     *
     * @access private
     */
    value: function createdCallback() {
      var _this = this;

      // Core properties

      /**
       * @access private
       */
      this.minimap = undefined;
      /**
       * @access private
       */
      this.editorElement = undefined;
      /**
       * @access private
       */
      this.width = undefined;
      /**
       * @access private
       */
      this.height = undefined;

      // Subscriptions

      /**
       * @access private
       */
      this.subscriptions = new _atom.CompositeDisposable();
      /**
       * @access private
       */
      this.visibleAreaSubscription = undefined;
      /**
       * @access private
       */
      this.quickSettingsSubscription = undefined;
      /**
       * @access private
       */
      this.dragSubscription = undefined;
      /**
       * @access private
       */
      this.openQuickSettingSubscription = undefined;

      // Configs

      /**
      * @access private
      */
      this.displayMinimapOnLeft = false;
      /**
      * @access private
      */
      this.minimapScrollIndicator = undefined;
      /**
      * @access private
      */
      this.displayMinimapOnLeft = undefined;
      /**
      * @access private
      */
      this.displayPluginsControls = undefined;
      /**
      * @access private
      */
      this.textOpacity = undefined;
      /**
      * @access private
      */
      this.displayCodeHighlights = undefined;
      /**
      * @access private
      */
      this.adjustToSoftWrap = undefined;
      /**
      * @access private
      */
      this.useHardwareAcceleration = undefined;
      /**
      * @access private
      */
      this.absoluteMode = undefined;

      // Elements

      /**
       * @access private
       */
      this.shadowRoot = undefined;
      /**
       * @access private
       */
      this.visibleArea = undefined;
      /**
       * @access private
       */
      this.controls = undefined;
      /**
       * @access private
       */
      this.scrollIndicator = undefined;
      /**
       * @access private
       */
      this.openQuickSettings = undefined;
      /**
       * @access private
       */
      this.quickSettingsElement = undefined;

      // States

      /**
      * @access private
      */
      this.attached = undefined;
      /**
      * @access private
      */
      this.attachedToTextEditor = undefined;
      /**
      * @access private
      */
      this.standAlone = undefined;
      /**
       * @access private
       */
      this.wasVisible = undefined;

      // Other

      /**
       * @access private
       */
      this.offscreenFirstRow = undefined;
      /**
       * @access private
       */
      this.offscreenLastRow = undefined;
      /**
       * @access private
       */
      this.frameRequested = undefined;
      /**
       * @access private
       */
      this.flexBasis = undefined;

      this.initializeContent();

      return this.observeConfig({
        'minimap.displayMinimapOnLeft': function minimapDisplayMinimapOnLeft(displayMinimapOnLeft) {
          _this.displayMinimapOnLeft = displayMinimapOnLeft;

          _this.updateMinimapFlexPosition();
        },

        'minimap.minimapScrollIndicator': function minimapMinimapScrollIndicator(minimapScrollIndicator) {
          _this.minimapScrollIndicator = minimapScrollIndicator;

          if (_this.minimapScrollIndicator && !(_this.scrollIndicator != null) && !_this.standAlone) {
            _this.initializeScrollIndicator();
          } else if (_this.scrollIndicator != null) {
            _this.disposeScrollIndicator();
          }

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.displayPluginsControls': function minimapDisplayPluginsControls(displayPluginsControls) {
          _this.displayPluginsControls = displayPluginsControls;

          if (_this.displayPluginsControls && !(_this.openQuickSettings != null) && !_this.standAlone) {
            _this.initializeOpenQuickSettings();
          } else if (_this.openQuickSettings != null) {
            _this.disposeOpenQuickSettings();
          }
        },

        'minimap.textOpacity': function minimapTextOpacity(textOpacity) {
          _this.textOpacity = textOpacity;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.displayCodeHighlights': function minimapDisplayCodeHighlights(displayCodeHighlights) {
          _this.displayCodeHighlights = displayCodeHighlights;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.smoothScrolling': function minimapSmoothScrolling(smoothScrolling) {
          _this.smoothScrolling = smoothScrolling;

          if (_this.attached) {
            if (!_this.smoothScrolling) {
              _this.backLayer.canvas.style.cssText = '';
              _this.tokensLayer.canvas.style.cssText = '';
              _this.frontLayer.canvas.style.cssText = '';
            } else {
              _this.requestUpdate();
            }
          }
        },

        'minimap.adjustMinimapWidthToSoftWrap': function minimapAdjustMinimapWidthToSoftWrap(adjustToSoftWrap) {
          _this.adjustToSoftWrap = adjustToSoftWrap;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.useHardwareAcceleration': function minimapUseHardwareAcceleration(useHardwareAcceleration) {
          _this.useHardwareAcceleration = useHardwareAcceleration;

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.absoluteMode': function minimapAbsoluteMode(absoluteMode) {
          _this.absoluteMode = absoluteMode;

          return _this.classList.toggle('absolute', _this.absoluteMode);
        },

        'editor.preferredLineLength': function editorPreferredLineLength() {
          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'editor.softWrap': function editorSoftWrap() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.softWrapAtPreferredLineLength': function editorSoftWrapAtPreferredLineLength() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        }
      });
    }

    /**
     * DOM callback invoked when a new MinimapElement is attached to the DOM.
     *
     * @access private
     */
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      var _this2 = this;

      this.subscriptions.add(atom.views.pollDocument(function () {
        _this2.pollDOM();
      }));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();

      /*
        We use `atom.styles.onDidAddStyleElement` instead of
        `atom.themes.onDidChangeActiveThemes`.
        Why? Currently, The style element will be removed first, and then re-added
        and the `change` event has not be triggered in the process.
      */
      this.subscriptions.add(atom.styles.onDidAddStyleElement(function () {
        _this2.invalidateDOMStylesCache();
        _this2.requestForcedUpdate();
      }));

      this.subscriptions.add(this.subscribeToMediaQuery());
    }

    /**
     * DOM callback invoked when a new MinimapElement is detached from the DOM.
     *
     * @access private
     */
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      this.attached = false;
    }

    //       ###    ######## ########    ###     ######  ##     ##
    //      ## ##      ##       ##      ## ##   ##    ## ##     ##
    //     ##   ##     ##       ##     ##   ##  ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##       #########
    //    #########    ##       ##    ######### ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
    //    ##     ##    ##       ##    ##     ##  ######  ##     ##

    /**
     * Returns whether the MinimapElement is currently visible on screen or not.
     *
     * The visibility of the minimap is defined by testing the size of the offset
     * width and height of the element.
     *
     * @return {boolean} whether the MinimapElement is currently visible or not
     */
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    }

    /**
     * Attaches the MinimapElement to the DOM.
     *
     * The position at which the element is attached is defined by the
     * `displayMinimapOnLeft` setting.
     *
     * @param  {HTMLElement} [parent] the DOM node where attaching the minimap
     *                                element
     */
  }, {
    key: 'attach',
    value: function attach(parent) {
      if (this.attached) {
        return;
      }
      (parent || this.getTextEditorElementRoot()).appendChild(this);
    }

    /**
     * Detaches the MinimapElement from the DOM.
     */
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.attached || this.parentNode == null) {
        return;
      }
      this.parentNode.removeChild(this);
    }

    /**
     * Toggles the minimap left/right position based on the value of the
     * `displayMinimapOnLeft` setting.
     *
     * @access private
     */
  }, {
    key: 'updateMinimapFlexPosition',
    value: function updateMinimapFlexPosition() {
      this.classList.toggle('left', this.displayMinimapOnLeft);
    }

    /**
     * Destroys this MinimapElement
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscriptions.dispose();
      this.detach();
      this.minimap = null;
    }

    //     ######   #######  ##    ## ######## ######## ##    ## ########
    //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
    //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
    //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
    //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
    //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
    //     ######   #######  ##    ##    ##    ######## ##    ##    ##

    /**
     * Creates the content of the MinimapElement and attaches the mouse control
     * event listeners.
     *
     * @access private
     */
  }, {
    key: 'initializeContent',
    value: function initializeContent() {
      var _this3 = this;

      this.initializeCanvas();

      this.shadowRoot = this.createShadowRoot();
      this.attachCanvases(this.shadowRoot);

      this.createVisibleArea();
      this.createControls();

      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': function mousewheel(e) {
          if (!_this3.standAlone) {
            _this3.relayMousewheelEvent(e);
          }
        }
      }));

      this.subscriptions.add(this.subscribeTo(this.getFrontCanvas(), {
        'mousedown': function mousedown(e) {
          _this3.canvasPressed(_this3.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this3.canvasPressed(_this3.extractTouchEventData(e));
        }
      }));
    }

    /**
     * Initializes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'createVisibleArea',
    value: function createVisibleArea() {
      var _this4 = this;

      if (this.visibleArea) {
        return;
      }

      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': function mousedown(e) {
          _this4.startDrag(_this4.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this4.startDrag(_this4.extractTouchEventData(e));
        }
      });

      this.subscriptions.add(this.visibleAreaSubscription);
    }

    /**
     * Removes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'removeVisibleArea',
    value: function removeVisibleArea() {
      if (!this.visibleArea) {
        return;
      }

      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      delete this.visibleArea;
    }

    /**
     * Creates the controls container div.
     *
     * @access private
     */
  }, {
    key: 'createControls',
    value: function createControls() {
      if (this.controls || this.standAlone) {
        return;
      }

      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      this.shadowRoot.appendChild(this.controls);
    }

    /**
     * Removes the controls container div.
     *
     * @access private
     */
  }, {
    key: 'removeControls',
    value: function removeControls() {
      if (!this.controls) {
        return;
      }

      this.shadowRoot.removeChild(this.controls);
      delete this.controls;
    }

    /**
     * Initializes the scroll indicator div when the `minimapScrollIndicator`
     * settings is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeScrollIndicator',
    value: function initializeScrollIndicator() {
      if (this.scrollIndicator || this.standAlone) {
        return;
      }

      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      this.controls.appendChild(this.scrollIndicator);
    }

    /**
     * Disposes the scroll indicator div when the `minimapScrollIndicator`
     * settings is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeScrollIndicator',
    value: function disposeScrollIndicator() {
      if (!this.scrollIndicator) {
        return;
      }

      this.controls.removeChild(this.scrollIndicator);
      delete this.scrollIndicator;
    }

    /**
     * Initializes the quick settings openener div when the
     * `displayPluginsControls` setting is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeOpenQuickSettings',
    value: function initializeOpenQuickSettings() {
      var _this5 = this;

      if (this.openQuickSettings || this.standAlone) {
        return;
      }

      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);

      this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new _minimapQuickSettingsElement2['default']();
            _this5.quickSettingsElement.setModel(_this5);
            _this5.quickSettingsSubscription = _this5.quickSettingsElement.onDidDestroy(function () {
              _this5.quickSettingsElement = null;
            });

            var _getFrontCanvas$getBoundingClientRect = _this5.getFrontCanvas().getBoundingClientRect();

            var _top = _getFrontCanvas$getBoundingClientRect.top;
            var left = _getFrontCanvas$getBoundingClientRect.left;
            var right = _getFrontCanvas$getBoundingClientRect.right;

            _this5.quickSettingsElement.style.top = _top + 'px';
            _this5.quickSettingsElement.attach();

            if (_this5.displayMinimapOnLeft) {
              _this5.quickSettingsElement.style.left = right + 'px';
            } else {
              _this5.quickSettingsElement.style.left = left - _this5.quickSettingsElement.clientWidth + 'px';
            }
          }
        }
      });
    }

    /**
     * Disposes the quick settings openener div when the `displayPluginsControls`
     * setting is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeOpenQuickSettings',
    value: function disposeOpenQuickSettings() {
      if (!this.openQuickSettings) {
        return;
      }

      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      delete this.openQuickSettings;
    }

    /**
     * Returns the target `TextEditor` of the Minimap.
     *
     * @return {TextEditor} the minimap's text editor
     */
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this.minimap.getTextEditor();
    }

    /**
     * Returns the `TextEditorElement` for the Minimap's `TextEditor`.
     *
     * @return {TextEditorElement} the minimap's text editor element
     */
  }, {
    key: 'getTextEditorElement',
    value: function getTextEditorElement() {
      if (this.editorElement) {
        return this.editorElement;
      }

      this.editorElement = atom.views.getView(this.getTextEditor());
      return this.editorElement;
    }

    /**
     * Returns the root of the `TextEditorElement` content.
     *
     * This method is mostly used to ensure compatibility with the `shadowDom`
     * setting.
     *
     * @return {HTMLElement} the root of the `TextEditorElement` content
     */
  }, {
    key: 'getTextEditorElementRoot',
    value: function getTextEditorElementRoot() {
      var editorElement = this.getTextEditorElement();

      if (editorElement.shadowRoot) {
        return editorElement.shadowRoot;
      } else {
        return editorElement;
      }
    }

    /**
     * Returns the root where to inject the dummy node used to read DOM styles.
     *
     * @param  {boolean} shadowRoot whether to use the text editor shadow DOM
     *                              or not
     * @return {HTMLElement} the root node where appending the dummy node
     * @access private
     */
  }, {
    key: 'getDummyDOMRoot',
    value: function getDummyDOMRoot(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    }

    //    ##     ##  #######  ########  ######## ##
    //    ###   ### ##     ## ##     ## ##       ##
    //    #### #### ##     ## ##     ## ##       ##
    //    ## ### ## ##     ## ##     ## ######   ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ##  #######  ########  ######## ########

    /**
     * Returns the Minimap for which this MinimapElement was created.
     *
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.minimap;
    }

    /**
     * Defines the Minimap model for this MinimapElement instance.
     *
     * @param  {Minimap} minimap the Minimap model for this instance.
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this6 = this;

      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidDestroy(function () {
        _this6.destroy();
      }));
      this.subscriptions.add(this.minimap.onDidChangeConfig(function () {
        if (_this6.attached) {
          return _this6.requestForcedUpdate();
        }
      }));

      this.subscriptions.add(this.minimap.onDidChangeStandAlone(function () {
        _this6.setStandAlone(_this6.minimap.isStandAlone());
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChange(function (change) {
        _this6.pendingChanges.push(change);
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChangeDecorationRange(function (change) {
        var type = change.type;

        if (type === 'line' || type === 'highlight-under') {
          _this6.pendingBackDecorationChanges.push(change);
        } else {
          _this6.pendingFrontDecorationChanges.push(change);
        }
        _this6.requestUpdate();
      }));

      this.subscriptions.add(_main2['default'].onDidChangePluginOrder(function () {
        _this6.requestForcedUpdate();
      }));

      this.setStandAlone(this.minimap.isStandAlone());

      if (this.width != null && this.height != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      return this.minimap;
    }

    /**
     * Sets the stand-alone mode for this MinimapElement.
     *
     * @param {boolean} standAlone the new mode for this MinimapElement
     */
  }, {
    key: 'setStandAlone',
    value: function setStandAlone(standAlone) {
      this.standAlone = standAlone;

      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          this.initializeOpenQuickSettings();
        }
      }
    }

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    /**
     * Requests an update to be performed on the next frame.
     */
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this7 = this;

      if (this.frameRequested) {
        return;
      }

      this.frameRequested = true;
      requestAnimationFrame(function () {
        _this7.update();
        _this7.frameRequested = false;
      });
    }

    /**
     * Requests an update to be performed on the next frame that will completely
     * redraw the minimap.
     */
  }, {
    key: 'requestForcedUpdate',
    value: function requestForcedUpdate() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      this.requestUpdate();
    }

    /**
     * Performs the actual MinimapElement update.
     *
     * @access private
     */
  }, {
    key: 'update',
    value: function update() {
      if (!(this.attached && this.isVisible() && this.minimap)) {
        return;
      }
      var minimap = this.minimap;
      minimap.enableCache();
      var canvas = this.getFrontCanvas();

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      var visibleWidth = Math.min(canvas.width / devicePixelRatio, this.width);

      if (this.adjustToSoftWrap && this.flexBasis) {
        this.style.flexBasis = this.flexBasis + 'px';
      } else {
        this.style.flexBasis = null;
      }

      if (SPEC_MODE) {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          top: visibleAreaTop + 'px',
          left: visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(visibleAreaLeft, visibleAreaTop)
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      var canvasTransform = this.makeTranslate(0, canvasTop);
      if (devicePixelRatio !== 1) {
        canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
      }

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
      }

      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }

      if (this.scrollIndicator != null) {
        var minimapScreenHeight = minimap.getScreenHeight();
        var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getScrollRatio();

        if (SPEC_MODE) {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            top: indicatorScroll + 'px'
          });
        } else {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            transform: this.makeTranslate(0, indicatorScroll)
          });
        }

        if (!minimap.canScroll()) {
          this.disposeScrollIndicator();
        }
      }

      this.updateCanvas();
      minimap.clearCache();
    }

    /**
     * Defines whether to render the code highlights or not.
     *
     * @param {Boolean} displayCodeHighlights whether to render the code
     *                                        highlights or not
     */
  }, {
    key: 'setDisplayCodeHighlights',
    value: function setDisplayCodeHighlights(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        this.requestForcedUpdate();
      }
    }

    /**
     * Polling callback used to detect visibility and size changes.
     *
     * @access private
     */
  }, {
    key: 'pollDOM',
    value: function pollDOM() {
      var visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }

        this.measureHeightAndWidth(visibilityChanged, false);
      }
    }

    /**
     * A method that checks for visibility changes in the MinimapElement.
     * The method returns `true` when the visibility changed from visible to
     * hidden or from hidden to visible.
     *
     * @return {boolean} whether the visibility changed or not since the last call
     * @access private
     */
  }, {
    key: 'checkForVisibilityChange',
    value: function checkForVisibilityChange() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          this.wasVisible = true;
          return this.wasVisible;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          this.wasVisible = false;
          return this.wasVisible;
        }
      }
    }

    /**
     * A method used to measure the size of the MinimapElement and update internal
     * components based on the new size.
     *
     * @param  {boolean} visibilityChanged did the visibility changed since last
     *                                     measurement
     * @param  {[type]} [forceUpdate=true] forces the update even when no changes
     *                                     were detected
     * @access private
     */
  }, {
    key: 'measureHeightAndWidth',
    value: function measureHeightAndWidth(visibilityChanged) {
      var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.minimap) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;

      this.height = this.clientHeight;
      this.width = this.clientWidth;
      var canvasWidth = this.width;

      if (this.minimap != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      if (wasResized || visibilityChanged || forceUpdate) {
        this.requestForcedUpdate();
      }

      if (!this.isVisible()) {
        return;
      }

      if (wasResized || forceUpdate) {
        if (this.adjustToSoftWrap) {
          var lineLength = atom.config.get('editor.preferredLineLength');
          var softWrap = atom.config.get('editor.softWrap');
          var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          var width = lineLength * this.minimap.getCharWidth();

          if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        var canvas = this.getFrontCanvas();
        if (canvasWidth !== canvas.width || this.height !== canvas.height) {
          this.setCanvasesSize(canvasWidth * devicePixelRatio, (this.height + this.minimap.getLineHeight()) * devicePixelRatio);
        }
      }
    }

    //    ######## ##     ## ######## ##    ## ########  ######
    //    ##       ##     ## ##       ###   ##    ##    ##    ##
    //    ##       ##     ## ##       ####  ##    ##    ##
    //    ######   ##     ## ######   ## ## ##    ##     ######
    //    ##        ##   ##  ##       ##  ####    ##          ##
    //    ##         ## ##   ##       ##   ###    ##    ##    ##
    //    ########    ###    ######## ##    ##    ##     ######

    /**
     * Helper method to register config observers.
     *
     * @param  {Object} configs={} an object mapping the config name to observe
     *                             with the function to call back when a change
     *                             occurs
     * @access private
     */
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      for (var config in configs) {
        this.subscriptions.add(atom.config.observe(config, configs[config]));
      }
    }

    /**
     * Callback triggered when the mouse is pressed on the MinimapElement canvas.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'canvasPressed',
    value: function canvasPressed(_ref) {
      var y = _ref.y;
      var isLeftMouse = _ref.isLeftMouse;
      var isMiddleMouse = _ref.isMiddleMouse;

      if (this.minimap.isStandAlone()) {
        return;
      }
      if (isLeftMouse) {
        this.canvasLeftMousePressed(y);
      } else if (isMiddleMouse) {
        this.canvasMiddleMousePressed(y);

        var _visibleArea$getBoundingClientRect = this.visibleArea.getBoundingClientRect();

        var _top2 = _visibleArea$getBoundingClientRect.top;
        var height = _visibleArea$getBoundingClientRect.height;

        this.startDrag({ y: _top2 + height / 2, isLeftMouse: false, isMiddleMouse: true });
      }
    }

    /**
     * Callback triggered when the mouse left button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @param  {HTMLElement} e.target the source of the event
     * @access private
     */
  }, {
    key: 'canvasLeftMousePressed',
    value: function canvasLeftMousePressed(y) {
      var _this8 = this;

      var deltaY = y - this.getBoundingClientRect().top;
      var row = Math.floor(deltaY / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();

      var textEditor = this.minimap.getTextEditor();

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.scrollAnimation')) {
        var from = this.minimap.getTextEditorScrollTop();
        var to = scrollTop;
        var step = function step(now) {
          return _this8.minimap.setTextEditorScrollTop(now);
        };
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        this.animate({ from: from, to: to, duration: duration, step: step });
      } else {
        this.minimap.setTextEditorScrollTop(scrollTop);
      }
    }

    /**
     * Callback triggered when the mouse middle button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @access private
     */
  }, {
    key: 'canvasMiddleMousePressed',
    value: function canvasMiddleMousePressed(y) {
      var _getBoundingClientRect = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect.top;

      var deltaY = y - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * A method that relays the `mousewheel` events received by the MinimapElement
     * to the `TextEditorElement`.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'relayMousewheelEvent',
    value: function relayMousewheelEvent(e) {
      if (this.minimap.scrollIndependentlyOnMouseWheel()) {
        this.minimap.onMouseWheel(e);
      } else {
        this.getTextEditorElement().component.onMouseWheel(e);
      }
    }

    /**
     * A method that extracts data from a `MouseEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractTouchEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {MouseEvent} mouseEvent the mouse event object
     * @access private
     */
  }, {
    key: 'extractMouseEventData',
    value: function extractMouseEventData(mouseEvent) {
      return {
        x: mouseEvent.pageX,
        y: mouseEvent.pageY,
        isLeftMouse: mouseEvent.which === 1,
        isMiddleMouse: mouseEvent.which === 2
      };
    }

    /**
     * A method that extracts data from a `TouchEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractMouseEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {TouchEvent} touchEvent the touch event object
     * @access private
     */
  }, {
    key: 'extractTouchEventData',
    value: function extractTouchEventData(touchEvent) {
      // Use the first touch on the target area. Other touches will be ignored in
      // case of multi-touch.
      var touch = touchEvent.changedTouches[0];

      return {
        x: touch.pageX,
        y: touch.pageY,
        isLeftMouse: true, // Touch is treated like a left mouse button click
        isMiddleMouse: false
      };
    }

    /**
     * Subscribes to a media query for device pixel ratio changes and forces
     * a repaint when it occurs.
     *
     * @return {Disposable} a disposable to remove the media query listener
     * @access private
     */
  }, {
    key: 'subscribeToMediaQuery',
    value: function subscribeToMediaQuery() {
      var _this9 = this;

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new _atom.Disposable(function () {
        mediaQuery.removeListener(mediaListener);
      });
    }

    //    ########    ####    ########
    //    ##     ##  ##  ##   ##     ##
    //    ##     ##   ####    ##     ##
    //    ##     ##  ####     ##     ##
    //    ##     ## ##  ## ## ##     ##
    //    ##     ## ##   ##   ##     ##
    //    ########   ####  ## ########

    /**
     * A method triggered when the mouse is pressed over the visible area that
     * starts the dragging gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'startDrag',
    value: function startDrag(_ref2) {
      var _this10 = this;

      var y = _ref2.y;
      var isLeftMouse = _ref2.isLeftMouse;
      var isMiddleMouse = _ref2.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }

      var _visibleArea$getBoundingClientRect2 = this.visibleArea.getBoundingClientRect();

      var top = _visibleArea$getBoundingClientRect2.top;

      var _getBoundingClientRect2 = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect2.top;

      var dragOffset = y - top;

      var initial = { dragOffset: dragOffset, offsetTop: offsetTop };

      var mousemoveHandler = function mousemoveHandler(e) {
        return _this10.drag(_this10.extractMouseEventData(e), initial);
      };
      var mouseupHandler = function mouseupHandler(e) {
        return _this10.endDrag();
      };

      var touchmoveHandler = function touchmoveHandler(e) {
        return _this10.drag(_this10.extractTouchEventData(e), initial);
      };
      var touchendHandler = function touchendHandler(e) {
        return _this10.endDrag();
      };

      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);

      document.body.addEventListener('touchmove', touchmoveHandler);
      document.body.addEventListener('touchend', touchendHandler);
      document.body.addEventListener('touchcancel', touchendHandler);

      this.dragSubscription = new _atom.Disposable(function () {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);

        document.body.removeEventListener('touchmove', touchmoveHandler);
        document.body.removeEventListener('touchend', touchendHandler);
        document.body.removeEventListener('touchcancel', touchendHandler);
      });
    }

    /**
     * The method called during the drag gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'drag',
    value: function drag(_ref3, initial) {
      var y = _ref3.y;
      var isLeftMouse = _ref3.isLeftMouse;
      var isMiddleMouse = _ref3.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }
      var deltaY = y - initial.offsetTop - initial.dragOffset;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * The method that ends the drag gesture.
     *
     * @access private
     */
  }, {
    key: 'endDrag',
    value: function endDrag() {
      if (!this.minimap) {
        return;
      }
      this.dragSubscription.dispose();
    }

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    /**
     * Applies the passed-in styles properties to the specified element
     *
     * @param  {HTMLElement} element the element onto which apply the styles
     * @param  {Object} styles the styles to apply
     * @access private
     */
  }, {
    key: 'applyStyles',
    value: function applyStyles(element, styles) {
      if (!element) {
        return;
      }

      var cssText = '';
      for (var property in styles) {
        cssText += property + ': ' + styles[property] + '; ';
      }

      element.style.cssText = cssText;
    }

    /**
     * Returns a string with a CSS translation tranform value.
     *
     * @param  {number} [x = 0] the x offset of the translation
     * @param  {number} [y = 0] the y offset of the translation
     * @return {string} the CSS translation string
     * @access private
     */
  }, {
    key: 'makeTranslate',
    value: function makeTranslate() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (this.useHardwareAcceleration) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
      }
    }

    /**
     * Returns a string with a CSS scaling tranform value.
     *
     * @param  {number} [x = 0] the x scaling factor
     * @param  {number} [y = 0] the y scaling factor
     * @return {string} the CSS scaling string
     * @access private
     */
  }, {
    key: 'makeScale',
    value: function makeScale() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? x : arguments[1];
      return (function () {
        if (this.useHardwareAcceleration) {
          return 'scale3d(' + x + ', ' + y + ', 1)';
        } else {
          return 'scale(' + x + ', ' + y + ')';
        }
      }).apply(this, arguments);
    }

    /**
     * A method that return the current time as a Date.
     *
     * That method exist so that we can mock it in tests.
     *
     * @return {Date} the current time as Date
     * @access private
     */
  }, {
    key: 'getTime',
    value: function getTime() {
      return new Date();
    }

    /**
     * A method that mimic the jQuery `animate` method and used to animate the
     * scroll when clicking on the MinimapElement canvas.
     *
     * @param  {Object} param the animation data object
     * @param  {[type]} param.from the start value
     * @param  {[type]} param.to the end value
     * @param  {[type]} param.duration the animation duration
     * @param  {[type]} param.step the easing function for the animation
     * @access private
     */
  }, {
    key: 'animate',
    value: function animate(_ref4) {
      var _this11 = this;

      var from = _ref4.from;
      var to = _ref4.to;
      var duration = _ref4.duration;
      var step = _ref4.step;

      var progress = undefined;
      var start = this.getTime();

      var swing = function swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };

      var update = function update() {
        if (!_this11.minimap) {
          return;
        }

        var passed = _this11.getTime() - start;
        if (duration === 0) {
          progress = 1;
        } else {
          progress = passed / duration;
        }
        if (progress > 1) {
          progress = 1;
        }
        var delta = swing(progress);
        step(from + (to - from) * delta);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      update();
    }
  }], [{
    key: 'registerViewProvider',

    /**
     * The method that registers the MinimapElement factory in the
     * `atom.views` registry with the Minimap model.
     */
    value: function registerViewProvider(Minimap) {
      atom.views.addViewProvider(Minimap, function (model) {
        var element = new MinimapElement();
        element.setModel(model);
        return element;
      });
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRThDLE1BQU07O3lCQUNILFlBQVk7O29CQUM1QyxRQUFROzs7O2lDQUNMLHNCQUFzQjs7OztpQ0FDdEIsc0JBQXNCOzs7O3FDQUNkLDRCQUE0Qjs7OztrQ0FDL0Isd0JBQXdCOzs7OzJDQUNULGtDQUFrQzs7OztBQVQxRSxXQUFXLENBQUE7O0FBV1gsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztJQWtCZCxjQUFjO1dBQWQsY0FBYzs7OztlQUFkLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7V0EyQmpCLDJCQUFHOzs7Ozs7OztBQU1qQixVQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQTs7OztBQUl4QixVQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQTs7OztBQUk5QixVQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQTs7OztBQUl0QixVQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQTs7Ozs7OztBQU92QixVQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOzs7O0FBSTlDLFVBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEMsVUFBSSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQTs7OztBQUkxQyxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSWpDLFVBQUksQ0FBQyw0QkFBNEIsR0FBRyxTQUFTLENBQUE7Ozs7Ozs7QUFPN0MsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQTs7OztBQUlqQyxVQUFJLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXZDLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUE7Ozs7QUFJckMsVUFBSSxDQUFDLHNCQUFzQixH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QUFBLEdBQUksS0FBSyxDQUFDLENBQUE7O0FBRWhDLFlBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtBQUFFLCtCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQUU7T0FDcEQsQ0FBQTs7QUFFRCxZQUFNLEVBQUUsQ0FBQTtLQUNUOzs7Ozs7OztXQTl0QzJCLDhCQUFDLE9BQU8sRUFBRTtBQUNwQyxVQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDbkQsWUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQTtBQUNsQyxlQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZCLGVBQU8sT0FBTyxDQUFBO09BQ2YsQ0FBQyxDQUFBO0tBQ0g7Ozt3QkFaa0IsY0FBYztBQUFkLGdCQUFjLEdBRGxDLGtLQUEwRSxDQUN0RCxjQUFjLEtBQWQsY0FBYztBQUFkLGdCQUFjLEdBRmxDLG9DQUFRLDBCQUEwQixDQUFDLENBRWYsY0FBYyxLQUFkLGNBQWM7U0FBZCxjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7RXZlbnRzRGVsZWdhdGlvbiwgQW5jZXN0b3JzTWV0aG9kc30gZnJvbSAnYXRvbS11dGlscydcbmltcG9ydCBNYWluIGZyb20gJy4vbWFpbidcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuaW1wb3J0IGVsZW1lbnQgZnJvbSAnLi9kZWNvcmF0b3JzL2VsZW1lbnQnXG5pbXBvcnQgRE9NU3R5bGVzUmVhZGVyIGZyb20gJy4vbWl4aW5zL2RvbS1zdHlsZXMtcmVhZGVyJ1xuaW1wb3J0IENhbnZhc0RyYXdlciBmcm9tICcuL21peGlucy9jYW52YXMtZHJhd2VyJ1xuaW1wb3J0IE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCBmcm9tICcuL21pbmltYXAtcXVpY2stc2V0dGluZ3MtZWxlbWVudCdcblxuY29uc3QgU1BFQ19NT0RFID0gYXRvbS5pblNwZWNNb2RlKClcblxuLyoqXG4gKiBQdWJsaWM6IFRoZSBNaW5pbWFwRWxlbWVudCBpcyB0aGUgdmlldyBtZWFudCB0byByZW5kZXIgYSB7QGxpbmsgTWluaW1hcH1cbiAqIGluc3RhbmNlIGluIHRoZSBET00uXG4gKlxuICogWW91IGNhbiByZXRyaWV2ZSB0aGUgTWluaW1hcEVsZW1lbnQgYXNzb2NpYXRlZCB0byBhIE1pbmltYXBcbiAqIHVzaW5nIHRoZSBgYXRvbS52aWV3cy5nZXRWaWV3YCBtZXRob2QuXG4gKlxuICogTm90ZSB0aGF0IG1vc3QgaW50ZXJhY3Rpb25zIHdpdGggdGhlIE1pbmltYXAgcGFja2FnZSBpcyBkb25lIHRocm91Z2ggdGhlXG4gKiBNaW5pbWFwIG1vZGVsIHNvIHlvdSBzaG91bGQgbmV2ZXIgaGF2ZSB0byBhY2Nlc3MgTWluaW1hcEVsZW1lbnRcbiAqIGluc3RhbmNlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogbGV0IG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG4gKi9cbkBlbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKVxuQGluY2x1ZGUoRE9NU3R5bGVzUmVhZGVyLCBDYW52YXNEcmF3ZXIsIEV2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHMpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pbWFwRWxlbWVudCB7XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdGhhdCByZWdpc3RlcnMgdGhlIE1pbmltYXBFbGVtZW50IGZhY3RvcnkgaW4gdGhlXG4gICAqIGBhdG9tLnZpZXdzYCByZWdpc3RyeSB3aXRoIHRoZSBNaW5pbWFwIG1vZGVsLlxuICAgKi9cbiAgc3RhdGljIHJlZ2lzdGVyVmlld1Byb3ZpZGVyIChNaW5pbWFwKSB7XG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoTWluaW1hcCwgZnVuY3Rpb24gKG1vZGVsKSB7XG4gICAgICBsZXQgZWxlbWVudCA9IG5ldyBNaW5pbWFwRWxlbWVudCgpXG4gICAgICBlbGVtZW50LnNldE1vZGVsKG1vZGVsKVxuICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICB9KVxuICB9XG5cbiAgLy8gICAgIyMgICAgICMjICAjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAjI1xuICAvLyAgICAjIyMjIyMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAjIyAgICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZWRDYWxsYmFjayAoKSB7XG4gICAgLy8gQ29yZSBwcm9wZXJ0aWVzXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm1pbmltYXAgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLndpZHRoID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5oZWlnaHQgPSB1bmRlZmluZWRcblxuICAgIC8vIFN1YnNjcmlwdGlvbnNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG5cbiAgICAvLyBDb25maWdzXG5cbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IGZhbHNlXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnRleHRPcGFjaXR5ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYWJzb2x1dGVNb2RlID0gdW5kZWZpbmVkXG5cbiAgICAvLyBFbGVtZW50c1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zaGFkb3dSb290ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy52aXNpYmxlQXJlYSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuY29udHJvbHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNjcm9sbEluZGljYXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50ID0gdW5kZWZpbmVkXG5cbiAgICAvLyBTdGF0ZXNcblxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmF0dGFjaGVkID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYXR0YWNoZWRUb1RleHRFZGl0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5zdGFuZEFsb25lID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy53YXNWaXNpYmxlID0gdW5kZWZpbmVkXG5cbiAgICAvLyBPdGhlclxuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmZsZXhCYXNpcyA9IHVuZGVmaW5lZFxuXG4gICAgdGhpcy5pbml0aWFsaXplQ29udGVudCgpXG5cbiAgICByZXR1cm4gdGhpcy5vYnNlcnZlQ29uZmlnKHtcbiAgICAgICdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JzogKGRpc3BsYXlNaW5pbWFwT25MZWZ0KSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSBkaXNwbGF5TWluaW1hcE9uTGVmdFxuXG4gICAgICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJzogKG1pbmltYXBTY3JvbGxJbmRpY2F0b3IpID0+IHtcbiAgICAgICAgdGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yID0gbWluaW1hcFNjcm9sbEluZGljYXRvclxuXG4gICAgICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgJiYgISh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSAmJiAhdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scyc6IChkaXNwbGF5UGx1Z2luc0NvbnRyb2xzKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyA9IGRpc3BsYXlQbHVnaW5zQ29udHJvbHNcblxuICAgICAgICBpZiAodGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzICYmICEodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSAmJiAhdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLm9wZW5RdWlja1NldHRpbmdzICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC50ZXh0T3BhY2l0eSc6ICh0ZXh0T3BhY2l0eSkgPT4ge1xuICAgICAgICB0aGlzLnRleHRPcGFjaXR5ID0gdGV4dE9wYWNpdHlcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMnOiAoZGlzcGxheUNvZGVIaWdobGlnaHRzKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gZGlzcGxheUNvZGVIaWdobGlnaHRzXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuc21vb3RoU2Nyb2xsaW5nJzogKHNtb290aFNjcm9sbGluZykgPT4ge1xuICAgICAgICB0aGlzLnNtb290aFNjcm9sbGluZyA9IHNtb290aFNjcm9sbGluZ1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgICAgICAgdGhpcy5iYWNrTGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgICAgdGhpcy50b2tlbnNMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgICB0aGlzLmZyb250TGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCc6IChhZGp1c3RUb1NvZnRXcmFwKSA9PiB7XG4gICAgICAgIHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCA9IGFkanVzdFRvU29mdFdyYXBcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uJzogKHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1c2VIYXJkd2FyZUFjY2VsZXJhdGlvblxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFic29sdXRlTW9kZSc6IChhYnNvbHV0ZU1vZGUpID0+IHtcbiAgICAgICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSBhYnNvbHV0ZU1vZGVcblxuICAgICAgICByZXR1cm4gdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhYnNvbHV0ZScsIHRoaXMuYWJzb2x1dGVNb2RlKVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXAnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udmlld3MucG9sbERvY3VtZW50KCgpID0+IHsgdGhpcy5wb2xsRE9NKCkgfSkpXG4gICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdGhpcy5wYXJlbnROb2RlID09PSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG5cbiAgICAvKlxuICAgICAgV2UgdXNlIGBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudGAgaW5zdGVhZCBvZlxuICAgICAgYGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzYC5cbiAgICAgIFdoeT8gQ3VycmVudGx5LCBUaGUgc3R5bGUgZWxlbWVudCB3aWxsIGJlIHJlbW92ZWQgZmlyc3QsIGFuZCB0aGVuIHJlLWFkZGVkXG4gICAgICBhbmQgdGhlIGBjaGFuZ2VgIGV2ZW50IGhhcyBub3QgYmUgdHJpZ2dlcmVkIGluIHRoZSBwcm9jZXNzLlxuICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGVET01TdHlsZXNDYWNoZSgpXG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvTWVkaWFRdWVyeSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRldGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuYXR0YWNoZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gICAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjICAgICMjIyAgICAgIyMjIyMjICAjIyAgICAgIyNcbiAgLy8gICAgICAjIyAjIyAgICAgICMjICAgICAgICMjICAgICAgIyMgIyMgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgICMjICAgIyMgICAgICMjICAgICAgICMjICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjIyMjIyNcbiAgLy8gICAgIyMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjICAjIyAgICAgIyNcblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvbiBzY3JlZW4gb3Igbm90LlxuICAgKlxuICAgKiBUaGUgdmlzaWJpbGl0eSBvZiB0aGUgbWluaW1hcCBpcyBkZWZpbmVkIGJ5IHRlc3RpbmcgdGhlIHNpemUgb2YgdGhlIG9mZnNldFxuICAgKiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvciBub3RcbiAgICovXG4gIGlzVmlzaWJsZSAoKSB7IHJldHVybiB0aGlzLm9mZnNldFdpZHRoID4gMCB8fCB0aGlzLm9mZnNldEhlaWdodCA+IDAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogVGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIGlzIGRlZmluZWQgYnkgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IFtwYXJlbnRdIHRoZSBET00gbm9kZSB3aGVyZSBhdHRhY2hpbmcgdGhlIG1pbmltYXBcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICovXG4gIGF0dGFjaCAocGFyZW50KSB7XG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIH1cbiAgICAocGFyZW50IHx8IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KCkpLmFwcGVuZENoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIE1pbmltYXBFbGVtZW50IGZyb20gdGhlIERPTS5cbiAgICovXG4gIGRldGFjaCAoKSB7XG4gICAgaWYgKCF0aGlzLmF0dGFjaGVkIHx8IHRoaXMucGFyZW50Tm9kZSA9PSBudWxsKSB7IHJldHVybiB9XG4gICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgbWluaW1hcCBsZWZ0L3JpZ2h0IHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24gKCkge1xuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnbGVmdCcsIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQpXG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZGV0YWNoKClcbiAgICB0aGlzLm1pbmltYXAgPSBudWxsXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICMjIyAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgICAgIyMgICAgIyMjIyMjICAgIyMgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICMjICAjIyMjICAgICMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgICMjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgIyMgICAgIyNcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udGVudCBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIGF0dGFjaGVzIHRoZSBtb3VzZSBjb250cm9sXG4gICAqIGV2ZW50IGxpc3RlbmVycy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplQ29udGVudCAoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplQ2FudmFzKClcblxuICAgIHRoaXMuc2hhZG93Um9vdCA9IHRoaXMuY3JlYXRlU2hhZG93Um9vdCgpXG4gICAgdGhpcy5hdHRhY2hDYW52YXNlcyh0aGlzLnNoYWRvd1Jvb3QpXG5cbiAgICB0aGlzLmNyZWF0ZVZpc2libGVBcmVhKClcbiAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLCB7XG4gICAgICAnbW91c2V3aGVlbCc6IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5yZWxheU1vdXNld2hlZWxFdmVudChlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5nZXRGcm9udENhbnZhcygpLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdE1vdXNlRXZlbnREYXRhKGUpKSB9LFxuICAgICAgJ3RvdWNoc3RhcnQnOiAoZSkgPT4geyB0aGlzLmNhbnZhc1ByZXNzZWQodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdmlzaWJsZSBhcmVhIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVWaXNpYmxlQXJlYSAoKSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMudmlzaWJsZUFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudmlzaWJsZUFyZWEuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICghdGhpcy52aXNpYmxlQXJlYSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZSh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMudmlzaWJsZUFyZWEpXG4gICAgZGVsZXRlIHRoaXMudmlzaWJsZUFyZWFcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBjb250cm9scyBjb250YWluZXIgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZUNvbnRyb2xzICgpIHtcbiAgICBpZiAodGhpcy5jb250cm9scyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuY29udHJvbHMuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1jb250cm9scycpXG4gICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHRoaXMuY29udHJvbHMpXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZW1vdmVDb250cm9scyAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbnRyb2xzKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QucmVtb3ZlQ2hpbGQodGhpcy5jb250cm9scylcbiAgICBkZWxldGUgdGhpcy5jb250cm9sc1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZW5hYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yICgpIHtcbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNjcm9sbEluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsSW5kaWNhdG9yKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbEluZGljYXRvcikgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxJbmRpY2F0b3JcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcXVpY2sgc2V0dGluZ3Mgb3BlbmVuZXIgZGl2IHdoZW4gdGhlXG4gICAqIGBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzYCBzZXR0aW5nIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MuY2xhc3NMaXN0LmFkZCgnb3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMub3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMub3BlblF1aWNrU2V0dGluZ3MsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGlmICgodGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBuZXcgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnNldE1vZGVsKHRoaXMpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IG51bGxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnQsIHJpZ2h0fSA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAocmlnaHQpICsgJ3B4J1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAobGVmdCAtIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuY2xpZW50V2lkdGgpICsgJ3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZSBgZGlzcGxheVBsdWdpbnNDb250cm9sc2BcbiAgICogc2V0dGluZyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICghdGhpcy5vcGVuUXVpY2tTZXR0aW5ncykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5vcGVuUXVpY2tTZXR0aW5nc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhcmdldCBgVGV4dEVkaXRvcmAgb2YgdGhlIE1pbmltYXAuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHRFZGl0b3J9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3JcbiAgICovXG4gIGdldFRleHRFZGl0b3IgKCkgeyByZXR1cm4gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgZm9yIHRoZSBNaW5pbWFwJ3MgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yRWxlbWVudH0gdGhlIG1pbmltYXAncyB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqL1xuICBnZXRUZXh0RWRpdG9yRWxlbWVudCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50IH1cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmdldFRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBvZiB0aGUgYFRleHRFZGl0b3JFbGVtZW50YCBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtb3N0bHkgdXNlZCB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgc2hhZG93RG9tYFxuICAgKiBzZXR0aW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290ICgpIHtcbiAgICBsZXQgZWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgaWYgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yRWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290IHdoZXJlIHRvIGluamVjdCB0aGUgZHVtbXkgbm9kZSB1c2VkIHRvIHJlYWQgRE9NIHN0eWxlcy5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gc2hhZG93Um9vdCB3aGV0aGVyIHRvIHVzZSB0aGUgdGV4dCBlZGl0b3Igc2hhZG93IERPTVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIG5vdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgbm9kZSB3aGVyZSBhcHBlbmRpbmcgdGhlIGR1bW15IG5vZGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXREdW1teURPTVJvb3QgKHNoYWRvd1Jvb3QpIHtcbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjXG4gIC8vICAgICMjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjIyMgIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE1pbmltYXAgZm9yIHdoaWNoIHRoaXMgTWluaW1hcEVsZW1lbnQgd2FzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIGdldE1vZGVsICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSAge01pbmltYXB9IG1pbmltYXAgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIHNldE1vZGVsIChtaW5pbWFwKSB7XG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU3RhbmRBbG9uZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VEZWNvcmF0aW9uUmFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgY29uc3Qge3R5cGV9ID0gY2hhbmdlXG4gICAgICBpZiAodHlwZSA9PT0gJ2xpbmUnIHx8IHR5cGUgPT09ICdoaWdobGlnaHQtdW5kZXInKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0Zyb250RGVjb3JhdGlvbkNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChNYWluLm9uRGlkQ2hhbmdlUGx1Z2luT3JkZXIoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc2V0U3RhbmRBbG9uZSh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpXG5cbiAgICBpZiAodGhpcy53aWR0aCAhPSBudWxsICYmIHRoaXMuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5taW5pbWFwXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3RhbmQtYWxvbmUgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBzdGFuZEFsb25lIHRoZSBuZXcgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgc2V0U3RhbmRBbG9uZSAoc3RhbmRBbG9uZSkge1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHN0YW5kQWxvbmVcblxuICAgIGlmICh0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdzdGFuZC1hbG9uZScsIHRydWUpXG4gICAgICB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgdGhpcy5kaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgdGhpcy5yZW1vdmVDb250cm9scygpXG4gICAgICB0aGlzLnJlbW92ZVZpc2libGVBcmVhKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJylcbiAgICAgIHRoaXMuY3JlYXRlVmlzaWJsZUFyZWEoKVxuICAgICAgdGhpcy5jcmVhdGVDb250cm9scygpXG4gICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSB7IHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpIH1cbiAgICAgIGlmICh0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMpIHsgdGhpcy5pbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MoKSB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAgIyMgIyMgICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyMjIyMjIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyMgICMjICAgICAjIyAgICAjIyAgICAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lLlxuICAgKi9cbiAgcmVxdWVzdFVwZGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWVSZXF1ZXN0ZWQpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgYW4gdXBkYXRlIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgbmV4dCBmcmFtZSB0aGF0IHdpbGwgY29tcGxldGVseVxuICAgKiByZWRyYXcgdGhlIG1pbmltYXAuXG4gICAqL1xuICByZXF1ZXN0Rm9yY2VkVXBkYXRlICgpIHtcbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gbnVsbFxuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgTWluaW1hcEVsZW1lbnQgdXBkYXRlLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZSAoKSB7XG4gICAgaWYgKCEodGhpcy5hdHRhY2hlZCAmJiB0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMubWluaW1hcCkpIHsgcmV0dXJuIH1cbiAgICBsZXQgbWluaW1hcCA9IHRoaXMubWluaW1hcFxuICAgIG1pbmltYXAuZW5hYmxlQ2FjaGUoKVxuICAgIGxldCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgbGV0IHZpc2libGVBcmVhTGVmdCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKVxuICAgIGxldCB2aXNpYmxlQXJlYVRvcCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgIGxldCB2aXNpYmxlV2lkdGggPSBNYXRoLm1pbihjYW52YXMud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvLCB0aGlzLndpZHRoKVxuXG4gICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCAmJiB0aGlzLmZsZXhCYXNpcykge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAgIHdpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnLFxuICAgICAgICBoZWlnaHQ6IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgdG9wOiB2aXNpYmxlQXJlYVRvcCArICdweCcsXG4gICAgICAgIGxlZnQ6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKHZpc2libGVBcmVhTGVmdCwgdmlzaWJsZUFyZWFUb3ApXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5jb250cm9scywge3dpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnfSlcblxuICAgIGxldCBjYW52YXNUb3AgPSBtaW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICogbWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG5cbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGNhbnZhc1RvcClcbiAgICBpZiAoZGV2aWNlUGl4ZWxSYXRpbyAhPT0gMSkge1xuICAgICAgY2FudmFzVHJhbnNmb3JtICs9ICcgJyArIHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmIG1pbmltYXAuY2FuU2Nyb2xsKCkgJiYgIXRoaXMuc2Nyb2xsSW5kaWNhdG9yKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSB7XG4gICAgICBsZXQgbWluaW1hcFNjcmVlbkhlaWdodCA9IG1pbmltYXAuZ2V0U2NyZWVuSGVpZ2h0KClcbiAgICAgIGxldCBpbmRpY2F0b3JIZWlnaHQgPSBtaW5pbWFwU2NyZWVuSGVpZ2h0ICogKG1pbmltYXBTY3JlZW5IZWlnaHQgLyBtaW5pbWFwLmdldEhlaWdodCgpKVxuICAgICAgbGV0IGluZGljYXRvclNjcm9sbCA9IChtaW5pbWFwU2NyZWVuSGVpZ2h0IC0gaW5kaWNhdG9ySGVpZ2h0KSAqIG1pbmltYXAuZ2V0U2Nyb2xsUmF0aW8oKVxuXG4gICAgICBpZiAoU1BFQ19NT0RFKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5zY3JvbGxJbmRpY2F0b3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IGluZGljYXRvckhlaWdodCArICdweCcsXG4gICAgICAgICAgdG9wOiBpbmRpY2F0b3JTY3JvbGwgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuc2Nyb2xsSW5kaWNhdG9yLCB7XG4gICAgICAgICAgaGVpZ2h0OiBpbmRpY2F0b3JIZWlnaHQgKyAncHgnLFxuICAgICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGluZGljYXRvclNjcm9sbClcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKCFtaW5pbWFwLmNhblNjcm9sbCgpKSB7IHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNhbnZhcygpXG4gICAgbWluaW1hcC5jbGVhckNhY2hlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoZXRoZXIgdG8gcmVuZGVyIHRoZSBjb2RlIGhpZ2hsaWdodHMgb3Igbm90LlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BsYXlDb2RlSGlnaGxpZ2h0cyB3aGV0aGVyIHRvIHJlbmRlciB0aGUgY29kZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzIG9yIG5vdFxuICAgKi9cbiAgc2V0RGlzcGxheUNvZGVIaWdobGlnaHRzIChkaXNwbGF5Q29kZUhpZ2hsaWdodHMpIHtcbiAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb2xsaW5nIGNhbGxiYWNrIHVzZWQgdG8gZGV0ZWN0IHZpc2liaWxpdHkgYW5kIHNpemUgY2hhbmdlcy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBwb2xsRE9NICgpIHtcbiAgICBsZXQgdmlzaWJpbGl0eUNoYW5nZWQgPSB0aGlzLmNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSgpXG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGlmICghdGhpcy53YXNWaXNpYmxlKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cblxuICAgICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgodmlzaWJpbGl0eUNoYW5nZWQsIGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGNoZWNrcyBmb3IgdmlzaWJpbGl0eSBjaGFuZ2VzIGluIHRoZSBNaW5pbWFwRWxlbWVudC5cbiAgICogVGhlIG1ldGhvZCByZXR1cm5zIGB0cnVlYCB3aGVuIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgZnJvbSB2aXNpYmxlIHRvXG4gICAqIGhpZGRlbiBvciBmcm9tIGhpZGRlbiB0byB2aXNpYmxlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgb3Igbm90IHNpbmNlIHRoZSBsYXN0IGNhbGxcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UgKCkge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBpZiAodGhpcy53YXNWaXNpYmxlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy53YXNWaXNpYmxlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLndhc1Zpc2libGUpIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB0aGlzLndhc1Zpc2libGVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdXNlZCB0byBtZWFzdXJlIHRoZSBzaXplIG9mIHRoZSBNaW5pbWFwRWxlbWVudCBhbmQgdXBkYXRlIGludGVybmFsXG4gICAqIGNvbXBvbmVudHMgYmFzZWQgb24gdGhlIG5ldyBzaXplLlxuICAgKlxuICAgKiBAcGFyYW0gIHtib29sZWFufSB2aXNpYmlsaXR5Q2hhbmdlZCBkaWQgdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBzaW5jZSBsYXN0XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gW2ZvcmNlVXBkYXRlPXRydWVdIGZvcmNlcyB0aGUgdXBkYXRlIGV2ZW4gd2hlbiBubyBjaGFuZ2VzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlcmUgZGV0ZWN0ZWRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtZWFzdXJlSGVpZ2h0QW5kV2lkdGggKHZpc2liaWxpdHlDaGFuZ2VkLCBmb3JjZVVwZGF0ZSA9IHRydWUpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBsZXQgd2FzUmVzaXplZCA9IHRoaXMud2lkdGggIT09IHRoaXMuY2xpZW50V2lkdGggfHwgdGhpcy5oZWlnaHQgIT09IHRoaXMuY2xpZW50SGVpZ2h0XG5cbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2xpZW50SGVpZ2h0XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2xpZW50V2lkdGhcbiAgICBsZXQgY2FudmFzV2lkdGggPSB0aGlzLndpZHRoXG5cbiAgICBpZiAoKHRoaXMubWluaW1hcCAhPSBudWxsKSkgeyB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpIH1cblxuICAgIGlmICh3YXNSZXNpemVkIHx8IHZpc2liaWxpdHlDaGFuZ2VkIHx8IGZvcmNlVXBkYXRlKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cblxuICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkgeyByZXR1cm4gfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdFRvU29mdFdyYXApIHtcbiAgICAgICAgbGV0IGxpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHNvZnRXcmFwID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFdyYXAnKVxuICAgICAgICBsZXQgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcpXG4gICAgICAgIGxldCB3aWR0aCA9IGxpbmVMZW5ndGggKiB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKClcblxuICAgICAgICBpZiAoc29mdFdyYXAgJiYgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggJiYgbGluZUxlbmd0aCAmJiB3aWR0aCA8PSB0aGlzLndpZHRoKSB7XG4gICAgICAgICAgdGhpcy5mbGV4QmFzaXMgPSB3aWR0aFxuICAgICAgICAgIGNhbnZhc1dpZHRoID0gd2lkdGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5mbGV4QmFzaXNcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICB9XG5cbiAgICAgIGxldCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcbiAgICAgIGlmIChjYW52YXNXaWR0aCAhPT0gY2FudmFzLndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9PSBjYW52YXMuaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzZXNTaXplKFxuICAgICAgICAgIGNhbnZhc1dpZHRoICogZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgICAodGhpcy5oZWlnaHQgKyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICMjICAgICAjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyMgICAjIyAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjIyAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyAgICMjICMjICMjICAgICMjICAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICMjICAgIyMgICMjICAgICAgICMjICAjIyMjICAgICMjICAgICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAgIyMgIyMgICAjIyAgICAgICAjIyAgICMjIyAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyMjIyMjIyAgICAjIyMgICAgIyMjIyMjIyMgIyMgICAgIyMgICAgIyMgICAgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgbWV0aG9kIHRvIHJlZ2lzdGVyIGNvbmZpZyBvYnNlcnZlcnMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gY29uZmlncz17fSBhbiBvYmplY3QgbWFwcGluZyB0aGUgY29uZmlnIG5hbWUgdG8gb2JzZXJ2ZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgZnVuY3Rpb24gdG8gY2FsbCBiYWNrIHdoZW4gYSBjaGFuZ2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9jY3Vyc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG9ic2VydmVDb25maWcgKGNvbmZpZ3MgPSB7fSkge1xuICAgIGZvciAobGV0IGNvbmZpZyBpbiBjb25maWdzKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoY29uZmlnLCBjb25maWdzW2NvbmZpZ10pKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvbiB0aGUgTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHZlcnRpY2FsIGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTGVmdE1vdXNlIHdhcyB0aGUgbGVmdCBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNNaWRkbGVNb3VzZSB3YXMgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNQcmVzc2VkICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9KSB7XG4gICAgaWYgKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSkgeyByZXR1cm4gfVxuICAgIGlmIChpc0xlZnRNb3VzZSkge1xuICAgICAgdGhpcy5jYW52YXNMZWZ0TW91c2VQcmVzc2VkKHkpXG4gICAgfSBlbHNlIGlmIChpc01pZGRsZU1vdXNlKSB7XG4gICAgICB0aGlzLmNhbnZhc01pZGRsZU1vdXNlUHJlc3NlZCh5KVxuICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICB0aGlzLnN0YXJ0RHJhZyh7eTogdG9wICsgaGVpZ2h0IC8gMiwgaXNMZWZ0TW91c2U6IGZhbHNlLCBpc01pZGRsZU1vdXNlOiB0cnVlfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGxlZnQgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlLnRhcmdldCB0aGUgc291cmNlIG9mIHRoZSBldmVudFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNhbnZhc0xlZnRNb3VzZVByZXNzZWQgKHkpIHtcbiAgICBsZXQgZGVsdGFZID0geSAtIHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgbGV0IHJvdyA9IE1hdGguZmxvb3IoZGVsdGFZIC8gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSkgKyB0aGlzLm1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGxldCB0ZXh0RWRpdG9yID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKVxuXG4gICAgbGV0IHNjcm9sbFRvcCA9IHJvdyAqIHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvckhlaWdodCgpIC8gMlxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nKSkge1xuICAgICAgbGV0IGZyb20gPSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFRvcCgpXG4gICAgICBsZXQgdG8gPSBzY3JvbGxUb3BcbiAgICAgIGxldCBzdGVwID0gKG5vdykgPT4gdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93KVxuICAgICAgbGV0IGR1cmF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJylcbiAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChzY3JvbGxUb3ApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBtaWRkbGUgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzTWlkZGxlTW91c2VQcmVzc2VkICh5KSB7XG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IGRlbHRhWSA9IHkgLSBvZmZzZXRUb3AgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMlxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgcmVsYXlzIHRoZSBgbW91c2V3aGVlbGAgZXZlbnRzIHJlY2VpdmVkIGJ5IHRoZSBNaW5pbWFwRWxlbWVudFxuICAgKiB0byB0aGUgYFRleHRFZGl0b3JFbGVtZW50YC5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVsYXlNb3VzZXdoZWVsRXZlbnQgKGUpIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKSkge1xuICAgICAgdGhpcy5taW5pbWFwLm9uTW91c2VXaGVlbChlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkuY29tcG9uZW50Lm9uTW91c2VXaGVlbChlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGV4dHJhY3RzIGRhdGEgZnJvbSBhIGBNb3VzZUV2ZW50YCB3aGljaCBjYW4gdGhlbiBiZSB1c2VkIHRvXG4gICAqIHByb2Nlc3MgY2xpY2tzIGFuZCBkcmFncyBvZiB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogVXNlZCB0b2dldGhlciB3aXRoIGBleHRyYWN0VG91Y2hFdmVudERhdGFgIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZVxuICAgKiBmb3IgYE1vdXNlRXZlbnRgcyBhbmQgYFRvdWNoRXZlbnRgcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gbW91c2VFdmVudCB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZXh0cmFjdE1vdXNlRXZlbnREYXRhIChtb3VzZUV2ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlRXZlbnQucGFnZVgsXG4gICAgICB5OiBtb3VzZUV2ZW50LnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDEsXG4gICAgICBpc01pZGRsZU1vdXNlOiBtb3VzZUV2ZW50LndoaWNoID09PSAyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYFRvdWNoRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RNb3VzZUV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtUb3VjaEV2ZW50fSB0b3VjaEV2ZW50IHRoZSB0b3VjaCBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0VG91Y2hFdmVudERhdGEgKHRvdWNoRXZlbnQpIHtcbiAgICAvLyBVc2UgdGhlIGZpcnN0IHRvdWNoIG9uIHRoZSB0YXJnZXQgYXJlYS4gT3RoZXIgdG91Y2hlcyB3aWxsIGJlIGlnbm9yZWQgaW5cbiAgICAvLyBjYXNlIG9mIG11bHRpLXRvdWNoLlxuICAgIGxldCB0b3VjaCA9IHRvdWNoRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF1cblxuICAgIHJldHVybiB7XG4gICAgICB4OiB0b3VjaC5wYWdlWCxcbiAgICAgIHk6IHRvdWNoLnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IHRydWUsIC8vIFRvdWNoIGlzIHRyZWF0ZWQgbGlrZSBhIGxlZnQgbW91c2UgYnV0dG9uIGNsaWNrXG4gICAgICBpc01pZGRsZU1vdXNlOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGEgbWVkaWEgcXVlcnkgZm9yIGRldmljZSBwaXhlbCByYXRpbyBjaGFuZ2VzIGFuZCBmb3JjZXNcbiAgICogYSByZXBhaW50IHdoZW4gaXQgb2NjdXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gcmVtb3ZlIHRoZSBtZWRpYSBxdWVyeSBsaXN0ZW5lclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN1YnNjcmliZVRvTWVkaWFRdWVyeSAoKSB7XG4gICAgY29uc3QgcXVlcnkgPSAnc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpJ1xuICAgIGNvbnN0IG1lZGlhUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSlcbiAgICBjb25zdCBtZWRpYUxpc3RlbmVyID0gKGUpID0+IHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgIG1lZGlhUXVlcnkuYWRkTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcblxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBtZWRpYVF1ZXJ5LnJlbW92ZUxpc3RlbmVyKG1lZGlhTGlzdGVuZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyMgICAgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMjIyAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyMjICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAjIyAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAjIyMjICAjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvdmVyIHRoZSB2aXNpYmxlIGFyZWEgdGhhdFxuICAgKiBzdGFydHMgdGhlIGRyYWdnaW5nIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN0YXJ0RHJhZyAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgaWYgKCFpc0xlZnRNb3VzZSAmJiAhaXNNaWRkbGVNb3VzZSkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHt0b3B9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgbGV0IGRyYWdPZmZzZXQgPSB5IC0gdG9wXG5cbiAgICBsZXQgaW5pdGlhbCA9IHtkcmFnT2Zmc2V0LCBvZmZzZXRUb3B9XG5cbiAgICBsZXQgbW91c2Vtb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IG1vdXNldXBIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBsZXQgdG91Y2htb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IHRvdWNoZW5kSGFuZGxlciA9IChlKSA9PiB0aGlzLmVuZERyYWcoKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXBIYW5kbGVyKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kSGFuZGxlcilcblxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdG91Y2htb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCBjYWxsZWQgZHVyaW5nIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGluaXRpYWwuZHJhZ09mZnNldCB0aGUgbW91c2Ugb2Zmc2V0IHdpdGhpbiB0aGUgdmlzaWJsZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhXG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5vZmZzZXRUb3AgdGhlIE1pbmltYXBFbGVtZW50IG9mZnNldCBhdCB0aGUgbW9tZW50XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2YgdGhlIGRyYWcgc3RhcnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9LCBpbml0aWFsKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG4gICAgbGV0IGRlbHRhWSA9IHkgLSBpbml0aWFsLm9mZnNldFRvcCAtIGluaXRpYWwuZHJhZ09mZnNldFxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdGhhdCBlbmRzIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZW5kRHJhZyAoKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBwYXNzZWQtaW4gc3R5bGVzIHByb3BlcnRpZXMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoZSBlbGVtZW50IG9udG8gd2hpY2ggYXBwbHkgdGhlIHN0eWxlc1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IHN0eWxlcyB0aGUgc3R5bGVzIHRvIGFwcGx5XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlTdHlsZXMgKGVsZW1lbnQsIHN0eWxlcykge1xuICAgIGlmICghZWxlbWVudCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IGNzc1RleHQgPSAnJ1xuICAgIGZvciAobGV0IHByb3BlcnR5IGluIHN0eWxlcykge1xuICAgICAgY3NzVGV4dCArPSBgJHtwcm9wZXJ0eX06ICR7c3R5bGVzW3Byb3BlcnR5XX07IGBcbiAgICB9XG5cbiAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHRyYW5zbGF0aW9uIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1MgdHJhbnNsYXRpb24gc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVRyYW5zbGF0ZSAoeCA9IDAsIHkgPSAwKSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlM2QoJHt4fXB4LCAke3l9cHgsIDApYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3h9cHgsICR7eX1weClgXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhIENTUyBzY2FsaW5nIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggc2NhbGluZyBmYWN0b3JcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeSA9IDBdIHRoZSB5IHNjYWxpbmcgZmFjdG9yXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyBzY2FsaW5nIHN0cmluZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1ha2VTY2FsZSAoeCA9IDAsIHkgPSB4KSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgc2NhbGUzZCgke3h9LCAke3l9LCAxKWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBzY2FsZSgke3h9LCAke3l9KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZXR1cm4gdGhlIGN1cnJlbnQgdGltZSBhcyBhIERhdGUuXG4gICAqXG4gICAqIFRoYXQgbWV0aG9kIGV4aXN0IHNvIHRoYXQgd2UgY2FuIG1vY2sgaXQgaW4gdGVzdHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0RhdGV9IHRoZSBjdXJyZW50IHRpbWUgYXMgRGF0ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGdldFRpbWUgKCkgeyByZXR1cm4gbmV3IERhdGUoKSB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgbWltaWMgdGhlIGpRdWVyeSBgYW5pbWF0ZWAgbWV0aG9kIGFuZCB1c2VkIHRvIGFuaW1hdGUgdGhlXG4gICAqIHNjcm9sbCB3aGVuIGNsaWNraW5nIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gcGFyYW0gdGhlIGFuaW1hdGlvbiBkYXRhIG9iamVjdFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmZyb20gdGhlIHN0YXJ0IHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0udG8gdGhlIGVuZCB2YWx1ZVxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmR1cmF0aW9uIHRoZSBhbmltYXRpb24gZHVyYXRpb25cbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS5zdGVwIHRoZSBlYXNpbmcgZnVuY3Rpb24gZm9yIHRoZSBhbmltYXRpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhbmltYXRlICh7ZnJvbSwgdG8sIGR1cmF0aW9uLCBzdGVwfSkge1xuICAgIGxldCBwcm9ncmVzc1xuICAgIGxldCBzdGFydCA9IHRoaXMuZ2V0VGltZSgpXG5cbiAgICBsZXQgc3dpbmcgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgIHJldHVybiAwLjUgLSBNYXRoLmNvcyhwcm9ncmVzcyAqIE1hdGguUEkpIC8gMlxuICAgIH1cblxuICAgIGxldCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuXG4gICAgICBsZXQgcGFzc2VkID0gdGhpcy5nZXRUaW1lKCkgLSBzdGFydFxuICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICAgIHByb2dyZXNzID0gMVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSBwYXNzZWQgLyBkdXJhdGlvblxuICAgICAgfVxuICAgICAgaWYgKHByb2dyZXNzID4gMSkgeyBwcm9ncmVzcyA9IDEgfVxuICAgICAgbGV0IGRlbHRhID0gc3dpbmcocHJvZ3Jlc3MpXG4gICAgICBzdGVwKGZyb20gKyAodG8gLSBmcm9tKSAqIGRlbHRhKVxuXG4gICAgICBpZiAocHJvZ3Jlc3MgPCAxKSB7IHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/minimap/lib/minimap-element.js
