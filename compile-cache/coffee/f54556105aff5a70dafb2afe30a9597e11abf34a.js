(function() {
  var AbstractProvider, FunctionProvider, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.function-call';

    FunctionProvider.prototype.clickEventSelectors = '.function-call';

    FunctionProvider.prototype.gotoRegex = /^(\w+\()+/;


    /**
     * Goto the class from the term given.
     *
     * @param {TextEditor} editor  TextEditor to search for namespace of term.
     * @param {string}     term    Term to search for.
     */

    FunctionProvider.prototype.gotoFromWord = function(editor, term) {
      var bufferPosition, calledClass, currentClass, value;
      bufferPosition = editor.getCursorBufferPosition();
      calledClass = this.parser.getCalledClass(editor, term, bufferPosition);
      if (!calledClass) {
        return;
      }
      currentClass = this.parser.getFullClassName(editor);
      if (currentClass === calledClass && this.jumpTo(editor, term)) {
        this.manager.addBackTrack(editor.getPath(), bufferPosition);
        return;
      }
      value = this.parser.getMemberContext(editor, term, bufferPosition, calledClass);
      if (!value) {
        return;
      }
      atom.workspace.open(value.declaringStructure.filename, {
        initialLine: value.startLine - 1,
        searchAllPanes: true
      });
      return this.manager.addBackTrack(editor.getPath(), bufferPosition);
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    FunctionProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("function +" + term + "( +|\\()", "i");
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLG1CQUFBLEdBQXFCLGdCQUFyQixDQUFBOztBQUFBLCtCQUNBLG1CQUFBLEdBQXFCLGdCQURyQixDQUFBOztBQUFBLCtCQUVBLFNBQUEsR0FBVyxXQUZYLENBQUE7O0FBSUE7QUFBQTs7Ozs7T0FKQTs7QUFBQSwrQkFVQSxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVCxHQUFBO0FBQ1YsVUFBQSxnREFBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFqQixDQUFBO0FBQUEsTUFFQSxXQUFBLEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLE1BQXZCLEVBQStCLElBQS9CLEVBQXFDLGNBQXJDLENBRmQsQ0FBQTtBQUlBLE1BQUEsSUFBRyxDQUFBLFdBQUg7QUFDSSxjQUFBLENBREo7T0FKQTtBQUFBLE1BT0EsWUFBQSxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsQ0FQZixDQUFBO0FBU0EsTUFBQSxJQUFHLFlBQUEsS0FBZ0IsV0FBaEIsSUFBK0IsSUFBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSLEVBQWdCLElBQWhCLENBQWxDO0FBQ0ksUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF0QixFQUF3QyxjQUF4QyxDQUFBLENBQUE7QUFDQSxjQUFBLENBRko7T0FUQTtBQUFBLE1BYUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsRUFBdUQsV0FBdkQsQ0FiUixDQUFBO0FBZUEsTUFBQSxJQUFHLENBQUEsS0FBSDtBQUNJLGNBQUEsQ0FESjtPQWZBO0FBQUEsTUFrQkEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUE3QyxFQUF1RDtBQUFBLFFBQ25ELFdBQUEsRUFBa0IsS0FBSyxDQUFDLFNBQU4sR0FBa0IsQ0FEZTtBQUFBLFFBRW5ELGNBQUEsRUFBaUIsSUFGa0M7T0FBdkQsQ0FsQkEsQ0FBQTthQXVCQSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF0QixFQUF3QyxjQUF4QyxFQXhCVTtJQUFBLENBVmQsQ0FBQTs7QUFvQ0E7QUFBQTs7Ozs7O09BcENBOztBQUFBLCtCQTJDQSxjQUFBLEdBQWdCLFNBQUMsSUFBRCxHQUFBO0FBQ1osYUFBTyxNQUFBLENBQUcsWUFBQSxHQUFhLElBQWIsR0FBa0IsVUFBckIsRUFBZ0MsR0FBaEMsQ0FBUCxDQURZO0lBQUEsQ0EzQ2hCLENBQUE7OzRCQUFBOztLQUQyQixpQkFOL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/function-provider.coffee
