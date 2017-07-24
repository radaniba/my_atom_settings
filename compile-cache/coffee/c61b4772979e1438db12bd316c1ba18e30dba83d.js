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
            return changes != null ? changes.forEach(function(change) {
              return _this.updateDotDecorationsOffsets(change.start.row);
            }) : void 0;
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
          if (__indexOf.call(classes, 'in-selection') < 0) {
            classes.push('in-selection');
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.filter(function(cls) {
        return cls !== 'in-selection';
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
