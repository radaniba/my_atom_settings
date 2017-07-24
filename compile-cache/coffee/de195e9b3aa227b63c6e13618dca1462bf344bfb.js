(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-utils'), registerOrUpdateElement = _ref1.registerOrUpdateElement, EventsDelegation = _ref1.EventsDelegation;

  ColorMarkerElement = require('./color-marker-element');

  nextHighlightId = 0;

  ColorBufferElement = (function(_super) {
    __extends(ColorBufferElement, _super);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var _ref2;
      _ref2 = [0, 0], this.editorScrollLeft = _ref2[0], this.editorScrollTop = _ref2[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.shadowRoot = this.createShadowRoot();
      this.displayedMarkers = [];
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return this.viewsByMarkers = new WeakMap;
    };

    ColorBufferElement.prototype.attachedCallback = function() {
      this.attached = true;
      return this.update();
    };

    ColorBufferElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    ColorBufferElement.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ColorBufferElement.prototype.getModel = function() {
      return this.colorBuffer;
    };

    ColorBufferElement.prototype.setModel = function(colorBuffer) {
      var scrollLeftListener, scrollTopListener;
      this.colorBuffer = colorBuffer;
      this.editor = this.colorBuffer.editor;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(this.colorBuffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      scrollLeftListener = (function(_this) {
        return function(editorScrollLeft) {
          _this.editorScrollLeft = editorScrollLeft;
          return _this.updateScroll();
        };
      })(this);
      scrollTopListener = (function(_this) {
        return function(editorScrollTop) {
          _this.editorScrollTop = editorScrollTop;
          if (_this.useNativeDecorations()) {
            return;
          }
          _this.updateScroll();
          return requestAnimationFrame(function() {
            return _this.updateMarkers();
          });
        };
      })(this);
      if (this.editorElement.onDidChangeScrollLeft != null) {
        this.subscriptions.add(this.editorElement.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editorElement.onDidChangeScrollTop(scrollTopListener));
      } else {
        this.subscriptions.add(this.editor.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editor.onDidChangeScrollTop(scrollTopListener));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.usedMarkers.forEach(function(marker) {
            var _ref2;
            if ((_ref2 = marker.colorMarker) != null) {
              _ref2.invalidateScreenRangeCache();
            }
            return marker.checkScreenRange();
          });
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      }
      this.subscriptions.add(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement.prototype.rendererType !== type) {
            ColorMarkerElement.setMarkerType(type);
          }
          if (_this.isNativeDecorationType(type)) {
            _this.initializeNativeDecorations(type);
          } else {
            if (type === 'background') {
              _this.classList.add('above-editor-content');
            } else {
              _this.classList.remove('above-editor-content');
            }
            _this.destroyNativeDecorations();
            _this.updateMarkers(type);
          }
          return _this.previousType = type;
        };
      })(this)));
      this.subscriptions.add(atom.styles.onDidAddStyleElement((function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          return _this.attach();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidDetach((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)));
    };

    ColorBufferElement.prototype.attach = function() {
      var _ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (_ref2 = this.getEditorRoot().querySelector('.lines')) != null ? _ref2.appendChild(this) : void 0;
    };

    ColorBufferElement.prototype.detach = function() {
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    ColorBufferElement.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      this.releaseAllMarkerViews();
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.useNativeDecorations()) {
        if (this.isGutterType()) {
          return this.updateGutterDecorations();
        } else {
          return this.updateHighlightDecorations(this.previousType);
        }
      } else {
        return this.updateMarkers();
      }
    };

    ColorBufferElement.prototype.updateScroll = function() {
      if (this.editorElement.hasTiledRendering && !this.useNativeDecorations()) {
        return this.style.webkitTransform = "translate3d(" + (-this.editorScrollLeft) + "px, " + (-this.editorScrollTop) + "px, 0)";
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      var _ref2;
      return (_ref2 = this.editorElement.shadowRoot) != null ? _ref2 : this.editorElement;
    };

    ColorBufferElement.prototype.editorConfigChanged = function() {
      if ((this.parentNode == null) || this.useNativeDecorations()) {
        return;
      }
      this.usedMarkers.forEach((function(_this) {
        return function(marker) {
          if (marker.colorMarker != null) {
            return marker.render();
          } else {
            console.warn("A marker view was found in the used instance pool while having a null model", marker);
            return _this.releaseMarkerElement(marker);
          }
        };
      })(this));
      return this.updateMarkers();
    };

    ColorBufferElement.prototype.isGutterType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'gutter' || type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.isDotType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.useNativeDecorations = function() {
      return this.isNativeDecorationType(this.previousType);
    };

    ColorBufferElement.prototype.isNativeDecorationType = function(type) {
      return ColorMarkerElement.isNativeDecorationType(type);
    };

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
      this.releaseAllMarkerViews();
      this.destroyNativeDecorations();
      if (this.isGutterType(type)) {
        return this.initializeGutter(type);
      } else {
        return this.updateHighlightDecorations(type);
      }
    };

    ColorBufferElement.prototype.destroyNativeDecorations = function() {
      if (this.isGutterType()) {
        return this.destroyGutter();
      } else {
        return this.destroyHighlightDecorations();
      }
    };

    ColorBufferElement.prototype.updateHighlightDecorations = function(type) {
      var className, m, markers, markersByRows, maxRowLength, style, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.styleByMarkerId == null) {
        this.styleByMarkerId = {};
      }
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      markers = this.colorBuffer.getValidColorMarkers();
      _ref2 = this.displayedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        if (!(__indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((_ref3 = this.decorationByMarkerId[m.id]) != null) {
          _ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          _ref5 = this.getHighlighDecorationCSS(m, type), className = _ref5.className, style = _ref5.style;
          this.appendChild(style);
          this.styleByMarkerId[m.id] = style;
          this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
            type: 'highlight',
            "class": "pigments-" + type + " " + className,
            includeMarkerText: type === 'highlight'
          });
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.destroyHighlightDecorations = function() {
      var deco, id, _ref2;
      _ref2 = this.decorationByMarkerId;
      for (id in _ref2) {
        deco = _ref2[id];
        if (this.styleByMarkerId[id] != null) {
          this.removeChild(this.styleByMarkerId[id]);
        }
        deco.destroy();
      }
      delete this.decorationByMarkerId;
      delete this.styleByMarkerId;
      return this.displayedMarkers = [];
    };

    ColorBufferElement.prototype.getHighlighDecorationCSS = function(marker, type) {
      var className, l, style;
      className = "pigments-highlight-" + (nextHighlightId++);
      style = document.createElement('style');
      l = marker.color.luma;
      if (type === 'native-background') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n}";
      } else if (type === 'native-outline') {
        style.innerHTML = "." + className + " .region {\n  border-color: " + (marker.color.toCSS()) + ";\n}";
      }
      return {
        className: className,
        style: style
      };
    };

    ColorBufferElement.prototype.initializeGutter = function(type) {
      var gutterContainer, options;
      options = {
        name: "pigments-" + type
      };
      if (type !== 'gutter') {
        options.priority = 1000;
      }
      this.gutter = this.editor.addGutter(options);
      this.displayedMarkers = [];
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      gutterContainer = this.getEditorRoot().querySelector('.gutter-container');
      this.gutterSubscription = new CompositeDisposable;
      this.gutterSubscription.add(this.subscribeTo(gutterContainer, {
        mousedown: (function(_this) {
          return function(e) {
            var colorMarker, markerId, targetDecoration;
            targetDecoration = e.path[0];
            if (!targetDecoration.matches('span')) {
              targetDecoration = targetDecoration.querySelector('span');
            }
            if (targetDecoration == null) {
              return;
            }
            markerId = targetDecoration.dataset.markerId;
            colorMarker = _this.displayedMarkers.filter(function(m) {
              return m.id === Number(markerId);
            })[0];
            if (!((colorMarker != null) && (_this.colorBuffer != null))) {
              return;
            }
            return _this.colorBuffer.selectColorMarkerAndOpenPicker(colorMarker);
          };
        })(this)
      }));
      if (this.isDotType(type)) {
        this.gutterSubscription.add(this.editor.onDidChange((function(_this) {
          return function(changes) {
            if (Array.isArray(changes)) {
              return changes != null ? changes.forEach(function(change) {
                return _this.updateDotDecorationsOffsets(change.start.row);
              }) : void 0;
            } else {
              return _this.updateDotDecorationsOffsets(changes.start.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, _ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      _ref2 = this.decorationByMarkerId;
      for (id in _ref2) {
        decoration = _ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, m, markers, markersByRows, maxRowLength, row, rowLength, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      _ref2 = this.displayedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        if (!(__indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((_ref3 = this.decorationByMarkerId[m.id]) != null) {
          _ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          this.decorationByMarkerId[m.id] = this.gutter.decorateMarker(m.marker, {
            type: 'gutter',
            "class": 'pigments-gutter-marker',
            item: this.getGutterDecorationItem(m)
          });
        }
        deco = this.decorationByMarkerId[m.id];
        row = m.marker.getStartScreenPosition().row;
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, Infinity]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = "" + (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = "" + (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(row) {
      var deco, decoWidth, m, markerRow, markersByRows, rowLength, _i, _len, _ref2, _results;
      markersByRows = {};
      _ref2 = this.displayedMarkers;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        deco = this.decorationByMarkerId[m.id];
        if (m.marker == null) {
          continue;
        }
        markerRow = m.marker.getStartScreenPosition().row;
        if (row !== markerRow) {
          continue;
        }
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        rowLength = this.editorElement.pixelPositionForScreenPosition([row, Infinity]).left;
        decoWidth = 14;
        deco.properties.item.style.left = "" + (rowLength + markersByRows[row] * decoWidth) + "px";
        _results.push(markersByRows[row]++);
      }
      return _results;
    };

    ColorBufferElement.prototype.getGutterDecorationItem = function(marker) {
      var div;
      div = document.createElement('div');
      div.innerHTML = "<span style='background-color: " + (marker.color.toCSS()) + ";' data-marker-id='" + marker.id + "'></span>";
      return div;
    };

    ColorBufferElement.prototype.requestMarkerUpdate = function(markers) {
      if (this.frameRequested) {
        this.dirtyMarkers = this.dirtyMarkers.concat(markers);
        return;
      } else {
        this.dirtyMarkers = markers.slice();
        this.frameRequested = true;
      }
      return requestAnimationFrame((function(_this) {
        return function() {
          var dirtyMarkers, m, _i, _len, _ref2;
          dirtyMarkers = [];
          _ref2 = _this.dirtyMarkers;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            m = _ref2[_i];
            if (__indexOf.call(dirtyMarkers, m) < 0) {
              dirtyMarkers.push(m);
            }
          }
          delete _this.frameRequested;
          delete _this.dirtyMarkers;
          if (_this.colorBuffer == null) {
            return;
          }
          return dirtyMarkers.forEach(function(marker) {
            return marker.render();
          });
        };
      })(this));
    };

    ColorBufferElement.prototype.updateMarkers = function(type) {
      var m, markers, _base, _base1, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (_ref2 = typeof (_base = this.editorElement).getVisibleRowRange === "function" ? _base.getVisibleRowRange() : void 0) != null ? _ref2 : typeof (_base1 = this.editor).getVisibleRowRange === "function" ? _base1.getVisibleRowRange() : void 0
      });
      _ref3 = this.displayedMarkers;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        m = _ref3[_i];
        if (__indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          this.requestMarkerView(m);
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.requestMarkerView = function(marker) {
      var view;
      if (this.unusedMarkers.length) {
        view = this.unusedMarkers.shift();
      } else {
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(_arg) {
            var marker;
            marker = _arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.shadowRoot.appendChild(view);
      }
      view.setModel(marker);
      this.hideMarkerIfInSelectionOrFold(marker, view);
      this.usedMarkers.push(view);
      this.viewsByMarkers.set(marker, view);
      return view;
    };

    ColorBufferElement.prototype.releaseMarkerView = function(markerOrView) {
      var marker, view;
      marker = markerOrView;
      view = this.viewsByMarkers.get(markerOrView);
      if (view != null) {
        if (marker != null) {
          this.viewsByMarkers["delete"](marker);
        }
        return this.releaseMarkerElement(view);
      }
    };

    ColorBufferElement.prototype.releaseMarkerElement = function(view) {
      this.usedMarkers.splice(this.usedMarkers.indexOf(view), 1);
      if (!view.isReleased()) {
        view.release(false);
      }
      return this.unusedMarkers.push(view);
    };

    ColorBufferElement.prototype.releaseAllMarkerViews = function() {
      var view, _i, _j, _len, _len1, _ref2, _ref3;
      _ref2 = this.usedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        view = _ref2[_i];
        view.destroy();
      }
      _ref3 = this.unusedMarkers;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        view = _ref3[_j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.shadowRoot.querySelectorAll('pigments-color-marker'), function(el) {
        return el.parentNode.removeChild(el);
      });
    };

    ColorBufferElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    ColorBufferElement.prototype.updateSelections = function() {
      var decoration, marker, view, _i, _j, _len, _len1, _ref2, _ref3, _results, _results1;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        _ref2 = this.displayedMarkers;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          marker = _ref2[_i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            _results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref3 = this.displayedMarkers;
        _results1 = [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          marker = _ref3[_j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            _results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            _results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return _results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, markerRange, props, range, selection, selections, _i, _len;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          if (classes[0].match(/-in-selection$/) == null) {
            classes[0] += '-in-selection';
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.map(function(cls) {
        return cls.replace('-in-selection', '');
      });
      props["class"] = classes.join(' ');
      return decoration.setProperties(props);
    };

    ColorBufferElement.prototype.hideMarkerIfInSelectionOrFold = function(marker, view) {
      var markerRange, range, selection, selections, _i, _len, _results;
      selections = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          _results.push(view.classList.add('in-fold'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, rootElement, scrollTarget, top, _ref2;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      _ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = _ref2.top, left = _ref2.left;
      top = clientY - top + scrollTarget.getScrollTop();
      left = clientX - left + scrollTarget.getScrollLeft();
      return {
        top: top,
        left: left
      };
    };

    return ColorBufferElement;

  })(HTMLElement);

  module.exports = ColorBufferElement = registerOrUpdateElement('pigments-markers', ColorBufferElement.prototype);

  ColorBufferElement.registerViewProvider = function(modelClass) {
    return atom.views.addViewProvider(modelClass, function(model) {
      var element;
      element = new ColorBufferElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItYnVmZmVyLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZJQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixDQUFBOztBQUFBLEVBQ0EsUUFBOEMsT0FBQSxDQUFRLFlBQVIsQ0FBOUMsRUFBQyxnQ0FBQSx1QkFBRCxFQUEwQix5QkFBQSxnQkFEMUIsQ0FBQTs7QUFBQSxFQUVBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQUZyQixDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixDQUpsQixDQUFBOztBQUFBLEVBTU07QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixrQkFBN0IsQ0FBQSxDQUFBOztBQUFBLGlDQUVBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxLQUFBO0FBQUEsTUFBQSxRQUF3QyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhDLEVBQUMsSUFBQyxDQUFBLDJCQUFGLEVBQW9CLElBQUMsQ0FBQSwwQkFBckIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRmpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FIZCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsRUFKcEIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-buffer-element.coffee
