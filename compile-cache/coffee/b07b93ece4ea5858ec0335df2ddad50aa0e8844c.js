(function() {
  var CreateTagDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = CreateTagDialog = (function(superClass) {
    extend(CreateTagDialog, superClass);

    function CreateTagDialog() {
      return CreateTagDialog.__super__.constructor.apply(this, arguments);
    }

    CreateTagDialog.content = function() {
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
            return _this.strong('Tag');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Tag name');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'name'
            });
            _this.label('commit ref');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'href'
            });
            _this.label('Tag Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'tag'
            }, function() {
              _this.i({
                "class": 'icon tag'
              });
              return _this.span('Create Tag');
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

    CreateTagDialog.prototype.tag = function() {
      this.deactivate();
      this.parentView.tag(this.Name(), this.Href(), this.Msg());
    };

    CreateTagDialog.prototype.Name = function() {
      return this.name.val();
    };

    CreateTagDialog.prototype.Href = function() {
      return this.href.val();
    };

    CreateTagDialog.prototype.Msg = function() {
      return this.msg.val();
    };

    return CreateTagDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9jcmVhdGUtdGFnLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsS0FBRCxDQUFPLFVBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsTUFBQSxFQUFRLE1BQXBEO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsTUFBQSxFQUFRLE1BQXBEO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGFBQVA7bUJBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBVTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLEtBQXRDO2FBQVY7VUFOa0IsQ0FBcEI7aUJBT0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sS0FBeEI7YUFBUixFQUF1QyxTQUFBO2NBQ3JDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFOO1lBRnFDLENBQXZDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFYb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzhCQW9CVixHQUFBLEdBQUssU0FBQTtNQUNILElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFoQixFQUF5QixJQUFDLENBQUEsSUFBRCxDQUFBLENBQXpCLEVBQWtDLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FBbEM7SUFGRzs7OEJBS0wsSUFBQSxHQUFNLFNBQUE7QUFDSixhQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO0lBREg7OzhCQUdOLElBQUEsR0FBTSxTQUFBO0FBQ0osYUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtJQURIOzs4QkFHTixHQUFBLEdBQUssU0FBQTtBQUNILGFBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQUE7SUFESjs7OztLQWhDdUI7QUFIOUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ3JlYXRlVGFnRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnVGFnJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ1RhZyBuYW1lJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCBvdXRsZXQ6ICduYW1lJ1xuICAgICAgICBAbGFiZWwgJ2NvbW1pdCByZWYnXG4gICAgICAgIEBpbnB1dCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCB0eXBlOiAndGV4dCcsIG91dGxldDogJ2hyZWYnXG4gICAgICAgIEBsYWJlbCAnVGFnIE1lc3NhZ2UnXG4gICAgICAgIEB0ZXh0YXJlYSBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdtc2cnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ3RhZycsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHRhZydcbiAgICAgICAgICBAc3BhbiAnQ3JlYXRlIFRhZydcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICB0YWc6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJlbnRWaWV3LnRhZyhATmFtZSgpLCBASHJlZigpLCBATXNnKCkpXG4gICAgcmV0dXJuXG5cbiAgTmFtZTogLT5cbiAgICByZXR1cm4gQG5hbWUudmFsKClcblxuICBIcmVmOiAtPlxuICAgIHJldHVybiBAaHJlZi52YWwoKVxuXG4gIE1zZzogLT5cbiAgICByZXR1cm4gQG1zZy52YWwoKVxuIl19
