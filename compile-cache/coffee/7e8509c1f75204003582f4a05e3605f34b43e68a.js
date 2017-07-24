(function() {
  var StatusView;

  module.exports = StatusView = (function() {
    function StatusView(language) {
      this.language = language;
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen');
      this.element.classList.add('status');
      this.element.innerText = this.language + ': starting';
    }

    StatusView.prototype.setStatus = function(status) {
      return this.element.innerText = this.language + ': ' + status;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc3RhdHVzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRVcsSUFBQSxvQkFBRSxRQUFGLEdBQUE7QUFDVCxNQURVLElBQUMsQ0FBQSxXQUFBLFFBQ1gsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFVBQXZCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsUUFBdkIsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsSUFBQyxDQUFBLFFBQUQsR0FBWSxZQUpqQyxDQURTO0lBQUEsQ0FBYjs7QUFBQSx5QkFRQSxTQUFBLEdBQVcsU0FBQyxNQUFELEdBQUE7YUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFaLEdBQW1CLE9BRGpDO0lBQUEsQ0FSWCxDQUFBOztBQUFBLHlCQVlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixFQUFyQixDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFGSztJQUFBLENBWlQsQ0FBQTs7QUFBQSx5QkFpQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxRQURPO0lBQUEsQ0FqQlosQ0FBQTs7c0JBQUE7O01BSEosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/status-view.coffee
