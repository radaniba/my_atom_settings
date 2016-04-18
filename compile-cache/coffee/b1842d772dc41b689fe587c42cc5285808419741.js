
/*
  lib/main.coffee
 */

(function() {
  var MarkdownScrlSync, SubAtom, log, mix,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, main:'].concat(args));
  };

  SubAtom = require('sub-atom');

  MarkdownScrlSync = (function() {
    function MarkdownScrlSync() {}

    MarkdownScrlSync.prototype.activate = function(state) {
      var MarkdownPreviewView, TextEditor, pathUtil, prvwPkg, viewPath;
      pathUtil = require('path');
      TextEditor = require('atom').TextEditor;
      this.subs = new SubAtom;
      if (!(prvwPkg = atom.packages.getLoadedPackage('markdown-preview')) && !(prvwPkg = atom.packages.getLoadedPackage('markdown-preview-plus'))) {
        log('markdown preview package not found');
        return;
      }
      viewPath = pathUtil.join(prvwPkg.path, 'lib/markdown-preview-view');
      MarkdownPreviewView = require(viewPath);
      return this.subs.add(atom.workspace.observeActivePaneItem((function(_this) {
        return function(editor) {
          var isMarkdown, previewView, _i, _len, _ref;
          isMarkdown = function(editor) {
            var fext, fpath, name, path, _i, _len, _ref, _ref1, _ref2;
            _ref = ["GitHub Markdown", "CoffeeScript (Literate)"];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              name = _ref[_i];
              if (((_ref1 = editor.getGrammar()) != null ? _ref1.name : void 0) === name) {
                return true;
              }
            }
            if ((path = editor.getPath())) {
              _ref2 = path.split('.'), fpath = _ref2[0], fext = _ref2[_ref2.length - 1];
              if (fext.toLowerCase() === 'md') {
                return true;
              }
            }
            return false;
          };
          if (editor instanceof TextEditor && editor.alive && isMarkdown(editor)) {
            _this.stopTracking();
            _ref = atom.workspace.getPaneItems();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              previewView = _ref[_i];
              if (previewView instanceof MarkdownPreviewView && previewView.editor === editor) {
                _this.startTracking(editor, previewView);
                break;
              }
            }
            return null;
          }
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.startTracking = function(editor, previewView) {
      this.editor = editor;
      this.editorView = atom.views.getView(this.editor);
      this.previewEle = previewView.element;
      this.chrHgt = this.editor.getLineHeightInPixels();
      this.lastScrnRow = null;
      this.lastChrOfs = 0;
      this.setMap();
      this.chkScroll('init');
      this.subs2 = new SubAtom;
      this.subs2.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          _this.setMap();
          return _this.chkScroll('changed');
        };
      })(this)));
      this.subs2.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.chkScroll('cursorMoved');
        };
      })(this)));
      this.subs2.add(this.editorView.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.chkScroll('newtop');
        };
      })(this)));
      return this.subs2.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.stopTracking();
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.stopTracking = function() {
      if (this.subs2) {
        this.subs2.dispose();
      }
      return this.subs2 = null;
    };

    MarkdownScrlSync.prototype.deactivate = function() {
      this.stopTracking();
      return this.subs.dispose();
    };

    return MarkdownScrlSync;

  })();

  mix = function(mixinName) {
    var key, mixin, _i, _len, _ref, _results;
    mixin = require('./' + mixinName);
    _ref = Object.keys(mixin);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _results.push(MarkdownScrlSync.prototype[key] = mixin[key]);
    }
    return _results;
  };

  mix('map');

  mix('scroll');

  mix('utils');

  module.exports = new MarkdownScrlSync;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1zY3JvbGwtc3luYy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsbUNBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixRQUFBLElBQUE7QUFBQSxJQURLLDhEQUNMLENBQUE7V0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQyx3QkFBRCxDQUEwQixDQUFDLE1BQTNCLENBQWtDLElBQWxDLENBQTNCLEVBREk7RUFBQSxDQUpOLENBQUE7O0FBQUEsRUFPQSxPQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FQWCxDQUFBOztBQUFBLEVBU007a0NBRUo7O0FBQUEsK0JBQUEsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSw0REFBQTtBQUFBLE1BQUEsUUFBQSxHQUFlLE9BQUEsQ0FBUSxNQUFSLENBQWYsQ0FBQTtBQUFBLE1BQ0MsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBREQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUQsR0FBZSxHQUFBLENBQUEsT0FGZixDQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsQ0FBSyxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixrQkFBL0IsQ0FBWCxDQUFKLElBQ0EsQ0FBQSxDQUFLLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLHVCQUEvQixDQUFYLENBRFA7QUFFRSxRQUFBLEdBQUEsQ0FBSSxvQ0FBSixDQUFBLENBQUE7QUFDQSxjQUFBLENBSEY7T0FKQTtBQUFBLE1BU0EsUUFBQSxHQUFXLFFBQVEs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

//# sourceURL=/Users/Rad/.atom/packages/markdown-scroll-sync/lib/main.coffee
