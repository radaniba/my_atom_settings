(function() {
  var BackgroundRenderer, RegionRenderer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RegionRenderer = require('./region-renderer');

  module.exports = BackgroundRenderer = (function(_super) {
    __extends(BackgroundRenderer, _super);

    function BackgroundRenderer() {
      return BackgroundRenderer.__super__.constructor.apply(this, arguments);
    }

    BackgroundRenderer.prototype.includeTextInRegion = true;

    BackgroundRenderer.prototype.render = function(colorMarker) {
      var color, colorText, l, region, regions, _i, _len;
      color = colorMarker != null ? colorMarker.color : void 0;
      if (color == null) {
        return {};
      }
      regions = this.renderRegions(colorMarker);
      l = color.luma;
      colorText = l > 0.43 ? 'black' : 'white';
      for (_i = 0, _len = regions.length; _i < _len; _i++) {
        region = regions[_i];
        if (region != null) {
          this.styleRegion(region, color.toCSS(), colorText);
        }
      }
      return {
        regions: regions
      };
    };

    BackgroundRenderer.prototype.styleRegion = function(region, color, textColor) {
      region.classList.add('background');
      region.style.backgroundColor = color;
      return region.style.color = textColor;
    };

    return BackgroundRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL2JhY2tncm91bmQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQUFqQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxpQ0FBQSxtQkFBQSxHQUFxQixJQUFyQixDQUFBOztBQUFBLGlDQUNBLE1BQUEsR0FBUSxTQUFDLFdBQUQsR0FBQTtBQUNOLFVBQUEsOENBQUE7QUFBQSxNQUFBLEtBQUEseUJBQVEsV0FBVyxDQUFFLGNBQXJCLENBQUE7QUFFQSxNQUFBLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FGQTtBQUFBLE1BSUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBZixDQUpWLENBQUE7QUFBQSxNQU1BLENBQUEsR0FBSSxLQUFLLENBQUMsSUFOVixDQUFBO0FBQUEsTUFRQSxTQUFBLEdBQWUsQ0FBQSxHQUFJLElBQVAsR0FBaUIsT0FBakIsR0FBOEIsT0FSMUMsQ0FBQTtBQVNBLFdBQUEsOENBQUE7NkJBQUE7WUFBMEU7QUFBMUUsVUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBcUIsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFyQixFQUFvQyxTQUFwQyxDQUFBO1NBQUE7QUFBQSxPQVRBO2FBVUE7QUFBQSxRQUFDLFNBQUEsT0FBRDtRQVhNO0lBQUEsQ0FEUixDQUFBOztBQUFBLGlDQWNBLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFNBQWhCLEdBQUE7QUFDWCxNQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsWUFBckIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWIsR0FBK0IsS0FGL0IsQ0FBQTthQUdBLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixHQUFxQixVQUpWO0lBQUEsQ0FkYixDQUFBOzs4QkFBQTs7S0FEK0IsZUFIakMsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/background.coffee
