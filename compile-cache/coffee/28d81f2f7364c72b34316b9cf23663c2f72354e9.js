(function() {
  var Dialog, MidrebaseDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MidrebaseDialog = (function(superClass) {
    extend(MidrebaseDialog, superClass);

    function MidrebaseDialog() {
      return MidrebaseDialog.__super__.constructor.apply(this, arguments);
    }

    MidrebaseDialog.content = function() {
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
            return _this.strong('It appears that you are in the middle of a rebase, would you like to:');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Continue the rebase');
            _this.input({
              type: 'checkbox',
              "class": 'checkbox',
              outlet: 'contin'
            });
            _this.div(function() {
              _this.label('Abort the rebase');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'abort'
              });
            });
            return _this.div(function() {
              _this.label('Skip the patch');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'skip'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'midrebase'
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

    MidrebaseDialog.prototype.midrebase = function() {
      this.deactivate();
      this.parentView.midrebase(this.Contin(), this.Abort(), this.Skip());
    };

    MidrebaseDialog.prototype.Contin = function() {
      return this.contin.is(':checked');
    };

    MidrebaseDialog.prototype.Abort = function() {
      return this.abort.is(':checked');
    };

    MidrebaseDialog.prototype.Skip = function() {
      return this.skip.is(':checked');
    };

    return MidrebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9taWRyZWJhc2UtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLHVFQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxxQkFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxJQUFBLEVBQU0sVUFBTjtjQUFpQixDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQXhCO2NBQW1DLE1BQUEsRUFBUSxRQUEzQzthQUFQO1lBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO2NBQ0gsS0FBQyxDQUFBLEtBQUQsQ0FBTyxrQkFBUDtxQkFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2dCQUFBLElBQUEsRUFBTSxVQUFOO2dCQUFpQixDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQXhCO2dCQUFtQyxNQUFBLEVBQVEsT0FBM0M7ZUFBUDtZQUZHLENBQUw7bUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO2NBQ0gsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUDtxQkFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2dCQUFBLElBQUEsRUFBTSxVQUFOO2dCQUFpQixDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQXhCO2dCQUFtQyxNQUFBLEVBQVEsTUFBM0M7ZUFBUDtZQUZHLENBQUw7VUFOa0IsQ0FBcEI7aUJBU0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sV0FBeEI7YUFBUixFQUE2QyxTQUFBO2NBQzNDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUYyQyxDQUE3QzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBYm9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzs4QkFzQlYsU0FBQSxHQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBdEIsRUFBZ0MsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFoQyxFQUF5QyxJQUFDLENBQUEsSUFBRCxDQUFBLENBQXpDO0lBRlM7OzhCQUtYLE1BQUEsR0FBUSxTQUFBO0FBQ04sYUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxVQUFYO0lBREQ7OzhCQUdSLEtBQUEsR0FBTyxTQUFBO0FBQ0wsYUFBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWO0lBREY7OzhCQUdQLElBQUEsR0FBTSxTQUFBO0FBQ0osYUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxVQUFUO0lBREg7Ozs7S0FsQ3NCO0FBTDlCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWlkcmViYXNlRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnSXQgYXBwZWFycyB0aGF0IHlvdSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBhIHJlYmFzZSwgd291bGQgeW91IGxpa2UgdG86J1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0NvbnRpbnVlIHRoZSByZWJhc2UnXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLGNsYXNzOiAnY2hlY2tib3gnLG91dGxldDogJ2NvbnRpbidcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBsYWJlbCAnQWJvcnQgdGhlIHJlYmFzZSdcbiAgICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JyxjbGFzczogJ2NoZWNrYm94JyxvdXRsZXQ6ICdhYm9ydCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBsYWJlbCAnU2tpcCB0aGUgcGF0Y2gnXG4gICAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsY2xhc3M6ICdjaGVja2JveCcsb3V0bGV0OiAnc2tpcCdcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAnbWlkcmViYXNlJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gY2lyY3VpdC1ib2FyZCdcbiAgICAgICAgICBAc3BhbiAnUmViYXNlJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG4gIG1pZHJlYmFzZTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmVudFZpZXcubWlkcmViYXNlKEBDb250aW4oKSxAQWJvcnQoKSxAU2tpcCgpKVxuICAgIHJldHVyblxuXG4gIENvbnRpbjogLT5cbiAgICByZXR1cm4gQGNvbnRpbi5pcygnOmNoZWNrZWQnKVxuXG4gIEFib3J0OiAtPlxuICAgIHJldHVybiBAYWJvcnQuaXMoJzpjaGVja2VkJylcblxuICBTa2lwOiAtPlxuICAgIHJldHVybiBAc2tpcC5pcygnOmNoZWNrZWQnKVxuIl19
