(function() {
  var CompositeDisposable, TidyMarkdown, tidyMarkdownFn;

  CompositeDisposable = require('atom').CompositeDisposable;

  tidyMarkdownFn = require('tidy-markdown');

  TidyMarkdown = (function() {
    function TidyMarkdown() {
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'tidy-markdown:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this)
      }));
    }

    TidyMarkdown.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    TidyMarkdown.prototype.handleEvents = function(editor) {
      var buffer, bufferDestroyedSubscription, bufferSavedSubscription, editorDestroyedSubscription;
      buffer = editor.getBuffer();
      bufferSavedSubscription = buffer.onWillSave((function(_this) {
        return function() {
          return buffer.transact(function() {
            if (atom.config.get('tidy-markdown.runOnSave')) {
              return _this.run(editor, editor.getGrammar().scopeName);
            }
          });
        };
      })(this));
      editorDestroyedSubscription = editor.onDidDestroy(function() {
        bufferSavedSubscription.dispose();
        return editorDestroyedSubscription.dispose();
      });
      bufferDestroyedSubscription = buffer.onDidDestroy(function() {
        bufferDestroyedSubscription.dispose();
        return bufferSavedSubscription.dispose();
      });
      this.subscriptions.add(bufferSavedSubscription);
      this.subscriptions.add(editorDestroyedSubscription);
      return this.subscriptions.add(bufferDestroyedSubscription);
    };

    TidyMarkdown.prototype.run = function() {
      var buffer, editor, fixedText, text;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getGrammar().scopeName !== 'source.gfm') {
        return;
      }
      buffer = editor.getBuffer();
      text = buffer.getText();
      fixedText = tidyMarkdownFn(text, {
        ensureFirstHeaderIsH1: atom.config.get('tidy-markdown.ensureFirstHeaderIsH1')
      });
      if (text !== fixedText) {
        return buffer.setTextViaDiff(fixedText);
      }
    };

    return TidyMarkdown;

  })();

  module.exports = {
    activate: function() {
      return this.tidyMarkdown = new TidyMarkdown();
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.tidyMarkdown) != null) {
        _ref.destroy();
      }
      return this.tidyMarkdown = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGVBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUdNO0FBQ1MsSUFBQSxzQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNuRCxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFEbUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQixDQURBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2pCO0FBQUEsUUFBQSxtQkFBQSxFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsR0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtPQURpQixDQUFuQixDQUpBLENBRFc7SUFBQSxDQUFiOztBQUFBLDJCQVFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURP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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/lib/index.coffee
