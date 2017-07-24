(function() {
  var CMD_TOGGLE, CompositeDisposable, EVT_SWITCH, GitControl, GitControlView, git, item, pane, view, views;

  GitControlView = require('./git-control-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  git = require('./git');

  CMD_TOGGLE = 'git-control:toggle';

  EVT_SWITCH = 'pane-container:active-pane-item-changed';

  views = [];

  view = void 0;

  pane = void 0;

  item = void 0;

  module.exports = GitControl = {
    activate: function(state) {
      console.log('GitControl: activate');
      atom.commands.add('atom-workspace', CMD_TOGGLE, (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          return _this.updateViews();
        };
      })(this));
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this));
    },
    deactivate: function() {
      console.log('GitControl: deactivate');
    },
    toggleView: function() {
      console.log('GitControl: toggle');
      if (!(view && view.active)) {
        view = new GitControlView();
        views.push(view);
        pane = atom.workspace.getActivePane();
        item = pane.addItem(view, 0);
        pane.activateItem(item);
      } else {
        pane.destroyItem(item);
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    updateViews: function() {
      var activeView, i, len, v;
      activeView = atom.workspace.getActivePane().getActiveItem();
      for (i = 0, len = views.length; i < len; i++) {
        v = views[i];
        if (v === activeView) {
          v.update();
        }
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    serialize: function() {},
    config: {
      showGitFlowButton: {
        title: 'Show GitFlow button',
        description: 'Show the GitFlow button in the Git Control toolbar',
        type: 'boolean',
        "default": true
      },
      noFastForward: {
        title: 'Disable Fast Forward',
        description: 'Disable Fast Forward for default at Git Merge',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LWNvbnRyb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDaEIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sVUFBQSxHQUFhOztFQUNiLFVBQUEsR0FBYTs7RUFFYixLQUFBLEdBQVE7O0VBQ1IsSUFBQSxHQUFPOztFQUNQLElBQUEsR0FBTzs7RUFDUCxJQUFBLEdBQU87O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUVmO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7TUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLFVBQXBDLEVBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhEO01BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFBVSxLQUFDLENBQUEsV0FBRCxDQUFBO1FBQVY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO01BQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQUxRLENBQVY7SUFRQSxVQUFBLEVBQVksU0FBQTtNQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVo7SUFEVSxDQVJaO0lBWUEsVUFBQSxFQUFZLFNBQUE7TUFDVixPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaO01BRUEsSUFBQSxDQUFBLENBQU8sSUFBQSxJQUFTLElBQUksQ0FBQyxNQUFyQixDQUFBO1FBQ0UsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFBO1FBQ1gsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1FBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUFtQixDQUFuQjtRQUVQLElBQUksQ0FBQyxZQUFMLENBQWtCLElBQWxCLEVBUEY7T0FBQSxNQUFBO1FBVUUsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsRUFWRjs7SUFIVSxDQVpaO0lBNkJBLFdBQUEsRUFBYSxTQUFBO01BQ1YsR0FBRyxDQUFDLGVBQUosQ0FBb0IsQ0FBcEI7SUFEVSxDQTdCYjtJQWlDQSxXQUFBLEVBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxhQUEvQixDQUFBO0FBQ2IsV0FBQSx1Q0FBQTs7WUFBb0IsQ0FBQSxLQUFLO1VBQ3ZCLENBQUMsQ0FBQyxNQUFGLENBQUE7O0FBREY7SUFGVyxDQWpDYjtJQXVDQSxXQUFBLEVBQWEsU0FBQTtNQUVYLEdBQUcsQ0FBQyxlQUFKLENBQW9CLENBQXBCO0lBRlcsQ0F2Q2I7SUE0Q0EsU0FBQSxFQUFXLFNBQUEsR0FBQSxDQTVDWDtJQThDQSxNQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHFCQUFQO1FBQ0EsV0FBQSxFQUFhLG9EQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7T0FERjtNQUtBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxzQkFBUDtRQUNBLFdBQUEsRUFBYSwrQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BTkY7S0EvQ0Y7O0FBZEYiLCJzb3VyY2VzQ29udGVudCI6WyJHaXRDb250cm9sVmlldyA9IHJlcXVpcmUgJy4vZ2l0LWNvbnRyb2wtdmlldydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5naXQgPSByZXF1aXJlICcuL2dpdCdcblxuQ01EX1RPR0dMRSA9ICdnaXQtY29udHJvbDp0b2dnbGUnXG5FVlRfU1dJVENIID0gJ3BhbmUtY29udGFpbmVyOmFjdGl2ZS1wYW5lLWl0ZW0tY2hhbmdlZCdcblxudmlld3MgPSBbXVxudmlldyA9IHVuZGVmaW5lZFxucGFuZSA9IHVuZGVmaW5lZFxuaXRlbSA9IHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEdpdENvbnRyb2wgPVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgY29uc29sZS5sb2cgJ0dpdENvbnRyb2w6IGFjdGl2YXRlJ1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgQ01EX1RPR0dMRSwgPT4gQHRvZ2dsZVZpZXcoKVxuICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+IEB1cGRhdGVWaWV3cygpXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgPT4gQHVwZGF0ZVBhdGhzKClcbiAgICByZXR1cm5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIGNvbnNvbGUubG9nICdHaXRDb250cm9sOiBkZWFjdGl2YXRlJ1xuICAgIHJldHVyblxuXG4gIHRvZ2dsZVZpZXc6IC0+XG4gICAgY29uc29sZS5sb2cgJ0dpdENvbnRyb2w6IHRvZ2dsZSdcblxuICAgIHVubGVzcyB2aWV3IGFuZCB2aWV3LmFjdGl2ZVxuICAgICAgdmlldyA9IG5ldyBHaXRDb250cm9sVmlldygpXG4gICAgICB2aWV3cy5wdXNoIHZpZXdcblxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgaXRlbSA9IHBhbmUuYWRkSXRlbSB2aWV3LCAwXG5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtIGl0ZW1cblxuICAgIGVsc2VcbiAgICAgIHBhbmUuZGVzdHJveUl0ZW0gaXRlbVxuXG4gICAgcmV0dXJuXG5cbiAgdXBkYXRlUGF0aHM6IC0+XG4gICAgIGdpdC5zZXRQcm9qZWN0SW5kZXgoMClcbiAgICAgcmV0dXJuXG5cbiAgdXBkYXRlVmlld3M6IC0+XG4gICAgYWN0aXZlVmlldyA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRBY3RpdmVJdGVtKClcbiAgICBmb3IgdiBpbiB2aWV3cyB3aGVuIHYgaXMgYWN0aXZlVmlld1xuICAgICAgdi51cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIHVwZGF0ZVBhdGhzOiAtPlxuICAgICMgd2hlbiBwcm9qZWN0cyBwYXRocyBjaGFuZ2VkIHJlc3RhcnQgd2l0aGluIDBcbiAgICBnaXQuc2V0UHJvamVjdEluZGV4KDApO1xuICAgIHJldHVyblxuXG4gIHNlcmlhbGl6ZTogLT5cblxuICBjb25maWc6XG4gICAgc2hvd0dpdEZsb3dCdXR0b246XG4gICAgICB0aXRsZTogJ1Nob3cgR2l0RmxvdyBidXR0b24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgdGhlIEdpdEZsb3cgYnV0dG9uIGluIHRoZSBHaXQgQ29udHJvbCB0b29sYmFyJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgbm9GYXN0Rm9yd2FyZDpcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSBGYXN0IEZvcndhcmQnXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGUgRmFzdCBGb3J3YXJkIGZvciBkZWZhdWx0IGF0IEdpdCBNZXJnZSdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiJdfQ==
