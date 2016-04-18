(function() {
  var CompositeDisposable, NbviewerView, url;

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  NbviewerView = require('./nbviewer-view');

  module.exports = {
    config: {
      jupyterConvertBin: {
        type: 'string',
        "default": 'jupyter-nbconvert',
        description: 'Command or path to jupyter-convert executable'
      }
    },
    nbviewerView: null,
    subscriptions: null,
    activate: function(state) {
      var previewFile;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'nbviewer:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      previewFile = this.previewFile.bind(this);
      atom.commands.add('.tree-view .file .name[data-name$=\\.ipynb]', 'nbviewer:preview-file', previewFile);
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, _ref;
        try {
          _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        } catch (_error) {
          error = _error;
          console.log(error);
          return;
        }
        if (protocol !== 'nbviewer-preview:') {
          return;
        }
        try {
          if (pathname) {
            pathname = decodeURI(pathname);
          }
        } catch (_error) {
          error = _error;
          console.log(error);
          return;
        }
        if (host === 'editor') {
          return new NbviewerView({
            editorId: pathname.substring(1)
          });
        } else {
          return new NbviewerView({
            filePath: pathname
          });
        }
      });
    },
    previewFile: function(_arg) {
      var editor, filePath, target, _i, _len, _ref;
      target = _arg.target;
      filePath = target.dataset.path;
      if (!filePath) {
        return;
      }
      _ref = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("nbviewer-preview://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    },
    toggle: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    uriForEditor: function(editor) {
      return "nbviewer-preview://editor/" + editor.id;
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true,
        split: 'right'
      };
      return atom.workspace.open(uri, options).then(function(nbviewerView) {
        if (nbviewerView instanceof NbviewerView) {
          return nbviewerView.renderHTML();
        }
      });
    },
    removePreviewForEditor: function(editor) {
      var previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return true;
      } else {
        return false;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9uYnZpZXdlci9saWIvbmJ2aWV3ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUhmLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsbUJBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQURGO0tBREY7QUFBQSxJQU1BLFlBQUEsRUFBYyxJQU5kO0FBQUEsSUFPQSxhQUFBLEVBQWUsSUFQZjtBQUFBLElBU0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBRVIsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSxpQkFBQSxFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtPQUFwQyxDQUFuQixDQUZBLENBQUE7QUFBQSxNQUtBLFdBQUEsR0FBYyxJQUFD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

//# sourceURL=/Users/Rad/.atom/packages/nbviewer/lib/nbviewer.coffee
