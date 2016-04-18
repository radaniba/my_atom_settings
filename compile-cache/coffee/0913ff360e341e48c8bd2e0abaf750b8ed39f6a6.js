(function() {
  var $$, OverrideView, SelectListView, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  path = require('path');

  module.exports = OverrideView = (function(_super) {
    __extends(OverrideView, _super);

    function OverrideView() {
      return OverrideView.__super__.constructor.apply(this, arguments);
    }

    OverrideView.prototype.initialize = function(matches) {
      OverrideView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for methods');
      this.focusFilterEditor();
      this.indent = 0;
      return this.bufferPosition = null;
    };

    OverrideView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    OverrideView.prototype.viewForItem = function(_arg) {
      var column, fileName, line, moduleName, name, params, parent, relativePath, _, _ref1;
      parent = _arg.parent, name = _arg.name, params = _arg.params, moduleName = _arg.moduleName, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      if (!line) {
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div("" + parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div('builtin', {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      } else {
        _ref1 = atom.project.relativizePath(fileName), _ = _ref1[0], relativePath = _ref1[1];
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div("" + parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div("" + relativePath + ", line " + line, {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      }
    };

    OverrideView.prototype.getFilterKey = function() {
      return 'name';
    };

    OverrideView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No methods found';
      } else {
        return OverrideView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    OverrideView.prototype.confirmed = function(_arg) {
      var column, editor, instance, line, line1, line2, name, params, parent, superCall, tabLength, tabText, userIndent;
      parent = _arg.parent, instance = _arg.instance, name = _arg.name, params = _arg.params, line = _arg.line, column = _arg.column;
      this.cancelPosition = null;
      this.cancel();
      editor = atom.workspace.getActiveTextEditor();
      tabLength = editor.getTabLength();
      line1 = "def " + name + "(" + (['self'].concat(params).join(', ')) + "):";
      superCall = "super(" + instance + ", self)." + name + "(" + (params.join(', ')) + ")";
      if (name === '__init__') {
        line2 = "" + superCall;
      } else {
        line2 = "return " + superCall;
      }
      if (this.indent < 1) {
        tabText = editor.getTabText();
        editor.insertText("" + tabText + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + tabText + tabText + line2);
      } else {
        userIndent = editor.getTextInRange([[this.bufferPosition.row, 0], [this.bufferPosition.row, this.bufferPosition.column]]);
        editor.insertText("" + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + userIndent + userIndent + line2);
      }
    };

    OverrideView.prototype.cancelled = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    return OverrideView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9vdmVycmlkZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsVUFBQSxFQUFELEVBQUssc0JBQUEsY0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMkJBQUEsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsTUFBQSw4Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLGNBQVYsQ0FGQSxDQUFBOztRQUdBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFVBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7T0FIVjtBQUFBLE1BSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsVUFBRCxDQUFZLHFCQUFaLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBUFYsQ0FBQTthQVFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEtBVFI7SUFBQSxDQUFaLENBQUE7O0FBQUEsMkJBV0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxFQUZPO0lBQUEsQ0FYVCxDQUFBOztBQUFBLDJCQWVBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTtBQUNYLFVBQUEsZ0ZBQUE7QUFBQSxNQURhLGNBQUEsUUFBUSxZQUFBLE1BQU0sY0FBQSxRQUFRLGtCQUFBLFlBQVksZ0JBQUEsVUFBVSxZQUFBLE1BQU0sY0FBQSxNQUMvRCxDQUFBO0FBQUEsTUFBQSxJQUFHLENBQUEsSUFBSDtBQUNFLGVBQU8sRUFBQSxDQUFHLFNBQUEsR0FBQTtpQkFDUixJQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsWUFBQSxPQUFBLEVBQU8sV0FBUDtXQUFKLEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO0FBQ3RCLGNBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxFQUFBLEdBQUcsTUFBSCxHQUFVLEdBQVYsR0FBYSxJQUFsQixFQUEwQjtBQUFBLGdCQUFBLE9BQUEsRUFBTyxjQUFQO2VBQTFCLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0I7QUFBQSxnQkFBQSxPQUFBLEVBQU8sZ0JBQVA7ZUFBaEIsRUFGc0I7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixFQURRO1FBQUEsQ0FBSCxDQUFQLENBREY7T0FBQSxNQUFBO0FBTUUsUUFBQSxRQUFvQixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsUUFBNUIsQ0FBcEIsRUFBQyxZQUFELEVBQUksdUJBQUosQ0FBQTtBQUNBLGVBQU8sRUFBQSxDQUFHLFNBQUEsR0FBQTtpQkFDUixJQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsWUFBQSxPQUFBLEVBQU8sV0FBUDtXQUFKLEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO0FBQ3RCLGNBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxFQUFBLEdBQUcsTUFBSCxHQUFVLEdBQVYsR0FBYSxJQUFsQixFQUEwQjtBQUFBLGdCQUFBLE9BQUEsRUFBTyxjQUFQO2VBQTFCLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLEVBQUEsR0FBRyxZQUFILEdBQWdCLFNBQWhCLEdBQXlCLElBQTlCLEVBQXNDO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGdCQUFQO2VBQXRDLEVBRnNCO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFEUTtRQUFBLENBQUgsQ0FBUCxDQVBGO09BRFc7SUFBQSxDQWZiLENBQUE7O0FBQUEsMkJBNEJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxPQUFIO0lBQUEsQ0E1QmQsQ0FBQTs7QUFBQSwyQkE4QkEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLE1BQUEsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7ZUFDRSxtQkFERjtPQUFBLE1BQUE7ZUFHRSxtREFBQSxTQUFBLEVBSEY7T0FEZTtJQUFBLENBOUJqQixDQUFBOztBQUFBLDJCQW9DQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDVCxVQUFBLDZHQUFBO0FBQUEsTUFEVyxjQUFBLFFBQVEsZ0JBQUEsVUFBVSxZQUFBLE1BQU0sY0FBQSxRQUFRLFlBQUEsTUFBTSxjQUFBLE1BQ2pELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQWxCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBRlQsQ0FBQTtBQUFBLE1BR0EsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FIWixDQUFBO0FBQUEsTUFLQSxLQUFBLEdBQVMsTUFBQSxHQUFNLElBQU4sR0FBVyxHQUFYLEdBQWEsQ0FBQyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixJQUE3QixDQUFELENBQWIsR0FBaUQsSUFMMUQsQ0FBQTtBQUFBLE1BTUEsU0FBQSxHQUFhLFFBQUEsR0FBUSxRQUFSLEdBQWlCLFVBQWpCLEdBQTJCLElBQTNCLEdBQWdDLEdBQWhDLEdBQWtDLENBQUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUQsQ0FBbEMsR0FBcUQsR0FObEUsQ0FBQTtBQU9BLE1BQUEsSUFBRyxJQUFBLEtBQVMsVUFBWjtBQUNFLFFBQUEsS0FBQSxHQUFRLEVBQUEsR0FBRyxTQUFYLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxLQUFBLEdBQVMsU0FBQSxHQUFTLFNBQWxCLENBSEY7T0FQQTtBQVlBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQWI7QUFDRSxRQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQVYsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsRUFBQSxHQUFHLE9BQUgsR0FBYSxLQUEvQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBRkEsQ0FBQTtlQUdBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUN4QixDQUFDLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsR0FBc0IsQ0FBdkIsRUFBMEIsQ0FBMUIsQ0FEd0IsRUFFeEIsQ0FBQyxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLEdBQXNCLENBQXZCLEVBQTBCLFNBQUEsR0FBWSxDQUF0QyxDQUZ3QixDQUE1QixFQUlFLEVBQUEsR0FBRyxPQUFILEdBQWEsT0FBYixHQUF1QixLQUp6QixFQUpGO09BQUEsTUFBQTtBQVdFLFFBQUEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQ2pDLENBQUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFqQixFQUFzQixDQUF0QixDQURpQyxFQUVqQyxDQUFDLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBakIsRUFBc0IsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUF0QyxDQUZpQyxDQUF0QixDQUFiLENBQUE7QUFBQSxRQUlBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEVBQUEsR0FBRyxLQUFyQixDQUpBLENBQUE7QUFBQSxRQUtBLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBTEEsQ0FBQTtlQU1BLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUN4QixDQUFDLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsR0FBc0IsQ0FBdkIsRUFBMEIsQ0FBMUIsQ0FEd0IsRUFFeEIsQ0FBQyxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLEdBQXNCLENBQXZCLEVBQTBCLFNBQUEsR0FBWSxDQUF0QyxDQUZ3QixDQUE1QixFQUlFLEVBQUEsR0FBRyxVQUFILEdBQWdCLFVBQWhCLEdBQTZCLEtBSi9CLEVBakJGO09BYlM7SUFBQSxDQXBDWCxDQUFBOztBQUFBLDJCQXdFQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxLQUFBO2lEQUFNLENBQUUsSUFBUixDQUFBLFdBRFM7SUFBQSxDQXhFWCxDQUFBOzt3QkFBQTs7S0FEeUIsZUFKM0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/override-view.coffee
