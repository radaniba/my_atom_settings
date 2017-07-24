(function() {
  var BranchListView, OutputViewManager, PullBranchListView, git, isValidBranch, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  isValidBranch = function(item, remote) {
    return item.startsWith(remote + '/') && !item.includes('/HEAD');
  };

  module.exports = PullBranchListView = (function(superClass) {
    extend(PullBranchListView, superClass);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data1, remote1, extraArgs) {
      this.repo = repo;
      this.data = data1;
      this.remote = remote1;
      this.extraArgs = extraArgs;
      PullBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PullBranchListView.prototype.parseData = function() {
      var branches, items;
      items = this.data.split("\n").map(function(item) {
        return item.replace(/\s/g, '');
      });
      branches = items.filter((function(_this) {
        return function(item) {
          return isValidBranch(item, _this.remote);
        };
      })(this)).map(function(item) {
        return {
          name: item
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems(branches);
      }
      return this.focusFilterEditor();
    };

    PullBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
      this.pull(name.substring(name.indexOf('/') + 1));
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var args, startMessage, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve(remoteBranch);
          view.setContent(data).finish();
          startMessage.dismiss();
          return git.refresh(_this.repo);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUZBQUE7SUFBQTs7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUVqQixhQUFBLEdBQWdCLFNBQUMsSUFBRCxFQUFPLE1BQVA7V0FDZCxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFBLEdBQVMsR0FBekIsQ0FBQSxJQUFrQyxDQUFJLElBQUksQ0FBQyxRQUFMLENBQWMsT0FBZDtFQUR4Qjs7RUFHaEIsTUFBTSxDQUFDLE9BQVAsR0FHUTs7Ozs7OztpQ0FDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUixFQUFlLE9BQWYsRUFBd0IsU0FBeEI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsWUFBRDtNQUNsQyxvREFBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7VUFDcEIsS0FBQyxDQUFBLE9BQUQsR0FBVztpQkFDWCxLQUFDLENBQUEsTUFBRCxHQUFVO1FBRlU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFGSjs7aUNBTVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLElBQUQ7ZUFBVSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7TUFBVixDQUF0QjtNQUNSLFFBQUEsR0FBVyxLQUFLLENBQUMsTUFBTixDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLEtBQUMsQ0FBQSxNQUFyQjtRQUFWO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsU0FBQyxJQUFEO2VBQVU7VUFBQyxJQUFBLEVBQU0sSUFBUDs7TUFBVixDQUF6RDtNQUNYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLFFBQVMsQ0FBQSxDQUFBLENBQXBCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBSEY7O2FBSUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFQUzs7aUNBU1gsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEdBQW9CLENBQW5DLENBQU47YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7O2lDQUlYLElBQUEsR0FBTSxTQUFDLFlBQUQ7QUFDSixVQUFBOztRQURLLGVBQWE7O01BQ2xCLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO01BQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBL0I7TUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxTQUFqQixFQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsWUFBckMsQ0FBa0QsQ0FBQyxNQUFuRCxDQUEwRCxTQUFDLEdBQUQ7ZUFBUyxHQUFBLEtBQVM7TUFBbEIsQ0FBMUQ7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUFkLEVBQWdEO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNKLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVDtVQUNBLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQTtVQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7aUJBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtRQUpJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUdMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTtpQkFDQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSks7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlA7SUFKSTs7OztLQXBCeUI7QUFYbkMiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuL2JyYW5jaC1saXN0LXZpZXcnXG5cbmlzVmFsaWRCcmFuY2ggPSAoaXRlbSwgcmVtb3RlKSAtPlxuICBpdGVtLnN0YXJ0c1dpdGgocmVtb3RlICsgJy8nKSBhbmQgbm90IGl0ZW0uaW5jbHVkZXMoJy9IRUFEJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIEV4dGVuc2lvbiBvZiBCcmFuY2hMaXN0Vmlld1xuICAjIFRha2VzIHRoZSBuYW1lIG9mIHRoZSByZW1vdGUgdG8gcHVsbCBmcm9tXG4gIGNsYXNzIFB1bGxCcmFuY2hMaXN0VmlldyBleHRlbmRzIEJyYW5jaExpc3RWaWV3XG4gICAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwgQHJlbW90ZSwgQGV4dHJhQXJncykgLT5cbiAgICAgIHN1cGVyXG4gICAgICBAcmVzdWx0ID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgQHJlc29sdmUgPSByZXNvbHZlXG4gICAgICAgIEByZWplY3QgPSByZWplY3RcblxuICAgIHBhcnNlRGF0YTogLT5cbiAgICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIikubWFwIChpdGVtKSAtPiBpdGVtLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgICAgIGJyYW5jaGVzID0gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiBpc1ZhbGlkQnJhbmNoKGl0ZW0sIEByZW1vdGUpKS5tYXAgKGl0ZW0pIC0+IHtuYW1lOiBpdGVtfVxuICAgICAgaWYgYnJhbmNoZXMubGVuZ3RoIGlzIDFcbiAgICAgICAgQGNvbmZpcm1lZCBicmFuY2hlc1swXVxuICAgICAgZWxzZVxuICAgICAgICBAc2V0SXRlbXMgYnJhbmNoZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgICBAcHVsbCBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICBAY2FuY2VsKClcblxuICAgIHB1bGw6IChyZW1vdGVCcmFuY2g9JycpIC0+XG4gICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBhcmdzID0gWydwdWxsJ10uY29uY2F0KEBleHRyYUFyZ3MsIEByZW1vdGUsIHJlbW90ZUJyYW5jaCkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBAcmVzb2x2ZSByZW1vdGVCcmFuY2hcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICMjIFNob3VsZCBAcmVzdWx0IGJlIHJlamVjdGVkIGZvciB0aG9zZSBkZXBlbmRpbmcgb24gdGhpcyB2aWV3P1xuICAgICAgICAjIEByZWplY3QoKVxuICAgICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
