(function() {
  var $, WatchSidebar, WatchView, WatchesPicker, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('atom-space-pen-views').$;

  _ = require('lodash');

  WatchView = require('./watch-view');

  WatchesPicker = require('./watches-picker');

  module.exports = WatchSidebar = (function() {
    function WatchSidebar(kernel, grammar) {
      var KernelManager, languageDisplay, title;
      this.kernel = kernel;
      this.grammar = grammar;
      this.resizeSidebar = __bind(this.resizeSidebar, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      KernelManager = require('./kernel-manager');
      this.language = KernelManager.getTrueLanguage(this.grammar.name);
      this.element = document.createElement('div');
      this.element.classList.add('hydrogen', 'watch-sidebar');
      title = document.createElement('h1');
      title.classList.add('watch-sidebar-title');
      title.innerText = "Hydrogen Watch";
      languageDisplay = document.createElement('h3');
      languageDisplay.classList.add('watch-sidebar-language');
      languageDisplay.innerText = "Kernel: " + this.language;
      languageDisplay.onclick = (function(_this) {
        return function() {
          var editor, editorView;
          editor = atom.workspace.getActiveTextEditor();
          editorView = atom.views.getView(editor);
          return atom.commands.dispatch(editorView, 'hydrogen:select-watch-kernel');
        };
      })(this);
      this.watchesContainer = document.createElement('div');
      _.forEach(this.watchViews, (function(_this) {
        return function(watch) {
          return _this.watchesContainer.appendChild(watch.element);
        };
      })(this));
      this.addButton = document.createElement('button');
      this.addButton.classList.add('add-watch', 'btn', 'btn-primary', 'icon', 'icon-plus', 'inline-block');
      this.addButton.innerText = "Add watch";
      this.addButton.onclick = (function(_this) {
        return function() {
          return _this.addWatch();
        };
      })(this);
      this.resizeHandle = document.createElement('div');
      this.resizeHandle.classList.add('watch-resize-handle');
      $(this.resizeHandle).on('mousedown', this.resizeStarted);
      this.element.appendChild(title);
      this.element.appendChild(languageDisplay);
      this.element.appendChild(this.watchesContainer);
      this.element.appendChild(this.addButton);
      this.element.appendChild(this.resizeHandle);
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
        watch = new WatchView(this.kernel, this.grammar);
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
      if (!(watchText = atom.workspace.getActiveTextEditor().getSelectedText())) {
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
        return _.forEach(this.watchViews, (function(_this) {
          return function(watchView) {
            return watchView.run();
          };
        })(this));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd2F0Y2gtc2lkZWJhci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNENBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLHNCQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQUhaLENBQUE7O0FBQUEsRUFJQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUpoQixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNXLElBQUEsc0JBQUUsTUFBRixFQUFXLE9BQVgsR0FBQTtBQUNULFVBQUEscUNBQUE7QUFBQSxNQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtBQUFBLE1BRG1CLElBQUMsQ0FBQSxVQUFBLE9BQ3BCLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBQWhCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksYUFBYSxDQUFDLGVBQWQsQ0FBOEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUF2QyxDQURaLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FIWCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixFQUFtQyxlQUFuQyxDQUpBLENBQUE7QUFBQSxNQU1BLEtBQUEsR0FBUSxRQUFRLENB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/watch-sidebar.coffee
