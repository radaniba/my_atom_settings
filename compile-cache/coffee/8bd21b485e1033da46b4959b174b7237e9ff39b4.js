(function() {
  var Dialog, PushDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushDialog = (function(superClass) {
    extend(PushDialog, superClass);

    function PushDialog() {
      return PushDialog.__super__.constructor.apply(this, arguments);
    }

    PushDialog.content = function() {
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
            return _this.strong('Push');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.div(function() {
              return _this.button({
                click: 'upstream'
              }, function() {
                return _this.p('Push upstream', function() {
                  return _this.i({
                    "class": 'icon push'
                  });
                });
              });
            });
            _this.label('Push from branch');
            _this.input({
              "class": 'native-key-bindings',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('To branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'toBranch'
            });
            return _this.div(function() {
              _this.label('Force Push');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'force'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'push'
            }, function() {
              _this.i({
                "class": 'icon push'
              });
              return _this.span('Push');
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

    PushDialog.prototype.activate = function(remotes) {
      var i, len, remote;
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.find('option').remove();
      this.toBranch.append("<option value='origin'>origin</option>");
      for (i = 0, len = remotes.length; i < len; i++) {
        remote = remotes[i];
        this.toBranch.append("<option value='" + remote + "'>" + remote + "</option>");
      }
      return PushDialog.__super__.activate.call(this);
    };

    PushDialog.prototype.push = function() {
      var branch, remote;
      this.deactivate();
      remote = this.toBranch.val().split('/')[0];
      branch = git.getLocalBranch();
      this.parentView.push(remote, branch, this.Force());
    };

    PushDialog.prototype.upstream = function() {
      this.deactivate();
      return this.parentView.push('', '');
    };

    PushDialog.prototype.Force = function() {
      return this.force.is(':checked');
    };

    return PushDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wdXNoLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMEIsS0FBQSxFQUFPLFFBQWpDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO3FCQUNILEtBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsS0FBQSxFQUFPLFVBQVA7ZUFBUixFQUEwQixTQUFBO3VCQUN4QixLQUFDLENBQUEsQ0FBRCxDQUFHLGVBQUgsRUFBb0IsU0FBQTt5QkFDbEIsS0FBQyxDQUFBLENBQUQsQ0FBRztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7bUJBQUg7Z0JBRGtCLENBQXBCO2NBRHdCLENBQTFCO1lBREcsQ0FBTDtZQUlBLEtBQUMsQ0FBQSxLQUFELENBQU8sa0JBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE2QixRQUFBLEVBQVUsSUFBdkM7Y0FBNEMsTUFBQSxFQUFRLFlBQXBEO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFdBQVA7WUFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE2QixNQUFBLEVBQVEsVUFBckM7YUFBUjttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7Y0FDSCxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVA7cUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztnQkFBQSxJQUFBLEVBQU0sVUFBTjtnQkFBaUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUF4QjtnQkFBbUMsTUFBQSxFQUFRLE9BQTNDO2VBQVA7WUFGRyxDQUFMO1VBVGtCLENBQXBCO2lCQVlBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7Y0FBaUIsS0FBQSxFQUFPLE1BQXhCO2FBQVIsRUFBd0MsU0FBQTtjQUN0QyxLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTjtZQUZzQyxDQUF4QzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBaEJvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFEUTs7eUJBeUJWLFFBQUEsR0FBVSxTQUFDLE9BQUQ7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLEdBQUcsQ0FBQyxjQUFKLENBQUEsQ0FBaEI7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxRQUFmLENBQXdCLENBQUMsTUFBekIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQix3Q0FBakI7QUFDQSxXQUFBLHlDQUFBOztRQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixpQkFBQSxHQUFrQixNQUFsQixHQUF5QixJQUF6QixHQUE2QixNQUE3QixHQUFvQyxXQUFyRDtBQURGO0FBRUEsYUFBTyx1Q0FBQTtJQVBDOzt5QkFTVixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFBLENBQWUsQ0FBQyxLQUFoQixDQUFzQixHQUF0QixDQUEyQixDQUFBLENBQUE7TUFFcEMsTUFBQSxHQUFTLEdBQUcsQ0FBQyxjQUFKLENBQUE7TUFDVCxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsTUFBakIsRUFBd0IsTUFBeEIsRUFBK0IsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUEvQjtJQUxJOzt5QkFRTixRQUFBLEdBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsRUFBakIsRUFBb0IsRUFBcEI7SUFGUTs7eUJBSVYsS0FBQSxHQUFPLFNBQUE7QUFDTCxhQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFVBQVY7SUFERjs7OztLQS9DZ0I7QUFKekIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUHVzaERpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJyxjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnUHVzaCdcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBidXR0b24gY2xpY2s6ICd1cHN0cmVhbScsPT5cbiAgICAgICAgICAgIEBwICdQdXNoIHVwc3RyZWFtJywgPT5cbiAgICAgICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHB1c2gnXG4gICAgICAgIEBsYWJlbCAnUHVzaCBmcm9tIGJyYW5jaCdcbiAgICAgICAgQGlucHV0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycscmVhZG9ubHk6IHRydWUsb3V0bGV0OiAnZnJvbUJyYW5jaCdcbiAgICAgICAgQGxhYmVsICdUbyBicmFuY2gnXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJyxvdXRsZXQ6ICd0b0JyYW5jaCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBsYWJlbCAnRm9yY2UgUHVzaCdcbiAgICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JyxjbGFzczogJ2NoZWNrYm94JyxvdXRsZXQ6ICdmb3JjZSdcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAncHVzaCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHB1c2gnXG4gICAgICAgICAgQHNwYW4gJ1B1c2gnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IChyZW1vdGVzKSAtPlxuICAgIEBmcm9tQnJhbmNoLnZhbChnaXQuZ2V0TG9jYWxCcmFuY2goKSlcbiAgICBAdG9CcmFuY2guZmluZCgnb3B0aW9uJykucmVtb3ZlKClcbiAgICAjIGFkZCBzaW1wbGUgb3JpZ2luIGJyYW5jaFxuICAgIEB0b0JyYW5jaC5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdvcmlnaW4nPm9yaWdpbjwvb3B0aW9uPlwiXG4gICAgZm9yIHJlbW90ZSBpbiByZW1vdGVzXG4gICAgICBAdG9CcmFuY2guYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nI3tyZW1vdGV9Jz4je3JlbW90ZX08L29wdGlvbj5cIlxuICAgIHJldHVybiBzdXBlcigpXG5cbiAgcHVzaDogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgcmVtb3RlID0gQHRvQnJhbmNoLnZhbCgpLnNwbGl0KCcvJylbMF1cbiAgICAjIGJyYW5jaCA9IEB0b0JyYW5jaC52YWwoKS5zcGxpdCgnLycpWzFdXG4gICAgYnJhbmNoID0gZ2l0LmdldExvY2FsQnJhbmNoKClcbiAgICBAcGFyZW50Vmlldy5wdXNoKHJlbW90ZSxicmFuY2gsQEZvcmNlKCkpXG4gICAgcmV0dXJuXG5cbiAgdXBzdHJlYW06IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJlbnRWaWV3LnB1c2goJycsJycpXG5cbiAgRm9yY2U6IC0+XG4gICAgcmV0dXJuIEBmb3JjZS5pcygnOmNoZWNrZWQnKVxuIl19
