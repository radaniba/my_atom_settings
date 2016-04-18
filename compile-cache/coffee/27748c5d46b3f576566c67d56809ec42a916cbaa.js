(function() {
  var CompositeDisposable, Gist, GistView, TextEditorView, View, shell, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), TextEditorView = _ref.TextEditorView, View = _ref.View;

  CompositeDisposable = require('atom').CompositeDisposable;

  Gist = require('./gist-model');

  shell = require('shell');

  module.exports = GistView = (function(_super) {
    __extends(GistView, _super);

    function GistView() {
      return GistView.__super__.constructor.apply(this, arguments);
    }

    GistView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": "gist overlay from-top padded"
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": "inset-panel"
          }, function() {
            _this.div({
              "class": "panel-heading"
            }, function() {
              _this.span({
                outlet: "title"
              });
              return _this.div({
                "class": "btn-toolbar pull-right",
                outlet: 'toolbar'
              }, function() {
                return _this.div({
                  "class": "btn-group"
                }, function() {
                  _this.button({
                    outlet: "privateButton",
                    "class": "btn"
                  }, "Secret");
                  return _this.button({
                    outlet: "publicButton",
                    "class": "btn"
                  }, "Public");
                });
              });
            });
            return _this.div({
              "class": "panel-body padded"
            }, function() {
              _this.div({
                outlet: 'gistForm',
                "class": 'gist-form'
              }, function() {
                _this.subview('descriptionEditor', new TextEditorView({
                  mini: true,
                  placeholder: 'Gist Description'
                }));
                _this.div({
                  "class": 'block pull-right'
                }, function() {
                  _this.button({
                    outlet: 'cancelButton',
                    "class": 'btn inline-block-tight'
                  }, "Cancel");
                  return _this.button({
                    outlet: 'gistButton',
                    "class": 'btn btn-primary inline-block-tight'
                  }, "Gist It");
                });
                return _this.div({
                  "class": 'clearfix'
                });
              });
              _this.div({
                outlet: 'progressIndicator'
              }, function() {
                return _this.span({
                  "class": 'loading loading-spinner-medium'
                });
              });
              return _this.div({
                outlet: 'urlDisplay'
              }, function() {
                return _this.span("All Done! the Gist's URL has been copied to your clipboard.");
              });
            });
          });
        };
      })(this));
    };

    GistView.prototype.initialize = function(serializeState) {
      this.gist = null;
      this.subscriptions = new CompositeDisposable;
      this.handleEvents();
      return atom.commands.add('atom-text-editor', {
        'gist-it:gist-current-file': (function(_this) {
          return function() {
            return _this.gistCurrentFile();
          };
        })(this),
        "gist-it:gist-selection": (function(_this) {
          return function() {
            return _this.gistSelection();
          };
        })(this),
        "gist-it:gist-open-buffers": (function(_this) {
          return function() {
            return _this.gistOpenBuffers();
          };
        })(this)
      });
    };

    GistView.prototype.serialize = function() {};

    GistView.prototype.destroy = function() {
      var _ref1;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      atom.views.getView(atom.workspace).focus();
      return this.detach();
    };

    GistView.prototype.handleEvents = function() {
      this.gistButton.on('click', (function(_this) {
        return function() {
          return _this.gistIt();
        };
      })(this));
      this.cancelButton.on('click', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
      this.publicButton.on('click', (function(_this) {
        return function() {
          return _this.makePublic();
        };
      })(this));
      this.privateButton.on('click', (function(_this) {
        return function() {
          return _this.makePrivate();
        };
      })(this));
      this.subscriptions.add(atom.commands.add(this.descriptionEditor.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.gistIt();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add(this.element, {
        'core:close': (function(_this) {
          return function() {
            return _this.destroy;
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy;
          };
        })(this)
      }));
      return this.on('focus', (function(_this) {
        return function() {
          console.log("foo");
          return _this.descriptionEditor.focus();
        };
      })(this));
    };

    GistView.prototype.gistCurrentFile = function() {
      var activeEditor, fileContent;
      activeEditor = atom.workspace.getActiveTextEditor();
      fileContent = activeEditor.getText();
      if (!!(fileContent.trim())) {
        this.gist = new Gist();
        this.gist.files[activeEditor.getTitle()] = {
          content: fileContent
        };
        this.title.text("Gist Current File");
        return this.presentSelf();
      } else {
        return atom.notifications.addError('Gist could not be created: The current file is empty.');
      }
    };

    GistView.prototype.gistSelection = function() {
      var activeEditor, selectedText;
      activeEditor = atom.workspace.getActiveTextEditor();
      selectedText = activeEditor.getSelectedText();
      if (!!(selectedText.trim())) {
        this.gist = new Gist();
        this.gist.files[activeEditor.getTitle()] = {
          content: selectedText
        };
        this.title.text("Gist Selection");
        return this.presentSelf();
      } else {
        return atom.notifications.addError('Gist could not be created: The current selection is empty.');
      }
    };

    GistView.prototype.gistOpenBuffers = function() {
      var editor, editorText, skippedAllBuffers, skippedEmptyBuffers, _i, _len, _ref1;
      skippedEmptyBuffers = false;
      skippedAllBuffers = true;
      this.gist = new Gist();
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        editorText = editor.getText();
        if (!!(editorText.trim())) {
          this.gist.files[editor.getTitle()] = {
            content: editorText
          };
          skippedAllBuffers = false;
        } else {
          skippedEmptyBuffers = true;
        }
      }
      if (!skippedAllBuffers) {
        this.title.text("Gist Open Buffers");
        this.presentSelf();
      } else {
        atom.notifications.addError('Gist could not be created: No open buffers with content.');
        return;
      }
      if (skippedEmptyBuffers) {
        return atom.notifications.addWarning('Some empty buffers will not be added to the Gist.');
      }
    };

    GistView.prototype.presentSelf = function() {
      this.showGistForm();
      atom.workspace.addTopPanel({
        item: this
      });
      return this.descriptionEditor.focus();
    };

    GistView.prototype.gistIt = function() {
      this.showProgressIndicator();
      this.gist.description = this.descriptionEditor.getText();
      return this.gist.post((function(_this) {
        return function(response) {
          atom.clipboard.write(response.html_url);
          if (atom.config.get('gist-it.openAfterCreate')) {
            shell.openExternal(response.html_url);
          }
          _this.showUrlDisplay();
          return setTimeout((function() {
            return _this.destroy();
          }), 1000);
        };
      })(this));
    };

    GistView.prototype.makePublic = function() {
      this.publicButton.addClass('selected');
      this.privateButton.removeClass('selected');
      return this.gist.isPublic = true;
    };

    GistView.prototype.makePrivate = function() {
      this.privateButton.addClass('selected');
      this.publicButton.removeClass('selected');
      return this.gist.isPublic = false;
    };

    GistView.prototype.showGistForm = function() {
      if (this.gist.isPublic) {
        this.makePublic();
      } else {
        this.makePrivate();
      }
      this.descriptionEditor.setText(this.gist.description);
      this.toolbar.show();
      this.gistForm.show();
      this.urlDisplay.hide();
      return this.progressIndicator.hide();
    };

    GistView.prototype.showProgressIndicator = function() {
      this.toolbar.hide();
      this.gistForm.hide();
      this.urlDisplay.hide();
      return this.progressIndicator.show();
    };

    GistView.prototype.showUrlDisplay = function() {
      this.toolbar.hide();
      this.gistForm.hide();
      this.urlDisplay.show();
      return this.progressIndicator.hide();
    };

    return GistView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXN0LWl0L2xpYi9naXN0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFlBQUEsSUFBakIsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxjQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUlBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQUpSLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxRQUFBLEVBQVUsQ0FBQSxDQUFWO0FBQUEsUUFBYyxPQUFBLEVBQU8sOEJBQXJCO09BQUwsRUFBMEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDeEQsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGFBQVA7V0FBTCxFQUEyQixTQUFBLEdBQUE7QUFDekIsWUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sZUFBUDthQUFMLEVBQTZCLFNBQUEsR0FBQTtBQUMzQixjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxnQkFBQSxNQUFBLEVBQVEsT0FBUjtlQUFOLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FB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

//# sourceURL=/Users/Rad/.atom/packages/gist-it/lib/gist-view.coffee
