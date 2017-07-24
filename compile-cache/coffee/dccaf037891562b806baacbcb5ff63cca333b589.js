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
      } else if (value.isFunction == null) {
        accessModifier = 'private';
      }
      description += "<p><div>";
      if (value.isFunction != null) {
        description += returnType + ' <strong>' + term + '</strong>' + '(';
      } else {
        description += accessModifier + ' ' + returnType + ' <strong>' + term + '</strong>' + '(';
      }
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
