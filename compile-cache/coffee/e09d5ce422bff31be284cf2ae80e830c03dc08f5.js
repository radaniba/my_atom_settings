(function() {
  var $, CompositeDisposable, WatchSidebar, WatchView, WatchesPicker, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('atom-space-pen-views').$;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('lodash');

  WatchView = require('./watch-view');

  WatchesPicker = require('./watches-picker');

  module.exports = WatchSidebar = (function() {
    function WatchSidebar(kernel) {
      var addButton, commands, languageDisplay, removeButton, resizeHandle, toggleButton, toolbar, tooltips;
      this.kernel = kernel;
      this.resizeSidebar = __bind(this.resizeSidebar, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen', 'watch-sidebar');
      toolbar = document.createElement('div');
      toolbar.classList.add('toolbar', 'block');
      languageDisplay = document.createElement('div');
      languageDisplay.classList.add('language', 'icon', 'icon-eye');
      languageDisplay.innerText = this.kernel.kernelSpec.display_name;
      commands = document.createElement('div');
      commands.classList.add('btn-group');
      removeButton = document.createElement('button');
      removeButton.classList.add('btn', 'icon', 'icon-trashcan');
      removeButton.onclick = (function(_this) {
        return function() {
          return _this.removeWatch();
        };
      })(this);
      toggleButton = document.createElement('button');
      toggleButton.classList.add('btn', 'icon', 'icon-remove-close');
      toggleButton.onclick = function() {
        var editor, editorView;
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
        return atom.commands.dispatch(editorView, 'hydrogen:toggle-watches');
      };
      tooltips = new CompositeDisposable();
      tooltips.add(atom.tooltips.add(toggleButton, {
        title: 'Toggle Watch Sidebar'
      }));
      tooltips.add(atom.tooltips.add(removeButton, {
        title: 'Remove Watch'
      }));
      this.watchesContainer = document.createElement('div');
      _.forEach(this.watchViews, (function(_this) {
        return function(watch) {
          return _this.watchesContainer.appendChild(watch.element);
        };
      })(this));
      addButton = document.createElement('button');
      addButton.classList.add('add-watch', 'btn', 'btn-primary', 'icon', 'icon-plus', 'inline-block');
      addButton.innerText = 'Add watch';
      addButton.onclick = (function(_this) {
        return function() {
          return _this.addWatch();
        };
      })(this);
      resizeHandle = document.createElement('div');
      resizeHandle.classList.add('watch-resize-handle');
      $(resizeHandle).on('mousedown', this.resizeStarted);
      toolbar.appendChild(languageDisplay);
      toolbar.appendChild(commands);
      commands.appendChild(removeButton);
      commands.appendChild(toggleButton);
      this.element.appendChild(toolbar);
      this.element.appendChild(this.watchesContainer);
      this.element.appendChild(addButton);
      this.element.appendChild(resizeHandle);
      this.kernel.addWatchCallback((function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
      this.watchViews = [];
      this.addWatch();
      this.hide();
      atom.workspace.addRightPanel({
        item: this.element
      });
    }

    WatchSidebar.prototype.createWatch = function() {
      var watch;
      watch = _.last(this.watchViews);
      if (!watch || watch.getCode().replace(/\s/g, '' !== '')) {
        watch = new WatchView(this.kernel);
        this.watchViews.push(watch);
        this.watchesContainer.appendChild(watch.element);
      }
      return watch;
    };

    WatchSidebar.prototype.addWatch = function() {
      return this.createWatch().inputElement.element.focus();
    };

    WatchSidebar.prototype.addWatchFromEditor = function() {
      var watchText;
      watchText = atom.workspace.getActiveTextEditor().getSelectedText();
      if (!watchText) {
        this.addWatch();
      } else {
        this.createWatch().setCode(watchText).run();
      }
      return this.show();
    };

    WatchSidebar.prototype.removeWatch = function() {
      var k, v, watches;
      watches = (function() {
        var _i, _len, _ref, _results;
        _ref = this.watchViews;
        _results = [];
        for (k = _i = 0, _len = _ref.length; _i < _len; k = ++_i) {
          v = _ref[k];
          _results.push({
            name: v.getCode(),
            value: k
          });
        }
        return _results;
      }).call(this);
      WatchesPicker.onConfirmed = (function(_this) {
        return function(item) {
          _this.watchViews[item.value].destroy();
          return _this.watchViews.splice(item.value, 1);
        };
      })(this);
      WatchesPicker.setItems(watches);
      return WatchesPicker.toggle();
    };

    WatchSidebar.prototype.run = function() {
      if (this.visible) {
        return _.forEach(this.watchViews, function(watchView) {
          return watchView.run();
        });
      }
    };

    WatchSidebar.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeSidebar);
      return $(document).on('mouseup', this.resizeStopped);
    };

    WatchSidebar.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeSidebar);
      return $(document).off('mouseup', this.resizeStopped);
    };

    WatchSidebar.prototype.resizeSidebar = function(_arg) {
      var pageX, which, width;
      pageX = _arg.pageX, which = _arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      width = $(document.body).width() - pageX;
      return this.element.style.width = "" + (width - 10) + "px";
    };

    WatchSidebar.prototype.show = function() {
      this.element.classList.remove('hidden');
      return this.visible = true;
    };

    WatchSidebar.prototype.hide = function() {
      this.element.classList.add('hidden');
      return this.visible = false;
    };

    return WatchSidebar;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2gtc2lkZWJhci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUVBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLHNCQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FGSixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTGhCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1csSUFBQSxzQkFBRSxNQUFGLEdBQUE7QUFDVCxVQUFBLGlHQUFBO0FBQUEsTUFEVSxJQUFDLENBQUEsU0FBQSxNQUNYLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixFQUFtQyxlQUFuQyxDQURBLENBQUE7QUFBQSxNQUdBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUhWLENBQUE7QUFBQSxNQUlBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEIsQ0FBc0IsU0FBdEIsRUFBaUMsT0FBakMsQ0FKQSxDQUFBO0FBQUEsTUFNQSxlQUFBLEdBQWtCLFFBQVEsQ0FBQyxh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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watch-sidebar.coffee
