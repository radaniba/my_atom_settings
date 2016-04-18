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
      var display_name, html, questionHeader, question_id, title, toggleBtn;
      title = $('<div/>').html(question['title']).text();
      display_name = $('<textarea />').html(question['owner'].display_name).text();
      question_id = question['question_id'];
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
                id: "question-link-" + question_id,
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
                href: question['owner'].link,
                id: "question-author-link-" + question_id
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
      this.addCodeButtons("question-" + quesId, quesId, 'question');
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
      var answerHtml, answer_id, display_name;
      display_name = $('<textarea/>').html(answer['owner'].display_name).text();
      answer_id = answer['answer_id'];
      answerHtml = $$$(function() {
        return this.div((function(_this) {
          return function() {
            _this.a({
              href: answer['link'],
              id: "answer-link-" + answer_id
            }, function() {
              return _this.span({
                "class": 'answer-link',
                title: 'Open in browser'
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
                href: answer['owner'].link,
                id: "answer-author-link-" + answer_id
              }, display_name);
            });
          };
        })(this));
      });
      $("#answers-" + question_id).append($(answerHtml).append(answer['body']));
      this.highlightCode("answers-" + question_id);
      return this.addCodeButtons("answers-" + question_id, answer_id, 'answer');
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

    AskStackResultView.prototype.addCodeButtons = function(elem_id, id, id_type) {
      var btnInsert, pre, pres, _i, _len, _results;
      pres = this.resultsView.find("#" + elem_id).find('pre');
      _results = [];
      for (_i = 0, _len = pres.length; _i < _len; _i++) {
        pre = pres[_i];
        btnInsert = this.genCodeButton('Insert', id, id_type);
        _results.push($(pre).prev().after(btnInsert));
      }
      return _results;
    };

    AskStackResultView.prototype.genCodeButton = function(type, id, id_type) {
      var btn;
      btn = $('<button/>', {
        text: type,
        "class": 'btn btn-default btn-xs'
      });
      if (type === 'Insert') {
        $(btn).click(function(event) {
          var author_name, author_src, code, editor, source_src;
          code = $(this).next('pre').text();
          if (code !== void 0) {
            atom.workspace.activatePreviousPane();
            editor = atom.workspace.getActivePaneItem();
            if (id !== void 0) {
              author_src = $("#" + id_type + "-author-link-" + id).attr('href');
              author_name = $("#" + id_type + "-author-link-" + id).html();
              source_src = $("#" + id_type + "-link-" + id).attr('href');
              return editor.transact((function(_this) {
                return function() {
                  editor.insertText("Author: " + author_name + " - " + author_src, {
                    select: true
                  });
                  editor.toggleLineCommentsInSelection();
                  editor.insertNewlineBelow();
                  editor.insertText("Source: " + source_src, {
                    select: true
                  });
                  editor.toggleLineCommentsInSelection();
                  editor.insertNewlineBelow();
                  return editor.insertText(code);
                };
              })(this));
            } else {
              return editor.insertText(code);
            }
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
