(function() {
  var BranchItem, BranchView, View, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  git = require('../git');

  BranchItem = (function(superClass) {
    extend(BranchItem, superClass);

    function BranchItem() {
      return BranchItem.__super__.constructor.apply(this, arguments);
    }

    BranchItem.content = function(branch) {
      var bklass, cklass, dclass;
      bklass = branch.current ? 'active' : '';
      cklass = branch.count.total ? '' : 'invisible';
      dclass = branch.current || !branch.local ? 'invisible' : '';
      return this.div({
        "class": "branch " + bklass,
        'data-name': branch.name
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info'
          }, function() {
            _this.i({
              "class": 'icon chevron-right'
            });
            return _this.span({
              "class": 'clickable',
              click: 'checkout'
            }, branch.name);
          });
          _this.div({
            "class": "right-info " + dclass
          }, function() {
            return _this.i({
              "class": 'icon trash clickable',
              click: 'deleteThis'
            });
          });
          return _this.div({
            "class": "right-info count " + cklass
          }, function() {
            _this.span(branch.count.ahead);
            _this.i({
              "class": 'icon cloud-upload'
            });
            _this.span(branch.count.behind);
            return _this.i({
              "class": 'icon cloud-download'
            });
          });
        };
      })(this));
    };

    BranchItem.prototype.initialize = function(branch) {
      return this.branch = branch;
    };

    BranchItem.prototype.checkout = function() {
      return this.branch.checkout(this.branch.name);
    };

    BranchItem.prototype.deleteThis = function() {
      return this.branch["delete"](this.branch.name);
    };

    return BranchItem;

  })(View);

  module.exports = BranchView = (function(superClass) {
    extend(BranchView, superClass);

    function BranchView() {
      return BranchView.__super__.constructor.apply(this, arguments);
    }

    BranchView.content = function(params) {
      return this.div({
        "class": 'branches'
      }, (function(_this) {
        return function() {
          return _this.div({
            click: 'toggleBranch',
            "class": 'heading clickable'
          }, function() {
            _this.i({
              "class": 'icon branch'
            });
            return _this.span(params.name);
          });
        };
      })(this));
    };

    BranchView.prototype.initialize = function(params) {
      this.params = params;
      this.branches = [];
      return this.hidden = false;
    };

    BranchView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.branches);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    BranchView.prototype.clearAll = function() {
      this.find('>.branch').remove();
    };

    BranchView.prototype.addAll = function(branches) {
      var checkout, remove;
      this.branches = branches;
      this.selectedBranch = git["get" + (this.params.local ? 'Local' : 'Remote') + "Branch"]();
      this.clearAll();
      remove = (function(_this) {
        return function(name) {
          return _this.deleteBranch(name);
        };
      })(this);
      checkout = (function(_this) {
        return function(name) {
          return _this.checkoutBranch(name);
        };
      })(this);
      branches.forEach((function(_this) {
        return function(branch) {
          var count, current;
          current = _this.params.local && branch === _this.selectedBranch;
          count = {
            total: 0
          };
          if (current) {
            count = git.count(branch);
            count.total = count.ahead + count.behind;
            _this.parentView.branchCount(count);
          }
          _this.append(new BranchItem({
            name: branch,
            count: count,
            current: current,
            local: _this.params.local,
            "delete": remove,
            checkout: checkout
          }));
        };
      })(this));
    };

    BranchView.prototype.checkoutBranch = function(name) {
      this.parentView.checkoutBranch(name, !this.params.local);
    };

    BranchView.prototype.deleteBranch = function(name) {
      this.parentView.deleteBranch(name);
    };

    return BranchView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvYnJhbmNoLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOzs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUjs7RUFFVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRUE7Ozs7Ozs7SUFDSixVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRDtBQUNSLFVBQUE7TUFBQSxNQUFBLEdBQVksTUFBTSxDQUFDLE9BQVYsR0FBdUIsUUFBdkIsR0FBcUM7TUFDOUMsTUFBQSxHQUFZLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBaEIsR0FBMkIsRUFBM0IsR0FBbUM7TUFDNUMsTUFBQSxHQUFZLE1BQU0sQ0FBQyxPQUFQLElBQWtCLENBQUMsTUFBTSxDQUFDLEtBQTdCLEdBQXdDLFdBQXhDLEdBQXlEO2FBRWxFLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQUEsR0FBVSxNQUFqQjtRQUEyQixXQUFBLEVBQWEsTUFBTSxDQUFDLElBQS9DO09BQUwsRUFBMEQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3hELEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDtjQUFvQixLQUFBLEVBQU8sVUFBM0I7YUFBTixFQUE2QyxNQUFNLENBQUMsSUFBcEQ7VUFGa0IsQ0FBcEI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFBLEdBQWMsTUFBckI7V0FBTCxFQUFvQyxTQUFBO21CQUNsQyxLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxzQkFBUDtjQUErQixLQUFBLEVBQU8sWUFBdEM7YUFBSDtVQURrQyxDQUFwQztpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBQSxHQUFvQixNQUEzQjtXQUFMLEVBQTBDLFNBQUE7WUFDeEMsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQW5CO1lBQ0EsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUJBQVA7YUFBSDtZQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFuQjttQkFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDthQUFIO1VBSndDLENBQTFDO1FBTndEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRDtJQUxROzt5QkFpQlYsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFEQTs7eUJBR1osUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUF6QjtJQURROzt5QkFHVixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxNQUFNLEVBQUMsTUFBRCxFQUFQLENBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUF2QjtJQURVOzs7O0tBeEJXOztFQTJCekIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFEO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBUDtPQUFMLEVBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDdEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLEtBQUEsRUFBTyxjQUFQO1lBQXVCLENBQUEsS0FBQSxDQUFBLEVBQU8sbUJBQTlCO1dBQUwsRUFBd0QsU0FBQTtZQUN0RCxLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFNLENBQUMsSUFBYjtVQUZzRCxDQUF4RDtRQURzQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7SUFEUTs7eUJBTVYsVUFBQSxHQUFZLFNBQUMsTUFBRDtNQUNWLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUhBOzt5QkFLWixZQUFBLEdBQWUsU0FBQTtNQUNiLElBQUcsSUFBQyxDQUFBLE1BQUo7UUFBZ0IsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsUUFBVCxFQUFoQjtPQUFBLE1BQUE7UUFBMEMsSUFBQyxDQUFBLFFBQUosQ0FBQSxFQUF2Qzs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsSUFBQyxDQUFBO0lBRkM7O3lCQUlmLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLENBQWlCLENBQUMsTUFBbEIsQ0FBQTtJQURROzt5QkFJVixNQUFBLEdBQVEsU0FBQyxRQUFEO0FBQ04sVUFBQTtNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsY0FBRCxHQUFrQixHQUFJLENBQUEsS0FBQSxHQUFLLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFYLEdBQXNCLE9BQXRCLEdBQW1DLFFBQXBDLENBQUwsR0FBa0QsUUFBbEQsQ0FBSixDQUFBO01BQ2xCLElBQUMsQ0FBQSxRQUFELENBQUE7TUFFQSxNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQVUsS0FBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkO1FBQVY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BQ1QsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLEtBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCO1FBQVY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRVgsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDZixjQUFBO1VBQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixJQUFrQixNQUFBLEtBQVUsS0FBQyxDQUFBO1VBQ3ZDLEtBQUEsR0FBUTtZQUFBLEtBQUEsRUFBTyxDQUFQOztVQUVSLElBQUcsT0FBSDtZQUNFLEtBQUEsR0FBUSxHQUFHLENBQUMsS0FBSixDQUFVLE1BQVY7WUFDUixLQUFLLENBQUMsS0FBTixHQUFjLEtBQUssQ0FBQyxLQUFOLEdBQWMsS0FBSyxDQUFDO1lBRWxDLEtBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUF3QixLQUF4QixFQUpGOztVQU1BLEtBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxVQUFBLENBQ1Y7WUFBQSxJQUFBLEVBQU0sTUFBTjtZQUNBLEtBQUEsRUFBTyxLQURQO1lBRUEsT0FBQSxFQUFTLE9BRlQ7WUFHQSxLQUFBLEVBQU8sS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUhmO1lBSUEsQ0FBQSxNQUFBLENBQUEsRUFBUSxNQUpSO1lBS0EsUUFBQSxFQUFVLFFBTFY7V0FEVSxDQUFaO1FBVmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBUk07O3lCQTZCUixjQUFBLEdBQWdCLFNBQUMsSUFBRDtNQUNkLElBQUMsQ0FBQSxVQUFVLENBQUMsY0FBWixDQUEyQixJQUEzQixFQUFpQyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBMUM7SUFEYzs7eUJBSWhCLFlBQUEsR0FBYyxTQUFDLElBQUQ7TUFDWixJQUFDLENBQUEsVUFBVSxDQUFDLFlBQVosQ0FBeUIsSUFBekI7SUFEWTs7OztLQXJEUztBQWhDekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5jbGFzcyBCcmFuY2hJdGVtIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKGJyYW5jaCkgLT5cbiAgICBia2xhc3MgPSBpZiBicmFuY2guY3VycmVudCB0aGVuICdhY3RpdmUnIGVsc2UgJydcbiAgICBja2xhc3MgPSBpZiBicmFuY2guY291bnQudG90YWwgdGhlbiAnJyBlbHNlICdpbnZpc2libGUnXG4gICAgZGNsYXNzID0gaWYgYnJhbmNoLmN1cnJlbnQgb3IgIWJyYW5jaC5sb2NhbCB0aGVuICdpbnZpc2libGUnIGVsc2UgJydcblxuICAgIEBkaXYgY2xhc3M6IFwiYnJhbmNoICN7YmtsYXNzfVwiLCAnZGF0YS1uYW1lJzogYnJhbmNoLm5hbWUsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaW5mbycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjaGV2cm9uLXJpZ2h0J1xuICAgICAgICBAc3BhbiBjbGFzczogJ2NsaWNrYWJsZScsIGNsaWNrOiAnY2hlY2tvdXQnLCBicmFuY2gubmFtZVxuICAgICAgQGRpdiBjbGFzczogXCJyaWdodC1pbmZvICN7ZGNsYXNzfVwiLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24gdHJhc2ggY2xpY2thYmxlJywgY2xpY2s6ICdkZWxldGVUaGlzJ1xuICAgICAgQGRpdiBjbGFzczogXCJyaWdodC1pbmZvIGNvdW50ICN7Y2tsYXNzfVwiLCA9PlxuICAgICAgICBAc3BhbiBicmFuY2guY291bnQuYWhlYWRcbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIGNsb3VkLXVwbG9hZCdcbiAgICAgICAgQHNwYW4gYnJhbmNoLmNvdW50LmJlaGluZFxuICAgICAgICBAaSBjbGFzczogJ2ljb24gY2xvdWQtZG93bmxvYWQnXG5cbiAgaW5pdGlhbGl6ZTogKGJyYW5jaCkgLT5cbiAgICBAYnJhbmNoID0gYnJhbmNoXG5cbiAgY2hlY2tvdXQ6IC0+XG4gICAgQGJyYW5jaC5jaGVja291dChAYnJhbmNoLm5hbWUpXG5cbiAgZGVsZXRlVGhpczogLT5cbiAgICBAYnJhbmNoLmRlbGV0ZShAYnJhbmNoLm5hbWUpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEJyYW5jaFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAocGFyYW1zKSAtPlxuICAgIEBkaXYgY2xhc3M6ICdicmFuY2hlcycsID0+XG4gICAgICBAZGl2IGNsaWNrOiAndG9nZ2xlQnJhbmNoJywgY2xhc3M6ICdoZWFkaW5nIGNsaWNrYWJsZScsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiBicmFuY2gnXG4gICAgICAgIEBzcGFuIHBhcmFtcy5uYW1lXG5cbiAgaW5pdGlhbGl6ZTogKHBhcmFtcykgLT5cbiAgICBAcGFyYW1zID0gcGFyYW1zXG4gICAgQGJyYW5jaGVzID0gW11cbiAgICBAaGlkZGVuID0gZmFsc2VcblxuICB0b2dnbGVCcmFuY2ggOiAtPlxuICAgIGlmIEBoaWRkZW4gdGhlbiBAYWRkQWxsIEBicmFuY2hlcyBlbHNlIGRvIEBjbGVhckFsbFxuICAgIEBoaWRkZW4gPSAhQGhpZGRlblxuXG4gIGNsZWFyQWxsOiAtPlxuICAgIEBmaW5kKCc+LmJyYW5jaCcpLnJlbW92ZSgpXG4gICAgcmV0dXJuXG5cbiAgYWRkQWxsOiAoYnJhbmNoZXMpIC0+XG4gICAgQGJyYW5jaGVzID0gYnJhbmNoZXNcbiAgICBAc2VsZWN0ZWRCcmFuY2ggPSBnaXRbXCJnZXQje2lmIEBwYXJhbXMubG9jYWwgdGhlbiAnTG9jYWwnIGVsc2UgJ1JlbW90ZSd9QnJhbmNoXCJdKClcbiAgICBAY2xlYXJBbGwoKVxuXG4gICAgcmVtb3ZlID0gKG5hbWUpID0+IEBkZWxldGVCcmFuY2gobmFtZSlcbiAgICBjaGVja291dCA9IChuYW1lKSA9PiBAY2hlY2tvdXRCcmFuY2gobmFtZSlcblxuICAgIGJyYW5jaGVzLmZvckVhY2ggKGJyYW5jaCkgPT5cbiAgICAgIGN1cnJlbnQgPSBAcGFyYW1zLmxvY2FsIGFuZCBicmFuY2ggaXMgQHNlbGVjdGVkQnJhbmNoXG4gICAgICBjb3VudCA9IHRvdGFsOiAwXG5cbiAgICAgIGlmIGN1cnJlbnRcbiAgICAgICAgY291bnQgPSBnaXQuY291bnQoYnJhbmNoKVxuICAgICAgICBjb3VudC50b3RhbCA9IGNvdW50LmFoZWFkICsgY291bnQuYmVoaW5kXG5cbiAgICAgICAgQHBhcmVudFZpZXcuYnJhbmNoQ291bnQoY291bnQpXG5cbiAgICAgIEBhcHBlbmQgbmV3IEJyYW5jaEl0ZW1cbiAgICAgICAgbmFtZTogYnJhbmNoXG4gICAgICAgIGNvdW50OiBjb3VudFxuICAgICAgICBjdXJyZW50OiBjdXJyZW50XG4gICAgICAgIGxvY2FsOiBAcGFyYW1zLmxvY2FsXG4gICAgICAgIGRlbGV0ZTogcmVtb3ZlXG4gICAgICAgIGNoZWNrb3V0OiBjaGVja291dFxuXG4gICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICBjaGVja291dEJyYW5jaDogKG5hbWUpIC0+XG4gICAgQHBhcmVudFZpZXcuY2hlY2tvdXRCcmFuY2gobmFtZSwgIUBwYXJhbXMubG9jYWwpXG4gICAgcmV0dXJuXG5cbiAgZGVsZXRlQnJhbmNoOiAobmFtZSkgLT5cbiAgICBAcGFyZW50Vmlldy5kZWxldGVCcmFuY2gobmFtZSlcbiAgICByZXR1cm5cbiJdfQ==
