var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */
/** @jsx etch.dom */

var _require = require('atom');

var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;
var TextEditor = _require.TextEditor;

var etch = require('etch');
var fuzzaldrin = require('fuzzaldrin');
var path = require('path');

module.exports = (function () {
  function SelectListView(props) {
    _classCallCheck(this, SelectListView);

    this.props = props;
    this.computeItems();
    this.selectionIndex = 0;
    this.disposables = new CompositeDisposable();
    etch.initialize(this);
    this.element.classList.add('select-list');
    this.disposables.add(this.refs.queryEditor.onDidChange(this.didChangeQuery.bind(this)));
    if (!props.skipCommandsRegistration) {
      this.disposables.add(this.registerAtomCommands());
    }
    var editorElement = this.refs.queryEditor.element;
    var didLoseFocus = this.didLoseFocus.bind(this);
    editorElement.addEventListener('blur', didLoseFocus);
    this.disposables.add(new Disposable(function () {
      editorElement.removeEventListener('blur', didLoseFocus);
    }));
  }

  _createClass(SelectListView, [{
    key: 'focus',
    value: function focus() {
      this.refs.queryEditor.element.focus();
    }
  }, {
    key: 'didLoseFocus',
    value: function didLoseFocus(event) {
      if (this.element.contains(event.relatedTarget)) {
        this.refs.queryEditor.element.focus();
      } else {
        this.cancelSelection();
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.refs.queryEditor.setText('');
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.disposables.dispose();
      return etch.destroy(this);
    }
  }, {
    key: 'registerAtomCommands',
    value: function registerAtomCommands() {
      var _this = this;

      return global.atom.commands.add(this.element, {
        'core:move-up': function coreMoveUp(event) {
          _this.selectPrevious();
          event.stopPropagation();
        },
        'core:move-down': function coreMoveDown(event) {
          _this.selectNext();
          event.stopPropagation();
        },
        'core:move-to-top': function coreMoveToTop(event) {
          _this.selectFirst();
          event.stopPropagation();
        },
        'core:move-to-bottom': function coreMoveToBottom(event) {
          _this.selectLast();
          event.stopPropagation();
        },
        'core:confirm': function coreConfirm(event) {
          _this.confirmSelection();
          event.stopPropagation();
        },
        'core:cancel': function coreCancel(event) {
          _this.cancelSelection();
          event.stopPropagation();
        }
      });
    }
  }, {
    key: 'update',
    value: function update() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var shouldComputeItems = false;

      if (props.hasOwnProperty('items')) {
        this.props.items = props.items;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('maxResults')) {
        this.props.maxResults = props.maxResults;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('filter')) {
        this.props.filter = props.filter;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('filterQuery')) {
        this.props.filterQuery = props.filterQuery;
        shouldComputeItems = true;
      }

      if (props.hasOwnProperty('order')) {
        this.props.order = props.order;
      }

      if (props.hasOwnProperty('emptyMessage')) {
        this.props.emptyMessage = props.emptyMessage;
      }

      if (props.hasOwnProperty('errorMessage')) {
        this.props.errorMessage = props.errorMessage;
      }

      if (props.hasOwnProperty('infoMessage')) {
        this.props.infoMessage = props.infoMessage;
      }

      if (props.hasOwnProperty('loadingMessage')) {
        this.props.loadingMessage = props.loadingMessage;
      }

      if (props.hasOwnProperty('loadingBadge')) {
        this.props.loadingBadge = props.loadingBadge;
      }

      if (props.hasOwnProperty('itemsClassList')) {
        this.props.itemsClassList = props.itemsClassList;
      }

      if (shouldComputeItems) {
        this.computeItems();
      }

      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      return etch.dom(
        'div',
        null,
        etch.dom(TextEditor, { ref: 'queryEditor', mini: true }),
        this.renderLoadingMessage(),
        this.renderInfoMessage(),
        this.renderErrorMessage(),
        this.renderItems()
      );
    }
  }, {
    key: 'renderItems',
    value: function renderItems() {
      var _this2 = this;

      if (this.items.length > 0) {
        var className = ['list-group'].concat(this.props.itemsClassList || []).join(' ');
        return etch.dom(
          'ol',
          { className: className, ref: 'items' },
          this.items.map(function (item, index) {
            return etch.dom(ListItemView, {
              element: _this2.props.elementForItem(item),
              selected: _this2.getSelectedItem() === item,
              onclick: function () {
                return _this2.didClickItem(index);
              } });
          })
        );
      } else if (!this.props.loadingMessage) {
        return etch.dom(
          'span',
          { ref: 'emptyMessage' },
          this.props.emptyMessage
        );
      } else {
        return "";
      }
    }
  }, {
    key: 'renderErrorMessage',
    value: function renderErrorMessage() {
      if (this.props.errorMessage) {
        return etch.dom(
          'span',
          { ref: 'errorMessage' },
          this.props.errorMessage
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'renderInfoMessage',
    value: function renderInfoMessage() {
      if (this.props.infoMessage) {
        return etch.dom(
          'span',
          { ref: 'infoMessage' },
          this.props.infoMessage
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'renderLoadingMessage',
    value: function renderLoadingMessage() {
      if (this.props.loadingMessage) {
        return etch.dom(
          'div',
          { className: 'loading' },
          etch.dom(
            'span',
            { ref: 'loadingMessage', className: 'loading-message' },
            this.props.loadingMessage
          ),
          this.props.loadingBadge ? etch.dom(
            'span',
            { ref: 'loadingBadge', className: 'badge' },
            this.props.loadingBadge
          ) : ""
        );
      } else {
        return '';
      }
    }
  }, {
    key: 'getQuery',
    value: function getQuery() {
      if (this.refs && this.refs.queryEditor) {
        return this.refs.queryEditor.getText();
      } else {
        return "";
      }
    }
  }, {
    key: 'getFilterQuery',
    value: function getFilterQuery() {
      return this.props.filterQuery ? this.props.filterQuery(this.getQuery()) : this.getQuery();
    }
  }, {
    key: 'didChangeQuery',
    value: function didChangeQuery() {
      if (this.props.didChangeQuery) {
        this.props.didChangeQuery(this.getFilterQuery());
      }

      this.computeItems();
      this.selectIndex(0);
    }
  }, {
    key: 'didClickItem',
    value: function didClickItem(itemIndex) {
      this.selectIndex(itemIndex);
      this.confirmSelection();
    }
  }, {
    key: 'computeItems',
    value: function computeItems() {
      var filterFn = this.props.filter || this.fuzzyFilter.bind(this);
      this.items = filterFn(this.props.items.slice(), this.getFilterQuery());
      if (this.props.order) {
        this.items.sort(this.props.order);
      }
      if (this.props.maxResults) {
        this.items.splice(this.props.maxResults, this.items.length - this.props.maxResults);
      }
    }
  }, {
    key: 'fuzzyFilter',
    value: function fuzzyFilter(items, query) {
      if (query.length === 0) {
        return items;
      } else {
        var scoredItems = [];
        for (var item of items) {
          var string = this.props.filterKeyForItem ? this.props.filterKeyForItem(item) : item;
          var score = fuzzaldrin.score(string, query);
          if (score > 0) {
            scoredItems.push({ item: item, score: score });
          }
        }
        scoredItems.sort(function (a, b) {
          return b.score - a.score;
        });
        return scoredItems.map(function (i) {
          return i.item;
        });
      }
    }
  }, {
    key: 'getSelectedItem',
    value: function getSelectedItem() {
      return this.items[this.selectionIndex];
    }
  }, {
    key: 'selectPrevious',
    value: function selectPrevious() {
      return this.selectIndex(this.selectionIndex - 1);
    }
  }, {
    key: 'selectNext',
    value: function selectNext() {
      return this.selectIndex(this.selectionIndex + 1);
    }
  }, {
    key: 'selectFirst',
    value: function selectFirst() {
      return this.selectIndex(0);
    }
  }, {
    key: 'selectLast',
    value: function selectLast() {
      return this.selectIndex(this.items.length - 1);
    }
  }, {
    key: 'selectIndex',
    value: function selectIndex(index) {
      if (index >= this.items.length) {
        index = 0;
      } else if (index < 0) {
        index = this.items.length - 1;
      }

      if (index !== this.selectionIndex) {
        this.selectionIndex = index;
        if (this.props.didChangeSelection) {
          this.props.didChangeSelection(this.getSelectedItem());
        }
      }

      return etch.update(this);
    }
  }, {
    key: 'selectItem',
    value: function selectItem(item) {
      var index = this.items.indexOf(item);
      if (index === -1) {
        throw new Error('Cannot select the specified item because it does not exist.');
      } else {
        return this.selectIndex(index);
      }
    }
  }, {
    key: 'confirmSelection',
    value: function confirmSelection() {
      var selectedItem = this.getSelectedItem();
      if (selectedItem) {
        if (this.props.didConfirmSelection) {
          this.props.didConfirmSelection(selectedItem);
        }
      } else {
        if (this.props.didCancelSelection) {
          this.props.didCancelSelection();
        }
      }
    }
  }, {
    key: 'cancelSelection',
    value: function cancelSelection() {
      if (this.props.didCancelSelection) {
        this.props.didCancelSelection();
      }
    }
  }]);

  return SelectListView;
})();

var ListItemView = (function () {
  function ListItemView(props) {
    var _this3 = this;

    _classCallCheck(this, ListItemView);

    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.didClick = this.didClick.bind(this);
    this.selected = props.selected;
    this.onclick = props.onclick;
    this.element = props.element;
    this.element.addEventListener('mousedown', this.mouseDown);
    this.element.addEventListener('mouseup', this.mouseUp);
    this.element.addEventListener('click', this.didClick);
    if (this.selected) {
      this.element.classList.add('selected');
    }
    this.domEventsDisposable = new Disposable(function () {
      _this3.element.removeEventListener('mousedown', _this3.mouseDown);
      _this3.element.removeEventListener('mouseup', _this3.mouseUp);
      _this3.element.removeEventListener('click', _this3.didClick);
    });
    etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded.bind(this));
  }

  _createClass(ListItemView, [{
    key: 'mouseDown',
    value: function mouseDown(event) {
      event.preventDefault();
    }
  }, {
    key: 'mouseUp',
    value: function mouseUp() {
      event.preventDefault();
    }
  }, {
    key: 'didClick',
    value: function didClick(event) {
      event.preventDefault();
      this.onclick();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.selected) {
        this.element.classList.remove('selected');
      }
      this.domEventsDisposable.dispose();
    }
  }, {
    key: 'update',
    value: function update(props) {
      if (this.element !== props.element) {
        this.element.removeEventListener('mousedown', this.mouseDown);
        props.element.addEventListener('mousedown', this.mouseDown);
        this.element.removeEventListener('mouseup', this.mouseUp);
        props.element.addEventListener('mouseup', this.mouseUp);
        this.element.removeEventListener('click', this.didClick);
        props.element.addEventListener('click', this.didClick);

        props.element.classList.remove('selected');
        if (props.selected) {
          props.element.classList.add('selected');
        }
      } else {
        if (this.selected && !props.selected) {
          this.element.classList.remove('selected');
        } else if (!this.selected && props.selected) {
          this.element.classList.add('selected');
        }
      }

      this.element = props.element;
      this.selected = props.selected;
      this.onclick = props.onclick;
      etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded.bind(this));
    }
  }, {
    key: 'scrollIntoViewIfNeeded',
    value: function scrollIntoViewIfNeeded() {
      if (this.selected) {
        this.element.scrollIntoViewIfNeeded();
      }
    }
  }]);

  return ListItemView;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG93bmxvYWRzL0F0b20uYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYXRvbS1zZWxlY3QtbGlzdC9zcmMvc2VsZWN0LWxpc3Qtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O2VBR3NELE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTlELFVBQVUsWUFBVixVQUFVO0lBQUUsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUFFLFVBQVUsWUFBVixVQUFVOztBQUNsRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3hDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFNUIsTUFBTSxDQUFDLE9BQU87QUFDQSxXQURTLGNBQWMsQ0FDdEIsS0FBSyxFQUFFOzBCQURDLGNBQWM7O0FBRWpDLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtBQUNuQixRQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQTtBQUN2QixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQTtBQUM1QyxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3JCLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN6QyxRQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZGLFFBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUU7QUFDbkMsVUFBSSxD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QU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMxQyxZQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDbEIsZUFBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ3hDO09BQ0YsTUFBTTtBQUNMLFlBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDcEMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQzFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUMzQyxjQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDdkM7T0FDRjs7QUFFRCxVQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUE7QUFDNUIsVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFBO0FBQzlCLFVBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUM1QixVQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUMzRTs7O1dBRXNCLGtDQUFHO0FBQ3hCLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLENBQUE7T0FDdEM7S0FDRjs7O1NBekVHLFlBQVkiLCJmaWxlIjoiL1VzZXJzL1JhZC9Eb3dubG9hZHMvQXRvbS5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9hdG9tLXNlbGVjdC1saXN0L3NyYy9zZWxlY3QtbGlzdC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuY29uc3Qge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRFZGl0b3J9ID0gcmVxdWlyZSgnYXRvbScpXG5jb25zdCBldGNoID0gcmVxdWlyZSgnZXRjaCcpXG5jb25zdCBmdXp6YWxkcmluID0gcmVxdWlyZSgnZnV6emFsZHJpbicpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2VsZWN0TGlzdFZpZXcge1xuICBjb25zdHJ1Y3RvciAocHJvcHMpIHtcbiAgICB0aGlzLnByb3BzID0gcHJvcHNcbiAgICB0aGlzLmNvbXB1dGVJdGVtcygpXG4gICAgdGhpcy5zZWxlY3Rpb25JbmRleCA9IDBcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3QtbGlzdCcpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLm9uRGlkQ2hhbmdlKHRoaXMuZGlkQ2hhbmdlUXVlcnkuYmluZCh0aGlzKSkpXG4gICAgaWYgKCFwcm9wcy5za2lwQ29tbWFuZHNSZWdpc3RyYXRpb24pIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMucmVnaXN0ZXJBdG9tQ29tbWFuZHMoKSlcbiAgICB9XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IHRoaXMucmVmcy5xdWVyeUVkaXRvci5lbGVtZW50XG4gICAgY29uc3QgZGlkTG9zZUZvY3VzID0gdGhpcy5kaWRMb3NlRm9jdXMuYmluZCh0aGlzKVxuICAgIGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGRpZExvc2VGb2N1cylcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIGRpZExvc2VGb2N1cykgfSkpXG4gIH1cblxuICBmb2N1cyAoKSB7XG4gICAgdGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLmVsZW1lbnQuZm9jdXMoKVxuICB9XG5cbiAgZGlkTG9zZUZvY3VzIChldmVudCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgIHRoaXMucmVmcy5xdWVyeUVkaXRvci5lbGVtZW50LmZvY3VzKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW5jZWxTZWxlY3Rpb24oKVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0ICgpIHtcbiAgICB0aGlzLnJlZnMucXVlcnlFZGl0b3Iuc2V0VGV4dCgnJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgcmV0dXJuIGV0Y2guZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgcmVnaXN0ZXJBdG9tQ29tbWFuZHMgKCkge1xuICAgIHJldHVybiBnbG9iYWwuYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0UHJldmlvdXMoKVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdE5leHQoKVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0Rmlyc3QoKVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0TGFzdCgpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y29uZmlybSc6IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNhbmNlbCc6IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmNhbmNlbFNlbGVjdGlvbigpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZSAocHJvcHMgPSB7fSkge1xuICAgIGxldCBzaG91bGRDb21wdXRlSXRlbXMgPSBmYWxzZVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdpdGVtcycpKSB7XG4gICAgICB0aGlzLnByb3BzLml0ZW1zID0gcHJvcHMuaXRlbXNcbiAgICAgIHNob3VsZENvbXB1dGVJdGVtcyA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ21heFJlc3VsdHMnKSkge1xuICAgICAgdGhpcy5wcm9wcy5tYXhSZXN1bHRzID0gcHJvcHMubWF4UmVzdWx0c1xuICAgICAgc2hvdWxkQ29tcHV0ZUl0ZW1zID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnZmlsdGVyJykpIHtcbiAgICAgIHRoaXMucHJvcHMuZmlsdGVyID0gcHJvcHMuZmlsdGVyXG4gICAgICBzaG91bGRDb21wdXRlSXRlbXMgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdmaWx0ZXJRdWVyeScpKSB7XG4gICAgICB0aGlzLnByb3BzLmZpbHRlclF1ZXJ5ID0gcHJvcHMuZmlsdGVyUXVlcnlcbiAgICAgIHNob3VsZENvbXB1dGVJdGVtcyA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ29yZGVyJykpIHtcbiAgICAgIHRoaXMucHJvcHMub3JkZXIgPSBwcm9wcy5vcmRlclxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnZW1wdHlNZXNzYWdlJykpIHtcbiAgICAgIHRoaXMucHJvcHMuZW1wdHlNZXNzYWdlID0gcHJvcHMuZW1wdHlNZXNzYWdlXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdlcnJvck1lc3NhZ2UnKSkge1xuICAgICAgdGhpcy5wcm9wcy5lcnJvck1lc3NhZ2UgPSBwcm9wcy5lcnJvck1lc3NhZ2VcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2luZm9NZXNzYWdlJykpIHtcbiAgICAgIHRoaXMucHJvcHMuaW5mb01lc3NhZ2UgPSBwcm9wcy5pbmZvTWVzc2FnZVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnbG9hZGluZ01lc3NhZ2UnKSkge1xuICAgICAgdGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZSA9IHByb3BzLmxvYWRpbmdNZXNzYWdlXG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdsb2FkaW5nQmFkZ2UnKSkge1xuICAgICAgdGhpcy5wcm9wcy5sb2FkaW5nQmFkZ2UgPSBwcm9wcy5sb2FkaW5nQmFkZ2VcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2l0ZW1zQ2xhc3NMaXN0JykpIHtcbiAgICAgIHRoaXMucHJvcHMuaXRlbXNDbGFzc0xpc3QgPSBwcm9wcy5pdGVtc0NsYXNzTGlzdFxuICAgIH1cblxuICAgIGlmIChzaG91bGRDb21wdXRlSXRlbXMpIHtcbiAgICAgIHRoaXMuY29tcHV0ZUl0ZW1zKClcbiAgICB9XG5cbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcylcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxUZXh0RWRpdG9yIHJlZj0ncXVlcnlFZGl0b3InIG1pbmk9e3RydWV9IC8+XG4gICAgICAgIHt0aGlzLnJlbmRlckxvYWRpbmdNZXNzYWdlKCl9XG4gICAgICAgIHt0aGlzLnJlbmRlckluZm9NZXNzYWdlKCl9XG4gICAgICAgIHt0aGlzLnJlbmRlckVycm9yTWVzc2FnZSgpfVxuICAgICAgICB7dGhpcy5yZW5kZXJJdGVtcygpfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcmVuZGVySXRlbXMgKCkge1xuICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IFsnbGlzdC1ncm91cCddLmNvbmNhdCh0aGlzLnByb3BzLml0ZW1zQ2xhc3NMaXN0IHx8IFtdKS5qb2luKCcgJylcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxvbCBjbGFzc05hbWU9e2NsYXNzTmFtZX0gcmVmPSdpdGVtcyc+XG4gICAgICAgIHt0aGlzLml0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+XG4gICAgICAgICAgPExpc3RJdGVtVmlld1xuICAgICAgICAgICAgZWxlbWVudD17dGhpcy5wcm9wcy5lbGVtZW50Rm9ySXRlbShpdGVtKX1cbiAgICAgICAgICAgIHNlbGVjdGVkPXt0aGlzLmdldFNlbGVjdGVkSXRlbSgpID09PSBpdGVtfVxuICAgICAgICAgICAgb25jbGljaz17KCkgPT4gdGhpcy5kaWRDbGlja0l0ZW0oaW5kZXgpfSAvPil9XG4gICAgICAgIDwvb2w+XG4gICAgICApXG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4gcmVmPVwiZW1wdHlNZXNzYWdlXCI+e3RoaXMucHJvcHMuZW1wdHlNZXNzYWdlfTwvc3Bhbj5cbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiXCJcbiAgICB9XG4gIH1cblxuICByZW5kZXJFcnJvck1lc3NhZ2UgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmVycm9yTWVzc2FnZSkge1xuICAgICAgcmV0dXJuIDxzcGFuIHJlZj1cImVycm9yTWVzc2FnZVwiPnt0aGlzLnByb3BzLmVycm9yTWVzc2FnZX08L3NwYW4+XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckluZm9NZXNzYWdlICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5pbmZvTWVzc2FnZSkge1xuICAgICAgcmV0dXJuIDxzcGFuIHJlZj1cImluZm9NZXNzYWdlXCI+e3RoaXMucHJvcHMuaW5mb01lc3NhZ2V9PC9zcGFuPlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gIH1cblxuICByZW5kZXJMb2FkaW5nTWVzc2FnZSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMubG9hZGluZ01lc3NhZ2UpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibG9hZGluZ1wiPlxuICAgICAgICAgIDxzcGFuIHJlZj1cImxvYWRpbmdNZXNzYWdlXCIgY2xhc3NOYW1lPVwibG9hZGluZy1tZXNzYWdlXCI+e3RoaXMucHJvcHMubG9hZGluZ01lc3NhZ2V9PC9zcGFuPlxuICAgICAgICAgIHt0aGlzLnByb3BzLmxvYWRpbmdCYWRnZSA/IDxzcGFuIHJlZj1cImxvYWRpbmdCYWRnZVwiIGNsYXNzTmFtZT1cImJhZGdlXCI+e3RoaXMucHJvcHMubG9hZGluZ0JhZGdlfTwvc3Bhbj4gOiBcIlwifVxuICAgICAgICA8L2Rpdj5cbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnXG4gICAgfVxuICB9XG5cbiAgZ2V0UXVlcnkgKCkge1xuICAgIGlmICh0aGlzLnJlZnMgJiYgdGhpcy5yZWZzLnF1ZXJ5RWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLmdldFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJcIlxuICAgIH1cbiAgfVxuXG4gIGdldEZpbHRlclF1ZXJ5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJRdWVyeSA/IHRoaXMucHJvcHMuZmlsdGVyUXVlcnkodGhpcy5nZXRRdWVyeSgpKSA6IHRoaXMuZ2V0UXVlcnkoKVxuICB9XG5cbiAgZGlkQ2hhbmdlUXVlcnkgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmRpZENoYW5nZVF1ZXJ5KSB7XG4gICAgICB0aGlzLnByb3BzLmRpZENoYW5nZVF1ZXJ5KHRoaXMuZ2V0RmlsdGVyUXVlcnkoKSlcbiAgICB9XG5cbiAgICB0aGlzLmNvbXB1dGVJdGVtcygpXG4gICAgdGhpcy5zZWxlY3RJbmRleCgwKVxuICB9XG5cbiAgZGlkQ2xpY2tJdGVtIChpdGVtSW5kZXgpIHtcbiAgICB0aGlzLnNlbGVjdEluZGV4KGl0ZW1JbmRleClcbiAgICB0aGlzLmNvbmZpcm1TZWxlY3Rpb24oKVxuICB9XG5cbiAgY29tcHV0ZUl0ZW1zICgpIHtcbiAgICBjb25zdCBmaWx0ZXJGbiA9IHRoaXMucHJvcHMuZmlsdGVyIHx8IHRoaXMuZnV6enlGaWx0ZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaXRlbXMgPSBmaWx0ZXJGbih0aGlzLnByb3BzLml0ZW1zLnNsaWNlKCksIHRoaXMuZ2V0RmlsdGVyUXVlcnkoKSlcbiAgICBpZiAodGhpcy5wcm9wcy5vcmRlcikge1xuICAgICAgdGhpcy5pdGVtcy5zb3J0KHRoaXMucHJvcHMub3JkZXIpXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm1heFJlc3VsdHMpIHtcbiAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMucHJvcHMubWF4UmVzdWx0cywgdGhpcy5pdGVtcy5sZW5ndGggLSB0aGlzLnByb3BzLm1heFJlc3VsdHMpXG4gICAgfVxuICB9XG5cbiAgZnV6enlGaWx0ZXIgKGl0ZW1zLCBxdWVyeSkge1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBpdGVtc1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzY29yZWRJdGVtcyA9IFtdXG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgICAgY29uc3Qgc3RyaW5nID0gdGhpcy5wcm9wcy5maWx0ZXJLZXlGb3JJdGVtID8gdGhpcy5wcm9wcy5maWx0ZXJLZXlGb3JJdGVtKGl0ZW0pIDogaXRlbVxuICAgICAgICBsZXQgc2NvcmUgPSBmdXp6YWxkcmluLnNjb3JlKHN0cmluZywgcXVlcnkpXG4gICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICBzY29yZWRJdGVtcy5wdXNoKHtpdGVtLCBzY29yZX0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNjb3JlZEl0ZW1zLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKVxuICAgICAgcmV0dXJuIHNjb3JlZEl0ZW1zLm1hcCgoaSkgPT4gaS5pdGVtKVxuICAgIH1cbiAgfVxuXG4gIGdldFNlbGVjdGVkSXRlbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5zZWxlY3Rpb25JbmRleF1cbiAgfVxuXG4gIHNlbGVjdFByZXZpb3VzICgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RJbmRleCh0aGlzLnNlbGVjdGlvbkluZGV4IC0gMSlcbiAgfVxuXG4gIHNlbGVjdE5leHQgKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdEluZGV4KHRoaXMuc2VsZWN0aW9uSW5kZXggKyAxKVxuICB9XG5cbiAgc2VsZWN0Rmlyc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdEluZGV4KDApXG4gIH1cblxuICBzZWxlY3RMYXN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RJbmRleCh0aGlzLml0ZW1zLmxlbmd0aCAtIDEpXG4gIH1cblxuICBzZWxlY3RJbmRleCAoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gMFxuICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwKSB7XG4gICAgICBpbmRleCA9IHRoaXMuaXRlbXMubGVuZ3RoIC0gMVxuICAgIH1cblxuICAgIGlmIChpbmRleCAhPT0gdGhpcy5zZWxlY3Rpb25JbmRleCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25JbmRleCA9IGluZGV4XG4gICAgICBpZiAodGhpcy5wcm9wcy5kaWRDaGFuZ2VTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5wcm9wcy5kaWRDaGFuZ2VTZWxlY3Rpb24odGhpcy5nZXRTZWxlY3RlZEl0ZW0oKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcylcbiAgfVxuXG4gIHNlbGVjdEl0ZW0gKGl0ZW0pIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNlbGVjdCB0aGUgc3BlY2lmaWVkIGl0ZW0gYmVjYXVzZSBpdCBkb2VzIG5vdCBleGlzdC4nKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RJbmRleChpbmRleClcbiAgICB9XG4gIH1cblxuICBjb25maXJtU2VsZWN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSB0aGlzLmdldFNlbGVjdGVkSXRlbSgpXG4gICAgaWYgKHNlbGVjdGVkSXRlbSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZGlkQ29uZmlybVNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLnByb3BzLmRpZENvbmZpcm1TZWxlY3Rpb24oc2VsZWN0ZWRJdGVtKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5kaWRDYW5jZWxTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5wcm9wcy5kaWRDYW5jZWxTZWxlY3Rpb24oKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNhbmNlbFNlbGVjdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZGlkQ2FuY2VsU2VsZWN0aW9uKSB7XG4gICAgICB0aGlzLnByb3BzLmRpZENhbmNlbFNlbGVjdGlvbigpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIExpc3RJdGVtVmlldyB7XG4gIGNvbnN0cnVjdG9yIChwcm9wcykge1xuICAgIHRoaXMubW91c2VEb3duID0gdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKVxuICAgIHRoaXMubW91c2VVcCA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaWRDbGljayA9IHRoaXMuZGlkQ2xpY2suYmluZCh0aGlzKVxuICAgIHRoaXMuc2VsZWN0ZWQgPSBwcm9wcy5zZWxlY3RlZFxuICAgIHRoaXMub25jbGljayA9IHByb3BzLm9uY2xpY2tcbiAgICB0aGlzLmVsZW1lbnQgPSBwcm9wcy5lbGVtZW50XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZVVwKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlkQ2xpY2spXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgfVxuICAgIHRoaXMuZG9tRXZlbnRzRGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93bilcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZVVwKVxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaWRDbGljaylcbiAgICB9KVxuICAgIGV0Y2guZ2V0U2NoZWR1bGVyKCkudXBkYXRlRG9jdW1lbnQodGhpcy5zY3JvbGxJbnRvVmlld0lmTmVlZGVkLmJpbmQodGhpcykpXG4gIH1cblxuICBtb3VzZURvd24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgbW91c2VVcCAoKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgZGlkQ2xpY2sgKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHRoaXMub25jbGljaygpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgICB9XG4gICAgdGhpcy5kb21FdmVudHNEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICB9XG5cbiAgdXBkYXRlIChwcm9wcykge1xuICAgIGlmICh0aGlzLmVsZW1lbnQgIT09IHByb3BzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93bilcbiAgICAgIHByb3BzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5tb3VzZURvd24pXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMubW91c2VVcClcbiAgICAgIHByb3BzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMubW91c2VVcClcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlkQ2xpY2spXG4gICAgICBwcm9wcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaWRDbGljaylcblxuICAgICAgcHJvcHMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgICBpZiAocHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgICAgcHJvcHMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkICYmICFwcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5zZWxlY3RlZCAmJiBwcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudCA9IHByb3BzLmVsZW1lbnRcbiAgICB0aGlzLnNlbGVjdGVkID0gcHJvcHMuc2VsZWN0ZWRcbiAgICB0aGlzLm9uY2xpY2sgPSBwcm9wcy5vbmNsaWNrXG4gICAgZXRjaC5nZXRTY2hlZHVsZXIoKS51cGRhdGVEb2N1bWVudCh0aGlzLnNjcm9sbEludG9WaWV3SWZOZWVkZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIHNjcm9sbEludG9WaWV3SWZOZWVkZWQgKCkge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpXG4gICAgfVxuICB9XG59XG4iXX0=