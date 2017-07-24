(function() {
  var Dialog, PushTagsDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushTagsDialog = (function(superClass) {
    extend(PushTagsDialog, superClass);

    function PushTagsDialog() {
      return PushTagsDialog.__super__.constructor.apply(this, arguments);
    }

    PushTagsDialog.content = function() {
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
            return _this.strong('Push Tags');
          });
          return _this.div({
            "class": 'body'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'ptago'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to origin');
            });
            _this.button({
              "class": 'active',
              click: 'ptagup'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to upstream');
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

    PushTagsDialog.prototype.ptago = function() {
      var remote;
      this.deactivate();
      remote = 'origin';
      return this.parentView.ptag(remote);
    };

    PushTagsDialog.prototype.ptagup = function() {
      var remote;
      this.deactivate();
      remote = 'upstream';
      return this.parentView.ptag(remote);
    };

    return PushTagsDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wdXNoLXRhZ3MtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEwQixLQUFBLEVBQU8sUUFBakM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFdBQVI7VUFGcUIsQ0FBdkI7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sT0FBeEI7YUFBUixFQUF3QyxTQUFBO2NBQ3RDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxxQkFBTjtZQUZzQyxDQUF4QztZQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7Y0FBaUIsS0FBQSxFQUFPLFFBQXhCO2FBQVIsRUFBeUMsU0FBQTtjQUN2QyxLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sdUJBQU47WUFGdUMsQ0FBekM7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQTtjQUN2QixLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUZ1QixDQUF6QjtVQVBrQixDQUFwQjtRQUpvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFEUTs7NkJBaUJWLEtBQUEsR0FBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxNQUFBLEdBQVM7YUFDVCxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsTUFBakI7SUFISzs7NkJBS1AsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLE1BQUEsR0FBUzthQUNULElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixNQUFqQjtJQUhNOzs7O0tBdkJtQjtBQUo3QiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQdXNoVGFnc0RpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJyxjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnUHVzaCBUYWdzJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdwdGFnbycsPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gdmVyc2lvbnMnXG4gICAgICAgICAgQHNwYW4gJ1B1c2ggdGFncyB0byBvcmlnaW4nXG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ3B0YWd1cCcsPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gdmVyc2lvbnMnXG4gICAgICAgICAgQHNwYW4gJ1B1c2ggdGFncyB0byB1cHN0cmVhbSdcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuXG4gIHB0YWdvOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICByZW1vdGUgPSAnb3JpZ2luJ1xuICAgIEBwYXJlbnRWaWV3LnB0YWcocmVtb3RlKVxuXG4gIHB0YWd1cDogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgcmVtb3RlID0gJ3Vwc3RyZWFtJ1xuICAgIEBwYXJlbnRWaWV3LnB0YWcocmVtb3RlKVxuIl19
