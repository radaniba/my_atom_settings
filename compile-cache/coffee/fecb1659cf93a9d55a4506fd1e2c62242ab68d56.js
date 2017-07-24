(function() {
  var LoadingView;

  module.exports = LoadingView = (function() {
    function LoadingView() {
      var icon, message, messageOuter;
      this.element = document.createElement('div');
      this.element.classList.add('split-diff-modal');
      icon = document.createElement('div');
      icon.classList.add('split-diff-icon');
      this.element.appendChild(icon);
      message = document.createElement('div');
      message.textContent = "Computing the diff for you.";
      message.classList.add('split-diff-message');
      messageOuter = document.createElement('div');
      messageOuter.appendChild(message);
      this.element.appendChild(messageOuter);
    }

    LoadingView.prototype.destroy = function() {
      this.element.remove();
      return this.modalPanel.destroy();
    };

    LoadingView.prototype.getElement = function() {
      return this.element;
    };

    LoadingView.prototype.createModal = function() {
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.element,
        visible: false
      });
      return this.modalPanel.item.parentNode.classList.add('split-diff-hide-mask');
    };

    LoadingView.prototype.show = function() {
      return this.modalPanel.show();
    };

    LoadingView.prototype.hide = function() {
      return this.modalPanel.hide();
    };

    return LoadingView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9sb2FkaW5nLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MscUJBQUE7QUFFWCxVQUFBO01BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLGtCQUF2QjtNQUdBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBZixDQUFtQixpQkFBbkI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBckI7TUFHQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDVixPQUFPLENBQUMsV0FBUixHQUFzQjtNQUN0QixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLG9CQUF0QjtNQUNBLFlBQUEsR0FBZSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNmLFlBQVksQ0FBQyxXQUFiLENBQXlCLE9BQXpCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLFlBQXJCO0lBaEJXOzswQkFtQmIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO0lBRk87OzBCQUlULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBO0lBRFM7OzBCQUdaLFdBQUEsR0FBYSxTQUFBO01BQ1gsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7UUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLE9BQVA7UUFBZ0IsT0FBQSxFQUFTLEtBQXpCO09BQTdCO2FBQ2QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUF0QyxDQUEwQyxzQkFBMUM7SUFGVzs7MEJBSWIsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQTtJQURJOzswQkFHTixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBO0lBREk7Ozs7O0FBbkNSIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTG9hZGluZ1ZpZXdcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgIyBDcmVhdGUgcm9vdCBlbGVtZW50XG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYtbW9kYWwnKVxuXG4gICAgIyBDcmVhdGUgaWNvbiBlbGVtZW50XG4gICAgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgaWNvbi5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmLWljb24nKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKGljb24pXG5cbiAgICAjIENyZWF0ZSBtZXNzYWdlIGVsZW1lbnRcbiAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJDb21wdXRpbmcgdGhlIGRpZmYgZm9yIHlvdS5cIlxuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnc3BsaXQtZGlmZi1tZXNzYWdlJylcbiAgICBtZXNzYWdlT3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG1lc3NhZ2VPdXRlci5hcHBlbmRDaGlsZChtZXNzYWdlKVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKG1lc3NhZ2VPdXRlcilcblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG4gICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpXG5cbiAgZ2V0RWxlbWVudDogLT5cbiAgICBAZWxlbWVudFxuXG4gIGNyZWF0ZU1vZGFsOiAtPlxuICAgIEBtb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBAZWxlbWVudCwgdmlzaWJsZTogZmFsc2UpXG4gICAgQG1vZGFsUGFuZWwuaXRlbS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYtaGlkZS1tYXNrJylcblxuICBzaG93OiAtPlxuICAgIEBtb2RhbFBhbmVsLnNob3coKVxuXG4gIGhpZGU6IC0+XG4gICAgQG1vZGFsUGFuZWwuaGlkZSgpXG4iXX0=
