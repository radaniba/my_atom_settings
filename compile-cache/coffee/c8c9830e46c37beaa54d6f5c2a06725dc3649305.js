
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "https://github.com/FriendsOfPHP/PHP-CS-Fixer";

    PHPCSFixer.prototype.isPreInstalled = false;

    PHPCSFixer.prototype.options = {
      PHP: {
        rules: true,
        cs_fixer_path: true,
        cs_fixer_version: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, configFile ? "--config=" + configFile : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      if (version === 1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, this.which('php-cs-fixer')]).then((function(_this) {
        return function(paths) {
          var _, phpCSFixerPath, tempFile;
          _this.debug('php-cs-fixer paths', paths);
          _ = require('lodash');
          phpCSFixerPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('phpCSFixerPath', phpCSFixerPath);
          _this.debug('phpCSFixerPath', phpCSFixerPath, paths);
          if (phpCSFixerPath != null) {
            tempFile = _this.tempFile("temp", text);
            if (_this.isWindows) {
              return _this.run("php", [phpCSFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              return _this.run(phpCSFixerPath, [phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            }
          } else {
            _this.verbose('php-cs-fixer not found!');
            return _this.Promise.reject(_this.commandNotFoundError('php-cs-fixer', {
              link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
              program: "php-cs-fixer.phar",
              pathOption: "PHP - CS Fixer Path"
            }));
          }
        };
      })(this));
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9waHAtY3MtZml4ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLDRCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBRXJCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFDTixjQUFBLEdBQWdCOzt5QkFFaEIsT0FBQSxHQUNFO01BQUEsR0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFDQSxhQUFBLEVBQWUsSUFEZjtRQUVBLGdCQUFBLEVBQWtCLElBRmxCO1FBR0EsV0FBQSxFQUFhLElBSGI7UUFJQSxLQUFBLEVBQU8sSUFKUDtRQUtBLE1BQUEsRUFBUSxJQUxSO09BREY7Ozt5QkFRRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsT0FBdkI7TUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDO01BRWxCLFVBQUEsR0FBZ0IsaUJBQUEsSUFBYSwwQkFBaEIsR0FBdUMsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQixDQUFWLEVBQTBDLFNBQTFDLENBQXZDLEdBQUE7TUFDYixpQkFBQSxHQUFvQixDQUNsQixLQURrQixFQUVZLE9BQU8sQ0FBQyxLQUF0QyxHQUFBLFVBQUEsR0FBVyxPQUFPLENBQUMsS0FBbkIsR0FBQSxNQUZrQixFQUdVLFVBQTVCLEdBQUEsV0FBQSxHQUFZLFVBQVosR0FBQSxNQUhrQixFQUl3QixPQUFPLENBQUMsV0FBbEQsR0FBQSxnQkFBQSxHQUFpQixPQUFPLENBQUMsV0FBekIsR0FBQSxNQUprQixFQUtsQixrQkFMa0I7TUFPcEIsSUFBRyxPQUFBLEtBQVcsQ0FBZDtRQUNFLGlCQUFBLEdBQW9CLENBQ2xCLEtBRGtCLEVBRVksT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BRmtCLEVBR2MsT0FBTyxDQUFDLE1BQXhDLEdBQUEsV0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFwQixHQUFBLE1BSGtCLEVBSWUsVUFBakMsR0FBQSxnQkFBQSxHQUFpQixVQUFqQixHQUFBLE1BSmtCLEVBRHRCOztNQU9BLFVBQUEsR0FBYTtRQUNYLGdCQUFBLEVBQWtCLElBRFA7UUFFWCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0sOENBREY7U0FGSzs7YUFRYixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNzQixPQUFPLENBQUMsYUFBekMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxhQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ04sY0FBQTtVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIsS0FBN0I7VUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFFSixjQUFBLEdBQWlCLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUCxFQUFjLFNBQUMsQ0FBRDttQkFBTyxDQUFBLElBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7VUFBYixDQUFkO1VBQ2pCLEtBQUMsQ0FBQSxPQUFELENBQVMsZ0JBQVQsRUFBMkIsY0FBM0I7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLEVBQXlCLGNBQXpCLEVBQXlDLEtBQXpDO1VBR0EsSUFBRyxzQkFBSDtZQUVFLFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEI7WUFFWCxJQUFHLEtBQUMsQ0FBQSxTQUFKO3FCQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQUMsY0FBRCxFQUFpQixpQkFBakIsRUFBb0MsUUFBcEMsQ0FBWixFQUEyRCxVQUEzRCxDQUNFLENBQUMsSUFESCxDQUNRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FEUixFQURGO2FBQUEsTUFBQTtxQkFNRSxLQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FBQyxpQkFBRCxFQUFvQixRQUFwQixDQUFyQixFQUFvRCxVQUFwRCxDQUNFLENBQUMsSUFESCxDQUNRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FEUixFQU5GO2FBSkY7V0FBQSxNQUFBO1lBZUUsS0FBQyxDQUFBLE9BQUQsQ0FBUyx5QkFBVDttQkFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBQyxDQUFBLG9CQUFELENBQ2QsY0FEYyxFQUVkO2NBQ0UsSUFBQSxFQUFNLDhDQURSO2NBRUUsT0FBQSxFQUFTLG1CQUZYO2NBR0UsVUFBQSxFQUFZLHFCQUhkO2FBRmMsQ0FBaEIsRUFqQkY7O1FBVE07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFI7SUEzQlE7Ozs7S0FmOEI7QUFSMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENTRml4ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogJ1BIUC1DUy1GaXhlcidcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6XG4gICAgUEhQOlxuICAgICAgcnVsZXM6IHRydWVcbiAgICAgIGNzX2ZpeGVyX3BhdGg6IHRydWVcbiAgICAgIGNzX2ZpeGVyX3ZlcnNpb246IHRydWVcbiAgICAgIGFsbG93X3Jpc2t5OiB0cnVlXG4gICAgICBsZXZlbDogdHJ1ZVxuICAgICAgZml4ZXJzOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBAZGVidWcoJ3BocC1jcy1maXhlcicsIG9wdGlvbnMpXG4gICAgdmVyc2lvbiA9IG9wdGlvbnMuY3NfZml4ZXJfdmVyc2lvblxuXG4gICAgY29uZmlnRmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksICcucGhwX2NzJylcbiAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgIFwiZml4XCJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xuICAgICAgXCItLWNvbmZpZz0je2NvbmZpZ0ZpbGV9XCIgaWYgY29uZmlnRmlsZVxuICAgICAgXCItLWFsbG93LXJpc2t5PSN7b3B0aW9ucy5hbGxvd19yaXNreX1cIiBpZiBvcHRpb25zLmFsbG93X3Jpc2t5XG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxuICAgIF1cbiAgICBpZiB2ZXJzaW9uIGlzIDFcbiAgICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7Y29uZmlnRmlsZX1cIiBpZiBjb25maWdGaWxlXG4gICAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5jc19maXhlcl9wYXRoKSBpZiBvcHRpb25zLmNzX2ZpeGVyX3BhdGhcbiAgICAgIEB3aGljaCgncGhwLWNzLWZpeGVyJylcbiAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyIHBhdGhzJywgcGF0aHMpXG4gICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHBocENTRml4ZXJQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgIEB2ZXJib3NlKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoKVxuICAgICAgQGRlYnVnKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoLCBwYXRocylcblxuICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgIGlmIHBocENTRml4ZXJQYXRoP1xuICAgICAgICAjIEZvdW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICBAcnVuKFwicGhwXCIsIFtwaHBDU0ZpeGVyUGF0aCwgcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBydW4ocGhwQ1NGaXhlclBhdGgsIFtwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBAdmVyYm9zZSgncGhwLWNzLWZpeGVyIG5vdCBmb3VuZCEnKVxuICAgICAgICAjIENvdWxkIG5vdCBmaW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgJ3BocC1jcy1maXhlcidcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwLWNzLWZpeGVyLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFAgLSBDUyBGaXhlciBQYXRoXCJcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgKVxuIl19
