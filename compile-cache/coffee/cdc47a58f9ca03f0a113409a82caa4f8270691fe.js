(function() {
  var Disposable, Popover,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Disposable = require('atom').Disposable;

  module.exports = Popover = (function(_super) {
    __extends(Popover, _super);

    Popover.prototype.element = null;


    /**
     * Constructor.
     */

    function Popover() {
      this.$ = require('jquery');
      this.element = document.createElement('div');
      this.element.className = 'tooltip bottom fade php-atom-autocomplete-popover';
      this.element.innerHTML = "<div class='tooltip-arrow'></div><div class='tooltip-inner'></div>";
      document.body.appendChild(this.element);
      Popover.__super__.constructor.call(this, this.destructor);
    }


    /**
     * Destructor.
     */

    Popover.prototype.destructor = function() {
      this.hide();
      return document.body.removeChild(this.element);
    };


    /**
     * Retrieves the HTML element containing the popover.
     *
     * @return {HTMLElement}
     */

    Popover.prototype.getElement = function() {
      return this.element;
    };


    /**
     * sets the text to display.
     *
     * @param {string} text
     */

    Popover.prototype.setText = function(text) {
      return this.$('.tooltip-inner', this.element).html('<div class="php-atom-autocomplete-popover-wrapper">' + text.replace(/\n\n/g, '<br/><br/>') + '</div>');
    };


    /**
     * Shows a popover at the specified location with the specified text and fade in time.
     *
     * @param {int}    x          The X coordinate to show the popover at (left).
     * @param {int}    y          The Y coordinate to show the popover at (top).
     * @param {int}    fadeInTime The amount of time to take to fade in the tooltip.
     */

    Popover.prototype.show = function(x, y, fadeInTime) {
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      this.$(this.element).css('left', x + 'px');
      this.$(this.element).css('top', y + 'px');
      this.$(this.element).addClass('in');
      this.$(this.element).css('opacity', 100);
      return this.$(this.element).css('display', 'block');
    };


    /**
     * Hides the tooltip, if it is displayed.
     */

    Popover.prototype.hide = function() {
      this.$(this.element).removeClass('in');
      this.$(this.element).css('opacity', 0);
      return this.$(this.element).css('display', 'none');
    };

    return Popover;

  })(Disposable);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BvcG92ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNGLDhCQUFBLENBQUE7O0FBQUEsc0JBQUEsT0FBQSxHQUFTLElBQVQsQ0FBQTs7QUFFQTtBQUFBOztPQUZBOztBQUthLElBQUEsaUJBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUixDQUFMLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FGWCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsbURBSHJCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixvRUFKckIsQ0FBQTtBQUFBLE1BTUEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFkLENBQTBCLElBQUMsQ0FBQSxPQUEzQixDQU5BLENBQUE7QUFBQSxNQVFBLHlDQUFNLElBQUMsQ0FBQSxVQUFQLENBUkEsQ0FEUztJQUFBLENBTGI7O0FBZ0JBO0FBQUE7O09BaEJBOztBQUFBLHNCQW1CQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBZCxDQUEwQixJQUFDLENBQUEsT0FBM0IsRUFGUTtJQUFBLENBbkJaLENBQUE7O0FBdUJBO0FBQUE7Ozs7T0F2QkE7O0FBQUEsc0JBNEJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixhQUFPLElBQUMsQ0FBQSxPQUFSLENBRFE7SUFBQSxDQTVCWixDQUFBOztBQStCQTtBQUFBOzs7O09BL0JBOztBQUFBLHNCQW9DQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7YUFDTCxJQUFDLENBQUEsQ0FBRCxDQUFHLGdCQUFILEVBQXFCLElBQUMsQ0FBQSxPQUF0QixDQUE4QixDQUFDLElBQS9CLENBQ0kscURBQUEsR0FBd0QsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFiLEVBQXNCLFlBQXRCLENBQXhELEdBQThGLFFBRGxHLEVBREs7SUFBQSxDQXBDVCxDQUFBOztBQXlDQTtBQUFBOzs7Ozs7T0F6Q0E7O0FBQUEsc0JBZ0RBLElBQUEsR0FBTSxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sVUFBUCxHQUFBOztRQUFPLGFBQWE7T0FDdEI7QUFBQSxNQUFBLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLE9BQUosQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBQSxHQUFJLElBQTdCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixLQUFqQixFQUF3QixDQUFBLEdBQUksSUFBNUIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsQ0FBRCxDQUFHLElBQUMsQ0FBQSxPQUFKLENBQVksQ0FBQyxRQUFiLENBQXNCLElBQXRCLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixTQUFqQixFQUE0QixHQUE1QixDQUpBLENBQUE7YUFLQSxJQUFDLENBQUEsQ0FBRCxDQUFHLElBQUMsQ0FBQSxPQUFKLENBQVksQ0FBQyxHQUFiLENBQWlCLFNBQWpCLEVBQTRCLE9BQTVCLEVBTkU7SUFBQSxDQWhETixDQUFBOztBQXdEQTtBQUFBOztPQXhEQTs7QUFBQSxzQkEyREEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNGLE1BQUEsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsV0FBYixDQUF5QixJQUF6QixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLE9BQUosQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBakIsRUFBNEIsQ0FBNUIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixTQUFqQixFQUE0QixNQUE1QixFQUhFO0lBQUEsQ0EzRE4sQ0FBQTs7bUJBQUE7O0tBRGtCLFdBSnRCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/popover.coffee
