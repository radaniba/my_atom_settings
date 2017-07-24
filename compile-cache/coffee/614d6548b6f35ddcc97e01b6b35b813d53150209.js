(function() {
  var BatteryStatusView, batteryStatus,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  batteryStatus = require('node-power-info');

  BatteryStatusView = (function(superClass) {
    extend(BatteryStatusView, superClass);

    function BatteryStatusView() {
      return BatteryStatusView.__super__.constructor.apply(this, arguments);
    }

    BatteryStatusView.prototype.tile = null;

    BatteryStatusView.prototype.backIcon = null;

    BatteryStatusView.prototype.frontIcon = null;

    BatteryStatusView.prototype.statusIconContainer = null;

    BatteryStatusView.prototype.statusText = null;

    BatteryStatusView.prototype.showRemainingTime = true;

    BatteryStatusView.prototype.pollingInterval = 60000;

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
      return this.startPolling();
    };

    BatteryStatusView.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        priority: 0,
        item: this
      });
    };

    BatteryStatusView.prototype.destroy = function() {
      var ref;
      return (ref = this.tile) != null ? ref.destroy() : void 0;
    };

    BatteryStatusView.prototype.startPolling = function() {
      if (this.interval) {
        clearInterval(this.interval);
      }
      return this.interval = setInterval((function(_this) {
        return function() {
          return _this.updateStatus();
        };
      })(this), this.pollingInterval);
    };

    BatteryStatusView.prototype.updateStatus = function() {
      return batteryStatus.getChargeStatus((function(_this) {
        return function(batteryStats) {
          var batStats;
          if (batteryStats.length >= 1) {
            batStats = batteryStats[0];
            _this.updateStatusText(batStats.powerLevel, batStats.remaining);
            return _this.updateStatusIcon(batStats.powerLevel, batStats.chargeStatus);
          }
        };
      })(this));
    };

    BatteryStatusView.prototype.updateStatusText = function(percentage, remaining) {
      var minutes;
      if (percentage != null) {
        this.statusText.textContent = percentage + "%";
        if (this.showRemainingTime && (remaining != null) && (remaining.hours != null) && (remaining.minutes != null)) {
          minutes = ("0" + remaining.minutes).substr(-2);
          return this.statusText.textContent += " (" + remaining.hours + ":" + minutes + ")";
        }
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
      this.frontIcon.className = '';
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

    BatteryStatusView.prototype.setShowRemainingTime = function(showRemainingTime) {
      this.showRemainingTime = showRemainingTime;
      return this.updateStatus();
    };

    BatteryStatusView.prototype.setOnlyShowInFullscreen = function(onlyShowInFullscreen) {
      if (onlyShowInFullscreen) {
        return this.classList.add('hide-outside-fullscreen');
      } else {
        return this.classList.remove('hide-outside-fullscreen');
      }
    };

    BatteryStatusView.prototype.setPollingInterval = function(pollingInterval) {
      if (pollingInterval) {
        pollingInterval = Math.max(pollingInterval, 1);
        this.pollingInterval = 1000 * pollingInterval;
        return this.startPolling();
      }
    };

    return BatteryStatusView;

  })(HTMLDivElement);

  module.exports = document.registerElement('battery-status', {
    prototype: BatteryStatusView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvYmF0dGVyeS1zdGF0dXMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7OztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSOztFQUdWOzs7Ozs7O2dDQUNKLElBQUEsR0FBTTs7Z0NBQ04sUUFBQSxHQUFVOztnQ0FDVixTQUFBLEdBQVc7O2dDQUNYLG1CQUFBLEdBQXFCOztnQ0FDckIsVUFBQSxHQUFZOztnQ0FDWixpQkFBQSxHQUFtQjs7Z0NBQ25CLGVBQUEsR0FBaUI7O2dDQUVqQixVQUFBLEdBQVksU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7TUFFWCxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxnQkFBZixFQUFpQyxjQUFqQztNQUdBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUV2QixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxtQkFBZDtNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFFWixJQUFDLENBQUEsbUJBQW1CLENBQUMsV0FBckIsQ0FBaUMsSUFBQyxDQUFBLFFBQWxDO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUViLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxXQUFyQixDQUFpQyxJQUFDLENBQUEsU0FBbEM7TUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BRWQsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsVUFBZDtNQUdBLElBQUMsQ0FBQSxZQUFELENBQUE7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lB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LElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLHlCQUFmLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLHlCQUFsQixFQUhGOztJQUR1Qjs7Z0NBTXpCLGtCQUFBLEdBQW9CLFNBQUMsZUFBRDtNQUNsQixJQUFHLGVBQUg7UUFDRSxlQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsZUFBVCxFQUEwQixDQUExQjtRQUNsQixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFBLEdBQU87ZUFDMUIsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUhGOztJQURrQjs7OztLQW5JVTs7RUF5SWhDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQVEsQ0FBQyxlQUFULENBQXlCLGdCQUF6QixFQUEyQztJQUFBLFNBQUEsRUFBVyxpQkFBaUIsQ0FBQyxTQUE3QjtHQUEzQztBQTVJakIiLCJzb3VyY2VzQ29udGVudCI6WyJiYXR0ZXJ5U3RhdHVzID0gcmVxdWlyZSAnbm9kZS1wb3dlci1pbmZvJ1xuXG4jIFZpZXcgdG8gc2hvdyB0aGUgYmF0dGVyeSBzdGF0dXMgaW4gdGhlIHN0YXR1cyBiYXJcbmNsYXNzIEJhdHRlcnlTdGF0dXNWaWV3IGV4dGVuZHMgSFRNTERpdkVsZW1lbnRcbiAgdGlsZTogbnVsbFxuICBiYWNrSWNvbjogbnVsbFxuICBmcm9udEljb246IG51bGxcbiAgc3RhdHVzSWNvbkNvbnRhaW5lcjogbnVsbFxuICBzdGF0dXNUZXh0OiBudWxsXG4gIHNob3dSZW1haW5pbmdUaW1lOiB0cnVlXG4gIHBvbGxpbmdJbnRlcnZhbDogNjAwMDBcblxuICBpbml0aWFsaXplOiAoQHN0YXR1c0JhcikgLT5cbiAgICAjIHNldCBjc3MgY2xhc3NlcyBmb3IgdGhlIHJvb3QgZWxlbWVudFxuICAgIEBjbGFzc0xpc3QuYWRkKCdiYXR0ZXJ5LXN0YXR1cycsICdpbmxpbmUtYmxvY2snKVxuXG4gICAgIyBjcmVhdGUgdGhlIHN0YXR1cy1pY29uIGRpdlxuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgICMgQHN0YXR1c0ljb25Db250YWluZXIuY2xhc3NMaXN0LmFkZCAnaW5saW5lLWJsb2NrJywgJ3N0YXR1cycsICd1bmtub3duJ1xuICAgIEBhcHBlbmRDaGlsZCBAc3RhdHVzSWNvbkNvbnRhaW5lclxuXG4gICAgIyBjcmVhdGUgc3RhdHVzLWljb24gc3BhbnMgYW5kIHB1dCB0aGVuIGluIHRoZSBpY29uIGNvbnRhaW5lclxuICAgIEBiYWNrSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAYmFja0ljb24uY2xhc3NMaXN0LmFkZCAnYmFjay1pY29uJywgJ2ljb24tYmF0dGVyeS11bmtub3duJ1xuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyLmFwcGVuZENoaWxkIEBiYWNrSWNvblxuXG4gICAgQGZyb250SWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAZnJvbnRJY29uLmNsYXNzTGlzdC5hZGQgJ2Zyb250LWljb24nLCAnaWNvbi1iYXR0ZXJ5LXVua25vd24nXG4gICAgQHN0YXR1c0ljb25Db250YWluZXIuYXBwZW5kQ2hpbGQgQGZyb250SWNvblxuXG4gICAgIyBjcmVhdGUgdGhlIHN0YXR1cy10ZXh0IHNwYW5cbiAgICBAc3RhdHVzVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAc3RhdHVzVGV4dC5jbGFzc0xpc3QuYWRkICdpbmxpbmUtYmxvY2snXG4gICAgQGFwcGVuZENoaWxkIEBzdGF0dXNUZXh0XG5cbiAgICAjIHVwZGF0ZSB0aGUgdmlldyBhbmQgc3RhcnQgdGhlIHVwZGF0ZSBjeWNsZVxuICAgIEB1cGRhdGVTdGF0dXMoKVxuICAgIEBzdGFydFBvbGxpbmcoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHByaW9yaXR5OiAwLCBpdGVtOiB0aGlzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuXG4gIHN0YXJ0UG9sbGluZzogLT5cbiAgICBpZiBAaW50ZXJ2YWxcbiAgICAgIGNsZWFySW50ZXJ2YWwgQGludGVydmFsXG5cbiAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICBAdXBkYXRlU3RhdHVzKClcbiAgICAgICwgQHBvbGxpbmdJbnRlcnZhbFxuXG4gIHVwZGF0ZVN0YXR1czogLT5cbiAgICAjIGZldGNoIGJhdHRlcnkgcGVyY2VudGFnZSBhbmQgY2hhcmdlIHN0YXR1cyBhbmQgdXBkYXRlIHRoZSB2aWV3XG4gICAgYmF0dGVyeVN0YXR1cy5nZXRDaGFyZ2VTdGF0dXMgKGJhdHRlcnlTdGF0cykgPT5cbiAgICAgIGlmIGJhdHRlcnlTdGF0cy5sZW5ndGggPj0gMVxuICAgICAgICBiYXRTdGF0cyA9IGJhdHRlcnlTdGF0c1swXVxuICAgICAgICBAdXBkYXRlU3RhdHVzVGV4dCBiYXRTdGF0cy5wb3dlckxldmVsLCBiYXRTdGF0cy5yZW1haW5pbmdcbiAgICAgICAgQHVwZGF0ZVN0YXR1c0ljb24gYmF0U3RhdHMucG93ZXJMZXZlbCwgYmF0U3RhdHMuY2hhcmdlU3RhdHVzXG5cbiAgdXBkYXRlU3RhdHVzVGV4dDogKHBlcmNlbnRhZ2UsIHJlbWFpbmluZykgLT5cbiAgICBpZiBwZXJjZW50YWdlP1xuICAgICAgIyBkaXNwbGF5IGNoYXJnZSBvZiB0aGUgZmlyc3QgYmF0dGVyeSBpbiBwZXJjZW50IChubyBtdWx0aSBiYXR0ZXJ5IHN1cHBvcnRcbiAgICAgICMgYXMgb2Ygbm93KVxuICAgICAgQHN0YXR1c1RleHQudGV4dENvbnRlbnQgPSBcIiN7cGVyY2VudGFnZX0lXCJcbiAgICAgIGlmIEBzaG93UmVtYWluaW5nVGltZSAmJiByZW1haW5pbmc/ICYmIHJlbWFpbmluZy5ob3Vycz8gJiYgcmVtYWluaW5nLm1pbnV0ZXM/XG4gICAgICAgIG1pbnV0ZXMgPSAoXCIwXCIgKyByZW1haW5pbmcubWludXRlcykuc3Vic3RyKC0yKVxuICAgICAgICBAc3RhdHVzVGV4dC50ZXh0Q29udGVudCArPSBcIiAoI3tyZW1haW5pbmcuaG91cnN9OiN7bWludXRlc30pXCJcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICdlcnJvcidcbiAgICAgIGNvbnNvbGUud2FybiBcIkJhdHRlcnkgU3RhdHVzOiBpbnZhbGlkIGNoYXJnZSB2YWx1ZTogI3twZXJjZW50YWdlfVwiXG5cbiAgdXBkYXRlU3RhdHVzSWNvbjogKHBlcmNlbnRhZ2UsIGNoYXJnZVN0YXR1cykgLT5cbiAgICBpZiAhKGNoYXJnZVN0YXR1cz8pXG4gICAgICBjaGFyZ2VTdGF0dXMgPSAndW5rbm93bidcblxuICAgICMgY2xlYXIgdGhlIGNsYXNzIGxpc3Qgb2YgdGhlIHN0YXR1cyBpY29uIGVsZW1lbnQgYW5kIHJlLWFkZCBiYXNpYyBzdHlsZVxuICAgICMgY2xhc3Nlc1xuICAgIEBiYWNrSWNvbi5jbGFzc05hbWUgPSAnJ1xuICAgIEBiYWNrSWNvbi5jbGFzc0xpc3QuYWRkICdiYWNrLWljb24nLCAnYmF0dGVyeS1pY29uJ1xuICAgIEBmcm9udEljb24uY2xhc3NOYW1lID0gJydcbiAgICBAZnJvbnRJY29uLmNsYXNzTGlzdC5hZGQgJ2Zyb250LWljb24nLCAnYmF0dGVyeS1pY29uJ1xuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdzdGF0dXMnXG5cbiAgICAjIGFkZCBzdHlsZSBjbGFzc2VzIGFjY29yZGluZyB0byBjaGFyZ2Ugc3RhdHVzXG4gICAgaWNvbkNsYXNzID0gJ2ljb24tYmF0dGVyeS11bmtub3duJztcblxuICAgIGlmIGNoYXJnZVN0YXR1cyA9PSAnY2hhcmdpbmcnIHx8IGNoYXJnZVN0YXR1cyA9PSAnZnVsbCdcbiAgICAgIGljb25DbGFzcyA9ICdpY29uLWJhdHRlcnktY2hhcmdpbmcnXG4gICAgZWxzZSBpZiBjaGFyZ2VTdGF0dXMgPT0gJ2Rpc2NoYXJnaW5nJ1xuICAgICAgaWNvbkNsYXNzID0gJ2ljb24tYmF0dGVyeSdcblxuICAgIGNsaXAgPSAnbm9uZSdcbiAgICBzdGF0dXNDbGFzcyA9ICd1bmtub3duJ1xuXG4gICAgaWYgY2hhcmdlU3RhdHVzICE9ICd1bmtub3duJ1xuICAgICAgaWYgcGVyY2VudGFnZSA8PSA1ICYmIGNoYXJnZVN0YXR1cyAhPSAnY2hhcmdpbmcnXG4gICAgICAgIGljb25DbGFzcyA9ICdpY29uLWJhdHRlcnktYWxlcnQnXG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ2NyaXRpY2FsJ1xuICAgICAgZWxzZVxuICAgICAgICBpZiBwZXJjZW50YWdlIDw9IDEwXG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnd2FybmluZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ25vcm1hbCdcblxuICAgICAgICBjbGlwRnVsbCA9IDIzXG4gICAgICAgIGNsaXBFbXB0eSA9IDg2XG4gICAgICAgIGNsaXBUb3AgPSBjbGlwRnVsbCArICgoMTAwIC0gcGVyY2VudGFnZSkgLyAxMDAgKiAoY2xpcEVtcHR5IC0gY2xpcEZ1bGwpKVxuICAgICAgICBjbGlwID0gXCJpbnNldCgje2NsaXBUb3B9JSAwIDAgMClcIlxuXG4gICAgQHN0YXR1c0ljb25Db250YWluZXIuY2xhc3NMaXN0LmFkZCBzdGF0dXNDbGFzc1xuICAgIEBiYWNrSWNvbi5jbGFzc0xpc3QuYWRkIGljb25DbGFzc1xuICAgIEBmcm9udEljb24uY2xhc3NMaXN0LmFkZCBpY29uQ2xhc3NcblxuICAgICMgY3V0IHRoZSBmcm9udCBpY29uIGZyb20gdGhlIHRvcCB1c2luZyBjbGlwLXBhdGhcbiAgICBAZnJvbnRJY29uLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBcImNsaXAtcGF0aDogI3tjbGlwfTsgLXdlYmtpdC1jbGlwLXBhdGg6ICN7Y2xpcH07XCIpXG5cbiAgc2V0U2hvd1BlcmNlbnRhZ2U6IChzaG93UGVyY2VudGFnZSkgLT5cbiAgICBpZiBzaG93UGVyY2VudGFnZVxuICAgICAgQHN0YXR1c1RleHQucmVtb3ZlQXR0cmlidXRlICdzdHlsZSdcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzVGV4dC5zZXRBdHRyaWJ1dGUgJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7J1xuXG4gIHNldFNob3dSZW1haW5pbmdUaW1lOiAoc2hvd1JlbWFpbmluZ1RpbWUpIC0+XG4gICAgQHNob3dSZW1haW5pbmdUaW1lID0gc2hvd1JlbWFpbmluZ1RpbWVcbiAgICBAdXBkYXRlU3RhdHVzKClcblxuICBzZXRPbmx5U2hvd0luRnVsbHNjcmVlbjogKG9ubHlTaG93SW5GdWxsc2NyZWVuKSAtPlxuICAgIGlmIG9ubHlTaG93SW5GdWxsc2NyZWVuXG4gICAgICBAY2xhc3NMaXN0LmFkZCAnaGlkZS1vdXRzaWRlLWZ1bGxzY3JlZW4nXG4gICAgZWxzZVxuICAgICAgQGNsYXNzTGlzdC5yZW1vdmUgJ2hpZGUtb3V0c2lkZS1mdWxsc2NyZWVuJ1xuXG4gIHNldFBvbGxpbmdJbnRlcnZhbDogKHBvbGxpbmdJbnRlcnZhbCkgLT5cbiAgICBpZiBwb2xsaW5nSW50ZXJ2YWxcbiAgICAgIHBvbGxpbmdJbnRlcnZhbCA9IE1hdGgubWF4KHBvbGxpbmdJbnRlcnZhbCwgMSlcbiAgICAgIEBwb2xsaW5nSW50ZXJ2YWwgPSAxMDAwICogcG9sbGluZ0ludGVydmFsXG4gICAgICBAc3RhcnRQb2xsaW5nKClcblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2JhdHRlcnktc3RhdHVzJywgcHJvdG90eXBlOiBCYXR0ZXJ5U3RhdHVzVmlldy5wcm90b3R5cGUpXG4iXX0=
