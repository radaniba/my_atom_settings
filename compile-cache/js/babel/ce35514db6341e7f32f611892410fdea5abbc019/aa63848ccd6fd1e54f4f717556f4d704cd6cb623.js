var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('../helpers');

var PanelDelegate = (function () {
  function PanelDelegate(panel) {
    var _this = this;

    _classCallCheck(this, PanelDelegate);

    this.panel = panel;
    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter-ui-default.panelRepresents', function (panelRepresents) {
      var notInitial = typeof _this.panelRepresents !== 'undefined';
      _this.panelRepresents = panelRepresents;
      if (notInitial) {
        _this.update();
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.panelHeight', function (panelHeight) {
      var notInitial = typeof _this.panelHeight !== 'undefined';
      _this.panelHeight = panelHeight;
      if (notInitial) {
        _this.emitter.emit('observe-panel-config');
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.panelTakesMinimumHeight', function (panelTakesMinimumHeight) {
      var notInitial = typeof _this.panelTakesMinimumHeight !== 'undefined';
      _this.panelTakesMinimumHeight = panelTakesMinimumHeight;
      if (notInitial) {
        _this.emitter.emit('observe-panel-config');
      }
    }));

    var changeSubscription = undefined;
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      if (changeSubscription) {
        changeSubscription.dispose();
        changeSubscription = null;
      }
      _this.visibility = atom.workspace.isTextEditor(paneItem);
      _this.emitter.emit('observe-visibility', _this.visibility);
      if (_this.visibility) {
        (function () {
          if (_this.panelRepresents !== 'Entire Project') {
            _this.update();
          }
          var oldRow = -1;
          changeSubscription = paneItem.onDidChangeCursorPosition(function (_ref) {
            var newBufferPosition = _ref.newBufferPosition;

            if (oldRow !== newBufferPosition.row && _this.panelRepresents === 'Current Line') {
              oldRow = newBufferPosition.row;
              _this.update();
            }
          });
        })();
      }
      var shouldUpdate = typeof _this.visibility !== 'undefined' && _this.panelRepresents !== 'Entire Project';

      if (_this.visibility && shouldUpdate) {
        _this.update();
      }
    }));
    this.subscriptions.add(new _atom.Disposable(function () {
      if (changeSubscription) {
        changeSubscription.dispose();
      }
    }));
  }

  _createClass(PanelDelegate, [{
    key: 'update',
    value: function update() {
      var messages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (Array.isArray(messages)) {
        this.messages = messages;
      }
      this.emitter.emit('observe-messages', this.filteredMessages);
    }
  }, {
    key: 'updatePanelHeight',
    value: function updatePanelHeight(panelHeight) {
      atom.config.set('linter-ui-default.panelHeight', panelHeight);
    }
  }, {
    key: 'onDidChangeMessages',
    value: function onDidChangeMessages(callback) {
      return this.emitter.on('observe-messages', callback);
    }
  }, {
    key: 'onDidChangeVisibility',
    value: function onDidChangeVisibility(callback) {
      return this.emitter.on('observe-visibility', callback);
    }
  }, {
    key: 'onDidChangePanelConfig',
    value: function onDidChangePanelConfig(callback) {
      return this.emitter.on('observe-panel-config', callback);
    }
  }, {
    key: 'setPanelVisibility',
    value: function setPanelVisibility(visibility) {
      if (visibility && !this.panel.isVisible()) {
        this.panel.show();
      } else if (!visibility && this.panel.isVisible()) {
        this.panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }, {
    key: 'filteredMessages',
    get: function get() {
      var filteredMessages = [];
      if (this.panelRepresents === 'Entire Project') {
        filteredMessages = this.messages;
      } else if (this.panelRepresents === 'Current File') {
        var activeEditor = atom.workspace.getActiveTextEditor();
        if (!activeEditor) return [];
        filteredMessages = (0, _helpers.filterMessages)(this.messages, activeEditor.getPath());
      } else if (this.panelRepresents === 'Current Line') {
        var activeEditor = atom.workspace.getActiveTextEditor();
        if (!activeEditor) return [];
        var activeLine = activeEditor.getCursors()[0].getBufferRow();
        filteredMessages = (0, _helpers.filterMessagesByRangeOrPoint)(this.messages, activeEditor.getPath(), _atom.Range.fromObject([[activeLine, 0], [activeLine, Infinity]]));
      }
      return filteredMessages;
    }
  }]);

  return PanelDelegate;
})();

