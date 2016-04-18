(function() {
  var OutlineRenderer, RegionRenderer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RegionRenderer = require('./region-renderer');

  module.exports = OutlineRenderer = (function(_super) {
    __extends(OutlineRenderer, _super);

    function OutlineRenderer() {
      return OutlineRenderer.__super__.constructor.apply(this, arguments);
    }

    OutlineRenderer.prototype.render = function(colorMarker) {
      var color, range, region, regions, rowSpan, _i, _len;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (range.isEmpty() || (color == null)) {
        return {};
      }
      rowSpan = range.end.row - range.start.row;
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

    OutlineRenderer.prototype.styleRegion = function(region, color) {
      region.classList.add('outline');
      return region.style.borderColor = color;
    };

    return OutlineRenderer;

  })(RegionRenderer);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL291dGxpbmUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQUFqQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw4QkFBQSxNQUFBLEdBQVEsU0FBQyxXQUFELEdBQUE7QUFDTixVQUFBLGdEQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsV0FBVyxDQUFDLGNBQVosQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxXQUFXLENBQUMsS0FEcEIsQ0FBQTtBQUVBLE1BQUEsSUFBYSxLQUFLLENBQUMsT0FBTixDQUFBLENBQUEsSUFBdUIsZUFBcEM7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUZBO0FBQUEsTUFJQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FKdEMsQ0FBQTtBQUFBLE1BS0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBZixDQUxWLENBQUE7QUFPQSxXQUFBLDhDQUFBOzZCQUFBO1lBQStEO0FBQS9ELFVBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBckIsQ0FBQTtTQUFBO0FBQUEsT0FQQTthQVFBO0FBQUEsUUFBQyxTQUFBLE9BQUQ7UUFUTTtJQUFBLENBQVIsQ0FBQTs7QUFBQSw4QkFXQSxXQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ1gsTUFBQSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLFNBQXJCLENBQUEsQ0FBQTthQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBYixHQUEyQixNQUZoQjtJQUFBLENBWGIsQ0FBQTs7MkJBQUE7O0tBRDRCLGVBSDlCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/outline.coffee
