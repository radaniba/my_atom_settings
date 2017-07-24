(function() {
  var __slice = [].slice;

  module.exports = {
    setConfig: function(keyPath, value) {
      var _base;
      if (this.originalConfigs == null) {
        this.originalConfigs = {};
      }
      if ((_base = this.originalConfigs)[keyPath] == null) {
        _base[keyPath] = atom.config.isDefault(keyPath) ? null : atom.config.get(keyPath);
      }
      return atom.config.set(keyPath, value);
    },
    restoreConfigs: function() {
      var keyPath, value, _ref, _results;
      if (this.originalConfigs) {
        _ref = this.originalConfigs;
        _results = [];
        for (keyPath in _ref) {
          value = _ref[keyPath];
          _results.push(atom.config.set(keyPath, value));
        }
        return _results;
      }
    },
    callAsync: function(timeout, async, next) {
      var done, nextArgs, _ref;
      if (typeof timeout === 'function') {
        _ref = [timeout, async], async = _ref[0], next = _ref[1];
        timeout = 5000;
      }
      done = false;
      nextArgs = null;
      runs(function() {
        return async(function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          done = true;
          return nextArgs = args;
        });
      });
      waitsFor(function() {
        return done;
      }, null, timeout);
      if (next != null) {
        return runs(function() {
          return next.apply(this, nextArgs);
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL3NwZWMvc3BlYy1oZWxwZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxTQUFDLE9BQUQsRUFBVSxLQUFWLEdBQUE7QUFDVCxVQUFBLEtBQUE7O1FBQUEsSUFBQyxDQUFBLGtCQUFtQjtPQUFwQjs7YUFDaUIsQ0FBQSxPQUFBLElBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFaLENBQXNCLE9BQXRCLENBQUgsR0FBc0MsSUFBdEMsR0FBZ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCO09BRDdFO2FBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLEtBQXpCLEVBSFM7SUFBQSxDQUFYO0FBQUEsSUFLQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsOEJBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFDRTtBQUFBO2FBQUEsZUFBQTtnQ0FBQTtBQUNFLHdCQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixLQUF6QixFQUFBLENBREY7QUFBQTt3QkFERjtPQURjO0lBQUEsQ0FMaEI7QUFBQSxJQVVBLFNBQUEsRUFBVyxTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLElBQWpCLEdBQUE7QUFDVCxVQUFBLG9CQUFBO0FBQUEsTUFBQSxJQUFHLE1BQUEsQ0FBQSxPQUFBLEtBQWtCLFVBQXJCO0FBQ0UsUUFBQSxPQUFnQixDQUFDLE9BQUQsRUFBVSxLQUFWLENBQWhCLEVBQUMsZUFBRCxFQUFRLGNBQVIsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLElBRFYsQ0FERjtPQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sS0FIUCxDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsSUFKWCxDQUFBO0FBQUEsTUFNQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsS0FBQSxDQUFNLFNBQUEsR0FBQTtBQUNKLGNBQUEsSUFBQTtBQUFBLFVBREssOERBQ0wsQ0FBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtpQkFDQSxRQUFBLEdBQVcsS0FGUDtRQUFBLENBQU4sRUFERztNQUFBLENBQUwsQ0FOQSxDQUFBO0FBQUEsTUFZQSxRQUFBLENBQVMsU0FBQSxHQUFBO2VBQ1AsS0FETztNQUFBLENBQVQsRUFFRSxJQUZGLEVBRVEsT0FGUixDQVpBLENBQUE7QUFnQkEsTUFBQSxJQUFHLFlBQUg7ZUFDRSxJQUFBLENBQUssU0FBQSxHQUFBO2lCQUNILElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQUFpQixRQUFqQixFQURHO1FBQUEsQ0FBTCxFQURGO09BakJTO0lBQUEsQ0FWWDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/spec/spec-helpers.coffee
