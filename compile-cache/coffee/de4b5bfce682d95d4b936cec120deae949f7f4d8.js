(function() {
  var Inspector, KernelManager, MessagePanelView, PlainMessageView, transform, transformime, transformimeJupyter, _ref;

  _ref = require('atom-message-panel'), MessagePanelView = _ref.MessagePanelView, PlainMessageView = _ref.PlainMessageView;

  transformime = require('transformime');

  transformimeJupyter = require('transformime-jupyter-transformers');

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

  transform = transformime.createTransform([transformimeJupyter.consoleTextTransform]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvaW5zcGVjdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnSEFBQTs7QUFBQSxFQUFBLE9BQXVDLE9BQUEsQ0FBUSxvQkFBUixDQUF2QyxFQUFDLHdCQUFBLGdCQUFELEVBQW1CLHdCQUFBLGdCQUFuQixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSxtQ0FBUixDQUZ0QixDQUFBOztBQUFBLEVBSUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FKaEIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDYjtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNMLFVBQUEsZ0VBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBRFYsQ0FBQTtBQUFBLE1BRUEsZUFBQSxHQUFrQixhQUFhLENBQUMscUJBQWQsQ0FBb0MsT0FBcEMsQ0FGbEIsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLGFBQWEsQ0FBQyxtQkFBZCxDQUFrQyxlQUFsQyxDQUhULENBQUE7QUFJQSxNQUFBLElBQU8sY0FBUDtBQUNJLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixvQkFBM0IsQ0FBQSxDQUFBOztlQUNVLENBQUUsS0FBWixDQUFBO1NBREE7QUFFQSxjQUFBLENBSEo7T0FKQTtBQUFBLE1BU0EsUUFBcUIsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBckIsRUFBQyxlQUFELEVBQU8scUJBVFAsQ0FBQTthQVdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixVQUFyQixFQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDN0IsY0FBQSxzQ0FBQTtBQUFBLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQyxNQUFsQyxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsS0FEZixDQUFBO0FBRUEsVUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO0FBQ0ksWUFBQSxlQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO0FBQ2Qsa0JBQUEsdUNBQUE7QUFBQSxjQURnQixnQkFBQSxVQUFVLFVBQUEsRUFDMUIsQ0FBQTtBQUFBLGNBQUEsS0FBQSxHQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBYixDQUFtQixJQUFuQixDQUFSLENBQUE7QUFBQSxjQUNBLFNBQUEsR0FBWSxLQUFNLENBQUEsQ0FBQSxDQURsQixDQUFBO0FBQUEsY0FFQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZSxDQUFmLENBRkEsQ0FBQTtBQUFBLGNBR0EsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUhWLENBQUE7QUFBQSxjQUlBLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FKQSxDQUFBO3FCQUtBLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFsQixFQUE2QixPQUE3QixFQU5jO1lBQUEsQ0FBbEIsQ0FBQTtBQUFBLFlBUUEsT0FBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO3FCQUNOLE9BQU8sQ0FBQyxLQUFSLENBQWMsNkJBQWQsRUFBNkMsS0FBN0MsRUFETTtZQUFBLENBUlYsQ0FBQTttQkFXQSxTQUFBLENBQVUsTUFBTSxDQUFDLElBQWpCLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsZUFBNUIsRUFBNkMsT0FBN0MsRUFaSjtXQUFBLE1BQUE7QUFlSSxZQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsNkJBQTNCLENBQUEsQ0FBQTs0REFDVSxDQUFFLEtBQVosQ0FBQSxXQWhCSjtXQUg2QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLEVBWks7SUFBQSxDQUFUO0FBQUEsSUFpQ0EsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSw2QkFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQSxDQUFBLEtBQTZCLEVBQWhDO0FBQ0ksUUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBUCxDQUFBO0FBQUEsUUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BRGxCLENBREo7T0FBQSxNQUFBO0FBSUksUUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBVCxDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUROLENBQUE7QUFBQSxRQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEdBQTdCLENBRlAsQ0FBQTtBQUFBLFFBR0EsVUFBQSxHQUFhLE1BQU0sQ0FBQyxlQUFQLENBQUEsQ0FIYixDQUpKO09BQUE7QUFRQSxhQUFPLENBQUMsSUFBRCxFQUFPLFVBQVAsQ0FBUCxDQVRjO0lBQUEsQ0FqQ2xCO0FBQUEsSUE0Q0EsWUFBQSxFQUFjLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBTyxzQkFBUDtBQUNJLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtQkFBWixDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLGdCQUFBLENBQ2I7QUFBQSxVQUFBLEtBQUEsRUFBTyxvQkFBUDtTQURhLEVBRnJCO09BQUEsTUFBQTtlQUtJLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLEVBTEo7T0FEVTtJQUFBLENBNUNkO0FBQUEsSUFvREEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEVBQVksT0FBWixHQUFBO0FBQ2QsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFtQixJQUFBLGdCQUFBLENBQ2Y7QUFBQSxRQUFBLE9BQUEsRUFBUyxTQUFUO0FBQUEsUUFDQSxTQUFBLEVBQVcsaUJBRFg7QUFBQSxRQUVBLEdBQUEsRUFBSyxJQUZMO09BRGUsQ0FBbkIsQ0FEQSxDQUFBO2FBS0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQW1CLElBQUEsZ0JBQUEsQ0FDZjtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUNBLFNBQUEsRUFBVyxpQkFEWDtBQUFBLFFBRUEsR0FBQSxFQUFLLElBRkw7T0FEZSxDQUFuQixFQU5jO0lBQUEsQ0FwRGxCO0FBQUEsSUErREEsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBRyxzQkFBSDtlQUNJLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLEVBREo7T0FEaUI7SUFBQSxDQS9EckI7QUFBQSxJQW1FQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNaLE1BQUEsSUFBRyxzQkFBSDtlQUNJLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLEVBREo7T0FEWTtJQUFBLENBbkVoQjtHQVBKLENBQUE7O0FBQUEsRUE4RUEsU0FBQSxHQUFZLFlBQVksQ0FBQyxlQUFiLENBQTZCLENBQ3JDLG1CQUFtQixDQUFDLG9CQURpQixDQUE3QixDQTlFWixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/inspector.coffee
