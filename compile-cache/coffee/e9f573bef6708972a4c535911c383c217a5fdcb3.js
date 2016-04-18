(function() {
  var ScriptOptions, ScriptOptionsView, ScriptView;

  ScriptView = require('./script-view');

  ScriptOptionsView = require('./script-options-view');

  ScriptOptions = require('./script-options');

  module.exports = {
    scriptView: null,
    scriptOptionsView: null,
    scriptOptions: null,
    activate: function(state) {
      this.scriptOptions = new ScriptOptions();
      this.scriptView = new ScriptView(state.scriptViewState, this.scriptOptions);
      this.scriptOptionsView = new ScriptOptionsView(this.scriptOptions);
      return atom.workspaceView.on('core:cancel core:close', (function(_this) {
        return function(event) {
          var _ref, _ref1;
          if ((_ref = _this.scriptView) != null) {
            _ref.close();
          }
          return (_ref1 = _this.scriptOptionsView) != null ? _ref1.close() : void 0;
        };
      })(this));
    },
    deactivate: function() {
      this.scriptView.close();
      this.scriptOptionsView.close();
      return atom.workspaceView.off('core:cancel core:close');
    },
    serialize: function() {
      return {
        scriptViewState: this.scriptView.serialize(),
        scriptOptionsViewState: this.scriptOptionsView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQURwQixDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFBWSxJQUFaO0FBQUEsSUFDQSxpQkFBQSxFQUFtQixJQURuQjtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxVQUFBLENBQVcsS0FBSyxDQUFDLGVBQWpCLEVBQWtDLElBQUMsQ0FBQSxhQUFuQyxDQURsQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUFrQixJQUFDLENBQUEsYUFBbkIsQ0FGekIsQ0FBQTthQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBbkIsQ0FBc0Isd0JBQXRCLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtBQUM5QyxjQUFBLFdBQUE7O2dCQUFXLENBQUUsS0FBYixDQUFBO1dBQUE7a0VBQ2tCLENBQUUsS0FBcEIsQ0FBQSxXQUY4QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBTFE7SUFBQSxDQUpWO0FBQUEsSUFhQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxLQUFuQixDQUFBLENBREEsQ0FBQTthQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsd0JBQXZCLEVBSlU7SUFBQSxDQWJaO0FBQUEsSUFtQkEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUdUO0FBQUEsUUFBQSxlQUFBLEVBQWlCLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFBLENBQWpCO0FBQUEsUUFDQSxzQkFBQSxFQUF3QixJQUFDLENBQUEsaUJBQWlCLENBQUMsU0FBbkIsQ0FBQSxDQUR4QjtRQUhTO0lBQUEsQ0FuQlg7R0FMRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Rad/.atom/packages/script/lib/script.coffee