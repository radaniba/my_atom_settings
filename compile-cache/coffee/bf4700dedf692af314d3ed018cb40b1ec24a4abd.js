(function() {
  var $, JekyllNewPostView, TextEditorView, Utils, View, fs, os, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  path = require('path');

  fs = require('fs-plus');

  os = require('os');

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  Utils = require('./utils');

  module.exports = JekyllNewPostView = (function(_super) {
    __extends(JekyllNewPostView, _super);

    function JekyllNewPostView() {
      return JekyllNewPostView.__super__.constructor.apply(this, arguments);
    }

    JekyllNewPostView.content = function() {
      return this.div({
        "class": 'jekyll-new-post overlay from-top'
      }, (function(_this) {
        return function() {
          _this.label("Post Title", {
            "class": 'icon icon-file-add',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label("Draft");
          _this.input({
            type: 'checkbox',
            outlet: 'draftCheckbox'
          });
          _this.button({
            outlet: 'createButton'
          }, 'Create');
          return _this.div({
            "class": 'error-message',
            outlet: 'errorMessage'
          });
        };
      })(this));
    };

    JekyllNewPostView.prototype.initialize = function() {
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)
      });
      return this.createButton.on('click', (function(_this) {
        return function() {
          return _this.onConfirm(_this.miniEditor.getText());
        };
      })(this));
    };

    JekyllNewPostView.prototype.attach = function() {
      return this.panel = atom.workspace.addModalPanel({
        item: this
      });
    };

    JekyllNewPostView.prototype.destroy = function() {
      this.panel.destroy();
      return atom.workspace.getActivePane().activate();
    };

    JekyllNewPostView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        atom.workspaceView.append(this);
        return this.miniEditor.focus();
      }
    };

    JekyllNewPostView.prototype.showError = function(error) {
      this.errorMessage.text(error);
      if (error) {
        return this.flashError();
      }
    };

    JekyllNewPostView.prototype.onConfirm = function(title) {
      var draft, endsWithDirectorySeparator, error, fileName, pathToCreate, relativePath, _ref1;
      draft = !!this.draftCheckbox.prop('checked');
      fileName = Utils.generateFileName(title, draft);
      if (draft) {
        relativePath = path.join('_drafts', fileName + '.markdown');
      } else {
        relativePath = path.join('_posts', fileName + '.markdown');
      }
      endsWithDirectorySeparator = /\/$/.test(relativePath);
      pathToCreate = (_ref1 = atom.project.getDirectories()[0]) != null ? _ref1.resolve(relativePath) : void 0;
      if (!pathToCreate) {
        return;
      }
      try {
        if (fs.existsSync(pathToCreate)) {
          return this.showError("'" + pathToCreate + "' already exists.");
        } else {
          if (endsWithDirectorySeparator) {
            return this.showError("File names must not end with a '/' character.");
          } else {
            fs.writeFileSync(pathToCreate, this.fileContents(title, Utils.generateDateString(new Date(), true)));
            atom.workspace.open(pathToCreate);
            return this.destroy();
          }
        }
      } catch (_error) {
        error = _error;
        return this.showError("" + error.message + ".");
      }
    };

    JekyllNewPostView.prototype.fileContents = function(title, dateString) {
      return ['---', 'layout: post', "title: \"" + title + "\"", "date: \"" + dateString + "\"", '---'].join(os.EOL);
    };

    return JekyllNewPostView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL2pla3lsbC9uZXctcG9zdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUhMLENBQUE7O0FBQUEsRUFLQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBTEosQ0FBQTs7QUFBQSxFQU9BLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQVBSLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGtDQUFQO09BQUwsRUFBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM5QyxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQjtBQUFBLFlBQUEsT0FBQSxFQUFPLG9CQUFQO0FBQUEsWUFBNkIsTUFBQSxFQUFRLFlBQXJDO1dBQXJCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFm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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/jekyll/new-post-view.coffee
