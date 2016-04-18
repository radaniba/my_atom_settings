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

    FunctionProvider.prototype.gotoRegex = /^(\$\w+)?((->|::)\w+\()+/;


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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLG1CQUFBLEdBQXFCLGdCQUFyQixDQUFBOztBQUFBLCtCQUNBLG1CQUFBLEdBQXFCLGdCQURyQixDQUFBOztBQUFBLCtCQUVBLFNBQUEsR0FBVywwQkFGWCxDQUFBOztBQUlBO0FBQUE7Ozs7O09BSkE7O0FBQUEsK0JBVUEsWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTtBQUNWLFVBQUEsZ0RBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBakIsQ0FBQTtBQUFBLE1BRUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQixJQUEvQixFQUFxQyxjQUFyQyxDQUZkLENBQUE7QUFJQSxNQUFBLElBQUcsQ0FBQSxXQUFIO0FBQ0ksY0FBQSxDQURKO09BSkE7QUFBQSxNQU9BLFlBQUEsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLENBUGYsQ0FBQTtBQVNBLE1BQUEsSUFBRyxZQUFBLEtBQWdCLFdBQWhCLElBQStCLElBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQUFnQixJQUFoQixDQUFsQztBQUNJLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsY0FBeEMsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZKO09BVEE7QUFBQSxNQWFBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLElBQWpDLEVBQXVDLGNBQXZDLEVBQXVELFdBQXZELENBYlIsQ0FBQTtBQWVBLE1BQUEsSUFBRyxDQUFBLEtBQUg7QUFDSSxjQUFBLENBREo7T0FmQTtBQUFBLE1Ba0JBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBN0MsRUFBdUQ7QUFBQSxRQUNuRCxXQUFBLEVBQWtCLEtBQUssQ0FBQyxTQUFOLEdBQWtCLENBRGU7QUFBQSxRQUVuRCxjQUFBLEVBQWlCLElBRmtDO09BQXZELENBbEJBLENBQUE7YUF1QkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsY0FBeEMsRUF4QlU7SUFBQSxDQVZkLENBQUE7O0FBb0NBO0FBQUE7Ozs7OztPQXBDQTs7QUFBQSwrQkEyQ0EsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNaLGFBQU8sTUFBQSxDQUFHLFlBQUEsR0FBYSxJQUFiLEdBQWtCLFVBQXJCLEVBQWdDLEdBQWhDLENBQVAsQ0FEWTtJQUFBLENBM0NoQixDQUFBOzs0QkFBQTs7S0FEMkIsaUJBTi9CLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/function-provider.coffee
