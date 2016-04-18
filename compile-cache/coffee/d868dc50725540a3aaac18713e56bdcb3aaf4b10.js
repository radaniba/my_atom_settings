(function() {
  var Builder, childProcess;

  childProcess = require('child_process');

  Builder = {
    error: null,
    build: function() {
      var buildCommand, _ref, _ref1, _ref2, _ref3;
      buildCommand = ((_ref = process.jekyllAtom.config) != null ? (_ref1 = _ref.atom) != null ? _ref1.buildCommand : void 0 : void 0) || process.jekyllAtom.buildCommand;
      atom.notifications.addInfo('Starting Jekyll Site Build');
      this.buildProcess = childProcess.spawn(buildCommand[0], buildCommand.slice(1), {
        cwd: atom.project.getPaths()[0],
        env: (_ref2 = process.jekyllAtom.config) != null ? (_ref3 = _ref2.atom) != null ? _ref3.buildEnv : void 0 : void 0
      });
      this.buildProcess.on('error', function(error) {
        if (error.code === 'ENOENT') {
          return atom.notifications.addError('Jekyll Binary Incorrect', {
            detail: "The Jekyll Binary " + error.path + " is not valid.\r\nPlease go into Settings and change it"
          });
        } else {
          throw error;
        }
      });
      this.buildProcess.stdout.on('data', function(data) {
        var message;
        message = data.toString();
        if (message.includes('Error:')) {
          return Builder.error = message;
        }
      });
      return this.buildProcess.on('exit', function(code, signal) {
        if (code === 0) {
          return atom.notifications.addSuccess('Jekyll site build complete!');
        } else {
          return atom.notifications.addError('Jekyll site build failed!', {
            detail: Builder.error
          });
        }
      });
    }
  };

  module.exports = Builder;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL3NlcnZlci9idWlsZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUJBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGVBQVIsQ0FBZixDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUNFO0FBQUEsSUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLElBRUEsS0FBQSxFQUFPLFNBQUEsR0FBQTtBQUNMLFVBQUEsdUNBQUE7QUFBQSxNQUFBLFlBQUEsb0ZBQStDLENBQUUsK0JBQWpDLElBQWlELE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBcEYsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiw0QkFBM0IsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsWUFBRCxHQUFnQixZQUFZLENBQUMsS0FBYixDQUFtQixZQUFhLENBQUEsQ0FBQSxDQUFoQyxFQUFvQyxZQUFhLFNBQWpELEVBQXdEO0FBQUEsUUFBQyxHQUFBLEVBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQTlCO0FBQUEsUUFBa0MsR0FBQSxvRkFBb0MsQ0FBRSwwQkFBeEU7T0FBeEQsQ0FKaEIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxFQUFkLENBQWlCLE9BQWpCLEVBQTBCLFNBQUMsS0FBRCxHQUFBO0FBQ3hCLFFBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWpCO2lCQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIseUJBQTVCLEVBQXVEO0FBQUEsWUFBQyxNQUFBLEVBQVMsb0JBQUEsR0FBb0IsS0FBSyxDQUFDLElBQTFCLEdBQStCLHlEQUF6QztXQUF2RCxFQURGO1NBQUEsTUFBQTtBQUdFLGdCQUFNLEtBQU4sQ0FIRjtTQUR3QjtNQUFBLENBQTFCLENBTkEsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBckIsQ0FBd0IsTUFBeEIsRUFBZ0MsU0FBQyxJQUFELEdBQUE7QUFDOUIsWUFBQSxPQUFBO0FBQUEsUUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFWLENBQUE7QUFDQSxRQUFBLElBQUcsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBakIsQ0FBSDtpQkFDRSxPQUFPLENBQUMsS0FBUixHQUFpQixRQURuQjtTQUY4QjtNQUFBLENBQWhDLENBWkEsQ0FBQTthQWlCQSxJQUFDLENBQUEsWUFBWSxDQUFDLEVBQWQsQ0FBaUIsTUFBakIsRUFBeUIsU0FBQyxJQUFELEVBQU8sTUFBUCxHQUFBO0FBQ3ZCLFFBQUEsSUFBRyxJQUFBLEtBQVEsQ0FBWDtpQkFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLDZCQUE5QixFQURGO1NBQUEsTUFBQTtpQkFHRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLDJCQUE1QixFQUF5RDtBQUFBLFlBQUMsTUFBQSxFQUFRLE9BQU8sQ0FBQyxLQUFqQjtXQUF6RCxFQUhGO1NBRHVCO01BQUEsQ0FBekIsRUFsQks7SUFBQSxDQUZQO0dBSEYsQ0FBQTs7QUFBQSxFQTZCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQTdCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/server/build.coffee
