function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

'use babel';

var badPath = path.join(__dirname, 'files', 'bad.php');
var goodPath = path.join(__dirname, 'files', 'good.php');
var emptyPath = path.join(__dirname, 'files', 'empty.php');
var fatalPath = path.join(__dirname, 'files', 'fatal.php');

var lint = require('../lib/main.js').provideLinter().lint;

describe('The php -l provider for Linter', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      return Promise.all([atom.packages.activatePackage('linter-php'), atom.packages.activatePackage('language-php')]).then(function () {
        return atom.workspace.open(badPath);
      });
    });
  });

  it('should be in the packages list', function () {
    return expect(atom.packages.isPackageLoaded('linter-php')).toBe(true);
  });

  it('should be an active package', function () {
    return expect(atom.packages.isPackageActive('linter-php')).toBe(true);
  });

  describe('checks bad.php and', function () {
    var editor = null;
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open(badPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', function () {
      waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBe(1);
        });
      });
    });

    it('verifies that message', function () {
      waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          expect(messages[0].type).toBe('Error');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].text).toBe('syntax error, unexpected \'{\'');
          expect(messages[0].filePath).toBe(badPath);
          expect(messages[0].range).toEqual([[1, 0], [1, 6]]);
        });
      });
    });
  });

  it('finds nothing wrong with an empty file', function () {
    waitsForPromise(function () {
      return atom.workspace.open(emptyPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBe(0);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', function () {
    waitsForPromise(function () {
      return atom.workspace.open(goodPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBe(0);
        });
      });
    });
  });

  it('handles fatal errors', function () {
    waitsForPromise(function () {
      return atom.workspace.open(fatalPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          expect(messages[0].type).toBe('Error');
          expect(messages[0].text).toBe('Cannot redeclare Test\\A::foo()');
          expect(messages[0].filePath).toBe(fatalPath);
          expect(messages[0].range).toEqual([[10, 4], [10, 25]]);
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbGludGVyLXBocC9zcGVjL2xpbnRlci1waHAtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFc0IsTUFBTTs7SUFBaEIsSUFBSTs7QUFGaEIsV0FBVyxDQUFDOztBQUlaLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN6RCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0QsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzdELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFN0QsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUU1RCxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsWUFBTTtBQUMvQyxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxtQkFBZSxDQUFDO2FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQztlQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQzdCO0tBQUEsQ0FDRixDQUFDO0dBQ0gsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxnQ0FBZ0MsRUFB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QUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FBQztPQUFBLENBQy9EO0tBQUEsQ0FDRixDQUFDO0dBQ0gsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxzQkFBc0IsRUFBRSxZQUFNO0FBQy9CLG1CQUFlLENBQUM7YUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNO2VBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDOUIsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2pFLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDeEQsQ0FBQztPQUFBLENBQ0g7S0FBQSxDQUNGLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9saW50ZXItcGhwL3NwZWMvbGludGVyLXBocC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IGJhZFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZmlsZXMnLCAnYmFkLnBocCcpO1xuY29uc3QgZ29vZFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZmlsZXMnLCAnZ29vZC5waHAnKTtcbmNvbnN0IGVtcHR5UGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaWxlcycsICdlbXB0eS5waHAnKTtcbmNvbnN0IGZhdGFsUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaWxlcycsICdmYXRhbC5waHAnKTtcblxuY29uc3QgbGludCA9IHJlcXVpcmUoJy4uL2xpYi9tYWluLmpzJykucHJvdmlkZUxpbnRlcigpLmxpbnQ7XG5cbmRlc2NyaWJlKCdUaGUgcGhwIC1sIHByb3ZpZGVyIGZvciBMaW50ZXInLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpO1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLXBocCcpLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcGhwJyksXG4gICAgICBdKS50aGVuKCgpID0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oYmFkUGF0aClcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGJlIGluIHRoZSBwYWNrYWdlcyBsaXN0JywgKCkgPT5cbiAgICBleHBlY3QoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ2xpbnRlci1waHAnKSkudG9CZSh0cnVlKVxuICApO1xuXG4gIGl0KCdzaG91bGQgYmUgYW4gYWN0aXZlIHBhY2thZ2UnLCAoKSA9PlxuICAgIGV4cGVjdChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgnbGludGVyLXBocCcpKS50b0JlKHRydWUpXG4gICk7XG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBiYWQucGhwIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGJhZFBhdGgpLnRoZW4oKG9wZW5FZGl0b3IpID0+IHtcbiAgICAgICAgICBlZGl0b3IgPSBvcGVuRWRpdG9yO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGl0KCdmaW5kcyBhdCBsZWFzdCBvbmUgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBsaW50KGVkaXRvcikudGhlbihtZXNzYWdlcyA9PiBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGl0KCd2ZXJpZmllcyB0aGF0IG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgbGludChlZGl0b3IpLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnR5cGUpLnRvQmUoJ0Vycm9yJyk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmh0bWwpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50ZXh0KS50b0JlKCdzeW50YXggZXJyb3IsIHVuZXhwZWN0ZWQgXFwne1xcJycpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9CZShiYWRQYXRoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1sxLCAwXSwgWzEsIDZdXSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIGFuIGVtcHR5IGZpbGUnLCAoKSA9PiB7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGVtcHR5UGF0aCkudGhlbihlZGl0b3IgPT5cbiAgICAgICAgbGludChlZGl0b3IpLnRoZW4obWVzc2FnZXMgPT4gZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKSlcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIGEgdmFsaWQgZmlsZScsICgpID0+IHtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZ29vZFBhdGgpLnRoZW4oZWRpdG9yID0+XG4gICAgICAgIGxpbnQoZWRpdG9yKS50aGVuKG1lc3NhZ2VzID0+IGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMCkpXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG5cbiAgaXQoJ2hhbmRsZXMgZmF0YWwgZXJyb3JzJywgKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmYXRhbFBhdGgpLnRoZW4oZWRpdG9yID0+XG4gICAgICAgIGxpbnQoZWRpdG9yKS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50eXBlKS50b0JlKCdFcnJvcicpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50ZXh0KS50b0JlKCdDYW5ub3QgcmVkZWNsYXJlIFRlc3RcXFxcQTo6Zm9vKCknKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmlsZVBhdGgpLnRvQmUoZmF0YWxQYXRoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1sxMCwgNF0sIFsxMCwgMjVdXSk7XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/linter-php/spec/linter-php-spec.js
