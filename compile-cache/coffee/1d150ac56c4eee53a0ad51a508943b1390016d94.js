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
      var ref;
      return (ref = this.tile) != null ? ref.destroy() : void 0;
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
        return this.statusText.textContent = percentage + "%";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvYmF0dGVyeS1zdGF0dXMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7OztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSOztFQUdWOzs7Ozs7O2dDQUNKLElBQUEsR0FBTTs7Z0NBQ04sUUFBQSxHQUFVOztnQ0FDVixTQUFBLEdBQVc7O2dDQUNYLG1CQUFBLEdBQXFCOztnQ0FDckIsVUFBQSxHQUFZOztnQ0FFWixVQUFBLEdBQVksU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7TUFFWCxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxnQkFBZixFQUFpQyxjQUFqQztNQUdBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUV2QixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxtQkFBZDtNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFFWixJQUFDLENBQUEsbUJBQW1CLENBQUMsV0FBckIsQ0FBaUMsSUFBQyxDQUFBLFFBQWxDO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUViLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxXQUFyQixDQUFpQyxJQUFDLENBQUEsU0FBbEM7TUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BRWQsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsVUFBZDtNQUdBLElBQUMsQ0FBQSxZQUFELENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBekJVOztnQ0EyQlosTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENB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d0IsU0FBeEI7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFyQixDQUF5QixTQUF6QjthQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixPQUF4QixFQUFpQyxhQUFBLEdBQWMsSUFBZCxHQUFtQix1QkFBbkIsR0FBMEMsSUFBMUMsR0FBK0MsR0FBaEY7SUEzQ2dCOztnQ0E2Q2xCLGlCQUFBLEdBQW1CLFNBQUMsY0FBRDtNQUNqQixJQUFHLGNBQUg7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLGVBQVosQ0FBNEIsT0FBNUIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsVUFBVSxDQUFDLFlBQVosQ0FBeUIsT0FBekIsRUFBa0MsZ0JBQWxDLEVBSEY7O0lBRGlCOztnQ0FNbkIsdUJBQUEsR0FBeUIsU0FBQyxvQkFBRDtNQUN2QixJQUFHLG9CQUFIO2VBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUseUJBQWYsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IseUJBQWxCLEVBSEY7O0lBRHVCOzs7O0tBakhLOztFQXVIaEMsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsZ0JBQXpCLEVBQTJDO0lBQUEsU0FBQSxFQUFXLGlCQUFpQixDQUFDLFNBQTdCO0dBQTNDO0FBMUhqQiIsInNvdXJjZXNDb250ZW50IjpbImJhdHRlcnlTdGF0dXMgPSByZXF1aXJlICdub2RlLXBvd2VyLWluZm8nXG5cbiMgVmlldyB0byBzaG93IHRoZSBiYXR0ZXJ5IHN0YXR1cyBpbiB0aGUgc3RhdHVzIGJhclxuY2xhc3MgQmF0dGVyeVN0YXR1c1ZpZXcgZXh0ZW5kcyBIVE1MRGl2RWxlbWVudFxuICB0aWxlOiBudWxsXG4gIGJhY2tJY29uOiBudWxsXG4gIGZyb250SWNvbjogbnVsbFxuICBzdGF0dXNJY29uQ29udGFpbmVyOiBudWxsXG4gIHN0YXR1c1RleHQ6IG51bGxcblxuICBpbml0aWFsaXplOiAoQHN0YXR1c0JhcikgLT5cbiAgICAjIHNldCBjc3MgY2xhc3NlcyBmb3IgdGhlIHJvb3QgZWxlbWVudFxuICAgIEBjbGFzc0xpc3QuYWRkKCdiYXR0ZXJ5LXN0YXR1cycsICdpbmxpbmUtYmxvY2snKVxuXG4gICAgIyBjcmVhdGUgdGhlIHN0YXR1cy1pY29uIGRpdlxuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgICMgQHN0YXR1c0ljb25Db250YWluZXIuY2xhc3NMaXN0LmFkZCAnaW5saW5lLWJsb2NrJywgJ3N0YXR1cycsICd1bmtub3duJ1xuICAgIEBhcHBlbmRDaGlsZCBAc3RhdHVzSWNvbkNvbnRhaW5lclxuXG4gICAgIyBjcmVhdGUgc3RhdHVzLWljb24gc3BhbnMgYW5kIHB1dCB0aGVuIGluIHRoZSBpY29uIGNvbnRhaW5lclxuICAgIEBiYWNrSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAYmFja0ljb24uY2xhc3NMaXN0LmFkZCAnYmFjay1pY29uJywgJ2ljb24tYmF0dGVyeS11bmtub3duJ1xuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyLmFwcGVuZENoaWxkIEBiYWNrSWNvblxuXG4gICAgQGZyb250SWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAZnJvbnRJY29uLmNsYXNzTGlzdC5hZGQgJ2Zyb250LWljb24nLCAnaWNvbi1iYXR0ZXJ5LXVua25vd24nXG4gICAgQHN0YXR1c0ljb25Db250YWluZXIuYXBwZW5kQ2hpbGQgQGZyb250SWNvblxuXG4gICAgIyBjcmVhdGUgdGhlIHN0YXR1cy10ZXh0IHNwYW5cbiAgICBAc3RhdHVzVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgIyBAc3RhdHVzVGV4dC5jbGFzc0xpc3QuYWRkICdpbmxpbmUtYmxvY2snXG4gICAgQGFwcGVuZENoaWxkIEBzdGF0dXNUZXh0XG5cbiAgICAjIHVwZGF0ZSB0aGUgdmlldyBhbmQgc3RhcnQgdGhlIHVwZGF0ZSBjeWNsZVxuICAgIEB1cGRhdGVTdGF0dXMoKVxuICAgIEB1cGRhdGUoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHByaW9yaXR5OiAwLCBpdGVtOiB0aGlzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuXG4gIHVwZGF0ZTogLT5cbiAgICBzZXRJbnRlcnZhbCA9PlxuICAgICAgICBAdXBkYXRlU3RhdHVzKClcbiAgICAgICwgNjAwMDBcblxuICB1cGRhdGVTdGF0dXM6IC0+XG4gICAgIyBmZXRjaCBiYXR0ZXJ5IHBlcmNlbnRhZ2UgYW5kIGNoYXJnZSBzdGF0dXMgYW5kIHVwZGF0ZSB0aGUgdmlld1xuICAgIGJhdHRlcnlTdGF0dXMuZ2V0Q2hhcmdlU3RhdHVzIChiYXR0ZXJ5U3RhdHMpID0+XG4gICAgICBpZiBiYXR0ZXJ5U3RhdHMubGVuZ3RoID49IDFcbiAgICAgICAgYmF0U3RhdHMgPSBiYXR0ZXJ5U3RhdHNbMF1cbiAgICAgICAgQHVwZGF0ZVN0YXR1c1RleHQgYmF0U3RhdHMucG93ZXJMZXZlbFxuICAgICAgICBAdXBkYXRlU3RhdHVzSWNvbiBiYXRTdGF0cy5wb3dlckxldmVsLCBiYXRTdGF0cy5jaGFyZ2VTdGF0dXNcblxuICB1cGRhdGVTdGF0dXNUZXh0OiAocGVyY2VudGFnZSkgLT5cbiAgICBpZiBwZXJjZW50YWdlP1xuICAgICAgIyBkaXNwbGF5IGNoYXJnZSBvZiB0aGUgZmlyc3QgYmF0dGVyeSBpbiBwZXJjZW50IChubyBtdWx0aSBiYXR0ZXJ5IHN1cHBvcnRcbiAgICAgICMgYXMgb2Ygbm93KVxuICAgICAgQHN0YXR1c1RleHQudGV4dENvbnRlbnQgPSBcIiN7cGVyY2VudGFnZX0lXCJcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzVGV4dC50ZXh0Q29udGVudCA9ICdlcnJvcidcbiAgICAgIGNvbnNvbGUud2FybiBcIkJhdHRlcnkgU3RhdHVzOiBpbnZhbGlkIGNoYXJnZSB2YWx1ZTogI3twZXJjZW50YWdlfVwiXG5cbiAgdXBkYXRlU3RhdHVzSWNvbjogKHBlcmNlbnRhZ2UsIGNoYXJnZVN0YXR1cykgLT5cbiAgICBpZiAhKGNoYXJnZVN0YXR1cz8pXG4gICAgICBjaGFyZ2VTdGF0dXMgPSAndW5rbm93bidcblxuICAgICMgY2xlYXIgdGhlIGNsYXNzIGxpc3Qgb2YgdGhlIHN0YXR1cyBpY29uIGVsZW1lbnQgYW5kIHJlLWFkZCBiYXNpYyBzdHlsZVxuICAgICMgY2xhc3Nlc1xuICAgIEBiYWNrSWNvbi5jbGFzc05hbWUgPSAnJ1xuICAgIEBiYWNrSWNvbi5jbGFzc0xpc3QuYWRkICdiYWNrLWljb24nLCAnYmF0dGVyeS1pY29uJ1xuICAgIEBmcm9udEljb24uY2xhc3NOYW1lID0gJydcbiAgICBAZnJvbnRJY29uLmNsYXNzTGlzdC5hZGQgJ2Zyb250LWljb24nLCAnYmF0dGVyeS1pY29uJ1xuICAgIEBzdGF0dXNJY29uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdzdGF0dXMnXG5cbiAgICAjIGFkZCBzdHlsZSBjbGFzc2VzIGFjY29yZGluZyB0byBjaGFyZ2Ugc3RhdHVzXG4gICAgaWNvbkNsYXNzID0gJ2ljb24tYmF0dGVyeS11bmtub3duJztcblxuICAgIGlmIGNoYXJnZVN0YXR1cyA9PSAnY2hhcmdpbmcnIHx8IGNoYXJnZVN0YXR1cyA9PSAnZnVsbCdcbiAgICAgIGljb25DbGFzcyA9ICdpY29uLWJhdHRlcnktY2hhcmdpbmcnXG4gICAgZWxzZSBpZiBjaGFyZ2VTdGF0dXMgPT0gJ2Rpc2NoYXJnaW5nJ1xuICAgICAgaWNvbkNsYXNzID0gJ2ljb24tYmF0dGVyeSdcblxuICAgIGNsaXAgPSAnbm9uZSdcbiAgICBzdGF0dXNDbGFzcyA9ICd1bmtub3duJ1xuXG4gICAgaWYgY2hhcmdlU3RhdHVzICE9ICd1bmtub3duJ1xuICAgICAgaWYgcGVyY2VudGFnZSA8PSA1ICYmIGNoYXJnZVN0YXR1cyAhPSAnY2hhcmdpbmcnXG4gICAgICAgIGljb25DbGFzcyA9ICdpY29uLWJhdHRlcnktYWxlcnQnXG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ2NyaXRpY2FsJ1xuICAgICAgZWxzZVxuICAgICAgICBpZiBwZXJjZW50YWdlIDw9IDEwXG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnd2FybmluZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ25vcm1hbCdcblxuICAgICAgICBjbGlwRnVsbCA9IDIzXG4gICAgICAgIGNsaXBFbXB0eSA9IDg2XG4gICAgICAgIGNsaXBUb3AgPSBjbGlwRnVsbCArICgoMTAwIC0gcGVyY2VudGFnZSkgLyAxMDAgKiAoY2xpcEVtcHR5IC0gY2xpcEZ1bGwpKVxuICAgICAgICBjbGlwID0gXCJpbnNldCgje2NsaXBUb3B9JSAwIDAgMClcIlxuXG4gICAgQHN0YXR1c0ljb25Db250YWluZXIuY2xhc3NMaXN0LmFkZCBzdGF0dXNDbGFzc1xuICAgIEBiYWNrSWNvbi5jbGFzc0xpc3QuYWRkIGljb25DbGFzc1xuICAgIEBmcm9udEljb24uY2xhc3NMaXN0LmFkZCBpY29uQ2xhc3NcblxuICAgICMgY3V0IHRoZSBmcm9udCBpY29uIGZyb20gdGhlIHRvcCB1c2luZyBjbGlwLXBhdGhcbiAgICBAZnJvbnRJY29uLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBcImNsaXAtcGF0aDogI3tjbGlwfTsgLXdlYmtpdC1jbGlwLXBhdGg6ICN7Y2xpcH07XCIpXG5cbiAgc2V0U2hvd1BlcmNlbnRhZ2U6IChzaG93UGVyY2VudGFnZSkgLT5cbiAgICBpZiBzaG93UGVyY2VudGFnZVxuICAgICAgQHN0YXR1c1RleHQucmVtb3ZlQXR0cmlidXRlICdzdHlsZSdcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzVGV4dC5zZXRBdHRyaWJ1dGUgJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7J1xuXG4gIHNldE9ubHlTaG93SW5GdWxsc2NyZWVuOiAob25seVNob3dJbkZ1bGxzY3JlZW4pIC0+XG4gICAgaWYgb25seVNob3dJbkZ1bGxzY3JlZW5cbiAgICAgIEBjbGFzc0xpc3QuYWRkICdoaWRlLW91dHNpZGUtZnVsbHNjcmVlbidcbiAgICBlbHNlXG4gICAgICBAY2xhc3NMaXN0LnJlbW92ZSAnaGlkZS1vdXRzaWRlLWZ1bGxzY3JlZW4nXG5cbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdiYXR0ZXJ5LXN0YXR1cycsIHByb3RvdHlwZTogQmF0dGVyeVN0YXR1c1ZpZXcucHJvdG90eXBlKVxuIl19
