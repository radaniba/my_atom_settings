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


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    PropertyProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, returnType, returnValue, value, _ref, _ref1, _ref2;
      value = this.parser.getMemberContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      accessModifier = '';
      returnType = ((_ref = value.args["return"]) != null ? _ref.type : void 0) ? value.args["return"].type : 'mixed';
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else {
        accessModifier = 'private';
      }
      description = '';
      description += "<p><div>";
      description += accessModifier + ' ' + returnType + '<strong>' + ' $' + term + '</strong>';
      description += '</div></p>';
      description += '<div>';
      description += (value.args.descriptions.short ? value.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((_ref1 = value.args.descriptions.long) != null ? _ref1.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + value.args.descriptions.long + "</div>";
        description += "</div>";
      }
      if ((_ref2 = value.args["return"]) != null ? _ref2.type : void 0) {
        returnValue = '<strong>' + value.args["return"].type + '</strong>';
        if (value.args["return"].description) {
          returnValue += ' ' + value.args["return"].description;
        }
        description += '<div class="section">';
        description += "<h4>Type</h4>";
        description += "<div>" + returnValue + "</div>";
        description += "</div>";
      }
      return description;
    };

    return PropertyProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvcHJvcGVydHktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLG1CQUFBLEdBQXFCLFdBQXJCLENBQUE7O0FBRUE7QUFBQTs7Ozs7T0FGQTs7QUFBQSwrQkFRQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ2YsVUFBQSwrRUFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsQ0FBUixDQUFBO0FBRUEsTUFBQSxJQUFHLENBQUEsS0FBSDtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBQUEsTUFLQSxjQUFBLEdBQWlCLEVBTGpCLENBQUE7QUFBQSxNQU1BLFVBQUEsZ0RBQWlDLENBQUUsY0FBdEIsR0FBZ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQU8sQ0FBQyxJQUFsRCxHQUE0RCxPQU56RSxDQUFBO0FBUUEsTUFBQSxJQUFHLEtBQUssQ0FBQyxRQUFUO0FBQ0ksUUFBQSxjQUFBLEdBQWlCLFFBQWpCLENBREo7T0FBQSxNQUdLLElBQUcsS0FBSyxDQUFDLFdBQVQ7QUFDRCxRQUFBLGNBQUEsR0FBaUIsV0FBakIsQ0FEQztPQUFBLE1BQUE7QUFJRCxRQUFBLGNBQUEsR0FBaUIsU0FBakIsQ0FKQztPQVhMO0FBQUEsTUFrQkEsV0FBQSxHQUFjLEVBbEJkLENBQUE7QUFBQSxNQW9CQSxXQUFBLElBQWUsVUFwQmYsQ0FBQTtBQUFBLE1BcUJBLFdBQUEsSUFBZSxjQUFBLEdBQWlCLEdBQWpCLEdBQXVCLFVBQXZCLEdBQW9DLFVBQXBDLEdBQWlELElBQWpELEdBQXdELElBQXhELEdBQStELFdBckI5RSxDQUFBO0FBQUEsTUFzQkEsV0FBQSxJQUFlLFlBdEJmLENBQUE7QUFBQSxNQXlCQSxXQUFBLElBQWUsT0F6QmYsQ0FBQTtBQUFBLE1BMEJBLFdBQUEsSUFBbUIsQ0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUEzQixHQUFzQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUE5RCxHQUF5RSw4QkFBMUUsQ0ExQm5CLENBQUE7QUFBQSxNQTJCQSxXQUFBLElBQWUsUUEzQmYsQ0FBQTtBQThCQSxNQUFBLDJEQUErQixDQUFFLGdCQUE5QixHQUF1QyxDQUExQztBQUNJLFFBQUEsV0FBQSxJQUFlLHVCQUFmLENBQUE7QUFBQSxRQUNBLFdBQUEsSUFBbUIsc0JBRG5CLENBQUE7QUFBQSxRQUVBLFdBQUEsSUFBbUIsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQWxDLEdBQXlDLFFBRjVELENBQUE7QUFBQSxRQUdBLFdBQUEsSUFBZSxRQUhmLENBREo7T0E5QkE7QUFvQ0EsTUFBQSxrREFBb0IsQ0FBRSxhQUF0QjtBQUNJLFFBQUEsV0FBQSxHQUFjLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQUQsQ0FBTyxDQUFDLElBQS9CLEdBQXNDLFdBQXBELENBQUE7QUFFQSxRQUFBLElBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQU8sQ0FBQyxXQUFyQjtBQUNJLFVBQUEsV0FBQSxJQUFlLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQUQsQ0FBTyxDQUFDLFdBQXZDLENBREo7U0FGQTtBQUFBLFFBS0EsV0FBQSxJQUFlLHVCQUxmLENBQUE7QUFBQSxRQU1BLFdBQUEsSUFBbUIsZUFObkIsQ0FBQTtBQUFBLFFBT0EsV0FBQSxJQUFtQixPQUFBLEdBQVUsV0FBVixHQUF3QixRQVAzQyxDQUFBO0FBQUEsUUFRQSxXQUFBLElBQWUsUUFSZixDQURKO09BcENBO0FBK0NBLGFBQU8sV0FBUCxDQWhEZTtJQUFBLENBUm5CLENBQUE7OzRCQUFBOztLQUQyQixpQkFOL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/tooltip/property-provider.coffee
