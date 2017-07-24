Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _watchView = require('./watch-view');

var _watchView2 = _interopRequireDefault(_watchView);

var _watchesPicker = require('./watches-picker');

var _watchesPicker2 = _interopRequireDefault(_watchesPicker);

'use babel';

var WatchSidebar = (function () {
  function WatchSidebar(kernel) {
    var _this = this;

    _classCallCheck(this, WatchSidebar);

    this.resizeStarted = this.resizeStarted.bind(this);
    this.resizeStopped = this.resizeStopped.bind(this);
    this.resizeSidebar = this.resizeSidebar.bind(this);
    this.kernel = kernel;
    this.element = document.createElement('div');
    this.element.classList.add('hydrogen', 'watch-sidebar');

    var toolbar = document.createElement('div');
    toolbar.classList.add('toolbar', 'block');

    var languageDisplay = document.createElement('div');
    languageDisplay.classList.add('language', 'icon', 'icon-eye');
    languageDisplay.innerText = this.kernel.kernelSpec.display_name;

    var toggleButton = document.createElement('button');
    toggleButton.classList.add('btn', 'icon', 'icon-remove-close');
    toggleButton.onclick = function () {
      var editor = atom.workspace.getActiveTextEditor();
      var editorView = atom.views.getView(editor);
      atom.commands.dispatch(editorView, 'hydrogen:toggle-watches');
    };

    var tooltips = new _atom.CompositeDisposable();
    tooltips.add(atom.tooltips.add(toggleButton, { title: 'Toggle Watch Sidebar' }));

    this.watchesContainer = document.createElement('div');
    _lodash2['default'].forEach(this.watchViews, function (watch) {
      return _this.watchesContainer.appendChild(watch.element);
    });

    var buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group');
    var addButton = document.createElement('button');
    addButton.classList.add('btn', 'btn-primary', 'icon', 'icon-plus');
    addButton.innerText = 'Add watch';
    addButton.onclick = function () {
      return _this.addWatch();
    };

    var removeButton = document.createElement('button');
    removeButton.classList.add('btn', 'btn-error', 'icon', 'icon-trashcan');
    removeButton.innerText = 'Remove watch';
    removeButton.onclick = function () {
      return _this.removeWatch();
    };

    var resizeHandle = document.createElement('div');
    resizeHandle.classList.add('watch-resize-handle');
    resizeHandle.addEventListener('mousedown', this.resizeStarted);

    toolbar.appendChild(languageDisplay);
    toolbar.appendChild(toggleButton);
    buttonGroup.appendChild(addButton);
    buttonGroup.appendChild(removeButton);

    this.element.appendChild(toolbar);
    this.element.appendChild(this.watchesContainer);
    this.element.appendChild(buttonGroup);
    this.element.appendChild(resizeHandle);

    this.kernel.addWatchCallback(function () {
      return _this.run();
    });

    this.watchViews = [];
    this.addWatch();

    this.hide();
    atom.workspace.addRightPanel({ item: this.element });
  }

  _createClass(WatchSidebar, [{
    key: 'createWatch',
    value: function createWatch() {
      var watch = _lodash2['default'].last(this.watchViews);
      if (!watch || watch.getCode().replace(/\s/g, '') !== '') {
        watch = new _watchView2['default'](this.kernel);
        this.watchViews.push(watch);
        this.watchesContainer.appendChild(watch.element);
      }
      return watch;
    }
  }, {
    key: 'addWatch',
    value: function addWatch() {
      this.createWatch().focus();
    }
  }, {
    key: 'addWatchFromEditor',
    value: function addWatchFromEditor() {
      var watchText = atom.workspace.getActiveTextEditor().getSelectedText();
      if (!watchText) {
        this.addWatch();
      } else {
        var watch = this.createWatch();
        watch.setCode(watchText);
        watch.run();
      }
      this.show();
    }
  }, {
    key: 'removeWatch',
    value: function removeWatch() {
      var _this2 = this;

      var watches = this.watchViews.map(function (v, k) {
        return {
          name: v.getCode(),
          value: k
        };
      });
      _watchesPicker2['default'].onConfirmed = function (item) {
        _this2.watchViews[item.value].destroy();
        _this2.watchViews.splice(item.value, 1);
        if (_this2.watchViews.length === 0) _this2.addWatch();
      };
      _watchesPicker2['default'].setItems(watches);
      _watchesPicker2['default'].toggle();
    }
  }, {
    key: 'run',
    value: function run() {
      if (this.visible) {
        _lodash2['default'].forEach(this.watchViews, function (watchView) {
          return watchView.run();
        });
      }
    }
  }, {
    key: 'resizeStarted',
    value: function resizeStarted() {
      document.addEventListener('mousemove', this.resizeSidebar);
      document.addEventListener('mouseup', this.resizeStopped);
    }
  }, {
    key: 'resizeStopped',
    value: function resizeStopped() {
      document.removeEventListener('mousemove', this.resizeSidebar);
      document.removeEventListener('mouseup', this.resizeStopped);
    }
  }, {
    key: 'resizeSidebar',
    value: function resizeSidebar(_ref) {
      var pageX = _ref.pageX;
      var which = _ref.which;

      if (which !== 1) this.resizeStopped();

      var width = document.body.clientWidth - pageX;
      this.element.style.width = width + 'px';
    }
  }, {
    key: 'show',
    value: function show() {
      this.element.classList.remove('hidden');
      this.visible = true;
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.element.classList.add('hidden');
      this.visible = false;
    }
  }]);

  return WatchSidebar;
})();

