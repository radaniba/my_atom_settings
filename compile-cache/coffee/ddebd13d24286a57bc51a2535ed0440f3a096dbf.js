
/**
 * PHP files namespace management
 */

(function() {
  module.exports = {

    /**
     * Add the good namespace to the given file
     * @param {TextEditor} editor
     */
    createNamespace: function(editor) {
      var autoload, autoloaders, composer, directory, element, elements, index, line, lines, name, namespace, path, proxy, psr, src, text, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      proxy = require('./php-proxy.coffee');
      composer = proxy.composer();
      autoloaders = [];
      if (!composer) {
        return;
      }
      _ref = composer.autoload;
      for (psr in _ref) {
        autoload = _ref[psr];
        for (namespace in autoload) {
          src = autoload[namespace];
          if (namespace.endsWith("\\")) {
            namespace = namespace.substr(0, namespace.length - 1);
          }
          autoloaders[src] = namespace;
        }
      }
      path = editor.getPath();
      _ref1 = atom.project.getDirectories();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        directory = _ref1[_i];
        if (path.indexOf(directory.path) === 0) {
          path = path.substr(directory.path.length + 1);
          break;
        }
      }
      path = path.replace(/\\/g, '/');
      namespace = null;
      for (src in autoloaders) {
        name = autoloaders[src];
        if (path.indexOf(src) === 0) {
          path = path.substr(src.length);
          namespace = name;
          break;
        }
      }
      if (namespace === null) {
        return;
      }
      if (path.indexOf("/") === 0) {
        path = path.substr(1);
      }
      elements = path.split('/');
      index = 1;
      for (_j = 0, _len1 = elements.length; _j < _len1; _j++) {
        element = elements[_j];
        if (element === "" || index === elements.length) {
          continue;
        }
        namespace = namespace === "" ? element : namespace + "\\" + element;
        index++;
      }
      text = editor.getText();
      index = 0;
      lines = text.split('\n');
      for (_k = 0, _len2 = lines.length; _k < _len2; _k++) {
        line = lines[_k];
        line = line.trim();
        if (line.indexOf('namespace ') === 0) {
          editor.setTextInBufferRange([[index, 0], [index + 1, 0]], "namespace " + namespace + ";\n");
          return;
        } else if (line.trim() !== "" && line.trim().indexOf("<?") !== 0) {
          editor.setTextInBufferRange([[index, 0], [index, 0]], "namespace " + namespace + ";\n\n");
          return;
        }
        index += 1;
      }
      return editor.setTextInBufferRange([[2, 0], [2, 0]], "namespace " + namespace + ";\n\n");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL25hbWVzcGFjZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFSTtBQUFBO0FBQUE7OztPQUFBO0FBQUEsSUFJQSxlQUFBLEVBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2IsVUFBQSw0S0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxvQkFBUixDQUFSLENBQUE7QUFBQSxNQUVBLFFBQUEsR0FBYyxLQUFLLENBQUMsUUFBTixDQUFBLENBRmQsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUtBLE1BQUEsSUFBRyxDQUFBLFFBQUg7QUFDSSxjQUFBLENBREo7T0FMQTtBQVNBO0FBQUEsV0FBQSxXQUFBOzZCQUFBO0FBQ0ksYUFBQSxxQkFBQTtvQ0FBQTtBQUNJLFVBQUEsSUFBRyxTQUFTLENBQUMsUUFBVixDQUFtQixJQUFuQixDQUFIO0FBQ0ksWUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsU0FBUyxDQUFDLE1BQVYsR0FBaUIsQ0FBckMsQ0FBWixDQURKO1dBQUE7QUFBQSxVQUdBLFdBQVksQ0FBQSxHQUFBLENBQVosR0FBbUIsU0FIbkIsQ0FESjtBQUFBLFNBREo7QUFBQSxPQVRBO0FBQUEsTUFpQkEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FqQlAsQ0FBQTtBQWtCQTtBQUFBLFdBQUEsNENBQUE7OEJBQUE7QUFDSSxRQUFBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFTLENBQUMsSUFBdkIsQ0FBQSxLQUFnQyxDQUFuQztBQUNJLFVBQUEsSUFB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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/namespace.coffee
