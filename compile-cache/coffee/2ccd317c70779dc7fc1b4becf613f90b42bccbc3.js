(function() {
  var AbstractProvider, FunctionProvider, Point, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Point = require('atom').Point;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.function-call';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    FunctionProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, exceptionType, info, param, parametersDescription, returnType, returnValue, thrownWhenDescription, throwsDescription, value, _ref, _ref1, _ref2, _ref3, _ref4;
      value = this.parser.getMemberContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      description = "";
      accessModifier = '';
      returnType = '';
      if ((_ref = value.args["return"]) != null ? _ref.type : void 0) {
        returnType = value.args["return"].type;
      }
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else {
        accessModifier = 'private';
      }
      description += "<p><div>";
      description += accessModifier + ' ' + returnType + ' <strong>' + term + '</strong>' + '(';
      if (value.args.parameters.length > 0) {
        description += value.args.parameters.join(', ');
      }
      if (value.args.optionals.length > 0) {
        description += '[';
        if (value.args.parameters.length > 0) {
          description += ', ';
        }
        description += value.args.optionals.join(', ');
        description += ']';
      }
      description += ')';
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
      parametersDescription = "";
      _ref2 = value.args.docParameters;
      for (param in _ref2) {
        info = _ref2[param];
        parametersDescription += "<tr>";
        parametersDescription += "<td>•&nbsp;<strong>";
        if (__indexOf.call(value.args.optionals, param) >= 0) {
          parametersDescription += "[" + param + "]";
        } else {
          parametersDescription += param;
        }
        parametersDescription += "</strong></td>";
        parametersDescription += "<td>" + (info.type ? info.type : '&nbsp;') + '</td>';
        parametersDescription += "<td>" + (info.description ? info.description : '&nbsp;') + '</td>';
        parametersDescription += "</tr>";
      }
      if (parametersDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Parameters</h4>";
        description += "<div><table>" + parametersDescription + "</table></div>";
        description += "</div>";
      }
      if ((_ref3 = value.args["return"]) != null ? _ref3.type : void 0) {
        returnValue = '<strong>' + value.args["return"].type + '</strong>';
        if (value.args["return"].description) {
          returnValue += ' ' + value.args["return"].description;
        }
        description += '<div class="section">';
        description += "<h4>Returns</h4>";
        description += "<div>" + returnValue + "</div>";
        description += "</div>";
      }
      throwsDescription = "";
      _ref4 = value.args.throws;
      for (exceptionType in _ref4) {
        thrownWhenDescription = _ref4[exceptionType];
        throwsDescription += "<div>";
        throwsDescription += "• <strong>" + exceptionType + "</strong>";
        if (thrownWhenDescription) {
          throwsDescription += ' ' + thrownWhenDescription;
        }
        throwsDescription += "</div>";
      }
      if (throwsDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Throws</h4>";
        description += "<div>" + throwsDescription + "</div>";
        description += "</div>";
      }
      return description;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFHQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FIbkIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDRix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsbUJBQUEsR0FBcUIsZ0JBQXJCLENBQUE7O0FBRUE7QUFBQTs7Ozs7T0FGQTs7QUFBQSwrQkFRQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ2YsVUFBQSwwTEFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsQ0FBUixDQUFBO0FBRUEsTUFBQSxJQUFHLENBQUEsS0FBSDtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBQUEsTUFLQSxXQUFBLEdBQWMsRUFMZCxDQUFBO0FBQUEsTUFRQSxjQUFBLEdBQWlCLEVBUmpCLENBQUE7QUFBQSxNQVNBLFVBQUEsR0FBYSxFQVRiLENBQUE7QUFXQSxNQUFBLGdEQUFvQixDQUFFLGFBQXRCO0FBQ0ksUUFBQSxVQUFBLEdBQWEsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQU8sQ0FBQyxJQUEvQixDQURKO09BWEE7QUFjQSxNQUFBLElBQUcsS0FB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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/tooltip/function-provider.coffee
