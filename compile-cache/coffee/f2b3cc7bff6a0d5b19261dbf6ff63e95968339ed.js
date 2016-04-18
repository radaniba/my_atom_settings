(function() {
  var $, $$$, AskStackApiClient, AskStackResultView, ScrollView, hljs, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$$ = _ref.$$$, ScrollView = _ref.ScrollView;

  AskStackApiClient = require('./ask-stack-api-client');

  hljs = require('highlight.js');

  window.jQuery = $;

  require('./vendor/bootstrap.min.js');

  module.exports = AskStackResultView = (function(_super) {
    __extends(AskStackResultView, _super);

    function AskStackResultView() {
      return AskStackResultView.__super__.constructor.apply(this, arguments);
    }

    AskStackResultView.content = function() {
      return this.div({
        "class": 'ask-stack-result native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            id: 'results-view',
            outlet: 'resultsView'
          });
          _this.div({
            id: 'load-more',
            "class": 'load-more',
            click: 'loadMoreResults',
            outlet: 'loadMore'
          }, function() {
            return _this.a({
              href: '#loadmore'
            }, function() {
              return _this.span('Load More...');
            });
          });
          return _this.div({
            id: 'progressIndicator',
            "class": 'progressIndicator',
            outlet: 'progressIndicator'
          }, function() {
            return _this.span({
              "class": 'loading loading-spinner-medium'
            });
          });
        };
      })(this));
    };

    AskStackResultView.prototype.initialize = function() {
      return AskStackResultView.__super__.initialize.apply(this, arguments);
    };

    AskStackResultView.prototype.getTitle = function() {
      return 'Ask Stack Results';
    };

    AskStackResultView.prototype.getURI = function() {
      return 'ask-stack://result-view';
    };

    AskStackResultView.prototype.getIconName = function() {
      return 'three-bars';
    };

    AskStackResultView.prototype.onDidChangeTitle = function() {};

    AskStackResultView.prototype.onDidChangeModified = function() {};

    AskStackResultView.prototype.handleEvents = function() {
      this.subscribe(this, 'core:move-up', (function(_this) {
        return function() {
          return _this.scrollUp();
        };
      })(this));
      return this.subscribe(this, 'core:move-down', (function(_this) {
        return function() {
          return _this.scrollDown();
        };
      })(this));
    };

    AskStackResultView.prototype.renderAnswers = function(answersJson, loadMore) {
      var question, _i, _j, _len, _len1, _ref1, _ref2, _results;
      if (loadMore == null) {
        loadMore = false;
      }
      this.answersJson = answersJson;
      if (!loadMore) {
        this.resultsView.html('');
      }
      if (answersJson['items'].length === 0) {
        return this.html('<br><center>Your search returned no matches.</center>');
      } else {
        _ref1 = answersJson['items'];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          question = _ref1[_i];
          this.renderQuestionHeader(question);
        }
        _ref2 = answersJson['items'];
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          question = _ref2[_j];
          _results.push(this.renderQuestionBody(question));
        }
        return _results;
      }
    };

    AskStackResultView.prototype.renderQuestionHeader = function(question) {
      var display_name, html, questionHeader, title, toggleBtn;
      title = $('<div/>').html(question['title']).text();
      display_name = $('<textarea />').html(question['owner'].display_name).text();
      questionHeader = $$$(function() {
        return this.div({
          id: question['question_id'],
          "class": 'ui-result'
        }, (function(_this) {
          return function() {
            _this.h2({
              "class": 'title'
            }, function() {
              _this.a({
                href: question['link'],
                "class": 'underline title-string'
              }, title);
              _this.div({
                "class": 'score',
                title: question['score'] + ' Votes'
              }, function() {
                return _this.p(question['score']);
              });
              _this.div({
                "class": 'answers',
                title: question['answer_count'] + ' Answers'
              }, function() {
                return _this.p(question['answer_count']);
              });
              return _this.div({
                "class": 'is-accepted'
              }, function() {
                if (question['accepted_answer_id']) {
                  return _this.p({
                    "class": 'icon icon-check',
                    title: 'This question has an accepted answer'
                  });
                }
              });
            });
            _this.div({
              "class": 'created'
            }, function() {
              _this.text(new Date(question['creation_date'] * 1000).toLocaleString());
              _this.text(' - asked by ');
              return _this.a({
                href: question['owner'].link
              }, display_name);
            });
            _this.div({
              "class": 'tags'
            }, function() {
              var tag, _i, _len, _ref1, _results;
              _ref1 = question['tags'];
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                tag = _ref1[_i];
                _this.span({
                  "class": 'label label-info'
                }, tag);
                _results.push(_this.text('\n'));
              }
              return _results;
            });
            return _this.div({
              "class": 'collapse-button'
            });
          };
        })(this));
      });
      toggleBtn = $('<button></button>', {
        id: "toggle-" + question['question_id'],
        type: 'button',
        "class": 'btn btn-info btn-xs',
        text: 'Show More'
      });
      toggleBtn.attr('data-toggle', 'collapse');
      toggleBtn.attr('data-target', "#question-body-" + question['question_id']);
      html = $(questionHeader).find('.collapse-button').append(toggleBtn).parent();
      return this.resultsView.append(html);
    };

    AskStackResultView.prototype.renderQuestionBody = function(question) {
      var answer_tab, curAnswer, div, quesId;
      curAnswer = 0;
      quesId = question['question_id'];
      if (question['answer_count'] > 0) {
        answer_tab = "<a href='#prev" + quesId + "'><< Prev</a>   <span id='curAnswer-" + quesId + "'>" + (curAnswer + 1) + "</span>/" + question['answers'].length + "  <a href='#next" + quesId + "'>Next >></a> ";
      } else {
        answer_tab = "<br><b>This question has not been answered.</b>";
      }
      div = $('<div></div>', {
        id: "question-body-" + question['question_id'],
        "class": "collapse hidden"
      });
      div.html("<ul class='nav nav-tabs nav-justified'> <li class='active'><a href='#question-" + quesId + "' data-toggle='tab'>Question</a></li> <li><a href='#answers-" + quesId + "' data-toggle='tab'>Answers</a></li> </ul> <div id='question-body-" + question['question_id'] + "-nav' class='tab-content hidden'> <div class='tab-pane active' id='question-" + quesId + "'>" + question['body'] + "</div> <div class='tab-pane answer-navigation' id='answers-" + quesId + "'> <center>" + answer_tab + "</center> </div> </div>");
      $("#" + quesId).append(div);
      this.highlightCode("question-" + quesId);
      this.addCodeButtons("question-" + quesId);
      if (question['answer_count'] > 0) {
        this.renderAnswerBody(question['answers'][curAnswer], quesId);
        this.setupNavigation(question, curAnswer);
      }
      return $("#toggle-" + quesId).click(function(event) {
        var btn;
        btn = $(this);
        if ($("#question-body-" + quesId).hasClass('in')) {
          $("#question-body-" + quesId).addClass('hidden');
          $("#question-body-" + quesId + "-nav").addClass('hidden');
          btn.parents("#" + quesId).append(btn.parent());
          return $(this).text('Show More');
        } else {
          $("#question-body-" + quesId).removeClass('hidden');
          $("#question-body-" + quesId + "-nav").removeClass('hidden');
          btn.parent().siblings("#question-body-" + quesId).append(btn.parent());
          return btn.text('Show Less');
        }
      });
    };

    AskStackResultView.prototype.renderAnswerBody = function(answer, question_id) {
      var answerHtml, display_name;
      display_name = $('<textarea/>').html(answer['owner'].display_name).text();
      answerHtml = $$$(function() {
        return this.div((function(_this) {
          return function() {
            _this.a({
              href: answer['link']
            }, function() {
              return _this.span({
                "class": 'answer-link'
              }, '➚');
            });
            if (answer['is_accepted']) {
              _this.span({
                "class": 'label label-success'
              }, 'Accepted');
            }
            _this.div({
              "class": 'score answer',
              title: answer['score'] + ' Votes'
            }, function() {
              return _this.p(answer['score']);
            });
            _this.div({
              "class": 'score is-accepted'
            }, function() {
              if (answer['is_accepted']) {
                return _this.p({
                  "class": 'icon icon-check',
                  title: 'Accepted answer'
                });
              }
            });
            return _this.div({
              "class": 'created'
            }, function() {
              _this.text(new Date(answer['creation_date'] * 1000).toLocaleString());
              _this.text(' - answered by ');
              return _this.a({
                href: answer['owner'].link
              }, display_name);
            });
          };
        })(this));
      });
      $("#answers-" + question_id).append($(answerHtml).append(answer['body']));
      this.highlightCode("answers-" + question_id);
      return this.addCodeButtons("answers-" + question_id);
    };

    AskStackResultView.prototype.highlightCode = function(elem_id) {
      var code, codeHl, pre, pres, _i, _len, _results;
      pres = this.resultsView.find("#" + elem_id).find('pre');
      _results = [];
      for (_i = 0, _len = pres.length; _i < _len; _i++) {
        pre = pres[_i];
        code = $(pre).children('code').first();
        if (code !== void 0) {
          codeHl = hljs.highlightAuto(code.text()).value;
          _results.push(code.html(codeHl));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AskStackResultView.prototype.addCodeButtons = function(elem_id) {
      var btnInsert, pre, pres, _i, _len, _results;
      pres = this.resultsView.find("#" + elem_id).find('pre');
      _results = [];
      for (_i = 0, _len = pres.length; _i < _len; _i++) {
        pre = pres[_i];
        btnInsert = this.genCodeButton('Insert');
        _results.push($(pre).prev().after(btnInsert));
      }
      return _results;
    };

    AskStackResultView.prototype.genCodeButton = function(type) {
      var btn;
      btn = $('<button/>', {
        text: type,
        "class": 'btn btn-default btn-xs'
      });
      if (type === 'Insert') {
        $(btn).click(function(event) {
          var code, editor;
          code = $(this).next('pre').text();
          if (code !== void 0) {
            atom.workspace.activatePreviousPane();
            editor = atom.workspace.getActivePaneItem();
            return editor.insertText(code);
          }
        });
      }
      return btn;
    };

    AskStackResultView.prototype.loadMoreResults = function() {
      if (this.answersJson['has_more']) {
        this.progressIndicator.show();
        this.loadMore.hide();
        AskStackApiClient.page = AskStackApiClient.page + 1;
        return AskStackApiClient.search((function(_this) {
          return function(response) {
            _this.loadMore.show();
            _this.progressIndicator.hide();
            return _this.renderAnswers(response, true);
          };
        })(this));
      } else {
        return $('#load-more').children().children('span').text('No more results to load.');
      }
    };

    AskStackResultView.prototype.setupNavigation = function(question, curAnswer) {
      var quesId;
      quesId = question['question_id'];
      $("a[href='#next" + quesId + "']").click((function(_this) {
        return function(event) {
          if (curAnswer + 1 >= question['answers'].length) {
            curAnswer = 0;
          } else {
            curAnswer += 1;
          }
          $("#answers-" + quesId).children().last().remove();
          $("#curAnswer-" + quesId)[0].innerText = curAnswer + 1;
          return _this.renderAnswerBody(question['answers'][curAnswer], quesId);
        };
      })(this));
      return $("a[href='#prev" + quesId + "']").click((function(_this) {
        return function(event) {
          if (curAnswer - 1 < 0) {
            curAnswer = question['answers'].length - 1;
          } else {
            curAnswer -= 1;
          }
          $("#answers-" + quesId).children().last().remove();
          $("#curAnswer-" + quesId)[0].innerText = curAnswer + 1;
          return _this.renderAnswerBody(question['answers'][curAnswer], quesId);
        };
      })(this));
    };

    return AskStackResultView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svbGliL2Fzay1zdGFjay1yZXN1bHQtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBQVQsQ0FBQTs7QUFBQSxFQUNBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQURwQixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxjQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBSmhCLENBQUE7O0FBQUEsRUFLQSxPQUFBLENBQVEsMkJBQVIsQ0FMQSxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGtCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxzQ0FBUDtBQUFBLFFBQStDLFFBQUEsRUFBVSxDQUFBLENBQXpEO09BQUwsRUFBa0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNoRSxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLEVBQUEsRUFBSSxjQUFKO0FBQUEsWUFBb0IsTUFBQSxFQUFRLGFBQTVCO1dBQUwsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxFQUFBLEVBQUksV0FBSjtBQUFBLFlBQWlCLE9BQUEsRUFBTyxXQUF4QjtBQUFBLFlBQXFDLEtBQUEsRUFB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

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/lib/ask-stack-result-view.coffee
