
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, FortranBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = FortranBeautifier = (function(superClass) {
    extend(FortranBeautifier, superClass);

    function FortranBeautifier() {
      return FortranBeautifier.__super__.constructor.apply(this, arguments);
    }

    FortranBeautifier.prototype.name = "Fortran Beautifier";

    FortranBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    FortranBeautifier.prototype.isPreInstalled = false;

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return this.run("emacs", args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return FortranBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9mb3J0cmFuLWJlYXV0aWZpZXIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1DQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7Z0NBQ3JCLElBQUEsR0FBTTs7Z0NBQ04sSUFBQSxHQUFNOztnQ0FDTixjQUFBLEdBQWdCOztnQ0FFaEIsT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLElBREY7OztnQ0FJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLE9BQTdCO01BRUEsVUFBQSxHQUFhLE9BQU8sQ0FBQztNQUNyQixpQkFBQSxHQUFvQixPQUFPLENBQUM7TUFFNUIsSUFBRyxDQUFJLGlCQUFQO1FBQ0UsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLHFDQUF4QixFQUR0Qjs7TUFHQSxJQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLHFCQUFBLEdBQXdCLGlCQUFyRDtNQUVBLElBQUEsR0FBTyxDQUNMLFNBREssRUFFTCxJQUZLLEVBR0wsaUJBSEssRUFJTCxJQUpLLEVBS0wseUJBTEssRUFNTCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBTk47TUFTUCxJQUFHLFVBQUg7ZUFDRSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsSUFBakIsRUFBdUI7VUFBQyxnQkFBQSxFQUFrQixLQUFuQjtTQUF2QixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFIsRUFERjtPQUFBLE1BQUE7ZUFNRSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxJQUFkLEVBQW9CO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBcEIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBTkY7O0lBcEJROzs7O0tBVHFDO0FBUmpEIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1xuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGb3J0cmFuQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJGb3J0cmFuIEJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIEZvcnRyYW46IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCBvcHRpb25zKVxuXG4gICAgZW1hY3NfcGF0aCA9IG9wdGlvbnMuZW1hY3NfcGF0aFxuICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gb3B0aW9ucy5lbWFjc19zY3JpcHRfcGF0aFxuXG4gICAgaWYgbm90IGVtYWNzX3NjcmlwdF9wYXRoXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZW1hY3MtZm9ydHJhbi1mb3JtYXRpbmctc2NyaXB0Lmxpc3BcIilcblxuICAgIEBkZWJ1ZygnZm9ydHJhbi1iZWF1dGlmaWVyJywgJ2VtYWNzIHNjcmlwdCBwYXRoOiAnICsgZW1hY3Nfc2NyaXB0X3BhdGgpXG5cbiAgICBhcmdzID0gW1xuICAgICAgJy0tYmF0Y2gnXG4gICAgICAnLWwnXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgJy1mJ1xuICAgICAgJ2Y5MC1iYXRjaC1pbmRlbnQtcmVnaW9uJ1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICBdXG5cbiAgICBpZiBlbWFjc19wYXRoXG4gICAgICBAcnVuKGVtYWNzX3BhdGgsIGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcImVtYWNzXCIsIGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
