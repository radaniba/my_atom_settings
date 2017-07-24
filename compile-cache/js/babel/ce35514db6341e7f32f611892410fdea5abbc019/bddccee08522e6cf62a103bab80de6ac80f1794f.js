Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var InputView = (function () {
  function InputView(_ref, onConfirmed) {
    var _this = this;

    var prompt = _ref.prompt;
    var defaultText = _ref.defaultText;
    var allowCancel = _ref.allowCancel;

    _classCallCheck(this, InputView);

    this.onConfirmed = onConfirmed;

    this.element = document.createElement('div');
    this.element.classList.add('hydrogen', 'input-view');
    var label = document.createElement('div');
    label.classList.add('label', 'icon', 'icon-arrow-right');
    label.textContent = prompt || 'Kernel requires input';

    this.miniEditor = new _atom.TextEditor({ mini: true });
    if (defaultText) this.miniEditor.setText(defaultText);

    this.element.appendChild(label);
    this.element.appendChild(this.miniEditor.element);

    if (allowCancel) {
      atom.commands.add(this.element, {
        'core:confirm': function coreConfirm() {
          return _this.confirm();
        },
        'core:cancel': function coreCancel() {
          return _this.close();
        }
      });
      this.miniEditor.element.addEventListener('blur', function () {
        if (document.hasFocus()) _this.close();
      });
    } else {
      atom.commands.add(this.element, {
        'core:confirm': function coreConfirm() {
          return _this.confirm();
        }
      });
    }
  }

  _createClass(InputView, [{
    key: 'confirm',
    value: function confirm() {
      var text = this.miniEditor.getText();
      if (this.onConfirmed) this.onConfirmed(text);
      this.close();
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.panel) this.panel.destroy();
      this.panel = null;
      this.element.remove();
      if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
    }
  }, {
    key: 'attach',
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      this.panel = atom.workspace.addModalPanel({ item: this.element });
      this.miniEditor.element.focus();
      this.miniEditor.scrollToCursorPosition();
    }
  }]);

  return InputView;
})();

exports['default'] = InputView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2lucHV0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRTJCLE1BQU07O0FBRmpDLFdBQVcsQ0FBQzs7SUFJUyxTQUFTO0FBQ2pCLFdBRFEsU0FBUyxDQUNoQixJQUFvQyxFQUFFLFdBQVcsRUFBRTs7O1FBQWpELE1BQU0sR0FBUixJQUFvQyxDQUFsQyxNQUFNO1FBQUUsV0FBVyxHQUFyQixJQUFvQyxDQUExQixXQUFXO1FBQUUsV0FBVyxHQUFsQyxJQUFvQyxDQUFiLFdBQVc7OzBCQUQzQixTQUFTOztBQUUxQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDckQsUUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxTQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekQsU0FBSyxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksdUJBQXVCLENBQUM7O0FBRXRELFFBQUksQ0FBQyxVQUFVLEdBQUcscUJBQWUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNqRCxRQUFJLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxXQUFXLEVBQUU7QUFDZixVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzlCLHNCQUFjLEVBQUU7aUJBQU0sTUFBSyxPQUFPLEVBQUU7U0FBQTtBQUNwQyxxQkFBYSxFQUFFO2lCQUFNLE1BQUssS0FBSyxFQUFFO1NBQUE7T0FDbEMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDckQsWUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBSyxLQUFLLEVBQUUsQ0FBQztPQUN2QyxDQUFDLENBQUM7S0FDSixNQUFNO0FBQ0wsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUM5QixzQkFBYyxFQUFFO2lCQUFNLE1BQUssT0FBTyxFQUFFO1NBQUE7T0FDckMsQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7ZUE3QmtCLFNBQVM7O1dBK0JyQixtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixVQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDMUU7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDdkQsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNsRSxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxVQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDMUM7OztTQWpEa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvaW5wdXQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0VmlldyB7XG4gIGNvbnN0cnVjdG9yKHsgcHJvbXB0LCBkZWZhdWx0VGV4dCwgYWxsb3dDYW5jZWwgfSwgb25Db25maXJtZWQpIHtcbiAgICB0aGlzLm9uQ29uZmlybWVkID0gb25Db25maXJtZWQ7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaHlkcm9nZW4nLCAnaW5wdXQtdmlldycpO1xuICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnbGFiZWwnLCAnaWNvbicsICdpY29uLWFycm93LXJpZ2h0Jyk7XG4gICAgbGFiZWwudGV4dENvbnRlbnQgPSBwcm9tcHQgfHwgJ0tlcm5lbCByZXF1aXJlcyBpbnB1dCc7XG5cbiAgICB0aGlzLm1pbmlFZGl0b3IgPSBuZXcgVGV4dEVkaXRvcih7IG1pbmk6IHRydWUgfSk7XG4gICAgaWYgKGRlZmF1bHRUZXh0KSB0aGlzLm1pbmlFZGl0b3Iuc2V0VGV4dChkZWZhdWx0VGV4dCk7XG5cbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLm1pbmlFZGl0b3IuZWxlbWVudCk7XG5cbiAgICBpZiAoYWxsb3dDYW5jZWwpIHtcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAnY29yZTpjb25maXJtJzogKCkgPT4gdGhpcy5jb25maXJtKCksXG4gICAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHRoaXMuY2xvc2UoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5taW5pRWRpdG9yLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkpIHRoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHRoaXMuY29uZmlybSgpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uZmlybSgpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5taW5pRWRpdG9yLmdldFRleHQoKTtcbiAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZCh0ZXh0KTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzLmVsZW1lbnQgfSk7XG4gICAgdGhpcy5taW5pRWRpdG9yLmVsZW1lbnQuZm9jdXMoKTtcbiAgICB0aGlzLm1pbmlFZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpO1xuICB9XG59XG4iXX0=