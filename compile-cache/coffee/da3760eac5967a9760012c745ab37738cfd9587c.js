(function() {
  var Palette;

  module.exports = Palette = (function() {
    Palette.deserialize = function(state) {
      return new Palette(state.variables);
    };

    function Palette(variables) {
      this.variables = variables != null ? variables : [];
    }

    Palette.prototype.getTitle = function() {
      return 'Palette';
    };

    Palette.prototype.getURI = function() {
      return 'pigments://palette';
    };

    Palette.prototype.getIconName = function() {
      return "pigments";
    };

    Palette.prototype.sortedByColor = function() {
      return this.variables.slice().sort((function(_this) {
        return function(_arg, _arg1) {
          var a, b;
          a = _arg.color;
          b = _arg1.color;
          return _this.compareColors(a, b);
        };
      })(this));
    };

    Palette.prototype.sortedByName = function() {
      var collator;
      collator = new Intl.Collator("en-US", {
        numeric: true
      });
      return this.variables.slice().sort(function(_arg, _arg1) {
        var a, b;
        a = _arg.name;
        b = _arg1.name;
        return collator.compare(a, b);
      });
    };

    Palette.prototype.getColorsNames = function() {
      return this.variables.map(function(v) {
        return v.name;
      });
    };

    Palette.prototype.getColorsCount = function() {
      return this.variables.length;
    };

    Palette.prototype.eachColor = function(iterator) {
      var v, _i, _len, _ref, _results;
      _ref = this.variables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(iterator(v));
      }
      return _results;
    };

    Palette.prototype.compareColors = function(a, b) {
      var aHue, aLightness, aSaturation, bHue, bLightness, bSaturation, _ref, _ref1;
      _ref = a.hsl, aHue = _ref[0], aSaturation = _ref[1], aLightness = _ref[2];
      _ref1 = b.hsl, bHue = _ref1[0], bSaturation = _ref1[1], bLightness = _ref1[2];
      if (aHue < bHue) {
        return -1;
      } else if (aHue > bHue) {
        return 1;
      } else if (aSaturation < bSaturation) {
        return -1;
      } else if (aSaturation > bSaturation) {
        return 1;
      } else if (aLightness < bLightness) {
        return -1;
      } else if (aLightness > bLightness) {
        return 1;
      } else {
        return 0;
      }
    };

    Palette.prototype.serialize = function() {
      return {
        deserializer: 'Palette',
        variables: this.variables
      };
    };

    return Palette;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGFsZXR0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsT0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLE9BQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFBZSxJQUFBLE9BQUEsQ0FBUSxLQUFLLENBQUMsU0FBZCxFQUFmO0lBQUEsQ0FBZCxDQUFBOztBQUVhLElBQUEsaUJBQUUsU0FBRixHQUFBO0FBQWlCLE1BQWhCLElBQUMsQ0FBQSxnQ0FBQSxZQUFVLEVBQUssQ0FBakI7SUFBQSxDQUZiOztBQUFBLHNCQUlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxVQUFIO0lBQUEsQ0FKVixDQUFBOztBQUFBLHNCQU1BLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFBRyxxQkFBSDtJQUFBLENBTlIsQ0FBQTs7QUFBQSxzQkFRQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsV0FBSDtJQUFBLENBUmIsQ0FBQTs7QUFBQSxzQkFVQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEVBQVksS0FBWixHQUFBO0FBQTBCLGNBQUEsSUFBQTtBQUFBLFVBQWxCLElBQVAsS0FBQyxLQUF3QixDQUFBO0FBQUEsVUFBUCxJQUFQLE1BQUMsS0FBYSxDQUFBO2lCQUFBLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFpQixDQUFqQixFQUExQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLEVBRGE7SUFBQSxDQVZmLENBQUE7O0FBQUEsc0JBYUEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFVBQUEsUUFBQTtBQUFBLE1BQUEsUUFBQSxHQUFlLElBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFkLEVBQXVCO0FBQUEsUUFBQSxPQUFBLEVBQVMsSUFBVDtPQUF2QixDQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFrQixDQUFDLElBQW5CLENBQXdCLFNBQUMsSUFBRCxFQUFXLEtBQVgsR0FBQTtBQUF3QixZQUFBLElBQUE7QUFBQSxRQUFqQixJQUFOLEtBQUMsSUFBc0IsQ0FBQTtBQUFBLFFBQVAsSUFBTixNQUFDLElBQVksQ0FBQTtlQUFBLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQWpCLEVBQW1CLENBQW5CLEVBQXhCO01BQUEsQ0FBeEIsRUFGWTtJQUFBLENBYmQsQ0FBQTs7QUFBQSxzQkFpQkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxLQUFUO01BQUEsQ0FBZixFQUFIO0lBQUEsQ0FqQmhCLENBQUE7O0FBQUEsc0JBbUJBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFkO0lBQUEsQ0FuQmhCLENBQUE7O0FBQUEsc0JBcUJBLFNBQUEsR0FBVyxTQUFDLFFBQUQsR0FBQTtBQUFjLFVBQUEsMkJBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7cUJBQUE7QUFBQSxzQkFBQSxRQUFBLENBQVMsQ0FBVCxFQUFBLENBQUE7QUFBQTtzQkFBZDtJQUFBLENBckJYLENBQUE7O0FBQUEsc0JBdUJBLGFBQUEsR0FBZSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDYixVQUFBLHlFQUFBO0FBQUEsTUFBQSxPQUFrQyxDQUFDLENBQUMsR0FBcEMsRUFBQyxjQUFELEVBQU8scUJBQVAsRUFBb0Isb0JBQXBCLENBQUE7QUFBQSxNQUNBLFFBQWtDLENBQUMsQ0FBQyxHQUFwQyxFQUFDLGVBQUQsRUFBTyxzQkFBUCxFQUFvQixxQkFEcEIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFBLEdBQU8sSUFBVjtlQUNFLENBQUEsRUFERjtPQUFBLE1BRUssSUFBRyxJQUFBLEdBQU8sSUFBVjtlQUNILEVBREc7T0FBQSxNQUVBLElBQUcsV0FBQSxHQUFjLFdBQWpCO2VBQ0gsQ0FBQSxFQURHO09BQUEsTUFFQSxJQUFHLFdBQUEsR0FBYyxXQUFqQjtlQUNILEVBREc7T0FBQSxNQUVBLElBQUcsVUFBQSxHQUFhLFVBQWhCO2VBQ0gsQ0FBQSxFQURHO09BQUEsTUFFQSxJQUFHLFVBQUEsR0FBYSxVQUFoQjtlQUNILEVBREc7T0FBQSxNQUFBO2VBR0gsRUFIRztPQWJRO0lBQUEsQ0F2QmYsQ0FBQTs7QUFBQSxzQkF5Q0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFDRSxZQUFBLEVBQWMsU0FEaEI7QUFBQSxRQUVHLFdBQUQsSUFBQyxDQUFBLFNBRkg7UUFEUztJQUFBLENBekNYLENBQUE7O21CQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/palette.coffee
