(function() {
  var CompositeDisposable, ToolBarButtonView, View, isObject,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('space-pen').View;

  isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  module.exports = ToolBarButtonView = (function(_super) {
    var _executeCallback, _getCallbackModifier, _getPrevFocusedElm, _getTooltipPlacement, _prevFocusedElm, _restoreFocus, _storeFocusedElement;

    __extends(ToolBarButtonView, _super);

    function ToolBarButtonView() {
      return ToolBarButtonView.__super__.constructor.apply(this, arguments);
    }

    ToolBarButtonView.content = function() {
      return this.button({
        "class": 'btn btn-default tool-bar-btn'
      });
    };

    ToolBarButtonView.prototype.initialize = function(options) {
      this.subscriptions = new CompositeDisposable;
      this.priority = options.priority;
      if (options.tooltip) {
        this.prop('title', options.tooltip);
        this.subscriptions.add(atom.tooltips.add(this, {
          title: options.tooltip,
          placement: _getTooltipPlacement
        }));
      }
      if (options.iconset) {
        this.addClass("" + options.iconset + " " + options.iconset + "-" + options.icon);
      } else {
        this.addClass("icon-" + options.icon);
      }
      this.on('click', (function(_this) {
        return function(e) {
          _restoreFocus();
          if (!_this.hasClass('disabled')) {
            return _executeCallback(options, e);
          }
        };
      })(this));
      return this.on('mouseover', function() {
        return _storeFocusedElement();
      });
    };

    ToolBarButtonView.prototype.setEnabled = function(enabled) {
      if (enabled) {
        return this.removeClass('disabled');
      } else {
        return this.addClass('disabled');
      }
    };

    ToolBarButtonView.prototype.destroy = function() {
      this.subscriptions.dispose();
      this.subscriptions = null;
      return this.remove();
    };

    _prevFocusedElm = null;

    _getPrevFocusedElm = function() {
      var prevFocusedElm;
      prevFocusedElm = atom.views.getView(atom.workspace);
      if (prevFocusedElm.contains(_prevFocusedElm)) {
        prevFocusedElm = _prevFocusedElm;
      }
      return prevFocusedElm;
    };

    _restoreFocus = function() {
      return _getPrevFocusedElm().focus();
    };

    _storeFocusedElement = function() {
      if (!document.activeElement.classList.contains('tool-bar-btn')) {
        return _prevFocusedElm = document.activeElement;
      }
    };

    _getTooltipPlacement = function() {
      var toolbarPosition;
      toolbarPosition = atom.config.get('tool-bar.position');
      return toolbarPosition === 'Top' && 'bottom' || toolbarPosition === 'Right' && 'left' || toolbarPosition === 'Bottom' && 'top' || toolbarPosition === 'Left' && 'right';
    };

    _executeCallback = function(_arg, e) {
      var callback, data;
      callback = _arg.callback, data = _arg.data;
      if (isObject(callback)) {
        callback = _getCallbackModifier(callback, e);
      }
      switch (typeof callback) {
        case 'string':
          return atom.commands.dispatch(_getPrevFocusedElm(), callback);
        case 'function':
          return callback(data, _getPrevFocusedElm());
      }
    };

    _getCallbackModifier = function(callback, _arg) {
      var altKey, ctrlKey, modifier, shiftKey;
      altKey = _arg.altKey, ctrlKey = _arg.ctrlKey, shiftKey = _arg.shiftKey;
      if (!(ctrlKey || altKey || shiftKey)) {
        return callback[''];
      }
      modifier = Object.keys(callback).filter(Boolean).map(function(modifiers) {
        return modifiers.toLowerCase();
      }).reverse().find(function(item) {
        if ((~item.indexOf('alt') && !altKey) || (altKey && !~item.indexOf('alt'))) {
          return false;
        }
        if ((~item.indexOf('ctrl') && !ctrlKey) || (ctrlKey && !~item.indexOf('ctrl'))) {
          return false;
        }
        if ((~item.indexOf('shift') && !shiftKey) || (shiftKey && !~item.indexOf('shift'))) {
          return false;
        }
        return true;
      });
      return callback[modifier] || callback[''];
    };

    return ToolBarButtonView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90b29sLWJhci9saWIvdG9vbC1iYXItYnV0dG9uLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLFdBQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsU0FBQyxHQUFELEdBQUE7V0FBUyxNQUFNLENBQUEsU0FBRSxDQUFBLFFBQVEsQ0FBQyxJQUFqQixDQUFzQixHQUF0QixDQUFBLEtBQThCLGtCQUF2QztFQUFBLENBSFgsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLFFBQUEsc0lBQUE7O0FBQUEsd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLFFBQUEsT0FBQSxFQUFPLDhCQUFQO09BQVIsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSxnQ0FHQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUMsUUFGcEIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxPQUFOLEVBQWUsT0FBTyxDQUFDLE9BQXZCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUks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

//# sourceURL=/Users/Rad/.atom/packages/tool-bar/lib/tool-bar-button-view.coffee
