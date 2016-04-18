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

    FunctionProvider.prototype.regex = /(\s*(?:public|protected|private)\s+\$)(\w+)\s+/g;


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {
      var context, currentClass, propertyName;
      currentClass = this.parser.getFullClassName(editor);
      propertyName = match[2];
      context = this.parser.getMemberContext(editor, propertyName, null, currentClass);
      if (!context || !context.override) {
        return null;
      }
      return {
        lineNumberClass: 'override',
        tooltipText: 'Overrides property from ' + context.override.declaringClass.name,
        extraData: context.override
      };
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {
      return atom.workspace.open(annotationInfo.extraData.declaringStructure.filename, {
        searchAllPanes: true
      });
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vcHJvcGVydHktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FBbkIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBR007QUFDRix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsS0FBQSxHQUFPLGlEQUFQLENBQUE7O0FBRUE7QUFBQTs7T0FGQTs7QUFBQSwrQkFLQSxxQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZCxFQUF1QixLQUF2QixHQUFBO0FBQ25CLFVBQUEsbUNBQUE7QUFBQSxNQUFBLFlBQUEsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLENBQWYsQ0FBQTtBQUFBLE1BRUEsWUFBQSxHQUFlLEtBQU0sQ0FBQSxDQUFBLENBRnJCLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLFlBQWpDLEVBQStDLElBQS9DLEVBQXFELFlBQXJELENBSlYsQ0FBQTtBQU1BLE1BQUEsSUFBRyxDQUFBLE9BQUEsSUFBZSxDQUFBLE9BQVcsQ0FBQyxRQUE5QjtBQUNJLGVBQU8sSUFBUCxDQURKO09BTkE7QUFVQSxhQUFPO0FBQUEsUUFDSCxlQUFBLEVBQWtCLFVBRGY7QUFBQSxRQUVILFdBQUEsRUFBa0IsMEJBQUEsR0FBNkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFGNUU7QUFBQSxRQUdILFNBQUEsRUFBa0IsT0FBTyxDQUFDLFFBSHZCO09BQVAsQ0FYbUI7SUFBQSxDQUx2QixDQUFBOztBQXNCQTtBQUFBOztPQXRCQTs7QUFBQSwrQkF5QkEsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixjQUFoQixHQUFBO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGNBQWMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBaEUsRUFBMEU7QUFBQSxRQUV0RSxjQUFBLEVBQWlCLElBRnFEO09BQTFFLEVBRGM7SUFBQSxDQXpCbEIsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQUwvQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/annotation/property-provider.coffee
