(function() {
  var PyFlake8;

  PyFlake8 = require('./pyflake8');

  module.exports = {
    activate: function() {
      return this.pyflake = new PyFlake8();
    },
    deactivate: function() {
      return this.pyflake.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FBWCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxRQUFBLENBQUEsRUFEUDtJQUFBLENBQVY7QUFBQSxJQUdBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQSxFQURVO0lBQUEsQ0FIWjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/Rad/.atom/packages/atom-flake8/lib/index.coffee