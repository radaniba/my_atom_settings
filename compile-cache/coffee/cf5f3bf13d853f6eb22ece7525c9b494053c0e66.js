(function() {
  var StatusView;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvc3RhdHVzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRVcsSUFBQSxvQkFBRSxRQUFGLEdBQUE7QUFDVCxNQURVLElBQUMsQ0FBQSxXQUFBLFFBQ1gsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsUUFBRCxHQUFZLFNBQXJCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFFBQXZCLENBSEEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLElBQUMsQ0FBQSxLQUx0QixDQUFBO0FBT0EsYUFBTyxJQUFQLENBUlM7SUFBQSxDQUFiOztBQUFBLHlCQVdBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixJQUFDLENBQUEsS0FBRCxHQUFTLElBQVQsR0FBZ0IsT0FEOUI7SUFBQSxDQVhYLENBQUE7O0FBQUEseUJBY0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLEVBQXJCLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxFQUZLO0lBQUEsQ0FkVCxDQUFBOztBQUFBLHlCQWtCQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLFFBRE87SUFBQSxDQWxCWixDQUFBOztzQkFBQTs7TUFISixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/status-view.coffee
