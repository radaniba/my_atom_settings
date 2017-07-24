(function() {
  var Analytics, Tracker, allowUnsafeEval, analyticsWriteKey, pkg, _;

  analyticsWriteKey = 'pDV1EgxAbco4gjPXpJzuOeDyYgtkrmmG';

  _ = require('underscore-plus');

  allowUnsafeEval = require('loophole').allowUnsafeEval;

  Analytics = null;

  allowUnsafeEval(function() {
    return Analytics = require('analytics-node');
  });

  pkg = require("../package.json");

  Tracker = (function() {
    function Tracker(analyticsUserIdConfigKey, analyticsEnabledConfigKey) {
      var uuid;
      this.analyticsUserIdConfigKey = analyticsUserIdConfigKey;
      this.analyticsEnabledConfigKey = analyticsEnabledConfigKey;
      this.analytics = new Analytics(analyticsWriteKey);
      if (!atom.config.get(this.analyticsUserIdConfigKey)) {
        uuid = require('node-uuid');
        atom.config.set(this.analyticsUserIdConfigKey, uuid.v4());
      }
      this.defaultEvent = {
        userId: atom.config.get(this.analyticsUserIdConfigKey),
        properties: {
          value: 1,
          version: atom.getVersion(),
          platform: navigator.platform,
          category: "Atom-" + (atom.getVersion()) + "/" + pkg.name + "-" + pkg.version
        },
        context: {
          app: {
            name: pkg.name,
            version: pkg.version
          },
          userAgent: navigator.userAgent
        }
      };
      atom.config.observe(this.analyticsUserIdConfigKey, (function(_this) {
        return function(userId) {
          _this.analytics.identify({
            userId: userId
          });
          return _this.defaultEvent.userId = userId;
        };
      })(this));
      this.enabled = atom.config.get(this.analyticsEnabledConfigKey);
      atom.config.onDidChange(this.analyticsEnabledConfigKey, (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          return _this.enabled = newValue;
        };
      })(this));
    }

    Tracker.prototype.track = function(message) {
      if (!this.enabled) {
        return;
      }
      if (_.isString(message)) {
        message = {
          event: message
        };
      }
      console.debug("tracking " + message.event);
      return this.analytics.track(_.deepExtend(this.defaultEvent, message));
    };

    Tracker.prototype.trackActivate = function() {
      return this.track({
        event: 'Activate',
        properties: {
          label: pkg.version
        }
      });
    };

    Tracker.prototype.trackDeactivate = function() {
      return this.track({
        event: 'Deactivate',
        properties: {
          label: pkg.version
        }
      });
    };

    Tracker.prototype.error = function(e) {
      return this.track({
        event: 'Error',
        properties: {
          error: e
        }
      });
    };

    return Tracker;

  })();

  module.exports = Tracker;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi90cmFja2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw4REFBQTs7QUFBQSxFQUFBLGlCQUFBLEdBQW9CLGtDQUFwQixDQUFBOztBQUFBLEVBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUhKLENBQUE7O0FBQUEsRUFJQyxrQkFBbUIsT0FBQSxDQUFRLFVBQVIsRUFBbkIsZUFKRCxDQUFBOztBQUFBLEVBT0EsU0FBQSxHQUFZLElBUFosQ0FBQTs7QUFBQSxFQVFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO1dBQUcsU0FBQSxHQUFZLE9BQUEsQ0FBUSxnQkFBUixFQUFmO0VBQUEsQ0FBaEIsQ0FSQSxDQUFBOztBQUFBLEVBV0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUixDQVhOLENBQUE7O0FBQUEsRUFhTTtBQUVTLElBQUEsaUJBQUUsd0JBQUYsRUFBNkIseUJBQTdCLEdBQUE7QUFFWCxVQUFBLElBQUE7QUFBQSxNQUZZLElBQUMsQ0FBQSwyQkFBQSx3QkFFYixDQUFBO0FBQUEsTUFGdUMsSUFBQyxDQUFBLDRCQUFBLHlCQUV4QyxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxpQkFBVixDQUFqQixDQUFBO0FBR0EsTUFBQSxJQUFHLENBQUEsSUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSx3QkFBakIsQ0FBUDtBQUNFLFFBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSLENBQVAsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSx3QkFBakIsRUFBMkMsSUFBSSxDQUFDLEVBQUwsQ0FBQSxDQUEzQyxDQURBLENBREY7T0FIQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFlBQUQsR0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixJQUFDLENBQUEsd0JBQWpCLENBQVI7QUFBQSxRQUNBLFVBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxVQUNBLE9BQUEsRUFBUyxJQUFJLENBQUMsVUFBTCxDQUFBLENBRFQ7QUFBQSxVQUVBLFFBQUEsRUFBVSxTQUFTLENBQUMsUUFGcEI7QUFBQSxVQUdBLFFBQUEsRUFBVyxPQUFBLEdBQU0sQ0FBQyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUQsQ0FBTixHQUF5QixHQUF6QixHQUE0QixHQUFHLENBQUMsSUFBaEMsR0FBcUMsR0FBckMsR0FBd0MsR0FBRyxDQUFDLE9BSHZEO1NBRkY7QUFBQSxRQU1BLE9BQUEsRUFDRTtBQUFBLFVBQUEsR0FBQSxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sR0FBRyxDQUFDLElBQVY7QUFBQSxZQUNBLE9BQUEsRUFBUyxHQUFHLENBQUMsT0FEYjtXQURGO0FBQUEsVUFHQSxTQUFBLEVBQVcsU0FBUyxDQUFDLFNBSHJCO1NBUEY7T0FURixDQUFBO0FBQUEsTUFzQkEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLElBQUMsQ0FBQSx3QkFBckIsRUFBK0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQzdDLFVBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxRQUFYLENBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxNQUFSO1dBREYsQ0FBQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUF1QixPQUhzQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DLENBdEJBLENBQUE7QUFBQSxNQTRCQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixJQUFDLENBQUEseUJBQWpCLENBNUJYLENBQUE7QUFBQSxNQTZCQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsSUFBQyxDQUFBLHlCQUF6QixFQUFvRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDbEQsY0FBQSxRQUFBO0FBQUEsVUFEb0QsV0FBRCxLQUFDLFFBQ3BELENBQUE7aUJBQUEsS0FBQyxDQUFBLE9BQUQsR0FBVyxTQUR1QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELENBN0JBLENBRlc7SUFBQSxDQUFiOztBQUFBLHNCQWtDQSxLQUFBLEdBQU8sU0FBQyxPQUFELEdBQUE7QUFDTCxNQUFBLElBQVUsQ0FBQSxJQUFLLENBQUEsT0FBZjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUE0QixDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBNUI7QUFBQSxRQUFBLE9BQUEsR0FBVTtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7U0FBVixDQUFBO09BREE7QUFBQSxNQUVBLE9BQU8sQ0FBQyxLQUFSLENBQWUsV0FBQSxHQUFXLE9BQU8sQ0FBQyxLQUFsQyxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUIsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxJQUFDLENBQUEsWUFBZCxFQUE0QixPQUE1QixDQUFqQixFQUpLO0lBQUEsQ0FsQ1AsQ0FBQTs7QUFBQSxzQkF3Q0EsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxLQUFELENBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFDQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxHQUFHLENBQUMsT0FBWDtTQUZGO09BREYsRUFEYTtJQUFBLENBeENmLENBQUE7O0FBQUEsc0JBOENBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO2FBQ2YsSUFBQyxDQUFBLEtBQUQsQ0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7QUFBQSxRQUNBLFVBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLEdBQUcsQ0FBQyxPQUFYO1NBRkY7T0FERixFQURlO0lBQUEsQ0E5Q2pCLENBQUE7O0FBQUEsc0JBb0RBLEtBQUEsR0FBTyxTQUFDLENBQUQsR0FBQTthQUNMLElBQUMsQ0FBQSxLQUFELENBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFDQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFQO1NBRkY7T0FERixFQURLO0lBQUEsQ0FwRFAsQ0FBQTs7bUJBQUE7O01BZkYsQ0FBQTs7QUFBQSxFQXlFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQXpFakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/lib/tracker.coffee
