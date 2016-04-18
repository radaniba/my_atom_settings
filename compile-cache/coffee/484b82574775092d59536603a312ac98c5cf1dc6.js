(function() {
  var encodingStatusView;

  encodingStatusView = null;

  module.exports = {
    activate: function() {},
    deactivate: function() {
      if (encodingStatusView != null) {
        encodingStatusView.destroy();
      }
      return encodingStatusView = null;
    },
    consumeStatusBar: function(statusBar) {
      var BatteryStatusView, batteryStatusView;
      BatteryStatusView = require('./battery-status-view');
      batteryStatusView = new BatteryStatusView();
      batteryStatusView.initialize(statusBar);
      return batteryStatusView.attach();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9iYXR0ZXJ5LXN0YXR1cy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxrQkFBQSxHQUFxQixJQUFyQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQSxDQUFWO0FBQUEsSUFFQSxVQUFBLEVBQVksU0FBQSxHQUFBOztRQUNWLGtCQUFrQixDQUFFLE9BQXBCLENBQUE7T0FBQTthQUNBLGtCQUFBLEdBQXFCLEtBRlg7SUFBQSxDQUZaO0FBQUEsSUFNQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQsR0FBQTtBQUNoQixVQUFBLG9DQUFBO0FBQUEsTUFBQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsdUJBQVIsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsaUJBQUEsR0FBd0IsSUFBQSxpQkFBQSxDQUFBLENBRHhCLENBQUE7QUFBQSxNQUVBLGlCQUFpQixDQUFDLFVBQWxCLENBQTZCLFNBQTdCLENBRkEsQ0FBQTthQUdBLGlCQUFpQixDQUFDLE1BQWxCLENBQUEsRUFKZ0I7SUFBQSxDQU5sQjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/battery-status/lib/main.coffee
