(function() {
  var $$, GitLogView, InfoPanelView, MainPanelView, ScrollView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, ScrollView = ref.ScrollView, View = ref.View;

  module.exports = GitLogView = (function(superClass) {
    extend(GitLogView, superClass);

    GitLogView.content = function() {
      return this.div({
        "class": 'git-log',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.subview('main_panel', new MainPanelView);
          return _this.subview('info_panel', new InfoPanelView);
        };
      })(this));
    };

    function GitLogView() {
      GitLogView.__super__.constructor.apply(this, arguments);
    }

    return GitLogView;

  })(View);

  MainPanelView = (function(superClass) {
    extend(MainPanelView, superClass);

    function MainPanelView() {
      return MainPanelView.__super__.constructor.apply(this, arguments);
    }

    MainPanelView.content = function() {
      return this.div({
        "class": 'main panels',
        cellpadding: 0,
        cellspacing: 0,
        border: 0,
        outlet: 'main_panel'
      }, (function(_this) {
        return function() {
          return _this.table(function() {
            _this.div({
              "class": 'graph',
              outlet: 'graph'
            });
            _this.thead(function() {
              return _this.tr(function() {
                _this.th({
                  "class": 'graph-col'
                }, function() {
                  return _this.p('Graph');
                });
                _this.th({
                  "class": 'comments',
                  outlet: 'comments'
                }, function() {
                  return _this.p('Description');
                });
                _this.th({
                  "class": 'commit',
                  outlet: 'commit'
                }, function() {
                  return _this.p('Commit');
                });
                _this.th({
                  "class": 'date',
                  outlet: 'date'
                }, function() {
                  return _this.p('Date');
                });
                return _this.th({
                  "class": 'author',
                  outlet: 'author'
                }, function() {
                  return _this.p('Author');
                });
              });
            });
            return _this.tbody({
              outlet: 'body'
            });
          });
        };
      })(this));
    };

    MainPanelView.prototype.initialize = function() {
      return MainPanelView.__super__.initialize.apply(this, arguments);
    };

    return MainPanelView;

  })(ScrollView);

  InfoPanelView = (function(superClass) {
    extend(InfoPanelView, superClass);

    function InfoPanelView() {
      return InfoPanelView.__super__.constructor.apply(this, arguments);
    }

    InfoPanelView.content = function() {
      return this.div({
        "class": 'info panels'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info-data',
            outlet: 'info_data'
          });
          _this.div({
            "class": 'info-image',
            outlet: 'info_image'
          });
          return _this.div({
            "class": 'info-file',
            outlet: 'info_file'
          }, function() {
            return _this.table(function() {
              _this.thead(function() {
                return _this.tr(function() {
                  _this.th({
                    "class": 'stat',
                    outlet: 'status'
                  }, function() {
                    return _this.p('Status');
                  });
                  _this.th({
                    "class": 'file',
                    outlet: 'name'
                  }, function() {
                    return _this.p('Filename');
                  });
                  _this.th({
                    "class": 'path',
                    outlet: 'path'
                  }, function() {
                    return _this.p('Path');
                  });
                  _this.th({
                    "class": 'add',
                    outlet: 'addition'
                  }, function() {
                    return _this.p('Addition');
                  });
                  return _this.th({
                    "class": 'del',
                    outlet: 'deletion'
                  }, function() {
                    return _this.p('Deletion');
                  });
                });
              });
              return _this.tbody({
                outlet: 'body'
              });
            });
          });
        };
      })(this));
    };

    InfoPanelView.prototype.add_content = function(head, content) {
      return this.info_data.append($$(function() {
        return this.h2((function(_this) {
          return function() {
            _this.text(head);
            return _this.span(content);
          };
        })(this));
      }));
    };

    return InfoPanelView;

  })(ScrollView);


  /*
  class MainPanelView extends ScrollView
      @content:->
          @div class: 'main panels', =>
                  @subview 'graph', new ColumnView('Graph', 'graph')
                  @div class: 'table', outlet: 'table', =>
                      @subview 'comments', new ColumnView('Description', 'comments', true)
                      @subview 'commit', new ColumnView('Commit', 'commit', true)
                      @subview 'date', new ColumnView('Date', 'date', true)
                      @subview 'author', new ColumnView('Author', 'author')
  
  
  class InfoPanelView extends ScrollView
      @content: ->
          @div class: 'info panels', =>
              @div class: 'info-data', outlet: 'info_data'
              @div class: 'info-image', outlet: 'info_image'
              @div class:'info-file', outlet: 'info_file', =>
                  @subview 'status', new ColumnView('Status', 'status')
                  @subview 'name', new ColumnView('Filename', 'file')
                  @subview 'path', new ColumnView('Path', 'path')
                  @subview 'addition', new ColumnView('Addition', 'add')
                  @subview 'deletion', new ColumnView('Deletion', 'del')
  
      add_content: (head, content) ->
          @info_data.append $$ ->
              @h2 =>
                  @text head
                  @span content
  
  
  class ColumnView extends View
      @content: (title, class_name, resizable) ->
          @div class: 'column ' + class_name, =>
              @div class: 'list-head', =>
                  @h2 title
                  @div class:'resize-handle' if resizable
              @div class: 'list', outlet: 'list'
  
      add_content: (content) ->
          @list.append $$ ->
              @p =>
                  @span content
   */

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtbG9nL2xpYi9naXQtbG9nLWNsYXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUVBQUE7SUFBQTs7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsV0FBRCxFQUFLLDJCQUFMLEVBQWlCOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7SUFDRixVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDTixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1FBQWtCLFFBQUEsRUFBVSxDQUFDLENBQTdCO09BQUwsRUFBcUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2pDLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixJQUFJLGFBQTNCO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixJQUFJLGFBQTNCO1FBRmlDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztJQURNOztJQUtHLG9CQUFBO01BQ1QsNkNBQUEsU0FBQTtJQURTOzs7O0tBTlE7O0VBVW5COzs7Ozs7O0lBQ0YsYUFBQyxDQUFBLE9BQUQsR0FBUyxTQUFBO2FBQ0wsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtRQUFxQixXQUFBLEVBQWEsQ0FBbEM7UUFBcUMsV0FBQSxFQUFhLENBQWxEO1FBQXFELE1BQUEsRUFBUSxDQUE3RDtRQUFnRSxNQUFBLEVBQVEsWUFBeEU7T0FBTCxFQUEyRixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3ZGLEtBQUMsQ0FBQSxLQUFELENBQU8sU0FBQTtZQUNILEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7Y0FBZ0IsTUFBQSxF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QUE7MkJBQy9CLEtBQUMsQ0FBQSxDQUFELENBQUcsTUFBSDtrQkFEK0IsQ0FBbkM7a0JBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLEtBQVA7b0JBQWMsTUFBQSxFQUFRLFVBQXRCO21CQUFKLEVBQXVDLFNBQUE7MkJBQ25DLEtBQUMsQ0FBQSxDQUFELENBQUcsVUFBSDtrQkFEbUMsQ0FBdkM7eUJBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLEtBQVA7b0JBQWMsTUFBQSxFQUFRLFVBQXRCO21CQUFKLEVBQXVDLFNBQUE7MkJBQ25DLEtBQUMsQ0FBQSxDQUFELENBQUcsVUFBSDtrQkFEbUMsQ0FBdkM7Z0JBVEEsQ0FBSjtjQURHLENBQVA7cUJBWUEsS0FBQyxDQUFBLEtBQUQsQ0FBTztnQkFBQSxNQUFBLEVBQVEsTUFBUjtlQUFQO1lBYkcsQ0FBUDtVQUQwQyxDQUE5QztRQUh1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0I7SUFETTs7NEJBb0JWLFdBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxPQUFQO2FBQ1QsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLEVBQUEsQ0FBRyxTQUFBO2VBQ2pCLElBQUMsQ0FBQSxFQUFELENBQUksQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLE9BQU47VUFGQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSjtNQURpQixDQUFILENBQWxCO0lBRFM7Ozs7S0FyQlc7OztBQTJCNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaEVBIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTY3JvbGxWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEdpdExvZ1ZpZXcgZXh0ZW5kcyBWaWV3XG4gICAgQGNvbnRlbnQ6IC0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdnaXQtbG9nJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgICAgICAgQHN1YnZpZXcgJ21haW5fcGFuZWwnLCBuZXcgTWFpblBhbmVsVmlld1xuICAgICAgICAgICAgQHN1YnZpZXcgJ2luZm9fcGFuZWwnLCBuZXcgSW5mb1BhbmVsVmlld1xuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyXG5cblxuY2xhc3MgTWFpblBhbmVsVmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgICBAY29udGVudDotPlxuICAgICAgICBAZGl2IGNsYXNzOiAnbWFpbiBwYW5lbHMnLGNlbGxwYWRkaW5nOiAwLCBjZWxsc3BhY2luZzogMCwgYm9yZGVyOiAwLCBvdXRsZXQ6ICdtYWluX3BhbmVsJywgPT5cbiAgICAgICAgICAgIEB0YWJsZSA9PlxuICAgICAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdncmFwaCcsIG91dGxldDogJ2dyYXBoJ1xuICAgICAgICAgICAgICAgIEB0aGVhZCA9PlxuICAgICAgICAgICAgICAgICAgICBAdHIgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEB0aCBjbGFzczogJ2dyYXBoLWNvbCcsID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHAgJ0dyYXBoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHRoIGNsYXNzOiAnY29tbWVudHMnLCBvdXRsZXQ6ICdjb21tZW50cycsID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHAgJ0Rlc2NyaXB0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHRoIGNsYXNzOiAnY29tbWl0Jywgb3V0bGV0OiAnY29tbWl0JywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAcCAnQ29tbWl0J1xuICAgICAgICAgICAgICAgICAgICAgICAgQHRoIGNsYXNzOiAnZGF0ZScsIG91dGxldDogJ2RhdGUnLCAgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAcCAnRGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB0aCBjbGFzczogJ2F1dGhvcicsIG91dGxldDogJ2F1dGhvcicsICA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBwICdBdXRob3InXG4gICAgICAgICAgICAgICAgQHRib2R5IG91dGxldDogJ2JvZHknXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlclxuXG5cbmNsYXNzIEluZm9QYW5lbFZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gICAgQGNvbnRlbnQ6IC0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdpbmZvIHBhbmVscycsID0+XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnaW5mby1kYXRhJywgb3V0bGV0OiAnaW5mb19kYXRhJ1xuICAgICAgICAgICAgQGRpdiBjbGFzczogJ2luZm8taW1hZ2UnLCBvdXRsZXQ6ICdpbmZvX2ltYWdlJ1xuICAgICAgICAgICAgQGRpdiBjbGFzczogJ2luZm8tZmlsZScsIG91dGxldDogJ2luZm9fZmlsZScsID0+XG4gICAgICAgICAgICAgICAgQHRhYmxlID0+XG4gICAgICAgICAgICAgICAgICAgIEB0aGVhZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQHRyID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHRoIGNsYXNzOiAnc3RhdCcsIG91dGxldDonc3RhdHVzJywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQHAgJ1N0YXR1cydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdGggY2xhc3M6ICdmaWxlJywgb3V0bGV0OiAnbmFtZScsID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBwICdGaWxlbmFtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdGggY2xhc3M6ICdwYXRoJywgb3V0bGV0OiAncGF0aCcsID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBwICdQYXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB0aCBjbGFzczogJ2FkZCcsIG91dGxldDogJ2FkZGl0aW9uJywgID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBwICdBZGRpdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdGggY2xhc3M6ICdkZWwnLCBvdXRsZXQ6ICdkZWxldGlvbicsICA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAcCAnRGVsZXRpb24nXG4gICAgICAgICAgICAgICAgICAgIEB0Ym9keSBvdXRsZXQ6ICdib2R5J1xuXG4gICAgYWRkX2NvbnRlbnQ6IChoZWFkLCBjb250ZW50KSAtPlxuICAgICAgICBAaW5mb19kYXRhLmFwcGVuZCAkJCAtPlxuICAgICAgICAgICAgQGgyID0+XG4gICAgICAgICAgICAgICAgQHRleHQgaGVhZFxuICAgICAgICAgICAgICAgIEBzcGFuIGNvbnRlbnRcblxuIyMjXG5jbGFzcyBNYWluUGFuZWxWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICAgIEBjb250ZW50Oi0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdtYWluIHBhbmVscycsID0+XG4gICAgICAgICAgICAgICAgQHN1YnZpZXcgJ2dyYXBoJywgbmV3IENvbHVtblZpZXcoJ0dyYXBoJywgJ2dyYXBoJylcbiAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAndGFibGUnLCBvdXRsZXQ6ICd0YWJsZScsID0+XG4gICAgICAgICAgICAgICAgICAgIEBzdWJ2aWV3ICdjb21tZW50cycsIG5ldyBDb2x1bW5WaWV3KCdEZXNjcmlwdGlvbicsICdjb21tZW50cycsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIEBzdWJ2aWV3ICdjb21taXQnLCBuZXcgQ29sdW1uVmlldygnQ29tbWl0JywgJ2NvbW1pdCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIEBzdWJ2aWV3ICdkYXRlJywgbmV3IENvbHVtblZpZXcoJ0RhdGUnLCAnZGF0ZScsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIEBzdWJ2aWV3ICdhdXRob3InLCBuZXcgQ29sdW1uVmlldygnQXV0aG9yJywgJ2F1dGhvcicpXG5cblxuY2xhc3MgSW5mb1BhbmVsVmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgICBAY29udGVudDogLT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2luZm8gcGFuZWxzJywgPT5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdpbmZvLWRhdGEnLCBvdXRsZXQ6ICdpbmZvX2RhdGEnXG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnaW5mby1pbWFnZScsIG91dGxldDogJ2luZm9faW1hZ2UnXG4gICAgICAgICAgICBAZGl2IGNsYXNzOidpbmZvLWZpbGUnLCBvdXRsZXQ6ICdpbmZvX2ZpbGUnLCA9PlxuICAgICAgICAgICAgICAgIEBzdWJ2aWV3ICdzdGF0dXMnLCBuZXcgQ29sdW1uVmlldygnU3RhdHVzJywgJ3N0YXR1cycpXG4gICAgICAgICAgICAgICAgQHN1YnZpZXcgJ25hbWUnLCBuZXcgQ29sdW1uVmlldygnRmlsZW5hbWUnLCAnZmlsZScpXG4gICAgICAgICAgICAgICAgQHN1YnZpZXcgJ3BhdGgnLCBuZXcgQ29sdW1uVmlldygnUGF0aCcsICdwYXRoJylcbiAgICAgICAgICAgICAgICBAc3VidmlldyAnYWRkaXRpb24nLCBuZXcgQ29sdW1uVmlldygnQWRkaXRpb24nLCAnYWRkJylcbiAgICAgICAgICAgICAgICBAc3VidmlldyAnZGVsZXRpb24nLCBuZXcgQ29sdW1uVmlldygnRGVsZXRpb24nLCAnZGVsJylcblxuICAgIGFkZF9jb250ZW50OiAoaGVhZCwgY29udGVudCkgLT5cbiAgICAgICAgQGluZm9fZGF0YS5hcHBlbmQgJCQgLT5cbiAgICAgICAgICAgIEBoMiA9PlxuICAgICAgICAgICAgICAgIEB0ZXh0IGhlYWRcbiAgICAgICAgICAgICAgICBAc3BhbiBjb250ZW50XG5cblxuY2xhc3MgQ29sdW1uVmlldyBleHRlbmRzIFZpZXdcbiAgICBAY29udGVudDogKHRpdGxlLCBjbGFzc19uYW1lLCByZXNpemFibGUpIC0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2x1bW4gJyArIGNsYXNzX25hbWUsID0+XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnbGlzdC1oZWFkJywgPT5cbiAgICAgICAgICAgICAgICBAaDIgdGl0bGVcbiAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOidyZXNpemUtaGFuZGxlJyBpZiByZXNpemFibGVcbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdsaXN0Jywgb3V0bGV0OiAnbGlzdCdcblxuICAgIGFkZF9jb250ZW50OiAoY29udGVudCkgLT5cbiAgICAgICAgQGxpc3QuYXBwZW5kICQkIC0+XG4gICAgICAgICAgICBAcCA9PlxuICAgICAgICAgICAgICAgIEBzcGFuIGNvbnRlbnRcbiMjI1xuIl19
