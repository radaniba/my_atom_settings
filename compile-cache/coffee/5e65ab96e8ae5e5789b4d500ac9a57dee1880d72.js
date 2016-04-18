(function() {
  var Linter, LinterPyflakes, linterPath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  console.log(linterPath);

  Linter = require("" + linterPath + "/lib/linter");

  LinterPyflakes = (function(_super) {
    __extends(LinterPyflakes, _super);

    LinterPyflakes.syntax = ['source.python'];

    LinterPyflakes.prototype.cmd = 'pyflakes';

    LinterPyflakes.prototype.executablePath = null;

    LinterPyflakes.prototype.linterName = 'pyflakes';

    LinterPyflakes.prototype.regex = ':(?<line>\\d+): (?<message>.*?)\n';

    function LinterPyflakes(editor) {
      LinterPyflakes.__super__.constructor.call(this, editor);
      atom.config.observe('linter-python-pyflakes.pyflakesDirToExecutable', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-python-pyflakes.pyflakesDirToExecutable');
        };
      })(this));
    }

    LinterPyflakes.prototype.destroy = function() {
      return atom.config.unobserve('linter-python-pyflakes.pyflakesDirToExecutable');
    };

    return LinterPyflakes;

  })(Linter);

  module.exports = LinterPyflakes;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQUF3QyxDQUFDLElBQXRELENBQUE7O0FBQUEsRUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosQ0FEQSxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxFQUFBLEdBQUcsVUFBSCxHQUFjLGFBQXRCLENBRlQsQ0FBQTs7QUFBQSxFQUlNO0FBQ0oscUNBQUEsQ0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxNQUFELEdBQVMsQ0FBQyxlQUFELENBQVQsQ0FBQTs7QUFBQSw2QkFFQSxHQUFBLEdBQUssVUFGTCxDQUFBOztBQUFBLDZCQUlBLGNBQUEsR0FBZ0IsSUFKaEIsQ0FBQTs7QUFBQSw2QkFNQSxVQUFBLEdBQVksVUFOWixDQUFBOztBQUFBLDZCQVNBLEtBQUEsR0FDRSxtQ0FWRixDQUFBOztBQVlhLElBQUEsd0JBQUMsTUFBRCxHQUFBO0FBQ1gsTUFBQSxnREFBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGdEQUFwQixFQUFzRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwRSxLQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0RBQWhCLEVBRGtEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEUsQ0FGQSxDQURXO0lBQUEsQ0FaYjs7QUFBQSw2QkFrQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQixnREFBdEIsRUFETztJQUFBLENBbEJULENBQUE7OzBCQUFBOztLQUQyQixPQUo3QixDQUFBOztBQUFBLEVBMEJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGNBMUJqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Rad/.atom/packages/linter-python-pyflakes/lib/linter-python-pyflakes.coffee