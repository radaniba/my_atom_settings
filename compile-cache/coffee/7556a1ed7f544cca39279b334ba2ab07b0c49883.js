(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    if (p.match(/\/\.pigments$/)) {
      return 'pigments';
    }
    return path.extname(p).slice(1);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvc2NvcGUtZnJvbS1maWxlLW5hbWUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxDQUFELEdBQUE7QUFDZixJQUFBLElBQXFCLENBQUMsQ0FBQyxLQUFGLENBQVEsZUFBUixDQUFyQjtBQUFBLGFBQU8sVUFBUCxDQUFBO0tBQUE7V0FDQSxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBZ0IsVUFGRDtFQUFBLENBRGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/scope-from-file-name.coffee
