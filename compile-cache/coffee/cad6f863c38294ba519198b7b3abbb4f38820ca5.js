(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, ref, runCommand,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  runCommand = function(repo, args) {
    var promise, view;
    view = OutputViewManager.create();
    promise = git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    });
    promise.then(function(data) {
      var msg;
      msg = "git " + (args.join(' ')) + " was successful";
      notifier.addSuccess(msg);
      if ((data != null ? data.length : void 0) > 0) {
        view.setContent(data);
      } else {
        view.reset();
      }
      view.finish();
      return git.refresh(repo);
    })["catch"]((function(_this) {
      return function(msg) {
        if ((msg != null ? msg.length : void 0) > 0) {
          view.setContent(msg);
        } else {
          view.reset();
        }
        view.finish();
        return git.refresh(repo);
      };
    })(this));
    return promise;
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
          var ref1;
          _this.disposables.dispose();
          if ((ref1 = _this.panel) != null) {
            ref1.destroy();
          }
          return runCommand(_this.repo, _this.commandEditor.getText().split(' ')).then(function() {
            _this.currentPane.activate();
            return git.refresh(_this.repo);
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo, args) {
    if (args == null) {
      args = [];
    }
    if (args.length > 0) {
      return runCommand(repo, args.split(' '));
    } else {
      return new InputView(repo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1ydW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwR0FBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxtQ0FBSixFQUFvQjs7RUFFcEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxJQUFQO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO0lBQ1AsT0FBQSxHQUFVLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxFQUErQztNQUFDLEtBQUEsRUFBTyxJQUFSO0tBQS9DO0lBQ1YsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsR0FBQSxHQUFNLE1BQUEsR0FBTSxDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixDQUFELENBQU4sR0FBc0I7TUFDNUIsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsR0FBcEI7TUFDQSxvQkFBRyxJQUFJLENBQUUsZ0JBQU4sR0FBZSxDQUFsQjtRQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUhGOztNQUlBLElBQUksQ0FBQyxNQUFMLENBQUE7YUFDQSxHQUFHLENBQUMsT0FBSixDQUFZLElBQVo7SUFSVyxDQUFiLENBU0EsRUFBQyxL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YXRvbSdcbnskLCBUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxucnVuQ29tbWFuZCA9IChyZXBvLCBhcmdzKSAtPlxuICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgcHJvbWlzZSA9IGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgcHJvbWlzZS50aGVuIChkYXRhKSAtPlxuICAgIG1zZyA9IFwiZ2l0ICN7YXJncy5qb2luKCcgJyl9IHdhcyBzdWNjZXNzZnVsXCJcbiAgICBub3RpZmllci5hZGRTdWNjZXNzKG1zZylcbiAgICBpZiBkYXRhPy5sZW5ndGggPiAwXG4gICAgICB2aWV3LnNldENvbnRlbnQgZGF0YVxuICAgIGVsc2VcbiAgICAgIHZpZXcucmVzZXQoKVxuICAgIHZpZXcuZmluaXNoKClcbiAgICBnaXQucmVmcmVzaCByZXBvXG4gIC5jYXRjaCAobXNnKSA9PlxuICAgIGlmIG1zZz8ubGVuZ3RoID4gMFxuICAgICAgdmlldy5zZXRDb250ZW50IG1zZ1xuICAgIGVsc2VcbiAgICAgIHZpZXcucmVzZXQoKVxuICAgIHZpZXcuZmluaXNoKClcbiAgICBnaXQucmVmcmVzaCByZXBvXG4gIHJldHVybiBwcm9taXNlXG5cbmNsYXNzIElucHV0VmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiA9PlxuICAgICAgQHN1YnZpZXcgJ2NvbW1hbmRFZGl0b3InLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnR2l0IGNvbW1hbmQgYW5kIGFyZ3VtZW50cycpXG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvKSAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGNvbW1hbmRFZGl0b3IuZm9jdXMoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCc6IChlKSA9PlxuICAgICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICAgIEBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y29uZmlybScsIChlKSA9PlxuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICAgIHJ1bkNvbW1hbmQoQHJlcG8sIEBjb21tYW5kRWRpdG9yLmdldFRleHQoKS5zcGxpdCgnICcpKS50aGVuID0+XG4gICAgICAgIEBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIGFyZ3M9W10pIC0+XG4gIGlmIGFyZ3MubGVuZ3RoID4gMFxuICAgIHJ1bkNvbW1hbmQgcmVwbywgYXJncy5zcGxpdCgnICcpXG4gIGVsc2VcbiAgICBuZXcgSW5wdXRWaWV3KHJlcG8pXG4iXX0=
