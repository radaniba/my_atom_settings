(function() {
  var CompositeDisposable, View, YapfStatus,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('atom-space-pen-views').View;

  module.exports = YapfStatus = (function(superClass) {
    extend(YapfStatus, superClass);

    function YapfStatus() {
      return YapfStatus.__super__.constructor.apply(this, arguments);
    }

    YapfStatus.prototype.subs = null;

    YapfStatus.prototype.tile = null;

    YapfStatus.content = function() {
      return this.div({
        "class": "status-bar-python-yapf inline-block"
      });
    };

    YapfStatus.prototype.initialize = function(pi) {
      this.pi = pi;
      this.subs = new CompositeDisposable;
      return this;
    };

    YapfStatus.prototype.destroy = function() {
      var ref, ref1;
      if ((ref = this.tile) != null) {
        ref.destroy();
      }
      this.tile = null;
      if ((ref1 = this.sub) != null) {
        ref1.dispose();
      }
      return this.sub = null;
    };

    YapfStatus.prototype.createElement = function() {
      var classes, element, ref, type;
      type = arguments[0], classes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      element = document.createElement(type);
      (ref = element.classList).add.apply(ref, classes);
      return element;
    };

    YapfStatus.prototype.update = function(note, success) {
      var editor, message, ref, title;
      this.hideTile();
      editor = atom.workspace.getActiveTextEditor();
      if (editor && this.pi.isPythonContext(editor)) {
        this.tile = (ref = this.statusBar) != null ? ref.addLeftTile({
          item: this,
          priority: 10
        }) : void 0;
        title = this.createElement('span');
        title.style.fontWeight = 'bold';
        title.textContent = 'YAPF: ';
        this.append(title);
        message = this.createElement('span', 'python-yapf-status-message');
        message.textContent = note;
        if (!success) {
          message.style.color = 'red';
        }
        return this.append(message);
      }
    };

    YapfStatus.prototype.hideTile = function() {
      var ref;
      this.empty();
      if ((ref = this.tile) != null) {
        ref.destroy();
      }
      return this.tile = null;
    };

    YapfStatus.prototype.attach = function(statusBar) {
      this.statusBar = statusBar;
      return this.subs.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          if (editor && _this.pi.isPythonContext(editor)) {
            _this.pi.updateStatusbarText('⧗', true);
            return _this.pi.checkCode();
          } else {
            return _this.hideTile();
          }
        };
      })(this)));
    };

    return YapfStatus;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24teWFwZi9saWIvc3RhdHVzLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7Ozs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBRU07Ozs7Ozs7eUJBQ0osSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O0lBRU4sVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUNBQVA7T0FBTDtJQURROzt5QkFHVixVQUFBLEdBQVksU0FBQyxFQUFEO01BQUMsSUFBQyxDQUFBLEtBQUQ7TUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUk7YUFDWjtJQUZVOzt5QkFJWixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1dBQUssQ0FBRSxPQUFQLENBQUE7O01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7WUFDSixDQUFFLE9BQU4sQ0FBQTs7YUFDQSxJQUFDLENBQUEsR0FBRCxHQUFPO0lBSkE7O3lCQU1ULGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQURjLHFCQUFNO01BQ3BCLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QjtNQUNWLE9BQUEsT0FBTyxDQUFDLFNBQVIsQ0FBaUIsQ0FBQyxHQUFsQixZQUFzQixPQUF0QjthQUNBO0lBSGE7O3lCQUtmLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ04sVUFBQTtNQUFBLElBQUMsQ0FBQSxRQUFELENBQUE7TUFFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBRyxNQUFBLElBQVcsSUFBQyxDQUFBLEVBQUUsQ0FBQyxlQUFKLENBQW9CLE1BQXBCLENBQWQ7UUFDRSxJQUFDLENBQUEsSUFBRCx1Q0FBa0IsQ0FBRSxXQUFaLENBQ047VUFBQSxJQUFBLEVBQU0sSUFBTjtVQUNBLFFBQUEsRUFBVSxFQURWO1NBRE07UUFJUixLQUFBLEdBQVEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmO1FBQ1IsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFaLEdBQXlCO1FBQ3pCLEtBQUssQ0FBQyxXQUFOLEdBQW9CO1FBQ3BCLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjtRQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsNEJBQXZCO1FBQ1YsT0FBTyxDQUFDLFdBQVIsR0FBc0I7UUFDdEIsSUFBRyxDQUFJLE9BQVA7VUFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQWQsR0FBc0IsTUFEeEI7O2VBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxPQUFSLEVBZEY7O0lBSk07O3lCQW9CUixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBOztXQUNLLENBQUUsT0FBUCxDQUFBOzthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFIQTs7eUJBS1YsTUFBQSxHQUFRLFNBQUMsU0FBRDtNQUNOLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNqRCxjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtVQUNULElBQUcsTUFBQSxJQUFXLEtBQUMsQ0FBQSxFQUFFLENBQUMsZUFBSixDQUFvQixNQUFwQixDQUFkO1lBQ0UsS0FBQyxDQUFBLEVBQUUsQ0FBQyxtQkFBSixDQUF3QixHQUF4QixFQUE2QixJQUE3QjttQkFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLFNBQUosQ0FBQSxFQUZGO1dBQUEsTUFBQTttQkFJRSxLQUFDLENBQUEsUUFBRCxDQUFBLEVBSkY7O1FBRmlEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QyxDQUFWO0lBRk07Ozs7S0EvQ2U7QUFMekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1ZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgWWFwZlN0YXR1cyBleHRlbmRzIFZpZXdcbiAgc3ViczogbnVsbFxuICB0aWxlOiBudWxsXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJzdGF0dXMtYmFyLXB5dGhvbi15YXBmIGlubGluZS1ibG9ja1wiXG5cbiAgaW5pdGlhbGl6ZTogKEBwaSkgLT5cbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgdGhpc1xuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuICAgIEB0aWxlID0gbnVsbFxuICAgIEBzdWI/LmRpc3Bvc2UoKVxuICAgIEBzdWIgPSBudWxsXG5cbiAgY3JlYXRlRWxlbWVudDogKHR5cGUsIGNsYXNzZXMuLi4pIC0+XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSlcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQgY2xhc3Nlcy4uLlxuICAgIGVsZW1lbnRcblxuICB1cGRhdGU6IChub3RlLCBzdWNjZXNzKSAtPlxuICAgIEBoaWRlVGlsZSgpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBlZGl0b3IgYW5kIEBwaS5pc1B5dGhvbkNvbnRleHQgZWRpdG9yXG4gICAgICBAdGlsZSA9IEBzdGF0dXNCYXI/LmFkZExlZnRUaWxlXG4gICAgICAgIGl0ZW06IHRoaXNcbiAgICAgICAgcHJpb3JpdHk6IDEwXG5cbiAgICAgIHRpdGxlID0gQGNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG4gICAgICB0aXRsZS5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnXG4gICAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdZQVBGOiAnXG4gICAgICBAYXBwZW5kIHRpdGxlXG5cbiAgICAgIG1lc3NhZ2UgPSBAY3JlYXRlRWxlbWVudCAnc3BhbicsICdweXRob24teWFwZi1zdGF0dXMtbWVzc2FnZSdcbiAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBub3RlXG4gICAgICBpZiBub3Qgc3VjY2Vzc1xuICAgICAgICBtZXNzYWdlLnN0eWxlLmNvbG9yID0gJ3JlZCdcbiAgICAgIEBhcHBlbmQgbWVzc2FnZVxuXG4gIGhpZGVUaWxlOiAtPlxuICAgIEBlbXB0eSgpXG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuICAgIEB0aWxlID0gbnVsbFxuXG4gIGF0dGFjaDogKHN0YXR1c0JhcikgLT5cbiAgICBAc3RhdHVzQmFyID0gc3RhdHVzQmFyXG4gICAgQHN1YnMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgZWRpdG9yIGFuZCBAcGkuaXNQeXRob25Db250ZXh0IGVkaXRvclxuICAgICAgICBAcGkudXBkYXRlU3RhdHVzYmFyVGV4dCAn4qeXJywgdHJ1ZVxuICAgICAgICBAcGkuY2hlY2tDb2RlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGhpZGVUaWxlKClcbiJdfQ==
