(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, NOT_GIT_ERRORS, View, _, moment, path, ref, str,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  path = require('path');

  _ = require('underscore-plus');

  str = require('bumble-strings');

  moment = require('moment');

  GitLog = require('git-log-utils');

  GitTimeplot = require('./git-timeplot');

  GitRevisionView = require('./git-revision-view');

  NOT_GIT_ERRORS = ['File not a git repository', 'is outside repository', "Not a git repository"];

  module.exports = GitTimeMachineView = (function() {
    function GitTimeMachineView(serializedState, options) {
      if (options == null) {
        options = {};
      }
      this._onEditorResize = bind(this._onEditorResize, this);
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
      this._bindWindowEvents();
    }

    GitTimeMachineView.prototype.setEditor = function(editor) {
      var file, ref1;
      if (editor === this.editor) {
        return;
      }
      file = editor != null ? editor.getPath() : void 0;
      if (!((file != null) && !str.startsWith(path.basename(file), GitRevisionView.FILE_PREFIX))) {
        return;
      }
      ref1 = [editor, file], this.editor = ref1[0], this.file = ref1[1];
      return this.render();
    };

    GitTimeMachineView.prototype.render = function() {
      var commits;
      commits = this.gitCommitHistory();
      if (!((this.file != null) && (commits != null))) {
        this._renderPlaceholder();
      } else {
        this.$element.text("");
        this._renderCloseHandle();
        this._renderStats(commits);
        this._renderTimeline(commits);
      }
      return this.$element;
    };

    GitTimeMachineView.prototype.serialize = function() {
      return null;
    };

    GitTimeMachineView.prototype.destroy = function() {
      this._unbindWindowEvents();
      return this.$element.remove();
    };

    GitTimeMachineView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.hide() : void 0;
    };

    GitTimeMachineView.prototype.show = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.show() : void 0;
    };

    GitTimeMachineView.prototype.getElement = function() {
      return this.$element.get(0);
    };

    GitTimeMachineView.prototype.gitCommitHistory = function(file) {
      var commits, e;
      if (file == null) {
        file = this.file;
      }
      if (file == null) {
        return null;
      }
      try {
        commits = GitLog.getCommitHistory(file);
      } catch (error) {
        e = error;
        if (e.message != null) {
          if (str.weaklyHas(e.message, NOT_GIT_ERRORS)) {
            console.warn(file + " not in a git repository");
            return null;
          }
        }
        atom.notifications.addError(String(e));
        console.error(e);
        return null;
      }
      return commits;
    };

    GitTimeMachineView.prototype._bindWindowEvents = function() {
      return $(window).on('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._unbindWindowEvents = function() {
      return $(window).off('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._renderPlaceholder = function() {
      this.$element.html("<div class='placeholder'>Select a file in the git repo to see timeline</div>");
    };

    GitTimeMachineView.prototype._renderCloseHandle = function() {
      var $closeHandle;
      $closeHandle = $("<div class='close-handle'>X</div>");
      this.$element.append($closeHandle);
      return $closeHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "git-time-machine:toggle");
      });
    };

    GitTimeMachineView.prototype._renderTimeline = function(commits) {
      this.timeplot || (this.timeplot = new GitTimeplot(this.$element));
      this.timeplot.render(this.editor, commits);
    };

    GitTimeMachineView.prototype._renderStats = function(commits) {
      var authorCount, byAuthor, content, durationInMs, timeSpan;
      content = "";
      if (commits.length > 0) {
        byAuthor = _.indexBy(commits, 'authorName');
        authorCount = _.keys(byAuthor).length;
        durationInMs = moment.unix(commits[commits.length - 1].authorDate).diff(moment.unix(commits[0].authorDate));
        timeSpan = moment.duration(durationInMs).humanize();
        content = "<span class='total-commits'>" + commits.length + "</span> commits by " + authorCount + " authors spanning " + timeSpan;
      }
      this.$element.append("<div class='stats'>\n  " + content + "\n</div>");
    };

    GitTimeMachineView.prototype._onEditorResize = function() {
      return this.render();
    };

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZS1tYWNoaW5lLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0R0FBQTtJQUFBOztFQUFBLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osR0FBQSxHQUFNLE9BQUEsQ0FBUSxnQkFBUjs7RUFDTixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBRVQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztFQUNULFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVI7O0VBRWxCLGNBQUEsR0FBaUIsQ0FBQywyQkFBRCxFQUE4Qix1QkFBOUIsRUFBdUQsc0JBQXZEOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsNEJBQUMsZUFBRCxFQUFrQixPQUFsQjs7UUFBa0IsVUFBUTs7O01BQ3JDLElBQUEsQ0FBdUQsSUFBQyxDQUFBLFFBQXhEO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFBLENBQUUsZ0NBQUYsRUFBWjs7TUFDQSxJQUFHLHNCQUFIO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxPQUFPLENBQUMsTUFBbkI7UUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRkY7O01BSUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFOVzs7aUNBU2IsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNULFVBQUE7TUFBQSxJQUFjLE1BQUEsS0FBVSxJQUFDLENBQUEsTUFBekI7QUFBQSxlQUFBOztNQUNBLElBQUEsb0JBQU8sTUFBTSxDQUFFLE9BQVIsQ0FBQTtNQUNQLElBQUEsQ0FBQSxDQUFjLGNBQUEsSUFBUyxDQUFDLEdBQUcsQ0FBQyxVQUFKLENBQWUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQWYsRUFBb0MsZUFBZSxDQUFDLFdBQXBELENBQXhCLENBQUE7QUFBQSxlQUFBOztNQUNBLE9BQW1CLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FBbkIsRUFBQyxJQUFDLENBQUEsZ0JBQUYsRUFBVSxJQUFDLENBQUE7YUFDWCxJQUFDLENBQUEsTUFBRCxDQUFBO0lBTFM7O2lDQVFYLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNWLElBQUEsQ0FBQSxDQUFPLG1CQUFBLElBQVUsaUJBQWpCLENBQUE7UUFDRSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLEVBQWY7UUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZDtRQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLEVBTkY7O0FBUUEsYUFBTyxJQUFDLENBQUE7SUFWRjs7aUNBY1IsU0FBQSxHQUFXLFNBQUE7QUFDVCxhQUFPO0lBREU7O2lDQUtYLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLG1CQUFELENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBQTtJQUZPOztpQ0FLVCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7a0RBQVMsQ0FBRSxJQUFYLENBQUE7SUFESTs7aUNBSU4sSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBO2tEQUFTLENBQUUsSUFBWCxDQUFBO0lBREk7O2lDQUlOLFVBQUEsR0FBWSxTQUFBO0FBQ1YsYUFBTyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxDQUFkO0lBREc7O2lDQUlaLGdCQUFBLEdBQWtCLFNBQUMsSUFBRDtBQUNoQixVQUFBOztRQURpQixPQUFLLElBQUMsQ0FBQTs7TUFDdkIsSUFBbUIsWUFBbkI7QUFBQSxlQUFPLEtBQVA7O0FBQ0E7UUFDRSxPQUFBLEdBQVUsTUFBTSxDQUFDLGdCQUFQLENBQXdCLElBQXhCLEVBRFo7T0FBQSxhQUFBO1FBRU07UUFDSixJQUFHLGlCQUFIO1VBQ0UsSUFBRyxHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBQyxPQUFoQixFQUF5QixjQUF6QixDQUFIO1lBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsSUFBRCxHQUFNLDBCQUFyQjtBQUNBLG1CQUFPLEtBRlQ7V0FERjs7UUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLE1BQUEsQ0FBTyxDQUFQLENBQTVCO1FBQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkO0FBQ0EsZUFBTyxLQVZUOztBQVlBLGFBQU87SUFkUzs7aUNBbUJsQixpQkFBQSxHQUFtQixTQUFBO2FBQ2pCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsUUFBYixFQUF1QixJQUFDLENBQUEsZUFBeEI7SUFEaUI7O2lDQUluQixtQkFBQSxHQUFxQixTQUFBO2FBQ25CLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQWMsUUFBZCxFQUF3QixJQUFDLENBQUEsZUFBekI7SUFEbUI7O2lDQUlyQixrQkFBQSxHQUFvQixTQUFBO01BQ2xCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLDhFQUFmO0lBRGtCOztpQ0FLcEIsa0JBQUEsR0FBb0IsU0FBQTtBQUNsQixVQUFBO01BQUEsWUFBQSxHQUFlLENBQUEsQ0FBRSxtQ0FBRjtNQUNmLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixZQUFqQjthQUNBLFlBQVksQ0FBQyxFQUFiLENBQWdCLFdBQWhCLEVBQTZCLFNBQUMsQ0FBRDtRQUMzQixDQUFDLENBQUMsY0FBRixDQUFBO1FBQ0EsQ0FBQyxDQUFDLHdCQUFGLENBQUE7UUFDQSxDQUFDLENBQUMsZUFBRixDQUFBO2VBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQseUJBQTNEO01BTDJCLENBQTdCO0lBSGtCOztpQ0FZcEIsZUFBQSxHQUFpQixTQUFDLE9BQUQ7TUFDZixJQUFDLENBQUEsYUFBRCxJQUFDLENBQUEsV0FBaUIsSUFBQSxXQUFBLENBQVksSUFBQyxDQUFBLFFBQWI7TUFDbEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxNQUFsQixFQUEwQixPQUExQjtJQUZlOztpQ0FNakIsWUFBQSxHQUFjLFNBQUMsT0FBRDtBQUNaLFVBQUE7TUFBQSxPQUFBLEdBQVU7TUFDVixJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO1FBQ0UsUUFBQSxHQUFXLENBQUMsQ0FBQyxPQUFGLENBQVUsT0FBVixFQUFtQixZQUFuQjtRQUNYLFdBQUEsR0FBYyxDQUFDLENBQUMsSUFBRixDQUFPLFFBQVAsQ0FBZ0IsQ0FBQztRQUMvQixZQUFBLEdBQWUsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFRLENBQUEsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBakIsQ0FBbUIsQ0FBQyxVQUF4QyxDQUFtRCxDQUFDLElBQXBELENBQXlELE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQXZCLENBQXpEO1FBQ2YsUUFBQSxHQUFXLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFlBQWhCLENBQTZCLENBQUMsUUFBOUIsQ0FBQTtRQUNYLE9BQUEsR0FBVSw4QkFBQSxHQUErQixPQUFPLENBQUMsTUFBdkMsR0FBOEMscUJBQTlDLEdBQW1FLFdBQW5FLEdBQStFLG9CQUEvRSxHQUFtRyxTQUwvRzs7TUFNQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIseUJBQUEsR0FFWCxPQUZXLEdBRUgsVUFGZDtJQVJZOztpQ0FnQmQsZUFBQSxHQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQURlOzs7OztBQXJJbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUtcGx1cycpXG5zdHIgPSByZXF1aXJlKCdidW1ibGUtc3RyaW5ncycpXG5tb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuXG5HaXRMb2cgPSByZXF1aXJlICdnaXQtbG9nLXV0aWxzJ1xuR2l0VGltZXBsb3QgPSByZXF1aXJlICcuL2dpdC10aW1lcGxvdCdcbkdpdFJldmlzaW9uVmlldyA9IHJlcXVpcmUgJy4vZ2l0LXJldmlzaW9uLXZpZXcnXG5cbk5PVF9HSVRfRVJST1JTID0gWydGaWxlIG5vdCBhIGdpdCByZXBvc2l0b3J5JywgJ2lzIG91dHNpZGUgcmVwb3NpdG9yeScsIFwiTm90IGEgZ2l0IHJlcG9zaXRvcnlcIl1cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2l0VGltZU1hY2hpbmVWaWV3XG4gIGNvbnN0cnVjdG9yOiAoc2VyaWFsaXplZFN0YXRlLCBvcHRpb25zPXt9KSAtPlxuICAgIEAkZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSdnaXQtdGltZS1tYWNoaW5lJz5cIikgdW5sZXNzIEAkZWxlbWVudFxuICAgIGlmIG9wdGlvbnMuZWRpdG9yP1xuICAgICAgQHNldEVkaXRvcihvcHRpb25zLmVkaXRvcilcbiAgICAgIEByZW5kZXIoKVxuICAgICAgXG4gICAgQF9iaW5kV2luZG93RXZlbnRzKClcblxuXG4gIHNldEVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciAhPSBAZWRpdG9yXG4gICAgZmlsZSA9IGVkaXRvcj8uZ2V0UGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlPyAmJiAhc3RyLnN0YXJ0c1dpdGgocGF0aC5iYXNlbmFtZShmaWxlKSwgR2l0UmV2aXNpb25WaWV3LkZJTEVfUFJFRklYKVxuICAgIFtAZWRpdG9yLCBAZmlsZV0gPSBbZWRpdG9yLCBmaWxlXVxuICAgIEByZW5kZXIoKVxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIGNvbW1pdHMgPSBAZ2l0Q29tbWl0SGlzdG9yeSgpXG4gICAgdW5sZXNzIEBmaWxlPyAmJiBjb21taXRzP1xuICAgICAgQF9yZW5kZXJQbGFjZWhvbGRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbGVtZW50LnRleHQoXCJcIilcbiAgICAgIEBfcmVuZGVyQ2xvc2VIYW5kbGUoKVxuICAgICAgQF9yZW5kZXJTdGF0cyhjb21taXRzKVxuICAgICAgQF9yZW5kZXJUaW1lbGluZShjb21taXRzKVxuXG4gICAgcmV0dXJuIEAkZWxlbWVudFxuXG5cbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemU6IC0+XG4gICAgcmV0dXJuIG51bGxcblxuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3k6IC0+XG4gICAgQF91bmJpbmRXaW5kb3dFdmVudHMoKVxuICAgIEAkZWxlbWVudC5yZW1vdmUoKVxuICAgIFxuICAgIFxuICBoaWRlOiAtPlxuICAgIEB0aW1lcGxvdD8uaGlkZSgpICAgIyBzbyBpdCBrbm93cyB0byBoaWRlIHRoZSBwb3B1cFxuXG5cbiAgc2hvdzogLT5cbiAgICBAdGltZXBsb3Q/LnNob3coKVxuXG5cbiAgZ2V0RWxlbWVudDogLT5cbiAgICByZXR1cm4gQCRlbGVtZW50LmdldCgwKVxuXG5cbiAgZ2l0Q29tbWl0SGlzdG9yeTogKGZpbGU9QGZpbGUpLT5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgZmlsZT9cbiAgICB0cnlcbiAgICAgIGNvbW1pdHMgPSBHaXRMb2cuZ2V0Q29tbWl0SGlzdG9yeSBmaWxlXG4gICAgY2F0Y2ggZVxuICAgICAgaWYgZS5tZXNzYWdlP1xuICAgICAgICBpZiBzdHIud2Vha2x5SGFzKGUubWVzc2FnZSwgTk9UX0dJVF9FUlJPUlMpXG4gICAgICAgICAgY29uc29sZS53YXJuIFwiI3tmaWxlfSBub3QgaW4gYSBnaXQgcmVwb3NpdG9yeVwiXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIFxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFN0cmluZyBlXG4gICAgICBjb25zb2xlLmVycm9yIGVcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gY29tbWl0cztcblxuXG5cblxuICBfYmluZFdpbmRvd0V2ZW50czogKCkgLT5cbiAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBfb25FZGl0b3JSZXNpemUgXG4gICAgXG4gICAgXG4gIF91bmJpbmRXaW5kb3dFdmVudHM6ICgpIC0+XG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgQF9vbkVkaXRvclJlc2l6ZVxuXG5cbiAgX3JlbmRlclBsYWNlaG9sZGVyOiAoKSAtPlxuICAgIEAkZWxlbWVudC5odG1sKFwiPGRpdiBjbGFzcz0ncGxhY2Vob2xkZXInPlNlbGVjdCBhIGZpbGUgaW4gdGhlIGdpdCByZXBvIHRvIHNlZSB0aW1lbGluZTwvZGl2PlwiKVxuICAgIHJldHVyblxuXG5cbiAgX3JlbmRlckNsb3NlSGFuZGxlOiAoKSAtPlxuICAgICRjbG9zZUhhbmRsZSA9ICQoXCI8ZGl2IGNsYXNzPSdjbG9zZS1oYW5kbGUnPlg8L2Rpdj5cIilcbiAgICBAJGVsZW1lbnQuYXBwZW5kICRjbG9zZUhhbmRsZVxuICAgICRjbG9zZUhhbmRsZS5vbiAnbW91c2Vkb3duJywgKGUpLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgIyB3aHkgbm90PyBpbnN0ZWFkIG9mIGFkZGluZyBjYWxsYmFjaywgb3VyIG93biBldmVudC4uLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCBcImdpdC10aW1lLW1hY2hpbmU6dG9nZ2xlXCIpXG5cblxuXG4gIF9yZW5kZXJUaW1lbGluZTogKGNvbW1pdHMpIC0+XG4gICAgQHRpbWVwbG90IHx8PSBuZXcgR2l0VGltZXBsb3QoQCRlbGVtZW50KVxuICAgIEB0aW1lcGxvdC5yZW5kZXIoQGVkaXRvciwgY29tbWl0cylcbiAgICByZXR1cm5cblxuXG4gIF9yZW5kZXJTdGF0czogKGNvbW1pdHMpIC0+XG4gICAgY29udGVudCA9IFwiXCJcbiAgICBpZiBjb21taXRzLmxlbmd0aCA+IDBcbiAgICAgIGJ5QXV0aG9yID0gXy5pbmRleEJ5IGNvbW1pdHMsICdhdXRob3JOYW1lJ1xuICAgICAgYXV0aG9yQ291bnQgPSBfLmtleXMoYnlBdXRob3IpLmxlbmd0aFxuICAgICAgZHVyYXRpb25Jbk1zID0gbW9tZW50LnVuaXgoY29tbWl0c1tjb21taXRzLmxlbmd0aCAtIDFdLmF1dGhvckRhdGUpLmRpZmYobW9tZW50LnVuaXgoY29tbWl0c1swXS5hdXRob3JEYXRlKSlcbiAgICAgIHRpbWVTcGFuID0gbW9tZW50LmR1cmF0aW9uKGR1cmF0aW9uSW5NcykuaHVtYW5pemUoKVxuICAgICAgY29udGVudCA9IFwiPHNwYW4gY2xhc3M9J3RvdGFsLWNvbW1pdHMnPiN7Y29tbWl0cy5sZW5ndGh9PC9zcGFuPiBjb21taXRzIGJ5ICN7YXV0aG9yQ291bnR9IGF1dGhvcnMgc3Bhbm5pbmcgI3t0aW1lU3Bhbn1cIlxuICAgIEAkZWxlbWVudC5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPSdzdGF0cyc+XG4gICAgICAgICN7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIHJldHVyblxuXG5cbiAgX29uRWRpdG9yUmVzaXplOiA9PlxuICAgIEByZW5kZXIoKVxuICAgICJdfQ==
