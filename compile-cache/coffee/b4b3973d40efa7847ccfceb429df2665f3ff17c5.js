(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    if (p == null) {
      return;
    }
    if (p.match(/\/\.pigments$/)) {
      return 'pigments';
    } else {
      return path.extname(p).slice(1);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvc2NvcGUtZnJvbS1maWxlLW5hbWUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxDQUFELEdBQUE7QUFDZixJQUFBLElBQWMsU0FBZDtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsZUFBUixDQUFIO2FBQWlDLFdBQWpDO0tBQUEsTUFBQTthQUFpRCxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBZ0IsVUFBakU7S0FGZTtFQUFBLENBRGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/scope-from-file-name.coffee
