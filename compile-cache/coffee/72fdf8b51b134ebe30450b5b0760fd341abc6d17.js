(function() {
  var BranchDialog, Dialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = BranchDialog = (function(superClass) {
    extend(BranchDialog, superClass);

    function BranchDialog() {
      return BranchDialog.__super__.constructor.apply(this, arguments);
    }

    BranchDialog.content = function() {
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
            return _this.strong('Branch');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Branch');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('New Branch');
            return _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'toBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'branch'
            }, function() {
              _this.i({
                "class": 'icon branch'
              });
              return _this.span('Branch');
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

    BranchDialog.prototype.activate = function() {
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.val('');
      return BranchDialog.__super__.activate.call(this);
    };

    BranchDialog.prototype.branch = function() {
      this.deactivate();
      this.parentView.createBranch(this.toBranch.val());
    };

    return BranchDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9icmFuY2gtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFFBQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsSUFBQSxFQUFNLE1BQXBDO2NBQTRDLFFBQUEsRUFBVSxJQUF0RDtjQUE0RCxNQUFBLEVBQVEsWUFBcEU7YUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUDttQkFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsTUFBQSxFQUFRLFVBQXBEO2FBQVA7VUFKa0IsQ0FBcEI7aUJBS0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRndDLENBQTFDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFUb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzJCQWtCVixRQUFBLEdBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixHQUFHLENBQUMsY0FBSixDQUFBLENBQWhCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsRUFBZDtBQUNBLGFBQU8seUNBQUE7SUFIQzs7MkJBS1YsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxZQUFaLENBQXlCLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFBLENBQXpCO0lBRk07Ozs7S0F4QmlCO0FBTDNCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQnJhbmNoRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnQnJhbmNoJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0N1cnJlbnQgQnJhbmNoJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCByZWFkb25seTogdHJ1ZSwgb3V0bGV0OiAnZnJvbUJyYW5jaCdcbiAgICAgICAgQGxhYmVsICdOZXcgQnJhbmNoJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCBvdXRsZXQ6ICd0b0JyYW5jaCdcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAnYnJhbmNoJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gYnJhbmNoJ1xuICAgICAgICAgIEBzcGFuICdCcmFuY2gnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGZyb21CcmFuY2gudmFsKGdpdC5nZXRMb2NhbEJyYW5jaCgpKVxuICAgIEB0b0JyYW5jaC52YWwoJycpXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBicmFuY2g6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJlbnRWaWV3LmNyZWF0ZUJyYW5jaChAdG9CcmFuY2gudmFsKCkpXG4gICAgcmV0dXJuXG4iXX0=
