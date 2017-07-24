(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, NOT_GIT_ERRORS, View, _, moment, path, ref, str;

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
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
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

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZS1tYWNoaW5lLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBRCxFQUFJOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLEdBQUEsR0FBTSxPQUFBLENBQVEsZ0JBQVI7O0VBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUjs7RUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUVsQixjQUFBLEdBQWlCLENBQUMsMkJBQUQsRUFBOEIsdUJBQTlCLEVBQXVELHNCQUF2RDs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLDRCQUFDLGVBQUQsRUFBa0IsT0FBbEI7O1FBQWtCLFVBQVE7O01BQ3JDLElBQUEsQ0FBdUQsSUFBQyxDQUFBLFFBQXhEO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFBLENBQUUsZ0NBQUYsRUFBWjs7TUFDQSxJQUFHLHNCQUFIO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxPQUFPLENBQUMsTUFBbkI7UUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRkY7O0lBRlc7O2lDQU9iLFNBQUEsR0FBVyxTQUFDLE1BQUQ7QUFDVCxVQUFBO01BQUEsSUFBYyxNQUFBLEtBQVUsSUFBQyxDQUFBLE1BQXpCO0FBQUEsZUFBQTs7TUFDQSxJQUFBLG9CQUFPLE1BQU0sQ0FBRSxPQUFSLENBQUE7TUFDUCxJQUFBLENBQUEsQ0FBYyxjQUFBLElBQVMsQ0FBQyxHQUFHLENBQUMsVUFB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MUI7SUFGZTs7aUNBTWpCLFlBQUEsR0FBYyxTQUFDLE9BQUQ7QUFDWixVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtRQUNFLFFBQUEsR0FBVyxDQUFDLENBQUMsT0FBRixDQUFVLE9BQVYsRUFBbUIsWUFBbkI7UUFDWCxXQUFBLEdBQWMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFQLENBQWdCLENBQUM7UUFDL0IsWUFBQSxHQUFlLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWpCLENBQW1CLENBQUMsVUFBeEMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUF2QixDQUF6RDtRQUNmLFFBQUEsR0FBVyxNQUFNLENBQUMsUUFBUCxDQUFnQixZQUFoQixDQUE2QixDQUFDLFFBQTlCLENBQUE7UUFDWCxPQUFBLEdBQVUsOEJBQUEsR0FBK0IsT0FBTyxDQUFDLE1BQXZDLEdBQThDLHFCQUE5QyxHQUFtRSxXQUFuRSxHQUErRSxvQkFBL0UsR0FBbUcsU0FML0c7O01BTUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLHlCQUFBLEdBRVgsT0FGVyxHQUVILFVBRmQ7SUFSWTs7Ozs7QUF2R2hCIiwic291cmNlc0NvbnRlbnQiOlsieyQsIFZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbl8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKVxuc3RyID0gcmVxdWlyZSgnYnVtYmxlLXN0cmluZ3MnKVxubW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcblxuR2l0TG9nID0gcmVxdWlyZSAnZ2l0LWxvZy11dGlscydcbkdpdFRpbWVwbG90ID0gcmVxdWlyZSAnLi9naXQtdGltZXBsb3QnXG5HaXRSZXZpc2lvblZpZXcgPSByZXF1aXJlICcuL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5OT1RfR0lUX0VSUk9SUyA9IFsnRmlsZSBub3QgYSBnaXQgcmVwb3NpdG9yeScsICdpcyBvdXRzaWRlIHJlcG9zaXRvcnknLCBcIk5vdCBhIGdpdCByZXBvc2l0b3J5XCJdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdpdFRpbWVNYWNoaW5lVmlld1xuICBjb25zdHJ1Y3RvcjogKHNlcmlhbGl6ZWRTdGF0ZSwgb3B0aW9ucz17fSkgLT5cbiAgICBAJGVsZW1lbnQgPSAkKFwiPGRpdiBjbGFzcz0nZ2l0LXRpbWUtbWFjaGluZSc+XCIpIHVubGVzcyBAJGVsZW1lbnRcbiAgICBpZiBvcHRpb25zLmVkaXRvcj9cbiAgICAgIEBzZXRFZGl0b3Iob3B0aW9ucy5lZGl0b3IpXG4gICAgICBAcmVuZGVyKClcblxuXG4gIHNldEVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciAhPSBAZWRpdG9yXG4gICAgZmlsZSA9IGVkaXRvcj8uZ2V0UGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlPyAmJiAhc3RyLnN0YXJ0c1dpdGgocGF0aC5iYXNlbmFtZShmaWxlKSwgR2l0UmV2aXNpb25WaWV3LkZJTEVfUFJFRklYKVxuICAgIFtAZWRpdG9yLCBAZmlsZV0gPSBbZWRpdG9yLCBmaWxlXVxuICAgIEByZW5kZXIoKVxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIGNvbW1pdHMgPSBAZ2l0Q29tbWl0SGlzdG9yeSgpXG4gICAgdW5sZXNzIEBmaWxlPyAmJiBjb21taXRzP1xuICAgICAgQF9yZW5kZXJQbGFjZWhvbGRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbGVtZW50LnRleHQoXCJcIilcbiAgICAgIEBfcmVuZGVyQ2xvc2VIYW5kbGUoKVxuICAgICAgQF9yZW5kZXJTdGF0cyhjb21taXRzKVxuICAgICAgQF9yZW5kZXJUaW1lbGluZShjb21taXRzKVxuXG4gICAgcmV0dXJuIEAkZWxlbWVudFxuXG5cbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemU6IC0+XG4gICAgcmV0dXJuIG51bGxcblxuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIEAkZWxlbWVudC5yZW1vdmUoKVxuXG5cbiAgaGlkZTogLT5cbiAgICBAdGltZXBsb3Q/LmhpZGUoKSAgICMgc28gaXQga25vd3MgdG8gaGlkZSB0aGUgcG9wdXBcblxuXG4gIHNob3c6IC0+XG4gICAgQHRpbWVwbG90Py5zaG93KClcblxuXG4gIGdldEVsZW1lbnQ6IC0+XG4gICAgcmV0dXJuIEAkZWxlbWVudC5nZXQoMClcblxuXG4gIGdpdENvbW1pdEhpc3Rvcnk6IChmaWxlPUBmaWxlKS0+XG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIGZpbGU/XG4gICAgdHJ5XG4gICAgICBjb21taXRzID0gR2l0TG9nLmdldENvbW1pdEhpc3RvcnkgZmlsZVxuICAgIGNhdGNoIGVcbiAgICAgIGlmIGUubWVzc2FnZT9cbiAgICAgICAgaWYgc3RyLndlYWtseUhhcyhlLm1lc3NhZ2UsIE5PVF9HSVRfRVJST1JTKVxuICAgICAgICAgIGNvbnNvbGUud2FybiBcIiN7ZmlsZX0gbm90IGluIGEgZ2l0IHJlcG9zaXRvcnlcIlxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICBcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBTdHJpbmcgZVxuICAgICAgY29uc29sZS5lcnJvciBlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIGNvbW1pdHM7XG5cbiAgX3JlbmRlclBsYWNlaG9sZGVyOiAoKSAtPlxuICAgIEAkZWxlbWVudC5odG1sKFwiPGRpdiBjbGFzcz0ncGxhY2Vob2xkZXInPlNlbGVjdCBhIGZpbGUgaW4gdGhlIGdpdCByZXBvIHRvIHNlZSB0aW1lbGluZTwvZGl2PlwiKVxuICAgIHJldHVyblxuXG5cbiAgX3JlbmRlckNsb3NlSGFuZGxlOiAoKSAtPlxuICAgICRjbG9zZUhhbmRsZSA9ICQoXCI8ZGl2IGNsYXNzPSdjbG9zZS1oYW5kbGUnPlg8L2Rpdj5cIilcbiAgICBAJGVsZW1lbnQuYXBwZW5kICRjbG9zZUhhbmRsZVxuICAgICRjbG9zZUhhbmRsZS5vbiAnbW91c2Vkb3duJywgKGUpLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgIyB3aHkgbm90PyBpbnN0ZWFkIG9mIGFkZGluZyBjYWxsYmFjaywgb3VyIG93biBldmVudC4uLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCBcImdpdC10aW1lLW1hY2hpbmU6dG9nZ2xlXCIpXG5cblxuXG4gIF9yZW5kZXJUaW1lbGluZTogKGNvbW1pdHMpIC0+XG4gICAgQHRpbWVwbG90IHx8PSBuZXcgR2l0VGltZXBsb3QoQCRlbGVtZW50KVxuICAgIEB0aW1lcGxvdC5yZW5kZXIoQGVkaXRvciwgY29tbWl0cylcbiAgICByZXR1cm5cblxuXG4gIF9yZW5kZXJTdGF0czogKGNvbW1pdHMpIC0+XG4gICAgY29udGVudCA9IFwiXCJcbiAgICBpZiBjb21taXRzLmxlbmd0aCA+IDBcbiAgICAgIGJ5QXV0aG9yID0gXy5pbmRleEJ5IGNvbW1pdHMsICdhdXRob3JOYW1lJ1xuICAgICAgYXV0aG9yQ291bnQgPSBfLmtleXMoYnlBdXRob3IpLmxlbmd0aFxuICAgICAgZHVyYXRpb25Jbk1zID0gbW9tZW50LnVuaXgoY29tbWl0c1tjb21taXRzLmxlbmd0aCAtIDFdLmF1dGhvckRhdGUpLmRpZmYobW9tZW50LnVuaXgoY29tbWl0c1swXS5hdXRob3JEYXRlKSlcbiAgICAgIHRpbWVTcGFuID0gbW9tZW50LmR1cmF0aW9uKGR1cmF0aW9uSW5NcykuaHVtYW5pemUoKVxuICAgICAgY29udGVudCA9IFwiPHNwYW4gY2xhc3M9J3RvdGFsLWNvbW1pdHMnPiN7Y29tbWl0cy5sZW5ndGh9PC9zcGFuPiBjb21taXRzIGJ5ICN7YXV0aG9yQ291bnR9IGF1dGhvcnMgc3Bhbm5pbmcgI3t0aW1lU3Bhbn1cIlxuICAgIEAkZWxlbWVudC5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPSdzdGF0cyc+XG4gICAgICAgICN7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIHJldHVyblxuIl19
