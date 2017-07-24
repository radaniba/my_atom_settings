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
      if (this.bubble && editorLinter.messages.has(this.bubble.message) && this.bubble.range.containsPoint(point)) {
        return; // The marker remains the same
      }
      this.removeBubble();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = editorLinter.messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var message = _step.value;

          if (message.range && message.range.containsPoint(point)) {
            var range = _atom.Range.fromObject([point, point]);
            var marker = editorLinter.editor.markBufferRange(range, { invalidate: 'inside' });
            this.bubble = { message: message, range: range, marker: marker };
            marker.onDidDestroy(function () {
              _this2.bubble = null;
            });
            editorLinter.editor.decorateMarker(marker, {
              type: 'overlay',
              item: (0, _uiMessageBubble.create)(message)
            });
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'removeBubble',
    value: function removeBubble() {
      if (this.bubble) {
        this.bubble.marker.destroy();
        this.bubble = null;
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
      this.removeBubble();
    }
  }]);

  return LinterViews;
})();

exports['default'] = LinterViews;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9saW50ZXItdmlld3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0QsTUFBTTs7NkJBQ2hDLG1CQUFtQjs7OztpQ0FDZix1QkFBdUI7Ozs7Z0NBQzdCLHNCQUFzQjs7dUJBQ3hCLFdBQVc7Ozs7K0JBQ00scUJBQXFCOztBQVAxRCxXQUFXLENBQUE7O0lBU1UsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFLGNBQWMsRUFBRTs7OzBCQURoQixXQUFXOztBQUU1QixRQUFJLENBQUMsYUFBYSxHQUFHLFVBVFIsbUJBQW1CLEVBU2MsQ0FBQTtBQUM5QyxRQUFJLENBQUMsT0FBTyxHQUFHLFVBVlgsT0FBTyxFQVVpQixDQUFBO0FBQzVCLFFBQUksQ0FBQyxXQUFXLEdBQUcsK0JBQWdCLEtBQUssQ0FBQyxDQUFBO0FBQ3pDLFFBQUksQ0FBQyxlQUFlLEdBQUcsK0JBQWdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNwRCxRQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQTtBQUM3QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3hDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7O0FBRXBDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxVQUFJLEVBQUUsQ0FBQztBQUNQLFVBQUksRUFBRSxDQUFDO0FBQ1AsYUFBTyxFQUFFLENBQUM7S0FDWCxDQUFBO0FBQ0QsUUFBSSxDQUFDLFFBQVEsR0FB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QUFDLEdBQUcsR0FBRyxHQUFHO1NBQzNDLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztXQUVlLDBCQUFDLFFBQVEsRUFBRTtBQUN6QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3JEOzs7V0FDTSxtQkFBRzs7O0FBR1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUN6QjtBQUNELFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUNwQjs7O1NBaEprQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXZpZXdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBCb3R0b21QYW5lbCBmcm9tICcuL3VpL2JvdHRvbS1wYW5lbCdcbmltcG9ydCBCb3R0b21Db250YWluZXIgZnJvbSAnLi91aS9ib3R0b20tY29udGFpbmVyJ1xuaW1wb3J0IHtNZXNzYWdlfSBmcm9tICcuL3VpL21lc3NhZ2UtZWxlbWVudCdcbmltcG9ydCBIZWxwZXJzIGZyb20gJy4vaGVscGVycydcbmltcG9ydCB7Y3JlYXRlIGFzIGNyZWF0ZUJ1YmJsZX0gZnJvbSAnLi91aS9tZXNzYWdlLWJ1YmJsZSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGludGVyVmlld3Mge1xuICBjb25zdHJ1Y3RvcihzY29wZSwgZWRpdG9yUmVnaXN0cnkpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuYm90dG9tUGFuZWwgPSBuZXcgQm90dG9tUGFuZWwoc2NvcGUpXG4gICAgdGhpcy5ib3R0b21Db250YWluZXIgPSBCb3R0b21Db250YWluZXIuY3JlYXRlKHNjb3BlKVxuICAgIHRoaXMuZWRpdG9ycyA9IGVkaXRvclJlZ2lzdHJ5XG4gICAgdGhpcy5ib3R0b21CYXIgPSBudWxsIC8vIFRvIGJlIGFkZGVkIHdoZW4gc3RhdHVzLWJhciBzZXJ2aWNlIGlzIGNvbnN1bWVkXG4gICAgdGhpcy5idWJibGUgPSBudWxsXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYm90dG9tUGFuZWwpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbUNvbnRhaW5lcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcblxuICAgIHRoaXMuY291bnQgPSB7XG4gICAgICBMaW5lOiAwLFxuICAgICAgRmlsZTogMCxcbiAgICAgIFByb2plY3Q6IDBcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc2hvd0Vycm9ySW5saW5lJywgc2hvd0J1YmJsZSA9PlxuICAgICAgdGhpcy5zaG93QnViYmxlID0gc2hvd0J1YmJsZVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHBhbmVJdGVtID0+IHtcbiAgICAgIGxldCBpc0VkaXRvciA9IGZhbHNlXG4gICAgICB0aGlzLmVkaXRvcnMuZm9yRWFjaChmdW5jdGlvbihlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgaXNFZGl0b3IgPSAoZWRpdG9yTGludGVyLmFjdGl2ZSA9IGVkaXRvckxpbnRlci5lZGl0b3IgPT09IHBhbmVJdGVtKSB8fCBpc0VkaXRvclxuICAgICAgfSlcbiAgICAgIHRoaXMudXBkYXRlQ291bnRzKClcbiAgICAgIHRoaXMuYm90dG9tUGFuZWwucmVmcmVzaCgpXG4gICAgICB0aGlzLmJvdHRvbUNvbnRhaW5lci52aXNpYmlsaXR5ID0gaXNFZGl0b3JcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYm90dG9tQ29udGFpbmVyLm9uRGlkQ2hhbmdlVGFiKHNjb3BlID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlLXNjb3BlJywgc2NvcGUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5zaG93RXJyb3JQYW5lbCcsIHRydWUpXG4gICAgICB0aGlzLmJvdHRvbVBhbmVsLnJlZnJlc2goc2NvcGUpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbUNvbnRhaW5lci5vblNob3VsZFRvZ2dsZVBhbmVsKGZ1bmN0aW9uKCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnLCAhYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnKSlcbiAgICB9KSlcblxuICAgIHRoaXMuX3JlbmRlckJ1YmJsZSA9IHRoaXMucmVuZGVyQnViYmxlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaW5saW5lVG9vbHRpcEludGVydmFsJywgYnViYmxlSW50ZXJ2YWwgPT5cbiAgICAgIHRoaXMucmVuZGVyQnViYmxlID0gSGVscGVycy5kZWJvdW5jZSh0aGlzLl9yZW5kZXJCdWJibGUsIGJ1YmJsZUludGVydmFsKVxuICAgICkpXG4gIH1cbiAgcmVuZGVyKHthZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXN9KSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgdGhpcy5ub3RpZnlFZGl0b3JMaW50ZXJzKHthZGRlZCwgcmVtb3ZlZH0pXG4gICAgdGhpcy5ib3R0b21QYW5lbC5zZXRNZXNzYWdlcyh7YWRkZWQsIHJlbW92ZWR9KVxuICAgIHRoaXMudXBkYXRlQ291bnRzKClcbiAgfVxuICB1cGRhdGVDb3VudHMoKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mQWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICB0aGlzLmNvdW50LlByb2plY3QgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aFxuICAgIHRoaXMuY291bnQuRmlsZSA9IGFjdGl2ZUVkaXRvckxpbnRlciA/IGFjdGl2ZUVkaXRvckxpbnRlci5nZXRNZXNzYWdlcygpLnNpemUgOiAwXG4gICAgdGhpcy5jb3VudC5MaW5lID0gYWN0aXZlRWRpdG9yTGludGVyID8gYWN0aXZlRWRpdG9yTGludGVyLmNvdW50TGluZU1lc3NhZ2VzIDogMFxuICAgIHRoaXMuYm90dG9tQ29udGFpbmVyLnNldENvdW50KHRoaXMuY291bnQpXG4gIH1cbiAgcmVuZGVyQnViYmxlKGVkaXRvckxpbnRlcikge1xuICAgIGlmICghdGhpcy5zaG93QnViYmxlIHx8ICFlZGl0b3JMaW50ZXIubWVzc2FnZXMuc2l6ZSkge1xuICAgICAgdGhpcy5yZW1vdmVCdWJibGUoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBvaW50ID0gZWRpdG9yTGludGVyLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMuYnViYmxlICYmIGVkaXRvckxpbnRlci5tZXNzYWdlcy5oYXModGhpcy5idWJibGUubWVzc2FnZSkgJiYgdGhpcy5idWJibGUucmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkpIHtcbiAgICAgIHJldHVybiAvLyBUaGUgbWFya2VyIHJlbWFpbnMgdGhlIHNhbWVcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVCdWJibGUoKVxuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgZWRpdG9yTGludGVyLm1lc3NhZ2VzKSB7XG4gICAgICBpZiAobWVzc2FnZS5yYW5nZSAmJiBtZXNzYWdlLnJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbcG9pbnQsIHBvaW50XSlcbiAgICAgICAgY29uc3QgbWFya2VyID0gZWRpdG9yTGludGVyLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnaW5zaWRlJ30pXG4gICAgICAgIHRoaXMuYnViYmxlID0ge21lc3NhZ2UsIHJhbmdlLCBtYXJrZXJ9XG4gICAgICAgIG1hcmtlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIHRoaXMuYnViYmxlID0gbnVsbFxuICAgICAgICB9KVxuICAgICAgICBlZGl0b3JMaW50ZXIuZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICBpdGVtOiBjcmVhdGVCdWJibGUobWVzc2FnZSlcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmVtb3ZlQnViYmxlKCkge1xuICAgIGlmICh0aGlzLmJ1YmJsZSkge1xuICAgICAgdGhpcy5idWJibGUubWFya2VyLmRlc3Ryb3koKVxuICAgICAgdGhpcy5idWJibGUgPSBudWxsXG4gICAgfVxuICB9XG4gIG5vdGlmeUVkaXRvckxpbnRlcnMoe2FkZGVkLCByZW1vdmVkfSkge1xuICAgIGxldCBlZGl0b3JMaW50ZXJcbiAgICByZW1vdmVkLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS5maWxlUGF0aCAmJiAoZWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mUGF0aChtZXNzYWdlLmZpbGVQYXRoKSkpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLmRlbGV0ZU1lc3NhZ2UobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGFkZGVkLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS5maWxlUGF0aCAmJiAoZWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mUGF0aChtZXNzYWdlLmZpbGVQYXRoKSkpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLmFkZE1lc3NhZ2UobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGVkaXRvckxpbnRlciA9IHRoaXMuZWRpdG9ycy5vZkFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIChlZGl0b3JMaW50ZXIpIHtcbiAgICAgIGVkaXRvckxpbnRlci5jYWxjdWxhdGVMaW5lTWVzc2FnZXMobnVsbClcbiAgICAgIHRoaXMucmVuZGVyQnViYmxlKGVkaXRvckxpbnRlcilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVCdWJibGUoKVxuICAgIH1cbiAgfVxuICBub3RpZnlFZGl0b3JMaW50ZXIoZWRpdG9yTGludGVyKSB7XG4gICAgY29uc3QgcGF0aCA9IGVkaXRvckxpbnRlci5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgaWYgKCFwYXRoKSByZXR1cm5cbiAgICB0aGlzLm1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgaWYgKG1lc3NhZ2UuZmlsZVBhdGggJiYgbWVzc2FnZS5maWxlUGF0aCA9PT0gcGF0aCkge1xuICAgICAgICBlZGl0b3JMaW50ZXIuYWRkTWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgYXR0YWNoQm90dG9tKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLnN0YXR1c0ljb25Qb3NpdGlvbicsIHBvc2l0aW9uID0+IHtcbiAgICAgIGlmICh0aGlzLmJvdHRvbUJhcikge1xuICAgICAgICB0aGlzLmJvdHRvbUJhci5kZXN0cm95KClcbiAgICAgIH1cbiAgICAgIHRoaXMuYm90dG9tQmFyID0gc3RhdHVzQmFyW2BhZGQke3Bvc2l0aW9ufVRpbGVgXSh7XG4gICAgICAgIGl0ZW06IHRoaXMuYm90dG9tQ29udGFpbmVyLFxuICAgICAgICBwcmlvcml0eTogcG9zaXRpb24gPT09ICdMZWZ0JyA/IC0xMDAgOiAxMDBcbiAgICAgIH0pXG4gICAgfSkpXG4gIH1cblxuICBvbkRpZFVwZGF0ZVNjb3BlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZS1zY29wZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgLy8gTm8gbmVlZCB0byBub3RpZnkgZWRpdG9ycyBvZiB0aGlzLCB3ZSdyZSBiZWluZyBkaXNwb3NlZCBtZWFucyB0aGUgcGFja2FnZSBpc1xuICAgIC8vIGJlaW5nIGRlYWN0aXZhdGVkLiBUaGV5J2xsIGJlIGRpc3Bvc2VkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIHJlZ2lzdHJ5LlxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBpZiAodGhpcy5ib3R0b21CYXIpIHtcbiAgICAgIHRoaXMuYm90dG9tQmFyLmRlc3Ryb3koKVxuICAgIH1cbiAgICB0aGlzLnJlbW92ZUJ1YmJsZSgpXG4gIH1cbn1cbiJdfQ==