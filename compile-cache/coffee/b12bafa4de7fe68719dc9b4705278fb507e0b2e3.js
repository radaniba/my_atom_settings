(function() {
  var AbstractProvider, FunctionProvider,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.regex = /(\s*(?:public|protected|private)\s+function\s+)(\w+)\s*\(/g;


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {
      var context, currentClass, extraData, lineNumberClass, propertyName, tooltipText;
      currentClass = this.parser.getFullClassName(editor);
      propertyName = match[2];
      context = this.parser.getMemberContext(editor, propertyName, null, currentClass);
      if (!context || (!context.override && !context.implementation)) {
        return null;
      }
      extraData = null;
      tooltipText = '';
      lineNumberClass = '';
      if (context.override) {
        extraData = context.override;
        lineNumberClass = 'override';
        tooltipText = 'Overrides method from ' + extraData.declaringClass.name;
      } else {
        extraData = context.implementation;
        lineNumberClass = 'implementation';
        tooltipText = 'Implements method for ' + extraData.declaringClass.name;
      }
      return {
        lineNumberClass: lineNumberClass,
        tooltipText: tooltipText,
        extraData: extraData
      };
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {
      return atom.workspace.open(annotationInfo.extraData.declaringStructure.filename, {
        initialLine: annotationInfo.extraData.startLine - 1,
        searchAllPanes: true
      });
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vbWV0aG9kLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBQW5CLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLEtBQUEsR0FBTyw0REFBUCxDQUFBOztBQUVBO0FBQUE7O09BRkE7O0FBQUEsK0JBS0EscUJBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUFjLE9BQWQsRUFBdUIsS0FBdkIsR0FBQTtBQUNuQixVQUFBLDRFQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixDQUFmLENBQUE7QUFBQSxNQUVBLFlBQUEsR0FBZSxLQUFNLENBQUEsQ0FBQSxDQUZyQixDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxZQUFqQyxFQUErQyxJQUEvQyxFQUFxRCxZQUFyRCxDQUpWLENBQUE7QUFNQSxNQUFBLElBQUcsQ0FBQSxPQUFBLElBQWUsQ0FBQyxDQUFBLE9BQVcsQ0FBQyxRQUFaLElBQXlCLENBQUEsT0FBVyxDQUFDLGNBQXRDLENBQWxCO0FBQ0ksZUFBTyxJQUFQLENBREo7T0FOQTtBQUFBLE1BU0EsU0FBQSxHQUFZLElBVFosQ0FBQTtBQUFBLE1BVUEsV0FBQSxHQUFjLEVBVmQsQ0FBQTtBQUFBLE1BV0EsZUFBQSxHQUFrQixFQVhsQixDQUFBO0FBY0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFYO0FBQ0ksUUFBQSxTQUFBLEdBQVksT0FBTyxDQUFDLFFBQXBCLENBQUE7QUFBQSxRQUNBLGVBQUEsR0FBa0IsVUFEbEIsQ0FBQTtBQUFBLFFBRUEsV0FBQSxHQUFjLHdCQUFBLEdBQTJCLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFGbEUsQ0FESjtPQUFBLE1BQUE7QUFNSSxRQUFBLFNBQUEsR0FBWSxPQUFPLENBQUMsY0FBcEIsQ0FBQTtBQUFBLFFBQ0EsZUFBQSxHQUFrQixnQkFEbEIsQ0FBQTtBQUFBLFFBRUEsV0FBQSxHQUFjLHdCQUFBLEdBQTJCLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFGbEUsQ0FOSjtPQWRBO0FBd0JBLGFBQU87QUFBQSxRQUNILGVBQUEsRUFBa0IsZUFEZjtBQUFBLFFBRUgsV0FBQSxFQUFrQixXQUZmO0FBQUEsUUFHSCxTQUFBLEVBQWtCLFNBSGY7T0FBUCxDQXpCbUI7SUFBQSxDQUx2QixDQUFBOztBQW9DQTtBQUFBOztPQXBDQTs7QUFBQSwrQkF1Q0EsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixjQUFoQixHQUFBO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGNBQWMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBaEUsRUFBMEU7QUFBQSxRQUN0RSxXQUFBLEVBQWlCLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBekIsR0FBcUMsQ0FEZ0I7QUFBQSxRQUV0RSxjQUFBLEVBQWlCLElBRnFEO09BQTFFLEVBRGM7SUFBQSxDQXZDbEIsQ0FBQTs7QUE2Q0E7QUFBQTs7T0E3Q0E7O0FBQUEsK0JBZ0RBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDWCxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFDSSxRQUFBLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixLQUZ2QjtPQURXO0lBQUEsQ0FoRGYsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQUwvQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/annotation/method-provider.coffee
