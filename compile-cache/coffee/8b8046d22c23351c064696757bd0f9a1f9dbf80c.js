(function() {
  var CompositeDisposable, Emitter, ToolBarView, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  View = require('space-pen').View;

  _ = require('underscore-plus');

  module.exports = ToolBarView = (function(_super) {
    __extends(ToolBarView, _super);

    function ToolBarView() {
      this.drawGutter = __bind(this.drawGutter, this);
      return ToolBarView.__super__.constructor.apply(this, arguments);
    }

    ToolBarView.content = function() {
      return this.div({
        "class": 'tool-bar'
      });
    };

    ToolBarView.prototype.addItem = function(newItem) {
      var existingItem, index, newElement, nextElement, nextItem, _i, _len, _ref1, _ref2, _ref3;
      if (newItem.priority == null) {
        newItem.priority = (_ref1 = (_ref2 = this.items[this.items.length - 1]) != null ? _ref2.priority : void 0) != null ? _ref1 : 50;
      }
      nextItem = null;
      _ref3 = this.items;
      for (index = _i = 0, _len = _ref3.length; _i < _len; index = ++_i) {
        existingItem = _ref3[index];
        if (existingItem.priority > newItem.priority) {
          nextItem = existingItem;
          break;
        }
      }
      this.items.splice(index, 0, newItem);
      newElement = atom.views.getView(newItem);
      nextElement = atom.views.getView(nextItem);
      this.element.insertBefore(newElement, nextElement);
      this.drawGutter();
      return nextItem;
    };

    ToolBarView.prototype.removeItem = function(item) {
      item.destroy();
      this.items.splice(this.items.indexOf(item), 1);
      return this.drawGutter();
    };

    ToolBarView.prototype.initialize = function() {
      this.items = [];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', 'tool-bar:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'tool-bar:position-top', (function(_this) {
        return function() {
          _this.updatePosition('Top');
          return atom.config.set('tool-bar.position', 'Top');
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'tool-bar:position-right', (function(_this) {
        return function() {
          _this.updatePosition('Right');
          return atom.config.set('tool-bar.position', 'Right');
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'tool-bar:position-bottom', (function(_this) {
        return function() {
          _this.updatePosition('Bottom');
          return atom.config.set('tool-bar.position', 'Bottom');
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'tool-bar:position-left', (function(_this) {
        return function() {
          _this.updatePosition('Left');
          return atom.config.set('tool-bar.position', 'Left');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('tool-bar.iconSize', (function(_this) {
        return function(newValue) {
          return _this.updateSize(newValue);
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('tool-bar.position', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          if (atom.config.get('tool-bar.visible')) {
            return _this.show();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('tool-bar.visible', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          if (newValue) {
            return _this.show();
          } else {
            return _this.hide();
          }
        };
      })(this)));
      if (atom.config.get('tool-bar.visible')) {
        this.show();
      }
      this.on('scroll', this.drawGutter);
      return window.addEventListener('resize', this.drawGutter);
    };

    ToolBarView.prototype.serialize = function() {};

    ToolBarView.prototype.destroy = function() {
      var item, _i, _len, _ref1;
      _ref1 = this.items;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        item = _ref1[_i];
        item.destroy();
      }
      this.items = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.hide();
      this.remove();
      window.removeEventListener('resize', this.drawGutter);
      this.emitter.emit('did-destroy');
      this.emitter.dispose();
      return this.emitter = null;
    };

    ToolBarView.prototype.updateSize = function(size) {
      this.removeClass('tool-bar-12px tool-bar-16px tool-bar-24px tool-bar-32px');
      return this.addClass("tool-bar-" + size);
    };

    ToolBarView.prototype.updatePosition = function(position) {
      this.removeClass('tool-bar-top tool-bar-right tool-bar-bottom tool-bar-left tool-bar-horizontal tool-bar-vertical');
      switch (position) {
        case 'Top':
          this.panel = atom.workspace.addTopPanel({
            item: this
          });
          break;
        case 'Right':
          this.panel = atom.workspace.addRightPanel({
            item: this
          });
          break;
        case 'Bottom':
          this.panel = atom.workspace.addBottomPanel({
            item: this
          });
          break;
        case 'Left':
          this.panel = atom.workspace.addLeftPanel({
            item: this,
            priority: 50
          });
      }
      this.addClass("tool-bar-" + (position.toLowerCase()));
      if (position === 'Top' || position === 'Bottom') {
        this.addClass('tool-bar-horizontal');
      } else {
        this.addClass('tool-bar-vertical');
      }
      this.updateMenu(position);
      return this.drawGutter();
    };

    ToolBarView.prototype.updateMenu = function(position) {
      var packagesMenu, positionMenu, positionsMenu, toolBarMenu;
      packagesMenu = _.find(atom.menu.template, function(_arg) {
        var label;
        label = _arg.label;
        return label === 'Packages' || label === '&Packages';
      });
      if (packagesMenu) {
        toolBarMenu = _.find(packagesMenu.submenu, function(_arg) {
          var label;
          label = _arg.label;
          return label === 'Tool Bar' || label === '&Tool Bar';
        });
      }
      if (toolBarMenu) {
        positionsMenu = _.find(toolBarMenu.submenu, function(_arg) {
          var label;
          label = _arg.label;
          return label === 'Position' || label === '&Position';
        });
      }
      if (positionsMenu) {
        positionMenu = _.find(positionsMenu.submenu, function(_arg) {
          var label;
          label = _arg.label;
          return label === position;
        });
      }
      return positionMenu != null ? positionMenu.checked = true : void 0;
    };

    ToolBarView.prototype.drawGutter = function() {
      var hiddenHeight, scrollHeight, visibleHeight;
      this.removeClass('gutter-top gutter-bottom');
      visibleHeight = this.height();
      scrollHeight = this.element.scrollHeight;
      hiddenHeight = scrollHeight - visibleHeight;
      if (visibleHeight < scrollHeight) {
        if (this.scrollTop() > 0) {
          this.addClass('gutter-top');
        }
        if (this.scrollTop() < hiddenHeight) {
          return this.addClass('gutter-bottom');
        }
      }
    };

    ToolBarView.prototype.hide = function() {
      if (this.panel != null) {
        this.detach();
      }
      if (this.panel != null) {
        this.panel.destroy();
      }
      return this.panel = null;
    };

    ToolBarView.prototype.show = function() {
      this.hide();
      this.updatePosition(atom.config.get('tool-bar.position'));
      return this.updateSize(atom.config.get('tool-bar.iconSize'));
    };

    ToolBarView.prototype.toggle = function() {
      if (this.hasParent()) {
        this.hide();
        return atom.config.set('tool-bar.visible', false);
      } else {
        this.show();
        return atom.config.set('tool-bar.visible', true);
      }
    };

    return ToolBarView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90b29sLWJhci9saWIvdG9vbC1iYXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0RBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGVBQUEsT0FBdEIsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLFdBQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGtDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxVQUFQO09BQUwsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSwwQkFHQSxPQUFBLEdBQVMsU0FBQyxPQUFELEdBQUE7QUFDUCxVQUFBLHFGQUFBOztRQUFBLE9BQU8sQ0FBQyxxSEFBa0Q7T0FBMUQ7QUFBQSxNQUNBLFFBQUEsR0FBVyxJQURYLENBQUE7QUFFQTtBQUFBLFdBQUEsNERBQUE7b0NBQUE7QUFDRSxRQUFBLElBQUcsWUFBWSxDQUFDLFFBQWIsR0FBd0IsT0FBTyxDQUFDLFFBQW5DO0FBQ0UsVUFBQSxRQUFBLEdBQVcsWUFBWCxDQUFBO0FBQ0EsZ0JBRkY7U0FERjtBQUFBLE9BRkE7QUFBQSxNQU1BLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLEtBQWQsRUFBcUIsQ0FBckIsRUFBd0IsT0FBeEIsQ0FOQSxDQUFBO0FBQUEsTUFPQSxVQUFBLEdBQWEsSUFBSSxDQUFD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

//# sourceURL=/Users/Rad/.atom/packages/tool-bar/lib/tool-bar-view.coffee
