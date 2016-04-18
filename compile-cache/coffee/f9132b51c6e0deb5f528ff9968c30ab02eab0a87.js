(function() {
  var AbstractProvider, PropertyProvider, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = PropertyProvider = (function(_super) {
    __extends(PropertyProvider, _super);

    function PropertyProvider() {
      return PropertyProvider.__super__.constructor.apply(this, arguments);
    }

    PropertyProvider.prototype.hoverEventSelectors = '.property';

    PropertyProvider.prototype.clickEventSelectors = '.property';

    PropertyProvider.prototype.gotoRegex = /^(\$\w+)?((->|::)\w+)+/;


    /**
     * Goto the property from the term given.
     *
     * @param {TextEditor} editor TextEditor to search for namespace of term.
     * @param {string}     term   Term to search for.
     */

    PropertyProvider.prototype.gotoFromWord = function(editor, term) {
      var bufferPosition, calledClass, currentClass, value;
      bufferPosition = editor.getCursorBufferPosition();
      calledClass = this.parser.getCalledClass(editor, term, bufferPosition);
      if (!calledClass) {
        return;
      }
      currentClass = this.parser.getFullClassName(editor);
      if (currentClass === calledClass && this.jumpTo(editor, term)) {
        this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
        return;
      }
      value = this.parser.getMemberContext(editor, term, bufferPosition, calledClass);
      if (!value) {
        return;
      }
      atom.workspace.open(value.declaringStructure.filename, {
        searchAllPanes: true
      });
      this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
      return this.jumpWord = term;
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param  {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    PropertyProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("(protected|public|private|static) +\\$" + term, "i");
    };

    return PropertyProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vcHJvcGVydHktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLG1CQUFBLEdBQXFCLFdBQXJCLENBQUE7O0FBQUEsK0JBQ0EsbUJBQUEsR0FBcUIsV0FEckIsQ0FBQTs7QUFBQSwrQkFFQSxTQUFBLEdBQVcsd0JBRlgsQ0FBQTs7QUFJQTtBQUFBOzs7OztPQUpBOztBQUFBLCtCQVVBLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFULEdBQUE7QUFDVixVQUFBLGdEQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWpCLENBQUE7QUFBQSxNQUVBLFdBQUEsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsTUFBdkIsRUFBK0IsSUFBL0IsRUFBcUMsY0FBckMsQ0FGZCxDQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsV0FBSDtBQUNJLGNBQUEsQ0FESjtPQUpBO0FBQUEsTUFPQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixDQVBmLENBQUE7QUFTQSxNQUFBLElBQUcsWUFBQSxLQUFnQixXQUFoQixJQUErQixJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsSUFBaEIsQ0FBbEM7QUFDSSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQXRCLEVBQXdDLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQXhDLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGSjtPQVRBO0FBQUEsTUFhQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxJQUFqQyxFQUF1QyxjQUF2QyxFQUF1RCxXQUF2RCxDQWJSLENBQUE7QUFlQSxNQUFBLElBQUcsQ0FBQSxLQUFIO0FBQ0ksY0FBQSxDQURKO09BZkE7QUFBQSxNQWtCQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQTdDLEVBQXVEO0FBQUEsUUFDbkQsY0FBQSxFQUFnQixJQURtQztPQUF2RCxDQWxCQSxDQUFBO0FBQUEsTUFzQkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBeEMsQ0F0QkEsQ0FBQTthQXVCQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBeEJGO0lBQUEsQ0FWZCxDQUFBOztBQW9DQTtBQUFBOzs7Ozs7T0FwQ0E7O0FBQUEsK0JBMkNBLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEdBQUE7QUFDWixhQUFPLE1BQUEsQ0FBRyx3Q0FBQSxHQUF3QyxJQUEzQyxFQUFtRCxHQUFuRCxDQUFQLENBRFk7SUFBQSxDQTNDaEIsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQU4vQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/property-provider.coffee
