(function() {
  var Builder, StaticServer, path;

  path = require('path');

  Builder = require('./build');

  StaticServer = require('static-server');

  module.exports = {
    server: null,
    disposables: [],
    toggle: function() {
      if (this.server === null) {
        return this.start();
      } else {
        return this.stop();
      }
    },
    start: function() {
      Builder.build();
      this.server = new StaticServer({
        rootPath: path.join(atom.project.getPaths()[0], process.jekyllAtom.config.destination),
        name: 'jekyll-atom',
        port: atom.config.get('jekyll.serverPort'),
        templates: {
          notFound: path.join(atom.project.getPaths()[0], process.jekyllAtom.config.destination, '404.html')
        }
      });
      this.server.start((function(_this) {
        return function() {
          return _this.serverStarted();
        };
      })(this));
      return this.disposables.push(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.didOpenFile(editor);
        };
      })(this)));
    },
    stop: function() {
      var disposable, _i, _len, _ref, _ref1;
      if ((_ref = this.server) != null) {
        _ref.stop();
      }
      this.server = null;
      _ref1 = this.disposables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        disposable = _ref1[_i];
        disposable.dispose();
      }
      return atom.notifications.addInfo('Jekyll server stopped');
    },
    serverStarted: function() {
      var editor, _i, _len, _ref, _results;
      atom.notifications.addSuccess('Jekyll site available at http://localhost:' + atom.config.get('jekyll.serverPort'));
      _ref = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        _results.push(this.didOpenFile(editor));
      }
      return _results;
    },
    didOpenFile: function(editor) {
      return this.disposables.push(editor.buffer.emitter.on('did-save', (function(_this) {
        return function() {
          return _this.didSave();
        };
      })(this)));
    },
    didSave: function() {
      return Builder.build();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL3NlcnZlci9zZXJ2ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUZWLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGVBQVIsQ0FIZixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLElBQVI7QUFBQSxJQUNBLFdBQUEsRUFBYSxFQURiO0FBQUEsSUFHQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQVcsSUFBZDtlQUNFLElBQUMsQ0FBQSxLQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSEY7T0FETTtJQUFBLENBSFI7QUFBQSxJQVVBLEtBQUEsRUFBTyxTQUFBLEdBQUE7QUFDTCxNQUFBLE9BQU8sQ0FBQyxLQUFSLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsWUFBQSxDQUFhO0FBQUEsUUFDekIsUUFBQSxFQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQWhFLENBRGU7QUFBQSxRQUV6QixJQUFBLEVBQU0sYUFGbUI7QUFBQSxRQUd6QixJQUFBLEVBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixDQUhtQjtBQUFBLFFBSXpCLFNBQUEsRUFBVztBQUFBLFVBQ1QsUUFBQSxFQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQWhFLEVBQTZFLFVBQTdFLENBREQ7U0FKYztPQUFiLENBRGQsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLENBVkEsQ0FBQTthQVlBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFBWSxLQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWxCLEVBYks7SUFBQSxDQVZQO0FBQUEsSUF5QkEsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsaUNBQUE7O1lBQU8sQ0FBRSxJQUFULENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQURWLENBQUE7QUFFQTtBQUFBLFdBQUEsNENBQUE7K0JBQUE7QUFDRSxRQUFBLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBQSxDQURGO0FBQUEsT0FGQTthQUtBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsdUJBQTNCLEVBTkk7SUFBQSxDQXpCTjtBQUFBLElBaUNBLGFBQUEsRUFBZSxTQUFBLEdBQUE7QUFDYixVQUFBLGdDQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLDRDQUFBLEdBQStDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBN0UsQ0FBQSxDQUFBO0FBRUE7QUFBQTtXQUFBLDJDQUFBOzBCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQUEsQ0FERjtBQUFBO3NCQUhhO0lBQUEsQ0FqQ2Y7QUFBQSxJQXVDQSxXQUFBLEVBQWEsU0FBQyxNQUFELEdBQUE7YUFDWCxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBdEIsQ0FBeUIsVUFBekIsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxDQUFsQixFQURXO0lBQUEsQ0F2Q2I7QUFBQSxJQTBDQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2FBQ1AsT0FBTyxDQUFDLEtBQVIsQ0FBQSxFQURPO0lBQUEsQ0ExQ1Q7R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/server/server.coffee
