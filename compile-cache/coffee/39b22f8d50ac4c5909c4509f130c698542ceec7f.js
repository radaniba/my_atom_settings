(function() {
  var DeleteDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = DeleteDialog = (function(superClass) {
    extend(DeleteDialog, superClass);

    function DeleteDialog() {
      return DeleteDialog.__super__.constructor.apply(this, arguments);
    }

    DeleteDialog.content = function(params) {
      return this.div({
        "class": 'dialog active'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong(params.hdr);
          });
          _this.div({
            "class": 'body'
          }, function() {
            return _this.div(params.msg);
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'delete'
            }, function() {
              _this.i({
                "class": 'icon check'
              });
              return _this.span('Yes');
            });
            _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('No');
            });
            return _this.button({
              "class": 'warningText',
              click: 'forceDelete'
            }, function() {
              _this.i({
                "class": 'icon trash'
              });
              return _this.span('FORCE DELETE');
            });
          });
        };
      })(this));
    };

    DeleteDialog.prototype.initialize = function(params) {
      return this.params = params;
    };

    DeleteDialog.prototype["delete"] = function() {
      this.deactivate();
      this.params.cb(this.params);
    };

    DeleteDialog.prototype.forceDelete = function() {
      this.deactivate();
      this.params.fdCb(this.params);
    };

    return DeleteDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9kZWxldGUtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0JBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRDthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7T0FBTCxFQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDM0IsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFNLENBQUMsR0FBZjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO21CQUNsQixLQUFDLENBQUEsR0FBRCxDQUFLLE1BQU0sQ0FBQyxHQUFaO1VBRGtCLENBQXBCO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7Y0FBaUIsS0FBQSxFQUFPLFFBQXhCO2FBQVIsRUFBMEMsU0FBQTtjQUN4QyxLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBTjtZQUZ3QyxDQUExQztZQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLElBQU47WUFGdUIsQ0FBekI7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtjQUFzQixLQUFBLEVBQU8sYUFBN0I7YUFBUixFQUFvRCxTQUFBO2NBQ2hELEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTyxjQUFQO1lBRmdELENBQXBEO1VBUHFCLENBQXZCO1FBTjJCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtJQURROzsyQkFrQlYsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFEQTs7NEJBR1osUUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsSUFBQyxDQUFBLE1BQVo7SUFGTTs7MkJBS1IsV0FBQSxHQUFhLFNBQUE7TUFDWCxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLE1BQWQ7SUFGVzs7OztLQTNCWTtBQUgzQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEZWxldGVEaWFsb2cgZXh0ZW5kcyBEaWFsb2dcbiAgQGNvbnRlbnQ6IChwYXJhbXMpIC0+XG4gICAgQGRpdiBjbGFzczogJ2RpYWxvZyBhY3RpdmUnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyBwYXJhbXMuaGRyXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBkaXYgcGFyYW1zLm1zZ1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdkZWxldGUnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjaGVjaydcbiAgICAgICAgICBAc3BhbiAnWWVzJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnTm8nXG4gICAgICAgIEBidXR0b24gY2xhc3M6ICd3YXJuaW5nVGV4dCcsIGNsaWNrOiAnZm9yY2VEZWxldGUnLCA9PlxuICAgICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHRyYXNoJ1xuICAgICAgICAgICAgQHNwYW4gICdGT1JDRSBERUxFVEUnXG5cbiAgaW5pdGlhbGl6ZTogKHBhcmFtcykgLT5cbiAgICBAcGFyYW1zID0gcGFyYW1zXG5cbiAgZGVsZXRlOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyYW1zLmNiKEBwYXJhbXMpXG4gICAgcmV0dXJuXG5cbiAgZm9yY2VEZWxldGU6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJhbXMuZmRDYihAcGFyYW1zKVxuICAgIHJldHVyblxuIl19
