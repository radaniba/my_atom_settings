'use babel';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var View = (function () {
  function View(name, dependencies) {
    _classCallCheck(this, View);

    this.name = name;
    this.dependencies = dependencies;

    var progress = this.progress = document.createElement('progress');
    progress.max = dependencies.length;
    progress.value = 0;
    progress.classList.add('display-inline');
    progress.style.width = '100%';

    this.notification = this.element = null;
  }

  _createClass(View, [{
    key: 'show',
    value: function show() {
      var _this = this;

      this.notification = atom.notifications.addInfo('Installing ' + this.name + ' dependencies', {
        detail: 'Installing ' + this.dependencies.join(', '),
        dismissable: true
      });
      this.element = document.createElement('div'); // placeholder
      setTimeout(function () {
        try {
          _this.element = atom.views.getView(_this.notification);

          var content = _this.element.querySelector('.detail-content');
          if (content) {
            content.appendChild(_this.progress);
          }
        } catch (_) {}
      }, 20);
    }
  }, {
    key: 'advance',
    value: function advance() {
      this.progress.value++;
      if (this.progress.value === this.progress.max) {
        var content = this.element.querySelector('.detail-content');
        var title = this.element.querySelector('.message p');

        if (content) {
          content.textContent = 'Installed ' + this.dependencies.join(', ');
        }
        if (title) {
          title.textContent = 'Installed ' + this.name + ' dependencies';
        }

        this.element.classList.remove('info');
        this.element.classList.remove('icon-info');
        this.element.classList.add('success');
        this.element.classList.add('icon-check');
      }
    }
  }]);

  return View;
})();

exports.View = View;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9teV9ub2RlanNfYXBwcy9saW50ZXItanNjcy9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLWRlcHMvbGliL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7SUFDRSxJQUFJO0FBQ0osV0FEQSxJQUFJLENBQ0gsSUFBSSxFQUFFLFlBQVksRUFBRTswQkFEckIsSUFBSTs7QUFFYixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTs7QUFFaEMsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ25FLFlBQVEsQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQTtBQUNsQyxZQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNsQixZQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3hDLFlBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQTs7QUFFN0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtHQUN4Qzs7ZUFaVSxJQUFJOztXQWFYLGdCQUFHOzs7QUFDTCxVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxpQkFBZSxJQUFJLENBQUMsSUFBSSxvQkFBaUI7QUFDckYsY0FBTSxrQkFBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQUU7QUFDcEQsbUJBQVcsRUFBRSxJQUFJO09BQ2xCLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxnQkFBVSxDQUFDLFlBQU07QUFDZixZQUFJO0FBQ0YsZ0JBQUssT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQUssWUFBWSxDQUFDLENBQUE7O0FBRXBELGNBQU0sT0FBTyxHQUFHLE1BQUssT0FBTyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELGNBQUksT0FBTyxFQUFFO0FBQ1gsbUJBQU8sQ0FBQyxXQUFXLENBQUMsTUFBSyxRQUFRLENBQUMsQ0FBQTtXQUNuQztTQUNGLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRztPQUNoQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0tBQ1A7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixVQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQzdDLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDN0QsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRELFlBQUksT0FBTyxFQUFFO0FBQ1gsaUJBQU8sQ0FBQyxXQUFXLGtCQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBRSxDQUFBO1NBQ2xFO0FBQ0QsWUFBSSxLQUFLLEVBQUU7QUFDVCxlQUFLLENBQUMsV0FBVyxrQkFBZ0IsSUFBSSxDQUFDLElBQUksa0JBQWUsQ0FBQTtTQUMxRDs7QUFFRCxZQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDckMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzFDLFlBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNyQyxZQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7T0FDekM7S0FDRjs7O1NBaERVLElBQUk7OztRQUFKLElBQUksR0FBSixJQUFJIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9teV9ub2RlanNfYXBwcy9saW50ZXItanNjcy9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLWRlcHMvbGliL3ZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuZXhwb3J0IGNsYXNzIFZpZXcge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBkZXBlbmRlbmNpZXMpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXNcblxuICAgIGNvbnN0IHByb2dyZXNzID0gdGhpcy5wcm9ncmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb2dyZXNzJylcbiAgICBwcm9ncmVzcy5tYXggPSBkZXBlbmRlbmNpZXMubGVuZ3RoXG4gICAgcHJvZ3Jlc3MudmFsdWUgPSAwXG4gICAgcHJvZ3Jlc3MuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1pbmxpbmUnKVxuICAgIHByb2dyZXNzLnN0eWxlLndpZHRoID0gJzEwMCUnXG5cbiAgICB0aGlzLm5vdGlmaWNhdGlvbiA9IHRoaXMuZWxlbWVudCA9IG51bGxcbiAgfVxuICBzaG93KCkge1xuICAgIHRoaXMubm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYEluc3RhbGxpbmcgJHt0aGlzLm5hbWV9IGRlcGVuZGVuY2llc2AsIHtcbiAgICAgIGRldGFpbDogYEluc3RhbGxpbmcgJHt0aGlzLmRlcGVuZGVuY2llcy5qb2luKCcsICcpfWAsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIH0pXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgLy8gcGxhY2Vob2xkZXJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLm5vdGlmaWNhdGlvbilcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXRhaWwtY29udGVudCcpXG4gICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZCh0aGlzLnByb2dyZXNzKVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfKSB7IH1cbiAgICB9LCAyMClcbiAgfVxuICBhZHZhbmNlKCkge1xuICAgIHRoaXMucHJvZ3Jlc3MudmFsdWUrK1xuICAgIGlmICh0aGlzLnByb2dyZXNzLnZhbHVlID09PSB0aGlzLnByb2dyZXNzLm1heCkge1xuICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlsLWNvbnRlbnQnKVxuICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UgcCcpXG5cbiAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgIGNvbnRlbnQudGV4dENvbnRlbnQgPSBgSW5zdGFsbGVkICR7dGhpcy5kZXBlbmRlbmNpZXMuam9pbignLCAnKX1gXG4gICAgICB9XG4gICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSBgSW5zdGFsbGVkICR7dGhpcy5uYW1lfSBkZXBlbmRlbmNpZXNgXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbmZvJylcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpY29uLWluZm8nKVxuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKVxuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ljb24tY2hlY2snKVxuICAgIH1cbiAgfVxufVxuIl19