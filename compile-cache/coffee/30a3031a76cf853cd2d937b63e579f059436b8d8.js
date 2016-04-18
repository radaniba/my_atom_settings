(function() {
  var path;

  path = require('path');

  describe('Jekyll-Atom', function() {
    var activationPromise, editor, editorView, getStatusText, getToolbar, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], editor = _ref[1], editorView = _ref[2], activationPromise = _ref[3];
    getToolbar = function() {
      return workspaceElement.querySelector('.jekyll-manager-panel');
    };
    getStatusText = function() {
      return workspaceElement.querySelector('.jekyll-status-text');
    };
    beforeEach(function() {
      expect(atom.packages.isPackageActive('jekyll')).toBe(false);
      atom.project.setPaths([path.join(__dirname, 'sample')]);
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(function() {
        return atom.workspace.open('index.html');
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage('jekyll');
      });
    });
    describe('Before Activation', function() {
      return it('should not be active', function() {
        return expect(atom.packages.isPackageActive('jekyll')).toBe(false);
      });
    });
    return describe('Buffer Functions', function() {
      beforeEach(function() {
        return atom.project.setPaths([path.join(__dirname, 'sample')]);
      });
      return it('should open a layout', function() {
        waitsForPromise(function() {
          return atom.workspace.open('index.html');
        });
        return runs(function() {
          var relativePath;
          relativePath = atom.workspace.getActiveTextEditor().buffer.file.path.replace(path.join(__dirname, 'sample'), '');
          expect(relativePath.replace('\\', '/')).toBe('/index.html');
          expect(atom.workspace.getTextEditors().length).toBe(1);
          atom.commands.dispatch(editorView, 'jekyll:open-layout');
          waitsForPromise(function() {
            return activationPromise;
          });
          return runs(function() {
            waitsFor(function() {
              return atom.workspace.getTextEditors().length === 2;
            });
            return runs(function() {
              relativePath = atom.workspace.getActiveTextEditor().buffer.file.path.replace(path.join(__dirname, 'sample'), '');
              expect(relativePath.replace(/\\/g, '/')).toBe('/_layouts/default.html');
              return expect(atom.workspace.getTextEditors().length).toBe(2);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvc3BlYy9qZWt5bGwtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSx3RkFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQywwQkFBRCxFQUFtQixnQkFBbkIsRUFBMkIsb0JBQTNCLEVBQXVDLDJCQUF2QyxDQUFBO0FBQUEsSUFFQSxVQUFBLEdBQWEsU0FBQSxHQUFBO2FBQ1gsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsdUJBQS9CLEVBRFc7SUFBQSxDQUZiLENBQUE7QUFBQSxJQUtBLGFBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQ2QsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IscUJBQS9CLEVBRGM7SUFBQSxDQUxoQixDQUFBO0FBQUEsSUFRQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxNQUFBLENBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFFBQTlCLENBQVAsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxLQUFyRCxDQUFBLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixRQUFyQixDQUFELENBQXRCLENBRkEsQ0FBQTtBQUFBLE1BSUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUpuQixDQUFBO0FBQUEsTUFPQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FB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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/spec/jekyll-spec.coffee
