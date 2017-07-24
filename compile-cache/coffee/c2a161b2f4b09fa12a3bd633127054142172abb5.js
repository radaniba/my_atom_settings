(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], ColorMarkerElement = ref1[0], Emitter = ref1[1], CompositeDisposable = ref1[2];

  nextHighlightId = 0;

  ColorBufferElement = (function(superClass) {
    extend(ColorBufferElement, superClass);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var ref2, ref3;
      if (Emitter == null) {
        ref2 = require('atom'), Emitter = ref2.Emitter, CompositeDisposable = ref2.CompositeDisposable;
      }
      ref3 = [0, 0], this.editorScrollLeft = ref3[0], this.editorScrollTop = ref3[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
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
            var ref2;
            if ((ref2 = marker.colorMarker) != null) {
              ref2.invalidateScreenRangeCache();
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
      this.subscriptions.add(atom.config.observe('pigments.maxDecorationsInGutter', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
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
      var ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (ref2 = this.getEditorRoot().querySelector('.lines')) != null ? ref2.appendChild(this) : void 0;
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
      if (this.isNativeDecorationType()) {
        this.destroyNativeDecorations();
      } else {
        this.releaseAllMarkerViews();
      }
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
      return this.editorElement;
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
      if (ColorMarkerElement == null) {
        ColorMarkerElement = require('./color-marker-element');
      }
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
      var className, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, ref5, style;
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
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          ref5 = this.getHighlighDecorationCSS(m, type), className = ref5.className, style = ref5.style;
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
      var deco, id, ref2;
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        deco = ref2[id];
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
                return _this.updateDotDecorationsOffsets(change.start.row, change.newExtent.row);
              }) : void 0;
            } else if (changes.start && changes.newExtent) {
              return _this.updateDotDecorationsOffsets(changes.start.row, changes.newExtent.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        decoration = ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxDecorationsInGutter, maxRowLength, ref2, ref3, ref4, row, rowLength;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      maxDecorationsInGutter = atom.config.get('pigments.maxDecorationsInGutter');
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
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
        if (markersByRows[row] >= maxDecorationsInGutter) {
          continue;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(rowStart, rowEnd) {
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength;
      markersByRows = {};
      results = [];
      for (row = i = ref2 = rowStart, ref3 = rowEnd; ref2 <= ref3 ? i <= ref3 : i >= ref3; row = ref2 <= ref3 ? ++i : --i) {
        results.push((function() {
          var j, len, ref4, results1;
          ref4 = this.displayedMarkers;
          results1 = [];
          for (j = 0, len = ref4.length; j < len; j++) {
            m = ref4[j];
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
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
            decoWidth = 14;
            deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
            results1.push(markersByRows[row]++);
          }
          return results1;
        }).call(this));
      }
      return results;
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
          var dirtyMarkers, i, len, m, ref2;
          dirtyMarkers = [];
          ref2 = _this.dirtyMarkers;
          for (i = 0, len = ref2.length; i < len; i++) {
            m = ref2[i];
            if (indexOf.call(dirtyMarkers, m) < 0) {
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
      var base, base1, i, j, len, len1, m, markers, ref2, ref3, ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (ref2 = typeof (base = this.editorElement).getVisibleRowRange === "function" ? base.getVisibleRowRange() : void 0) != null ? ref2 : typeof (base1 = this.editor).getVisibleRowRange === "function" ? base1.getVisibleRowRange() : void 0
      });
      ref3 = this.displayedMarkers;
      for (i = 0, len = ref3.length; i < len; i++) {
        m = ref3[i];
        if (indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
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
        if (ColorMarkerElement == null) {
          ColorMarkerElement = require('./color-marker-element');
        }
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(arg) {
            var marker;
            marker = arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.appendChild(view);
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
      var i, j, len, len1, ref2, ref3, view;
      ref2 = this.usedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        view = ref2[i];
        view.destroy();
      }
      ref3 = this.unusedMarkers;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        view = ref3[j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.querySelectorAll('pigments-color-marker'), function(el) {
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
      var decoration, i, j, len, len1, marker, ref2, ref3, results, results1, view;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        ref2 = this.displayedMarkers;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          marker = ref2[i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        ref3 = this.displayedMarkers;
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          marker = ref3[j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, i, len, markerRange, props, range, selection, selections;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
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
      var i, len, markerRange, range, results, selection, selections;
      selections = this.editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          results.push(view.classList.add('in-fold'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      if (position == null) {
        return;
      }
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (pixelPosition == null) {
        return;
      }
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, ref2, rootElement, scrollTarget, top;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      if (rootElement.querySelector('.lines') == null) {
        return;
      }
      ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = ref2.top, left = ref2.left;
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItYnVmZmVyLWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwySUFBQTtJQUFBOzs7O0VBQUEsTUFBOEMsT0FBQSxDQUFRLFlBQVIsQ0FBOUMsRUFBQyxxREFBRCxFQUEwQjs7RUFFMUIsT0FBcUQsRUFBckQsRUFBQyw0QkFBRCxFQUFxQixpQkFBckIsRUFBOEI7O0VBRTlCLGVBQUEsR0FBa0I7O0VBRVo7Ozs7Ozs7SUFDSixnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixrQkFBN0I7O2lDQUVBLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFPLGVBQVA7UUFDRSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHNCQUFELEVBQVUsK0NBRFo7O01BR0EsT0FBd0MsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QyxFQUFDLElBQUMsQ0FBQSwwQkFBRixFQUFvQixJQUFDLENBQUE7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7TUFDcEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBQ2pCLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUk7SUFWUDs7aUNBWWpCLGdCQUFBLEdBQWtCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGZ0I7O2lDQUlsQixnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFESTs7aUNBR2xCLFdBQUEsR0FBYSxTQUFDLFFBQUQ7YUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCO0lBRFc7O2lDQUdiLFFBQUEsR0FBVSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7O2lDQUVWLFFBQUEsR0FBVSxTQUFDLFdBQUQ7QUFDUixVQUFBO01BRFMsSUFBQyxDQUFBLGNBQUQ7TUFDUixJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsWUFBWDtNQUNGLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBVjtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQjtNQUVqQixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUF5QixDQUFDLElBQTFCLENBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsdUJBQWIsQ0FBcUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQW5CO01BRUEsa0JBQUEsR0FBcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGdCQUFEO1VBQUMsS0FBQyxDQUFBLG1CQUFEO2lCQUFzQixLQUFDLENBQUEsWUFBRCxDQUFBO1FBQXZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUNyQixpQkFBQSxHQUFvQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsZUFBRDtVQUFDLEtBQUMsQ0FBQSxrQkFBRDtVQUNuQixJQUFVLEtBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQVY7QUFBQSxtQkFBQTs7VUFDQSxLQUFDLENBQUEsWUFBRCxDQUFBO2lCQUNBLHFCQUFBLENBQXNCLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGFBQUQsQ0FBQTtVQUFILENBQXRCO1FBSGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUtwQixJQUFHLGdEQUFIO1FBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxhQUFhLENBQUMscUJBQWYsQ0FBcUMsa0JBQXJDLENBQW5CO1FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsaUJBQXBDLENBQW5CLEVBRkY7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBOEIsa0JBQTlCLENBQW5CO1FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsaUJBQTdCLENBQW5CLEVBTEY7O01BT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3JDLEtBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixTQUFDLE1BQUQ7QUFDbkIsZ0JBQUE7O2tCQUFrQixDQUFFLDBCQUFwQixDQUFBOzttQkFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBQTtVQUZtQixDQUFyQjtRQURxQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FBbkI7TUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEMsS0FBQyxDQUFBLHNCQUFELENBQUE7UUFEd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMzQyxLQUFDLENBQUEsc0JBQUQsQ0FBQTtRQUQyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ25ELEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1FBRG1EO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDM0MsS0FBQyxDQUFBLHNCQUFELENBQUE7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM5QyxLQUFDLENBQUEsc0JBQUQsQ0FBQTtRQUQ4QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ25ELEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1FBRG1EO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQjtNQUdBLElBQUcsaUNBQUg7UUFDRSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLG1CQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsQ0FBbkIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBdEIsQ0FBb0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDckQsS0FBQyxDQUFBLG1CQUFELENBQUE7VUFEcUQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLENBQW5CLEVBSEY7O01BTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUN4RCxLQUFDLENBQUEsbUJBQUQsQ0FBQTtRQUR3RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkMsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG1CQUFwQixFQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzFELEtBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBRDBEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QyxDQUFuQjtNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUNBQXBCLEVBQXVELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEUsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUR3RTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHFCQUFwQixFQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDs7WUFDNUQscUJBQXNCLE9BQUEsQ0FBUSx3QkFBUjs7VUFFdEIsSUFBRyxrQkFBa0IsQ0FBQSxTQUFFLENBQUEsWUFBcEIsS0FBc0MsSUFBekM7WUFDRSxrQkFBa0IsQ0FBQyxhQUFuQixDQUFpQyxJQUFqQyxFQURGOztVQUdBLElBQUcsS0FBQyxDQUFBLHNCQUFELENBQXdCLElBQXhCLENBQUg7WUFDRSxLQUFDLENBQUEsMkJBQUQsQ0FBNkIsSUFBN0IsRUFERjtXQUFBLE1BQUE7WUFHRSxJQUFHLElBQUEsS0FBUSxZQUFYO2NBQ0UsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsc0JBQWYsRUFERjthQUFBLE1BQUE7Y0FHRSxLQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0Isc0JBQWxCLEVBSEY7O1lBS0EsS0FBQyxDQUFBLHdCQUFELENBQUE7WUFDQSxLQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFURjs7aUJBV0EsS0FBQyxDQUFBLFlBQUQsR0FBZ0I7UUFqQjRDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQjtNQW1CQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBWixDQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ2xELEtBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBRGtEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQUFuQjtNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsYUFBYSxDQUFDLFdBQWYsQ0FBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0IsQ0FBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLENBQW5CO0lBL0VROztpQ0FpRlYsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBVSx1QkFBVjtBQUFBLGVBQUE7O01BQ0EsSUFBYywwQkFBZDtBQUFBLGVBQUE7O2lGQUN3QyxDQUFFLFdBQTFDLENBQXNELElBQXREO0lBSE07O2lDQUtSLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBYyx1QkFBZDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFaLENBQXdCLElBQXhCO0lBSE07O2lDQUtSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BRUEsSUFBRyxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLHdCQUFELENBQUEsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEscUJBQUQsQ0FBQSxFQUhGOzthQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFUUjs7aUNBV1QsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFHLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUg7UUFDRSxJQUFHLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBSDtpQkFDRSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxFQURGO1NBQUEsTUFBQTtpQkFHRSxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsSUFBQyxDQUFBLFlBQTdCLEVBSEY7U0FERjtPQUFBLE1BQUE7ZUFNRSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBTkY7O0lBRE07O2lDQVNSLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLGlCQUFmLElBQXFDLENBQUksSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBNUM7ZUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLGVBQVAsR0FBeUIsY0FBQSxHQUFjLENBQUMsQ0FBQyxJQUFDLENBQUEsZ0JBQUgsQ0FBZCxHQUFrQyxNQUFsQyxHQUF1QyxDQUFDLENBQUMsSUFBQyxDQUFBLGVBQUgsQ0FBdkMsR0FBMEQsU0FEckY7O0lBRFk7O2lDQUlkLGFBQUEsR0FBZSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7O2lDQUVmLG1CQUFBLEdBQXFCLFNBQUE7TUFDbkIsSUFBYyx5QkFBSixJQUFvQixJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQUE5QjtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO1VBQ25CLElBQUcsMEJBQUg7bUJBQ0UsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQURGO1dBQUEsTUFBQTtZQUdFLE9BQU8sQ0FBQyxJQUFSLENBQWEsNkVBQWIsRUFBNEYsTUFBNUY7bUJBQ0EsS0FBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBSkY7O1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjthQU9BLElBQUMsQ0FBQSxhQUFELENBQUE7SUFUbUI7O2lDQVdyQixZQUFBLEdBQWMsU0FBQyxJQUFEOztRQUFDLE9BQUssSUFBQyxDQUFBOzthQUNuQixJQUFBLEtBQVMsUUFBVCxJQUFBLElBQUEsS0FBbUIsWUFBbkIsSUFBQSxJQUFBLEtBQWlDO0lBRHJCOztpQ0FHZCxTQUFBLEdBQVksU0FBQyxJQUFEOztRQUFDLE9BQUssSUFBQyxDQUFBOzthQUNqQixJQUFBLEtBQVMsWUFBVCxJQUFBLElBQUEsS0FBdUI7SUFEYjs7aUNBR1osb0JBQUEsR0FBc0IsU0FBQTthQUNwQixJQUFDLENBQUEsc0JBQUQsQ0FBd0IsSUFBQyxDQUFBLFlBQXpCO0lBRG9COztpQ0FHdEIsc0JBQUEsR0FBd0IsU0FBQyxJQUFEOztRQUN0QixxQkFBc0IsT0FBQSxDQUFRLHdCQUFSOzthQUV0QixrQkFBa0IsQ0FBQyxzQkFBbkIsQ0FBMEMsSUFBMUM7SUFIc0I7O2lDQUt4QiwyQkFBQSxHQUE2QixTQUFDLElBQUQ7TUFDekIsSUFBQyxDQUFBLHFCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtNQUVBLElBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLENBQUg7ZUFDRSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsSUFBNUIsRUFIRjs7SUFKeUI7O2lDQVM3Qix3QkFBQSxHQUEwQixTQUFBO01BQ3hCLElBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSwyQkFBRCxDQUFBLEVBSEY7O0lBRHdCOztpQ0FjMUIsMEJBQUEsR0FBNEIsU0FBQyxJQUFEO0FBQzFCLFVBQUE7TUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQVY7QUFBQSxlQUFBOzs7UUFFQSxJQUFDLENBQUEsa0JBQW1COzs7UUFDcEIsSUFBQyxDQUFBLHVCQUF3Qjs7TUFFekIsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsb0JBQWIsQ0FBQTtBQUVWO0FBQUEsV0FBQSxzQ0FBQTs7Y0FBZ0MsYUFBUyxPQUFULEVBQUEsQ0FBQTs7OztjQUNILENBQUUsT0FBN0IsQ0FBQTs7UUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUMsQ0FBQyxFQUFGLENBQTlCO1FBQ0EsT0FBTyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFDLENBQUMsRUFBRjtRQUN4QixPQUFPLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxDQUFDLENBQUMsRUFBRjtBQUovQjtNQU1BLGFBQUEsR0FBZ0I7TUFDaEIsWUFBQSxHQUFlO0FBRWYsV0FBQSwyQ0FBQTs7UUFDRSxvQ0FBVSxDQUFFLE9BQVQsQ0FBQSxXQUFBLElBQXVCLGFBQVMsSUFBQyxDQUFBLGdCQUFWLEVBQUEsQ0FBQSxLQUExQjtVQUNFLE9BQXFCLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixDQUExQixFQUE2QixJQUE3QixDQUFyQixFQUFDLDBCQUFELEVBQVk7VUFDWixJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWI7VUFDQSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFDLENBQUMsRUFBRixDQUFqQixHQUF5QjtVQUN6QixJQUFDLENBQUEsb0JBQXFCLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBdEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUMsQ0FBQyxNQUF6QixFQUFpQztZQUM3RCxJQUFBLEVBQU0sV0FEdUQ7WUFFN0QsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFBLEdBQVksSUFBWixHQUFpQixHQUFqQixHQUFvQixTQUZrQztZQUc3RCxpQkFBQSxFQUFtQixJQUFBLEtBQVEsV0FIa0M7V0FBakMsRUFKaEM7O0FBREY7TUFXQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7YUFDcEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZDtJQTdCMEI7O2lDQStCNUIsMkJBQUEsR0FBNkIsU0FBQTtBQUMzQixVQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7O1FBQ0UsSUFBc0MsZ0NBQXRDO1VBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxFQUFBLENBQTlCLEVBQUE7O1FBQ0EsSUFBSSxDQUFDLE9BQUwsQ0FBQTtBQUZGO01BSUEsT0FBTyxJQUFDLENBQUE7TUFDUixPQUFPLElBQUMsQ0FBQTthQUNSLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQVBPOztpQ0FTN0Isd0JBQUEsR0FBMEIsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUN4QixVQUFBO01BQUEsU0FBQSxHQUFZLHFCQUFBLEdBQXFCLENBQUMsZUFBQSxFQUFEO01BQ2pDLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUNSLENBQUEsR0FBSSxNQUFNLENBQUMsS0FBSyxDQUFDO01BRWpCLElBQUcsSUFBQSxLQUFRLG1CQUFYO1FBQ0UsS0FBSyxDQUFDLFNBQU4sR0FBa0IsR0FBQSxHQUNmLFNBRGUsR0FDTCxrQ0FESyxHQUVHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLENBQUEsQ0FBRCxDQUZILEdBRXlCLGNBRnpCLEdBR1IsQ0FBSSxDQUFBLEdBQUksSUFBUCxHQUFpQixPQUFqQixHQUE4QixPQUEvQixDQUhRLEdBRytCLE9BSm5EO09BQUEsTUFPSyxJQUFHLElBQUEsS0FBUSxrQkFBWDtRQUNILEtBQUssQ0FBQyxTQUFOLEdBQWtCLEdBQUEsR0FDZixTQURlLEdBQ0wsa0NBREssR0FFRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FGSCxHQUV5QixPQUh4QztPQUFBLE1BTUEsSUFBRyxJQUFBLEtBQVEsZ0JBQVg7UUFDSCxLQUFLLENBQUMsU0FBTixHQUFrQixHQUFBLEdBQ2YsU0FEZSxHQUNMLDhCQURLLEdBRUQsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsQ0FBQSxDQUFELENBRkMsR0FFcUIsT0FIcEM7O2FBT0w7UUFBQyxXQUFBLFNBQUQ7UUFBWSxPQUFBLEtBQVo7O0lBekJ3Qjs7aUNBbUMxQixnQkFBQSxHQUFrQixTQUFDLElBQUQ7QUFDaEIsVUFBQTtNQUFBLE9BQUEsR0FBVTtRQUFBLElBQUEsRUFBTSxXQUFBLEdBQVksSUFBbEI7O01BQ1YsSUFBMkIsSUFBQSxLQUFVLFFBQXJDO1FBQUEsT0FBTyxDQUFDLFFBQVIsR0FBbUIsS0FBbkI7O01BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBa0IsT0FBbEI7TUFDVixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7O1FBQ3BCLElBQUMsQ0FBQSx1QkFBd0I7O01BQ3pCLGVBQUEsR0FBa0IsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFnQixDQUFDLGFBQWpCLENBQStCLG1CQUEvQjtNQUNsQixJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSTtNQUUxQixJQUFDLENBQUEsa0JBQWtCLENBQUMsR0FBcEIsQ0FBd0IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxlQUFiLEVBQ3RCO1FBQUEsU0FBQSxFQUFXLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDtBQUNULGdCQUFBO1lBQUEsZ0JBQUEsR0FBbUIsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBO1lBRTFCLElBQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxPQUFqQixDQUF5QixNQUF6QixDQUFQO2NBQ0UsZ0JBQUEsR0FBbUIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsTUFBL0IsRUFEckI7O1lBR0EsSUFBYyx3QkFBZDtBQUFBLHFCQUFBOztZQUVBLFFBQUEsR0FBVyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7WUFDcEMsV0FBQSxHQUFjLEtBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUF5QixTQUFDLENBQUQ7cUJBQU8sQ0FBQyxDQUFDLEVBQUYsS0FBUSxNQUFBLENBQU8sUUFBUDtZQUFmLENBQXpCLENBQTBELENBQUEsQ0FBQTtZQUV4RSxJQUFBLENBQUEsQ0FBYyxxQkFBQSxJQUFpQiwyQkFBL0IsQ0FBQTtBQUFBLHFCQUFBOzttQkFFQSxLQUFDLENBQUEsV0FBVyxDQUFDLDhCQUFiLENBQTRDLFdBQTVDO1VBYlM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7T0FEc0IsQ0FBeEI7TUFnQkEsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsQ0FBSDtRQUNFLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxHQUFwQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxPQUFEO1lBQzFDLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkLENBQUg7dUNBQ0UsT0FBTyxDQUFFLE9BQVQsQ0FBaUIsU0FBQyxNQUFEO3VCQUNmLEtBQUMsQ0FBQSwyQkFBRCxDQUE2QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQTFDLEVBQStDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBaEU7Y0FEZSxDQUFqQixXQURGO2FBQUEsTUFHSyxJQUFHLE9BQU8sQ0FBQyxLQUFSLElBQWtCLE9BQU8sQ0FBQyxTQUE3QjtxQkFDSCxLQUFDLENBQUEsMkJBQUQsQ0FBNkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUEzQyxFQUFnRCxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxFLEVBREc7O1VBSnFDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQUF4QixFQURGOzthQVFBLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixJQUF6QjtJQWxDZ0I7O2lDQW9DbEIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsT0FBcEIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtBQUNwQjtBQUFBLFdBQUEsVUFBQTs7UUFBQSxVQUFVLENBQUMsT0FBWCxDQUFBO0FBQUE7TUFDQSxPQUFPLElBQUMsQ0FBQTthQUNSLE9BQU8sSUFBQyxDQUFBO0lBTks7O2lDQVFmLHVCQUFBLEdBQXlCLFNBQUMsSUFBRDtBQUN2QixVQUFBOztRQUR3QixPQUFLLElBQUMsQ0FBQTs7TUFDOUIsSUFBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFWO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxvQkFBYixDQUFBO0FBRVY7QUFBQSxXQUFBLHNDQUFBOztjQUFnQyxhQUFTLE9BQVQsRUFBQSxDQUFBOzs7O2NBQ0gsQ0FBRSxPQUE3QixDQUFBOztRQUNBLE9BQU8sSUFBQyxDQUFBLG9CQUFxQixDQUFBLENBQUMsQ0FBQyxFQUFGO0FBRi9CO01BSUEsYUFBQSxHQUFnQjtNQUNoQixZQUFBLEdBQWU7TUFDZixzQkFBQSxHQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO0FBRXpCLFdBQUEsMkNBQUE7O1FBQ0Usb0NBQVUsQ0FBRSxPQUFULENBQUEsV0FBQSxJQUF1QixhQUFTLElBQUMsQ0FBQSxnQkFBVixFQUFBLENBQUEsS0FBMUI7VUFDRSxJQUFDLENBQUEsb0JBQXFCLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBdEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUMsQ0FBQyxNQUF6QixFQUFpQztZQUM3RCxJQUFBLEVBQU0sUUFEdUQ7WUFFN0QsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFGc0Q7WUFHN0QsSUFBQSxFQUFNLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUF6QixDQUh1RDtXQUFqQyxFQURoQzs7UUFPQSxJQUFBLEdBQU8sSUFBQyxDQUFBLG9CQUFxQixDQUFBLENBQUMsQ0FBQyxFQUFGO1FBQzdCLEdBQUEsR0FBTSxDQUFDLENBQUMsTUFBTSxDQUFDLHNCQUFULENBQUEsQ0FBaUMsQ0FBQzs7VUFDeEMsYUFBYyxDQUFBLEdBQUEsSUFBUTs7UUFFdEIsSUFBWSxhQUFjLENBQUEsR0FBQSxDQUFkLElBQXNCLHNCQUFsQztBQUFBLG1CQUFBOztRQUVBLFNBQUEsR0FBWTtRQUVaLElBQUcsSUFBQSxLQUFVLFFBQWI7VUFDRSxTQUFBLEdBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxDQUFDLEdBQUQsRUFBTSxLQUFOLENBQTlDLENBQThELENBQUMsS0FEN0U7O1FBR0EsU0FBQSxHQUFZO1FBRVosSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQTNCLEdBQW9DLENBQUMsU0FBQSxHQUFZLGFBQWMsQ0FBQSxHQUFBLENBQWQsR0FBcUIsU0FBbEMsQ0FBQSxHQUE0QztRQUVoRixhQUFjLENBQUEsR0FBQSxDQUFkO1FBQ0EsWUFBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsWUFBVCxFQUF1QixhQUFjLENBQUEsR0FBQSxDQUFyQztBQXhCakI7TUEwQkEsSUFBRyxJQUFBLEtBQVEsUUFBWDtRQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEIsQ0FBMkIsQ0FBQyxLQUFLLENBQUMsUUFBbEMsR0FBK0MsQ0FBQyxZQUFBLEdBQWUsU0FBaEIsQ0FBQSxHQUEwQixLQUQzRTtPQUFBLE1BQUE7UUFHRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCLENBQTJCLENBQUMsS0FBSyxDQUFDLEtBQWxDLEdBQTBDLE1BSDVDOztNQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjthQUNwQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkO0lBN0N1Qjs7aUNBK0N6QiwyQkFBQSxHQUE2QixTQUFDLFFBQUQsRUFBVyxNQUFYO0FBQzNCLFVBQUE7TUFBQSxhQUFBLEdBQWdCO0FBRWhCO1dBQVcsOEdBQVg7OztBQUNFO0FBQUE7ZUFBQSxzQ0FBQTs7WUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLG9CQUFxQixDQUFBLENBQUMsQ0FBQyxFQUFGO1lBQzdCLElBQWdCLGdCQUFoQjtBQUFBLHVCQUFBOztZQUNBLFNBQUEsR0FBWSxDQUFDLENBQUMsTUFBTSxDQUFDLHNCQUFULENBQUEsQ0FBaUMsQ0FBQztZQUM5QyxJQUFnQixHQUFBLEtBQU8sU0FBdkI7QUFBQSx1QkFBQTs7O2NBRUEsYUFBYyxDQUFBLEdBQUEsSUFBUTs7WUFFdEIsU0FBQSxHQUFZLElBQUMsQ0FBQSxhQUFhLENBQUMsOEJBQWYsQ0FBOEMsQ0FBQyxHQUFELEVBQU0sS0FBTixDQUE5QyxDQUE4RCxDQUFDO1lBRTNFLFNBQUEsR0FBWTtZQUVaLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUEzQixHQUFvQyxDQUFDLFNBQUEsR0FBWSxhQUFjLENBQUEsR0FBQSxDQUFkLEdBQXFCLFNBQWxDLENBQUEsR0FBNEM7MEJBQ2hGLGFBQWMsQ0FBQSxHQUFBLENBQWQ7QUFiRjs7O0FBREY7O0lBSDJCOztpQ0FtQjdCLHVCQUFBLEdBQXlCLFNBQUMsTUFBRDtBQUN2QixVQUFBO01BQUEsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ04sR0FBRyxDQUFDLFNBQUosR0FBZ0IsaUNBQUEsR0FDZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsQ0FBQSxDQUFELENBRGhCLEdBQ3NDLHFCQUR0QyxHQUMyRCxNQUFNLENBQUMsRUFEbEUsR0FDcUU7YUFFckY7SUFMdUI7O2lDQWV6QixtQkFBQSxHQUFxQixTQUFDLE9BQUQ7TUFDbkIsSUFBRyxJQUFDLENBQUEsY0FBSjtRQUNFLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixPQUFyQjtBQUNoQixlQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxZQUFELEdBQWdCLE9BQU8sQ0FBQyxLQUFSLENBQUE7UUFDaEIsSUFBQyxDQUFBLGNBQUQsR0FBa0IsS0FMcEI7O2FBT0EscUJBQUEsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ3BCLGNBQUE7VUFBQSxZQUFBLEdBQWU7QUFDZjtBQUFBLGVBQUEsc0NBQUE7O2dCQUFpRCxhQUFTLFlBQVQsRUFBQSxDQUFBO2NBQWpELFlBQVksQ0FBQyxJQUFiLENBQWtCLENBQWxCOztBQUFBO1VBRUEsT0FBTyxLQUFDLENBQUE7VUFDUixPQUFPLEtBQUMsQ0FBQTtVQUVSLElBQWMseUJBQWQ7QUFBQSxtQkFBQTs7aUJBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxNQUFEO21CQUFZLE1BQU0sQ0FBQyxNQUFQLENBQUE7VUFBWixDQUFyQjtRQVRvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFSbUI7O2lDQW1CckIsYUFBQSxHQUFlLFNBQUMsSUFBRDtBQUNiLFVBQUE7O1FBRGMsT0FBSyxJQUFDLENBQUE7O01BQ3BCLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBVjtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMscUJBQWIsQ0FBbUM7UUFDM0Msd0JBQUEsNE1BQXdFLENBQUMsNkJBRDlCO09BQW5DO0FBSVY7QUFBQSxXQUFBLHNDQUFBOztZQUFnQyxhQUFTLE9BQVQsRUFBQSxDQUFBO1VBQzlCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFuQjs7QUFERjtBQUdBLFdBQUEsMkNBQUE7OzRDQUE2QixDQUFFLE9BQVQsQ0FBQSxXQUFBLElBQXVCLGFBQVMsSUFBQyxDQUFBLGdCQUFWLEVBQUEsQ0FBQTtVQUMzQyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBbkI7O0FBREY7TUFHQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7YUFFcEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZDtJQWZhOztpQ0FpQmYsaUJBQUEsR0FBbUIsU0FBQyxNQUFEO0FBQ2pCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBbEI7UUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUEsRUFEVDtPQUFBLE1BQUE7O1VBR0UscUJBQXNCLE9BQUEsQ0FBUSx3QkFBUjs7UUFFdEIsSUFBQSxHQUFPLElBQUk7UUFDWCxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFsQjtRQUNBLElBQUksQ0FBQyxZQUFMLENBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsR0FBRDtBQUNoQixnQkFBQTtZQURrQixTQUFEO1lBQ2pCLEtBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUF5QixLQUFDLENBQUEsZ0JBQWdCLENBQUMsT0FBbEIsQ0FBMEIsTUFBMUIsQ0FBekIsRUFBNEQsQ0FBNUQ7bUJBQ0EsS0FBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CO1VBRmdCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtRQUdBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixFQVZGOztNQVlBLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZDtNQUVBLElBQUMsQ0FBQSw2QkFBRCxDQUErQixNQUEvQixFQUF1QyxJQUF2QztNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFsQjtNQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsSUFBNUI7YUFDQTtJQWxCaUI7O2lDQW9CbkIsaUJBQUEsR0FBbUIsU0FBQyxZQUFEO0FBQ2pCLFVBQUE7TUFBQSxNQUFBLEdBQVM7TUFDVCxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFvQixZQUFwQjtNQUVQLElBQUcsWUFBSDtRQUNFLElBQWtDLGNBQWxDO1VBQUEsSUFBQyxDQUFBLGNBQWMsRUFBQyxNQUFELEVBQWYsQ0FBdUIsTUFBdkIsRUFBQTs7ZUFDQSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsSUFBdEIsRUFGRjs7SUFKaUI7O2lDQVFuQixvQkFBQSxHQUFzQixTQUFDLElBQUQ7TUFDcEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQW9CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixJQUFyQixDQUFwQixFQUFnRCxDQUFoRDtNQUNBLElBQUEsQ0FBMkIsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUEzQjtRQUFBLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixJQUFwQjtJQUhvQjs7aUNBS3RCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7UUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBO0FBQUE7QUFDQTtBQUFBLFdBQUEsd0NBQUE7O1FBQUEsSUFBSSxDQUFDLE9BQUwsQ0FBQTtBQUFBO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBRWpCLEtBQUssQ0FBQSxTQUFFLENBQUEsT0FBTyxDQUFDLElBQWYsQ0FBb0IsSUFBQyxDQUFBLGdCQUFELENBQWtCLHVCQUFsQixDQUFwQixFQUFnRSxTQUFDLEVBQUQ7ZUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQWQsQ0FBMEIsRUFBMUI7TUFBUixDQUFoRTtJQVBxQjs7aUNBaUJ2QixzQkFBQSxHQUF3QixTQUFBO01BQ3RCLElBQVUsSUFBQyxDQUFBLGVBQVg7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxlQUFELEdBQW1CO2FBQ25CLHFCQUFBLENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsZUFBRCxHQUFtQjtVQUNuQixJQUFVLEtBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsV0FBcEIsQ0FBQSxDQUFWO0FBQUEsbUJBQUE7O2lCQUNBLEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBSG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUpzQjs7aUNBU3hCLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsVUFBQTtNQUFBLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBVjtBQUFBLGVBQUE7O01BQ0EsSUFBRyxJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQUFIO0FBQ0U7QUFBQTthQUFBLHNDQUFBOztVQUNFLFVBQUEsR0FBYSxJQUFDLENBQUEsb0JBQXFCLENBQUEsTUFBTSxDQUFDLEVBQVA7VUFFbkMsSUFBb0Qsa0JBQXBEO3lCQUFBLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixNQUE3QixFQUFxQyxVQUFyQyxHQUFBO1dBQUEsTUFBQTtpQ0FBQTs7QUFIRjt1QkFERjtPQUFBLE1BQUE7QUFNRTtBQUFBO2FBQUEsd0NBQUE7O1VBQ0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEI7VUFDUCxJQUFHLFlBQUg7WUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsUUFBdEI7WUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsU0FBdEI7MEJBQ0EsSUFBQyxDQUFBLDZCQUFELENBQStCLE1BQS9CLEVBQXVDLElBQXZDLEdBSEY7V0FBQSxNQUFBOzBCQUtFLE9BQU8sQ0FBQyxJQUFSLENBQWEsb0ZBQWIsRUFBbUcsTUFBbkcsR0FMRjs7QUFGRjt3QkFORjs7SUFGZ0I7O2lDQWlCbEIsMkJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsVUFBVDtBQUMzQixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBO01BRWIsS0FBQSxHQUFRLFVBQVUsQ0FBQyxhQUFYLENBQUE7TUFDUixPQUFBLEdBQVUsS0FBSyxFQUFDLEtBQUQsRUFBTSxDQUFDLEtBQVosQ0FBa0IsTUFBbEI7QUFFVixXQUFBLDRDQUFBOztRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBO1FBQ1IsV0FBQSxHQUFjLE1BQU0sQ0FBQyxjQUFQLENBQUE7UUFFZCxJQUFBLENBQUEsQ0FBZ0IscUJBQUEsSUFBaUIsZUFBakMsQ0FBQTtBQUFBLG1CQUFBOztRQUNBLElBQUcsV0FBVyxDQUFDLGNBQVosQ0FBMkIsS0FBM0IsQ0FBSDtVQUNFLElBQXFDLDBDQUFyQztZQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsSUFBYyxnQkFBZDs7VUFDQSxLQUFLLEVBQUMsS0FBRCxFQUFMLEdBQWMsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO1VBQ2QsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsS0FBekI7QUFDQSxpQkFKRjs7QUFMRjtNQVdBLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQUMsR0FBRDtlQUFTLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWixFQUE2QixFQUE3QjtNQUFULENBQVo7TUFDVixLQUFLLEVBQUMsS0FBRCxFQUFMLEdBQWMsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO2FBQ2QsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsS0FBekI7SUFuQjJCOztpQ0FxQjdCLDZCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLElBQVQ7QUFDN0IsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtBQUViO1dBQUEsNENBQUE7O1FBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUE7UUFDUixXQUFBLEdBQWMsTUFBTSxDQUFDLGNBQVAsQ0FBQTtRQUVkLElBQUEsQ0FBQSxDQUFnQixxQkFBQSxJQUFpQixlQUFqQyxDQUFBO0FBQUEsbUJBQUE7O1FBRUEsSUFBZ0MsV0FBVyxDQUFDLGNBQVosQ0FBMkIsS0FBM0IsQ0FBaEM7VUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWYsQ0FBbUIsUUFBbkIsRUFBQTs7UUFDQSxJQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBdUIsQ0FBQyxLQUFLLENBQUMsR0FBMUQsQ0FBbEM7dUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLFNBQW5CLEdBQUE7U0FBQSxNQUFBOytCQUFBOztBQVBGOztJQUg2Qjs7aUNBNEIvQix3QkFBQSxHQUEwQixTQUFDLEtBQUQ7QUFDeEIsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsS0FBN0I7TUFFWCxJQUFjLGdCQUFkO0FBQUEsZUFBQTs7TUFFQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLCtCQUFwQixDQUFvRCxRQUFwRDthQUVqQixJQUFDLENBQUEsV0FBVyxDQUFDLDhCQUFiLENBQTRDLGNBQTVDO0lBUHdCOztpQ0FTMUIsMkJBQUEsR0FBNkIsU0FBQyxLQUFEO0FBQzNCLFVBQUE7TUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixLQUE1QjtNQUVoQixJQUFjLHFCQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFHLHlEQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxhQUE5QyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxNQUFNLENBQUMsOEJBQVIsQ0FBdUMsYUFBdkMsRUFIRjs7SUFMMkI7O2lDQVU3QiwwQkFBQSxHQUE0QixTQUFDLEtBQUQ7QUFDMUIsVUFBQTtNQUFDLHVCQUFELEVBQVU7TUFFVixZQUFBLEdBQWtCLHVDQUFILEdBQ2IsSUFBQyxDQUFBLGFBRFksR0FHYixJQUFDLENBQUE7TUFFSCxXQUFBLEdBQWMsSUFBQyxDQUFBLGFBQUQsQ0FBQTtNQUVkLElBQWMsMkNBQWQ7QUFBQSxlQUFBOztNQUVBLE9BQWMsV0FBVyxDQUFDLGFBQVosQ0FBMEIsUUFBMUIsQ0FBbUMsQ0FBQyxxQkFBcEMsQ0FBQSxDQUFkLEVBQUMsY0FBRCxFQUFNO01BQ04sR0FBQSxHQUFNLE9BQUEsR0FBVSxHQUFWLEdBQWdCLFlBQVksQ0FBQyxZQUFiLENBQUE7TUFDdEIsSUFBQSxHQUFPLE9BQUEsR0FBVSxJQUFWLEdBQWlCLFlBQVksQ0FBQyxhQUFiLENBQUE7YUFDeEI7UUFBQyxLQUFBLEdBQUQ7UUFBTSxNQUFBLElBQU47O0lBZjBCOzs7O0tBNWpCRzs7RUE2a0JqQyxNQUFNLENBQUMsT0FBUCxHQUNBLGtCQUFBLEdBQ0EsdUJBQUEsQ0FBd0Isa0JBQXhCLEVBQTRDLGtCQUFrQixDQUFDLFNBQS9EO0FBcmxCQSIsInNvdXJjZXNDb250ZW50IjpbIntyZWdpc3Rlck9yVXBkYXRlRWxlbWVudCwgRXZlbnRzRGVsZWdhdGlvbn0gPSByZXF1aXJlICdhdG9tLXV0aWxzJ1xuXG5bQ29sb3JNYXJrZXJFbGVtZW50LCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlXSA9IFtdXG5cbm5leHRIaWdobGlnaHRJZCA9IDBcblxuY2xhc3MgQ29sb3JCdWZmZXJFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgRXZlbnRzRGVsZWdhdGlvbi5pbmNsdWRlSW50byh0aGlzKVxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICB1bmxlc3MgRW1pdHRlcj9cbiAgICAgIHtFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiAgICBbQGVkaXRvclNjcm9sbExlZnQsIEBlZGl0b3JTY3JvbGxUb3BdID0gWzAsIDBdXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgQHVzZWRNYXJrZXJzID0gW11cbiAgICBAdW51c2VkTWFya2VycyA9IFtdXG4gICAgQHZpZXdzQnlNYXJrZXJzID0gbmV3IFdlYWtNYXBcblxuICBhdHRhY2hlZENhbGxiYWNrOiAtPlxuICAgIEBhdHRhY2hlZCA9IHRydWVcbiAgICBAdXBkYXRlKClcblxuICBkZXRhY2hlZENhbGxiYWNrOiAtPlxuICAgIEBhdHRhY2hlZCA9IGZhbHNlXG5cbiAgb25EaWRVcGRhdGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXVwZGF0ZScsIGNhbGxiYWNrXG5cbiAgZ2V0TW9kZWw6IC0+IEBjb2xvckJ1ZmZlclxuXG4gIHNldE1vZGVsOiAoQGNvbG9yQnVmZmVyKSAtPlxuICAgIHtAZWRpdG9yfSA9IEBjb2xvckJ1ZmZlclxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICBAZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKVxuXG4gICAgQGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKS50aGVuID0+IEB1cGRhdGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2VycyA9PiBAdXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yQnVmZmVyLm9uRGlkRGVzdHJveSA9PiBAZGVzdHJveSgpXG5cbiAgICBzY3JvbGxMZWZ0TGlzdGVuZXIgPSAoQGVkaXRvclNjcm9sbExlZnQpID0+IEB1cGRhdGVTY3JvbGwoKVxuICAgIHNjcm9sbFRvcExpc3RlbmVyID0gKEBlZGl0b3JTY3JvbGxUb3ApID0+XG4gICAgICByZXR1cm4gaWYgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIEB1cGRhdGVTY3JvbGwoKVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGVNYXJrZXJzKClcblxuICAgIGlmIEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdD9cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQoc2Nyb2xsTGVmdExpc3RlbmVyKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFRvcExpc3RlbmVyKVxuICAgIGVsc2VcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxMZWZ0TGlzdGVuZXIpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVNjcm9sbFRvcChzY3JvbGxUb3BMaXN0ZW5lcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlID0+XG4gICAgICBAdXNlZE1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29sb3JNYXJrZXI/LmludmFsaWRhdGVTY3JlZW5SYW5nZUNhY2hlKClcbiAgICAgICAgbWFya2VyLmNoZWNrU2NyZWVuUmFuZ2UoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRBZGRDdXJzb3IgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZUN1cnNvciA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZEFkZFNlbGVjdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkUmVtb3ZlU2VsZWN0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZSA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuXG4gICAgaWYgQGVkaXRvci5vbkRpZFRva2VuaXplP1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRUb2tlbml6ZSA9PiBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG4gICAgZWxzZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3IuZGlzcGxheUJ1ZmZlci5vbkRpZFRva2VuaXplID0+XG4gICAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdlZGl0b3IuZm9udFNpemUnLCA9PlxuICAgICAgQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2VkaXRvci5saW5lSGVpZ2h0JywgPT5cbiAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tYXhEZWNvcmF0aW9uc0luR3V0dGVyJywgPT5cbiAgICAgIEB1cGRhdGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1hcmtlclR5cGUnLCAodHlwZSkgPT5cbiAgICAgIENvbG9yTWFya2VyRWxlbWVudCA/PSByZXF1aXJlICcuL2NvbG9yLW1hcmtlci1lbGVtZW50J1xuXG4gICAgICBpZiBDb2xvck1hcmtlckVsZW1lbnQ6OnJlbmRlcmVyVHlwZSBpc250IHR5cGVcbiAgICAgICAgQ29sb3JNYXJrZXJFbGVtZW50LnNldE1hcmtlclR5cGUodHlwZSlcblxuICAgICAgaWYgQGlzTmF0aXZlRGVjb3JhdGlvblR5cGUodHlwZSlcbiAgICAgICAgQGluaXRpYWxpemVOYXRpdmVEZWNvcmF0aW9ucyh0eXBlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiB0eXBlIGlzICdiYWNrZ3JvdW5kJ1xuICAgICAgICAgIEBjbGFzc0xpc3QuYWRkKCdhYm92ZS1lZGl0b3ItY29udGVudCcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY2xhc3NMaXN0LnJlbW92ZSgnYWJvdmUtZWRpdG9yLWNvbnRlbnQnKVxuXG4gICAgICAgIEBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgICAgICBAdXBkYXRlTWFya2Vycyh0eXBlKVxuXG4gICAgICBAcHJldmlvdXNUeXBlID0gdHlwZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50ID0+XG4gICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRBdHRhY2ggPT4gQGF0dGFjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkRGV0YWNoID0+IEBkZXRhY2goKVxuXG4gIGF0dGFjaDogLT5cbiAgICByZXR1cm4gaWYgQHBhcmVudE5vZGU/XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yRWxlbWVudD9cbiAgICBAZ2V0RWRpdG9yUm9vdCgpLnF1ZXJ5U2VsZWN0b3IoJy5saW5lcycpPy5hcHBlbmRDaGlsZCh0aGlzKVxuXG4gIGRldGFjaDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYXJlbnROb2RlP1xuXG4gICAgQHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZXRhY2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGlzTmF0aXZlRGVjb3JhdGlvblR5cGUoKVxuICAgICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgZWxzZVxuICAgICAgQHJlbGVhc2VBbGxNYXJrZXJWaWV3cygpXG5cbiAgICBAY29sb3JCdWZmZXIgPSBudWxsXG5cbiAgdXBkYXRlOiAtPlxuICAgIGlmIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBpZiBAaXNHdXR0ZXJUeXBlKClcbiAgICAgICAgQHVwZGF0ZUd1dHRlckRlY29yYXRpb25zKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zKEBwcmV2aW91c1R5cGUpXG4gICAgZWxzZVxuICAgICAgQHVwZGF0ZU1hcmtlcnMoKVxuXG4gIHVwZGF0ZVNjcm9sbDogLT5cbiAgICBpZiBAZWRpdG9yRWxlbWVudC5oYXNUaWxlZFJlbmRlcmluZyBhbmQgbm90IEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBAc3R5bGUud2Via2l0VHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUzZCgjey1AZWRpdG9yU2Nyb2xsTGVmdH1weCwgI3stQGVkaXRvclNjcm9sbFRvcH1weCwgMClcIlxuXG4gIGdldEVkaXRvclJvb3Q6IC0+IEBlZGl0b3JFbGVtZW50XG5cbiAgZWRpdG9yQ29uZmlnQ2hhbmdlZDogLT5cbiAgICByZXR1cm4gaWYgbm90IEBwYXJlbnROb2RlPyBvciBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgIEB1c2VkTWFya2Vycy5mb3JFYWNoIChtYXJrZXIpID0+XG4gICAgICBpZiBtYXJrZXIuY29sb3JNYXJrZXI/XG4gICAgICAgIG1hcmtlci5yZW5kZXIoKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gXCJBIG1hcmtlciB2aWV3IHdhcyBmb3VuZCBpbiB0aGUgdXNlZCBpbnN0YW5jZSBwb29sIHdoaWxlIGhhdmluZyBhIG51bGwgbW9kZWxcIiwgbWFya2VyXG4gICAgICAgIEByZWxlYXNlTWFya2VyRWxlbWVudChtYXJrZXIpXG5cbiAgICBAdXBkYXRlTWFya2VycygpXG5cbiAgaXNHdXR0ZXJUeXBlOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHR5cGUgaW4gWydndXR0ZXInLCAnbmF0aXZlLWRvdCcsICduYXRpdmUtc3F1YXJlLWRvdCddXG5cbiAgaXNEb3RUeXBlOiAgKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICB0eXBlIGluIFsnbmF0aXZlLWRvdCcsICduYXRpdmUtc3F1YXJlLWRvdCddXG5cbiAgdXNlTmF0aXZlRGVjb3JhdGlvbnM6IC0+XG4gICAgQGlzTmF0aXZlRGVjb3JhdGlvblR5cGUoQHByZXZpb3VzVHlwZSlcblxuICBpc05hdGl2ZURlY29yYXRpb25UeXBlOiAodHlwZSkgLT5cbiAgICBDb2xvck1hcmtlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1tYXJrZXItZWxlbWVudCdcblxuICAgIENvbG9yTWFya2VyRWxlbWVudC5pc05hdGl2ZURlY29yYXRpb25UeXBlKHR5cGUpXG5cbiAgaW5pdGlhbGl6ZU5hdGl2ZURlY29yYXRpb25zOiAodHlwZSkgLT5cbiAgICAgIEByZWxlYXNlQWxsTWFya2VyVmlld3MoKVxuICAgICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG5cbiAgICAgIGlmIEBpc0d1dHRlclR5cGUodHlwZSlcbiAgICAgICAgQGluaXRpYWxpemVHdXR0ZXIodHlwZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zKHR5cGUpXG5cbiAgZGVzdHJveU5hdGl2ZURlY29yYXRpb25zOiAtPlxuICAgIGlmIEBpc0d1dHRlclR5cGUoKVxuICAgICAgQGRlc3Ryb3lHdXR0ZXIoKVxuICAgIGVsc2VcbiAgICAgIEBkZXN0cm95SGlnaGxpZ2h0RGVjb3JhdGlvbnMoKVxuXG4gICMjICAgIyMgICAgICMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMjIyMjIyMjICMjICMjICAgIyMjIyAjIyMjIyMjIyMgIyMgICAgICAgIyMgIyMgICAjIyMjICMjIyMjIyMjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAgICAjI1xuXG4gIHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zOiAodHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBAc3R5bGVCeU1hcmtlcklkID89IHt9XG4gICAgQGRlY29yYXRpb25CeU1hcmtlcklkID89IHt9XG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIEByZW1vdmVDaGlsZChAc3R5bGVCeU1hcmtlcklkW20uaWRdKVxuICAgICAgZGVsZXRlIEBzdHlsZUJ5TWFya2VySWRbbS5pZF1cbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAge2NsYXNzTmFtZSwgc3R5bGV9ID0gQGdldEhpZ2hsaWdoRGVjb3JhdGlvbkNTUyhtLCB0eXBlKVxuICAgICAgICBAYXBwZW5kQ2hpbGQoc3R5bGUpXG4gICAgICAgIEBzdHlsZUJ5TWFya2VySWRbbS5pZF0gPSBzdHlsZVxuICAgICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0gPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyKG0ubWFya2VyLCB7XG4gICAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgICAgICBjbGFzczogXCJwaWdtZW50cy0je3R5cGV9ICN7Y2xhc3NOYW1lfVwiXG4gICAgICAgICAgaW5jbHVkZU1hcmtlclRleHQ6IHR5cGUgaXMgJ2hpZ2hsaWdodCdcbiAgICAgICAgfSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUnXG5cbiAgZGVzdHJveUhpZ2hsaWdodERlY29yYXRpb25zOiAtPlxuICAgIGZvciBpZCwgZGVjbyBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICAgIEByZW1vdmVDaGlsZChAc3R5bGVCeU1hcmtlcklkW2lkXSkgaWYgQHN0eWxlQnlNYXJrZXJJZFtpZF0/XG4gICAgICBkZWNvLmRlc3Ryb3koKVxuXG4gICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgIGRlbGV0ZSBAc3R5bGVCeU1hcmtlcklkXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuXG4gIGdldEhpZ2hsaWdoRGVjb3JhdGlvbkNTUzogKG1hcmtlciwgdHlwZSkgLT5cbiAgICBjbGFzc05hbWUgPSBcInBpZ21lbnRzLWhpZ2hsaWdodC0je25leHRIaWdobGlnaHRJZCsrfVwiXG4gICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgbCA9IG1hcmtlci5jb2xvci5sdW1hXG5cbiAgICBpZiB0eXBlIGlzICduYXRpdmUtYmFja2dyb3VuZCdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICAgIGNvbG9yOiAje2lmIGwgPiAwLjQzIHRoZW4gJ2JsYWNrJyBlbHNlICd3aGl0ZSd9O1xuICAgICAgfVxuICAgICAgXCJcIlwiXG4gICAgZWxzZSBpZiB0eXBlIGlzICduYXRpdmUtdW5kZXJsaW5lJ1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAuI3tjbGFzc05hbWV9IC5yZWdpb24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuICAgIGVsc2UgaWYgdHlwZSBpcyAnbmF0aXZlLW91dGxpbmUnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0gLnJlZ2lvbiB7XG4gICAgICAgIGJvcmRlci1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICB9XG4gICAgICBcIlwiXCJcblxuICAgIHtjbGFzc05hbWUsIHN0eWxlfVxuXG4gICMjICAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAjIyMjICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMgICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgICMjIyMjIyMgICAgICMjICAgICAgICMjICAgICMjIyMjIyMjICMjICAgICAjI1xuXG4gIGluaXRpYWxpemVHdXR0ZXI6ICh0eXBlKSAtPlxuICAgIG9wdGlvbnMgPSBuYW1lOiBcInBpZ21lbnRzLSN7dHlwZX1cIlxuICAgIG9wdGlvbnMucHJpb3JpdHkgPSAxMDAwIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuXG4gICAgQGd1dHRlciA9IEBlZGl0b3IuYWRkR3V0dGVyKG9wdGlvbnMpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZCA/PSB7fVxuICAgIGd1dHRlckNvbnRhaW5lciA9IEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmd1dHRlci1jb250YWluZXInKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQHN1YnNjcmliZVRvIGd1dHRlckNvbnRhaW5lcixcbiAgICAgIG1vdXNlZG93bjogKGUpID0+XG4gICAgICAgIHRhcmdldERlY29yYXRpb24gPSBlLnBhdGhbMF1cblxuICAgICAgICB1bmxlc3MgdGFyZ2V0RGVjb3JhdGlvbi5tYXRjaGVzKCdzcGFuJylcbiAgICAgICAgICB0YXJnZXREZWNvcmF0aW9uID0gdGFyZ2V0RGVjb3JhdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJylcblxuICAgICAgICByZXR1cm4gdW5sZXNzIHRhcmdldERlY29yYXRpb24/XG5cbiAgICAgICAgbWFya2VySWQgPSB0YXJnZXREZWNvcmF0aW9uLmRhdGFzZXQubWFya2VySWRcbiAgICAgICAgY29sb3JNYXJrZXIgPSBAZGlzcGxheWVkTWFya2Vycy5maWx0ZXIoKG0pIC0+IG0uaWQgaXMgTnVtYmVyKG1hcmtlcklkKSlbMF1cblxuICAgICAgICByZXR1cm4gdW5sZXNzIGNvbG9yTWFya2VyPyBhbmQgQGNvbG9yQnVmZmVyP1xuXG4gICAgICAgIEBjb2xvckJ1ZmZlci5zZWxlY3RDb2xvck1hcmtlckFuZE9wZW5QaWNrZXIoY29sb3JNYXJrZXIpXG5cbiAgICBpZiBAaXNEb3RUeXBlKHR5cGUpXG4gICAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlIChjaGFuZ2VzKSA9PlxuICAgICAgICBpZiBBcnJheS5pc0FycmF5IGNoYW5nZXNcbiAgICAgICAgICBjaGFuZ2VzPy5mb3JFYWNoIChjaGFuZ2UpID0+XG4gICAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKGNoYW5nZS5zdGFydC5yb3csIGNoYW5nZS5uZXdFeHRlbnQucm93KVxuICAgICAgICBlbHNlIGlmIGNoYW5nZXMuc3RhcnQgYW5kIGNoYW5nZXMubmV3RXh0ZW50XG4gICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhjaGFuZ2VzLnN0YXJ0LnJvdywgY2hhbmdlcy5uZXdFeHRlbnQucm93KVxuXG4gICAgQHVwZGF0ZUd1dHRlckRlY29yYXRpb25zKHR5cGUpXG5cbiAgZGVzdHJveUd1dHRlcjogLT5cbiAgICBAZ3V0dGVyLmRlc3Ryb3koKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIGRlY29yYXRpb24uZGVzdHJveSgpIGZvciBpZCwgZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgZGVsZXRlIEBndXR0ZXJTdWJzY3JpcHRpb25cblxuICB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9uczogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcbiAgICBtYXhEZWNvcmF0aW9uc0luR3V0dGVyID0gYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5tYXhEZWNvcmF0aW9uc0luR3V0dGVyJylcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdndXR0ZXInXG4gICAgICAgICAgY2xhc3M6ICdwaWdtZW50cy1ndXR0ZXItbWFya2VyJ1xuICAgICAgICAgIGl0ZW06IEBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbShtKVxuICAgICAgICB9KVxuXG4gICAgICBkZWNvID0gQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG4gICAgICByb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICBjb250aW51ZSBpZiBtYXJrZXJzQnlSb3dzW3Jvd10gPj0gbWF4RGVjb3JhdGlvbnNJbkd1dHRlclxuXG4gICAgICByb3dMZW5ndGggPSAwXG5cbiAgICAgIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgIGRlY29XaWR0aCA9IDE0XG5cbiAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7cm93TGVuZ3RoICsgbWFya2Vyc0J5Um93c1tyb3ddICogZGVjb1dpZHRofXB4XCJcblxuICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcbiAgICAgIG1heFJvd0xlbmd0aCA9IE1hdGgubWF4KG1heFJvd0xlbmd0aCwgbWFya2Vyc0J5Um93c1tyb3ddKVxuXG4gICAgaWYgdHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLm1pbldpZHRoID0gXCIje21heFJvd0xlbmd0aCAqIGRlY29XaWR0aH1weFwiXG4gICAgZWxzZVxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLndpZHRoID0gXCIwcHhcIlxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHM6IChyb3dTdGFydCwgcm93RW5kKSAtPlxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuXG4gICAgZm9yIHJvdyBpbiBbcm93U3RhcnQuLnJvd0VuZF1cbiAgICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIGRlY28gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cbiAgICAgICAgY29udGludWUgdW5sZXNzIG0ubWFya2VyP1xuICAgICAgICBtYXJrZXJSb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyByb3cgaXMgbWFya2VyUm93XG5cbiAgICAgICAgbWFya2Vyc0J5Um93c1tyb3ddID89IDBcblxuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgICAgZGVjb1dpZHRoID0gMTRcblxuICAgICAgICBkZWNvLnByb3BlcnRpZXMuaXRlbS5zdHlsZS5sZWZ0ID0gXCIje3Jvd0xlbmd0aCArIG1hcmtlcnNCeVJvd3Nbcm93XSAqIGRlY29XaWR0aH1weFwiXG4gICAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSsrXG5cbiAgZ2V0R3V0dGVyRGVjb3JhdGlvbkl0ZW06IChtYXJrZXIpIC0+XG4gICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9OycgZGF0YS1tYXJrZXItaWQ9JyN7bWFya2VyLmlkfSc+PC9zcGFuPlxuICAgIFwiXCJcIlxuICAgIGRpdlxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjIyAgICMjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgIyMgICMjICAgICAgICMjICAgICAjIyAjIyAgICAjI1xuICAjIyAgICAjIyMjICMjIyMgICMjICAgIyMgICMjICAgICAjIyAjIyAgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMgICAgIyMjIyMjICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjIyAjIyAgICMjICAgIyMgICMjICAgIyMgICAgICAgIyMgICAjIyAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgIyMgICMjICAgICAgICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIHJlcXVlc3RNYXJrZXJVcGRhdGU6IChtYXJrZXJzKSAtPlxuICAgIGlmIEBmcmFtZVJlcXVlc3RlZFxuICAgICAgQGRpcnR5TWFya2VycyA9IEBkaXJ0eU1hcmtlcnMuY29uY2F0KG1hcmtlcnMpXG4gICAgICByZXR1cm5cbiAgICBlbHNlXG4gICAgICBAZGlydHlNYXJrZXJzID0gbWFya2Vycy5zbGljZSgpXG4gICAgICBAZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgIGRpcnR5TWFya2VycyA9IFtdXG4gICAgICBkaXJ0eU1hcmtlcnMucHVzaChtKSBmb3IgbSBpbiBAZGlydHlNYXJrZXJzIHdoZW4gbSBub3QgaW4gZGlydHlNYXJrZXJzXG5cbiAgICAgIGRlbGV0ZSBAZnJhbWVSZXF1ZXN0ZWRcbiAgICAgIGRlbGV0ZSBAZGlydHlNYXJrZXJzXG5cbiAgICAgIHJldHVybiB1bmxlc3MgQGNvbG9yQnVmZmVyP1xuXG4gICAgICBkaXJ0eU1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSAtPiBtYXJrZXIucmVuZGVyKClcblxuICB1cGRhdGVNYXJrZXJzOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZmluZFZhbGlkQ29sb3JNYXJrZXJzKHtcbiAgICAgIGludGVyc2VjdHNTY3JlZW5Sb3dSYW5nZTogQGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlPygpID8gQGVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2U/KClcbiAgICB9KVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAcmVsZWFzZU1hcmtlclZpZXcobSlcblxuICAgIGZvciBtIGluIG1hcmtlcnMgd2hlbiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICBAcmVxdWVzdE1hcmtlclZpZXcobSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICByZXF1ZXN0TWFya2VyVmlldzogKG1hcmtlcikgLT5cbiAgICBpZiBAdW51c2VkTWFya2Vycy5sZW5ndGhcbiAgICAgIHZpZXcgPSBAdW51c2VkTWFya2Vycy5zaGlmdCgpXG4gICAgZWxzZVxuICAgICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICAgIHZpZXcgPSBuZXcgQ29sb3JNYXJrZXJFbGVtZW50XG4gICAgICB2aWV3LnNldENvbnRhaW5lcih0aGlzKVxuICAgICAgdmlldy5vbkRpZFJlbGVhc2UgKHttYXJrZXJ9KSA9PlxuICAgICAgICBAZGlzcGxheWVkTWFya2Vycy5zcGxpY2UoQGRpc3BsYXllZE1hcmtlcnMuaW5kZXhPZihtYXJrZXIpLCAxKVxuICAgICAgICBAcmVsZWFzZU1hcmtlclZpZXcobWFya2VyKVxuICAgICAgQGFwcGVuZENoaWxkIHZpZXdcblxuICAgIHZpZXcuc2V0TW9kZWwobWFya2VyKVxuXG4gICAgQGhpZGVNYXJrZXJJZkluU2VsZWN0aW9uT3JGb2xkKG1hcmtlciwgdmlldylcbiAgICBAdXNlZE1hcmtlcnMucHVzaCh2aWV3KVxuICAgIEB2aWV3c0J5TWFya2Vycy5zZXQobWFya2VyLCB2aWV3KVxuICAgIHZpZXdcblxuICByZWxlYXNlTWFya2VyVmlldzogKG1hcmtlck9yVmlldykgLT5cbiAgICBtYXJrZXIgPSBtYXJrZXJPclZpZXdcbiAgICB2aWV3ID0gQHZpZXdzQnlNYXJrZXJzLmdldChtYXJrZXJPclZpZXcpXG5cbiAgICBpZiB2aWV3P1xuICAgICAgQHZpZXdzQnlNYXJrZXJzLmRlbGV0ZShtYXJrZXIpIGlmIG1hcmtlcj9cbiAgICAgIEByZWxlYXNlTWFya2VyRWxlbWVudCh2aWV3KVxuXG4gIHJlbGVhc2VNYXJrZXJFbGVtZW50OiAodmlldykgLT5cbiAgICBAdXNlZE1hcmtlcnMuc3BsaWNlKEB1c2VkTWFya2Vycy5pbmRleE9mKHZpZXcpLCAxKVxuICAgIHZpZXcucmVsZWFzZShmYWxzZSkgdW5sZXNzIHZpZXcuaXNSZWxlYXNlZCgpXG4gICAgQHVudXNlZE1hcmtlcnMucHVzaCh2aWV3KVxuXG4gIHJlbGVhc2VBbGxNYXJrZXJWaWV3czogLT5cbiAgICB2aWV3LmRlc3Ryb3koKSBmb3IgdmlldyBpbiBAdXNlZE1hcmtlcnNcbiAgICB2aWV3LmRlc3Ryb3koKSBmb3IgdmlldyBpbiBAdW51c2VkTWFya2Vyc1xuXG4gICAgQHVzZWRNYXJrZXJzID0gW11cbiAgICBAdW51c2VkTWFya2VycyA9IFtdXG5cbiAgICBBcnJheTo6Zm9yRWFjaC5jYWxsIEBxdWVyeVNlbGVjdG9yQWxsKCdwaWdtZW50cy1jb2xvci1tYXJrZXInKSwgKGVsKSAtPiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyMjICMjICAgICAgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICMjICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyAgICMjICAgICAgICMjIyMjIyAgICMjICAgICAgICAgICMjXG4gICMjICAgICAgICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICAgICMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICMjICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICAjIyMjIyMgICAgICMjXG5cbiAgcmVxdWVzdFNlbGVjdGlvblVwZGF0ZTogLT5cbiAgICByZXR1cm4gaWYgQHVwZGF0ZVJlcXVlc3RlZFxuXG4gICAgQHVwZGF0ZVJlcXVlc3RlZCA9IHRydWVcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgIEB1cGRhdGVSZXF1ZXN0ZWQgPSBmYWxzZVxuICAgICAgcmV0dXJuIGlmIEBlZGl0b3IuZ2V0QnVmZmVyKCkuaXNEZXN0cm95ZWQoKVxuICAgICAgQHVwZGF0ZVNlbGVjdGlvbnMoKVxuXG4gIHVwZGF0ZVNlbGVjdGlvbnM6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgIGlmIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBmb3IgbWFya2VyIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIGRlY29yYXRpb24gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbWFya2VyLmlkXVxuXG4gICAgICAgIEBoaWRlRGVjb3JhdGlvbklmSW5TZWxlY3Rpb24obWFya2VyLCBkZWNvcmF0aW9uKSBpZiBkZWNvcmF0aW9uP1xuICAgIGVsc2VcbiAgICAgIGZvciBtYXJrZXIgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgdmlldyA9IEB2aWV3c0J5TWFya2Vycy5nZXQobWFya2VyKVxuICAgICAgICBpZiB2aWV3P1xuICAgICAgICAgIHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgICAgICAgICB2aWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2luLWZvbGQnKVxuICAgICAgICAgIEBoaWRlTWFya2VySWZJblNlbGVjdGlvbk9yRm9sZChtYXJrZXIsIHZpZXcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLndhcm4gXCJBIGNvbG9yIG1hcmtlciB3YXMgZm91bmQgaW4gdGhlIGRpc3BsYXllZCBtYXJrZXJzIGFycmF5IHdpdGhvdXQgYW4gYXNzb2NpYXRlZCB2aWV3XCIsIG1hcmtlclxuXG4gIGhpZGVEZWNvcmF0aW9uSWZJblNlbGVjdGlvbjogKG1hcmtlciwgZGVjb3JhdGlvbikgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIHByb3BzID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBjbGFzc2VzID0gcHJvcHMuY2xhc3Muc3BsaXQoL1xccysvZylcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cbiAgICAgIGlmIG1hcmtlclJhbmdlLmludGVyc2VjdHNXaXRoKHJhbmdlKVxuICAgICAgICBjbGFzc2VzWzBdICs9ICctaW4tc2VsZWN0aW9uJyB1bmxlc3MgY2xhc3Nlc1swXS5tYXRjaCgvLWluLXNlbGVjdGlvbiQvKT9cbiAgICAgICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgICAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMocHJvcHMpXG4gICAgICAgIHJldHVyblxuXG4gICAgY2xhc3NlcyA9IGNsYXNzZXMubWFwIChjbHMpIC0+IGNscy5yZXBsYWNlKCctaW4tc2VsZWN0aW9uJywgJycpXG4gICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhwcm9wcylcblxuICBoaWRlTWFya2VySWZJblNlbGVjdGlvbk9yRm9sZDogKG1hcmtlciwgdmlldykgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cblxuICAgICAgdmlldy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSBpZiBtYXJrZXJSYW5nZS5pbnRlcnNlY3RzV2l0aChyYW5nZSlcbiAgICAgIHZpZXcuY2xhc3NMaXN0LmFkZCgnaW4tZm9sZCcpIGlmICBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93KVxuXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICAjIyAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAgICAjIyAgICAjIyMjIyMgICAgICAjIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICAgIyMgIyMgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgICAgIyNcbiAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjICAgICAjI1xuICAjIyAgICAjIyMgICAjIyMgIyMgICAgICAgIyMjICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjIyMgIyMjIyAjIyAgICAgICAjIyMjICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjIyMjIyAgICMjICMjICMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICMjIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICMjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICAjIyMjIyMjXG5cbiAgY29sb3JNYXJrZXJGb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgcG9zaXRpb24gPSBAc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwb3NpdGlvbj9cblxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGNvbG9yQnVmZmVyLmVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gICAgQGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VyQXRCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICBwaXhlbFBvc2l0aW9uID0gQHBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwaXhlbFBvc2l0aW9uP1xuXG4gICAgaWYgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uP1xuICAgICAgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKHBpeGVsUG9zaXRpb24pXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24ocGl4ZWxQb3NpdGlvbilcblxuICBwaXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHtjbGllbnRYLCBjbGllbnRZfSA9IGV2ZW50XG5cbiAgICBzY3JvbGxUYXJnZXQgPSBpZiBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3A/XG4gICAgICBAZWRpdG9yRWxlbWVudFxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3JcblxuICAgIHJvb3RFbGVtZW50ID0gQGdldEVkaXRvclJvb3QoKVxuXG4gICAgcmV0dXJuIHVubGVzcyByb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMnKT9cblxuICAgIHt0b3AsIGxlZnR9ID0gcm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmVzJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICB0b3AgPSBjbGllbnRZIC0gdG9wICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbFRvcCgpXG4gICAgbGVmdCA9IGNsaWVudFggLSBsZWZ0ICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbExlZnQoKVxuICAgIHt0b3AsIGxlZnR9XG5cbm1vZHVsZS5leHBvcnRzID1cbkNvbG9yQnVmZmVyRWxlbWVudCA9XG5yZWdpc3Rlck9yVXBkYXRlRWxlbWVudCAncGlnbWVudHMtbWFya2VycycsIENvbG9yQnVmZmVyRWxlbWVudC5wcm90b3R5cGVcbiJdfQ==
