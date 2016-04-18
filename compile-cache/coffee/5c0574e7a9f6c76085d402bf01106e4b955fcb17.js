(function() {
  var AttachedPopover, Popover,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Popover = require('./popover');

  module.exports = AttachedPopover = (function(_super) {
    __extends(AttachedPopover, _super);


    /*
        NOTE: The reason we do not use Atom's native tooltip is because it is attached to an element, which caused
        strange problems such as tickets #107 and #72. This implementation uses the same CSS classes and transitions but
        handles the displaying manually as we don't want to attach/detach, we only want to temporarily display a popover
        on mouseover.
     */

    AttachedPopover.prototype.timeoutId = null;

    AttachedPopover.prototype.elementToAttachTo = null;


    /**
     * Constructor.
     *
     * @param {HTMLElement} elementToAttachTo The element to show the popover over.
     * @param {int}         delay             How long the mouse has to hover over the elment before the popover shows
     *                                        up (in miliiseconds).
     */

    function AttachedPopover(elementToAttachTo, delay) {
      this.elementToAttachTo = elementToAttachTo;
      if (delay == null) {
        delay = 500;
      }
      AttachedPopover.__super__.constructor.call(this);
    }


    /**
     * Destructor.
     *
     */

    AttachedPopover.prototype.destructor = function() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      return AttachedPopover.__super__.destructor.call(this);
    };


    /**
     * Shows the popover with the specified text.
     *
     * @param {int} fadeInTime The amount of time to take to fade in the tooltip.
     */

    AttachedPopover.prototype.show = function(fadeInTime) {
      var centerOffset, coordinates, x, y;
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      coordinates = this.elementToAttachTo.getBoundingClientRect();
      centerOffset = (coordinates.right - coordinates.left) / 2;
      x = coordinates.left - (this.$(this.getElement()).width() / 2) + centerOffset;
      y = coordinates.bottom;
      return AttachedPopover.__super__.show.call(this, x, y, fadeInTime);
    };


    /**
     * Shows the popover with the specified text after the specified delay (in miliiseconds). Calling this method
     * multiple times will cancel previous show requests and restart.
     *
     * @param {int}    delay      The delay before the tooltip shows up (in milliseconds).
     * @param {int}    fadeInTime The amount of time to take to fade in the tooltip.
     */

    AttachedPopover.prototype.showAfter = function(delay, fadeInTime) {
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      return this.timeoutId = setTimeout((function(_this) {
        return function() {
          return _this.show(fadeInTime);
        };
      })(this), delay);
    };

    return AttachedPopover;

  })(Popover);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL2F0dGFjaGVkLXBvcG92ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FBVixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNGLHNDQUFBLENBQUE7O0FBQUE7QUFBQTs7Ozs7T0FBQTs7QUFBQSw4QkFNQSxTQUFBLEdBQVcsSUFOWCxDQUFBOztBQUFBLDhCQU9BLGlCQUFBLEdBQW1CLElBUG5CLENBQUE7O0FBU0E7QUFBQTs7Ozs7O09BVEE7O0FBZ0JhLElBQUEseUJBQUUsaUJBQUYsRUFBcUIsS0FBckIsR0FBQTtBQUNULE1BRFUsSUFBQyxDQUFBLG9CQUFBLGlCQUNYLENBQUE7O1FBRDhCLFFBQVE7T0FDdEM7QUFBQSxNQUFBLCtDQUFBLENBQUEsQ0FEUztJQUFBLENBaEJiOztBQW1CQTtBQUFBOzs7T0FuQkE7O0FBQUEsOEJBdUJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUo7QUFDSSxRQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsU0FBZCxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQURKO09BQUE7YUFJQSw4Q0FBQSxFQUxRO0lBQUEsQ0F2QlosQ0FBQTs7QUE4QkE7QUFBQTs7OztPQTlCQTs7QUFBQSw4QkFtQ0EsSUFBQSxHQUFNLFNBQUMsVUFBRCxHQUFBO0FBQ0YsVUFBQSwrQkFBQTs7UUFERyxhQUFhO09BQ2hCO0FBQUEsTUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLGlCQUFpQixDQUFDLHFCQUFuQixDQUFBLENBQWQsQ0FBQTtBQUFBLE1BRUEsWUFBQSxHQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFaLEdBQW9CLFdBQVcsQ0FBQyxJQUFqQyxDQUFBLEdBQXlDLENBRnpELENBQUE7QUFBQSxNQUlBLENBQUEsR0FBSSxXQUFXLENBQUMsSUFBWixHQUFtQixDQUFDLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFILENBQWlCLENBQUMsS0FBbEIsQ0FBQSxDQUFBLEdBQTRCLENBQTdCLENBQW5CLEdBQXFELFlBSnpELENBQUE7QUFBQSxNQUtBLENBQUEsR0FBSSxXQUFXLENBQUMsTUFMaEIsQ0FBQTthQU9BLDBDQUFNLENBQU4sRUFBUyxDQUFULEVBQVksVUFBWixFQVJFO0lBQUEsQ0FuQ04sQ0FBQTs7QUE2Q0E7QUFBQTs7Ozs7O09BN0NBOztBQUFBLDhCQW9EQSxTQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsVUFBUixHQUFBOztRQUFRLGFBQWE7T0FDNUI7YUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwQixLQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sRUFEb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRVgsS0FGVyxFQUROO0lBQUEsQ0FwRFgsQ0FBQTs7MkJBQUE7O0tBRDBCLFFBSjlCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/attached-popover.coffee
