
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(superClass) {
    extend(Rustfmt, superClass);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/nrc/rustfmt";

    Rustfmt.prototype.isPreInstalled = false;

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/nrc/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9ydXN0Zm10LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0Q0FBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLGlCQUFBLEdBQW9COztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUNOLGNBQUEsR0FBZ0I7O3NCQUVoQixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQU0sSUFEQzs7O3NCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBUixJQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQjtNQUMzQixPQUFBLEdBQVUsT0FBTyxDQUFDLFlBQVIsSUFBd0I7TUFDbEMsSUFBQSxHQUFPO1FBQ0wsSUFBQSxFQUFNLGdDQUREO1FBRUwsT0FBQSxFQUFTLFNBRko7UUFHTCxVQUFBLEVBQVkscUJBSFA7O01BU1AsQ0FBQSxHQUFPLGlCQUFBLEtBQXFCLE9BQXhCLEdBQ0YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FERSxHQUdGLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLENBQUMsV0FBRCxDQUFkLEVBQTZCO1FBQUEsSUFBQSxFQUFNLElBQU47T0FBN0IsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFDLE1BQUQ7UUFDSixJQUFHLHNCQUFzQixDQUFDLElBQXZCLENBQTRCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBNUIsQ0FBSDtVQUNFLGlCQUFBLEdBQW9CO0FBQ3BCLGdCQUFVLElBQUEsS0FBQSxDQUFNLHlDQUFOLEVBRlo7U0FBQSxNQUFBO1VBSUUsaUJBQUEsR0FBb0I7aUJBQ3BCLE9BTEY7O01BREksQ0FEUjthQVVGLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNMLEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLEVBQWQsRUFBa0I7WUFDaEIsR0FBQSxFQUFLLEdBRFc7WUFFaEIsSUFBQSxFQUFNLElBRlU7WUFHaEIsT0FBQSxFQUFTLFNBQUMsS0FBRDtxQkFDUCxLQUFLLENBQUMsR0FBTixDQUFVLElBQVY7WUFETyxDQUhPO1dBQWxCO1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVA7SUF6QlE7Ozs7S0FUMkI7QUFWdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9ucmMvcnVzdGZtdFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxudmVyc2lvbkNoZWNrU3RhdGUgPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJ1c3RmbXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwicnVzdGZtdFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL25yYy9ydXN0Zm10XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1c3Q6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgY3dkID0gY29udGV4dC5maWxlUGF0aCBhbmQgcGF0aC5kaXJuYW1lIGNvbnRleHQuZmlsZVBhdGhcbiAgICBwcm9ncmFtID0gb3B0aW9ucy5ydXN0Zm10X3BhdGggb3IgXCJydXN0Zm10XCJcbiAgICBoZWxwID0ge1xuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbnJjL3J1c3RmbXRcIlxuICAgICAgcHJvZ3JhbTogXCJydXN0Zm10XCJcbiAgICAgIHBhdGhPcHRpb246IFwiUnVzdCAtIFJ1c3RmbXQgUGF0aFwiXG4gICAgfVxuXG4gICAgIyAwLjUuMCBpcyBhIHJlbGF0aXZlbHkgbmV3IHZlcnNpb24gYXQgdGhlIHBvaW50IG9mIHdyaXRpbmcsXG4gICAgIyBidXQgaXMgZXNzZW50aWFsIGZvciB0aGlzIHRvIHdvcmsgd2l0aCBzdGRpbi5cbiAgICAjID0+IENoZWNrIGZvciBpdCBzcGVjaWZpY2FsbHkuXG4gICAgcCA9IGlmIHZlcnNpb25DaGVja1N0YXRlID09IHByb2dyYW1cbiAgICAgIEBQcm9taXNlLnJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgIEBydW4ocHJvZ3JhbSwgW1wiLS12ZXJzaW9uXCJdLCBoZWxwOiBoZWxwKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSAtPlxuICAgICAgICAgIGlmIC9eMFxcLig/OlswLTRdXFwuWzAtOV0pLy50ZXN0KHN0ZG91dC50cmltKCkpXG4gICAgICAgICAgICB2ZXJzaW9uQ2hlY2tTdGF0ZSA9IGZhbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydXN0Zm10IHZlcnNpb24gMC41LjAgb3IgbmV3ZXIgcmVxdWlyZWRcIilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB2ZXJzaW9uQ2hlY2tTdGF0ZSA9IHByb2dyYW1cbiAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICApXG5cbiAgICBwLnRoZW4oPT5cbiAgICAgIEBydW4ocHJvZ3JhbSwgW10sIHtcbiAgICAgICAgY3dkOiBjd2RcbiAgICAgICAgaGVscDogaGVscFxuICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgc3RkaW4uZW5kIHRleHRcbiAgICAgIH0pXG4gICAgKVxuIl19
