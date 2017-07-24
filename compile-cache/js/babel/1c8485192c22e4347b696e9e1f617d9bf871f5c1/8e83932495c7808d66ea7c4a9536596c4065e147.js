Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.install = install;

var _helpers = require('./helpers');

'use babel';
var FS = require('fs');
var Path = require('path');

var _require = require('./view');

var View = _require.View;

// Renamed for backward compatibility
if (typeof window.__steelbrain_package_deps === 'undefined') {
  window.__steelbrain_package_deps = new Set();
}

function install() {
  var name = arguments[0] === undefined ? null : arguments[0];
  var enablePackages = arguments[1] === undefined ? false : arguments[1];

  if (!name) {
    var filePath = require('sb-callsite').capture()[1].file;
    name = (0, _helpers.guessName)(filePath);
    if (!name) {
      console.log('Unable to get package name for file: ' + filePath);
      return Promise.resolve();
    }
  }

  var _packagesToInstall = (0, _helpers.packagesToInstall)(name);

  var toInstall = _packagesToInstall.toInstall;
  var toEnable = _packagesToInstall.toEnable;

  var promise = Promise.resolve();

  if (enablePackages && toEnable.length) {
    promise = toEnable.reduce(function (promise, name) {
      atom.packages.enablePackage(name);
      return atom.packages.activatePackage(name);
    }, promise);
  }
  if (toInstall.length) {
    (function () {
      var view = new View(name, toInstall);
      promise = Promise.all([view.show(), promise]).then(function () {
        return (0, _helpers.installPackages)(toInstall, function (name, status) {
          if (status) {
            view.advance();
          } else {
            atom.notifications.addError('Error Installing ' + name, { detail: 'Something went wrong. Try installing this package manually.' });
          }
        });
      });
    })();
  }

  return promise;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvRG9jdW1lbnRzL0Rldi9teV9ub2RlanNfYXBwcy9saW50ZXItanNjcy9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLWRlcHMvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1FBV2dCLE9BQU8sR0FBUCxPQUFPOzt1QkFQcUMsV0FBVzs7QUFKdkUsV0FBVyxDQUFBO0FBQ1gsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3hCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTs7ZUFDYixPQUFPLENBQUMsUUFBUSxDQUFDOztJQUF6QixJQUFJLFlBQUosSUFBSTs7O0FBSVgsSUFBSSxPQUFPLE1BQU0sQ0FBQyx5QkFBeUIsS0FBSyxXQUFXLEVBQUU7QUFDM0QsUUFBTSxDQUFDLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7Q0FDN0M7O0FBRU0sU0FBUyxPQUFPLEdBQXNDO01BQXJDLElBQUksZ0NBQUcsSUFBSTtNQUFFLGNBQWMsZ0NBQUcsS0FBSzs7QUFDekQsTUFBSSxDQUFDLElBQUksRUFBRTtBQUNULFFBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7QUFDekQsUUFBSSxHQUFHLGFBVkgsU0FBUyxFQVVJLFFBQVEsQ0FBQyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxhQUFPLENBQUMsR0FBRywyQ0FBeUMsUUFBUSxDQUFHLENBQUE7QUFDL0QsYUFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDekI7R0FDRjs7MkJBQzZCLGFBaEJJLGlCQUFpQixFQWdCSCxJQUFJLENBQUM7O01BQTlDLFNBQVMsc0JBQVQsU0FBUztNQUFFLFFBQVEsc0JBQVIsUUFBUTs7QUFDMUIsTUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUUvQixNQUFJLGNBQWMsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3JDLFdBQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNoRCxVQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNqQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzNDLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDWjtBQUNELE1BQUksU0FBUyxDQUFDLE1BQU0sRUFBRTs7QUFDcEIsVUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0FBQ3RDLGFBQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVc7QUFDNUQsZUFBTyxhQTVCTSxlQUFlLEVBNEJMLFNBQVMsRUFBRSxVQUFTLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDdkQsY0FBSSxNQUFNLEVBQUU7QUFDVixnQkFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1dBQ2YsTUFBTTtBQUNMLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsdUJBQXFCLElBQUksRUFBSSxFQUFDLE1BQU0sRUFBRSw2REFBNkQsRUFBQyxDQUFDLENBQUE7V0FDakk7U0FDRixDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7O0dBQ0g7O0FBRUQsU0FBTyxPQUFPLENBQUE7Q0FDZiIsImZpbGUiOiIvVXNlcnMvUmFkL0RvY3VtZW50cy9EZXYvbXlfbm9kZWpzX2FwcHMvbGludGVyLWpzY3Mvbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1kZXBzL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbmNvbnN0IEZTID0gcmVxdWlyZSgnZnMnKVxuY29uc3QgUGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3Qge1ZpZXd9ID0gcmVxdWlyZSgnLi92aWV3JylcbmltcG9ydCB7Z3Vlc3NOYW1lLCBpbnN0YWxsUGFja2FnZXMsIHBhY2thZ2VzVG9JbnN0YWxsfSBmcm9tICcuL2hlbHBlcnMnXG5cbi8vIFJlbmFtZWQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbmlmICh0eXBlb2Ygd2luZG93Ll9fc3RlZWxicmFpbl9wYWNrYWdlX2RlcHMgPT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5fX3N0ZWVsYnJhaW5fcGFja2FnZV9kZXBzID0gbmV3IFNldCgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsKG5hbWUgPSBudWxsLCBlbmFibGVQYWNrYWdlcyA9IGZhbHNlKSB7XG4gIGlmICghbmFtZSkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcmVxdWlyZSgnc2ItY2FsbHNpdGUnKS5jYXB0dXJlKClbMV0uZmlsZVxuICAgIG5hbWUgPSBndWVzc05hbWUoZmlsZVBhdGgpXG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICBjb25zb2xlLmxvZyhgVW5hYmxlIHRvIGdldCBwYWNrYWdlIG5hbWUgZm9yIGZpbGU6ICR7ZmlsZVBhdGh9YClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH1cbiAgfVxuICBjb25zdCB7dG9JbnN0YWxsLCB0b0VuYWJsZX0gPSBwYWNrYWdlc1RvSW5zdGFsbChuYW1lKVxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpXG5cbiAgaWYgKGVuYWJsZVBhY2thZ2VzICYmIHRvRW5hYmxlLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSB0b0VuYWJsZS5yZWR1Y2UoZnVuY3Rpb24ocHJvbWlzZSwgbmFtZSkge1xuICAgICAgYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKG5hbWUpXG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UobmFtZSlcbiAgICB9LCBwcm9taXNlKVxuICB9XG4gIGlmICh0b0luc3RhbGwubGVuZ3RoKSB7XG4gICAgY29uc3QgdmlldyA9IG5ldyBWaWV3KG5hbWUsIHRvSW5zdGFsbClcbiAgICBwcm9taXNlID0gUHJvbWlzZS5hbGwoW3ZpZXcuc2hvdygpLCBwcm9taXNlXSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpbnN0YWxsUGFja2FnZXModG9JbnN0YWxsLCBmdW5jdGlvbihuYW1lLCBzdGF0dXMpIHtcbiAgICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICAgIHZpZXcuYWR2YW5jZSgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBFcnJvciBJbnN0YWxsaW5nICR7bmFtZX1gLCB7ZGV0YWlsOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcuIFRyeSBpbnN0YWxsaW5nIHRoaXMgcGFja2FnZSBtYW51YWxseS4nfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHByb21pc2Vcbn1cbiJdfQ==