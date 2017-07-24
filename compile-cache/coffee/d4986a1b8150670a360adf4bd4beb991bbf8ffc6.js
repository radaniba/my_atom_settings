(function() {
  atom.packages.activatePackage('tree-view').then(function(tree) {
    var IS_ANCHORED_CLASSNAME, projectRoots, treeView, updateTreeViewHeaderPosition;
    IS_ANCHORED_CLASSNAME = 'is--anchored';
    treeView = tree.mainModule.treeView;
    projectRoots = treeView.roots;
    updateTreeViewHeaderPosition = function() {
      var project, projectClassList, projectHeaderHeight, projectHeight, projectOffsetY, yScrollPosition, _i, _len, _results;
      yScrollPosition = treeView.scroller[0].scrollTop;
      _results = [];
      for (_i = 0, _len = projectRoots.length; _i < _len; _i++) {
        project = projectRoots[_i];
        projectHeaderHeight = project.header.offsetHeight;
        projectClassList = project.classList;
        projectOffsetY = project.offsetTop;
        projectHeight = project.offsetHeight;
        if (yScrollPosition > projectOffsetY) {
          if (yScrollPosition > projectOffsetY + projectHeight - projectHeaderHeight) {
            project.header.style.top = 'auto';
            _results.push(projectClassList.add(IS_ANCHORED_CLASSNAME));
          } else {
            project.header.style.top = (yScrollPosition - projectOffsetY) + 'px';
            _results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
          }
        } else {
          project.header.style.top = '0';
          _results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
        }
      }
      return _results;
    };
    atom.project.onDidChangePaths(function() {
      projectRoots = treeView.roots;
      return updateTreeViewHeaderPosition();
    });
    atom.config.onDidChange('seti-ui', function() {
      return setTimeout(function() {
        return updateTreeViewHeaderPosition();
      });
    });
    treeView.scroller.on('scroll', updateTreeViewHeaderPosition);
    return setTimeout(function() {
      return updateTreeViewHeaderPosition();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zZXRpLXVpL2xpYi9oZWFkZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsV0FBOUIsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxTQUFDLElBQUQsR0FBQTtBQUM5QyxRQUFBLDJFQUFBO0FBQUEsSUFBQSxxQkFBQSxHQUF3QixjQUF4QixDQUFBO0FBQUEsSUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUYzQixDQUFBO0FBQUEsSUFHQSxZQUFBLEdBQWUsUUFBUSxDQUFDLEtBSHhCLENBQUE7QUFBQSxJQUtBLDRCQUFBLEdBQStCLFNBQUEsR0FBQTtBQUM3QixVQUFBLGtIQUFBO0FBQUEsTUFBQSxlQUFBLEdBQWtCLFFBQVEsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdkMsQ0FBQTtBQUVBO1dBQUEsbURBQUE7bUNBQUE7QUFDRSxRQUFBLG1CQUFBLEdBQXNCLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBckMsQ0FBQTtBQUFBLFFBQ0EsZ0JBQUEsR0FBbUIsT0FBTyxDQUFDLFNBRDNCLENBQUE7QUFBQSxRQUVBLGNBQUEsR0FBaUIsT0FBTyxDQUFDLFNBRnpCLENBQUE7QUFBQSxRQUdBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFlBSHhCLENBQUE7QUFLQSxRQUFBLElBQUcsZUFBQSxHQUFrQixjQUFyQjtBQUNFLFVBQUEsSUFBRyxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsYUFBakIsR0FBaUMsbUJBQXREO0FBQ0UsWUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFyQixHQUEyQixNQUEzQixDQUFBO0FBQUEsMEJBQ0EsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIscUJBQXJCLEVBREEsQ0FERjtXQUFBLE1BQUE7QUFJRSxZQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCLENBQUMsZUFBQSxHQUFrQixjQUFuQixDQUFBLEdBQXFDLElBQWhFLENBQUE7QUFBQSwwQkFDQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixxQkFBeEIsRUFEQSxDQUpGO1dBREY7U0FBQSxNQUFBO0FBUUUsVUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFyQixHQUEyQixHQUEzQixDQUFBO0FBQUEsd0JBQ0EsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IscUJBQXhCLEVBREEsQ0FSRjtTQU5GO0FBQUE7c0JBSDZCO0lBQUEsQ0FML0IsQ0FBQTtBQUFBLElBeUJBLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWIsQ0FBOEIsU0FBQSxHQUFBO0FBQzVCLE1BQUEsWUFBQSxHQUFlLFFBQVEsQ0FBQyxLQUF4QixDQUFBO2FBQ0EsNEJBQUEsQ0FBQSxFQUY0QjtJQUFBLENBQTlCLENBekJBLENBQUE7QUFBQSxJQTZCQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsU0FBeEIsRUFBbUMsU0FBQSxHQUFBO2FBR2pDLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFBRyw0QkFBQSxDQUFBLEVBQUg7TUFBQSxDQUFYLEVBSGlDO0lBQUEsQ0FBbkMsQ0E3QkEsQ0FBQTtBQUFBLElBaUNBLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBbEIsQ0FBcUIsUUFBckIsRUFBK0IsNEJBQS9CLENBakNBLENBQUE7V0FtQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULDRCQUFBLENBQUEsRUFEUztJQUFBLENBQVgsRUFwQzhDO0VBQUEsQ0FBaEQsQ0FBQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/seti-ui/lib/headers.coffee
