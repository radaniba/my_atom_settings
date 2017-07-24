(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, ref, runCommand,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  runCommand = function(args, workingDirectory) {
    var view;
    view = OutputViewManager.create();
    return git.cmd(args, {
      cwd: workingDirectory
    }, {
      color: true
    }).then(function(data) {
      var msg;
      msg = "git " + (args.join(' ')) + " was successful";
      notifier.addSuccess(msg);
      if ((data != null ? data.length : void 0) > 0) {
        view.setContent(data);
      } else {
        view.reset();
      }
      return view.finish();
    })["catch"]((function(_this) {
      return function(msg) {
        if ((msg != null ? msg.length : void 0) > 0) {
          view.setContent(msg);
        } else {
          view.reset();
        }
        return view.finish();
      };
    })(this));
  };

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('commandEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Git command and arguments'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.commandEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            var ref1;
            if ((ref1 = _this.panel) != null) {
              ref1.destroy();
            }
            _this.currentPane.activate();
            return _this.disposables.dispose();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          var args, ref1;
          _this.disposables.dispose();
          if ((ref1 = _this.panel) != null) {
            ref1.destroy();
          }
          args = _this.commandEditor.getText().split(' ');
          if (args[0] === 1) {
            args.shift();
          }
          return runCommand(args, _this.repo.getWorkingDirectory()).then(function() {
            _this.currentPane.activate();
            return git.refresh(_this.repo);
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo, args) {
    if (args) {
      args = args.split(' ');
      return runCommand(args, repo.getWorkingDirectory());
    } else {
      return new InputView(repo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1ydW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwR0FBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxtQ0FBSixFQUFvQjs7RUFFcEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxnQkFBUDtBQUNYLFFBQUE7SUFBQSxJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtXQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLGdCQUFMO0tBQWQsRUFBcUM7TUFBQyxLQUFBLEVBQU8sSUFBUjtLQUFyQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtBQUNKLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBQSxHQUFNLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBQUQsQ0FBTixHQUFzQjtNQUM1QixRQUFRLENBQUMsVUFBVCxDQUFvQixHQUFwQjtNQUNBLG9CQUFHLElBQUksQ0FBRSxnQkFBTixHQUFlLENBQWxCO1FBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBSEY7O2FBSUEsSUFBSSxDQUFDLE1BQUwsQ0FBQTtJQVBJLENBRE4sQ0FTQSxFQUFDLEtBQUQsRUFUQSxDQVNPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxHQUFEO1FBQ0wsbUJBQUcsR0FBRyxDQUFF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dG9tJ1xueyQsIFRleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5ydW5Db21tYW5kID0gKGFyZ3MsIHdvcmtpbmdEaXJlY3RvcnkpIC0+XG4gIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogd29ya2luZ0RpcmVjdG9yeSwge2NvbG9yOiB0cnVlfSlcbiAgLnRoZW4gKGRhdGEpIC0+XG4gICAgbXNnID0gXCJnaXQgI3thcmdzLmpvaW4oJyAnKX0gd2FzIHN1Y2Nlc3NmdWxcIlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobXNnKVxuICAgIGlmIGRhdGE/Lmxlbmd0aCA+IDBcbiAgICAgIHZpZXcuc2V0Q29udGVudCBkYXRhXG4gICAgZWxzZVxuICAgICAgdmlldy5yZXNldCgpXG4gICAgdmlldy5maW5pc2goKVxuICAuY2F0Y2ggKG1zZykgPT5cbiAgICBpZiBtc2c/Lmxlbmd0aCA+IDBcbiAgICAgIHZpZXcuc2V0Q29udGVudCBtc2dcbiAgICBlbHNlXG4gICAgICB2aWV3LnJlc2V0KClcbiAgICB2aWV3LmZpbmlzaCgpXG5cbmNsYXNzIElucHV0VmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiA9PlxuICAgICAgQHN1YnZpZXcgJ2NvbW1hbmRFZGl0b3InLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnR2l0IGNvbW1hbmQgYW5kIGFyZ3VtZW50cycpXG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvKSAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGNvbW1hbmRFZGl0b3IuZm9jdXMoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCc6IChlKSA9PlxuICAgICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICAgIEBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y29uZmlybScsIChlKSA9PlxuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICAgIGFyZ3MgPSBAY29tbWFuZEVkaXRvci5nZXRUZXh0KCkuc3BsaXQoJyAnKVxuICAgICAgIyBUT0RPOiByZW1vdmUgdGhpcz9cbiAgICAgIGlmIGFyZ3NbMF0gaXMgMSB0aGVuIGFyZ3Muc2hpZnQoKVxuICAgICAgcnVuQ29tbWFuZCBhcmdzLCBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgICAgIC50aGVuID0+XG4gICAgICAgIEBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIGFyZ3MpIC0+XG4gIGlmIGFyZ3NcbiAgICBhcmdzID0gYXJncy5zcGxpdCgnICcpXG4gICAgcnVuQ29tbWFuZCBhcmdzLCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBlbHNlXG4gICAgbmV3IElucHV0VmlldyhyZXBvKVxuIl19
