(function() {
  var StatusInProgress;

  module.exports = StatusInProgress = (function() {
    StatusInProgress.prototype.actions = [];

    function StatusInProgress() {
      this.span = document.createElement("span");
      this.span.className = "inline-block text-subtle";
      this.span.innerHTML = "Indexing..";
      this.progress = document.createElement("progress");
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.subcontainer = document.createElement("div");
      this.subcontainer.className = "block";
      this.container.appendChild(this.subcontainer);
      this.subcontainer.appendChild(this.progress);
      this.subcontainer.appendChild(this.span);
    }

    StatusInProgress.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusInProgress.prototype.update = function(text, show) {
      if (show) {
        this.container.className = "inline-block";
        this.span.innerHTML = text;
        return this.actions.push(text);
      } else {
        this.actions.forEach(function(value, index) {
          if (value === text) {
            return this.actions.splice(index, 1);
          }
        }, this);
        if (this.actions.length === 0) {
          return this.hide();
        } else {
          return this.span.innerHTML = this.actions[0];
        }
      }
    };

    StatusInProgress.prototype.hide = function() {
      return this.container.className = 'hidden';
    };

    StatusInProgress.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 19
      });
    };

    StatusInProgress.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusInProgress;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3N0YXR1cy1pbi1wcm9ncmVzcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0JBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUtNO0FBQ0osK0JBQUEsT0FBQSxHQUFTLEVBQVQsQ0FBQTs7QUFFYSxJQUFBLDBCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0IsMEJBRGxCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQixZQUZsQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsUUFBRCxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLFVBQXZCLENBSlosQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQU5iLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QixjQVB2QixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQVRoQixDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsR0FBMEIsT0FWMUIsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxZQUF4QixDQVhBLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxZQUFZLENBQUMsV0FBZCxDQUEwQixJQUFDLENBQUEsUUFBM0IsQ0FiQSxDQUFBO0FBQUEsTUFjQSxJQUFDLENBQUEsWUFBWSxDQUFDLFdBQWQsQ0FBMEIsSUFBQyxDQUFBLElBQTNCLENBZEEsQ0FEVztJQUFBLENBRmI7O0FBQUEsK0JBbUJBLFVBQUEsR0FBWSxTQUFFLFNBQUYsR0FBQTtBQUFjLE1BQWIsSUFBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO0lBQUEsQ0FuQlosQ0FBQTs7QUFBQSwrQkFxQkEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUNOLE1BQUEsSUFBRyxJQUFIO0FBQ0ksUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUIsY0FBdkIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCLElBRGxCLENBQUE7ZUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLEVBSEo7T0FBQSxNQUFBO0FBS0ksUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO0FBQ2IsVUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO21CQUNJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixDQUF2QixFQURKO1dBRGE7UUFBQSxDQUFqQixFQUdFLElBSEYsQ0FBQSxDQUFBO0FBS0EsUUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQixDQUF0QjtpQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBREo7U0FBQSxNQUFBO2lCQUdJLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsRUFIL0I7U0FWSjtPQURNO0lBQUEsQ0FyQlIsQ0FBQTs7QUFBQSwrQkFxQ0EsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QixTQURuQjtJQUFBLENBckNOLENBQUE7O0FBQUEsK0JBd0NBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUFQO0FBQUEsUUFBa0IsUUFBQSxFQUFVLEVBQTVCO09BQXhCLEVBREY7SUFBQSxDQXhDUixDQUFBOztBQUFBLCtCQTJDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsRUFETTtJQUFBLENBM0NSLENBQUE7OzRCQUFBOztNQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/status-in-progress.coffee
