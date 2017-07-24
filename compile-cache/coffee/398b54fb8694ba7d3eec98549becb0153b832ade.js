(function() {
  var $, MenuItem, MenuView, View, items, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  items = [
    {
      id: 'project',
      menu: 'Project',
      icon: 'icon-repo',
      type: 'active'
    }, {
      id: 'compare',
      menu: 'Compare',
      icon: 'compare',
      type: 'active'
    }, {
      id: 'commit',
      menu: 'Commit',
      icon: 'commit',
      type: 'file merging'
    }, {
      id: 'tag',
      menu: 'Tag',
      icon: 'tag',
      type: 'active'
    }, {
      id: 'ptag',
      menu: 'Push Tags',
      icon: 'versions',
      type: 'active'
    }, {
      id: 'reset',
      menu: 'Reset',
      icon: 'sync',
      type: 'file'
    }, {
      id: 'fetch',
      menu: 'Fetch',
      icon: 'cloud-download',
      type: 'remote'
    }, {
      id: 'pull',
      menu: 'Pull',
      icon: 'pull',
      type: 'upstream'
    }, {
      id: 'pullup',
      menu: 'Pull Upstream',
      icon: 'desktop-download',
      type: 'active'
    }, {
      id: 'push',
      menu: 'Push',
      icon: 'push',
      type: 'downstream'
    }, {
      id: 'rebase',
      menu: 'Rebase',
      icon: 'circuit-board',
      type: 'active'
    }, {
      id: 'merge',
      menu: 'Merge',
      icon: 'merge',
      type: 'active'
    }, {
      id: 'branch',
      menu: 'Branch',
      icon: 'branch',
      type: 'active'
    }, {
      id: 'flow',
      menu: 'GitFlow',
      icon: 'flow',
      type: 'active',
      showConfig: 'git-control.showGitFlowButton'
    }
  ];

  MenuItem = (function(superClass) {
    extend(MenuItem, superClass);

    function MenuItem() {
      return MenuItem.__super__.constructor.apply(this, arguments);
    }

    MenuItem.content = function(item) {
      var klass;
      klass = item.type === 'active' ? '' : 'inactive';
      klass += (item.showConfig != null) && !atom.config.get(item.showConfig) ? ' hide' : '';
      return this.div({
        "class": "item " + klass + " " + item.type,
        id: "menu" + item.id,
        click: 'click'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "icon large " + item.icon
          });
          return _this.div(item.menu);
        };
      })(this));
    };

    MenuItem.prototype.initialize = function(item) {
      this.item = item;
      if (item.showConfig != null) {
        return atom.config.observe(item.showConfig, function(show) {
          if (show) {
            return $("#menu" + item.id).removeClass('hide');
          } else {
            return $("#menu" + item.id).addClass('hide');
          }
        });
      }
    };

    MenuItem.prototype.click = function() {
      return this.parentView.click(this.item.id);
    };

    return MenuItem;

  })(View);

  module.exports = MenuView = (function(superClass) {
    extend(MenuView, superClass);

    function MenuView() {
      return MenuView.__super__.constructor.apply(this, arguments);
    }

    MenuView.content = function(item) {
      return this.div({
        "class": 'menu'
      }, (function(_this) {
        return function() {
          var i, len, results;
          results = [];
          for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            results.push(_this.subview(item.id, new MenuItem(item)));
          }
          return results;
        };
      })(this));
    };

    MenuView.prototype.click = function(id) {
      if (!(this.find("#menu" + id).hasClass('inactive'))) {
        return this.parentView[id + "MenuClick"]();
      }
    };

    MenuView.prototype.activate = function(type, active) {
      var menuItems;
      menuItems = this.find(".item." + type);
      if (active) {
        menuItems.removeClass('inactive');
      } else {
        menuItems.addClass('inactive');
      }
    };

    return MenuView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvbWVudS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUNBQUE7SUFBQTs7O0VBQUEsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLGVBQUQsRUFBTzs7RUFFUCxLQUFBLEdBQVE7SUFDTjtNQUFFLEVBQUEsRUFBSSxTQUFOO01BQWlCLElBQUEsRUFBTSxTQUF2QjtNQUFrQyxJQUFBLEVBQU0sV0FBeEM7TUFBcUQsSUFBQSxFQUFNLFFBQTNEO0tBRE0sRUFFTjtNQUFFLEVBQUEsRUFBSSxTQUFOO01BQWlCLElBQUEsRUFBTSxTQUF2QjtNQUFrQyxJQUFBLEVBQU0sU0FBeEM7TUFBbUQsSUFBQSxFQUFNLFFBQXpEO0tBRk0sRUFHTjtNQUFFLEVBQUEsRUFBSSxRQUFOO01BQWdCLElBQUEsRUFBTSxRQUF0QjtNQUFnQyxJQUFBLEVBQU0sUUFBdEM7TUFBZ0QsSUFBQSxFQUFNLGNBQXREO0tBSE0sRUFJTjtNQUFFLEVBQUEsRUFBSSxLQUFOO01BQWEsSUFBQSxFQUFNLEtBQW5CO01BQTBCLElBQUEsRUFBTSxLQUFoQztNQUF1QyxJQUFBLEVBQU0sUUFBN0M7S0FKTSxFQUtOO01BQUUsRUFBQSxFQUFJLE1BQU47TUFBYyxJQUFBLEVBQU0sV0FBcEI7TUFBaUMsSUFBQSxFQUFNLFVBQXZDO01BQW1ELElBQUEsRUFBTSxRQUF6RDtLQUxNLEVBTU47TUFBRSxFQUFBLEVBQUksT0FBTjtNQUFlLElBQUEsRUFBTSxPQUFyQjtNQUE4QixJQUFBLEVBQU0sTUFBcEM7TUFBNEMsSUFBQSxFQUFNLE1BQWxEO0tBTk0sRUFRTjtNQUFFLEVBQUEsRUFBSSxPQUFOO01BQWUsSUFBQSxFQUFNLE9BQXJCO01BQThCLElBQUEsRUFBTSxnQkFBcEM7TUFBc0QsSUFBQSxFQUFNLFFBQTVEO0tBUk0s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Q0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtPQUFMLEVBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNsQixjQUFBO0FBQUE7ZUFBQSx1Q0FBQTs7eUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFzQixJQUFBLFFBQUEsQ0FBUyxJQUFULENBQXRCO0FBREY7O1FBRGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtJQURROzt1QkFLVixLQUFBLEdBQU8sU0FBQyxFQUFEO01BQ0wsSUFBRyxDQUFDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxPQUFBLEdBQVEsRUFBZCxDQUFtQixDQUFDLFFBQXBCLENBQTZCLFVBQTdCLENBQUQsQ0FBSjtlQUNFLElBQUMsQ0FBQSxVQUFXLENBQUcsRUFBRCxHQUFJLFdBQU4sQ0FBWixDQUFBLEVBREY7O0lBREs7O3VCQUlQLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ1IsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsSUFBRCxDQUFNLFFBQUEsR0FBUyxJQUFmO01BQ1osSUFBRyxNQUFIO1FBQ0UsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsVUFBdEIsRUFERjtPQUFBLE1BQUE7UUFHRSxTQUFTLENBQUMsUUFBVixDQUFtQixVQUFuQixFQUhGOztJQUZROzs7O0tBVlc7QUF6Q3ZCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsICR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbml0ZW1zID0gW1xuICB7IGlkOiAncHJvamVjdCcsIG1lbnU6ICdQcm9qZWN0JywgaWNvbjogJ2ljb24tcmVwbycsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAnY29tcGFyZScsIG1lbnU6ICdDb21wYXJlJywgaWNvbjogJ2NvbXBhcmUnLCB0eXBlOiAnYWN0aXZlJ31cbiAgeyBpZDogJ2NvbW1pdCcsIG1lbnU6ICdDb21taXQnLCBpY29uOiAnY29tbWl0JywgdHlwZTogJ2ZpbGUgbWVyZ2luZyd9XG4gIHsgaWQ6ICd0YWcnLCBtZW51OiAnVGFnJywgaWNvbjogJ3RhZycsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAncHRhZycsIG1lbnU6ICdQdXNoIFRhZ3MnLCBpY29uOiAndmVyc2lvbnMnLCB0eXBlOiAnYWN0aXZlJ31cbiAgeyBpZDogJ3Jlc2V0JywgbWVudTogJ1Jlc2V0JywgaWNvbjogJ3N5bmMnLCB0eXBlOiAnZmlsZSd9XG4gICMgeyBpZDogJ2Nsb25lJywgbWVudTogJ0Nsb25lJywgaWNvbjogJ2Nsb25lJ31cbiAgeyBpZDogJ2ZldGNoJywgbWVudTogJ0ZldGNoJywgaWNvbjogJ2Nsb3VkLWRvd25sb2FkJywgdHlwZTogJ3JlbW90ZSd9XG4gIHsgaWQ6ICdwdWxsJywgbWVudTogJ1B1bGwnLCBpY29uOiAncHVsbCcsIHR5cGU6ICd1cHN0cmVhbSd9XG4gIHsgaWQ6ICdwdWxsdXAnLCBtZW51OiAnUHVsbCBVcHN0cmVhbScsIGljb246ICdkZXNrdG9wLWRvd25sb2FkJywgdHlwZTogJ2FjdGl2ZSd9XG4gIHsgaWQ6ICdwdXNoJywgbWVudTogJ1B1c2gnLCBpY29uOiAncHVzaCcsIHR5cGU6ICdkb3duc3RyZWFtJ31cbiAgeyBpZDogJ3JlYmFzZScsIG1lbnU6ICdSZWJhc2UnLCBpY29uOiAnY2lyY3VpdC1ib2FyZCcsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAnbWVyZ2UnLCBtZW51OiAnTWVyZ2UnLCBpY29uOiAnbWVyZ2UnLCB0eXBlOiAnYWN0aXZlJ31cbiAgeyBpZDogJ2JyYW5jaCcsIG1lbnU6ICdCcmFuY2gnLCBpY29uOiAnYnJhbmNoJywgdHlwZTogJ2FjdGl2ZSd9XG4gIHsgaWQ6ICdmbG93JywgbWVudTogJ0dpdEZsb3cnLCBpY29uOiAnZmxvdycsIHR5cGU6ICdhY3RpdmUnLCBzaG93Q29uZmlnOiAnZ2l0LWNvbnRyb2wuc2hvd0dpdEZsb3dCdXR0b24nfVxuXVxuXG5jbGFzcyBNZW51SXRlbSBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChpdGVtKSAtPlxuICAgIGtsYXNzID0gaWYgaXRlbS50eXBlIGlzICdhY3RpdmUnIHRoZW4gJycgZWxzZSAnaW5hY3RpdmUnXG4gICAga2xhc3MgKz0gaWYgaXRlbS5zaG93Q29uZmlnPyAmJiAhYXRvbS5jb25maWcuZ2V0KGl0ZW0uc2hvd0NvbmZpZykgdGhlbiAnIGhpZGUnIGVsc2UgJydcblxuICAgIEBkaXYgY2xhc3M6IFwiaXRlbSAje2tsYXNzfSAje2l0ZW0udHlwZX1cIiwgaWQ6IFwibWVudSN7aXRlbS5pZH1cIiwgY2xpY2s6ICdjbGljaycsID0+XG4gICAgICBAZGl2IGNsYXNzOiBcImljb24gbGFyZ2UgI3tpdGVtLmljb259XCJcbiAgICAgIEBkaXYgaXRlbS5tZW51XG5cbiAgaW5pdGlhbGl6ZTogKGl0ZW0pIC0+XG4gICAgQGl0ZW0gPSBpdGVtXG5cbiAgICBpZiBpdGVtLnNob3dDb25maWc/XG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlIGl0ZW0uc2hvd0NvbmZpZywgKHNob3cpIC0+XG4gICAgICAgIGlmIHNob3cgdGhlbiAkKFwiI21lbnUje2l0ZW0uaWR9XCIpLnJlbW92ZUNsYXNzKCdoaWRlJylcbiAgICAgICAgZWxzZSAkKFwiI21lbnUje2l0ZW0uaWR9XCIpLmFkZENsYXNzKCdoaWRlJylcblxuICBjbGljazogLT5cbiAgICBAcGFyZW50Vmlldy5jbGljayhAaXRlbS5pZClcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWVudVZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoaXRlbSkgLT5cbiAgICBAZGl2IGNsYXNzOiAnbWVudScsID0+XG4gICAgICBmb3IgaXRlbSBpbiBpdGVtc1xuICAgICAgICBAc3VidmlldyBpdGVtLmlkLCBuZXcgTWVudUl0ZW0oaXRlbSlcblxuICBjbGljazogKGlkKSAtPlxuICAgIGlmICEoQGZpbmQoXCIjbWVudSN7aWR9XCIpLmhhc0NsYXNzKCdpbmFjdGl2ZScpKVxuICAgICAgQHBhcmVudFZpZXdbXCIje2lkfU1lbnVDbGlja1wiXSgpXG5cbiAgYWN0aXZhdGU6ICh0eXBlLCBhY3RpdmUpIC0+XG4gICAgbWVudUl0ZW1zID0gQGZpbmQoXCIuaXRlbS4je3R5cGV9XCIpXG4gICAgaWYgYWN0aXZlXG4gICAgICBtZW51SXRlbXMucmVtb3ZlQ2xhc3MoJ2luYWN0aXZlJylcbiAgICBlbHNlXG4gICAgICBtZW51SXRlbXMuYWRkQ2xhc3MoJ2luYWN0aXZlJylcblxuICAgIHJldHVyblxuIl19
