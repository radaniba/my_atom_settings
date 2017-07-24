
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
      var autoload, autoloaders, composer, directory, element, elements, index, line, lines, name, namespace, path, proxy, psr, src, text, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
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
      if (composer["autoload-dev"]) {
        _ref1 = composer["autoload-dev"];
        for (psr in _ref1) {
          autoload = _ref1[psr];
          for (namespace in autoload) {
            src = autoload[namespace];
            if (namespace.endsWith("\\")) {
              namespace = namespace.substr(0, namespace.length - 1);
            }
            autoloaders[src] = namespace;
          }
        }
      }
      path = editor.getPath();
      _ref2 = atom.project.getDirectories();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        directory = _ref2[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL25hbWVzcGFjZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFSTtBQUFBO0FBQUE7OztPQUFBO0FBQUEsSUFJQSxlQUFBLEVBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2IsVUFBQSxtTEFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxvQkFBUixDQUFSLENBQUE7QUFBQSxNQUVBLFFBQUEsR0FBYyxLQUFLLENBQUMsUUFBTixDQUFBLENBRmQsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUtBLE1BQUEsSUFBRyxDQUFBLFFBQUg7QUFDSSxjQUFBLENBREo7T0FMQTtBQVNBO0FBQUEsV0FBQSxXQUFBOzZCQUFBO0FBQ0ksYUFBQSxxQkFBQTtvQ0FBQTtBQUNJLFVBQUEsSUFBRyxTQUFTLENBQUMsUUFBVixDQUFtQixJQUFuQixDQUFIO0FBQ0ksWUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsU0FBUyxDQUFDLE1BQVYsR0FBaUIsQ0FBckMsQ0FBWixDQURKO1dBQUE7QUFBQSxVQUdBLFdBQVksQ0FBQSxHQUFBLENBQVosR0FBbUIsU0FIbkIsQ0FESjtBQUFBLFNBREo7QUFBQSxPQVRBO0FBZ0JBLE1BQUEsSUFBRyxRQUFTLENBQUEsY0FBQSxDQUFaO0FBQ0k7QUFBQSxhQUFBLFlBQUE7Z0NBQUE7QUFDSSxlQUFBLHFCQUFBO3NDQUFBO0FBQ0ksWUFBQSxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLElBQW5CLENBQUg7QUFDSSxjQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMs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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/services/namespace.coffee
