(function() {
  var CompositeDisposable, HtmlPreviewView, url;

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  HtmlPreviewView = require('./atom-html-preview-view');

  module.exports = {
    config: {
      triggerOnSave: {
        type: 'boolean',
        description: 'Watch will trigger on save.',
        "default": false
      }
    },
    htmlPreviewView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-html-preview:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, _ref;
        try {
          _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        } catch (_error) {
          error = _error;
          return;
        }
        if (protocol !== 'html-preview:') {
          return;
        }
        try {
          if (pathname) {
            pathname = decodeURI(pathname);
          }
        } catch (_error) {
          error = _error;
          return;
        }
        if (host === 'editor') {
          return new HtmlPreviewView({
            editorId: pathname.substring(1)
          });
        } else {
          return new HtmlPreviewView({
            filePath: pathname
          });
        }
      });
    },
    toggle: function() {
      var editor, previewPane, previousActivePane, uri;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      uri = "html-preview://editor/" + editor.id;
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return;
      }
      previousActivePane = atom.workspace.getActivePane();
      return atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).done(function(htmlPreviewView) {
        if (htmlPreviewView instanceof HtmlPreviewView) {
          htmlPreviewView.renderHTML();
          return previousActivePane.activate();
        }
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);
