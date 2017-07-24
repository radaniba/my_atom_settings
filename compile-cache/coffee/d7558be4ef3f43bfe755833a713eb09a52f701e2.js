(function() {
  var BatteryStatus, BatteryStatusView, CompositeDisposable;

  BatteryStatusView = require('./battery-status-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = BatteryStatus = {
    batteryStatusView: null,
    disposables: null,
    config: {
      showPercentage: {
        order: 1,
        type: 'boolean',
        "default": true,
        description: 'Display the charge percentage next to the charge icon'
      },
      showRemainingTime: {
        order: 2,
        type: 'boolean',
        "default": true,
        description: 'Display the estimated remaining time until the battery is (dis-)charged (currently only available on macOS)'
      },
      onlyShowWhileInFullscreen: {
        order: 3,
        type: 'boolean',
        "default": false,
        description: 'Display the status item only while in full-screen mode'
      },
      pollingInterval: {
        order: 4,
        type: 'integer',
        "default": 60,
        description: 'How many seconds should be waited between updating the battery\'s status'
      }
    },
    activate: function() {},
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.batteryStatusView) != null) {
        ref.destroy();
      }
      this.batteryStatusView = null;
      return (ref1 = this.disposables) != null ? ref1.dispose() : void 0;
    },
    consumeStatusBar: function(statusBar) {
      this.batteryStatusView = new BatteryStatusView();
      this.batteryStatusView.initialize(statusBar);
      this.batteryStatusView.attach();
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('battery-status.showPercentage', (function(_this) {
        return function(showPercentage) {
          var ref;
          return (ref = _this.batteryStatusView) != null ? ref.setShowPercentage(showPercentage) : void 0;
        };
      })(this)));
      this.disposables.add(atom.config.observe('battery-status.showRemainingTime', (function(_this) {
        return function(showRemainingTime) {
          var ref;
          return (ref = _this.batteryStatusView) != null ? ref.setShowRemainingTime(showRemainingTime) : void 0;
        };
      })(this)));
      this.disposables.add(atom.config.observe('battery-status.onlyShowWhileInFullscreen', (function(_this) {
        return function(onlyShowInFullscreen) {
          var ref;
          return (ref = _this.batteryStatusView) != null ? ref.setOnlyShowInFullscreen(onlyShowInFullscreen) : void 0;
        };
      })(this)));
      return this.disposables.add(atom.config.observe('battery-status.pollingInterval', (function(_this) {
        return function(pollingInterval) {
          var ref;
          return (ref = _this.batteryStatusView) != null ? ref.setPollingInterval(pollingInterval) : void 0;
        };
      })(this)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUjs7RUFDbkIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2Y7SUFBQSxpQkFBQSxFQUFtQixJQUFuQjtJQUNBLFdBQUEsRUFBYSxJQURiO0lBR0EsTUFBQSxFQUNFO01BQUEsY0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLENBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLFdBQUEsRUFBYSx1REFIYjtPQURGO01BS0EsaUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7UUFHQSxXQUFBLEVBQWEsNkdBSGI7T0FORjtNQVVBLHlCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO1FBR0EsV0FBQSxFQUFhLHdEQUhiO09BWEY7TUFlQSxlQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLDBFQUhiO09BaEJGO0tBSkY7SUF5QkEsUUFBQSxFQUFVLFNBQUEsR0FBQSxDQXpCVjtJQTJCQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWtCLENBQUUsT0FBcEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7cURBQ1QsQ0FBRSxPQUFkLENBQUE7SUFIVSxDQTNCWjtJQWdDQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7TUFDaEIsSUFBQyxDQUFBLGlCQUFELEdBQXlCLElBQUEsaUJBQUEsQ0FBQTtNQUN6QixJQUFDLENBQUEsaUJBQWlCLENBQUMsVUFBbkIsQ0FBOEIsU0FBOUI7TUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsTUFBbkIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLCtCQUFwQixFQUFxRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsY0FBRDtBQUNwRSxjQUFBOzhEQUFrQixDQUFFLGlCQUFwQixDQUFzQyxjQUF0QztRQURvRTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckQsQ0FBakI7TUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGtDQUFwQixFQUF3RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsaUJBQUQ7QUFDdkUsY0FBQTs4REFBa0IsQ0FBRSxvQkFBcEIsQ0FBeUMsaUJBQXpDO1FBRHVFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQUFqQjtNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsMENBQXBCLEVBQWdFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxvQkFBRDtBQUMvRSxjQUFBOzhEQUFrQixDQUFFLHVCQUFwQixDQUE0QyxvQkFBNUM7UUFEK0U7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhFLENBQWpCO2FBR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixnQ0FBcEIsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGVBQUQ7QUFDckUsY0FBQTs4REFBa0IsQ0FBRSxrQkFBcEIsQ0FBdUMsZUFBdkM7UUFEcUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQWpCO0lBZmdCLENBaENsQjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIkJhdHRlcnlTdGF0dXNWaWV3ID0gcmVxdWlyZSAnLi9iYXR0ZXJ5LXN0YXR1cy12aWV3J1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBCYXR0ZXJ5U3RhdHVzID1cbiAgYmF0dGVyeVN0YXR1c1ZpZXc6IG51bGxcbiAgZGlzcG9zYWJsZXM6IG51bGxcblxuICBjb25maWc6XG4gICAgc2hvd1BlcmNlbnRhZ2U6XG4gICAgICBvcmRlcjogMVxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXkgdGhlIGNoYXJnZSBwZXJjZW50YWdlIG5leHQgdG8gdGhlIGNoYXJnZSBpY29uJ1xuICAgIHNob3dSZW1haW5pbmdUaW1lOlxuICAgICAgb3JkZXI6IDJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5IHRoZSBlc3RpbWF0ZWQgcmVtYWluaW5nIHRpbWUgdW50aWwgdGhlIGJhdHRlcnkgaXMgKGRpcy0pY2hhcmdlZCAoY3VycmVudGx5IG9ubHkgYXZhaWxhYmxlIG9uIG1hY09TKSdcbiAgICBvbmx5U2hvd1doaWxlSW5GdWxsc2NyZWVuOlxuICAgICAgb3JkZXI6IDNcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzcGxheSB0aGUgc3RhdHVzIGl0ZW0gb25seSB3aGlsZSBpbiBmdWxsLXNjcmVlbiBtb2RlJ1xuICAgIHBvbGxpbmdJbnRlcnZhbDpcbiAgICAgIG9yZGVyOiA0XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDYwXG4gICAgICBkZXNjcmlwdGlvbjogJ0hvdyBtYW55IHNlY29uZHMgc2hvdWxkIGJlIHdhaXRlZCBiZXR3ZWVuIHVwZGF0aW5nIHRoZSBiYXR0ZXJ5XFwncyBzdGF0dXMnXG5cbiAgYWN0aXZhdGU6IC0+XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAYmF0dGVyeVN0YXR1c1ZpZXc/LmRlc3Ryb3koKVxuICAgIEBiYXR0ZXJ5U3RhdHVzVmlldyA9IG51bGxcbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQGJhdHRlcnlTdGF0dXNWaWV3ID0gbmV3IEJhdHRlcnlTdGF0dXNWaWV3KClcbiAgICBAYmF0dGVyeVN0YXR1c1ZpZXcuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgQGJhdHRlcnlTdGF0dXNWaWV3LmF0dGFjaCgpXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnYmF0dGVyeS1zdGF0dXMuc2hvd1BlcmNlbnRhZ2UnLCAoc2hvd1BlcmNlbnRhZ2UpID0+XG4gICAgICBAYmF0dGVyeVN0YXR1c1ZpZXc/LnNldFNob3dQZXJjZW50YWdlIHNob3dQZXJjZW50YWdlXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2JhdHRlcnktc3RhdHVzLnNob3dSZW1haW5pbmdUaW1lJywgKHNob3dSZW1haW5pbmdUaW1lKSA9PlxuICAgICAgQGJhdHRlcnlTdGF0dXNWaWV3Py5zZXRTaG93UmVtYWluaW5nVGltZSBzaG93UmVtYWluaW5nVGltZVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdiYXR0ZXJ5LXN0YXR1cy5vbmx5U2hvd1doaWxlSW5GdWxsc2NyZWVuJywgKG9ubHlTaG93SW5GdWxsc2NyZWVuKSA9PlxuICAgICAgQGJhdHRlcnlTdGF0dXNWaWV3Py5zZXRPbmx5U2hvd0luRnVsbHNjcmVlbiBvbmx5U2hvd0luRnVsbHNjcmVlblxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdiYXR0ZXJ5LXN0YXR1cy5wb2xsaW5nSW50ZXJ2YWwnLCAocG9sbGluZ0ludGVydmFsKSA9PlxuICAgICAgQGJhdHRlcnlTdGF0dXNWaWV3Py5zZXRQb2xsaW5nSW50ZXJ2YWwgcG9sbGluZ0ludGVydmFsXG4iXX0=
