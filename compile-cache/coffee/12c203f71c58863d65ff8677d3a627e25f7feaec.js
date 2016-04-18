(function() {
  var Inspector, KernelManager, MessagePanelView, PlainMessageView, transform, transformer, transformime, transformimeJupyter, _ref;

  _ref = require('atom-message-panel'), MessagePanelView = _ref.MessagePanelView, PlainMessageView = _ref.PlainMessageView;

  transformime = require('transformime');

  transformimeJupyter = require('transformime-jupyter-transformers');

  KernelManager = require('./kernel-manager');

  module.exports = Inspector = {
    inspect: function() {
      var code, cursor_pos, kernel, language, _ref1, _ref2;
      this.editor = atom.workspace.getActiveTextEditor();
      language = this.editor.getGrammar().name.toLowerCase();
      kernel = KernelManager.getRunningKernelForLanguage(language);
      if (kernel == null) {
        atom.notifications.addInfo("No kernel running!");
        if ((_ref1 = this.inspector) != null) {
          _ref1.close();
        }
        return;
      }
      _ref2 = this.getCodeToInspect(), code = _ref2[0], cursor_pos = _ref2[1];
      return kernel.inspect(code, cursor_pos, (function(_this) {
        return function(result) {
          var found, onError, onInspectResult, _ref3;
          console.log('Inspector: Result:', result);
          found = result.found;
          if (found === true) {
            onInspectResult = function(_arg) {
              var el, firstline, lines, message, mimetype;
              mimetype = _arg.mimetype, el = _arg.el;
              lines = el.innerHTML.split('\n');
              firstline = lines[0];
              lines.splice(0, 1);
              message = lines.join('\n');
              _this.getInspector();
              return _this.addInspectResult(firstline, message);
            };
            onError = function(error) {
              return console.error("Inspector: Rendering error:", error);
            };
            return transform(result.data).then(onInspectResult, onError);
          } else {
            atom.notifications.addInfo("No introspection available!");
            return (_ref3 = _this.inspector) != null ? _ref3.close() : void 0;
          }
        };
      })(this));
    },
    getCodeToInspect: function() {
      var code, cursor, cursor_pos, row;
      if (this.editor.getSelectedText() !== '') {
        code = this.editor.getSelectedText();
        cursor_pos = code.length;
      } else {
        cursor = this.editor.getLastCursor();
        row = cursor.getBufferRow();
        code = this.editor.lineTextForBufferRow(row);
        cursor_pos = cursor.getBufferColumn();
      }
      return [code, cursor_pos];
    },
    getInspector: function() {
      if (this.inspector == null) {
        console.log("Opening Inspector");
        return this.inspector = new MessagePanelView({
          title: 'Hydrogen Inspector'
        });
      } else {
        return this.inspector.clear();
      }
    },
    addInspectResult: function(firstline, message) {
      this.inspector.attach();
      this.inspector.add(new PlainMessageView({
        message: firstline,
        className: 'inspect-message',
        raw: true
      }));
      return this.inspector.add(new PlainMessageView({
        message: message,
        className: 'inspect-message',
        raw: true
      }));
    },
    toggleInspectorSize: function() {
      if (this.inspector != null) {
        return this.inspector.toggle();
      }
    },
    closeInspector: function() {
      if (this.inspector != null) {
        return this.inspector.close();
      }
    }
  };

  transformer = new transformime.Transformime([transformimeJupyter.consoleTextTransform]);

  transform = function(mimeBundle) {
    return transformer.transform(mimeBundle, document);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvaW5zcGVjdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SEFBQTs7QUFBQSxFQUFBLE9BQXVDLE9BQUEsQ0FBUSxvQkFBUixDQUF2QyxFQUFDLHdCQUFBLGdCQUFELEVBQW1CLHdCQUFBLGdCQUFuQixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxtQ0FBUixDQUZ0QixDQUFBOztBQUFBLEVBSUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FKaEIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDYjtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNMLFVBQUEsZ0RBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQW9CLENBQUMsSUFBSSxDQUFDLFdBQTFCLENBQUEsQ0FEWCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsYUFBYSxDQUFDLDJCQUFkLENBQTBDLFFBQTFDLENBRlQsQ0FBQTtBQUdBLE1BQUEsSUFBTyxjQUFQO0FBQ0ksUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLG9CQUEzQixDQUFBLENBQUE7O2VBQ1UsQ0FBRSxLQUFaLENBQUE7U0FEQTtBQUVBLGNBQUEsQ0FISjtPQUhBO0FBQUEsTUFRQSxRQUFxQixJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFyQixFQUFDLGVBQUQsRUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/inspector.coffee