module.exports = PanelDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2RlbGVnYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRWdFLE1BQU07O3VCQUdULFlBQVk7O0lBR25FLGFBQWE7QUFVTixXQVZQLGFBQWEsQ0FVTCxLQUFZLEVBQUU7OzswQkFWdEIsYUFBYTs7QUFXZixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsVUFBQyxlQUFlLEVBQUs7QUFDbkcsVUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFLLGVBQWUsS0FBSyxXQUFXLENBQUE7QUFDOUQsWUFBSyxlQUFlLEdBQUcsZUFBZSxDQUFBO0FBQ3RDLFVBQUksVUFBVSxFQUFFO0FBQ2QsY0FBSyxNQUFNLEVBQUUsQ0FBQTtPQUNkO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxVQUFDLFdBQVcsRUFBSztBQUMzRixVQUFNLFVBQVUsR0FBRyxPQUFPLE1BQUssV0FBVyxLQUFLLFdBQVcsQ0FBQTtBQUMxRCxZQUFLLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDOUIsVUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtPQUMxQztLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtBQUM5RCx3QkFBZ0IsR0FBRywyQ0FBNkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUUsWUFBTSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUNwSjtBQUNELGFBQU8sZ0JBQWdCLENBQUE7S0FDeEI7OztTQXJGRyxhQUFhOzs7QUFvSG5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2RlbGVnYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlciwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBQYW5lbCB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCB7IGZpbHRlck1lc3NhZ2VzLCBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50IH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jbGFzcyBQYW5lbERlbGVnYXRlIHtcbiAgcGFuZWw6IFBhbmVsO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHZpc2liaWxpdHk6IGJvb2xlYW47XG4gIHBhbmVsSGVpZ2h0OiBudW1iZXI7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHBhbmVsUmVwcmVzZW50czogJ0VudGlyZSBQcm9qZWN0JyB8ICdDdXJyZW50IEZpbGUnIHwgJ0N1cnJlbnQgTGluZSc7XG4gIHBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHBhbmVsOiBQYW5lbCkge1xuICAgIHRoaXMucGFuZWwgPSBwYW5lbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsUmVwcmVzZW50cycsIChwYW5lbFJlcHJlc2VudHMpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbFJlcHJlc2VudHMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsUmVwcmVzZW50cyA9IHBhbmVsUmVwcmVzZW50c1xuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxIZWlnaHQnLCAocGFuZWxIZWlnaHQpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbEhlaWdodCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxIZWlnaHQgPSBwYW5lbEhlaWdodFxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtcGFuZWwtY29uZmlnJylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0JywgKHBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0KSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0ID0gcGFuZWxUYWtlc01pbmltdW1IZWlnaHRcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLXBhbmVsLWNvbmZpZycpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBsZXQgY2hhbmdlU3Vic2NyaXB0aW9uXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKHBhbmVJdGVtKSA9PiB7XG4gICAgICBpZiAoY2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbFxuICAgICAgfVxuICAgICAgdGhpcy52aXNpYmlsaXR5ID0gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtdmlzaWJpbGl0eScsIHRoaXMudmlzaWJpbGl0eSlcbiAgICAgIGlmICh0aGlzLnZpc2liaWxpdHkpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICB9XG4gICAgICAgIGxldCBvbGRSb3cgPSAtMVxuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24gPSBwYW5lSXRlbS5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgICAgICBpZiAob2xkUm93ICE9PSBuZXdCdWZmZXJQb3NpdGlvbi5yb3cgJiYgdGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICAgICAgICBvbGRSb3cgPSBuZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSB0eXBlb2YgdGhpcy52aXNpYmlsaXR5ICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0J1xuXG4gICAgICBpZiAodGhpcy52aXNpYmlsaXR5ICYmIHNob3VsZFVwZGF0ZSkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG4gIGdldCBmaWx0ZXJlZE1lc3NhZ2VzKCk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgICBsZXQgZmlsdGVyZWRNZXNzYWdlcyA9IFtdXG4gICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlc1xuICAgIH0gZWxzZSBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnKSB7XG4gICAgICBjb25zdCBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmICghYWN0aXZlRWRpdG9yKSByZXR1cm4gW11cbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlcyh0aGlzLm1lc3NhZ2VzLCBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICBjb25zdCBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmICghYWN0aXZlRWRpdG9yKSByZXR1cm4gW11cbiAgICAgIGNvbnN0IGFjdGl2ZUxpbmUgPSBhY3RpdmVFZGl0b3IuZ2V0Q3Vyc29ycygpWzBdLmdldEJ1ZmZlclJvdygpXG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCh0aGlzLm1lc3NhZ2VzLCBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpLCBSYW5nZS5mcm9tT2JqZWN0KFtbYWN0aXZlTGluZSwgMF0sIFthY3RpdmVMaW5lLCBJbmZpbml0eV1dKSlcbiAgICB9XG4gICAgcmV0dXJuIGZpbHRlcmVkTWVzc2FnZXNcbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS1tZXNzYWdlcycsIHRoaXMuZmlsdGVyZWRNZXNzYWdlcylcbiAgfVxuICB1cGRhdGVQYW5lbEhlaWdodChwYW5lbEhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIHBhbmVsSGVpZ2h0KVxuICB9XG4gIG9uRGlkQ2hhbmdlTWVzc2FnZXMoY2FsbGJhY2s6ICgobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkQ2hhbmdlVmlzaWJpbGl0eShjYWxsYmFjazogKCh2aXNpYmlsaXR5OiBib29sZWFuKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZS12aXNpYmlsaXR5JywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRDaGFuZ2VQYW5lbENvbmZpZyhjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLXBhbmVsLWNvbmZpZycsIGNhbGxiYWNrKVxuICB9XG4gIHNldFBhbmVsVmlzaWJpbGl0eSh2aXNpYmlsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHZpc2liaWxpdHkgJiYgIXRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMucGFuZWwuc2hvdygpXG4gICAgfSBlbHNlIGlmICghdmlzaWJpbGl0eSAmJiB0aGlzLnBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLnBhbmVsLmhpZGUoKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsRGVsZWdhdGVcbiJdfQ==