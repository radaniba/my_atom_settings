(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, RENDERERS, SPEC_MODE, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

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
      this.colorMarker = colorMarker;
      if (!this.released) {
        return;
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
          if (type !== 'gutter') {
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

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (markerType === 'gutter') {
      return;
    }
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItbWFya2VyLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGVBQUEsT0FBdEIsQ0FBQTs7QUFBQSxFQUNBLFFBQThDLE9BQUEsQ0FBUSxZQUFSLENBQTlDLEVBQUMsZ0NBQUEsdUJBQUQsRUFBMEIseUJBQUEsZ0JBRDFCLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUhaLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQ0U7QUFBQSxJQUFBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FBZDtBQUFBLElBQ0EsU0FBQSxFQUFXLE9BQUEsQ0FBUSxxQkFBUixDQURYO0FBQUEsSUFFQSxXQUFBLEVBQWEsT0FBQSxDQUFRLHVCQUFSLENBRmI7QUFBQSxJQUdBLEtBQUEsRUFBTyxPQUFBLENBQVEsaUJBQVIsQ0FIUDtBQUFBLElBSUEsWUFBQSxFQUFjLE9BQUEsQ0FBUSx3QkFBUixDQUpkO0dBTEYsQ0FBQTs7QUFBQSxFQVdNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsa0JBQTdCLENBQUEsQ0FBQTs7QUFBQSxpQ0FFQSxRQUFBLEdBQVUsR0FBQSxDQUFBLFNBQWEsQ0FBQyxVQUZ4QixDQUFBOztBQUFBLGlDQUlBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-marker-element.coffee
