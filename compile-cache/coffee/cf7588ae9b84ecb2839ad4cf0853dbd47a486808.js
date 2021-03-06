(function() {
  var $$, BufferedProcess, CherryPickSelectBranch, CherryPickSelectCommits, SelectListView, git, notifier, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BufferedProcess = require('atom').BufferedProcess;

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  CherryPickSelectCommits = require('./cherry-pick-select-commits-view');

  module.exports = CherryPickSelectBranch = (function(_super) {
    __extends(CherryPickSelectBranch, _super);

    function CherryPickSelectBranch() {
      return CherryPickSelectBranch.__super__.constructor.apply(this, arguments);
    }

    CherryPickSelectBranch.prototype.initialize = function(repo, items, currentHead) {
      this.repo = repo;
      this.currentHead = currentHead;
      CherryPickSelectBranch.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(items);
      return this.focusFilterEditor();
    };

    CherryPickSelectBranch.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    CherryPickSelectBranch.prototype.cancelled = function() {
      return this.hide();
    };

    CherryPickSelectBranch.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    CherryPickSelectBranch.prototype.viewForItem = function(item) {
      return $$(function() {
        return this.li(item);
      });
    };

    CherryPickSelectBranch.prototype.confirmed = function(item) {
      var args;
      this.cancel();
      args = ['log', '--cherry-pick', '-z', '--format=%H%n%an%n%ar%n%s', "" + this.currentHead + "..." + item];
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(save) {
          if (save.length > 0) {
            return new CherryPickSelectCommits(_this.repo, save.split('\0').slice(0, -1));
          } else {
            return notifier.addInfo("No commits available to cherry-pick.");
          }
        };
      })(this));
    };

    return CherryPickSelectBranch;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvY2hlcnJ5LXBpY2stc2VsZWN0LWJyYW5jaC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5R0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBREwsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLG1DQUFSLENBTDFCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosNkNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHFDQUFBLFVBQUEsR0FBWSxTQUFFLElBQUYsRUFBUSxLQUFSLEVBQWdCLFdBQWhCLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRHlCLElBQUMsQ0FBQSxjQUFBLFdBQzFCLENBQUE7QUFBQSxNQUFBLHdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBSlU7SUFBQSxDQUFaLENBQUE7O0FBQUEscUNBTUEsSUFBQSxHQUFNLFNBQUEsR0FBQTs7UUFDSixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BQVY7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBREEsQ0FBQTthQUdBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBSkk7SUFBQSxDQU5OLENBQUE7O0FBQUEscUNBWUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtJQUFBLENBWlgsQ0FBQTs7QUFBQSxxQ0FjQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osVUFBQSxLQUFBO2lEQUFNLENBQUUsT0FBUixDQUFBLFdBREk7SUFBQSxDQWROLENBQUE7O0FBQUEscUNBaUJBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTthQUNYLEVBQUEsQ0FBRyxTQUFBLEdBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJLElBQUosRUFEQztNQUFBLENBQUgsRUFEVztJQUFBLENBakJiLENBQUE7O0FBQUEscUNBcUJBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxDQUNMLEtBREssRUFFTCxlQUZLLEVBR0wsSUFISyxFQUlMLDJCQUpLLEVBS0wsRUFBQSxHQUFHLElBQUMsQ0FBQSxXQUFKLEdBQWdCLEtBQWhCLEdBQXFCLElBTGhCLENBRFAsQ0FBQTthQVNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsUUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNKLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO21CQUNNLElBQUEsdUJBQUEsQ0FBd0IsS0FBQyxDQUFBLElBQXpCLEVBQStCLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQixhQUFoRCxFQUROO1dBQUEsTUFBQTttQkFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQixzQ0FBakIsRUFIRjtXQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixFQVZTO0lBQUEsQ0FyQlgsQ0FBQTs7a0NBQUE7O0tBRm1DLGVBUnJDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/views/cherry-pick-select-branch-view.coffee
