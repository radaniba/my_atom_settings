(function() {
  var Dialog, RebaseDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = RebaseDialog = (function(superClass) {
    extend(RebaseDialog, superClass);

    function RebaseDialog() {
      return RebaseDialog.__super__.constructor.apply(this, arguments);
    }

    RebaseDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Rebase');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Branch');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              readonly: true,
              outlet: 'toBranch'
            });
            _this.label('Rebase On Branch');
            return _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'rebase'
            }, function() {
              _this.i({
                "class": 'icon circuit-board'
              });
              return _this.span('Rebase');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    RebaseDialog.prototype.activate = function(branches) {
      var branch, current, i, len;
      current = git.getLocalBranch();
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (i = 0, len = branches.length; i < len; i++) {
        branch = branches[i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return RebaseDialog.__super__.activate.call(this);
    };

    RebaseDialog.prototype.rebase = function() {
      this.deactivate();
      this.parentView.rebase(this.fromBranch.val());
    };

    return RebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9yZWJhc2UtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFFBQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsSUFBQSxFQUFNLE1BQXBDO2NBQTRDLFFBQUEsRUFBVSxJQUF0RDtjQUE0RCxNQUFBLEVBQVEsVUFBcEU7YUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sa0JBQVA7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLFlBQXRDO2FBQVI7VUFKa0IsQ0FBcEI7aUJBTUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUZ3QyxDQUExQzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBVm9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzsyQkFtQlYsUUFBQSxHQUFVLFNBQUMsUUFBRDtBQUNSLFVBQUE7TUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLGNBQUosQ0FBQTtNQUVWLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE9BQWQ7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFBO0FBRUEsV0FBQSwwQ0FBQTs7WUFBNEIsTUFBQSxLQUFZO1VBQ3RDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixpQkFBQSxHQUFrQixNQUFsQixHQUF5QixJQUF6QixHQUE2QixNQUE3QixHQUFvQyxXQUF2RDs7QUFERjtBQUdBLGFBQU8seUNBQUE7SUFUQzs7MkJBV1YsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFBLENBQW5CO0lBRk07Ozs7S0EvQmlCO0FBTDNCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmViYXNlRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnUmViYXNlJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0N1cnJlbnQgQnJhbmNoJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCByZWFkb25seTogdHJ1ZSwgb3V0bGV0OiAndG9CcmFuY2gnXG4gICAgICAgIEBsYWJlbCAnUmViYXNlIE9uIEJyYW5jaCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdmcm9tQnJhbmNoJ1xuICAgICAgICBcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAncmViYXNlJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gY2lyY3VpdC1ib2FyZCdcbiAgICAgICAgICBAc3BhbiAnUmViYXNlJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG4gIGFjdGl2YXRlOiAoYnJhbmNoZXMpIC0+XG4gICAgY3VycmVudCA9IGdpdC5nZXRMb2NhbEJyYW5jaCgpXG5cbiAgICBAdG9CcmFuY2gudmFsKGN1cnJlbnQpXG4gICAgQGZyb21CcmFuY2guZmluZCgnb3B0aW9uJykucmVtb3ZlKClcblxuICAgIGZvciBicmFuY2ggaW4gYnJhbmNoZXMgd2hlbiBicmFuY2ggaXNudCBjdXJyZW50XG4gICAgICBAZnJvbUJyYW5jaC5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje2JyYW5jaH0nPiN7YnJhbmNofTwvb3B0aW9uPlwiXG5cbiAgICByZXR1cm4gc3VwZXIoKVxuXG4gIHJlYmFzZTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmVudFZpZXcucmViYXNlKEBmcm9tQnJhbmNoLnZhbCgpKVxuXG4gICAgcmV0dXJuXG4iXX0=
