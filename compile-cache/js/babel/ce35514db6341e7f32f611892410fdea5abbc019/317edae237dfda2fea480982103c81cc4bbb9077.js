function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMinimapCursorline = require('../lib/minimap-cursorline');

var _libMinimapCursorline2 = _interopRequireDefault(_libMinimapCursorline);

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

'use babel';

describe('MinimapCursorLine', function () {
  var _ref = [];
  var workspaceElement = _ref[0];
  var editor = _ref[1];
  var minimap = _ref[2];

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return atom.workspace.open('sample.js').then(function (e) {
        editor = e;
      });
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap').then(function (pkg) {
        minimap = pkg.mainModule.minimapForEditor(editor);
      });
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap-cursorline');
    });
  });

  describe('with an open editor that have a minimap', function () {
    var cursor = undefined,
        marker = undefined;
    describe('when cursor markers are added to the editor', function () {
      beforeEach(function () {
        cursor = editor.addCursorAtScreenPosition({ row: 2, column: 3 });
        marker = cursor.getMarker();
      });

      it('creates decoration for the cursor markers', function () {
        expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(1);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL3NwZWMvbWluaW1hcC1jdXJzb3JsaW5lLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0NBRThCLDJCQUEyQjs7Ozs7Ozs7O0FBRnpELFdBQVcsQ0FBQTs7QUFTWCxRQUFRLENBQUMsbUJBQW1CLEVBQUUsWUFBTTthQUNRLEVBQUU7TUFBdkMsZ0JBQWdCO01BQUUsTUFBTTtNQUFFLE9BQU87O0FBRXRDLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysb0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3JELFdBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTs7QUFFckMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2xELGNBQU0sR0FBRyxDQUFDLENBQUE7T0FDWCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7O0FBRUYsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzVELGVBQU8sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQ2xELENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0tBQzNELENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMseUNBQXlDLEVBQUUsWUFBTTtBQUN4RCxRQUFJLE1BQU0sWUFBQTtRQUFFLE1BQU0sWUFBQSxDQUFBO0FBQ2xCLFlBQVEsQ0FBQyw2Q0FBNkMsRUFBRSxZQUFNO0FBQzVELGdCQUFVLENBQUMsWUFBTTtBQUNmLGNBQU0sR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ2hFLGNBQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUE7T0FDNUIsQ0FBQyxDQUFBOztBQUVGLFFBQUUsQ0FBQywyQ0FBMkMsRUFBRSxZQUFNO0FBQ3BELGNBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUNyRSxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWN1cnNvcmxpbmUvc3BlYy9taW5pbWFwLWN1cnNvcmxpbmUtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBNaW5pbWFwQ3Vyc29yTGluZSBmcm9tICcuLi9saWIvbWluaW1hcC1jdXJzb3JsaW5lJ1xuXG4vLyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4vL1xuLy8gVG8gcnVuIGEgc3BlY2lmaWMgYGl0YCBvciBgZGVzY3JpYmVgIGJsb2NrIGFkZCBhbiBgZmAgdG8gdGhlIGZyb250IChlLmcuIGBmaXRgXG4vLyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG5kZXNjcmliZSgnTWluaW1hcEN1cnNvckxpbmUnLCAoKSA9PiB7XG4gIGxldCBbd29ya3NwYWNlRWxlbWVudCwgZWRpdG9yLCBtaW5pbWFwXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5qcycpLnRoZW4oKGUpID0+IHtcbiAgICAgICAgZWRpdG9yID0gZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpLnRoZW4oKHBrZykgPT4ge1xuICAgICAgICBtaW5pbWFwID0gcGtnLm1haW5Nb2R1bGUubWluaW1hcEZvckVkaXRvcihlZGl0b3IpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtaW5pbWFwLWN1cnNvcmxpbmUnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3dpdGggYW4gb3BlbiBlZGl0b3IgdGhhdCBoYXZlIGEgbWluaW1hcCcsICgpID0+IHtcbiAgICBsZXQgY3Vyc29yLCBtYXJrZXJcbiAgICBkZXNjcmliZSgnd2hlbiBjdXJzb3IgbWFya2VycyBhcmUgYWRkZWQgdG8gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBjdXJzb3IgPSBlZGl0b3IuYWRkQ3Vyc29yQXRTY3JlZW5Qb3NpdGlvbih7IHJvdzogMiwgY29sdW1uOiAzIH0pXG4gICAgICAgIG1hcmtlciA9IGN1cnNvci5nZXRNYXJrZXIoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgZGVjb3JhdGlvbiBmb3IgdGhlIGN1cnNvciBtYXJrZXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoT2JqZWN0LmtleXMobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWQpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/minimap-cursorline/spec/minimap-cursorline-spec.js
