(function() {
  var net, portfinder, _;

  net = require('net');

  _ = require('lodash');

  module.exports = portfinder = {
    find: function(onFound) {
      var srv;
      srv = net.createServer();
      return srv.listen(0, function() {
        var port;
        port = srv.address().port;
        return srv.close(function(err) {
          if (err != null) {
            throw err;
          } else {
            return onFound(port);
          }
        });
      });
    },
    findMany: function(numPorts, onFound) {
      return this.findManyHelper(numPorts, [], onFound);
    },
    findManyHelper: function(numPorts, foundPorts, onFound) {
      if (numPorts === 0) {
        return onFound(foundPorts);
      } else {
        return this.find((function(_this) {
          return function(port) {
            var foundPortsClone;
            foundPortsClone = _.clone(foundPorts);
            foundPortsClone.push(port);
            return _this.findManyHelper(numPorts - 1, foundPortsClone, onFound);
          };
        })(this));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvZmluZC1wb3J0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNiO0FBQUEsSUFBQSxJQUFBLEVBQU0sU0FBQyxPQUFELEdBQUE7QUFDRixVQUFBLEdBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsWUFBSixDQUFBLENBQU4sQ0FBQTthQUVBLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLFNBQUEsR0FBQTtBQUNWLFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBYSxDQUFDLElBQXJCLENBQUE7ZUFDQSxHQUFHLENBQUMsS0FBSixDQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ04sVUFBQSxJQUFHLFdBQUg7QUFDSSxrQkFBTSxHQUFOLENBREo7V0FBQSxNQUFBO21CQUdJLE9BQUEsQ0FBUSxJQUFSLEVBSEo7V0FETTtRQUFBLENBQVYsRUFGVTtNQUFBLENBQWQsRUFIRTtJQUFBLENBQU47QUFBQSxJQVdBLFFBQUEsRUFBVSxTQUFDLFFBQUQsRUFBVyxPQUFYLEdBQUE7YUFDTixJQUFDLENBQUEsY0FBRCxDQUFnQixRQUFoQixFQUEwQixFQUExQixFQUE4QixPQUE5QixFQURNO0lBQUEsQ0FYVjtBQUFBLElBY0EsY0FBQSxFQUFnQixTQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLE9BQXZCLEdBQUE7QUFDWixNQUFBLElBQUcsUUFBQSxLQUFZLENBQWY7ZUFDSSxPQUFBLENBQVEsVUFBUixFQURKO09BQUEsTUFBQTtlQUdJLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLElBQUQsR0FBQTtBQUNGLGdCQUFBLGVBQUE7QUFBQSxZQUFBLGVBQUEsR0FBa0IsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFSLENBQWxCLENBQUE7QUFBQSxZQUNBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQURBLENBQUE7bUJBRUEsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBQSxHQUFXLENBQTNCLEVBQThCLGVBQTlCLEVBQStDLE9BQS9DLEVBSEU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOLEVBSEo7T0FEWTtJQUFBLENBZGhCO0dBSkosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/find-port.coffee
