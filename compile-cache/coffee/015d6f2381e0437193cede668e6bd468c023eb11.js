(function() {
  var RegionRenderer, UnderlineRenderer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RegionRenderer = require('./region-renderer');

  module.exports = UnderlineRenderer = (function(_super) {
    __extends(UnderlineRenderer, _super);

    function UnderlineRenderer() {
      return UnderlineRenderer.__super__.constructor.apply(this, arguments);
    }

    UnderlineRenderer.prototype.render = function(colorMarker) {
      var color, region, regions, _i, _len;
      color = colorMarker != null ? colorMarker.color : void 0;
      if (color == null) {
        return {};
      }
      regions = this.renderRegions(colorMarker);
      for (_i = 0, _len = regions.length; _i < _len; _i++) {
        region = regions[_i];
        if (region != null) {
          this.styleRegion(region, color.toCSS());
        }
      }
      return {
        regions: regions
      };
    };

    UnderlineRenderer.prototype.styleRegion = function(region, color) {
      region.classList.add('underline');
      return region.style.backgroundColor = color;
    };

    return UnderlineRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL3VuZGVybGluZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBQWpCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGdDQUFBLE1BQUEsR0FBUSxTQUFDLFdBQUQsR0FBQTtBQUNOLFVBQUEsZ0NBQUE7QUFBQSxNQUFBLEtBQUEseUJBQVEsV0FBVyxDQUFFLGNBQXJCLENBQUE7QUFDQSxNQUFBLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FEQTtBQUFBLE1BR0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBZixDQUhWLENBQUE7QUFLQSxXQUFBLDhDQUFBOzZCQUFBO1lBQStEO0FBQS9ELFVBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBckIsQ0FBQTtTQUFBO0FBQUEsT0FMQTthQU1BO0FBQUEsUUFBQyxTQUFBLE9BQUQ7UUFQTTtJQUFBLENBQVIsQ0FBQTs7QUFBQSxnQ0FTQSxXQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ1gsTUFBQSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLFdBQXJCLENBQUEsQ0FBQTthQUVBLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBYixHQUErQixNQUhwQjtJQUFBLENBVGIsQ0FBQTs7NkJBQUE7O0tBRDhCLGVBSGhDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/underline.coffee
