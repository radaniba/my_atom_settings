(function() {
  var BranchListView, OutputViewManager, PushBranchListView, git, isValidBranch, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  isValidBranch = function(item, remote) {
    return item.startsWith(remote + '/') && !item.includes('/HEAD');
  };

  module.exports = PushBranchListView = (function(superClass) {
    extend(PushBranchListView, superClass);

    function PushBranchListView() {
      return PushBranchListView.__super__.constructor.apply(this, arguments);
    }

    PushBranchListView.prototype.initialize = function(repo, data1, remote1, extraArgs) {
      this.repo = repo;
      this.data = data1;
      this.remote = remote1;
      this.extraArgs = extraArgs;
      PushBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PushBranchListView.prototype.parseData = function() {
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

    PushBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
      this.push(name.substring(name.indexOf('/') + 1));
      return this.cancel();
    };

    PushBranchListView.prototype.push = function(remoteBranch) {
      var args, startMessage, view;
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pushing...", {
        dismissable: true
      });
      args = ['push'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve();
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

    return PushBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcHVzaC1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUZBQUE7SUFBQTs7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUVqQixhQUFBLEdBQWdCLFNBQUMsSUFBRCxFQUFPLE1BQVA7V0FDZCxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFBLEdBQVMsR0FBekIsQ0FBQSxJQUFrQyxDQUFJLElBQUksQ0FBQyxRQUFMLENBQWMsT0FBZDtFQUR4Qjs7RUFHaEIsTUFBTSxDQUFDLE9BQVAsR0FHUTs7Ozs7OztpQ0FDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUixFQUFlLE9BQWYsRUFBd0IsU0FBeEI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsWUFBRDtNQUNsQyxvREFBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7VUFDcEIsS0FBQyxDQUFBLE9BQUQsR0FBVztpQkFDWCxLQUFDLENBQUEsTUFBRCxHQUFVO1FBRlU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFGSjs7aUNBTVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLElBQUQ7ZUFBVSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7TUFBVixDQUF0QjtNQUNSLFFBQUEsR0FBVyxLQUFLLENBQUMsTUFBTixDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLEtBQUMsQ0FBQSxNQUFyQjtRQUFWO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsU0FBQyxJQUFEO2VBQVU7VUFBQyxJQUFBLEVBQU0sSUFBUDs7TUFBVixDQUF6RDtNQUNYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLFFBQVMsQ0FBQSxDQUFBLENBQXBCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBSEY7O2FBSUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFQUzs7aUNBU1gsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEdBQW9CLENBQW5DLENBQU47YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7O2lDQUlYLElBQUEsR0FBTSxTQUFDLFlBQUQ7QUFDSixVQUFBO01BQUEsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7TUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUEvQjtNQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLFNBQWpCLEVBQTRCLElBQUMsQ0FBQSxNQUE3QixFQUFxQyxZQUFyQyxDQUFrRCxDQUFDLE1BQW5ELENBQTBELFNBQUMsR0FBRDtlQUFTLEdBQUEsS0FBUztNQUFsQixDQUExRDthQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQWQsRUFBZ0Q7UUFBQyxLQUFBLEVBQU8sSUFBUjtPQUFoRCxDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0osS0FBQyxDQUFBLE9BQUQsQ0FBQTtVQUNBLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQTtVQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7aUJBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtRQUpJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUdMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTtpQkFDQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSks7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlA7SUFKSTs7OztLQXBCeUI7QUFYbkMiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuL2JyYW5jaC1saXN0LXZpZXcnXG5cbmlzVmFsaWRCcmFuY2ggPSAoaXRlbSwgcmVtb3RlKSAtPlxuICBpdGVtLnN0YXJ0c1dpdGgocmVtb3RlICsgJy8nKSBhbmQgbm90IGl0ZW0uaW5jbHVkZXMoJy9IRUFEJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIEV4dGVuc2lvbiBvZiBCcmFuY2hMaXN0Vmlld1xuICAjIFRha2VzIHRoZSBuYW1lIG9mIHRoZSByZW1vdGUgdG8gcHVzaCB0b1xuICBjbGFzcyBQdXNoQnJhbmNoTGlzdFZpZXcgZXh0ZW5kcyBCcmFuY2hMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIEByZW1vdGUsIEBleHRyYUFyZ3MpIC0+XG4gICAgICBzdXBlclxuICAgICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEByZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgICBAcmVqZWN0ID0gcmVqZWN0XG5cbiAgICBwYXJzZURhdGE6IC0+XG4gICAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpLm1hcCAoaXRlbSkgLT4gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICBicmFuY2hlcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gaXNWYWxpZEJyYW5jaChpdGVtLCBAcmVtb3RlKSkubWFwIChpdGVtKSAtPiB7bmFtZTogaXRlbX1cbiAgICAgIGlmIGJyYW5jaGVzLmxlbmd0aCBpcyAxXG4gICAgICAgIEBjb25maXJtZWQgYnJhbmNoZXNbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQHNldEl0ZW1zIGJyYW5jaGVzXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gICAgY29uZmlybWVkOiAoe25hbWV9KSAtPlxuICAgICAgQHB1c2ggbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcvJykgKyAxKVxuICAgICAgQGNhbmNlbCgpXG5cbiAgICBwdXNoOiAocmVtb3RlQnJhbmNoKSAtPlxuICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVzaGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYXJncyA9IFsncHVzaCddLmNvbmNhdChAZXh0cmFBcmdzLCBAcmVtb3RlLCByZW1vdGVCcmFuY2gpLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgQHJlc29sdmUoKVxuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgIyMgU2hvdWxkIEByZXN1bHQgYmUgcmVqZWN0ZWQgZm9yIHRob3NlIGRlcGVuZGluZyBvbiB0aGlzIHZpZXc/XG4gICAgICAgICMgQHJlamVjdCgpXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
