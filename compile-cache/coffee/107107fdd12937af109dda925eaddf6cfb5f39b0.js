(function() {
  var LogLine, LogView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  LogLine = (function(superClass) {
    extend(LogLine, superClass);

    function LogLine() {
      return LogLine.__super__.constructor.apply(this, arguments);
    }

    LogLine.content = function(line) {
      return this.pre({
        "class": "" + (line.iserror ? 'error' : '')
      }, line.log);
    };

    return LogLine;

  })(View);

  module.exports = LogView = (function(superClass) {
    extend(LogView, superClass);

    function LogView() {
      return LogView.__super__.constructor.apply(this, arguments);
    }

    LogView.content = function() {
      return this.div({
        "class": 'logger'
      });
    };

    LogView.prototype.log = function(log, iserror) {
      this.append(new LogLine({
        iserror: iserror,
        log: log
      }));
      this.scrollToBottom();
    };

    return LogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvbG9nLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUjs7RUFFSDs7Ozs7OztJQUNKLE9BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sRUFBQSxHQUFFLENBQUksSUFBSSxDQUFDLE9BQVIsR0FBcUIsT0FBckIsR0FBa0MsRUFBbkMsQ0FBVDtPQUFMLEVBQXVELElBQUksQ0FBQyxHQUE1RDtJQURROzs7O0tBRFU7O0VBSXRCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixPQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUw7SUFEUTs7c0JBR1YsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLE9BQU47TUFDSCxJQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsT0FBQSxDQUFRO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFBa0IsR0FBQSxFQUFLLEdBQXZCO09BQVIsQ0FBWjtNQUNBLElBQUMsQ0FBQSxjQUFELENBQUE7SUFGRzs7OztLQUplO0FBUHRCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmNsYXNzIExvZ0xpbmUgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAobGluZSkgLT5cbiAgICBAcHJlIGNsYXNzOiBcIiN7aWYgbGluZS5pc2Vycm9yIHRoZW4gJ2Vycm9yJyBlbHNlICcnfVwiLCBsaW5lLmxvZ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMb2dWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnbG9nZ2VyJ1xuXG4gIGxvZzogKGxvZywgaXNlcnJvcikgLT5cbiAgICBAYXBwZW5kIG5ldyBMb2dMaW5lKGlzZXJyb3I6IGlzZXJyb3IsIGxvZzogbG9nKVxuICAgIEBzY3JvbGxUb0JvdHRvbSgpXG4gICAgcmV0dXJuXG4iXX0=
