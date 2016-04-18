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

    BatteryStatusView.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
      this.classList.add('battery-status', 'inline-block');
      this.statusIcon = document.createElement('div');
      this.statusIcon.classList.add('inline-block', 'battery-icon', 'unknown');
      this.appendChild(this.statusIcon);
      this.statusText = document.createElement('span');
      this.statusText.classList.add('inline-block');
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
        return this.statusText.textContent = percentage + '%';
      }
    };

    BatteryStatusView.prototype.updateStatusIcon = function(percentage, chargeStatus) {
      var step, _i, _results;
      this.statusIcon.className = "";
      this.statusIcon.classList.add('inline-block', 'battery-icon');
      if (chargeStatus != null) {
        if (chargeStatus === 'charging' || chargeStatus === '') {
          this.statusIcon.classList.add('charging');
        } else if (chargeStatus === 'discharging') {
          this.statusIcon.classList.add('discharging');
        } else if (chargeStatus === 'full') {
          this.statusIcon.classList.add('full');
        } else {
          this.statusIcon.classList.add('unknown');
          if (chargeStatus !== 'unknown') {
            console.log('unknown charge status: ' + chargeStatus);
          }
        }
      }
      if (percentage != null) {
        if (percentage <= 5) {
          return this.statusIcon.classList.add('critical');
        } else {
          _results = [];
          for (step = _i = 10; _i <= 100; step = _i += 10) {
            if (percentage <= step) {
              this.statusIcon.classList.add('p' + step);
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    };

    return BatteryStatusView;

  })(HTMLDivElement);

  module.exports = document.registerElement('battery-status', {
    prototype: BatteryStatusView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvYmF0dGVyeS1zdGF0dXMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSLENBQWhCLENBQUE7O0FBQUEsRUFHTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxVQUFBLEdBQVksU0FBRSxTQUFGLEdBQUE7QUFFVixNQUZXLElBQUMsQ0FBQSxZQUFBLFNBRVosQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsZ0JBQWYsRUFBaUMsY0FBakMsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSGQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBdEIsQ0FBMEIsY0FBMUIsRUFBMEMsY0FBMUMsRUFBMEQsU0FBMUQsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxVQUFkLENBTEEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QixDQVJkLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQXRCLENBQTBCLGNBQTFCLENBVEEsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsVUFBZCxDQVZBLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FiQSxDQUFBO2FBY0EsSUFBQyxDQUFBLE1BQUQs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

//# sourceURL=/Users/Rad/.atom/packages/battery-status/lib/battery-status-view.coffee
