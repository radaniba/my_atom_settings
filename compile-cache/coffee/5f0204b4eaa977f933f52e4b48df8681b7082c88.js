(function() {
  var Builder, JekyllNewPostView, Server, Utils, fs, path;

  fs = require('fs-plus');

  path = require('path');

  Utils = require('./utils');

  JekyllNewPostView = require('./new-post-view');

  Builder = require('../server/build');

  Server = require('../server/server');

  module.exports = {
    jekyllNewPostView: null,
    createNewPostView: function() {
      return this.jekyllNewPostView = new JekyllNewPostView();
    },
    showError: function(message) {
      return console.log(message);
    },
    openLayout: function(conf) {
      var activeEditor, contents, error, layout;
      activeEditor = atom.workspace.getActiveTextEditor();
      contents = activeEditor.getText();
      try {
        layout = Utils.scan(contents, /layout: (.*?)[\r\n|\n\r|\r|\n]/g)[0][0];
        return fs.readdir(path.join(atom.project.getPaths()[0], conf.layouts_dir), function(err, files) {
          var file, fileName, parts, _i, _len;
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            parts = file.split(".");
            if (parts[0] === layout) {
              fileName = file;
            }
          }
          return atom.workspace.open(path.join(conf.layouts_dir, fileName));
        });
      } catch (_error) {
        error = _error;
        return this.showError(error.message);
      }
    },
    openInclude: function(config) {
      var activeEditor, buffer, error, include, line;
      activeEditor = atom.workspace.getActiveTextEditor();
      buffer = activeEditor.getBuffer();
      line = buffer.lines[activeEditor.getCursorBufferPosition().row];
      try {
        include = Utils.scan(line, /{% include (.*?)%}/g)[0][0].split(" ")[0];
        return atom.workspace.open(path.join(config.includes_dir, include));
      } catch (_error) {
        error = _error;
        return this.showError(error.message);
      }
    },
    openConfig: function() {
      return atom.workspace.open("_config.yml");
    },
    openData: function(config) {
      var activeEditor, buffer, data, error, line;
      activeEditor = atom.workspace.getActiveTextEditor();
      buffer = activeEditor.getBuffer();
      line = buffer.lines[activeEditor.getCursorBufferPosition().row];
      try {
        data = Utils.scan(line, /site\.data\.(.*?) /g)[0][0].split(" ")[0];
        return atom.workspace.open(path.join(config.data_dir, data) + ".yml");
      } catch (_error) {
        error = _error;
        return this.showError(error.message);
      }
    },
    toggleServer: function() {
      return Server.toggle();
    },
    newPost: function(config) {
      if (!this.jekyllNewPostView) {
        this.createNewPostView();
      }
      this.jekyllNewPostView.attach();
      return this.jekyllNewPostView.miniEditor.focus();
    },
    buildSite: function(config) {
      return Builder.build();
    },
    publishDraft: function() {
      var activeEditor, contents, currentFileName, currentFilePath, newContents, newFileName, newFilePath, _ref, _ref1;
      activeEditor = atom.workspace.getActiveTextEditor();
      activeEditor.save();
      currentFilePath = activeEditor != null ? (_ref = activeEditor.buffer) != null ? (_ref1 = _ref.file) != null ? _ref1.path : void 0 : void 0 : void 0;
      currentFileName = currentFilePath.split(path.sep).reverse()[0];
      newFileName = Utils.generateFileName(Utils.getPostTitle(activeEditor));
      newFilePath = path.join(atom.project.getPaths()[0], '_posts', newFileName + '.markdown');
      contents = activeEditor.getText();
      newContents = contents.replace(/date: "[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}.*?"/, "date: \"" + (Utils.generateDateString(new Date, true)) + "\"");
      fs.writeFileSync(newFilePath, newContents);
      fs.unlinkSync(currentFilePath);
      atom.workspace.open(newFilePath);
      return activeEditor.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL2pla3lsbC9qZWt5bGwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1EQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FIUixDQUFBOztBQUFBLEVBS0EsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLGlCQUFSLENBTHBCLENBQUE7O0FBQUEsRUFPQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGlCQUFSLENBUFYsQ0FBQTs7QUFBQSxFQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FSVCxDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsaUJBQUEsRUFBbUIsSUFBbkI7QUFBQSxJQUVBLGlCQUFBLEVBQW1CLFNBQUEsR0FBQTthQUNqQixJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUFBLEVBRFI7SUFBQSxDQUZuQjtBQUFBLElBS0EsU0FBQSxFQUFXLFNBQUMsT0FBRCxHQUFBO2FBQ1QsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBRFM7SUFBQSxDQUxYO0FBQUEsSUFRQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFDVixVQUFBLHFDQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWYsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLFlBQVksQ0FBQyxPQUFiLENBQUEsQ0FEWCxDQUFBO0FBR0E7QUFDRSxRQUFBLE1BQUEsR0FBUyxLQUFLLENBQUMsSUFB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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/jekyll/jekyll.coffee
