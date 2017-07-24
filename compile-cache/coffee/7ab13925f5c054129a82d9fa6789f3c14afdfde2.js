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
          var dir, _i, _len, _ref1, _ref2;
          _this.label("Post Title", {
            "class": 'icon icon-file-add',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          if ((_ref1 = process.jekyllAtom.config.atom) != null ? _ref1.postDirs : void 0) {
            _ref2 = process.jekyllAtom.config.atom.postDirs;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              dir = _ref2[_i];
              _this.label(dir);
              _this.input({
                type: 'checkbox',
                outlet: 'dirCheckbox' + dir,
                'data-dir': dir
              });
            }
          }
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
      var dir, _, _i, _len, _ref1, _ref2;
      if ((_ref1 = process.jekyllAtom.config.atom) != null ? _ref1.postDirs : void 0) {
        _ref2 = process.jekyllAtom.config.atom.postDirs;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dir = _ref2[_i];
          _ = this;
          this['dirCheckbox' + dir].on('change', function() {
            if ($(this).prop('checked')) {
              console.dir(['dirCheckbox' + sdir, _['dirCheckbox' + sdir].prop('data-dir'), dir]);
              if (sdir !== dir) {
                return _['dirCheckbox' + sdir].prop('checked', false);
              }
            }
          });
          if (dir === process.jekyllAtom.config.atom.defaultPostDir) {
            this['dirCheckbox' + dir].prop('checked', true);
          } else {
            this['dirCheckbox' + dir].prop('checked', false);
          }
        }
      }
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
      var dir, endsWithDirectorySeparator, error, fileName, pathToCreate, postDir, relativePath, _i, _len, _ref1, _ref2, _ref3;
      postDir = '_posts';
      if ((_ref1 = process.jekyllAtom.config.atom) != null ? _ref1.postDirs : void 0) {
        _ref2 = process.jekyllAtom.config.atom.postDirs;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dir = _ref2[_i];
          if (!!this['dirCheckbox' + dir].prop('checked')) {
            postDir = dir;
          }
        }
      }
      fileName = Utils.generateFileName(title);
      relativePath = path.join(process.jekyllAtom.config.source, postDir, fileName + '.markdown');
      endsWithDirectorySeparator = /\/$/.test(relativePath);
      pathToCreate = (_ref3 = atom.project.getDirectories()[0]) != null ? _ref3.resolve(relativePath) : void 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL2pla3lsbC9uZXctcG9zdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUhMLENBQUE7O0FBQUEsRUFLQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBTEosQ0FBQTs7QUFBQSxFQU9BLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQVBSLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGtDQUFQO09BQUwsRUFBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM5QyxjQUFBLDJCQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUI7QUFBQSxZQUFBLE9BQUEsRUFBTyxvQkFBUDtBQUFBLFlBQTZCLE1BQUEsRUFBUSxZQUFyQztXQUFyQixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtBQUFBLFlBQUEsSUFB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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/jekyll/new-post-view.coffee
