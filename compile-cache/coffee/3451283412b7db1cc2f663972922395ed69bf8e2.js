(function() {
  var JupyterNotebookAtom;

  JupyterNotebookAtom = require('../lib/jupyter-notebook-atom');

  describe("JupyterNotebookAtom", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('jupyter-notebook-atom');
    });
    return describe("when the jupyter-notebook-atom:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.jupyter-notebook-atom')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'jupyter-notebook-atom:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var jupyterNotebookAtomElement, jupyterNotebookAtomPanel;
          expect(workspaceElement.querySelector('.jupyter-notebook-atom')).toExist();
          jupyterNotebookAtomElement = workspaceElement.querySelector('.jupyter-notebook-atom');
          expect(jupyterNotebookAtomElement).toExist();
          jupyterNotebookAtomPanel = atom.workspace.panelForItem(jupyterNotebookAtomElement);
          expect(jupyterNotebookAtomPanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'jupyter-notebook-atom:toggle');
          return expect(jupyterNotebookAtomPanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.jupyter-notebook-atom')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'jupyter-notebook-atom:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var jupyterNotebookAtomElement;
          jupyterNotebookAtomElement = workspaceElement.querySelector('.jupyter-notebook-atom');
          expect(jupyterNotebookAtomElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'jupyter-notebook-atom:toggle');
          return expect(jupyterNotebookAtomElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qdXB5dGVyLW5vdGVib29rL3NwZWMvanVweXRlci1ub3RlYm9vay1hdG9tLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFPQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFFBQUEseUNBQUE7QUFBQSxJQUFBLE9BQXdDLEVBQXhDLEVBQUMsMEJBQUQsRUFBbUIsMkJBQW5CLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTthQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix1QkFBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsUUFBQSxDQUFTLDBEQUFULEVBQXFFLFNBQUEsR0FBQTtBQUNuRSxNQUFBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7QUFHcEMsUUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isd0JBQS9CLENBQVAsQ0FBZ0UsQ0FBQyxHQUFHLENBQUMsT0FBckUsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsOEJBQXpDLENBSkEsQ0FBQTtBQUFBLFFBTUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQU5BLENBQUE7ZUFTQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxvREFBQTtBQUFBLFVBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLHdCQUEvQixDQUFQLENBQWdFLENBQUMsT0FBakUsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUVBLDBCQUFBLEdBQTZCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLHdCQUEvQixDQUY3QixDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sMEJBQVAsQ0FBa0MsQ0FBQyxPQUFuQyxDQUFBLENBSEEsQ0FBQTtBQUFBLFVBS0Esd0JBQUEsR0FBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQTRCLDBCQUE1QixDQUwzQixDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sd0JBQXdCLENBQUMsU0FBekIsQ0FBQSxDQUFQLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsSUFBbEQsQ0FOQSxDQUFBO0FBQUEsVUFPQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLDhCQUF6QyxDQVBBLENBQUE7aUJBUUEsTUFBQSxDQUFPLHdCQUF3QixDQUFDLFNBQXpCLENBQUEsQ0FBUCxDQUE0QyxDQUFDLElBQTdDLENBQWtELEtBQWxELEVBVEc7UUFBQSxDQUFMLEVBWm9DO01BQUEsQ0FBdEMsQ0FBQSxDQUFBO2FBdUJBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFPN0IsUUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isd0JBQS9CLENBQVAsQ0FBZ0UsQ0FBQyxHQUFHLENBQUMsT0FBckUsQ0FBQSxDQUZBLENBQUE7QUFBQSxRQU1BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsOEJBQXpDLENBTkEsQ0FBQTtBQUFBLFFBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQVJBLENBQUE7ZUFXQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsY0FBQSwwQkFBQTtBQUFBLFVBQUEsMEJBQUEsR0FBNkIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isd0JBQS9CLENBQTdCLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTywwQkFBUCxDQUFrQyxDQUFDLFdBQW5DLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLDhCQUF6QyxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLDBCQUFQLENBQWtDLENBQUMsR0FBRyxDQUFDLFdBQXZDLENBQUEsRUFMRztRQUFBLENBQUwsRUFsQjZCO01BQUEsQ0FBL0IsRUF4Qm1FO0lBQUEsQ0FBckUsRUFQOEI7RUFBQSxDQUFoQyxDQVBBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/jupyter-notebook/spec/jupyter-notebook-atom-spec.coffee