exports['default'] = WatchSidebar;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dhdGNoLXNpZGViYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7c0JBQzVCLFFBQVE7Ozs7eUJBRUEsY0FBYzs7Ozs2QkFDVixrQkFBa0I7Ozs7QUFONUMsV0FBVyxDQUFDOztJQVFTLFlBQVk7QUFDcEIsV0FEUSxZQUFZLENBQ25CLE1BQU0sRUFBRTs7OzBCQURELFlBQVk7O0FBRTdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDOztBQUV4RCxRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFdBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFMUMsUUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0RCxtQkFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5RCxtQkFBZSxDQUFDLFNBQVMsR0FB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SUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzFEOzs7V0FFWSx5QkFBRztBQUNkLGNBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzlELGNBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFWSx1QkFBQyxJQUFnQixFQUFFO1VBQWhCLEtBQUssR0FBUCxJQUFnQixDQUFkLEtBQUs7VUFBRSxLQUFLLEdBQWQsSUFBZ0IsQ0FBUCxLQUFLOztBQUMxQixVQUFJLEtBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUV0QyxVQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDaEQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFNLEtBQUssT0FBSSxDQUFDO0tBQ3pDOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNyQjs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7S0FDdEI7OztTQXhJa0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvd2F0Y2gtc2lkZWJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgV2F0Y2hWaWV3IGZyb20gJy4vd2F0Y2gtdmlldyc7XG5pbXBvcnQgV2F0Y2hlc1BpY2tlciBmcm9tICcuL3dhdGNoZXMtcGlja2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F0Y2hTaWRlYmFyIHtcbiAgY29uc3RydWN0b3Ioa2VybmVsKSB7XG4gICAgdGhpcy5yZXNpemVTdGFydGVkID0gdGhpcy5yZXNpemVTdGFydGVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXNpemVTdG9wcGVkID0gdGhpcy5yZXNpemVTdG9wcGVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXNpemVTaWRlYmFyID0gdGhpcy5yZXNpemVTaWRlYmFyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5rZXJuZWwgPSBrZXJuZWw7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2h5ZHJvZ2VuJywgJ3dhdGNoLXNpZGViYXInKTtcblxuICAgIGNvbnN0IHRvb2xiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sYmFyLmNsYXNzTGlzdC5hZGQoJ3Rvb2xiYXInLCAnYmxvY2snKTtcblxuICAgIGNvbnN0IGxhbmd1YWdlRGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxhbmd1YWdlRGlzcGxheS5jbGFzc0xpc3QuYWRkKCdsYW5ndWFnZScsICdpY29uJywgJ2ljb24tZXllJyk7XG4gICAgbGFuZ3VhZ2VEaXNwbGF5LmlubmVyVGV4dCA9IHRoaXMua2VybmVsLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lO1xuXG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgdG9nZ2xlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicsICdpY29uJywgJ2ljb24tcmVtb3ZlLWNsb3NlJyk7XG4gICAgdG9nZ2xlQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBjb25zdCBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdoeWRyb2dlbjp0b2dnbGUtd2F0Y2hlcycpO1xuICAgIH07XG5cbiAgICBjb25zdCB0b29sdGlwcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdG9vbHRpcHMuYWRkKGF0b20udG9vbHRpcHMuYWRkKHRvZ2dsZUJ1dHRvbiwgeyB0aXRsZTogJ1RvZ2dsZSBXYXRjaCBTaWRlYmFyJyB9KSk7XG5cbiAgICB0aGlzLndhdGNoZXNDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBfLmZvckVhY2godGhpcy53YXRjaFZpZXdzLCB3YXRjaCA9PiB0aGlzLndhdGNoZXNDb250YWluZXIuYXBwZW5kQ2hpbGQod2F0Y2guZWxlbWVudCkpO1xuXG4gICAgY29uc3QgYnV0dG9uR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBidXR0b25Hcm91cC5jbGFzc0xpc3QuYWRkKCdidG4tZ3JvdXAnKTtcbiAgICBjb25zdCBhZGRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBhZGRCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJywgJ2J0bi1wcmltYXJ5JywgJ2ljb24nLCAnaWNvbi1wbHVzJyk7XG4gICAgYWRkQnV0dG9uLmlubmVyVGV4dCA9ICdBZGQgd2F0Y2gnO1xuICAgIGFkZEJ1dHRvbi5vbmNsaWNrID0gKCkgPT4gdGhpcy5hZGRXYXRjaCgpO1xuXG4gICAgY29uc3QgcmVtb3ZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgcmVtb3ZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicsICdidG4tZXJyb3InLCAnaWNvbicsICdpY29uLXRyYXNoY2FuJyk7XG4gICAgcmVtb3ZlQnV0dG9uLmlubmVyVGV4dCA9ICdSZW1vdmUgd2F0Y2gnO1xuICAgIHJlbW92ZUJ1dHRvbi5vbmNsaWNrID0gKCkgPT4gdGhpcy5yZW1vdmVXYXRjaCgpO1xuXG4gICAgY29uc3QgcmVzaXplSGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcmVzaXplSGFuZGxlLmNsYXNzTGlzdC5hZGQoJ3dhdGNoLXJlc2l6ZS1oYW5kbGUnKTtcbiAgICByZXNpemVIYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5yZXNpemVTdGFydGVkKTtcblxuICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQobGFuZ3VhZ2VEaXNwbGF5KTtcbiAgICB0b29sYmFyLmFwcGVuZENoaWxkKHRvZ2dsZUJ1dHRvbik7XG4gICAgYnV0dG9uR3JvdXAuYXBwZW5kQ2hpbGQoYWRkQnV0dG9uKTtcbiAgICBidXR0b25Hcm91cC5hcHBlbmRDaGlsZChyZW1vdmVCdXR0b24pO1xuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRvb2xiYXIpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLndhdGNoZXNDb250YWluZXIpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25Hcm91cCk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHJlc2l6ZUhhbmRsZSk7XG5cbiAgICB0aGlzLmtlcm5lbC5hZGRXYXRjaENhbGxiYWNrKCgpID0+IHRoaXMucnVuKCkpO1xuXG4gICAgdGhpcy53YXRjaFZpZXdzID0gW107XG4gICAgdGhpcy5hZGRXYXRjaCgpO1xuXG4gICAgdGhpcy5oaWRlKCk7XG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7IGl0ZW06IHRoaXMuZWxlbWVudCB9KTtcbiAgfVxuXG4gIGNyZWF0ZVdhdGNoKCkge1xuICAgIGxldCB3YXRjaCA9IF8ubGFzdCh0aGlzLndhdGNoVmlld3MpO1xuICAgIGlmICghd2F0Y2ggfHwgd2F0Y2guZ2V0Q29kZSgpLnJlcGxhY2UoL1xccy9nLCAnJykgIT09ICcnKSB7XG4gICAgICB3YXRjaCA9IG5ldyBXYXRjaFZpZXcodGhpcy5rZXJuZWwpO1xuICAgICAgdGhpcy53YXRjaFZpZXdzLnB1c2god2F0Y2gpO1xuICAgICAgdGhpcy53YXRjaGVzQ29udGFpbmVyLmFwcGVuZENoaWxkKHdhdGNoLmVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gd2F0Y2g7XG4gIH1cblxuICBhZGRXYXRjaCgpIHtcbiAgICB0aGlzLmNyZWF0ZVdhdGNoKCkuZm9jdXMoKTtcbiAgfVxuXG4gIGFkZFdhdGNoRnJvbUVkaXRvcigpIHtcbiAgICBjb25zdCB3YXRjaFRleHQgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0U2VsZWN0ZWRUZXh0KCk7XG4gICAgaWYgKCF3YXRjaFRleHQpIHtcbiAgICAgIHRoaXMuYWRkV2F0Y2goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgd2F0Y2ggPSB0aGlzLmNyZWF0ZVdhdGNoKCk7XG4gICAgICB3YXRjaC5zZXRDb2RlKHdhdGNoVGV4dCk7XG4gICAgICB3YXRjaC5ydW4oKTtcbiAgICB9XG4gICAgdGhpcy5zaG93KCk7XG4gIH1cblxuICByZW1vdmVXYXRjaCgpIHtcbiAgICBjb25zdCB3YXRjaGVzID0gdGhpcy53YXRjaFZpZXdzLm1hcCgodiwgaykgPT4gKHtcbiAgICAgIG5hbWU6IHYuZ2V0Q29kZSgpLFxuICAgICAgdmFsdWU6IGssXG4gICAgfSkpO1xuICAgIFdhdGNoZXNQaWNrZXIub25Db25maXJtZWQgPSAoaXRlbSkgPT4ge1xuICAgICAgdGhpcy53YXRjaFZpZXdzW2l0ZW0udmFsdWVdLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMud2F0Y2hWaWV3cy5zcGxpY2UoaXRlbS52YWx1ZSwgMSk7XG4gICAgICBpZiAodGhpcy53YXRjaFZpZXdzLmxlbmd0aCA9PT0gMCkgdGhpcy5hZGRXYXRjaCgpO1xuICAgIH07XG4gICAgV2F0Y2hlc1BpY2tlci5zZXRJdGVtcyh3YXRjaGVzKTtcbiAgICBXYXRjaGVzUGlja2VyLnRvZ2dsZSgpO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgIF8uZm9yRWFjaCh0aGlzLndhdGNoVmlld3MsIHdhdGNoVmlldyA9PiB3YXRjaFZpZXcucnVuKCkpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2l6ZVN0YXJ0ZWQoKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVTaWRlYmFyKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5yZXNpemVTdG9wcGVkKTtcbiAgfVxuXG4gIHJlc2l6ZVN0b3BwZWQoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVTaWRlYmFyKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5yZXNpemVTdG9wcGVkKTtcbiAgfVxuXG4gIHJlc2l6ZVNpZGViYXIoeyBwYWdlWCwgd2hpY2ggfSkge1xuICAgIGlmICh3aGljaCAhPT0gMSkgdGhpcy5yZXNpemVTdG9wcGVkKCk7XG5cbiAgICBjb25zdCB3aWR0aCA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggLSBwYWdlWDtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gIH1cbn1cbiJdfQ==