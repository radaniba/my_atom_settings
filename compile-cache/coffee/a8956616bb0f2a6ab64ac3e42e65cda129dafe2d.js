(function() {
  var BatteryStatusView, batteryStatus,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  batteryStatus = require('node-power-info');

  BatteryStatusView = (function(_super) {
    __extends(BatteryStatusView, _super);

    function BatteryStatusView() {
      return BatteryStatusView.__super__.constructor.apply(this, arguments);
    }

    BatteryStatusView.prototype.tile = null;

    BatteryStatusView.prototype.backIcon = null;

    BatteryStatusView.prototype.frontIcon = null;

    BatteryStatusView.prototype.statusIconContainer = null;

    BatteryStatusView.prototype.statusText = null;

    BatteryStatusView.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
      this.classList.add('battery-status', 'inline-block');
      this.statusIconContainer = document.createElement('div');
      this.appendChild(this.statusIconContainer);
      this.backIcon = document.createElement('span');
      this.statusIconContainer.appendChild(this.backIcon);
      this.frontIcon = document.createElement('span');
      this.statusIconContainer.appendChild(this.frontIcon);
      this.statusText = document.createElement('span');
      this.appendChild(this.statusText);
      this.updateStatus();
      return this.update();
    };

    BatteryStatusView.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        priority: 0,
        item: this
      });
    };

    BatteryStatusView.prototype.destroy = function() {
      var _ref;
      return (_ref = this.tile) != null ? _ref.destroy() : void 0;
    };

    BatteryStatusView.prototype.update = function() {
      return setInterval((function(_this) {
        return function() {
          return _this.updateStatus();
        };
      })(this), 60000);
    };

    BatteryStatusView.prototype.updateStatus = function() {
      return batteryStatus.getChargeStatus((function(_this) {
        return function(batteryStats) {
          var batStats;
          if (batteryStats.length >= 1) {
            batStats = batteryStats[0];
            _this.updateStatusText(batStats.powerLevel);
            return _this.updateStatusIcon(batStats.powerLevel, batStats.chargeStatus);
          }
        };
      })(this));
    };

    BatteryStatusView.prototype.updateStatusText = function(percentage) {
      if (percentage != null) {
        return this.statusText.textContent = "" + percentage + "%";
      } else {
        this.statusText.textContent = 'error';
        return console.warn("Battery Status: invalid charge value: " + percentage);
      }
    };

    BatteryStatusView.prototype.updateStatusIcon = function(percentage, chargeStatus) {
      var clip, clipEmpty, clipFull, clipTop, iconClass, statusClass;
      if (!(chargeStatus != null)) {
        chargeStatus = 'unknown';
      }
      this.backIcon.className = '';
      this.backIcon.classList.add('back-icon', 'battery-icon');
      this.frontIcon.classname = '';
      this.frontIcon.classList.add('front-icon', 'battery-icon');
      this.statusIconContainer.className = 'status';
      iconClass = 'icon-battery-unknown';
      if (chargeStatus === 'charging' || chargeStatus === 'full') {
        iconClass = 'icon-battery-charging';
      } else if (chargeStatus === 'discharging') {
        iconClass = 'icon-battery';
      }
      clip = 'none';
      statusClass = 'unknown';
      if (chargeStatus !== 'unknown') {
        if (percentage <= 5 && chargeStatus !== 'charging') {
          iconClass = 'icon-battery-alert';
          statusClass = 'critical';
        } else {
          if (percentage <= 10) {
            statusClass = 'warning';
          } else {
            statusClass = 'normal';
          }
          clipFull = 23;
          clipEmpty = 86;
          clipTop = clipFull + ((100 - percentage) / 100 * (clipEmpty - clipFull));
          clip = "inset(" + clipTop + "% 0 0 0)";
        }
      }
      this.statusIconContainer.classList.add(statusClass);
      this.backIcon.classList.add(iconClass);
      this.frontIcon.classList.add(iconClass);
      return this.frontIcon.setAttribute('style', "clip-path: " + clip + "; -webkit-clip-path: " + clip + ";");
    };

    BatteryStatusView.prototype.setShowPercentage = function(showPercentage) {
      if (showPercentage) {
        return this.statusText.removeAttribute('style');
      } else {
        return this.statusText.setAttribute('style', 'display: none;');
      }
    };

    BatteryStatusView.prototype.setOnlyShowInFullscreen = function(onlyShowInFullscreen) {
      if (onlyShowInFullscreen) {
        return this.classList.add('hide-outside-fullscreen');
      } else {
        return this.classList.remove('hide-outside-fullscreen');
      }
    };

    return BatteryStatusView;

  })(HTMLDivElement);

  module.exports = document.registerElement('battery-status', {
    prototype: BatteryStatusView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvYmF0dGVyeS1zdGF0dXMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSLENBQWhCLENBQUE7O0FBQUEsRUFHTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxJQUFBLEdBQU0sSUFBTixDQUFBOztBQUFBLGdDQUNBLFFBQUEsR0FBVSxJQURWLENBQUE7O0FBQUEsZ0NBRUEsU0FBQSxHQUFXLElBRlgsQ0FBQTs7QUFBQSxnQ0FHQSxtQkFBQSxHQUFxQixJQUhyQixDQUFBOztBQUFBLGdDQUlBLFVBQUEsR0FBWSxJQUpaLENBQUE7O0FBQUEsZ0NBTUEsVUFBQSxHQUFZLFNBQUUsU0FBRixHQUFBO0FBRVYsTUFGVyxJQUFDLENBQUEsWUFBQSxTQUVaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLGdCQUFmLEVBQWlDLGNBQWpDLENBQUEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLG1CQUFELEdBQXVCLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSHZCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLG1CQUFkLENBTEEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QixDQVJaLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxXQUFyQixDQUFpQyxJQUFDLENBQUEsUUFBbEMsQ0FWQSxDQUFBO0FBQUEsTUFZQSxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBWmIsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLG1CQUFtQixDQUFDLFdBQXJCLENBQWlDLElBQUMsQ0FBQSxTQUFsQyxDQWRBLENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBakJkLENBQUE7QUFBQSxNQW1CQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxVQUFkLENBbkJBLENBQUE7QUFBQSxNQXNCQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBdEJBLENBQUE7YUF1QkEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQXpCVTtJQUFBLENBTlosQ0FBQTs7QUFBQSxnQ0FpQ0EsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO0FBQUEsUUFBQSxRQUFBLEVBQVUsQ0FBVjtBQUFBLFFBQWEsSUFBQSxFQUFNLElBQW5CO09BQXhCLEVBREY7SUFBQSxDQWpDUixDQUFBOztBQUFBLGdDQW9DQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxJQUFBOzhDQUFLLENBQUUsT0FBUCxDQUFBLFdBRE87SUFBQSxDQXBDVCxDQUFBOztBQUFBLGdDQXVDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sV0FBQSxDQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ1IsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQURRO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWixFQUVJLEtBRkosRUFETTtJQUFBLENBdkNSLENBQUE7O0FBQUEsZ0NBNENBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFFWixhQUFhLENBQUMsZUFBZCxDQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxZQUFELEdBQUE7QUFDNUIsY0FBQSxRQUFBO0FBQUEsVUFBQSxJQUFHLFlBQVksQ0FBQyxNQUFiLElBQXVCLENBQTFCO0FBQ0UsWUFBQSxRQUFBLEdBQVcsWUFBYSxDQUFBLENBQUEsQ0FBeEIsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLGdCQUFELENBQWtCLFFBQVEsQ0FBQyxVQUEzQixDQURBLENBQUE7bUJBRUEsS0FBQyxDQUFBLGdCQUFELENBQWtCLFFBQVEsQ0FBQyxVQUEzQixFQUF1QyxRQUFRLENBQUMsWUFBaEQsRUFIRjtXQUQ0QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLEVBRlk7SUFBQSxDQTVDZCxDQUFBOztBQUFBLGdDQW9EQSxnQkFBQSxHQUFrQixTQUFDLFVBQUQsR0FBQTtBQUNoQixNQUFBLElBQUcsa0JBQUg7ZUFHRSxJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosR0FBMEIsRUFBQSxHQUFHLFVBQUgsR0FBYyxJQUgxQztPQUFBLE1BQUE7QUFLRSxRQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixHQUEwQixPQUExQixDQUFBO2VBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYyx3Q0FBQSxHQUF3QyxVQUF0RCxFQU5GO09BRGdCO0lBQUEsQ0FwRGxCLENBQUE7O0FBQUEsZ0NBNkRBLGdCQUFBLEdBQWtCLFNBQUMsVUFBRCxFQUFhLFlBQWIsR0FBQTtBQUNoQixVQUFBLDBEQUFBO0FBQUEsTUFBQSxJQUFHLENBQUEsQ0FBRSxvQkFBRCxDQUFKO0FBQ0UsUUFBQSxZQUFBLEdBQWUsU0FBZixDQURGO09BQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixHQUFzQixFQUx0QixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFwQixDQUF3QixXQUF4QixFQUFxQyxjQUFyQyxDQU5BLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QixFQVB2QixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFyQixDQUF5QixZQUF6QixFQUF1QyxjQUF2QyxDQVJBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxTQUFyQixHQUFpQyxRQVRqQyxDQUFBO0FBQUEsTUFZQSxTQUFBLEdBQVksc0JBWlosQ0FBQTtBQWNBLE1BQUEsSUFBRyxZQUFBLEtBQWdCLFVBQWhCLElBQThCLFlBQUEsS0FBZ0IsTUFBakQ7QUFDRSxRQUFBLFNBQUEsR0FBWSx1QkFBWixDQURGO09BQUEsTUFFSyxJQUFHLFlBQUEsS0FBZ0IsYUFBbkI7QUFDSCxRQUFBLFNBQUEsR0FBWSxjQUFaLENBREc7T0FoQkw7QUFBQSxNQW1CQSxJQUFBLEdBQU8sTUFuQlAsQ0FBQTtBQUFBLE1Bb0JBLFdBQUEsR0FBYyxTQXBCZCxDQUFBO0FBc0JBLE1BQUEsSUFBRyxZQUFBLEtBQWdCLFNBQW5CO0FBQ0UsUUFBQSxJQUFHLFVBQUEsSUFBYyxDQUFkLElBQW1CLFlBQUEsS0FBZ0IsVUFBdEM7QUFDRSxVQUFBLFNBQUEsR0FBWSxvQkFBWixDQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWMsVUFEZCxDQURGO1NBQUEsTUFBQTtBQUlFLFVBQUEsSUFBRyxVQUFBLElBQWMsRUFBakI7QUFDRSxZQUFBLFdBQUEsR0FBYyxTQUFkLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxXQUFBLEdBQWMsUUFBZCxDQUhGO1dBQUE7QUFBQSxVQUtBLFFBQUEsR0FBVyxFQUxYLENBQUE7QUFBQSxVQU1BLFNBQUEsR0FBWSxFQU5aLENBQUE7QUFBQSxVQU9BLE9BQUEsR0FBVSxRQUFBLEdBQVcsQ0FBQyxDQUFDLEdBQUEsR0FBTSxVQUFQLENBQUEsR0FBcUIsR0FBckIsR0FBMkIsQ0FBQyxTQUFBLEdBQVksUUFBYixDQUE1QixDQVByQixDQUFBO0FBQUEsVUFRQSxJQUFBLEdBQVEsUUFBQSxHQUFRLE9BQVIsR0FBZ0IsVUFSeEIsQ0FKRjtTQURGO09BdEJBO0FBQUEsTUFxQ0EsSUFBQyxDQUFBLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxHQUEvQixDQUFtQyxXQUFuQyxDQXJDQSxDQUFBO0FBQUEsTUFzQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBcEIsQ0FBd0IsU0FBeEIsQ0F0Q0EsQ0FBQTtBQUFBLE1BdUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXJCLENBQXlCLFNBQXpCLENBdkNBLENBQUE7YUEwQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCLE9BQXhCLEVBQWtDLGFBQUEsR0FBYSxJQUFiLEdBQWtCLHVCQUFsQixHQUF5QyxJQUF6QyxHQUE4QyxHQUFoRixFQTNDZ0I7SUFBQSxDQTdEbEIsQ0FBQTs7QUFBQSxnQ0EwR0EsaUJBQUEsR0FBbUIsU0FBQyxjQUFELEdBQUE7QUFDakIsTUFBQSxJQUFHLGNBQUg7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLGVBQVosQ0FBNEIsT0FBNUIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsVUFBVSxDQUFDLFlBQVosQ0FBeUIsT0FBekIsRUFBa0MsZ0JBQWxDLEVBSEY7T0FEaUI7SUFBQSxDQTFHbkIsQ0FBQTs7QUFBQSxnQ0FnSEEsdUJBQUEsR0FBeUIsU0FBQyxvQkFBRCxHQUFBO0FBQ3ZCLE1BQUEsSUFBRyxvQkFBSDtlQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLHlCQUFmLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLHlCQUFsQixFQUhGO09BRHVCO0lBQUEsQ0FoSHpCLENBQUE7OzZCQUFBOztLQUQ4QixlQUhoQyxDQUFBOztBQUFBLEVBMEhBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQVEsQ0FBQyxlQUFULENBQXlCLGdCQUF6QixFQUEyQztBQUFBLElBQUEsU0FBQSxFQUFXLGlCQUFpQixDQUFDLFNBQTdCO0dBQTNDLENBMUhqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/battery-status/lib/battery-status-view.coffee
