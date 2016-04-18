(function() {
  var BatteryStatus, BatteryStatusView, CompositeDisposable;

  BatteryStatusView = require('./battery-status-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = BatteryStatus = {
    batteryStatusView: null,
    disposables: null,
    config: {
      showPercentage: {
        type: 'boolean',
        "default": true,
        description: 'Display the charge percentage next to the charge icon'
      },
      onlyShowWhileInFullscreen: {
        type: 'boolean',
        "default": false,
        description: 'Display the status item only while in full-screen mode'
      }
    },
    activate: function() {},
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.batteryStatusView) != null) {
        _ref.destroy();
      }
      this.batteryStatusView = null;
      return (_ref1 = this.disposables) != null ? _ref1.dispose() : void 0;
    },
    consumeStatusBar: function(statusBar) {
      this.batteryStatusView = new BatteryStatusView();
      this.batteryStatusView.initialize(statusBar);
      this.batteryStatusView.attach();
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('battery-status.showPercentage', (function(_this) {
        return function(showPercentage) {
          var _ref;
          return (_ref = _this.batteryStatusView) != null ? _ref.setShowPercentage(showPercentage) : void 0;
        };
      })(this)));
      return this.disposables.add(atom.config.observe('battery-status.onlyShowWhileInFullscreen', (function(_this) {
        return function(onlyShowInFullscreen) {
          var _ref;
          return (_ref = _this.batteryStatusView) != null ? _ref.setOnlyShowInFullscreen(onlyShowInFullscreen) : void 0;
        };
      })(this)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscURBQUE7O0FBQUEsRUFBQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsdUJBQVIsQ0FBcEIsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsYUFBQSxHQUNmO0FBQUEsSUFBQSxpQkFBQSxFQUFtQixJQUFuQjtBQUFBLElBQ0EsV0FBQSxFQUFhLElBRGI7QUFBQSxJQUdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx1REFGYjtPQURGO0FBQUEsTUFJQSx5QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx3REFGYjtPQUxGO0tBSkY7QUFBQSxJQWFBLFFBQUEsRUFBVSxTQUFBLEdBQUEsQ0FiVjtBQUFBLElBZUEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsV0FBQTs7WUFBa0IsQ0FBRSxPQUFwQixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQURyQixDQUFBO3VEQUVZLENBQUUsT0FBZCxDQUFBLFdBSFU7SUFBQSxDQWZaO0FBQUEsSUFvQkEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUFBLENBQXpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxVQUFuQixDQUE4QixTQUE5QixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxNQUFuQixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBSmYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiwrQkFBcEIsRUFBcUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsY0FBRCxHQUFBO0FBQ3BFLGNBQUEsSUFBQTtnRUFBa0IsQ0FBRSxpQkFBcEIsQ0FBc0MsY0FBdEMsV0FEb0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRCxDQUFqQixDQUxBLENBQUE7YUFRQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDBDQUFwQixFQUFnRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxvQkFBRCxHQUFBO0FBQy9FLGNBQUEsSUFBQTtnRUFBa0IsQ0FBRSx1QkFBcEIsQ0FBNEMsb0JBQTVDLFdBRCtFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEUsQ0FBakIsRUFUZ0I7SUFBQSxDQXBCbEI7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/battery-status/lib/main.coffee
