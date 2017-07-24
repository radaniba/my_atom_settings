(function() {
  var $, GitTimeplotPopup, RevisionView, View, moment, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  moment = require('moment');

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplotPopup = (function(superClass) {
    extend(GitTimeplotPopup, superClass);

    function GitTimeplotPopup() {
      this._onShowRevision = bind(this._onShowRevision, this);
      this._onMouseLeave = bind(this._onMouseLeave, this);
      this._onMouseEnter = bind(this._onMouseEnter, this);
      this.isMouseInPopup = bind(this.isMouseInPopup, this);
      this.remove = bind(this.remove, this);
      this.hide = bind(this.hide, this);
      return GitTimeplotPopup.__super__.constructor.apply(this, arguments);
    }

    GitTimeplotPopup.content = function(commitData, editor, start, end) {
      var dateFormat;
      dateFormat = "MMM DD YYYY ha";
      return this.div({
        "class": "select-list popover-list git-timemachine-popup"
      }, (function(_this) {
        return function() {
          _this.h5("There were " + commitData.length + " commits between");
          _this.h6((start.format(dateFormat)) + " and " + (end.format(dateFormat)));
          return _this.ul(function() {
            var authorDate, commit, i, len, linesAdded, linesDeleted, results;
            results = [];
            for (i = 0, len = commitData.length; i < len; i++) {
              commit = commitData[i];
              authorDate = moment.unix(commit.authorDate);
              linesAdded = commit.linesAdded || 0;
              linesDeleted = commit.linesDeleted || 0;
              results.push(_this.li({
                "data-rev": commit.hash,
                click: '_onShowRevision'
              }, function() {
                return _this.div({
                  "class": "commit"
                }, function() {
                  _this.div({
                    "class": "header"
                  }, function() {
                    _this.div("" + (authorDate.format(dateFormat)));
                    _this.div("" + commit.hash);
                    return _this.div(function() {
                      _this.span({
                        "class": 'added-count'
                      }, "+" + linesAdded + " ");
                      return _this.span({
                        "class": 'removed-count'
                      }, "-" + linesDeleted + " ");
                    });
                  });
                  _this.div(function() {
                    return _this.strong("" + commit.message);
                  });
                  return _this.div("Authored by " + commit.authorName + " " + (authorDate.fromNow()));
                });
              }));
            }
            return results;
          });
        };
      })(this));
    };

    GitTimeplotPopup.prototype.initialize = function(commitData, editor1) {
      this.editor = editor1;
      this.file = this.editor.getPath();
      this.appendTo(atom.views.getView(atom.workspace));
      this.mouseenter(this._onMouseEnter);
      return this.mouseleave(this._onMouseLeave);
    };

    GitTimeplotPopup.prototype.hide = function() {
      this._mouseInPopup = false;
      return GitTimeplotPopup.__super__.hide.apply(this, arguments);
    };

    GitTimeplotPopup.prototype.remove = function() {
      if (!this._mouseInPopup) {
        return GitTimeplotPopup.__super__.remove.apply(this, arguments);
      }
    };

    GitTimeplotPopup.prototype.isMouseInPopup = function() {
      return this._mouseInPopup === true;
    };

    GitTimeplotPopup.prototype._onMouseEnter = function(evt) {
      this._mouseInPopup = true;
    };

    GitTimeplotPopup.prototype._onMouseLeave = function(evt) {
      this.hide();
    };

    GitTimeplotPopup.prototype._onShowRevision = function(evt) {
      var revHash;
      revHash = $(evt.target).closest('li').data('rev');
      return RevisionView.showRevision(this.editor, revHash);
    };

    return GitTimeplotPopup;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZXBsb3QtcG9wdXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvREFBQTtJQUFBOzs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBRUosWUFBQSxHQUFlLE9BQUEsQ0FBUSxxQkFBUjs7RUFHZixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs7Ozs7OztJQUVyQixnQkFBQyxDQUFBLE9BQUQsR0FBVyxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLEtBQXJCLEVBQTRCLEdBQTVCO0FBQ1QsVUFBQTtNQUFBLFVBQUEsR0FBYTthQUNiLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdEQUFQO09BQUwsRUFBOEQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzVELEtBQUMsQ0FBQSxFQUFELENBQUksYUFBQSxHQUFjLFVBQVUsQ0FBQyxNQUF6QixHQUFnQyxrQkFBcEM7VUFDQSxLQUFDLENBQUEsRUFBRCxDQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxVQUFiLENBQUQsQ0FBQSxHQUEwQixPQUExQixHQUFnQyxDQUFDLEdBQUcsQ0FBQyxNQUFKLENBQVcsVUFBWCxDQUFELENBQXRDO2lCQUNBLEtBQUMsQ0FBQSxFQUFELENBQUksU0FBQTtBQUNGLGdCQUFBO0FBQUE7aUJBQUEsNENBQUE7O2NBQ0UsVUFBQSxHQUFhLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBTSxDQUFDLFVBQW5CO2NBQ2IsVUFBQSxHQUFhLE1BQU0sQ0FBQyxVQUFQLElBQXFCO2NBQ2xDLFlBQUEsR0FBZSxNQUFNLENBQUMsWUFBUCxJQUF1QjsyQkFDdEMsS0FBQyxDQUFBLEVBQUQsQ0FBSTtnQkFBQSxVQUFBLEVBQVksTUFBTSxDQUFDLElBQW5CO2dCQUF5QixLQUFBLEVBQU8saUJBQWhDO2VBQUosRUFBdUQsU0FBQTt1QkFDckQsS0FBQyxDQUFBLEdBQUQsQ0FBSztrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7aUJBQUwsRUFBc0IsU0FBQTtrQkFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7bUJBQUwsRUFBc0IsU0FBQTtvQkFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxFQUFBLEdBQUUsQ0FBQyxVQUFVLENBQUMsTUFBWCxDQUFrQixVQUFsQixDQUFELENBQVA7b0JBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxFQUFBLEdBQUcsTUFBTSxDQUFDLElBQWY7MkJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO3NCQUNILEtBQUMsQ0FBQSxJQUFELENBQU07d0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO3VCQUFOLEVBQTRCLEdBQUEsR0FBSSxVQUFKLEdBQWUsR0FBM0M7NkJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTt3QkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7dUJBQU4sRUFBOEIsR0FBQSxHQUFJLFlBQUosR0FBaUIsR0FBL0M7b0JBRkcsQ0FBTDtrQkFIb0IsQ0FBdEI7a0JBT0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBOzJCQUNILEtBQUMsQ0FBQSxNQUFELENBQVEsRUFBQSxHQUFHLE1BQU0sQ0FBQyxPQUFsQjtrQkFERyxDQUFMO3lCQUdBLEtBQUMsQ0FBQSxHQUFELENBQUssY0FBQSxHQUFlLE1BQU0sQ0FBQyxVQUF0QixHQUFpQyxHQUFqQyxHQUFtQyxDQUFDLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBRCxDQUF4QztnQkFYb0IsQ0FBdEI7Y0FEcUQsQ0FBdkQ7QUFKRjs7VUFERSxDQUFKO1FBSDREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RDtJQUZTOzsrQkF5QlgsVUFBQSxHQUFZLFNBQUMsVUFBRCxFQUFhLE9BQWI7TUFBYSxJQUFDLENBQUEsU0FBRDtNQUN2QixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBO01BQ1IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQVY7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxhQUFiO2FBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsYUFBYjtJQUpVOzsrQkFPWixJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBQ2pCLDRDQUFBLFNBQUE7SUFGSTs7K0JBS04sTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFBLENBQU8sSUFBQyxDQUFBLGFBQVI7ZUFDRSw4Q0FBQSxTQUFBLEVBREY7O0lBRE07OytCQUtSLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLGFBQU8sSUFBQyxDQUFBLGFBQUQsS0FBa0I7SUFEWDs7K0JBSWhCLGFBQUEsR0FBZSxTQUFDLEdBQUQ7TUFFYixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZKOzsrQkFNZixhQUFBLEdBQWUsU0FBQyxHQUFEO01BQ2IsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQURhOzsrQkFLZixlQUFBLEdBQWlCLFNBQUMsR0FBRDtBQUNmLFVBQUE7TUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEdBQUcsQ0FBQyxNQUFOLENBQWEsQ0FBQyxPQUFkLENBQXNCLElBQXRCLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsS0FBakM7YUFDVixZQUFZLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsT0FBbkM7SUFGZTs7OztLQTNENkI7QUFOaEQiLCJzb3VyY2VzQ29udGVudCI6WyJtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG57JCwgVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXG5SZXZpc2lvblZpZXcgPSByZXF1aXJlICcuL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgR2l0VGltZXBsb3RQb3B1cCBleHRlbmRzIFZpZXdcblxuICBAY29udGVudCA9IChjb21taXREYXRhLCBlZGl0b3IsIHN0YXJ0LCBlbmQpIC0+XG4gICAgZGF0ZUZvcm1hdCA9IFwiTU1NIEREIFlZWVkgaGFcIlxuICAgIEBkaXYgY2xhc3M6IFwic2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IGdpdC10aW1lbWFjaGluZS1wb3B1cFwiLCA9PlxuICAgICAgQGg1IFwiVGhlcmUgd2VyZSAje2NvbW1pdERhdGEubGVuZ3RofSBjb21taXRzIGJldHdlZW5cIlxuICAgICAgQGg2IFwiI3tzdGFydC5mb3JtYXQoZGF0ZUZvcm1hdCl9IGFuZCAje2VuZC5mb3JtYXQoZGF0ZUZvcm1hdCl9XCJcbiAgICAgIEB1bCA9PlxuICAgICAgICBmb3IgY29tbWl0IGluIGNvbW1pdERhdGFcbiAgICAgICAgICBhdXRob3JEYXRlID0gbW9tZW50LnVuaXgoY29tbWl0LmF1dGhvckRhdGUpXG4gICAgICAgICAgbGluZXNBZGRlZCA9IGNvbW1pdC5saW5lc0FkZGVkIHx8IDBcbiAgICAgICAgICBsaW5lc0RlbGV0ZWQgPSBjb21taXQubGluZXNEZWxldGVkIHx8IDBcbiAgICAgICAgICBAbGkgXCJkYXRhLXJldlwiOiBjb21taXQuaGFzaCwgY2xpY2s6ICdfb25TaG93UmV2aXNpb24nLCA9PlxuICAgICAgICAgICAgQGRpdiBjbGFzczogXCJjb21taXRcIiwgPT5cbiAgICAgICAgICAgICAgQGRpdiBjbGFzczogXCJoZWFkZXJcIiwgPT5cbiAgICAgICAgICAgICAgICBAZGl2IFwiI3thdXRob3JEYXRlLmZvcm1hdChkYXRlRm9ybWF0KX1cIlxuICAgICAgICAgICAgICAgIEBkaXYgXCIje2NvbW1pdC5oYXNofVwiXG4gICAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdhZGRlZC1jb3VudCcsIFwiKyN7bGluZXNBZGRlZH0gXCJcbiAgICAgICAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAncmVtb3ZlZC1jb3VudCcsIFwiLSN7bGluZXNEZWxldGVkfSBcIlxuXG4gICAgICAgICAgICAgIEBkaXYgPT5cbiAgICAgICAgICAgICAgICBAc3Ryb25nIFwiI3tjb21taXQubWVzc2FnZX1cIlxuXG4gICAgICAgICAgICAgIEBkaXYgXCJBdXRob3JlZCBieSAje2NvbW1pdC5hdXRob3JOYW1lfSAje2F1dGhvckRhdGUuZnJvbU5vdygpfVwiXG5cblxuICBpbml0aWFsaXplOiAoY29tbWl0RGF0YSwgQGVkaXRvcikgLT5cbiAgICBAZmlsZSA9IEBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgQGFwcGVuZFRvIGF0b20udmlld3MuZ2V0VmlldyBhdG9tLndvcmtzcGFjZVxuICAgIEBtb3VzZWVudGVyIEBfb25Nb3VzZUVudGVyXG4gICAgQG1vdXNlbGVhdmUgQF9vbk1vdXNlTGVhdmVcblxuICAgIFxuICBoaWRlOiAoKSA9PlxuICAgIEBfbW91c2VJblBvcHVwID0gZmFsc2VcbiAgICBzdXBlclxuXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHVubGVzcyBAX21vdXNlSW5Qb3B1cFxuICAgICAgc3VwZXJcblxuXG4gIGlzTW91c2VJblBvcHVwOiAoKSA9PlxuICAgIHJldHVybiBAX21vdXNlSW5Qb3B1cCA9PSB0cnVlXG5cblxuICBfb25Nb3VzZUVudGVyOiAoZXZ0KSA9PlxuICAgICMgY29uc29sZS5sb2cgJ21vdXNlIGluIHBvcHVwJ1xuICAgIEBfbW91c2VJblBvcHVwID0gdHJ1ZVxuICAgIHJldHVyblxuXG5cbiAgX29uTW91c2VMZWF2ZTogKGV2dCkgPT5cbiAgICBAaGlkZSgpXG4gICAgcmV0dXJuXG5cblxuICBfb25TaG93UmV2aXNpb246IChldnQpID0+XG4gICAgcmV2SGFzaCA9ICQoZXZ0LnRhcmdldCkuY2xvc2VzdCgnbGknKS5kYXRhKCdyZXYnKVxuICAgIFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24oQGVkaXRvciwgcmV2SGFzaClcblxuIl19
