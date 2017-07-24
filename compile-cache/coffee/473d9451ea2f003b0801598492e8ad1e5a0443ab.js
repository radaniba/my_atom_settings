(function() {
  var Inspector, KernelManager, MessagePanelView, PlainMessageView, transform, transformime, _ref;

  _ref = require('atom-message-panel'), MessagePanelView = _ref.MessagePanelView, PlainMessageView = _ref.PlainMessageView;

  transformime = require('transformime');

  KernelManager = require('./kernel-manager');

  module.exports = Inspector = {
    inspect: function() {
      var code, cursor_pos, grammar, grammarLanguage, kernel, _ref1, _ref2;
      this.editor = atom.workspace.getActiveTextEditor();
      grammar = this.editor.getGrammar();
      grammarLanguage = KernelManager.getGrammarLanguageFor(grammar);
      kernel = KernelManager.getRunningKernelFor(grammarLanguage);
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

  transform = transformime.createTransform();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvaW5zcGVjdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRkFBQTs7QUFBQSxFQUFBLE9BQXVDLE9BQUEsQ0FBUSxvQkFBUixDQUF2QyxFQUFDLHdCQUFBLGdCQUFELEVBQW1CLHdCQUFBLGdCQUFuQixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQ2I7QUFBQSxJQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDTCxVQUFBLGdFQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQURWLENBQUE7QUFBQSxNQUVBLGVBQUEsR0FBa0IsYUFBYSxDQUFDLHFCQUFkLENBQW9DLE9BQXBDLENBRmxCLENBQUE7QUFBQSxNQUdBLE1BQUEsR0FBUyxhQUFhLENBQUMsbUJBQWQsQ0FBa0MsZUFBbEMsQ0FIVCxDQUFBO0FBSUEsTUFBQSxJQUFPLGNBQVA7QUFDSSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsb0JBQTNCLENBQUEsQ0FBQTs7ZUFDVSxDQUFFLEtBQVosQ0FBQTtTQURBO0FBRUEsY0FBQSxDQUhKO09BSkE7QUFBQSxNQVNBLFFBQXFCLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQXJCLEVBQUMsZUFBRCxFQUFPLHFCQVRQLENBQUE7YUFXQSxNQUFN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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/inspector.coffee
