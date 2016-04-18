(function() {
  var AskStack, AskStackApiClient, AskStackResultView, AskStackView, CompositeDisposable, TextEditorView, View, url, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  url = require('url');

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ref = require('atom-space-pen-views'), TextEditorView = _ref.TextEditorView, View = _ref.View;

  AskStack = require('./ask-stack');

  AskStackApiClient = require('./ask-stack-api-client');

  AskStackResultView = require('./ask-stack-result-view');

  module.exports = AskStackView = (function(_super) {
    __extends(AskStackView, _super);

    function AskStackView() {
      return AskStackView.__super__.constructor.apply(this, arguments);
    }

    AskStackView.content = function() {
      return this.div({
        "class": 'ask-stack overlay from-top padded'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'inset-panel'
          }, function() {
            _this.div({
              "class": 'panel-heading'
            }, function() {
              return _this.span('Ask Stack Overflow');
            });
            return _this.div({
              "class": 'panel-body padded'
            }, function() {
              _this.div(function() {
                _this.subview('questionField', new TextEditorView({
                  mini: true,
                  placeholderText: 'Question (eg. Sort array)'
                }));
                _this.subview('tagsField', new TextEditorView({
                  mini: true,
                  placeholderText: 'Language / Tags (eg. Ruby;Rails)'
                }));
                _this.div({
                  "class": 'pull-right'
                }, function() {
                  _this.br();
                  return _this.button({
                    outlet: 'askButton',
                    "class": 'btn btn-primary'
                  }, ' Ask! ');
                });
                return _this.div({
                  "class": 'pull-left'
                }, function() {
                  _this.br();
                  _this.label('Sort by:');
                  _this.br();
                  _this.label({
                    "for": 'relevance',
                    "class": 'radio-label'
                  }, 'Relevance: ');
                  _this.input({
                    outlet: 'sortByRelevance',
                    id: 'relevance',
                    type: 'radio',
                    name: 'sort_by',
                    value: 'relevance',
                    checked: 'checked'
                  });
                  _this.label({
                    "for": 'votes',
                    "class": 'radio-label last'
                  }, 'Votes: ');
                  return _this.input({
                    outlet: 'sortByVote',
                    id: 'votes',
                    type: 'radio',
                    name: 'sort_by',
                    value: 'votes'
                  });
                });
              });
              return _this.div({
                outlet: 'progressIndicator'
              }, function() {
                return _this.span({
                  "class": 'loading loading-spinner-medium'
                });
              });
            });
          });
        };
      })(this));
    };

    AskStackView.prototype.initialize = function(serializeState) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', 'ask-stack:ask-question', (function(_this) {
        return function() {
          return _this.presentPanel();
        };
      })(this)));
      this.handleEvents();
      this.autoDetectObserveSubscription = atom.config.observe('ask-stack.autoDetectLanguage', (function(_this) {
        return function(autoDetect) {
          if (!autoDetect) {
            return _this.tagsField.setText("");
          }
        };
      })(this));
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, _ref1;
        try {
          _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host, pathname = _ref1.pathname;
        } catch (_error) {
          error = _error;
          return;
        }
        if (protocol !== 'ask-stack:') {
          return;
        }
        return new AskStackResultView();
      });
    };

    AskStackView.prototype.serialize = function() {};

    AskStackView.prototype.destroy = function() {
      this.hideView();
      return this.detach();
    };

    AskStackView.prototype.hideView = function() {
      this.panel.hide();
      return this.focusout();
    };

    AskStackView.prototype.onDidChangeTitle = function() {};

    AskStackView.prototype.onDidChangeModified = function() {};

    AskStackView.prototype.handleEvents = function() {
      this.askButton.on('click', (function(_this) {
        return function() {
          return _this.askStackRequest();
        };
      })(this));
      this.subscriptions.add(atom.commands.add(this.questionField.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.askStackRequest();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.hideView();
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add(this.tagsField.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.askStackRequest();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.hideView();
          };
        })(this)
      }));
    };

    AskStackView.prototype.presentPanel = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: true
        });
      }
      this.panel.show();
      this.progressIndicator.hide();
      this.questionField.focus();
      if (atom.config.get('ask-stack.autoDetectLanguage')) {
        return this.setLanguageField();
      }
    };

    AskStackView.prototype.askStackRequest = function() {
      this.progressIndicator.show();
      AskStackApiClient.resetInputs();
      AskStackApiClient.question = this.questionField.getText();
      AskStackApiClient.tag = this.tagsField.getText();
      AskStackApiClient.sort_by = this.sortByVote.is(':checked') ? 'votes' : 'relevance';
      return AskStackApiClient.search((function(_this) {
        return function(response) {
          _this.progressIndicator.hide();
          _this.hideView();
          if (response === null) {
            return alert('Encountered a problem with the Stack Exchange API');
          } else {
            return _this.showResults(response);
          }
        };
      })(this));
    };

    AskStackView.prototype.showResults = function(answersJson) {
      var uri;
      uri = 'ask-stack://result-view';
      return atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).then(function(askStackResultView) {
        if (askStackResultView instanceof AskStackResultView) {
          askStackResultView.renderAnswers(answersJson);
          return atom.workspace.activatePreviousPane();
        }
      });
    };

    AskStackView.prototype.setLanguageField = function() {
      var lang;
      lang = this.getCurrentLanguage();
      if (lang === null || lang === 'Null Grammar') {
        return;
      }
      return this.tagsField.setText(lang);
    };

    AskStackView.prototype.getCurrentLanguage = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor === void 0) {
        return null;
      } else {
        return editor.getGrammar().name;
      }
    };

    return AskStackView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svbGliL2Fzay1zdGFjay12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtSEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsV0FBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBR0EsT0FBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsc0JBQUEsY0FBRCxFQUFpQixZQUFBLElBSGpCLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSLENBTnBCLENBQUE7O0FBQUEsRUFPQSxrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVIsQ0FQckIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxtQ0FBUDtPQUFMLEVBQWlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQy9DLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxhQUFQO1dBQUwsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLGVBQVA7YUFBTCxFQUE2QixTQUFBLEdBQUE7cUJBQzNCLEtBQUMsQ0FBQSxJQUFELENBQU0sb0JBQU4sRUFE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

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/lib/ask-stack-view.coffee
