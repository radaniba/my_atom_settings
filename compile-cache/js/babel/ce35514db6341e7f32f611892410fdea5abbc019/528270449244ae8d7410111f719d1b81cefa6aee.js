function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

'use babel';

var cleanPath = path.join(__dirname, 'fixtures', 'clean.sh');
var badPath = path.join(__dirname, 'fixtures', 'bad.sh');

describe('The ShellCheck provider for Linter', function () {
  var lint = require('../lib/main.js').provideLinter().lint;

  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();

    waitsForPromise(function () {
      return Promise.all([atom.packages.activatePackage('linter-shellcheck')]);
    });
  });

  it('finds nothing wrong with a valid file', function () {
    waitsForPromise(function () {
      return atom.workspace.open(cleanPath).then(function (editor) {
        return lint(editor);
      }).then(function (messages) {
        expect(messages.length).toBe(0);
      });
    });
  });

  it('handles messages from ShellCheck', function () {
    var expectedMsg = 'Tips depend on target shell and yours is unknown. Add a shebang. ' + '[<a href="https://github.com/koalaman/shellcheck/wiki/SC2148">SC2148</a>]';
    waitsForPromise(function () {
      return atom.workspace.open(badPath).then(function (editor) {
        return lint(editor);
      }).then(function (messages) {
        expect(messages.length).toBe(1);
        expect(messages[0].type).toBe('error');
        expect(messages[0].text).not.toBeDefined();
        expect(messages[0].html).toBe(expectedMsg);
        expect(messages[0].filePath).toBe(badPath);
        expect(messages[0].range).toEqual([[0, 0], [0, 4]]);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXNoZWxsY2hlY2svc3BlYy9saW50ZXItc2hlbGxjaGVjay1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O29CQUVzQixNQUFNOztJQUFoQixJQUFJOztBQUZoQixXQUFXLENBQUM7O0FBSVosSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQy9ELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFM0QsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLFlBQU07QUFDbkQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUU1RCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFdkMsbUJBQWUsQ0FBQzthQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FDVixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUNuRCxDQUFDO0tBQUEsQ0FDSCxDQUFDO0dBQ0gsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxZQUFNO0FBQ2hELG1CQUFlLENBQUM7YUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNO2VBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztPQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDN0UsY0FBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakMsQ0FBQztLQUFBLENBQ0gsQ0FBQztHQUNILENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsa0NBQWtDLEVBQUUsWUFBTTtBQUMzQyxRQUFNLFdBQVcsR0FBRyxtRUFBbUUsR0FDckYsMkVBQTJFLENBQUM7QUFDOUUsbUJBQWUsQ0FBQzthQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07ZUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUMzRSxjQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNyRCxDQUFDO0tBQUEsQ0FDSCxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXNoZWxsY2hlY2svc3BlYy9saW50ZXItc2hlbGxjaGVjay1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IGNsZWFuUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdjbGVhbi5zaCcpO1xuY29uc3QgYmFkUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdiYWQuc2gnKTtcblxuZGVzY3JpYmUoJ1RoZSBTaGVsbENoZWNrIHByb3ZpZGVyIGZvciBMaW50ZXInLCAoKSA9PiB7XG4gIGNvbnN0IGxpbnQgPSByZXF1aXJlKCcuLi9saWIvbWFpbi5qcycpLnByb3ZpZGVMaW50ZXIoKS5saW50O1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpO1xuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsaW50ZXItc2hlbGxjaGVjaycpLFxuICAgICAgXSlcbiAgICApO1xuICB9KTtcblxuICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIGEgdmFsaWQgZmlsZScsICgpID0+IHtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oY2xlYW5QYXRoKS50aGVuKGVkaXRvciA9PiBsaW50KGVkaXRvcikpLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMCk7XG4gICAgICB9KVxuICAgICk7XG4gIH0pO1xuXG4gIGl0KCdoYW5kbGVzIG1lc3NhZ2VzIGZyb20gU2hlbGxDaGVjaycsICgpID0+IHtcbiAgICBjb25zdCBleHBlY3RlZE1zZyA9ICdUaXBzIGRlcGVuZCBvbiB0YXJnZXQgc2hlbGwgYW5kIHlvdXJzIGlzIHVua25vd24uIEFkZCBhIHNoZWJhbmcuICcgK1xuICAgICAgJ1s8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2tvYWxhbWFuL3NoZWxsY2hlY2svd2lraS9TQzIxNDhcIj5TQzIxNDg8L2E+XSc7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGJhZFBhdGgpLnRoZW4oZWRpdG9yID0+IGxpbnQoZWRpdG9yKSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnR5cGUpLnRvQmUoJ2Vycm9yJyk7XG4gICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmh0bWwpLnRvQmUoZXhwZWN0ZWRNc2cpO1xuICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmlsZVBhdGgpLnRvQmUoYmFkUGF0aCk7XG4gICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5yYW5nZSkudG9FcXVhbChbWzAsIDBdLCBbMCwgNF1dKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/linter-shellcheck/spec/linter-shellcheck-spec.js
