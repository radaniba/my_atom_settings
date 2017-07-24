(function() {
  var CommitDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = CommitDialog = (function(superClass) {
    extend(CommitDialog, superClass);

    function CommitDialog() {
      return CommitDialog.__super__.constructor.apply(this, arguments);
    }

    CommitDialog.content = function() {
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
            return _this.strong('Commit');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Commit Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg',
              keyUp: 'colorLength'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'commit'
            }, function() {
              _this.i({
                "class": 'icon commit'
              });
              return _this.span('Commit');
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

    CommitDialog.prototype.activate = function() {
      this.msg.val('');
      return CommitDialog.__super__.activate.call(this);
    };

    CommitDialog.prototype.colorLength = function() {
      var i, j, len, line, ref, too_long;
      too_long = false;
      ref = this.msg.val().split("\n");
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        line = ref[i];
        if ((i === 0 && line.length > 50) || (i > 0 && line.length > 80)) {
          too_long = true;
          break;
        }
      }
      if (too_long) {
        this.msg.addClass('over-fifty');
      } else {
        this.msg.removeClass('over-fifty');
      }
    };

    CommitDialog.prototype.commit = function() {
      this.deactivate();
      this.parentView.commit();
    };

    CommitDialog.prototype.getMessage = function() {
      return (this.msg.val()) + " ";
    };

    return CommitDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9jb21taXQtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0JBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVA7bUJBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBVTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLEtBQXRDO2NBQTZDLEtBQUEsRUFBTyxhQUFwRDthQUFWO1VBRmtCLENBQXBCO2lCQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7Y0FBaUIsS0FBQSxFQUFPLFFBQXhCO2FBQVIsRUFBMEMsU0FBQTtjQUN4QyxLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUZ3QyxDQUExQzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBUG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzsyQkFnQlYsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxFQUFUO0FBQ0EsYUFBTyx5Q0FBQTtJQUZDOzsyQkFJVixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxRQUFBLEdBQVc7QUFDWDtBQUFBLFdBQUEsNkNBQUE7O1FBQ0UsSUFBRyxDQUFDLENBQUEsS0FBSyxDQUFMLElBQVUsSUFBSSxDQUFDLE1BQUwsR0FBYyxFQUF6QixDQUFBLElBQWdDLENBQUMsQ0FBQSxHQUFJLENBQUosSUFBUyxJQUFJLENBQUMsTUFBTCxHQUFjLEVBQXhCLENBQW5DO1VBQ0UsUUFBQSxHQUFXO0FBQ1gsZ0JBRkY7O0FBREY7TUFLQSxJQUFHLFFBQUg7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxZQUFkLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLFlBQWpCLEVBSEY7O0lBUFc7OzJCQWFiLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBO0lBRk07OzJCQUtSLFVBQUEsR0FBWSxTQUFBO0FBQ1YsYUFBUyxDQUFDLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFBLENBQUQsQ0FBQSxHQUFZO0lBRFg7Ozs7S0F2Q2E7QUFIM0IiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29tbWl0RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnQ29tbWl0J1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0NvbW1pdCBNZXNzYWdlJ1xuICAgICAgICBAdGV4dGFyZWEgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnbXNnJywga2V5VXA6ICdjb2xvckxlbmd0aCdcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAnY29tbWl0JywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gY29tbWl0J1xuICAgICAgICAgIEBzcGFuICdDb21taXQnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQG1zZy52YWwoJycpXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBjb2xvckxlbmd0aDogLT5cbiAgICB0b29fbG9uZyA9IGZhbHNlXG4gICAgZm9yIGxpbmUsIGkgaW4gQG1zZy52YWwoKS5zcGxpdChcIlxcblwiKVxuICAgICAgaWYgKGkgPT0gMCAmJiBsaW5lLmxlbmd0aCA+IDUwKSB8fCAoaSA+IDAgJiYgbGluZS5sZW5ndGggPiA4MClcbiAgICAgICAgdG9vX2xvbmcgPSB0cnVlXG4gICAgICAgIGJyZWFrXG5cbiAgICBpZiB0b29fbG9uZ1xuICAgICAgQG1zZy5hZGRDbGFzcygnb3Zlci1maWZ0eScpXG4gICAgZWxzZVxuICAgICAgQG1zZy5yZW1vdmVDbGFzcygnb3Zlci1maWZ0eScpXG4gICAgcmV0dXJuXG5cbiAgY29tbWl0OiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyZW50Vmlldy5jb21taXQoKVxuICAgIHJldHVyblxuXG4gIGdldE1lc3NhZ2U6IC0+XG4gICAgcmV0dXJuIFwiI3tAbXNnLnZhbCgpfSBcIlxuIl19
