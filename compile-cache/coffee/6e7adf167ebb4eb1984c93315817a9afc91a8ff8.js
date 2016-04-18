(function() {
  var Clipboard, CompositeDisposable, Gist, GistView, TextEditorView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), TextEditorView = _ref.TextEditorView, View = _ref.View;

  Clipboard = require('clipboard');

  CompositeDisposable = require('atom').CompositeDisposable;

  Gist = require('./gist-model');

  module.exports = GistView = (function(_super) {
    __extends(GistView, _super);

    function GistView() {
      return GistView.__super__.constructor.apply(this, arguments);
    }

    GistView.content = function() {
      return this.div({
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
      this.handleEvents();
      this.gist = null;
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
      this.disposables.dispose();
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
      this.disposables = new CompositeDisposable;
      return this.disposables.add(atom.commands.add('.gist-form atom-text-editor', {
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
    };

    GistView.prototype.gistCurrentFile = function() {
      var activeEditor;
      this.gist = new Gist();
      activeEditor = atom.workspace.getActiveTextEditor();
      this.gist.files[activeEditor.getTitle()] = {
        content: activeEditor.getText()
      };
      this.title.text("Gist Current File");
      return this.presentSelf();
    };

    GistView.prototype.gistSelection = function() {
      var activeEditor;
      this.gist = new Gist();
      activeEditor = atom.workspace.getActiveTextEditor();
      this.gist.files[activeEditor.getTitle()] = {
        content: activeEditor.getSelectedText()
      };
      this.title.text("Gist Selection");
      return this.presentSelf();
    };

    GistView.prototype.gistOpenBuffers = function() {
      var editor, _i, _len, _ref1;
      this.gist = new Gist();
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        this.gist.files[editor.getTitle()] = {
          content: editor.getText()
        };
      }
      this.title.text("Gist Open Buffers");
      return this.presentSelf();
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
          Clipboard.writeText(response.html_url);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFlBQUEsSUFBakIsQ0FBQTs7QUFBQSxFQUNBLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUixDQURaLENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFBLENBQVEsY0FBUixDQUpQLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sOEJBQVA7T0FBTCxFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMxQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sYUFBUDtXQUFMLEVBQTJCLFNBQUEsR0FBQTtBQUN6QixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxlQUFQO2FBQUwsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLGNBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxPQUFSO2VBQU4sQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sd0JBQVA7QUFBQSxnQkFBaUMsTUFBQSxFQUFRLFNBQXpDO2VBQUwsRUFBeUQsU0FBQSxHQUFBO3VCQUN2RCxLQUFDLENBQUEsR0FBRCxD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
//# sourceURL=/Users/Rad/.atom/packages/gist-it/lib/gist-view.coffee