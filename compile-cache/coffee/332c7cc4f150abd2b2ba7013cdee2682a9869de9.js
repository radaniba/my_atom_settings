(function() {
  var CompositeDisposable, tidyMarkdown;

  CompositeDisposable = require('atom').CompositeDisposable;

  tidyMarkdown = require('tidy-markdown');

  module.exports = {
    subscriptions: null,
    config: {
      runOnSave: {
        type: 'boolean',
        "default": true
      },
      ensureFirstHeaderIsH1: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'tidy-markdown:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this)
      }));
    },
    destroy: function() {
      return this.subscriptions.dispose();
    },
    handleEvents: function(editor) {
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
    },
    run: function() {
      var buffer, editor, fixedText, text;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getGrammar().scopeName !== 'source.gfm') {
        return;
      }
      buffer = editor.getBuffer();
      text = buffer.getText();
      fixedText = tidyMarkdown(text, {
        ensureFirstHeaderIsH1: atom.config.get('tidy-markdown.ensureFirstHeaderIsH1')
      });
      if (text !== fixedText) {
        return buffer.setTextViaDiff(fixedText);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsZUFBUixDQURmLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxhQUFBLEVBQWUsSUFBZjtBQUFBLElBRUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQURGO0FBQUEsTUFHQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FKRjtLQUhGO0FBQUEsSUFVQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNuRCxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFEbUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQixDQURBLENBQUE7YUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtBQUFBLFFBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/lib/index.coffee
