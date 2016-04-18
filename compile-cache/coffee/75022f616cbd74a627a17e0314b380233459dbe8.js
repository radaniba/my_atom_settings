(function() {
  var $$, SelectListView, UsagesView, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  path = require('path');

  module.exports = UsagesView = (function(_super) {
    __extends(UsagesView, _super);

    function UsagesView() {
      return UsagesView.__super__.constructor.apply(this, arguments);
    }

    UsagesView.prototype.initialize = function(matches) {
      UsagesView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for usages');
      return this.focusFilterEditor();
    };

    UsagesView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    UsagesView.prototype.viewForItem = function(_arg) {
      var column, fileName, line, moduleName, name, relativePath, _, _ref1;
      name = _arg.name, moduleName = _arg.moduleName, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      _ref1 = atom.project.relativizePath(fileName), _ = _ref1[0], relativePath = _ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + name, {
              "class": 'primary-line'
            });
            return _this.div("" + relativePath + ", line " + line, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    UsagesView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    UsagesView.prototype.scrollToItemView = function() {
      var column, editor, fileName, line, moduleName, name, _ref1;
      UsagesView.__super__.scrollToItemView.apply(this, arguments);
      _ref1 = this.getSelectedItem(), name = _ref1.name, moduleName = _ref1.moduleName, fileName = _ref1.fileName, line = _ref1.line, column = _ref1.column;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getBuffer().file.path === fileName) {
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToBufferPosition([line - 1, column], {
          center: true
        });
      }
    };

    UsagesView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No usages found';
      } else {
        return UsagesView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    UsagesView.prototype.confirmed = function(_arg) {
      var column, fileName, line, moduleName, name, promise;
      name = _arg.name, moduleName = _arg.moduleName, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line - 1, column]);
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToCursorPosition();
      });
    };

    UsagesView.prototype.cancelled = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    return UsagesView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi91c2FnZXMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMENBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLE1BQUEsNENBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxjQUFWLENBRkEsQ0FBQTs7UUFHQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BSFY7QUFBQSxNQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxvQkFBWixDQUxBLENBQUE7YUFNQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQVBVO0lBQUEsQ0FBWixDQUFBOztBQUFBLHlCQVNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUEsRUFGTztJQUFBLENBVFQsQ0FBQTs7QUFB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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/usages-view.coffee
