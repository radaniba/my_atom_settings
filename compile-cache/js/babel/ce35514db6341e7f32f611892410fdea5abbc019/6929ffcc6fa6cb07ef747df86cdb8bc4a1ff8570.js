Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _uiBottomPanel = require('./ui/bottom-panel');

var _uiBottomPanel2 = _interopRequireDefault(_uiBottomPanel);

var _uiBottomContainer = require('./ui/bottom-container');

var _uiBottomContainer2 = _interopRequireDefault(_uiBottomContainer);

var _uiMessageElement = require('./ui/message-element');

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _uiMessageBubble = require('./ui/message-bubble');

'use babel';

var LinterViews = (function () {
  function LinterViews(scope, editorRegistry) {
    var _this = this;

    _classCallCheck(this, LinterViews);

    this.subscriptions = new _atom.CompositeDisposable();
    this.emitter = new _atom.Emitter();
    this.bottomPanel = new _uiBottomPanel2['default'](scope);
    this.bottomContainer = _uiBottomContainer2['default'].create(scope);
    this.editors = editorRegistry;
    this.bottomBar = null; // To be added when status-bar service is consumed
    this.bubble = null;
    this.bubbleRange = null;

    this.subscriptions.add(this.bottomPanel);
    this.subscriptions.add(this.bottomContainer);
    this.subscriptions.add(this.emitter);

    this.count = {
      Line: 0,
      File: 0,
      Project: 0
    };
    this.messages = [];
    this.subscriptions.add(atom.config.observe('linter.showErrorInline', function (showBubble) {
      return _this.showBubble = showBubble;
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (paneItem) {
      var isEditor = false;
      _this.editors.forEach(function (editorLinter) {
        isEditor = (editorLinter.active = editorLinter.editor === paneItem) || isEditor;
      });
      _this.updateCounts();
      _this.bottomPanel.refresh();
      _this.bottomContainer.visibility = isEditor;
    }));
    this.subscriptions.add(this.bottomContainer.onDidChangeTab(function (scope) {
      _this.emitter.emit('did-update-scope', scope);
      atom.config.set('linter.showErrorPanel', true);
      _this.bottomPanel.refresh(scope);
    }));
    this.subscriptions.add(this.bottomContainer.onShouldTogglePanel(function () {
      atom.config.set('linter.showErrorPanel', !atom.config.get('linter.showErrorPanel'));
    }));

    this._renderBubble = this.renderBubble;
    this.subscriptions.add(atom.config.observe('linter.inlineTooltipInterval', function (bubbleInterval) {
      return _this.renderBubble = _helpers2['default'].debounce(_this._renderBubble, bubbleInterval);
    }));
  }

  _createClass(LinterViews, [{
    key: 'render',
    value: function render(_ref) {
      var added = _ref.added;
      var removed = _ref.removed;
      var messages = _ref.messages;

      this.messages = messages;
      this.notifyEditorLinters({ added: added, removed: removed });
      this.bottomPanel.setMessages({ added: added, removed: removed });
      this.updateCounts();
    }
  }, {
    key: 'updateCounts',
    value: function updateCounts() {
      var activeEditorLinter = this.editors.ofActiveTextEditor();

      this.count.Project = this.messages.length;
      this.count.File = activeEditorLinter ? activeEditorLinter.getMessages().size : 0;
      this.count.Line = activeEditorLinter ? activeEditorLinter.countLineMessages : 0;
      this.bottomContainer.setCount(this.count);
    }
  }, {
    key: 'renderBubble',
    value: function renderBubble(editorLinter) {
      var _this2 = this;

      if (!this.showBubble || !editorLinter.messages.size) {
        this.removeBubble();
        return;
      }
      var point = editorLinter.editor.getCursorBufferPosition();
      if (this.bubbleRange && this.bubbleRange.containsPoint(point)) {
        return; // The marker remains the same
      }
      this.removeBubble();
      for (var message of editorLinter.messages) {
        if (message.range && message.range.containsPoint(point)) {
          this.bubbleRange = _atom.Range.fromObject([point, point]);
          this.bubble = editorLinter.editor.markBufferRange(this.bubbleRange, { invalidate: 'inside' });
          this.bubble.onDidDestroy(function () {
            _this2.bubble = null;
            _this2.bubbleRange = null;
          });
          editorLinter.editor.decorateMarker(this.bubble, {
            type: 'overlay',
            item: (0, _uiMessageBubble.create)(message)
          });
          return;
        }
      }
      this.bubbleRange = null;
    }
  }, {
    key: 'removeBubble',
    value: function removeBubble() {
      if (this.bubble) {
        this.bubble.destroy();
      }
    }
  }, {
    key: 'notifyEditorLinters',
    value: function notifyEditorLinters(_ref2) {
      var _this3 = this;

      var added = _ref2.added;
      var removed = _ref2.removed;

      var editorLinter = undefined;
      removed.forEach(function (message) {
        if (message.filePath && (editorLinter = _this3.editors.ofPath(message.filePath))) {
          editorLinter.deleteMessage(message);
        }
      });
      added.forEach(function (message) {
        if (message.filePath && (editorLinter = _this3.editors.ofPath(message.filePath))) {
          editorLinter.addMessage(message);
        }
      });
      editorLinter = this.editors.ofActiveTextEditor();
      if (editorLinter) {
        editorLinter.calculateLineMessages(null);
        this.renderBubble(editorLinter);
      } else {
        this.removeBubble();
      }
    }
  }, {
    key: 'notifyEditorLinter',
    value: function notifyEditorLinter(editorLinter) {
      var path = editorLinter.editor.getPath();
      if (!path) return;
      this.messages.forEach(function (message) {
        if (message.filePath && message.filePath === path) {
          editorLinter.addMessage(message);
        }
      });
    }
  }, {
    key: 'attachBottom',
    value: function attachBottom(statusBar) {
      var _this4 = this;

      this.subscriptions.add(atom.config.observe('linter.statusIconPosition', function (position) {
        if (_this4.bottomBar) {
          _this4.bottomBar.destroy();
        }
        _this4.bottomBar = statusBar['add' + position + 'Tile']({
          item: _this4.bottomContainer,
          priority: position === 'Left' ? -100 : 100
        });
      }));
    }
  }, {
    key: 'onDidUpdateScope',
    value: function onDidUpdateScope(callback) {
      return this.emitter.on('did-update-scope', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      // No need to notify editors of this, we're being disposed means the package is
      // being deactivated. They'll be disposed automatically by the registry.
      this.subscriptions.dispose();
      if (this.bottomBar) {
        this.bottomBar.destroy();
      }
      if (this.bubble) {
        this.bubble.destroy();
        this.bubbleRange = null;
      }
    }
  }]);

  return LinterViews;
})();

exports['default'] = LinterViews;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9saW50ZXItdmlld3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0QsTUFBTTs7NkJBQ2hDLG1CQUFtQjs7OztpQ0FDZix1QkFBdUI7Ozs7Z0NBQzdCLHNCQUFzQjs7dUJBQ3hCLFdBQVc7Ozs7K0JBQ00scUJBQXFCOztBQVAxRCxXQUFXLENBQUE7O0lBU1UsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFLGNBQWMsRUFBRTs7OzBCQURoQixXQUFXOztBQUU1QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUFnQixLQUFLLENBQUMsQ0FBQTtBQUN6QyxRQUFJLENBQUMsZUFBZSxHQUFHLCtCQUFnQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEQsUUFBSSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUE7QUFDN0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7O0FBRXZCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUN4QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDNUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVwQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsVUFBSSxFQUFFLENBQUM7QUFDUCxVQUFJLEVBQUUsQ0FBQztBQUNQLGFBQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQTtBQUNELFFB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LENBQUMsQ0FBQTtLQUNyRDs7O1dBQ00sbUJBQUc7OztBQUdSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLFlBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDekI7QUFDRCxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixZQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3JCLFlBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO09BQ3hCO0tBQ0Y7OztTQXBKa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2xpbnRlci12aWV3cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9IGZyb20gJ2F0b20nXG5pbXBvcnQgQm90dG9tUGFuZWwgZnJvbSAnLi91aS9ib3R0b20tcGFuZWwnXG5pbXBvcnQgQm90dG9tQ29udGFpbmVyIGZyb20gJy4vdWkvYm90dG9tLWNvbnRhaW5lcidcbmltcG9ydCB7TWVzc2FnZX0gZnJvbSAnLi91aS9tZXNzYWdlLWVsZW1lbnQnXG5pbXBvcnQgSGVscGVycyBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQge2NyZWF0ZSBhcyBjcmVhdGVCdWJibGV9IGZyb20gJy4vdWkvbWVzc2FnZS1idWJibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbnRlclZpZXdzIHtcbiAgY29uc3RydWN0b3Ioc2NvcGUsIGVkaXRvclJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmJvdHRvbVBhbmVsID0gbmV3IEJvdHRvbVBhbmVsKHNjb3BlKVxuICAgIHRoaXMuYm90dG9tQ29udGFpbmVyID0gQm90dG9tQ29udGFpbmVyLmNyZWF0ZShzY29wZSlcbiAgICB0aGlzLmVkaXRvcnMgPSBlZGl0b3JSZWdpc3RyeVxuICAgIHRoaXMuYm90dG9tQmFyID0gbnVsbCAvLyBUbyBiZSBhZGRlZCB3aGVuIHN0YXR1cy1iYXIgc2VydmljZSBpcyBjb25zdW1lZFxuICAgIHRoaXMuYnViYmxlID0gbnVsbFxuICAgIHRoaXMuYnViYmxlUmFuZ2UgPSBudWxsXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYm90dG9tUGFuZWwpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbUNvbnRhaW5lcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcblxuICAgIHRoaXMuY291bnQgPSB7XG4gICAgICBMaW5lOiAwLFxuICAgICAgRmlsZTogMCxcbiAgICAgIFByb2plY3Q6IDBcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc2hvd0Vycm9ySW5saW5lJywgc2hvd0J1YmJsZSA9PlxuICAgICAgdGhpcy5zaG93QnViYmxlID0gc2hvd0J1YmJsZVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHBhbmVJdGVtID0+IHtcbiAgICAgIGxldCBpc0VkaXRvciA9IGZhbHNlXG4gICAgICB0aGlzLmVkaXRvcnMuZm9yRWFjaChmdW5jdGlvbihlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgaXNFZGl0b3IgPSAoZWRpdG9yTGludGVyLmFjdGl2ZSA9IGVkaXRvckxpbnRlci5lZGl0b3IgPT09IHBhbmVJdGVtKSB8fCBpc0VkaXRvclxuICAgICAgfSlcbiAgICAgIHRoaXMudXBkYXRlQ291bnRzKClcbiAgICAgIHRoaXMuYm90dG9tUGFuZWwucmVmcmVzaCgpXG4gICAgICB0aGlzLmJvdHRvbUNvbnRhaW5lci52aXNpYmlsaXR5ID0gaXNFZGl0b3JcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYm90dG9tQ29udGFpbmVyLm9uRGlkQ2hhbmdlVGFiKHNjb3BlID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlLXNjb3BlJywgc2NvcGUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5zaG93RXJyb3JQYW5lbCcsIHRydWUpXG4gICAgICB0aGlzLmJvdHRvbVBhbmVsLnJlZnJlc2goc2NvcGUpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbUNvbnRhaW5lci5vblNob3VsZFRvZ2dsZVBhbmVsKGZ1bmN0aW9uKCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnLCAhYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnKSlcbiAgICB9KSlcblxuICAgIHRoaXMuX3JlbmRlckJ1YmJsZSA9IHRoaXMucmVuZGVyQnViYmxlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaW5saW5lVG9vbHRpcEludGVydmFsJywgYnViYmxlSW50ZXJ2YWwgPT5cbiAgICAgIHRoaXMucmVuZGVyQnViYmxlID0gSGVscGVycy5kZWJvdW5jZSh0aGlzLl9yZW5kZXJCdWJibGUsIGJ1YmJsZUludGVydmFsKVxuICAgICkpXG4gIH1cbiAgcmVuZGVyKHthZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXN9KSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgdGhpcy5ub3RpZnlFZGl0b3JMaW50ZXJzKHthZGRlZCwgcmVtb3ZlZH0pXG4gICAgdGhpcy5ib3R0b21QYW5lbC5zZXRNZXNzYWdlcyh7YWRkZWQsIHJlbW92ZWR9KVxuICAgIHRoaXMudXBkYXRlQ291bnRzKClcbiAgfVxuICB1cGRhdGVDb3VudHMoKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mQWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICB0aGlzLmNvdW50LlByb2plY3QgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aFxuICAgIHRoaXMuY291bnQuRmlsZSA9IGFjdGl2ZUVkaXRvckxpbnRlciA/IGFjdGl2ZUVkaXRvckxpbnRlci5nZXRNZXNzYWdlcygpLnNpemUgOiAwXG4gICAgdGhpcy5jb3VudC5MaW5lID0gYWN0aXZlRWRpdG9yTGludGVyID8gYWN0aXZlRWRpdG9yTGludGVyLmNvdW50TGluZU1lc3NhZ2VzIDogMFxuICAgIHRoaXMuYm90dG9tQ29udGFpbmVyLnNldENvdW50KHRoaXMuY291bnQpXG4gIH1cbiAgcmVuZGVyQnViYmxlKGVkaXRvckxpbnRlcikge1xuICAgIGlmICghdGhpcy5zaG93QnViYmxlIHx8ICFlZGl0b3JMaW50ZXIubWVzc2FnZXMuc2l6ZSkge1xuICAgICAgdGhpcy5yZW1vdmVCdWJibGUoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBvaW50ID0gZWRpdG9yTGludGVyLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMuYnViYmxlUmFuZ2UgJiYgdGhpcy5idWJibGVSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSkge1xuICAgICAgcmV0dXJuIC8vIFRoZSBtYXJrZXIgcmVtYWlucyB0aGUgc2FtZVxuICAgIH1cbiAgICB0aGlzLnJlbW92ZUJ1YmJsZSgpXG4gICAgZm9yIChsZXQgbWVzc2FnZSBvZiBlZGl0b3JMaW50ZXIubWVzc2FnZXMpIHtcbiAgICAgIGlmIChtZXNzYWdlLnJhbmdlICYmIG1lc3NhZ2UucmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkpIHtcbiAgICAgICAgdGhpcy5idWJibGVSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW3BvaW50LCBwb2ludF0pXG4gICAgICAgIHRoaXMuYnViYmxlID0gZWRpdG9yTGludGVyLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UodGhpcy5idWJibGVSYW5nZSwge2ludmFsaWRhdGU6ICdpbnNpZGUnfSlcbiAgICAgICAgdGhpcy5idWJibGUub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1YmJsZSA9IG51bGxcbiAgICAgICAgICB0aGlzLmJ1YmJsZVJhbmdlID0gbnVsbFxuICAgICAgICB9KVxuICAgICAgICBlZGl0b3JMaW50ZXIuZWRpdG9yLmRlY29yYXRlTWFya2VyKHRoaXMuYnViYmxlLCB7XG4gICAgICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgICAgIGl0ZW06IGNyZWF0ZUJ1YmJsZShtZXNzYWdlKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5idWJibGVSYW5nZSA9IG51bGxcbiAgfVxuICByZW1vdmVCdWJibGUoKSB7XG4gICAgaWYgKHRoaXMuYnViYmxlKSB7XG4gICAgICB0aGlzLmJ1YmJsZS5kZXN0cm95KClcbiAgICB9XG4gIH1cbiAgbm90aWZ5RWRpdG9yTGludGVycyh7YWRkZWQsIHJlbW92ZWR9KSB7XG4gICAgbGV0IGVkaXRvckxpbnRlclxuICAgIHJlbW92ZWQuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmZpbGVQYXRoICYmIChlZGl0b3JMaW50ZXIgPSB0aGlzLmVkaXRvcnMub2ZQYXRoKG1lc3NhZ2UuZmlsZVBhdGgpKSkge1xuICAgICAgICBlZGl0b3JMaW50ZXIuZGVsZXRlTWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG4gICAgYWRkZWQuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmZpbGVQYXRoICYmIChlZGl0b3JMaW50ZXIgPSB0aGlzLmVkaXRvcnMub2ZQYXRoKG1lc3NhZ2UuZmlsZVBhdGgpKSkge1xuICAgICAgICBlZGl0b3JMaW50ZXIuYWRkTWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG4gICAgZWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKGVkaXRvckxpbnRlcikge1xuICAgICAgZWRpdG9yTGludGVyLmNhbGN1bGF0ZUxpbmVNZXNzYWdlcyhudWxsKVxuICAgICAgdGhpcy5yZW5kZXJCdWJibGUoZWRpdG9yTGludGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUJ1YmJsZSgpXG4gICAgfVxuICB9XG4gIG5vdGlmeUVkaXRvckxpbnRlcihlZGl0b3JMaW50ZXIpIHtcbiAgICBjb25zdCBwYXRoID0gZWRpdG9yTGludGVyLmVkaXRvci5nZXRQYXRoKClcbiAgICBpZiAoIXBhdGgpIHJldHVyblxuICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICBpZiAobWVzc2FnZS5maWxlUGF0aCAmJiBtZXNzYWdlLmZpbGVQYXRoID09PSBwYXRoKSB7XG4gICAgICAgIGVkaXRvckxpbnRlci5hZGRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBhdHRhY2hCb3R0b20oc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc3RhdHVzSWNvblBvc2l0aW9uJywgcG9zaXRpb24gPT4ge1xuICAgICAgaWYgKHRoaXMuYm90dG9tQmFyKSB7XG4gICAgICAgIHRoaXMuYm90dG9tQmFyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgICAgdGhpcy5ib3R0b21CYXIgPSBzdGF0dXNCYXJbYGFkZCR7cG9zaXRpb259VGlsZWBdKHtcbiAgICAgICAgaXRlbTogdGhpcy5ib3R0b21Db250YWluZXIsXG4gICAgICAgIHByaW9yaXR5OiBwb3NpdGlvbiA9PT0gJ0xlZnQnID8gLTEwMCA6IDEwMFxuICAgICAgfSlcbiAgICB9KSlcbiAgfVxuXG4gIG9uRGlkVXBkYXRlU2NvcGUoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlLXNjb3BlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBObyBuZWVkIHRvIG5vdGlmeSBlZGl0b3JzIG9mIHRoaXMsIHdlJ3JlIGJlaW5nIGRpc3Bvc2VkIG1lYW5zIHRoZSBwYWNrYWdlIGlzXG4gICAgLy8gYmVpbmcgZGVhY3RpdmF0ZWQuIFRoZXknbGwgYmUgZGlzcG9zZWQgYXV0b21hdGljYWxseSBieSB0aGUgcmVnaXN0cnkuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmJvdHRvbUJhcikge1xuICAgICAgdGhpcy5ib3R0b21CYXIuZGVzdHJveSgpXG4gICAgfVxuICAgIGlmICh0aGlzLmJ1YmJsZSkge1xuICAgICAgdGhpcy5idWJibGUuZGVzdHJveSgpXG4gICAgICB0aGlzLmJ1YmJsZVJhbmdlID0gbnVsbFxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/Users/Rad/.atom/packages/linter/lib/linter-views.js
