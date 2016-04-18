(function() {
  var StatusView, _;

  _ = require('lodash');

  module.exports = StatusView = (function() {
    function StatusView(language) {
      this.language = language;
      this.title = this.language + " kernel";
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen');
      this.element.classList.add('status');
      this.element.innerText = this.title;
      return this;
    }

    StatusView.prototype.setStatus = function(status) {
      return this.element.innerText = this.title + ": " + status;
    };

    StatusView.prototype.destroy = function() {
      this.element.innerHTML = '';
      return this.element.remove();
    };

    StatusView.prototype.getElement = function() {
      return this.element;
    };

    return StatusView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc3RhdHVzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVXLElBQUEsb0JBQUUsUUFBRixHQUFBO0FBQ1QsTUFEVSxJQUFDLENBQUEsV0FBQSxRQUNYLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLFFBQUQsR0FBWSxTQUFyQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsVUFBdkIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixRQUF2QixDQUhBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixJQUFDLENBQUEsS0FMdEIsQ0FBQTtBQU9BLGFBQU8sSUFBUCxDQVJTO0lBQUEsQ0FBYjs7QUFBQSx5QkFXQSxTQUFBLEdBQVcsU0FBQyxNQUFELEdBQUE7YUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFULEdBQWdCLE9BRDlCO0lBQUEsQ0FYWCxDQUFBOztBQUFBLHlCQWNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixFQUFyQixDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFGSztJQUFBLENBZFQsQ0FBQTs7QUFBQSx5QkFrQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxRQURPO0lBQUEsQ0FsQlosQ0FBQTs7c0JBQUE7O01BTEosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/status-view.coffee
