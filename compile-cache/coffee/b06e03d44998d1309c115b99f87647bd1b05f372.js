(function() {
  var AbstractProvider, ClassProvider, TextEditor, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditor = require('atom').TextEditor;

  proxy = require('./abstract-provider');

  AbstractProvider = require('./abstract-provider');

  module.exports = ClassProvider = (function(_super) {
    __extends(ClassProvider, _super);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    ClassProvider.prototype.hoverEventSelectors = '.entity.inherited-class, .support.namespace, .support.class, .comment-clickable .region';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    ClassProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var classInfo, description, fullClassName, type, _ref;
      fullClassName = this.parser.getFullClassName(editor, term);
      proxy = require('../services/php-proxy.coffee');
      classInfo = proxy.methods(fullClassName);
      if (!classInfo || !classInfo.wasFound) {
        return;
      }
      type = '';
      if (classInfo.isClass) {
        type = (classInfo.isAbstract ? 'abstract ' : '') + 'class';
      } else if (classInfo.isTrait) {
        type = 'trait';
      } else if (classInfo.isInterface) {
        type = 'interface';
      }
      description = '';
      description += "<p><div>";
      description += type + ' ' + '<strong>' + classInfo.shortName + '</strong> &mdash; ' + classInfo["class"];
      description += '</div></p>';
      description += '<div>';
      description += (classInfo.args.descriptions.short ? classInfo.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((_ref = classInfo.args.descriptions.long) != null ? _ref.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + classInfo.args.descriptions.long + "</div>";
        description += "</div>";
      }
      return description;
    };


    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    ClassProvider.prototype.getSelectorFromEvent = function(event) {
      return this.parser.getClassSelectorFromEvent(event);
    };


    /**
     * Gets the correct element to attach the popover to from the retrieved selector.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    ClassProvider.prototype.getPopoverElementFromSelector = function(selector) {
      var array;
      array = this.$(selector).toArray();
      return array[array.length - 1];
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvY2xhc3MtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FIbkIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDRixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNEJBQUEsbUJBQUEsR0FBcUIseUZBQXJCLENBQUE7O0FBRUE7QUFBQTs7Ozs7T0FGQTs7QUFBQSw0QkFRQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ2YsVUFBQSxpREFBQTtBQUFBLE1BQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLElBQWpDLENBQWhCLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FGUixDQUFBO0FBQUEsTUFHQSxTQUFBLEdBQVksS0FBSyxDQUFDLE9BQU4sQ0FBYyxhQUFkLENBSFosQ0FBQTtBQUtBLE1BQUEsSUFBRyxDQUFBLFNBQUEsSUFBaUIsQ0FBQSxTQUFhLENBQUMsUUFBbEM7QUFDSSxjQUFBLENBREo7T0FMQTtBQUFBLE1BUUEsSUFBQSxHQUFPLEVBUlAsQ0FBQTtBQVVBLE1BQUEsSUFBRyxTQUFTLENBQUMsT0FBYjtBQUNJLFFBQUEsSUFBQSxHQUFPLENBQUksU0FBUyxDQUFDLFVBQWIsR0FBNkIsV0FBN0IsR0FBOEMsRUFBL0MsQ0FBQSxHQUFxRCxPQUE1RCxDQURKO09BQUEsTUFHSyxJQUFHLFNBQVMsQ0FBQyxPQUFiO0FBQ0QsUUFBQSxJQUFBLEdBQU8sT0FBUCxDQURDO09BQUEsTUFHQSxJQUFHLFNBQVMsQ0FBQyxXQUFiO0FBQ0QsUUFBQSxJQUFBLEdBQU8sV0FBUCxDQURDO09BaEJMO0FBQUEsTUFvQkEsV0FBQSxHQUFjLEVBcEJkLENBQUE7QUFBQSxNQXNCQSxXQUFBLElBQWUsVUF0QmYsQ0FBQTtBQUFBLE1BdUJBLFdBQUEsSUFBbUIsSUFBQSxHQUFPLEdBQVAsR0FBYSxVQUFiLEdBQTBCLFNBQVMsQ0FBQyxTQUFwQyxHQUFnRCxvQkFBaEQsR0FBdUUsU0FBUyxDQUFDLE9BQUQsQ0F2Qm5HLENBQUE7QUFBQSxNQXdCQSxXQUFBLElBQWUsWUF4QmYsQ0FBQTtBQUFBLE1BMkJBLFdBQUEsSUFBZSxPQTNCZixDQUFBO0FBQUEsTUE0QkEsV0FBQSxJQUFtQixDQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQS9CLEdBQTBDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQXRFLEdBQWlGLDhCQUFsRixDQTVCbkIsQ0FBQTtBQUFBLE1BNkJBLFdBQUEsSUFBZSxRQTdCZixDQUFBO0FBZ0NBLE1BQUEsNkRBQW1DLENBQUUsZ0JBQWxDLEdBQTJDLENBQTlDO0FBQ0ksUUFBQSxXQUFBLElBQWUsdUJBQWYsQ0FBQTtBQUFBLFFBQ0EsV0FBQSxJQUFtQixzQkFEbkIsQ0FBQTtBQUFBLFFBRUEsV0FBQSxJQUFtQixPQUFBLEdBQVUsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBdEMsR0FBNkMsUUFGaEUsQ0FBQTtBQUFBLFFBR0EsV0FBQSxJQUFlLFFBSGYsQ0FESjtPQWhDQTtBQXNDQSxhQUFPLFdBQVAsQ0F2Q2U7SUFBQSxDQVJuQixDQUFBOztBQWlEQTtBQUFBOzs7Ozs7T0FqREE7O0FBQUEsNEJBd0RBLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ2xCLGFBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxLQUFsQyxDQUFQLENBRGtCO0lBQUEsQ0F4RHRCLENBQUE7O0FBMkRBO0FBQUE7Ozs7T0EzREE7O0FBQUEsNEJBZ0VBLDZCQUFBLEdBQStCLFNBQUMsUUFBRCxHQUFBO0FBRzNCLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxDQUFELENBQUcsUUFBSCxDQUFZLENBQUMsT0FBYixDQUFBLENBQVIsQ0FBQTtBQUNBLGFBQU8sS0FBTSxDQUFBLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBZixDQUFiLENBSjJCO0lBQUEsQ0FoRS9CLENBQUE7O3lCQUFBOztLQUR3QixpQkFQNUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/tooltip/class-provider.coffee
