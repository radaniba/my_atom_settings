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

    JekyllNewPostView.prototype.directoryBoxes = {};

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
          this.directoryBoxes[dir] = this['dirCheckbox' + dir];
          this['dirCheckbox' + dir].on('change', function() {
            var sdir, _j, _len1, _ref3, _results;
            if ($(this).prop('checked')) {
              _ref3 = Object.keys(_.directoryBoxes);
              _results = [];
              for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                sdir = _ref3[_j];
                if (sdir !== $(this).attr('data-dir')) {
                  _results.push(_.directoryBoxes[sdir].prop('checked', false));
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL2pla3lsbC9uZXctcG9zdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUhMLENBQUE7O0FBQUEsRUFLQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBTEosQ0FBQTs7QUFBQSxFQU9BLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQVBSLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGdDQUFBLGNBQUEsR0FBZ0IsRUFBaEIsQ0FBQTs7QUFBQSxJQUVBLGlCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxrQ0FBUDtPQUFMLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDOUMsY0FBQSwyQkFBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLEVBQXFCO0FBQUEsWUFBQSxPQUFBLEVBQU8sb0JBQVA7QUFBQSxZQUE2QixNQUFBLEVBQVEsWUFBckM7V0FBckIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQs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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/jekyll/new-post-view.coffee
