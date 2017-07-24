(function() {
  var $$, ListView, OutputViewManager, SelectListView, fs, git, notifier, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs-plus');

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data, args) {
      this.repo = repo;
      this.data = data;
      this.args = args != null ? args : [];
      ListView.__super__.initialize.apply(this, arguments);
      this.show();
      return this.parseData();
    };

    ListView.prototype.parseData = function() {
      var branches, item, items, _i, _len;
      items = this.data.split("\n");
      branches = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
      this.setItems(branches);
      return this.focusFilterEditor();
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(_arg) {
      var current, name;
      name = _arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('Current');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.merge(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.merge = function(branch) {
      var mergeArg;
      mergeArg = ['merge'].concat(this.args).concat([branch]);
      return git.cmd(mergeArg, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          OutputViewManager.create().setContent(data).finish();
          atom.workspace.getTextEditors().forEach(function(editor) {
            return fs.exists(editor.getPath(), function(exist) {
              if (!exist) {
                return editor.destroy();
              }
            });
          });
          return git.refresh(_this.repo);
        };
      })(this))["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvbWVyZ2UtbGlzdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3RUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBREwsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUpYLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVCQUFBLFVBQUEsR0FBWSxTQUFFLElBQUYsRUFBUyxJQUFULEVBQWdCLElBQWhCLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSxNQUR5QixJQUFDLENBQUEsc0JBQUEsT0FBSyxFQUMvQixDQUFBO0FBQUEsTUFBQSwwQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBSFU7SUFBQSxDQUFaLENBQUE7O0FBQUEsdUJBS0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsK0JBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxD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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/lib/views/merge-list-view.coffee
