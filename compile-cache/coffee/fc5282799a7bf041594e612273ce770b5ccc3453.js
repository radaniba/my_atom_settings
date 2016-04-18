
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Rustfmt = (function(_super) {
    __extends(Rustfmt, _super);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options) {
      var editor, file, filePath, program, tmpFile;
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? editor.buffer.file : void 0;
      filePath = file != null ? file.path : void 0;
      program = options.rustfmt_path || "rustfmt";
      return this.run(program, [tmpFile = this.tempFile("tmp", text), ["--write-mode", "overwrite"], ["--config-path", filePath]], {
        help: {
          link: "https://github.com/nrc/rustfmt",
          program: "rustfmt",
          pathOption: "Rust - Rustfmt Path"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tmpFile);
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9ydXN0Zm10LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLElBQUEsR0FBTSxTQUFOLENBQUE7O0FBQUEsc0JBRUEsT0FBQSxHQUFTO0FBQUEsTUFDUCxJQUFBLEVBQU0sSUFEQztLQUZULENBQUE7O0FBQUEsc0JBTUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQU1SLFVBQUEsd0NBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxJQUFBLG9CQUFPLE1BQU0sQ0FBRSxNQUFNLENBQUMsYUFEdEIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxrQkFBVyxJQUFJLENBQUUsYUFGakIsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxZQUFSLElBQXdCLFNBSGxDLENBQUE7YUFJQSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxDQUNaLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsRUFBaUIsSUFBakIsQ0FERSxFQUVaLENBQUMsY0FBRCxFQUFpQixXQUFqQixDQUZZLEVBR1osQ0FBQyxlQUFELEVBQWtCLFFBQWxCLENBSFksQ0FBZCxFQUlLO0FBQUEsUUFBQSxJQUFBLEVBQU07QUFBQSxVQUNQLElBQUEsRUFBTSxnQ0FEQztBQUFBLFVBRVAsT0FBQSxFQUFTLFNBRkY7QUFBQSxVQUdQLFVBQUEsRUFBWSxxQkFITDtTQUFOO09BSkwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUUixFQVZRO0lBQUEsQ0FOVixDQUFBOzttQkFBQTs7S0FGcUMsV0FQdkMsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautifiers/rustfmt.coffee
