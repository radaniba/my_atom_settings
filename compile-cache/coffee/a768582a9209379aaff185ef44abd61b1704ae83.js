(function() {
  var ConfirmDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = ConfirmDialog = (function(superClass) {
    extend(ConfirmDialog, superClass);

    function ConfirmDialog() {
      return ConfirmDialog.__super__.constructor.apply(this, arguments);
    }

    ConfirmDialog.content = function(params) {
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
              click: 'confirm'
            }, function() {
              _this.i({
                "class": 'icon check'
              });
              return _this.span('Yes');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('No');
            });
          });
        };
      })(this));
    };

    ConfirmDialog.prototype.initialize = function(params) {
      return this.params = params;
    };

    ConfirmDialog.prototype.confirm = function() {
      this.deactivate();
      this.params.cb(this.params);
    };

    return ConfirmDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9jb25maXJtLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQ7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO09BQUwsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzNCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBTSxDQUFDLEdBQWY7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTttQkFDbEIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxNQUFNLENBQUMsR0FBWjtVQURrQixDQUFwQjtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxTQUF4QjthQUFSLEVBQTJDLFNBQUE7Y0FDekMsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLEtBQU47WUFGeUMsQ0FBM0M7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQTtjQUN2QixLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtZQUZ1QixDQUF6QjtVQUpxQixDQUF2QjtRQU4yQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7SUFEUTs7NEJBZVYsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFEQTs7NEJBR1osT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsSUFBQyxDQUFBLE1BQVo7SUFGTzs7OztLQW5CaUI7QUFINUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29uZmlybURpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogKHBhcmFtcykgLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nIGFjdGl2ZScsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4IGNsaWNrYWJsZScsIGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nIHBhcmFtcy5oZHJcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGRpdiBwYXJhbXMubXNnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ2NvbmZpcm0nLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjaGVjaydcbiAgICAgICAgICBAc3BhbiAnWWVzJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnTm8nXG5cbiAgaW5pdGlhbGl6ZTogKHBhcmFtcykgLT5cbiAgICBAcGFyYW1zID0gcGFyYW1zXG5cbiAgY29uZmlybTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmFtcy5jYihAcGFyYW1zKVxuICAgIHJldHVyblxuIl19
