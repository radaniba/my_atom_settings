(function() {
  var $$, RepoListView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  module.exports = RepoListView = (function(superClass) {
    extend(RepoListView, superClass);

    function RepoListView() {
      return RepoListView.__super__.constructor.apply(this, arguments);
    }

    RepoListView.prototype.initialize = function(listOfItems) {
      this.listOfItems = listOfItems;
      RepoListView.__super__.initialize.apply(this, arguments);
      this.addClass('modal overlay from-top');
      this.storeFocusedElement();
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: true
      });
      this.panel.show();
      this.setItems(this.listOfItems);
      return this.focusFilterEditor();
    };

    RepoListView.prototype.getFilterKey = function() {
      return 'repo_name';
    };

    RepoListView.prototype.viewForItem = function(item) {
      return $$(function() {
        return this.li(item.repo_name);
      });
    };

    RepoListView.prototype.cancelled = function() {
      this.panel.hide();
      return this.panel.destroy();
    };

    RepoListView.prototype.confirmed = function(item) {
      var old_pane, options, uri;
      this.cancel();
      options = {
        'repo': item
      };
      uri = "git-log://" + item.repo_name;
      old_pane = atom.workspace.paneForURI(uri);
      if (old_pane) {
        old_pane.destroyItem(old_pane.itemForURI(uri));
      }
      return atom.workspace.open(uri, options);
    };

    return RepoListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtbG9nL2xpYi9naXQtcmVwby1saXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUNBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUdMLE1BQU0sQ0FBQyxPQUFQLEdBRU07Ozs7Ozs7MkJBQ0YsVUFBQSxHQUFZLFNBQUMsV0FBRDtNQUFDLElBQUMsQ0FBQSxjQUFEO01BQ1QsOENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsd0JBQVY7TUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFBWSxPQUFBLEVBQVMsSUFBckI7T0FBN0I7TUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFdBQVg7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVBROzsyQkFTWixZQUFBLEdBQWMsU0FBQTthQUNWO0lBRFU7OzJCQUdkLFdBQUEsR0FBYSxTQUFDLElBQUQ7YUFDVCxFQUFBLENBQUcsU0FBQTtlQUFHLElBQUMsQ0FBQSxFQUFELENBQUksSUFBSSxDQUFDLFNBQVQ7TUFBSCxDQUFIO0lBRFM7OzJCQUdiLFNBQUEsR0FBVyxTQUFBO01BQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZPOzsyQkFJWCxTQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSxPQUFBLEdBQVM7UUFDTCxNQUFBLEVBQVEsSUFESDs7TUFHVCxHQUFBLEdBQU0sWUFBQSxHQUFlLElBQUksQ0FBQztNQUMxQixRQUFBLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLEdBQTFCO01BQ1gsSUFBa0QsUUFBbEQ7UUFBQSxRQUFRLENBQUMsV0FBVCxDQUFxQixRQUFRLENBQUMsVUFBVCxDQUFvQixHQUFwQixDQUFyQixFQUFBOzthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixHQUFwQixFQUF5QixPQUF6QjtJQVJPOzs7O0tBcEJZO0FBTDNCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIFJlcG9MaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gICAgaW5pdGlhbGl6ZTogKEBsaXN0T2ZJdGVtcykgLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgQGFkZENsYXNzKCdtb2RhbCBvdmVybGF5IGZyb20tdG9wJylcbiAgICAgICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuICAgICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IHRydWUpXG4gICAgICAgIEBwYW5lbC5zaG93KClcbiAgICAgICAgQHNldEl0ZW1zKEBsaXN0T2ZJdGVtcylcbiAgICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICAgIGdldEZpbHRlcktleTogLT5cbiAgICAgICAgJ3JlcG9fbmFtZSdcblxuICAgIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiAgICAgICAgJCQgLT4gQGxpKGl0ZW0ucmVwb19uYW1lKVxuXG4gICAgY2FuY2VsbGVkOiAtPlxuICAgICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICAgIEBwYW5lbC5kZXN0cm95KClcblxuICAgIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgICAgIEBjYW5jZWwoKVxuICAgICAgICBvcHRpb25zPSB7XG4gICAgICAgICAgICAncmVwbyc6IGl0ZW1cbiAgICAgICAgfTtcbiAgICAgICAgdXJpID0gXCJnaXQtbG9nOi8vXCIgKyBpdGVtLnJlcG9fbmFtZVxuICAgICAgICBvbGRfcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkodXJpKVxuICAgICAgICBvbGRfcGFuZS5kZXN0cm95SXRlbSBvbGRfcGFuZS5pdGVtRm9yVVJJKHVyaSkgIGlmIG9sZF9wYW5lXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gdXJpLCBvcHRpb25zXG4iXX0=
