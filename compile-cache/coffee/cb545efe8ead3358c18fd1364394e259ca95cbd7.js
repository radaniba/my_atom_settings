(function() {
  var Dialog, MergeDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MergeDialog = (function(superClass) {
    extend(MergeDialog, superClass);

    function MergeDialog() {
      return MergeDialog.__super__.constructor.apply(this, arguments);
    }

    MergeDialog.content = function() {
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
            return _this.strong('Merge');
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
            _this.label('Merge From Branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
            return _this.div(function() {
              _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'noff'
              });
              return _this.label('No Fast-Forward');
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'merge'
            }, function() {
              _this.i({
                "class": 'icon merge'
              });
              return _this.span('Merge');
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

    MergeDialog.prototype.activate = function(branches) {
      var branch, current, i, len;
      current = git.getLocalBranch();
      if (atom.config.get("git-control.noFastForward")) {
        this.noff.prop("checked", true);
      }
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (i = 0, len = branches.length; i < len; i++) {
        branch = branches[i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return MergeDialog.__super__.activate.call(this);
    };

    MergeDialog.prototype.merge = function() {
      this.deactivate();
      this.parentView.merge(this.fromBranch.val(), this.noFF());
    };

    MergeDialog.prototype.noFF = function() {
      return this.noff.is(':checked');
    };

    return MergeDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9tZXJnZS1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3QkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsT0FBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsUUFBQSxFQUFVLElBQXREO2NBQTRELE1BQUEsRUFBUSxVQUFwRTthQUFQO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxtQkFBUDtZQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLE1BQUEsRUFBUSxZQUF0QzthQUFSO21CQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtjQUNILEtBQUMsQ0FBQSxLQUFELENBQU87Z0JBQUEsSUFBQSxFQUFNLFVBQU47Z0JBQWlCLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBeEI7Z0JBQW1DLE1BQUEsRUFBUSxNQUEzQztlQUFQO3FCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8saUJBQVA7WUFGRyxDQUFMO1VBTGtCLENBQXBCO2lCQVFBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7Y0FBaUIsS0FBQSxFQUFPLE9BQXhCO2FBQVIsRUFBeUMsU0FBQTtjQUN2QyxLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sT0FBTjtZQUZ1QyxDQUF6QzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBWm9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzswQkFxQlYsUUFBQSxHQUFVLFNBQUMsUUFBRDtBQUNSLFVBQUE7TUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLGNBQUosQ0FBQTtNQUVWLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQUFIO1FBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQURGOztNQUdBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE9BQWQ7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFBO0FBRUEsV0FBQSwwQ0FBQTs7WUFBNEIsTUFBQSxLQUFZO1VBQ3RDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixpQkFBQSxHQUFrQixNQUFsQixHQUF5QixJQUF6QixHQUE2QixNQUE3QixHQUFvQyxXQUF2RDs7QUFERjtBQUdBLGFBQU8sd0NBQUE7SUFaQzs7MEJBY1YsS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFBLENBQWxCLEVBQW9DLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBcEM7SUFGSzs7MEJBS1AsSUFBQSxHQUFNLFNBQUE7QUFDSCxhQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFVBQVQ7SUFESjs7OztLQXpDa0I7QUFMMUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNZXJnZURpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJywgY2xpY2s6ICdjYW5jZWwnXG4gICAgICAgIEBzdHJvbmcgJ01lcmdlJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0N1cnJlbnQgQnJhbmNoJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCByZWFkb25seTogdHJ1ZSwgb3V0bGV0OiAndG9CcmFuY2gnXG4gICAgICAgIEBsYWJlbCAnTWVyZ2UgRnJvbSBCcmFuY2gnXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnZnJvbUJyYW5jaCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLGNsYXNzOiAnY2hlY2tib3gnLG91dGxldDogJ25vZmYnXG4gICAgICAgICAgQGxhYmVsICdObyBGYXN0LUZvcndhcmQnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ21lcmdlJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gbWVyZ2UnXG4gICAgICAgICAgQHNwYW4gJ01lcmdlJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG4gIGFjdGl2YXRlOiAoYnJhbmNoZXMpIC0+XG4gICAgY3VycmVudCA9IGdpdC5nZXRMb2NhbEJyYW5jaCgpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJnaXQtY29udHJvbC5ub0Zhc3RGb3J3YXJkXCIpXG4gICAgICBAbm9mZi5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKVxuXG4gICAgQHRvQnJhbmNoLnZhbChjdXJyZW50KVxuICAgIEBmcm9tQnJhbmNoLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpXG5cbiAgICBmb3IgYnJhbmNoIGluIGJyYW5jaGVzIHdoZW4gYnJhbmNoIGlzbnQgY3VycmVudFxuICAgICAgQGZyb21CcmFuY2guYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nI3ticmFuY2h9Jz4je2JyYW5jaH08L29wdGlvbj5cIlxuXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBtZXJnZTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmVudFZpZXcubWVyZ2UoQGZyb21CcmFuY2gudmFsKCksQG5vRkYoKSlcbiAgICByZXR1cm5cblxuICBub0ZGOiAtPlxuICAgICByZXR1cm4gQG5vZmYuaXMoJzpjaGVja2VkJylcbiJdfQ==
