(function() {
  var ColorMarker, CompositeDisposable, fill, _ref;

  _ref = [], CompositeDisposable = _ref[0], fill = _ref[1];

  module.exports = ColorMarker = (function() {
    function ColorMarker(_arg) {
      this.marker = _arg.marker, this.color = _arg.color, this.text = _arg.text, this.invalid = _arg.invalid, this.colorBuffer = _arg.colorBuffer;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.id = this.marker.id;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.markerWasDestroyed();
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function() {
          if (_this.marker.isValid()) {
            _this.invalidateScreenRangeCache();
            return _this.checkMarkerScope();
          } else {
            return _this.destroy();
          }
        };
      })(this)));
      this.checkMarkerScope();
    }

    ColorMarker.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      return this.marker.destroy();
    };

    ColorMarker.prototype.markerWasDestroyed = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.subscriptions.dispose();
      _ref1 = {}, this.marker = _ref1.marker, this.color = _ref1.color, this.text = _ref1.text, this.colorBuffer = _ref1.colorBuffer;
      return this.destroyed = true;
    };

    ColorMarker.prototype.match = function(properties) {
      var bool;
      if (this.destroyed) {
        return false;
      }
      bool = true;
      if (properties.bufferRange != null) {
        bool && (bool = this.marker.getBufferRange().isEqual(properties.bufferRange));
      }
      if (properties.color != null) {
        bool && (bool = properties.color.isEqual(this.color));
      }
      if (properties.match != null) {
        bool && (bool = properties.match === this.text);
      }
      if (properties.text != null) {
        bool && (bool = properties.text === this.text);
      }
      return bool;
    };

    ColorMarker.prototype.serialize = function() {
      var out;
      if (this.destroyed) {
        return;
      }
      out = {
        markerId: String(this.marker.id),
        bufferRange: this.marker.getBufferRange().serialize(),
        color: this.color.serialize(),
        text: this.text,
        variables: this.color.variables
      };
      if (!this.color.isValid()) {
        out.invalid = true;
      }
      return out;
    };

    ColorMarker.prototype.checkMarkerScope = function(forceEvaluation) {
      var e, range, scope, scopeChain, _ref1;
      if (forceEvaluation == null) {
        forceEvaluation = false;
      }
      if (this.destroyed || (this.colorBuffer == null)) {
        return;
      }
      range = this.marker.getBufferRange();
      try {
        scope = this.colorBuffer.editor.scopeDescriptorForBufferPosition != null ? this.colorBuffer.editor.scopeDescriptorForBufferPosition(range.start) : this.colorBuffer.editor.displayBuffer.scopeDescriptorForBufferPosition(range.start);
        scopeChain = scope.getScopeChain();
        if (!scopeChain || (!forceEvaluation && scopeChain === this.lastScopeChain)) {
          return;
        }
        this.ignored = ((_ref1 = this.colorBuffer.ignoredScopes) != null ? _ref1 : []).some(function(scopeRegExp) {
          return scopeChain.match(scopeRegExp);
        });
        return this.lastScopeChain = scopeChain;
      } catch (_error) {
        e = _error;
        return console.error(e);
      }
    };

    ColorMarker.prototype.isIgnored = function() {
      return this.ignored;
    };

    ColorMarker.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    ColorMarker.prototype.getScreenRange = function() {
      var _ref1;
      return this.screenRangeCache != null ? this.screenRangeCache : this.screenRangeCache = (_ref1 = this.marker) != null ? _ref1.getScreenRange() : void 0;
    };

    ColorMarker.prototype.invalidateScreenRangeCache = function() {
      return this.screenRangeCache = null;
    };

    ColorMarker.prototype.convertContentToHex = function() {
      return this.convertContentInPlace('hex');
    };

    ColorMarker.prototype.convertContentToRGB = function() {
      return this.convertContentInPlace('rgb');
    };

    ColorMarker.prototype.convertContentToRGBA = function() {
      return this.convertContentInPlace('rgba');
    };

    ColorMarker.prototype.convertContentToHSL = function() {
      return this.convertContentInPlace('hsl');
    };

    ColorMarker.prototype.convertContentToHSLA = function() {
      return this.convertContentInPlace('hsla');
    };

    ColorMarker.prototype.copyContentAsHex = function() {
      return atom.clipboard.write(this.convertContent('hex'));
    };

    ColorMarker.prototype.copyContentAsRGB = function() {
      return atom.clipboard.write(this.convertContent('rgb'));
    };

    ColorMarker.prototype.copyContentAsRGBA = function() {
      return atom.clipboard.write(this.convertContent('rgba'));
    };

    ColorMarker.prototype.copyContentAsHSL = function() {
      return atom.clipboard.write(this.convertContent('hsl'));
    };

    ColorMarker.prototype.copyContentAsHSLA = function() {
      return atom.clipboard.write(this.convertContent('hsla'));
    };

    ColorMarker.prototype.convertContentInPlace = function(mode) {
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), this.convertContent(mode));
    };

    ColorMarker.prototype.convertContent = function(mode) {
      if (fill == null) {
        fill = require('./utils').fill;
      }
      switch (mode) {
        case 'hex':
          return '#' + fill(this.color.hex, 6);
        case 'rgb':
          return "rgb(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ")";
        case 'rgba':
          return "rgba(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ", " + this.color.alpha + ")";
        case 'hsl':
          return "hsl(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%)";
        case 'hsla':
          return "hsla(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%, " + this.color.alpha + ")";
      }
    };

    return ColorMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItbWFya2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTs7QUFBQSxFQUFBLE9BQThCLEVBQTlCLEVBQUMsNkJBQUQsRUFBc0IsY0FBdEIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHFCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEsYUFBQSxPQUFPLElBQUMsQ0FBQSxZQUFBLE1BQU0sSUFBQyxDQUFBLGVBQUEsU0FBUyxJQUFDLENBQUEsbUJBQUEsV0FDaEQsQ0FBQTtBQUFBLE1BQUEsSUFBOEMsMkJBQTlDO0FBQUEsUUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFGZCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSGpCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckIsQ0FBbkIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-marker.coffee
