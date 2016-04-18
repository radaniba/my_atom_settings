(function() {
  var IndentationListView, IndentationManager, SelectListView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  IndentationManager = require('./indentation-manager');

  module.exports = IndentationListView = (function(_super) {
    __extends(IndentationListView, _super);

    function IndentationListView() {
      return IndentationListView.__super__.constructor.apply(this, arguments);
    }

    IndentationListView.prototype.initialize = function() {
      IndentationListView.__super__.initialize.apply(this, arguments);
      this.addClass('auto-detect-indentation-selector');
      return this.list.addClass('mark-active');
    };

    IndentationListView.prototype.getFilterKey = function() {
      return 'name';
    };

    IndentationListView.prototype.destroy = function() {
      return this.cancel();
    };

    IndentationListView.prototype.viewForItem = function(indentation) {
      var element;
      element = document.createElement('li');
      if (indentation.name === this.currentIndentation) {
        element.classList.add('active');
      }
      element.textContent = indentation.name;
      return element;
    };

    IndentationListView.prototype.cancelled = function() {
      var _ref;
      if ((_ref = this.panel) != null) {
        _ref.destroy();
      }
      this.panel = null;
      return this.currentIndentation = null;
    };

    IndentationListView.prototype.confirmed = function(indentation) {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      IndentationManager.setIndentation(editor, indentation);
      return this.cancel();
    };

    IndentationListView.prototype.attach = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      return this.focusFilterEditor();
    };

    IndentationListView.prototype.toggle = function() {
      var editor;
      if (this.panel != null) {
        return this.cancel();
      } else {
        editor = atom.workspace.getActiveTextEditor();
        if (editor) {
          this.currentIndentation = IndentationManager.getIndentation(editor);
          this.setItems(IndentationManager.getIndentations());
          return this.attach();
        }
      }
    };

    return IndentationListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi9saWIvaW5kZW50YXRpb24tbGlzdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1REFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsa0NBQUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEscURBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsa0NBQVYsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQWUsYUFBZixFQUpVO0lBQUEsQ0FBWixDQUFBOztBQUFBLGtDQU1BLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixPQURZO0lBQUEsQ0FOZCxDQUFBOztBQUFBLGtDQVNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRE87SUFBQSxDQVRULENBQUE7O0FBQUEsa0NBWUEsV0FBQSxHQUFhLFNBQUMsV0FBRCxHQUFBO0FBQ1gsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFtQyxXQUFXLENBQUMsSUFBWixLQUFvQixJQUFDLENBQUEsa0JBQXhEO0FBQUEsUUFBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFFBQXRCLENBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxPQUFPLENBQUMsV0FBUixHQUFzQixXQUFXLENBQUMsSUFGbEMsQ0FBQTthQUdBLFFBSlc7SUFBQSxDQVpiLENBQUE7O0FBQUEsa0NBa0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLElBQUE7O1lBQU0sQ0FBRSxPQUFSLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQURULENBQUE7YUFFQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsS0FIYjtJQUFBLENBbEJYLENBQUE7O0FBQUEsa0NBdUJBLFNBQUEsR0FBVyxTQUFDLFdBQUQsR0FBQTtBQUNULFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLGtCQUFrQixDQUFDLGNBQW5CLENBQWtDLE1BQWxDLEVBQTBDLFdBQTFDLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFIUztJQUFBLENBdkJYLENBQUE7O0FBQUEsa0NBNEJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BRFY7YUFFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUhNO0lBQUEsQ0E1QlIsQ0FBQTs7QUFBQSxrQ0FpQ0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsTUFBQTtBQUFBLE1BQUEsSUFBRyxrQkFBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtPQUFBLE1BQUE7QUFHRSxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLE1BQUg7QUFDRSxVQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixrQkFBa0IsQ0FBQyxjQUFuQixDQUFrQyxNQUFsQyxDQUF0QixDQUFBO0FBQUEsVUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFrQixDQUFDLGVBQW5CLENBQUEsQ0FBVixDQURBLENBQUE7aUJBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUhGO1NBSkY7T0FETTtJQUFBLENBakNSLENBQUE7OytCQUFBOztLQURnQyxlQUxsQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/lib/indentation-list-view.coffee
