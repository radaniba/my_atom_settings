(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, RENDERERS, SPEC_MODE, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = [], CompositeDisposable = _ref[0], Emitter = _ref[1];

  _ref1 = require('atom-utils'), registerOrUpdateElement = _ref1.registerOrUpdateElement, EventsDelegation = _ref1.EventsDelegation;

  SPEC_MODE = atom.inSpecMode();

  RENDERERS = {
    'background': require('./renderers/background'),
    'outline': require('./renderers/outline'),
    'underline': require('./renderers/underline'),
    'dot': require('./renderers/dot'),
    'square-dot': require('./renderers/square-dot')
  };

  ColorMarkerElement = (function(_super) {
    __extends(ColorMarkerElement, _super);

    function ColorMarkerElement() {
      return ColorMarkerElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorMarkerElement);

    ColorMarkerElement.prototype.renderer = new RENDERERS.background;

    ColorMarkerElement.prototype.createdCallback = function() {
      var _ref2;
      if (Emitter == null) {
        _ref2 = require('atom'), CompositeDisposable = _ref2.CompositeDisposable, Emitter = _ref2.Emitter;
      }
      this.emitter = new Emitter;
      return this.released = true;
    };

    ColorMarkerElement.prototype.attachedCallback = function() {};

    ColorMarkerElement.prototype.detachedCallback = function() {};

    ColorMarkerElement.prototype.onDidRelease = function(callback) {
      return this.emitter.on('did-release', callback);
    };

    ColorMarkerElement.prototype.setContainer = function(bufferElement) {
      this.bufferElement = bufferElement;
    };

    ColorMarkerElement.prototype.getModel = function() {
      return this.colorMarker;
    };

    ColorMarkerElement.prototype.setModel = function(colorMarker) {
      var _ref2;
      this.colorMarker = colorMarker;
      if (!this.released) {
        return;
      }
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), CompositeDisposable = _ref2.CompositeDisposable, Emitter = _ref2.Emitter;
      }
      this.released = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.colorMarker.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.release();
        };
      })(this)));
      this.subscriptions.add(this.colorMarker.marker.onDidChange((function(_this) {
        return function(data) {
          var isValid;
          isValid = data.isValid;
          if (isValid) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          } else {
            return _this.release();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (!_this.bufferElement.useNativeDecorations()) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this, {
        click: (function(_this) {
          return function(e) {
            var colorBuffer;
            colorBuffer = _this.colorMarker.colorBuffer;
            if (colorBuffer == null) {
              return;
            }
            return colorBuffer.selectColorMarkerAndOpenPicker(_this.colorMarker);
          };
        })(this)
      }));
      return this.render();
    };

    ColorMarkerElement.prototype.destroy = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.parentNode) != null) {
        _ref2.removeChild(this);
      }
      if ((_ref3 = this.subscriptions) != null) {
        _ref3.dispose();
      }
      return this.clear();
    };

    ColorMarkerElement.prototype.render = function() {
      var bufferElement, cls, colorMarker, k, region, regions, renderer, style, v, _i, _len, _ref2;
      if (!((this.colorMarker != null) && (this.colorMarker.color != null) && (this.renderer != null))) {
        return;
      }
      colorMarker = this.colorMarker, renderer = this.renderer, bufferElement = this.bufferElement;
      if (bufferElement.editor.isDestroyed()) {
        return;
      }
      this.innerHTML = '';
      _ref2 = renderer.render(colorMarker), style = _ref2.style, regions = _ref2.regions, cls = _ref2["class"];
      regions = (regions || []).filter(function(r) {
        return r != null;
      });
      if ((regions != null ? regions.some(function(r) {
        return r != null ? r.invalid : void 0;
      }) : void 0) && !SPEC_MODE) {
        return bufferElement.requestMarkerUpdate([this]);
      }
      for (_i = 0, _len = regions.length; _i < _len; _i++) {
        region = regions[_i];
        this.appendChild(region);
      }
      if (cls != null) {
        this.className = cls;
      } else {
        this.className = '';
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      } else {
        this.style.cssText = '';
      }
      return this.lastMarkerScreenRange = colorMarker.getScreenRange();
    };

    ColorMarkerElement.prototype.checkScreenRange = function() {
      if (!((this.colorMarker != null) && (this.lastMarkerScreenRange != null))) {
        return;
      }
      if (!this.lastMarkerScreenRange.isEqual(this.colorMarker.getScreenRange())) {
        return this.render();
      }
    };

    ColorMarkerElement.prototype.isReleased = function() {
      return this.released;
    };

    ColorMarkerElement.prototype.release = function(dispatchEvent) {
      var marker;
      if (dispatchEvent == null) {
        dispatchEvent = true;
      }
      if (this.released) {
        return;
      }
      this.subscriptions.dispose();
      marker = this.colorMarker;
      this.clear();
      if (dispatchEvent) {
        return this.emitter.emit('did-release', {
          marker: marker,
          view: this
        });
      }
    };

    ColorMarkerElement.prototype.clear = function() {
      this.subscriptions = null;
      this.colorMarker = null;
      this.released = true;
      this.innerHTML = '';
      this.className = '';
      return this.style.cssText = '';
    };

    return ColorMarkerElement;

  })(HTMLElement);

  module.exports = ColorMarkerElement = registerOrUpdateElement('pigments-color-marker', ColorMarkerElement.prototype);

  ColorMarkerElement.isNativeDecorationType = function(type) {
    return type === 'gutter' || type === 'native-background' || type === 'native-outline' || type === 'native-underline' || type === 'native-dot' || type === 'native-square-dot';
  };

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (ColorMarkerElement.isNativeDecorationType(markerType)) {
      return;
    }
    if (RENDERERS[markerType] == null) {
      return;
    }
    this.prototype.rendererType = markerType;
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItbWFya2VyLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFpQyxFQUFqQyxFQUFDLDZCQUFELEVBQXNCLGlCQUF0QixDQUFBOztBQUFBLEVBRUEsUUFBOEMsT0FBQSxDQUFRLFlBQVIsQ0FBOUMsRUFBQyxnQ0FBQSx1QkFBRCxFQUEwQix5QkFBQSxnQkFGMUIsQ0FBQTs7QUFBQSxFQUlBLFNBQUEsR0FBWSxJQUFJLENBQUMsVUFBTCxDQUFBLENBSlosQ0FBQTs7QUFBQSxFQUtBLFNBQUEsR0FDRTtBQUFBLElBQUEsWUFBQSxFQUFjLE9BQUEsQ0FBUSx3QkFBUixDQUFkO0FBQUEsSUFDQSxTQUFBLEVBQVcsT0FBQSxDQUFRLHFCQUFSLENBRFg7QUFBQSxJQUVBLFdBQUEsRUFBYSxPQUFBLENBQVEsdUJBQVIsQ0FGYjtBQUFBLElBR0EsS0FBQSxFQUFPLE9BQUEsQ0FBUSxpQkFBUixDQUhQO0FBQUEsSUFJQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBSmQ7R0FORixDQUFBOztBQUFBLEVBWU07QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixrQkFBN0IsQ0FBQSxDQUFBOztBQUFBLGlDQUVBLFFBQUEsR0FBVSxHQUFBLENBQUEsU0FBYSxDQUFDLFVBRnhCLENBQUE7O0FBQUEsaUNBSUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLEtBQUE7QUFBQSxNQUFBLElBQXVELGVBQXZEO0FBQUEsUUFBQSxRQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDRCQUFBLG1CQUFELEVBQXNCLGdCQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-marker-element.coffee
