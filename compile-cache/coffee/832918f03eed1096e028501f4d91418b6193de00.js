
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.isPreInstalled = false;

    PHPCBF.prototype.options = {
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var isWin, standardFile, standardFiles, tempFile;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      isWin = this.isWindows;
      if (isWin) {
        return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, this.which('phpcbf')]).then((function(_this) {
          return function(paths) {
            var _, exec, isExec, path, phpcbfPath, tempFile;
            _this.debug('phpcbf paths', paths);
            _ = require('lodash');
            path = require('path');
            phpcbfPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpcbfPath', phpcbfPath);
            _this.debug('phpcbfPath', phpcbfPath, paths);
            if (phpcbfPath != null) {
              isExec = path.extname(phpcbfPath) !== '';
              exec = isExec ? phpcbfPath : "php";
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, options.phpcbf_version !== 3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                },
                onStdin: function(stdin) {
                  return stdin.end();
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('phpcbf not found!');
              return _this.Promise.reject(_this.commandNotFoundError('phpcbf', {
                link: "https://github.com/squizlabs/PHP_CodeSniffer",
                program: "phpcbf.phar",
                pathOption: "PHPCBF Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("phpcbf", ["--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/squizlabs/PHP_CodeSniffer"
          },
          onStdin: function(stdin) {
            return stdin.end();
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9waHBjYmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLGtCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztxQkFDckIsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O3FCQUVoQixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLGNBQUEsRUFBZ0IsSUFEaEI7UUFFQSxRQUFBLEVBQVUsSUFGVjtPQUZLOzs7cUJBT1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ0EsYUFBQSxHQUFnQixDQUFDLFdBQUQsRUFBYyxnQkFBZCxFQUFnQyxtQkFBaEMsRUFBcUQsYUFBckQ7TUFDaEIsWUFBQSxHQUFlLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLGFBQXRDO01BRWYsSUFBbUMsWUFBbkM7UUFBQSxPQUFPLENBQUMsUUFBUixHQUFtQixhQUFuQjs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBO01BQ1QsSUFBRyxLQUFIO2VBRUUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDb0IsT0FBTyxDQUFDLFdBQXZDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsV0FBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sUUFBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7QUFDTixnQkFBQTtZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QixLQUF2QjtZQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtZQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtZQUVQLFVBQUEsR0FBYSxDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7cUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1lBQWIsQ0FBZDtZQUNiLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixVQUF2QjtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixVQUFyQixFQUFpQyxLQUFqQztZQUVBLElBQUcsa0JBQUg7Y0FJRSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBOEI7Y0FDdkMsSUFBQSxHQUFVLE1BQUgsR0FBZSxVQUFmLEdBQStCO3FCQUV0QyxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxDQUNULENBQWtCLE1BQWxCLEdBQUEsVUFBQSxHQUFBLE1BRFMsRUFFVyxPQUFPLENBQUMsY0FBUixLQUEwQixDQUE5QyxHQUFBLFlBQUEsR0FBQSxNQUZTLEVBRzJCLE9BQU8sQ0FBQyxRQUE1QyxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUhTLEVBSVQsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUpGLENBQVgsRUFLSztnQkFDRCxnQkFBQSxFQUFrQixJQURqQjtnQkFFRCxJQUFBLEVBQU07a0JBQ0osSUFBQSxFQUFNLHNDQURGO2lCQUZMO2dCQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7eUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtnQkFETyxDQUxSO2VBTEwsQ0FhRSxDQUFDLElBYkgsQ0FhUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBYlIsRUFQRjthQUFBLE1BQUE7Y0F3QkUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBVDtxQkFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBQyxDQUFBLG9CQUFELENBQ2QsUUFEYyxFQUVkO2dCQUNBLElBQUEsRUFBTSw4Q0FETjtnQkFFQSxPQUFBLEVBQVMsYUFGVDtnQkFHQSxVQUFBLEVBQVksYUFIWjtlQUZjLENBQWhCLEVBMUJGOztVQVRNO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSLEVBRkY7T0FBQSxNQUFBO2VBa0RFLElBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLENBQ2IsWUFEYSxFQUV1QixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFGYSxFQUdiLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FIRSxDQUFmLEVBSUs7VUFDRCxnQkFBQSxFQUFrQixJQURqQjtVQUVELElBQUEsRUFBTTtZQUNKLElBQUEsRUFBTSw4Q0FERjtXQUZMO1VBS0QsT0FBQSxFQUFTLFNBQUMsS0FBRDttQkFDUCxLQUFLLENBQUMsR0FBTixDQUFBO1VBRE8sQ0FMUjtTQUpMLENBWUUsQ0FBQyxJQVpILENBWVEsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FaUixFQWxERjs7SUFSUTs7OztLQVowQjtBQVB0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFBIUDpcbiAgICAgIHBocGNiZl9wYXRoOiB0cnVlXG4gICAgICBwaHBjYmZfdmVyc2lvbjogdHJ1ZVxuICAgICAgc3RhbmRhcmQ6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdwaHBjYmYnLCBvcHRpb25zKVxuICAgIHN0YW5kYXJkRmlsZXMgPSBbJ3BocGNzLnhtbCcsICdwaHBjcy54bWwuZGlzdCcsICdwaHBjcy5ydWxlc2V0LnhtbCcsICdydWxlc2V0LnhtbCddXG4gICAgc3RhbmRhcmRGaWxlID0gQGZpbmRGaWxlKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBzdGFuZGFyZEZpbGVzKVxuXG4gICAgb3B0aW9ucy5zdGFuZGFyZCA9IHN0YW5kYXJkRmlsZSBpZiBzdGFuZGFyZEZpbGVcblxuICAgIGlzV2luID0gQGlzV2luZG93c1xuICAgIGlmIGlzV2luXG4gICAgICAjIEZpbmQgcGhwY2JmLnBoYXIgc2NyaXB0XG4gICAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgICBAd2hpY2gob3B0aW9ucy5waHBjYmZfcGF0aCkgaWYgb3B0aW9ucy5waHBjYmZfcGF0aFxuICAgICAgICBAd2hpY2goJ3BocGNiZicpXG4gICAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgICAgQGRlYnVnKCdwaHBjYmYgcGF0aHMnLCBwYXRocylcbiAgICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICAgIHBocGNiZlBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgICBAdmVyYm9zZSgncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgpXG4gICAgICAgIEBkZWJ1ZygncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgsIHBhdGhzKVxuICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBwYXRoIHdhcyBmb3VuZFxuICAgICAgICBpZiBwaHBjYmZQYXRoP1xuICAgICAgICAgICMgRm91bmQgcGhwY2JmIHBhdGhcblxuICAgICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIGlzIGFuIGV4ZWN1dGFibGVcbiAgICAgICAgICBpc0V4ZWMgPSBwYXRoLmV4dG5hbWUocGhwY2JmUGF0aCkgaXNudCAnJ1xuICAgICAgICAgIGV4ZWMgPSBpZiBpc0V4ZWMgdGhlbiBwaHBjYmZQYXRoIGVsc2UgXCJwaHBcIlxuXG4gICAgICAgICAgQHJ1bihleGVjLCBbXG4gICAgICAgICAgICBwaHBjYmZQYXRoIHVubGVzcyBpc0V4ZWNcbiAgICAgICAgICAgIFwiLS1uby1wYXRjaFwiIHVubGVzcyBvcHRpb25zLnBocGNiZl92ZXJzaW9uIGlzIDNcbiAgICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgICAgICBdLCB7XG4gICAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICAgIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmVyYm9zZSgncGhwY2JmIG5vdCBmb3VuZCEnKVxuICAgICAgICAgICMgQ291bGQgbm90IGZpbmQgcGhwY2JmIHBhdGhcbiAgICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgJ3BocGNiZidcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHBjYmYucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUENCRiBQYXRoXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJwaHBjYmZcIiwgW1xuICAgICAgICBcIi0tbm8tcGF0Y2hcIlxuICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtcbiAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgfVxuICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
