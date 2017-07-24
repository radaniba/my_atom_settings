(function() {
  var CompositeDisposable, GitTimeMachine, GitTimeMachineView;

  GitTimeMachineView = require('./git-time-machine-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = GitTimeMachine = {
    gitTimeMachineView: null,
    timelinePanel: null,
    subscriptions: null,
    activate: function(state) {
      this.gitTimeMachineView = new GitTimeMachineView(state.gitTimeMachineViewState);
      this.timelinePanel = atom.workspace.addBottomPanel({
        item: this.gitTimeMachineView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'git-time-machine:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          return _this._onDidChangeActivePaneItem();
        };
      })(this));
    },
    deactivate: function() {
      this.timelinePanel.destroy();
      this.subscriptions.dispose();
      return this.gitTimeMachineView.destroy();
    },
    serialize: function() {
      return {
        gitTimeMachineViewState: this.gitTimeMachineView.serialize()
      };
    },
    toggle: function() {
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.hide();
        return this.timelinePanel.hide();
      } else {
        this.timelinePanel.show();
        this.gitTimeMachineView.show();
        return this.gitTimeMachineView.setEditor(atom.workspace.getActiveTextEditor());
      }
    },
    _onDidChangeActivePaneItem: function(editor) {
      editor = atom.workspace.getActiveTextEditor();
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.setEditor(editor);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZS1tYWNoaW5lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHlCQUFSOztFQUNwQixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGNBQUEsR0FDZjtJQUFBLGtCQUFBLEVBQW9CLElBQXBCO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFFQSxhQUFBLEVBQWUsSUFGZjtJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsa0JBQUQsR0FBMEIsSUFBQSxrQkFBQSxDQUFtQixLQUFLLENBQUMsdUJBQXpCO01BQzFCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsa0JBQWtCLENBQUMsVUFBcEIsQ0FBQSxDQUFOO1FBQXdDLE9BQUEsRUFBUyxLQUFqRDtPQUE5QjtNQUdqQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCO09BQXBDLENBQW5CO2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFBWSxLQUFDLENBQUEsMEJBQUQsQ0FBQTtRQUFaO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztJQVRRLENBSlY7SUFnQkEsVUFBQSxFQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO2FBQ0EsSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLENBQUE7SUFIVSxDQWhCWjtJQXNCQSxTQUFBLEVBQVcsU0FBQTthQUNUO1FBQUEsdUJBQUEsRUFBeUIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFNBQXBCLENBQUEsQ0FBekI7O0lBRFMsQ0F0Qlg7SUEwQkEsTUFBQSxFQUFRLFNBQUE7TUFFTixJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBLEVBRkY7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUE7UUFDQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxTQUFwQixDQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBOUIsRUFORjs7SUFGTSxDQTFCUjtJQXFDQSwwQkFBQSxFQUE0QixTQUFDLE1BQUQ7TUFDMUIsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsQ0FBSDtRQUNFLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxTQUFwQixDQUE4QixNQUE5QixFQURGOztJQUYwQixDQXJDNUI7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJHaXRUaW1lTWFjaGluZVZpZXcgPSByZXF1aXJlICcuL2dpdC10aW1lLW1hY2hpbmUtdmlldydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID0gR2l0VGltZU1hY2hpbmUgPVxuICBnaXRUaW1lTWFjaGluZVZpZXc6IG51bGxcbiAgdGltZWxpbmVQYW5lbDogbnVsbFxuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZ2l0VGltZU1hY2hpbmVWaWV3ID0gbmV3IEdpdFRpbWVNYWNoaW5lVmlldyBzdGF0ZS5naXRUaW1lTWFjaGluZVZpZXdTdGF0ZVxuICAgIEB0aW1lbGluZVBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogQGdpdFRpbWVNYWNoaW5lVmlldy5nZXRFbGVtZW50KCksIHZpc2libGU6IGZhbHNlKVxuXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgICMgUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdnaXQtdGltZS1tYWNoaW5lOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGVkaXRvcikgPT4gQF9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKClcblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHRpbWVsaW5lUGFuZWwuZGVzdHJveSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGdpdFRpbWVNYWNoaW5lVmlldy5kZXN0cm95KClcblxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBnaXRUaW1lTWFjaGluZVZpZXdTdGF0ZTogQGdpdFRpbWVNYWNoaW5lVmlldy5zZXJpYWxpemUoKVxuXG5cbiAgdG9nZ2xlOiAtPlxuICAgICMgY29uc29sZS5sb2cgJ0dpdFRpbWVNYWNoaW5lIHdhcyBvcGVuZWQhJ1xuICAgIGlmIEB0aW1lbGluZVBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAZ2l0VGltZU1hY2hpbmVWaWV3LmhpZGUoKVxuICAgICAgQHRpbWVsaW5lUGFuZWwuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgQHRpbWVsaW5lUGFuZWwuc2hvdygpXG4gICAgICBAZ2l0VGltZU1hY2hpbmVWaWV3LnNob3coKVxuICAgICAgQGdpdFRpbWVNYWNoaW5lVmlldy5zZXRFZGl0b3IgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cblxuICBfb25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbTogKGVkaXRvcikgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBAdGltZWxpbmVQYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGdpdFRpbWVNYWNoaW5lVmlldy5zZXRFZGl0b3IoZWRpdG9yKVxuICAgIHJldHVyblxuIl19
