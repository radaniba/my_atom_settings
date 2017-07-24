(function() {
  var CompositeDisposable, JediProvider;

  CompositeDisposable = require('atom').CompositeDisposable;

  JediProvider = require('./jedi-python3-provider');

  module.exports = {
    subscriptions: null,
    config: {
      Pathtopython: {
        description: 'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)',
        type: 'string',
        "default": 'python3'
      }
    },
    provider: null,
    activate: function() {
      var isPathtopython;
      isPathtopython = atom.config.get('python-jedi.enablePathtopython');
      this.provider = new JediProvider();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'jedi-python3-autocomplete:goto_definitions': (function(_this) {
          return function() {
            return _this.goto_definitions();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getProvider: function() {
      return {
        providers: [this.provider]
      };
    },
    goto_definitions: function() {
      var column, editor, path, row, source, title;
      if (editor = atom.workspace.getActiveTextEditor()) {
        title = editor.getTitle().slice(-2);
        if (title === 'py') {
          source = editor.getText();
          row = editor.getCursorBufferPosition().row + 1;
          column = editor.getCursorBufferPosition().column + 1;
          path = editor.getPath();
          return this.provider.goto_def(source, row, column, path);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24tamVkaS9saWIvamVkaS1weXRob24zLWF1dG9jb21wbGV0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVIsQ0FGZixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxJQUVBLE1BQUEsRUFDRTtBQUFBLE1BQUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQVksNEdBQVo7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsU0FGVDtPQURGO0tBSEY7QUFBQSxJQVFBLFFBQUEsRUFBVSxJQVJWO0FBQUEsSUFVQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxjQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxZQUFBLENBQUEsQ0FEaEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO2FBR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7QUFBQSxRQUFBLDRDQUFBLEVBQThDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QztPQURpQixDQUFuQixFQUpRO0lBQUEsQ0FWVjtBQUFBLElBaUJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURTO0lBQUEsQ0FqQlo7QUFBQSxJQW9CQSxXQUFBLEVBQWEsU0FBQSxHQUFBO0FBQ1gsYUFBTztBQUFBLFFBQUMsU0FBQSxFQUFXLENBQUMsSUFBQyxDQUFBLFFBQUYsQ0FBWjtPQUFQLENBRFc7SUFBQSxDQXBCYjtBQUFBLElBdUJBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNmLFVBQUEsd0NBQUE7QUFBQSxNQUFBLElBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFaO0FBQ0UsUUFBQSxLQUFBLEdBQVMsTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFpQixDQUFDLEtBQWxCLENBQXdCLENBQUEsQ0FBeEIsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO0FBQ0UsVUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFULENBQUE7QUFBQSxVQUNBLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFnQyxDQUFDLEdBQWpDLEdBQXVDLENBRDdDLENBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFnQyxDQUFDLE1BQWpDLEdBQTBDLENBRm5ELENBQUE7QUFBQSxVQUdBLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBSFAsQ0FBQTtpQkFJQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsTUFBbkIsRUFBMkIsR0FBM0IsRUFBZ0MsTUFBaEMsRUFBd0MsSUFBeEMsRUFMRjtTQUZGO09BRGU7SUFBQSxDQXZCbEI7R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/python-jedi/lib/jedi-python3-autocomplete.coffee
