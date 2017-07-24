(function() {
  var Dialog, ProjectDialog, git, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  path = require('path');

  module.exports = ProjectDialog = (function(superClass) {
    extend(ProjectDialog, superClass);

    function ProjectDialog() {
      return ProjectDialog.__super__.constructor.apply(this, arguments);
    }

    ProjectDialog.content = function() {
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
            return _this.strong('Project');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Project');
            return _this.select({
              outlet: 'projectList'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'changeProject'
            }, function() {
              _this.i({
                "class": 'icon icon-repo-pull'
              });
              return _this.span('Change');
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

    ProjectDialog.prototype.activate = function() {
      var fn, i, len, projectIndex, projectList, ref, repo;
      projectIndex = 0;
      projectList = this.projectList;
      projectList.html('');
      ref = atom.project.getRepositories();
      fn = function(repo) {
        var option;
        if (repo) {
          option = document.createElement("option");
          option.value = projectIndex;
          option.text = path.basename(path.resolve(repo.path, '..'));
          projectList.append(option);
        }
        return projectIndex = projectIndex + 1;
      };
      for (i = 0, len = ref.length; i < len; i++) {
        repo = ref[i];
        fn(repo);
      }
      projectList.val(git.getProjectIndex);
      return ProjectDialog.__super__.activate.call(this);
    };

    ProjectDialog.prototype.changeProject = function() {
      var repo;
      this.deactivate();
      git.setProjectIndex(this.projectList.val());
      repo = git.getRepository();
      this.parentView.setWorkspaceTitle(repo.path.split('/').reverse()[1]);
      this.parentView.update();
    };

    return ProjectDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wcm9qZWN0LWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsU0FBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8saUJBQVA7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLE1BQUEsRUFBUSxhQUFSO2FBQVI7VUFGa0IsQ0FBcEI7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sZUFBeEI7YUFBUixFQUFpRCxTQUFBO2NBQy9DLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUYrQyxDQUFqRDttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBSnFCLENBQXZCO1FBUG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzs0QkFnQlYsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsWUFBQSxHQUFlO01BQ2YsV0FBQSxHQUFjLElBQUMsQ0FBQTtNQUNmLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEVBQWpCO0FBQ0E7V0FDSSxTQUFDLElBQUQ7QUFDQSxZQUFBO1FBQUEsSUFBRyxJQUFIO1VBQ0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO1VBQ1QsTUFBTSxDQUFDLEtBQVAsR0FBZTtVQUNmLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxJQUFsQixFQUF3QixJQUF4QixDQUFkO1VBQ2QsV0FBVyxDQUFDLE1BQVosQ0FBbUIsTUFBbkIsRUFKRjs7ZUFLQSxZQUFBLEdBQWUsWUFBQSxHQUFlO01BTjlCO0FBREosV0FBQSxxQ0FBQTs7V0FDSztBQURMO01BU0EsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsR0FBRyxDQUFDLGVBQXBCO0FBRUEsYUFBTywwQ0FBQTtJQWZDOzs0QkFpQlYsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLEdBQUcsQ0FBQyxlQUFKLENBQW9CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFBLENBQXBCO01BQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxhQUFKLENBQUE7TUFFUCxJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFaLENBQThCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixDQUFnQixHQUFoQixDQUFvQixDQUFDLE9BQXJCLENBQUEsQ0FBK0IsQ0FBQSxDQUFBLENBQTdEO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUE7SUFOYTs7OztLQWxDVztBQU41QiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUHJvamVjdERpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJywgY2xpY2s6ICdjYW5jZWwnXG4gICAgICAgIEBzdHJvbmcgJ1Byb2plY3QnXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBsYWJlbCAnQ3VycmVudCBQcm9qZWN0J1xuICAgICAgICBAc2VsZWN0IG91dGxldDogJ3Byb2plY3RMaXN0J1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdjaGFuZ2VQcm9qZWN0JywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gaWNvbi1yZXBvLXB1bGwnXG4gICAgICAgICAgQHNwYW4gJ0NoYW5nZSdcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICBhY3RpdmF0ZTogLT5cbiAgICBwcm9qZWN0SW5kZXggPSAwXG4gICAgcHJvamVjdExpc3QgPSBAcHJvamVjdExpc3RcbiAgICBwcm9qZWN0TGlzdC5odG1sICcnXG4gICAgZm9yIHJlcG8gaW4gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpXG4gICAgICBkbyhyZXBvKSAtPlxuICAgICAgICBpZiByZXBvXG4gICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKVxuICAgICAgICAgIG9wdGlvbi52YWx1ZSA9IHByb2plY3RJbmRleFxuICAgICAgICAgIG9wdGlvbi50ZXh0ID0gcGF0aC5iYXNlbmFtZShwYXRoLnJlc29sdmUocmVwby5wYXRoLCAnLi4nKSlcbiAgICAgICAgICBwcm9qZWN0TGlzdC5hcHBlbmQob3B0aW9uKVxuICAgICAgICBwcm9qZWN0SW5kZXggPSBwcm9qZWN0SW5kZXggKyAxXG5cbiAgICBwcm9qZWN0TGlzdC52YWwoZ2l0LmdldFByb2plY3RJbmRleClcblxuICAgIHJldHVybiBzdXBlcigpXG5cbiAgY2hhbmdlUHJvamVjdDogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgZ2l0LnNldFByb2plY3RJbmRleChAcHJvamVjdExpc3QudmFsKCkpXG4gICAgcmVwbyA9IGdpdC5nZXRSZXBvc2l0b3J5KClcblxuICAgIEBwYXJlbnRWaWV3LnNldFdvcmtzcGFjZVRpdGxlKHJlcG8ucGF0aC5zcGxpdCgnLycpLnJldmVyc2UoKVsxXSlcbiAgICBAcGFyZW50Vmlldy51cGRhdGUoKVxuICAgIHJldHVyblxuIl19
