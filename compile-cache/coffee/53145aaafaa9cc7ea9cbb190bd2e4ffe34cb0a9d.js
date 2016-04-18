(function() {
  var PeekmoPhpAtomAutocomplete, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  PeekmoPhpAtomAutocomplete = require('../lib/peekmo-php-atom-autocomplete');

  describe("PeekmoPhpAtomAutocomplete", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('peekmo-php-atom-autocomplete');
    });
    return describe("when the peekmo-php-atom-autocomplete:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.peekmo-php-atom-autocomplete')).not.toExist();
        atom.commands.dispatch(atom.workspaceView.element, 'peekmo-php-atom-autocomplete:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {});
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvc3BlYy9wZWVrbW8tcGhwLWF0b20tYXV0b2NvbXBsZXRlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUMsZ0JBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWpCLGFBQUQsQ0FBQTs7QUFBQSxFQUNBLHlCQUFBLEdBQTRCLE9BQUEsQ0FBUSxxQ0FBUixDQUQ1QixDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxRQUFBLGlCQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixHQUFBLENBQUEsYUFBckIsQ0FBQTthQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qiw4QkFBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsUUFBQSxDQUFTLGlFQUFULEVBQTRFLFNBQUEsR0FBQTthQUMxRSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsK0JBQXhCLENBQVAsQ0FBZ0UsQ0FBQyxHQUFHLENBQUMsT0FBckUsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQTFDLEVBQW1ELHFDQUFuRCxDQUpBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQSxDQUFMLEVBVndDO01BQUEsQ0FBMUMsRUFEMEU7SUFBQSxDQUE1RSxFQVBvQztFQUFBLENBQXRDLENBUkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/spec/peekmo-php-atom-autocomplete-spec.coffee
