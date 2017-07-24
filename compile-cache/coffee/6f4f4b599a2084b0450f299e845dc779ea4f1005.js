(function() {
  var Inspector, MessagePanelView, PlainMessageView, transform, transformime, _ref;

  _ref = require('atom-message-panel'), MessagePanelView = _ref.MessagePanelView, PlainMessageView = _ref.PlainMessageView;

  transformime = require('transformime');

  module.exports = Inspector = (function() {
    function Inspector(kernelManager) {
      this.kernelManager = kernelManager;
      this._lastInspectionResult = '';
    }

    Inspector.prototype.toggle = function() {
      var code, cursor_pos, editor, grammar, kernel, language, _ref1, _ref2;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      language = this.kernelManager.getLanguageFor(grammar);
      kernel = this.kernelManager.getRunningKernelFor(language);
      if (kernel == null) {
        atom.notifications.addInfo('No kernel running!');
        if ((_ref1 = this.view) != null) {
          _ref1.close();
        }
        return;
      }
      if (this.view == null) {
        this.view = new MessagePanelView({
          title: 'Hydrogen Inspector',
          closeMethod: 'destroy'
        });
      }
      _ref2 = this.getCodeToInspect(editor), code = _ref2[0], cursor_pos = _ref2[1];
      if (cursor_pos === 0) {
        return;
      }
      return kernel.inspect(code, cursor_pos, (function(_this) {
        return function(result) {
          return _this.showInspectionResult(result);
        };
      })(this));
    };

    Inspector.prototype.getCodeToInspect = function(editor) {
      var code, cursor, cursor_pos, identifier_end, row, selectedText;
      selectedText = editor.getSelectedText();
      if (selectedText) {
        code = selectedText;
        cursor_pos = code.length;
      } else {
        cursor = editor.getLastCursor();
        row = cursor.getBufferRow();
        code = editor.lineTextForBufferRow(row);
        cursor_pos = cursor.getBufferColumn();
        identifier_end = code.slice(cursor_pos).search(/\W/);
        if (identifier_end !== -1) {
          cursor_pos += identifier_end;
        }
      }
      return [code, cursor_pos];
    };

    Inspector.prototype.showInspectionResult = function(result) {
      var onError, onInspectResult, _ref1;
      console.log('Inspector: Result:', result);
      if (!result.found) {
        atom.notifications.addInfo('No introspection available!');
        if ((_ref1 = this.view) != null) {
          _ref1.close();
        }
        return;
      }
      onInspectResult = (function(_this) {
        return function(_arg) {
          var container, el, firstline, lines, message, mimetype, _ref2, _ref3, _ref4;
          mimetype = _arg.mimetype, el = _arg.el;
          if (mimetype === 'text/plain') {
            lines = el.innerHTML.split('\n');
            firstline = lines[0];
            lines.splice(0, 1);
            message = lines.join('\n');
            if (_this._lastInspectionResult === message && (_this.view.panel != null)) {
              if ((_ref2 = _this.view) != null) {
                _ref2.close();
              }
              return;
            }
            _this.view.clear();
            _this.view.attach();
            _this.view.add(new PlainMessageView({
              message: firstline,
              className: 'inspect-message',
              raw: true
            }));
            _this.view.add(new PlainMessageView({
              message: message,
              className: 'inspect-message',
              raw: true
            }));
            _this._lastInspectionResult = message;
            return;
          } else if (mimetype === 'text/html') {
            container = document.createElement('div');
            container.appendChild(el);
            message = container.innerHTML;
            if (_this._lastInspectionResult === message && (_this.view.panel != null)) {
              if ((_ref3 = _this.view) != null) {
                _ref3.close();
              }
              return;
            }
            _this.view.clear();
            _this.view.attach();
            _this.view.add(new PlainMessageView({
              message: message,
              className: 'inspect-message',
              raw: true
            }));
            _this._lastInspectionResult = message;
            return;
          }
          console.error('Inspector: Rendering error:', mimetype, el);
          atom.notifications.addInfo('Cannot render introspection result!');
          if ((_ref4 = _this.view) != null) {
            _ref4.close();
          }
        };
      })(this);
      onError = (function(_this) {
        return function(error) {
          var _ref2;
          console.error('Inspector: Rendering error:', error);
          atom.notifications.addInfo('Cannot render introspection result!');
          return (_ref2 = _this.view) != null ? _ref2.close() : void 0;
        };
      })(this);
      return transform(result.data).then(onInspectResult, onError);
    };

    return Inspector;

  })();

  transform = transformime.createTransform();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvaW5zcGVjdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0RUFBQTs7QUFBQSxFQUFBLE9BQXVDLE9BQUEsQ0FBUSxvQkFBUixDQUF2QyxFQUFDLHdCQUFBLGdCQUFELEVBQW1CLHdCQUFBLGdCQUFuQixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDVyxJQUFBLG1CQUFFLGFBQUYsR0FBQTtBQUNULE1BRFUsSUFBQyxDQUFBLGdCQUFBLGFBQ1gsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHFCQUFELEdBQXlCLEVBQXpCLENBRFM7SUFBQSxDQUFiOztBQUFBLHdCQUdBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDSixVQUFBLGlFQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FEVixDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLE9BQTlCLENBRlgsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsUUFBbkMsQ0FIVCxDQUFBO0FBSUEsTUFBQSxJQUFPLGNBQVA7QUFDSSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsb0JBQTNCLENBQUEsQ0FBQTs7ZUFDSyxDQUFFLEtBQVAsQ0FBQTtTQURBO0FBRUEsY0FBQSxDQUhKO09BSkE7O1FBU0EsSUFBQyxDQUFBLE9BQVksSUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/inspector.coffee
