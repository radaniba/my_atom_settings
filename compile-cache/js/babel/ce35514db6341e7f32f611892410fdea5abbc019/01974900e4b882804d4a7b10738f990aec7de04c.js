'use babel';

var fs = require('fs-plus');
var git = require('../git');
var notifier = require('../notifier');
var BranchListView = require('../views/branch-list-view');

module.exports = function (repo) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? { remote: false } : arguments[1];

  var args = options.remote ? ['branch', '-r', '--no-color'] : ['branch', '--no-color'];
  return git.cmd(args, { cwd: repo.getWorkingDirectory() }).then(function (data) {
    return new BranchListView(data, function (_ref) {
      var name = _ref.name;

      var branch = name;
      git.cmd(['checkout'].concat(branch), { cwd: repo.getWorkingDirectory() }).then(function (message) {
        notifier.addSuccess(message);
        atom.workspace.getTextEditors().forEach(function (editor) {
          try {
            var path = editor.getPath();
            console.log('Git-plus: editor.getPath() returned \'' + path + '\'');
            if (path && path.toString) {
              fs.exists(path.toString(), function (exists) {
                if (!exists) editor.destroy();
              });
            }
          } catch (error) {
            notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
            console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139", error);
          }
        });
        git.refresh(repo);
      })['catch'](notifier.addError);
    });
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlY2tvdXQtYnJhbmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7QUFFWCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDN0IsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzdCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQTs7QUFFM0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLElBQUksRUFBOEI7TUFBNUIsT0FBTyx5REFBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUM7O0FBQzdDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ3ZGLFNBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsQ0FBQyxDQUN0RCxJQUFJLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDWixXQUFPLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxVQUFDLElBQU0sRUFBSztVQUFWLElBQUksR0FBTCxJQUFNLENBQUwsSUFBSTs7QUFDcEMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ25CLFNBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsQ0FBQyxDQUN0RSxJQUFJLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDZixnQkFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM1QixZQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNoRCxjQUFJO0FBQ0YsZ0JBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM3QixtQkFBTyxDQUFDLEdBQUcsNENBQXlDLElBQUksUUFBSSxDQUFBO0FBQzVELGdCQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3pCLGdCQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFBLE1BQU0sRUFBSTtBQUFDLG9CQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtlQUFDLENBQUMsQ0FBQTthQUN0RTtXQUNGLENBQ0QsT0FBTyxLQUFLLEVBQUU7QUFDWixvQkFBUSxDQUFDLFVBQVUsQ0FBQyw2R0FBNkcsQ0FBQyxDQUFBO0FBQ2xJLG1CQUFPLENBQUMsSUFBSSxDQUFDLCtKQUErSixFQUFFLEtBQUssQ0FBQyxDQUFBO1dBQ3JMO1NBQ0YsQ0FBQyxDQUFBO0FBQ0YsV0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUNsQixDQUFDLFNBQ0ksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDMUIsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWJyYW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5jb25zdCBnaXQgPSByZXF1aXJlKCcuLi9naXQnKVxuY29uc3Qgbm90aWZpZXIgPSByZXF1aXJlKCcuLi9ub3RpZmllcicpXG5jb25zdCBCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2JyYW5jaC1saXN0LXZpZXcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCBvcHRpb25zPXtyZW1vdGU6IGZhbHNlfSkgPT4ge1xuICBjb25zdCBhcmdzID0gb3B0aW9ucy5yZW1vdGUgPyBbJ2JyYW5jaCcsICctcicsICctLW5vLWNvbG9yJ10gOiBbJ2JyYW5jaCcsICctLW5vLWNvbG9yJ11cbiAgcmV0dXJuIGdpdC5jbWQoYXJncywge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9KVxuICAudGhlbihkYXRhID0+IHtcbiAgICByZXR1cm4gbmV3IEJyYW5jaExpc3RWaWV3KGRhdGEsICh7bmFtZX0pID0+IHtcbiAgICAgIGNvbnN0IGJyYW5jaCA9IG5hbWVcbiAgICAgIGdpdC5jbWQoWydjaGVja291dCddLmNvbmNhdChicmFuY2gpLCB7Y3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKX0pXG4gICAgICAudGhlbihtZXNzYWdlID0+IHtcbiAgICAgICAgbm90aWZpZXIuYWRkU3VjY2VzcyhtZXNzYWdlKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZvckVhY2goZWRpdG9yID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBHaXQtcGx1czogZWRpdG9yLmdldFBhdGgoKSByZXR1cm5lZCAnJHtwYXRofSdgKVxuICAgICAgICAgICAgaWYgKHBhdGggJiYgcGF0aC50b1N0cmluZykge1xuICAgICAgICAgICAgICBmcy5leGlzdHMocGF0aC50b1N0cmluZygpLCBleGlzdHMgPT4ge2lmICghZXhpc3RzKSBlZGl0b3IuZGVzdHJveSgpfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBub3RpZmllci5hZGRXYXJuaW5nKFwiVGhlcmUgd2FzIGFuIGVycm9yIGNsb3Npbmcgd2luZG93cyBmb3Igbm9uLWV4aXN0aW5nIGZpbGVzIGFmdGVyIHRoZSBjaGVja291dC4gUGxlYXNlIGNoZWNrIHRoZSBkZXYgY29uc29sZS5cIilcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkdpdC1wbHVzOiBwbGVhc2UgdGFrZSBhIHNjcmVlbnNob3Qgb2Ygd2hhdCBoYXMgYmVlbiBwcmludGVkIGluIHRoZSBjb25zb2xlIGFuZCBhZGQgaXQgdG8gdGhlIGlzc3VlIG9uIGdpdGh1YiBhdCBodHRwczovL2dpdGh1Yi5jb20vYWtvbndpL2dpdC1wbHVzL2lzc3Vlcy8xMzlcIiwgZXJyb3IpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBnaXQucmVmcmVzaChyZXBvKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChub3RpZmllci5hZGRFcnJvcilcbiAgICB9KVxuICB9KVxufVxuIl19